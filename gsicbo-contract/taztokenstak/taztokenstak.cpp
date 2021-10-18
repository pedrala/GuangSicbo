#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/transaction.hpp>
#include "logger.hpp"

#define TOKEN_SYMBOL "TAZ"
#define TOKEN_SYMBOL_LOWER "taz"
#define ACT_STAKE_TAZ "stake(TAZ)"
#define ACT_UNSTAKE_TAZ "unstake(TAZ)"
#define TOKEN_CONTRACT "taztokenbase"
#define UNSTAKE_TIME_SEC 86400  // 24 hours for unstake
// #define UNSTAKE_TIME_SEC 60  // test value = 1 min

using namespace eosio;

class [[eosio::contract]] taztokenstak : public contract {
  public:
    using contract::contract;

    taztokenstak(name receiver, name code, datastream<const char *> ds) : contract(receiver, code, ds),
      stattable(_self, _self.value), nametable(_self, _self.value) {}
    
    // ----------------------------------------
    // stake
    // ----------------------------------------
    [[eosio::action]]
    void stake(name user, asset quantity) {
      log("stake : user=", std::move(user), ", quantity=", std::move(quantity));

      // check auth
      require_auth(user);

      // check value
      check(quantity.symbol == symbol(TOKEN_SYMBOL, 4), "Wrong token for staking or unstaking");
      check(quantity.is_valid(), "Invalid token transfer");
      check(quantity.amount >= 0, "Quantity must be positive or equal to zero");

      // read user token balance
      accounts accountstable(name(TOKEN_CONTRACT), user.value);
      const auto& token = accountstable.get(quantity.symbol.code().raw());
      const asset token_balance = token.balance;
      log("token_balance=", std::move(token_balance));

      // read userinfo
      int64_t staked;
      int64_t unstaking;
      userinfos usertable(get_self(), user.value);
      auto itr_usertable = usertable.find(name(TOKEN_SYMBOL_LOWER).value);
      if(itr_usertable == usertable.end()) {
        staked = 0;
        unstaking = 0;
        log("userinfo(none)");
      } else {
        staked = itr_usertable->staked;
        unstaking = itr_usertable->unstaking;
        log("userinfo(read) : staked=", std::move(staked), ", unstaking=", std::move(unstaking));
      }

      // restake error when unstaking=0
      check(unstaking!=0 || quantity.amount!=0, "nothing to restake");

      // cancel any existing unstaking
      if(unstaking > 0) cancel_deferred(user.value);

      // check balance 
      check(token_balance.amount - staked - unstaking - quantity.amount >= 0, "Not enough token balance");

      // update stat (token's total staked & unstaking summary table)
      auto itr_stattable = stattable.find(name(TOKEN_SYMBOL_LOWER).value);
      if(itr_stattable == stattable.end()) {
        stattable.emplace(_self, [&](auto &row) {
          row.token_name = name(TOKEN_SYMBOL_LOWER);
          row.total_staked = quantity.amount;
          row.staked_updated = current_time;
          row.total_unstaking = 0;
          log("stat(new) : token_name=", std::move(row.token_name),
            ", total_staked=", std::move(row.total_staked), ", total_unstaking=", std::move(row.total_unstaking));
        });
      } else {
        stattable.modify(itr_stattable, _self, [&](auto &row) {
          row.total_staked = row.total_staked + unstaking + quantity.amount;
          row.staked_updated = current_time;
          row.total_unstaking = row.total_unstaking - unstaking;
          log("stat(updated) : token_name=", std::move(row.token_name),
            ", total_staked=", std::move(row.total_staked), ", total_unstaking=", std::move(row.total_unstaking));
        });
      }

      // update userinfo + namelist (namelist = the table for who are involved in staking, userinfo = personal staking info table)
      if(itr_usertable == usertable.end()) {
        usertable.emplace(user, [&](auto &row) {
          row.token_name = name(TOKEN_SYMBOL_LOWER);
          row.staked = quantity.amount;
          row.staked_updated = current_time;
          row.unstaking = 0;
          row.request_time = 0;
          log("userinfo(new) : token_name=", std::move(row.token_name),
            ", staked=", std::move(row.staked), ", unstaking=", std::move(row.unstaking),
            ", request_time=", std::move(row.request_time));
        });
        nametable.emplace(_self, [&](auto &row) {
          row.user = user;
          log("namelist(new) user=", std::move(row.user));
        });
      } else {
        usertable.modify(itr_usertable, user, [&](auto &row) {
          row.staked = row.staked + unstaking + quantity.amount;
          row.staked_updated = current_time;
          row.unstaking = row.unstaking - unstaking;
          row.request_time = 0;
          log("userinfo(updated) : token_name=", std::move(row.token_name),
            ", staked=", std::move(row.staked), ", unstaking=", std::move(row.unstaking),
            ", request_time=", std::move(row.request_time));
        });
      }
    }

    // ----------------------------------------
    // generate unstaking values
    // ----------------------------------------
    [[eosio::action]]
    void unstake(name user, asset quantity) {
      log("unstake user=", std::move(user), ", quantity=", std::move(quantity));

      // check auth
      require_auth(user);

      // check value
      check(quantity.symbol == symbol(TOKEN_SYMBOL, 4), "Wrong token for staking or unstaking");
      check(quantity.is_valid(), "Invalid token transfer");
      check(quantity.amount > 0, "Quantity must be positive");

      // read userinfo
      int64_t staked;
      int64_t unstaking;
      userinfos usertable(get_self(), user.value);
      auto itr_usertable = usertable.find(name(TOKEN_SYMBOL_LOWER).value);
      check(itr_usertable != usertable.end(), "Not staked yet");
      staked = itr_usertable->staked;
      unstaking = itr_usertable->unstaking;
      log("userinfo(read) : staked=", std::move(staked), ", unstaking=", std::move(unstaking));
      check(staked >= quantity.amount, "Not enough staked quantity");

      // cancel any existing unstaking
      if(unstaking > 0) cancel_deferred(user.value);

      // update stat
      auto itr_stattable = stattable.find(name(TOKEN_SYMBOL_LOWER).value);
      stattable.modify(itr_stattable, _self, [&](auto &row) {
        row.total_staked = row.total_staked - quantity.amount;
        row.staked_updated = current_time;
        row.total_unstaking = row.total_unstaking + quantity.amount;
        log("stat(updated) total_staked=", std::move(row.total_staked),
          ", total_unstaking=", std::move(row.total_unstaking));
      });

      // update userinfo
      usertable.modify(itr_usertable, user, [&](auto &row) {
        row.staked = row.staked - quantity.amount;
        row.staked_updated = current_time;
        row.unstaking = row.unstaking + quantity.amount;
        row.request_time = current_time_point().sec_since_epoch();
        log("userinfo(updated) : token_name=", std::move(row.token_name),
          ", staked=", std::move(row.staked), ", unstaking=", std::move(row.unstaking),
          ", request_time=", std::move(row.request_time));
      });

      // defer release : it will call deferrelease finally in 24h
      call_defer(user);
    }

    // ----------------------------------------
    // release unstaking values
    // ----------------------------------------
    [[eosio::action]]
    void deferrelease(name user) {
      require_auth(get_self());

      // read userinfo
      int64_t staked;
      int64_t unstaking;
      userinfos usertable(get_self(), user.value);
      auto itr_usertable = usertable.find(name(TOKEN_SYMBOL_LOWER).value);
      staked = itr_usertable->staked;
      unstaking = itr_usertable->unstaking;

      // update stat
      auto itr_stat = stattable.find(name(TOKEN_SYMBOL_LOWER).value);
      stattable.modify(itr_stat, _self, [&](auto &row) {
        row.total_unstaking = row.total_unstaking - unstaking;
      });

      // update userinfo + namelist
      if(staked == 0 ) {
        usertable.erase(itr_usertable);
        auto itr_nametable = nametable.find(user.value);
        nametable.erase(itr_nametable);
      } else {
        usertable.modify(itr_usertable, _self, [&](auto &row) {
          row.unstaking = 0;
          row.request_time = 0;
        });
      }
    }

    // ----------------------------------------
    // admin : clean all table : should be commented all the time, only developer can use this
    // ----------------------------------------
    // [[eosio::action]]
    // void clean() {
    //   require_auth(get_self());

    //   auto itr_stattable = stattable.begin();
    //   while(itr_stattable != stattable.end()) {
    //     itr_stattable = stattable.erase(itr_stattable);
    //   }

    //   auto itr_nametable = nametable.begin();
    //   while(itr_nametable != nametable.end()) {
    //     name user = itr_nametable->user;
    //     log("name=", std::move(user));
    //     itr_nametable = nametable.erase(itr_nametable);

    //     userinfos usertable(_self, user.value);
    //     auto itr_usertable = usertable.begin();
    //     while(itr_usertable != usertable.end()) {
    //       itr_usertable = usertable.erase(itr_usertable);
    //     }
    //   }
    // }

    // ----------------------------------------
    // define tables
    // ----------------------------------------

    // token balance
    struct [[eosio::table]] account {
      asset balance;
      uint64_t primary_key() const { return balance.symbol.code().raw(); }
    };

    // token's total staked & unstaking information
    struct [[eosio::table]] stat {
      name token_name;
      int64_t total_staked;
      uint32_t staked_updated;
      int64_t total_unstaking;
      uint64_t primary_key() const { return token_name.value; }
    };

    // list of all users related currently active staked or unstaking tokens
    struct [[eosio::table]] namelist {
      name user;
      uint64_t primary_key() const { return user.value; }
    };

    // specific users staked and unstaking infos
    struct [[eosio::table]] userinfo {
      name token_name;
      int64_t staked;
      uint32_t staked_updated;
      int64_t unstaking;
      uint32_t request_time;
      uint64_t primary_key() const { return token_name.value; }
    };

    typedef multi_index<"accounts"_n, account> accounts;
    typedef multi_index<"stats"_n, stat> stats;
    typedef multi_index<"namelists"_n, namelist> namelists;
    typedef eosio::multi_index<"userinfos"_n, userinfo> userinfos;

  private:
    uint32_t current_time = current_time_point().sec_since_epoch();
    stats stattable;
    namelists nametable;

    // ----------------------------------------
    // wait unstaking time & call deferrelease
    // ----------------------------------------
    void call_defer(name user) {
      transaction out{};
      out.actions.emplace_back(
        permission_level{_self, "active"_n},
        _self,
        "deferrelease"_n,
        std::make_tuple(user)
      );
      out.delay_sec = UNSTAKE_TIME_SEC;
      out.send(user.value, _self, true);
    }
};

EOSIO_DISPATCH(taztokenstak, (stake)(unstake)(deferrelease))
// EOSIO_DISPATCH(taztokenstak, (clean))


#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include "logger.hpp"

#define STORE_CONTRACT "tazchipstore"

#define AMOUNT_SCALE (uint64_t)10000  // scale for converting from real value to contract asset
#define REF_BONUS_RATIO 15  // 0.15% = 15/10000, after scaling with AMOUNT_SCALE, it's just 15

#define TOKEN_CONTRACT "taztokenbase"
#define EOS_CONTRACT "eosio.token"
#define EOS_CODE "EOS"
#define SYMBOL_PRECISION 4
#define REVEALER_CONTRACT "tazgsicborev"

#define MANAGER_ACCOUNT "tazgamingmgr"
#define MEMO_VIP "[Guang Game : VIP Bonus] game_id: "
#define MEMO_MINING "[Guang Game : Mining Bonus] game_id: "
#define MEMO_LEADER "[Guang Game : Leaderboard Bonus] You won the prize #"
#define MEMO_DIVIDEND "[Guang Game : Dividend] Thank you for the support"
#define MEMO_TAIL ", Enjoy 光 Sicbo at https://www.guang.game"


using namespace eosio;

class [[eosio::contract]] tazgamehouse : public contract {
  public:
    using contract::contract;

    tazgamehouse(name receiver, name code, datastream<const char *> ds) : contract(receiver, code, ds) {}

    // store payout
    [[eosio::action]]
    void delivery(name user, asset quantity, std::string memo) {
      log("delivery");
      require_auth(name(STORE_CONTRACT));
      payout_user(user, quantity, memo);
    }

    // every bet has prizes and ref bonus
    [[eosio::action]]
    void payout(uint64_t game_id, name user, std::string ref, std::string bet_token, int bet_total, int prize_total) {
      log("payout");
      require_auth(name(REVEALER_CONTRACT));

      // user prize
      if (prize_total > 0) {
        asset prize_asset = asset(prize_total * AMOUNT_SCALE, symbol(bet_token, SYMBOL_PRECISION));
        std::string prize_memo = "光 Sicbo Prize Payout : gameId = " + std::to_string(game_id);
        payout_user(user, prize_asset, prize_memo);
      }

      // referral bonus
      if (ref != "") {
        if (bet_total > 0) {
          asset bonus_asset = asset(bet_total * REF_BONUS_RATIO, symbol(bet_token, SYMBOL_PRECISION));
          std::string bonus_memo = "光 Sicbo Referral Bonus : gameId = " + std::to_string(game_id);
          payout_user(name(ref), bonus_asset, bonus_memo);
        }
      }
    }

    // vip & mining is calculated by backend and it calls here
    [[eosio::action]]
    void payvipmining(uint64_t game_id, name user, std::string type1, asset asset1, std::string type2, asset asset2) {
      require_auth(name(MANAGER_ACCOUNT));

      // vip payout
      if (type1 == "vip") {
        if (asset1.amount > 0) {
          std::string memo1 = MEMO_VIP + std::to_string(game_id) + MEMO_TAIL;
          log(memo1);
          payout_user(user, asset1, memo1);
        }
      }

      //mining payout
      if (type2 == "mining") {
        if (asset2.amount > 0) {
          std::string memo2 = MEMO_MINING + std::to_string(game_id) + MEMO_TAIL;
          log(memo2);
          payout_user(user, asset2, memo2);
        }
      }
    }

    // leaders will get bonuses every day : for top 3 leaders if exist
    [[eosio::action]]
    void payoutleader(name user1, asset asset1, name user2, asset asset2, name user3, asset asset3) {
      log("payoutleader");
      require_auth(name(MANAGER_ACCOUNT));

      if (asset1.amount > 0) {
        std::string memo1 = MEMO_LEADER + std::string("1") + MEMO_TAIL;
        log(memo1);
        if (asset1.symbol.code().to_string() == EOS_CODE) { payout_eos_user(user1, asset1, memo1); }
        else { payout_user(user1, asset1, memo1); }
      }

      if (asset2.amount > 0) {
        std::string memo2 = MEMO_LEADER + std::string("2") + MEMO_TAIL;
        log(memo2);
        if (asset2.symbol.code().to_string() == EOS_CODE) { payout_eos_user(user2, asset2, memo2); }
        else { payout_user(user2, asset2, memo2); }
      }

      if (asset3.amount > 0) {
        std::string memo3 = MEMO_LEADER + std::string("3") + MEMO_TAIL;
        log(memo3);
        if (asset3.symbol.code().to_string() == EOS_CODE) { payout_eos_user(user3, asset3, memo3); }
        else { payout_user(user3, asset3, memo3); }
      }
    }

    // all TAZ stakers will get bonuses every day : there can be lots of users : user list and amounts are writtend in memo
    [[eosio::action]]
    void paydividend(std::string token, int n, std::string data) {
      log("paydividend");
      require_auth(name(MANAGER_ACCOUNT));

      std::string memo = MEMO_DIVIDEND + std::string("") + MEMO_TAIL;
      log(memo);

      data_temp = data;

      // user names and amounts parsing
      for (int i = 0; i < n; i++) {
        data_part = get_one_data();
        log("data_part=", std::move(data_part));
        name user = name(data_part);

        if (i == n-1) { data_part = data_temp; }
        else { data_part = get_one_data(); }
        log("data_part=", std::move(data_part));

        uint64_t amount = std::stoull(data_part);
        asset ast = asset(amount, symbol(token, 4));
        log("ast=", std::move(ast));

        if (token == EOS_CODE) { payout_eos_user(user, ast, memo); }
        else { payout_user(user, ast, memo); }
      }
    }

    // common transfer action : all tokens exist in house contract so other contracts call this function for payouts
    [[eosio::action]]
    void transfer(name user, asset quantity, std::string memo) {
      log("transfer");
      require_auth(name(MANAGER_ACCOUNT));

      std::string token = quantity.symbol.code().to_string();
      uint64_t amount = quantity.amount;
      if (amount <= 0) eosio_exit(0);

      if (token == EOS_CODE) { payout_eos_user(user, quantity, memo); }
      else { payout_user(user, quantity, memo); }
    }

    // airdrop
    [[eosio::action]]
    void airdrop(std::string data, asset quantity, std::string memo) {
      log("airdrop");
      require_auth(name(MANAGER_ACCOUNT));

      data_temp = data;
      std::string token = quantity.symbol.code().to_string();
      if (token == EOS_CODE) {
        while (data_temp != "") {
          data_part = get_one_data();
          log("data_part=", std::move(data_part));
          name user = name(data_part);
          payout_eos_user(user, quantity, memo);
        }
      } else {
        while (data_temp != "") {
          data_part = get_one_data();
          log("data_part=", std::move(data_part));
          name user = name(data_part);
          payout_user(user, quantity, memo);
        }
      }
    }

  private:
  
    std::string data_temp, data_part;

    // TAZ or TAZ Chip transfer
    void payout_user(name user, asset payout_asset, std::string memo) {
      action(
        permission_level{get_self(), name("active")},
        name(TOKEN_CONTRACT), name("transfer"),
        std::make_tuple(get_self(), user, payout_asset, memo)
      ).send();
    }

    // EOS transfer
    void payout_eos_user(name user, asset payout_asset, std::string memo) {
      action(
        permission_level{get_self(), name("active")},
        name(EOS_CONTRACT), name("transfer"),
        std::make_tuple(get_self(), user, payout_asset, memo)
      ).send();
    }

    // parsing function : it will get one data between two commas
    std::string get_one_data() {
      int idx = data_temp.find(',');
      std::string part;
      if (idx == -1) {
        part = data_temp;
        data_temp = "";
      } else {
        part = data_temp.substr(0, idx);
        data_temp.erase(0, idx + 1);
      }
      return part;
    }
};

#define EOSIO_DISPATCH_EX()
extern "C" {
  void apply(uint64_t receiver, uint64_t code, uint64_t action) {
    if( code == receiver ) {
      if (action == name("delivery").value) {
        execute_action(name(receiver), name(code), &tazgamehouse::delivery);
      } else if (action == name("payout").value) {
        execute_action(name(receiver), name(code), &tazgamehouse::payout);
      } else if (action == name("payvipmining").value) {
        execute_action(name(receiver), name(code), &tazgamehouse::payvipmining);
      } else if (action == name("payoutleader").value) {
        execute_action(name(receiver), name(code), &tazgamehouse::payoutleader);
      } else if (action == name("paydividend").value) {
        execute_action(name(receiver), name(code), &tazgamehouse::paydividend);
      } else if (action == name("transfer").value) {
        execute_action(name(receiver), name(code), &tazgamehouse::transfer);
      } else if (action == name("airdrop").value) {
        execute_action(name(receiver), name(code), &tazgamehouse::airdrop);
      }
    }
  }
}

EOSIO_DISPATCH_EX()


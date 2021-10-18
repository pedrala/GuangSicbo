#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include "logger.hpp"

#define TOKEN_SYMBOL "TAZCHIP"
#define TOKEN_CONTRACT "taztokenbase"
#define REVEALER_CONTRACT "tazgsicborev"
#define HOUSE_CONTRACT "tazgamehouse"
#define ADMIN_MEMO "admin"  // this memo allows token transfer without purchase

#define BASE_VALUE_3 238328  // 62 * 62 * 62
#define BASE_VALUE_2 3844  // 62 * 62
#define BASE_VALUE_1 62
#define BASE_TABLE "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"  // table for base62
#define BET_N_MAX 5  // max 5 bets for 1 game
#define BET_STR_SIZE 5  // 1 for position with base62, 4 for amounts with base62

using namespace eosio;

class [[eosio::contract]] tazgsicbobet : public contract {
  public:
    using contract::contract;

    tazgsicbobet(name receiver, name code, datastream<const char *> ds) : contract(receiver, code, ds) {}
    
    // first, bet transfer info will be reach out here
    [[eosio::action]]
    void receivebet() {
      log("receivebet");
      auto data_transfer = eosio::unpack_action_data<st_transfer>();
      name from = data_transfer.from;
      require_auth(from);
      name to = data_transfer.to;
      asset quantity = data_transfer.quantity;
      memo = data_transfer.memo;
      memo_len = memo.length();
      // log("from:", std::move(from), ", to:", std::move(to), ", quantity:", std::move(quantity), ", memo:", std::move(memo));
      log("from:", std::move(from), ", to:", std::move(to), ", quantity:", std::move(quantity));

      // admin check : if yes, accept any transfer without purchase
      if(memo == ADMIN_MEMO) eosio_exit(0);

      // basic check
      if(memo == "" || from == get_self() || from == name("eosio.ram") || to != get_self() || quantity.symbol != symbol(TOKEN_SYMBOL, 4)
        || !quantity.is_valid() || quantity.amount <= 0) {
        log("not proper bet");
        eosio_exit(0);
      } 

      // game_id parsing
      std::string game_id_str = parse_memo_one();
      uint64_t game_id = std::stoull(game_id_str);
      log("game_id=", std::move(game_id));

      // referrer parsing
      std::string ref = parse_memo_one();
      log("ref=", std::move(ref));

      // bet_info parsing
      bet_info = parse_memo_one();
      log("bet_info=", std::move(bet_info));

      // bet_info string length check & n_max check
      if(bet_info.length() % BET_STR_SIZE != 0) {
        log("wrong bet_info str_size");
        eosio_exit(0);
      }
      int n_bet = bet_info.length() / BET_STR_SIZE;
      log("n_bet=", std::move(n_bet));
      if(n_bet > BET_N_MAX) {
        log("wrong bet_info n_bet");
        eosio_exit(0);
      }

      // bet_info parsing : make it readable format
      std::string bet_info_expand = "[";
      for (int i = 0; i < n_bet ; i++) {
        if (i != 0) bet_info_expand.append(", ");
        bet_info_expand.append("[").append(std::to_string(pick_decode_remove_bet_info_one())).append(", ").append(std::to_string(pick_decode_remove_bet_info_four())).append("]");
      }
      bet_info_expand.append("]");
      log("bet_info_expand=", std::move(bet_info_expand));

      // hash parsing
      std::string hash = parse_memo_one();
      log("hash=", std::move(hash));

      // time_expire parsing
      std::string time_expire_str = parse_memo_one();
      uint32_t time_expire = std::stoi(time_expire_str);
      uint32_t time_now = current_time_point().sec_since_epoch();
      check(time_now <= time_expire, "bet time expired");
      log("time_expire=", std::move(time_expire));

      // signature parsing
      std::string sig = parse_memo_last();
      log("sig=", std::move(sig));

      // call placebet (for the record) & this will update current balance
      action(
        permission_level{get_self(),"active"_n},
        get_self(),
        "placebet"_n,
        std::make_tuple(game_id, from, ref, bet_info_expand, quantity, hash, time_expire, sig)
      ).send();
    }

    [[eosio::action]]
    void placebet(uint64_t game_id, name user, std::string ref, std::string bet_info,
      asset quantity, std::string hash, uint32_t time_expire, std::string sig) {

      // transfer to house : all incomming tokens will be sent to house
      std::string transfer_memo = "game_id: ";
      transfer_memo.append(std::to_string(game_id)).append(", user: ").append(user.to_string());
      log("transfer_memo=", std::move(transfer_memo));
      transfer_to_house(quantity, transfer_memo);

      // referrer check : if something wrong, remove ref (no ref bonus)
      int ref_len = ref.length();
      for(int i=0; i<ref_len; i++) {
        int c = ref[i];
        if(c!=46 && (c<49 || c>53) && (c<97 || c>122)) {
          ref = "";
          break;
        }
      }
      if(!is_account(name(ref)) || name(ref) == user || name(ref) == get_self()) ref = "";
      log("adjusted ref=", std::move(ref));

      // id table : insert or update id table with game_id, this will write when it was handled last time
      ids idtable(get_self(), get_self().value);
      auto itr_idtable = idtable.find(game_id);
      if (itr_idtable == idtable.end()) {
        idtable.emplace(get_self(), [&](auto &row) {
          row.game_id = game_id;
          row.updated = current_time_point().sec_since_epoch();
          log("id table(new) : [game_id=", std::move(row.game_id), ", updated=", std::move(row.updated), "]");
        });
      } else {
        idtable.modify(itr_idtable, get_self(), [&]( auto& row ) {
          row.updated = current_time_point().sec_since_epoch();
          log("id table(update) : [game_id=", std::move(row.game_id), ", updated=", std::move(row.updated), "]");
        });
      }

      // game table : insert game bet info, if it exists already, abort the trx cause it is generally admin error or already handled
      games gametable(get_self(), game_id);
      auto itr_gametable = gametable.find(user.value);
      if (itr_gametable == gametable.end()) {
        gametable.emplace(get_self(), [&](auto &row) {
          row.user = user;
          row.ref = ref;
          row.bet_token = quantity.symbol.code().to_string();
          row.bet_info = bet_info;
          row.bet_time = current_time_point().sec_since_epoch();
          log("game table : [user=", std::move(row.user), ", ref=", std::move(row.ref), ", bet_token=", std::move(row.bet_token), ", bet_info=", std::move(row.bet_info), ", bet_time=", std::move(row.bet_time),"]");
        });
      } else {
        log("game table already exists");
        check(false, "game table already exists"); // abort trx and return token
      }
    }

    // revealer will call rmtable after revealing, this will delete game table first,and if there's no game table, it will delete id table
    [[eosio::action]]
    void rmtable(uint64_t game_id, name user) {
      require_auth(name(REVEALER_CONTRACT));

      // game table
      games gametable(get_self(), game_id);
      auto itr_gametable = gametable.find(user.value);
      if (itr_gametable == gametable.end()) {
        log("no game table");
      } else {
        gametable.erase(itr_gametable);
        log("deleted game table");
      }

      // id table : will be deleted after deleting all game tables
      if(gametable.begin() == gametable.end()) {  // no more game table
        ids idtable(get_self(), get_self().value);
        auto itr_idtable = idtable.find(game_id);
        if (itr_idtable == idtable.end()) {
          log("no id table");
        } else {
          idtable.erase(itr_idtable);
          log("deleted id table");
        }
      }
    }

    // transfer asset structure
    struct st_transfer {
      name from;
      name to;
      asset quantity;
      std::string memo;
    };

    // game_id table : game_id(PK), updated
    struct [[eosio::table]] id {
      uint64_t game_id;
      uint32_t updated;
      uint64_t primary_key() const {return game_id;}
    };

    // game bet info table  : user(PK), ref, bet_token, bet_info
    struct [[eosio::table]] game {
      name user;
      std::string ref;
      std::string bet_token;
      std::string bet_info;
      uint32_t bet_time;
      uint64_t primary_key() const {return user.value;}
    };

    typedef multi_index<"ids"_n, id> ids;
    typedef multi_index<"games"_n, game> games;

  private:
    std::string base_table = BASE_TABLE;
    std::string memo;
    int memo_len;
    std::string bet_info;

    // transfer tokens to house
    void transfer_to_house(asset quantity, std::string transfer_memo) {
      action(
        permission_level{get_self(), name("active")},
        name(TOKEN_CONTRACT), name("transfer"),
        std::make_tuple(get_self(), name(HOUSE_CONTRACT), quantity, transfer_memo)
      ).send();
    }

    // get one between dashes(-)
    std::string parse_memo_one() {
      int dash_idx = memo.find("-");
      if(dash_idx==-1 || dash_idx==0 || dash_idx==(memo_len-1)) {
        log("wrong parameters");
        eosio_exit(0);
      }
      std::string one = memo.substr(0, dash_idx);
      memo = memo.erase(0, dash_idx + 1);
      memo_len = memo_len - dash_idx - 1;
      return one;
    }

    std::string parse_memo_last() {
      int dash_idx = memo.find("-");
      if(dash_idx != -1) {
        log("wrong parameters");
        eosio_exit(0);
      }
      return memo;
    }

    // base62 decoding
    int value_base(char c) {
      int idx = base_table.find(c);
      if(idx==-1) {
        log("wrong encoding");
        eosio_exit(0);
      }
      return idx;
    }

    // parse position from one character
    int pick_decode_remove_bet_info_one() {
      char one = bet_info[0];
      bet_info.erase(0, 1);
      return value_base(one);
    }

    // parse amounts from four characters
    int pick_decode_remove_bet_info_four() {
      int v3 = value_base(bet_info[0]);
      int v2 = value_base(bet_info[1]);
      int v1 = value_base(bet_info[2]);
      int v0 = value_base(bet_info[3]);
      bet_info.erase(0, 4);
      return BASE_VALUE_3 * v3 + BASE_VALUE_2 * v2 + BASE_VALUE_1 * v1 + v0;
    }
};

#define EOSIO_DISPATCH_EX()
extern "C" {
  void apply(uint64_t receiver, uint64_t code, uint64_t action) {
    if (code == name(TOKEN_CONTRACT).value) {
      if (action == name("transfer").value ) {
        execute_action(name(receiver), name(code), &tazgsicbobet::receivebet);
      }
    } else if(code == receiver) {
      if (action == name("placebet").value ) {
        execute_action(name(receiver), name(code), &tazgsicbobet::placebet);
      } else if (action == name("rmtable").value ) {
        execute_action(name(receiver), name(code), &tazgsicbobet::rmtable);
      } 
    }
  }
}

EOSIO_DISPATCH_EX()


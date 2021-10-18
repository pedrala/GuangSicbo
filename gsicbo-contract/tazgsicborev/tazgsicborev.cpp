#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/transaction.hpp>
#include <eosio/crypto.hpp>
#include "logger.hpp"

#define TAZGSICBOBET "tazgsicbobet"
#define TAZGAMEHOUSE "tazgamehouse"
#define TAZGAMINGMGR "tazgamingmgr"

#define SEED_TAIL "cards"
#define RANDOM_MAX 380
#define NUM_CARD_MINUS_ONE 19 // 20 - 1

using namespace eosio;

class [[eosio::contract]] tazgsicborev : public contract {
  public:
    using contract::contract;

    tazgsicborev(name receiver, name code, datastream<const char *> ds) : contract(receiver, code, ds) {}

    // if bet info is wrong, it will reject the current bet and remove game table
    [[eosio::action]]
    void reject(uint64_t game_id, name user, std::string bet_info, std::string hash, uint32_t time_expire, std::string sig, std::string reason) {
      log("reject");
      require_auth(name(TAZGAMINGMGR));
      action(
        permission_level{get_self(), name("active")},
        name(TAZGSICBOBET), name("rmtable"),
        std::make_tuple(game_id, user)
      ).send();
    }
    
    // if bet info is right, reveals random seed and calculate prizes
    [[eosio::action]]
    void reveal(uint64_t game_id, name user, std::string seed) {
      log("reveal");
      require_auth(name(TAZGAMINGMGR));

      std::string ref;
      std::string bet_token;

      // game table existence check
      games gametable(name(TAZGSICBOBET), game_id);
      auto itr_gametable = gametable.find(user.value);
      if (itr_gametable == gametable.end()) {
        log("error : no game table");
        eosio_exit(0);
      } else {
        ref = itr_gametable->ref;
        bet_token = itr_gametable->bet_token;
        bet_info = itr_gametable->bet_info;
        log("read table : user=", std::move(user), ", ref=", std::move(ref), ", bet_token=", std::move(bet_token), ", bet_info=", std::move(bet_info));
      }

      // reveal cards
      seed = seed + SEED_TAIL;
      log("seed=", std::move(seed));
      const char *seed_c = seed.c_str();
      checksum256 hash256 = sha256(seed_c, seed.length());
      uint32_t hash32bit = (uint32_t) (hash256.get_array()[0] >> 96); // 32 bit
      int rand380 = hash32bit % RANDOM_MAX;
      int card1 = rand380 / NUM_CARD_MINUS_ONE; // 0 ~ 19
      int card2 = rand380 % NUM_CARD_MINUS_ONE; // 0 ~ 18
      if (card2 >= card1) card2++; // skip card1 and recount
      std::string cards = "[" + std::to_string(card1) + ", " + std::to_string(card2) + "]";
      log("cards=", std::move(cards));

      // calc card results
      calc_basic_gut(card1, card2);
      calc_even_odd();
      calc_small_big();
      calc_any_guang(card1, card2);
      calc_number_exist();
      calc_pair_number();

      // calc win/lose
      bool first_bet  = true;
      int bet_total = 0;
      int prize_total = 0;
      std::string bet_result = "[";
      bet_info = bet_info.erase(0, 1);  // remove the first '['
      while(pick_one_bet()) {
        int prize = calc_win_prize(bet_position, bet_amount);
        bet_total += bet_amount;
        prize_total += prize;
        log("position=", std::move(bet_position), ", amount=", std::move(bet_amount), ", prize=", std::move(prize));

        if(!first_bet) {
          bet_result.append(", ");
        }
        first_bet = false;
        bet_result.append("[").append(std::to_string(bet_position)).append(", ").append(std::to_string(bet_amount)).append(", ").append(std::to_string(prize)).append("]");
      }
      bet_result.append("]");
      log("bet_total=", std::move(bet_total), ", prize_total=", std::move(prize_total));

      // inlinr call : send results for record
      uint32_t reveal_time = current_time_point().sec_since_epoch();
      action(
        permission_level{get_self(),"active"_n},
        get_self(),
        "results"_n,
        std::make_tuple(game_id, name(user), ref, cards, bet_token, bet_result, bet_total, prize_total, reveal_time)
      ).send();

      // rmtable : will delete game table
      action(
        permission_level{get_self(),"active"_n},
        name(TAZGSICBOBET),
        "rmtable"_n,
        std::make_tuple(game_id, name(user))
      ).send();
    }

    // (1) for record, (2) will call house_pay (defer)
    [[eosio::action]]
    void results(uint64_t game_id, name user, std::string ref, std::string cards, std::string bet_token, std::string bet_info, int bet_total, int prize_total, uint32_t reveal_time) {
      log("results");
      log("game_id=", std::move(game_id), ", user=", std::move(user), ", ref=", std::move(ref), ", cards=", std::move(cards), ", bet_token=", std::move(bet_token), ", bet_info=", std::move(bet_info), ", bet_total=", std::move(bet_total), ", prize_total=", std::move(prize_total), ", reveal_time=", std::move(reveal_time));
      require_auth(get_self());

      // defer : house to pay (prizes & ref bonus)
      transaction tx;
      tx.actions.emplace_back(
        permission_level{get_self(), "active"_n},
        name(TAZGAMEHOUSE),
        "payout"_n,
        std::make_tuple(game_id, user, ref, bet_token, bet_total, prize_total)
      );
      tx.delay_sec = 0;
      tx.send(user.value, get_self());
    }

    // game table : user(PK), ref, bet_token, bet_info
    struct [[eosio::table]] game {
      name user;
      std::string ref;
      std::string bet_token;
      std::string bet_info;
      uint64_t primary_key() const {return user.value;}
    };

    typedef multi_index<"games"_n, game> games;

  private:
    std::string bet_info;
    int bet_position, bet_amount;

    int gut1, gut2;
    bool is_odd;  // regardless number_pair
    bool is_big;  // regardless number_pair
    bool is_any_guang;
    bool number_exist_array[11];  // dummy 0 & 1~10
    int number_pair_value;

    // pick one bet info (position, amount)
    bool pick_one_bet() {
      int idx1 = bet_info.find("[");
      int idx2 = bet_info.find("]");
      if(idx1==-1) return false;
      
      std::string str = bet_info.substr(idx1 + 1, idx2 - idx1 -1);
      int idx3 = str.find(",");
      bet_position = std::stoi(str.substr(0, idx3));
      bet_amount = std::stoi(str.substr(idx3 + 1, idx2 - idx1 - idx3 - 2));
      bet_info = bet_info.erase(0, idx2 + 1);
      return true;
    }

    // calculate gut
    void calc_basic_gut(int card1, int card2) {
      gut1 = card1/2 + 1;  // 1 ~ 10
      gut2 = card2/2 + 1;
    }

    void calc_even_odd() {
      is_odd = (gut1 + gut2) % 2 == 0 ? false : true;
    }
      
    void calc_small_big() {
      is_big = (gut1 + gut2) % 10 < 5 ? false : true;
    }

    void calc_any_guang(int card1, int card2) {
      is_any_guang = false;
      if (card1 == 00 || card1 == 04 || card1 == 14 || card1 == 18
        || card2 == 00 || card2 == 04 || card2 == 14 || card2 == 18) {
        is_any_guang = true;
      }
    }

    void calc_number_exist() {
      for (int i = 0 ; i < 11 ; i++) {
        number_exist_array[i] = false;
      }
      number_exist_array[gut1] = true;
      number_exist_array[gut2] = true;
    }

    // if number pair, it has the number of pair, if not, then -1
    void calc_pair_number() {
      number_pair_value = -1;
      if (gut1 == gut2) number_pair_value = gut1;
    }

    // calculated prize from position and status(small, big, odd, even, ...)
    int calc_win_prize(int pos, int amt) {  // values are simple so that hard coding
      int win_prize = 0;

      if (pos == 0) {
        if (!is_big && number_pair_value < 0) {
          win_prize = amt * 2;
        }
      } else if (pos == 1) {
        if (is_any_guang) {
          win_prize = (int)((double)amt * 2.5);
        }
      } else if (pos == 2) {
        if (is_big && number_pair_value < 0) {
          win_prize = amt * 2;
        }
      } else if (pos == 3) {
        if (is_odd && number_pair_value < 0) {
          win_prize = amt * 2;
        }
      } else if (pos == 4) {
        if (!is_odd && number_pair_value < 0) {
          win_prize = amt * 2;
        }
      } else if (pos >= 5 && pos <=14 ) {
        if ((pos - 4) == number_pair_value) {
          win_prize = amt * 151;
        }
      } else if (pos == 15) {
        if (number_pair_value >= 0) {
          win_prize = amt * 16;
        }
      } else if (pos >= 16 && pos <= 25) {
        if (number_exist_array[pos - 15]) {
          win_prize = amt * 5;
        }
      }

      return win_prize;
    }
};

#define EOSIO_DISPATCH_EX()
extern "C" {
  void apply(uint64_t receiver, uint64_t code, uint64_t action) {
    if( code == receiver ) {
      if (action == name("reject").value) {
        execute_action(name(receiver), name(code), &tazgsicborev::reject);
      } else if (action == name("reveal").value) {
        execute_action(name(receiver), name(code), &tazgsicborev::reveal);
      } else if (action == name("results").value) {
        execute_action(name(receiver), name(code), &tazgsicborev::results);
      }
    }
  }
}

EOSIO_DISPATCH_EX()


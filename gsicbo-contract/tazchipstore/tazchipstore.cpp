#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include "logger.hpp"

#define TAZCHIP_SYMBOL "TAZCHIP"
#define HOUSE_CONTRACT "tazgamehouse"
#define ADMIN_MEMO "admin"  // this memo allows token transfer without purchase
#define PAYOUT_MEMO "Guang Game Store : Thank you for the purchase. Enjoy 光 Sicbo at https://www.guang.game"

#define EOS 1
#define EOS_SYMBOL "EOS"
#define EOS_TOKEN_CONTRACT "eosio.token"
#define AMOUNT_EOS_MIN 1000  // 0.1000 EOS
#define RATE_EOS 1000  // 1 EOS = 1000 TAZ Chip

#define TAZ 2
#define TAZ_SYMBOL "TAZ"
#define TAZ_TOKEN_CONTRACT "taztokenbase"
#define AMOUNT_TAZ_MIN 100000  // 10.0000 TAZ = 100.0000 TAZ Chip
#define RATE_TAZ 10  // 1 TAZ = 10 TAZ Chip

using namespace eosio;

class [[eosio::contract]] tazchipstore : public contract {
  public:
    using contract::contract;

    tazchipstore(name receiver, name code, datastream<const char *> ds) : contract(receiver, code, ds) {}

    // from eosio.token::transfer
    void purchaseweos() {
      log("receive eos");
      purchasewith(EOS);
    }

    // from taztokenbase::transfer
    void purchasewtaz() {
      log("receive taz");
      purchasewith(TAZ);
    }

    [[eosio::action]]
    void store(name user, asset in_asset, asset out_asset) {
      // toss to house : all incomming tokens will be sent to house
      std::string nostring = "";
      std::string token_symbol = in_asset.symbol.code().to_string();
      if (token_symbol == EOS_SYMBOL) {
        action(
          permission_level{get_self(), name("active")},
          name(EOS_TOKEN_CONTRACT), name("transfer"),
          std::make_tuple(get_self(), name(HOUSE_CONTRACT), in_asset, nostring)
        ).send();
      } else if (token_symbol == TAZ_SYMBOL) {
        action(
          permission_level{get_self(), name("active")},
          name(TAZ_TOKEN_CONTRACT), name("transfer"),
          std::make_tuple(get_self(), name(HOUSE_CONTRACT), in_asset, nostring)
        ).send();
      }
    }

    // trasfer structure
    struct st_transfer {
      name from;
      name to;
      asset quantity;
      std::string memo;
    };

  private:

    void purchasewith(int token) {
      log("purchasewith in");

      st_transfer data_transfer = eosio::unpack_action_data<st_transfer>();
      name from = data_transfer.from;
      require_auth(from);
      name to = data_transfer.to;
      asset quantity = data_transfer.quantity;
      std::string transfer_memo = data_transfer.memo;
      log("from:", std::move(from), ", to:", std::move(to), ", quantity:", std::move(quantity), ", memo:", std::move(transfer_memo));

      // admin check : if yes, accept any transfer without purchase
      if(transfer_memo == ADMIN_MEMO) eosio_exit(0);

      // token check
      if(token == EOS && quantity.symbol != symbol(EOS_SYMBOL, 4)) eosio_exit(0);
      if(token == TAZ && quantity.symbol != symbol(TAZ_SYMBOL, 4)) eosio_exit(0);

      // basic check
      if(from == get_self() || from == name("eosio.ram") || to != get_self()
        || !quantity.is_valid() || quantity.amount <= 0) eosio_exit(0);

      // amount check
      if(token == EOS) {
        if(quantity.amount < AMOUNT_EOS_MIN) eosio_exit(0);
      } else if(token == TAZ) {
        if(quantity.amount < AMOUNT_TAZ_MIN) eosio_exit(0);
      }

      // calc amount
      uint64_t token_amount;
      if (token == EOS) {
        token_amount = quantity.amount * RATE_EOS;
      } else if (token == TAZ) {
        token_amount = quantity.amount * RATE_TAZ;
      }
      asset token_asset = asset(token_amount, symbol(TAZCHIP_SYMBOL, 4));
      log("token=", std::move(token_asset));

      // inline call transfer : house will deliver TAZ Chip to user
      std::string memo = PAYOUT_MEMO;
      action(
        permission_level{get_self(), name("active")},
        name(HOUSE_CONTRACT), name("delivery"),
        std::make_tuple(from, token_asset, memo)
      ).send();

      // inline call for house : this will update current balance
      action(
        permission_level{get_self(), name("active")},
        get_self(), name("store"),
        std::make_tuple(from, quantity, token_asset)
      ).send();
    }
};

#define EOSIO_DISPATCH_EX()
extern "C" {
  void apply(uint64_t receiver, uint64_t code, uint64_t action) {
    if (code == name(EOS_TOKEN_CONTRACT).value) {
      if (action == name("transfer").value ) {
        execute_action(name(receiver), name(code), &tazchipstore::purchaseweos);
      }
    } else if (code == name(TAZ_TOKEN_CONTRACT).value) {
      if (action == name("transfer").value ) {
        execute_action(name(receiver), name(code), &tazchipstore::purchasewtaz);
      }
    } else if (code == receiver) {
      if (action == name("store").value ) {
        execute_action(name(receiver), name(code), &tazchipstore::store);
      }
    }
  }
}

EOSIO_DISPATCH_EX()



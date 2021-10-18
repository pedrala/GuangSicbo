'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const C = {
  LOCAL_CHAIN_RPC_GROUP: ["https://nodeos.guang.game"],
  MAIN_CHAIN_RPC_GROUP: ["https://nodes.get-scatter.com", "https://rpc.eosys.io", "https://mainnet.eoscannon.io", "https://api-mainnet.eosgravity.com", "https://api.eoseoul.io", "https://api.eoslaomao.com", "https://api.helloeos.com.cn", "https://api.bitmars.one", "https://api.jeda.one", "https://api.eosbeijing.one"],
  CRAWLER_N_READ_BLOCK_MAX: 10,
  EOSIOTOKEN: 'eosio.token',
  TAZTOKENBASE: 'taztokenbase',
  TAZTOKENSTAK: 'taztokenstak',
  TAZGSICBOBET: 'tazgsicbobet',
  TAZGSICBOREV: 'tazgsicborev',
  TAZGAMEHOUSE: 'tazgamehouse',
  TAZCHIPSTORE: 'tazchipstore',
  TAZGAMINGMGR: 'tazgamingmgr',
  TOKEN_EOS: 'EOS',
  TOKEN_TAZ: 'TAZ',
  TOKEN_TAZCHIP: 'TAZCHIP',
  TOKEN_STAKING: 'taz',
  // lowercase
  TOKEN_VIP: 'TAZCHIP',
  TOKEN_MINING: 'TAZ',
  CONTRACT_TO_DB_SCALE: 0.0001,
  BUY_AMOUNT_EOS_MIN: 0.1,
  BUY_AMOUNT_TAZ_MIN: 10,
  EOS_TAZCHIP_RATIO: 1000,
  TAZ_TAZCHIP_RATIO: 10,
  BET_POSITION_MIN: 0,
  BET_POSITION_MAX: 25,
  BET_TOTAL_AMOUNT_MIN: 100,
  // 0.1K
  BET_TOTAL_AMOUNT_MAX: 50000000,
  // 50M
  BET_EACH_AMOUNT_MIN: 100,
  // 0.1K
  BET_EACH_AMOUNT_MAX: 50000000,
  // 50M
  BET_REJECT_REASON: "wrong bet info",
  VIP_RETURN_RATIO: [0, 0.0002, 0.0003, 0.0004, 0.0005, 0.0006, 0.0007, 0.0009, 0.0011, 0.0013, 0.0015],
  VIP_LEVEL_REQUIREMENT: [0, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1000000000, 2500000000, 7500000000, 15000000000],
  // TAZ Chip
  TYPE_VIP: 'vip',
  MINING_RATIO: [0.020, 0.018, 0.016, 0.014, 0.012, 0.010, 0.008, 0.006, 0.004, 0.002, 0],
  // stage 1 ~ 11
  MINING_STAGE_REQUIREMENT: [0, 50000000, 100000000, 150000000, 200000000, 250000000, 300000000, 350000000, 400000000, 450000000, 500000000],
  TYPE_MINING: 'mining'
};
var _default = C;
exports.default = _default;
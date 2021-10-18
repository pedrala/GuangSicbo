'use strict'

const C = {
  LOCAL_CHAIN_RPC_GROUP: ["https://nodeos.guang.game"],  // read blocks here in test mode
  MAIN_CHAIN_RPC_GROUP: [  // read blocks from one of here randomly in real mode
    "https://api.redpacketeos.com",
    "https://api.eoseoul.io",
   // "https://mainnet.meet.one",
    "https://api.eos.wiki",
    "https://mainnet.eosio.sg",
    "https://api.bitmars.one",
    "https://mainnet1.eoscochain.io",
    "https://api.eosbeijing.one",
    "https://eos-api.inbex.com",
    "https://eos-mainnet.ecoboost.app",
    "https://api1.eosasia.one",
    "https://eos.newdex.one",
    "https://api.eos.wiki",
    "https://pubnode.eosrapid.com",
    "https://eos.eoscafeblock.com",
    "https://publicapi-mainnet.eosauthority.com",
    "https://api.eossweden.org",
    "https://api.eosn.io",
    "https://api.eos.education",
    "https://api.eosargentina.io",
    "https://api.cypherglass.com",
    "https://api.eostitan.com",
    "https://eu.eosdac.io",
    "https://bp.cryptolions.io",
    "https://eos.greymass.com",
    "https://api-emlg.eosnairobi.io:8089",
    "https://node1.eosphere.io",
    "https://eos-mainnet.eosblocksmith.io:443",
    "https://api.tokenika.io",
    "https://mainnet.eosamsterdam.net",
    "https://mainnet.get-scatter.com",
    "https://api.eosdetroit.io",
    "https://eospublic.chainrift.com"
  ],

  CRAWLER_N_READ_BLOCK_MAX: 30,  // read 30 blocks at once
  BLOCK_NUMBER_BUFFER: 0,  // some BP is slow, so we may use newHead = oldHead - buffer, 0 means disabled
  MAX_RETRY: 3,  // max number of retry for sending action

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
  TOKEN_STAKING: 'taz',  // lowercase
  TOKEN_VIP: 'TAZCHIP',
  TOKEN_MINING: 'TAZ',

  CONTRACT_TO_DB_SCALE: 0.0001,

  BUY_AMOUNT_EOS_MIN: 0.1,  // min amount for purchase = 0.1 EOS
  BUY_AMOUNT_TAZ_MIN: 10,
  EOS_TAZCHIP_RATIO: 1000,  // tazchip = 1000 * eos
  TAZ_TAZCHIP_RATIO: 10,

  BET_POSITION_MIN: 0,  // 26 bet positions = 0 ~ 25
  BET_POSITION_MAX: 25,
  BET_TOTAL_AMOUNT_MIN: 100,  // 0.1K
  BET_TOTAL_AMOUNT_MAX: 50000000,  // 50M
  BET_EACH_AMOUNT_MIN: 100,  // 0.1K
  BET_EACH_AMOUNT_MAX: 50000000,  // 50M
  BET_REJECT_REASON: "wrong bet info",
  
  VIP_RETURN_RATIO:      [0,  0.0002,  0.0003,   0.0004,   0.0005,    0.0006,    0.0007,     0.0009,     0.0011,     0.0013,      0.0015],
  VIP_LEVEL_REQUIREMENT: [0, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1000000000, 2500000000, 7500000000, 15000000000],  // TAZ Chip
  TYPE_VIP: 'vip',
  MINING_RATIO:             [0.0020,   0.0018,    0.0016,    0.0014,    0.0012,    0.0010,    0.0008,    0.0006,    0.0004,    0.0002,         0],  // stage 1 ~ 11
  MINING_STAGE_REQUIREMENT: [     0, 50000000, 100000000, 150000000, 200000000, 250000000, 300000000, 350000000, 400000000, 450000000, 500000000],
  TYPE_MINING: 'mining',
}

export default C;
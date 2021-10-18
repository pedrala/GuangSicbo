'use strict';

var _logger = _interopRequireDefault(require("./logger"));

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _eosjs = require("eosjs");

var _eosjsEcc = _interopRequireDefault(require("eosjs-ecc"));

var _eosjsJssig = require("eosjs/dist/eosjs-jssig");

var _util = require("util");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _db = _interopRequireDefault(require("./db"));

var _games = _interopRequireDefault(require("./models/games"));

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base62 map
 */
const tblBase62 = {
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "a": 10,
  "b": 11,
  "c": 12,
  "d": 13,
  "e": 14,
  "f": 15,
  "g": 16,
  "h": 17,
  "i": 18,
  "j": 19,
  "k": 20,
  "l": 21,
  "m": 22,
  "n": 23,
  "o": 24,
  "p": 25,
  "q": 26,
  "r": 27,
  "s": 28,
  "t": 29,
  "u": 30,
  "v": 31,
  "w": 32,
  "x": 33,
  "y": 34,
  "z": 35,
  "A": 36,
  "B": 37,
  "C": 38,
  "D": 39,
  "E": 40,
  "F": 41,
  "G": 42,
  "H": 43,
  "I": 44,
  "J": 45,
  "K": 46,
  "L": 47,
  "M": 48,
  "N": 49,
  "O": 50,
  "P": 51,
  "Q": 52,
  "R": 53,
  "S": 54,
  "T": 55,
  "U": 56,
  "V": 57,
  "W": 58,
  "X": 59,
  "Y": 60,
  "Z": 61
  /**
   * Convert 10 base number from base62 string.
   * @param {string} b62 
   */

};

const base10 = b62 => {
  let b10 = 0;

  for (let i = 0; i < b62.length; i++) {
    let base = Math.pow(62, b62.length - (i + 1));
    b10 += tblBase62[b62[i]] * base;
  }

  return b10;
};
/**
 * Initial eosjs
 */


const signatureProvider = new _eosjsJssig.JsSignatureProvider([process.env.MGR_PK]);
const rpc = new _eosjs.JsonRpc(process.env.CHAIN_RPC, {
  fetch: _nodeFetch.default
});
const api = new _eosjs.Api({
  rpc,
  signatureProvider,
  textDecoder: new _util.TextDecoder(),
  textEncoder: new _util.TextEncoder()
});
/**
 * 
 * @param {number} blockNum 
 * @param {number} blockTime 
 * @param {string} trxId 
 * @param {string} uid
 * @param {string} strQuantity 
 * @param {string} strMemo 
 */

const refineAction = (blockNum, blockTime, trxId, uid, strQuantity, strMemo) => {
  if (!strMemo) {
    throw new Error(`Invalid game info : ${strMemo}`);
  }

  const memo = strMemo.split('-');

  if (!memo || memo.length != 6) {
    throw new Error(`Invalid game info : ${JSON.stringify(strMemo)}`);
  }

  const quantity = strQuantity.split(' ');

  if (!quantity || quantity.length != 2) {
    throw new Error(`Invalid game info : ${JSON.stringify(strQuantity)}`);
  }

  const data = {
    game: {},
    bet: {},
    reveal: {}
  };
  data.game.gid = Number.parseInt(memo[0]);
  data.game.uid = uid;
  data.game.ref = memo[1];
  data.game.token = quantity[1];
  data.game.bet_total = Number.parseFloat(quantity[0]);
  data.game.bets = [];

  for (let i = 0; i < memo[2].length; i += 5) {
    data.game.bets.push({
      position: base10(memo[2].substring(i, i + 1)),
      amount: base10(memo[2].substring(i + 1, i + 5))
    });
  }

  data.game.hash = memo[3];
  data.game.expired = Number.parseInt(memo[4]);
  data.game.sig = memo[5];
  data.bet.block_num = blockNum;
  data.bet.block_time = blockTime;
  data.bet.trx_id = trxId;
  return data;
};

const getBetInfoFromTable = data => {
  return new _rxjs.Observable(observer => {
    rpc.get_table_rows({
      "code": _config.default.TAZGSICBOBET,
      "table": "games",
      "scope": `${data.game.gid}`,
      "index_position": "first",
      "key_type": "i64",
      "lower_bound": data.game.uid,
      "upper_bound": data.game.uid,
      "json": true,
      "limit": 10
    }).then(resp => {
      observer.next(resp);
      observer.complete();
    }).catch(error => {
      observer.error(error);
    });
  });
};

const validateGame = (db, data) => {
  _logger.default.d('===================== validateGame ======================');

  _logger.default.d(data);

  return (0, _rxjs.combineLatest)(_games.default.get(db, data.game.gid, data.game.uid), getBetInfoFromTable(data)).pipe( // o: original(db), c: chain(cleos)
  (0, _operators.map)(([ogame, cgame]) => {
    _logger.default.d('-------------- data from trx read ---------------------------------');

    _logger.default.d(data);

    _logger.default.d('-------------- ogame from db written --------------------------------');

    _logger.default.d(ogame);

    _logger.default.d('-------------- cgame from chain with cleos -------------------------------');

    _logger.default.d(cgame);

    if (ogame.length < 1) {
      throw new Error(`Could not found game on offchain: ${JSON.stringify(data)}`);
    }

    if (cgame.rows.length < 1) {
      throw new Error(`Could not found game on chain: ${JSON.stringify(data)}`);
    } // data  1) default:
    //       2) check: hash, sig, token, amount (range), bet_info (position range/duplicate, amount range/step/sum)
    // ogame 1) default: id, uid
    //       2) check: status
    //       3) no need to check: expired
    //       4) save: seed
    // cgame 1) default: id, uid
    //       2) check: -
    //       3) no need to check: ref
    //       3) save: ref


    const hash = _eosjsEcc.default.sha256(ogame[0].seed);

    const sig = _eosjsEcc.default.sign(`${hash}${ogame[0].id}${ogame[0].uid}${ogame[0].expired}`, process.env.MGR_PK); // log.d("hash = " + hash);
    // log.d("sig = " + sig);


    if (sig !== data.game.sig || hash !== data.game.hash) {
      throw new Error(`Invalid game : wrong sig or hash`);
    }

    if (data.game.token != _config.default.TOKEN_TAZCHIP) {
      throw new Error(`Invalid game : not supported token`);
    }

    if (data.game.bet_total < _config.default.BET_TOTAL_AMOUNT_MIN || data.game.bet_total > _config.default.BET_TOTAL_AMOUNT_MAX) {
      throw new Error(`Invalid game : bet total amount`);
    }

    let betAmountSum = 0;

    for (let idx = 0; idx < data.game.bets.length; idx++) {
      if (data.game.bets[idx].position < _config.default.BET_POSITION_MIN || data.game.bets[idx].position > _config.default.BET_POSITION_MAX) {
        throw new Error(`Invalid game : bet position range`);
      }

      for (let idx2 = idx + 1; idx2 < data.game.bets.length; idx2++) {
        if (data.game.bets[idx].position === data.game.bets[idx2].position) {
          throw new Error(`Invalid game : bet position duplicated`);
        }
      }

      if (data.game.bets[idx].amount < _config.default.BET_EACH_AMOUNT_MIN || data.game.bets[idx].amount > _config.default.BET_EACH_AMOUNT_MAX) {
        throw new Error(`Invalid game : bet each amount range`);
      }

      if (data.game.bets[idx].amount % _config.default.BET_EACH_AMOUNT_MIN != 0) {
        throw new Error(`Invalid game : bet each amount step`);
      }

      betAmountSum += data.game.bets[idx].amount;
    }

    if (betAmountSum != data.game.bet_total) {
      throw new Error(`Invalid game : bet amount sum not matched`);
    }

    if (ogame[0].status != 0) {
      throw new Error(`Invalid game : not opend game`);
    }

    data.game.seed = ogame[0].seed;
    data.game.ref = cgame.rows[0].ref;
    data.bet.block_time = cgame.rows[0].bet_time;
    return data;
  }));
};

const reveal = data => {
  _logger.default.d('===================== reveal ======================');

  _logger.default.d(data);

  return new _rxjs.Observable(observer => {
    api.transact({
      actions: [{
        account: _config.default.TAZGSICBOREV,
        name: 'reveal',
        authorization: [{
          actor: _config.default.TAZGAMINGMGR,
          permission: 'active'
        }],
        data: {
          game_id: data.game.gid,
          user: data.game.uid,
          seed: data.game.seed
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30
    }).then(resp => {
      _logger.default.d('------ reveal resp ------------'); // log.d(resp);


      _logger.default.d(resp.processed.action_traces[0].inline_traces[0].act.data);

      let results = resp.processed.action_traces[0].inline_traces[0].act.data;
      let betResults = JSON.parse(results.bet_info);

      for (let idx in data.game.bets) {
        data.game.bets[idx].prize = betResults[idx][2];
      }

      data.reveal.block_num = resp.processed.block_num;
      data.reveal.block_time = results.reveal_time;
      data.reveal.trx_id = resp.processed.id;
      data.game.cards = JSON.parse(results.cards);
      data.game.bet_total = results.bet_total;
      data.game.prize_total = results.prize_total;
      observer.next(data);
      observer.complete();
    }).catch(err => {
      _logger.default.e('------ reveal error ------------');

      _logger.default.e(err);

      observer.error(err);
    });
  });
};

const updateResults = (db, data) => {
  _logger.default.d('========= updateResults ==================');

  _logger.default.d(data);

  let status = 1;
  return _games.default.update(db, data.game.gid, data.game.cards[0], data.game.cards[1], data.game.bet_total, data.game.prize_total, status, data.reveal.block_time, data.game.ref, data.bet.block_num, data.reveal.block_num, data.bet.trx_id, data.reveal.trx_id).pipe((0, _operators.flatMap)(() => {
    return _games.default.bet(db, data.game.gid, data.game.bets);
  }), (0, _operators.map)(() => data));
};

const reject = data => {
  _logger.default.d('===================== reject ======================');

  _logger.default.d(data);

  return new _rxjs.Observable(observer => {
    api.transact({
      actions: [{
        account: _config.default.TAZGSICBOREV,
        name: 'reject',
        authorization: [{
          actor: _config.default.TAZGAMINGMGR,
          permission: 'active'
        }],
        data: {
          game_id: data.game.gid,
          user: data.game.uid,
          bet_info: data.game.bets,
          hash: data.game.hash,
          time_expire: data.game.expired,
          sig: data.game.sig,
          reason: _config.default.BET_REJECT_REASON
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30
    }).then(resp => {
      _logger.default.d('------ reject resp ------------'); // log.d(JSON.stringify(resp.processed.action_traces[0].act.data));


      let results = resp.processed.action_traces[0].act.data;
      data.game.reason = results.reason;
      observer.next(data);
      observer.complete();
    }).catch(err => {
      _logger.default.e('------ reject error ------------');

      _logger.default.e(err);

      observer.error(err);
    });
  });
};

const reportResults = data => {
  (0, _nodeFetch.default)(`${process.env.INTERNAL_API_ENDPOINT}/internal/api/v1/results`, {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '-1'
    },
    'body': JSON.stringify(data)
  }).then(response => {
    response.json().then(resp => {// log.d(resp);
    }).catch(err => console.error(err));
  }).catch(err => console.error(err));
};

process.on('message', action => {
  _logger.default.d('=========================== dealer activated ==============================');

  _logger.default.d(action);

  const db = new _db.default();

  try {
    const data = refineAction(action.block_num, action.block_time, action.trx_id, action.data.from, action.data.quantity, action.data.memo);
    db.connect().pipe((0, _operators.flatMap)(() => validateGame(db, data)), (0, _operators.flatMap)(data => reveal(data)), (0, _operators.flatMap)(data => updateResults(db, data)), (0, _operators.catchError)(error => {
      _logger.default.e('==== catchError');

      _logger.default.e(data);

      _logger.default.e(error);

      if (data.game.gid >= 0) {
        return reject(data);
      }

      return (0, _rxjs.throwError)(error);
    }), (0, _operators.finalize)(() => db.release())).subscribe(data => {
      _logger.default.d('================ Report ======================================');

      _logger.default.i(data);

      if (data.game.cards != null) {
        reportResults(data); // websocket connected api server

        process.send(data); // event to parent
      }
    }, error => {
      _logger.default.e('================ Rx Error ======================================');

      _logger.default.e(data);

      _logger.default.e(error.message);
    }, () => {
      _logger.default.d('===========================================================');
    });
  } catch (error) {
    _logger.default.e('================ Try-Catch Error ======================================');

    _logger.default.e(error.message);
  }
});
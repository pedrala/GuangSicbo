'use strict';

var _logger = _interopRequireDefault(require("./logger"));

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _eosjs = require("eosjs");

var _eosjsJssig = require("eosjs/dist/eosjs-jssig");

var _util = require("util");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _db = _interopRequireDefault(require("./db"));

var _users = _interopRequireDefault(require("./models/users"));

var _leaders = _interopRequireDefault(require("./models/leaders"));

var _minings = _interopRequireDefault(require("./models/minings"));

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 *
 *
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

const floorNum4 = n => {
  // remove small number
  return Math.floor(n * 10000) / 10000;
};

const getDateFormat = unixtime => {
  return _momentTimezone.default.tz(new Date(unixtime * 1000), 'Asia/Shanghai').format('YYYYMMDD'); // YYYY-MM-DD HH:mm:ss
};

const initData = data => {
  data.user = {}; // user info including vip level

  data.vip = {};
  data.mining = {};
  return data;
};

const getUser = (db, data) => {
  _logger.default.d('========= getUser ==================');

  _logger.default.d(data);

  return _users.default.get(db, data.game.uid).pipe((0, _operators.map)(user => {
    if (user.length == 0) {
      data.user.vip = 0;
      data.user.accumulated_bet = 0;
      data.user.accumulated_prize = 0;
    } else {
      data.user = JSON.parse(JSON.stringify(user[0]));
    }

    return data;
  }));
};

const calcVipPayout = data => {
  _logger.default.d('========= calcVipPayout ==================');

  _logger.default.d(data);

  data.vip.payout = floorNum4(data.game.bet_total * _config.default.VIP_RETURN_RATIO[data.user.vip]);
  data.user.accumulated_bet += data.game.bet_total;
  data.user.accumulated_prize += data.game.prize_total;

  for (let i = 0; i < _config.default.VIP_LEVEL_REQUIREMENT.length; i++) {
    if (data.user.accumulated_bet < _config.default.VIP_LEVEL_REQUIREMENT[i]) {
      break;
    } else {
      data.user.vip = i;
    }
  }

  return data;
};

const updateUserVip = (db, data) => {
  _logger.default.d('========= updateUserVip ==================');

  _logger.default.d(data);

  return _users.default.addOrUpdateVip(db, data.game.uid, data.user.vip, data.user.accumulated_bet, data.user.accumulated_prize).pipe((0, _operators.map)(() => data));
};

const updateLeader = (db, data) => {
  _logger.default.d('========= updateLeader ==================');

  _logger.default.d(data);

  let date = getDateFormat(data.bet.block_time);
  return _leaders.default.addOrUpdate(db, date, data.game.uid, data.game.bet_total, data.game.prize_total).pipe((0, _operators.map)(() => data));
};

const getMining = (db, data) => {
  _logger.default.d('========= getMining ==================');

  _logger.default.d(data);

  return _minings.default.get(db, _config.default.TOKEN_MINING).pipe((0, _operators.map)(mining => {
    if (mining.length == 0) {
      data.mining.token = _config.default.TOKEN_MINING;
      data.mining.stage = 1;
      data.mining.mined = 0;
    } else {
      data.mining = JSON.parse(JSON.stringify(mining[0]));
    }

    return data;
  }));
};

const calcMiningPayout = data => {
  _logger.default.d('========= calcMiningPayout ==================');

  _logger.default.d(data);

  data.mining.payout = 0;
  let betRemaining = data.game.bet_total;

  while (data.mining.stage <= 10) {
    // stage 11 : no more mining
    let currentStageMiningMax = _config.default.MINING_STAGE_REQUIREMENT[data.mining.stage] - data.mining.mined - data.mining.payout;
    let currentStageBetMax = floorNum4(currentStageMiningMax / _config.default.MINING_RATIO[data.mining.stage - 1]);

    if (betRemaining <= currentStageBetMax) {
      data.mining.payout += floorNum4(betRemaining * _config.default.MINING_RATIO[data.mining.stage - 1]);
      break;
    } else {
      data.mining.payout += currentStageMiningMax;
      betRemaining -= currentStageBetMax;
      data.mining.stage++;
    }
  }

  data.mining.mined += data.mining.payout;
  return data;
};

const updateMining = (db, data) => {
  _logger.default.d('========= updateMining ==================');

  _logger.default.d(data);

  return _minings.default.mine(db, data.mining.token, data.mining.stage, data.mining.mined).pipe((0, _operators.map)(() => data));
};

const assetVip = data => {
  return data.vip.payout.toFixed(4) + " " + _config.default.TOKEN_VIP;
};

const assetMining = data => {
  return data.mining.payout.toFixed(4) + " " + _config.default.TOKEN_MINING;
};

const execPayoutVipMining = data => {
  _logger.default.d('========= execPayoutVipMining ==================');

  _logger.default.d(data);

  return new _rxjs.Observable(observer => {
    api.transact({
      actions: [{
        account: _config.default.TAZGAMEHOUSE,
        name: 'payvipmining',
        authorization: [{
          actor: _config.default.TAZGAMINGMGR,
          permission: 'active'
        }],
        data: {
          game_id: data.game.gid,
          user: data.game.uid,
          type1: _config.default.TYPE_VIP,
          asset1: assetVip(data),
          type2: _config.default.TYPE_MINING,
          asset2: assetMining(data)
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30
    }).then(resp => {
      _logger.default.d('------ payvipmining resp ------------'); // log.d(resp.processed.action_traces[0]);


      observer.next(data);
      observer.complete();
    }).catch(err => {
      _logger.default.e('------ payvipmining error ------------');

      _logger.default.e(err);

      observer.error(err);
    });
  });
};

process.on('message', data => {
  _logger.default.d('=========================== chipper activated ==============================');

  _logger.default.d(data);

  const db = new _db.default();

  try {
    db.connect().pipe( // init
    (0, _operators.map)(() => initData(data)), // users table
    (0, _operators.flatMap)(_ => db.beginTransaction().pipe((0, _operators.map)(() => _))), (0, _operators.flatMap)(data => getUser(db, data)), // to get VIP info
    (0, _operators.map)(data => calcVipPayout(data)), (0, _operators.flatMap)(data => updateUserVip(db, data)), (0, _operators.flatMap)(_ => db.commit().pipe((0, _operators.map)(() => _))), // leaders table
    (0, _operators.flatMap)(data => updateLeader(db, data)), // minings table
    (0, _operators.flatMap)(_ => db.beginTransaction().pipe((0, _operators.map)(() => _))), (0, _operators.flatMap)(data => getMining(db, data)), (0, _operators.map)(data => calcMiningPayout(data)), (0, _operators.flatMap)(data => updateMining(db, data)), (0, _operators.flatMap)(_ => db.commit().pipe((0, _operators.map)(() => _))), // payout via chain
    (0, _operators.flatMap)(data => execPayoutVipMining(data)), (0, _operators.catchError)(error => {
      return (0, _rxjs.throwError)(error);
    }), (0, _operators.finalize)(() => db.release())).subscribe(data => {
      _logger.default.d('================= Report ======================================');

      _logger.default.i(data);
    }, error => {
      _logger.default.e('================= Rx Error ======================================');

      _logger.default.e(data);

      _logger.default.e(error.message);
    }, () => {
      _logger.default.d('===========================================================');
    });
  } catch (error) {
    _logger.default.e('================= Try-Catch Error ======================================');

    _logger.default.e(error.message);
  }
});
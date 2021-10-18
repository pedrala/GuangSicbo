'use strict';

var _logger = _interopRequireDefault(require("./logger"));

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _eosjs = require("eosjs");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _db = _interopRequireDefault(require("./db"));

var _users = _interopRequireDefault(require("./models/users"));

var _stakings = _interopRequireDefault(require("./models/stakings"));

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rpc = new _eosjs.JsonRpc(process.env.CHAIN_RPC, {
  fetch: _nodeFetch.default
});

const getDateFormat = unixtime => {
  return _momentTimezone.default.tz(new Date(unixtime * 1000), 'Asia/Shanghai').format('YYYYMMDD'); // YYYY-MM-DD HH:mm:ss
};

const initData = action => {
  let data = {};
  data.uid = action.data.user;
  data.total_stakings = {};
  data.user_stakings = {};
  return data;
};

const getTotalStakingFromChainTable = data => {
  _logger.default.d('========= getTotalStakingFromChainTable ==================');

  _logger.default.d(data);

  return new _rxjs.Observable(observer => {
    rpc.get_table_rows({
      "code": _config.default.TAZTOKENSTAK,
      "table": "stats",
      "scope": _config.default.TAZTOKENSTAK,
      "index_position": "first",
      "key_type": "i64",
      "lower_bound": _config.default.TOKEN_STAKING,
      "upper_bound": _config.default.TOKEN_STAKING,
      "json": true,
      "limit": 10
    }).then(resp => {
      data.total_stakings.chain = resp.rows[0];
      data.total_stakings.chain.total_staked = data.total_stakings.chain.total_staked * _config.default.CONTRACT_TO_DB_SCALE;
      data.total_stakings.chain.date = getDateFormat(data.total_stakings.chain.staked_updated);
      data.total_stakings.chain.total_unstaking = data.total_stakings.chain.total_unstaking * _config.default.CONTRACT_TO_DB_SCALE;
      observer.next(data);
      observer.complete();
    }).catch(error => {
      observer.error(error);
    });
  });
};

const getUserStakingFromChainTable = data => {
  _logger.default.d('========= getUserStakingFromChainTable ==================');

  _logger.default.d(data);

  return new _rxjs.Observable(observer => {
    rpc.get_table_rows({
      "code": _config.default.TAZTOKENSTAK,
      "table": "userinfos",
      "scope": data.uid,
      "index_position": "first",
      "key_type": "i64",
      "lower_bound": _config.default.TOKEN_STAKING,
      "upper_bound": _config.default.TOKEN_STAKING,
      "json": true,
      "limit": 10
    }).then(resp => {
      data.user_stakings.chain = resp.rows[0];
      data.user_stakings.chain.staked = data.user_stakings.chain.staked * _config.default.CONTRACT_TO_DB_SCALE;
      data.user_stakings.chain.date = getDateFormat(data.user_stakings.chain.staked_updated);
      data.user_stakings.chain.unstaking = data.user_stakings.chain.unstaking * _config.default.CONTRACT_TO_DB_SCALE;
      observer.next(data);
      observer.complete();
    }).catch(error => {
      observer.error(error);
    });
  });
};

const updateTotalStakings = (db, data) => {
  _logger.default.d('========= updateTotalStaking ==================');

  _logger.default.d(data);

  let chainVal = data.total_stakings.chain;
  return _stakings.default.addOrUpdateTotal(db, chainVal.date, chainVal.total_staked, chainVal.total_unstaking).pipe((0, _operators.map)(() => {
    return data;
  }));
};

const getUserStakingsFromDb = (db, data) => {
  _logger.default.d('========= getUserStakingsFromDb ==================');

  _logger.default.d(data);

  return _stakings.default.getUserStakings(db, data.uid).pipe((0, _operators.map)(userStakings => {
    _logger.default.d(userStakings);

    if (userStakings.length == 0) data.user_stakings.db = null;else data.user_stakings.db = JSON.parse(JSON.stringify(userStakings));
    return data;
  }));
};

const updateUserStakings = (db, data) => {
  _logger.default.d('========= updateUserStaking ==================');

  _logger.default.d(data); // log.d(data.user_stakings.db);


  let account = data.uid;
  let dbVal = data.user_stakings.db;
  let chainVal = data.user_stakings.chain;
  let deleteDates = []; // old data will be deleted

  if (dbVal != null) {
    // values exist, add(diff day) or update(same day)
    let deleteStartIdx = 1; // add or update : save the first element

    if (chainVal.date === dbVal[0].date) {
      deleteStartIdx = 2;
    } // update : save the second element, too


    for (let i = deleteStartIdx; i < dbVal.length; i++) {
      deleteDates.push(dbVal[i].date);
    }
  }

  return _stakings.default.addOrUpdateUser(db, chainVal.date, account, chainVal.staked).pipe((0, _operators.concatMap)(() => {
    if (deleteDates.length > 0) {
      return _stakings.default.removeManyUsers(db, account, deleteDates);
    } else {
      return (0, _rxjs.of)(1);
    }
  }), (0, _operators.map)(() => {
    return data;
  }));
};

const updateUser = (db, data) => {
  _logger.default.d('========= updateUser ==================');

  _logger.default.d(data);

  let account = data.uid;
  let chainVal = data.user_stakings.chain;
  return _users.default.addOrUpdateStaking(db, account, chainVal.staked, chainVal.unstaking, chainVal.request_time).pipe((0, _operators.map)(() => {
    return data;
  }));
};

process.on('message', action => {
  _logger.default.d('============================ staker activated =================================');

  _logger.default.d(action);

  const db = new _db.default();
  const data = initData(action);

  try {
    db.connect().pipe( // read from chain tables
    (0, _operators.concatMap)(() => getTotalStakingFromChainTable(data)), (0, _operators.concatMap)(data => getUserStakingFromChainTable(data)), // DB: taz_total_stakings
    (0, _operators.concatMap)(data => updateTotalStakings(db, data)), // DB: taz_user_stakings
    (0, _operators.concatMap)(_ => db.beginTransaction().pipe((0, _operators.map)(() => _))), (0, _operators.concatMap)(data => getUserStakingsFromDb(db, data)), (0, _operators.concatMap)(data => updateUserStakings(db, data)), (0, _operators.concatMap)(_ => db.commit().pipe((0, _operators.map)(() => _))), (0, _operators.concatMap)(data => updateUser(db, data)), (0, _operators.catchError)(error => {
      return (0, _rxjs.throwError)(error);
    }), (0, _operators.finalize)(() => db.release())).subscribe(data => {
      _logger.default.d('================= Report  ==================================');

      _logger.default.d(data);

      _logger.default.i(data);
    }, error => {
      _logger.default.e('================= Rx Error  ==================================');

      _logger.default.e(data);

      _logger.default.e(error.message);
    }, () => {
      _logger.default.d('===========================================================');
    });
  } catch (error) {
    _logger.default.e('================= Try-Catch Error  ==================================');

    _logger.default.e(error.message);
  }
});
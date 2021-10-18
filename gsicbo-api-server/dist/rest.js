'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.forbidden = exports.getBets = exports.getGames = exports.getUsers = exports.getDividends = exports.getOrders = exports.getLeaderboard = exports.postResults = exports.postGames = void 0;

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _randomatic = _interopRequireDefault(require("randomatic"));

var _eosjsEcc = _interopRequireDefault(require("eosjs-ecc"));

var _eosjs = require("eosjs");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _logger = _interopRequireDefault(require("./libs/logger"));

var _db = _interopRequireDefault(require("./libs/db"));

var _models = require("./models");

var _config = _interopRequireDefault(require("./libs/config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rpc = new _eosjs.JsonRpc(process.env.CHAIN_RPC, {
  fetch: _nodeFetch.default
});

const getNowFormat = () => {
  return _momentTimezone.default.tz(new Date(), 'Asia/Shanghai').format('YYYYMMDD'); // YYYY-MM-DD HH:mm:ss
};

const postGames = (req, res) => {
  if (!req.body.account) {
    return res.status(400).jsonp({});
  }

  _logger.default.d(req.body.account);

  const seed = (0, _randomatic.default)('Aa0', 64);
  const expired = Math.floor(new Date().getTime() / 1000) + 120;
  const db = new _db.default();
  db.connect().pipe((0, _operators.flatMap)(() => _models.games.add(db, req.body.account, seed, expired)), (0, _operators.map)(result => result.insertId), (0, _operators.flatMap)(gid => _models.games.get(db, gid, req.body.account)), (0, _operators.map)(games => {
    if (!games || games.length < 0) {
      throw new Error('Not found game.');
    }

    const game = games[0];

    const hash = _eosjsEcc.default.sha256(seed);

    return {
      id: game.id,
      uid: game.uid,
      hash: hash,
      sig: _eosjsEcc.default.sign(`${hash}${game.id}${game.uid}${game.expired}`, process.env.MGR_PK),
      expired: game.expired,
      revealed: game.revealed
    };
  }), (0, _operators.finalize)(() => db.release())).subscribe({
    next: game => {
      res.status(200).json(game);
    },
    error: err => {
      _logger.default.e(err.stack);

      res.status(500).json(err);
    }
  });
};

exports.postGames = postGames;

const postResults = (req, res, gameResults) => {
  let ip = req.connection.remoteAddress;

  if (ip === process.env.TRACER_IP || ip === process.env.LOCALHOST_IP) {
    _logger.default.d(req.body);

    gameResults.next(req.body);
    res.status(200).json(req.body);
  } else {
    _logger.default.e('fake ip = ' + ip);

    _logger.default.e(req.body);

    res.status(200).json({});
  }
};

exports.postResults = postResults;

const getLeaderboard = (req, res) => {
  const N_BET_MAX = 1000;
  const N_PRIZE_MAX = 1000;
  const BET_CODE = 'daily_bets';
  const PRIZE_CODE = 'daily_prizes';
  let account = req.query.account;
  let date = req.query.date === undefined ? getNowFormat() : req.query.date;
  const db = new _db.default();
  let data = {};
  data.account = {};
  data.account.account = account;
  db.connect().pipe((0, _operators.flatMap)(() => _models.leaders.get(db, date, BET_CODE, N_BET_MAX)), (0, _operators.map)(bet => {
    data.bet = JSON.parse(JSON.stringify(bet));
    let bet_idx = bet.map(list => list.account).indexOf(account);
    data.account.bet_rank = bet_idx + 1;

    if (bet_idx !== -1) {
      data.account.bet_amount = bet[bet_idx].daily_bets;
      data.account.prize_amount = bet[bet_idx].daily_prizes;
    }

    return data;
  }), (0, _operators.flatMap)(() => _models.leaders.get(db, date, PRIZE_CODE, N_PRIZE_MAX)), (0, _operators.map)(prize => {
    data.prize = JSON.parse(JSON.stringify(prize));
    let prize_idx = prize.map(list => list.account).indexOf(account);
    data.account.prize_rank = prize_idx + 1;

    if (prize_idx != -1) {
      data.account.bet_amount = prize[prize_idx].daily_bets;
      data.account.prize_amount = prize[prize_idx].daily_prizes;
    }

    return data;
  }), (0, _operators.flatMap)(() => {
    if (data.account.bet_amount === undefined) {
      return _models.leaders.getUser(db, date, account).pipe((0, _operators.map)(user => {
        if (user.length === 0) {
          data.account.bet_amount = 0;
          data.account.prize_amount = 0;
        } else {
          data.account.bet_amount = user[0].daily_bets;
          data.account.prize_amount = user[0].daily_prizes;
        }

        return data;
      }));
    } else {
      return (0, _rxjs.of)(data);
    }
  }), (0, _operators.finalize)(() => db.release())).subscribe({
    next: data => {
      res.status(200).json(data);
    },
    error: err => {
      _logger.default.e(err.stack);

      res.status(500).json(err);
    },
    completed: () => {}
  });
};

exports.getLeaderboard = getLeaderboard;

const getOrders = (req, res) => {
  let account = req.query.account;
  const db = new _db.default();
  let data = {};
  data.account = account;
  db.connect().pipe((0, _operators.flatMap)(() => _models.orders.get(db, account)), (0, _operators.map)(orders => {
    data.orders = JSON.parse(JSON.stringify(orders));
    return data;
  }), (0, _operators.finalize)(() => db.release())).subscribe({
    next: data => {
      res.status(200).json(data);
    },
    error: err => {
      _logger.default.e(err.stack);

      res.status(500).json(err);
    },
    completed: () => {}
  });
};

exports.getOrders = getOrders;

const getUserUnstakingFromChain = data => {
  return new _rxjs.Observable(observer => {
    rpc.get_table_rows({
      "code": _config.default.TAZTOKENSTAK,
      "table": "userinfos",
      "scope": data.account,
      "index_position": "first",
      "key_type": "i64",
      "lower_bound": _config.default.TOKEN_STAKING,
      "upper_bound": _config.default.TOKEN_STAKING,
      "json": true,
      "limit": 10
    }).then(resp => {
      if (resp.rows && resp.rows.length === 1) {
        if (data.user.unstaking != resp.rows[0].unstaking || data.user.unstaking_requested != resp.rows[0].request_time) {
          data.user.updateUnstaking = true;
        } else {
          data.user.updateUnstaking = false;
        }

        data.user.unstaking = resp.rows[0].unstaking;
        data.user.unstaking_requested = resp.rows[0].request_time;
      } else {
        data.user.updateUnstaking = true;
        data.user.unstaking = 0;
        data.user.unstaking_requested = 0;
      }

      observer.next(data);
      observer.complete();
    }).catch(error => {
      observer.error(error);
    });
  });
};

const updateUserUnstakingIntoDb = (db, data) => {
  if (data.user.updateUnstaking) {
    return _models.users.updateUnstaking(db, data.account, data.user.unstaking, data.user.unstaking_requested);
  } else {
    return (0, _rxjs.of)(data);
  }
};

const getDividends = (req, res) => {
  const PROFIT_TO_DIVIDEND_RATIO = 0.4;
  let data = {};
  data.user = {};
  data.account = req.query.account;
  let date = req.query.date === undefined ? getNowFormat() : req.query.date;
  const db = new _db.default();
  db.connect().pipe((0, _operators.flatMap)(() => _models.orders.getEosProfit(db, date)), (0, _operators.map)(resp => {
    if (resp[0].profit === null) {
      data.dividends = 0;
    } else {
      data.dividends = JSON.parse(JSON.stringify(resp[0].profit)) * PROFIT_TO_DIVIDEND_RATIO;
    }

    return data;
  }), (0, _operators.flatMap)(data => _models.stakings.getCurrentTazTotalStakings(db)), (0, _operators.map)(resp => {
    if (resp.length === 0) {
      data.total_staked = 0;
    } else {
      data.total_staked = resp[0].staked;
    }

    return data;
  }), (0, _operators.flatMap)(data => _models.users.get(db, data.account)), (0, _operators.map)(resp => {
    if (resp.length === 0 || data.account === undefined) {
      data.user.staked = 0;
      data.user.unstaking = 0;
      data.user.unstaking_requested = 0;
    } else {
      data.user = JSON.parse(JSON.stringify(resp[0]));
    }

    return data;
  }), (0, _operators.flatMap)(data => {
    let curTime = Math.floor(new Date().getTime() / 1000);
    let targetTime = data.user.unstaking_requested + _config.default.ONE_DAY_SEC;

    if (data.user.unstaking === 0 || curTime < targetTime) {
      return (0, _rxjs.of)(data);
    } else {
      return getUserUnstakingFromChain(data).pipe((0, _operators.flatMap)(data => updateUserUnstakingIntoDb(db, data)), (0, _operators.map)(() => data));
    }
  }), (0, _operators.finalize)(() => db.release())).subscribe({
    next: data => {
      res.status(200).json(data);
    },
    error: err => {
      _logger.default.e(err.stack);

      res.status(500).json(err);
    },
    completed: () => {}
  });
};

exports.getDividends = getDividends;

const getUsers = (req, res) => {
  let data = {};
  let account = req.query.account;
  const db = new _db.default();
  db.connect().pipe((0, _operators.flatMap)(() => _models.users.get(db, account)), (0, _operators.map)(resp => {
    if (resp.length === 0 || account === undefined) {
      data.account = account;
      data.vip = 0;
      data.accumulated_bet = 0;
    } else {
      data = JSON.parse(JSON.stringify(resp[0]));
    }

    return data;
  }), (0, _operators.finalize)(() => db.release())).subscribe({
    next: data => {
      res.status(200).json(data);
    },
    error: err => {
      _logger.default.e(err.stack);

      res.status(500).json(err);
    },
    completed: () => {}
  });
};

exports.getUsers = getUsers;

const getGames = (req, res) => {
  const N_ROW_LIMIT = 50;
  let data = {};
  let account = req.query.account;
  const db = new _db.default();
  db.connect().pipe((0, _operators.flatMap)(() => _models.games.getRevealedByAccountWithLimit(db, account, N_ROW_LIMIT)), (0, _operators.map)(resp => {
    data = JSON.parse(JSON.stringify(resp));
    return data;
  }), (0, _operators.finalize)(() => db.release())).subscribe({
    next: data => {
      res.status(200).json(data);
    },
    error: err => {
      _logger.default.e(err.stack);

      res.status(500).json(err);
    },
    completed: () => {}
  });
};

exports.getGames = getGames;

const getBets = (req, res) => {
  let data = {};
  let gid = req.query.gid;
  const db = new _db.default();
  db.connect().pipe((0, _operators.flatMap)(() => _models.games.getBetsByGid(db, gid)), (0, _operators.map)(resp => {
    data = JSON.parse(JSON.stringify(resp));
    return data;
  }), (0, _operators.finalize)(() => db.release())).subscribe({
    next: data => {
      res.status(200).json(data);
    },
    error: err => {
      _logger.default.e(err.stack);

      res.status(500).json(err);
    },
    completed: () => {}
  });
};

exports.getBets = getBets;

const forbidden = (req, res) => {
  res.status(403).json({});
};

exports.forbidden = forbidden;
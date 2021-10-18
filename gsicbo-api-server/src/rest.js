'use strict'
import { of, Observable } from 'rxjs';
import { flatMap, finalize, map } from 'rxjs/operators';
import randomatic from 'randomatic';
import ecc from 'eosjs-ecc';
import { Api, JsonRpc, RpcError } from 'eosjs';
import fetch from 'node-fetch'
import moment from 'moment-timezone';
import log from './libs/logger'
import Database from './libs/db';
import { leaders, orders, stakings, users, games } from './models';
import C from './libs/config';

const rpc = new JsonRpc(process.env.CHAIN_RPC, { fetch });

/**
 * integer format of date
 */
const getNowFormat = () => {
  return moment.tz(new Date(), 'Asia/Shanghai').format('YYYYMMDD');  // YYYY-MM-DD HH:mm:ss
}

/**
 * generate game (seed and expire) and write it to DB
 * 
 * @param {*} req 
 * @param {*} res 
 */
const postGames = (req, res) => {
  if (!req.body.account) {
    return res.status(400).jsonp({})
  }

  log.d(req.body.account)
  const seed = randomatic('Aa0', 64);
  const expired = Math.floor(new Date().getTime() / 1000) + 120;
  const db = new Database();

  db.connect().pipe(
    flatMap(() => games.add(db, req.body.account, seed, expired)),
    map(result => result.insertId),
    flatMap(gid => games.get(db, gid, req.body.account)),
    map(games => {
      if (!games || games.length < 0) {
        throw new Error('Not found game.');
      }

      const game = games[0];
      const hash = ecc.sha256(seed);
      return {
        id: game.id,
        uid: game.uid,
        hash: hash,
        sig: ecc.sign(`${hash}${game.id}${game.uid}${game.expired}`, process.env.MGR_PK),
        expired: game.expired,
        revealed: game.revealed
      }
    }),
    finalize(() => db.release())
  ).subscribe({
    next: game => {
      res.status(200).json(game);
    },
    error: err => {
      log.e(err.stack)
      res.status(500).json(err);
    }
  });
}

/**
 * get results from tracer(dealer) then pass it to Websocket
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} gameResults 
 */
const postResults = (req, res, gameResults) => {
  let ip = req.connection.remoteAddress;
  if (ip === process.env.TRACER_IP || ip === process.env.LOCALHOST_IP) {
    log.d(req.body);
    gameResults.next(req.body);
    res.status(200).json(req.body);
  } else {
    log.e('fake ip = ' + ip);
    log.e(req.body);
    res.status(200).json({});
  }
}

/**
 * get leaderboard for the landing page
 * this also returns my info with ranks and amounts
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getLeaderboard = (req, res) => {
  const N_BET_MAX = 1000;
  const N_PRIZE_MAX = 1000;
  const BET_CODE = 'daily_bets';
  const PRIZE_CODE = 'daily_prizes';

  let account = req.query.account
  let date = req.query.date === undefined ? getNowFormat() : req.query.date;
  const db = new Database();

  let data = {};
  data.account  = {};
  data.account.account = account;

  db.connect().pipe(
    flatMap(() => leaders.get(db, date, BET_CODE, N_BET_MAX)),
    map(bet => {
      data.bet = JSON.parse(JSON.stringify(bet));
      let bet_idx = bet.map(list => list.account).indexOf(account);
      data.account.bet_rank = bet_idx + 1;
      if(bet_idx !== -1) {
        data.account.bet_amount = bet[bet_idx].daily_bets;
        data.account.prize_amount = bet[bet_idx].daily_prizes;
      }
      return data;
    }),
    flatMap(() => leaders.get(db, date, PRIZE_CODE, N_PRIZE_MAX)),
    map(prize => {
      data.prize = JSON.parse(JSON.stringify(prize));
      let  prize_idx = prize.map(list => list.account).indexOf(account);
      data.account.prize_rank = prize_idx + 1;
      if(prize_idx != -1) {
        data.account.bet_amount = prize[prize_idx].daily_bets;
        data.account.prize_amount = prize[prize_idx].daily_prizes;
      }
      return data;
    }),
    flatMap(() => {
      if (data.account.bet_amount === undefined) {
        return leaders.getUser(db, date, account).pipe(
          map(user => {
            if (user.length === 0) {
              data.account.bet_amount = 0;
              data.account.prize_amount = 0;
            } else {
              data.account.bet_amount = user[0].daily_bets;
              data.account.prize_amount = user[0].daily_prizes;
            }
            return data;
          })
        );
      } else {
        return of(data);
      }
    }),
    finalize(() => db.release())
  ).subscribe({
    next: data => {
      res.status(200).json(data);
    },
    error: err => {
      log.e(err.stack)
      res.status(500).json(err);
    },
    completed: () => {}
  });
}

/**
 * get all order histories with the account from DB (store)
 *  
 * @param {*} req 
 * @param {*} res 
 */
const getOrders = (req, res) => {
  let account = req.query.account
  const db = new Database();

  let data = {};
  data.account  = account;

  db.connect().pipe(
    flatMap(() => orders.get(db, account)),
    map(orders => {
      data.orders = JSON.parse(JSON.stringify(orders));
      return data;
    }),
    finalize(() => db.release())
  ).subscribe({
    next: data => {
      res.status(200).json(data);
    },
    error: err => {
      log.e(err.stack)
      res.status(500).json(err);
    },
    completed: () => {}
  });
}

/**
 * get user unstaking status from chain
 * 
 * @param {*} data 
 */
const getUserUnstakingFromChain = (data) => {
  return new Observable(observer => {
    rpc.get_table_rows({
      "code": C.TAZTOKENSTAK,
      "table": "userinfos",
      "scope": data.account,
      "index_position": "first",
      "key_type": "i64",
      "lower_bound": C.TOKEN_STAKING,
      "upper_bound": C.TOKEN_STAKING,
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
    })
  })
}

/**
 * if unstaking status is changed, update it into DB
 * 
 * @param {*} db 
 * @param {*} data 
 */
const updateUserUnstakingIntoDb = (db, data) => {
  if (data.user.updateUnstaking) {
    return users.updateUnstaking(db, data.account, data.user.unstaking, data.user.unstaking_requested);
  } else {
    return of(data);
  }
}

/**
 * read current EOS profits
 * read current total taz stakes
 * read the users's current stakes
 * if there's a possibility of unstaking complete, check it from the chain and update it into DB
 * this will be used for the landing pages' expected dividend section
 *  
 * @param {*} req 
 * @param {*} res 
 */
const getDividends = (req, res) => {
  const PROFIT_TO_DIVIDEND_RATIO = 0.4;
  
  let data = {};
  data.user = {};
  data.account  = req.query.account;
  let date = req.query.date === undefined ? getNowFormat() : req.query.date;
  
  const db = new Database();
  db.connect().pipe(
    flatMap(() => orders.getEosProfit(db, date)),
    map(resp => {
      if (resp[0].profit === null) {
        data.dividends = 0;
      } else {
        data.dividends = JSON.parse(JSON.stringify(resp[0].profit)) * PROFIT_TO_DIVIDEND_RATIO;
      }
      return data;
    }),
    flatMap(data => stakings.getCurrentTazTotalStakings(db)),
    map(resp => {
      if (resp.length === 0) {
        data.total_staked = 0;
      } else {
        data.total_staked = resp[0].staked;
      }
      return data;
    }),
    flatMap(data => users.get(db, data.account)),
    map(resp => {
      if (resp.length === 0 || data.account === undefined) {
        data.user.staked = 0;
        data.user.unstaking = 0;
        data.user.unstaking_requested = 0;
      } else {
        data.user = JSON.parse(JSON.stringify(resp[0]));
      }
      return data;
    }),
    flatMap(data => {
      let curTime = Math.floor(new Date().getTime() / 1000);
      let targetTime = data.user.unstaking_requested + C.ONE_DAY_SEC;
      if (data.user.unstaking === 0 || curTime < targetTime) {
        return of(data);
      } else {
        return getUserUnstakingFromChain(data).pipe(
          flatMap(data => updateUserUnstakingIntoDb(db, data)),
          map(() => data)
        );
      }
    }),
    finalize(() => db.release())
  ).subscribe({
    next: data => {
      res.status(200).json(data);
    },
    error: err => {
      log.e(err.stack)
      res.status(500).json(err);
    },
    completed: () => {}
  });
}

/**
 * get user info from DB especially related to vip calculation
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getUsers = (req, res) => {
  let data = {};
  let account = req.query.account;

  const db = new Database();
  db.connect().pipe(
    flatMap(() => users.get(db, account)),
    map(resp => {
      if (resp.length === 0 || account === undefined) {
        data.account = account;
        data.vip = 0;
        data.accumulated_bet = 0;
      } else {
        data = JSON.parse(JSON.stringify(resp[0]));
      }
      return data;
    }),
    finalize(() => db.release())
  ).subscribe({
    next: data => {
      res.status(200).json(data);
    },
    error: err => {
      log.e(err.stack)
      res.status(500).json(err);
    },
    completed: () => {}
  });
}

/**
 * get recently revealed games of the account
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getGames = (req, res) => {
  const N_ROW_LIMIT = 50;
  let data = {};
  let account = req.query.account;

  const db = new Database();
  db.connect().pipe(
    flatMap(() => games.getRevealedByAccountWithLimit(db, account, N_ROW_LIMIT)),
    map(resp => {
      data = JSON.parse(JSON.stringify(resp));
      return data;
    }),
    finalize(() => db.release())
  ).subscribe({
    next: data => {
      res.status(200).json(data);
    },
    error: err => {
      log.e(err.stack)
      res.status(500).json(err);
    },
    completed: () => {}
  });
}

/**
 * get detailed bet info from game id
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getBets = (req, res) => {
  let data = {};
  let gid = req.query.gid;

  const db = new Database();
  db.connect().pipe(
    flatMap(() => games.getBetsByGid(db, gid)),
    map(resp => {
      data = JSON.parse(JSON.stringify(resp));
      return data;
    }),
    finalize(() => db.release())
  ).subscribe({
    next: data => {
      res.status(200).json(data);
    },
    error: err => {
      log.e(err.stack)
      res.status(500).json(err);
    },
    completed: () => {}
  });
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const forbidden = (req, res) => {
  res.status(403).json({})
}

export {
  postGames,
  postResults,
  getLeaderboard,
  getOrders,
  getDividends,
  getUsers,
  getGames,
  getBets,
  forbidden
}
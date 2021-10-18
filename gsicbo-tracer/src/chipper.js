'use strict'

import log from './logger'
import { throwError } from 'rxjs';
import { finalize, flatMap, map, catchError } from 'rxjs/operators';
import moment from 'moment-timezone';
import Database from './db';
import users from './models/users';
import leaders from './models/leaders';
import minings from './models/minings';
import C from './config';
import { execPayoutVipMining } from './chain.js';

const floorNum4 = (n) => {  // remove small number
  return Math.floor(n * 10000) / 10000;
}

/**
 * convert unixtime to integer date format (CST)
 * 
 * @param {*} unixtime 
 */
const getDateFormat = (unixtime) => {
  return moment.tz(new Date(unixtime * 1000), 'Asia/Shanghai').format('YYYYMMDD');  // YYYY-MM-DD HH:mm:ss
}

/**
 * init data
 * 
 * @param {*} data 
 */
const initData = (data) => {
  data.user = {};  // user info including vip level
  data.vip = {};
  data.mining = {};
  return data;
}

/**
 * read user info from DB (especially related to vip info)
 * 
 * @param {*} db 
 * @param {*} data 
 */
const getUser = (db, data) => {
  log.d('========= getUser ==================');
  log.d(data);

  return users.get(db, data.game.uid).pipe(
    map(user => {
      if (user.length == 0) {
        data.user.vip = 0;
        data.user.accumulated_bet = 0;
        data.user.accumulated_prize = 0;
      } else {
        data.user = JSON.parse(JSON.stringify(user[0]));
      }
      return data;
    })
  );
}

/**
 * calculate vip payout based on the current vip level
 * new vip level is also calculated
 * 
 * @param {*} data 
 */
const calcVipPayout = (data) => {
  log.d('========= calcVipPayout ==================');
  log.d(data);

  data.vip.payout = floorNum4(data.game.bet_total * C.VIP_RETURN_RATIO[data.user.vip]);
  data.user.accumulated_bet += data.game.bet_total;
  data.user.accumulated_prize += data.game.prize_total;

  for (let i = 0; i < C.VIP_LEVEL_REQUIREMENT.length; i++) {
    if (data.user.accumulated_bet < C.VIP_LEVEL_REQUIREMENT[i]) { break; }
    else { data.user.vip = i; }
  }
  return data;
}

/**
 * update the user's vip info
 * 
 * @param {*} db 
 * @param {*} data 
 */
const updateUserVip = (db, data) => {
  log.d('========= updateUserVip ==================');
  log.d(data);

  return users.addOrUpdateVip(db, data.game.uid, data.user.vip, data.user.accumulated_bet, data.user.accumulated_prize).pipe(map(() => data));
}

/**
 * update leaderboard with the user's current bet and prize
 * 
 * @param {*} db 
 * @param {*} data 
 */
const updateLeader = (db, data) => {
  log.d('========= updateLeader ==================');
  log.d(data);

  let date = getDateFormat(data.bet.block_time);
  return leaders.addOrUpdate(db, date, data.game.uid, data.game.bet_total, data.game.prize_total).pipe(map(() => data));
}

/**
 * read the current status of token mining
 * 
 * @param {*} db 
 * @param {*} data 
 */
const getMining = (db, data) => {
  log.d('========= getMining ==================');
  log.d(data);

  return minings.get(db, C.TOKEN_MINING).pipe(
    map(mining => {
      if (mining.length == 0) {
        data.mining.token = C.TOKEN_MINING;
        data.mining.stage = 1;
        data.mining.mined = 0;
      } else {
        data.mining = JSON.parse(JSON.stringify(mining[0]));
      }
      return data;
    })
  );
}

/**
 * calculate the amount of mining
 * during one mining process, the mining stage can be changed
 * 
 * @param {*} data 
 */
const calcMiningPayout = (data) => {
  log.d('========= calcMiningPayout ==================');
  log.d(data);

  data.mining.payout = 0;
  let betRemaining = data.game.bet_total;
  while(data.mining.stage <= 10) {  // stage 11 : no more mining
    let currentStageMiningMax = C.MINING_STAGE_REQUIREMENT[data.mining.stage] - data.mining.mined - data.mining.payout;
    let currentStageBetMax = floorNum4(currentStageMiningMax / C.MINING_RATIO[data.mining.stage - 1]);
    if (betRemaining <= currentStageBetMax) {
      data.mining.payout += floorNum4(betRemaining * C.MINING_RATIO[data.mining.stage - 1]);
      break;
    } else {
      data.mining.payout += currentStageMiningMax;
      betRemaining -= currentStageBetMax;
      data.mining.stage++;
    }
  }
  data.mining.mined += data.mining.payout;
  return data;
}

/**
 * update new mining status
 * 
 * @param {*} db 
 * @param {*} data 
 */
const updateMining = (db, data) => {
  log.d('========= updateMining ==================');
  log.d(data);

  return minings.mine(db, data.mining.token, data.mining.stage, data.mining.mined).pipe(map(() => data));
}

/**
 * chipper starting point
 */
process.on('message', (data) => {
  log.i('=========================== chipper activated ==============================');
  log.i(data);

  const db = new Database();
  try {
    db.connect().pipe(
      // init
      map(() => initData(data)),

      // users table
      flatMap(_ => db.beginTransaction().pipe(map(() => _))),
      flatMap(data => getUser(db, data)),  // to get VIP info
      map(data => calcVipPayout(data)),
      flatMap(data => updateUserVip(db, data)),
      flatMap(_ => db.commit().pipe(map(() => _))),

      // leaders table
      flatMap(data => updateLeader(db, data)),

      // minings table
      flatMap(_ => db.beginTransaction().pipe(map(() => _))),
      flatMap(data => getMining(db, data)),
      map(data => calcMiningPayout(data)),
      flatMap(data => updateMining(db, data)),
      flatMap(_ => db.commit().pipe(map(() => _))),

      // payout via chain
      flatMap(data => execPayoutVipMining(data)),

      catchError(error => {
        return throwError(error);
      }),
      finalize(() => db.release())
    ).subscribe(
      data => {
        log.d('================= Report ======================================');
        log.i(data);
      },
      error => {
        log.e('================= Rx Error ======================================');
        log.e(data);
        log.e(error);
        log.e(error.message);
      },
      () => {
        log.d('===========================================================');
      }
    )
  } catch(error) {
    log.e('================= Try-Catch Error ======================================');
    log.e(error);
    log.e(error.message);
  }
})
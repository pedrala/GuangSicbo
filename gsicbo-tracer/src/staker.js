'use strict'

import log from './logger'
import { throwError, of } from 'rxjs';
import { finalize, concatMap, map, catchError } from 'rxjs/operators';
import Database from './db';
import users from './models/users';
import stakings from './models/stakings';
import { getUserStakingFromChainTable, getTotalStakingFromChainTable } from './chain.js';

/**
 * init data
 * 
 * @param {*} action 
 */
const initData = (action) => {
  let data = {};
  data.uid = action.data.user;
  data.total_stakings = {};
  data.user_stakings = {};
  return data;
}


/**
 * update total staking status into DB
 * 
 * @param {*} db 
 * @param {*} data 
 */
const updateTotalStakings = (db, data) => {
  log.d('========= updateTotalStaking ==================');
  log.d(data);

  let chainVal = data.total_stakings.chain;
  return stakings.addOrUpdateTotal(db, chainVal.date, chainVal.total_staked, chainVal.total_unstaking).pipe(
    map(() => {
      return data;
    })
  );
}

/**
 * read the user's staking status from DB
 * 
 * @param {*} db 
 * @param {*} data 
 */
const getUserStakingsFromDb = (db, data) => {
  log.d('========= getUserStakingsFromDb ==================');
  log.d(data);

  return stakings.getUserStakings(db, data.uid).pipe(
    map(userStakings => {
      log.d(userStakings);
      if (userStakings.length == 0) data.user_stakings.db = null;
      else data.user_stakings.db = JSON.parse(JSON.stringify(userStakings));
      return data;
    })
  );
}

/**
 * update the user's staking status into DB
 * at most 2 recent days' info will be survived
 * 
 * @param {*} db 
 * @param {*} data 
 */
const updateUserStakings = (db, data) => {
  log.d('========= updateUserStaking ==================');
  log.d(data);
  // log.d(data.user_stakings.db);

  let account = data.uid;
  let dbVal = data.user_stakings.db;
  let chainVal = data.user_stakings.chain;
  let deleteDates = [];  // old data will be deleted

  if (dbVal != null) {  // values exist, add(diff day) or update(same day)
    let deleteStartIdx = 1;  // add or update : save the first element
    if (chainVal.date === dbVal[0].date) { deleteStartIdx = 2; }  // update : save the second element, too
    for (let i=deleteStartIdx; i<dbVal.length; i++) {  
      deleteDates.push(dbVal[i].date);
    }
  }
  return stakings.addOrUpdateUser(db, chainVal.date, account, chainVal.staked).pipe(
    concatMap(() => {
      if (deleteDates.length > 0) {
        return stakings.removeManyUsers(db, account, deleteDates);
      } else {
        return of(1);
      }
    }),
    map(() => {
      return data;
    })
  );
}

/**
 * update the user's staking status into DB from chain info
 * 
 * @param {*} db 
 * @param {*} data 
 */
const updateUser = (db, data) => {
  log.d('========= updateUser ==================');
  log.d(data);

  let account = data.uid;
  let chainVal = data.user_stakings.chain;
  return users.addOrUpdateStaking(db, account, chainVal.staked, chainVal.unstaking, chainVal.request_time).pipe(
    map(() => {
      return data;
    })
  );
}

/**
 * staker starting point
 */
process.on('message', (action) => {
  log.i('============================ staker activated =================================');
  log.i(action);

  const db = new Database();
  const data = initData(action);
  try {
    db.connect().pipe(
      // read from chain tables
      concatMap(() => getTotalStakingFromChainTable(data)),
      concatMap(data => getUserStakingFromChainTable(data)),

      // DB: taz_total_stakings
      concatMap(data => updateTotalStakings(db, data)),

      // DB: taz_user_stakings
      concatMap(_ => db.beginTransaction().pipe(map(() => _))),
      concatMap(data => getUserStakingsFromDb(db, data)),
      concatMap(data => updateUserStakings(db, data)),
      concatMap(_ => db.commit().pipe(map(() => _))),

      concatMap(data => updateUser(db, data)),

      catchError(error => {
        return throwError(error);
      }),
      finalize(() => db.release())
    ).subscribe(
      data => {
        log.d('================= Report  ==================================');
        log.d(data);
        log.i(data);
      },
      error => {
        log.e('================= Rx Error  ==================================');
        log.e(data);
        log.e(error);
        log.e(error.message);
      },
      () => {
        log.d('===========================================================');
      }
    )
  } catch(error) {
    log.e('================= Try-Catch Error  ==================================');
    log.e(error);
    log.e(error.message);
  }
})


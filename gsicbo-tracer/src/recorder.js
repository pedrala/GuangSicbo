'use strict'

import log from './logger'
import { throwError, Observable, combineLatest, of } from 'rxjs';
import { finalize, flatMap, map, withLatestFrom, catchError } from 'rxjs/operators';
import Database from './db';
import orders from './models/orders';
import moment from 'moment-timezone';
import C from './config';

/**
 * convert unixtime to integer date format (CST)
 * 
 * @param {*} unixtime 
 */
const getDateFormat = (unixtime) => {
  return moment.tz(new Date(unixtime * 1000), 'Asia/Shanghai').format('YYYYMMDD');  // YYYY-MM-DD HH:mm:ss
}

/**
 * init data object
 * built from action data
 *  
 * @param {*} action 
 */
const initData = (action) => {
  let data = {};
  data.uid = action.data.from;
  data.token_contract = action.account;
  let quantity = action.data.quantity.split(' ');
  data.token = quantity[1];
  data.amount = quantity[0];
  data.block_num = action.block_num;
  data.block_time= action.block_time;
  data.trx = action.trx_id;
  data.date = getDateFormat(action.block_time);
  return data;
}

/**
 * check the basics : EOS or TAZ (token_contract, token, minimum amount)
 * then call add function
 * 
 * @param {*} db 
 * @param {*} data 
 */
const addOrderHistory = (db, data) => {
  log.d('========= addOrderHistory ==================');
  log.d(data);

  if (data.token_contract === C.EOSIOTOKEN && data.token === C.TOKEN_EOS && data.amount >= C.BUY_AMOUNT_EOS_MIN) {
    let getAmount = data.amount * C.EOS_TAZCHIP_RATIO;
    data.get_amount = getAmount;
    return orders.add(db, data.date, data.uid, data.token, data.amount, C.TOKEN_TAZCHIP, getAmount, data.trx).pipe(map(() => data));
  } else if (data.token_contract === C.TAZTOKENBASE && data.token === C.TOKEN_TAZ && data.amount >= C.BUY_AMOUNT_TAZ_MIN) {
    let getAmount = data.amount * C.TAZ_TAZCHIP_RATIO;
    data.get_amount = getAmount;
    return orders.add(db, data.date, data.uid, data.token, data.amount, C.TOKEN_TAZCHIP, getAmount, data.trx).pipe(map(() => data));
  } else {
    data.get_amount = 0;
    return of(data);
  }
}

/**
 * recorder writes order histories into DB
 */
process.on('message', (action) => {
  log.i('=========================== recorder activated ==============================');
  log.i(action);

  const db = new Database();
  const data = initData(action);
  try {
    db.connect().pipe(
      flatMap(() => addOrderHistory(db, data)),
      finalize(() => db.release())
    ).subscribe(
      data => {
        log.d('=================== Report ==================================');
        log.d(data);
        log.i(data);
      },
      error => {
        log.e('=================== Rx Error ==================================');
        log.e(data);
        log.e(error);
        log.e(error.message);
      },
      () => {
        log.d('===========================================================');
      }
    )
  } catch(error) {
    log.e('=================== Try-Catch Error ==================================');
    log.e(error);
    log.e(error.message);
  }
});
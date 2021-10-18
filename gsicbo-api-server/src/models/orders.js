'use strict'

/**
 * Read all order hitories of the user
 * 
 * @param {*} db 
 * @param {*} account user_id
 */
const get = (db, account) => {
  return db.query('SELECT account, pay_token, pay_amount, get_token, get_amount, created FROM order_histories where account=? ORDER BY created DESC;', [account]);
}

/**
 * Calculate the sum of EOS which is sold on the date (all users)
 * 
 * @param {*} db 
 * @param {*} date ex: 20191231
 */
const getEosProfit = (db, date) => {
  return db.query('SELECT sum(pay_amount) AS profit FROM order_histories where date=? AND pay_token="EOS";', [date]);
}

export default {
  get,
  getEosProfit
}
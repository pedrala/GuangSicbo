'use strict'
import log from '../logger'

/**
 * insert new order into order histories (store)
 * 
 * @param {*} db 
 * @param {*} date 
 * @param {*} account 
 * @param {*} pay_token 
 * @param {*} pay_amount 
 * @param {*} get_token 
 * @param {*} get_amount 
 * @param {*} trx 
 */
const add = (db, date, account, pay_token, pay_amount, get_token, get_amount, trx) => {
  return db.query('INSERT IGNORE INTO order_histories (date, account, pay_token, pay_amount, get_token, get_amount, trx) VALUES (?,?,?,?,?,?,?);', [date, account, pay_token, pay_amount, get_token, get_amount, trx]);
}

export default {
  add
}

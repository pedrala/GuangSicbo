'use strict'
import log from '../logger'

/**
 * update the user's daily bets and prizes (add)
 * @param {*} db 
 * @param {*} date 
 * @param {*} account 
 * @param {*} bet 
 * @param {*} prize 
 */
const addOrUpdate = (db, date, account, bet, prize) => {
  return db.query('INSERT INTO leaders (date, account, daily_bets, daily_prizes) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE daily_bets=daily_bets+?, daily_prizes=daily_prizes+?;',
    [date, account, bet, prize, bet, prize]);
}

export default {
  addOrUpdate
}
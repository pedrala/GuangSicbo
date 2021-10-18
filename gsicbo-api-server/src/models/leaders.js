'use strict'

/**
 * Read users on the leaderboard
 * 
 * @param {*} db 
 * @param {integer} date ex: 20191231
 * @param {string} code bet or prize
 * @param {integer} nmax number of users
 */
const get = (db, date, code, nmax) => {
  return db.query(`SELECT date, account, daily_bets, daily_prizes FROM leaders WHERE date=? ORDER BY ${code} DESC LIMIT ?;`, [date, nmax]);
}

/**
 * Read user's daily bet and prize information
 * 
 * @param {*} db 
 * @param {integer} date ex: 20191231
 * @param {string} account user_id
 */
const getUser = (db, date, account) => {
  return db.query(`SELECT date, account, daily_bets, daily_prizes FROM leaders WHERE date=? AND account=?;`, [date, account]);
}

export default {
  get,
  getUser
}
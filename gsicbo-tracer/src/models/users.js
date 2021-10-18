'use strict'
import log from '../logger'

/**
 * add new user into DB
 * 
 * @param {*} db 
 * @param {*} account 
 */
const add = (db, account) => {
  return db.query('INSERT INTO users (account) VALUES (?);', [account]);
}

/**
 * read user info
 * 
 * @param {*} db 
 * @param {*} account 
 */
const get = (db, account) => {
  return db.query('SELECT account, vip, accumulated_bet, accumulated_prize, staked, unstaking, unstaking_requested, signup_reward FROM users WHERE account=?;', [account]);
}

/**
 * update user info especially related to vip info
 * 
 * @param {*} db 
 * @param {*} account 
 * @param {*} newVip 
 * @param {*} newBet 
 * @param {*} newPrize 
 */
const addOrUpdateVip = (db, account, newVip, newBet, newPrize) => {
  return db.query('INSERT INTO users (account, vip, accumulated_bet, accumulated_prize) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE vip=?, accumulated_bet=?, accumulated_prize=?;',
    [account, newVip, newBet, newPrize, newVip, newBet, newPrize]);
}

/**
 * update user info especially related to staking info
 * 
 * @param {*} db 
 * @param {*} account 
 * @param {*} staked 
 * @param {*} unstaking 
 * @param {*} unstaking_requested 
 */
const addOrUpdateStaking = (db, account, staked, unstaking, unstaking_requested) => {
  return db.query('INSERT INTO users (account, staked, unstaking, unstaking_requested) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE staked=?, unstaking=?, unstaking_requested=?;',
    [account, staked, unstaking, unstaking_requested, staked, unstaking, unstaking_requested]);
}

export default {
  add,
  get,
  addOrUpdateVip,
  addOrUpdateStaking
}

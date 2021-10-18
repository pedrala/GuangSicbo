'use strict'

import { flatMap } from "rxjs/operators";

/**
 * Read users
 * 
 * @param {*} db
 * @param {string} account user_id
 */
const get = (db, account) => {
  if (account)
    return db.query('SELECT * FROM users WHERE account=?;', [account]);
  return db.query('SELECT * FROM users;', []);
}

/**
 * Insert new user
 * 
 * @param {*} db 
 * @param {string} account user_id
 */
const add = (db, account) => {
  return db.query('INSERT INTO users (`account`) VALUES (?);', [account]).pipe(
    flatMap(() => db.query('SELECT * FROM users WHERE account=?;', [account]))
  );
}

/**
 * Update signup_reward status
 * 
 * @param {*} db 
 * @param {string} account user_id
 * @param {integer} status 0:not yet, 1:rewarded
 */
const setSignupRewardStaus = (db, account, status) => {
  return db.query('UPDATE users SET signup_reward=? WHERE account=?;', [status, account]);
}

/**
 * Update unstaking status
 * 
 * @param {*} db 
 * @param {string} account user_id
 * @param {number} unstaking
 * @param {integer} unstaking_requested unixtime
 */
const updateUnstaking = (db, account, unstaking, unstaking_requested) => {
  return db.query('UPDATE users SET unstaking=?, unstaking_requested=? WHERE account=?;', [unstaking, unstaking_requested, account]);
}

export default {
  get,
  add,
  setSignupRewardStaus,
  updateUnstaking
}
'use strict'

import log from '../logger'

/**
 * update total staking status with date
 * 
 * @param {*} db 
 * @param {*} date 
 * @param {*} staked 
 * @param {*} unstaking 
 */
const addOrUpdateTotal = (db, date, staked, unstaking) => {
  return db.query('INSERT INTO taz_total_stakings (date, staked, unstaking) values (?,?,?) ON DUPLICATE KEY UPDATE staked=?, unstaking=?;',
    [date, staked, unstaking, staked, unstaking]);
}

/**
 * read the user's staking status (recent first)
 * 
 * @param {*} db 
 * @param {*} account 
 */
const getUserStakings = (db, account) => {
  return db.query('SELECT date, account, staked FROM taz_user_stakings WHERE account=? ORDER BY date DESC;',[account]);
}

/**
 * update the users' staking status with date
 * @param {*} db 
 * @param {*} date 
 * @param {*} account 
 * @param {*} staked 
 */
const addOrUpdateUser = (db, date, account, staked) => {
  return db.query('INSERT INTO taz_user_stakings (date, account, staked) values (?,?,?) ON DUPLICATE KEY UPDATE staked=?;',
  [date, account, staked, staked]);
}

/**
 * remove unnecessary user's staking data from DB (we need at most 2 days' data)
 * @param {*} db 
 * @param {*} account 
 * @param {*} dates 
 */
const removeManyUsers = (db, account, dates) => {
  return db.query('DELETE FROM taz_user_stakings WHERE account=? AND date IN (?);', [account, dates]);
}

export default {
  addOrUpdateTotal,
  getUserStakings,
  addOrUpdateUser,
  removeManyUsers
}
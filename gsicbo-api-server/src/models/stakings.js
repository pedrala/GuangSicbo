'use strict'

/**
 * Current TAZ total staking
 * 
 * @param {*} db 
 */
const getCurrentTazTotalStakings = (db) => {
  return db.query('SELECT date, staked, unstaking FROM taz_total_stakings ORDER BY date DESC LIMIT 1;', []);
}

export default {
  getCurrentTazTotalStakings
}
'use strict'
import log from '../logger'

/**
 * read the current status of token mining
 * 
 * @param {*} db 
 * @param {*} token 
 */
const get = (db, token) => {
  return db.query('SELECT token, stage, mined FROM minings WHERE token=?;', [token]);
}

/**
 * update the status of token mining
 * 
 * @param {*} db 
 * @param {*} token 
 * @param {*} newStage 
 * @param {*} newMined 
 */
const mine = (db, token, newStage, newMined) => {
  return db.query('INSERT INTO minings (token, stage, mined) VALUES (?,?,?) ON DUPLICATE KEY UPDATE stage=?, mined=?;',
    [token, newStage, newMined, newStage, newMined]);
}

export default {
  get,
  mine
}

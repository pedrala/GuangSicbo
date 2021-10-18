'use strict'

/**
 * Read game
 * 
 * @param {*} db 
 * @param {integer} gid game_id
 * @param {string} account user_id (optional)
 */
const get = (db, gid, account) => {
  if (account)
    return db.query('SELECT id, uid, seed, card1, card2, expired, revealed, status FROM games WHERE id=? AND uid=?;', [gid, account]);
  return db.query('SELECT id, uid, seed, card1, card2, expired, revealed, status FROM games WHERE id=?;', [gid]);
}

/**
 * Insert new game
 * 
 * @param {*} db 
 * @param {string} account user_id
 * @param {string} seed random seed
 * @param {integer} expired game expiry time
 */
const add = (db, account, seed, expired) => {
  return db.query('INSERT INTO games(uid, seed, expired, revealed) VALUES( ? , ? , ?, 0);', [account, seed, expired]);
}

/**
 * Read recent games (only revealed)
 * 
 * @param {*} db 
 * @param {string} account user_id
 * @param {integer} limit number of games
 */
const getRevealedByAccountWithLimit = (db, account, limit) => {
  if (account)
    return db.query('SELECT * FROM games WHERE uid=? AND card1>-1 ORDER BY id DESC LIMIT ?;', [account, limit]);
  return db.query('SELECT * FROM games WHERE card1>-1 ORDER BY id DESC LIMIT ?;', [limit]);
}

/**
 * Read bet info with game_id
 * 
 * @param {*} db 
 * @param {integer} gid game_id
 */
const getBetsByGid = (db, gid) => {
  return db.query('SELECT * FROM bets WHERE gid=? ORDER BY position ASC;', [gid]);
}

export default {
  get,
  add,
  getRevealedByAccountWithLimit,
  getBetsByGid
}
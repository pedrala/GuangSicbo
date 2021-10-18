'use strict'
import log from '../logger'

/**
 * read game with game id and account(optinal)
 * 
 * @param {*} db 
 * @param {*} gid game id
 * @param {*} account 
 */
const get = (db, gid, account) => {
  if (account)
    return db.query('SELECT id, uid, seed, card1, card2, status, expired, revealed, ref, bet_block, reveal_block, bet_trx, reveal_trx FROM games WHERE id=? AND uid=?;', [gid, account]);
  return db.query('SELECT id, uid, seed, card1, card2, status, expired, revealed, ref, bet_block, reveal_block, bet_trx, reveal_trx FROM games WHERE id=?;', [gid]);
}

/**
 * update game information with game id
 * all revealed info will be written
 * 
 * @param {*} db 
 * @param {*} gid 
 * @param {*} card1 
 * @param {*} card2 
 * @param {*} bet_total 
 * @param {*} prize_total 
 * @param {*} status 
 * @param {*} revealed 
 * @param {*} ref 
 * @param {*} bet_block 
 * @param {*} reveal_block 
 * @param {*} bet_trx 
 * @param {*} reveal_trx 
 */
const update = (db, gid, card1, card2, bet_total, prize_total, status, revealed, ref, bet_block, reveal_block, bet_trx, reveal_trx) => {
  return db.query('UPDATE games SET card1=?, card2=?, bet_total=?, prize_total=?, status=?, revealed=?, ref=?, bet_block=?, reveal_block=?, bet_trx=?, reveal_trx=? WHERE id=?;',
  [card1, card2, bet_total, prize_total, status, revealed, ref, bet_block, reveal_block, bet_trx, reveal_trx, gid]);
}

/**
 * insert detailed bet info with game id
 * several rows will be written
 * 
 * @param {*} db 
 * @param {*} gid 
 * @param {*} bets 
 */
const bet = (db, gid, bets) => {
  // log.d("gid = " + gid + ", bets = " + JSON.stringify(bets));
  const params = [];
  for (let i = 0; i < bets.length; i++) {
    let win = bets[i].prize > 0 ? 1 : 0;
    params.push([gid, bets[i].position, bets[i].amount, win, bets[i].prize]);
  }
  return db.query('INSERT INTO bets (gid, position, amount, win, payout) VALUES ? ON DUPLICATE KEY UPDATE amount=values(amount), win=values(win), payout=values(payout);', [params]);
}

export default {
  get,
  update,
  bet
}
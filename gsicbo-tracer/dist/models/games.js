'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logger = _interopRequireDefault(require("../logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const get = (db, gid, account) => {
  if (account) return db.query('SELECT id, uid, seed, card1, card2, status, expired, revealed, ref, bet_block, reveal_block, bet_trx, reveal_trx FROM games WHERE id=? AND uid=?;', [gid, account]);
  return db.query('SELECT id, uid, seed, card1, card2, status, expired, revealed, ref, bet_block, reveal_block, bet_trx, reveal_trx FROM games WHERE id=?;', [gid]);
};

const update = (db, gid, card1, card2, bet_total, prize_total, status, revealed, ref, bet_block, reveal_block, bet_trx, reveal_trx) => {
  return db.query('UPDATE games SET card1=?, card2=?, bet_total=?, prize_total=?, status=?, revealed=?, ref=?, bet_block=?, reveal_block=?, bet_trx=?, reveal_trx=? WHERE id=?;', [card1, card2, bet_total, prize_total, status, revealed, ref, bet_block, reveal_block, bet_trx, reveal_trx, gid]);
};

const bet = (db, gid, bets) => {
  // log.d("gid = " + gid + ", bets = " + JSON.stringify(bets));
  const params = [];

  for (let i = 0; i < bets.length; i++) {
    let win = bets[i].prize > 0 ? 1 : 0;
    params.push([gid, bets[i].position, bets[i].amount, win, bets[i].prize]);
  }

  return db.query('INSERT INTO bets (gid, position, amount, win, payout) VALUES ? ON DUPLICATE KEY UPDATE amount=values(amount), win=values(win), payout=values(payout);', [params]);
};

var _default = {
  get,
  update,
  bet
};
exports.default = _default;
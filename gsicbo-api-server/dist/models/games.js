'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const get = (db, gid, account) => {
  if (account) return db.query('SELECT id, uid, seed, card1, card2, expired, revealed, status FROM games WHERE id=? AND uid=?;', [gid, account]);
  return db.query('SELECT id, uid, seed, card1, card2, expired, revealed, status FROM games WHERE id=?;', [gid]);
};

const add = (db, account, seed, expired) => {
  return db.query('INSERT INTO games(uid, seed, expired, revealed) VALUES( ? , ? , ?, 0);', [account, seed, expired]);
};

const getRevealedByAccountWithLimit = (db, account, limit) => {
  if (account) return db.query('SELECT * FROM games WHERE uid=? AND card1>-1 ORDER BY id DESC LIMIT ?;', [account, limit]);
  return db.query('SELECT * FROM games WHERE card1>-1 ORDER BY id DESC LIMIT ?;', [limit]);
};

const getBetsByGid = (db, gid) => {
  return db.query('SELECT * FROM bets WHERE gid=? ORDER BY position ASC;', [gid]);
};

var _default = {
  get,
  add,
  getRevealedByAccountWithLimit,
  getBetsByGid
};
exports.default = _default;
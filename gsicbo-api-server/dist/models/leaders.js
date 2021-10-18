'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const get = (db, date, code, nmax) => {
  return db.query(`SELECT date, account, daily_bets, daily_prizes FROM leaders WHERE date=? ORDER BY ${code} DESC LIMIT ?;`, [date, nmax]);
};

const getUser = (db, date, account) => {
  return db.query(`SELECT date, account, daily_bets, daily_prizes FROM leaders WHERE date=? AND account=?;`, [date, account]);
};

var _default = {
  get,
  getUser
};
exports.default = _default;
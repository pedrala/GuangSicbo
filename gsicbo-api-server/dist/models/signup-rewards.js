'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const get = (db, account, status) => {
  return db.query('SELECT * FROM signup_rewards WHERE account=? AND status=?;', [account, status]);
};

const add = (db, account) => {
  return db.query('INSERT INTO signup_rewards (`account`) VALUES (?);', [account]);
};

const set = (db, id, status) => {
  return db.query('UPDATE signup_rewards SET status=? WHERE id=?;', [status, id]);
};

var _default = {
  get,
  add,
  set
};
exports.default = _default;
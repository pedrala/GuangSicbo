'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _operators = require("rxjs/operators");

/**
 * 
 * @param {Database} db
 * @param {String} account
 * @returns {Observable<Users>}
 */
const get = (db, account) => {
  if (account) return db.query('SELECT * FROM users WHERE account=?;', [account]);
  return db.query('SELECT * FROM users;', []);
};
/**
 * 
 * @param {*} db 
 * @param {String} account
 * @returns { Observable < Users > }
 */


const add = (db, account) => {
  return db.query('INSERT INTO users (`account`) VALUES (?);', [account]).pipe((0, _operators.flatMap)(() => db.query('SELECT * FROM users WHERE account=?;', [account])));
};
/**
 * 
 * @param {*} db 
 * @param {String} account
 * @param {number} status
 * @returns { Observable < Users > }
 */


const setSignupRewardStaus = (db, account, status) => {
  return db.query('UPDATE users SET signup_reward=? WHERE account=?;', [status, account]);
};
/**
 * 
 * @param {*} db 
 * @param {String} account
 * @param {number} unstaking
 * @param {number} unstaking_requested
 * @returns { Observable < Users > }
 */


const updateUnstaking = (db, account, unstaking, unstaking_requested) => {
  return db.query('UPDATE users SET unstaking=?, unstaking_requested=? WHERE account=?;', [unstaking, unstaking_requested, account]);
};

var _default = {
  get,
  add,
  setSignupRewardStaus,
  updateUnstaking
};
exports.default = _default;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const get = (db, account) => {
  return db.query('SELECT account, pay_token, pay_amount, get_token, get_amount, created FROM order_histories where account=? ORDER BY created DESC;', [account]);
};

const getEosProfit = (db, date) => {
  return db.query('SELECT sum(pay_amount) AS profit FROM order_histories where date=? AND pay_token="EOS";', [date]);
};

var _default = {
  get,
  getEosProfit
};
exports.default = _default;
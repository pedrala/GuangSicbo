'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logger = _interopRequireDefault(require("../logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const add = (db, date, account, pay_token, pay_amount, get_token, get_amount, trx) => {
  return db.query('INSERT IGNORE INTO order_histories (date, account, pay_token, pay_amount, get_token, get_amount, trx) VALUES (?,?,?,?,?,?,?);', [date, account, pay_token, pay_amount, get_token, get_amount, trx]);
};

var _default = {
  add
};
exports.default = _default;
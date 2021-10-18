'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logger = _interopRequireDefault(require("../logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const addOrUpdate = (db, date, account, bet, prize) => {
  return db.query('INSERT INTO leaders (date, account, daily_bets, daily_prizes) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE daily_bets=daily_bets+?, daily_prizes=daily_prizes+?;', [date, account, bet, prize, bet, prize]);
};

var _default = {
  addOrUpdate
};
exports.default = _default;
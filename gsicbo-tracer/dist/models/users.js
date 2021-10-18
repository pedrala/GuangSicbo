'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logger = _interopRequireDefault(require("../logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const add = (db, account) => {
  return db.query('INSERT INTO users (account) VALUES (?);', [account]);
};

const get = (db, account) => {
  return db.query('SELECT account, vip, accumulated_bet, accumulated_prize, staked, unstaking, unstaking_requested, signup_reward FROM users WHERE account=?;', [account]);
};

const addOrUpdateVip = (db, account, newVip, newBet, newPrize) => {
  return db.query('INSERT INTO users (account, vip, accumulated_bet, accumulated_prize) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE vip=?, accumulated_bet=?, accumulated_prize=?;', [account, newVip, newBet, newPrize, newVip, newBet, newPrize]);
};

const addOrUpdateStaking = (db, account, staked, unstaking, unstaking_requested) => {
  return db.query('INSERT INTO users (account, staked, unstaking, unstaking_requested) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE staked=?, unstaking=?, unstaking_requested=?;', [account, staked, unstaking, unstaking_requested, staked, unstaking, unstaking_requested]);
};

var _default = {
  add,
  get,
  addOrUpdateVip,
  addOrUpdateStaking
};
exports.default = _default;
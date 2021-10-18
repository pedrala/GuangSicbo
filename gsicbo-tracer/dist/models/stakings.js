'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logger = _interopRequireDefault(require("../logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const addOrUpdateTotal = (db, date, staked, unstaking) => {
  return db.query('INSERT INTO taz_total_stakings (date, staked, unstaking) values (?,?,?) ON DUPLICATE KEY UPDATE staked=?, unstaking=?;', [date, staked, unstaking, staked, unstaking]);
};

const getUserStakings = (db, account) => {
  return db.query('SELECT date, account, staked FROM taz_user_stakings WHERE account=? ORDER BY date DESC;', [account]);
};

const addOrUpdateUser = (db, date, account, staked) => {
  return db.query('INSERT INTO taz_user_stakings (date, account, staked) values (?,?,?) ON DUPLICATE KEY UPDATE staked=?;', [date, account, staked, staked]);
};

const removeManyUsers = (db, account, dates) => {
  return db.query('DELETE FROM taz_user_stakings WHERE account=? AND date IN (?);', [account, dates]);
};

var _default = {
  addOrUpdateTotal,
  getUserStakings,
  addOrUpdateUser,
  removeManyUsers
};
exports.default = _default;
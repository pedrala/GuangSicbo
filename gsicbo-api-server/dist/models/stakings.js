'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const getCurrentTazTotalStakings = db => {
  return db.query('SELECT date, staked, unstaking FROM taz_total_stakings ORDER BY date DESC LIMIT 1;', []);
};

var _default = {
  getCurrentTazTotalStakings
};
exports.default = _default;
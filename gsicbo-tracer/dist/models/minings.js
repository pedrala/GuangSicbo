'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logger = _interopRequireDefault(require("../logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const get = (db, token) => {
  return db.query('SELECT token, stage, mined FROM minings WHERE token=?;', [token]);
};

const mine = (db, token, newStage, newMined) => {
  return db.query('INSERT INTO minings (token, stage, mined) VALUES (?,?,?) ON DUPLICATE KEY UPDATE stage=?, mined=?;', [token, newStage, newMined, newStage, newMined]);
};

var _default = {
  get,
  mine
};
exports.default = _default;
'use strict';

var _logger = _interopRequireDefault(require("./logger"));

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _db = _interopRequireDefault(require("./db"));

var _orders = _interopRequireDefault(require("./models/orders"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getDateFormat = unixtime => {
  return _momentTimezone.default.tz(new Date(unixtime * 1000), 'Asia/Shanghai').format('YYYYMMDD'); // YYYY-MM-DD HH:mm:ss
};

const initData = action => {
  let data = {};
  data.uid = action.data.from;
  data.token_contract = action.account;
  let quantity = action.data.quantity.split(' ');
  data.token = quantity[1];
  data.amount = quantity[0];
  data.block_num = action.block_num;
  data.block_time = action.block_time;
  data.trx = action.trx_id;
  data.date = getDateFormat(action.block_time);
  return data;
};

const addOrderHistory = (db, data) => {
  _logger.default.d('========= addOrderHistory ==================');

  _logger.default.d(data);

  if (data.token_contract === _config.default.EOSIOTOKEN && data.token === _config.default.TOKEN_EOS && data.amount >= _config.default.BUY_AMOUNT_EOS_MIN) {
    let getAmount = data.amount * _config.default.EOS_TAZCHIP_RATIO;
    data.get_amount = getAmount;
    return _orders.default.add(db, data.date, data.uid, data.token, data.amount, _config.default.TOKEN_TAZCHIP, getAmount, data.trx).pipe((0, _operators.map)(() => data));
  } else if (data.token_contract === _config.default.TAZTOKENBASE && data.token === _config.default.TOKEN_TAZ && data.amount >= _config.default.BUY_AMOUNT_TAZ_MIN) {
    let getAmount = data.amount * _config.default.TAZ_TAZCHIP_RATIO;
    data.get_amount = getAmount;
    return _orders.default.add(db, data.date, data.uid, data.token, data.amount, _config.default.TOKEN_TAZCHIP, getAmount, data.trx).pipe((0, _operators.map)(() => data));
  } else {
    data.get_amount = 0;
    return (0, _rxjs.of)(data);
  }
};

process.on('message', action => {
  _logger.default.d('=========================== recorder activated ==============================');

  _logger.default.d(action);

  const db = new _db.default();
  const data = initData(action);

  try {
    db.connect().pipe((0, _operators.flatMap)(() => addOrderHistory(db, data)), (0, _operators.finalize)(() => db.release())).subscribe(data => {
      _logger.default.d('=================== Report ==================================');

      _logger.default.d(data);

      _logger.default.i(data);
    }, error => {
      _logger.default.e('=================== Rx Error ==================================');

      _logger.default.e(data);

      _logger.default.e(error.message);
    }, () => {
      _logger.default.d('===========================================================');
    });
  } catch (error) {
    _logger.default.e('=================== Try-Catch Error ==================================');

    _logger.default.e(error.message);
  }
});
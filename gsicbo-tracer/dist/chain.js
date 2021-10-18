'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBlock = exports.getInfo = void 0;

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _request = _interopRequireDefault(require("request"));

var _logger = _interopRequireDefault(require("./logger"));

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 무작위로 RPC endpoint를 선택한다.
 */
const LAST_INDEX = process.env.CHAIN_RPC_GROUP === 0 ? _config.default.LOCAL_CHAIN_RPC_GROUP.length : _config.default.MAIN_CHAIN_RPC_GROUP.length;

const rpcEndpoint = () => {
  if (process.env.NODE_ENV === 0) return _config.default.LOCAL_CHAIN_RPC_GROUP[Math.floor(Math.random() * LAST_INDEX)];else return _config.default.MAIN_CHAIN_RPC_GROUP[Math.floor(Math.random() * LAST_INDEX)];
};
/**
 * 체인의 현재 상태를 조회한다.
 */


const getInfo = () => new _rxjs.Observable(observer => {
  let endpoint = rpcEndpoint();
  const options = {
    method: 'POST',
    url: `${endpoint}/v1/chain/get_info`,
    headers: {
      'content-type': 'application/json'
    },
    body: {},
    json: true
  };
  (0, _request.default)(options, function (error, response, body) {
    if (error) {
      _logger.default.d(`${endpoint} / ${error.message}`);

      return observer.error({
        code: 0x8000,
        message: `${error.code} / ${error.message}`
      });
    }

    observer.next(body);
    observer.complete();
  });
}).pipe((0, _operators.retryWhen)(error => error.pipe((0, _operators.delay)(500))));
/**
 * 블록 정보를 조회한다.
 */


exports.getInfo = getInfo;

const getBlock = blockNumber => new _rxjs.Observable(observer => {
  let endpoint = rpcEndpoint();
  const options = {
    method: 'POST',
    url: `${endpoint}/v1/chain/get_block`,
    headers: {
      'content-type': 'application/json'
    },
    body: {
      block_num_or_id: `${blockNumber}`
    },
    json: true
  };
  (0, _request.default)(options, function (error, response, body) {
    if (error) {
      _logger.default.d(`${blockNumber} / ${endpoint} / ${error.message}`);

      return observer.error({
        code: 0x8000,
        message: `${error.code} / ${error.message}`
      });
    }

    if (!body.timestamp) {
      return observer.error({
        code: 0x8000,
        message: `Invalid block data`
      });
    }

    observer.next(body);
    observer.complete();
  });
}).pipe((0, _operators.retryWhen)(error => error.pipe((0, _operators.delay)(500))));

exports.getBlock = getBlock;
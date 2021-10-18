'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _child_process = require("child_process");

var _logger = _interopRequireDefault(require("./logger"));

var _chain = require("./chain");

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let dealer = (0, _child_process.fork)(`${__dirname}/dealer.js`);
dealer.on('message', game => {
  chipper.send(game);
});
dealer.on('close', () => {
  _logger.default.e('close child dealer');

  process.exit(0);
});
let chipper = (0, _child_process.fork)(`${__dirname}/chipper.js`);
chipper.on('close', () => {
  _logger.default.e('close child chipper');

  process.exit(0);
});
let staker = (0, _child_process.fork)(`${__dirname}/staker.js`);
chipper.on('close', () => {
  _logger.default.e('close child staker');

  process.exit(0);
});
let recorder = (0, _child_process.fork)(`${__dirname}/recorder.js`);
chipper.on('close', () => {
  _logger.default.e('close child recorder');

  process.exit(0);
});
let lastDownloadTime = Math.floor(new Date().getTime() / 1000);
/**
 * 
 */

const getTargetBlocks = () => {
  return new _rxjs.Observable(observer => {
    let now = Math.floor(new Date().getTime() / 1000);
    let wait = lastDownloadTime + 500 - now;
    lastDownloadTime = now;
    observer.next(wait);
    observer.complete();
  }).pipe((0, _operators.concatMap)(wait => {
    if (wait <= 0) {
      return (0, _chain.getInfo)();
    }

    return (0, _rxjs.of)(wait).pipe((0, _operators.delay)(wait), (0, _operators.flatMap)(() => (0, _chain.getInfo)()));
  }));
};
/**
 * 
 * @param {Number} start 
 * @param {Number} end 
 */


const downloadBlock = (start, end) => {
  _logger.default.d(`download blocks: ${start} ~ ${end}`);

  return new _rxjs.Observable(observer => {
    const blocks = [];

    for (let i = start; i <= end; i++) {
      blocks.push(i);
    }

    if (blocks.length <= 0) {
      observer.complete();
    } else {
      (0, _rxjs.from)(blocks).pipe((0, _operators.concatMap)(block => (0, _chain.getBlock)(block))).subscribe(block => {
        observer.next(block);
      }, err => {
        _logger.default.e('==== downloadBlock error ====');

        _logger.default.e(err);
      }, () => {
        observer.complete();
      });
    }
  });
};
/**
 * 
 * @param {Object} block 
 */


const extractTransactions = block => {
  // log.d('============== extractTransactions ===============');
  // log.d(block);
  let block_time;
  let block_timestamp = block.timestamp;

  if (block_timestamp[block_timestamp.length - 1] != 'Z') {
    block_timestamp += 'Z';
  }

  block_time = Math.floor(new Date(block_timestamp).getTime() / 1000);

  if (block.transactions.length) {
    return (0, _rxjs.from)(block.transactions).pipe((0, _operators.map)(trx => {
      trx.block_num = block.block_num;
      trx.block_time = block_time;
      return trx;
    }));
  }

  return (0, _rxjs.of)({
    block_num: block.block_num,
    block_time: block_time
  });
};
/**
 * 
 * @param {Object} trx 
 */


const extractActions = trx => {
  // log.d('============== extractActions ===============');
  // log.d(trx);
  if (trx.status === 'executed' && trx.trx.id && trx.trx.transaction.actions.length) {
    return (0, _rxjs.from)(trx.trx.transaction.actions).pipe((0, _operators.map)(action => {
      action.block_num = trx.block_num;
      action.block_time = trx.block_time;
      action.trx_id = trx.trx.id;
      return action;
    }));
  }

  return (0, _rxjs.of)({
    block_num: trx.block_num,
    block_time: trx.block_time,
    trx_id: ''
  });
};
/**
 * 
 */


class Crawler {
  /**
   * 
   */
  constructor() {
    this.blockSubscriber = undefined;
    this.latestBlock = Number.parseInt(process.env.START_BLOCK);
  }
  /**
   * 
   */


  start() {
    _logger.default.i('Crawler Started');

    this.blockSubscriber = getTargetBlocks().pipe((0, _operators.map)(block => {
      let head = block.head_block_num;
      if (this.latestBlock === 0) this.latestBlock = head - 1;
      return Math.min(head, this.latestBlock + _config.default.CRAWLER_N_READ_BLOCK_MAX);
    }), (0, _operators.concatMap)(head => downloadBlock(this.latestBlock + 1, head)), (0, _operators.concatMap)(extractTransactions), (0, _operators.flatMap)(extractActions), (0, _operators.repeat)()).subscribe(action => {
      // log.d('=============================');
      // log.d(action);
      if (action.account === _config.default.TAZTOKENBASE && action.name === 'transfer' && action.data.to === _config.default.TAZGSICBOBET) {
        dealer.send(action);
      } else if (action.account === _config.default.TAZTOKENSTAK && (action.name === 'stake' || action.name === 'unstake')) {
        staker.send(action);
      } else if ((action.account === _config.default.EOSIOTOKEN || action.account === _config.default.TAZTOKENBASE) && action.name === 'transfer' && action.data.to === _config.default.TAZCHIPSTORE) {
        recorder.send(action);
      }

      this.latestBlock = action.block_num;
    }, err => {
      _logger.default.e('==== blockSubscriber error ====');

      _logger.default.e(err);
    });
  }
  /**
   * 
   */


  stop() {
    if (this.blockSubscriber) {
      this.blockSubscriber.unsubscribe();
      this.blockSubscriber = undefined;
    }
  }

}

exports.default = Crawler;
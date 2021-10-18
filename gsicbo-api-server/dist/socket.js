'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _eosjs = require("eosjs");

var _eosjsJssig = require("eosjs/dist/eosjs-jssig");

var _util = require("util");

var _socket = _interopRequireDefault(require("socket.io"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _logger = _interopRequireDefault(require("./libs/logger"));

var _db = _interopRequireDefault(require("./libs/db"));

var _models = require("./models");

var _config = _interopRequireDefault(require("./libs/config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * socket.io connection callback
 */
var _default = (server, gameResults) => {
  // create server
  const io = (0, _socket.default)(server); // EOSIO chain info

  const signatureProvider = new _eosjsJssig.JsSignatureProvider([process.env.MGR_PK]);
  const rpc = new _eosjs.JsonRpc(process.env.CHAIN_RPC, {
    fetch: _nodeFetch.default
  });
  const api = new _eosjs.Api({
    rpc,
    signatureProvider,
    textDecoder: new _util.TextDecoder(),
    textEncoder: new _util.TextEncoder()
  }); // signup reward

  const giveSignupReward = (db, user) => {
    return _models.users.setSignupRewardStaus(db, user.account, 1).pipe((0, _operators.flatMap)(() => new _rxjs.Observable(observer => {
      api.transact({
        actions: [{
          account: _config.default.TAZGAMEHOUSE,
          name: 'transfer',
          authorization: [{
            actor: _config.default.TAZGAMINGMGR,
            permission: 'active'
          }],
          data: {
            user: user.account,
            quantity: _config.default.SIGNUP_REWARD,
            memo: _config.default.SIGNUP_MEMO
          }
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30
      }).then(resp => {
        observer.next(resp);
        observer.complete();
      }).catch(err => observer.error(err));
    })), (0, _operators.catchError)(err => {
      _logger.default.e(err.message);

      return _models.users.setSignupRewardStaus(db, user.account, 0);
    }), (0, _operators.map)(() => user));
  };
  /**
   * Emit user info
   * @param {*} user 
   */


  const updateUser = user => {
    io.to(user.account).emit('account', {
      account: user.account,
      vip: user.vip
    });
  };
  /**
   * Initialize private channel
   * @param { SocketIO.Socket } socket
   */


  const initPrivateChannel = socket => {
    const db = new _db.default();
    const account = socket.handshake.query.name;
    db.connect().pipe((0, _operators.flatMap)(() => _models.users.get(db, account)), (0, _operators.flatMap)(rows => !rows | rows.length < 1 ? _models.users.add(db, account) : (0, _rxjs.of)(rows)), (0, _operators.map)(rows => {
      if (!rows | rows.length < 1) throw new Error('Could not found user.');
      return rows[0];
    }), (0, _operators.flatMap)(user => {
      if (user.signup_reward === 0) {
        return giveSignupReward(db, user);
      }

      return (0, _rxjs.of)(user);
    }), (0, _operators.finalize)(() => db.release())).subscribe(user => {
      // disconnected
      socket.on('disconnect', () => {
        socket.leave(user.account, () => {
          _logger.default.d('private channel was disconnected : ' + user.account);
        });
      });
      socket.join(user.account, () => {
        _logger.default.d('private channel was connected : ' + user.account);

        updateUser(user);
      });
    }, error => {
      _logger.default.e(error);

      socket.emit('system', {
        code: 0x0000,
        message: 'Could not join private channel'
      });
      socket.disconnect();
    }, () => {});
  };
  /**
   * 
   * @param { SocketIO.Socket } socket
   */


  const initPublicChannel = socket => {
    /**
     * on disconnect
     */
    socket.on('disconnect', () => {
      socket.leave('public');

      _logger.default.d('public channel was disconnected');
    });

    _logger.default.d('public channel was connected');

    socket.join('public');
  }; // listen


  io.on('connection', socket => {
    // connection 이벤트를 수신하고도 바로 메시스를 전송할 수 없는 이슈가 발생하여 300ms 후 연결을 처리하도록 수정함
    setTimeout(() => {
      _logger.default.d('connection');

      if (socket.handshake.query.channel === 'private' && socket.handshake.query.name) {
        initPrivateChannel(socket);
      } else if (socket.handshake.query.channel === 'public') {
        initPublicChannel(socket);
      } else {
        if (socket.handshake.query.channel === 'debug') {
          _logger.default.d('debug channel was connected');

          socket.on('log_d', data => _logger.default.d(data));
          socket.on('log_i', data => _logger.default.i(data));
          socket.on('log_e', data => _logger.default.e(data));
        } else {
          socket.emit('err', 'Invalid channel');
          socket.disconnect();

          _logger.default.e('Invalid channel information.');
        }
      }
    }, 300);
  });
  gameResults.subscribe(result => {
    _logger.default.d(result);

    io.to('public').emit('game-result', result);
  });
};

exports.default = _default;
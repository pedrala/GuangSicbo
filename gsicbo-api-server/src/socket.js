'use strict'

import { of, Observable } from 'rxjs';
import { flatMap, finalize, map, catchError } from 'rxjs/operators';
import { Api, JsonRpc, RpcError } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import { TextEncoder, TextDecoder } from 'util';
import SocketIo from 'socket.io';
import fetch from 'node-fetch'

import log from './libs/logger'
import Database from './libs/db';
import { users } from './models';
import C from './libs/config';


/**
 * socket.io connection callback
 */
export default (server, gameResults) => {
  // create server
  const io = SocketIo(server);
  
  // EOSIO chain info
  const signatureProvider = new JsSignatureProvider([process.env.MGR_PK]);
  const rpc = new JsonRpc(process.env.CHAIN_RPC, { fetch });
  const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

  // signup reward
  const giveSignupReward = (db, user) => {
    return users.setSignupRewardStaus(db, user.account, 1).pipe(
      flatMap(() => new Observable(observer => {
        api.transact({
          actions: [{
            account: C.TAZGAMEHOUSE,
            name: 'transfer',
            authorization: [{
              actor: C.TAZGAMINGMGR,
              permission: 'active',
            }],
            data: {
              user: user.account,
              quantity: C.SIGNUP_REWARD,
              memo: C.SIGNUP_MEMO,
            },
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 30,
        }).then(resp => {
          observer.next(resp);
          observer.complete();
        }).catch(err => observer.error(err))
      })),
      catchError((err) => {
        log.e(err.message)
        return users.setSignupRewardStaus(db, user.account, 0)
      }),
      map(() => user)
    )
  }

  /**
   * Emit user info
   * @param {*} user 
   */
  const updateUser = (user) => {
    io.to(user.account).emit('account', {
      account: user.account,
      vip: user.vip
    })
  }

  /**
   * Initialize private channel
   * @param { SocketIO.Socket } socket
   */
  const initPrivateChannel = (socket) => {
    const db = new Database();
    const account = socket.handshake.query.name;

    db.connect().pipe(
      flatMap(() => users.get(db, account)),
      flatMap(rows => (!rows | rows.length < 1) ? users.add(db, account) : of (rows)),
      map(rows => {
        if (!rows | rows.length < 1) throw new Error('Could not found user.')
        return rows[0];
      }),
      flatMap(user => {
        if (user.signup_reward === 0) {
          return giveSignupReward(db, user)
        }
        return of(user);
      }),
      finalize(() => db.release())
    ).subscribe(
      user => {
        // disconnected
        socket.on('disconnect', () => {
          socket.leave(user.account, () => {
            log.d('private channel was disconnected : ' + user.account);
          });
        })

        socket.join(user.account, () => {
          log.d('private channel was connected : ' + user.account);
          updateUser(user);
        });
      },
      error => {
        log.e(error)
        socket.emit('system', { code: 0x0000, message: 'Could not join private channel' });
        socket.disconnect();
      },
      () => {}
    )
  }

  /**
   * 
   * @param { SocketIO.Socket } socket
   */
  const initPublicChannel = (socket) => {
    /**
     * on disconnect
     */
    socket.on('disconnect', () => {
      socket.leave('public');
      log.d('public channel was disconnected');
    })

    log.d('public channel was connected');
    socket.join('public');
  }

  // listen
  io.on('connection', socket => {
    // connection 이벤트를 수신하고도 바로 메시스를 전송할 수 없는 이슈가 발생하여 300ms 후 연결을 처리하도록 수정함
    setTimeout(() => {
      log.d('connection')
      if (socket.handshake.query.channel === 'private' && socket.handshake.query.name) {
        initPrivateChannel(socket);
      } else if (socket.handshake.query.channel === 'public') {
        initPublicChannel(socket);
      } else {
        if (socket.handshake.query.channel === 'debug') {
          log.d('debug channel was connected')
          socket.on('log_d', (data) => log.d(data))
          socket.on('log_i', (data) => log.i(data))
          socket.on('log_e', (data) => log.e(data))
        } else {
          socket.emit('err', 'Invalid channel');
          socket.disconnect();
          log.e('Invalid channel information.')
        }
      }
    }, 300)
  })

  gameResults.subscribe(
    result => {
      log.d(result);
      io.to('public').emit('game-result', result);
    }
  )
}
'use strict'

import { Observable } from 'rxjs';
import { map, retryWhen, delay } from 'rxjs/operators';
import log from './logger';
import C from './config';


import { Api, JsonRpc, RpcError } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import { TextEncoder, TextDecoder } from 'util';
import fetch from 'node-fetch';
import moment from 'moment-timezone';

/**
 * 다수의 endpoint에 대한 JsonRpc와 API객체를 초기화한다.
 */
const isTestnet = () => parseInt(process.env.CHAIN_RPC_GROUP) === 0;
const ENDPOINTS = isTestnet() ? C.LOCAL_CHAIN_RPC_GROUP : C.MAIN_CHAIN_RPC_GROUP;
const LAST_INDEX = ENDPOINTS.length;
const RPCs = [];
const APIs = [];
const signatureProvider = new JsSignatureProvider([process.env.MGR_PK]);
for (let idx = 0; idx < ENDPOINTS.length; idx++) {
  let rpc = new JsonRpc(ENDPOINTS[idx], { fetch });
  RPCs.push(rpc);
  APIs.push(new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() }))
}

/**
 * eosjs JsonRpc 객체를 반환한다.
 */
const getJsonRpc = () => {
  const rpc = RPCs[Math.floor(Math.random() * LAST_INDEX)];
  return rpc;
}

/**
 * eosjs API 객체를 반환한다.
 */
const getApi = () => {
  const api = APIs[Math.floor(Math.random() * LAST_INDEX)];
  return api;
}

/**
 * 현재 시간을 ms 단위로 반환
 */
const getCurrentTime = () => {
  return Math.floor(Date.now() / 1000);
}


/**
 * 체인의 현재 상태를 조회한다.
 */
const getInfo = () => new Observable(observer => {
  const rpc = getJsonRpc();
  log.i(`[ getInfo ] : getJsonRpc = ${rpc.endpoint}`);
  const t1 = getCurrentTime();
  rpc.get_info()
  .then(resp => {
    const t2 = getCurrentTime();
    log.i(`    getInfo resp : getJsonRpc = ${rpc.endpoint}, elapsed = ${t2-t1}ms, head = ${resp.head_block_num}`);
    observer.next(resp);
    observer.complete();
  })
  .catch(error => {
    const t2 = getCurrentTime();
    log.e(`    getInfo error : getJsonRpc = ${rpc.endpoint}, elapsed = ${t2-t1}ms`);
    log.e(error.message);
    observer.error(error)
  });
})
.pipe(
  retryWhen(error => error.pipe(
    delay(10)
  ))
);

/**
 * 블록 정보를 조회한다.
 */
const getBlock = (blockNumber) => new Observable(observer => {
  const rpc = getJsonRpc();
  log.i(`    getBlock : getJsonRpc = ${rpc.endpoint}, block = ${blockNumber}`);
  const t1 = getCurrentTime();
  rpc.get_block(blockNumber)
  .then(resp => {
    const t2 = getCurrentTime();
    if (!resp.timestamp) {
      log.e(`    getBlock error(1) : getJsonRpc = ${rpc.endpoint}, elapsed = ${t2-t1}ms, block = ${blockNumber}, error = noTimestamp`);
      return observer.error({
        code: 0x8000,
        message: `Invalid block data`
      })
    }
    log.i(`    getBlock resp : getJsonRpc = ${rpc.endpoint}, elapsed = ${t2-t1}ms, block = ${blockNumber}`);
    observer.next(resp);
    observer.complete();
  })
  .catch(error => {
    const t2 = getCurrentTime();
    log.e(`    getBlock error(2) : getJsonRpc = ${rpc.endpoint}, elapsed = ${t2-t1}ms, block = ${blockNumber}`);
    log.e(error.message);
    observer.error(error)
  });
})
.pipe(
  retryWhen(error => error.pipe(
    delay(10)
  ))
);

/**
 * from vip payout to vip asset form
 * 
 * @param {*} data 
 */
const assetVip = (data) => {
  return data.vip.payout.toFixed(4) + " " + C.TOKEN_VIP;
}

/**
 * from mining payout to mining asset form
 * 
 * @param {*} data 
 */
const assetMining = (data) => {
  return data.mining.payout.toFixed(4) + " " + C.TOKEN_MINING;
}

/**
 * call payout contract
 * 
 * @param {*} data 
 */
const execPayoutVipMining = (data) => {
  log.d('========= execPayoutVipMining ==================');
  log.d(data);
  let cnt = 0;
  
  return new Observable(observer => {
    const api = getApi();
    log.i(`-------- payvipmining call : api = ${api.rpc.endpoint}, cnt = ${cnt}`);
    const t1 = getCurrentTime();
    api.transact({
      actions: [{
        account: C.TAZGAMEHOUSE,
        name: 'payvipmining',
        authorization: [{
          actor: C.TAZGAMINGMGR,
          permission: 'active',
        }],
        data: {
          game_id: data.game.gid,
          user: data.game.uid,
          type1: C.TYPE_VIP,
          asset1: assetVip(data),
          type2: C.TYPE_MINING,
          asset2: assetMining(data)
        },
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    }).then(resp => {
      const t2 = getCurrentTime();
      log.i(`        payvipmining resp : api = ${api.rpc.endpoint}, elapsed = ${t2-t1}ms ----`);
      // log.d(resp.processed.action_traces[0]);
      observer.next(data);
      observer.complete();
    }).catch(err => {
      const t2 = getCurrentTime();
      log.e(`        payvipmining error : api = ${api.rpc.endpoint}, elapsed = ${t2-t1}ms ----`);
      log.e(err);
      log.e(err.message);
      observer.error(err)
    })
  }).pipe(
    retryWhen(error => error.pipe(
      map(e => {
        cnt++;
        if(cnt >= C.MAX_RETRY) {
          log.e(`cnt = ${cnt}, real error!`);
          throw(e);
        }
        log.e(`cnt = ${cnt}, retry`);
        return e;
      }),
      delay(10)
    ))
  );
}

/**
 * read game info from chain
 * 
 * @param {*} data 
 */
const getBetInfoFromTable = (data) => {
  let cnt = 0;

  return new Observable(observer => {
    const rpc = getJsonRpc();
    log.i(`-------- getBetInfoFromTable call : rpc = ${rpc.endpoint}, cnt = ${cnt}`);
    const t1 = getCurrentTime();
    rpc.get_table_rows({
      "code": C.TAZGSICBOBET,
      "table": "games",
      "scope": `${data.game.gid}`,
      "index_position": "first",
      "key_type": "i64",
      "lower_bound": data.game.uid,
      "upper_bound": data.game.uid,
      "json": true,
      "limit": 10
    }).then(resp => {
      const t2 = getCurrentTime();
      log.i(`    getBetInfoFromTable resp : getJsonRpc = ${rpc.endpoint}, elapsed = ${t2-t1}ms, gid = ${data.game.gid}`);
      observer.next(resp);
      observer.complete();
    }).catch(error => {
      const t2 = getCurrentTime();
      log.e(`    getBetInfoFromTable error : getJsonRpc = ${rpc.endpoint}, elapsed = ${t2-t1}ms, gid = ${data.game.gid}`);
      observer.error(error);
    })
  }).pipe(
    retryWhen(error => error.pipe(
      map(e => {
        cnt++;
        if(cnt >= C.MAX_RETRY) {
          log.e(`cnt = ${cnt}, real error!`);
          throw(e);
        }
        log.e(`cnt = ${cnt}, retry`);
        return e;
      }),
      delay(10)
    ))
  );
}

/**
 * call reveal contract with game id, user, seed
 * response will have info such as cards, prizes, trx_id, etc
 * 
 * @param {*} data 
 */
const reveal = (data) => {
  log.d('===================== reveal ======================');
  log.d(data);
  let cnt = 0;
  
  return new Observable(observer => {
    const api = getApi();
    log.i(`-------- reveal call : api = ${api.rpc.endpoint}`);
    const t1 = getCurrentTime();
    api.transact({
      actions: [{
        account: C.TAZGSICBOREV,
        name: 'reveal',
        authorization: [{
          actor: C.TAZGAMINGMGR,
          permission: 'active',
        }],
        data: {
          game_id: data.game.gid,
          user: data.game.uid,
          seed: data.game.seed
        },
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    }).then(resp => {
      const t2 = getCurrentTime();
      log.i(`        reveal resp : api = ${api.rpc.endpoint}, elapsed = ${t2-t1}ms ----`);
      // log.d(resp);
      log.d(resp.processed.action_traces[0].inline_traces[0].act.data);

      let results = resp.processed.action_traces[0].inline_traces[0].act.data;
      let betResults = JSON.parse(results.bet_info)
      for (let idx in data.game.bets) {
        data.game.bets[idx].prize = betResults[idx][2];
      }
      data.reveal.block_num = resp.processed.block_num;
      data.reveal.block_time = results.reveal_time;
      data.reveal.trx_id = resp.processed.id;

      data.game.cards = JSON.parse(results.cards);
      data.game.bet_total = results.bet_total;
      data.game.prize_total = results.prize_total;

      observer.next(data);
      observer.complete();
    }).catch(err => {
      const t2 = getCurrentTime();
      log.e(`        reveal error : api = ${api.rpc.endpoint}, elapsed = ${t2-t1}ms ----`);
      log.e(err);
      log.e(err.message)

      observer.error(err)
    })
  }).pipe(
    retryWhen(error => error.pipe(
      map(e => {
        cnt++;
        if(cnt >= C.MAX_RETRY) {
          log.e(`cnt = ${cnt}, real error!`);
          throw(e);
        }
        log.e(`cnt = ${cnt}, retry`);
        return e;
      }),
      delay(10)
    ))
  );
}

/**
 * if something's wrong, do not reveal but reject
 * 
 * @param {*} data 
 */

const reject = (data) => {
  log.d('===================== reject ======================');
  log.d(data);
  let cnt = 0;
  
  return new Observable(observer => {
    const api = getApi();
    log.i(`-------- reject call : api = ${api.rpc.endpoint}`);
    const t1 = getCurrentTime();
    api.transact({
      actions: [{
        account: C.TAZGSICBOREV,
        name: 'reject',
        authorization: [{
          actor: C.TAZGAMINGMGR,
          permission: 'active',
        }],
        data: {
          game_id: data.game.gid,
          user: data.game.uid,
          bet_info: data.game.bets,
          hash: data.game.hash,
          time_expire: data.game.expired,
          sig: data.game.sig,
          reason: C.BET_REJECT_REASON
        },
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    }).then(resp => {
      const t2 = getCurrentTime();
      log.i(`        reject resp : api = ${api.rpc.endpoint}, elapsed = ${t2-t1}ms ----`);
      // log.d(JSON.stringify(resp.processed.action_traces[0].act.data));
      let results = resp.processed.action_traces[0].act.data;
      data.game.reason = results.reason;

      observer.next(data);
      observer.complete();
    }).catch(err => {
      const t2 = getCurrentTime();
      log.e(`        reject error : api = ${api.rpc.endpoint}, elapsed = ${t2-t1}ms ----`);
      log.e(err);
      log.e(err.message);

      observer.error(err)
    })
  }).pipe(
    retryWhen(error => error.pipe(
      map(e => {
        cnt++;
        if(cnt >= C.MAX_RETRY) {
          log.e(`cnt = ${cnt}, real error!`);
          throw(e);
        }
        log.e(`cnt = ${cnt}, retry`);
        return e;
      }),
      delay(10)
    ))
  );
}

/**
 * convert unixtime to integer date format (CST)
 * 
 * @param {*} unixtime 
 */
const getDateFormat = (unixtime) => {
  return moment.tz(new Date(unixtime * 1000), 'Asia/Shanghai').format('YYYYMMDD'); // YYYY-MM-DD HH:mm:ss
}

/**
 * read the user's staking status from chain
 * 
 * @param {*} data 
 */
const getUserStakingFromChainTable = (data) => {
  log.d('========= getUserStakingFromChainTable ==================');
  log.d(data);
  let cnt = 0;

  return new Observable(observer => {
    const rpc = getJsonRpc();
    log.i(`-------- getUserStakingFromChainTable call : rpc = ${rpc.endpoint}, cnt = ${cnt}`);
    const t1 = getCurrentTime();
    rpc.get_table_rows({
      "code": C.TAZTOKENSTAK,
      "table": "userinfos",
      "scope": data.uid,
      "index_position": "first",
      "key_type": "i64",
      "lower_bound": C.TOKEN_STAKING,
      "upper_bound": C.TOKEN_STAKING,
      "json": true,
      "limit": 10
    }).then(resp => {
      const t2 = getCurrentTime();
      log.i(`    getUserStakingFromChainTable resp : getJsonRpc = ${rpc.endpoint}, elapsed = ${t2-t1}ms, uid = ${data.uid}`);
      data.user_stakings.chain = resp.rows[0];
      data.user_stakings.chain.staked = data.user_stakings.chain.staked * C.CONTRACT_TO_DB_SCALE;
      data.user_stakings.chain.date = getDateFormat(data.user_stakings.chain.staked_updated);
      data.user_stakings.chain.unstaking = data.user_stakings.chain.unstaking * C.CONTRACT_TO_DB_SCALE;

      observer.next(data);
      observer.complete();
    }).catch(error => {
      const t2 = getCurrentTime();
      log.e(`    getUserStakingFromChainTable error : getJsonRpc = ${rpc.endpoint}, elapsed = ${t2-t1}ms, uid = ${data.uid}`);
      observer.error(error);
    })
  }).pipe(
    retryWhen(error => error.pipe(
      map(e => {
        cnt++;
        if(cnt >= C.MAX_RETRY) {
          log.e(`cnt = ${cnt}, real error!`);
          throw(e);
        }
        log.e(`cnt = ${cnt}, retry`);
        return e;
      }),
      delay(10)
    ))
  );
}

/**
 * read total staking status from chain
 * 
 * @param {*} data 
 */
const getTotalStakingFromChainTable = (data) => {
  log.d('========= getTotalStakingFromChainTable ==================');
  log.d(data);
  let cnt = 0;

  return new Observable(observer => {
    const rpc = getJsonRpc();
    log.i(`-------- getTotalStakingFromChainTable call : rpc = ${rpc.endpoint}, cnt = ${cnt}`);
    const t1 = getCurrentTime();
    rpc.get_table_rows({
      "code": C.TAZTOKENSTAK,
      "table": "stats",
      "scope": C.TAZTOKENSTAK,
      "index_position": "first",
      "key_type": "i64",
      "lower_bound": C.TOKEN_STAKING,
      "upper_bound": C.TOKEN_STAKING,
      "json": true,
      "limit": 10
    }).then(resp => {
      const t2 = getCurrentTime();
      log.i(`    getTotalStakingFromChainTable resp : getJsonRpc = ${rpc.endpoint}, elapsed = ${t2-t1}ms`);
      data.total_stakings.chain = resp.rows[0];
      data.total_stakings.chain.total_staked = data.total_stakings.chain.total_staked * C.CONTRACT_TO_DB_SCALE;
      data.total_stakings.chain.date = getDateFormat(data.total_stakings.chain.staked_updated);
      data.total_stakings.chain.total_unstaking = data.total_stakings.chain.total_unstaking * C.CONTRACT_TO_DB_SCALE;

      observer.next(data);
      observer.complete();
    }).catch(error => {
      const t2 = getCurrentTime();
      log.e(`    getTotalStakingFromChainTable error : getJsonRpc = ${rpc.endpoint}, elapsed = ${t2-t1}ms`);
      observer.error(error);
    })
  }).pipe(
    retryWhen(error => error.pipe(
      map(e => {
        cnt++;
        if(cnt >= C.MAX_RETRY) {
          log.e(`cnt = ${cnt}, real error!`);
          throw(e);
        }
        log.e(`cnt = ${cnt}, retry`);
        return e;
      }),
      delay(10)
    ))
  );
}

export {
  getInfo,
  getBlock,
  execPayoutVipMining,
  getBetInfoFromTable,
  reveal,
  reject,
  getUserStakingFromChainTable,
  getTotalStakingFromChainTable
}
'use strict'

import {
  Observable,
  from,
} from 'rxjs';

import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs2';
import {
  JsonRpc,
  Api
} from 'eosjs';

import { EOS_NETWORK } from './endpoint.js';

const APP_NAME = 'GuangGame';

ScatterJS.plugins(new ScatterEOS());

const network = ScatterJS.Network.fromJson(EOS_NETWORK);

const buildBetData = (account, amount, bets) => {
  return {
    actions: [{
      account: 'taztokenbase',
      name: 'transfer',
      authorization: [{
        actor: account.name,
        permission: account.authority,
      }],
      data: {
        from: account.name,
        to: 'tazgsicbobet',
        quantity: `${amount} TAZCHIP`,
        memo: bets,
      },
    }]
  }
}

/**
 * 블록체인과 통신하기 위한 클래스
 */
export default class Blockchain {
  /**
   * constractor
   */
  constructor() {
    this.rpc = new JsonRpc(network.fullhost());
  }

  /**
   * connect to scatter
   */
  connect() {
    return from(ScatterJS.connect(APP_NAME, {
      network
    }));
  }

  /**
   * Login
   */
  login() {
    return new Observable(observer => {
      ScatterJS.login().then(id => {
        if (!id || !id.accounts || !id.accounts.length) {
          return observer.error(new Error('No identity'));
        }

        const account = id.accounts.find(element => element.blockchain === 'eos')
        if (!account) {
          return observer.error(new Error('No eos account'));
        }

        observer.next(account);
        observer.complete();
      }).catch(error => observer.error(error));
    })
  }

  /**
   * Get user balance
   * 
   * @param { string } contract 
   * @param { string } account 
   * @param { string } token 
   */
  getBalance(contract, account, token) {
    return new Observable(observer => {
      this.rpc.get_currency_balance(contract, account, token)
        .then(bal => {
          observer.next(bal);
          observer.complete();
        })
        .catch(err => {
          observer.error(err);
        })
    })
  }

  /**
   * Get user balance
   * 
   * @param { string } contract 
   * @param { string } account 
   * @param { string } token 
   */
  getEosBalance(account) {
    return new Observable(observer => {
      this.rpc.get_currency_balance('eosio.token', account, 'EOS')
        .then(bal => {
          observer.next(bal);
          observer.complete();
        })
        .catch(err => {
          observer.error(err);
        })
    })
  }

  /**
   * Scatter에 배팅 트랜젝션 생성을 요청한다.
   * 
   * @param {*} account 
   * @param {*} amount 
   * @param {*} memo 
   */
  confirmBetTransaction(account, amount, memo) {
    const eos = ScatterJS.eos(network, Api, {
      rpc: this.rpc,
      beta3: true
    });
    return new Observable(observer => {
      eos.transact(buildBetData(account, amount.toFixed(4), memo), {
        broadcast: false,
        blocksBehind: 4,
        expireSeconds: 30,
      }).then(res => {
        observer.next(res);
        observer.complete();
      }).catch(error => observer.error(error));
    })
  }

  /**
   * 생성된 트랜젝션을 블록체인에 기록한다.
   * @param {*} trx 
   */
  sendBetTransaction(trx) {
    const eos = ScatterJS.eos(network, Api, {
      rpc: this.rpc,
      beta3: true
    });
    
    return new Observable(observer => {
      eos.pushSignedTransaction(trx).then(res => {
        observer.next(res);
        observer.complete();
      }).catch(error => observer.error(error));
    })
  }

  /**
   * 토큰을 전송한다.
   * 
   * @param {*} from 
   * @param {*} to 
   * @param {*} tokenContract 
   * @param {*} quantity 
   */
  transfer(from, to, tokenContract, quantity) {
    const eos = ScatterJS.eos(network, Api, {
      rpc: this.rpc,
      beta3: true
    });

    return new Observable(observer => {
      eos.transact({
        actions: [{
          account: tokenContract,
          name: 'transfer',
          authorization: [{
            actor: from,
            permission: 'active',
          }],
          data: {
            from: from,
            to: to,
            quantity: quantity,
            memo: '',
          },
        }]
      },
      {
        blocksBehind: 4,
        expireSeconds: 30,
      })
      .then(result => {
        observer.next(result);
        observer.complete();
      })
      .catch(error => observer.error(error))
    })
  }

  /**
   * TAZ를 stake 한다.
   * 
   * @param {*} user 
   * @param {*} quantity 
   */
  stake(user, quantity) {
    const eos = ScatterJS.eos(network, Api, {
      rpc: this.rpc,
      beta3: true
    });

    return new Observable(observer => {
      eos.transact({
          actions: [{
            account: 'taztokenstak',
            name: 'stake',
            authorization: [{
              actor: user,
              permission: 'active',
            }],
            data: {
              user: user,
              quantity: quantity
            },
          }]
        }, {
          blocksBehind: 4,
          expireSeconds: 30,
        })
        .then(result => {
          observer.next(result);
          observer.complete();
        })
        .catch(error => observer.error(error))
    })
  }

  /**
   * unstake된 전량을 stake 한다.
   * @param {*} user 
   */
  restake(user) {
    const eos = ScatterJS.eos(network, Api, {
      rpc: this.rpc,
      beta3: true
    });

    return new Observable(observer => {
      eos.transact({
          actions: [{
            account: 'taztokenstak',
            name: 'stake',
            authorization: [{
              actor: user,
              permission: 'active',
            }],
            data: {
              user: user,
              quantity: '0.0000 TAZ'
            },
          }]
        }, {
          blocksBehind: 4,
          expireSeconds: 30,
        })
        .then(result => {
          observer.next(result);
          observer.complete();
        })
        .catch(error => observer.error(error))
    })
  }

  /**
   * 지정된 양만큰 unstake한다.
   * 
   * @param {*} user 
   * @param {*} quantity 
   */
  unstake(user, quantity) {
    const eos = ScatterJS.eos(network, Api, {
      rpc: this.rpc,
      beta3: true
    });

    return new Observable(observer => {
      eos.transact({
          actions: [{
            account: 'taztokenstak',
            name: 'unstake',
            authorization: [{
              actor: user,
              permission: 'active',
            }],
            data: {
              user: user,
              quantity: quantity
            },
          }]
        }, {
          blocksBehind: 4,
          expireSeconds: 30,
        })
        .then(result => {
          observer.next(result);
          observer.complete();
        })
        .catch(error => observer.error(error))
    })
  }
}

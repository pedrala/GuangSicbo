'use strict'

import { of , from, Observable } from 'rxjs';
import { delay, map, repeat, flatMap, concatMap } from 'rxjs/operators'
import { fork } from 'child_process';
import log from './logger'
import { getInfo, getBlock } from './chain'
import C from './config';

/**
 * make child processes : dealer, chipper, staker, recorder
 */
let dealer = fork(`${__dirname}/dealer.js`);
dealer.on('message', (game) => {
  chipper.send(game);  // dealer send msg(game info) to chipper
});
dealer.on('close', () => {
  log.e('close child dealer');
  process.exit(0);
})

let chipper = fork(`${__dirname}/chipper.js`);
chipper.on('close', () => {
  log.e('close child chipper');
  process.exit(0);
})

let staker = fork(`${__dirname}/staker.js`);
staker.on('close', () => {
  log.e('close child staker');
  process.exit(0);
})

let recorder = fork(`${__dirname}/recorder.js`);
recorder.on('close', () => {
  log.e('close child recorder');
  process.exit(0);
})

let lastDownloadTime = Math.floor(new Date().getTime() / 1000);

/**
 * call getInfo
 * if it's too frequent, wait 0.5 sec
 * 
 */
const getTargetBlocks = () => {
  return new Observable(observer => {
    let now = Math.floor(new Date().getTime() / 1000);
    let wait = (lastDownloadTime + 500) - now;
    lastDownloadTime = now;
    observer.next(wait);
    observer.complete();
  }).pipe(
    concatMap(wait => {
      if (wait <= 0) {
        return getInfo();
      }

      return of(wait).pipe(
        delay(wait),
        flatMap(() => getInfo())
      )
    })
  )
}

/**
 * download blocks from chain
 * 
 * @param {Number} start 
 * @param {Number} end 
 */
const downloadBlock = (start, end) => {
  log.i(`    download blocks: ${start} ~ ${end}`);
  return new Observable(observer => {
    const blocks = [];
    for (let i = start; i <= end; i++) {
      blocks.push(i);
    }
    if (blocks.length <= 0) {
      observer.complete();
    } else {
      from(blocks).pipe(
        flatMap(block => getBlock(block))
      ).subscribe(
        block => {
          observer.next(block);
        },
        err => {
          log.e('==== downloadBlock error ====');
          log.e(err);
          log.e(err.message);
        },
        () => {
          observer.complete();
        }
      );
    }
  })
}

/**
 * extract transaction from block
 * 
 * @param {Object} block 
 */
const extractTransactions = (block) => {
  // log.d('============== extractTransactions ===============');
  // log.d(block);

  let block_time;
  let block_timestamp = block.timestamp;
  if (block_timestamp[block_timestamp.length - 1] != 'Z') {
    block_timestamp += 'Z';
  }
  block_time = Math.floor(new Date(block_timestamp).getTime()/1000);

  if (block.transactions.length) {
    return from(block.transactions).pipe(map(trx => {
      trx.block_num = block.block_num;
      trx.block_time = block_time;
      return trx;
    }));
  }
  return of({
    block_num: block.block_num,
    block_time: block_time
   });
}

/**
 * extract action from tranaction
 * only for executed action
 * 
 * @param {Object} trx 
 */
const extractActions = (trx) => {
  // log.d('============== extractActions ===============');
  // log.d(trx);

  if (trx.status === 'executed' && trx.trx.id && trx.trx.transaction.actions.length) {
    return from(trx.trx.transaction.actions).pipe(map(action => {
      action.block_num = trx.block_num;
      action.block_time = trx.block_time;
      action.trx_id = trx.trx.id;
      return action;
    }))
  }
  return of({
    block_num: trx.block_num,
    block_time: trx.block_time,
    trx_id: ''
  });
}

/**
 * Crawler watches blocks and find information related to games
 * After finding info, crawler pass the info to deal, chipper, staker, or recorder
 */
export default class Crawler {
  
  constructor() {
    this.blockSubscriber = undefined;
    this.latestBlock = Number.parseInt(process.env.START_BLOCK);
    this.targetBlock = undefined;
  }

  start() {
    log.i('Crawler Started');
    this.blockSubscriber = getTargetBlocks().pipe(
      map(block => {
        let head = block.head_block_num - C.BLOCK_NUMBER_BUFFER;
        if (this.latestBlock === 0) this.latestBlock = head - 1;  // from the current block
        return Math.min(head, this.latestBlock + C.CRAWLER_N_READ_BLOCK_MAX);  // max N_READ_BLOCK_MAX blocks
      }),
      concatMap(head => {
        this.targetBlock = head;
        return downloadBlock(this.latestBlock + 1, head);
      }),
      concatMap(extractTransactions),
      flatMap(extractActions),
      repeat()
    ).subscribe(
      action => {
        // log.d('=============================');
        // log.d(action);

        if (action.account === C.TAZTOKENBASE
          && action.name === 'transfer'
          && action.data.to === C.TAZGSICBOBET) {
          dealer.send(action);  // initial bet (token transfer)
        } else if (action.account === C.TAZTOKENSTAK
          && (action.name === 'stake' || action.name === 'unstake')) {
          staker.send(action);  // stake or unstake
        } else if ((action.account === C.EOSIOTOKEN || action.account === C.TAZTOKENBASE)
          && action.name === 'transfer'
          && action.data.to === C.TAZCHIPSTORE) {
          recorder.send(action);  // purchase in store
        }

        this.latestBlock = this.targetBlock;
      },
      err => {
        log.e('==== blockSubscriber error ====');
        log.e(err);
        log.e(err.message);
      }
    )
  }

  stop() {
    if (this.blockSubscriber) {
      this.blockSubscriber.unsubscribe();
      this.blockSubscriber = undefined;
    }
  }
}
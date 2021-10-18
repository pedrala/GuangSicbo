'use strict'

import log from './logger'
import { throwError, combineLatest, of } from 'rxjs';
import { finalize, flatMap, map, catchError } from 'rxjs/operators';
import ecc from 'eosjs-ecc';
import fetch from 'node-fetch';
import Database from './db';
import games from './models/games';
import C from './config';
import { getBetInfoFromTable, reveal, reject } from './chain.js';


/**
 * Base62 map
 */
const tblBase62 = {
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  "a": 10, "b": 11, "c": 12, "d": 13, "e": 14, "f": 15, "g": 16, "h": 17, "i": 18,
  "j": 19, "k": 20, "l": 21, "m": 22, "n": 23, "o": 24, "p": 25, "q": 26, "r": 27, 
  "s": 28, "t": 29, "u": 30, "v": 31, "w": 32, "x": 33, "y": 34, "z": 35,
  "A": 36, "B": 37, "C": 38, "D": 39, "E": 40, "F": 41, "G": 42, "H": 43, "I": 44,
  "J": 45, "K": 46, "L": 47, "M": 48, "N": 49, "O": 50, "P": 51, "Q": 52, "R": 53,
  "S": 54, "T": 55, "U": 56, "V": 57, "W": 58, "X": 59, "Y": 60, "Z": 61
}

/**
 * Convert 10 base number from base62 string.
 * @param {string} b62 
 */
const base10 = (b62) => {
  let b10 = 0;
  for (let i = 0; i < b62.length; i++) {
    let base = Math.pow(62, (b62.length - (i + 1)));
    b10 += tblBase62[b62[i]] * base;
  }

  return b10;
}

/**
 * parse game bet information
 * 
 * @param {number} blockNum 
 * @param {number} blockTime 
 * @param {string} trxId 
 * @param {string} uid
 * @param {string} strQuantity 
 * @param {string} strMemo 
 */
 const refineAction = (blockNum, blockTime, trxId, uid, strQuantity, strMemo) => {
  if (!strMemo) {
    throw new Error(`Invalid game info : ${strMemo}`);
  }

  const memo = strMemo.split('-');
  if (!memo || memo.length != 6) {
    throw new Error(`Invalid game info : ${JSON.stringify(strMemo)}`);
  }

  const quantity = strQuantity.split(' ');
  if (!quantity || quantity.length != 2) {
    throw new Error(`Invalid game info : ${JSON.stringify(strQuantity)}`);
  }

  const data ={
    game: {},
    bet: {},
    reveal: {}
  };
    
  data.game.gid = Number.parseInt(memo[0]);
  data.game.uid = uid;
  data.game.ref = memo[1];
  data.game.token = quantity[1];
  data.game.bet_total = Number.parseFloat(quantity[0]);
  
  data.game.bets = [];
  for (let i = 0; i < memo[2].length; i += 5) {
    data.game.bets.push({
      position: base10(memo[2].substring(i, i + 1)),
      amount: base10(memo[2].substring(i + 1, i + 5))
    })
  }
  
  data.game.hash = memo[3];
  data.game.expired = Number.parseInt(memo[4]);
  data.game.sig= memo[5];
  
  data.bet.block_num = blockNum;
  data.bet.block_time = blockTime;
  data.bet.trx_id = trxId;

  return data;
}

/**
 * check whether all info among trx, db, and chain are matched all together
 * check whether all info are valid (e.g., sig, token, bet position, bet amount, bet sum, game opened, etc)
 * 
 * @param {*} db 
 * @param {*} data 
 */
const validateGame = (db, data) => {
  log.d('===================== validateGame ======================');
  log.d(data);

  return combineLatest(games.get(db, data.game.gid, data.game.uid), getBetInfoFromTable(data)).pipe(
    // o: original(db), c: chain(cleos)
    map(([ogame, cgame]) => {
      log.d('-------------- data from trx read ---------------------------------')
      log.d(data)
      log.d('-------------- ogame from db written --------------------------------')
      log.d(ogame)
      log.d('-------------- cgame from chain with cleos -------------------------------')
      log.d(cgame)

      if (ogame.length < 1) {
        throw new Error(`Could not found game on offchain: ${JSON.stringify(data)}`);
      }
      if (cgame.rows.length < 1) {
        throw new Error(`Could not found game on chain: ${JSON.stringify(data)}`);
      }

      // data  1) default:
      //       2) check: hash, sig, token, amount (range), bet_info (position range/duplicate, amount range/step/sum)
      // ogame 1) default: id, uid
      //       2) check: status
      //       3) no need to check: expired
      //       4) save: seed
      // cgame 1) default: id, uid
      //       2) check: -
      //       3) no need to check: ref
      //       3) save: ref

      const hash = ecc.sha256(ogame[0].seed);
      const sig = ecc.sign(`${hash}${ogame[0].id}${ogame[0].uid}${ogame[0].expired}`, process.env.MGR_PK);
      
      // log.d("hash = " + hash);
      // log.d("sig = " + sig);

      if (sig !== data.game.sig || hash !== data.game.hash) {
        throw new Error(`Invalid game : wrong sig or hash`);
      }
      if (data.game.token != C.TOKEN_TAZCHIP) {
        throw new Error(`Invalid game : not supported token`);
      }
      if (data.game.bet_total < C.BET_TOTAL_AMOUNT_MIN || data.game.bet_total >  C.BET_TOTAL_AMOUNT_MAX) {
        throw new Error(`Invalid game : bet total amount`);
      }
      let betAmountSum = 0;
      for (let idx = 0; idx < data.game.bets.length; idx++) {
        if (data.game.bets[idx].position < C.BET_POSITION_MIN || data.game.bets[idx].position > C.BET_POSITION_MAX) {
          throw new Error(`Invalid game : bet position range`);
        }
        for (let idx2 = idx + 1; idx2 < data.game.bets.length; idx2++) {
          if (data.game.bets[idx].position === data.game.bets[idx2].position) {
            throw new Error(`Invalid game : bet position duplicated`);
          }
        }
        if (data.game.bets[idx].amount < C.BET_EACH_AMOUNT_MIN || data.game.bets[idx].amount > C.BET_EACH_AMOUNT_MAX) {
          throw new Error(`Invalid game : bet each amount range`);
        }
        if (data.game.bets[idx].amount % C.BET_EACH_AMOUNT_MIN != 0) {
          throw new Error(`Invalid game : bet each amount step`);
        }
        betAmountSum += data.game.bets[idx].amount;
      }
      if (betAmountSum != data.game.bet_total) {
        throw new Error(`Invalid game : bet amount sum not matched`);
      }
      if (ogame[0].status != 0) {
        throw new Error(`Invalid game : not opend game`);
      }

      data.game.seed = ogame[0].seed;
      data.game.ref = cgame.rows[0].ref;
      data.bet.block_time = cgame.rows[0].bet_time;

      return data;
    })
  );
};

/**
 * updated game DB with results
 * 
 * @param {*} db 
 * @param {*} data 
 */
const updateResults = (db, data) => {
  log.d('========= updateResults ==================');
  log.d(data);

  let status = 1;
  return games.update(db, data.game.gid, data.game.cards[0], data.game.cards[1], data.game.bet_total, data.game.prize_total, status, data.reveal.block_time, data.game.ref, data.bet.block_num, data.reveal.block_num, data.bet.trx_id, data.reveal.trx_id).pipe(
    flatMap(() => {
      return games.bet(db, data.game.gid, data.game.bets)
    }),
    map(() => data)
  );
}

/**
 * reprot results to websocket
 * 
 * @param {*} data 
 */
const reportResults = (data) => {
  fetch(`${process.env.INTERNAL_API_ENDPOINT}/internal/api/v1/results`, {
    'method': 'POST',
    'headers': {'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '-1'},
    'body': JSON.stringify(data)
  })
  .then(response => {
    response.json().then(resp => {
      // log.d(resp);
    }).catch(err => console.error(err));
  })
  .catch(err => console.error(err));
}

/**
 * dealer starting point
 */
process.on('message', (action) => {
  log.i('=========================== dealer activated ==============================');
  log.i(action);

  const db = new Database();
  try {
    const data = refineAction(action.block_num, action.block_time, action.trx_id, action.data.from, action.data.quantity, action.data.memo);

    db.connect().pipe(
      flatMap(() => validateGame(db, data)),
      flatMap(data => reveal(data)),
      flatMap(data => updateResults(db, data)),
      catchError(error => {
        log.e('==== catchError');
        log.e(data);
        log.e(error);
        log.e(error.message);
        if (data.game.gid >= 0) {
          return reject(data);
        }
        return throwError(error);
      }),
      finalize(() => db.release())
    ).subscribe(
      data => {
        log.d('================ Report ======================================');
        log.i(data);
        if (data.game.cards != null) {
          reportResults(data);  // websocket connected api server
          process.send(data);  // event to parent (then, it will go to chipper)
        }
      },
      error => {
        log.e('================ Rx Error ======================================');
        log.e(data);
        log.e(error);
        log.e(error.message);
      },
      () => {
        log.d('===========================================================');
      }
    )
  } catch(error) {
    log.e('================ Try-Catch Error ======================================');
    log.e(error);
    log.e(error.message);
  }
})
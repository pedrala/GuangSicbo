'use strict'

/**
 * 식보 게임에 구현에 필요한 상수와 유틸성 함수를 정의한다.
 */

const DEFAULT_WIDTH = 1400;  // PC 게임판 기본 폭
const DEFAULT_HEIGHT = 800;  // PC 게임판 기본 높이
const ASPECT_RATIO = DEFAULT_WIDTH / DEFAULT_HEIGHT; // PC 게임판 종횡비
const CHIP_TBL_HEIGHT = 112;  // PC 칩 UI 높이
const CHIP_TBL_MOBILE_HEIGHT = 90;  // 모바일 칩 UI 높이
const SICBO_MOBILE_WIDTH = 1024;  // 모바일로 전환되는 브라우져 폭
const SICBO_MOBILE_HEIGHT = 680;  // 모바일로 전환되는 브라우져 높이

const BET_TIMER = 50; // 배팅 시간
const CAST_CHIP_SIZE = 80;  // PC화면 칩 애니메이션 크기
const CAST_CHIP_MOBILE_SIZE = 40;  // 모바일 화면 칩 애니메이션 크기
const CHIP_PRICE = [100, 1000, 5000, 10000, 50000, 100000, 500000, 1000000, 5000000]; // 칩 배팅 금액
const CARD_NUMS = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10];  // 화투 번호 (화투 이미지 인덱스 순서)
const CARD_GUANG = [ // 광: true (화투 이미지 인덱스 순서)
  true, false, false, false, true, false, false, false, false, false, 
  false, false, false, false, true, false, false, false, true, false
];
const APPROVAL_WAITING_TIME = 60000;

// 애니메이션 타이머
const DELAY_CAST_CARD1 = 1000; // 첫 번째 화투를 던지고 두 번째 화투를 던질때까지의 지연시간
const DELAY_CAST_CARD2 = 1000; // 두 번째 화투를 던지고 식보통을 덮을 때까지의 지연시간
const DELAY_CLOSE_TONG = 2000; // 식보통을 덮기 시작하면서 부터 Placing bet 애니메이션이 시작될 때까지 지연시간
const DELAY_STARTING_ANI = 4000; // placing bet 애니메이션이 종료될 때까지 지연시간
const DELAY_RESET_GAME = 2000; // 배팅시간이 종료된 뒤 강제 청산 되기까지 지연시간

/**
 * 
 * @param {*} card1 
 * @param {*} card2 
 */
const getPositions = (card1, card2) => {
  const positions = []

  let isPair = false;
  isPair = CARD_NUMS[card1] === CARD_NUMS[card2]
  if (isPair) {
    positions.push(15);
    positions.push(4 + CARD_NUMS[card1]);
  } else {
    if ((CARD_NUMS[card1] + CARD_NUMS[card2]) % 10 < 5) {
      positions.push(0);
    } else {
      positions.push(2);
    }

    if ((CARD_NUMS[card1] + CARD_NUMS[card2]) % 2 === 1) {
      positions.push(3);
    } else {
      positions.push(4);
    }

    if (CARD_GUANG[card1] || CARD_GUANG[card2]) {
      positions.push(1);
    }
  }

  positions.push(15 + CARD_NUMS[card1]);
  if (CARD_NUMS[card1] !== CARD_NUMS[card2]) {
    positions.push(15 + CARD_NUMS[card2]);
  }

  return positions;
}

/**
 * 입력된 카드가 땡인지 검사
 * @param {*} card1 
 * @param {*} card2 
 */
const isPair = (card1, card2) => CARD_NUMS[card1] === CARD_NUMS[card2];

/**
 * 입력된 카드의 끝수가 5보다 작은지 검사
 * @param {*} card1 
 * @param {*} card2 
 */
const isSmall = (card1, card2) => ((CARD_NUMS[card1] + CARD_NUMS[card2]) % 10 < 5);

/**
 * 입력된 카드의 끝수가 홀 수 인지 검사
 * @param {*} card1 
 * @param {*} card2 
 */
const isOdd = (card1, card2) => ((CARD_NUMS[card1] + CARD_NUMS[card2]) % 2 === 1);

/**
 * 입력된 카드가 광인지 검사
 * @param {*} card 
 */
const isGuang = (card) => CARD_GUANG[card];

export {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  ASPECT_RATIO,
  CHIP_TBL_HEIGHT,
  CHIP_TBL_MOBILE_HEIGHT,
  SICBO_MOBILE_WIDTH,
  SICBO_MOBILE_HEIGHT,
  BET_TIMER,
  CAST_CHIP_SIZE,
  CAST_CHIP_MOBILE_SIZE,
  CHIP_PRICE,
  CARD_NUMS,
  CARD_GUANG,
  APPROVAL_WAITING_TIME,

  DELAY_CAST_CARD1,
  DELAY_CAST_CARD2,
  DELAY_CLOSE_TONG,
  DELAY_STARTING_ANI,
  DELAY_RESET_GAME,

  getPositions,
  isPair,
  isSmall,
  isOdd,
  isGuang
}
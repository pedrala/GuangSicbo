'use strict'

import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  CHIP_TBL_MOBILE_HEIGHT,
  BET_TIMER,
} from './sicbo.js';

export default function() {
  return Object.assign({}, {
    gameTable: {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
    },
    chipTableMobile: {
      height: CHIP_TBL_MOBILE_HEIGHT,
      position: 'fixed'
    },
    state: 'new_game',
    handleStartingAni: undefined,
    handleBetTimer: undefined,
    handleRevealAni: undefined,
    betTimer: BET_TIMER,

    /* Toast */
    isToast: false,
    alertMsg: '',

    /* Bet history */
    showHistoryLeft: false,
    showHistoryRight: false,
    alwaysOn: false,
    allBets: [],
    myBets: [],


    /* Chip table */
    selectedChip: -1,
    
    swiperOption: {  // PC화면 Chip swiper 옵션
      slidesPerView: 6,
      spaceBetween: 18,
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      }
    },

    swiperOptionMobile: { // 모바일 화면 Chip swiper 옵션
      slidesPerView: 6,
      spaceBetween: 8,
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      }
    },

    chipImage: [ // 칩 이미지, 이 값을 교체하여 칩 UI의 이미지 변경
      '/img/sicbo/gamechip/chip_00.png',
      '/img/sicbo/gamechip/chip_01.png',
      '/img/sicbo/gamechip/chip_02.png',
      '/img/sicbo/gamechip/chip_03.png',
      '/img/sicbo/gamechip/chip_04.png',
      '/img/sicbo/gamechip/chip_05.png',
      '/img/sicbo/gamechip/chip_06.png',
      '/img/sicbo/gamechip/chip_07.png',
      '/img/sicbo/gamechip/chip_08.png',
    ],

    /* 칩 선택 애니메이션을 위한 css class */
    styleChip: ["chip", "chip", "chip", "chip", "chip", "chip", "chip", "chip", "chip"],
    styleChipMobile: ["chip-mobile", "chip-mobile", "chip-mobile", "chip-mobile", "chip-mobile", "chip-mobile", "chip-mobile", "chip-mobile", "chip-mobile"],

    /* 배팅 시 칩 애니메이션을 위한 css class */
    styleCastChip: "",
    styleCastChips: ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'],
    
    /* 배팅 정보 */
    bets: [],  // view 초기화 시 컴포넌트 코드에서 다시 초기화
    betCounter: 0,  // 현재 배팅된 포지션의 갯수
    beted: 0, // 사용자가 Bet 버튼을 클릭한 시간
    
    aniPopup: {  // 게임 진행중 발생하는 애니메이션을 제어하기 위한 속성
      show: false,  // 사용자의 입력을 막기 위해 투명한 scrim 화면을 출력
      startToPlaceBet: false, // 배팅 시작 애니메이션
      waitResult: {  // 게임 결과 대기 애니메이션
        show: false,
        img: ''
      },
      result: {  // 게임 결과 애니메이션
        show: false,
        card1: '/img/sicbo/card/00.svg',
        card2: '/img/sicbo/card/00.svg'
      }
    },

    game: { // 서버에서 수신한 게임 데이터
      expired: -1,
      hash: "",
      id: -1,
      revealed: 0,
      sig: "",
      uid: ""
    },

    lastResult: { // 마지막 게임 정보
      cards: [-1, -1],
      pair: false,
      small: false,
      odd: false
    },

    hits: [], // 게임 결과 적중된 포지션, 배열에 값이 입력되면 해당 포지션의 애니메이션이 시작된다.,

    timerString: `--:--`,

    showHistoryDetail: true,

    historyDetail: {},

    soundInitialized: false
  });
}
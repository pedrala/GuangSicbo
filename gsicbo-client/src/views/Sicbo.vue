<template>
  <div id="sicbo" ref="layout" @click="initSound">
    <audio id="sound-effect" preload="auto">
      <source src="/music/timer1.wav"/>
      <source src="/music/timer2.wav"/>
      <source src="/music/spread-card.wav"/>
      <source src="/music/close-tong.wav"/>
      <source src="/music/result-popup.wav"/>
      <source src="/music/disapper-chip.wav"/>
      <source src="/music/guang-appears.wav"/>
    </audio>
    <audio id="sound-effect-bet" preload="auto">
      <source src="/music/betting-chip.wav" />
    </audio>

    <transition  name="ingame-toast">
      <div class ="toast" v-if="isToast">
        <img src="/img/sicbo/alert.svg" alt="" class="toast-img">
        <div class="toast-text">{{$t(`sicbo.alert.${alertMsg}`)}}</div>
      </div>
    </transition>
    <div class="game-table" @mousemove="cloesBetHistory">
      <div class="bet-history-left-btn"  :style="{ top: gameTable.height/2 + 'px' }"  @mouseenter="showHistoryLeft = true"  @mousemove="showBetHistory">{{ $t('sicbo.history.my') }}</div>
      <transition name="bet-to-right">
        <div class="bet-history-left" :style="{ height: gameTable.height + 'px' }" v-if="showHistoryLeft || alwaysOn"  @mousemove="showBetHistory">
          <div class="history-title">{{$t('sicbo.history.my')}}</div>
          <hr class="history-division">
          <div class="history-list-container" :style="{ height: gameTable.height-44 + 'px' }">
            <div v-for="(mybet, index) of myBets" :key="index" class="history-list-row" @click="showDetailPopup(mybet)">
              <div class="history-card-wrap">
                <img :src="cardImg(mybet.card1)" alt="" class="history-card">
                <img :src="cardImg(mybet.card2)" alt="" class="history-card">
              </div>
              <div class="history-text-wrap">
                <div class="history-text-row">
                  <span class="history-text-result">{{ historyResult1(mybet.card1, mybet.card2) }}</span>
                  <span class="history-text-result">{{ historyResult2(mybet.card1, mybet.card2) }}</span>
                </div>
                <div class="history-text-row">
                  <span class="history-text-token">{{ transNumber(mybet.bet_total) }}  TAZ Chip</span>
                  <img :src="thumbUrl(mybet)" alt="" class="history-thumb">
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <g-pc-gametable ref="gameTablePc" style="z-index:-1;" 
        :width="gameTable.width"
        :height="gameTable.height"
        :chipselected="selectedChip !== -1"
        :bets="bets" 
        :lastresult="lastResult"
        :hits="hits"
        :isMyBetEmpty="isMyBetEmpty"
        v-show="!isMobile" @bet="bet" @cancel="cancelBet" @mouseenter="closeShowHistory()"/>
      
      <div class="bet-history-right-btn" :class=" {'no-rotate': rotateKrZh, 'extend-tr-btn': extendTrBet} " :style="{ top: gameTable.height/2 + 'px' }" @mouseenter="showHistoryRight = true" @mousemove="showBetHistory">{{$t('sicbo.history.past')}}</div>
      <transition name="bet-to-left">
        <div class="bet-history-right" :style="{ height: gameTable.height + 'px'}" v-if="showHistoryRight || alwaysOn" @mousemove="showBetHistory">
          <div class="history-title">{{$t('sicbo.history.past')}}</div>
          <hr class="history-division">
          <div class="history-list-container" :style="{ height: gameTable.height-44 + 'px' }">
            <div v-for="(allbet, index) of allBets" :key="index" class="history-list-row-allbet">
              <div class="history-card-wrap">
                <img :src="cardImg(allbet.card1)" alt="" class="history-card">
                <img :src="cardImg(allbet.card2)" alt="" class="history-card">
              </div>
              <div class="history-text-wrap">
                <div class="history-text-row">
                  <span class="history-text-result2">{{ historyResult1(allbet.card1, allbet.card2) }}</span>
                  <span class="history-text-result2">{{ historyResult2(allbet.card1, allbet.card2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
      
    </div>

    <!-- Chip table for PC -->
    <div id="chip-table" v-if="!isMobile">
      <div class="flex-wfill flex"></div>
      <!-- Button to swipe left -->
      <div class="swiper-prev" @click="slidePrevChip">
        <img src="/img/sicbo/ic-left-arrow.svg" width="100%"/>
      </div>

      <swiper ref="chipSwiper" :options="swiperOption" style="width:660px;height:102px;margin: auto 0px 0px 0px;padding-top:20px;">
        <swiper-slide>
          <img :src="chipImage[0]" :class="styleChip[0]" @click="selectChip(0)"/>
        </swiper-slide>
        <swiper-slide><img :src="chipImage[1]" :class="styleChip[1]" @click="selectChip(1)"/></swiper-slide>
        <swiper-slide><img :src="chipImage[2]" :class="styleChip[2]" @click="selectChip(2)"/></swiper-slide>
        <swiper-slide><img :src="chipImage[3]" :class="styleChip[3]" @click="selectChip(3)"/></swiper-slide>
        <swiper-slide><img :src="chipImage[4]" :class="styleChip[4]" @click="selectChip(4)"/></swiper-slide>
        <swiper-slide><img :src="chipImage[5]" :class="styleChip[5]" @click="selectChip(5)"/></swiper-slide>
        <swiper-slide><img :src="chipImage[6]" :class="styleChip[6]" @click="selectChip(6)"/></swiper-slide>
        <swiper-slide><img :src="chipImage[7]" :class="styleChip[7]" @click="selectChip(7)"/></swiper-slide>
        <swiper-slide><img :src="chipImage[8]" :class="styleChip[8]" @click="selectChip(8)"/></swiper-slide>
      </swiper>

      <!-- Button to swipe right -->
      <div class="swiper-next" @click="slideNextChip">
        <img src="/img/sicbo/ic-right-arrow.svg" width="100%"/>
      </div>

      <!-- Button to bet to blockchain -->
      <div class="flex-wfill flex flex-middle" style="height: 100%;">
        <div class="btn-bet-pc" @click="confirmBet">
          <div class="title">{{$t('sicbo.betting.bet')}}</div>
          <div class="value">{{ $t('sicbo.betting.total')}}:</div>
          <div class="value">{{totalBetAmount}}</div>
        </div>
      </div>
      <div class="cast-chip" :style="styleCastChip">
        <img src="/img/sicbo/gamechip/chip_00.png" class="cast-chip" :style="`display:${styleCastChips[0]}`"/>
        <img src="/img/sicbo/gamechip/chip_01.png" class="cast-chip" :style="`display:${styleCastChips[1]}`"/>
        <img src="/img/sicbo/gamechip/chip_02.png" class="cast-chip" :style="`display:${styleCastChips[2]}`"/>
        <img src="/img/sicbo/gamechip/chip_03.png" class="cast-chip" :style="`display:${styleCastChips[3]}`"/>
        <img src="/img/sicbo/gamechip/chip_04.png" class="cast-chip" :style="`display:${styleCastChips[4]}`"/>
        <img src="/img/sicbo/gamechip/chip_05.png" class="cast-chip" :style="`display:${styleCastChips[5]}`"/>
        <img src="/img/sicbo/gamechip/chip_06.png" class="cast-chip" :style="`display:${styleCastChips[6]}`"/>
        <img src="/img/sicbo/gamechip/chip_07.png" class="cast-chip" :style="`display:${styleCastChips[7]}`"/>
        <img src="/img/sicbo/gamechip/chip_08.png" class="cast-chip" :style="`display:${styleCastChips[8]}`"/>
      </div>
    </div>

    <!-- Mobile -->
    <keep-alive>
      <div class="game-table">
        <g-mobile-gametable ref="gameTableMobile"
          :width="gameTable.width"
          :height="gameTable.height"
          :chipselected="selectedChip !== -1"
          :bets="bets" 
          :lastresult="lastResult"
          :hits="hits"
          :allBets="allBets"
          :myBets="myBets"
          :isMyBetEmpty="isMyBetEmpty"
          v-show="isMobile" @bet="bet" @cancel="cancelBet" @show-detail="showDetailPopup" />
      </div>
    </keep-alive>
    <div id="chip-table-mobile" :style="styleMobileChipTable" v-if="isMobile">
      <div style="height: 68px;" v-show="chipTableMobile.position !== 'fixed'">
        <!-- fixed 모드가 아닐때 공간을 확보할 목적 -->
      </div>
      <div class="status-bar">
        <div style="margin-left: 16px;">{{$t(`sicbo.status.${state}`)}}</div>
        <div>{{tazchipBalance}} TAZ CHIP</div>
        <div style="margin-right: 16px;">{{$t('sicbo.status.timeleft')}} : {{timerString}} </div>
      </div>
      <div class="chip-bar">
        <div class="swiper-prev-mobile" @click="slidePrevChip">
          <img src="/img/sicbo/ic-left-arrow.svg" width="100%"/>
        </div>

        <swiper ref="chipSwiper" :options="swiperOptionMobile" :style="`width:${mobileChipSwiperWidth}px;height:66px;padding-top:24px;`">
          <swiper-slide><img :src="chipImage[0]" :class="styleChipMobile[0]" @click="selectChip(0)"/></swiper-slide>
          <swiper-slide><img :src="chipImage[1]" :class="styleChipMobile[1]" @click="selectChip(1)"/></swiper-slide>
          <swiper-slide><img :src="chipImage[2]" :class="styleChipMobile[2]" @click="selectChip(2)"/></swiper-slide>
          <swiper-slide><img :src="chipImage[3]" :class="styleChipMobile[3]" @click="selectChip(3)"/></swiper-slide>
          <swiper-slide><img :src="chipImage[4]" :class="styleChipMobile[4]" @click="selectChip(4)"/></swiper-slide>
          <swiper-slide><img :src="chipImage[5]" :class="styleChipMobile[5]" @click="selectChip(5)"/></swiper-slide>
          <swiper-slide><img :src="chipImage[6]" :class="styleChipMobile[6]" @click="selectChip(6)"/></swiper-slide>
          <swiper-slide><img :src="chipImage[7]" :class="styleChipMobile[7]" @click="selectChip(7)"/></swiper-slide>
          <swiper-slide><img :src="chipImage[8]" :class="styleChipMobile[8]" @click="selectChip(8)"/></swiper-slide>
        </swiper>

        <div class="swiper-next-mobile" @click="slideNextChip">
          <img src="/img/sicbo/ic-right-arrow.svg" width="100%"/>
        </div>
      </div>
      <div class="cast-chip-mobile" :style="styleCastChip">
        <img src="/img/sicbo/gamechip/chip_00.png" class="cast-chip-mobile" :style="`display:${styleCastChips[0]}`"/>
        <img src="/img/sicbo/gamechip/chip_01.png" class="cast-chip-mobile" :style="`display:${styleCastChips[1]}`"/>
        <img src="/img/sicbo/gamechip/chip_02.png" class="cast-chip-mobile" :style="`display:${styleCastChips[2]}`"/>
        <img src="/img/sicbo/gamechip/chip_03.png" class="cast-chip-mobile" :style="`display:${styleCastChips[3]}`"/>
        <img src="/img/sicbo/gamechip/chip_04.png" class="cast-chip-mobile" :style="`display:${styleCastChips[4]}`"/>
        <img src="/img/sicbo/gamechip/chip_05.png" class="cast-chip-mobile" :style="`display:${styleCastChips[5]}`"/>
        <img src="/img/sicbo/gamechip/chip_06.png" class="cast-chip-mobile" :style="`display:${styleCastChips[6]}`"/>
        <img src="/img/sicbo/gamechip/chip_07.png" class="cast-chip-mobile" :style="`display:${styleCastChips[7]}`"/>
        <img src="/img/sicbo/gamechip/chip_08.png" class="cast-chip-mobile" :style="`display:${styleCastChips[8]}`"/>
      </div>
      <div :class="`btn-bet-mobile ${classBtnBetMobile}`" @click="confirmBet">
        <div class="title">{{$t('sicbo.betting.bet')}}</div>
        <div class="value">{{ $t('sicbo.betting.totalmobile')}}: {{totalBetAmount}}</div>
      </div>
    </div>
    <div style="height: 158px;"  v-if="isMobile" :game="historyDetail">
    </div>

    <!-- footer -->
    <g-footer />

    <!-- Aninmation popup -->
    <div id="ani-layout" v-if="aniPopup.show">
      <div id="ani-start" v-if="aniPopup.startToPlaceBet">
        <div class="box"></div>
        <div class="img-box">
          <img src="/img/sicbo/ani-flower.png"/>
        </div>
        <p class="text">{{ $t('sicbo.animation.start') }}</p>
        <div class="box"></div>
      </div>

      <div id="ani-wait-result" v-if="aniPopup.waitResult.show">
        <div class="box"></div>
        <div :class="`flex flex-center img-box ${aniPopup.waitResult.img}`">
          <img src="/img/sicbo/ani-flower.png"/>
        </div>
        <p class="text">{{ $t('sicbo.animation.waiting') }}</p>
        <div class="box"></div>
      </div>

      <div id="ani-result" v-if="aniPopup.result.show">
        <div class="box"></div>
        <div class="img-box">
          <img class="image" :src="aniPopup.result.card1">
          <img class="image" :src="aniPopup.result.card2">
          <div class="text">{{aniPopup.result.result1}}</div>
          <div class="text">{{aniPopup.result.result2}}</div>
        </div>
        <div class="box"></div>
      </div>
    </div>

    <modal-history-detail @close="closeHistoryDetail" v-if="showHistoryDetail" :game="historyDetail" />
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import { setTimeout, setInterval, clearInterval, clearTimeout } from 'timers';
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import { flatMap, timeout, tap } from 'rxjs/operators';
import resize from 'vue-resize-directive';
import PcGameTable from '../components/sicbo/PcGameTable.vue';
import MobileGameTable from '../components/sicbo/MobileGameTable.vue';
import Footer from '../components/Footer.vue';
import HistoryDetail from '../components/sicbo/HistoryDetail.vue';
import convToBase62 from '../js/base62.js';
import {
  // const
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  ASPECT_RATIO,
  CHIP_TBL_HEIGHT,
  SICBO_MOBILE_WIDTH,
  SICBO_MOBILE_HEIGHT,
  BET_TIMER,
  CAST_CHIP_SIZE,
  CAST_CHIP_MOBILE_SIZE,
  CHIP_PRICE,
  APPROVAL_WAITING_TIME,

  // Animaiton timmer
  DELAY_CAST_CARD1,
  DELAY_CAST_CARD2,
  DELAY_CLOSE_TONG,
  DELAY_STARTING_ANI,
  DELAY_RESET_GAME,

  // function
  getPositions,
  isPair,
  isSmall,
  isOdd,
  isGuang
} from '../js/sicbo.js';
import data from '../js/sicbo-data.js'

export default {

  data,
  props: {
    isLangChanged: {
      type: Boolean,
      default: false
    }
  },

  created() {

    window.onscroll = () => {  // 브라우저의 스크롤 이벤트 리스너 등록
      if (this.isMobile) {
        this.onScrolled();
      }
    };

    for (let i = 0; i < 26; i++) { // 배팅 데이터를 초기화
      this.bets.push({id: i, amount: 0});
    }

    this.$ws.connectToPublicChannel(); // Websocket의 퍼블릭 채널에 연결
    this.$ws.publicChannel.on('game-result', (data) => {  // 게임 결과 수신 리스너
      if (this.account.name === data.game.uid) { // 유저 게임
        if (this.game.id === data.game.gid) { // 현재 게임
          const now = new Date().getTime();
          
          if ((now - this.beted) < 3000) {
            setTimeout(() => {
              this.revealed(data);
            }, 3000 - (now - this.beted));        
          } else {
            this.revealed(data);
          }
        } else {
          this.pushBetHistory(data, 'myBets');
          this.pushBetHistory(data, 'allBets');
        }
      } else {
        this.pushBetHistory(data, 'allBets');
      }
    });
  },

  /**
   * 종료시 각종 핸드러를 초기화 한다.
   */
  destroyed() {
    if (this.handleStartingAni) {
      clearTimeout(this.handleStartingAni);
    }
    if (this.handleBetTimer) {
      clearInterval(this.handleBetTimer);
    }
    if (this.handleRevealAni) {
      clearTimeout(this.handleRevealAni);
    }
    window.onscroll = () => {}; // 브라우져 스크롤 이벤트 리스너 제거
  },

  /**
   * 초기화
   */
  mounted() {
    this.fetchHistoryData();  // 히스토리 데이터를 요청

    this.$eventBus.$on('resize', () => this.onResize());  // resize 이벤트 리스너 등록
    this.onResize();

    // ui 상태 초기화
    if (window.innerWidth < SICBO_MOBILE_WIDTH || window.innerHeight < SICBO_MOBILE_HEIGHT) {
      this.setAppbarMode('mobile');
    } else {
      this.setAppbarMode('pc');
    }
    this.setDrawerMode('overlap');
    this.setDrawerState('close-without-ani');

    if (this.isLogin) {
      this.startGame()
    } else {
      this.$eventBus.$on('login', () => this.startGame());
    }

    // this.$eventBus.$on('logout', () => this.stopGame());
    if (!this.isLogin) {
      this.setStatus('logout');
    }
  },

  computed: {
    ...mapState({
      /**
       * 게임 테이블이 보바일 모드인지 판단
       */
      isMobile(state) {
        return state.common.appbarMode !== 'pc';
      },
      /**
       * 로그인 상태인지 판단
       */
      isLogin(state) {
        return state.common.account.name !== undefined;
      },

      /**
       * Scatter에 로그인한 계정 정보
       */
      account(state) {
        return state.common.account;
      },

      /**
       * 로그인 된 사용자의 TAZ Chip 잔고
       */
      tazchipBalance(state) {
        return state.common.balance.tazchip;
      },

      appbarHeight(state) {
        return state.common.appbarMode !== 'pc' ? 68 : 60;
      },
    }),

    /**
     * 모바일 화면의 칩 swiper 폭
     */
    mobileChipSwiperWidth() {
      return window.innerWidth - 36;
    },

    /**
     * 모바일 화면의 칩 UI를 화면 스크롤에 따라 제어
     */
    styleMobileChipTable() {
      if (this.chipTableMobile.position === 'fixed') {
        return `position:fixed;height:${this.chipTableMobile.height}px;top:${window.innerHeight - this.chipTableMobile.height}px`
      }
      
      return `position:absolute;height:${this.chipTableMobile.height}px;`
    },

    /**
     * 모바일 화면에서 배팅 버튼의 위치를 제어
     */
    classBtnBetMobile() {
      if (this.chipTableMobile.position === 'fixed') {
        return 'fixed';
      }
      return '';
    },

    /**
     * swiper를 제어하기 위한 객체를 반환
     */
    chipSwiper() {
      return this.$refs.chipSwiper.swiper;
    },

    /**
     * 총 배팅 액
     */
    totalBetAmount() {
      const total = this.bets.reduce((total, bet) => total + bet.amount, 0);
      return total;
    },

    rotateKrZh() {
      const langchanged = this.isLangChanged;
      const curLang = localStorage.getItem('GuangGame.Language')||langchanged;
      
      if(curLang === 'ko' || curLang === 'zh'){
        return true;
      }
      else{
        return false
      }
    },

    extendTrBet() {
      const langchanged = this.isLangChanged;
      const curLang = localStorage.getItem('GuangGame.Language')||langchanged;
      
      if(curLang === 'tr') {
        return true;
      } else {
        return false
      }
    },

    isMyBetEmpty() {
      return this.myBets.length > 0 ? false : true;
    }

  },

  watch: {
    isLogin: function (val) { // 로그인 상태가 변경되면 히스토리 데이터를 업데이트 한다.
      this.fetchHistoryData();
      if (!val) {
        if (this.handleStartingAni) {
          clearTimeout(this.handleStartingAni);
        }
        if (this.handleBetTimer) {
          clearInterval(this.handleBetTimer);
        }
        if (this.handleRevealAni) {
          clearTimeout(this.handleRevealAni);
        }
        this.aniPopup.show = false;
        this.aniPopup.startToPlaceBet = false;
        this.aniPopup.waitResult.show = false;
        this.aniPopup.result.show = false;
        this.myBets = [];
        this.stopGame();
        this.setStatus('logout');
        this.lastResult.cards = [-1, -1]
      }
    }
  },

  methods: {
    /**
     * 게임 화면 크기 변경
     */
    onResize() {
      if (!this.isMobile) {
        let tableWidth = window.innerWidth;
        const tableHeight = window.innerHeight - this.appbarHeight - (CHIP_TBL_HEIGHT + 10);

        if ((tableWidth / tableHeight) < ASPECT_RATIO) {
          this.gameTable.width = Math.round(tableWidth);
          this.gameTable.height = Math.round(tableWidth * DEFAULT_HEIGHT / DEFAULT_WIDTH);
        } else {
          this.gameTable.height = Math.round(tableHeight);
          this.gameTable.width = Math.round(tableHeight * DEFAULT_WIDTH / DEFAULT_HEIGHT);
        }
      } else {
        this.onScrolled();
      }
      this.canDisplayBetHistory();
    },
    
    /**
     * 모바일 모드에서 화면 스크롤 상태에 따라 칩 UI의 위치 변경
     */
    onScrolled() {
      if (window.innerHeight + 300 > this.$refs.layout.getBoundingClientRect().bottom) {
        this.chipTableMobile.position = 'absolute';
      } else {
        this.chipTableMobile.position = 'fixed';
      }
    },

    /**
     * 게임 시작
     */
    startGame() {
      this.aniPopup.show = true;
      this.setStatus('new_game');
      
      this.cast1stCard();

      this.handleStartingAni = setTimeout(() => this.cast2ndCard(), DELAY_CAST_CARD1);
    },

    /**
     * Game table wrappers
     */
    setStatus(status) {
      this.state = status;
      this.$refs.gameTablePc.setStatus(status);
    },

    /**
     * 첫 번째 화투 투척 애니메이션
     */
    cast1stCard() {
      this.$refs.gameTablePc.cast1stCard();
      this.$refs.gameTableMobile.cast1stCard();
      
      setTimeout(() => {
        this.playSoundEffect('spread-card');
      }, 200);
    },

    /**
     * 두 번째 화투 투척 애니메이션
     */
    cast2ndCard() {
      this.$refs.gameTablePc.cast2ndCard();
      this.$refs.gameTableMobile.cast2ndCard();
      setTimeout(() => {
        this.playSoundEffect('spread-card');
      }, 200);

      this.handleStartingAni = setTimeout(() => {
        this.closeTong();
      }, DELAY_CAST_CARD2);
    },

    /**
     * 식보통 덮는 애니메이션
     */
    closeTong() {
      this.$refs.gameTablePc.closeTong();
      this.$refs.gameTableMobile.closeTong();
      setTimeout(() => {
        this.playSoundEffect('close-tong')
      }, 500);

      this.handleStartingAni = setTimeout(() => {
        this.startToPlaceBet();
      }, DELAY_CLOSE_TONG);
    },

    /**
     * 배팅 시작
     */
    startToPlaceBet() {
      this.playSoundEffect('popup');
      this.aniPopup.show = true;
      this.aniPopup.startToPlaceBet = true;

      this.handleStartingAni = setTimeout(() => {
        this.aniPopup.show = false;
        this.aniPopup.startToPlaceBet = false;

        if (!this.isLogin) {
          return;
        }

        this.setTimerString(this.betTimer);
        this.setStatus('placing_bet');

        this.handleBetTimer = setInterval(() => {
          if (this.betTimer <= 1) {
            this.aniPopup.show = true;
            this.restartGame();
          } else {
            if (this.betTimer <= 11) {
              this.playSoundEffect('timer2');  
            } else {
              this.playSoundEffect('timer1');
            }
            
            this.betTimer = this.betTimer - 1;
            this.setTimerString(this.betTimer);
          }
        }, 1000); // 배팅 대기 시간 타이머
      }, DELAY_STARTING_ANI);
    },

    /**
     * 게임을 재시작 한다.
     */
    restartGame() {
      this.setStatus('new_game');
      if (this.handleBetTimer) {
        clearInterval(this.handleBetTimer);
        this.handleBetTimer = undefined;
      }

      this.setTimerString(-1);

      this.openTong();
      this.playSoundEffect('close-tong');

      setTimeout(() => this.initGame(), DELAY_RESET_GAME);
      
      this.handleStartingAni = setTimeout(() => { // 새 게임 시작
        this.betTimer = BET_TIMER;
        this.startGame();
      }, 3000);
    },

    /**
     * 식보통을 여는 애니메이션
     */
    openTong() {
      this.$refs.gameTablePc.openTong();
      this.$refs.gameTableMobile.openTong();
    },

    /**
     * 게임이 종료되었을 때 배팅 정보등을 초기화
     */
    initGame() {
      for (let idx = 0; idx < this.bets.length; idx++) {
        this.bets[idx].amount = 0;
      }

      this.playSoundEffect('clear');
      
      this.betCounter = 0;
      this.setTimerString(-1);
      this.selectedChip = -1;

      for (let idx = 0; idx < this.styleChip.length; idx++) {
        this.chipImage[idx] = `/img/sicbo/gamechip/chip_0${idx}.png`;
        this.styleChip[idx] = "chip";
        this.styleChipMobile[idx] = "chip-mobile";
      }

      this.$refs.gameTablePc.stopGame();
      this.$refs.gameTableMobile.stopGame();
    },

    /**
     * 게임 종료
     */
    stopGame() {
      if (this.handleStartingAni) {
        clearTimeout(this.handleStartingAni);
      }
      
      if (this.handleBetTimer) {
        clearInterval(this.handleBetTimer);
        this.handleBetTimer = undefined;
      }

      this.initGame();
    },

    /**
     * 남은 배팅 시간을 출력
     */
    setTimerString(betTimer) {
      let timerString = `--:--`;
      if (betTimer >= 0) {
        const sec = (betTimer % 60 < 10) ? `0${betTimer % 60}` : `${betTimer % 60}`
        timerString = `${Math.floor(betTimer / 60)}:${sec}`;
      }

      this.$refs.gameTablePc.setTimerString(timerString);
      this.timerString = timerString;
    },

    /**
     * 칩을 왼쪽으로 스크롤 
     */
    slidePrevChip() {
      this.chipSwiper.slidePrev();
    },

    /**
     * 칩을 오른쪽으로 스크롤
     */
    slideNextChip() {
      this.chipSwiper.slideNext();
    },

    /**
     * 칩 선택
     */
    selectChip(idx) {
      if (!this.isiOS()) {
        this.playSoundEffect('bet');
      }
      for (let i = 0; i < 9; i++) {
        if (i != idx) {
          this.chipImage[i] = `/img/sicbo/gamechip/chip_0${i}.png`;
          this.styleChip[i] = 'chip';
          this.styleChipMobile[i] = 'chip-mobile';
        } else if (this.styleChip[i] === 'chip') {
          this.selectedChip = i;
          this.chipImage[i] = `/img/sicbo/gamechip/chip_0${i}_light.png`;
          this.styleChip[i] = 'chip selected'
          this.styleChipMobile[i] = 'chip-mobile selected';
        } else {
          this.chipImage[i] = `/img/sicbo/gamechip/chip_0${i}.png`;
          this.selectedChip = -1;
          this.styleChip[i] = 'chip'
          this.styleChipMobile[i] = 'chip-mobile';
        }
      }
    },

    /**
     * REST 서버에 새 게임 생성을 요청한다.
     */
    confirmBet() {
      if (!this.isLogin) {
        return;
      }

      if (this.state !== 'placing_bet') {
        return;
      }

      // 베팅 유효성 검사
      if (this.betCounter < 1) {
        this.showToast('nochip')
        return;
      }

      // 배팅 타이머를 종료한다.
      if (this.handleBetTimer) {
        clearInterval(this.handleBetTimer);
        this.handleBetTimer = undefined;
      }
      this.betTimer = -1;
      this.setTimerString(-1);
      this.setStatus('wait_result');

      this.aniPopup.show = true; // 사용자의 입력을 차단한다.

      // 서버에 게임 정보 요청
      fetch(`${this.$REST_API_SERVER}/api/v1/games`, {
        "method": "POST",
        "headers": {
          "content-type": "application/json"
        },
        "body": JSON.stringify({"account": this.account.name})
      })
      .then(response => {
        response.json().then(gameInfo => {
          this.game = gameInfo;
          this.sendBetTransaction();
        })
        .catch(err => {
          console.log(err)
        })
      })
      .catch(err => {
        console.log(err);
      });
    },

    /**
     * 배팅된 내용을 블록체인에 전송한다.
     */
    sendBetTransaction() {debugger
      const bets = [];
      let totalAmount = 0;
      for (let i = 0; i < this.bets.length; i++) {
        if (this.bets[i].amount > 0) {
          const position = convToBase62(this.bets[i].id, 1);
          const amount = convToBase62(this.bets[i].amount, 4);
          bets.push(`${position}${amount}`);
          totalAmount += this.bets[i].amount;
        }
      }
      
      const reff = localStorage.getItem('GuangGame.Referral') || this.account.name;
      const memo = `${this.game.id}-${reff}-${bets.join('')}-${this.game.hash}-${this.game.expired}-${this.game.sig}`
      this.$chain.confirmBetTransaction(this.account, totalAmount, memo).pipe(
        timeout(APPROVAL_WAITING_TIME),
        tap(() => {
          // 베팅 애니메이션 시작
          this.beted = new Date().getTime();
          this.playSoundEffect('popup');
          this.aniPopup.show = true;
          this.aniPopup.waitResult.show = true;
          this.aniPopup.waitResult.img = 'show';
          clearInterval(this.handleBetTimer);
        }),
        flatMap(trx => this.$chain.sendBetTransaction(trx))
      ).subscribe(
        result => {debugger
          console.log(result);
        },
        err => {debugger
          this.aniPopup.show = false;
          this.aniPopup.waitResult.show = false;
          this.aniPopup.waitResult.img = '';
          if (err.name === 'TimeoutError') {debugger
            this.showToast('transaction');
          } else if (err.type === 'signature_rejected') {debugger
            this.showToast('denied');
          } else {debugger
            this.showToast('wrong');
          }

          setTimeout(() => this.restartGame(), 3000);
        }
      );
    },

    /**
     * 배팅 이밴트를 처리한다.
     */
    bet(info) {
      if (this.validateBetState(info)) {
        if (!this.isiOS()) {
          this.playSoundEffect('bet');
        }

        if (info.tableType === 'pc') {
          this.bet4Pc(info.id, info.x, info.y, this.selectedChip)
        } else if (info.tableType === 'mobile') {
          this.bet4Mobile(info.id, info.x, info.y, this.selectedChip)
        }
      }
    },

    /**
     * 배팅할 수 있는 상태인지 검사한다.
     */
    validateBetState(info) {
      if (this.bets[info.id].amount > 0 && this.selectedChip === -1) {
        this.cancelBet(info.id);
        return false;
      }

      if (this.betCounter >= 5 && this.bets[info.id].amount === 0) {
        this.showToast('maxbet');
        return false;
      }

      const total = this.bets.reduce((total, bet) => total + bet.amount, 0);
      if (total >= 50000000) {
        this.showToast('maxbetmoney');
        return false;
      }

      if ((this.bets[info.id].amount + CHIP_PRICE[this.selectedChip]) > 10000000) {
        this.showToast('maxbetcell');
        return false;
      }
      
      if (this.state !== 'placing_bet') {
        return false;
      }

      if (this.selectedChip < 0 || this.selectedChip > 8) {
        this.showToast('selectchip');
        return false;
      }

      if (info.id < 0 || info.id > 25) {
        return false;
      }

      return true;
    },

    /**
     * PC 게임 테이블을 위한 배팅 칩 애니메이션 제어
     */
    bet4Pc(id, x, y, selectedChip) {
      let xPos = CAST_CHIP_SIZE * 0.5;
      if (x < (window.innerWidth / 2)) {
        xPos = ((window.innerWidth / 2) - x - (CAST_CHIP_SIZE * 0.5)) * -1;
      } else if (x > (window.innerWidth / 2)) {
        xPos = ((CAST_CHIP_SIZE * 0.75) + x - (window.innerWidth / 2));
      }

      let yPos = (this.gameTable.height - y + 68 + (CAST_CHIP_SIZE * 0.75)) * -1;
      this.styleCastChips[selectedChip] = 'block';
      this.styleCastChip = `z-index:0;transform:translateX(${xPos}px);top:${yPos}px;opacity: 1;transition:all .3s;`

      if (this.bets[id].amount === 0) {
        this.betCounter++;
      }
      this.bets[id].amount += CHIP_PRICE[selectedChip];
      setTimeout(() => {
        this.styleCastChips[selectedChip] = 'none';
        this.styleCastChip = 'transition:all 0s;';
      }, 300);
    },

    /**
     * 모바일 게임 테이블을 위한 배팅 칩 애니메이션 제어
     */
    bet4Mobile(id, x, y, selectedChip) {
      let xPos = CAST_CHIP_MOBILE_SIZE * 0.5;
      if (x < (window.innerWidth / 2)) {
        xPos = ((window.innerWidth / 2) - x - (CAST_CHIP_MOBILE_SIZE * 0.5)) * -1;
      } else if (x > (window.innerWidth / 2)) {
        xPos = ((CAST_CHIP_MOBILE_SIZE * 0.75) + x - (window.innerWidth / 2));
      }

      let yPos = (window.innerHeight - y + CAST_CHIP_MOBILE_SIZE) * -1;

      if (this.chipTableMobile.position !== 'fixed') {
        yPos += (280 - (this.$refs.layout.getBoundingClientRect().bottom - window.innerHeight));
      }
      this.styleCastChips[selectedChip] = 'block';
      this.styleCastChip = `z-index:0;transform:translateX(${xPos}px);top:${yPos}px;opacity: 1;transition:all .3s;`

      if (this.bets[id].amount === 0) {
        this.betCounter++;
      }
      this.bets[id].amount += CHIP_PRICE[selectedChip];
      setTimeout(() => {
        this.styleCastChips[selectedChip] = 'none';
        this.styleCastChip = 'transition:all 0s;';
      }, 300);
    },

    /**
     * 배팅을 취소한다.
     */
    cancelBet(id) {
      this.bets[id].amount = 0;
      this.betCounter--;
    },
   
    /**
     * 수신한 게임 결과를 처리한다.
     */
    revealed(data) {
      this.aniPopup.waitResult.show = false;
      this.aniPopup.waitResult.img = '';

      this.handleRevealAni = setTimeout(() => {

        this.openTong();
        this.playSoundEffect('close-tong');

        this.handleRevealAni = setTimeout(() => {
          if (isGuang(data.game.cards[0])) {
            this.playSoundEffect('guang');
          } else {
            this.playSoundEffect('spread-card');
          }
          this.$refs.gameTablePc.open1stCard(data.game.cards[0]);
          this.$refs.gameTableMobile.open1stCard(data.game.cards[0]);

          this.handleRevealAni = setTimeout(() => {
            if (isGuang(data.game.cards[1])) {
              this.playSoundEffect('guang');
            } else {
              this.playSoundEffect('spread-card');
            }
            this.$refs.gameTablePc.open2ndCard(data.game.cards[1]);
            this.$refs.gameTableMobile.open2ndCard(data.game.cards[1]);

            this.handleRevealAni = setTimeout(() => {
              this.playRevealAni(data);
              this.$chain.getBalance('taztokenbase', this.account.name, 'TAZCHIP').subscribe(
                tazchipBalance => {
                  if (tazchipBalance.length > 0) {
                    const token = tazchipBalance[0].split(' ');
                    this.setTazchipBalance(Number.parseFloat(token[0]));
                  } else {
                    this.setTazchipBalance(0);
                  }
                },
                error => console.error(error)
              );
            }, 2500);
          }, 2500);  
        }, 1000);
      }, 1000);
    },

    /**
     * 결과 애니메이션을 실행한다.
     */
    playRevealAni(data) {
      this.handleRevealAni = setTimeout(() => {
        if (data.game.cards[0] < 10) {
          this.aniPopup.result.card1 = `/img/sicbo/card/0${data.game.cards[0]}.svg`;
        } else {
          this.aniPopup.result.card1 = `/img/sicbo/card/${data.game.cards[0]}.svg`;
        }

        if (data.game.cards[1] < 10) {
          this.aniPopup.result.card2 = `/img/sicbo/card/0${data.game.cards[1]}.svg`;
        } else {
          this.aniPopup.result.card2 = `/img/sicbo/card/${data.game.cards[1]}.svg`;
        }

        if (isPair(data.game.cards[0], data.game.cards[1])) {
          this.aniPopup.result.result1 = 'Pair';
          this.aniPopup.result.result2 = '';
        } else {
          if (isSmall(data.game.cards[0], data.game.cards[1])) {
            this.aniPopup.result.result1 = 'Small';
          } else {
            this.aniPopup.result.result1 = 'Big';
          }

          if (isOdd(data.game.cards[0], data.game.cards[1])) {
            this.aniPopup.result.result2 = 'Odd';
          } else {
            this.aniPopup.result.result2 = 'Even';
          }
        }

        this.playSoundEffect('popup');
        this.aniPopup.result.show = true;
        this.handleRevealAni = setTimeout(() => {
          this.aniPopup.result.show = false;
          this.hits = getPositions(data.game.cards[0], data.game.cards[1]);
          
          this.initGame();
          this.handleRevealAni = setTimeout(() => {
            this.lastResult.cards = data.game.cards;
            this.lastResult.pair = isPair(data.game.cards[0], data.game.cards[1]);
            this.lastResult.small = isSmall(data.game.cards[0], data.game.cards[1]);
            this.lastResult.odd = isOdd(data.game.cards[0], data.game.cards[1]);
            this.hits = [];

            this.pushBetHistory(data, 'myBets');
            this.pushBetHistory(data, 'allBets');
          }, 3000);
          this.handleStartingAni = setTimeout(() => {
            this.betTimer = BET_TIMER;
            this.startGame();
          }, 3000);
        }, 2000);  
      }, 1000);
    },
    
    /**
     * toast UI를 출력한다.
     */
    showToast(msg) {
      this.isToast = true;
      this.alertMsg = msg;

      setTimeout(() => { this.isToast = false },1300)
    },
    
    /**
     * 배팅 히스토리를 화면에 고정하여 출력할 수 있는지 판단한다.
     */
    canDisplayBetHistory() {
      const availableSpace = (window.innerWidth - this.gameTable.width)/2
      this.alwaysOn = availableSpace > 246;
    },

    /**
     * 게임 이력을 서버로부터 조회한다.
     */
    fetchHistoryData() {
      if(this.account.name) {
        fetch(`${this.$REST_API_SERVER}/api/v1/games?account=${this.account.name}`)
          .then(res => res.json())
          .then(data => {
            this.myBets = data;
            if (data.length > 0) {
            const lastBet = data[0];
            this.lastResult = {
              cards: [lastBet.card1, lastBet.card2],
              pair: isPair(lastBet.card1, lastBet.card2),
              small: isSmall(lastBet.card1, lastBet.card2),
              odd: isOdd(lastBet.card1, lastBet.card2)
            } 
          }  
          })
          .catch(err => console.error(err));
      }
      fetch(`${this.$REST_API_SERVER}/api/v1/games`)
        .then(res => res.json())
        .then(data => {
          this.allBets = data
        })
        .catch(err => console.error(err));
    },

    /**
     * 카드번호에 해당하는 이미지 URI를 반환한다.
     */
    cardImg(cardNo) {
      const fileNo = (cardNo < 10 ? '0' : '') + (cardNo);
      return `/img/sicbo/card/${fileNo}.svg`
    },
    //
    // bet history에 게임결과 출력 Pair / Big / Small
    //
    historyResult1(card1, card2) {
      const cardA = Math.ceil((card1+1)/2);
      const cardB = Math.ceil((card2+1)/2);
      const result = (cardA + cardB) % 10;

      if(cardA === cardB)
        return 'Pair'

      if(result > 4)
        return 'Big'
      else  
        return 'Small'
    },
    //
    // bet history에 게임결과 출력 Odd / Even
    //
    historyResult2(card1, card2) {
      const cardA = Math.ceil((card1+1)/2);
      const cardB = Math.ceil((card2+1)/2);

      if(cardA === cardB) 
        return ''

      const result = (cardA + cardB) % 2;
      if(result === 1)
        return 'Odd';
      else  
        return 'Even'
    },
    //
    // 엄지 이미지 출력
    //
    thumbUrl(betdata) {
      return (betdata.prize_total-betdata.bet_total > 0) ? '/img/sicbo/thumb-up.svg' : '/img/sicbo/thumb-down.png';
    },
    //
    // 게임결과 reveal시, bet history에 추가
    //
    pushBetHistory(data, historyType) {
      this[historyType].unshift({ 
        bet_total: data.game.bet_total,
        prize_total: data.game.prize_total,
        card1: data.game.cards[0],
        card2: data.game.cards[1],
        uid: data.game.uid,
        reveal_trx: data.reveal.trx_id,
        id: data.game.gid
      });

      if(this[historyType].length > 50) {
        this[historyType] = this[historyType].splice(0, 50);
      }
    },
    //
    // 숫자 단위에 따른 양식
    //
    transNumber(betdata) {
      if(betdata > 1000000)
        return `${(betdata/1000000)}M`;
      else if(betdata > 1000)
        return `${(betdata/1000)}K`;
      else
        return `${betdata}`;
    },
    // 
    // 게임 상세정보 팝업을 닫는다.
    //
    closeHistoryDetail() {
      this.showHistoryDetail = false;
    },

    /**
     * 게임의 상세 정보를 팝업으로 출력한다.
     */
    showDetailPopup(bet) {
      this.historyDetail = Object.assign({}, bet);
      this.showHistoryDetail = true;
    },

    /**
     * type에 따른 효과음을 플레이한다.
     */
    playSoundEffect(type) {
      if (localStorage.getItem('GuangGame.effect') === 'on') {
        const player = this.getEffectPlayer(type);
        if (player) {
          player.pause();
          player.currentTime = 0;
          player.play();
        }
      }
    },

    /**
     * type에 따라 다른 audio 객체를 반환한다.
     */
    getEffectPlayer(type) {
      if (type === 'bet') {
        const betPlayer = document.getElementById('sound-effect-bet');
        return betPlayer;
      }

      const player = document.getElementById('sound-effect');
      switch (type) {
        case 'timer1':
          player.src = '/music/timer2.wav';
          break;
        case 'timer2':
          player.src = '/music/timer1.wav';
          break;
        case 'spread-card':
          player.src = '/music/spread-card.wav';
          break;
        case 'close-tong':
          player.src = '/music/close-tong.wav';
          break;
        case 'popup':
          player.src = '/music/result-popup.wav';
          break;
        case 'clear':
          player.src = '/music/disapper-chip.wav';
          break;
        case 'guang':
          player.src = '/music/guang-appears.wav';
          break;
        default:
          console.log('invalid sound file');
          break;
      }
      return player;
    },

    /**
     * iOS 인지 판단한다. (iOS에서는 배팅칩 효과음을 플레이하지 않는다.)
     */
    isiOS() {
      return (navigator.userAgent.indexOf('iPad') !== -1) || (navigator.userAgent.indexOf('iPhone') !== -1);
    },

    /**
     * 효과음 플레이어 객체를 초기화한다.
     * 모바일에서는 사용자 터치에서 해당 플레이어를 초기화하지 않으면 사운드를 플레이할 수 없도록 보안설정이 되어있다.
     */
    initSound(){
      if (!this.soundInitialized) {
        const player = document.getElementById('sound-effect');
        player.play();
        player.pause();
        const betPlayer = document.getElementById('sound-effect-bet');
        betPlayer.play();
        betPlayer.pause();
        this.soundInitialized = true;
      }
    },
    //
    // bet history를 닫는다
    //
    cloesBetHistory() {
      this.showHistoryRight = false;
      this.showHistoryLeft = false;
    },
    //
    // bet history가 닫히지 않도록 유지한다
    //
    showBetHistory(event) {
      event.stopPropagation();
    },

    /**
     * vues actions
     */
    ...mapMutations([
      'setAppbarMode',
      'setDrawerState',
      'setDrawerMode',
      'setTazchipBalance'
    ]),
    ...mapActions({
      closeDrawer: 'closeDrawer'
    })
  },
  
  components: {
    'g-pc-gametable': PcGameTable,
    'g-mobile-gametable': MobileGameTable,
    'swiper': swiper,
    'swiper-slide': swiperSlide,
    'g-footer': Footer,
    'modal-history-detail': HistoryDetail
  },

  directives: {
    resize,
  }
}
</script>

<style lang="scss" scoped>
@import '../scss/flex.scss';
@import "../scss/fonts.scss";
@import "../scss/variable.scss";
@import '~swiper/dist/css/swiper.css';

.bet-history-btn{
  display: none;
  position: absolute;
  background: #3C271B;
  width: 48px;
  height: 148px;
  font-size: 24px;
  color: #FEEAC6;
  line-height: 48px;
  text-align: center;
  z-index: 3000;

  @media( min-width: 1024px){
    display: block
  }

  @media(max-height: 679px) {
    display: none !important;
  }
}

.bet-history-left-btn{
  @extend .bet-history-btn;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.6);
  writing-mode: vertical-rl;
  left: 0;
}

.bet-history-right-btn{
  @extend .bet-history-btn;
  writing-mode: vertical-rl;
  box-shadow: 0 -3px 6px rgba(0, 0, 0, 0.6);
  transform: rotate(180deg);
  right:0;
}

.bet-to-left-enter-active, .bet-to-left-leave-active {
  transition: all 0.4s ease-out;
}

.bet-to-left-enter, .bet-to-left-leave-to {
  transform: translateX(100%);
}

.bet-to-right-enter-active, .bet-to-right-leave-active {
  transition: all 0.4s ease-out;
}

.bet-to-right-enter, .bet-to-right-leave-to {
  transform: translateX(-100%);
}

.bet-history{
  position: absolute;
  background: #3C271B;
  width: 246px;
  margin-top: 68px;
  z-index: 9999;

  @media(max-height: 679px) {
    display: none !important;
  }
}

.bet-history-left{
  @extend .bet-history;
  top: 0;
  left: 0;
  box-shadow: 5px 0px 10px rgba(0, 0, 0, 0.514);
}

.bet-history-right{
  @extend .bet-history;
  top:0;
  right: 0;
  box-shadow: -5px 0px 10px rgba(0, 0, 0, 0.514);
}

.history-title {
  width: 246px;
  height: 40px;
  background: #291B13;
  color: white;
  font-size: 18px;
  line-height: 40px;
  text-align: center;
}

.history-division {
  margin: 0;
  height: 4px;
  background: #F7E2C0;
}

.history-list-container {
  width: 100%;
  overflow-y: scroll;
  -ms-overflow-style: none; // IE에서 스크롤바 감춤

  &::-webkit-scrollbar {
    display: none !important; // 윈도우 크롬 등
  }
}

.history-list-row {
  @extend .flex;
  flex-wrap: wrap;
  height: 68px;
  box-sizing: border-box;
  padding: 8px;
  color: white;
  background: #3C271B;
  cursor: pointer;

  &:nth-child(2n) {
    background: #291B13;
  }

  &:hover {
    color: rgb(216, 216, 216);
  }
}

.history-card-wrap {
  display: inline-block;
  width: 60px;
  height: 47px;
}

.history-card {
  width: 50%;
  height: 100%;
}

.history-text-wrap {
  display: inline-block;
  margin-left: 11px;
  height: 47px;
}

.history-text-row {
  height: 24px;  

  &:first-child {
    margin-bottom: 4px;
  }

  &:nth-child(2) {
    display: flex;
  }
}

.history-text-result {
  display: inline-block;
  font-size: 20px;

  &:nth-child(1) {
    width:78px;
    margin-right: 16px
  }
}

.history-text-result2 {
  display: inline-block;
  font-size: 20px;
  margin-top: 12px;

  &:nth-child(1) {
    width:78px;
    margin-right: 16px
  }
}

.history-text-token {
  display: block;
  width: 127px;
  height: 100%;
  font-size: 14px;
  line-height: 24px;
  margin-right: 8px;
}

.all-bet-id {
  width: 100%;
  height: 14px;
  font-size: 14px;
  line-height: 16px;
  color: #FFF389;
  margin-bottom: 4px;
}

.history-list-row-allbet {
  @extend .flex;
  flex-wrap: wrap;
  height: 68px;
  box-sizing: border-box;
  padding: 8px;
  color: white;
  background: #3C271B;

  &:nth-child(2n) {
    background: #291B13;
  }
}

.toast{
  position: fixed;
  background: white;
  width: 324px;
  height: 184px;
  border-radius: 6px;
  color: black;
  top: 30%;
  left: 50%;
  margin-left: -162px;
  z-index: 9999;

  @media(min-width: 984px) {
    width: 436px;
    height: 184px;
  }
}

.toast-img {
  width: 98px;
  height: 84px;
  margin: 40px 113px 0;
  @media(min-width: 984px) {
    margin: 40px 169px 0;
  }
}

.toast-text {
  text-align: center;
  font-size: 14px;
  line-height: 40px;
}

.ingame-toast-enter-active, .ingame-toast-leave-active {
  transition: all .5s 
}

.ingame-toast-enter, .ingame-toast-leave-to  {
  opacity: 0;
  transform: translateY(-50%)
}

#sicbo {
  @extend .flex-wfill;
  display: block;
  margin: 0px;
  padding: 0px;
  width: 100%;
  height: 100%;
  background: #2C1106;
}

.game-table {
  width: 100%;
  background: linear-gradient(90deg, #4E4718 0%, #4A4417 5.38%, #5B531A 14.06%, #665D1C 29.4%, #6D631D 37.5%, #6F651D 45.83%, #6D631D 54.69%, #665D1C 64.06%, #5B531A 83.33%, #4A4417 94.79%, #4E4718 100%);
}

#chip-table {
  position:relative;
  width: 100%;
  height: 112px;
  background-image: url('/img/sicbo/gamechip/chip-floor.jpg');
  @extend .flex;
  @extend .flex-center;
  z-index: 100;
  align-items: flex-end!important;
}

#sicbo-footer {
  min-height: 400px;
  background: linear-gradient(180deg, #563008 0%, #2C1106 100%);
}

#sicbo-footer-mobile {
  position: relative;
  margin-top: 100px;
  height: 200px;
}

#chip-table-mobile {
  @extend .flex-column;
  position:relative;
  width: 100%;
  z-index: 100;
}

.chip-bar {
  @extend .flex;
  @extend .flex-center;
  @extend .flex-middle;
  height: 66px;
  margin-top: 0px;
  background-image: url('/img/sicbo/gamechip/chip-floor.jpg');
}
.status-bar {
  @extend .flex;
  @extend .flex-middle;
  justify-content: space-between!important;
  height: 24px;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  background: rgb(0, 0, 0);
  color: #FFFFFF;
}
.swiper-prev-mobile {
  width: 12px;
  height: 46px;
  @extend .flex;
  @extend .flex-center;
  @extend .flex-middle;
}

.swiper-next-mobile {
  width: 12px;
  height: 46px;
  @extend .flex;
  @extend .flex-center;
  @extend .flex-middle;
}

.chip-mobile {
  width: 46px;
  height: 46px;
  transition: transform .3s;
  z-index: 10;
  &.selected {
    transform: translateY(-8px);
  }
}

$cast-chip-mobile-size: 40px;
div.cast-chip-mobile {
  position: relative;
  top: -50%;
  width: $cast-chip-mobile-size;
  height: $cast-chip-mobile-size;
  margin-left: auto;
  margin-right: auto;
  transition: ease;
  opacity: 0;
  z-index: -100;

}
img.cast-chip-mobile {
  position: absolute;
  top: 0px;
  width: 100%;
  height: 100%;
}

// PC Chip table
.swiper-prev {
  width: 24px;
  height: 92px;
  @extend .flex;
  @extend .flex-center;
  @extend .flex-middle;
  margin-right: 8px;
}

.swiper-next {
  width: 24px;
  height: 92px;
  @extend .flex;
  @extend .flex-center;
  @extend .flex-middle;
  margin-left: 12px;
}

.chip {
  width: 92px;
  height: 92px;
  transition: transform .3s;
  z-index: 10;
  &.selected {
    transform: translateY(-14px);
  }
}

$cast-chip-size: 80px;
div.cast-chip {
  position: relative;
  top: -50%;
  left: -50%;
  width: $cast-chip-size;
  height: $cast-chip-size;
  transform: translateX(50%);
  transition: ease;
  opacity: 0;
  z-index: -100;
}
img.cast-chip {
  position: absolute;
  top: 0px;
  width: 100%;
  height: 100%;
  display: none;
}

.btn-bet-pc {
  width: 114px;
  height: 94px;
  margin-left: 12px;
  margin-right: auto;
  margin-top: auto;
  margin-bottom: auto;
  background-image: url('/img/sicbo/bg-btn-bet-pc.svg');
  background-size: cover;
  cursor: pointer;
  display: block;

  &:active {
    background-image: url('/img/sicbo/bg-btn-bet-pc-press.svg');
  }

  .title {
    width: 100%;
    height: 49px;
    font-style: normal;
    font-weight: 500;
    font-size: 32px;
    line-height: 42px;
    color: #FFFFFF;
    margin-top: 13px;
    @extend .flex;
    @extend .flex-middle;
    @extend .flex-center;
  }
  .value {
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    color: #000000;
    @extend .flex;
    @extend .flex-middle;
    @extend .flex-center;
  }
}

.btn-bet-mobile {
  position: absolute;
  width: 120px;
  height: 60px;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  background-image: url('/img/sicbo/bg-btn-bet-mobile.svg');
  background-size: cover;
  cursor: pointer;
  display: block;

  &:active {
    background-image: url('/img/sicbo/bg-btn-bet-mobile-press.svg');
  }

  .title {
    position: relative;
    width: 100%;
    height: 35px;
    font-style: normal;
    font-weight: 500;
    font-size: 30px;
    line-height: 35px;
    color: #FFFFFF;
    margin-top: 4px;
    @extend .flex;
    @extend .flex-middle;
    @extend .flex-center;
  }
  .value {
    position: relative;
    margin: auto 8px;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    color: #000000;
    @extend .flex;
    @extend .flex-middle;
    @extend .flex-center;
  }
}
  .fixed {
    top: - 68px;
  }

#ani-layout {
  position: fixed;
  top: 0%;
  left: 0%;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

@keyframes ain-start-txt {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes ani-start-box {
  0% {
    width: 0%;
  }
  10% {
    opacity: 1;
  }
  20% {
    width: 100%;
  }
  80% {
    width: 100%;
  }
  95% {
    opacity: 1;
  }
  100% {
    width: 0%;
    opacity: 0;
  }
}

@keyframes ani-start-img {
  0% {
    transform: rotate( 0deg );
  }
  10% {
    opacity: 1;
  }
  30% {
    transform: rotate( 360deg );
  }
  35% {
    transform: rotate( 360deg );
  }
  65% {
    transform: rotate( 720deg );
  }
  70% {
    transform: rotate( 720deg );
  }
  95% {
    opacity: 1;
  }
  100% {
    transform: rotate( 1080deg );
    opacity: 0;
  }
}

#ani-start {
  position: relative;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  background: rgba(0, 0, 0, 0.7);

  @media (min-width: 1024px) {
    width: 1000px;
  }

  .text {
    margin: 24px auto;
    text-align: center;
    color: orange;
    font-weight: 600;
    font-size: 32px;
    word-spacing: 1rem;
    opacity: 0;
    animation-name: ain-start-txt;
    animation-duration: 3s;
    animation-timing-function: ease-in-out;
    animation-delay: 0.5s;
    animation-iteration-count: 1;
    animation-direction: alternate;
    animation-fill-mode: none;
    animation-play-state: running;
    @media (min-width: 1024px) {
      font-size: 42px;
    }
  }
    
  .box {
    width: 100%;
    height: 20px;
    opacity: 0;
    background: linear-gradient(to right, orangered, orange, orangered );
    animation-name: ani-start-box;
    animation-duration: 4s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: 1;
    animation-direction: alternate;
    animation-fill-mode: none;
    animation-play-state: running;
  }

  .img-box {
    @extend .flex;
    @extend .flex-center;
    height: 200px;

    @media (min-width: 1024px) {
      height: 300px;
    }

    img {
      width: 30%;
      object-fit: contain;
      opacity: 0;
      animation-name: ani-start-img;
      animation-duration: 3s;
      animation-timing-function: ease-in-out;
      animation-delay: 0.5s;
      animation-iteration-count: 1;
      animation-direction: normal;
      animation-fill-mode: none;
      animation-play-state: running;

      @media (min-width: 1024px) {
        width: 20%;
      }
    }
  }
}

@keyframes ain-wait-result-txt-1 {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes ain-wait-result-txt-2 {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes ani-wait-result-box-1 {
  0% {
    width: 0%;
  }
  10% {
    opacity: 1;
  }
  100% {
    width: 100%;
    opacity: 1;
  }
}

@keyframes ani-wait-result-box-2 {
  0% {
    width: 100%;
  }
  100% {
    width: 0%;
    opacity: 0;
  }
}

@keyframes ani-wait-result-img {
  0% {
    transform: rotate( 0deg );
  }
  100% {
    transform: rotate( 360deg );
  }
}

#ani-wait-result {
  position: relative;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  width: 360px;
  @media (min-width: 1024px) {
    width: 1000px;
  }

  .text {
    margin: 24px auto;
    text-align: center;
    color: orange;
    font-size: 32px;
    font-weight: 600;
    word-spacing: 1rem;
    animation-name: ain-wait-result-txt-1;
    animation-duration: 1.5s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: 1;
    animation-direction: alternate;
    animation-fill-mode: none;
    animation-play-state: running;
    @media (min-width: 1024px) {
      font-size: 42px;
    }
  }
    
  .box {
    width: 100%;
    height: 20px;
    background: linear-gradient(to right, orangered, orange, orangered );
    animation-name: ani-wait-result-box-1;
    animation-duration: 2s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: 1;
    animation-direction: alternate;
    animation-fill-mode: none;
    animation-play-state: running;
  }

  .img-box {
    @extend .flex;
    @extend .flex-center;
    height: 200px;
    opacity: 0;
    transition: opacity 2s;
    transition-timing-function: ease-in-out;
    transition-delay: 0.5s;

    @media (min-width: 1024px) {
      height: 300px;
    }

    &.show {
      opacity: 1;
    }
  }

  img {
    width: 30%;
    object-fit: contain;
    animation-name: ani-wait-result-img;
    animation-duration: 1s;
    animation-timing-function: ease-in-out;
    animation-delay: 0.5s;
    animation-iteration-count: infinite;
    animation-direction: normal;
    animation-fill-mode: none;
    animation-play-state: running;

    @media (min-width: 1024px) {
      margin: 36px auto;
      width: 20%;
    }
  }
}

#ani-result {
  position: relative;
  top: 20%;
  left: 50%;
  width: 360px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  @media (min-width: 1024px) {
    width: 800px;
  }

  .text {
    @extend .flex;
    @extend .flex-center;
    @extend .flex-middle;
    margin: 24px auto;
    text-align: center;
    color: orange;
    font-size: 24px;
    font-weight: 600;
    word-spacing: 1rem;
    opacity: 0;
    animation-name: ain-start-txt;
    animation-duration: 3s;
    animation-timing-function: ease-in-out;
    animation-delay: 0.5s;
    animation-iteration-count: 1;
    animation-direction: alternate;
    animation-fill-mode: none;
    animation-play-state: running;
    @media (min-width: 1024px) {
      font-size: 64px;
    }
  }
    
  .box {
    width: 100%;
    height: 20px;
    opacity: 0;
    background: linear-gradient(to right, orangered, orange, orangered );
    animation-name: ani-start-box;
    animation-duration: 4s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: 1;
    animation-direction: alternate;
    animation-fill-mode: none;
    animation-play-state: running;
  }

  .img-box {
    @extend .flex;
    @extend .flex-center;
    @extend .flex-middle;

    height: 180px;

    @media (min-width: 1024px) {
      height: 300px;
    }
  }

  img {
    margin: 36px 16px;
    width: 15%;
  }
}

.no-rotate {
  transform: none !important;
}

.extend-tr-btn {
  height: 162px !important;
}

</style>

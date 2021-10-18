<template>
  <div id="mobile-game-table">
    <!-- Betting history -->
    <div class="m-row-bethsitory">
      <div class="m-btn-mybet" :class="{activated: isMybetActivated}" @click="toggleBetHistory('mybet')">{{$t('sicbo.history.my')}}</div>
      <div class="m-btn-allbet" :class="{activated: isAllbetActivated}" @click="toggleBetHistory('allbet')">{{$t('sicbo.history.past')}}</div>
    </div>
    <div ref="history" id="m-history" :class="classBetHisotry" v-overflow-scroll="true">
      <div v-show="stateBetHistoryUi==='mybet'">
        <div v-for="(bet, index) in myBets" :class="classBetHistory(index)" :key="bet.id" @click="showDetailPopup(bet)">
          <div class="col-card">
            <img :src="cardUrl(bet.card1)" class="history-card"/>
            <img :src="cardUrl(bet.card2)" class="history-card"/>
          </div>
          <div class="col-name">{{historyResult1(bet.card1, bet.card2)}}</div>
          <div class="col-odd-even">{{historyResult2(bet.card1, bet.card2)}}</div>
          <div class="col-prize">{{transNumber(bet.bet_total)}} Taz Chip</div>
          <div class="col-adjudgment"><img :src="thumbUrl(bet)" width="30px" height="30px"/></div>
        </div>
      </div>
      <div v-show="stateBetHistoryUi==='allbet'">
        <div v-for="(bet, index) in allBets" :class="classBetHistory(index)" :key="bet.id">
          <div class="col-card">
            <img :src="cardUrl(bet.card1)" class="history-card"/>
            <img :src="cardUrl(bet.card2)" class="history-card"/>
          </div>
          <div class="flex flex-wfill">
            <div class="col-allbet-result">{{historyResult1(bet.card1, bet.card2)}}</div>
            <div class="col-allbet-result">{{historyResult2(bet.card1, bet.card2)}}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="border-horizontal"></div>

    <!-- 화투판 -->
    <div class="m-row-game-board">
      <div class="pad">
        <div ref="leftCard" :class="classLeftCard" :style="`width:40px`">
          <div :class="classLeftFlipCard">
            <div class="card-face"><img src="/img/sicbo/card/back.svg" width="100%"/></div>
            <div class="card-face card-face-back"><img :src="imgCard1" width="100%"/></div>
          </div>
        </div>
        <div ref="rightCard" :class="classRightCard" :style="`width:40px`">
          <div :class="classRightFlipCard">
            <div class="card-face"><img src="/img/sicbo/card/back.svg" width="100%" /></div>
            <div class="card-face card-face-back"><img :src="imgCard2" width="100%"/></div>
          </div>
        </div>
        <div ref="tong" :class="classTong"><img src="/img/sicbo/tong.png" width="130px" style="z-index: 100;"/></div>
      </div>
      <div class="m-game-info">
        <div id="m-table-max">
          <div class="m-table-max-title">
            {{$t('sicbo.info.tablemaximum')}}
          </div>
          <div class="m-bet-amount-prgress-bg">
            <div class="m-bet-amount-progress" :style="`max-width:${currentBetRate}%`">&nbsp;</div>
            <div class="m-bet-amount-progress-rate">{{currentBetRate.toFixed(4)}}%</div>
          </div>
        </div>
        <div id="m-last-result">
          <div class="m-last-result-title"> {{$t('sicbo.info.lastresult')}}</div>
          <div class="flex">
            <div class="half flex flex-center">
              <img :src="lastResultCard1" class="card0"/>
              <img :src="lastResultCard2" class="card1"/>
            </div>
            <div id="last-result-desc"  v-if="!isMyBetEmpty">
              <div class="last-result-name" v-if="lastresult.pair">Pair</div>
              <div class="last-result-name" v-if="!lastresult.pair && lastresult.small">Small</div>
              <div class="last-result-name" v-if="!lastresult.pair && !lastresult.small">Big</div>
              <div class="last-result-name" v-if="!lastresult.pair && lastresult.odd">Odd</div>
              <div class="last-result-name" v-if="!lastresult.pair && !lastresult.odd">Even</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--  -->
    <div class="m-row-bet-0">
      <div class="m-row-bet-0-col-0">
        <div :class="`m-bet-small ${classBettingCells[0]}`" @click="bet(0, $event)">
          <div class="inner">
            <p style="margin-top: auto; margin-bottom: 4px">Small</p>
            <p style="margin-bottom: auto; margin-top: 4px" class="m-bet-small-range">0 ~ 4</p>
          </div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(0)" @cancel="cancelBet(0)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
        <div :class="`m-bet-odd  ${classBettingCells[3]}`"  @click="bet(3, $event)">
          <div class="inner">Odd</div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(3)" @cancel="cancelBet(3)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
        <div class="m-drate-0">
          <div style="margin-top:3px;margin-bottom:1px">1 : 1</div>
          <div>Lose if pair appears</div>
        </div>
      </div>
      <div :class="`m-row-bet-0-col-1 ${classBettingCells[1]}`" @click="bet(1, $event)">
        <div class="m-bet-guang">
          <div class="inner">光</div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(1)" @cancel="cancelBet(1)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
        <div class="m-drate-0">
          <div style="margin-top:3px;margin-bottom:1px">1 : 1.5</div>
          <div>Win if any 光 appears</div>
        </div>
      </div>
      <div class="m-row-bet-0-col-2">
        <div :class="`m-bet-small ${classBettingCells[2]}`" @click="bet(2, $event)">
          <div class="inner">
            <p style="margin-top: auto; margin-bottom: 4px">Big</p>
            <p style="margin-bottom: auto; margin-top: 4px" class="m-bet-small-range">5 ~ 9</p>
          </div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(2)" @cancel="cancelBet(2)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
        <div :class="`m-bet-odd ${classBettingCells[4]}`" @click="bet(4, $event)">
          <div class="inner">Even</div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(4)" @cancel="cancelBet(4)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
        <div class="m-drate-0">
          <div style="margin-top:3px;margin-bottom:1px">1 : 1</div>
          <div>Lose if pair appears</div>
        </div>
      </div>
    </div>
    
    <!-- -->
    <div class="m-row-bet-1">
      <div :class="`m-bet-guang-pair-left ${classBettingCells[5]}`" @click="bet(5, $event)">
        <div class="inner">
          <img src="/img/sicbo/card/00.svg" class="m-guangcard-left"/>
          <img src="/img/sicbo/card/01.svg" class="m-guangcard-right"/>
        </div>
        <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(5)" @cancel="cancelBet(5)" style="position: relative; top: -100%; height: 100%;"/>
      </div>
      <div :class="`m-bet-guang-pair-right ${classBettingCells[6]}`" @click="bet(6, $event)">
        <div class="inner">
          <img src="/img/sicbo/card/02.svg" class="m-guangcard-left"/>
          <img src="/img/sicbo/card/03.svg" class="m-guangcard-right"/>
        </div>
        <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(6)" @cancel="cancelBet(6)" style="position: relative; top: -100%; height: 100%;"/>
      </div>
    </div>
    <div class="m-row-bet-1">
      <div :class="`m-bet-guang-pair-left ${classBettingCells[7]}`" @click="bet(7, $event)">
        <div class="inner">
          <img src="/img/sicbo/card/04.svg" class="m-guangcard-left"/>
          <img src="/img/sicbo/card/05.svg" class="m-guangcard-right"/>
        </div>
        <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(7)" @cancel="cancelBet(7)" style="position: relative; top: -100%; height: 100%;"/>
      </div>
      <div :class="`m-bet-guang-pair-right ${classBettingCells[8]}`" @click="bet(8, $event)">
        <div class="inner">
          <img src="/img/sicbo/card/06.svg" class="m-guangcard-left"/>
          <img src="/img/sicbo/card/07.svg" class="m-guangcard-right"/>
        </div>
        <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(8)" @cancel="cancelBet(8)" style="position: relative; top: -100%; height: 100%;"/>
      </div>
    </div>
    <div class="m-row-bet-1">
      <div :class="`m-bet-guang-pair-left ${classBettingCells[9]}`" @click="bet(9, $event)">
        <div class="inner">
          <img src="/img/sicbo/card/08.svg" class="m-guangcard-left"/>
          <img src="/img/sicbo/card/09.svg" class="m-guangcard-right"/>
        </div>
        <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(9)" @cancel="cancelBet(9)" style="position: relative; top: -100%; height: 100%;"/>
      </div>
      <div :class="`m-bet-guang-pair-right ${classBettingCells[10]}`" @click="bet(10, $event)">
        <div class="inner">
          <img src="/img/sicbo/card/10.svg" class="m-guangcard-left"/>
          <img src="/img/sicbo/card/11.svg" class="m-guangcard-right"/>
        </div>
        <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(10)" @cancel="cancelBet(10)" style="position: relative; top: -100%; height: 100%;"/>
      </div>
    </div>
    <div class="m-row-bet-1">
      <div :class="`m-bet-guang-pair-left ${classBettingCells[11]}`" @click="bet(11, $event)">
        <div class="inner">
          <img src="/img/sicbo/card/12.svg" class="m-guangcard-left"/>
          <img src="/img/sicbo/card/13.svg" class="m-guangcard-right"/>
        </div>
        <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(11)" @cancel="cancelBet(11)" style="position: relative; top: -100%; height: 100%;"/>
      </div>
      <div :class="`m-bet-guang-pair-right ${classBettingCells[12]}`" @click="bet(12, $event)">
        <div class="inner">
          <img src="/img/sicbo/card/14.svg" class="m-guangcard-left"/>
          <img src="/img/sicbo/card/15.svg" class="m-guangcard-right"/>
        </div>
        <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(12)" @cancel="cancelBet(12)" style="position: relative; top: -100%; height: 100%;"/>
      </div>
    </div>
    <div class="m-row-bet-1">
      <div :class="`m-bet-guang-pair-left ${classBettingCells[13]}`" @click="bet(13, $event)">
        <div class="inner">
          <img src="/img/sicbo/card/16.svg" class="m-guangcard-left"/>
          <img src="/img/sicbo/card/17.svg" class="m-guangcard-right"/>
        </div>
        <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(13)" @cancel="cancelBet(13)" style="position: relative; top: -100%; height: 100%;"/>
      </div>
      <div :class="`m-bet-guang-pair-right ${classBettingCells[14]}`" @click="bet(14, $event)">
        <div class="inner">
          <img src="/img/sicbo/card/18.svg" class="m-guangcard-left"/>
          <img src="/img/sicbo/card/19.svg" class="m-guangcard-right"/>
        </div>
        <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(14)" @cancel="cancelBet(14)" style="position: relative; top: -100%; height: 100%;"/>
      </div>
    </div>
    <div class="m-drate-1">
      1: 150
    </div>

    <!-- -->
    <div :class="`m-bet-pair ${classBettingCells[15]}`" @click="bet(15, $event)">
      <div class="inner">
        <p style="margin-top: auto; margin-bottom: 4px">Pair</p>
        <p style="margin-bottom: auto; margin-top: 4px" class="m-bet-pair-range">1 ~ 10</p>
      </div>
      <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(15)" @cancel="cancelBet(15)" style="position: relative; top: -100%; height: 100%;"/>
    </div>
    <div class="m-drate-1">
      1 : 15
    </div>

    <!-- -->
    <div class="m-row-bet">
      <div class="border-right half">
        <div :class="`m-bet-etc-top ${classBettingCells[16]}`" @click="bet(16, $event)">
          <div class="inner">1</div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(16)" @cancel="cancelBet(16)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
        <div :class="`m-bet-etc-bottom ${classBettingCells[21]}`" @click="bet(21, $event)">
          <div class="inner">6</div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(21)" @cancel="cancelBet(21)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
      </div>
      <div class="border-right half">
        <div :class="`m-bet-etc-top ${classBettingCells[17]}`" @click="bet(17, $event)">
          <div class="inner">2</div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(17)" @cancel="cancelBet(17)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
        <div :class="`m-bet-etc-bottom ${classBettingCells[22]}`" @click="bet(22, $event)">
          <div class="inner">7</div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(22)" @cancel="cancelBet(22)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
      </div>
      <div class="border-right half">
        <div :class="`m-bet-etc-top ${classBettingCells[18]}`" @click="bet(18, $event)">
          <div class="inner">3</div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(18)" @cancel="cancelBet(18)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
        <div :class="`m-bet-etc-bottom ${classBettingCells[23]}`" @click="bet(23, $event)">
          <div class="inner">8</div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(23)" @cancel="cancelBet(23)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
      </div>
      <div class="border-right half">
        <div :class="`m-bet-etc-top ${classBettingCells[19]}`" @click="bet(19, $event)">
          <div class="inner">4</div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(19)" @cancel="cancelBet(19)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
        <div :class="`m-bet-etc-bottom ${classBettingCells[24]}`" @click="bet(24, $event)">
          <div class="inner">9</div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(24)" @cancel="cancelBet(24)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
      </div>
      <div class="half">
        <div :class="`m-bet-etc-top ${classBettingCells[20]}`" @click="bet(20, $event)">
          <div class="inner">5</div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(20)" @cancel="cancelBet(20)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
        <div :class="`m-bet-etc-bottom ${classBettingCells[25]}`" @click="bet(25, $event)">
          <div class="inner">10</div>
          <g-bet-state mode="mobile" chipSize="40px" :chipselected="chipselected" :amount="betAmount(25)" @cancel="cancelBet(25)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
      </div>
    </div>
    <div class="m-drate-1">
      1 : 4
    </div>
  </div>
</template>

<script>
import BetState from './BetState.vue';
import { setTimeout, clearTimeout } from 'timers';
import { isPair, isSmall, isOdd } from '../../js/sicbo.js';

const MAX_BET_PER_GAME = 50000000;  // 최대 배팅 금액

export default {
  data() {
    return {
      stateBetHistoryUi: 'hide', // '' | 'hide'
      classBetHisotry: 'm-box-bet-history m-box-bet-history-close', // 배팅 히스토리 UI 애니메이션 제어를 위한 css class
      betHistoryTransition: undefined,  // 배팅 히스토리 UI 애니메이션 제어를 위한 timer 핸들러
      classLeftCard: 'card',  // 첫 번째 화투의 css class
      classRightCard: 'card',  // 두 번째 화투의 css class
      imgCard1: 0,  // 첫 번째 카드 번호
      imgCard2: 1,  // 두 번째 카드 번호
      classLeftFlipCard: 'fcard', // 첫 번째 화투의 flip 애니메이션 css class
      classRightFlipCard: 'fcard', // 두 번째 화투의 flip 애니메이션 css class
      classTong: 'tong',  // 식보통 css class

      timerString: '--:--',  // 배팅 타이머
      statusString: '',  // 배팅 상태 이름

      isMybetActivated: false,  // My bet 히스토리 활성 여부
      isAllbetActivated: false,  // All bet 히스토리 활성 여부

      classBettingCells: [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],  // 당첨된 포지션을 표시하는 css class
    }
  },
  props: {
    bets: {  // 배팅 데이터
      type: Array,
      default: () => []
    },
    chipselected: {  // 칩 선택 여부
      type: Boolean,
      default: false
    },
    hits: {  // 담청 포지션 정보
      type: Array,
      default: () => []
    },
    lastresult: {  // 마지막 게임 정보
      type: Object,
      default: () => {
        return {
          cards: [0, 0],
          pair: false,
          small: false,
          odd: false
        }
      }
    },
    myBets: {  // 로그인한 사용자의 배팅 이력
      type: Array,
      default: () => [ {card1: 1, card2: 1, bet_total: 0, prize_total: 0 }]
    },
    allBets: { // 전체 사용자의 배팅 이력
      type: Array,
      default: () => [ {card1: 1, card2: 1, bet_total: 0, prize_total: 0 }]
    },
    isMyBetEmpty: {
      type: Boolean,
      default: () => true
    }
  },
  watch: {
    /**
     * 담청 포지션 애니메이션 출력
     */
    hits: function(hits) {
      const cells = [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
      for (let idx = 0; idx < hits.length; idx++) {
        cells[hits[idx]] = 'm-twinkle';
      }

      this.classBettingCells = cells;
    }
  },
  computed: {
    /**
     * 최대 배팅 가능액에 대한 현재 배팅액의 비율
     */
    currentBetRate() {
      const total = this.bets.reduce((total, bet) => total + bet.amount, 0);
      return total / MAX_BET_PER_GAME * 100;
    },

    /**
     * 마지막 게임의 첫 번째 카드
     */
    lastResultCard1() {
      if (this.lastresult.cards[0] === -1) {
        return '/img/sicbo/card/back.svg'
      } else if (this.lastresult.cards[0] < 10) {
        return `/img/sicbo/card/0${this.lastresult.cards[0]}.svg`
      }
      return `/img/sicbo/card/${this.lastresult.cards[0]}.svg`
    },

    /**
     * 마지막 게임의 두 번째 카드
     */
    lastResultCard2() {
      if (this.lastresult.cards[1] === -1) {
        return '/img/sicbo/card/back.svg'
      } else if (this.lastresult.cards[1] < 10) {
        return `/img/sicbo/card/0${this.lastresult.cards[1]}.svg`
      }
      return `/img/sicbo/card/${this.lastresult.cards[1]}.svg`
    },
  },
  methods: {
    /**
     * 포지션의 배팅 금액
     * 
     * @param id 포지션 ID
     */
    betAmount(id) {
      return this.bets[id].amount;
    },

    /**
     * 선택된 배팅 히스토리 UI 표시
     * 
     * @param type mybet | allbet
     */
    setActivate(type){
      if(type==='mybet'&& this.isMybetActivated === false){
        this.isMybetActivated = true;
        this.isAllbetActivated = false;
        return;
      }else if(type === 'allbet' && this.isAllbetActivated === false){
        this.isMybetActivated = false;
        this.isAllbetActivated = true;
        return;
      }
      this.isMybetActivated = false;
      this.isAllbetActivated = false;
    },

    /**
     * 배팅 히스토리 UI 토글
     * 
     * @param type mybet | allbet
     */
    toggleBetHistory(type) {
      this.setActivate(type);
      if (this.betHistoryTransition) {
        clearTimeout(this.betHistoryTransition);
      }

      if (this.stateBetHistoryUi === 'hide') {
        this.classBetHisotry = 'm-box-bet-history m-box-bet-history-open';
        this.betHistoryTransition = setTimeout(() => {
          this.classBetHisotry = 'm-box-bet-history';
        }, 500);
      } else if (this.stateBetHistoryUi === type) {
        this.stateBetHistoryUi = 'hide';
        this.classBetHisotry = 'm-box-bet-history m-box-bet-history-close';
        return;
      }

      this.stateBetHistoryUi = type;
      this.$refs.history.scrollTop = 0;
    },

    /**
     * 배팅 히스토리 리스트 아이템 css class
     */
    classBetHistory(idx) {
      return (idx % 2) ? 'm-history-row-light' : 'm-history-row-dark';
    },

    /**
     * 카드 번호에 대한 이미지 경로
     */
    cardUrl(num) {
      return (num >= 10) ? `/img/sicbo/card/${num}.svg` : `/img/sicbo/card/0${num}.svg`
    },

    /**
     * 첫 번째 화투 투척 애니메이션
     */
    cast1stCard() {
      this.classLeftCard = 'card cast-to-left';
    },

    /**
     * 두 번째 화투 애니메이션
     */
    cast2ndCard() {
      this.classRightCard = 'card cast-to-right';
    },

    /**
     * 식보통을 덮는 애니메이션
     */
    closeTong() {
      this.classTong = "tong close";
    },

    /**
     * 식보통을 여는 애니메이션
     */
    openTong() {
      this.classTong = "tong";
    },

    /**
     * 첫 번째 화투를 오픈하는 애니메이션
     */
    open1stCard(num) {
      if (num < 10) {
        this.imgCard1 = `/img/sicbo/card/0${num}.svg`;
      } else {
        this.imgCard1 = `/img/sicbo/card/${num}.svg`;
      }
      this.classLeftFlipCard = 'fcard is-flipped';
    },

    /**
     * 두 번째 화투를 오픈하는 애니메이션
     */
    open2ndCard(num) {
      if (num < 10) {
        this.imgCard2 = `/img/sicbo/card/0${num}.svg`;
      } else {
        this.imgCard2 = `/img/sicbo/card/${num}.svg`;
      }
      this.classRightFlipCard = 'fcard is-flipped';
    },

    /**
     * 게임을 정리
     */
    stopGame() {
      this.classLeftCard = 'card';
      this.classRightCard = 'card';
      this.classLeftFlipCard = 'fcard';
      this.classRightFlipCard = 'fcard';
      this.classTong = 'tong';
    },

    /**
     * 배팅
     * 
     * @param id 포지션 ID
     * @param $event 터치 이벤트 데이터
     */
    bet(id, event) {
      this.$emit('bet', {id: id, tableType: 'mobile', x: event.clientX, y:event.clientY});
    },

    /**
     * 히스토리의 첫 번째 결과
     */
    historyResult1(card1, card2) {
      if (isPair(card1, card2)) {
        return 'Pair'
      }
      
      if (isSmall(card1, card2)) {
        return 'Small'
      }
      
      return 'Big'
    },

    /**
     * 히스토리의 두 번째 결과
     */
    historyResult2(card1, card2) {
      if (isPair(card1, card2)) {
        return ''
      }
      
      if (isOdd(card1, card2)) {
        return 'Odd';
      }
      
      return 'Even'
    },

    /**
     * 화투 이미지
     */
    thumbUrl(betdata) {
      if(betdata.prize_total-betdata.bet_total > 0)
        return '/img/sicbo/thumb-up.svg'
      return '/img/sicbo/thumb-down.png'
    },

    /**
     * 숫자를 K, M 단위로 변환
     */
    transNumber(betdata) {
      if(betdata > 1000000)
        return (betdata/1000000)+'M'
      else if(betdata > 1000)
        return (betdata/1000) + 'K'
      else
        return betdata
    },

    /**
     * 히스토리 상세 UI 출력
     */
    showDetailPopup(bet) {
      this.$emit('show-detail', bet);
    }
  },
  components: {
    'g-bet-state': BetState
  }
}
</script>

<style lang="scss" scoped>
@import '../../scss/sicbo/mobile-game-table.scss';
</style>
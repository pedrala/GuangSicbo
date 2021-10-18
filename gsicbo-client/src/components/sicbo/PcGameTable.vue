<template>
  <div id="layout" :style="styleLayout">
    <!-- Information row -->
    <div id="row-info" :style="`height:${rowInfo}px`">
      <div class="side">
        <!-- Table Maximum -->
        <div class="box-maximum">
          <div class="box">
            <div class="title title-tablemaximum" :style="`font-size:${fontSizeTitle1}px;`">
              {{$t('sicbo.info.tablemaximum')}}
            </div>
            <div class="content">
              <div class="bet-amount-prgress-bg">
                <div class="bet-amount-progress" :style="`max-width:${currentBetRate}%`">&nbsp;</div>
                <div class="bet-amount-progress-rate">{{currentBetRate.toFixed(4)}}%</div>
              </div>
            </div>
          </div>
        </div>
        <!-- Time Left -->
        <div class="box-timer">
          <div class="bg-timer">
            <div class="title" :style="`font-size:${fontSizeTitle1}px;`">
               {{$t('sicbo.status.timeleft')}}
            </div>
            <div class="content" :style="`font-size:${fontSizeTimer}px;`">
              {{timerString}}
            </div>
          </div>
        </div>
      </div>
      <div class="center">
      </div>
      <div class="side">
        <!-- Game status -->
        <div class="box-timer">
          <div :class="classStatus"  :style="`font-size:${fontSizeStatus}px;`">
            {{$t(`sicbo.status.${statusString}`)}}
          </div>
        </div>
        <!-- Last result -->
        <div class="box-maximum">
          <div class="bg-last-result">
            <div class="box-card">
              <img :src="lastResultCard1" width="40%" style="margin-right:4px;">
              <img :src="lastResultCard2" width="40%" style="margin-left:4px;">
            </div>
            <div class="text">
              <div class="title" :style="`font-size:${fontSizeTitle1}px;`"> {{$t('sicbo.info.lastresult')}}</div>
              <div class="result" v-if="!isMyBetEmpty">
                <div class="flex-wfill flex flex-center" :style="`font-size:${fontSizeTitle1}px;`" v-if="lastresult.pair">Pair</div>
                <div class="flex-wfill flex flex-center" :style="`font-size:${fontSizeTitle1}px;`" v-if="!lastresult.pair && lastresult.small">Small</div>
                <div class="flex-wfill flex flex-center" :style="`font-size:${fontSizeTitle1}px;`" v-if="!lastresult.pair && !lastresult.small">Big</div>
                <div class="flex-wfill flex flex-center" :style="`font-size:${fontSizeTitle1}px;`" v-if="!lastresult.pair && lastresult.odd">Odd</div>
                <div class="flex-wfill flex flex-center" :style="`font-size:${fontSizeTitle1}px;`" v-if="!lastresult.pair && !lastresult.odd">Even</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 1st bet row -->
    <div id="row-bet0" :style="`height:${rowBet0}px`" class="border-bottom">
      <div class="side">
        <div :class="`box-big-small border-top border-left border-right ${classBettingCells[0]}`" @click="bet(0, $event)">
          <div class="flex-column flex-center flex-middle" style="height: 98%;">
            <div class="range0" :style="`font-size:${fontSizeRange}px;`">0 ~ 4</div>
            <div class="name0" :style="`font-size:${fontSizeName}px;`">Small</div>
            <div class="desc0" :style="`font-size:${fontSizeDividend}px;padding-top:${padSizeDesc}px`">
              <div class="flex flex-center">1 : 1</div>
              <div class="flex flex-center">Lose if pair appears</div>
            </div>
          </div>
          <g-bet-state :chipselected="chipselected" :amount="betAmount(0)" @cancel="cancelBet(0)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
        <div :class="`box-odd-even border-top border-right ${classBettingCells[3]}`" @click="bet(3, $event)">
          <div class="flex-column flex-center flex-middle" style="height: 98%;">
            <div class="range0" :style="`font-size:${fontSizeRange}px;`">&nbsp;</div>
            <div class="name0" :style="`font-size:${fontSizeName}px;`">Odd</div>
            <div class="desc0" :style="`font-size:${fontSizeDividend}px;padding-top:${padSizeDesc}px`">
              <div class="flex flex-center">1 : 1</div>
              <div class="flex flex-center">Lose if pair appears</div>
            </div>
          </div>
          <g-bet-state :chipselected="chipselected" :amount="betAmount(3)" @cancel="cancelBet(3)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
      </div>
      <div class="center">
      </div>
      <div class="side">
        <div :class="`box-odd-even border-top border-left border-right ${classBettingCells[4]}`" @click="bet(4, $event)">
          <div class="flex-column flex-center flex-middle" style="height: 98%;">
            <div class="range0" :style="`font-size:${fontSizeRange}px;`">&nbsp;</div>
            <div class="name0" :style="`font-size:${fontSizeName}px;`">Even</div>
            <div class="desc0" :style="`font-size:${fontSizeDividend}px;padding-top:${padSizeDesc}px`">
              <div class="flex flex-center">1 : 1</div>
              <div class="flex flex-center">Lose if pair appears</div>
            </div>
          </div>
          <g-bet-state :chipselected="chipselected" :amount="betAmount(4)" @cancel="cancelBet(4)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
        <div :class="`box-big-small border-top border-right ${classBettingCells[2]}`" @click="bet(2, $event)">
          <div class="flex-column flex-center flex-middle" style="height: 98%;">
            <div class="range0" :style="`font-size:${fontSizeRange}px;`">5 ~ 9</div>
            <div class="name0" :style="`font-size:${fontSizeName}px;`">Big</div>
            <div class="desc0" :style="`font-size:${fontSizeDividend}px;padding-top:${padSizeDesc}px`">
              <div class="flex flex-center">1 : 1</div>
              <div class="flex flex-center">Lose if pair appears</div>
            </div>
          </div>
          <g-bet-state :chipselected="chipselected" :amount="betAmount(2)" @cancel="cancelBet(2)" style="position: relative; top: -100%; height: 100%;"/>
        </div>
      </div>
    </div>
    <!-- 2nd bet row -->
    <div id="row-bet1" :style="`height:${rowBet1}px`" class="border-bottom">
      <div class="side">
        <div class="box-padding border-left-padding border-right">&nbsp;</div>
        <div class="box-bet border-right">
          <div class="flex border-bottom flex-wfill" :style="`height:${rowBet1 - rowBet4}px`">
            <div :class="`box-card border-right ${classBettingCells[5]}`"  :style="`height:${rowBet1 - rowBet4}px`" @click="bet(5, $event)">
              <div class="flex flex-center flex-middle" :style="`height:${rowBet1 - rowBet4}px`">
                <img src="/img/sicbo/card/00.svg" class="left"/>
                <img src="/img/sicbo/card/01.svg" class="right"/>
              </div>
              <g-bet-state :chipselected="chipselected" :amount="betAmount(5)" @cancel="cancelBet(5)" style="position: relative; top: -102%; height: 100%;"/>
            </div>
            <div :class="`box-card ${classBettingCells[6]}`" :style="`height:${rowBet1 - rowBet4}px`" @click="bet(6, $event)">
              <div class="flex flex-center flex-middle" :style="`height:${rowBet1 - rowBet4}px`">
                <img src="/img/sicbo/card/02.svg" class="left"/>
                <img src="/img/sicbo/card/03.svg" class="right"/>
              </div>
              <g-bet-state :chipselected="chipselected" :amount="betAmount(6)" @cancel="cancelBet(6)" style="position: relative; top: -102%; height: 100%;"/>
            </div>
          </div>
          <div class="dividend" :style="`height:${rowBet4 - 4}px;font-size:${fontSizeDividend}px`">1: 150</div>
        </div>
      </div>
      <div :class="`center ${classBettingCells[1]}`" @click="bet(1, $event)" id="bet5">
        <div :style="`width: 100%; height: 100%;`">
          <div class="guang" :style="`font-size:${fontSizeGuang}px`">光</div>
          <div class="desc0" :style="`font-size:${fontSizeDividend}px;padding-top:${padSizeDesc}px`">
            <div class="flex flex-center">1 : 1.5</div>
            <div class="flex flex-center">Lose if pair appears</div>
          </div>
        </div>
        <g-bet-state :chipselected="chipselected" :amount="betAmount(1)" @cancel="cancelBet(1)" style="position: relative; top: -102%; height: 100%;"/>
      </div>
      <div class="side">
        <div class="box-bet border-left">
          <div class="flex border-bottom" :style="`height:${rowBet1 - rowBet4}px`">
            <div :class="`box-card border-right ${classBettingCells[10]}`" :style="`height:${rowBet1 - rowBet4}px`" @click="bet(10, $event)">
              <div class="flex flex-center flex-middle" :style="`height:${rowBet1 - rowBet4}px`">
                <img src="/img/sicbo/card/10.svg" class="left"/>
                <img src="/img/sicbo/card/11.svg" class="right"/>
              </div>
              <g-bet-state :chipselected="chipselected" :amount="betAmount(10)" @cancel="cancelBet(10)" style="position: relative; top: -102%; height: 100%;"/>
            </div>
            <div :class="`box-card ${classBettingCells[11]}`" :style="`height:${rowBet1 - rowBet4}px`" @click="bet(11, $event)">
              <div class="flex flex-center flex-middle" :style="`height:${rowBet1 - rowBet4}px`">
                <img src="/img/sicbo/card/12.svg" class="left"/>
                <img src="/img/sicbo/card/13.svg" class="right"/>
              </div>
              <g-bet-state :chipselected="chipselected" :amount="betAmount(11)" @cancel="cancelBet(11)" style="position: relative; top: -102%; height: 100%;"/>
            </div>
          </div>
          <div class="dividend" :style="`height:${rowBet4 - 4}px;font-size:${fontSizeDividend}px`">1: 150</div>
        </div>
        <div class="box-padding border-left border-right-padding">&nbsp;</div>
      </div>
    </div>
    <!-- 3th bet row -->
    <div id="row-bet2" :style="`height:${rowBet2}px`" class="border-bottom">
      <div class="side-column">
        <div class="flex border-bottom" :style="`height:${rowBet2 - rowBet4}px`">
          <div :class="`box-bet border-left border-right ${classBettingCells[7]}`" :style="`height:${rowBet2 - rowBet4}px`" @click="bet(7, $event)">
            <div class="flex-wfill flex flex-center flex-middle" :style="`height:${rowBet2 - rowBet4}px`">
              <img src="/img/sicbo/card/04.svg" class="left"/>
              <img src="/img/sicbo/card/05.svg" class="right"/>
            </div>
            <g-bet-state :chipselected="chipselected" :amount="betAmount(7)" @cancel="cancelBet(7)" style="position: relative; top: -102%; height: 100%;"/>
          </div>
          <div :class="`box-bet border-right ${classBettingCells[8]}`" :style="`height:${rowBet2 - rowBet4}px`" @click="bet(8, $event)">
            <div class="flex-wfill flex flex-center flex-middle" :style="`height:${rowBet2 - rowBet4}px`">
              <img src="/img/sicbo/card/06.svg" class="left"/>
              <img src="/img/sicbo/card/07.svg" class="right"/>
            </div>
            <g-bet-state :chipselected="chipselected" :amount="betAmount(8)" @cancel="cancelBet(8)" style="position: relative; top: -102%; height: 100%;"/>
          </div>
          <div :class="`box-bet border-right ${classBettingCells[9]}`" :style="`height:${rowBet2 - rowBet4}px`" @click="bet(9, $event)">
            <div class="flex-wfill flex flex-center flex-middle" :style="`height:${rowBet2 - rowBet4}px`">
              <img src="/img/sicbo/card/08.svg" class="left"/>
              <img src="/img/sicbo/card/09.svg" class="right"/>
            </div>
            <g-bet-state :chipselected="chipselected" :amount="betAmount(9)" @cancel="cancelBet(9)" style="position: relative; top: -102%; height: 100%;"/>
          </div>
        </div>
        <div class="dividend border-left border-right" :style="`height:${rowBet4 - 4}px;font-size:${fontSizeDividend}px`">1: 150</div>
      </div>
      <div :class="`center ${classBettingCells[15]}`" @click="bet(15, $event)">
        <div :style="`width: 100%; height: 100%;`">
          <div class="range1" :style="`font-size:${fontSizeRange}px;`">1 ~ 10</div>
          <div class="name1" :style="`font-size:${fontSizeName}px;`">Pair</div>
          <div class="desc1" :style="`font-size:${fontSizeDividend}px;`">
            <div class="flex flex-center">1 : 15</div>
          </div>
        </div>
        <g-bet-state :chipselected="chipselected" :amount="betAmount(15)" @cancel="cancelBet(15)" style="position: relative; top: -102%; height: 100%;"/>
      </div>
      <div class="side-column">
        <div class="flex border-bottom" :style="`height:${rowBet2 - rowBet4}px`">
          <div :class="`box-bet border-left border-right ${classBettingCells[12]}`" :style="`height:${rowBet2 - rowBet4}px`" @click="bet(12, $event)">
            <div class="flex-wfill flex flex-center flex-middle" :style="`height:${rowBet2 - rowBet4}px`">
              <img src="/img/sicbo/card/14.svg" class="left"/>
              <img src="/img/sicbo/card/15.svg" class="right"/>
            </div>
            <g-bet-state :chipselected="chipselected" :amount="betAmount(12)" @cancel="cancelBet(12)" style="position: relative; top: -102%; height: 100%;"/>
          </div>
          <div :class="`box-bet border-right ${classBettingCells[13]}`" :style="`height:${rowBet2 - rowBet4}px`" @click="bet(13, $event)">
            <div class="flex-wfill flex flex-center flex-middle" :style="`height:${rowBet2 - rowBet4}px`">
              <img src="/img/sicbo/card/16.svg" class="left"/>
              <img src="/img/sicbo/card/17.svg" class="right"/>
            </div>
            <g-bet-state :chipselected="chipselected" :amount="betAmount(13)" @cancel="cancelBet(13)" style="position: relative; top: -102%; height: 100%;"/>
          </div>
          <div :class="`box-bet border-right ${classBettingCells[14]}`" :style="`height:${rowBet2 - rowBet4}px`" @click="bet(14, $event)">
            <div class="flex-wfill flex flex-center flex-middle" :style="`height:${rowBet2 - rowBet4}px`">
              <img src="/img/sicbo/card/18.svg" class="left"/>
              <img src="/img/sicbo/card/19.svg" class="right"/>
            </div>
            <g-bet-state :chipselected="chipselected" :amount="betAmount(14)" @cancel="cancelBet(14)" style="position: relative; top: -102%; height: 100%;"/>
          </div>
        </div>
        <div class="dividend border-left border-right" :style="`height:${rowBet4 - 4}px;font-size:${fontSizeDividend}px`">1: 150</div>
      </div>
    </div>
    <!-- 4th bet row -->
    <div id="row-bet3" :style="`height:${rowBet3}px`" class="border-bottom">
      <div :class="`box-bet border-left border-right ${classBettingCells[16]}`" :style="`font-size:${fontSizeNumber}px`" @click="bet(16, $event)">
        <div class="flex flex-center flex-middle" :style="`height:${rowBet3}px`">1</div>
        <g-bet-state :chipselected="chipselected" :amount="betAmount(16)" @cancel="cancelBet(16)" style="position: relative; top: -102%; height: 100%;"/>
      </div>
      <div :class="`box-bet border-right ${classBettingCells[17]}`" :style="`font-size:${fontSizeNumber}px`" @click="bet(17, $event)">
        <div class="flex flex-center flex-middle" :style="`height:${rowBet3}px`">2</div>
        <g-bet-state :chipselected="chipselected" :amount="betAmount(17)" @cancel="cancelBet(17)" style="position: relative; top: -102%; height: 100%;"/>
      </div>
      <div :class="`box-bet border-right ${classBettingCells[18]}`" :style="`font-size:${fontSizeNumber}px`" @click="bet(18, $event)">
        <div class="flex flex-center flex-middle" :style="`height:${rowBet3}px`">3</div>
        <g-bet-state :chipselected="chipselected" :amount="betAmount(18)" @cancel="cancelBet(18)" style="position: relative; top: -102%; height: 100%;"/>
      </div>
      <div :class="`box-bet border-right ${classBettingCells[19]}`" :style="`font-size:${fontSizeNumber}px`" @click="bet(19, $event)">
        <div class="flex flex-center flex-middle" :style="`height:${rowBet3}px`">4</div>
        <g-bet-state :chipselected="chipselected" :amount="betAmount(19)" @cancel="cancelBet(19)" style="position: relative; top: -102%; height: 100%;"/>
      </div>
      <div :class="`box-bet border-right ${classBettingCells[20]}`" :style="`font-size:${fontSizeNumber}px`" @click="bet(20, $event)">
        <div class="flex flex-center flex-middle" :style="`height:${rowBet3}px`">5</div>
        <g-bet-state :chipselected="chipselected" :amount="betAmount(20)" @cancel="cancelBet(20)" style="position: relative; top: -102%; height: 100%;"/>
      </div>
      <div :class="`box-bet border-right ${classBettingCells[21]}`" :style="`font-size:${fontSizeNumber}px`" @click="bet(21, $event)">
        <div class="flex flex-center flex-middle" :style="`height:${rowBet3}px`">6</div>
        <g-bet-state :chipselected="chipselected" :amount="betAmount(21)" @cancel="cancelBet(21)" style="position: relative; top: -102%; height: 100%;"/>
      </div>
      <div :class="`box-bet border-right ${classBettingCells[22]}`" :style="`font-size:${fontSizeNumber}px`" @click="bet(22, $event)">
        <div class="flex flex-center flex-middle" :style="`height:${rowBet3}px`">7</div>
        <g-bet-state :chipselected="chipselected" :amount="betAmount(22)" @cancel="cancelBet(2)" style="position: relative; top: -102%; height: 100%;"/>
      </div>
      <div :class="`box-bet border-right ${classBettingCells[23]}`" :style="`font-size:${fontSizeNumber}px`" @click="bet(23, $event)">
        <div class="flex flex-center flex-middle" :style="`height:${rowBet3}px`">8</div>
        <g-bet-state :chipselected="chipselected" :amount="betAmount(23)" @cancel="cancelBet(23)" style="position: relative; top: -102%; height: 100%;"/>
      </div>
      <div :class="`box-bet border-right ${classBettingCells[24]}`" :style="`font-size:${fontSizeNumber}px`" @click="bet(24, $event)">
        <div class="flex flex-center flex-middle" :style="`height:${rowBet3}px`">9</div>
        <g-bet-state :chipselected="chipselected" :amount="betAmount(24)" @cancel="cancelBet(24)" style="position: relative; top: -102%; height: 100%;"/>
      </div>
      <div :class="`box-bet border-right ${classBettingCells[25]}`" :style="`font-size:${fontSizeNumber}px`" @click="bet(25, $event)">
        <div class="flex flex-center flex-middle" :style="`height:${rowBet3}px`">10</div>
        <g-bet-state :chipselected="chipselected" :amount="betAmount(25)" @cancel="cancelBet(25)" style="position: relative; top: -102%; height: 100%;"/>
      </div>
    </div>
    <!-- 배당률 표시 행 -->
    <div id="row-bet4" :style="`height:${rowBet4}px;font-size:${fontSizeDividend}px`" class="border-bottom">
      <div class="dividend box-bet border-left border-right">1 : 4</div>
    </div>

    <div :class="classPad" :style="`top:68px;width:${padWidth}px;height:${padHeight}px`">
      <div ref="leftCard" :class="classLeftCard" :style="`width:${cardWidth}px`">
        <div :class="classLeftFlipCard">
          <div class="card-face"><img src="/img/sicbo/card/back.svg" width="100%"/></div>
          <div class="card-face card-face-back"><img :src="imgCard1" width="100%"/></div>
        </div>
      </div>
      <div ref="rightCard" :class="classRightCard" :style="`width:${cardWidth}px`">
        <div :class="classRightFlipCard">
          <div class="card-face"><img src="/img/sicbo/card/back.svg" width="100%" /></div>
          <div class="card-face card-face-back"><img :src="imgCard2" width="100%"/></div>
        </div>
      </div>
      <div ref="tong" :class="classTong"><img src="/img/sicbo/tong.png" width="70%" style="z-index: 1000;"/></div>
    </div>
  </div>
</template>

<script>
import BetState from './BetState.vue';
import { setTimeout } from 'timers';

const ROW_INFO_HEIGHT = 124;
const ROW_BET_0_HEIGHT = 156;
const ROW_BET_1_HEIGHT = 178;
const ROW_BET_2_HEIGHT = 178;
const ROW_BET_3_HEIGHT = 110;
const ROW_BET_4_HEIGHT = 40;
const BORDER_HEIGHT = 20;
const BASE_HEIGHT = ROW_INFO_HEIGHT + ROW_BET_0_HEIGHT + ROW_BET_1_HEIGHT + ROW_BET_2_HEIGHT + ROW_BET_3_HEIGHT + ROW_BET_4_HEIGHT + BORDER_HEIGHT;

const MAX_BET_PER_GAME = 50000000;

export default {
  data() {
    return {
      rowInfo: 0,  // info row height
      rowBet0: 0,  // 1st bet row height
      rowBet1: 0,  // 2nd bet row height
      rowBet2: 0,  // 3th bet row height
      rowBet3: 0,  // 4th bet row height
      rowBet4: 0,  // dividend row height

      classLeftCard: 'card',  // 첫 번째 화투의 css class
      classRightCard: 'card', // 두 번째 화투의 css class
      classLeftFlipCard: 'fcard',  // 첫 번째 화투의 flip 애니메이션 css class
      classRightFlipCard: 'fcard',  // 두 번째 화투의 flip 애니메이션 css class
      classTong: 'tong',  // 식보통 css class
      classPad: 'pad',

      timerString: '--:--',  // 배팅 타이머
      statusString: 'new_game',  // 배팅 상태 이름

      classBettingCells: [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],   // 당첨된 포지션을 표시하는 css class
      imgCard1: '/img/sicbo/card/00.svg',  // 첫 번째 카드 이미지
      imgCard2: '/img/sicbo/card/00.svg',  // 두 번째 카드 이미지
      classStatus: 'bg-status'
    }
  },
  props: {
    width: {  // 게임판의 너비
      type: Number,
      default: 0
    },
    height: {  // 게임판의 높이
      type: Number,
      default: 0
    },
    bets: {  // 배팅 데이터
      type: Array,
      default: () => []
    },
    chipselected: {  // 칩 선택 여부
      type: Boolean,
      default: false
    },
    hits: { // 담청 포지션 정보
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
    isMyBetEmpty: { // mybet이 비었는지 여부
      type: Boolean,
      default: () => true
    }
  },
  watch: {
    /**
     * 게임판 높이 변경에 따른 배팅 셀의 높이 변경
     */
    height: function(height) {
      const base = ROW_INFO_HEIGHT + ROW_BET_0_HEIGHT + ROW_BET_1_HEIGHT + ROW_BET_2_HEIGHT + ROW_BET_3_HEIGHT + ROW_BET_4_HEIGHT;
      this.rowBet0 = Math.round((height - BORDER_HEIGHT) * (ROW_BET_0_HEIGHT / base));
      this.rowBet1 = Math.round((height - BORDER_HEIGHT) * (ROW_BET_1_HEIGHT / base));
      this.rowBet2 = Math.round((height - BORDER_HEIGHT) * (ROW_BET_2_HEIGHT / base));
      this.rowBet3 = Math.round((height - BORDER_HEIGHT) * (ROW_BET_3_HEIGHT / base));
      this.rowBet4 = Math.round((height - BORDER_HEIGHT) * (ROW_BET_4_HEIGHT / base));
      this.rowInfo = height - (this.rowBet0 + this.rowBet1 + this.rowBet2 + this.rowBet3 + this.rowBet4 + BORDER_HEIGHT);
    },

    /**
     * 담청 포지션 애니메이션 출력
     */
    hits: function(hits) {
      const cells = [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
      for (let idx = 0; idx < hits.length; idx++) {
        cells[hits[idx]] = 'twinkle';
      }

      this.classBettingCells = cells;
    }
  },
  computed: {
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
      if (this.lastresult.cards[0] === -1) {
        return '/img/sicbo/card/back.svg'
      } else if (this.lastresult.cards[1] < 10) {
        return `/img/sicbo/card/0${this.lastresult.cards[1]}.svg`
      }
      return `/img/sicbo/card/${this.lastresult.cards[1]}.svg`
    },

    /**
     * 게임판의 너비와 높이를 지정하는 style
     */
    styleLayout() {
      return `width:${this.width}px;height:${this.height}px`;
    },

    /**
     * 최대 배팅 가능액에 대한 현재 배팅액의 비율
     */
    currentBetRate() {
      const total = this.bets.reduce((total, bet) => total + bet.amount, 0);
      return total / MAX_BET_PER_GAME * 100;
    },

    /**
     * 게임판 높이에 따라 폰트 사이즈를 변경
     */
    fontSizeTitle1() {
      return 18 * this.height / BASE_HEIGHT;
    },
    fontSizeTimer() {
      if (this.width <= 1200) return 40 * this.height / BASE_HEIGHT;
      return 48 * this.height / BASE_HEIGHT;
    },
    fontSizeStatus() {
      if (this.width <= 1200) return 16 * this.height / BASE_HEIGHT;
      return 26 * this.height / BASE_HEIGHT;
    },
    fontSizeRange() {
      return 25 * this.height / BASE_HEIGHT;
    },
    fontSizeName() {
      return 64 * this.height / BASE_HEIGHT;
    },
    fontSizeNumber() {
      return 48 * this.height / BASE_HEIGHT;
    },
    fontSizeGuang() {
      return 96 * this.height / BASE_HEIGHT;
    },
    fontSizeDividend() {
      return 18 * this.height / BASE_HEIGHT;
    },

    /**
     * 게임판 높이에 따라 화투 패드의 크기 변경
     */
    padSizeDesc() {
      if (this.width <= 1200) return 2 * this.height / BASE_HEIGHT;
      return 8 * this.height / BASE_HEIGHT;
    },
    padWidth() {
      return this.width * 0.2;
    },
    padHeight() {
      return this.height * 0.35
    },
    cardWidth() {
      return this.width * 0.2 * 0.2;
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
     * 배팅 타이머
     */
    setTimerString(betTimer) {
      this.timerString = betTimer;
    },

    /**
     * 게임 상태 변경
     */
    setStatus(status) {
      if (this.statusString !== status) {
        this.classStatus = 'bg-status twinkle2';
        setTimeout(() => {
          this.classStatus = 'bg-status';
        }, 3000);
        this.statusString = status;
      }
    },

    /**
     * 배팅
     * 
     * @param id 포지션 ID
     * @param $event 터치 이벤트 데이터
     */
    bet(id, event) {
      this.$emit('bet', {id: id, tableType: 'pc', x: event.clientX, y:event.clientY});
    },

    /**
     * 배팅을 취소
     */
    cancelBet(id) {
      this.$emit('cancel', id);
    }
  },
  components: {
    'g-bet-state': BetState
  }
}
</script>

<style lang="scss" scoped>
@import '../../scss/sicbo/pc-game-table.scss';

//////////////////////////////////////////////////////////////////////
.pad {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 700;
  
  &.fade {
    transition: all 1s;
    opacity: 0;
  }
}

.card {
  position: absolute;
  transition: all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  perspective: 1000;
  -ms-transform: perspective(1000px);
  -moz-transform: perspective(1000px);
  -ms-transform-style: preserve-3d;
  -moz-transform-style: preserve-3d;
  float: left;
  left: 50%;
  top: -50%;
  transform: translateX(-50%);
  visibility: hidden;
  background: yellow;

  &.cast-to-left {
    left: 50%;
    transform: translateX(-110%);
    top: 55%;
    visibility: visible;
  }

  &.cast-to-right {
    left: 50%;
    transform: translateX(10%);
    top: 55%;
    visibility: visible;
  }
}
.fcard {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  transform-style: preserve-3d;
  transform-origin: center right;
  transition: transform 1s;
}
.fcard.is-flipped {
  transform: translateX(-100%) rotateY(-180deg);
}
.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  color: white;
  text-align: center;
  font-weight: bold;
  font-size: 40px;
  backface-visibility: hidden;
}

.card-face-back {
  transform: rotateY(180deg);
}

.tong {
  @extend .flex;
  @extend .flex-center;
  @extend .flex-middle;
  width: 100%;
  height: 100%;
  transform: translateX(100%) translateY(-100%) rotate(90deg);
  transition: all 1s cubic-bezier(0.68, -0.55, 0.265, 2.0);

  &.close {
    transition: all 1s cubic-bezier(0.68, -0.55, 0.265, 1.2);
    transform: none;
  }
}
</style>

<template>
  <div class="modal-mask">
    <div class="content-outside" @click="close"></div>
    <div class="content-wrap">
      <div class="header">
        <div class="flex flex-middle flex-wfill">
          <img :src="cardUrl(game.card1)" class="card" />
          <img :src="cardUrl(game.card2)" class="card right" />

          <div class="result">{{result1}}</div>
          <div class="result right">{{result2}}</div>
        </div>
        <div class="box-btn-close">
          <img src="/img/ic-modal-close.svg" alt="" class="close-btn" @click="close">
        </div>
      </div>
      <div class="contents">
        <div class="row-0">
          <div class="account">{{user}}</div>
          <div :class="classPrize">{{prize}}</div>
        </div>
        <div class="row-1">
          <div class="header">
            <div class="col-0">{{$t('sicbo.info.type')}}</div>
            <div class="col-1">{{$t('sicbo.info.betamount')}}</div>
            <div class="col-2">{{$t('sicbo.info.payout')}}</div>
          </div>

          <div v-for="(bet, index) of bets" class="item" :key="index">
            <div class="col-0">{{positionName(bet.position)}}</div>
            <div class="col-1">{{formatedNumber(bet.amount)}}</div>
            <div class="col-2">{{formatedNumber(bet.payout)}}</div>
          </div>
        </div>
        <div class="row-2">
          <button class="btn-block" @click="openBloksIO">Bloks.io</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isPair, isSmall, isOdd } from '../../js/sicbo.js';

export default {
  data() {
    return {
      bets: []
    }
  },
  props: {
    game: {
      type: Object,
      default: () => {
        return {
          card1: 0,
          card2: 1,
          uid: 'unknown',
          bet_total:0,
          prize_total: 0,
          reveal_trx: ''
        }
      }
    }
  },
  mounted() {
    if (this.game.id === undefined) {
      this.close();
    }

    this.fetchBetData(this.game.id);
  },
  watch: {
    game: function(game) {
      this.fetchBetData(game.id);
    }
  },
  computed: {
    /**
     * 화면에 출력할 상금을 계산한다.
     */
    prize() {
      if (this.game.prize_total - this.game.bet_total > 0) {
        return `+${this.formatedNumber(this.game.prize_total - this.game.bet_total)} TAZ Chip`;
      }
      return '- TAZ Chip';
    },
    /**
     * 상금에 따른 css class를 결정한다.
     */
    classPrize() {
      if (this.game.prize_total - this.game.bet_total > 0) {
        return 'total';
      }

      return 'total loser';
    },
    /**
     * 게임 결과 1
     */
    result1() {
      if (isPair(this.game.card1, this.game.card2)) {
        return 'Pair';
      } else if (isSmall(this.game.card1, this.game.card2)) {
        return 'Small'
      }
      return 'Big';
    },
    /**
     * 게임 결과 2
     */
    result2() {
      if (isPair(this.game.card1, this.game.card2)) {
        return '';
      } else if (isOdd(this.game.card1, this.game.card2)) {
        return 'Odd';
      }
      return 'Even';
    },
    /**
     * 플레이어의 account를 반환한다.
     */
    user() {
      return (this.game.uid) ? this.game.uid : 'unknown';
    }
  },
  methods: {
    /**
     * 카드 번호에 대한 카드 이미지 경로
     */
    cardUrl(num) {
      if (num < 10) {
        return `/img/sicbo/card/0${num}.svg`;
      }
      return `/img/sicbo/card/${num}.svg`;
    },
    /**
     * 상세 UI를 닫는다.
     */
    close() {
      this.$emit('close');
    },
    /**
     * 숫자 3자리 마다 ,를 추가
     */
    formatedNumber(num) {
      const regexp = /\B(?=(\d{3})+(?!\d))/g;
      return num.toString().replace(regexp, ',');
    },
    /**
     * 배팅한 포지션의 이름
     */
    positionName(position) {
      const POSITIONS = [
        'Small', '光', 'Big', 'Odd', 'Even', '1 Pair', '2 Pair', '3 Pair', '4 Pair', '5 Pair', '6 Pair', '7 Pair', '8 Pair', '9 Pair', '10 Pair',
        'Pair', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
      ]
      return POSITIONS[position];
    },
    /**
     * reveal을 실행한 트랜젝션에 대한 정보를 bloks.io에서 조회한다.
     */
    openBloksIO() {
      window.open(`https://bloks.io/transaction/${this.game.reveal_trx}`, '_blank');
    },
    /**
     * 게임 데이터를 서버에 요청한다.
     */
    fetchBetData(gid) {
      fetch(`${this.$REST_API_SERVER}/api/v1/bets?gid=${gid}`).then(res => {
        res.json().then(data => {
          this.bets = data;
        })
        .catch(err => {
          console.error(err);
          this.bets = [];
        })  
      })
      .catch(err => {
        console.error(err);
        this.bets = [];
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../scss/flex.scss';
@import '../../scss/fonts.scss';

.modal-mask {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 5000;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, .5);
  color: white;
  box-sizing: content-box;
}

.content-outside {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 5100;
}

.content-wrap {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5200;
  box-sizing: border-box;
  background: #2F1412;
  border: 1px solid #6A4744;
  border-radius: 8px;
  width: 300px;
  height: 490px;
  
  @media (min-width: 984px) {
    top: 150px;
    width: 560px;
    height: 664px;
  }
}

.header {
  width: 100%;
  height: 52px;
  border-bottom: 2px solid #6A4744;
  box-sizing: border-box;
  @extend .flex;
  @extend .flex-middle;
  padding: 4px 8px 0px 16px;
  
  @media (min-width: 984px) {
    height: 120px;
    padding: 8px 16px 0px;
  }

  .card {
    width: 25px;
    height: 38px;

    @media (min-width: 984px) {
      width: 66px;
      height: 97px;
    }

    &.right {
      margin-left: 6px;
      
      @media (min-width: 984px) {
        margin-left: 12px;
      }
    }
  }

  .result {
    font-weight: 500;
    font-size: 20px;
    line-height: 23px;
    color: #FFF389;
    width: 68px;
    margin-left: 12px;
    text-align: center;

    @media (min-width: 984px) {
      font-size: 24px;
      line-height: 28px;
      width: 90px;
    }
    
    &.right {
      margin-left: 8px;
      @media (min-width: 984px) {
        margin-left: 32px;
      }
    }
  }

  .box-btn-close {
    height: 100%;
    padding-top: 4px;
    
    @media (min-width: 984px) {
      padding-top: 8px;
    }
  }

  .close-btn {
    width: 40px;
    height: 40px;
    cursor: pointer;
  }
}

.contents {
  width: 100%;
  padding: 0px 16px;
  box-sizing: border-box;
  width: 100%;

  @media (min-width: 984px) {
    padding: 0px 32px;
  }
}

.row-0 {
  @extend .flex;
  @extend .flex-middle;
  justify-content: space-between;
  box-sizing: border-box;
  width: 100%;
  height: 40px;

  @media (min-width: 984px) {
    height: 52px;
  }

  .account {
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    color: white;

    @media (min-width: 984px) {
      font-size: 16px;
      line-height: 19px;
    }
  }

  .total {
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    color: #13EB1B;

    @media (min-width: 984px) {
      font-size: 16px;
      line-height: 19px;
    }

    &.loser {
      color: white;
    }
  }
}

.row-1 {
  height: 338px;
  background: #431C19;
  border: 1px solid #6A4744;

  @media (min-width: 984px) {
    height: 390px;
    font-size: 16px;
    line-height: 19px;
  }

  .header {
    @extend .flex;
    @extend .flex-middle;
    // justify-content: space-between;
    box-sizing: border-box;
    font-weight: 500;
    font-size: 12px;
    line-height: 14px;
    color: #FFF389;
    height: 24px;
    border-bottom: 1px solid #6A4744;
    padding: 0px 4px;

    @media (min-width: 984px) {
      font-size: 16px;
      line-height: 19px;
      height: 33px;
      padding: 0px 8px;
    }

    .col-0 {
      width: 20%;
      text-align: left;
    }
    .col-1 {
      width: 40%;
      text-align: right;
    }
    .col-2 {
      width: 40%;
      text-align: right;
    }
  }

  .item {
    @extend .flex;
    @extend .flex-middle;
    justify-content: space-between;
    box-sizing: border-box;
    font-weight: 500;
    font-size: 12px;
    line-height: 14px;
    color: white;
    height: 30px;
    padding: 0px 4px;
    margin-bottom: 8px;

    @media (min-width: 984px) {
      font-size: 16px;
      line-height: 19px;
      height: 32px;
      padding: 0px 8px;
    }

    .col-0 {
      width: 20%;
      text-align: left;
    }
    .col-1 {
      width: 40%;
      text-align: right;
    }
    .col-2 {
      width: 40%;
      text-align: right;
    }
  }
}

.row-2 {
  width: 100%;
  margin-top: 10px;
  @extend .flex;
  @extend .flex-center;

  @media (min-width: 984px) {
    margin-top: 39px;
  }
}

.btn-block {
  width: 98px;
  height: 32px;
  background: #612D17;
  border-radius: 5px;
  outline: none;
  color: #FFFFFF;

  @media (min-width: 984px) {
    width: 116px;
    height: 38px;
  }
}
</style>
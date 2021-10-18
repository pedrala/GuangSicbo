<template>
  <div class="flex flex-center flex-middle" v-if="isShow">
    <div :class="classTop">
      <div :class="classAmount">
        <div class="flex-wfill">{{amount}}</div>
        <img src="/img/sicbo/btn-cancle.png" v-if="!chipselected"/>
      </div>
    </div>
    <img v-for="chip in chips" :src="chip.img" :width="chipSize" :style="`position: absolute; top: ${chip.y}%; left: ${chip.x}%; transform: translateX(-50%)`" :key="chip.id"/>
  </div>
</template>

<script>

/**
 * 칩의 위치를 램덤하게 발생시킨다.
 */
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
  props: {
    mode: { // pc | mobile
      type: String,
      default: 'pc'
    },
    amount: {  // 배팅된 TAZ Chip 수량
      type: Number,
      default: 1
    },
    chipSize: {
      type: String, // 칩 크기
      default: '80px'
    },
    chipselected: { // false 일때 취소 UI를 활성화
      type: Boolean,
      default: false
    }
  },
  computed: {
    /**
     * 배팅 금액 표시 UI의 css class
     */
    classTop() {
      return (this.mode === 'pc') ? 'top' : 'top-mobile';
    },
    /**
     * 배팅 금액의 css class
     */
    classAmount() {
      return (this.mode === 'pc') ? 'amount' : 'amount-mobile';
    },
    /**
     * 배팅이 있는지 판다.
     */
    isShow() {
      return this.amount > 0;
    },
    /**
     * 배팅 금액에 따른 칩의 종류와 갯수를 계산
     */
    chips() {
      if (this.amount <= 0) return [];
      const CHIPS = [10000100, 5000000, 1000000, 500000, 100000, 50000, 10000, 5000, 1000, 100];
      const chips = [];
      for (let idx = 1; idx < CHIPS.length; idx++) {
        chips.push(Math.floor((this.amount % CHIPS[idx - 1]) / CHIPS[idx]));
      }
      let minValueIdx = chips.length - 1;
      const minCoin = {};
      const result = [];
      for (let idx = chips.length - 1; idx >= 0 ; idx--) {
        if (chips[idx] > 0) {
          minValueIdx = idx;
          minCoin.img = `/img/sicbo/gamechip/chip_0${8 - idx}_shadow.png`;
          minCoin.x = getRandomIntInclusive(45, 55);
          minCoin.y = getRandomIntInclusive(45, 55);
          break;
        }
      }

      for (let idx = 0; idx < chips.length ; idx++) {
        if (result.length >= 5) break;
        const eol = (idx === minValueIdx) ? chips[idx] - 1 : chips[idx];
        for (let jdx = 0; jdx < eol; jdx++) {
          result.unshift({
            img: `/img/sicbo/gamechip/chip_0${8 - idx}_shadow.png`,
            x: getRandomIntInclusive(45, 55),
            y: getRandomIntInclusive(45, 55)
          });
          if (result.length >= 5) break;
        }
      }

      result.unshift(minCoin);
      
      return result.reverse();
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../scss/flex.scss';

.top {
  @extend .flex;
  @extend .flex-center;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 36px;
  padding-top: 4px;
}

.top-mobile {
  @extend .flex;
  @extend .flex-center;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 28px;
}

.amount {
  @extend .flex;
  @extend .flex-middle;
  justify-content: space-between!important;
  height: 100%;
  width: 96%;
  padding: 4px 8px;
  text-align: center;
  color: #FFFFFF;
  font-weight: 500;
  font-size: 16px;
  text-shadow: 0px 0px 4px rgba(255, 244, 144, 0.6);
  background: rgba(0, 0, 0, 0.8);
  border-radius: 3px;
}

.amount-mobile {
  @extend .flex;
  @extend .flex-middle;
  justify-content: space-between!important;
  height: 100%;
  width: 96%;
  padding: 2px 4px;
  text-align: center;
  color: #FFFFFF;
  font-weight: 500;
  font-size: 12px;
  text-shadow: 0px 0px 4px rgba(255, 244, 144, 0.6);
  background: rgba(0, 0, 0, 0.8);
  border-radius: 3px;
  img {
    width: 20px;
  }
}
</style>
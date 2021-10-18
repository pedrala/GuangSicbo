<template>
  <div class="modal-mask" @touchmove="preventScroll">
    <div class="content-outside" @click="closeModal()"></div>
    <div class="content-box">
      <div class="header">
        <div class="payout-pool-select" :class="{selected: visibilityPayoutPool}" @click="showPayoutpool()">
          {{ $t('bonusPayout.payoutPool')}}
        </div>
        <div class="stake-select" :class="{selected: visibilityStake}" @click="showStake()">
          <div>{{ $t('bonusStake.stake')}}</div>
        </div>
        <img src="/img/referral/close-btn.svg" class="close-btn" @click="closeModal()">
      </div>
      <div class="payout-pool-content" v-if="visibilityPayoutPool">
        <div class="payout-pool-box">
          <div class="next-payout-wrap">
            <div class="next-payout-title">{{ $t('bonusPayout.next')}} :</div>
            <div class="next-payout-time">{{nextPayoutTime}}</div>
          </div>
          <img src="/img/bonus/ychips.svg" class="chip-img">
          <div class="section-title">{{ $t('bonusPayout.payoutPool')}}</div>
          <div class="token-value-row">
            <img src="/img/drawer/EOStoken.svg" alt="" class="token-img">
            <span class="token-value">{{ decorate(payoutValue, true) }}</span>
            <span class="token-unit">EOS</span>
          </div>
        </div>
        <div class="estimated-payout-box">
          <div class="section-title">{{ $t('bonusPayout.estimate')}}</div>
          <div class="token-value-row">
            <img src="/img/drawer/EOStoken.svg" alt="" class="token-img">
            <span class="token-value">{{ decorate(estimatedValue,true) }}</span>
            <span class="token-unit">EOS</span>
          </div>
        </div>
        <div class="expected-payout-box">
          <div class="section-title">{{ $t('bonusPayout.per10kTaz')}}</div>
          <div class="token-value-row">
            <img src="/img/drawer/EOStoken.svg" alt="" class="token-img">
            <span class="token-value">{{ decorate(per10kTazValue, true) }}</span>
            <span class="token-unit">EOS</span>
          </div>
        </div>
        <div class="description">
          {{ $t('bonusPayout.info1')}}<br>{{ $t('bonusPayout.info2')}}<br>{{ $t('bonusPayout.info3')}}
        </div>
      </div>

      <div class="stake-content" v-if="visibilityStake">
        <div class="total-staked-box">
          <div class="total-section-title">{{ $t('bonusStake.total')}}</div>
          <img src="/img/bonus/stake-chips.svg" alt="" class="staked-chip-img">
          <div class="stake-value-row">
            <div class="stake-token-value">{{ decorate( totalStaked, true) }}</div>
            <div class="stake-token-unit">TAZ</div>
          </div>
        </div>
        <div class="available-stake-box">
          <div class="stake-section-title">{{ $t('bonusStake.available')}}</div>
          <div class="available-amount-row">
            <div class="available-amount">{{ decorate(availableToStake, true) }}</div>
            <div class="available-amount-unit">TAZ</div>
          </div>
          <div class="amount-input-box">
            <img src="/img/drawer/taztoken.svg" class="amount-input-icon">
            <input type="number" class="amount-input" v-model="inputStakeAmount" />
            <div class="amount-input-unit">TAZ</div>
            <div class="amount-input-btn" @click="stake()">{{ $t('bonusStake.stake')}}</div>
          </div>
        </div>
        <div class="staked-box" v-if="isStaked">
          <div class="stake-section-title">{{ $t('bonusStake.staked')}}</div>
          <div class="available-amount-row">
            <div class="available-amount">{{ decorate(myStake, true) }}</div>
            <div class="avaiable-amount-unit">TAZ</div>
          </div>
          <div class="amount-input-box">
            <img src="/img/drawer/taztoken.svg" class="amount-input-icon">
            <input type="number" class="amount-input" v-model="inputUnstakeAmount">
            <div class="amount-input-unit">TAZ</div>
            <div class="amount-input-btn" :class="{'disable-btn': myStake === 0}"  @click="unstake()">{{ $t('bonusStake.unstake')}}</div>
          </div>
        </div>
        <div class="unstaking-box" v-if="!isStaked">
          <div class="stake-section-title-unstaking">{{ $t('bonusStake.staked')}}</div>
          <div class="available-amount-row-unstaking">
            <div class="available-amount">{{ decorate(myStake, true) }}</div>
            <div class="avaiable-amount-unit">TAZ</div>
          </div>
          <div class="stake-section-title-unstaking">{{ $t('bonusStake.amount')}}</div>
          <div class="available-amount-row-unstaking">
            <div class="available-amount">{{ decorate(myUnstaking, true) }}</div>
            <div class="avaiable-amount-unit">TAZ</div>
          </div>
          <hr class="unstaking-hr">
          <div class="status-wrap">
            <div class="status-row-wrap">
              <div class="status-row">
                <div class="status">{{ $t('bonusRestake.current')}} :</div>
                <div class="status-value">{{ $t('bonusRestake.unstaking')}}</div>
              </div>
              <div class="status-row">
                <div class="status">{{ $t('bonusRestake.remain')}} : </div>
                <div class="status-value">{{ unstakeTime }}</div>
              </div>
            </div>
            <div class="restake-btn" @click="restake()">{{$t('bonusRestake.restake')}}</div>
          </div>
        </div>
        <div class="stake-description">
          {{ $t('bonusStake.desc1')}}
        </div>
        <div class="stake-description">
          {{ $t('bonusStake.desc2')}}
        </div>
      </div>
    </div>
    <transition name="bonus-alert">
      <div class="alert-box" v-if="isAlert">
        <img :src="pandaImg" alt="" class="alert-panda-img">
        <div class="alert-text" :class="{onemsg: !hasAlertMsgDesc}">{{ $t(`bonusStake.${alertMsg}`)  }}</div>
        <div class="alert-text"  v-if="hasAlertMsgDesc">{{ $t(`bonusStake.${alertMsgDesc}`) }}</div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { setInterval, clearInterval, setTimeout } from 'timers';

const timeString = (val) => {
  return val < 10 ? `0${val}` : `${val}`;
}

const nextPayoutTime = () => {
    let remain = 57600 - ((Math.floor(new Date().getTime() / 1000)) % 86400); // 중국 표준시 기준 자정까지 남은 시간

    const h = Math.floor(remain / 3600);
    const m = Math.floor((remain % 3600) / 60);
    const s = Math.floor((remain % 3600) % 60);


    return `${timeString(h)} : ${timeString(m)} : ${timeString(s)}`;
}

export default {
  data() {
    return {
      visibilityPayoutPool: true,
      visibilityStake: false,
      isStaked: true,
      payoutValue: 0,
      totalStaked: 0,
      myStake: 0,
      myUnstaking: 0,
      unstakingRequested: 0,
      inputStakeAmount: 0,
      inputUnstakeAmount: 0,
      nextPayoutTime: '00 : 00 : 00',
      unstakeTime: '-- : -- : --',
      pandaImg: '/img/store/alert.svg',
      isAlert: false,
      alertMsg: 'Something Wrong!',
      alertMsgDesc: 'Check: Stake Amount',
      hasAlertMsgDesc: true
    }
  },
  methods: {
    /**
     * vuex store
     */
    ...mapMutations([
      'setTazBalance'
    ]),
    //
    //  환경상태에 따른 모달창 open
    //
    showAlert(state) {
      if(state==='lowStake') {
        this.pandaImg = '/img/store/alert.svg';
        this.hasAlertMsgDesc = true;
        this.alertMsg = 'error';
        this.alertMsgDesc = 'error2';
      } else {
        this.pandaImg = '/img/toast/copied.png';
        this.hasAlertMsgDesc = false;
        this.alertMsg = 'success';
      }

      this.isAlert = true;
      setTimeout(() => {
        this.isAlert = false
      }, 900)
    },
    //
    //  탭 선택에 따라 화면표시
    //
    showPayoutpool() {
      this.visibilityStake = false;
      this.visibilityPayoutPool = true;
    },
    showStake() {
      this.visibilityPayoutPool = false;
      this.visibilityStake = true;
    },
    stake() {
      const amount = Number.parseFloat(this.inputStakeAmount);
      if (amount < 0.0001) {
      this.showAlert('lowStake');
        return;
      }
      
      this.$chain.stake(this.userID, `${amount.toFixed(4)} TAZ`).subscribe(
        result => {
          console.log(result);
          this.inputStakeAmount = 0;
          this.showAlert('success');
        }
      )
    },
    unstake() {
      const amount = Number.parseFloat(this.inputUnstakeAmount);
      if (amount < 0.0001) {
        this.showAlert('lowStake');
        return;
      }
      
      this.$chain.unstake(this.userID, `${amount.toFixed(4)} TAZ`).subscribe(
        result => {
          console.log(result);
          this.inputUnstakeAmount = 0;
          this.isStaked = false;
          this.showAlert('success');
        }
      )
    },
    restake() {
      this.$chain.restake(this.userID).subscribe(
        result => {
          console.log(result);
          this.inputUnstakeAmount = 0;
        }
      )
    },
    //
    //  모달창 close
    //
    closeModal() {
      this.$emit('close-bonus');
    },
    //
    //  모달창 뒤 배경화면 스크롤 저지
    //
    preventScroll(event) {
      event.stopPropagation();
    },
    //
    // payoutpoll 데이터 fetch  
    //
    fetchPayoutPoolData() {
      fetch(`${this.$REST_API_SERVER}/api/v1/dividends?account=${this.userID}`).then( res => {
          return res.json();
      })
      .catch( err => console.error(err) )
      .then( data => {
        this.payoutValue = data.dividends;
        this.totalStaked = data.total_staked;
        this.myStake = data.user.staked;
        this.myUnstaking = data.user.unstaking;
        this.unstakingRequested = data.user.unstaking_requested;
        this.isStaked = this.myUnstaking <= 0;
      })
      this.$chain.getBalance('taztokenbase', this.userID, 'TAZ').subscribe(
        tazBalance => {
          if (tazBalance.length > 0) {
            const token = tazBalance[0].split(' ');
            this.setTazBalance(Number.parseFloat(token[0]));
          } else {
            this.setTazBalance(0);
          }
        },
        error => console.error(error)
      );
    },
    //
    // 토큰 값 양식 최적화  
    //
    decorate(number=0, isFixed) {
      const regexp = /\B(?=(\d{3})+(?!\d))/g;
      if(isFixed) {
        const a = number.toFixed(4).toString().split('.');
        return a[0].replace(regexp, ',')+'.'+a[1];
      } else {
        return number.toString().replace(regexp, ',');
      }
    },
  },
  created() {
    this.fetchPayoutPoolData();

    this.nextPayoutTimeHandler = setInterval(() => {
      this.nextPayoutTime = nextPayoutTime();
      const now = Math.floor(new Date().getTime() / 1000);
      if (this.unstakingRequested + 86400 < now) {
        this.unstakeTime = '-- : -- : --';
      } else {
        const remain = this.unstakingRequested + 86400 - now;
        const h = Math.floor(remain / 3600);
        const m = Math.floor((remain % 3600) / 60);
        const s = Math.floor((remain % 3600) % 60);

        this.unstakeTime =  `${timeString(h)} : ${timeString(m)} : ${timeString(s)}`;
      }

      this.fetchPayoutPoolData();
    }, 1000);
  },
  destroyed() {
    if (this.nextPayoutTimeHandler) {
      clearInterval(this.nextPayoutTimeHandler);
    }
  },
  mounted() {
  },
  computed: {
    ...mapState({
      userID(state) {
        return state.common.account.name;
      },
      availableToStake(state) {
        return state.common.balance.taz - this.myStake - this.myUnstaking;
      }
    }),
    estimatedValue() {
      return (this.myStake <= 0) ? 0 : (this.myStake / this.totalStaked ) * this.payoutValue;
    },
    per10kTazValue() {
      return (this.totalStaked < 10000) ? this.payoutValue : this.payoutValue / this.totalStaked * 10000;
    },
  }
}
</script>
<style lang="scss" scoped>
@import '../scss/flex.scss';
@import '../scss/fonts.scss';

.modal-mask {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 5000;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, .5);
  color: white;
}

.content-outside {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 5100;
}


.content-box {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5200;
  width: 280px;
  height: 564px;
  background: #1C2A4A;
  border: 1px solid #2A3D6C;
  box-sizing: border-box;
  border-radius: 8px;
  top: 6%;
  @media (min-width: 984px) {
    width: 564px;
    top: 150px;
    height: 646px;
  }
}

.header {
  @extend .flex;
  justify-content: center;
  width: 100%;
  height: 56px;
  border-bottom: 1px solid #2A3D6C;
  padding-top: 8px;
  box-sizing: border-box;

  @media (min-width: 984px) {
    justify-content: flex-start;
    padding: 8px 8px 0;
  }
}

.select {
  @extend .text-title;
  height: 48px;
  line-height: 48px;
  color: #898989;
  text-align: center;
  cursor: pointer;
  &:hover {
    color: white;
  }
}

.payout-pool-select {
  @extend .select;
  width: 140px
}

.stake-select {
  @extend .select;
  width: 84px;
}


.selected {
  color: white;
  background: linear-gradient(360deg, #344C89 9.38%, rgba(40, 62, 115, 0) 100%);
}

.close-btn {
  width: 40px;
  height: 40px;
  padding: 12px;
  box-sizing: border-box;
  margin: auto 0;
  cursor: pointer;

  @media (min-width: 984px) {
    margin-left: auto;
  }
}

.inner-box {
  background: #111A30;
  margin: 8px 8px 0;
}

.payout-pool-box {
  @extend .inner-box;
  height: 180px;
  @media (min-width: 984px) {
    height: 228px;
  }
}

.next-payout-wrap {
  @extend .flex;
  @extend .flex-center;
  @extend .text-small;
  height: 28px;
  line-height: 28px;
  font-weight: 400;

  @media (min-width: 984px) {
    width: fit-content;
    margin-left: 8px;
  }
}

.next-payout-title {
  width: 144px;
  text-align: center;
}

.next-payout-time {
  width: 112px;
  color: #D30900;
  text-align: left;
}

.chip-img {
  display: block;
  box-sizing: content-box;
  width: 100%;
  height: 84px;
  margin: 0 auto -12px;
}

.section-title {
  color: #FFD8A1;
  @extend .text-normal;
  font-weight: 400;
  text-align: center;
  height: 36px;
  line-height: 36px;
  @media (min-width: 984px) {
    height: 40px;
    line-height: 40px;
  }
}

.estimated-payout-box,
.expected-payout-box {
  @extend .inner-box;
  height: 80px;
  @media (min-width: 984px) {
    height: 108px;
  }
}

.token-value-row {
  @extend .flex;
  @extend .flex-center;
  font-size: 16px;
  font-weight: 400;
  width: 208px;
  height: 36px;
  margin: auto;

  background: #0C1223;
  border-radius: 20px;
  line-height: 30px;
  text-align: center;
  @media (min-width: 984px) {
    margin-top: 8px;
    height: 40px;
    line-height: 40px;
  }
}

.token-img {
  width: 24px;
  height: 24px;
  margin: auto 0;
}

.token-value {
  width: 120px;
  line-height: 40px;
}

.token-unit {
  width: 40px;
  line-height:40px;
}

.description {
  @extend .flex;
  @extend .flex-middle;
  @extend .text-normal;
  color: #C0C0C0;
  font-weight: 400;
  width: 100%;
  height: 142px;
  box-sizing: border-box;
  text-indent: -0.7em;
  line-height: 18px;
  padding-left: 18px;
  padding-right: 10px;
  hyphens: manual;

  @media (min-width: 984px) {
    height: 120px;
    padding-right: 18px;
  }
}

.total-staked-box {
  @extend .inner-box;
  height: 144px;
  @media (min-width: 984px) {
    height: 152px;
  }
}

.total-section-title {
  @extend .section-title;
  @extend .text-normal;
  font-weight: 400;
  height: 48px;
  line-height: 48px;
}

.stake-section-title {
  @extend .section-title;
  @extend .text-normal;
  font-weight: 400;
}

.stake-section-title-unstaking {
  @extend .stake-section-title;
  height: 32px;
}

.staked-chip-img {
  display: block;
  width: 112px;
  height: 48px;
  margin: 8px auto 0;
}

.stake-value-row {
  @extend .flex;
  @extend .flex-center;
  @extend .text-title;
  font-weight: 400;
  height: 48px;
  line-height: 48px;
  text-align: center;
}

.stake-token-value {
  width: 148px;
}

.stake-token-unit {
  width: 52px;
}

.available-stake-box,
.staked-box {
  @extend .inner-box;
  height: 124px;
}

.staked-box {
  margin-bottom: 28px;

  @media (min-width: 984px) {
    margin-bottom: 20px;
  }
}

.unstaking-box {
  @extend .inner-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 186px;
  @media (min-width: 984px) {
    height: 190px;
    margin-bottom: 20px
  }
}

.available-amount-row {
  @extend .flex;
  @extend .flex-center;
  @extend .text-normal;
  height: 28px;
  margin-bottom: 12px;
  color: #13EB1B;
  font-weight: 400;
  line-height: 28px;
  text-align: center;
}

.available-amount-row-unstaking {
  @extend .available-amount-row;
  margin-bottom: 8px;
  &:nth-child(4) {
    margin-bottom: 0;
  }
}

.available-amount {
  width: 108px;
}

.available-amount-unit {
  width: 36px;
}

.disable-btn {
  color: #C0C0C0;
  cursor: unset;
}

.amount-input-box {
  @extend .flex;
  @extend .flex-center;
  @extend .text-normal;
  margin: 0 auto;
  line-height: 32px;
  font-weight: 400;
  width: 248px;
  height: 32px;
  border: 1px solid #2A3D6C;
  box-sizing: border-box;
  box-shadow: inset 4px 4px 10px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  text-align: center;
}

.amount-input-icon {
  width: 16px;
  height: 16px;
  margin: auto 0 auto 7px;
}

.amount-input {
  @extend .text-normal;
  background: #111A30;
  outline: none;
  border: none;
  width: 112px;
  text-align: right;
  padding-right: 6px;
  color: white;
  box-sizing: border-box;

  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    margin: 0; 
  }
}

.amount-input-unit {
  color: #898989;
  width: 40px;
}

.unstaking-hr {
  border: 0.5px solid #2A3D6C;
  min-width: 240px;
  margin: 6px 8px;
  width: 95%;
  box-sizing: border-box;
  @media (min-width: 984px) {
    width: 248px;
    margin: 8px auto;
  }
}

.amount-input-btn {
  @extend .text-normal;
  width: 74px;
  height: 32px;
  line-height: 32px;
  background: linear-gradient(180deg, #DA241C 0%, #5B110D 100%);
  border-radius: 4px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  &:hover {
    color: #FFFF58;
  }
}

.stake-description {
  @extend .flex;
  @extend .flex-middle;
  color: #C0C0C0;
  font-weight: 400;
  width: 100%;
  box-sizing: border-box;
  text-indent: -0.7em;
  padding-left: 18px;
  padding-right: 10px;
  line-height: 30px;
  font-size: 12px;
  @media (min-width: 984px) {
    font-size: 14px;
    line-height: 20px;
  }
}

.status-wrap {
  @extend .flex;
  height: 40px;
  margin: 0 auto;
}


.status-row-wrap {
  width: 172px;
}


.status-row {
  @extend .flex;
  font-size: 12px;
  font-weight: 400;
  height: 20px;
  width:  fit-content;
  line-height: 20px;
  margin-left: 2px;
}

.status {
  margin-right: 4px;
}

.restake-btn {
  display: inline-block;
  @extend .amount-input-btn;
  margin: 4px 4px 0 0;
  // transform: translateY(-12px)
}

.alert-box {
  position: fixed;
  width: 324px;
  height: 240px;
  background: #FFFFFF;
  border-radius: 6px;
  top: 30%;
  left: 50%;
  margin-top: -120px;
  margin-left: -162px;
  z-index: 9999;
}

.alert-panda-img {
  display: block;
  width: 98px;
  height: 84px;
  margin: 48px auto 0;
}

.alert-text {
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  width: 268px;
  height: 28px;
  margin: 0 auto;
  font-weight: 500;
}

.bonus-alert-enter-active, .bonus-alert-leave-active {
  transition: 0.4s all ease-out;
}

.bonus-alert-enter, .bonus-alert-leave-to {
  transform: translateY(-30%);
  opacity: 0;
}

.onemsg {
  height: 56px !important;
}

</style>
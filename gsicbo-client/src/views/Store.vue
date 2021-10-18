<template>
  <div class="app">
    <transition  name="toast-store">
      <div v-if ="showToast" class="toast-store" >
        <img :src="toastImg"  class="copied-img">
        <div class="copied-text" :class="{doubleline: showDetailMsg}">
          {{ $t(`store.${toastMsg}`) }}
        </div>
        <div v-if="showDetailMsg" class="detail-text">
          {{ $t(`store.${detailMsg}`) }}
        </div>
        <div class="close-btn-wrap"  @click="showToast = false">{{ $t(`store.close`) }}</div>
      </div>
    </transition>
    <div class="layout">
      <div class="title-wrap">
        <div class="title-box">
          <img src="/img/store/title.svg" class="title-img">
          <span class="title-text">{{ $t('store.store') }}</span>
        </div>
      </div>
      <div class="user-info-wrap">
        <div class="medal-wrap">
          <img :src="vipMedal" class="medal-img">
          <span class="user-name">{{ userID || '-' }}</span>
        </div>
        <div class="balance-header">
          <span class="token-name-header">{{ $t('store.token') }}</span>
          <span class="balance-value-header">{{ $t('store.balance') }}</span>
        </div>
        <div class="balance-row">
          <div class="token-name"><img src="/img/drawer/tazchip.svg" class="token-img">TAZ Chip</div>
          <span class="balance-value"> {{ decorate(tazchipBalance, true) || '-' }} </span>
        </div>
        <div class="balance-row">
          <div class="token-name"><img src="/img/drawer/taztoken.svg" class="token-img">TAZ</div>
          <span class="balance-value"> {{ decorate(tazBalance, true) || '-' }} </span>
        </div>
        <div class="balance-row">
          <div class="token-name"><img src="/img/drawer/EOStoken.svg" class="token-img">EOS</div>
          <span class="balance-value"> {{ decorate(eosBalance, true) || '-' }} </span>
        </div>
      </div>
      <div class="purchase-order-wrap">
        <div class="purchase-box-wrap">
          <img src="/img/store/house.svg" class="purchase-box-img">
          <img src="/img/store/transparent.svg" class="hidden-box">
          <div class="content-box">
            <div class="anouncement-text">
              {{ $t('store.info1') }} <br>{{ $t('store.info2') }}
            </div>
            <div class="purchase-input-wrap">
              <input type="number" class="purchase-input" v-model="quoteTokenAmount" :placeholder="quoteTokenHint">
              <div class="token-selector-wrap">
                <div class="token-selector" @click="toggleTokenDropdown">
                  <img :src="quoteTokenImg" class="purchase-token-img">
                  {{quoteToken}}
                  <img src="/img/sort-btn.svg" class="select-btn">
                </div>
                <transition name="slide">
                  <div class="token-dropdown-content" v-if="tokenShow">
                    <div class="token-select-row-0">&nbsp;</div>
                    <div class="token-select-row" @click="selectQuoteToken($event, 'EOS')">
                      <img src="/img/drawer/EOStoken.svg" class="token-select-row-img">EOS
                    </div>
                    <div class="token-select-row" @click="selectQuoteToken($event, 'TAZ')">
                      <img src="/img/drawer/taztoken.svg" class="token-select-row-img">TAZ
                    </div>
                  </div>
                </transition>
              </div>
            </div>
            <div class="arrow">
              <img src="/img/store/arrow.svg" class="arrow-img">
            </div>
            <div class="preview-box">
              <img src="/img/drawer/tazchip.svg" class="preview-token-img">
              {{ decorate(baseTokenAmount, true) }}
              <span class="token-unit">TAZ Chip</span>
            </div>
            <div class="exchange-rate" v-if="quoteToken === 'EOS'">1 EOS = 1,000 TAZ Chip</div>
            <div class="exchange-rate" v-if="quoteToken === 'TAZ'">1 TAZ = 10 TAZ Chip</div>
            <div class="purchase-btn" @click="purchase">{{ $t('store.purchase') }} </div>
          </div>
        </div>
        <div class="history-wrap">
          <div class="history-title">{{ $t('store.orderHistory') }} </div>
          <div class="history-header-row">
            <div class="header-date">{{ $t('store.date') }} </div>
            <div class="header-payment">{{ $t('store.payment') }} </div>
            <div class="header-token">TAZ Chip</div>
          </div>
          <div class="list-container">
            <div v-for="(history, index) of histories" :key="index" class="history-data-row">
              <div class="data-date">{{ getHistoryDate(history.created) }}</div>
              <div class="data-payment">{{ decorate(history.pay_amount, true) }} {{history.pay_token}}</div>
              <div class="data-token">{{ decorate(history.get_amount, false) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <g-footer />
  </div>
</template>

<script>
import Footer from '../components/Footer.vue';
import { mapState, mapMutations } from 'vuex';
import { setTimeout } from 'timers';

export default {
  data() {
    return {
      tokenShow: false,
      histories: [
        {date: '28/08/28 18:00', payment: '10,000.0 EOS', token: '10,000,000'},
      ],
      quoteToken: 'EOS',
      quoteTokenAmount: undefined,
      showToast: false,
      toastMsg: '',
      toastImg: '/img/store/ok.svg',
      showDetailMsg: false,
      detailMsg: '',
    }
  },
  computed: {
    ...mapState({
      /**
       * 사용자 데이터
       */
      userData(state) {
        return state.common.userData;
      },
      userID(state) {
        if (!state.common.account.name) {
          return ''
        }
        return state.common.account.name;
      },
      /**
       * 로그인 상태인지 판단
       */
      isLogin(state) {
        return state.common.account.name !== undefined;
      },
      /**
       * 
       */
      tazchipBalance(state) {
        if (!state.common.account.name) {
          return 0;
        }
        return state.common.balance.tazchip;
      },
      /**
       * 
       */
      tazBalance(state) {
        if (!state.common.account.name) {
          return 0;
        }
        return state.common.balance.taz;
      },
      /**
       * 
       */
      eosBalance(state) {
        if (!state.common.account.name) {
          return 0;
        }
        return state.common.balance.eos;
      },
    }),
    /**
     * 구매에 사용할 토큰 이미지
     */
    quoteTokenImg() {
      if (this.quoteToken === 'EOS') {
        return '/img/drawer/EOStoken.svg';
      }
      return '/img/drawer/taztoken.svg';
    },
    /**
     * 구매할 TAZ Chip의 수량
     */
    baseTokenAmount() {
      if (!this.quoteTokenAmount) {
        return 0;
      }

      if (this.quoteToken === 'EOS') {
        return this.quoteTokenAmount * 1000;
      }

      return this.quoteTokenAmount * 10;
    },
    /**
     * 구매 수량 에디터의 hint
     */
    quoteTokenHint() {
      return (this.quoteToken === 'EOS') ? 'Minimum 0.1' : 'Minimum 10';
    },
    /**
     * VIP 메달 이미지
     */
    vipMedal() {
      return `/img/vip/ic-vip${this.userData.vip}.svg`
    },
  },
  created() {
    this.fetchHistoryData();
    this.$eventBus.$on('close-dropdonw', (except) => {
      if (except !== 'store-token') {
        this.tokenShow = false;
      }
    });
  },
  mounted() {
    if (this.isLogin) { 
      this.fetchUserData(this.userID);
    }
  },
  watch: {
    userID: function() {
      this.fetchHistoryData();
    }
  },
  methods: {
    /**
     * vuex store
     */
    ...mapMutations([
      'setEosBalance',
      'setTazBalance',
      'setTazchipBalance',
      'setUserData'
    ]),
    //
    // order history정보 호출
    //
    fetchHistoryData() {
      fetch(`${this.$REST_API_SERVER}/api/v1/orders?account=${this.userID}`)
        .then(res => {
          return res.json();
        })
        .catch( () => {
          this.histories = {
                              pay_amount: '-',
                              created: '-',
                              pay_token: '-',
                              get_amount: '-'
                            }
        })
        .then(data => {
          if (data) {
            this.histories = data.orders;
          } else {
            this.histories = [];
          }
        })
    },
    //
    // 유저 정보 호출
    //
    fetchUserData(account) {
      fetch(`${this.$REST_API_SERVER}/api/v1/users?account=${account}`, {
        "method": "GET",
        "headers": {
          "content-type": "application/json"
        }
      })
      .then(response => {
        response.json().then(userData => {
          this.setUserData(userData);
        })
        .catch(err => {
          console.log(err)
        })
      })
      .catch(err => {
        console.log(err);
      });
    },
    //
    // order history 날짜 양식
    //
    getHistoryDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear() - 2000
      const month = (date.getMonth() + 1) < 10 ? '0'+(date.getMonth() + 1) : date.getMonth() + 1;
      const day = date.getDate() < 10 ? '0'+date.getDate() : date.getDate();
      const hour = (date.getHours()) < 10 ? '0'+ (date.getHours()) : date.getHours();
      const minutes = date.getMinutes() < 10 ? '0'+ date.getMinutes() : date.getMinutes();
      return `${day}/${month}/${year} ${hour}:${minutes}`
    },

    selectQuoteToken($event, token) {
      this.quoteToken = token;
      this.quoteTokenAmount = undefined;
      this.tokenShow= !this.tokenShow;
      this.$eventBus.$emit('close-dropdonw','store-token');
      $event.stopPropagation();
    },
    //
    // 토큰 값 양식
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
    //
    // 토큰 구매
    //
    purchase() {
      if (!this.userID) {
        this.toastImg = '/img/store/alert.svg'
        this.toastMsg = 'error';
        this.detailMsg = 'checkLogin';
        this.showDetailMsg = true;
        this.showToast = true;
        return;
      }

      if (!this.quoteTokenAmount || (this.quoteToken === 'EOS' && this.quoteTokenAmount < 0.1)
                                 || (this.quoteToken === 'TAZ' && this.quoteTokenAmount < 10)) {
        if (this.quoteToken === 'EOS') {
          this.toastImg = '/img/store/alert.svg'
          this.toastMsg = 'error';
          this.detailMsg = 'checkMinEOS';
          this.showDetailMsg = true;
          this.showToast = true;
        } else {
          this.toastImg = '/img/store/alert.svg'
          this.toastMsg = 'error';
          this.detailMsg = 'checkMinTAZ';
          this.showDetailMsg = true;
          this.showToast = true;
        }
        return;
      }

      if (this.quoteToken === 'EOS' && this.eosBalance < this.quoteTokenAmount) {
        this.toastImg = '/img/store/alert.svg'
        this.toastMsg = 'error';
        this.detailMsg = 'checkEOSBalance';
        this.showDetailMsg = true;
        this.showToast = true;
        return;
      }

      if (this.quoteToken === 'TAZ' && this.tazBalance < this.quoteTokenAmount) {
        this.toastImg = '/img/store/alert.svg'
        this.toastMsg = 'error';
        this.detailMsg = 'checkTAZBalance';
        this.showDetailMsg = true;
        this.showToast = true;
        return;
      }
      
      const contract = (this.quoteToken === 'EOS') ? 'eosio.token' : 'taztokenbase';
      const amount = (this.quoteToken === 'EOS') ? `${Number.parseFloat(this.quoteTokenAmount).toFixed(4)} EOS` : `${Number.parseFloat(this.quoteTokenAmount).toFixed(4)} TAZ`;
      this.$chain.transfer(this.userID, 'tazchipstore', contract, amount).subscribe(
        result => {
          console.log(result);
          if (result.processed.receipt.status === 'executed') {
            this.toastImg = '/img/store/ok.svg'
            this.toastMsg = 'success';
            this.showDetailMsg = false;
            this.showToast = true;
            this.quoteTokenAmount = '';
          }
          this.$chain.getEosBalance(this.userID).subscribe(
            eosBalance => {
              if (eosBalance.length > 0) {
                const token = eosBalance[0].split(' ');
                this.setEosBalance(Number.parseFloat(token[0]));
              } else {
                this.setEosBalance(0);
              }
            },
            error => console.error(error)
          );

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

          this.$chain.getBalance('taztokenbase', this.userID, 'TAZCHIP').subscribe(
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

          setTimeout(() => this.fetchHistoryData(), 2000)
        },
        error => {
          console.error(error)
        }
      )
    },
    toggleTokenDropdown($event) {
      this.tokenShow = !this.tokenShow;
      this.$eventBus.$emit('close-dropdonw','store-token');
      $event.stopPropagation();
    }
  },
  components: {
    'g-footer': Footer
  }
}
</script>

<style lang="scss" scoped>
  @import '../scss/flex.scss';
  @import '../scss/fonts.scss';

  .app {
    @extend .flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    min-height: 100%;
    background-image: url('/img/mobile-background.svg');
    background-repeat: repeat;
    background-position: center;
    background-size: 40%;
    @media (min-width: 984px) {
      background-image: url('/img/background-red.jpg');
      background-size: cover;
    }
  }

  .layout {
    @media (min-width: 984px) {
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
    }
  }

  .title-wrap {
    width: 100%;
    margin: 28px 0;
    height: 68px;

    @media (min-width: 984px) {
      margin: 60px 0;
    }
  }

  .title-box {
    position: relative;
    width: 312px;
    height: 100%;
    margin: 0 auto;
  }

  .title-img {
    display: block;
    position: absolute;
    z-index: 0;
    width: 100%;
    height: 100%;
    margin: 0 auto;
  }

  .title-text {
    @extend .text-title-big;
    position: absolute;
    color: white;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-90%);

    @media (min-width: 984px) {
      font-size: 24px;
    }
  }

  .user-info-wrap {
    min-width: 260px;
    width: 50%;
    height: 218px;
    margin: 0 auto 56px;
    padding: 16px;
    box-sizing: border-box;
    background: #131E3A;
    border: 1px solid #2A3D6C;
    border-radius: 6px;

    @media (min-width: 984px) {
      width: 320px;
      height: 572px;
      margin: 0 20px 56px auto;
      padding: 40px 0;
    }
  }

  .medal-wrap {
    @extend .flex;
    width: 156px;
    height: 30px;
    margin: 0 auto 16px;

    @media (min-width: 984px) {
      justify-content: center;
      align-items: center;
      flex-direction: column;
      width: 184px;
      height: 166px;
    }

    & .medal-img {
      width: 30px;
      height: 30px;

      @media (min-width: 984px) {
        width: 120px;
        height: 120px;
      }
    }

    & .user-name {
      @extend .text-normal;
      color: white;
      line-height: 30px;
      margin: 0 auto;

      @media (min-width: 984px) {
        font-size: 18px;
      }
    }
  }

  .balance-boxsize {
    @extend .flex;
    justify-content: space-between;
    min-width: 208px;
    width: 80%;
    height: 24px;
    margin: 0 auto 10px;

    @media (min-width: 984px) {
      height: 32px;
      margin-bottom: 16px;
    }
  }

  .balance-header {
    @extend .balance-boxsize;
    @extend .text-normal;
    color: #FFD8A1;
    line-height: 30px;

    @media (min-width: 984px) {
      font-size: 18px;
    }
  }

  .balance-row {
    @extend .balance-boxsize;
    @extend .text-normal;
    color: white;

    @media (min-width: 984px) {
      font-size: 18px;
      font-weight: 400;
    }

    & .token-img {
      width: 16px;
      height: 16px;
      margin: 4px 8px 4px 0;
      @media (min-width: 984px) {
        width: 20px;
        height: 20px; 
      }
    }

    & .token-name {
      @extend .flex;
      line-height: 24px;
    }

    & .balance-value {
      line-height: 24px;
    }
  }

  .purchase-order-wrap {
    margin-right: auto;
    margin-bottom: 150px;
    @media (min-width: 984px) {
      margin-left: 20px;
    }
  
  }

  .purchase-box-wrap {
    position: relative;
    min-width: 324px;
    width: 40%;
    margin: 0 auto 56px;

    @media (min-width: 984px) {
      width: 456px;
      margin: 0 auto 56px;
    }
  }

  .purchase-box-img {
    position: absolute;
    top: 0;
    width: 100%;
  }

  .hidden-box {
    min-width: 324px;
    width: 103%
  }

  .content-box {
    width: 264px;
    width: 80%;
    height: 428px;
    background: linear-gradient(180deg, #3C1708 0%, #130703 100%);
    margin: 0 auto;
    border-radius: 6px;
  }


  .anouncement-text {
    @extend .text-normal;
    @extend .flex;
    @extend .flex-center;
    @extend .flex-middle;
    color: white;
    line-height: 28px;
    text-align: center;
    height: 144px;
    font-weight: 400;
  }

  .purchase-input-wrap {
    @extend .flex;
    @extend .flex-center;
  }

  .purchase-input {
    @extend .text-normal;
    width: 106px;
    height: 32px;
    background: #612D17;
    box-shadow: inset 4px 4px 8px rgba(0, 0, 0, 0.25);
    border-radius: 5px;
    border: none;
    text-align: center;
    margin-right: 10px;
    color: #C0C0C0;

    &::placeholder {
      color: #C0C0C0;
    }

    &:focus {
      outline: none;
      caret-color: white;
    }

    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      margin: 0; 
    }
  }

  .token-selector {
    @extend .flex;
    @extend .text-normal;
    position: absolute;
    font-weight: 400;
    position: absolute;
    z-index: 100;
    justify-content: space-between;
    align-items: center;
    width: 92px;
    height: 32px;
    background: #612D17;
    color: #FFD8A1;
    box-shadow: inset 4px 4px 8px rgba(0, 0, 0, 0.25);
    border-radius: 60px;
    cursor: pointer;

    & .purchase-token-img {
      width: 20px;
      height: 20px;
      margin: 6px;
    }

    & .select-btn {
      width: 10px;
      height: 5px;
      margin: 13px 7px 14px;
    }
  }

  .arrow {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(97, 45, 23, 0.3);
    margin: 20px auto;
  }

  .arrow-img {
    width: 16px;
    height: 16px;
    margin: 8px;
  }

  .preview-box {
    @extend .flex;
    @extend .text-normal;
    font-weight: 400;
    justify-content: space-between;
    width: 224px;
    height: 32px;
    background: rgba(97, 45, 23, 0.3);
    margin: 0 auto;
    color: #13EB1B;
    line-height: 34px;
  }

  .preview-token-img {
    width: 20px;
    height: 20px;
    margin: 6px;
  }

  .token-unit {
    width: 84px;
    height: 32px;
    text-align: center;
    color: white;
    line-height: 34px;
  }

  .exchange-rate {
    width: 224px;
    height: 44px;
    @extend .text-normal;
    color: #C0C0C0;
    margin: 0 auto;
    line-height: 44px;
    text-align: center;
    font-weight: 400;
  }

  .purchase-btn {
    width: 156px;
    height: 48px;
    margin: 28px auto;
    background: linear-gradient(180deg, #DA241C 0%, #5B110D 100%);
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 15px;
    @extend .text-btn-big;
    color: white;
    line-height: 48px;
    text-align: center;
    font-weight: 400;
    cursor: pointer;

    &:hover {
      color: #FFFF58;
    }
  }

  .history-wrap {
    min-width: 312px;
    width: 50%;
    height: 344px;
    margin: 0 auto;
    margin-bottom: 56px;
    border: 1px solid #2A3D6C;
    background: #131E3A;
    padding: 0 8px;
    box-sizing: border-box;
    border-radius: 6px;

    @media (min-width: 984px) {
      width: 376px;
      min-height: 344px;
      margin: 0 auto;
    }
  }

  .list-container {
    height: 240px;
    overflow-y: scroll;
    &::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 10px;
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      box-shadow: inset 0 0 6px rgba(0,0,0,.3);
      background: #2A3D6C;    }
  }

  .history-title {
    @extend .text-title;
    color: #FFD8A1;
    text-align: center;
    height: 52px;
    line-height: 52px;
  }

  .history-header-row {
    @extend .flex;
    @extend .text-normal;
    justify-content: space-around;
    height: 32px;
    line-height: 32px;
    color: #FFD8A1;
    padding: 0 10px;
  }

  .header-date {
    width: 100px;
  }

  .header-payment {
    width: 88px;
    text-align: right;
  }

  .header-token {
    width: 100px;
    text-align: right;
  }

  .history-data-row {
    @extend .flex;
    @extend .text-small;
    height: 24px;
    line-height: 24px;
    color: white;
    font-weight: 400;
    padding: 0 10px;
    justify-content: space-around;
  }

  .data-date {
    width: 100px;
  }

  .data-payment {
    width: 88px;
    text-align: right;
  }

  .data-token {
    width: 100px;
    text-align: right;
  }


  .slide-enter-active {
    transition: all .3s ease;
  }

  .slide-leave-active {
    transition: all .3s;
  }

  .slide-enter,
  .slide-leave-to {
    transform: translateY(-10px);
    opacity: 0;
  }

  .token-selector-wrap {
    position: relative;
    width: 92px;
    height: 32px;
  }

  .token-dropdown-content {
    position: absolute;
    z-index: 0;
    top: 16px;
    left: 0;
    width: 92px;
    height: 136px;
  }

  .token-select-row-0 {
    height: 16px;
    background: #563008;
  }

  .token-select-row {
    @extend .text-btn-small;
    @extend .flex;
    font-weight: 400;
    background: #563008;
    height: 40px;
    text-align: left;
    line-height: 42px;
    color: white;
    border-top: 1px solid #9E896A;
    cursor: pointer;

    &:hover {
      color: #563008;
      background: white;
    }

    &:nth-child(2) {
      border-top: none;
    }

    &:nth-child(3) {
      border-radius: 0px 0px 15px 15px;
    }
  }

  .token-select-row-img {
    width: 20px;
    height: 20px;
    margin: 10px 6px;
  }

  .toast-store {
    position: absolute;
    width: 324px;
    height: 240px;
    background: white;
    color: black;
    top: 26%;
    z-index: 9999;
    left: 50%;
    margin-left: -168px;
    @media (min-width: 984px) {
      width: 436px;
    }
  }

  .toast-store-enter-active, .toast-store-leave-active {
    transition: all .5s 
  }

  .toast-store-enter, .toast-store-leave-to {
    opacity: 0;
    transform: translateY(-50%)
  }

  .close-btn-wrap {
    width: 74px;
    height: 32px;
    color: white;
    font-weight: 400;
    background: linear-gradient(180deg, #DA241C 0%, #5B110D 100%);
    border-radius: 4px;
    margin: 24px auto 0;
    line-height: 34px;
    text-align: center;
    font-size: 14px;
    cursor: pointer;
  }

  .copied-img {
    display: block;
    width: 98px;
    height: 84px;
    margin: 20px auto 0;
  }

  .copied-text {
    @extend .text-normal;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 600;
    height: 56px;
    text-align: center;
  }

  .detail-text {
    height: 28px;
    @extend .text-normal;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 600;
    text-align: center;
  }

  .doubleline {
    height: 28px;
  }




  </style>
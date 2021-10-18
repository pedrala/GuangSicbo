<template>
  <div class="layout">
    <div class="header">{{ $t('wallet.wallet') }} </div>
    <div class="content-wrap">
      <router-link to="/vip" class="router-link">
        <div class="username-wrap">
          <img :src="vipMedal" alt="medal" class="medal-img">
          <div class="username-text">{{ this.userId }}</div>
        </div>
      </router-link>
      <div class="description">{{ $t('wallet.info') }} </div>
      <div class="balance-box">
        <div class="balance-header">
          <span class="token-name-header">{{ $t('wallet.token') }}</span>
          <span class="balance-value-header">{{ $t('wallet.balance') }}</span>
        </div>
        <div v-for="balance of balances" :key="balance.token" class="balance-row">
          <div class="token-name"><img :src="balance.tokenImg" class="token-img">{{ balance.token }}</div>
          <span class="balance-value"> {{ decorate(balance.balance) }} </span>
        </div>
      </div>
      <router-link to="/store" class="router-link">
        <div class="store-btn">{{ $t('wallet.store') }} </div>
      </router-link>
    </div>
    <g-footer />
  </div>
</template>

<script>
import Footer from '../components/Footer.vue';
import { mapState, mapMutations } from 'vuex';

  export default {
    data() {
      return {
        balances: [
          {tokenImg: '/img/drawer/tazchip.svg', token: 'TAZ Chip', balance: 0},
          {tokenImg: '/img/drawer/taztoken.svg', token: 'TAZ', balance: 0},
          {tokenImg: '/img/drawer/EOStoken.svg', token: 'EOS', balance: 0}
        ]
      } 
    },
    created() {
      this.setBalance();
    },
    mounted() {
      if (this.isLogin) {
        this.fetchUserData(this.account.name);
      }
    },
    watch: {
      account: function(user) {
        this.fetchUserData(user.name);
      },
      userId: function() {
        this.setBalance();
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
        userId(state) {
          return state.common.account.name || '-'
        },
        tazChip(state) {
          if (!state.common.account.name) {
            return 0;
          }
          return state.common.balance.tazchip;
        },
        taz(state) {
          if (!state.common.account.name) {
            return 0;
          }
          return state.common.balance.taz;
        },
        eos(state) {
          if (!state.common.account.name) {
            return 0;
          }
          return state.common.balance.eos;
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
      }),
      //
      //  vip레벨에 따라 Medal 이미지 url 리턴
      //
      vipMedal() {
        return `/img/vip/ic-vip${this.userData.vip}.svg`
      },
    },
    methods: {
      /**
       * vuex store
       */
      ...mapMutations([
        'setUserData'
      ]),
      //
      // 유저의 토큰 정보 
      //
      setBalance() {
        this.balances[0].balance = this.tazChip;
        this.balances[1].balance = this.taz;
        this.balances[2].balance = this.eos;
      },
      //
      // 토큰 값을 장식
      //
      decorate(number) {
        const a = number.toFixed(4).toString().split('.');
        const regexp = /\B(?=(\d{3})+(?!\d))/g;
        return a[0].replace(regexp, ',')+'.'+a[1];
      },
      //
      //  유저의 정보를 호출
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
    },
    components: {
      'g-footer': Footer
    },
    

  }
</script>

<style lang="scss" scoped>
  @import '../scss/flex.scss';
  @import '../scss/fonts.scss';

  .layout {
    width: 100%;
    height: 100%;
    color: white;
    background-image: url('/img/mobile-background.svg');
    background-repeat: repeat;
    background-position: center;
    background-size: 40%;
    @media (min-width: 984px) {
      background-image: url('/img/background-red.jpg');
      background-size: cover;
    }
  }

  .header {
    @extend .text-title-big;
    margin: 28px 0;
    line-height: 28px;
    height: 28px;
    text-align: center;
    font-weight: 500;
    @media (min-width: 984px) {
      font-size: 24px;
      margin: 60px 0;
    }
  }

  .content-wrap {
    min-width: 312px;
    width: 50%;
    height: 450px;
    margin: 0 auto;
    margin-bottom: 146px;
    background: rgba(14, 21, 38, 0.9);
    border: 1px solid #2A3D6C;
    box-sizing: border-box;
    border-radius: 6px;
    @media (min-width: 984px) {
      width: 504px;
      height: 644px;
      margin-bottom: 440px;
    }
  }

  .username-wrap {
    @extend .flex;
    @extend .flex-middle;
    height: 30px;
    margin: 28px auto;
    width: fit-content;
    @media (min-width: 984px) {
      margin-top: 56px;
      height: 60px;
    }
  }

  .medal-img {
    height: 30px;
    width: 30px;
    @media (min-width: 984px) {
      height: 60px;
      width: 60px;
    }
  }

  .username-text {
    @extend .text-normal;
    width: 126px;
    text-align: center;
    @media (min-width: 984px) {
      width: 184px;
      font-size: 18px;
    }
  }
  

  .description {
    @extend .flex;
    @extend .flex-middle;
    @extend .text-normal;
    font-weight: 400;
    width: 216px;
    height: 64px;
    margin: 0 auto 28px;
    @media (min-width: 984px) {
      width: 280px;
      font-size: 18px;
    }
  }

  .balance-box {
    min-width: 260px;
    width: 80%;
    height: 168px;
    margin: 0 auto;
    padding: 16px 26px;
    box-sizing: border-box;
    background: #131E3A;
    border-radius: 6px;
    @media (min-width: 984px) {
      height: 248px;
      width: 400px;
      padding: 28px 52px;
      margin-bottom: 56px;
    }
  }

  
  .balance-boxsize {
    @extend .flex;
    @extend .flex-middle;
    justify-content: space-between;
    min-width: 208px;
    width: 100%;
    height: 24px;
    margin-bottom: 10px; 
    @media (min-width: 984px) {
      height: 48px;
      margin: 0;
    }
  }

  .balance-header {
    @extend .balance-boxsize;
    @extend .text-normal;
    font-weight: 400;
    color: #FFD8A1;
    line-height: 30px;
    @media (min-width: 984px) {
      font-size: 18px;
    }
  }

  .router-link {
    text-decoration: none;
    color: white
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

  .store-btn {
    width: 156px;
    height: 48px;
    margin:  28px auto;
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
</style>
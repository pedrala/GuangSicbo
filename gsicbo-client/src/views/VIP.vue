<template>
  <div class="layout">
    <div class="content-wrap">
      <div class="title">{{$t('vip.vip')}}</div>
      <div class="user-info-wrap">
        <div class="user-medal-wrap">
          <img :src="vipMedal" alt="" class="user-medal-img">
        </div>
        <div class="levelup-guide">
          {{$t('vip.levelup1')}}
          <div class="stress">{{formatedNumber(nextLevelTazChip)}} TAZ Chip</div>
          {{$t('vip.levelup3')}}
        </div>
        <div class="levelup-gauge">
          <img :src="vipMedal" alt="" class="gauge-medal-img">
          <div class="gauge-bar-wrap">
            <div class="gauge-bar-bg"></div>
            <div class="gauge-bar-fg" :style="`width:${nextLevel}%`"></div>
            <div class="gauge-bar-text">{{nextLevel.toFixed(1)}}%</div>
          </div>
          <img :src="nextLevelMedal" alt="" class="gauge-medal-img">
        </div>
        <div class="bonus-description">
          {{$t('vip.desc1')}}<br>{{$t('vip.desc2')}}
          <br><br>
          <div class="stress">{{$t('vip.desc3')}}</div>
          {{$t('vip.desc4')}}
        </div>
      </div>
      <div class="vip-level-wrap">
        <div>
          <div class="vip-level-title-wrap">
            <div class="vip-level-title">{{$t('vip.vipLevel')}}</div>
            <img src="/img/vip/ribbon.svg" class="ribbon">
          </div>
          <div class="rank-wrap">
            <div class="axis-bg"></div>
            <div class="row-title">
              <div class="wager-header">{{$t('vip.wager')}}<br>{{$t('vip.tazChip')}}</div>
              <div class="bonus-header">{{$t('vip.bonus')}}<br>{{$t('vip.percentage')}}</div>
            </div>
            <div class="level-row-wrap">
              <div v-for="level of levels" :key="level.level" class="level-row">
                <div class="wager-text">{{ level.wager }}</div>
                <div class="level-text">{{ level.level }}</div>
                <div :class="level.barsize"></div>
                <img :src="level.medalImg" class="rank-medal">
                <div class="bonus-text">{{ level.percentage }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <g-footer />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Footer from '../components/Footer.vue';

const VIP = [
  0,
  1000000,
  5000000,
  10000000,
  50000000,
  100000000,
  500000000,
  1000000000,
  2500000000,
  7500000000,
  15000000000
];

export default {
  data() {
    return {
      levels: [
        { wager: '1 M', level: 1, barsize:'bar-level-1', medalImg: '/img/vip/ic-vip1.svg', percentage: '0.02 %'},
        { wager: '5 M', level: 2, barsize:'bar-level-2', medalImg: '/img/vip/ic-vip2.svg', percentage: '0.03 %'},
        { wager: '10 M', level: 3, barsize:'bar-level-3', medalImg: '/img/vip/ic-vip3.svg', percentage: '0.04 %'},
        { wager: '50 M', level: 4, barsize:'bar-level-4', medalImg: '/img/vip/ic-vip4.svg', percentage: '0.05 %'},
        { wager: '100 M', level: 5, barsize:'bar-level-5', medalImg: '/img/vip/ic-vip5.svg', percentage: '0.06 %'},
        { wager: '500 M', level: 6, barsize:'bar-level-6', medalImg: '/img/vip/ic-vip6.svg', percentage: '0.07 %'},
        { wager: '1,000 M', level: 7, barsize:'bar-level-7', medalImg: '/img/vip/ic-vip7.svg', percentage: '0.09 %'},
        { wager: '2,500 M', level: 8, barsize:'bar-level-8', medalImg: '/img/vip/ic-vip8.svg', percentage: '0.11 %'},
        { wager: '7,500 M', level: 9, barsize:'bar-level-9', medalImg: '/img/vip/ic-vip9.svg', percentage: '0.13 %'},
        { wager: '15,000 M', level: 10, barsize:'bar-level-10', medalImg: '/img/vip/ic-vip10.svg', percentage: '0.15 %'},
      ],
      userData: {
        account: '',
        vip: 0,
        accumulated_bet: 0,
        accumulated_prize: 0,
        staked: 0,
        unstaking: 0,
        unstaking_requested: 0,
        created: '',
        updated: '',
        signup_reward: 0
      }
    }
  },
  mounted() {
    if (this.isLogin) {
      this.fetchUserData(this.account.name);
    }
  },
  watch: {
    account: function(user) {
      this.fetchUserData(user.name);
    }
  },
  computed: {
    ...mapState({
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
    // 레벨에 따른 vip메달 이미지 url 리턴
    //
    vipMedal() {
      return `/img/vip/ic-vip${this.userData.vip}.svg`
    },
    nextLevel() {
      if (this.userData.vip >= 10) {
        return 100;
      }
      const reqNextLevel = VIP[this.userData.vip + 1];
      return (this.userData.accumulated_bet / reqNextLevel) * 100;
    },
    nextLevelMedal() {
      return `/img/vip/ic-vip${(this.userData.vip >= 10) ? 10 : this.userData.vip + 1}.svg`
    },
    nextLevelTazChip() {
      if (this.userData.vip >= 10) {
        return 0;
      }
      const reqNextLevel = VIP[this.userData.vip + 1];
      return reqNextLevel - this.userData.accumulated_bet;
    }
  },
  methods: {
    //
    // 유저정보 fetch
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
          this.userData = userData;
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
    // 숫자 값 형식화
    //
    formatedNumber(num) {
      const regexp = /\B(?=(\d{3})+(?!\d))/g;
      return num.toString().replace(regexp, ',');
    },
  },
  components: {
    'g-footer': Footer
  }

}
</script>

<style lang="scss" scoped>
  @import '../scss/flex.scss';
  @import '../scss/fonts.scss';

  .layout {
    width: 100%;
    height: 100%;
    color: white;
    @extend .flex;
    flex-direction: column;
    justify-content: space-between;
    background-image: url('/img/mobile-background.svg');
    background-repeat: repeat;
    background-position: center;
    background-size: 40%;
    @media (min-width: 984px) {
      background-image: url('/img/background-red.jpg');
      background-size: cover;
    }
  }

  .title {
    font-size: 24px;
    font-weight: 900;
    height: 28px;
    line-height: 20px;
    margin: 28px 0;
    text-align: center;
    letter-spacing: 0.24em;
    text-shadow: 0px 0px 10px #FFFF99;
    @media (min-width: 984px) {
      margin: 60px 0;
      font-size: 36px;
    } 
  }

  .user-info-wrap {
    @extend .flex;
    @extend .flex-column;
    flex-wrap: wrap;
    height: 246px;
    @media (min-width: 984px) {
      height: 324px;
    }
  }

  .user-medal-wrap {
    height: 100%;
    width: 104px;
    margin-left: auto;
    @media (min-width: 984px) {
      width: 296px;
      margin-right: 24px;
    }
  }

  .user-medal-img {
    display: block;
    width: 90px;
    height: 90px;
    margin: 0 auto;
    @media (min-width: 984px) {
      width: 200px;
      height: 200px
    }
  }

  .levelup-guide {
    font-size: 16px;
    color: #DDDDDD;
    font-weight: 400;
    height: 60px;
    margin-bottom: 10px;

    @media (min-width: 984px) {
      width: 376px; 
      height: 80px;
      font-size: 20px;
      line-height: 21px;
    }
  }

  .stress {
    color: #FFD8A1;
  }

  .levelup-gauge {
    @extend .flex;
    height: 36px;
    display: flex;
    align-items: center;
    @media (min-width: 984px) {
      height: 56px;
    }
  }

  .gauge-medal-img {
    width: 36px;
    height: 36px;
    @media (min-width: 984px) {
      width: 56px;
      height: 56px;
    }
  }

  .gauge-bar-wrap {
    position: relative;
    height: 12px; 
    width: 136px;
    margin: 8px;
    @media (min-width: 984px) {
      width: 288px;
      height: 20px;
    }
  }

  .gauge-bar-bg {
    position: absolute;
    z-index: 0;
    background: #612D17;
    box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.4);
    border-radius: 30px;
    width: 100%;
    height: 100%;
  }

  .gauge-bar-fg {
    height: 100%;
    position: absolute;
    top:0;
    z-index: 10;
    background: linear-gradient(90deg, #FFD8A1 0%, #8C5113 100%);
    border-radius: 30px;
  }

  .gauge-bar-text {
    font-size: 10px;
    position: absolute;
    z-index: 100;
    top:0;
    left: 50%;
    transform: translateX(-50%);
    @media (min-width: 984px) {
      line-height: 22px;
      font-size: 14px;
    }
  }

  .bonus-description {
    @extend .flex;
    @extend .flex-column;
    @extend .flex-center;
    @extend .text-small;
    font-weight: 400;
    line-height: 16px;
    height: 136px;
    width: 198px;

    @media (min-width: 984px) {
      margin-top: 8px;
      width: 456px; 
      font-size: 14px;
    }
  }

  .vip-level-title-wrap {
    position: relative;
    width: 312px;
    height: 54px;
    margin: 0 auto;
    @media (min-width: 984px) {
      // margin-top: 46px;
    }
    
  }

  .ribbon {
    position: absolute;
    top:0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .vip-level-title {
    @extend .text-title-big;
    font-weight: 500;
    position: absolute;
    z-index: 10;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-90%)
  }
    
  .rank-wrap {
    @extend .flex;
    flex-direction: column;
    position: relative;
    width: 312px;
    height: 454px;
    margin: 48px auto 15px;
    @media (min-width: 984px) {
      flex-direction: row;
      width: 936px;
      height: 344px;
    }
  }

  .axis-bg {
    position: absolute;
    border-bottom : 1px solid #524A3E;
    border-left: 1px solid #524A3E;
    width: 228px;
    height: 454px;
    top: 0;
    left: 74px;
    z-index: 0;
    @media (min-width: 984px) {
      width: 800px;
      height: 296px;
      left: 104px;
    }
  }

  .row-title {
    @extend .flex;
    @extend .text-normal;
    font-weight: 400 ;
    width: 100%;
    
    @media (min-width: 984px) {
      flex-direction: column-reverse;
      width: 80px;
      height: 100%;
      margin-bottom: 0;
      text-align: right;
      margin-right: 28px;
    }
  }

  .wager-header {
    text-align: right;
    margin-right: 100px;
    color: #C0C0C0;
    @media (min-width: 984px) {
      margin: 44px 0 0 0;
    }
  }

  .level-row-wrap {
    @extend .flex;
    flex-direction: column;
    width: 308px;
    @media (min-width: 984px) {
      position: relative;
      flex-direction: row;
      height: 100%;
      width: fit-content;
      margin: 0;
    }
  }

  .level-row {
    @extend .flex;
    @extend .text-normal;
    @extend .flex-middle;
    font-weight: 400;
    margin-left: -4px;
    @media (min-width: 984px) {
      flex-direction: column-reverse;
      height: 100%;
      width: fit-content;
      margin: 0;
    }
  }

  .wager-text {
    width: 68px;
    text-align: right;
    color: #C0C0C0;
    z-index: 54;
    margin-right: 30px;
    padding-right: 10px;
    box-sizing: border-box;
    @media (min-width: 984px) {
      width: 80px;
      height: 40px;
      margin: 20px 0 0 0;
      padding: 0;
      text-align: center;
      line-height: 48px;
    }
  }

  .level-text {
    position: absolute;
    left: 64px;
    width: 20px;
    height: 16px;
    text-align: center;
    background: linear-gradient(180deg, #FFD8A1 0%, #8C5113 100%);
    border-radius: 2px;
    @media (min-width: 984px) {
      position: relative;
      width: 40px;
      left: 0;
      margin: 8px 0 -20px
    }
  }

  .vip-level-wrap {
    background: rgba(14, 21, 38, 0.8);
    border-radius: 6px;
    min-width: 312px;
    width: 50%;
    height: 596px;
    margin: 56px auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 20px;
    padding-left: 8px;
    box-sizing: border-box;
    @media(min-width: 984px) {
      padding-top: 26px;
      margin-bottom: 82px;
      width: 960px;
      height: 470px;
      box-sizing: content-box;
    }
  }

  .bar {
    height: 4px;
    background: linear-gradient(90deg, #FFD8A1 0%, #8C5113 100%);
    border-radius: 2px;
  }

  .bar-level-1 {
    @extend .bar;
    width: 8px;
    @media (min-width: 984px) {
      width: 8px;
      height: 20px;
    }
  }

  .bar-level-2 {
    @extend .bar;
    width: 18px;
    @media (min-width: 984px) {
      width: 8px;
      height: 40px;
    }
  }

  .bar-level-3 {
    @extend .bar;
    width: 28px;
    @media (min-width: 984px) {
      width: 8px;
      height: 60px;
    }
  }

  .bar-level-4 {
    @extend .bar;
    width: 38px;
    @media (min-width: 984px) {
      width: 8px;
      height: 80px;
    }
  }

  .bar-level-5 {
    @extend .bar;
    width: 48px;
    @media (min-width: 984px) {
      width: 8px;
      height: 100px;
    }
  }

  .bar-level-6 {
    @extend .bar;
    width: 58px;
    @media (min-width: 984px) {
      width: 8px;
      height: 120px;
    }
  }

  .bar-level-7 {
    @extend .bar;
    width: 68px;
    @media (min-width: 984px) {
      width: 8px;
      height: 140px;
    }
  }

  .bar-level-8 {
    @extend .bar;
    width: 78px;
    @media (min-width: 984px) {
      width: 8px;
      height: 160px;
    }
  }

  .bar-level-9 {
    @extend .bar;
    width: 88px;
    @media (min-width: 984px) {
      width: 8px;
      height: 180px;
    }
  }

  .bar-level-10 {
    @extend .bar;
    width: 98px;
    @media (min-width: 984px) {
      width: 8px;
      height: 200px;
    }
  }
  
  .rank-medal {
    width: 40px;
    height: 40px;
    margin: 0 6px;
    @media (min-width: 984px) {
      order: 1;
    }
  }

  .bonus-text {
    text-align: center;
    @media (min-width: 984px) {
      height: 40px;
      line-height: 40px;
    }
  }



</style>
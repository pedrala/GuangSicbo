<template>
  <div class="layout">
    <div class="header-wrap">
      <img src="/img/drawer/close.svg" class="close-btn" @click="closeDrawer">
      <div class="token-select-dropdown" v-if="!isSicbo">
        <div class="layout-token-selector" @click="toggleTokenDropdown">
          <img :src="userbalanceToken" class="selector-token-img">
          <span class="selector-text">{{balance}}</span>
          <img src="/img/sort-btn.svg" class="selector-icon">
        </div>
        <transition name="slide">
          <div class="token-dropdown-content" v-if="tokenShow" @click="toggleTokenDropdown">
            <div class="token-select-row-0">&nbsp;</div>
            <div class="token-select-row" @click="selectToken('tazchip')">
              <img src="/img/drawer/tazchip.svg" class="token-select-row-img">TAZ Chip
            </div>
            <div class="token-select-row" @click="selectToken('taz')">
              <img src="/img/drawer/taztoken.svg" class="token-select-row-img">TAZ
            </div>
            <div class="token-select-row" @click="selectToken('eos')">
              <img src="/img/drawer/EOStoken.svg" class="token-select-row-img">EOS
            </div>
          </div>
        </transition>
      </div>
      <language-selector v-else :is-lang-changed="isLangChanged" @lang-change="$emit('lang-change', $event)"></language-selector>
    </div>

    <div class="content-wrap">
      <div class="main-btn" @click="routeTo('sicbo')">
        <img src="/img/drawer/sicbotong.svg" class="main-btn-img">{{$t('navigation.sicbo')}}
      </div>
      <div class="main-btn" @click="routeTo('store')">
        <img src="/img/drawer/treasure.svg" class="main-btn-img">{{$t('navigation.store')}}
      </div>
      <div class="player-info-wrap">
        <div class="router-medal" @click="routeTo('vip')">
          <img :src="vipMedal" class="medal-img">
        </div>
        <div class="player-id-text">{{account}}</div>
        <div class="balance-selector-wrap">
          <div class="player-balance-wrap" @click="toggleBalanceDropdown">
            <img :src="userbalanceToken" class="balance-token-img">
            <span class="balance-text"> {{ balance }} {{ tokenUnit }}</span>
            <img src="/img/sort-btn.svg" class="sort-btn">
          </div>
          <transition name="slide">
            <div class="balance-dropdown-content" v-if="balanceShow" @click="toggleBalanceDropdown">
              <div class="balance-select-row-0">&nbsp;</div>
              <div class="balance-select-row" @click="selectToken('tazchip')">
                <img src="/img/drawer/tazchip.svg" class="balance-select-row-img">TAZ Chip
              </div>
              <div class="balance-select-row" @click="selectToken('taz')">
                <img src="/img/drawer/taztoken.svg" class="balance-select-row-img">TAZ
              </div>
              <div class="balance-select-row" @click="selectToken('eos')">
                <img src="/img/drawer/EOStoken.svg" class="balance-select-row-img">EOS
              </div>
            </div>
          </transition>
        </div>
        <div class="wallet-btn" @click="routeTo('wallet')">{{$t('navigation.wallet')}}</div>
      </div>
      <div class="sub-btn" @click="showModal('bonus')">{{$t('navigation.bonus')}}</div>
      <div class="sub-btn" @click="routeTo('vip')">{{$t('navigation.vip')}}</div>
      <div class="sub-btn" @click="showModal('referral')">{{$t('navigation.referral')}}</div>
      <div class="sub-btn" @click="logout" v-if="account !== ''">{{$t('navigation.logout')}}</div>
      <div class="sub-btn" @click="login" v-if="account === ''">{{$t('navigation.login')}}</div>
      <div class="socialmedia-wrap">
        <a href="https://medium.com/@funguanggame" target="_blank"><img src="/img/drawer/social-medium.svg"
            class="socialmedia-img"></a>
        <a href="http://t.me/guangsicbo_official/" target="_blank"><img src="/img/drawer/social-telegram.svg"
            class="socialmedia-img"></a>
        <a href="https://twitter.com/guanggame" target="_blank"><img src="/img/drawer/social-twitter.svg"
            class="socialmedia-img"></a>
      </div>

      <div class="setting-wrap">
        <span class="setting-text">{{$t('navigation.setting.music')}}</span>
        <label class="switch">
          <input type="checkbox" v-model="musicChecked" @click="musicStateToggle">
          <span class="slider"></span>
        </label>
        <span class="setting-text">{{$t('navigation.setting.effect')}}</span>
        <label class="switch">
          <input type="checkbox" v-model="effectChecked" @click="effectStateToggle">
          <span class="slider"></span>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import LanguageSelector from './LanguageSelector.vue';

export default {
  data() {
    return {
      tokenShow: false,
      balanceShow: false,
      musicChecked: false,
      effectChecked: false
    }
  },
  props: {
    isTokenChanged: {
      type: Boolean,
      default: false
    },
    isLangChanged: {
      type: Boolean,
      default: false
    }
  },
  components: {
    'language-selector': LanguageSelector,
  },
  computed: {
    ...mapState({
      /**
       * 사용자 데이터
       */
      userData(state) {
        return state.common.userData;
      },
      /**
       * VIP 메달 이미지 경로
       */
      vipMedal(state) {
        return `/img/vip/ic-vip${state.common.userData.vip}.svg`
      },
      /**
       * ,가 추가된 밸런스 정보
       */
      balance(state) {
        if(state.common.account.name) {
          const changed = this.isTokenChanged;
          const curToken = localStorage.getItem('GuangGame.curToken') || 'tazchip';
          const regexp = /\B(?=(\d{3})+(?!\d))/g;
          switch (curToken || changed) {
            case 'taz':
              return state.common.balance.taz.toString().replace(regexp, ',');
            case 'tazchip':
              return state.common.balance.tazchip.toString().replace(regexp, ',');
            case 'eos':
              return state.common.balance.eos.toFixed(1).toString().replace(regexp, ',');
            default :
              return 'error';
          }
        } else {
          return '-';
        }
      },
      /**
       * 로그인된 사용자의 계정명
       */
      account(state) {
        if (!state.common.account.name) {
          return ''
        }
        return state.common.account.name;
      }
    }),

    /**
     * 
     */
    userbalanceToken() {
      const isTokenChanged = this.isTokenChanged;
      const curToken = localStorage.getItem('GuangGame.curToken') || 'tazchip';
      switch (curToken || isTokenChanged) {
          case 'tazchip':
            return '/img/drawer/tazchip.svg';
          case 'taz':
            return '/img/drawer/taztoken.svg';
          case 'eos':
            return '/img/drawer/EOStoken.svg';
          default :
            return '/img/drawer/tazchip.svg';
        }
    },

    /**
     * 
     */
    tokenUnit() {
        const changed = this.isTokenChanged;
        const curToken = localStorage.getItem('GuangGame.curToken');
        switch (curToken) {
          case 'taz':
            return 'TAZ';
          case 'tazchip':
            return 'TAZ Chip';
          case 'eos':
            return 'EOS';
          default :
            return ' '||changed;
      }
    },

    /**
     * 
     */
    isSicbo() {
      return this.$route.name === 'sicbo' ? true : false;
    }
  },
  methods: {
    ...mapMutations([
      'setAppbarMode',
      'setDrawerState',
      'setDrawerMode'
    ]),
    //
    //  drawer 닫기
    //
    closeDrawer() {
      this.$emit('close-drawer');
    },
    //
    //  배경음 설정 변경
    //
    musicStateToggle() {
      const isOn = localStorage.getItem('GuangGame.music');
      if(isOn==='on')
        localStorage.setItem('GuangGame.music','off');
      else
        localStorage.setItem('GuangGame.music', 'on');
      this.$emit('music-state-change');
    },
    //
    //  효과음 설정 변경
    //
    effectStateToggle() {
      const isOn = localStorage.getItem('GuangGame.effect');
      if(isOn==='on')
        localStorage.setItem('GuangGame.effect','off')
      else
        localStorage.setItem('GuangGame.effect', 'on')
    },
    //
    // 배경음 설정 여부 확인  
    //
    isMusicOn() {
      const isOn = localStorage.getItem('GuangGame.music');
      if(isOn==='on')
        this.musicChecked = true;  
    },
    //
    //  효과음 설정 여부 확인
    //
    isEffectOn() {
      const isOn = localStorage.getItem('GuangGame.effect');
      if(isOn==='on')
        this.effectChecked = true;  
    },
    //
    //  토큰 변환
    //
    selectToken(token) {
      switch(token) {
        case 'tazchip':
          localStorage.setItem('GuangGame.curToken', 'tazchip');
          break;
        case 'taz':
          localStorage.setItem('GuangGame.curToken', 'taz');
          break;
        case 'eos':
          localStorage.setItem('GuangGame.curToken', 'eos');
          break;
        default :
          break;
      }
      this.$emit('token-changed');
    },
    //
    //  programmatic routing
    //
    routeTo(path) {
      this.$router.push(path);
      this.closeDrawer();
      this.$emit('from-sicbo-to-elsewhere');
    },
    //
    //  모달창 open
    //
    showModal(path) {
      if(path === 'referral' || path === 'bonus')
        this.$emit('show-modal', path)
    },

    /**
     * 로그아웃
     */
    logout() {
      this.$emit('logout');
    },

    /**
     * 로그인
     */
    login() {
      this.$emit('login');
    },

    /**
     * 밸런스 드롭다운 UI를 토글한다.
     */
    toggleBalanceDropdown($event) {
      this.balanceShow = !this.balanceShow;
      this.$eventBus.$emit('close-dropdonw','drawer-balance');
      $event.stopPropagation();
    },

    /**
     * 토큰 선택 드롭다운 UI를 토글한다.
     */
    toggleTokenDropdown($event) {
      this.tokenShow = !this.tokenShow;
      this.$eventBus.$emit('close-dropdonw','drawer-token');
      $event.stopPropagation();
    }
  },
  /**
   * 초기화
   */
  created(){
    this.isMusicOn();
    this.isEffectOn();

    this.$eventBus.$on('close-dropdonw', (except) => {
      if (except !== 'drawer-balance') {
        this.balanceShow = false;
      }
      if (except !== 'drawer-token') {
        this.tokenShow = false;
      }
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@/scss/flex.scss";
@import "@/scss/fonts.scss";
@import "@/scss/variable.scss";

a {
  text-decoration: none;
}

.layout {
  display: block;
  margin: 0px;
  padding: 0px;
}

.header-wrap {
  @extend .flex;
  justify-content: space-between;
  width: 268px;
  height: 32px;
  margin: 16px 16px 64px 16px;

  @media (min-width: 984px) {
    display: none !important;
  }
}

.close-btn {
  cursor: pointer;
}

.token-select-dropdown {
  position: relative;
  width: 140px;
  height: 32px;
}

.layout-token-selector {
  @extend .flex;
  @extend .flex-middle;
  position: absolute;
  z-index: 1;
  left: 0;
  margin: auto 0;
  background: #612D17;
  box-shadow: inset 0px 2px 6px rgba(0, 0, 0, 0.4);
  border-radius: 60px;
  width: 140px;
  height: 32px;
  cursor: pointer;
}

.selector-token-img {
  margin: 6px;
}

.selector-text {
  @extend .text-normal;
  color: white;
  flex-grow: 1;
  text-align: left;
  font-weight: 500
}

.selector-icon {
  margin-right: 11px;
}

.token-dropdown-content {
  position: absolute;
  z-index: 0;
  top: 16px;
  left: 0;
  width: 140px;
  height: 136px;
}

.token-select-row-0 {
  height: 16px;
  background: #563008;
}

.token-select-row {
  @extend .text-btn-small;
  @extend .flex;
  background: #563008;
  height: 40px;
  text-align: left;
  line-height: 40px;
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

  &:nth-child(4) {
    border-radius: 0px 0px 15px 15px;
  }
}

.token-select-row-img {
  width: 20px;
  height: 20px;
  margin: 10px 6px;
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

.content-wrap {
  width: 196px;
  margin: 0px auto;
  transition: all 0.5s;

  @media (min-width: 984px) {
    margin: 144px auto 0 !important;
  }
}

.main-btn {
  @extend .flex;
  @extend .flex-middle;
  @extend .flex-center;
  @extend .text-btn-big;
  cursor: pointer;
  height: 48px;
  background: linear-gradient(180deg, #DA241C 0%, #5B110D 100%);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 15px;
  margin-bottom: 16px;
  color: white;

  &:hover {
    color: #FFFF58
  }
}

.player-info-wrap {
  @extend .flex;
  @extend .flex-column;
  @extend .flex-middle;

  height: 128px;
  border: 1px solid #612D17;
  box-sizing: border-box;
  border-radius: 8px;
  margin-bottom: 16px;
}

.router-medal {
  margin-top: 8px;
  height: 32px;
  cursor: pointer;
}

.medal-img {
  width: 32px;
  height: 32px;
}

.player-id-text {
  @extend .text-normal;
  width: 196px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  color: #FFD8A1;
}

.balance-selector-wrap {
  position: relative;
  width: 172px;
  min-height: 25px;
}


.player-balance-wrap {
  position: absolute;
  width: 100%;
  z-index: 10;
  background: #612D17;
  box-shadow: inset 4px 4px 8px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  text-align: left;
  line-height: 24px;
  padding-left: 26px;
  padding-right: 20px;
  box-sizing: border-box;
  cursor: pointer;
}

.balance-token-img {
  position: absolute;
  top: 0;
  left: 0;
  margin: 4px;
  width: 16px;
  height: 16px;
}

.balance-text {
  @extend .text-normal;
  font-size: 13px;
  color: white;
  font-weight: 400;
}

.sort-btn {
  position: absolute;
  right: 7px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

.balance-dropdown-content {
  position: absolute;
  z-index: 0;
  top: 12px;
  left: 0;
  width: 172px;
  height: 136px;
}

.balance-select-row-0 {
  background: #563008;
  height: 16px;
}

.balance-select-row {
  @extend .text-btn-small;
  @extend .flex;
  background: #563008;
  height: 32px;
  text-align: left;
  line-height: 32px;
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

  &:nth-child(4) {
    border-radius: 0px 0px 15px 15px;
  }
}

.balance-select-row-img {
  width: 16px;
  height: 16px;
  margin: 8px 4px;
}

.wallet-btn {
  @extend .flex;
  @extend .flex-middle;
  @extend .flex-center;
  @extend .text-btn-small;
  color: #C3B1AB;
  font-weight: 400;
  width: 112px;
  height: 24px;
  margin: 8px 0;
  background: linear-gradient(180deg, #884529 0%, #612D17 100%);
  box-shadow: inset 0px 1px 0px 1px #945b43;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    color: #FFFFFF
  }
}


.sub-btn {
  @extend .flex;
  @extend .flex-middle;
  @extend .flex-center;
  @extend .text-btn-small;
  color: #C3B1AB;
  width: 196px;
  height: 36px;
  margin-bottom: 12px;
  background: linear-gradient(180deg, #884529 0%, #612D17 100%);
  box-shadow: inset 0px 1px 0px 1px #945b43;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    color: #FFFFFF
  }
}

.socialmedia-wrap {
  @extend .flex;
  justify-content: space-between;
  margin: 36px auto;
  width: 130px;
  height: 30px;
}

.setting-wrap {
  @extend .flex;
  justify-content: space-between;
  width: 196px;
  height: 20px;
  margin-bottom: 24px;
}

.setting-text {
  @extend .text-normal;
  color: #C3B1AB;
  font-weight: 500;
}

.switch {
  position: relative;
  width: 40px;
  height: 20px;
}

.switch>input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #612D17;
  box-shadow: inset 2px 2px 4px rgba(5, 5, 5, 0.2);
  border-radius: 23px;
  -webkit-transition: 0.5s;
  transition: 0.5s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  background-color: #472111;
  -webkit-transition: 0.5s;
  transition: 0.5s;
  border-radius: 50%;
}

input:checked+.slider:before {
  background: radial-gradient(20.00px at 50% 0%, #FFD8A1 0%, #8C5113 100%);
}

input:checked+.slider:before {
  transform: translateX(20px);
}
</style>

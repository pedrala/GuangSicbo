<template>
  <div id="appbar" ref="layout" :class="styleAppbar">
    <div :class="styleMenuBtn">
      <button class="btn-menu" @click="toggleDrawer"><img src="/img/ic-navi-drawer.svg" /></button>
    </div>
    <div class="layout-appbar">
        <img src="/img/logo.svg" class="logo" @click="routeTo('/')" />
      <div class="token-select-dropdown">
        <div class="layout-token-selector" v-if="isSicbo">
          <img src="/img/drawer/tazchip.svg" class="selector-token-img">
          <span class="selector-text">{{ tazbalance }}</span>
        </div>
        <div class="layout-token-selector-btn" @click="toggleTokenDropdown" v-else>
          <img :src="userbalanceToken" class="selector-token-img">
          <span class="selector-text">{{ userbalance }}</span>
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
      <language-selector :class="{'display-none': isSicbo}" v-if="!isSicboM" :isLangChanged="isLangChanged" @lang-change="$emit('lang-change', $event)"/>
      <div class="howto-btn" v-if="isSicbo" @click="showHowto"> {{$t('sicbo.info.howtoplay')}}</div> 
    </div>
    <div class="login">
      <button class="btn-login" v-if="!isLogin">
        <span class="flex flex-middle" @click="login"><img src="/img/ic-login.svg" /> Login</span>
      </button>
      <button class="btn-login" v-if="isLogin" @click="logout">
        <span class="flex flex-middle"><img src="/img/ic-logout.svg" />Logout</span>
      </button>
    </div>
  </div>
</template>

<script>
import LanguageSelector from './LanguageSelector.vue';
import { mapState, mapMutations, mapActions } from 'vuex';
import resize from 'vue-resize-directive'

export default {
  name: 'Appbar',
  data() {
    return {
      tokenShow: false,
      isSicbo: false,
      isSicboM: false
    }
  },
  components: {
    'language-selector': LanguageSelector
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
  computed: {
    ...mapState({
      tazchip : 'balance.tazchip',
      username(state) {
        if(this.isLogin)
         return state.common.acount.name;
      },
      //
      // 유저 토큰 값 출력 
      //
      userbalance (state) {
        if(this.isLogin) {
          const Changed = this.isTokenChanged;
          const curToken = localStorage.getItem('GuangGame.curToken') || 'tazchip';
          const regexp = /\B(?=(\d{3})+(?!\d))/g;
          switch (curToken || Changed) {
            case 'taz':
              return state.common.balance.taz.toFixed(0).toString().replace(regexp, ',');
            case 'tazchip':
              return state.common.balance.tazchip.toFixed(0).toString().replace(regexp, ',');
            case 'eos':
              return state.common.balance.eos.toFixed(1).toString().replace(regexp, ',');
            default :
              return 'error';
          }
        } else {
          return '-';
        }
      },
      tazbalance (state) {
        if(this.isLogin) {
          const regexp = /\B(?=(\d{3})+(?!\d))/g;
          return state.common.balance.tazchip.toFixed(0).toString().replace(regexp, ',');
        } else {
          return '-';
        }
      },
      isLogin (state) {
        return state.common.account.name !== undefined && state.common.account.name.length > 0;
      },
      styleAppbar(state) {
        if (state.common.appbarMode === 'pc') {
          return 'appbar-pc';
        }
        return 'appbar-mobile';
      },
      styleMenuBtn(state) {
        if (state.common.appbarMode === 'pc') {
          if (state.common.drawerMode === 'static') {
            return 'layout-btn-menu pc invisible'; 
          }
          return 'layout-btn-menu pc';
        }
        return 'layout-btn-menu';
      }
    }),
    //
    //  현재 선택된 토큰 이미지 출력  
    //
    userbalanceToken() {
      const isTokenChanged = this.isTokenChanged;
      const curToken = localStorage.getItem('GuangGame.curToken') || 'tazchip';
      switch (curToken||isTokenChanged) {
          case 'tazchip':
            return '/img/drawer/tazchip.svg';
          case 'taz':
            return '/img/drawer/taztoken.svg';
          case 'eos':
            return '/img/drawer/EOStoken.svg';
          default :
            return '/img/drawer/tazchip.svg'
        }
    },
  },
  watch: {
    '$route'() {
      this.isInGame();
    },
  },
  methods: {
    ...mapActions({
      toggleDrawer: 'toggleDrawer'
    }),
    ...mapMutations([
      'setAppbarMode',
      'setDrawerState',
      'setDrawerMode'
    ]),
    isSicboMobile(){
      if( window.innerWidth < 984 && this.$route.name === 'sicbo' ){
        this.isSicboM = true;
        return;
      }
      else  {
        this.isSicboM = false;
        return false;
      }
    },
    //
    // 게임화면인지 체크 
    //
    isInGame() {
      if(this.$route.name === 'sicbo')
        this.isSicbo = true;
      else
        this.isSicbo = false;
    },
    onResize() {
      if (this.$route.name === 'home') {
        if (this.$refs.layout.clientWidth > 1284) {
          this.setDrawerState('open');
          this.setDrawerMode('static');
        } else if (this.$refs.layout.clientWidth > 984) {
          this.setDrawerState('close');
          this.setDrawerMode('over-short');
        } else {
          this.setDrawerState('close');
          this.setDrawerMode('over-tall');
        }
      } else {
        if (this.$refs.layout.clientWidth > 984) {
          this.setDrawerState('close');
          this.setDrawerMode('over-short');
        } else {
          this.setDrawerState('close');
          this.setDrawerMode('over-tall');
        }
      }
    },
    login() {
      this.$emit('login');
    },
    logout() {
      this.$emit('logout');
    },
    //
    // 선택된 토큰을 브라우저에 저장 
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
    // programmatic routing  
    //
    routeTo(path) {
     if (this.$refs.layout.clientWidth > 1284) {
          this.setDrawerState('open');
          this.setDrawerMode('static');
      }
      this.$router.push(path);
    },
    showHowto() {
      this.$emit('show-modal', 'howto');
    },
    toggleTokenDropdown($event) {
      this.tokenShow = !this.tokenShow;
      this.$eventBus.$emit('close-dropdonw','appbar-token');
      $event.stopPropagation();
    }
  },
  created() {
    this.isInGame()
    window.addEventListener('resize', this.isSicboMobile);
    this.$eventBus.$on('close-dropdonw', (except) => {
      if (except !== 'appbar-lang') {
        this.langShow = false;
      }
      if (except !== 'appbar-token') {
        this.tokenShow = false;
      }
    });
  },
  /**
   * Destroy
   */
  destroyed() {
    window.removeEventListener('resize', this.isSicboMobile);

  },
  directives: {
    resize,
  }
}
</script>

<style lang="scss" scoped>
@import "../scss/flex.scss";
@import "../scss/fonts.scss";
@import "../scss/variable.scss";

@mixin flex() {
  display: flex;
}

#appbar {
  @extend .flex;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  z-index: 200;

  transition: all 1s;
  background: linear-gradient(180deg, #563008 0%, #2C1106 100%);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}

.appbar-pc {
  height: $appbar-height;
}

.appbar-mobile {
  height: $appbar-height-sm;
}

.layout-btn-menu {
  @extend .flex;
  height: 40px;
  width: 40px;
  background: transparent;
  margin: auto 0px auto 10px;

  &.pc {
    width: $nav-drawer-width;
    transition: all 1s;
    height: 100%;
    margin: 0px;

    @media (min-width: 938px) {
      width: 50px;
    }

    @media (min-width: 1284px) {
      width: 50px;
    }

    &.invisible {
      opacity: 0;
      visibility: hidden;
    }
  }
}

.btn-menu {
  height: 40px;
  width: 40px;
  background: transparent;
  border: none;
  outline: 0;
  margin: auto auto auto auto;
  cursor: pointer;

  @media (min-width: 984px) {
    margin: auto 14px;
  }

  @media (min-width: 1284px) {
    margin: auto auto auto auto;
  }
}

.layout-appbar {
  @extend .flex;
  @extend .flex-wfill;
  padding: 0px;
  margin: 0px;
  background: transparent;
  box-shadow: none;

  @media (min-width: $breakpoint) {
    // background: linear-gradient(180deg, #563008 0%, #2C1106 100%);
    // box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.25);
  }
}

.layout-appbar>a {
  display: block;
  margin-right: auto;
}

.logo {
  width: 120px;
  height: 28px;
  margin: 16px auto 16px 10px;
  cursor: pointer;
  @media (min-width: 938px) {
    margin: 18px auto 18px 14px;
  }

  @media (min-width: 1284px) {
    width: 164px;
    height: 38px;
    margin: 15px auto 15px 18px;
  }
}

.token-select-dropdown {
  position: relative;
  width: 140px;
  height: 32px;
  margin: auto 40px auto 0;
  display: none;

  @media (min-width: 984px) {
    display: block;
  }
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
}

.layout-token-selector-btn {
  @extend .layout-token-selector;
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
  display: none;
  position: absolute;
  z-index: 0;
  top: 16px;
  left: 0;
  width: 140px;
  height: 136px;

  @media (min-width: 984px) {
    display: block;
  }
}

.token-select-row-0 {
  height: 16px;
}

.token-select-row-0 {
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

.display-none {
  display: none !important;
  @media (min-width: 984px) {
    display: flex !important;
  }
}


.token-select-row-img {
  width: 20px;
  height: 20px;
  margin: 10px 6px;
}

.login {
  display: none !important;

  @media (min-width: 984px) {
    margin-right: 68px;
    display: -webkit-box !important;
    display: -ms-flexbox !important;
    display: flex !important;
    -webkit-box-pack: center !important;
    -ms-flex-pack: center !important;
    justify-content: center !important;
    -webkit-box-align: center !important;
    -ms-flex-align: center !important;
    align-items: center !important;
  }
}

.btn-login {
  background: transparent;
  border: none;
  outline: none;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  color: #FFD8A1;
  padding-left: 0px;
  padding-right: 0px;
  cursor: pointer;

  & img {
    width: 100%;
    margin: 8px;
  }
}

.howto-btn {
  width: 98px;
  height: 36px;
  background: linear-gradient(180deg, #884529 0%, #612D17 100%);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  line-height: 36px;
  text-align: center;
  box-sizing: border-box;
  border: 1px solid rgb(119, 74, 7);
  margin: auto 24px auto 6px; 
  cursor: pointer;

  @media (min-width: 984px) {
    margin: auto 40px auto 10px; 
  }

  &:hover {
    color: rgb(216, 216, 216);
  }
}



</style>

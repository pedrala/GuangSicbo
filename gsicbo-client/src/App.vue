<template>
  <div id="app" @click="onTouch">
    <audio id="music" loop @canplaythrough="playMusic" preload="auto">
      <source :src="musicSrc" preload="auto">
    </audio>

    <modal-bonus v-if="showBonus" @close-bonus="closeModal" />
    <modal-referral v-if="showReferral" @close-referral="closeModal" />
    <modal-howto v-if="showHowto" @close-howto="closeModal" />

    <g-appbar ref="test" @login="login" @logout="logout" @lang-change="changeLang($event)" :is-lang-changed="isLangChanged"
      @token-changed="setToken()" :is-token-changed="isTokenChanged" @show-modal="showModal" />
    <aside id="drawer" :class="classDrawer">
      <g-drawer @close-drawer="closeDrawer" @show-modal="showModal" @music-state-change="playMusic"
        @token-changed="setToken()" :is-token-changed="isTokenChanged" :is-lang-changed="isLangChanged"
        @lang-change="changeLang($event)" @from-sicbo-to-elsewhere="onResize()" @logout="logout" @login="login" />
    </aside>
    <div id="drawer-scrim" :class="classDrawerScrim" @click="closeDrawer"></div>

    <div id="contents" :class="classContents">
      <div :class="classPadding"></div>
      <transition name="fade" mode="out-in">
        <router-view :is-lang-changed="isLangChanged" />
      </transition>
    </div>

  </div>
</template>

<script>
import { flatMap } from 'rxjs/operators'
import { mapState, mapMutations } from 'vuex';
import Drawer from './components/Drawer.vue';
import Appbar from './components/Appbar.vue';
import Bonus from './components/Bonus.vue';
import Referral from './components/Referral.vue';
import Howto from './components/HowToModal.vue';
import { throwError } from 'rxjs';

const LANDING_STATIC = 1284;
const LANDING_MOBILE = 984;
const SICBO_MOBILE_WIDTH = 1024;
const SICBO_MOBILE_HEIGHT = 680;

export default {
  /**
   * Data
   */
  data() {
    return {
      initialized: false,
      musicSrc: '/music/music.mp3',
      isTokenChanged: false,
      isLangChanged: false,
      showBonus: false,
      showReferral: false,
      showHowto: false,
      isModal: false,
    }
  },
  /**
   * Computed
   */
  computed: mapState({
    isDrawer(state) {
      return state.common.drawerMode !== 'static' && state.common.drawerState === 'open';
    },
    /**
     * Contents 패딩 영역의 css class
     */
    classPadding(state) {
      if (state.common.drawerMode === 'static') return 'padding static';
      if (state.common.drawerState === 'open') {
        return 'padding-close';
      }
      return 'padding-close';
    },
    /**
     * Navigation drawer의 css class
     */
    classDrawer(state) {
      if (state.common.drawerMode === 'static') return 'static';

      if (state.common.drawerMode === 'overlap' && state.common.appbarMode === 'mobile') {
        if (state.common.drawerState === 'close') {
          if (!this.initialized) {
            this.initialized = true;
            return 'over-tall close-without-ani';
          }
          
          return 'over-tall close';
        } else if (state.common.drawerState === 'close-without-ani') {
          return 'over-tall close-without-ani';  
        }
        return 'over-tall open';
      }
      
      if (state.common.drawerState === 'close') {
        return 'over-short close';  
      } else if (state.common.drawerState === 'close-without-ani') {
        return 'over-short close-without-ani'; 
      }
      return 'over-short open';  
    },
    /**
     * Navigation drawer의 뒤에 깔리는 반투명 div의 css class
     */
    classDrawerScrim(state) {
      if (state.common.drawerMode === 'static') {
        document.body.style.overflow = '';
        return '';
      }

      if (state.common.drawerState === 'open') {
        document.body.style.overflow = 'hidden';
        return 'open';
      }

      document.body.style.overflow = '';
      return 'close';
    },
    /**
     * Contents 영역의 css class
     */
    classContents(state) {
      if (state.common.drawerMode === 'static') return `pc`;
      if (state.common.drawerState === 'open') {
        return `${state.common.appbarMode}`;  
      }
      return `${state.common.appbarMode}`;
    },
    /**
     * 
     */
    userName(state) {
      if (!state.common.account.name) {
        return ''
      }
      return state.common.account.name;
    }
  }),
  /**
   * Created
   */
  created() {
    if (this.$route.query.ref && this.$route.query.ref.length <= 12) {
      localStorage.setItem('GuangGame.Referral', this.$route.query.ref);
    }
    window.addEventListener('resize', this.onResize);
    this.showHowtoAtFirst(); //
  },
  /**
   * Destroy
   */
  destroyed() {
    window.removeEventListener('resize', this.onResize);
  },
  /**
   * Mounted
   */
  mounted () {
    this.onResize();
    this.login();
  },
  /**
   * Method
   */
  methods: {
    /**
     * vuex store
     */
    ...mapMutations([
      'setAppbarMode',
      'setDrawerState',
      'setDrawerMode',
      'setAccount',
      'setEosBalance',
      'setTazBalance',
      'setTazchipBalance',
      'setUserData'
    ]),
    /**
     * 브라우져 화면 크기에 변화가 생겼을 때 호출 되는 이벤트 콜백 함수
     */
    onResize() {
      if (this.$route.name === 'sicbo') {
        if (window.innerWidth < SICBO_MOBILE_WIDTH || window.innerHeight < SICBO_MOBILE_HEIGHT) {
          this.setAppbarMode('mobile');
        } else {
          this.setAppbarMode('pc');
        }
        this.setDrawerMode('overlap');
        this.setDrawerState('close');
        this.$eventBus.$emit('resize', {w: window.innerWidth, h: window.innerHeight});
      } else {
        if (window.innerWidth >= LANDING_STATIC) {
          this.setAppbarMode('pc');
          this.setDrawerMode('static');
          this.setDrawerState('open');
        } else if (window.innerWidth >= LANDING_MOBILE) {
          this.setAppbarMode('pc');
          this.setDrawerMode('overlap');
          this.setDrawerState('close');
        } else {
          this.setAppbarMode('mobile');
          this.setDrawerMode('overlap');
          this.setDrawerState('close');
        }
      }
    },
    /**
     * Navigation drawer을 닫는다.
     */
    closeDrawer() {
      this.setDrawerState('close');
    },
    changeLang(langToChange) {
      console.log(langToChange);
      if (this.$i18n.locale !== langToChange) {
        if (!this.$loadedLanguages[langToChange]) {
          return import(/* webpackChunkName: "lang-[request]" */ `@/languages/${langToChange}`).then(msgs => {
            this.$i18n.setLocaleMessage(langToChange, msgs.default)
            this.$loadedLanguages[langToChange] = msgs;
            this.$i18n.locale = langToChange;
            localStorage.setItem('GuangGame.Language', langToChange);
            this.isLangChanged = !this.isLangChanged;
          })
        }
        this.$i18n.locale = langToChange;
        localStorage.setItem('GuangGame.Language',langToChange)
        this.isLangChanged = !this.isLangChanged;
      }
    },
    /**
     * Login
     */
    login() {
      this.$chain.connect().pipe(
        flatMap(connected => {
          if (connected) {
            return this.$chain.login()
          }
          return throwError(new Error('No scatter'));
        })
      ).subscribe(
        account => {
          this.setAccount(account);

          this.$chain.getEosBalance(account.name).subscribe(
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

          this.$chain.getBalance('taztokenbase', account.name, 'TAZ').subscribe(
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

          this.$chain.getBalance('taztokenbase', account.name, 'TAZCHIP').subscribe(
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

          this.$eventBus.$emit('login');
          this.$ws.connectprivateChannel(account.name);
          this.fetchUserData(account.name);
        },
        error => {
          // user rejected the provision of an Identity
          // No scatter
          console.error(error.message);
        }
      )
    },
    /**
     * Logout
     */
    logout() {
      this.setAccount({});
      this.setEosBalance(0);
      this.setTazBalance(0);
      this.setTazchipBalance(0);
      this.$eventBus.$emit('logout');
      this.setUserData({
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
      });
    },
    //
    // 배경음 재생
    //
    playMusic() {
      const isOn = localStorage.getItem('GuangGame.music');
      const music = document.getElementById('music')
      if(isOn === 'on') {
        music.play();
      } else {
        music.pause();
      }
    },
    //
    // 다른 토큰이 선택됐는지 여부 확인
    //
    setToken() {
      this.isTokenChanged = !this.isTokenChanged;
    },
    //
    // 모달창 열림
    //
    showModal(target) {
      this.setDrawerState('close');
      this.isModal = true;
      if(target === 'bonus') {
        this.showBonus = true;
      } else if(target === 'referral') {
        this.showReferral = true;
      } else {
        this.showHowto = true;
      }
    },
    //
    // 모달창 닫음
    //
    closeModal() {
      this.isModal = false;
      this.showBonus = false;
      this.showReferral = false;
      this.showHowto = false;
    },
    /**
     * 서버로부터 사용자 정보를 조회한다.
     */   
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
    // 드롭박스 열려 있을 때, 영역 외 화면 클릭시 닫힘
    //
    onTouch() {
      this.$eventBus.$emit('close-dropdonw','');
    },
    //
    //  처음 접속한 유저에게 How To Play 모달 노출 
    //
    showHowtoAtFirst() {
      if(!localStorage.isNewComer) {
        this.isModal = true;
        this.showHowto = true;
      }
    }
  },
  watch: {
    isDrawer(val) {
      if (val) {
        this.isModal = true;
      } else if (!(this.showBonus | this.showReferral | this.showHowto)) {
        this.isModal = false;
      }
    },
    //
    // 모달창 노출 시, 모달창 뒤의 배경화면 고정 
    //
    isModal(val) {
      if(val) {
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.position = 'fixed';
        document.documentElement.style.height = '100vh';
        document.documentElement.style.width = '100vw';
      } else {
        document.documentElement.style.position = '';
        document.documentElement.style.overflow = 'auto';
        document.documentElement.style.height = '100%';
        document.documentElement.style.width = '100%';
      }
    }
  },
  /**
   * Components
   */
  components: {
    'g-drawer': Drawer,
    'g-appbar': Appbar,
    'modal-bonus': Bonus,
    'modal-referral': Referral,
    'modal-howto': Howto,
  }
}
</script>

<style lang="scss">
@import "./scss/flex.scss";
@import url('https://fonts.googleapis.com/css?family=Noto+Sans+KR:300,400,500,700|Noto+Sans+SC:400,500,700|Roboto:300,400,500,700&display=swap');

html,
body {
  font-family: 'Roboto', 'Noto Sans KR', 'Noto Sans SC', sans-serif;
  margin: 0px;
  padding: 0px;
  min-width: 360px;
  background: #0E1526;
  overflow:auto; 
}

#app {
  display: block;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  color: black;
}

</style>

<style lang="scss" scoped>
@import "./scss/flex.scss";
@import "./scss/variable.scss";

$drawer-width: 300px;

#drawer {
  position: fixed;
  top: 0px;
  left: 0px;
  min-width: $drawer-width;
  height: 100%;

  background: linear-gradient(180deg, #3C1708 0%, #130703 100%);

  transition-property: all;
  transition-duration: 1s;
  transition-timing-function: ease;

  &.over-tall {
    z-index: 300;
    overflow: auto;
    &.open {
      left: 0px;
    }

    &.close {
      left: $drawer-width * -1;
    }

    &.close-without-ani {
      transition-duration: 0s;
      left: $drawer-width * -1;
    }
  }

  &.over-short {
    z-index: 100;

    &.open {
      left: 0px;
    }

    &.close {
      left: $drawer-width * -1;
    }

    &.close-without-ani {
      transition-duration: 0s;
      left: $drawer-width * -1;
    }
  }

  &.static {
    position: absolute;
    z-index: 100;
    transition-duration: 1s;
  }
}

#drawer-scrim {
  position: fixed;
  background: rgba(0, 0, 0, 0.3);
  top: 0px;
  left: 0px;
  z-index: 90;
  height: 100%;
  min-height: 100vh;
  width: 0px;
  transition-duration: 0s;

  &.open {
    width: 100%;
    opacity: 1.0;
    transition-property: all;
    transition-duration: 1s;
    transition-timing-function: ease;
  }

  &.close {
    transition-property: all;
    transition-duration: 1s;
    transition-timing-function: ease;
    opacity: 0.0;
  }
}

audio {
  width: 300px;
  height: 300px;
  position: fixed;
  left: 0;
  bottom: 0
}

#contents {
  @extend .flex;
  position: absolute;
  left: 0px;
  top: 0px;
  z-index: 0;
  width: 100%;
  transition-property: all;
  transition-duration: 1s;
  transition-timing-function: ease;

  &.pc {
    padding-top: 68px;
  }

  &.mobile {
    padding-top: 60px;
  }

  .padding {
    min-width: 300px;
    transition-property: all;
    transition-duration: 0s;
    transition-timing-function: ease;

    &.static {
      transition-duration: 1s;
      background: #130703;
    }
  }

  .padding-close {
    min-width: 0px;
    transition-property: all;
    transition-timing-function: ease;
  }

  .fade-enter-active {
    transition: opacity 0.4s;
  }

  .fade-enter {
    opacity: 0;
  }
}

</style>

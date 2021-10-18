import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const common = {
  state: {
    drawerMode: 'over-short', // static | over-tall | over-short
    drawerState: 'open',     // open | close | close-without-ani
    appbarMode: 'pc',        // pc | mobile
    account: {},             // Scatter에 로그인된 계정 정보
    balance: {               // 각 토큰별 잔고
      eos: 0,
      taz: 0,
      tazchip: 0
    },
    userData: {               // Offchaion 서버에서 수신한 사용자 정보
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
  },
  mutations: {
    setDrawerMode(state, val) {
      state.drawerMode = val;
    },
    setDrawerState(state, val) {
      state.drawerState = val;
    },
    setAppbarMode(state, val) {
      state.appbarMode = val;
    },
    setAccount(state, account) {
      state.account = account;
    },
    setEosBalance(state, balance) {
      state.balance.eos = balance;
    },
    setTazBalance(state, balance) {
      state.balance.taz = balance;
    },
    setTazchipBalance(state, balance) {
      state.balance.tazchip = balance;
    },
    setUserData(state, userData) {
      state.userData = userData;
    }
  },
  actions: {
    toggleDrawer({ commit, state }) {
      if (state.drawerMode === 'static') {
        commit('setDrawerState', 'open');
      } else {
        if (state.drawerState === 'open') {
          commit('setDrawerState', 'close');
        } else {
          commit('setDrawerState', 'open');
        }
      }
    },
    closeDrawer({ commit, state }, useAnimation) {
      if (state.drawerState === 'open') {
        if (useAnimation) {
          commit('setDrawerState', 'close');
        } else {
          commit('setDrawerState', 'close-without-ani');
        }
      }
    }
  }
}

const sicbo = {
  state: {
    ui: 'pc'
  },
  mutations: {
    setMode(state, val) {
      state.ui = val;
    }
  },
  actions: {

  }
}

export default new Vuex.Store({
  modules: {
    common,
    sicbo
  }
})

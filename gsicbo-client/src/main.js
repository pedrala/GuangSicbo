import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { API_SERVER } from './js/endpoint.js';
import VueI18n from 'vue-i18n';
import VueAgile from 'vue-agile'
Vue.use(VueAgile)

import VueOverflowScroll from 'vue-overflow-scroll';
Vue.use(VueOverflowScroll);

Vue.config.productionTip = false;

// Event bus
Vue.prototype.$eventBus = new Vue();

/*
 * Initialize blockchain module
 */
import Blockchain from './js/chain';
Vue.prototype.$chain = new Blockchain();

import WebSocket from './js/socket';
const ws = new WebSocket()
Vue.prototype.$ws = ws

// REST API 서버 주소
Vue.prototype.$REST_API_SERVER = API_SERVER;

// 다국어 지원을 위한 VueI18n 초기화, 빠른 초기 기동을 위해 lazzy loading으로 구현
Vue.use(VueI18n);
const defalutLang = localStorage.getItem('GuangGame.Language') || 'en';
import( /* webpackChunkName: "lang-[request]" */ `@/languages/${defalutLang}`).then(msgs => {
  const messages = {};
  messages[defalutLang] = msgs.default;

  Vue.prototype.$loadedLanguages = [defalutLang];
  const i18n = new VueI18n({
    locale: defalutLang,
    messages
  });

  new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
  }).$mount('#app');
})

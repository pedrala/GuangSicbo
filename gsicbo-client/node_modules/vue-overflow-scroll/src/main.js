import Vue from 'vue'
import App from './App.vue'
import vueOverFlowScroll from './lib/index'
Vue.use(vueOverFlowScroll)

new Vue({
  el: '#app',
  render: h => h(App)
})

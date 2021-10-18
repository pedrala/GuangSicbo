import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/store',
      name: 'store',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/Store.vue')
    },
    {
      path: '/sicbo',
      name: 'sicbo',
      component: () => import('./views/Sicbo.vue')
    },
    {
      path: '/wallet',
      name: 'wallet',
      component: () => import('./views/Wallet.vue')
    },
    {
      path: '/vip',
      name: 'vip',
      component: () => import('./views/VIP.vue')
    },
  ]
})

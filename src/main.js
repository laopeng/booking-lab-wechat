// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import VueRouter from 'vue-router'
import App from './App'
import axios from 'axios'
import { ToastPlugin, LoadingPlugin, ConfirmPlugin, AlertPlugin } from 'vux'

// Vue.prototype.$baseUrl = 'http://127.0.0.1:8080'
Vue.prototype.$baseUrl = 'http://hlmr.ltd'
// Vue.prototype.$baseUrl = ''
Vue.prototype.$axios = axios
Vue.use(VueRouter)

Vue.use(ToastPlugin)
Vue.use(LoadingPlugin)
Vue.use(ConfirmPlugin)
Vue.use(AlertPlugin)

const routes = [{
  path: '/',
  component: resolve => require(['./components/Index'], resolve)
}, {
  path: '/lab',
  component: resolve => require(['./components/Lab'], resolve),
  meta: {requiresAuth: true}
}, {
  path: '/register',
  component: resolve => require(['./components/Register'], resolve)
}
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {  // 判断该路由是否需要登录权限
    if (sessionStorage.getItem('token')) {  // 获取当前的token是否存在
      next()
    } else {
      next({
        path: '/',
        query: {openid: sessionStorage.getItem('openid')}
      })
    }
  } else {
    if (to.matched.length === 0) { // 如果找不到此路由，则不跳转。

    } else {
      next()
    }
  }
})

FastClick.attach(document.body)

Vue.config.productionTip = false

// 发起网络请求拦截器
axios.interceptors.request.use(config => {
  Vue.$vux.loading.show({
    text: 'loading'
  })
  const token = sessionStorage.getItem('token')
  if (token) {  // 判断是否存在token，如果存在的话，则每个http header都加上token
    config.headers.Authorization = 'Bearer ' + token
  }
  config.headers.Accept = 'application/json'
  return config
}, error => {
  Vue.$vux.loading.hide()
  return Promise.reject(error)
})

// 网络请求返回结果拦截器
axios.interceptors.response.use(response => {
  Vue.$vux.loading.hide()
  return response
}, error => {
  Vue.$vux.loading.hide()
  if (error.response) {
    switch (error.response.status) {
      case 401:
        // 返回 401 清除token信息并跳转到登录页面
        sessionStorage.removeItem('token')
        router.replace({
          path: '/?openid=' + sessionStorage.getItem('openid'),
          query: {redirect: router.currentRoute.fullPath}
        })
        break
      case 403:
        console.debug(error.response)
        console.debug('无操作权限')
        break
      case 500:
        Vue.$vux.toast.text(error.response.data)
    }
  } else {
    console.debug('网络连接失败，请检查', error)
  }
  return Promise.reject(error)
})

Vue.prototype.getUrlKey = function (name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || ['', ''])[1].replace(/\+/g, '%20')) || null
}

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')

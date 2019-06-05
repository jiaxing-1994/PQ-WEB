// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import { http } from './util'
import utils from './util/utils'
// import toast from './pubilc/toast'
// import loading from './pubilc/loading'
import PT from './pubilc/index'
Vue.use(PT);
Vue.config.productionTip = false
Vue.prototype.$http = http;
Vue.prototype.$utils = utils;
/* eslint-disable no-new */
window.vue = new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

Vue.prototype.$utils.initContext(vue)

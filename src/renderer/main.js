import Vue from 'vue'
import axios from 'axios'
import lodash from 'lodash' // eslint-disable-line no-unused-vars
import pako from 'pako' // eslint-disable-line no-unused-vars

import Stacktrace from 'stack-trace'

import App from './App'
import router from './router'
import store from './store'

import VueSplit from 'vue-split-panel'

import BootstrapVue from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import tippy from 'tippy.js/dist/tippy.js' // eslint-disable-line no-unused-vars

import VueTippy from 'vue-tippy'

import {TweenLite} from 'gsap/TweenMax' // eslint-disable-line no-unused-vars

eYo.App.Stacktrace = Stacktrace

eYo.App.bus = new Vue()

Vue.prototype.$$ = {
  goog,
  eYo: eYo,
  Blockly: Blockly,
  pako: pako,
  bus: eYo.App.bus
}

Vue.prototype.TweenLite = TweenLite

Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(VueSplit)
Vue.use(VueTippy, eYo.Tooltip.options)

if (!process.env.IS_WEB) {
  Vue.prototype.electron = require('electron')
  Vue.use(require('vue-electron'))
}

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

console.log('Launching brython')
brython()

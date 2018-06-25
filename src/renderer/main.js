import Vue from 'vue'
import axios from 'axios'
import lodash from 'lodash'

import App from './App'
import router from './router'
import store from './store'

import VueSplit from 'vue-split-panel'

import BootstrapVue from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import 'tippy.js/dist/tippy.js'

import VueTippy from 'vue-tippy'

Vue.use(BootstrapVue)
Vue.use(VueSplit)
Vue.use(VueTippy, eYo.Tooltip.options)

if (!process.env.IS_WEB) {
  Vue.prototype.electron = require('electron')
  Vue.use(require('vue-electron'))
}

Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.prototype.pako = require('pako')

eYo.App.bus = new Vue()
Vue.prototype.eYo = eYo
Vue.prototype.Blockly = Blockly
Vue.prototype.goog = goog
Vue.prototype.$$_ = lodash

console.log('XRegExp', XRegExp)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

console.log('Launching brython')
brython()

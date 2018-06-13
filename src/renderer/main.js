import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import VueSplit from 'vue-split-panel'
import DrawerLayout from 'vue-drawer-layout'

import BootstrapVue from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.use(VueSplit)
Vue.use(DrawerLayout)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

eYo.App.bus = new Vue()
Vue.prototype.eYo = eYo
Vue.prototype.Blockly = Blockly
Vue.prototype.goog = goog

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

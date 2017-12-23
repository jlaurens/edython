import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

// using ES6 modules
import VueSplit from 'vue-split-panel'

Vue.use(VueSplit)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
alert('MAIN')
if (!window.ezP) {
  alert('ERROR: ezP is not properly installed, nothing will work as expected.')
  window.ezP = {}
}
alert(ezP.DelegateSvg)
alert(ezP.Delegate)
window.ezP.Vue = {
  getBus: function () {
    return this.bus_ || (this.bus_ = new Vue())
  }
}
if (!window.Blockly) {
  alert('ERROR: Blockly is not properly installed, nothing will work as expected.')
}
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

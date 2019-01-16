import Vue from 'vue'
import App from '../../App'
import router from '../../router'
import store from '../../store'
import eYoI18n from '../../lang'

/* eslint-disable no-new */
Object.defineProperties(eYo.$$, {
  app: {
    value: new Vue({
      components: { App },
      router,
      store,
      template: '<App/>',
      i18n: eYoI18n.i18n
    })
  },
  store: store
})

export const app = eYo.$$.app

app.$mount('#app')

import Vue from 'vue'
import store from '../../store'

import VueSplit from 'vue-split-panel'
import BootstrapVue from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import VueTippy from 'vue-tippy'

import eYoPlugin from '../../plugin/eyoplugin'
import eYoApp from '../../plugin/eyoapp'
import eYoAppDocument from '../../plugin/eyoappdocument'
import eYoDebug from '../../plugin/eyodebug'
import eYoI18n from '../../lang'

eYo.$$.bus = new Vue()
Vue.prototype.$$ = eYo.$$

Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(VueSplit)
Vue.use(VueTippy, eYo.Tooltip.options)
Vue.use(eYoPlugin)
Vue.use(eYoApp, {store})
Vue.use(eYoAppDocument, {store})
Vue.use(eYoDebug)
Vue.use(eYoI18n)

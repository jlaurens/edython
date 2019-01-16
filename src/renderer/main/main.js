import 'babel-polyfill'
import Vue from 'vue'
import axios from 'axios'
import lodash from 'lodash'
import pako from 'pako'

import Stacktrace from 'stack-trace'

import App from '../App'
import router from '../router'

import store from '../store'

import VueSplit from 'vue-split-panel'

import BootstrapVue from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import tippy from 'tippy.js/dist/tippy.js'

import VueTippy from 'vue-tippy'

import {TweenLite} from 'gsap/TweenMax'

import eYoPlugin from '../plugin/eyoplugin'
import eYoApp from '../plugin/eyoapp'
import eYoDocument from '../plugin/eyodocument'
import eYoDebug from '../plugin/eyodebug'
import eYoI18n from '../lang'

// Bug fix until electron 4 and chrome ...

/**
 * For some reason, the string given by `element.style.transform` seems localized
 * in the sense that floats may use commas instead of dots. See https://github.com/electron/electron/issues/6158
 */

var original_parseFloat = parseFloat
// eslint-disable-next-line no-global-assign
parseFloat = (x) => {
  return original_parseFloat(goog.isDefAndNotNull(x) && x.replace
    ? x.replace(',', '.')
    : x)
}

// eslint-disable-next-line no-useless-escape
goog.style.MATRIX_TRANSLATION_REGEX_ = /matrix\([0-9\.,-]+, [0-9\.,\-]+, [0-9\.,\-]+, [0-9\.,\-]+, ([0-9\.,\-]+)p?x?, ([0-9\.,\-]+)p?x?\)/
/**
 * Static regex to pull the x,y values out of an SVG translate() directive.
 * Note that Firefox and IE (9,10) return 'translate(12)' instead of
 * 'translate(12, 0)'.
 * Note that IE (9,10) returns 'translate(16 8)' instead of 'translate(16, 8)'.
 * Note that IE has been reported to return scientific notation (0.123456e-42).
 * @type {!RegExp}
 * @private
 */
Blockly.utils.getRelativeXY.XY_REGEX_ =
/translate\(\s*([-+\d.,e]+)([ ,]\s*([-+\d.,e]+)\s*\))/

/**
 * Static regex to pull the scale values out of a transform style property.
 * Accounts for same exceptions as XY_REGEXP_.
 * @type {!RegExp}
 * @private
 */
Blockly.utils.getScale_REGEXP_ = /scale\(\s*([-+\d.,e]+)\s*\)/

/**
 * Static regex to pull the x,y,z values out of a translate3d() style property.
 * Accounts for same exceptions as XY_REGEXP_.
 * @type {!RegExp}
 * @private
 */
Blockly.utils.getRelativeXY.XY_3D_REGEX_ =
  /transform:\s*translate3d\(\s*([-+\d.,e]+)px([ ,]\s*([-+\d.,e]+)\s*)px([ ,]\s*([-+\d.,e]+)\s*)px\)?/

/**
 * Static regex to pull the x,y,z values out of a translate3d() style property.
 * Accounts for same exceptions as XY_REGEXP_.
 * @type {!RegExp}
 * @private
 */
Blockly.utils.getRelativeXY.XY_2D_REGEX_ =
  /transform:\s*translate\(\s*([-+\d.,e]+)px([ ,]\s*([-+\d.,e]+)\s*)px\)?/

eYo.$$ = Vue.prototype.$$ = {
  goog,
  eYo,
  Blockly,
  pako,
  _: lodash,
  TweenLite,
  process,
  tippy,
  http: axios,
  Stacktrace,
  bus: new Vue()
}

Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(VueSplit)
Vue.use(VueTippy, eYo.Tooltip.options)

Vue.use(eYoPlugin)
Vue.use(eYoApp, {store})
Vue.use(eYoDocument, {store})
Vue.use(eYoDebug)
Vue.use(eYoI18n)

if (eYo.App.env !== 'web') {
  Vue.use(require('vue-electron'))
}

// i18n

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

console.log('Launching brython')
brython()

/* eslint-disable */


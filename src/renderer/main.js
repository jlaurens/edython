import 'babel-polyfill'
import Vue from 'vue'
import axios from 'axios'
import lodash from 'lodash'
import pako from 'pako'

import Stacktrace from 'stack-trace'

import App from './App'
import router from './router'

import store from './store'

import VueSplit from 'vue-split-panel'

import BootstrapVue from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import tippy from 'tippy.js/dist/tippy.js'

import VueTippy from 'vue-tippy'

import {TweenLite} from 'gsap/TweenMax'

import eYoPlugin from './plugin/eyoplugin'
import eYoApp from './plugin/eyoapp'
import eYoDocument from './plugin/eyodocument'
import eYoDebug from './plugin/eyodebug'
import eYoI18n from './lang/eyoi18n'

// Bug fix

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

if (process.env.BABEL_ENV !== 'web') {
  eYo.$$.electron = require('electron')
  Vue.use(require('vue-electron'))
}

// listen to connections
eYo.Delegate.prototype.didConnect = (function () {
  // this is a closure
  var didConnect = eYo.Delegate.prototype.didConnect
  return function (connection, oldTargetC8n, targetOldC8n) {
    didConnect.call(this, connection, oldTargetC8n, targetOldC8n)
    Vue.nextTick(() => {
      eYo.$$.bus.$emit('didConnect')
    })
  }
})()

// listen to connections
eYo.Delegate.prototype.didDisconnect = (function () {
  // this is a closure
  var didDisconnect = eYo.Delegate.prototype.didDisconnect
  return function (connection, oldTargetC8n, targetOldC8n) {
    didDisconnect.call(this, connection, oldTargetC8n)
    Vue.nextTick(() => {
      eYo.$$.bus.$emit('didDisconnect')
    })
  }
})()

var ipcRenderer = require('electron').ipcRenderer
if (ipcRenderer) {
  // we *are* in electron
  ipcRenderer.on('new', eYo.App.Document.doNew)
  ipcRenderer.on('open', eYo.App.Document.doOpen)
  ipcRenderer.on('save', eYo.App.Document.doSave)
  ipcRenderer.on('saveas', eYo.App.Document.doSaveAs)
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
// export const app = new Vue({
//   components: { App },
//   router,
//   store,
//   template: '<App/>',
//   i18n
// })

export const app = eYo.$$.app

// /**
//  * Will be overriden by components.
//  * @param{!Object} eyo
//  */
// Vue.prototype.$$doSynchronize = function (eyo) {
//   // do nothing
// }

app.$mount('#app')

console.log('Launching brython')
brython()

/* eslint-disable */

/**
 * Compute width of flyout.  Position mat under each block.
 * For RTL: Lay out the blocks and buttons to be right-aligned.
 * @private
 */
Blockly.VerticalFlyout.prototype.reflowInternal_ = function() {
  this.workspace_.scale = this.targetWorkspace_.scale;
  var flyoutWidth = 0;
  var blocks = this.workspace_.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    var width = block.getHeightWidth().width;
    if (block.outputConnection) {
      width -= Blockly.BlockSvg.TAB_WIDTH;
    }
    flyoutWidth = Math.max(flyoutWidth, width);
  }
  for (var i = 0, button; button = this.buttons_[i]; i++) {
    flyoutWidth = Math.max(flyoutWidth, button.width);
  }
  flyoutWidth += this.MARGIN * 1.5 + Blockly.BlockSvg.TAB_WIDTH;
  flyoutWidth *= this.workspace_.scale;
  flyoutWidth += Blockly.Scrollbar.scrollbarThickness;

  if (this.width_ != flyoutWidth) {
    for (var i = 0, block; block = blocks[i]; i++) {
      if (this.RTL) {
        // With the flyoutWidth known, right-align the blocks.
        var oldX = block.getRelativeToSurfaceXY().x;
        var newX = flyoutWidth / this.workspace_.scale - this.MARGIN -
            Blockly.BlockSvg.TAB_WIDTH;
        block.moveBy(newX - oldX, 0);
      }
      if (block.flyoutRect_) {
        this.moveRectToBlock_(block.flyoutRect_, block);
      }
    }
    if (this.RTL) {
      // With the flyoutWidth known, right-align the buttons.
      for (var i = 0, button; button = this.buttons_[i]; i++) {
        var y = button.getPosition().y;
        var x = flyoutWidth / this.workspace_.scale - button.width - this.MARGIN -
            Blockly.BlockSvg.TAB_WIDTH;
        button.moveTo(x, y);
      }
    }
    // Record the width for .getMetrics_ and .position.
    this.width_ = Math.max(flyoutWidth, 280);
    // Call this since it is possible the trash and zoom buttons need
    // to move. e.g. on a bottom positioned flyout when zoom is clicked.
    this.targetWorkspace_.resize();
  }
};

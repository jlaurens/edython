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

import blank from '@static/template/blank.xml'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import tippy from 'tippy.js/dist/tippy.js' // eslint-disable-line no-unused-vars

import VueTippy from 'vue-tippy'

import {TweenLite} from 'gsap/TweenMax' // eslint-disable-line no-unused-vars

import VueI18n from 'vue-i18n'
import msg_fr_FR from './lang/fr_FR'

var FileSaver = require('file-saver')

eYo.App.Stacktrace = Stacktrace

var controller = {
  goog,
  eYo: eYo,
  Blockly: Blockly,
  pako: pako,
  bus: new Vue(),
  TweenLite: TweenLite,
  process: process
}

Vue.prototype.$$ = controller

Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(VueSplit)
Vue.use(VueTippy, eYo.Tooltip.options)
Vue.use(VueI18n)

if (process.env.BABEL_ENV !== 'web') {
  Vue.prototype.$$.electron = require('electron')
  Vue.use(require('vue-electron'))
}

eYo.App.doDomToPref = function (dom) {
  var children = dom.childNodes
  var i = 0
  while (i < children.length) {
    var child = children[i++]
    var name = child.nodeName.toLowerCase()
    if (name === eYo.Xml.EDYTHON) {
      // find the 'prefs' child
      children = child.childNodes
      i = 0
      while (i < children.length) {
        child = children[i++]
        if (child.tagName && child.tagName.toLowerCase() === 'prefs') {
          // find the 'text' child
          var str = child.textContent
          if (str) {
            var prefs = JSON.parse(str)
            if (prefs) {
              try {
                if (prefs.selectedPanel) {
                  store.commit('UI_SET_SELECTED_PANEL', prefs.selectedPanel)
                }
                if (goog.isString(prefs.flyoutCategory)) {
                  store.commit('UI_SET_FLYOUT_CATEGORY', prefs.flyoutCategory)
                }
                if (goog.isString(prefs.flyoutModule)) {
                  store.commit('UI_SET_FLYOUT_MODULE', prefs.flyoutModule)
                }
                // close at last because it is an animation
                if (goog.isDef(prefs.flyoutClosed)) {
                  Vue.nextTick(function () {
                    store.commit('UI_SET_FLYOUT_CLOSED', prefs.flyoutClosed)
                  })
                }
              } catch (err) {
                console.error(err)
              }
              return
            }
          }
        }
      }
    }
  }
}

eYo.App.Document = process.env.BABEL_ENV === 'web' ? {
  doSave: function (ev) {
    eYo.App.Document.doSaveAs(ev)
  },
  doSaveAs: function (ev) {
    var documentPath = store.state.Document.path
    var basename = documentPath && documentPath.lastIndexOf
      ? documentPath.substr(documentPath.lastIndexOf('/') + 1)
      : 'Sans titre'
    if (!basename.endsWith('.eyo')) {
      basename = basename + '.eyo'
    }
    let deflate = eYo.App.Document.getDeflate()
    var file = new File([deflate], basename, {type: 'application/octet-stream'})
    FileSaver.saveAs(file)
  },
  doOpen: function (ev) {
    controller.bus.$emit('webUploadStart', ev)
  }
} : {
  readFile: function (fileName) {
    require('fs').readFile(fileName, (err, content) => {
      if (err) {
        alert('An error ocurred reading the file ' + err.message)
        return
      }
      eYo.App.Document.readDeflate(content, fileName)
    })
  },
  getDocumentPath: function () {
    // const {dialog} = require('electron').remote
    const remote = require('electron').remote
    const app = remote.app
    let documentsFolder = app.getPath('documents')
    var defaultPath = require('path').join(documentsFolder, 'Edython')
    var fs = require('fs')
    if (!fs.existsSync(defaultPath)) {
      fs.mkdirSync(defaultPath)
    }
    return defaultPath
  },
  doOpen: function (ev) {
    var defaultPath = eYo.App.Document.getDocumentPath()
    require('electron').remote.dialog.showOpenDialog({
      defaultPath: defaultPath,
      filters: [{
        name: 'Edython', extensions: ['eyo']
      }],
      properties: [
        'openFile'
      ]
    }, (fileNames) => {
      var fileName = fileNames[0]
      if (fileName === undefined) {
        console.log('Opération annulée')
        return
      }
      eYo.App.Document.readFile(fileName)
    })
  },
  doWriteContent: function (deflate) {
    var path = require('path')
    var defaultPath = path.join(eYo.App.Document.getDocumentPath(), 'Sans titre.eyo')
    const {dialog} = require('electron').remote
    dialog.showSaveDialog({
      defaultPath: defaultPath,
      filters: [{
        name: 'Edython', extensions: ['eyo']
      }]
    }, function (filePath) {
      if (filePath === undefined) {
        console.log('Opération annulée')
        return
      }
      var dirname = path.dirname(filePath)
      var fs = require('fs')
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname)
      }
      store.commit('DOC_SET_PATH', filePath)
      eYo.App.Document.writeContentToFile(filePath, deflate)
    })
  },
  writeContentToFile: function (path, deflate) {
    require('fs').writeFile(path, deflate, function (err) {
      if (err) {
        alert('An error ocurred creating the file ' + err.message)
      } else {
        store.commit('UI_STAGE_UNDO')
        controller.bus.$emit('saveDidSucceed')
      }
    })
  },
  doSave: function (ev) {
    let deflate = eYo.App.Document.getDeflate()
    var documentPath = store.state.Document.path
    if (documentPath) {
      eYo.App.Document.writeContentToFile(documentPath, deflate)
    } else {
      eYo.App.Document.doWriteContent(deflate)
    }
  },
  doSaveAs: function (ev) {
    let deflate = eYo.App.Document.getDeflate()
    eYo.App.Document.doWriteContent(deflate)
  }
}

eYo.App.Document.doNew = function (ev) {
  eYo.App.Document.doClear()
  eYo.App.Document.readString(blank)
}

eYo.App.Document.getDeflate = function () {
  var dom = eYo.App.workspace.eyo.toDom(true)
  var prefs = {}
  var value = store.state.UI.selectedPanel
  if (value) {
    prefs.selectedPanel = value
  }
  prefs.flyoutClosed = store.state.UI.flyoutClosed
  value = store.state.UI.flyoutCategory
  if (value) {
    prefs.flyoutCategory = value
  }
  value = store.state.UI.flyoutModule
  if (value) {
    prefs.flyoutModule = value
  }
  var str = JSON.stringify(prefs)
  dom.insertBefore(goog.dom.createDom('prefs', null,
    goog.dom.createTextNode(str)
  ), dom.firstChild)
  let oSerializer = new XMLSerializer()
  var content = '<?xml version="1.0" encoding="utf-8"?>' + oSerializer.serializeToString(dom)
  let deflate = store.state.Document.ecoSave ? pako.gzip(content) : content // use gzip to ungzip from the CLI
  return deflate
}

eYo.App.Document.doClear = function () {
  controller.bus.$emit('new-document')
  eYo.App.workspace.clearUndo()
  store.commit('UI_STAGE_UNDO')
  store.commit('DOC_SET_ECO_SAVE', store.state.Config.ecoSave)
  store.commit('DOC_SET_PATH', undefined)
}

eYo.App.Document.readString = function (str) {
  var parser = new DOMParser()
  var dom = parser.parseFromString(str, 'application/xml')
  eYo.App.workspace.eyo.fromDom(dom)
  eYo.App.workspace.clearUndo()
  eYo.App.doDomToPref(dom)
}

eYo.App.Document.readDeflate = function (deflate, fileName) {
  var inflate
  var ecoSave
  try {
    // is it compressed ?
    inflate = pako.ungzip(deflate) // one can also ungzip from the CLI
    ecoSave = true
  } catch (err) {
    // I guess not
    inflate = deflate
    ecoSave = false
  }
  try {
    eYo.App.Document.doClear()
    store.commit('DOC_SET_ECO_SAVE', ecoSave)
    var str = goog.crypt.utf8ByteArrayToString(inflate)
    eYo.App.Document.readString(str)
    store.commit('DOC_SET_PATH', fileName)
  } catch (err) {
    console.error('ERROR:', err)
  }
}

eYo.App.didClearUndo = function () {
  // console.log('didClearUndo')
  store.commit('UI_SET_UNDO_COUNT', 0)
  store.commit('UI_SET_REDO_COUNT', 0)
  if (store.state.UI.undoStage > 0) {
    // the last saved state won't ever be reached
    store.commit('UI_SET_UNDO_STAGE', -1)
  }
}
eYo.App.didProcessUndo = function () {
  // console.log('didProcessUndo')
  store.commit('UI_SET_UNDO_COUNT', eYo.App.workspace.undoStack_.length)
  store.commit('UI_SET_REDO_COUNT', eYo.App.workspace.redoStack_.length)
}
eYo.App.didUnshiftUndo = function () {
  store.commit('UI_SET_UNDO_STAGE', store.state.UI.undoStage - 1) // negative values make sense
}
eYo.App.didPushUndo = function () {
  // console.log('didPushUndo')
  var count = eYo.App.workspace.undoStack_.length
  store.commit('UI_SET_UNDO_COUNT', count)
  if (store.state.UI.undoStage >= count) {
    // the last saved state won't ever be reached
    store.commit('UI_SET_UNDO_STAGE', -1)
  }
}
// eYo.App.didTouchBlock = function (block) {
//   console.log('didTouchBlock', block)
//   // store.commit('UI_SET_SELECTED_BLOCK', block) once broke everything when uncommented
// }
eYo.App.didAddSelect = function (block) {
  setTimeout(function () {
    store.commit('UI_SET_SELECTED_BLOCK', Blockly.selected)
  }, 1)
}
eYo.App.didRemoveSelect = function (block) {
  setTimeout(function () {
    store.commit('UI_SET_SELECTED_BLOCK', Blockly.selected)
  }, 1)
}

eYo.App.didCopyBlock = function (block, xml) {
  store.commit('UI_DID_COPY_BLOCK', {block: block, xml: xml})
}

controller.bus.$on('webUploadDidStart', function (file) {
  eYo.App.Document.fileName_ = file
  console.log(file)
})

controller.bus.$on('webUploadEnd', function (result) {
  var content = new Uint8Array(result)
  eYo.App.Document.readDeflate(content, eYo.App.Document.fileName_)
  eYo.App.Document.fileName_ = undefined
})

var ipcRenderer = require('electron').ipcRenderer
if (ipcRenderer) {
  // we *are* in electron
  ipcRenderer.on('new', eYo.App.Document.doNew)
  ipcRenderer.on('open', eYo.App.Document.doOpen)
  ipcRenderer.on('save', eYo.App.Document.doSave)
  ipcRenderer.on('saveas', eYo.App.Document.doSaveAs)
}

// i18n

const messages = {
  en_US: {
    message: {
      hello: 'hello world'
    }
  },
  fr_FR: {
    message: msg_fr_FR
  }
}

const dateTimeFormats = {
  'en_US': {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }
  },
  'fr_FR': {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric'
    }
  }
}

const numberFormats = {
  'en_US': {
    currency: {
      style: 'currency', currency: 'USD'
    },
    percent: {
      style: 'percent'
    }
  },
  'fr_FR': {
    currency: {
      style: 'currency', currency: 'EUR'
    },
    percent: {
      style: 'percent'
    }
  }
}

const i18n = new VueI18n({
  locale: 'fr_FR', // set locale
  messages, // set locale messages,
  dateTimeFormats,
  numberFormats
})

/* eslint-disable no-new */
export const app = new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
  i18n
})

window['vue'] = app
window.store = store

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

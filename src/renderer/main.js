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

import blank from '@static/template/blank.xml'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import tippy from 'tippy.js/dist/tippy.js' // eslint-disable-line no-unused-vars

import VueTippy from 'vue-tippy'

import {TweenLite} from 'gsap/TweenMax' // eslint-disable-line no-unused-vars

import eYoPlugin from './plugin/eyoplugin'
import eYoI18n from './lang/eyoi18n'

var FileSaver = require('file-saver')

eYo.App.Stacktrace = Stacktrace

eYo.$$ = Vue.prototype.$$ = {
  goog,
  eYo,
  Blockly,
  pako,
  _: lodash,
  TweenLite,
  process,
  http: axios,
  bus: new Vue()
}

Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(VueSplit)
Vue.use(VueTippy, eYo.Tooltip.options)

Vue.use(eYoPlugin)
Vue.use(eYoI18n)

if (process.env.BABEL_ENV !== 'web') {
  eYo.$$.electron = require('electron')
  Vue.use(require('vue-electron'))
}

eYo.Do.readOnlyMixin(eYo.App, {
  CONSOLE: 'console',
  TURTLE: 'turtle',
  WORKSPACE_ONLY: 'workspace only',
  CONSOLE_ONLY: 'console only'
})

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
                  store.commit('UI/setSelectedPanel', prefs.selectedPanel)
                }
                if (goog.isString(prefs.flyoutCategory)) {
                  store.commit('UI/setFlyoutCategory', prefs.flyoutCategory)
                }
                // close at last because it is an animation
                if (goog.isDef(prefs.flyoutClosed)) {
                  Vue.nextTick(() => {
                    store.commit('UI/setFlyoutClosed', prefs.flyoutClosed)
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
  doSave: function (ev, callback) {
    eYo.App.Document.doSaveAs(ev, callback)
  },
  doSaveAs: function (ev, callback) {
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
    callback && callback()
  },
  doOpen: function (ev) {
    eYo.$$.bus.$emit('webUploadStart', ev)
  }
} : {
  readFile: function (fileName, callback) {
    require('fs').readFile(fileName, (err, content) => {
      if (err) {
        alert('An error ocurred reading the file ' + err.message)
        return
      }
      eYo.App.Document.readDeflate(content, fileName)
      eYo.App.workspace.eyo.resetChangeCount()
      callback && callback()
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
  doOpen: function (ev, callback) {
    var defaultPath = eYo.App.Document.getDocumentPath()
    const {dialog} = require('electron').remote
    dialog.showOpenDialog({
      defaultPath: defaultPath,
      filters: [{
        name: 'Edython', extensions: ['eyo']
      }],
      properties: [
        'openFile'
      ]
    }, (fileNames) => {
      var fileName = fileNames && fileNames[0]
      if (fileName) {
        eYo.App.Document.readFile(fileName, callback)
      } else {
        console.log('Opération annulée')
      }
    })
  },
  doWriteContent: function (deflate, callback) {
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
        callback && callback()
        return
      }
      var dirname = path.dirname(filePath)
      var fs = require('fs')
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname)
      }
      store.commit('DOC_SET_PATH', filePath)
      eYo.App.Document.writeContentToFile(filePath, deflate, callback)
    })
  },
  writeContentToFile: function (path, deflate, callback) {
    require('fs').writeFile(path, deflate, function (err) {
      if (err) {
        alert('An error ocurred creating the file ' + err.message)
      } else {
        store.commit('UI/stageUndo')
        eYo.App.workspace.eyo.resetChangeCount()
        eYo.$$.bus.$emit('saveDidSucceed')
        callback && callback(path)
      }
    })
  },
  doSave: function (ev, callback) {
    let deflate = eYo.App.Document.getDeflate()
    var documentPath = store.state.Document.path
    if (documentPath) {
      eYo.App.Document.writeContentToFile(documentPath, deflate, callback)
    } else {
      eYo.App.Document.doWriteContent(deflate, callback)
    }
  },
  doSaveAs: function (ev, callback) {
    let deflate = eYo.App.Document.getDeflate()
    eYo.App.Document.doWriteContent(deflate, callback)
  }
}

eYo.App.Document.doNew = function (ev) {
  console.log('doNew')
  if (eYo.App.workspace && eYo.App.workspace.eyo.changeCount) {
    console.log('will bv::show::modal')
    eYo.$$.app.$emit('bv::show::modal', 'page-modal-should-save')
  } else {
    console.log('will doClear')
    eYo.App.Document.doClear()
    eYo.App.Document.readString(blank)
  }
}

eYo.App.Document.getDeflate = function () {
  var dom = eYo.App.workspace.eyo.toDom({noId: true})
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
  console.log('doClear')
  eYo.$$.bus.$emit('new-document')
  eYo.App.workspace.clearUndo()
  eYo.App.workspace.eyo.resetChangeCount()
  store.commit('UI/stageUndo')
  store.commit('DOC_SET_ECO_SAVE', store.state.Config.ecoSave)
  store.commit('DOC_SET_PATH', undefined)
}

eYo.App.Document.readString = function (str) {
  var parser = new DOMParser()
  var dom = parser.parseFromString(str, 'application/xml')
  eYo.App.workspace.eyo.fromDom(dom)
  eYo.App.workspace.clearUndo()
  eYo.App.workspace.eyo.resetChangeCount()
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
  store.commit('UI/setUndoCount', 0)
  store.commit('UI/setRedoCount', 0)
  if (store.state.UI.undoStage > 0) {
    // the last saved state won't ever be reached
    store.commit('UI/setUndoStage', -1)
  }
}
eYo.App.didProcessUndo = function () {
  // console.log('didProcessUndo')
  store.commit('UI/setUndoCount', eYo.App.workspace.undoStack_.length)
  store.commit('UI/setRedoCount', eYo.App.workspace.redoStack_.length)
}
eYo.App.didUnshiftUndo = function () {
  store.commit('UI/setUndoStage', store.state.UI.undoStage - 1) // negative values make sense
}
eYo.App.didPushUndo = function () {
  // console.log('didPushUndo')
  var count = eYo.App.workspace.undoStack_.length
  store.commit('UI/setUndoCount', count)
  if (store.state.UI.undoStage >= count) {
    // the last saved state won't ever be reached
    store.commit('UI/setUndoStage', -1)
  }
}
// eYo.App.didTouchBlock = function (block) {
//   console.log('didTouchBlock', block)
//   // store.commit('UI/setSelectedBlock', block) once broke everything when uncommented
// }
eYo.App.didAddSelect = function (block) {
  Vue.nextTick(() => {
    store.commit('UI/setSelectedBlock', Blockly.selected)
  })
}
eYo.App.selectedBlockUpdate = (eyo) => {
  console.error('selectedBlockUpdate')
  if (eyo) {
    if (eyo.id === store.state.UI.selectedBlockId) {
      Vue.nextTick(() => {
        console.error('selectedBlockUpdate echoed')
        store.commit('UI/selectedBlockUpdate', eyo.block_)
      })
    }
  }
}
Object.defineProperties(eYo.App, {
  selectedBlock: {
    get () {
      var id = store.state.UI.selectedBlockId
      return id && eYo.App.workspace.blockDB_[id]
    }
  }
})
eYo.App.didRemoveSelect = function (block) {
  Vue.nextTick(() => {
    store.commit('UI/setSelectedBlock', Blockly.selected)
  })
}

eYo.App.didCopyBlock = function (block, xml) {
  store.commit('UI/didCopyBlock', {block: block, xml: xml})
}

eYo.$$.bus.$on('webUploadDidStart', function (file) {
  eYo.App.Document.fileName_ = file
  console.log(file)
})

eYo.$$.bus.$on('webUploadEnd', function (result) {
  var content = new Uint8Array(result)
  eYo.App.Document.readDeflate(content, eYo.App.Document.fileName_)
  eYo.App.Document.fileName_ = undefined
})

Object.defineProperties(eYo.App, {
  selectedMode: {
    get () {
      return store.state.UI.selectedMode
    },
    set (newValue) {
      store.commit('UI/setSelectedMode', newValue)
    }
  }
})

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

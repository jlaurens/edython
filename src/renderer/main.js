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
  bus: eYo.App.bus,
  TweenLite: TweenLite
}

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
let root = new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

console.log('Launching brython')
brython()

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
                  root.$store.commit('UI_SET_SELECTED_PANEL', prefs.selectedPanel)
                }
                if (goog.isString(prefs.flyoutCategory)) {
                  root.$store.commit('UI_SET_FLYOUT_CATEGORY', prefs.flyoutCategory)
                }
                // close at last because it is an animation
                if (goog.isDef(prefs.flyoutClosed)) {
                  Vue.nextTick(function () {
                    root.$store.commit('UI_SET_FLYOUT_CLOSED', prefs.flyoutClosed)
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

eYo.App.Document = {
  getDeflate: function () {
    var dom = eYo.App.workspace.eyo.toDom(true)
    var prefs = {}
    var value = root.$store.state.UI.selectedPanel
    if (value) {
      prefs.selectedPanel = value
    }
    prefs.flyoutClosed = root.$store.state.UI.flyoutClosed
    value = root.$store.state.UI.flyoutCategory
    if (value) {
      prefs.flyoutCategory = value
    }
    var str = JSON.stringify(prefs)
    dom.insertBefore(goog.dom.createDom('prefs', null,
      goog.dom.createTextNode(str)
    ), dom.firstChild)
    let oSerializer = new XMLSerializer()
    var content = '<?xml version="1.0" encoding="utf-8"?>' + oSerializer.serializeToString(dom)
    let deflate = root.$store.state.Document.ecoSave ? root.$$.pako.gzip(content) : content // use gzip to ungzip from the CLI
    return deflate
  },
  doClear: function () {
    root.$$.bus.$emit('new-document')
    root.$$.eYo.App.workspace.clearUndo()
    root.documentPath = undefined
    root.$store.commit('UI_STAGE_UNDO')
    root.$store.commit('DOC_SET_ECO_SAVE', root.$store.state.Config.ecoSave)
    root.$store.commit('DOC_SET_PATH', undefined)
  },
  readFile: function (fileName) {
    require('fs').readFile(fileName, (err, content) => {
      if (err) {
        alert('An error ocurred reading the file ' + err.message)
        return
      }
      // let dom = eYo.Xml.workspaceToDom(eYo.App.workspace, true)
      // let oSerializer = new XMLSerializer()
      // let content = oSerializer.serializeToString(dom)
      // let deflate = root.$$.pako.gzip(content) // use gzip to ungzip from the CLI
      var inflate
      var ecoSave
      try {
        // is it compressed ?
        inflate = root.$$.pako.ungzip(content) // one can also ungzip from the CLI
        ecoSave = true
      } catch (err) {
        // I guess not
        inflate = content
        ecoSave = false
      }
      try {
        root.$$.eYo.App.Document.doClear()
        root.$store.commit('DOC_SET_ECO_SAVE', ecoSave)
        var str = goog.crypt.utf8ByteArrayToString(inflate)
        var parser = new DOMParser()
        var dom = parser.parseFromString(str, 'application/xml')
        root.$$.eYo.App.workspace.eyo.fromDom(dom)
        root.$store.commit('DOC_SET_PATH', fileName)
        root.$$.eYo.App.workspace.clearUndo()
        root.$$.eYo.App.doDomToPref(dom)
      } catch (err) {
        console.error('ERROR:', err)
      }
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
  doOpen: function () {
    var defaultPath = root.$$.eYo.App.Document.getDocumentPath()
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
      root.$$.eYo.App.Document.readFile(fileName)
    })
  },
  doWriteContent: function (deflate) {
    var path = require('path')
    var defaultPath = path.join(root.$$.eYo.App.Document.getDocumentPath(), 'Sans titre.eyo')
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
      root.$store.commit('DOC_SET_PATH', filePath)
      root.$$.eYo.App.Document.writeContentToFile(filePath, deflate)
    })
  },
  writeContentToFile: function (path, deflate) {
    require('fs').writeFile(path, deflate, function (err) {
      if (err) {
        alert('An error ocurred creating the file ' + err.message)
      } else {
        root.$store.commit('UI_STAGE_UNDO')
        root.$$.bus.$emit('saveDidSucceed')
      }
    })
  },
  doSave: function () {
    let deflate = root.$$.eYo.App.Document.getDeflate()
    var documentPath = root.$store.state.Document.path
    if (documentPath) {
      root.$$.eYo.App.Document.writeContentToFile(documentPath, deflate)
    } else {
      root.$$.eYo.App.Document.doWriteContent(deflate)
    }
  },
  doSaveAs: function () {
    let deflate = root.$$.eYo.App.Document.getDeflate()
    root.$$.eYo.App.Document.doWriteContent(deflate)
  }
}

root.$$.eYo.App.didClearUndo = function () {
  // console.log('didClearUndo')
  root.$store.commit('UI_SET_UNDO_COUNT', 0)
  root.$store.commit('UI_SET_REDO_COUNT', 0)
  if (root.$store.state.UI.undoStage > 0) {
    // the last saved state won't ever be reached
    root.$store.commit('UI_SET_UNDO_STAGE', -1)
  }
}
root.$$.eYo.App.didProcessUndo = function () {
  // console.log('didProcessUndo')
  root.$store.commit('UI_SET_UNDO_COUNT', root.$$.eYo.App.workspace.undoStack_.length)
  root.$store.commit('UI_SET_REDO_COUNT', root.$$.eYo.App.workspace.redoStack_.length)
}
root.$$.eYo.App.didUnshiftUndo = function () {
  root.$store.commit('UI_SET_UNDO_STAGE', root.$$.root.$store.state.UI.undoStage - 1) // negative values make sense
}
root.$$.eYo.App.didPushUndo = function () {
  // console.log('didPushUndo')
  var count = root.$$.eYo.App.workspace.undoStack_.length
  root.$store.commit('UI_SET_UNDO_COUNT', count)
  if (root.$store.state.UI.undoStage >= count) {
    // the last saved state won't ever be reached
    root.$store.commit('UI_SET_UNDO_STAGE', -1)
  }
}
root.$$.eYo.App.didTouchBlock = function (block) {
  // root.$store.commit('UI_SET_SELECTED', block) breaks everything when uncommented
}

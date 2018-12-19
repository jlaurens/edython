import pako from 'pako'

import blank from '@static/template/blank.xml'

var eYoDocument = {}
var FileSaver = require('file-saver')

eYoDocument.install = function (Vue, options) {
  console.error('INSTALLING eYoDocument', eYo, options)
  var store = options.store
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
    prefs.flyoutClosed = store.state.UI.flyoutClosed
    var value = store.state.UI.flyoutCategory
    if (value) {
      prefs.flyoutCategory = value
    }
    value = store.state.UI.flyoutModule
    if (value) {
      prefs.flyoutModule = value
    }
    value = store.state.Layout.cfg.prefs
    if (value) {
      prefs.paneLayout = value
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
  eYo.$$.bus.$on('webUploadDidStart', function (file) {
    eYo.App.Document.fileName_ = file
    console.log(file)
  })
  eYo.$$.bus.$on('webUploadEnd', function (result) {
    var content = new Uint8Array(result)
    eYo.App.Document.readDeflate(content, eYo.App.Document.fileName_)
    eYo.App.Document.fileName_ = undefined
  })
}
export default eYoDocument

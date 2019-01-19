var eYoDocument = {}

eYoDocument.install = function (Vue, options) {
  console.error('INSTALLING eYoDocument', eYo, options)
  var store = options.store
  eYo.App.Document || (eYo.App.Document = {})
  eYo.App.Document.readFile = (fileName, callback) => {
    const fs = window.require('fs')
    fs.readFile(fileName, (err, content) => {
      if (err) {
        alert('An error ocurred reading the file ' + err.message)
        return
      }
      eYo.App.Document.readDeflate(content, fileName)
      eYo.App.workspace.eyo.resetChangeCount()
      if (callback) {
        callback()
      } else {
        eYo.$$.app.$nextTick(() => {
          eYo.Selected.selectOneBlockOf(eYo.App.workspace.topBlocks_, true)
        })
      }
    })
  }
  eYo.App.Document.getDocumentPath = () => {
    // const {dialog} = require('electron').remote
    const remote = window.require('electron').remote
    const app = remote.app
    let documentsFolder = app.getPath('documents')
    const defaultPath = require('path').join(documentsFolder, 'Edython')
    const fs = window.require('fs')
    if (!fs.existsSync(defaultPath)) {
      fs.mkdirSync(defaultPath)
    }
    return defaultPath
  }
  eYo.App.Document.doOpen = (ev, callback) => {
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
  }
  eYo.App.Document.doWriteContent = (deflate, callback) => {
    const path = require('path')
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
      const fs = window.require('fs')
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname)
      }
      store.commit('Document/setPath', filePath)
      eYo.App.Document.writeContentToFile(filePath, deflate, callback)
    })
  }
  eYo.App.Document.writeContentToFile = (path, deflate, callback) => {
    const fs = window.require('fs')
    fs.writeFile(path, deflate, function (err) {
      if (err) {
        alert('An error ocurred creating the file ' + err.message)
      } else {
        store.commit('Undo/stageUndo')
        eYo.App.workspace.eyo.resetChangeCount()
        eYo.$$.bus.$emit('saveDidSucceed')
        callback && callback(path)
      }
    })
  }
  eYo.App.Document.doSave = (ev, callback) => {
    let deflate = eYo.App.Document.getDeflate()
    var documentPath = store.state.Document.path
    if (documentPath) {
      eYo.App.Document.writeContentToFile(documentPath, deflate, callback)
    } else {
      eYo.App.Document.doWriteContent(deflate, callback)
    }
  }
  eYo.App.Document.doSaveAs = (ev, callback) => {
    let deflate = eYo.App.Document.getDeflate()
    eYo.App.Document.doWriteContent(deflate, callback)
  }
}
export default eYoDocument

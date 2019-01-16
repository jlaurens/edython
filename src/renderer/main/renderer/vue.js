import Vue from 'vue'
import store from '../../store'
import eYoDocument from '../../plugin/renderer/eyodocument'

Vue.use(eYoDocument, {store})

if (Vue.prototype.$electron) {
  var ipcRenderer = Vue.prototype.$electron.ipcRenderer
  if (ipcRenderer) {
    // we *are* in electron
    ipcRenderer.on('new', eYo.App.Document.doNew)
    ipcRenderer.on('open', eYo.App.Document.doOpen)
    ipcRenderer.on('save', eYo.App.Document.doSave)
    ipcRenderer.on('saveas', eYo.App.Document.doSaveAs)
  }
}

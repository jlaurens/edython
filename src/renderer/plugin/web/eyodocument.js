var eYoDocument = {}
const FileSaver = require('file-saver')

eYoDocument.install = function (Vue, options) {
  var store = options.store
  eYo.App.Document || (eYo.App.Document = {})
  eYo.App.Document.doSave = (ev, callback) => {
    eYo.App.Document.doSaveAs(ev, callback)
  }
  eYo.App.Document.doSaveAs = (() => {
    var do_it = (ev, callback) => {
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
    }
    return (ev, callback) => {
      var documentPath = store.state.Document.path
      if (documentPath && documentPath.lastIndexOf) {
        do_it(ev, callback)
      } else {
        eYo.$$.bus.$emit('get-document-path', () => {
          do_it(ev, callback)
        })
      }
    }
  })()
  eYo.App.Document.doOpen = (ev) => {
    eYo.$$.bus.$emit('webUploadStart', ev)
  }
  eYo.$$.bus.$on('webUploadDidStart', file => {
    eYo.App.Document.fileName_ = file
    console.log(file)
  })
  eYo.$$.bus.$on('webUploadEnd', result => {
    var content = new Uint8Array(result)
    eYo.App.Document.readDeflate(content, eYo.App.Document.fileName_)
    eYo.$$.app.$nextTick(() => {
      eYo.Selected.selectOneBlockOf(eYo.App.workspace.topBlocks_, true)
      eYo.$$.bus.$emit('pane-workspace-visible')
    })
    eYo.App.Document.fileName_ = undefined
  })
}
export default eYoDocument

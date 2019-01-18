import pako from 'pako'
import blank from '@static/template/blank.xml'

var eYoAppDocument = {}

eYoAppDocument.install = function (Vue, options) {
  console.error('INSTALLING eYoAppDocument', process.env.BABEL_ENV, eYo, options)
  var store = options.store
  eYo.App.Document || (eYo.App.Document = {})
  eYo.App.Document.doNew = (ev) => {
    console.log('doNew')
    var w = eYo.App.workspace
    if (w && w.eyo.changeCount) {
      // console.log('will bv::show::modal')
      eYo.$$.app.$emit('bv::show::modal', 'page-modal-should-save')
    } else {
      // console.log('will doClear')
      eYo.App.Document.doClear()
      eYo.App.Document.readString(blank)
      Vue.nextTick(() => {
        eYo.Selected.selectOneBlockOf(w.topBlocks_, true)
      })
    }
  }
  eYo.App.Document.getDeflate = () => {
    eYo.Events.groupWrap(() => {
      eYo.Do.tryFinally(() => {
        var tops = eYo.App.workspace.topBlocks_.filter(block => !block.eyo.isReady)
        tops.forEach(block => block.eyo.beReady())
      })
    })
    var dom = eYo.App.workspace.eyo.toDom({noId: true})
    eYo.App.doPrefToDom(dom)
    let oSerializer = new XMLSerializer()
    var content = '<?xml version="1.0" encoding="utf-8"?>' + oSerializer.serializeToString(dom)
    let deflate = store.state.Document.ecoSave ? pako.gzip(content) : content // use gzip to ungzip from the CLI
    return deflate
  }
  eYo.App.Document.doClear = () => {
    console.log('doClear')
    eYo.$$.bus.$emit('new-document')
    eYo.App.workspace.clearUndo()
    eYo.App.workspace.eyo.resetChangeCount()
    store.commit('Undo/stageUndo')
    store.commit('Document/setEcoSave', store.state.Config.ecoSave)
    store.commit('Document/setPath', undefined)
  }
  eYo.App.Document.readString = (str) => {
    // var d = new Date()
    // var t0 = d.getTime()
    var parser = new DOMParser()
    var dom = parser.parseFromString(str, 'application/xml')
    eYo.App.workspace.eyo.fromDom(dom)
    eYo.App.workspace.clearUndo()
    eYo.App.workspace.eyo.resetChangeCount()
    // d = new Date()
    // console.error('t:', (d.getTime() - t0) / 1000)
    eYo.App.doDomToPref(dom)
    // d = new Date()
    // console.error('t:', (d.getTime() - t0) / 1000)
  }
  eYo.App.Document.readDeflate = (deflate, fileName) => {
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
      store.commit('Document/setEcoSave', ecoSave)
      var str = goog.crypt.utf8ByteArrayToString(inflate)
      eYo.App.Document.readString(str)
      store.commit('Document/setPath', fileName)
    } catch (err) {
      console.error('ERROR:', err)
    }
  }
}
export default eYoAppDocument

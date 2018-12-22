var eYoApp = {}

eYoApp.test = function () {
  console.error('TEST eYoApp')
}

eYoApp.install = function (Vue, options) {
  var store = options.store
  eYo.Do.readOnlyMixin(eYo.App, {
    CONSOLE: 'console',
    TURTLE: 'turtle',
    WORKSPACE_ONLY: 'workspace only',
    CONSOLE_ONLY: 'console only'
  })
  eYo.App.doPrefToDom = (dom) => {
    var prefs = {}
    var value
    var state = eYo.$$.app.$store.state
    value = state.Workspace.cfg.prefs
    if (value) {
      prefs.workspace = value
    }
    value = state.Layout.cfg.prefs
    if (value) {
      prefs.paneLayout = value
    }
    var str = JSON.stringify(prefs)
    dom.insertBefore(goog.dom.createDom('prefs', null,
      goog.dom.createTextNode(str)
    ), dom.firstChild)
    return dom
  }
  eYo.App.doDomToPref = (dom) => {
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
                eYo.Do.tryFinally(() => {
                  eYo.$$.app.$store.dispatch('Workspace/setPrefs', prefs.workspace)
                  eYo.$$.app.$store.dispatch('Layout/setPrefs', prefs.paneLayout)
                })
                return
              }
            }
          }
        }
      }
    }
  }
  eYo.App.didClearUndo = () => {
    // console.log('didClearUndo')
    store.commit('Undo/setUndoCount', 0)
    store.commit('Undo/setRedoCount', 0)
    if (store.state.Undo.undoStage > 0) {
      // the last saved state won't ever be reached
      store.commit('Undo/setUndoStage', -1)
    }
  }
  eYo.App.didProcessUndo = () => {
    // console.log('didProcessUndo')
    store.commit('Undo/setUndoCount', eYo.App.workspace.undoStack_.length)
    store.commit('Undo/setRedoCount', eYo.App.workspace.redoStack_.length)
  }
  eYo.App.didUnshiftUndo = () => {
    store.commit('Undo/setUndoStage', store.state.Undo.undoStage - 1) // negative values make sense
  }
  eYo.App.didPushUndo = () => {
    console.log('didPushUndo')
    var count = eYo.App.workspace.undoStack_.length
    store.commit('Undo/setUndoCount', count)
    if (store.state.Undo.undoStage >= count) {
      // the last saved state won't ever be reached
      store.commit('Undo/setUndoStage', -1)
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
}
export default eYoApp

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
  eYo.App.didClearUndo = () => {
    // console.log('didClearUndo')
    store.commit('UI/setUndoCount', 0)
    store.commit('UI/setRedoCount', 0)
    if (store.state.UI.undoStage > 0) {
      // the last saved state won't ever be reached
      store.commit('UI/setUndoStage', -1)
    }
  }
  eYo.App.didProcessUndo = () => {
    // console.log('didProcessUndo')
    store.commit('UI/setUndoCount', eYo.App.workspace.undoStack_.length)
    store.commit('UI/setRedoCount', eYo.App.workspace.redoStack_.length)
  }
  eYo.App.didUnshiftUndo = () => {
    store.commit('UI/setUndoStage', store.state.UI.undoStage - 1) // negative values make sense
  }
  eYo.App.didPushUndo = () => {
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

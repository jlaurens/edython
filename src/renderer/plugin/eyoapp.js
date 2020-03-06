import {layoutcfg} from '@@/../store/modules/Layout'

var eYoApp = {}

eYoApp.test = function () {
  console.error('TEST eYoApp')
}

eYoApp.install = function (Vue, options) {
  var store = options.store
  eYo.mixinR(eYo.App, {
    CONSOLE: 'console',
    TURTLE: 'turtle',
    WORKSPACE_ONLY: 'workspace only',
    CONSOLE_ONLY: 'console only'
  })
  eYo.App.doPrefToDom = (dom) => {
    var prefs = {}
    var value
    var state = store.state
    value = layoutcfg.prefs
    if (value) {
      prefs.workspace = value
    }
    value = state.Layout.paneLayout
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
    for (var child of dom.childNodes) {
      var name = child.nodeName.toLowerCase()
      if (name === eYo.Xml.EDYTHON) {
        // find the 'prefs' child
        var children = child.childNodes
        var i = 0
        while (i < children.length) {
          child = children[i++]
          if (child.tagName && child.tagName.toLowerCase() === 'prefs') {
            // find the 'text' child
            var str = child.textContent
            if (str) {
              var prefs = JSON.parse(str)
              if (prefs) {
                store.dispatch('Workspace/setPrefs', prefs.workspace)
                store.dispatch('Layout/setPrefs', prefs.paneLayout)
                return
              }
            }
          }
        }
      }
    }
  }
  /** Sent when the undo stack is cleared out. */
  eYo.App.didClearUndo = () => {
    // console.log('didClearUndo')
    store.commit('Undo/didClearUndo')
  }
  eYo.App.didProcessUndo = () => {
    // console.log('didProcessUndo')
    store.commit('Undo/didProcessUndo')
  }
  eYo.App.didUnshiftUndo = () => {
    store.commit('Undo/didUnshiftUndo')
  }
  /** Sent when a new undo operation has been created */
  eYo.App.didPushUndo = () => {
    store.commit('Undo/didPushUndo')
  }
  // eYo.App.didTouchBrick = function (brick) {
  //   console.log('didTouchBrick',brick)
  //   // store.commit('Selected/selectBrick',brick) once broke everything when uncommented
  // }
  eYo.Selected.didAdd = () => {
    Vue.nextTick(() => {
      store.commit('Selected/selectBrick', eYo.Selected.brick)
    })
  }
  eYo.Selected.didRemove = () => {
    Vue.nextTick(() => {
      store.commit('Selected/selectBrick', eYo.Selected.brick)
    })
  }
  eYo.App.selectedBrickUpdate = (brick) => {
    console.error('selectedBrickUpdate')
    if (brick) {
      if (brick.id === store.state.Selected.id) {
        Vue.nextTick(() => {
          console.error('selectedBrickUpdate echoed')
          store.commit('Selected/update', brick)
        })
      }
    }
  }
  Object.defineProperties(eYo.App, {
    selectedBrick: {
      get () {
        var id = store.state.Selected.id
        return id && eYo.App.workspace.brickDB_[id]
      }
    }
  })
  eYo.App.didRemoveSelect = function (brick) {
    Vue.nextTick(() => {
      store.commit('Selected/selectBrick', eYo.focus.brick)
    })
  }
  Object.defineProperties(eYo.App, {
    selectedMode: {
      get () {
        return store.state.UI.selectedMode
      },
      set (newValue) {
        store.commit('UI/selectMode', newValue)
      }
    }
  })

  // listen to connections
  eYo.brick.Base_p.didConnect = (() => {
    // this is a closure
    let didConnect = eYo.brick.Base_p.didConnect
    return function (connection, oldTargetC8n, targetOldC8n) {
      didConnect.call(this, connection, oldTargetC8n, targetOldC8n)
      Vue.nextTick(() => {
        eYo.$$.bus.$emit('did-connect')
      })
    }
  })()

  // listen to connections
  eYo.brick.Base_p.didDisconnect = (() => {
    // this is a closure
    var didDisconnect = eYo.brick.Base_p.didDisconnect
    return function (connection, oldTargetC8n, targetOldC8n) {
      didDisconnect.call(this, connection, oldTargetC8n, targetOldC8n)
      Vue.nextTick(() => {
        eYo.$$.bus.$emit('did-disconnect')
      })
    }
  })()
}
export default eYoApp

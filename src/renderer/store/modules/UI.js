eYo.Do.readOnlyMixin(eYo.App, {
  TUTORIAL: 'tutorial',
  BASIC: 'basic',
  NORMAL: 'normal',
  TEACHER: 'teacher'
})

const temp = {
  eyo: undefined
}

const state = {
  undoCount: 0,
  redoCount: 0,
  undoStage: 0,
  selectedBlockId: undefined, // the selected block id
  selectedBlockType: undefined, // the selected block type
  selectedBlockStep: 0, // the selected block type
  blockClipboard: undefined,
  displayMode: undefined,
  panelsWidth: '100%',
  selectedMode: eYo.App.NORMAL,
  toolbarBlockVisible: true,
  toolbarRyVisible: false,
  toolbarInfoDebug: false,
  blockEditShowRy: true,
  blockEditShowDotted: true
}

const mutations = {
  setUndoCount (state, n) {
    state.undoCount = n
  },
  setRedoCount (state, n) {
    state.redoCount = n
  },
  setUndoStage (state, n) {
    state.undoStage = n
  },
  stageUndo (state) {
    state.undoCount = eYo.App.workspace.undoStack_.length
  },
  setSelectedBlock (state, block) {
    if (block) {
      if (block.isInFlyout || (block.id === state.selectedBlockId)) {
        return
      }
      temp.eyo && (temp.eyo.didChangeEnd = null)
      temp.eyo = block.eyo
      temp.eyo.didChangeEnd = (eyo) => {
        if (eyo) {
          if (eyo.id === state.selectedBlockId) {
            this.commit('UI/selectedBlockUpdate', eyo.block_)
          }
        }
      }
      state.selectedBlockId = block.id
      state.selectedBlockType = block.type
      state.selectedBlockStep = block.eyo.change.step
    } else {
      if (!state.selectedBlockId) {
        return
      }
      temp.eyo && (temp.eyo.didChangeEnd = null)
      state.selectedBlockId = state.selectedBlockType = null
      state.selectedBlockStep = 0
    }
  },
  selectedBlockUpdate (state, block) {
    // var old = state.selectedBlockStep
    state.selectedBlockStep = block ? block.eyo.change.step : 0
    // console.warn('step', old, '=>', state.selectedBlockStep)
  },
  didCopyBlock (state, ctxt) {
    state.blockClipboard = ctxt.xml
  },
  setPanelsWidth (state, newWidth) {
    state.panelsWidth = newWidth
  },
  setDisplayMode (state, mode) {
    if ([eYo.App.CONSOLE_ONLY, eYo.App.WORKSPACE_ONLY].indexOf(mode) < 0) {
      state.displayMode = undefined
    } else {
      state.displayMode = mode
    }
  },
  setSelectedMode (state, mode) {
    state.selectedMode = mode
    this.commit('UI/setToolbarBlockVisible', mode !== eYo.App.TUTORIAL)
    var yorn = mode !== eYo.App.TUTORIAL && mode !== eYo.App.BASIC
    this.commit('UI/setBlockEditShowRy', yorn)
    this.commit('UI/setBlockEditShowDotted', yorn)
  },
  setToolbarBlockVisible (state, yorn) {
    state.toolbarBlockVisible = !!yorn
  },
  setToolbarRyVisible (state, yorn) {
    state.toolbarRyVisible = !!yorn
  },
  setToolbarBlockDebug (state, yorn) {
    state.toolbarInfoDebug = !!yorn
  },
  setBlockEditShowRy (state, yorn) {
    state.blockEditShowRy = !!yorn
  },
  setBlockEditShowDotted (state, yorn) {
    state.blockEditShowDotted = !!yorn
  }
}

const actions = {
}

const getters = {
  isDocumentEdited: state => {
    return state.undoCount === state.undoStage
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

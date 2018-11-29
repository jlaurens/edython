import namespace from '../util/namespace'

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
  selectedPanel: eYo.App.CONSOLE,
  selectedMode: eYo.App.NORMAL,
  flyoutClosed: false,
  flyoutCategory: undefined,
  toolbarBlockVisible: true,
  toolbarRyVisible: false,
  toolbarInfoDebug: false,
  blockEditShowRy: true,
  blockEditShowDotted: true
}

console.log(eYo.App)

const types = namespace('UI', {
  getters: [
    'IS_DOCUMENT_EDITED'
  ],
  mutations: [
    'SET_UNDO_COUNT',
    'SET_REDO_COUNT',
    'SET_UNDO_STAGE',
    'STAGE_UNDO',
    'SET_SELECTED_BLOCK',
    'SELECTED_BLOCK_UPDATE',
    'DID_COPY_BLOCK',
    'SET_DISPLAY_MODE',
    'SET_PANELS_WIDTH',
    'SET_SELECTED_PANEL',
    'SET_SELECTED_MODE',
    'SET_FLYOUT_CATEGORY',
    'SET_FLYOUT_CLOSED',
    'SET_TOOLBAR_BLOCK_VISIBLE',
    'SET_TOOLBAR_RY_VISIBLE',
    'SET_TOOLBAR_BLOCK_DEBUG',
    'SET_BLOCK_EDIT_SHOW_RY',
    'SET_BLOCK_EDIT_SHOW_DOTTED'
  ]
})

const mutations = {
  [types.mutations.SET_UNDO_COUNT] (state, n) {
    state.undoCount = n
  },
  [types.mutations.SET_REDO_COUNT] (state, n) {
    state.redoCount = n
  },
  [types.mutations.SET_UNDO_STAGE] (state, n) {
    state.undoStage = n
  },
  [types.mutations.STAGE_UNDO] (state) {
    state.undoCount = eYo.App.workspace.undoStack_.length
  },
  [types.mutations.SET_SELECTED_BLOCK] (state, block) {
    if (block) {
      if (block.isInFlyout || (block.id === state.selectedBlockId)) {
        return
      }
      temp.eyo && (temp.eyo.didChangeEnd = null)
      temp.eyo = block.eyo
      temp.eyo.didChangeEnd = (eyo) => {
        if (eyo) {
          if (eyo.id === state.selectedBlockId) {
            this.commit('UI_SELECTED_BLOCK_UPDATE', eyo.block_)
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
  [types.mutations.SELECTED_BLOCK_UPDATE] (state, block) {
    var old = state.selectedBlockStep
    state.selectedBlockStep = block ? block.eyo.change.step : 0
    console.warn('step', old, '=>', state.selectedBlockStep)
  },
  [types.mutations.DID_COPY_BLOCK] (state, ctxt) {
    state.blockClipboard = ctxt.xml
  },
  [types.mutations.SET_PANELS_WIDTH] (state, newWidth) {
    state.panelsWidth = newWidth
  },
  [types.mutations.SET_DISPLAY_MODE] (state, mode) {
    if ([eYo.App.CONSOLE_ONLY, eYo.App.WORKSPACE_ONLY].indexOf(mode) < 0) {
      state.displayMode = undefined
    } else {
      state.displayMode = mode
    }
  },
  [types.mutations.SET_SELECTED_PANEL] (state, key) {
    state.selectedPanel = key
  },
  [types.mutations.SET_SELECTED_MODE] (state, mode) {
    state.selectedMode = mode
    this.commit('UI_SET_TOOLBAR_BLOCK_VISIBLE', mode !== eYo.App.TUTORIAL)
    var yorn = mode !== eYo.App.TUTORIAL && mode !== eYo.App.BASIC
    this.commit('UI_SET_BLOCK_EDIT_SHOW_RY', yorn)
    this.commit('UI_SET_BLOCK_EDIT_SHOW_DOTTED', yorn)
  },
  [types.mutations.SET_FLYOUT_CATEGORY] (state, category) {
    if (goog.isString(category)) {
      state.flyoutCategory = category
    }
  },
  [types.mutations.SET_FLYOUT_CLOSED] (state, yorn) {
    state.flyoutClosed = !!yorn
  },
  [types.mutations.SET_TOOLBAR_BLOCK_VISIBLE] (state, yorn) {
    state.toolbarBlockVisible = !!yorn
  },
  [types.mutations.SET_TOOLBAR_RY_VISIBLE] (state, yorn) {
    state.toolbarRyVisible = !!yorn
  },
  [types.mutations.SET_TOOLBAR_BLOCK_DEBUG] (state, yorn) {
    state.toolbarInfoDebug = !!yorn
  },
  [types.mutations.SET_BLOCK_EDIT_SHOW_RY] (state, yorn) {
    state.blockEditShowRy = !!yorn
  },
  [types.mutations.SET_BLOCK_EDIT_SHOW_DOTTED] (state, yorn) {
    state.blockEditShowDotted = !!yorn
  }
}

const actions = {
}

const getters = {
  [types.getters.IS_DOCUMENT_EDITED]: state => {
    return state.undoCount === state.undoStage
  }
}

export default {
  state,
  mutations,
  actions,
  getters,
  types
}

import namespace from '../util/namespace'

const state = {
  undoCount: 0,
  redoCount: 0,
  undoStage: 0,
  selectedBlockId: undefined, // the selected block id
  selectedBlockType: undefined, // the selected block type
  blockClipboard: undefined,
  panelsVisible: true,
  panelsWidth: '100%',
  selectedPanel: 'console',
  flyoutClosed: false,
  flyoutCategory: undefined,
  toolbarInfoVisible: true,
  toolbarInfoDebug: false
}

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
    'DID_COPY_BLOCK',
    'SET_PANELS_VISIBLE',
    'SET_PANELS_WIDTH',
    'SET_SELECTED_PANEL',
    'SET_FLYOUT_CATEGORY',
    'SET_FLYOUT_CLOSED',
    'SET_TOOLBAR_INFO_VISIBLE',
    'SET_TOOLBAR_INFO_DEBUG'
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
    if ((block && block.isInFlyout) || block === state.selectedBlockId) {
      return
    }
    state.selectedBlockId = block ? block.id : null
    state.selectedBlockType = block ? block.type : null
  },
  [types.mutations.DID_COPY_BLOCK] (state, ctxt) {
    state.blockClipboard = ctxt.xml
  },
  [types.mutations.SET_PANELS_VISIBLE] (state, yorn) {
    state.panelsVisible = yorn
  },
  [types.mutations.SET_PANELS_WIDTH] (state, newWidth) {
    state.panelsWidth = newWidth
  },
  [types.mutations.SET_SELECTED_PANEL] (state, key) {
    state.selectedPanel = key
  },
  [types.mutations.SET_FLYOUT_CATEGORY] (state, category) {
    if (goog.isString(category)) {
      state.flyoutCategory = category
    }
  },
  [types.mutations.SET_FLYOUT_CLOSED] (state, yorn) {
    state.flyoutClosed = !!yorn
  },
  [types.mutations.SET_TOOLBAR_INFO_VISIBLE] (state, yorn) {
    state.toolbarInfoVisible = !!yorn
  },
  [types.mutations.SET_TOOLBAR_INFO_DEBUG] (state, yorn) {
    state.toolbarInfoDebug = !!yorn
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

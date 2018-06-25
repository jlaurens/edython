const state = {
  undoCount: 0,
  undoStage: 0,
  panelsVisible: true,
  panelsWidth: '100%'
}

const mutations = {
  SET_UNDO_COUNT (state, n) {
    state.undoCount = n
  },
  SET_UNDO_STAGE (state, n) {
    state.undoStage = n
  },
  STAGE_UNDO (state) {
    state.undoCount = eYo.App.workspace.undoStack_.length
  },
  SET_PANELS_VISIBLE (state, yorn) {
    state.panelsVisible = yorn
  },
  SET_PANELS_WIDTH (state, newWidth) {
    state.panelsWidth = newWidth
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
  state,
  mutations,
  actions,
  getters
}

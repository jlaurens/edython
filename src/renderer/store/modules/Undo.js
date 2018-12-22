const state = {
  undoCount: 0,
  redoCount: 0,
  undoStage: 0
}

const mutations = {
  setUndoCount (state, n) {
    console.log('UNDO/setUndoCount', n)
    state.undoCount = n
  },
  setRedoCount (state, n) {
    console.log('UNDO/setRedoCount', n)
    state.redoCount = n
  },
  setUndoStage (state, n) {
    console.log('UNDO/setUndoStage', n)
    state.undoStage = n
  },
  stageUndo (state) {
    console.log('UNDO/stageUndo')
    state.undoCount = eYo.App.workspace.undoStack_.length
  }
}

const actions = {
}

const getters = {
  isDocumentEdited: state => {
    return state.undoCount !== state.undoStage
  },
  canRevert: (state) => (redo) => (redo ? state.redoCount : state.undoCount) > 0
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

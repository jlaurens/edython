const state = {
  undoCount: 0,
  redoCount: 0,
  undoStage: 0
}

/**
 * Undo management is observed through the length of the undo and redo stacks
 * of the workspace.
 * The undo and redo buttons are enabled only when there is a potential action
 * to be undone or redone.
 * For that purpose, we have a reactive count for both stack lengths.
 * The undo and redo stacks may be cleared, in which case the associate counts
 * are reset.
 * Undo management is also observed to decide whether a document should be saved.
 * If the document has been edited, some indicator must show that.
 */
const mutations = {
  /**
   * Message sent when the document is saved.
   * Reset the change count.
   * @param {*} state
   */
  stageUndo (state) {
    // console.log('Undo/stageUndo', eYo.App.workspace.undoStack_.length, eYo.App.workspace.redoStack_.length)
    state.undoStage = state.undoCount = eYo.App.workspace.undoStack_.length
    state.redoCount = eYo.App.workspace.redoStack_.length
  },
  /**
   * Sent when the undo stacks are cleared.
   * @param {*} state
   */
  didClearUndo (state) {
    // console.log('UNDO/didClearUndo')
    state.undoCount = 0
    state.redoCount = 0
    if (state.undoStage > 0) {
      // the last saved state won't ever be reached
      state.undoStage = -1
    }
  },
  /**
   * Sent when either undo or redo is performed.
   * @param {*} state
   */
  didProcessUndo (state) {
    // console.log('UNDO/didProcessUndo')
    state.undoCount = eYo.App.workspace.undoStack_.length
    state.redoCount = eYo.App.workspace.redoStack_.length
  },
  /**
   * A new undo event is available, but we reached the limit
   * and an undo event was removed.
   * `undoStage === undoCount` no longer corresponds to the saved point,
   * we must decrement `undoStage`.
   * @param {*} state
   */
  didUnshiftUndo (state) {
    // console.log('UNDO/didUnshiftUndo')
    state.undoStage -= 1 // negative values make sense
    state.redoCount = 0
  },
  /**
   * A new undo action is available.
   * The redo stack is void.
   * @param {*} state
   */
  didPushUndo (state) {
    // console.log('UNDO/didPushUndo')
    var count = eYo.App.workspace.undoStack_.length
    state.undoCount = count
    state.redoCount = 0
    if (state.undoStage >= count) {
      // the last saved state won't ever be reached
      state.undoStage = -1
    }
  }
}

const actions = {
}

const getters = {
  isDocumentEdited: state => {
    // console.warn('UNDO/isDocumentEdited', state.undoCount, state.undoStage)
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

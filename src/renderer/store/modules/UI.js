eYo.Do.readOnlyMixin(eYo.App, {
  TUTORIAL: 'tutorial',
  BASIC: 'basic',
  NORMAL: 'normal',
  TEACHER: 'teacher'
})

const state = {
  blockClipboard: undefined,
  panelsWidth: 0,
  displayMode: undefined,
  selectedMode: eYo.App.TUTORIAL,
  toolbarBlockVisible: undefined,
  toolbarRyVisible: undefined,
  toolbarInfoDebug: undefined,
  blockEditShowRy: undefined,
  blockEditShowDotted: undefined,
  running1: undefined
}

const mutations = {
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
  selectMode (state, mode) {
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
  },
  setRunning1 (state, yorn) {
    state.running1 = !!yorn
  }
}

const actions = {
}

const getters = {
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

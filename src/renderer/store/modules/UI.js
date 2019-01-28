eYo.Do.readOnlyMixin(eYo.App, {
  TUTORIAL: 'tutorial',
  BASIC: 'basic',
  NORMAL: 'normal',
  TEACHER: 'teacher'
})

const state = {
  panelsWidth: 0,
  displayMode: undefined,
  selectedMode: eYo.App.TUTORIAL,
  toolbarBlockVisible: undefined,
  toolbarRyVisible: undefined,
  toolbarInfoDebug: undefined,
  blockEditShowRy: undefined,
  blockEditShowDotted: undefined
}

const mutations = {
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
  reset (state) {
    this.commit('UI/setPanelsWidth', 0)
    this.commit('UI/setDisplayMode', false)
    this.commit('UI/selectMode', eYo.App.TUTORIAL)
    this.commit('UI/setToolbarBlockVisible', false)
    this.commit('UI/setToolbarRyVisible', false)
    this.commit('UI/setToolbarBlockDebug', false)
    this.commit('UI/setBlockEditShowRy', false)
    this.commit('UI/setBlockEditShowDotted', false)
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

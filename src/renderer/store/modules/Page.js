const state = {
  toolbarMainHeight: 0,
  toolbarBlockHeight: 0
}

const mutations = {
  setToolbarMainHeight (state, height) {
    state.toolbarMainHeight = height
  },
  setToolbarBlockHeight (state, height) {
    state.toolbarBlockHeight = height
  }
}

const actions = {
}

const getters = {
}

const model = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default model

const state = {
  running1: false
}

const mutations = {
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

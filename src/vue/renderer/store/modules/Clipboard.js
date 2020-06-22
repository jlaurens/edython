const state = {
  clipboard: ''
}

const mutations = {
  didCopyBrick (state, xml) {
    state.clipboard = xml
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

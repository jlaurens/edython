const state = {
  clipboard: ''
}

const mutations = {
  didCopyBlock (state, xml) {
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

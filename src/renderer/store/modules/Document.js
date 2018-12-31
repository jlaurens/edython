const state = {
  path: undefined,
  ecoSave: undefined,
  noLeftSeparator: undefined,
  noDynamicList: undefined,
  smartUnary: undefined
}

const mutations = {
  setPath (state, new_path) {
    state.path = new_path
  },
  setEcoSave (state, yorn) {
    state.ecoSave = !!yorn
  },
  setNoLeftSeparator (state, yorn) {
    state.noLeftSeparator = !!yorn
    eYo.App.options.noLeftSeparator = !!yorn
  },
  setNoDynamicList (state, yorn) {
    state.noDynamicList = !!yorn
    eYo.App.options.noDynamicList = !!yorn
  },
  setSmartUnary (state, yorn) {
    state.smartUnary = !!yorn
    eYo.App.options.smartUnary = !!yorn
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

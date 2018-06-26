const state = {
  ecoSave: false,
  noLeftSeparator: true,
  noDynamicList: false,
  smartUnary: true
}

const mutations = {
  PREF_SET_ECO_SAVE (state, yorn) {
    state.ecoSave = !!yorn
  },
  PREF_SET_NO_LEFT_SEPARATOR (state, yorn) {
    state.noLeftSeparator = !!yorn
    eYo.App.options.noLeftSeparator = !!yorn
  },
  PREF_SET_NO_DYNAMIC_LIST (state, yorn) {
    state.noDynamicList = !!yorn
    eYo.App.options.noDynamicList = !!yorn
  },
  PREF_SET_SMART_UNARY (state, yorn) {
    state.smartUnary = !!yorn
    eYo.App.options.smartUnary = !!yorn
  }
}

const actions = {
}

const getters = {
}

export default {
  state,
  mutations,
  actions,
  getters
}

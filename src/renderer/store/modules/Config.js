const state = {
  ecoSave: true,
  noLeftSeparator: true,
  noDynamicList: false,
  smartUnary: true,
  disabledTips: false
}

const mutations = {
  CONFIG_SET_ECO_SAVE (state, yorn) {
    state.ecoSave = !!yorn
  },
  CONFIG_SET_NO_LEFT_SEPARATOR (state, yorn) {
    state.noLeftSeparator = !!yorn
    eYo.App.options.noLeftSeparator = !!yorn
  },
  CONFIG_SET_NO_DYNAMIC_LIST (state, yorn) {
    state.noDynamicList = !!yorn
    eYo.App.options.noDynamicList = !!yorn
  },
  CONFIG_SET_SMART_UNARY (state, yorn) {
    state.smartUnary = !!yorn
    eYo.App.options.smartUnary = !!yorn
  },
  CONFIG_SET_DISABLED_TIPS (state, yorn) {
    state.disabledTips = !!yorn
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

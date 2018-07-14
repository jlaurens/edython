const state = {
  path: undefined,
  ecoSave: undefined,
  noLeftSeparator: undefined,
  noDynamicList: undefined,
  smartUnary: undefined,
  disabledTips: undefined
}

const mutations = {
  DOC_SET_PATH (state, new_path) {
    state.path = new_path
  },
  DOC_SET_ECO_SAVE (state, yorn) {
    state.ecoSave = !!yorn
  },
  DOC_SET_NO_LEFT_SEPARATOR (state, yorn) {
    state.noLeftSeparator = !!yorn
    eYo.App.options.noLeftSeparator = !!yorn
  },
  DOC_SET_NO_DYNAMIC_LIST (state, yorn) {
    state.noDynamicList = !!yorn
    eYo.App.options.noDynamicList = !!yorn
  },
  DOC_SET_SMART_UNARY (state, yorn) {
    state.smartUnary = !!yorn
    eYo.App.options.smartUnary = !!yorn
  },
  DOC_SET_DISABLED_TIPS (state, yorn) {
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

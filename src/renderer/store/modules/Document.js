import namespace from '../util/namespace'

const state = {
  path: undefined,
  ecoSave: undefined,
  noLeftSeparator: undefined,
  noDynamicList: undefined,
  smartUnary: undefined,
  disabledTips: undefined
}

const _types = {
  getters: [
    'IS_DOCUMENT_EDITED'
  ],
  mutations: [
    'SET_PATH',
    'SET_ECO_SAVE',
    'SET_NO_LEFT_SEPARATOR',
    'SET_NO_DYNAMIC_LIST',
    'SET_SMART_UNARY',
    'SET_TIPS_DISABLED'
  ]
}

const types = namespace('DOC', _types)

const mutations = {
  [types.mutations.SET_PATH] (state, new_path) {
    state.path = new_path
  },
  [types.mutations.SET_ECO_SAVE] (state, yorn) {
    state.ecoSave = !!yorn
  },
  [types.mutations.SET_NO_LEFT_SEPARATOR] (state, yorn) {
    state.noLeftSeparator = !!yorn
    eYo.App.options.noLeftSeparator = !!yorn
  },
  [types.mutations.SET_NO_DYNAMIC_LIST] (state, yorn) {
    state.noDynamicList = !!yorn
    eYo.App.options.noDynamicList = !!yorn
  },
  [types.mutations.SET_SMART_UNARY] (state, yorn) {
    state.smartUnary = !!yorn
    eYo.App.options.smartUnary = !!yorn
  },
  [types.mutations.SET_TIPS_DISABLED] (state, yorn) {
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

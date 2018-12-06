/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

// import namespace from '../util/namespace'

const state = {
  tipsDisabled: false
}

// const _types = {
//   getters: [
//   ],
//   mutations: [
//     'toggleTipsDisabled'
//   ]
// }

// const types = namespace('Pref', _types)

const mutations = {
  toggleTipsDisabled (state) {
    state.tipsDisabled = !state.tipsDisabled
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

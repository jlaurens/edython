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
    var old = state.tipsDisabled
    var tippies = Array.from(document.querySelectorAll('[data-tippy]'), el => el._tippy)
    var i = 0
    if (old) {
      for (; i < tippies.length; ++i) {
        tippies[i].enable()
      }
    } else {
      for (; i < tippies.length; ++i) {
        var t = tippies[i]
        if (t.state.visible) {
          t.hide()
        }
        t.disable()
      }
    }
    state.tipsDisabled = !old
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

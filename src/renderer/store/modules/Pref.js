/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

// import namespace from '../util/namespace'

const state = {
    tipsDisabled: false,
    deepCopy: false
}

const mutations = {
    /**
   * Toggles the tips.
   * The main vue watches this value to turn on and off the tips.
   * The menu vue uses this mutator.
   * @param {*} state
   */
    toggleTipsDisabled (state) {
        state.tipsDisabled = !state.tipsDisabled
    },
    /**
   * Toggles the tips.
   * The main vue watches this value to turn on and off the tips.
   * The menu vue uses this mutator.
   * @param {*} state
   */
    toggleDeepCopy (state) {
        state.deepCopy = !state.deepCopy
    }
}

const actions = {
    reset (context) {
        if (context.state.tipsDisabled) {
            context.commit('toggleTipsDisabled')
        }
        if (context.state.deepCopy) {
            context.commit('toggleDeepCopy')
        }
    }
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

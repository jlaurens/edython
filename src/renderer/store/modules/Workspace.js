const state = {
  flyoutClosed: false,
  flyoutCategory: undefined,
  cfg: {}
}

const mutations = {
  setFlyoutCategory (state, category) {
    if (goog.isString(category)) {
      state.flyoutCategory = category
    }
  },
  setFlyoutClosed (state, yorn) {
    state.flyoutClosed = !!yorn
  }
}

const actions = {
}

Object.defineProperties(state.cfg, {
  prefs: {
    get () {
      var prefs = {
        closed: state.flyoutClosed,
        category: state.flyoutCategory
      }
      return prefs
    },
    set (newValue) {
      if (newValue) {
        if (goog.isDef(newValue.closed)) {
          state.flyoutClosed = newValue.closed
        }
        if (goog.isDef(newValue.category)) {
          state.flyoutCategory = newValue.category
        }
      }
    }
  }
})

const getters = {
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

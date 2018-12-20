const state = {
  flyoutClosed: false,
  flyoutCategory: undefined,
  scale: 0,
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
  },
  scaleUp (state) {
    state.scale += 1
  },
  scaleDown (state) {
    state.scale -= 1
  },
  scaleReset (state) {
    state.scale = 0
  }
}

const actions = {
  setPrefs ({ commit }, newValue) {
    if (newValue) {
      if (goog.isDef(newValue.closed)) {
        commit('setFlyoutClosed', newValue.closed)
      }
      if (goog.isDef(newValue.category)) {
        commit('setFlyoutCategory', newValue.category)
      }
    }
  }
}

const getters = {
  scaleFactor: state => 1.1 ** state.scale,
  prefs (state) {
    var prefs = {
      closed: state.flyoutClosed,
      category: state.flyoutCategory
    }
    return prefs
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

const state = {
  flyoutClosed: false,
  flyoutCategory: undefined,
  scale: 0,
  cfg: {}
}

Object.defineProperties(state.cfg, {
  prefs: {
    get () {
      return {
        closed: state.flyoutClosed,
        category: state.flyoutCategory
      }
    }
  }
})
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
  scaleUpBig (state) {
    state.scale += 3
  },
  scaleDownBig (state) {
    state.scale -= 3
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
  scaleFactor: state => 1.1 ** state.scale
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

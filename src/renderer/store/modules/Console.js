const state = {
  scale: 0
}

const mutations = {
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

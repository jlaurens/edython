const temp = {
  eyo: undefined
}

const state = {
  id: undefined, // the selected block id
  step: 0 // the selected block type
}

const mutations = {
  selectBlock (state, block) {
    if (block) {
      if (block.isInFlyout || (block.id === state.id)) {
        return
      }
      temp.eyo && (temp.eyo.didChangeEnd = null)
      temp.eyo = block.eyo
      temp.eyo.didChangeEnd = (eyo) => {
        if (eyo) {
          if (eyo.id === state.id) {
            this.commit('Selected/update', eyo.block_)
          }
        }
      }
      state.id = block.id
      state.step = block.eyo.change.step
    } else {
      if (!state.id) {
        return
      }
      temp.eyo && (temp.eyo.didChangeEnd = null)
      state.id = null
      state.step = 0
    }
  },
  update (state, block) {
    // var old = state.step
    state.step = block ? block.eyo.change.step : 0
    // console.warn('step', old, '=>', state.step)
  }
}

const actions = {
}

const getters = {
  eyo: state => state.id && temp.eyo,
  type: state => state.id && temp.eyo && temp.eyo.type
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

const temp = {
  eyo: undefined
}

const state = {
  selectedBlockId: undefined, // the selected block id
  step: 0 // the selected block type
}

const mutations = {
  setSelectedBlock (state, block) {
    if (block) {
      if (block.isInFlyout || (block.id === state.selectedBlockId)) {
        return
      }
      temp.eyo && (temp.eyo.didChangeEnd = null)
      temp.eyo = block.eyo
      temp.eyo.didChangeEnd = (eyo) => {
        if (eyo) {
          if (eyo.id === state.selectedBlockId) {
            this.commit('UI/selectedBlockUpdate', eyo.block_)
          }
        }
      }
      state.selectedBlockId = block.id
      state.step = block.eyo.change.step
    } else {
      if (!state.selectedBlockId) {
        return
      }
      temp.eyo && (temp.eyo.didChangeEnd = null)
      state.selectedBlockId = null
      state.step = 0
    }
  },
  selectedBlockUpdate (state, block) {
    // var old = state.step
    state.step = block ? block.eyo.change.step : 0
    // console.warn('step', old, '=>', state.step)
  }
}

const actions = {
}

const getters = {
  eyo: state => state.selectedBlockId && temp.eyo,
  type: state => state.selectedBlockId && temp.eyo && temp.eyo.type
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

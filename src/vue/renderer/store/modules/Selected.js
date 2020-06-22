/**
 * The selected brick updates the UI on changes.
 */
const temp = {
  brick: eYo.NA,
  listener: eYo.NA,
}

const state = {
  id: eYo.NA, // the selectedbrick id
  step: 0 // the selectedbrick change step
}

const mutations = {
  selectBrick (state, brick) {
    if (brick) {
      if (brick.isInFlyout || (brick.id === state.id)) {
        return
      }
    }
    if (temp.brick) {
      try {
        temp.brick.change.removeChangeDoneListener(temp.listener)
      } finally {
        temp.listener = temp.brick = eYo.NA
      }
    }
    if ((temp.brick = brick)) {
      temp.listener = brick.change.addChangeDoneListener(() => {
        this.commit('Selected/update', brick)
      })
      state.id = brick.id
      state.step = brick.change.step
    } else {
      if (!state.id) {
        return
      }
      state.id = null
      state.step = 0
    }
  },
  update (state, brick) {
    // var old = state.step
    state.step = brick ? brick.change.step : 0
    // console.warn('step', old, '=>', state.step)
  }
}

const actions = {
}

const getters = {
  eyo: state => state.id && temp.eyo,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

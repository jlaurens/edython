const wheres = [
  'f',
  'h1',
  'h2',
  'hh1',
  'hh2',
  'v1',
  'v2',
  'vv1',
  'vv2'
]

const whats = [
  'console',
  'workspace',
  'turtle'
]

const state = {
  paneLayout: undefined, /* One of 'F', 'H', 'V' */
  width_h1: 75,
  width_h2: 25,
  width_hh1: 75,
  width_hh2: 25,
  height_v1: 66,
  height_v2: 34,
  height_vv1: 50,
  height_vv2: 50
}

whats.forEach(k => {
  state[`where_${k}`] = undefined
})

const mutations = {
  setPaneLayout (state, layout) {
    console.error('setPaneLayout', layout)
    state.paneLayout = layout
  }
}

wheres.forEach(k => {
  mutations[`setWhat_${k}`] = (() => {
    return (state, payload) => {
      state[`what_${k}`] = payload
    }
  })()
})

whats.forEach(k => {
  mutations[`setWhere_${k}`] = (() => {
    return (state, payload) => {
      state[`where_${k}`] = payload
    }
  })()
})

whats.forEach(k => {
  mutations[`setWhere_${k}`] = (() => {
    return (state, payload) => {
      state[`where_${k}`] = payload
    }
  })()
})

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

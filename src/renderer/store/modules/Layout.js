const layoutcfg = {
  // these are the panes identifier
  // either atomic or split vues
  panes: [
    'workspace',
    'console',
    'turtle'
  ],
  // these are the locations where panes can go
  wheres: [
    'f', // full
    'h1', // above left
    'h2', // above right
    'hh1', // below left
    'hh2', // below right
    'v1', // left top
    'v2', // left bottom
    'vv1', // right top
    'vv2' // right bottom
  ],
  layouts: [
    'F',
    'H',
    'V' /*,
    'FH',
    'HF',
    'VF',
    'FV',
    'HH',
    'VV' */
  ]
}

Object.defineProperties(layoutcfg, {
  whats: {
    get () {
      return this.whats_ || (this.whats_ = ['h', 'v', 'hh', 'vv'].concat(this.panes))
    }
  },
  where_whats: {
    get () {
      return this.whats.map(s => 'where_' + s)
    }
  },
  setWhere_whats: {
    get () {
      return this.whats.map(s => 'setWhere_' + s)
    }
  },
  what_wheres: {
    get () {
      return this.wheres.map(s => 'what_' + s)
    }
  },
  setWhat_wheres: {
    get () {
      return this.wheres.map(s => 'setWhat_' + s)
    }
  },
  width_wheres: {
    get () {
      return this.wheres.filter(s => s.startsWith('h')).map(s => 'width_' + s)
    }
  },
  height_wheres: {
    get () {
      return this.wheres.filter(s => s.startsWith('v')).map(s => 'height_' + s)
    }
  }
})
const state = {
  paneLayout: undefined, /* One of layouts */
  width_h1: 66,
  width_h2: 34,
  width_hh1: 50,
  width_hh2: 50,
  height_v1: 66,
  height_v2: 34,
  height_vv1: 50,
  height_vv2: 50
}

// declare the state variables
// what is in position `where`
layoutcfg.wheres.forEach(k => {
  state[`what_${k}`] = null
})
// where is pane `what`
layoutcfg.whats.forEach(k => {
  state[`where_${k}`] = null
})
// where is layout
// NB: where_h might be useless
layoutcfg.layouts.forEach(k => {
  state[`where_${k}`] = null
})

const mutations = {
  setPaneLayout (state, layout) {
    state.paneLayout = layout
  }
}

// create mutations
layoutcfg.wheres.forEach(k => {
  mutations[`setWhat_${k}`] = (() => {
    return (state, payload) => {
      console.error(`STORE what_${k}`, payload)
      state[`what_${k}`] = payload
    }
  })()
})

layoutcfg.whats.forEach(k => {
  mutations[`setWhere_${k}`] = (() => {
    return (state, payload) => {
      state[`where_${k}`] = payload
    }
  })()
})

layoutcfg.layouts.forEach(k => {
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

const model = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export {model as default, layoutcfg}

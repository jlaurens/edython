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
    'V',
    'FH',
    'HF',
    'VF',
    'FV',
    'HH',
    'VV'
  ],
  fromLayout: {
    F: ['H', 'V'],
    H: {
      h1: ['F', 'VF', 'V'],
      h2: ['F', 'FV', 'V']
    },
    V: {
      v1: ['F', 'HF', 'H'],
      v2: ['F', 'FH', 'H']
    },
    HF: {
      f: ['F'],
      h1: ['F', 'H', 'V'],
      h2: ['F', 'H', 'V']
    },
    FH: {
      f: ['F'],
      hh1: ['F', 'H', 'V'],
      hh2: ['F', 'H', 'V']
    },
    VF: {
      f: ['F'],
      v1: ['F', 'H', 'V'],
      v2: ['F', 'H', 'V']
    },
    FV: {
      f: ['F'],
      vv1: ['F', 'H', 'V'],
      vv2: ['F', 'H', 'V']
    }
  }
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

const mutations = {
  setPaneLayout (state, layout) {
    state.paneLayout = layout
  }
}

// create mutations
layoutcfg.wheres.forEach(k => {
  mutations[`setWhat_${k}`] = (() => {
    return (state, payload) => {
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

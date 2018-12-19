const cfg = {
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
      h1: ['F', 'VF', 'V', 'FH'],
      h2: ['F', 'FV', 'V', 'FH']
    },
    V: {
      v1: ['F', 'HF', 'H', 'FV'],
      v2: ['F', 'FH', 'H', 'FV']
    },
    HF: {
      v2: ['F', 'FH', 'H'],
      h1: ['F', 'H', 'V', 'FH'],
      h2: ['F', 'H', 'V', 'FH']
    },
    FH: {
      v1: ['F', 'HF', 'H'],
      hh1: ['F', 'H', 'V', 'HF'],
      hh2: ['F', 'H', 'V', 'HF']
    },
    VF: {
      h2: ['F', 'FV', 'V'],
      v1: ['F', 'H', 'V', 'FV'],
      v2: ['F', 'H', 'V', 'FV']
    },
    FV: {
      h1: ['F', 'VF', 'V'],
      vv1: ['F', 'H', 'V', 'VF'],
      vv2: ['F', 'H', 'V', 'VF']
    },
    HH: {
      h1: ['F', 'H', 'FH'],
      h2: ['F', 'H', 'FH'],
      hh1: ['F', 'H', 'HF'],
      hh2: ['F', 'H', 'HF']
    },
    VV: {
      v1: ['F', 'V', 'FV'],
      v2: ['F', 'V', 'FV'],
      vv1: ['F', 'V', 'VF'],
      vv2: ['F', 'V', 'VF']
    }
  }
}

const state = {
  paneLayout: undefined, /* One of layouts */
  width_h1: 66,
  width_h2: 34,
  width_hh1: 50,
  width_hh2: 50,
  height_v1: 66,
  height_v2: 34,
  height_vv1: 50,
  height_vv2: 50,
  cfg: cfg
}

Object.defineProperties(cfg, {
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
  },
  prefs: {
    get () {
      var prefs = {
        layout: state.paneLayout
      }
      var wheres = this.fromLayout[prefs.layout]
      wheres && wheres.forEach(where => {
        var what = state[`what_${where}`]
        if (what) {
          prefs[where] = what
        }
      })
      return prefs
    }
  }
})
// declare the state variables
// what is in position `where`
cfg.wheres.forEach(k => {
  state[`what_${k}`] = null
})
// where is pane `what`
cfg.whats.forEach(k => {
  state[`where_${k}`] = null
})

const mutations = {
  setPaneLayout (state, layout) {
    state.paneLayout = layout
  }
}

// create mutations
cfg.wheres.forEach(k => {
  mutations[`setWhat_${k}`] = (() => {
    return (state, payload) => {
      state[`what_${k}`] = payload
    }
  })()
})

cfg.whats.forEach(k => {
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

export {model as default, cfg as layoutcfg}

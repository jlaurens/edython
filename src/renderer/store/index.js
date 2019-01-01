import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

import mutations from './mutations'
import modules from './modules'

Vue.use(Vuex)

// const whiteMutations = [
//   'selectMode'
// ]

const vuexLocalStorage = new VuexPersist({
  key: 'vuex', // The key to store the state on in the storage provider.
  storage: window.localStorage, // or window.sessionStorage or localForage
  // Function that passes the state and returns the state with only the objects you want to store.
  reducer: (state) => ({
    UI: state.UI,
    Layout: state.Layout,
    Pref: state.Pref
  })
  // Function that passes a mutation and lets you decide if it should update the state in localStorage.
  // filter: mutation => (whiteMutations.indexOf(mutation.type) >= 0) // Boolean
})

export default new Vuex.Store({
  mutations,
  modules,
  strict: process.env.NODE_ENV !== 'production',
  plugins: [vuexLocalStorage.plugin]
})

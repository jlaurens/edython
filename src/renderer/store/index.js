import Vue from 'vue'
import Vuex from 'vuex'

import mutations from './mutations'
import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
  mutations,
  modules,
  strict: process.env.NODE_ENV !== 'production',
  getPersistentContent: function () {
    return {
      test: 'coucou'
    }
  }
})

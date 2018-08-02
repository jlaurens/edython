import {app} from '../main'

export const mutations = {
  setLocale (state, payload) {
    app.$i18n.locale = payload
  }
}

import {app} from '../main'

export default {
  setLocale (state, payload) {
    app.$i18n.locale = payload
  }
}

import eYoI18n from '../lang'

export default {
    setLocale (state, payload) {
        eYoI18n.i18n.locale = payload
    }
}

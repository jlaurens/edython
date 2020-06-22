import VueI18n from 'vue-i18n'

import message_fr_FR from './fr_FR/message'
import toolbar_fr_FR from './fr_FR/toolbar'
import brick_fr_FR from './fr_FR/brick'
import panel_fr_FR from './fr_FR/panel'

const messages = {
  en_US: {
    message: {
      hello: 'hello world'
    }
  },
  fr_FR: {
    message: message_fr_FR,
    panel: panel_fr_FR,
    brick: brick_fr_FR,
    toolbar: toolbar_fr_FR
  }
}

const dateTimeFormats = {
  en_US: {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }
  },
  fr_FR: {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric'
    }
  }
}

const numberFormats = {
  en_US: {
    currency: {
      style: 'currency', currency: 'USD'
    },
    percent: {
      style: 'percent'
    }
  },
  fr_FR: {
    currency: {
      style: 'currency', currency: 'EUR'
    },
    percent: {
      style: 'percent'
    }
  }
}

const eYoI18n = {}

eYoI18n.install = function (Vue) {
  Vue.use(VueI18n)

  Vue.prototype.$$t = function (key, locale, value) {
    return this.$te(key, locale) && this.$t(key, locale, value)
  }
  Vue.prototype.$$tc = function (key, choice, locale, value) {
    return this.$te(key, locale) && this.$tc(key, choice, locale, value)
  }

  eYoI18n.i18n = new VueI18n({
    locale: 'fr_FR', // set locale
    fallbackLocale: 'fr_FR',
    messages, // set locale messages,
    dateTimeFormats,
    numberFormats
  })
}

export default eYoI18n

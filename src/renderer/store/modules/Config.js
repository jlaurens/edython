/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Configuration.
 * Work in progress.
 * Settings mechanism is as follow:
 * 1) we have 4 domains:
 * a) document domain, named Document
 * b) user domain
 * c) network domain
 * d) application domain, named Config
 * One given setting can be set in any of these domains,
 * and must be set in the application domain.
 * Actually domains b) and c) are not implemented.
 * 2) Rule to obtain the value of one given setting:
 * in general ask each of the domains in the order above
 * and return the first value that is explicitely set.
 * 3) Persistent storage: Those different settings are stored in different locations depending on the domain. The values are stored only when explicitely set.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */

const state = {
  ecoSave: true,
  noLeftSeparator: true,
  noDynamicList: false,
  smartUnary: true,
  disabledTips: false
}

const mutations = {
  CONFIG_SET_ECO_SAVE (state, yorn) {
    state.ecoSave = !!yorn
  },
  CONFIG_SET_NO_LEFT_SEPARATOR (state, yorn) {
    state.noLeftSeparator = !!yorn
    eYo.App.options.noLeftSeparator = !!yorn
  },
  CONFIG_SET_NO_DYNAMIC_LIST (state, yorn) {
    state.noDynamicList = !!yorn
    eYo.App.options.noDynamicList = !!yorn
  },
  CONFIG_SET_SMART_UNARY (state, yorn) {
    state.smartUnary = !!yorn
    eYo.App.options.smartUnary = !!yorn
  },
  CONFIG_SET_DISABLED_TIPS (state, yorn) {
    state.disabledTips = !!yorn
  }
}

const actions = {
}

const getters = {
}

export default {
  state,
  mutations,
  actions,
  getters
}

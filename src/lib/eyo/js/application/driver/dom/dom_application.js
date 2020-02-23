/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Application rendering driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.forwardDeclare('app')

/**
 * Dom driver for application.
 */
eYo.dom.makeDriverC9r('App', {
  /**
   * Initialize the application's dom ressources.
   * @param {eYo.app.Base} app
   * @param {Function} [f]
   * @return {!Element} The desk's dom repository.
   */
  initUI (app) {
    var dom = app.dom
    var options = app.options
    // Load CSS.
    eYo.css.inject(options.hasCss, options.pathToMedia)
    var container = options.container
    // no UI if no valid container
    if (eYo.isStr(container)) {
      container = options.container = document.getElementById(container) ||
          document.querySelector(container)
    }
    if (!goog.dom.contains(document, container)) {
      throw 'Error: container is not in current document.'
    }
    var div = dom.div_ || (dom.div_= container)
    div.dataset && (div.dataset.type = `edython application`)
  },
  /**
   * Dispose of the application dom resources.
   * @param {eYo.app.Base} app
   */
  disposeUI (app) {
    var dom = app.dom
    goog.dom.removeNode(dom.div_)
    dom.div_ = null
  }
})

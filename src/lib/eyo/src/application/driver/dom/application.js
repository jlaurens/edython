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

goog.require('eYo.Dom')

goog.provide('eYo.Dom.Application')

goog.forwardDeclare('eYo.Application')

/**
 * Dom driver for application.
 */
eYo.Dom.makeSubclass('Application')

/**
 * Initialize the desk dom ressources.
 * @param {!eYo.Application} app
 * @param {?Function} f
 * @return {!Element} The desk's dom repository.
 */
eYo.Dom.Application.prototype.initUI = eYo.Dom.Decorate.initUI(function(app) {
  var dom = app.dom
  var options = app.options
  // Load CSS.
  eYo.Css.inject(options.hasCss, options.pathToMedia)
  var container = options.container
  // no UI if no valid container
  if (goog.isString(container)) {
    container = options.container = document.getElementById(container) ||
        document.querySelector(container)
  }
  if (!goog.dom.contains(document, container)) {
    throw 'Error: container is not in current document.'
  }
  var div = dom.div_ || (dom.div_= container)
  div.dataset && (div.dataset.type = `edython application`)
})

/**
 * Dispose of the application dom resources.
 * @param {!eYo.Application} app
 */
eYo.Dom.Application.prototype.disposeUI = eYo.Dom.Decorate.disposeUI(function(app) {
  var dom = app.dom
  goog.dom.removeNode(dom.div_)
  dom.div_ = null
})

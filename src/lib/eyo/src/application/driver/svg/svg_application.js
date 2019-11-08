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

goog.provide('eYo.Svg.Application')

goog.require('eYo.Svg')

goog.forwardDeclare('eYo.Application')

/**
 * Dispose of the application UI.
 * @param {!eYo.DnD.Mgr} mgr  The application we must dispose of the UI of.
 */
eYo.Driver.Application.prototype.disposeUI = eYo.Do.nothing

/**
 * Initialize the desk dom ressources.
 * @param {!eYo.Application} app
 * @param {?Function} f
 * @return {!Element} The desk's dom repository.
 */
eYo.Dom.Application.prototype.initUI = eYo.Dom.decorateInit(function(app) {
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
eYo.Dom.Application.prototype.disposeUI = eYo.Dom.decorateDispose(function(app) {
  var dom = app.dom
  goog.dom.removeNode(dom.div_)
  dom.div_ = null
})

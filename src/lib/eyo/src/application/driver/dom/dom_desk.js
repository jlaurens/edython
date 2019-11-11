/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Desk rendering driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Dom')

goog.provide('eYo.Dom.Desk')

goog.forwardDeclare('eYo.Desk')

/**
 * Dom driver for boards.
 */
eYo.Dom.makeDriverClass('Desk')

/**
 * Initialize the desk dom ressources.
 * @param {!eYo.Desk} desk
 * @param {?Function} f
 * @return {!Element} The desk's dom repository.
 */
eYo.Dom.Desk.prototype.initUI = eYo.Dom.Decorate.initUI(function(desk) {
  var dom = desk.dom
  var options = desk.options
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
  eYo.Dom.bindEvent(
    container,
    'contextmenu',
    e => eYo.Dom.isTargetInput(e) || e.preventDefault()
  )
  // var d = dom.div_ = goog.dom.createDom(
  //   goog.dom.TagName.DIV,
  //   'eyo-desk'
  // )
  // var stl = d.style
  // stl.overflow = 'hidden'
  // stl.position = 'absolute'
  // stl.width = '100%'
  // stl.height = '100%'
  // div.appendChild(d)
})

/**
 * Dispose of the desk dom resources.
 * @param {!eYo.Desk} desk
 */
eYo.Dom.Desk.prototype.disposeUI = eYo.Dom.Decorate.disposeUI(function(desk) {
  var dom = desk.dom
  goog.dom.removeNode(dom.div_)
  dom.div_ = null
})

/**
 * Place the desk div.
 * @param {!eYo.Desk} desk
 */
eYo.Dom.Desk.prototype.place = function(desk) {
}

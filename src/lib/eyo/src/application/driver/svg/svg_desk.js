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

goog.provide('eYo.Svg.Desk')

goog.require('eYo.Svg')

goog.forwardDeclare('eYo.Desk')

/**
 * Initialize the desk dom ressources.
 * @param {!eYo.Desk} desk
 * @param {?Function} f
 * @return {!Element} The desk's dom repository.
 */
eYo.Dom.Desk.prototype.initUI = eYo.Dom.decorateInit(function(desk) {
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
  var d = dom.board_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    'eyo-board'
  )
  var stl = d.style
  stl.overflow = 'hidden'
  stl.position = 'absolute'
  stl.width = '100%'
  stl.height = '100%'
  div.appendChild(d)
  desk.board_.makeUI(d)
})

/**
 * Dispose of the desk dom resources.
 * @param {!eYo.Desk} desk
 */
eYo.Dom.Desk.prototype.disposeUI = eYo.Dom.decorateDispose(function(desk) {
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

/**
 * Initialize the desk SVG ressources.
 * @param {!eYo.Desk} desk
 * @return {!Element} The desk's SVG group.
 */
eYo.Svg.Desk.prototype.initUI = function(desk) {
  if (desk.dom) {
    return
  }
  var dom = eYo.Svg.superClass_.deskInit.call(this, desk)
  this.bind_resize(desk)
}

/**
 * Bind the resize element.
 * @param {!eYo.Board} board
 */
eYo.Svg.Desk.prototype.bind_resize = function (desk) {
  var bound = desk.dom.bound || Object.create(null)
  if (bound.resize) {
    return
  }
  bound.resize = eYo.Dom.bindEvent(
    window,
    'resize',
    null,
    () => {
      eYo.app.hideChaff()
      desk.updateMetrics()
    }
  )
}

/**
 * Set the display mode for bricks.
 * Used to draw bricks lighter or not,
 * by adding/removing a class on the main div.
 * @param {!eYo.Desk} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.Desk.prototype.setBrickDisplayMode = function (desk, mode) {
  var div = desk.dom.div_
  var old = desk.currentBrickDisplayMode
  old && (goog.dom.classlist.remove(div, `eyo-${old}`))
  if ((desk.currentBrickDisplayMode = mode)) {
    goog.dom.classlist.add(div, `eyo-${mode}`)
  }
}

/**
 * Size the main board to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
 * @param {!eYo.Desk} desk A desk.
 */
eYo.Svg.Desk.prototype.updateMetrics = function(desk) {
  // After the change, the selection should be visible if it was.
  desk.viewRect = desk.dom.div_.getBoundingClientRect()
  console.error('desk size', desk.dom.div_.getBoundingClientRect())
}

/**
 * Return the coordinates of the top-left corner of this element relative to
 * the div containing the desk.
 * @param {!eYo.Desk}
 * @param {!Element} element SVG element to find the coordinates of. If this is
 *     not a child of the div blockly was injected into, the behaviour is
 *     eYo.VOID.
 * @return {!eYo.Where} Object with .x and .y properties.
 */
eYo.Svg.Desk.prototype.whereElement = function(desk, element) {
  var ans = new eYo.Where()
  var div = desk.dom.div_
  while (element && element !== div) {
    ans.scale(eYo.Svg.getScale_(element))
    .forward(eYo.Svg.getRelativeWhere(element))
    element = element.parentNode
  }
  return ans
}

/**
 * Initialize the desk's flyout SVG ressources.
 * @param {!eYo.Desk} desk
 * @return {!Element} The desk's SVG group.
 */
eYo.Svg.Desk.prototype.installFlyout = function(desk) {
}


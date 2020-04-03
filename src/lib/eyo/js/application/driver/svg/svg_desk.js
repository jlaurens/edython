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

eYo.require('dom.Desk')

eYo.forward('view.Desk')

/**
 * Svg driver for desk.
 */
eYo.svg.makeDriverC9r('Desk', {
  /**
   * Initialize the desk SVG ressources.
   * @param {eYo.view.Desk} desk
   * @return {!Element} The desk's SVG group.
   */
  initUI (desk) {
    this.bind_resize(desk)
  },
})

/**
 * Bind the resize element.
 * @param {eYo.board} board
 */
eYo.svg.Desk_p.bind_resize = function (desk) {
  var bound = desk.dom.bound || Object.create(null)
  if (bound.resize) {
    return
  }
  bound.resize = eYo.dom.bindEvent(
    window,
    'resize',
    null,
    () => {
      desk.app.hideChaff()
      desk.updateMetrics()
    }
  )
}

/**
 * Set the display mode for bricks.
 * Used to draw bricks lighter or not,
 * by adding/removing a class on the main div.
 * @param {eYo.view.Desk} mode  The display mode for bricks.
 * @param {String} mode  The display mode for bricks.
 */
eYo.svg.Desk_p.setBrickDisplayMode = function (desk, mode) {
  var div = desk.dom.div_
  var old = desk.currentBrickDisplayMode
  old && (eYo.dom.classlist.remove(div, `eyo-${old}`))
  if ((desk.currentBrickDisplayMode = mode)) {
    eYo.dom.classlist.add(div, `eyo-${mode}`)
  }
}

/**
 * Size the main board to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
 * @param {eYo.view.Desk} desk A desk.
 */
eYo.svg.Desk_p.updateMetrics = function(desk) {
  // After the change, the selection should be visible if it was.
  desk.viewRect = desk.dom.div_.getBoundingClientRect()
  console.error('desk size', desk.dom.div_.getBoundingClientRect())
}

/**
 * Return the coordinates of the top-left corner of this element relative to
 * the div containing the desk.
 * @param {eYo.view.Desk}
 * @param {Element} element SVG element to find the coordinates of. If this is
 *     not a child of the div blockly was injected into, the behaviour is
 *     eYo.NA.
 * @return {!eYo.geom.Point} Object with .x and .y properties.
 */
eYo.svg.Desk_p.whereElement = function(desk, element) {
  var ans = new eYo.geom.Point()
  var div = desk.dom.div_
  while (element && element !== div) {
    ans.scale(eYo.svg.getScale_(element))
    .forward(eYo.svg.getRelativeWhere(element))
    element = element.parentNode
  }
  return ans
}

/**
 * Initialize the desk's flyout SVG ressources.
 * @param {eYo.view.Desk} desk
 * @return {!Element} The desk's SVG group.
 */
eYo.svg.Desk_p.installFlyout = function(desk) {
}


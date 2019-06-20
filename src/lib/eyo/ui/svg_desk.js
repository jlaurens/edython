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
eYo.Dom.prototype.deskInit = eYo.Dom.decorateInit(function(desk) {
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
  /*
  <div>
    <div class='eyo-board-div'/>
    <div class='eyo-flyout-div'/>
  </div>
  */
  var x = dom.board_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    'eyo-board-div'
  )
  div.appendChild(x)  
  var x = dom.flyout_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    'eyo-flyout-div'
  )
  x.style.display = 'none'
  div.appendChild(x)
})

/**
 * Dispose of the desk dom resources.
 * @param {!eYo.Desk} desk
 */
eYo.Dom.prototype.deskDispose = eYo.Dom.decorateDispose(function(desk) {
  var dom = desk.dom
  goog.dom.removeNode(dom.div_)
  dom.div_ = null
})

/**
 * Initialize the desk SVG ressources.
 * @param {!eYo.Desk} desk
 * @return {!Element} The desk's SVG group.
 */
eYo.Svg.prototype.deskInit = function(desk) {
  if (desk.dom) {
    return
  }
  var dom = eYo.Svg.superClass_.deskInit.call(this, desk)
  var svg = dom.svg = Object.create(null)
  // Build the SVG DOM. The order
  // in the dom is important because things are layered.
  var div = dom.div_
  // main board
  /*
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns: html="http://www.w3.org/1999/xhtml"
    xmlns: xlink="http://www.w3.org/1999/xlink"
    version="1.1"
    class="eyo-svg">
    ...
  </svg>
  */
  if (eYo.Dom.is3dSupported) {
    svg.boardDragSurface = new eYo.Svg.BoardDragSurface(dom.div_)
    svg.brickDragSurface = new eYo.Svg.BrickDragSurface(dom.div_)
  }
  this.deskBind_resize(desk)
}

/**
 * Bind the resize element.
 * @param {!eYo.Board} board
 */
eYo.Svg.prototype.deskBind_resize = function (desk) {
  var bound = desk.dom.bound || Object.create(null)
  if (bound.resize) {
    return
  }
  bound.resize = eYo.Dom.bindEvent(
    window,
    'resize',
    null,
    () => {
      eYo.App.hideChaff()
      desk.updateMetrics()
    }
  )
}

/**
 * Set the display mode for bricks.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Desk} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.deskSetBrickDisplayMode = function (desk, mode) {
  var canvas = desk.dom.svg.canvas_
  desk.currentBrickDisplayMode && (goog.dom.classlist.remove(canvas, `eyo-${desk.currentBrickDisplayMode}`))
  if ((desk.currentBrickDisplayMode = mode)) {
    goog.dom.classlist.add(canvas, `eyo-${desk.currentBrickDisplayMode}`)
  }
}

/**
 * Size the main board to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
 * See eYo.Svg.boardResizeContents to resize the board when the contents
 * change (e.g. when a block is added or removed).
 * @param {!eYo.Desk} desk A desk.
 */
eYo.Svg.prototype.deskUpdateMetrics = function(desk) {
  // TODO: when changing the metrics, keep track of the selected brick/magnet
  // After the change, the selection should be visible if it was.
  desk.viewRect = desk.dom.div_.getBoundingClientRect()
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
eYo.Svg.prototype.deskWhereElement = function(desk, element) {
  var ans = new eYo.Where()
  var div = desk.dom.div_
  while (element && element !== div) {
    ans.scale(eYo.Svg.getScale_(element))
    .forward(eYo.Svg.getRelativeWhere(element))
    element = element.parentNode
  }
  return ans
}

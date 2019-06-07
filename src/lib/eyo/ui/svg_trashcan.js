/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Board rendering driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Trashcan')

goog.require('eYo.Svg')
goog.forwardDeclare('eYo.Trashcan')

/**
 * Initialize the trashcan SVG ressources.
 * @param {!eYo.Trashcan} trashcan
 * @param {?Object} options
 * @return {!Element} The trashcan's SVG group.
 */
eYo.Svg.prototype.trashcanInit = function(trashcan, options) {
  if (trashcan.dom) {
    return
  }
  var svg = trashcan.dom.svg
  svg.state_ = svg.left_ = svg.top_ = 0
  /* Here's the markup that will be generated:
  <g class="eyo-trash">
    <clippath id="eyo-trash-body-clip-837493">
      <rect width="47" height="45" y="15"></rect>
    </clippath>
    <image width="64" height="92" y="-32" xlink:href="media/sprites.png"
        clip-path="url(#eyo-trash-body-clip-837493)"></image>
    <clippath id="eyo-trash-lid-clip-837493">
      <rect width="47" height="15"></rect>
    </clippath>
    <image width="84" height="92" y="-32" xlink:href="media/sprites.png"
        clip-path="url(#eyo-trash-lid-clip-837493)"></image>
  </g>
  */
  var g = svg.group_ = eYo.Svg.newElement(
    'g',
    {class: 'eyo-trash'},
    null
  )
  var rnd = String(Math.random()).substring(2)
  var clip = eYo.Svg.newElement(
    'clipPath',
    {id: 'eyo-trash-body-clip-' + rnd},
    g
  )
  eYo.Svg.newElement('rect', {
    width: trashcan.WIDTH_,
    height: trashcan.BODY_HEIGHT_,
    y: trashcan.LID_HEIGHT_
  }, clip)
  var body = eYo.Svg.newElement('image', {
    width: Blockly.SPRITE.width,
    x: -trashcan.SPRITE_LEFT_,
    height: Blockly.SPRITE.height,
    y: -trashcan.SPRITE_TOP_,
    'clip-path': 'url(#eyo-trash-body-clip-' + rnd + ')'
  }, g)
  var url = trashcan.board_.options.pathToMedia + Blockly.SPRITE.url
  body.setAttributeNS(
    eYo.Dom.XLINK_NS,
    'xlink:href',
    url
  )
  clip = eYo.Svg.newElement(
    'clipPath',
    {id: 'eyo-trash-lid-clip-' + rnd},
    g
  )
  eYo.Svg.newElement(
    'rect',
    {
      width: trashcan.WIDTH_,
      height: trashcan.LID_HEIGHT_
    },
    clip
  )
  var lid = svg.lid_ = eYo.Svg.newElement(
    'image',
    {
      width: Blockly.SPRITE.width,
      x: -trashcan.SPRITE_LEFT_,
      height: Blockly.SPRITE.height,
      y: -trashcan.SPRITE_TOP_,
      'clip-path': 'url(#eyo-trash-lid-clip-' + rnd + ')'
    },
    g
  )
  lid.setAttributeNS(
    eYo.Dom.XLINK_NS,
    'xlink:href',
    url
  )
  dom.bound.mouseup = eYo.Dom.bindEvent(
    g,
    'mouseup',
    null,
    this.trashcanOn_mouseup.bind(trashcan)
  )
  svg = this.board_.dom.svg
  svg.group_.insertBefore(g, svg.canvas_)

  trashcan.animateLid_()
  
  return g
}

/**
 * Initializes the trashcan SVG ressources.
 * @param {!eYo.Trashcan} trashcan
 */
eYo.Svg.prototype.trashcanDispose = function(trashcan) {
  var dom = trashcan.dom
  if (dom) {
    goog.Timer.clear(dom.lidTask)
    dom.lidTask = 0
    eYo.Dom.clearBoundEvents(trashcan)
    var svg = dom.svg
    if (svg) {
      goog.dom.removeNode(svg.group_)
      svg.group_ = null
      svg.lid_ = null
    }
    this.basicDispose(trashcan)
  }
}

/**
 * Inspect the contents of the trash.
 */
eYo.Svg.prototype.trashcanOn_mouseup = function(trashcan) {
  var brd = trashcan.board_
  if (brd.startScroll.backward(brd.scroll).magnitude > eYo.Gesture.DRAG_RADIUS) {
    return
  }
}

/**
 * Initializes the trashcan SVG ressources.
 * @param {!eYo.Trashcan} trashcan
 */
eYo.Svg.prototype.trashcanPlace = function(trashcan) {
  var r = trashcan.viewRect
  trashcan.dom.svg.group_.setAttribute(
    'transform',
    `translate(${r.left_},${r.top_})`
  )
}

/**
 * Flip the lid open or shut.
 * @param {!eYo.Trashcan} trashcan
 * @param {boolean} state True if open.
 * @private
 */
eYo.Svg.prototype.trashcanSetOpen = function(trashcan, state) {
  var dom = trashcan.dom
  if (dom.isOpen == state) {
    return
  }
  goog.Timer.clear(dom.lidTask_)
  dom.isOpen = state;
  this.trashcansAnimate(trashcan)
}

/**
 * Rotate the lid open or closed by one step.  Then wait and recurse.
 * @param {!eYo.Trashcan} trashcan
 */
eYo.Svg.prototype.trashcanAnimate = function(trashcan) {
  var dom = trashcan.dom
  dom.state_ += dom.isOpen ? 0.2 : -0.2
  dom.state_ = goog.math.clamp(dom.state_, 0, 1)
  var angle = dom.state_ * 45
  dom.svg.lid_.setAttribute(
    'transform',
    `rotate(${angle},${dom.WIDTH_ - 4},${dom.LID_HEIGHT_ - 2})`
  )
  var opacity = goog.math.lerp(0.4, 0.8, dom.state_)
  dom.svg.group_.style.opacity = opacity
  if (dom.state_ > 0 && dom.state_ < 1) {
    dom.lidTask_ = goog.Timer.callOnce(() => {
      this.trashcanAnimate(trashcan)
    }, 20)
  }
}

/**
 * Return the deletion rectangle for the given trash can.
 * @param {!eYo.Trashcan} trashcan
 */
eYo.Svg.prototype.trashcanClientRect = function(trashcan) {
  var svg = thashcan.dom.svg
  var trashRect = svg.group_.getBoundingClientRect()
  var left = trashRect.left + trashcan.SPRITE_LEFT_ - trashcan.MARGIN_HOTSPOT_
  var top = trashRect.top + trashcan.SPRITE_TOP_ - trashcan.MARGIN_HOTSPOT_
  var width = trashcan.WIDTH_ + 2 * trashcan.MARGIN_HOTSPOT_;
  var height = trashcan.LID_HEIGHT_ + trashcan.BODY_HEIGHT_ + 2 * trashcan.MARGIN_HOTSPOT_
  return eYo.Rect.xy(left, top, width, height)
}


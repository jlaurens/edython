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

eYo.require('eYo.NS_Svg')

eYo.forwardDeclare('eYo.TrashCan')

/**
 * Svg driver fro the trash can.
 */
eYo.NS_Svg.makeDriverClass('TrashCan', {
    /**
   * Initialize the trash can SVG ressources.
   * @param {eYo.TrashCan} trashCan
   * @param {Object} [options]
   * @return {!Element} The trash can's SVG group.
   */
  initUI (trashCan, options) {
    var dom = trashCan.dom
    var svg = dom.svg = Object.create(null)
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
    var g = svg.group_ = eYo.NS_Svg.newElement(
      'g',
      {class: 'eyo-trash'},
      null
    )
    var rnd = String(Math.random()).substring(2)
    var clip = eYo.NS_Svg.newElement(
      'clipPath',
      {id: 'eyo-trash-body-clip-' + rnd},
      g
    )
    eYo.NS_Svg.newElement('rect', {
      width: trashCan.WIDTH_,
      height: trashCan.BODY_HEIGHT_,
      y: trashCan.LID_HEIGHT_
    }, clip)
    var body = eYo.NS_Svg.newElement('image', {
      width: Blockly.SPRITE.width,
      x: -trashCan.SPRITE_LEFT_,
      height: Blockly.SPRITE.height,
      y: -trashCan.SPRITE_TOP_,
      'clip-path': 'url(#eyo-trash-body-clip-' + rnd + ')'
    }, g)
    var url = trashCan.board_.options.pathToMedia + Blockly.SPRITE.url
    body.setAttributeNS(
      eYo.NS_Dom.XLINK_NS,
      'xlink:href',
      url
    )
    clip = eYo.NS_Svg.newElement(
      'clipPath',
      {id: 'eyo-trash-lid-clip-' + rnd},
      g
    )
    eYo.NS_Svg.newElement(
      'rect',
      {
        width: trashCan.WIDTH_,
        height: trashCan.LID_HEIGHT_
      },
      clip
    )
    var lid = svg.lid_ = eYo.NS_Svg.newElement(
      'image',
      {
        width: Blockly.SPRITE.width,
        x: -trashCan.SPRITE_LEFT_,
        height: Blockly.SPRITE.height,
        y: -trashCan.SPRITE_TOP_,
        'clip-path': 'url(#eyo-trash-lid-clip-' + rnd + ')'
      },
      g
    )
    lid.setAttributeNS(
      eYo.NS_Dom.XLINK_NS,
      'xlink:href',
      url
    )
    dom.bound.mouseup = eYo.NS_Dom.bindEvent(
      g,
      'mouseup',
      null,
      this.trashCanOn_mouseup.bind(trashCan)
    )
    svg = trashCan.board_.dom.svg
    svg.group_.insertBefore(g, svg.canvas_)
    
    return g
  },
  /**
   * Initializes the trash can SVG ressources.
   * @param {eYo.TrashCan} trashCan
   */
  disposeUIMake (trashCan) {
    var dom = trashCan.dom
    if (dom) {
      goog.Timer.clear(dom.lidTask)
      dom.lidTask = 0
      eYo.NS_Dom.clearBoundEvents(trashCan)
      var svg = dom.svg
      if (svg) {
        goog.dom.removeNode(svg.group_)
        svg.group_ = null
        svg.lid_ = null
      }
      this._disposeUI(trashCan)
    }
  },
})

/**
 * Inspect the contents of the trash.
 */
eYo.NS_Svg.TrashCan.prototype.on_mouseup = function(trashCan) {
  var brd = trashCan.board
  if (brd.startDrag.backward(brd.drag).magnitude > eYo.Motion.DRAG_RADIUS) {
    return
  }
}

/**
 * Initializes the trashCan SVG ressources.
 * @param {eYo.TrashCan} trashCan
 */
eYo.NS_Svg.TrashCan.prototype.place = function(trashCan) {
  var r = trashCan.viewRect
  trashCan.dom.svg.group_.setAttribute(
    'transform',
    `translate(${r.left},${r.top})`
  )
}

/**
 * Is the lid open or shut.
 * @param {eYo.TrashCan} trashCan
 * @private
 */
eYo.NS_Svg.TrashCan.prototype.openGet = function(trashCan) {
  return trashCan.dom.isOpen
}

/**
 * Flip the lid open or shut.
 * @param {eYo.TrashCan} trashCan
 * @param {boolean} state True if open.
 * @private
 */
eYo.NS_Svg.TrashCan.prototype.openSet = function(trashCan, state) {
  var dom = trashCan.dom
  if (dom.isOpen == state) {
    return
  }
  var svg = dom.svg
  goog.Timer.clear(svg.lidTask_)
  dom.isOpen = state
  this.animate(trashCan)
}

/**
 * Rotate the lid open or closed by one step.  Then wait and recurse.
 * @param {eYo.TrashCan} trashCan
 */
eYo.NS_Svg.TrashCan.prototype.animate = function(trashCan) {
  var dom = trashCan.dom
  var svg = dom.svg
  svg.state_ += dom.isOpen ? 0.2 : -0.2
  svg.state_ = goog.math.clamp(svg.state_, 0, 1)
  var angle = svg.state_ * 45
  svg.lid_.setAttribute(
    'transform',
    `rotate(${angle},${trashCan.WIDTH_ - 4},${trashCan.LID_HEIGHT_ - 2})`
  )
  var opacity = goog.math.lerp(0.4, 0.8, svg.state_)
  dom.svg.group_.style.opacity = opacity
  if (svg.state_ > 0 && svg.state_ < 1) {
    svg.lidTask_ = goog.Timer.callOnce(() => {
      this.animate(trashCan)
    }, 20)
  }
}

/**
 * Return the deletion rectangle for the given trash can.
 * @param {eYo.TrashCan} trashCan
 */
eYo.NS_Svg.TrashCan.prototype.clientRect = function(trashCan) {
  var svg = trashCan.dom.svg
  var rect = svg.group_.getBoundingClientRect()
  var left = rect.left + trashCan.SPRITE_LEFT_ - trashCan.MARGIN_HOTSPOT_
  var top = rect.top + trashCan.SPRITE_TOP_ - trashCan.MARGIN_HOTSPOT_
  var width = trashCan.WIDTH_ + 2 * trashCan.MARGIN_HOTSPOT_;
  var height = trashCan.LID_HEIGHT_ + trashCan.BODY_HEIGHT_ + 2 * trashCan.MARGIN_HOTSPOT_
  return eYo.Rect.xy(left, top, width, height)
}


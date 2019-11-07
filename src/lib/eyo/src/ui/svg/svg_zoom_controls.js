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

goog.provide('eYo.Svg.ZoomControl')

goog.require('eYo.Svg')

goog.forwardDeclare('eYo.Zoomer')

/**
 * Initialize the board's controls.
 * @param {!eYo.Zoomer} constrols
 * @return {!Element} The controls's SVG group.
 */
eYo.Svg.prototype.zoomerInit = function(controls) {
  var board = controls.board_
  var dom = board.dom
  var svg = dom.svg
  var g = svg.zoom_
  if (g) {
    return
  }
   /* Here's the markup that will be generated:
  <g class="eyo-zoom">
    <clippath id="eyo-zoomout-clip-path837493">
      <rect width="32" height="32" y="77"></rect>
    </clippath>
    <image width="96" height="124" x="-64" y="-15" xlink:href="media/sprites.png"
        clip-path="url(#eyo-zoomout-clip-path837493)"></image>
    <clippath id="eyo-zoomin-clip-path837493">
      <rect width="32" height="32" y="43"></rect>
    </clippath>
    <image width="96" height="124" x="-32" y="-49" xlink:href="media/sprites.png"
        clip-path="url(#eyo-zoomin-clip-path837493)"></image>
    <clippath id="eyo-zoom-reset-clip-path837493">
      <rect width="32" height="32"></rect>
    </clippath>
    <image width="96" height="124" y="-92" xlink:href="media/sprites.png"
        clip-path="url(#eyo-zoom-reset-clip-path837493)"></image>
  </g>
  */
  g = svg.zoom_ = eYo.Svg.newElement(
   'g',
    {class: 'eyo-zoom'},
    svg.group_
  )
  var rnd = String(Math.random()).substring(2)
  var clip;
 
  clip = eYo.Svg.newElement(
    'clipPath',
    {id: 'eyo-zoomout-clip-path' + rnd},
    g
  )
  eYo.Svg.newElement(
    'rect',
    {
      width: 32,
      height: 32,
      y: 77
    },
    clip
  )
  var zoomoutSvg = eYo.Svg.newElement(
    'image',
    {
      width: eYo.SPRITE.width,
      height: eYo.SPRITE.height,
      x: -64,
      y: -15,
      'clip-path': `url(#eyo-zoomout-clip-path${rnd})`
    },
    g
  )
  zoomoutSvg.setAttributeNS(
    eYo.Dom.XLINK_NS,
    'xlink:href',
    board.options.pathToMedia + eYo.SPRITE.url
  )
  clip = eYo.Svg.newElement(
    'clipPath',
    {
      id: 'eyo-zoomin-clip-path' + rnd
    },
    g
  )
  eYo.Svg.newElement(
    'rect',
    {width: 32, height: 32, y: 43},
    clip
  )
  var zoominSvg = eYo.Svg.newElement(
    'image',
    {
      width: eYo.SPRITE.width,
      height: eYo.SPRITE.height,
      x: -32,
      y: -49,
      'clip-path': `url(#eyo-zoomin-clip-path${rnd})`
    },
    g
  )
  zoominSvg.setAttributeNS(
    eYo.Dom.XLINK_NS,
    'xlink:href',
    board.options.pathToMedia + eYo.SPRITE.url
  )
  clip = eYo.Svg.newElement(
    'clipPath',
    {id: 'eyo-zoom-reset-clip-path' + rnd},
    g
  )
  eYo.Svg.newElement(
    'rect',
    {width: 32, height: 32},
    clip
  )
  var zoomresetSvg = eYo.Svg.newElement(
    'image',
    {
      width: eYo.SPRITE.width,
      height: eYo.SPRITE.height, y: -92,
      'clip-path': `url(#eyo-zoom-reset-clip-path${rnd})`
    },
    g
  )
  zoomresetSvg.setAttributeNS(
    eYo.Dom.XLINK_NS,
    'xlink:href',
    board.options.pathToMedia + eYo.SPRITE.url
  )
  // Attach event listeners.
  var bound = dom.bound
  bound.zoomreset = eYo.Dom.bindEvent(
    zoomresetSvg,
    'mousedown',
    e => {
      board.markFocused()
      board.scale = board.options.zoom.startScale
      board.scrollCenter()
      eYo.Dom.clearTouchIdentifier()  // Don't block future drags.
      eYo.Dom.gobbleEvent(e)
    }
  )
  bound.zoomin = eYo.Dom.bindEvent(
    zoominSvg,
    'mousedown',
    e => {
      board.markFocused()
      board.zoomCenter(1)
      eYo.Dom.clearTouchIdentifier()  // Don't block future drags.
      eYo.Dom.gobbleEvent(e)
    }
  )
  bound.zoomout = eYo.Dom.bindEvent(
    zoomoutSvg,
    'mousedown',
    e => {
      board.markFocused();
      board.zoomCenter(-1)
      eYo.Dom.clearTouchIdentifier()  // Don't block future drags.
      eYo.Dom.gobbleEvent(e)
    }
  )
  return g
}

/**
 * Dispose of the zoom controls SVG ressources.
 * @param {!eYo.Zoomer} constrols
 */
eYo.Svg.prototype.zoomerDispose = function(controls) {
  var board = controls.board_
  var dom = board.dom
  var svg = dom.svg
  var g = svg.zoom_
  if (!g) {
    return
  }
  var bound = dom.bound
  // Attach event listeners.
  bound.zoomreset = eYo.Dom.unbindEvent(bound.zoomreset)
  bound.zoomin = eYo.Dom.unbindEvent(bound.zoomin)
  bound.zoomout = eYo.Dom.unbindEvent(bound.zoomout)
  goog.dom.removeNode(svg.zoom_)
  svg.zoom_ = null
}

/**
 * Position of the zoom controls.
 * @param {!eYo.Zoomer} controls
 */
eYo.Svg.prototype.zoomerPlace = function(controls) {
  controls.board_.dom.svg.zoom_.setAttribute(
    'transform',
    `translate(${controls.left_},${controls.top_})`
  )
}



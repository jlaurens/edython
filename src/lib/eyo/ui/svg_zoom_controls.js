/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Workspace rendering driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Workspace')

goog.require('eYo.Svg')
goog.forwardDeclare('eYo.Workspace')

/**
 * Initialize the workspace SVG ressources.
 * @param {!eYo.ZoomControls} constrols
 * @return {!Element} The controls's SVG group.
 */
eYo.Svg.prototype.zoomControlsInit = function(controls) {
  var workspace = controls.workspace_
  var dom = workspace.dom
  var svg = dom.svg
  var g = svg.zoom_
  if (g) {
    return
  }
   /* Here's the markup that will be generated:
  <g class="blocklyZoom">
    <clippath id="blocklyZoomoutClipPath837493">
      <rect width="32" height="32" y="77"></rect>
    </clippath>
    <image width="96" height="124" x="-64" y="-15" xlink:href="media/sprites.png"
        clip-path="url(#blocklyZoomoutClipPath837493)"></image>
    <clippath id="blocklyZoominClipPath837493">
      <rect width="32" height="32" y="43"></rect>
    </clippath>
    <image width="96" height="124" x="-32" y="-49" xlink:href="media/sprites.png"
        clip-path="url(#blocklyZoominClipPath837493)"></image>
    <clippath id="blocklyZoomresetClipPath837493">
      <rect width="32" height="32"></rect>
    </clippath>
    <image width="96" height="124" y="-92" xlink:href="media/sprites.png"
        clip-path="url(#blocklyZoomresetClipPath837493)"></image>
  </g>
  */
  g = svg.zoom_ = eYo.Svg.newElement(
   'g',
    {class: 'blocklyZoom'},
    svg.group_
  )
  
  var rnd = String(Math.random()).substring(2)
  var clip;
 
  clip = eYo.Svg.newElement(
    'clipPath',
    {'id': 'blocklyZoomoutClipPath' + rnd},
    g
  )
  eYo.Svg.newElement(
    'rect',
    {'width': 32, 'height': 32, 'y': 77},
    clip
  )
  var zoomoutSvg = eYo.Svg.newElement(
    'image',
    {
      width: eYo.SPRITE.width,
      height: eYo.SPRITE.height,
      x: -64,
      y: -15,
      'clip-path': `url(#blocklyZoomoutClipPath${rnd})`
    },
    g
  )
  zoomoutSvg.setAttributeNS(
    eYo.Dom.XLINK_NS,
    'xlink:href',
    workspace.options.pathToMedia + eYo.SPRITE.url
  )
  clip = eYo.Svg.newElement(
    'clipPath',
    {'id': 'blocklyZoominClipPath' + rnd},
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
      'clip-path': `url(#blocklyZoominClipPath${rnd})`
    },
    g
  )
  zoominSvg.setAttributeNS(
    eYo.Dom.XLINK_NS,
    'xlink:href',
    workspace.options.pathToMedia + eYo.SPRITE.url
  )
  clip = eYo.Svg.newElement(
    'clipPath',
    {id: 'blocklyZoomresetClipPath' + rnd},
    g
  )
  eYo.Svg.newElement(
    'rect',
    {'width': 32, 'height': 32},
    clip
  )
  var zoomresetSvg = eYo.Svg.newElement(
    'image',
    {
      width: eYo.SPRITE.width,
      height: eYo.SPRITE.height, 'y': -92,
      'clip-path': `url(#blocklyZoomresetClipPath${rnd})`
    },
    g
  )
  zoomresetSvg.setAttributeNS(
    eYo.Dom.XLINK_NS,
    'xlink:href',
    workspace.options.pathToMedia + eYo.SPRITE.url
  )
  // Attach event listeners.
  var bound = dom.bound
  bound.zoomreset = eYo.Dom.bindEventWithChecks_(
    zoomresetSvg,
    'mousedown',
    null,
    e => {
      workspace.markFocused()
      workspace.setScale(workspace.options.zoomOptions.startScale)
      workspace.scrollCenter()
      workspace.ui_driver.clearTouchIdentifier()  // Don't block future drags.
      eYo.Dom.gobbleEvent(e)
    }
  )
  bound.zoomin = eYo.Dom.bindEventWithChecks_(
    zoominSvg,
    'mousedown',
    null,
    e => {
      workspace.markFocused()
      workspace.zoomCenter(1)
      workspace.ui_driver.clearTouchIdentifier();  // Don't block future drags.
      eYo.Dom.gobbleEvent(e)
    }
  )
  bound.zoomout = eYo.Dom.bindEventWithChecks_(
    zoomoutSvg,
    'mousedown',
    null,
    e => {
      workspace.markFocused();
      workspace.zoomCenter(-1);
      eYo.Touch.clearTouchIdentifier();  // Don't block future drags.
      eYo.Dom.gobbleEvent(e)
    }
  )
  return g
}

/**
 * Dispose of the zoom controls SVG ressources.
 * @param {!eYo.ZoomControls} constrols
 */
eYo.Svg.prototype.zoomControlsDispose = function(controls) {
  var workspace = controls.workspace_
  var dom = workspace.dom
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
 * @param {!eYo.ZoomControls} controls
 */
eYo.Svg.prototype.zoomControlsPlace = function(controls) {
  controls.workspace_.dom.svg.zoom_.setAttribute(
    'transform',
    `translate(${controls.left_},${controls.top_})`
  )
}



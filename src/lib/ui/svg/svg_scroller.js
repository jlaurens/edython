/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Scrollbar rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Scroller')

goog.require('eYo.Svg')

/**
 * Inits the scroll bar.
 * @param {eYo.Scroller} scroller
 */
eYo.Svg.prototype.scrollerInit = eYo.Dom.decorateInit(function(pair) {
  var svg = pair.dom.svg
  var corner = svg.corner_ = eYo.Svg.newElement(
    'rect',
    {
      height: eYo.Scrollbar.thickness,
      width: eYo.Scrollbar.thickness,
      class: 'eyo-scrollbar-background'
    }
  )
  eYo.Dom.insertAfter(
    corner,
    pair.board_.dom.svg.canvas_
  )
})

/**
 * Dispose of the given slot's rendering resources.
 * @param {!eYo.Scroller} scroller
 */
eYo.Svg.prototype.scrollerDispose = eYo.Dom.decorateDispose(function (scroller) {
  var dom = scroller.dom
  goog.dom.removeNode(dom.svg.corner_)
  dom.svg = dom.svg.corner_ = null
})

/**
 * Place the corner.
 * @param {!eYo.Scroller} scroller
 * @private
 */
eYo.Svg.prototype.scrollerPlaceCorner = function(pair) {
  var r = pair.cornerRect_
  var corner = pair.dom.svg.corner_
  corner.setAttribute('x', r.x)
  corner.setAttribute('y', r.y)
  corner.setAttribute('width', r.width)
  corner.setAttribute('height', r.height)
}

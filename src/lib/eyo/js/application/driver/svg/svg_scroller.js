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

eYo.require('svg')

eYo.forwardDeclare('scroller')

/**
 * Svg driver for a scroller.
 */
eYo.Svg.makeDriverClass('Scroller', {
    /**
   * Inits the scroll bar.
   * @param {eYo.Scroller} scroller
   */
  initUI (pair) {
    var svg = pair.dom.svg
    var corner = svg.corner_ = eYo.Svg.newElement(
      'rect',
      {
        height: eYo.Scrollbar.thickness,
        width: eYo.Scrollbar.thickness,
        class: 'eyo-scrollbar-background'
      }
    )
    eYo.dom.insertAfter(
      corner,
      pair.board_.dom.svg.canvas_
    )
  },
  /**
   * Dispose of the given slot's rendering resources.
   * @param {eYo.Scroller} scroller
   */
  disposeUI (scroller) {
    var dom = scroller.dom
    goog.dom.removeNode(dom.svg.corner_)
    dom.svg = dom.svg.corner_ = null
  },
})

/**
 * Place the corner.
 * @param {eYo.Scroller} scroller
 * @private
 */
eYo.Svg.Scroller.prototype.placeCorner = function(pair) {
  var r = pair.cornerRect_
  var corner = pair.dom.svg.corner_
  corner.setAttribute('x', r.x)
  corner.setAttribute('y', r.y)
  corner.setAttribute('width', r.width)
  corner.setAttribute('height', r.height)
}

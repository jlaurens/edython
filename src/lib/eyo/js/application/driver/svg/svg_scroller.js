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

eYo.forward('view.Scroller')

/**
 * Svg driver for a scroller.
 */
eYo.svg.newDriverC9r('Scroller', {
    /**
   * Inits the scroll bar.
   * @param {eYo.view.Scroller} scroller
   */
  initUI (pair) {
    var svg = pair.dom.svg
    var corner = svg.corner_ = eYo.svg.newElement(
      'rect',
      {
        height: eYo.view.SCROLLBAR_THICKNESS,
        width: eYo.view.SCROLLBAR_THICKNESS,
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
   * @param {eYo.view.Scroller} scroller
   */
  disposeUI (scroller) {
    var dom = scroller.dom
    eYo.dom.removeNode(dom.svg.corner_)
    dom.svg = dom.svg.corner_ = null
  },
})

/**
 * Place the corner.
 * @param {eYo.view.Scroller} scroller
 * @private
 */
eYo.svg.Scroller_p.placeCorner = function(pair) {
  var r = pair.cornerRect_
  var corner = pair.dom.svg.corner_
  corner.setAttribute('x', r.x)
  corner.setAttribute('y', r.y)
  corner.setAttribute('width', r.width)
  corner.setAttribute('height', r.height)
}

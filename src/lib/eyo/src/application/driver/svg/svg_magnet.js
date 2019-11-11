/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Svg')

goog.provide('eYo.Svg.Magnet')

goog.forwardDeclare('eYo.Magnet')

/**
 * Svg driver for magnets.
 */
eYo.Svg.makeDriverClass('Magnet')

/**
 * Dispose of the magnet SVG ressources.
 * @param {!eYo.Magnet} magnet
 */
eYo.Svg.Magnet.prototype.initUI = eYo.Do.nothing

/**
 * Dispose of the magnet SVG ressources.
 * @param {!eYo.Magnet} magnet
 */
eYo.Svg.Magnet.prototype.disposeUI = eYo.Do.nothing

/**
 * Hilight the given magnet.
 * @param {!eYo.Magnet} m4t
 */
eYo.Svg.Magnet.prototype.hilight = function (m4t) {
  if (!m4t.board) {
    return
  }
  var node = m4t.brick
  var g = node.dom.svg.group_
  var steps
  if (m4t.isSlot) {
    if (m4t.target) {
      steps = eYo.Shape.definitionWithBrick(m4t.targetBrick)
    } else {
      steps = eYo.Shape.definitionWithMagnet(m4t)
      eYo.Svg.magnetHighlightedPath_ =
      eYo.Svg.newElement(
        'path',
        {
          class: 'eyo-hilighted-magnet-path',
          d: steps
        },
        g
      )
      return
    }
  } else if (m4t.isOutput) {
    steps = eYo.Shape.definitionWithBrick(node)
  } else {
    steps = eYo.Shape.definitionWithMagnet(m4t)
  }
  var xy = m4t.whereInBoard
  eYo.Svg.magnetHighlightedPath_ = eYo.Svg.newElement(
    'path',
    {
      class: 'eyo-hilighted-magnet-path',
      d: steps,
      transform: `translate(${xy.x || 0},${xy.y || 0})`
    },
    g
  )
}

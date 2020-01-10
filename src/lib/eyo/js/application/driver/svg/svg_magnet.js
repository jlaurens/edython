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

eYo.require('svg')

eYo.forwardDeclare('magnet')

/**
 * Svg driver for magnets.
 */
eYo.svg.makeDriverClass('Magnet')

/**
 * Hilight the given magnet.
 * @param {eYo.magnet.Dflt} m4t
 */
eYo.svg.Magnet.prototype.hilight = function (m4t) {
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
      eYo.svg.MagnetHighlightedPath_ =
      eYo.svg.newElement(
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
  eYo.svg.MagnetHighlightedPath_ = eYo.svg.newElement(
    'path',
    {
      class: 'eyo-hilighted-magnet-path',
      d: steps,
      transform: `translate(${xy.x || 0},${xy.y || 0})`
    },
    g
  )
}

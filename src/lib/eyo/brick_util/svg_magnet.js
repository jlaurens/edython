/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Magnet')

goog.require('eYo.Svg')

goog.forwardDeclare('eYo.Magnet')

// Magnet management

/**
 * Dispose of the magnet SVG ressources.
 * @param {!eYo.Magnet} magnet
 */
eYo.Svg.prototype.magnetDispose = eYo.Do.nothing

/**
 * Hilight the given magnet.
 * @param {!eYo.Magnet} m4t
 */
eYo.Svg.prototype.magnetHilight = function (m4t) {
  if (!m4t.workspace) {
    return
  }
  var node = m4t.brick
  var g = node.ui.svg.group_
  var steps
  if (m4t.isInput) {
    if (m4t.target) {
      steps = eYo.Shape.definitionWithBrick(m4t.targetBrick)
    } else {
      steps = eYo.Shape.definitionWithMagnet(m4t)
      eYo.Svg.magnetHighlightedPath_ =
      eYo.Svg.newElement('path',
        {
          class: 'blocklyHighlightedConnectionPath',
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
  eYo.Svg.magnetHighlightedPath_ =
  eYo.Svg.newElement('path',
    {class: 'blocklyHighlightedConnectionPath',
      'd': steps,
      transform: `translate(${m4t.x || 0},${m4t.y || 0})`},
      g)
}

/**
 * Move the given magnet.
 * @param {!eYo.Magnet} m4t
 */
eYo.Svg.prototype.magnetMove = function (m4t) {
}


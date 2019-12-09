/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering driver, brick methods.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('eYo.ns.Svg')
eYo.require('eYo.ns.Dom.Brick')

eYo.forwardDeclare('eYo.ns.Brick')
eYo.forwardDeclare('eYo.Focus')
goog.forwardDeclare('goog.dom')

/**
 * Svg driver to help rendering bricks in a svg context.
 * @readonly
 * @property {SvgGroupElement} group_  The svg group.
 * @property {SvgGroupElement} groupContour_  The svg group for the contour.
 * @property {SvgGroupElement} groupShape_  The svg group for the shape.
 * @property {SvgPathElement} pathInner_  A path.
 * @property {SvgPathElement} pathShape_  A path.
 * @property {SvgPathElement} pathContour_  A path.
 * @property {SvgPathElement} pathCollapsed_  A path.
 * @property {SvgPathElement} pathSelect_  A path.
 * @property {SvgPathElement} pathHilight_  A path.
 * @memberof eYo.ns.Brick.Dflt.prototype.dom
 */

// Brick management

/**
 * Svg driver for bricks.
 */
eYo.ns.Svg.makeDriverClass('Brick', {
  /**
   * Initialize the given brick.
   * Adds to brick's renderer a `svg` attribute owning all the svg related resources.
   * The svg
   * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
   */
  initUI (brick) {
    var dom = brick.dom
    var svg = dom.svg
    // groups:
    var g = svg.group_ = eYo.ns.Svg.newElement('g',
      {class: 'eyo-brick'}, null)
    // Expose this brick's ID on its top-level SVG group.
    if (g.dataset) {
      g.dataset.id = brick.id
      g.dataset.type = brick.type
    }
    svg.pathInner_ = eYo.ns.Svg.newElement('path', {
      class: 'eyo-path-inner'
    }, null)
    svg.pathCollapsed_ = eYo.ns.Svg.newElement('path', {
      class: 'eyo-path-collapsed'
    }, null)
    svg.pathContour_ = eYo.ns.Svg.newElement('path', {
      class: 'eyo-path-contour'
    }, null)
    svg.pathShape_ = eYo.ns.Svg.newElement('path', {
      class: 'eyo-path-shape'
    }, null)
    svg.pathSelect_ = eYo.ns.Svg.newElement('path', {
      class: 'eyo-path-selected'
    }, null)
    svg.pathHilight_ = eYo.ns.Svg.newElement('path', {
      class: 'eyo-path-hilighted'
    }, null)
    svg.pathMagnet_ = eYo.ns.Svg.newElement('path', {
      class: 'eyo-path-magnet eyo-path-hilighted'
    }, null)
    // Contour
    svg.groupContour_ = eYo.ns.Svg.newElement('g', {
      class: 'eyo-contour'
    }, null)
    if (svg.groupContour_.dataset) {
      svg.groupContour_.dataset.id = brick.id
      svg.groupContour_.dataset.type = brick.type
    }
    if (this.withBBox) {
      svg.pathBBox_ = eYo.ns.Svg.newElement('path', {
        class: 'eyo-path-bbox'
      }, null)
      goog.dom.appendChild(svg.groupContour_, svg.pathBBox_)
    }
    goog.dom.appendChild(svg.groupContour_, svg.pathInner_)
    goog.dom.appendChild(svg.groupContour_, svg.pathCollapsed_)
    goog.dom.appendChild(svg.groupContour_, svg.pathContour_)
    // Shape
    svg.groupShape_ = eYo.ns.Svg.newElement('g', {
      class: 'eyo-shape'
    }, null)
    if (svg.groupShape_.dataset) {
      svg.groupShape_.dataset.id = brick.id
      svg.groupShape_.dataset.type = brick.type
    }
    goog.dom.appendChild(svg.groupShape_, svg.pathShape_)
    if (!brick.board.options.readOnly) {
      eYo.ns.Dom.bindMouseEvents(brick.ui, g)
      // I could not achieve to use only one binding
      // With 2 bindings all the mouse events are catched,
      // but some, not all?, are catched twice.
      eYo.ns.Dom.bindMouseEvents(brick.ui, svg.pathContour_)
    }
    if (brick.isExpr) {
      goog.dom.classlist.add(svg.groupShape_, 'eyo-expr')
      goog.dom.classlist.add(svg.groupContour_, 'eyo-expr')
      goog.dom.classlist.add(g, 'eyo-top')
    } else if (brick.isStmt) {
      svg.groupSharp_ = eYo.ns.Svg.newElement('g', {
        class: 'eyo-sharp-group'
      })
      goog.dom.insertSiblingAfter(svg.groupSharp_, svg.pathContour_)
      goog.dom.classlist.add(svg.groupShape_, 'eyo-stmt')
      goog.dom.classlist.add(svg.groupContour_, 'eyo-stmt')
      if (brick.isControl) {
        svg.groupPlay_ = eYo.ns.Svg.newElement('g', {
          class: 'eyo-play'
        }, g)
        svg.pathPlayContour_ = eYo.ns.Svg.newElement('path', {
          class: 'eyo-path-play-contour'
        }, svg.groupPlay_)
        svg.pathPlayIcon_ = eYo.ns.Svg.newElement('path', {
          class: 'eyo-path-play-icon'
        }, svg.groupPlay_)
        svg.pathPlayContour_.setAttribute(
          'd',
          eYo.Shape.definitionForPlayContour({x: 0, y: 0})
        )
        svg.pathPlayIcon_.setAttribute(
          'd',
          eYo.Shape.definitionForPlayIcon({x: 0, y: 0})
        )
        dom.bound.mousedown = eYo.ns.Dom.bindEvent(
          svg.pathPlayIcon_,
          'mousedown',
          null,
          e => {
            if (brick.isInFlyout) {
              return
            }
            console.log('Start executing ' + brick.id)
            brick.runScript()
          }
        )
        goog.dom.classlist.add(g, 'eyo-start')
        goog.dom.classlist.add(svg.pathShape_, 'eyo-start-path')
        goog.dom.insertSiblingAfter(svg.groupPlay_, svg.pathHilight_)
      }
    }
    var parent = brick.parent
    if (parent) {
      this.parentDidChange(brick)
    } else {
      this.placeOnTop(brick)
    }
    if (parent) {
      var p_svg = parent.dom.svg
      goog.dom.insertChildAt(p_svg.groupContour_, svg.groupContour_, 0)
      goog.dom.classlist.add(/** @type {!Element} */(svg.groupContour_),
        'eyo-inner')
      goog.dom.appendChild(p_svg.groupShape_, svg.groupShape_)
      goog.dom.classlist.add(/** @type {!Element} */(svg.groupShape_),
        'eyo-inner')
      svg.groups = [g, svg.groupShape_, svg.groupContour_]
    } else {
      brick.board.dom.svg.canvas_.appendChild(g)
      goog.dom.insertChildAt(g, svg.groupContour_, 0)
      goog.dom.classlist.remove(/** @type {!Element} */svg.groupContour_,
        'eyo-inner')
      goog.dom.insertSiblingBefore(svg.groupShape_, svg.groupContour_)
      goog.dom.classlist.remove(/** @type {!Element} */svg.groupShape_,
        'eyo-inner')
      svg.groupContour_.removeAttribute('transform')
      svg.groupShape_.removeAttribute('transform')
      svg.groups = [g]
    }
  },
  /**
   * Remove the svg related resources of brick.
   * This must be called just when changing the driver in the renderer.
   * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
   */
  disposeUI (brick) {
    var svg = brick.dom.svg
    // goog.dom.removeNode(dom.svg.group_) only once the block_ design is removed
    goog.dom.removeNode(svg.group_)
    svg.group_ = eYo.NA
    // just in case the path were not already removed as child or a removed parent
    goog.dom.removeNode(svg.pathShape_)
    svg.pathShape_ = eYo.NA
    goog.dom.removeNode(svg.pathContour_)
    svg.pathContour_ = eYo.NA
    goog.dom.removeNode(svg.pathCollapsed_)
    svg.pathCollapsed_ = eYo.NA
    goog.dom.removeNode(svg.pathBBox_)
    svg.pathBBox_ = eYo.NA
    goog.dom.removeNode(svg.pathInner_)
    svg.pathInner_ = eYo.NA
    goog.dom.removeNode(svg.pathSelect_)
    svg.pathSelect_ = eYo.NA
    goog.dom.removeNode(svg.pathHilight_)
    svg.pathHilight_ = eYo.NA
    goog.dom.removeNode(svg.pathMagnet_)
    svg.pathMagnet_ = eYo.NA
    if (svg.groupContour_) {
      goog.dom.removeNode(svg.groupContour_)
      svg.groupContour_ = eYo.NA
    }
    if (svg.groupShape_) {
      goog.dom.removeNode(svg.groupShape_)
      svg.groupShape_ = eYo.NA
    }
    if (svg.groupSharp_) {
      goog.dom.removeNode(svg.groupSharp_)
      svg.groupSharp_ = eYo.NA
    }
    if (svg.groupPlay_) {
      goog.dom.removeNode(svg.groupPlay_)
      svg.groupPlay_ = eYo.NA
      svg.pathPlayIcon_ = eYo.NA
      svg.pathPlayContour_ = eYo.NA
    }
    brick.dom.svg = eYo.NA
  },
})

eYo.ns.Svg.Brick.prototype.withBBox = true

/**
 * Whether the given brick can draw.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.canDraw = function (brick) {
  return !!brick.dom.svg.pathInner_
}

/**
 * Whether the contour of the receiver is above or below the parent's one.
 * True for statements, false otherwise.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.contourAboveParent_ = function (brick) {
  return !brick.isExpr
}

/**
 * Return the bbox of the given brick.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @return {Object}
 * @private
 */
eYo.ns.Svg.Brick.prototype.getBBox = function (brick) {
  return brick.dom.svg.pathShape_.getBBox()
}

/**
 * Whether the brick is visually selected.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @return {Boolean}
 * @private
 */
eYo.ns.Svg.Brick.prototype.hasFocus = function (brick) {
  return goog.dom.classlist.contains(brick.dom.svg.group_, 'eyo-select')
}

/**
 * Path definition for a statement brick selection.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.pathSelectDef_ = function (brick) {
  return eYo.Shape.definitionWithBrick(brick, {dido: true})
}

/**
 * Generic path definition based on shape.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.pathDef_ = function (brick) {
  return eYo.Shape.definitionWithBrick(brick)
}

/**
 * Control brick path.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.pathControlDef_ = eYo.ns.Svg.Brick.prototype.pathDef_

/**
 * Statement brick path.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.pathStatementDef_ = eYo.ns.Svg.Brick.prototype.pathDef_

/**
 * Brick path.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.pathGroupShapeDef_ = eYo.ns.Svg.Brick.prototype.pathDef_

/**
 * Brick path.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.pathValueDef_ = eYo.ns.Svg.Brick.prototype.pathDef_


/**
 * Brick outline. Default implementation forwards to pathDef_.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.pathContourDef_ = eYo.ns.Svg.Brick.prototype.pathDef_

/**
 * Highlighted brick outline. Default implementation forwards to pathDef_.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.pathHilightDef_ = eYo.ns.Svg.Brick.prototype.pathDef_

/**
 * Brick outline. Default implementation forwards to pathDef_.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.pathShapeDef_ = eYo.ns.Svg.Brick.prototype.pathDef_

/**
 * Brick path when collapsed.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.pathCollapsedDef_ = eYo.ns.Svg.Brick.prototype.pathDef_

/**
 * Highlighted magnet outline.
 * When a brick is selected and one of its magnet is also selected
 * the ui displays a bold line on the magnet. When the brick has wrapped slot,
 * the selected magnet may belong to a wrapped brick.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.pathMagnetDef_ = function (brick) {
  return eYo.Focus.magnet
  ? eYo.Shape.definitionWithMagnet(eYo.Focus.magnet, {hilight: true})
  : ''
}

/**
 * Rectangular outline of bricks, mainly for debugging purposes.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.pathBBoxDef_ = function (brick) {
  return eYo.Shape.definitionWithBrick(brick, {bbox: true})
}

/**
 * If the brick has been inited for rendering,
 * prepares the various paths.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.ns.Svg.Brick.prototype.willRender = function (brick, recorder) {
  var svg = brick.dom.svg
  if (svg.group_) {
    var F = brick.locked_ && brick.out
      ? goog.dom.classlist.add
      : goog.dom.classlist.remove
    var FF = (elt, classname) => {
      if (/** @type {!Element} */(elt)) {
        F(elt, classname)
      }
    }
    FF(svg.group_, 'eyo-locked')
    FF(svg.pathShape_, 'eyo-locked')
    FF(svg.pathContour_, 'eyo-locked')
    FF(svg.pathCollapsed_, 'eyo-locked')
    FF(svg.pathSelect_, 'eyo-locked')
    FF(svg.pathHilight_, 'eyo-locked')
    // change the class of the shape on error
    F = Object.keys(brick.errors).length
      ? goog.dom.classlist.add
      : goog.dom.classlist.remove
    FF(svg.pathShape_, 'eyo-error')
    FF(svg.pathContour_, 'eyo-error')
    FF(svg.pathCollapsed_, 'eyo-error')
    FF(svg.pathSelect_, 'eyo-error')
    FF(svg.pathHilight_, 'eyo-error')
  }
}

/**
 * Prepares the various paths.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.ns.Svg.Brick.prototype.didRender = eYo.Do.nothing

/**
 * Compute the paths of the brick depending on its size.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @param {*} path
 * @param {*} def
 */
eYo.ns.Svg.Brick.prototype.updatePath_ = function (brick, path, def) {
  if (path) {
    if (def) {
      try {
        var d = def(brick)
        if (d.indexOf('NaN') >= 0) {
          d = def(brick)
          console.log('d', d)
        }
        path.setAttribute('d', d)
      } catch (err) {
        console.error('d', d, '\ndef', def)
        throw err
      }
    } else {
      path.removeAttribute('d')
    }
  }
}

/**
 * Compute the paths of the brick depending on its size.
 * This may be called too early, when the path do not exist yet
 * @private
 */
eYo.ns.Svg.Brick.prototype.updateShape = function (brick) {
  var svg = brick.dom.svg
  if (brick.ui.mayBeLast || !svg.pathContour_) {
    return
  }
  if (brick.wrapped_) {
    this.updatePath_(brick, svg.pathContour_)
    this.updatePath_(brick, svg.pathShape_)
    this.updatePath_(brick, svg.pathCollapsed_)
  } else {
    this.updatePath_(brick, svg.pathContour_, this.pathContourDef_)
    this.updatePath_(brick, svg.pathShape_, this.pathShapeDef_)
    this.updatePath_(brick, svg.pathCollapsed_, this.pathCollapsedDef_)
  }
  this.updatePath_(brick, svg.pathBBox_, this.pathBBoxDef_)
  this.updatePath_(brick, svg.pathHilight_, this.pathHilightDef_)
  this.updatePath_(brick, svg.pathSelect_, this.pathSelectDef_)
  this.updatePath_(brick, svg.pathMagnet_, this.pathMagnetDef_)
  if (brick.ui.someTargetIsMissing && !brick.isInFlyout) {
    goog.dom.classlist.add(svg.pathContour_, 'eyo-error')
  } else {
    goog.dom.classlist.remove(svg.pathContour_, 'eyo-error')
  }
}

/**
 * Default implementation does nothing.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @param {Object} [io]
 * @private
 */
eYo.ns.Svg.Brick.prototype.drawModelBegin = function (brick, io) {
  io.steps = []
}

/**
 * Default implementation does nothing.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @param {Object} [io]
 * @private
 */
eYo.ns.Svg.Brick.prototype.drawModelEnd = function (brick, io) {
  var d = io.steps.join(' ')
  brick.dom.svg.pathInner_.setAttribute('d', d)
}

/**
 * Make the given field disabled eventually.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.ns.Svg.Brick.prototype.updateDisabled = function (brick) {
  var brick = brick
  var svg = brick.dom.svg
  if (brick.disabled || brick.getInheritedDisabled()) {
    goog.dom.classlist.add(
        /** @type {!Element} */ svg.group_, 'eyo-disabled')
  } else {
    goog.dom.classlist.remove(
        /** @type {!Element} */ svg.group_, 'eyo-disabled')
  }
}

/**
 * Show the given menu.
 * Should be obsoleted.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @param {Object} menu  the menu to be displayed
 */
eYo.ns.Svg.Brick.prototype.menuShow = function (brick, menu) {
  var svg = brick.dom
  var bBox = this.getBBox(brick)
  var scaledHeight = bBox.height * brick.board.scale
  var xy = goog.style.getPageOffset(svg.group_)
  menu.showMenu(svg.group_, xy.x, xy.y + scaledHeight + 2)
}

/**
 * Called when the parent will just change.
 * This code is responsible to place the various path
 * in the proper domain of the dom tree.
 * @param {eYo.ns.Brick.Dflt} brick child.
 * @param {eYo.ns.Brick.Dflt} newParent to be connected.
 */
eYo.ns.Svg.Brick.prototype.placeOnTop = function (brick) {
  var svg = brick.dom.svg
  // this brick was connected, so its paths were located in the parents
  // groups.
  // First step, remove the relationship between the receiver
  // and the old parent, then link the receiver with the new parent.
  // this second step is performed in the `parentDidChange` method.
  var g = svg.group_
  // Move this brick up the DOM.  Keep track of x/y translations.
  brick.board.dom.svg.canvas_.appendChild(g)
  var xy = brick.xy
  g.setAttribute('transform', `translate(${xy.x},${xy.y})`)
  goog.dom.insertChildAt(g, svg.groupContour_, 0)
  svg.groupContour_.removeAttribute('transform')
  goog.dom.classlist.remove(/** @type {!Element} */ svg.groupContour_,
    'eyo-inner')
  goog.dom.insertSiblingBefore(svg.groupShape_, svg.groupContour_)
  svg.groupShape_.removeAttribute('transform')
  goog.dom.classlist.remove(/** @type {!Element} */(svg.groupShape_),
    'eyo-inner')
  svg.groups = [g]
}

/**
 * Called when the parent will just change.
 * This code is responsible to place the various path
 * in the proper domain of the dom tree.
 * @param {eYo.ns.Brick.Dflt} brick child.
 * @param {eYo.ns.Brick.Dflt} newParent to be connected.
 */
eYo.ns.Svg.Brick.prototype.parentWillChange = function (brick, newParent) {
  if (brick.parent) {
    this.placeOnTop(brick)
  }
}

/**
 * Called when the parent did just change.
 * This code is responsible to place the various path
 * in the proper domain of the dom tree.
 * @param {eYo.ns.Brick.Dflt} oldParent child.
 * @param {eYo.ns.Brick.Dflt} oldParent replaced.
 */
eYo.ns.Svg.Brick.prototype.parentDidChange = function (brick, oldParent) {
  var newParent = brick.parent
  if (newParent) {
    var dom = brick.dom
    var svg = dom.svg
    var g = svg.group_
    // Move the magnets to match the child's new position.
    brick.ui.placeMagnets_()
    var p_svg = newParent.dom.svg
    p_svg.group_.appendChild(g)
    if (eYo.ns.Svg.contourAboveParent_(brick)) {
      goog.dom.appendChild(p_svg.groupContour_, svg.groupContour_)
    } else {
      goog.dom.insertChildAt(p_svg.groupContour_, svg.groupContour_, 0)
    }
    goog.dom.appendChild(p_svg.groupShape_, svg.groupShape_)
    goog.dom.classlist.add(/** @type {!Element} */(svg.groupContour_),
      'eyo-inner')
    goog.dom.classlist.add(/** @type {!Element} */(svg.groupShape_),
      'eyo-inner')
    svg.groups = [g, svg.groupContour_, svg.groupShape_]
      // manage the selection,
    // this seems tricky? Is there any undocumented side effect?
    if ((svg.group_ === svg.pathSelect_.parentElement) || (svg.group_ === svg.pathMagnet_.parentElement)) {
      this.selectRemove(brick)
      this.selectAdd(brick)
    }
  }
}

/**
 * Make the given brick visually wrapped or unwrapped
 * according to the brick status.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.ns.Svg.Brick.prototype.updateWrapped = function (brick) {
  var dom = brick.dom
  var svg = dom.svg
  if (brick.wrapped_ && !dom.wrapped) {
    dom.wrapped = true
    svg.pathShape_.style.display = 'none'
    svg.pathContour_.style.display = 'none'
  } else if (!brick.wrapped_ && dom.wrapped) {
    dom.wrapped = false
    svg.pathContour_.removeAttribute('display')
    svg.pathShape_.removeAttribute('display')
  }
}

/**
 * Send to front.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.sendToFront = function (brick) {
  var b3k = brick
  var parent
  while ((parent = b3k.surround)) {
    b3k = parent
  }
  var g = b3k.dom.svg.group_
  if (g.nextSibling && (parent = g.parentNode)) {
    parent.removeChild(g)
    parent.appendChild(g)
  }

  // eyo = brick
  // try {
  //   do {
  //     var g = eyo.ui.group_
  //     var parent = g.parentNode
  //     if (parent) {
  //       parent.removeChild(g)
  //       parent.appendChild(g)
  //       eyo = eyo.parent
  //     } else {
  //       break
  //     }
  //   } while (eyo)
  // } catch (err) {
  //   console.error(err)
  // }

}

/**
 * Send to back.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.sendToBack = function (brick) {
  var b3k = brick
  var parent
  while ((parent = b3k.surround)) {
    b3k = parent
  }
  var g = b3k.dom.svg.group_
  if (g.previousSibling && (parent = g.parentNode)) {
    parent.removeChild(g)
    parent.insertBefore(g, parent.firstChild)
  }
}

/**
 * Translates the brick.
 * @param {eYo.ns.Brick.Dflt} brick The brick to place.
 */
eYo.ns.Svg.Brick.prototype.place = function(brick) {
  var xy = brick.xy
  var transform = `translate(${xy.x},${xy.y})`
  if (transform.match(/NaN/) || transform.match(/undefined/)) {
    throw 'FAILURE'
  }
  brick.dom.svg.groups.forEach(g => {
    g.setAttribute('transform', transform)
  })
}

/**
 * Move this brick during a drag, taking into account whether we are using a
 * drag surface to translate bricks.
 * This brick must be a top-level brick.
 * @param {eYo.ns.Brick.Dflt} brick  the brick.
 * @param {eYo.Where} dxy  in board coordinates.
 */
eYo.ns.Svg.Brick.prototype.setOffsetDuringDrag = function(brick, dxy) {
  var svg = brick.dom.svg
  var g = svg.group_
  g.translate_ = `translate(${dxy.x},${dxy.y})`
  g.setAttribute('transform', g.translate_ + g.skew_)
}

/**
 * Return the coordinates of the top-left corner of this brick relative to the parent, in board units.
 * @return {!eYo.Where} Object with .x and .y properties in
 *     board coordinates.
 */
eYo.ns.Svg.Brick.prototype.whereInParent = function (brick) {
  return this.xyInParent(brick.dom.svg.group_)
}

/**
 * Return the coordinates of the top-left corner of this brick relative to the
 * drawing surface's origin (0,0), in board units.
 * If the brick is on the board, (0, 0) is the origin of the board
 * coordinate system.
 * This does not change with board scale.
 * @return {!eYo.Where} Object with .x and .y properties in
 *     board coordinates.
 */
eYo.ns.Svg.Brick.prototype.whereInBoard = function (brick) {
  var ans = new eYo.Where()
  var bds = brick.board.dom.svg.brickDragSurface
  var current = bds.brickGroup
  var bdsGroup = bds.dom.svg.group_
  var canvas = brick.board.dom.svg.canvas_
  var element = brick.dom.svg.group_
  do {
    // Loop through this brick and every parent.
    ans.forward(this.xyInParent(element))
    // If this element is the current element on the drag surface, include
    // the translation of the drag surface itself.
    if (current === element) {
      ans.forward(bds.translation)
    }
    element = element.parentNode
  } while (element && element != canvas && element != bdsGroup)
  return ans
}

/**
 * Return the coordinates of the top-left corner
 * of this brick relative to the desk.
 * @return {!eYo.Where} Object with .x and .y properties in
 *     desk coordinates.
 */
eYo.ns.Svg.Brick.prototype.whereInDesk = function (brick) {
  var ans = new eYo.Where()
  var bds = brick.board.dom.svg.brickDragSurface
  var bdsRoot = bds.dom.svg.root_
  var boardRoot = brick.board.dom.svg.root_
  var element = brick.dom.svg.group_
  do {
    // Loop through this brick and every parent.
    ans.xyAdvance(this.xyInParent(element))
  } while ((element = element.parentNode) && element != boardRoot && element != bdsRoot)
  return ans
}

/**
 * Add the hilight path_.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.ns.Svg.Brick.prototype.hilightAdd = function (brick) {
  var svg = brick.dom.svg
  if (!svg.pathHilight_.parentNode) {
    svg.group_.appendChild(svg.pathHilight_)
  }
}

/**
 * Remove the hilight path.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.ns.Svg.Brick.prototype.hilightRemove = function (brick) {
  goog.dom.removeNode(brick.dom.svg.pathHilight_)
}

/**
 * Add the select path.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.ns.Svg.Brick.prototype.selectAdd = function (brick) {
  var svg = brick.dom.svg
  if (!svg.pathSelect_.parentNode) {
    if (svg.pathHilight_.parentNode) {
      svg.group_.insertBefore(svg.pathSelect_, svg.pathHilight_)
    } else if (svg.pathMagnet_.parentNode) {
      svg.group_.insertBefore(svg.pathSelect_, svg.pathMagnet_)
    } else {
      svg.group_.appendChild(svg.pathSelect_)
    }
  }
}

/**
 * Remove the select path.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.ns.Svg.Brick.prototype.selectRemove = function (brick) {
  goog.dom.removeNode(brick.dom.svg.pathSelect_)
}

/**
 * Add the hilight path_ to the dom.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.ns.Svg.Brick.prototype.magnetAdd = function (brick) {
  var svg = brick.dom.svg
  if (!svg.pathMagnet_.parentNode) {
    svg.group_.appendChild(svg.pathMagnet_)
  }
}

/**
 * Remove the select path from the dom.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.ns.Svg.Brick.prototype.magnetRemove = function (brick) {
  goog.dom.removeNode(brick.dom.svg.pathMagnet_)
}

/**
 * The svg group has an `eyo-top` class.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.ns.Svg.Brick.prototype.statusTopAdd = function (brick) {
  goog.dom.classlist.add(brick.dom.svg.group_, 'eyo-top')
}

/**
 * The svg group has no `eyo-top` class.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.ns.Svg.Brick.prototype.statusTopRemove = function (brick) {
  goog.dom.classlist.remove(brick.dom.svg.group_, 'eyo-top')
}

/**
 * The svg group has an `eyo-select` class.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.ns.Svg.Brick.prototype.statusFocusAdd = function (brick) {
  var svg = brick.dom.svg
  var g = svg.group_
  if (goog.dom.classlist.contains(g, 'eyo-select')) {
    return
  }
  goog.dom.classlist.add(g, 'eyo-select')
  if ((g = svg.groupContour_)) {
    // maybe that brick has not been rendered yet
    goog.dom.classlist.add(g, 'eyo-select')
  }
}

/**
 * The svg group has an `eyo-select` class.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.ns.Svg.Brick.prototype.statusFocusRemove = function (brick) {
  var svg = brick.dom.svg
  var g = svg.group_
  goog.dom.classlist.remove(g, 'eyo-select')
  if ((g = svg.groupContour_)) {
    // maybe that brick has not been rendered yet
    goog.dom.classlist.remove(g, 'eyo-select')
  }
}

/**
 * Get the displayed status of the given brick.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.ns.Svg.Brick.prototype.displayedGet = function (brick) {
  var g =  brick.dom.svg.group_
  if (g) {
    return g.style.display !== 'none'
  }
}

/**
 * Set the displayed status of the given brick.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.ns.Svg.Brick.prototype.displayedSet = function (brick, visible) {
  var svg = brick.dom.svg
  var g =  svg.group_
  if (g) {
    var d = visible ? 'block' : 'none'
    g.style.display = d
    if ((g = svg.groupContour_)) {
      g.style.display = svg.groupShape_.style.display = d
    }
  }
}

/**
 * Draw/hide the sharp.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.ns.Svg.Brick.prototype.drawSharp = function (brick, visible) {
  var g = brick.dom.svg.groupSharp_
  if (visible) {
    var children = goog.dom.getChildren(g)
    var length = children.length
    if (!length) {
      var y = eYo.Font.totalAscent
      var text = eYo.ns.Svg.newElement('text',
        {x: 0, y: y},
        g)
      text.appendChild(document.createTextNode('#'))
      length = 1
    }
    var expected = brick.getStatementCount()
    while (length < expected) {
      y = eYo.Font.totalAscent + length * eYo.Unit.y
      text = eYo.ns.Svg.newElement('text',
        {x: 0, y: y},
        g)
      text.appendChild(document.createTextNode('#'))
      ++length
    }
    while (length > expected) {
      text = children[--length]
      g.removeChild(text)
    }
    g.setAttribute('transform', `translate(${io.cursor.x},${eYo.Padding.t})`)
    g.style.display = 'block'
  } else {
    goog.dom.removeChildren(g)
    g.style.display = 'none'
  }
}

/**
 * Set the dosplay mode for bricks.
 * @param {eYo.ns.Brick.Dflt} mode  The brick to edit.
 * @param {Boolean} dragging  The display mode for bocks.
 */
eYo.ns.Svg.Brick.prototype.setDragging = (brick, dragging) => {
  var svg = brick.dom.svg
  var g = svg.group_
  if (dragging) {
    g.translate_ = ''
    g.skew_ = ''
    goog.dom.classlist.add(
        /** @type {!Element} */ g, 'eyo-dragging')
  } else {
    goog.dom.classlist.remove(
        /** @type {!Element} */ g, 'eyo-dragging')
  }
  // Recurse through all bricks attached under this one.
  brick.forEachChild(b => b.ui.dragging = dragging)
}

/**
 * Move the brick to the top level.
 * @param {eYo.ns.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.ns.Svg.Brick.prototype.parentSet = function (brick, parent) {
  var svg = brick.dom.svg
  if (parent) {
    var p_svg = parent.dom
    var oldWhere = this.whereInBoard(brick)
    p_svg.group_.appendChild(svg.group_)
    var newWhere = this.whereInBoard(brick)
    goog.dom.insertChildAt(p_svg.groupContour_, svg.groupContour_, 0)
    goog.dom.classlist.add(/** @type {!Element} */(svg.groupContour_),
      'eyo-inner')
    goog.dom.appendChild(p_svg.groupShape_, svg.groupShape_)
    goog.dom.classlist.add(/** @type {!Element} */(svg.groupShape_),
      'eyo-inner')
  } else {
    var oldWhere = this.whereInBoard(brick)
    brick.board.dom.svg.canvas_.appendChild(svg.group_)
    xy && (svg.group_.setAttribute('transform', `translate(${oldWhere.x},${oldWhere.y})`))
    var newWhere = this.whereInBoard(brick)
    goog.dom.insertChildAt(svg.group_, svg.groupContour_, 0)
    goog.dom.classlist.remove(/** @type {!Element} */svg.groupContour_,
      'eyo-inner')
    goog.dom.insertSiblingBefore(svg.groupShape_, svg.groupContour_)
    goog.dom.classlist.remove(/** @type {!Element} */svg.groupShape_,
      'eyo-inner')
  }
  brick.ui.moveMagnets_(newWhere.x - oldWhere.x, newWhere.y - oldWhere.y);
}

/**
 * Add tooltip to a brick
 * @param {eYo.ns.Brick.Dflt} brick
 * @param {String} key
 * @param {Object} [options]
 */
eYo.ns.Svg.Brick.prototype.addTooltip = function (brick, key, options) {
  var g = brick.dom.group
  goog.mixin(options, {
    onShow(instance) {
      g && g.parentNode && (eYo.Tooltip.hideAll(g.parentNode))
    }
  })
  var model = brick.constructor.eyo.model
  var title = eYo.Tooltip.getTitle(key || model.tooltip || brick.tooltipKey || brick.type.substring(4))
  if (title) {
    this.addTooltip(g, title, options)
  }
}

/**
 * Update the cursor over this block by adding or removing a class.
 * @param {boolean} enable True if the delete cursor should be shown, false
 *     otherwise.
 */
eYo.ns.Svg.Brick.prototype.setDeleteStyle = function(brick, enable) {
  (enable
    ? goog.dom.classlist.add
    : goog.dom.classlist.remove)(
      /** @type {!Element} */brick.dom.svg.group_,
      'eyo-dragging-delete'
  )
}

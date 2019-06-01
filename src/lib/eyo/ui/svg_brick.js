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

goog.provide('eYo.Svg.Brick')

goog.require('eYo.Svg')

goog.forwardDeclare('eYo.Selected')

// Brick management

/**
 * Initialize the given brick.
 * Adds to brick's renderer a `svg` attribute owning all the svg related resources.
 * The svg
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickInit = function (brick) {
  if (brick.dom) {
    return
  }
  var dom = this.basicInit(brick)
  var svg = dom.svg
  // groups:
  var g = svg.group_ = eYo.Svg.newElement('g',
    {class: 'eyo-brick'}, null)
  // Expose this brick's ID on its top-level SVG group.
  if (g.dataset) {
    g.dataset.id = brick.id
  }
  svg.pathInner_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-inner'
  }, null)
  svg.pathCollapsed_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-collapsed'
  }, null)
  svg.pathContour_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-contour'
  }, null)
  svg.pathShape_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-shape'
  }, null)
  svg.pathSelect_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-selected'
  }, null)
  svg.pathHilight_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-hilighted'
  }, null)
  svg.pathMagnet_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-connection eyo-path-hilighted'
  }, null)
  // Contour
  svg.groupContour_ = eYo.Svg.newElement('g', {
    class: 'eyo-contour'
  }, null)
  if (this.withBBox) {
    svg.pathBBox_ = eYo.Svg.newElement('path', {
      class: 'eyo-path-bbox'
    }, null)
    goog.dom.appendChild(svg.groupContour_, svg.pathBBox_)
  }
  goog.dom.appendChild(svg.groupContour_, svg.pathInner_)
  goog.dom.appendChild(svg.groupContour_, svg.pathCollapsed_)
  goog.dom.appendChild(svg.groupContour_, svg.pathContour_)
  // Shape
  svg.groupShape_ = eYo.Svg.newElement('g', {
    class: 'eyo-shape'
  }, null)
  goog.dom.appendChild(svg.groupShape_, svg.pathShape_)
  if (!brick.workspace.options.readOnly) {
    this.bindMouseEvents(brick.ui, g)
    // I could not achieve to use only one binding
    // With 2 bindings all the mouse events are catched,
    // but some, not all?, are catched twice.
    this.bindMouseEvents(brick.ui, svg.pathContour_)
  }
  if (brick.isExpr) {
    goog.dom.classlist.add(svg.groupShape_, 'eyo-expr')
    goog.dom.classlist.add(svg.groupContour_, 'eyo-expr')
    goog.dom.classlist.add(g, 'eyo-top')
  } else if (brick.isStmt) {
    svg.groupSharp_ = eYo.Svg.newElement('g', {
      class: 'eyo-sharp-group'
    }, null)
    goog.dom.insertSiblingAfter(svg.groupSharp_, svg.pathContour_)
    goog.dom.classlist.add(svg.groupShape_, 'eyo-stmt')
    goog.dom.classlist.add(svg.groupContour_, 'eyo-stmt')
    if (brick.isControl) {
      svg.groupPlay_ = eYo.Svg.newElement('g', {
        class: 'eyo-play'
      }, g)
      svg.pathPlayContour_ = eYo.Svg.newElement('path', {
        class: 'eyo-path-play-contour'
      }, svg.groupPlay_)
      svg.pathPlayIcon_ = eYo.Svg.newElement('path', {
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
      dom.bound.mousedown = eYo.Dom.bindEvent(
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
    var p_svg = parent.dom.svg
  } else {
    brick.workspace.dom.svg.canvas_.appendChild(g)
  }
  if (p_svg && p_svg.groupContour_) {
    goog.dom.insertChildAt(p_svg.groupContour_, svg.groupContour_, 0)
    goog.dom.classlist.add(/** @type {!Element} */(svg.groupContour_),
      'eyo-inner')
    goog.dom.appendChild(p_svg.groupShape_, svg.groupShape_)
    goog.dom.classlist.add(/** @type {!Element} */(svg.groupShape_),
      'eyo-inner')
  } else {
    goog.dom.insertChildAt(g, svg.groupContour_, 0)
    goog.dom.classlist.remove(/** @type {!Element} */svg.groupContour_,
      'eyo-inner')
    goog.dom.insertSiblingBefore(svg.groupShape_, svg.groupContour_)
    goog.dom.classlist.remove(/** @type {!Element} */svg.groupShape_,
      'eyo-inner')
  }
}

/**
 * Remove the svg related resources of brick.
 * This must be called just when changing the driver in the renderer.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickDispose = function (brick) {
  var svg = brick.dom.svg
  if (!svg) {
    return
  }
  this.clearBoundEvents(brick)
  // goog.dom.removeNode(dom.svg.group_) only once the block_ design is removed
  goog.dom.removeNode(svg.group_)
  svg.group_ = undefined
  // just in case the path were not already removed as child or a removed parent
  goog.dom.removeNode(svg.pathShape_)
  svg.pathShape_ = undefined
  goog.dom.removeNode(svg.pathContour_)
  svg.pathContour_ = undefined
  goog.dom.removeNode(svg.pathCollapsed_)
  svg.pathCollapsed_ = undefined
  goog.dom.removeNode(svg.pathBBox_)
  svg.pathBBox_ = undefined
  goog.dom.removeNode(svg.pathInner_)
  svg.pathInner_ = undefined
  goog.dom.removeNode(svg.pathSelect_)
  svg.pathSelect_ = undefined
  goog.dom.removeNode(svg.pathHilight_)
  svg.pathHilight_ = undefined
  goog.dom.removeNode(svg.pathMagnet_)
  svg.pathMagnet_ = undefined
  if (svg.groupContour_) {
    goog.dom.removeNode(svg.groupContour_)
    svg.groupContour_ = undefined
  }
  if (svg.groupShape_) {
    goog.dom.removeNode(svg.groupShape_)
    svg.groupShape_ = undefined
  }
  if (svg.groupSharp_) {
    goog.dom.removeNode(svg.groupSharp_)
    svg.groupSharp_ = undefined
  }
  if (svg.groupPlay_) {
    goog.dom.removeNode(svg.groupPlay_)
    svg.groupPlay_ = undefined
    svg.pathPlayIcon_ = undefined
    svg.pathPlayContour_ = undefined
  }
  brick.dom.svg = undefined
  this.basicDispose(brick)
}

/**
 * Whether the given brick can draw.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.brickCanDraw = function (brick) {
  return !!brick.dom.svg.pathInner_
}

/**
 * Whether the contour of the receiver is above or below the parent's one.
 * True for statements, false otherwise.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.contourAboveParent_ = function (brick) {
  return !brick instanceof eYo.Brick.Expr
}

/**
 * Whether the contour of the receiver is above or below the parent's one.
 * True for statements, false otherwise.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.brickGetBBox = function (brick) {
  return brick.dom.svg.pathShape_.getBBox()
}

/**
 * Whether the brick is visually selected.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.brickHasSelect = function (brick) {
  return goog.dom.classlist.contains(brick.dom.svg.group_, 'eyo-select')
}

/**
 * Path definition for a statement brick selection.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathSelectDef_ = function (brick) {
  return eYo.Shape.definitionWithBrick(brick, {dido: true})
}

/**
 * Generic path definition based on shape.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathDef_ = function (brick) {
  return eYo.Shape.definitionWithBrick(brick)
}

/**
 * Control brick path.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathControlDef_ = eYo.Svg.prototype.pathDef_

/**
 * Statement brick path.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathStatementDef_ = eYo.Svg.prototype.pathDef_

/**
 * Brick path.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathGroupShapeDef_ = eYo.Svg.prototype.pathDef_

/**
 * Brick path.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathValueDef_ = eYo.Svg.prototype.pathDef_


/**
 * Brick outline. Default implementation forwards to pathDef_.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathContourDef_ = eYo.Svg.prototype.pathDef_

/**
 * Highlighted brick outline. Default implementation forwards to pathDef_.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathHilightDef_ = eYo.Svg.prototype.pathDef_

/**
 * Brick outline. Default implementation forwards to pathDef_.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathShapeDef_ = eYo.Svg.prototype.pathDef_

/**
 * Brick path when collapsed.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathCollapsedDef_ = eYo.Svg.prototype.pathDef_

/**
 * Highlighted magnet outline.
 * When a brick is selected and one of its magnet is also selected
 * the ui displays a bold line on the magnet. When the brick has wrapped input,
 * the selected magnet may belong to a wrapped brick.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathMagnetDef_ = function (brick) {
  return eYo.Selected.magnet
  ? eYo.Shape.definitionWithMagnet(eYo.Selected.magnet, {hilight: true})
  : ''
}

/**
 * Rectangular outline of bricks, mainly for debugging purposes.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathBBoxDef_ = function (brick) {
  return eYo.Shape.definitionWithBrick(brick, {bbox: true})
}

/**
 * If the brick has been inited for rendering,
 * prepares the various paths.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.Svg.prototype.brickWillRender = function (brick, recorder) {
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
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.Svg.prototype.brickDidRender = eYo.Do.nothing

/**
 * Compute the paths of the brick depending on its size.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @param {*} path
 * @param {*} def
 */
eYo.Svg.prototype.updatePath_ = function (brick, path, def) {
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
eYo.Svg.prototype.brickUpdateShape = function (brick) {
  var svg = brick.dom
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
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @param {?Object} io
 * @private
 */
eYo.Svg.prototype.brickDrawModelBegin = function (brick, io) {
  io.steps = []
}

/**
 * Default implementation does nothing.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @param {?Object} io
 * @private
 */
eYo.Svg.prototype.brickDrawModelEnd = function (brick, io) {
  var d = io.steps.join(' ')
  brick.dom.svg.pathInner_.setAttribute('d', d)
}

/**
 * Make the given field disabled eventually.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickUpdateDisabled = function (brick) {
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
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @param {!Object} menu  the menu to be displayed
 */
eYo.Svg.prototype.brickMenuShow = function (brick, menu) {
  var svg = brick.dom
  var bBox = this.brickGetBBox(brick)
  var scaledHeight = bBox.height * brick.workspace.scale
  var xy = goog.style.getPageOffset(svg.group_)
  menu.showMenu(svg.group_, xy.x, xy.y + scaledHeight + 2)
}

/**
 * Called when the parent will just change.
 * This code is responsible to place the various path
 * in the proper domain of the dom tree.
 * @param {!eYo.Brick} brick child.
 * @param {!eYo.Brick} newParent to be connected.
 */
eYo.Svg.prototype.brickParentWillChange = function (brick, newParent) {
  var svg = brick.dom.svg
  if (brick.parent) {
    // this brick was connected, so its paths were located in the parents
    // groups.
    // First step, remove the relationship between the receiver
    // and the old parent, then link the receiver with the new parent.
    // this second step is performed in the `parentDidChange` method.
    var g = svg.group_
    if (g) {
      // Move this brick up the DOM.  Keep track of x/y translations.
      var brick = brick
      brick.workspace.dom.svg.canvas_.appendChild(g)
      var xy = brick.xy
      g.setAttribute('transform', `translate(${xy.x},${xy.y})`)
      if (svg.groupContour_) {
        goog.dom.insertChildAt(g, svg.groupContour_, 0)
        svg.groupContour_.removeAttribute('transform')
        goog.dom.classlist.remove(/** @type {!Element} */ svg.groupContour_,
          'eyo-inner')
        goog.dom.insertSiblingBefore(svg.groupShape_, svg.groupContour_)
        svg.groupShape_.removeAttribute('transform')
        goog.dom.classlist.remove(/** @type {!Element} */(svg.groupShape_),
          'eyo-inner')
      }
    }
  }
}

/**
 * Called when the parent did just change.
 * This code is responsible to place the various path
 * in the proper domain of the dom tree.
 * @param {!eYo.Brick} oldParent child.
 * @param {!eYo.Brick} oldParent replaced.
 */
eYo.Svg.prototype.brickParentDidChange = function (brick, oldParent) {
  if (brick.parent) {
    var dom = brick.dom
    var svg = dom.svg
    var g = svg.group_
    var oldXY = xy
    brick.parent.dom.svg.group_.appendChild(g)
    var newXY = xy
    // Move the magnets to match the child's new position.
    brick.ui.moveMagnets_(newXY.x - oldXY.x, newXY.y - oldXY.y)
    var p_svg = newParent.dom.svg
    if (svg.groupContour_ && p_svg.groupContour_) {
      if (this.contourAboveParent_(brick)) {
        goog.dom.appendChild(p_svg.groupContour_, svg.groupContour_)
      } else {
        goog.dom.insertChildAt(p_svg.groupContour_, svg.groupContour_, 0)
      }
      goog.dom.appendChild(p_svg.groupShape_, svg.groupShape_)
      goog.dom.classlist.add(/** @type {!Element} */(svg.groupContour_),
        'eyo-inner')
      goog.dom.classlist.add(/** @type {!Element} */(svg.groupShape_),
        'eyo-inner')
    }
    // manage the selection,
    // this seems tricky? Is there any undocumented side effect?
    if ((svg.pathSelect_ &&
      svg.group_ === svg.pathSelect_.parentElement) || (svg.pathMagnet_ &&
        svg.group_ === svg.pathMagnet_.parentElement)) {
      this.brickSelectRemove(brick)
      this.brickSelectAdd(brick)
    } else if ((p_svg.pathSelect_ &&
        p_svg.group_ === p_svg.pathSelect_.parentNode) || (p_svg.pathMagnet_ &&
          p_svg.group_ === p_svg.pathMagnet_.parentNode)) {
      this.brickSelectRemove(newParent)
      this.brickSelectRemove(newParent)
    }
  }
}

/**
 * Make the given brick visually wrapped or unwrapped
 * according to the brick status.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickUpdateWrapped = function (brick) {
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
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.brickSendToFront = function (brick) {
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
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.brickSendToBack = function (brick) {
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
 * Set the offset of the given brick.
 * For edython.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @param {*} dc
 * @param {*} dl
 */
eYo.Svg.prototype.brickSetOffset = function (brick, dc, dl) {
  // Workspace coordinates.
  var dx = dc * eYo.Unit.x
  var dy = dl * eYo.Unit.y
  this.brickXYMoveTo(brick, dx, dy)
}

/**
 * Set the offset of the given brick.
 * For edython.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @param {*} dx
 * @param {*} dy
 */
eYo.Svg.prototype.brickXYMoveTo = function (brick, dx, dy) {
  var svg = brick.dom.svg
  // Workspace coordinates.
  var xy = this.xyInParent(svg.group_)
  var transform = `translate(${xy.x + dx},${xy.y + dy})`
  ;[svg.group_, svg.groupShape_, svg.groupContour_].forEach(g => {
    g.setAttribute('transform', transform)
  })
}

/**
 * Move this brick during a drag, taking into account whether we are using a
 * drag surface to translate bricks.
 * This brick must be a top-level brick.
 * @param {!eYo.Brick} brick  the brick.
 * @param {!Number} dx  in workspace coordinates.
 * @param {!Number} dy  in workspace coordinates.
 * @package
 */
eYo.Svg.prototype.brickSetOffsetDuringDrag = function(brick, dx, dy) {
  if (goog.isDef(dx.x)) {
    dy = dx.y
    dx = dx.x
  }
  var svg = brick.dom.svg
  var g = svg.group_
  g.translate_ = `translate(${dx},${dy})`
  g.setAttribute('transform', g.translate_ + g.skew_)
}

/**
 * Set the offset of the receiver's brick.
 * For edython.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @param {*} dx
 * @param {*} dy
 * @return {boolean}
 */
eYo.Svg.prototype.brickSetOffset = function (brick, dx, dy) {
  var svg = brick.dom.svg
  if (!this.brickCanDraw(brick)) {
    throw `brick is not inited ${brick.type}`
  }
  // Workspace coordinates.
  var xy = this.xyInParent(svg.group_)
  var transform = `translate(${xy.x + dx},${xy.y + dy})`
  svg.group_.setAttribute('transform', transform)
  var xy1 = this.xyInParent(svg.groupShape_)
  var xy2 = this.xyInParent(svg.groupContour_)
  if ((xy.x !== xy1.x || xy.y !== xy1.y) && (xy1.x || xy1.y)) {
    console.error('WEIRD A: position !== shape position', xy, xy1)
  }
  if (xy1.x !== xy2.x || xy1.y !== xy2.y) {
    console.error('WEIRD A: shape position !== contour position', xy1, xy2)
  }
  svg.groupShape_.setAttribute('transform', transform)
  svg.groupContour_.setAttribute('transform', transform)
  xy = this.xyInParent(svg.group_)
  xy1 = this.xyInParent(svg.groupShape_)
  xy2 = this.xyInParent(svg.groupContour_)
  if ((xy.x !== xy1.x || xy.y !== xy1.y) && (xy1.x || xy1.y)) {
    console.error('WEIRD B: position !== shape position', xy, xy1)
  }
  if (xy1.x !== xy2.x || xy1.y !== xy2.y) {
    console.error('WEIRD B: shape position !== contour position', xy1, xy2)
  }
}

/**
 * Translates the brick, forwards to the ui driver.
 * @param {number} x The x coordinate of the translation in workspace units.
 * @param {number} y The y coordinate of the translation in workspace units.
 */
eYo.Svg.prototype.brickXYMoveTo = function(brick, x, y) {
  if (goog.isDef(x.x)) {
    y = x.y
    x = x.x
  }
  brick.dom.svg.group_.setAttribute(
    'transform',
    `translate(${x},${y})`
  )
}

/**
 * Return the coordinates of the top-left corner of this brick relative to the
 * drawing surface's origin (0,0), in workspace units.
 * If the brick is on the workspace, (0, 0) is the origin of the workspace
 * coordinate system.
 * This does not change with workspace scale.
 * @return {!goog.math.Coordinate} Object with .x and .y properties in
 *     workspace coordinates.
 */
eYo.Svg.prototype.brickXYInWorkspace = function (brick) {
  var x = 0
  var y = 0
  var brick = brick
  var dragSurface = brick.factory.dom.svg.brickDragSurface
  var dragSurfaceGroup = dragSurface.dom.svg.group_
  var canvas = brick.workspace.dom.svg.canvas_
  var element = brick.dom.svg.group_
  if (element) {
    do {
      // Loop through this brick and every parent.
      var xy = this.xyInParent(element)
      x += xy.x
      y += xy.y
      // If this element is the current element on the drag surface, include
      // the translation of the drag surface itself.
      if (dragSurface.currentBrick === element) {
        var translation = dragSurface.translation
        x += translation.x
        y += translation.y
      }
      element = element.parentNode
    } while (element && element != canvas && element != dragSurfaceGroup)
  }
  return new goog.math.Coordinate(x, y)
}

/**
 * Add the hilight path_.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickHilightAdd = function (brick) {
  var svg = brick.dom.svg
  if (!svg.pathHilight_.parentNode) {
    svg.group_.appendChild(svg.pathHilight_)
  }
}

/**
 * Remove the hilight path.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickHilightRemove = function (brick) {
  goog.dom.removeNode(brick.dom.svg.pathHilight_)
}

/**
 * Add the select path.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickSelectAdd = function (brick) {
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
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickSelectRemove = function (brick) {
  goog.dom.removeNode(brick.dom.svg.pathSelect_)
}

/**
 * Add the hilight path_ to the dom.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickMagnetAdd = function (brick) {
  var svg = brick.dom.svg
  if (!svg.pathMagnet_.parentNode) {
    svg.group_.appendChild(svg.pathMagnet_)
  }
}

/**
 * Remove the select path from the dom.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickMagnetRemove = function (brick) {
  goog.dom.removeNode(brick.dom.svg.pathMagnet_)
}

/**
 * The svg group has an `eyo-top` class.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickStatusTopAdd = function (brick) {
  goog.dom.classlist.add(brick.dom.svg.group_, 'eyo-top')
}

/**
 * The svg group has no `eyo-top` class.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickStatusTopRemove = function (brick) {
  goog.dom.classlist.remove(brick.dom.svg.group_, 'eyo-top')
}

/**
 * The svg group has an `eyo-select` class.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickStatusSelectAdd = function (brick) {
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
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickStatusSelectRemove = function (brick) {
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
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickDisplayedGet = function (brick) {
  var g =  brick.dom.svg.group_
  if (g) {
    return g.style.display !== 'none'
  }
}

/**
 * Set the displayed status of the given brick.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.Svg.prototype.brickDisplayedSet = function (brick, visible) {
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
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.brickDrawSharp = function (brick, visible) {
  var g = brick.dom.groupSharp_
  if (visible) {
    var children = goog.dom.getChildren(g)
    var length = children.length
    if (!length) {
      var y = eYo.Font.totalAscent
      var text = eYo.Svg.newElement('text',
        {x: 0, y: y},
        g)
      text.appendChild(document.createTextNode('#'))
      length = 1
    }
    var expected = brick.getStatementCount()
    while (length < expected) {
      y = eYo.Font.totalAscent + length * eYo.Unit.y
      text = eYo.Svg.newElement('text',
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
  } else {
    goog.dom.removeChildren(g)
  }
}

/**
 * Set the dosplay mode for bricks.
 * @param {!eYo.Brick} mode  The brick to edit.
 * @param {Boolean} dragging  The display mode for bocks.
 */
eYo.Svg.prototype.brickSetDragging = (brick, dragging) => {
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
  brick.children_.forEach(b => b.ui.setDragging(adding))
}

/**
 * Move the brick to the top level.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickSetParent = function (brick, parent) {
  var svg = brick.dom.svg
  if (parent) {
    var p_svg = parent.dom
    var oldXY = this.brickXYInWorkspace(brick)
    p_svg.group_.appendChild(svg.group_)
    var newXY = this.brickXYInWorkspace(brick)
    goog.dom.insertChildAt(p_svg.groupContour_, svg.groupContour_, 0)
    goog.dom.classlist.add(/** @type {!Element} */(svg.groupContour_),
      'eyo-inner')
    goog.dom.appendChild(p_svg.groupShape_, svg.groupShape_)
    goog.dom.classlist.add(/** @type {!Element} */(svg.groupShape_),
      'eyo-inner')
  } else {
    var oldXY = this.brickXYInWorkspace(brick)
    brick.workspace.dom.svg.canvas_.appendChild(svg.group_)
    xy && (svg.group_.setAttribute('transform', `translate(${oldXY.x},${oldXY.y})`))
    var newXY = this.brickXYInWorkspace(brick)
    goog.dom.insertChildAt(svg.group_, svg.groupContour_, 0)
    goog.dom.classlist.remove(/** @type {!Element} */svg.groupContour_,
      'eyo-inner')
    goog.dom.insertSiblingBefore(svg.groupShape_, svg.groupContour_)
    goog.dom.classlist.remove(/** @type {!Element} */svg.groupShape_,
      'eyo-inner')
  }
  brick.ui.moveMagnets_(newXY.x - oldXY.x, newXY.y - oldXY.y);
}

/**
 * Add tooltip to a brick
 * @param {!eYo.Brick} brick
 * @param {!String} key
 * @param {?Object} options
 */
eYo.Svg.prototype.brickAddTooltip = function (brick, key, options) {
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
 * Move this block back to the workspace block canvas.
 * Generally should be called at the same time as setDragging_(false).
 * @param {!eYo.Brick} brick  The brick
 * @param {!goog.math.Coordinate} newXY The position the brick should take on
 *     on the workspace canvas, in workspace coordinates.
 * @private
 */
eYo.Svg.prototype.brickMoveOffDragSurface = function(brick, newXY) {
  // Translate to current position, turning off 3d.
  this.xyBrickMoveTo(brick, newXY)
  brick.factory.dom.svg.brickDragSurface.clearAndHide(brick.workspace.dom.svg.canvas_)
}

/**
 * Update the cursor over this block by adding or removing a class.
 * @param {boolean} enable True if the delete cursor should be shown, false
 *     otherwise.
 * @package
 */
eYo.Svg.prototype.brickSetDeleteStyle = function(brick, enable) {
  (enable
    ? goog.dom.classlist.add
    : goog.dom.classlist.remove)(
      /** @type {!Element} */brick.dom.svg.group_,
      'eyo-dragging-delete'
  )
}

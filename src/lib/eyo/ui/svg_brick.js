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
  var ui = brick.ui
  if (ui.dom) {
    return
  }
  var svg = ui.dom = {}
  // groups:
  dom.group_ = eYo.Svg.newElement('g',
    {class: 'eyo-brick'}, null)
  // Expose this brick's ID on its top-level SVG group.
  if (dom.group_.dataset) {
    dom.group_.dataset.id = brick.id
  }
  dom.pathInner_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-inner'
  }, null)
  dom.pathCollapsed_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-collapsed'
  }, null)
  dom.pathContour_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-contour'
  }, null)
  dom.pathShape_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-shape'
  }, null)
  dom.pathSelect_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-selected'
  }, null)
  dom.pathHilight_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-hilighted'
  }, null)
  dom.pathMagnet_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-connection eyo-path-hilighted'
  }, null)
  this.withBBox && (dom.pathBBox_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-bbox'
  }, null))
  // Contour
  dom.groupContour_ = eYo.Svg.newElement('g',
    {class: 'eyo-contour'}, null)
  this.withBBox && (goog.dom.appendChild(dom.groupContour_, dom.pathBBox_))
  goog.dom.appendChild(dom.groupContour_, dom.pathInner_)
  goog.dom.appendChild(dom.groupContour_, dom.pathCollapsed_)
  goog.dom.appendChild(dom.groupContour_, dom.pathContour_)
  // Shape
  dom.groupShape_ = eYo.Svg.newElement('g',
    {class: 'eyo-shape'}, null)
  goog.dom.appendChild(dom.groupShape_, dom.pathShape_)
  if (!brick.workspace.options.readOnly) {
    ui.driver.bindMouseEvents(ui, dom.group_)
    // I could not achieve to use only one binding
    // With 2 bindings all the mouse events are catched,
    // but some, not all?, are catched twice.
    ui.driver.bindMouseEvents(ui, dom.pathContour_)
  }
  if (brick.isExpr) {
    goog.dom.classlist.add(dom.groupShape_, 'eyo-expr')
    goog.dom.classlist.add(dom.groupContour_, 'eyo-expr')
    goog.dom.classlist.add(dom.group_, 'eyo-top')
  } else if (brick.isStmt) {
    dom.groupSharp_ = eYo.Svg.newElement('g',
    {class: 'eyo-sharp-group'}, null)
    goog.dom.insertSiblingAfter(dom.groupSharp_, dom.pathContour_)
    goog.dom.classlist.add(dom.groupShape_, 'eyo-stmt')
    goog.dom.classlist.add(dom.groupContour_, 'eyo-stmt')
    if (brick.isControl) {
      dom.groupPlay_ = eYo.Svg.newElement('g',
      {class: 'eyo-play'}, dom.group_)
      dom.pathPlayContour_ = eYo.Svg.newElement('path',
      {class: 'eyo-path-play-contour'}, dom.groupPlay_)
      dom.pathPlayIcon_ = eYo.Svg.newElement('path',
      {class: 'eyo-path-play-icon'}, dom.groupPlay_)
      dom.pathPlayContour_.setAttribute('d', eYo.Shape.definitionForPlayContour({x: 0, y: 0}))
      dom.pathPlayIcon_.setAttribute('d', eYo.Shape.definitionForPlayIcon({x: 0, y: 0}))
      dom.bound.mousedown =
        this.bindEvent(dom.pathPlayIcon_, 'mousedown', null, e => {
        if (brick.isInFlyout) {
          return
        }
        console.log('Start executing ' + brick.id)
        brick.runScript()
      })
      goog.dom.classlist.add(dom.group_, 'eyo-start')
      goog.dom.classlist.add(dom.pathShape_, 'eyo-start-path')
      goog.dom.insertSiblingAfter(dom.groupPlay_, dom.pathHilight_)
    }
  }
  var parent = brick.parent
  if (parent) {
    var p_svg = parent.ui.dom
  } else {
    brick.workspace.getCanvas().appendChild(dom.group_)
  }
  if (p_svg && p_svg.groupContour_) {
    goog.dom.insertChildAt(p_svg.groupContour_, dom.groupContour_, 0)
    goog.dom.classlist.add(/** @type {!Element} */(dom.groupContour_),
      'eyo-inner')
    goog.dom.appendChild(p_svg.groupShape_, dom.groupShape_)
    goog.dom.classlist.add(/** @type {!Element} */(dom.groupShape_),
      'eyo-inner')
  } else {
    goog.dom.insertChildAt(dom.group_, dom.groupContour_, 0)
    goog.dom.classlist.remove(/** @type {!Element} */dom.groupContour_,
      'eyo-inner')
    goog.dom.insertSiblingBefore(dom.groupShape_, dom.groupContour_)
    goog.dom.classlist.remove(/** @type {!Element} */dom.groupShape_,
      'eyo-inner')
  }
}

/**
 * Remove the svg related resources of brick.
 * This must be called just when changing the driver in the renderer.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickDispose = function (brick) {
  this.unbindEvents(brick)
  var dom = brick.ui.dom
  // goog.dom.removeNode(dom.group_) only once the block_ design is removed
  goog.dom.removeNode(dom.group_)
  dom.group_ = undefined
  // just in case the path were not already removed as child or a removed parent
  goog.dom.removeNode(dom.pathShape_)
  dom.pathShape_ = undefined
  goog.dom.removeNode(dom.pathContour_)
  dom.pathContour_ = undefined
  goog.dom.removeNode(dom.pathCollapsed_)
  dom.pathCollapsed_ = undefined
  goog.dom.removeNode(dom.pathBBox_)
  dom.pathBBox_ = undefined
  goog.dom.removeNode(dom.pathInner_)
  dom.pathInner_ = undefined
  goog.dom.removeNode(dom.pathSelect_)
  dom.pathSelect_ = undefined
  goog.dom.removeNode(dom.pathHilight_)
  dom.pathHilight_ = undefined
  goog.dom.removeNode(dom.pathMagnet_)
  dom.pathMagnet_ = undefined
  if (dom.groupContour_) {
    goog.dom.removeNode(dom.groupContour_)
    dom.groupContour_ = undefined
  }
  if (dom.groupShape_) {
    goog.dom.removeNode(dom.groupShape_)
    dom.groupShape_ = undefined
  }
  if (dom.groupSharp_) {
    goog.dom.removeNode(dom.groupSharp_)
    dom.groupSharp_ = undefined
  }
  if (dom.groupPlay_) {
    goog.dom.removeNode(dom.groupPlay_)
    dom.groupPlay_ = undefined
    dom.pathPlayIcon_ = undefined
    dom.pathPlayContour_ = undefined
  }
  brick.ui.dom = undefined
}

/**
 * Whether the given brick can draw.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.brickCanDraw = function (brick) {
  return !!brick.ui.dom.pathInner_
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
  return brick.ui.dom.pathShape_.getBBox()
}

/**
 * Whether the brick is visually selected.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.brickHasSelect = function (brick) {
  return goog.dom.classlist.contains(brick.ui.dom.group_, 'eyo-select')
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
 * Block path.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathGroupShapeDef_ = eYo.Svg.prototype.pathDef_

/**
 * Block path.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathValueDef_ = eYo.Svg.prototype.pathDef_


/**
 * Block outline. Default implementation forwards to pathDef_.
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
 * Block outline. Default implementation forwards to pathDef_.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.pathShapeDef_ = eYo.Svg.prototype.pathDef_

/**
 * Block path when collapsed.
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
  var svg = brick.ui.dom
  if (dom.group_) {
    var F = brick.locked_ && brick.out
      ? goog.dom.classlist.add
      : goog.dom.classlist.remove
    var FF = (elt, classname) => {
      if (/** @type {!Element} */(elt)) {
        F(elt, classname)
      }
    }
    FF(dom.group_, 'eyo-locked')
    FF(dom.pathShape_, 'eyo-locked')
    FF(dom.pathContour_, 'eyo-locked')
    FF(dom.pathCollapsed_, 'eyo-locked')
    FF(dom.pathSelect_, 'eyo-locked')
    FF(dom.pathHilight_, 'eyo-locked')
    // change the class of the shape on error
    F = Object.keys(brick.errors).length
      ? goog.dom.classlist.add
      : goog.dom.classlist.remove
    FF(dom.pathShape_, 'eyo-error')
    FF(dom.pathContour_, 'eyo-error')
    FF(dom.pathCollapsed_, 'eyo-error')
    FF(dom.pathSelect_, 'eyo-error')
    FF(dom.pathHilight_, 'eyo-error')
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
  var svg = brick.ui.dom
  if (brick.ui.mayBeLast || !dom.pathContour_) {
    return
  }
  if (brick.wrapped_) {
    this.updatePath_(brick, dom.pathContour_)
    this.updatePath_(brick, dom.pathShape_)
    this.updatePath_(brick, dom.pathCollapsed_)
  } else {
    this.updatePath_(brick, dom.pathContour_, this.pathContourDef_)
    this.updatePath_(brick, dom.pathShape_, this.pathShapeDef_)
    this.updatePath_(brick, dom.pathCollapsed_, this.pathCollapsedDef_)
  }
  this.updatePath_(brick, dom.pathBBox_, this.pathBBoxDef_)
  this.updatePath_(brick, dom.pathHilight_, this.pathHilightDef_)
  this.updatePath_(brick, dom.pathSelect_, this.pathSelectDef_)
  this.updatePath_(brick, dom.pathMagnet_, this.pathMagnetDef_)
  if (brick.ui.someTargetIsMissing && !brick.isInFlyout) {
    goog.dom.classlist.add(dom.pathContour_, 'eyo-error')
  } else {
    goog.dom.classlist.remove(dom.pathContour_, 'eyo-error')
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
  brick.ui.dom.pathInner_.setAttribute('d', d)
}

/**
 * Make the given field disabled eventually.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickUpdateDisabled = function (brick) {
  var brick = brick
  var svg = brick.ui.dom
  if (brick.disabled || brick.getInheritedDisabled()) {
    goog.dom.classlist.add(
        /** @type {!Element} */ (dom.group_), 'eyo-disabled')
  } else {
    goog.dom.classlist.remove(
        /** @type {!Element} */ (dom.group_), 'eyo-disabled')
  }
}

/**
 * Show the given menu.
 * Should be obsoleted.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @param {!Object} menu  the menu to be displayed
 */
eYo.Svg.prototype.brickMenuShow = function (brick, menu) {
  var svg = brick.ui.dom
  var bBox = this.brickGetBBox(brick)
  var scaledHeight = bBox.height * brick.workspace.scale
  var xy = goog.style.getPageOffset(dom.group_)
  menu.showMenu(dom.group_, xy.x, xy.y + scaledHeight + 2)
}

/**
 * Called when the parent will just change.
 * This code is responsible to place the various path
 * in the proper domain of the dom tree.
 * @param {!eYo.Brick} brick child.
 * @param {!eYo.Brick} newParent to be connected.
 */
eYo.Svg.prototype.brickParentWillChange = function (brick, newParent) {
  var svg = brick.ui.dom
  if (brick.parent) {
    // this brick was connected, so its paths were located in the parents
    // groups.
    // First step, remove the relationship between the receiver
    // and the old parent, then link the receiver with the new parent.
    // this second step is performed in the `parentDidChange` method.
    var g = dom.group_
    if (g) {
      // Move this brick up the DOM.  Keep track of x/y translations.
      var brick = brick
      brick.workspace.getCanvas().appendChild(g)
      var xy = brick.ui.xyInWorkspace
      g.setAttribute('transform', `translate(${xy.x},${xy.y})`)
      if (dom.groupContour_) {
        goog.dom.insertChildAt(g, dom.groupContour_, 0)
        dom.groupContour_.removeAttribute('transform')
        goog.dom.classlist.remove(/** @type {!Element} */(dom.groupContour_),
          'eyo-inner')
        goog.dom.insertSiblingBefore(dom.groupShape_, dom.groupContour_)
        dom.groupShape_.removeAttribute('transform')
        goog.dom.classlist.remove(/** @type {!Element} */(dom.groupShape_),
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
    var ui = brick.ui
    var svg = ui.dom
    var g = dom.group_
    var oldXY = ui.xyInWorkspace
    brick.parent.ui.dom.group_.appendChild(g)
    var newXY = ui.xyInWorkspace
    // Move the magnets to match the child's new position.
    brick.ui.moveMagnets_(newXY.x - oldXY.x, newXY.y - oldXY.y)
    var p_svg = newParent.ui.dom
    if (dom.groupContour_ && p_svg.groupContour_) {
      if (this.contourAboveParent_(brick)) {
        goog.dom.appendChild(p_svg.groupContour_, dom.groupContour_)
      } else {
        goog.dom.insertChildAt(p_svg.groupContour_, dom.groupContour_, 0)
      }
      goog.dom.appendChild(p_svg.groupShape_, dom.groupShape_)
      goog.dom.classlist.add(/** @type {!Element} */(dom.groupContour_),
        'eyo-inner')
      goog.dom.classlist.add(/** @type {!Element} */(dom.groupShape_),
        'eyo-inner')
    }
    // manage the selection,
    // this seems tricky? Is there any undocumented side effect?
    if ((dom.pathSelect_ &&
      dom.group_ === dom.pathSelect_.parentElement) || (dom.pathMagnet_ &&
          dom.group_ === dom.pathMagnet_.parentElement)) {
      this.brickSelectRemove(brick)
      this.brickSelectAdd(brick)
    } else if ((p_svg.pathSelect_ &&
        p_svg.group_ === p_svg.pathSelect_.parentNode) || (p_svg.pathMagnet_ &&
          p_svg.group_ === newParent.pathMagnet_.parentNode)) {
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
  var dom = brick.ui.dom
  if (brick.wrapped_ && !dom.wrapped) {
    dom.wrapped = true
    dom.pathShape_.style.display = 'none'
    dom.pathContour_.style.display = 'none'
  } else if (!brick.wrapped_ && dom.wrapped) {
    dom.wrapped = false
    dom.pathContour_.removeAttribute('display')
    dom.pathShape_.removeAttribute('display')
  }
}

/**
 * Send to front.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.brickSendToFront = function (brick) {
  var eyo = brick
  var parent
  while ((parent = eyo.surround)) {
    eyo = parent
  }
  var g = eyo.ui.dom.group_
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
  var eyo = brick
  var parent
  while ((parent = eyo.surround)) {
    eyo = parent
  }
  var g = eyo.ui.dom.group_
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
 * @return {boolean}
 */
eYo.Svg.prototype.brickSetOffset = function (brick, dc, dl) {
  var svg = brick.ui.dom
  // Workspace coordinates.
  var dx = dc * eYo.Unit.x
  var dy = dl * eYo.Unit.y
  var xy = this.xyInParent(dom.group_)
  var transform = `translate(${xy.x + dx},${xy.y + dy})`
  ;[dom.group_, dom.groupShape_, dom.groupContour_].forEach(g => {
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
  var svg = brick.ui.dom
  dom.group_.translate_ = `translate(${dx},${dy})`
  dom.group_.setAttribute('transform',
  dom.group_.translate_ + dom.group_.skew_)
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
  var svg = brick.ui.dom
  if (!this.brickCanDraw(brick)) {
    throw `brick is not inited ${brick.type}`
  }
  // Workspace coordinates.
  var xy = this.xyInParent(dom.group_)
  var transform = `translate(${xy.x + dx},${xy.y + dy})`
  dom.group_.setAttribute('transform', transform)
  var xy1 = this.xyInParent(dom.groupShape_)
  var xy2 = this.xyInParent(dom.groupContour_)
  if ((xy.x !== xy1.x || xy.y !== xy1.y) && (xy1.x || xy1.y)) {
    console.error('WEIRD A: position !== shape position', xy, xy1)
  }
  if (xy1.x !== xy2.x || xy1.y !== xy2.y) {
    console.error('WEIRD A: shape position !== contour position', xy1, xy2)
  }
  dom.groupShape_.setAttribute('transform', transform)
  dom.groupContour_.setAttribute('transform', transform)
  xy = this.xyInParent(dom.group_)
  xy1 = this.xyInParent(dom.groupShape_)
  xy2 = this.xyInParent(dom.groupContour_)
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
eYo.Svg.prototype.brickTranslate = function(brick, x, y) {
  brick.ui.dom.group_.setAttribute('transform', `translate(${x},${y})`)
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
  var dragSurface = brick.ui.useDragSurface_ && brick.workspace.brickDragSurface_
  var dragSurfaceGroup = dragSurface && (dragSurface.getGroup())
  var canvas = brick.workspace.getCanvas()
  var element = brick.ui.dom.group_
  if (element) {
    do {
      // Loop through this brick and every parent.
      var xy = this.xyInParent(element)
      x += xy.x
      y += xy.y
      // If this element is the current element on the drag surface, include
      // the translation of the drag surface itself.
      if (dragSurface && dragSurface.getCurrentBlock() === element) {
        var surfaceTranslation = dragSurface.getSurfaceTranslation()
        x += surfaceTranslation.x
        y += surfaceTranslation.y
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
  var svg = brick.ui.dom
  if (!dom.pathHilight_.parentNode) {
    dom.group_.appendChild(dom.pathHilight_)
  }
}

/**
 * Remove the hilight path.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickHilightRemove = function (brick) {
  goog.dom.removeNode(brick.ui.dom.pathHilight_)
}

/**
 * Add the select path.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickSelectAdd = function (brick) {
  var svg = brick.ui.dom
  if (!dom.pathSelect_.parentNode) {
    if (dom.pathHilight_.parentNode) {
      dom.group_.insertBefore(dom.pathSelect_, dom.pathHilight_)
    } else if (dom.pathMagnet_.parentNode) {
      dom.group_.insertBefore(dom.pathSelect_, dom.pathMagnet_)
    } else {
      dom.group_.appendChild(dom.pathSelect_)
    }
  }
}

/**
 * Remove the select path.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickSelectRemove = function (brick) {
  goog.dom.removeNode(brick.ui.dom.pathSelect_)
}

/**
 * Add the hilight path_ to the dom.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickMagnetAdd = function (brick) {
  var svg = brick.ui.dom
  if (!dom.pathMagnet_.parentNode) {
    dom.group_.appendChild(dom.pathMagnet_)
  }
}

/**
 * Remove the select path from the dom.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickMagnetRemove = function (brick) {
  goog.dom.removeNode(brick.ui.dom.pathMagnet_)
}

/**
 * The svg group has an `eyo-top` class.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickStatusTopAdd = function (brick) {
  goog.dom.classlist.add(brick.ui.dom.group_, 'eyo-top')
}

/**
 * The svg group has no `eyo-top` class.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickStatusTopRemove = function (brick) {
  goog.dom.classlist.remove(brick.ui.dom.group_, 'eyo-top')
}

/**
 * The svg group has an `eyo-select` class.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickStatusSelectAdd = function (brick) {
  var svg = brick.ui.dom
  var g = dom.group_
  if (goog.dom.classlist.contains(g, 'eyo-select')) {
    return
  }
  goog.dom.classlist.add(g, 'eyo-select')
  if ((g = dom.groupContour_)) {
    // maybe that brick has not been rendered yet
    goog.dom.classlist.add(g, 'eyo-select')
  }
}

/**
 * The svg group has an `eyo-select` class.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickStatusSelectRemove = function (brick) {
  var svg = brick.ui.dom
  var g = dom.group_
  goog.dom.classlist.remove(g, 'eyo-select')
  if ((g = dom.groupContour_)) {
    // maybe that brick has not been rendered yet
    goog.dom.classlist.remove(g, 'eyo-select')
  }
}

/**
 * Get the displayed status of the given brick.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickDisplayedGet = function (brick) {
  var g =  brick.ui.dom.group_
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
  var svg =  brick.ui.dom
  var g =  dom.group_
  if (g) {
    var d = visible ? 'block' : 'none'
    g.style.display = d
    if ((g = dom.groupContour_)) {
      g.style.display = dom.groupShape_.style.display = d
    }
  }
}

/**
 * Draw/hide the sharp.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.brickDrawSharp = function (brick, visible) {
  var g = brick.ui.dom.groupSharp_
  if (visible) {
    var children = goog.dom.getChildren(g)
    var length = children.length
    if (!length) {
      var y = eYo.Font.totalAscent
      var text = eYo.Svg.newElement('text',
        {'x': 0, 'y': y},
        g)
      text.appendChild(document.createTextNode('#'))
      length = 1
    }
    var expected = brick.getStatementCount()
    while (length < expected) {
      y = eYo.Font.totalAscent + length * eYo.Unit.y
      text = eYo.Svg.newElement('text',
        {'x': 0, 'y': y},
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
  var svg = brick.ui.dom
  if (dragging) {
    var group = dom.group_
    group.translate_ = ''
    group.skew_ = ''
    goog.dom.classlist.add(
        /** @type {!Element} */ (group), 'eyo-dragging')
  } else {
    goog.dom.classlist.remove(
        /** @type {!Element} */ (group), 'eyo-dragging')
  }
  // Recurse through all bricks attached under this one.
  brick.children_.forEach(b => b.ui.setDragging(adding))
}

/**
 * Move the brick to the top level.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickSetParent = function (brick, parent) {
  var svg = brick.ui.dom
  if (parent) {
    var p_svg = parent.ui.dom
    var oldXY = this.brickXYInWorkspace(brick)
    p_svg.group_.appendChild(dom.group_)
    var newXY = this.brickXYInWorkspace(brick)
    goog.dom.insertChildAt(p_svg.groupContour_, dom.groupContour_, 0)
    goog.dom.classlist.add(/** @type {!Element} */(dom.groupContour_),
      'eyo-inner')
    goog.dom.appendChild(p_svg.groupShape_, dom.groupShape_)
    goog.dom.classlist.add(/** @type {!Element} */(dom.groupShape_),
      'eyo-inner')
  } else {
    var oldXY = this.brickXYInWorkspace(brick)
    brick.workspace.getCanvas().appendChild(dom.group_)
    xy && (dom.group_.setAttribute('transform', `translate(${oldXY.x},${oldXY.y})`))
    var newXY = this.brickXYInWorkspace(brick)
    goog.dom.insertChildAt(dom.group_, dom.groupContour_, 0)
    goog.dom.classlist.remove(/** @type {!Element} */dom.groupContour_,
      'eyo-inner')
    goog.dom.insertSiblingBefore(dom.groupShape_, dom.groupContour_)
    goog.dom.classlist.remove(/** @type {!Element} */dom.groupShape_,
      'eyo-inner')
  }
  brick.ui.moveMagnets_(newXY.x - oldXY.x, newXY.y - oldXY.y);
}

/**
 * Move the brick to the top level.
 * @param {!eYo.Brick} field  the brick the driver acts on
 */
eYo.Svg.prototype.brickAtTop = function (brick) {
  var g = brick.ui.dom.group_
  // Move this brick up the DOM.  Keep track of x/y translations.
  var xy = this.brickXYInWorkspace(brick)
  this.workspace.getCanvas().appendChild(g)
  g.setAttribute('transform', `translate(${xy.x},${xy.y})`)
}

/**
 * Add tooltip to a brick
 * @param {!eYo.Brick} brick
 * @param {!String} key
 * @param {?Object} options
 */
eYo.Svg.prototype.brickAddTooltip = function (brick, key, options) {
  var g = brick.ui.dom.group
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
 * Dispose of the magnet SVG ressources.
 * @param {!eYo.Magnet} magnet
 */
eYo.Svg.prototype.brickMoveToDragSurface = function (brick) {
  // The translation for drag surface bricks,
  // is equal to the current relative-to-surface position,
  // to keep the position in sync as it move on/off the surface.
  // This is in workspace coordinates.
  var xy = this.brickXYInWorkspace(brick)
  this.removeAttribute(brick.dom.group_, 'transform');
  brick.workspace.brickDragSurface_.translateSurface(xy.x, xy.y)
  // Execute the move on the top-level SVG component
  brick.workspace.brickDragSurface_.setBlocksAndShow(brick.dom.group_)
}


/**
 * Move this block back to the workspace block canvas.
 * Generally should be called at the same time as setDragging_(false).
 * Does nothing if useDragSurface_ is false.
 * @param {!eYo.Brick} brick  The brick
 * @param {!goog.math.Coordinate} newXY The position the brick should take on
 *     on the workspace canvas, in workspace coordinates.
 * @private
 */
eYo.Svg.prototype.brickMoveOffDragSurface = function(brick, newXY) {
  if (!brick.ui.useDragSurface_) {
    return
  }
  // Translate to current position, turning off 3d.
  brick.translate(newXY.x, newXY.y)
  brick.workspace.brickDragSurface_.clearAndHide(brick.workspace.getCanvas())
}

/**
 * Update the cursor over this block by adding or removing a class.
 * @param {boolean} enable True if the delete cursor should be shown, false
 *     otherwise.
 * @package
 */
eYo.Svg.prototype.brickSetDeleteStyle = function(brick, enable) {
  if (enable) {
    goog.dom.classlist.add(/** @type {!Element} */ (brick.ui.dom.group_),
        'eyo-dragging-delete')
  } else {
    goog.dom.classlist.remove(/** @type {!Element} */ (brick.ui.dom.group_),
        'eyo-dragging-delete')
  }
}
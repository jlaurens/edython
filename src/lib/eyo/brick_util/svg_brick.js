/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Rendering driver, brick methods.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Brick')

goog.require('eYo.Svg')

// Brick management

/**
 * Initialize the given brick.
 * Adds to brick's renderer a `svg` attribute owning all the svg related resources.
 * The svg
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickInit = function (brick) {
  var svg = brick.ui.svg = {}
  // groups:
  svg.group_ = eYo.Svg.newElement('g',
    {class: 'eyo-brick'}, null)
  // Expose this brick's ID on its top-level SVG group.
  if (svg.group_.dataset) {
    svg.group_.dataset.id = brick.id;
  }
  // brick.svgGroup_ = eYo.Svg.newElement('g',
  //   {class: 'eyo-root'}, null)
  // goog.dom.insertChildAt(svg.svgRoot_, brick.svgGroup_, 0)
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
  this.withBBox && (svg.pathBBox_ = eYo.Svg.newElement('path', {
    class: 'eyo-path-bbox'
  }, null))
  // Contour
  svg.groupContour_ = eYo.Svg.newElement('g',
    {class: 'eyo-contour'}, null)
  this.withBBox && (goog.dom.appendChild(svg.groupContour_, svg.pathBBox_))
  goog.dom.appendChild(svg.groupContour_, svg.pathInner_)
  goog.dom.appendChild(svg.groupContour_, svg.pathCollapsed_)
  goog.dom.appendChild(svg.groupContour_, svg.pathContour_)
  // Shape
  svg.groupShape_ = eYo.Svg.newElement('g',
    {class: 'eyo-shape'}, null)
  goog.dom.appendChild(svg.groupShape_, svg.pathShape_)
  if (!brick.workspace.options.readOnly && !svg.eventsInit_) {
    eYo.Svg.bindEventWithChecks_(
      svg.group_, 'mousedown', brick, brick.onMouseDown_);
    eYo.Svg.bindEventWithChecks_(
      svg.group_, 'mouseup', brick, brick.onMouseUp_);
    // I could not achieve to use only one binding
    // With 2 bindings all the mouse events are catched,
    // but some, not all?, are catched twice.
    eYo.Svg.bindEventWithChecks_(
      svg.pathContour_, 'mousedown', brick, brick.onMouseDown_);
    eYo.Svg.bindEventWithChecks_(
      svg.pathContour_, 'mouseup', brick, brick.onMouseUp_);
  }
  if (brick.isExpr) {
    goog.dom.classlist.add(svg.groupShape_, 'eyo-expr')
    goog.dom.classlist.add(svg.groupContour_, 'eyo-expr')
    goog.dom.classlist.add(svg.group_, 'eyo-top')
  } else if (brick.isStmt) {
    svg.groupSharp_ = eYo.Svg.newElement('g',
    {class: 'eyo-sharp-group'}, null)
    goog.dom.insertSiblingAfter(svg.groupSharp_, svg.pathContour_)
    goog.dom.classlist.add(svg.groupShape_, 'eyo-stmt')
    goog.dom.classlist.add(svg.groupContour_, 'eyo-stmt')
    if (brick.isControl) {
      svg.groupPlay_ = eYo.Svg.newElement('g',
      {class: 'eyo-play'}, svg.group_)
      svg.pathPlayContour_ = eYo.Svg.newElement('path',
      {class: 'eyo-path-play-contour'}, svg.groupPlay_)
      svg.pathPlayIcon_ = eYo.Svg.newElement('path',
      {class: 'eyo-path-play-icon'}, svg.groupPlay_)
      svg.pathPlayContour_.setAttribute('d', eYo.Shape.definitionForPlayContour({x: 0, y: 0}))
      svg.pathPlayIcon_.setAttribute('d', eYo.Shape.definitionForPlayIcon({x: 0, y: 0}))
      svg.mouseDownWrapper_ =
        eYo.Svg.bindEventWithChecks_(svg.pathPlayIcon_, 'mousedown', null, e => {
        if (brick.isInFlyout) {
          return
        }
        console.log('Start executing ' + brick.id)
        svg.runScript && (svg.runScript())
      })
      goog.dom.classlist.add(svg.group_, 'eyo-start')
      goog.dom.classlist.add(svg.pathShape_, 'eyo-start-path')
      goog.dom.insertSiblingAfter(svg.groupPlay_, svg.pathHilight_)
    }
  }
  var parent = brick.parent
  if (parent) {
    var p_svg = parent.ui.svg
  } else {
    brick.workspace.getCanvas().appendChild(svg.group_)
  }
  if (p_svg && p_svg.groupContour_) {
    goog.dom.insertChildAt(p_svg.groupContour_, svg.groupContour_, 0)
    goog.dom.classlist.add(/** @type {!Element} */(svg.groupContour_),
      'eyo-inner')
    goog.dom.appendChild(p_svg.groupShape_, svg.groupShape_)
    goog.dom.classlist.add(/** @type {!Element} */(svg.groupShape_),
      'eyo-inner')
  } else {
    goog.dom.insertChildAt(svg.group_, svg.groupContour_, 0)
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
  var svg = brick.ui.svg
  // goog.dom.removeNode(svg.group_) only once the block_ design is removed
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
    if (svg.mouseDownWrapper_) {
      Blockly.unbindEvent_(svg.mouseDownWrapper_)
      svg.mouseDownWrapper_ = null
    }
  }
  brick.ui.svg = undefined
}

/**
 * Whether the given brick can draw.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.brickCanDraw = function (brick) {
  return !!brick.ui.svg.pathInner_
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
  return brick.ui.svg.pathShape_.getBBox()
}

/**
 * Whether the brick is visually selected.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.brickHasSelect = function (brick) {
  return goog.dom.classlist.contains(brick.ui.svg.group_, 'eyo-select')
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
 * Prepares the various paths.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.Svg.prototype.brickWillRender = function (brick, recorder) {
  var svg = brick.ui.svg
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
  var svg = brick.ui.svg
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
  brick.ui.svg.pathInner_.setAttribute('d', d)
}

/**
 * Make the given field disabled eventually.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickUpdateDisabled = function (brick) {
  var brick = brick
  var svg = brick.ui.svg
  if (brick.disabled || brick.getInheritedDisabled()) {
    goog.dom.classlist.add(
        /** @type {!Element} */ (svg.group_), 'eyo-disabled')
  } else {
    goog.dom.classlist.remove(
        /** @type {!Element} */ (svg.group_), 'eyo-disabled')
  }
}

/**
 * Play some UI effects (sound, animation) when disposing of a block.
 */
eYo.Svg.prototype.brickDisposeEffect = (() => {
  /*
  * Animate a cloned block and eventually dispose of it.
  * This is a class method, not an instance method since the original block has
  * been destroyed and is no longer accessible.
  * @param {!Element} clone SVG element to animate and dispose of.
  * @param {boolean} rtl True if RTL, false if LTR.
  * @param {!Date} start Date of animation's start.
  * @param {number} workspaceScale Scale of workspace.
  * @private
  */
  var step = (clone, start, scale) => {
    var ms = new Date - start;
    var percent = ms / 150;
    if (percent > 1) {
      goog.dom.removeNode(clone)
      return
    }
    var x = clone.translateX_ +
      clone.bBox_.width * scale / 2 * percent
    var y = clone.translateY_ +
      clone.bBox_.height * scale * percent
    clone.setAttribute('transform',
      `translate(${x},${y}) scale(${(1 - percent) * scale})`)
    setTimeout(step, 10, clone, start, scale)
  }
  return function(brick) {
    var svg = brick.ui.svg
    var xy = brick.workspace.getSvgXY(/** @type {!Element} */ (svg.group_))
    // Deeply clone the current block.
    var clone = svg.group_.cloneNode(true);
    clone.translateX_ = xy.x;
    clone.translateY_ = xy.y;
    clone.setAttribute('transform',
      `translate(${clone.translateX_},${clone.translateY_})`)
    brick.workspace.getParentSvg().appendChild(clone)
    clone.bBox_ = clone.getBBox()
    // Start the animation.
    step(clone, new Date, this.workspace.scale)
  }
})()


/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickConnectEffect = function (brick) {
  var svg = brick.ui.svg
  var w = brick.workspace
  var xy = w.getSvgXY(/** @type {!Element} */ (svg.group_))
  if (brick.out_m) {
    var h = svg.height * w.scale / 2
    var ripple = eYo.Svg.newElement('circle',
      {class: 'blocklyHighlightedConnectionPathH', 'cx': xy.x, 'cy': xy.y + h, 'r': 2 * h / 3},
      w.getParentSvg())
  } else {
  // Determine the absolute coordinates of the inferior brick.
    var steps = eYo.Svg.magnetHighlightedPath_.attributes['d'].value
    ripple = eYo.Svg.newElement('path',
      {class: 'blocklyHighlightedConnectionPath',
        d: steps,
        transform: `translate(${xy.x},${xy.y})`},
      w.getParentSvg())
  }
  // Start the animation.
  eYo.Svg.connectionUiStep_(ripple, new Date(), w.scale)
}

/**
 * Expand a ripple around a connection.
 * @param {!Element} ripple Element to animate.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
eYo.Svg.connectionUiStep_ = function (ripple, start, workspaceScale) {
  var ms = new Date() - start
  var percent = ms / 200
  if (percent > 1) {
    goog.dom.removeNode(ripple)
  } else {
    ripple.style.opacity = 8 * Math.pow(percent, 2) * Math.pow(1 - percent, 2)
    eYo.UI.disconnectUiStop_.pid_ = setTimeout(
      eYo.Svg.connectionUiStep_, 10, ripple, start, workspaceScale)
  }
}

/**
 * Show the given menu.
 * Should be obsoleted.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @param {!Object} menu  the menu to be displayed
 */
eYo.Svg.prototype.brickMenuShow = function (brick, menu) {
  var svg = brick.ui.svg
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
  var svg = brick.ui.svg
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
      brick.workspace.getCanvas().appendChild(g)
      var xy = brick.ui.xyInSurface
      g.setAttribute('transform', `translate(${xy.x},${xy.y})`)
      if (svg.groupContour_) {
        goog.dom.insertChildAt(g, svg.groupContour_, 0)
        svg.groupContour_.removeAttribute('transform')
        goog.dom.classlist.remove(/** @type {!Element} */(svg.groupContour_),
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
    var ui = brick.ui
    var svg = ui.svg
    var g = svg.group_
    var oldXY = ui.xyInSurface
    brick.parent.ui.svg.group_.appendChild(g)
    var newXY = ui.xyInSurface
    // Move the connections to match the child's new position.
    brick.moveMagnets_(newXY.x - oldXY.x, newXY.y - oldXY.y)
    var p_svg = newParent.ui.svg
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
  var svg = brick.ui.svg
  if (brick.wrapped_ && !svg.wrapped) {
    svg.wrapped = true
    svg.pathShape_.setAttribute('display', 'none')
    svg.pathContour_.setAttribute('display', 'none')
  } else if (!brick.wrapped_ && svg.wrapped) {
    svg.wrapped = false
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
  var eyo = brick
  var parent
  while ((parent = eyo.surround)) {
    eyo = parent
  }
  var g = eyo.ui.svg.group_
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
  var g = eyo.ui.svg.group_
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
  var svg = brick.ui.svg
  // Workspace coordinates.
  var dx = dc * eYo.Unit.x
  var dy = dl * eYo.Unit.y
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
  var svg = brick.ui.svg
  svg.group_.translate_ = `translate(${dx},${dy})`
  svg.group_.setAttribute('transform',
  svg.group_.translate_ + svg.group_.skew_)
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
  var svg = brick.ui.svg
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
eYo.Svg.prototype.brickTranslate = function(brick, x, y) {
  brick.ui.svg.group_.setAttribute('transform', `translate(${x},${y})`)
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
eYo.Svg.prototype.brickXYInSurface = function (brick) {
  var x = 0
  var y = 0
  var brick = brick
  var dragSurface = brick.useDragSurface_ && brick.workspace.blockDragSurface_
  var dragSurfaceGroup = dragSurface && (dragSurface.getGroup())
  var canvas = brick.workspace.getCanvas()
  var element = brick.ui.svg.group_
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
  var svg = brick.ui.svg
  if (!svg.pathHilight_.parentNode) {
    svg.group_.appendChild(svg.pathHilight_)
  }
}

/**
 * Remove the hilight path.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickHilightRemove = function (brick) {
  goog.dom.removeNode(brick.ui.svg.pathHilight_)
}

/**
 * Add the select path.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickSelectAdd = function (brick) {
  var svg = brick.ui.svg
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
  goog.dom.removeNode(brick.ui.svg.pathSelect_)
}

/**
 * Add the hilight path_ to the dom.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickMagnetAdd = function (brick) {
  var svg = brick.ui.svg
  if (!svg.pathMagnet_.parentNode) {
    svg.group_.appendChild(svg.pathMagnet_)
  }
}

/**
 * Remove the select path from the dom.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickMagnetRemove = function (brick) {
  goog.dom.removeNode(brick.ui.svg.pathMagnet_)
}

/**
 * The svg group has an `eyo-top` class.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickStatusTopAdd = function (brick) {
  goog.dom.classlist.add(brick.ui.svg.group_, 'eyo-top')
}

/**
 * The svg group has no `eyo-top` class.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickStatusTopRemove = function (brick) {
  goog.dom.classlist.remove(brick.ui.svg.group_, 'eyo-top')
}

/**
 * The svg group has an `eyo-select` class.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickStatusSelectAdd = function (brick) {
  var svg = brick.ui.svg
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
  var svg = brick.ui.svg
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
  var g =  brick.ui.svg.group_
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
  var svg =  brick.ui.svg
  var g =  svg.group_
  if (g) {
    var d = visible ? 'brick' : 'none'
    g.style.display = d
    if ((g = svg.groupContour_)) {
      g.style.display = svg.groupShape_.style.display = d
    }
  }
}

/**
 * Hide the brick. Default implementation does nothing.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.brickHide = function (brick) {
  var svg = brick.ui.svg
  var root = svg.group_
  if (root) {
    root.setAttribute('display', 'none')
    if (svg.groupContour_) {
      svg.groupContour_.setAttribute('display', 'none')
      svg.groupShape_.setAttribute('display', 'none')
    }
  } else {
    console.log('Block with no root: did you ...initSvg()?')
  }
}


/**
 * Draw/hide the sharp.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 * @private
 */
eYo.Svg.prototype.brickDrawSharp = function (brick, visible) {
  var g = brick.ui.svg.groupSharp_
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
      y = eYo.Font.totalAscent + length * eYo.Font.lineHeight
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
 * @param {!String} mode  The display mode for bocks.
 */
eYo.Svg.prototype.brickSetDragging = (brick, adding) => {
  var svg = brick.ui.svg
  if (adding) {
    var group = svg.group_
    group.translate_ = '';
    group.skew_ = '';
    Blockly.draggingConnections_ =
        Blockly.draggingConnections_.concat(brick.getMagnets_(true))
    goog.dom.classlist.add(
        /** @type {!Element} */ (group), 'eyo-dragging');
  } else {
    Blockly.draggingConnections_ = [];
    goog.dom.classlist.remove(
        /** @type {!Element} */ (group), 'eyo-dragging');
  }
  // Recurse through all bricks attached under this one.
  brick.children_.forEach(b => b.setDragging(adding))
}

/**
 * Move the brick to the top level.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickSetParent = function (brick, parent) {
  var svg = brick.ui.svg
  if (parent) {
    var p_svg = parent.ui.svg
    var oldXY = this.brickXYInSurface(brick)
    p_svg.group_.appendChild(svg.group_)
    var newXY = this.brickXYInSurface(brick)
    goog.dom.insertChildAt(p_svg.groupContour_, svg.groupContour_, 0)
    goog.dom.classlist.add(/** @type {!Element} */(svg.groupContour_),
      'eyo-inner')
    goog.dom.appendChild(p_svg.groupShape_, svg.groupShape_)
    goog.dom.classlist.add(/** @type {!Element} */(svg.groupShape_),
      'eyo-inner')
  } else {
    var oldXY = this.brickXYInSurface(brick)
    brick.workspace.getCanvas().appendChild(svg.group_)
    xy && (svg.group_.setAttribute('transform', `translate(${oldXY.x},${oldXY.y})`))
    var newXY = this.brickXYInSurface(brick)
    goog.dom.insertChildAt(svg.group_, svg.groupContour_, 0)
    goog.dom.classlist.remove(/** @type {!Element} */svg.groupContour_,
      'eyo-inner')
    goog.dom.insertSiblingBefore(svg.groupShape_, svg.groupContour_)
    goog.dom.classlist.remove(/** @type {!Element} */svg.groupShape_,
      'eyo-inner')
  }
  brick.moveMagnets_(newXY.x - oldXY.x, newXY.y - oldXY.y);
}

/**
 * Move the brick to the top level.
 * @param {!eYo.Brick} field  the brick the driver acts on
 */
eYo.Svg.prototype.brickAtTop = function (brick) {
  var g = brick.ui.svg.group_
  // Move this brick up the DOM.  Keep track of x/y translations.
  var xy = this.brickXYInSurface(brick)
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
  var g = brick.ui.svg.group
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
  var xy = this.brickXYInSurface(brick)
  this.removeAttribute(brick.svg.group_, 'transform');
  brick.workspace.blockDragSurface_.translateSurface(xy.x, xy.y)
  // Execute the move on the top-level SVG component
  brick.workspace.blockDragSurface_.setBlocksAndShow(brick.svg.group_)
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
eYo.Svg.prototype.brickMoveOffDragSurface_ = function(brick, newXY) {
  if (!brick.useDragSurface_) {
    return;
  }
  // Translate to current position, turning off 3d.
  brick.translate(newXY.x, newXY.y)
  brick.workspace.blockDragSurface_.clearAndHide(brick.workspace.getCanvas())
}

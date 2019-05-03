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

goog.provide('eYo.Driver.Svg')

goog.require('eYo.Driver')

/**
 * A namespace.
 * @namespace eYo.Delegate.prototype.svg
 */

/**
 * Svg driver to help rendering blocks in a svg context.
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
 * @memberof eYo.Delegate.prototype.svg
 */

eYo.Driver.Svg = function () {
  eYo.Driver.Svg.superClass_.constructor.call(this)
}
goog.inherits(eYo.Driver.Svg, eYo.Driver)

eYo.Driver.Svg.prototype.withBBox = true

/**
 * Initialize the given node.
 * Adds to node's renderer a `svg` attribute owning all the svg related resources.
 * The svg 
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeInit = function (node) {
  var svg = node.ui.svg = {}
  var block = node.block_
  // We still need those paths
  // goog.dom.removeNode(block.svgPath_)
  // delete block.svgPath_
  goog.dom.removeNode(block.svgPathLight_)
  delete block.svgPathLight_
  goog.dom.removeNode(block.svgPathDark_)
  delete block.svgPathDark_
  // groups:
  svg.group_ = block.svgGroup_
  goog.dom.classlist.add(/** @type {!Element} */ (svg.group_),
    'eyo-block')
  // block.svgGroup_ = Blockly.utils.createSvgElement('g',
  //   {class: 'eyo-root'}, null)
  // goog.dom.insertChildAt(svg.svgRoot_, block.svgGroup_, 0)
  svg.pathInner_ = Blockly.utils.createSvgElement('path', {
    class: 'eyo-path-inner'
  }, null)
  svg.pathCollapsed_ = Blockly.utils.createSvgElement('path', {
    class: 'eyo-path-collapsed'
  }, null)
  svg.pathContour_ = Blockly.utils.createSvgElement('path', {
    class: 'eyo-path-contour'
  }, null)
  svg.pathShape_ = Blockly.utils.createSvgElement('path', {
    class: 'eyo-path-shape'
  }, null)
  svg.pathSelect_ = Blockly.utils.createSvgElement('path', {
    class: 'eyo-path-selected'
  }, null)
  svg.pathHilight_ = Blockly.utils.createSvgElement('path', {
    class: 'eyo-path-hilighted'
  }, null)
  svg.pathConnection_ = Blockly.utils.createSvgElement('path', {
    class: 'eyo-path-connection eyo-path-hilighted'
  }, null)
  this.withBBox && (svg.pathBBox_ = Blockly.utils.createSvgElement('path', {
    class: 'eyo-path-bbox'
  }, null))
  // Contour
  svg.groupContour_ = Blockly.utils.createSvgElement('g',
    {class: 'eyo-contour'}, null)
  this.withBBox && goog.dom.appendChild(svg.groupContour_, svg.pathBBox_)
  goog.dom.appendChild(svg.groupContour_, svg.pathInner_)
  goog.dom.appendChild(svg.groupContour_, svg.pathCollapsed_)
  goog.dom.appendChild(svg.groupContour_, svg.pathContour_)
  // Shape
  svg.groupShape_ = Blockly.utils.createSvgElement('g',
    {class: 'eyo-shape'}, null)
  goog.dom.appendChild(svg.groupShape_, svg.pathShape_)
  if (!node.workspace.options.readOnly && !svg.eventsInit_) {
    Blockly.bindEventWithChecks_(
      svg.group_, 'mousedown', block, block.onMouseDown_);
    Blockly.bindEventWithChecks_(
      svg.group_, 'mouseup', block, block.onMouseUp_);
    // I could not achieve to use only one binding
    // With 2 bindings all the mouse events are catched,
    // but some, not all?, are catched twice.
    Blockly.bindEventWithChecks_(
      svg.pathContour_, 'mousedown', block, block.onMouseDown_);
    Blockly.bindEventWithChecks_(
      svg.pathContour_, 'mouseup', block, block.onMouseUp_);
  }
  if (node.isExpr) {
    goog.dom.classlist.add(svg.groupShape_, 'eyo-expr')
    goog.dom.classlist.add(svg.groupContour_, 'eyo-expr')
    goog.dom.classlist.add(svg.group_, 'eyo-top')
  } else if (node.isStmt) {
    svg.groupSharp_ = Blockly.utils.createSvgElement('g',
    {class: 'eyo-sharp-group'}, null)
    goog.dom.insertSiblingAfter(svg.groupSharp_, svg.pathContour_)
    goog.dom.classlist.add(svg.groupShape_, 'eyo-stmt')
    goog.dom.classlist.add(svg.groupContour_, 'eyo-stmt')
    if (node.isControl) {
      svg.groupPlay_ = Blockly.utils.createSvgElement('g',
      {class: 'eyo-play'}, svg.group_)
      svg.pathPlayContour_ = Blockly.utils.createSvgElement('path',
      {class: 'eyo-path-play-contour'}, svg.groupPlay_)
      svg.pathPlayIcon_ = Blockly.utils.createSvgElement('path',
      {class: 'eyo-path-play-icon'}, svg.groupPlay_)
      svg.pathPlayContour_.setAttribute('d', eYo.Shape.definitionForPlayContour({x: 0, y: 0}))
      svg.pathPlayIcon_.setAttribute('d', eYo.Shape.definitionForPlayIcon({x: 0, y: 0}))
      svg.mouseDownWrapper_ =
        Blockly.bindEventWithChecks_(svg.pathPlayIcon_, 'mousedown', null, e => {
        if (svg.block_.isInFlyout) {
          return
        }
        console.log('Start executing ' + svg.block_.id)
        svg.runScript && svg.runScript()
      })
      goog.dom.classlist.add(svg.group_, 'eyo-start')
      goog.dom.classlist.add(svg.pathShape_, 'eyo-start-path')
      goog.dom.insertSiblingAfter(svg.groupPlay_, svg.pathHilight_)
    }
  }
  var parent = node.parent
  if (parent) {
    var p_svg = parent.ui.svg
  } else {
    node.workspace.getCanvas().appendChild(svg.group_)
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
 * Remove the svg related resources of node.
 * This must be called just when changing the driver in the renderer.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeDispose = function (node) {
  var svg = node.ui.svg
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
  goog.dom.removeNode(svg.pathConnection_)
  svg.pathConnection_ = undefined
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
  node.ui.svg = undefined
}

/**
 * Return the svg group of the given node.
 * @return {*} Svg group element.
 */
eYo.Driver.Svg.prototype.nodeSvgGroup = function(node) {
  return node.ui.svg.group_
}

/**
 * Whether the given node can draw.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.nodeCanDraw = function (node) {
  return !!node.ui.svg.pathInner_
}

/**
 * Whether the contour of the receiver is above or below the parent's one.
 * True for statements, false otherwise.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.contourAboveParent_ = function (node) {
  return !node instanceof eYo.DelegateSvg.Expr
}

/**
 * Whether the contour of the receiver is above or below the parent's one.
 * True for statements, false otherwise.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.nodeGetBBox = function (node) {
  return node.ui.svg.pathShape_.getBBox()
}

/**
 * Whether the node is visually selected.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.nodeHasSelect = function (node) {
  return goog.dom.classlist.contains(node.ui.svg.group_, 'eyo-select')
}

/**
 * Path definition for a statement block selection.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathSelectDef_ = function (node) {
  return eYo.Shape.definitionWithNode(node, {dido: true})
}

/**
 * Generic path definition based on shape.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathDef_ = function (node) {
  return eYo.Shape.definitionWithNode(node)
}

/**
 * Control block path.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathControlDef_ = eYo.Driver.Svg.prototype.pathDef_

/**
 * Statement block path.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathStatementDef_ = eYo.Driver.Svg.prototype.pathDef_

/**
 * Block path.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathGroupShapeDef_ = eYo.Driver.Svg.prototype.pathDef_

/**
 * Block path.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathValueDef_ = eYo.Driver.Svg.prototype.pathDef_


/**
 * Block outline. Default implementation forwards to pathDef_.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathContourDef_ = eYo.Driver.Svg.prototype.pathDef_

/**
 * Highlighted block outline. Default implementation forwards to pathDef_.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathHilightDef_ = eYo.Driver.Svg.prototype.pathDef_

/**
 * Block outline. Default implementation forwards to pathDef_.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathShapeDef_ = eYo.Driver.Svg.prototype.pathDef_

/**
 * Block path when collapsed.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathCollapsedDef_ = eYo.Driver.Svg.prototype.pathDef_

/**
 * Highlighted connection outline.
 * When a block is selected and one of its connection is also selected
 * the ui displays a bold line on the connection. When the block has wrapped input,
 * the selected connection may belong to a wrapped block.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathConnectionDef_ = function (node) {
  return eYo.Selected.connection
  ? eYo.Shape.definitionWithConnectionDlgt(eYo.Selected.connection.eyo, {hilight: true})
  : ''
}

/**
 * Highlighted connection outline.
 * When a block is selected and one of its connection is also selected
 * the ui displays a bold line on the connection. When the block has wrapped input,
 * the selected connection may belong to a wrapped block.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathBBoxDef_ = function (node) {
  return eYo.Shape.definitionWithNode(node, {bbox: true})
}

/**
 * Prepares the various paths.
 * @param {!Object} node  the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.Driver.Svg.prototype.nodeWillRender = function (node, recorder) {
  var svg = node.ui.svg
  if (svg.group_) {
    var F = node.locked_ && node.output
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
    F = Object.keys(node.errors).length
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
 * @param {!Object} node  the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.Driver.Svg.prototype.nodeDidRender = function (node, recorder) {
}

/**
 * Compute the paths of the block depending on its size.
 * @param {!Object} node  the node the driver acts on
 * @param {*} path 
 * @param {*} def 
 */
eYo.Driver.Svg.prototype.updatePath_ = function (node, path, def) {
  if (path) {
    if (def) {
      try {
        var d = def(node)
        if (d.indexOf('NaN') >= 0) {
          d = def(node)
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
 * Compute the paths of the block depending on its size.
 * This may be called too early, when the path do not exist yet
 * @private
 */
eYo.Driver.Svg.prototype.nodeUpdateShape = function (node) {
  var svg = node.ui.svg
  if (node.ui.mayBeLast || !svg.pathContour_) {
    return
  }
  if (node.wrapped_) {
    this.updatePath_(node, svg.pathContour_)
    this.updatePath_(node, svg.pathShape_)
    this.updatePath_(node, svg.pathCollapsed_)
  } else {
    this.updatePath_(node, svg.pathContour_, this.pathContourDef_)
    this.updatePath_(node, svg.pathShape_, this.pathShapeDef_)
    this.updatePath_(node, svg.pathCollapsed_, this.pathCollapsedDef_)
  }
  this.updatePath_(node, svg.pathBBox_, this.pathBBoxDef_)
  this.updatePath_(node, svg.pathHilight_, this.pathHilightDef_)
  this.updatePath_(node, svg.pathSelect_, this.pathSelectDef_)
  this.updatePath_(node, svg.pathConnection_, this.pathConnectionDef_)
  if (node.ui.someTargetIsMissing && !node.isInFlyout) {
    goog.dom.classlist.add(svg.pathContour_, 'eyo-error')
  } else {
    goog.dom.classlist.remove(svg.pathContour_, 'eyo-error')
  }
}

/**
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {?Object} io 
 * @private
 */
eYo.Driver.Svg.prototype.nodeDrawModelBegin = function (node, io) {
  io.steps = []
}

/**
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {?Object} io 
 * @private
 */
eYo.Driver.Svg.prototype.nodeDrawModelEnd = function (node, io) {
  var d = io.steps.join(' ')
  node.ui.svg.pathInner_.setAttribute('d', d)
}

/**
 * Whether the field is displayed.
 * @param {!Object} field  the field to query about
 */
eYo.Driver.Svg.prototype.fieldDisplayedGet = function (field) {
  var g = field.eyo.svg.group_
  return g.style.display !== 'none'
}

/**
 * Display/hide the given field.
 * @param {!Object} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.Driver.Svg.prototype.fieldDisplayedSet = function (field, yorn) {
  var root = field.eyo.svg.group_
  if (yorn) {
    root.removeAttribute('display')
  } else {
    root.setAttribute('display', 'none')
  }
}

/**
 * Display/hide the given field.
 * @param {!Object} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.Driver.Svg.prototype.fieldDisplayedUpdate = function (field) {
  this.fieldDisplayedSet(field, field.isVisible())
}

/**
 * Whether the slot is displayed.
 * @param {!Object} slot  the slot to query about
 */
eYo.Driver.Svg.prototype.slotDisplayedGet = function (slot) {
  var g = slot.svg.group_
  return g.style.display !== 'none'
}

/**
 * Display/hide the given slot.
 * @param {!Object} slot  the slot the driver acts on
 * @param {boolean} yorn
 */
eYo.Driver.Svg.prototype.slotDisplayedSet = function (slot, yorn) {
  var g = slot.svg.group_
  if (yorn) {
    g.removeAttribute('display')
  } else {
    g.setAttribute('display', 'none')
  }
}

/**
 * Display/hide the given slot according to its `visible` property.
 * @param {!Object} slot  the slot the driver acts on
 * @param {boolean} yorn
 */
eYo.Driver.Svg.prototype.slotDisplayedUpdate = function (slot) {
  this.slotDisplayedSet(slot, slot.visible)
}

/**
 * Called when the parent will just change.
 * This code is responsible to place the various path
 * in the proper domain of the dom tree.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.Driver.Svg.prototype.nodeParentWillChange = function (node, newParent) {
  var svg = node.ui.svg
  if (node.parent) {
    // this block was connected, so its paths were located in the parents
    // groups.
    // First step, remove the relationship between the receiver
    // and the old parent, then link the receiver with the new parent.
    // this second step is performed in the `parentDidChange` method.
    var g = svg.group_
    if (g) {
      // Move this block up the DOM.  Keep track of x/y translations.
      var block = node.block_
      block.workspace.getCanvas().appendChild(g)
      var xy = block.getRelativeToSurfaceXY()
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
 * @param {!Blockly.Block} oldParent replaced.
 */
eYo.Driver.Svg.prototype.nodeParentDidChange = function (node, oldParent) {
  if (node.parent) {
    var ui = node.ui
    var svg = ui.svg
    var g = svg.group_
    var oldXY = ui.xyInSurface
    node.parent.ui.svg.group_.appendChild(g)
    var newXY = ui.xyInSurface
    // Move the connections to match the child's new position.
    ui.moveConnections_(newXY.x - oldXY.x, newXY.y - oldXY.y)
    var p_svg = newParent.ui.svg
    if (svg.groupContour_ && p_svg.groupContour_) {
      if (this.contourAboveParent_(node)) {
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
      svg.group_ === svg.pathSelect_.parentElement) || (svg.pathConnection_ &&
          svg.group_ === svg.pathConnection_.parentElement)) {
      this.nodeSelectRemove(node)
      this.nodeSelectAdd(node)
    } else if ((p_svg.pathSelect_ &&
        p_svg.group_ === p_svg.pathSelect_.parentNode) || (p_svg.pathConnection_ &&
          p_svg.group_ === newParent.pathConnection_.parentNode)) {
      this.nodeSelectRemove(newParent)
      this.nodeSelectRemove(newParent)
    }
  }
}

/**
 * Prepare the given slot.
 * @param {!eYo.Slot} slot to be prepared.
 */
eYo.Driver.Svg.prototype.slotInit = function (slot) {
  var svg = slot.svg = {}
  svg.group_ = Blockly.utils.createSvgElement('g', {
    class: 'eyo-slot'
  }, null)
  if (slot.previous) {
    goog.dom.insertSiblingAfter(svg.group_, slot.previous.svg.group_)
  } else {
    var s = slot.owner.slotAtHead
    if (s) {
      goog.dom.appendChild(svg.group_, slot.owner.ui.svg.group_)
    }
  }
  this.slotDisplayedUpdate(slot)
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {eYo.Slot} slot
 */
eYo.Driver.Svg.prototype.slotDispose = function (slot) {
  goog.dom.removeNode(slot.svg.group_)
  slot.svg.group_ = null
  slot.svg = undefined
}


/**
 * Prepare the given label field.
 * @param {!eYo.FieldLabel} field  Label field to be prepared.
 */
eYo.Driver.Svg.prototype.fieldInit = function (field) {
  var eyo = field.eyo
  if (eyo.svg) {
    return
  }
  var svg = eyo.svg = {}
  // Build the DOM.
  svg.textElement_ = Blockly.utils.createSvgElement('text',
  {
    class: eyo.isLabel ? 'eyo-label' : field.cssClass,
    y: eYo.Font.totalAscent
  }, null)
  if (eyo.isTextInput) {
    svg.group_ = Blockly.utils.createSvgElement('g', {}, null)
    svg.borderRect_ = Blockly.utils.createSvgElement('rect',
      { class: 'eyo-none',
        rx: 0,
        ry: 0,
        x: -eYo.Style.Edit.padding_h,
        y: -eYo.Style.Edit.padding_v,
        height: eYo.Font.height + 2 * eYo.Style.Edit.padding_v},
      svg.group_)
    svg.editRect_ = Blockly.utils.createSvgElement('rect',
      { class: 'eyo-edit',
        rx: eYo.Style.Edit.radius,
        ry: eYo.Style.Edit.radius,
        x: -eYo.Style.Edit.padding_h - (eyo.left_space ? eYo.Unit.x : 0),
        y: -eYo.Style.Edit.padding_v,
        height: eYo.Unit.y + 2 * eYo.Style.Edit.padding_v},
      svg.group_)
    field.updateEditable()
    field.mouseDownWrapper_ =
      Blockly.bindEventWithChecks_(svg.group_, 'mousedown', field, field.onMouseDown_
      )
  } else {
    svg.group_ = svg.textElement_
  }
  (eyo.slot ||eyo.b_eyo.ui).svg.group_.appendChild(svg.group_)
  if (eyo.css_class) {
    goog.dom.classlist.add(svg.textElement_, eYo.Do.valueOf(eyo.css_class, eyo))
  }
  if (eyo.isLabel) {
    // Configure the field to be transparent with respect to tooltips.
    svg.textElement_.tooltip = eyo.b_eyo.block_
    Blockly.Tooltip.bindMouseEvents(svg.textElement_)
  }
  this.fieldDisplayedUpdate(field)
}

/**
 * Dispose of the given field's rendering resources.
 * @param {!Object} field
 */
eYo.Driver.Svg.prototype.fieldDispose = function (field) {
  field.eyo.svg && goog.dom.removeNode(field.eyo.svg.group_)
  field.eyo.svg = undefined
}

/**
 * Set the location.
 * @param {*} field
 * @param {*} where
 */
eYo.Driver.Svg.prototype.fieldPositionSet = function (field, where) {
  var g = field.eyo.svg.group_
  g.setAttribute('transform',
  `translate(${where.x}, ${where.y + eYo.Padding.t})`)
}

/**
 * Update the with.
 * @param {*} field
 */
eYo.Driver.Svg.prototype.fieldUpdateWidth = function (field) {
  var r = field.eyo.svg.editRect_
  if (r) {
    var width = field.eyo.size.width
    r.setAttribute('width', width + 2 * eYo.Style.Edit.padding_h + (this.eyo.left_space ? eYo.Unit.x : 0))
  }
}

/**
 * Make the given field an error.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.Svg.prototype.fieldMakeError = function (field, yorn) {
  var root = field.eyo.svg.group_
  if (root) {
    (yorn ? goog.dom.classlist.add : goog.dom.classlist.remove)(root, 'eyo-code-reserved')
  }
}

/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.Svg.prototype.fieldMakeReserved = function (field, yorn) {
  var root = field.eyo.svg.group_
  if (root) {
    if (yorn) {
      goog.dom.classlist.add(root, 'eyo-code-reserved')
    } else {
      goog.dom.classlist.remove(root, 'eyo-code-reserved')
    }
  }
}

/**
 * Make the given field a placeholder.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.Svg.prototype.fieldMakePlaceholder = function (field, yorn) {
  var root = field.eyo.svg.group_
  if (root) {
    if (yorn) {
      goog.dom.classlist.add(root, 'eyo-code-placeholder')
    } else {
      goog.dom.classlist.remove(root, 'eyo-code-placeholder')
    }
  }
}

/**
 * Make the given field a comment.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.Svg.prototype.fieldMakeComment = function (field, yorn) {
  var root = field.eyo.svg.group_
  root && (yorn ? goog.dom.classlist.add: goog.dom.classlist.remove)(root, 'eyo-code-comment')
}

/**
 * Make the given field disabled eventually.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeUpdateDisabled = function (node) {
  var b = node.block_
  var svg = node.ui.svg
  if (b.disabled || b.getInheritedDisabled()) {
    Blockly.utils.addClass(
        /** @type {!Element} */ (svg.group_), 'eyo-disabled')
  } else {
    Blockly.utils.removeClass(
        /** @type {!Element} */ (svg.group_), 'eyo-disabled')
  }
}

/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeConnectionUIEffect = function (node) {
  var svg = node.ui.svg
  var w = node.workspace
  var xy = w.getSvgXY(/** @type {!Element} */ (svg.group_))
  if (svg.outputConnection) {
    var h = svg.height * w.scale / 2
    var ripple = Blockly.utils.createSvgElement('circle',
      {class: 'blocklyHighlightedConnectionPathH', 'cx': xy.x, 'cy': xy.y + h, 'r': 2 * h / 3},
      w.getParentSvg())
  } else {
  // Determine the absolute coordinates of the inferior block.
    var steps = Blockly.Connection.highlightedPath_.attributes['d'].value
    ripple = Blockly.utils.createSvgElement('path',
      {class: 'blocklyHighlightedConnectionPath',
        d: steps,
        transform: `translate(${xy.x},${xy.y})`},
      w.getParentSvg())
  }
  // Start the animation.
  eYo.BlockSvg.connectionUiStep_(ripple, new Date(), w.scale)
}

/**
 * Show the given menu.
 * Should be obsoleted.
 * @param {!Object} node  the node the driver acts on
 * @param {!Object} menu  the menu to be displayed
 */
eYo.Driver.Svg.prototype.nodeMenuShow = function (node, menu) {
  var svg = node.ui.svg
  var bBox = this.nodeGetBBox(node)
  var scaledHeight = bBox.height * node.workspace.scale
  var xy = goog.style.getPageOffset(svg.group_)
  menu.showMenu(svg.group_, xy.x, xy.y + scaledHeight + 2)
}

/**
 * Hilight the given connection.
 * @param {!Object} c_eyo
 */
eYo.Driver.Svg.prototype.connectionHilight = function (c_eyo) {
  var c_eyo
  var c8n = c_eyo.connection
  var node = c_eyo.node
  if (!node.workspace) {
    return
  }
  var d = node.ui.driver
  var steps
  if (c_eyo.isInput) {
    if (c8n.isConnected()) {
      steps = eYo.Shape.definitionWithNode(c_eyo.t_eyo)
    } else {
      steps = eYo.Shape.definitionWithConnectionDlgt(c_eyo)
      Blockly.Connection.highlightedPath_ =
      Blockly.utils.createSvgElement('path',
        {
          class: 'blocklyHighlightedConnectionPath',
          d: steps
        },
        d.group_
      )
      return
    }
  } else if (c_eyo.isOutput) {
    steps = eYo.Shape.definitionWithNode(node)
  } else {
    steps = eYo.Shape.definitionWithConnectionDlgt(c_eyo)
  }
  Blockly.Connection.highlightedPath_ =
  Blockly.utils.createSvgElement('path',
    {class: 'blocklyHighlightedConnectionPath',
      'd': steps,
      transform: `translate(${c_eyo.x || 0},${c_eyo.y || 0})`},
    d.group_)
}

/**
 * Make the given block visually wrapped or unwrapped
 * according to the node status.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeUpdateWrapped = function (node) {
  var svg = node.ui.svg
  if (node.wrapped_ && !svg.wrapped) {
    svg.wrapped = true
    svg.pathShape_.setAttribute('display', 'none')
    svg.pathContour_.setAttribute('display', 'none')
  } else if (!node.wrapped_ && svg.wrapped) {
    svg.wrapped = false
    svg.pathContour_.removeAttribute('display')
    svg.pathShape_.removeAttribute('display')
  }
}

/**
 * Send to front.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.nodeSendToFront = function (node) {
  var eyo = node
  var parent
  while ((parent = eyo.surround)) {
    eyo = parent
  }
  var g = eyo.ui.svg.group_
  if (g.nextSibling && (parent = g.parentNode)) {
    parent.removeChild(g)
    parent.appendChild(g)
  }

  // eyo = node
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
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.nodeSendToBack = function (node) {
  var eyo = node
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
 * Set the offset of the given node.
 * For edython.
 * @param {!Object} node  the node the driver acts on
 * @param {*} dc
 * @param {*} dl
 * @return {boolean}
 */
eYo.Driver.Svg.prototype.nodeSetOffset = function (node, dc, dl) {
  var svg = node.ui.svg
  // Workspace coordinates.
  var dx = dc * eYo.Unit.x
  var dy = dl * eYo.Unit.y
  var svg = node.ui.svg
  var xy = this.xyInParent(svg.group_)
  var transform = `translate(${xy.x + dx},${xy.y + dy})`
  ;[svg.group_, svg.groupShape_, svg.groupContour_].forEach(g => {
    g.setAttribute('transform', transform)
  })
}

/**
 * Set the offset of the receiver's node.
 * For edython.
 * @param {!Object} node  the node the driver acts on
 * @param {*} dx 
 * @param {*} dy 
 * @return {boolean}
 */
eYo.Driver.Svg.prototype.nodeSetOffset = function (node, dx, dy) {
  var svg = node.ui.svg
  if (!this.nodeCanDraw(node)) {
    throw `block is not inited ${node.type}`
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
 * Translates the block, forwards to the ui driver.
 * @param {number} x The x coordinate of the translation in workspace units.
 * @param {number} y The y coordinate of the translation in workspace units.
 */
eYo.Driver.Svg.prototype.nodeTranslate = function(node, x, y) {
  node.ui.svg.group_.setAttribute('transform', `translate(${x},${y})`)
}

/**
 * Return the coordinates of the top-left corner of this block relative to the
 * drawing surface's origin (0,0), in workspace units.
 * If the block is on the workspace, (0, 0) is the origin of the workspace
 * coordinate system.
 * This does not change with workspace scale.
 * @return {!goog.math.Coordinate} Object with .x and .y properties in
 *     workspace coordinates.
 */
eYo.Driver.Svg.prototype.nodeXyInSurface = function (node) {
  var x = 0
  var y = 0
  var block = node.block_
  var dragSurface = block.useDragSurface_ && block.workspace.blockDragSurface_
  var dragSurfaceGroup = dragSurface && dragSurface.getGroup()
  var canvas = block.workspace.getCanvas()
  var element = node.ui.svg.group_
  if (element) {
    do {
      // Loop through this block and every parent.
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
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeHilightAdd = function (node) {
  var svg = node.ui.svg
  if (!svg.pathHilight_.parentNode) {
    svg.group_.appendChild(svg.pathHilight_)
  }
}

/**
 * Remove the hilight path.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeHilightRemove = function (node) {
  goog.dom.removeNode(node.ui.svg.pathHilight_)
}

/**
 * Add the select path.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeSelectAdd = function (node) {
  var svg = node.ui.svg
  if (!svg.pathSelect_.parentNode) {
    if (svg.pathHilight_.parentNode) {
      svg.group_.insertBefore(svg.pathSelect_, svg.pathHilight_)
    } else if (svg.pathConnection_.parentNode) {
      svg.group_.insertBefore(svg.pathSelect_, svg.pathConnection_)
    } else {
      svg.group_.appendChild(svg.pathSelect_)
    }
  }
}

/**
 * Remove the select path.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeSelectRemove = function (node) {
  goog.dom.removeNode(node.ui.svg.pathSelect_)
}

/**
 * Add the hilight path_ to the dom.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeConnectionAdd = function (node) {
  var svg = node.ui.svg
  if (!svg.pathConnection_.parentNode) {
    svg.group_.appendChild(svg.pathConnection_)
  }
}

/**
 * Remove the select path from the dom.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeConnectionRemove = function (node) {
  goog.dom.removeNode(node.ui.svg.pathConnection_)
}

/**
 * The svg group has an `eyo-top` class.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeStatusTopAdd = function (node) {
  goog.dom.classlist.add(node.ui.svg.group_, 'eyo-top')
}

/**
 * The svg group has no `eyo-top` class.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeStatusTopRemove = function (node) {
  goog.dom.classlist.remove(node.ui.svg.group_, 'eyo-top')
}

/**
 * The svg group has an `eyo-select` class.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeStatusSelectAdd = function (node) {
  var svg = node.ui.svg
  var g = svg.group_
  if (goog.dom.classlist.contains(g, 'eyo-select')) {
    return
  }
  goog.dom.classlist.add(g, 'eyo-select')
  if ((g = svg.groupContour_)) {
    // maybe that block has not been rendered yet
    goog.dom.classlist.add(g, 'eyo-select')
  }
}

/**
 * The svg group has an `eyo-select` class.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeStatusSelectRemove = function (node) {
  var svg = node.ui.svg
  var g = svg.group_
  goog.dom.classlist.remove(g, 'eyo-select')
  if ((g = svg.groupContour_)) {
    // maybe that block has not been rendered yet
    goog.dom.classlist.remove(g, 'eyo-select')
  }
}

/**
 * Get the displayed status of the given node.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.nodeDisplayedGet = function (node) {
  var g =  node.ui.svg.group_
  if (g) {
    return g.style.display !== 'none'
  }
}

/**
 * Set the displayed status of the given node.
 * @param {!Object} node  the node the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.Driver.Svg.prototype.nodeDisplayedSet = function (node, visible) {
  var svg =  node.ui.svg
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
 * Hide the block. Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.nodeHide = function (node) {
  var svg = node.ui.svg
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
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.nodeDrawSharp = function (node, visible) {
  var g = node.ui.svg.groupSharp_
  if (visible) {
    var children = goog.dom.getChildren(g)
    var length = children.length
    if (!length) {
      var y = eYo.Font.totalAscent
      var text = Blockly.utils.createSvgElement('text',
        {'x': 0, 'y': y},
        g)
      text.appendChild(document.createTextNode('#'))
      length = 1
    }
    var expected = node.eyo.getStatementCount()
    while (length < expected) {
      y = eYo.Font.totalAscent + length * eYo.Font.lineHeight
      text = Blockly.utils.createSvgElement('text',
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
 * The field text will change.
 * Remove the children of the text element.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Driver.Svg.prototype.fieldTextErase = function (field) {
  goog.dom.removeChildren(/** @type {!Element} */ (field.eyo.svg.textElement_))
}

/**
 * The field text will change.
 * Remove the children of the text element.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Driver.Svg.prototype.fieldTextDisplay = function (field) {
  var textNode = document.createTextNode(field.getText())
  field.eyo.svg.textElement_.appendChild(textNode)
}

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Driver.Svg.prototype.fieldSetVisualAttribute = function (field) {
  var e = field.textElement_
  if (e) {
    var f = txt => {
      switch (eYo.T3.Profile.get(txt, null).raw) {
        case eYo.T3.Expr.reserved_identifier:
        case eYo.T3.Expr.reserved_keyword:
        case eYo.T3.Expr.known_identifier:
          return 'eyo-code-reserved'
        case eYo.T3.Expr.builtin__name:
          return 'eyo-code-builtin'
        default:
          return 'eyo-code'
      }
    }
    goog.dom.classlist.removeAll(e, goog.dom.classlist.get(e))
    goog.dom.classlist.add(e, f(field.getText()))
  }
}

/**
 * Show the inline editor.
 * @param {*} field
 * @param {boolean} quietInput
 */
eYo.Driver.Svg.prototype.fieldInlineEditorShow = function (field, quietInput) {
  var dispose = field.widgetDispose_()
  Blockly.WidgetDiv.show(field, field.sourceBlock_.RTL, dispose)
  var div = Blockly.WidgetDiv.DIV
  // Create the input.
  var htmlInput =
      goog.dom.createDom(goog.dom.TagName.INPUT, 'eyo-html-input')
  htmlInput.setAttribute('spellcheck', field.spellcheck_)

  goog.dom.classlist.add(div, field.cssClass)
  goog.dom.classlist.add(htmlInput, field.cssClass)
  if (field.eyo.isComment) {
    goog.dom.classlist.remove(htmlInput, 'eyo-code')
    goog.dom.classlist.add(htmlInput, 'eyo-code-comment')
  }
  eYo.FieldTextInput.htmlInput_ = Blockly.FieldTextInput.htmlInput_ = htmlInput
  div.appendChild(htmlInput)

  htmlInput.value = htmlInput.defaultValue = field.text_
  htmlInput.oldValue_ = null
  field.validate_()
  field.resizeEditor_()
  if (!quietInput) {
    htmlInput.focus()
    htmlInput.select()
  }
  field.bindEvents_(htmlInput)
}

/**
 * Callback at widget disposal.
 * @param {*} field
 * @return {*} called when disposing of the widget
 */
eYo.Driver.Svg.prototype.fieldWidgetDisposeCallback = function (field) {
  return function () {
    var f_eyo = field.eyo
    f_eyo.b_eyo.isEditing = f_eyo.isEditing = false
    field.editRect_ && goog.dom.classlist.remove(field.editRect_, 'eyo-editing')
    field.callValidator()
    f_eyo.b_eyo.changeWrap(
      function () { // `this` is `f_eyo.b_eyo`
        field.onEndEditing_ && field.onEndEditing_()
        var model = f_eyo.model
        if (model) {
          if (goog.isFunction(model.endEditing)) {
            model.endEditing.call(field)
          } else if (model.endEditing) {
            f_eyo.constructor.onEndEditing.call(field)
          }
        }
        this.endEditingField && this.endEditingField(field)
        if (f_eyo.grouper_) {
          eYo.Events.setGroup(false)
          delete f_eyo.grouper_
        }
        field.render_()
      }
    )
    eYo.FieldTextInput.superClass_.widgetDispose_.call(field)
    Blockly.WidgetDiv.DIV.style.fontFamily = ''
  }
}

/**
 * Check to see if the contents of the editor validates.
 * Style the editor accordingly.
 * @param {*} field
 * @private
 */
eYo.Driver.Svg.prototype.fieldInlineEditorValidate = function (field) {
  goog.asserts.assertObject(htmlInput)
  var htmlInput = eYo.FieldTextInput.htmlInput_
  goog.asserts.assertObject(htmlInput)
  (field.eyo.b_eyo && (null === field.callValidator(htmlInput.value))
  ? goog.dom.classlist.add
  : goog.dom.classlist.remove)(htmlInput_, 'eyo-code-error')
}

/**
 * Update the inline editor.
 * @param {*} field
 */
eYo.Driver.Svg.prototype.fieldInlineEditorUpdate = function (field) {
  var f_eyo = field.eyo
  var svg = f_eyo.svg
  var g = svg && svg.group_
  if (g) {
    var div = Blockly.WidgetDiv.DIV
    if (div.style.display !== 'none') {
      var bBox = g.getBBox()
      div.style.width = (bBox.width + eYo.Unit.x - (field.eyo.left_space ? eYo.Unit.x : 0) - eYo.Style.Edit.padding_h) * field.workspace_.scale + 'px'
      div.style.height = bBox.height * field.workspace_.scale + 'px'
      var xy = this.fieldGetAbsoluteXY_(field)
      div.style.left = (xy.x - eYo.EditorOffset.x + eYo.Style.Edit.padding_h) + 'px'
      div.style.top = (xy.y - eYo.EditorOffset.y) + 'px'
      f_eyo.b_eyo.changeWrap() // force rendering 
    }
  }
}

/**
 * Return the absolute coordinates of the top-left corner of this field.
 * The origin $(0,0)$ is the top-left corner of the page body.
 * @return {!goog.math.Coordinate} Object with `.x` and `.y` properties.
 * @private
 */
eYo.Driver.Svg.prototype.fieldGetAbsoluteXY_ = function(field) {
  return goog.style.getPageOffset(field.eyo.svg.borderRect_)
}

/**
 * Regular expressions.
 */
eYo.Driver.Svg.prototype.TRANSLATE_REGEX_ = /translate\s*\(\s*([-+\d.,e]+)([ ,]\s*([-+\d.,e]+)\s*\))/
eYo.Driver.Svg.prototype.TRANSLATE_2D_REGEX_ = /transform\s*:\s*translate\s*\(\s*([-+\d.,e]+)px([ ,]\s*([-+\d.,e]+)\s*)px\)?/
eYo.Driver.Svg.prototype.TRANSLATE_3D_REGEX_ = /transform\s*:\s*translate3d\(\s*([-+\d.,e]+)px([ ,]\s*([-+\d.,e]+)\s*)px([ ,]\s*([-+\d.,e]+)\s*)px\)?/

/**
 * Return the coordinates of the top-left corner of this element relative to
 * its parent.  Only for SVG elements and children (e.g. rect, g, path).
 * Fixed bug in original code.
 * @param {!Element} element SVG element to find the coordinates of.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 */
eYo.Driver.Svg.prototype.xyInParent = function(element) {
  var xy = new goog.math.Coordinate(0, 0)
  // First, check for x and y attributes.
  var x = element.getAttribute('x')
  if (x) {
    xy.x = parseInt(x, 10)
  }
  var y = element.getAttribute('y')
  if (y) {
    xy.y = parseInt(y, 10)
  }
  // Second, check for transform="translate(...)" attribute.
  var transform = element.getAttribute('transform')
  var r = transform && transform.match(this.TRANSLATE_REGEX_)
  if (r) {
    xy.x += parseFloat(r[1])
    if (r[3]) {
      xy.y += parseFloat(r[3])
    }
  }
  // Then check for style = transform: translate(...) or translate3d(...)
  var style = element.getAttribute('style');
  if (style && style.indexOf('translate') > -1) {
    var styleComponents = style.match(this.TRANSLATE_2D_REGEX_)
    // Try transform3d if 2d transform wasn't there.
    if (!styleComponents) {
      styleComponents = style.match(this.TRANSLATE_3D_REGEX_)
    }
    if (styleComponents) {
      xy.x += parseFloat(styleComponents[1])
      if (styleComponents[3]) {
        xy.y += parseFloat(styleComponents[3])
      }
    }
  }
  return xy
}

/**
 * Set the dosplay mode for blocks.
 * @param {!String} mode  The display mode for bocks.
 */
eYo.Driver.Svg.prototype.setBlockDisplayMode = mode => {
  var svg = eYo.App.workspace.svgBlockCanvas_
  this.currentBlockDisplayMode && goog.dom.classlist.remove(svg, `eyo-${this.currentBlockDisplayMode}`)
  if ((this.currentBlockDisplayMode = mode)) {
    goog.dom.classlist.add(svg, `eyo-${this.currentBlockDisplayMode}`)
  }
}


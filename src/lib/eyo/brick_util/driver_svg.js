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
goog.require('eYo')

goog.require('eYo.Slot')
goog.require('eYo.Field')
goog.require('eYo.Input')
goog.require('eYo.Brick')

eYo.setup.register(function () {
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout {
        position: absolute;
        z-index: 20;
      }`)
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-background {
      fill: #ddd;
      fill-opacity: .8;
      pointer-events: all;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-scrollbar {
      z-index: 30;
    }`
  )
})

eYo.setup.register(() => {
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar {
      position: absolute;
      pointer-events: all;
      height: 3.5rem;
      padding: 0;
      padding-left: 0.25rem;
      margin: 0;
      background: rgba(221,221,221,0.8);
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar-general {
      position: absolute;
      pointer-events: all;
      height: 2rem;
      padding: 0.125rem;
      width: 100%;
      margin: 0;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar-module {
      position: absolute;
      pointer-events: all;
      height: 1.75rem;
      padding: 0.125rem;
      margin: 0;
      margin-top: 2.25rem;
      width: 100%;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-select-general,
    .eyo-flyout-select-module {
      height: 100%;
      width: 100%;
      padding-left: 0.25rem;
      padding-right:0.25rem;
      margin: 0
    }`
  )
  var radius = '1.125rem;'
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control {
      background: #ddd;
      opacity: 0.79;
      height: 50%;
      width: 1.25rem;
      position: absolute;
      top: 0px;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control left {
      border-top-right-radius:${radius};
      border-bottom-right-radius:${radius};
      -webkit-border-top-right-radius:${radius};
      -webkit-border-bottom-right-radius:${radius};
      -moz-border-radius-topright:${radius};
      -moz-border-radius-bottomright:${radius};
      border-top-right-radius:${radius};
      border-bottom-right-radius:${radius};
      right: -1.25rem;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control {
      border-top-left-radius:${radius};
      border-bottom-left-radius:${radius};
      -webkit-border-top-left-radius:${radius};
      -webkit-border-bottom-left-radius:${radius};
      -moz-border-radius-topleft:${radius};
      -moz-border-radius-bottomleft:${radius};
      border-top-left-radius:${radius};
      border-bottom-left-radius:${radius};
      left: -1.25rem;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control-image {
      width: 1.125rem;
      height: 2.25rem;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control-image path {
      fill: white;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control-image path:hover {
      fill:black;
      fill-opacity: 0.075;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flash .eyo-flyout-control-image path,
    .eyo-flash .eyo-flyout-control-image path:hover {
      fill:black;
      fill-opacity:0.2;
    }`
  )
})

eYo.setup.register(() => {
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar .eyo-menu-button {
      background: #952276;
      box-shadow: 0px 3px 8px #888;
      border:0;
    }`
  )
    eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar .eyo-menu-button:hover {
      box-shadow: 0px 2px 6px #444;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-menu-button-outer-box {
      padding-left: 10px;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-menu-button-inner-box {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
      padding-right: 30px;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar .eyo-menu-button-caption {
      color: white;
      vertical-align: middle;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-menu-button-dropdown svg {
      position: absolute;
      top: 0px;
      width: 12px;
      height: 6px;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-menu-button-dropdown-image {
      fill: white;
    }`
  )
})

/**
 * A namespace.
 * @namespace eYo.Brick.prototype.svg
 */

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
 * @memberof eYo.Brick.prototype.svg
 */

eYo.Driver.Svg = function () {
  eYo.Driver.Svg.superClass_.constructor.call(this)
}
goog.inherits(eYo.Driver.Svg, eYo.Driver)

// TO BE DEPRECATED
Object.defineProperties(Blockly.Connection, {
  highlightedPath_: {
    get () {
      return eYo.Driver.Svg.magnetHighlightedPath_
    },
    set (newValue) {
      eYo.Driver.Svg.magnetHighlightedPath_ = newValue
    }
  }
})
eYo.Driver.Svg.prototype.withBBox = true

/**
 * Helper method for creating SVG elements.
 * @param {string} name Element's tag name.
 * @param {!Object} attrs Dictionary of attribute names and values.
 * @param {Element} parent Optional parent on which to append the element.
 * @return {!SVGElement} Newly created SVG element.
 */
Blockly.utils.createSvgElement = function(name, attrs, parent) {
  var e = /** @type {!SVGElement} */
      (document.createElementNS(Blockly.SVG_NS, name));
  for (var key in attrs) {
    e.setAttribute(key, attrs[key]);
  }
  // IE defines a unique attribute "runtimeStyle", it is NOT applied to
  // elements created with createElementNS. However, Closure checks for IE
  // and assumes the presence of the attribute and crashes.
  if (document.body.runtimeStyle) {  // Indicates presence of IE-only attr.
    e.runtimeStyle = e.currentStyle = e.style;
  }
  if (parent) {
    parent.appendChild(e);
  }
  return e;
}


eYo.Driver.Svg.NS = 'http://www.w3.org/2000/svg'

/**
 * Helper method for creating SVG elements.
 * @param {string} name Element's tag name.
 * @param {!Object} attrs Dictionary of attribute names and values.
 * @param {Element} parent Optional parent on which to append the element.
 * @return {!SVGElement} Newly created SVG element.
 */
eYo.Driver.Svg.newElement = function(name, attrs, parent) {
  var e = /** @type {!SVGElement} */
      (document.createElementNS(eYo.Driver.Svg.NS, name))
  for (var key in attrs) {
    e.setAttribute(key, attrs[key])
  }
  // IE defines a unique attribute "runtimeStyle", it is NOT applied to
  // elements created with createElementNS. However, Closure checks for IE
  // and assumes the presence of the attribute and crashes.
  if (document.body.runtimeStyle) {  // Indicates presence of IE-only attr.
    e.runtimeStyle = e.currentStyle = e.style
  }
  parent && parent.appendChild(e)
  return e
}

/**
 * Initialize the given node.
 * Adds to node's renderer a `svg` attribute owning all the svg related resources.
 * The svg
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickInit = function (node) {
  var svg = node.ui.svg = {}
  // groups:
  svg.group_ = eYo.Driver.Svg.newElement('g',
    {class: 'eyo-brick'}, null)
  // Expose this brick's ID on its top-level SVG group.
  if (svg.group_.dataset) {
    svg.group_.dataset.id = node.id;
  }
  // brick.svgGroup_ = eYo.Driver.Svg.newElement('g',
  //   {class: 'eyo-root'}, null)
  // goog.dom.insertChildAt(svg.svgRoot_, brick.svgGroup_, 0)
  svg.pathInner_ = eYo.Driver.Svg.newElement('path', {
    class: 'eyo-path-inner'
  }, null)
  svg.pathCollapsed_ = eYo.Driver.Svg.newElement('path', {
    class: 'eyo-path-collapsed'
  }, null)
  svg.pathContour_ = eYo.Driver.Svg.newElement('path', {
    class: 'eyo-path-contour'
  }, null)
  svg.pathShape_ = eYo.Driver.Svg.newElement('path', {
    class: 'eyo-path-shape'
  }, null)
  svg.pathSelect_ = eYo.Driver.Svg.newElement('path', {
    class: 'eyo-path-selected'
  }, null)
  svg.pathHilight_ = eYo.Driver.Svg.newElement('path', {
    class: 'eyo-path-hilighted'
  }, null)
  svg.pathMagnet_ = eYo.Driver.Svg.newElement('path', {
    class: 'eyo-path-connection eyo-path-hilighted'
  }, null)
  this.withBBox && (svg.pathBBox_ = eYo.Driver.Svg.newElement('path', {
    class: 'eyo-path-bbox'
  }, null))
  // Contour
  svg.groupContour_ = eYo.Driver.Svg.newElement('g',
    {class: 'eyo-contour'}, null)
  this.withBBox && goog.dom.appendChild(svg.groupContour_, svg.pathBBox_)
  goog.dom.appendChild(svg.groupContour_, svg.pathInner_)
  goog.dom.appendChild(svg.groupContour_, svg.pathCollapsed_)
  goog.dom.appendChild(svg.groupContour_, svg.pathContour_)
  // Shape
  svg.groupShape_ = eYo.Driver.Svg.newElement('g',
    {class: 'eyo-shape'}, null)
  goog.dom.appendChild(svg.groupShape_, svg.pathShape_)
  if (!node.workspace.options.readOnly && !svg.eventsInit_) {
    Blockly.bindEventWithChecks_(
      svg.group_, 'mousedown', node, node.onMouseDown_);
    Blockly.bindEventWithChecks_(
      svg.group_, 'mouseup', node, node.onMouseUp_);
    // I could not achieve to use only one binding
    // With 2 bindings all the mouse events are catched,
    // but some, not all?, are catched twice.
    Blockly.bindEventWithChecks_(
      svg.pathContour_, 'mousedown', node, node.onMouseDown_);
    Blockly.bindEventWithChecks_(
      svg.pathContour_, 'mouseup', node, node.onMouseUp_);
  }
  if (node.isExpr) {
    goog.dom.classlist.add(svg.groupShape_, 'eyo-expr')
    goog.dom.classlist.add(svg.groupContour_, 'eyo-expr')
    goog.dom.classlist.add(svg.group_, 'eyo-top')
  } else if (node.isStmt) {
    svg.groupSharp_ = eYo.Driver.Svg.newElement('g',
    {class: 'eyo-sharp-group'}, null)
    goog.dom.insertSiblingAfter(svg.groupSharp_, svg.pathContour_)
    goog.dom.classlist.add(svg.groupShape_, 'eyo-stmt')
    goog.dom.classlist.add(svg.groupContour_, 'eyo-stmt')
    if (node.isControl) {
      svg.groupPlay_ = eYo.Driver.Svg.newElement('g',
      {class: 'eyo-play'}, svg.group_)
      svg.pathPlayContour_ = eYo.Driver.Svg.newElement('path',
      {class: 'eyo-path-play-contour'}, svg.groupPlay_)
      svg.pathPlayIcon_ = eYo.Driver.Svg.newElement('path',
      {class: 'eyo-path-play-icon'}, svg.groupPlay_)
      svg.pathPlayContour_.setAttribute('d', eYo.Shape.definitionForPlayContour({x: 0, y: 0}))
      svg.pathPlayIcon_.setAttribute('d', eYo.Shape.definitionForPlayIcon({x: 0, y: 0}))
      svg.mouseDownWrapper_ =
        Blockly.bindEventWithChecks_(svg.pathPlayIcon_, 'mousedown', null, e => {
        if (node.isInFlyout) {
          return
        }
        console.log('Start executing ' + node.id)
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
eYo.Driver.Svg.prototype.brickDispose = function (node) {
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
  node.ui.svg = undefined
}

/**
 * Return the svg group of the given node.
 * @return {*} Svg group element.
 */
eYo.Driver.Svg.prototype.brickSvgGroup = function(node) {
  return node.ui.svg.group_
}

/**
 * Whether the given node can draw.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.brickCanDraw = function (node) {
  return !!node.ui.svg.pathInner_
}

/**
 * Whether the contour of the receiver is above or below the parent's one.
 * True for statements, false otherwise.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.contourAboveParent_ = function (node) {
  return !node instanceof eYo.Brick.Expr
}

/**
 * Whether the contour of the receiver is above or below the parent's one.
 * True for statements, false otherwise.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.brickGetBBox = function (node) {
  return node.ui.svg.pathShape_.getBBox()
}

/**
 * Whether the node is visually selected.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.brickHasSelect = function (node) {
  return goog.dom.classlist.contains(node.ui.svg.group_, 'eyo-select')
}

/**
 * Path definition for a statement brick selection.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathSelectDef_ = function (node) {
  return eYo.Shape.definitionWithBrick(node, {dido: true})
}

/**
 * Generic path definition based on shape.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathDef_ = function (node) {
  return eYo.Shape.definitionWithBrick(node)
}

/**
 * Control brick path.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathControlDef_ = eYo.Driver.Svg.prototype.pathDef_

/**
 * Statement brick path.
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
 * Highlighted brick outline. Default implementation forwards to pathDef_.
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
 * When a brick is selected and one of its connection is also selected
 * the ui displays a bold line on the connection. When the brick has wrapped input,
 * the selected connection may belong to a wrapped brick.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathConnectionDef_ = function (node) {
  return eYo.Selected.magnet
  ? eYo.Shape.definitionWithMagnet(eYo.Selected.magnet, {hilight: true})
  : ''
}

/**
 * Highlighted connection outline.
 * When a brick is selected and one of its connection is also selected
 * the ui displays a bold line on the connection. When the brick has wrapped input,
 * the selected connection may belong to a wrapped brick.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.pathBBoxDef_ = function (node) {
  return eYo.Shape.definitionWithBrick(node, {bbox: true})
}

/**
 * Prepares the various paths.
 * @param {!Object} node  the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.Driver.Svg.prototype.brickWillRender = function (node, recorder) {
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
eYo.Driver.Svg.prototype.brickDidRender = function (node, recorder) {
}

/**
 * Compute the paths of the brick depending on its size.
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
 * Compute the paths of the brick depending on its size.
 * This may be called too early, when the path do not exist yet
 * @private
 */
eYo.Driver.Svg.prototype.brickUpdateShape = function (node) {
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
  this.updatePath_(node, svg.pathMagnet_, this.pathConnectionDef_)
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
eYo.Driver.Svg.prototype.brickDrawModelBegin = function (node, io) {
  io.steps = []
}

/**
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {?Object} io
 * @private
 */
eYo.Driver.Svg.prototype.brickDrawModelEnd = function (node, io) {
  var d = io.steps.join(' ')
  node.ui.svg.pathInner_.setAttribute('d', d)
}

/**
 * Whether the field is displayed.
 * @param {!Object} field  the field to query about
 */
eYo.Driver.Svg.prototype.fieldDisplayedGet = function (field) {
  var g = field.svg.group_
  return g.style.display !== 'none'
}

/**
 * Display/hide the given field.
 * @param {!Object} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.Driver.Svg.prototype.fieldDisplayedSet = function (field, yorn) {
  var g = field.svg.group_
  if (yorn) {
    g.removeAttribute('display')
  } else {
    g.setAttribute('display', 'none')
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
    g.style.display = 'none'
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
eYo.Driver.Svg.prototype.brickParentWillChange = function (node, newParent) {
  var svg = node.ui.svg
  if (node.parent) {
    // this brick was connected, so its paths were located in the parents
    // groups.
    // First step, remove the relationship between the receiver
    // and the old parent, then link the receiver with the new parent.
    // this second step is performed in the `parentDidChange` method.
    var g = svg.group_
    if (g) {
      // Move this brick up the DOM.  Keep track of x/y translations.
      var brick = node
      brick.workspace.getCanvas().appendChild(g)
      var xy = brick.eyo.ui.xyInSurface
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
eYo.Driver.Svg.prototype.brickParentDidChange = function (node, oldParent) {
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
      svg.group_ === svg.pathSelect_.parentElement) || (svg.pathMagnet_ &&
          svg.group_ === svg.pathMagnet_.parentElement)) {
      this.brickSelectRemove(node)
      this.brickSelectAdd(node)
    } else if ((p_svg.pathSelect_ &&
        p_svg.group_ === p_svg.pathSelect_.parentNode) || (p_svg.pathMagnet_ &&
          p_svg.group_ === newParent.pathMagnet_.parentNode)) {
      this.brickSelectRemove(newParent)
      this.brickSelectRemove(newParent)
    }
  }
}

/**
 * Prepare the given slot.
 * @param {!eYo.Slot} slot to be prepared.
 */
eYo.Driver.Svg.prototype.slotInit = function (slot) {
  var svg = slot.svg = {}
  svg.group_ = eYo.Driver.Svg.newElement('g', {
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
 * Dispose of the given slot's rendering resources.
 * @param {eYo.Slot} slot
 */
eYo.Driver.Svg.prototype.slotDisplay = function (slot) {
  var g = slot.svg && slot.svg.group_
  goog.asserts.assert(g, 'Slot with no root', slot.brick.type, slot.key)
  if (slot.incog) {
    g.setAttribute('display', 'none')
  } else {
    g.removeAttribute('display')
    g.setAttribute('transform',
      `translate(${slot.where.x}, ${slot.where.y})`)
  }
}


/**
 * Prepare the given label field.
 * @param {!eYo.FieldLabel} field  Label field to be prepared.
 */
eYo.Driver.Svg.prototype.fieldInit = function (field) {
  if (field.svg) {
    return
  }
  var svg = field.svg = {}
  // Build the DOM.
  svg.textElement_ = eYo.Driver.Svg.newElement('text',
  {
    class: eyo.isLabel ? 'eyo-label' : field.css_class,
    y: eYo.Font.totalAscent
  }, null)
  if (eyo.isTextInput) {
    svg.group_ = eYo.Driver.Svg.newElement('g', {}, null)
    svg.borderRect_ = eYo.Driver.Svg.newElement('rect',
      { class: 'eyo-none',
        rx: 0,
        ry: 0,
        x: -eYo.Style.Edit.padding_h,
        y: -eYo.Style.Edit.padding_v,
        height: eYo.Font.height + 2 * eYo.Style.Edit.padding_v},
      svg.group_)
    svg.editRect_ = eYo.Driver.Svg.newElement('rect',
      { class: 'eyo-edit',
        rx: eYo.Style.Edit.radius,
        ry: eYo.Style.Edit.radius,
        x: -eYo.Style.Edit.padding_h - (eyo.left_space ? eYo.Unit.x : 0),
        y: -eYo.Style.Edit.padding_v,
        height: eYo.Unit.y + 2 * eYo.Style.Edit.padding_v},
      svg.group_)
    field.mouseDownWrapper_ =
      Blockly.bindEventWithChecks_(svg.group_, 'mousedown', field, field.onMouseDown_
      )
  } else {
    svg.group_ = svg.textElement_
  }
  (field.slot || field.brick.ui).svg.group_.appendChild(svg.group_)
  if (field.css_class) {
    goog.dom.classlist.add(svg.textElement_, eYo.Do.valueOf(field.css_class, field))
  }
  if (field.isLabel) {
    // Configure the field to be transparent with respect to tooltips.
    svg.textElement_.tooltip = field.brick
    Blockly.Tooltip.bindMouseEvents(svg.textElement_)
  }
  this.fieldDisplayedUpdate(field)
}

/**
 * Dispose of the given field's rendering resources.
 * @param {!Object} field
 */
eYo.Driver.Svg.prototype.fieldDispose = function (field) {
  field.svg && goog.dom.removeNode(field.svg.group_)
  field.svg = undefined
}

/**
 * Set the location.
 * @param {*} field
 * @param {*} where
 */
eYo.Driver.Svg.prototype.fieldPositionSet = function (field, where) {
  var g = field.svg.group_
  g.setAttribute('transform',
  `translate(${where.x}, ${where.y + eYo.Padding.t})`)
}

/**
 * Update the with.
 * @param {*} field
 */
eYo.Driver.Svg.prototype.fieldUpdateWidth = function (field) {
  var svg = field.svg
  if (!svg) {
    return
  }
  var width = field.size.width
  svg.borderRect_.setAttribute('width', width + eYo.BlockSvg.SEP_SPACE_X)
  var r = svg.editRect_
  r && r.setAttribute('width', width + 2 * eYo.Style.Edit.padding_h + (field.left_space ? eYo.Unit.x : 0))
}

/**
 * Make the given field an error.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.Svg.prototype.fieldMakeError = function (field, yorn) {
  var root = field.svg.group_
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
  var root = field.svg.group_
  if (root) {
    if (yorn) {
      goog.dom.classlist.add(root, 'eyo-code-reserved')
    } else {
      goog.dom.classlist.remove(root, 'eyo-code-reserved')
    }
  }
}

/**
 * Add ui attributes to make the given field a placeholder, or not.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.Svg.prototype.fieldMakePlaceholder = function (field, yorn) {
  var root = field.svg.group_
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
  var root = field.svg.group_
  root && (yorn ? goog.dom.classlist.add: goog.dom.classlist.remove)(root, 'eyo-code-comment')
}

/**
 * Make the given field disabled eventually.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickUpdateDisabled = function (node) {
  var brick = node
  var svg = node.ui.svg
  if (brick.disabled || brick.getInheritedDisabled()) {
    Blockly.utils.addClass(
        /** @type {!Element} */ (svg.group_), 'eyo-disabled')
  } else {
    Blockly.utils.removeClass(
        /** @type {!Element} */ (svg.group_), 'eyo-disabled')
  }
}

/**
 * Play some UI effects (sound, animation) when disposing of a block.
 */
eYo.Driver.Svg.prototype.brickDisposeEffect = (() => {
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
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickConnectEffect = function (brick) {
  var svg = brick.ui.svg
  var w = brick.workspace
  var xy = w.getSvgXY(/** @type {!Element} */ (svg.group_))
  if (brick.magnets.output) {
    var h = svg.height * w.scale / 2
    var ripple = eYo.Driver.Svg.newElement('circle',
      {class: 'blocklyHighlightedConnectionPathH', 'cx': xy.x, 'cy': xy.y + h, 'r': 2 * h / 3},
      w.getParentSvg())
  } else {
  // Determine the absolute coordinates of the inferior brick.
    var steps = eYo.Driver.Svg.magnetHighlightedPath_.attributes['d'].value
    ripple = eYo.Driver.Svg.newElement('path',
      {class: 'blocklyHighlightedConnectionPath',
        d: steps,
        transform: `translate(${xy.x},${xy.y})`},
      w.getParentSvg())
  }
  // Start the animation.
  eYo.Driver.Svg.connectionUiStep_(ripple, new Date(), w.scale)
}

/**
 * Expand a ripple around a connection.
 * @param {!Element} ripple Element to animate.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
eYo.Driver.Svg.connectionUiStep_ = function (ripple, start, workspaceScale) {
  var ms = new Date() - start
  var percent = ms / 200
  if (percent > 1) {
    goog.dom.removeNode(ripple)
  } else {
    ripple.style.opacity = 8 * Math.pow(percent, 2) * Math.pow(1 - percent, 2)
    eYo.UI.disconnectUiStop_.pid_ = setTimeout(
      eYo.Driver.Svg.connectionUiStep_, 10, ripple, start, workspaceScale)
  }
}

/**
 * Show the given menu.
 * Should be obsoleted.
 * @param {!Object} node  the node the driver acts on
 * @param {!Object} menu  the menu to be displayed
 */
eYo.Driver.Svg.prototype.brickMenuShow = function (node, menu) {
  var svg = node.ui.svg
  var bBox = this.brickGetBBox(node)
  var scaledHeight = bBox.height * node.workspace.scale
  var xy = goog.style.getPageOffset(svg.group_)
  menu.showMenu(svg.group_, xy.x, xy.y + scaledHeight + 2)
}

/**
 * Hilight the given connection.
 * @param {!eYo.Magnet} m4t
 */
eYo.Driver.Svg.prototype.magnetHilight = function (m4t) {
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
      eYo.Driver.Svg.magnetHighlightedPath_ =
      eYo.Driver.Svg.newElement('path',
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
  eYo.Driver.Svg.magnetHighlightedPath_ =
  eYo.Driver.Svg.newElement('path',
    {class: 'blocklyHighlightedConnectionPath',
      'd': steps,
      transform: `translate(${m4t.x || 0},${m4t.y || 0})`},
      g)
}

/**
 * Make the given brick visually wrapped or unwrapped
 * according to the node status.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickUpdateWrapped = function (node) {
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
eYo.Driver.Svg.prototype.brickSendToFront = function (node) {
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
eYo.Driver.Svg.prototype.brickSendToBack = function (node) {
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
eYo.Driver.Svg.prototype.brickSetOffset = function (node, dc, dl) {
  var svg = node.ui.svg
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
 * @param {!eYo.Brick} node  the brick.
 * @param {!Number} dx  in workspace coordinates.
 * @param {!Number} dy  in workspace coordinates.
 * @package
 */
eYo.Driver.Svg.prototype.brickSetOffsetDuringDrag = function(node, dx, dy) {
  var svg = node.ui.svg
  svg.group_.translate_ = `translate(${dx},${dy})`
  svg.group_.setAttribute('transform',
  svg.group_.translate_ + svg.group_.skew_)
};
/**
 * Set the offset of the receiver's node.
 * For edython.
 * @param {!Object} node  the node the driver acts on
 * @param {*} dx
 * @param {*} dy
 * @return {boolean}
 */
eYo.Driver.Svg.prototype.brickSetOffset = function (node, dx, dy) {
  var svg = node.ui.svg
  if (!this.brickCanDraw(node)) {
    throw `brick is not inited ${node.type}`
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
eYo.Driver.Svg.prototype.brickTranslate = function(node, x, y) {
  node.ui.svg.group_.setAttribute('transform', `translate(${x},${y})`)
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
eYo.Driver.Svg.prototype.brickXYInSurface = function (node) {
  var x = 0
  var y = 0
  var brick = node
  var dragSurface = brick.useDragSurface_ && brick.workspace.blockDragSurface_
  var dragSurfaceGroup = dragSurface && dragSurface.getGroup()
  var canvas = brick.workspace.getCanvas()
  var element = node.ui.svg.group_
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
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickHilightAdd = function (node) {
  var svg = node.ui.svg
  if (!svg.pathHilight_.parentNode) {
    svg.group_.appendChild(svg.pathHilight_)
  }
}

/**
 * Remove the hilight path.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickHilightRemove = function (node) {
  goog.dom.removeNode(node.ui.svg.pathHilight_)
}

/**
 * Add the select path.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickSelectAdd = function (node) {
  var svg = node.ui.svg
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
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickSelectRemove = function (node) {
  goog.dom.removeNode(node.ui.svg.pathSelect_)
}

/**
 * Add the hilight path_ to the dom.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickMagnetAdd = function (node) {
  var svg = node.ui.svg
  if (!svg.pathMagnet_.parentNode) {
    svg.group_.appendChild(svg.pathMagnet_)
  }
}

/**
 * Remove the select path from the dom.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickConnectionRemove = function (node) {
  goog.dom.removeNode(node.ui.svg.pathMagnet_)
}

/**
 * The svg group has an `eyo-top` class.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickStatusTopAdd = function (node) {
  goog.dom.classlist.add(node.ui.svg.group_, 'eyo-top')
}

/**
 * The svg group has no `eyo-top` class.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickStatusTopRemove = function (node) {
  goog.dom.classlist.remove(node.ui.svg.group_, 'eyo-top')
}

/**
 * The svg group has an `eyo-select` class.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickStatusSelectAdd = function (node) {
  var svg = node.ui.svg
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
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickStatusSelectRemove = function (node) {
  var svg = node.ui.svg
  var g = svg.group_
  goog.dom.classlist.remove(g, 'eyo-select')
  if ((g = svg.groupContour_)) {
    // maybe that brick has not been rendered yet
    goog.dom.classlist.remove(g, 'eyo-select')
  }
}

/**
 * Get the displayed status of the given node.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickDisplayedGet = function (node) {
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
eYo.Driver.Svg.prototype.brickDisplayedSet = function (node, visible) {
  var svg =  node.ui.svg
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
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.Svg.prototype.brickHide = function (node) {
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
eYo.Driver.Svg.prototype.brickDrawSharp = function (node, visible) {
  var g = node.ui.svg.groupSharp_
  if (visible) {
    var children = goog.dom.getChildren(g)
    var length = children.length
    if (!length) {
      var y = eYo.Font.totalAscent
      var text = eYo.Driver.Svg.newElement('text',
        {'x': 0, 'y': y},
        g)
      text.appendChild(document.createTextNode('#'))
      length = 1
    }
    var expected = node.eyo.getStatementCount()
    while (length < expected) {
      y = eYo.Font.totalAscent + length * eYo.Font.lineHeight
      text = eYo.Driver.Svg.newElement('text',
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
eYo.Driver.Svg.prototype.brickSetDragging = (brick, adding) => {
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
 * @param {!eYo.Brick} field  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickSetParent = function (node, parent) {
  var svg = node.ui.svg
  if (parent) {
    var p_svg = parent.ui.svg
    var oldXY = this.brickXYInSurface(node)
    p_svg.group_.appendChild(svg.group_)
    var newXY = this.brickXYInSurface(node)
    goog.dom.insertChildAt(p_svg.groupContour_, svg.groupContour_, 0)
    goog.dom.classlist.add(/** @type {!Element} */(svg.groupContour_),
      'eyo-inner')
    goog.dom.appendChild(p_svg.groupShape_, svg.groupShape_)
    goog.dom.classlist.add(/** @type {!Element} */(svg.groupShape_),
      'eyo-inner')
  } else {
    var oldXY = this.brickXYInSurface(node)
    node.workspace.getCanvas().appendChild(svg.group_)
    xy && svg.group_.setAttribute('transform', `translate(${oldXY.x},${oldXY.y})`)
    var newXY = this.brickXYInSurface(node)
    goog.dom.insertChildAt(svg.group_, svg.groupContour_, 0)
    goog.dom.classlist.remove(/** @type {!Element} */svg.groupContour_,
      'eyo-inner')
    goog.dom.insertSiblingBefore(svg.groupShape_, svg.groupContour_)
    goog.dom.classlist.remove(/** @type {!Element} */svg.groupShape_,
      'eyo-inner')
  }
  node.moveConnections_(newXY.x - oldXY.x, newXY.y - oldXY.y);
}

/**
 * Move the brick to the top level.
 * @param {!eYo.Brick} field  the node the driver acts on
 */
eYo.Driver.Svg.prototype.brickAtTop = function (node) {
  var g = node.ui.svg.group_
  // Move this brick up the DOM.  Keep track of x/y translations.
  var xy = this.brickXYInSurface(node)
  this.workspace.getCanvas().appendChild(g)
  g.setAttribute('transform', `translate(${xy.x},${xy.y})`)
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
 * Set the dosplay mode for bricks.
 * @param {!String} mode  The display mode for bocks.
 */
eYo.Driver.Svg.prototype.setBlockDisplayMode = mode => {
  var svg = eYo.App.workspace.svgBlockCanvas_
  this.currentBlockDisplayMode && goog.dom.classlist.remove(svg, `eyo-${this.currentBlockDisplayMode}`)
  if ((this.currentBlockDisplayMode = mode)) {
    goog.dom.classlist.add(svg, `eyo-${this.currentBlockDisplayMode}`)
  }
}

/**
 * Add tooltip to a brick
 * @param {!String} key
 */
eYo.Driver.Svg.prototype.addTooltip = function (el, title, options) {
  if (goog.isString(title)) {
    el.setAttribute('title', title)
    tippy(el, options)
  } else if (goog.isDef(title)) {
    tippy(el, title)
  }
}

/**
 * Add tooltip to a brick
 * @param {!eYo.Brick} brick
 * @param {!String} key
 * @param {?Object} options
 */
eYo.Driver.Svg.prototype.brickAddTooltip = function (brick, key, options) {
  var g = brick.ui.svg.group
  goog.mixin(options, {
    onShow(instance) {
      g && g.parentNode && eYo.Tooltip.hideAll(g.parentNode)
    }
  })
  var model = brick.constructor.eyo.model
  var title = eYo.Tooltip.getTitle(key || model.tooltip || brick.tooltipKey || brick.type.substring(4))
  if (title) {
    this.addTooltip(g, title, options)
  }
}

/**
 * Initializes the flyout SVG ressources.
 * @param {!eYo.Flyout} flyout
 */
eYo.Driver.Svg.prototype.flyoutInit = function(flyout) {
  var svg = flyout.svg = {}
  /*
  <svg class="eyo-flyout">
    <g class="eyo-flyout-background">
      <path class="blocklyFlyoutBackground"/>
    </g>
    <g class="eyo-workspace">...</g>
  </svg>
  */
  svg.group_ = eYo.Driver.Svg.newElement(tagName, {
    class: 'eyo-flyout',
    style: 'display: none'
  }, null)
  svg.background_ = eYo.Driver.Svg.newElement('path', {
    class: 'eyo-flyout-background'
  }, svg.group_)
// Bad design: code reuse: options
  this.addTooltip(svg.background_, eYo.Tooltip.getTitle('flyout'), {
    position: 'right',
    theme: 'light bordered',
    flipDuration: 0,
    inertia: true,
    arrow: true,
    animation: 'perspective',
    duration: [600, 300],
    delay: [750, 0],
    popperOptions: {
      modifiers: {
        preventOverflow: {
          enabled: true
        }
      }
    },
    onShow: (instance) => {
      eYo.Tooltip.hideAll(this.svgBackground_)
    }
  })

  var g = flyout.workspace_.createDom()
  goog.dom.classlist.remove(g, 'blocklyWorkspace')
  goog.dom.classlist.add(g, 'eyo-workspace')
  svg.group_.appendChild(g)

  goog.dom.insertSiblingAfter(
    svg.group_,
    targetWorkspace.getParentSvg()
  )
}

/**
 * Initializes the flyout toolbar SVG ressources.
 * @param {!eYo.FlyoutToolbar} flyoutToolbar
 */
eYo.Driver.Svg.prototype.flyoutToolbarInit = function(ftb) {
  if (this.div_) {
    return
  }
  /*
  <div class="eyo-flyout-toolbar">
    <div class="eyo-flyout-toolbar-general">
      <div class="eyo-flyout-select-general">
        ...
      </div>
      <div class="eyo-flyout-control">
        ...
      </div>
    </div>
    <div class="eyo-flyout-toolbar-module">
      <div class="eyo-flyout-select-module">
        ...
      </div>
    </div>
  </div>
  */
  var cssClass = this.flyout_.eyo.getCssClass()
  this.control_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'control'))
  var svg = eYo.Driver.Svg.newElement('svg', {
    id: 'eyo-flyout-control-image',
    class: goog.getCssName(cssClass, 'control-image')
  }, this.control_)
  this.pathControl_ = eYo.Driver.Svg.newElement('path', {
    id: 'p-flyout-control'
  }, svg)
  if (eYo.App && eYo.App.flyoutDropDown) {
    this.select_general_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select'),
      eYo.App.flyoutDropDown
    )
  } else if (eYo.App && eYo.App.flyoutDropDownGeneral && eYo.App.flyoutDropDownModule) {
    this.select_general_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-general'),
      eYo.App.flyoutDropDownGeneral
    )
    this.select_module_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-module'),
      eYo.App.flyoutDropDownModule
    )
  } else {
    this.select_general_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-general')
    )
    select = new goog.ui.Select(null, new eYo.Menu(), eYo.MenuButtonRenderer.getInstance())
    // select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'test'))
    // select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'basic'))
    select.addItem(new eYo.MenuItem(eYo.Msg.INTERMEDIATE, 'intermediate'))
    select.addItem(new eYo.MenuItem(eYo.Msg.ADVANCED, 'advanced'))
    select.addItem(new eYo.MenuItem(eYo.Msg.EXPERT, 'expert'))
    select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BRANCHING, 'branching'))
    select.addItem(new eYo.MenuItem(eYo.Msg.LOOPING, 'looping'))
    select.addItem(new eYo.MenuItem(eYo.Msg.FUNCTION, 'function'))
    select.setSelectedIndex(0)
    select.render(this.select_general_)
    this.listenableKey = select.listen(
      goog.ui.Component.EventType.ACTION,
      this.doSelectGeneral,
      false,
      this
    )
    this.select_module_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-module')
    )
    var select = new goog.ui.Select(null, new eYo.Menu(), eYo.MenuButtonRenderer.getInstance())
    // select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'test'))
    // select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'basic'))
    select.addItem(new eYo.MenuItem(eYo.Msg.INTERMEDIATE, 'intermediate'))
    select.addItem(new eYo.MenuItem(eYo.Msg.ADVANCED, 'advanced'))
    select.addItem(new eYo.MenuItem(eYo.Msg.EXPERT, 'expert'))
    select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BRANCHING, 'branching'))
    select.addItem(new eYo.MenuItem(eYo.Msg.LOOPING, 'looping'))
    select.addItem(new eYo.MenuItem(eYo.Msg.FUNCTION, 'function'))
    select.setSelectedIndex(0)
    select.render(this.select_module_)
    this.listenableKey = select.listen(
      goog.ui.Component.EventType.ACTION,
      this.doSelectGeneral,
      false,
      this
    )
  }
  var div_general = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'toolbar-general'),
    this.select_general_
  )
  var div_module = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'toolbar-module'),
    this.select_module_
  )
  this.div_ = this.switcher_
    ? goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'toolbar'),
      this.switcher_,
      this.control_
    )
    : goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'toolbar'),
      div_general,
      div_module,
      this.control_
    )
  if (this.switcher_) {
    this.switcher_.style.left = '0px'
    this.switcher_.style.top = '0px'
  }
  this.onButtonDownWrapper_ = Blockly.bindEventWithChecks_(this.control_, 'mousedown', this, this.onButtonDown_)
  this.onButtonEnterWrapper_ = Blockly.bindEventWithChecks_(this.control_, 'mouseenter', this, this.onButtonEnter_)
  this.onButtonLeaveWrapper_ = Blockly.bindEventWithChecks_(this.control_, 'mouseleave', this, this.onButtonLeave_)
  this.onButtonUpWrapper_ = Blockly.bindEventWithChecks_(this.control_, 'mouseup', this, this.onButtonUp_)

  goog.dom.insertSiblingBefore(ftb.div_, ftb.flyout_.svg.group_)
}

// Private holder of svg ressources
Object.defineProperties(eYo.Field, { svg_: { value: undefined } })

/**
 * Initializes the field SVG ressources.
 * Does nothing if the field's brick has no SVG ressources.
 * Part of the `beReady` process.
 * @param {!eYo.Field} field
 * @return {?eYo.Field}
 */
eYo.Driver.Svg.prototype.fieldInit = function(field) {
  var svg = field.owner.svg || field.brick.ui.svg
  if (!svg) { return }
  var g = svg.group_
  if (!g) { return }
  if ((svg = field.svg)) {
    // Field has already been initialized once.
    return;
  }
  g = svg.group_ = eYo.utils.createSvgElement('g', {}, g)
  !field.visible && (g.style.display = 'none')
  svg.borderRect_ = eYo.utils.createSvgElement('rect', {
    rx: 4,
    ry: 4,
    x: -eYo.BlockSvg.SEP_SPACE_X / 2,
    y: 0,
    height: 16
  }, g)
  /** @type {!Element} */
  svg.textElement_ = eYo.utils.createSvgElement('text', {
    class: 'blocklyText',
    y: this.size_.height - 12.5
  }, g)
  field.mouseDownWrapper_ =
      eYo.bindEventWithChecks_(
          g, 'mousedown', field, field.onMouseDown_)
  this.fieldUpdateEditable(field)
  return field
}

/**
 * Dispose of the field SVG ressources.
 * @param {!eYo.Field} field
 */
eYo.Driver.Svg.prototype.fieldDispose = function(field) {
  var g = field.svg && field.svg.group_
  if (!g) {
    // Field has already been disposed
    return;
  }
  if (field.mouseDownWrapper_) {
    eYo.unbindEvent_(field.mouseDownWrapper_)
    field.mouseDownWrapper_ = null
  }
  goog.dom.removeNode(g)
  field.svg = null
}

/**
 * Add or remove the UI indicating if this field is editable or not.
 * @param {!eYo.Field} field
 */
eYo.Driver.Svg.prototype.fieldUpdateEditable = function(field) {
  var g = field.svg && field.svg.group_
  if (!field.editable || !g) {
    // Not editable or already disposed
    return
  }
  if (field.brick.editable) {
    eYo.utils.addClass(g, 'blocklyEditableText')
    eYo.utils.removeClass(g, 'blocklyNonEditableText')
    g.style.cursor = 'text'
  } else {
    eYo.utils.addClass(g, 'blocklyNonEditableText')
    eYo.utils.removeClass(g, 'blocklyEditableText')
    g.style.cursor = ''
  }
};

/**
 * The field text will change.
 * Remove the children of the text element.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Driver.Svg.prototype.fieldTextRemove = function (field) {
  goog.dom.removeChildren(/** @type {!Element} */ (field.svg.textElement_))
}

/**
 * The field text will change.
 * Add a text node to the text element.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Driver.Svg.prototype.fieldTextCreate = function (field) {
  var textNode = document.createTextNode(field.text)
  field.svg.textElement_.appendChild(textNode)
}

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Driver.Svg.prototype.fieldSetVisualAttribute = function (field) {
  var e = field.svg.textElement_
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
    goog.dom.classlist.add(e, f(field.text))
  }
}

/**
 * Update the inline editor.
 * @param {*} field
 */
eYo.Driver.Svg.prototype.fieldInlineEditorUpdate = function (field) {
  var svg = field.svg
  var g = svg && svg.group_
  if (g) {
    var div = Blockly.WidgetDiv.DIV
    if (div.style.display !== 'none') {
      var bBox = g.getBBox()
      div.style.width = (bBox.width + eYo.Unit.x - (field.left_space ? eYo.Unit.x : 0) - eYo.Style.Edit.padding_h) * field.workspace_.scale + 'px'
      div.style.height = bBox.height * field.workspace_.scale + 'px'
      var xy = this.fieldGetAbsoluteXY_(field)
      div.style.left = (xy.x - eYo.EditorOffset.x + eYo.Style.Edit.padding_h) + 'px'
      div.style.top = (xy.y - eYo.EditorOffset.y) + 'px'
      field.brick.changeWrap() // force rendering
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
  return goog.style.getPageOffset(field.svg.borderRect_)
}

/**
 * Non-breaking space.
 * @const
 */
eYo.Driver.Svg.NBSP = '\u00A0';

/**
 * Get the text from this field as displayed on screen.  Differs from the original text due to non breaking spaces.
 * @return {string} Displayed text.
 * @private
 */
eYo.Driver.Svg.prototype.fieldGetDisplayText_ = function(field) {
  var text = field.text_
  if (!text) {
    // Prevent the field from disappearing if empty.
    return eYo.Driver.Svg.NBSP;
  }
  // Replace whitespaces with non-breaking spaces so the text doesn't collapse.
  return text.replace(/\s/g, eYo.Driver.Svg.NBSP);
}


/**
 * Dispose of the magnet SVG ressources.
 * @param {!eYo.Magnet} magnet
 */
eYo.Driver.Svg.prototype.magnetDispose = eYo.Do.nothing


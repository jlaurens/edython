/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg')
goog.provide('ezP.MixinSvg')
goog.provide('ezP.HoleFiller')

goog.require('ezP.Delegate')
goog.forwardDeclare('ezP.BlockSvg')

/**
 * mixin manager.
 * Adds mixin contents to constructor's prototype
 * if not already there.
 * Using strings as parameters is a facility that
 * must not be used in case the constructor is meant
 * to replace an already registered one.
 * For objects in constructor.mixins, does a mixin
 * on the constructor's prototype.
 * Mixins do not play well with inheritance.
 * For ezPython.
 * @param {!constructor} constructor is either a constructor or the name of a constructor.
 */
ezP.MixinSvg = function (constructor, mixins) {
  var C = ezP.DelegateSvg.Manager.get(constructor) || constructor
  var Ms = goog.isArray(mixins)? mixins:
  mixins? [mixins]: C.mixins
  if (Ms) {
    var target = C.prototype
    for (var i = 0, m; (m = Ms[i++]);) {
      var source = ezP.MixinSvg[m] || m
      for (var x in source) {
        if (!target.hasOwnProperty(x)) {
          target[x] = source[x]
        }
      }
    }
  }
}

/**
 * Class for a DelegateSvg.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg = function (prototypeName) {
  ezP.DelegateSvg.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg, ezP.Delegate)

ezP.DelegateSvg.Manager = ezP.Delegate.Manager

/**
 * Method to register an expression block.
 * The delegate is searched as a DelegateSvg element
 */
ezP.DelegateSvg.Manager.register = function (key) {
  var prototypeName = ezP.T3.Expr[key]
  var Ctor = undefined
  var available = undefined
  if (prototypeName) {
//    console.log('Registering expression', key)
    Ctor = ezP.DelegateSvg.Expr[key]
    available = ezP.T3.Expr.Available
  } else if ((prototypeName = ezP.T3.Stmt[key])) {
//    console.log('Registering statement', key)
    Ctor = ezP.DelegateSvg.Stmt[key]
    available = ezP.T3.Stmt.Available
  } else {
    throw "Unknown block ezP.T3.Expr or ezP.T3.Stmt key: "+key
  }
  ezP.MixinSvg(Ctor) // before registering
  ezP.DelegateSvg.Manager.registerDelegate_(prototypeName, Ctor)
  available.push(prototypeName)
  Blockly.Blocks[prototypeName] = {}
}

/**
 * This is the shape used to draw the outline of a block
 * @private
 */
ezP.DelegateSvg.prototype.svgPathShape_ = undefined

/**
 * This is the shape used to draw the background of a block
 * @private
 */
ezP.DelegateSvg.prototype.svgPathContour_ = undefined

/**
 * This is the shape used to draw a collapsed block.
 * Background or outline ?
 * @private
 */
ezP.DelegateSvg.prototype.svgPathCollapsed_ = undefined

/**
 * This is the shape used to draw a block...
 * @private
 */
ezP.DelegateSvg.prototype.svgPathInline_ = undefined

/**
 * This is the shape used to draw an highlighted block contour.
 * @private
 */
ezP.DelegateSvg.prototype.svgPathHighlight_ = undefined

/**
 * When set, used to create an input value.
 * three inputs can be created on the fly.
 * The data is an object with following properties: first, middle, last
 * each value is an object with properties
 * - key, string uniquely identify the value input. When absent, a dummy input is created
 * - label, optional string
 * - wrap, optional, the type of the block wrapped by this input
 * - check, [an array of] strings, types to check the connections. When absent, replaced by `wrap` if any.
 * - optional, true/false whether the connection is optional, only when no wrap.
 */

/**
 * Create and initialize the various paths.
 * Called once at block creation time.
 * Should not be called directly
 * @param {!Blockly.Block} block to be initialized..
 */
ezP.DelegateSvg.prototype.initBlock = function(block) {
  ezP.DelegateSvg.superClass_.initBlock.call(this, block)
  this.svgPathInline_ = Blockly.utils.createSvgElement('path',
    {'class': 'ezp-path-contour'}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathInline_, 0)
  this.svgPathCollapsed_ = Blockly.utils.createSvgElement('path', {}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathCollapsed_, 0)
  this.svgPathContour_ = Blockly.utils.createSvgElement('path', {}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathContour_, 0)
  this.svgPathShape_ = Blockly.utils.createSvgElement('path', {}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathShape_, 0)
  this.svgPathHighlight_ = Blockly.utils.createSvgElement('path',
    {'class': 'ezp-path-selected'}, null)
  Blockly.utils.addClass(/** @type {!Element} */ (block.svgGroup_),
    'ezp-block')
  // block.setInputsInline(true)
  block.setTooltip('')
  block.setHelpUrl('')

  var F = function(K) {
    var D = this.inputModel_[K]
    var out
    if (D && Object.keys(D).length) {
      out = {}
      if ((D.check === undefined && D.wrap === undefined) || D.dummy || D.identifier || D.code || D.comment || D.number || D.string || D.longString) {
        out.input = block.appendDummyInput(k)
      } else {
        var k = D.key
        var v, f
        if ('wrap' in D) {
          v = D.wrap
          goog.asserts.assert(v, 'wrap must exist '+block.type+'.'+K)
          out.input = block.appendWrapValueInput(k, v, D.optional, D.hidden)
        } else {
          out.input = block.appendValueInput(k)
        }
        var c8n = out.input.connection
        if (c8n) {
          var ezp = c8n.ezp
          ezp.name_ = k
          if (D.plugged) {
            ezp.plugged_ = D.plugged
            //console.log(k, ezp.plugged_)
          }
          if (goog.isFunction(D.willConnect)) {
            ezp.willConnect = D.willConnect
          }
          if (goog.isFunction(D.didConnect)) {
            ezp.didConnect = D.didConnect
          }
          if (goog.isFunction(D.willDisconnect)) {
            ezp.willDisconnect = D.willDisconnect
          }
          if (goog.isFunction(D.didDisconnect)) {
            ezp.didDisconnect = D.didDisconnect
          }
          if (D.do && Object.keys(D.do).length) {
            goog.mixin(ezp, D.do)
          }
          if (D.optional) {//svg
            ezp.optional_ = true
          }
          ezp.disabled_ = D.disabled && !D.enabled
          if ((v = D.check)) {
            out.input.setCheck(v)
            var value = goog.isFunction(D.hole_value)?D.hole_value(block): D.hole_value
            ezp.hole_data = ezP.HoleFiller.getData(v, value)
          } else if ((v = D.check = D.wrap)) {
            out.input.setCheck(v)
          }
        }
      }
      var field
      if (D.asyncable) {
        field = out.fieldAsync = new ezP.FieldLabel('')
        k = K+'.'+ezP.Const.Field.ASYNC
        field.ezpData.css_class = 'ezp-code-reserved'
        field.ezpData.css_style = D.css_style
        out.input.appendField(field, k)
      } else if (D.awaitable) {
        field = out.fieldAwait = new ezP.FieldLabel('')
        k = K+'.'+ezP.Const.Field.AWAIT
        field.ezpData.css_class = 'ezp-code-reserved'
        field.ezpData.css_style = D.css_style
        out.input.appendField(field, k)
      }
      if ((v = D.prefix) !== undefined) {
        field = out.fieldPrefix = new ezP.FieldLabel(v)
        k = K+'.'+ezP.Const.Field.PREFIX
        field.ezpData.css_class = D.css_class
        field.ezpData.css_style = D.css_style
        out.input.appendField(field, k)
      }
      if ((v = D.label) !== undefined || (v = D.dummy) !== undefined) {
        out.fieldLabel = field = new ezP.FieldLabel(v)
        k = K+'.'+ezP.Const.Field.LABEL
        out.input.appendField(field, k)
        field.ezpData.css_class = D.css_class
        field.ezpData.css_style = D.css_style
      }
      if ((v = D.start) !== undefined) {
        field = out.fieldLabelStart = new ezP.FieldLabel(v)
        k = K+'.'+ezP.Const.Field.START
        field.ezpData.css_class = D.css_class
        field.ezpData.css_style = D.css_style
        out.input.appendField(field, k)
      }
      if ((v = D.end) !== undefined) {
        field = out.fieldLabelEnd = new ezP.FieldLabel(v)
        k = K + '.'+ezP.Const.Field.END
        field.ezpData.css_class = D.css_class
        field.ezpData.css_style = D.css_style
        field.ezpData.suffix = true
        out.input.appendField(field, k)
      }
      if ((v = D.identifier) !== undefined) {
        field = out.fieldIdentifier = new ezP.FieldIdentifier(v)
        k = K+'.'+ezP.Const.Field.IDENTIFIER
        out.input.appendField(field, k)
        // if (D.label) { // this is svg specific
        //   field.ezpData.x_shift = ezP.Font.space
        // }
      } else if ((v = D.code) != undefined) {
        field = out.fieldCodeInput = new ezP.FieldCodeInput(v)
        k = K+'.'+ezP.Const.Field.CODE
        out.input.appendField(field, k)
      } else if ((v = D.comment) != undefined) {
        field = out.fieldCodeComment = new ezP.FieldCodeComment(v)
        k = K+'.'+ezP.Const.Field.COMMENT
        out.input.appendField(field, k)
      } else if ((v = D.number) != undefined) {
        field = out.fieldCodeNumber = new ezP.FieldCodeNumber(v)
        k = K+'.'+ezP.Const.Field.NUMBER
        out.input.appendField(field, k)
      } else if ((v = D.string) != undefined) {
        field = out.fieldCodeString = new ezP.FieldCodeString(v)
        k = K+'.'+ezP.Const.Field.STRING
        out.input.appendField(field, k)
      } else if ((v = D.longString) != undefined) {
        field = out.fieldCodeLongString = new ezP.FieldCodeLongString(v)
        k = K+'.'+ezP.Const.Field.LONG_STRING
        out.input.appendField(field, k)
      } else if ((v = D.operator) != undefined) {
        field = out.fieldOperator = new ezP.FieldLabel(v)
        k = K+'.'+ezP.Const.Field.OPERATOR
        out.input.appendField(field, k)
      }
    }
    return out
  }
  var Is = {}
  
  // catch the statement input eventually created in parent's method
  for (var i = 0, input; (input = block.inputList[i++]);) {
    if (input.type === Blockly.NEXT_STATEMENT) {
      Is.do = {
        input: input,
      }
      break
    }
  }
  if (block.inputList.length) {
    var input = block.inputList.length
  }
  if (Object.keys(this.inputModel_).length) {
    var keys = ['first', 'middle', 'last']
    for (var i = 0, K; K = keys[i++];) {
      var f = F.call(this, K)
      if (f) {
        Is[K] = f
      }
    }
    this.inputModel_ = undefined
  }
  this.inputs = Is
}

/**
 * Revert operation of initBlock.
 * @param {!Blockly.Block} block to be initialized..
 */
ezP.DelegateSvg.prototype.deinitBlock = function(block) {
  goog.dom.removeNode(this.svgPathShape_)
  this.svgPathShape_ = undefined
  goog.dom.removeNode(this.svgPathContour_)
  this.svgPathContour_ = undefined
  goog.dom.removeNode(this.svgPathCollapsed_)
  this.svgPathCollapsed_ = undefined
  goog.dom.removeNode(this.svgPathInline_)
  this.svgPathInline_ = undefined
  goog.dom.removeNode(this.svgPathHighlight_)
  this.svgPathHighlight_ = undefined
  ezP.DelegateSvg.superClass_.deinitBlock.call(this, block)
}

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 * @param {!Blockly.Block} block to be initialized..
 */
ezP.DelegateSvg.prototype.preInitSvg = function(block) {
}

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 * @param {!Blockly.Block} block to be initialized..
 */
ezP.DelegateSvg.prototype.postInitSvg = function(block) {
  goog.dom.removeNode(block.svgPath_)
  delete block.svgPath_
  block.svgPath_ = undefined
  goog.dom.removeNode(block.svgPathLight_)
  delete block.svgPathLight_
  block.svgPathLight_ = undefined
  goog.dom.removeNode(block.svgPathDark_)
  delete block.svgPathDark_
  block.svgPathDark_ = undefined
}

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
ezP.DelegateSvg.prototype.getMenuTarget = function(block) {
  var wrapped
  if (this.inputs.wrap && (wrapped = this.inputs.wrap.input.connection.targetBlock())) {
    return wrapped.ezp.getMenuTarget(wrapped)
  }
  if (this.wrappedInputs_ && this.wrappedInputs_.length &&
    (wrapped = this.wrappedInputs_[0][0].connection.targetBlock())) {
    return wrapped.ezp.getMenuTarget(wrapped)
  }
  return block
}

/**
 * Create and initialize the SVG representation of the child blocks wrapped in the given block.
 * May be called more than once.
 * @param {!Blockly.Block} block to be initialized..
 */
ezP.DelegateSvg.prototype.initSvgWrap = function(block) {
  if (this.wrappedInputs_) {
    // do not delete this at the end
    for (var i = 0; i < this.wrappedInputs_.length; i++) {
      var data = this.wrappedInputs_[i]
      var target = data[0].connection.targetBlock()
      if (target) {
        target.initSvg()
      }
    }
  }
};

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {!Block} block.
 * @param {boolean=} optBubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
ezP.DelegateSvg.prototype.render = function (block, optBubble) {
  if (this.isRendering) {
    return
  }
  // if (this.wrapped_ && !block.getParent()) {
  //   console.log('wrapped block with no parent')
  //   setTimeout(function(){block.dispose()}, 10)
  //   block.dispose()
  //   return
  // }
  this.isRendering = true
  Blockly.Field.startCache()
  this.minWidth = block.width = 0
  block.rendered = true
  this.consolidate(block)
  this.willRender_(block)
  this.renderDraw_(block)
  this.layoutConnections_(block)
  block.renderMoveConnections_()

  if (optBubble !== false) {
    // Render all blocks above this one (propagate a reflow).
    var parentBlock = block.getParent()
    if (parentBlock) {
      parentBlock.render(true)
    } else {
      // Top-most block.  Fire an event to allow scrollbars to resize.
      block.workspace.resizeContents()
    }
  }
  this.didRender_(block)
  this.isRendering = false
  Blockly.Field.stopCache()
  // block.workspace.logAllConnections('didRender')
}

/**
 * Prepare the inputs.
 * The default implementation does nothing.
 * Subclassers may enable/disable an input
 * depending on the context.
 * List managers will use consolidators to help list management.
 * @param {!Block} block.
 */
ezP.DelegateSvg.prototype.consolidate = function (block, deep) {
  if (deep) {
    for (var i = 0, input, x; (input = block.inputList[i++]);) {
      if ((x = input.connection) && (x = x.targetBlock())) {
        x.ezp.consolidate(x, deep)
      }
    }
  }
}

/**
 * Whether the block is sealed to its parent.
 * The sealed status is decided at init time.
 * The corresponding input.ezpData.connection.wrapped_ is set to true.
 * @private
 */
ezP.DelegateSvg.prototype.wrapped_ = undefined

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.willRender_ = function (block) {
  if (block.isShadow()) {
    if (this.svgPathShape_) {
      Blockly.utils.addClass(/** @type {!Element} */ (this.svgPathShape_),
      'ezp-path-shadow-shape')
      Blockly.utils.removeClass(/** @type {!Element} */ (this.svgPathShape_),
      'ezp-path-shape')
    }
    if (this.svgPathContour_) {
      Blockly.utils.addClass(/** @type {!Element} */ (this.svgPathContour_),
      'ezp-path-shadow-contour')
      Blockly.utils.removeClass(/** @type {!Element} */ (this.svgPathContour_),
      'ezp-path-contour')
    }
    if (this.svgPathCollapsed_) {
      Blockly.utils.addClass(/** @type {!Element} */ (this.svgPathCollapsed_),
      'ezp-path-shadow-collapsed')
      Blockly.utils.removeClass(/** @type {!Element} */ (this.svgPathCollapsed_),
      'ezp-path-collapsed')
    }
  } else {
    if (this.svgPathShape_) {
      Blockly.utils.addClass(/** @type {!Element} */ (this.svgPathShape_),
      'ezp-path-shape')
      Blockly.utils.removeClass(/** @type {!Element} */ (this.svgPathShape_),
      'ezp-path-shadow-shape')
    }
    if (this.svgPathContour_) {
      Blockly.utils.addClass(/** @type {!Element} */ (this.svgPathContour_),
      'ezp-path-contour')
      Blockly.utils.removeClass(/** @type {!Element} */ (this.svgPathContour_),
        'ezp-path-shadow-contour')
    }
    if (this.svgPathCollapsed_) {
      Blockly.utils.addClass(/** @type {!Element} */ (this.svgPathCollapsed_),
      'ezp-path-collapsed')
      Blockly.utils.removeClass(/** @type {!Element} */ (this.svgPathCollapsed_),
      'ezp-path-shadow-collapsed')
    }
  }
}

/**
 * Did draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.didRender_ = function (block) {
}

/**
 * Layout previous, next and output block connections.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.layoutConnections_ = function (block) {
  if (block.outputConnection) {
    block.outputConnection.setOffsetInBlock(0, 0)
  } else {
    if (block.previousConnection) {
      block.previousConnection.setOffsetInBlock(0, 0)
    }
    if (block.nextConnection) {
      if (block.isCollapsed()) {
        block.nextConnection.setOffsetInBlock(0, 2 * ezP.Font.lineHeight())
      } else {
        block.nextConnection.setOffsetInBlock(0, block.height)
      }
    }
  }
}

/**
 * Block shape. Default implementation throws.
 * Subclasses must override it. Used in renderDraw_.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.shapePathDef_ = function (block) {
  goog.asserts.assert(false, 'shapePathDef_ must be overriden by ' + this)
}

/**
 * Block outline. Default implementation forwards to shapePathDef_.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.contourPathDef_ = ezP.DelegateSvg.prototype.shapePathDef_

/**
 * Highlighte block outline. Default implementation forwards to shapePathDef_.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.highlightedPathDef_ = ezP.DelegateSvg.prototype.shapePathDef_

/**
 * Extra disabled block outline. Default implementation return a void string.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.collapsedPathDef_ = function () {
  return ''
}

/**
 * Draw the path of the block.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.renderDraw_ = function (block) {
  block.height = ezP.Font.lineHeight()
  var d = this.renderDrawInputs_(block)
  this.svgPathInline_.setAttribute('d', d)
  var root = block.getRootBlock()
  if (root.ezp) {
    root.ezp.alignRightEdges_(root)
  }
  this.didChangeSize_(block)
}

/**
 * Align the right edges by changing the size of all the connected statement blocks.
 * The default implementation does nothing.
 * @param {!ezP.Block} block.
 * @protected
 */
ezP.DelegateSvg.prototype.alignRightEdges_ = function (block) {
  var right = 0
  var ntor = ezP.StatementBlockEnumerator(block)
  var b
  var t = ezP.Font.tabWidth
  while ((b = ntor.next())) {
    if (b.ezp) {
      if (b.ezp.minWidth) {
        right = Math.max(right, b.ezp.minWidth + t * ntor.depth())
      } else {
        return
      }
    }
  }
  ntor = ezP.StatementBlockEnumerator(block)
  while ((b = ntor.next())) {
    if (b.ezp) {
      var width = right - t * ntor.depth()
      if (b.width !== width) {
        b.width = width
        b.ezp.didChangeSize_(b)
      }
    }
  }
}

/**
 * Compute the paths of the block depending on its size.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.updatePath_ = function (block, path, def) {
  if (!!path) {
    if (def) {
      path.setAttribute('d', def.call(this,block))
    } else {
      path.removeAttribute('d')
    }
  }
}

/**
 * Compute the paths of the block depending on its size.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.didChangeSize_ = function (block) {
  if (this.wrapped_) {
    this.updatePath_(block, this.svgPathContour_)
    this.updatePath_(block, this.svgPathShape_)
    this.updatePath_(block, this.svgPathHighlight_)
    this.updatePath_(block, this.svgPathCollapsed_)
    } else {
    this.updatePath_(block, this.svgPathContour_, this.contourPathDef_)
    this.updatePath_(block, this.svgPathShape_, this.shapePathDef_)
    this.updatePath_(block, this.svgPathHighlight_, this.highlightedPathDef_)
    this.updatePath_(block, this.svgPathCollapsed_, this.collapsedPathDef_)
  }
}

/**
 * The left padding of a block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.getPaddingLeft = function (block) {
  if (this.wrapped_) {
    return 0
  } else if (block.outputConnection) {
    return ezP.Font.space
  } else {
    return ezP.Padding.l()
  }  
}

/**
 * The right padding of a block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.getPaddingRight = function (block) {
  if (this.wrapped_) {
    return 0
  } else if (block.outputConnection) {
    return ezP.Font.space
  } else {
    return ezP.Padding.r()
  }  
}

/**
 * Render the inputs of the block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawInputs_ = function (block) {
  /* eslint-disable indent */
  var io = {
    block: block,
    steps: [],
    canDummy: true,
    canValue: true,
    canStatement: true,
    canList: true,
    canForif: true,
    i: 0,
    length: block.inputList.length,
  }
  io.cursorX = this.getPaddingLeft(block)
  if (!block.outputConnection) {
    this.renderDrawSharp_(io)
  }
  for (; (io.input = block.inputList[io.i]); io.i++) {
    if (io.input.isVisible()) {
      goog.asserts.assert(io.input.ezpData, 'Input with no ezpData '+io.input.name+' in block '+block.type)
      io.inputDisabled = io.input.ezpData.disabled_
      if (io.inputDisabled) {
        for (var __ = 0, field; (field = io.input.fieldRow[__]); ++__) {
          if (field.getText().length>0) {
            var root = field.getSvgRoot()
            if (root) {
              root.setAttribute('display', 'none')
            } else {
              console.log('Field with no root: did you ...initSvg()?')
            }
          }
        }
        if ((field = io.input.ezpData.fieldLabel)) {
          if (field.getText().length>0) {
            var root = field.getSvgRoot()
            if (root) {
              root.setAttribute('display', 'none')
            } else {
              console.log('Field with no root: did you ...initSvg()?')
            }
          }
        }
      } else {
        this.renderDrawInput_(io)
      }
    }
  }
  io.cursorX += this.getPaddingRight(block)
  this.minWidth = block.width = Math.max(block.width, io.cursorX)
  return io.steps.join(' ')
}

/**
 * Render the leading # character for collapsed statement blocks.
 * Statement subclasses must override it.
 * @param io.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawSharp_ = function (io) {
  goog.asserts.assert(false, 'renderDrawSharp_ must be overriden by ' + io.block.type)
}

/**
 * Render one input. Default implementation throws.
 * Subclasses must override it.
 * @param io.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawInput_ = function (io) {
  goog.asserts.assert(false, 'renderDrawInput_ must be overriden by ' + this)
}

/**
 * Render the fields of a block input.
 * @param io An input/output record.
 * @return the delta of io.cursorX
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawFields_ = function (io, start) {
  var here = io.cursorX
  io.endsWithCharacter = false
  var lastField = null
  for (var _ = 0; (io.field = io.input.fieldRow[_]); ++_) {
    if (!!start === !io.field.ezpData.suffix) {
      if (io.field.isVisible() && io.field.getDisplayText_().length>0) {
        var root = io.field.getSvgRoot()
        if (root) {
          lastField = io.field
          var ezp = io.field.ezpData
          var x_shift = ezp && !io.block.ezp.wrapped_? ezp.x_shift || 0: 0
          root.setAttribute('transform', 'translate(' + (io.cursorX + x_shift) +
            ', ' + ezP.Padding.t() + ')')
          var size = io.field.getSize()
          io.cursorX += size.width
          if (ezp.isEditing) {
            io.cursorX += ezP.Font.space
          }
        } else {
          console.log('Field with no root: did you ...initSvg()?')
        }
      }          
    }
  }
  if (start && lastField && /^.*[a-zA-Z_]$/.test(lastField.getValue())) {
    io.endsWithCharacter = true
  }
  return here - io.cursorX
}

/**
 * Render the fields of a dummy input, if relevant.
 * @param io An input/output record.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawDummyInput_ = function (io) {
  if (!io.canDummy || io.input.type !== Blockly.DUMMY_INPUT) {
    return false
  }
  this.renderDrawFields_(io, true)
  this.renderDrawFields_(io, false)
  return true
}

/**
 * Render the fields of a value input, if relevant.
 * @param io the input/output argument.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawValueInput_ = function (io) {
  if (!io.canValue || io.input.type !== Blockly.INPUT_VALUE) {
    return false
  }
  var c8n = io.input.connection
  if (c8n) {
    var ezp = c8n.ezp
    var target = c8n.targetBlock()
    var delta = this.renderDrawFields_(io, true)
    c8n.setOffsetInBlock(io.cursorX, 0)
    if (!!target) {
      var root = target.getSvgRoot()
      if (!!root) {
        if (delta) { // insert a space because wrapped blocks are... wrapped
          // this will change when the locking feature will be implemented
          var w = target
          while(w && w.ezp.wrapped_ && w.inputList.length) {
            var input = w.inputList[0]
            if (input.fieldRow.length) {
              var done = false
              for (var i = 0; i<input.fieldRow.length; ++i) {
                var value = input.fieldRow[i].getValue()
                if (value.length) {
                  if (io.endsWithCharacter) {
                    io.cursorX += ezP.Font.space
                  }
                  c8n.setOffsetInBlock(io.cursorX, 0)
                  done = true
                  break
                }
              }
              if (done) {
                break
              }
            }
            w = input.connection? input.connection.targetBlock(): undefined
          }
        }
        root.setAttribute('transform', 'translate(' + io.cursorX + ', 0)')
        target.render()
        var bBox = target.getHeightWidth()
        io.cursorX += bBox.width
      }
    } else {
      var pw = ezp.optional_?
      this.carretPathDefWidth_(io.cursorX):
      this.placeHolderPathDefWidth_(io.cursorX)
      io.steps.push(pw.d)
      io.cursorX += pw.width
    }
    this.renderDrawFields_(io, false)
  }
  return true
}

/**
 * Block path.
 * @param {goog.size} size.
 * @private
 */
ezP.DelegateSvg.prototype.valuePathDef_ = function (size) {
  /* eslint-disable indent */
  // Top edge.
  var p = ezP.Padding.h()
  var r = (p ** 2 + size.height ** 2 / 4) / 2 / p
  var dx = (ezP.Font.space - p) / 2
  var a = ' a ' + r + ', ' + r + ' 0 0 1 0,'
  var h = size.height + 2 * ezP.Margin.V
  return 'm ' + (size.width - ezP.Font.space + dx) + ',-' + ezP.Margin.V + a +
  h + 'H ' + (dx + p) + a + (-h) + ' z'
} /* eslint-enable indent */

/**
 * Block path.
 * @param {goog.size} size.
 * @private
 */
ezP.DelegateSvg.prototype.outPathDef_ = function () {
  /* eslint-disable indent */
  // Top edge.
  var p = ezP.Padding.h()
  var r = (p ** 2 + ezP.Font.lineHeight() ** 2 / 4) / 2 / p
  var dx = (ezP.Font.space - p) / 2
  var a = ' a ' + r + ', ' + r + ' 0 0 1 0,'
  var h = ezP.Font.lineHeight() + 2 * ezP.Margin.V
  return 'm ' + (dx + p) + ',' + (h - ezP.Margin.V) + a + (-h)
} /* eslint-enable indent */

/**
 * Block path.
 * @param {Number} height.
 * @param {Number} x position.
 * @private
 */
ezP.DelegateSvg.prototype.carretPathDefWidth_ = function (cursorX) {
  /* eslint-disable indent */
  var size = {width:ezP.Font.space, height: ezP.Font.lineHeight()}
  var p = ezP.Padding.h()
  var r = (p ** 2 + size.height ** 2 / 4) / 2 / p
  var dy = ezP.Padding.v() + ezP.Font.descent / 2
  var a = ' a ' + r + ', ' + r + ' 0 0 1 0,'
  var h = size.height + 2 * ezP.Margin.V
  var d = 'M ' + (cursorX + size.width/2) +
  ',' + (ezP.Margin.V + dy) + a + (h - 2 * dy) + a + (-h + 2 * dy) + ' z'
  return {width: size.width, d: d}
} /* eslint-enable indent */

/**
 * Block path.
 * @param {Number} height.
 * @param {Number} x position.
 * @private
 */
ezP.DelegateSvg.prototype.placeHolderPathDefWidth_ = function (cursorX) {
  /* eslint-disable indent */
  var size = {width: 3 * ezP.Font.space, height: ezP.Font.lineHeight()}
  var p = ezP.Padding.h()
  var r = (p ** 2 + size.height ** 2 / 4) / 2 / p
  var dy = ezP.Padding.v() + ezP.Font.descent / 2
  var a = ' a ' + r + ', ' + r + ' 0 0 1 0,'
  var h = size.height + 2 * ezP.Margin.V
  var d = 'M ' + (cursorX + size.width - p) +
  ',' + (ezP.Margin.V + dy) + a + (h - 2 * dy) +
  'h -' + (size.width - 2 * p) + a + (-h + 2 * dy) + ' z'
  return {width: size.width, d: d}
} /* eslint-enable indent */

/**
 * @param {!Blockly.Connection} c8n The connection to highlight.
 */
ezP.DelegateSvg.prototype.highlightConnection = function (c8n) {
  var steps
  var block = c8n.sourceBlock_
  if (c8n.type === Blockly.INPUT_VALUE) {
    if (c8n.isConnected()) {
      steps = this.valuePathDef_(c8n.targetBlock())
    } else if (c8n.ezp.s7r_ || c8n.ezp.optional_) {
      steps = this.carretPathDefWidth_(0).d
    } else {
      steps = this.placeHolderPathDefWidth_(0).d
    }
  } else if (c8n.type === Blockly.OUTPUT_VALUE) {
    steps = this.valuePathDef_(block)
  } else {
    var r = ezP.Style.Path.Selected.width / 2
    var a = ' a ' + r + ',' + r + ' 0 0 1 0,'
    steps = 'm ' + block.width + ',' + (-r) + a + (2 * r) + ' h ' + (-block.width) + a + (-2 * r) + ' z'
  }
  var xy = block.getRelativeToSurfaceXY()
  var x = c8n.x_ - xy.x
  var y = c8n.y_ - xy.y
  Blockly.Connection.highlightedPath_ =
  Blockly.utils.createSvgElement('path',
    {'class': 'blocklyHighlightedConnectionPath',
      'd': steps,
      transform: 'translate(' + x + ',' + y + ')'},
    c8n.sourceBlock_.getSvgRoot())
}

/**
 * Fetches the named input object.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
ezP.DelegateSvg.prototype.getInput = function (block, name) {
  return undefined
}

/**
 * Class for a statement block enumerator.
 * Deep first traversal.
 * Starts with the given block.
 * The returned object has next and depth messages.
 * @param {!Blockly.Block} block The root of the enumeration.
 * @constructor
 */
ezP.StatementBlockEnumerator = function (block) {
  var b
  var bs = [block]
  var i
  var is = [0]
  var input, next
  var me = {}
  me.next = function () {
    me.next = me.next_
    return block
  }
  me.depth = function () {
    return bs.length
  }
  me.next_ = function () {
    while ((b = bs.shift())) {
      i = is.shift()
      while ((input = b.inputList[i++])) {
        if (input.type === Blockly.NEXT_STATEMENT) {
          if (input.connection && (next = input.connection.targetBlock())) {
            bs.unshift(b)
            is.unshift(i)
            bs.unshift(next)
            is.unshift(0)
            return next
          }
        }
      }
      if ((b = b.getNextBlock())) {
        bs.unshift(b)
        is.unshift(0)
        return b
      }
    }
    return undefined
  }
  return me
}

ezP.DelegateSvg.prototype.nextStatementCheck = undefined
ezP.DelegateSvg.prototype.previousStatementCheck = undefined

/**
 * The default implementation does nothing.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.makeBlockWrapped = function (block) {
  ezP.DelegateSvg.superClass_.makeBlockWrapped.call(this, block)
  goog.asserts.assert(!this.hasSelect(block), 'Deselect block before')
  block.initSvg()
  goog.dom.removeNode(this.svgPathShape_)
  delete this.svgPathShape_
  this.svgPathShape_ = undefined
  goog.dom.removeNode(this.svgPathContour_)
  delete this.svgPathContour_
  this.svgPathContour_ = undefined
}

/**
 * The default implementation does nothing.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.makeBlockUnwrapped = function (block) {
  ezP.DelegateSvg.superClass_.makeBlockUnwrapped.call(this, block)
  this.svgPathContour_ = Blockly.utils.createSvgElement('path', {}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathContour_, 0)
  this.svgPathShape_ = Blockly.utils.createSvgElement('path', {}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathShape_, 0)
}

/**
 * Whether the block is selected.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.hasSelect = function (block) {
  return goog.dom.classlist.contains(block.svgGroup_, 'ezp-select')
}

/**
 * Enable/Disable an input.
 * The default implementation does nothing.
 * Subclassers may enable/disable an input
 * depending on the context.
 * Even input with target may be disabled.
 * This status is a part of the state of the block.
 * It survives copy/paste but not undo/redo.
 * @param {!Block} block.
 * @param {!Input} input.
 * @param {!Boolean} enabled.
 * @private
 */
ezP.DelegateSvg.prototype.setInputEnabled = function (block, input, enabled) {
  if (enabled == !input.disabled_) {
    return enabled
  }
  input.disabled_ = !enabled
  input.setVisible(enabled)
  input.connection.hidden_ = !enabled
  input.connection.setHidden(!enabled)
}

/**
 * Set the enable/disable status of the given block.
 * @param {!Block} block.
 * @param {!Input} input.
 * @param {!String} prototypeName.
 * @private
 */
ezP.DelegateSvg.prototype.toggleNamedInputDisabled = function (block, name) {
  var input = block.getInput(name)
  if (input) {
    var oldValue = input.ezpData.disabled_
    var newValue = !oldValue
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
        block, ezP.Const.Event.input_disable, name, oldValue, newValue));
    }
    input.ezpData.disabled_ = newValue
    var current = this.isRendering
    this.isRendering = true
    input.setVisible(!newValue)
    this.isRendering = current
    if (input.isVisible()) {
      for (var __ = 0, field; (field = input.fieldRow[__]); ++__) {
        if (field.getText().length>0) {
          var root = field.getSvgRoot()
          if (root) {
            root.removeAttribute('display')
          } else {
            console.log('Field with no root: did you ...initSvg()?')
          }
        }
      }
    }
    setTimeout(function(){
      block.render()
    }, 100)
  } else {
    console.log('Unable to dis/enable non existing input named '+name)
  }
}

/**
 * Set the enable/disable status of the given block.
 * @param {!Block} block.
 * @param {!Input} input.
 * @param {!String} prototypeName.
 * @private
 */
ezP.DelegateSvg.prototype.setNamedInputDisabled = function (block, name, newValue) {
  var input = block.getInput(name)
  if (input) {
    var oldValue = input.ezpData.disabled_
    newValue = !!newValue
    if (!oldValue == !newValue) {
      return
    }
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
        block, ezP.Const.Event.input_disable, name, oldValue, newValue));
    }
    input.ezpData.disabled_ = newValue
    input.setVisible(!newValue)
    setTimeout(function(){
      block.render()
    }, 100)
  } else {
    console.log('Unable to dis/enable non existing input named '+name)
  }
}

/**
 * Create a new block, with svg background and wrapped blocks.
 * @param {!WorkspaceSvg} workspace.
 * @param {!String} prototypeName.
 * @private
 */
ezP.DelegateSvg.newBlockComplete = function (workspace, prototypeName, id = undefined) {
  var B = workspace.newBlock(prototypeName, id)
  B.ezp.completeWrapped_(B)
  B.initSvg()
  return B
}

/**
 * Prepare the block to be displayed in the given workspace.
 * Nothing implemented yet
 * @param {!Block} block.
 * @param {!WorkspaceSvg} workspace.
 * @param {!Number} x.
 * @param {!Number} y.
 * @param {!String} variant.
 * @private
 */
ezP.DelegateSvg.prototype.prepareForWorkspace = function (block, workspace, x, y, variant) {
  
}

/**
 * Returns the python type of the block.
 * This information may be displayed as the last item in the contextual menu.
 * Wrapped blocks will return the parent's answer.
 * @param {!Blockly.Block} block The block.
 */
ezP.DelegateSvg.prototype.getPythonSort = function (block) {
  if (this.wrapped_) {
    var parent = block.getParent()
    return parent.ezp.getPythonSort(parent)
  }
  return this.pythonSort_
}


/**
 * Can insert a block above?
 * If the block's output connection is connected,
 * can connect the parent's output to it?
 * The connection cannot always establish.
 * @param {!Block} block.
 * @param {string} prototypeName.
 * @param {string} aboveInputName, which parent's connection to use
 */
ezP.DelegateSvg.prototype.canInsertBlockAbove = function(block, prototypeName, aboveInputName) {
  var can = false
  Blockly.Events.disable()
  var B = block.workspace.newBlock(prototypeName)
  var input = B.getInput(aboveInputName)
  goog.asserts.assert(input, 'No input named '+aboveInputName)
  var c8n = input.connection
  goog.asserts.assert(c8n, 'Unexpected dummy input '+aboveInputName)
  if (c8n.checkType_(block.outputConnection)) {
    var targetC8n = block.outputConnection.targetConnection
    can = !targetC8n || targetC8n.checkType_(B.outputConnection)
  }
  B.dispose()
  Blockly.Events.enable()
  return can
}

/**
 * Insert a parent.
 * If the block's output connection is connected,
 * connects the parent's output to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {!Block} block.
 * @param {string} prototypeName.
 * @param {string} aboveInputName, which parent's connection to use
 * @return the created block
 */
ezP.DelegateSvg.prototype.insertBlockBefore = function(block, abovePrototypeName, aboveInputName) {
  goog.asserts.assert(false, 'Must be subclassed')
}

/**
 * Get the hole filler data object for the given check.
 * @param {!Array} check an array of types.
 * @param {objet} value value of the block that will fill the hole, a string for an identifier block.
 * @private
 */
ezP.HoleFiller.getData = function(check, value) {
  var data
  if (goog.isFunction(value)) {
    data = {
      filler: value,
    }
  } else if (check.indexOf(ezP.T3.Expr.identifier) >= 0) {
    if (value) {
      data = {
        type: ezP.T3.Expr.identifier,
        value: value,
      }
    }
  } else if(check.length === 1 && ezP.T3.All.core_expressions.indexOf(check[0])>=0) {
    data = {
      type: check[0],
      value: value,
    }
  }
  return data
}

/**
 * Get an array of the deep connections that can be filled.
 * @param {!Block} block.
 * @param {Array} holes whengiven the is the array to be filled
 * @return an array of conections, holes if given.
 */
ezP.HoleFiller.getDeepHoles = function(block, holes) {
  var H = holes || []
  var i = 0, input
  var L = block.inputList
  var input
  while((input = L[i++])) {
    var c8n = input.connection
    if (c8n && c8n.type === Blockly.INPUT_VALUE && (!c8n.hidden_ || c8n.ezp.wrapped_)) {
      var target = c8n.targetBlock()
      if (target) {
        ezP.HoleFiller.getDeepHoles(target, H)
      } else if (c8n.ezp.hole_data) {
        H.push(c8n)
      }
    }
  }
  return H
}

/**
 * For each value input that is not optional and accepts an identifier,
 * create and connect an identifier block.
 * Called once at block creation time.
 * Should not be called directly
 * @param {!Blockly.Block} block to be initialized..
 */
ezP.HoleFiller.fillDeepHoles = function(workspace, holes) {
  var i = 0
  for (; i < holes.length; ++i) {
    var c8n = holes[i]
    if (c8n && c8n.type === Blockly.INPUT_VALUE && !c8n.isConnected()) {
      var data = c8n.ezp.hole_data
      if (data) {
        try {
          if (data.filler) {
            var B = data.filler(workspace)
          } else {
            B = ezP.DelegateSvg.newBlockComplete(workspace, data.type)
            if (B.ezp.setValue && data.value) {
              B.ezp.setValue(B, data.value)
            }
          }
          c8n.connect(B.outputConnection)
        }
        catch(err) {
          console.log(err.message)
        }
      }
    }
  }
}

/**
 * Change the wrap type of a block.
 * Undo compliant.
 * Used in menus.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!String} key the key of the input holding the connection
 * @param {!String} newType
 * @return yorn whether a change has been made
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.prototype.useWrapType = function (block, key, newType) {
  var input = block.getInput(key)
  if (input) {
    var target = input.connection.targetBlock()
    var oldType = target? target.type: undefined
    if (newType != oldType) {
      Blockly.Events.setGroup(true)
      if (target) {
        target.unplug()
        target.dispose()
      }
      this.completeWrappedInput_(block, input, newType)
      Blockly.Events.setGroup(false)
      return true
    }
  }
  return false
}

/**
 * Convert the block to python code.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @return some python code
 */
ezP.DelegateSvg.prototype.toPythonExpression = function (block) {
  var components = []
  this.toPythonExpressionComponents(block, components)
  return components.join('')
}

/**
 * Convert the block to python code components.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return the last element of components
 */
ezP.DelegateSvg.prototype.toPythonExpressionComponents = function (block, components) {
  var last = components[components.length-1]
  var c8n, target
  var FFF = function(x, is_operator) {
    if (x.length) {
      if (is_operator) {
        x = ' ' + x + ' '
      } else {
        if (last && last.length) {
          var mustSeparate = last[last.length-1].match(/[,;:]/)
          var maySeparate = mustSeparate || last[last.length-1].match(/[a-zA-Z_]/)
        }
        if (mustSeparate || (maySeparate && x[0].match(/[a-zA-Z_]/))) {
          components.push(' ')
        }
      }
      components.push(x)
      last = x
    }
    return true
  }
  var FF = function(field, is_operator) {
    return field && FFF(field.getText(), is_operator)
  }
  var F = function(D) {
    if (!D) {
      return
    }
    FF(D.fieldAsync) || FF(D.fieldAwait)
    FF(D.fieldPrefix)
    FF(D.fieldLabel)
    FF(D.fieldLabelStart)
    FF(D.fieldIdentifier) || FF(D.fieldCodeInput) || FF(D.fieldCodeComment) || FF(D.fieldCodeNumber) || FF(D.fieldCodeString) || FF(D.fieldCodeLongString) || FF(D.fieldOperator, true)
    if ((c8n = D.input.connection)) {
      if ((target = c8n.targetBlock())) {
        FFF(target.ezp.toPythonExpression(target))
      } else if (!c8n.ezp.optional_) {
        last = '<MISSING '+D.input.name+'>'
        components.push(last)
      }
    }
    FF(D.fieldLabelEnd)
  }
  F(this.inputs.first)
  F(this.inputs.middle)
  F(this.inputs.last)
  return last
}

/**
 * Convert the block to python code.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python, a statement block.
 * @param {!string}indent, the indentation level for the .
 * @return some python code
 */
ezP.DelegateSvg.prototype.toPythonStatement = function (block, indent, is_deep) {
  var components = []
  this.toPythonStatementComponents(block, components, indent, is_deep)
  return components.join('\n')
}

/**
 * Convert the block to python code components.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
ezP.DelegateSvg.prototype.toPythonStatementComponents = function (block, components, indent, is_deep) {
  var Cs = []
  if (block.disabled && indent.indexOf('#') < 0) {
    indent += '# '
  }
  components.push(indent+this.toPythonExpression(block))
  if (this.inputs.do) {
    var input = this.inputs.do.input
    if (input) {
      var c8n = input.connection
      if (c8n) {
        var target = c8n.targetBlock()
        if (target && !target.ezp.toPythonStatementComponents(target, components, indent+'    ', true) || !target && !c8n.ezp.optional_) {
          components.push(indent+'    <MISSING '+input.name+'>')
        }
      }
    }
  }
  if (is_deep && block.nextConnection) {
    var target = block.nextConnection.targetBlock()
    if (target) {
      var out = target.ezp.toPythonStatementComponents(target, components, indent, true)
    }
  }
  return out || (!block.disabled && block.type !== ezP.T3.Stmt.comment_stmt)
}

/**
 * Returns the coordinates of a bounding rect describing the dimensions of this
 * block.
 * As the shape is not the same comparing to Blockly's default,
 * the bounding rect changes too.
 * Coordinate system: workspace coordinates.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return {!goog.math.Rect}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
ezP.DelegateSvg.prototype.getBoundingRect = function(block) {
  return goog.math.Rect.createFromPositionAndSize(
    block.getRelativeToSurfaceXY(),
    block.getHeightWidth()
  )
}

/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * block.
 * As the shape is not the same comparing to Blockly's default,
 * the bounding box changes too.
 * Coordinate system: workspace coordinates.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return {!goog.math.Box}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
ezP.DelegateSvg.prototype.getBoundingBox = function(block) {
  return this.getBoundingRect(block).toBox()
}

/**
 * Get the closest box, according to the filter.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {function} distance Is a function.
 * @return None
 */
ezP.DelegateSvg.getBestBlock = function (workspace, weight) {
  var smallest = Infinity, best
  for (var i = 0, top; (top = workspace.topBlocks_[i++]);) {
    var box = top.ezp.getBoundingRect(top)
    console.log(top.type, box.toString(), box.getCenter().toString())
    var w = weight(box.getCenter())
    if (w < smallest) {
      smallest = w
      best = top
      console.log('BETTER', smallest, best.type)
    }
  }
  return best
}

/**
 * Get the closest box, according to the filter.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {function} distance Is a function.
 * @return None
 */
ezP.DelegateSvg.prototype.getBestBlock = function (block, distance) {
  const a = this.getBoundingBox(block)
  var smallest = {}, best
  for (var i = 0, top; (top = block.workspace.topBlocks_[i++]);) {
    if (top === block) {
      continue
    }
    var b = top.ezp.getBoundingBox(top)
    var target = top
    var c8n
    while ((c8n = target.nextConnection) && (target = c8n.targetBlock())) {
      b.expandToInclude(target.ezp.getBoundingBox(target))
    }
    var d = distance(a, b)
    if (d.major && (!smallest.major || d.major < smallest.major)) {
      smallest = d
      best = top
    } else if (d.minor && (!smallest.major && (!smallest.minor || d.minor < smallest.minor))) {
      smallest = d
      best = top
    }
  }
  return best
}

/**
 * Select the block to the left of the owner.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.prototype.selectBlockLeft = function (block) {
  var parent
  if ((parent = block.getSurroundParent())) {
    parent.select()
    return
  }
  var target = block
  do {
    parent = target
  } while ((target = parent.getParent()))
  target = parent.ezp.getBestBlock(parent, function(a, b) {
    if (a.left <= b.left) {
      return {}
    }
    // b.left < a.left
    if (a.top - b.bottom > a.left - b.left) {
      return {minor: a.left - b.left + a.top - b.bottom}
    }
    if (b.top - a.bottom > a.left - b.left) {
      return {minor: a.left - b.left + b.top - a.bottom}
    }
    return {
      major: a.left - b.left + Math.abs(a.bottom + a.top - b.bottom - b.top)/3,
      minor: b.bottom - b.top,
    }
  })
  if (target) {
    target.select()
  }
}

/**
 * Select the block to the right of the owner.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.prototype.selectBlockRight = function (block) {
  var parent, c8n, target
  for(var i = 0, input; (input = block.inputList[i++]);) {
    if ((c8n = input.connection) && (c8n.type !== Blockly.NEXT_STATEMENT) && (target = c8n.targetBlock())) {
      if (target.ezp.wrapped_) {
        target.ezp.selectBlockRight(target)
      } else {
        target.select()
      }
      return
    }
  }
  for(var i = 0, input; (input = block.inputList[i++]);) {
    if ((c8n = input.connection) && (c8n.type === Blockly.NEXT_STATEMENT) && (target = c8n.targetBlock())) {
      target.select()
      return
    }
  }
  if ((parent = block.getSurroundParent())) {
  }
  target = block
  while ((parent = target.getSurroundParent())) {
    for(var i = 0, input; (input = parent.inputList[i++]);) {
      if ((c8n = input.connection) && (c8n.type !== Blockly.NEXT_STATEMENT) && (target == c8n.targetBlock())) {
        for(; (input = parent.inputList[i++]);) {
          if ((c8n = input.connection) && (c8n.type !== Blockly.NEXT_STATEMENT) && (target = c8n.targetBlock())) {
            if (target.ezp.wrapped_) {
              target.ezp.selectBlockRight(target)
            } else {
              target.select()
            }
            return
          }
        }
      }
    }
    target = parent
  }
  target = block
  while ((parent = target.getSurroundParent())) {
    for(var i = 0, input; (input = parent.inputList[i++]);) {
      if ((c8n = input.connection) && (c8n.type === Blockly.NEXT_STATEMENT) && (target = c8n.targetBlock()) && (target !== block)) {
        target.select()
        return
      }
    }
    target = parent
  }
  target = block
  do {
    parent = target
  } while ((target = parent.getParent()))
  target = parent.ezp.getBestBlock(parent, function(a, b) {
    if (a.right >= b.right) {
      return {}
    }
    // b.right > a.right
    if (a.top - b.bottom > b.right - a.right) {
      return {minor: b.right - a.right + a.top - b.bottom}
    }
    if (b.top - a.bottom > b.right - a.right) {
      return {minor: b.right - a.right + b.top - a.bottom}
    }
    return {
      major: b.right - a.right + Math.abs(a.bottom + a.top - b.bottom - b.top)/3,
      minor: b.bottom - b.top,
    }
  })
  if (target) {
    target.select()
  }
}

/**
 * Select the block above the owner.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.prototype.selectBlockAbove = function (block) {
  var parent, c8n, target = block
  do {
    parent = target
    if ((c8n = parent.previousConnection) && (target = c8n.targetBlock())) {
      target.select()
      return
    }
  } while ((target = parent.getParent()))
  target = parent.ezp.getBestBlock(parent, function(a, b) {
    if (a.top <= b.top) {
      return {}
    }
    // b.top < a.top
    if (a.left - b.right > a.top - b.top) {
      return {minor: a.left - b.right + a.top - b.top}
    }
    if (b.left - a.right > a.top - b.top) {
      return {minor: b.left - a.right + a.top - b.top}
    }
    return {
      major: a.top - b.top + Math.abs(a.left + a.right - b.left - b.right)/3,
      minor: b.right - b.left,
    }
  })
  if (target) {
    target.select()
  }
}

/**
 * Select the block below the owner.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.prototype.selectBlockBelow = function (block) {
  var parent, c8n, target = block
  do {
    parent = target
    if ((c8n = parent.nextConnection) && (target = c8n.targetBlock())) {
      target.select()
      return
    }
  } while ((target = parent.getParent()))
  target = parent.ezp.getBestBlock(parent, function(a, b) {
    if (a.bottom >= b.bottom) {
      return {}
    }
    // b.bottom > a.bottom
    if (a.left - b.right > b.bottom - a.bottom) {
      return {minor: a.left - b.right + b.bottom - a.bottom}
    }
    if (b.left - a.right > b.bottom - a.bottom) {
      return {minor: b.left - a.right + b.bottom - a.bottom}
    }
    return {
      major: b.bottom - a.bottom + Math.abs(a.left + a.right - b.left - b.right)/3,
      minor: b.right - b.left,
    }
  })
  if (target) {
    target.select()
  }
}

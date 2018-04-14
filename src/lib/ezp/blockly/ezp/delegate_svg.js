/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
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
}

ezP.DelegateSvg.Manager.makeSubclass_ = ezP.DelegateSvg.Manager.makeSubclass
ezP.DelegateSvg.Manager.makeSubclass = function(key, model, parent, owner) {
  if (goog.isFunction(model)) {
    model = model()
  }
  owner = owner
  || (ezP.T3.Expr[key]? ezP.DelegateSvg.Expr: ezP.DelegateSvg.Stmt)
  parent = parent
  || (model && model.inputs && model.inputs.list && ezP.DelegateSvg.List)
  || owner
  ezP.Delegate.Manager.makeSubclass_(key, model, parent, owner)
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
 * This is the shape used to draw an highlighted connection contour.
 * @private
 */
ezP.DelegateSvg.prototype.svgPathConnection_ = undefined

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

console.warn('Beware of quotes in string literals')

/**
 * Create and initialize the various paths.
 * Called once at block creation time.
 * Should not be called directly
 * The block implementation is created according to a dictionary
 * input model available through `getModel().inputs`.
 * The structure of that dictionary is detailled in the treatment flow
 * below.
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
  this.svgPathConnection_ = Blockly.utils.createSvgElement('path',
    {'class': 'ezp-path-selected'}, null)
  Blockly.utils.addClass(/** @type {!Element} */ (block.svgGroup_),
    'ezp-block')
  // block.setInputsInline(true)
  block.setTooltip('')
  block.setHelpUrl('')
  var inputModel = this.getModel().inputs
  var doInsert = function(type, isMain) {
    var B = ezP.DelegateSvg.newBlockComplete(block.workspace, type)
    if (B) {
      // transfer input
      var input
      while ((input = B.inputList.shift(0))) {
        block.inputList.push(input)
        input.sourceBlock_ = block
        if (input.connection) {
          input.connection.sourceBlock_ = block
        }
        for (var j = 0, field;(field = input.fieldRow[j++]);) {
          field.sourceBlock_ = block
          if (field.textElement_) { // fields have no other element
            block.getSvgRoot().appendChild(field.textElement_)
            field.textElement_.tooltip = block
          }
        }
      }
      // xfer wrapped
      if (B.ezp.wrappedInputs_ && B.ezp.wrappedInputs_.length) {
        if (!this.wrappedInputs_) {
          this.wrappedInputs_ = []
        }
        while ((input = B.ezp.wrappedInputs_.shift(0))) {
          this.wrappedInputs_.push(input)
        }
      }
      // xfer uiModel
      var uiModel = B.ezp.uiModel// not yet used
      if (isMain) {
        this.getModel().inputs = B.getModel.inputs
      }
      B.dispose(true)
      return uiModel
    }
  }
  var doOneModel = function(K) {
    var D = inputModel[K]
    if (D && Object.keys(D).length) {
      var out = {
        fields: {}
      }
      var k = D.key // when present, the optName of the input created
      var v, field
      // first insert a base input model by creating a node
      // of a different type and transferring input ownership
      if ((v = D.insert)) {
        out.uiModel = doInsert.call(this, v)
      }
      var recorder
      // the main field may determine the name of the input
      var doEditableFields = function(name, Ctor) {
        if ((v = D[name]) !== undefined) {
          out.input = block.appendDummyInput(k || name)
          field = out.fields[name] = out.input.ezp.fields[name] = new Ctor(v)
          recorder = function() {
            var ff = field
            var kk = k && (k+'.'+name) || name
            ff.ezp.key = kk
            return function() {
              out.input.appendField(ff, kk)
            }
          } ()
          return field
        }
      }
      // first fields are editable ones
      // They belong to a dummy input
      if (!doEditableFields(ezP.Key.IDENTIFIER, ezP.FieldIdentifier)
      && !doEditableFields(ezP.Key.CODE, ezP.FieldInput)
      && !doEditableFields(ezP.Key.COMMENT, ezP.FieldComment)
      && !doEditableFields(ezP.Key.NUMBER, ezP.FieldNumber)
      && !doEditableFields(ezP.Key.STRING, ezP.FieldString)
      && !doEditableFields(ezP.Key.LONG_STRING, ezP.FieldLongString)
      && ((D.check === undefined && D.wrap === undefined) || D.dummy)) {
        out.input = block.appendDummyInput(k)
      } else {
        if ((v = D.wrap)) {
          goog.asserts.assert(!out.input, 'Wrapped blocks and editable fields are not compatable')
          k = k || v
          goog.asserts.assert(v, 'wrap must exist '+block.type+'.'+K)
          out.input = block.appendWrapValueInput(k, v, D.optional, D.hidden)
        } else if (!out.input) {
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
          if (D.suite && Object.keys(D.suite).length) {
            goog.mixin(ezp, D.suite)
          }
          if (D.optional) {//svg
            ezp.optional_ = true
          }
          ezp.disabled_ = D.disabled && !D.enabled
          if ((v = D.check)) {
            c8n.setCheck(v)
            ezp.hole_data = ezP.HoleFiller.getData(v, D.hole_value)
          } else if ((v = D.check = D.wrap)) {
            c8n.setCheck(v)
          }
        }
      }
      // Now come label fields
      var FF = function(key) {
        field = out.fields[key] = out.input.ezp.fields[key] = new ezP.FieldLabel(v)
        field.ezp.key = k+'.'+key
        out.input.appendField(field, field.ezp.key)
        field.ezp.css_class = D.css_class
        field.ezp.css_style = D.css_style
        return field
      }
      if ((v = D.dummy) !== undefined) {
        FF(ezP.Key.LABEL)
      }
      var doLabel = function(key) {
        if ((v = D[key]) !== undefined) {
          return FF(key)
        }
      }
      doLabel(ezP.Key.OPERATOR)
      doLabel(ezP.Key.LABEL)
      doLabel(ezP.Key.START)
      recorder && recorder()
      field = doLabel(ezP.Key.END)
      field && (field.ezp.suffix = true)
    }
    return out
  }
  var model = {
    fields: {},
  }
  
  // catch the statement input eventually created in parent's method
  var e8r = block.ezp.inputEnumerator(block)
  while (e8r.next()) {
    if (e8r.here.type === Blockly.NEXT_STATEMENT) {
      model.suite = {
        input: e8r.here,
      }
      break
    }
  }
  var field, D
  var FF = function(key) {
    var v
    if ((D = inputModel[key])) {
      if ((v = D['label'])) {
        field = new ezP.FieldLabel(v)
        field.ezp.css_class = D.css_class
        field.ezp.css_style = D.css_style
        field.setSourceBlock(block)
        field.name = key
        field.init()
        model.fields[key] = field
        return field
      }
    }
  }
  // next are not implemented in the model
  if ((D = this.getModel().output) && D.awaitable) {
    field = new ezP.FieldLabel('await')
    field.ezp.css_class = 'ezp-code-reserved'
    field.name = ezP.Key.AWAIT
    field.setSourceBlock(block)
    field.init()
    model.fields.await = field
  }    
  if ((D = this.getModel().statement) && D.asyncable) {
    field = new ezP.FieldLabel(ezP.Key.ASYNC)
    field.ezp.css_class = 'ezp-code-reserved'
    field.name = ezP.Key.ASYNC
    field.setSourceBlock(block)
    field.init()
    model.fields.async = field
  }
  // if insert is one of the keys, 
  if (Object.keys(inputModel).length) {
    var v
    if ((v = inputModel.insert)) {
      model = doInsert.call(this, v, true)
    } else {
      FF.call(this, ezP.Key.MODIFIER)
      FF.call(this, ezP.Key.PREFIX)
      FF.call(this, ezP.Key.SUFFIX)
      var keys = ['m_1', 'm_2', 'm_3']
      for (var i = 0, K; K = keys[i++];) {
        var p = doOneModel.call(this, K)
        if (p) {
          model[K] = p
        }
      }
    }
  }
  this.uiModel = model
  if (!block.workspace.options.readOnly && !this.eventsInit_) {
    Blockly.bindEventWithChecks_(block.getSvgRoot(), 'mouseup', block,
    function(e) {
      block.ezp.onMouseUp_(block, e)
    })
  }
  this.eventsInit_ = true;
}
console.warn('implement async and await, see above awaitable and asyncable')
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
  goog.dom.removeNode(this.svgPathConnection_)
  this.svgPathConnection_ = undefined
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
 * @param {!Blockly.Block} block to be initialized.
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
  if (this.uiModel.wrap && (wrapped = this.uiModel.wrap.input.connection.targetBlock())) {
    return wrapped.ezp.getMenuTarget(wrapped)
  }
  if (this.wrappedInputs_ && this.wrappedInputs_.length === 1 &&
    (wrapped = this.wrappedInputs_[0][0].connection.targetBlock())) {
      // if there are more than one wrapped block,
      // then we choose none of them
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
  this.consolidate(block, true)
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
    var e8r = block.ezp.inputEnumerator(block), x
    while (e8r.next()) {
      if ((x = e8r.here.connection) && (x = x.targetBlock())) {
        x.ezp.consolidate(x, deep)
      }
    }
  }
}

/**
 * Whether the block is sealed to its parent.
 * The sealed status is decided at init time.
 * The corresponding input.ezp.connection.wrapped_ is set to true.
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
    if (block.svgGroup_) {
      if (this.locked_ && block.outputConnection && block.getSurroundParent()) {
        goog.dom.classlist.add(/** @type {!Element} */(block.svgGroup_), 'ezp-locked')
      } else {
        goog.dom.classlist.remove(/** @type {!Element} */(block.svgGroup_), 'ezp-locked')
      }
    }
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
 * Highlighted block outline. Default implementation forwards to shapePathDef_.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.highlightPathDef_ = ezP.DelegateSvg.prototype.shapePathDef_

/**
 * Highlighted connection outline.
 * When a block is selected and one of its connection is also selected
 * the ui displays a bold line on the connection. When the block has wrapped input,
 * the selected connection may belong to a wrapped block.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.connectionPathDef_ = function (block) {
  return this.selectedConnection?
    this.highlightConnectionPathDef(this.selectedConnection):
    ''
}

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
  var d = this.renderDrawModel_(block)
  this.svgPathInline_.setAttribute('d', d)
  var root = block.getRootBlock()
  if (root.ezp) {
    root.ezp.alignRightEdges_(root)
  }
  this.updateAllPaths_(block)
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
        b.ezp.updateAllPaths_(b)
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
ezP.DelegateSvg.prototype.updateAllPaths_ = function (block) {
  if (this.wrapped_) {
    this.updatePath_(block, this.svgPathContour_)
    this.updatePath_(block, this.svgPathShape_)
    this.updatePath_(block, this.svgPathHighlight_)
    this.updatePath_(block, this.svgPathConnection_, this.connectionPathDef_)
    this.updatePath_(block, this.svgPathCollapsed_)
  } else {
    this.updatePath_(block, this.svgPathContour_, this.contourPathDef_)
    this.updatePath_(block, this.svgPathShape_, this.shapePathDef_)
    this.updatePath_(block, this.svgPathHighlight_, this.highlightPathDef_)
    this.updatePath_(block, this.svgPathConnection_, this.connectionPathDef_)
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
    return this.locked_ && block.getSurroundParent()? 0: ezP.Font.space
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
    return this.locked_ && block.getSurroundParent()? 0: ezP.Font.space
  } else {
    return ezP.Padding.r()
  }  
}

/**
 * Render the inputs of the block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawModel_ = function (block) {
  /* eslint-disable indent */
  var io = {
    block: block,
    steps: [],
    canDummy: true,
    canValue: true,
    canStatement: true,
    canList: true,
    canForif: true,
    i: 0, // input index
    i_max: block.inputList.length,
    f: 0, // field index
  }
  io.cursorX = this.getPaddingLeft(block)
  if (!block.outputConnection) {
    this.renderDrawSharp_(io)
    this.shouldSeparateField = false // when true, add a space to separate letters
    // only blocks with outputConnection may be stacked horizontally
    // such that visual letter separation may be a problem
    // For other blocks, there is no text field rendered to the left
  } else if (!block.outputConnection.isConnected() || !this.wrapped_ && !this.locked_) {
    // the left part of the contour is the visual separator
    this.shouldSeparateField = false
  }
  io.shouldSeparateField = this.shouldSeparateField
  if ((io.field = this.uiModel.fields.async)) {
    this.renderDrawField_(io)
  }
  if ((io.field = this.uiModel.fields.await)) {
    this.renderDrawField_(io)
  }
  if ((io.field = this.uiModel.fields.prefix)) {
    this.renderDrawField_(io)
  }
  for (; (io.input = block.inputList[io.i]); io.i++) {
    goog.asserts.assert(io.input.ezp, 'Input with no ezp '+io.input.name+' in block '+block.type)
    io.inputDisabled = io.input.ezp.disabled_
    if (io.input.isVisible() && !io.inputDisabled) {
      this.renderDrawInput_(io)
    } else {
      for (var j = 0; (io.field = io.input.fieldRow[j]); ++j) {
        if (io.field.getText().length>0) {
          var root = io.field.getSvgRoot()
          if (root) {
            root.setAttribute('display', 'none')
          } else {
            // console.log('Field with no root: did you ...initSvg()?')
          }
        }
      }
      if ((io.c8n = io.input.connection)) {
        if ((io.target = io.c8n.targetBlock())) {
          var root = io.target.getSvgRoot()
          if (root) {
            root.setAttribute('display', 'none')
          } else {
            console.log('Block with no root: did you ...initSvg()?')
          }
        }
      }
    }
  }
  if ((io.field = this.uiModel.fields.suffix)) {
    this.renderDrawField_(io)
  }
  io.cursorX += this.getPaddingRight(block)
  this.minWidth = block.width = Math.max(block.width, io.cursorX)
  this.shouldSeparateField = io.shouldSeparateField
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
 * Render the field at io.field, which must be defined.
 * 
 * @param io An input/output record.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawField_ = function (io) {
  if (io.field.isVisible()) {
    var root = io.field.getSvgRoot()
    if (root) {
      var text = io.field.getText()
      if (text.length) {
        // if the text is void, it can not change whether
        // the last character was a letter or not
        if (io.shouldSeparateField && ezP.XRE.id_continue.test(text[0])) {
          // add a separation
          io.cursorX += ezP.Font.space
        }
        io.shouldSeparateField = ezP.XRE.id_continue.test(text[text.length-1])
      }
      var ezp = io.field.ezp
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

/**
 * Render the fields of a block input.
 * 
 * @param io An input/output record.
 * @param only_prefix boolean 
 * @return the delta of io.cursorX
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawFields_ = function (io, only_prefix) {
  var here = io.cursorX
  io.f = 0
  for (; (io.field = io.input.fieldRow[io.f]); ++io.f) {
    if (!!only_prefix === !io.field.ezp.suffix) {
      this.renderDrawField_(io)
    }
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
  var delta = this.renderDrawFields_(io, true)
  var c8n = io.input.connection
  if (c8n) {// once `&&!c8n.hidden_` was there, bad idea but why was it here?
    c8n.setOffsetInBlock(io.cursorX, 0)
    var target = c8n.targetBlock()
    if (!!target) {
      var root = target.getSvgRoot()
      if (!!root) {
        root.setAttribute('transform', 'translate(' + io.cursorX + ', 0)')
        if (!target.ezp.isRendering) {
          target.ezp.shouldSeparateField = (target.ezp.wrapped_ ||target.ezp.locked_) && io.shouldSeparateField
        }
        target.render()
        io.shouldSeparateField = (target.ezp.wrapped_ ||target.ezp.locked_) && target.ezp.shouldSeparateField
        var bBox = target.getHeightWidth()
        io.cursorX += bBox.width
      }
    } else if (!this.locked_) {
      // locked blocks won't display any placeholder
      // (input with no target)
      var ezp = c8n.ezp
      var pw = ezp.s7r_ || ezp.optional_?
      this.carretPathDefWidth_(io.cursorX):
      this.placeHolderPathDefWidth_(io.cursorX)
      io.steps.push(pw.d)
      io.cursorX += pw.width
      if (pw.width) {
        // a space was added as a visual separator anyway
        io.shouldSeparateField = false
      }
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
ezP.DelegateSvg.prototype.highlightConnectionPathDef = function (c8n) {
  var steps = ''
  var block = c8n.sourceBlock_
  if (c8n.type === Blockly.INPUT_VALUE) {
    if (c8n.isConnected()) {
      steps = this.valuePathDef_(c8n.targetBlock())
    } else if (c8n.ezp.s7r_ || c8n.ezp.optional_) {
      steps = this.carretPathDefWidth_(c8n.offsetInBlock_.x).d
    } else {
      steps = this.placeHolderPathDefWidth_(c8n.offsetInBlock_.x).d
    }
  } else if (c8n.type === Blockly.OUTPUT_VALUE) {
    steps = this.valuePathDef_(block)
  } else {
    var r = ezP.Style.Path.Selected.width / 2
    var a = ' a ' + r + ',' + r + ' 0 0 1 0,'
    if (c8n === block.previousConnection) {
      steps = 'm ' + block.width + ',' + (-r) + a + (2 * r) + ' h ' + (-block.width) + a + (-2 * r) + ' z'
    } else if (c8n === block.nextConnection) {
      if (block.height > ezP.Font.lineHeight()) { // this is not clean design
        steps = 'm ' + (ezP.Font.tabWidth+ezP.Style.Path.radius()) + ',' + (block.height-r) + a + (2 * r) + ' h ' + (-ezP.Font.tabWidth-ezP.Style.Path.radius()) + a + (-2 * r) + ' z'
      } else {
        steps = 'm ' + block.width + ',' + (block.height-r) + a + (2 * r) + ' h ' + (-block.width) + a + (-2 * r) + ' z'        
      }
    } else {
      steps = 'm ' + (block.width) + ',' + (-r+ezP.Font.lineHeight()) + a + (2 * r) + ' h ' + (ezP.Font.tabWidth-block.width) + a + (-2 * r) + ' z'
    }
  }
  return steps
}

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
 * @return {Blockly.Input} The input object, or null if input does not exist. Input that are disabled are skipped.
 */
ezP.DelegateSvg.prototype.getInput = function (block, name) {
  var e8r = this.inputEnumerator(block)
  while (e8r.next()) {
    if (e8r.here.name === name) {
      return e8r.here
    }
  }
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
  var e8r
  var e8rs = [block.ezp.inputEnumerator(block)]
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
      e8r = e8rs.shift()
      while (e8r.next()) {
        if (e8r.here.type === Blockly.NEXT_STATEMENT) {
          if (e8r.here.connection && (next = e8r.here.connection.targetBlock())) {
            bs.unshift(b)
            e8rs.unshift(e8r)
            bs.unshift(next)
            e8rs.unshift(next.ezp.inputEnumerator(next))
            return next
          }
        }
      }
      if ((b = b.getNextBlock())) {
        bs.unshift(b)
        e8rs.unshift(b.ezp.inputEnumerator(b))
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
  input.connection.setHidden(!enabled)
}

/**
 * Set the enable/disable status of the given block.
 * @param {!Block} block.
 * @param {!Input} input.
 * @param {!String} name  input name.
 * @param {!boolean} newValue.
 * @private
 */
ezP.DelegateSvg.prototype.setNamedInputDisabled = function (block, name, newValue) {
  var input = block.getInput(name)
  if (input) {
    var oldValue = input.ezp.disabled_
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
        block, ezP.Const.Event.input_disable, name, oldValue, newValue));
    }
    input.ezp.disabled_ = newValue
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
      var c8n = input.connection
      if (c8n) {
        var target = c8n.targetBlock()
        if (target) {
          var root = target.getSvgRoot()
          if (root) {
            root.removeAttribute('display')
          } else {
            console.log('Block with no root: did you ...initSvg()?')
          }
        }
      }
    }
    setTimeout(function(){
      if (block.workspace) {
        block.render()
      }
    }, 1)
  } else {
    console.log('Unable to dis/enable non existing input named '+name)
  }
}

/**
 * Create a new block, with svg background and wrapped blocks.
 * This is the expected way to create the block
 * @param {!WorkspaceSvg} workspace.
 * @param {!String} prototypeName.
 * @private
 */
ezP.DelegateSvg.newBlockComplete = function (workspace, prototypeName, id = undefined) {
  var B = workspace.newBlock(prototypeName, id)
  B.ezp.completeWrapped_(B)
  B.ezp.consolidate(B, true)
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
 * @param {string} surroundInputName, which parent's connection to use
 */
ezP.DelegateSvg.prototype.canInsertParent = function(block, prototypeName, subtype, surroundInputName) {
  var can = false
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
 * @param {string} surroundInputName, which parent's connection to use
 * @param {string} subtype, for subclassers
 * @return the created block
 */
ezP.DelegateSvg.prototype.insertParent = function(block, surroundPrototypeName, subtype, surroundInputName) {
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
  var e8r = block.ezp.inputEnumerator(block)
  while (e8r.next()) {
    var c8n = e8r.here.connection
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
        } catch(err) {
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
          var maySeparate = mustSeparate || ezP.XRE.id_continue.test(last[last.length-1])
        }
        if (mustSeparate || (maySeparate && ezP.XRE.id_continue.test(x[0]))) {
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
  var doOneModel = function(D) {
    if (!D) {
      return
    }
    FF(D.fields.prefix)
    FF(D.fields.label)
    FF(D.fields.start)
    FF(D.fields.identifier) || FF(D.fields.input) || FF(D.fields.comment) || FF(D.fields.number) || FF(D.fields.string) || FF(D.fields.longString) || FF(D.fields.operator, true)
    if ((c8n = D.input.connection)) {
      if ((target = c8n.targetBlock())) {
        FFF(target.ezp.toPythonExpression(target))
      } else if (!c8n.ezp.optional_) {
        last = '<MISSING '+D.input.name+'>'
        components.push(last)
      }
    }
    FF(D.fields.end)
  }
  doOneModel(this.uiModel.m_1)
  doOneModel(this.uiModel.m_2)
  doOneModel(this.uiModel.m_3)
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
  if (this.uiModel.suite) {
    var input = this.uiModel.suite.input
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
 * Coordinate system: global coordinates.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return {!goog.math.Rect}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
ezP.DelegateSvg.prototype.getGlobalBoundingRect = function(block) {
  var R = this.getBoundingRect(block)
  R.scale(block.workspace.scale)
  R.translate(block.workspace.getOriginOffsetInPixels())
  return R
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
 * @param {function} distance is a function.
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
 * @param {function} distance is a function.
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
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    target.ezp.selectBlockLeft(target)
    return
  }
  var doLast = function(B) {
    var e8r = B.ezp.inputEnumerator(B)
    e8r.end()
    while (e8r.previous()) {
      var c8n = e8r.here.connection
      if (c8n && (c8n.type !== Blockly.NEXT_STATEMENT)) {
        var target = c8n.targetBlock()
        if (!target || (!target.ezp.wrapped_ && !target.ezp.locked_) || (c8n = doLast(target))) {
          return c8n
        }
      }
    }
    return null
  }
  var parent, input, c8n
  var selectTarget = function(c8n) {
    var target = c8n.targetBlock()
    if (!target) {
      return false
    }
    if (!target.ezp.wrapped_ && !target.ezp.locked_) {
      ezP.SelectedConnection.set(null)
      target.select()
      return true
    }
    if ((c8n = doLast(target))) {
      if ((target = c8n.targetBlock())) {
        ezP.SelectedConnection.set(null)
        target.select()
      } else {
        ezP.SelectedConnection.set(c8n)
      }
      return true
    }
    return false
  }
  var selectConnection = function(B) {
    if (selectTarget(c8n)) {
      return true
    }
    // do not select a connection
    // if there is no unwrapped surround parent
    var parent = B
    while (parent.ezp.wrapped_ || parent.ezp.locked_) {
      if (!(parent = parent.getSurroundParent())) {
        return false
      }
    }
    ezP.SelectedConnection.set(c8n)
    return true
  }
  if ((c8n = this.selectedConnection)) {
    if (c8n === block.nextStatement) {
    } else if (c8n.type !== Blockly.NEXT_STATEMENT) {
      // select the previous non statement input if any
      var e8r = block.ezp.inputEnumerator(block)
      while (e8r.next()) {
        if (e8r.here.connection && c8n === e8r.here.connection) {
          // found it, step down
          e8r.previous()
          while (e8r.previous()) {
            if ((c8n = e8r.here.connection) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
              if (selectConnection(block)) {
                return
              }
            }
          }
          break
        }
      }
      e8r.start(block)
      while (e8r.next()) {
        if (e8r.here.connection && c8n === e8r.here.connection) {
          // found it, step down
          e8r.previous()
          while (e8r.previous()) {
            if ((c8n = e8r.here.connection) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
              if (selectConnection(block)) {
                return
              }
            }
          }
          break
        }
      }
    } else if (!block.ezp.wrapped_ && !block.ezp.locked_) {
      ezP.SelectedConnection.set(null)
      block.select()
      return  
    }
  }
  if ((parent = block.getSurroundParent())) {
    // select the previous non statement input if any
    var e8r = parent.ezp.inputEnumerator(parent)
    while (e8r.next()) {
      if ((c8n = e8r.here.connection) && block === c8n.targetBlock()) {
        // found it, step down
        e8r.previous()
        while (e8r.previous()) {
          if ((c8n = e8r.here.connection) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
            if (selectConnection(c8n)) {
              return
            }
          }
        }
        break
      }
    }
    do {
      if (!parent.ezp.wrapped_ && !parent.ezp.locked_) {
        ezP.SelectedConnection.set(null)
        parent.select()
        return
      }
    } while ((parent = block.getSurroundParent()))
  }
  target = block
  do {
    parent = target
  } while ((target = parent.getSurroundParent()))
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
 * The owner is either a selected block or wrapped into a selected block.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.prototype.selectBlockRight = function (block) {
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    target.ezp.selectBlockRight(target)
    return
  }
  var parent, input, c8n
  var selectTarget = function() {
    if (target = c8n.targetBlock()) {
      if (target.ezp.wrapped_ || target.ezp.locked_) {
        target.ezp.selectBlockRight(target)
      } else {
        ezP.SelectedConnection.set(null)
        target.select()
      }
      return true
    }
    return false
  }
  var selectConnection = function() {
    if (!selectTarget()) {
      parent = block
      while (parent.ezp.wrapped_ || parent.ezp.locked_) {
        if (!(parent = parent.getSurroundParent())) {
          return false
        }
      }
      ezP.SelectedConnection.set(c8n)
    }
    return true
  }
  if ((c8n = this.selectedConnection)) {
    if (c8n.type === Blockly.NEXT_STATEMENT) {
      if (c8n === block.nextConnection) {
        // select the target block (if any) when the nextConnection is in horizontal mode
        if (c8n.ezp.isAtRight) {
          if (selectTarget()) {
            return
          }
        }
      } else if (selectTarget()) {
        return
      }
    } else if (selectTarget()) {
      // the connection was selected, now it is its target
      return
    } else {
      // select the connection following `this.selectedConnection`
      // which not a NEXT_STATEMENT one, if any
      var e8r = block.ezp.inputEnumerator(block)
      while (e8r.next()) {
        if (e8r.here.connection && c8n === e8r.here.connection) {
          // found it
          while (e8r.next()) {
            if ((c8n = e8r.here.connection) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
              if (selectConnection()) {
                return
              }
            }
          }
        }
      }
      // it was the last value connection
      // find a statement connection
      e8r.start()
      while(e8r.next()) {
        if ((c8n = e8r.here.connection) && (c8n.type === Blockly.NEXT_STATEMENT)) {
          if (selectConnection()) {
            return
          }
        }
      }
    }
  } else {
    // select the first non statement connection
    var e8r = block.ezp.inputEnumerator(block)
    while (e8r.next()) {
      if ((c8n = e8r.here.connection) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
        if (selectConnection()) {
          return
        }
      }
    }
    // all the input connections are either dummy or statement connections
    // select the first statement connection (there is an only one for the moment)
    e8r.start()
    while (e8r.next()) {
      if ((c8n = e8r.here.connection) && (c8n.type === Blockly.NEXT_STATEMENT)) {
        if (selectConnection()) {
          return
        }
      }
    }
  }
  if (!(c8n = this.selectedConnection) || (c8n.type !== Blockly.NEXT_STATEMENT)) {
    // try to select the next connection of a surrounding block
    // only when a value input is connected to the block
    target = block
    while ((parent = target.getSurroundParent())) {
      var e8r = parent.ezp.inputEnumerator(parent)
      while (e8r.next()) {
        if ((c8n = e8r.here.connection) && (target === c8n.targetBlock())) {
          if (c8n.type === Blockly.NEXT_STATEMENT) {
            // nothing is more right...
            break
          } else {
            // try a value input after
            while (e8r.next()) {
              if ((c8n = e8r.here.connection) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
                if (selectConnection()) {
                  return
                }
              }
            }
            // try the next statement input if any
            e8r.start()
            while (e8r.next()) {
              if ((c8n = e8r.here.connection) && (c8n.type === Blockly.NEXT_STATEMENT)) {
                if (selectConnection()) {
                  return
                }
              }
            }
          }
        }
      }
      target = parent
    }
    target = block
    while ((parent = target.getSurroundParent())) {
      var e8r = parent.ezp.inputEnumerator(parent)
      while (e8r.next()) {
        if ((c8n = e8r.here.connection) && (c8n.type === Blockly.NEXT_STATEMENT) && (target = c8n.targetBlock()) && (target !== block)) {
          ezP.SelectedConnection.set(null)
          target.select()
          return
        }
      }
      target = parent
    }
  }
  // now try to select a top block
  target = block
  do {
    parent = target
  } while ((target = parent.getSurroundParent()))
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
    ezP.SelectedConnection.set(null)
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
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    target.ezp.selectBlockAbove(target)
    return
  }
  var c8n
  if ((c8n = this.selectedConnection)) {
    if (c8n === block.previousConnection) {
      if ((target = c8n.targetBlock())) {
        ezP.SelectedConnection.set(null)
        target.select()
        return
      }
    } else {
      ezP.SelectedConnection.set(null)
      block.select()
      return
    }
  } else if ((c8n = block.previousConnection)) {
    block.select()
    ezP.SelectedConnection.set(block.previousConnection)
    return
  }
  var parent
  target = block
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
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    target.ezp.selectBlockBelow(target)
    return
  }
  var parent, c8n
  if ((c8n = this.selectedConnection)) {
    if (c8n === block.previousConnection) {
      ezP.SelectedConnection.set(null)
      block.select()
      return
    } else if (c8n === block.nextConnection) {
      if ((target = c8n.targetBlock())) {
        ezP.SelectedConnection.set(null)
        target.select()
        return
      }
    } else if (block.nextConnection) {
      block.select()
      ezP.SelectedConnection.set(block.nextConnection)
      return
    }
  } else if (block.nextConnection) {
    block.select()
    ezP.SelectedConnection.set(block.nextConnection)
    return
  }
  target = block
  do {
    parent = target
    if ((c8n = parent.nextConnection) && (target = c8n.targetBlock())) {
      target.select()
      return
    }
  } while ((target = parent.getSurroundParent()))

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

/**
 * Get the input for the given event.
 * The block is already rendered once.
 * 
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {Object} e in general a mouse down event
 * @return None
 */
ezP.DelegateSvg.prototype.getConnectionForEvent = function (block, e) {
  var where = new goog.math.Coordinate(e.clientX, e.clientY)
  where = goog.math.Coordinate.difference(where, block.workspace.getOriginOffsetInPixels())
  where.scale(1/block.workspace.scale)
  var rect = this.getBoundingRect(block)
  where = goog.math.Coordinate.difference(where, rect.getTopLeft())
  var e8r = block.ezp.inputEnumerator(block)
  while (e8r.next()) {
    var c8n = e8r.here.connection
    if (c8n) {
      if (c8n.type === Blockly.INPUT_VALUE) {
        var target = c8n.targetBlock()
        if (target) {
          if ((c8n = target.ezp.getConnectionForEvent(target, e))) {
            return c8n
          }
        } else {
          var R = new goog.math.Rect(
            c8n.offsetInBlock_.x - ezP.Font.space/2,
            c8n.offsetInBlock_.y + ezP.Font.space/2,
            c8n.ezp.optional_ || c8n.ezp.s7r_? 2*ezP.Font.space: 4*ezP.Font.space,
            ezP.Font.lineHeight() - ezP.Font.space,        
          )
          if (R.contains(where)) {
            return c8n
          }
        }
      } else if (c8n.type === Blockly.NEXT_STATEMENT) {
        var R = new goog.math.Rect(
          c8n.offsetInBlock_.x,
          c8n.offsetInBlock_.y - ezP.Font.space/2,
          ezP.Font.tabWidth,
          ezP.Font.space,        
        )
        if (R.contains(where)) {
          return c8n
        }        
      }
    }
  }
  if ((c8n = block.previousConnection)) {
    var R = new goog.math.Rect(
      c8n.offsetInBlock_.x,
      c8n.offsetInBlock_.y,
      rect.width,
      ezP.Font.space/2,        
    )
    if (R.contains(where)) {
      return c8n
    }  
  }
  if ((c8n = block.nextConnection)) {
    if (rect.height > ezP.Font.lineHeight()) {// Not the cleanest design
      var R = new goog.math.Rect(
        c8n.offsetInBlock_.x,
        c8n.offsetInBlock_.y - ezP.Font.space/2,
        ezP.Font.tabWidth + ezP.Style.Path.radius(),// R U sure?
        ezP.Font.space/2,        
      )  
    } else {
      var R = new goog.math.Rect(
        c8n.offsetInBlock_.x,
        c8n.offsetInBlock_.y - ezP.Font.space/2,
        rect.width,
        ezP.Font.space/2,        
      )  
    }
    if (R.contains(where)) {
      return c8n
    }  
  }
}

/**
 * The selected connection is used to insert blocks with the keyboard.
 * When a connection is selected, one of the ancestor blocks is also selected.
 * Then, the higlighted path of the source blocks is not the outline of the block
 * but the shape of the connection as it shows when blocks are moved close enough.
 */
ezP.SelectedConnection = function() {
  var c8n_
  var me = {
    /**
     * Lazy getter
    */
    get: function() {
      return c8n_
    },
    set: function(connection) {
      var B
      if (connection) {
        var block = connection.getSourceBlock()
        if (block) {
          if (block.ezp.locked_) {
            return
          }
          if (connection === block.previousConnection && connection.targetConnection) {
            connection = connection.targetConnection
            var unwrapped = block = connection.getSourceBlock()
            do {
              if (!unwrapped.ezp.wrapped_) {
                unwrapped.select()
                unwrapped.bringToFront()
                break
              }
            } while ((unwrapped = unwrapped.getSurroundParent()))
          }
        }
      }
      if (connection !== c8n_) {
        if (c8n_) {
          var oldBlock = c8n_.getSourceBlock()
          if (oldBlock) {
            oldBlock.ezp.selectedConnection = null
            oldBlock.ezp.selectedConnectionSource_ = null
            oldBlock.removeSelect()
            if (oldBlock === Blockly.selected) {
              oldBlock.ezp.updateAllPaths_(oldBlock)
              oldBlock.addSelect()
            } else if ((B = Blockly.selected)) {
              B.ezp.selectedConnectionSource_ = null
              B.removeSelect()
              B.addSelect()
            }
          }
          c8n_ = null
        }
        if (connection) {
          var block = connection.getSourceBlock()
          if (block) {
            var unwrapped = block
            while (unwrapped.ezp.wrapped_) {
              if (!(unwrapped = unwrapped.getSurroundParent())) {
                return
              }
            }
            block.ezp.selectedConnection = c8n_ = connection
            unwrapped.ezp.selectedConnectionSource_ = block
            unwrapped.select()
            block.removeSelect()
            block.ezp.updateAllPaths_(block)
            block.addSelect()
          }
        }
      }
    }
  }
  return me
} ()

/**
 * Get the subtype of the block.
 * The default implementation does nothing.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is return, when defined or not null.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return ''
 */
ezP.DelegateSvg.prototype.getSubtype = function (block) {
  return ''
}

/**
 * Set the subtype of the block.
 * The default implementation does nothing.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is expected.
 * The default implementation return false.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.prototype.setSubtype = function (block, subtype) {
  return false
}

/**
 * Insert a block of the given type.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {Object} action the prototype of the block to insert, or an object containning this prototype.
 * @param {string} subtype the subtype of the block to insert.
 * @return the block that was inserted
 */
ezP.DelegateSvg.prototype.insertBlockOfType = function (block, action, subtype) {
  if (!action) {
    return null
  }
  // get the type:
  var prototypeName = action.type || action
  // create a block out of the undo mechanism
  var disabler = new ezP.Events.Disabler()
  var candidate = ezP.DelegateSvg.newBlockComplete(block.workspace, prototypeName)
  if (!candidate) {
    disabler.stop()
    return
  }
  var c8n_N = action.subtype || subtype
  if (candidate.ezp.setSubtype(candidate, c8n_N)) {
    c8n_N = undefined
  }
  var c8n, otherC8n, foundC8n
  var fin = function(prepare) {
    disabler.stop()
    Blockly.Events.setGroup(true)
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockCreate(candidate))
    }
    candidate.render()
    prepare && prepare()
    otherC8n.connect(c8n)
    candidate.select()
    candidate.bumpNeighbours_()
    Blockly.Events.setGroup(false)
    return candidate
  }
  if ((otherC8n = ezP.SelectedConnection.get())) {
    var otherSource = otherC8n.getSourceBlock()
    if (otherC8n.type === Blockly.INPUT_VALUE) {
      if ((c8n = candidate.outputConnection)&& c8n.checkType_(otherC8n)) {
        return fin()
      }
    } else if (otherC8n === otherSource.previousConnection) {
      if ((c8n = candidate.nextConnection)&& c8n.checkType_(otherC8n)) {
        var targetC8n = otherC8n.targetConnection
        if (targetC8n && candidate.previousConnection
          && targetC8n.checkType_(candidate.previousConnection)) {
          return fin(function() {
            targetC8n.connect(candidate.previousConnection)
          })
        } else {
          return fin(function() {
            var its_xy = block.getRelativeToSurfaceXY();
            var my_xy = candidate.getRelativeToSurfaceXY();
            var HW = candidate.getHeightWidth()
            candidate.moveBy(its_xy.x-my_xy.x, its_xy.y-my_xy.y-HW.height)
          })
        }
        // unreachable code
      }
    } else if (otherC8n.type === Blockly.NEXT_STATEMENT) {
      if ((c8n = candidate.previousConnection)&& c8n.checkType_(otherC8n)) {
        var targetC8n = otherC8n.targetConnection
        if (targetC8n && candidate.nextConnection
          && targetC8n.checkType_(candidate.nextConnection)) {
          return fin(function() {
            targetC8n.connect(candidate.previousConnection)
          })
        } else {
          return fin()
        }
      }
    }
  }
  if ((c8n = candidate.outputConnection)) {
    // try to find a free connection in a block
    // When not undefined, the returned connection can connect to c8n.
    var findC8n = function(block) {
      var e8r = block.ezp.inputEnumerator(block)
      var otherC8n, foundC8n, target
      while (e8r.next()) {
        if ((foundC8n = e8r.here.connection) && foundC8n.type === Blockly.INPUT_VALUE) {
          if ((target = foundC8n.targetBlock())) {
            if (!(foundC8n = findC8n(target))) {
              continue
            }
          } else if (!c8n.checkType_(foundC8n)) {
            continue
          }
          if (!foundC8n.ezp.s7r_ && (!c8n_N || foundC8n.ezp.name_ === c8n_N)) {
            // we have found a connection
            // which s not a separator and
            // with the expected name
            return foundC8n
          }
          // if there is no connection with the expected name,
          // then remember this connection and continue the loop
          // We remember the last separator connection
          // of the first which is not a separator
          if (!otherC8n || otherC8n.ezp.s7r_) {
            otherC8n = foundC8n
          }
        }
      }
      return otherC8n
    }
    if ((otherC8n = findC8n(block))) {
      return fin()
    }
  }
  if ((c8n = candidate.previousConnection)) {
    if ((otherC8n = block.nextConnection) && c8n.checkType_(otherC8n)) {
      return fin(function() {
        if ((targetC8n = otherC8n.targetConnection)) {
          // connected to something, beware of orphans
          otherC8n.disconnect()
          if (candidate.nextConnection && candidate.nextConnection.checkType_(targetC8n)) {
            candidate.nextConnection.connect(targetC8n)
            targetC8n = null
          }
        }
        c8n.connect(otherC8n)
        if (targetC8n) {
          targetC8n.getSourceBlock().bumpNeighbours_()
        }
      })
    }
  }
  if ((c8n = candidate.nextConnection)) {
    if ((otherC8n = block.previousConnection) && c8n.checkType_(otherC8n)) {
      if ((targetC8n = otherC8n.targetConnection) && candidate.previousConnection && candidate.previousConnection.checkType_(targetC8n)) {
        return fin(function() {
          candidate.previousConnection.connect(targetC8n)
        })
      } else {
        return fin(function() {
          var its_xy = block.getRelativeToSurfaceXY();
          var my_xy = candidate.getRelativeToSurfaceXY();
          var HW = candidate.getHeightWidth()
          candidate.moveBy(its_xy.x-my_xy.x, its_xy.y-my_xy.y-HW.height)
        })
      }
    }
  }
  if (candidate) {
    candidate.dispose(true)
  }
  disabler.stop()
  return null
}

/**
 * Whether the given block can lock.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return boolean
 */
ezP.DelegateSvg.prototype.canLock = function (block) {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var e8r = block.ezp.inputEnumerator(block), c8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((target = c8n.targetBlock())) {
        if (!target.ezp.canLock(target)) {
          return false
        }
      } else if (!c8n.ezp.optional_ && !c8n.ezp.s7r_) {
        return false
      }
    }
  }
  return true
}
/**
 * Whether the given block can unlock.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return boolean, true only if there is something to unlock
 */
ezP.DelegateSvg.prototype.canUnlock = function (block) {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var e8r = block.ezp.inputEnumerator(block), c8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((target = c8n.targetBlock())) {
        if (target.ezp.canUnlock(target)) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * Lock the given block.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return the number of block locked
 */
ezP.DelegateSvg.prototype.lock = function (block) {
  var ans = 0
  if (this.locked_ || !block.ezp.canLock(block)) {
    return ans
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
    block, ezP.Const.Event.locked, null, this.locked_, true))
  }
  this.locked_ = true
  if (block === ezP.SelectedConnection.set)
  ezP.SelectedConnection.set(null)
  // list all the input for connections with a target
  var c8n
  if ((c8n = ezP.SelectedConnection.get()) && (block === c8n.getSourceBlock())) {
    ezP.SelectedConnection.set(null)
  }
  var e8r = block.ezp.inputEnumerator(block), otherC8n, foundC8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((target = c8n.targetBlock())) {
        ans += target.ezp.lock(target)
      }
      if (c8n.type === Blockly.INPUT_VALUE) {
        c8n.setHidden(true)
      }
    }
  }
  if ((c8n = block.nextConnection)) {
    if ((target = c8n.targetBlock())) {
      ans += target.ezp.lock(target)
    }
  }
  if (block === Blockly.selected) {
    var parent = block
    while ((parent = parent.getSurroundParent())) {
      if (!parent.ezp.wrapped_ && ! parent.ezp.locked_) {
        parent.select()
        break
      }
    }
  }
  (block.getSurroundParent()||block).render()
  return ans
}
/**
 * Unlock the given block.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {boolean} deep Whether to unlock statements too.
 * @return the number of block locked
 */
ezP.DelegateSvg.prototype.unlock = function (block, shallow) {
  var ans = 0
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
    block, ezP.Const.Event.locked, null, this.locked_, false))
  }
  this.locked_ = false
  // list all the input for connections with a target
  var e8r = block.ezp.inputEnumerator(block), c8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((!shallow || c8n.type === Blockly.INPUT_VALUE) && (target = c8n.targetBlock())) {
        ans += target.ezp.unlock(target, shallow)
      }
      c8n.setHidden(false)
    }
  }
  if (!shallow && (c8n = block.nextConnection)) {
    if ((target = c8n.targetBlock())) {
      ans += target.ezp.unlock(target)
    }
  }
  (block.getSurroundParent()||block).render()
  return ans
}

/**
 * Did connect this block's connection to another connection.
 * When conecting locked blocks, select the receiver.
 * @param {!Blockly.Block} block
 * @param {!Blockly.Connection} connection what has been connected in the block
 * @param {!Blockly.Connection} oldTargetConnection what was previously connected in the block
 * @param {!Blockly.Connection} oldConnection what was previously connected to the new targetConnection
 */
ezP.DelegateSvg.prototype.didConnect = function(block, connection, oldTargetConnection, oldConnection) {
  ezP.DelegateSvg.superClass_.didConnect.call(this, block, connection, oldTargetConnection, oldConnection)
  if (block === Blockly.selected && this.locked_) {
    block.ezp.unlock(block)
  }
}

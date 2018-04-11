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

goog.provide('ezP.DelegateSvg.Expr')

goog.require('ezP.DelegateSvg')
goog.require('ezP.T3.All')
goog.require('ezP.KeyHandler')

/**
 * Class for a DelegateSvg, value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr = function (prototypeName) {
  ezP.DelegateSvg.Expr.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Expr, ezP.DelegateSvg)

// Default delegate for all expression blocks
ezP.Delegate.Manager.registerAll(ezP.T3.Expr, ezP.DelegateSvg.Expr, true)

ezP.DelegateSvg.Expr.prototype.shapePathDef_ =
  ezP.DelegateSvg.Expr.prototype.contourPathDef_ =
    ezP.DelegateSvg.Expr.prototype.highlightPathDef_ =
      ezP.DelegateSvg.Expr.prototype.valuePathDef_

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Expr.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
    this.renderDrawValueInput_(io)
}

/**
 * Render the leading # character for collapsed statement blocks.
 * Statement subclasses must override it.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Expr.prototype.renderDrawSharp_ = function (io) {
  return
}

/**
 * Can remove and bypass the parent?
 * If the parent's output connection is connected,
 * can connect the block's output connection to it?
 * The connection cannot always establish.
 * @param {!Block} block.
* @param {!Block} other the block to be replaced
  */
ezP.DelegateSvg.Expr.prototype.canReplaceBlock = function (block, other) {
  if (other) {
    var c8n = other.outputConnection
    if (!c8n) {
      return true
    }
    c8n = c8n.targetConnection
    if (!c8n || c8n.checkType_(block.outputConnection)) {
      // the parent block has an output connection that can connect to the block's one
      return true
    }
  }
  return false
}

/**
 * Remove and bypass the other block.
 * If the parent's output connection is connected,
 * connects the block's output connection to it.
 * The connection cannot always establish.
 * @param {!Block} block.
 */
ezP.DelegateSvg.Expr.prototype.replaceBlock = function (block, other) {
  if (other) {
    Blockly.Events.setGroup(true)
    console.log('**** replaceBlock', block, other)
    var c8n = other.outputConnection
    var its_xy = other.getRelativeToSurfaceXY();
    var my_xy = block.getRelativeToSurfaceXY();
    block.outputConnection.disconnect()
    if (c8n && (c8n = c8n.targetConnection) && c8n.checkType_(block.outputConnection)) {
      // the other block has an output connection that can connect to the block's one
      var source = c8n.sourceBlock_
      var selected = source.ezp.hasSelect(source)
      // next operations may unselect the block
      var old = source.ezp.consolidating_
      c8n.connect(block.outputConnection)
      source.ezp.consolidating_ = old
      if (selected) {
        source.select()
      }
    } else {
      block.moveBy(its_xy.x-my_xy.x, its_xy.y-my_xy.y) 
    }
    other.dispose(true)   
    Blockly.Events.setGroup(false)
  }
}

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Expr.superClass_.willRender_.call(this, block)
  var field = this.uiModel.fields.await
  if (field) {
    field.setVisible(this.await_)
  }
}

/**
 * Whether the block can have an 'await' prefix.
 * Only blocks that are top block or that are directy inside function definitions
 * are awaitable
 * @param {!Blockly.Block} block The block owning the receiver.
 * @return yes or no
 */
ezP.DelegateSvg.Expr.prototype.awaitable = function (block) {
  if (!this.uiModel.fields.await) {
    return false
  }
  var parent = block.getParent()
  if (!parent) {
    return true
  }
  do {
    if (parent.type === ezP.T3.Stmt.funcdef_part) {
      return !!parent.ezp.async_
    }
  } while((parent = parent.getParent()))
  return false
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var yorn = ezP.DelegateSvg.Expr.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  var field = this.uiModel.fields.await
  if (this.await_ || this.awaitable && this.awaitable(block)) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('await', 'ezp-code-reserved'),
      goog.dom.createTextNode(' '+ezP.Msg.AT_THE_LEFT),
    )
    if (this.await_) {
      mgr.shouldSeparateRemove()
      mgr.addRemoveChild(new ezP.MenuItem(content, function() {
        block.ezp.setAwaited(block, false)
      }))
    } else {
      mgr.shouldSeparateInsert()
      mgr.addInsertChild(new ezP.MenuItem(content, function() {
        block.ezp.setAwaited(block, true)
      }))
    }
  }
  return yorn
}

/**
 * Can insert a block above?
 * If the block's output connection is connected,
 * can connect the parent's output to it?
 * The connection cannot always establish.
 * @param {!Block} block.
 * @param {string} prototypeName.
 * @param {string} parentInputName, which parent's connection to use
 */
ezP.DelegateSvg.Expr.prototype.canInsertParent = function(block, prototypeName, subtype, parentInputName) {
  var can = false
  var eventDisabler = ezP.Events.Disabler()
  var B = block.workspace.newBlock(prototypeName)
  B.ezp.setSubtype(B, subtype)
  var input = B.getInput(parentInputName)
  goog.asserts.assert(input, 'No input named '+parentInputName)
  var c8n = input.connection
  goog.asserts.assert(c8n, 'Unexpected dummy input '+parentInputName)
  if (block.outputConnection && c8n.checkType_(block.outputConnection)) {
    var targetC8n = block.outputConnection.targetConnection
    can = !targetC8n || targetC8n.checkType_(B.outputConnection)
  }
  B.dispose()
  eventDisabler.stop()
  return can
}

/**
 * Insert a parent.
 * If the block's output connection is connected,
 * connects the parent's output to it.
 * The connection cannot always establish.
 * The holes are filled when fill_holes is true.
 * @param {!Block} block.
 * @param {string} prototypeName.
 * @param {string} parentInputName, which parent's connection to use
 * @param {boolean} fill_holes whether holes should be filled
 * @return the created block
 */
ezP.DelegateSvg.Expr.prototype.insertParent = function(block, parentPrototypeName, subtype, parentInputName, fill_holes) {
//  console.log('insertParent', block, parentPrototypeName, subtype, parentInputName)
  var eventDisabler = ezP.Events.Disabler()
  var parentBlock = ezP.DelegateSvg.newBlockComplete(block.workspace, parentPrototypeName)
  parentBlock.ezp.setSubtype(parentBlock, subtype)
  eventDisabler.stop()
  console.log('block created of type', parentPrototypeName)
  if (parentInputName) {
    var parentInput = parentBlock.getInput(parentInputName)
    goog.asserts.assert(parentInput, 'No input named '+parentInputName)
    parentInputC8n = parentInput.connection
    goog.asserts.assert(parentInputC8n, 'Unexpected dummy input '+parentInputName)
  } else if ((parentInput = parentBlock.getInput(ezP.Key.LIST))) {
    var list = parentInput.connection.targetBlock()
    goog.asserts.assert(list, 'Missing list block inside '+block.type)
    // the list has many potential inputs,
    // none of them is actually connected because this is very fresh
    // get the middle input.
    parentInput = list.getInput(ezP.Do.Name.middle_name)
    parentInputC8n = parentInput.connection
    goog.asserts.assert(parentInputC8n, 'Unexpected dummy input '+parentInputName)
  } else {
    // find the first connection that can accept block
    var findC8n = function(B) {
      var foundC8n, target
      const e8r = B.ezp.inputEnumerator(B)
      while (e8r.next()) {
        var c8n = e8r.here.connection
        if (c8n) {
          var candidate
          if (c8n.checkType_(block.outputConnection)) {
            candidate = c8n
          } else if ((target = c8n.targetBlock())) {
            candidate = findC8n(target)
          }
          if (candidate) {
            if (candidate.ezp.name === parentInputName) {
              foundC8n = candidate
              break
            }
            if (!foundC8n) {
              foundC8n = candidate
            }
          }
        }
      }
      return foundC8n
    }
    var parentInputC8n = findC8n(parentBlock)
  }
  // Next connections should be connected
  var outputC8n = block.outputConnection
  if (parentInputC8n && parentInputC8n.checkType_(outputC8n)) {
    Blockly.Events.setGroup(true)
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockCreate(parentBlock))
    }
    var targetC8n = parentInputC8n.targetConnection
    if (targetC8n/* && targetC8n.isConnected()*/) {
      console.log('input already connected, disconnect and dispose target')
      var B = targetC8n.sourceBlock_
      targetC8n.disconnect()
      B.dispose(true)
      B = undefined
      targetC8n = undefined
    }
    var targetC8n = outputC8n.targetConnection
    var bumper
    if (targetC8n) {
      targetC8n.disconnect()
      if (parentBlock.outputConnection && targetC8n.checkType_(parentBlock.outputConnection)) {
        targetC8n.connect(parentBlock.outputConnection)
      } else {
        bumper = targetC8n.sourceBlock_
        var its_xy = bumper.getRelativeToSurfaceXY();
        var my_xy = parentBlock.getRelativeToSurfaceXY();
        parentBlock.moveBy(its_xy.x-my_xy.x, its_xy.y-my_xy.y)
      }
      targetC8n = undefined
    } else {
      var its_xy = block.getRelativeToSurfaceXY();
      var my_xy = parentBlock.getRelativeToSurfaceXY();
      parentBlock.moveBy(its_xy.x-my_xy.x, its_xy.y-my_xy.y)    
    }
    parentInputC8n.connect(outputC8n)
    if (fill_holes) {
      var holes = ezP.HoleFiller.getDeepHoles(parentBlock)
      ezP.HoleFiller.fillDeepHoles(parentBlock.workspace, holes)
    }
    parentBlock.render()
    if (bumper) {
      bumper.bumpNeighbours_()
    }  
    Blockly.Events.setGroup(false)
  } else {
    parentBlock.dispose(true)
    parentBlock = undefined
  }
  return parentBlock
}

/**
 * Convert the block to python code.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @return some python code
 */
ezP.DelegateSvg.Expr.prototype.toPython = function (block, is_deep) {
  return this.toPythonExpression(block)
}

/**
 * Class for a DelegateSvg, proper_slice block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('proper_slice', {
  inputs: {
    m_1: {
      key: ezP.Key.LOWER_BOUND,
      check: ezP.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'lower',
      end: ':',
    },
    m_2: {
      key: ezP.Key.UPPER_BOUND,
      check: ezP.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'upper',
    },
    m_3: {
      start: ':',
      key: ezP.Key.STRIDE,
      check: ezP.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'stride',
    }
  },
})

/**
 * Class for a DelegateSvg, conditional_expression_concrete block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('conditional_expression_concrete', {
  inputs: {
    m_1: {
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.or_test,
      hole_value: 'name',
    },
    m_2: {
      label: 'if',
      key: ezP.Key.IF,
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.or_test,
      hole_value: 'condition',
    },
    m_3: {
      label: 'else',
      key: ezP.Key.ELSE,
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'alternate',
    }
  },
})

/**
 * Class for a DelegateSvg, '*...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('or_expr_star', {
  inputs: {
    m_1: {
      key: ezP.Key.EXPRESSION,
      label: '*',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.or_expr,
      hole_value: 'name',
    }
  },
})

/**
 * Class for a DelegateSvg, '**...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('or_expr_star_star', {
  inputs: {
    m_1: {
      key: ezP.Key.EXPRESSION,
      label: '**',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.or_expr,
      hole_value: 'name',
    }
  },
})

/**
* Class for a DelegateSvg, not_test_concrete.
* This is not an Operator subclass because 'not' is a reserved word.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Manager.makeSubclass('not_test_concrete', {
  inputs: {
    m_1: {
      key: ezP.Key.EXPRESSION,
      label: 'not',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.not_test,
      hole_value: 'name',
    }
  },
})

goog.provide('ezP.DelegateSvg.Expr.numberliteral')

/**
* Class for a DelegateSvg, number: integer, floatnumber or imagnumber.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Literal = function (prototypeName) {
  ezP.DelegateSvg.Literal.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Literal, ezP.DelegateSvg.Expr)

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Literal.prototype.initBlock = function (block) {
  ezP.DelegateSvg.Literal.superClass_.initBlock.call(this, block)
  block.ezp.setupType(block)
}

/**
 * Set the [python ]type of the delegate according to the type of the block.
 * @param {!Blockly.Block} block to be initialized..
 * @constructor
 */
ezP.DelegateSvg.Literal.prototype.setupType = function (block) {
  ezP.DelegateSvg.Literal.superClass_.setupType.call(this, block)
  this.xmlType_ = ezP.T3.Expr.literal
}

/**
 * The xml type of this block, as it should appear in the saved data.
 * Numbers have no xml type.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.DelegateSvg.Literal.prototype.xmlType = function (block) {
  return null
}

/**
* Class for a DelegateSvg, number: integer, floatnumber or imagnumber.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Manager.makeSubclass('numberliteral', {
  inputs: {
    m_1: {
      number: '0',
    }
  },
  output: {
    check: ezP.T3.Expr.integer,
  }
}, ezP.DelegateSvg.Literal)

ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.numberliteral, ezP.DelegateSvg.Expr.numberliteral)
ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.integer, ezP.DelegateSvg.Expr.numberliteral)
ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.floatnumber, ezP.DelegateSvg.Expr.numberliteral)
ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.imagnumber, ezP.DelegateSvg.Expr.numberliteral)

/**
 * Set the [python ]type of the delegate according to the type of the block.
 * @param {!Blockly.Block} block to be initialized..
 * @constructor
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.setupType = function (block) {
  this.consolidateType_(block)
  ezP.DelegateSvg.Expr.numberliteral.superClass_.setupType.call(this, block)
}

/**
 * The block may change type depending on.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.consolidateType_ = function (block) {
  if (block.outputConnection) { // this is called once too early
    var value = block.ezp.uiModel.m_1.fields.number.getValue()
    if (XRegExp.test(value, ezP.XRE.integer) &&
    block.type !== ezP.T3.Expr.integer) {
      block.type = ezP.T3.Expr.integer
    } else if (XRegExp.test(value, ezP.XRE.floatnumber) &&
    block.type !== ezP.T3.Expr.floatnumber) {
      block.type = ezP.T3.Expr.floatnumber
    } else if (XRegExp.test(value, ezP.XRE.imagnumber) &&
    block.type !== ezP.T3.Expr.imagnumber) {
      block.type = ezP.T3.Expr.imagnumber
    }
    block.outputConnection.setCheck([block.type])
  }
}

/**
 * Get the subtype of the block.
 * The default implementation does nothing.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is return, when defined or not null.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.getSubtype = function (block) {
  return block.ezp.uiModel.m_1.fields.number.getValue()
}

/**
 * Set the subtype of the block.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is expected.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.setSubtype = function (block, subtype) {
  if (XRegExp.test(subtype, ezP.XRE.integer)) {
    block.ezp.uiModel.m_1.fields.number.setValue(subtype)
    if (block.type !== ezP.T3.Expr.integer) {
      block.type = ezP.T3.Expr.integer
      block.ezp.setupType(block)
    }
    return true
  } else if (XRegExp.test(subtype, ezP.XRE.floatnumber)) {
    block.ezp.uiModel.m_1.fields.number.setValue(subtype)
    if (block.type !== ezP.T3.Expr.floatnumber) {
      block.type = ezP.T3.Expr.floatnumber
      block.ezp.setupType(block)
    }
    return true
  } else if (XRegExp.test(subtype, ezP.XRE.imagnumber)) {
    block.ezp.uiModel.m_1.fields.number.setValue(subtype)
    if (block.type !== ezP.T3.Expr.imagnumber) {
      block.type = ezP.T3.Expr.imagnumber
      block.ezp.setupType(block)
    }
    return true
  }
  return false
}

/**
 * Set the type dynamically from the content of some field.
 * @param {!Blockly.Block} block the owner of the receiver
 * @param {!string} name the name of the field that did change
 * @param {!string} oldValue the value before the change
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.fieldValueDidChange = function(block, name, oldValue) {
  var text = block.getField(name).getText()
  if (XRegExp.test(text, ezP.XRE.integer) &&
  block.type !== ezP.T3.Expr.integer) {
    block.type = ezP.T3.Expr.integer
    block.ezp.setupType(block)
  } else if (XRegExp.test(text, ezP.XRE.floatnumber) &&
  block.type !== ezP.T3.Expr.floatnumber) {
    block.type = ezP.T3.Expr.floatnumber
    block.ezp.setupType(block)
  } else if (XRegExp.test(text, ezP.XRE.imagnumber) &&
  block.type !== ezP.T3.Expr.imagnumber) {
    block.type = ezP.T3.Expr.imagnumber
    block.ezp.setupType(block)
  }
}

goog.provide('ezP.DelegateSvg.Expr.shortliteral')

/**
* Class for a DelegateSvg, string litteral.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Manager.makeSubclass('shortliteral', {
  inputs: {
    m_1: {
      key: ezP.Key.PREFIX,
      label: "",
      css_class: 'ezp-code-reserved',
    },
    m_3: {
      start: "'",
      string: '',
      end: "'",
      css_class: 'ezp-code-reserved',
    },
  },
  output: {
    check: ezP.T3.Expr.shortstringliteral,
  }
}, ezP.DelegateSvg.Literal)

ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.shortstringliteral, ezP.DelegateSvg.Expr.shortliteral)
ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.shortbytesliteral, ezP.DelegateSvg.Expr.shortliteral)

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.initBlock = function (block) {
  block.ezp.setupType(block)
  ezP.DelegateSvg.Expr.shortliteral.superClass_.initBlock.call(this, block)
  if (block.type === ezP.T3.Expr.shortbytesliteral) {
    var field = this.uiModel.m_1.fields.label
    var prefix = field.getValue()
    if (prefix.toLowerCase().indexOf('b')<0) {
      field.setValue(prefix + 'b')
    }
  }
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Literal.literalPopulateContextMenuFirst_ = function (block, mgr) {
  var start = this.uiModel.m_3.fields.start
  var end = this.uiModel.m_3.fields.end
  var code = this.uiModel.m_3.fields.string
  var can_b = !!XRegExp.exec(code.getValue(), ezP.XRE.bytes)
  var single = start.getText() === "'"
  var menuItem = new ezP.MenuItem(
    ezP.Do.createSPAN(single? ezP.Msg.USE_DOUBLE_QUOTES: ezP.Msg.USE_SINGLE_QUOTE, 'ezp-code'), function() {
      Blockly.Events.setGroup(true)
      var oldValue = start.getValue()
      var newValue = single? '"': "'"
      start.setValue(newValue)
      end.setValue(newValue)
      Blockly.Events.setGroup(false)
    })
  mgr.addChild(menuItem, true)
  mgr.separate()
  var prefix = this.uiModel.m_1.fields.label
  var oldValue = prefix.getValue()
  var insert = function (newValue) {
    switch(oldValue) {
      case 'u': case 'U': return true
      case 'r': case 'R':
      if (newValue === 'f') newValue = 'rf'
      else if (newValue === 'b') newValue = 'rb'
      else return
      break
      case 'f': case 'F':
      if (newValue !== 'r') return true
      newValue = 'rf'
      break
      case 'b': case 'B':
      if (newValue !== 'r') return true
      newValue = 'rb'
      break
    }
    prefix.setValue(newValue)
  }
  var remove = function(key) {
    var newValue = ''
    switch(oldValue) {
      case 'u': case 'U':
      break
      case 'r': case 'R':
      if (key !== 'r') return true
      break
      case 'f': case 'F':
      if (key !== 'f') return true
      break
      case 'b': case 'B':
      if (key !== 'b') return true
      break
      default:
      if (key === 'f' || key === 'b') newValue = 'r'
      else if (['rf', 'fr',].indexOf(oldValue.toLowerCase())<0) newValue = 'b'
      else newValue = 'f'
    }
    prefix.setValue(newValue)
    return true
  }
  var item = function(msg, action) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN(msg, 'ezp-code'),
      goog.dom.createTextNode(' '+ezP.Msg.AT_THE_LEFT),
    )
    return new ezP.MenuItem(content, function() {
      action(msg)
    })
  }
  if (!oldValue.length) {
    // mgr.addInsertChild(item('u', insert))
    mgr.addInsertChild(item('r', insert))
    mgr.addInsertChild(item('f', insert))
    if (can_b) {
      mgr.addInsertChild(item('b', insert))
    }
  } else if (oldValue === 'u') {
    mgr.addRemoveChild(item('u', remove))
  } else if (oldValue === 'r') {
    mgr.addInsertChild(item('f', insert))
    if (can_b) {
      mgr.addInsertChild(item('b', insert))
    }
    mgr.addRemoveChild(item('r', remove))
  } else if (oldValue === 'f') {
    mgr.addInsertChild(item('r', insert))
    mgr.addRemoveChild(item('f', remove))
  } else if (oldValue === 'b') {
    mgr.addInsertChild(item('r', insert))
    mgr.addRemoveChild(item('b', remove))
  } else {
    mgr.addRemoveChild(item('r', remove))
    if (['rf', 'fr',].indexOf(oldValue.toLowerCase())<0) {
      mgr.addRemoveChild(item('b', remove))
    } else {
      mgr.addRemoveChild(item('f', remove))
    }
  }
  mgr.shouldSeparateInsert()
  return true
}
ezP.DelegateSvg.Expr.shortliteral.prototype.populateContextMenuFirst_ = function (block, mgr) {
  ezP.DelegateSvg.Literal.literalPopulateContextMenuFirst_.call(this, block, mgr)
  ezP.DelegateSvg.Expr.shortliteral.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

/**
 * On end editing.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!Blockly.Field} field The field in editing mode.
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.startEditingField = function (block, field) {
  this.uiModel.m_3.fields.end.setVisible(false)
}

/**
 * On end editing.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!Blockly.Field} field The field in editing mode.
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.endEditingField = function (block, field) {
  this.uiModel.m_3.fields.end.setVisible(true)
}

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Expr.shortliteral.superClass_.willRender_.call(this, block)
  var field = this.uiModel.m_1.fields.label
  field.setVisible(field.getValue().length)
}

/**
 * Set the type dynamically from the content of some field.
 * @param {!Blockly.Block} block the owner of the receiver
 * @param {!string} name the name of the field that did change
 * @param {!string} oldValue the value before the change
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.fieldValueDidChange = function(block, name, oldValue) {
  var value = block.getField(name).getText().toLowerCase()
  if (value === 'b' || value.length !==1 && ['', 'rf', 'fr'].indexOf(value)<0) {
    block.type = ezP.T3.Expr.shortbytesliteral
  } else {
    block.type = ezP.T3.Expr.shortstringliteral
  }
  block.ezp.setupType(block)
}

/**
 * Get the subtype of the block.
 * The default implementation does nothing.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is return, when defined or not null.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.getSubtype = function (block) {
  return block.ezp.toPythonExpression(block)
}

/**
 * Set the subtype of the block.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is expected.
 * Undo support ?
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.setSubtype = function (block, subtype) {
  var start = this.uiModel.m_3.fields.start
  var end = this.uiModel.m_3.fields.end
  var code = this.uiModel.m_3.fields.string
  var prefix = this.uiModel.m_1.fields.label
  var F = function(re, type) {
    var m = XRegExp.exec(subtype, re)
    if (m) {
      prefix.setValue(m.prefix||'')
      start.setValue(m.delimiter||"'")
      end.setValue(m.delimiter||"'")
      code.setValue(m.content||'')
      block.type = type
      block.ezp.setupType(block)
      return true  
    }
    return false
  }
  return F(ezP.XRE.shortstringliteral, ezP.T3.Expr.shortstringliteral) ||
  F(ezP.XRE.shortbytesliteral, ezP.T3.Expr.shortbytesliteral)
}

/**
* Class for a DelegateSvg, builtin object.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Manager.makeSubclass('builtin_object', {
  values: ['True', 'False', 'None', 'Ellipsis', '...', 'NotImplemented'],
  inputs: {
    m_1: {
      key: ezP.Key.VALUE,
      label: 'True',
      css_class: 'ezp-code-reserved',
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.builtin_object.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var field = this.uiModel.m_1.fields.label
  var builtin = field.getValue()
  var value, i = 0, values = this.getModel().values
  while ((value = values[i++])) {
    var menuItem = new ezP.MenuItem(
      ezP.Do.createSPAN(value, 'ezp-code-reserved'), function() {
        field.setValue(value)
      })
    menuItem.setEnabled(builtin !== value)
    mgr.addChild(menuItem, true)
  }
  mgr.shouldSeparateInsert()
  ezP.DelegateSvg.Expr.builtin_object.superClass_.populateContextMenuFirst_.call(this, block, mgr)
  return true
}

/**
 * Get the subtype of the block.
 * The operator.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return None
 */
ezP.DelegateSvg.Expr.builtin_object.prototype.getValue = ezP.DelegateSvg.Expr.builtin_object.prototype.getSubtype = function (block) {
  return this.uiModel.m_1.fields.label.getValue()
}

/**
 * Set the subtype of the block.
 * The operator.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Expr.builtin_object.prototype.setValue = ezP.DelegateSvg.Expr.builtin_object.prototype.setSubtype = function (block, subtype) {
  this.uiModel.m_1.fields.label.setValue(subtype)
  return true
}

/**
* Class for a DelegateSvg, any object.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Manager.makeSubclass('any', {
  values: ['True', 'False', 'None', 'Ellipsis', '...', 'NotImplemented'],
  inputs: {
    m_1: {
      key: ezP.Key.CODE,
      code: '1+1',
    },
  },
  output: {
    check: null,
  },
})

/**
 * Get the subtype of the block.
 * The operator.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return None
 */
ezP.DelegateSvg.Expr.any.prototype.getValue = ezP.DelegateSvg.Expr.any.prototype.getSubtype = function (block) {
  return this.uiModel.m_1.fields.input.getValue()
}

/**
 * Set the subtype of the block.
 * The operator.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Expr.any.prototype.setValue = ezP.DelegateSvg.Expr.any.prototype.setSubtype = function (block, subtype) {
  this.uiModel.m_1.fields.input.setValue(subtype)
  return true
}

goog.provide('ezP.DelegateSvg.Expr.longliteral')

/**
* Class for a DelegateSvg, docstring (expression).
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Manager.makeSubclass('longliteral', {
  inputs: {
    m_1: {
      key: ezP.Key.PREFIX,
      label: "",
      css_class: 'ezp-code-reserved',
    },
    m_3: {
      start: "'''",
      string: '',
      end: "'''",
      css_class: 'ezp-code-reserved',
    },
  },
  output: {
    check: ezP.T3.Expr.longstringliteral,
  },
}, ezP.DelegateSvg.Literal)

ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.longstringliteral, ezP.DelegateSvg.Expr.longliteral)
ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.longbytesliteral, ezP.DelegateSvg.Expr.longliteral)

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.longliteral.prototype.populateContextMenuFirst_ = function (block, mgr) {
  ezP.DelegateSvg.Literal.literalPopulateContextMenuFirst_.call(this, block, mgr)
  ezP.DelegateSvg.Expr.longliteral.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

/**
 * On end editing.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!Blockly.Field} field The field in editing mode.
 */
ezP.DelegateSvg.Expr.longliteral.prototype.startEditingField = function (block, field) {
  this.uiModel.m_3.fields.end.setVisible(false)
}

/**
 * On end editing.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!Blockly.Field} field The field in editing mode.
 */
ezP.DelegateSvg.Expr.longliteral.prototype.endEditingField = function (block, field) {
  this.uiModel.m_3.fields.end.setVisible(true)
}

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.longliteral.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Expr.longliteral.superClass_.willRender_.call(this, block)
  var field = this.uiModel.m_1.fields.label
  field.setVisible(field.getValue().length)
}

/**
 * Set the type dynamically from the content of some field.
 * @param {!Blockly.Block} block the owner of the receiver
 * @param {!string} name the name of the field that did change
 * @param {!string} oldValue the value before the change
 */
ezP.DelegateSvg.Expr.longliteral.prototype.fieldValueDidChange = function(block, name, oldValue) {
  var value = block.getField(name).getText().toLowerCase()
  if (value === 'b' || value.length !==1 && ['', 'rf', 'fr'].indexOf(value)<0) {
    block.type = ezP.T3.Expr.longbytesliteral
  } else {
    block.type = ezP.T3.Expr.longstringliteral
  }
  block.ezp.setupType(block)
}

/**
 * Get the subtype of the block.
 * The default implementation does nothing.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is return, when defined or not null.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.Expr.longliteral.prototype.getSubtype = function (block) {
  return this.uiModel.m_3.fields.string.getValue()
}

/**
 * Set the subtype of the block.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is expected.
 * Undo support ?
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Expr.longliteral.prototype.setSubtype = function (block, subtype) {
  var start = this.uiModel.m_3.fields.start
  var end = this.uiModel.m_3.fields.end
  var code = this.uiModel.m_3.fields.string
  var prefix = this.uiModel.m_1.fields.label
  var F = function(re, type) {
    var m = XRegExp.exec(subtype, re)
    if (m) {
      prefix.setValue(m.prefix||'')
      start.setValue(m.delimiter||"'")
      end.setValue(m.delimiter||"'")
      code.setValue(m.content||'')
      block.type = type
      block.ezp.setupType(block)
      return true  
    }
    return false
  }
  return F(ezP.XRE.longstringliteral, ezP.T3.Expr.longstringliteral) ||
  F(ezP.XRE.longbytesliteral, ezP.T3.Expr.longbytesliteral)
}

/**
 * Get the value of the block.
 * Used for simple blocks, form and to dom.
 * Default implementation returns the subtype.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {?string} value
 */
ezP.DelegateSvg.Expr.longliteral.prototype.getValue = function (block) {
  return block.ezp.toPythonExpression(block)
}

/**
 * Set the value of the block.
 * Used for simple blocks, form and to dom.
 * Default implementation sets the subtype.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {?string} value
 */
ezP.DelegateSvg.Expr.longliteral.prototype.setValue = function (block, value) {
  var del = "'''", text = value
  if (value.length > 5) {
    del = value.substr(0, 3)
    if (del === '"""' || del === "'''") {
      text = value.substr(3, value.length-6)
    }
  }
  block.ezp.uiModel.m_3.fields.start.setValue(del)
  block.ezp.uiModel.m_3.fields.end.setValue(del)
  block.ezp.setSubtype(block, text)
}

ezP.DelegateSvg.Expr.T3s = [
  ezP.T3.Expr.proper_slice,
  ezP.T3.Expr.conditional_expression_concrete,
  ezP.T3.Expr.or_expr_star,
  ezP.T3.Expr.or_expr_star_star,
  ezP.T3.Expr.not_test_concrete,
  ezP.T3.Expr.shortstringliteral,
  ezP.T3.Expr.shortbytesliteral,
  ezP.T3.Expr.longstringliteral,
  ezP.T3.Expr.longbytesliteral,
  ezP.T3.Expr.numberliteral,
  ezP.T3.Expr.integer,
  ezP.T3.Expr.floatnumber,
  ezP.T3.Expr.imagnumber,
  ezP.T3.Expr.builtin_object,
  ezP.T3.Expr.any,
]
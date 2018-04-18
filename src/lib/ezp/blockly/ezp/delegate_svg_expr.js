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
    var grouper = new ezP.Events.Grouper()
    try {
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
    } finally {
      other.dispose(true)   
      grouper.stop()
    }
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
  var field = this.ui.fields.await
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
  if (!this.ui.fields.await) {
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
  var field = this.ui.fields.await
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
  var disabler = ezP.Events.Disabler()
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
  disabler.stop()
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
  var disabler = ezP.Events.Disabler()
  var parentBlock = ezP.DelegateSvg.newBlockComplete(block.workspace, parentPrototypeName)
  parentBlock.ezp.setSubtype(parentBlock, subtype)
  disabler.stop()
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
    var grouper = new ezP.Events.Grouper()
    try {
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
    } finally {
      grouper.stop()
    }
  } else {
    parentBlock.dispose(true)
    parentBlock = undefined
  }
  return parentBlock
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
    i_1: {
      key: ezP.Key.LOWER_BOUND,
      check: ezP.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'lower',
      end: ':',
    },
    i_2: {
      key: ezP.Key.UPPER_BOUND,
      check: ezP.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'upper',
    },
    i_3: {
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
    i_1: {
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.or_test,
      hole_value: 'name',
    },
    i_2: {
      label: 'if',
      key: ezP.Key.IF,
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.or_test,
      hole_value: 'condition',
    },
    i_3: {
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
    i_1: {
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
    i_1: {
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
    i_1: {
      key: ezP.Key.EXPRESSION,
      label: 'not',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.not_test,
      hole_value: 'name',
    }
  },
})

/**
* Class for a DelegateSvg, builtin object.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Manager.makeSubclass('builtin_object', {
  inputs: {
    values: ['True', 'False', 'None', 'Ellipsis', '...', 'NotImplemented'],
    i_1: {
      key: ezP.Key.VALUE,
      label: 'True',
      css_class: 'ezp-code-reserved',
    },
  },
})

/**
 * Initialize the value.
 * @param {!Blockly.Block} block to be initialized..
 */
ezP.DelegateSvg.Expr.builtin_object.prototype.initValue = function(block) {
  this.setValue(block, block.ezp.ui.i_1.fields.label.getValue(block))
}

/**
 * When the value did change.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldValue
 * @param {string} newValue
 */
ezP.DelegateSvg.Expr.builtin_object.prototype.didChangeValue = function(block, oldValue, newValue) {
  ezP.DelegateSvg.Expr.builtin_object.superClass_.didChangeValue.call(this, block, oldValue, newValue)
  block.ezp.ui.i_1.fields.label.setValue(newValue)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.builtin_object.prototype.populateContextMenuFirst_ = function (block, mgr) {
  mgr.populateProperties(block, 'value')
  mgr.shouldSeparateInsert()
  ezP.DelegateSvg.Expr.builtin_object.superClass_.populateContextMenuFirst_.call(this, block, mgr)
  return true
}

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Expr.builtin_object.prototype.getContent = function (block, op) {
  return ezP.Do.createSPAN(op, 'ezp-code-reserved')
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
    i_1: {
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
ezP.DelegateSvg.Expr.any.prototype.getValue = ezP.DelegateSvg.Expr.any.prototype.getSubtype

/**
 * Set the subtype of the block.
 * The operator.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Expr.any.prototype.setValue = ezP.DelegateSvg.Expr.any.prototype.setSubtype

/**
 * When the subtype has changed.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldSubtype
 * @param {string} newSubtype
 */
ezP.DelegateSvg.Expr.any.prototype.didChangeSubtype = function(block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Expr.any.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  block.ezp.ui.i_1.fields.code.setValue(newSubtype)
}

ezP.DelegateSvg.Expr.T3s = [
  ezP.T3.Expr.proper_slice,
  ezP.T3.Expr.conditional_expression_concrete,
  ezP.T3.Expr.or_expr_star,
  ezP.T3.Expr.or_expr_star_star,
  ezP.T3.Expr.not_test_concrete,
  ezP.T3.Expr.builtin_object,
  ezP.T3.Expr.any,
]
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
  this.outputModel_ = {}
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
 * Get the 'await' field.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.prototype.getFieldAwait = function (block) {
  var input = this.inputs.first
  return input? input.fieldAwait: undefined
}

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Expr.superClass_.willRender_.call(this, block)
  var field = this.getFieldAwait(block)
  if (field) {
    var text = field.getText()
    field.setVisible(text && text.length)
  }
}

/**
 * Records the prefix as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Expr.prototype.toDom = function (block, element) {
  ezP.DelegateSvg.Expr.superClass_.toDom.call(this, block, element)
  var field = this.getFieldAwait(block)
  if (field) {
    var attribute = field.getText()
    if (attribute && attribute.length>4) {
      element.setAttribute('await', 'true')
    }
  }
}

/**
 * Set the prefix from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Expr.prototype.fromDom = function (block, element) {
  ezP.DelegateSvg.Expr.superClass_.fromDom.call(this, block, element)
  var field = this.getFieldAwait(block)
  if (field) {
    var attribute = element.getAttribute('await')
    if (attribute && attribute.toLowerCase() === 'true') {
      field.setText('await ')
    }
  }
}

/**
 * Whether the block has an 'await' prefix.
 * @param {!Blockly.Block} block The block owning the receiver.
 * @return yes or no
 */
ezP.DelegateSvg.Expr.prototype.awaited = function (block) {
  var field = this.getFieldAwait(block)
  if (field) {
    var attribute = field.getText()
    if (attribute && attribute.length>4) {
      return true
    }
  }
  return false
}

/**
 * Whether the block can have an 'await' prefix.
 * Only blocks that are top block or that are directy inside function definitions
 * are awaitable
 * @param {!Blockly.Block} block The block owning the receiver.
 * @return yes or no
 */
ezP.DelegateSvg.Expr.prototype.awaitable = function (block) {
  var parent = block.getParent()
  if (!parent) {
    return true
  }
  do {
    if (parent.type === ezP.T3.Stmt.funcdef_part) {
      return parent.ezp.asynced(parent)
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
  var field = this.getFieldAwait(block)
  if (field && this.awaitable(block)) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('await', 'ezp-code-reserved'),
      goog.dom.createTextNode(' '+ezP.Msg.AT_THE_LEFT),
    )
    var old = field.getValue()
    if (old.length > 1) {
      mgr.shouldSeparateRemove()
      mgr.addRemoveChild(new ezP.MenuItem(content, function() {
        field.setValue('')
      }))
    } else {
      mgr.shouldSeparateInsert()
      mgr.addInsertChild(new ezP.MenuItem(content, function() {
        field.setValue('await ')
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
 * @param {string} aboveInputName, which parent's connection to use
 */
ezP.DelegateSvg.prototype.canInsertBlockAbove = function(block, prototypeName, subtype, aboveInputName) {
  var can = false
  Blockly.Events.disable()
  var B = block.workspace.newBlock(prototypeName)
  B.ezp.setSubtype(B, subtype)
  var input = B.getInput(aboveInputName)
  goog.asserts.assert(input, 'No input named '+aboveInputName)
  var c8n = input.connection
  goog.asserts.assert(c8n, 'Unexpected dummy input '+aboveInputName)
  if (block.outputConnection && c8n.checkType_(block.outputConnection)) {
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
 * The holes are filled when fill_holes is true.
 * @param {!Block} block.
 * @param {string} prototypeName.
 * @param {string} aboveInputName, which parent's connection to use
 * @param {boolean} fill_holes whether holes should be filled
 * @return the created block
 */
ezP.DelegateSvg.Expr.prototype.insertBlockAbove = function(block, abovePrototypeName, subtype, aboveInputName, fill_holes) {
//  console.log('insertBlockAbove', block, abovePrototypeName, subtype, aboveInputName)
  Blockly.Events.setGroup(true)
  var blockAbove = ezP.DelegateSvg.newBlockComplete(block.workspace, abovePrototypeName)
  blockAbove.ezp.setSubtype(blockAbove, subtype)
  console.log('block created of type', abovePrototypeName)
  if (aboveInputName) {
    var aboveInput = blockAbove.getInput(aboveInputName)
    goog.asserts.assert(aboveInput, 'No input named '+aboveInputName)
  } else if ((aboveInput = blockAbove.getInput(ezP.Key.LIST))) {
    var list = aboveInput.connection.targetBlock()
    goog.asserts.assert(list, 'Missing list block inside '+block.type)
    // the list has many potential inputs,
    // none of them is actually connected because this is very fresh
    // get the middle input.
    aboveInput = list.getInput(ezP.Do.Name.middle_name)
  } else {
    // find the first input that can accept block
    for (var i = 0; (aboveInput = blockAbove.inputList[i++]);) {
      var aboveInputC8n = aboveInput.connection
      if (aboveInputC8n) {
        if (!aboveInputC8n.check_ || aboveInputC8n.check_.indexOf(block.type)>=0) {
          break
        }
      }
    }
    if (!aboveInput) {
      blockAbove.dispose(true)
      return undefined
    }
  }
  // Next connections should be connected
  var outputC8n = block.outputConnection
  var aboveInputC8n = aboveInput.connection
  console.log('Should connect', block.type, 'to input', aboveInput.name, 'of type', abovePrototypeName)
  console.log('block check:', block.outputConnection.check_)
  console.log('above check:', aboveInputC8n.check_)
  goog.asserts.assert(aboveInputC8n, 'Unexpected dummy input '+aboveInputName)
  if (aboveInputC8n.checkType_(outputC8n)) {
    var targetC8n = aboveInputC8n.targetConnection
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
      if (targetC8n.checkType_(blockAbove.outputConnection)) {
        targetC8n.connect(blockAbove.outputConnection)
      } else {
        bumper = targetC8n.sourceBlock_
        var its_xy = bumper.getRelativeToSurfaceXY();
        var my_xy = blockAbove.getRelativeToSurfaceXY();
        blockAbove.moveBy(its_xy.x-my_xy.x, its_xy.y-my_xy.y)
      }
      targetC8n = undefined
    } else {
      var its_xy = block.getRelativeToSurfaceXY();
      var my_xy = blockAbove.getRelativeToSurfaceXY();
      blockAbove.moveBy(its_xy.x-my_xy.x, its_xy.y-my_xy.y)    
    }
    console.log('Will connect', block.type, 'to input', aboveInput.name, 'of type', abovePrototypeName)
    console.log('block check:', outputC8n.check_)
    console.log('above check:', aboveInputC8n.check_)
    aboveInputC8n.connect(outputC8n)
    if (fill_holes) {
      var holes = ezP.HoleFiller.getDeepHoles(blockAbove)
      ezP.HoleFiller.fillDeepHoles(blockAbove.workspace, holes)
    }
    blockAbove.render()
    if (bumper) {
      bumper.bumpNeighbours_()
    }  
  } else {
    blockAbove.dispose()
    blockAbove = undefined
  }
  Blockly.Events.setGroup(false)
  return blockAbove
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
ezP.DelegateSvg.Expr.proper_slice = function (prototypeName) {
  ezP.DelegateSvg.Expr.proper_slice.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.Expr.proper_slice
  this.inputModel_ = {
    first: {
      key: ezP.Key.LOWER_BOUND,
      check: ezP.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'lower',
      end: ':',
    },
    middle: {
      key: ezP.Key.UPPER_BOUND,
      check: ezP.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'upper',
    },
    last: {
      start: ':',
      key: ezP.Key.STRIDE,
      check: ezP.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'stride',
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr.proper_slice, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('proper_slice')

/**
 * Class for a DelegateSvg, conditional_expression_concrete block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.conditional_expression_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.conditional_expression_concrete.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.Expr.conditional_expression_concrete
  this.inputModel_ = {
    first: {
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.or_test,
      hole_value: 'name',
    },
    middle: {
      label: 'if',
      key: ezP.Key.IF,
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.or_test,
    },
    last: {
      label: 'else',
      key: ezP.Key.ELSE,
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'alternate',
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr.conditional_expression_concrete, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('conditional_expression_concrete')

/**
 * Class for a DelegateSvg, '*...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.or_expr_star = function (prototypeName) {
  ezP.DelegateSvg.Expr.or_expr_star.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.EXPRESSION,
    label: '*',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.or_expr
  }
  this.outputModel_.check = ezP.T3.Expr.or_expr_star
}
goog.inherits(ezP.DelegateSvg.Expr.or_expr_star, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('or_expr_star')

/**
 * Class for a DelegateSvg, '**...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.or_expr_star_star = function (prototypeName) {
  ezP.DelegateSvg.Expr.or_expr_star_star.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.EXPRESSION,
    label: '**',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.or_expr
  }
  this.outputModel_.check = ezP.T3.Expr.or_expr_star_star
}
goog.inherits(ezP.DelegateSvg.Expr.or_expr_star_star, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('or_expr_star_star')

/**
* Class for a DelegateSvg, await_expr.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.await_expr = function (prototypeName) {
  ezP.DelegateSvg.Expr.await_expr.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.EXPRESSION,
    label: 'await',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.primary
  }
  this.outputModel_.check = ezP.T3.Expr.await_expr
}
goog.inherits(ezP.DelegateSvg.Expr.await_expr, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('await_expr')

/**
* Class for a DelegateSvg, not_test_concrete.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.not_test_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.not_test_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.EXPRESSION,
    label: 'not',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.not_test
  }
  this.outputModel_.check = ezP.T3.Expr.not_test_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.not_test_concrete, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('not_test_concrete')

/**
* Class for a DelegateSvg, integer.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.integer = function (prototypeName) {
  ezP.DelegateSvg.Expr.integer.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    awaitable: true,
    number: '0',
  }
  this.outputModel_.check = ezP.T3.Expr.integer
}
goog.inherits(ezP.DelegateSvg.Expr.integer, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('integer')

/**
 * Get the subtype of the block.
 * The default implementation does nothing.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is return, when defined or not null.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.Expr.integer.prototype.getSubtype = function (block) {
  return block.ezp.inputs.first.fieldCodeNumber.getValue()
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
ezP.DelegateSvg.Expr.integer.prototype.setSubtype = function (block, subtype) {
  var type = ezP.Do.typeOfString(subtype)
  if (type === ezP.T3.Expr.integer) {
    block.ezp.inputs.first.fieldCodeNumber.setValue(subtype)
    return true  
  }
  return false
}

/**
* Class for a DelegateSvg, floatnumber.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.floatnumber = function (prototypeName) {
  ezP.DelegateSvg.Expr.floatnumber.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    awaitable: true,
    number: '0.',
  }
  this.outputModel_.check = ezP.T3.Expr.floatnumber
}
goog.inherits(ezP.DelegateSvg.Expr.floatnumber, ezP.DelegateSvg.Expr.integer)
ezP.DelegateSvg.Manager.register('floatnumber')

/**
 * Set the subtype of the block.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is expected.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Expr.floatnumber.prototype.setSubtype = function (block, subtype) {
  var type = ezP.Do.typeOfString(subtype)
  if (type === ezP.T3.Expr.floatnumber) {
    block.ezp.inputs.first.fieldCodeNumber.setValue(subtype)
    return true  
  }
  return false
}

/**
* Class for a DelegateSvg, imagnumber.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.imagnumber = function (prototypeName) {
  ezP.DelegateSvg.Expr.imagnumber.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    awaitable: true,
    key: ezP.Key.VALUE,
    check: ezP.T3.Expr.Check.number,
    end:'j'
  }
  this.outputModel_.check = ezP.T3.Expr.imagnumber
}
goog.inherits(ezP.DelegateSvg.Expr.imagnumber, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('imagnumber')

/**
* Class for a DelegateSvg, string litteral.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.stringliteral = function (prototypeName) {
  ezP.DelegateSvg.Expr.stringliteral.superClass_.constructor.call(this, prototypeName)
  this.inputModel_ = {
    first: {
      awaitable: true,
      key: ezP.Key.PREFIX,
      label: "",
      css_class: 'ezp-code-reserved',
    },
    last: {
      start: "'",
      string: '',
      end: "'",
      css_class: 'ezp-code-reserved',
    },
  }
  this.outputModel_.check = ezP.T3.Expr.stringliteral
}
goog.inherits(ezP.DelegateSvg.Expr.stringliteral, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('stringliteral')
ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.bytesliteral, ezP.DelegateSvg.Expr.stringliteral)

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.stringliteral.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var fieldStart = this.inputs.last.fieldLabelStart
  var fieldEnd = this.inputs.last.fieldLabelEnd
  var single = fieldStart.getText() === "'"
  var menuItem = new ezP.MenuItem(
    ezP.Do.createSPAN(single? ezP.Msg.USE_DOUBLE_QUOTES: ezP.Msg.USE_SINGLE_QUOTE, 'ezp-code'), function() {
      Blockly.Events.setGroup(true)
      var oldValue = fieldStart.getValue()
      var newValue = single? '"': "'"
      fieldStart.setValue(newValue)
      fieldEnd.setValue(newValue)
      Blockly.Events.setGroup(false)
    })
  mgr.addChild(menuItem, true)
  mgr.separate()
  var fieldPrefix = this.inputs.first.fieldLabel
  var oldValue = fieldPrefix.getValue()
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
    fieldPrefix.setValue(newValue)
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
    fieldPrefix.setValue(newValue)
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
    mgr.addInsertChild(item('u', insert))
    mgr.addInsertChild(item('r', insert))
    mgr.addInsertChild(item('f', insert))
    mgr.addInsertChild(item('b', insert))
  } else if (oldValue === 'u') {
    mgr.addRemoveChild(item('u', remove))
  } else if (oldValue === 'r') {
    mgr.addInsertChild(item('f', insert))
    mgr.addInsertChild(item('b', insert))
    mgr.addRemoveChild(item('r', remove))
  } else if (oldValue === 'f') {
    mgr.addInsertChild(item('r', insert))
    mgr.addRemoveChild(item('f', remove))
  } else if (oldValue === 'b') {
    mgr.addInsertChild(item('r', insert))
    mgr.addRemoveChild(item('b', remove))
  } else {
    mgr.addRemoveChild(item('r', remove))
    if (['rf', 'fr',].indexOf(prefix.toLowerCase())<0) {
      mgr.addRemoveChild(item('b', remove))
    } else {
      mgr.addRemoveChild(item('f', remove))
    }
  }
  mgr.shouldSeparateInsert()
  ezP.DelegateSvg.Expr.stringliteral.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

/**
 * On end editing.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!Blockly.Field} field The field in editing mode.
 */
ezP.DelegateSvg.Expr.stringliteral.prototype.startEditingField = function (block, field) {
  var nameEnd = 'last.'+ezP.Const.Field.END
  block.getField(nameEnd).setVisible(false)
}

/**
 * On end editing.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!Blockly.Field} field The field in editing mode.
 */
ezP.DelegateSvg.Expr.stringliteral.prototype.endEditingField = function (block, field) {
  var nameEnd = 'last.'+ezP.Const.Field.END
  block.getField(nameEnd).setVisible(true)
}

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.stringliteral.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Expr.stringliteral.superClass_.willRender_.call(this, block)
  var field = this.inputs.first.fieldLabel
  field.setVisible(field.getValue().length)
}

/**
 * Records the prefix as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Expr.stringliteral.prototype.toDom = function (block, element) {
  ezP.DelegateSvg.Expr.stringliteral.superClass_.toDom.call(this, block, element)
  element.setAttribute('prefix', this.inputs.first.fieldLabel.getText())
}

/**
 * Set the prefix from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Expr.stringliteral.prototype.fromDom = function (block, element) {
  ezP.DelegateSvg.Expr.stringliteral.superClass_.fromDom.call(this, block, element)
  var attribute = element.getAttribute('prefix')
  this.inputs.first.fieldLabel.setText(attribute)
}

/**
 * Set the operator from the attribute.
 * @param {!Blockly.Block} block the owner of the receiver
 * @param {!string} name the name of the field that did change
 * @param {!string} oldValue the value before the change
 */
ezP.DelegateSvg.Expr.stringliteral.prototype.fieldValueDidChange = function(block, name, oldValue) {
  var value = block.getField(name).getText().toLowerCase()
  if (value === 'b' || value.length !==1 && ['', 'rf', 'fr'].indexOf(value)<0) {
    block.type = ezP.T3.Expr.bytesliteral
  } else {
    block.type = ezP.T3.Expr.stringliteral
  }
  block.ezp.setupType(block)
}

/**
* Class for a DelegateSvg, builtin object.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.builtin_object = function (prototypeName) {
  ezP.DelegateSvg.Expr.builtin_object.superClass_.constructor.call(this, prototypeName)
  this.values = ['True', 'False', 'None', 'Ellipsis', '...', 'NotImplemented']
  this.inputModel_.first = {
    awaitable: true,
    key: ezP.Key.VALUE,
    label: this.values[0],
    css_class: 'ezp-code-reserved',
  }
  this.outputModel_.check = ezP.T3.Expr.builtin_object
}
goog.inherits(ezP.DelegateSvg.Expr.builtin_object, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('builtin_object')

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.builtin_object.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var field = this.inputs.first.fieldLabel
  var builtin = field.getValue()
  var value, i = 0
  while ((value = this.values[i++])) {
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
 * Records the operator as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Expr.builtin_object.prototype.toDom = function (block, element) {
  ezP.DelegateSvg.Expr.builtin_object.superClass_.toDom.call(this, block, element)
  element.setAttribute('value', this.inputs.first.fieldLabel.getValue())
}

/**
 * Set the operator from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Expr.builtin_object.prototype.fromDom = function (block, element) {
  ezP.DelegateSvg.Expr.builtin_object.superClass_.fromDom.call(this, block, element)
  var value = element.getAttribute('value')
  this.inputs.first.fieldLabel.setValue(value)
}

/**
 * Get the subtype of the block.
 * The operator.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return None
 */
ezP.DelegateSvg.Expr.builtin_object.prototype.getSubtype = function (block) {
  return this.inputs.first.fieldLabel.getValue()
}

/**
 * Set the subtype of the block.
 * The operator.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Expr.builtin_object.prototype.setSubtype = function (block, subtype) {
  this.inputs.first.fieldLabel.setValue(subtype)
  return true
}

/**
* Class for a DelegateSvg, any object.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.any = function (prototypeName) {
  ezP.DelegateSvg.Expr.any.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    awaitable: true,
    key: ezP.Const.Field.CODE,
    code: '1+1',
  }
  this.outputModel_.check = null
}
goog.inherits(ezP.DelegateSvg.Expr.any, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('any')

/**
 * Records the operator as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Expr.any.prototype.toDom = function (block, element) {
  ezP.DelegateSvg.Expr.any.superClass_.toDom.call(this, block, element)
  element.setAttribute('code', this.inputs.first.fieldCodeInput.getText())
}

/**
 * Set the operator from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Expr.any.prototype.fromDom = function (block, element) {
  ezP.DelegateSvg.Expr.any.superClass_.fromDom.call(this, block, element)
  var value = element.getAttribute('code')
  this.inputs.first.fieldCodeInput.setText(value)
}

/**
 * Class for a DelegateSvg, input block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.input = function (prototypeName) {
  ezP.DelegateSvg.Expr.input.superClass_.constructor.call(this, prototypeName)
  this.inputModel_ = {
    first: {
      dummy: 'input',
      css_class: 'ezp-code-builtin',
    },
    last: {
      start: '(',
      key: ezP.Key.ARGUMENT,
      check: ezP.T3.Expr.Check.argument_any,
      optional: true,
      end: ')',
    }
  }
  this.outputModel_.check = ezP.T3.Expr.call_expr
}
goog.inherits(ezP.DelegateSvg.Expr.input, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('input')

/**
 * Class for a DelegateSvg, range block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.range = function (prototypeName) {
  ezP.DelegateSvg.Expr.input.superClass_.constructor.call(this, prototypeName)
  this.inputModel_ = {
    first: {
      dummy: 'range',
      css_class: 'ezp-code-builtin',
    },
    last: {
      start: '(',
      key: ezP.Key.ARGUMENT,
      wrap: ezP.T3.Expr.proper_slice,
      end: ')',
    }
  }
  this.outputModel_.check = ezP.T3.Expr.call_expr
}
goog.inherits(ezP.DelegateSvg.Expr.range, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('range')

/**
* Class for a DelegateSvg, docstring (expression).
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.docstring = function (prototypeName) {
  ezP.DelegateSvg.Expr.docstring.superClass_.constructor.call(this, prototypeName)
  this.inputModel_ = {
    first: {
      key: ezP.Key.PREFIX,
      label: "",
      css_class: 'ezp-code-reserved',
    },
    last: {
      start: "'''",
      string: '',
      end: "'''",
      css_class: 'ezp-code-reserved',
    },
  }
  this.outputModel_.check = ezP.T3.Expr.docstring
}
goog.inherits(ezP.DelegateSvg.Expr.docstring, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('docstring')
ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.bytesliteral, ezP.DelegateSvg.Expr.docstring)

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.docstring.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var fieldStart = this.inputs.last.fieldLabelStart
  var fieldEnd = this.inputs.last.fieldLabelEnd
  var single = fieldStart.getText() === "'''"
  var menuItem = new ezP.MenuItem(
    ezP.Do.createSPAN(single? '"""..."""': "'''...'''", 'ezp-code'), function() {
      Blockly.Events.setGroup(true)
      var oldValue = fieldStart.getValue()
      var newValue = single? '"""': "'''"
      fieldStart.setValue(newValue)
      fieldEnd.setValue(newValue)
      Blockly.Events.setGroup(false)
    })
  mgr.addChild(menuItem, true)
  mgr.shouldSeparateInsert()
  ezP.DelegateSvg.Expr.docstring.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

/**
 * On end editing.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!Blockly.Field} field The field in editing mode.
 */
ezP.DelegateSvg.Expr.docstring.prototype.startEditingField = function (block, field) {
  var nameEnd = 'last.'+ezP.Const.Field.END
  block.getField(nameEnd).setVisible(false)
}

/**
 * On end editing.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!Blockly.Field} field The field in editing mode.
 */
ezP.DelegateSvg.Expr.docstring.prototype.endEditingField = function (block, field) {
  var nameEnd = 'last.'+ezP.Const.Field.END
  block.getField(nameEnd).setVisible(true)
}

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.docstring.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Expr.docstring.superClass_.willRender_.call(this, block)
  var field = this.inputs.first.fieldLabel
  field.setVisible(field.getValue().length)
}


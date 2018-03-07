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
    ezP.DelegateSvg.Expr.prototype.highlightedPathDef_ =
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
      source.ezp.consolidating_ = true
      c8n.disconnect()
      c8n.connect(block.outputConnection)
      source.ezp.consolidating_ = old
      if (selected) {
        source.select()
      }
    } else {
      block.moveBy(its_xy.x-my_xy.x, its_xy.y-my_xy.y)    
    }
    other.dispose()
    Blockly.Events.setGroup(false)
  }
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
    },
    middle: {
      label: ':',
      key: ezP.Key.UPPER_BOUND,
      check: ezP.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'upper',
    },
    last: {
      label: ':',
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
* Class for a DelegateSvg, number litteral.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.numberliteral_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.numberliteral_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    number: '0',
  }
  this.outputModel_.check = ezP.T3.Expr.numberliteral_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.numberliteral_concrete, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('numberliteral_concrete')

ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.integer, ezP.DelegateSvg.Expr.numberliteral_concrete)

ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.floatnumber, ezP.DelegateSvg.Expr.numberliteral_concrete)

ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.imagnumber, ezP.DelegateSvg.Expr.numberliteral_concrete)

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
      key: ezP.Const.Field.PREFIX,
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
  var fieldStart = this.inputs.last.input.ezpData.fieldLabelStart
  var fieldEnd = this.inputs.last.input.ezpData.fieldLabelEnd
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
  var fieldPrefix = block.getField(ezP.Const.Field.PREFIX)
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
  var field = block.getField(ezP.Const.Field.PREFIX)
  field.setVisible(field.getValue().length)
}

/**
 * Records the prefix as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Expr.stringliteral.prototype.toDom = function (block, element) {
  element.setAttribute('prefix', block.getField(ezP.Const.Field.PREFIX).getText())
}

/**
 * Set the prefix from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Expr.stringliteral.prototype.fromDom = function (block, element) {
  var op = element.getAttribute('prefix')
  block.getField(ezP.Const.Field.PREFIX).setText(op)
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
    key: ezP.Const.Field.VALUE,
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
  var field = block.getField(ezP.Const.Field.VALUE)
  var builtin = field.getValue()
  var value, _ = 0
  while ((value = this.values[_++])) {
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
  element.setAttribute('value', block.getField(ezP.Const.Field.VALUE).getText())
}

/**
 * Set the operator from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Expr.builtin_object.prototype.fromDom = function (block, element) {
  var value = element.getAttribute('value')
  block.getField(ezP.Const.Field.VALUE).setText(value)
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
  element.setAttribute('code', block.getField(ezP.Const.Field.CODE).getText())
}

/**
 * Set the operator from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Expr.any.prototype.fromDom = function (block, element) {
  var value = element.getAttribute('code')
  block.getField(ezP.Const.Field.CODE).setText(value)
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
      css_class: 'ezp-code-reserved',
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


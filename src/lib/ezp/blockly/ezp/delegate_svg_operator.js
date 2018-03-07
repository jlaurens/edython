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

goog.provide('ezP.DelegateSvg.Operator')
goog.provide('ezP.MixinSvg.Operator')

goog.require('ezP.DelegateSvg.Expr')

// Declare the mixins first

/**
 * Inits the various input model.
 * Called by the constructor.
 * Separated to be mixed in.
 * This is not compliant with inheritance.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.MixinSvg.Operator.initModel = function (prototypeName) {
  this.inputModel_ = {
    last: {
      label: '',
      key: ezP.Key.RHS,
      css_class: 'ezp-code',
      hole_value: 'name',
    },
  }
}

/**
 * Records the operator as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.MixinSvg.Operator.operatorToDom = function (block, element) {
  element.setAttribute('operator', this.inputs.last.fieldLabel.getText())
}

/**
 * Set the operator from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.MixinSvg.Operator.operatorFromDom = function (block, element) {
  var op = element.getAttribute('operator')
  if (this.operators && this.operators.indexOf(op) >= 0) {
    this.inputs.last.fieldLabel.setValue(op)
  }
}

/**
 * Class for a DelegateSvg, [...] op ... block.
 * Multiple ops.
 * Abstract class.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Operator = function (prototypeName) {
  ezP.DelegateSvg.Operator.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Operator, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Operator.prototype.operators = undefined

ezP.MixinSvg(ezP.DelegateSvg.Operator, 'Operator')

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden a dom element.
 */
ezP.DelegateSvg.Operator.prototype.fromDom = function (block, element) {
  ezP.DelegateSvg.Operator.superClass_.fromDom.call(this, block, element)
  this.operatorFromDom(block, element)
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden a dom element.
 */
ezP.DelegateSvg.Operator.prototype.toDom = function (block, element) {
  ezP.DelegateSvg.Operator.superClass_.toDom.call(this, block, element)
  this.operatorToDom(block, element)
}


/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Operator.prototype.getContent = /* function (block, op) {
} */ undefined

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
ezP.DelegateSvg.Operator.prototype.getMenuTarget = function(block) {
  return block
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Operator.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var yorn = mgr.populateOperator(block)
  return ezP.DelegateSvg.Operator.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!ezP.MenuManager} mgr mgr.menu is the Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Operator.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  
  return mgr.handleActionOperator(block, event) || ezP.DelegateSvg.Operator.superClass_.handleMenuItemActionFirst.call(this, block, mgr, event)
}

//////////////////////  u_expr_concrete  /////////////////////////

/**
 * Class for a DelegateSvg, unary op ... block.
 * u_expr_concrete.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.u_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.u_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.Expr.u_expr_concrete
  this.operators = ['-', '+', '~']
  goog.mixin(this.inputModel_.last, {
    label: this.operators[0],
    check: ezP.T3.Expr.Check.u_expr
  })
}
goog.inherits(ezP.DelegateSvg.Expr.u_expr_concrete, ezP.DelegateSvg.Operator)
ezP.DelegateSvg.Manager.register('u_expr_concrete')

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Expr.u_expr_concrete.prototype.getContent = function (block, op) {
  return op+' …'
}

/**
 * Class for a DelegateSvg, ... op ... block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary = function (prototypeName) {
  ezP.DelegateSvg.Binary.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.LHS,
    hole_value: 'name',
  }
}
goog.inherits(ezP.DelegateSvg.Binary, ezP.DelegateSvg.Operator)

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Binary.prototype.getContent = function (block, op) {
  return '… '+ op +' …'
}

/**
 * Class for a DelegateSvg, m_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.m_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.m_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.operators = ['*', '//', '/', '%', '@']
  this.inputModel_.first.check = ezP.T3.Expr.Check.m_expr
  goog.mixin(this.inputModel_.last, {
    label: this.operators[0],
    check: ezP.T3.Expr.Check.u_expr,
  })
  this.outputModel_.check = ezP.T3.Expr.m_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.m_expr_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('m_expr_concrete')

/**
 * Class for a DelegateSvg, a_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.a_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.a_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.operators = ['+', '-']
  this.inputModel_.first.check = ezP.T3.Expr.Check.a_expr
  goog.mixin(this.inputModel_.last, {
    label: this.operators[0],
    check: ezP.T3.Expr.Check.m_expr,
  })
  this.outputModel_.check = ezP.T3.Expr.a_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.a_expr_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('a_expr_concrete')

/**
 * Class for a DelegateSvg, shift_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.shift_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.shift_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.operators = ['<<', '>>']
  this.inputModel_.first.check = ezP.T3.Expr.Check.shift_expr
  goog.mixin(this.inputModel_.last, {
    label: this.operators[0],
    check: ezP.T3.Expr.Check.a_expr,
  })
  this.outputModel_.check = ezP.T3.Expr.shift_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.shift_expr_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('shift_expr_concrete')

/**
 * Class for a DelegateSvg, and_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.and_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.and_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first.check = ezP.T3.Expr.Check.and_expr
  goog.mixin(this.inputModel_.last,{
    label: '&',
    check: ezP.T3.Expr.Check.shift_expr,
  })
  this.outputModel_.check = ezP.T3.Expr.and_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.and_expr_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('and_expr_concrete')

/**
 * Class for a DelegateSvg, xor_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.xor_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.xor_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first.check = ezP.T3.Expr.Check.xor_expr
  goog.mixin(this.inputModel_.last, {
    label: '^',
    check: ezP.T3.Expr.Check.and_expr,
  })
  this.outputModel_.check = ezP.T3.Expr.xor_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.xor_expr_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('xor_expr_concrete')

/**
 * Class for a DelegateSvg, or_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.or_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.or_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first.check = ezP.T3.Expr.Check.or_expr
  goog.mixin(this.inputModel_.last, {
    label: '|',
    check: ezP.T3.Expr.Check.xor_expr,
  })
  this.outputModel_.check = ezP.T3.Expr.or_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.or_expr_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('or_expr_concrete')

/**
 * Class for a DelegateSvg, number_comparison block.
 * Multiple ops. This is not a list of comparisons, more like a tree.
 * Maybe we should make a flat version in order to compare the blocks
 * if necessary ever.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.number_comparison = function (prototypeName) {
  ezP.DelegateSvg.Expr.number_comparison.superClass_.constructor.call(this, prototypeName)
  this.operators = ['<', '>', '==', '>=', '<=', '!=']
  this.inputModel_.first.check = ezP.T3.Expr.Check.comparison
  this.inputModel_.last.label = '<'
  this.inputModel_.last.check = ezP.T3.Expr.Check.comparison
  this.outputModel_.check = ezP.T3.Expr.number_comparison
}
goog.inherits(ezP.DelegateSvg.Expr.number_comparison, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('number_comparison')

/**
 * Class for a DelegateSvg, object_comparison block.
 * Multiple ops. This is not a list of comparisons, more like a tree.
 * Maybe we should make a flat version in order to compare the blocks
 * if necessary ever.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.object_comparison = function (prototypeName) {
  ezP.DelegateSvg.Expr.object_comparison.superClass_.constructor.call(this, prototypeName)
  this.operators = ['is', 'is not', 'in', 'not in']
  this.inputModel_.first.check = ezP.T3.Expr.Check.comparison
  goog.mixin(this.inputModel_.last, {
    label: 'in',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.comparison,
  })
  this.outputModel_.check = ezP.T3.Expr.object_comparison
}
goog.inherits(ezP.DelegateSvg.Expr.object_comparison, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('object_comparison')

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Expr.object_comparison.prototype.getContent = function (block, op) {
  return ezP.Do.createSPAN(op, 'ezp-code-reserved')
}

/**
 * Class for a DelegateSvg, or_test_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.or_test_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.or_test_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first.check = ezP.T3.Expr.Check.or_test
  goog.mixin(this.inputModel_.last, {
    label: 'or',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.and_test,
  })
  this.outputModel_.check = ezP.T3.Expr.or_test_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.or_test_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('or_test_concrete')

/**
 * Class for a DelegateSvg, and_test_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.and_test_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.and_test_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first.check = ezP.T3.Expr.Check.and_test
  goog.mixin(this.inputModel_.last, {
    label: 'and',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.not_test,
  })
  this.outputModel_.check = ezP.T3.Expr.and_test_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.and_test_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('and_test_concrete')

///////// power ////////
/**
 * Class for a DelegateSvg, power_concrete block.
 * power_concrete ::= await_or_primary "**" u_expr 
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.power_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.power_concrete.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.power_concrete
  this.inputModel_ = {
    first: {
      key: ezP.Key.ARGUMENT,
      check: ezP.T3.Expr.Check.await_or_primary,
      hole_value: 'name',
    },
    last: {
      key: ezP.Key.POWER,
      label: '**',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.u_expr,
      hole_value: 'power',
    },
  }
}

goog.inherits(ezP.DelegateSvg.Expr.power_concrete, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('power_concrete')

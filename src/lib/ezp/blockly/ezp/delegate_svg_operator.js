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
  this.inputModel__ = {
    m_3: {
      operator: '',
      key: ezP.Key.RHS,
      css_class: 'ezp-code',
      hole_value: 'name',
    },
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

ezP.MixinSvg(ezP.DelegateSvg.Operator, 'Operator')

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
 * Get the subtype of the block.
 * The operator.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return None
 */
ezP.DelegateSvg.Operator.prototype.getSubtype = function (block) {
  return this.uiModel.m_3.fieldOperator.getValue()
}

/**
 * Set the subtype of the block.
 * The operator.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Operator.prototype.setSubtype = function (block, subtype) {
  var model = this.getModel().input
  if (model.operators && model.operators.indexOf(subtype) >= 0) {
    this.uiModel.m_3.fieldOperator.setValue(subtype)
    return true
  }
  return false
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
  this.inputModel__.operators = ['-', '+', '~']
  goog.mixin(this.inputModel__.m_3, {
    operator: this.inputModel__.operators[0],
    check: ezP.T3.Expr.Check.u_expr
  })
  this.outputModel__ = {
    check: ezP.T3.Expr.u_expr_concrete,
  }
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
  this.inputModel__.m_1 = {
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
  this.inputModel__.operators = ['*', '//', '/', '%', '@']
  this.inputModel__.m_1.check = ezP.T3.Expr.Check.m_expr
  goog.mixin(this.inputModel__.m_3, {
    operator: this.inputModel__.operators[0],
    check: ezP.T3.Expr.Check.u_expr,
  })
  this.outputModel__ = {
    check: ezP.T3.Expr.m_expr_concrete,
  }
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
  this.inputModel__.operators = ['+', '-']
  this.inputModel__.m_1.check = ezP.T3.Expr.Check.a_expr
  goog.mixin(this.inputModel__.m_3, {
    operator: this.inputModel__.operators[0],
    check: ezP.T3.Expr.Check.m_expr,
  })
  this.outputModel__ = {
    check: ezP.T3.Expr.a_expr_concrete,
  }
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
  this.inputModel__.operators = ['<<', '>>']
  this.inputModel__.m_1.check = ezP.T3.Expr.Check.shift_expr
  goog.mixin(this.inputModel__.m_3, {
    operator: this.inputModel__.operators[0],
    check: ezP.T3.Expr.Check.a_expr,
  })
  this.outputModel__ = {
    check: ezP.T3.Expr.shift_expr_concrete,
  }
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
  this.inputModel__.m_1.check = ezP.T3.Expr.Check.and_expr
  goog.mixin(this.inputModel__.m_3,{
    operator: '&',
    check: ezP.T3.Expr.Check.shift_expr,
  })
  this.outputModel__ = {
    check: ezP.T3.Expr.and_expr_concrete,
  }
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
  this.inputModel__.m_1.check = ezP.T3.Expr.Check.xor_expr
  goog.mixin(this.inputModel__.m_3, {
    operator: '^',
    check: ezP.T3.Expr.Check.and_expr,
  })
  this.outputModel__ = {
    check: ezP.T3.Expr.xor_expr_concrete,
  }
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
  this.inputModel__.m_1.check = ezP.T3.Expr.Check.or_expr
  goog.mixin(this.inputModel__.m_3, {
    operator: '|',
    check: ezP.T3.Expr.Check.xor_expr,
  })
  this.outputModel__ = {
    check: ezP.T3.Expr.or_expr_concrete,
  }
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
  this.inputModel__.operators = ['<', '>', '==', '>=', '<=', '!=']
  this.inputModel__.m_1.check = ezP.T3.Expr.Check.comparison
  this.inputModel__.m_3.operator = this.inputModel__.operators[0]
  this.inputModel__.m_3.check = ezP.T3.Expr.Check.comparison
  this.outputModel__ = {
    check: ezP.T3.Expr.number_comparison,
  }
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
  this.inputModel__.operators = ['is', 'is not', 'in', 'not in']
  this.inputModel__.m_1.check = ezP.T3.Expr.Check.comparison
  goog.mixin(this.inputModel__.m_3, {
    operator: 'in',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.comparison,
  })
  this.outputModel__ = {
    check: ezP.T3.Expr.object_comparison,
  }
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
  this.inputModel__.m_1.check = ezP.T3.Expr.Check.or_test
  goog.mixin(this.inputModel__.m_3, {
    operator: 'or',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.and_test,
  })
  this.outputModel__ = {
    check: ezP.T3.Expr.or_test_concrete,
  }
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
  this.inputModel__.m_1.check = ezP.T3.Expr.Check.and_test
  goog.mixin(this.inputModel__.m_3, {
    operator: 'and',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.not_test,
  })
  this.outputModel__ = {
    check: ezP.T3.Expr.and_test_concrete,
  }
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
  this.inputModel__ = {
    m_1: {
      key: ezP.Key.ARGUMENT,
      check: ezP.T3.Expr.Check.await_or_primary,
      hole_value: 'name',
    },
    m_3: {
      key: ezP.Key.POWER,
      operator: '**',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.u_expr,
      hole_value: 'power',
    },
  }
  this.outputModel__ = {
    check: ezP.T3.power_concrete,
  }
}

goog.inherits(ezP.DelegateSvg.Expr.power_concrete, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('power_concrete')

ezP.DelegateSvg.Operator.T3s = [
  ezP.T3.Expr.u_expr_concrete,
  ezP.T3.Expr.m_expr_concrete,
  ezP.T3.Expr.a_expr_concrete,
  ezP.T3.Expr.shift_expr_concrete,
  ezP.T3.Expr.and_expr_concrete,
  ezP.T3.Expr.xor_expr_concrete,
  ezP.T3.Expr.or_expr_concrete,
  ezP.T3.Expr.number_comparison,
  ezP.T3.Expr.object_comparison,
  ezP.T3.Expr.or_test_concrete,
  ezP.T3.Expr.and_test_concrete,
  ezP.T3.Expr.power_concrete,
]
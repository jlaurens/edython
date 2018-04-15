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

goog.require('ezP.DelegateSvg.Expr')

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

ezP.DelegateSvg.Operator.model__ = {
  inputs: {
    m_3: {
      key: ezP.Key.RHS,
      operator: '',
      css_class: 'ezp-code',
      hole_value: 'name',
    },
  },
}

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
ezP.DelegateSvg.Operator.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Operator.superClass_.initBlock.call(this, block)
  var field = block.ezp.uiModel.m_3.fields.operator
  var value = field.getValue()
  if (this.validateSubtype(block, value)) {
    this.setSubtype(block, value)
  } else {
    field.setValue(this.getSubtype(block))
  }
}
/**
 * Create and initialize the various paths.
 * Called once at block creation time.
 * Should not be called directly
 * Declares the operator property.
 * @param {!Blockly.Block} block to be initialized.
 */
ezP.DelegateSvg.Operator.prototype.didChangeSubtype = function(block, oldValue, newValue) {
  var field = block.ezp.uiModel.m_3.fields.operator
  if (newValue !== field.getValue()) {
    var disabler = new ezP.Events.Disabler()
    try {
      field.setValue(newValue)
    } finally {
      disabler.stop()
    }
  }
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
  var yorn = mgr.populateSubtypes(block)
  return ezP.DelegateSvg.Operator.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
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
ezP.DelegateSvg.Manager.makeSubclass('u_expr_concrete', {
  inputs: {
    subtypes: ['-', '+', '~'],
    m_3: {
      operator: '-',
      check: ezP.T3.Expr.Check.u_expr
    },
  },
}, ezP.DelegateSvg.Operator)

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
  this.model__.inputs.m_1 = {
    key: ezP.Key.LHS,
    hole_value: 'name',
  }
}
goog.inherits(ezP.DelegateSvg.Binary, ezP.DelegateSvg.Operator)
ezP.DelegateSvg.Binary.model__ = {
  inputs: {
    m_1: {
      key: ezP.Key.LHS,
      hole_value: 'name',
    },
  },
}

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
ezP.DelegateSvg.Binary.makeSubclass = function(key, operators, check1, check3, operatorIndex) {
  ezP.DelegateSvg.Manager.makeSubclass(key, {
    inputs: {
      subtypes: operators,
      subtypeIndex: operatorIndex || 0,
      m_1: {
        check: ezP.T3.Expr.Check[check1]
      },
      m_3: {
        operator: '',
        check: ezP.T3.Expr.Check[check3]
      },
    },
  }, ezP.DelegateSvg.Binary)
}
ezP.DelegateSvg.Binary.makeSubclass(
  'm_expr_concrete',
  ['*', '//', '/', '%', '@'],
  'm_expr',
  'u_expr',
)

/**
 * Class for a DelegateSvg, a_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary.makeSubclass(
  'a_expr_concrete',
  ['+', '-'],
  'a_expr',
  'm_expr',
)

/**
 * Class for a DelegateSvg, shift_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary.makeSubclass(
  'shift_expr_concrete',
  ['<<', '>>'],
  'shift_expr',
  'a_expr',
)

/**
 * Class for a DelegateSvg, and_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary.makeSubclass(
  'and_expr_concrete',
  ['&'],
  'and_expr',
  'shift_expr',
)

/**
 * Class for a DelegateSvg, xor_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary.makeSubclass(
  'xor_expr_concrete',
  ['^'],
  'xor_expr',
  'and_expr',
)

/**
 * Class for a DelegateSvg, or_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary.makeSubclass(
  'or_expr_concrete',
  ['|'],
  'or_expr',
  'or_expr',
)

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
ezP.DelegateSvg.Binary.makeSubclass(
  'number_comparison',
  ['<', '>', '==', '>=', '<=', '!='],
  'comparison',
  'comparison',
)

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
ezP.DelegateSvg.Manager.makeSubclass('object_comparison', {
  inputs: {
    subtypes: ['is', 'is not', 'in', 'not in'],
    subtypeIndex: 2,
    m_1: {
      check: ezP.T3.Expr.Check.comparison
    },
    m_3: {
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.comparison
    },
  },
}, ezP.DelegateSvg.Binary)

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
ezP.DelegateSvg.Manager.makeSubclass('or_test_concrete', {
  inputs: {
    subtypes: ['or'],
    m_1: {
      check: ezP.T3.Expr.Check.or_test
    },
    m_3: {
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.and_test
    },
  },
}, ezP.DelegateSvg.Binary)

/**
 * Class for a DelegateSvg, and_test_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('and_test_concrete', {
  inputs: {
    subtypes: ['and'],
    m_1: {
      check: ezP.T3.Expr.Check.and_test
    },
    m_3: {
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.not_test
    },
  },
}, ezP.DelegateSvg.Binary)

///////// power ////////
/**
 * Class for a DelegateSvg, power_concrete block.
 * power_concrete ::= await_or_primary "**" u_expr 
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('power_concrete', {
  inputs: {
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
  },
})

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
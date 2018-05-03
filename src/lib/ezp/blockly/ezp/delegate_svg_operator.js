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
ezP.DelegateSvg.Expr.makeSubclass('Operator', {
  data: {
    operator: {
      synchronize: function(newValue) {
        this.ui[2].fields.operator.setValue(newValue || '')
      },
    },
  },
  inputs: {
    rhs: {
      order: 2,
      operator: '',
      css_class: 'ezp-code',
      hole_value: 'name',
    },
  },
}, ezP.DelegateSvg)

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the label
 * @private
 */
ezP.DelegateSvg.Operator.prototype.makeTitle = /* function (block, op) {
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
  var yorn = mgr.populateProperties(block, 'operator')
  return ezP.DelegateSvg.Operator.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

//////////////////////  u_expr_solid  /////////////////////////

/**
 * Class for a DelegateSvg, unary op ... block.
 * u_expr_solid.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Operator.makeSubclass('u_expr_solid', {
  data: {
    operator: {
      all: ['-', '+', '~'],
    },
  },
  inputs: {
    dummy: {
      order: 2,
      check: ezP.T3.Expr.Check.u_expr,
    },
  },
})

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Expr.u_expr_solid.prototype.makeTitle = function (block, op) {
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
ezP.DelegateSvg.Operator.makeSubclass('Binary',{
  inputs: {
    lhs: {
      order: 1,
      hole_value: 'name',
    },
  },
}, ezP.DelegateSvg)

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Binary.prototype.makeTitle = function (block, op) {
  return '… '+ op +' …'
}

/**
 * Convenient model maker.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary.makeModel = function(operators, check1, check3, operatorIndex) {
  return {
    data: {
      operator: {
        all: operators,
        default: operatorIndex || 0,
      },
    },
    inputs: {
      left: {
        check: ezP.T3.Expr.Check[check1]
      },
      right: {
        check: ezP.T3.Expr.Check[check3]
      },
    },
  }
}

/**
 * Class for a DelegateSvg, m_expr_solid block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary.makeSubclass(
  'm_expr_solid',
  ezP.DelegateSvg.Binary.makeModel(
    ['*', '//', '/', '%', '@'],
    'm_expr',
    'u_expr',
  )
)

/**
 * Class for a DelegateSvg, a_expr_solid block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary.makeSubclass(
  'a_expr_solid',
  ezP.DelegateSvg.Binary.makeModel(
    ['+', '-'],
    'a_expr',
    'm_expr',
  ),
)

/**
 * Class for a DelegateSvg, shift_expr_solid block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary.makeSubclass(
  'shift_expr_solid',
  ezP.DelegateSvg.Binary.makeModel(
    ['<<', '>>'],
    'shift_expr',
    'a_expr',
  ),
)

/**
 * Class for a DelegateSvg, and_expr_solid block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary.makeSubclass(
  'and_expr_solid',
  ezP.DelegateSvg.Binary.makeModel(
    ['&'],
    'and_expr',
    'shift_expr',
  ),
)

/**
 * Class for a DelegateSvg, xor_expr_solid block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary.makeSubclass(
  'xor_expr_solid',
  ezP.DelegateSvg.Binary.makeModel(
    ['^'],
    'xor_expr',
    'and_expr',
  ),
)

/**
 * Class for a DelegateSvg, or_expr_solid block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary.makeSubclass(
  'or_expr_solid',
  ezP.DelegateSvg.Binary.makeModel(
    ['|'],
    'or_expr',
    'or_expr',
  ),
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
  ezP.DelegateSvg.Binary.makeModel(
    ['<', '>', '==', '>=', '<=', '!='],
    'comparison',
    'comparison',
  ),
)
console.log('where is the operator displayed ?')
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
ezP.DelegateSvg.Binary.makeSubclass('object_comparison', {
  data: {
    operator: {
      all: ['is', 'is not', 'in', 'not in'],
      default: 2,
    },
  },
  inputs: {
    left: {
      check: ezP.T3.Expr.Check.comparison
    },
    right: {
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.comparison
    },
  },
})

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Expr.object_comparison.prototype.makeTitle = function (block, op) {
  return ezP.Do.createSPAN(op, 'ezp-code-reserved')
}

/**
 * Class for a DelegateSvg, or_test_solid block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
console.warn('Check the css-class below, does it belong there?')
ezP.DelegateSvg.Binary.makeSubclass('or_test_solid', {
  data: {
    operator: {
      all: ['or'],
    }
  },
  inputs: {
    left: {
      check: ezP.T3.Expr.Check.or_test
    },
    right: {
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.and_test
    },
  },
})

/**
 * Class for a DelegateSvg, and_test_solid block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary.makeSubclass('and_test_solid', {
  data: {
    operator: {
      all: ['and'],
    }
  },
  inputs: {
    left: {
      check: ezP.T3.Expr.Check.and_test
    },
    right: {
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.not_test
    },
  },
})

///////// power ////////
/**
 * Class for a DelegateSvg, power_solid block.
 * power_solid ::= await_or_primary "**" u_expr
 * This one is not a binary.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Operator.makeSubclass('power_solid', {
  data: {
    operator: {
      default: '**',
    },
  },
  inputs: {
    argument: {
      order: 1,
      check: ezP.T3.Expr.Check.await_or_primary,
      hole_value: 'name',
    },
    power: {
      order: 2,
      check: ezP.T3.Expr.Check.u_expr,
      hole_value: 'power',
    },
  },
})

ezP.DelegateSvg.Operator.T3s = [
  ezP.T3.Expr.u_expr_solid,
  ezP.T3.Expr.m_expr_solid,
  ezP.T3.Expr.a_expr_solid,
  ezP.T3.Expr.shift_expr_solid,
  ezP.T3.Expr.and_expr_solid,
  ezP.T3.Expr.xor_expr_solid,
  ezP.T3.Expr.or_expr_solid,
  ezP.T3.Expr.number_comparison,
  ezP.T3.Expr.object_comparison,
  ezP.T3.Expr.or_test_solid,
  ezP.T3.Expr.and_test_solid,
  ezP.T3.Expr.power_solid,
]
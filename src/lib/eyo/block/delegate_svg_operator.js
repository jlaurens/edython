/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Operator')

goog.require('eYo.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, [...] op ... block.
 * Multiple ops.
 * Abstract class.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('Operator', {
  data: {
    operator: { // only one field with that key
      synchronize: true
    }
  },
  tiles: {
    rhs: {
      order: 2,
      fields: {
        operator: ''
      },
      hole_value: 'name'
    }
  }
}, eYo.DelegateSvg)

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the label
 * @private
 */
eYo.DelegateSvg.Operator.prototype.makeTitle = /* function (block, op) {
} */ undefined

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
eYo.DelegateSvg.Operator.prototype.getMenuTarget = function (block) {
  return block
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Operator.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var yorn = mgr.populateProperties(block, 'operator')
  return eYo.DelegateSvg.Operator.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/// ///////////////////  u_expr  /////////////////////////

/**
 * Class for a DelegateSvg, unary op ... block.
 * u_expr.
 * For edython.
 */
eYo.DelegateSvg.Operator.makeSubclass('u_expr', {
  data: {
    operator: {
      all: ['-', '+', '~']
    }
  },
  tiles: {
    rhs: {
      check: eYo.T3.Expr.Check.u_expr_all
    }
  }
})

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
eYo.DelegateSvg.Expr.u_expr.prototype.makeTitle = function (block, op) {
  return op + ' …'
}

/**
 * Class for a DelegateSvg, ... op ... block.
 * Multiple ops.
 * For edython.
 */
eYo.DelegateSvg.Operator.makeSubclass('Binary', {
  tiles: {
    lhs: {
      order: 1,
      hole_value: 'name'
    }
  }
}, eYo.DelegateSvg)

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
eYo.DelegateSvg.Binary.prototype.makeTitle = function (block, op) {
  return '… ' + op + ' …'
}

/**
 * Convenient model maker.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.Binary.makeModel = function (operators, check1, check3, operatorIndex) {
  return {
    data: {
      operator: {
        all: operators,
        init: operatorIndex || 0
      }
    },
    tiles: {
      lhs: {
        check: eYo.T3.Expr.Check[check1]
      },
      rhs: {
        check: eYo.T3.Expr.Check[check3]
      }
    }
  }
}

/**
 * Class for a DelegateSvg, m_expr block.
 * Multiple ops.
 * For edython.
 */
eYo.DelegateSvg.Binary.makeSubclass(
  'm_expr',
  eYo.DelegateSvg.Binary.makeModel(
    ['*', '//', '/', '%', '@'],
    'm_expr_all',
    'u_expr_all'
  )
)

/**
 * Class for a DelegateSvg, a_expr block.
 * Multiple ops.
 * For edython.
 */
eYo.DelegateSvg.Binary.makeSubclass(
  'a_expr',
  eYo.DelegateSvg.Binary.makeModel(
    ['+', '-'],
    'a_expr_all',
    'm_expr_all'
  )
)

/**
 * Class for a DelegateSvg, shift_expr block.
 * Multiple ops.
 * For edython.
 */
eYo.DelegateSvg.Binary.makeSubclass(
  'shift_expr',
  eYo.DelegateSvg.Binary.makeModel(
    ['<<', '>>'],
    'shift_expr_all',
    'a_expr_all'
  )
)

/**
 * Class for a DelegateSvg, and_expr block.
 * Multiple ops.
 * For edython.
 */
eYo.DelegateSvg.Binary.makeSubclass(
  'and_expr',
  eYo.DelegateSvg.Binary.makeModel(
    ['&'],
    'and_expr_all',
    'shift_expr_all'
  )
)

/**
 * Class for a DelegateSvg, xor_expr block.
 * Multiple ops.
 * For edython.
 */
eYo.DelegateSvg.Binary.makeSubclass(
  'xor_expr',
  eYo.DelegateSvg.Binary.makeModel(
    ['^'],
    'xor_expr_all',
    'and_expr_all'
  )
)

/**
 * Class for a DelegateSvg, or_expr block.
 * Multiple ops.
 * For edython.
 */
eYo.DelegateSvg.Binary.makeSubclass(
  'or_expr',
  eYo.DelegateSvg.Binary.makeModel(
    ['|'],
    'or_expr_all',
    'xor_expr_all'
  )
)

/**
 * Class for a DelegateSvg, number_comparison block.
 * Multiple ops. This is not a list of comparisons, more like a tree.
 * Maybe we should make a flat version in order to compare the blocks
 * if necessary ever.
 * For edython.
 */
eYo.DelegateSvg.Binary.makeSubclass(
  'number_comparison',
  eYo.DelegateSvg.Binary.makeModel(
    ['<', '>', '==', '>=', '<=', '!='],
    'comparison',
    'comparison'
  )
)
console.log('where is the operator displayed ?')
/**
 * Class for a DelegateSvg, object_comparison block.
 * Multiple ops. This is not a list of comparisons, more like a tree.
 * Maybe we should make a flat version in order to compare the blocks
 * if necessary ever.
 * For edython.
 */
eYo.DelegateSvg.Binary.makeSubclass('object_comparison', {
  data: {
    operator: {
      all: ['is', 'is not', 'in', 'not in'],
      init: 2
    }
  },
  tiles: {
    lhs: {
      check: eYo.T3.Expr.Check.comparison
    },
    rhs: {
      css_class: 'eyo-code-reserved',
      check: eYo.T3.Expr.Check.comparison
    }
  }
})

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
eYo.DelegateSvg.Expr.object_comparison.prototype.makeTitle = function (block, op) {
  return eYo.Do.createSPAN(op, 'eyo-code-reserved')
}

/**
 * Class for a DelegateSvg, or_test block.
 * Multiple ops.
 * For edython.
 */
eYo.DelegateSvg.Binary.makeSubclass('or_test', {
  data: {
    operator: {
      all: ['or']
    }
  },
  tiles: {
    lhs: {
      check: eYo.T3.Expr.Check.or_test_all
    },
    rhs: {
      fields: {
        operator: {
          css: 'reserved'
        }
      },
      check: eYo.T3.Expr.Check.and_test_all
    }
  }
})

/**
 * Class for a DelegateSvg, and_test block.
 * Multiple ops.
 * For edython.
 */
eYo.DelegateSvg.Binary.makeSubclass('and_test', {
  data: {
    operator: {
      all: ['and']
    }
  },
  tiles: {
    lhs: {
      check: eYo.T3.Expr.Check.and_test_all
    },
    rhs: {
      fields: {
        operator: {
          css: 'reserved'
        }
      },
      check: eYo.T3.Expr.Check.not_test_all
    }
  }
})

/// ////// power ////////
/**
 * Class for a DelegateSvg, power block.
 * power ::= await_or_primary "**" u_expr
 * This one is not a binary.
 * For edython.
 */
eYo.DelegateSvg.Operator.makeSubclass('power', {
  data: {
    operator: {
      init: '**'
    }
  },
  tiles: {
    lhs: {
      order: 1,
      check: eYo.T3.Expr.Check.await_or_primary,
      hole_value: 'name'
    },
    rhs: {
      order: 2,
      check: eYo.T3.Expr.Check.u_expr_all,
      hole_value: 'power'
    }
  }
})

eYo.DelegateSvg.Operator.T3s = [
  eYo.T3.Expr.u_expr,
  eYo.T3.Expr.m_expr,
  eYo.T3.Expr.a_expr,
  eYo.T3.Expr.shift_expr,
  eYo.T3.Expr.and_expr,
  eYo.T3.Expr.xor_expr,
  eYo.T3.Expr.or_expr,
  eYo.T3.Expr.number_comparison,
  eYo.T3.Expr.object_comparison,
  eYo.T3.Expr.or_test,
  eYo.T3.Expr.and_test,
  eYo.T3.Expr.power
]

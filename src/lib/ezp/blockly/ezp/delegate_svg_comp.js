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

goog.provide('ezP.DelegateSvg.Comprehension')

goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, comprehension value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.makeSubclass('comprehension', {
  tiles: {
    expression: {
      order: 1,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'name',
    },
    for: {
      order: 2,
      fields: {
        label: 'for',
      },
      wrap: ezP.T3.Expr.target_list,
    },
    in: {
      order: 3,
      fields: {
        label: 'in',
      },
      check: ezP.T3.Expr.Check.or_test,
      hole_value: 'name',
    },
    for_if: {
      order: 4,
      wrap: ezP.T3.Expr.comp_iter_list,
    },
  },
})

/**
 * Class for a DelegateSvg, comp_for block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.makeSubclass('comp_for', {
  tiles: {
    for: {
      order: 1,
      fields: {
        label: 'for',
      },
      wrap: ezP.T3.Expr.target_list,
    },
    in: {
      order: 2,
      fields: {
        label: 'in',
      },
      check: ezP.T3.Expr.Check.or_test,
      hole_value: 'name',
    },
  },
})

/**
 * Class for a DelegateSvg, comp_if block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.makeSubclass('comp_if', {
  tiles: {
    if: {
      order: 1,
      fields: {
        label: 'if',
      },
      check: ezP.T3.Expr.Check.expression_nocond,
      hole_value: 'yorn',
    },
  },
})

/**
 * Class for a DelegateSvg, comp_iter_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('comp_iter_list', {
  list: {
    check: ezP.T3.Expr.Check.comp_iter,
    empty: true,
    presep: ',',
  },  
})

/**
 * Class for a DelegateSvg, dict comprehension value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
// dict_comprehension ::= expression ":" expression comp_for
ezP.DelegateSvg.Expr.makeSubclass('dict_comprehension', {
  tiles: {
    key: {
      order: 1,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'key',
    },
    datum: {
      order: 2,
      fields: {
        label: ':',
      },
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'value',
    },
    for: {
      order: 3,
      fields: {
        label: 'for',
      },
      wrap: ezP.T3.Expr.target_list,
    },
    in: {
      order: 4,
      fields: {
        label: 'in',
      },
      check: ezP.T3.Expr.Check.or_test,
      hole_value: 'name',
    },
    for_if: { // that name is so ugly
      order: 5,
      wrap: ezP.T3.Expr.comp_iter_list,
    },  
  },
})

/**
 * Class for a DelegateSvg, key_datum_s3d block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.makeSubclass('key_datum_s3d', {
  tiles: {
    key: {
      order: 1,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'key',
    },
    datum: {
      order: 2,
      fields: {
        label: ':',
      },
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'value',
    },
  },
})

/**
 * Class for a DelegateSvg, generator expression block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.comprehension.makeSubclass('generator_expression', {
  fields: {
    prefix: '(',
    suffix: ')',
  },
}, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Comprehension.T3s = [
  ezP.T3.Expr.comprehension,
  ezP.T3.Expr.comp_for,
  ezP.T3.Expr.comp_if,
  ezP.T3.Expr.comp_iter_list,
  ezP.T3.Expr.dict_comprehension,
  ezP.T3.Expr.term,
  ezP.T3.Expr.key_datum_s3d,
  ezP.T3.Expr.generator_expression
]
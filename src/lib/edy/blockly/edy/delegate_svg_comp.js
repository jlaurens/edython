/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.DelegateSvg.Comprehension')

goog.require('edY.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, comprehension value block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.makeSubclass('comprehension', {
  tiles: {
    expression: {
      order: 1,
      check: edY.T3.Expr.Check.expression,
      hole_value: 'name',
    },
    for: {
      order: 2,
      fields: {
        label: 'for',
      },
      wrap: edY.T3.Expr.target_list,
    },
    in: {
      order: 3,
      fields: {
        label: 'in',
      },
      check: edY.T3.Expr.Check.or_test,
      hole_value: 'name',
    },
    for_if: {
      order: 4,
      wrap: edY.T3.Expr.comp_iter_list,
    },
  },
})

/**
 * Class for a DelegateSvg, comp_for block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.makeSubclass('comp_for', {
  tiles: {
    for: {
      order: 1,
      fields: {
        label: 'for',
      },
      wrap: edY.T3.Expr.target_list,
    },
    in: {
      order: 2,
      fields: {
        label: 'in',
      },
      check: edY.T3.Expr.Check.or_test,
      hole_value: 'name',
    },
  },
})

/**
 * Class for a DelegateSvg, comp_if block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.makeSubclass('comp_if', {
  tiles: {
    if: {
      order: 1,
      fields: {
        label: 'if',
      },
      check: edY.T3.Expr.Check.expression_nocond,
      hole_value: 'yorn',
    },
  },
})

/**
 * Class for a DelegateSvg, comp_iter_list block.
 * This block may be sealed.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.List.makeSubclass('comp_iter_list', {
  list: {
    check: edY.T3.Expr.Check.comp_iter,
    empty: true,
    presep: ',',
  },  
})

/**
 * Class for a DelegateSvg, dict comprehension value block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
// dict_comprehension ::= expression ":" expression comp_for
edY.DelegateSvg.Expr.makeSubclass('dict_comprehension', {
  tiles: {
    key: {
      order: 1,
      check: edY.T3.Expr.Check.expression,
      hole_value: 'key',
    },
    datum: {
      order: 2,
      fields: {
        label: ':',
      },
      check: edY.T3.Expr.Check.expression,
      hole_value: 'value',
    },
    for: {
      order: 3,
      fields: {
        label: 'for',
      },
      wrap: edY.T3.Expr.target_list,
    },
    in: {
      order: 4,
      fields: {
        label: 'in',
      },
      check: edY.T3.Expr.Check.or_test,
      hole_value: 'name',
    },
    for_if: { // that name is so ugly
      order: 5,
      wrap: edY.T3.Expr.comp_iter_list,
    },  
  },
})

/**
 * Class for a DelegateSvg, key_datum_s3d block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.makeSubclass('key_datum_s3d', {
  tiles: {
    key: {
      order: 1,
      check: edY.T3.Expr.Check.expression,
      hole_value: 'key',
    },
    datum: {
      order: 2,
      fields: {
        label: ':',
      },
      check: edY.T3.Expr.Check.expression,
      hole_value: 'value',
    },
  },
})

edY.DelegateSvg.Comprehension.T3s = [
  edY.T3.Expr.comprehension,
  edY.T3.Expr.comp_for,
  edY.T3.Expr.comp_if,
  edY.T3.Expr.comp_iter_list,
  edY.T3.Expr.dict_comprehension,
  edY.T3.Expr.term,
  edY.T3.Expr.key_datum_s3d,
]
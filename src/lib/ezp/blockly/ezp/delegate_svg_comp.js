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
console.warn('Remove those ugly insert, make a subclass?')
ezP.DelegateSvg.Expr.makeSubclass('comprehension', {
  inputs: {
    expression: {
      order: 1,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'name',
    },
    comp_for: {
      order: 2,
      insert: ezP.T3.Expr.comp_for,
    },
    comp_iter: {
      order: 3,
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
  inputs: {
    for: {
      order: 1,
      label: 'for',
      css_class: 'ezp-code-reserved',
      wrap: ezP.T3.Expr.target_list,
    },
    in: {
      order: 3,
      label: 'in',
      css_class: 'ezp-code-reserved',
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
  inputs: {
    if: {
      order: 1,
      label: 'if',
      css_class: 'ezp-code-reserved',
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
  inputs: {
    key_datum: {
      order: 1,
      insert: ezP.T3.Expr.key_datum_solid,
    },
    comp_for: {
      order: 2,
      insert: ezP.T3.Expr.comp_for,
    },
    comp_iter: {
      order: 3,
      wrap: ezP.T3.Expr.comp_iter_list,
    },  
  },
})

/**
 * Class for a DelegateSvg, key_datum_solid block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.makeSubclass('key_datum_solid', {
  inputs: {
    key: {
      order: 1,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'key',
    },
    datum: {
      order: 3,
      check: ezP.T3.Expr.Check.expression,
      label: ':',
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
    prefix: {
      label: '(',
    },
    suffix: {
      label: ')',
    },
  },
}, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Comprehension.T3s = [
  ezP.T3.Expr.comprehension,
  ezP.T3.Expr.comp_for,
  ezP.T3.Expr.comp_if,
  ezP.T3.Expr.comp_iter_list,
  ezP.T3.Expr.dict_comprehension,
  ezP.T3.Expr.term,
  ezP.T3.Expr.key_datum_solid,
  ezP.T3.Expr.generator_expression
]
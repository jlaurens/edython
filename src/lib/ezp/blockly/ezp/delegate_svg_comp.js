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
ezP.DelegateSvg.Manager.makeSubclass('comprehension', {
  input: {
    m_1: {
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'name',
    },
    m_2: {
      insert: ezP.T3.Expr.comp_for,
    },
    m_3: {
      key: ezP.Key.COMP_ITER,
      wrap: ezP.T3.Expr.comp_iter_list,
    }
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
ezP.DelegateSvg.Manager.makeSubclass('comp_for', {
  input: {
    m_1: {
      key: ezP.Key.FOR,
      label: 'for',
      css_class: 'ezp-code-reserved',
      wrap: ezP.T3.Expr.target_list,
    },
    m_3: {
      key: ezP.Key.IN,
      label: 'in',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.or_test,
      hole_value: 'name',
    }  
  }
})

/**
 * Class for a DelegateSvg, comp_if block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('comp_if', {
  input: {
    m_1: {
      key: ezP.Key.IF,
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
ezP.DelegateSvg.Manager.makeSubclass('comp_iter_list', {
  input: {
    list: {
      check: ezP.T3.Expr.Check.comp_iter,
      empty: true,
      sep: ',',
    },  
  },
}, ezP.DelegateSvg.List, ezP.DelegateSvg.Expr)

/**
 * Class for a DelegateSvg, dict comprehension value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
// dict_comprehension ::= expression ":" expression comp_for
ezP.DelegateSvg.Manager.makeSubclass('dict_comprehension', {
  input: {
    m_1: {
      insert: ezP.T3.Expr.key_datum_concrete,
    },
    m_2: {
      insert: ezP.T3.Expr.comp_for,
    },
    m_3: {
      key: ezP.Key.COMP_ITER,
      wrap: ezP.T3.Expr.comp_iter_list,
    },  
  },
})

/**
 * Class for a DelegateSvg, key_datum_concrete block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('key_datum_concrete', {
  input: {
    m_1: {
      key: ezP.Key.KEY,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'key',
    },
    m_3: {
      key: ezP.Key.DATUM,
      check: ezP.T3.Expr.Check.expression,
      label: ':',
      hole_value: 'value',
    }
  }
})

/**
 * Class for a DelegateSvg, generator expression block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('generator_expression', {
  input: {
    prefix: {
      label: '(',
    },
    suffix: {
      label: ')',
    }
  },
}, ezP.DelegateSvg.Expr.comprehension, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Comprehension.T3s = [
  ezP.T3.Expr.comprehension,
  ezP.T3.Expr.comp_for,
  ezP.T3.Expr.comp_if,
  ezP.T3.Expr.comp_iter_list,
  ezP.T3.Expr.dict_comprehension,
  ezP.T3.Expr.key_datum_concrete,
  ezP.T3.Expr.generator_expression
]
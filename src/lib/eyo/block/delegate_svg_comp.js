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

goog.provide('eYo.DelegateSvg.Comprehension')

goog.require('eYo.DelegateSvg.List')

/**
 * Class for a DelegateSvg, comprehension value block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('comprehension', {
  tiles: {
    expression: {
      order: 1,
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'name'
    },
    for: {
      order: 2,
      fields: {
        label: 'for'
      },
      wrap: eYo.T3.Expr.target_list
    },
    in: {
      order: 3,
      fields: {
        label: 'in'
      },
      check: eYo.T3.Expr.Check.or_test,
      hole_value: 'name'
    },
    for_if: {
      order: 4,
      wrap: eYo.T3.Expr.comp_iter_list
    }
  }
})

/**
 * Class for a DelegateSvg, comp_for block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('comp_for', {
  tiles: {
    for: {
      order: 1,
      fields: {
        label: 'for'
      },
      wrap: eYo.T3.Expr.target_list
    },
    in: {
      order: 2,
      fields: {
        label: 'in'
      },
      check: eYo.T3.Expr.Check.or_test,
      hole_value: 'name'
    }
  }
})

/**
 * Class for a DelegateSvg, comp_if block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('comp_if', {
  tiles: {
    if: {
      order: 1,
      fields: {
        label: 'if'
      },
      check: eYo.T3.Expr.Check.expression_nocond,
      hole_value: 'yorn'
    }
  }
})

/**
 * Class for a DelegateSvg, comp_iter_list block.
 * This block may be sealed.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('comp_iter_list', {
  list: {
    check: eYo.T3.Expr.Check.comp_iter,
    empty: true,
    presep: ','
  }
})

/**
 * Class for a DelegateSvg, dict comprehension value block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('dict_comprehension', {
  tiles: {
    key: {
      order: 1,
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'key'
    },
    datum: {
      order: 2,
      fields: {
        label: ':'
      },
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'value'
    },
    for: {
      order: 3,
      fields: {
        label: 'for'
      },
      wrap: eYo.T3.Expr.target_list
    },
    in: {
      order: 4,
      fields: {
        label: 'in'
      },
      check: eYo.T3.Expr.Check.or_test,
      hole_value: 'name'
    },
    for_if: { // that name is so ugly
      order: 5,
      wrap: eYo.T3.Expr.comp_iter_list
    }
  }
})

/**
 * Class for a DelegateSvg, key_datum block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('key_datum_s3d', {
  xml: {
    tag: 'key_datum',
  },
  tiles: {
    key: {
      order: 1,
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'key'
    },
    datum: {
      order: 2,
      fields: {
        label: ':'
      },
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'value'
    }
  }
})

eYo.DelegateSvg.Comprehension.T3s = [
  eYo.T3.Expr.comprehension,
  eYo.T3.Expr.comp_for,
  eYo.T3.Expr.comp_if,
  eYo.T3.Expr.comp_iter_list,
  eYo.T3.Expr.dict_comprehension,
  eYo.T3.Expr.term,
  eYo.T3.Expr.key_datum_s3d,
]

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
ezP.DelegateSvg.Expr.comprehension = function (prototypeName) {
  ezP.DelegateSvg.Expr.comprehension.superClass_.constructor.call(this, prototypeName)
  this.inputModel_ = {
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
  }
  this.outputModel_ = {
    check: ezP.T3.Expr.comprehension,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.comprehension, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('comprehension')

/**
 * Class for a DelegateSvg, comp_for block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.comp_for = function (prototypeName) {
  ezP.DelegateSvg.Expr.comp_for.superClass_.constructor.call(this, prototypeName)
  this.inputModel_ = {
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
  this.outputModel_ = {
    check: ezP.T3.Expr.comp_for,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.comp_for, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('comp_for')

/**
 * Class for a DelegateSvg, comp_if block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.comp_if = function (prototypeName) {
  ezP.DelegateSvg.Expr.comp_if.superClass_.constructor.call(this, prototypeName)
  this.inputModel_ = {
    m_1: {
      key: ezP.Key.IF,
      label: 'if',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.expression_nocond,
      hole_value: 'yorn',
    }
  }
  this.outputModel_ = {
    check: ezP.T3.Expr.comp_if,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.comp_if, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('comp_if')

/**
 * Class for a DelegateSvg, comp_iter_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.comp_iter_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.comp_iter_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.list = {
    check: ezP.T3.Expr.Check.comp_iter,
    empty: true,
    sep: ',',
  }
  this.outputModel_ = {
    check: ezP.T3.Expr.comp_iter_list,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.comp_iter_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('comp_iter_list')

/**
 * Class for a DelegateSvg, comprehension value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
// dict_comprehension ::= expression ":" expression comp_for
ezP.DelegateSvg.Expr.dict_comprehension = function (prototypeName) {
  ezP.DelegateSvg.Expr.dict_comprehension.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.m_1 = {
    insert:
  ezP.T3.Expr.key_datum_concrete,
  }
  this.outputModel_ = {
    check: ezP.T3.Expr.dict_comprehension,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.dict_comprehension, ezP.DelegateSvg.Expr.comprehension)
ezP.DelegateSvg.Manager.register('dict_comprehension')

/**
 * Class for a DelegateSvg, key_datum_concrete block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.key_datum_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.key_datum_concrete.superClass_.constructor.call(this, prototypeName)
  this.outputModel_ = {
    check: ezP.T3.Expr.key_datum_concrete,
  }
  this.inputModel_ = {
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
}
goog.inherits(ezP.DelegateSvg.Expr.key_datum_concrete, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('key_datum_concrete')

/**
 * Class for a DelegateSvg, generator expression block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.generator_expression = function (prototypeName) {
  ezP.DelegateSvg.Expr.generator_expression.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.prefix = {
    label: '(',
  }
  this.inputModel_.suffix = {
    label: ')',
  }
  this.outputModel_ = {
    awaitable: true,
    check: ezP.T3.Expr.generator_expression,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.generator_expression, ezP.DelegateSvg.Expr.comprehension)

ezP.DelegateSvg.Manager.register('generator_expression')

ezP.DelegateSvg.Comprehension.T3s = [
  ezP.T3.Expr.comprehension,
  ezP.T3.Expr.comp_for,
  ezP.T3.Expr.comp_if,
  ezP.T3.Expr.comp_iter_list,
  ezP.T3.Expr.dict_comprehension,
  ezP.T3.Expr.key_datum_concrete,
  ezP.T3.Expr.generator_expression
]
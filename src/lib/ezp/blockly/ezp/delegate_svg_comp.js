/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Expr.Comprehension')

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
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.EXPR,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'name',
    },
    middle: {
      key: ezP.Const.Input.FOR,
      wrap: ezP.T3.Expr.comp_for,
    },
    last: {
      key: ezP.Const.Input.ITER,
      wrap: ezP.T3.Expr.comp_iter_list,
    }
  }
  this.outputCheck = ezP.T3.Expr.comprehension
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
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.FOR,
      label: 'for',
      wrap: ezP.T3.Expr.target_list,
    },
    last: {
      key: ezP.Const.Input.IN,
      label: 'in',
      check: ezP.T3.Expr.Check.or_test,
      hole_value: 'name',
    }
  }
  this.outputCheck = ezP.T3.Expr.comp_for
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
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.IF,
      label: 'if',
      check: ezP.T3.Expr.Check.expression_nocond
    }
  }
  this.outputCheck = ezP.T3.Expr.comp_if
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
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Expr.Check.comp_iter,true,'')
  this.outputCheck = ezP.T3.Expr.comp_iter_list
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
  this.inputData_.first.wrap =
  this.inputData_.first.check = ezP.T3.Expr.key_datum_concrete,
  this.outputCheck = ezP.T3.Expr.dict_comprehension
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
  this.outputCheck = ezP.T3.Expr.key_datum_concrete
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.KEY,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'key',
    },
    last: {
      key: ezP.Const.Input.DATUM,
      check: ezP.T3.Expr.Check.expression,
      label: ':',
      hole_value: 'value',
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr.key_datum_concrete, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('key_datum_concrete')

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

goog.provide('ezP.DelegateSvg.Try')

goog.require('ezP.DelegateSvg.Group')

/**
 * Class for a DelegateSvg, try_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.try_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.try_part.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.m_1 = {
    dummy: 'try',
    css_class: 'ezp-code-reserved',
  }
  this.statementModel__.previous.check = ezP.T3.Stmt.Previous.try_part
  this.statementModel__.next.check = ezP.T3.Stmt.Next.try_part
}
goog.inherits(ezP.DelegateSvg.Stmt.try_part, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register('try_part')

/**
 * Class for a DelegateSvg, expression_as_name block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.expression_as_name = function (prototypeName) {
  ezP.DelegateSvg.Expr.expression_as_name.superClass_.constructor.call(this, prototypeName)
  this.inputModel__ = {
    m_1: {
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    m_3: {
      key: ezP.Key.AS,
      label: 'as',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.identifier,
      hole_value: 'name',
    }
  }
  this.outputModel__ = {
    check: ezP.T3.Expr.expression_as_name,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.expression_as_name, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('expression_as_name')


/**
 * Class for a DelegateSvg, except_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.except_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.except_part.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.m_1 = {
    key: ezP.Key.EXPRESSION,
    label: 'except',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.expression_except,
    hole_value: 'expression',
  }
  this.statementModel__.previous.check = ezP.T3.Stmt.Previous.except_part
  this.statementModel__.next.check = ezP.T3.Stmt.Next.except_part
}
goog.inherits(ezP.DelegateSvg.Stmt.except_part, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register('except_part')

/**
 * Class for a DelegateSvg, void_except_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.void_except_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.void_except_part.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.m_1 = {
    dummy: 'except',
    css_class: 'ezp-code-reserved',
  }
  this.statementModel__.previous.check = ezP.T3.Stmt.Previous.void_except_part
  this.statementModel__.next.check = ezP.T3.Stmt.Next.void_except_part
}
goog.inherits(ezP.DelegateSvg.Stmt.void_except_part, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register('void_except_part')

/**
 * Class for a DelegateSvg, finally_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.finally_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.finally_part.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.m_1 = {
    dummy: 'finally',
    css_class: 'ezp-code-reserved',
  }
  this.statementModel__.previous.check = ezP.T3.Stmt.Previous.finally_part
  this.statementModel__.next.check = ezP.T3.Stmt.Next.finally_part
}
goog.inherits(ezP.DelegateSvg.Stmt.finally_part, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register('finally_part')

/**
 * Class for a DelegateSvg, expression_from block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.expression_from = function (prototypeName) {
  ezP.DelegateSvg.Expr.expression_from.superClass_.constructor.call(this, prototypeName)
  this.inputModel__ = {
    m_1: {
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    m_3: {
      label: 'from',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.FROM,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    }
  }
  this.outputModel__ = {
    check: ezP.T3.Expr.expression_from,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.expression_from, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('expression_from')

/**
 * Class for a DelegateSvg, raise_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.raise_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.raise_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputModel__ = {
    m_1: {
      label: 'raise',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.RAISE,
      check: ezP.T3.Expr.Check.raise_expression,
    }
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.raise_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('raise_stmt')

/**
 * Class for a DelegateSvg, reraise_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.reraise_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.reraise_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputModel__ = {
    m_1: {
      label: 'raise',
      css_class: 'ezp-code-reserved',
    }
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.reraise_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('reraise_stmt')

/**
 * Class for a DelegateSvg, assert_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.assert_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.assert_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputModel__ = {
    m_1: {
      label: 'assert',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.ASSERT,
      check: ezP.T3.Expr.Check.expression
    },
    m_3: {
      label: ',',
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.expression,
      optional: true
    }
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.assert_stmt, ezP.DelegateSvg.Stmt.Two)
ezP.DelegateSvg.Manager.register('assert_stmt')

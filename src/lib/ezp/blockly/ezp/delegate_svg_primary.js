/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython, primary blocks.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Primary')

goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, attributeref.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Primary = function (prototypeName) {
  ezP.DelegateSvg.Primary.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.m_1 = {
    key: ezP.Key.PRIMARY,
    check: ezP.T3.Expr.Check.primary,
    plugged: ezP.T3.Expr.primary,
    hole_value: 'primary',
  }
}
goog.inherits(ezP.DelegateSvg.Primary, ezP.DelegateSvg.Expr)

/**
 * The primary connection if any.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.prototype.getPrimaryConnection = function (block) {
  return undefined
}

/**
 * The primary connection if any.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Primary.prototype.getPrimaryConnection = function (block) {
  // var input = block.getInput(ezP.Key.PRIMARY)
  return this.model.m_1.input.connection
}

/**
 * Class for a DelegateSvg, attributeref.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.attributeref = function (prototypeName) {
  ezP.DelegateSvg.Expr.attributeref.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.m_3 = {
    label: '.',
    key: ezP.Key.ATTRIBUTE,
    check: ezP.T3.Expr.identifier,
    plugged: ezP.T3.Expr.attribute_identifier,
    hole_value: 'attribute',
  }
  this.outputModel_ = {
    check: ezP.T3.Expr.attributeref ,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.attributeref, ezP.DelegateSvg.Primary)
ezP.DelegateSvg.Manager.register('attributeref')

/**
 * Class for a DelegateSvg, subscription and slicing.
 * Due to the ambibuity, it is implemented only once for both.
 * Slicing is richer.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.subscription = ezP.DelegateSvg.Expr.slicing = function (prototypeName) {
  ezP.DelegateSvg.Expr.slicing.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.m_3 = {
    key: ezP.Key.LIST,
    wrap: ezP.T3.Expr.display_slice_list,
  }
  this.outputModel_ = {
    check: [ezP.T3.Expr.subscription, ezP.T3.Expr.slicing],
  }
}
goog.inherits(ezP.DelegateSvg.Expr.slicing, ezP.DelegateSvg.Primary)
ezP.DelegateSvg.Manager.register('slicing')
ezP.DelegateSvg.Manager.register('subscription')

/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Due to the ambibuity, it is implemented only once for both.
 * Slicing is richer.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.call_expr =  function (prototypeName) {
  ezP.DelegateSvg.Expr.call_expr.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.m_3 = {
    key: ezP.Key.LIST,
    start: '(',
    wrap: ezP.T3.Expr.argument_list,
    end: ')',
  }
  this.outputModel_ = {
    check: ezP.T3.Expr.call_expr,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.call_expr, ezP.DelegateSvg.Primary)
ezP.DelegateSvg.Manager.register('call_expr')

/**
 * Class for a DelegateSvg, sum block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.sum_builtin = function (prototypeName) {
  ezP.DelegateSvg.Expr.sum_builtin.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.m_1 = {
    dummy: 'sum',
    css_class: 'ezp-code-builtin',
  }
}
goog.inherits(ezP.DelegateSvg.Expr.sum_builtin, ezP.DelegateSvg.Expr.call_expr)
ezP.DelegateSvg.Manager.register('sum_builtin')

/**
 * Class for a DelegateSvg, len block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.len_builtin = function (prototypeName) {
  ezP.DelegateSvg.Expr.len_builtin.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.m_1 = {
    dummy: 'len',
    css_class: 'ezp-code-builtin',
  }
}
goog.inherits(ezP.DelegateSvg.Expr.len_builtin, ezP.DelegateSvg.Expr.call_expr)
ezP.DelegateSvg.Manager.register('len_builtin')

/**
 * Class for a DelegateSvg, list block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.list_builtin = function (prototypeName) {
  ezP.DelegateSvg.Expr.list_builtin.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.m_1 = {
    dummy: 'list',
    css_class: 'ezp-code-builtin',
  }
}
goog.inherits(ezP.DelegateSvg.Expr.list_builtin, ezP.DelegateSvg.Expr.call_expr)
ezP.DelegateSvg.Manager.register('list_builtin')

/**
 * Class for a DelegateSvg, range block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.range_builtin = function (prototypeName) {
  ezP.DelegateSvg.Expr.range_builtin.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.m_1 = {
    dummy: 'range',
    css_class: 'ezp-code-builtin',
  }
}
goog.inherits(ezP.DelegateSvg.Expr.range_builtin, ezP.DelegateSvg.Expr.call_expr )
ezP.DelegateSvg.Manager.register('range_builtin')

/**
 * Class for a DelegateSvg, len block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.len_builtin = function (prototypeName) {
  ezP.DelegateSvg.Expr.len_builtin.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.m_1 = {
    dummy: 'len',
    css_class: 'ezp-code-builtin',
  }
}
goog.inherits(ezP.DelegateSvg.Expr.len_builtin, ezP.DelegateSvg.Expr.call_expr )
ezP.DelegateSvg.Manager.register('len_builtin')

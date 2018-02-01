/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython, primary blocks.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Expr.Primary')

goog.require('ezP.DelegateSvg.Expr')

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
  this.inputData = {
    first: {
      key: ezP.Const.Input.PRIMARY,
      check: ezP.T3.Check.primary
    },
    last: {
      key: ezP.Const.Input.SECONDARY,
      check: ezP.T3.identifier_dotted,
      wrap: ezP.Const.Expr.identifier_dotted
    }
  }
  this.outputCheck = ezP.T3.attributeref 
}
goog.inherits(ezP.DelegateSvg.Expr.attributeref, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.attributeref, ezP.DelegateSvg.Expr.attributeref)

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
  this.inputData = {
    first: {
      key: ezP.Const.Input.PRIMARY,
      check: ezP.T3.Check.primary
    },
    last: {
      key: ezP.Const.Input.SLICE,
      check: ezP.T3.display_slice_list,
      wrap: ezP.Const.Expr.display_slice_list
    }
  }
  this.outputCheck = ezP.T3.slicing
}
goog.inherits(ezP.DelegateSvg.Expr.slicing, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.slicing, ezP.DelegateSvg.Expr.slicing)

/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use call_block instead.
 * Due to the ambibuity, it is implemented only once for both.
 * Slicing is richer.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.call_block =  function (prototypeName) {
  ezP.DelegateSvg.Expr.call_block.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    first: {
      key: ezP.Const.Input.PRIMARY,
      check: ezP.T3.Check.primary
    },
    last: {
      key: ezP.Const.Input.ARGS,
      label: '(',
      check: ezP.T3.argument_list,
      wrap: ezP.Const.Expr.argument_list
    }
  }
  this.labelEnd = ')'
}
goog.inherits(ezP.DelegateSvg.Expr.call_block, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.call, ezP.DelegateSvg.Expr.call_block)

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

goog.provide('ezP.DelegateSvg.Lambda')

goog.require('ezP.DelegateSvg.Parameters')

/**
 * Class for a DelegateSvg, lambda_expr and lambda_expr_nocond block.
 * The only difference between lambda_expr and lambda_expr_nocond comes
 * from the type of the expression. We choose to gather the two blocks
 * and just change the check array depending on the type of the connected
 * expression. Whenever one of the connections connects or disconnects,
 * the checking policy changes accordingly. See the `updateLambdaCheck`
 * method of the connection's delegate.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('lambda_expression', {
  inputs: {
    i_1: {
      key: ezP.Key.PARAMETERS,
      label: 'lambda',
      css_class: 'ezp-code-reserved',
      wrap: ezP.T3.Expr.parameter_list,
    },
    i_3: {
      key: ezP.Key.EXPRESSION,
      label: ':',
      check: ezP.T3.Expr.Check.expression.concat(ezP.T3.Expr.Check.expression_nocond),
      didConnect: function(oldTargetConnection, oldConnectionn) {
        // `this` is a connection's delegate
        this.updateLambdaCheck()
      },
      didDisconnect: function(oldConnection) {
        // `this` is a connection's delegate
        this.updateLambdaCheck()
      },
    }
  },
  output: {
    check: [ezP.T3.Expr.lambda_expr, ezP.T3.Expr.lambda_expr_nocond],
    didConnect: function(oldTargetConnection, oldConnection) {
      // `this` is a connection's delegate
      this.updateLambdaCheck()
    },
    didDisconnect: function(oldConnection) {
      // `this` is a connection's delegate
      this.updateLambdaCheck()
    },
  }
})

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.lambda_expression.prototype.initBlock = function (block) {
  ezP.DelegateSvg.Expr.lambda_expression.superClass_.initBlock.call(this, block)
  block.outputConnection.ezp.updateLambdaCheck()
}

ezP.DelegateSvg.Expr.lambda_expr = ezP.DelegateSvg.Expr.lambda_expr_nocond = ezP.DelegateSvg.Expr.lambda_expression

ezP.DelegateSvg.Manager.register('lambda_expr')
ezP.DelegateSvg.Manager.register('lambda_expr_nocond')

ezP.ConnectionDelegate.prototype.updateLambdaCheck = function() {
  var block = this.connection.sourceBlock_
  if (block) {
    var c8nOut = block.outputConnection
    var input = block.getInput(ezP.Key.EXPRESSION)
    var c8nIn = input.connection
    var nocond_only_out = false
    var targetC8n = c8nOut.targetConnection
    if (targetC8n) {
      var nocond_only_out = targetC8n.check_.indexOf(ezP.T3.Expr.lambda_expr) < 0
    }
    var cond_in = true // cond are accepted by default
    var nocond_in = true // nocond not accepted by default
    targetC8n = c8nIn.targetConnection
    if (targetC8n) {
      cond_in = false
      for (var i = 0, t; (t = ezP.T3.Expr.Check.expression[++i]);) {
        if (targetC8n.check_.indexOf(t) >= 0) {
          cond_in = true
          break
        }
      }
      nocond_in = false
      for (var i = 0, t; (t = ezP.T3.Expr.Check.expression_nocond[++i]);) {
        if (targetC8n.check_.indexOf(t) >= 0) {
          nocond_in = true
          break
        }
      }
    }
    c8nIn.setCheck(nocond_only_out?
      ezP.T3.Expr.Check.expression_nocond:
      ezP.T3.Expr.Check.expression.concat(ezP.T3.Expr.Check.expression_nocond))
    c8nOut.setCheck(
      (cond_in?[ezP.T3.Expr.lambda_expr]: []).concat(nocond_in?[ezP.T3.Expr.lambda_expr_nocond]: [])
    )
  }
}

ezP.DelegateSvg.Lambda.T3s = [
  ezP.T3.Expr.lambda_expression,
  ezP.T3.Expr.lambda_expr,
  ezP.T3.Expr.lambda_expr_nocond
]

console.warn('no_cond not tested.')
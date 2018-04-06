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

goog.require('ezP.DelegateSvg.List')
goog.require('ezP.DelegateSvg.Expr')
goog.require('Blockly.RenderedConnection')
goog.require('Blockly.RenderedConnection')

/**
 * Class for a DelegateSvg, lambda_expr and lambda_expr_nocond block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.lambda_expression = function (prototypeName) {
  ezP.DelegateSvg.Expr.lambda_expression.superClass_.constructor.call(this, prototypeName)
  this.model__.input = {
    m_1: {
      key: ezP.Key.LIST,
      label: 'lambda',
      css_class: 'ezp-code-reserved',
      wrap: ezP.T3.Expr.parameter_list,
    },
    m_3: {
      key: ezP.Key.EXPRESSION,
      label: ':',
      check: ezP.T3.Expr.Check.expression.concat(ezP.T3.Expr.Check.expression_nocond),
      didConnect: function(oldTargetConnection, oldConnectionn) {
        this.updateLambdaCheck()
      },
      didDisconnect: function(oldTargetConnection) {
        this.updateLambdaCheck()
      },
    }
  }
  this.outputModel__ = {
    check: [ezP.T3.Expr.lambda_expr, ezP.T3.Expr.lambda_expr_nocond],
    didConnect: function(oldTargetConnection, oldConnection) {
      this.updateLambdaCheck()
    },
    didDisconnect: function(oldTargetConnection) {
      this.updateLambdaCheck()
    },
  }
}
goog.inherits(ezP.DelegateSvg.Expr.lambda_expression, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('lambda_expression')

ezP.DelegateSvg.Expr.lambda_expr = ezP.DelegateSvg.Expr.lambda_expr_nocond = ezP.DelegateSvg.Expr.lambda_expression

ezP.DelegateSvg.Manager.register('lambda_expr')
ezP.DelegateSvg.Manager.register('lambda_expr_nocond')

ezP.ConnectionDelegate.prototype.updateLambdaCheck = function() {
  var block = this.connection.sourceBlock_
  if (block) {
    var c8nOut = block.outputConnection
    var c8nIn = block.ezp.uiModel.m_3.input.connection
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

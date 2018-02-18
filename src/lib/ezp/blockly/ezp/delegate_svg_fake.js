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

goog.provide('ezP.DelegateSvg.Fake')
goog.require('ezP.DelegateSvg.Expr')
goog.forwardDeclare('ezP.BlockSvg')

/**
 * Class for a DelegateSvg.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Fake = function (prototypeName) {
  ezP.DelegateSvg.Fake.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Fake, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.registerDelegate_('ezp_expr_fake', ezP.DelegateSvg.Fake)

ezP.DelegateSvg.Fake.WithWrapped = function (prototypeName) {
  ezP.DelegateSvg.Fake.WithWrapped.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Fake.WithWrapped, ezP.DelegateSvg.Fake)

ezP.DelegateSvg.Manager.registerDelegate_('ezp_expr_fake_with_wrapped', ezP.DelegateSvg.Fake.WithWrapped)

ezP.DelegateSvg.Fake.WithWrapped.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Fake.WithWrapped.superClass_.initBlock.call(this, block)
  var input = block.appendValueInput('FAKE').appendField(new ezP.FieldLabel('with sealed'))
  input.ezpData.connection.ezp.wrapped_ = true
  block.setOutput(true, null)
}

ezP.DelegateSvg.Fake.Wrapped = function (prototypeName) {
  ezP.DelegateSvg.Fake.Wrapped.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Fake.Wrapped, ezP.DelegateSvg.Fake)

ezP.DelegateSvg.Manager.registerDelegate_('ezp_expr_fake_wrapped', ezP.DelegateSvg.Fake.Wrapped)

ezP.DelegateSvg.Fake.Wrapped.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Fake.Wrapped.superClass_.initBlock.call(this, block)
  block.appendDummyInput().appendField(new ezP.FieldLabel('sealed'))
  block.setOutput(true, null)
}

/**
 * Render the leading # character for collapsed statement blocks.
 * Statement subclasses must override it.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Fake.prototype.renderDrawSharp_ = function (io) {
  return
}

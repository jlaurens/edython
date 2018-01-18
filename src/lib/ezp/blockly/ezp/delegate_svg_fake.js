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
goog.require('ezP.DelegateSvg.Xpr')
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
goog.inherits(ezP.DelegateSvg.Fake, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register('ezp_xpr_fake', ezP.DelegateSvg.Fake)

ezP.DelegateSvg.Fake.WithSealed = function (prototypeName) {
  ezP.DelegateSvg.Fake.WithSealed.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Fake.WithSealed, ezP.DelegateSvg.Fake)

ezP.DelegateSvg.Manager.register('ezp_xpr_fake_with_sealed', ezP.DelegateSvg.Fake.WithSealed)

ezP.DelegateSvg.Fake.WithSealed.prototype.initBlock = function(block) {
  var input = block.appendValueInput('FAKE').appendField(new ezP.FieldLabel('with sealed'))
  input.ezpData = {sealed_: true}
  block.setOutput(true, null)
}

ezP.DelegateSvg.Fake.Sealed = function (prototypeName) {
  ezP.DelegateSvg.Fake.Sealed.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Fake.Sealed, ezP.DelegateSvg.Fake)

ezP.DelegateSvg.Manager.register('ezp_xpr_fake_sealed', ezP.DelegateSvg.Fake.Sealed)

ezP.DelegateSvg.Fake.Sealed.prototype.initBlock = function(block) {
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

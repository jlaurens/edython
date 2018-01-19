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

goog.provide('ezP.DelegateSvg.Xpr.Comprehension')

goog.require('ezP.DelegateSvg.List')

/**
 * Class for a DelegateSvg, comprehension value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.Comprehension = function (prototypeName) {
  ezP.DelegateSvg.Xpr.Comprehension.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.ListConsolidator.Comprehension()
}
goog.inherits(ezP.DelegateSvg.Xpr.Comprehension, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.comprehension, ezP.DelegateSvg.Xpr.Comprehension)


/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * The FOR value is a connection to a sealed block
 * This connection will be sent far away to prevent block (dis)connection.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.Comprehension.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.Comprehension.superClass_.initBlock.call(this, block)
  block.appendValueInput(ezP.Const.Input.XPR)
    .setCheck(ezP.T3.Require.expression)
  this.inputFOR = block.appendSealedValueInput(ezP.Const.Input.FOR)
    .setCheck(ezP.Type.Xpr.target_list)
    .appendField(new ezP.FieldLabel('for'))
  this.inputIN = block.appendValueInput(ezP.Const.Input.IN)
    .setCheck(ezP.T3.Require.or_test)
    .appendField(new ezP.FieldLabel('in'))
    block.appendValueInput('ITEM_0')
    .setCheck(ezP.T3.Require.comp_iter)
  block.setInputsInline(true)
  block.setOutput(true, ezP.T3.comprehension)
  block.setTooltip('')
  block.setHelpUrl('')
}

/**
 * Create a sealed node for the comprehension if necessary.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.Comprehension.prototype.completeSealed = function (block) {
  this.completeSealedInput(block,
    this.inputFOR,
    ezP.Const.Xpr.target_list)
}

/**
 * Render list inputs only.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Xpr.Comprehension.prototype.renderDrawInput_ = function (io) {
  this.renderDrawListInput_(io)
  || this.renderDrawValueInput_(io)
}

/**
 * Fetches the named input object, forwards to getInputIter_.
 * @param {!Blockly.Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
ezP.DelegateSvg.Xpr.Comprehension.prototype.getInput = function (block, name) {
  var input = this.getInputIter_(block, name)
  return input === null
    ? ezP.DelegateSvg.Xpr.prototype.getInput.call(this, block, name)
    : input
}

/**
 * Fetches the named input object.
 * @param {!Blockly.Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 * The undefined return value for the default block getInput implementation.
 */
ezP.DelegateSvg.Xpr.Comprehension.prototype.getInputIter_ = function (block, name) {
  if (!name.length) {
    return null
  }
  var L = name.split('_')
  if (L.length !== 2 || L[0] !== 'ITEM') {
    return null
  }
  var n = parseInt(L[1])
  if (isNaN(n)) {
    return null
  }
  this.consolidate(block)
  var list = block.inputList
  var i = 2
  var input
  while ((input = list[i])) {
    var ezp = input.ezpListData
    if (!ezp) {
      ++i
      continue
    }
    var already = 0
    do {
      if (!ezp.isSeparator) {
        if (ezp.n === n) {
          return input
        }
        ++already
      }
    } while ((input = list[++i]) && (ezp = input.ezpListData))
    var c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, 'S7R_' + (n + 1), block, c8n)
    ezp = input.ezpListData = {n: n + 1, isSeparator: true}
    list.splice(i, 0, input)
    c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, name, block, c8n)
    ezp = input.ezpListData = {n: n}
    list.splice(i, 0, input)
    return input
  }
  return null
}

/**
 * Render the fields of a tuple input, if relevant.
 * @param {!Blockly.Block} The block.
 * @param {!Blockly.Input} Its input.
 * @private
 */
ezP.DelegateSvg.Xpr.Comprehension.prototype.renderDrawListInput_ = function (io) {
  if (!io.canList) {
    return false
  }
  var ezp = io.input.ezpListData
  if (!ezp) {
    return false
  }
  if (!this.inputIN.connection.isConnected()) {
    return true
  }
  return ezP.DelegateSvg.Xpr.Comprehension.superClass_.renderDrawListInput_.call(this, io)
}

/**
 * Class for a DelegateSvg, generator expression block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.generator_expression = function (prototypeName) {
  ezP.DelegateSvg.Xpr.generator_expression.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.generator_expression, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.generator_expression, ezP.DelegateSvg.Xpr.generator_expression)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.generator_expression.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.generator_expression.superClass_.initBlock.call(this, block)
  this.inputCOMPREHENSION = block.appendSealedValueInput(ezP.Const.Input.COMPREHENSION)
    .setCheck(ezP.T3.Require.comprehension)
    .appendField(new ezP.FieldLabel('('))
  block.appendDummyInput().appendField(new ezP.FieldLabel(')'))
  block.setInputsInline(true)
  block.setOutput(true, ezP.T3.generator_expression)
  block.setTooltip('')
  block.setHelpUrl('')
}

/**
 * Create a sealed node for the comprehension if necessary.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.generator_expression.prototype.completeSealed = function (block) {
  this.completeSealedInput(block,
    this.inputCOMPREHENSION,
    ezP.Const.Xpr.comprehension)
}

/**
 * Class for a DelegateSvg, comp_for block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.comp_for = function (prototypeName) {
  ezP.DelegateSvg.Xpr.comp_for.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.comp_for, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.comp_for, ezP.DelegateSvg.Xpr.comp_for)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.comp_for.prototype.initBlock = function(block) {
  this.appendValueInput(ezP.Const.Input.TGT)
    .setCheck(ezP.T3.Require.target_list)
    .appendField(new ezP.FieldLabel('for'))
  this.appendValueInput(ezP.Const.Input.LST)
    .setCheck(ezP.T3.Require.or_test)
    .appendField(new ezP.FieldLabel('in'))
  this.setOutput(true, ezP.Type.Xpr.Provide.comp_for)
}

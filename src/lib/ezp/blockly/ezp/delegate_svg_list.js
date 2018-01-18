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

goog.provide('ezP.DelegateSvg.List')

goog.require('ezP.DelegateSvg.ListConsolidator')
goog.require('ezP.DelegateSvg.Xpr')

/**
 * Class for a DelegateSvg, value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List = function (prototypeName) {
  ezP.DelegateSvg.List.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.DelegateSvg.ListConsolidator()
}
goog.inherits(ezP.DelegateSvg.List, ezP.DelegateSvg.Xpr)

/**
 * Will render the block.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.List.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.List.superClass_.willRender_.call(this, block)
  this.consolidate(block)
}

/**
 * Render list inputs only.
 * @param io.
 * @private
 */
ezP.DelegateSvg.List.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
  this.renderDrawListInput_(io)
}

/**
 * Render the fields of a tuple input, if relevant.
 * @param {!Blockly.Block} The block.
 * @param {!Blockly.Input} Its input.
 * @private
 */
ezP.DelegateSvg.List.prototype.renderDrawListInput_ = function (io) {
  if (!io.canList) {
    return false
  }
  var ezp = io.input.ezpListData
  if (!ezp) {
    return false
  }
  var c8n = io.input.connection
  this.renderDrawFields_(io)
  c8n.setOffsetInBlock(io.cursorX, 0)
  if (c8n.isConnected()) {
    var target = c8n.targetBlock()
    var root = target.getSvgRoot()
    if (root) {
      var bBox = target.getHeightWidth()
      root.setAttribute('transform', 'translate(' + io.cursorX + ', 0)')
      io.cursorX += bBox.width
      target.render()
    }
  } else if (ezp.isSeparator) {
    var pw = this.carretPathDefWidth_(io.cursorX)
    var w = pw.width
    c8n.setOffsetInBlock(io.cursorX, 0)
    io.steps.push(pw.d)
    io.cursorX += pw.width
  } else {
    pw = this.placeHolderPathDefWidth_(io.cursorX)
    io.steps.push(pw.d)
    io.cursorX += pw.width
  }
  return true
}

/**
 * Fetches the named input object, forwards to getInputTuple_.
 * @param {!Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
ezP.DelegateSvg.List.prototype.getInput = function (block, name) {
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
  var i = 0
  var input
  while ((input = list[i])) {
    var ezp = input.ezpListData
    if (!ezp) {
      ++i
      continue
    }
    do {
      if (!ezp.isSeparator) {
        if (ezp.n === n) {
          return input
        }
      } else {
        var sep = ezp.sep
      }
    } while ((input = list[++i]) && (ezp = input.ezp))
    var c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, 'S7R_' + (n + 1), block, c8n)
    input.ezpListData = {n: n + 1, sep: sep, isSeparator: true}
    input.appendField(new Blockly.FieldLabel(sep || this.consolidator.defaultSep))
    list.splice(i, 0, input)
    c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, name, block, c8n)
    input.ezpListData = {n: n, sep: sep}
    list.splice(i, 0, input)
    return input
  }
  return null
}

/**
 * Consolidate the input.
 * Removes empty place holders
 * @param {!Block} block.
 */
ezP.DelegateSvg.List.prototype.consolidate = function (block) {
  this.consolidator.consolidate(block)
}

/**
 * Class for a DelegateSvg, parenth_form.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.parenth_form = function (prototypeName) {
  ezP.DelegateSvg.List.parenth_form.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.List.parenth_form, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.parenth_form, ezP.DelegateSvg.List.parenth_form)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.List.parenth_form.prototype.initBlock = function(block) {
  ezP.DelegateSvg.List.parenth_form.superClass_.initBlock.call(this, block)
  var field = new ezP.FieldLabel('(')
  field.ezpFieldData = {x_shift: ezP.Font.space/4}
  block.appendDummyInput().appendField(field)
  block.appendValueInput('ITEM_0')
  var field = new ezP.FieldLabel(')')
  field.ezpFieldData = {x_shift: -ezP.Font.space/4}
  block.appendDummyInput().appendField(field)
  block.setOutput(true, ezP.T3.parenth_form)
}

/**
 * The right padding of a block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.List.parenth_form.prototype.paddingRight = function (block) {
  return 0 
}

/**
 * The left padding of a block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.List.parenth_form.prototype.paddingLeft = function (block) {
  return 0 
}

/**
 * Class for a DelegateSvg, value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.list_display = function (prototypeName) {
  ezP.DelegateSvg.List.list_display.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.DelegateSvg.ListDisplayConsolidator()
}
goog.inherits(ezP.DelegateSvg.List.list_display, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.list_display, ezP.DelegateSvg.List.list_display)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.List.list_display.prototype.initBlock = function(block) {
  ezP.DelegateSvg.List.list_display.superClass_.initBlock.call(this, block)
  var field = new ezP.FieldLabel('[')
  field.ezpFieldData = {x_shift: ezP.Font.space/4}
  block.appendDummyInput().appendField(field)
  block.appendValueInput('ITEM_0')
  var field = new ezP.FieldLabel(']')
  field.ezpFieldData = {x_shift: -ezP.Font.space/4}
  block.appendDummyInput().appendField(field)
  block.setOutput(true, ezP.T3.primary)
}

/**
 * The right padding of a block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.List.list_display.prototype.paddingRight = function (block) {
  return 0 
}

/**
 * The left padding of a block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.List.list_display.prototype.paddingLeft = function (block) {
  return 0 
}

/**
 * Class for a DelegateSvg, set display block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.set_display = function (prototypeName) {
  ezP.DelegateSvg.List.set_display.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.List.set_display, ezP.DelegateSvg.List.list_display)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.set_display, ezP.DelegateSvg.List.set_display)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.List.set_display.prototype.initBlock = function(block) {
  ezP.DelegateSvg.List.list_display.superClass_.initBlock.call(this, block)
  var field = new ezP.FieldLabel('{')
  field.ezpFieldData = {x_shift: ezP.Font.space/4}
  block.appendDummyInput().appendField(field)
  block.appendValueInput('ITEM_0')
  var field = new ezP.FieldLabel('}')
  field.ezpFieldData = {x_shift: -ezP.Font.space/4}
  block.appendDummyInput().appendField(field)
  block.setOutput(true, ezP.T3.primary)
}

/**
 * Class for a DelegateSvg, dict display block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.dict_display = function (prototypeName) {
  ezP.DelegateSvg.List.dict_display.superClass_.constructor.call(this, prototypeName)
  
  this.consolidator = new ezP.DelegateSvg.DictDisplayConsolidator()
}
goog.inherits(ezP.DelegateSvg.List.dict_display, ezP.DelegateSvg.List.set_display)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.dict_display, ezP.DelegateSvg.List.dict_display)


/**
 * Class for a DelegateSvg, target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.target = function (prototypeName) {
  ezP.DelegateSvg.List.target.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.DelegateSvg.TargetConsolidator()
}
goog.inherits(ezP.DelegateSvg.List.target, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.target_list, ezP.DelegateSvg.List.target)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.List.target.prototype.initBlock = function(block) {
  ezP.DelegateSvg.List.target.superClass_.initBlock.call(this, block)
  block.appendValueInput('ITEM_0')
  block.setOutput(true, ezP.T3.target_list)
}


/**
 * Class for a DelegateSvg, expression_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.expression = function (prototypeName) {
  ezP.DelegateSvg.List.expression.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.DelegateSvg.ExpressionConsolidator()
}
goog.inherits(ezP.DelegateSvg.List.expression, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.expression_list, ezP.DelegateSvg.List.expression)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.List.expression.prototype.initBlock = function(block) {
  ezP.DelegateSvg.List.target.superClass_.initBlock.call(this, block)
  block.appendValueInput('ITEM_0')
  block.setOutput(true, ezP.T3.expression_list)
}

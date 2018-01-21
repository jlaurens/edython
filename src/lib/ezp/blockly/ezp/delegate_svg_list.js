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

goog.require('ezP.Consolidator.List')
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
  var ezp = io.input.ezpData
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
  } else if (ezp.s7r_) {
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
    var ezp = input.ezpData
    if (!ezp) {
      ++i
      continue
    }
    do {
      if (!ezp.s7r_) {
        if (ezp.n === n) {
          return input
        }
      } else {
        var sep = ezp.sep
      }
    } while ((input = list[++i]) && (ezp = input.ezp))
    var c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, 'S7R_' + (n + 1), block, c8n)
    ezP.setupEzpData(input)
    goog.mixin(input.ezpData,{n: n + 1, sep: sep, s7r_: true})
    input.appendField(new Blockly.FieldLabel(sep || this.consolidator.defaultSep))
    list.splice(i, 0, input)
    c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, name, block, c8n)
    ezP.setupEzpData(input)
    goog.mixin(input.ezpData, {n: n, sep: sep})
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

ezP.DelegateSvg.List.prototype.outputType = undefined
ezP.DelegateSvg.List.prototype.consolidator = undefined

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.List.prototype.initBlock = function(block) {
  ezP.DelegateSvg.List.superClass_.initBlock.call(this, block)
  block.appendValueInput('ITEM_0')
  block.setOutput(true, this.outputType)
}

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
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Require.target_list, false, ',')
  this.outputType = ezP.T3.target_list
}
goog.inherits(ezP.DelegateSvg.List.target, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.target_list, ezP.DelegateSvg.List.target)

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
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Require.expression, false, ',')
  this.outputType = ezP.T3.expression_list
}
goog.inherits(ezP.DelegateSvg.List.expression, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.expression_list, ezP.DelegateSvg.List.expression)

/**
 * Class for a DelegateSvg, starred_expression_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.starred_expression_list = function (prototypeName) {
  ezP.DelegateSvg.Xpr.starred_expression_list.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Require.starred_item, true, ',')
  this.outputType = ezP.T3.starred_expression_list
}
goog.inherits(ezP.DelegateSvg.Xpr.starred_expression_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.starred_expression_list, ezP.DelegateSvg.Xpr.starred_expression_list)

/**
 * Class for a DelegateSvg, key_datum_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.key_datum = function (prototypeName) {
  ezP.DelegateSvg.List.key_datum.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Require.key_datum,true,',')
  this.outputType = ezP.T3.key_datum_list
}
goog.inherits(ezP.DelegateSvg.List.key_datum, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.key_datum_list, ezP.DelegateSvg.List.key_datum)

/**
 * Class for a DelegateSvg, starred_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.starred_list_comprehensive = function (prototypeName) {
  ezP.DelegateSvg.Xpr.starred_list_comprehensive.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List.Singled(
    ezP.T3.Require.starred_list,
    ezP.T3.comprehension,
    ezP.T3.Require.starred_list_comprehensive,
    true,',')
  this.outputType = ezP.T3.starred_list_comprehensive
}
goog.inherits(ezP.DelegateSvg.Xpr.starred_list_comprehensive, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.starred_list_comprehensive, ezP.DelegateSvg.Xpr.starred_list_comprehensive)

/**
 * Class for a DelegateSvg, non_void_starred_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.non_void_starred_list_comprehensive = function (prototypeName) {
  ezP.DelegateSvg.Xpr.non_void_starred_list_comprehensive.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List.Singled(
    ezP.T3.Require.starred_list,
    ezP.T3.comprehension,
    ezP.T3.Require.starred_list_comprehensive,
    false,',')
  this.outputType = ezP.T3.non_void_starred_list_comprehensive
}
goog.inherits(ezP.DelegateSvg.Xpr.non_void_starred_list_comprehensive, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.non_void_starred_list_comprehensive, ezP.DelegateSvg.Xpr.non_void_starred_list_comprehensive)

/**
 * Class for a DelegateSvg, key_datum_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.key_datum_list_comprehensive = function (prototypeName) {
  ezP.DelegateSvg.Xpr.key_datum_list_comprehensive.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List.Singled(
    ezP.T3.Require.key_datum_list,
    ezP.T3.dict_comprehension,
    ezP.T3.Require.key_datum_list_comprehensive,
    true,',')
  this.outputType = ezP.T3.key_datum_list_comprehensive
}
goog.inherits(ezP.DelegateSvg.Xpr.key_datum_list_comprehensive, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.key_datum_list_comprehensive, ezP.DelegateSvg.Xpr.key_datum_list_comprehensive)


/**
 * Class for a DelegateSvg, comp_iter_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.comp_iter_list = function (prototypeName) {
  ezP.DelegateSvg.Xpr.comp_iter_list.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Require.comp_iter,true,'')
  this.outputType = ezP.T3.comp_iter_list
}
goog.inherits(ezP.DelegateSvg.Xpr.comp_iter_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.comp_iter_list, ezP.DelegateSvg.Xpr.comp_iter_list)

/**
 * Class for a DelegateSvg, expression_or_from_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.expression_or_from_list = function (prototypeName) {
  ezP.DelegateSvg.Xpr.expression_or_from_list.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List.Singled(
    ezP.T3.Require.expression_list,
    ezP.T3.yield_from,
    ezP.T3.Require.expression_or_from_list,
    true,',')
  this.outputType = ezP.T3.expression_or_from_list
}
goog.inherits(ezP.DelegateSvg.Xpr.expression_or_from_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.expression_or_from_list, ezP.DelegateSvg.Xpr.expression_or_from_list)


/**
 * Class for a DelegateSvg, slice_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.slice_list = function (prototypeName) {
  ezP.DelegateSvg.Xpr.slice_list.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Require.slice_item, false, ',')
  this.outputType = ezP.T3.slice_list
}
goog.inherits(ezP.DelegateSvg.Xpr.slice_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.slice_list, ezP.DelegateSvg.Xpr.slice_list)

/**
 * Class for a DelegateSvg, argument_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.argument_list = function (prototypeName) {
  ezP.DelegateSvg.Xpr.argument_list.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List.Argument()
  this.outputType = ezP.T3.argument_list
}
goog.inherits(ezP.DelegateSvg.Xpr.argument_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.argument_list, ezP.DelegateSvg.Xpr.argument_list)

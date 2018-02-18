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
goog.require('ezP.DelegateSvg.Expr')

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
  this.inputData_.list = {}
}
goog.inherits(ezP.DelegateSvg.List, ezP.DelegateSvg.Expr)

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
  } else {
    if (ezp.s7r_ || c8n.ezp.optional_) {
      var pw = this.carretPathDefWidth_(io.cursorX)
    } else {
      pw = this.placeHolderPathDefWidth_(io.cursorX)
    }
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
    ezP.Input.setupEzpData(input, {n: n + 1, sep: sep, s7r_: true})
    input.appendField(new Blockly.FieldLabel(sep || this.consolidator.defaultSep))
    list.splice(i, 0, input)
    c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, name, block, c8n)
    ezP.Input.setupEzpData(input, {n: n, sep: sep})
    list.splice(i, 0, input)
    return input
  }
  return null
}

/**
 * Consolidate the input.
 * Removes empty place holders.
 * This must not be overriden.
 * 
 * @param {!Block} block.
 */
ezP.DelegateSvg.List.prototype.consolidate_ = function (block) {
  ezP.DelegateSvg.List.superClass_.consolidate.call(this, block)
  this.consolidator.consolidate(block)
}

/**
 * Consolidate the input.
 * Removes empty place holders.
 * This must not be overriden.
 * 
 * @param {!Block} block.
 */
ezP.DelegateSvg.List.prototype.consolidate = function (block) {
  if (!this.consolidator) {
    var D = ezP.DelegateSvg.Manager.getInputData(block.type).list
    goog.asserts.assert(D, 'inputData_.list is missing in '+block.type)
    var Ctor = D.consolidator? D.consolidator:
    ezP.Consolidator.List
    this.consolidator = new Ctor(D)
    goog.asserts.assert(this.consolidator, 'Could not create the consolidator '+Ctor)
  }
  this.consolidate = ezP.DelegateSvg.List.prototype.consolidate_
  this.consolidate(block)// this is not recursive
}

// ezP.DelegateSvg.List.prototype.consolidator = undefined

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
}

/**
 * Clear the list af all items.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.List.prototype.removeItems = function(block) {
  var list = block.inputList
  var i = 0
  var input
  Blockly.Events.setGroup(true)
  while ((input = list[i++])) {
    var c8n = input.connection
    var target = c8n.targetBlock()
    if (target) {
      c8n.disconnect()
      target.dispose()
    }
  }
  this.consolidate(block)
  Blockly.Events.setGroup(false)
}

/**
 * Returns the item count.
 * Count the inputs that are not separators.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.List.prototype.getItemCount = function(block) {
  var list = block.inputList
  var i = 0
  var input
  var count = 0
  while ((input = list[i++])) {
    if (!input.ezpData.s7r_) {
      ++ count
    }
  }
  return count
}

/**
 * Returns the item at the given index.
 * Count the inputs that are not separators.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.List.prototype.getItemAtIndex = function(block, i) {
  return this.getInput(block, 'ITEM_'+i)
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
ezP.DelegateSvg.Expr.target_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.target_list.superClass_.constructor.call(this, prototypeName)
  this.inputData_.list = {
    check: ezP.T3.Expr.Check.target_list,
    empty: false,
    sep: ',',
    hole_value: 'name',
  }
  this.outputData_.check = ezP.T3.Expr.target_list
}
goog.inherits(ezP.DelegateSvg.Expr.target_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('target_list')

/**
 * Class for a DelegateSvg, optional expression_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.optional_expression_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.optional_expression_list.superClass_.constructor.call(this, prototypeName)
  this.inputData_.list = {
    check: ezP.T3.Expr.Check.expression,
    empty: true,
    sep: ',',
    hole_value: 'name',
  }
  this.outputData_.check = ezP.T3.Expr.optional_expression_list
}
goog.inherits(ezP.DelegateSvg.Expr.optional_expression_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('optional_expression_list')

/**
 * Class for a DelegateSvg, expression_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.non_void_expression_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.non_void_expression_list.superClass_.constructor.call(this, prototypeName)
  this.inputData_.list = {
    check: ezP.T3.Expr.Check.expression,
    empty: false,
    sep: ',',
    hole_value: 'name',
  }
  this.outputData_.check = ezP.T3.Expr.non_void_expression_list
}
goog.inherits(ezP.DelegateSvg.Expr.non_void_expression_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('non_void_expression_list')

/**
 * Class for a DelegateSvg, starred_item_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.starred_item_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.starred_item_list.superClass_.constructor.call(this, prototypeName)
  this.inputData_.list = {
    check: ezP.T3.Expr.Check.starred_item,
    empty: true,
    sep: ',',
    hole_value: 'name',
  }
  this.outputData_.check = ezP.T3.Expr.starred_item_list
}
goog.inherits(ezP.DelegateSvg.Expr.starred_item_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('starred_item_list')

/**
 * Class for a DelegateSvg, key_datum_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.key_datum_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.key_datum_list.superClass_.constructor.call(this, prototypeName)
  this.inputData_.list = {
    check: ezP.T3.Expr.Check.key_datum,
    empty: true,
    sep: ',',
  }
  this.outputData_.check = ezP.T3.Expr.key_datum_list
}
goog.inherits(ezP.DelegateSvg.Expr.key_datum_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('key_datum_list')

/**
 * Class for a DelegateSvg, starred_item_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.starred_item_list_comprehensive = function (prototypeName) {
  ezP.DelegateSvg.Expr.starred_item_list_comprehensive.superClass_.constructor.call(this, prototypeName)
  var D = {
    check: ezP.T3.Expr.Check.non_void_starred_item_list,
    single: ezP.T3.Expr.comprehension,
    empty: true,
    sep: ',',
    hole_value: 'name',
  }
  var RA = goog.array.concat(D.check,D.single)
  goog.array.removeDuplicates(RA)
  D.all = RA
  this.inputData_.list = D
  this.outputData_.check = ezP.T3.Expr.starred_item_list_comprehensive
}
goog.inherits(ezP.DelegateSvg.Expr.starred_item_list_comprehensive, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('starred_item_list_comprehensive')

/**
 * Class for a DelegateSvg, non_void_starred_item_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.non_void_starred_item_list_comprehensive = function (prototypeName) {
  ezP.DelegateSvg.Expr.non_void_starred_item_list_comprehensive.superClass_.constructor.call(this, prototypeName)
  var D = {
    check: ezP.T3.Expr.Check.non_void_starred_item_list,
    single: ezP.T3.Expr.comprehension,
    empty: false,
    sep: ',',
  }
  var RA = goog.array.concat(D.check,D.single)
  goog.array.removeDuplicates(RA)
  D.all = RA
  this.inputData_.list = D
  this.outputData_.check = ezP.T3.Expr.non_void_starred_item_list_comprehensive
}
goog.inherits(ezP.DelegateSvg.Expr.non_void_starred_item_list_comprehensive, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('non_void_starred_item_list_comprehensive')

/**
 * Class for a DelegateSvg, key_datum_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.key_datum_list_comprehensive = function (prototypeName) {
  ezP.DelegateSvg.Expr.key_datum_list_comprehensive.superClass_.constructor.call(this, prototypeName)
  var D = {
    check: ezP.T3.Expr.Check.key_datum_list,
    single: ezP.T3.Expr.dict_comprehension,
    empty: true,
    sep: ',',
  }
  var RA = goog.array.concat(D.check,D.single)
  goog.array.removeDuplicates(RA)
  D.all = RA
  this.inputData_.list = D
  this.outputData_.check = ezP.T3.Expr.key_datum_list_comprehensive
}
goog.inherits(ezP.DelegateSvg.Expr.key_datum_list_comprehensive, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('key_datum_list_comprehensive')

/**
 * Class for a DelegateSvg, slice_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.slice_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.slice_list.superClass_.constructor.call(this, prototypeName)
  this.inputData_.list = {
    check: ezP.T3.Expr.Check.slice_item,
    empty: false,
    sep: ',',
  }
  this.outputData_.check = ezP.T3.Expr.slice_list
}
goog.inherits(ezP.DelegateSvg.Expr.slice_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('slice_list')

/**
 * Class for a DelegateSvg, argument_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.argument_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.argument_list.superClass_.constructor.call(this, prototypeName)
  this.inputData_.list = {
    consolidator: ezP.Consolidator.Arguments,
  }
  this.outputData_.check = ezP.T3.Expr.argument_list
}
goog.inherits(ezP.DelegateSvg.Expr.argument_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('argument_list')
 
/**
 * Class for a DelegateSvg, parameter_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.parameter_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.parameter_list.superClass_.constructor.call(this, prototypeName)
  this.inputData_.list = {
    consolidator: ezP.Consolidator.Parameters,
  }
  this.outputData_.check = ezP.T3.Expr.parameter_list
}
goog.inherits(ezP.DelegateSvg.Expr.parameter_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('parameter_list')

/**
 * Class for a DelegateSvg, with_item_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.with_item_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.with_item_list.superClass_.constructor.call(this, prototypeName)
  this.inputData_.list = {
    check: ezP.T3.Expr.Check.with_item,
    empty: false,
    sep: ',',
  }
  this.outputData_.check = ezP.T3.Expr.with_item_list
}
goog.inherits(ezP.DelegateSvg.Expr.with_item_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('with_item_list')


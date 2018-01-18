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

goog.provide('ezP.DelegateSvg.Xpr.ParameterList')

goog.require('ezP.DelegateSvg.Xpr')

/**
 * Class for a DelegateSvg, parameter list value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.ParameterList = function (prototypeName) {
  ezP.DelegateSvg.Xpr.ParameterList.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.ParameterList, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.parameter_list, ezP.DelegateSvg.Xpr.ParameterList)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.ParameterList.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.ParameterList.superClass_.initBlock.call(this, block)
  this.parameterListConsolidate(block)
}

/**
 * Will render the block.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.ParameterList.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Xpr.ParameterList.superClass_.willRender_.call(this, block)
  this.parameterListConsolidate(block)
}

ezP.DelegateSvg.Xpr.ParameterList.prototype.parameterListConsolidate = function (block) {
  var C = this.parameterListConsolidator
  if (!C) {
    C = this.parameterListConsolidator = new ezP.DelegateSvg.Xpr.ParameterList.Consolidator_()
  }
  C(block)
}

ezP.DelegateSvg.Xpr.ParameterList.Consolidator_ = function () {
  var block
  var list, i, input // list of inputs, index, element at index
  var inputData, n // ezPython data, group, index
  var start, end, connected
  var arg = {
    start: undefined,
    end: undefined
  }
  var kvarg = {
    start: undefined,
    end: undefined
  }
  var c8n
  var getCurrent = function (_) {
    if ((input = list[i])) {
      if (input.ezpData) {
        inputData = input.ezpData
      } else {
        inputData = input.ezpData = {}
      }
      c8n = input.connection
      goog.asserts.assert(!inputData || c8n, 'ParameterList item must have a connection')
      return input
    }
    inputData = c8n = null
    return null
  }
  var getNext = function () {
    ++i
    return getCurrent()
  }
  var disposeAtI = function () {
    list[i].dispose()
    list.splice(i, 1)
    getCurrent()
  }
  var insertInputAtI = function () {
    c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, '_', block, c8n)
    list.splice(i, 0, input)
    inputData = input.ezpData = {}
  }
  var doFinalizeSeparator = function (K, n, extreme) {
    inputData.n = n
    input.name = (n? K + n: K)
    inputData.isSeparator = c8n.ezpData.s7r_ = true
    c8n.setHidden(false)
    if (extreme) {
      while (input.fieldRow.length) {
        input.fieldRow.shift().dispose()
      }
    } else if (!input.fieldRow.length) {
      input.appendField(new ezP.FieldLabel(','))
    }
  }
  var doFinalizePlaceholder = function (K, n) {
    inputData.n = n
    input.name = (n? K + n: K)
    inputData.isSeparator = c8n.ezpData.s7r_ = false
  }
  function doOther() {
    if (c8n.targetBlock().ezp.isOneStar) {
      if (getNext()) {
        if (doArg(kvarg)) {
          while (!c8n.isConnected() || !c8n.targetBlock().ezp.isTwoStars) {
            disposeAtI()
            getCurrent()
          }
          while (getNext()) {
            disposeAtI()
          }
        }
      } else {
        kvarg.start = i
        insertInputAtI()
        kvarg.end = i
        return false
      }
    } 
  }
  function doArg(rng) {
    rng.start = rng.end = i
    var require_sep = true
    while (true) {
      if (c8n.isConnected()) {
        if (require_sep) {
          insertInputAtI()
          require_sep = false
          rng.end = rng.end + 1
          getNext()
        }
        if (c8n.targetBlock().ezp.hasStar()) {
          rng.end = rng.end + 1
          require_sep = true
          getNext()
        } else {
          return true
        }
      } else if (require_sep) {
        rng.end = rng.end + 1
        require_sep = false
        getNext()
      } else {
        disposeAtI()
        getCurrent()
      }
      if (input) {
        continue
      } else if (require_sep) {
        insertInputAtI()
        rng.end = rng.end + 1
      }
      return false
    }
  }
  var consolidator = function (block_) {
    block = block_
    var ezp = block.ezp
    if (!ezp) {
      return
    }
    // positional parameters
    // one star parameter
    // key parameters
    // one final double star parameter
    list = block.inputList
    i = start = end = 0
    inputData = input = undefined
    n = 0
    if (!getCurrent()) {
      insertInputAtI()
      getCurrent()
    }
    i = 0
    doArg(arg) && doOther()
    if (list.length == 1) {
      i = 0
      getCurrent()
      inputData.n = n = 0
      inputData.isSeparator = c8n.ezpData.s7r_ = false
      input.name = 'ARG_' + n
      input.setCheck(ezP.Type.Xpr.Require.parameterList)
      c8n.setHidden(false)  
      return;
    }
    var alreadyStar = kvarg.start !== undefined
    var already2Stars = kvarg.end < list.length
    if (alreadyStar) {
      n = 0
      for (i = arg.start; i < arg.end; i += 2) {
        getCurrent();
        doFinalizeSeparator('S7R_', n++, i === arg.start)
        input.setCheck([ezP.Type.Xpr.parameter_positional])
      }
      n = 0
      for (i = arg.start + 1; i < arg.end; i = i + 2) {
        getCurrent();
        doFinalizePlaceholder('ARG_', n++)
        input.setCheck([ezP.Type.Xpr.parameter_positional])
      }
      i = arg.end
      getCurrent();
      doFinalizePlaceholder('ARGS')
      input.setCheck([ezP.Type.Xpr.parameter_1_star])
      if (already2Stars) {
        n = 0
        for (i = kvarg.start; i < kvarg.end; i = i + 2) {
          getCurrent();
          doFinalizeSeparator('KVS7P_', n++)
          input.setCheck([ezP.Type.Xpr.parameter_keyed])
        }
        n = 0
        for (i = kvarg.start + 1; i < kvarg.end; i = i + 2) {
          getCurrent();
          doFinalizePlaceholder('KVARG_', n++)
          input.setCheck([ezP.Type.Xpr.parameter_keyed])
        }
        i = kvarg.end
        getCurrent();
        doFinalizePlaceholder('KVARGS')
        input.setCheck([ezP.Type.Xpr.parameter_2_stars])
      } else {
        n = 0
        for (i = kvarg.start; i < kvarg.end - 1; i = i + 2) {
          getCurrent();
          doFinalizeSeparator('KVS7R_', n++)
          input.setCheck([ezP.Type.Xpr.parameter_keyed])
        }
        n = 0
        for (i = kvarg.start + 1; i < kvarg.end; i = i + 2) {
          getCurrent();
          doFinalizePlaceholder('KVARG_', n++)
          input.setCheck([ezP.Type.Xpr.parameter_keyed])
        }
        i = kvarg.end - 1
        getCurrent();
        doFinalizeSeparator('KVS7R_', n++, true)
        input.setCheck([ezP.Type.Xpr.parameter_keyed,
          ezP.Type.Xpr.parameter_2_stars])
      }
    } else {
      n = 0
      for (i = arg.start; i < arg.end; i += 2) {
        getCurrent();
        doFinalizeSeparator('S7R_', n++, i === arg.start)
        input.setCheck([ezP.Type.Xpr.parameter_positional,
          ezP.Type.Xpr.parameter_1_star])
      }
      n = 0
      for (i = arg.start + 1; i < arg.end; i = i + 2) {
        getCurrent();
        doFinalizePlaceholder('ARG_', n++)
        input.setCheck([ezP.Type.Xpr.parameter_positional,
          ezP.Type.Xpr.parameter_1_star])
      }
      i = arg.end - 1
      getCurrent();
      if (already2Stars) {
        if (!input.fieldRow.length) {
          input.appendField(new ezP.FieldLabel(','))
        }
        i = arg.end
        getCurrent()
        doFinalizePlaceholder('KVARGS')
        input.setCheck([ezP.Type.Xpr.parameter_positional,
          ezP.Type.Xpr.parameter_1_star,
          ezP.Type.Xpr.parameter_2_star])
      } else {
        input.setCheck([ezP.Type.Xpr.parameter_positional,
          ezP.Type.Xpr.parameter_1_star,
          ezP.Type.Xpr.parameter_2_star])
        while (input.fieldRow.length) {
          input.fieldRow.shift().dispose()
        }
    
      }
    }
  }
  return consolidator
}

/**
 * Render parameterList inputs only.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Xpr.ParameterList.prototype.renderDrawInput_ = function (io) {
  this.renderDrawParameterListInput_(io) ||
    this.renderDrawValueInput_(io)
}

/**
 * Render the fields of a parameterList input, if relevant.
 * @param {!Blockly.Block} The block.
 * @param {!Blockly.Input} Its input.
 * @private
 */
ezP.DelegateSvg.Xpr.ParameterList.prototype.renderDrawParameterListInput_ = function (io) {
  if (!io.canParameterList) {
    return false
  }
  var inputData = io.input.ezpData
  if (!inputData) {
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
  } else if (inputData.isSeparator) {
    var pw = this.carretPathDefWidth_(io.cursorX)
    var w = pw.width
    c8n.setOffsetInBlock(io.cursorX + w / 2, 0)
    io.cursorX += w
  } else {
    pw = this.placeHolderPathDefWidth_(io.cursorX)
    io.steps.push(pw.d)
    io.cursorX += pw.width
  }
  return true
}

/**
 * Fetches the named input object, forwards to getInputParameterList_.
 * @param {!Blockly.Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
ezP.DelegateSvg.Xpr.ParameterList.prototype.getInput = function (block, name) {
  var input = this.getInputParameterList_(block, name)
  return input === null
    ? ezP.DelegateSvg.Xpr.ParameterList.superClass_.getInput.call(this, block, name)
    : input
}

/**
 * Fetches the named input object.
 * @param {!Blockly.Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 * The undefined return value for the default block getInput implementation.
 */
ezP.DelegateSvg.Xpr.ParameterList.prototype.getInputParameterList_ = function (block, name) {
  if (!name.length) {
    return null
  }
  var L = name.split('_')
  if (L.length !== 2 || L[0] !== 'PAR') {
    return null
  }
  var n = parseInt(L[1])
  if (isNaN(n)) {
    return null
  }
  this.parameterListConsolidate(block)
  var list = block.inputList
  var i = 2
  var input
  while ((input = list[i])) {
    var inputData = input.ezpData
    if (!inputData) {
      ++i
      continue
    }
    var already = 0
    do {
      if (!inputData.isSeparator) {
        if (inputData.n === n) {
          return input
        }
        ++already
      }
    } while ((input = list[++i]) && (inputData = input.ezpData))
    var c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, 'S7R_' + (n + 1), block, c8n)
    inputData = input.ezpData = {n: n + 1, isSeparator: true}
    list.splice(i, 0, input)
    c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, name, block, c8n)
    inputData = input.ezpData = {n: n}
    list.splice(i, 0, input)
    return input
  }
  return null
}

/**
 * Fetches the named input object.
 * @param {!Blockly.Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 * The undefined return value for the default block getInput implementation.
 */
ezP.DelegateSvg.Xpr.ParameterList.prototype.getParameterMenu = function (block) {
}

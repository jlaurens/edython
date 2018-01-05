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

goog.require('ezP.DelegateSvg.Xpr')

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
}
goog.inherits(ezP.DelegateSvg.Xpr.Comprehension, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.comprehension, ezP.DelegateSvg.Xpr.Comprehension)

/**
 * Will render the block.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.Comprehension.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Xpr.Comprehension.superClass_.willRender_.call(this, block)
  this.forifConsolidate(block)
}

ezP.DelegateSvg.Xpr.Comprehension.prototype.forifConsolidate = function (block) {
  var C = this.comprehensionConsolidator
  if (!C) {
    C = this.comprehensionConsolidator = new ezP.DelegateSvg.Xpr.Comprehension.Consolidator_()
  }
  C(block)
}

ezP.DelegateSvg.Xpr.Comprehension.Consolidator_ = function () {
  var block
  var list, i, input // list of inputs, index, element at index
  var forif, n // ezPython data, group, index
  var start, end, connected
  var c8n
  var getCurrent = function (_) {
    if ((input = list[i])) {
      forif = input.ezpForif
      c8n = input.connection
      goog.asserts.assert(!forif || c8n, 'Forif item must have a connection')
      return input
    }
    forif = c8n = null
    return null
  }
  var getNext = function () {
    ++i
    return getCurrent()
  }
  var rewind = function (_) {
    n = 0
    i = start
    return getCurrent()
  }
  var isForif = function () {
    return input && (forif = input.ezpForif)
  }
  var disposeNotAtI = function (notI) {
    list[notI].dispose()
    list.splice(notI, 1)
    --end
  }
  var disposeAtI = function () {
    list[i].dispose()
    list.splice(i, 1)
    --end
    getCurrent()
  }
  var disposeFromI = function (bound) {
    bound = Math.min(bound, end)
    while (i < bound) {
      disposeNotAtI(i)
      --bound
    }
    getCurrent()
  }
  var disposeToI = function (bound) {
    bound = Math.max(bound, start)
    while (bound < i) {
      disposeNotAtI(bound)
      --i
    }
  }
  var insertPlaceholderAtI = function () {
    c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, '_', block, c8n)
    list.splice(i, 0, input)
    ++end
    forif = input.ezpForif = {}
  }
  var insertSeparatorAtI = function () {
    insertPlaceholderAtI()
    forif.isSeparator = true
  }
  var doFinalizeSeparator = function (extreme) {
    forif.n = n
    input.name = 'S7R_' + n
    input.setCheck(ezP.Type.Xpr.Require.forif)
    forif.isSeparator = c8n.isSeparatorEZP = true
    c8n.setHidden(false)
    if (extreme) {
      forif.hidden = false
      while (input.fieldRow.length) {
        input.fieldRow.shift().dispose()
      }
    }
  }
  var doFinalizePlaceholder = function () {
    forif.n = n
    input.name = 'FORIF_' + n++
    input.setCheck(ezP.Type.Xpr.Require.forif)
    forif.isSeparator = c8n.isSeparatorEZP = false
  }
  var doGroup = function () {
    // group bounds and connected
    n = 0
    connected = 0
    start = i
    var removeSep = false
    var placeholder
    do {
      if (c8n.isConnected()) {
        ++connected
        removeSep = forif.isSeparator = false
      } else if (removeSep) {
        disposeNotAtI(i--)
      } else if (!forif.isSeparator) {
        // remove separators before
        while (i > start) {
          if (!list[i - 1].ezpForif.isSeparator) {
            break
          }
          disposeNotAtI(--i)
        }
        removeSep = forif.isSeparator = true
      }
      if (!getNext() || !isForif()) {
        break
      }
    } while (true)
    end = i // this group has index [start, end[
    rewind()
    if (connected) {
      if (!forif.isSeparator) {
        insertSeparatorAtI()
      }
      doFinalizeSeparator(true)
      while (n < connected) { // eslint-disable-line no-unmodified-loop-condition
        getNext()
        while (forif.isSeparator) {
          disposeAtI()
        }
        doFinalizePlaceholder() // increment n
        getNext()
        if (!forif || !forif.isSeparator) {
          insertSeparatorAtI()
        }
        doFinalizeSeparator(i === end - 1)
      }
      while (getNext() && isForif()) {
        disposeAtI()
      }
    } else {
      disposeToI(start)
      doFinalizeSeparator()
      getNext()
    }
  }
  var consolidator = function (block_) {
    block = block_
    var ezp = block.ezp
    if (!ezp) {
      return
    }
    list = block.inputList
    i = start = end = 3
    if (list.length <= i) {
      n = 0
      insertSeparatorAtI()
      doFinalizeSeparator(true)
      return
    }
    forif = n = input = undefined
    rewind()
    do {
      if (isForif()) {
        doGroup()
        return
      }
    } while (getNext())
  }
  return consolidator
}

/**
 * Render forif inputs only.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Xpr.Comprehension.prototype.renderDrawInput_ = function (io) {
  this.renderDrawForifInput_(io) ||
    this.renderDrawValueInput_(io)
}

/**
 * Render the fields of a forif input, if relevant.
 * @param {!Blockly.Block} The block.
 * @param {!Blockly.Input} Its input.
 * @private
 */
ezP.DelegateSvg.Xpr.Comprehension.prototype.renderDrawForifInput_ = function (io) {
  if (!io.canForif) {
    return false
  }
  var forif = io.input.ezpForif
  if (!forif) {
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
  } else if (forif.isSeparator) {
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
 * Fetches the named input object, forwards to getInputForif_.
 * @param {!Blockly.Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
ezP.DelegateSvg.Xpr.Comprehension.prototype.getInput = function (block, name) {
  var input = this.getInputForif_(block, name)
  return input === null
    ? ezP.DelegateSvg.Xpr.Comprehension.superClass_.getInput.call(this, block, name)
    : input
}

/**
 * Fetches the named input object.
 * @param {!Blockly.Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 * The undefined return value for the default block getInput implementation.
 */
ezP.DelegateSvg.Xpr.Comprehension.prototype.getInputForif_ = function (block, name) {
  if (!name.length) {
    return null
  }
  var L = name.split('_')
  if (L.length !== 2 || L[0] !== 'FORIF') {
    return null
  }
  var n = parseInt(L[1])
  if (isNaN(n)) {
    return null
  }
  this.forifConsolidate(block)
  var list = block.inputList
  var i = 2
  var input
  while ((input = list[i])) {
    var forif = input.ezpForif
    if (!forif) {
      ++i
      continue
    }
    var already = 0
    do {
      if (!forif.isSeparator) {
        if (forif.n === n) {
          return input
        }
        ++already
      }
    } while ((input = list[++i]) && (forif = input.ezpForif))
    var c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, 'S7R_' + (n + 1), block, c8n)
    forif = input.ezpForif = {n: n + 1, isSeparator: true}
    list.splice(i, 0, input)
    c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, name, block, c8n)
    forif = input.ezpForif = {n: n}
    list.splice(i, 0, input)
    return input
  }
  return null
}

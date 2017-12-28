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

goog.provide('ezP.DelegateSvg.Value')

goog.require('ezP.DelegateSvg')

/**
 * Class for a DelegateSvg, value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Value = function (prototypeName) {
  ezP.DelegateSvg.Value.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Value, ezP.DelegateSvg)

ezP.DelegateSvg.Manager.register(ezP.Const.Val.DEFAULT, ezP.DelegateSvg.Value)

ezP.DelegateSvg.Value.prototype.shapePathDef_ =
  ezP.DelegateSvg.Value.prototype.contourPathDef_ =
    ezP.DelegateSvg.Value.prototype.highlightedPathDef_ =
      ezP.DelegateSvg.Value.prototype.valuePathDef_

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Value.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
    this.renderDrawValueInput_(io)
}

/**
 * Class for a DelegateSvg, quoted string value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Value.Text = function (prototypeName) {
  ezP.DelegateSvg.Value.Text.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Value.Text, ezP.DelegateSvg.Value)

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Value.Text.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io)
}

ezP.DelegateSvg.Manager.register(ezP.Const.Val.TEXT, ezP.DelegateSvg.Value.Text)
ezP.DelegateSvg.Manager.register(ezP.Const.Val.ANY, ezP.DelegateSvg.Value.Text)

/**
 * Class for a DelegateSvg, one input value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Value.Input = function (prototypeName) {
  ezP.DelegateSvg.Value.Input.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Value.Input, ezP.DelegateSvg.Value)

ezP.DelegateSvg.Manager.register(ezP.Const.Val.MINUS, ezP.DelegateSvg.Value.Input)

/**
 * Class for a DelegateSvg, tuple value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Value.Tuple = function (prototypeName) {
  ezP.DelegateSvg.Value.Tuple.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Value.Tuple, ezP.DelegateSvg.Value)

ezP.DelegateSvg.Manager.register(ezP.Const.Val.TUPLE, ezP.DelegateSvg.Value.Tuple)
ezP.DelegateSvg.Manager.register(ezP.Const.Val.PARENTH, ezP.DelegateSvg.Value.Tuple)

/**
 * Will render the block.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Value.Tuple.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Value.Tuple.superClass_.willRender_.call(this, block)
  this.tupleConsolidate(block)
}

/**
 * Render tuple inputs only.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Value.Tuple.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
  this.renderDrawTupleInput_(io)
}

/**
 * Fetches the named input object, forwards to getInputTuple_.
 * @param {!Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
ezP.DelegateSvg.Value.Tuple.prototype.getInput = function (block, name) {
  return this.getInputTuple_(block, name)
}

/**
 * Class for a DelegateSvg, tuple value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Value.Range = function (prototypeName) {
  ezP.DelegateSvg.Value.Range.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Value.Range, ezP.DelegateSvg.Value.Tuple)

ezP.DelegateSvg.Manager.register(ezP.Const.Val.RANGE, ezP.DelegateSvg.Value.Range)

/**
 * @param {!Block} block.
 * @param {Number} the group of tuples.
 * @return {Number} The max number of inputs. null for unlimited.
 * @private
 */
ezP.DelegateSvg.Value.Range.prototype.getInputTupleMax = function (block, grp) {
  return grp ? 0 : 3
}

/**
 * Class for a DelegateSvg, comprehension value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Value.Comprehension = function (prototypeName) {
  ezP.DelegateSvg.Value.Comprehension.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Value.Comprehension, ezP.DelegateSvg.Value)

ezP.DelegateSvg.Manager.register(ezP.Const.Val.COMP, ezP.DelegateSvg.Value.Comprehension)

/**
 * Will render the block.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Value.Comprehension.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Value.Comprehension.superClass_.willRender_.call(this, block)
  this.comprehensionConsolidate(block)
}

ezP.DelegateSvg.Value.Comprehension.prototype.comprehensionConsolidate = function (block) {
  var C = this.comprehensionConsolidator
  if (!C) {
    C = this.comprehensionConsolidator = new ezP.DelegateSvg.Value.Comprehension.Consolidator_()
  }
  C(block)
}

ezP.DelegateSvg.Value.Comprehension.Consolidator_ = function () {
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
ezP.DelegateSvg.Value.Comprehension.prototype.renderDrawInput_ = function (io) {
  this.renderDrawForifInput_(io) ||
    this.renderDrawValueInput_(io)
}

/**
 * Render the fields of a forif input, if relevant.
 * @param {!Blockly.Block} The block.
 * @param {!Blockly.Input} Its input.
 * @private
 */
ezP.DelegateSvg.Value.Comprehension.prototype.renderDrawForifInput_ = function (io) {
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

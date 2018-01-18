/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview List consolidator for list blocks, for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.ListConsolidator')

goog.require('ezP.Const')
goog.require('ezP.Type')
goog.require('ezP.DelegateSvg')

/**
 * List consolidator.
 * Remove empty place holders, add separators
 * Main entry: consolidate
 */
ezP.DelegateSvg.ListConsolidator = function() {
  this.canBeVoid = true
  this.defaultSep = ','
}

/**
 * Setup the io parameter dictionary.
 * Called when the input list has changed and or the index has changed.
 * @param {!Object} io parameter.
 */
ezP.DelegateSvg.ListConsolidator.prototype.setupIO = function (io) {
  if ((io.input = io.list[io.i])) {
    io.ezp = io.input.ezpListData
    io.c8n = io.input.connection
    goog.asserts.assert(!io.ezp || !!io.c8n, 'List items must have a connection')
  } else {
    io.ezp = io.c8n = null
  }
}

/**
 * Advance to the next input. Returns false when at end.
 * @param {!Object} io parameter.
 */
ezP.DelegateSvg.ListConsolidator.prototype.nextInput = function (io) {
  ++io.i
  this.setupIO(io)
  return !!io.input
}

/**
 * Returns the required types for the current input.
 * @param {!Object} io parameter.
 */
ezP.DelegateSvg.ListConsolidator.prototype.getCheck = function (io) {
  return ezP.T3.Require.starred_item
}

/**
 * Finalize the current input as a placeholder.
 * @param {!Object} io parameter.
 */
ezP.DelegateSvg.ListConsolidator.prototype.doFinalizePlaceholder = function (io) {
  io.ezp.n = io.n
  io.ezp.sep = io.sep
  io.input.name = 'ITEM_' + io.n++
  io.ezp.isSeparator = io.c8n.ezpData.s7r_ = false
  io.input.setCheck(this.getCheck(io))
}

/**
 * Get the next input. Returns null when at end.
 * @param {!Object} io parameter.
 */
ezP.DelegateSvg.ListConsolidator.prototype.disposeAtI = function (io, i) {
  io.list[i].dispose()
  io.list.splice(i, 1)
  --io.end
}
ezP.DelegateSvg.ListConsolidator.prototype.disposeFromIToEnd = function (io) {
  while (io.i < io.end) {
    this.disposeAtI(io, io.i)
  }
  this.setupIO(io)
}
ezP.DelegateSvg.ListConsolidator.prototype.disposeFromStartToI = function (io) {
  while (io.start < io.i) {
    this.disposeAtI(io, io.start)
    --io.i
  }
  this.setupIO(io)
}
ezP.DelegateSvg.ListConsolidator.prototype.insertPlaceholderAtI = function (io) {
  var c8n = io.block.makeConnection_(Blockly.INPUT_VALUE)
  var input = new Blockly.Input(Blockly.INPUT_VALUE, 'ITEM_*', io.block, c8n)
  input.ezpListData = {}
  io.list.splice(io.i, 0, input)
  ++io.end
  this.setupIO(io)
}

ezP.DelegateSvg.ListConsolidator.prototype.doFinalizeSeparator = function (io, extreme) {
  io.ezp.n = io.n
  io.ezp.sep = io.sep
  io.input.name = 'S7R_' + io.n
  io.ezp.isSeparator = io.c8n.ezpData.s7r_ = true
  if (extreme) {
    while (io.input.fieldRow.length) {
      io.input.fieldRow.shift().dispose()
    }
  } else if (!io.input.fieldRow.length) {
    io.input.appendField(new ezP.FieldLabel(io.sep || this.defaultSep))
  }
  io.input.setCheck(this.getCheck(io))
}

/**
 * Whether the list can be void
 */
ezP.DelegateSvg.ListConsolidator.prototype.no_more_ezp = function(io) {
  do {
    if (!!io.ezp) {
      this.disposeFromIToEnd(io)
      return
    }
  } while (this.nextInput(io))
}
/**
 * Whether the list can be void
 */
ezP.DelegateSvg.ListConsolidator.prototype.cleanup = function(io) {
  io.n = 0
  io.i = io.start
  this.setupIO(io)
  if (io.connected) {
    if (!io.ezp.isSeparator) {
      this.insertPlaceholderAtI(io)
      io.ezp.isSeparator = true
    }
    this.doFinalizeSeparator(io, true)
    while (io.n < io.connected) {
      this.nextInput(io)
      while (io.ezp.isSeparator) {
        this.disposeAtI(io, io.i)
        this.setupIO(io)
      }
      this.doFinalizePlaceholder(io) // increment n
      this.nextInput(io)
      if (!io.ezp || !io.ezp.isSeparator) {
        this.insertPlaceholderAtI(io)
        io.ezp.isSeparator = true
      }
      this.doFinalizeSeparator(io, io.i === io.end - 1)
    }
    while (this.nextInput(io) && !!io.ezp) {
      this.disposeAtI(io, io.i)
      this.setupIO(io)
    }
  } else if (io.placeholder !== undefined) {
    io.i = io.placeholder
    this.setupIO(io)
    this.disposeFromStartToI(io)
    if (this.canBeVoid) {
      this.doFinalizeSeparator(io, true)
    } else {
      this.doFinalizePlaceholder(io)          
    }
    this.nextInput(io)
    this.disposeFromIToEnd(io)
  } else {
    io.i = io.start
    this.setupIO(io)
    if (io.end === io.start) {
      this.insertPlaceholderAtI(io)
    }
    if (this.canBeVoid) {
      this.doFinalizeSeparator(io, true)
    } else {
      this.doFinalizePlaceholder(io)          
    }
    this.nextInput(io)
    this.disposeFromIToEnd(io)
  }
}

/**
 * Take appropriate actions depending on the current input
 */
ezP.DelegateSvg.ListConsolidator.prototype.one_step = function(io) {
  if (io.c8n.isConnected()) {
    ++io.connected
    io.removePrevious = io.ezp.isSeparator = false
  } else {
    if (io.removePrevious) {
      this.disposeAtI(io, --io.i)
    }
    if (io.ezp.isSeparator) {
      io.removePrevious = true
    } else if (io.placeholder === undefined) {
      // remove separators before
      while (io.i > io.start) {
        if (!io.list[io.i - 1].ezpListData.isSeparator) {
          break
        }
        this.disposeAtI(io, --io.i)
      }
      io.placeholder = io.i
      io.removePrevious = false
      io.ezp.isSeparator = true
    } else {
      // remove separators before, but keep the placeholder
      while (io.i > io.placeholder) {
        if (!io.list[io.i - 1].ezpListData.isSeparator) {
          break
        }
        this.disposeAtI(io, --io.i)
      }
      io.removePrevious = io.ezp.isSeparator = true
    }
  }
}

/**
 * Walk through the input list
 */
ezP.DelegateSvg.ListConsolidator.prototype.walk = function(io) {
  io.removePrevious = false
  do {
    this.one_step(io)
  } while (this.nextInput(io) && !!io.ezp)
  io.end = io.i // this group has index [start, end[
  // if we find a further input with ezpListData
  // delete it and everything thereafter
  this.no_more_ezp(io)
  // then cleanup
  this.cleanup(io)
}

/**
 * List consolidator.
 * Removes empty place holders
 */
ezP.DelegateSvg.ListConsolidator.prototype.consolidate = function(block) {
  var io = {
    block: block,
    i: 0,
  }
  io.list = io.block.inputList
  this.setupIO(io)
  do {
    if (!!io.ezp) {
      // group bounds and connected connections
      io.n = 0
      io.sep = io.ezp.sep || this.defaultSep
      io.start = io.i
      io.connected = 0
      this.walk(io)
      return
    }
  } while (this.nextInput(io))
}

/**
 * List consolidator.
 * Remove empty place holders, add separators
 * Main entry: consolidate
 * The list must no be void.
 */
ezP.DelegateSvg.NonVoidListConsolidator = function () {
  ezP.DelegateSvg.NonVoidListConsolidator.superClass_.constructor.call(this)
  this.canBeVoid = false
}
goog.inherits(ezP.DelegateSvg.NonVoidListConsolidator, ezP.DelegateSvg.ListConsolidator)

/**
 * List consolidator for list_display and set_display.
 * Remove empty place holders, add separators
 * Main entry: consolidate
 */
ezP.DelegateSvg.ListDisplayConsolidator = function() {
  ezP.DelegateSvg.ListDisplayConsolidator.superClass_.constructor.call(this)
  this.comprehension = ezP.T3.comprehension
  this.require = ezP.T3.Require.starred_list
  this.require_with_comprehension = ezP.T3.Require.comprehensive_starred_list
}
goog.inherits(ezP.DelegateSvg.ListDisplayConsolidator, ezP.DelegateSvg.ListConsolidator)

/**
 * Returns the required types for the current input.
 * @param {!Object} io parameter.
 */
ezP.DelegateSvg.ListDisplayConsolidator.prototype.getCheck = function (io) {
  if (io.comprehension || io.list.length < 5) {
    return this.require_with_comprehension
  } else if (io.list.length == 5 && io.i == 2) {
    return this.require_with_comprehension
  } else {
    return this.require
  }
}

/**
 * Take appropriate actions depending on the current input
 */
ezP.DelegateSvg.ListDisplayConsolidator.prototype.one_step = function(io) {
  ezP.DelegateSvg.ListDisplayConsolidator.superClass_.one_step.call(this, io)
  var target = io.c8n.targetConnection
  if (target && target.check_.indexOf(this.comprehension) != -1) {
    io.comprehension = io.i
  }
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 */
ezP.DelegateSvg.ListDisplayConsolidator.prototype.cleanup = function(io) {
  if (io.comprehension !== undefined) {
    io.n = 0
    io.i = io.comprehension
    this.setupIO(io)
    this.doFinalizePlaceholder(io)
    this.disposeFromStartToI(io)
    this.nextInput(io)
    // this.disposeFromIToEnd(io)
  } else {
    ezP.DelegateSvg.ListDisplayConsolidator.superClass_.cleanup.call(this, io)
  }
}

/**
 * List consolidator for dict_display.
 * Remove empty place holders, add separators
 * Main entry: consolidate
 */
ezP.DelegateSvg.DictDisplayConsolidator = function() {
  ezP.DelegateSvg.DictDisplayConsolidator.superClass_.constructor.call(this)
  this.comprehension = ezP.T3.dict_comprehension
  this.require = ezP.T3.Require.key_datum_list
  this.require_with_comprehension = ezP.T3.Require.comprehensive_key_datum_list
}
goog.inherits(ezP.DelegateSvg.DictDisplayConsolidator, ezP.DelegateSvg.ListDisplayConsolidator)

/**
 * List consolidator for comprehension.
 * Remove empty place holders, add separators
 * Main entry: consolidate
 */
ezP.DelegateSvg.ComprehensionConsolidator = function() {
  ezP.DelegateSvg.ComprehensionConsolidator.superClass_.constructor.call(this)
  this.canBeVoid = true
  this.defaultSep = ''
}
goog.inherits(ezP.DelegateSvg.ComprehensionConsolidator, ezP.DelegateSvg.ListConsolidator)

/**
 * Returns the required types for the current input.
 * @param {!Object} io parameter.
 */
ezP.DelegateSvg.ComprehensionConsolidator.prototype.getCheck = function (io) {
  return ezP.T3.Require.comp_iter
}

/**
 * Separators are always extreme.
 * @param {!Object} io parameter.
 * @param {!Bool} extreme parameter.
 */
ezP.DelegateSvg.ComprehensionConsolidator.prototype.doFinalizeSeparator = function (io, extreme) {
  ezP.DelegateSvg.ComprehensionConsolidator.superClass_.doFinalizeSeparator.call(this, io, true)
}


/**
 * List consolidator for target_list.
 * Remove empty place holders, add separators
 * Main entry: consolidate
 */
ezP.DelegateSvg.TargetConsolidator = function() {
  ezP.DelegateSvg.TargetConsolidator.superClass_.constructor.call(this)
  this.canBeVoid = false
  this.defaultSep = ','
}
goog.inherits(ezP.DelegateSvg.TargetConsolidator, ezP.DelegateSvg.ListConsolidator)

/**
 * Returns the required types for the current input.
 * @param {!Object} io parameter.
 */
ezP.DelegateSvg.TargetConsolidator.prototype.getCheck = function (io) {
  return ezP.T3.Require.target_list
}


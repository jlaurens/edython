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

goog.provide('ezP.ListConsolidator')

goog.require('ezP.Const')
goog.require('ezP.Type')
goog.require('ezP.DelegateSvg')

/**
 * List consolidator.
 * Remove empty place holders, add separators
 * Main entry: consolidate
 * @param {!Array} require, an array of required types, in general one of the ezp.T3.Required....
 * @param {Bool} canBeVoid, whether the list can be void. Non void lists will display a large placeholder.
 * @param {String} defaultSep, the separator between the list items
 */
ezP.ListConsolidator = function(require, canBeVoid, defaultSep) {
  this.require = require
  this.canBeVoid = canBeVoid
  this.defaultSep = defaultSep
}

ezP.ListConsolidator.require = undefined
ezP.ListConsolidator.canBeVoid = true
ezP.ListConsolidator.defaultSep = ','

/**
 * Setup the io parameter dictionary.
 * Called when the input list has changed and or the index has changed.
 * @param {!Object} io parameter.
 */
ezP.ListConsolidator.prototype.setupIO = function (io) {
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
ezP.ListConsolidator.prototype.nextInput = function (io) {
  ++io.i
  this.setupIO(io)
  return !!io.input
}

/**
 * Returns the required types for the current input.
 * @param {!Object} io parameter.
 */
ezP.ListConsolidator.prototype.getCheck = function (io) {
  return this.require
}

/**
 * Finalize the current input as a placeholder.
 * @param {!Object} io parameter.
 */
ezP.ListConsolidator.prototype.doFinalizePlaceholder = function (io) {
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
ezP.ListConsolidator.prototype.disposeAtI = function (io, i) {
  io.list[i].dispose()
  io.list.splice(i, 1)
  --io.end
}
ezP.ListConsolidator.prototype.disposeFromIToEnd = function (io) {
  while (io.i < io.end) {
    this.disposeAtI(io, io.i)
  }
  this.setupIO(io)
}
ezP.ListConsolidator.prototype.disposeFromStartToI = function (io) {
  while (io.start < io.i) {
    this.disposeAtI(io, io.start)
    --io.i
  }
  this.setupIO(io)
}
ezP.ListConsolidator.prototype.insertPlaceholderAtI = function (io) {
  var c8n = io.block.makeConnection_(Blockly.INPUT_VALUE)
  var input = new Blockly.Input(Blockly.INPUT_VALUE, 'ITEM_*', io.block, c8n)
  input.ezpListData = {}
  io.list.splice(io.i, 0, input)
  ++io.end
  this.setupIO(io)
}

ezP.ListConsolidator.prototype.doFinalizeSeparator = function (io, extreme) {
  io.ezp.n = io.n
  io.ezp.sep = io.sep
  io.input.name = 'S7R_' + io.n
  io.ezp.isSeparator = io.c8n.ezpData.s7r_ = true
  if (extreme || io.ezp.sep.length == 0) {
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
ezP.ListConsolidator.prototype.no_more_ezp = function(io) {
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
ezP.ListConsolidator.prototype.cleanup = function(io) {
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
ezP.ListConsolidator.prototype.one_step = function(io) {
  if (io.c8n.isConnected()) {
    // count the number of connected blocks
    ++io.connected
    // No need to remove the previous separator
    // this input is not a separator
    io.removePrevious = io.ezp.isSeparator = false
    io.removeSeparators = false
  } else {
    if (io.removePrevious) {
      // remove the previous input
      this.disposeAtI(io, --io.i)
    }
    if (io.ezp.isSeparator) {
      if (io.removeSeparators) {
        this.disposeAtI(io, io.i--)
      } else {
        // this is a separator, will eventually removed on next step
        // Also remove any forthcoming separator
        io.removeSeparators = io.removePrevious = true
      }
    } else if (io.placeholder === undefined) {
      // If we delete input that were connected, things go wrong
      // I do not remember what exactly, may be related to undo management
      // This input is not connected, it will become a separator
      // remove separators before
      while (io.i > io.start) {
        if (!io.list[io.i - 1].ezpListData.isSeparator) {
          break
        }
        this.disposeAtI(io, --io.i)
      }
      // remove separator
      io.removeSeparators = true
      // this is the placeholder recorded
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
      // This is a regular input, not a separator
      // but it will be changed to a separator
      io.removePrevious = io.ezp.isSeparator = true
      io.removeSeparators = true
    }
  }
}

/**
 * Walk through the input list
 */
ezP.ListConsolidator.prototype.walk = function(io) {
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
ezP.ListConsolidator.prototype.consolidate = function(block) {
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
 * List consolidator for list_display and set_display.
 * Remove empty place holders, add separators
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....

 */
ezP.ListConsolidator.Singled = function(require, single, require_all, canBeVoid = true, defaultSep = ',') {
  ezP.ListConsolidator.Singled.superClass_.constructor.call(this, require, canBeVoid, defaultSep)
  this.single = single
  this.require_all = require_all
}
goog.inherits(ezP.ListConsolidator.Singled, ezP.ListConsolidator)

ezP.ListConsolidator.Singled.prototype.single = undefined
ezP.ListConsolidator.Singled.prototype.require_all = undefined

/**
 * Returns the required types for the current input.
 * @param {!Object} io parameter.
 */
ezP.ListConsolidator.Singled.prototype.getCheck = function (io) {
  if (io.single || io.end < io.start + 2) {
    return this.require_all
  } else if (io.end == io.start + 3 && io.i == io.start + 1) {
    return this.require_all
  } else {
    return this.require
  }
}

/**
 * Take appropriate actions depending on the current input
 */
ezP.ListConsolidator.Singled.prototype.one_step = function(io) {
  ezP.ListConsolidator.Singled.superClass_.one_step.call(this, io)
  var target = io.c8n.targetConnection
  if (target && target.check_.indexOf(this.single) != -1) {
    io.single = io.i
  }
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 */
ezP.ListConsolidator.Singled.prototype.cleanup = function(io) {
  if (io.single !== undefined) {
    io.n = 0
    io.i = io.single
    this.setupIO(io)
    this.doFinalizePlaceholder(io)
    this.disposeFromStartToI(io)
    this.nextInput(io)
    // this.disposeFromIToEnd(io)
  } else {
    ezP.ListConsolidator.Singled.superClass_.cleanup.call(this, io)
  }
}

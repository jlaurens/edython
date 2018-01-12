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

goog.require('ezP.DelegateSvg')

/**
 * List consolidator.
 * Remove empty place holders, add separators
 * Main entry: consolidate
 */
ezP.DelegateSvg.ListConsolidator = function() {
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
    goog.asserts.assert(!io.ezp || io.c8n, 'List items must have a connection')
  } else {
    io.ezp = io.c8n = null
  }
}

/**
 * Finalize the current input as a placeholder.
 * @param {!Object} io parameter.
 */
ezP.DelegateSvg.ListConsolidator.prototype.doFinalizePlaceholder = function (io) {
  io.ezp.n = io.n
  io.ezp.sep = io.sep
  io.input.name = 'ITEM_' + io.n++
  io.ezp.isSeparator = io.c8n.isSeparatorEZP = false
}

/**
 * Get the next input. Returns null when at end.
 * @param {!Object} io parameter.
 */
ezP.DelegateSvg.ListConsolidator.prototype.getNext = function (io) {
  ++io.i
  this.setupIO(io)
  return io.input
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
ezP.DelegateSvg.ListConsolidator.prototype.disposeFromEnd = function (io) {
  while (io.i < io.end) {
    this.disposeAtI(io, io.i)
  }
  this.setupIO(io)
}
ezP.DelegateSvg.ListConsolidator.prototype.disposeToStart = function (io) {
  while (io.start < io.i) {
    this.disposeAtI(io, io.start)
    --io.i
  }
  this.setupIO(io)
}
ezP.DelegateSvg.ListConsolidator.prototype.insertPlaceholderAtI = function (io) {
  var c8n = io.block.makeConnection_(Blockly.INPUT_VALUE)
  var input = new Blockly.Input(Blockly.INPUT_VALUE, '_', io.block, c8n)
  io.list.splice(io.i, 0, input)
  ++io.end
  this.setupIO(io)
}

ezP.DelegateSvg.ListConsolidator.prototype.doFinalizeSeparator = function (io, extreme) {
  io.ezp.n = n
  io.ezp.sep = io.sep
  io.input.name = 'S7R_' + n
  io.ezp.isSeparator = io.c8n.isSeparatorEZP = true
  if (extreme) {
    while (io.input.fieldRow.length) {
      io.input.fieldRow.shift().dispose()
    }
  } else if (!io.input.fieldRow.length) {
    io.input.appendField(new ezP.FieldLabel(io.sep || ','))
  }
}

/**
 * List consolidator.
 * Removes empty place holders
 */
ezP.DelegateSvg.ListConsolidator.prototype.consolidate = function(block) {
  var io = {
    block: block,
    list: io.block.inputList,
    i: 0,
    start: 0,
    end: 0,
    input: undefined,
    ezp: undefined,
    n: 0,
    c8n: undefined
  }
  this.setupIO(io)
  do {
    if (!!io.ezp) {
      // group bounds and connected
      io.n = 0
      io.sep = io.ezp.sep || ','
      io.start = io.i
      var connected = 0
      var removeSep = false
      var placeholder
      do {
        if (io.c8n.isConnected()) {
          ++connected
          removeSep = io.ezp.isSeparator = false
        } else if (removeSep) {
          this.disposeAtI(io, io.i--)
        } else if (!io.ezp.isSeparator) {
          // remove separators before
          while (io.i > io.start) {
            if (!io.list[io.i - 1].ezpListData.isSeparator) {
              break
            }
            this.disposeAtI(io, --io.i)
          }
          removeSep = io.ezp.isSeparator = true
          placeholder = io.i
        }
      } while (this.getNext(io) && !!io.ezp)
      io.end = io.i// this group has index [start, end[
      io.n = 0
      io.i = io.start
      this.setupIO(io)
      if (connected) {
        if (!ezp.isSeparator) {
          this.insertPlaceholderAtI(io)
          io.ezp.isSeparator = true
        }
        this.doFinalizeSeparator(io, true)
        while (io.n < connected) { // eslint-disable-line no-unmodified-loop-condition
          this.getNext(io)
          while (io.ezp.isSeparator) {
            this.disposeAtI(io, io.i)
            this.setupIO(io)
          }
          this.doFinalizePlaceholder(io) // increment n
          this.getNext(io)
          if (!ezp.isSeparator) {
              this.insertPlaceholderAtI(io)
              io.ezp.isSeparator = true
            }
            this.doFinalizeSeparator(io, io.i === io.end - 1)
        }
        while (this.getNext(io) && !!io.ezp) {
          this.disposeAtI(io, io.i)
          this.setupIO(io)
        }
      } else if (placeholder !== undefined) {
        io.i = placeholder
        this.setupIO(io)
        io.ezp.isSeparator = false
        this.doFinalizePlaceholder(io)
        this.disposeToStart(io)
        this.getNext(io)
        this.disposeFromEnd(io)
      } else {
        this.disposeToStart(io)
        this.insertPlaceholderAtI(io)
        this.doFinalizePlaceholder(io)
        this.getNext(io)
      }
      do {
        if (!!io.ezp) {
          this.disposeFromEnd(io)
          return
        }
      } while (this.getNext(io))
      return
    }
  } while (this.getNext(io))
}

ezP.DelegateSvg.List.parenth_form = function (prototypeName) {
  ezP.DelegateSvg.List.parenth_form.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.Delegate.NonVoidListConsolidator, ezP.DelegateSvg.ListConsolidator)

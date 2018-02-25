/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Consolidators for various list blocks and proper_slice, for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Consolidator.List')

goog.require('ezP.Const')
goog.require('ezP.Type')
goog.require('ezP.Input')
goog.require('ezP.DelegateSvg')


/**
 * Consolidator. Fake abstract class, just here for the record and namespace.
 * Any dynamic block must be consolidated.
 * A dynamic block changes its inputs while alive.
 * Default constructor does nothing
 * Main entry: consolidate
 * These are implemented as potential singletons but are not used as is.
 * TODO: use singletons...
 */
ezP.Consolidator = function() {
}

/**
 * Main and unique entry point.
 * Removes empty place holders
 * @param {!Block} block, to be consolidated....
 */
ezP.Consolidator.prototype.consolidate = undefined

/**
 * List consolidator.
 * Remove empty place holders, add separators
 * Main entries: consolidate and getInput.
 * The idea is to create the input elements
 * only when needed.
 * The undo/redo management is based on the name
 * of the input, which means that naming should be done
 * dynamically.
 * We start with only one input named 'ITEM_1'.
 * All the items are named either 'ITEM_...' or 'S7R_...',
 * depending on the type of input.
 * When connected, an item is named 'ITEM_...',
 * There is in general one 'S7R_...' between 2 'ITEM_...'s,
 * those separators are displayed with a small lentisque,
 * and accept connections.
 * The indices represent the fractional part of
 * a decimal number in [0; 1[.
 * The initial list is
 * 'ITEM_1'
 * When the first item is connected, this list becomes
 * 'S7R_0', 'ITEM_1', 'S7R_1'
 * Foreach triple 'S7R_xxx', 'ITEM_yyy', 'S7R_zzz' of consecutive elements of the list, we have
 * 0.xxx < 0.yyy = 0.zzz
 * If we connect 'S7R_xxx', the new list will become
 * 'S7R_xxx', 'ITEM_zzz', 'S7R_zzz', 'ITEM_yyy', 'S7R_yyy'
 * such that 0.xxx < 0.zzz < 0.yyy
 * There are many decimal numbers between 0.xxx and 0.yyy, we choose the closest to 0.xxx with the smallest number of digits.
 * @param {!Object} data, all the data needed
 */
ezP.Consolidator.List = function(data) {
  goog.asserts.assert(data.check !== undefined, 'Lists must type check their items or ... ')
  this.data = data
}

/**
 * Setup the io parameter dictionary.
 * Called when the input list has changed and or the index has changed.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.setupIO = function (io) {
  if ((io.input = io.list[io.i])) {
    io.ezp = io.input.ezpData
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
ezP.Consolidator.List.prototype.nextInput = function (io) {
  ++io.i
  this.setupIO(io)
  return !!io.input && io.ezp.listed_
}

/**
 * Returns the required types for the current input.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.getCheck = function (io) {
  return this.data.check
}

/**
 * Finalize the current input as a placeholder.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.doFinalizePlaceholder = function (io, optional = false) {
  io.ezp.n = io.n
  io.ezp.sep = io.sep
  io.input.name = 'ITEM_' + io.n++
  io.ezp.s7r_ = io.c8n.ezp.s7r_ = false
  var check = this.getCheck(io)
  io.input.setCheck(check)
  io.c8n.ezp.optional_ = optional
  io.c8n.ezp.plugged_ = this.plugged
  if (!io.connected && !this.data.empty && !io.c8n.isConnected()) {
    io.c8n.ezp.hole_data = ezP.HoleFiller.getData(check, io.block.ezp.hole_value)
    io.block.ezp.can_fill_holes = io.block.ezp.can_fill_holes || !! io.c8n.ezp.hole_data
  }
  while (io.input.fieldRow.length) {
    io.input.fieldRow.shift().dispose()
  }
}

/**
 * Dispose of the input at the given index.
 * No range checking.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.disposeAtI = function (io, i) {
  io.list[i].dispose()
  io.list.splice(i, 1)
  --io.end
}

/**
 * Insert the given input at the given index.
 * No range checking.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.insertAtI = function (io, i, input) {
  io.list.splice(i, 0, input)
  ++io.end
}
ezP.Consolidator.List.prototype.disposeFromIToEnd = function (io) {
  while (io.i < io.end) {
    this.disposeAtI(io, io.i)
  }
  this.setupIO(io)
}
ezP.Consolidator.List.prototype.disposeFromStartToI = function (io) {
  while (io.start < io.i) {
    this.disposeAtI(io, io.start)
    --io.i
  }
  this.setupIO(io)
}
ezP.Consolidator.List.prototype.insertPlaceholderAtI = function (io) {
  var c8n = io.block.makeConnection_(Blockly.INPUT_VALUE)
  var input = new Blockly.Input(Blockly.INPUT_VALUE, 'ITEM_*', io.block, c8n)
  ezP.Input.setupEzpData(input, {listed_: true})
  this.insertAtI(io, io.i, input)
  this.setupIO(io)
  return input
}

ezP.Consolidator.List.prototype.doFinalizeSeparator = function (io, extreme) {
  io.ezp.n = io.n
  io.ezp.sep = io.sep
  io.input.name = 'S7R_' + io.n
  io.ezp.s7r_ = io.c8n.ezp.s7r_ = true
  if (extreme || io.ezp.sep.length == 0) {
    while (io.input.fieldRow.length) {
      io.input.fieldRow.shift().dispose()
    }
  } else if (!io.input.fieldRow.length) {
    var field = new ezP.FieldLabel(io.sep || this.data.sep)
    io.input.fieldRow.splice(0, 0, field)
    field.setSourceBlock(io.block)
    if (io.block.rendered) {
      field.init()
    }
  }
  io.input.setCheck(this.getCheck(io))
  io.input.connection.ezp.plugged_ = this.data.plugged
}

/**
 * Whether the list can be void
 */
ezP.Consolidator.List.prototype.no_more_ezp = function(io) {
  do {
    if (!!io.ezp) {
      this.disposeFromIToEnd(io)
      return
    }
  } while (this.nextInput(io))
}
/**
 * One of 2 situations at the end of this call
 * 1) only one separator input
 * 2) an even number of inputs: separator, connected item, separator, ...
 */
ezP.Consolidator.List.prototype.cleanup = function(io) {
  io.n = 0
  io.i = io.start
  this.setupIO(io)
  if (io.connected) {
    if (!io.ezp.s7r_) {
      this.insertPlaceholderAtI(io)
      io.ezp.s7r_ = true
    }
    this.doFinalizeSeparator(io, true)
    while (io.n < io.connected) {
      this.nextInput(io)
      while (io.ezp.s7r_) {
        this.disposeAtI(io, io.i)
        this.setupIO(io)
      }
      this.doFinalizePlaceholder(io) // increment n
      this.nextInput(io)
      if (!io.ezp.s7r_) {
        this.insertPlaceholderAtI(io)
        io.ezp.s7r_ = true
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
    this.doFinalizePlaceholder(io, this.data.empty)
    this.nextInput(io)
    this.disposeFromIToEnd(io)
  } else {
    io.i = io.start
    this.setupIO(io)
    if (io.end === io.start) {
      this.insertPlaceholderAtI(io)
    }
    if (this.data.empty) {
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
 * At the end, we are sure that the list is an alternation of
 * separators and regular items from io.start to io.i included.
 * It may start with a separator or not.
 */
ezP.Consolidator.List.prototype.one_step = function(io) {
  if (io.c8n.isConnected()) {
    if (io.s7r_expected || !io.s7r_previous) {
      this.insertPlaceholderAtI(io)
      io.ezp.s7r_ = io.s7r_previous = true
      io.s7r_expected = false
      return
    } else {
      // should the first connected input be preceded by a separator?
      // depending on the type on the connected block, some lists may
      // restrict to a single element. See the ...Single... subclass below
      // and argument_list too.
      // Whether a separator is desired as first input will be knwon at
      // the end of the walk
      if (!io.first_connected) {
        io.first_connected = io.input
      }
      // count the number of connected blocks
      ++io.connected
      // this input is not a separator
      io.ezp.s7r_ = io.s7r_previous = false
      // Next step should be a separator
      io.s7r_expected = true
      return
    }
  } else if (io.ezp.s7r_) {
    // it is a separator
    if (io.s7r_expected) {
      io.s7r_previous = true
      io.s7r_expected = false
    } else {
      // there is already a separator before,
      // just remove this current separator input
      this.disposeAtI(io, io.i--)
    }
    return
  } else if (io.placeholder === undefined) {
    // If we delete inputs that were connected, things may go wrong
    // I do not remember what exactly, may be related to undo management
    // This input is not connected, it will eventually become a separator
    // remove separators before
    // the problem:
    // 1) a list that can be void
    // 2) only one connected block in the list
    // 3) drag a new block on the old one
    // 4) the new block seems connected but is partially bumped away
    // it is located far from the list, but its svg is still embedded
    // in the list's one. Despite the new block is far from the list,
    // moving it around really disconnects it playing the proper sound.

    while (io.i > io.start) {
      if (!io.list[io.i - 1].ezpData.s7r_) {
        break
      }
      this.disposeAtI(io, --io.i)
    }
    // This is the separator we keep
    io.ezp.s7r_ = io.s7r_previous = true
    // remove forthcoming separators
    io.s7r_expected = false
    // this is the placeholder recorded
    io.placeholder = io.i
    return
  } else {
    // remove separators before, but keep the placeholder
    while (io.i > io.placeholder) {
      if (!io.list[io.i - 1].ezpData.s7r_) {
        break
      }
      this.disposeAtI(io, --io.i)
    }
    // This was a regular input, not a separator, but we change it
    io.ezp.s7r_ = io.s7r_previous = true
    io.s7r_expected = false
  }
}

/**
 * Walk through the input list
 */
ezP.Consolidator.List.prototype.walk = function(io) {
  do {
    this.one_step(io)
  } while (this.nextInput(io))
  if (io.s7r_expected) {
    this.insertPlaceholderAtI(io)
    io.ezp.s7r_ = true
    io.s7r_expected = false
    this.nextInput(io)
  }
  io.end = io.i // this group has index [start, end[
  // if we find a further input with ezpData
  // delete it and everything thereafter
  this.no_more_ezp(io)
  // then cleanup
  this.cleanup(io)
}

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {Object} io, parameters....
 */
ezP.Consolidator.List.prototype.prepareToWalk = function(io) {
  io.n = 0
  io.sep = io.ezp.sep || this.data.sep
  io.start = io.i
  io.connected = 0
  io.s7r_expected = io.list.length>1
  io.s7r_previous = false
  io.first_connected = undefined
}

/**
 * List consolidator.
 * Removes empty place holders
 * @param {!Block} block, to be consolidated....
 */
ezP.Consolidator.List.prototype.consolidate = function(block) {
  var io = {
    block: block,
    i: 0,
  }
  io.list = io.block.inputList
  this.setupIO(io)
  do {
    if (!!io.ezp) {
      // group bounds and connected connections
      this.prepareToWalk(io)
      this.walk(io)
      return
    }
  } while (this.nextInput(io))
  goog.asserts.assert(false, 'There is absolutely nothing to consolidate.')
}

/**
 * Fetches the named input object
 * @param {!Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
ezP.Consolidator.List.prototype.getInput = function (block, name) {
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
  var io = {
    block: block,
    i: 0,
    name: name,
  }
  io.list = io.block.inputList
  this.setupIO(io)
  do {
    if (!!io.ezp && !io.ezp.s7r_ && io.ezp.n === n) {
      return io.input
    }
  } while (this.nextInput(io))
  this.insertPlaceholderAtI(io)
  io.ezp.s7r_ = true
  var input = this.insertPlaceholderAtI(io)
  if (io.i > 1) {
    --io.i
    this.setupIO(io)
    io.n = io.ezp.n
    io.sep = io.ezp.sep
    this.doFinalizeSeparator(io, false)
    ++io.i
    this.setupIO(io)
  }
  ++io.n
  this.doFinalizePlaceholder(io)
  ++io.i
  ++io.n
  this.doFinalizeSeparator(io, true)
    return input
}

/**
 * List consolidator for list_display and set_display.
 * Remove empty place holders, add separators.
 * Management of lists with one or many items.
 * When there is only one element of the single type,
 * there is no room for any other element.
 * `all` is the union of single and check.
 * Main entry: consolidate
 * In the list there might be either as many blocks of type check
 * or only one block of type single.
 * Both given types must be orthogonal.
 * There should not exist blocks that provide both types.
 * @param {!String} check the required type for many items
 * @param {!String} single the required type for a single element....
 */
ezP.Consolidator.List.Singled = function(data) {
  ezP.Consolidator.List.Singled.superClass_.constructor.call(data)
}
goog.inherits(ezP.Consolidator.List.Singled, ezP.Consolidator.List)

/**
 * Returns the required types for the current input.
 * Returns `all` if the list is void
 * or if there is only one item to be replaced.
 * In all other situations, return this.data.check.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.Singled.prototype.getCheck = function (io) {
  if (io.single || io.end < io.start + 2) {
    // a single block or no block at all
    return this.data.all
  } else if (io.end == io.start + 3 && io.i == io.start + 1) {
    // there is only one item in the list
    // and it can be replaced by any kind of block
    return this.data.all
  } else {
    // blocks of type check are already there
    return this.data.check
  }
}

/**
 * Take appropriate actions depending on the current input
 */
ezP.Consolidator.List.Singled.prototype.one_step = function(io) {
  ezP.Consolidator.List.Singled.superClass_.one_step.call(this, io)
  var target = io.c8n.targetConnection
  if (target && target.check_.indexOf(this.data.single) >= 0) {
    io.single = io.i
  }
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 */
ezP.Consolidator.List.Singled.prototype.cleanup = function(io) {
  if (!!io.single) {
    io.n = 0
    io.i = io.single
    this.setupIO(io)
    this.doFinalizePlaceholder(io)
    this.disposeFromStartToI(io)
    this.nextInput(io)
    this.disposeFromIToEnd(io)
  } else {
    ezP.Consolidator.List.Singled.superClass_.cleanup.call(this, io)
  }
}

/**
 * List consolidator for parameter list.
 * A parameter list contains 3 kinds of objects
 * 1) parameters as identifiers, (possibly annotated or defaulted)
 * 2) '*' identifier
 * 3) '**' identifier
 * Here are the rules
 * A) The starred identifiers must appear only once at most.
 * B) The single starred must appear before the double starred, if any
 * C) The double starred must be the last one if any
 * D) Citing the documentation:
 *    If a parameter has a default value,
 *    all following parameters up until the “*”
 *    must also have a default value...
 */
ezP.Consolidator.Parameters = function() {
  ezP.Consolidator.Parameters.superClass_.constructor.call(this, ezP.Consolidator.Parameters.data)
}
goog.inherits(ezP.Consolidator.Parameters, ezP.Consolidator.List)

ezP.Consolidator.Parameters.data = {
  check: ezP.T3.Expr.Check.primary,
  empty: true,
  sep: ',',
}


/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {Object} io, parameters....
 */
ezP.Consolidator.Parameters.prototype.prepareToWalk = function(io) {
  ezP.Consolidator.Parameters.superClass_.prepareToWalk.call(this, io)
  io.first_parameter_star = undefined
  io.first_parameter_star_star = undefined
  io.first_parameter_default = undefined
  io.errors = 0
}

ezP.Consolidator.Parameters.Type = {
  unconnected: 'unconnected',
  parameter: 'parameter',
  parameter_default: 'parameter_default',
  parameter_star: 'parameter_star',
  parameter_star_star: 'parameter_star_star',
}

/**
 * Whether the input corresponds to an identifier...
 * @param {Object} io, parameters....
 */
ezP.Consolidator.Parameters.prototype.getCheckType = function(io) {
  var target = io.c8n.targetBlock()
  if (!target) {
    return ezP.Consolidator.Parameters.Type.unconnected
  }
  var check = target.outputConnection.check_
  if (goog.array.contains(check,ezP.T3.Expr.parameter_star)) {
    return ezP.Consolidator.Parameters.Type.parameter_star
  } else if (goog.array.contains(check,ezP.T3.Expr.parameter_star_star)) {
    return ezP.Consolidator.Parameters.Type.parameter_star_star
  } else if (goog.array.contains(check,ezP.T3.Expr.parameter_default)) {
    return ezP.Consolidator.Parameters.Type.parameter_default
  } else {
    return ezP.Consolidator.Parameters.Type.parameter
  }
}

/**
 * Call the inherited method, then records the various first_... indices
 */
ezP.Consolidator.Parameters.prototype.one_step = function(io) {
  // inherit
  ezP.Consolidator.Parameters.superClass_.one_step.call(this, io)
  // move input around if necessary
  io.ezp.parameter_type_ = this.getCheckType(io)
  io.ezp.error_ = false
  if (io.ezp.parameter_type_ == ezP.Consolidator.Parameters.Type.unconnected) {
    return
  }
  var i = undefined
  switch(io.ezp.parameter_type_) {
    case ezP.Consolidator.Parameters.Type.parameter_star_star:
      if (!io.first_parameter_star_star) {
        io.first_parameter_star_star = io.input
      }
      break
    case ezP.Consolidator.Parameters.Type.parameter_star:
      if (!io.first_parameter_star) {
        // this is an error
        io.first_parameter_star = io.input
      }
      break
    case ezP.Consolidator.Parameters.Type.parameter_default:
      if (!io.first_parameter_default) {
        io.first_parameter_default = io.input
      }
      break
  }
}
/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 */
ezP.Consolidator.Parameters.prototype.cleanup = function(io) {
  ezP.Consolidator.Parameters.superClass_.cleanup.call(this, io)
  // first remove all the extra ** parameters
  var i = io.list.indexOf(io.first_parameter_star_star)
  if (i>=0) {
    io.i = i+2
    while (io.i < io.end) {
      this.setupIO(io)
      if (io.ezp.parameter_type_ == ezP.Consolidator.Parameters.Type.parameter_star_star) {
        this.disposeAtI(io, io.i)
        this.setupIO(io)
        if (io.ezp.s7r_) {
          this.disposeAtI(io, io.i)
        } else {
          ++io.i
        }
      } else {
        ++io.i
      }
    }
    // move this parameter to the end of the list and remove a space
    io.i = i
    this.setupIO(io)
    // remove the following separator
    this.disposeAtI(io, i+1)
    if (i+1<io.end) {
      // we did not remove the last separator, so this ** parameter is not last
      this.disposeAtI(io, i)
      this.insertAtI(io, i, io.input)
    }
    // Now this is the last, with no separator afterwards
  }
  // Now remove any extra * parameter
  i = io.list.indexOf(io.first_parameter_star)
  if (i>=0) {
    io.i = i+2
    while (io.i < io.end) {
      this.setupIO(io)
      if (io.ezp.parameter_type_ == ezP.Consolidator.Parameters.Type.parameter_star) {
        this.disposeAtI(io, io.i)
        this.setupIO(io)
        if (io.ezp.s7r_) {
          this.disposeAtI(io, io.i)
        } else {
          ++io.i
        }
      } else {
        ++io.i
      }
    }
  }
  // now force default values 
  io.i = io.list.indexOf(io.first_parameter_default)
  if (io.i>=0) {
    while( io.i < i) {
      this.setupIO(io)
      if (io.ezp.parameter_type_ == ezP.Consolidator.Parameters.Type.parameter) {
        var target = io.c8n.targetBlock()
        target.ezp.missing_default_value_error_ = true
        // TODO: ask the block to change its own nature
        console.log('Missing defaut value at index:', io.i)
      }
      ++io.i
    }
  }
}

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {!Object} io parameter.
 */
ezP.Consolidator.Parameters.prototype.getCheck = function (io) {
  var can_star = !io.first_parameter_star || io.first_parameter_star == io.input
  var can_star_star = (!io.first_parameter_star_star && io.i == io.end-1) || io.first_parameter_star_star == io.input
  if (can_star_star) {
    if (can_star) {
      return ezP.T3.Expr.Check.parameter_any
    } else {
      return ezP.T3.Expr.Check.parameter_no_single_star
    }
  } else if (can_star) {
    return ezP.T3.Expr.Check.parameter_no_star_star
  } else {
    return ezP.T3.Expr.Check.parameter_no_star
  }
}


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
 * Main entry: consolidate
 * @param {!Array} require, an array of required types, in general one of the ezp.T3.Required....
 * @param {Bool} canBeVoid, whether the list can be void. Non void lists will display a large placeholder.
 * @param {String} defaultSep, the separator between the list items
 */
ezP.Consolidator.List = function(require, canBeVoid, defaultSep) {
  goog.asserts.assert(require, 'Lists must type check their items.')
  this.require = require
  if (canBeVoid) {
    this.canBeVoid = canBeVoid
  }
  if (defaultSep) {
    this.defaultSep = defaultSep
  }
}

ezP.Consolidator.List.prototype.require = undefined
ezP.Consolidator.List.prototype.canBeVoid = true
ezP.Consolidator.List.prototype.defaultSep = ','

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
  return this.require
}

/**
 * Finalize the current input as a placeholder.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.doFinalizePlaceholder = function (io) {
  io.ezp.n = io.n
  io.ezp.sep = io.sep
  io.input.name = 'ITEM_' + io.n++
  io.ezp.s7r_ = io.c8n.ezpData.s7r_ = false
  io.input.setCheck(this.getCheck(io))
}

/**
 * Get the next input. Returns null when at end.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.disposeAtI = function (io, i) {
  io.list[i].dispose()
  io.list.splice(i, 1)
  --io.end
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
  ezP.Input.setupEzpData(input)
  input.ezpData.listed_ = true
  io.list.splice(io.i, 0, input)
  ++io.end
  this.setupIO(io)
}

ezP.Consolidator.List.prototype.doFinalizeSeparator = function (io, extreme) {
  io.ezp.n = io.n
  io.ezp.sep = io.sep
  io.input.name = 'S7R_' + io.n
  io.ezp.s7r_ = io.c8n.ezpData.s7r_ = true
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
ezP.Consolidator.List.prototype.no_more_ezp = function(io) {
  do {
    if (!!io.ezp) {
      this.disposeFromIToEnd(io)
      return
    }
  } while (this.nextInput(io))
}
/**
 * One of 2 situations at the end
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
    // This input is not connected, it will become a separator
    // remove separators before
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
  io.sep = io.ezp.sep || this.defaultSep
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
 * List consolidator for list_display and set_display.
 * Remove empty place holders, add separators
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
ezP.Consolidator.List.Singled = function(require, single, require_all, canBeVoid = true, defaultSep = ',') {
  ezP.Consolidator.List.Singled.superClass_.constructor.call(this, require, canBeVoid, defaultSep)
  this.single = single
  this.require_all = require_all
}
goog.inherits(ezP.Consolidator.List.Singled, ezP.Consolidator.List)

ezP.Consolidator.List.Singled.prototype.single = undefined
ezP.Consolidator.List.Singled.prototype.require_all = undefined

/**
 * Returns the required types for the current input.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.Singled.prototype.getCheck = function (io) {
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
ezP.Consolidator.List.Singled.prototype.one_step = function(io) {
  ezP.Consolidator.List.Singled.superClass_.one_step.call(this, io)
  var target = io.c8n.targetConnection
  if (target && target.check_.indexOf(this.single) != -1) {
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
    // this.disposeFromIToEnd(io)
  } else {
    ezP.Consolidator.List.Singled.superClass_.cleanup.call(this, io)
  }
}

/**
 * List consolidator for argument list.
 * We do not remove connected blocks as long as they have the correct type.
 * We just move input around in order to have a proper ordering.
 * 1) If there is a comprehension, it must be alone.
 * 2) positional arguments come first, id est expression and starred expressions
 * 3) then come starred expressions or keyword items
 * 4) finally come keyword items or double starred expressions
 * Let's explain this in a table
 * |    | KV | ** |
 * |----|----|----|
 * | X  | <  | <  |
 * | *  |    | <  |
 * When there are many inputs, the ordering rules may read
 * a) expressions come before keyword items and double starred expressions
 * b) starred expressions must come before double starred expressions
 * To fulfill these rules, we keep track of
 * - the first keyword item
 * - the first double starred expression
 * If we find a starred expression that is after the first double starred expression,
 * we move it just before it.
 * If we find an expression that is after the fist KV, we move it just before it.
 * If we find an expression that is after the first double starred expression,
 * we move it just before it.
 * It would be more difficult to merge the last 2 management within one test because each movement implies the shift of the first input we compare to.
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
ezP.Consolidator.List.Argument = function() {
  ezP.Consolidator.List.Argument.superClass_.constructor.call(this, ezP.T3.Require.primary, true, ',')
}
goog.inherits(ezP.Consolidator.List.Argument, ezP.Consolidator.List)

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {Object} io, parameters....
 */
ezP.Consolidator.List.Argument.prototype.prepareToWalk = function(io) {
  ezP.Consolidator.List.Argument.superClass_.prepareToWalk.call(this, io)
  io.first_connected = undefined
  io.last_comprehension = undefined
  io.first_keyword_or_double_starred = undefined
  io.first_double_starred = undefined
  io.last_positional = undefined // either expression or starred expression
  io.last_expression = undefined
  io.errors = 0
}

ezP.Consolidator.List.Argument.Type = {
  unconnected: 'unconnected',
  comprehension: 'comprehension',
  expression: 'expression',
  starred_expression: 'starred_expression',
  keyword_item: 'keyword_item',
  double_starred_expression: 'double_starred_expression',
}

/**
 * Whether the input corresponds to a comprehension argument.
 * @param {Object} io, parameters....
 */
ezP.Consolidator.List.Argument.prototype.getCheckType = function(io) {
  var target = io.c8n.targetBlock()
  if (!target) {
    return ezP.Consolidator.List.Argument.Type.unconnected
  }
  var check = target.outputConnection.check_
  if (goog.array.contains(check,ezP.T3.comprehension)) {
    return ezP.Consolidator.List.Argument.Type.comprehension
  } else if (goog.array.contains(check,ezP.T3.starred_expression)) {
    return ezP.Consolidator.List.Argument.Type.starred_expression
  } else if (goog.array.contains(check,ezP.T3.keyword_item)) {
    return ezP.Consolidator.List.Argument.Type.keyword_item
  } else if (goog.array.contains(check,ezP.T3.double_starred_expression)) {
    return ezP.Consolidator.List.Argument.Type.double_starred_expression
  } else {
    return ezP.Consolidator.List.Argument.Type.expression
  }
}

/**
 * Call the inherited method, then records the various first_... indices
 */
ezP.Consolidator.List.Argument.prototype.one_step = function(io) {
  // inherit
  ezP.Consolidator.List.Argument.superClass_.one_step.call(this, io)
  // move input around if necessary
  io.ezp.argument_type_ = this.getCheckType(io)
  io.ezp.error_ = false
  if (io.ezp.argument_type_ == ezP.Consolidator.List.Argument.Type.unconnected) {
    return
  }
  if (!this.first_connected) {
    this.first_connected = io.input
  }
  var i = undefined
  switch(io.ezp.argument_type_) {
    case ezP.Consolidator.List.Argument.Type.comprehension:
      if (io.last_comprehension) {
        // will insert just after io.last_comprehension
        i = goog.array.indexOf(io.list, io.last_comprehension) + 1
        io.last_comprehension = io.input
        // move this input in front, after the last comprehension
        goog.asserts.assert(i <= io.i, 'Internal inconsistency: '+i+ ' <= '+io.i)
        io.list.splice(io.i, 1);
        io.list.splice(i, 0, io.input)
        // now io.i point to the separator that was before the input
        this.setupIO(io)
        goog.asserts.assert(io.ezp.s7r_, 'Internal inconsistency: missing separator')
        // insert at io.last_comprehension
        io.list.splice(i, 0, io.input)
        this.setupIO(io)
      } else {
        io.last_comprehension = io.input
      }
      break
    case ezP.Consolidator.List.Argument.Type.expression:
      if (io.first_keyword_or_double_starred) {
        // there are at least 2 connected inputs
        // this one should not be there
        i = goog.array.indexOf(io.list, io.first_keyword_or_double_starred)
        goog.asserts.assert(i < io.i, 'Internal inconsistency: '+i+ ' < '+io.i)
        io.last_expression = io.input
        io.list.splice(io.i, 1);
        io.list.splice(i, 0, io.input)
        // now io.i point to the separator that was before the positional input
        this.setupIO(io)
        goog.asserts.assert(io.ezp.s7r_, 'Internal inconsistency: missing separator')
        if (!io.last_positional || goog.array.indexOf(io.list, io.last_positional, i+2)<0) {
          io.last_positional = io.last_expression
        }
        io.list.splice(i+1, 0, io.input)
        this.setupIO(io)
      } else {
        io.last_expression = io.last_positional = io.input
      }
      break
      case ezP.Consolidator.List.Argument.Type.starred_expression:
      if (io.first_double_starred) {
        io.last_positional = io.first_double_starred
        // there are at least 2 connected inputs
        // this one should not be there
        io.list.splice(io.i, 1);
        io.list.splice(io.first_double_starred, 0, io.input)
        ++io.first_double_starred
        // now io.i point to the separator that was before the positional input
        this.setupIO(io)
        goog.asserts.assert(io.ezp.s7r_, 'Internal inconsistency: missing separator')
        io.list.splice(io.first_double_starred, 0, io.input)
        ++io.first_double_starred
        this.setupIO(io)
      } else {
        io.last_positional = io.input
      }
    break
    case ezP.Consolidator.List.Argument.Type.keyword_item:
      if (!io.first_keyword_or_double_starred) {
        io.first_keyword_or_double_starred = io.input
      }
    break
    case ezP.Consolidator.List.Argument.Type.double_starred_expression: 
      if (!io.first_keyword_or_double_starred) {
        io.first_keyword_or_double_starred = io.input
        io.first_double_starred = io.input
      } else if (!io.first_double_starred) {
        io.first_double_starred = io.input
      }
      break
  }
}
/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 */
ezP.Consolidator.List.Argument.prototype.cleanup = function(io) {
  ezP.Consolidator.List.Argument.superClass_.cleanup.call(this, io)
  if (io.last_comprehension) {
    // there must be a unique input
    if (io.connected == 1) {
      // one of the normal situations
      // eventually remove separators after and before
      var i = goog.array.indexOf(io.list, io.last_comprehension)
      while (i + 1 < io.end) {
        this.disposeAtI(io, i + 1)
      }
      while (io.start < i--) {
        this.disposeAtI(io, io.start)
      }
      return
    }
    // there are too many connected blocks, mark the input as faulty
    io.n = 0
    io.i = io.start + 2
    while (this.nextInput(io)) {
      io.ezp.error_ = true
    }
  }
}

/**
 * Returns the required types for the current input.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.Argument.prototype.getCheck = function (io) {
  // is it a situation for comprehension ?
  // only one input or a replacement of the unique connected block
  if (io.connected <= 1 && (io.start + 1 == io.end || io.i == io.start+1)) {
    // console.log('Check: '+io.i+' -> any_argument_comprehensive')
    return ezP.T3.Require.any_argument_comprehensive
  }
  var can_starred = !io.first_double_starred || goog.array.indexOf(io.list, io.first_double_starred, io.i) >= 0
  var can_expression = can_starred && (!io.first_keyword_or_double_starred || goog.array.indexOf(io.list, io.first_keyword_or_double_starred, io.i) >= 0)
  var can_keyword = (!io.last_expression || goog.array.indexOf(io.list, io.last_expression) <= io.i)
  var can_double_starred = (!io.last_positional || goog.array.indexOf(io.list, io.last_positional) <= io.i)
  if (can_expression) {
    if (can_double_starred) {
      // everything, no need to check for starred or keywords
      // console.log('Check: '+io.i+' -> any_argument')
      return ezP.T3.Require.any_argument
    } else if (can_keyword) {
      // everything but double starred
      // console.log('Check: '+io.i+' -> any_argument_but_double_starred_expression')
      return ezP.T3.Require.any_argument_but_double_starred_expression
    } else {
      return ezP.T3.Require.positional_argument
    }
  } else if (can_starred) {
    if (can_double_starred) {
      // everything but expression
      // console.log('Check: '+io.i+' -> any_argument_but_expression')
      return ezP.T3.Require.any_argument_but_expression
    } else if (can_keyword) {
      // starred and keyword
      // console.log('Check: '+io.i+' -> any_argument_but_expression')
      return ezP.T3.Require.starred_and_keyword
    } else {
      // only starred
      return ezP.T3.starred_expression
    }
  } else if (can_double_starred) {
    if (can_keyword) {
      // double starred and keyword
      return ezP.T3.Require.keywords_argument
    } else {
      // only can_double_starred
      return ezP.T3.double_starred_expression
    }
  } else /* if (can_keyword) */ {
    // keyword only
    return ezP.T3.keyword_item
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
ezP.Consolidator.List.Parameter = function() {
  ezP.Consolidator.List.Parameter.superClass_.constructor.call(this, ezP.T3.Require.primary, true, ',')
}
goog.inherits(ezP.Consolidator.List.Parameter, ezP.Consolidator.List)

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {Object} io, parameters....
 */
ezP.Consolidator.List.Parameter.prototype.prepareToWalk = function(io) {
  ezP.Consolidator.List.Parameter.superClass_.prepareToWalk.call(this, io)
  io.first_parameter_starred = undefined
  io.first_parameter_double_starred = undefined
  io.first_parameter_default = undefined
  io.errors = 0
}

ezP.Consolidator.List.Parameter.Type = {
  unconnected: 'unconnected',
  parameter: 'parameter',
  parameter_default: 'parameter_default',
  parameter_starred: 'parameter_starred',
  parameter_double_starred: 'parameter_double_starred',
}

/**
 * Whether the input corresponds to an identifier...
 * @param {Object} io, parameters....
 */
ezP.Consolidator.List.Parameter.prototype.getCheckType = function(io) {
  var target = io.c8n.targetBlock()
  if (!target) {
    return ezP.Consolidator.List.Parameter.Type.unconnected
  }
  var check = target.outputConnection.check_
  if (goog.array.contains(check,ezP.T3.parameter_starred)) {
    return ezP.Consolidator.List.Parameter.Type.parameter_starred
  } else if (goog.array.contains(check,ezP.T3.parameter_double_starred)) {
    return ezP.Consolidator.List.Parameter.Type.parameter_double_starred
  } else if (goog.array.contains(check,ezP.T3.parameter_default)) {
    return ezP.Consolidator.List.Parameter.Type.parameter_default
  } else {
    return ezP.Consolidator.List.Parameter.Type.parameter
  }
}

/**
 * Call the inherited method, then records the various first_... indices
 */
ezP.Consolidator.List.Parameter.prototype.one_step = function(io) {
  // inherit
  ezP.Consolidator.List.Parameter.superClass_.one_step.call(this, io)
  // move input around if necessary
  io.ezp.parameter_type_ = this.getCheckType(io)
  io.ezp.error_ = false
  if (io.ezp.parameter_type_ == ezP.Consolidator.List.Parameter.Type.unconnected) {
    return
  }
  var i = undefined
  switch(io.ezp.parameter_type_) {
    case ezP.Consolidator.List.Parameter.Type.parameter_double_starred:
      if (!io.first_parameter_double_starred) {
        io.first_parameter_double_starred = io.input
      }
      break
    case ezP.Consolidator.List.Parameter.Type.parameter_starred:
      if (!io.first_parameter_starred) {
        // this is an error
        io.first_parameter_starred = io.input
      }
      break
    case ezP.Consolidator.List.Parameter.Type.parameter_default:
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
ezP.Consolidator.List.Parameter.prototype.cleanup = function(io) {
  ezP.Consolidator.List.Parameter.superClass_.cleanup.call(this, io)
  // first remove all the extra ** parameters
  var i = io.list.indexOf(io.first_parameter_double_starred)
  if (i>=0) {
    io.i = i+2
    while (io.i < io.end) {
      this.setupIO(io)
      if (io.ezp.parameter_type_ == ezP.Consolidator.List.Parameter.Type.parameter_double_starred) {
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
    this.disposeAtI(io, i+1)
    if (i+1<io.end) {
      // we did not remove the last separator, so this ** parameter is not last
      this.disposeAtI(io, i)
      io.list.splice(io.end, 0, io.input)  
    }
    // Now this is the last, with no separator afterwards
  }
  // Now remove any extra * parameter
  i = io.list.indexOf(io.first_parameter_starred)
  if (i>=0) {
    io.i = i+2
    while (io.i < io.end) {
      this.setupIO(io)
      if (io.ezp.parameter_type_ == ezP.Consolidator.List.Parameter.Type.parameter_starred) {
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
      if (io.ezp.parameter_type_ == ezP.Consolidator.List.Parameter.Type.parameter) {
        var target = io.c8n.targetBlock()
        target.ezp.missing_default_value_error_ = true
        // TODO: ask the block to change its own nature
        console.log('Missing defaut value at index:', io.i)
      }
      ++io.i
    }
  }
  // Debug: are the connections consistent ?
  for (io.i = io.start; io.i < io.list.length; ++io.i) {
    this.setupIO(io)
    console.log('Input: ', io.i)
    var target = io.c8n.targetBlock()
    if (target) {
      var required = this.getCheck(io)
      var types = target.outputConnection.check_
      var OK = false
      for (i = 0; i < types.length; ++i) {
        var type = types[i]
        if (goog.array.contains(required, type)) {
          OK = true
          break
        }
      }
      if (!OK) {
        console.log('BAD CONNECTION')
        console.log('required', required)
        console.log('provided', required)
        }
    }    
  }
}

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.Parameter.prototype.getCheck = function (io) {
  var can_starred = !io.first_parameter_starred || io.first_parameter_starred == io.input
  var can_double_starred = (!io.first_parameter_double_starred && io.i == io.end-1) || io.first_parameter_double_starred == io.input
  console.log(io.i, can_starred, can_double_starred)
  if (can_double_starred) {
    if (can_starred) {
      return ezP.T3.Require.parameter_any
    } else {
      return ezP.T3.Require.parameter_no_single_starred
    }
  } else if (can_starred) {
    return ezP.T3.Require.parameter_no_double_starred
  } else {
    return ezP.T3.Require.parameter_no_starred
  }
}


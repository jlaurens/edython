/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
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
goog.require('ezP.Do')
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
 * Remove empty place holders, add separators,
 * order non empty place holders.
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
 * The indices are words ordered lexicographically.
 * Letters are [!-~], id est with ascii code in [33; 126].
 * That makes 94 letters
 * (any printable character except space).
 * Foreach triple 'S7R_xxx', 'ITEM_yyy', 'S7R_zzz' of consecutive elements of the list, we have
 * xxx < yyy = zzz
 * If we connect 'S7R_xxx', the new list will become
 * 'S7R_xxx', 'ITEM_zzz', 'S7R_zzz', 'ITEM_yyy', 'S7R_yyy'
 * such that xxx < zzz < yyy
 * There are infinitelly many words between xxx and yyy,
 * we choose the one with the smallest number of characters
 * which is close to the arithmetical mean of xxx and yyy.
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
ezP.Consolidator.List.prototype.setupIO = function (io, i) {
  if (i !== undefined) {
    io.i = i
  }
  if ((io.input = io.list[io.i])) {
    io.ezp = io.input.ezp
    io.c8n = io.input.connection
    goog.asserts.assert(!io.ezp || !!io.c8n, 'List items must have a connection')
    return true
  } else {
    io.ezp = io.c8n = null
    return false
  }
}

/**
 * Advance to the next input. Returns false when at end.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.nextInput = function (io) {
  ++io.i
  return this.setupIO(io)
}

ezP.Consolidator.List.prototype.insertPlaceholder = function (io, i) {
  if (i !== undefined) {
    io.i = i
  }
  var c8n = io.block.makeConnection_(Blockly.INPUT_VALUE)
  c8n.ezp.willConnect = function(c8n, otherC8n) {
    c8n.sourceBlock_.ezp.will_connect_ = true
  }
  c8n.ezp.didConnect = function(c8n, otherC8n) {
    c8n.sourceBlock_.ezp.will_connect_ = false
  }
  var input = new Blockly.Input(Blockly.INPUT_VALUE, '!', io.block, c8n)
  ezP.Input.setupEzpData(input)
  io.list.splice(io.i, 0, input)
  io.edited = true
  this.setupIO(io)
  return input
}

/**
 * Dispose of the input at the given index.
 * No range checking.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.disposeAtI = function (io, i) {
  if (i === undefined) {
    i = io.i
  }
  io.list[i].dispose()
  io.list.splice(i, 1)
  io.edited = true
}

/**
 * Returns the required types for the current input.
 * Assumes that the list of input is correct,
 * no more insertion, no more deletion.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.getCheck = function (io) {
  return this.data.check
}

/**
 * Finalize the current input as a placeholder.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.doFinalizePlaceholder = function (io, name = undefined, optional = false) {
  io.ezp.n = io.n
  io.ezp.sep = io.sep
  io.ezp.s7r_ = io.c8n.ezp.s7r_ = false
  var check = this.getCheck(io)
  if (name && name.length) {
    io.input.name = name
  }
  io.input.setCheck(check)
  io.c8n.ezp.optional_ = optional
  io.c8n.ezp.plugged_ = this.plugged
  if (!io.connected && !this.data.empty && !io.c8n.isConnected()) {
    var value = ezP.DelegateSvg.Manager.getInputsModel(io.block.type).list.hole_value
    io.c8n.ezp.hole_data = ezP.HoleFiller.getData(check, value)
  }
  while (io.input.fieldRow.length) {
    io.input.fieldRow.shift().dispose()
  }
}

ezP.Consolidator.List.prototype.doFinalizeSeparator = function (io, extreme, name) {
  io.ezp.sep = io.sep
  if (name && name.length) {
    io.input.name = name
  }
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
  if (io.block.ezp.locked_) {
    io.c8n.setHidden(true)
  } else if (io.i === 0 && io.noLeftSeparator && io.list.length > 1) {
    io.c8n.setHidden(true)
  } else if (io.i === 2 && 3 === io.list.length && io.noDynamicList) {
    io.c8n.setHidden(true)
  } else {
    io.c8n.setHidden(false)
  }
}

/**
 * Consolidate a connected input but the first one.
 * @param {!Object} io parameter.
 * @return yes exactly if there are more input
 */
ezP.Consolidator.List.prototype.consolidate_connected = function(io) {
  // ensure that there is one input after,
  // which is not connected
  if (!this.nextInput(io) || io.c8n.targetConnection) {
    this.insertPlaceholder(io)
    // this one is connected or missing
    // we would expect a separator
  }
  return this.nextInput(io)
}

/**
 * Consolidate the first connected input
 * @param {!Object} io parameter.
 * @return yes exactly if there are more input
 */
ezP.Consolidator.List.prototype.consolidate_first_connected = function(io) {
  // the actual input is the first connected
  // remove whatever precedes it, except the very first separator, if any
  if (!this.consolidate_single(io)) {
    // nothing more to consolidate
    return false
  }
  var j = io.i
  if (j === 0) {
    // there is an opening separator missing
    this.insertPlaceholder(io)
    this.nextInput(io)
  } else {
    while(j>1) {
      this.disposeAtI(io, --j)
    }
  }
  return this.consolidate_connected(io)
}

/**
 * Consolidate the first connected input when expected to be single.
 * Default implementation return true.
 * @param {!Object} io parameter.
 * @return yes exactly if there are more input
 */
ezP.Consolidator.List.prototype.consolidate_single = function(io) {
  return true
}

/**
 * Find the next connected input
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.gobble_to_connected = function(io) {
  // things are different if one of the inputs is connected
  while (io.ezp) {
    if (io.c8n.targetConnection) {
      return true
    }
    this.disposeAtI(io)
    this.setupIO(io)
  }
  return false
}

/**
 * Find the next connected input
 * @param {!Object} io parameter.
 * @param {!boolean} gobble whether to gobble intermediate inputs.
 */
ezP.Consolidator.List.prototype.walk_to_next_connected = function(io, gobble) {
  // things are different if one of the inputs is connected
  while (!!io.ezp) {
    if (io.c8n.targetConnection) {
      io.sep = io.ezp.sep || this.data.sep
      return true
    }
    if (gobble) {
      this.disposeAtI(io)
      this.setupIO(io)  
    } else {
      this.nextInput(io)  
    }
  }
  return false
}

/**
 * List consolidator.
 * Removes empty place holders
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.consolidate_unconnected = function(io) {
  // remove any separator up to the first placeholder
  this.setupIO(io, 0)
  if (!!io.ezp) {
    while (true) {
      if (io.ezp.s7r_) {
        this.disposeAtI(io)
        if (this.setupIO(io, 0)) {
          continue
        }
        return
      }
      // we found it
      // remove anything behind
      if (this.nextInput(io)) {
        do {
          this.disposeAtI(io)
        } while(this.setupIO(io))
      }
      // Always finalize at last step
      --io.i
      this.setupIO(io)
      this.doFinalizePlaceholder(io,
        ezP.Do.Name.middle_name, this.data.empty)
      return
    }
    // unreachable code
  }
  // create an input
  this.insertPlaceholder(io)
  this.doFinalizePlaceholder(io,
    ezP.Do.Name.middle_name, this.data.empty)
}

/**
 * Cleanup. Subclassers may choose to insert or remove inputs,
 * once the whole list has been managed once.
 * default implementation does nothing.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.doCleanup = function(io) {
}

/**
 * Finalize placeholders and separators.
 * There are at least 2 inputs, a separator and a placeholder. There can be a supplemental separator after.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.doFinalize = function(io) {
  this.setupIO(io, 0)
  if (io.list.length === 1) {
    this.doFinalizePlaceholder(io, undefined, this.data.empty)
    return
  }
  var previous = ezP.Do.Name.min_name
  var next = io.list[io.i + 1].name
  var name = ezP.Do.Name.getBetween(previous, next)
  this.doFinalizeSeparator(io, true, name)
  this.nextInput(io)
  this.doFinalizePlaceholder(io)
  previous = next
  while (this.nextInput(io)) {
    if (io.i === io.list.length - 1) {
      // last separator
      next = ezP.Do.Name.max_name
      name = ezP.Do.Name.getBetween(previous, next)
      this.doFinalizeSeparator(io, true, name)
    } else {
      next = io.list[io.i + 1].name
      name = ezP.Do.Name.getBetween(previous, next)
      this.doFinalizeSeparator(io, false, name)
      previous = next
      this.nextInput(io)
      this.doFinalizePlaceholder(io)
    }
  }
}

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {Object} io, parameters....
 */
ezP.Consolidator.List.prototype.getIO = function(block) {
  var unwrapped = block.ezp.getUnwrapped(block)
  var io = {
    block: block,
    noLeftSeparator: (block.workspace.ezp.options.noLeftSeparator 
      || block.workspace.ezp.options.noDynamicList)
      && (!unwrapped
        || (!unwrapped.ezp.withLeftSeparator_ && !unwrapped.ezp.withDynamicList_)),
    noDynamicList: (block.workspace.ezp.options.noDynamicList)
      && (!unwrapped
        || !unwrapped.ezp.withDynamicList_),
    list: block.inputList,
    sep: this.data.sep,
  }
  this.setupIO(io, 0)
  return io
}

/**
 * List consolidator.
 * Removes empty place holders
 * @param {!Block} block, to be consolidated....
 */
ezP.Consolidator.List.prototype.consolidate = function(block) {
  var io = this.getIO(block)
  // things are different if one of the inputs is connected
  if (this.walk_to_next_connected(io)) {
    if (this.consolidate_first_connected(io)) {
      while (this.walk_to_next_connected(io, true)
        && this.consolidate_connected(io)) {}
    }
    this.doCleanup(io)
    if (io.edited || io.noLeftSeparator || io.noDynamicList) {
      this.doFinalize(io)
    }
  } else {
    this.consolidate_unconnected(io)
  }
}

/**
 * Fetches the named input object
 * @param {!Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
ezP.Consolidator.List.prototype.getInput = function (block, name) {
  // name = ezP.Do.Name.getNormalized(name) not here
  if (!name || !name.length) {
    return null
  }
  this.consolidate(block)
  var j = -1
  var io = this.getIO(block)
  do {
    if (!!io.ezp) {
      io.sep = io.ezp.sep || io.sep
      if (!io.ezp.s7r_) {
        var o = ezP.Do.Name.getOrder(io.input.name, name)
        if (!o) {
          return io.input
        }
        if (o>0 && j<0) {
          j = io.i
        }
      }
    }
  } while (this.nextInput(io))
  // no input found, create one
  if (io.list.length === 1) {
    // there is only one placeholder with no separators
    // either we insert at 0 or one
    // anyway we must have separators before and after
    // In all other cases, the separators are already there
    this.insertPlaceholder(io, 0)
    this.insertPlaceholder(io, 2)
    if (!j) {
      j = 1
    }
  }
  if (j < 0) {
    j = io.list.length
  }
  this.insertPlaceholder(io, j)
  var input = this.insertPlaceholder(io)
  input.name = name
  this.doFinalize(io)
  return input
}

/**
 * Get the next input compatible with the given type.
 * Enumerator object.
 * @param {object} io argument object
 * @return the next keyword item input, undefined when at end.
 */
ezP.Consolidator.List.prototype.nextInputForType = function(io, type) {
  while (this.nextInput(io)) {
    var target = io.c8n.targetConnection
    if (target) {
      var check = target.check_
      if (goog.array.contains(check, type)) {
        return io.input
      }
    }
  }
  return undefined
}

/**
 * Whether the block has an input for the given type.
 * @param {object} io argument object
 * @return the next keyword item input, undefined when at end.
 */
ezP.Consolidator.List.prototype.hasInputForType = function(block, type) {
  var io = this.getIO(block)
  return !!this.nextInputForType(io, type)
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
 * @param {!Object} data data structure that contains the model....
 */
ezP.Consolidator.List.Singled = function(data) {
  ezP.Consolidator.List.Singled.superClass_.constructor.call(this, data)
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
  if (io.single || io.list.length === 1) {
    // a single block or no block at all
    return this.data.all
  } else if (io.list.length === 3 && io.i === 1) {
    // there is only one item in the list
    // and it can be replaced by any kind of block
    return this.data.all
  } else {
    // blocks of type check are already there
    return this.data.check
  }
}

/**
 * Find the next connected input
 * @param {!Object} io parameter.
 * @param {!boolean} gobble whether to gobble intermediate inputs.
 * @override
 */
ezP.Consolidator.List.Singled.prototype.walk_to_next_connected = function(io, gobble) {
  var ans = ezP.Consolidator.List.Singled.superClass_.walk_to_next_connected.call(this, io, gobble)
  if (ans && !io.single
    && io.c8n.targetConnection.check_.indexOf(this.data.single) >= 0) {
    io.single = io.input
  }
  return ans
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 */
ezP.Consolidator.List.Singled.prototype.doCleanup = function(io) {
  ezP.Consolidator.List.Singled.superClass_.doCleanup.call(this, io)
  this.consolidate_single(io)
}


/**
 * Consolidate the first connected input
 * @param {!Object} io parameter.
 * @return yes exactly if there are more input
 */
ezP.Consolidator.List.Singled.prototype.consolidate_single = function(io) {
  // the actual input is the first connected
  if (io.single) {
    // remove whatever precedes it, even the very first separator
    var j = io.list.indexOf(io.single)
    while(j) {
      this.disposeAtI(io, --j)
    }
    // remove whatever follows
    while(io.list.length > 1) {
      this.disposeAtI(io, 1)
    }
    return true
  }
  return false
}


/**
 * List consolidator for argument list.
 * Rules are a bit stronger than python requires originally
 * 1) starred expression only at the end of the list
 * 2) only one such expression
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
ezP.Consolidator.List.Target = function(D) {
  var d = {}
  goog.mixin(d, ezP.Consolidator.List.Target.data)
  goog.mixin(d, D)
  ezP.Consolidator.List.Target.superClass_.constructor.call(this, d)
}
goog.inherits(ezP.Consolidator.List.Target, ezP.Consolidator.List)

ezP.Consolidator.List.Target.data = {
  hole_value: 'name',
  check: null,
  empty: false,
  sep: ',',
}

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
 * Extra initialization may be performed by the init function.
 * TODO: use singletons...
 * @param {!Object} data, all the data needed
 */
ezP.Consolidator = function(d) {
  this.data = {}
  var D = this.constructor.data_
  if (D) {
    goog.mixin(this.data, D)
  }
  if (d) {
    goog.mixin(this.data, d)
  }
  goog.asserts.assert(goog.isDef(this.data.check), 'List consolidators must check their objects')
  this.init && this.init()
}

/**
 * Main and unique entry point.
 * Removes empty place holders
 * @param {!Block} block, to be consolidated....
 */
ezP.Consolidator.prototype.consolidate = undefined

/**
 * Init. Not implemented. No parameter, no return.
 */
ezP.Consolidator.prototype.init = undefined

/**
 * Create a subclass of a consolidator.
 * This is the preferred method to create consolidator classes.
 * The main purpose is to manage the shared data model
 * and allow inheritance.
 * @param {!Object} data.
 */
ezP.Consolidator.makeSubclass = function(key, data, Ctor, owner) {
  Ctor = Ctor || ezP.Consolidator
  owner = owner || Ctor
  var subclass = owner[key] = function(d) {
    subclass.superClass_.constructor.call(this, d)
  }
  goog.inherits(subclass, Ctor)
  subclass.data_ = {} // start with a fresh object for the constructor data model
  if (Ctor.data_) {
    goog.mixin(subclass.data_, Ctor.data_)
  }
  if (goog.isFunction(data)) {
    data = data.call(this)
  }
  if (data) {
    goog.mixin(subclass.data_, data)
  }
  subclass.makeSubclass = function(key, data, Ctor, owner) {
    ezP.Consolidator.makeSubclass(key, data, Ctor || subclass, owner)
  }
}

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
 * @param {!Object} data, all the data needed
 */
ezP.Consolidator.makeSubclass('List')

/**
 * Initialize the list consolidator.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.init = function() {
  goog.asserts.assert(goog.isDef(this.data.check), 'List consolidators must check their objects')
  if (this.data.unique) {
    this.data.unique = ezP.Do.ensureArray(this.data.unique)
  }
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
 * @return boolean, false when at end
 */
ezP.Consolidator.List.prototype.nextInput = function (io) {
  ++io.i
  return this.setupIO(io)
}

/**
 * Wether the current input is connected or will be connected.
 * @param {!Object} io parameter.
 * @return boolean, true when connected.
 */
ezP.Consolidator.List.prototype.willBeConnected = function (io) {
  return io.ezp && (io.c8n.targetConnection || io.ezp.will_connect_)
}

/**
 * Insert a placeholder at the given index.
 * io is properly set up at the end.
 * @param {!Object} io parameter.
 * @param {number} i. When undefined, take io.i
 * @return {Blockly.Input}, the input inserted.
 */
ezP.Consolidator.List.prototype.insertPlaceholder = function (io, i) {
  var me = this
  if (goog.isNumber(i)) {
    io.i = i
  }
  var c8n = io.block.makeConnection_(Blockly.INPUT_VALUE)
  c8n.ezp.willConnect = function(c8n, otherC8n) {
    c8n.ezp.will_connect_ = true
    this.sourceBlock_.ezp.will_connect_ = true
  }
  c8n.ezp.didConnect = function(c8n, otherC8n) {
    this.ezp.will_connect_ = false
    this.sourceBlock_.ezp.will_connect_ = false
    me.consolidate(this.sourceBlock_, true)
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
 * io is properly set up at the end.
 * @param {!Object} io parameter.
 * @return boolean, whether the io is at end.
 */
ezP.Consolidator.List.prototype.disposeAtI = function (io, i) {
  if (!goog.isNumber(i)) {
    i = io.i
  }
  io.list[i].dispose()
  io.list.splice(i, 1)
  io.edited = true
  return this.setupIO(io)
}

/**
 * Returns the required types for the current input.
 * When not in single mode, returns `check`.
 * When in single mode, returns `all` if the list is void
 * or if there is only one item to be replaced.
 * In all other situations, return `check`.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.getCheck = function (io) {
  if (this.data.all) {
    if (io.unique || io.list.length === 1) {
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
  return this.data.check
}

/**
 * Finalize the current input as a placeholder.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.doFinalizePlaceholder = function (io, name = undefined, optional = false) {
  io.ezp.n = io.n
  io.ezp.presep = io.presep
  io.ezp.postsep = io.postsep
  io.ezp.s7r_ = io.c8n.ezp.s7r_ = false
  var check = this.getCheck(io)
  if (name && name.length) {
    io.input.name = name
  }
  io.input.setCheck(check)
  io.c8n.ezp.optional_ = optional
  io.c8n.ezp.plugged_ = this.plugged
  if (!io.connected && !this.data.empty && !io.c8n.isConnected()) {
    var value = ezP.DelegateSvg.Manager.getModel(io.block.type).list.hole_value
    io.c8n.ezp.hole_data = ezP.HoleFiller.getData(check, value)
  }
  while (io.input.fieldRow.length) {
    io.input.fieldRow.shift().dispose()
  }
}

/**
 * Finalize the current input as a separator.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.doFinalizeSeparator = function (io, extreme, name) {
  io.ezp.presep = io.presep || ''
  io.ezp.postsep = io.postsep || ''
  if (name && name.length) {
    io.input.name = name
  }
  io.ezp.s7r_ = io.c8n.ezp.s7r_ = true
  if (extreme || !io.ezp.presep.length && io.ezp.postsep.length) {
    while (io.input.fieldRow.length) {
      io.input.fieldRow.shift().dispose()
    }
  } else if (!io.input.fieldRow.length) {
    var f = function(sep, suffix) {
      var field = new ezP.FieldLabel(sep)
      io.input.fieldRow.splice(0, 0, field)
      field.setSourceBlock(io.block)
      if (io.block.rendered) {
        field.init()
      }
      field.ezp.suffix = suffix
    }
    var sep = io.ezp.presep || this.data.presep
    sep && sep.length && f(sep)
    var sep = io.ezp.postsep || this.data.postsep
    sep && sep.length && f(sep, true)
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
 * Add an unconnected input after, if there is no one.
 * On return, io points to the location after
 * the potential separator.
 * @param {!Object} io parameter.
 * @return yes exactly if there are more input
 */
ezP.Consolidator.List.prototype.consolidate_connected = function(io) {
  // ensure that there is one input after,
  // which is not connected
  if (!this.nextInput(io) || this.willBeConnected(io)) {
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
  // let subclassers catch this if they want to.
  if (!this.consolidate_single(io)) {
    // nothing more to consolidate
    return false
  }
  // the actual input is the first connected
  // remove whatever precedes it, except the very first separator, if any
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
 * Subclassers will manage things differently and
 * return false
 * @param {!Object} io parameter.
 * @return yes exactly if there are more input
 */
ezP.Consolidator.List.prototype.consolidate_single = function(io) {
  if (io.unique) {
    // remove whatever precedes it, even the very first separator
    var j = io.list.indexOf(io.unique)
    while(j) {
      this.disposeAtI(io, --j)
    }
    // remove whatever follows
    while(io.list.length > 1) {
      this.disposeAtI(io, 1)
    }
    return false
  }
  return true
}

/**
 * Find the next connected input. 
 * @param {!Object} io parameter.
 * @param {!boolean} gobble whether to gobble intermediate inputs.
 */
ezP.Consolidator.List.prototype.walk_to_next_connected = function(io, gobble) {
  // things are different if one of the inputs is connected
  while (!!io.ezp) {
    if (this.willBeConnected(io)) {
      io.presep = io.ezp.presep || this.data.presep
      io.postsep = io.ezp.postsep || this.data.postsep
      // manage the unique input
      if (this.data.unique && !io.unique
        && io.c8n.targetConnection && function(my) {
          return goog.array.find(io.c8n.targetConnection.check_, function(x) {
            return my.data.unique.indexOf(x) >= 0
          })
        } (this)) {
        io.unique = io.input
      }
      return true
    }
    if (gobble) {
      this.disposeAtI(io) 
    } else {
      this.nextInput(io)  
    }
  }
  return false
}

/**
 * No connected connection has been found.
 * Removes extra empty placeholders, or
 * create of if none exists.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.consolidate_unconnected = function(io) {
  // remove any separator up to the first placeholder
  // This is because the placeholder may have been connected
  // before, undoing will be easier.
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
 * once the whole list has been managed once
 * in a de facto standard way.
 * Default implementation does nothing.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.prototype.doCleanup = function(io) {
}

/**
 * Finalize placeholders and separators.
 * In general, there are at least 2 inputs:
 * a separator and a placeholder.
 * There can be a supplemental separator after.
 * Find dynamic names for placeholders,
 * set the separator property when not connected.
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
    presep: this.data.presep,
    postsep: this.data.postsep,
  }
  this.setupIO(io, 0)
  return io
}

/**
 * List consolidator.
 * Removes empty place holders
 * @param {!Block} block, to be consolidated....
 * @param {boolean} force, true if no shortcut is allowed.
 */
ezP.Consolidator.List.prototype.consolidate = function(block, force) {
  var io = this.getIO(block)
  // things are different if one of the inputs is connected
  if (this.walk_to_next_connected(io)) {
    if (this.consolidate_first_connected(io)) {
      while (this.walk_to_next_connected(io, true)
        && this.consolidate_connected(io)) {}
    }
    this.doCleanup(io)
    if (force || io.edited || io.noLeftSeparator || io.noDynamicList) {
      this.doFinalize(io)
    }
  } else {
    // no connected input
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
      io.presep = io.ezp.presep || io.presep
      io.postsep = io.ezp.postsep || io.postsep
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
 * Enumerator object. Used by the print block.
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
 * Used by the print block.
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
ezP.Consolidator.List.makeSubclass('Singled')

/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Consolidators for various list blocks and proper_slice, for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Consolidator')

goog.require('eYo')
goog.require('eYo.Const')
goog.require('eYo.Input')
goog.require('eYo.Do')
goog.require('eYo.DelegateSvg')

/**
 * Consolidator. Fake abstract class, just here for the record and namespace.
 * Any dynamic block must be consolidated.
 * A dynamic block changes its inputs while alive.
 * Default constructor does nothing
 * Main entry: consolidate
 * These are implemented as potential singletons but are not used as is.
 * Extra initialization may be performed by the init function.
 * TODO: use singletons...
 * @param {!Object} d, all the data needed
 * @constructor
 */
eYo.Consolidator = function (d) {
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
eYo.Consolidator.prototype.consolidate = undefined

/**
 * Init. Not implemented. No parameter, no return.
 */
eYo.Consolidator.prototype.init = undefined

/**
 * Create a subclass of a consolidator.
 * This is the preferred method to create consolidator classes.
 * The main purpose is to manage the shared data model
 * and allow inheritance.
 * @param {!string} key
 * @param {!Object} data
 * @param {!Object} C10r  ancestor
 * @param {!Object} owner
 */
eYo.Consolidator.makeSubclass = function (key, data, C10r, owner) {
  C10r = C10r || eYo.Consolidator
  owner = owner || C10r
  var subclass = owner[key] = function (d) {
    subclass.superClass_.constructor.call(this, d)
  }
  goog.inherits(subclass, C10r)
  subclass.data_ = {} // start with a fresh object for the constructor data model
  if (C10r.data_) {
    goog.mixin(subclass.data_, C10r.data_)
  }
  if (goog.isFunction(data)) {
    data = data.call(this)
  }
  if (data) {
    goog.mixin(subclass.data_, data)
  }
  subclass.makeSubclass = function (key, data, C10r, owner) {
    eYo.Consolidator.makeSubclass(key, data, C10r || subclass, owner)
  }
}

goog.provide('eYo.Consolidator.List')
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
 */
eYo.Consolidator.makeSubclass('List')

/**
 * Initialize the list consolidator.
 * @param {!Object} io parameter.
 */
eYo.Consolidator.List.prototype.init = function () {
  goog.asserts.assert(goog.isDef(this.data.check), 'List consolidators must check their objects')
  if (this.data.unique) {
    this.data.unique = eYo.Do.ensureArray(this.data.unique)
  }
  this.data.ary || (this.data.ary = Infinity)
}

/**
 * Setup the io parameter dictionary.
 * Called when the input list has changed and or the index has changed.
 * @param {!Object} io parameter.
 */
eYo.Consolidator.List.prototype.setupIO = function (io, i) {
  if (i !== undefined) {
    io.i = i
  }
  if ((io.input = io.list[io.i])) {
    io.eyo = io.input.eyo
    io.c8n = io.input.connection
    goog.asserts.assert(!io.eyo || !!io.c8n, 'List items must have a connection')
    return true
  } else {
    io.eyo = io.c8n = null
    return false
  }
}

/**
 * Advance to the next input. Returns false when at end.
 * @param {!Object} io parameter.
 * @return boolean, false when at end
 */
eYo.Consolidator.List.prototype.nextInput = function (io) {
  ++io.i
  return this.setupIO(io)
}

/**
 * Wether the current input is connected or will be connected.
 * @param {!Object} io parameter.
 * @return boolean, true when connected.
 */
eYo.Consolidator.List.prototype.willBeConnected = function (io) {
  return io.eyo && (io.c8n.targetConnection || io.eyo.will_connect_)
}

/**
 * Insert a placeholder at the given index.
 * io is properly set up at the end.
 * @param {!Object} io parameter.
 * @param {number} i When undefined, take io.i
 * @return {Blockly.Input}, the input inserted.
 */
eYo.Consolidator.List.prototype.insertPlaceholder = function (io, i) {
  var me = this
  if (goog.isNumber(i)) {
    io.i = i
  }
  var c8n = io.block.makeConnection_(Blockly.INPUT_VALUE)
  c8n.eyo.willConnect = function (c8n, otherC8n) {
    c8n.eyo.will_connect_ = true
    this.connection.sourceBlock_.eyo.will_connect_ = true
  }
  c8n.eyo.didConnect = function (c8n, otherC8n) {
    this.will_connect_ = false
    this.connection.sourceBlock_.eyo.will_connect_ = false
    me.consolidate(this.connection.sourceBlock_, true)
  }
  var input = new Blockly.Input(Blockly.INPUT_VALUE, '!', io.block, c8n)
  eYo.Input.setupEyO(input)
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
eYo.Consolidator.List.prototype.disposeAtI = function (io, i) {
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
eYo.Consolidator.List.prototype.getCheck = function (io) {
  if (this.data.all) {
    if (io.unique >= 0 || io.list.length === 1) {
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
eYo.Consolidator.List.prototype.doFinalizePlaceholder = function (io, name = undefined, optional = false) {
  io.eyo.n = io.n
  io.eyo.presep = io.presep
  io.eyo.postsep = io.postsep
  io.c8n.eyo.s7r_ = false
  var check = this.getCheck(io)
  if (name && name.length) {
    io.input.name = name
  }
  io.input.setCheck(check)
  io.c8n.eyo.optional_ = optional
  io.c8n.eyo.plugged_ = this.plugged
  if (!io.connected && !this.data.empty && !io.c8n.isConnected()) {
    var value = eYo.DelegateSvg.Manager.getModel(io.block.type).list.hole_value
    io.c8n.eyo.hole_data = eYo.HoleFiller.getData(check, value)
  }
  while (io.input.fieldRow.length) {
    io.input.fieldRow.shift().dispose()
  }
}

/**
 * Finalize the current input as a separator.
 * @param {!Object} io parameter.
 */
eYo.Consolidator.List.prototype.doFinalizeSeparator = function (io, extreme, name) {
  io.eyo.presep = io.presep || ''
  io.eyo.postsep = io.postsep || ''
  if (name && name.length) {
    io.input.name = name
  }
  io.c8n.eyo.s7r_ = true
  io.c8n.eyo.disabled_ = false
  if (extreme || (!io.eyo.presep.length && io.eyo.postsep.length)) {
    while (io.input.fieldRow.length) {
      io.input.fieldRow.shift().dispose()
    }
  } else if (!io.input.fieldRow.length) {
    var f = function (sep, suffix) {
      var field = new eYo.FieldLabel(sep)
      io.input.fieldRow.splice(0, 0, field)
      field.setSourceBlock(io.block)
      if (io.block.rendered) {
        field.init()
      }
      field.eyo.suffix = suffix
    }
    var sep = io.eyo.presep || this.data.presep
    sep && sep.length && f(sep)
    sep = io.eyo.postsep || this.data.postsep
    sep && sep.length && f(sep, true)
  }
  io.input.setCheck(this.getCheck(io))
  io.input.connection.eyo.plugged_ = this.data.plugged
  if (io.block.eyo.locked_) {
    io.c8n.setHidden(true)
  } else if (io.i === 0 && io.noLeftSeparator && io.list.length > 1) {
    io.c8n.setHidden(true)
  } else if (io.i === 2 && io.list.length === 3 && io.noDynamicList) {
    io.c8n.setHidden(true)
  } else if (!io.block.eyo.isIncog()) {
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
eYo.Consolidator.List.prototype.consolidate_connected = function (io) {
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
eYo.Consolidator.List.prototype.consolidate_first_connected = function (io) {
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
    while (j > 1) {
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
eYo.Consolidator.List.prototype.consolidate_single = function (io) {
  if (io.unique >= 0) {
    // remove whatever precedes it, even the very first separator
    var j = io.i
    while (j > 0) {
      this.disposeAtI(io, --j)
    }
    // remove whatever follows
    while (io.list.length > 1) {
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
eYo.Consolidator.List.prototype.walk_to_next_connected = function (io, gobble) {
  // things are different if one of the inputs is connected
  while (io.eyo) {
    if (this.willBeConnected(io)) {
      io.presep = io.eyo.presep || this.data.presep
      io.postsep = io.eyo.postsep || this.data.postsep
      // manage the unique input
      if (this.data.unique && io.unique < 0 &&
        io.c8n.targetConnection && (function (my) {
          return goog.array.find(io.c8n.targetConnection.check_, function (x) {
            return my.data.unique.indexOf(x) >= 0
          })
        }(this))) {
        io.unique = io.i
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
eYo.Consolidator.List.prototype.consolidate_unconnected = function (io) {
  // remove any separator up to the first placeholder
  // This is because the placeholder may have been connected
  // before, undoing will be easier.
  this.setupIO(io, 0)
  if (io.eyo) {
    while (true) {
      if (io.c8n.eyo.s7r_) {
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
        } while (this.setupIO(io))
      }
      // Always finalize at last step
      --io.i
      this.setupIO(io)
      this.doFinalizePlaceholder(io,
        eYo.Do.Name.middle_name, this.data.empty)
      return
    }
    // unreachable code
  }
  // create an input
  this.insertPlaceholder(io)
  this.doFinalizePlaceholder(io,
    eYo.Do.Name.middle_name, this.data.empty)
}

/**
 * Cleanup. Subclassers may choose to insert or remove inputs,
 * once the whole list has been managed once
 * in a de facto standard way.
 * Default implementation does nothing.
 * @param {!Object} io parameter.
 */
eYo.Consolidator.List.prototype.doCleanup = function (io) {
}

/**
 * When there is a limitation of the number of arguments,
 * remove the excedent.
 * @param {!Object} io parameter.
 */
eYo.Consolidator.List.prototype.doAry = function (io) {
  var ary = this.data.ary
  if (ary < Infinity) {
    this.setupIO(io, 0)
    while (this.nextInput(io)) {
      if (io.c8n.isConnected()) {
        if (--ary) {
          continue
        }
        // skip the connection
        if (this.nextInput(io)) {
          while (this.nextInput(io)) {
            this.disposeAtI(io)
          }
        }
      }
    }
    if (!ary) {
      // all the arguments are filled
      // disable all the separators
      this.setupIO(io, 0)
      while (this.nextInput(io)) {
        if (!io.c8n.isConnected()) {
          io.c8n.eyo.disabled_ = true
        }
      }
    }
  }
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
eYo.Consolidator.List.prototype.doFinalize = function (io) {
  this.setupIO(io, 0)
  if (io.list.length === 1) {
    this.doFinalizePlaceholder(io, undefined, this.data.empty)
    return
  }
  var previous = eYo.Do.Name.min_name
  var next = io.list[io.i + 1].name
  var name = eYo.Do.Name.getBetween(previous, next)
  this.doFinalizeSeparator(io, true, name)
  this.nextInput(io)
  this.doFinalizePlaceholder(io)
  previous = next
  while (this.nextInput(io)) {
    if (io.i === io.list.length - 1) {
      // last separator
      next = eYo.Do.Name.max_name
      name = eYo.Do.Name.getBetween(previous, next)
      this.doFinalizeSeparator(io, true, name)
    } else {
      next = io.list[io.i + 1].name
      name = eYo.Do.Name.getBetween(previous, next)
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
eYo.Consolidator.List.prototype.getIO = function (block) {
  var unwrapped = block.eyo.getUnwrapped(block)
  var io = {
    block: block,
    noLeftSeparator: (block.workspace.eyo.options.noLeftSeparator ||
      block.workspace.eyo.options.noDynamicList) &&
      (!unwrapped ||
        (!unwrapped.eyo.withLeftSeparator_ && !unwrapped.eyo.withDynamicList_)),
    noDynamicList: (block.workspace.eyo.options.noDynamicList) &&
      (!unwrapped ||
        !unwrapped.eyo.withDynamicList_),
    list: block.inputList,
    presep: this.data.presep,
    postsep: this.data.postsep
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
eYo.Consolidator.List.prototype.consolidate = function (block, force) {
  if (this.consolidate_locked) {
    return
  }
  this.consolidate_locked = true
  try {
    var io = this.getIO(block)
    // things are different if one of the inputs is connected
    if (this.walk_to_next_connected(io)) {
      if (this.consolidate_first_connected(io)) {
        while (this.walk_to_next_connected(io, true) &&
          this.consolidate_connected(io)) {}
      }
      this.doCleanup(io)
      if (force || io.edited || io.noLeftSeparator || io.noDynamicList) {
        this.doFinalize(io)
        this.doAry(io)
      }
    } else {
      // no connected input
      this.consolidate_unconnected(io)
    }
  } catch (err) {
    console.log(err)
  } finally {
    delete this.consolidate_locked
  }
}

/**
 * Fetches the named input object
 * @param {!Block} block
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
eYo.Consolidator.List.prototype.getInput = function (block, name) {
  // name = eYo.Do.Name.getNormalized(name) not here
  if (!name || !name.length) {
    return null
  }
  this.consolidate(block)
  this.consolidate_locked = true
  try {
    var j = -1
    var io = this.getIO(block)
    do {
      if (io.eyo) {
        io.presep = io.eyo.presep || io.presep
        io.postsep = io.eyo.postsep || io.postsep
        if (!io.c8n.eyo.s7r_) {
          var o = eYo.Do.Name.getOrder(io.input.name, name)
          if (!o) {
            return io.input
          }
          if (o > 0 && j < 0) {
            j = io.i
          }
        }
      }
    } while (this.nextInput(io))
    var ary = this.data.ary
    if (this.ary_ < Infinity) {
      this.setupIO(io, 0)
      while (this.nextInput(io)) {
        if (io.c8n.isConnected()) {
          if (--ary) {
            continue
          }
          return null
        }
      }
    }
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
    // this.doAry(io)
    return input
  } catch (err) {
    console.error(err)
  } finally {
    delete this.consolidate_locked
  }
}

/**
 * Get the next input compatible with the given type.
 * Enumerator object. Used by the print block.
 * @param {object} io argument object
 * @return the next keyword item input, undefined when at end.
 */
eYo.Consolidator.List.prototype.nextInputForType = function (io, type) {
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
eYo.Consolidator.List.prototype.hasInputForType = function (block, type) {
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
 */
eYo.Consolidator.List.makeSubclass('Singled')

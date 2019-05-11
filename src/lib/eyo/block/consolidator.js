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
goog.require('eYo.Decorate')
goog.require('eYo.Do')
goog.require('eYo.Delegate')

/**
 * Consolidator. Fake abstract class, just here for the record and namespace.
 * Any dynamic block must be consolidated.
 * A dynamic block changes its inputs while alive.
 * Default constructor does nothing
 * Main entry: consolidate
 * These are implemented as potential singletons but are not used as is.
 * Extra initialization may be performed by the init function.
 * TODO: use singletons...
 * @param {!Object} d, all the model needed
 * @constructor
 */
eYo.Consolidator = function (d) {
  this.reentrant_ = {}
  this.init(d)
}

eYo.Consolidator.eyo = {}

/**
 * Init. Not implemented. No parameter, no return.
 */
eYo.Consolidator.prototype.init = function(d) {
  this.model = Object.create(null)
  var D = this.constructor.eyo && this.constructor.eyo.model_
  if (D) {
    goog.mixin(this.model, D)
  }
  if (d) {
    goog.mixin(this.model, d)
  }
  goog.asserts.assert(goog.isDef(this.model.check), 'Consolidators must check their objects')
  this.model.check = eYo.Do.ensureArrayFunction(this.model.check)
}

/**
 * Main and unique entry point.
 * Removes empty place holders
 * @param {!eYo.Delegate} dlgt, to be consolidated....
 */
eYo.Consolidator.prototype.consolidate = undefined

/**
 * Create a subclass of a consolidator.
 * This is the preferred method to create consolidator classes.
 * The main purpose is to manage the shared data model
 * and allow inheritance.
 * @param {!string} key
 * @param {!Object} model
 * @param {!Object} C10r  ancestor
 * @param {!Object} owner
 */
eYo.Consolidator.makeSubclass = function (key, model, C10r, owner) {
  C10r = C10r || eYo.Consolidator
  owner = owner || C10r
  var subclass = owner[key] = function (d) {
    subclass.superClass_.constructor.call(this, d)
  }
  goog.inherits(subclass, C10r)
  subclass.eyo = {
    key: key,
    model_: {} // start with a fresh object for the constructor model model
  }
  if (C10r.eyo.model_) {
    goog.mixin(subclass.eyo.model_, C10r.eyo.model_)
  }
  if (goog.isFunction(model)) {
    model = model.call(this)
  }
  if (model) {
    goog.mixin(subclass.eyo.model_, model)
  }
  subclass.makeSubclass = function (key, model, C10r, owner) {
    eYo.Consolidator.makeSubclass(key, model, C10r || subclass, owner)
  }
}

goog.provide('eYo.Consolidator.List')
/**
 * List consolidator.
 * Remove empty place holders, add separators,
 * order non empty placeholders.
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
 * @param {!Object} d model.
 */
eYo.Consolidator.List.prototype.init = function (d) {
  eYo.Consolidator.List.superClass_.init.call(this, d)
  if (this.model.unique) {
    this.model.unique = eYo.Do.ensureArrayFunction(this.model.unique)
  }
  if (this.model.all) {
    this.model.all = eYo.Do.ensureArrayFunction(this.model.all)
  }
  this.model.ary || (this.model.ary = Infinity)
}


/**
 * Get the ary.
 * Asks the list
 * @param {!Object} io parameter.
 */
eYo.Consolidator.List.prototype.getAry = function (io) {
  if (io.dlgt) {
    var d = io.dlgt.ary_d
    if (d) {
      return d.get()
    }
  }
  return goog.isDef(this.model.ary)
    ? this.model.ary
    : this.model.ary = Infinity
}

/**
 * Get the mandatory.
 * Asks the list
 * @param {!Object} io parameter.
 */
eYo.Consolidator.List.prototype.getMandatory = function (io) {
  if (io.dlgt) {
   var d = io.dlgt.mandatory_d
    if (d) {
      return d.get()
    }
    if (goog.isFunction(this.model.mandatory)) {
      return this.model.mandatory(io.dlgt.type, io.dlgt.subtype)
    }
  }
  return goog.isDef(this.model.mandatory)
  ? this.model.mandatory
  : this.model.mandatory = 0
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
    io.m4t = io.input.magnet
    goog.asserts.assert(!io.input || !!io.m4t, 'List items must have a connection')
    return true
  } else {
    io.m4t = null
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
  return io.input && (io.m4t.target || io.m4t.will_connect_)
}

/**
 * Insert a placeholder at the given index.
 * io is properly set up at the end.
 * @param {!Object} io parameter.
 * @param {number} i When undefined, take io.i
 * @return {eYo.Input}, the input inserted.
 */
eYo.Consolidator.List.prototype.insertPlaceholder = function (io, i) {
  if (goog.isNumber(i)) {
    io.i = i
  }
  var model = {
    willConnect: /** @suppress {globalThis} */ function (targetM4t) {
      this.will_connect_ = this.b_eyo.will_connect_ = true // do not consolidate
    },
    didConnect: /** @suppress {globalThis} */ function (oldTargetM4t, targetOldM4t) {
      this.will_connect_ = this.b_eyo.will_connect_ = false
    }
  }
  var input = new eYo.Input(io.dlgt, '!', model)
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
  var input = io.list[i]
  var c8n = input.connection
  if (c8n && c8n.isConnected()) {
    c8n.disconnect()
  }
  input.dispose()
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
  if (this.model.all) {
    if (io.unique >= 0 || io.list.length === 1) {
      // a single block or no block at all
      return this.model.all(io.dlgt.type, io.dlgt.subtype)
    } else if (io.list.length === 3 && io.i === 1) {
      // there is only one item in the list
      // and it can be replaced by any kind of block
      return this.model.all(io.dlgt.type, io.dlgt.subtype)
    } else {
      // blocks of type check are already there
      return this.model.check(io.dlgt.type, io.dlgt.subtype)
    }
  }
  return this.model.check(io.dlgt.type, io.dlgt.subtype)
}

/**
 * Finalize the current input as a placeholder.
 * @param {!Object} io parameter.
 */
eYo.Consolidator.List.prototype.doFinalizePlaceholder = function (io, name = undefined, optional = false) {
  io.input.lst_n = io.n
  io.input.lst_presep = io.presep
  io.input.lst_postsep = io.postsep
  io.m4t.s7r_ = false
  var check = this.getCheck(io)
  if (check && check.length === 0) {
    console.error('CONNECTIONS FORBIDDEN ?', this.getCheck(io)) // DEBUG
  }
  if (name && name.length) {
    io.input.name = name
  }
  io.input.check = check
  io.m4t.optional_ = optional
  io.m4t.plugged_ = this.plugged
  while (io.input.fieldRow.length) {
    io.input.fieldRow.shift().dispose()
  }
}

/**
 * Finalize the current input as a separator.
 * @param {!Object} io parameter.
 */
eYo.Consolidator.List.prototype.doFinalizeSeparator = function (io, extreme, name) {
  io.input.lst_presep = io.presep || ''
  io.input.lst_postsep = io.postsep || ''
  if (name && name.length) {
    io.input.name = name
  }
  io.m4t.s7r_ = true
  io.m4t.disabled_ = false
  if (extreme || (!io.input.lst_presep.length && io.input.lst_postsep.length)) {
    while (io.input.fieldRow.length) {
      io.input.fieldRow.shift().dispose()
    }
  } else if (!io.input.fieldRow.length) {
    var f = (sep, suffix) => {
      var field = new eYo.FieldLabel(sep)
      io.input.fieldRow.splice(0, 0, field)
      field.setSourceBlock(io.dlgt.block_)
      field.eyo.beReady(io.input.isReady)
      field.eyo.suffix = suffix
    }
    var sep = io.input.lst_presep || this.model.presep
    sep && sep.length && f(sep)
    sep = io.input.lst_postsep || this.model.postsep
    sep && sep.length && f(sep, true)
  }
  io.input.check = this.getCheck(io)
  io.m4t.plugged_ = this.model.plugged
  io.m4t.hidden_ = undefined
  if (io.dlgt.locked_) {
    io.m4t.hidden_ = true
  } else if (io.i === 0 && io.noLeftSeparator && io.list.length > 1) {
    io.m4t.hidden_ = true
  } else if (io.i === 2 && io.list.length === 3 && io.noDynamicList) {
    io.m4t.hidden_ = true
  } else if (!io.dlgt.incog) {
    io.m4t.hidden_ = false
  }
  io.m4t.ignoreBindField = io.i === 0 && io.list.length > 1
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
 * @return true exactly if there are more input
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
 * Make the current index unique.
 * The unique index concept is an answer to some alternation problem.
 * For example the python `list` command can accept either a list of
 * object or exactly one enumerator.
 * By default, we consider that `list` may have many arguments.
 * When we add the first argument, if it is a generator,
 * no more argument can be added, if it is not a generator,
 * any argument can be added, provided it is not a generator.
 * This method is based on the `this.model.unique` function if any.
 * This model function has signature `(type, subtype) -> [string]`.
 * When an array is returned, the current index `io.i`
 * is make unique when the target connection contains a type in that array.
 * Returning a void array means that no unique object may exist in that list.
 * `null` is deliberately returned and tested for development reasons.
 * @param {!Object} io parameter.
 */
eYo.Consolidator.List.prototype.makeUnique = function (io) {
  if (!this.reentrant_.makeUnique) {
    var f = this.model.makeUnique
    if (goog.isFunction(f)) {
      this.reentrant_.makeUnique = true
      try {
        if (f.call(this, io)) {
          io.unique = io.i
        }
      } finally {
        this.reentrant_.makeUnique = false
      }
      return
    }
  }
  if (this.model.unique && io.m4t.target) {
    var unique = this.model.unique(io.dlgt.type, io.dlgt.subtype)
    if (!unique) {
      throw `MISSING UNIQUE ${this.model.unique(io.dlgt.type, io.dlgt.subtype)}`
    } else if (io.m4t.target.check_.some(x => unique && unique.indexOf(x) >= 0)) {
      io.unique = io.i
    }
  }
}

/**
 * Find the next connected input.
 * @param {!Object} io parameter.
 * @param {!boolean} gobble whether to gobble intermediate inputs.
 */
eYo.Consolidator.List.prototype.walk_to_next_connected = function (io, gobble) {
  // things are different if one of the inputs is connected
  while (io.input) {
    if (this.willBeConnected(io)) {
      io.presep = io.input.lst_presep || this.model.presep
      io.postsep = io.input.lst_postsep || this.model.postsep
      // manage the unique input
      if (io.unique < 0) {

      }
      this.makeUnique(io)
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
  var ary = this.getAry(io)
  if (ary > 0) {
    if (io.input) {
      while (true) {
        if (io.m4t.s7r_) {
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
          eYo.Do.Name.middle_name, !this.getMandatory(io))
        return
      }
      // unreachable code
    }
    // create an input
    this.insertPlaceholder(io)
    this.doFinalizePlaceholder(io,
      eYo.Do.Name.middle_name, !this.getMandatory(io))
  } else {
    // remove everything
    while (this.setupIO(io, 0)) {
      this.disposeAtI(io)
    }
  }
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
  var ary = this.getAry(io)
  if (ary < Infinity) {
    this.setupIO(io, 0)
    while (this.nextInput(io)) {
      if (io.m4t.target) {
        if (ary > 0) {
          // this connected entry is required
          --ary
          continue
        }
        // this connected entry is *en trop*
        // remove everything
        // skip the connection
        do {
          this.disposeAtI(io)
        } while (this.nextInput(io));
        break
      }
    }
    if (!ary) {
      // all the arguments are filled
      // disable all the separators
      if (this.setupIO(io, 0)) {
        do {
          if (!io.m4t.target) {
            io.m4t.disabled_ = true
          }
        } while (this.nextInput(io));
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
    this.doFinalizePlaceholder(io, undefined, !this.getMandatory(io))
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
 * In order to prepare rendering, add some information to the inputs.
 * @param {!Object} io parameter.
 */
eYo.Consolidator.List.prototype.doLink = function (io) {
  this.setupIO(io, 0)
  var wasSeparator = false
  var previous = undefined
  while (this.nextInput(io)) {
    if (io.m4t.s7r_) {
      if (previous) {
        previous.nextIsSeparator = true
        previous = undefined
      }
      wasSeparator = true
    } else {
      if (previous) {
        previous.nextIsSeparator = false
      }
      previous = io.input
      previous.previousIsSeparator = wasSeparator
      wasSeparator = false
    }
  }
  if (previous) {
    previous.nextIsSeparator = false
  }
}

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {Object} io, parameters....
 */
eYo.Consolidator.List.prototype.getIO = function (dlgt) {
  var unwrapped = dlgt.wrapper
  var io = {
    dlgt: dlgt,
    noLeftSeparator: dlgt.workspace && (dlgt.workspace.eyo.options.noLeftSeparator ||
      dlgt.workspace.eyo.options.noDynamicList) &&
      (!unwrapped ||
        (!unwrapped.withLeftSeparator_ && !unwrapped.withDynamicList_)),
    noDynamicList: dlgt.workspace && (dlgt.workspace.eyo.options.noDynamicList) &&
      (!unwrapped ||
        !unwrapped.withDynamicList_),
    list: dlgt.inputList,
    presep: this.model.presep,
    postsep: this.model.postsep,
    unique: -1
  }
  this.setupIO(io, 0)
  return io
}

/**
 * List consolidator.
 * Removes empty place holders, add some...
 * Problem of `when`: the block should not consolidate when not in a wokspace.
 * @param {!eYo.Delegate} dlgt, to be consolidated.
 * @param {boolean} force, true if no shortcut is allowed.
 */
eYo.Consolidator.List.prototype.consolidate = eYo.Decorate.reentrant_method('consolidate', function (dlgt, force) {
  // do not consolidate while changing or not in a workspace
  if (dlgt.change.level || !dlgt.workspace) {
    return
  }
  var io = this.getIO(dlgt)
  // things are different if one of the inputs is connected
  if (this.walk_to_next_connected(io)) {
    // console.error('EXPECTED CONSOLIDATION', dlgt.type)
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
  this.doLink(io)
})

/**
 * Fetches the named input object
 * @param {!eYo.Delegate} dlgt
 * @param {String} name The name of the input.
 * @param {?Boolean} dontCreate Whether the receiver should create inputs on the fly.
 * @return {eYo.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
eYo.Consolidator.List.prototype.getInput = function (dlgt, name, dontCreate) {
  // name = eYo.Do.Name.getNormalized(name) not here
  if (!name || !name.length) {
    return null
  }
  this.consolidate(dlgt)
  var f = eYo.Decorate.reentrant_method.call(this, 'consolidate', function () {
    var j = -1
    var io = this.getIO(dlgt)
    do {
      if (io.input) {
        io.presep = io.input.lst_presep || io.presep
        io.postsep = io.input.lst_postsep || io.postsep
        if (!io.m4t.s7r_) {
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
    var ary = this.getAry(io)
    if (ary < Infinity) {
      this.setupIO(io, 0)
      while (this.nextInput(io)) {
        if (io.m4t.target) {
          if (--ary) {
            continue
          }
          return null
        }
      }
    }
    if (!!dontCreate) {
      return null
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
  })
  return eYo.Decorate.whenAns(f.call(this))
}

/**
 * Get the next input compatible with the given type.
 * Enumerator object. Used by the print block.
 * @param {object} io argument object
 * @param {Object} type, string or array of strings
 * @return the next keyword item input, undefined when at end.
 */
eYo.Consolidator.List.prototype.nextInputForType = function (io, type) {
  var filter = goog.isArray(type)
    ? (check) => {
      for (var i = 0; i < type.length; i++) {
        if (goog.array.contains(check, type[i])) {
          return true
        }
      }
    }
    : (check) => {
      return goog.array.contains(check, type)
    }
  while (this.nextInput(io)) {
    var target = io.m4t.target
    if (target && target.check_ && filter(target.check_)) {
      return io.input
    }
  }
  return undefined
}

/**
 * Whether the block has an input for the given type.
 * Used by the print block.
 * @param {!eYo.Delegate} dlgt
 * @param {Object} type, string or array of strings
 * @return the next keyword item input, undefined when at end.
 */
eYo.Consolidator.List.prototype.hasInputForType = function (dlgt, type) {
  var io = this.getIO(dlgt)
  return !!this.nextInputForType(io, type)
}

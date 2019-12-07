/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Consolidators for various list bricks and proper_slice, for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('eYo.Decorate')
eYo.require('eYo.Dlgt')

// eYo.provide('eYo.Consolidator')

/**
 * @name {eYo.Consolidator}
 * @namespace
 */
eYo.makeNS('Consolidator')

// eYo.provide('eYo.Consolidator.Dflt')
// eYo.provide('eYo.Consolidator.Dlgt')
// eYo.provide('eYo.Consolidator.List')

eYo.forwardDeclare('eYo.Brick')
eYo.forwardDeclare('eYo.Do')
eYo.forwardDeclare('eYo.Slot')

console.error('Manage reentrant_ more carefully')

/**
 * Consolidator constructor delegate.
 * @name{eYo.Consolidator.Dlgt}
 * @constructor
 */
eYo.Consolidator.makeClass('Dlgt')

/**
 * @name{eYo.Consolidator.Dflt}
 * @constructor
 * Consolidator. Fake abstract class, just here for the record and namespace.
 * Any dynamic brick must be consolidated.
 * A dynamic brick changes its inputs while alive.
 * Default constructor does nothing
 * Main entry: consolidate
 * These are implemented as potential singletons but are not used as is.
 * Extra initialization may be performed by the init function.
 * TODO: use singletons...
 * @name {eYo.Consolidator.Dflt}
 * @param {Object} model - all the model needed
 * @constructor
 */
eYo.Consolidator.makeClass('Dflt', {
  props: {
    linked: {
      model() {
        return Object.create(null)
      }
    }
  },
  /**
   * Init. Not implemented. No return.
   * @param{Object} model  dictionary.
   */
  init (model) {
    this.reentrant_ = Object.create(null)
    var D = this.model
    var DD = this.constructor.eyo.model_
    if (DD) {
      goog.mixin(D, DD)
    }
    if (model) {
      goog.mixin(D, model)
    }
    eYo.assert(goog.isDef(D.check), 'Consolidators must check their objects')
    D.check = eYo.Decorate.arrayFunction(D.check)
    this.model_ = D
  }
})

/**
 * Main and unique entry point.
 * Removes empty place holders
 * @param {eYo.Brick.Dflt} brick - to be consolidated....
 */
eYo.Consolidator.Dflt.prototype.consolidate = eYo.Do.nothing

/**
 * Create a subclass of a consolidator.
 * This is the preferred method to create consolidator classes.
 * The main purpose is to manage the shared data model
 * and allow inheritance.
 * @param {Object} [ns] - namespace, defaults to `eYo.Consolidator`.
 * @param {String} key - capitalized string except 'Dflt'.
 * @param {Object} [Super] -  ancestor, defaults to `eYo.Consolidator.Dflt`.
 * @param {Object} model - model object
 */
eYo.Consolidator.makeSubclass = function (ns, key, Super, model) {
  if (eYo.isStr(ns)) {
    model = Super
    Super = key
    key = ns
    ns = eYo.Consolidator
  }
  if (eYo.isF(Super)) {
    if (!Super.prototype instanceof eYo.Consolidator.Dflt) {
      model = Super
      Super = eYo.Consolidator.Dflt
    }
  } else {
    model = Super
    Super = eYo.Consolidator.Dflt
  }
  if (goog.isFunction(model)) {
    model = model()
  }
  var c9r = eYo.makeClass(ns, key, Super, eYo.Consolidator.Dlgt, model)
  var eyo = c9r.eyo
  if (Super.eyo.model) {
    goog.mixin(eyo.model, Super.eyo.model)
  }
  if (model) {
    goog.mixin(eyo.model_, model)
  }
}

/**
 * List consolidator.
 * Remove empty place holders, add separators,
 * order non empty placeholders.
 * Main entries: consolidate and getSlot.
 * The idea is to create the slot elements
 * only when needed.
 * The undo/redo management is based on the name
 * of the slot, which means that naming should be done
 * dynamically.
 */
eYo.Consolidator.Dflt.makeSubclass('List', {
  /**
   * Initialize the list consolidator.
   * @param {Object} d model.
   */
  init (d) {
    if (this.model.unique) {
      this.model.unique = eYo.Decorate.arrayFunction(this.model.unique)
    }
    if (this.model.all) {
      this.model.all = eYo.Decorate.arrayFunction(this.model.all)
    }
    this.model.ary || (this.model.ary = Infinity)  
  }
})

/**
 * Get the ary.
 * Asks the list
 * @param {Object} io parameter.
 */
eYo.Consolidator.List.prototype.getAry = function (io) {
  if (io.brick) {
    var d = io.brick.ary_d
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
 * @param {Object} io parameter.
 */
eYo.Consolidator.List.prototype.getMandatory = function (io) {
  if (io.brick) {
   var d = io.brick.mandatory_d
    if (d) {
      return d.get()
    }
    if (goog.isFunction(this.model.mandatory)) {
      return this.model.mandatory(io.brick.type, io.brick.subtype)
    }
  }
  return goog.isDef(this.model.mandatory)
  ? this.model.mandatory
  : this.model.mandatory = 0
}

/**
 * Setup the io parameter dictionary.
 * Called when the slot list has changed and or the index has changed.
 * @param {Object} io parameter.
 */
eYo.Consolidator.List.prototype.setupIO = function (io, i) {
  if (i !== eYo.NA) {
    io.i = i
  }
  if ((io.slot = io.list[io.i])) {
    io.m4t = io.slot.magnet
    eYo.assert(!io.slot || !!io.m4t, 'List items must have a magnet')
    return true
  } else {
    io.m4t = null
    return false
  }
}

/**
 * Advance to the next slot. Returns false when at end.
 * @param {Object} io parameter.
 * @return boolean, false when at end
 */
eYo.Consolidator.List.prototype.nextSlot = function (io) {
  ++io.i
  return this.setupIO(io)
}

/**
 * Wether the current slot is connected or will be connected.
 * @param {Object} io parameter.
 * @return boolean, true when connected.
 */
eYo.Consolidator.List.prototype.willBeConnected = function (io) {
  return io.slot && (io.m4t.target || io.m4t.will_connect_)
}

/**
 * Insert a placeholder at the given index.
 * io is properly set up at the end.
 * @param {Object} io parameter.
 * @param {number} i When eYo.NA, take io.i
 * @return {eYo.Slot}, the slot inserted.
 */
eYo.Consolidator.List.prototype.insertPlaceholder = function (io, i) {
  if (goog.isNumber(i)) {
    io.i = i
  }
  var model = {
    willConnect: /** @suppress {globalThis} */ function (targetM4t) {
      this.will_connect_ = this.brick.will_connect_ = true // do not consolidate
    },
    didConnect: /** @suppress {globalThis} */ function (oldTargetM4t, targetOldM4t) {
      this.will_connect_ = this.brick.will_connect_ = false
    }
  }
  var slot = new eYo.Slot(io.brick, '!', model)
  io.list.splice(io.i, 0, slot)
  io.edited = true
  this.setupIO(io)
  return slot
}

/**
 * Dispose of the slot at the given index.
 * No range checking.
 * io is properly set up at the end.
 * @param {Object} io parameter.
 * @return boolean, whether the io is at end.
 */
eYo.Consolidator.List.prototype.disposeAtI = function (io, i) {
  if (!goog.isNumber(i)) {
    i = io.i
  }
  var slot = io.list[i]
  var m4t = slot.magnet
  m4t && (m4t.disconnect())
  slot.dispose()
  io.list.splice(i, 1)
  io.edited = true
  return this.setupIO(io)
}

/**
 * Returns the required types for the current slot.
 * When not in single mode, returns `check`.
 * When in single mode, returns `all` if the list is void
 * or if there is only one item to be replaced.
 * In all other situations, return `check`.
 * @param {Object} io parameter.
 */
eYo.Consolidator.List.prototype.getCheck = function (io) {
  if (this.model.all) {
    if (io.unique >= 0 || io.list.length === 1) {
      // a single brick or no brick at all
      return this.model.all(io.brick.type, io.brick.subtype)
    } else if (io.list.length === 3 && io.i === 1) {
      // there is only one item in the list
      // and it can be replaced by any kind of brick
      return this.model.all(io.brick.type, io.brick.subtype)
    } else {
      // bricks of type check are already there
      return this.model.check(io.brick.type, io.brick.subtype)
    }
  }
  return this.model.check(io.brick.type, io.brick.subtype)
}

/**
 * Finalize the current slot as a placeholder.
 * @param {Object} io parameter.
 */
eYo.Consolidator.List.prototype.doFinalizePlaceholder = function (io, name = eYo.NA, optional = false) {
  io.slot.lst_n = io.n
  io.slot.lst_presep = io.presep
  io.slot.lst_postsep = io.postsep
  io.m4t.s7r_ = false
  var check = this.getCheck(io)
  if (check && check.length === 0) {
    console.error('CONNECTIONS FORBIDDEN ?', this.getCheck(io)) // DEBUG
  }
  if (name && name.length) {
    io.slot.name_ = name
  }
  io.slot.check = check
  io.m4t.optional_ = optional
  while (io.slot.fieldRow.length) {
    io.slot.fieldRow.shift().dispose()
  }
}

/**
 * Finalize the current slot as a separator.
 * @param {Object} io parameter.
 */
eYo.Consolidator.List.prototype.doFinalizeSeparator = function (io, extreme, name) {
  io.slot.lst_presep = io.presep || ''
  io.slot.lst_postsep = io.postsep || ''
  if (name && name.length) {
    io.slot.name = name
  }
  io.m4t.s7r_ = true
  io.m4t.disabled_ = false
  if (extreme || (!io.slot.lst_presep.length && io.slot.lst_postsep.length)) {
    // remove all the fields
    eYo.Field.disposeFields(io.slot)
  } else if (!io.slot.fieldRow.length) {
    var f = (sep, suffix) => {
      var field = new eYo.FieldLabel(io.slot, sep)
      io.slot.fieldRow.splice(0, 0, field)
      field.initUI()
      field.suffix = suffix
    }
    var sep = io.slot.lst_presep || this.model.presep
    sep && sep.length && f(sep)
    sep = io.slot.lst_postsep || this.model.postsep
    sep && sep.length && f(sep, true)
  }
  io.slot.check = this.getCheck(io)
  io.m4t.hidden_ = eYo.NA
  if (io.brick.locked_) {
    io.m4t.hidden_ = true
  } else if (io.i === 0 && io.noLeftSeparator && io.list.length > 1) {
    io.m4t.hidden_ = true
  } else if (io.i === 2 && io.list.length === 3 && io.noDynamicList) {
    io.m4t.hidden_ = true
  } else if (!io.brick.incog) {
    io.m4t.hidden_ = false
  }
  io.m4t.ignoreBindField = io.i === 0 && io.list.length > 1
}

/**
 * Consolidate a connected slot but the first one.
 * Add an unconnected slot after, if there is no one.
 * On return, io points to the location after
 * the potential separator.
 * @param {Object} io parameter.
 * @return yes exactly if there are more slots
 */
eYo.Consolidator.List.prototype.consolidate_connected = function (io) {
  // ensure that there is one slot after,
  // which is not connected
  if (!this.nextSlot(io) || this.willBeConnected(io)) {
    this.insertPlaceholder(io)
    // this one is connected or missing
    // we would expect a separator
  }
  return this.nextSlot(io)
}

/**
 * Consolidate the first connected slot
 * @param {Object} io parameter.
 * @return true exactly if there are more slots
 */
eYo.Consolidator.List.prototype.consolidate_first_connected = function (io) {
  // let subclassers catch this if they want to.
  if (!this.consolidate_single(io)) {
    // nothing more to consolidate
    return false
  }
  // the actual slot is the first connected
  // remove whatever precedes it, except the very first separator, if any
  var j = io.i
  if (j === 0) {
    // there is an opening separator missing
    this.insertPlaceholder(io)
    this.nextSlot(io)
  } else {
    while (j > 1) {
      this.disposeAtI(io, --j)
    }
  }
  return this.consolidate_connected(io)
}

/**
 * Consolidate the first connected slot when expected to be single.
 * Default implementation return true.
 * Subclassers will manage things differently and
 * return false
 * @param {Object} io parameter.
 * @return yes exactly if there are more slots
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
 * @param {Object} io parameter.
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
    var unique = this.model.unique(io.brick.type, io.brick.subtype)
    if (!unique) {
      throw `MISSING UNIQUE ${this.model.unique(io.brick.type, io.brick.subtype)}`
    } else if (io.m4t.target.check_.some(x => unique && unique.indexOf(x) >= 0)) {
      io.unique = io.i
    }
  }
}

/**
 * Find the next connected slot.
 * @param {Object} io parameter.
 * @param {boolean} gobble whether to gobble intermediate slot.
 */
eYo.Consolidator.List.prototype.walk_to_next_connected = function (io, gobble) {
  // things are different if one of the inputs is connected
  while (io.slot) {
    if (this.willBeConnected(io)) {
      io.presep = io.slot.lst_presep || this.model.presep
      io.postsep = io.slot.lst_postsep || this.model.postsep
      // manage the unique slot
      if (io.unique < 0) {

      }
      this.makeUnique(io)
      return true
    }
    if (gobble) {
      this.disposeAtI(io)
    } else {
      this.nextSlot(io)
    }
  }
  return false
}

/**
 * No connected connection has been found.
 * Removes extra empty placeholders, or
 * create of if none exists.
 * @param {Object} io parameter.
 */
eYo.Consolidator.List.prototype.consolidate_unconnected = function (io) {
  // remove any separator up to the first placeholder
  // This is because the placeholder may have been connected
  // before, undoing will be easier.
  this.setupIO(io, 0)
  var ary = this.getAry(io)
  if (ary > 0) {
    if (io.slot) {
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
        if (this.nextSlot(io)) {
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
    // create a slot
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
 * @param {Object} io parameter.
 */
eYo.Consolidator.List.prototype.doCleanup = function (io) {
}

/**
 * When there is a limitation of the number of arguments,
 * remove the excedent.
 * @param {Object} io parameter.
 */
eYo.Consolidator.List.prototype.doAry = function (io) {
  var ary = this.getAry(io)
  if (ary < Infinity) {
    this.setupIO(io, 0)
    while (this.nextSlot(io)) {
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
        } while (this.nextSlot(io));
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
        } while (this.nextSlot(io));
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
 * @param {Object} io parameter.
 */
eYo.Consolidator.List.prototype.doFinalize = function (io) {
  this.setupIO(io, 0)
  if (io.list.length === 1) {
    this.doFinalizePlaceholder(io, eYo.NA, !this.getMandatory(io))
    return
  }
  var previous = eYo.Do.Name.min_name
  var next = io.list[io.i + 1].name
  var name = eYo.Do.Name.getBetween(previous, next)
  this.doFinalizeSeparator(io, true, name)
  this.nextSlot(io)
  this.doFinalizePlaceholder(io)
  previous = next
  while (this.nextSlot(io)) {
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
      this.nextSlot(io)
      this.doFinalizePlaceholder(io)
    }
  }
}

/**
 * In order to prepare rendering, add some information to the inputs.
 * @param {Object} io parameter.
 */
eYo.Consolidator.List.prototype.doLink = function (io) {
  this.setupIO(io, 0)
  var wasSeparator = false
  var previous = eYo.NA
  while (this.nextSlot(io)) {
    if (io.m4t.s7r_) {
      if (previous) {
        previous.nextIsSeparator = true
        previous = eYo.NA
      }
      wasSeparator = true
    } else {
      if (previous) {
        previous.nextIsSeparator = false
      }
      previous = io.slot
      previous.previousIsSeparator = wasSeparator
      wasSeparator = false
    }
  }
  if (previous) {
    previous.nextIsSeparator = false
  }
}

/**
 * Prepare io, just before walking through the slot list.
 * Subclassers may add their own stuff to io.
 * @param {Object} io - parameters....
 */
eYo.Consolidator.List.prototype.getIO = function (brick) {
  var unwrapped = brick.wrapper
  var io = {
    brick: brick,
    noLeftSeparator: brick.board && (brick.board.eyo.options.noLeftSeparator ||
      brick.board.eyo.options.noDynamicList) &&
      (!unwrapped ||
        (!unwrapped.withLeftSeparator_ && !unwrapped.withDynamicList_)),
    noDynamicList: brick.board && (brick.board.eyo.options.noDynamicList) &&
      (!unwrapped ||
        !unwrapped.withDynamicList_),
    list: brick.slots,
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
 * Problem of `when`: the brick should not consolidate when not in a wokspace.
 * @param {eYo.Brick.Dflt} brick - to be consolidated.
 * @param {boolean} force - true if no shortcut is allowed.
 */
eYo.Consolidator.List.prototype.consolidate = eYo.Decorate.reentrant_method('consolidate', function (brick, force) {
  // do not consolidate while changing or not in a board
  if (brick.change.level || !brick.board) {
    return
  }
  var io = this.getIO(brick)
  // things are different if one of the inputs is connected
  if (this.walk_to_next_connected(io)) {
    // console.error('EXPECTED CONSOLIDATION', brick.type)
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
    // no connected slot
    this.consolidate_unconnected(io)
  }
  this.doLink(io)
})

/**
 * Fetches the named slot object
 * @param {eYo.Brick.Dflt} brick
 * @param {String} name The name of the slot.
 * @param {Boolean} [dontCreate] Whether the receiver should create slots on the fly.
 * @return {eYo.Slot} The slot object, or null if slot does not exist or eYo.NA for the default brick implementation.
 */
eYo.Consolidator.List.prototype.getSlot = function (brick, name, dontCreate) {
  // name = eYo.Do.Name.getNormalized(name) not here
  if (!name || !name.length) {
    return null
  }
  this.consolidate(brick)
  var f = eYo.Decorate.reentrant_method.call(this, 'consolidate', function () {
    var j = -1
    var io = this.getIO(brick)
    do {
      if (io.slot) {
        io.presep = io.slot.lst_presep || io.presep
        io.postsep = io.slot.lst_postsep || io.postsep
        if (!io.m4t.s7r_) {
          var o = eYo.Do.Name.getOrder(io.slot.name, name)
          if (!o) {
            return io.slot
          }
          if (o > 0 && j < 0) {
            j = io.i
          }
        }
      }
    } while (this.nextSlot(io))
    var ary = this.getAry(io)
    if (ary < Infinity) {
      this.setupIO(io, 0)
      while (this.nextSlot(io)) {
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
    // no slot found, create one
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
    var slot = this.insertPlaceholder(io)
    slot.name = name
    this.doFinalize(io)
    // this.doAry(io)
    return slot
  })
  return eYo.Decorate.whenAns(f.call(this))
}

/**
 * Get the next slot compatible with the given type.
 * Enumerator object. Used by the print brick.
 * @param {object} io argument object
 * @param {Object} type - string or array of strings
 * @return the next keyword item slot, eYo.NA when at end.
 */
eYo.Consolidator.List.prototype.nextSlotForType = function (io, type) {
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
  while (this.nextSlot(io)) {
    var target = io.m4t.target
    if (target && target.check_ && filter(target.check_)) {
      return io.slot
    }
  }
  return eYo.NA
}

/**
 * Whether the brick has an slot for the given type.
 * Used by the print brick.
 * @param {eYo.Brick.Dflt} brick
 * @param {Object} type - string or array of strings
 * @return the next keyword item slot, eYo.NA when at end.
 */
eYo.Consolidator.List.prototype.hasInputForType = function (brick, type) {
  var io = this.getIO(brick)
  return !!this.nextSlotForType(io, type)
}

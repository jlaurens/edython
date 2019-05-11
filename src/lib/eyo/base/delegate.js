/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Block delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Delegate')

goog.require('eYo.Helper')
goog.require('eYo.Decorate')
goog.require('eYo.Events')
goog.require('eYo.Span')
goog.require('Blockly.Blocks')

goog.require('eYo.XRE')
goog.require('eYo.T3')
goog.require('eYo.Do')
goog.require('eYo.Data')
goog.require('eYo.Where')
goog.require('goog.dom')

goog.forwardDeclare('eYo.Block')
goog.forwardDeclare('eYo.Slot')
goog.forwardDeclare('eYo.FieldHelper')
goog.forwardDeclare('eYo.Magnets')
goog.forwardDeclare('eYo.UI')
goog.forwardDeclare('eYo.Delegate.Expr')
goog.forwardDeclare('eYo.Delegate.Stmt')
goog.forwardDeclare('eYo.Selected')

/**
 * Class for a Block Delegate.
 * Not normally called directly, eYo.Delegate.Manager.create(...) is preferred.
 * Also initialize a implementation model.
 * The underlying state and model are not expected to change while running.
 * When done, the node has all its properties ready to use
 * but their values are not properly setup.
 * The block may not be in a consistent state,
 * for what it was designed to.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 * @readonly
 * @property {object} span - Contains the various extents of the receiver.
 * @readonly
 * @property {object} surroundParent - Get the surround parent.
 * @readonly
 * @property {object} wrapper - Get the surround parent which is not wrapped_.
 */
eYo.Delegate = function (workspace, type, opt_id) {
  eYo.Delegate.superClass_.constructor.call(this)
  this.workspace = workspace
  this.baseType_ = type // readonly private property used by getType
  this.getBaseType = eYo.Delegate.prototype.getBaseType // no side effect during creation.
  /** @type {string} */
  this.id = (opt_id && !workspace.getBlockById(opt_id)) ?
      opt_id : Blockly.utils.genUid()
  /** @type {!Array.<!eYo.Input>} */
  this.inputList = []
  /**
   * @type {!Array.<!Blockly.Block>}
   * @private
   */
  this.childBlocks_ = []

  this.errors = Object.create(null) // just a hash
  this.block_ = block
  this.span_ = new eYo.Span(this)
  this.xy_ = new eYo.Where(0, 0)
  block.eyo = this
  this.change = {
    // the count is incremented each time a change occurs,
    // even when undoing.
    // Some lengthy actions may be shortened when the count
    // has not changed since the last time it was performed
    count: 0,
    // the step is the count, except that it is freezed while editing
    step: 0,
    // The level indicates cascading changes
    // Some actions that are performed when something changes
    // should not be performed while there is a pending change.
    // The level is incremented before the change and
    // decremented after the change (see `changeWrap`)
    // If we have
    // A change (level 1) => B change (level 2) => C change (level 3)
    // Such level aware actions are not performed when B and C
    // have changed because the level is positive (respectivelly 1 and 2),// a contrario they are performed when the A has changed because
    // the level is 0.
    level: 0,
    // Some operations are performed only when there is a change
    // In order to decide whether to run or do nothing,
    // we have to store the last change count when the operation was
    // last performed. See `onChangeCount` decorator.
    save: {},
    // When these operations return values, they are cached below
    // until they are computed once again.
    cache: {}
  }
  // to manage reentrency
  this.reentrant_ = {}
  this.mainHeight_ = this.blackHeight_ = this.suiteHeight_ = this.nextHeight_ = this.headHeight_ = this.footHeight_ = 0
  this.updateMainCount()
  // make the state
  this.newData()
  this.makeFields()
  this.makeSlots()
  this.makeConnections()
  // now make the bounds between data and fields
  this.makeBounds()
  eYo.Events.disableWrap(() => {
    this.changeWrap(() => {
      // initialize the data
      this.forEachData(data => data.init())
      this.forEachSlot(slot => slot.init())
      // At this point the state value may not be consistent
      this.consolidate()
      // but now it should be
      this.model.init && this.model.init.call(this)
    })
  })
  this.block_ = new eYo.Block(this)
  // Now we are ready to work
  delete this.getBaseType // next call will use the overriden method if any
}
goog.inherits(eYo.Delegate, eYo.Helper)

/**
 * Dispose of all the resources.
 */
eYo.Delegate.prototype.dispose = function (healStack, animate) {
  this.consolidate = this.beReady = this.render = eYo.Do.nothing
  this.ui_ && this.ui_.dispose() && (this.ui_ = null)
  this.span.dispose()
  this.span_ = undefined
  eYo.Events.groupWrap(() => {
    this.magnets.dispose()
    this.forEachSlot(slot => slot.dispose())
    this.slots = undefined
    eYo.FieldHelper.disposeFields(this)
    this.forEachData(data => data.dispose())
    this.data = undefined
    this.inputList = undefined
    this.childBlocks_ = undefined
    if (this.selected) {
      // this block was selected, select the block below or above before deletion
      var f = m => m && m.target
      var m4t = f(m4ts.right) || f(m4ts.left) || f(m4ts.head) || f(m4ts.foot) || f(m4ts.output)
    }
    this.unplug(healStack)
     && m4t.select()
  })
  this.workspace = undefined
}

/**
 * Model getter. Convenient shortcut.
 */
eYo.Do.getModel = function (type) {
  return eYo.Delegate.Manager.getModel(type)
}

Object.defineProperties(eYo.Delegate.prototype, {
  /** @type {string} */
  type: {
    get () {
      return this.getBaseType()
    }
  },
  subtype: {
    get () {
      return this.getSubtype()
    }
  },
  model: {
    get () {
      return this.constructor.eyo.model
    }
  },
  surround: {
    get () {
      var ans
      if ((ans = this.output)) {
        return ans
      } else if (!this.magnets.output) {
        var eyo = this.leftMost
        while ((ans = eyo.head)) {
          if (ans.suite === eyo) {
            return ans
          }
          eyo = ans
        }
      }
      return null
    }
  },
  surroundParent: {
    get () {
      var ans = this.surround
      return ans && ans.block_
    }
  },
  group: {
    get () {
      var eyo = this
      var m4t
      while ((m4t = eyo.magnets.head) && (m4t = m4t.target)) {
        eyo = m4t.b_eyo
        if (m4t.isSuite) {
          return eyo
        }
      }
    }
  },
  wrapper: {
    get () {
      var ans = this
      while (ans.wrapped_) {
        var parent = ans.parent
        if (parent) {
          ans = parent
        } else {
          break
        }
      }
      return ans
    }
  },
  wrapped_: {
    get () {
      return this.wrapped__
    },
    set (newValue) {
      if (newValue && !this.wrapped__) {
        this.duringBlockWrapped()
      } else if (!newValue && this.wrapped__) {
        this.duringBlockUnwrapped()
      }
      this.wrapped__ = newValue
    }
  },
  topGroup: {
    get () {
      var ans
      var group = this.group
      while (group) {
        ans = group
        group = ans.group
      }
      return ans
    }
  },
  /**
   * Return the parent which is a statement, if any.
   * Never returns `this`.
   */
  stmtParent: {
    get () {
      var eyo = this
      do {
        eyo = eyo.parent
      } while (eyo && !eyo.isStmt)
      return eyo
    }
  },
  span: {
    get () {
      return this.span_
    }
  },
  mainHeight: {
    get () {
      return this.span.main
    },
    set (newValue) {
      this.span.main = newValue
    }
  },
  blackHeight: {
    get () {
      return this.span.black
    },
    set (newValue) {
      this.span.black = newValue
    }
  },
  suiteHeight: {
    get () {
      return this.span.suite
    },
    set (newValue) {
      this.span.suite = newValue
    }
  },
  nextHeight: {
    get () {
      return this.span.next
    },
    set (newValue) {
      this.span.next = newValue
    }
  },
  headHeight: {
    get () {
      return this.span.head
    },
    set (newValue) {
      this.span.head = newValue
    }
  },
  footHeight: {
    get () {
      return this.span.foot
    },
    set (newValue) {
      this.span.foot = newValue
    }
  },
  // Magnets
  magnets_: {
    writable: true
  },
  magnets: {
    get () {
      return this.magnets_
    }
  },
  output: {
    get () {
      var m = this.magnets.output
      if (m) {
        var t = m.target
        return t && t.b_eyo
      }
    }
  },
  head: {
    get () {
      var m = this.magnets.head
      if (m) {
        var t = m.target
        return t && t.b_eyo
      }
    },
    set (newValue) {
      this.magnets.head.target = newValue
    }
  },
  left: {
    get () {
      var m = this.magnets.left
      if (m) {
        var t = m.target
        return t && t.b_eyo
      }
    },
    set (newValue) {
      this.magnets.left.target = newValue
    }
  },
  right: {
    get () {
      var m = this.magnets.right
      if (m) {
        var t = m.target
        return t && t.b_eyo
      }
    },
    set (newValue) {
      this.magnets.right.target = newValue
    }
  },
  suite: {
    get () {
      var m = this.magnets.suite
      if (m) {
        var t = m.target
        return t && t.b_eyo
      }
    },
    set (newValue) {
      this.magnets.suite.target = newValue
    }
  },
  foot: {
    get () {
      var m = this.magnets.foot
      if (m) {
        var t = m.target
        return t && t.b_eyo
      }
    },
    set (newValue) {
      this.magnets.foot.target = newValue
    }
  },
  leftMost: {
    get () {
      var ans = this
      var eyo
      while ((eyo = ans.left)) {
        ans = eyo
      }
      return ans
    }
  },
  headMost: {
    get () {
      var ans = this
      var eyo
      while ((eyo = ans.head)) {
        ans = eyo
      }
      return ans
    }
  },
  rightMost: {
    get () {
      var ans = this
      var eyo
      while ((eyo = ans.right)) {
        ans = eyo
      }
      return ans
    }
  },
  footMost: {
    get () {
      var ans = this
      var eyo
      while ((eyo = ans.foot)) {
        ans = eyo
      }
      return ans
    }
  },
  previous: {
    get () {
      console.error("INCONSISTENCY BREAK HERE")
      throw "FORBIDDEN"
    }
  },
  next: {
    get () {
      console.error("INCONSISTENCY BREAK HERE")
      throw "FORBIDDEN"
    }
  },
  /**
   * Return the topmost enclosing block in this block's tree.
   * May return `this`.
   * @return {!eYo.Delegate} The root block.
   */
  root: {
    get () {
      var eyo = this
      var parent
      while ((parent = eyo.parent)) {
        eyo = parent
      }
      return eyo
    }
  },
  /**
   * Return the statement after the receiver.
   * @return {!eYo.Delegate} The root block.
   */
  after: {
    get () {
      var eyo = this.isStmt ? this : this.stmtParent
      var after = eyo.right || eyo.suite || eyo.next
      if (after) {
        return after
      }
      while ((eyo = eyo.parent)) {
        if ((after = eyo.next)) {
          break
        }
      }
      return after
    },
  },
  lastInput: {
    get () {
      var list = this.inputList
      return list[list.length - 1]
    }
  },
  /**
   * Return the enclosing block in this block's tree
   * which is a control. May be null. May be different from the `root`.
   * @return {?eYo.Delegate} The root block.
   */
  rootControl: {
    get () {
      var eyo = this
      while (!eyo.isControl && (eyo = eyo.parent));
      return eyo
    }
  },
  /**
   * @readonly
   * @property {Boolean}  Whether this block is white. White blocks have no effect,
   * the action of the algorithm is exactly the same whether the block is here or not.
   * White blocks are comment statements, disabled blocks
   * and maybe other kinds of blocks to be found...
   */
  isWhite: {
    get () {
      return this.disabled
    }
  },
  isExpr: {
    get () {
      return false
    }
  },
  isStmt: {
    get () {
      return false
    }
  },
  isGroup: {
    get () {
      return false
    }
  },
  depth: {
    get () {
      return 0
    }
  },
  recover: {
    get () {
      return this.block_.workspace.eyo.recover
    }
  },
  /**
   * Full height, in text units.
   */
  fullHeight: {
    get () {
      return this.full_height_width__.height
    }
  },
  /**
   * Full width, in text units.
   */
  fullWidth: {
    get () {
      return this.full_height_width__.height
    }
  },
  /**
   * cached size of the receiver, in text units.
   * Stores the height, minWidth and width.
   * The latter includes the right padding.
   * It is updated in the right alignment method.
   */
  size: {
    get: eYo.Decorate.onChangeCount('full_HW__', function() {
      var height = this.span.height
      var minWidth = this.span.width
      var width = minWidth
      // Recursively add size of subsequent blocks.
      var nn, HW
      if ((nn = this.right)) {
        minWidth += nn.size.minWidth
        width += nn.size.width
        // The height of the line is managed while rendering.
      } else {
        width += this.span.right
      }
      if ((nn = n.foot)) {
        height += nn.size.height // NO Height of tab.
        var w = nn.size.width
        if (width < w) {
          width = minWidth = w
        } else if (minWidth < w) {
          minWidth = w
        }
      }
      return {height: height, width: width, minWidth: minWidth}
    })
  },
})
/**
 * Get the block.
 * For edython.
 * @param {boolean} newValue
 */
 eYo.Delegate.prototype.getBlock = function () {
  return this.block_
}

/**
 * Increment the change count.
 * The change.count is used to compute some properties that depend
 * on the core state. Some changes induce a change in the change.count
 * which in turn may induce a change in properties.
 * Beware of the stability problem.
 * The change.count is incremented whenever a data changes,
 * a child block changes or a connection changes.
 * This is used by the primary delegate's getType
 * to cache the return value.
 * For edython.
 * @param {*} deep  Whether to propagate the message to children.
 */
eYo.Delegate.prototype.incrementChangeCount = function (deep) {
  ++ this.change.count
  if (!this.isEditing) {
    this.change.step = this.change.count
  }
  if (deep) {
    this.forEachChild(d => d.incrementChangeCount(deep))
  }
}

/**
 * Begin a mutation.
 * The change level is used to keep track of the cascading mutations.
 * When mutations imply other mutations, there is no need to perform some actions until the original mutation is done.
 * For example, rendering should not be done until all the mutations are made.
 * Changes not only concern the data, they may concern the
 * slot visibility too.
 * For edython.
 */
eYo.Delegate.prototype.changeBegin = function () {
  ++this.change.level
}

/**
 * Ends a mutation.
 * When a change is complete at the top level,
 * the change count is incremented and the receiver
 * is consolidated.
 * This is the only place where consolidation should occur.
 * For edython.
 * @return {Number} the change level
 */
eYo.Delegate.prototype.changeEnd = function () {
  --this.change.level
  if (this.change.level === 0) {
    this.incrementChangeCount()
    this.consolidate()
    this.didChangeEnd && this.didChangeEnd(this)
  }
  if (!this.change.level) {
    this.render()
  }
  return this.change.level
}

/**
 * Begin a mutation.
 * For edython.
 * @param {!Function} do_it
 * @param {*} thisObject
 * @param {*} rest
 */
eYo.Delegate.prototype.changeWrap = function () {
  var args = Array.prototype.slice.call(arguments)
  var ans
  try {
    this.changeBegin()
    args[0] && (ans = args[0].apply(args[1] || this, args.slice(2)))
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    this.changeEnd()
  }
  return ans
}

/**
 * Set the value wrapping in a `changeBegin`/`changeEnd`
 * group call of the owner.
 * @param {Object} newValue
 * @param {Boolean} notUndoable
 */
eYo.Data.prototype.change = function (newValue, validate) {
  if (newValue !== this.get()) {
    this.owner.changeWrap(
      this.set,
      this,
      newValue,
      validate
    )
  }
}

/**
 * Decorate of change count hooks.
 * Returns a function with signature is `foo(whatever) → whatever`
 * `foo` is overriden by the model.
 * The model `foo` can call the builtin `foo` with `this.foo(...)`.
 * `do_it` receives all the parameters that the decorated function will receive.
 * If `do_it` return value is not an object, the change.count is not recorded
 * If `do_it` return value is an object with a `return` property,
 * the `change.count` is recorded such that `do_it` won't be executed
 * until the next `change.count` increment.
 * @param {!String} key,
 * @param {!Function} do_it  must return something.
 * @return {!Function}
 */
eYo.Decorate.onChangeCount = function (key, do_it) {
  goog.asserts.assert(goog.isFunction(do_it), 'do_it MUST be a function')
  return function() {
    var c = this.change
    if (c.save[key] === c.count) {
      return c.cache[key]
    }
    var did_it = do_it.apply(this, arguments)
    if (did_it) {
      c.save[key] = c.count
      c.cache[key] = did_it.ans
    }
    return c.cache[key]
  }
}

/**
 * Called when data and slots will load.
 * First send an eponym message to both the data and slots,
 * then use the model's method if any.
 */
eYo.Delegate.prototype.willLoad = function () {
  this.forEachData(data => data.willLoad())
  this.forEachSlot(slot => slot.willLoad())
  var willLoad = this.model.willLoad
  if (goog.isFunction(willLoad)) {
    willLoad.call(this)
  }
}

/**
 * Called when data and slots have loaded.
 */
eYo.Delegate.prototype.didLoad = function () {
  this.forEachData(data => data.didLoad())
  this.forEachSlot(slot => slot.didLoad())
  var didLoad = this.model.didLoad
  if (goog.isFunction(didLoad)) {
    didLoad.call(this)
  }
  this.incrementChangeCount()
}

/**
 * Tests if two block delegates are equal.
 * Blocks must be of the same type.
 * Lists and dictionaries are managed differently.
 * Usefull for testing purposes for example.
 * @param {?eYo.Delegate} rhs  Another block delegate
 */
eYo.Delegate.prototype.equals = function (rhs) {
  var equals = rhs && (this.type == rhs.type)
  if (equals) {
    this.forEachData(data => {
      var r_data = rhs.data[data.key]
      equals = r_data && (data.get() == r_data.get() || (data.incog && r_data.incog))
      return equals // breaks if false
    })
    if (equals) {
      this.forEachSlot(slot => {
        var r_slot = rhs.slots[slot.key]
        if (slot.incog) {
          equals = !r_slot || r_slot.incog
        } else if (r_slot) {
          if (r_slot.incog) {
            equals = false
          } else {
            var target = slot.targetBlock()
            var r_target = r_slot.targetBlock()
            equals = target
              ? r_target && target.eyo.equals(r_target.eyo)
              : !r_target
          }
        } else {
          equals = false
        }
        return equals // breaks if false
      })
    }
  }
  return equals
}

/**
 * This methods is a higher state mutator.
 * A primary data change or a primary connection change has just occurred.
 * (Primary meaning that no other change has been performed
 * that has caused the so called primary change).
 * At return time, the block is in a consistent state.
 * All the connections and components are consolidated
 * and are in a consistent state.
 * This method is sent from a `changeEnd` method only.
 * Sends a `consolidate` message to each component of the block.
 * However, there might be some caveats related to undo management,
 * this must be investigated.
 * This message is sent by:
 * - an expression to its parent when consolidated
 * - a list just before rendering
 * - when removing items from a list
 * - when a list creates a consolidator
 * - when an argument list changes its `ary` or `mandatory`
 * - in the changeEnd method
 * Consolidation will not occur when no change has been
 * performed since the last consolidation.
 *
 * The return value may be cached.
 *
 * @param {?Boolean} deep
 * @param {?Boolean} force
 * @return {Boolean} true when consolidation occurred
 */
eYo.Delegate.prototype.doConsolidate = function (deep, force) {
  if (!force && (!eYo.Events.recordUndo || !this.block_.workspace || this.change.level > 1)) {
    // do not consolidate while un(re)doing
    return
  }
  // synchronize everything
  this.synchronizeData()
  this.synchronizeSlots()
  // first the type
  this.consolidateType()
  // then the in state
  this.consolidateData()
  this.consolidateSlots(deep, force)
  this.consolidateInputs(deep, force)
  // then the out state
  this.consolidateMagnets()
  return true
}

/**
 * Wraps `doConsolidate` into a reentrant and `change.count` aware method.
 */
eYo.Delegate.prototype.consolidate = eYo.Decorate.reentrant_method(
  'consolidate',
  eYo.Decorate.onChangeCount(
    'consolidate',
    function (deep, force) {
      this.doConsolidate(deep, force)
    }
  )
)

/**
 * Get the eyo namespace in the constructor.
 * Create one if it does not exist.
 * Closure used.
 */
eYo.Delegate.getC9rEyO = (() => {
  // one (almost hidden) shared constructor
  var EyOC9r = function (key, owner) {
    owner.eyo = this
    this.owner = owner
    this.key = key
    this.types = []
  }
  return function (delegateC9r, key) {
    if (delegateC9r.eyo) {
      return delegateC9r.eyo
    }
    return new EyOC9r(key, delegateC9r)
  }
})()

/**
 * Delegate manager.
 * @param {?string} prototypeName Name of the language object containing
 */
eYo.Delegate.Manager = (() => {
  var me = {}
  var C9rs = Object.create(null)
  /**
   * Just adds a proper eyo object to the delegate.
   * @param {Object} constructor
   * @param {string} key
   * @private
   */
  me.prepareDelegate = function (delegateC9r, key) {
    var eyo = eYo.Delegate.getC9rEyO(delegateC9r, key || '')
    if (!eyo.getModel) {
      eyo.getModel = function () {
        return modeller(delegateC9r)
      }
      Object.defineProperties(
        eyo,
        {
          model: {
            get () {
              return this.getModel()
            }
          }
        }
      )
    }
    return eyo
  }
  /**
   * Helper to initialize a block's model.
   * to and from are trees.
   * Add to destination all the leafs from source.
   * @param {!Object} to  destination.
   * @param {!Object} from  source.
   */
  var merger = (to, from, ignore) => {
    var from_d
    if ((from.check)) {
      from.check = eYo.Do.ensureArrayFunction(from.check)
    } else if ((from_d = from.wrap)) {
      from.check = eYo.Do.ensureArrayFunction(from_d)
    }
    for (var k in from) {
      if (ignore && ignore(k)) {
        continue
      }
      from_d = from[k]
      // next contains my test for a dictionary, hence my meaning of dictionary
      // in that context
      if (goog.isNull(from_d) || goog.isBoolean(from_d) || goog.isNumber(from_d) || goog.isString(from_d) || goog.isFunction(from_d) || goog.isArray(from_d)) {
        to[k] = from_d
      } else if (from_d && Object.keys(from_d).length === Object.getOwnPropertyNames(from_d).length) {
        // we have a dictionary, do a mixin
        var to_d = to[k]
        if (to_d) {
          if (Object.keys(to_d).length !== Object.getOwnPropertyNames(to_d).length) {
            to_d = to[k] = Object.create(null)
          }
        } else {
          to_d = to[k] = Object.create(null)
        }
        merger(to_d, from_d)
      } else {
        // it is not a dictionary, do a simple copy/override
        to[k] = from_d
      }
    }
    if ((to.check)) {
      to.check = eYo.Do.ensureArrayFunction(to.check)
    } else if ((to_d = to.wrap)) {
      to.check = eYo.Do.ensureArrayFunction(to_d)
    }
  }
  /**
   * Private modeller to provide the constructor with a complete `model` property.
   * @param {!Object} delegateC9r the constructor of a delegate. Must have an `eyo` namespace.
   * @param {?Object} insertModel  data and inputs entries are merged into the model.
   */
  var modeller = (delegateC9r, insertModel) => {
    var eyo = delegateC9r.eyo
    goog.asserts.assert(eyo, 'Forbidden constructor, `eyo` is missing')
    if (eyo.model_) {
      return eyo.model_
    }
    var model = Object.create(null)
    var c = delegateC9r.superClass_
    if (c && (c = c.constructor) && c.eyo) {
      merger(model, modeller(c))
    }
    if (delegateC9r.model__) {
      if (goog.isFunction(delegateC9r.model__)) {
        model = delegateC9r.model__(model)
      } else if (Object.keys(delegateC9r.model__).length) {
        merger(model, delegateC9r.model__)
      }
      delete delegateC9r.model__
    }
    if (insertModel) {
      insertModel.data && merger(model.data, insertModel.data)
      insertModel.heads && merger(model.heads, insertModel.heads)
      insertModel.slots && merger(model.slots, insertModel.slots)
      insertModel.tails && merger(model.tails, insertModel.tails)
      insertModel.statement && merger(model.statement, insertModel.statement)
    }
    // store that object permanently
    delegateC9r.eyo.model_ = model
    // now change the getModel to return this stored value
    delegateC9r.eyo.getModel = function () {
      return delegateC9r.eyo.model_
    }
    return model
  }
  /**
   * Method to create the constructor of a subclass.
   * One constructor, one key.
   * Registers the subclass too.
   * For any constructor C built with this method, we have
   * C === me.get(C.eyo.key)
   * and in general
   * key in me.get(key).eyo.types
   * but this is not a requirement!
   * In particular, some blocks share a basic do nothing delegate
   * because they are not meant to really exist yet.
   @return the constructor created
   */
  me.makeSubclass = (() => {
    var defineDataProperty = function (k) {
      var key = k + '_p'
      // make a closure to catch the value of k
      return function () {
        if (!(key in this)) {
          // print("Data property", key, 'for', this.constructor.eyo.key)
          Object.defineProperty(
            this,
            key,
            {
              get () {
                return this.data[k].get()
              },
              set (newValue) {
                this.data[k].change(newValue)
              }
            }
          )
        }
      }
    }
    var defineSlotProperty = k => {
      var key_s = k + '_s'
      var key_b = k + '_b'
      var key_t = k + '_t'
      // make a closure to catch the value of k
      return function () {
        if (!(key_s in this)) {
          // print("Slot property", key, 'for', this.constructor.eyo.key)
          Object.defineProperty(
            this,
            key_s,
            {
              get () {
                return this.slots[k]
              }
            }
          )
        }
        if (!(key_t in this)) {
          // print("Slot property", key, 'for', this.constructor.eyo.key)
          Object.defineProperty(
            this,
            key_t,
            {
              get () {
                var s = this.slots[k] // early call
                if (s) {
                  var m4t = s.magnet
                  if (m4t) {
                    if (m4t.promised_) {
                      m4t.completePromise()
                    }
                    return s.t_eyo
                  }
                }
              }
            }
          )
        }
        if (!(key_b in this)) {
          // print("Slot property", key, 'for', this.constructor.eyo.key)
          Object.defineProperty(
            this,
            key_b,
            {
              get () {
                throw "NO SUCH KEY, BREAK HERE"
              }
            }
          )
        }
      }
    }
    return function (key, model, parent, owner = undefined, register = false) {
      goog.asserts.assert(parent.eyo, 'Only subclass constructors with an `eyo` namespace.')
      if (key.indexOf('eyo:') >= 0) {
        key = key.substring(4)
      }
      if (owner === true) {
        register = true
        owner = undefined
      }
      owner = owner ||
      (eYo.T3.Expr[key] && eYo.Delegate.Svg && eYo.Delegate.Svg.Expr) ||
      (eYo.T3.Stmt[key] && eYo.Delegate.Svg && eYo.Delegate.Svg.Stmt) ||
      parent
      var delegateC9r = owner[key] = function (workspace, type, opt_id) {
        delegateC9r.superClass_.constructor.call(this, workspace, type, opt_id)
      }
      goog.inherits(delegateC9r, parent)
      me.prepareDelegate(delegateC9r, key)
      eYo.Delegate.Manager.registerDelegate_(eYo.T3.Expr[key] || eYo.T3.Stmt[key] || key, delegateC9r)
      if (goog.isFunction(model)) {
        model = model()
      }
      if (model) {
        // manage the link: key
        var link
        var linkModel = model
        if ((link = model.link)) {
          do {
            var linkC9r = goog.isFunction(link) ? link : me.get(link)
            goog.asserts.assert(linkC9r, 'Not inserted: ' + link)
            var linkModel = linkC9r.eyo.model
            if (linkModel) {
              model = linkModel
            } else {
              break
            }
          } while ((link = model.link))
          model = {}
          linkModel && merger(model, linkModel)
        }
        // manage the inherits key, uncomplete management,
        var inherits = model.inherits
        if (inherits) {
          var inheritsC9r = goog.isFunction(inherits) ? inherits : me.get(inherits)
          var inheritsModel = inheritsC9r.eyo.model
          if (inheritsModel) {
            var m = {}
            merger(m, inheritsModel)
            merger(m, model)
            model = m
          }
        }
        var t = eYo.T3.Expr[key]
        if (t) {
          if (!model.output) {
            model.output = Object.create(null)
          }
          model.output.check = eYo.Do.ensureArrayFunction(model.output.check || t)
          model.statement && (model.statement = undefined)
        } else if ((t = eYo.T3.Stmt[key])) {
          var statement = model.statement || (model.statement = Object.create(null))
          var f = (k, type) => {
            var s = statement[k]
            if (goog.isNull(s)) {
              s = statement[k] = Object.create(null)
            } else if (s) {
              if (s.check || goog.isNull(s.check)) {
                s.check = eYo.Do.ensureArrayFunction(s.check)
              } else {
                var ch = eYo.T3.Stmt[type][key]
                if (ch) {
                  s.check = eYo.Do.ensureArrayFunction()
                }
              }
            }
          }
          f('previous', 'Previous')
          f('next', 'Next')
          f('left', 'Left')
          f('right', 'Right')
          // this is a statement, remove the irrelevant output info
          model.output && (model.output = undefined)
        }
        delegateC9r.model__ = model // intermediate storage used by `modeller` in due time
        // Create properties to access data
        if (model.data) {
          for (var k in model.data) {
            if (eYo.Do.hasOwnProperty(model.data, k)) {
              var MD = model.data[k]
              if (MD) {
                // null models are used to neutralize the inherited data
                if (!MD.setup_) {
                  MD.setup_ = true
                  if (goog.isFunction(MD.willChange)
                    && !goog.isFunction(MD.willUnchange)) {
                      MD.willUnchange = MD.willChange
                  }
                  if (goog.isFunction(MD.didChange)
                    && !goog.isFunction(MD.didUnchange)) {
                      MD.didUnchange = MD.didChange
                  }
                  if (goog.isFunction(MD.isChanging)
                    && !goog.isFunction(MD.isUnchanging)) {
                      MD.isUnchanging = MD.isChanging
                  }
                }
                defineDataProperty(k).call(delegateC9r.prototype)
              }
            }
          }
        }
        // Create properties to access slots
        if (model.slots) {
          for (var k in model.slots) {
            if (eYo.Do.hasOwnProperty(model.slots, k)) {
              var MS = model.slots[k]
              if (MS) {
                defineSlotProperty(k).call(delegateC9r.prototype)
              }
            }
          }
        }
      }
      delegateC9r.makeSubclass = function (key, model, owner, register) {
        return me.makeSubclass(key, model, delegateC9r, owner, register)
      }
      if (register) {
        me.register(key)
      }
      return delegateC9r
    }
}) ()
  /**
   * Delegate instance creator.
   * @param {!Blockly.Block} block
   * @param {?string} prototypeName Name of the language object containing
   */
  me.create = function (workspace, prototypeName, opt_id, block) {
    goog.asserts.assert(!goog.isString(block), 'API DID CHANGE, update!')
    var DelegateC9r = C9rs[prototypeName]
    goog.asserts.assert(DelegateC9r, 'No delegate for ' + prototypeName)
    var d = DelegateC9r && new DelegateC9r(workspace, prototypeName, opt_id, block)
    return d
  }
  /**
   * Get the Delegate constructor for the given prototype name.
   * @param {?string} prototypeName Name of the language object containing
   */
  me.get = function (prototypeName) {
    goog.asserts.assert(!prototypeName || !C9rs[prototypeName] || C9rs[prototypeName].eyo, 'FAILURE' + prototypeName)
    return C9rs[prototypeName]
  }
  /**
   * Get the Delegate constructor for the given prototype name.
   * @param {?string} prototypeName Name of the language object containing
   */
  me.getTypes = function () {
    return Object.keys(C9rs)
  }
  /**
   * Get the input model for that prototypeName.
   * @param {?string} prototypeName Name of the language object containing
   * @return void object if no delegate is registered for that name
   */
  me.getModel = function (prototypeName) {
    var delegateC9r = C9rs[prototypeName]
    return (delegateC9r && delegateC9r.eyo.model) || Object.create(null)
  }
  /**
   * Delegate registrator.
   * The constructor has an eyo attached object for
   * some kind of introspection.
   * Computes and caches the model
   * only once from the creation of the delegate.
   *
   * The last delegate registered for a given prototype name wins.
   * @param {?string} prototypeName Name of the language object containing
   * @param {Object} constructor
   * @private
   */
  me.registerDelegate_ = function (prototypeName, delegateC9r, key) {
    // console.log(prototypeName+' -> '+delegateC9r)
    goog.asserts.assert(prototypeName, 'Missing prototypeName')
    C9rs[prototypeName] = delegateC9r
    // cache all the input, output and statement data at the prototype level
    me.prepareDelegate(delegateC9r, key)
    delegateC9r.eyo.types.push(prototypeName)
    Blockly.Blocks[prototypeName] = {}
  }
  /**
   * Handy method to register an expression or statement block.
   */
  me.register = function (key) {
    var prototypeName = eYo.T3.Expr[key]
    var delegateC9r, available
    if (prototypeName) {
      delegateC9r = eYo.Delegate[key]
      available = eYo.T3.Expr.Available
    } else if ((prototypeName = eYo.T3.Stmt[key])) {
      delegateC9r = eYo.Delegate[key]
      available = eYo.T3.Stmt.Available
    } else {
      throw new Error('Unknown block eYo.T3.Expr or eYo.T3.Stmt key: ' + key)
    }
    me.registerDelegate_(prototypeName, delegateC9r, key)
    available.push(prototypeName)
  }
  me.registerAll = function (keyedPrototypeNames, delegateC9r, fake) {
    for (var k in keyedPrototypeNames) {
      var prototypeName = keyedPrototypeNames[k]
      if (goog.isString(prototypeName)) {
        //        console.log('Registering', k)
        me.registerDelegate_(prototypeName, delegateC9r, k)
        if (fake) {
          prototypeName = prototypeName.replace('eyo:', 'eyo:fake_')
          //          console.log('Registering', k)
          me.registerDelegate_(prototypeName, delegateC9r, k)
        }
      }
    }
  }
  me.display = function () {
    var keys = Object.keys(C9rs)
    for (var k = 0; k < keys.length; k++) {
      var prototypeName = keys[k]
      console.log('' + k + '->' + prototypeName + '->' + C9rs[prototypeName])
    }
  }
  return me
})()

// register this delegate for all the T3 types
eYo.Delegate.Manager.registerAll(eYo.T3.Expr, eYo.Delegate)
eYo.Delegate.Manager.registerAll(eYo.T3.Stmt, eYo.Delegate)

/**
 * getType.
 * The default implementation just returns the block type.
 * This should be used instead of direct block querying.
 * @return {String} The type of the receiver's block.
 */
eYo.Delegate.prototype.getType = function () {
  return this.baseType_
}

/**
 * getSubtype.
 * The default implementation just returns the variant,
 * when it exists.
 * Subclassers will use it to return the correct type
 * depending on their actual inner state.
 * This should be used instead of direct block querying.
 * @return {String} The subtype of the receiver's block.
 */
eYo.Delegate.prototype.getSubtype = function () {
  return this.variant_p
}

/**
 * getBaseType.
 * The default implementation just returns the receiver's
 * `baseType_` property or its block type.
 * Subclassers will use it to return the correct type
 * depending on their actual inner state.
 * The raw type of the block is the type without any modifier.
 * The raw type is the same as the block type except for blocks
 * with modifiers.
 * This should be used instead of direct block querying.
 * @return {?String} The type of the receiver's block.
 */
eYo.Delegate.prototype.getBaseType = function () {
  return this.baseType_ // no this.type because of recursion
}

/**
 * execute the given function for the head slot of the receiver and its next sibling.
 * If the return value of the given function is true,
 * then it was the last iteration and the loop nreaks.
 * For edython.
 * @param {!function} helper
 * @return {Object} The first slot for which helper returns true
 */
eYo.Delegate.prototype.someSlot = function (helper) {
  var slot = this.slotAtHead
  return slot && slot.some(helper)
}

/**
 * execute the given function for the fields.
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was a field to act upon or a valid helper
 */
eYo.Delegate.prototype.forEachField = function (helper) {
  var ans = false
  Object.values(this.fields).forEach(f => {
    ans = true
    helper(f)
  })
}

/**
 * Execute the helper for each child.
 * Works on a shallow copy of `childBlocks_`.
 */
eYo.Delegate.prototype.forEachChild = function (helper) {
  this.childBlocks_.slice().forEach((b,i, ra) => helper(b.eyo, i, ra))
}

/**
 * execute the given function for the head slot of the receiver and its next sibling.
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was an slot to act upon or a valid helper
 */
eYo.Delegate.prototype.forEachSlot = function (helper) {
  var slot = this.slotAtHead
  slot && slot.forEach(helper)
}

/**
 * execute the given function for the head slot of the receiver and its next sibling. Stops as soon as the helper returns a truthy value.
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was an slot to act upon or a valid helper
 */
eYo.Delegate.prototype.someSlot = function (helper) {
  var slot = this.slotAtHead
  return slot && slot.some(helper)
}

/**
 * execute the given function for the head data of the receiver and its next sibling.
 * Ends the loop as soon as the helper returns true.
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was a data to act upon or a valid helper
 */
eYo.Delegate.prototype.forEachData = function (helper) {
  var data = this.headData
  if (data && goog.isFunction(helper)) {
    var last
    do {
      last = helper(data)
    } while (!last && (data = data.next))
    return !!last
  }
}

/**
 * Bind data and fields.
 * We assume that if data and fields share the same name,
 * they must be bound, otherwise we would have chosen different names...
 * if the data model contains an initializer, use it,
 * otherwise send an init message to all the data controllers.
 */
eYo.Delegate.prototype.makeBounds = function () {
  var theField = undefined
  for (var k in this.data) {
    var data = this.data[k]
    var slot = this.slots[k]
    if (slot) {
      data.slot = slot
      slot.data = data
      // try the `bind` or unique editable field
      data.field = slot.fields.bind
      if (!data.field) {
        var candidate
        for (var kk in slot.fields) {
          var f = slot.fields[kk]
          if (f.eyo.isEditable) {
            goog.asserts.assert(!candidate, 'Ambiguous slot <-> data bound (too many editable fields)')
            candidate = f
          }
        }
      }
    } else if ((data.field = this.fields[k])) {
      data.slot = null
    } else {
      for (kk in this.slots) {
        slot = this.slots[kk]
        if ((data.field = slot.fields[k])) {
          goog.asserts.assert(!slot.data, `Ambiguous slot <-> data bound ${data.key}, ${slot.data && slot.data.key}`)
          data.slot = slot
          slot.data = data
          break
        }
      }
    }
    var field = data.field
    if (field && k === 'name') {
      theField = field
    }
    var eyo = field && field.eyo
    if (eyo) {
      // this is for editable fields
      eyo.data = data
    }
  }
  if (this.name_d && this.name_d.field !== theField) {
    console.error('ERROR')
  }
}

/**
 * Set the data values from the type.
 * One block implementation may correspond to different types,
 * For example, there is one implementation for all the primaries.
 * @param {!String} type
 */
eYo.Delegate.prototype.setDataWithType = function (type) {
  this.forEachData(data => data.setWithType(type))
}

/**
 * Set the data values from the model.
 * @param {!Object} model
 * @return {boolean} whether the model was really used.
 */
eYo.Delegate.prototype.setDataWithModel = function (model, noCheck) {
  var done = false
  this.forEachData(data => data.setRequiredFromModel(false))
  this.changeWrap(() => {
    var data_in = model.data
    if (goog.isString(data_in) || goog.isNumber(data_in)) {
      var d = this.main_d
      if (d && !d.incog && d.validate(data_in)) {
        d.change(data_in)
        d.setRequiredFromModel(true)
        done = true
      } else {
        this.forEachData(d => {
          if (d.model.xml !== false && !d.incog && d.validate(data_in)) {
            // if (done) {
            //   console.error('Ambiguous model', this.type, data_in)
            //   this.forEachData(d => {
            //     if (d.model.xml !== false && !d.incog && d.validate(data_in)) {
            //       console.log('candidate:', d.key)
            //     }
            //   })
            // }
            goog.asserts.assert(!done, `Ambiguous data model ${d.key} / ${data_in}: ${done}`)
            d.change(data_in)
            d.setRequiredFromModel(true)
            done = d.key
          }
        })
      }
    } else if (goog.isDef(data_in)) {
      this.forEachData(data => {
        var k = data.key
        if (eYo.Do.hasOwnProperty(data_in, k)) {
          data.set(data_in[k])
          data.setRequiredFromModel(true)
          done = true
        } else {
          k = k + '_placeholder'
          if (eYo.Do.hasOwnProperty(data_in, k)) {
            data.setRequiredFromModel(true)
            // change the place holder in the objects's model
            var m = {}
            goog.mixin(m, data.model)
            m.placeholder = data_in[k]
            data.model = m
            done = true
          }
        }
      })
      if (!noCheck) {
        for (var k in data_in) {
          if (eYo.Do.hasOwnProperty(data_in, k)) {
            var D = this.data[k]
            if (!D) {
              console.warn('Unused data:', this.block_.type, k, data_in[k])
            }
          }
        }
      }
    }
    this.forEachData(data => {
      var k = data.key + '_p'
      if (eYo.Do.hasOwnProperty(model, k)) {
        data.set(model[k])
        done = true
        data.setRequiredFromModel(true)
      }
      k = data.key + '_placeholder'
      if (eYo.Do.hasOwnProperty(model, k)) {
        data.customizePlaceholder(model[k])
      }
    })
  })
  return done
}

/**
 * Synchronize the data to the UI.
 * The change level and change count should not change here.
 * Sends a `synchronize` message to all data controllers.
 * This is a one shot method only called by the `consolidate` method.
 * The fact is that all data must be synchronized at least once
 * at least when the model has been made. While running,
 * the synchronization will occur each time the data changes.
 * As a data change can not be reentrant, the synchronization can be
 * performed just after the change, whether doing, undoing or redoing.
 * This is why the one shot.
 */
eYo.Delegate.prototype.synchronizeData = function () {
  this.forEachData(data => data.synchronize())
  this.synchronizeData = eYo.Do.nothing
}

/**
 * Subclass maker.
 * Start point in the hierarchy.
 * Each subclass created will have its own makeSubclass method.
 */
eYo.Delegate.makeSubclass = function (key, model, owner) {
  // First ensure that eYo.Delegate is well formed
  eYo.Delegate.Manager.prepareDelegate(eYo.Delegate)
  return eYo.Delegate.Manager.makeSubclass(key, model, eYo.Delegate, owner)
}

/**
 * Make the data according to the model.
 * Called only once during creation process.
 * No data change, no rendering.
 * For edython.
 */
eYo.Delegate.prototype.newData = function () {
  var data = Object.create(null) // just a hash
  var dataModel = this.model.data
  var byOrder = []
  for (var k in dataModel) {
    if (eYo.Do.hasOwnProperty(dataModel, k)) {
      var model = dataModel[k]
      if (model) {
        // null models are used to neutralize the inherited data
        var d = new eYo.Data(this, k, model)
        data[k] = d
        for (var i = 0, dd; (dd = byOrder[i]); ++i) {
          if (dd.model.order > d.model.order) {
            break
          }
        }
        byOrder.splice(i, 0, d)
      }
    }
  }
  if ((d = this.headData = byOrder[0])) {
    for (i = 1; (dd = byOrder[i]); ++i) {
      d.next = dd
      dd.previous = d
      d = dd
    }
  }
  this.data = data
  // now we can use `forEachData`
  this.forEachData(d => {
    Object.defineProperty(d.owner, d.key + '_d', { value: d })
    if (d.model.main === true) {
      goog.asserts.assert(!data.main, 'Only one main data please')
      Object.defineProperty(d.owner, 'main_d', { value: d })
    }
  })
}

/**
 * Make the Fields.
 * No rendering.
 * For edython.
 */
eYo.Delegate.prototype.makeFields = function () {
  eYo.FieldHelper.makeFields(this, this.model.fields)
}

/**
 * Make the slots
 * For edython.
 */
eYo.Delegate.prototype.makeSlots = function () {
  this.slots = Object.create(null) // hard to create all the slots at once.
  this.slotAtHead = this.feedSlots(this.model.slots)
}

/**
 * Create the block connections.
 * Called from receiver's `makeState` method.
 * For subclassers eventually
 */
eYo.Delegate.prototype.makeConnections = function () {
  this.magnets = new eYo.Magnets(this)
  this.updateBlackHeight()
}

/**
 * Feed the owner with slots built from the model.
 * For edython.
 * @param {!Object} input
 */
eYo.Delegate.prototype.feedSlots = function (slotsModel) {
  var slots = this.slots
  var ordered = []
  for (var k in slotsModel) {
    var model = slotsModel[k]
    if (!model) {
      continue
    }
    var order = model.order
    var insert = model.insert
    var slot, next
    if (insert) {
      var model = eYo.Delegate.Manager.getModel(insert)
      if (model) {
        if ((slot = this.feedSlots(model.slots))) {
          next = slot
          do {
            goog.asserts.assert(!goog.isDef(slots[next.key]),
              'Duplicate inserted slot key %s/%s/%s', next.key, insert, block.type)
            slots[next.key] = next
          } while ((next = next.next))
        } else {
          continue
        }
      } else {
        continue
      }
    } else if (goog.isObject(model) && (slot = new eYo.Slot(this, k, model))) {
      goog.asserts.assert(!goog.isDef(slots[k]),
        `Duplicate slot key ${k}/${this.block_.type}`)
      slots[k] = slot
      slot.slots = slots
    } else {
      continue
    }
    slot.order = order
    for (var i = 0; i < ordered.length; i++) {
      // we must not find an aleady existing entry.
      goog.asserts.assert(i !== slot.order,
        `Same order slot ${i}/${this.block_.type}`)
      if (ordered[i].model.order > slot.model.order) {
        break
      }
    }
    ordered.splice(i, 0, slot)
  }
  if ((slot = ordered[0])) {
    i = 1
    while ((next = ordered[i++])) {
      slot.next = next
      next.previous = slot
      slot = next
    }
    ordered[0].last = slot
  }
  return ordered[0]
}

/**
 * The python type of the owning block.
 */
eYo.Delegate.prototype.pythonType_ = undefined

/**
 * The real type of the owning block.
 * There are fake blocks initially used for debugging purposes.
 * For a block type eyo:fake_foo, the delegate type is eyo:foo.
 */
eYo.Delegate.prototype.type_ = undefined

/**
 * Set the [python ]type of the delegate and its block.
 * The only accepted types are the ones of
 * the constructor's delegate's `type` method.
 * NEVER call this directly, except if you are a block delegate.
 * No need to override this.
 * @param {?string} optNewType,
 * @private
 */
eYo.Delegate.prototype.setupType = function (optNewType) {
  if (!optNewType && !this.type) {
    console.error('Error!')
  }
  if (this.type_ === optNewType) {
    return
  }
  if (optNewType === eYo.T3.Expr.unset) {
    console.error('C\'est une erreur!')
  }
  optNewType && (this.constructor.eyo.types.indexOf(optNewType) >= 0) && (this.pythonType_ = this.type_ = optNewType)
}

/**
 * Synchronize the slots with the UI.
 * Sends a `synchronize` message to all slots.
 * May be used at the end of an initialization process.
 */
eYo.Delegate.prototype.synchronizeSlots = function () {
  this.forEachSlot(slot => slot.synchronize())
}

/**
 * Some blocks may change when their properties change.
 * Consolidate the data.
 * Only used by `consolidate`.
 * Should not be called directly, but may be overriden.
 * For edython.
 * @param {?string} type Name of the new type.
 */
eYo.Delegate.prototype.consolidateData = function () {
  this.forEachData(data => data.consolidate())
}

/**
 * Some blocks may change when their properties change.
 * Consolidate the slots.
 * Only used by `consolidate`.
 * Should not be called directly, but may be overriden.
 * For edython.
 * @param {?Boolean} deep
 * @param {?Boolean} force
 */
eYo.Delegate.prototype.consolidateSlots = function (deep, force) {
  this.forEachSlot(slot => slot.consolidate(deep, force))
  // some child blocks may be disconnected as side effect
}

/**
 * Some blocks may change when their properties change.
 * Consolidate the slots.
 * Only used by `consolidate`.
 * Should not be called directly, but may be overriden.
 * For edython.
 * @param {?Boolean} deep
 * @param {?Boolean} force
 */
eYo.Delegate.prototype.consolidateInputs = function (deep, force) {
  if (deep) {
    // Consolidate the child blocks that are still connected
    this.forEachInput(input => {
      input.consolidate(deep, force)
    })
  }
}

/**
 * Some blocks may change when their properties change.
 * For edython.
 * This is one of the main methods.
 * The type depends on both the properties of the block and the connections.
 * There might be problems when a parent block depends on the child
 * and vice versa. This is something that we must avoid.
 * See assignment_chain.
 */
eYo.Delegate.prototype.consolidateType = function () {
  if (this.workspace) {
    this.setupType(this.getType())
    if (this.wrapped_) {
      var p = this.parent
      p && p.consolidateType()
    }
  }
}

/**
 * Set the connection check array.
 * The connections are supposed to be configured only once.
 * This method may disconnect blocks as side effect,
 * thus interacting with the undo manager.
 * After initialization, this should be called whenever
 * the block type/subtype may have changed.
 * Disconnecting block may imply a further type change, which then implies a connection consolidation.
 * This looping process will end when the type does not change,
 * which occurs at least when no connections
 * is connected.
 * Starts by completing the wrapped connections.
 * The wrapped connections are known at initialization time,
 * but that may not be always the case.
 * Sent by `doConsolidate` and various `isChanging` methods.
 */
eYo.Delegate.prototype.consolidateMagnets = function () {
  this.completeWrap_()
  var f = m4t => {
    m4t && m4t.updateCheck()
  }
  this.forEachSlot(slot => f(slot.magnet))
  if (this.magnets.output) {
    f(this.magnets.output)
  } else {
    f(this.magnets.head)
    f(this.magnets.left)
    f(this.magnets.right)
    f(this.magnets.suite)
    f(this.magnets.foot)
  }
}

/**
 * Initialize a block.
 * Called from block's init method.
 * This should be called only once.
 * The underlying model is not expected to change while running.
 * Call's the model's `init` method if any.
 * This is always called at creation time such that it must
 * be executed outside of any undo management.
 */
eYo.Delegate.prototype.init = function () {
}

/**
* Deinitialize a block. Calls the model's `deinit` method is any.
* @constructor
*/
eYo.Delegate.prototype.deinit = function () {
  this.model.deinit && this.model.deinit.call(this)
}

/**
 * Return all eyo variables referenced by this block.
 * @return {!Array.<string>} List of variable names.
 */
eYo.Delegate.prototype.getVars = function (block) {
  var vars = []
  for (var i = 0, input; (input = block.inputList[i]); i++) {
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field instanceof eYo.FieldInput) {
        vars.push(field.getText())
      }
    }
  }
  return vars
}

/**
 * Same as Block's getDescendants except that it
 * includes this block in the list only when not sealed.
 * @return {!Array.<!Blockly.Block>} Flattened array of blocks.
 */
eYo.Delegate.prototype.getWrappedDescendants = function () {
  var blocks = []
  if (!this.wrapped_) {
    blocks.push(this.block_)
  }
  this.forEachChild(d => blocks = blocks.concat(d.getWrappedDescendants()))
  return blocks
}

/**
 * Shortcut for appending a sealed value input row.
 * Add a eyo.wrapped_ attribute to the connection and register the newly created input to be filled later when the `completeWrap_` message is sent.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * This is the only way to create a wrapped block.
 * @return {!eYo.Input} The input object created.
 */
eYo.Delegate.prototype.appendWrapValueInput = function (name, prototypeName, optional, hidden) {
  goog.asserts.assert(prototypeName, 'Missing prototypeName, no block to seal')
  var block = this.block_
  var input = block.appendValueInput(name)
  var c_eyo = input.connection.eyo
  c_eyo.wrapped_ = prototypeName
  c_eyo.optional_ = optional
  c_eyo.hidden_ = hidden
  if (!this.wrappedC8nDlgt_) {
    this.wrappedC8nDlgt_ = []
  }
  if (!optional) {
    this.wrappedC8nDlgt_.push(c_eyo)
  }
  return input
}


/**
 * Shortcut for appending a sealed value input row.
 * Add a eyo.wrapped_ attribute to the connection and register the newly created input to be filled later.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * This is the only way to create a wrapped block.
 * @return {!eYo.Input} The input object created.
 */
eYo.Delegate.prototype.appendPromiseValueInput = function (name, prototypeName, optional, hidden) {
  var input = this.appendWrapValueInput(name, prototypeName, optional, hidden)
  var c_eyo = input.connection.eyo
  c_eyo.promised_ = prototypeName
  c_eyo.wrapped_ = undefined
  return input
}

/**
 * If the sealed connections are not connected,
 * create a node for it.
 * The default implementation connects all the blocks from the wrappedC8nDlgt_ list.
 * Subclassers will eventually create appropriate new nodes
 * and connect it to any sealed connection.
 * @param {!Block} block
 * @private
 */
eYo.Delegate.prototype.completeWrap_ = function () {
  if (this.wrappedC8nDlgt_) {
    var i = 0
    while (i < this.wrappedC8nDlgt_.length) {
      var d = this.wrappedC8nDlgt_[i]
      var ans = d.completeWrap()
      if (ans && ans.ans) {
        this.wrappedC8nDlgt_.splice(i)
      } else {
        ++i
      }
    }
  }
}

/**
 * The default implementation does nothing.
 * Subclassers will override this but no one will call it.
 * @private
 */
eYo.Delegate.prototype.duringBlockWrapped = function () {
  goog.asserts.assert(!this.uiHasSelect, 'Deselect block before')
  this.ui && this.ui.updateBlockWrapped()
}


/**
 * The default implementation is false.
 * Subclassers will override this but won't call it.
 */
eYo.Delegate.prototype.canUnwrap = function () {
  return false
}

/**
 * The default implementation does nothing.
 * Subclassers will override this but won't call it.
 * @private
 */
eYo.Delegate.prototype.duringBlockUnwrapped = function () {
  this.ui && this.ui.updateBlockWrapped()
}

/**
 * Will connect this block's connection to another connection.
 * @param {!eYo.Magnet} m4t
 * @param {!eYo.Magnet} childM4t
 */
eYo.Delegate.prototype.willConnect = function (m4t, childM4t) {
}

/**
 * Update the head count.
 */
eYo.Delegate.prototype.updateMainCount = function () {
  this.mainHeight = 1
}

/**
 * Update the black count.
 */
eYo.Delegate.prototype.updateBlackHeight = function () {
  this.blackHeight = 0
}

/**
 * Update the black count of the enclosing group.
 */
eYo.Delegate.prototype.updateGroupBlackHeight = function () {
  var eyo = this.group
  eyo && eyo.updateBlackHeight()
}

/**
 * Did connect this block's connection to another connection.
 * @param {!eYo.Magnet} m4t what has been connected in the block
 * @param {!eYo.Magnet} oldTargetM4t what was previously connected in the block
 * @param {!eYo.Magnet} targetOldM4t what was previously connected to the new targetConnection
 */
eYo.Delegate.prototype.didConnect = function (m4t, oldTargetM4t, targetOldM4t) {
  // how many blocks did I add ?
  if (m4t.isSuite) {
    this.updateBlackHeight()
  } else if (!m4t.isOutput && !m4t.isLeft && !m4t.isRight) {
    this.updateGroupBlackHeight()
  }
  var t_eyo = m4t.t_eyo
  if (m4t.isFoot) {
    this.nextHeight = t_eyo.mainHeight + t_eyo.blackHeight + t_eyo.suiteHeight + t_eyo.nextHeight
  } else if (m4t.isSuite) {
    t_eyo = m4t.t_eyo
    this.suiteHeight = t_eyo.mainHeight + t_eyo.blackHeight + t_eyo.suiteHeight + t_eyo.nextHeight
  }
  this.consolidateType()
  if (m4t.isOutput) {
    if (this.selected && this.locked_) {
      t_eyo.select()
    }
  }
}

/**
 * Will disconnect this block's connection.
 * @param {!eYo.Magnet} m4t
 */
eYo.Delegate.prototype.willDisconnect = function (m4t) {
}

/**
 * Did disconnect this block's connection from another connection.
 * @param {!Blockly.Connection} blockConnection
 * @param {!eYo.Magnet} oldTargetM4t that was connected to blockConnection
 */
eYo.Delegate.prototype.didDisconnect = function (m4t, oldTargetM4t) {
  // how many blocks did I add ?
  if (m4t.isSuite) {
    m4t.b_eyo.updateBlackHeight()
  } else if (!m4t.isOutput) {
    this.updateGroupBlackHeight()
  }
  if (m4t.isFoot) {
    this.nextHeight = 0
    this.incrementChangeCount()
  } else if (m4t.isSuite) {
    this.suiteHeight = 0
    this.incrementChangeCount()
  } else if (oldTargetC8n === oldTargetM4t.b_eyo.magnets.output.connection) {
    this.incrementChangeCount()
  }
}

/**
 * In a connection, the inferior block's delegate may have a plugged_.
 * This is used for example to distinguish generic blocks such as identifiers.
 * An identifier is in general a variable name but sometimes it cannot be.
 * module names are such an example.
 * @private
 */
eYo.Delegate.prototype.plugged_ = undefined

/**
 * Can remove and bypass the parent?
 * If the parent's output connection is connected,
 * can connect the block's output connection to it?
 * The connection cannot always establish.
 * @param {!eYo.Delegate} other  the dlgt to be replaced
 */
eYo.Delegate.prototype.canReplaceDlgt = function (other) {
  return false
}

/**
 * Returns the total number of code lines for that node and the node below.
 * One atomic instruction is one line.
 * In terms of grammar, it counts the number of simple statements.
 * @return {Number}.
 */
eYo.Delegate.prototype.getStatementCount = function () {
  var n = 1
  var hasActive = false
  var hasNext = false
  var m4t = this.magnets.suite
  if (m4t) {
    hasNext = true
    var t_eyo = m4t.t_eyo
    if (t_eyo) {
      do {
        hasActive = hasActive || (!t_eyo.disabled_ && !t_eyo.isWhite)
        n += t_eyo.getStatementCount()
      } while ((t_eyo = t_eyo.next))
    }
  }
  return n + (hasNext && !hasActive ? 1 : 0)
}

Object.defineProperty(eYo.Delegate.prototype, 'disabled', {
  get () {
    return this.disabled_
  },
  /**
   * Set the disable state of the block.
   * Calls the block's method but also make sure that previous blocks
   * and next blocks are in an acceptable state.
   * For example, if I disable an if block, I should also disable
   * an elif/else following block, but only if it would make an elif/else orphan.
   * For edython.
   * @param {Boolean} yorn  true to disable, false to enable.
   * @return None
   */
  set (yorn) {
    if (!!this.disabled_ === !!yorn) {
      // nothing to do the block is already in the good state
      return
    }
    eYo.Events.groupWrap(() => {
      eYo.Events.fireDlgtChange(
        this, 'disabled', null, this.disabled_, yorn)
      var previous, next
      if (yorn) {
        // Does it break next connections
        if ((previous = this.magnets.head) &&
        (next = previous.target) &&
        next.blackMagnet) {
          var eyo = this
          while ((previous = eyo.magnets.foot) &&
          (previous = previous.target) &&
          (previous = previous.blackMagnet)) {
            if (next.checkType_(previous)) {
              break
            }
            eyo = previous.b_eyo
            // No recursion
            eyo.setDisabled(true)
          }
        }
      } else {
        // if the connection chain below this block is broken,
        // try to activate some blocks
        if ((next = this.magnets.foot)) {
          if ((previous = next.target) &&
          (previous = previous.blackMagnet) &&
          !next.checkType_(previous)) {
            // find  white block in the below chain that can be activated
            // stop before the black connection found just above
            previous = next.target
            do {
              var t_eyo = previous.b_eyo
              if (t_eyo.disabled) {
                t_eyo.disabled = false
                var check = next.checkType_(previous)
                t_eyo.disabled = true
                if (check) {
                  t_eyo.disabled = false
                  if (!(next = t_eyo.magnets.foot)) {
                    break
                  }
                }
              } else if (!t_eyo.isWhite) {
                // the black connection is reached, no need to go further
                // but the next may have change and the checkType_ must
                // be computed once again
                if (!next.checkType_(previous)) {
                  t_eyo.unplug()
                  t_eyo.bumpNeighbours_()
                }
                break
              }
            } while ((previous = previous.getMagnetBelow()))
          }
        }
        // now consolidate the chain above
        if ((previous = this.magnets.head)) {
          if ((next = previous.target) &&
          (next = next.blackMagnet) &&
          !previous.checkType_(next)) {
            // find  white block in the above chain that can be activated
            // stop before the black connection found just above
            next = previous.target
            do {
              t_eyo = next.b_eyo
              if (t_eyo.disabled) {
                // beware of some side effet below
                // bad design, things have changed since then...
                t_eyo.disabled = false
                check = previous.checkType_(next)
                t_eyo.disabled = true
                if (check) {
                  t_eyo.setDisabled(false)
                  if (!(previous = t_eyo.magnets.head)) {
                    break
                  }
                }
              } else if (!t_eyo.isWhite) {
                // the black connection is reached, no need to go further
                // but the next may have change and the checkType_ must
                // be computed once again
                if (!next.checkType_(previous)) {
                  t_eyo = previous.b_eyo
                  t_eyo.unplug()
                  t_eyo.bumpNeighbours_()
                }
                break
              }
            } while ((next = next.eyo.getMagnetAbove()))
          }
        }
      }
    }, () => {
      this.incrementChangeCount()
      this.ui && this.ui.updateDisabled()
      this.render()
    })
  }
})

Object.defineProperty(eYo.Delegate.prototype, 'incog', {
  /**
   * Get the disable state.
   * For edython.
   */
  get () {
    return this.incog_
  },
  /**
   * Change the incog status.
   * An incog block won't render.
   * The connections must be explicitely hidden when the block is incog.
   * @param {!Boolean} incog
   */
  set (newValue) {
    if (!this.incog_ === !newValue) {
      return
    }
    if (newValue) {
      if (this.incog_) {
        // The dlgt is already incognito,
        // normally no change to the block tree
      }
    } else if (this.disabled) {
      // enable the block before enabling its connections
      return
    }
    this.incog_ = newValue
    this.forEachSlot(slot => slot.incog = newValue) // with incog validator
    var m4t = this.magnets.suite
    m4t && (m4t.incog = newValue)
    this.inputList.forEach(input => {
      if (!input.slot) {
        var m4t = input.magnet
        m4t && (m4t.incog = newValue) // without incog validator
      }
    })
    this.consolidate() // no deep consolidation because connected blocs were consolidated during slot's or connection's incog setter
    return true  
  }
})

/**
 * Input enumerator
 * For edython.
 * @param {!Boolean} all  Retrieve all the inputs, or just the ones with a slot.
 * @return !String
 */
eYo.Delegate.prototype.inputEnumerator = function (all) {
  return eYo.Do.Enumerator(this.block_.inputList, all || (x =>
    !x.eyo.magnet || !x.eyo.magnet.slot || !x.eyo.magnet.slot.incog)
  )
}

/**
 * Runs the helper function for each input
 * For edython.
 * @param {!Function} helper
 */
eYo.Delegate.prototype.forEachInput = function (helper) {
  this.block_.inputList.forEach(helper)
}

/**
 * Runs the helper function for some input, until it responds a truthy value.
 * For edython.
 * @param {!Function} helper
 * @return {Object} returns the first input for which the helper returns a truthy value
 */
eYo.Delegate.prototype.someInput = function (helper) {
  var ans
  var list = this.block_.inputList
  for (var i = 0 ; i < list.length ; i++) {
    var input = list[i]
    if ((ans = helper(input))) {
      return ans === true ? input : ans
    }
  }
}

/**
 * Runs the helper function for each input connection
 * For edython.
 * @param {!Function} helper
 */
eYo.Delegate.prototype.forEachInputConnection = function (helper) {
  this.block_.inputList.forEach(input => {
    var c8n = input.connection
    if (c8n) {
      helper(c8n)
    }
  })
}

/**
 * Runs the helper function for some input connection, until it responds true
 * For edython.
 * @param {!Function} helper
 * @return {Object} returns the first connection for which helper returns true or the helper return value
 */
eYo.Delegate.prototype.someInputMagnet = function (helper) {
  return this.someInput(input => {
    var m4t = input.magnet
    return m4t && helper(m4t)
  })
}

/**
 * Set the error
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {!string} key
 * @param {!string} msg
 * @return true if the given value is accepted, false otherwise
 */
eYo.Delegate.prototype.setError = function (key, msg) {
  this.errors[key] = {
    message: msg
  }
}

/**
 * get the error
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {!string} key
 * @return true if the given value is accepted, false otherwise
 */
eYo.Delegate.prototype.getError = function (key) {
  return this.errors[key]
}

/**
 * get the error
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {!string} key
 * @return true if the given value is accepted, false otherwise
 */
eYo.Delegate.prototype.removeError = function (key) {
  delete this.errors[key]
}

/**
 * get the slot connections, mainly for debugging purposes.
 * For edython.
 * @return An array of all the connections
 */
eYo.Delegate.prototype.getSlotConnections = function () {
  var ra = []
  this.forEachSlot(slot => {
    var c8n = slot.connection
    c8n && ra.push(c8n)
  })
  return ra
}

/**
 * get the slot connections, mainly for debugging purposes.
 * For edython.
 * @param {!Bockly.Block} block_
 * @return the given block
 */
eYo.Delegate.prototype.footConnect = function (dlgt) {
  this.magnets.foot.connect(dlgt.magnets.head)
  return dlgt
}

/**
 * Connect the magnet of the `lastInput`, to the given expression block/magnet/type.
 * @param {!eYo.Delegate|eYo.Magnet|String} bdct  block, delegate, connection or type
 * @return {?eYo.Delegate}  The connected Dlgt, if any.
 */
eYo.Delegate.prototype.connectLast = function (dmt) {
  var other = (dmt.magnets && dmt.magnets.output) || (dmt.connection && dmt) || eYo.Delegate.newComplete(this, dmt).magnets.output
  if (other.connection) {
    var m4t = this.lastInput.eyo.magnet
    if (m4t.checkType_(other)) {
      m4t.connect(other)
      return m4t.target === other ? m4t.t_eyo : undefined
    }
  }
}

/**
 * Scrolls the receiver to the top left part of the workspace.
 * Does nothing if the dlgt is already in the visible are,
 * and is not forced.
 * @param {!Boolean} force  flag
 */
eYo.Delegate.prototype.scrollToVisible = function (force) {
  if (!this.inVisibleArea || force) {
    this.workspace.eyo.scrollBlockTopLeft(this.id)
  }
}
/**
 * Returns connections originating from this block.
 * @param {boolean} all If true, return all connections even hidden ones.
 *     Otherwise, for a non-rendered block return an empty list, and for a
 *     collapsed block don't return inputs connections.
 * @return {!Array.<!Blockly.Connection>} Array of connections.
 * @package
 */
eYo.Delegate.prototype.getConnections_ = function(all) {
  var myConnections = [];
  if (all || this.rendered) {
    Object.values(this.magnets).forEach(m4t => myConnections.push(m4t.connection))
    if (all || !this.collapsed_) {
      this.inputList.forEach(input => myConnections.push(input.magnet.connection))
    }
  }
  return myConnections
}


/**
 * Whether the receiver is movable.
 */
eYo.Delegate.prototype.isMovable = function() {
  return !this.wrapped_ && this.movable_ &&
  !(this.workspace && this.workspace.options.readOnly)
}

/**
 * Show the context menu for this block.
 * @param {!Event} e Mouse event.
 * @private
 */
eYo.Delegate.prototype.showContextMenu_ = function (e) {
  // this part is copied as is from the parent's implementation. Is it relevant ?
  if (this.workspace.options.readOnly || !this.contextMenu) {
    return
  }
  eYo.MenuManager.shared().showMenu(this, e)
}

/**
 * Set whether the receiver is collapsed or not.
 * @param {boolean} collapsed True if collapsed.
 */
eYo.Delegate.prototype.setCollapsed = function (collapsed) {
  this.collapsed = collapsed
}

Object.defineProperties(eYo.Delegate, {
  /**
   * Move a block by a relative offset in workspace coordinates.
   * @param {number} dx Horizontal offset in workspace units.
   * @param {number} dy Vertical offset in workspace units.
   */
  moveByXY: {
    get() {
      return this.ui.moveByXY
    }
  },
  /**
   * Move a block by a relative offset in text units.
   * @param {number} dc Horizontal offset in text unit.
   * @param {number} dl Vertical offset in text unit.
   */
  moveBy: {
    get () {
      return (dc, dl) => {
        this.ui.moveByXY(dc * eYo.Unit.x, dl * eYo.Unit.y)
      }
    }
  }
})


/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 */
// deleted blocks are rendered during deletion
// this should be avoided
eYo.Delegate.prototype.render = eYo.Do.nothing

/**
 * Render the block. Real function.
 */
eYo.Delegate.prototype.render_ = function () {
  this.ui.render()
}

Object.defineProperties(eYo.Delegate.prototype, {
  collapsed_: {
    writable: true
  },
  collapsed: {
    get () {
      return this.collapsed_
    },
    set (newValue) {
      if (this.collapsed_ === newValue) {
        return
      }
      // Show/hide the next statement inputs.
      this.forEachInput(input => input.setVisible(!collapsed))
      eYo.Events.fireDlgtChange(
          this, 'collapsed', null, this.collapsed_, newValue)
      this.collapsed_ = newValue;
      this.render()
    }
  },
  ui: {
    get () {
      return this.ui_
    }
  },
  uiHasSelect: {
    get () {
      return this.ui && this.ui.hasSelect
    }
  }
})

eYo.Delegate.prototype.packedQuotes = true
eYo.Delegate.prototype.packedBrackets = true

/**
 * Method to register an expression or a statement block.
 * The delegate is searched as a Delegate element
 * @param{!string} key  key is the last component of the block type as a dotted name.
 */
eYo.Delegate.Manager.register = function (key) {
  var prototypeName = eYo.T3.Expr[key]
  var delegateC9r, available
  if (prototypeName) {
    delegateC9r = eYo.Delegate.Expr[key]
    available = eYo.T3.Expr.Available
  } else if ((prototypeName = eYo.T3.Stmt[key])) {
    // console.log('Registering statement', key)
    delegateC9r = eYo.Delegate.Stmt[key]
    available = eYo.T3.Stmt.Available
  } else {
    throw new Error('Unknown block eYo.T3.Expr or eYo.T3.Stmt key: ' + key)
  }
  eYo.Delegate.Manager.registerDelegate_(prototypeName, delegateC9r)
  available.push(prototypeName)
}


// Mimic Blockly naming convention
eYo.Delegate = eYo.Delegate


/**
 * Called when the parent will just change.
 * This code is responsible to place the various path
 * in the proper domain of the dom tree.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.Delegate.prototype.parentWillChange = function (newParent) {
}

/**
 * Returns the named field from a block.
 * Only fields that do not belong to an input are searched for.
 * @param {string} name The name of the field.
 * @return {Blockly.Field} Named field, or null if field does not exist.
 */
eYo.Delegate.prototype.getField = function (name) {
  var ans = null
  var f = F => Object.values(F).some(f => (f.name === name) && (ans = f))
  if (f(this.fields)) return ans
  var slot
  if ((slot = this.slotAtHead)) {
    do {
      if (f(slot.fields)) return ans
    } while ((slot = slot.next))
  }
  this.inputList.some(input => input.fieldRow.some(f => (f.name === name) && (ans = f)))
  return ans
}

/**
 * When the block is just a wrapper, returns the wrapped target.
 */
eYo.Delegate.prototype.getMenuTarget = function () {
  var wrapped
  if (this.wrap && (wrapped = this.wrap.input.target)) {
    return wrapped.eyo.getMenuTarget()
  }
  if (this.wrappedC8nDlgt_ && this.wrappedC8nDlgt_.length === 1 &&
    (wrapped = this.wrappedC8nDlgt_[0].connection.targetBlock())) {
    // if there are more than one wrapped block,
    // then we choose none of them
    return wrapped.eyo.getMenuTarget()
  }
  return this.block_
}

eYo.Delegate.debugPrefix = ''
eYo.Delegate.debugCount = {}

/**
 * Fetches the named input object.
 * @param {!String} name The name of the input.
 * @return {eYo.Input} The input object, or null if input does not exist. Input that are disabled are skipped.
 */
eYo.Delegate.prototype.getInput = function (name) {
  return this.someInput(input => input.name === name)
}

/**
 * Class for a statement block enumerator.
 * Deep first traversal.
 * Starts with the given block.
 * The returned object has next and depth messages.
 * @param {!Blockly.Block} block The root of the enumeration.
 * @constructor
 */
eYo.Delegate.prototype.statementEnumerator = function () {
  var eyo
  var eyos = [this]
  var e8r
  var e8rs = [this.inputEnumerator()]
  var next
  var me = {}
  me.next = () => {
    me.next = me.next_
    return this
  }
  me.depth = () => {
    return eyos.length
  }
  me.next_ = () => {
    while ((eyo = eyos.shift())) {
      e8r = e8rs.shift()
      while (e8r.next()) {
        if (e8r.here.type === Blockly.NEXT_STATEMENT) {
          if (e8r.here.connection && (next = e8r.here.connection.targetBlock())) {
            next = next.eyo
            eyos.unshift(eyo)
            e8rs.unshift(e8r)
            eyos.unshift(next)
            e8rs.unshift(next.inputEnumerator())
            return next
          }
        }
      }
      if ((eyo = eyo.foot)) {
        eyos.unshift(eyo)
        e8rs.unshift(eyo.inputEnumerator())
        return eyo
      }
    }
  }
  return me
}

/**
 * Execute the helper for all the statements.
 * Deep first traversal.
 * @param {!Function} helper
 * @return the truthy value from the helper.
 */
eYo.Delegate.prototype.forEachStatement = function (helper) {
  var e8r = this.statementEnumerator()
  var eyo
  while ((eyo = e8r.next())) {
    helper(eyo, e8r.depth())
  }
}

/**
 * Execute the helper until one answer is a truthy value.
 * Deep first traversal.
 * @param {!Function} helper
 * @return the truthy value from the helper.
 */
eYo.Delegate.prototype.someStatement = function (helper) {
  var e8r = this.statementEnumerator()
  var eyo
  var ans
  while ((eyo = e8r.next())) {
    if ((ans = helper(eyo, e8r.depth()))) {
      return ans === true ? eyo : ans
    }
  }
}

/**
 * Class for a statement block enumerator.
 * Deep first traversal.
 * Starts with the given block.
 * The returned object has next and depth messages.
 * @param {!Blockly.Block} block The root of the enumeration.
 * @constructor
 */
eYo.StatementBlockEnumerator = function (block) {
  var b
  var bs = [block]
  var e8r
  var e8rs = [block.eyo.inputEnumerator()]
  var next
  var me = {}
  me.next = function () {
    me.next = me.next_
    return block
  }
  me.depth = function () {
    return bs.length
  }
  me.next_ = function () {
    while ((b = bs.shift())) {
      e8r = e8rs.shift()
      while (e8r.next()) {
        var eyo = e8r.here.eyo.magnet
        if (eyo.isFoot || eyo.isSuite) {
          if (e8r.here.connection && (next = e8r.here.connection.targetBlock())) {
            bs.unshift(b)
            e8rs.unshift(e8r)
            bs.unshift(next)
            e8rs.unshift(next.eyo.inputEnumerator())
            return next
          }
        }
      }
      if ((b = b.getNextBlock())) {
        bs.unshift(b)
        e8rs.unshift(b.eyo.inputEnumerator())
        return b
      }
    }
    return undefined
  }
  return me
}

/**
 * Create a new delegate, with svg background.
 * This is the expected way to create the block.
 * There is a caveat due to proper timing in initializing the svg.
 * Whether blocks are headless or not is not clearly designed in Blockly.
 * If the model fits an identifier, then create an identifier
 * If the model fits a number, then create a number
 * If the model fits a string literal, then create a string literal...
 * This is headless and should not render until a beReady message is sent.
 * @param {!*} owner  workspace or block
 * @param {!String|Object} model
 * @param {?String|Object} id
 * @private
 */
eYo.Delegate.newReady = function (owner, model, id) {
  var dlgt = eYo.Delegate.newComplete.apply(null, arguments)
  dlgt && dlgt.beReady()
  return dlgt
}

/**
 * Create a new Dlgt, with no ui.
 * This is the expected way to create the Dlgt.
 * If the model fits an identifier, then create an identifier
 * If the model fits a number, then create a number
 * If the model fits a string literal, then create a string literal...
 * This is headless and should not render until a beReady message is sent.
 * @param {!*} owner  workspace or dlgt
 * @param {!String|Object} model
 * @param {?String|Object} id
 * @param {?eYo.Delegate} id
 */
eYo.Delegate.newComplete = (() => {
  var processModel = (workspace, model, id, eyo) => {
    var dataModel = model
    if (!eyo) {
      if (eYo.Delegate.Manager.get(model.type)) {
        eyo = workspace.newDlgt(model.type, id)
        eyo.setDataWithType(model.type)
      } else if (eYo.Delegate.Manager.get(model)) {
        eyo = workspace.newDlgt(model, id) // can undo
        eyo.setDataWithType(model)
      } else if (goog.isString(model) || goog.isNumber(model)) {
        var p5e = eYo.T3.Profile.get(model, null)
        var f = p5e => {
          var dlgt
          if (p5e.expr && (dlgt = workspace.newDlgt(p5e.expr, id))) {
            p5e.expr && dlgt.setDataWithType(p5e.expr)
            model && dlgt.setDataWithModel(model)
            dataModel = {data: model}
          } else if (p5e.stmt && (dlgt = workspace.newDlgt(p5e.stmt, id))) {
            p5e.stmt && dlgt.setDataWithType(p5e.stmt)
            dataModel = {data: model}
          } else if (goog.isNumber(model)  && (dlgt = workspace.newDlgt(eYo.T3.Expr.numberliteral, id))) {
            dlgt.setDataWithType(eYo.T3.Expr.numberliteral)
            dataModel = {data: model.toString()}
          } else {
            console.warn('No block for model:', model)
          }
          return dlgt
        }
        if (!p5e.isVoid && !p5e.isUnset) {
          eyo = f(p5e)
        } else {
          console.warn('No block for model either:', model)
          return
        }
      }
    }
    eyo && eyo.changeWrap(
      function () { // `this` is `eyo`
        this.willLoad()
        this.setDataWithModel(dataModel)
        var Vs = model.slots
        for (var k in Vs) {
          if (eYo.Do.hasOwnProperty(Vs, k)) {
            var input = this.getInput(k)
            if (input && input.connection) {
              var t_eyo = input.t_eyo
              var V = Vs[k]
              var dlgt = processModel(workspace, V, null, t_eyo)
              if (!t_eyo && dlgt && dlgt.magnets.output) {
                dlgt.changeWrap(
                  () => {
                    var slot = input.magnet.slot
                    slot && (slot.incog = false)
                    dlgt.magnets.output.connect(input.magnet)
                  }
                )
              }
            }
          }
        }
        Vs = model
        this.forEachSlot(slot => {
          var input = slot.input
          if (!input || !input.magnet) {
            return
          }
          k = slot.key + '_s'
          if (eYo.Do.hasOwnProperty(Vs, k)) {
            var V = Vs[k]
          } else if (Vs.slots && eYo.Do.hasOwnProperty(Vs.slots, slot.key)) {
            V = Vs.slots[slot.key]
          } else {
            return
          }
          var t_eyo = input.magnet.t_eyo
          var y = processModel(workspace, V, null, t_eyo)
          if (!t_eyo && y && y.magnets.output) {
            y.changeWrap(
              () => {
                // The connection can be established only when not incog
                slot.incog = false
                y.magnets.output.connect(input.magnet)
              }
            )
          }
        })
        // now blocks and slots have been set
        this.didLoad()
        if (eyo.magnets.foot) {
          var nextModel = dataModel.next
          if (nextModel) {
            dlgt = processModel(workspace, nextModel)
            if (dlgt && dlgt.magnets.head) {
              try {
                dlgt.magnets.head.connectSmart(eyo)
              } catch (err) {
                console.error(err)
                throw err
              } finally {
                // do nothing
              }
            }
          }
        }
      }
    )
    return eyo
  }
  return function (owner, model, id) {
    var workspace = owner.workspace || owner
    var eyo = processModel(workspace, model, id)
    if (eyo) {
      eyo.consolidate()
      eyo.beReady(owner.isReady || workspace.rendered)
    }
    return eyo
  }
})()

/**
 * When setup is finish.
 * The state has been created, some expected connections are created
 * This is a one shot function.
 * @param {boolean} headless  no op when false
 */
eYo.Delegate.prototype.beReady = function (headless) {
  if (headless === false || !this.workspace) {
    return
  }
  this.changeWrap(() => {
      this.beReady = eYo.Do.nothing // one shot function
      this.eventsInit_ = true
      this.ui_ = new eYo.UI(this)
      this.forEachField(field => field.eyo.beReady())
      this.forEachSlot(slot => slot.beReady())
      this.inputList.forEach(input => {
        input.beReady()
      })
      ;[this.magnets.suite,
        this.magnets.right,
        this.magnets.foot
      ].forEach(m => m && m.beReady())
      this.forEachData(data => data.synchronize()) // data is no longer headless
      this.render = eYo.Delegate.prototype.render_
    }
  )
}

Object.defineProperties(
  eYo.Delegate.prototype,
  {
    isReady: {
      get () {
        return this.beReady === eYo.Do.nothing
      }
    }
  }
)

/**
 * Returns the python type of the block.
 * This information may be displayed as the last item in the contextual menu.
 * Wrapped blocks will return the parent's answer.
 */
eYo.Delegate.prototype.getPythonType = function () {
  if (this.wrapped_) {
    return this.parent.getPythonType()
  }
  return this.pythonType_
}

/**
 * Insert a parent.
 * If the block's output connection is connected,
 * connects the parent's output to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {Object} model, for subclassers
 * @return {?eYo.Delegate} the created block
 */
eYo.Delegate.prototype.insertParentWithModel = function (model) {
  goog.asserts.assert(false, 'Must be subclassed')
}

/**
 * Insert a block of the given type.
 * For edython.
 * @param {Object|string} model
 * @param {eYo.Magnet} m4t
 * @return {?Blockly.Block} the block that was inserted
 */
eYo.Delegate.prototype.insertBlockWithModel = function (model, m4t) {
  if (!model) {
    return null
  }
  // get the type:
  var p5e = eYo.T3.Profile.get(model, null)
  if (!p5e.isVoid && !p5e.isUnset) {
    if (m4t) {
      if (m4t.isHead || m4t.isLeft || m4t.isRight || m4t.isSuite || m4t.isFoot) {
        p5e.stmt && (model = {
          type: p5e.stmt,
          data: model
        })
      } else {
        p5e.expr && (model = {
          type: p5e.expr,
          data: model
        })
      }
    }
  }
  // create a block out of the undo mechanism
  var candidate
  eYo.Events.disableWrap(
    () => {
      var m4t, otherM4t
      candidate = eYo.Delegate.newComplete(this, model)
      var fin = prepare => {
        eYo.Events.groupWrap(() => {
          eYo.Events.enableWrap(() => {
            eYo.Do.tryFinally(() => {
              eYo.Events.fireDlgtCreate(candidate)
              prepare && prepare()
              otherM4t.connect(m4t)
            }, () => {
              eYo.Selected.eyo = candidate
              candidate.render()
              candidate.bumpNeighbours_()
            })
          })
        })
        return candidate
      }
      if (!candidate) {
        // very special management for tuple input
        if ((otherM4t = eYo.Selected.magnet) && goog.isString(model)) {
          var otherDlgt = otherM4t.b_eyo
          if (otherDlgt instanceof eYo.Delegate.List && otherM4t.eyo.isInput) {
            eYo.Events.groupWrap(() => {
              var dlgts = model.split(',').map(x => {
                var model = x.trim()
                var p5e = eYo.T3.Profile.get(model, null)
                console.warn('MODEL:', model)
                console.warn('PROFILE:', p5e)
                return {
                  model,
                  p5e
                }
              }).filter(({p5e}) => !p5e.isVoid && !p5e.isUnset).map(x => {
                var eyo = eYo.Delegate.newComplete(this, x.model)
                eyo.setDataWithModel(x.model)
                console.error('DLGT', eyo)
                return eyo
              })
              dlgts.some(eyo => {
                candidate = eyo
                if ((m4t = candidate.magnets.output) && m4t.checkType_(otherM4t)) {
                  fin()
                  var next = false
                  otherDlgt.someInputMagnet(m4t => {
                    if (next) {
                      otherM4t = m4t
                      return true
                    } else if (m4t === otherM4t) {
                      next = true
                    }
                  })
                }
              })
              eYo.Selected.magnet = otherM4t
            })
          }
        }
        return
      }
      if ((otherM4t = eYo.Selected.magnet)) {
        otherDlgt = otherM4t.b_eyo
        if (otherM4t.isInput) {
          if ((m4t = candidate.magnets.output) && m4t.checkType_(otherM4t)) {
            return fin()
          }
        } else if (otherM4t.isHead) {
          if ((m4t = candidate.magnets.foot) && m4t.checkType_(otherM4t)) {
            var targetM4t = otherM4t.target
            if (targetM4t && candidate.magnets.head &&
              targetM4t.checkType_(candidate.magnets.head)) {
              return fin(() => {
                targetM4t.connect(candidate.magnets.head)
              })
            } else {
              return fin(() => {
                var its_xy = this.ui.xyInSurface
                var my_xy = candidate.ui.xyInSurface
                candidate.moveByXY(its_xy.x - my_xy.x, its_xy.y - my_xy.y - candidate.size.height * eYo.Unit.y)
              })
            }
            // unreachable code
          }
        } else if (otherM4t.isSuite || otherM4t.isFoot) {
          if ((m4t = candidate.magnets.head) && m4t.checkType_(otherM4t)) {
            if ((targetM4t = otherM4t.target) && candidate.magnets.foot &&
            targetM4t.checkType_(candidate.magnets.foot)) {
              return fin(() => {
                targetM4t.connect(candidate.magnets.foot)
              })
            } else {
              return fin()
            }
          }
        }
      }
      var c8n_N = model.input
      if ((m4t = candidate.magnets.output)) {
        // try to find a free magnet in a block
        // When not undefined, the returned magnet can connect to m4t.
        var findM4t = eyo => {
          var otherM4t, t_eyo
          otherM4t = eyo.someInputMagnet(foundM4t => {
            if (foundM4t.isInput) {
              if ((t_eyo = foundM4t.t_eyo)) {
                if (!(foundM4t = findM4t(t_eyo))) {
                  return
                }
              } else if (!m4t.checkType_(foundM4t)) {
                return
              } else if (foundM4t.bindField) {
                return
              }
              if (!foundM4t.disabled_ && !foundM4t.s7r_ && (!c8n_N || foundM4t.name_ === c8n_N)) {
                // we have found a connection
                // which s not a separator and
                // with the expected name
                return foundM4t
              }
              // if there is no connection with the expected name,
              // then remember this connection and continue the loop
              // We remember the last separator connection
              // of the first which is not a separator
              if (!otherM4t || (!otherM4t.disabled_ && otherM4t.s7r_)) {
                otherM4t = foundC8n
              }
            }
          })
          return otherM4t
        }
        if ((otherM4t = findM4t(this))) {
          return fin()
        }
      }
      if ((m4t = candidate.magnets.head)) {
        if ((otherM4t = this.magnets.foot) && m4t.checkType_(otherM4t)) {
          return fin(() => {
            if ((targetM4t = otherM4t.target)) {
              // connected to something, beware of orphans
              otherM4t.disconnect()
              if (candidate.magnets.foot && candidate.magnets.foot.checkType_(targetM4t)) {
                candidate.magnets.foot.connect(targetM4t)
                targetM4t = null
              }
            }
            m4t.connect(otherM4t)
            if (targetM4t) {
              targetM4t.b_eyo.bumpNeighbours_()
            }
          })
        }
      }
      if ((m4t = candidate.magnets.foot)) {
        if ((otherM4t = this.magnets.head) && m4t.checkType_(otherM4t)) {
          if ((targetM4t = otherM4t.target) && (otherM4t = candidate.magnets.head) && candidate.magnets.head.checkType_(targetM4t)) {
            return fin(() => {
              otherM4t.connect(targetM4t)
            })
          } else {
            return fin(() => {
              var its_xy = this.ui.xyInSurface
              var my_xy = candidate.eyo.ui.xyInSurface
              candidate.moveByXY(its_xy.x - my_xy.x, its_xy.y - my_xy.y - candidate.size.height * eYo.Unit.y)
            })
          }
        }
      }
      candidate.dispose(true)
      candidate = null
    }
  )
  return candidate.block_
}

/**
 * Whether the given block can lock.
 * For edython.
 * @return boolean
 */
eYo.Delegate.prototype.canLock = function () {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var m4t, target
  return !this.someInput(input => {
    if ((m4t = input.magnet) && !m4t.disabled_) {
      if ((target = m4t.target)) {
        if (!target.canLock()) {
          return true
        }
      } else if (!m4t.optional_ && !m4t.s7r_) {
        return true
      }
    }
  })
}
/**
 * Whether the given block can unlock.
 * For edython.
 * @return {boolean}, true only if there is something to unlock
 */
eYo.Delegate.prototype.canUnlock = function () {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var m4t, t_eyo
  return this.someInput(input => {
    if ((m4t = input.magnet)) {
      if ((t_eyo = m4t.t_eyo)) {
        if (t_eyo.canUnlock()) {
          return true
        }
      }
    }
  })
}

/**
 * Lock the given block.
 * For edython.
 * @return {number} the number of blocks locked
 */
eYo.Delegate.prototype.lock = function () {
  var ans = 0
  if (this.locked_ || !this.canLock()) {
    return ans
  }
  eYo.Events.fireDlgtChange(
    this, eYo.Const.Event.locked, null, this.locked_, true)
  this.locked_ = true
  if (this.selected) {
    eYo.Selected.magnet = null
  }
  // list all the input for connections with a target
  var m4t
  var t_eyo
  this.forEachInput(input => {
    if ((m4t = input.magnet)) {
      if ((t_eyo = m4t.t_eyo)) {
        ans += t_eyo.lock()
      }
      if (m4t.isInput) {
        m4t.setHidden(true)
      }
    }
  })
  // maybe redundant calls here
  this.forEachSlot(slot => {
    if ((m4t = slot.magnet)) {
      if ((t_eyo = m4t.t_eyo)) {
        ans += t_eyo.lock()
      }
      if (m4t.isInput) {
        m4t.setHidden(true)
      }
    }
  })
  if ((m4t = this.magnets.right) && (t_eyo = m4t.t_eyo)) {
    ans += t_eyo.lock()
  }
  if ((m4t = this.magnets.suite) && (t_eyo = m4t.t_eyo)) {
    ans += t_eyo.lock()
  }
  if ((m4t = this.magnets.foot) && (t_eyo = m4t.t_eyo)) {
    ans += t_eyo.lock()
  }
  if (this.selected) {
    var parent = this
    while ((parent = parent.surround)) {
      if (!parent.wrapped_ && !parent.locked_) {
        parent.select()
        break
      }
    }
  }
  (this.surround || this).render()
  return ans
}
/**
 * Unlock the given block.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {boolean} deep Whether to unlock statements too.
 * @return {number} the number of blocks unlocked
 */
eYo.Delegate.prototype.unlock = function (shallow) {
  var block = this.block_
  var ans = 0
  eYo.Events.fireDlgtChange(
      this, eYo.Const.Event.locked, null, this.locked_, false)
  this.locked_ = false
  // list all the input for connections with a target
  var m4t, t_eyo
  this.forEachInput(input => {
    if ((m4t = input.magnet)) {
      if ((!shallow || m4t.isInput) && (t_eyo = m4t.t_eyo)) {
        ans += t_eyo.unlock(shallow)
      }
      m4t.setHidden(false)
    }
  })
  if (!shallow && (m4t = this.magnets.right)) {
  }
  (this.surround || this).render()
  return ans
}

/**
 * Whether the block of the receiver is in the visible area.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return {boolean}
 */
eYo.Delegate.prototype.inVisibleArea = function () {
  var area = this.ui && this.ui.distanceFromVisible
  return area && !area.x && !area.y
}

/**
 * Side effect: renders the block when connections are no longer hidden.
 * @param {boolean} hidden True to hide connections.
 */
eYo.Delegate.prototype.setConnectionsHidden = function (hidden) {
  if (this.connectionsHidden_ === hidden) {
    return
  }
  this.connectionsHidden_ = hidden
  if (hidden) {
    if (eYo.Delegate.debugStartTrackingRender) {
      console.log('HIDE', this.id, this.type)
    }
  } else {
    // eYo.Delegate.debugStartTrackingRender = true
    // console.log('SHOW CONNECTIONS', this.id, this.type)
    this.rendered || this.render()
  }
}

/**
 * Execute the handler with block rendering deferred to the end, if any.
 * handler
 * @param {!Function} handler `this` is the receiver.
 * @param {!Function} err_handler `this` is the receiver, one argument: the error catched.
 */
eYo.Delegate.prototype.doAndRender = function (handler, group, err_handler) {
  return e => {
    this.changeBegin()
    group && eYo.Events.setGroup(true)
    try {
      handler.call(this, e)
    } catch (err) {
      err_handler && err_handler.call(this, err) || console.error(err)
      throw err
    } finally {
      group && eYo.Events.setGroup(false)
      this.changeEnd()
    }
  }
}

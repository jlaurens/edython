/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.UI.Dflt')
goog.require('eYo.Decorate')
goog.require('eYo.UI.Constructor.Dlgt')

goog.require('eYo.Change')
goog.require('eYo.Data')

goog.provide('eYo.Brick')
goog.provide('eYo.Brick.Dflt')

goog.forwardDeclare('eYo.Expr')
goog.forwardDeclare('eYo.Stmt')

/**
 * The namespace is expected to contain everything about bricks.
 * Hopefully.
 * @name {eYo.Brick}
 * @namespace
 */
eYo.Brick = Object.create(null)

goog.forwardDeclare('eYo.XRE')
goog.forwardDeclare('eYo.T3')
goog.forwardDeclare('eYo.Where')
goog.forwardDeclare('eYo.Do')

goog.forwardDeclare('eYo.Events')
goog.forwardDeclare('eYo.Span')
goog.forwardDeclare('eYo.Field')
goog.forwardDeclare('eYo.Slot')
goog.forwardDeclare('eYo.Magnets')
goog.forwardDeclare('eYo.Brick.UI')
goog.forwardDeclare('eYo.Expr')
goog.forwardDeclare('eYo.Stmt')
goog.forwardDeclare('eYo.Focus')

/**
 * Delegate constructor for bricks.
 * @name {eYo.Brick.Dlgt}
 * @constructor
 * @param {!Object} c9r,  the object to which this instance is attached.
 * @param {!String} key,  the key used when the constructor was created.
 * @param {!Object} model,  the model used to create the constructor.
 */
eYo.Constructor.makeClass(eYo.Brick, 'Dlgt', eYo.UI.Constructor.Dlgt, {
  init () {
    this.types = []
  }
})

/**
 * Default class for a brick.
 * Not normally called directly, `eYo.Brick.Mgr.create(...)` is recommanded and `eYo.Board` 's `newBrick` method is highly recommanded.
 * Also initialize an implementation model.
 * The underlying state and model are not expected to change while running.
 * When done, the node has all its properties ready to use
 * but their values are not properly setup.
 * The brick may not be in a consistent state,
 * for what it was designed to.
 * For edython.
 * @param {eYo.Board} board - the owner of the brick.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this brick.
 * @constructor
 * @readonly
 * @property {object} span - Contains the various extents of the receiver.
 * @readonly
 * @property {object} surroundParent - Get the surround parent.
 * @readonly
 * @property {object} wrapper - Get the surround parent which is not wrapped_.
 */
eYo.UI.Constructor.makeClass('Dflt', eYo.Brick, eYo.UI.Dflt, eYo.Brick.Dlgt, {
  props: {
    link: {
      parent: {},
      /**
       * Lazy list of all the wrapped magnets.
       */
      wrappedMagnets: {
        get () {
          return this.wrappedMagnets_ || (this.wrappedMagnets_ = [])
        }
      },
      inputList_: { value: eYo.NA, writable: true },
      pythonType_: { value: eYo.NA, writable: true },
      movable_: { value: true, writable: true },
      deletable: { value: false, writable: true},
      isEditing: { value: false, writable: true},
      isComment: {
        value: false
      },
      /**
       * Direct descendants.
       */
      children: {
        get () {
          return this.children__.slice()
        }
      },
    },
    owned: {
      span () {
        return new eYo.Span(this)
      },
      change () {
        return new eYo.Change(this)
      },
    },
    computed: {
      data: {
        get () {
          return this.data_
        }
      },
      slots: {
        get () {
          return this.slots_
        }
      },
      /**
       * The receiver's board
       * @type {eYo.Board}
       */
      board: {
        get () {
          return this.owner
        }
      },
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
          var b3k
          if ((b3k = this.out)) {
            return b3k
          } else if ((b3k = this.leftMost)) {
            return b3k.group
          }
          return null
        }
      },
      group: {
        get () {
          var b3k = this
          var ans
          while ((ans = b3k.head)) {
            if (ans.suite === b3k) {
              return ans
            }
            b3k = ans
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
            this.duringBrickWrapped()
          } else if (!newValue && this.wrapped__) {
            this.duringBrickUnwrapped()
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
          var ans = this
          do {
            ans = ans.parent
          } while (ans && !ans.isStmt)
          return ans
        }
      },
      magnets: {
        get () {
          return this.magnets_
        }
      },
      out: {
        get () {
          var m = this.out_m
          return m && m.targetBrick
        },
        set (newValue) {
          var m = this.out_m
          m && (m.targetBrick = newValue)
        }
      },
      head: {
        get () {
          var m = this.head_m
          return m && m.targetBrick
        },
        set (newValue) {
          var m = this.head_m
          m && (m.targetBrick = newValue)
        }
      },
      left: {
        get () {
          var m = this.left_m
          return m && m.targetBrick
        },
        set (newValue) {
          var m = this.left_m
          m && (m.targetBrick = newValue)
        }
      },
      right: {
        get () {
          var m = this.right_m
          return m && m.targetBrick
        },
        set (newValue) {
          var m = this.right_m
          m && (m.targetBrick = newValue)
        }
      },
      suite: {
        get () {
          var m = this.suite_m
          return m && m.targetBrick
        },
        set (newValue) {
          var m = this.suite_m
          m && (m.targetBrick = newValue)
        }
      },
      foot: {
        get () {
          var m = this.foot_m
          return m && m.targetBrick
        },
        set (newValue) {
          var m = this.foot_m
          m && (m.targetBrick = newValue)
        }
      },
      leftMost: {
        get () {
          var ans = this
          var b3k
          while ((b3k = ans.left)) {
            ans = b3k
          }
          return ans
        }
      },
      headMost: {
        get () {
          var ans = this
          var b3k
          while ((b3k = ans.head)) {
            ans = b3k
          }
          return ans
        }
      },
      rightMost: {
        get () {
          var ans = this
          var b3k
          while ((b3k = ans.right)) {
            ans = b3k
          }
          return ans
        }
      },
      footMost: {
        get () {
          var ans = this
          var b3k
          while ((b3k = ans.foot)) {
            ans = b3k
          }
          return ans
        }
      },
      rightComment: {
        get () {
          var b = this.right
          return b && b.isComment ? b : null
        }
      },
    }
  },
  init (board, type, opt_id) {
    try {
      /** @type {string} */
      this.baseType_ = type // readonly private property used by getType
      // next trick to avoid some costy computations
      // this makes sense because subclassers may use a long getBaseType
      // which is oftely used
      this.getBaseType = eYo.Brick.Dflt.prototype.getBaseType // no side effect during creation due to inheritance.

      // private properties
      this.children__ = []
      // to manage reentrency
      this.reentrant_ = Object.create(null)
      // to manage errors
      this.errors = Object.create(null)

      // make the state
      eYo.Events.disableWrap(() => {
        this.change.wrap(() => {
          this.makeMagnets()
          this.makeData()
          this.makeFields()
          this.makeSlots()
          // now make the bounds between data and fields
          this.makeBounds()
          // initialize the data
          this.forEachData(data => data.init())
          // At this point the state value may not be consistent
          this.consolidate()
          // but now it should be
          this.model.init && (this.model.init.call(this))
        })
      })
      // Now we are ready to work
    } finally {
      delete this.getBaseType // next call will use the overriden method if any
    }
    board.addBrick(this, opt_id)
  },
  /**
   * Dispose of all the resources.
   */
  dispose (healStack, animate) {
    var board = this.board
    if (!board) {
      // The block has already been deleted.
      return
    }
    if (this.hasFocus) {
      var m5s = this.magnets
      // this brick was selected, select the brick below or above before deletion
      var f = m => m && m.target
      var m4t = f(m5s.right) || f(m5s.left) || f(m5s.head) || f(m5s.foot) || f(m5s.out)
      m4t ? m4t.focusOn() : this.focusOff()
      board.cancelMotion()
    }
    this.unplug(healStack, animate)
    if (eYo.Events.enabled) {
      eYo.Events.fire(new eYo.Events.BrickDelete(this))
    }
    // Stop rerendering.
    this.ui_ && (this.ui_.rendered = false)
    this.consolidate = this.initUI = this.render = eYo.Do.nothing
    // Remove from board
    board.removeBrick(this)
    this.wrappedMagnets_ && (this.wrappedMagnets_.length = 0)
    eYo.Events.disableWrap(() => {
      this.disposeSlots(healStack)
      this.disposeMagnets()
      this.disposeFields()
      this.disposeData()
      this.inputList_ = eYo.NA
      this.slotList_ = eYo.NA
      this.children__ = eYo.NA
    })
    this.board.resizePort()
    eYo.Property.dispose(this, 'span', 'change')
    eYo.Link.clear(this, 'parent')
  }
})

/**
 * Model getter. Convenient shortcut.
 */
eYo.Brick.getModel = function (type) {
  return eYo.Brick.Mgr.getModel(type)
}

// convenient namespace for debugging
eYo.Brick.DEBUG = Object.create(null)

// Deprecated
Object.defineProperties(eYo.Brick.Dflt.prototype, {
  surroundParent: {
    get () {
      throw "DEPRECATED, BREAK HERE"
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
   * Return the topmost enclosing brick in this brick's tree.
   * May return `this`.
   * @return {!eYo.Brick} The root brick.
   */
  root: {
    get () {
      var ans = this
      var parent
      while ((parent = ans.parent)) {
        ans = parent
      }
      return ans
    }
  },
  /**
   * Return the statement after the receiver.
   * @return {!eYo.Brick} The root brick.
   */
  after: {
    get () {
      var b3k = this.isStmt ? this : this.stmtParent
      var ans = b3k.right || b3k.suite || b3k.foot
      if (ans) {
        return ans
      }
      while ((b3k = b3k.parent)) {
        if ((ans = b3k.foot)) {
          break
        }
      }
      return ans
    },
  },
  lastSlot: {
    get () {
      var ans = this.slotAtHead
      if (ans) {
        while (ans.next) {
          ans = ans.next
        }
      }
      return ans
    }
  },
  /**
   * Return the enclosing brick in this brick's tree
   * which is a control. May be null. May be different from the `root`.
   * @return {?eYo.Brick} The root brick.
   */
  rootControl: {
    get () {
      var ans = this
      while (!ans.isControl && (ans = ans.parent)) {}
      return ans
    }
  },
  /**
   * @readonly
   * @property {Boolean}  Whether this brick is white. White bricks have no effect,
   * the action of the algorithm is exactly the same whether the brick is here or not.
   * White bricks are comment statements, disabled bricks
   * and maybe other kinds of bricks to be found...
   */
  isWhite: {
    get () {
      return this.disabled
    }
  },
  /**
   * @readonly
   * @type {Boolean} Whether this brick is the suite of its parent. False when there is no parent.
   * No white brick management.
   */
  isSuite: {
    get () {
      var head = this.head
      return head && (this === head.suite)
    }
  },
  /**
   * @readonly
   * @type {Boolean} Whether this brick is the suite of its parent. False when there is no parent.
   * No white brick management.
   */
  isFoot: {
    get () {
      var head = this.head
      return head && (this === head.foot)
    }
  },
  /**
   * @readonly
   * @type {Boolean} Whether this brick is top most, meaning the first one
   * in a block of instructions. True iff it is the suite of a there is no brick above nor to the left
   */
  isTop: {
    get () {
      return this.isSuite || (this.isStmt && !this.isFoot)
    }
  },
  isExpr: {
    value: false
  },
  isStmt: {
    value: false
  },
  isGroup: {
    value: false
  },
  depth: {
    value: 0
  },
  width: {
    get () {
      return this.span.width
    }
  },
  height: {
    get () {
      return this.span.height
    }
  },
  recover: {
    get () {
      return this.board.recover
    }
  },
  /**
   * Size of the receiver, in board coordinates.
   * Stores the height, minWidth and width.
   * The latter includes the right padding.
   * It is updated in the right alignment method.
   */
  size: {
    get: eYo.Change.decorate('full_HW__', function() {
      var height = this.span.height
      var minWidth = this.span.width
      var width = minWidth
      // Recursively add size of subsequent bricks.
      var nn, HW
      if ((nn = this.right)) {
        var size = nn.size
        minWidth += size.minWidth
        width += size.width
        // The height of the line is managed while rendering.
      } else {
        width += this.span.right
      }
      if ((nn = this.foot)) {
        var size = nn.size
        height += size.height // NO Height of tab.
        var w = size.width
        if (width < w) {
          width = minWidth = w
        } else if (minWidth < w) {
          minWidth = w
        }
      }
      return {
        ans: {height: height, width: width, minWidth: minWidth}
      }
    })
  },
})

/**
 * Subclass maker.
 * Start point in the hierarchy.
 * Each subclass created will have its own makeSubclass method.
 */
eYo.Brick.makeSubclass = function (owner, key, model) {
  return eYo.Brick.Mgr.makeSubclass(owner, key, eYo.Brick.Dflt, eYo.Brick.Dlgt, false, model || {})
}

/**
 * Increment the change count.
 * The change.count is used to compute some properties that depend
 * on the core state. Some changes induce a change in the change.count
 * which in turn may induce a change in properties.
 * Beware of the stability problem.
 * The change.count is incremented whenever a data changes,
 * a child brick changes or a connection changes.
 * This is used by the primary delegate's getType
 * to cache the return value.
 * For edython.
 * @param {*} deep  Whether to propagate the message to children.
 */
eYo.Brick.Dflt.prototype.changeDone = function (deep) {
  this.change.done()
}

/**
 * Begin a mutation.
 * The change level is used to keep track of the cascading mutations.
 * When mutations imply other mutations, there is no need to perform some actions until the original mutation is complete.
 * For example, rendering should not be done until all the mutations are made.
 * Changes not only concern the data, they may concern the
 * slot visibility too.
 * For edython.
 */
eYo.Brick.Dflt.prototype.changeBegin = function () {
  this.change_.begin()
}

/**
 * When a change is done.
 * For edython.
 * @param {*} deep  Whether to propagate the message to children.
 */
eYo.Brick.Dflt.prototype.onChangeDone = function (deep) {
  if (deep) {
    this.forEachChild(b3k => b3k.changeDone(deep))
  }
}

/**
 * Ends a mutation.
 * When a change is complete at the top level,
 * the change count is incremented and the receiver
 * is consolidated.
 * This is the only place where consolidation should occur.
 * For edython.
 */
eYo.Brick.Dflt.prototype.onChangeEnd = function () {
  this.render()
}

/**
 * Ends a mutation.
 * When a change is complete at the top level,
 * the change count is incremented and the receiver
 * is consolidated.
 * This is the only place where consolidation should occur.
 * For edython.
 */
eYo.Brick.Dflt.prototype.changeEnd = function () {
  --this.change_.level
  if (this.change_.level === 0) {
    this.change.done()
    this.onChangeEnd(arguments)
  }
}

/**
 * Set the value wrapping in a `changeBegin`/`changeEnd`
 * group call of the owner.
 * @param {Object} newValue
 * @param {Boolean} notUndoable
 */
eYo.Data.prototype.doChange = function (newValue, validate) {
  if (newValue !== this.get()) {
    this.brick.change.wrap(
      this.set,
      this,
      newValue,
      validate
    )
  }
}

/**
 * Called when data and slots will load.
 * First send an eponym message to both the data and slots,
 * then use the model's method if any.
 */
eYo.Brick.Dflt.prototype.willLoad = function () {
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
eYo.Brick.Dflt.prototype.didLoad = function () {
  this.forEachData(data => data.didLoad())
  this.forEachSlot(slot => slot.didLoad())
  var didLoad = this.model.didLoad
  if (goog.isFunction(didLoad)) {
    didLoad.call(this)
  }
  this.changeDone()
}

/**
 * Tests if two bricks are equal.
 * Bricks must be of the same type.
 * Lists and dictionaries are managed differently.
 * Usefull for testing purposes for example.
 * @param {?eYo.Brick.Dflt} rhs  Another brick
 */
eYo.Brick.Dflt.prototype.equals = function (rhs) {
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
            var t9k = slot.targetBrick
            var r_t9k = r_slot.targetBrick
            equals = t9k
              ? r_t9k && (t9k.equals(r_t9k))
              : !r_t9k
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
 * At return time, the brick is in a consistent state.
 * All the connections and components are consolidated
 * and are in a consistent state.
 * This method is sent from a `changeEnd` method only.
 * Sends a `consolidate` message to each component of the brick.
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
eYo.Brick.Dflt.prototype.doConsolidate = function (deep, force) {
  if (!force && (!eYo.Events.recordingUndo || !this.board || this.change_.level > 1)) {
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
  // then the out state
  this.consolidateMagnets()
  return true
}

/**
 * Wraps `doConsolidate` into a reentrant and `change.count` aware method.
 */
eYo.Brick.Dflt.prototype.consolidate = eYo.Decorate.reentrant_method(
  'consolidate',
  eYo.Change.decorate(
    'consolidate',
    function (deep, force) {
      this.doConsolidate(deep, force)
    }
  )
)

/**
 * getType.
 * The default implementation just returns the brick type.
 * This should be used instead of direct brick querying.
 * @return {String} The type of the receiver's brick.
 */
eYo.Brick.Dflt.prototype.getType = function () {
  return this.baseType_
}

/**
 * getSubtype.
 * The default implementation just returns the variant,
 * when it exists.
 * Subclassers will use it to return the correct type
 * depending on their actual inner state.
 * This should be used instead of direct brick querying.
 * @return {String} The subtype of the receiver's brick.
 */
eYo.Brick.Dflt.prototype.getSubtype = function () {
  return this.variant_p
}

/**
 * getBaseType.
 * The default implementation just returns the receiver's
 * `baseType_` property or its brick type.
 * Subclassers will use it to return the correct type
 * depending on their actual inner state.
 * The raw type of the brick is the type without any modifier.
 * The raw type is the same as the brick type except for bricks
 * with modifiers.
 * This should be used instead of direct brick querying.
 * @return {?String} The type of the receiver's brick.
 */
eYo.Brick.Dflt.prototype.getBaseType = function () {
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
eYo.Brick.Dflt.prototype.someSlot = function (helper) {
  var slot = this.slotAtHead
  return slot && slot.some(helper)
}

// various forEach convenient methods
/**
 * execute the given function for the fields.
 * For edython.
 * @param {!function} helper
 */
eYo.Brick.Dflt.prototype.forEachField = function (helper) {
  Object.values(this.fields).forEach(f => helper(f))
}

/**
 * Execute the helper for each child.
 * Works on a shallow copy of `children__`.
 */
eYo.Brick.Dflt.prototype.forEachChild = function (helper) {
  this.children__.slice().forEach((b, i, ra) => helper(b, i, ra))
}

/**
 * execute the given function for the head slot of the receiver and its next sibling.
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was an slot to act upon or a valid helper
 */
eYo.Brick.Dflt.prototype.forEachSlot = function (helper) {
  var slot = this.slotAtHead
  slot && slot.forEach(helper)
}

/**
 * execute the given function for the tail slot of the receiver and its previous sibling.
 * For edython.
 * @param {!function} helper
 */
eYo.Brick.Dflt.prototype.forEachSlotReverse = function (helper) {
  var slot = this.slotAtHead
  if (slot) {
    while(slot.next) {
      slot = slot.next
    }
    slot.forEachPrevious(helper)
  }
}

/**
 * execute the given function for the head slot of the receiver and its next sibling. Stops as soon as the helper returns a truthy value.
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was an slot to act upon or a valid helper
 */
eYo.Brick.Dflt.prototype.someSlot = function (helper) {
  var slot = this.slotAtHead
  return slot && (slot.some(helper))
}

/**
 * execute the given function for the head data of the receiver and its next sibling.
 * Ends the loop as soon as the helper returns true.
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was a data to act upon or a valid helper
 */
eYo.Brick.Dflt.prototype.forEachData = function (helper) {
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
 * Execute the helper for each magnet, either superior or inferior.
 * @param {!Function} helper  helper is a function with signature (eYo.Magnet) -> eYo.NA
 */
eYo.Brick.Dflt.prototype.forEachMagnet = function (helper) {
  Object.values(this.magnets).forEach(helper)
  this.forEachSlot(s => s.magnet && helper(s.magnet))
}

/**
 * Execute the helper for all the statements.
 * Deep first traversal.
 * @param {!Function} helper  helper has signature `(brick, depth) -> eYo.NA`
 * @return the truthy value from the helper.
 */
eYo.Brick.Dflt.prototype.forEachStatement = function (helper) {
  var e8r = this.statementEnumerator()
  var b3k
  while ((b3k = e8r.next)) {
    helper(b3k, e8r.depth)
  }
}

/**
 * Bind data and fields.
 * We assume that if data and fields share the same name,
 * they must be bound, otherwise we would have chosen different names...
 * if the data model contains an initializer, use it,
 * otherwise send an init message to all the data controllers.
 */
eYo.Brick.Dflt.prototype.makeBounds = function () {
  var theField = eYo.NA
  for (var k in this.data) {
    var data = this.data[k]
    var slot = this.slots[k]
    if (slot) {
      data.slot = slot
      slot.data = data
      // try the `bind` or unique editable field
      data.field = slot.bind_f
      if (!data.field) {
        var candidate
        slot.forEachField(f => {
          if (f.editable) {
            goog.asserts.assert(!candidate, 'Ambiguous slot <-> data bound (too many editable fields)')
            candidate = f
          }
        })
      }
    } else if ((data.field = this.fields[k])) {
      data.slot = null
    } else {
      this.someSlot(slot => {
        if ((data.field = slot.fields[k])) {
          goog.asserts.assert(!slot.data, `Ambiguous slot <-> data bound ${data.key}, ${slot.data && slot.data.key}`)
          data.slot = slot
          slot.data = data
          return true
        }
      })
    }
    var field = data.field
    if (field && k === 'name') {
      theField = field
    }
    field && (field.data = data)
  }
  if (this.name_d && this.name_d.field !== theField) {
    console.error('ERROR')
  }
}

/**
 * Set the data values from the type.
 * One brick implementation may correspond to different types,
 * For example, there is one implementation for all the primaries.
 * @param {!String} type
 */
eYo.Brick.Dflt.prototype.setDataWithType = function (type) {
  this.forEachData(data => data.setWithType(type))
}

/**
 * Set the data values from the model.
 * @param {!Object} model
 * @return {boolean} whether the model was really used.
 */
eYo.Brick.Dflt.prototype.setDataWithModel = function (model, noCheck) {
  var done = false
  this.forEachData(data => data.setRequiredFromModel(false))
  this.change.wrap(() => {
    var data_in = model.data
    if (goog.isString(data_in) || goog.isNumber(data_in)) {
      var d = this.main_d
      if (d && !d.incog && d.validate(data_in)) {
        d.doChange(data_in)
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
            d.doChange(data_in)
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
              console.warn('Unused data:', this.type, k, data_in[k])
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
 * Make the data according to the model.
 * Called only once during creation process.
 * No data change, no rendering.
 * For edython.
 */
eYo.Brick.Dflt.prototype.makeData = function () {
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
  this.data_ = data
  // now we can use `forEachData`
  this.forEachData(d => {
    Object.defineProperty(d.brick, d.key + '_d', { value: d })
    if (d.model.main === true) {
      goog.asserts.assert(!data.main, 'Only one main data please')
      Object.defineProperty(d.brick, 'main_d', { value: d })
    }
  })
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
eYo.Brick.Dflt.prototype.synchronizeData = function () {
  this.forEachData(data => data.synchronize())
  this.synchronizeData = eYo.Do.nothing
}

/**
 * Disposing of the data ressources.
 */
eYo.Brick.Dflt.prototype.disposeData = function () {
  this.forEachData(data => data.dispose())
  this.data_ = eYo.NA
}

/**
 * Make the Fields.
 * No rendering.
 * For edython.
 */
eYo.Brick.Dflt.prototype.makeFields = function () {
  eYo.Field.makeFields(this, this.model.fields)
}

/**
 * Dispose of the fields.
 * For edython.
 */
eYo.Brick.Dflt.prototype.disposeFields = function () {
  eYo.Field.disposeFields(this)
}

/**
 * Make the slots
 * For edython.
 */
eYo.Brick.Dflt.prototype.makeSlots = (() => {
  var feedSlots = function (slotsModel) {
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
        var model = eYo.Brick.Mgr.getModel(insert)
        if (model) {
          if ((slot = feedSlots.call(this, model.slots))) {
            next = slot
            do {
              goog.asserts.assert(!goog.isDef(slots[next.key]),
                'Duplicate inserted slot key %s/%s/%s', next.key, insert, brick.type)
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
          `Duplicate slot key ${k}/${this.type}`)
        slots[k] = slot
        slot.slots = slots
      } else {
        continue
      }
      slot.order = order
      for (var i = 0; i < ordered.length; i++) {
        // we must not find an aleady existing entry.
        goog.asserts.assert(i !== slot.order,
          `Same order slot ${i}/${this.type}`)
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
  return function () {
    this.slots_ = Object.create(null) // hard to create all the slots at once, like data.
    this.slotAtHead = feedSlots.call(this, this.model.slots)
  }
})()

/**
 * Dispose the slots
 * For edython.
 * @param {?Boolean} healStack  Dispose of the inferior target iff healStack is a falsy value
 */
eYo.Brick.Dflt.prototype.disposeSlots = function (healStack) {
  this.forEachSlot(slot => slot.dispose(healStack))
  this.slots_ = null
}

/**
 * Create the brick magnets.
 * For subclassers eventually
 */
eYo.Brick.Dflt.prototype.makeMagnets = function () {
  this.magnets_ = new eYo.Magnets(this)
}

/**
 * Create the brick magnets.
 * For subclassers eventually
 */
eYo.Brick.Dflt.prototype.disposeMagnets = function () {
  this.magnets_.dispose()
  this.magnets_ = eYo.NA
}

// magnet computed properties
Object.defineProperties(eYo.Brick.Dflt.prototype, {
  out_m: { get () { return this.magnets.out }},
  head_m: { get () { return this.magnets.head }},
  left_m: { get () { return this.magnets.left }},
  right_m: { get () { return this.magnets.right }},
  suite_m: { get () { return this.magnets.suite }},
  foot_m: { get () { return this.magnets.foot }},
})

/**
 * Set the [python ]type of the delegate and its brick.
 * The only accepted types are the ones of
 * the constructor's delegate's `type` method.
 * NEVER call this directly, except if you are a brick.
 * No need to override this.
 * @param {?string} optNewType,
 * @private
 */
eYo.Brick.Dflt.prototype.setupType = function (optNewType) {
  if (!optNewType && !this.type && !eYo.Test && !eYo.Test.no_brick_type) {
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
eYo.Brick.Dflt.prototype.synchronizeSlots = function () {
  this.forEachSlot(slot => slot.synchronize())
}

/**
 * Some bricks may change when their properties change.
 * Consolidate the data.
 * Only used by `consolidate`.
 * Should not be called directly, but may be overriden.
 * For edython.
 * @param {?string} type Name of the new type.
 */
eYo.Brick.Dflt.prototype.consolidateData = function () {
  this.forEachData(data => data.consolidate())
}

/**
 * Some bricks may change when their properties change.
 * Consolidate the slots.
 * Only used by `consolidate`.
 * Should not be called directly, but may be overriden.
 * For edython.
 * @param {?Boolean} deep
 * @param {?Boolean} force
 */
eYo.Brick.Dflt.prototype.consolidateSlots = function (deep, force) {
  this.forEachSlot(slot => slot.consolidate(deep, force))
  // some child bricks may be disconnected as side effect
}

/**
 * Some bricks may change when their properties change.
 * For edython.
 * This is one of the main methods.
 * The type depends on both the properties of the brick and the connections.
 * There might be problems when a parent brick depends on the child
 * and vice versa. This is something that we must avoid.
 * See assignment_chain.
 */
eYo.Brick.Dflt.prototype.consolidateType = function () {
  if (this.board) {
    this.setupType(this.getType())
    if (this.wrapped_) {
      var p = this.parent
      p && (p.consolidateType())
    }
  }
}

/**
 * Set the connection check array.
 * The connections are supposed to be configured only once.
 * This method may disconnect bricks as side effect,
 * thus interacting with the undo manager.
 * After initialization, this should be called whenever
 * the brick type/subtype may have changed.
 * Disconnecting brick may imply a further type change, which then implies a connection consolidation.
 * This looping process will end when the type does not change,
 * which occurs at least when no connections
 * is connected.
 * Starts by completing the wrapped connections.
 * The wrapped connections are known at initialization time,
 * but that may not be always the case.
 * Sent by `doConsolidate` and various `isChanging` methods.
 */
eYo.Brick.Dflt.prototype.consolidateMagnets = function () {
  this.completeWrap_()
  var f = m4t => {
    m4t && (m4t.updateCheck())
  }
  this.forEachSlot(slot => f(slot.magnet))
  var m5s = this.magnets
  if (m5s.out) {
    f(m5s.out)
  } else {
    f(m5s.head)
    f(m5s.left)
    f(m5s.right)
    f(m5s.suite)
    f(m5s.foot)
  }
}

console.error('allways heal stack, unplug next of not?')
/**
 * Unplug this brick from its superior brick.  If this brick is a statement,
 * optionally reconnect the brick underneath with the brick on top.
 * @param {boolean=} opt_healStack Disconnect child statement and reconnect
 *   stack.  Defaults to false.
 */
eYo.Brick.Dflt.prototype.unplug = function(opt_healStack, animate) {
  var healStack = animate && this.ui_.rendered && opt_healStack
  var m4t
  if ((m4t = this.out_m)) {
    m4t.disconnect()
  } else if ((m4t = this.head_m) && (m4t = m4t.target)) {
    m4t.disconnect()
    if (healStack) {
      var child = this.foot_m
      if (child && (child = child.target)) {
        child.disconnect()
        m4t.connect(child)
      }
    }
  } else if ((m4t = this.left_m) && (m4t = m4t.target)) {
    m4t.disconnect()
    if (healStack) {
      if ((child = this.right_m) && (child = child.target)) {
        child.disconnect()
        m4t.connect(child)
      }
    }
  }
  animate && this.ui_ && (this.ui_.disposeEffect())
}

/**
 * Initialize a brick.
 * Called from brick's init method.
 * This should be called only once.
 * The underlying model is not expected to change while running.
 * Call's the model's `init` method if any.
 * This is always called at creation time such that it must
 * be executed outside of any undo management.
 */
eYo.Brick.Dflt.prototype.init = function () {
}

/**
* Deinitialize a brick. Calls the model's `deinit` method is any.
* @constructor
*/
eYo.Brick.Dflt.prototype.deinit = function () {
  this.model.deinit && (this.model.deinit.call(this))
}

Object.defineProperties(eYo.Brick.Dflt.prototype, {
  /**
   * Find all the bricks that are directly or indirectly nested inside this one.
   * Includes this brick in the list.
   * Includes value and brick inputs, as well as any following statements.
   * Excludes any connection on an output tab or any preceding statements.
   * @type {!Array.<!eYo.Brick>} Flattened array of brick.
   */
  descendants: {
    get () {
      var ans = [this]
      this.children__.forEach(d => ans.push.apply(ans, d.descendants))
      return ans
    }
  },
  /**
   * Compute a list of the IDs of the specified brick and all its descendants.
   * @param {!eYo.Brick.Dflt} brick The root brick.
   * @return {!Array.<string>} List of brick IDs.
   * @private
   */
  descendantIds: {
    get () {
      return this.descendants.map(b3k => b3k.id)
    }
  },
  /**
   * Same as `descendants` property except that it
   * includes the receiver in the list only when not sealed.
   * @return {!Array.<!eYo.Brick>} Flattened array of brick.
   */
  wrappedDescendants: {
    get () {
      var ans = []
      if (!this.wrapped_) {
        ans.push(this)
      }
      this.forEachChild(b => ans.push.apply(ans, b.wrappedDescendants))
      return ans    
    }
  }
})

/**
 * Adds a magnet to later wrapping.
 * @param {eYo.Magnet} magnet  The magnet that should connect to a wrapped brick.
 */
eYo.Brick.Dflt.prototype.addWrapperMagnet = function (magnet) {
  magnet && (this.wrappedMagnets.push(magnet))
}

/**
 * Adds a magnet to later wrapping.
 * @param {eYo.Magnet} magnet  The magnet that should connect to a wrapped brick.
 */
eYo.Brick.Dflt.prototype.removeWrapperMagnet = function (magnet) {
  var i = this.wrappedMagnets.indexOf(magnet)
  if (i>=0) {
    this.wrappedMagnets.splice(i)
  }
}

/**
 * If the sealed connections are not connected,
 * create a node for it.
 * The default implementation connects all the bricks from the wrappedMagnets_ list.
 * Subclassers will eventually create appropriate new nodes
 * and connect it to any sealed connection.
 * @private
 */
eYo.Brick.Dflt.prototype.completeWrap_ = function () {
  if (this.wrappedMagnets_) {
    var i = 0
    while (i < this.wrappedMagnets_.length) {
      var d = this.wrappedMagnets_[i]
      var ans = d.completeWrap()
      if (ans && ans.ans) {
        this.wrappedMagnets_.splice(i)
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
eYo.Brick.Dflt.prototype.duringBrickWrapped = function () {
  goog.asserts.assert(!this.uiHasSelect, 'Deselect brick before')
  this.ui && (this.ui.updateBrickWrapped())
}


/**
 * The default implementation is false.
 * Subclassers will override this but won't call it.
 */
eYo.Brick.Dflt.prototype.canUnwrap = function () {
  return false
}

/**
 * The default implementation does nothing.
 * Subclassers will override this but won't call it.
 * @private
 */
eYo.Brick.Dflt.prototype.duringBrickUnwrapped = function () {
  this.ui && (this.ui.updateBrickWrapped())
}

/**
 * Will connect this brick's connection to another connection.
 * @param {!eYo.Magnet} m4t
 * @param {!eYo.Magnet} childM4t
 */
eYo.Brick.Dflt.prototype.willConnect = function (m4t, childM4t) {
}

/**
 * Did connect this brick's magnet to another magnet.
 * @param {!eYo.Magnet} m4t what has been connected in the brick
 * @param {!eYo.Magnet} oldTargetM4t what was previously connected in the brick
 * @param {!eYo.Magnet} targetOldM4t what was previously connected to the new magnet
 */
eYo.Brick.Dflt.prototype.didConnect = function (m4t, oldTargetM4t, targetOldM4t) {
  // new connections change the span properties of the superior block.
  // How many lines did I add? where did I add them?
  var t9k = m4t.targetBrick
  if (m4t.isFoot) {
    this.span.addFoot(t9k.span.l)
  } else if (m4t.isSuite) {
    this.span.black = 0
    this.span.addSuite(t9k.span.l)
  } else if (m4t.isRight) {
    this.span.resetPadding() && b.ui.updateShape()
  }
  this.consolidateType()
  if (m4t.isSlot && m4t.hasFocus) {
    t9k.focusOn()
  }
}

/**
 * Will disconnect this brick's connection.
 * @param {!eYo.Magnet} m4t
 */
eYo.Brick.Dflt.prototype.willDisconnect = function (m4t) {
}

/**
 * Did disconnect this receiver's magnet from another magnet.
 * @param {!eYo.Magnet} m4t  
 * @param {!eYo.Magnet} oldTargetM4t  that was connected to m4t
 */
eYo.Brick.Dflt.prototype.didDisconnect = function (m4t, oldTargetM4t) {
  // how many bricks/line did I remove in the superior brick?
  var s = this.span
  if (m4t.isFoot) {
    s.foot = 0
  } else if (m4t.isSuite) {
    s.black = 1
    s.suite = 0
  } else if (m4t.isRight) {
    var s_t = oldTargetM4t.brick.span
    s.addFooter(-s_t.footer - s_t.main + 1)
  } else if (m4t.isLeft) {
    s.header = 0
  }
  this.changeDone()
}

/**
 * Can remove and bypass the parent?
 * If the parent's output connection is connected,
 * can connect the brick's output connection to it?
 * The connection cannot always establish.
 * @param {!eYo.Brick.Dflt} other  the brick to be replaced
 */
eYo.Brick.Dflt.prototype.canReplaceBrick = function (other) {
  return false
}

/**
 * Returns the total number of code lines for that node and the node below.
 * One atomic instruction is one line.
 * In terms of grammar, it counts the number of simple statements.
 * @return {Number}.
 */
eYo.Brick.Dflt.prototype.getStatementCount = function () {
  var n = 1
  var hasActive = false
  var hasNext = false
  var m4t = this.suite_m
  if (m4t) {
    hasNext = true
    var t9k = m4t.targetBrick
    if (t9k) {
      do {
        hasActive = hasActive || (!t9k.disabled_ && !t9k.isWhite)
        n += t9k.getStatementCount()
      } while ((t9k = t9k.next))
    }
  }
  return n + (hasNext && !hasActive ? 1 : 0)
}

Object.defineProperty(eYo.Brick.Dflt.prototype, 'disabled', {
  get () {
    return this.disabled_
  },
  /**
   * Set the disable state of the brick.
   * Calls the brick's method but also make sure that previous bricks
   * and next bricks are in an acceptable state.
   * For example, if I disable an if brick, I should also disable
   * an elif/else following brick, but only if it would make an elif/else orphan.
   * For edython.
   * @param {Boolean} yorn  true to disable, false to enable.
   * @return None
   */
  set (yorn) {
    if (!!this.disabled_ === !!yorn) {
      // nothing to do the brick is already in the good state
      return
    }
    eYo.Events.groupWrap(() => {
      eYo.Events.fireBrickChange(
        this, 'disabled', null, this.disabled_, yorn)
      var previous, next
      if (yorn) {
        // Does it break next connections
        if ((previous = this.head_m) &&
        (next = previous.target) &&
        next.blackMagnet) {
          var b3k = this
          while ((previous = b3k.foot_m) &&
          (previous = previous.target) &&
          (previous = previous.blackMagnet)) {
            if (next.checkType_(previous)) {
              break
            }
            b3k = previous.brick
            // No recursion
            b3k.setDisabled(true)
          }
        }
      } else {
        // if the connection chain below this brick is broken,
        // try to activate some bricks
        if ((next = this.foot_m)) {
          if ((previous = next.target) &&
          (previous = previous.blackMagnet) &&
          !next.checkType_(previous)) {
            // find  white brick in the below chain that can be activated
            // stop before the black connection found just above
            previous = next.target
            do {
              var b3k = previous.brick
              if (b3k.disabled) {
                b3k.disabled = false
                var check = next.checkType_(previous)
                b3k.disabled = true
                if (check) {
                  b3k.disabled = false
                  if (!(next = b3k.foot_m)) {
                    break
                  }
                }
              } else if (!b3k.isWhite) {
                // the black connection is reached, no need to go further
                // but the next may have change and the checkType_ must
                // be computed once again
                if (!next.checkType_(previous)) {
                  b3k.unplug()
                  b3k.ui.bumpNeighbours_()
                }
                break
              }
            } while ((previous = previous.getMagnetBelow()))
          }
        }
        // now consolidate the chain above
        if ((previous = this.head_m)) {
          if ((next = previous.target) &&
          (next = next.blackMagnet) &&
          !previous.checkType_(next)) {
            // find  white brick in the above chain that can be activated
            // stop before the black connection found just above
            next = previous.target
            do {
              b3k = next.brick
              if (b3k.disabled) {
                // beware of some side effet below
                // bad design, things have changed since then...
                b3k.disabled = false
                check = previous.checkType_(next)
                b3k.disabled = true
                if (check) {
                  b3k.setDisabled(false)
                  if (!(previous = b3k.head_m)) {
                    break
                  }
                }
              } else if (!b3k.isWhite) {
                // the black connection is reached, no need to go further
                // but the next may have change and the checkType_ must
                // be computed once again
                if (!next.checkType_(previous)) {
                  b3k = previous.brick
                  b3k.unplug()
                  b3k.ui.bumpNeighbours_()
                }
                break
              }
            } while ((next = next.getMagnetAbove()))
          }
        }
      }
    }, () => {
      this.changeDone()
      this.ui && (this.ui.updateDisabled())
      this.render()
    })
  }
})

Object.defineProperty(eYo.Brick.Dflt.prototype, 'incog', {
  /**
   * Get the disable state.
   * For edython.
   */
  get () {
    return this.incog_
  },
  /**
   * Change the incog status.
   * An incog brick won't render.
   * The connections must be explicitely hidden when the brick is incog.
   * @param {!Boolean} incog
   */
  set (newValue) {
    if (!this.incog_ === !newValue) {
      return
    }
    if (newValue) {
      if (this.incog_) {
        // The brick is already incognito,
        // normally no change to the brick tree
      }
    } else if (this.disabled) {
      // enable the brick before enabling its connections
      return
    }
    this.incog_ = newValue
    this.forEachSlot(slot => slot.incog = newValue) // with incog validator
    var m4t = this.suite_m
    m4t && (m4t.incog = newValue)
    this.consolidate() // no deep consolidation because connected blocs were consolidated during slot's or connection's incog setter
    return true  
  }
})

/**
 * Runs the helper function for some input connection, until it responds true
 * For edython.
 * @param {!Function} helper
 * @return {Object} returns the first connection for which helper returns true or the helper return value
 */
eYo.Brick.Dflt.prototype.someSlotMagnet = function (helper) {
  return this.someSlot(slot => {
    var m4t = slot.magnet
    return m4t && (helper(m4t))
  })
}

/**
 * Set the error
 * For edython.
 * @param {!eYo.Brick.Dflt} brick The owner of the receiver.
 * @param {!string} key
 * @param {!string} msg
 * @return true if the given value is accepted, false otherwise
 */
eYo.Brick.Dflt.prototype.setError = function (key, msg) {
  this.errors[key] = {
    message: msg
  }
}

/**
 * get the error
 * For edython.
 * @param {!eYo.Brick.Dflt} brick The owner of the receiver.
 * @param {!string} key
 * @return true if the given value is accepted, false otherwise
 */
eYo.Brick.Dflt.prototype.getError = function (key) {
  return this.errors[key]
}

/**
 * get the error
 * For edython.
 * @param {!eYo.Brick.Dflt} brick The owner of the receiver.
 * @param {!string} key
 * @return true if the given value is accepted, false otherwise
 */
eYo.Brick.Dflt.prototype.removeError = function (key) {
  delete this.errors[key]
}

/**
 * get the slot magnets, mainly for debugging purposes.
 * For edython.
 * @return An array of all the magnets
 */
eYo.Brick.Dflt.prototype.getSlotMagnets = function () {
  var ra = []
  this.forEachSlot(slot => slot.magnet && (ra.push(slot.magnet)))
  return ra
}

/**
 * get the slot connections, mainly for debugging purposes.
 * For edython.
 * @param {!eYo.Brick.Dflt} brick
 * @return the given brick
 */
eYo.Brick.Dflt.prototype.footConnect = function (brick) {
  this.foot_m.connect(brick.head_m)
  return brick
}

/**
 * Connect the magnet of the `lastSlot`, to the given expression brick/magnet/type.
 * @param {!eYo.Brick|eYo.Magnet|String} bdct  brick, magnet or type
 * @return {?eYo.Brick}  The connected brick, if any.
 */
eYo.Brick.Dflt.prototype.connectLast = function (bmt) {
  var other = (bmt.magnets && bmt.out_m) || (bmt instanceof eYo.Magnet && bmt) || eYo.Brick.newReady(this, bmt).out_m
  if (other) {
    var m4t = this.lastSlot.magnet
    if (m4t.checkType_(other)) {
      m4t.connect(other)
      return m4t.target === other ? m4t.targetBrick : eYo.NA
    }
  }
}

/**
 * Scrolls the receiver to the top left part of the board.
 * Does nothing if the brick is already in the visible are,
 * and is not forced.
 * @param {!Boolean} force  flag
 */
eYo.Brick.Dflt.prototype.scrollToVisible = function (force) {
  if (!this.inVisibleArea || force) {
    this.board.scrollBrickTopLeft(this.id)
  }
}
/**
 * Returns connections originating from this brick.
 * @param {boolean} all If true, return all connections even hidden ones.
 *     Otherwise, for a non-rendered brick return an empty list, and for a
 *     collapsed brick don't return inputs connections.
 * @return {!Array.<!eYo.Magnet>} Array of magnets.
 */
eYo.Brick.Dflt.prototype.getMagnets_ = function(all) {
  var ans = []
  if (all || this.ui.rendered) {
    Object.values(this.magnets).forEach(m4t => ans.push(m4t))
    if (all || !this.collapsed_) {
      this.forEachSlot(slot => ans.push(slot.magnet))
    }
  }
  return ans
}


/**
 * Whether the receiver is movable.
 */
eYo.Brick.Dflt.prototype.isMovable = function() {
  return !this.wrapped_ && this.movable_ &&
  !(this.board && this.board.options.readOnly)
}

/**
 * Set whether the receiver is collapsed or not.
 * @param {boolean} collapsed True if collapsed.
 */
eYo.Brick.Dflt.prototype.setCollapsed = function (collapsed) {
  this.collapsed = collapsed
}

Object.defineProperties(eYo.Brick.Dflt.prototype, {
  /**
   * Position of the receiver in the board.
   * @type {eYo.Where}
   * @readonly
   */
  xy: {
    get () {
      return this.ui.xy_
    }
  },
  /**
   * Position of the receiver in the board.
   * @type {eYo.Where}
   * @readonly
   */
  where: {
    get () {
      return this.ui.xy_
    }
  },
  /**
   * Position of the receiver in the board.
   * @type {eYo.Where}
   * @readonly
   */
  isMain: {
    value: false
  },
})

/**
 * Move a brick to an offset in board coordinates.
 * @param {eYo.Where} xy Offset in board units.
 * @param {Boolean} snap Whether we should snap to the grid.
 */
eYo.Brick.Dflt.prototype.moveTo = function (xy, snap) {
  this.ui.moveTo(xy, snap)
}

/**
 * Move a brick assuming according to its `xy` property.
 */
eYo.Brick.Dflt.prototype.move = function () {
  this.ui.moveTo(this.xy)
}

/**
 * Move a brick by a relative offset in board coordinates.
 * @param {number} dxy Offset in board units.
 * @param {boolean} snap Whether we should snap to grid.
 */
eYo.Brick.Dflt.prototype.moveBy = function (dxy, snap) {
  this.ui.moveBy(dxy, snap)
}

/**
 * Render the brick.
 * Lays out and reflows a brick based on its contents and settings.
 */
// deleted bricks are rendered during deletion
// this should be avoided
eYo.Brick.Dflt.prototype.render = eYo.Do.nothing

/**
 * Render the brick. Real function.
 */
eYo.Brick.Dflt.prototype.render_ = function () {
  this.ui.render()
}

Object.defineProperties(eYo.Brick.Dflt.prototype, {
  /**
   * @type{eYo.Change}
   * @readonly
   */
  change: {
    get () {
      return this.change_
    }
  },
  /**
   * Freeze the change step while editing.
   * @type{Boolean}
   * @readonly
   */
  changeStepFreeze: {
    get () {
      return this.isEditing
    }
  },
  editable: {
    value: true,
    writable: true
  },
  movable: {
    get () {
      return this.movable_
    }
  },
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
      this.forEachSlot(slot => slot.visible = !collapsed)
      eYo.Events.fireBrickChange(
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

eYo.Brick.Dflt.prototype.packedQuotes = true
eYo.Brick.Dflt.prototype.packedBrackets = true

/**
 * Called when the parent will just change.
 * This code is responsible to place the various path
 * in the proper domain of the dom tree.
 * @param {!eYo.Brick.Dflt} newParent to be connected.
 */
eYo.Brick.Dflt.prototype.parentWillChange = function (newParent) {
  this.ui.parentWillChange(newParent)
}

/**
 * Called when the parent will just change.
 * This code is responsible to place the various path
 * in the proper domain of the dom tree.
 * @param {!eYo.Brick.Dflt} oldParent that was disConnected.
 */
eYo.Brick.Dflt.prototype.parentDidChange = function (oldParent) {
  this.ui.parentDidChange(newParent)
}

/**
 * Returns the named field from a brick.
 * Only fields that do not belong to an input are searched for.
 * @param {string} name The name of the field.
 * @return {eYo.Field} Named field, or null if field does not exist.
 */
eYo.Brick.Dflt.prototype.getField = function (name) {
  var ans = null
  var f = F => Object.values(F).some(f => (f.name === name) && (ans = f))
  if (f(this.fields)) return ans
  var slot
  if ((slot = this.slotAtHead)) {
    do {
      if (f(slot.fields)) return ans
    } while ((slot = slot.next))
  }
  this.someSlot(slot => slot.fieldRow.some(f => (f.name === name) && (ans = f)))
  return ans
}

/**
 * When the brick is just a wrapper, returns the wrapped target.
 */
eYo.Brick.Dflt.prototype.getMenuTarget = function () {
  var wrapped
  if (this.wrap && (wrapped = this.wrap.input.target)) {
    return wrapped.getMenuTarget()
  }
  if (this.wrappedMagnets_ && this.wrappedMagnets_.length === 1 &&
    (wrapped = this.wrappedMagnets_[0].targetBrick)) {
    // if there are more than one wrapped brick,
    // then we choose none of them
    return wrapped.getMenuTarget()
  }
  return this
}

eYo.Brick.debugPrefix = ''
eYo.Brick.debugCount = {}

/**
 * Fetches the named slot object.
 * @param {!String} name The name of the input.
 * @return {eYo.Slot} The slot object, or null if input does not exist. Input that are disabled are skipped.
 */
eYo.Brick.Dflt.prototype.getSlot = function (name) {
  return this.someSlot(slot => slot.name === name)
}

/**
 * Class for a statement brick enumerator.
 * Deep first traversal.
 * Starts with the given brick.
 * The returned object has next and depth messages.
 */
eYo.Brick.Dflt.prototype.statementEnumerator = function () {
  var me = {
    current_: eYo.NA,
    depth: 0,
    parents: []
  }
  me.next_ = () => {
    me.next_ = me.next__
    return me.current_ = this
  }
  me.next__ = () => {
    var ans
    if((ans = me.current.right)) {
      return (me.current = ans)
    }
    if ((ans = me.current.suite)) {
      parents.push(me.current)
      return (me.current = ans)
    }
    if ((ans = me.current.foot)) {
      return (me.current = ans)
    }
    var b3k
    while ((b3k = parents.pop())) {
      if ((ans = b3k.foot)) {
        return (me.current = ans)
      }  
    }
  }
  Object.defineProperties(me, {
    depth: {
      get () {
        return this.parents.length
      }
    },
    next: {
      get () {
        return this.next_()
      }
    },
    current: {
      get () {
        return this.current_
      }
    }
  })
  return me
}

/**
 * Execute the helper until one answer is a truthy value.
 * Deep first traversal.
 * @param {!Function} helper  helper has signature `(block, depth) -> truthy`
 * @return the truthy value from the helper if it is not `true`, the brick chosen otherwise.
 */
eYo.Brick.Dflt.prototype.someStatement = function (helper) {
  var e8r = this.statementEnumerator()
  var b3k
  var ans
  while ((b3k = e8r.next)) {
    if ((ans = helper(b3k, e8r.depth))) {
      return ans === true ? b3k : ans
    }
  }
}

/**
 * Create a new brick.
 * This is the expected way to create the brick.
 * If the model fits an identifier, then create an identifier
 * If the model fits a number, then create a number
 * If the model fits a string literal, then create a string literal...
 * If the board is headless,
 * this is headless and should not render until a initUI message is sent.
 * @param {!*} owner  board or brick
 * @param {!String|Object} model
 * @param {?String|Object} id
 * @param {?eYo.Brick.Dflt} id
 */
eYo.Brick.newReady = (() => {
  var processModel = (board, model, id, brick) => {
    var dataModel = model // may change below
    if (!brick) {
      if (eYo.Brick.Mgr.get(model.type)) {
        brick = board.newBrick(model.type, id)
        brick.setDataWithType(model.type)
      } else if (eYo.Brick.Mgr.get(model)) {
        brick = board.newBrick(model, id) // can undo
        brick.setDataWithType(model)
      } else if (goog.isString(model) || goog.isNumber(model)) {
        var p5e = eYo.T3.Profile.get(model, null)
        var f = p5e => {
          var ans
          if (p5e.expr && (ans = board.newBrick(p5e.expr, id))) {
            p5e.expr && (ans.setDataWithType(p5e.expr))
            model && (ans.setDataWithModel(model))
            dataModel = {data: model}
          } else if (p5e.stmt && (ans = board.newBrick(p5e.stmt, id))) {
            p5e.stmt && (ans.setDataWithType(p5e.stmt))
            dataModel = {data: model}
          } else if (goog.isNumber(model)  && (ans = board.newBrick(eYo.T3.Expr.numberliteral, id))) {
            ans.setDataWithType(eYo.T3.Expr.numberliteral)
            dataModel = {data: model.toString()}
          } else {
            console.warn('No brick for model:', model)
          }
          return ans
        }
        if (!p5e.isVoid && !p5e.isUnset) {
          brick = f(p5e)
        } else {
          console.warn('No brick for model either:', model)
          return
        }
      }
    }
    brick && brick.change.wrap(
      function () { // `this` is `brick`
        this.willLoad()
        this.setDataWithModel(dataModel)
        var Vs = model.slots
        for (var k in Vs) {
          if (eYo.Do.hasOwnProperty(Vs, k)) {
            var slot = this.slots[k]
            if (slot && slot.magnet) {
              var t9k = slot.targetBrick
              var V = Vs[k]
              var b3k = processModel(board, V, null, t9k)
              if (!t9k && b3k && b3k.out_m) {
                b3k.change.wrap(() => {
                  slot && (slot.incog = false)
                  b3k.out_m.connect(slot.magnet)
                })
              }
            }
          }
        }
        // now bricks and slots have been set
        this.didLoad()
        if (brick.foot_m) {
          var footModel = dataModel.next
          if (footModel) {
            var b3k = processModel(board, footModel)
            if (b3k && b3k.head_m) {
              try {
                brick.foot_m.connect(b3k.head_m)
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
    return brick
  }
  return function (owner, model, id) {
    var board = owner.board || owner
    var b3k = processModel(board, model, id)
    if (b3k) {
      b3k.consolidate()
      owner.hasUI && b3k.initUI()
    }
    return b3k
  }
})()

/**
 * When setup is finish.
 * The state has been created, some expected connections are created
 * This is a one shot function.
 * @param {boolean} headless  no op when false
 */
eYo.Brick.Dflt.prototype.initUI = function () {
  this.change.wrap(() => {
    this.ui_ = new eYo.Brick.UI(this)
    this.forEachField(field => field.initUI())
    this.forEachSlot(slot => slot.initUI())
    ;[this.suite_m,
      this.right_m,
      this.foot_m
    ].forEach(m => m && m.initUI())
    this.forEachData(data => data.synchronize()) // data is no longer headless
    this.magnets.initUI()
    this.ui.updateShape()
    this.render = eYo.Brick.Dflt.prototype.render_
  })
  this.initUI = eYo.Do.nothing
  delete this.disposeUI
}

/**
 * Dispose of the ui resource.
 */
eYo.Brick.Dflt.prototype.disposeUI = function (healStack, animate) {
  this.change.wrap(() => {
    this.render = eYo.Do.nothing
    this.forEachField(field => field.disposeUI())
    this.forEachSlot(slot => slot.disposeUI())
    this.magnets.disposeUI()
    this.ui_.dispose()
    this.ui_ = null
  })
  this.ui_ && (this.ui_.dispose() && (this.ui_ = null))
  this.disposeUI = eYo.Do.nothing
  delete this.initUI
}

/**
 * Returns the python type of the brick.
 * This information may be displayed as the last item in the contextual menu.
 * Wrapped bricks will return the parent's answer.
 */
eYo.Brick.Dflt.prototype.getPythonType = function () {
  if (this.wrapped_) {
    return this.parent.getPythonType()
  }
  return this.pythonType_
}

/**
 * Insert a parent.
 * If the brick's output connection is connected,
 * connects the parent's output to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {Object} model, for subclassers
 * @return {?eYo.Brick} the created brick
 */
eYo.Brick.Dflt.prototype.insertParentWithModel = function (model) {
  goog.asserts.assert(false, 'Must be subclassed')
}

/**
 * Insert a brick of the given type.
 * For edython.
 * @param {Object|string} model
 * @param {eYo.Magnet} m4t
 * @return {?eYo.Brick} the brick that was inserted
 */
eYo.Brick.Dflt.prototype.insertBrickWithModel = function (model, m4t) {
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
  // create a brick out of the undo mechanism
  var candidate
  eYo.Events.disableWrap(
    () => {
      var m4t, otherM4t
      candidate = eYo.Brick.newReady(this, model)
      var fin = prepare => {
        eYo.Events.groupWrap(() => {
          eYo.Events.enableWrap(() => {
            eYo.Do.tryFinally(() => {
              eYo.Events.fireBrickCreate(candidate)
              prepare && (prepare())
              otherM4t.connect(m4t)
            }, () => {
              eYo.app.focusMgr.brick = candidate
              candidate.render()
              candidate.ui.bumpNeighbours_()
            })
          })
        })
        return candidate
      }
      if (!candidate) {
        // very special management for tuple input
        if ((otherM4t = eYo.Focus.magnet) && goog.isString(model)) {
          var otherBrick = otherM4t.brick
          if (otherBrick instanceof eYo.Brick.List && otherM4t.isSlot) {
            eYo.Events.groupWrap(() => {
              var b4s = model.split(',').map(x => {
                var model = x.trim()
                var p5e = eYo.T3.Profile.get(model, null)
                console.warn('MODEL:', model)
                console.warn('PROFILE:', p5e)
                return {
                  model,
                  p5e
                }
              }).filter(({p5e}) => !p5e.isVoid && !p5e.isUnset).map(x => {
                var ans = eYo.Brick.newReady(this, x.model)
                ans.setDataWithModel(x.model)
                console.error('BRICK', ans)
                return ans
              })
              b4s.some(b => {
                /* non local */ candidate = b
                if ((m4t = candidate.out_m) && m4t.checkType_(otherM4t)) {
                  fin()
                  var next = false
                  otherBrick.someSlotMagnet(m4t => {
                    if (next) {
                      otherM4t = m4t
                      return true
                    } else if (m4t === otherM4t) {
                      next = true
                    }
                  })
                }
              })
              otherM4t.focusOn()
            })
          }
        }
        return
      }
      if ((otherM4t = eYo.Focus.magnet)) {
        otherBrick = otherM4t.brick
        if (otherM4t.isSlot) {
          if ((m4t = candidate.out_m) && m4t.checkType_(otherM4t)) {
            return fin()
          }
        } else if (otherM4t.isHead) {
          if ((m4t = candidate.foot_m) && m4t.checkType_(otherM4t)) {
            var targetM4t = otherM4t.target
            if (targetM4t && candidate.head_m &&
              targetM4t.checkType_(candidate.head_m)) {
              return fin(() => {
                targetM4t.connect(candidate.head_m)
              })
            } else {
              return fin(() => {
                var xy = this.xy.backward(candidate.xy)
                xy.y -= candidate.size.height
                candidate.moveBy(xy)
              })
            }
            // unreachable code
          }
        } else if (otherM4t.isSuite || otherM4t.isFoot) {
          if ((m4t = candidate.head_m) && m4t.checkType_(otherM4t)) {
            if ((targetM4t = otherM4t.target) && candidate.foot_m &&
            targetM4t.checkType_(candidate.foot_m)) {
              return fin(() => {
                targetM4t.connect(candidate.foot_m)
              })
            } else {
              return fin()
            }
          }
        }
      }
      var c8n_N = model.input
      if ((m4t = candidate.out_m)) {
        // try to find a free magnet in a brick
        // When not eYo.NA, the returned magnet can connect to m4t.
        var findM4t = b3k => {
          var otherM4t, t9k
          otherM4t = b3k.someSlotMagnet(foundM4t => {
            if (foundM4t.isSlot) {
              if ((t9k = foundM4t.targetBrick)) {
                if (!(foundM4t = findM4t(t9k))) {
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
                otherM4t = foundM4t
              }
            }
          })
          return otherM4t
        }
        if ((otherM4t = findM4t(this))) {
          return fin()
        }
      }
      if ((m4t = candidate.head_m)) {
        if ((otherM4t = this.foot_m) && m4t.checkType_(otherM4t)) {
          return fin(() => {
            if ((targetM4t = otherM4t.target)) {
              // connected to something, beware of orphans
              otherM4t.disconnect()
              if (candidate.foot_m && candidate.foot_m.checkType_(targetM4t)) {
                candidate.foot_m.connect(targetM4t)
                targetM4t = null
              }
            }
            m4t.connect(otherM4t)
            if (targetM4t) {
              targetM4t.brick.ui.bumpNeighbours_()
            }
          })
        }
      }
      if ((m4t = candidate.foot_m)) {
        if ((otherM4t = this.head_m) && m4t.checkType_(otherM4t)) {
          if ((targetM4t = otherM4t.target) && (otherM4t = candidate.head_m) && candidate.head_m.checkType_(targetM4t)) {
            return fin(() => {
              otherM4t.connect(targetM4t)
            })
          } else {
            return fin(() => {
              var xy = this.xy.backward(candidate.xy)
              xy.y -= candidate.size.height
              candidate.moveBy(xy)
            })
          }
        }
      }
      candidate.dispose(true)
      candidate = null
    }
  )
  return candidate
}

/**
 * Whether the given brick can lock.
 * For edython.
 * @return boolean
 */
eYo.Brick.Dflt.prototype.canLock = function () {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var m4t, target
  return !this.someSlot(slot => {
    if ((m4t = slot.magnet) && !m4t.disabled_) {
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
 * Whether the given brick can unlock.
 * For edython.
 * @return {boolean}, true only if there is something to unlock
 */
eYo.Brick.Dflt.prototype.canUnlock = function () {
  if (this.locked_) {
    return true
  }
  // list all the slots for a non optional connection with no target
  var m4t, t9k
  return this.someSlot(slot => {
    if ((m4t = slot.magnet)) {
      if ((t9k = m4t.targetBrick)) {
        if (t9k.canUnlock()) {
          return true
        }
      }
    }
  })
}

/**
 * Lock the given brick.
 * For edython.
 * @return {number} the number of bricks locked
 */
eYo.Brick.Dflt.prototype.lock = function () {
  var ans = 0
  if (this.locked_ || !this.canLock()) {
    return ans
  }
  eYo.Events.fireBrickChange(
    this, eYo.Const.Event.locked, null, this.locked_, true)
  this.locked_ = true
  if (this.hasFocus) {
    eYo.Focus.magnet = null
  }
  // list all the slots for connections with a target
  var m4t
  var t9k
  this.forEachSlot(slot => {
    if ((m4t = slot.magnet)) {
      if ((t9k = m4t.targetBrick)) {
        ans += t9k.lock()
      }
      if (m4t.isSlot) {
        m4t.hidden = true
      }
    }
  })
  // maybe redundant calls here
  this.forEachSlot(slot => {
    if ((m4t = slot.magnet)) {
      if ((t9k = m4t.targetBrick)) {
        ans += t9k.lock()
      }
      if (m4t.isSlot) {
        m4t.hidden = true
      }
    }
  })
  if ((m4t = this.right_m) && (t9k = m4t.targetBrick)) {
    ans += t9k.lock()
  }
  if ((m4t = this.suite_m) && (t9k = m4t.targetBrick)) {
    ans += t9k.lock()
  }
  if ((m4t = this.foot_m) && (t9k = m4t.targetBrick)) {
    ans += t9k.lock()
  }
  if (this.hasFocus) {
    var parent = this
    while ((parent = parent.surround)) {
      if (!parent.wrapped_ && !parent.locked_) {
        parent.focusOn()
        break
      }
    }
  }
  ;(this.surround || this).render()
  return ans
}
/**
 * Unlock the given brick.
 * For edython.
 * @param {!eYo.Brick.Dflt} brick The owner of the receiver.
 * @param {boolean} deep Whether to unlock statements too.
 * @return {number} the number of bricks unlocked
 */
eYo.Brick.Dflt.prototype.unlock = function (shallow) {
  var ans = 0
  eYo.Events.fireBrickChange(
      this, eYo.Const.Event.locked, null, this.locked_, false)
  this.locked_ = false
  // list all the input for connections with a target
  var m4t, t9k
  this.forEachSlot(slot => {
    if ((m4t = slot.magnet)) {
      if ((!shallow || m4t.isSlot) && (t9k = m4t.targetBrick)) {
        ans += t9k.unlock(shallow)
      }
      m4t.hidden = false
    }
  })
  if (!shallow && (m4t = this.right_m)) {
  }
  ;(this.surround || this).render()
  return ans
}

/**
 * Whether the brick of the receiver is in the visible area.
 * For edython.
 * @param {!eYo.Brick.Dflt} brick The owner of the receiver.
 * @return {boolean}
 */
eYo.Brick.Dflt.prototype.inVisibleArea = function () {
  var area = this.ui && this.ui.distanceVisible
  return area && !area.x && !area.y
}

Object.defineProperties(eYo.Brick, {
  parent: {
    get () {
      return this.parent__
    },
    /**
     * Set parent of this brick to be a new brick or null.
     * Beware, we cannot replace an already existing parent!
     * @param {?eYo.Brick.Dflt} newParent New parent brick.
     */
    set (newParent) {
      var oldParent = this.parent__
      if (newParent === oldParent) {
        return;
      }
      // First disconnect from parent, if any
      this.parentWillChange(newParent)
      var f = m4t => m4t && m4t.disconnect()
      f(this.head_m)
        || f(this.left_m)
          || f(this.out_m)
      this.parent_ = newParent
      this.parentDidChange(oldParent)
    }
  },
  parent_: {
    get () {
      return this.parent__
    },
    /**
     * Set parent__ of this brick to be a new brick or null.
     * This has a lower level than connecting magnets.
     * If two magnets are linked together, then their bricks
     * are parent and child from each other.
     * The converse is not true.
     * 
     * @param {?eYo.Brick.Dflt} newParent New parent_ brick.
     */
    set (newParent) {
      if (newParent === this.parent__) {
        return;
      }
      if (this.parent__) {
        // Remove this brick from the old parent_'s child list.
        goog.array.remove(this.parent__.children__, this)
        this.parent__ = null
        this.ui.setParent(null)
      } else {
        // Remove this brick from the board's list of top-most bricks.
        this.board.removeBrick(this)
      }
      this.parent__ = newParent
      if (newParent) {
        // Add this brick to the new parent_'s child list.
        newParent.children__.push(this)
      } else {
        this.board.addBrick(this)
      }
      newParent && (this.ui.setParent(newParent))
    }
  }
})

/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 */
eYo.Brick.Dflt.prototype.connectionUiEffect = function() {
  this.ui.connectEffect()
}

/**
 * Brick manager.
 * @param {?string} prototypeName Name of the language object containing
 */
eYo.Brick.Mgr = (() => {
  var me = {}
  var C9rs = Object.create(null)
  /**
   * Helper to initialize a brick's model.
   * to and from are trees.
   * Add to destination all the leafs from source.
   * @param {!Object} to  destination.
   * @param {!Object} from  source.
   */
  var merger = (to, from, ignore) => {
    var from_d
    if ((from.check)) {
      from.check = eYo.Decorate.arrayFunction(from.check)
    } else if ((from_d = from.wrap)) {
      from.check = eYo.Decorate.arrayFunction(from_d)
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
      to.check = eYo.Decorate.arrayFunction(to.check)
    } else if ((to_d = to.wrap)) {
      to.check = eYo.Decorate.arrayFunction(to_d)
    }
  }
  /**
   * Private modeller to provide the constructor with a complete `model` property.
   * @param {!Object} dlgtC9r the constructor of a delegate. Must have an `eyo` namespace.
   * @param {?Object} insertModel  data and inputs entries are merged into the model.
   */
  var modeller = (dlgtC9r, insertModel) => {
    var eyo = dlgtC9r.eyo
    goog.asserts.assert(eyo, 'Forbidden constructor, `eyo` is missing')
    if (eyo.model_) {
      return eyo.model_
    }
    var model = Object.create(null)
    var c = dlgtC9r.superClass_
    if (c && (c = c.constructor) && c.eyo) {
      merger(model, modeller(c))
    }
    if (dlgtC9r.model__) {
      if (goog.isFunction(dlgtC9r.model__)) {
        model = dlgtC9r.model__(model)
      } else if (Object.keys(dlgtC9r.model__).length) {
        merger(model, dlgtC9r.model__)
      }
      delete dlgtC9r.model__
    }
    if (insertModel) {
      insertModel.data && (merger(model.data, insertModel.data))
      insertModel.heads && (merger(model.heads, insertModel.heads))
      insertModel.slots && (merger(model.slots, insertModel.slots))
      insertModel.tails && (merger(model.tails, insertModel.tails))
      insertModel.statement && (merger(model.statement, insertModel.statement))
    }
    // store that object permanently
    dlgtC9r.eyo.model_ = model
    // now change the getModel to return this stored value
    dlgtC9r.eyo.getModel = function () {
      return dlgtC9r.eyo.model_
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
   * In particular, some bricks share a basic do nothing delegate
   * because they are not meant to really exist yet.
   * , , ,  = eYo.NA,  = eYo.Brick.Dlgt,  = false
   * @param {?Object} owner, namespace, `eYo.Brick` when omitted
   * @param {!String} key,  capitalized string, `owner[key]` will be created.
   * @param {!Function} superC9r
   * @param {?Function} dlgtC9r, The constructor of `superC9r` when omitted.
   * @param {?Boolean} register, falsy or truthy values are not supported!, false when omitted.
   * @param {?Object} model
   * @return the constructor created
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
                this.data[k].doChange(newValue)
              }
            }
          )
        }
      }
    }
    var defineSlotProperty = k => {
      var key_s = k + '_s'
      var key_b = k + '_b'
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
        if (!(key_b in this)) {
          // print("Slot property", key, 'for', this.constructor.eyo.key)
          Object.defineProperty(
            this,
            key_b,
            {
              get () {
                var s = this.slots[k] // early call
                if (s) {
                  var m4t = s.magnet
                  if (m4t) {
                    if (m4t.promised_) {
                      m4t.completePromise()
                    }
                    return s.targetBrick
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
    return function (owner, key, superC9r, dlgtC9r, register = false, model) {
      goog.asserts.assert(superC9r.eyo, 'Only subclass constructors with an `eyo` property.')
      if (goog.isString(owner)) {
        // shif arguments
        model = register
        register = dlgtC9r
        dlgtC9r = superC9r
        superC9r = model
        model = key
        key = owner
        owner = (eYo.T3.Expr[key] && eYo.Brick && eYo.Expr) ||
        (eYo.T3.Stmt[key] && eYo.Brick && eYo.Stmt) ||
        eYo.Brick
      }
      if (!eYo.isF(dlgtC9r)) {
        model = register
        register = dlgtC9r
        dlgtC9r = superC9r.eyo.constructor
      }
      if (!goog.isBoolean(register)) {
        model = register
        register = false
      }
      model || (model = {})
/*
   * @param {?Object} owner
   * @param {!String} key
   * @param {!Function} superC9r
   * @param {?Function} dlgtC9r
   * @param {?Boolean} register
   * @param {?Object} model
*/
      if (key.indexOf('eyo:') >= 0) {
        key = key.substring(4)
      }
      owner = owner ||
      (eYo.T3.Expr[key] && eYo.Brick && eYo.Expr) ||
      (eYo.T3.Stmt[key] && eYo.Brick && eYo.Stmt) ||
      superC9r
      var c9r = owner[key] = function (board, type, opt_id) {
        c9r.superClass_.constructor.call(this, board, type, opt_id)
      }
      eYo.Do.inherits(c9r, superC9r)
      var dlgt = new dlgtC9r(c9r, key, model)
      if (!dlgt.getModel) {
        dlgt.getModel = function () {
          return modeller(c9r)
        }
        Object.defineProperty(dlgt, 'model', {
          get () {
            return this.getModel()
          },
          set (after) {
            throw 'Forbidden setter'
          }
        })
      }
      if (!c9r.eyo) {
        console.error('WHERE IS EYO???')
      }
      eYo.Brick.Mgr.register_(eYo.T3.Expr[key] || eYo.T3.Stmt[key] || key, c9r)
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
          linkModel && (merger(model, linkModel))
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
          if (!model.out) {
            model.out = Object.create(null)
          }
          model.out.check = eYo.Decorate.arrayFunction(model.out.check || t)
          model.statement && (model.statement = eYo.NA)
        } else if ((t = eYo.T3.Stmt[key])) {
          var statement = model.statement || (model.statement = Object.create(null))
          var f = (k, type) => {
            var s = statement[k]
            if (goog.isNull(s)) {
              s = statement[k] = Object.create(null)
            } else if (s) {
              if (s.check || goog.isNull(s.check)) {
                s.check = eYo.Decorate.arrayFunction(s.check)
              } else {
                var ch = eYo.T3.Stmt[type][key]
                if (ch) {
                  s.check = eYo.Decorate.arrayFunction()
                }
              }
            }
          }
          f('previous', 'Previous')
          f('next', 'Next')
          f('left', 'Left')
          f('right', 'Right')
          // this is a statement, remove the irrelevant output info
          model.out && (model.out = eYo.NA)
        }
        c9r.model__ = model // intermediate storage used by `modeller` in due time
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
                    && (!goog.isFunction(MD.willUnchange))) {
                      MD.willUnchange = MD.willChange
                  }
                  if (goog.isFunction(MD.didChange)
                    && (!goog.isFunction(MD.didUnchange))) {
                      MD.didUnchange = MD.didChange
                  }
                  if (goog.isFunction(MD.isChanging)
                    && (!goog.isFunction(MD.isUnchanging))) {
                      MD.isUnchanging = MD.isChanging
                  }
                }
                defineDataProperty(k).call(c9r.prototype)
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
                defineSlotProperty(k).call(c9r.prototype)
              }
            }
          }
        }
      }
      c9r.makeSubclass = function (owner_, key_, ...args) {
        return me.makeSubclass(owner_, key_, c9r_, ...args)
      }
      if (register) {
        me.register(key)
      }
      return c9r
    }
}) ()
  /**
   * Delegate instance creator.
   * @param {!eYo.Brick.Dflt} brick
   * @param {?string} prototypeName Name of the language object containing
   */
  me.create = function (board, prototypeName, opt_id) {
    goog.asserts.assert(!goog.isString(brick), 'API DID CHANGE, update!')
    var c9r = C9rs[prototypeName]
    goog.asserts.assert(c9r, 'No class for ' + prototypeName)
    var b3k = c9r && new c9r(board, prototypeName, opt_id)
    return b3k
  }
  /**
   * Get the constructor for the given prototype name.
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
  me.register_ = function (prototypeName, c9r, key) {
    // console.log(prototypeName+' -> '+c9r)
    goog.asserts.assert(prototypeName, 'Missing prototypeName')
    C9rs[prototypeName] = c9r
    // cache all the input, output and statement data at the prototype level
    c9r.eyo.types.push(prototypeName)
  }
  /**
   * Handy method to register an expression or statement brick.
   * @param {key}
   */
  me.register = function (key) {
    var prototypeName
    if ((prototypeName = eYo.T3.Expr[key])) {
      var c9r = eYo.Brick[key]
      var available = eYo.T3.Expr.Available
    } else if ((prototypeName = eYo.T3.Stmt[key])) {
      c9r = eYo.Brick[key]
      available = eYo.T3.Stmt.Available
    } else {
      throw new Error('Unknown brick eYo.T3.Expr or eYo.T3.Stmt key: ' + key)
    }
    me.register_(prototypeName, c9r, key)
    available.push(prototypeName)
  }
  me.registerAll = function (keyedPrototypeNames, c9r, fake) {
    for (var k in keyedPrototypeNames) {
      var name = keyedPrototypeNames[k]
      if (goog.isString(name)) {
        //        console.log('Registering', k)
        me.register_(name, c9r, k)
        if (fake) {
          name = name.replace('eyo:', 'eyo:fake_')
          //          console.log('Registering', k)
          me.register_(name, c9r, k)
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

/**
 * Method to register an expression or a statement brick.
 * The delegate is searched as a Delegate element
 * @param{!string} key  key is the last component of the brick type as a dotted name.
 */
eYo.Brick.Mgr.register = function (key) {
  var prototypeName = eYo.T3.Expr[key]
  var c9r, available
  if (prototypeName) {
    c9r = eYo.Expr[key]
    available = eYo.T3.Expr.Available
  } else if ((prototypeName = eYo.T3.Stmt[key])) {
    // console.log('Registering statement', key)
    c9r = eYo.Stmt[key]
    available = eYo.T3.Stmt.Available
  } else {
    throw new Error('Unknown brick eYo.T3.Expr or eYo.T3.Stmt key: ' + key)
  }
  eYo.Brick.Mgr.register_(prototypeName, c9r)
  available.push(prototypeName)
}

// register this delegate for all the T3 types
eYo.Brick.Mgr.registerAll(eYo.T3.Expr, eYo.Brick.Dflt)
eYo.Brick.Mgr.registerAll(eYo.T3.Stmt, eYo.Brick.Dflt)


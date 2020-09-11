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

eYo.require('decorate')
eYo.require('do')

eYo.require('changer')
eYo.require('data')

eYo.require('xre')
eYo.require('t3')
eYo.require('geom')
eYo.require('do')

eYo.require('event')

eYo.forward('span')
eYo.forward('field')
eYo.forward('slot')
eYo.forward('magnet')

// eYo.forward('expr')
// eYo.forward('stmt')
// eYo.forward('focus')

/**
 * The namespace is expected to contain everything about bricks.
 * Hopefully.
 * @name {eYo.Brick}
 * @namespace
 */
eYo.o4t.newNS(eYo, 'brick')

// eYo.provide('brick.dflt')

;(() => {
  let Mngr = function () {}
  let mngr = new Mngr()
  
  /**
   * Brick manager.
   * Singleton object.
   */
  eYo.brick.Mngr = mngr

  Object.defineProperty(mngr, '_p', {
    get () {
      return this.constructor.prototype
    }
  })
}) ()

/**
 * @name {eYo.Brick}
 * Default class for a brick.
 * Not normally called directly, `eYo.brick.Mngr.Create(...)` is recommanded and `eYo.board` 's `newBrick` method is highly recommanded.
 * Also initialize an implementation model.
 * The underlying state and model are not expected to change while running.
 * When done, the node has all its properties ready to use
 * but their values are not properly setup.
 * The brick may not be in a consistent state,
 * for what it was designed to.
 * For edython.
 * @param {eYo.board} board - the owner of the brick.
 * @param {string} [prototypeName] Name of the language object containing
 *     type-specific functions for this brick.
 * @constructor
 * @readonly
 * @property {object} span - Contains the various extents of the receiver.
 * @readonly
 * @property {object} surroundParent - Get the surround parent.
 * @readonly
 * @property {object} wrapper - Get the surround parent which is not wrapped_.
 */
eYo.brick.makeBaseC3s({
  /**
   * Delegate initializator for bricks.
   * @param {Object} ns -  namespace.
   * @param {String} key -  the key used when the constructor was created.
   * @param {Object} C3s -  the object to which this instance is attached.
   * @param {Object} model -  the model used to create the constructor.
   */
  [eYo.$] () { // eslint-disable-line
    this.types = []
  },
  properties: {
    /** @type {string} */
    parent: {
      willChange(before, after) { // eslint-disable-line
        var f = m4t => m4t && m4t.disconnect()
        f(this.head_m)
          || f(this.left_m)
            || f(this.out_m)
        if (before) {
          // Remove this brick from the old parent_'s child list.
          eYo.do.arrayRemove(before.children__, this)
          this.drvr.parentSet(null)
        } else {
          // Remove this brick from the board's list of top-most bricks.
          this.board.removeBrick(before)
        }
      },
      didChange(before, after) {
        if (after) {
          // Add this brick to the new parent_'s child list.
          after.children__.push(this)
        } else {
          this.board.addBrick(after)
        }
        after && (this.drvr.parentSet(after))
      },
    },
    children: {
      get () {
        return this.children__.slice()
      }
    },
    wrapped: {
      willChange (before, after) {
        if (after && !before) {
          this.duringBrickWrapped()
        } else if (!after && before) {
          this.duringBrickUnwrapped()
        }
      }
    },
    type: {
      get () {
        return this.getBaseType()
      },
    },
    subtype: {
      get () {
        return this.getSubtype()
      },
    },
    slots: eYo.NA,
    magnets: eYo.NA,
    data: eYo.NA,
    span: {
      value () {
        return eYo.span.new(this)
      },
    },
    /**
     * @type{eYo.changer.BaseC3s}
     * @readonly
     */
    change: {
      value () {
        return eYo.changer.new(this)
      },
    },
    inputList: eYo.NA,
    pythonType: eYo.NA,
    deletable: false,
    isEditing: false,
    isComment: false,
    /**
     * Direct descendants.
     */
    isExpr: false,
    isStmt: false,
    isGroup: false,
    /**
     * Whether this brick is main.
     * @type {Boolean}
     * @readonly
     */
    isMain: false,
    editable: true,
    movable: true,
    disabled: {
      /**
       * Set the disable state of the brick.
       * Calls the brick's method but also make sure that previous bricks
       * and next bricks are in an acceptable state.
       * For example, if I disable an if brick, I should also disable
       * an elif/else following brick, but only if it would make an elif/else orphan.
       * For edython.
       * @param {Boolean} after  true to disable, false to enable.
       * @return None
       */
      set_ (after) {
        eYo.event.groupWrap(() => {
          eYo.event.fireBrickChange(
            this, 'disabled', null, this.disabled_, after)
          var previous, next
          if (after) {
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
                  b3k = previous.brick
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
                      b3k.bumpNeighbours_()
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
                      b3k.bumpNeighbours_()
                    }
                    break
                  }
                } while ((next = next.above))
              }
            }
          }
        }, () => {
          this.changeDone()
          this.updateDisabled()
          this.render()
        })
      }
    },
    collapsed: {
      willChange(before, after) {
        // Show/hide the next statement inputs.
        this.slotForEach(slot => slot.visible = !after)
        eYo.event.fireBrickChange(
          this, 'collapsed', null, before, after)
      },
      didChange() {
        this.render()
      }
    },
    depth: 0,
    incog: {
      validate (before, after) {
        if (!before === !after) {
          return before
        }
        if (this.disabled) {
          // enable the brick before enabling its connections
          return before
        }
        return after
      },
      /**
       * Change the incog status.
       * An incog brick won't render.
       * The connections must be explicitely hidden when the brick is incog.
       * @param {Boolean} incog
       */
      didChange(after) {
        this.slotForEach(slot => slot.incog = after) // with incog validator
        var m4t = this.suite_m
        m4t && (m4t.incog = after)
        this.consolidate() // no deep consolidation because connected blocs were consolidated during slot's or connection's incog setter
      },
    },
    /**
     * Lazy list of all the wrapped magnets.
     */
    wrappedMagnets: {
      lazy () {
        return []
      },
      dispose: false,
    },
    /**
     * The receiver's board
     * @type {eYo.board}
     */
    surround: {
      get () {
        var b3k
        if ((b3k = this.out)) {
          return b3k
        } else if ((b3k = this.leftMost)) {
          return b3k.group
        }
        return null
      },
    },
    group: {
      get () {
        var b3k = this.owner
        var ans
        while ((ans = b3k.head)) {
          if (ans.suite === b3k) {
            return ans
          }
          b3k = ans
        }
      },
    },
    wrapper: {
      get () {
        var ans = this.owner
        while (ans.wrapped_) {
          var parent = ans.parent
          if (parent) {
            ans = parent
          } else {
            break
          }
        }
        return ans
      },
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
      },
    },
    /**
     * Return the parent which is a statement, if any.
     * Never returns `this`.
     */
    stmtParent: {
      get () {
        var ans = this.owner
        do {
          ans = ans.parent
        } while (ans && !ans.isStmt)
        return ans
      },
    },
    out: {
      get () {
        var m = this.out_m
        return m && m.targetBrick
      },
      set (after) {
        var m = this.out_m
        m && (m.targetBrick_ = after)
      }
    },
    head: {
      get () {
        var m = this.head_m
        return m && m.targetBrick
      },
      set (after) {
        var m = this.head_m
        m && (m.targetBrick_ = after)
      }
    },
    left: {
      get () {
        var m = this.left_m
        return m && m.targetBrick
      },
      set (after) {
        var m = this.left_m
        m && (m.targetBrick_ = after)
      }
    },
    right: {
      get () {
        var m = this.right_m
        return m && m.targetBrick
      },
      set (after) {
        var m = this.right_m
        m && (m.targetBrick_ = after)
      }
    },
    suite: {
      get () {
        var m = this.suite_m
        return m && m.targetBrick
      },
      set (after) {
        var m = this.suite_m
        m && (m.targetBrick_ = after)
      }
    },
    foot: {
      get () {
        var m = this.foot_m
        return m && m.targetBrick
      },
      set (after) {
        var m = this.foot_m
        m && (m.targetBrick_ = after)
      }
    },
    leftMost: {
      get () {
        var ans = this.owner
        var b3k
        while ((b3k = ans.left)) {
          ans = b3k
        }
        return ans
      },
    },
    headMost: {
      get () {
        var ans = this.oner
        var b3k
        while ((b3k = ans.head)) {
          ans = b3k
        }
        return ans
      },
    },
    rightMost: {
      get () {
        var ans = this.owner
        var b3k
        while ((b3k = ans.right)) {
          ans = b3k
        }
        return ans
      },
    },
    footMost: {
      get () {
        var ans = this.owner
        var b3k
        while ((b3k = ans.foot)) {
          ans = b3k
        }
        return ans
      },
    },
    rightComment: {
      get () {
        var b = this.right
        return b && b.isComment ? b : eYo.NA
      },
    },
    /**
     * Return the topmost enclosing brick in this brick's tree.
     * May return `this`.
     * @return {!eYo.Brick} The root brick.
     */
    root: {
      get () {
        var ans = this.owner
        var parent
        while ((parent = ans.parent)) {
          ans = parent
        }
        return ans
      },
    },
    /**
     * Return the statement after the receiver.
     * @return {!eYo.Brick} The root brick.
     */
    after: {
      get () {
        let o = this.owner
        var b3k = o.isStmt ? o : o.stmtParent
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
      }
    },
    lastSlot: {
      get () {
        var ans = this.slotAtHead
        if (ans) {
          while (ans[eYo.$next]) {
            ans = ans[eYo.$next]
          }
        }
        return ans
      },
    },
    /**
     * Return the enclosing brick in this brick's tree
     * which is a control. May be null. May be different from the `root`.
     * @return {?eYo.Brick} The root brick.
     */
    rootControl: {
      get () {
        var ans = this.owner
        while (!ans.isControl && (ans = ans.parent)) {} // eslint-disable-line
        return ans
      },
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
      },
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
      },
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
      },
    },
    /**
     * @readonly
     * @type {Boolean} Whether this brick is top most, meaning the first one
     * in a block of instructions. True iff it is the suite of a there is no brick above nor to the left
     */
    isTop: {
      get () {
        return this.isSuite || (this.isStmt && !this.isFoot)
      },
    },
    /**
     * Find all the bricks that are directly or indirectly nested inside this one.
     * Includes this brick in the list.
     * Includes value and brick inputs, as well as any following statements.
     * Excludes any connection on an output tab or any preceding statements.
     * @type {!Array<!eYo.brick>} Flattened array of brick.
     */
    descendants: {
      get () {
        var ans = [this.owner]
        this.children__.forEach(d => ans.push.apply(ans, d.descendants))
        return ans
      },
    },
    /**
     * Compute a list of the IDs of the specified brick and all its descendants.
     * @param {eYo.Brick} brick The root brick.
     * @return {!Array<string>} List of brick IDs.
     * @private
     */
    descendantIds: {
      get () {
        return this.descendants.map(b3k => b3k.id)
      },
    },
    /**
     * Same as `descendants` property except that it
     * includes the receiver in the list only when not sealed.
     * @return {!Array<!eYo.brick>} Flattened array of brick.
     */
    wrappedDescendants: {
      get () {
        var ans = []
        if (!this.wrapped_) {
          ans.push(this)
        }
        this.childForEach(b => ans.push.apply(ans, b.wrappedDescendants))
        return ans    
      },
    },
    /**
     * Freeze the change step while editing.
     * @type{Boolean}
     * @readonly
     */
    changeStepFreeze: {
      get () {
        return this.isEditing
      },
    },
    uiHasSelect: {
      get () {
        return this.ui && this.ui.hasSelect
      },
    },
    ui: eYo.NA,
  },
  aliases: {
    owner: 'board',
    'span.width': 'width',
    'span.height': 'height',
    'board.recover': 'recover',
    'magnets.out': 'out_m',
    'magnets.head': 'head_m',
    'magnets.left': 'left_m',
    'magnets.right': 'right_m',
    'magnets.suite': 'suite_m',
    'magnets.foot': 'foot_m',
    /**
     * Position of the receiver in the board.
     * @type {eYo.geom.Point}
     * @readonly
     */
    'ui.xy': ['xy', 'where'],
    //'': '',
  },
  init (board, type, opt_id) {
    try {
      /** @type {string} */
      this.baseType_ = type // readonly private property used by getType
      // next trick to avoid some costy computations
      // this makes sense because subclassers may use a long getBaseType
      // which is oftenly used
      this.getBaseType = eYo.Brick_p.getBaseType // no side effect during creation due to inheritance.

      // private properties
      this.children__ = []
      // to manage reentrency
      this.reentrant_ = Object.create(null)
      // to manage errors
      this.errors = Object.create(null)

      // make the state
      eYo.event.disableWrap(() => {
        this.changer.wrap(() => {
          this.makeMagnets()
          this.makeData()
          this.makeFields()
          this.makeSlots()
          // now make the bounds between data and fields
          this.makeBounds()
          // initialize the data
          this.dataForEach(data => data.init())
          // At this point the state value may not be consistent
          this.consolidate()
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
    if (eYo.event.enabled) {
      eYo.event.fire(new eYo.event.BrickDelete(this))
    }
    // Stop rerendering.
    this.ui_ && (this.ui_.rendered = false)
    this.consolidate = this.initUI = this.render = eYo.doNothing
    // Remove from board
    board.removeBrick(this)
    this.wrappedMagnets_ && (this.wrappedMagnets_.length = 0)
    eYo.event.disableWrap(() => {
      this.disposeSlots(healStack)
      this.disposeMagnets()
      this.disposeFields()
      this.disposeData()
      this.inputList_ = eYo.NA
      this.slotList_ = eYo.NA
      this.children__ = eYo.NA
    })
    this.board.resizePort()
  },
  methods: {
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
    changeDone (deep) { // eslint-disable-line
      this.changer.done()
    },
    /**
     * Begin a mutation.
     * The change level is used to keep track of the cascading mutations.
     * When mutations imply other mutations, there is no need to perform some actions until the original mutation is complete.
     * For example, rendering should not be done until all the mutations are made.
     * Changes not only concern the data, they may concern the
     * slot visibility too.
     * For edython.
     */
    changeBegin () {
      this.change_.begin()
    },
    /**
     * When a change is done.
     * For edython.
     * @param {*} deep  Whether to propagate the message to children.
     */
    onChangeDone (deep) {
      if (deep) {
        this.childForEach(b3k => b3k.changeDone(deep))
      }
    },
    /**
     * Ends a mutation.
     * When a change is complete at the top level,
     * the change count is incremented and the receiver
     * is consolidated.
     * This is the only place where consolidation should occur.
     * For edython.
     */
    changeEnd () {
      this.render()
    },

    /**
     * Called when data and slots will load.
     * First send an eponym message to both the data and slots,
     * then use the model's method if any.
     */
    willLoad () {
      this.dataForEach(data => data.willLoad())
      this.slotForEach(slot => slot.willLoad())
      var willLoad = this.model.willLoad
      if (eYo.isF(willLoad)) {
        willLoad.call(this)
      }
    },

    /**
     * Called when data and slots have loaded.
     */
    didLoad () {
      this.dataForEach(data => data.didLoad())
      this.slotForEach(slot => slot.didLoad())
      var didLoad = this.model.didLoad
      if (eYo.isF(didLoad)) {
        didLoad.call(this)
      }
      this.changeDone()
    },

    /**
     * Tests if two bricks are equal.
     * Bricks must be of the same type.
     * Lists and dictionaries are managed differently.
     * Usefull for testing purposes for example.
     * @param {eYo.Brick} [rhs]  Another brick
     */
    equals (rhs) {
      var equals = rhs && (this.type == rhs.type)
      if (equals) {
        this.dataForEach(data => {
          var r_data = rhs.data[data.key]
          equals = r_data && (data.get() == r_data.get() || (data.incog && r_data.incog))
          return equals // breaks if false
        })
        if (equals) {
          this.slotForEach(slot => {
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
    },

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
     * @param {Boolean} [deep]
     * @param {Boolean} [force]
     * @return {Boolean} true when consolidation occurred
     */
    doConsolidate (deep, force) {
      if (!force && (!eYo.event.recordingUndo || !this.board || this.change_.level > 1)) {
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
    },

    /**
     * Wraps `doConsolidate` into a reentrant and `change.count` aware method.
     * @param{Boolean} deep
     * @param{Boolean} force
     */
    consolidate (deep, force) {
      this.consolidate = eYo.doNothing
      try {
        eYo.changer.memoize(
          'consolidate',
          this.doConsolidate.bind(this)
        ) (deep, force)
      } finally {
        delete this.consolidate
      }
    },
    /**
     * getType.
     * The default implementation just returns the brick type.
     * This should be used instead of direct brick querying.
     * @return {String} The type of the receiver's brick.
     */
    getType () {
      return this.baseType_
    },

    /**
     * getSubtype.
     * The default implementation just returns the variant,
     * when it exists.
     * Subclassers will use it to return the correct type
     * depending on their actual inner state.
     * This should be used instead of direct brick querying.
     * @return {String} The subtype of the receiver's brick.
     */
    getSubtype () {
      return this.Variant_p
    },

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
    getBaseType () {
      return this.baseType_ // no this.type because of recursion
    },

    /**
     * execute the given function for the head slot of the receiver and its next sibling.
     * If the return value of the given function is true,
     * then it was the last iteration and the loop nreaks.
     * For edython.
     * @param {function} helper
     * @return {Object} The first slot for which helper returns true
     */
    slotSome (helper) {
      var slot = this.slotAtHead
      return slot && slot.some(helper)
    },

    /**
     * execute the given function for the head slot of the receiver and its next sibling.
     * For edython.
     * @param {function} helper
     * @return {boolean} whether there was an slot to act upon or a valid helper
     */
    slotForEach (helper) {
      var slot = this.slotAtHead
      slot && slot.forEach(helper)
    },

    /**
     * execute the given function for the tail slot of the receiver and its previous sibling.
     * For edython.
     * @param {function} helper
     */
    slotForEachReverse (helper) {
      var slot = this.slotAtHead
      if (slot) {
        while(slot[eYo.$next]) {
          slot = slot[eYo.$next]
        }
        slot.forEachPrevious(helper)
      }
    },

    // various forEach convenient methods
    /**
     * execute the given function for the fields.
     * For edython.
     * @param {function} helper
     */
    fieldForEach (helper) {
      Object.values(this.fields).forEach(f => helper(f))
    },

    /**
     * Execute the helper for each child.
     * Works on a shallow copy of `children__`.
     */
    childForEach (helper) {
      this.children__.slice().forEach((b, i, ra) => helper(b, i, ra))
    },

    /**
     * execute the given function for the head data of the receiver and its next sibling.
     * Ends the loop as soon as the helper returns true.
     * For edython.
     * @param {function} helper
     * @return {boolean} whether there was a data to act upon or a valid helper
     */
    dataForEach (helper) {
      var data = this.headData
      if (data && eYo.isF(helper)) {
        var last
        do {
          last = helper(data)
        } while (!last && (data = data[eYo.$next]))
        return !!last
      }
    },

    /**
     * Execute the helper for each magnet, either superior or inferior.
     * @param {Boolean} all - Optional. Partial bypass when false or not rendered. 
     * @param {Function} helper - helper is a function with signature (eYo.magnet) -> eYo.NA
     */
    magnetForEach (all, helper) {
      if (!helper) {
        helper = all
        all = true
      }
      if (all || this.ui.rendered) {
        Object.values(this.magnets).forEach(helper)
        if (all || !this.collapsed_) {
          this.slotForEach(s => s.magnet && helper(s.magnet))
        }
      }
    },

    /**
     * Execute the helper for all the statements.
     * Deep first traversal.
     * @param {Function} helper  helper has signature `(brick, depth) -> eYo.NA`
     * @return the truthy value from the helper.
     */
    stmtForEach (helper) {
      var e8r = this.statementEnumerator()
      var b3k
      while ((b3k = e8r[eYo.$next])) {
        helper(b3k, e8r.depth)
      }
    },

    /**
     * Bind data and fields.
     * We assume that if data and fields share the same name,
     * they must be bound, otherwise we would have chosen different names...
     * if the data model contains an initializer, use it,
     * otherwise send an init message to all the data controllers.
     */
    makeBounds () {
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
            slot.fieldForEach(f => {
              if (f.editable) {
                eYo.assert(!candidate, 'Ambiguous slot <-> data bound (too many editable fields)')
                candidate = f
              }
            })
          }
        } else if ((data.field = this.fields[k])) {
          data.slot = null
        } else {
          this.slotSome(slot => {
            if ((data.field = slot.fields[k])) {
              eYo.assert(!slot.data, `Ambiguous slot <-> data bound ${data.key}, ${slot.data && slot.data.key}`)
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
    },

    /**
     * Set the data values from the type.
     * One brick implementation may correspond to different types,
     * For example, there is one implementation for all the primaries.
     * @param {String} type
     */
    setDataWithType (type) {
      this.dataForEach(data => data.fromType(type))
    },

    /**
     * Set the data values from the model.
     * @param {Object} model
     * @return {boolean} whether the model was really used.
     */
    setDataWithModel (model, noCheck) {
      var done = false
      this.dataForEach(data => data.required_from_model_ = false)
      this.changer.wrap(() => {
        var data_in = model.data
        if (eYo.isStr(data_in) || eYo.isNum(data_in)) {
          var d = this.main_d
          if (d && !d.incog && d.validate(data_in)) {
            d.doChange(data_in)
            d.required_from_model_ = true
            done = true
          } else {
            this.dataForEach(d => {
              if (d.model.xml !== false && !d.incog && d.validate(data_in)) {
                // if (done) {
                //   console.error('Ambiguous model', this.type, data_in)
                //   this.dataForEach(d => {
                //     if (d.model.xml !== false && !d.incog && d.validate(data_in)) {
                //       console.log('candidate:', d.key)
                //     }
                //   })
                // }
                eYo.assert(!done, `Ambiguous data model ${d.key} / ${data_in}: ${done}`)
                d.doChange(data_in)
                d.required_from_model_ = true
                done = d.key
              }
            })
          }
        } else if (eYo.isDef(data_in)) {
          this.dataForEach(data => {
            var k = data.key
            if (eYo.objectHasOwnProperty(data_in, k)) {
              data.set(data_in[k])
              data.required_from_model_ = true
              done = true
            } else {
              k = k + '_placeholder'
              if (eYo.objectHasOwnProperty(data_in, k)) {
                data.required_from_model_ = true
                // change the place holder in the objects's model
                var m = {}
                eYo.do.mixin(m, data.model)
                m.placeholder = data_in[k]
                data.model = m
                done = true
              }
            }
          })
          if (!noCheck) {
            for (var k in data_in) {
              if (eYo.objectHasOwnProperty(data_in, k)) {
                var D = this.data[k]
                if (!D) {
                  console.warn('Unused data:', this.type, k, data_in[k])
                }
              }
            }
          }
        }
        this.dataForEach(data => {
          var k = data.key + '_p'
          if (eYo.objectHasOwnProperty(model, k)) {
            data.set(model[k])
            done = true
            data.required_from_model_ = true
          }
          k = data.key + '_placeholder'
          if (eYo.objectHasOwnProperty(model, k)) {
            data.customizePlaceholder(model[k])
          }
        })
      })
      return done
    },

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
    synchronizeData () {
      this.dataForEach(data => data.synchronize())
      this.synchronizeData = eYo.doNothing
    },

    /**
     * Disposing of the data ressources.
     */
    disposeData () {
      this.dataForEach(data => data.dispose())
      this.data_ = eYo.NA
    },

    /**
     * Make the Fields.
     * No rendering.
     * For edython.
     */
    makeFields () {
      eYo.field.makeFields(this, this.model.fields)
    },

    /**
     * Dispose of the fields.
     * For edython.
     */
    disposeFields () {
      eYo.field.disposeFields(this)
    },

    /**
     * Make the slots
     * For edython.
     */
    makeSlots: (() => {
      let feedSlots = { $ (slotsModel) {
        var slots = this.slots
        var ordered = []
        for (let [k, m] of Object.entries(slotsModel)) {
          if (!m) {
            continue
          }
          var order = m.order
          var insert = m.insert
          var slot, next
          if (insert) {
            m = eYo.model.forKey(insert)
            if (m) {
              if ((slot = feedSlots.call(this, m.slots))) {
                next = slot
                do {
                  eYo.isDef(slots[next.key]) || eYo.throw(`Duplicate inserted slot key ${next.key}/${insert}/${slot.type}`)
                  slots[next.key] = next
                } while ((next = next[eYo.$next]))
              } else {
                continue
              }
            } else {
              continue
            }
          } else if (eYo.isObject(m) && (slot = new eYo.slot.BaseC3s(this, k, m))) {
            eYo.assert(!eYo.isDef(slots[k]),
              `Duplicate slot key ${k}/${this.type}`)
            slots[k] = slot
            slot.slots = slots
          } else {
            continue
          }
          slot.order = order
          for (var i = 0; i < ordered.length; i++) {
            // we must not find an aleady existing entry.
            eYo.assert(i !== slot.order,
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
            slot[eYo.$next] = next
            next[eYo.$previous] = slot
            slot = next
          }
          ordered[0].last = slot
        }
        return ordered[0]
      }}.$
      return {$ () {
        this.slots_ = Object.create(null) // hard to create all the slots at once, like data.
        this.slotAtHead = feedSlots.call(this, this.model.slots)
      }}.$
    })(),
    /**
     * Dispose the slots
     * For edython.
     * @param {Boolean} [healStack]  Dispose of the inferior target iff healStack is a falsy value
     */
    disposeSlots (healStack) {
      this.slotForEach(slot => slot.dispose(healStack))
      this.slots_ = null
    },
    /**
     * Create the brick magnets.
     * For subclassers eventually
     */
    makeMagnets () {
      this.magnets_ = new eYo.magnet.S(this)
    },
    /**
     * Create the brick magnets.
     * For subclassers eventually
     */
    disposeMagnets () {
      this.magnets_ = this.magnets_.dispose()
    },
    /**
     * Set the [python ]type of the delegate and its brick.
     * The only accepted types are the ones of
     * the constructor's delegate's `type` method.
     * NEVER call this directly, except if you are a brick.
     * No need to override this.
     * @param {string} [optNewType] -
     * @private
     */
    setupType (optNewType) {
      if (!optNewType && !this.type && !eYo.test && !eYo.test.no_brick_type) {
        console.error('Error!')
      }
      if (this.type_ === optNewType) {
        return
      }
      if (optNewType === eYo.t3.expr.unset) {
        console.error('C\'est une erreur!')
      }
      optNewType && (this.constructor[eYo.$].types.indexOf(optNewType) >= 0) && (this.pythonType_ = this.type_ = optNewType)
    },

    /**
     * Synchronize the slots with the UI.
     * Sends a `synchronize` message to all slots.
     * May be used at the end of an initialization process.
     */
    synchronizeSlots () {
      this.slotForEach(slot => slot.synchronize())
    },

    /**
     * Some bricks may change when their properties change.
     * Consolidate the data.
     * Only used by `consolidate`.
     * Should not be called directly, but may be overriden.
     * For edython.
     * @param {string} [type] Name of the new type.
     */
    consolidateData () {
      this.dataForEach(data => data.consolidate())
    },

    /**
     * Some bricks may change when their properties change.
     * Consolidate the slots.
     * Only used by `consolidate`.
     * Should not be called directly, but may be overriden.
     * For edython.
     * @param {Boolean} [deep]
     * @param {Boolean} [force]
     */
    consolidateSlots (deep, force) {
      this.slotForEach(slot => slot.consolidate(deep, force))
      // some child bricks may be disconnected as side effect
    },

    /**
     * Some bricks may change when their properties change.
     * For edython.
     * This is one of the main methods.
     * The type depends on both the properties of the brick and the connections.
     * There might be problems when a parent brick depends on the child
     * and vice versa. This is something that we must avoid.
     * See assignment_chain.
     */
    consolidateType () {
      if (this.board) {
        this.setupType(this.getType())
        if (this.wrapped_) {
          var p = this.parent
          p && (p.consolidateType())
        }
      }
    },

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
     * Sent by `doConsolidate` and various `onChange` methods.
     */
    consolidateMagnets () {
      this.completeWrap_()
      var f = m4t => {
        m4t && (m4t.updateCheck())
      }
      this.slotForEach(slot => f(slot.magnet))
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
    },
    /**
     * Unplug this brick from its superior brick.  If this brick is a statement,
     * optionally reconnect the brick underneath with the brick on top.
     * @param {boolean=} opt_healStack Disconnect child statement and reconnect
     *   stack.  Defaults to false.
     */
    unplug (opt_healStack, animate) {
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
      animate && (this.disposeEffect())
    },

    /**
     * Initialize a brick.
     * Called from brick's init method.
     * This should be called only once.
     * The underlying model is not expected to change while running.
     * Call's the model's `init` method if any.
     * This is always called at creation time such that it must
     * be executed outside of any undo management.
     */
    init () {
    },

    /**
    * Deinitialize a brick. Calls the model's `deinit` method is any.
    * @constructor
    */
    deinit () {
      this.model.deinit && (this.model.deinit.call(this))
    },

    /**
     * Adds a magnet to later wrapping.
     * @param {eYo.magnet.BaseC3s} magnet  The magnet that should connect to a wrapped brick.
     */
    addWrapperMagnet (magnet) {
      magnet && (this.wrappedMagnets.push(magnet))
    },

    /**
     * Adds a magnet to later wrapping.
     * @param {eYo.magnet.BaseC3s} magnet  The magnet that should connect to a wrapped brick.
     */
    removeWrapperMagnet (magnet) {
      var i = this.wrappedMagnets.indexOf(magnet)
      if (i>=0) {
        this.wrappedMagnets.splice(i)
      }
    },

    /**
     * If the sealed connections are not connected,
     * create a node for it.
     * The default implementation connects all the bricks from the wrappedMagnets_ list.
     * Subclassers will eventually create appropriate new nodes
     * and connect it to any sealed connection.
     * @private
     */
    completeWrap_ () {
      if (this.wrappedMagnets_) {
        var i = 0
        while (i < this.wrappedMagnets_.length) {
          var d = this.wrappedMagnets_[i]
          var ans = d.completeWrap()
          if (eYo.isVALID(ans)) {
            this.wrappedMagnets_.splice(i)
          } else {
            ++i
          }
        }
      }
    },

    /**
     * The default implementation does nothing.
     * Subclassers will override this but no one will call it.
     * @private
     */
    duringBrickWrapped () {
      this.uiHasSelect && eYo.throw('Deselect brick before')
      this.updateWrapped()
    },
    /**
     * The default implementation is false.
     * Subclassers will override this but won't call it.
     */
    canUnwrap () {
      return false
    },

    /**
     * The default implementation does nothing.
     * Subclassers will override this but won't call it.
     * @private
     */
    duringBrickUnwrapped () {
      this.updateWrapped()
    },

    /**
     * Will connect this brick's connection to another connection.
     * @param {eYo.magnet.BaseC3s} m4t
     * @param {eYo.magnet.BaseC3s} childM4t
     */
    willConnect (m4t, childM4t) { // eslint-disable-line
    },

    /**
     * Did connect this brick's magnet to another magnet.
     * @param {eYo.magnet.BaseC3s} m4t what has been connected in the brick
     * @param {eYo.magnet.BaseC3s} oldTargetM4t what was previously connected in the brick
     * @param {eYo.magnet.BaseC3s} targetOldM4t what was previously connected to the new magnet
     */
    didConnect (m4t, oldTargetM4t, targetOldM4t) { // eslint-disable-line
      // new connections change the span properties of the superior block.
      // How many lines did I add? where did I add them?
      var t9k = m4t.targetBrick
      if (m4t.isFoot) {
        this.span.addFoot(t9k.span.l)
      } else if (m4t.isSuite) {
        this.span.black = 0
        this.span.addSuite(t9k.span.l)
      } else if (m4t.isRight) {
        this.span.resetPadding() && m4t.brick.updateShape()
      }
      this.consolidateType()
      if (m4t.isSlot && m4t.hasFocus) {
        t9k.focusOn()
      }
    },

    /**
     * Will disconnect this brick's connection.
     * @param {eYo.magnet.BaseC3s} m4t
     */
    willDisconnect (m4t) { // eslint-disable-line
    },

    /**
     * Did disconnect this receiver's magnet from another magnet.
     * @param {eYo.magnet.BaseC3s} m4t  
     * @param {eYo.magnet.BaseC3s} oldTargetM4t  that was connected to m4t
     */
    didDisconnect (m4t, oldTargetM4t) {
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
    },

    /**
     * Can remove and bypass the parent?
     * If the parent's output connection is connected,
     * can connect the brick's output connection to it?
     * The connection cannot always establish.
     * @param {eYo.Brick} other  the brick to be replaced
     */
    canReplaceBrick (other) { // eslint-disable-line
      return false
    },

    /**
     * Returns the total number of code lines for that node and the node below.
     * One atomic instruction is one line.
     * In terms of grammar, it counts the number of simple statements.
     * @return {Number}.
     */
    getStatementCount () {
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
          } while ((t9k = t9k[eYo.$next]))
        }
      }
      return n + (hasNext && !hasActive ? 1 : 0)
    },

    /**
     * Runs the helper function for some input connection, until it responds true
     * For edython.
     * @param {Function} helper
     * @return {Object} returns the first connection for which helper returns true or the helper return value
     */
    slotSomeMagnet (helper) {
      return this.slotSome(slot => {
        var m4t = slot.magnet
        return m4t && (helper(m4t))
      })
    },

    /**
     * Set the error
     * For edython.
     * @param {eYo.Brick} brick The owner of the receiver.
     * @param {string} key
     * @param {string} msg
     * @return true if the given value is accepted, false otherwise
     */
    setError (key, msg) {
      this.errors[key] = {
        message: msg
      }
    },

    /**
     * get the error
     * For edython.
     * @param {eYo.Brick} brick The owner of the receiver.
     * @param {string} key
     * @return true if the given value is accepted, false otherwise
     */
    getError (key) {
      return this.errors[key]
    },

    /**
     * get the error
     * For edython.
     * @param {eYo.Brick} brick - The owner of the receiver.
     * @param {string} key
     * @return true if the given value is accepted, false otherwise
     */
    removeError (key) {
      delete this.errors[key]
    },

    /**
     * get the slot magnets, mainly for debugging purposes.
     * For edython.
     * @return An array of all the magnets
     */
    getSlotMagnets () {
      var ra = []
      this.slotForEach(slot => slot.magnet && (ra.push(slot.magnet)))
      return ra
    },

    /**
     * get the slot connections, mainly for debugging purposes.
     * For edython.
     * @param {eYo.Brick}brick
     * @return the given brick
     */
    footConnect (brick) {
      this.foot_m.connect(brick.head_m)
      return brick
    },

    /**
     * Connect the magnet of the `lastSlot`, to the given expression brick/magnet/type.
     * @param {eYo.brick|eYo.magnet|String} bdct  brick, magnet or type
     * @return {?eYo.Brick}  The connected brick, if any.
     */
    connectLast (bmt) {
      var other = (bmt.magnets && bmt.out_m) || (bmt instanceof eYo.magnet && bmt) || eYo.brick.newReady(this, bmt).out_m
      if (other) {
        var m4t = this.lastSlot.magnet
        if (m4t.checkType_(other)) {
          m4t.connect(other)
          return m4t.target === other ? m4t.targetBrick : eYo.NA
        }
      }
    },

    /**
     * Scrolls the receiver to the top left part of the board.
     * Does nothing if the brick is already in the visible are,
     * and is not forced.
     * @param {Boolean} force  flag
     */
    scrollToVisible (force) {
      if (!this.inVisibleArea || force) {
        this.board.scrollBrickTopLeft(this.id)
      }
    },
    /**
     * Returns connections originating from this brick.
     * @param {boolean} all If true, return all connections even hidden ones.
     *     Otherwise, for a non-rendered brick return an empty list, and for a
     *     collapsed brick don't return inputs connections.
     * @return {!Array<!eYo.magnet>} Array of magnets.
     */
    getMagnets_ (all) {
      var ans = []
      if (all || this.ui.rendered) {
        Object.values(this.magnets).forEach(m4t => ans.push(m4t))
        if (all || !this.collapsed_) {
          this.slotForEach(slot => ans.push(slot.magnet))
        }
      }
      return ans
    },
    /**
     * Whether the receiver is movable.
     */
    isMovable () {
      return !this.wrapped_ && this.movable_ &&
      !(this.board && this.board.options.readOnly)
    },
    /**
     * Set whether the receiver is collapsed or not.
     * @param {boolean} collapsed True if collapsed.
     */
    setCollapsed (collapsed) {
      this.collapsed = collapsed
    },
    /**
     * Move a brick assuming according to its `xy` property.
     */
    move () {
      this.drvr.moveTo(this, this.xy)
    },
    /**
     * Render the brick.
     * Lays out and reflows a brick based on its contents and settings.
     */
    // deleted bricks are rendered during deletion
    // this should be avoided
    /**
     * Render the brick. Real function.
     */
    render_ () {
      this.drvr.render(this)
    },
    updateDisabled_ () {
      this.drvr.updateDisabled_(this)
      this.children.forEach(child => child.updateDisabled())
    },
    /**
     * Called when the parent will just change.
     * This code is responsible to place the various path
     * in the proper domain of the dom tree.
     * @param {eYo.Brick} newParent to be connected.
     */
    parentWillChange: eYo.doNothing,
    /**
     * Called when the parent will just change.
     * This code is responsible to place the various path
     * in the proper domain of the dom tree.
     * @param {eYo.Brick} oldParent that was disConnected.
     */
    parentDidChange: eYo.doNothing,
    /**
     * Returns the named field from a brick.
     * Only fields that do not belong to an input are searched for.
     * @param {string} name The name of the field.
     * @return {eYo.field} Named field, or null if field does not exist.
     */
    getField (name) {
      var ans = null
      var f = F => Object.values(F).some(f => (f.name === name) && (ans = f))
      if (f(this.fields)) return ans
      var slot
      if ((slot = this.slotAtHead)) {
        do {
          if (f(slot.fields)) return ans
        } while ((slot = slot[eYo.$next]))
      }
      this.slotSome(slot => slot.fieldRow.some(f => (f.name === name) && (ans = f)))
      return ans
    },

    /**
     * When the brick is just a wrapper, returns the wrapped target.
     */
    getMenuTarget () {
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
    },
    /**
     * Fetches the named slot object.
     * @param {String} name The name of the input.
     * @return {eYo.slot.BaseC3s} The slot object, or null if input does not exist. Input that are disabled are skipped.
     */
    getSlot (name) {
      return this.slotSome(slot => slot.name === name)
    },

    /**
     * Class for a statement brick enumerator.
     * Deep first traversal.
     * Starts with the given brick.
     * The returned object has next and depth messages.
     */
    statementEnumerator () {
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
          me.parents.push(me.current)
          return (me.current = ans)
        }
        if ((ans = me.current.foot)) {
          return (me.current = ans)
        }
        var b3k
        while ((b3k = me.parents.pop())) {
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
    },

    /**
     * Execute the helper until one answer is a truthy value.
     * Deep first traversal.
     * @param {Function} helper  helper has signature `(block, depth) -> truthy`
     * @return the truthy value from the helper if it is not `true`, the brick chosen otherwise.
     */
    someStatement (helper) {
      var e8r = this.statementEnumerator()
      var b3k
      var ans
      while ((b3k = e8r[eYo.$next])) {
        if ((ans = helper(b3k, e8r.depth))) {
          return ans === true ? b3k : ans
        }
      }
    },


    /**
     * When setup is finish.
     * The state has been created, some expected connections are created
     * This is a one shot function.
     * @param {boolean} headless  no op when false
     */
    initUI () {
      this.changer.wrap(() => {
        this.ui_ = new eYo.brick.UI(this)
        this.fieldForEach(field => field.initUI())
        this.slotForEach(slot => slot.initUI())
        ;[this.suite_m,
          this.right_m,
          this.foot_m
        ].forEach(m => m && m.initUI())
        this.dataForEach(data => data.synchronize()) // data is no longer headless
        this.magnets.initUI()
        this.updateShape()
        delete this.render
      })
      this.initUI = eYo.doNothing
      delete this.disposeUI
    },

    /**
     * Dispose of the ui resource.
     */
    disposeUI (healStack, animate) { // eslint-disable-line
      this.disposeUI = eYo.doNothing
      this.changer.wrap(() => {
        this.render = eYo.doNothing
        this.fieldForEach(field => field.disposeUI())
        this.slotForEach(slot => slot.disposeUI())
        this.magnets.disposeUI()
        this.ui_ && (this.ui_.dispose() && (this.ui_ = null))
      })
      delete this.initUI
    },

    /**
     * Returns the python type of the brick.
     * This information may be displayed as the last item in the contextual menu.
     * Wrapped bricks will return the parent's answer.
     */
    getPythonType () {
      if (this.wrapped_) {
        return this.parent.getPythonType()
      }
      return this.pythonType_
    },

    /**
     * Insert a parent.
     * If the brick's output connection is connected,
     * connects the parent's output to it.
     * The connection cannot always establish.
     * The holes are filled.
     * @param {Object} model - for subclassers
     * @return {?eYo.Brick} the created brick
     */
    insertParentWithModel (model) { // eslint-disable-line
      eYo.assert(false, 'Must be subclassed')
    },

    /**
     * Insert a brick of the given type.
     * For edython.
     * @param {Object|string} model
     * @param {eYo.magnet.BaseC3s} m4t
     * @return {?eYo.Brick} the brick that was inserted
     */
    insertBrickWithModel (model, m4t) {
      if (!model) {
        return null
      }
      // get the type:
      var p5e = eYo.t3.profile.get(model, null)
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
      eYo.event.disableWrap(
        () => {
          var m4t, otherM4t
          candidate = eYo.brick.newReady(this, model)
          var fin = prepare => {
            eYo.event.groupWrap(() => {
              eYo.event.enableWrap(() => {
                eYo.do.tryFinally(() => {
                  eYo.event.fireBrickCreate(candidate)
                  prepare && prepare()
                  otherM4t.connect(m4t)
                }, () => {
                  this.app.focus_mngr.brick = candidate
                  candidate.render()
                  candidate.bumpNeighbours_()
                })
              })
            })
            return candidate
          }
          if (!candidate) {
            // very special management for tuple input
            if ((otherM4t = eYo.focus.magnet) && eYo.isStr(model)) {
              var otherBrick = otherM4t.brick
              if (otherBrick instanceof eYo.expr.List && otherM4t.isSlot) {
                eYo.event.groupWrap(() => {
                  var b4s = model.split(',').map(x => {
                    var model = x.trim()
                    var p5e = eYo.t3.profile.get(model, null)
                    console.warn('MODEL:', model)
                    console.warn('PROFILE:', p5e)
                    return {
                      model,
                      p5e
                    }
                  }).filter(p5e => !p5e.isVoid && !p5e.isUnset).map(x => {
                    var ans = eYo.brick.newReady(this, x.model)
                    ans.setDataWithModel(x.model)
                    console.error('BRICK', ans)
                    return ans
                  })
                  b4s.some(b => {
                    /* non local */ candidate = b
                    if ((m4t = candidate.out_m) && m4t.checkType_(otherM4t)) {
                      fin()
                      var next = false
                      otherBrick.slotSomeMagnet(m4t => {
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
          if ((otherM4t = eYo.focus.magnet)) {
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
              otherM4t = b3k.slotSomeMagnet(foundM4t => {
                if (foundM4t.isSlot) {
                  if ((t9k = foundM4t.targetBrick)) {
                    if (!(foundM4t = findM4t(t9k))) {
                      return
                    }
                  } else if (!m4t.checkType_(foundM4t)) {
                    return
                  } else if (foundM4t.boundField) {
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
                  targetM4t.brick.bumpNeighbours_()
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
    },

    /**
     * Whether the given brick can lock.
     * For edython.
     * @return boolean
     */
    canLock () {
      if (this.locked_) {
        return true
      }
      // list all the input for a non optional connection with no target
      var m4t, target
      return !this.slotSome(slot => {
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
    },
    /**
     * Whether the given brick can unlock.
     * For edython.
     * @return {boolean}, true only if there is something to unlock
     */
    canUnlock () {
      if (this.locked_) {
        return true
      }
      // list all the slots for a non optional connection with no target
      var m4t, t9k
      return this.slotSome(slot => {
        if ((m4t = slot.magnet)) {
          if ((t9k = m4t.targetBrick)) {
            if (t9k.canUnlock()) {
              return true
            }
          }
        }
      })
    },
    /**
     * Lock the given brick.
     * For edython.
     * @return {number} the number of bricks locked
     */
    lock () {
      var ans = 0
      if (this.locked_ || !this.canLock()) {
        return ans
      }
      eYo.event.fireBrickChange(
        this, eYo.const.Event.locked, null, this.locked_, true)
      this.locked_ = true
      if (this.hasFocus) {
        eYo.focus.magnet = null
      }
      // list all the slots for connections with a target
      var m4t
      var t9k
      this.slotForEach(slot => {
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
      this.slotForEach(slot => {
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
      (this.surround || this).render()
      return ans
    },
    /**
     * Unlock the given brick.
     * For edython.
     * @param {eYo.Brick} brick The owner of the receiver.
     * @param {boolean} deep Whether to unlock statements too.
     * @return {number} the number of bricks unlocked
     */
    unlock (shallow) {
      var ans = 0
      eYo.event.fireBrickChange(
        this, eYo.const.Event.locked, null, this.locked_, false)
      this.locked_ = false
      // list all the input for connections with a target
      var m4t, t9k
      this.slotForEach(slot => {
        if ((m4t = slot.magnet)) {
          if ((!shallow || m4t.isSlot) && (t9k = m4t.targetBrick)) {
            ans += t9k.unlock(shallow)
          }
          m4t.hidden = false
        }
      })
      if (!shallow && (m4t = this.right_m)) { // eslint-disable-line
      }
      (this.surround || this).render()
      return ans
    },

    /**
     * Whether the brick of the receiver is in the visible area.
     * For edython.
     * @param {eYo.Brick} brick The owner of the receiver.
     * @return {boolean}
     */
    inVisibleArea () {
      var area = this.ui && this.ui.distanceVisible
      return area && !area.x && !area.y
    },
    /**
     * The default implementation forwards to the driver.
     */
    connectEffect () {
      this.audio.play('click')
      var b = this.board
      if (b.scale < 1) {
        return // Too small to care about visual effects.
      }
      this.drvr.do_connectEffect(this)
    },
    /**
     * The default implementation forwards to the driver.
     * This must take place while the brick is still in a consistent state.
     */
    disposeEffect () {
      this.audio.play('delete')
      this.drvr.do_disposeEffect(this)
    },
    /**
     * The default implementation forwards to the driver.
     * This must take place while the brick is still in a consistent state.
     * @param {String} element - 'field'
     * @param {String} name - Element name
     * @param {*} before - Value before the change
     * @param {*} after - Value after the change
     */
    fireChangeEvent (element, name, before, after) {
      eYo.event.fireBrickChange(this.brick, element, name, before, after)
    },
  },
})

// convenient namespace for debugging
eYo.brick.DEBUG_ = Object.create(null)

/**
 * Create a new brick.
 * This is the expected way to create the brick.
 * If the model fits an identifier, then create an identifier
 * If the model fits a number, then create a number
 * If the model fits a string literal, then create a string literal...
 * If the board is headless,
 * this is headless and should not render until
 * a `initUI` message is sent.
 * @param {String|Object|Number} model
 * @param {String|Object} [id]
 * @param {*} owner  board or brick
 * @param {eYo.Brick} [id]
 */
{
  let processModel = {$ (model, id, board, brick) {
    if (!eYo.isStr(id)) {
      [id, board, brick] = ['', id, board]
    }
    var dataModel = model // may change below
    if (!brick) {
      if (eYo.model.forType(model.type)) {
        brick = board.newBrick(model.type, id)
        brick.setDataWithType(model.type)
      } else if (eYo.model.forType(model)) {
        brick = board.newBrick(model, id) // can undo
        brick.setDataWithType(model)
      } else if (eYo.isStr(model) || eYo.isNum(model)) {
        var p5e = eYo.t3.profile.get(model, null)
        var f = p5e => {
          var ans
          if (p5e.expr && (ans = board.newBrick(p5e.expr, id))) {
            p5e.expr && (ans.setDataWithType(p5e.expr))
            model && (ans.setDataWithModel(model))
            dataModel = {data: model}
          } else if (p5e.stmt && (ans = board.newBrick(p5e.stmt, id))) {
            p5e.stmt && (ans.setDataWithType(p5e.stmt))
            dataModel = {data: model}
          } else if (eYo.isNum(model)  && (ans = board.newBrick(eYo.t3.expr.numberliteral, id))) {
            ans.setDataWithType(eYo.t3.expr.numberliteral)
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
    brick && brick.changer.wrap(() => { // `this` is `brick`
      brick.willLoad()
      brick.setDataWithModel(dataModel)
      var Vs = model.slots
      for (var k in Vs) {
        if (eYo.objectHasOwnProperty(Vs, k)) {
          var slot = brick.slots[k]
          if (slot && slot.magnet) {
            var t9k = slot.targetBrick
            var V = Vs[k]
            var b3k = processModel(V, null, board, t9k)
            if (!t9k && b3k && b3k.out_m) {
              b3k.changer.wrap(() => {
                slot && (slot.incog = false)
                b3k.out_m.connect(slot.magnet)
              })
            }
          }
        }
      }
      // now bricks and slots have been set
      brick.didLoad()
      if (brick.foot_m) {
        var footModel = dataModel[eYo.$next]
        if (footModel) {
          b3k = processModel(footModel, board)
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
    })
    return brick
  }}.$
  eYo.brick.newReady = {$ (model, id, owner) {
    var board = owner.board || owner
    var b3k = processModel(model, id, board)
    if (b3k) {
      b3k.consolidate()
      owner.hasUI && b3k.initUI()
    }
    return b3k
  }}.$
}

/**
 * Define the sugar getters and setters.
 * @param {Object} object - The object (prototype) to which we add data properties.
 * @param {String} key - Property name.
 */
eYo.do.defineDataProperty = (object, k) => {
  var k_p = k + '_p'
  if (!(k_p in object)) {
    // print("Data property", k_p, 'for', this.constructor[eYo.$].key)
    Object.defineProperty(object, k_p, {
      get () {
        return this.data[k].get()
      },
      set (after) {
        this.data[k].doChange(after)
      }
    })
  }
}

eYo.brick.registerAll = function (typesByKey, C3s, fake) {
  for (var k in typesByKey) {
    var type = typesByKey[k]
    if (eYo.isStr(type)) {
      //        console.log('Registering', k)
      eYo.c3s.register(type, C3s)
      if (fake) {
        type = type.replace('eyo:', 'eyo:fake_')
        //          console.log('Registering', k)
        eYo.c3s.register(type, C3s)
      }
    }
  }
}
/**
 * Define the sugar getters and setters.
 * @param {Object} object - The object (prototype) to which we add data properties.
 * @param {String} key - Property name.
 */
eYo.do.defineSlotProperty = (object, k) => {
  var k_s = k + '_s'
  k_s in object || Object.defineProperty(object, k_s, {
    get () {
      return this.slots[k]
    }
  })
  var k_b = k + '_b'
  k_b in object || Object.defineProperty(object, k_b, {
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
      return eYo.NA
    }
  })
  k_b in object || Object.defineProperty(object, k_b, {
    get () {
      throw "NO SUCH KEY, BREAK HERE"
    }
  })
}

/**
 * Update the receiver's shape.
 * Default implementation just forwards to the driver.
 */
eYo.drvr.makeForwarder(eYo.Brick_p, 'updateShape')

// register this delegate for all the T3 types
eYo.brick.registerAll(eYo.t3.expr, eYo.Brick)
eYo.brick.registerAll(eYo.t3.stmt, eYo.Brick)


console.error('allways heal stack, unplug next of not?')
    
/**
 * The default implementation forwards to the driver.
 */
eYo.drvr.makeForwarder(eYo.Brick_p, 'updateWrapped')

/**
 * @name{moveTo}
 * Move a brick to an offset in board coordinates.
 * @param {eYo.geom.Point} xy Offset in board units.
 * @param {Boolean} snap Whether we should snap to the grid.
 */
eYo.drvr.makeForwarder(eYo.Brick_p, 'moveTo')

/**
 * @name {moveBy}
 * Move a brick by a relative offset in board coordinates.
 * @param {number} dxy Offset in board units.
 * @param {boolean} snap Whether we should snap to grid.
 */
eYo.drvr.makeForwarder(eYo.Brick_p, 'moveBy')

eYo.Brick_p.packedQuotes = true
eYo.Brick_p.packedBrackets = true

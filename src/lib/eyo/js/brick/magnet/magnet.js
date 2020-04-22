/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Magnets manager.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('do')
eYo.require('geom')

/**
 * @name{eYo.magnet}
 * @namespace
 */
eYo.o4t.makeNS(eYo, 'magnet', {
  HEAD: 2,
  LEFT: 3,
  RIGHT: 4,
  FOOT: 5,
  IN: 1,
  OUT: 6,
  /**
  * Constants for checking whether two connections are compatible.
  */
  CAN_CONNECT: 0,
  REASON_SELF_CONNECTION: 1,
  REASON_WRONG_TYPE: 2,
  REASON_TARGET_NULL: 3,
  REASON_CHECKS_FAILED: 4,
  REASON_DIFFERENT_WORKSPACES: 5,
})

// Magnet opposite types, once the types are created
Object.defineProperties(eYo.magnet._p, {
  TYPES: {
    get () {
      return [
        eYo.magnet.IN,
        eYo.magnet.OUT,
        eYo.magnet.FOOT,
        eYo.magnet.HEAD,
        eYo.magnet.LEFT,
        eYo.magnet.RIGHT,
      ]
    },
  },
  OPPOSITE_TYPE: {
    get () {
      return {
        [eYo.magnet.IN]: eYo.magnet.OUT, // 7 - eYo.magnet.IN
        [eYo.magnet.OUT]: eYo.magnet.IN,
        [eYo.magnet.FOOT]: eYo.magnet.HEAD,
        [eYo.magnet.HEAD]: eYo.magnet.FOOT,
        [eYo.magnet.RIGHT]: eYo.magnet.LEFT,
        [eYo.magnet.LEFT]: eYo.magnet.RIGHT,
      }
    },
  },
})

// ANCHOR: Magnet Set

/**
 * The set of magnets owned by a brick.
 * @name{eYo.magnet.S}
 * @param {eYo.brick.BaseC9r} brick  brick is the owner
 */
eYo.magnet.makeC9r('S', { // eYo.magnet.BaseC9r is not yet defined!
  init (brick) {
    // configure the connections
    var model = brick.model
    var D
    if ((D = model.out) && eYo.isVALID(D.check)) {
      this.out_ = eYo.magnet.new(D, brick, eYo.magnet.OUT)
    } else if ((D = model.suite) && eYo.isDef(D.check)) {
      this.suite_ = eYo.magnet.new(D, brick, eYo.magnet.FOOT)
    }
    if ((D = model.head) && eYo.isDef(D.check)) {
      this.head_ = eYo.magnet.new(D, brick, eYo.magnet.HEAD)
    }
    if ((D = model.foot) && eYo.isDef(D.check)) {
      this.foot_ = eYo.magnet.new(D, brick, eYo.magnet.FOOT)
    }
    if ((D = model.left) && eYo.isDef(D.check)) {
      this.left_ = eYo.magnet.new(D, brick, eYo.magnet.LEFT)
    }
    if ((D = model.right) && eYo.isDef(D.check)) {
      this.right_ = eYo.magnet.new(D, brick, eYo.magnet.RIGHT)
    }
  },
  properties: {
    out: eYo.NA,
    head: eYo.NA,
    left: eYo.NA,
    right: eYo.NA,
    suite: eYo.NA,
    foot: eYo.NA,
  },
})

// ANCHOR: Base
/**
 * pure abstract base class for a magnet.
 * Use `eYo.magnet.new` to create a magnet.
 * 
 * @param {eYo.brick.BaseC9r|eYo.slot.BaseC9r} owner  the immediate owner of this magnet. When not a brick, it is directly owned by a brick.
 * @param {String} type  the type of this magnet
 * @param {Object} model  the model of this magnet
 * @readonly
 * @property {*} node  the node if any
 * @property {boolean} startOfLine  whether the connection is a slot connection starting a line.
 * @property {boolean} startOfStatement  whether the connection is a slot connection starting a brick.
 * @readonly
 * @property {string} type  the type of the connection
 * @readonly
 * @readonly
 * @property {boolean} isSuperior  whether the connection is superior, true if connection faces down or right, false otherwise.
 * @constructor
 */
eYo.magnet.makeBaseC9r(true, {
  init (key, bs, type) {
    eYo.magnet.TYPES.includes(type) || eYo.throw(`Unexpected type: ${type}`)
    if (this.type === eYo.magnet.IN) {
      this.name_ = this.slot.key
    }
    this.optional_ = this.model.optional
    this.incog_ = this.hidden_ = this.model.hidden
    eYo.field.makeFields(this, this.model.fields)
    if (!this.brick.isInFlyout) {
      var DB = this.magnetDB_
      if (DB) {
        this.db_ = DB[this.type]
        this.db_opposite_ = DB[this.opposite_type]
        this.hidden_ = false
      }
    }
  },
  /**
   * Dispose of the ressources.
   * @param {Boolean} [healStack]  Dispose of the inferior target iff healStack is a falsy value
   */
  dispose (healStack) {
    var t9k = this.targetBrick
    if (t9k) {
      if (this.isSuperior && (this.wrapped_ || !healStack)) {
        t9k.dispose()
      }
      this.disconnect()
    }
    if (this.wrapped_) {
      this.brick.removeWrapperMagnet(this)
      this.wrapped_ = eYo.NA
    }
    eYo.field.disposeFields(this)
  },
  ui: {
    /**
     * `initUI` the target brick when superior and the fields.
     */
    init () {
      this.inDB_ = !this.hidden_
      if (this.isSuperior) {
        var t9k = this.targetBrick
        t9k && t9k.initUI()
      }
      this.fieldForEach(f => f.initUI())
    },
    /**
     * `disposeUI` the target brick when superior and the fields.
     */
    dispose () {
      this.fieldForEach(f => f.disposeUI())
      if (this.isSuperior) {
        var t9k = this.targetBrick
        t9k && t9k.disposeUI()
      }
    },
  },
  aliases: {
    'brick.ui': 'ui',
    'brick.board.magnetDBList': 'magnetDB',
  },
  properties: {
    slot: {
      get () {
        return this.type === eYo.magnet.in ? this.owner : eYo.NA
      }
    },
    brick: {
      get () {
        return this.type === eYo.magnet.in ? this.owner.owner : this.owner
      }
    },
    target: {
      /**
       * Connect the receiver to the after magnet, if any, otherwise disconnects the receiver.
       * @param {eYo.magnet.BaseC9r} [after] 
       */
      validate (after) {
        return this.canConnectWithReason_(after) === eYo.magnet.CAN_CONNECT ? after : eYo.INVALID
      },
      willChange(before) {
        before && this.disconnect()
      },
    },
    optional: false,
    type: eYo.NA,
    /**
     * Whether the connection is a separator.
     * Used in lists.
     */
    s7r: false,
    name: eYo.NA,
    opposite_type () {
      return 7 - this.type
    },
    check: {
      didChange () {
        var brick = this.brick
        var t9k = this.targetBrick
        if (t9k && !this.checkType_(this.target)) {
          ;(this.isSuperior ? t9k : brick).unplug()
          // Bump away.
          brick.bumpNeighbours_()
        }
        brick.changeDone()
        t9k && t9k.changeDone() // there was once a `consolidate(false, true)` here.
      }
    },
    visible: {
      didChange (after) /** @suppress {globalThis} */ {
        after ? this.unhideAll() : this.hideAll()
        var t9k = this.targetBrick
        t9k && (t9k.ui.visible = after)
      }
    },
    inDB: {
      validate (after) {
        return !!after
      },
      didChange (after) /** @suppress {globalThis} */ {
        var db = this.db_
        if (db) {
          after
          ? db.magnetAdd_(this)
          : db.magnetRemove_(this)
        }
      }
    },
    db: eYo.NA,
    db_opposite: eYo.NA,
  },
})

// ANCHOR: Type

Object.defineProperty(eYo.magnet.BaseC9r_p, 'isMagnet', {
  get () {
    return true
  },
})

eYo.magnet.BaseC9r.eyo.p6yAliasesMerge({
  /**
   * Is it a slot magnet.
   * @return {boolean} True if the magnet is one of the brick's slot magnet.
   */
  isSlot: 'isIn',
})

eYo.magnet.BaseC9r.eyo.p6yMerge({
  typeName: {
    get () {
      return {
        [eYo.magnet.IN]: 'in',
        [eYo.magnet.OUT]: 'out',
        [eYo.magnet.HEAD]: 'head',
        [eYo.magnet.FOOT]: 'foot',
        [eYo.magnet.LEFT]: 'left',
        [eYo.magnet.RIGHT]: 'right'
      } [this.type]
    },
  },
  isSuperior: {
    get () { // the source 'owns' the target
      return this.isIn || this.isFoot || this.isRight
    },
  },
  /**
   * Is it an output magnet.
   * @return {boolean} True if the magnet is the brick's output one.
   */
  isOut: {
    get () {
      return this.type === eYo.magnet.OUT
    },
  },
  /**
   * Is it a top magnet.
   * @return {boolean} True if the magnet is the brick's head one.
   */
  isHead: {
    get () {
      return this.type === eYo.magnet.HEAD
    },
  },
  /**
   * Is it a foot magnet.
   * @return {boolean} True if the magnet is the brick's foot one.
   */
  isFoot: {
    get () {
      return this.type === eYo.magnet.FOOT
    },
  },
  /**
   * Is it a suite magnet.
   * @return {boolean} True if the magnet is the brick's suite one.
   */
  isSuite: {
    get () {
      return this === this.brick.suite_m
    },
  },
  /**
   * Is it a left magnet.
   * @return {boolean} True if the magnet is the brick's left one.
   */
  isLeft: {
    get () {
      return this.type === eYo.magnet.LEFT
    },
  },
  /**
   * Is it a right magnet.
   * @return {boolean} True if the magnet is the brick's right one.
   */
  isRight: {
    get () {
      return this.type === eYo.magnet.RIGHT
    },
  },
  isIn: {
    get () {
      return this.type === eYo.magnet.IN
    },
  },
})

// ANCHOR: State

eYo.magnet.BaseC9r.eyo.p6yMerge({
  hidden: {
    validate (after) {
      // Incog magnets must stay hidden
      return !after && this.incog_ ? eYo.INVALID : after
    },
    didChange(after) {
      this.inDB_ = !after
    }
  },
  incog: {
    validate (after) {
      return !!after
    },
    /**
     * Set the incognito state.
     * Hide/show the connection from/to the database and disable/enable the target's connections.
     * @param {boolean} incog
     */
    willChange (after) {
      if (!after) {
        this.completePromise()
      }
    },
    didChange (after) {
      if (after && !this.wrapped) {
        this.hidden = after
      }
      let t9k = this.targetBrick
      t9k && (t9k.incog = after)
      this.brick.changeDone()
    },
  },
  /**
   * This method returns a string describing this Magnet in developer terms
   * (English only). Intended to on be used in console logs and errors.
   * @return {string} The description.
   */
  description: {
    get () {
      var msg
      var b3k = this.brick
      if (!b3k) {
        return 'Orphan Magnet'
      } else if (this.isOut) {
        msg = 'Output Magnet of '
      } else if (this.isHead) {
        msg = 'Top Magnet of '
      } else if (this.isFoot) {
        msg = 'Bottom Magnet of '
      } else if (this.isSuite) {
        msg = 'Suite Magnet of '
      } else if (this.isLeft) {
        msg = 'Left statement Magnet of '
      } else if (this.isRight) {
        msg = 'Right statement Magnet of '
      } else {
        var slot = this.slot
        if (slot) {
          msg = `Parent "${slot.name}" connection on `
        } else {
          console.warn('Magnet not actually connected to source')
          return 'Orphan Magnet'
        }
      }
      msg += b3k.type ? `"${b3k.type}" brick` : 'brick'
      if (b3k.id) {
        msg += ` (id="${b3k.id}")`
      }
      return msg
    },
  },
})

// ANCHOR: Position

eYo.magnet.BaseC9r.eyo.p6yMerge({
  where: {
    value () {
      new eYo.geom.Point()
    },
    copy: true,
  },
  /**
   * Horizontal position in the brick in text unit.
   * @readonly
   * @return {Number}
   */
  c: {
    get () { // in text units
      return this.isIn
      ? this.where.c + this.slot.where.c
      : this.where.c
    },
  },
  /**
   * vertical position in the brick in text unit.
   * @readonly
   * @return {Number}
   */
  l: {
    get () { // in text units
      return this.isIn
      ? this.where_.l + this.slot.where_.l
      : this.where_.l
    },
  },
  /**
   * Position in the brick.
   * @return {eYo.geom.Point}
   */
  whereInBrick: {
    get () {
      return this.isIn
      ? this.slot.whereInBrick.forward(this.where)
      : new eYo.geom.Point(this.where)
    },
    set (after) {
      this.where_.set(this.isIn
        ? after.backward(this.slot.whereInBrick)
        : after
      )
    }
  },
  /**
   * Position in the board.
   * @return {eYo.geom.Point}
   */
  whereInBoard: {
    get () {
      return this.whereInBrick.forward(this.brick.ui.whereInBoard)
    },
    set (after) {
      this.whereInBrick.set(after).backward(this.brick.ui.whereInBoard)
    }
  },
  /**
  * Horizontal position in the brick.
  * @readonly
  * @return {Number}
  */
  x: {
    get () { // in board coordinates
      return this.isIn
      ? this.where_.x + this.slot.where_.x
      : this.where_.x
    },
  },
  /**
  * Vertical position in the brick.
  * @readonly
  * @return {Number}
  */
  y: {
    get () { // in board coordinates
      return this.isIn
      ? this.where_.y + this.slot.where_.y
      : this.where_.y
    },
  },
  /**
  * Width in text coordinates.
  * @readonly
  * @return {Number}
  */
 w: {
   get () { // in text units
      return this.bindField
      ? this.bindField.size_.w + 1
      : this.optional_ || this.s7r_
        ? 1
        : 3
    },
  },
  /**
  * Width in board coordinates.
  * @readonly
  * @return {Number}
  */
  width: {
    get () { // in board coordinates
      return this.w * eYo.geom.X
    },
  },
  parent: {
    get () { // in board coordinates
      throw "FORBIDDEN call to parent's magnet"
    },
  },
  bindField: {
    get () {
      if (this.slot) {
        return this.slot.bindField
      }
      // in a void wrapped list
      var brick = this.brick
      var slot = brick.slotAtHead
      if (slot && (slot.magnet === this)) {
        var m4t = brick.out_m
        if (m4t && (m4t = m4t.target)) {
          return m4t.bindField
        }
      }
    },
  },
  /**
   * Return the black target.
   * Traverses the white bricks
   * @return {?eYo.magnet.BaseC9r}
   * @private
   */
  blackTarget: {
    get () {
      var t4t = this.target
      if (!t4t) {
        return eYo.NA
      }
      var brick = t4t.brick
      if (!brick.isWhite) {
        return t4t
      }
      if (t4t.isHead) {
        var F = x => x.foot_m
      } else if (t4t.isFoot) {
        F = x => x.head_m
      } else {
        return eYo.NA
      }
      do {
        if (!(t4t = F(brick)) || !(t4t = t4t.target) || !(brick = t4t.brick)) {
          return eYo.NA
        }
        if (!brick.isWhite) {
          return t4t
        }
      } while (true)
    },
  },
  /**
  * Return the black connection.
  * Traverses the white bricks.
  * If the source brick is black, returns the connection.
  * If the source brick is white, check for the target brick's other connection,
  * and so on.
  * If the connection is named, returns the connection, whatever its source brick
  * status may be.
  * @param F optional function defaults to !argument.isWhite
  * @return a connection, possibly eYo.NA
  */
  blackMagnet: {
    get () {
      var brick = this.brick
      if (!brick.isWhite) {
        return this
      }
      if (this.isHead) {
        var other = b => b.foot_m
      } else if (this.isFoot) {
        other = b => b.head_m
      } else {
        // this is a 'do' statement input connection
        // whether the surrounding brick is disabled or not has no importance
        return this
      }
      var magnet
      while ((magnet = other(brick)) && (magnet = magnet.target) && !magnet.name_ && (!(brick = magnet.brick) || brick.isWhite)) {}
      return magnet
    },
  },
})

/**
 * Set the origin of the connection.
 * When the connection is in a slot, the origin is the top left point
 * of the slot otherwise it is `(0, 0)`.
 * @param {Number} c The column index.
 * @param {Number} l The line index.
 */
eYo.magnet.BaseC9r_p.setOffset = function(c = 0, l = 0) {
  if (eYo.isDef(c.c) && eYo.isDef(c.l)) {
    l = c.l
    c = c.c
  }
  var w = this.where_
  w.c_ = c
  w.l_ = l
  if (isNaN(this.x)) {
    w.c_ = c
    w.l_ = l
    console.error(this.x)
  }
}

// ANCHOR: finalizeC9r

eYo.magnet.BaseC9r.eyo.finalizeC9r((() => {
  let ans = {}
  let d = eYo.model.manyDescriptorF('willConnect', 'didConnect', 'willDisconnect', 'didDisconnect')

  ;['out', 'head', 'left', 'right', 'suite', 'foot'].forEach(k => {
    ans[k] = eYo.model.manyDescriptorF('willConnect', 'didConnect', 'willDisconnect', 'didDisconnect')
  })
})())

// ANCHOR: Iterators and methods
/**
* execute the given function for the fields.
* For edython.
* @param {function} helper
*/
eYo.magnet.BaseC9r_p.fieldForEach = function (helper) {
this.fields && (Object.values(this.fields).forEach(f => helper(f)))
}

/**
* `consolidate` the target brick.
*/
eYo.magnet.BaseC9r_p.consolidate = function (deep, force) {
var t9k = this.targetBrick
t9k && (t9k.consolidate(deep, force))
}

// ANCHOR: Navigate

eYo.magnet.BaseC9r.eyo.p6yMerge({
  /**
   * The right magnet is just at the right... Not used yet.
   * @private
   */
  right: {
    get () {
      var slot = this.slot
      if (slot) {
        while((slot = slot.next)) {
          if (!slot.incog && slot.magnet && !slot.magnet.hidden) {
            return slot.magnet
          }
        }s
      }
      if (this.isOut) {
        let m4t = m4t.target
        return m4t && m4t.right
      }
    },
  },
  /**
   * Get the magnet on the brick above.
   * whatever its source brick status may be.
   * @return a magnet, possibly eYo.NA
   */
  above : {
    get () {
      if (this.isOut) {
        var t4t = this.target
        return t4t && t4t.above || this.brick.head_m
      } else if (this.isFoot) {
        let slot = this.brick.slotHead
        return slot && slot.magnet || this.brick.head_m
      } else if (this.isHead) {
        var t4t = this.target
        return t4t && t4t.above || eYo.NA
      } else { // in, left, right
        return this.brick.head_m
      }
    }
  },
  /**
   * Get the magnet of the same kind on the brick above.
   * If the magnet is named (Why should it be?), returns the connection,
   * whatever its source brick status may be.
   * @return a connection, possibly eYo.NA
   */
  below : {
    get () {
      if (this.isOut) {
        var t4t = this.target
        return t4t && t4t.below || this.brick.foot_m
      } else if (this.isFoot) {
        var t4t = this.target
        return t4t && t4t.below || eYo.NA
      } else if (this.isHead) {
        let slot = this.brick.slotHead
        return slot && slot.magnet || this.brick.foot_m
      } else { // in, left, right
        return this.brick.foot_m
      }
    }
  },
  /**
   * The left magnet is just at the right... Not used yet.
   * @private
   */
  left: {
    get () {
      var slot = this.slot
      if (slot) {
        while((slot = slot.previous)) {
          if (!slot.incog && slot.magnet && !slot.magnet.hidden) {
            return slot.magnet
          }
        }
      }
      if (this.isOut) {
        let m4t = m4t.target
        return m4t && m4t.left
      }
    },
  },

})

/**
 * Get the magnet of the given type on the brick below.
 * @param {String} [type] - the expected type
 * @return a magnet, possibly eYo.NA
 */
eYo.magnet.BaseC9r_p.getBelow = function (type) {
  var ans = this.brick.foot
  if (ans) {
    var m5s = ans.magnets
    if (this.isFoot) {
      return m5s.foot
    } else if (this.isHead) {
      return m5s.head
    } else if (this.isRight) {
      return m5s.right
    } else if (this.isLeft) {
      return m5s.left
    }
  }
}

/**
 * Connect two magnets together.  `This` is the magnet on the superior
 * brick.
 * Add hooks to allow customization.
 * This is a critical piece of code.
 * There are 3 different kinds of problems:
 * 1) the orphan management
 * 2) the check management
 * 3) the undo management
 * All this must fit together well.
 * Undo management must occur at a higher level.
 * Then orphan management at a middle level
 * Finally the check management once the state is modified.
 * We assume that breaking one connection does not cascade into another
 * connection break.
 * @param {eYo.magnets.prototype} childM4t  A magnet on an inferior brick.
 * @private
 * @suppress {accessControls}
 */
eYo.magnet.BaseC9r_p.connect_ = function (childM4t) {
  // `this` is actually the superior magnet
  var parentM4t = this
  var parent = parentM4t.brick
  var child = childM4t.brick
  var parentOldT4t = parentM4t.target
  var oldParentT4t = childM4t.target
  var oldChildT4t = parentM4t.target
  var unwrappedM4t = parentM4t.unwrappedMagnet
  var m4t
  if (parent.board !== child.board) {
    return
  }
  var attach_orphan = () => {
    if (parentOldT4t) {
      // Parent magnet is already connected to something.
      // Disconnect it and reattach it or bump it as needed.
      if (parentOldT4t.isOut) {
        // Attempt to reattach the orphan at the end of the newly inserted
        // brick.  Since this brick may be a row, walk down to the end
        // or to the first free magnet.
        /*
        * Find the first free magnet in the given brick
        * that positively checks type with the given potential target magnet.
        * @param {eYo.brick.BaseC9r} brick The brick.
        * @param {eYo.magnet.BaseC9r} child The inferior brick.
        * @private
        * @suppress {accessControls}
        */
        var freeMagnet = (brick, magnet) => {
          return brick.slotSome(slot => {
            var ans = slot.magnet
            if (ans) {
              if (brick = ans.targetBrick) {
                return freeMagnet(brick, magnet)
              } else if (ans.checkType_(magnet)) {
                return ans
              }
            }
          })
        }
        if ((m4t = freeMagnet(child, parentOldT4t))) {
          // both magnets are free, no ∞ loop
          m4t.connect_(parentOldT4t)
          parentOldT4t = null
        }
      } else if (parentOldT4t.isHead) {
        var brick = child.footMost
        if ((m4t = brick.foot_m) && parentOldT4t.checkType_(m4t)) {
          m4t.connect(parentOldT4t)
          parentOldT4t = null
        }
      } else if (parentOldT4t.isLeft) {
        var brick = child.rightMost
        if ((m4t = brick.right_m) && parentOldT4t.checkType_(m4t)) {
          m4t.connect(parentOldT4t)
          otherM4t = null
        }
      }
      parentOldT4t && (parentOldT4t.bumpAwayFrom_(parentM4t))
    }
  }
  var link = () => {
    parentM4t.target_ = childM4t
    childM4t.target_ = parentM4t
    child.parent = parent
  }
  var connect2 = () => {
    // Disconnect any existing parent on the child connection.
    eYo.event.fireBrickMove(child, () => {
      childM4t.disconnect() // move may start here
      attach_orphan()
      link()
      if (parent.ui.rendered) {
        parent.updateDisabled()
      }
      if (child.ui.rendered) {
        child.updateDisabled()
      }
      if (parent.ui.rendered && child.ui.rendered) {
        if (parentM4t.isFoot || parentM4t.isRight) {
          child.render()
        } else {
          // Child brick does not change shape.  Rendering the parent node will
          // move its connected children into position.
          parent.render()
        }
      }
      // move ends after parent's rendering
    })
  }
  var connect1 = () => {
    connect2()
    if (parentM4t.wrapped_) {
      child.hasFocus && (parent.focusOn())
      child.wrapped_ = true
    } else {
      // if this connection was selected, the newly connected brick should be selected too
      if (parentM4t.hasFocus) {
        var P = parent
        do {
          if (P.hasFocus) {
            child.focusOn()
            break
          }
        } while ((P = P.group))
      }
    }
    if (oldChildT4t && childM4t !== oldChildT4t) {
      var oldChild = oldChildT4t.brick
      if (oldChild) {
        if (oldChild.wrapped_) {
          eYo.event.recordingUndo && (oldChild.dispose(true))
        } else if (!oldChildT4t.targetBrick) {
          // another chance to reconnect the orphan
          // just in case the check_ has changed in between
          // which might be the case for the else_part bricks
          if (oldChildT4t.isOut) {
            child.slotSome(slot => {
              if (!slot.incog) {
                var m4t, t9k
                if ((m4t = slot.magnet)) {
                  if (m4t.hidden_ && !m4t.wrapped_) {
                    return
                  }
                  if ((t9k = m4t.targetBrick)) {
                    if (plug(t9k)) {
                      return true
                    }
                  } else if (m4t.checkType_(oldChildT4t)) {
                    m4t.connect(oldChildT4t)
                    return true
                  }
                }
              }
            })
          } else {
            P = child.footMost
            var m4t
            if ((m4t = P.foot_m) && m4t.checkType_(oldChildT4t)) {
              m4t.connect(oldChildT4t)
            }
          }
        }
      }
    }
    childM4t.hasFocus && (childM4t.focusOff())
    parentM4t.hasFocus && (parentM4t.focusOff())
    child.incog = parentM4t.incog
  }
  eYo.event.groupWrap(() => {
    parent.changer.wrap(() => { // Disable rendering until changes are made
      child.changer.wrap(() => {
        parent.initUI(child.hasUI)
        child.initUI(parent.hasUI)
        parentM4t.willConnect(childM4t)
        if (unwrappedM4t !== parentM4t) {
          unwrappedM4t.willConnect(childM4t)
        }
        // (unwrappedM4t !== parentM4t) && unwrappedM4t.willConnect(childM4t)
        eYo.do.tryFinally(() => {
          childM4t.willConnect(parentM4t)
          eYo.do.tryFinally(() => {
            parent.willConnect(parentM4t, childM4t)
            eYo.do.tryFinally(() => {
              child.willConnect(childM4t, parentM4t)
              eYo.do.tryFinally(
                connect1, // 
                () => { // finally
                  parentM4t.startOfStatement && child.changeDone()
                  eYo.magnet.connectedParent = parentM4t
                  // next must absolutely run because of possible undo management
                  child.didConnect(childM4t, oldParentT4t, oldChildT4t)
                }
              )
            }, () => { // finally
              // next must absolutely run because of possible undo management
              parent.didConnect(parentM4t, oldChildT4t, oldParentT4t)
            })
          }, () => { // finally
            unwrappedM4t.bindField && (unwrappedM4t.bindField.visible = false)
            // next must absolutely run because of possible undo management
            parentM4t.didConnect(oldParentT4t, oldChildT4t)
            if (unwrappedM4t !== parentM4t) {
              unwrappedM4t.didConnect(oldParentT4t, oldChildT4t)
            }
            // (unwrappedM4t !== parentM4t) && unwrappedM4t.didConnect(oldParentT4t, oldChildT4t)
          })
        }, () => { // finally
          childM4t.didConnect(oldChildT4t, oldParentT4t)
          eYo.magnet.connectedParent = eYo.NA
          childM4t.bindField && (childM4t.bindField.visible = false) // unreachable ?
        })
      })
    })
  })
  var ui
  if (ui = child.ui) {
    ui.didConnect(childM4t, oldChildT4t, oldParentT4t)
  }
  if (ui = parent.ui) {
    ui.didConnect(parentM4t, oldParentT4t, oldChildT4t)
  }
  if ((unwrappedM4t !== parentM4t) && (ui = unwrappedM4t.ui)) {
    ui.didConnect(parentM4t, oldParentT4t, oldChildT4t)
  }
}

/**
 * Tighten the magnet and its target.
 */
eYo.magnet.BaseC9r_p.tighten = function() {
  var m4t = this.target
  if (m4t) {
    var xy = m4t.whereInBoard
    if (xy.x != 0 || xy.y != 0) {
      this.targetBrick.moveTo(xy)
    }
  }
}

/**
 * Scrolls the receiver to the top left part of the board.
 * Does nothing if the brick is already in the visible are,
 * and is not forced.
 * @param {Boolean} force  flag
 */
eYo.magnet.BaseC9r_p.scrollToVisible = function (force) {
  this.brick.scrollToVisible(force)
}

/**
 * Move the brick(s) belonging to the connection to a point where they don't
 * visually interfere with the specified connection.
 * @param {eYo.magnet.BaseC9r} m4t The connection to move away
 *     from.
 * @private
 * @suppress {accessControls}
 */
eYo.magnet.BaseC9r_p.bumpAwayFrom_ = function (m4t) {
  var brick = this.brick
  if (!brick.board || brick.board.desk.desktop.isDragging) {
    return
  }
  // Move the root brick.
  var root = brick.root
  if (root.isInFlyout) {
    // Don't move bricks around in a flyout.
    return
  }
  if (!root.board) {
    return
  }
  var reverse = false
  if (!root.movable) {
    // Can't bump an uneditable brick away.
    // Check to see if the other brick is movable.
    root = m4t.brick.root
    if (!root.board || !root.movable) {
      return
    }
    // Swap the connections and move the 'static' connection instead.
    m4t = this
    reverse = true
  }
  // Raise it to the top for extra visibility.
  var selected = root.hasFocus
  selected || root.selectAdd()
  var dxy = eYo.geom.xyPoint(eYo.event.SNAP_RADIUS, eYo.event.SNAP_RADIUS).backward(this.xy)
  if (reverse) {
    // When reversing a bump due to an uneditable brick, bump up.
    dxy.y = -dxy.y
  }
  // Bump to the right of the brick
  if (m4t.target) {
    dxy.x += m4t.targetBrick.width
  }
  root.moveBy(dxy)
  selected || root.ui.focusRemove()
}

/**
 * Hide this connection, as well as all down-stream connections on any brick
 * attached to this connection.  This happens when a brick is collapsed.
 */
eYo.magnet.BaseC9r_p.hideAll = function() {
  this.hidden = true
  var t9k = this.targetBrick
  if (t9k) {
    t9k.descendants.forEach(brick => {
      brick.getMagnets_(true).forEach(m4t => m4t.hideAll())
    })
  }
}

/**
 * Find all nearby compatible magnets to the receiver.
 * Type checking does not apply, since this function is used for bumping.
 * @param {number} maxLimit The maximum radius to another connection, in
 *     board units.
 * @return {!Array<!eYo.magnet>} List of magnets.
 * @private
 */
eYo.magnet.BaseC9r_p.neighbours_ = function(maxLimit) {
  return this.db_opposite.getNeighbours(this, maxLimit)
}

/**
 * Unhide the receiver, as well as all down-stream magnets on any brick
 * attached to it.  This happens when a brick is expanded.
 */
eYo.magnet.BaseC9r_p.unhideAll = function() {
  this.hidden = false
  if (this.isSuperior) {
    var t9k = this.targetBrick
    t9k && (t9k.collapsed
        ? Object.values(t9k.magnets)
        : t9k.getMagnets_(true)).forEach(m4t => m4t.unhideAll())
  }
}

// Position
;(() => {
  /**
   * Find the closest compatible connection to this connection.
   * @param {eYo.Connection} conn The connection searching for a compatible
   *     mate.
   * @param {number} maxRadius The maximum radius to another connection.
   * @param {eYo.geom.Point} dxy Offset between this connection's location
   *     in the database and the current location (as a result of dragging).
   * @return {!{connection: ?eYo.Connection, radius: number}} Contains two
   *     properties:' connection' which is either another connection or null,
   *     and 'radius' which is the distance.
   */
  var searchForClosest = (db, magnet, maxRadius, dxy) => {
    // Don't bother.
    if (!db.length) {
      return {magnet: null, radius: maxRadius}
    }
    var where = new eYo.geom.Point(magnet.where).forward(dxy)
    // findPositionForConnection finds an index for insertion, which is always
    // after any block with the same y index.  We want to search both forward
    // and back, so search on both sides of the index.
    var closestIndex = db.findIndex_(where.y)
    var bestMagnet = null
    var bestRadius = maxRadius
    var temp;

    // Walk forward and back on the y axis looking for the closest x,y point.
    var min = closestIndex - 1
    while (min >= 0) {
      temp = db[min--]
      var radius = where.distance(temp.where)
      if (radius < maxRadius && magnet.isConnectionAllowed(temp)) {
        bestMagnet = temp
        bestRadius = radius
      }
    }
    var max = closestIndex
    while (max < db.length) {
      temp = db[max++]
      var radius = where.distance(temp.where)
      if (radius < maxRadius && magnet.isConnectionAllowed(temp)) {
        bestMagnet = temp
        bestRadius = radius
      }
    }
    // If there were no valid connections, bestConnection will be null.
    return {magnet: bestMagnet, radius: bestRadius}
  }
  /**
   * Find the closest compatible connection to this connection.
   * All parameters are in board units.
   * @param {eYo.geom.Point} maxLimit The maximum radius to another connection.
   * @param {eYo.geom.Point} dxy Horizontal offset between this connection's location
   *     in the database and the current location (as a result of dragging).
   * @return {!{connection: ?eYo.magnet, radius: number}} Contains two
   *     properties: 'connection' which is either another connection or null,
   *     and 'radius' which is the distance.
   * @suppress{accessControls}
   */
  eYo.magnet.BaseC9r_p.closest =  function (maxLimit, dxy) {
    if (this.hidden_) {
      return {}
    }
    return searchForClosest(this.db_opposite_, this, maxLimit, dxy)
  }
}) ()

/**
 * Move this magnet to the location given by its offset within the brick and
 * the location of the brick's top left corner.
 * @param {eYo.geom.Point} blockTL The location of the top left corner
 *     of the brick, in board coordinates.
 */
eYo.magnet.BaseC9r_p.moveToOffset = function(blockTL) {
  this.moveTo(blockTL.forward(this.where))
}

/**
 * Change the magnet's global coordinates.
 * @param {eYo.geom.Point} here
 */
eYo.magnet.BaseC9r_p.moveTo = function(here) {
  if (!this.where.equals(here) || (!here.x && !here.y)) {
    // Remove it from its old location in the database (if already present)
    this.inDB_ = false
    this.where.set(here)
    // Insert it into its new location in the database.
    this.hidden || (this.inDB_ = true)
  }
}

/**
 * Change the connection's coordinates.
 * Relative move with respect to the actual position.
 * @param {eYo.geom.Point} dxy Change to coordinates, in board units.
 */
eYo.magnet.BaseC9r_p.moveBy = function(dxy) {
  this.moveTo(this.where.forward(dxy))
}

/**
 * Returns the distance between this magnet and another magnet in
 * board units.
 * @param {eYo.magnet.BaseC9r} other The other connection to measure
 *     the distance to.
 * @return {number} The distance between magnets, in board units.
 */
eYo.magnet.BaseC9r_p.distance = function(other) {
  return this.where.distance(other.where)
}

// ANCHOR: Wrapping

eYo.magnet.BaseC9r.eyo.p6yMerge({
  wrapped: {
    validate (after) {
      this.target && eYo.throw("ALREADY A WRAPPED BLOCK")
      return after
    },
    didChange (after) /** @suppress {globalThis} */ {
      this.promised_ = eYo.NA
      after && this.brick.addWrapperMagnet(this)
      this.hidden = true
    }
  },
  promised: {
    validate (after) {
      if (this.target) {
        throw "ALREADY A WRAPPED BLOCK"
      }
      return after
    },
    didChange () /** @suppress {globalThis} */ {
      this.wrapped_ && this.brick.removeWrapperMagnet(this)
      this.wrapped_ = eYo.NA
      this.hidden = true
    }
  },
  unwrappedMagnet: {
    get () {
      // scheme:
      // this = output <- input <- wrapped source brick <- output <- input
      var ans = this
      var t9k, m4t
      while ((t9k = ans.targetBrick) && t9k.wrapped_ && (m4t = t9k.out_m)) {
        ans = m4t
      }
      return ans
    },
  },
  /**
   * Returns an unwrapped target brick
   */
  unwrappedTarget: {
    get () {
      var t = this.targetBrick
      var f = t => {
        return t && (!t.wrapped_ || t.slotSome(slot => {
          var m4t = slot.magnet
          return f(t = m4t && m4t.targetBrick)
        }))
      }
      return f(t) && t
    },
  },
})

/**
 * Complete with a wrapped brick.
 * Reentrant method.
 * @param {String} prototypeName
 * @return {Object} Object with an `ans` property.
 */
eYo.magnet.BaseC9r_p.completeWrap = function () {
  if (!this.wrapped_) {
    return
  }
  var t9k = this.targetBrick
  if (!t9k) {
    var ans
    try {
      this.completeWrap = eYo.doNothing
      eYo.event.disableWrap(
        () => {
          let brick = this.brick
          t9k = this.newTargetBrick()
          t9k || eYo.throw(`completeWrap failed: ${this.wrapped_}`)
          t9k.out_m || eYo.throw(`Did you declare an expr brick typed ${t9k.type}`)
          ans = this.connect(t9k.out_m)
        }
      )
      return ans // true when connected
    } finally {
      delete this.completeWrap
    }
  }
}

/**
 * Create a new target brick.
 * This is the only place where `eYo.brick` is required.
 */
eYo.magnet.BaseC9r_p.newTargetBrick = function () {
  let brick = this.brick
  return eYo.brick.newReady(brick, this.wrapped_, brick.id + '.wrapped:' + this.name_)
}

/**
 * Complete with a promised brick.
 */
eYo.magnet.BaseC9r_p.completePromise = function () {
  if (this.promised_) {
    // console.error('PROMISE CLOSED')
    this.wrapped_ = this.promised
    this.promised_ = eYo.NA
    var ans = this.completeWrap()
    return eYo.isVALID(ans) && ans || eYo.NA
  }
}

// ANCHOR: Connection

eYo.magnet.BaseC9r.eyo.p6yMerge({
  targetBrick: { // === this.target.brick
    get () {
      var t = this.target
      return t && t.brick
    },
    willChange (before) {
      before && this.disconnect()
    },
    set (after) {
      if (after !== this.targetBrick && after !== this.brick) {
        this.disconnect()
      }
      if (after) {
        this.connectSmart(after)
      }
    }
  },
})

/**
 * Establish a connection with a brick.
 *
 * @param {eYo.brick.BaseC9r} eyo
 */
eYo.magnet.BaseC9r_p.connectSmart = (() => {

  /**
   * Establish a connection with a brick.
   * @param {eYo.brick.BaseC9r} brick
   * @return {!eYo.magnet.BaseC9r}
   */
  var connectToHead = function (brick) {
    this.connect(brick.head_m)
    return brick.footMost.foot_m
  }

  /**
   * Establish a connection with a brick.
   * @param {eYo.brick.BaseC9r} brick
   * @return {!eYo.magnet.BaseC9r}
   */
  var connectToLeft = function (brick) {
    this.connect(brick.left_m)
    return brick.rightMost.right_m
  }

  /**
   * Establish a connection with a brick.
   * @param {eYo.brick.BaseC9r} brick
   * @return {!eYo.magnet.BaseC9r}
   */
  var connectToRight = function (brick) {
    this.connect(brick.right_m)
    return brick.leftMost.left_m
  }

  /**
   * Establish a connection with a brick.
   * @param {eYo.brick.BaseC9r} brick
   * @return {!eYo.magnet.BaseC9r}
   */
  var connectToFoot = function (brick) {
    this.connect(brick.foot_m)
    return brick.headMost.head_m
  }

  /**
   * Establish a connection with a brick.
   * @param {eYo.brick.BaseC9r} brick
   */
  var connectToOutput = function (brick) {
    this.connect(brick.out_m)
  }

  return function (b) {
    if (this.isFoot || this.isSuite) {
      this.connectSmart = connectToHead
      return this.connectSmart(b)
    }
    if (this.isHead) {
      this.connectSmart = connectToFoot
      return this.connectSmart(b)
    }
    if (this.isLeft) {
      this.connectSmart = connectToRight
      return this.connectSmart(b)
    }
    if (this.isRight) {
      this.connectSmart = connectToLeft
      return this.connectSmart(b)
    }
    if (this.isSlot) {
      this.connectSmart = connectToOutput
      return this.connectSmart(b)
    }
  }
}) ()

/**
 * Break the connection by unplugging a source brick. This is high because it calls unplug.
 */
eYo.magnet.BaseC9r_p.break = function () {
  var brick = this.isSuperior ? this.targetBrick : this.brick
  brick && (brick.unplug())
}

/**
 * Set the receiver's connection's check_ array according to the given type.
 * The defaults implements asks the model then sets the check_ property.
 * Called by `consolidateMagnets`.
 */
eYo.magnet.BaseC9r_p.updateCheck = function () {
  var b = this.brick
  if(b.changer.level > 1 || this.changeCount_ === b.changer.count) {
    return
  }
  this.changeCount_ = b.changer.count
  if (this.model.check) {
    this.check = this.model.check.call(this, b.type, b.subtype)
  }
}

;(() => {
  var parentM4t, parent, childM4t, child, unwrappedM4t
  var unlink = () => {
    // the work starts here
    if (parentM4t.wrapped_) {
      // currently unwrapping a brick,
      // this occurs while removing the parent
      // if the parent was selected, select the child
      child.wrapped_ = false
      parent.hasFocus && (child.focusOn())
    }
    // Now do the job
    parentM4t.target_ = null
    childM4t.target_ = null
    child.parent_ = null // Beware of the underscore here too !!!
  }
  /**
   * Disconnect this magnet from its target.
   * @return{Boolean} true iff there was a connection.
   */
  eYo.magnet.BaseC9r_p.disconnect = function() {
    if (this.isSuperior) {
      // Superior brick.
      parentM4t = this
      if (!(childM4t = this.target)) {
        return false
      }
    } else {
      // Inferior brick.
      if (!(parentM4t = this.target)) {
        return false
      }
      childM4t = this
    }
    parent = parentM4t.brick
    child = childM4t.brick
    unwrappedM4t = parentM4t.unwrappedMagnet
    eYo.event.groupWrap(() => {
      eYo.event.fireBrickMove(child, () => {
        child.changer.wrap(() => { // `this` is catched
          parent.changer.wrap(() => { // `this` is catched
            eYo.do.tryFinally(() => {
              parentM4t.willDisconnect()
              ;(unwrappedM4t !== parentM4t) && unwrappedM4t.willDisconnect()
              eYo.do.tryFinally(() => {
                childM4t.willDisconnect()
                eYo.do.tryFinally(() => {
                  parent.willDisconnect(parentM4t)
                  eYo.do.tryFinally(() => {
                    child.willDisconnect(childM4t)
                    eYo.do.tryFinally(() => {
                      unlink(parentM4t, childM4t)
                    }, () => { // finally
                      // next is not strong enough to save rendering
                      // eYo.magnet.disconnectedParent = parentM4t
                      // eYo.magnet.disconnectedChild = childM4t
                      // eYo.magnet.disconnectedParent = eYo.NA
                      // eYo.magnet.disconnectedChild = eYo.NA
                      parent.changeInputDone && (parent.changeInputDone()) // list are special
                      parentM4t.bindField && (parentM4t.bindField.visible = true) // no wrapped test
                      childM4t.bindField && (childM4t.bindField.visible = true) // unreachable ?
                    })
                  }, () => { // finally
                    child.didDisconnect(childM4t, parentM4t)
                  })
                }, () => { // finally
                  parent.didDisconnect(parentM4t, childM4t)
                })
              }, () => { // finally
                childM4t.didDisconnect(parentM4t)
              })
            }, () => { // finally
              parentM4t.didDisconnect(childM4t)
              ;(unwrappedM4t !== parentM4t) && unwrappedM4t.didDisconnect(childM4t)
            })
          })
        })
        child.changeDone()
        child.consolidate()
        parent.changeDone()
        parent.consolidate()
        var ui
        ;(ui = child.ui) && ui.didDisconnect(parentM4t)
        ;(ui = parent.ui) && ui.didDisconnect(childM4t)
        ;(unwrappedM4t !== parentM4t) && (ui = unwrappedM4t.ui) && ui.didDisconnect(childM4t)
      })
      // Rerender the parent so that it may reflow.
      // this will be done later
      if (parent.ui.rendered) {
        parent.render()
      }
      if (child.ui.rendered) {
        child.updateDisabled()
        child.render()
      }
    })
    child.parent = null
    return true
  }
}) ()

/**
 * Connect the receiver to another magnet.
 * @param {eYo.magnet.BaseC9r} other  The magnet to connect to.
 */
eYo.magnet.BaseC9r_p.connect = function(other) {
  if (this.target === other) {
    return
  }
  switch (this.canConnectWithReason_(other)) {
    case eYo.magnet.CAN_CONNECT:
      break
    case eYo.magnet.REASON_SELF_CONNECTION:
      throw 'Attempted to connect a brick to itself.'
    case eYo.magnet.REASON_DIFFERENT_WORKSPACES:
      // Usually this means one brick has been deleted.
      throw 'Bricks not on same board.'
    case eYo.magnet.REASON_WRONG_TYPE:
      throw 'Attempt to connect incompatible types.'
    case eYo.magnet.REASON_TARGET_NULL:
      throw 'Target connection is null.'
    case eYo.magnet.REASON_CHECKS_FAILED:
      throw `Connection checks failed. ${this} expected ${this.check_}, but found ${other.check_}`
    default:
      throw 'Unknown connection failure: this should never happen!'
  }
  // Determine which brick is superior (higher in the source stack).
  this.isSuperior
    ? this.connect_(other)
    : other.connect_(this)
}


/**
 * Checks whether the current connection can connect with the target
 * connection.
 * @param {eYo.magnet.BaseC9r} target Magnet to check compatibility with.
 * @return {number} eYo.magnet.CAN_CONNECT if the connection is legal,
 *    an error code otherwise.
 * @private
 */
eYo.magnet.BaseC9r_p.canConnectWithReason_ = function(target) {
  if (!target) {
    return eYo.magnet.REASON_TARGET_NULL
  }
  if (this.isSuperior) {
    var dlgt_A = this.brick
    var dlgt_B = target.brick
  } else {
    var dlgt_B = this.brick
    var dlgt_A = target.brick
  }
  if (dlgt_A && dlgt_A === dlgt_B) {
    return eYo.magnet.REASON_SELF_CONNECTION
  } else if (target.type !== this.opposite_type) {
    return eYo.magnet.REASON_WRONG_TYPE
  } else if (dlgt_A && dlgt_B && dlgt_A.board !== dlgt_B.board) {
    return eYo.magnet.REASON_DIFFERENT_WORKSPACES
  } else if (!this.checkType_(target)) {
    return eYo.magnet.REASON_CHECKS_FAILED
  }
  return eYo.magnet.CAN_CONNECT
}

/**
 * Check if the two connections can be dragged to connect to each other.
 * A sealed connection is never allowed.
 * @param {eYo.magnet.BaseC9r} candidate A nearby connection to check.
 * @param {Boolean} [ignoreDistance]
 * @return {boolean} True if the connection is allowed, false otherwise.
 */
eYo.magnet.BaseC9r_p.isConnectionAllowed = function (candidate, maxRadius) {
  if (this.wrapped_ || candidate.wrapped_) {
    return false
  }
  if (eYo.isDef(maxRadius) && this.distance(candidate) > maxRadius) {
    return false
  }
  // Type checking.
  if (this.canConnectWithReason_(candidate) !== eYo.magnet.CAN_CONNECT) {
    return false
  }
  if (!candidate.isSuperior) {
    if (candidate.target || this.target) {
      return false
    }
  }
  var its_brick = candidate.targetBrick
  if (candidate.isSlot && candidate.target &&
      !its_brick.isMovable) {
    return false;
  }

  // Don't let a brick with no foot magnet bump other bricks out of the
  // stack.  Similarly, replacing a terminal statement with another terminal statement
  // is allowed.
  if (this.isHead &&
      candidate.target &&
      !this.brick.foot_m &&
      its_brick.foot_m) {
    return false;
  }

  do {
    if (this.brick === its_brick) {
      return false // candidate is contained in `this` owner
    }
  } while ((its_brick = its_brick.parent))

  return true
}

/**
 * Will connect.
 * Forwards to the model.
 * @param {eYo.magnet.BaseC9r} targetM4t
 */
eYo.magnet.BaseC9r_p.willConnect = function (targetM4t) {
  var m = this.model
  var f = eYo.decorate.reentrant_method(this, 'model_willConnect', m && m.willConnect)
  if (f) {
    f.apply(this, arguments)
    return
  }
}

/**
 * Did connect.
 * Increment the brick step.
 * @param {eYo.magnet.BaseC9r} oldTargetM4t
 *     what was previously connected to the receiver
 * @param {eYo.magnet.BaseC9r} targetOldM4t
 *     what was previously connected to the actual receiver's target
 */
eYo.magnet.BaseC9r_p.didConnect = function (oldTargetM4t, targetOldM4t) {
  // No need to increment step for the old magnets because
  // if any, they were already disconnected and
  // the step has already been incremented then.
  var m = this.model
  var f = eYo.decorate.reentrant_method(this, 'model_didConnect', m && m.didConnect)
  if (f) {
    f.apply(this, arguments)
    return
  }
  if (this.isRight && this.label_f) {
    this.label_f.visible = this.brick.isGroup || !this.targetBrick.isComment
  }
}

/**
 * Will disconnect.
 * Default implementation forwards to the model.
 * The model should call back.
 * This can be overriden at brick creation time.
 */
eYo.magnet.BaseC9r_p.willDisconnect = function () {
  var f = this.model.willDisconnect
  if (eYo.isF(f)) {
    eYo.decorate.reentrant('willDisconnect',f).apply(this, arguments)
    return
  }
  if (this.isRight) {
    this.label_f.visible = this.brick.isGroup
  }
}

/**
 * Did disconnect.
 * Increment the brick step.
 * @param {eYo.magnet.BaseC9r} oldTargetM4t
 *     what was previously connected to the receiver
 * @param {eYo.magnet.BaseC9r} targetOldM4t
 *     what was previously connected to the old receiver's target
 */
eYo.magnet.BaseC9r_p.didDisconnect = function (oldTargetM4t, targetOldM4t) {
  // No need to increment step for the old connections because
  // if any, they were already disconnected and
  // the step has already been incremented then.
  if (!this.reentrant_.didDisconnect) {
    var f = this.model && this.model.didDisconnect
    if (eYo.isF(f)) {
      this.reentrant_.didDisconnect = true
      f.call(this, oldTargetM4t, targetOldM4t)
      this.reentrant_.didDisconnect = false
      return
    }
  }
}

/**
 * The type checking mechanism is fine grained compared to blockly's.
 * The check_ is used more precisely.
 * For example, elif bricks cannot connect to the suite connection, only the next connection.
 * @param {eYo.magnet.BaseC9r} other Magnet to compare against.
 * @param {Boolean} [force]  checks even if a connection is hidden or incog.
 * @return {boolean} True if the connections share a type.
 * @private
 * @suppress {accessControls}
 */
eYo.magnet.BaseC9r_p.checkType_ = function (other, force) {
  if (!eYo.event.recordingUndo) {
    // we are undoing or redoing
    // we will most certainly reach a state that was valid
    // some time ago
    return true
  }
  if (this.check_ && !this.check_.length) {
    return false
  }
  if (other.check_ && !other.check_.length) {
    return false
  }
  var m4tA = this.blackMagnet
  var m4tB = other.blackMagnet
  if (!m4tA || !m4tB) {
    return true
  }
  var dlgtA = m4tA.brick
  var dlgtB = m4tB.brick
  // short stop if one of the connection is hidden or disabled
  // except when we try to establish a connection with a wrapped brick.
  // in either case, returns true iff the connetion is aready established
  if (m4tA.wrapped_) {
    if (m4tA.target) {
      return m4tB === m4tA.target
    }
  } else if (m4tB.wrapped_) {
    if (m4tB.target) {
      return m4tA === m4tB.target
    }
  } else if (!force && dlgtA.isready && dlgtB.isready && (m4tA.incog_ || m4tB.incog_ || m4tA.hidden_ || m4tB.hidden_)) { // the `force` argument may be useless now that there is a readiness test.
    return m4tA === m4tB.target
  }
  var typeA = dlgtA.type // the brick type is not up to date
  var typeB = dlgtB.type // the brick type is not up to date
  var checkA = m4tA.check_
  var checkB = m4tB.check_
  if (m4tA.isSlot) {
    if (dlgtA.locked_) {
      return m4tA.target === m4tB
    }
    if (checkA) {
      if (checkB) {
        if (checkA.some(t => checkB.indexOf(t) >= 0)) {
          return true
        }
      } else {
        return checkA.indexOf(typeB) >= 0
      }
    }
    return true
  }
  if (m4tB.isSlot) {
    if (dlgtB.locked_) {
      return m4tA === m4tB.target
    }
    if (checkB) {
      if (checkA) {
        if (checkB.some(t => checkA.indexOf(t) >= 0)) {
          return true
        }
      } else if (checkB.indexOf(typeA) < 0) {
        return false
      } else {
        return true
      }
    }
    return true
  }
  if (checkA && checkA.indexOf(typeB) < 0) {
    return false
  }
  if (checkB && checkB.indexOf(typeA) < 0) {
    return false
  }
  return true
}


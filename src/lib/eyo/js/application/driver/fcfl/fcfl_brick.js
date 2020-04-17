/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate. Do nothing driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('brick')

eYo.brick.BUMP_DELAY = 250

/**
 * Facefull driver for bricks.
 */
eYo.fcfl.makeDriverC9r('Brick')

eYo.brick.BaseC9r.eyo.p6yMerge({
  ui () {
    return Object.create(null)
  },
  down: false,
  up: false,
  dragging: {
    didChange (before, after) /** @suppress {globalThis} */ {
      this.ui_driver.draggingSet(this, after)      
    }
  },
  /**
   * Position of the receiver in the board.
   * @type {eYo.geom.Point}
   * @readonly
   */
  xy: {
    value () {
      return new eYo.geom.Point()
    },
    copy: true,
  },
  hasLeftEdge: {
    get () {
      return !this.wrapped_ && !this.locked_
    },
  },
  hasRightEdge: {
    get () {
      return !this.wrapped_ && !this.locked_
    },
  },
  minBrickW: {
    get () {
      return this.isStmt ? eYo.span.INDENT : 0
    },
  },
  bBox: {
    get () {
      return this.rendered && (this.driver.getBBox(brick))
    },
  },
  hasSelect: {
    get () {
      return this.rendered && (this.driver.hasFocus(brick))
    },
  },
  visible: {
    /**
     * Get the display status of the receiver's brick.
     * Forwards to the driver.
     */
    get () {
      return this.driver.displayedGet(this)
    },
    /**
     * Set the display status of the receiver's brick.
     * Forwards to the driver.
     * @param {boolean} visible
     */
    set (after) {
      this.driver.displayedSet(this, visible)
    }
  },
})
eYo.brick.BaseC9r.eyo.aliasesMerge({
  'xy': 'where',
})

/**
 * Render the next brick, if relevant.
 * @param {*} recorder
 * @return {boolean=} true if an rendering message was sent, false otherwise.
 */
eYo.fcfl.Brick._p.drawFoot_ = function (io) {
  let brick = io.brick
  var m4t = brick.foot_m
  if (!m4t) {
    return
  }
  m4t.setOffset(0, brick.span.l)
  var t9k = m4t.targetBrick
  if (!t9k) {
    return
  }
  m4t.tighten()
  var do_it = !t9k.ui.rendered ||
  (!brick.up &&
    !eYo.magnet.disconnectedParent &&
    !eYo.magnet.disconnectedChild&&
    !eYo.magnet.connectedParent)
  if (do_it) {
    try {
      t9k.down = true
      t9k.render(false, io)
      io.span.foot = t9k.span.l
    } finally {
      t9k.down = false
    }
    return true
  }
}

/**
 * Render the right brick, if relevant.
 * Returns true if there is a right brick which is not a comment.
 * @param {*} io
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.fcfl.Brick._p.renderRight_ = function (io) {
  let brick = io.brick
  brick.span.right = 0
  var m4t = brick.right_m
  if (m4t) {
    var t9k = m4t.targetBrick
    if (t9k) {
      t9k.span.header = brick.span.header + brick.span.main - 1
      try {
        t9k.ui.startOfLine = io.common.startOfLine
        t9k.ui.startOfStatement = io.common.startOfStatement
        t9k.ui.mayBeLast = t9k.hasRightEdge
        t9k.down = true
        if (eYo.brick.debugStartTrackingRender) {
          console.log(eYo.brick.debugPrefix, 'DOWN')
        }
        if (t9k.wrapped_) {
          // force target rendering
          t9k.changeDone()
        }
        if (!t9k.up) {
          t9k.render(false, io)
          if (!t9k.wrapped_) {
            io.common.field.shouldSeparate = false
            io.common.field.afterSeparator = true
          }
        }
        io.cursor.c = m4t.where.c
      } finally {
        t9k.down = false
        var span = t9k.span
        if (span.w) {
          io.cursor.forward(span.width, span.height - 1)
          // We just rendered a brick
          // it is potentially the rightmost object inside its parent.
          if (t9k.hasRightEdge || io.common.shouldPack) {
            io.common.ending.push(t9k)
            t9k.ui.rightCaret = eYo.NA
            io.common.field.shouldSeparate = false
          }
          io.common.field.afterCaret = false
        }
      }
      brick.span.footer = t9k.span.footer + t9k.span.main - 1
      brick.span.right = t9k.span.c + t9k.span.right
      return !t9k.isComment
    } else if (brick.isGroup) {
      this.drawField_(m4t.label_f, io) // only the ':' or ';' trailing field.
      return false
    }
  }
}

/**
 * Render the suite brick, if relevant.
 * @param {*} recorder
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.fcfl.Brick._p.renderSuite_ = function (io) {
  let brick = io.brick
  var m4t = brick.suite_m
  if (!m4t) {
    return
  }
  if (eYo.brick.debugStartTrackingRender) {
    console.log(eYo.brick.debugPrefix, 'SUITE')
  }
  m4t.setOffset(eYo.span.INDENT, brick.span.main)
  let t9k = m4t.targetBrick
  if (t9k) {
    brick.ui.someTargetIsMissing = false
    m4t.tighten()
    if (!t9k.ui.rendered || !t9k.up) {
      try {
        t9k.down = true
        t9k.render(false)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        t9k.down = false
      }
    }
    brick.span.suite = t9k.span.l + t9k.span.foot
  } else {
    brick.span.suite = 0
  }
  return true
}

/**
 * May render the parent brick, if relevant.
 * @param {Object} recorder - A recorder object.
 * @param {boolean=} bbbl - If false, just render this brick.
 *   If true, also render brick's parent, grandparent, etc.  Defaults to true.
 * @return {boolean=} true if an rendering message was sent, false otherwise.
 */
eYo.fcfl.Brick._p.drawParent_ = function (io, bbbl) {
  let brick = io.brick
  // `this` is a brick
  if (bbbl === false || brick.down) {
    return
  }
  // Render all bricks above this one only
  // when the render message did not come from above!
  var parent = brick.parent
  if (parent) {
    var justConnected = eYo.magnet.connectedParent && brick.out_m === eYo.magnet.connectedParent.Target
    if (!parent.down) {
      try {
        parent.up = true
        var old = brick.up
        brick.up = true
        if (eYo.brick.DEBUG_StartTrackingRender) {
          console.log(eYo.brick.DEBUG_Prefix, 'UP')
        }
        parent.render(!justConnected, io)
      } finally {
        parent.up = false
        brick.up = old
      }
      if (justConnected) {
        if (parent.parent) {
          parent = parent.root
          try {
            parent.up = true
            if (eYo.brick.DEBUG_StartTrackingRender) {
              console.log(eYo.brick.DEBUG_Prefix, 'UP')
            }
            parent.render(false, io)
          } finally {
            parent.up = false
          }
        }
      }
      return true
    }
  } else {
    // Top-most brick.  Fire an event to allow scrollbars to layout.
    this.board.resizePort(brick)
  }
}

eYo.fcfl.Brick._p.longRender_ = eYo.decorate.reentrant_method(
  'longRender_',
  function (bbbl, recorder) {
    let brick = recorder.brick
    if (eYo.brick.DEBUG_StartTrackingRender) {
      var n = eYo.brick.DEBUG_Count[brick.id]
      eYo.brick.DEBUG_Count[brick.id] = (n||0)+1
      if (!eYo.brick.DEBUG_Prefix.length) {
        console.log('>>>>>>>>>>')
      }
      eYo.brick.DEBUG_Prefix = eYo.brick.DEBUG_Prefix + '.'
      console.log(eYo.brick.DEBUG_Prefix, brick.type, n, brick.id)
      if (n > 1) {
        n = n + 0
      }
    }
    try {
      var io = this.willRender_(brick, recorder)
      this.draw_(io)
      this.layoutMagnets_(io)
      this.drawFoot_(io)
      this.renderMove_(io)
      brick.updateShape()
      this.drawParent_(io, bbbl) || this.alignRightEdges_(io)
      this.didRender_(brick, io)
    } finally {
      if (eYo.brick.DEBUG_StartTrackingRender &&  eYo.brick.DEBUG_Prefix.length) {
        eYo.brick.DEBUG_Prefix = eYo.brick.DEBUG_Prefix.Substring(1)
      }
    }
  }
)
// deleted bricks are rendered during deletion
// this should be avoided
/**
 * Render the brick.
 * Lays out and reflows a brick based on its contents and settings.
 * Rendering is complicated considering the possibility of both line continuation and multi line strings.
 * @param {*} recorder
 * @param {boolean=} bbbl If false, just render this brick.
 *   If true, also render brick's parent, grandparent, etc.  Defaults to true.
 */
eYo.fcfl.Brick._p.render = function (brick, bbbl, recorder) {
  if (!brick.hasUI || brick.rendered === false) { // brick.rendered === eYo.NA is OK
    return
  }
  if (!brick.isEditing && (brick.dragging_ || brick.changer.level || !brick.board)) {
    return
  }
  this.drawPending_(recorder, !brick.wrapped_ && eYo.key.LEFT)
  // rendering is very special when this is just a matter of
  // statement connection
  if (brick.rendered) {
    if (eYo.magnet.disconnectedChild && brick.head_m === eYo.magnet.disconnectedChild) {
      // this is the child one
      var io = this.willShortRender_(brick, recorder)
      this.layoutMagnets_(io)
      this.drawFoot_(io)
      this.renderMove_(io)
      brick.updateShape()
      brick.changer.save.render = brick.changer.count
      this.drawParent_(io, bbbl) || this.alignRightEdges_(io) // will they have a parent meanwhile?
      return
    } else if (eYo.magnet.disconnectedParent && brick.foot_m === eYo.magnet.disconnectedParent) {
      // this is the parent one
      // but it may belong to a suite
      var io = this.willShortRender_(brick, recorder)
      this.layoutMagnets_(io)
      this.drawFoot_(io)
      this.renderMove_(io)
      brick.updateShape()
      brick.changer.save.render = brick.changer.count
      this.drawParent_(io, bbbl) || this.alignRightEdges_(io)
      return
    } else if (eYo.magnet.connectedParent) {
      if (brick.head_m && eYo.magnet.connectedParent === brick.head_m.target) {
        var io = this.willShortRender_(brick, recorder)
        this.layoutMagnets_(io)
        this.drawFoot_(io)
        this.renderMove_(io)
        brick.updateShape()
        brick.changer.save.render = brick.changer.count
        this.drawParent_(io, bbbl) || this.alignRightEdges_(io)
      } else if (brick.foot_m && eYo.magnet.connectedParent === brick.foot_m) {
        var io = this.willShortRender_(brick, recorder)
        this.layoutMagnets_(io)
        this.drawFoot_(io)
        this.renderMove_(io)
        brick.updateShape()
        brick.changer.save.render = brick.changer.count
        this.drawParent_(io, bbbl) || this.alignRightEdges_(io)
      } else if (brick.suite_m && eYo.magnet.connectedParent === brick.suite_m) {
        var io = this.willShortRender_(brick, recorder)
        this.layoutMagnets_(io)
        this.drawFoot_(io)
        this.renderMove_(io)
        brick.updateShape()
        brick.changer.save.render = brick.changer.count
        this.drawParent_(io, bbbl) || this.alignRightEdges_(io)
      }
    }
  }
  if (!brick.down && brick.out_m) {
    // always render from a line start id est
    // an orphan brick or a statement brick with no left brick
    var parent
    if ((parent = brick.parent)) {
      var next
      while (parent.out_m && !parent.down && (next = parent.parent)) {
        parent = next
      }
      // parent has no output magnet or has no parent.
      recorder && (recorder.field.last = eYo.NA)
      if (!parent.down) {
        if (eYo.magnet.connectedParent && eYo.magnet.connectedParent.Brick === this) {
          try {
            parent.up = true
            parent.render(bbbl, recorder)
          } finally {
            parent.up = false
          }
        } else {
          parent.render(bbbl, recorder)
        }
      }
      return
    }
  }
  if (brick.changer.save.render === brick.changer.count) {
    // minimal rendering
    var io = this.willShortRender_(brick, recorder)
    this.layoutMagnets_(io)
    this.drawFoot_(io)
    this.renderMove_(io)
    brick.updateShape()
    this.drawParent_(io, bbbl) || this.alignRightEdges_(io)
    return
  }
  this.longRender_(bbbl, recorder)
  brick.changer.save.render = brick.changer.count
}

/**
 * Will draw the brick, short version.
 * The print statement needs some preparation before drawing.
 * @param {*} recorder
 * @private
 */
eYo.fcfl.Brick._p.willShortRender_ = function (brick, recorder) {
  return this.newDrawRecorder_(brick, recorder)
}

/**
 * Translates the brick, forwards to the ui driver after managing the snap formal argument.
 * Contrary to |moveBy| there is no undo management here.
 * @param {eYo.brick.BaseC9r} brick - The brick to move.
 * @param {eYo.geom.Point} xy - The xy coordinate of the translation in board units.
 * @param {Boolean} snap Whether we should snap to the grid.
 */
eYo.fcfl.Brick._p.moveTo = function(brick, xy, snap) {
  if (snap && brick.board && !brick.board.dragging && !brick.parent && !brick.isInFlyout) {
    xy = eYo.geom.clPoint(xy.c, xy.l)
  }
  brick.xy_ = xy
  this.place(brick)
  this.placeMagnets_(brick)
}

/**
 * Move a standalone brick by a relative offset.
 * Event aware for top blocks, except when dragging.
 * @param {number} dxy Offset in board units.
 * @param {Boolean} snap Whether we should snap to the grid.
 */
eYo.fcfl.Brick._p.moveBy = function(brick, dxy, snap) {
  var xy = brick.xy.forward(dxy)
  if (brick.parent || brick.desk.desktop.isDragging) {
    this.moveTo(brick, xy)
  } else {
    eYo.event.fireBrickMove(brick, () => {
      this.moveTo(brick, xy, snap)
      brick.board.resizePort(brick)
    })
  }
}

/**
 * Will draw the brick.
 * Prepares the brick and forwards to the driver.
 * @param {*} recorder
 * @private
 */
eYo.fcfl.Brick._p.willRender_ = function (brick, recorder) {
  brick.consolidate()
}

/**
 * Update all of the connections on this with the new locations.  * @private
 */
eYo.fcfl.Brick._p.renderMoveMagnets_ = function(brick) {
  var xy = brick.whereInBoard
  var f = m4t => {
    if (m4t) {
      m4t.moveToOffset(xy)
      var t9k = m4t.targetBrick
      if (t9k) {
        m4t.tighten()
        // t9k.ui_driver.placeMagnets_(t9k)
      }
    }
  }
  // Don't tighten previous or output connections because they are inferior
  // connections.
  var m5s = brick.magnets
  var m4t
  if ((m4t = m5s.left)) {
    m4t.moveToOffset(xy)
  }
  if ((m4t = m5s.head)) {
    m4t.moveToOffset(xy)
  }
  if ((m4t = m5s.out)) {
    m4t.moveToOffset(xy)
  }
  this.slotForEach(brick, slot => f(slot.magnet))
  // next is done while rendering
  // f(m5s.right)
  // f(m5s.suite)
  f(m5s.foot)
}

/**
 * Update all of the connections on this with the new locations.
 * @private
 */
eYo.fcfl.Brick._p.placeMagnets_ = function(brick) {
  var xy = brick.whereInBoard
  var f = m4t => {
    if (m4t) {
      m4t.moveToOffset(xy)
      var t9k = m4t.targetBrick
      if (t9k) {
        m4t.tighten()
        t9k.ui_driver.placeMagnets_(t9k)
      }
    }
  }
  // Don't tighten previous or output connections because they are inferior
  // connections.
  var m5s = brick.magnets
  var m4t
  if ((m4t = m5s.left)) {
    m4t.moveToOffset(xy)
  }
  if ((m4t = m5s.head)) {
    m4t.moveToOffset(xy)
  }
  if ((m4t = m5s.out)) {
    m4t.moveToOffset(xy)
  }
  this.slotForEach(brick, slot => f(slot.magnet))
  // next is done while rendering
  // f(m5s.right)
  // f(m5s.suite)
  f(m5s.foot)
}

/**
 * Layout brick magnets.
 * @param {*} recorder
 * @private
 */
eYo.fcfl.Brick._p.renderMove_ = function (io) {
  let brick = io.brick
  this.renderMoveMagnets_(brick)
}

/**
 * Layout previous, next and output brick connections.
 * @param {*} recorder
 * @private
 */
eYo.fcfl.Brick._p.layoutMagnets_ = function (recorder) {
  let brick = recorder.brick
  var m5s = brick.magnets
  var m4t = m5s.out
  if (m4t) {
    m4t.setOffset()
  } else {
    if ((m4t = m5s.head)) {
      m4t.setOffset()
    }
    if ((m4t = m5s.foot)) {
      if (brick.collapsed) {
        m4t.setOffset(0, 2)
      } else {
        m4t.setOffset(0, brick.span.height)
      }
    }
    if ((m4t = m5s.left)) {
      m4t.setOffset()
    }
    if ((m4t = m5s.right)) {
      m4t.setOffset(brick.span.width, 0)
    }
  }
}

/**
 * Draw the path of the brick.
 * @param {*} recorder - 
 * @private
 */
eYo.fcfl.Brick._p.draw_ = function (recorder) {
  let brick = recorder.brick
  if (this.canDraw(brick)) {
    try {
      var io = this.drawModelBegin_(recorder)
      this.drawModel_(io)
      this.drawModelEnd_(io)
    } finally {
      this.renderRight_(io) || this.renderSuite_(io)
      brick.updateShape()
      this.drawSharp_(io)
    }
    return io
  }
  return recorder
}

/**
 * Align the right edges by changing the width of all the connected statement bricks. For each line, only the last statement
 * of the line is extended.
 * Only for root bricks.
 * @param {*} recorder
 * @protected
 */
eYo.fcfl.Brick._p.alignRightEdges_ = eYo.changer.memoize(
  'alignRightEdges_',
  function (recorder) {
    let brick = recorder.brick
    if (brick.parent || !brick.isStmt || !brick.rendered || !brick.board || !brick.hasUI) {
      return
    }
    var right = 0
    var t = eYo.span.INDENT
    brick.stmtForEach((b, depth) => {
      if (b.span.min_c) {
        var c = t * depth + b.span.min_c
        // all the right bricks now
        var x = b
        while ((x = x.right)) {
          c += x.span.min_c - 1 // `- 1` because bricks will overlap one space for the vertical boundaries
        }
        right = Math.max(right, c)
      }
    })
    if (right) {
      brick.stmtForEach((b, depth) => {
        var c = right - t * depth
        // find the last right brick and
        var bb = b
        while ((bb = bb.right)) {
          c -= bb.span.min_c - 1 // see comment above
          b = bb
        }
        if (b.c !== c) {
          b.span.c = c
          b.updateShape()
        }
      })
    }
  }
)

/**
 * Get a new draw recorder.
 * @param {*} recorder  Null iff this is the first brick rendered
 * of that rendering process.
 * @private
 */
eYo.fcfl.Brick._p.newDrawRecorder_ = function (brick, recorder) {
  var io = {
    brick: brick,
    steps: [],
    n: 0, // count of rendered objects (fields, slots and inputs)
    form: eYo.NA // rendered field or magnet
  }
  io.cursor = eYo.geom.xyPoint(0, brick.span.header)
  if (recorder) {
    // io inherits some values from the given recorder
    io.recorder = recorder
    io.common = recorder.common // It is always defined
  } else {
    io.common = {
      pending: eYo.NA,
      ending: [],
      shouldSeparate: false,
      afterEdge: false,
      shouldPack: false,
      startOfStatement: false,
      startOfLine: !brick.isExpr || !brick.parent, // statement, group or orphan brick
      field: {
        afterBlack: false, // true if the position before the cursor contains a black character
        afterSeparator: false, // true if the position before the cursor contains a mandatory white character
        afterCaret: false, // true if the position before the cursor contains a caret, id est an otional input magnet
        shouldSeparate: false // and other properties...
      },
      header: 0 // used when a brick will render its right sibling
    }
  }
  // A "star like" field's text is one of '*', '+', '-', '~'...
  // This field is the very first of the brick.
  // Once we have rendered a field with a positive length,
  // we cannot have a star like field.
  io.common.field.canStarLike = true
  brick.ui.firstRenderedMagnet = brick.ui.lastRenderedMagnet = eYo.NA
  io.footer = 0
  io.main = 1
  return io
}

/**
 * Prepare rendering of a brick.
 * @param {Object} [recorder]
 * @return {!Object} a local recorder
 * @private
 */
eYo.fcfl.Brick._p.drawModelBegin_ = function (recorder) {
  let brick = recorder.brick
  brick.ui.parentIsShort = false
  brick.ui.isShort = false
  brick.ui.someTargetIsMissing = false
  // we define the `io` named recorder which is specific to brick.
  var io = this.newDrawRecorder_(brick, recorder)
  // By default, we restart from scratch,
  // set the size to 0 for the width and 1 for the height
  // And reset properties
  brick.ui.mayBeLast = false
  brick.ui.isLastInExpression = false
  brick.ui.isLastInStatement = false
  // Do we need some room for the left side of the brick?
  // no for wrapped bricks
  if (!brick.wrapped_) {
    if (!brick.isExpr || !brick.locked_ || !recorder) {
      // statement or unlocked,
      // one space for the left edge of the brick
      // (even for locked statements, this is to avoid a
      // display shift when locking/unlocking)
      io.cursor.c = 1
      io.common.field.afterBlack = false
    }
  }
  if (brick.hasLeftEdge || !recorder || !brick.out_m) {
    // statement or unlocked,
    // one space for the left edge of the brick
    // (even for locked statements, this is to avoid a
    // display shift when locking/unlocking)
    io.cursor.c = 1
    io.common.field.afterBlack = false
    io.common.field.afterSeparator = true
    io.common.field.shouldSeparate = false
    // Do not change io.common.field.shouldSeparate ?
  }
  if (brick.isExpr) {
    brick.ui.startOfStatement = io.common.startOfStatement
    brick.ui.startOfLine = io.common.startOfLine
  } else {
    brick.ui.startOfStatement = io.common.startOfStatement = true
    brick.span.header = 0
  }
  return io
}

/**
 * Render the inputs, the fields and the slots of the brick.
 * The `recorder` is an object that keeps track of some
 * rendering information. It is the argument of various methods.
 * This method is executed at least once for any rendered brick.
 * Since then, it won't be executed as long as the brick has not been edited.
 * @param {Object} [io]
 * @private
 */
eYo.fcfl.Brick._p.drawModel_ = function (io) {
  let brick = io.brick
  this.fieldDrawFrom_(brick.fieldHead, io)
  if ((io.slot = brick.slotAtHead)) {
    do {
      this.slotDraw_(io)
    } while ((io.slot = io.slot.next))
  }
  this.fieldDrawFrom_(brick.fieldTail, io)
  return
}

/**
 * Terminate to render the model.
 * @param {Object} [recorder]
 * @private
 */
eYo.fcfl.Brick._p.drawModelEnd_ = function (brick, io) {
  // and now some space for the right edge, if any
  let f = io.common.field
  if (!brick.wrapped_) {
    if (brick.isExpr) {
      if (f.last && f.last.isEditing) {
        io.cursor.c += 1
        f.afterSeparator = false
        f.afterBlack = false
      } else if (!io.recorder || f.didPack) {
        io.cursor.c += 1
        f.afterSeparator = f.shouldSeparate
        f.shouldSeparate = false
        f.afterBlack = false
      } else if (f.shouldSeparate) {
        if (!io.recorder) {
          io.cursor.c += 1
          f.afterSeparator = f.shouldSeparate
          f.shouldSeparate = false
          f.afterBlack = false
        } else if (!brick.locked_ && !io.common.ending.length) {
          io.cursor.c += 1
          f.afterSeparator = f.shouldSeparate
          f.shouldSeparate = false
          f.afterBlack = false
        }
      } else {
        io.cursor.c += 1
        f.afterSeparator = f.shouldSeparate
        f.shouldSeparate = false
        f.afterBlack = false
      }
    } else {
      io.cursor.c += 1
      f.afterSeparator = false
      f.afterBlack = false
    }
  }
  if (!brick.isExpr) {
    this.drawEnding_(io, true, true)
  } else if (!io.recorder) {
    this.drawEnding_(io, true)
  }
  this.drawPending_(io)
  if (!brick.wrapped_) {
    var m4t = io.form
    var t9k = m4t && m4t.targetBrick
    if (io.n < 2 && !brick.wrapped_) {
      // this is a short brick, special management of selection
      brick.ui.isShort = true
      if (t9k) {
        t9k.ui.parentIsShort = true
        // always add a space to the right
        t9k.ui.isLastInStatement = false
        t9k.updateShape()
        io.cursor.c += 1
      }
    } else {
      brick.ui.isShort = false
      if (t9k) {
        t9k.ui.parentIsShort = false
      }
    }
  }
  brick.span.c_min = io.cursor.c = Math.max(io.cursor.c, brick.minBrickW)
  if (io.recorder) {
    // We ended a brick. The right edge is generally a separator.
    // No need to add a separator if the brick is wrapped or locked
    f.shouldSeparate && (f.shouldSeparate = !brick.hasRightEdge)
    // if the brick is wrapped or locked, there won't be any
    // right edge where a caret could be placed.
    // But may be we just rendered bricks in cascade such that
    // there might be some right edge already.
  }
  brick.ui.lastRenderedMagnet = io.common.magnetDone
}

/**
 * Render the slot given in io parameter.
 * @param io
 * @private
 */
eYo.fcfl.Brick._p.slotDraw_ = function (io) {
  var slot = io.slot
  // if (!slot) {
  //   return
  // }
  if (!slot.incog) {
    // move the slot to the correct location
    slot.where.set(io.cursor)
    // Now reset the cursor relative to the slot
    io.cursor.set()
    this.fieldDrawFrom_(slot.fieldHead, io)
    if ((io.magnet = slot.magnet)) {
      this.drawInputMagnet_(io)
    }
    this.fieldDrawFrom_(slot.fieldTail, io)
    // come back to the brick coordinates
    io.cursor.forward(slot.where)
    // translate at the end because `slot.where` may change
    // due to the shrink process
  }
  slot.display()
}

/**
 * Render the leading # character for collapsed statement bricks.
 * Statement subclasses must override it.
 * @param io
 * @private
 */
eYo.fcfl.Brick._p.drawSharp_ = function (io) {
  let brick = io.brick
  if (brick.isControl) { // Not very clean, used as hook before rendering the comment fields.
    io.cursor.c += 4
  } else if (brick.isStmt) {
    this.drawSharp(brick, brick.disabled)
    if (brick.disabled) {
      io.cursor.c += 2
      io.common.startOfLine = io.common.startOfStatement = false
    }
  }
}

/**
 * Draw/hide the sharp.
 * Default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @param {Boolean} visible - the brick the driver acts on
 * @private
 */
eYo.fcfl.Brick._p.drawSharp = eYo.doNothing

/**
 * Render the given field, when defined.
 * This is the process that make the cursor move,
 * together with brick boundaries.
 *
 * @param {Object} field A field.
 * @param {Object} io An input/output recorder.
 * @private
 */
eYo.fcfl.Brick._p.drawField_ = function (field, io) {
  let brick = io.brick
  var c = io.cursor.c
  field.displayedUpdate()
  if (field.visible) {
    // Actually, io.cursor points to the location where the field
    // is expected. It is relative to the enclosing `SVG` group,
    // which is either a brick or a slot.
    // If there is a pending caret, draw it and advance the cursor.
    io.form = field
    field.willRender()
    field.textUpdate()
    //    field.textRemove()
    var text = field.displayText
    // Replace the text.
    if (text.length) {
      if (text === '>') {
        console.error(io)
      }
      this.drawEnding_(io)
      this.drawPending_(io)
      io.common.startOfLine = io.common.startOfStatement = false
      ++ io.n
      if (field.size.l === 1) {
      //    this.fieldTextCreate(brick, field)
        var head = text[0]
        var tail = text[text.length - 1]
        if (field.model.literal) {
          io.common.field.didPack = 0
        } else if (field.isLabel && io.common.field.afterBlack) {
          io.cursor.c += 1
          io.common.field.afterBlack = true
        } else {
          if (!io.common.field.shouldSeparate
            && !io.common.field.afterSeparator
            && !io.common.field.afterBlack
            && !io.common.startOfLine
            && !io.common.field.afterCaret) {
            if (brick.ui.packedQuotes && (head === "'" || head === '"')) {
              io.cursor.c -= 1
            } else if (brick.ui.packedBrackets && head === "[") {
              io.cursor.c -= 1
            } else if (brick.ui.packedBraces && head === "{") {
              io.cursor.c -= 1
            } else if (brick.ui.packedParenthesis && head === "(") {
              io.cursor.c -= 1
            }
          } else if (head === '.' && !io.common.field.afterBlack) {
            io.cursor.c -= 1
          } else if (io.common.field.afterBlack
            && (eYo.xre.operator.test(head) || head === '=' || (head === ':' && text.length > 1 /* `:=` but not `:` alone */))) {
            io.cursor.c += 1
          } else if (io.common.field.shouldSeparate
              && (!field.startsWithSeparator
              || head === '='
              || (head === ':' && text.length > 1 /* `:=` but not `:` alone */))) {
            io.cursor.c += 1
          }
        }
        io.common.field.wasStarLike = (io.common.field.canStarLike && (['*', '@', '+', '-', '~', '.'].indexOf(tail) >= 0))
        io.common.field.canStarLike = false
        io.common.field.shouldSeparate = !io.common.field.wasStarLike
          && (eYo.xre.id_continue.test(tail)
            || eYo.xre.operator.test(tail)
            || tail === ':'
            || tail === '='
            || tail === '#'
            || tail === ','
            || (tail === '.'
              && (!(field instanceof eYo.fieldLabel))))
        io.common.field.afterBlack = !eYo.xre.white_space.test(tail)
        io.common.field.afterCaret = false
        // place the field at the right position:
      }
      field.moveTo(io.cursor)
      // then advance the cursor after the field.
      if (field.size.w) {
        io.cursor.c += field.size.c
        io.cursor.l += field.size.l - 1
        // now that I have rendered something
        io.common.startOfLine = io.common.startOfStatement = false
      }
      if (io.cursor.c > 2) {
        if ((tail === '"' || tail === "'") && brick.ui.packedQuotes) {
          io.common.shouldPack = null // this
        } else if (tail === ']' && brick.ui.packedBrackets) {
          io.common.shouldPack = this
        } else if ((tail === '}') && brick.ui.packedBraces) {
          io.common.shouldPack = this
        } else if ((tail === ')') && brick.ui.packedParenthesis) {
          io.common.shouldPack = this
        }
      }
    }
    if (field.isEditing) {
      // This is a trick to avoid some bad geometry while editing
      // this is useful for view only.
      io.cursor.c += 1
      io.common.field.shouldSeparate =
      io.common.field.afterBlack = false
    }
    io.common.field.last = field
    io.common.afterEdge = false
  }
  return io.cursor.c - c
}

/**
 * Render the given field, when defined.
 *
 * @param {Object} field A field.
 * @param {Object} io An input/output recorder.
 * @private
 */
eYo.fcfl.Brick._p.fieldDrawFrom_ = function (field, io) {
  if (field) {
    do {
      this.drawField_(field, io)
    } while ((field = field.nextField))
  }
}

/**
 * Render the fields of a brick input/slot.
 * Fields are either before or after the connection.
 * If `only_prefix` is true, only fields before the
 * connection are rendered.
 * @param {Object} io An input/output record.
 * @param {Boolean} [only_prefix]
 * @return {Number}  The advance of the cursor (in columns)
 * @private
 */
eYo.fcfl.Brick._p.drawFields_ = function (io, only_prefix) {
  var current = io.cursor.c
  io.slot.fieldForEach(field => {
    if (!!only_prefix === !field.suffix) {
      this.drawField_(field, io)
    }
  })
  return io.cursor.c - current
}

/**
 * Render the ending bricks.
 *
 * In order to save space, we put caret at the end of bricks
 * and we shrink bricks to the minimum.
 *
 * When expression bricks are stacked, there is no need to
 * spend space just to draw the edges.
 * We can save space by drawing the brick edges on top of each others.
 *
 * When we start rendering a new brick,
 * `io.common.field.shouldSeparate` is set to `false`.
 * If we enter a child brick, with no field nor splot before,
 * then we should decrease `cursor`.
 * This is why the right end of expression bricks
 * may be a straight line instead of a curved one
 * when at the end of a statement brick.
 * This situation depends of information given after a brick is
 * rendered. One solution is to scan all the bricks to prepare
 * rendering, then scan again to render.
 * We assume that only one loop is more efficient.
 * In that case, we must wait until a statement brick is rendered
 * to properly locate and display connection,
 * and to properly display the last brick.
 * In order to display a caret connection properly,
 * we attach to each brick ending with a one character spaced
 * right edge a pending connection that might be displayed
 * over that right edge.
 * we consider the first fullfilled of these conditions:
 *
 * 1) we just rendered an expression brick
 * that ends with a white space (not wrapped nor locked)
 * but have no pending connection attached
 *
 * 2) we won't render any field until the end of the brick
 * and the brick ends with a white space
 *
 * This message is sent at the end of statement brick rendering.
 * It is also sent each time we have rendered a field or a slot.
 * @param {Object} [io] the input/output argument.
 * @private
 */
eYo.fcfl.Brick._p.drawEnding_ = function (io, isLast = false, inStatement = false) {
  if (io) {
    var isLastInExpression = isLast && !inStatement
    var isLastInStatement = isLast && inStatement
    if (io.common.ending.length) {
      // should we shrink after a quote or a bracket?
      if (io.common.shouldPack && (!isLast || io.common.shouldPack.wrapped_)) {
        // first loop to see if there is a pending rightCaret
        // BTW, there can be an only one right caret
        if (io.common.ending.some(b3k => !!b3k.ui.rightCaret)) {
          io.common.shouldPack = eYo.NA
        } else {
          // there is no following right caret, we can pack
          var pack = false
          io.common.ending.forEach(b3k => {
            if (b3k === io.common.shouldPack) {
              io.common.shouldPack = eYo.NA
              pack = true
              io.cursor.c -= 1
              // from now on, we pack just one character width
            }
            if (pack) {
              b3k.span.c = Math.max(b3k.ui.minBrickW, b3k.span.c - 1)
              io.common.field.didPack = true
              io.common.field.afterBlack = true
            }
          })
        }
      }
      io.common.ending.forEach(b3k => {
        b3k.ui.mayBeLast = false
        b3k.ui.isLastInExpression = isLastInExpression
        b3k.ui.isLastInStatement = isLastInStatement
      })
      io.common.ending.forEach(b3k => {
        b3k.updateShape()
        var m4t = b3k.ui.rightCaret
        if (m4t) {
          m4t.side = eYo.key.RIGHT
          m4t.shape = eYo.key.NONE
          m4t.ui.isLastInStatement =isLastInStatement
          var d = eYo.shape.definitionWithMagnet(m4t) // depends on the shape and the side
          var brick = m4t.brick
          if (this === brick) {
            // we are lucky, this is the brick we are currently rendering
            io.steps.push(departFocus)
          } else {
            // bad luck, brick has already been rendered
            // we must append the definition to the path
            // this may happen for bricks with no left or right end,
            // eg locked or wrapped bricks.
            var path = brick.pathInner_
            path.setAttribute('d', `${path.getAttribute('d')} ${d}`)
          }
        }
      })
      io.common.ending.length = 0
    }
  }
}

/**
 * Render a pending caret, if relevant.
 * @param {Object} [io] the input/output argument.
 * @param {String} [side] On which side of a brick.
 * @param {String} [shape] Which is the shape.
 * @private
 */
eYo.fcfl.Brick._p.drawPending_ = function (io, side = eYo.key.NONE, shape = eYo.key.NONE) {
  if (io) {
    var m4t = io.common.pending
    if (m4t) {
      m4t.side = side
      m4t.shape = io.ui.isLastInStatement ? eYo.key.Right : shape
      var shp = eYo.shape.newWithMagnet(m4t)
      var b3k = m4t.brick
      if (io.brick === b3k) {
        // we are lucky, this is the brick we are currently rendering
        io.steps.push(shp.definition)
      } else {
        // bad luck, brick has already been rendered
        // we must append the definition to the path
        // this may happen for bricks with no left or right end,
        // eg locked or wrapped bricks.
        var path = b3k.pathInner_
        path.setAttribute('d', `${path.getAttribute('d')} ${shp.definition}`)
      }
      if (shp.width) {
        // should we advance the cursor?
        if (m4t.side === eYo.key.NONE) {
          io.cursor.forward(shp.width)
          io.common.startOfLine = io.common.startOfStatement = false
        }
        // a space was added as a visual separator anyway
        io.common.field.shouldSeparate = false
        // all done
        io.common.pending = eYo.NA
        io.common.field.afterBlack = false // do not step back
        io.common.field.afterCaret = true // do not step back
      }
      return shp
    }
  }
}

/**
 * Render the input magnet.
 * @param {Object} io the input/output argument.
 * @private
 */
eYo.fcfl.Brick._p.drawInputMagnet_ = function (io) {
  var m4t = io.magnet
  m4t.renderedRight = eYo.NA
  m4t.renderedLeft = io.common.magnetDone
  if (io.common.magnetDone) {
    io.common.magnetDone.inputRight = io.magnet
  } else {
    brick.ui.firstRenderedMagnet = io.magnet
  }
  io.common.magnetDone = io.magnet
  ++ io.n
  m4t.startOfLine = io.common.startOfLine
  m4t.startOfStatement = io.common.startOfStatement
  io.form = m4t
  m4t.side = m4t.shape = eYo.NA
  io.common.field.canStarLike = false
  // io.cursor is relative to the brick or the slot
  // but the magnet must be located relative to the brick
  // the magnet will take care of that because it knows
  // if there is a slot.
  var t9k = m4t.targetBrick
  if (t9k) {
    if (m4t.bindField && m4t.bindField.visible) {
      m4t.setOffset(io.cursor.c - m4t.w, io.cursor.l)
      // The `bind` field hides the connection.
      // The bind field is always the last field before the connection.
      // if the connection has a bindField, then rendering the placeholder
      // for that connection is a bit different.
      // Don't display anything for that connection
      io.common.field.afterCaret = false
    }
    var ui = t9k.ui
    try {
      ui.startOfLine = io.common.startOfLine
      ui.startOfStatement = io.common.startOfStatement
      ui.mayBeLast = ui.hasRightEdge
      ui.down = true
      if (eYo.brick.DEBUG_StartTrackingRender) {
        console.log(eYo.brick.DEBUG_Prefix, 'DOWN')
      }
      if (t9k.wrapped_) {
        // force target rendering
        t9k.changeDone()
      }
      m4t.setOffset(io.cursor)
      if (m4t.c === 1 && !io.common.field.afterBlack && m4t.slot) {
        m4t.slot.where.c -= 1
        m4t.setOffset(io.cursor)
        if (io.magnet && io.magnet.renderedLeft && io.magnet.renderedLeft.startOfLine) {
          ui.startOfLine = ui.startOfStatement = io.common.startOfLine = io.common.startOfStatement = true
        }
      }
      if (brick.out_m !== eYo.magnet.disconnectedChild && !ui.up) {
        t9k.render(false, io)
        if (!t9k.wrapped_) {
          io.common.field.shouldSeparate = false
          io.common.field.afterSeparator = true
        }
      }
    } finally {
      ui.down = false
      var span = t9k.span
      if (span.w) {
        brick.span.main += span.main - 1
        io.cursor.forward(span.c, span.main - 1)
        // We just rendered a connected input brick
        // it is potentially the rightmost object inside its parent.
        if (ui.hasRightEdge || io.common.shouldPack) {
          io.common.ending.push(t9k)
          ui.rightCaret = eYo.NA
          io.common.field.shouldSeparate = false
        }
        io.common.field.afterCaret = false
      }
    }
  } else {
    if (!m4t.target) {
      brick.ui.someTargetIsMissing = true
    }
    if (m4t.bindField && m4t.bindField.visible) {
      m4t.setOffset(io.cursor.c - m4t.w, io.cursor.l)
      // The `bind` field hides the connection.
      // The bind field is always the last field before the connection.
      // if the connection has a bindField, then rendering the placeholder
      // for that connection is a bit different.
      // Don't display anything for that connection
      io.common.field.afterCaret = false
    } else if (!brick.locked_ && !m4t.hidden_) {
      // locked bricks won't display any placeholder
      // (slot with no target)
      if (!m4t.disabled_) {
        m4t.setOffset(io.cursor)
        m4t.startOfLine = io.common.startOfLine
        m4t.startOfStatement = io.common.startOfStatement
        if (m4t.s7r_) {
          m4t.side = eYo.key.NONE
          var ending = io.common.ending.slice(-1)[0]
          if (ending && !ending.ui.rightCaret) {
            // an expression brick with a right end has been rendered
            // we put the caret on that end to save space,
            // we move the connection one character to the left
            io.cursor.c -= 1
            m4t.setOffset(io.cursor)
            io.cursor.c += 1
            ending.ui.rightCaret = m4t
            m4t.isAfterRightEdge = io.afterEdge
            io.common.field.afterCaret = true
          } else {
            // we might want this caret not to advance the cursor
            // If the next rendered object is a field, then
            // this caret should be rendered normally
            // and the cursor should advance.
            // If the next rendered object is an expression brick
            // with a left end, then this caret shoud be rendered
            // with a left shape and the cursor should not advance.
            // If the caret is the last rendered object of the brick,
            // then it should be rendered with special shape and
            // the cursor should not advance.
            io.common.pending = m4t
          }
          io.common.field.shouldSeparate = false
        } else if (m4t.optional_) {
          this.drawPending_(io)
          io.common.pending = m4t
        } else {
          this.drawPending_(io)
          if (m4t.c === 1) {
            if (m4t.slot) {
              m4t.slot.where.c -= 1
            } else {
              io.cursor.c = m4t.where.c = 0
            }
            m4t.setOffset(io.cursor)
          }
          var shape = eYo.shape.newWithMagnet(m4t)
          io.steps.push(shape.definition)
          if (shape.width) {
            io.cursor.c += shape.width
            // a space was added as a visual separator anyway
          }
          io.common.field.afterSeparator = io.common.field.shouldSeparate
          io.common.field.shouldSeparate = false
        }
        io.common.afterEdge = true
      }
    }
  }
}

/**
 * Update the shape of the brick.
 * Forwards to the driver.
 * @protected
 */
eYo.driver.makeForwarder(eYo.brick.BaseC9r_p, 'updateShape')

/**
 * Update the shape of the brick.
 * To be subclassed.
 * @param {eYo.brick.BaseC9r} brick - The brick of which the shape would need an update
 * @protected
 */
eYo.fcfl.Brick._p.updateShape = eYo.doNothing

/**
 * Hide the brick.
 * Forwards to the driver.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcfl.Brick._p.hide = function (brick) {
  this.displayedSet(brick, false)
}

/**
 * The default implementation forwards to the driver.
 * This must take place while the brick is still in a consistent state.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcfl.Brick._p.disposeEffect = function (brick) {
  missing implementation
}

/**
 * Show the given menu.
 * The default implementation forwards to the driver.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @param {*} menu
 */
eYo.fcfl.Brick._p.showMenu = function (brick, menu) {
  this.MenuShow(brick, menu)
}

//////////////////

/**
 * Did connect some brick's connection to another connection.
 * When connecting locked bricks, select the receiver.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @param {eYo.magnet.BaseC9r} m4t what has been connected in the brick
 * @param {eYo.magnet.BaseC9r} oldTargetM4t what was previously connected in the brick
 * @param {eYo.magnet.BaseC9r} targetOldM4t what was previously connected to the new targetConnection
 */
eYo.fcfl.Brick._p.didConnect = function (brick, m4t, oldTargetM4t, targetOldM4t) {
  if (m4t.isOut) {
    m4t.brick.statusTopRemove_()
  }
}

/**
 * Converse of the preceeding.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @param {eYo.magnet.BaseC9r} m4t what has been connected in the brick
 * @param {eYo.magnet.BaseC9r} oldTargetM4t what was previously connected in the brick
 */
eYo.fcfl.Brick._p.didDisconnect = function (brick, m4t, oldTargetM4t) {
  if (m4t.isOut) {
    m4t.brick.statusTopAdd_()
  }
}

/**
 * Return the coordinates of the top-left corner of this relative to the
 * drawing surface's origin (0,0), in board units.
 * If the brick is on the board, (0, 0) is the origin of the board
 * coordinate system.
 * This does not change with board scale.
 * @return {!eYo.geom.Point} Object with .x and .y properties in
 *     board coordinates.
 */
eYo.fcls.Brick._p.whereInParent = eYo.do.NYI

eYo.fcls.Brick._p.xyInParent = eYo.do.NYI

eYo.fcls.Brick._p.whereInBoard = eYo.do.NYI

eYo.fcls.Brick._p.xyInDesk = eYo.do.NYI

/**
 * Returns the coordinates of a bounding rect describing the dimensions of the brick.
 * As the shape is not the same comparing to Blockly's default,
 * the bounding rect changes too.
 * Coordinate system: board coordinates.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @return {!eYo.geom.Rect}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
eYo.fcfl.Brick._p.boundingRect = function (brick) {
  return new eYo.geom.Rect(
    brick.whereInBoard,
    brick.size
  )
}
/**
 * The size
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcfl.Brick._p.size = function (brick) {
  return brick.size
}
/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * brick.
 * Coordinate system: board coordinates.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @return {!goog.math.Box}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
eYo.fcfl.Brick._p.boundingBox = function (brick) {
  return this.boundingRect(brick).toBox()
}
  
/**
 * Schedule snapping to grid and bumping neighbours to occur after a brief
 * delay.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcfl.Brick._p.scheduleSnapAndBump = function(brick) {
  // Ensure that any snap and bump are part of this move's event group.
  var group = eYo.event.group
  setTimeout(() => {
    eYo.event.groupWrap(group, () => {
      this.snapToGrid(brick)
    })
  }, eYo.brick.BUMP_DELAY / 2)
  setTimeout(() => {
    eYo.event.groupWrap(group, () => {
      this.bumpNeighbours_(brick)
    })
  }, eYo.brick.BUMP_DELAY)
}

/**
 * Snap the given brick to the nearest grid point.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcfl.Brick._p.snapToGrid = function(brick) {
  if (!brick.board || brick.board.dragging || brick.parent || brick.isInFlyout) {
    return
  }
  this.moveTo(brick, brick.xy, true)
}


/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @private
 */
eYo.fcfl.Brick._p.bumpNeighbours_ = function(brick) {
  if (!brick.board || brick.board.dragging) {
    return;  // Don't bump blocks during a drag.
  }
  var root = brick.root
  if (root.isInFlyout) {
    return
  }
  brick.magnetForEach(false, magnet => {
    // Spider down from this block bumping all sub-blocks.
    if (magnet.target && magnet.isSuperior) {
      magnet.targetBrick.bumpNeighbours_()
    }
    magnet.neighbours_(eYo.event.SNAP_RADIUS).forEach(other => {
      // If both magnets are connected, that's probably fine.  But if
      // either one of them is unconnected, then there could be confusion.
      if (!magnet.target || !other.target) {
        // Only bump blocks if they are from different tree structures.
        if (other.brick.root != root) {
          // Always bump the inferior block.
          if (magnet.isSuperior) {
            other.bumpAwayFrom_(magnet)
          } else {
            magnet.bumpAwayFrom_(other)
          }
        }
      }
    })
  })
}


/**
 * Get the magnet for the given event.
 * The brick is already rendered once.
 *
 * For edython.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @param {Object} e in general a mouse down event
 * @return {Object|eYo.NA|null}
 */
eYo.fcfl.Brick._p.getMagnetForEvent = function (brick, e) {
  var brd = brick.board
  if (!brd) {
    return
  }
  // if we clicked on a field, no connection returned
  if (eYo.app.motion.field) {
    return
  }
  var rect = brick.boundingRect // in board coordinates
  var xy = brd.eventWhere(e).backward(rect.topLeft)
  var R
  var magnet = this.slotSomeMagnet(brick, magnet => {
    if (!magnet.disabled_ && (!magnet.hidden_ || magnet.wrapped_)) {
      if (magnet.isSlot) {
        var target = magnet.target
        if (target) {
          var targetM4t = target.brick.ui_driver.getMagnetForEvent(target.brick, e)
          if (targetM4t) {
            return targetM4t
          }
          R = new eYo.geom.Rect(
            magnet.x + eYo.geom.X / 2,
            magnet.y,
            target.width - eYo.geom.X,
            target.height
          )
          if (xy.in(R)) {
            return magnet
          }
        }
        if (magnet.slot && magnet.slot.bindField) {
          R = new eYo.geom.Rect(
            magnet.x,
            magnet.y + eYo.padding.t,
            magnet.w * eYo.geom.X,
            eYo.font.height
          )
        } else if (magnet.optional_ || magnet.s7r_) {
          R = new eYo.geom.Rect(
            magnet.x - eYo.geom.X / 4,
            magnet.y + eYo.padding.t,
            1.5 * eYo.geom.X,
            eYo.font.height
          )
        } else {
          R = new eYo.geom.Rect(
            magnet.x + eYo.geom.X / 4,
            magnet.y + eYo.padding.t,
            (magnet.w - 1 / 2) * eYo.geom.X,
            eYo.font.height
          )
        }
        if (xy.in(R)) {
          return magnet
        }
      } else if (magnet.isFoot || magnet.isSuite) {
        R = new eYo.geom.Rect(
          magnet.x,
          magnet.y - eYo.style.path.width,
          eYo.span.TAB_WIDTH,
          1.5 * eYo.padding.t + 2 * eYo.style.path.width
        )
        if (xy.in(R)) {
          return magnet
        }
      }
    }
  })
  if (magnet) {
    return magnet
  } else if ((magnet = brick.head_m) && !magnet.hidden) {
    R = new eYo.geom.Rect(
      magnet.x,
      magnet.y - 2 * eYo.style.path.width,
      rect.width,
      1.5 * eYo.padding.t + 2 * eYo.style.path.width
    )
    if (xy.in(R)) {
      return magnet
    }
  }
  if ((magnet = brick.foot_m) && !magnet.hidden) {
    if (rect.height > eYo.geom.Y) { // Not the cleanest design
      R = new eYo.geom.Rect(
        magnet.x,
        magnet.y - 1.5 * eYo.padding.B - eYo.style.path.width,
        eYo.span.TAB_WIDTH + eYo.style.path.r, // R U sure?
        1.5 * eYo.padding.B + 2 * eYo.style.path.width
      )
    } else {
      R = new eYo.geom.Rect(
        magnet.x,
        magnet.y - 1.5 * eYo.padding.B - eYo.style.path.width,
        rect.width,
        1.5 * eYo.padding.B + 2 * eYo.style.path.width
      )
    }
    if (xy.in(R)) {
      return magnet
    }
  }
  if ((magnet = brick.suite_m) && !magnet.hidden) {
    var r = eYo.style.path.Hilighted.width
    R = new eYo.geom.Rect(
      magnet.x + eYo.geom.X / 2 - r,
      magnet.y + r,
      2 * r,
      eYo.geom.Y - 2 * r // R U sure?
    )
    if (xy.in(R)) {
      return magnet
    }
  }
  if ((magnet = brick.left_m) && !magnet.hidden) {
    var r = eYo.style.path.Hilighted.width
    R = new eYo.geom.Rect(
      magnet.x + eYo.geom.X / 2 - r,
      magnet.y + r,
      2 * r,
      eYo.geom.Y - 2 * r // R U sure?
    )
    if (xy.in(R)) {
      return magnet
    }
  }
  if ((magnet = brick.right_m) && !magnet.hidden) {
    R = new eYo.geom.Rect(
      magnet.x + eYo.geom.X / 2 - r,
      magnet.y + r,
      2 * r,
      eYo.geom.Y - 2 * r // R U sure?
    )
    if (xy.in(R)) {
      return magnet
    }
  }
}

/**
 * Update the cursor over this block by adding or removing a class.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @param {boolean} enable True if the delete cursor should be shown, false
 *     otherwise.
 */
eYo.fcfl.Brick._p.deleteStyleSet = eYo.doNothing

/**
 * Hilight the given connection.
 * The default implementation forwards to the driver.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.driver.makeForwarder(eYo.brick.BaseC9r_p, 'deleteStyleSet')

/**
 * Handle a mousedown on an SVG brick.
 * If the brick is sealed to its parent, forwards to the parent.
 * This is used to prevent a dragging operation on a sealed brick.
 * However, this will manage the selection of a slot connection.
 * on_mousedown message is sent multiple times for one mouse click
 * because bricks may lay on above the other (when connected for example)
 * Considering the selection of a connection, we manage the on_mousedown calls
 * independantly. Whatever node is answering to a mousDown event,
 * a connection will be activated if relevant.
 * There is a problem due to the shape of the bricks.
 * Depending on the brick, the contour path or the whole svg group
 * is better suited to listen to mouse events.
 * Actually, both are registered which implies that
 * handlers must filter out reentrancy.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @param {Event} e Mouse down event or touch start event.
 * @private
 */
eYo.fcfl.Brick._p.on_mousedown = function (brick, e) {
  var brick = this
  if (brick.locked_) {
    var parent = brick.parent
    if (parent) {
      return
    }
  }
  if (brick.ui.parentIsShort && !brick.hasFocus) {
    parent = brick.parent
    if (!parent.hasFocus) {
      eYo.app.motion.handleBrickStart(e, brick)
      return
    }
  }
  // unfortunately, the mouse events sometimes do not find there way to the proper brick
  var magnet = this.getMagnetForEvent(brick, e)
  var t9k = magnet
  ? magnet.isSlot
    ? magnet.targetBrick || magnet.brick
    : magnet.brick
  : brick
  while (t9k && (t9k.wrapped_ || t9k.locked_)) {
    t9k = t9k.parent
  }
  // console.log('MOUSE DOWN', target)
  // Next trick because of the the dual event binding
  // reentrant management
  if (!t9k || t9k.ui.alreadyMouseDownEvent_ === e) {
    return
  }
  t9k.ui.alreadyMouseDownEvent_ = e
  // Next is not good design
  // remove any selected connection, if any
  // but remember it for a contextual menu
  t9k.ui.lastSelectedMagnet__ = eYo.focus.magnet
  // Prepare the mouseUp event for an eventual connection selection
  t9k.ui.lastMouseDownEvent = t9k.hasFocus ? e : null
  eYo.app.motion.handleBrickStart(e, t9k)
}

/**
 * The selected connection is used to insert bricks with the keyboard.
 * When a connection is selected, one of the ancestor bricks is also selected.
 * Then, the higlighted path of the source bricks is not the outline of the brick
 * but the shape of the connection as it shows when bricks are moved close enough.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @param {Event} e Mouse down event or touch start event.
 */
eYo.fcfl.Brick._p.on_mouseup = function (brick, e) {
  const magnet = this.getMagnetForEvent(brick, e)
  var b3k
  var t9k = magnet
  ? magnet.isSlot
    ? magnet.targetBrick || magnet.brick
    : magnet.brick
  : this
  while (t9k && (t9k.wrapped_ || t9k.locked_)) {
    t9k = t9k.parent
  }
  // reentrancy filter
  if (!t9k || t9k.ui.alreadyMouseUpEvent_ === e) {
    return
  }
  t9k.ui.alreadyMouseUpEvent_ = e
  var ee = t9k.ui.lastMouseDownEvent
  if (ee) {
    // a brick was selected when the mouse down event was sent
    if (ee.clientX === e.clientX && ee.clientY === e.clientY) {
      // not a drag move
      if (t9k.hasFocus) {
        // the brick was already selected,
        if (magnet) {
          // and there is a candidate selection
          if (magnet.hasFocus) {
            // unselect
            eYo.focus.magnet = null
          } else if (magnet !== t9k.ui.lastSelectedMagnet__) {
            if (magnet.isSlot) {
              if (!magnet.targetBrick) {
                magnet.bindField && magnet.focusOn()
              }
            } else {
              magnet.focusOn()
            }
          } else {
            eYo.focus.magnet = null
          }
        } else if (eYo.focus.magnet) {
          eYo.focus.magnet = null
        } else if (t9k.ui.selectMouseDownEvent) {
          // (brick.hasFocus ? this : brick.stmtParent) || t9k.root
          t9k.ui.selectMouseDownEvent = null
        }
      }
    }
  } else if ((b3k = eYo.app.focus_mngr.brick) && (ee = b3k.ui.selectMouseDownEvent)) {
    b3k.ui.selectMouseDownEvent = null
    if (ee.clientX === e.clientX && ee.clientY === e.clientY) {
      // not a drag move
      // select the brick which is an ancestor of the target
      // which parent is the selected brick
      var parent = t9k
      while ((parent = parent.parent)) {
        console.log('ancestor', parent.type)
        if ((parent.hasFocus)) {
          t9k.focusOn()
          break
        } else if (!parent.wrapped_) {
          t9k = parent
        }
      }
    }
  }
  let a = brick.app
  a.didTouchBrick && a.didTouchBrick(a.focus_mngr.brick)
}

/**
 * Show the context menu for this brick.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @param {Event} e Mouse event.
 * @private
 */
eYo.fcfl.Brick._p.showContextMenu_ = function (brick, e) {
  // this part is copied as is from the parent's implementation. Is it relevant ?
  if (brick.board.options.readOnly || !brick.contextMenu) {
    return
  }
  eYo.MenuManager.Shared().showMenu(brick, e)
}

/**
 * Whether the given brick can draw.
 * @param {eYo.brick.BaseC9r} brick  the brick the driver acts on
 * @private
 */
eYo.fcls.Brick_p.canDraw = function (brick) {
  return true
}

/**
 * Place the brick in its board.
 * Default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick The brick to place.
 */
eYo.fcfl.Brick_p.place = eYo.doNothing

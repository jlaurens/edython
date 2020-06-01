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

/**
 * Facefull driver for boards.
 */
eYo.fcfl.makeDriverC9r('Board')

console.error('NYI')

eYo.board.BaseC9r[eYo.$].p6yMerge({
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
  minBoardW: {
    get () {
      return this.isStmt ? eYo.span.INDENT : 0
    },
  },
  bBox: {
    get () {
      return this.rendered && (this.driver.getBBox(board))
    },
  },
  hasSelect: {
    get () {
      return this.rendered && (this.driver.hasFocus(board))
    },
  },
  visible: {
    /**
     * Get the display status of the receiver's board.
     * Forwards to the driver.
     */
    get () {
      return this.driver.displayedGet(this)
    },
    /**
     * Set the display status of the receiver's board.
     * Forwards to the driver.
     * @param {boolean} visible
     */
    set (after) {
      this.driver.displayedSet(this, visible)
    }
  },
})
eYo.board.BaseC9r[eYo.$].p6yAliasesMerge({
  'xy': 'where',
})

/**
 * Render the next board, if relevant.
 * @param {*} recorder
 * @return {boolean=} true if an rendering message was sent, false otherwise.
 */
eYo.fcfl.Board._p.drawFoot_ = function (io) {
  let board = io.board
  var m4t = board.foot_m
  if (!m4t) {
    return
  }
  m4t.setOffset(0, board.span.l)
  var t9k = m4t.targetBoard
  if (!t9k) {
    return
  }
  m4t.tighten()
  var do_it = !t9k.ui.rendered ||
  (!board.up &&
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
 * Render the right board, if relevant.
 * Returns true if there is a right board which is not a comment.
 * @param {*} io
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.fcfl.Board._p.renderRight_ = function (io) {
  let board = io.board
  board.span.right = 0
  var m4t = board.right_m
  if (m4t) {
    var t9k = m4t.targetBoard
    if (t9k) {
      t9k.span.header = board.span.header + board.span.main - 1
      try {
        t9k.ui.startOfLine = io.common.startOfLine
        t9k.ui.startOfStatement = io.common.startOfStatement
        t9k.ui.mayBeLast = t9k.hasRightEdge
        t9k.down = true
        if (eYo.board.debugStartTrackingRender) {
          console.log(eYo.board.debugPrefix, 'DOWN')
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
          // We just rendered a board
          // it is potentially the rightmost object inside its parent.
          if (t9k.hasRightEdge || io.common.shouldPack) {
            io.common.ending.push(t9k)
            t9k.ui.rightCaret = eYo.NA
            io.common.field.shouldSeparate = false
          }
          io.common.field.afterCaret = false
        }
      }
      board.span.footer = t9k.span.footer + t9k.span.main - 1
      board.span.right = t9k.span.c + t9k.span.right
      return !t9k.isComment
    } else if (board.isGroup) {
      this.drawField_(m4t.label_f, io) // only the ':' or ';' trailing field.
      return false
    }
  }
}

/**
 * Render the suite board, if relevant.
 * @param {*} recorder
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.fcfl.Board._p.renderSuite_ = function (io) {
  let board = io.board
  var m4t = board.suite_m
  if (!m4t) {
    return
  }
  if (eYo.board.debugStartTrackingRender) {
    console.log(eYo.board.debugPrefix, 'SUITE')
  }
  m4t.setOffset(eYo.span.INDENT, board.span.main)
  let t9k = m4t.targetBoard
  if (t9k) {
    board.ui.someTargetIsMissing = false
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
    board.span.suite = t9k.span.l + t9k.span.foot
  } else {
    board.span.suite = 0
  }
  return true
}

/**
 * May render the parent board, if relevant.
 * @param {Object} recorder - A recorder object.
 * @param {boolean=} bbbl - If false, just render this board.
 *   If true, also render board's parent, grandparent, etc.  Defaults to true.
 * @return {boolean=} true if an rendering message was sent, false otherwise.
 */
eYo.fcfl.Board._p.drawParent_ = function (io, bbbl) {
  let board = io.board
  // `this` is a board
  if (bbbl === false || board.down) {
    return
  }
  // Render all boards above this one only
  // when the render message did not come from above!
  var parent = board.parent
  if (parent) {
    var justConnected = eYo.magnet.connectedParent && board.out_m === eYo.magnet.connectedParent.Target
    if (!parent.down) {
      try {
        parent.up = true
        var old = board.up
        board.up = true
        if (eYo.board.DEBUG_StartTrackingRender) {
          console.log(eYo.board.DEBUG_Prefix, 'UP')
        }
        parent.render(!justConnected, io)
      } finally {
        parent.up = false
        board.up = old
      }
      if (justConnected) {
        if (parent.parent) {
          parent = parent.root
          try {
            parent.up = true
            if (eYo.board.DEBUG_StartTrackingRender) {
              console.log(eYo.board.DEBUG_Prefix, 'UP')
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
    // Top-most board.  Fire an event to allow scrollbars to layout.
    this.board.resizePort(board)
  }
}

eYo.fcfl.Board._p.longRender_ = eYo.decorate.reentrant_method(
  'longRender_',
  function (bbbl, recorder) {
    let board = recorder.board
    if (eYo.board.DEBUG_StartTrackingRender) {
      var n = eYo.board.DEBUG_Count[board.id]
      eYo.board.DEBUG_Count[board.id] = (n||0)+1
      if (!eYo.board.DEBUG_Prefix.length) {
        console.log('>>>>>>>>>>')
      }
      eYo.board.DEBUG_Prefix = eYo.board.DEBUG_Prefix + '.'
      console.log(eYo.board.DEBUG_Prefix, board.type, n, board.id)
      if (n > 1) {
        n = n + 0
      }
    }
    try {
      var io = this.willRender_(board, recorder)
      this.draw_(io)
      this.layoutMagnets_(io)
      this.drawFoot_(io)
      this.renderMove_(io)
      board.updateShape()
      this.drawParent_(io, bbbl) || this.alignRightEdges_(io)
      this.didRender_(board, io)
    } finally {
      if (eYo.board.DEBUG_StartTrackingRender &&  eYo.board.DEBUG_Prefix.length) {
        eYo.board.DEBUG_Prefix = eYo.board.DEBUG_Prefix.Substring(1)
      }
    }
  }
)
// deleted boards are rendered during deletion
// this should be avoided
/**
 * Render the board.
 * Lays out and reflows a board based on its contents and settings.
 * Rendering is complicated considering the possibility of both line continuation and multi line strings.
 * @param {*} recorder
 * @param {boolean=} bbbl If false, just render this board.
 *   If true, also render board's parent, grandparent, etc.  Defaults to true.
 */
eYo.fcfl.Board._p.render = function (board, bbbl, recorder) {
  if (!board.hasUI || board.rendered === false) { // board.rendered === eYo.NA is OK
    return
  }
  if (!board.isEditing && (board.dragging_ || board.changer.level || !board.board)) {
    return
  }
  this.drawPending_(recorder, !board.wrapped_ && eYo.key.LEFT)
  // rendering is very special when this is just a matter of
  // statement connection
  if (board.rendered) {
    if (eYo.magnet.disconnectedChild && board.head_m === eYo.magnet.disconnectedChild) {
      // this is the child one
      var io = this.willShortRender_(board, recorder)
      this.layoutMagnets_(io)
      this.drawFoot_(io)
      this.renderMove_(io)
      board.updateShape()
      board.changer.save.render = board.changer.count
      this.drawParent_(io, bbbl) || this.alignRightEdges_(io) // will they have a parent meanwhile?
      return
    } else if (eYo.magnet.disconnectedParent && board.foot_m === eYo.magnet.disconnectedParent) {
      // this is the parent one
      // but it may belong to a suite
      var io = this.willShortRender_(board, recorder)
      this.layoutMagnets_(io)
      this.drawFoot_(io)
      this.renderMove_(io)
      board.updateShape()
      board.changer.save.render = board.changer.count
      this.drawParent_(io, bbbl) || this.alignRightEdges_(io)
      return
    } else if (eYo.magnet.connectedParent) {
      if (board.head_m && eYo.magnet.connectedParent === board.head_m.target) {
        var io = this.willShortRender_(board, recorder)
        this.layoutMagnets_(io)
        this.drawFoot_(io)
        this.renderMove_(io)
        board.updateShape()
        board.changer.save.render = board.changer.count
        this.drawParent_(io, bbbl) || this.alignRightEdges_(io)
      } else if (board.foot_m && eYo.magnet.connectedParent === board.foot_m) {
        var io = this.willShortRender_(board, recorder)
        this.layoutMagnets_(io)
        this.drawFoot_(io)
        this.renderMove_(io)
        board.updateShape()
        board.changer.save.render = board.changer.count
        this.drawParent_(io, bbbl) || this.alignRightEdges_(io)
      } else if (board.suite_m && eYo.magnet.connectedParent === board.suite_m) {
        var io = this.willShortRender_(board, recorder)
        this.layoutMagnets_(io)
        this.drawFoot_(io)
        this.renderMove_(io)
        board.updateShape()
        board.changer.save.render = board.changer.count
        this.drawParent_(io, bbbl) || this.alignRightEdges_(io)
      }
    }
  }
  if (!board.down && board.out_m) {
    // always render from a line start id est
    // an orphan board or a statement board with no left board
    var parent
    if ((parent = board.parent)) {
      var next
      while (parent.out_m && !parent.down && (next = parent.parent)) {
        parent = next
      }
      // parent has no output magnet or has no parent.
      recorder && (recorder.field.last = eYo.NA)
      if (!parent.down) {
        if (eYo.magnet.connectedParent && eYo.magnet.connectedParent.Board === this) {
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
  if (board.changer.save.render === board.changer.count) {
    // minimal rendering
    var io = this.willShortRender_(board, recorder)
    this.layoutMagnets_(io)
    this.drawFoot_(io)
    this.renderMove_(io)
    board.updateShape()
    this.drawParent_(io, bbbl) || this.alignRightEdges_(io)
    return
  }
  this.longRender_(bbbl, recorder)
  board.changer.save.render = board.changer.count
}

/**
 * Will draw the board, short version.
 * The print statement needs some preparation before drawing.
 * @param {*} recorder
 * @private
 */
eYo.fcfl.Board._p.willShortRender_ = function (board, recorder) {
  return this.newDrawRecorder_(board, recorder)
}

/**
 * Translates the board, forwards to the ui driver after managing the snap formal argument.
 * Contrary to |moveBy| there is no undo management here.
 * @param {eYo.board.BaseC9r} board - The board to move.
 * @param {eYo.geom.Point} xy - The xy coordinate of the translation in board units.
 * @param {Boolean} snap Whether we should snap to the grid.
 */
eYo.fcfl.Board._p.moveTo = function(board, xy, snap) {
  if (snap && board.board && !board.board.dragging && !board.parent && !board.isInFlyout) {
    xy = eYo.geom.tPoint(xy.c, xy.l)
  }
  board.xy_ = xy
  this.place(board)
  this.placeMagnets_(board)
}

/**
 * Move a standalone board by a relative offset.
 * Event aware for top blocks, except when dragging.
 * @param {number} dxy Offset in board units.
 * @param {Boolean} snap Whether we should snap to the grid.
 */
eYo.fcfl.Board._p.moveBy = function(board, dxy, snap) {
  var xy = board.xy.forward(dxy)
  if (board.parent || board.desk.desktop.isDragging) {
    this.moveTo(board, xy)
  } else {
    eYo.event.fireBoardMove(board, () => {
      this.moveTo(board, xy, snap)
      board.board.resizePort(board)
    })
  }
}

/**
 * Will draw the board.
 * Prepares the board and forwards to the driver.
 * @param {*} recorder
 * @private
 */
eYo.fcfl.Board._p.willRender_ = function (board, recorder) {
  board.consolidate()
}

/**
 * Update all of the connections on this with the new locations.  * @private
 */
eYo.fcfl.Board._p.renderMoveMagnets_ = function(board) {
  var xy = board.whereInBoard
  var f = m4t => {
    if (m4t) {
      m4t.moveToOffset(xy)
      var t9k = m4t.targetBoard
      if (t9k) {
        m4t.tighten()
        // t9k.ui_driver.placeMagnets_(t9k)
      }
    }
  }
  // Don't tighten previous or output connections because they are inferior
  // connections.
  var m5s = board.magnets
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
  this.slotForEach(board, slot => f(slot.magnet))
  // next is done while rendering
  // f(m5s.right)
  // f(m5s.suite)
  f(m5s.foot)
}

/**
 * Update all of the connections on this with the new locations.
 * @private
 */
eYo.fcfl.Board._p.placeMagnets_ = function(board) {
  var xy = board.whereInBoard
  var f = m4t => {
    if (m4t) {
      m4t.moveToOffset(xy)
      var t9k = m4t.targetBoard
      if (t9k) {
        m4t.tighten()
        t9k.ui_driver.placeMagnets_(t9k)
      }
    }
  }
  // Don't tighten previous or output connections because they are inferior
  // connections.
  var m5s = board.magnets
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
  this.slotForEach(board, slot => f(slot.magnet))
  // next is done while rendering
  // f(m5s.right)
  // f(m5s.suite)
  f(m5s.foot)
}

/**
 * Layout board magnets.
 * @param {*} recorder
 * @private
 */
eYo.fcfl.Board._p.renderMove_ = function (io) {
  let board = io.board
  this.renderMoveMagnets_(board)
}

/**
 * Layout previous, next and output board connections.
 * @param {*} recorder
 * @private
 */
eYo.fcfl.Board._p.layoutMagnets_ = function (recorder) {
  let board = recorder.board
  var m5s = board.magnets
  var m4t = m5s.out
  if (m4t) {
    m4t.setOffset()
  } else {
    if ((m4t = m5s.head)) {
      m4t.setOffset()
    }
    if ((m4t = m5s.foot)) {
      if (board.collapsed) {
        m4t.setOffset(0, 2)
      } else {
        m4t.setOffset(0, board.span.height)
      }
    }
    if ((m4t = m5s.left)) {
      m4t.setOffset()
    }
    if ((m4t = m5s.right)) {
      m4t.setOffset(board.span.width, 0)
    }
  }
}

/**
 * Draw the path of the board.
 * @param {*} recorder - 
 * @private
 */
eYo.fcfl.Board._p.draw_ = function (recorder) {
  let board = recorder.board
  if (this.canDraw(board)) {
    try {
      var io = this.drawModelBegin_(recorder)
      this.drawModel_(io)
      this.drawModelEnd_(io)
    } finally {
      this.renderRight_(io) || this.renderSuite_(io)
      board.updateShape()
      this.drawSharp_(io)
    }
    return io
  }
  return recorder
}

/**
 * Align the right edges by changing the width of all the connected statement boards. For each line, only the last statement
 * of the line is extended.
 * Only for root boards.
 * @param {*} recorder
 * @protected
 */
eYo.fcfl.Board._p.alignRightEdges_ = eYo.changer.memoize(
  'alignRightEdges_',
  function (recorder) {
    let board = recorder.board
    if (board.parent || !board.isStmt || !board.rendered || !board.board || !board.hasUI) {
      return
    }
    var right = 0
    var t = eYo.span.INDENT
    board.stmtForEach((b, depth) => {
      if (b.span.min_c) {
        var c = t * depth + b.span.min_c
        // all the right boards now
        var x = b
        while ((x = x.right)) {
          c += x.span.min_c - 1 // `- 1` because boards will overlap one space for the vertical boundaries
        }
        right = Math.max(right, c)
      }
    })
    if (right) {
      board.stmtForEach((b, depth) => {
        var c = right - t * depth
        // find the last right board and
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
 * @param {*} recorder  Null iff this is the first board rendered
 * of that rendering process.
 * @private
 */
eYo.fcfl.Board._p.newDrawRecorder_ = function (board, recorder) {
  var io = {
    board: board,
    steps: [],
    n: 0, // count of rendered objects (fields, slots and inputs)
    form: eYo.NA // rendered field or magnet
  }
  io.cursor = eYo.geom.pPoint(0, board.span.header)
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
      startOfLine: !board.isExpr || !board.parent, // statement, group or orphan board
      field: {
        afterBlack: false, // true if the position before the cursor contains a black character
        afterSeparator: false, // true if the position before the cursor contains a mandatory white character
        afterCaret: false, // true if the position before the cursor contains a caret, id est an otional input magnet
        shouldSeparate: false // and other properties...
      },
      header: 0 // used when a board will render its right sibling
    }
  }
  // A "star like" field's text is one of '*', '+', '-', '~'...
  // This field is the very first of the board.
  // Once we have rendered a field with a positive length,
  // we cannot have a star like field.
  io.common.field.canStarLike = true
  board.ui.firstRenderedMagnet = board.ui.lastRenderedMagnet = eYo.NA
  io.footer = 0
  io.main = 1
  return io
}

/**
 * Prepare rendering of a board.
 * @param {Object} [recorder]
 * @return {!Object} a local recorder
 * @private
 */
eYo.fcfl.Board._p.drawModelBegin_ = function (recorder) {
  let board = recorder.board
  board.ui.parentIsShort = false
  board.ui.isShort = false
  board.ui.someTargetIsMissing = false
  // we define the `io` named recorder which is specific to board.
  var io = this.newDrawRecorder_(board, recorder)
  // By default, we restart from scratch,
  // set the size to 0 for the width and 1 for the height
  // And reset properties
  board.ui.mayBeLast = false
  board.ui.isLastInExpression = false
  board.ui.isLastInStatement = false
  // Do we need some room for the left side of the board?
  // no for wrapped boards
  if (!board.wrapped_) {
    if (!board.isExpr || !board.locked_ || !recorder) {
      // statement or unlocked,
      // one space for the left edge of the board
      // (even for locked statements, this is to avoid a
      // display shift when locking/unlocking)
      io.cursor.c = 1
      io.common.field.afterBlack = false
    }
  }
  if (board.hasLeftEdge || !recorder || !board.out_m) {
    // statement or unlocked,
    // one space for the left edge of the board
    // (even for locked statements, this is to avoid a
    // display shift when locking/unlocking)
    io.cursor.c = 1
    io.common.field.afterBlack = false
    io.common.field.afterSeparator = true
    io.common.field.shouldSeparate = false
    // Do not change io.common.field.shouldSeparate ?
  }
  if (board.isExpr) {
    board.ui.startOfStatement = io.common.startOfStatement
    board.ui.startOfLine = io.common.startOfLine
  } else {
    board.ui.startOfStatement = io.common.startOfStatement = true
    board.span.header = 0
  }
  return io
}

/**
 * Render the inputs, the fields and the slots of the board.
 * The `recorder` is an object that keeps track of some
 * rendering information. It is the argument of various methods.
 * This method is executed at least once for any rendered board.
 * Since then, it won't be executed as long as the board has not been edited.
 * @param {Object} [io]
 * @private
 */
eYo.fcfl.Board._p.drawModel_ = function (io) {
  let board = io.board
  this.fieldDrawFrom_(board.fieldHead, io)
  if ((io.slot = board.slotAtHead)) {
    do {
      this.slotDraw_(io)
    } while ((io.slot = io.slot.next))
  }
  this.fieldDrawFrom_(board.fieldTail, io)
  return
}

/**
 * Terminate to render the model.
 * @param {Object} [recorder]
 * @private
 */
eYo.fcfl.Board._p.drawModelEnd_ = function (board, io) {
  // and now some space for the right edge, if any
  let f = io.common.field
  if (!board.wrapped_) {
    if (board.isExpr) {
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
        } else if (!board.locked_ && !io.common.ending.length) {
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
  if (!board.isExpr) {
    this.drawEnding_(io, true, true)
  } else if (!io.recorder) {
    this.drawEnding_(io, true)
  }
  this.drawPending_(io)
  if (!board.wrapped_) {
    var m4t = io.form
    var t9k = m4t && m4t.targetBoard
    if (io.n < 2 && !board.wrapped_) {
      // this is a short board, special management of selection
      board.ui.isShort = true
      if (t9k) {
        t9k.ui.parentIsShort = true
        // always add a space to the right
        t9k.ui.isLastInStatement = false
        t9k.updateShape()
        io.cursor.c += 1
      }
    } else {
      board.ui.isShort = false
      if (t9k) {
        t9k.ui.parentIsShort = false
      }
    }
  }
  board.span.c_min = io.cursor.c = Math.max(io.cursor.c, board.minBoardW)
  if (io.recorder) {
    // We ended a board. The right edge is generally a separator.
    // No need to add a separator if the board is wrapped or locked
    f.shouldSeparate && (f.shouldSeparate = !board.hasRightEdge)
    // if the board is wrapped or locked, there won't be any
    // right edge where a caret could be placed.
    // But may be we just rendered boards in cascade such that
    // there might be some right edge already.
  }
  board.ui.lastRenderedMagnet = io.common.magnetDone
}

/**
 * Render the slot given in io parameter.
 * @param io
 * @private
 */
eYo.fcfl.Board._p.slotDraw_ = function (io) {
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
    // come back to the board coordinates
    io.cursor.forward(slot.where)
    // translate at the end because `slot.where` may change
    // due to the shrink process
  }
  slot.display()
}

/**
 * Render the leading # character for collapsed statement boards.
 * Statement subclasses must override it.
 * @param io
 * @private
 */
eYo.fcfl.Board._p.drawSharp_ = function (io) {
  let board = io.board
  if (board.isControl) { // Not very clean, used as hook before rendering the comment fields.
    io.cursor.c += 4
  } else if (board.isStmt) {
    this.drawSharp(board, board.disabled)
    if (board.disabled) {
      io.cursor.c += 2
      io.common.startOfLine = io.common.startOfStatement = false
    }
  }
}

/**
 * Draw/hide the sharp.
 * Default implementation does nothing.
 * @param {eYo.board.BaseC9r} board - the board the driver acts on
 * @param {Boolean} visible - the board the driver acts on
 * @private
 */
eYo.fcfl.Board._p.drawSharp = eYo.doNothing

/**
 * Render the given field, when defined.
 * This is the process that make the cursor move,
 * together with board boundaries.
 *
 * @param {Object} field A field.
 * @param {Object} io An input/output recorder.
 * @private
 */
eYo.fcfl.Board._p.drawField_ = function (field, io) {
  let board = io.board
  var c = io.cursor.c
  field.displayedUpdate()
  if (field.visible) {
    // Actually, io.cursor points to the location where the field
    // is expected. It is relative to the enclosing `SVG` group,
    // which is either a board or a slot.
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
      //    this.fieldTextCreate(board, field)
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
            if (board.ui.packedQuotes && (head === "'" || head === '"')) {
              io.cursor.c -= 1
            } else if (board.ui.packedBrackets && head === "[") {
              io.cursor.c -= 1
            } else if (board.ui.packedBraces && head === "{") {
              io.cursor.c -= 1
            } else if (board.ui.packedParenthesis && head === "(") {
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
        if ((tail === '"' || tail === "'") && board.ui.packedQuotes) {
          io.common.shouldPack = null // this
        } else if (tail === ']' && board.ui.packedBrackets) {
          io.common.shouldPack = this
        } else if ((tail === '}') && board.ui.packedBraces) {
          io.common.shouldPack = this
        } else if ((tail === ')') && board.ui.packedParenthesis) {
          io.common.shouldPack = this
        }
      }
    }
    if (field.isEditing) {
      // This is a toard to avoid some bad geometry while editing
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
eYo.fcfl.Board._p.fieldDrawFrom_ = function (field, io) {
  if (field) {
    do {
      this.drawField_(field, io)
    } while ((field = field.nextField))
  }
}

/**
 * Render the fields of a board input/slot.
 * Fields are either before or after the connection.
 * If `only_prefix` is true, only fields before the
 * connection are rendered.
 * @param {Object} io An input/output record.
 * @param {Boolean} [only_prefix]
 * @return {Number}  The advance of the cursor (in columns)
 * @private
 */
eYo.fcfl.Board._p.drawFields_ = function (io, only_prefix) {
  var current = io.cursor.c
  io.slot.fieldForEach(field => {
    if (!!only_prefix === !field.suffix) {
      this.drawField_(field, io)
    }
  })
  return io.cursor.c - current
}

/**
 * Render the ending boards.
 *
 * In order to save space, we put caret at the end of boards
 * and we shrink boards to the minimum.
 *
 * When expression boards are stacked, there is no need to
 * spend space just to draw the edges.
 * We can save space by drawing the board edges on top of each others.
 *
 * When we start rendering a new board,
 * `io.common.field.shouldSeparate` is set to `false`.
 * If we enter a child board, with no field nor splot before,
 * then we should decrease `cursor`.
 * This is why the right end of expression boards
 * may be a straight line instead of a curved one
 * when at the end of a statement board.
 * This situation depends of information given after a board is
 * rendered. One solution is to scan all the boards to prepare
 * rendering, then scan again to render.
 * We assume that only one loop is more efficient.
 * In that case, we must wait until a statement board is rendered
 * to properly locate and display connection,
 * and to properly display the last board.
 * In order to display a caret connection properly,
 * we attach to each board ending with a one character spaced
 * right edge a pending connection that might be displayed
 * over that right edge.
 * we consider the first fullfilled of these conditions:
 *
 * 1) we just rendered an expression board
 * that ends with a white space (not wrapped nor locked)
 * but have no pending connection attached
 *
 * 2) we won't render any field until the end of the board
 * and the board ends with a white space
 *
 * This message is sent at the end of statement board rendering.
 * It is also sent each time we have rendered a field or a slot.
 * @param {Object} [io] the input/output argument.
 * @private
 */
eYo.fcfl.Board._p.drawEnding_ = function (io, isLast = false, inStatement = false) {
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
              b3k.span.c = Math.max(b3k.ui.minBoardW, b3k.span.c - 1)
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
          var board = m4t.board
          if (this === board) {
            // we are lucky, this is the board we are currently rendering
            io.steps.push(departFocus)
          } else {
            // bad luck, board has already been rendered
            // we must append the definition to the path
            // this may happen for boards with no left or right end,
            // eg locked or wrapped boards.
            var path = board.pathInner_
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
 * @param {String} [side] On which side of a board.
 * @param {String} [shape] Which is the shape.
 * @private
 */
eYo.fcfl.Board._p.drawPending_ = function (io, side = eYo.key.NONE, shape = eYo.key.NONE) {
  if (io) {
    var m4t = io.common.pending
    if (m4t) {
      m4t.side = side
      m4t.shape = io.ui.isLastInStatement ? eYo.key.Right : shape
      var shp = eYo.shape.newWithMagnet(m4t)
      var b3k = m4t.board
      if (io.board === b3k) {
        // we are lucky, this is the board we are currently rendering
        io.steps.push(shp.definition)
      } else {
        // bad luck, board has already been rendered
        // we must append the definition to the path
        // this may happen for boards with no left or right end,
        // eg locked or wrapped boards.
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
eYo.fcfl.Board._p.drawInputMagnet_ = function (io) {
  var m4t = io.magnet
  m4t.renderedRight = eYo.NA
  m4t.renderedLeft = io.common.magnetDone
  if (io.common.magnetDone) {
    io.common.magnetDone.inputRight = io.magnet
  } else {
    board.ui.firstRenderedMagnet = io.magnet
  }
  io.common.magnetDone = io.magnet
  ++ io.n
  m4t.startOfLine = io.common.startOfLine
  m4t.startOfStatement = io.common.startOfStatement
  io.form = m4t
  m4t.side = m4t.shape = eYo.NA
  io.common.field.canStarLike = false
  // io.cursor is relative to the board or the slot
  // but the magnet must be located relative to the board
  // the magnet will take care of that because it knows
  // if there is a slot.
  var t9k = m4t.targetBoard
  if (t9k) {
    if (m4t.boundField && m4t.boundField.visible) {
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
      if (eYo.board.DEBUG_StartTrackingRender) {
        console.log(eYo.board.DEBUG_Prefix, 'DOWN')
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
      if (board.out_m !== eYo.magnet.disconnectedChild && !ui.up) {
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
        board.span.main += span.main - 1
        io.cursor.forward(span.c, span.main - 1)
        // We just rendered a connected input board
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
      board.ui.someTargetIsMissing = true
    }
    if (m4t.boundField && m4t.boundField.visible) {
      m4t.setOffset(io.cursor.c - m4t.w, io.cursor.l)
      // The `bind` field hides the connection.
      // The bind field is always the last field before the connection.
      // if the connection has a bindField, then rendering the placeholder
      // for that connection is a bit different.
      // Don't display anything for that connection
      io.common.field.afterCaret = false
    } else if (!board.locked_ && !m4t.hidden_) {
      // locked boards won't display any placeholder
      // (slot with no target)
      if (!m4t.disabled_) {
        m4t.setOffset(io.cursor)
        m4t.startOfLine = io.common.startOfLine
        m4t.startOfStatement = io.common.startOfStatement
        if (m4t.s7r_) {
          m4t.side = eYo.key.NONE
          var ending = io.common.ending.slice(-1)[0]
          if (ending && !ending.ui.rightCaret) {
            // an expression board with a right end has been rendered
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
            // If the next rendered object is an expression board
            // with a left end, then this caret shoud be rendered
            // with a left shape and the cursor should not advance.
            // If the caret is the last rendered object of the board,
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
 * Update the shape of the board.
 * Forwards to the driver.
 * @protected
 */
eYo.driver.makeForwarder(eYo.board.BaseC9r_p, 'updateShape')

/**
 * Update the shape of the board.
 * To be subclassed.
 * @param {eYo.board.BaseC9r} board - The board of which the shape would need an update
 * @protected
 */
eYo.fcfl.Board._p.updateShape = eYo.doNothing

/**
 * Hide the board.
 * Forwards to the driver.
 * @param {eYo.board.BaseC9r} board - the board the driver acts on
 */
eYo.fcfl.Board._p.hide = function (board) {
  this.displayedSet(board, false)
}

/**
 * The default implementation forwards to the driver.
 * This must take place while the board is still in a consistent state.
 * @param {eYo.board.BaseC9r} board - the board the driver acts on
 */
eYo.fcfl.Board._p.disposeEffect = function (board) {
  missing implementation
}

/**
 * Show the given menu.
 * The default implementation forwards to the driver.
 * @param {eYo.board.BaseC9r} board - the board the driver acts on
 * @param {*} menu
 */
eYo.fcfl.Board._p.showMenu = function (board, menu) {
  this.MenuShow(board, menu)
}

//////////////////

/**
 * Did connect some board's connection to another connection.
 * When connecting locked boards, select the receiver.
 * @param {eYo.board.BaseC9r} board - the board the driver acts on
 * @param {eYo.magnet.BaseC9r} m4t what has been connected in the board
 * @param {eYo.magnet.BaseC9r} oldTargetM4t what was previously connected in the board
 * @param {eYo.magnet.BaseC9r} targetOldM4t what was previously connected to the new targetConnection
 */
eYo.fcfl.Board._p.didConnect = function (board, m4t, oldTargetM4t, targetOldM4t) {
  if (m4t.isOut) {
    m4t.board.statusTopRemove_()
  }
}

/**
 * Converse of the preceeding.
 * @param {eYo.board.BaseC9r} board - the board the driver acts on
 * @param {eYo.magnet.BaseC9r} m4t what has been connected in the board
 * @param {eYo.magnet.BaseC9r} oldTargetM4t what was previously connected in the board
 */
eYo.fcfl.Board._p.didDisconnect = function (board, m4t, oldTargetM4t) {
  if (m4t.isOut) {
    m4t.board.statusTopAdd_()
  }
}

/**
 * Return the coordinates of the top-left corner of this relative to the
 * drawing surface's origin (0,0), in board units.
 * If the board is on the board, (0, 0) is the origin of the board
 * coordinate system.
 * This does not change with board scale.
 * @return {!eYo.geom.Point} Object with .x and .y properties in
 *     board coordinates.
 */
eYo.fcls.Board._p.whereInParent = eYo.do.NYI

eYo.fcls.Board._p.xyInParent = eYo.do.NYI

eYo.fcls.Board._p.whereInBoard = eYo.do.NYI

eYo.fcls.Board._p.xyInDesk = eYo.do.NYI

/**
 * Returns the coordinates of a bounding rect describing the dimensions of the board.
 * As the shape is not the same comparing to Blockly's default,
 * the bounding rect changes too.
 * Coordinate system: board coordinates.
 * @param {eYo.board.BaseC9r} board - the board the driver acts on
 * @return {!eYo.geom.Rect}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
eYo.fcfl.Board._p.boundingRect = function (board) {
  return new eYo.geom.Rect(
    board.whereInBoard,
    board.size
  )
}
/**
 * The size
 * @param {eYo.board.BaseC9r} board - the board the driver acts on
 */
eYo.fcfl.Board._p.size = function (board) {
  return board.size
}
/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * board.
 * Coordinate system: board coordinates.
 * @param {eYo.board.BaseC9r} board - the board the driver acts on
 * @return {!goog.math.Box}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
eYo.fcfl.Board._p.boundingBox = function (board) {
  return this.boundingRect(board).toBox()
}

/**
 * Show the context menu for this board.
 * @param {eYo.board.BaseC9r} board - the board the driver acts on
 * @param {Event} e Mouse event.
 * @private
 */
eYo.fcfl.Board._p.showContextMenu_ = function (board, e) {
  // this part is copied as is from the parent's implementation. Is it relevant ?
  if (board.board.options.readOnly || !board.contextMenu) {
    return
  }
  eYo.MenuManager.Shared().showMenu(board, e)
}


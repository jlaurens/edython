/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Brick.UI')

goog.require('eYo.Brick')

goog.require('eYo.Change')

goog.forwardDeclare('eYo.Driver')
goog.forwardDeclare('eYo.Svg.Brick')

/**
 * Class for a Render.
 * For edython.
 * @param {!eYo.Brick} brick  brick is the owning object.
 * @readonly
 * @property {eYo.Brick} brick - The brick owning the receiver.
 * @readonly
 * @property {object} change - The change property of the receiver.
 * @readonly
 * @property {object} reentrant_ - The reentrant_ property of the receiver.
 * @readonly
 * @property {object} span - The span of the owning brick.
 * @readonly
 * @property {object} driver - The graphics driver.
 * @property {boolean} down - Whether in the process of down rendering, from parent to child, prevents infinite loops.
 * @property {boolean} up - Whether in the process of up rendering, from child to parent, prevents infinite loops.
 * @property {boolean} isShort - Whether the owning brick is a short brick
 * @property {boolean} parentIsShort - Whether the parent is a short brick
 * @property {boolean} someTargetIsMissing - Whether some target is missing
 * @property {boolean} mayBeLast - Whether the owning brick may be last in the statement.
 * @property {boolean} isLastInExpression - Whether the owning brick is last in an expression brick.
 * @property {boolean} isLastInStatement - Whether the owning brick is last in a statement brick.
 * @property {boolean} startOfLine - Whether the owning brick is at the start of a line. (Statements may not start a line)
 * @property {boolean} startOfStatement - Whether the owning brick is at the start of a statement.
 * @readonly
 * @property {boolean} hasLeftEdge  whether the owning brick has a left edge. When bricks are embedded, we might want to shorten things because the boundaries may add too much horizontal space.
 * @readonly
 * @property {boolean} hasRightEdge  whether the owning brick has a right edge.
 * @readonly
 * @property {Object}  whereInBoard  the coordinates relative to the surface.
 */
eYo.Brick.UI = function(brick) {
  this.brick_ = brick
  brick.ui_ = this
  this.down = this.up = false
  this.xy_ = new eYo.Where()
  this.driver.brickInit(brick)
  this.updateBrickWrapped()
}

/**
 * The default implementation forwards to the driver.
 */
eYo.Brick.UI.prototype.dispose = function () {
  if (this.xy_) {
    this.driver.brickDispose(this.brick_)
    this.brick_ = null
    this.xy_.dispose()
    this.xy_= null
  }
}

Object.defineProperties(eYo.Brick.UI, {
  /**
   * Delay in ms between trigger and bumping unconnected block out of alignment.
   */
  BUMP_DELAY: { value: 250 },
})

// computed properties
Object.defineProperties(eYo.Brick.UI.prototype, {
  brick: {
    get() {
      return this.brick_
    }
  },
  // brick_: {
  //   get() {
  //     return this.brick__
  //   },
  //   set (newValue) {
  //     if (!newValue) {
  //       console.error('BREAK HERE')
  //     }
  //     this.brick__ = newValue
  //   }
  // },
  board: {
    get () {
      return this.brick_.board
    }
  },
  change: {
    get() {
      return this.brick_.change
    }
  },
  driver: {
    get() {
      return this.brick_.board.ui_driver
    }
  },
  reentrant_: {
    get() {
      return this.brick_.reentrant_
    }
  },
  span: {
    get() {
      return this.brick_.span
    }
  },
  hasLeftEdge: {
    get () {
      return !this.brick_.wrapped_ && !this.brick_.locked_
    }
  },
  hasRightEdge: {
    get () {
      return !this.brick_.wrapped_ && !this.brick_.locked_
    }
  },
  minBrickW: {
    get () {
      return this.brick_.isStmt ? eYo.Span.INDENT : 0
    }
  },
  bBox: {
    get () {
      return this.rendered && (this.driver.brickGetBBox(this.brick_))
    }
  },
  hasSelect: {
    get () {
      return this.rendered && (this.driver.brickHasFocus(this.brick_))
    }
  },
  /**
   * Position of the receiver in the board.
   * @type {eYo.Where}
   * @readonly
   */
  xy: {
    get () {
      return this.xy_.clone
    },
    set (newValue) {
      this.xy_.set(newValue)
    }
  },
  /**
   * Position of the receiver in the board.
   * @type {eYo.Where}
   * @readonly
   */
  where: {
    get () {
      return this.xy_.clone
    },
    set (newValue) {
      this.xy_.set(newValue)
    }
  }
})

/**
 * Render the next brick, if relevant.
 * @param {*} recorder
 * @return {boolean=} true if an rendering message was sent, false othrwise.
 */
eYo.Brick.UI.prototype.drawFoot_ = function (recorder) {
  var magnet = this.brick_.foot_m
  if (!magnet) {
    return
  }
  m4t.setOffset(0, this.span.l)
  var t9k = magnet.targetBrick
  if (!t9k) {
    return
  }
  magnet.tighten()
  var do_it = !t9k.ui.rendered ||
  (!this.up &&
    !eYo.Magnet.disconnectedParent &&
    !eYo.Magnet.disconnectedChild&&
    !eYo.Magnet.connectedParent)
  if (do_it) {
    var ui = t9k.ui
    try {
      ui.down = true
      ui.render(false, recorder)
      recorder.span.foot = t9k.span.l
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      ui.down = false
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
eYo.Brick.UI.prototype.renderRight_ = function (io) {
  this.span.right = 0
  var m4t = this.brick_.right_m
  if (m4t) {
    var t9k = m4t.targetBrick
    if (t9k) {
      t9k.span.header = this.span.header + this.span.main - 1
      var ui = t9k.ui
      try {
        ui.startOfLine = io.common.startOfLine
        ui.startOfStatement = io.common.startOfStatement
        ui.mayBeLast = ui.hasRightEdge
        ui.down = true
        if (eYo.Brick.debugStartTrackingRender) {
          console.log(eYo.Brick.debugPrefix, 'DOWN')
        }
        if (t9k.wrapped_) {
          // force target rendering
          t9k.changeDone()
        }
        if (!ui.up) {
          t9k.render(false, io)
          if (!t9k.wrapped_) {
            io.common.field.shouldSeparate = false
            io.common.field.afterSeparator = true
          }
        }
        io.cursor.c = m4t.where.c
      } catch(err) {
        console.error(err)
        throw err
      } finally {
        ui.down = false
        var span = t9k.span
        if (span.w) {
          io.cursor.forward(span.width, span.height - 1)
          // We just rendered a brick
          // it is potentially the rightmost object inside its parent.
          if (ui.hasRightEdge || io.common.shouldPack) {
            io.common.ending.push(t9k)
            t9k.ui.rightCaret = eYo.VOID
            io.common.field.shouldSeparate = false
          }
          io.common.field.afterCaret = false
        }
      }
      this.span.footer = t9k.span.footer + t9k.span.main - 1
      this.span.right = t9k.span.c + t9k.span.right
      return !t9k.isComment
    } else if (this.brick_.isGroup) {
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
eYo.Brick.UI.prototype.renderSuite_ = function (io) {
  var m4t = this.brick_.suite_m
  if (!m4t) {
    return
  }
  if (eYo.Brick.debugStartTrackingRender) {
    console.log(eYo.Brick.debugPrefix, 'SUITE')
  }
  m4t.setOffset(eYo.Span.INDENT, this.span.main)
  var t9k = m4t.targetBrick
  if (t9k) {
    this.someTargetIsMissing = false
    var ui = t9k.ui
    m4t.tighten()
    if (!t9k.ui.rendered || !ui.up) {
      try {
        ui.down = true
        t9k.render(false)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        ui.down = false
      }
    }
    this.span.suite = t9k.span.l + t9k.span.foot
  } else {
    this.span.suite = 0
  }
  return true
}

/**
 * Render the brick.
 * Lays out and reflows a brick based on its contents and settings.
 * Rendering is complicated considering the possibility of both line continuation and multi line strings.
 * @param {*} recorder
 * @param {boolean=} bbbl If false, just render this.brick_ brick.
 *   If true, also render brick's parent, grandparent, etc.  Defaults to true.
 */
// deleted bricks are rendered during deletion
// this.brick_ should be avoided
eYo.Brick.UI.prototype.render = (() => {
  // this is a closure
  /**
   * May render the parent brick, if relevant.
   * @param {Object} recorder  A recorder object.
   * @param {boolean=} bbbl If false, just render this.brick_ brick.
   *   If true, also render brick's parent, grandparent, etc.  Defaults to true.
   * @return {boolean=} true if an rendering message was sent, false otherwise.
   */
  var drawParent = function (recorder, bbbl) {
    // `this.brick_` is a brick
    if (bbbl === false || this.down) {
      return
    }
    // Render all bricks above this one only
    // when the render message did not come from above!
    var parent = this.brick_.parent
    if (parent) {
      var justConnected = eYo.Magnet.connectedParent && this.brick_.out_m === eYo.Magnet.connectedParent.target
      if (!parent.ui.down) {
        try {
          parent.ui.up = true
          var old = this.up
          this.up = true
          if (eYo.Brick.UI.debugStartTrackingRender) {
            console.log(eYo.Brick.UI.debugPrefix, 'UP')
          }
          parent.render(!justConnected, recorder)
        } catch (err) {
          console.error(err)
          throw err
        } finally {
          parent.ui.up = false
          this.up = old
        }
        if (justConnected) {
          if (parent.parent) {
            parent = parent.root
            try {
              parent.ui.up = true
              if (eYo.Brick.UI.debugStartTrackingRender) {
                console.log(eYo.Brick.UI.debugPrefix, 'UP')
              }
              parent.render(false, recorder)
            } catch (err) {
              console.error(err)
              throw err
            } finally {
              parent.ui.up = false
            }
          }
        }
        return true
      }
    } else {
      // Top-most brick.  Fire an event to allow scrollbars to layout.
      this.brick_.board.resizePort()
    }
  }
  var longRender = eYo.Decorate.reentrant_method(
    'longRender',
    function (bbbl, recorder) {
      if (eYo.Brick.UI.debugStartTrackingRender) {
        var n = eYo.Brick.UI.debugCount[brick.id]
        eYo.Brick.UI.debugCount[brick.id] = (n||0)+1
        if (!eYo.Brick.UI.debugPrefix.length) {
          console.log('>>>>>>>>>>')
        }
        eYo.Brick.UI.debugPrefix = eYo.Brick.UI.debugPrefix + '.'
        console.log(eYo.Brick.UI.debugPrefix, brick.type, n, brick.id)
        if (n > 1) {
          n = n + 0
        }
      }
      try {
        this.willRender_(recorder)
        var io = this.draw_(recorder)
        this.layoutMagnets_(io)
        this.drawFoot_(io)
        this.renderMove_(io)
        this.updateShape()
        drawParent.call(this, io, bbbl) || this.alignRightEdges_(io)
        this.didRender_(io)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        if (eYo.Brick.UI.debugStartTrackingRender &&  eYo.Brick.UI.debugPrefix.length) {
          eYo.Brick.UI.debugPrefix = eYo.Brick.UI.debugPrefix.substring(1)
        }
      }
    }
  )
  return function (bbbl, recorder) {
    if (!this.brick_.hasUI || this.rendered === false) { // this.rendered === eYo.VOID is OK
      return
    }
    if (!this.brick_.isEditing && (this.dragging_ || this.brick_.change.level || !this.brick_.board)) {
      return
    }
    recorder && (this.drawPending_(recorder, !this.brick_.wrapped_ && eYo.Key.LEFT))
    // rendering is very special when this.brick_ is just a matter of
    // statement connection
    if (this.rendered) {
      if (eYo.Magnet.disconnectedChild && this.brick_.head_m === eYo.Magnet.disconnectedChild) {
        // this.brick_ is the child one
        var io = this.willShortRender_(recorder)
        this.layoutMagnets_(io)
        this.drawFoot_(io)
        this.renderMove_(io)
        this.updateShape()
        this.brick_.change.save.render = this.brick_.change.count
        drawParent.call(this, io, bbbl) || this.alignRightEdges_(io) // will they have a parent meanwhile?
        return
      } else if (eYo.Magnet.disconnectedParent && this.brick_.foot_m === eYo.Magnet.disconnectedParent) {
        // this.brick_ is the parent one
        // but it may belong to a suite
        var io = this.willShortRender_(recorder)
        this.layoutMagnets_(io)
        this.drawFoot_(io)
        this.renderMove_(io)
        this.updateShape()
        this.brick_.change.save.render = this.brick_.change.count
        drawParent.call(this, io, bbbl) || this.alignRightEdges_(io)
        return
      } else if (eYo.Magnet.connectedParent) {
        if (this.brick_.head_m && eYo.Magnet.connectedParent === this.brick_.head_m.target) {
          var io = this.willShortRender_(recorder)
          this.layoutMagnets_(io)
          this.drawFoot_(io)
          this.renderMove_(io)
          this.updateShape()
          this.brick_.change.save.render = this.brick_.change.count
          drawParent.call(this, io, bbbl) || this.alignRightEdges_(io)
        } else if (this.brick_.foot_m && eYo.Magnet.connectedParent === this.brick_.foot_m) {
          var io = this.willShortRender_(recorder)
          this.layoutMagnets_(io)
          this.drawFoot_(io)
          this.renderMove_(io)
          this.updateShape()
          this.brick_.change.save.render = this.brick_.change.count
          drawParent.call(this, io, bbbl) || this.alignRightEdges_(io)
        } else if (this.brick_.suite_m && eYo.Magnet.connectedParent === this.brick_.suite_m) {
          var io = this.willShortRender_(recorder)
          this.layoutMagnets_(io)
          this.drawFoot_(io)
          this.renderMove_(io)
          this.updateShape()
          this.brick_.change.save.render = this.brick_.change.count
          drawParent.call(this, io, bbbl) || this.alignRightEdges_(io)
        }
      }
    }
    if (!this.down && this.brick_.out_m) {
      // always render from a line start id est
      // an orphan brick or a statement brick with no left brick
      var parent
      if ((parent = this.brick_.parent)) {
        var next
        while (parent.out_m && !parent.ui.down && (next = parent.parent)) {
          parent = next
        }
        // parent has no output magnet or has no parent.
        recorder && (recorder.field.last = eYo.VOID)
        if (!parent.ui.down) {
          if (eYo.Magnet.connectedParent && eYo.Magnet.connectedParent.brick === this.brick_) {
            try {
              parent.ui.up = true
              parent.render(bbbl, recorder)
            } catch (err) {
              console.error(err)
              throw err
            } finally {
              parent.ui.up = false
            }
          } else {
            parent.render(bbbl, recorder)
          }
        }
        return
      }
    }
    if (this.brick_.change.save.render === this.brick_.change.count) {
      // minimal rendering
      var io = this.willShortRender_(recorder)
      this.layoutMagnets_(io)
      this.drawFoot_(io)
      this.renderMove_(io)
      this.updateShape()
      drawParent.call(this, io, bbbl) || this.alignRightEdges_(io)
      return
    }
    longRender.call(this, bbbl, recorder)
    this.brick_.change.save.render = this.brick_.change.count
  }
}) ()

/**
 * Will draw the brick, short version.
 * The print statement needs some preparation before drawing.
 * @param {*} recorder
 * @private
 */
eYo.Brick.UI.prototype.willShortRender_ = function (recorder) {
  return this.newDrawRecorder_(recorder)
}

/**
 * Translates the brick, forwards to the ui driver after managing the snap formal argument.
 * @param {eYo.Where} xy The xy coordinate of the translation in board units.
 * @param {Boolean} snap Whether we should snap to the grid.
 */
eYo.Brick.UI.prototype.moveTo = function(xy, snap) {
  if (snap && this.board && !this.board.dragging && !this.parent && !this.isInFlyout) {
    xy = eYo.Where.cl(xy.c, xy.l)
  }
  this.xy = xy
  this.driver.brickPlace(this.brick_)
  this.placeMagnets_()
}

/**
 * Move a standalone brick by a relative offset.
 * Event aware for top blocks, except when dragging.
 * @param {number} dxy Offset in board units.
 * @param {Boolean} snap Whether we should snap to the grid.
 */
eYo.Brick.UI.prototype.moveBy = function(dxy, snap) {
  var xy = this.xy.forward(dxy)
  if (this.brick_.parent || this.desk.desktop.isDragging) {
    this.moveTo(xy)
  } else {
    eYo.Events.fireBrickMove(this.brick_, () => {
      this.moveTo(xy, snap)
      this.board.resizePort()
    })
  }
}

/**
 * Will draw the brick.
 * Prepares the brick and forwards to the driver.
 * @param {*} recorder
 * @private
 */
eYo.Brick.UI.prototype.willRender_ = function (recorder) {
  this.brick_.consolidate()
  this.driver.brickWillRender(this.brick_, recorder)
}

/**
 * Did draw the brick. Default implementation does nothing.
 * @param {*} recorder
 * @private
 */
eYo.Brick.UI.prototype.didRender_ = function (recorder) {
  this.driver.brickDidRender(this.brick_, recorder)
}

/**
 * Update all of the connections on this.brick_ with the new locations.  * @private
 */
eYo.Brick.UI.prototype.renderMoveMagnets_ = function() {
  var xy = this.whereInBoard
  var f = m4t => {
    if (m4t) {
      m4t.moveToOffset(xy)
      m4t.target && m4t.tighten()
    }
  }
  // Don't tighten previous or output connections because they are inferior
  // connections.
  var m5s = this.brick_.magnets
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
  this.brick_.forEachSlot(slot => f(slot.magnet))
  // next is done while rendering
  // f(m5s.right)
  // f(m5s.suite)
  f(m5s.foot)
}

/**
 * Update all of the connections on this.brick_ with the new locations.  * @private
 */
eYo.Brick.UI.prototype.placeMagnets_ = function() {
  var xy = this.whereInBoard
  var f = m4t => {
    if (m4t) {
      m4t.moveToOffset(xy)
      var t9k = m4t.targetBrick
      if (t9k) {
        m4t.tighten()
        t9k.ui.placeMagnets_()
      }
    }
  }
  // Don't tighten previous or output connections because they are inferior
  // connections.
  var m5s = this.brick_.magnets
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
  this.brick_.forEachSlot(slot => f(slot.magnet))
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
eYo.Brick.UI.prototype.renderMove_ = function (recorder) {
  this.renderMoveMagnets_()
  // var blockTL = this.whereInBoard
  // this.brick_.forEachSlot((slot) => {
  //   var m4t = input.magnet
  //   if (m4t) {
  //     m4t.moveToOffset(blockTL)
  //     m4t.tighten()
  //   }
  // })
}

/**
 * Layout previous, next and output brick connections.
 * @param {*} recorder
 * @private
 */
eYo.Brick.UI.prototype.layoutMagnets_ = function (recorder) {
  var m5s = this.brick_.magnets
  var m4t = m5s.out
  if (m4t) {
    m4t.setOffset()
  } else {
    if ((m4t = m5s.head)) {
      m4t.setOffset()
    }
    if ((m4t = m5s.foot)) {
      if (this.brick_.collapsed) {
        m4t.setOffset(0, 2)
      } else {
        m4t.setOffset(0, this.span.height)
      }
    }
    if ((m4t = m5s.left)) {
      m4t.setOffset()
    }
    if ((m4t = m5s.right)) {
      m4t.setOffset(this.span.width, 0)
    }
  }
}

/**
 * Draw the path of the brick.
 * @param {*} recorder
 * @private
 */
eYo.Brick.UI.prototype.draw_ = function (recorder) {
  if (this.driver.brickCanDraw(this.brick_)) {
    var io = this.drawModelBegin_(recorder)
    try {
      this.drawModel_(io)
    } catch (err) {
      console.error (err)
      throw err
    } finally {
      this.renderRight_(io) || this.renderSuite_(io)
      this.updateShape()
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
eYo.Brick.UI.prototype.alignRightEdges_ = eYo.Change.decorate(
  'alignRightEdges_',
  function (recorder) {
    if (this.brick_.parent || !this.brick_.isStmt || !this.rendered || !this.brick_.board || !this.brick_.hasUI) {
      return
    }
    var right = 0
    var t = eYo.Span.INDENT
    this.brick_.forEachStatement((b, depth) => {
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
      this.brick_.forEachStatement((b, depth) => {
        var c = right - t * depth
        // find the last right brick and
        var bb = b
        while ((bb = bb.right)) {
          c -= bb.span.min_c - 1 // see comment above
          b = bb
        }
        if (b.c !== c) {
          b.span.c = c
          b.ui.updateShape()
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
eYo.Brick.UI.prototype.newDrawRecorder_ = function (recorder) {
  var io = {
    steps: [],
    n: 0, // count of rendered objects (fields, slots and inputs)
    form: eYo.VOID // rendered field or magnet
  }
  io.cursor = eYo.Where.xy(0, this.span.header)
  if (recorder) {
    // io inherits some values from the given recorder
    io.recorder = recorder
    io.common = recorder.common // It is always defined
  } else {
    io.common = {
      pending: eYo.VOID,
      ending: [],
      shouldSeparate: false,
      afterEdge: false,
      shouldPack: false,
      startOfStatement: false,
      startOfLine: !this.brick_.isExpr || !this.brick_.parent, // statement, group or orphan brick
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
  this.firstRenderedMagnet = this.lastRenderedMagnet = eYo.VOID
  io.footer = 0
  io.main = 1
  return io
}

/**
 * Prepare rendering of a brick.
 * @param {?Object} recorder  When null, this.brick_ is not the start of a statement
 * @return {!Object} a local recorder
 * @private
 */
eYo.Brick.UI.prototype.drawModelBegin_ = function (recorder) {
  this.parentIsShort = false
  this.isShort = false
  this.someTargetIsMissing = false
  // we define the `io` named recorder which is specific to this.brick_.
  var io = this.newDrawRecorder_(recorder)
  // By default, we restart from scratch,
  // set the size to 0 for the width and 1 for the height
  // And reset properties
  this.mayBeLast = false
  this.isLastInExpression = false
  this.isLastInStatement = false
  // Do we need some room for the left side of the brick?
  // no for wrapped bricks
  if (!this.brick_.wrapped_) {
    if (!this.brick_.isExpr || !this.brick_.locked_ || !recorder) {
      // statement or unlocked,
      // one space for the left edge of the brick
      // (even for locked statements, this.brick_ is to avoid a
      // display shift when locking/unlocking)
      io.cursor.c = 1
      io.common.field.afterBlack = false
    }
  }
  if (this.hasLeftEdge || !recorder || !this.brick_.out_m) {
    // statement or unlocked,
    // one space for the left edge of the brick
    // (even for locked statements, this.brick_ is to avoid a
    // display shift when locking/unlocking)
    io.cursor.c = 1
    io.common.field.afterBlack = false
    io.common.field.afterSeparator = true
    io.common.field.shouldSeparate = false
    // Do not change io.common.field.shouldSeparate ?
  }
  if (this.brick_.isExpr) {
    this.startOfStatement = io.common.startOfStatement
    this.startOfLine = io.common.startOfLine
  } else {
    this.startOfStatement = io.common.startOfStatement = true
    this.span.header = 0
  }
  this.driver.brickDrawModelBegin(this.brick_, io)
  return io
}

/**
 * Render the inputs, the fields and the slots of the brick.
 * The `recorder` is an object that keeps track of some
 * rendering information. It is the argument of various methods.
 * This method is executed at least once for any rendered brick.
 * Since then, it won't be executed as long as the brick has not been edited.
 * @param {?Object} io
 * @private
 */
eYo.Brick.UI.prototype.drawModel_ = function (io) {
  this.fieldDrawFrom_(this.brick_.fieldAtStart, io)
  if ((io.slot = this.brick_.slotAtHead)) {
    do {
      this.drawSlot_(io)
    } while ((io.slot = io.slot.next))
  }
  this.fieldDrawFrom_(this.brick_.toEndField, io)
  this.drawModelEnd_(io)
  this.driver.brickDrawModelEnd(this.brick_, io)
  return
}

/**
 * Terminate to render the model.
 * @param {?Object} recorder
 * @private
 */
eYo.Brick.UI.prototype.drawModelEnd_ = function (io) {
  // and now some space for the right edge, if any
  if (!this.brick_.wrapped_) {
    if (this.brick_.isExpr) {
      if (io.common.field.last && io.common.field.last.isEditing) {
        io.cursor.c += 1
        io.common.field.afterSeparator = false
        io.common.field.afterBlack = false
      } else if (!io.recorder || io.common.field.didPack) {
        io.cursor.c += 1
        io.common.field.afterSeparator = io.common.field.shouldSeparate
        io.common.field.shouldSeparate = false
        io.common.field.afterBlack = false
      } else if (io.common.field.shouldSeparate) {
        if (!io.recorder) {
          io.cursor.c += 1
          io.common.field.afterSeparator = io.common.field.shouldSeparate
          io.common.field.shouldSeparate = false
          io.common.field.afterBlack = false
        } else if (!this.brick_.locked_ && !io.common.ending.length) {
          io.cursor.c += 1
          io.common.field.afterSeparator = io.common.field.shouldSeparate
          io.common.field.shouldSeparate = false
          io.common.field.afterBlack = false
        }
      } else {
        io.cursor.c += 1
        io.common.field.afterSeparator = io.common.field.shouldSeparate
        io.common.field.shouldSeparate = false
        io.common.field.afterBlack = false
      }
    } else {
      io.cursor.c += 1
      io.common.field.afterSeparator = false
      io.common.field.afterBlack = false
    }
  }
  if (!this.brick_.isExpr) {
    this.drawEnding_(io, true, true)
  } else if (!io.recorder) {
    this.drawEnding_(io, true)
  }
  this.drawPending_(io)
  if (!this.brick_.wrapped_) {
    var m4t = io.form
    var t9k = m4t && m4t.targetBrick
    if (io.n < 2 && !this.brick_.wrapped_) {
      // this.brick_ is a short brick, special management of selection
      this.isShort = true
      if (t9k) {
        t9k.ui.parentIsShort = true
        // always add a space to the right
        t9k.ui.isLastInStatement = false
        t9k.ui.updateShape()
        io.cursor.c += 1
      }
    } else {
      this.isShort = false
      if (t9k) {
        t9k.ui.parentIsShort = false
      }
    }
  }
  this.span.c_min = io.cursor.c = Math.max(io.cursor.c, this.minBrickW)
  if (io.recorder) {
    // We ended a brick. The right edge is generally a separator.
    // No need to add a separator if the brick is wrapped or locked
    io.common.field.shouldSeparate && (io.common.field.shouldSeparate = !this.hasRightEdge)
    // if the brick is wrapped or locked, there won't be any
    // right edge where a caret could be placed.
    // But may be we just rendered bricks in cascade such that
    // there might be some right edge already.
  }
  this.lastRenderedMagnet = io.common.magnetDone
}

/**
 * Render the slot given in io parameter.
 * @param io
 * @private
 */
eYo.Brick.UI.prototype.drawSlot_ = function (io) {
  var slot = io.slot
  // if (!slot) {
  //   return
  // }
  if (!slot.incog) {
    // move the slot to the correct location
    slot.where.set(io.cursor)
    // Now reset the cursor relative to the slot
    io.cursor.set()
    this.fieldDrawFrom_(slot.fieldAtStart, io)
    if ((io.magnet = slot.magnet)) {
      this.drawInputMagnet_(io)
    }
    this.fieldDrawFrom_(slot.toEndField, io)
    // come back to the brick coordinates
    io.cursor.forward(slot.where)
    // translate at the end because `slot.where` may change
    // due to the shrink process
  }
  this.driver.slotDisplay(slot)
}

/**
 * Render the leading # character for collapsed statement bricks.
 * Statement subclasses must override it.
 * @param io
 * @private
 */
eYo.Brick.UI.prototype.drawSharp_ = function (io) {
  if (this.brick_.isControl) { // Not very clean, used as hook before rendering the comment fields.
    io.cursor.c += 4
  } else if (this.brick_.isStmt) {
    this.driver.brickDrawSharp(this.brick_, this.brick_.disabled)
    if (this.brick_.disabled) {
      io.cursor.c += 2
      io.common.startOfLine = io.common.startOfStatement = false
    }
  }
}

/**
 * Render the given field, when defined.
 * This is the process that make the cursor move,
 * together with brick boundaries.
 *
 * @param {!Object} field A field.
 * @param {!Object} io An input/output recorder.
 * @private
 */
eYo.Brick.UI.prototype.drawField_ = function (field, io) {
  var c = io.cursor.c
  field.ui_driver.fieldDisplayedUpdate(field)
  if (field.visible) {
    // Actually, io.cursor points to the location where the field
    // is expected. It is relative to the enclosing `SVG` group,
    // which is either a brick or a slot.
    // If there is a pending caret, draw it and advance the cursor.
    io.form = field
    field.willRender()
//    this.driver.fieldTextRemove(field)
    var text = field.displayText
    // Replace the text.
    this.driver.fieldTextUpdate(field)
    if (text.length) {
      if (text === '>') {
        console.error(io)
      }
      this.drawEnding_(io)
      this.drawPending_(io)
      io.common.startOfLine = io.common.startOfStatement = false
      ++ io.n
      if (field.size.l === 1) {
      //    this.driver.fieldTextCreate(field)
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
            if (this.brick_.packedQuotes && (head === "'" || head === '"')) {
              io.cursor.c -= 1
            } else if (this.brick_.packedBrackets && head === "[") {
              io.cursor.c -= 1
            } else if (this.brick_.packedBraces && head === "{") {
              io.cursor.c -= 1
            } else if (this.brick_.packedParenthesis && head === "(") {
              io.cursor.c -= 1
            }
          } else if (head === '.' && !io.common.field.afterBlack) {
            io.cursor.c -= 1
          } else if (io.common.field.afterBlack
            && (eYo.XRE.operator.test(head) || head === '=' || (head === ':' && text.length > 1 /* `:=` but not `:` alone */))) {
            io.cursor.c += 1
          } else if (io.common.field.shouldSeparate
              && (!field.startsWithSeparator()
              || head === '='
              || (head === ':' && text.length > 1 /* `:=` but not `:` alone */))) {
            io.cursor.c += 1
          }
        }
        io.common.field.wasStarLike = (io.common.field.canStarLike && (['*', '@', '+', '-', '~', '.'].indexOf(tail) >= 0))
        io.common.field.canStarLike = false
        io.common.field.shouldSeparate = !io.common.field.wasStarLike
          && (eYo.XRE.id_continue.test(tail)
            || eYo.XRE.operator.test(tail)
            || tail === ':'
            || tail === '='
            || tail === '#'
            || tail === ','
            || (tail === '.'
              && (!(field instanceof eYo.FieldLabel))))
        io.common.field.afterBlack = !eYo.XRE.white_space.test(tail)
        io.common.field.afterCaret = false
        // place the field at the right position:
      }
      this.driver.fieldMoveTo(field, io.cursor)
      // then advance the cursor after the field.
      if (field.size.w) {
        io.cursor.c += field.size.c
        io.cursor.l += field.size.l - 1
        // now that I have rendered something
        io.common.startOfLine = io.common.startOfStatement = false
      }
      if (io.cursor.c > 2) {
        if ((tail === '"' || tail === "'") && this.brick_.packedQuotes) {
          io.common.shouldPack = null // this.brick_
        } else if (tail === ']' && this.brick_.packedBrackets) {
          io.common.shouldPack = this.brick_
        } else if ((tail === '}') && this.brick_.packedBraces) {
          io.common.shouldPack = this.brick_
        } else if ((tail === ')') && this.brick_.packedParenthesis) {
          io.common.shouldPack = this.brick_
        }
      }
    }
    if (field.isEditing) {
      // This is a trick to avoid some bad geometry while editing
      // this.brick_ is useful for widget only.
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
 * @param {!Object} field A field.
 * @param {!Object} io An input/output recorder.
 * @private
 */
eYo.Brick.UI.prototype.fieldDrawFrom_ = function (field, io) {
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
 * @param {!Object} io An input/output record.
 * @param {?Boolean} only_prefix
 * @return {Number}  The advance of the cursor (in columns)
 * @private
 */
eYo.Brick.UI.prototype.drawFields_ = function (io, only_prefix) {
  var current = io.cursor.c
  io.input.fieldRow.forEach((field) => {
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
 * @param {?Object} io the input/output argument.
 * @private
 */
eYo.Brick.UI.prototype.drawEnding_ = function (io, isLast = false, inStatement = false) {
  if (io) {
    var isLastInExpression = isLast && !inStatement
    var isLastInStatement = isLast && inStatement
    if (io.common.ending.length) {
      // should we shrink after a quote or a bracket?
      if (io.common.shouldPack && (!isLast || io.common.shouldPack.wrapped_)) {
        // first loop to see if there is a pending rightCaret
        // BTW, there can be an only one right caret
        if (io.common.ending.some(b3k => !!b3k.ui.rightCaret)) {
          io.common.shouldPack = eYo.VOID
        } else {
          // there is no following right caret, we can pack
          var pack = false
          io.common.ending.forEach(b3k => {
            if (b3k === io.common.shouldPack) {
              io.common.shouldPack = eYo.VOID
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
        b3k.ui.updateShape()
        var m4t = b3k.ui.rightCaret
        if (m4t) {
          m4t.side = eYo.Key.RIGHT
          m4t.shape = eYo.Key.NONE
          m4t.isLastInStatement = isLastInStatement
          var d = eYo.Shape.definitionWithMagnet(m4t) // depends on the shape and the side
          var brick = m4t.brick
          if (this.brick_ === brick) {
            // we are lucky, this.brick_ is the brick we are currently rendering
            io.steps.push(departFocus)
          } else {
            // bad luck, brick has already been rendered
            // we must append the definition to the path
            // this.brick_ may happen for bricks with no left or right end,
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
 * @param {?Object} io the input/output argument.
 * @param {?String} side On which side of a brick.
 * @param {?String} shape Which is the shape.
 * @private
 */
eYo.Brick.UI.prototype.drawPending_ = function (io, side = eYo.Key.NONE, shape = eYo.Key.NONE) {
  if (io) {
    var m4t = io.common.pending
    if (m4t) {
      m4t.side = side
      m4t.shape = io.isLastInStatement ? eYo.Key.Right : shape
      var shp = eYo.Shape.newWithMagnet(m4t)
      var brick = m4t.brick
      if (this.brick_ === brick) {
        // we are lucky, this.brick_ is the brick we are currently rendering
        io.steps.push(shp.definition)
      } else {
        // bad luck, brick has already been rendered
        // we must append the definition to the path
        // this.brick_ may happen for bricks with no left or right end,
        // eg locked or wrapped bricks.
        var path = brick.pathInner_
        path.setAttribute('d', `${path.getAttribute('d')} ${shp.definition}`)
      }
      if (shp.width) {
        // should we advance the cursor?
        if (m4t.side === eYo.Key.NONE) {
          io.cursor.forward(shp.width)
          io.common.startOfLine = io.common.startOfStatement = false
        }
        // a space was added as a visual separator anyway
        io.common.field.shouldSeparate = false
        // all done
        io.common.pending = eYo.VOID
        io.common.field.afterBlack = false // do not step back
        io.common.field.afterCaret = true // do not step back
      }
      return shp
    }
  }
}

/**
 * Render the input magnet.
 * @param {!Object} io the input/output argument.
 * @private
 */
eYo.Brick.UI.prototype.drawInputMagnet_ = function (io) {
  var m4t = io.magnet
  m4t.renderedRight = eYo.VOID
  m4t.renderedLeft = io.common.magnetDone
  if (io.common.magnetDone) {
    io.common.magnetDone.inputRight = io.magnet
  } else {
    this.firstRenderedMagnet = io.magnet
  }
  io.common.magnetDone = io.magnet
  ++ io.n
  m4t.startOfLine = io.common.startOfLine
  m4t.startOfStatement = io.common.startOfStatement
  io.form = m4t
  m4t.side = m4t.shape = eYo.VOID
  io.common.field.canStarLike = false
  // io.cursor is relative to the brick or the slot
  // but the magnet must be located relative to the brick
  // the magnet will take care of that because it knows
  // if there is a slot or only an input.
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
    if (ui) {
      try {
        ui.startOfLine = io.common.startOfLine
        ui.startOfStatement = io.common.startOfStatement
        ui.mayBeLast = ui.hasRightEdge
        ui.down = true
        if (eYo.Brick.UI.debugStartTrackingRender) {
          console.log(eYo.Brick.UI.debugPrefix, 'DOWN')
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
        if (this.brick_.out_m !== eYo.Magnet.disconnectedChild && !ui.up) {
          t9k.render(false, io)
          if (!t9k.wrapped_) {
            io.common.field.shouldSeparate = false
            io.common.field.afterSeparator = true
          }
        }
      } catch(err) {
         console.error(err)
         throw err
      } finally {
        ui.down = false
        var span = t9k.span
        if (span.w) {
          this.span.main += span.main - 1
          io.cursor.forward(span.c, span.main - 1)
          // We just rendered a connected input brick
          // it is potentially the rightmost object inside its parent.
          if (ui.hasRightEdge || io.common.shouldPack) {
            io.common.ending.push(t9k)
            ui.rightCaret = eYo.VOID
            io.common.field.shouldSeparate = false
          }
          io.common.field.afterCaret = false
        }
      }
    }
  } else {
    if (m4t.targetIsMissing) {
      this.someTargetIsMissing = true
    }
    if (m4t.bindField && m4t.bindField.visible) {
      m4t.setOffset(io.cursor.c - m4t.w, io.cursor.l)
      // The `bind` field hides the connection.
      // The bind field is always the last field before the connection.
      // if the connection has a bindField, then rendering the placeholder
      // for that connection is a bit different.
      // Don't display anything for that connection
      io.common.field.afterCaret = false
    } else if (!this.brick_.locked_ && !m4t.hidden_) {
      // locked bricks won't display any placeholder
      // (input with no target)
      if (!m4t.disabled_) {
        m4t.setOffset(io.cursor)
        m4t.startOfLine = io.common.startOfLine
        m4t.startOfStatement = io.common.startOfStatement
        if (m4t.s7r_) {
          m4t.side = eYo.Key.NONE
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
            // we might want this.brick_ caret not to advance the cursor
            // If the next rendered object is a field, then
            // this.brick_ caret should be rendered normally
            // and the cursor should advance.
            // If the next rendered object is an expression brick
            // with a left end, then this.brick_ caret shoud be rendered
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
          var shape = eYo.Shape.newWithMagnet(m4t)
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
 * Render the fields of a value input, if relevant.
 * @param {!Object} io the input/output argument.
 * @private
 */
eYo.Brick.UI.prototype.drawInput_ = function (io) {
  this.drawFields_(io, true)
  io.magnet = io.input.magnet
  this.drawInputMagnet_(io)
  this.drawFields_(io, false)
  return true
}

/**
 * Update the shape of the brick.
 * Forwards to the driver.
 * @protected
 */
eYo.Brick.UI.prototype.updateShape = function () {
  this.driver.brickUpdateShape(this.brick_)
}

/**
 * Hide the brick.
 * Forwards to the driver.
 */
eYo.Brick.UI.prototype.hide = function () {
  this.driver.brickDisplayedSet(this.brick_, false)
}

Object.defineProperties(eYo.Brick.UI.prototype, {
  visible: {
    /**
     * Get the display status of the receiver's brick.
     * Forwards to the driver.
     */
    get () {
      return this.driver.brickDisplayedGet(this.brick_)
    },
    /**
     * Set the display status of the receiver's brick.
     * Forwards to the driver.
     * @param {boolean} visible
     */
    set (newValue) {
      this.driver.brickDisplayedSet(this.brick_, visible)
    }
  },
  dragging: {
    get () {
      return this.dragging_
    },
    set (newValue) {
      newValue = !!newValue
      if (this.dragging_ !== newValue) {
        this.dragging_ = newValue
        this.driver.brickSetDragging(this.brick_, newValue)      
      }
    }
  }
})

/**
 * The default implementation forwards to the driver.
 */
eYo.Brick.UI.prototype.updateDisabled = function () {
  this.driver.brickUpdateDisabled(this.brick_)
  this.brick_.children.forEach(child => child.ui.updateDisabled())
}

/**
 * The default implementation forwards to the driver.
 */
eYo.Brick.UI.prototype.connectEffect = function () {
  var b = this.brick_.board
  b.audio.play('click')
  if (b.scale < 1) {
    return // Too small to care about visual effects.
  }
  this.driver.brickConnectEffect(this.brick_)
}

/**
 * The default implementation forwards to the driver.
 * This must take place while the brick is still in a consistent state.
 */
eYo.Brick.UI.prototype.disposeEffect = function () {
  this.board.audio.play('delete');
  this.driver.brickDisposeEffect(this.brick_)
}

/**
 * Show the given menu.
 * The default implementation forwards to the driver.
 * @param {*} menu
 */
eYo.Brick.UI.prototype.showMenu = function (menu) {
  this.driver.brickMenuShow(this.brick_, menu)
}

/**
 * Make the given brick wrapped.
 * The default implementation forwards to the driver.
 */
eYo.Brick.UI.prototype.updateBrickWrapped = function () {
  this.driver.brickUpdateWrapped(this.brick_)
}

/**
 * The default implementation forwards to the driver.
 */
eYo.Brick.UI.prototype.sendToFront = function () {
  this.driver.brickSendToFront(this.brick_)
}

/**
 * The default implementation forwards to the driver.
 */
eYo.Brick.UI.prototype.sendToBack = function () {
  this.driver.brickSendToFront(this.brick_)
}

//////////////////

/**
 * Add the hilight path_.
 * Forwards to the driver.
 */
eYo.Brick.UI.prototype.addBrickHilight_ = function () {
  this.driver.brickHilightAdd(this.brick_)
}

/**
 * Remove the hilight path.
 * Forwards to the driver.
 */
eYo.Brick.UI.prototype.removeBrickHilight_ =function () {
  this.driver.brickHilightRemove(this.brick_)
}

/**
 * Add the select path.
 * Forwards to the driver.
 */
eYo.Brick.UI.prototype.addSelect = function () {
  this.driver.brickSelectAdd(this.brick_)
}

/**
 * Remove the select path.
 * Forwards to the driver.
 */
eYo.Brick.UI.prototype.removeFocus = function () {
  this.driver.brickSelectRemove(this.brick_)
}

/**
 * Add the hilight connection path_.
 * Forwards to the driver.
 */
eYo.Brick.UI.prototype.addMagnet_ = function () {
  this.driver.brickMagnetAdd(this.brick_)
}

/**
 * Remove the select path.
 * Forwards to the driver.
 */
eYo.Brick.UI.prototype.removeMagnet_ = function () {
  this.driver.brickMagnetRemove(this.brick_)
}

/**
 * Forwards to the driver.
 */
eYo.Brick.UI.prototype.addStatusTop_ = function () {
  this.driver.brickStatusTopAdd(this.brick_)
}


/**
 * Remove the `top` status.
 * Forwards to the driver.
 */
eYo.Brick.UI.prototype.removeStatusTop_ = function (eyo) {
  this.driver.brickStatusTopRemove(this.brick_)
}

/**
 * Forwards to the driver and `addSelect` to each field.
 */
eYo.Brick.UI.prototype.addStatusFocus_ = function () {
  this.driver.brickStatusFocusAdd(this.brick_)
  this.brick_.forEachSlot(slot => {
    slot.forEachField(field => {
      if (goog.isFunction(field.addSelect)) {
        field.addSelect()
      }
    })
  })
}

/**
 * Reverse `addStatusFocus_`. Forwards to the driver and various fields.
 */
eYo.Brick.UI.prototype.removeStatusFocus_ = function () {
  this.driver.brickStatusSelectRemove(this.brick_)
  this.brick_.forEachSlot(slot => {
    slot.forEachField(field => {
      goog.isFunction(field.removeFocus) && field.removeFocus()
    })
  })
}

/**
 * Did connect some brick's connection to another connection.
 * When connecting locked bricks, select the receiver.
 * @param {!eYo.Magnet} m4t what has been connected in the brick
 * @param {!eYo.Magnet} oldTargetM4t what was previously connected in the brick
 * @param {!eYo.Magnet} targetOldM4t what was previously connected to the new targetConnection
 */
eYo.Brick.UI.prototype.didConnect = function (m4t, oldTargetM4t, targetOldM4t) {
  if (m4t.isOutput) {
    m4t.brick.ui.removeStatusTop_()
  }
}

/**
 * Converse of the preceeding.
 * @param {!eYo.Magnet} m4t what has been connected in the brick
 * @param {!eYo.Magnet} oldTargetM4t what was previously connected in the brick
 */
eYo.Brick.UI.prototype.didDisconnect = function (m4t, oldTargetM4t) {
  if (m4t.isOutput) {
    m4t.brick.ui.addStatusTop_()
  }
}

/**
 * Return the coordinates of the top-left corner of this.brick_ relative to the
 * drawing surface's origin (0,0), in board units.
 * If the brick is on the board, (0, 0) is the origin of the board
 * coordinate system.
 * This does not change with board scale.
 * @return {!eYo.Where} Object with .x and .y properties in
 *     board coordinates.
 */
Object.defineProperties(eYo.Brick.UI.prototype, {
  xyInParent: {
    get () {
      return this.driver.brickWhereInParent(this.brick_)
    }
  },
  whereInBoard: {
    get () {
      return this.driver.brickWhereInBoard(this.brick_)
    }
  },
  xyInDesk: {
    get () {
      return this.driver.brickWhereInDesk(this.brick_)
    }
  },
  /**
   * Returns the coordinates of a bounding rect describing the dimensions of the brick.
   * As the shape is not the same comparing to Blockly's default,
   * the bounding rect changes too.
   * Coordinate system: board coordinates.
   * @return {!eYo.Rect}
   *    Object with top left and bottom right coordinates of the bounding box.
   */
  boundingRect: {
    get () {
      return new eYo.Rect(
        this.whereInBoard,
        this.size
      )
    }
  },
  /**
   * The size
   */
  size: {
    get () {
      return this.brick_.size
    }
  },
  /**
   * Returns the coordinates of a bounding box describing the dimensions of this
   * brick.
   * As the shape is not the same comparing to Blockly's default,
   * the bounding box changes too.
   * Coordinate system: board coordinates.
   * @return {!goog.math.Box}
   *    Object with top left and bottom right coordinates of the bounding box.
   */
  boundingBox: {
    get () {
      return this.boundingRect.toBox()
    }
  },
})

/**
 * Hilight the given connection.
 * The default implementation forwards to the driver.
 * @param {*} c_eyo
 */
eYo.Brick.UI.prototype.magnetHilight = function (c_eyo) {
  this.driver.magnetHilight(c_eyo)
}

/**
 * Change the UI while dragging, or not.
 * @param {boolean} dragging True if adding, false if removing.
 */
eYo.Brick.UI.prototype.setDragging = function(dragging) {
  this.dragging = dragging
}

/**
 * Set the parent.
 */
eYo.Brick.UI.prototype.setParent = function (parent) {
  this.driver.brickParentSet(this.brick, parent)
}

/**
 * The default implementation forwards to the driver.
 * @param {!eYo.Brick} newParent to be connected.
 */
eYo.Brick.UI.prototype.parentWillChange = function (newParent) {
  this.driver.brickParentWillChange(this.brick_, newParent)
}

/**
 * The default implementation forwards to the driver.
 * @param {!eYo.Brick} oldParent replaced.
 */
eYo.Brick.UI.prototype.parentDidChange = function (oldParent) {
  this.driver.brickParentDidChange(this.brick_, oldParent)
}

/**
 * Schedule snapping to grid and bumping neighbours to occur after a brief
 * delay.
 */
eYo.Brick.UI.prototype.scheduleSnapAndBump = function() {
  // Ensure that any snap and bump are part of this move's event group.
  var group = eYo.Events.group
  setTimeout(() => {
    eYo.Events.group = group
    this.snapToGrid()
    eYo.Events.group = false
  }, eYo.Brick.UI.BUMP_DELAY / 2)
  setTimeout(() => {
    eYo.Events.group = group
    this.bumpNeighbours_()
    eYo.Events.group = false
  }, eYo.Brick.UI.BUMP_DELAY)
}

/**
 * Snap this block to the nearest grid point.
 */
eYo.Brick.UI.prototype.snapToGrid = function() {
  if (!this.board || this.board.dragging || this.parent || this.isInFlyout) {
    return
  }
  this.moveTo(this.xy, true)
}


/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 * @private
 */
eYo.Brick.UI.prototype.bumpNeighbours_ = function() {
  if (!this.board || this.board.dragging) {
    return;  // Don't bump blocks during a drag.
  }
  var root = this.brick_.root
  if (root.isInFlyout) {
    return
  }
  this.brick_.getMagnets_(false).forEach(magnet => {
    // Spider down from this block bumping all sub-blocks.
    if (magnet.target && magnet.isSuperior) {
      magnet.targetBrick.ui.bumpNeighbours_()
    }
    magnet.neighbours_(Blockly.SNAP_RADIUS).forEach(other => {
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
 * @param {Object} e in general a mouse down event
 * @return {Object|eYo.VOID|null}
 */
eYo.Brick.UI.prototype.getMagnetForEvent = function (e) {
  var brd = this.brick_.board
  if (!brd) {
    return
  }
  // if we clicked on a field, no connection returned
  if (eYo.app.motion.field) {
    return
  }
  var rect = this.boundingRect // in board coordinates
  var xy = brd.eventWhere(e).backward(rect.topLeft)
  var R
  var magnet = this.brick_.someInputMagnet(magnet => {
    if (!magnet.disabled_ && (!magnet.hidden_ || magnet.wrapped_)) {
      if (magnet.isInput) {
        var target = magnet.target
        if (target) {
          var targetM4t = target.brick.ui.getMagnetForEvent(e)
          if (targetM4t) {
            return targetM4t
          }
          R = new eYo.Rect(
            magnet.x + eYo.Unit.x / 2,
            magnet.y,
            target.width - eYo.Unit.x,
            target.height
          )
          if (xy.in(R)) {
            return magnet
          }
        }
        if (magnet.slot && magnet.slot.bindField) {
          R = new eYo.Rect(
            magnet.x,
            magnet.y + eYo.Padding.t,
            magnet.w * eYo.Unit.x,
            eYo.Font.height
          )
        } else if (magnet.optional_ || magnet.s7r_) {
          R = new eYo.Rect(
            magnet.x - eYo.Unit.x / 4,
            magnet.y + eYo.Padding.t,
            1.5 * eYo.Unit.x,
            eYo.Font.height
          )
        } else {
          R = new eYo.Rect(
            magnet.x + eYo.Unit.x / 4,
            magnet.y + eYo.Padding.t,
            (magnet.w - 1 / 2) * eYo.Unit.x,
            eYo.Font.height
          )
        }
        if (xy.in(R)) {
          return magnet
        }
      } else if (magnet.isFoot || magnet.isSuite) {
        R = new eYo.Rect(
          magnet.x,
          magnet.y - eYo.Style.Path.width,
          eYo.Span.tabWidth,
          1.5 * eYo.Padding.t + 2 * eYo.Style.Path.width
        )
        if (xy.in(R)) {
          return magnet
        }
      }
    }
  })
  if (magnet) {
    return magnet
  } else if ((magnet = this.brick_.head_m) && !magnet.hidden) {
    R = new eYo.Rect(
      magnet.x,
      magnet.y - 2 * eYo.Style.Path.width,
      rect.width,
      1.5 * eYo.Padding.t + 2 * eYo.Style.Path.width
    )
    if (xy.in(R)) {
      return magnet
    }
  }
  if ((magnet = this.brick_.foot_m) && !magnet.hidden) {
    if (rect.height > eYo.Unit.y) { // Not the cleanest design
      R = new eYo.Rect(
        magnet.x,
        magnet.y - 1.5 * eYo.Padding.b - eYo.Style.Path.width,
        eYo.Span.tabWidth + eYo.Style.Path.r, // R U sure?
        1.5 * eYo.Padding.b + 2 * eYo.Style.Path.width
      )
    } else {
      R = new eYo.Rect(
        magnet.x,
        magnet.y - 1.5 * eYo.Padding.b - eYo.Style.Path.width,
        rect.width,
        1.5 * eYo.Padding.b + 2 * eYo.Style.Path.width
      )
    }
    if (xy.in(R)) {
      return magnet
    }
  }
  if ((magnet = this.brick_.suite_m) && !magnet.hidden) {
    var r = eYo.Style.Path.Hilighted.width
    R = new eYo.Rect(
      magnet.x + eYo.Unit.x / 2 - r,
      magnet.y + r,
      2 * r,
      eYo.Unit.y - 2 * r // R U sure?
    )
    if (xy.in(R)) {
      return magnet
    }
  }
  if ((magnet = this.brick_.left_m) && !magnet.hidden) {
    var r = eYo.Style.Path.Hilighted.width
    R = new eYo.Rect(
      magnet.x + eYo.Unit.x / 2 - r,
      magnet.y + r,
      2 * r,
      eYo.Unit.y - 2 * r // R U sure?
    )
    if (xy.in(R)) {
      return magnet
    }
  }
  if ((magnet = this.brick_.right_m) && !magnet.hidden) {
    R = new eYo.Rect(
      magnet.x + eYo.Unit.x / 2 - r,
      magnet.y + r,
      2 * r,
      eYo.Unit.y - 2 * r // R U sure?
    )
    if (xy.in(R)) {
      return magnet
    }
  }
}

/**
 * Update the cursor over this block by adding or removing a class.
 * @param {boolean} enable True if the delete cursor should be shown, false
 *     otherwise.
 */
eYo.Brick.UI.prototype.setDeleteStyle = function(enable) {
  this.driver.brickSetDeleteStyle(this.brick_, enable)
}

/**
 * Handle a mousedown on an SVG brick.
 * If the brick is sealed to its parent, forwards to the parent.
 * This is used to prevent a dragging operation on a sealed brick.
 * However, this will manage the selection of an input connection.
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
 * @param {!Event} e Mouse down event or touch start event.
 * @private
 */
eYo.Brick.UI.prototype.on_mousedown = function (e) {
  var brick = this.brick_
  if (this.locked_) {
    var parent = brick.parent
    if (parent) {
      return
    }
  }
  if (brick.parentIsShort && !brick.hasFocus) {
    parent = brick.parent
    if (!parent.hasFocus) {
      eYo.app.motion.handleBrickStart(e, brick)
      return
    }
  }
  // unfortunately, the mouse events sometimes do not find there way to the proper brick
  var magnet = this.getMagnetForEvent(e)
  var t9k = magnet
  ? magnet.isInput
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
  t9k.ui.lastSelectedMagnet__ = eYo.Focus.magnet
  // Prepare the mouseUp event for an eventual connection selection
  t9k.ui.lastMouseDownEvent = t9k.hasFocus ? e : null
  eYo.app.motion.handleBrickStart(e, t9k)
}

/**
 * The selected connection is used to insert bricks with the keyboard.
 * When a connection is selected, one of the ancestor bricks is also selected.
 * Then, the higlighted path of the source bricks is not the outline of the brick
 * but the shape of the connection as it shows when bricks are moved close enough.
 */
eYo.Brick.UI.prototype.on_mouseup = function (e) {
  const magnet = this.getMagnetForEvent(e)
  var b3k
  var t9k = magnet
  ? magnet.isInput
    ? magnet.targetBrick || magnet.brick
    : magnet.brick
  : this.brick_
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
            eYo.Focus.magnet = null
          } else if (magnet !== t9k.ui.lastSelectedMagnet__) {
            if (magnet.isInput) {
              if (!magnet.targetBrick) {
                magnet.bindField && magnet.focusOn()
              }
            } else {
              magnet.focusOn()
            }
          } else {
            eYo.Focus.magnet = null
          }
        } else if (eYo.Focus.magnet) {
          eYo.Focus.magnet = null
        } else if (t9k.ui.selectMouseDownEvent) {
          // (this.hasFocus ? this : this.stmtParent) || t9k.root
          t9k.ui.selectMouseDownEvent = null
        }
      }
    }
  } else if ((b3k = eYo.app.focusMgr.brick) && (ee = b3k.ui.selectMouseDownEvent)) {
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
  eYo.app.didTouchBrick && (eYo.app.didTouchBrick(eYo.app.focusMgr.brick))
}

/**
 * Show the context menu for this brick.
 * @param {!Event} e Mouse event.
 * @private
 */
eYo.Brick.UI.prototype.showContextMenu_ = function (e) {
  // this part is copied as is from the parent's implementation. Is it relevant ?
  if (this.board.options.readOnly || !this.contextMenu) {
    return
  }
  eYo.MenuManager.shared().showMenu(this.brick_, e)
}

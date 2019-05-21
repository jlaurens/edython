/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.UI')

goog.require('eYo.Brick')

goog.forwardDeclare('eYo.Driver')
goog.forwardDeclare('eYo.Svg')

/**
 * Class for a Render.
 * For edython.
 * @param {!eYo.Brick} brick  brick is the owning object.
 * @readony
 * @property {eYo.Brick} brick - The brick owning the receiver.
 * @readony
 * @property {object} change - The change property of the receiver.
 * @readony
 * @property {object} reentrant_ - The reentrant_ property of the receiver.
 * @readony
 * @property {object} span - The span of the owning brick.
 * @readony
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
 * @readony
 * @property {boolean} hasLeftEdge  whether the owning brick has a left edge. When bricks are embedded, we might want to shorten things because the boundaries may add too much horizontal space.
 * @readonly
 * @property {boolean} hasRightEdge  whether the owning brick has a right edge.
 * @readonly
 * @property {Object}  xyInSurface  the coordinates relative to the surface.
 */
eYo.UI = function(brick) {
  this.brick_ = brick
  brick.ui_ = this
  this.down = this.up = false
  this.driver.brickInit(brick)
  this.updateBlockWrapped()
}

/**
 * The default implementation forwards to the driver.
 */
eYo.UI.prototype.dispose = function () {
  this.driver.brickDispose(this.brick_)
}

// computed properties
Object.defineProperties(eYo.UI.prototype, {
  brick: {
    get() {
      return this.brick_
    }
  },
  change: {
    get() {
      return this.brick_.change
    }
  },
  driver: {
    get() {
      return this.brick_.workspace.eyo.driver
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
      return this.rendered && (this.driver.brickHasSelect(this.brick_))
    }
  }
})

/**
 * Render the given connection, if relevant.
 * @param {eYo.Magnet} magnet
 * @param {*} recorder
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.UI.prototype.drawMagnet_ = function (magnet, recorder) {
  if (!magnet) {
    return
  }
  var t9k = magnet.targetBrick
  if (!t9k) {
    return
  }
  if (magnet.isSuperior) {
    magnet.tighten_()
  }
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
 * Render the next brick, if relevant.
 * @param {*} recorder
 * @return {boolean=} true if an rendering message was sent, false othrwise.
 */
eYo.UI.prototype.drawFoot_ = function (recorder) {
  return this.drawMagnet_(this.brick_.foot_m, recorder)
}

/**
 * Render the right brick, if relevant.
 * @param {*} io
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.UI.prototype.renderRight_ = function (io) {
  var m4t = this.brick_.right_m
  if (m4t) {
    var t9k = m4t.targetBrick
    if (t9k) {
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
          t9k.incrementChangeCount()
        }
        if (!ui.up) {
          t9k.render(false, io)
          if (!t9k.wrapped_) {
            io.common.field.shouldSeparate = false
            io.common.field.beforeIsSeparator = true
          }
        }
        io.cursor.c = m4t.where.c
      } catch(err) {
        console.error(err)
        throw err
      } finally {
        ui.down = false
        var span = t9k.span
        if (span.width) {
          io.cursor.advance(span.width, span.height - 1)
          // We just rendered a brick
          // it is potentially the rightmost object inside its parent.
          if (ui.hasRightEdge || io.common.shouldPack) {
            io.common.ending.push(t9k)
            t9k.ui.rightCaret = undefined
            io.common.field.shouldSeparate = false
          }
          io.common.field.beforeIsCaret = false
        }
      }
      return true
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
eYo.UI.prototype.renderSuite_ = function (io) {
  var m4t = this.brick_.suite_m
  if (!m4t) {
    return
  }
  if (eYo.Brick.debugStartTrackingRender) {
    console.log(eYo.Brick.debugPrefix, 'SUITE')
  }
  m4t.setOffset(eYo.Span.INDENT, this.brick_.span.l)
  var t9k = m4t.targetBrick
  if (t9k) {
    this.someTargetIsMissing = false
    var ui = t9k.ui
    if (ui.canDraw) {
      m4t.tighten_()
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
    }
  }
  this.span.main = this.brick_.getStatementCount()
  return true
}

/**
 * Render the brick.
 * Lays out and reflows a brick based on its contents and settings.
 * Rendering is complicated considering the possibility of both line continuation and multi line strings.
 * @param {*} recorder
 * @param {boolean=} optBubble If false, just render this.brick_ brick.
 *   If true, also render brick's parent, grandparent, etc.  Defaults to true.
 */
// deleted bricks are rendered during deletion
// this.brick_ should be avoided
eYo.UI.prototype.render = (() => {
  // this is a closure
  /**
   * Render the parent brick, if relevant.
   * @param {Object} recorder  A recorder object.
   * @param {boolean=} optBubble If false, just render this.brick_ brick.
   *   If true, also render brick's parent, grandparent, etc.  Defaults to true.
   * @return {boolean=} true if an rendering message was sent, false otherwise.
   */
  var drawParent = function (recorder, optBubble) {
    // `this.brick_` is a brick delegate
    if (optBubble === false || this.down) {
      return
    }
    // Render all bricks above this.brick_ one (propagate a reflow).
    // Only when the render message did not come from above!
    var parent = this.brick_.parent
    if (parent) {
      var justConnected = eYo.Magnet.connectedParent && this.brick_.out_m === eYo.Magnet.connectedParent.target
      if (!parent.ui.down) {
        try {
          parent.ui.up = true
          var old = this.up
          this.up = true
          if (eYo.UI.debugStartTrackingRender) {
            console.log(eYo.UI.debugPrefix, 'UP')
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
              if (eYo.UI.debugStartTrackingRender) {
                console.log(eYo.UI.debugPrefix, 'UP')
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
      // Top-most brick.  Fire an event to allow scrollbars to resize.
      this.brick_.workspace.resizeContents()
    }
  }
  var longRender = eYo.Decorate.reentrant_method(
    'longRender',
    function (optBubble, recorder) {
      if (eYo.UI.debugStartTrackingRender) {
        var n = eYo.UI.debugCount[brick.id]
        eYo.UI.debugCount[brick.id] = (n||0)+1
        if (!eYo.UI.debugPrefix.length) {
          console.log('>>>>>>>>>>')
        }
        eYo.UI.debugPrefix = eYo.UI.debugPrefix + '.'
        console.log(eYo.UI.debugPrefix, brick.type, n, brick.id)
        if (n > 1) {
          n = n + 0
        }
      }
      try {
        this.brick_.span.resetC()
        this.brick_.consolidate()
        this.willRender_(recorder)
        var io = this.draw_(recorder)
        this.layoutMagnets_(io)
        this.drawFoot_(io)
        this.renderMove_(io)
        this.updateShape()
        drawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
        this.didRender_(io)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        if (eYo.UI.debugStartTrackingRender &&  eYo.UI.debugPrefix.length) {
          eYo.UI.debugPrefix = eYo.UI.debugPrefix.substring(1)
        }
      }
    }
  )
  return function (optBubble, recorder) {
    if (!this.brick_.isReady || this.rendered === false) { // this.rendered === undefined is OK
      return
    }
    if (!this.brick_.isEditing && (this.brick_.isDragging_ || this.brick_.change.level || !this.brick_.workspace)) {
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
        drawParent.call(this, io, optBubble) || this.alignRightEdges_(io) // will they have a parent meanwhile?
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
        drawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
        return
      } else if (eYo.Magnet.connectedParent) {
        if (this.brick_.head_m && eYo.Magnet.connectedParent === this.brick_.head_m.target) {
          var io = this.willShortRender_(recorder)
          this.layoutMagnets_(io)
          this.drawFoot_(io)
          this.renderMove_(io)
          this.updateShape()
          this.brick_.change.save.render = this.brick_.change.count
          drawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
        } else if (this.brick_.foot_m && eYo.Magnet.connectedParent === this.brick_.foot_m) {
          var io = this.willShortRender_(recorder)
          this.layoutMagnets_(io)
          this.drawFoot_(io)
          this.renderMove_(io)
          this.updateShape()
          this.brick_.change.save.render = this.brick_.change.count
          drawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
        } else if (this.brick_.suite_m && eYo.Magnet.connectedParent === this.brick_.suite_m) {
          var io = this.willShortRender_(recorder)
          this.layoutMagnets_(io)
          this.drawFoot_(io)
          this.renderMove_(io)
          this.updateShape()
          this.brick_.change.save.render = this.brick_.change.count
          drawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
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
        recorder && (recorder.field.last = undefined)
        if (!parent.ui.down) {
          if (eYo.Magnet.connectedParent && eYo.Magnet.connectedParent.brick === this.brick_) {
            try {
              parent.ui.up = true
              parent.render(optBubble, recorder)
            } catch (err) {
              console.error(err)
              throw err
            } finally {
              parent.ui.up = false
            }
          } else {
            parent.render(optBubble, recorder)
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
      drawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
      return
    }
    longRender.call(this, optBubble, recorder)
    this.brick_.change.save.render = this.brick_.change.count
  }
}) ()

/**
 * Will draw the brick, short version.
 * The print statement needs some preparation before drawing.
 * @param {*} recorder
 * @private
 */
eYo.UI.prototype.willShortRender_ = function (recorder) {
  return this.newDrawRecorder_(recorder)
}

/**
 * Translates the brick, forwards to the ui driver.
 * @param {number} x The x coordinate of the translation in workspace units.
 * @param {number} y The y coordinate of the translation in workspace units.
 */
eYo.UI.prototype.translate = function(x, y) {
  this.driver.brickTranslate(this.brick_, x, y)
}

/**
 * Will draw the brick. forwards to the driver.
 * @param {*} recorder
 * @private
 */
eYo.UI.prototype.willRender_ = function (recorder) {
  this.driver.brickWillRender(this.brick_, recorder)
}

/**
 * Did draw the brick. Default implementation does nothing.
 * @param {*} recorder
 * @private
 */
eYo.UI.prototype.didRender_ = function (recorder) {
  this.driver.brickDidRender(this.brick_, recorder)
}

/**
 * Update all of the connections on this.brick_ with the new locations calculated
 * in renderCompute.  Also move all of the connected bricks based on the new
 * connection locations.
 * @private
 */
eYo.UI.prototype.renderMoveMagnets_ = function() {
  var blockTL = this.xyInSurface;
  // Don't tighten previous or output connections because they are inferior
  // connections.
  var m5s = this.brick_.magnets
  var m4t
  if ((m4t = m5s.left)) {
    m4t.moveToOffset(blockTL)
  }
  if ((m4t = m5s.head)) {
    m4t.moveToOffset(blockTL)
  }
  if ((m4t = m5s.out)) {
    m4t.moveToOffset(blockTL)
  }
  this.brick_.inputList.forEach(input => {
    if ((m4t = input.magnet)) {
      m4t.moveToOffset(blockTL)
      if (m4t.target) {
        m4t.tighten_()
      }
    }
  })
  if ((m4t = m5s.foot)) {
    m4t.moveToOffset(blockTL)
    if (m4t.target) {
      m4t.tighten_()
    }
  }
}

/**
 * Layout brick magnets.
 * @param {*} recorder
 * @private
 */
eYo.UI.prototype.renderMove_ = function (recorder) {
  this.renderMoveMagnets_()
  // var blockTL = this.xyInSurface
  // this.brick_.forEachSlot((slot) => {
  //   var m4t = input.magnet
  //   if (m4t) {
  //     m4t.moveToOffset(blockTL)
  //     m4t.tighten_()
  //   }
  // })
}

/**
 * Layout previous, next and output brick connections.
 * @param {*} recorder
 * @private
 */
eYo.UI.prototype.layoutMagnets_ = function (recorder) {
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
eYo.UI.prototype.draw_ = function (recorder) {
  if (this.driver.brickCanDraw(this.brick_)) {
    // if the above path does not exist
    // the brick is not yet ready for rendering
    // when defined, `recorder` comes from
    // the parent's `drawValueInput_` method.
    var io = this.drawModelBegin_(recorder)
    try {
      this.drawModel_(io)
    } catch (err) {
      console.error (err)
      throw err
    } finally {
      this.renderRight_(io) || this.renderSuite_(io)
      this.brick_.height = this.span.height
      this.updateShape()
    }
  }
}

/**
 * Align the right edges by changing the width of all the connected statement bricks. For each line, only the last statement
 * of the line is extended.
 * Only for root bricks.
 * @param {*} recorder
 * @protected
 */
eYo.UI.prototype.alignRightEdges_ = eYo.Decorate.onChangeCount(
  'alignRightEdges_',
  function (recorder) {
    if (this.brick_.parent || !this.brick_.isStmt || !this.rendered || !this.brick_.workspace || !this.brick_.isReady) {
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
          b.updateShape()
        }
      })
    }
  }
)

/**
 * Get a new draw recorder.
 * @param {*} recorder
 * @private
 */
eYo.UI.prototype.newDrawRecorder_ = function (recorder) {
  var io = {
    brick: this.brick_,
    steps: [],
    n: 0, // count of rendered objects (fields, slots and inputs)
    cursor: new eYo.Where(),
    forc: undefined // rendered file or connection
  }
  this.brick_.firstRenderedInput = this.brick_.lastRenderedInput = undefined
  if (recorder) {
    // io inherits some values from the given recorder
    io.recorder = recorder
    io.common = recorder.common // It is always defined
  } else {
    io.common = {
      pending: undefined,
      ending: [],
      shouldSeparate: false,
      beforeIsRightEdge: false,
      shouldPack: false,
      startOfStatement: false,
      startOfLine: !this.brick_.out_m || !this.brick_.parent, // statement | orphan brick
      field: {
        beforeIsBlack: false, // true if the position before the cursor contains a black character
        beforeIsSeparator: false, // true if the position before the cursor contains a mandatory white character
        beforeIsCaret: false, // true if the position before the cursor contains a caret
        shouldSeparate: false // and other properties...
      }
    }
  }
  return io
}

/**
 * Prepare rendering.
 * @param {?Object} recorder  When null, this.brick_ is not the start of a statement
 * @return {!Object} a local recorder
 * @private
 */
eYo.UI.prototype.drawModelBegin_ = function (recorder) {
  this.parentIsShort = false
  this.isShort = false
  this.someTargetIsMissing = false
  // we define the `io` named recorder which is specific to this.brick_.
  var io = this.newDrawRecorder_(recorder)
  // A "star like" field's text is one of '*', '+', '-', '~'...
  // This field is the very first of the brick.
  // Once we have rendered a field with a positive length,
  // we cannot have a star like field.
  io.common.field.canStarLike = true
  // By default, we restart from scratch,
  // set the size to 0 for the width and 1 for the height
  this.brick_.span.resetC()
  // And reset properties
  this.mayBeLast = false
  this.isLastInExpression = false
  this.isLastInStatement = false
  // Do we need some room for the left side of the brick?
  // no for wrapped bricks
  if (!this.brick_.wrapped_) {
    if (!this.brick_.out_m || !this.brick_.locked_ || !recorder) {
      // statement or unlocked,
      // one space for the left edge of the brick
      // (even for locked statements, this.brick_ is to avoid a
      // display shift when locking/unlocking)
      this.span.c = 1
      io.common.field.beforeIsBlack = false
    }
  }
  if (this.hasLeftEdge || !recorder || !this.brick_.out_m) {
    // statement or unlocked,
    // one space for the left edge of the brick
    // (even for locked statements, this.brick_ is to avoid a
    // display shift when locking/unlocking)
    this.span.c = 1
    io.common.field.beforeIsBlack = false
    io.common.field.beforeIsSeparator = true
    io.common.field.shouldSeparate = false
    // Do not change io.common.field.shouldSeparate ?
  }
  io.cursor.c = this.span.c
  if (this.brick_.out_m) {
    this.startOfStatement = io.common.startOfStatement
    this.startOfLine = io.common.startOfLine
  } else {
    this.startOfStatement = io.common.startOfStatement = true
    this.drawSharp_(io)
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
eYo.UI.prototype.drawModel_ = function (io) {
  this.fieldDrawFrom_(this.brick_.fieldAtStart, io)
  if ((io.slot = this.brick_.slotAtHead)) {
    do {
      this.drawSlot_(io)
    } while ((io.slot = io.slot.next))
  } else {
    // for dynamic lists
    this.brick_.inputList.forEach(input => {
      goog.asserts.assert(input, `Input with no eyo ${input.name} in brick ${this.brick_.type}`)
      if (input.visible) {
        io.input = input
        this.drawInput_(io)
      } else {
        input.fieldRow.forEach(field => {
          this.driver.fieldDisplayedSet(field, false)
        })
        var x = input.magnet
        x && (x = x.targetBrick) && x.ui.hide()
      }
    })
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
eYo.UI.prototype.drawModelEnd_ = function (io) {
  // and now some space for the right edge, if any
  if (!this.brick_.wrapped_) {
    if (this.brick_.out_m) {
      if (io.common.field.last && io.common.field.last.isEditing) {
        io.cursor.c += 1
        io.common.field.beforeIsSeparator = false
        io.common.field.beforeIsBlack = false
      } else if (!io.recorder || io.common.field.didPack) {
        io.cursor.c += 1
        io.common.field.beforeIsSeparator = io.common.field.shouldSeparate
        io.common.field.shouldSeparate = false
        io.common.field.beforeIsBlack = false
      } else if (io.common.field.shouldSeparate) {
        if (!io.recorder) {
          io.cursor.c += 1
          io.common.field.beforeIsSeparator = io.common.field.shouldSeparate
          io.common.field.shouldSeparate = false
          io.common.field.beforeIsBlack = false
        } else if (!this.brick_.locked_ && !io.common.ending.length) {
          io.cursor.c += 1
          io.common.field.beforeIsSeparator = io.common.field.shouldSeparate
          io.common.field.shouldSeparate = false
          io.common.field.beforeIsBlack = false
        }
      } else {
        io.cursor.c += 1
        io.common.field.beforeIsSeparator = io.common.field.shouldSeparate
        io.common.field.shouldSeparate = false
        io.common.field.beforeIsBlack = false
      }
    } else {
      io.cursor.c += 1
      io.common.field.beforeIsSeparator = false
      io.common.field.beforeIsBlack = false
    }
  }
  if (!this.brick_.out_m) {
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
  io.cursor.c = Math.max(io.cursor.c, this.minBrickW)
  this.brick_.span.reset(io.cursor)
  this.brick_.span.minWidth = this.brick_.width = Math.max(this.brick_.width, this.brick_.span.width)
  if (io.recorder) {
    // We ended a brick. The right edge is generally a separator.
    // No need to add a separator if the brick is wrapped or locked
    io.common.field.shouldSeparate && (io.common.field.shouldSeparate = !this.hasRightEdge)
    // if the brick is wrapped or locked, there won't be any
    // right edge where a caret could be placed.
    // But may be we just rendered bricks in cascade such that
    // there might be some right edge already.
  }
  if (io.brick === this.brick_) {
    this.brick_.lastRenderedInput = io.common.inputDone
  }
}

/**
 * Render the slot given in io parameter.
 * @param io
 * @private
 */
eYo.UI.prototype.drawSlot_ = function (io) {
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
    io.cursor.advance(slot.where)
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
eYo.UI.prototype.drawSharp_ = function (io) {
  if (this.brick_.isControl) { // Not very clean, used as hook before rendering the comment fields.
    io.cursor.c += 4
  } else if (this.brick_.isStmt) {
    this.driver.brickDrawSharp(this.brick_, io.brick.disabled)
    if (io.brick.disabled) {
      io.cursor.c += 2
      io.common.startOfLine = io.common.startOfStatement = false
    }
  }
}

/**
 * Render one input of value brick.
 * @param io
 * @private
 */
eYo.UI.prototype.drawInput_ = function (io) {
  return this.drawValueInput_(io)
}

/**
 * Render the given field, when defined.
 *
 * @param {!Object} field A field.
 * @param {!Object} io An input/output recorder.
 * @private
 */
eYo.UI.prototype.drawField_ = function (field, io) {
  var c = io.cursor.c
  field.ui_driver.fieldDisplayedUpdate(field)
  if (field.visible) {
    // Actually, io.cursor points to the location where the field
    // is expected. It is relative to the enclosing `SVG` group,
    // which is either a brick or a slot.
    // If there is a pending caret, draw it and advance the cursor.
    io.form = field
    field.willRender()
    this.driver.fieldTextRemove(field)
    var text = field.displayText
    // Replace the text.
    field.size.set(text.length, 1)
    if (text.length) {
      if (text === '>') {
        console.error(io)
      }
      this.drawEnding_(io)
      this.drawPending_(io)
      io.common.startOfLine = io.common.startOfStatement = false
      ++ io.n
      this.driver.fieldTextCreate(field)
      var head = text[0]
      var tail = text[text.length - 1]
      if (field.model.literal) {
        io.common.field.didPack = 0
      } else if (field.isLabel && io.common.field.beforeIsBlack) {
        io.cursor.c += 1
        io.common.field.beforeIsBlack = true
      } else {
        if (!io.common.field.shouldSeparate
          && !io.common.field.beforeIsSeparator
          && !io.common.field.beforeIsBlack
          && !io.common.startOfLine
          && !io.common.field.beforeIsCaret) {
          if (this.brick_.packedQuotes && (head === "'" || head === '"')) {
            io.cursor.c -= 1
          } else if (this.brick_.packedBrackets && head === "[") {
            io.cursor.c -= 1
          } else if (this.brick_.packedBraces && head === "{") {
            io.cursor.c -= 1
          } else if (this.brick_.packedParenthesis && head === "(") {
            io.cursor.c -= 1
          }
        } else if (head === '.' && !io.common.field.beforeIsBlack) {
          io.cursor.c -= 1
        } else if (io.common.field.beforeIsBlack
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
      io.common.field.beforeIsBlack = !eYo.XRE.white_space.test(tail)
      io.common.field.beforeIsCaret = false
      // place the field at the right position:
      this.driver.fieldPositionSet(field, io.cursor)
      // then advance the cursor after the field.
      if (field.size.w) {
        io.cursor.c += field.size.w
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
      io.common.field.beforeIsBlack = false
    }
    io.common.field.last = field
    io.common.beforeIsRightEdge = false
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
eYo.UI.prototype.fieldDrawFrom_ = function (field, io) {
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
eYo.UI.prototype.drawFields_ = function (io, only_prefix) {
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
eYo.UI.prototype.drawEnding_ = function (io, isLast = false, inStatement = false) {
  if (io) {
    var isLastInExpression = isLast && !inStatement
    var isLastInStatement = isLast && inStatement
    if (io.common.ending.length) {
      // should we shrink after a quote or a bracket?
      if (io.common.shouldPack && (!isLast || io.common.shouldPack.wrapped_)) {
        // first loop to see if there is a pending rightCaret
        // BTW, there can be an only one right caret
        if (io.common.ending.some(b3k => !!b3k.ui.rightCaret)) {
          io.common.shouldPack = undefined
        } else {
          // there is no following right caret, we can pack
          var pack = false
          io.common.ending.forEach(b3k => {
            if (b3k === io.common.shouldPack) {
              io.common.shouldPack = undefined
              pack = true
              io.cursor.c -= 1
              // from now on, we pack just one character width
            }
            if (pack) {
              b3k.span.c = Math.max(this.minBrickW, b3k.span.c - 1)
              b3k.span.minWidth = b3k.span.width
              io.common.field.didPack = true
              io.common.field.beforeIsBlack = true
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
          m4t.side = eYo.Key.RIGHT
          m4t.shape = eYo.Key.NONE
          m4t.isLastInStatement = isLastInStatement
          var d = eYo.Shape.definitionWithMagnet(m4t) // depends on the shape and the side
          var brick = m4t.brick
          if (io.brick === brick) {
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
eYo.UI.prototype.drawPending_ = function (io, side = eYo.Key.NONE, shape = eYo.Key.NONE) {
  if (io) {
    var m4t = io.common.pending
    if (m4t) {
      m4t.side = side
      m4t.shape = io.isLastInStatement ? eYo.Key.Right : shape
      var shp = eYo.Shape.newWithMagnet(m4t)
      var brick = m4t.brick
      if (io.brick === brick) {
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
          io.cursor.advance(shp.width)
          io.common.startOfLine = io.common.startOfStatement = false
        }
        // a space was added as a visual separator anyway
        io.common.field.shouldSeparate = false
        // all done
        io.common.pending = undefined
        io.common.field.beforeIsBlack = false // do not step back
        io.common.field.beforeIsCaret = true // do not step back
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
eYo.UI.prototype.drawInputMagnet_ = function (io) {
  var m4t = io.magnet
  ++ io.n
  m4t.startOfLine = io.common.startOfLine
  m4t.startOfStatement = io.common.startOfStatement
  io.form = m4t
  m4t.side = m4t.shape = undefined
  io.common.field.canStarLike = false
  // io.cursor is relative to the brick or the slot
  // but the connection must be located relative to the brick
  // the connection delegate will take care of that because it knows
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
      io.common.field.beforeIsCaret = false
    }
    var ui = t9k.ui
    if (ui) {
      try {
        ui.startOfLine = io.common.startOfLine
        ui.startOfStatement = io.common.startOfStatement
        ui.mayBeLast = ui.hasRightEdge
        ui.down = true
        if (eYo.UI.debugStartTrackingRender) {
          console.log(eYo.UI.debugPrefix, 'DOWN')
        }
        if (t9k.wrapped_) {
          // force target rendering
          t9k.incrementChangeCount()
        }
        m4t.setOffset(io.cursor)
        if (m4t.c === 1 && !io.common.field.beforeIsBlack && m4t.slot) {
          m4t.slot.where.c -= 1
          m4t.setOffset(io.cursor)
          if (io.input && io.input.inputLeft && io.input.inputLeft.magnet.startOfLine) {
            ui.startOfLine = ui.startOfStatement = io.common.startOfLine = io.common.startOfStatement = true

          }
        }
        if (io.brick.out_m !== eYo.Magnet.disconnectedChild && !ui.up) {
          t9k.render(false, io)
          if (!t9k.wrapped_) {
            io.common.field.shouldSeparate = false
            io.common.field.beforeIsSeparator = true
          }
        }
      } catch(err) {
         console.error(err)
         throw err
      } finally {
        ui.down = false
        var span = t9k.span
        if (span.w) {
          io.cursor.advance(span.w, span.h - 1)
          // We just rendered a brick
          // it is potentially the rightmost object inside its parent.
          if (ui.hasRightEdge || io.common.shouldPack) {
            io.common.ending.push(t9k)
            ui.rightCaret = undefined
            io.common.field.shouldSeparate = false
          }
          io.common.field.beforeIsCaret = false
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
      io.common.field.beforeIsCaret = false
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
            m4t.isAfterRightEdge = io.beforeIsRightEdge
            io.common.field.beforeIsCaret = true
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
          io.common.field.beforeIsSeparator = io.common.field.shouldSeparate
          io.common.field.shouldSeparate = false
        }
        io.common.beforeIsRightEdge = true
      }
    }
  }
}

/**
 * Render the fields of a value input, if relevant.
 * @param {!Object} io the input/output argument.
 * @private
 */
eYo.UI.prototype.drawValueInput_ = function (io) {
  // this.brick_ is one of the reasons why we allways render from the start of a statement
  io.input.inputRight = undefined
  io.input.inputLeft = io.common.inputDone
  if (io.common.inputDone) {
    io.common.inputDone.inputRight = io.input
  } else {
    io.brick.firstRenderedInput = io.input
  }
  io.common.inputDone = io.input
  this.drawFields_(io, true)
  if ((io.magnet = io.input.magnet)) {
    this.drawInputMagnet_(io)
  }
  this.drawFields_(io, false)
  return true
}

/**
 * Update the shape of the brick.
 * Forwards to the driver.
 * @protected
 */
eYo.UI.prototype.updateShape = function () {
  this.driver.brickUpdateShape(this.brick_)
}

/**
 * Hide the brick.
 * Forwards to the driver.
 */
eYo.UI.prototype.hide = function () {
  this.driver.brickDisplayedSet(this.brick_, false)
}

/**
 * The default implementation forwards to the driver.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.UI.prototype.parentWillChange = function (newParent) {
  this.driver.brickParentWillChange(this.brick_, newParent)
}

/**
 * The default implementation forwards to the driver.
 * @param {!Blockly.Block} oldParent replaced.
 */
eYo.UI.prototype.parentDidChange = function (oldParent) {
  this.driver.brickParentDidChange(this.brick_, oldParent)
}

Object.defineProperties(eYo.UI.prototype, {
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
  }
})

/**
 * The default implementation forwards to the driver.
 */
eYo.UI.prototype.updateDisabled = function () {
  this.driver.brickUpdateDisabled(this.brick_)
  this.brick_.getChildren().forEach(child => child.ui.updateDisabled())
}

/**
 * The default implementation forwards to the driver.
 */
eYo.UI.prototype.connectEffect = function () {
  var w = this.brick_.workspace
  w.getAudioManager().play('click')
  if (w.scale < 1) {
    return // Too small to care about visual effects.
  }
  this.driver.brickConnectEffect(this.brick_)
}

/**
 * The default implementation forwards to the driver.
 * This must take place while the brick is still in a consistent state.
 */
eYo.UI.prototype.disposeEffect = function () {
  this.brick_.workspace.getAudioManager().play('delete');
  this.driver.brickDisposeEffect(this.brick_)
}

/**
 * Show the given menu.
 * The default implementation forwards to the driver.
 * @param {*} menu
 */
eYo.UI.prototype.showMenu = function (menu) {
  this.driver.brickMenuShow(this.brick_, menu)
}

/**
 * Make the given brick wrapped.
 * The default implementation forwards to the driver.
 */
eYo.UI.prototype.updateBlockWrapped = function () {
  this.driver.brickUpdateWrapped(this.brick_)
}

/**
 * The default implementation forwards to the driver.
 */
eYo.UI.prototype.sendToFront = function () {
  this.driver.brickSendToFront(this.brick_)
}

/**
 * The default implementation forwards to the driver.
 */
eYo.UI.prototype.sendToBack = function () {
  this.driver.brickSendToFront(this.brick_)
}

/**
 * Set the offset of the receiver's brick.
 * NOT YET USED. OVERRIDEN BELOW.
 * For edython.
 * @param {*} dc
 * @param {*} dl
 * @return {boolean}
 */
eYo.UI.prototype.setOffset = function (dc, dl) {
  // Workspace coordinates.
  if (!this.driver.brickCanDraw(this.brick_)) {
    throw `brick is not inited ${this.brick_.type}`
  }
  var dx = dc * eYo.Unit.x
  var dy = dl * eYo.Unit.y
  this.driver.brickSetOffset(this.brick_, dx, dy)
  this.moveMagnets_(dx, dy)
}

/**
 * Set the offset of the receiver's brick.
 * For edython.
 * @param {*} dx
 * @param {*} dy
 * @return {boolean}
 */
eYo.UI.prototype.setOffset = function (dx, dy) {
  if (!this.driver.brickCanDraw(this.brick_)) {
    throw `brick is not inited ${this.brick_.type}`
  }
  this.driver.brickSetOffset(this.brick_, dx, dy)
}

/**
 * Move the magnets to follow a translation of the brick.
 * @param {Number} dx
 * @param {Number} dy
 * @private
 */
eYo.UI.prototype.moveMagnets_ = function (dx, dy) {
  if (!this.rendered) {
    // Rendering is required to lay out the blocks.
    // This is probably an invisible block attached to a collapsed block.
    return;
  }
  this.brick_.forEachMagnet(m4t => m4t.moveBy(dx, dy))
  this.childBlocks_.forEach(b3k => b3k.moveMagnets_(dx, dy))
}

//////////////////

/**
 * Add the hilight path_.
 * Forwards to the driver.
 */
eYo.UI.prototype.addBlockHilight_ = function () {
  this.driver.brickHilightAdd(this.brick_)
}

/**
 * Remove the hilight path.
 * Forwards to the driver.
 */
eYo.UI.prototype.removeBlockHilight_ =function () {
  this.driver.brickHilightRemove(this.brick_)
}

/**
 * Add the select path.
 * Forwards to the driver.
 */
eYo.UI.prototype.addSelect = function () {
  this.driver.brickSelectAdd(this.brick_)
}

/**
 * Remove the select path.
 * Forwards to the driver.
 */
eYo.UI.prototype.removeSelect = function () {
  this.driver.brickSelectRemove(this.brick_)
}

/**
 * Add the hilight connection path_.
 * Forwards to the driver.
 */
eYo.UI.prototype.addMagnet_ = function () {
  this.driver.brickMagnetAdd(this.brick_)
}

/**
 * Remove the select path.
 * Forwards to the driver.
 */
eYo.UI.prototype.removeMagnet_ = function () {
  this.driver.brickMagnetRemove(this.brick_)
}

/**
 * Forwards to the driver.
 */
eYo.UI.prototype.addStatusTop_ = function () {
  this.driver.brickStatusTopAdd(this.brick_)
}


/**
 * Remove the `top` status.
 * Forwards to the driver.
 */
eYo.UI.prototype.removeStatusTop_ = function (eyo) {
  this.driver.brickStatusTopRemove(this.brick_)
}

/**
 * Forwards to the driver and `addSelect` to each field.
 */
eYo.UI.prototype.addStatusSelect_ = function () {
  this.driver.brickStatusSelectAdd(this.brick_)
  this.brick_.forEachInput(input => {
    input.fieldRow.forEach(field => {
      if (goog.isFunction(field.addSelect)) {
        field.addSelect()
      }
    })
  })
}

/**
 * Reverse `addStatusSelect_`. Forwards to the driver and various fields.
 */
eYo.UI.prototype.removeStatusSelect_ = function () {
  this.driver.brickStatusSelectRemove(this.brick_)
  this.brick_.forEachInput(input => {
    input.fieldRow.forEach(field => {
      goog.isFunction(field.removeSelect) && field.removeSelect()
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
eYo.UI.prototype.didConnect = function (m4t, oldTargetM4t, targetOldM4t) {
  if (m4t.isOutput) {
    m4t.brick.ui.removeStatusTop_()
  }
}

/**
 * Converse of the preceeding.
 * @param {!eYo.Magnet} m4t what has been connected in the brick
 * @param {!eYo.Magnet} oldTargetM4t what was previously connected in the brick
 */
eYo.UI.prototype.didDisconnect = function (m4t, oldTargetM4t) {
  if (m4t.isOutput) {
    m4t.brick.ui.addStatusTop_()
  }
}

/**
 * Return the coordinates of the top-left corner of this.brick_ relative to the
 * drawing surface's origin (0,0), in workspace units.
 * If the brick is on the workspace, (0, 0) is the origin of the workspace
 * coordinate system.
 * This does not change with workspace scale.
 * @return {!goog.math.Coordinate} Object with .x and .y properties in
 *     workspace coordinates.
 */
Object.defineProperties(eYo.UI.prototype, {
  xyInSurface: {
    get () {
      return this.driver.brickXYInSurface(this.brick_)
    }
  },
  /**
   * Returns a bounding box describing the dimensions of this.brick_
   * and any bricks stacked below it, in workspace unit.
   * @return {!{height: number, minWidth: number, width: number}} Object with height and width
   *    properties in workspace units.
   */
  size: {
    get () {
      var s = this.brick_.size
      return {
        height: s.height * eYo.Unit.y,
        minWidth: s.minWidth * eYo.Unit.x,
        width: s.width * eYo.Unit.x
      }
    }
  },
  /**
   * Returns the coordinates of a bounding rect describing the dimensions of the brick.
   * Ignores the minWidth.
   * As the shape is not the same comparing to Blockly's default,
   * the bounding rect changes too.
   * Coordinate system: workspace coordinates.
   * @return {!goog.math.Rect}
   *    Object with top left and bottom right coordinates of the bounding box.
   */
  boundingRect: {
    get () {
      return goog.math.Rect.createFromPositionAndSize(
        this.xyInSurface,
        this.size
      )
    }
  },
  /**
   * Returns the coordinates of a bounding box describing the dimensions of this
   * brick.
   * As the shape is not the same comparing to Blockly's default,
   * the bounding box changes too.
   * Coordinate system: workspace coordinates.
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
eYo.UI.prototype.magnetHilight = function (c_eyo) {
  this.driver.magnetHilight(c_eyo)
}

/**
 * Move the bricks relatively.
 * @param {number} dx Horizontal offset in workspace units.
 * @param {number} dy Vertical offset in workspace units.
 */
eYo.UI.prototype.moveByXY = function (dx, dy) {
  this.brick_.moveBy(dx, dy)
}

/**
 * Move this.brick_ during a drag, taking into account whether we are using a
 * drag surface to translate bricks.
 * this.brick_ must be a top-level brick.
 * @param {!goog.math.Coordinate} newLoc The location to translate to, in
 *     workspace coordinates.
 * @package
 */
eYo.UI.prototype.moveDuringDrag = function(newLoc) {
  var d = this.getDistanceFromVisible(newLoc)
  if (d) {
    newLoc.x -= d.x
    newLoc.y -= d.y
  }
  var b3k = this.brick_
  if (b3k.useDragSurface_) {
    this.workspace.blockDragSurface_.translateSurface(newLoc.x, newLoc.y);
  } else {
    this.driver.brickSetOffsetDuringDrag(b3k, newLoc.x, newLoc.y)
  }
}

/**
 * Recursively adds or removes the dragging class to this owning brick and its children.
 * Store `adding` in a property of the delegate.
 * @param {boolean} adding True if adding, false if removing.
 * @package
 */
eYo.UI.prototype.setDragging = function(adding) {
  this.isDragging_ = adding
  this.driver.brickSetDragging(this.brick_, adding)
}

/**
 * Move this block to its workspace's drag surface, accounting for positioning.
 * Generally should be called at the same time as setDragging_(true).
 * Does nothing if useDragSurface_ is false.
 * @private
 */
eYo.UI.prototype.moveToDragSurface_ = function() {
  if (!this.useDragSurface_) {
    return;
  }
  this.driver.brickMoveToDragSurface_(this.brick_)
}

/**
 * Get the position of receiver's brick relative to
 * the visible area.
 * Return value: if `x < 0`, left of the visible area,
 * if `x > 0`, right of the visible area, 0 otherwise.
 * undefined when the brick is not in a workspace.
 * The same holds for `y`.
 * The values are the signed distances between the center
 * of the brick and the visible area.
 * If the answer is `{x: -15, y: 0}`, we just have to scroll the workspace
 * 15 units to the right and the brick is visible.
 * For edython.
 * @param {?Object} newLoc The new location of the receiver, the actual location when undefined.
 * @return {{x: number, y: number}|undefined}
 */
eYo.UI.prototype.getDistanceFromVisible = function (newLoc) {
  var workspace = this.brick_.workspace
  if (!workspace) {
    return undefined
  }
  // is the brick in the visible area ?
  var metrics = workspace.getMetrics()
  if (!metrics) {
    // sometimes undefined is returned
    console.error("UNDEFINED METRICS, BREAK HERE TO DEBUG")
    return {
      x: 0,
      y: 0
    }
  }
  var scale = workspace.scale || 1
  var HW = this.brick_.height_width
  // the brick is in the visible area if we see its center
  var leftBound = metrics.viewLeft / scale - HW.width / 2
  var topBound = metrics.viewTop / scale - HW.height / 2
  var rightBound = (metrics.viewLeft + metrics.viewWidth) / scale - HW.width / 2
  var downBound = (metrics.viewTop + metrics.viewHeight) / scale - HW.height / 2
  var xy = newLoc || this.xyInSurface
  return {
    x: xy.x < leftBound? xy.x - leftBound: (xy.x > rightBound? xy.x - rightBound: 0),
    y: xy.y < topBound? xy.y - topBound: (xy.y > downBound? xy.y - downBound: 0),
  }
}

/**
 * Move the brick to the top level.
 */
eYo.UI.prototype.setParent = function (parent) {
  this.driver.brickSetParent(this, parent)
}


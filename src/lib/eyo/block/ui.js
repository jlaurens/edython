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

goog.require('eYo.Delegate')
goog.require('eYo.Driver')

/**
 * Class for a Render.
 * For edython.
 * @param {!Object} node  node is the owning node.
 * @readony
 * @property {object} node - The node owning of the render object.
 * @readony
 * @property {object} change - The change property of the node.
 * @readony
 * @property {object} reentrant_ - The reentrant_ property of the node.
 * @readony
 * @property {object} span - The span of the owning node.
 * @readony
 * @property {object} driver - The graphics driver.
 * @property {boolean} down - Whether in the process of down rendering, from parent to child, prevents infinite loops.
 * @property {boolean} up - Whether in the process of up rendering, from child to parent, prevents infinite loops.
 * @property {boolean} isShort - Whether the owning node is a short block
 * @property {boolean} parentIsShort - Whether the parent is a short block
 * @property {boolean} someTargetIsMissing - Whether some target is missing
 * @property {boolean} mayBeLast - Whether the node may be last in the statement.
 * @property {boolean} isLastInExpression - Whether the node is last in an expression block.
 * @property {boolean} isLastInStatement - Whether the node is last in a statement block.
 * @property {boolean} startOfLine - Whether the node is at the start of a line. (Statements may not start a line)
 * @property {boolean} startOfStatement - Whether the node is at the start of a statement.
 * @readony
 * @property {boolean} hasLeftEdge  whether the block has a left edge. When blocks are embedded, we might want to shorten things because the boundaries may add too much horizontal space.
 * @readonly
 * @property {boolean} hasRightEdge  whether the block has a right edge.
 * @readonly
 * @property {Object}  xyInSurface  the coordinates relative to the surface.
 */
eYo.UI = function(node) {
  this.node_ = node
  node.ui_ = this
  this.down = this.up = false
  this.driver.nodeInit(node)
  this.updateBlockWrapped()
}

Object.defineProperties(Blockly.BlockSvg, {
  disconnectUiStop_: {
    get () {
      return eYo.UI.disconnectUiStop_
    },
    set (newValue) {
      eYo.UI.disconnectUiStop_ = newValue
    }
  }
})

/**
 * The default implementation forwards to the driver.
 */
eYo.UI.prototype.dispose = function () {
  this.driver.nodeDispose(this.node_)
}

Object.defineProperties(eYo.UI.prototype, {
  node: {
    get() {
      return this.node_
    }
  },
  driver: {
    get() {
      return this.node_.workspace.eyo.driver
    }
  },
  change: {
    get() {
      return this.node_.change
    }
  },
  reentrant_: {
    get() {
      return this.node_.reentrant_
    }
  },
  span: {
    get() {
      return this.node_.span
    }
  },
  hasLeftEdge: {
    get () {
      return !this.node.wrapped_ && !this.node.locked_
    }
  },
  hasRightEdge: {
    get () {
      return !this.node_.wrapped_ && !this.node_.locked_
    }
  },
  minBlockW: {
    get () {
      return this.node_.isStmt ? eYo.Font.tabW : 0
    }
  },
  bBox: {
    get () {
      return this.rendered && this.driver.nodeGetBBox(this.node_)
    }
  },
  hasSelect: {
    get () {
      return this.rendered && this.driver.nodeHasSelect(this.node_)
    }
  }
})

/**
 * Render the given connection, if relevant.
 * @param {eYo.Magnet} m4t
 * @param {*} recorder
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.UI.prototype.drawM4t_ = function (m4t, recorder) {
  if (!m4t) {
    return
  }
  var t_eyo = m4t.t_eyo
  if (!t_eyo) {
    return
  }
  if (m4t.isSuperior) {
    m4t.tighten_()
  }
  var do_it = !t_eyo.rendered ||
  (!this.up &&
    !eYo.Magnet.disconnectedParent &&
    !eYo.Magnet.disconnectedChild&&
    !eYo.Magnet.connectedParent)
  if (do_it) {
    var ui = t_eyo.ui
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
 * Render the next block, if relevant.
 * @param {*} recorder
 * @return {boolean=} true if an rendering message was sent, false othrwise.
 */
eYo.UI.prototype.drawLow_ = function (recorder) {
  return this.drawM4t_(this.node.magnets.foot, recorder)
}

/**
 * Render the right block, if relevant.
 * @param {*} io
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.UI.prototype.renderRight_ = function (io) {
  var m4t = this.node.magnets.right
  if (m4t) {
    var t_eyo = m4t.t_eyo
    if (t_eyo) {
      var ui = t_eyo.ui
      try {
        ui.startOfLine = io.common.startOfLine
        ui.startOfStatement = io.common.startOfStatement
        ui.mayBeLast = ui.hasRightEdge
        ui.down = true
        if (eYo.Delegate.debugStartTrackingRender) {
          console.log(eYo.Delegate.debugPrefix, 'DOWN')
        }
        if (t_eyo.wrapped_) {
          // force target rendering
          t_eyo.incrementChangeCount()
        }
        if (!ui.up) {
          t_eyo.render(false, io)
          if (!t_eyo.wrapped_) {
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
        var span = t_eyo.span
        if (span.width) {
          io.cursor.advance(span.width, span.height - 1)
          // We just rendered a block
          // it is potentially the rightmost object inside its parent.
          if (ui.hasRightEdge || io.common.shouldPack) {
            io.common.ending.push(t_eyo)
            t_eyo.ui.rightCaret = undefined
            io.common.field.shouldSeparate = false
          }
          io.common.field.beforeIsCaret = false
        }
      }
      return true
    } else if (this.node.isGroup) {
      this.drawField_(m4t.fields.label, io) // only the ':' or ';' trailing field.
      return false
    }
  }
}

/**
 * Render the suite block, if relevant.
 * @param {*} recorder
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.UI.prototype.renderSuite_ = function (io) {
  var m4t = this.node_.magnets.suite
  if (!m4t) {
    return
  }
  if (eYo.Delegate.debugStartTrackingRender) {
    console.log(eYo.Delegate.debugPrefix, 'SUITE')
  }
  m4t.setOffset(eYo.Font.tabW, 1)
  var t_eyo = m4t.t_eyo
  if (t_eyo) {
    this.someTargetIsMissing = false
    var ui = t_eyo.ui
    if (ui.canDraw) {
      m4t.tighten_()
      if (!t_eyo.rendered || !ui.up) {
        try {
          ui.down = true
          t_eyo.render(false)
        } catch (err) {
          console.error(err)
          throw err
        } finally {
          ui.down = false
        }
      }
    }
  }
  this.span.main = this.node.getStatementCount()
  return true
}

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {*} recorder
 * @param {boolean=} optBubble If false, just render this.node block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
// deleted blocks are rendered during deletion
// this.node should be avoided
eYo.UI.prototype.render = (() => {
  // this is a closure
  /**
   * Render the parent block, if relevant.
   * @param {Object} recorder  A recorder object.
   * @param {boolean=} optBubble If false, just render this.node block.
   *   If true, also render block's parent, grandparent, etc.  Defaults to true.
   * @return {boolean=} true if an rendering message was sent, false otherwise.
   */
  var drawParent = function (recorder, optBubble) {
    // `this.node` is a block delegate
    if (optBubble === false || this.node.ui.down) {
      return
    }
    // Render all blocks above this.node one (propagate a reflow).
    // Only when the render message did not come from above!
    var parent = this.node.parent
    if (parent) {
      var justConnected = eYo.Magnet.connectedParent && this.node.magnets.output === eYo.Magnet.connectedParent.target
      if (!parent.ui.down) {
        try {
          parent.ui.up = true
          var old = this.node.ui.up
          this.node.ui.up = true
          if (eYo.UI.debugStartTrackingRender) {
            console.log(eYo.UI.debugPrefix, 'UP')
          }
          parent.render(!justConnected, recorder)
        } catch (err) {
          console.error(err)
          throw err
        } finally {
          parent.ui.up = false
          this.node.ui.up = old
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
      // Top-most block.  Fire an event to allow scrollbars to resize.
      this.node.workspace.resizeContents()
    }
  }
  var longRender = eYo.Decorate.reentrant_method(
    'longRender',
    function (optBubble, recorder) {
      if (eYo.UI.debugStartTrackingRender) {
        var n = eYo.UI.debugCount[block.id]
        eYo.UI.debugCount[block.id] = (n||0)+1
        if (!eYo.UI.debugPrefix.length) {
          console.log('>>>>>>>>>>')
        }
        eYo.UI.debugPrefix = eYo.UI.debugPrefix + '.'
        console.log(eYo.UI.debugPrefix, block.type, n, block.id)
        if (n > 1) {
          n = n + 0
        }
      }
      try {
        this.node.span.minWidth = this.node.span.c = 0
        this.node.consolidate()
        this.willRender_(recorder)
        var io = this.draw_(recorder)
        this.layoutConnections_(io)
        this.drawLow_(io)
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
    if (!this.node.isReady || this.rendered === false) { // this.rendered === undefined is OK
      return
    }
    if (!this.node.isEditing && (this.node.isDragging_ || this.node.change.level || !this.node.workspace)) {
      return
    }
    recorder && this.drawPending_(recorder, !this.node.wrapped_ && eYo.Key.LEFT)
    // rendering is very special when this.node is just a matter of
    // statement connection
    var block = this.node.block_
    if (block.rendered) {
      if (eYo.Magnet.disconnectedChild && this.node.magnets.head === eYo.Magnet.disconnectedChild) {
        // this.node block is the top one
        var io = this.willShortRender_(recorder)
        this.layoutConnections_(io)
        this.drawLow_(io)
        this.renderMove_(io)
        this.updateShape()
        this.node.change.save.render = this.node.change.count
        drawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
        return
      } else if (eYo.Magnet.disconnectedParent && this.node.magnets.foot === eYo.Magnet.disconnectedParent) {
        // this.node block is the low one
        // but it may belong to a suite
        var io = this.willShortRender_(recorder)
        this.layoutConnections_(io)
        this.drawLow_(io)
        this.renderMove_(io)
        this.updateShape()
        this.node.change.save.render = this.node.change.count
        drawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
        return
      } else if (eYo.Magnet.connectedParent) {
        if (this.node.magnets.output && eYo.Magnet.connectedParent === this.node.magnets.output.target) {
          // this.node is not a statement connection
          // no shortcut
        } else if (this.node.magnets.head && eYo.Magnet.connectedParent === this.node.magnets.head.target) {
          var io = this.willShortRender_(recorder)
          this.layoutConnections_(io)
          this.drawLow_(io)
          this.renderMove_(io)
          this.updateShape()
          this.node.change.save.render = this.node.change.count
          drawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
        } else if (this.node.magnets.foot && eYo.Magnet.connectedParent === this.node.magnets.foot) {
          var io = this.willShortRender_(recorder)
          this.layoutConnections_(io)
          this.drawLow_(io)
          this.renderMove_(io)
          this.updateShape()
          this.node.change.save.render = this.node.change.count
          drawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
        }
      }
    }
    if (!this.node.ui.down && this.node.magnets.output) {
      // always render from a line start id est
      // an orphan block or a statement block
      var parent
      if ((parent = this.node.parent)) {
        var next
        while (parent.magnets.output && (next = parent.parent)) {
          parent = next
        }
        // parent has no output connection or has no parent
        // which means that it is an expression block's delegate.
        recorder && (recorder.field.last = undefined)
        if (!parent.ui.down) {
          if (!parent.ui.up && this.node.magnets.outpu === eYo.Magnet.connectedParent || eYo.Magnet.connectedParent && eYo.Magnet.connectedParent.b_eyo === this.node) {
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
    if (this.node.change.save.render === this.node.change.count) {
      // minimal rendering
      var io = this.willShortRender_(recorder)
      this.layoutConnections_(io)
      this.drawLow_(io)
      this.renderMove_(io)
      this.updateShape()
      drawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
      return
    }
    longRender.call(this, optBubble, recorder)
    this.node.change.save.render = this.node.change.count
  }
}) ()

/**
 * Will draw the block, short version.
 * The print statement needs some preparation before drawing.
 * @param {*} recorder
 * @private
 */
eYo.UI.prototype.willShortRender_ = function (recorder) {
  return this.newDrawRecorder(recorder)
}

/**
 * Translates the block, forwards to the ui driver.
 * @param {number} x The x coordinate of the translation in workspace units.
 * @param {number} y The y coordinate of the translation in workspace units.
 */
eYo.UI.prototype.translate = function(x, y) {
  this.driver.nodeTranslate(this.node_, x, y)
}

/**
 * Will draw the block. forwards to the driver.
 * @param {*} recorder
 * @private
 */
eYo.UI.prototype.willRender_ = function (recorder) {
  this.driver.nodeWillRender(this.node_, recorder)
}

/**
 * Did draw the block. Default implementation does nothing.
 * @param {*} recorder
 * @private
 */
eYo.UI.prototype.didRender_ = function (recorder) {
  this.driver.nodeDidRender(this.node_, recorder)
}

/**
 * Update all of the connections on this block with the new locations calculated
 * in renderCompute.  Also move all of the connected blocks based on the new
 * connection locations.
 * @private
 */
eYo.UI.prototype.renderMoveConnections_ = function() {
  var blockTL = this.xyInSurface;
  // Don't tighten previous or output connections because they are inferior
  // connections.
  var m4ts = this.node.magnets
  var m4t
  if ((m4t = m4ts.left)) {
    m4t.moveToOffset(blockTL)
  }
  if ((m4t = m4ts.head)) {
    m4t.moveToOffset(blockTL)
  }
  if ((m4t = m4ts.output)) {
    m4t.moveToOffset(blockTL)
  }
  this.node.inputList.forEach(input => {
    if ((m4t = input.magnet)) {
      m4t.moveToOffset(blockTL)
      if (m4t.target) {
        m4t.tighten_()
      }
    }
  })
  if ((m4t = m4ts.foot)) {
    m4t.moveToOffset(blockTL)
    if (m4t.target) {
      m4t.tighten_()
    }
  }
}

/**
 * Layout previous, next and output block connections.
 * @param {*} recorder
 * @private
 */
eYo.UI.prototype.renderMove_ = function (recorder) {
  this.renderMoveConnections_()
  // var blockTL = this.xyInSurface
  // this.node.forEachSlot((slot) => {
  //   var input = slot.input
  //   if(input) {
  //     var m4t = input.magnet
  //     if (m4t) {
  //       m4t.moveToOffset(blockTL)
  //       m4t.tighten_()
  //     }
  //   }
  // })
}

/**
 * Layout previous, next and output block connections.
 * @param {*} recorder
 * @private
 */
eYo.UI.prototype.layoutConnections_ = function (recorder) {
  var m4ts = this.node.magnets
  var m4t = m4ts.output
  if (m4t) {
    m4t.setOffset()
  } else {
    if ((m4t = m4ts.head)) {
      m4t.setOffset()
    }
    if ((m4t = m4ts.foot)) {
      if (this.node.collapsed) {
        m4t.setOffset(0, 2)
      } else {
        m4t.setOffset(0, this.span.height)
      }
    }
    if ((m4t = m4ts.left)) {
      m4t.setOffset()
    }
    if ((m4t = m4ts.right)) {
      m4t.setOffset(this.span.width, 0)
    }
  }
}

/**
 * Draw the path of the block.
 * @param {*} recorder
 * @private
 */
eYo.UI.prototype.draw_ = function (recorder) {
  if (this.driver.nodeCanDraw(this.node_)) {
    // if the above path does not exist
    // the block is not yet ready for rendering
    // when defined, `recorder` comes from
    // the parent's `drawValueInput_` method.
    var io = this.drawModelBegin_(recorder)
    try {
      this.drawModel_(io)
    } catch (err) {
      console.error (err)
      throw err
    } finally {
      this.node.ui.renderRight_(io) || this.node.ui.renderSuite_(io)
      this.node.block_.height = this.span.height
      this.updateShape()
    }
  }
}

/**
 * Align the right edges by changing the size of all the connected statement blocks.
 * The default implementation does nothing.
 * @param {*} recorder
 * @protected
 */
eYo.UI.prototype.alignRightEdges_ = eYo.Decorate.onChangeCount(
  'alignRightEdges_',
  function (recorder) {
    if (this.node.parent || !this.node.isStmt || !this.node.rendered || !this.node.workspace || !this.node.isReady) {
      return
    }
    var right = 0
    var t = eYo.Font.tabWidth
    this.node.forEachStatement((eyo, depth) => {
      if (eyo.span.minWidth) {
        var w = t * depth + eyo.span.minWidth
        // all the right blocks now
        var x = eyo
        while ((x = x.right)) {
          w += x.span.minWidth - eYo.Unit.x // - eYo.Unit.x because blocks will overlap one space for the vertical boundaries
        }
        right = Math.max(right, w)
      }
    })
    if (right) {
      this.node.forEachStatement((eyo, depth) => {
        var width = right - t * depth
        // find the last right block and
        var x = eyo
        var b = x.block_
        while ((x = x.right)) {
          width -= (eyo.span.minWidth - eYo.Unit.x) // see comment above
          eyo = x
          b = x.block_
        }
        if (b.width !== width) {
          b.width = width
          eyo.updateShape()
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
eYo.UI.prototype.newDrawRecorder = function (recorder) {
  var io = {
    dlgt: this.node,
    steps: [],
    n: 0, // count of rendered objects (fields, slots and inputs)
    cursor: new eYo.Where(),
    forc: undefined // rendered file or connection
  }
  this.node.firstRenderedInput = this.node.lastRenderedInput = undefined
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
      startOfLine: !this.node.magnets.output || !this.node.parent, // statement | orphan block
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
 * @param {?Object} recorder  When null, this.node is not the start of a statement
 * @return {!Object} a local recorder
 * @private
 */
eYo.UI.prototype.drawModelBegin_ = function (recorder) {
  this.parentIsShort = false
  this.isShort = false
  this.someTargetIsMissing = false
  // we define the `io` named recorder which is specific to this.node block.
  var io = this.newDrawRecorder(recorder)
  // A "star like" field's text is one of '*', '+', '-', '~'...
  // This field is the very first of the block.
  // Once we have rendered a field with a positive length,
  // we cannot have a star like field.
  io.common.field.canStarLike = true
  // By default, we restart from scratch,
  // set the size to 0 for the width and 1 for the height
  this.span.init()
  // And reset properties
  this.mayBeLast = false
  this.isLastInExpression = false
  this.isLastInStatement = false
  // Do we need some room for the left side of the block?
  // no for wrapped blocks
  if (!this.node.wrapped_) {
    if (!this.node.magnets.output || !this.node.locked_ || !recorder) {
      // statement or unlocked,
      // one space for the left edge of the block
      // (even for locked statements, this.node is to avoid a
      // display shift when locking/unlocking)
      this.span.c = 1
      io.common.field.beforeIsBlack = false
    }
  }
  if (this.hasLeftEdge || !recorder || !this.node.magnets.output) {
    // statement or unlocked,
    // one space for the left edge of the block
    // (even for locked statements, this.node is to avoid a
    // display shift when locking/unlocking)
    this.span.c = 1
    io.common.field.beforeIsBlack = false
    io.common.field.beforeIsSeparator = true
    io.common.field.shouldSeparate = false
    // Do not change io.common.field.shouldSeparate ?
  }
  io.cursor.c = this.span.c
  if (this.node.magnets.output) {
    this.startOfStatement = io.common.startOfStatement
    this.startOfLine = io.common.startOfLine
  } else {
    this.startOfStatement = io.common.startOfStatement = true
    this.drawSharp_(io)
  }
  this.driver.nodeDrawModelBegin(this.node_, io)
  return io
}

/**
 * Render the inputs, the fields and the slots of the block.
 * The `recorder` is an object that keeps track of some
 * rendering information. It is the argument of various methods.
 * This method is executed at least once for any rendered block.
 * Since then, it won't be executed as long as the block has not been edited.
 * @param {?Object} io
 * @private
 */
eYo.UI.prototype.drawModel_ = function (io) {
  this.fieldDrawFrom_(this.node.fieldAtStart, io)
  if ((io.slot = this.node.slotAtHead)) {
    do {
      this.drawSlot_(io.slot, io)
    } while ((io.slot = io.slot.next))
  } else {
    // for dynamic lists
    this.node.inputList.forEach(input => {
      goog.asserts.assert(input, `Input with no eyo ${input.name} in block ${this.node.type}`)
      if (input.isVisible()) {
        io.input = input
        this.drawInput_(io)
      } else {
        input.fieldRow.forEach(field => {
          this.driver.fieldDisplayedSet(field, false)
        })
        var x = input.magnet
        x && (x = x.t_eyo) && x.ui.hide()
      }
    })
  }
  this.fieldDrawFrom_(this.node.toEndField, io)
  this.drawModelEnd_(io)
  this.driver.nodeDrawModelEnd(this.node_, io)
  return
}

/**
 * Terminate to render the model.
 * @param {?Object} recorder
 * @private
 */
eYo.UI.prototype.drawModelEnd_ = function (io) {
  // and now some space for the right edge, if any
  if (!this.node.wrapped_) {
    if (this.node.magnets.output) {
      if (io.common.field.last && io.common.field.last.eyo.isEditing) {
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
        } else if (!this.node.locked_ && !io.common.ending.length) {
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
  if (!this.node.magnets.output) {
    this.drawEnding_(io, true, true)
  } else if (!io.recorder) {
    this.drawEnding_(io, true)
  }
  this.drawPending_(io)
  if (!this.node.wrapped_) {
    var m4t = io.form && io.form.connection
    var t_eyo = m4t && m4t.t_eyo
    if (io.n < 2 && !this.node.wrapped_) {
      // this.node is a short block, special management of selection
      this.isShort = true
      if (t_eyo) {
        t_eyo.ui.parentIsShort = true
        // always add a space to the right
        t_eyo.ui.isLastInStatement = false
        t_eyo.ui.updateShape()
        io.cursor.c += 1
      }
    } else {
      this.isShort = false
      if (target) {
        target.eyo.ui.parentIsShort = false
      }
    }
  }
  io.cursor.c = Math.max(io.cursor.c, this.minBlockW)
  this.node.span.init(io.cursor)
  this.node.span.minWidth = this.node.block_.width = Math.max(this.node.block_.width, this.node.span.width)
  if (io.recorder) {
    // We ended a block. The right edge is generally a separator.
    // No need to add a separator if the block is wrapped or locked
    io.common.field.shouldSeparate && (io.common.field.shouldSeparate = !this.hasRightEdge)
    // if the block is wrapped or locked, there won't be any
    // right edge where a caret could be placed.
    // But may be we just rendered blocks in cascade such that
    // there might be some right edge already.
  }
  if (io.dlgt === this.node) {
    this.node.lastRenderedInput = io.common.inputDone
  }
}

/**
 * Render the the givent slot.
 * @param slot
 * @param io
 * @private
 */
eYo.UI.prototype.drawSlot_ = function (slot, io) {
  if (!slot) {
    return
  }
  var g = slot.svg && slot.svg.group_
  goog.asserts.assert(g, 'Slot with no root', io.dlgt.type, slot.key)
  if (slot.incog) {
    g && g.setAttribute('display', 'none')
    return
  }
  g.removeAttribute('display')
  // move the slot to the correct location
  slot.where.set(io.cursor)
  // Now reset the cursor relative to the slot
  io.cursor.set()
  this.fieldDrawFrom_(slot.fieldAtStart, io)
  if ((io.input = slot.input)) {
    this.drawInput_(io)
  }
  this.fieldDrawFrom_(slot.toEndField, io)
  // come back to the block coordinates
  io.cursor.advance(slot.where)
  // translate at the end because `slot.where` may change
  // due to the shrink process
  g.setAttribute('transform',
    `translate(${slot.where.x}, ${slot.where.y})`)
}

/**
 * Render the leading # character for collapsed statement blocks.
 * Statement subclasses must override it.
 * @param io
 * @private
 */
eYo.UI.prototype.drawSharp_ = function (io) {
  if (this.node.isControl) { // Not very clean, used as hook before rendering the comment fields.
    io.cursor.c += 4
  } else if (this.node.isStmt) {
    this.driver.nodeDrawSharp(this.node_, io.dlgt.disabled)
    if (io.dlgt.disabled) {
      io.cursor.c += 2
      io.common.startOfLine = io.common.startOfStatement = false
    }
  }
}

/**
 * Render one input of value block.
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
  var f_eyo = field.eyo
  f_eyo.ui_driver.fieldDisplayedUpdate(field)
  if (f_eyo.visible) {
    // Actually, io.cursor points to the location where the field
    // is expected. It is relative to the enclosing `SVG` group,
    // which is either a block or a slot.
    // If there is a pending caret, draw it and advance the cursor.
    io.form = f_eyo
    f_eyo.willRender()
    var text = field.getDisplayText_()
    // Replace the text.
    this.driver.fieldTextErase(field)
    f_eyo.size.set(text.length, 1)
    if (text.length) {
      if (text === '>') {
        console.error(io)
      }
      this.drawEnding_(io)
      this.drawPending_(io)
      io.common.startOfLine = io.common.startOfStatement = false
      ++ io.n
      this.driver.fieldTextDisplay(field)
      var head = text[0]
      var tail = text[text.length - 1]
      if (f_eyo.model.literal) {
        io.common.field.didPack = 0
      } else if (f_eyo.isLabel && io.common.field.beforeIsBlack) {
        io.cursor.c += 1
        io.common.field.beforeIsBlack = true
      } else {
        if (!io.common.field.shouldSeparate
          && !io.common.field.beforeIsSeparator
          && !io.common.field.beforeIsBlack
          && !io.common.startOfLine
          && !io.common.field.beforeIsCaret) {
          if (this.node.packedQuotes && (head === "'" || head === '"')) {
            io.cursor.c -= 1
          } else if (this.node.packedBrackets && head === "[") {
            io.cursor.c -= 1
          } else if (this.node.packedBraces && head === "{") {
            io.cursor.c -= 1
          } else if (this.node.packedParenthesis && head === "(") {
            io.cursor.c -= 1
          }
        } else if (head === '.' && !io.common.field.beforeIsBlack) {
          io.cursor.c -= 1
        } else if (io.common.field.beforeIsBlack
          && (eYo.XRE.operator.test(head) || head === '=' || (head === ':' && text.length > 1 /* `:=` but not `:` alone */))) {
          io.cursor.c += 1
        } else if (io.common.field.shouldSeparate
            && (!f_eyo.startsWithSeparator()
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
            && !(field instanceof eYo.FieldLabel)))
      io.common.field.beforeIsBlack = !eYo.XRE.white_space.test(tail)
      io.common.field.beforeIsCaret = false
      // place the field at the right position:
      this.driver.fieldPositionSet(field, io.cursor)
      // then advance the cursor after the field.
      if (f_eyo.size.w) {
        io.cursor.c += f_eyo.size.w
        // now that I have rendered something
        io.common.startOfLine = io.common.startOfStatement = false
      }
      if (io.cursor.c > 2) {
        if ((tail === '"' || tail === "'") && this.node.packedQuotes) {
          io.common.shouldPack = null // this.node
        } else if (tail === ']' && this.node.packedBrackets) {
          io.common.shouldPack = this.node
        } else if ((tail === '}') && this.node.packedBraces) {
          io.common.shouldPack = this.node
        } else if ((tail === ')') && this.node.packedParenthesis) {
          io.common.shouldPack = this.node
        }
      }
    }
    if (f_eyo.isEditing) {
      // This is a trick to avoid some bad geometry while editing
      // this.node is useful for widget only.
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
    } while ((field = field.eyo.nextField))
  }
}

/**
 * Render the fields of a block input/slot.
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
    if (!!only_prefix === !field.eyo.suffix) {
      this.drawField_(field, io)
    }
  })
  return io.cursor.c - current
}

/**
 * Render the ending blocks.
 *
 * In order to save space, we put caret at the end of blocks
 * and we shrink blocks to the minimum.
 *
 * When expression blocks are stacked, there is no need to
 * spend space just to draw the edges.
 * We can save space by drawing the block edges on top of each others.
 *
 * When we start rendering a new block,
 * `io.common.field.shouldSeparate` is set to `false`.
 * If we enter a child block, with no field nor splot before,
 * then we should decrease `cursor`.
 * This is why the right end of expression blocks
 * may be a straight line instead of a curved one
 * when at the end of a statement block.
 * This situation depends of information given after a block is
 * rendered. One solution is to scan all the blocks to prepare
 * rendering, then scan again to render.
 * We assume that only one loop is more efficient.
 * In that case, we must wait until a statement block is rendered
 * to properly locate and display connection,
 * and to properly display the last block.
 * In order to display a caret connection properly,
 * we attach to each block ending with a one character spaced
 * right edge a pending connection that might be displayed
 * over that right edge.
 * we consider the first fullfilled of these conditions:
 *
 * 1) we just rendered an expression block
 * that ends with a white space (not wrapped nor locked)
 * but have no pending connection attached
 *
 * 2) we won't render any field until the end of the block
 * and the block ends with a white space
 *
 * This message is sent at the end of statement block rendering.
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
        if (io.common.ending.some(eyo => !!eyo.ui.rightCaret)) {
          io.common.shouldPack = undefined
        } else {
          // there is no following right caret, we can pack
          var pack = false
          io.common.ending.forEach(eyo => {
            if (eyo === io.common.shouldPack) {
              io.common.shouldPack = undefined
              pack = true
              io.cursor.c -= 1
              // from now on, we pack just one character width
            }
            if (pack) {
              eyo.span.c = Math.max(this.minBlockW, eyo.span.c - 1)
              eyo.span.minWidth = eyo.span.width
              io.common.field.didPack = true
              io.common.field.beforeIsBlack = true
            }
          })
        }
      }
      io.common.ending.forEach(d => {
        d.ui.mayBeLast = false
        d.ui.isLastInExpression = isLastInExpression
        d.ui.isLastInStatement = isLastInStatement
      })
      io.common.ending.forEach(d => {
        d.updateShape()
        var m4t = d.ui.rightCaret
        if (m4t) {
          m4t.side = eYo.Key.RIGHT
          m4t.shape = eYo.Key.NONE
          m4t.isLastInStatement = isLastInStatement
          var d = eYo.Shape.definitionWithMagnet(m4t) // depends on the shape and the side
          var dlgt = m4t.b_eyo
          if (io.dlgt === dlgt) {
            // we are lucky, this.node is the block we are currently rendering
            io.steps.push(d)
          } else {
            // bad luck, block has already been rendered
            // we must append the definition to the path
            // this.node may happen for blocks with no left or right end,
            // eg locked or wrapped blocks.
            var path = dlgt.pathInner_
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
 * @param {?String} side On which side of a block.
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
      var dlgt = m4t.b_eyo
      if (io.dlgt === dlgt) {
        // we are lucky, this.node is the block we are currently rendering
        io.steps.push(shp.definition)
      } else {
        // bad luck, block has already been rendered
        // we must append the definition to the path
        // this.node may happen for blocks with no left or right end,
        // eg locked or wrapped blocks.
        var path = dlgt.pathInner_
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
 * Render the fields of a value input, if relevant.
 * @param {!Object} io the input/output argument.
 * @private
 */
eYo.UI.prototype.drawValueInput_ = function (io) {
  if (io.input.type !== eYo.Magnet.INPUT) {
    return false
  }
  // this.node is one of the reasons why we allways render from the start of a statement
  io.input.inputRight = undefined
  io.input.inputLeft = io.common.inputDone
  if (io.common.inputDone) {
    io.common.inputDone.eyo.inputRight = io.input
  } else {
    io.dlgt.firstRenderedInput = io.input
  }
  io.common.inputDone = io.input
  this.drawFields_(io, true)
  var m4t = io.input.magnet
  if (m4t) { // once `&&!m4t.hidden_` was there, bad idea, but why was it here?
    ++ io.n
    m4t.startOfLine = io.common.startOfLine
    m4t.startOfStatement = io.common.startOfStatement
    io.form = m4t
    m4t.side = m4t.shape = undefined
    io.common.field.canStarLike = false
    // io.cursor is relative to the block or the slot
    // but the connection must be located relative to the block
    // the connection delegate will take care of that because it knows
    // if there is a slot or only an input.
    var t_eyo = m4t.t_eyo
    if (t_eyo) {
      if (m4t.bindField && m4t.bindField.isVisible()) {
        m4t.setOffset(io.cursor.c - m4t.w, io.cursor.l)
        // The `bind` field hides the connection.
        // The bind field is always the last field before the connection.
        // if the connection has a bindField, then rendering the placeholder
        // for that connection is a bit different.
        // Don't display anything for that connection
        io.common.field.beforeIsCaret = false
      }
      var ui = t_eyo.ui
      if (ui) {
        try {
          ui.startOfLine = io.common.startOfLine
          ui.startOfStatement = io.common.startOfStatement
          ui.mayBeLast = ui.hasRightEdge
          ui.down = true
          if (eYo.UI.debugStartTrackingRender) {
            console.log(eYo.UI.debugPrefix, 'DOWN')
          }
          if (t_eyo.wrapped_) {
            // force target rendering
            t_eyo.incrementChangeCount()
          }
          m4t.setOffset(io.cursor)
          if (m4t.c === 1 && !io.common.field.beforeIsBlack && m4t.slot) {
            m4t.slot.where.c -= 1
            m4t.setOffset(io.cursor)
            if (io.input.inputLeft && io.input.inputLeft.connection.eyo.startOfLine) {
              ui.startOfLine = ui.startOfStatement = io.common.startOfLine = io.common.startOfStatement = true

            }
          }
          if (io.dlgt.magnets.output !== eYo.Magnet.disconnectedChild && !ui.up) {
            t_eyo.render(false, io)
            if (!t_eyo.wrapped_) {
              io.common.field.shouldSeparate = false
              io.common.field.beforeIsSeparator = true
            }
          }
        } catch(err) {
           console.error(err)
           throw err
        } finally {
          ui.down = false
          var span = t_eyo.span
          if (span.w) {
            io.cursor.advance(span.w, span.h - 1)
            // We just rendered a block
            // it is potentially the rightmost object inside its parent.
            if (ui.hasRightEdge || io.common.shouldPack) {
              io.common.ending.push(t_eyo)
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
      if (m4t.bindField && m4t.bindField.isVisible()) {
        m4t.setOffset(io.cursor.c - m4t.w, io.cursor.l)
        // The `bind` field hides the connection.
        // The bind field is always the last field before the connection.
        // if the connection has a bindField, then rendering the placeholder
        // for that connection is a bit different.
        // Don't display anything for that connection
        io.common.field.beforeIsCaret = false
      } else if (!this.node.locked_ && !m4t.hidden_) {
        // locked blocks won't display any placeholder
        // (input with no target)
        if (!m4t.disabled_) {
          m4t.setOffset(io.cursor)
          m4t.startOfLine = io.common.startOfLine
          m4t.startOfStatement = io.common.startOfStatement
          if (m4t.s7r_) {
            m4t.side = eYo.Key.NONE
            var ending = io.common.ending.slice(-1)[0]
            if (ending && !ending.ui.rightCaret) {
              // an expression block with a right end has been rendered
              // we put the caret on that end to save space,
              // we move the connection one character to the left
              io.cursor.c -= 1
              m4t.setOffset(io.cursor)
              io.cursor.c += 1
              ending.ui.rightCaret = m4t
              m4t.isAfterRightEdge = io.beforeIsRightEdge
              io.common.field.beforeIsCaret = true
            } else {
              // we might want this.node caret not to advance the cursor
              // If the next rendered object is a field, then
              // this.node caret should be rendered normally
              // and the cursor should advance.
              // If the next rendered object is an expression block
              // with a left end, then this.node caret shoud be rendered
              // with a left shape and the cursor should not advance.
              // If the caret is the last rendered object of the block,
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
  this.drawFields_(io, false)
  return true
}

/**
 * Update the shape of the block.
 * Forwards to the driver.
 * @protected
 */
eYo.UI.prototype.updateShape = function () {
  this.driver.nodeUpdateShape(this.node_)
}

/**
 * Hide the block.
 * Forwards to the driver.
 */
eYo.UI.prototype.hide = function () {
  this.driver.nodeDisplayedSet(this.node_, false)
}

/**
 * The default implementation forwards to the driver.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.UI.prototype.parentWillChange = function (newParent) {
  this.driver.nodeParentWillChange(this.node_, newParent)
}

/**
 * The default implementation forwards to the driver.
 * @param {!Blockly.Block} oldParent replaced.
 */
eYo.UI.prototype.parentDidChange = function (oldParent) {
  this.driver.nodeParentDidChange(this.node_, oldParent)
}

Object.defineProperties(eYo.UI.prototype, {
  visible: {
    /**
     * Get the display status of the receiver's node.
     * Forwards to the driver.
     */
    get () {
      return this.driver.nodeDisplayedGet(this.node_)
    },
    /**
     * Set the display status of the receiver's node.
     * Forwards to the driver.
     * @param {boolean} visible
     */
    set (newValue) {
      this.driver.nodeDisplayedSet(this.node_, visible)
    }
  }
})

/**
 * The default implementation forwards to the driver.
 */
eYo.UI.prototype.updateDisabled = function () {
  this.driver.nodeUpdateDisabled(this.node_)
  this.node.getChildren().forEach(child => child.ui.updateDisabled())
}

/**
 * The default implementation forwards to the driver.
 */
eYo.UI.prototype.connectionUIEffect = function () {
  var w = this.node.workspace
  w.getAudioManager().play('click')
  if (w.scale < 1) {
    return // Too small to care about visual effects.
  }
  this.driver.nodeConnectionUIEffect(this.node_)
}

/**
 * Show the given menu.
 * The default implementation forwards to the driver.
 * @param {*} menu
 */
eYo.UI.prototype.showMenu = function (menu) {
  this.driver.nodeMenuShow(this.node_, menu)
}

/**
 * Make the given block wrapped.
 * The default implementation forwards to the driver.
 */
eYo.UI.prototype.updateBlockWrapped = function () {
  this.driver.nodeUpdateWrapped(this.node_)
}

/**
 * The default implementation forwards to the driver.
 */
eYo.UI.prototype.sendToFront = function () {
  this.driver.nodeSendToFront(this.node_)
}

/**
 * The default implementation forwards to the driver.
 */
eYo.UI.prototype.sendToBack = function () {
  this.driver.nodeSendToFront(this.node_)
}

/**
 * Set the offset of the receiver's node.
 * NOT YET USED. OVERRIDEN BELOW.
 * For edython.
 * @param {*} dc
 * @param {*} dl
 * @return {boolean}
 */
eYo.UI.prototype.nodeSetOffset = function (dc, dl) {
  // Workspace coordinates.
  if (!this.driver.nodeCanDraw(this.node)) {
    throw `block is not inited ${this.node.type}`
  }
  var dx = dc * eYo.Unit.x
  var dy = dl * eYo.Unit.y
  this.driver.nodeSetOffset(this.node_, dx, dy)
  this.moveConnections_(dx, dy)
}

/**
 * Set the offset of the receiver's node.
 * For edython.
 * @param {*} dx
 * @param {*} dy
 * @return {boolean}
 */
eYo.UI.prototype.setOffset = function (dx, dy) {
  if (!this.driver.nodeCanDraw(this.node_)) {
    throw `block is not inited ${this.node_.type}`
  }
  this.driver.nodeSetOffset(this.node_, dx, dy)
  this.moveConnections_(dx, dy)
}

/**
 * Move the connections to follow a translation of the block.
 * @param {Number} dx
 * @param {Number} dy
 * @private
 */
eYo.UI.prototype.moveConnections_ = function (dx, dy) {
  this.node.block_.moveConnections_(dx, dy)
}

//////////////////

/**
 * Add the hilight path_.
 * Forwards to the driver.
 */
eYo.UI.prototype.addBlockHilight_ = function () {
  this.driver.nodeHilightAdd(this.node_)
}

/**
 * Remove the hilight path.
 * Forwards to the driver.
 */
eYo.UI.prototype.removeBlockHilight_ =function () {
  this.driver.nodeHilightRemove(this.node_)
}

/**
 * Add the select path.
 * Forwards to the driver.
 */
eYo.UI.prototype.addDlgtSelect_ = function () {
  this.driver.nodeSelectAdd(this.node_)
}

/**
 * Remove the select path.
 * Forwards to the driver.
 */
eYo.UI.prototype.removeDlgtSelect_ = function () {
  this.driver.nodeSelectRemove(this.node_)
}

/**
 * Add the hilight connection path_.
 * Forwards to the driver.
 */
eYo.UI.prototype.addBlockMagnet_ = function () {
  this.driver.nodeMagnetAdd(this.node_)
}

/**
 * Remove the select path.
 * Forwards to the driver.
 */
eYo.UI.prototype.removeBlockConnection_ = function () {
  this.driver.nodeConnectionRemove(this.node_)
}

/**
 * Forwards to the driver.
 */
eYo.UI.prototype.addStatusTop_ = function () {
  this.driver.nodeStatusTopAdd(this.node_)
}


/**
 * Remove the `top` status.
 * Forwards to the driver.
 */
eYo.UI.prototype.removeStatusTop_ = function (eyo) {
  this.driver.nodeStatusTopRemove(this.node_)
}

/**
 * Forwards to the driver and `addSelect` to each field.
 */
eYo.UI.prototype.addStatusSelect_ = function () {
  this.driver.nodeStatusSelectAdd(this.node_)
  this.node.forEachInput(input => {
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
  this.driver.nodeStatusSelectRemove(this.node_)
  this.node.forEachInput(input => {
    input.fieldRow.forEach(field => {
      goog.isFunction(field.removeSelect) && field.removeSelect()
    })
  })
}

/**
 * Did connect some block's connection to another connection.
 * When connecting locked blocks, select the receiver.
 * @param {!eYo.Magnet} m4t what has been connected in the block
 * @param {!eYo.Magnet} oldTargetM4t what was previously connected in the block
 * @param {!eYo.Magnet} targetOldM4t what was previously connected to the new targetConnection
 */
eYo.UI.prototype.didConnect = function (m4t, oldTargetM4t, targetOldM4t) {
  if (m4t.isOutput) {
    m4t.ui.removeStatusTop_()
  }
}

/**
 * Converse of the preceeding.
 * @param {!eYo.Magnet} m4t what has been connected in the block
 * @param {!eYo.Magnet} oldTargetM4t what was previously connected in the block
 */
eYo.UI.prototype.didDisconnect = function (m4t, oldTargetM4t) {
  if (m4t.isOutput) {
    m4t.ui.addStatusTop_()
  }
}

/**
 * Return the coordinates of the top-left corner of this block relative to the
 * drawing surface's origin (0,0), in workspace units.
 * If the block is on the workspace, (0, 0) is the origin of the workspace
 * coordinate system.
 * This does not change with workspace scale.
 * @return {!goog.math.Coordinate} Object with .x and .y properties in
 *     workspace coordinates.
 */
Object.defineProperties(eYo.UI.prototype, {
  xyInSurface: {
    get () {
      return this.driver.nodeXYInSurface(this.node_)
    }
  },
  /**
   * Returns a bounding box describing the dimensions of this block
   * and any blocks stacked below it, in workspace unit.
   * @return {!{height: number, minWidth: number, width: number}} Object with height and width
   *    properties in workspace units.
   */
  size: {
    get () {
      var s = this.node.size
      return {
        height: s.height * eYo.Unit.y,
        minWidth: s.minWidth * eYo.Unit.x,
        width: s.width * eYo.Unit.x
      }
    }
  },
  /**
   * Returns the coordinates of a bounding rect describing the dimensions of the node.
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
   * block.
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
 * Move the blocks relatively.
 * @param {number} dx Horizontal offset in workspace units.
 * @param {number} dy Vertical offset in workspace units.
 */
eYo.UI.prototype.moveByXY = function (dx, dy) {
  this.node.block_.moveBy(dx, dy)
}

/**
 * Move this block during a drag, taking into account whether we are using a
 * drag surface to translate blocks.
 * This block must be a top-level block.
 * @param {!goog.math.Coordinate} newLoc The location to translate to, in
 *     workspace coordinates.
 * @package
 */
eYo.UI.prototype.moveDuringDrag = function(newLoc) {
  var n = this.node
  var d = n.ui && n.ui.getDistanceFromVisible(newLoc)
  if (d) {
    newLoc.x -= d.x
    newLoc.y -= d.y
  }
  if (n.useDragSurface_) {
    this.workspace.blockDragSurface_.translateSurface(newLoc.x, newLoc.y);
  } else {
    this.driver.nodeSetOffsetDuringDrag(n, newLoc.x, newLoc.y)
  }
}

/**
 * Recursively adds or removes the dragging class to this node and its children.
 * Store `adding` in a property of the delegate.
 * @param {boolean} adding True if adding, false if removing.
 * @package
 */
eYo.UI.prototype.setDragging = function(adding) {
  this.isDragging_ = adding
  this.driver.nodeSetDragging(node, adding)
}

/**
 * Get the position of receiver's block relative to
 * the visible area.
 * Return value: if `x < 0`, left of the visible area,
 * if `x > 0`, right of the visible area, 0 otherwise.
 * undefined when the block is not in a workspace.
 * The same holds for `y`.
 * The values are the signed distances between the center
 * of the block and the visible area.
 * If the answer is `{x: -15, y: 0}`, we just have to scroll the workspace
 * 15 units to the right and the block is visible.
 * For edython.
 * @param {?Object} newLoc The new location of the receiver, the actual location when undefined.
 * @return {{x: number, y: number}|undefined}
 */
eYo.UI.prototype.getDistanceFromVisible = function (newLoc) {
  var workspace = this.node.workspace
  if (!workspace) {
    return undefined
  }
  // is the block in the visible area ?
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
  var HW = this.node.height_width
  // the block is in the visible area if we see its center
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
 * Move the block to the top level.
 */
eYo.UI.prototype.setParent = function (parent) {
  this.driver.nodeSetParent(this, parent)
}


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

goog.provide('eYo.Renderer')

goog.require('eYo.Delegate')
goog.require('eYo.Driver')

/**
 * Class for a Render.
 * For edython.
 * @param {!Object} node  node is the owning node.
 * @readony
 * @property {object} node - The node owning of the render object.
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
 * @property {boolean} hasLeftEdge  whether the block has a left edge. When blocks are embedded, we might want to shorten things because the boudaries may add too much horizontal space.
 * @property {boolean} hasRightEdge  whether the block has a right edge.
 */
eYo.Renderer = function(node) {
  this.node_ = node
  this.down = this.up = false
}

/**
 * The default implementation forwards to the driver.
 */
eYo.Renderer.prototype.dispose = function () {
  this.driver.dispose(this.node_)
}

Object.defineProperties(eYo.Renderer.prototype, {
  node: {
    get() {
      return this.node_
    }
  },
  driver: {
    get() {
      return this.node_.workspace.eyo.driver.Node
    }
  },
  change: {
    get() {
      return this.node_.change
    }
  },
  driver: {
    get() {
      return this.driver_
    },
    set (newValue) {
      if (newValue !== this.driver_) {
        this.driver_ && this.driver_.dispose(this.node_)
        this.driver_ = driver
        this.driver_ && this.driver_.init(this.node)
      }
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
      return this.driver.getBBox(this.node_)
    }
  },
  hasSelect: {
    get () {
      return this.driver.hasSelect(this.node_)
    }
  }
})

/**
 * Render the given connection, if relevant.
 * @param {*} recorder 
 * @param {*} c8n 
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.Renderer.prototype.drawC8n_ = function (recorder, c8n) {
  if (!c8n) {
    return
  }
  var target = c8n.targetBlock()
  if (!target) {
    return
  }
  if (c8n.eyo.isSuperior) {
    c8n.tighten_()
  }
  var do_it = !target.rendered ||
  (!this.up &&
    !eYo.Connection.disconnectedParentC8n &&
    !eYo.Connection.disconnectedChildC8n&&
    !eYo.Connection.connectedParentC8n)
  if (do_it) {
    var r = target.eyo.renderer
    try {
      r.down = true
      r.render(false, recorder)
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      r.down = false
    }
    return true
  }
}

/**
 * Render the next block, if relevant.
 * @param {*} recorder
 * @return {boolean=} true if an rendering message was sent, false othrwise.
 */
eYo.Renderer.prototype.drawNext_ = function (recorder) {
  return this.drawC8n_(recorder, this.node.nextConnection)
}

/**
 * Render the right block, if relevant.
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.Renderer.prototype.renderRight_ = function () {
  var c8n = this.node.rightStmtConnection
  if (c8n) {
    var c_eyo = c8n.eyo
    var t_eyo = c_eyo.t_eyo
    if (t_eyo) {
      var r = t_eyo.renderer
      try {
        r.startOfLine = io.common.startOfLine
        r.startOfStatement = io.common.startOfStatement
        r.mayBeLast = r.hasRightEdge
        r.down = true
        if (eYo.DelegateSvg.debugStartTrackingRender) {
          console.log(eYo.DelegateSvg.debugPrefix, 'DOWN')
        }
        if (t_eyo.wrapped_) {
          // force target rendering
          t_eyo.incrementChangeCount()
        }
        if (!r.up) {
          t_eyo.render(false, io)
          if (!t_eyo.wrapped_) {
            io.common.field.shouldSeparate = false
            io.common.field.beforeIsSeparator = true
          }
        }
        io.cursor.c = c_eyo.where.c
      } catch(err) {
        console.error(err)
        throw err
      } finally {
        r.down = false
        var span = t_eyo.span
        if (span.width) {
          io.cursor.advance(span.width, span.height - 1)
          // We just rendered a block
          // it is potentially the rightmost object inside its parent.
          if (r.hasRightEdge || io.common.shouldPack) {
            io.common.ending.push(t_eyo)
            t_eyo.renderer.rightCaret = undefined
            io.common.field.shouldSeparate = false
          }
          io.common.field.beforeIsCaret = false
        }
      }
      return true
    }
  }
}

console.error('rendered property should move to the renderer')
/**
 * Render the suite block, if relevant.
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.Renderer.prototype.renderSuite_ = function (io) {
  if (!this.inputSuite) {
    return
  }
  if (eYo.DelegateSvg.debugStartTrackingRender) {
    console.log(eYo.DelegateSvg.debugPrefix, 'SUITE')
  }
  var c8n = this.suiteConnection
  if (c8n) {
    var c_eyo = c8n.eyo
    c_eyo.setOffset(eYo.Font.tabW, 1)
    var t_eyo = c_eyo.t_eyo
    if (t_eyo) {
      this.someTargetIsMissing = false
      if (t_eyo.renderer.canRender) {
        c8n.tighten_()
        if (!t_eyo.rendered || !t_eyo.renderer.up) {
          try {
            t_eyo.renderer.down = true
            t_eyo.render(false)
          } catch (err) {
            console.error(err)
            throw err
          } finally {
            t_eyo.renderer.down = false
          }
        }
      }
    } else if (this.suiteConnection) {
      this.someTargetIsMissing = true
    }
    this.span.main = this.getStatementCount()
    return true
  }
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
eYo.Renderer.prototype.render = (() => {
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
    if (optBubble === false || this.node.renderer.down) {
      return
    }
    // Render all blocks above this.node one (propagate a reflow).
    // Only when the render message did not come from above!
    var parent = this.node.parent
    if (parent) {
      var justConnected = eYo.Connection.connectedParentC8n && this.node.outputConnection === eYo.Connection.connectedParentC8n.targetConnection
      if (!parent.renderer.down) {
        try {
          parent.renderer.up = true
          var old = this.node.renderer.up
          this.node.renderer.up = true
          if (eYo.Renderer.debugStartTrackingRender) {
            console.log(eYo.Renderer.debugPrefix, 'UP')
          }
          parent.render(!justConnected, recorder)
        } catch (err) {
          console.error(err)
          throw err
        } finally {
          parent.renderer.up = false
          this.node.renderer.up = old
        }
        if (justConnected) {
          if (parent.parent) {
            parent = parent.root
            try {
              parent.renderer.up = true
              if (eYo.Renderer.debugStartTrackingRender) {
                console.log(eYo.Renderer.debugPrefix, 'UP')
              }
              parent.render(false, recorder)
            } catch (err) {
              console.error(err)
              throw err
            } finally {
              parent.renderer.up = false
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
      if (eYo.Renderer.debugStartTrackingRender) {
        var n = eYo.Renderer.debugCount[block.id]
        eYo.Renderer.debugCount[block.id] = (n||0)+1
        if (!eYo.Renderer.debugPrefix.length) {
          console.log('>>>>>>>>>>')
        }
        eYo.Renderer.debugPrefix = eYo.Renderer.debugPrefix + '.'
        console.log(eYo.Renderer.debugPrefix, block.type, n, block.id)
        if (n > 1) {
          n = n + 0
        }
      }
      try {
        this.node.minWidth = block.width = 0
        this.node.consolidate()
        this.willRender_(recorder)
        var io = this.draw_(recorder)
        this.layoutConnections_(io)
        this.drawNext_(io)
        this.renderMove_(io)
        this.updateShape()
        drawParent.call(this.node, io, optBubble) || this.alignRightEdges_(io)
        this.node.block.rendered = true
        this.didRender_(io)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        if (eYo.Renderer.debugStartTrackingRender &&  eYo.Renderer.debugPrefix.length) {
          eYo.Renderer.debugPrefix = eYo.Renderer.debugPrefix.substring(1)
        }
      }    
    }
  )
  return function (optBubble, recorder) {
    if (!this.node.isReady) {
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
      if (eYo.Connection.disconnectedChildC8n && this.node.previousConnection === eYo.Connection.disconnectedChildC8n) {
        // this.node block is the top one
        var io = this.willShortRender_(recorder)
        this.layoutConnections_(io)
        this.drawNext_(io)
        this.renderMove_(io)
        this.updateShape()
        this.node.change.save.render = this.node.change.count
        drawParent.call(this.node, io, optBubble) || this.alignRightEdges_(io)
        return
      } else if (eYo.Connection.disconnectedParentC8n && this.node.nextConnection === eYo.Connection.disconnectedParentC8n) {
        // this.node block is the bottom one
        // but it may belong to a suite
        var io = this.willShortRender_(recorder)
        this.layoutConnections_(io)
        this.drawNext_(io)
        this.renderMove_(io)
        this.updateShape()
        this.node.change.save.render = this.node.change.count
        drawParent.call(this.node, io, optBubble) || this.alignRightEdges_(io)
        return
      } else if (eYo.Connection.connectedParentC8n) {
        if (this.node.outputConnection && eYo.Connection.connectedParentC8n === this.node.outputConnection.targetConnection) {
          // this.node is not a statement connection
          // no shortcut
        } else if (this.node.previousConnection && eYo.Connection.connectedParentC8n === this.node.previousConnection.targetConnection) {
          var io = this.willShortRender_(recorder)
          this.layoutConnections_(io)
          this.drawNext_(io)
          this.renderMove_(io)
          this.updateShape()
          this.node.change.save.render = this.node.change.count
          drawParent.call(this.node, io, optBubble) || this.alignRightEdges_(io)
        } else if (this.node.nextConnection && eYo.Connection.connectedParentC8n === this.node.nextConnection) {
          var io = this.willShortRender_(recorder)
          this.layoutConnections_(io)
          this.drawNext_(io)
          this.renderMove_(io)
          this.updateShape()
          this.node.change.save.render = this.node.change.count
          drawParent.call(this.node, io, optBubble) || this.alignRightEdges_(io)
        }
      }
    }
    if (!this.node.renderer.down && this.node.outputConnection) {
      // always render from a line start id est
      // an orphan block or a statement block
      var parent
      if ((parent = this.node.parent)) {
        var next
        while (parent.outputConnection && (next = parent.parent)) {
          parent = next
        }
        // parent has no output connection or has no parent
        // which means that it is an expression block's delegate.
        recorder && (recorder.field.last = undefined)
        if (!parent.renderer.down) {
          if (!parent.renderer.up && this.node.outputConnection === eYo.Connection.connectedParentC8n || eYo.Connection.connectedParentC8n && eYo.Connection.connectedParentC8n.eyo.b_eyo === this.node) {
            try {
              parent.renderer.up = true
              parent.render(optBubble, recorder)
            } catch (err) {
              console.error(err)
              throw err
            } finally {
              parent.renderer.up = false
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
      this.drawNext_(io)
      this.renderMove_(io)
      this.updateShape()
      drawParent.call(this.node, io, optBubble) || this.alignRightEdges_(io)
      return
    }
    longRender.call(this.node, optBubble, recorder)
    this.node.change.save.render = this.node.change.count
  }
}) ()

/**
 * Will draw the block, short version.
 * The print statement needs some preparation before drawing.
 * @param {*} recorder
 * @private
 */
eYo.Renderer.prototype.willShortRender_ = function (recorder) {
  if (this.node.inputSuite) {
    this.node.size.h = this.main + this.black + this.suite
  }
  return this.newDrawRecorder(recorder)
}

goog.require('goog.dom')

/**
 * Will draw the block. forwards to the driver.
 * @param {*} recorder
 * @private
 */
eYo.Renderer.prototype.willRender_ = function (recorder) {
  this.driver.willRender(recorder)
}

/**
 * Did draw the block. Default implementation does nothing.
 * @param {*} recorder
 * @private
 */
eYo.Renderer.prototype.didRender_ = function (recorder) {
  this.driver.didRender(recorder)
}

/**
 * Layout previous, next and output block connections.
 * @param {*} recorder
 * @private
 */
eYo.Renderer.prototype.renderMove_ = function (recorder) {
  var block = this.node.block_
  block.renderMoveConnections_()
  // var blockTL = block.getRelativeToSurfaceXY()
  // this.node.forEachSlot((slot) => {
  //   var input = slot.input
  //   if(input) {
  //     var c8n = input.connection
  //     if (c8n) {
  //       c8n.moveToOffset(blockTL)
  //       if (c8n.isConnected()) {
  //         c8n.tighten_();
  //       }
  //     }
  //   }
  // })
}

/**
 * Layout previous, next and output block connections.
 * @param {*} recorder
 * @private
 */
eYo.Renderer.prototype.layoutConnections_ = function (recorder) {
  var c8n = this.node.outputConnection
  if (c8n) {
    c8n.eyo.setOffset()
  } else {
    c8n = this.node.previousConnection
    if (c8n) {
      c8n.eyo.setOffset()
    }
    c8n = this.node.nextConnection
    if (c8n) {
      if (this.node.isCollapsed) {
        c8n.eyo.setOffset(0, 2)
      } else {
        c8n.eyo.setOffset(0, this.span.height)
      }
    }
    c8n = this.node.leftStmtConnection
    if (c8n) {
      c8n.eyo.setOffset()
    }
    c8n = this.node.rightStmtConnection
    if (c8n) {
      c8n.eyo.setOffset(this.span.width, 0)
    }
  }
}

/**
 * Draw the path of the block.
 * @param {*} recorder
 * @private
 */
eYo.Renderer.prototype.draw_ = function (recorder) {
  if (this.driver.canDraw(this.node)) {
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
      this.node.renderer.renderRight_(io) || this.node.renderer.renderSuite_(io)
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
eYo.Renderer.prototype.alignRightEdges_ = eYo.Decorate.onChangeCount(
  'alignRightEdges_',
  function (recorder) {
    if (this.node.parent || !this.node.isStmt || !this.node.block_.rendered || !this.node.block_.workspace || !this.node.isReady) {
      return
    }
    var right = 0
    var t = eYo.Font.tabWidth
    this.node.forEachStatement((eyo, depth) => {
      if (eyo.minWidth) {
        var w = t * depth + eyo.minWidth
        // all the right blocks now
        var r = eyo
        while ((r = r.right)) {
          w += r.minWidth - eYo.Unit.x // - eYo.Unit.x because blocks will overlap one space for the vertical boundaries
        }
        right = Math.max(right, w)
      }
    })
    if (right) {
      this.node.forEachStatement((eyo, depth) => {
        var width = right - t * depth
        // find the last right block and 
        var r = eyo
        var b = r.block_
        while ((r = r.right)) {
          width -= (eyo.minWidth - eYo.Unit.x) // see comment above
          eyo = r
          b = r.block_
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
 * Update the shape of the block.
 * Forwards to the driver.
 * @protected
 */
eYo.Renderer.prototype.updateShape = function () {
  this.driver.updateShape(this.node_)
  return 0
}

/**
 * Get a new draw recorder.
 * @param {*} recorder
 * @private
 */
eYo.Renderer.prototype.newDrawRecorder = function (recorder) {
  var io = {
    block: this.node.block_,
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
      startOfLine: !this.node.outputConnection || !this.node.parent, // statement | orphan block
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
eYo.Renderer.prototype.drawModelBegin_ = function (recorder) {
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
    if (!this.node.outputConnection || !this.node.locked_ || !recorder) {
      // statement or unlocked,
      // one space for the left edge of the block
      // (even for locked statements, this.node is to avoid a
      // display shift when locking/unlocking)
      this.span.c = 1
      io.common.field.beforeIsBlack = false
    }
  }
  if (this.hasLeftEdge || !recorder || !this.node.outputConnection) {
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
  if (this.node.outputConnection) {
    this.startOfStatement = io.common.startOfStatement
    this.startOfLine = io.common.startOfLine
  } else {
    this.startOfStatement = io.common.startOfStatement = true
    this.drawSharp_(io)
  }
  this.driver.drawModelBegin(io)
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
eYo.Renderer.prototype.drawModel_ = function (io) {
  this.fieldDrawFrom_(this.node.fieldAtStart, io)
  if ((io.slot = this.node.slotAtHead)) {
    do {
      this.drawSlot_(io.slot, io)
    } while ((io.slot = io.slot.next))
  } else {
    // for dynamic lists
    this.node.inputList.forEach(input => {
      goog.asserts.assert(input.eyo, `Input with no eyo ${input.name} in block ${this.node.type}`)
      if (input.isVisible()) {
        io.input = input
        this.drawInput_(io)
      } else {
        input.fieldRow.forEach(field => {
          this.fieldHide(field, io)
        })
        if ((io.c8n = input.connection)) {
          if ((io.target = io.c8n.targetBlock())) {
            io.target.eyo.renderer.hide()
          }
        }
      }
    })
  }
  this.fieldDrawFrom_(this.node.toEndField, io)
  this.drawModelEnd_(io)
  this.driver.drawModelEnd(io)
  return
}

/**
 * Hide the block.
 * Forwards to the driver.
 * @param {?Object} recorder 
 * @private
 */
eYo.Renderer.prototype.hide = function (io) {
  this.driver.hide(this.node_)
}

/**
 * Hide a field.
 * Forwards to the driver.
 * @param {?Object} field 
 * @private
 */
eYo.Renderer.prototype.fieldHide = function (field) {
  this.driver.fieldSetVisible(field, false)
}

/**
 * Whether the given field is displayed.
 * Forwards to the driver.
 * @param {!Object} field 
 * @private
 */
eYo.Renderer.prototype.fieldDisplayed = function (field) {
  return this.driver.fieldDisplayed(field)
}

ERROR below
/**
 * Whether the field is displayed.
 * @param {!Object} field  the field to query about
 */
eYo.Node.Driver.Svg.fieldDisplayed = function (field) {
  var g = field.eyo.svg.group_
  return g.style.display !== 'none'
}

/**
 * Terminate to render the model.
 * @param {?Object} recorder 
 * @private
 */
eYo.Renderer.prototype.drawModelEnd_ = function (io) {
  // and now some space for the right edge, if any
  if (!this.node.wrapped_) {
    if (this.node.outputConnection) {
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
  if (!this.node.outputConnection) {
    this.drawEnding_(io, true, true)
  } else if (!io.recorder) {
    this.drawEnding_(io, true)
  }
  this.drawPending_(io)
  if (!this.node.wrapped_) {
    var c8n = io.forc && io.forc.connection
    var target = c8n && c8n.targetBlock()
    if (io.n < 2 && !this.node.wrapped_) {
      // this.node is a short block, special management of selection
      this.isShort = true
      if (target) {
        target.eyo.renderer.parentIsShort = true
        // always add a space to the right
        target.eyo.renderer.isLastInStatement = false
        target.eyo.updateShape()
        io.cursor.c += 1
      }
    } else {
      this.isShort = false
      if (target) {
        target.eyo.renderer.parentIsShort = false
      }
    }
  }
  io.cursor.c = Math.max(io.cursor.c, this.minBlockW)
  this.node.size.setFromWhere(io.cursor)
  this.node.minWidth = this.node.block_.width = Math.max(this.node.block_.width, this.node.size.x)
  if (io.recorder) {
    // We ended a block. The right edge is generally a separator.
    // No need to add a separator if the block is wrapped or locked
    io.common.field.shouldSeparate && (io.common.field.shouldSeparate = !this.hasRightEdge)
    // if the block is wrapped or locked, there won't be any 
    // right edge where a caret could be placed.
    // But may be we just rendered blocks in cascade such that
    // there might be some right edge already.
  }
  if (io.block === this.node.block_) {
    this.node.lastRenderedInput = io.common.inputDone
  }
}

/**
 * Render the the givent slot.
 * @param slot
 * @param io
 * @private
 */
eYo.Renderer.prototype.drawSlot_ = function (slot, io) {
  if (!slot) {
    return
  }
  var g = slot.svg && slot.svg.group_
  goog.asserts.assert(g, 'Slot with no root', io.block.type, slot.key)
  if (slot.isIncog()) {
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
eYo.Renderer.prototype.drawSharp_ = function (io) {
  if (this.node.isControl) { // Not very clean, used as hook before rendering the comment fields.
    io.cursor.c += 4
  } else if (this.node.isStmt) {
    if (io.block.disabled) {
      var children = goog.dom.getChildren(this.groupSharp_)
      var length = children.length
      if (!length) {
        var y = eYo.Font.totalAscent
        var text = Blockly.utils.createSvgElement('text',
          {'x': 0, 'y': y},
          this.groupSharp_)
        this.groupSharp_.appendChild(text)
        text.appendChild(document.createTextNode('#'))
        length = 1
      }
      var expected = io.block.eyo.getStatementCount()
      while (length < expected) {
        y = eYo.Font.totalAscent + length * eYo.Font.lineHeight
        text = Blockly.utils.createSvgElement('text',
          {'x': 0, 'y': y},
          this.groupSharp_)
        this.groupSharp_.appendChild(text)
        text.appendChild(document.createTextNode('#'))
        ++length
      }
      while (length > expected) {
        text = children[--length]
        this.groupSharp_.removeChild(text)
      }
      this.groupSharp_.setAttribute('transform', 'translate(' + (io.cursor.x) +
          ', ' + eYo.Padding.t + ')')
      io.cursor.c += 2
      io.common.startOfLine = io.common.startOfStatement = false
    } else {
      goog.dom.removeChildren(this.groupSharp_)
    }
  }
}

/**
 * Render one input of value block.
 * @param io
 * @private
 */
eYo.Renderer.prototype.drawInput_ = function (io) {
  return this.drawValueInput_(io)
}
console.error('Move to the driver')
/**
 * Render the given field, when defined.
 *
 * @param {!Object} field A field.
 * @param {!Object} io An input/output recorder.
 * @private
 */
eYo.Renderer.prototype.drawField_ = function (field, io) {
  var c = io.cursor.c
  if (!field.isVisible()) {
    this.fieldSetVisible(false)
  } else {
    this.fieldSetVisible(true)
    // Actually, io.cursor points to the location where the field
    // is expected. It is relative to the enclosing `SVG` group,
    // which is either a block or a slot.
    // If there is a pending caret, draw it and advance the cursor.
    var f_eyo = field.eyo
    io.forc = f_eyo
    f_eyo.willRender()
    var text = field.getDisplayText_()
    // Replace the text.
    this.fieldTextErase(field)
    f_eyo.size.set(text.length, 1)
    field.updateWidth()
    if (text.length) {
      if (text === '>') {
        console.error(io)
      }
      this.drawEnding_(io)
      this.drawPending_(io)
      io.common.startOfLine = io.common.startOfStatement = false
      ++ io.n
      this.fieldTextDisplay(field)
      var head = text[0]
      var tail = text[text.length - 1]
      if (f_eyo.model.literal) {
        io.common.field.didPack = 0
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
      root.setAttribute('transform',
        `translate(${io.cursor.x}, ${(io.cursor.y + eYo.Padding.t)})`)
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
eYo.Renderer.prototype.fieldDrawFrom_ = function (field, io) {
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
eYo.Renderer.prototype.drawFields_ = function (io, only_prefix) {
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
eYo.Renderer.prototype.drawEnding_ = function (io, isLast = false, inStatement = false) {
  if (io) {
    var isLastInExpression = isLast && !inStatement
    var isLastInStatement = isLast && inStatement
    if (io.common.ending.length) {
      // should we shrink after a quote or a bracket?
      if (io.common.shouldPack && (!isLast || io.common.shouldPack.wrapped_)) {
        // first loop to see if there is a pending rightCaret
        // BTW, there can be an only one right caret
        if (io.common.ending.some(eyo => !!eyo.renderer.rightCaret)) {
          io.common.shouldPack = undefined
        } else {
          // there is no following right caret, we can pack
          var pack = false
          io.common.ending.forEach((eyo) => {
            if (eyo === io.common.shouldPack) {
              io.common.shouldPack = undefined
              pack = true
              io.cursor.c -= 1
              // from now on, we pack just one character width
            }
            if (pack) {
              eyo.size.c = Math.max(this.minBlockW, eyo.size.c - 1)
              eyo.minWidth = eyo.block_.width = eyo.size.x
              io.common.field.didPack = true
              io.common.field.beforeIsBlack = true
            }
          })
        }
      }
      io.common.ending.forEach((eyo) => {
        eyo.renderer.mayBeLast = false
        eyo.renderer.isLastInExpression = isLastInExpression
        eyo.renderer.isLastInStatement = isLastInStatement
      })
      io.common.ending.forEach((eyo) => {
        eyo.updateShape()
        var c_eyo = eyo.renderer.rightCaret
        if (c_eyo) {
          c_eyo.side = eYo.Key.RIGHT
          c_eyo.shape = eYo.Key.NONE
          c_eyo.isLastInStatement = isLastInStatement
          var d = eYo.Shape.definitionWithConnectionDlgt(c_eyo) // depends on the shape and the side
          var block = c_eyo.sourceBlock_
          if (io.block === block) {
            // we are lucky, this.node is the block we are currently rendering
            io.steps.push(d)
          } else {
            // bad luck, block has already been rendered
            // we must append the definition to the path
            // this.node may happen for blocks with no left or right end,
            // eg locked or wrapped blocks.
            var path = block.eyo.pathInner_
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
console.error('BUG: io.isLastInStatement below is always undefined')
eYo.Renderer.prototype.drawPending_ = function (io, side = eYo.Key.NONE, shape = eYo.Key.NONE) {
  if (io) {
    var c_eyo = io.common.pending
    if (c_eyo) {
      c_eyo.side = side
      c_eyo.shape = io.isLastInStatement ? eYo.Key.Right : shape
      var shp = eYo.Shape.newWithConnectionDlgt(c_eyo)
      var block = c_eyo.sourceBlock_
      if (io.block === block) {
        // we are lucky, this.node is the block we are currently rendering
        io.steps.push(shp.definition)
      } else {
        // bad luck, block has already been rendered
        // we must append the definition to the path
        // this.node may happen for blocks with no left or right end,
        // eg locked or wrapped blocks.
        var path = block.eyo.pathInner_
        path.setAttribute('d', `${path.getAttribute('d')} ${shp.definition}`)
      }
      if (shp.width) {
        // should we advance the cursor?
        if (c_eyo.side === eYo.Key.NONE) {
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
 * Render the suite block, if relevant.
 * @param {!Object} io the input/output argument.
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.Renderer.prototype.drawInputRight_ = function (io) {
  // adding a ';' or not.
  var c8n = this.rightStmtConnection
  if (c8n) {
    this.fieldDrawFrom_(io.input.eyo.fieldAtStart, io)
    c8n.eyo.setOffset(io.cursor)
  }
}

/**
 * Render the fields of a value input, if relevant.
 * @param {!Object} io the input/output argument.
 * @private
 */
eYo.Renderer.prototype.drawValueInput_ = function (io) {
  if (io.input.type !== Blockly.INPUT_VALUE && io.input.type !== Blockly.DUMMY_INPUT) {
    return false
  }
  // this.node is one of the reasons why we allways render from the start of a statement
  io.input.eyo.inputRight = undefined
  io.input.eyo.inputLeft = io.common.inputDone
  if (io.common.inputDone) {
    io.common.inputDone.eyo.inputRight = io.input
  } else {
    io.block.eyo.firstRenderedInput = io.input
  }
  io.common.inputDone = io.input
  this.drawFields_(io, true)
  var c8n = io.input.connection
  if (c8n) { // once `&&!c8n.hidden_` was there, bad idea, but why was it here?
    ++ io.n
    var c_eyo = c8n.eyo
    c_eyo.startOfLine = io.common.startOfLine
    c_eyo.startOfStatement = io.common.startOfStatement
    io.forc = c_eyo
    c_eyo.side = c_eyo.shape = undefined
    io.common.field.canStarLike = false
    // io.cursor is relative to the block or the slot
    // but the connection must be located relative to the block
    // the connection delegate will take care of that because it knows
    // if there is a slot or only an input.
    var target = c8n.targetBlock()
    if (target) {
      if (c_eyo.bindField && c_eyo.bindField.isVisible()) {
        c_eyo.setOffset(io.cursor.c - c_eyo.w, io.cursor.l)
        // The `bind` field hides the connection.
        // The bind field is always the last field before the connection.
        // if the connection has a bindField, then rendering the placeholder
        // for that connection is a bit different.
        // Don't display anything for that connection
        io.common.field.beforeIsCaret = false
      }
      var root = target.getSvgRoot()
      if (root) {
        var t_eyo = target.eyo
        try {
          t_eyo.renderer.startOfLine = io.common.startOfLine
          t_eyo.renderer.startOfStatement = io.common.startOfStatement
          t_eyo.renderer.mayBeLast = t_eyo.renderer.hasRightEdge
          t_eyo.renderer.down = true
          if (eYo.Renderer.debugStartTrackingRender) {
            console.log(eYo.Renderer.debugPrefix, 'DOWN')
          }
          if (t_eyo.wrapped_) {
            // force target rendering
            t_eyo.incrementChangeCount()
          }
          c_eyo.setOffset(io.cursor)
          if (c_eyo.c === 1 && !io.common.field.beforeIsBlack && c_eyo.slot) {
            c_eyo.slot.where.c -= 1
            c_eyo.setOffset(io.cursor)
            if (io.input.eyo.inputLeft && io.input.eyo.inputLeft.connection.eyo.startOfLine) {
              t_eyo.renderer.startOfLine = t_eyo.renderer.startOfStatement = io.common.startOfLine = io.common.startOfStatement = true
          
            }
          }
          if (io.block.outputConnection !== eYo.Connection.disconnectedChildC8n && !t_eyo.renderer.up) {
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
          t_eyo.renderer.down = false
          var size = t_eyo.size
          if (size.w) {
            io.cursor.advance(size.w, size.h - 1)
            // We just rendered a block
            // it is potentially the rightmost object inside its parent.
            if (t_eyo.renderer.hasRightEdge || io.common.shouldPack) {
              io.common.ending.push(t_eyo)
              t_eyo.renderer.rightCaret = undefined
              io.common.field.shouldSeparate = false
            }
            io.common.field.beforeIsCaret = false
          }
        }
      }
    } else {
      if (c_eyo.targetIsMissing) {
        this.someTargetIsMissing = true
      }  
      if (c_eyo.bindField && c_eyo.bindField.isVisible()) {
        c_eyo.setOffset(io.cursor.c - c_eyo.w, io.cursor.l)
        // The `bind` field hides the connection.
        // The bind field is always the last field before the connection.
        // if the connection has a bindField, then rendering the placeholder
        // for that connection is a bit different.
        // Don't display anything for that connection
        io.common.field.beforeIsCaret = false
      } else if (!this.node.locked_ && !c8n.hidden_) {
        // locked blocks won't display any placeholder
        // (input with no target)
        if (!c_eyo.disabled_) {
          c_eyo.setOffset(io.cursor)
          c_eyo.startOfLine = io.common.startOfLine
          c_eyo.startOfStatement = io.common.startOfStatement
          if (c_eyo.s7r_) {
            c_eyo.side = eYo.Key.NONE
            var ending = io.common.ending.slice(-1)[0]
            if (ending && !ending.renderer.rightCaret) {
              // an expression block with a right end has been rendered
              // we put the caret on that end to save space,
              // we move the connection one character to the left
              io.cursor.c -= 1
              c_eyo.setOffset(io.cursor)
              io.cursor.c += 1
              ending.renderer.rightCaret = c_eyo
              c_eyo.isAfterRightEdge = io.beforeIsRightEdge
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
              io.common.pending = c_eyo
            }
            io.common.field.shouldSeparate = false
          } else if (c_eyo.optional_) {
            this.drawPending_(io)
            io.common.pending = c_eyo
          } else {
            this.drawPending_(io)
            if (c_eyo.c === 1) {
              if (c_eyo.slot) {
                c_eyo.slot.where.c -= 1
              } else {
                io.cursor.c = c_eyo.where.c = 0
              }
              c_eyo.setOffset(io.cursor)
            }
            var shape = eYo.Shape.newWithConnectionDlgt(c_eyo)
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
 * The default implementation forwards to the driver.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.Renderer.prototype.parentWillChange = function (newParent) {
  this.driver.parentWillChange(this.node_, newParent)
}

/**
 * Set the display status of the receiver's node.
 * Forwards to the driver.
 * @param {boolean} visible 
 * @private
 */
eYo.Renderer.prototype.setVisible = function (node, visible) {
  this.driver.nodeSetVisible(this.node_, visible)
}

/**
 * Prepare the given slot.
 * Forwards to the driver.
 * @param {!eYo.Slot} slot  slot to be prepared.
 */
eYo.Renderer.prototype.slotPrepare = function (slot) {
  this.driver.slotPrepare(slot)
}

/**
 * Dispose of the given slot's rendering resources.
 * Forwards to the driver.
 * @param {eYo.Slot} slot
 */
eYo.Renderer.prototype.slotDispose = function (slot) {
  this.driver.slotDispose(slot)
}

/**
 * Prepare the given label field.
 * Forwards to the driver.
 * @param {!eYo.FieldLabel} field  field to be prepared.
 */
eYo.Renderer.prototype.fieldInit = function (field) {
  this.driver.fieldInit(field)
}

/**
 * Prepare the given label field.
 * Forwards to the driver.
 * @param {!eYo.FieldLabel} field  field to be prepared.
 */
eYo.Renderer.prototype.fieldDispose = function (field) {
  this.driver.fieldDispose(field)
}

/**
 * Make the given field error.
 * The default implementation forwards to the driver.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Renderer.prototype.fieldMakeError = function (field, yorn) {
  this.driver.fieldMakeError(field, yorn)
}

/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * The default implementation forwards to the driver.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Renderer.prototype.fieldMakeReserved = function (field, yorn) {
  this.driver.fieldMakeReserved(field, yorn)
}

/**
 * Make the given field a placeholder or not.
 * The default implementation forwards to the driver.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Renderer.prototype.fieldMakePlaceholder = function (field, yorn) {
  this.driver.fieldMakePlaceholder(field, yorn)
}

/**
 * Make the given field a comment or not.
 * The default implementation forwards to the driver.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Renderer.prototype.fieldMakeComment = function (field, yorn) {
  this.driver.fieldMakeComment(field, yorn)
}

/**
 * Set the visual effects of the field.
 * Forwards to the driver.
 * @param {*} field
 */
eYo.Renderer.prototype.fieldSetVisualAttribute = function (field) {
  this.driver.fieldSetVisualAttribute(field)
}

/**
 * Update the field editor.
 * Forwards to the driver.
 * @param {*} field
 * @param {boolean} quietInput
 */
eYo.Renderer.prototype.fieldEditorInlineShow = function (field, quietInput) {
  this.driver.fieldEditorInlineShow(field, quietInput)
}

/**
 * Update the field editor.
 * Forwards to the driver.
 * @param {*} field
 */
eYo.Renderer.prototype.fieldEditorInlineUpdate = function (field) {
  this.driver.fieldEditorInlineUpdate(field)
}

/**
 * Callback at widget disposal.
 * Forwards to the driver.
 * @param {*} field
 */
eYo.Renderer.prototype.fieldWidgetDisposeCallback = function (field) {
  this.driver.fieldWidgetDisposeCallback(field)
}

/**
 * The default implementation forwards to the driver.
 */
eYo.Renderer.prototype.updateDisabled = function () {
  this.driver.updateDisabled(this.node_)
}

/**
 * The default implementation forwards to the driver.
 */
eYo.Renderer.prototype.connectionUIEffect = function () {
  this.driver.connectionUIEffect(this.node_)
}

/**
 * Show the given menu.
 * The default implementation forwards to the driver.
 */
eYo.Renderer.prototype.showMenu = function (menu) {
  this.driver.showMenu(menu)
}

/**
 * Hilight the given connection.
 * The default implementation forwards to the driver.
 * @param {*} c_eyo
 */
eYo.Renderer.prototype.highlightConnection = function (c_eyo) {
  this.driver.highlightConnection(c_eyo)
}

/**
 * Make the given block wrapped.
 * The default implementation forwards to the driver.
 */
eYo.Renderer.prototype.makeBlockWrapped = function () {
  this.driver.makeBlockWrapped(this.node_)
}

/**
 * The default implementation forwards to the driver.
 */
eYo.Renderer.prototype.duringBlockUnwrapped = function () {
  this.driver.duringBlockUnwrapped(this.node_)
}

/**
 * The default implementation forwards to the driver.
 */
eYo.Renderer.prototype.sendToFront = function () {
  this.driver.sendToFront(this.node_)
}

/**
 * The default implementation forwards to the driver.
 */
eYo.Renderer.prototype.sendToBack = function () {
  this.driver.sendToFront(this.node_)
}

/**
 * Set the offset of the receiver's node.
 * NOT YET USED. OVERRIDEN BELOW.
 * For edython.
 * @param {*} dc
 * @param {*} dl
 * @return {boolean}
 */
eYo.Renderer.prototype.setOffset = function (dc, dl) {
  // Workspace coordinates.
  if (!this.driver.canDraw(this.node)) {
    throw `block is not inited ${this.node.type}`
  }
  var dx = dc * eYo.Unit.x
  var dy = dl * eYo.Unit.y
  this.driver.setOffset(dx, dy)
  this.moveConnections_(dx, dy)
}

/**
 * Set the offset of the receiver's node.
 * For edython.
 * @param {*} dx 
 * @param {*} dy 
 * @return {boolean}
 */
eYo.Renderer.prototype.setOffset = function (dx, dy) {
  if (!this.driver.canDraw(this.node)) {
    throw `block is not inited ${this.node.type}`
  }
  this.driver.setOffset(dx, dy)
  this.moveConnections_(dx, dy)
}

/**
 * Move the connections to follow a translation of the block.
 * @param {Number} dx
 * @param {Number} dy
 * @private
 */
eYo.Renderer.prototype.moveConnections_ = function (dx, dy) {
  this.node.block_.moveConnections_(dx, dy)
}

//////////////////

/**
 * Called when the parent did just change.
 * Side effect, if the child block has been `Svg` inited
 * then the parent block will be, really ?
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.Renderer.prototype.parentDidChange = function (newParent) {
  this.driver.parentDidChange(this.node_, newParent)
}

/**
 * Add the hilight path_.
 * Forwards to the driver.
 */
eYo.Renderer.prototype.addBlockHilight_ = function () {
  this.driver.addBlockHilight_(this.node_)
}

/**
 * Remove the hilight path.
 * Forwards to the driver.
 */
eYo.Renderer.prototype.removeBlockHilight_ =function () {
  this.driver.removeBlockHilight_(this.node_)
}

/**
 * Add the select path.
 * Forwards to the driver.
 */
eYo.Renderer.prototype.addBlockSelect_ = function () {
  this.driver.addBlockSelect_(this.node_)
}

/**
 * Remove the select path.
 * Forwards to the driver.
 */
eYo.Renderer.prototype.removeBlockSelect_ = function () {
  this.driver.removeBlockSelect_(this.node_)
}

/**
 * Add the hilight connection path_.
 * Forwards to the driver.
 */
eYo.Renderer.prototype.addBlockConnection_ = function () {
  this.driver.addBlockConnection_(this.node_)
}

/**
 * Remove the select path.
 * Forwards to the driver.
 */
eYo.Renderer.prototype.removeBlockConnection_ = function () {
  this.driver.removeBlockConnection_(this.node_)
}

/**
 * Forwards to the driver.
 */
eYo.Renderer.prototype.addStatusTop_ = function () {
  this.driver.addStatusTop_(this.node_)
}


/**
 * Remove the `top` status.
 * Forwards to the driver.
 */
eYo.Renderer.prototype.removeStatusTop_ = function (eyo) {
  this.driver.removeStatusTop_(this.node_)
}

/**
 * Forwards to the driver and `addSelect` to each field.
 */
eYo.Renderer.prototype.addStatusSelect_ = function () {
  this.driver.addStatusSelect_(this.node_)
  eyo.forEachInput(input => {
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
eYo.Renderer.prototype.removeStatusSelect_ = function () {
  this.driver.removeStatusSelect_(this.node_)
  this.node.forEachInput(input => {
    input.fieldRow.forEach(field => {
      goog.isFunction(field.removeSelect) && field.removeSelect()
    })
  })
}

/**
 * Did connect some block's connection to another connection.
 * When connecting locked blocks, select the receiver.
 * @param {!Blockly.Connection} connection what has been connected in the block
 * @param {!Blockly.Connection} oldTargetC8n what was previously connected in the block
 * @param {!Blockly.Connection} targetOldC8n what was previously connected to the new targetConnection
 */
eYo.Renderer.didConnect = function (connection, oldTargetC8n, targetOldC8n) {
  if (connection.eyo.isOutput) {
    if (this === eYo.Selected.eyo && this.locked_) {
      eYo.Selected.eyo = connection.eyo.t_eyo
    }
    connection.eyo.renderer.removeStatusTop_()
  }
}

/**
 * Converse of the preceeding.
 * @param {!Blockly.Connection} connection what has been connected in the block
 * @param {!Blockly.Connection} oldTargetC8n what was previously connected in the block
 */
eYo.Renderer.didDisconnect = function (connection, oldTargetC8n) {
  if (connection.eyo.isOutput) {
    connection.eyo.renderer.addStatusTop_()
  }
}

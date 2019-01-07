/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg')
goog.provide('eYo.HoleFiller')
goog.provide('eYo.Selected')

goog.require('eYo.XRE')
goog.require('eYo.T3')
goog.require('eYo.Data')
goog.require('eYo.Slot')
goog.require('eYo.Shape')
goog.require('eYo.Where')
goog.require('eYo.Delegate')
goog.forwardDeclare('eYo.BlockSvg')
goog.forwardDeclare('eYo.DelegateSvg.Expr')
goog.forwardDeclare('eYo.DelegateSvg.Stmt')
goog.require('goog.dom')

/**
 * Class for a DelegateSvg.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.Delegate.makeSubclass('Svg')

// Mimic Blockly naming convention
eYo.DelegateSvg = eYo.Delegate.Svg

eYo.DelegateSvg.prototype.packedQuotes = true
eYo.DelegateSvg.prototype.packedBrackets = true

Object.defineProperties(
  eYo.DelegateSvg.prototype,
  {
    hasLeftEdge: {
      get () {
        return !this.wrapped_ && !this.locked_
      }
    },
    hasRightEdge: {
      get () {
        return !this.wrapped_ && !this.locked_
      }
    },
    isCollapsed: {
      get () {
        return this.block_.isCollapsed()
      }
    }
  }
)
/**
 * Ends a mutation
 * For edython.
 * @return {Number} change level
 */
eYo.DelegateSvg.prototype.changeEnd = function () {
  var yorn = eYo.DelegateSvg.superClass_.changeEnd.call(this)
  if (!yorn) {
    this.render()
  }
  return yorn
}

/**
 * Increment the change count.
 * Force to recompute the chain tile.
 * For edython.
* @param {*} deep  Whether to propagate the message to children.
  */
eYo.DelegateSvg.prototype.incrementChangeCount = function (deep) {
  // force to compute a new chain tile
  eYo.DelegateSvg.superClass_.incrementChangeCount.call(this, deep)
}

eYo.DelegateSvg.Manager = eYo.Delegate.Manager

/**
 * Method to register an expression or a statement block.
 * The delegate is searched as a DelegateSvg element
 */
eYo.DelegateSvg.Manager.register = function (key) {
  var prototypeName = eYo.T3.Expr[key]
  var delegateC9r, available
  if (prototypeName) {
    delegateC9r = eYo.DelegateSvg.Expr[key]
    available = eYo.T3.Expr.Available
  } else if ((prototypeName = eYo.T3.Stmt[key])) {
    // console.log('Registering statement', key)
    delegateC9r = eYo.DelegateSvg.Stmt[key]
    available = eYo.T3.Stmt.Available
  } else {
    throw new Error('Unknown block eYo.T3.Expr or eYo.T3.Stmt key: ' + key)
  }
  eYo.DelegateSvg.Manager.registerDelegate_(prototypeName, delegateC9r)
  available.push(prototypeName)
}

/**
 * This is the shape used to draw the outline of a block
 * @type {SVGPathElement}
 * @private
 */
eYo.DelegateSvg.prototype.svgPathShape_ = undefined

/**
 * This is the shape used to draw the background of a block
 * @type {SVGPathElement}
 * @private
 */
eYo.DelegateSvg.prototype.svgPathContour_ = undefined

/**
 * This is the shape used to draw a collapsed block.
 * Background or outline ?
 * @type {SVGPathElement}
 * @private
 */
eYo.DelegateSvg.prototype.svgPathCollapsed_ = undefined

/**
 * This is the shape used to draw a block...
 * @type {SVGPathElement}
 * @private
 */
eYo.DelegateSvg.prototype.svgPathInner_ = undefined

/**
 * This is the shape used to draw an highlighted block contour when selected.
 * @type {SVGPathElement}
 * @private
 */
eYo.DelegateSvg.prototype.svgPathSelect_ = undefined

/**
 * This is the shape used to draw an highlighted block contour when a parent is selected.
 * @type {SVGPathElement}
 * @private
 */
eYo.DelegateSvg.prototype.svgPathHilight_ = undefined

/**
 * This is the shape used to draw an highlighted connection contour. NOT ANY LONGER.
 * @type {SVGPathElement}
 * @private
 */
eYo.DelegateSvg.prototype.svgPathConnection_ = undefined

/**
 * When set, used to create an input value.
 * three inputs can be created on the fly.
 * The data is an object with following properties: first, middle, last
 * each value is an object with properties
 * - key, string uniquely identify the value input. When absent, a dummy input is created
 * - label, optional string
 * - wrap, optional, the type of the block wrapped by this input
 * - check, [an array of] strings, types to check the connections. When absent, replaced by `wrap` if any.
 * - optional, true/false whether the connection is optional, only when no wrap.
 */

/**
 * Create and initialize the various paths.
 * Called once at block creation time.
 * Should not be called directly
 * The block implementation is created according to a dictionary
 * input model available through `model.slots`.
 * The structure of that dictionary is detailled in the treatment flow
 * below.
 */
eYo.DelegateSvg.prototype.init = eYo.Decorate.reentrant_method(
  'initBlockSvg',
  function () {
    this.changeWrap(
      function () {
        this.size = new eYo.Size()
        eYo.DelegateSvg.superClass_.init.call(this)
        var block = this.block_
        block.setTooltip('')
        block.setHelpUrl('')
      }
    )
  }
)

console.warn('implement async and await, see above awaitable and asyncable')
/**
 * Revert operation of init.
 */
eYo.DelegateSvg.prototype.deinit = function () {
  goog.dom.removeNode(this.svgRoot_)
  this.svgRoot_ = undefined
  // just in case the path were not already removed as child or a removed parent
  goog.dom.removeNode(this.svgPathShape_)
  this.svgPathShape_ = undefined
  goog.dom.removeNode(this.svgPathContour_)
  this.svgPathContour_ = undefined
  goog.dom.removeNode(this.svgPathCollapsed_)
  this.svgPathCollapsed_ = undefined
  goog.dom.removeNode(this.svgPathInner_)
  this.svgPathInner_ = undefined
  goog.dom.removeNode(this.svgPathSelect_)
  this.svgPathSelect_ = undefined
  goog.dom.removeNode(this.svgPathHilight_)
  this.svgPathHilight_ = undefined
  goog.dom.removeNode(this.svgPathConnection_)
  this.svgPathConnection_ = undefined
  eYo.DelegateSvg.superClass_.deinit.call(this)
}

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 */
eYo.DelegateSvg.prototype.preInitSvg = function () {
}

/**
 * Create and initialize the SVG representation of the block.
 * Called by `initSvg`.
 * May be called more than once along with `initSvg`.
 * No rendering.
 */
eYo.DelegateSvg.prototype.postInitSvg = function () {
  if (this.svgPathContour_) {
    return
  }
  var block = this.block_
  // We still need those paths
  // goog.dom.removeNode(block.svgPath_)
  // delete block.svgPath_
  goog.dom.removeNode(block.svgPathLight_)
  delete block.svgPathLight_
  goog.dom.removeNode(block.svgPathDark_)
  delete block.svgPathDark_
  // this.svgRoot_ = block.svgGroup_
  // block.svgGroup_ = Blockly.utils.createSvgElement('g',
  //   {'class': 'eyo-root'}, null)
  // goog.dom.insertChildAt(this.svgRoot_, block.svgGroup_, 0)
  this.svgPathInner_ = Blockly.utils.createSvgElement('path', {
    'class': 'eyo-path-inner'
  }, null)
  this.svgPathCollapsed_ = Blockly.utils.createSvgElement('path', {
    'class': 'eyo-path-collapsed'
  }, null)
  this.svgPathContour_ = Blockly.utils.createSvgElement('path', {
    'class': 'eyo-path-contour'
  }, null)
  this.svgPathShape_ = Blockly.utils.createSvgElement('path', {
    'class': 'eyo-path-shape'
  }, null)
  this.svgPathSelect_ = Blockly.utils.createSvgElement('path', {
    'class': 'eyo-path-selected'
  }, null)
  this.svgPathHilight_ = Blockly.utils.createSvgElement('path', {
    'class': 'eyo-path-hilighted'
  }, null)
  this.svgPathConnection_ = Blockly.utils.createSvgElement('path', {
    'class': 'eyo-path-selected DEBUG'
  }, null)
  if (this.outputConnection && this.outputConnection.targetBlock()) {
    console.log('CREATING path while ALREADY connected')
  }
  this.svgContourGroup_ = Blockly.utils.createSvgElement('g',
    {'class': 'eyo-contour'}, null)
  goog.dom.appendChild(this.svgContourGroup_, this.svgPathInner_)
  goog.dom.appendChild(this.svgContourGroup_, this.svgPathCollapsed_)
  goog.dom.appendChild(this.svgContourGroup_, this.svgPathContour_)
  this.svgShapeGroup_ = Blockly.utils.createSvgElement('g',
    {'class': 'eyo-shape'}, null)
  goog.dom.appendChild(this.svgShapeGroup_, this.svgPathShape_)
  goog.dom.classlist.add(/** @type {!Element} */ (block.svgGroup_),
    'eyo-block')
  if (!block.workspace.options.readOnly && !this.eventsInit_) {
    Blockly.bindEventWithChecks_(
      block.getSvgRoot(), 'mousedown', block, block.onMouseDown_);
    Blockly.bindEventWithChecks_(
      block.getSvgRoot(), 'mouseup', block, block.onMouseUp_);
    // I could not achieve to use only one binding
    // With 2 bindings all the mouse events are catched,
    // but some, not all?, are catched twice.
    Blockly.bindEventWithChecks_(
      this.svgPathContour_, 'mousedown', block, block.onMouseDown_);
    Blockly.bindEventWithChecks_(
      this.svgPathContour_, 'mouseup', block, block.onMouseUp_);
    }
  this.eventsInit_ = true
}

/**
 * Called when the parent will just change.
 * This code is responsible to place the various path
 * in the proper domain of the dom tree.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.DelegateSvg.prototype.parentWillChange = function (newParent) {
  var block = this.block_
  if (block.parentBlock_) {
    // this block was connected, so its paths were located in the parents
    // groups.
    // First step, remove the relationship between the receiver
    // and the old parent, then link the receiver with the new parent.
    // this second step is performed in the `parentDidChange` method.
    var svgRoot = block.getSvgRoot()
    if (svgRoot) {
      // Move this block up the DOM.  Keep track of x/y translations.
      var xy = block.getRelativeToSurfaceXY()
      block.workspace.getCanvas().appendChild(svgRoot)
      svgRoot.setAttribute('transform', 'translate(' + xy.x + ',' + xy.y + ')')
      if (this.svgContourGroup_) {
        goog.dom.insertChildAt(svgRoot, this.svgContourGroup_, 0)
        this.svgContourGroup_.removeAttribute('transform')
        goog.dom.classlist.remove(/** @type {!Element} */(this.svgContourGroup_),
          'eyo-inner')
        goog.dom.insertSiblingBefore(this.svgShapeGroup_, this.svgContourGroup_)
        this.svgShapeGroup_.removeAttribute('transform')
        goog.dom.classlist.remove(/** @type {!Element} */(this.svgShapeGroup_),
          'eyo-inner')
      }
    }
  }
}

/**
 * Whether the contour of the receiver is above or below
 * the parent's one.
 * Suitable for statements.
 * Subclassed for expressions
 */
eYo.DelegateSvg.prototype.contourAboveParent = true

/**
 * Called when the parent did just change.
 * Side effect, if the chid block has been `Svg` inited
 * then the parent block will be.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.DelegateSvg.prototype.parentDidChange = function (newParent) {
  // This is the original code found in
  // `Blockly.BlockSvg.prototype.setParent`
  if (newParent) {
    var block = this.block_
    var svgRoot = block.getSvgRoot()
    var oldXY = block.getRelativeToSurfaceXY()
    newParent.getSvgRoot().appendChild(svgRoot)
    var newXY = block.getRelativeToSurfaceXY()
    // Move the connections to match the child's new position.
    block.moveConnections_(newXY.x - oldXY.x, newXY.y - oldXY.y)
    if (this.svgContourGroup_ && newParent.eyo.svgContourGroup_) {
      if (this.contourAboveParent) {
        goog.dom.appendChild(newParent.eyo.svgContourGroup_,
          this.svgContourGroup_)
      } else {
        goog.dom.insertChildAt(newParent.eyo.svgContourGroup_,
          this.svgContourGroup_, 0)
      }
      goog.dom.appendChild(newParent.eyo.svgShapeGroup_,
        this.svgShapeGroup_)
      goog.dom.classlist.add(/** @type {!Element} */(this.svgContourGroup_),
        'eyo-inner')
      goog.dom.classlist.add(/** @type {!Element} */(this.svgShapeGroup_),
        'eyo-inner')
    }
  }
}

/**
 * Insert the svg root of the head slot in the svg group of the receiver
 * at the exact location where it belongs.
 */
eYo.DelegateSvg.prototype.svgInsertHeadSlot = function () {
  if (this.headSlot) {
    goog.dom.appendChild(this.block_.getSvgRoot(), this.headSlot.getSvgRoot())
  }
}

/**
 * Returns the named field from a block.
 * Only fields that do not belong to an input are searched for.
 * @param {string} name The name of the field.
 * @return {Blockly.Field} Named field, or null if field does not exist.
 */
eYo.DelegateSvg.prototype.getField = function (name) {
  var fields = this.fields
  for (var key in fields) {
    var field = fields[key]
    if (field.name === name) {
      return field
    }
  }
  var slot
  if ((slot = this.headSlot)) {
    do {
      var fields = slot.fields
      for (var key in fields) {
        var field = fields[key]
        if (field.name === name) {
          return field
        }
      }
    } while ((slot = slot.next))
  }
  return null
}

/**
 * When the block is just a wrapper, returns the wrapped target.
 */
eYo.DelegateSvg.prototype.getMenuTarget = function () {
  var wrapped
  if (this.wrap && (wrapped = this.wrap.input.connection.targetBlock())) {
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

/**
 * Render the given connection, if relevant.
 * @param {*} recorder 
 * @param {*} c8n 
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.DelegateSvg.prototype.renderDrawC8n_ = function (recorder, c8n) {
  if (!c8n) {
    return
  }
  var target = c8n.targetBlock()
  if (!target) {
    return
  }
  if (c8n.eyo.isNextLike) {
    c8n.tighten_()
  }
  var do_it = !target.rendered ||
  (!this.upRendering &&
    !eYo.Connection.disconnectedParentC8n &&
    !eYo.Connection.disconnectedChildC8n&&
    !eYo.Connection.connectedParentC8n)
  if (do_it) {
    try {
      target.eyo.downRendering = true
      target.eyo.render(false, recorder)
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      target.eyo.downRendering = false
    }
    return true
  }
}

eYo.DelegateSvg.debugPrefix = ''
eYo.DelegateSvg.debugCount = {}

/**
 * Render the next block, if relevant.
 * @param {*} recorder
 * @return {boolean=} true if an rendering message was sent, false othrwise.
 */
eYo.DelegateSvg.prototype.renderDrawNext_ = function (recorder) {
  if (this.nextConnection && eYo.DelegateSvg.debugStartTrackingRender) {
    console.log(eYo.DelegateSvg.debugPrefix, 'NEXT')
  }
  return this.renderDrawC8n_(recorder, this.nextConnection)
}

/**
 * Render the suite block, if relevant.
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.DelegateSvg.prototype.renderSuite_ = function () {
  return
}

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {*} recorder
 * @param {boolean=} optBubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
// deleted blocks are rendered during deletion
// this should be avoided
eYo.DelegateSvg.prototype.render = (() => {
  // this is a closure
  /**
   * Render the parent block, if relevant.
   * @param {Object} recorder  A recorder object.
   * @param {boolean=} optBubble If false, just render this block.
   *   If true, also render block's parent, grandparent, etc.  Defaults to true.
   * @return {boolean=} true if an rendering message was sent, false otherwise.
   */
  var renderDrawParent = function (recorder, optBubble) {
    if (optBubble === false || this.downRendering) {
      return
    }
    // Render all blocks above this one (propagate a reflow).
    // Only when the render message did not come from above!
    var block = this.block_
    var parent = block.getParent()
    if (parent) {
      var justConnected = eYo.Connection.connectedParentC8n && block.outputConnection === eYo.Connection.connectedParentC8n.targetConnection
      if (!parent.eyo.downRendering) {
        try {
          parent.eyo.upRendering = true
          var old = this.upRendering
          this.upRendering = true
          if (eYo.DelegateSvg.debugStartTrackingRender) {
            console.log(eYo.DelegateSvg.debugPrefix, 'UP')
          }
          parent.eyo.render(!justConnected, recorder)
        } catch (err) {
          console.error(err)
          throw err
        } finally {
          parent.eyo.upRendering = false
          this.upRendering = old
        }
        if (justConnected) {
          if (parent.getParent()) {
            parent = parent.getRootBlock()
            try {
              parent.eyo.upRendering = true
              if (eYo.DelegateSvg.debugStartTrackingRender) {
                console.log(eYo.DelegateSvg.debugPrefix, 'UP')
              }
              parent.eyo.render(false, recorder)
            } catch (err) {
              console.error(err)
              throw err
            } finally {
              parent.eyo.upRendering = false
            }
          }
        }
        return true
      }
    } else {
      // Top-most block.  Fire an event to allow scrollbars to resize.
      block.workspace.resizeContents()
    }
  }
  var longRender = eYo.Decorate.reentrant_method(
    'longRender',
    function (optBubble, recorder) {
      if (eYo.DelegateSvg.debugStartTrackingRender) {
        var n = eYo.DelegateSvg.debugCount[block.id]
        eYo.DelegateSvg.debugCount[block.id] = (n||0)+1
        if (!eYo.DelegateSvg.debugPrefix.length) {
          console.log('>>>>>>>>>>')
        }
        eYo.DelegateSvg.debugPrefix = eYo.DelegateSvg.debugPrefix + '.'
        console.log(eYo.DelegateSvg.debugPrefix, block.type, n, block.id)
        if (n > 1) {
          n = n + 0
        }
      }
      try {
        Blockly.Field.startCache()
        var block = this.block_
        this.minWidth = block.width = 0
        this.consolidate()
        this.willRender_(recorder)
        var io = this.renderDraw_(recorder)
        this.layoutConnections_(io)
        this.renderDrawNext_(io)
        this.renderMove_(io)
        this.updateAllPaths_()
        renderDrawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
        block.rendered = true
        this.didRender_(io)
        if (eYo.traceOutputConnection && block.outputConnection) {
          console.log('block.outputConnection', block.outputConnection.x_, block.outputConnection.y_)
        }
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        Blockly.Field.stopCache()  
        if (eYo.DelegateSvg.debugStartTrackingRender &&  eYo.DelegateSvg.debugPrefix.length) {
          eYo.DelegateSvg.debugPrefix = eYo.DelegateSvg.debugPrefix.substring(1)
        }
      }    
    }
  )
  return function (optBubble, recorder) {
    if (!this.isReady) {
      return
    }
    var block = this.block_
    if (!this.isEditing && (this.isDragging_ || this.change.level || !this.workspace)) {
      return
    }
    recorder && this.renderDrawPending_(recorder, !this.wrapped_ && eYo.Key.LEFT)
    // rendering is very special when this is just a matter of
    // statement connection
    if (block.rendered) {
      if (eYo.Connection.disconnectedChildC8n && this.previousConnection === eYo.Connection.disconnectedChildC8n) {
        // this block is the top one
        var io = this.willShortRender_(recorder)
        this.layoutConnections_(io)
        this.renderDrawNext_(io)
        this.renderMove_(io)
        this.updateAllPaths_()
        this.change.save.render = this.change.count
        renderDrawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
        return
      } else if (eYo.Connection.disconnectedParentC8n && this.nextConnection === eYo.Connection.disconnectedParentC8n) {
        // this block is the bottom one
        // but it may belong to a suite
        var io = this.willShortRender_(recorder)
        this.layoutConnections_(io)
        this.renderDrawNext_(io)
        this.renderMove_(io)
        this.updateAllPaths_()
        this.change.save.render = this.change.count
        renderDrawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
        return
      } else if (eYo.Connection.connectedParentC8n) {
        if (this.outputConnection && eYo.Connection.connectedParentC8n === this.outputConnection.targetConnection) {
          // this is not a statement connection
          // no shortcut
        } else if (this.previousConnection && eYo.Connection.connectedParentC8n === this.previousConnection.targetConnection) {
          var io = this.willShortRender_(recorder)
          this.layoutConnections_(io)
          this.renderDrawNext_(io)
          this.renderMove_(io)
          this.updateAllPaths_()
          this.change.save.render = this.change.count
          renderDrawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
          } else if (this.nextConnection && eYo.Connection.connectedParentC8n === this.nextConnection) {
          var io = this.willShortRender_(recorder)
          this.layoutConnections_(io)
          this.renderDrawNext_(io)
          this.renderMove_(io)
          this.updateAllPaths_()
          this.change.save.render = this.change.count
          renderDrawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
          }
      }
    }
    if (!this.downRendering && this.outputConnection) {
      // always render from a line start id est
      // an orphan block or a statement block
      var parent
      if ((parent = this.parent)) {
        var next
        while (parent.outputConnection && (next = parent.parent)) {
          parent = next
        }
        // parent has no output connection
        // which means that it is an expression block's delegate.
        recorder && (recorder.field.last = undefined)
        if (!parent.downRendering) {
          if (!parent.upRendering && this.outputConnection === eYo.Connection.connectedParentC8n || eYo.Connection.connectedParentC8n && eYo.Connection.connectedParentC8n.eyo.b_eyo === this) {
            try {
              parent.upRendering = true
              parent.render(optBubble, recorder)
            } catch (err) {
              console.error(err)
              throw err
            } finally {
              parent.upRendering = false
            }
          } else {
            parent.render(optBubble, recorder)
          }
        }
        return
      }
    }
    if (this.change.save.render === this.change.count) {
      // minimal rendering
      var io = this.willShortRender_(recorder)
      this.layoutConnections_(io)
      this.renderDrawNext_(io)
      this.renderMove_(io)
      this.updateAllPaths_()
      renderDrawParent.call(this, io, optBubble) || this.alignRightEdges_(io)
      return
    }
    longRender.call(this, optBubble, recorder)
    this.alignRightEdges_(io)
    this.change.save.render = this.change.count
  }
}) ()

/**
 * Whether the block is sealed to its parent.
 * The sealed status is decided at init time.
 * The corresponding input.eyo.connection.wrapped_ is set to true.
 * @private
 */
eYo.DelegateSvg.prototype.wrapped_ = undefined

/**
 * Will draw the block, short version.
 * The print statement needs some preparation before drawing.
 * @param {*} recorder
 * @private
 */
eYo.DelegateSvg.prototype.willShortRender_ = function (recorder) {
  if (this.inputSuite) {
    this.size.h = this.headCount + this.blackCount + this.suiteCount
  }
  return this.newDrawRecorder(recorder)
}

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {*} recorder
 * @private
 */
eYo.DelegateSvg.prototype.willRender_ = function (recorder) {
  var block = this.block_
  if (block.svgGroup_) {
    var F = this.locked_ && block.outputConnection && block.getSurroundParent()
      ? goog.dom.classlist.add
      : goog.dom.classlist.remove
    var FF = (elt, classname) => {
      if (/** @type {!Element} */(elt)) {
        F(elt, classname)
      }
    }
    FF(block.svgGroup_, 'eyo-locked')
    FF(this.svgPathShape_, 'eyo-locked')
    FF(this.svgPathContour_, 'eyo-locked')
    FF(this.svgPathCollapsed_, 'eyo-locked')
    FF(this.svgPathSelect_, 'eyo-locked')
    FF(this.svgPathHilight_, 'eyo-locked')
    // change the class of the shape on error
    F = Object.keys(this.errors).length
      ? goog.dom.classlist.add
      : goog.dom.classlist.remove
    FF(this.svgPathShape_, 'eyo-error')
    FF(this.svgPathContour_, 'eyo-error')
    FF(this.svgPathCollapsed_, 'eyo-error')
    FF(this.svgPathSelect_, 'eyo-error')
    FF(this.svgPathHilight_, 'eyo-error')
  }
}

/**
 * Did draw the block. Default implementation does nothing.
 * @param {*} recorder
 * @private
 */
eYo.DelegateSvg.prototype.didRender_ = function (recorder) {
}

/**
 * Layout previous, next and output block connections.
 * @param {*} recorder
 * @private
 */
eYo.DelegateSvg.prototype.renderMove_ = function (recorder) {
  var block = this.block_
  block.renderMoveConnections_()
  // var blockTL = block.getRelativeToSurfaceXY()
  // this.forEachSlot((slot) => {
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
eYo.DelegateSvg.prototype.layoutConnections_ = function (recorder) {
  var c8n = this.outputConnection
  if (c8n) {
    c8n.eyo.setOffset()
  } else {
    c8n = this.previousConnection
    if (c8n) {
      c8n.eyo.setOffset()
    }
    c8n = this.nextConnection
    if (c8n) {
      if (this.isCollapsed) {
        c8n.eyo.setOffset(0, 2)
      } else {
        c8n.eyo.setOffset(0, this.size.h)
      }
    }
  }
}

/**
 * Block shape. Default implementation throws.
 * Subclasses must override it. Used in renderDraw_.
 * @private
 */
eYo.DelegateSvg.prototype.shapePathDef_ = function () {
  goog.asserts.assert(false, 'shapePathDef_ must be overriden by ' + this)
}

/**
 * Block outline. Default implementation forwards to shapePathDef_.
 * @private
 */
eYo.DelegateSvg.prototype.contourPathDef_ = eYo.DelegateSvg.prototype.shapePathDef_

/**
 * Highlighted block outline. Default implementation forwards to shapePathDef_.
 * @private
 */
eYo.DelegateSvg.prototype.selectPathDef_ = eYo.DelegateSvg.prototype.shapePathDef_

/**
 * Highlighted block outline. Default implementation does nothing.
 * @private
 */
eYo.DelegateSvg.prototype.hilightPathDef_ = undefined

/**
 * Highlighted connection outline.
 * When a block is selected and one of its connection is also selected
 * the ui displays a bold line on the connection. When the block has wrapped input,
 * the selected connection may belong to a wrapped block.
 * @private
 */
eYo.DelegateSvg.prototype.connectionPathDef_ = function () {
  return this.selectedConnection
    ? this.selectedConnection.eyo.highlightPathDef()
    : ''
}

/**
 * Extra disabled block outline. Default implementation return a void string.
 * @private
 */
eYo.DelegateSvg.prototype.collapsedPathDef_ = function () {
  return ''
}

/**
 * Draw the path of the block.
 * @param {*} recorder
 * @private
 */
eYo.DelegateSvg.prototype.renderDraw_ = function (recorder) {
  if (this.svgPathInner_) {
    // if the above path does not exist
    // the block is not yet ready for rendering
    var block = this.block_
    var d
    // when defined, `recorder` comes from
    // the parent's `renderDrawValueInput_` method.
    var io = this.renderDrawModelBegin_(recorder)
    try {
      d = this.renderDrawModel_(io)
      this.svgPathInner_.setAttribute('d', d)
    } catch (err) {
      console.error (err)
      throw err
    } finally {
      var root = block.getRootBlock()
      this.renderSuite_()
      block.height = this.size.height
      this.updateAllPaths_()
    }
  }
  return io
}

/**
 * Align the right edges by changing the size of all the connected statement blocks.
 * The default implementation does nothing.
 * @param {*} recorder
 * @protected
 */
eYo.DelegateSvg.prototype.alignRightEdges_ = function (recorder) {
  if (this.parent || !this.isStmt || !this.block_.rendered || !this.block_.workspace || !this.isReady) {
    return
  }
  var right = 0
  var t = eYo.Font.tabWidth
  this.forEachStatement((eyo, depth) => {
    if (eyo.minWidth) {
      right = Math.max(right, eyo.minWidth + t * depth)
    }
  })
  if (right) {
    this.forEachStatement((eyo, depth) => {
      var width = right - t * depth
      var b = eyo.block_
      if (b.width !== width) {
        b.width = width
        eyo.updateAllPaths_()
      }
    })
  }
}

/**
 * Compute the paths of the block depending on its size.
 * @param {*} path 
 * @param {*} def 
 */
eYo.DelegateSvg.prototype.updatePath_ = function (path, def) {
  if (path) {
    if (def) {
      try {
        var d = def.call(this)
        if (d.indexOf('NaN') >= 0) {
          d = def.call(this)
          console.log('d', d)
        }
        path.setAttribute('d', d)
      } catch (err) {
        console.error('d', d, '\ndef', def)
        throw err
      }
    } else {
      path.removeAttribute('d')
    }
  }
}

/**
 * Compute the paths of the block depending on its size.
 * @param {!eYo.Block} block
 * @private
 */
eYo.DelegateSvg.prototype.updateAllPaths_ = function () {
  if (this.mayBeLast) {
    return
  }
  if (this.wrapped_) {
    this.updatePath_(this.svgPathContour_)
    this.updatePath_(this.svgPathShape_)
    this.updatePath_(this.svgPathSelect_)
    this.updatePath_(this.svgPathHilight_)
    this.updatePath_(this.svgPathConnection_, this.connectionPathDef_)
    this.updatePath_(this.svgPathCollapsed_)
  } else {
    this.updatePath_(this.svgPathContour_, this.contourPathDef_)
    this.updatePath_(this.svgPathShape_, this.shapePathDef_)
    this.updatePath_(this.svgPathSelect_, this.selectPathDef_)
    this.updatePath_(this.svgPathHilight_, this.hilightPathDef_)
    this.updatePath_(this.svgPathConnection_, this.connectionPathDef_)
    this.updatePath_(this.svgPathCollapsed_, this.collapsedPathDef_)
  }
}

/**
 * Render the inputs of the block.
 * @protected
 */
eYo.DelegateSvg.prototype.minBlockW = function () {
  return 0
}

/**
 * Get a new draw recorder.
 * @param {*} recorder
 * @private
 */
eYo.DelegateSvg.prototype.newDrawRecorder = function (recorder) {
  var io = {
    block: this.block_,
    steps: [],
    n: 0, // count of rendered objects (fields, slots and inputs)
    cursor: new eYo.Where(),
    forc: undefined // rendered file or connection
  }
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
      startOfLine: !this.outputConnection || !this.parent, // statement | orphan block
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
 * @param {?Object} recorder  When null, this is not the start of a statement
 * @return {!Object} a local recorder
 * @private
 */
eYo.DelegateSvg.prototype.renderDrawModelBegin_ = function (recorder) {
  this.parentIsShort = false
  this.isShort = false
  // we define the `io` named recorder which is specific to this block.
  var io = this.newDrawRecorder(recorder)
  // A "star like" field's text is one of '*', '+', '-', '~'...
  // This field is the very first of the block.
  // Once we have rendered a field with a positive length,
  // we cannot have a start like field.
  io.common.field.canStarLike = true
  // By default, we restart from scratch,
  // set the size to 0 for the width and 1 for the height
  this.size.set(0, 1)
  // And reset properties
  this.mayBeLast = false
  this.isLastInExpression = false
  this.isLastInStatement = false
  // Do we need some room for the left side of the block?
  // no for wrapped blocks
  if (!this.wrapped_) {
    if (!this.outputConnection || !this.locked_ || !recorder) {
      // statement or unlocked,
      // one space for the left edge of the block
      // (even for locked statements, this is to avoid a
      // display shift when locking/unlocking)
      this.size.w = 1
      io.common.field.beforeIsBlack = false
    }
  }
  if (this.hasLeftEdge || !recorder || !this.outputConnection) {
    // statement or unlocked,
    // one space for the left edge of the block
    // (even for locked statements, this is to avoid a
    // display shift when locking/unlocking)
    this.size.w = 1
    io.common.field.beforeIsBlack = false
    io.common.field.beforeIsSeparator = true
    io.common.field.shouldSeparate = false
    // Do not change io.common.field.shouldSeparate ?
  }
  io.cursor.c = this.size.w
  this.startOfStatement = io.common.startOfStatement
  if (!this.outputConnection) {
    this.startOfStatement = io.common.startOfStatement = true
    this.renderDrawSharp_(io)
  }
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
eYo.DelegateSvg.prototype.renderDrawModel_ = function (io) {
  var block = this.block_
  this.renderDrawFieldFrom_(this.fromStartField, io)
  if ((io.slot = this.headSlot)) {
    do {
      if ((io.slot !== this.comment_s)) {
        this.renderDrawSlot_(io.slot, io)
      }
    } while ((io.slot = io.slot.next))
  } else {
    block.inputList.forEach((input) => {
      goog.asserts.assert(input.eyo, `Input with no eyo ${input.name} in block ${this.type}`)
      io.input = input
      if (input.isVisible()) {
        this.renderDrawInput_(io)
      } else {
        input.fieldRow.forEach((field) => {
          if (field.getText().length > 0) {
            var root = field.getSvgRoot()
            if (root) {
              root.setAttribute('display', 'none')
            }
          }
        })
        if ((io.c8n = input.connection)) {
          if ((io.target = io.c8n.targetBlock())) {
            if ((root = io.target.getSvgRoot())) {
              root.setAttribute('display', 'none')
              if (io.target.eyo.svgContourGroup_) {
                io.target.eyo.svgContourGroup_.setAttribute('display', 'none')
                io.target.eyo.svgShapeGroup_.setAttribute('display', 'none')
              }
            } else {
              console.log('Block with no root: did you ...initSvg()?')
            }
          }
        }
      }
    })
  }
  this.renderDrawFieldFrom_(this.toEndField, io)
  this.renderDrawSlot_(this.comment_s, io)
  this.renderDrawModelEnd_(io)
  return io.steps.join(' ')
}

/**
 * Terminate to render the model.
 * @param {?Object} recorder 
 * @private
 */
eYo.DelegateSvg.prototype.renderDrawModelEnd_ = function (io) {
  // and now some space for the right edge, if any
  if (!this.wrapped_) {
    if (this.outputConnection) {
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
        } else if (!this.locked_ && !io.common.ending.length) {
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
  if (!this.outputConnection) {
    this.renderDrawEnding_(io, true, true)
  } else if (!io.recorder) {
    this.renderDrawEnding_(io, true)
  }
  this.renderDrawPending_(io)
  if (io.n < 2) {
    var c8n = io.forc && io.forc.connection
    var target = c8n && c8n.targetBlock()
    if (target) {
      target.eyo.parentIsShort = true
      this.isShort = true
      // always add a space to the right
      target.eyo.isLastInStatement = false
      target.eyo.updateAllPaths_()
      io.cursor.c += 1
    }
  }
  io.cursor.c = Math.max(io.cursor.c, this.minBlockW())
  this.size.setFromWhere(io.cursor)
  this.minWidth = this.block_.width = Math.max(this.block_.width, this.size.x)
  if (io.recorder) {
    // We ended a block. The right edge is generally a separator.
    // No need to add a separator if the block is wrapped or locked
    io.common.field.shouldSeparate && (io.common.field.shouldSeparate = this.hasRightEdge)
    // if the block is wrapped or locked, there won't be any 
    // right edge where a caret could be placed.
    // But may be we just rendered blocks in cascade such that
    // there might be some right edge already.
  }
}

/**
 * Render the the givent slot.
 * @param slot
 * @param io
 * @private
 */
eYo.DelegateSvg.prototype.renderDrawSlot_ = function (slot, io) {
  if (!slot) {
    return
  }
  var root = slot.getSvgRoot()
  if (slot.isIncog()) {
    root && root.setAttribute('display', 'none')
    return
  } else {
    goog.asserts.assert(root, 'Slot with no root', io.block.type, slot.key)
    root.removeAttribute('display')
  }
  // move the slot to the correct location
  slot.where.set(io.cursor)
  // Now reset the cursor relative to the slot
  io.cursor.set()
  this.renderDrawFieldFrom_(slot.fromStartField, io)
  if ((io.input = slot.input)) {
    this.renderDrawInput_(io)
  }
  this.renderDrawFieldFrom_(slot.toEndField, io)
  // come back to the block coordinates
  io.cursor.advance(slot.where)
  // translate at the end because `slot.where` may change
  // due to the shrink process
  root.setAttribute('transform',
    `translate(${slot.where.x}, ${slot.where.y})`)
}

/**
 * Render the leading # character for collapsed statement blocks.
 * Statement subclasses must override it.
 * @param io
 * @private
 */
eYo.DelegateSvg.prototype.renderDrawSharp_ = function (io) {
  goog.asserts.assert(false, 'renderDrawSharp_ must be overriden by ' + io.block.type)
}

/**
 * Render one input. Default implementation throws.
 * Subclasses must override it.
 * @param io
 * @private
 */
eYo.DelegateSvg.prototype.renderDrawInput_ = function (io) {
  goog.asserts.assert(false, 'renderDrawInput_ must be overriden by ' + this)
}

/**
 * Render the given field, when defined.
 *
 * @param {!Object} field A field.
 * @param {!Object} io An input/output recorder.
 * @private
 */
eYo.DelegateSvg.prototype.renderDrawField_ = function (field, io) {
  var c = io.cursor.c
  var root = field && field.getSvgRoot()
  if (root) {
    if (!field.isVisible()) {
      root.setAttribute('display', 'none')
    } else {
      root.removeAttribute('display')
      // Actually, io.cursor points to the location where the field
      // is expected. It is relative to the enclosing `SVG` group,
      // which is either a block or a slot.
      // If there is a pending caret, draw it and advance the cursor.
      var f_eyo = field.eyo
      io.forc = f_eyo
      f_eyo.willRender()
      var text = field.getDisplayText_()
      // Replace the text.
      goog.dom.removeChildren(/** @type {!Element} */ (field.textElement_));
      f_eyo.size.set(text.length, 1)
      field.updateWidth()
      if (text.length) {
        this.renderDrawEnding_(io)
        this.renderDrawPending_(io)
        io.common.startOfStatement = false
        ++ io.n
        var textNode = document.createTextNode(text)
        field.textElement_.appendChild(textNode)
        var head = text[0]
        if (f_eyo.model.literal) {
          io.common.field.didPack = 0
        } else {
          if (!io.common.field.shouldSeparate
            && !io.common.field.beforeIsSeparator
            && !io.common.field.beforeIsBlack
            && !io.common.startOfLine
            && !io.common.field.beforeIsCaret) {
            if (this.packedQuotes && (head === "'" || head === '"')) {
              io.cursor.c -= 1
            } else if (this.packedBrackets && head === "[") {
              io.cursor.c -= 1
            } else if (this.packedBraces && head === "{") {
              io.cursor.c -= 1
            } else if (this.packedParenthesis && head === "(") {
              io.cursor.c -= 1
            }
          }
          if (head === '.' && !io.common.field.beforeIsBlack) {
            io.cursor.c -= 1
          } else if (io.common.field.beforeIsBlack
            && (eYo.XRE.operator.test(head) || head === '=')) {
            io.cursor.c += 1
          } else if (io.common.field.shouldSeparate
              && (!f_eyo.startsWithSeparator()
              || head === '=')) {
            io.cursor.c += 1
          }
        }
        var tail = text[text.length - 1]
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
          if ((tail === '"' || tail === "'") && this.packedQuotes) {
            io.common.shouldPack = null // this
          } else if (tail === ']' && this.packedBrackets) {
            io.common.shouldPack = this
          } else if ((tail === '}') && this.packedBraces) {
            io.common.shouldPack = this
          } else if ((tail === ')') && this.packedParenthesis) {
            io.common.shouldPack = this
          }
        }
      }
      if (f_eyo.isEditing) {
        // This is a trick to avoid some bad geometry while editing
        // this is useful for widget only.
        io.cursor.c += 1
        io.common.field.shouldSeparate =
        io.common.field.beforeIsBlack = false
      }
      io.common.field.last = field
      io.common.beforeIsRightEdge = false
    }
  } else if (field) {
    console.error('Field with no root: did you ...initSvg()?', io.block.type, field.name)
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
eYo.DelegateSvg.prototype.renderDrawFieldFrom_ = function (field, io) {
  if (field) {
    do {
      this.renderDrawField_(field, io)
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
eYo.DelegateSvg.prototype.renderDrawFields_ = function (io, only_prefix) {
  var current = io.cursor.c
  io.input.fieldRow.forEach((field) => {
    if (!!only_prefix === !field.eyo.suffix) {
      this.renderDrawField_(field, io)
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
eYo.DelegateSvg.prototype.renderDrawEnding_ = function (io, isLast = false, inStatement = false) {
  if (io) {
    var isLastInExpression = isLast && !inStatement
    var isLastInStatement = isLast && inStatement
    if (io.common.ending.length) {
      // should we shrink after a quote or a bracket?
      if (io.common.shouldPack && (!isLast || io.common.shouldPack.wrapped_)) {
        // first loop to see if there is a pending rightCaret
        // BTW, there can be an only one right caret
        if (io.common.ending.some(eyo => !!eyo.rightCaret)) {
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
              eyo.size.c = Math.max(this.minBlockW(), eyo.size.c - 1)
              eyo.minWidth = eyo.block_.width = eyo.size.x
              io.common.field.didPack = true
              io.common.field.beforeIsBlack = true
            }
          })
        }
      }
      io.common.ending.forEach((eyo) => {
        eyo.mayBeLast = false
        eyo.isLastInExpression = isLastInExpression
        eyo.isLastInStatement = isLastInStatement
      })
      io.common.ending.forEach((eyo) => {
        eyo.updateAllPaths_()
        var c_eyo = eyo.rightCaret
        if (c_eyo) {
          c_eyo.side = eYo.Key.RIGHT
          c_eyo.shape = eYo.Key.NONE
          var wd = c_eyo.caretPathWidthDef_() // depends on the shape and the side
          var block = c_eyo.sourceBlock_
          if (io.block === block) {
            // we are lucky, this is the block we are currently rendering
            io.steps.push(wd.d)
          } else {
            // bad luck, block has already been rendered
            // we must append the definition to the path
            // this may happen for blocks with no left or right end,
            // eg locked or wrapped blocks.
            var path = block.eyo.svgPathInner_
            var d = path.getAttribute('d')
            path.setAttribute('d', `${d} ${wd.d}`)
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
eYo.DelegateSvg.prototype.renderDrawPending_ = function (io, side = eYo.Key.NONE, shape = eYo.Key.NONE) {
  if (io) {
    var eyo = io.common.pending
    if (eyo) {
      eyo.side = side
      eyo.shape = io.isLastInStatement ? eYo.Key.Right : shape
      var wd = eyo.caretPathWidthDef_() // depends on the shape and the side
      var block = eyo.sourceBlock_
      if (io.block === block) {
        // we are lucky, this is the block we are currently rendering
        io.steps.push(wd.d)
      } else {
        // bad luck, block has already been rendered
        // we must append the definition to the path
        // this may happen for blocks with no left or right end,
        // eg locked or wrapped blocks.
        var path = block.eyo.svgPathInner_
        var d = path.getAttribute('d')
        path.setAttribute('d', d + ' ' + wd.d)
      }
      if (wd.w) {
        // should we advance the cursor?
        if (eyo.side === eYo.Key.NONE) {
          io.cursor.advance(wd.w)
        }
        // a space was added as a visual separator anyway
        io.common.field.shouldSeparate = false
        // all done
        io.common.pending = undefined
        io.common.field.beforeIsBlack = false // do not step back
        io.common.field.beforeIsCaret = true // do not step back
      }
      return wd
    }
  }
}

/**
 * Render the fields of a value input, if relevant.
 * @param {!Object} io the input/output argument.
 * @private
 */
eYo.DelegateSvg.prototype.renderDrawValueInput_ = function (io) {
  if (io.input.type !== Blockly.INPUT_VALUE && io.input.type !== Blockly.DUMMY_INPUT) {
    return false
  }
  // this is one of the reasons why we allways render from the start of a statement
  io.input.eyo.inputRight = undefined
  io.input.eyo.inputLeft = io.common.inputDone
  io.common.inputDone && (io.common.inputDone.eyo.inputRight = io.input)
  io.common.inputDone = io.input
  this.renderDrawFields_(io, true)
  var c8n = io.input.connection
  if (c8n) { // once `&&!c8n.hidden_` was there, bad idea, but why was it here?
    ++ io.n
    var c_eyo = c8n.eyo
    io.forc = c_eyo
    c_eyo.side = c_eyo.shape = undefined
    io.common.field.canStarLike = false
    // io.cursor is relative to the block or the slot
    // but the connection must be located relative to the block
    // the connection delegate will take care of that because it knows
    // if there is a slot or only an input.
    var target = c8n.targetBlock()
    if (target) {
      var root = target.getSvgRoot()
      if (root) {
        var t_eyo = target.eyo
        try {
          t_eyo.startOfStatement = io.common.startOfStatement
          t_eyo.mayBeLast = t_eyo.hasRightEdge
          t_eyo.downRendering = true
          if (eYo.DelegateSvg.debugStartTrackingRender) {
            console.log(eYo.DelegateSvg.debugPrefix, 'DOWN')
          }
          if (t_eyo.wrapped_) {
            // force target rendering
            t_eyo.incrementChangeCount()
          }
          c_eyo.setOffset(io.cursor)
          if (c_eyo.c === 1 && !io.common.field.beforeIsBlack && c_eyo.slot) {
            c_eyo.slot.where.c -= 1
            c_eyo.setOffset(io.cursor)
          }
          if (io.block.outputConnection !== eYo.Connection.disconnectedChildC8n && !t_eyo.upRendering) {
            t_eyo.render(false, io)
            if (!target.eyo.wrapped_) {
              io.common.field.shouldSeparate = false
              io.common.field.beforeIsSeparator = true
            }
          }      
        } catch(err) {
           console.error(err)
           throw err
        } finally {
          t_eyo.downRendering = false
          var size = t_eyo.size
          if (size.w) {
            io.cursor.advance(size.w, size.h - 1)
            // We just rendered a block
            // it is potentially the rightmost object inside its parent.
            if (t_eyo.hasRightEdge || io.common.shouldPack) {
              io.common.ending.push(t_eyo)
              t_eyo.rightCaret = undefined
              io.common.field.shouldSeparate = false
            }
            io.common.field.beforeIsCaret = false
          }
        }
      }
    } else if (c_eyo.bindField && c_eyo.bindField.isVisible()) {
      c_eyo.setOffset(io.cursor.c - c_eyo.w, io.cursor.l)
      // The `bind` field hides the connection.
      // The bind field is always the last field before the connection.
      // if the connection has a bindField, then rendering the placeholder
      // for that connection is a bit different.
      // Don't display anything for that connection
      io.common.field.beforeIsCaret = false
    } else if (!this.locked_ && !c8n.hidden_) {
      // locked blocks won't display any placeholder
      // (input with no target)
      if (!c_eyo.disabled_) {
        c_eyo.setOffset(io.cursor)
        c_eyo.startOfStatement = io.common.startOfStatement
        if (c_eyo.s7r_) {
          c_eyo.side = eYo.Key.NONE
          var ending = io.common.ending.slice(-1)[0]
          if (ending && !ending.rightCaret) {
            // an expression block with a right end has been rendered
            // we put the caret on that end to save space,
            // we move the connection one character to the left
            io.cursor.c -= 1
            c_eyo.setOffset(io.cursor)
            io.cursor.c += 1
            ending.rightCaret = c_eyo
            c_eyo.isAfterRightEdge = io.beforeIsRightEdge
            io.common.field.beforeIsCaret = true
          } else {
            // we might want this caret not to advance the cursor
            // If the next rendered object is a field, then
            // this caret should be rendered normally
            // and the cursor should advance.
            // If the next rendered object is an expression block
            // with a left end, then this caret shoud be rendered
            // with a left shape and the cursor should not advance.
            // If the caret is the last rendered object of the block,
            // then it should be rendered with special shape and
            // the cursor should not advance.
            io.common.pending = c_eyo
          }
          io.common.field.shouldSeparate = false
        } else if (c_eyo.optional_) {
          this.renderDrawPending_(io)
          io.common.pending = c_eyo
        } else {
          this.renderDrawPending_(io)
          if (c_eyo.c === 1) {
            if (c_eyo.slot) {
              c_eyo.slot.where.c -= 1
            } else {
              io.cursor.c = c_eyo.where.c = 0
            }
            c_eyo.setOffset(io.cursor)
          }
          var wd = c_eyo.placeHolderPathWidthDef_()
          io.steps.push(wd.d)
          if (wd.w) {
            io.cursor.c += wd.w
            // a space was added as a visual separator anyway
          }
          io.common.field.beforeIsSeparator = io.common.field.shouldSeparate
          io.common.field.shouldSeparate = false
        }
        io.common.beforeIsRightEdge = true
        io.common.startOfStatement = false
      }
    }
  }
  this.renderDrawFields_(io, false)
  return true
}

/**
 * Block path.
 * @private
 */
eYo.DelegateSvg.prototype.valuePathDef_ = function () {
  return eYo.Shape.definitionWithBlock(this)
}

/**
 * Fetches the named input object.
 * @param {!String} name The name of the input.
 * @param {?Boolean} dontCreate Whether the receiver should create inputs on the fly. Ignored.
 * @return {Blockly.Input} The input object, or null if input does not exist. Input that are disabled are skipped.
 */
eYo.DelegateSvg.prototype.getInput = function (name, dontCreate) {
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
      if ((eyo = eyo.next)) {
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
        if (e8r.here.eyo.isNextLike) {
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

eYo.DelegateSvg.prototype.nextStatementCheck = undefined
eYo.DelegateSvg.prototype.previousStatementCheck = undefined

/**
 * The default implementation does nothing.
 * Subclassers will override this but won't call it.
 * @private
 */
eYo.DelegateSvg.prototype.doMakeBlockWrapped = function () {
  eYo.DelegateSvg.superClass_.doMakeBlockWrapped.call(this)
  var block = this.block_
  goog.asserts.assert(!this.hasSelect(block), 'Deselect block before')
  block.initSvg()
  this.svgPathShape_.setAttribute('display', 'none')
  this.svgPathContour_.setAttribute('display', 'none')
}

/**
 * Creates the contour path.
 * Does nothing if this contour already exists.
 * @private
 */
eYo.DelegateSvg.prototype.makeBlockUnwrapped = function () {
  if (this.svgPathContour_) {
    eYo.DelegateSvg.superClass_.makeBlockUnwrapped.call(this)
    this.svgPathContour_.removeAttribute('display')
    this.svgPathShape_.removeAttribute('display')
  }
}

/**
 * Whether the block is selected.
 * Subclassers will override this but won't call it.
 * @param {!Block} block
 * @private
 */
eYo.DelegateSvg.prototype.hasSelect = function (block) {
  return goog.dom.classlist.contains(block.svgGroup_, 'eyo-select')
}

/**
 * Create a new block, with full contents.
 * This is the expected way to create a block 
 * to be displayed immediately.
 * @param {!WorkspaceSvg} workspace
 * @param {!String|Object} model  prototypeName or xml representation.
 * @param {?String} id
 * @private
 */
eYo.DelegateSvg.newBlockReady = function (workspace, model, id) {
  var B = eYo.DelegateSvg.newBlockComplete.apply(null, arguments)
  B && B.eyo.beReady()
  return B
}

/**
 * Create a new block, with svg background.
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
eYo.DelegateSvg.newBlockComplete = function (owner, model, id) {
  var workspace = owner.workspace || owner
  var processModel = (block, model, id) => {
    var dataModel = model
    if (!block) {
      if (eYo.DelegateSvg.Manager.get(model.type)) {
        block = workspace.newBlock(model.type, id)
        block.eyo.setDataWithType(model.type)
      } else if (eYo.DelegateSvg.Manager.get(model)) {
        block = workspace.newBlock(model, id) // can undo
        block.eyo.setDataWithType(model)
      } else if (goog.isString(model) || goog.isNumber(model)) {
        var p5e = eYo.T3.Profile.get(model, null)
        var f = (p5e) => {
          var b
          if (p5e.expr && (b = workspace.newBlock(p5e.expr, id))) {
            p5e.expr && b.eyo.setDataWithType(p5e.expr)
            model && b.eyo.setDataWithModel(model)
            dataModel = {data: model}
          } else if (p5e.stmt && (b = workspace.newBlock(p5e.stmt, id))) {
            p5e.stmt && b.eyo.setDataWithType(p5e.stmt)
            dataModel = {data: model}
          } else if (goog.isNumber(model)  && (b = workspace.newBlock(eYo.T3.Expr.numberliteral, id))) {
            b.eyo.setDataWithType(eYo.T3.Expr.numberliteral)
            dataModel = {data: model.toString()}
          } else {
            console.warn('No block for model:', model)
          }
          return b
        }
        if (!p5e.isVoid && !p5e.isUnset) {
          block = f(p5e)
        } else {
          console.warn('No block for model either:', model)
          return
        }
      }
    }
    block && block.eyo.changeWrap(
      function () { // `this` is `block.eyo`
      this.willLoad()
      this.setDataWithModel(dataModel)
        var Vs = model.slots
        for (var k in Vs) {
          if (eYo.Do.hasOwnProperty(Vs, k)) {
            var input = this.getInput(k)
            if (input && input.connection) {
              var target = input.connection.targetBlock()
              var V = Vs[k]
              var B = processModel(target, V)
              if (!target && B && B.outputConnection) {
                B.eyo.changeWrap(
                  () => {
                    var slot = input.connection.slot
                    slot && slot.setIncog(false)
                    B.outputConnection.connect(input.connection)
                  }
                )
              }
            }
          }
        }
        Vs = model
        this.forEachSlot(slot => {
          var input = slot.input
          if (!input || !input.connection) {
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
          var target = input.connection.targetBlock()
          var B = processModel(target, V)
          if (!target && B && B.outputConnection) {
            B.eyo.changeWrap(
              () => {
                // The connection can be established only when not incog
                slot.setIncog(false)
                B.outputConnection.connect(input.connection)
              }
            )
          }
        })
        // now blocks and slots have been set
        this.didLoad()
        if (block.nextConnection) {
          var nextModel = dataModel.next
          if (nextModel) {
            B = processModel(null, nextModel)
            if (B && B.previousConnection) {
              try {
                B.previousConnection.connect(block.nextConnection)
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
    return block
  }
  var B = processModel(null, model, id)
  B && B.eyo.consolidate()
  return B
}

/**
 * When setup is finish.
 * The state has been created, some expected connections are created
 * This is the final step before the first rendering.
 * This is a one shot function.
 */
eYo.DelegateSvg.prototype.beReady = function () {
  this.changeWrap(
    function () {
      this.foreachData((data) => {
        data.beReady() // data is headless
      })
      var block = this.block_
      block.initSvg()
      // install all the fields and slots in the DOM
      Object.values(this.fields).forEach(field => {
        if (!field.sourceBlock_) {
          field.setSourceBlock(block)
          field.init()
        }
      })
      this.forEachSlot(slot => slot.beReady())
      for (var i = 0, input; (input = block.inputList[i++]);) {
        input.eyo.beReady()
      }
      this.inputSuite && this.inputSuite.eyo.beReady()
      this.nextConnection && this.nextConnection.eyo.beReady()
      var parent = block.outputConnection && block.outputConnection.targetBlock()
      if (parent && parent.eyo.svgContourGroup_) {
        goog.dom.insertChildAt(parent.eyo.svgContourGroup_, this.svgContourGroup_, 0)
        goog.dom.classlist.add(/** @type {!Element} */(this.svgContourGroup_),
          'eyo-inner')
        goog.dom.appendChild(parent.eyo.svgShapeGroup_, this.svgShapeGroup_)
        goog.dom.classlist.add(/** @type {!Element} */(this.svgShapeGroup_),
          'eyo-inner')
      } else {
        goog.dom.insertChildAt(block.svgGroup_, this.svgContourGroup_, 0)
        goog.dom.classlist.remove(/** @type {!Element} */(this.svgContourGroup_),
          'eyo-inner')
        goog.dom.insertSiblingBefore(this.svgShapeGroup_, this.svgContourGroup_)
        goog.dom.classlist.remove(/** @type {!Element} */(this.svgShapeGroup_),
          'eyo-inner')
      }
      this.foreachData((data) => {
        data.synchronize() // data is not headless
      })
      this.beReady = eYo.Do.nothing // one shot function
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
eYo.DelegateSvg.prototype.getPythonType = function () {
  if (this.wrapped_) {
    var parent = this.block_.getParent()
    return parent.eyo.getPythonType()
  }
  return this.pythonType_
}

/**
 * Insert a parent.
 * If the block's output connection is connected,
 * connects the parent's output to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {!Block} block
 * @param {Object} model, for subclassers
 * @return {?Blockly.Block} the created block
 */
eYo.DelegateSvg.prototype.insertParentWithModel = function (processModel) {
  goog.asserts.assert(false, 'Must be subclassed')
}

/**
 * Get the hole filler data object for the given check.
 * @param {!Array} check an array of types.
 * @param {objet} value value of the block that will fill the hole, a string for an identifier block.
 * @private
 */
eYo.HoleFiller.getData = function (check, value) {
  var data
  if (goog.isFunction(value)) {
    data = {
      filler: value
    }
  } else if (check.indexOf(eYo.T3.Expr.identifier) >= 0) {
    if (value) {
      data = {
        type: eYo.T3.Expr.identifier,
        value: value
      }
    }
  } else if (check.length === 1 && eYo.T3.All.core_expressions.indexOf(check[0]) >= 0) {
    data = {
      type: check[0],
      value: value
    }
  }
  return data
}

/**
 * Get an array of the deep connections that can be filled.
 * @param {!Block} block
 * @param {Array} holes whengiven the is the array to be filled
 * @return an array of connections, holes if given.
 */
eYo.HoleFiller.getDeepHoles = function (block, holes = undefined) {
  var H = holes || []
  var getDeepHoles = (c8n) => {
    if (c8n && c8n.eyo.isInput && ((!c8n.eyo.disabled_ && !c8n.eyo.incog_) || c8n.eyo.wrapped_)) {
      var target = c8n.targetBlock()
      if (target) {
        eYo.HoleFiller.getDeepHoles(target, H)
      } else if (c8n.eyo.hole_data) {
        H.push(c8n)
      }
    }
  }
  if (goog.isDef(block.getSourceBlock)) { // this is a connection...
    getDeepHoles(block)
  } else {
    block.eyo.forEachInputConnection((c8n) => {
      getDeepHoles(c8n)
    })
  }
  return H
}

/**
 * For each value input that is not optional and accepts an identifier,
 * create and connect an identifier block.
 * Called once at block creation time.
 * Should not be called directly
 * 
 * @param {*} workspace 
 * @param {*} holes 
 * @param {!Blockly.Block} block to be initialized..
 */
eYo.HoleFiller.fillDeepHoles = function (workspace, holes) {
  var i = 0
  eYo.Events.groupWrap(
    () => {
      for (; i < holes.length; ++i) {
        var c8n = holes[i]
        if (c8n && c8n.eyo.isInput && !c8n.isConnected()) {
          var data = c8n.eyo.hole_data
          if (data) {
            try {
              if (data.filler) {
                var B = data.filler(workspace)
              } else {
                B = eYo.DelegateSvg.newBlockReady(workspace, data.type)
                if (data.value) {
                  (B.eyo.phantom_d && B.eyo.phantom_d.set(data.value)) ||
                  (B.eyo.value_d && B.eyo.value_d.set(data.value))
                }
                B.render()
              }
              c8n.connect(B.outputConnection)
            } catch (err) {
              console.log(err.message)
            }
          }
        }
      }
    }
  )
}

/**
 * Returns the coordinates of a bounding rect describing the dimensions of this
 * block.
 * As the shape is not the same comparing to Blockly's default,
 * the bounding rect changes too.
 * Coordinate system: workspace coordinates.
 * @return {!goog.math.Rect}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
eYo.DelegateSvg.prototype.getBoundingRect = function () {
  return goog.math.Rect.createFromPositionAndSize(
    this.block_.getRelativeToSurfaceXY(),
    this.block_.getHeightWidth()
  )
}

/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * block.
 * As the shape is not the same comparing to Blockly's default,
 * the bounding box changes too.
 * Coordinate system: workspace coordinates.
 * @return {!goog.math.Box}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
eYo.DelegateSvg.prototype.getBoundingBox = function () {
  return this.getBoundingRect().toBox()
}

/**
 * Get the input for the given event.
 * The block is already rendered once.
 *
 * For edython.
 * @param {Object} e in general a mouse down event
 * @return {Object|undefined|null}
 */
eYo.DelegateSvg.prototype.getConnectionForEvent = function (e) {
  var block = this.block_
  var where = Blockly.utils.mouseToSvg(e, block.workspace.getParentSvg(),
  block.workspace.getInverseScreenCTM());
  where = goog.math.Coordinate.difference(where, block.workspace.getOriginOffsetInPixels())
  where.scale(1 / block.workspace.scale)
  var rect = this.getBoundingRect()
  where = goog.math.Coordinate.difference(where, rect.getTopLeft())
  var R
  var c8n = this.someInputConnection(c8n => {
    if (!c8n.eyo.disabled_ && (!c8n.hidden_ || c8n.eyo.wrapped_)) {
      if (c8n.eyo.isInput) {
        var target = c8n.targetBlock()
        if (target) {
          var targetC8n = target.eyo.getConnectionForEvent(e)
          if (targetC8n) {
            return targetC8n
          }
          R = new goog.math.Rect(
            c8n.offsetInBlock_.x + eYo.Unit.x / 2,
            c8n.offsetInBlock_.y,
            target.width - eYo.Unit.x,
            target.height
          )
          if (R.contains(where)) {
            return c8n
          }
        }
        if (c8n.eyo.slot && c8n.eyo.slot.bindField) {
          R = new goog.math.Rect(
            c8n.offsetInBlock_.x,
            c8n.offsetInBlock_.y + eYo.Padding.t,
            c8n.eyo.w * eYo.Unit.x,
            eYo.Font.height
          )
        } else if (c8n.eyo.optional_ || c8n.eyo.s7r_) {
          R = new goog.math.Rect(
            c8n.offsetInBlock_.x - eYo.Unit.x / 4,
            c8n.offsetInBlock_.y + eYo.Padding.t,
            1.5 * eYo.Unit.x,
            eYo.Font.height
          )
        } else {
          R = new goog.math.Rect(
            c8n.offsetInBlock_.x + eYo.Unit.x / 4,
            c8n.offsetInBlock_.y + eYo.Padding.t,
            (c8n.eyo.w - 1 / 2) * eYo.Unit.x,
            eYo.Font.height
          )
        }
        if (R.contains(where)) {
          return c8n
        }
      } else if (c8n.eyo.isNextLike) {
        R = new goog.math.Rect(
          c8n.offsetInBlock_.x,
          c8n.offsetInBlock_.y - eYo.Style.Path.width,
          eYo.Font.tabWidth,
          1.5 * eYo.Padding.t + 2 * eYo.Style.Path.width
        )
        if (R.contains(where)) {
          return c8n
        }
      }
    }
  })
  if (c8n) {
    return c8n
  } else if ((c8n = block.previousConnection) && !c8n.hidden) {
    R = new goog.math.Rect(
      c8n.offsetInBlock_.x,
      c8n.offsetInBlock_.y - 2 * eYo.Style.Path.width,
      rect.width,
      1.5 * eYo.Padding.t + 2 * eYo.Style.Path.width
    )
    if (R.contains(where)) {
      return c8n
    }
  }
  if ((c8n = this.nextConnection) && !c8n.hidden) {
    if (rect.height > eYo.Font.lineHeight) { // Not the cleanest design
      R = new goog.math.Rect(
        c8n.offsetInBlock_.x,
        c8n.offsetInBlock_.y - 1.5 * eYo.Padding.b - eYo.Style.Path.width,
        eYo.Font.tabWidth + eYo.Style.Path.r, // R U sure?
        1.5 * eYo.Padding.b + 2 * eYo.Style.Path.width
      )
    } else {
      R = new goog.math.Rect(
        c8n.offsetInBlock_.x,
        c8n.offsetInBlock_.y - 1.5 * eYo.Padding.b - eYo.Style.Path.width,
        rect.width,
        1.5 * eYo.Padding.b + 2 * eYo.Style.Path.width
      )
    }
    if (R.contains(where)) {
      return c8n
    }
  }
}

/**
 * Insert a block of the given type.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {Object|string} model
 * @return {?Blockly.Block} the block that was inserted
 */
eYo.DelegateSvg.prototype.insertBlockWithModel = function (model, connection) {
  if (!model) {
    return null
  }
  var block = this.block_
  // get the type:
  var p5e = eYo.T3.Profile.get(model, null)
  if (!p5e.isVoid && !p5e.isUnset) {
    if (connection) {
      if (connection.eyo.isNextLike || connection.eyo.isPrevious) {
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
      var c8n, otherC8n
      candidate = eYo.DelegateSvg.newBlockReady(block.workspace, model)
      var fin = (prepare) => {
        eYo.Events.groupWrap(() => {
          eYo.Events.enableWrap(() => {
            eYo.Do.tryFinally(() => {
              eYo.Events.fireBlockCreate(candidate)
              prepare && prepare()
              otherC8n.connect(c8n)
            }, () => {
              candidate.eyo.render()
              candidate.select()
              candidate.bumpNeighbours_()
            })
          })
        })
        return candidate
      }
      if (!candidate) {
        // very special management for tuple input
        if ((otherC8n = eYo.Selected.connection) && goog.isString(model)) {
          var otherSource = otherC8n.getSourceBlock()
          if (otherSource.eyo instanceof eYo.DelegateSvg.List && otherC8n.eyo.isInput) {
            eYo.Events.groupWrap(() => {
              var blocks = model.split(',').map(x => {
                var model = x.trim()
                var p5e = eYo.T3.Profile.get(model, null)
                console.warn('MODEL:', model)
                console.warn('PROFILE:', p5e)
                return {
                  model,
                  p5e
                }
              }).filter(({p5e}) => !p5e.isVoid && !p5e.isUnset).map(x => {
                var b = eYo.DelegateSvg.newBlockReady(block.workspace, x.model)
                b.eyo.setDataWithModel(x.model)
                console.error('BLOCK', b)
                return b
              })
              blocks.some(b => {
                candidate = b
                if ((c8n = candidate.outputConnection) && c8n.checkType_(otherC8n)) {
                  fin()
                  var next = false
                  otherSource.eyo.someInputConnection(c8n => {
                    if (next) {
                      otherC8n = c8n
                      return true
                    } else if (c8n === otherC8n) {
                      next = true
                    }
                  })
                }
              })
              eYo.Selected.connection = otherC8n
            })
          }
        }
        return
      }
      if ((otherC8n = eYo.Selected.connection)) {
        otherSource = otherC8n.getSourceBlock()
        if (otherC8n.eyo.isInput) {
          if ((c8n = candidate.outputConnection) && c8n.checkType_(otherC8n)) {
            return fin()
          }
        } else if (otherC8n.eyo.isPrevious) {
          if ((c8n = candidate.nextConnection) && c8n.checkType_(otherC8n)) {
            var targetC8n = otherC8n.targetConnection
            if (targetC8n && candidate.previousConnection &&
              targetC8n.checkType_(candidate.previousConnection)) {
              return fin(() => {
                targetC8n.connect(candidate.previousConnection)
              })
            } else {
              return fin(() => {
                var its_xy = block.getRelativeToSurfaceXY()
                var my_xy = candidate.getRelativeToSurfaceXY()
                var HW = candidate.getHeightWidth()
                candidate.moveBy(its_xy.x - my_xy.x, its_xy.y - my_xy.y - HW.height)
              })
            }
            // unreachable code
          }
        } else if (otherC8n.eyo.isNextLike) {
          if ((c8n = candidate.previousConnection) && c8n.checkType_(otherC8n)) {
            if ((targetC8n = otherC8n.targetConnection) && candidate.nextConnection &&
              targetC8n.checkType_(candidate.nextConnection)) {
              return fin(() => {
                targetC8n.connect(candidate.nextConnection)
              })
            } else {
              return fin()
            }
          }
        }
      }
      var c8n_N = model.input
      if ((c8n = candidate.outputConnection)) {
        // try to find a free connection in a block
        // When not undefined, the returned connection can connect to c8n.
        var findC8n = (block) => {
          var otherC8n, target
          otherC8n = block.eyo.someInputConnection((foundC8n) => {
            if (foundC8n.eyo.isInput) {
              if ((target = foundC8n.targetBlock())) {
                if (!(foundC8n = findC8n(target))) {
                  return
                }
              } else if (!c8n.checkType_(foundC8n)) {
                return
              } else if (foundC8n.eyo.bindField) {
                return
              }
              if (!foundC8n.eyo.disabled_ && !foundC8n.eyo.s7r_ && (!c8n_N || foundC8n.eyo.name_ === c8n_N)) {
                // we have found a connection
                // which s not a separator and
                // with the expected name
                return foundC8n
              }
              // if there is no connection with the expected name,
              // then remember this connection and continue the loop
              // We remember the last separator connection
              // of the first which is not a separator
              if (!otherC8n || (!otherC8n.eyo.disabled_ && otherC8n.eyo.s7r_)) {
                otherC8n = foundC8n
              }
            }
          })
          return otherC8n
        }
        if ((otherC8n = findC8n(block))) {
          return fin()
        }
      }
      if ((c8n = candidate.previousConnection)) {
        if ((otherC8n = this.nextConnection) && c8n.checkType_(otherC8n)) {
          return fin(() => {
            if ((targetC8n = otherC8n.targetConnection)) {
              // connected to something, beware of orphans
              otherC8n.disconnect()
              if (candidate.nextConnection && candidate.nextConnection.checkType_(targetC8n)) {
                candidate.nextConnection.connect(targetC8n)
                targetC8n = null
              }
            }
            c8n.connect(otherC8n)
            if (targetC8n) {
              targetC8n.getSourceBlock().bumpNeighbours_()
            }
          })
        }
      }
      if ((c8n = candidate.nextConnection)) {
        if ((otherC8n = block.previousConnection) && c8n.checkType_(otherC8n)) {
          if ((targetC8n = otherC8n.targetConnection) && candidate.previousConnection && candidate.previousConnection.checkType_(targetC8n)) {
            return fin(() => {
              candidate.previousConnection.connect(targetC8n)
            })
          } else {
            return fin(() => {
              var its_xy = block.getRelativeToSurfaceXY()
              var my_xy = candidate.getRelativeToSurfaceXY()
              var HW = candidate.getHeightWidth()
              candidate.moveBy(its_xy.x - my_xy.x, its_xy.y - my_xy.y - HW.height)
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
console.warn('Use eYo.Events.setGroup(...)')
/**
 * Whether the given block can lock.
 * For edython.
 * @return boolean
 */
eYo.DelegateSvg.prototype.canLock = function () {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var c8n, target
  return !this.someInput(input => {
    if ((c8n = input.connection) && !c8n.eyo.disabled_) {
      if ((target = c8n.targetBlock())) {
        if (!target.eyo.canLock()) {
          return true
        }
      } else if (!c8n.eyo.optional_ && !c8n.eyo.s7r_) {
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
eYo.DelegateSvg.prototype.canUnlock = function () {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var c8n, target
  return this.someInput(input => {
    if ((c8n = input.connection)) {
      if ((target = c8n.targetBlock())) {
        if (target.eyo.canUnlock()) {
          return true
        }
      }
    }
  })
}

/**
 * Lock the given block.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return {number} the number of blocks locked
 */
eYo.DelegateSvg.prototype.lock = function () {
  var ans = 0
  if (this.locked_ || !block.eyo.canLock()) {
    return ans
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
      block, eYo.Const.Event.locked, null, this.locked_, true))
  }
  this.locked_ = true
  var c8n
  if ((c8n = eYo.Selected.connection) && (block === c8n.getSourceBlock())) {
    eYo.Selected.connection = null
  }
  // list all the input for connections with a target
  var target
  this.forEachInput((input) => {
    if ((c8n = input.connection)) {
      if ((target = c8n.targetBlock())) {
        ans += target.eyo.lock()
      }
      if (c8n.eyo.isInput) {
        c8n.setHidden(true)
      }
    }
  })
  // maybe redundant calls here
  this.forEachSlot(slot => {
    if (slot.input && (c8n = slot.input.connection)) {
      if ((target = c8n.targetBlock())) {
        ans += target.eyo.lock()
      }
      if (c8n.eyo.isInput) {
        c8n.setHidden(true)
      }      
    }
  })
  if ((c8n = this.nextConnection)) {
    if ((target = c8n.targetBlock())) {
      ans += target.eyo.lock()
    }
  }
  if (block === Blockly.selected) {
    var parent = block
    while ((parent = parent.getSurroundParent())) {
      if (!parent.eyo.wrapped_ && !parent.eyo.locked_) {
        parent.select()
        break
      }
    }
  }
  (block.getSurroundParent() || block).render()
  return ans
}
/**
 * Unlock the given block.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {boolean} deep Whether to unlock statements too.
 * @return {number} the number of blocks unlocked
 */
eYo.DelegateSvg.prototype.unlock = function (shallow) {
  var block = this.block_
  var ans = 0
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
      block, eYo.Const.Event.locked, null, this.locked_, false))
  }
  this.locked_ = false
  // list all the input for connections with a target
  var c8n, target
  this.forEachInput((input) => {
    if ((c8n = input.connection)) {
      if ((!shallow || c8n.eyo.isInput) && (target = c8n.targetBlock())) {
        ans += target.eyo.unlock(shallow)
      }
      c8n.setHidden(false)
    }
  })
  if (!shallow && (c8n = block.nextConnection)) {
    if ((target = c8n.targetBlock())) {
      ans += target.eyo.unlock()
    }
  }
  (block.getSurroundParent() || block).render()
  return ans
}
/**
 * Whether the block of the receiver is in the visible area.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return {boolean}
 */
eYo.DelegateSvg.prototype.inVisibleArea = function () {
  var area = this.getDistanceFromVisible()
  return area && !area.x && !area.y
}

/**
 * Get the position of receiver's block relative to
 * the visible area.
 * Return value: if `x < 0`, left of the visible area,
 * if `x > 0`, right of the visibe area, 0 otherwise.
 * undefined when the block is not in a workspace.
 * The same holds for `y`.
 * The values are the signed distances between the center
 * of the block and the visible area.
 * If the answer is `{x: -15, y: 0}`, we just have to scroll the workspace
 * 15 units to the right and the block is visible.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return {{x: number, y: number}|undefined}
 */
eYo.DelegateSvg.prototype.getDistanceFromVisible = function (newLoc) {
  var block = this.block_
  var workspace = block.workspace
  if (!workspace) {
    return undefined
  }
  // is the block in the visible area ?
  var metrics = workspace.getMetrics()
  var scale = workspace.scale || 1
  var heightWidth = block.getHeightWidth()
  // the block is in the visible area if we see its center
  var leftBound = metrics.viewLeft / scale - heightWidth.width / 2
  var topBound = metrics.viewTop / scale - heightWidth.height / 2
  var rightBound = (metrics.viewLeft + metrics.viewWidth) / scale - heightWidth.width / 2
  var downBound = (metrics.viewTop + metrics.viewHeight) / scale - heightWidth.height / 2
  var xy = newLoc || block.getRelativeToSurfaceXY()
  return {
    x: xy.x < leftBound? xy.x - leftBound: (xy.x > rightBound? xy.x - rightBound: 0),
    y: xy.y < topBound? xy.y - topBound: (xy.y > downBound? xy.y - downBound: 0),
  }
}

/**
 * Whether the block of the receiver is in the visible area.
 * For edython.
 * @param {*} dx 
 * @param {*} dy 
 * @return {boolean}
 */
eYo.DelegateSvg.prototype.setOffset = function (dc, dl) {
  // Workspace coordinates.
  var block = this.block_
  if (!this.svgShapeGroup_) {
    throw 'block is not inited '+this.type
  }
  var dx = dc * eYo.Unit.x
  var dy = dl * eYo.Unit.y
  var xy = Blockly.utils.getRelativeXY(block.getSvgRoot());
  var transform = 'translate(' + (xy.x + dx) + ',' + (xy.y + dy) + ')';
  block.getSvgRoot().setAttribute('transform', transform);
  this.svgShapeGroup_.setAttribute('transform', transform);
  this.svgContourGroup_.setAttribute('transform', transform);
  block.moveConnections_(dx, dy);
}
eYo.DelegateSvg.prototype.setOffset = function (dx, dy) {
  // Workspace coordinates.
  var block = this.block_
  if (!this.svgShapeGroup_) {
    throw 'block is not inited '+this.type
  }
  var xy = Blockly.utils.getRelativeXY(block.getSvgRoot());
  var transform = 'translate(' + (xy.x + dx) + ',' + (xy.y + dy) + ')';
  block.getSvgRoot().setAttribute('transform', transform);
  var xy1 = Blockly.utils.getRelativeXY(this.svgShapeGroup_);
  this.svgShapeGroup_.setAttribute('transform', transform);
  var xy2 = Blockly.utils.getRelativeXY(this.svgContourGroup_);
  this.svgContourGroup_.setAttribute('transform', transform);
  if (xy1.x !== xy2.x || xy1.y !== xy2.y) {
    console.error('WEIRD', xy1, xy2)
  }
  if ((xy.x !== xy1.x || xy.y !== xy1.y) && (xy1.x || xy1.y)) {
    console.error('WEIRD', xy, xy1)
  }
  block.moveConnections_(dx, dy);
}

/**
 * Renders the block when connections are no longer hidden.
 * @param {boolean} hidden True to hide connections.
 */
eYo.DelegateSvg.prototype.setConnectionsHidden = function (hidden) {
  var block = this.block_
  if (this.connectionsHidden_ === hidden) {
    return
  }
  this.connectionsHidden_ = hidden
  if (hidden) {
    if (eYo.DelegateSvg.debugStartTrackingRender) {
      console.log('HIDE', block.id, block.type)
    }
  } else {
    // eYo.DelegateSvg.debugStartTrackingRender = true
    // console.log('SHOW CONNECTIONS', block.id, block.type)
    block.rendered || block.render()
  }
}

/**
 * Execute the handler with block rendering deferred to the end, if any.
 * handler
 * @param {!Function} handler `this` is the receiver.
 * @param {!Function} err_handler `this` is the receiver, one argument: the error catched.
 */
eYo.DelegateSvg.prototype.doAndRender = function (handler, group, err_handler) {
  var block = this.block_
  return function (event) {
    block.eyo.changeBegin()
    group && eYo.Events.setGroup(true)
    try {
      handler.call(block.eyo, event)
    } catch (err) {
      err_handler && err_handler.call(block.eyo, err) || console.error(err)
      throw err
    } finally {
      group && eYo.Events.setGroup(false)
      block.eyo.changeEnd()
    }
  }
}

/**
 * Move a block by a relative offset.
 * @param {number} dx Horizontal offset in character units.
 * @param {number} dy Vertical offset in character units.
 */
eYo.DelegateSvg.prototype.moveBy = function(dx, dy) {
  this.block_.moveBy(dx * eYo.Unit.x, dy * eYo.Unit.y)
}

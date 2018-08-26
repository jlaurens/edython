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
goog.provide('eYo.SelectedConnection')

goog.require('eYo.T3')
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
 * This is the shape used to draw an highlighted block contour.
 * @type {SVGPathElement}
 * @private
 */
eYo.DelegateSvg.prototype.svgPathHighlight_ = undefined

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

goog.require('eYo.Slot')

/**
 * Create and initialize the various paths.
 * Called once at block creation time.
 * Should not be called directly
 * The block implementation is created according to a dictionary
 * input model available through `getModel().slots`.
 * The structure of that dictionary is detailled in the treatment flow
 * below.
 * @param {!Blockly.Block} block to be initialized..
 */
eYo.DelegateSvg.prototype.initBlock = function (block) {
  eYo.DelegateSvg.superClass_.initBlock.call(this, block)
  // block.setInputsInline(true)
  block.setTooltip('')
  block.setHelpUrl('')
  var slots = Object.create(null)
  var headSlot
  var makeSlots = function (owner, slotsModel) {
    var ordered = []
    for (var k in slotsModel) {
      var slotModel = slotsModel[k]
      if (!slotModel) {
        continue
      }
      var order = slotModel.order
      var insert = slotModel.insert
      var slot, next
      if (insert) {
        var model = eYo.DelegateSvg.Manager.getModel(insert)
        if (model) {
          makeSlots(owner, model.slots)
          if ((slot = headSlot)) {
            next = slot
            do {
              goog.asserts.assert(!goog.isDef(slots[next.key]),
                'Duplicate inserted slot key %s/%s/%s', next.key, insert, block.type)
              slots[next.key] = next
            } while ((next = next.next))
          } else {
            continue
          }
        } else {
          continue
        }
      } else if (goog.isObject(slotModel) && (slot = new eYo.Slot(owner, k, slotModel))) {
        goog.asserts.assert(!goog.isDef(slots[k]),
          eYo.Do.format('Duplicate slot key {0}/{1}', k, block.type))
        slots[k] = slot
      } else {
        continue
      }
      slot.order = order
      for (var i = 0; i < ordered.length; i++) {
        // we must not find an aleady existing entry.
        goog.asserts.assert(i !== slot.order,
          eYo.Do.format('Same order slot {0}/{1}', i, block.type))
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
    }
    headSlot = ordered[0]
  }
  var model = this.getModel()
  makeSlots(this, model.slots)
  eYo.Slot.makeFields(this, model.fields)
  // now initialize all the fields
  this.headSlot = headSlot
  this.slots = slots
  // wait until the end to set the subtype because it causes rendering
  // bind the data and the ui when relevant.
  // We establish a bi directional bound between data, inputs and fields
  // now it is time to intialize the data
  this.initData(block)
}
console.warn('implement async and await, see above awaitable and asyncable')
/**
 * Revert operation of initBlock.
 * @param {!Blockly.Block} block to be initialized..
 */
eYo.DelegateSvg.prototype.deinitBlock = function (block) {
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
  goog.dom.removeNode(this.svgPathHighlight_)
  this.svgPathHighlight_ = undefined
  goog.dom.removeNode(this.svgPathConnection_)
  this.svgPathConnection_ = undefined
  eYo.DelegateSvg.superClass_.deinitBlock.call(this, block)
}

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 * @param {!Blockly.Block} block to be initialized..
 */
eYo.DelegateSvg.prototype.preInitSvg = function (block) {
}

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 * No rendering.
 * @param {!Blockly.Block} block to be initialized.
 */
eYo.DelegateSvg.prototype.postInitSvg = function (block) {
  if (this.svgPathContour_) {
    return
  }
  goog.dom.removeNode(block.svgPath_)
  delete block.svgPath_
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
  this.svgPathHighlight_ = Blockly.utils.createSvgElement('path', {
    'class': 'eyo-path-selected'
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
 * @param {!Blockly.Block} block to be modified.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.DelegateSvg.prototype.parentWillChange = function (block, newParent) {
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
 * @param {!Blockly.Block} block to be initialized.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.DelegateSvg.prototype.parentDidChange = function (block, newParent) {
  // This is the original code found in
  // `Blockly.BlockSvg.prototype.setParent`
  if (newParent) {
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
eYo.DelegateSvg.prototype.getField = function (block, name) {
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
 * Synchronize the slots with the UI.
 * Sends a `synchronize` message to all slots.
 * May be used at the end of an initialization process.
 */
eYo.DelegateSvg.prototype.synchronizeSlots = function (block) {
  this.foreachSlot(function () {
    this.synchronize()
  })
}

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
eYo.DelegateSvg.prototype.getMenuTarget = function (block) {
  var wrapped
  if (this.wrap && (wrapped = this.wrap.input.connection.targetBlock())) {
    return wrapped.eyo.getMenuTarget(wrapped)
  }
  if (this.wrappedInputs_ && this.wrappedInputs_.length === 1 &&
    (wrapped = this.wrappedInputs_[0][0].connection.targetBlock())) {
    // if there are more than one wrapped block,
    // then we choose none of them
    return wrapped.eyo.getMenuTarget(wrapped)
  }
  return block
}

/**
 * Disable rendering.
 * Must balance a `unskipRendering`.
 */
eYo.DelegateSvg.prototype.skipRendering = function () {
  this.skipRendering_ && ++this.skipRendering_ || (this.skipRendering_ = 1)
  if (eYo.Const.trackSkipRendering || eYo.Const.trackSkipRenderingByType) {
    console.log('..skipRendering', this.skipRendering_, this.block_.type, this.block_.id)
  }
}

/**
 * Enable rendering.
 * Must balance a `skipRendering`.
 */
eYo.DelegateSvg.prototype.unskipRendering = function () {
  --this.skipRendering_
  goog.asserts.assert(this.skipRendering_ >= 0, 'BALANCE FAILURE: unskipRendering')
  if (eYo.Const.trackSkipRendering || this.block_.type === eYo.Const.trackSkipRenderingByType) {
    console.log('unskipRendering', this.skipRendering_, this.block_.type, this.block_.id)
  }
}

/**
 * Render the given connection, if relevant.
 * @param {!Block} block
 * @param {!Blockly.Connection} block
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.DelegateSvg.prototype.renderDrawC8n_ = function (block, c8n) {
  if (!c8n) {
    return
  }
  var target = c8n.targetBlock()
  if (!target) {
    return
  }
  var doit = !target.rendered ||
  (!this.upRendering &&
    !eYo.Connection.disconnectedParentC8n &&
    !eYo.Connection.disconnectedChildC8n&&
    !eYo.Connection.connectedParentC8n)
  if (doit) {
    try {
      target.eyo.downRendering = true
      target.render(false)
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
 * @param {!Block} block
 * @return {boolean=} true if an rendering message was sent, false othrwise.
 */
eYo.DelegateSvg.prototype.renderDrawNext_ = function (block) {
  if (block.nextConnection && eYo.DelegateSvg.debugStartTrackingRender) {
    console.log(eYo.DelegateSvg.debugPrefix, 'NEXT')
  }
  return this.renderDrawC8n_(block, block.nextConnection)
}

/**
 * Render the suite block, if relevant.
 * @param {!Block} block
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.DelegateSvg.prototype.renderDrawSuite_ = function (block) {
  return
}

/**
 * Render the parent block, if relevant.
 * @param {boolean=} optBubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 * @return {boolean=} true if an rendering message was sent, false othrwise.
 */
eYo.DelegateSvg.prototype.renderDrawParent_ = function (block, optBubble) {
  if (optBubble === false || this.downRendering) {
    return
  }
  // Render all blocks above this one (propagate a reflow).
  // Only when the render message did not come from above!
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
        parent.render(!justConnected)
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
             parent.render()
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

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {!Block} block
 * @param {boolean=} optBubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
eYo.DelegateSvg.prototype.render = function (block, optBubble) {
    block || (block = this.block_)
  if (this.isDragging_ || !this.isReady_ || !block.workspace) {
    return
  }
  // rendering is very special when this is just a matter of
  // statement connection
  if (block.rendered) {
    if (eYo.Connection.disconnectedChildC8n && block.previousConnection === eYo.Connection.disconnectedChildC8n) {
      // this block is the top one
      this.layoutConnections_(block)
      this.renderMove_(block)
      this.updateAllPaths_(block)
      this.alignRightEdges_(block)
      return
    } else if (eYo.Connection.disconnectedParentC8n && block.nextConnection === eYo.Connection.disconnectedParentC8n) {
      // this block is the bottom one
      // but it may belong to a suite
      this.layoutConnections_(block)
      this.renderMove_(block)
      this.updateAllPaths_(block)
      this.renderDrawParent_(block, optBubble)
      return
    } else if (eYo.Connection.connectedParentC8n) {
      if (block.outputConnection && eYo.Connection.connectedParentC8n == block.outputConnection.targetConnection) {
        // this block has just been connected
        // no shortcut
      } else if (block.previousConnection && eYo.Connection.connectedParentC8n == block.previousConnection.targetConnection) {
        this.layoutConnections_(block)
        this.renderMove_(block)
        this.updateAllPaths_(block)
        this.renderDrawParent_(block, optBubble)  
      } else if (block.nextConnection && eYo.Connection.connectedParentC8n == block.nextConnection) {
        this.layoutConnections_(block)
        this.renderMove_(block)
        this.updateAllPaths_(block)
        var root = block.getRootBlock()
        root.eyo.alignRightEdges_(root)
        return
      }
    }
  }
  if (!this.downRendering && block.outputConnection && !this.skipRendering_) {
    // always render from a line start id est
    // an orphan block or a statement block
    var parent
    if ((parent = block.getParent())) {
      var next
      while (parent.outputConnection && (next = parent.getParent())) {
        parent = next
      }
      if (parent && !parent.eyo.downRendering) {
        if (!parent.eyo.upRendering && block.outputConnection === eYo.Connection.connectedParentC8n || eYo.Connection.connectedParentC8n && eYo.Connection.connectedParentC8n.sourceBlock_ === block) {
          try {
            parent.eyo.upRendering = true
            parent.eyo.render(parent,optBubble)
          } catch (err) {
            console.error(err)
            throw err
          } finally {
            parent.eyo.upRendering = false
          }
        } else {
          parent.eyo.render(parent,optBubble)
        }
      }
      return
    }
  }
  if (this.skipRendering_) {
    // do not render the model
    if (!this.downRendering) {
      this.layoutConnections_(block)
      this.renderMove_(block)
      this.updateAllPaths_(block)
      this.renderDrawParent_(block, optBubble)
      return // very important  
    } else /* if (this.downRendering) */ {
      this.layoutConnections_(block)
      this.renderMove_(block)
      this.renderDrawSuite_(block)
      this.updateAllPaths_(block)
      this.renderDrawNext_(block)
        return // very important  
    } 
  }
  // if (this.wrapped_ && !block.getParent()) {
  //   console.log('wrapped block with no parent')
  //   setTimeout(function(){block.dispose()}, 10)
  //   block.dispose()
  //   return
  // }
  this.skipRendering()
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
    this.minWidth = block.width = 0
    this.willRender_(block)
    this.renderDraw_(block)
    this.renderDrawNext_(block)
    this.layoutConnections_(block)
    this.renderMove_(block)
    this.renderDrawParent_(block, optBubble)
    block.rendered = true
    this.didRender_(block)
    if (eYo.traceOutputConnection && block.outputConnection) {
      console.log('block.outputConnection', block.outputConnection.x_, block.outputConnection.y_)
    }
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    if (eYo.DelegateSvg.debugStartTrackingRender &&  eYo.DelegateSvg.debugPrefix.length) {
      eYo.DelegateSvg.debugPrefix = eYo.DelegateSvg.debugPrefix.substring(1)
    }
    this.unskipRendering()
    // goog.asserts.assert(!this.skipRendering_, 'FAILURE')
    Blockly.Field.stopCache()  
  }
  // block.workspace.logAllConnections('didRender')
}

/**
 * Sends a `consolidate` message to each component of the block.
 * However, there might be some caveats related to undo management.
 * @param {!Block} block
 */
eYo.DelegateSvg.prototype.consolidate = function (block, deep, force) {
  if (!Blockly.Events.recordUndo) {
    // do not consolidate while un(re)doing
    return
  }
  this.foreachData(function () {
    this.consolidate()
  })
  this.foreachSlot(function () {
    this.consolidate()
  })
  if (deep) {
    var e8r = block.eyo.inputEnumerator(block)
    var x
    while (e8r.next()) {
      if ((x = e8r.here.connection) && (x = x.targetBlock())) {
        x.eyo.consolidate(x, deep, force)
      }
    }
  }
  this.consolidateType(block)
}

/**
 * Whether the block is sealed to its parent.
 * The sealed status is decided at init time.
 * The corresponding input.eyo.connection.wrapped_ is set to true.
 * @private
 */
eYo.DelegateSvg.prototype.wrapped_ = undefined

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block
 * @private
 */
eYo.DelegateSvg.prototype.willRender_ = function (block) {
  if (block.svgGroup_ && this.skipRendering_ < 2) {
    var F = this.locked_ && block.outputConnection && block.getSurroundParent()
      ? goog.dom.classlist.add
      : goog.dom.classlist.remove
    var FF = function (elt, classname) {
      if (/** @type {!Element} */(elt)) {
        F(elt, classname)
      }
    }
    FF(block.svgGroup_, 'eyo-locked')
    FF(this.svgPathShape_, 'eyo-locked')
    FF(this.svgPathContour_, 'eyo-locked')
    FF(this.svgPathCollapsed_, 'eyo-locked')
    FF(this.svgPathHighlight_, 'eyo-locked')
      // change the class of the shape on error
    F = Object.keys(this.errors).length
      ? goog.dom.classlist.add
      : goog.dom.classlist.remove
    FF(this.svgPathShape_, 'eyo-error')
    FF(this.svgPathContour_, 'eyo-error')
    FF(this.svgPathCollapsed_, 'eyo-error')
    FF(this.svgPathHighlight_, 'eyo-error')
  }
}

/**
 * Did draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block
 * @private
 */
eYo.DelegateSvg.prototype.didRender_ = function (block) {
}

/**
 * Layout previous, next and output block connections.
 * @param {!Block} block
 * @private
 */
eYo.DelegateSvg.prototype.renderMove_ = function (block) {
  block.renderMoveConnections_()
  var blockTL = block.getRelativeToSurfaceXY()
  this.foreachSlot(function () {
    var input = this.input
    if(input) {
      var c8n = input.connection
      if (c8n) {
        c8n.moveToOffset(blockTL)
        if (c8n.isConnected()) {
          c8n.tighten_();
        }
      }
    }
  })
}

/**
 * Layout previous, next and output block connections.
 * @param {!Block} block
 * @private
 */
eYo.DelegateSvg.prototype.layoutConnections_ = function (block) {
  if (block.outputConnection) {
    block.outputConnection.setOffsetInBlock(0, 0)
  } else {
    if (block.previousConnection) {
      block.previousConnection.setOffsetInBlock(0, 0)
    }
    if (block.nextConnection) {
      if (block.isCollapsed()) {
        block.nextConnection.setOffsetInBlock(0, 2 * eYo.Font.lineHeight())
      } else {
        block.nextConnection.setOffsetInBlock(0, block.height)
      }
    }
  }
}

/**
 * Block shape. Default implementation throws.
 * Subclasses must override it. Used in renderDraw_.
 * @param {!eYo.Block} block
 * @private
 */
eYo.DelegateSvg.prototype.shapePathDef_ = function (block) {
  goog.asserts.assert(false, 'shapePathDef_ must be overriden by ' + this)
}

/**
 * Block outline. Default implementation forwards to shapePathDef_.
 * @param {!eYo.Block} block
 * @private
 */
eYo.DelegateSvg.prototype.contourPathDef_ = eYo.DelegateSvg.prototype.shapePathDef_

/**
 * Highlighted block outline. Default implementation forwards to shapePathDef_.
 * @param {!eYo.Block} block
 * @private
 */
eYo.DelegateSvg.prototype.highlightPathDef_ = eYo.DelegateSvg.prototype.shapePathDef_

/**
 * Highlighted connection outline.
 * When a block is selected and one of its connection is also selected
 * the ui displays a bold line on the connection. When the block has wrapped input,
 * the selected connection may belong to a wrapped block.
 * @param {!eYo.Block} block
 * @private
 */
eYo.DelegateSvg.prototype.connectionPathDef_ = function (block) {
  return this.selectedConnection
    ? this.highlightConnectionPathDef(block, this.selectedConnection)
    : ''
}

/**
 * Extra disabled block outline. Default implementation return a void string.
 * @param {!eYo.Block} block
 * @private
 */
eYo.DelegateSvg.prototype.collapsedPathDef_ = function () {
  return ''
}

/**
 * Draw the path of the block.
 * @param {!eYo.Block} block
 * @private
 */
eYo.DelegateSvg.prototype.renderDraw_ = function (block) {
  if (this.svgPathInner_) {
    // if the above path does not exist
    // the block is not yet ready for rendering
    block.height = eYo.Font.lineHeight()
    var d, unlocker
    try {
      // chain the tiles to properly manage spaces between tiles
      unlocker = this.chainTiles(block)
      d = this.renderDrawModel_(block)
      this.svgPathInner_.setAttribute('d', d)
    } catch (err) {
      console.error (err)
      throw err
    } finally {
      unlocker && unlocker.eyo.unlockChainTiles(unlocker)
      var root = block.getRootBlock()
      if (root.eyo) {
        root.eyo.alignRightEdges_(root)
      }
      this.renderDrawSuite_(block)
      this.updateAllPaths_(block)
    }
  }
}

/**
 * Align the right edges by changing the size of all the connected statement blocks.
 * The default implementation does nothing.
 * @param {!eYo.Block} block
 * @protected
 */
eYo.DelegateSvg.prototype.alignRightEdges_ = function (block) {
  var right = 0
  var e8r = eYo.StatementBlockEnumerator(block)
  var b
  var t = eYo.Font.tabWidth
  while ((b = e8r.next())) {
    if (b.eyo) {
      if (b.eyo.minWidth) {
        right = Math.max(right, b.eyo.minWidth + t * e8r.depth())
      } else {
        return
      }
    }
  }
  e8r = eYo.StatementBlockEnumerator(block)
  while ((b = e8r.next())) {
    if (b.eyo) {
      var width = right - t * e8r.depth()
      if (b.width !== width) {
        b.width = width
        b.eyo.updateAllPaths_(b)
      }
    }
  }
}

/**
 * Compute the paths of the block depending on its size.
 * @param {!eYo.Block} block
 * @private
 */
eYo.DelegateSvg.prototype.updatePath_ = function (block, path, def) {
  if (path) {
    if (def) {
      try {
        var d = def.call(this, block)
        if (d.indexOf('NaN') >= 0) {
          d = def.call(this, block)
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
eYo.DelegateSvg.prototype.updateAllPaths_ = function (block) {
  if (this.wrapped_) {
    this.updatePath_(block, this.svgPathContour_)
    this.updatePath_(block, this.svgPathShape_)
    this.updatePath_(block, this.svgPathHighlight_)
    this.updatePath_(block, this.svgPathConnection_, this.connectionPathDef_)
    this.updatePath_(block, this.svgPathCollapsed_)
  } else {
    this.updatePath_(block, this.svgPathContour_, this.contourPathDef_)
    this.updatePath_(block, this.svgPathShape_, this.shapePathDef_)
    this.updatePath_(block, this.svgPathHighlight_, this.highlightPathDef_)
    this.updatePath_(block, this.svgPathConnection_, this.connectionPathDef_)
    this.updatePath_(block, this.svgPathCollapsed_, this.collapsedPathDef_)
  }
}

/**
 * The left padding of a block.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.prototype.getPaddingLeft = function (block) {
  if (this.wrapped_) {
    return 0
  } else if (block.outputConnection) {
    if (this.tileHead) {
      
      var child = this.tileHead.sourceBlock_
      if (child && (child === block) && (this.tileHead === child.eyo.tileHead)) {
        return this.isHeadOfStatement ? 0 : eYo.Font.space
      }
    }
    var parent = block.getParent()
    return (this.locked_ || this.isHeadOfStatement) && parent ? 0 : eYo.Font.space
  } else {
    return eYo.Font.space // eYo.Padding.l()
  }
}

/**
 * The right padding of a block.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.prototype.getPaddingRight = function (block) {
  if (this.wrapped_) {
    return 0
  } else if (block.outputConnection) {
    return this.locked_ && block.getParent() ? 0 : eYo.Font.space
  } else {
    return eYo.Padding.r()
  }
}

/**
 * Render the inputs of the block.
 * @param {!Blockly.Block} block
 * @protected
 */
eYo.DelegateSvg.prototype.minBlockWidth = function (block) {
  return 0
}

/**
 * A tile is a field to be displayed.
 * Tiles are stacked horizontally to draw the block content.
 * There is no (as of june 2018) support for line break inside blocks.
 * Each tile has a delegate who implements `tileNext` and `tilePrevious`.
 * The purpose is to chain the tiles before rendering.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.prototype.unlockChainTiles = function (block) {
  this.chainTiles_locked = false // unlock now
  var slot
  var unlock = function (input) {
    if (!input) {
      return
    }
    var c8n, target
    if ((c8n = input.connection)) {
      if ((target = c8n.targetBlock()) && target.outputConnection) {
        target.eyo.unlockChainTiles(target)
      }
    } 
  }
  if ((slot = this.headSlot)) {
    do {
      unlock(slot.input)
    } while ((slot = slot.next))
  } else {
    for (var i = 0, input; (input = block.inputList[i]); i++) {
      unlock(input)
    }
  }
}

/**
 * A tile is either a field or a connection to be displayed.
 * Tiles are stacked horizontally to draw the block content.
 * There is no (as of june 2018) support for line break inside blocks.
 * Each tile has a delegate who implements `tileNext` and `tilePrevious`.
 * The purpose is to chain the tiles before rendering in order to
 * add or remove space between blocks.
 * Each block has a tile chain.
 * Statement blocks and standalone value blocks have standalone chains.
 * Value blocks' chain is a subchain of the parent's one
 * when there is a parent.
 * The chain depends on the inner connected blocks.
 * If an inner connection is closed, the chain changes.
 * If an inner connection is established, the chain changes too.
 * If the block tile chain changes, the parent's chain changes too.
 * When does the chain should be in stable state?
 * Answer: just before rendering the statement block or
 * the standalone value block.
 * When an operation may change some tile chain,
 * rendering should start from the proper root node which is
 * the first enclosing statement block if any or the root if none.
 * There is a collision with up rendering and down rendering concept.
 * When the chain has changed, there must be some down rendering,
 * at least for the blocks which chain has changed.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.prototype.chainTiles = function () {
  // this is a closure
  /**
   * Chain the fields.
   * In stable state, there is no tileHead without a tileTail
   * @param {*} headField A field within a field chain
   * @return {*} The tail field of the last chain element, if any
   */
  var chainFields = function (headField) {
    var head, tile
    // the head is the first visible field
    if ((head = headField)) {
      headField.eyo.tileHead = null
      headField.eyo.tileTail = null
      while (!head.isVisible()) {
        if(!(head = head.eyo.nextField)) {
          return
        }
      }
      tile = head
      tile.eyo.tilePrevious = null
      var next = tile
      // first unchain all
      while ((next = next.eyo.nextField)) {
        next.eyo.tilePrevious = tile.eyo.tileNext = null
        tile = next
      }
      // then chain all
      next = tile = head
      while ((next = next.eyo.nextField)) {
        if (next.isVisible()) {
          next.eyo.tilePrevious = tile
          tile.eyo.tileNext = next
          tile = next
        }
      }
      tile.eyo.tileNext = null
      headField.eyo.tileHead = head
      headField.eyo.tileTail = tile
      return headField.eyo.tileTail
    }
  }
  /**
   * Merges the chains of left and right
   * There is no tileHead without a tileTail
   * @param {*} left An eyo like object which receives the merge.
   * @param {*} right An object with an eyo
   * @return {*} the last element
   */
  var chainMerge = function (left, right) {
    if (left && right && right.eyo.tileHead) {
      if (left.tileHead) {
        left.tileTail.eyo.tileNext = right.eyo.tileHead
        right.eyo.tileHead.eyo.tilePrevious = left.tileTail
      } else {
        left.tileHead = right.eyo.tileHead
      }
      return left.tileTail = right.eyo.tileTail
    }
  }
  var chainMergeVA = function () {
    var left = arguments[0]
    if (left) {
      var i = 1
      while (i < arguments.length) {
        chainMerge(left, arguments[i++])
      }
      return true
    }
  }
  var chainInput = function (input) {
    // what about visible blocks ?
    if (!input) {
      return
    }
    input.eyo.tileHead = undefined
    input.eyo.tileTail = undefined
    // what about visible blocks ?
    if (!input.isVisible()) {
      return
    }
    // As there is a double entry for fields, we do not assume
    // that fields do not belong to a chain
    var j = 0
    var field, nextField
    while ((field = input.fieldRow[j++])) {
      while ((nextField = field.eyo.nextField)) {
        field = nextField
      }
      while ((nextField = input.fieldRow[++j])) {
        if (nextField.eyo.previousField) {
          // this field already belongs to a chain
          // so we ignore it
          continue
        } else {
          field.eyo.nextField = nextField
          nextField.eyo.previousField = field
          do {
            field = nextField
          } while ((nextField = field.eyo.nextField))
        }
      }
      field.eyo.nextField = null
    }
    chainFields(input.fieldRow[0])
    chainMerge(input.eyo, input.fieldRow[0])
    var c8n, target
    if ((c8n = input.connection)) {
      c8n.eyo.tilePrevious = null
      c8n.eyo.tileNext = null
      if ((target = c8n.targetBlock()) && target.outputConnection) {
        target.eyo.chainTiles(target)
        chainMerge(input.eyo, target)
      } else if (c8n.hidden_) {
        c8n.eyo.tileHead = undefined
        c8n.eyo.tileTail = undefined
      } else {
        c8n.eyo.tileHead = c8n
        c8n.eyo.tileTail = c8n
        chainMerge(input.eyo, c8n)
      }
    } 
  }
  return function (block) {
    if (this.chainTiles_locked) {
      return
    }
    this.chainTiles_locked = true
    // clean state
    this.tileHead = undefined
    this.tileTail = undefined
    // chain
    chainFields(this.fromStartField)
    chainMerge(this, this.fromStartField)
    var slot
    if ((slot = this.headSlot)) {
      do {
        if (slot.isIncog()) {
          continue
        }
        chainFields(slot.fromStartField)
        chainInput(slot.input)
        chainFields(slot.toEndField)
        chainMergeVA(this, slot.fromStartField, slot.input, slot.toEndField)
      } while ((slot = slot.next))
    } else {
      for (var i = 0, input; (input = block.inputList[i]); i++) {
        chainInput(input)
        chainMerge(this, input)
      }
    }
    chainFields(this.toEndField)
    chainMerge(this, this.toEndField)
    this.tileHead && (this.tileHead.eyo.chainBlock = block)
    return block
  }
} ()

/**
 * Render the inputs, the fields and the slots of the block.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.prototype.renderDrawModel_ = function (block) {
  /* eslint-disable indent */
  var io = {
    block: block,
    steps: [],
    canDummy: true,
    canValue: true,
    canStatement: true,
    canList: true,
    canForif: true,
    i: 0, // input index
    i_max: block.inputList.length,
    f: 0, // field index
    /** ?Object */ field: undefined,
    /** boolean */ canStarSymbol: true
  }
  io.cursorX = this.getPaddingLeft(block)
  io.offsetX = 0
  if (!block.outputConnection) {
    this.renderDrawSharp_(io)
    this.shouldSeparateField = false // when true, add a space to separate letters
    // only blocks with outputConnection may be stacked horizontally
    // such that visual letter separation may be a problem
    // For other blocks, there is no text field rendered to the left
  } else if (!block.outputConnection.isConnected() || (!this.wrapped_ && !this.locked_)) {
    // the left part of the contour is the visual separator
    this.shouldSeparateField = false
  }
  io.shouldSeparateField = this.shouldSeparateField
  io.wasSeparatorField = this.wasSeparatorField
  // isHeadOfStatement can be set by the parent block,
  io.isHeadOfStatement = !this.disabled && (!block.outputConnection || this.isHeadOfStatement)

  if ((io.field = this.fromStartField)) {
    io.f = 0
    do {
      this.renderDrawField_(io)
      ++io.f
    } while ((io.field = io.field.eyo.nextField))
  }
  if ((io.slot = this.headSlot)) {
    do {
      this.renderDrawSlot_(io)
    } while ((io.slot = io.slot.next))
  } else {
    for (; (io.input = block.inputList[io.i]); io.i++) {
      goog.asserts.assert(io.input.eyo, 'Input with no eyo ' + io.input.name + ' in block ' + block.type)
      if (io.input.isVisible()) {
        this.renderDrawInput_(io)
      } else {
        for (var j = 0; (io.field = io.input.fieldRow[j]); ++j) {
          if (io.field.getText().length > 0) {
            var root = io.field.getSvgRoot()
            if (root) {
              root.setAttribute('display', 'none')
            } else {
              // console.log('Field with no root: did you ...initSvg()?')
            }
          }
        }
        if ((io.c8n = io.input.connection)) {
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
    }
  }
  if ((io.field = this.toEndField)) {
    do {
      this.renderDrawField_(io)
    } while ((io.field = io.field.eyo.nextField))
  }
  // enlarge the width if necessary
  io.cursorX = Math.max(io.cursorX, this.minBlockWidth())
  io.cursorX += this.getPaddingRight(block)
  this.minWidth = block.width = Math.max(block.width, io.cursorX)
  this.shouldSeparateField = io.shouldSeparateField
  return io.steps.join(' ')
}

/**
 * Render the the slot in `io.slot`.
 * @param io
 * @private
 */
eYo.DelegateSvg.prototype.renderDrawSlot_ = function (io) {
  var root = io.slot.getSvgRoot()
  goog.asserts.assert(root, 'Slot with no root')
  if (io.slot.isIncog()) {
    root.setAttribute('display', 'none')
  } else {
    root.removeAttribute('display')
    root.setAttribute('transform',
    'translate(' + io.cursorX + ', 0)')
    io.offsetX = io.cursorX
    io.cursorX = 0
    if ((io.editField = io.slot.editField)) {
      var c8n = io.slot.input && io.slot.input.connection
      io.editField.setVisible(!c8n || !c8n.targetBlock())       
    }
    if ((io.field = io.slot.fromStartField)) {
      do {
        this.renderDrawField_(io)
      } while ((io.field = io.field.eyo.nextField))
    }
    if ((io.input = io.slot.input)) {
      io.editField = io.slot.editField
      this.renderDrawInput_(io)
      io.editField = undefined
    }
    if ((io.field = io.slot.toEndField)) {
      do {
        this.renderDrawField_(io)
      } while ((io.field = io.field.eyo.nextField))
    }
    io.cursorX += io.offsetX
    io.offsetX = 0
    io.canStarSymbol = false
  }
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
 * Render the field at io.field, which must be defined.
 *
 * @param io An input/output record.
 * @private
 */
eYo.DelegateSvg.prototype.renderDrawField_ = function (io) {
  var root = io.field.getSvgRoot()
  if (root) {
    if (!io.field.isVisible()) {
      root.setAttribute('display', 'none')
    } else {
      root.removeAttribute('display')
      var text = io.field.getDisplayText_()
      var eyo = io.field.eyo
      if (text.length) {
        io.isSeparatorField = io.field.name === 'separator'
        // if the text is void, it can not change whether
        // the last character was a letter or not
        if (!io.isSeparatorField && !io.wasSeparatorField && io.shouldSeparateField && !io.starSymbol && (eYo.XRE.operator.test(text[0]) || text[0] === '.' || eYo.XRE.id_continue.test(text[0]) || eyo.isEditing) && eyo.tilePrevious) {
          // add a separation
          io.cursorX += eYo.Font.space
        }
        // if (!io.isSeparatorField && !io.wasSeparatorField && io.shouldSeparateField && !io.starSymbol && (eYo.XRE.operator.test(text[0]) || text[0] === '.' || eYo.XRE.id_continue.test(text[0]) || eyo.isEditing) && (!this.isHeadOfStatement)) {
        //   // add a separation
        //   io.cursorX += eYo.Font.space
        // }
        io.isHeadOfStatement = false
        io.starSymbol = (io.canStarSymbol && (['*', '@', '+', '-', '~', '.'].indexOf(text[text.length - 1]) >= 0))
        io.canStarSymbol = false
        io.shouldSeparateField = !io.starSymbol && (eYo.XRE.id_continue.test(text[text.length - 1]) ||
        eYo.XRE.operator.test(text[text.length - 1]) ||
        text[text.length - 1] === ':' ||
        (text[text.length - 1] === '.' && !((io.field) instanceof eYo.FieldTextInput)))
        io.wasSeparatorField = io.isSeparatorField
        io.isSeparatorField = false
      }
      var x_shift = eyo && !io.block.eyo.wrapped_ ? eyo.x_shift || 0 : 0
      root.setAttribute('transform', 'translate(' + (io.cursorX + x_shift) +
        ', ' + eYo.Padding.t() + ')')
      var size = io.field.getSize()
      io.cursorX += size.width
      if (eyo.isEditing) {
        io.cursorX += eYo.Font.space
      }
    }
  } else {
    console.log('Field with no root: did you ...initSvg()?')
  }
}

/**
 * Render the fields of a block input.
 *
 * @param io An input/output record.
 * @param only_prefix boolean
 * @return the delta of io.cursorX
 * @private
 */
eYo.DelegateSvg.prototype.renderDrawFields_ = function (io, only_prefix) {
  var here = io.cursorX
  io.f = 0
  for (; (io.field = io.input.fieldRow[io.f]); ++io.f) {
    if (!!only_prefix === !io.field.eyo.suffix) {
      this.renderDrawField_(io)
    }
  }
  return here - io.cursorX
}

/**
 * Render the fields of a dummy input, if relevant.
 * @param io An input/output record.
 * @private
 */
eYo.DelegateSvg.prototype.renderDrawDummyInput_ = function (io) {
  if (!io.canDummy || io.input.type !== Blockly.DUMMY_INPUT) {
    return false
  }
  this.renderDrawFields_(io, true)
  this.renderDrawFields_(io, false)
  return true
}

/**
 * Render the fields of a value input, if relevant.
 * @param io the input/output argument.
 * @private
 */
eYo.DelegateSvg.prototype.renderDrawValueInput_ = function (io) {
  if (!io.canValue || io.input.type !== Blockly.INPUT_VALUE) {
    return false
  }
  var c8n = io.input.connection
  if (c8n) { // once `&&!c8n.hidden_` was there, bad idea but why was it here?
    this.renderDrawFields_(io, true)
    var cursorX = io.cursorX + io.offsetX
    var target = c8n.targetBlock()
    if (io.editField && !target) {
      c8n.eyo.doNotSelect = true
      c8n.eyo.editWidth = io.editField.getSize().width
      c8n.setOffsetInBlock(cursorX - c8n.eyo.editWidth - eYo.Font.space / 2, 0)
    } else {
      delete c8n.eyo.doNotSelect
      delete c8n.eyo.editWidth
      c8n.setOffsetInBlock(cursorX, 0)
    }
    c8n.eyo.isHeadOfStatement = io.isHeadOfStatement
    if (target) {
      var root = target.getSvgRoot()
      if (root) {
        c8n.tighten_()
        try {
          target.eyo.downRendering = true
          target.eyo.shouldSeparateField = io.shouldSeparateField
          target.eyo.wasSeparatorField = io.wasSeparatorField
          target.eyo.isHeadOfStatement = io.isHeadOfStatement
          if (io.block.outputConnection !== eYo.Connection.disconnectedChildC8n && !target.eyo.upRendering) {
            if (eYo.DelegateSvg.debugStartTrackingRender) {
              console.log(eYo.DelegateSvg.debugPrefix, 'DOWN')
            }
            target.render(false)
          }      
         } catch(err) {
           console.error(err)
           throw err
         } finally {
          target.eyo.downRendering = false
          // target.eyo.isHeadOfStatement = keep it unchanged
          target.eyo.shouldSeparateField = undefined
          target.eyo.wasSeparatorField = undefined
          io.shouldSeparateField = (target.eyo.wrapped_ || target.eyo.locked_) && target.eyo.shouldSeparateField
          var bBox = target.getHeightWidth()
          io.cursorX += bBox.width
        }
      }
    } else if (io.editField) {
    } else if (!this.locked_ && !c8n.hidden_) {
      // locked blocks won't display any placeholder
      // (input with no target)
      var eyo = c8n.eyo
      if (!eyo.disabled_) {
        var pw = eyo.s7r_ || eyo.optional_
        ? this.carretPathDefWidth_(cursorX)
        : this.placeHolderPathDefWidth_(cursorX, c8n)
        io.steps.push(pw.d)
        io.cursorX += pw.width
        if (pw.width) {
          // a space was added as a visual separator anyway
          io.shouldSeparateField = false
        }
      }
    }
    this.renderDrawFields_(io, false)
    io.isHeadOfStatement = false
  }
  return true
}

/**
 * Block path.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.prototype.valuePathDef_ = function (block) {
  var w = block.width
  var h = block.height
  var p = eYo.Padding.h()
  var r_expr = (p ** 2 + h ** 2 / 4) / 2 / p // radius of left and right arcs
  var dx = (eYo.Font.space - p) / 2 // offset of the left and right arcs
  var a_expr = [' a ', r_expr, ', ', r_expr, ' 0 0 1 0,']
  var h_total = h + 2 * eYo.Margin.V
  // start with the right edge
  var steps = ['m ', w - eYo.Font.space + dx, ',-', eYo.Margin.V]
  steps = steps.concat(a_expr)
  steps.push(h_total)
  // next are for statement shape
  var rr = eYo.Style.Path.radius()
  var aa = [' a ', rr, ', ', rr, ' 0 0 1 ']
  var parent
  // the left edge is different when the block is the head of a statement
  if (this.tileHead && !this.tileHead.eyo.tilePrevious && (parent = block.getParent())) {
    while (parent && parent.outputConnection) {
      parent = parent.getParent()
    }
    if (parent) {
      if (parent.nextConnection && parent.nextConnection.isConnected()) {
        steps.push(' H ', -eYo.Padding.l())
        if (parent.previousConnection && parent.previousConnection.isConnected()) {
          steps.push(' v ', -h_total, ' z')
        } else {
          steps.push(' v ', -h_total + rr)
          steps = steps.concat(aa)
          steps.push(rr, ',', -rr, ' z')
        }
      } else {
        steps.push(' H ', -eYo.Padding.l() + rr)
        steps = steps.concat(aa)
        steps.push(-rr, ',', -rr)
        if (parent.previousConnection && parent.previousConnection.isConnected()) {
          steps.push(' v ', -h_total + rr, ' z')
        } else {
          steps.push(' v ', -h_total + 2 * rr)
          steps = steps.concat(aa)
          steps.push(rr, ',', -rr, ' z')
        }
      }
    } else {
      steps.push(' H ', dx + p)
      steps = steps.concat(a_expr)
      steps.push(-h_total, ' z')
    }
  } else {
    steps.push(' H ', dx + p)
    steps = steps.concat(a_expr)
    steps.push(-h_total, ' z')
  }
  return steps.join('')
}

/**
 * Block path.
 * @param {goog.size} size
 * @private
 */
eYo.DelegateSvg.prototype.outPathDef_ = function () {
  // Top edge.
  var p = eYo.Padding.h()
  var r = (p ** 2 + eYo.Font.lineHeight() ** 2 / 4) / 2 / p
  var dx = (eYo.Font.space - p) / 2
  var a = ' a ' + r + ', ' + r + ' 0 0 1 0,'
  var h = eYo.Font.lineHeight() + 2 * eYo.Margin.V
  return 'm ' + (dx + p) + ',' + (h - eYo.Margin.V) + a + (-h)
}

/**
 * Block path.
 * @param {Number} height
 * @param {Number} x position.
 * @private
 */
eYo.DelegateSvg.prototype.carretPathDefWidth_ = function (cursorX) {
  /* eslint-disable indent */
  var size = {width: eYo.Font.space, height: eYo.Font.lineHeight()}
  var p = eYo.Padding.h()
  var r = (p ** 2 + size.height ** 2 / 4) / 2 / p
  var dy = eYo.Padding.v() + eYo.Font.descent / 2
  var a = ' a ' + r + ', ' + r + ' 0 0 1 0,'
  var h = size.height + 2 * eYo.Margin.V
  var d = 'M ' + (cursorX + size.width / 2) +
  ',' + (eYo.Margin.V + dy) + a + (h - 2 * dy) + a + (-h + 2 * dy) + ' z'
  return {width: size.width, d: d}
} /* eslint-enable indent */

/**
 * Block path.
 * @param {Number} height
 * @param {Number} x position.
 * @private
 */
eYo.DelegateSvg.prototype.placeHolderPathDefWidth_ = function (cursorX, connection) {
  /* eslint-disable indent */
  var size = {
    width: connection && goog.isDef(connection.eyo.editWidth)
      ? connection.eyo.editWidth + eYo.Font.space
      : 3 * eYo.Font.space,
    height: eYo.Font.lineHeight()
  }
  var w = size.width
  var h = size.height
  var p = eYo.Padding.h()
  var r_ph = (p ** 2 + h ** 2 / 4) / 2 / p
  var a = [' a ', r_ph , ',', r_ph, ' 0 0 1 0,']
  var h_total = h + 2 * eYo.Margin.V
  var correction = eYo.Font.descent / 2
  var dy = eYo.Padding.v() + eYo.Font.descent / 2 - correction
  var steps
  if (!connection || (connection.eyo.chainBlock && connection.eyo.chainBlock.outputConnection)) {
    steps = ['M ', cursorX + w - p, ',', eYo.Margin.V + dy]
    steps = steps.concat(a)
    steps.push(h_total - 2 * dy, 'h ', -(w - 2 * p))
    steps = steps.concat(a)
    steps.push(-h_total + 2 * dy, ' z')
    return {width: w, d: steps.join('')}
  } else if (true) {
    steps = ['M ', cursorX + w - p, ',', eYo.Margin.V + dy]
    steps = steps.concat(a)
    steps.push(h_total - 2 * dy, 'h ', -(w - 2 * p))
    steps = steps.concat(a)
    steps.push(-h_total + 2 * dy, ' z')
    return {width: w, d: steps.join('')}
  } else {
    steps = ['M ', cursorX + w - p, ',', eYo.Margin.V + dy]
    steps = steps.concat(a)
    var r_stmt = eYo.Style.Path.radius()
    var cy = r_stmt - eYo.Margin.V - dy
    if (true || cy) {
      var cx = Math.sqrt(r_stmt ** 2 + cy ** 2) - r_stmt
      steps.push(h_total - 2 * dy, 'h ', -(w - p + eYo.Padding.l()) + cx)
      var a_stmt_ph = [' a ', r_stmt , ',', r_stmt, ' 0 0 1 ']
      steps = steps.concat(a_stmt_ph)
      steps.push(-cx, ',', -cy)
      steps.push('v ', -h_total + 2 * dy + 2 * cy)
      steps = steps.concat(a_stmt_ph)
      steps.push(cx, ',', -cy)
    } else {
      steps.push('v', -h_total + 2 * dy)
    }
    steps.push(' z')
    return {width: w, d: steps.join('')}
  }
} /* eslint-enable indent */

/**
 * @param {!Blockly.Block} block The owner of the delegate.
 * @param {!Blockly.Connection} c8n The connection to highlight.
 */
eYo.DelegateSvg.prototype.highlightConnectionPathDef = function (block, c8n) {
  var steps = ''
  block = c8n.sourceBlock_
  if (c8n.type === Blockly.INPUT_VALUE) {
    if (c8n.isConnected()) {
      steps = this.valuePathDef_(c8n.targetBlock())
    } else if (!c8n.eyo.disabled_ && (c8n.eyo.s7r_ || c8n.eyo.optional_)) {
      steps = this.carretPathDefWidth_(c8n.offsetInBlock_.x).d
    } else {
      steps = this.placeHolderPathDefWidth_(c8n.offsetInBlock_.x, c8n).d
    }
  } else if (c8n.type === Blockly.OUTPUT_VALUE) {
    steps = this.valuePathDef_(block)
  } else {
    var r = eYo.Style.Path.Selected.width / 2
    var a = ' a ' + r + ',' + r + ' 0 0 1 0,'
    if (c8n === block.previousConnection) {
      steps = 'm ' + block.width + ',' + (-r) + a + (2 * r) + ' h ' + (-block.width + eYo.Font.space - eYo.Padding.l()) + a + (-2 * r) + ' z'
    } else if (c8n === block.nextConnection) {
      if (block.height > eYo.Font.lineHeight()) { // this is not clean design
        steps = 'm ' + (eYo.Font.tabWidth + eYo.Style.Path.radius()) + ',' + (block.height - r) + a + (2 * r) + ' h ' + (-eYo.Font.tabWidth - eYo.Style.Path.radius() + eYo.Font.space - eYo.Padding.l()) + a + (-2 * r) + ' z'
      } else {
        steps = 'm ' + block.width + ',' + (block.height - r) + a + (2 * r) + ' h ' + (-block.width + eYo.Font.space - eYo.Padding.l()) + a + (-2 * r) + ' z'
      }
    } else {
      steps = 'm ' + (block.width) + ',' + (-r + eYo.Font.lineHeight()) + a + (2 * r) + ' h ' + (eYo.Font.tabWidth - block.width) + a + (-2 * r) + ' z'
    }
  }
  return steps
}

/**
 * @param {!Blockly.Connection} c8n The connection to highlight.
 */
eYo.DelegateSvg.prototype.highlightConnection = function (block, c8n) {
  var steps
  if (c8n.type === Blockly.INPUT_VALUE) {
    if (c8n.isConnected()) {
      steps = this.valuePathDef_(c8n.targetBlock())
    } else if (!c8n.eyo.disabled_ && (c8n.eyo.s7r_ || c8n.eyo.optional_)) {
      steps = this.carretPathDefWidth_(0).d
    } else {
      steps = this.placeHolderPathDefWidth_(0, c8n).d
    }
  } else if (c8n.type === Blockly.OUTPUT_VALUE) {
    steps = this.valuePathDef_(block)
  } else {
    var w = block.width
    var r = eYo.Style.Path.Selected.width / 2
    var a = ' a ' + r + ',' + r + ' 0 0 1 0,'
    steps = 'm ' + w + ',' + (-r) + a + (2 * r) + ' h ' + (-w + eYo.Font.space - eYo.Padding.l()) + a + (-2 * r) + ' z'
  }
  var xy = block.getRelativeToSurfaceXY()
  var x = c8n.x_ - xy.x
  var y = c8n.y_ - xy.y
  Blockly.Connection.highlightedPath_ =
  Blockly.utils.createSvgElement('path',
    {'class': 'blocklyHighlightedConnectionPath',
      'd': steps,
      transform: 'translate(' + x + ',' + y + ')'},
    block.getSvgRoot())
}

/**
 * Fetches the named input object.
 * @param {!Blockly.Block} name The name of the input.
 * @param {!String} name The name of the input.
 * @param {?Boolean} dontCreate Whether the receiver should create inputs on the fly. Ignored.
 * @return {Blockly.Input} The input object, or null if input does not exist. Input that are disabled are skipped.
 */
eYo.DelegateSvg.prototype.getInput = function (block, name, dontCreate) {
  var e8r = this.inputEnumerator(block)
  while (e8r.next()) {
    if (e8r.here.name === name) {
      return e8r.here
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
  var e8rs = [block.eyo.inputEnumerator(block)]
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
        if (e8r.here.type === Blockly.NEXT_STATEMENT) {
          if (e8r.here.connection && (next = e8r.here.connection.targetBlock())) {
            bs.unshift(b)
            e8rs.unshift(e8r)
            bs.unshift(next)
            e8rs.unshift(next.eyo.inputEnumerator(next))
            return next
          }
        }
      }
      if ((b = b.getNextBlock())) {
        bs.unshift(b)
        e8rs.unshift(b.eyo.inputEnumerator(b))
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
 * @param {!Block} block
 * @private
 */
eYo.DelegateSvg.prototype.makeBlockWrapped = function (block) {
  eYo.DelegateSvg.superClass_.makeBlockWrapped.call(this, block)
  goog.asserts.assert(!this.hasSelect(block), 'Deselect block before')
  block.initSvg()
  this.svgPathShape_.setAttribute('display', 'none')
  this.svgPathContour_.setAttribute('display', 'none')
}

/**
 * Creates the contour path.
 * Does nothing if this contour already exists.
 * @param {!Block} block
 * @private
 */
eYo.DelegateSvg.prototype.makeBlockUnwrapped = function (block) {
  if (this.svgPathContour_) {
    eYo.DelegateSvg.superClass_.makeBlockUnwrapped.call(this, block)
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
 * Set the enable/disable status of the given block.
 * @param {!Block} block
 * @private
 */
eYo.DelegateSvg.prototype.delayedRender = function (block) {
  if (!goog.isDef(this.delayedRender)) {
    this.delayedRender = setTimeout(function () {
      delete block.eyo.delayedRender
      if (block.workspace) {
        block.render()
      }
    }, 10)
  }
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
  var B = this.newBlockComplete(workspace, model, id)
  B && B.eyo.beReady(B)
  return B
}

/**
 * Create a new block, with svg background and wrapped blocks.
 * This is the expected way to create the block.
 * There is a caveat due to proper timing in initializing the svg.
 * Whether blocks are headless or not is not clearly designed in Blockly.
 * If the model fits an identifier, then create an identifier
 * If the model fits a number, then create a number
 * If the model fits a string literal, then create a string literal...
 * This is headless and should not render until a beReady message is sent.
 * @param {!WorkspaceSvg} workspace
 * @param {!String|Object} model
 * @private
 */
eYo.DelegateSvg.newBlockComplete = function (workspace, model, id) {
  var processModel = function(block, model, id) {
    var dataModel = model
    if (!block) {
      if (eYo.DelegateSvg.Manager.get(model.type)) {
        block = workspace.newBlock(model.type, id)
        block.eyo.initDataWithType(block, model.type)
      } else if (eYo.DelegateSvg.Manager.get(model)) {
        block = workspace.newBlock(model, id)
        block.eyo.initDataWithType(block, model)
      } else {
        var type = eYo.Do.typeOfString(model)
        if (type.expr && (block = workspace.newBlock(type.expr, id))) {
          type.expr && block.eyo.initDataWithType(block, type.expr)
          type.modelExpr && block.eyo.initDataWithModel(block, type.modelExpr)
          dataModel = {data: model}
        } else if (type.stmt && (block = workspace.newBlock(type.stmt, id))) {
          type.stmt && block.eyo.initDataWithType(block, type.stmt)
          type.modelStmt && block.eyo.initDataWithModel(block, type.modelStmt)
          dataModel = {data: model}
        } else if (goog.isNumber(model)  && (block = workspace.newBlock(eYo.T3.Expr.numberliteral, id))) {
          block.eyo.initDataWithType(block, eYo.T3.Expr.numberliteral)
          dataModel = {data: model.toString()}
        } else {
          console.warn('No block for model:', model)
          return
        }
      }
      block.eyo.completeWrapped_(block)
    }
    if (block) {
      block.eyo.initDataWithModel(block, dataModel)
      var Vs = dataModel.slots
      for (var k in Vs) {
        if (eYo.Do.hasOwnProperty(Vs, k)) {
          var input = block.eyo.getInput(block, k)
          if (input && input.connection) {
            var target = input.connection.targetBlock()
            var V = Vs[k]
            var B = processModel(target, V)
            if (!target && B && B.outputConnection) {
              try {
                B.eyo.skipRendering()
                block.eyo.skipRendering()
                B.outputConnection.connect(input.connection)
              } catch (err) {
                console.error(err)
                throw err
              } finally {
                block.eyo.unskipRendering()
                B.eyo.unskipRendering()
              }
            }
          }
        }
      }
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
      block.eyo.consolidate(block)
    }
    return block
  }
  var B = processModel(null, model, id)
  return B
}

/**
 * When setup is finish.
 * @param {!Block} block
 */
eYo.DelegateSvg.prototype.beReady = function (block) {
  if (this.isReady_) {
    return
  }
  try {
    this.skipRendering()
    block = this.block_
    block.initSvg()
    this.foreachData(function () {
      this.beReady()
    })
    // install all the fields and slots in the DOM
    for (var k in this.fields) {
      var field = this.fields[k]
      if (!field.sourceBlock_) {
        field.setSourceBlock(block)
        field.init()
      }
    }
    this.foreachSlot(function () {
      this.beReady()
    })
    for (var i = 0, input; (input = block.inputList[i++]);) {
      input.eyo.beReady()
    }
    this.inputSuite && this.inputSuite.eyo.beReady()
    block.nextConnection && block.nextConnection.eyo.beReady()
    this.consolidate(block)
    this.synchronizeData(block)
    this.synchronizeSlots(block)
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
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    this.isReady_ = true
    this.unskipRendering()
  }
}

/**
 * Prepare the block to be displayed in the given workspace.
 * Nothing implemented yet
 * @param {!Block} block
 * @param {!WorkspaceSvg} workspace
 * @param {!Number} x
 * @param {!Number} y
 * @param {!String} variant
 * @private
 */
eYo.DelegateSvg.prototype.prepareForWorkspace = function (block, workspace, x, y, variant) {

}

/**
 * Returns the python type of the block.
 * This information may be displayed as the last item in the contextual menu.
 * Wrapped blocks will return the parent's answer.
 * @param {!Blockly.Block} block The block.
 */
eYo.DelegateSvg.prototype.getPythonType = function (block) {
  if (this.wrapped_) {
    var parent = block.getParent()
    return parent.eyo.getPythonType(parent)
  }
  return this.pythonType_
}

/**
 * Can insert a block above?
 * If the block's output connection is connected,
 * can connect the parent's output to it?
 * The connection cannot always establish.
 * @param {!Block} block
 * @param {string} prototypeName
 * @param {string} surroundInputName, which parent's connection to use
 */
eYo.DelegateSvg.prototype.canInsertParent = function (block, prototypeName, subtype, surroundInputName) {
  var can = false
  return can
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
eYo.DelegateSvg.prototype.insertParentWithModel = function (block, processModel) {
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
        type: eYo.T3.Expr.term,
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
 * @return an array of conections, holes if given.
 */
eYo.HoleFiller.getDeepHoles = function (block, holes = undefined) {
  var H = holes || []
  var getDeepHoles = function (c8n) {
    if (c8n && c8n.type === Blockly.INPUT_VALUE && ((!c8n.eyo.disabled_ && !c8n.eyo.incog_) || c8n.eyo.wrapped_)) {
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
    var e8r = block.eyo.inputEnumerator(block)
    while (e8r.next()) {
      getDeepHoles(e8r.here.connection)
    }
  }
  return H
}

/**
 * For each value input that is not optional and accepts an identifier,
 * create and connect an identifier block.
 * Called once at block creation time.
 * Should not be called directly
 * @param {!Blockly.Block} block to be initialized..
 */
eYo.HoleFiller.fillDeepHoles = function (workspace, holes) {
  var i = 0
  eYo.Events.setGroup(true)
  for (; i < holes.length; ++i) {
    var c8n = holes[i]
    if (c8n && c8n.type === Blockly.INPUT_VALUE && !c8n.isConnected()) {
      var data = c8n.eyo.hole_data
      if (data) {
        try {
          if (data.filler) {
            var B = data.filler(workspace)
          } else {
            B = eYo.DelegateSvg.newBlockReady(workspace, data.type)
            if (data.value) {
              (B.eyo.data.phantom && B.eyo.data.phantom.set(data.value)) ||
              (B.eyo.data.value && B.eyo.data.value.set(data.value))
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
  eYo.Events.setGroup(false)
}

/**
 * Change the wrap type of a block.
 * Undo compliant.
 * Used in menus.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!String} key the key of the input holding the connection
 * @param {!String} newType
 * @return yorn whether a change has been made
 * the MenuItem selected within menu.
 */
eYo.DelegateSvg.prototype.useWrapType = function (block, key, newType) {
  var input = block.getInput(key)
  var returnState = false
  if (input) {
    var target = input.connection.targetBlock()
    var oldType = target ? target.type : undefined
    if (newType !== oldType) {
      eYo.Events.setGroup(true)
      try {
        if (target) {
          target.unplug()
          target.dispose()
        }
        this.completeWrappedInput_(block, input, newType)
        returnState = true
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        eYo.Events.setGroup(false)
      }
    }
  }
  return returnState
}

/**
 * Returns the coordinates of a bounding rect describing the dimensions of this
 * block.
 * As the shape is not the same comparing to Blockly's default,
 * the bounding rect changes too.
 * Coordinate system: global coordinates.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return {!goog.math.Rect}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
eYo.DelegateSvg.prototype.getGlobalBoundingRect = function (block) {
  var R = this.getBoundingRect(block)
  R.scale(block.workspace.scale)
  R.translate(block.workspace.getOriginOffsetInPixels())
  return R
}

/**
 * Returns the coordinates of a bounding rect describing the dimensions of this
 * block.
 * As the shape is not the same comparing to Blockly's default,
 * the bounding rect changes too.
 * Coordinate system: workspace coordinates.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return {!goog.math.Rect}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
eYo.DelegateSvg.prototype.getBoundingRect = function (block) {
  return goog.math.Rect.createFromPositionAndSize(
    block.getRelativeToSurfaceXY(),
    block.getHeightWidth()
  )
}

/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * block.
 * As the shape is not the same comparing to Blockly's default,
 * the bounding box changes too.
 * Coordinate system: workspace coordinates.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return {!goog.math.Box}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
eYo.DelegateSvg.prototype.getBoundingBox = function (block) {
  return this.getBoundingRect(block).toBox()
}

/**
 * Get the closest box, according to the filter.
 * For edython.
 * @param {!Blockly.Workspace} workspace The owner of the receiver.
 * @param {function(point): number} weight is a function.
 * @return None
 */
eYo.DelegateSvg.getBestBlock = function (workspace, weight) {
  var smallest = Infinity
  var best
  for (var i = 0, top; (top = workspace.topBlocks_[i++]);) {
    var box = top.eyo.getBoundingRect(top)
    var w = weight(box.getCenter())
    if (w < smallest) {
      smallest = w
      best = top
    }
  }
  return best
}

/**
 * Get the closest box, according to the filter.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {function(point, point): number} distance is a function.
 * @return None
 */
eYo.DelegateSvg.prototype.getBestBlock = function (block, distance) {
  const a = this.getBoundingBox(block)
  var smallest = {}
  var best
  for (var i = 0, top; (top = block.workspace.topBlocks_[i++]);) {
    if (top === block) {
      continue
    }
    var b = top.eyo.getBoundingBox(top)
    var target = top
    var c8n
    while ((c8n = target.nextConnection) && (target = c8n.targetBlock())) {
      b.expandToInclude(target.eyo.getBoundingBox(target))
    }
    var d = distance(a, b)
    if (d.major && (!smallest.major || d.major < smallest.major)) {
      smallest = d
      best = top
    } else if (d.minor && (!smallest.major && (!smallest.minor || d.minor < smallest.minor))) {
      smallest = d
      best = top
    }
  }
  return best
}

/**
 * Select the block to the left of the owner.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
eYo.DelegateSvg.prototype.selectBlockLeft = function (block) {
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    target.eyo.selectBlockLeft(target)
    return
  }
  var doLast = function (B) {
    var e8r = B.eyo.inputEnumerator(B)
    e8r.end()
    while (e8r.previous()) {
      var c8n = e8r.here.connection
      if (c8n && (!c8n.hidden_ || c8n.eyo.wrapped_) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
        var target = c8n.targetBlock()
        if (!target || (!target.eyo.wrapped_ && !target.eyo.locked_) || (c8n = doLast(target))) {
          return c8n
        }
      }
    }
    return null
  }
  var parent, c8n
  var selectTarget = function (c8n) {
    var target = c8n.targetBlock()
    if (!target) {
      return false
    }
    if (!target.eyo.wrapped_ && !target.eyo.locked_) {
      eYo.SelectedConnection.set(null)
      target.select()
      return true
    }
    if ((c8n = doLast(target))) {
      if ((target = c8n.targetBlock())) {
        eYo.SelectedConnection.set(null)
        target.select()
      } else {
        eYo.SelectedConnection.set(c8n)
      }
      return true
    }
    return false
  }
  var selectConnection = function (c8n) {
    if (selectTarget(c8n)) {
      return true
    }
    // do not select a connection
    // if there is no unwrapped surround parent
    var parent = c8n.sourceBlock_
    while (parent.eyo.wrapped_ || parent.eyo.locked_) {
      if (!(parent = parent.getSurroundParent())) {
        return false
      }
    }
    eYo.SelectedConnection.set(c8n)
    return true
  }
  if ((c8n = this.selectedConnection)) {
    if (c8n === block.nextStatement) {
    } else if (c8n.type !== Blockly.NEXT_STATEMENT) {
      // select the previous non statement input if any
      var e8r = block.eyo.inputEnumerator(block)
      while (e8r.next()) {
        if (e8r.here.connection && c8n === e8r.here.connection) {
          // found it, step down
          e8r.previous()
          while (e8r.previous()) {
            if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.eyo.wrapped_) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
              if (selectConnection(c8n)) {
                return true
              }
            }
          }
          break
        }
      }
      e8r.start(block)
      while (e8r.next()) {
        if (e8r.here.connection && c8n === e8r.here.connection) {
          // found it, step down
          e8r.previous()
          while (e8r.previous()) {
            if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.eyo.wrapped_) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
              if (selectConnection(c8n)) {
                return true
              }
            }
          }
          break
        }
      }
    } else if (!block.eyo.wrapped_ && !block.eyo.locked_) {
      eYo.SelectedConnection.set(null)
      block.select()
      return true
    }
  }
  if ((parent = block.getSurroundParent())) {
    // select the previous non statement input if any
    e8r = parent.eyo.inputEnumerator(parent)
    while (e8r.next()) {
      if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.eyo.wrapped_) && block === c8n.targetBlock()) {
        // found it, step down
        e8r.previous()
        while (e8r.previous()) {
          if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.eyo.wrapped_) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
            if (selectConnection(c8n)) {
              return true
            }
          }
        }
        break
      }
    }
    do {
      if (!parent.eyo.wrapped_ && !parent.eyo.locked_) {
        eYo.SelectedConnection.set(null)
        parent.select()
        return true
      }
    } while ((parent = parent.getSurroundParent()))
  }
  target = block
  do {
    parent = target
  } while ((target = parent.getSurroundParent()))
  target = parent.eyo.getBestBlock(parent, function (a, b) {
    if (a.left <= b.left) {
      return {}
    }
    // b.left < a.left
    if (a.top - b.bottom > a.left - b.left) {
      return {minor: a.left - b.left + a.top - b.bottom}
    }
    if (b.top - a.bottom > a.left - b.left) {
      return {minor: a.left - b.left + b.top - a.bottom}
    }
    return {
      major: a.left - b.left + Math.abs(a.bottom + a.top - b.bottom - b.top) / 3,
      minor: b.bottom - b.top
    }
  })
  if (target) {
    target.select()
    return true
  }
}
/**
 * Select the block to the right of the owner.
 * The owner is either a selected block or wrapped into a selected block.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return yorn
 */
eYo.DelegateSvg.prototype.selectBlockRight = function (block) {
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    return target.eyo.selectBlockRight(target)
  }
  var parent, c8n
  var selectTarget = function (c8n) {
    if ((target = c8n.targetBlock())) {
      if (target.eyo.wrapped_ || target.eyo.locked_) {
        return target.eyo.selectBlockRight(target)
      } else {
        eYo.SelectedConnection.set(null)
        target.select()
        return true
      }
    }
    return false
  }
  var selectConnection = function (c8n) {
    if (c8n.hidden_ && !c8n.eyo.wrapped_) {
      return false
    }
    if (!selectTarget(c8n)) {
      parent = block
      while (parent.eyo.wrapped_ || parent.eyo.locked_) {
        if (!(parent = parent.getSurroundParent())) {
          return false
        }
      }
      eYo.SelectedConnection.set(c8n)
    }
    return true
  }
  var selectSlot = function (slot) {
    if (!slot.isIncog()) {
      var c8n = slot.input && slot.input.connection
      if (c8n) {
        return (c8n.type !== Blockly.NEXT_STATEMENT) && selectConnection(c8n)
      }
    }
  }
  if ((c8n = this.selectedConnection)) {
    if (c8n.type === Blockly.NEXT_STATEMENT) {
      if (c8n === block.nextConnection) {
        // select the target block (if any) when the nextConnection is in horizontal mode
        if (c8n.eyo.isAtRight) {
          if (selectTarget(c8n)) {
            return true
          }
        }
      } else if (selectTarget(c8n)) {
        return true
      }
    } else if (selectTarget(c8n)) {
      // the connection was selected, now it is its target
      return true
    } else {
      // select the connection following `this.selectedConnection`
      // which is not a NEXT_STATEMENT one, if any
      var rightC8n
      while ((rightC8n = c8n.eyo.rightConnection())) {
        if (selectConnection(rightC8n)) {
          return
        }
        c8n = rightC8n
      }
      var e8r = block.eyo.inputEnumerator(block)
      if (e8r) {
        while (e8r.next()) {
          if ((c8n = e8r.here.connection) && (c8n.type === Blockly.NEXT_STATEMENT)) {
            if (selectConnection(c8n)) {
              return true
            }
          }
        }
      }
    }
  } else {
    // select the first non statement connection
    if (block.eyo.someSlot(function () {
      return selectSlot(this)
    })) {
      return true
    }
    if ((e8r = block.eyo.inputEnumerator(block))) {
      while (e8r.next()) {
        if ((c8n = e8r.here.connection) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
          if (selectConnection(c8n)) {
            return true
          }
        }
      }
      // all the input connections are either dummy or statement connections
      // select the first statement connection (there is an only one for the moment)
      e8r.start()
      while (e8r.next()) {
        if ((c8n = e8r.here.connection) && (c8n.type === Blockly.NEXT_STATEMENT)) {
          if (selectConnection(c8n)) {
            return true
          }
        }
      }
    }
  }
  if (!(c8n = this.selectedConnection) || (c8n.type !== Blockly.NEXT_STATEMENT)) {
    // try to select the next connection of a surrounding block
    // only when a value input is connected to the block
    target = block
    while (target && (c8n = target.outputConnection) && (c8n = c8n.targetConnection)) {
      rightC8n = c8n
      while ((rightC8n = rightC8n.eyo.rightConnection())) {
        if (selectConnection(rightC8n)) {
          return true
        }
      }
      block = target
      target = c8n.sourceBlock_
    }
    e8r = block.eyo.inputEnumerator(block)
    while (e8r.next()) {
      if ((c8n = e8r.here.connection) && (c8n.type === Blockly.NEXT_STATEMENT) && (target = c8n.targetBlock()) && (target !== block)) {
        eYo.SelectedConnection.set(null)
        target.select()
        return true
      }
    }
  }
  // now try to select a top block
  target = block
  do {
    parent = target
  } while ((target = parent.getSurroundParent()))
  target = parent.eyo.getBestBlock(parent, function (a, b) {
    if (a.right >= b.right) {
      return {}
    }
    // b.right > a.right
    if (a.top - b.bottom > b.right - a.right) {
      return {minor: b.right - a.right + a.top - b.bottom}
    }
    if (b.top - a.bottom > b.right - a.right) {
      return {minor: b.right - a.right + b.top - a.bottom}
    }
    return {
      major: b.right - a.right + Math.abs(a.bottom + a.top - b.bottom - b.top) / 3,
      minor: b.bottom - b.top
    }
  })
  if (target) {
    eYo.SelectedConnection.set(null)
    target.select()
    return true
  }
  if (parent) {
    eYo.SelectedConnection.set(null)
    parent.select()
    return true
  }
}

/**
 * Select the block above the owner.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
eYo.DelegateSvg.prototype.selectBlockAbove = function (block) {
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    target.eyo.selectBlockAbove(target)
    return
  }
  var c8n
  if ((c8n = this.selectedConnection)) {
    if (c8n === block.previousConnection) {
      if ((target = c8n.targetBlock())) {
        eYo.SelectedConnection.set(null)
        target.select()
        return
      }
    } else {
      eYo.SelectedConnection.set(null)
      block.select()
      return
    }
  } else if ((c8n = block.previousConnection)) {
    block.select()
    eYo.SelectedConnection.set(block.previousConnection)
    return
  }
  var parent
  target = block
  do {
    parent = target
    if ((c8n = parent.previousConnection) && (target = c8n.targetBlock())) {
      target.select()
      return
    }
  } while ((target = parent.getParent()))
  target = parent.eyo.getBestBlock(parent, function (a, b) {
    if (a.top <= b.top) {
      return {}
    }
    // b.top < a.top
    if (a.left - b.right > a.top - b.top) {
      return {minor: a.left - b.right + a.top - b.top}
    }
    if (b.left - a.right > a.top - b.top) {
      return {minor: b.left - a.right + a.top - b.top}
    }
    return {
      major: a.top - b.top + Math.abs(a.left + a.right - b.left - b.right) / 3,
      minor: b.right - b.left
    }
  })
  if (target) {
    target.select()
  }
}

/**
 * Select the block below the owner.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
eYo.DelegateSvg.prototype.selectBlockBelow = function (block) {
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    target.eyo.selectBlockBelow(target)
    return
  }
  var parent, c8n
  if ((c8n = this.selectedConnection)) {
    if (c8n === block.previousConnection) {
      eYo.SelectedConnection.set(null)
      block.select()
      return
    } else if (c8n === block.nextConnection) {
      if ((target = c8n.targetBlock())) {
        eYo.SelectedConnection.set(null)
        target.select()
        return
      }
    } else if (block.nextConnection) {
      block.select()
      eYo.SelectedConnection.set(block.nextConnection)
      return
    }
  } else if (block.nextConnection) {
    block.select()
    eYo.SelectedConnection.set(block.nextConnection)
    return
  }
  target = block
  do {
    parent = target
    if ((c8n = parent.nextConnection) && (target = c8n.targetBlock())) {
      target.select()
      return
    }
  } while ((target = parent.getSurroundParent()))

  target = parent.eyo.getBestBlock(parent, function (a, b) {
    if (a.bottom >= b.bottom) {
      return {}
    }
    // b.bottom > a.bottom
    if (a.left - b.right > b.bottom - a.bottom) {
      return {minor: a.left - b.right + b.bottom - a.bottom}
    }
    if (b.left - a.right > b.bottom - a.bottom) {
      return {minor: b.left - a.right + b.bottom - a.bottom}
    }
    return {
      major: b.bottom - a.bottom + Math.abs(a.left + a.right - b.left - b.right) / 3,
      minor: b.right - b.left
    }
  })
  if (target) {
    target.select()
  }
}

/**
 * Get the input for the given event.
 * The block is already rendered once.
 *
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {Object} e in general a mouse down event
 * @return {Object|undefined|null}
 */
eYo.DelegateSvg.prototype.getConnectionForEvent = function (block, e) {
  var where = Blockly.utils.mouseToSvg(e, block.workspace.getParentSvg(),
  block.workspace.getInverseScreenCTM());
  where = goog.math.Coordinate.difference(where, block.workspace.getOriginOffsetInPixels())
  where.scale(1 / block.workspace.scale)
  var rect = this.getBoundingRect(block)
  where = goog.math.Coordinate.difference(where, rect.getTopLeft())
  var e8r = block.eyo.inputEnumerator(block)
  while (e8r.next()) {
    var c8n = e8r.here.connection
    if (c8n && !c8n.eyo.disabled_ && (!c8n.hidden_ || c8n.eyo.wrapped_)) {
      if (c8n.type === Blockly.INPUT_VALUE) {
        var target = c8n.targetBlock()
        if (target) {
          var targetC8n = target.eyo.getConnectionForEvent(target, e)
          if (targetC8n) {
            return targetC8n
          }
          var R = new goog.math.Rect(
            c8n.offsetInBlock_.x,
            c8n.offsetInBlock_.y,
            target.width,
            target.height
          )
          if (R.contains(where)) {
            return c8n
          }
        }
        R = new goog.math.Rect(
          c8n.offsetInBlock_.x - eYo.Font.space / 4,
          c8n.offsetInBlock_.y + eYo.Padding.t(),
          c8n.eyo.optional_ || c8n.eyo.s7r_ ? 1.5 * eYo.Font.space : 3.5 * eYo.Font.space,
          eYo.Font.height
        )
        if (R.contains(where)) {
          return c8n
        }
      } else if (c8n.type === Blockly.NEXT_STATEMENT) {
        R = new goog.math.Rect(
          c8n.offsetInBlock_.x,
          c8n.offsetInBlock_.y - eYo.Style.Path.width,
          eYo.Font.tabWidth,
          1.5 * eYo.Padding.t() + 2 * eYo.Style.Path.width
        )
        if (R.contains(where)) {
          return c8n
        }
      }
    }
  }
  if ((c8n = block.previousConnection) && !c8n.hidden) {
    R = new goog.math.Rect(
      c8n.offsetInBlock_.x,
      c8n.offsetInBlock_.y - 2 * eYo.Style.Path.width,
      rect.width,
      1.5 * eYo.Padding.t() + 2 * eYo.Style.Path.width
    )
    if (R.contains(where)) {
      return c8n
    }
  }
  if ((c8n = block.nextConnection) && !c8n.hidden) {
    if (rect.height > eYo.Font.lineHeight()) { // Not the cleanest design
      R = new goog.math.Rect(
        c8n.offsetInBlock_.x,
        c8n.offsetInBlock_.y - 1.5 * eYo.Padding.b() - eYo.Style.Path.width,
        eYo.Font.tabWidth + eYo.Style.Path.radius(), // R U sure?
        1.5 * eYo.Padding.b() + 2 * eYo.Style.Path.width
      )
    } else {
      R = new goog.math.Rect(
        c8n.offsetInBlock_.x,
        c8n.offsetInBlock_.y - 1.5 * eYo.Padding.b() - eYo.Style.Path.width,
        rect.width,
        1.5 * eYo.Padding.b() + 2 * eYo.Style.Path.width
      )
    }
    if (R.contains(where)) {
      return c8n
    }
  }
}

/**
 * The selected connection is used to insert blocks with the keyboard.
 * When a connection is selected, one of the ancestor blocks is also selected.
 * Then, the higlighted path of the source blocks is not the outline of the block
 * but the shape of the connection as it shows when blocks are moved close enough.
 */
eYo.SelectedConnection = (function () {
  var c8n_
  var me = {
    /**
     * Lazy getter
    */
    get: /** @suppress {globalThis} */ function () {
      return c8n_
    },
    set: /** @suppress {globalThis} */ function (connection) {
      var B
      if (connection) {
        if (connection.hidden_) {
          console.error('Do not select a hidden connection')
        }
        var block = connection.getSourceBlock()
        if (block) {
          if (block.eyo.locked_) {
            return
          }
          if (connection === block.previousConnection && connection.targetConnection) {
            connection = connection.targetConnection
            var unwrapped = block = connection.getSourceBlock()
            do {
              if (!unwrapped.eyo.wrapped_) {
                unwrapped.select()
                unwrapped.bringToFront()
                break
              }
            } while ((unwrapped = unwrapped.getSurroundParent()))
          }
        }
      }
      if (connection !== c8n_) {
        if (c8n_) {
          var oldBlock = c8n_.getSourceBlock()
          if (oldBlock) {
            oldBlock.eyo.selectedConnection = null
            oldBlock.eyo.selectedConnectionSource_ = null
            oldBlock.removeSelect()
            if (oldBlock === Blockly.selected) {
              oldBlock.eyo.updateAllPaths_(oldBlock)
              oldBlock.addSelect()
            } else if ((B = Blockly.selected)) {
              B.eyo.selectedConnectionSource_ = null
              B.removeSelect()
              B.addSelect()
            }
          }
          c8n_ = null
        }
        if (connection) {
          if ((block = connection.getSourceBlock())) {
            unwrapped = block
            while (unwrapped.eyo.wrapped_) {
              if (!(unwrapped = unwrapped.getSurroundParent())) {
                return
              }
            }
            block.eyo.selectedConnection = c8n_ = connection
            unwrapped.eyo.selectedConnectionSource_ = block
            unwrapped.select()
            block.removeSelect()
            block.eyo.updateAllPaths_(block)
            block.addSelect()
          }
        }
      }
    }
  }
  return me
}())

/**
 * Insert a block of the given type.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {Object|string} model
 * @return {?Blockly.Block} the block that was inserted
 */
eYo.DelegateSvg.prototype.insertBlockWithModel = function (block, model, connection) {
  if (!model) {
    return null
  }
  // get the type:
  var type = eYo.Do.typeOfString(model)
  if (type) {
    if (connection) {
      if (connection.type === Blockly.NEXT_STATEMENT || connection.type === Blockly.PREVIOUS_STATEMENT) {
        type.stmt && (model = {
          type: type.stmt,
          data: model
        })
      } else {
        type.expr && (model = {
          type: type.expr,
          data: model
        })
      }
    }
  }
  // create a block out of the undo mechanism
  Blockly.Events.disable()
  try {
    var candidate = eYo.DelegateSvg.newBlockComplete(block.workspace, model)
    if (!candidate) {
      return
    }
    var c8n_N = model.input
    var c8n, otherC8n
    var fin = function (prepare) {
      Blockly.Events.enable()
      eYo.Events.setGroup(true)
      try {
        if (Blockly.Events.isEnabled()) {
          Blockly.Events.fire(new Blockly.Events.BlockCreate(candidate))
        }
        prepare && prepare()
        candidate.eyo.beReady(candidate)
        otherC8n.connect(c8n)
        candidate.select()
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        candidate.eyo.render(candidate)
        candidate.bumpNeighbours_()
        eYo.Events.setGroup(false)
        Blockly.Events.disable()
      }
      return candidate
    }
    if ((otherC8n = eYo.SelectedConnection.get())) {
      var otherSource = otherC8n.getSourceBlock()
      if (otherC8n.type === Blockly.INPUT_VALUE) {
        if ((c8n = candidate.outputConnection) && c8n.checkType_(otherC8n)) {
          return fin()
        }
      } else if (otherC8n === otherSource.previousConnection) {
        if ((c8n = candidate.nextConnection) && c8n.checkType_(otherC8n)) {
          var targetC8n = otherC8n.targetConnection
          if (targetC8n && candidate.previousConnection &&
            targetC8n.checkType_(candidate.previousConnection)) {
            return fin(function () {
              targetC8n.connect(candidate.previousConnection)
            })
          } else {
            return fin(function () {
              var its_xy = block.getRelativeToSurfaceXY()
              var my_xy = candidate.getRelativeToSurfaceXY()
              var HW = candidate.getHeightWidth()
              candidate.moveBy(its_xy.x - my_xy.x, its_xy.y - my_xy.y - HW.height)
            })
          }
          // unreachable code
        }
      } else if (otherC8n.type === Blockly.NEXT_STATEMENT) {
        if ((c8n = candidate.previousConnection) && c8n.checkType_(otherC8n)) {
          if ((targetC8n = otherC8n.targetConnection) && candidate.nextConnection &&
            targetC8n.checkType_(candidate.nextConnection)) {
            return fin(function () {
              targetC8n.connect(candidate.previousConnection)
            })
          } else {
            return fin()
          }
        }
      }
    }
    if ((c8n = candidate.outputConnection)) {
      // try to find a free connection in a block
      // When not undefined, the returned connection can connect to c8n.
      var findC8n = function (block) {
        var e8r = block.eyo.inputEnumerator(block)
        var otherC8n, foundC8n, target
        while (e8r.next()) {
          if ((foundC8n = e8r.here.connection) && foundC8n.type === Blockly.INPUT_VALUE) {
            if ((target = foundC8n.targetBlock())) {
              if (!(foundC8n = findC8n(target))) {
                continue
              }
            } else if (!c8n.checkType_(foundC8n)) {
              continue
            } else if (foundC8n.eyo.editWidth) {
              continue
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
        }
        return otherC8n
      }
      if ((otherC8n = findC8n(block))) {
        return fin()
      }
    }
    if ((c8n = candidate.previousConnection)) {
      if ((otherC8n = block.nextConnection) && c8n.checkType_(otherC8n)) {
        return fin(function () {
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
          return fin(function () {
            candidate.previousConnection.connect(targetC8n)
          })
        } else {
          return fin(function () {
            var its_xy = block.getRelativeToSurfaceXY()
            var my_xy = candidate.getRelativeToSurfaceXY()
            var HW = candidate.getHeightWidth()
            candidate.moveBy(its_xy.x - my_xy.x, its_xy.y - my_xy.y - HW.height)
          })
        }
      }
    }
    if (candidate) {
      candidate.dispose(true)
    }
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    Blockly.Events.enable()
  }
}
console.warn('Use eYo.vents.setGroup(...)')
/**
 * Whether the given block can lock.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return boolean
 */
eYo.DelegateSvg.prototype.canLock = function (block) {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var e8r = block.eyo.inputEnumerator(block)
  var c8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection) && !c8n.eyo.disabled_) {
      if ((target = c8n.targetBlock())) {
        if (!target.eyo.canLock(target)) {
          return false
        }
      } else if (!c8n.eyo.optional_ && !c8n.eyo.s7r_) {
        return false
      }
    }
  }
  return true
}
/**
 * Whether the given block can unlock.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return {boolean}, true only if there is something to unlock
 */
eYo.DelegateSvg.prototype.canUnlock = function (block) {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var e8r = block.eyo.inputEnumerator(block)
  var c8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((target = c8n.targetBlock())) {
        if (target.eyo.canUnlock(target)) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * Lock the given block.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return {number} the number of blocks locked
 */
eYo.DelegateSvg.prototype.lock = function (block) {
  var ans = 0
  if (this.locked_ || !block.eyo.canLock(block)) {
    return ans
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
      block, eYo.Const.Event.locked, null, this.locked_, true))
  }
  this.locked_ = true
  if (block === eYo.SelectedConnection.set) {
    eYo.SelectedConnection.set(null)
  }
  // list all the input for connections with a target
  var c8n
  if ((c8n = eYo.SelectedConnection.get()) && (block === c8n.getSourceBlock())) {
    eYo.SelectedConnection.set(null)
  }
  var e8r = block.eyo.inputEnumerator(block)
  var target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((target = c8n.targetBlock())) {
        ans += target.eyo.lock(target)
      }
      if (c8n.type === Blockly.INPUT_VALUE) {
        c8n.setHidden(true)
      }
    }
  }
  this.foreachSlot(function () {
    if (this.input && (c8n = this.input.connection)) {
      if ((target = c8n.targetBlock())) {
        ans += target.eyo.lock(target)
      }
      if (c8n.type === Blockly.INPUT_VALUE) {
        c8n.setHidden(true)
      }      
    }
  })
  if ((c8n = block.nextConnection)) {
    if ((target = c8n.targetBlock())) {
      ans += target.eyo.lock(target)
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
eYo.DelegateSvg.prototype.unlock = function (block, shallow) {
  var ans = 0
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
      block, eYo.Const.Event.locked, null, this.locked_, false))
  }
  this.locked_ = false
  // list all the input for connections with a target
  var e8r = block.eyo.inputEnumerator(block)
  var c8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((!shallow || c8n.type === Blockly.INPUT_VALUE) && (target = c8n.targetBlock())) {
        ans += target.eyo.unlock(target, shallow)
      }
      c8n.setHidden(false)
    }
  }
  if (!shallow && (c8n = block.nextConnection)) {
    if ((target = c8n.targetBlock())) {
      ans += target.eyo.unlock(target)
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
eYo.DelegateSvg.prototype.inVisibleArea = function (block) {
  var area = this.getDistanceFromVisible(block)
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
eYo.DelegateSvg.prototype.getDistanceFromVisible = function (block, newLoc) {
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
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return {boolean}
 */
eYo.DelegateSvg.prototype.setOffset = function (block, dx, dy) {
  // Workspace coordinates.
  block = block || this.block_
  if (!this.svgShapeGroup_) {
    throw 'block is not inited '+block.type
  }
  var xy = Blockly.utils.getRelativeXY(block.getSvgRoot());
  var transform = 'translate(' + (xy.x + dx) + ',' + (xy.y + dy) + ')';
  block.getSvgRoot().setAttribute('transform', transform);
  this.svgShapeGroup_.setAttribute('transform', transform);
  this.svgContourGroup_.setAttribute('transform', transform);
  block.moveConnections_(dx, dy);
}

/**
 * Renders the block when connections are no longer hidden.
 * @param {!Blockly.Block} block
 * @param {boolean} hidden True to hide connections.
 */
eYo.DelegateSvg.prototype.setConnectionsHidden = function (block, hidden) {
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
 * @param {!Blockly.Block} block
 * @param {!Function} handler `this` is the receiver.
 * @param {!Function} err_handler `this` is the receiver, one argument: the error catched.
 */
eYo.DelegateSvg.prototype.doAndRender = function (block, handler, group, err_handler) {
  return function (event) {
    block.eyo.skipRendering()
    group && eYo.Events.setGroup(true)
    try {
      handler.call(block.eyo, event)
    } catch (err) {
      err_handler && err_handler.call(block.eyo, err) || console.error(err)
      throw err
    } finally {
      block.eyo.unskipRendering()
      group && eYo.Events.setGroup(false)
      block.render()
    }
  }
}

/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg')
goog.provide('ezP.HoleFiller')

goog.require('ezP.Delegate')
goog.forwardDeclare('ezP.BlockSvg')

/**
 * Class for a DelegateSvg.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.Delegate.makeSubclass('Svg')

// Mimic Blockly naming convention
ezP.DelegateSvg = ezP.Delegate.Svg

ezP.DelegateSvg.Manager = ezP.Delegate.Manager

/**
 * Method to register an expression or a statement block.
 * The delegate is searched as a DelegateSvg element
 */
ezP.DelegateSvg.Manager.register = function (key) {
  var prototypeName = ezP.T3.Expr[key]
  var delegateCtor = undefined
  var available = undefined
  if (prototypeName) {
    (key === 'numberliteral') && console.log('Registering expression', key)
    delegateCtor = ezP.DelegateSvg.Expr[key]
    available = ezP.T3.Expr.Available
  } else if ((prototypeName = ezP.T3.Stmt[key])) {
    // console.log('Registering statement', key)
    delegateCtor = ezP.DelegateSvg.Stmt[key]
    available = ezP.T3.Stmt.Available
  } else {
    throw "Unknown block ezP.T3.Expr or ezP.T3.Stmt key: "+key
  }
  ezP.DelegateSvg.Manager.registerDelegate_(prototypeName, delegateCtor)
  available.push(prototypeName)
}

/**
 * This is the shape used to draw the outline of a block
 * @private
 */
ezP.DelegateSvg.prototype.svgPathShape_ = undefined

/**
 * This is the shape used to draw the background of a block
 * @private
 */
ezP.DelegateSvg.prototype.svgPathContour_ = undefined

/**
 * This is the shape used to draw a collapsed block.
 * Background or outline ?
 * @private
 */
ezP.DelegateSvg.prototype.svgPathCollapsed_ = undefined

/**
 * This is the shape used to draw a block...
 * @private
 */
ezP.DelegateSvg.prototype.svgPathInline_ = undefined

/**
 * This is the shape used to draw an highlighted block contour.
 * @private
 */
ezP.DelegateSvg.prototype.svgPathHighlight_ = undefined

/**
 * This is the shape used to draw an highlighted connection contour.
 * @private
 */
ezP.DelegateSvg.prototype.svgPathConnection_ = undefined

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

console.warn('Beware of quotes in string literals')

goog.require('ezP.Tile')

/**
 * Create and initialize the various paths.
 * Called once at block creation time.
 * Should not be called directly
 * The block implementation is created according to a dictionary
 * input model available through `getModel().tiles`.
 * The structure of that dictionary is detailled in the treatment flow
 * below.
 * @param {!Blockly.Block} block to be initialized..
 */
ezP.DelegateSvg.prototype.initBlock = function(block) {
  ezP.DelegateSvg.superClass_.initBlock.call(this, block)
  // block.setInputsInline(true)
  block.setTooltip('')
  block.setHelpUrl('')
  var ui = Object.create(null)
  var makeTiles = function(owner, tilesModel) {
    var tiles = Object.create(null)
    var ordered = []
    for (var k in tilesModel) {
      var tileModel = tilesModel[k]
      var order = tileModel.order
      var insert = tileModel.insert
      var tile, nextTile
      if (insert) {
        var model = ezP.DelegateSvg.Manager.getModel(insert)
        if (model) {
          makeTiles(owner, model.tiles)
          if ((tile = ui.headTile)) {
            delete ui.tiles
            nextTile = tile
            do {
              goog.asserts.assert(!goog.isDef(tiles[nextTile.key]),
              ezP.Do.format('Duplicate inserted tile key {0}/{1}/{2}', nextTile.key, insert, block.type))
              tiles[nextTile.key] = tile
            } while ((nextTile = nextTile.nextTile))
          } else {
            continue
          }
        } else {
          continue
        }
      } else if (goog.isObject(tileModel) && (tile = new ezP.Tile(owner, k, tileModel))) {
        goog.asserts.assert(!goog.isDef(tiles[k]),
        ezP.Do.format('Duplicate tile key {0}/{1}', k, block.type))
        tiles[k] = tile
      } else {
        continue
      }
      tile.order = order
      for (var i = 0; i < ordered.length; i++) {
        // we must not find an aleady existing entry.
        goog.asserts.assert(i != tile.order,
        ezP.Do.format('Same order tile {0}/{1}', i, block.type))
        if (ordered[i].model.order > tile.model.order) {
          break
        }
      }
      ordered.splice(i,0,tile)
    }
    if ((tile = ordered[0])) {
      i = 1
      while ((nextTile = ordered[i++])) {
        tile.nextTile = nextTile
        nextTile.previousTile = tile
        tile = nextTile
      }
    }
    ui.headTile = ordered[0]
    ui.tiles = tiles
  }
  var model = this.getModel()
  makeTiles(this, model.tiles)
  ezP.Tile.makeFields(this, ui, model.fields)
  // now initialize all the fields
  this.ui = ui
  if (!block.workspace.options.readOnly && !this.eventsInit_) {
    Blockly.bindEventWithChecks_(block.getSvgRoot(), 'mouseup', block,
    function(e) {
      block.ezp.onMouseUp_(block, e)
    })
  }
  this.eventsInit_ = true;
  // wait until the end to set the subtype because it causes rendering
  // bind the data and the ui when relevant.
  // We establish a bi directional bound between data, inputs and fields
  // now it is time to intialize the data
  this.initData(block)
  // and find the appropriate type
  this.consolidate(block)
  this.synchronizeData(block)
  this.synchronizeTiles(block)
}
console.warn('implement async and await, see above awaitable and asyncable')
/**
 * Revert operation of initBlock.
 * @param {!Blockly.Block} block to be initialized..
 */
ezP.DelegateSvg.prototype.deinitBlock = function(block) {
  goog.dom.removeNode(this.svgPathShape_)
  this.svgPathShape_ = undefined
  goog.dom.removeNode(this.svgPathContour_)
  this.svgPathContour_ = undefined
  goog.dom.removeNode(this.svgPathCollapsed_)
  this.svgPathCollapsed_ = undefined
  goog.dom.removeNode(this.svgPathInline_)
  this.svgPathInline_ = undefined
  goog.dom.removeNode(this.svgPathHighlight_)
  this.svgPathHighlight_ = undefined
  goog.dom.removeNode(this.svgPathConnection_)
  this.svgPathConnection_ = undefined
  ezP.DelegateSvg.superClass_.deinitBlock.call(this, block)
}

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 * @param {!Blockly.Block} block to be initialized..
 */
ezP.DelegateSvg.prototype.preInitSvg = function(block) {
}

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 * @param {!Blockly.Block} block to be initialized.
 */
ezP.DelegateSvg.prototype.postInitSvg = function(block) {
  goog.dom.removeNode(block.svgPath_)
  delete block.svgPath_
  goog.dom.removeNode(block.svgPathLight_)
  delete block.svgPathLight_
  goog.dom.removeNode(block.svgPathDark_)
  delete block.svgPathDark_
    this.svgPathInline_ = Blockly.utils.createSvgElement('path',
    {'class': 'ezp-path-contour'}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathInline_, 0)
  this.svgPathCollapsed_ = Blockly.utils.createSvgElement('path', {'class': 'ezp-path-collapsed'}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathCollapsed_, 0)
  this.svgPathContour_ = Blockly.utils.createSvgElement('path', {'class': 'ezp-path-contour'}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathContour_, 0)
  this.svgPathShape_ = Blockly.utils.createSvgElement('path', {'class': 'ezp-path-shape'}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathShape_, 0)
  this.svgPathHighlight_ = Blockly.utils.createSvgElement('path',
    {'class': 'ezp-path-selected'}, null)
  this.svgPathConnection_ = Blockly.utils.createSvgElement('path',
    {'class': 'ezp-path-selected'}, null)
  Blockly.utils.addClass(/** @type {!Element} */ (block.svgGroup_),
    'ezp-block')
  // install all the fields and tiles in the DOM
  for (var k in this.ui.fields) {
    var field = this.ui.fields[k]
    field.setSourceBlock(block)
    field.init()
  }
  for (var k in this.ui.tiles) {
    var tile = this.ui.tiles[k]
    tile.init()
  }
}

/**
 * Returns the named field from a block.
 * Only fields that do not belong to an input are searched for.
 * @param {string} name The name of the field.
 * @return {Blockly.Field} Named field, or null if field does not exist.
 */
ezP.DelegateSvg.prototype.getField = function(block, name) {
  var fields = this.ui.fields
  for(var key in fields) {
    var field = fields[key]
    if (field.name === name) {
      return field
    }
  }
  return null
}

/**
 * Synchronize the tiles with the UI.
 * Sends a `synchronize` message to all tiles.
 * May be used at the end of an initialization process.
 */
ezP.DelegateSvg.prototype.synchronizeTiles = function(block) {
  var tiles = this.ui.tiles
  for (var k in tiles) {
    tiles[k].synchronize()
  }
}

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
ezP.DelegateSvg.prototype.getMenuTarget = function(block) {
  var wrapped
  if (this.ui.wrap && (wrapped = this.ui.wrap.input.connection.targetBlock())) {
    return wrapped.ezp.getMenuTarget(wrapped)
  }
  if (this.wrappedInputs_ && this.wrappedInputs_.length === 1 &&
    (wrapped = this.wrappedInputs_[0][0].connection.targetBlock())) {
      // if there are more than one wrapped block,
      // then we choose none of them
    return wrapped.ezp.getMenuTarget(wrapped)
  }
  return block
}

/**
 * Create and initialize the SVG representation of the child blocks wrapped in the given block.
 * May be called more than once.
 * @param {!Blockly.Block} block to be initialized..
 */
ezP.DelegateSvg.prototype.initSvgWrap = function(block) {
  if (this.wrappedInputs_) {
    // do not delete this at the end
    for (var i = 0; i < this.wrappedInputs_.length; i++) {
      var data = this.wrappedInputs_[i]
      var target = data[0].connection.targetBlock()
      if (target) {
        target.initSvg()
      }
    }
  }
};

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {!Block} block.
 * @param {boolean=} optBubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
ezP.DelegateSvg.prototype.render = function (block, optBubble) {
  if (this.skipRendering) {
    return
  }
  // if (this.wrapped_ && !block.getParent()) {
  //   console.log('wrapped block with no parent')
  //   setTimeout(function(){block.dispose()}, 10)
  //   block.dispose()
  //   return
  // }
  this.skipRendering = true
  Blockly.Field.startCache()
  this.minWidth = block.width = 0
  block.rendered = true
  this.consolidate(block, true)
  this.synchronizeTiles(block)// no need to synchronize the data
  this.willRender_(block)
  this.renderDraw_(block)
  this.layoutConnections_(block)
  block.renderMoveConnections_()

  if (optBubble !== false) {
    // Render all blocks above this one (propagate a reflow).
    var parentBlock = block.getParent()
    if (parentBlock) {
      parentBlock.render(true)
    } else {
      // Top-most block.  Fire an event to allow scrollbars to resize.
      block.workspace.resizeContents()
    }
  }
  this.didRender_(block)
  this.skipRendering = false
  Blockly.Field.stopCache()
  // block.workspace.logAllConnections('didRender')
}

/**
 * Prepare the inputs.
 * The default implementation does nothing.
 * Subclassers may enable/disable an input
 * depending on the context.
 * This message is sent when the block is retrieved from some
 * untrusted xml data.
 * List managers will use consolidators to help list management.
 * @param {!Block} block.
 */
ezP.DelegateSvg.prototype.consolidate = function (block, deep, force) {
  for (var k in this.data) {
    var data = this.data[k]
    data.consolidate()
  }
  if (deep) {
    var e8r = block.ezp.inputEnumerator(block), x
    while (e8r.next()) {
      if ((x = e8r.here.connection) && (x = x.targetBlock())) {
        x.ezp.consolidate(x, deep, force)
      }
    }
  }
  this.consolidateType(block)
}

/**
 * Whether the block is sealed to its parent.
 * The sealed status is decided at init time.
 * The corresponding input.ezp.connection.wrapped_ is set to true.
 * @private
 */
ezP.DelegateSvg.prototype.wrapped_ = undefined

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.willRender_ = function (block) {
  if (block.svgGroup_) {
    if (this.locked_ && block.outputConnection && block.getSurroundParent()) {
      goog.dom.classlist.add(/** @type {!Element} */(block.svgGroup_), 'ezp-locked')
    } else {
      goog.dom.classlist.remove(/** @type {!Element} */(block.svgGroup_), 'ezp-locked')
    }
  }
  // change the class of the shape on error
  var F = !!Object.keys(this.errors).length?
  goog.dom.classlist.add:
  goog.dom.classlist.remove
  var FF = function(elt) {
    if (/** @type {!Element} */(elt)) {
      F(elt, 'ezp-error')
    }
  }
  FF(this.svgPathShape_)
  FF(this.svgPathContour_)
  FF(this.svgPathCollapsed_)
  FF(this.svgPathHighlight_)
}

/**
 * Did draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.didRender_ = function (block) {
}

/**
 * Layout previous, next and output block connections.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.layoutConnections_ = function (block) {
  if (block.outputConnection) {
    block.outputConnection.setOffsetInBlock(0, 0)
  } else {
    if (block.previousConnection) {
      block.previousConnection.setOffsetInBlock(0, 0)
    }
    if (block.nextConnection) {
      if (block.isCollapsed()) {
        block.nextConnection.setOffsetInBlock(0, 2 * ezP.Font.lineHeight())
      } else {
        block.nextConnection.setOffsetInBlock(0, block.height)
      }
    }
  }
}

/**
 * Block shape. Default implementation throws.
 * Subclasses must override it. Used in renderDraw_.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.shapePathDef_ = function (block) {
  goog.asserts.assert(false, 'shapePathDef_ must be overriden by ' + this)
}

/**
 * Block outline. Default implementation forwards to shapePathDef_.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.contourPathDef_ = ezP.DelegateSvg.prototype.shapePathDef_

/**
 * Highlighted block outline. Default implementation forwards to shapePathDef_.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.highlightPathDef_ = ezP.DelegateSvg.prototype.shapePathDef_

/**
 * Highlighted connection outline.
 * When a block is selected and one of its connection is also selected
 * the ui displays a bold line on the connection. When the block has wrapped input,
 * the selected connection may belong to a wrapped block.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.connectionPathDef_ = function (block) {
  return this.selectedConnection?
    this.highlightConnectionPathDef(block, this.selectedConnection):
    ''
}

/**
 * Extra disabled block outline. Default implementation return a void string.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.collapsedPathDef_ = function () {
  return ''
}

/**
 * Draw the path of the block.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.renderDraw_ = function (block) {
  block.height = ezP.Font.lineHeight()
  var d = this.renderDrawModel_(block)
  this.svgPathInline_.setAttribute('d', d)
  var root = block.getRootBlock()
  if (root.ezp) {
    root.ezp.alignRightEdges_(root)
  }
  this.updateAllPaths_(block)
}

/**
 * Align the right edges by changing the size of all the connected statement blocks.
 * The default implementation does nothing.
 * @param {!ezP.Block} block.
 * @protected
 */
ezP.DelegateSvg.prototype.alignRightEdges_ = function (block) {
  var right = 0
  var ntor = ezP.StatementBlockEnumerator(block)
  var b
  var t = ezP.Font.tabWidth
  while ((b = ntor.next())) {
    if (b.ezp) {
      if (b.ezp.minWidth) {
        right = Math.max(right, b.ezp.minWidth + t * ntor.depth())
      } else {
        return
      }
    }
  }
  ntor = ezP.StatementBlockEnumerator(block)
  while ((b = ntor.next())) {
    if (b.ezp) {
      var width = right - t * ntor.depth()
      if (b.width !== width) {
        b.width = width
        b.ezp.updateAllPaths_(b)
      }
    }
  }
}

/**
 * Compute the paths of the block depending on its size.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.updatePath_ = function (block, path, def) {
  if (!!path) {
    if (def) {
      path.setAttribute('d', def.call(this,block))
    } else {
      path.removeAttribute('d')
    }
  }
}

/**
 * Compute the paths of the block depending on its size.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.updateAllPaths_ = function (block) {
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
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.getPaddingLeft = function (block) {
  if (this.wrapped_) {
    return 0
  } else if (block.outputConnection) {
    return this.locked_ && block.getSurroundParent()? 0: ezP.Font.space
  } else {
    return ezP.Padding.l()
  }  
}

/**
 * The right padding of a block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.getPaddingRight = function (block) {
  if (this.wrapped_) {
    return 0
  } else if (block.outputConnection) {
    return this.locked_ && block.getSurroundParent()? 0: ezP.Font.space
  } else {
    return ezP.Padding.r()
  }  
}

/**
 * Render the inputs of the block.
 * @param {!Blockly.Block} block.
 * @protected
 */
ezP.DelegateSvg.prototype.minBlockWidth = function (block) {
  return 0
}

/**
 * Render the inputs, the fields and the tiles of the block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawModel_ = function (block) {
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
  }
  io.cursorX = this.getPaddingLeft(block)
  io.offsetX = 0
  if (!block.outputConnection) {
    this.renderDrawSharp_(io)
    this.shouldSeparateField = false // when true, add a space to separate letters
    // only blocks with outputConnection may be stacked horizontally
    // such that visual letter separation may be a problem
    // For other blocks, there is no text field rendered to the left
  } else if (!block.outputConnection.isConnected() || !this.wrapped_ && !this.locked_) {
    // the left part of the contour is the visual separator
    this.shouldSeparateField = false
  }
  io.shouldSeparateField = this.shouldSeparateField
  
  if ((io.field = this.ui.fromStartField)) {
    do {
      this.renderDrawField_(io)
    } while((io.field = io.field.ezp.nextField))
  }
  if ((io.tile = this.ui.headTile)) {
    do {
      this.renderDrawTile_(io)
      // if (tile.isDisabled()) {

      // } else {
      //   if ((io.field = tile.fromStartField)) {
      //     do {
      //       this.renderDrawField_(io)
      //     } while((io.field = io.field.ezp.nextField))
      //   }

      //   if ((io.field = tile.fromStartField)) {
      //     do {
      //       this.renderDrawField_(io)
      //     } while((io.field = io.field.ezp.nextField))
      //   }    
      // }
    } while ((io.tile = io.tile.nextTile))
  } else {
    for (; (io.input = block.inputList[io.i]); io.i++) {
      goog.asserts.assert(io.input.ezp, 'Input with no ezp '+io.input.name+' in block '+block.type)
      io.inputDisabled = io.input.ezp.disabled_
      if (io.input.isVisible() && !io.inputDisabled) {
        this.renderDrawInput_(io)
      } else {
        for (var j = 0; (io.field = io.input.fieldRow[j]); ++j) {
          if (io.field.getText().length>0) {
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
            var root = io.target.getSvgRoot()
            if (root) {
              root.setAttribute('display', 'none')
            } else {
              console.log('Block with no root: did you ...initSvg()?')
            }
          }
        }
      }
    }
  }
  if ((io.field = this.ui.toEndField)) {
    do {
      this.renderDrawField_(io)
    } while((io.field = io.field.ezp.nextField))
  }
  // enlarge the width if necessary
  io.cursorX = Math.max(io.cursorX, this.minBlockWidth())
  io.cursorX += this.getPaddingRight(block)
  this.minWidth = block.width = Math.max(block.width, io.cursorX)
  this.shouldSeparateField = io.shouldSeparateField
  return io.steps.join(' ')
}

/**
 * Render the the tile in `io.tile`.
 * @param io.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawTile_ = function (io) {
  var root = io.tile.getSvgRoot()
  goog.asserts.assert(root, 'Tile with no root')
  if (io.tile.isDisabled()) {
    root.setAttribute('display', 'none')
  } else {
    root.removeAttribute('display')
    root.setAttribute('transform',
    'translate(' + io.cursorX + ', 0)')
    io.offsetX = io.cursorX
    io.cursorX = 0
    if ((io.field = io.tile.fromStartField)) {
      do {
        this.renderDrawField_(io)
      } while((io.field = io.field.ezp.nextField))
    }
    if ((io.input = io.tile.input)) {
      this.renderDrawInput_(io)
    }
    if ((io.field = io.tile.toEndField)) {
      do {
        this.renderDrawField_(io)
      } while((io.field = io.field.ezp.nextField))
    }
    io.cursorX += io.offsetX
    io.offsetX = 0
  }
}

/**
 * Render the leading # character for collapsed statement blocks.
 * Statement subclasses must override it.
 * @param io.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawSharp_ = function (io) {
  goog.asserts.assert(false, 'renderDrawSharp_ must be overriden by ' + io.block.type)
}

/**
 * Render one input. Default implementation throws.
 * Subclasses must override it.
 * @param io.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawInput_ = function (io) {
  goog.asserts.assert(false, 'renderDrawInput_ must be overriden by ' + this)
}

/**
 * Render the field at io.field, which must be defined.
 * 
 * @param io An input/output record.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawField_ = function (io) {
  var root = io.field.getSvgRoot()
  if (root) {
    if (!io.field.isVisible()) {
      root.setAttribute('display', 'none')
    } else {
      root.removeAttribute('display')
      var text = io.field.getDisplayText_()
      var ezp = io.field.ezp
      if (text.length) {
        // if the text is void, it can not change whether
        // the last character was a letter or not
        if (io.shouldSeparateField && !io.starSymbol && (ezP.XRE.operator.test(text[0]) || text[0] === '.' || ezP.XRE.id_continue.test(text[0]) || ezp.isEditing)) {
          // add a separation
          io.cursorX += ezP.Font.space
        }
        io.shouldSeparateField = ezP.XRE.id_continue.test(text[text.length-1]) || ezP.XRE.operator.test(text[text.length-1]) || text[text.length-1] === ':' || (text[text.length-1] === '.' && !io.field instanceof ezP.FieldTextInput)
        io.starSymbol = (io.f === 0 && (text[text.length-1] === '@' || text[text.length-1] === '*'))
      }
      var x_shift = ezp && !io.block.ezp.wrapped_? ezp.x_shift || 0: 0
      root.setAttribute('transform', 'translate(' + (io.cursorX + x_shift) +
        ', ' + ezP.Padding.t() + ')')
      var size = io.field.getSize()
      io.cursorX += size.width
      if (ezp.isEditing) {
        io.cursorX += ezP.Font.space
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
ezP.DelegateSvg.prototype.renderDrawFields_ = function (io, only_prefix) {
  var here = io.cursorX
  io.f = 0
  for (; (io.field = io.input.fieldRow[io.f]); ++io.f) {
    if (!!only_prefix === !io.field.ezp.suffix) {
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
ezP.DelegateSvg.prototype.renderDrawDummyInput_ = function (io) {
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
ezP.DelegateSvg.prototype.renderDrawValueInput_ = function (io) {
  if (!io.canValue || io.input.type !== Blockly.INPUT_VALUE) {
    return false
  }
  var delta = this.renderDrawFields_(io, true)
  var c8n = io.input.connection
  if (c8n) {// once `&&!c8n.hidden_` was there, bad idea but why was it here?
    c8n.setOffsetInBlock(io.cursorX+io.offsetX, 0)
    var target = c8n.targetBlock()
    if (!!target) {
      var root = target.getSvgRoot()
      if (!!root) {
        root.setAttribute('transform', 'translate(' + io.cursorX + ', 0)')
        if (!target.ezp.skipRendering) {
          target.ezp.shouldSeparateField = (target.ezp.wrapped_ ||target.ezp.locked_) && io.shouldSeparateField
        }
        target.render()
        io.shouldSeparateField = (target.ezp.wrapped_ ||target.ezp.locked_) && target.ezp.shouldSeparateField
        var bBox = target.getHeightWidth()
        io.cursorX += bBox.width
      }
    } else if (!this.locked_ && !c8n.hidden_) {
      // locked blocks won't display any placeholder
      // (input with no target)
      var ezp = c8n.ezp
      var pw = ezp.s7r_ || ezp.optional_?
      this.carretPathDefWidth_(io.cursorX+io.offsetX):
      this.placeHolderPathDefWidth_(io.cursorX+io.offsetX)
      io.steps.push(pw.d)
      io.cursorX += pw.width
      if (pw.width) {
        // a space was added as a visual separator anyway
        io.shouldSeparateField = false
      }
    }
    this.renderDrawFields_(io, false)
  }
  return true
}

/**
 * Block path.
 * @param {goog.size} size.
 * @private
 */
ezP.DelegateSvg.prototype.valuePathDef_ = function (size) {
  /* eslint-disable indent */
  // Top edge.
  var p = ezP.Padding.h()
  var r = (p ** 2 + size.height ** 2 / 4) / 2 / p
  var dx = (ezP.Font.space - p) / 2
  var a = ' a ' + r + ', ' + r + ' 0 0 1 0,'
  var h = size.height + 2 * ezP.Margin.V
  return 'm ' + (size.width - ezP.Font.space + dx) + ',-' + ezP.Margin.V + a +
  h + 'H ' + (dx + p) + a + (-h) + ' z'
} /* eslint-enable indent */

/**
 * Block path.
 * @param {goog.size} size.
 * @private
 */
ezP.DelegateSvg.prototype.outPathDef_ = function () {
  /* eslint-disable indent */
  // Top edge.
  var p = ezP.Padding.h()
  var r = (p ** 2 + ezP.Font.lineHeight() ** 2 / 4) / 2 / p
  var dx = (ezP.Font.space - p) / 2
  var a = ' a ' + r + ', ' + r + ' 0 0 1 0,'
  var h = ezP.Font.lineHeight() + 2 * ezP.Margin.V
  return 'm ' + (dx + p) + ',' + (h - ezP.Margin.V) + a + (-h)
} /* eslint-enable indent */

/**
 * Block path.
 * @param {Number} height.
 * @param {Number} x position.
 * @private
 */
ezP.DelegateSvg.prototype.carretPathDefWidth_ = function (cursorX) {
  /* eslint-disable indent */
  var size = {width:ezP.Font.space, height: ezP.Font.lineHeight()}
  var p = ezP.Padding.h()
  var r = (p ** 2 + size.height ** 2 / 4) / 2 / p
  var dy = ezP.Padding.v() + ezP.Font.descent / 2
  var a = ' a ' + r + ', ' + r + ' 0 0 1 0,'
  var h = size.height + 2 * ezP.Margin.V
  var d = 'M ' + (cursorX + size.width/2) +
  ',' + (ezP.Margin.V + dy) + a + (h - 2 * dy) + a + (-h + 2 * dy) + ' z'
  return {width: size.width, d: d}
} /* eslint-enable indent */

/**
 * Block path.
 * @param {Number} height.
 * @param {Number} x position.
 * @private
 */
ezP.DelegateSvg.prototype.placeHolderPathDefWidth_ = function (cursorX) {
  /* eslint-disable indent */
  var size = {width: 3 * ezP.Font.space, height: ezP.Font.lineHeight()}
  var p = ezP.Padding.h()
  var r = (p ** 2 + size.height ** 2 / 4) / 2 / p
  var dy = ezP.Padding.v() + ezP.Font.descent / 2
  var a = ' a ' + r + ', ' + r + ' 0 0 1 0,'
  var h = size.height + 2 * ezP.Margin.V
  var d = 'M ' + (cursorX + size.width - p) +
  ',' + (ezP.Margin.V + dy) + a + (h - 2 * dy) +
  'h -' + (size.width - 2 * p) + a + (-h + 2 * dy) + ' z'
  return {width: size.width, d: d}
} /* eslint-enable indent */

/**
 * @param {!Blockly.Block} block The owner of the delegate.
 * @param {!Blockly.Connection} c8n The connection to highlight.
 */
ezP.DelegateSvg.prototype.highlightConnectionPathDef = function (block, c8n) {
  var steps = ''
  var block = c8n.sourceBlock_
  if (c8n.type === Blockly.INPUT_VALUE) {
    if (c8n.isConnected()) {
      steps = this.valuePathDef_(c8n.targetBlock())
    } else if (c8n.ezp.s7r_ || c8n.ezp.optional_) {
      steps = this.carretPathDefWidth_(c8n.offsetInBlock_.x).d
    } else {
      steps = this.placeHolderPathDefWidth_(c8n.offsetInBlock_.x).d
    }
  } else if (c8n.type === Blockly.OUTPUT_VALUE) {
    steps = this.valuePathDef_(block)
  } else {
    var r = ezP.Style.Path.Selected.width / 2
    var a = ' a ' + r + ',' + r + ' 0 0 1 0,'
    if (c8n === block.previousConnection) {
      steps = 'm ' + block.width + ',' + (-r) + a + (2 * r) + ' h ' + (-block.width) + a + (-2 * r) + ' z'
    } else if (c8n === block.nextConnection) {
      if (block.height > ezP.Font.lineHeight()) { // this is not clean design
        steps = 'm ' + (ezP.Font.tabWidth+ezP.Style.Path.radius()) + ',' + (block.height-r) + a + (2 * r) + ' h ' + (-ezP.Font.tabWidth-ezP.Style.Path.radius()) + a + (-2 * r) + ' z'
      } else {
        steps = 'm ' + block.width + ',' + (block.height-r) + a + (2 * r) + ' h ' + (-block.width) + a + (-2 * r) + ' z'        
      }
    } else {
      steps = 'm ' + (block.width) + ',' + (-r+ezP.Font.lineHeight()) + a + (2 * r) + ' h ' + (ezP.Font.tabWidth-block.width) + a + (-2 * r) + ' z'
    }
  }
  return steps
}

/**
 * @param {!Blockly.Connection} c8n The connection to highlight.
 */
ezP.DelegateSvg.prototype.highlightConnection = function (block, c8n) {
  var steps
  if (c8n.type === Blockly.INPUT_VALUE) {
    if (c8n.isConnected()) {
      steps = this.valuePathDef_(c8n.targetBlock())
    } else if (c8n.ezp.s7r_ || c8n.ezp.optional_) {
      steps = this.carretPathDefWidth_(0).d
    } else {
      steps = this.placeHolderPathDefWidth_(0).d
    }
  } else if (c8n.type === Blockly.OUTPUT_VALUE) {
    steps = this.valuePathDef_(block)
  } else {
    var r = ezP.Style.Path.Selected.width / 2
    var a = ' a ' + r + ',' + r + ' 0 0 1 0,'
    steps = 'm ' + block.width + ',' + (-r) + a + (2 * r) + ' h ' + (-block.width) + a + (-2 * r) + ' z'
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
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist. Input that are disabled are skipped.
 */
ezP.DelegateSvg.prototype.getInput = function (block, name) {
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
ezP.StatementBlockEnumerator = function (block) {
  var b
  var bs = [block]
  var e8r
  var e8rs = [block.ezp.inputEnumerator(block)]
  var input, next
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
            e8rs.unshift(next.ezp.inputEnumerator(next))
            return next
          }
        }
      }
      if ((b = b.getNextBlock())) {
        bs.unshift(b)
        e8rs.unshift(b.ezp.inputEnumerator(b))
        return b
      }
    }
    return undefined
  }
  return me
}

ezP.DelegateSvg.prototype.nextStatementCheck = undefined
ezP.DelegateSvg.prototype.previousStatementCheck = undefined

/**
 * The default implementation does nothing.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.makeBlockWrapped = function (block) {
  ezP.DelegateSvg.superClass_.makeBlockWrapped.call(this, block)
  goog.asserts.assert(!this.hasSelect(block), 'Deselect block before')
  block.initSvg()
  goog.dom.removeNode(this.svgPathShape_)
  delete this.svgPathShape_
  this.svgPathShape_ = undefined
  goog.dom.removeNode(this.svgPathContour_)
  delete this.svgPathContour_
  this.svgPathContour_ = undefined
}

/**
 * The default implementation does nothing.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.makeBlockUnwrapped = function (block) {
  ezP.DelegateSvg.superClass_.makeBlockUnwrapped.call(this, block)
  this.svgPathContour_ = Blockly.utils.createSvgElement('path', {'class': 'ezp-path-contour'}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathContour_, 0)
  this.svgPathShape_ = Blockly.utils.createSvgElement('path', {'class': 'ezp-path-shape'}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathShape_, 0)
}

/**
 * Whether the block is selected.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.hasSelect = function (block) {
  return goog.dom.classlist.contains(block.svgGroup_, 'ezp-select')
}

/**
 * Enable/Disable an input.
 * The default implementation does nothing.
 * Subclassers may enable/disable an input
 * depending on the context.
 * Even input with target may be disabled.
 * This status is a part of the state of the block.
 * It survives copy/paste but not undo/redo.
 * @param {!Block} block.
 * @param {!Input} input.
 * @param {!Boolean} enabled.
 * @private
 */
ezP.DelegateSvg.prototype.setInputEnabled = function (block, input, enabled) {
  if (enabled == !input.disabled_) {
    return enabled
  }
  input.disabled_ = !enabled
  input.setVisible(enabled)
  input.connection.setHidden(!enabled)
}

/**
 * Set the enable/disable status of the given block.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.delayedRender = function (block) {
  if (!goog.isDef(this.delayedRender)) {
    this.delayedRender = setTimeout(function(){
      delete block.ezp.delayedRender
      if (block.workspace) {
        block.render()
      }
    }, 10)
  }
}

/**
 * Create a new block, with svg background and wrapped blocks.
 * This is the expected way to create the block.
 * The is a caveat due to proper timing in initializing the svg.
 * Whether blocks are headless or not is not clearly designed in Blockly.
 * @param {!WorkspaceSvg} workspace.
 * @param {!String} prototypeName.
 * @private
 */
ezP.DelegateSvg.newBlockComplete = function (workspace, prototypeName, id, initSvg) {
  var B = workspace.newBlock(prototypeName, goog.isString(id) && id)
  B.ezp.completeWrapped_(B)
  B.ezp.consolidate(B, true)
  if (goog.isBoolean(id) && id || initSvg) {
    B.initSvg()
  }
  return B
}

/**
 * Prepare the block to be displayed in the given workspace.
 * Nothing implemented yet
 * @param {!Block} block.
 * @param {!WorkspaceSvg} workspace.
 * @param {!Number} x.
 * @param {!Number} y.
 * @param {!String} variant.
 * @private
 */
ezP.DelegateSvg.prototype.prepareForWorkspace = function (block, workspace, x, y, variant) {
  
}

/**
 * Returns the python type of the block.
 * This information may be displayed as the last item in the contextual menu.
 * Wrapped blocks will return the parent's answer.
 * @param {!Blockly.Block} block The block.
 */
ezP.DelegateSvg.prototype.getPythonType = function (block) {
  if (this.wrapped_) {
    var parent = block.getParent()
    return parent.ezp.getPythonType(parent)
  }
  return this.pythonType_
}

/**
 * Can insert a block above?
 * If the block's output connection is connected,
 * can connect the parent's output to it?
 * The connection cannot always establish.
 * @param {!Block} block.
 * @param {string} prototypeName.
 * @param {string} surroundInputName, which parent's connection to use
 */
ezP.DelegateSvg.prototype.canInsertParent = function(block, prototypeName, subtype, surroundInputName) {
  var can = false
  return can
}

/**
 * Insert a parent.
 * If the block's output connection is connected,
 * connects the parent's output to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {!Block} block.
 * @param {string} prototypeName.
 * @param {string} surroundInputName, which parent's connection to use
 * @param {string} subtype, for subclassers
 * @return the created block
 */
ezP.DelegateSvg.prototype.insertParent = function(block, surroundPrototypeName, subtype, surroundInputName) {
  goog.asserts.assert(false, 'Must be subclassed')
}

/**
 * Get the hole filler data object for the given check.
 * @param {!Array} check an array of types.
 * @param {objet} value value of the block that will fill the hole, a string for an identifier block.
 * @private
 */
ezP.HoleFiller.getData = function(check, value) {
  var data
  if (goog.isFunction(value)) {
    data = {
      filler: value,
    }
  } else if (check.indexOf(ezP.T3.Expr.identifier) >= 0) {
    if (value) {
      data = {
        type: ezP.T3.Expr.term,
        value: value,
      }
    }
  } else if(check.length === 1 && ezP.T3.All.core_expressions.indexOf(check[0])>=0) {
    data = {
      type: check[0],
      value: value,
    }
  }
  return data
}

/**
 * Get an array of the deep connections that can be filled.
 * @param {!Block} block.
 * @param {Array} holes whengiven the is the array to be filled
 * @return an array of conections, holes if given.
 */
ezP.HoleFiller.getDeepHoles = function(block, holes) {
  var H = holes || []
  var e8r = block.ezp.inputEnumerator(block)
  while (e8r.next()) {
    var c8n = e8r.here.connection
    if (c8n && c8n.type === Blockly.INPUT_VALUE && (!c8n.ezp.disabled_ || c8n.ezp.wrapped_)) {
      var target = c8n.targetBlock()
      if (target) {
        ezP.HoleFiller.getDeepHoles(target, H)
      } else if (c8n.ezp.hole_data) {
        H.push(c8n)
      }
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
ezP.HoleFiller.fillDeepHoles = function(workspace, holes) {
  var i = 0
  for (; i < holes.length; ++i) {
    var c8n = holes[i]
    if (c8n && c8n.type === Blockly.INPUT_VALUE && !c8n.isConnected()) {
      var data = c8n.ezp.hole_data
      if (data) {
        try {
          if (data.filler) {
            var B = data.filler(workspace)
          } else {
            B = ezP.DelegateSvg.newBlockComplete(workspace, data.type, true)
            if (data.value) {
              B.ezp.setPhantomValue && B.ezp.setPhantomValue(B, data.value) ||
              B.ezp.setValue && B.ezp.data.value.set(data.value)
            }
          }
          c8n.connect(B.outputConnection)
        } catch(err) {
          console.log(err.message)
        }
      }
    }
  }
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
ezP.DelegateSvg.prototype.useWrapType = function (block, key, newType) {
  var input = block.getInput(key)
  var returnState = false
  if (input) {
    var target = input.connection.targetBlock()
    var oldType = target? target.type: undefined
    if (newType != oldType) {
      var grouper = new ezP.Events.Grouper()
      try {
        if (target) {
          target.unplug()
          target.dispose()
        }
        this.completeWrappedInput_(block, input, newType)
        returnState = true
      } finally {
        grouper.stop()        
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
ezP.DelegateSvg.prototype.getGlobalBoundingRect = function(block) {
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
ezP.DelegateSvg.prototype.getBoundingRect = function(block) {
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
ezP.DelegateSvg.prototype.getBoundingBox = function(block) {
  return this.getBoundingRect(block).toBox()
}

/**
 * Get the closest box, according to the filter.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {function} distance is a function.
 * @return None
 */
ezP.DelegateSvg.getBestBlock = function (workspace, weight) {
  var smallest = Infinity, best
  for (var i = 0, top; (top = workspace.topBlocks_[i++]);) {
    var box = top.ezp.getBoundingRect(top)
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
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {function} distance is a function.
 * @return None
 */
ezP.DelegateSvg.prototype.getBestBlock = function (block, distance) {
  const a = this.getBoundingBox(block)
  var smallest = {}, best
  for (var i = 0, top; (top = block.workspace.topBlocks_[i++]);) {
    if (top === block) {
      continue
    }
    var b = top.ezp.getBoundingBox(top)
    var target = top
    var c8n
    while ((c8n = target.nextConnection) && (target = c8n.targetBlock())) {
      b.expandToInclude(target.ezp.getBoundingBox(target))
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
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.prototype.selectBlockLeft = function (block) {
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    target.ezp.selectBlockLeft(target)
    return
  }
  var doLast = function(B) {
    var e8r = B.ezp.inputEnumerator(B)
    e8r.end()
    while (e8r.previous()) {
      var c8n = e8r.here.connection
      if (c8n && (!c8n.hidden_ || c8n.ezp.wrapped_) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
        var target = c8n.targetBlock()
        if (!target || (!target.ezp.wrapped_ && !target.ezp.locked_) || (c8n = doLast(target))) {
          return c8n
        }
      }
    }
    return null
  }
  var parent, input, c8n
  var selectTarget = function(c8n) {
    var target = c8n.targetBlock()
    if (!target) {
      return false
    }
    if (!target.ezp.wrapped_ && !target.ezp.locked_) {
      ezP.SelectedConnection.set(null)
      target.select()
      return true
    }
    if ((c8n = doLast(target))) {
      if ((target = c8n.targetBlock())) {
        ezP.SelectedConnection.set(null)
        target.select()
      } else {
        ezP.SelectedConnection.set(c8n)
      }
      return true
    }
    return false
  }
  var selectConnection = function(B) {
    if (selectTarget(c8n)) {
      return true
    }
    // do not select a connection
    // if there is no unwrapped surround parent
    var parent = B
    while (parent.ezp.wrapped_ || parent.ezp.locked_) {
      if (!(parent = parent.getSurroundParent())) {
        return false
      }
    }
    ezP.SelectedConnection.set(c8n)
    return true
  }
  if ((c8n = this.selectedConnection)) {
    if (c8n === block.nextStatement) {
    } else if (c8n.type !== Blockly.NEXT_STATEMENT) {
      // select the previous non statement input if any
      var e8r = block.ezp.inputEnumerator(block)
      while (e8r.next()) {
        if (e8r.here.connection && c8n === e8r.here.connection) {
          // found it, step down
          e8r.previous()
          while (e8r.previous()) {
            if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.ezp.wrapped_) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
              if (selectConnection(block)) {
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
            if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.ezp.wrapped_) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
              if (selectConnection(block)) {
                return true
              }
            }
          }
          break
        }
      }
    } else if (!block.ezp.wrapped_ && !block.ezp.locked_) {
      ezP.SelectedConnection.set(null)
      block.select()
      return true
    }
  }
  if ((parent = block.getSurroundParent())) {
    // select the previous non statement input if any
    var e8r = parent.ezp.inputEnumerator(parent)
    while (e8r.next()) {
      if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.ezp.wrapped_) && block === c8n.targetBlock()) {
        // found it, step down
        e8r.previous()
        while (e8r.previous()) {
          if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.ezp.wrapped_) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
            if (selectConnection(c8n)) {
              return true
            }
          }
        }
        break
      }
    }
    do {
      if (!parent.ezp.wrapped_ && !parent.ezp.locked_) {
        ezP.SelectedConnection.set(null)
        parent.select()
        return true
      }
    } while ((parent = parent.getSurroundParent()))
  }
  target = block
  do {
    parent = target
  } while ((target = parent.getSurroundParent()))
  target = parent.ezp.getBestBlock(parent, function(a, b) {
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
      major: a.left - b.left + Math.abs(a.bottom + a.top - b.bottom - b.top)/3,
      minor: b.bottom - b.top,
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
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return yorn
 */
ezP.DelegateSvg.prototype.selectBlockRight = function (block) {
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    return target.ezp.selectBlockRight(target)
  }
  var parent, input, c8n
  var selectTarget = function() {
    if (target = c8n.targetBlock()) {
      if (target.ezp.wrapped_ || target.ezp.locked_) {
        return target.ezp.selectBlockRight(target)
      } else {
        ezP.SelectedConnection.set(null)
        target.select()
        return true
      }
    }
    return false
  }
  var selectConnection = function() {
    if (c8n.hidden_ && !c8n.ezp.wrapped_) {
      return false
    }
    if (!selectTarget()) {
      parent = block
      while (parent.ezp.wrapped_ || parent.ezp.locked_) {
        if (!(parent = parent.getSurroundParent())) {
          return false
        }
      }
      ezP.SelectedConnection.set(c8n)
    }
    return true
  }
  if ((c8n = this.selectedConnection)) {
    if (c8n.type === Blockly.NEXT_STATEMENT) {
      if (c8n === block.nextConnection) {
        // select the target block (if any) when the nextConnection is in horizontal mode
        if (c8n.ezp.isAtRight) {
          if (selectTarget()) {
            return true
          }
        }
      } else if (selectTarget()) {
        return true
      }
    } else if (selectTarget()) {
      // the connection was selected, now it is its target
      return true
    } else {
      // select the connection following `this.selectedConnection`
      // which not a NEXT_STATEMENT one, if any
      var e8r = block.ezp.inputEnumerator(block)
      while (e8r.next()) {
        if (e8r.here.connection && c8n === e8r.here.connection) {
          // found it
          while (e8r.next()) {
            if ((c8n = e8r.here.connection) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
              if (selectConnection()) {
                return true
              }
            }
          }
        }
      }
      // it was the last value connection
      // find a statement connection
      e8r.start()
      while(e8r.next()) {
        if ((c8n = e8r.here.connection) && (c8n.type === Blockly.NEXT_STATEMENT)) {
          if (selectConnection()) {
            return true
          }
        }
      }
    }
  } else {
    // select the first non statement connection
    var e8r = block.ezp.inputEnumerator(block)
    while (e8r.next()) {
      if ((c8n = e8r.here.connection) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
        if (selectConnection()) {
          return true
        }
      }
    }
    // all the input connections are either dummy or statement connections
    // select the first statement connection (there is an only one for the moment)
    e8r.start()
    while (e8r.next()) {
      if ((c8n = e8r.here.connection) && (c8n.type === Blockly.NEXT_STATEMENT)) {
        if (selectConnection()) {
          return true
        }
      }
    }
  }
  if (!(c8n = this.selectedConnection) || (c8n.type !== Blockly.NEXT_STATEMENT)) {
    // try to select the next connection of a surrounding block
    // only when a value input is connected to the block
    target = block
    while ((parent = target.getSurroundParent())) {
      var e8r = parent.ezp.inputEnumerator(parent)
      while (e8r.next()) {
        if ((c8n = e8r.here.connection) && (target === c8n.targetBlock())) {
          if (c8n.type === Blockly.NEXT_STATEMENT) {
            // nothing is more right...
            break
          } else {
            // try a value input after
            while (e8r.next()) {
              if ((c8n = e8r.here.connection) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
                if (selectConnection()) {
                  return true
                }
              }
            }
            // try the next statement input if any
            e8r.start()
            while (e8r.next()) {
              if ((c8n = e8r.here.connection) && (c8n.type === Blockly.NEXT_STATEMENT)) {
                if (selectConnection()) {
                  return true
                }
              }
            }
          }
        }
      }
      target = parent
    }
    target = block
    while ((parent = target.getSurroundParent())) {
      var e8r = parent.ezp.inputEnumerator(parent)
      while (e8r.next()) {
        if ((c8n = e8r.here.connection) && (c8n.type === Blockly.NEXT_STATEMENT) && (target = c8n.targetBlock()) && (target !== block)) {
          ezP.SelectedConnection.set(null)
          target.select()
          return true
        }
      }
      target = parent
    }
  }
  // now try to select a top block
  target = block
  do {
    parent = target
  } while ((target = parent.getSurroundParent()))
  target = parent.ezp.getBestBlock(parent, function(a, b) {
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
      major: b.right - a.right + Math.abs(a.bottom + a.top - b.bottom - b.top)/3,
      minor: b.bottom - b.top,
    }
  })
  if (target) {
    ezP.SelectedConnection.set(null)
    target.select()
    return true
  }
}

/**
 * Select the block above the owner.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.prototype.selectBlockAbove = function (block) {
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    target.ezp.selectBlockAbove(target)
    return
  }
  var c8n
  if ((c8n = this.selectedConnection)) {
    if (c8n === block.previousConnection) {
      if ((target = c8n.targetBlock())) {
        ezP.SelectedConnection.set(null)
        target.select()
        return
      }
    } else {
      ezP.SelectedConnection.set(null)
      block.select()
      return
    }
  } else if ((c8n = block.previousConnection)) {
    block.select()
    ezP.SelectedConnection.set(block.previousConnection)
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
  target = parent.ezp.getBestBlock(parent, function(a, b) {
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
      major: a.top - b.top + Math.abs(a.left + a.right - b.left - b.right)/3,
      minor: b.right - b.left,
    }
  })
  if (target) {
    target.select()
  }
}

/**
 * Select the block below the owner.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.prototype.selectBlockBelow = function (block) {
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    target.ezp.selectBlockBelow(target)
    return
  }
  var parent, c8n
  if ((c8n = this.selectedConnection)) {
    if (c8n === block.previousConnection) {
      ezP.SelectedConnection.set(null)
      block.select()
      return
    } else if (c8n === block.nextConnection) {
      if ((target = c8n.targetBlock())) {
        ezP.SelectedConnection.set(null)
        target.select()
        return
      }
    } else if (block.nextConnection) {
      block.select()
      ezP.SelectedConnection.set(block.nextConnection)
      return
    }
  } else if (block.nextConnection) {
    block.select()
    ezP.SelectedConnection.set(block.nextConnection)
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

  target = parent.ezp.getBestBlock(parent, function(a, b) {
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
      major: b.bottom - a.bottom + Math.abs(a.left + a.right - b.left - b.right)/3,
      minor: b.right - b.left,
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
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {Object} e in general a mouse down event
 * @return None
 */
ezP.DelegateSvg.prototype.getConnectionForEvent = function (block, e) {
  var where = new goog.math.Coordinate(e.clientX, e.clientY)
  where = goog.math.Coordinate.difference(where, block.workspace.getOriginOffsetInPixels())
  where.scale(1/block.workspace.scale)
  var rect = this.getBoundingRect(block)
  where = goog.math.Coordinate.difference(where, rect.getTopLeft())
  var e8r = block.ezp.inputEnumerator(block)
  while (e8r.next()) {
    var c8n = e8r.here.connection
    if (c8n && (!c8n.hidden_ || c8n.ezp.wrapped_)) {
      if (c8n.type === Blockly.INPUT_VALUE) {
        var target = c8n.targetBlock()
        if (target) {
          if ((c8n = target.ezp.getConnectionForEvent(target, e))) {
            return c8n
          }
        } else {
          var R = new goog.math.Rect(
            c8n.offsetInBlock_.x - ezP.Font.space/2,
            c8n.offsetInBlock_.y + ezP.Font.space/2,
            c8n.ezp.optional_ || c8n.ezp.s7r_? 2*ezP.Font.space: 4*ezP.Font.space,
            ezP.Font.lineHeight() - ezP.Font.space,        
          )
          if (R.contains(where)) {
            return c8n
          }
        }
      } else if (c8n.type === Blockly.NEXT_STATEMENT) {
        var R = new goog.math.Rect(
          c8n.offsetInBlock_.x,
          c8n.offsetInBlock_.y - ezP.Font.space/2,
          ezP.Font.tabWidth,
          ezP.Font.space,        
        )
        if (R.contains(where)) {
          return c8n
        }        
      }
    }
  }
  if ((c8n = block.previousConnection) && !c8n.hidden) {
    var R = new goog.math.Rect(
      c8n.offsetInBlock_.x,
      c8n.offsetInBlock_.y,
      rect.width,
      ezP.Font.space/2,        
    )
    if (R.contains(where)) {
      return c8n
    }  
  }
  if ((c8n = block.nextConnection) && !c8n.hidden) {
    if (rect.height > ezP.Font.lineHeight()) {// Not the cleanest design
      var R = new goog.math.Rect(
        c8n.offsetInBlock_.x,
        c8n.offsetInBlock_.y - ezP.Font.space/2,
        ezP.Font.tabWidth + ezP.Style.Path.radius(),// R U sure?
        ezP.Font.space/2,        
      )  
    } else {
      var R = new goog.math.Rect(
        c8n.offsetInBlock_.x,
        c8n.offsetInBlock_.y - ezP.Font.space/2,
        rect.width,
        ezP.Font.space/2,        
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
ezP.SelectedConnection = function() {
  var c8n_
  var me = {
    /**
     * Lazy getter
    */
    get: function() {
      return c8n_
    },
    set: function(connection) {
      var B
      if (connection) {
        var block = connection.getSourceBlock()
        if (block) {
          if (block.ezp.locked_) {
            return
          }
          if (connection === block.previousConnection && connection.targetConnection) {
            connection = connection.targetConnection
            var unwrapped = block = connection.getSourceBlock()
            do {
              if (!unwrapped.ezp.wrapped_) {
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
            oldBlock.ezp.selectedConnection = null
            oldBlock.ezp.selectedConnectionSource_ = null
            oldBlock.removeSelect()
            if (oldBlock === Blockly.selected) {
              oldBlock.ezp.updateAllPaths_(oldBlock)
              oldBlock.addSelect()
            } else if ((B = Blockly.selected)) {
              B.ezp.selectedConnectionSource_ = null
              B.removeSelect()
              B.addSelect()
            }
          }
          c8n_ = null
        }
        if (connection) {
          var block = connection.getSourceBlock()
          if (block) {
            var unwrapped = block
            while (unwrapped.ezp.wrapped_) {
              if (!(unwrapped = unwrapped.getSurroundParent())) {
                return
              }
            }
            block.ezp.selectedConnection = c8n_ = connection
            unwrapped.ezp.selectedConnectionSource_ = block
            unwrapped.select()
            block.removeSelect()
            block.ezp.updateAllPaths_(block)
            block.addSelect()
          }
        }
      }
    }
  }
  return me
} ()

/**
 * Insert a block of the given type.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {Object} action the prototype of the block to insert, or an object containning this prototype.
 * @param {string} subtype the subtype of the block to insert.
 * @return the block that was inserted
 */
ezP.DelegateSvg.prototype.insertBlockOfType = function (block, action, subtype) {
  if (!action) {
    return null
  }
  // get the type:
  var prototypeName = action.type || action
  // create a block out of the undo mechanism
  var disabler = new ezP.Events.Disabler()
  try {
    var candidate = ezP.DelegateSvg.newBlockComplete(block.workspace, prototypeName, true)
    if (!candidate) {
      disabler.stop()
      return
    }
    var c8n_N = action.subtype || subtype
    if (candidate.ezp.data.subtype.set(c8n_N)) {
      c8n_N = undefined
    }
    var c8n, otherC8n, foundC8n
    var fin = function(prepare) {
      disabler.stop()
      var grouper = new ezP.Events.Grouper()
      try {
        if (Blockly.Events.isEnabled()) {
          Blockly.Events.fire(new Blockly.Events.BlockCreate(candidate))
        }
        candidate.render()
        prepare && prepare()
        otherC8n.connect(c8n)
        candidate.select()
        candidate.bumpNeighbours_()
      } finally {
        grouper.stop()
      }
      return candidate
    }
    if ((otherC8n = ezP.SelectedConnection.get())) {
      var otherSource = otherC8n.getSourceBlock()
      if (otherC8n.type === Blockly.INPUT_VALUE) {
        if ((c8n = candidate.outputConnection)&& c8n.checkType_(otherC8n)) {
          return fin()
        }
      } else if (otherC8n === otherSource.previousConnection) {
        if ((c8n = candidate.nextConnection)&& c8n.checkType_(otherC8n)) {
          var targetC8n = otherC8n.targetConnection
          if (targetC8n && candidate.previousConnection
            && targetC8n.checkType_(candidate.previousConnection)) {
            return fin(function() {
              targetC8n.connect(candidate.previousConnection)
            })
          } else {
            return fin(function() {
              var its_xy = block.getRelativeToSurfaceXY();
              var my_xy = candidate.getRelativeToSurfaceXY();
              var HW = candidate.getHeightWidth()
              candidate.moveBy(its_xy.x-my_xy.x, its_xy.y-my_xy.y-HW.height)
            })
          }
          // unreachable code
        }
      } else if (otherC8n.type === Blockly.NEXT_STATEMENT) {
        if ((c8n = candidate.previousConnection)&& c8n.checkType_(otherC8n)) {
          var targetC8n = otherC8n.targetConnection
          if (targetC8n && candidate.nextConnection
            && targetC8n.checkType_(candidate.nextConnection)) {
            return fin(function() {
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
      var findC8n = function(block) {
        var e8r = block.ezp.inputEnumerator(block)
        var otherC8n, foundC8n, target
        while (e8r.next()) {
          if ((foundC8n = e8r.here.connection) && foundC8n.type === Blockly.INPUT_VALUE) {
            if ((target = foundC8n.targetBlock())) {
              if (!(foundC8n = findC8n(target))) {
                continue
              }
            } else if (!c8n.checkType_(foundC8n)) {
              continue
            }
            if (!foundC8n.ezp.s7r_ && (!c8n_N || foundC8n.ezp.name_ === c8n_N)) {
              // we have found a connection
              // which s not a separator and
              // with the expected name
              return foundC8n
            }
            // if there is no connection with the expected name,
            // then remember this connection and continue the loop
            // We remember the last separator connection
            // of the first which is not a separator
            if (!otherC8n || otherC8n.ezp.s7r_) {
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
        return fin(function() {
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
          return fin(function() {
            candidate.previousConnection.connect(targetC8n)
          })
        } else {
          return fin(function() {
            var its_xy = block.getRelativeToSurfaceXY();
            var my_xy = candidate.getRelativeToSurfaceXY();
            var HW = candidate.getHeightWidth()
            candidate.moveBy(its_xy.x-my_xy.x, its_xy.y-my_xy.y-HW.height)
          })
        }
      }
    }
    if (candidate) {
      candidate.dispose(true)
    }
  } finally {
    disabler.stop()
  }
}

/**
 * Whether the given block can lock.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return boolean
 */
ezP.DelegateSvg.prototype.canLock = function (block) {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var e8r = block.ezp.inputEnumerator(block), c8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((target = c8n.targetBlock())) {
        if (!target.ezp.canLock(target)) {
          return false
        }
      } else if (!c8n.ezp.optional_ && !c8n.ezp.s7r_) {
        return false
      }
    }
  }
  return true
}
/**
 * Whether the given block can unlock.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return boolean, true only if there is something to unlock
 */
ezP.DelegateSvg.prototype.canUnlock = function (block) {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var e8r = block.ezp.inputEnumerator(block), c8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((target = c8n.targetBlock())) {
        if (target.ezp.canUnlock(target)) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * Lock the given block.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return the number of block locked
 */
ezP.DelegateSvg.prototype.lock = function (block) {
  var ans = 0
  if (this.locked_ || !block.ezp.canLock(block)) {
    return ans
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
    block, ezP.Const.Event.locked, null, this.locked_, true))
  }
  this.locked_ = true
  if (block === ezP.SelectedConnection.set)
  ezP.SelectedConnection.set(null)
  // list all the input for connections with a target
  var c8n
  if ((c8n = ezP.SelectedConnection.get()) && (block === c8n.getSourceBlock())) {
    ezP.SelectedConnection.set(null)
  }
  var e8r = block.ezp.inputEnumerator(block), otherC8n, foundC8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((target = c8n.targetBlock())) {
        ans += target.ezp.lock(target)
      }
      if (c8n.type === Blockly.INPUT_VALUE) {
        c8n.setHidden(true)
      }
    }
  }
  if ((c8n = block.nextConnection)) {
    if ((target = c8n.targetBlock())) {
      ans += target.ezp.lock(target)
    }
  }
  if (block === Blockly.selected) {
    var parent = block
    while ((parent = parent.getSurroundParent())) {
      if (!parent.ezp.wrapped_ && ! parent.ezp.locked_) {
        parent.select()
        break
      }
    }
  }
  (block.getSurroundParent()||block).render()
  return ans
}
/**
 * Unlock the given block.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {boolean} deep Whether to unlock statements too.
 * @return the number of block locked
 */
ezP.DelegateSvg.prototype.unlock = function (block, shallow) {
  var ans = 0
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
    block, ezP.Const.Event.locked, null, this.locked_, false))
  }
  this.locked_ = false
  // list all the input for connections with a target
  var e8r = block.ezp.inputEnumerator(block), c8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((!shallow || c8n.type === Blockly.INPUT_VALUE) && (target = c8n.targetBlock())) {
        ans += target.ezp.unlock(target, shallow)
      }
      c8n.setHidden(false)
    }
  }
  if (!shallow && (c8n = block.nextConnection)) {
    if ((target = c8n.targetBlock())) {
      ans += target.ezp.unlock(target)
    }
  }
  (block.getSurroundParent()||block).render()
  return ans
}

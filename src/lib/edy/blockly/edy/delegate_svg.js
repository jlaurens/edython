/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.DelegateSvg')
goog.provide('edY.HoleFiller')

goog.require('edY.Delegate')
goog.forwardDeclare('edY.BlockSvg')

/**
 * Class for a DelegateSvg.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.Delegate.makeSubclass('Svg')

// Mimic Blockly naming convention
edY.DelegateSvg = edY.Delegate.Svg

edY.DelegateSvg.Manager = edY.Delegate.Manager

/**
 * Method to register an expression or a statement block.
 * The delegate is searched as a DelegateSvg element
 */
edY.DelegateSvg.Manager.register = function (key) {
  var prototypeName = edY.T3.Expr[key]
  var delegateC9r = undefined
  var available = undefined
  if (prototypeName) {
    (key === 'numberliteral') && console.log('Registering expression', key)
    delegateC9r = edY.DelegateSvg.Expr[key]
    available = edY.T3.Expr.Available
  } else if ((prototypeName = edY.T3.Stmt[key])) {
    // console.log('Registering statement', key)
    delegateC9r = edY.DelegateSvg.Stmt[key]
    available = edY.T3.Stmt.Available
  } else {
    throw "Unknown block edY.T3.Expr or edY.T3.Stmt key: "+key
  }
  edY.DelegateSvg.Manager.registerDelegate_(prototypeName, delegateC9r)
  available.push(prototypeName)
}

/**
 * This is the shape used to draw the outline of a block
 * @private
 */
edY.DelegateSvg.prototype.svgPathShape_ = undefined

/**
 * This is the shape used to draw the background of a block
 * @private
 */
edY.DelegateSvg.prototype.svgPathContour_ = undefined

/**
 * This is the shape used to draw a collapsed block.
 * Background or outline ?
 * @private
 */
edY.DelegateSvg.prototype.svgPathCollapsed_ = undefined

/**
 * This is the shape used to draw a block...
 * @private
 */
edY.DelegateSvg.prototype.svgPathInline_ = undefined

/**
 * This is the shape used to draw an highlighted block contour.
 * @private
 */
edY.DelegateSvg.prototype.svgPathHighlight_ = undefined

/**
 * This is the shape used to draw an highlighted connection contour.
 * @private
 */
edY.DelegateSvg.prototype.svgPathConnection_ = undefined

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

goog.require('edY.Tile')

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
edY.DelegateSvg.prototype.initBlock = function(block) {
  edY.DelegateSvg.superClass_.initBlock.call(this, block)
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
        var model = edY.DelegateSvg.Manager.getModel(insert)
        if (model) {
          makeTiles(owner, model.tiles)
          if ((tile = ui.headTile)) {
            delete ui.tiles
            nextTile = tile
            do {
              goog.asserts.assert(!goog.isDef(tiles[nextTile.key]),
              edY.Do.format('Duplicate inserted tile key {0}/{1}/{2}', nextTile.key, insert, block.type))
              tiles[nextTile.key] = tile
            } while ((nextTile = nextTile.nextTile))
          } else {
            continue
          }
        } else {
          continue
        }
      } else if (goog.isObject(tileModel) && (tile = new edY.Tile(owner, k, tileModel))) {
        goog.asserts.assert(!goog.isDef(tiles[k]),
        edY.Do.format('Duplicate tile key {0}/{1}', k, block.type))
        tiles[k] = tile
      } else {
        continue
      }
      tile.order = order
      for (var i = 0; i < ordered.length; i++) {
        // we must not find an aleady existing entry.
        goog.asserts.assert(i != tile.order,
        edY.Do.format('Same order tile {0}/{1}', i, block.type))
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
  edY.Tile.makeFields(this, ui, model.fields)
  // now initialize all the fields
  this.ui = ui
  if (!block.workspace.options.readOnly && !this.eventsInit_) {
    Blockly.bindEventWithChecks_(block.getSvgRoot(), 'mouseup', block,
    function(e) {
      block.edy.onMouseUp_(block, e)
    })
  }
  this.eventsInit_ = true;
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
edY.DelegateSvg.prototype.deinitBlock = function(block) {
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
  edY.DelegateSvg.superClass_.deinitBlock.call(this, block)
}

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 * @param {!Blockly.Block} block to be initialized..
 */
edY.DelegateSvg.prototype.preInitSvg = function(block) {
}

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 * @param {!Blockly.Block} block to be initialized.
 */
edY.DelegateSvg.prototype.postInitSvg = function(block) {
  if(this.svgPathContour_) {
    return
  }
  goog.dom.removeNode(block.svgPath_)
  delete block.svgPath_
  goog.dom.removeNode(block.svgPathLight_)
  delete block.svgPathLight_
  goog.dom.removeNode(block.svgPathDark_)
  delete block.svgPathDark_
    this.svgPathInline_ = Blockly.utils.createSvgElement('path',
    {'class': 'edy-path-contour'}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathInline_, 0)
  this.svgPathCollapsed_ = Blockly.utils.createSvgElement('path', {'class': 'edy-path-collapsed'}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathCollapsed_, 0)
  this.svgPathContour_ = Blockly.utils.createSvgElement('path', {'class': 'edy-path-contour'}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathContour_, 0)
  this.svgPathShape_ = Blockly.utils.createSvgElement('path', {'class': 'edy-path-shape'}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathShape_, 0)
  this.svgPathHighlight_ = Blockly.utils.createSvgElement('path',
    {'class': 'edy-path-selected'}, null)
  this.svgPathConnection_ = Blockly.utils.createSvgElement('path',
    {'class': 'edy-path-selected'}, null)
  Blockly.utils.addClass(/** @type {!Element} */ (block.svgGroup_),
    'edy-block')
}

/**
 * Returns the named field from a block.
 * Only fields that do not belong to an input are searched for.
 * @param {string} name The name of the field.
 * @return {Blockly.Field} Named field, or null if field does not exist.
 */
edY.DelegateSvg.prototype.getField = function(block, name) {
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
edY.DelegateSvg.prototype.synchronizeTiles = function(block) {
  var tile = this.ui.headTile
  while (tile) {
    tile.synchronize()
    tile = tile.nextTile
  }
}

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
edY.DelegateSvg.prototype.getMenuTarget = function(block) {
  var wrapped
  if (this.ui.wrap && (wrapped = this.ui.wrap.input.connection.targetBlock())) {
    return wrapped.edy.getMenuTarget(wrapped)
  }
  if (this.wrappedInputs_ && this.wrappedInputs_.length === 1 &&
    (wrapped = this.wrappedInputs_[0][0].connection.targetBlock())) {
      // if there are more than one wrapped block,
      // then we choose none of them
    return wrapped.edy.getMenuTarget(wrapped)
  }
  return block
}

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {!Block} block.
 * @param {boolean=} optBubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
edY.DelegateSvg.prototype.render = function (block, optBubble) {
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
edY.DelegateSvg.prototype.consolidate = function (block, deep, force) {
  for (var k in this.data) {
    var data = this.data[k]
    data.consolidate()
  }
  var tile = this.ui.headTile
  while (tile) {
    tile.consolidate()
    tile = tile.nextTile
  } 
  if (deep) {
    var e8r = block.edy.inputEnumerator(block), x
    while (e8r.next()) {
      if ((x = e8r.here.connection) && (x = x.targetBlock())) {
        x.edy.consolidate(x, deep, force)
      }
    }
  }
  this.consolidateType(block)
}

/**
 * Whether the block is sealed to its parent.
 * The sealed status is decided at init time.
 * The corresponding input.edy.connection.wrapped_ is set to true.
 * @private
 */
edY.DelegateSvg.prototype.wrapped_ = undefined

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
edY.DelegateSvg.prototype.willRender_ = function (block) {
  if (block.svgGroup_) {
    if (this.locked_ && block.outputConnection && block.getSurroundParent()) {
      goog.dom.classlist.add(/** @type {!Element} */(block.svgGroup_), 'edy-locked')
    } else {
      goog.dom.classlist.remove(/** @type {!Element} */(block.svgGroup_), 'edy-locked')
    }
  }
  // change the class of the shape on error
  var F = !!Object.keys(this.errors).length?
  goog.dom.classlist.add:
  goog.dom.classlist.remove
  var FF = function(elt) {
    if (/** @type {!Element} */(elt)) {
      F(elt, 'edy-error')
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
edY.DelegateSvg.prototype.didRender_ = function (block) {
}

/**
 * Layout previous, next and output block connections.
 * @param {!Block} block.
 * @private
 */
edY.DelegateSvg.prototype.layoutConnections_ = function (block) {
  if (block.outputConnection) {
    block.outputConnection.setOffsetInBlock(0, 0)
  } else {
    if (block.previousConnection) {
      block.previousConnection.setOffsetInBlock(0, 0)
    }
    if (block.nextConnection) {
      if (block.isCollapsed()) {
        block.nextConnection.setOffsetInBlock(0, 2 * edY.Font.lineHeight())
      } else {
        block.nextConnection.setOffsetInBlock(0, block.height)
      }
    }
  }
}

/**
 * Block shape. Default implementation throws.
 * Subclasses must override it. Used in renderDraw_.
 * @param {!edY.Block} block.
 * @private
 */
edY.DelegateSvg.prototype.shapePathDef_ = function (block) {
  goog.asserts.assert(false, 'shapePathDef_ must be overriden by ' + this)
}

/**
 * Block outline. Default implementation forwards to shapePathDef_.
 * @param {!edY.Block} block.
 * @private
 */
edY.DelegateSvg.prototype.contourPathDef_ = edY.DelegateSvg.prototype.shapePathDef_

/**
 * Highlighted block outline. Default implementation forwards to shapePathDef_.
 * @param {!edY.Block} block.
 * @private
 */
edY.DelegateSvg.prototype.highlightPathDef_ = edY.DelegateSvg.prototype.shapePathDef_

/**
 * Highlighted connection outline.
 * When a block is selected and one of its connection is also selected
 * the ui displays a bold line on the connection. When the block has wrapped input,
 * the selected connection may belong to a wrapped block.
 * @param {!edY.Block} block.
 * @private
 */
edY.DelegateSvg.prototype.connectionPathDef_ = function (block) {
  return this.selectedConnection?
    this.highlightConnectionPathDef(block, this.selectedConnection):
    ''
}

/**
 * Extra disabled block outline. Default implementation return a void string.
 * @param {!edY.Block} block.
 * @private
 */
edY.DelegateSvg.prototype.collapsedPathDef_ = function () {
  return ''
}

/**
 * Draw the path of the block.
 * @param {!edY.Block} block.
 * @private
 */
edY.DelegateSvg.prototype.renderDraw_ = function (block) {
  if (this.svgPathInline_) {
    // if the above path does not exist
    // the block is not yet ready for rendering
    block.height = edY.Font.lineHeight()
    var d = this.renderDrawModel_(block)
    this.svgPathInline_.setAttribute('d', d)
    var root = block.getRootBlock()
    if (root.edy) {
      root.edy.alignRightEdges_(root)
    }
    this.updateAllPaths_(block)
  }
}

/**
 * Align the right edges by changing the size of all the connected statement blocks.
 * The default implementation does nothing.
 * @param {!edY.Block} block.
 * @protected
 */
edY.DelegateSvg.prototype.alignRightEdges_ = function (block) {
  var right = 0
  var ntor = edY.StatementBlockEnumerator(block)
  var b
  var t = edY.Font.tabWidth
  while ((b = ntor.next())) {
    if (b.edy) {
      if (b.edy.minWidth) {
        right = Math.max(right, b.edy.minWidth + t * ntor.depth())
      } else {
        return
      }
    }
  }
  ntor = edY.StatementBlockEnumerator(block)
  while ((b = ntor.next())) {
    if (b.edy) {
      var width = right - t * ntor.depth()
      if (b.width !== width) {
        b.width = width
        b.edy.updateAllPaths_(b)
      }
    }
  }
}

/**
 * Compute the paths of the block depending on its size.
 * @param {!edY.Block} block.
 * @private
 */
edY.DelegateSvg.prototype.updatePath_ = function (block, path, def) {
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
 * @param {!edY.Block} block.
 * @private
 */
edY.DelegateSvg.prototype.updateAllPaths_ = function (block) {
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
edY.DelegateSvg.prototype.getPaddingLeft = function (block) {
  if (this.wrapped_) {
    return 0
  } else if (block.outputConnection) {
    return this.locked_ && block.getSurroundParent()? 0: edY.Font.space
  } else {
    return edY.Padding.l()
  }  
}

/**
 * The right padding of a block.
 * @param {!Blockly.Block} block.
 * @private
 */
edY.DelegateSvg.prototype.getPaddingRight = function (block) {
  if (this.wrapped_) {
    return 0
  } else if (block.outputConnection) {
    return this.locked_ && block.getSurroundParent()? 0: edY.Font.space
  } else {
    return edY.Padding.r()
  }  
}

/**
 * Render the inputs of the block.
 * @param {!Blockly.Block} block.
 * @protected
 */
edY.DelegateSvg.prototype.minBlockWidth = function (block) {
  return 0
}

/**
 * Render the inputs, the fields and the tiles of the block.
 * @param {!Blockly.Block} block.
 * @private
 */
edY.DelegateSvg.prototype.renderDrawModel_ = function (block) {
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
    io.f = 0
    do {
      this.renderDrawField_(io)
      ++ io.f
    } while((io.field = io.field.edy.nextField))
  }
  if ((io.tile = this.ui.headTile)) {
    do {
      this.renderDrawTile_(io)
    } while ((io.tile = io.tile.nextTile))
  } else {
    for (; (io.input = block.inputList[io.i]); io.i++) {
      goog.asserts.assert(io.input.edy, 'Input with no edy '+io.input.name+' in block '+block.type)
      io.inputDisabled = io.input.edy.disabled_
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
  if ((io.input = this.inputSuite)) {
    this.renderDrawInput_(io)
  }
  if ((io.field = this.ui.toEndField)) {
    do {
      this.renderDrawField_(io)
      io.f
    } while((io.field = io.field.edy.nextField))
  }
  // enlarge the width if necessary
  io.cursorX = Math.max(io.cursorX, this.minBlockWidth())
  io.cursorX += this.getPaddingRight(block)
  this.minWidth = block.width = Math.max(block.width, io.cursorX)
  this.shouldSeparateField = io.shouldSeparateField
  return io.steps.join(' ')
}

console.warn('List consolidators for yield expression use 2 differnet inputs with "O" name')
/**
 * Render the the tile in `io.tile`.
 * @param io.
 * @private
 */
edY.DelegateSvg.prototype.renderDrawTile_ = function (io) {
  var root = io.tile.getSvgRoot()
  goog.asserts.assert(root, 'Tile with no root')
  if (io.tile.isIncog()) {
    root.setAttribute('display', 'none')
  } else if (root) {
    root.removeAttribute('display')
    root.setAttribute('transform',
    'translate(' + io.cursorX + ', 0)')
    io.offsetX = io.cursorX
    io.cursorX = 0
    if ((io.field = io.tile.fromStartField)) {
      do {
        this.renderDrawField_(io)
      } while((io.field = io.field.edy.nextField))
    }
    if ((io.input = io.tile.input)) {
      this.renderDrawInput_(io)
    }
    if ((io.field = io.tile.toEndField)) {
      do {
        this.renderDrawField_(io)
      } while((io.field = io.field.edy.nextField))
    }
    io.cursorX += io.offsetX
    io.offsetX = 0
  } else if ((io.input = io.tile.input)) {
    this.renderDrawInput_(io)
  }
}

/**
 * Render the leading # character for collapsed statement blocks.
 * Statement subclasses must override it.
 * @param io.
 * @private
 */
edY.DelegateSvg.prototype.renderDrawSharp_ = function (io) {
  goog.asserts.assert(false, 'renderDrawSharp_ must be overriden by ' + io.block.type)
}

/**
 * Render one input. Default implementation throws.
 * Subclasses must override it.
 * @param io.
 * @private
 */
edY.DelegateSvg.prototype.renderDrawInput_ = function (io) {
  goog.asserts.assert(false, 'renderDrawInput_ must be overriden by ' + this)
}

/**
 * Render the field at io.field, which must be defined.
 * 
 * @param io An input/output record.
 * @private
 */
edY.DelegateSvg.prototype.renderDrawField_ = function (io) {
  var root = io.field.getSvgRoot()
  if (root) {
    if (!io.field.isVisible()) {
      root.setAttribute('display', 'none')
    } else {
      root.removeAttribute('display')
      var text = io.field.getDisplayText_()
      var edy = io.field.edy
      if (text.length) {
        // if the text is void, it can not change whether
        // the last character was a letter or not
        if (io.shouldSeparateField && !io.starSymbol && (edY.XRE.operator.test(text[0]) || text[0] === '.' || edY.XRE.id_continue.test(text[0]) || edy.isEditing)) {
          // add a separation
          io.cursorX += edY.Font.space
        }
        io.shouldSeparateField = edY.XRE.id_continue.test(text[text.length-1]) || edY.XRE.operator.test(text[text.length-1]) || text[text.length-1] === ':' || (text[text.length-1] === '.' && !io.field instanceof edY.FieldTextInput)
        io.starSymbol = (io.f === 0 && (['*','@', '+', '-', '~'].indexOf(text[text.length-1])>=0))
      }
      var x_shift = edy && !io.block.edy.wrapped_? edy.x_shift || 0: 0
      root.setAttribute('transform', 'translate(' + (io.cursorX + x_shift) +
        ', ' + edY.Padding.t() + ')')
      var size = io.field.getSize()
      io.cursorX += size.width
      if (edy.isEditing) {
        io.cursorX += edY.Font.space
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
edY.DelegateSvg.prototype.renderDrawFields_ = function (io, only_prefix) {
  var here = io.cursorX
  io.f = 0
  for (; (io.field = io.input.fieldRow[io.f]); ++io.f) {
    if (!!only_prefix === !io.field.edy.suffix) {
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
edY.DelegateSvg.prototype.renderDrawDummyInput_ = function (io) {
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
edY.DelegateSvg.prototype.renderDrawValueInput_ = function (io) {
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
        root.setAttribute('transform', 'translate(' + (io.cursorX + io.offsetX) + ', 0)')
        if (!target.edy.skipRendering) {
          target.edy.shouldSeparateField = (target.edy.wrapped_ ||target.edy.locked_) && io.shouldSeparateField
        }
        target.render()
        io.shouldSeparateField = (target.edy.wrapped_ ||target.edy.locked_) && target.edy.shouldSeparateField
        var bBox = target.getHeightWidth()
        io.cursorX += bBox.width
      }
    } else if (!this.locked_ && !c8n.hidden_) {
      // locked blocks won't display any placeholder
      // (input with no target)
      var edy = c8n.edy
      var pw = edy.s7r_ || edy.optional_?
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
edY.DelegateSvg.prototype.valuePathDef_ = function (size) {
  /* eslint-disable indent */
  // Top edge.
  var p = edY.Padding.h()
  var r = (p ** 2 + size.height ** 2 / 4) / 2 / p
  var dx = (edY.Font.space - p) / 2
  var a = ' a ' + r + ', ' + r + ' 0 0 1 0,'
  var h = size.height + 2 * edY.Margin.V
  return 'm ' + (size.width - edY.Font.space + dx) + ',-' + edY.Margin.V + a +
  h + 'H ' + (dx + p) + a + (-h) + ' z'
} /* eslint-enable indent */

/**
 * Block path.
 * @param {goog.size} size.
 * @private
 */
edY.DelegateSvg.prototype.outPathDef_ = function () {
  /* eslint-disable indent */
  // Top edge.
  var p = edY.Padding.h()
  var r = (p ** 2 + edY.Font.lineHeight() ** 2 / 4) / 2 / p
  var dx = (edY.Font.space - p) / 2
  var a = ' a ' + r + ', ' + r + ' 0 0 1 0,'
  var h = edY.Font.lineHeight() + 2 * edY.Margin.V
  return 'm ' + (dx + p) + ',' + (h - edY.Margin.V) + a + (-h)
} /* eslint-enable indent */

/**
 * Block path.
 * @param {Number} height.
 * @param {Number} x position.
 * @private
 */
edY.DelegateSvg.prototype.carretPathDefWidth_ = function (cursorX) {
  /* eslint-disable indent */
  var size = {width:edY.Font.space, height: edY.Font.lineHeight()}
  var p = edY.Padding.h()
  var r = (p ** 2 + size.height ** 2 / 4) / 2 / p
  var dy = edY.Padding.v() + edY.Font.descent / 2
  var a = ' a ' + r + ', ' + r + ' 0 0 1 0,'
  var h = size.height + 2 * edY.Margin.V
  var d = 'M ' + (cursorX + size.width/2) +
  ',' + (edY.Margin.V + dy) + a + (h - 2 * dy) + a + (-h + 2 * dy) + ' z'
  return {width: size.width, d: d}
} /* eslint-enable indent */

/**
 * Block path.
 * @param {Number} height.
 * @param {Number} x position.
 * @private
 */
edY.DelegateSvg.prototype.placeHolderPathDefWidth_ = function (cursorX) {
  /* eslint-disable indent */
  var size = {width: 3 * edY.Font.space, height: edY.Font.lineHeight()}
  var p = edY.Padding.h()
  var r = (p ** 2 + size.height ** 2 / 4) / 2 / p
  var dy = edY.Padding.v() + edY.Font.descent / 2
  var a = ' a ' + r + ', ' + r + ' 0 0 1 0,'
  var h = size.height + 2 * edY.Margin.V
  var d = 'M ' + (cursorX + size.width - p) +
  ',' + (edY.Margin.V + dy) + a + (h - 2 * dy) +
  'h -' + (size.width - 2 * p) + a + (-h + 2 * dy) + ' z'
  return {width: size.width, d: d}
} /* eslint-enable indent */

/**
 * @param {!Blockly.Block} block The owner of the delegate.
 * @param {!Blockly.Connection} c8n The connection to highlight.
 */
edY.DelegateSvg.prototype.highlightConnectionPathDef = function (block, c8n) {
  var steps = ''
  var block = c8n.sourceBlock_
  if (c8n.type === Blockly.INPUT_VALUE) {
    if (c8n.isConnected()) {
      steps = this.valuePathDef_(c8n.targetBlock())
    } else if (c8n.edy.s7r_ || c8n.edy.optional_) {
      steps = this.carretPathDefWidth_(c8n.offsetInBlock_.x).d
    } else {
      steps = this.placeHolderPathDefWidth_(c8n.offsetInBlock_.x).d
    }
  } else if (c8n.type === Blockly.OUTPUT_VALUE) {
    steps = this.valuePathDef_(block)
  } else {
    var r = edY.Style.Path.Selected.width / 2
    var a = ' a ' + r + ',' + r + ' 0 0 1 0,'
    if (c8n === block.previousConnection) {
      steps = 'm ' + block.width + ',' + (-r) + a + (2 * r) + ' h ' + (-block.width) + a + (-2 * r) + ' z'
    } else if (c8n === block.nextConnection) {
      if (block.height > edY.Font.lineHeight()) { // this is not clean design
        steps = 'm ' + (edY.Font.tabWidth+edY.Style.Path.radius()) + ',' + (block.height-r) + a + (2 * r) + ' h ' + (-edY.Font.tabWidth-edY.Style.Path.radius()) + a + (-2 * r) + ' z'
      } else {
        steps = 'm ' + block.width + ',' + (block.height-r) + a + (2 * r) + ' h ' + (-block.width) + a + (-2 * r) + ' z'        
      }
    } else {
      steps = 'm ' + (block.width) + ',' + (-r+edY.Font.lineHeight()) + a + (2 * r) + ' h ' + (edY.Font.tabWidth-block.width) + a + (-2 * r) + ' z'
    }
  }
  return steps
}

/**
 * @param {!Blockly.Connection} c8n The connection to highlight.
 */
edY.DelegateSvg.prototype.highlightConnection = function (block, c8n) {
  var steps
  if (c8n.type === Blockly.INPUT_VALUE) {
    if (c8n.isConnected()) {
      steps = this.valuePathDef_(c8n.targetBlock())
    } else if (c8n.edy.s7r_ || c8n.edy.optional_) {
      steps = this.carretPathDefWidth_(0).d
    } else {
      steps = this.placeHolderPathDefWidth_(0).d
    }
  } else if (c8n.type === Blockly.OUTPUT_VALUE) {
    steps = this.valuePathDef_(block)
  } else {
    var r = edY.Style.Path.Selected.width / 2
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
edY.DelegateSvg.prototype.getInput = function (block, name) {
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
edY.StatementBlockEnumerator = function (block) {
  var b
  var bs = [block]
  var e8r
  var e8rs = [block.edy.inputEnumerator(block)]
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
            e8rs.unshift(next.edy.inputEnumerator(next))
            return next
          }
        }
      }
      if ((b = b.getNextBlock())) {
        bs.unshift(b)
        e8rs.unshift(b.edy.inputEnumerator(b))
        return b
      }
    }
    return undefined
  }
  return me
}

edY.DelegateSvg.prototype.nextStatementCheck = undefined
edY.DelegateSvg.prototype.previousStatementCheck = undefined

/**
 * The default implementation does nothing.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 * @private
 */
edY.DelegateSvg.prototype.makeBlockWrapped = function (block) {
  edY.DelegateSvg.superClass_.makeBlockWrapped.call(this, block)
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
edY.DelegateSvg.prototype.makeBlockUnwrapped = function (block) {
  edY.DelegateSvg.superClass_.makeBlockUnwrapped.call(this, block)
  this.svgPathContour_ = Blockly.utils.createSvgElement('path', {'class': 'edy-path-contour'}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathContour_, 0)
  this.svgPathShape_ = Blockly.utils.createSvgElement('path', {'class': 'edy-path-shape'}, null)
  goog.dom.insertChildAt(block.svgGroup_, this.svgPathShape_, 0)
}

/**
 * Whether the block is selected.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 * @private
 */
edY.DelegateSvg.prototype.hasSelect = function (block) {
  return goog.dom.classlist.contains(block.svgGroup_, 'edy-select')
}

/**
 * Set the enable/disable status of the given block.
 * @param {!Block} block.
 * @private
 */
edY.DelegateSvg.prototype.delayedRender = function (block) {
  if (!goog.isDef(this.delayedRender)) {
    this.delayedRender = setTimeout(function(){
      delete block.edy.delayedRender
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
edY.DelegateSvg.newBlockComplete = function (workspace, prototypeName, id, initSvg) {
  var B = workspace.newBlock(prototypeName, goog.isString(id) && id)
  B.edy.completeWrapped_(B)
  if (goog.isBoolean(id) && id || initSvg) {
    B.initSvg()
  }
  return B
}

/**
 * When setup is finish.
 * @param {!Block} block.
 */
edY.DelegateSvg.prototype.beReady = function (block) {
  block.initSvg()
  var data = this.data
  for (var k in data) {
    data[k].beReady()
  }
  // install all the fields and tiles in the DOM
  for (var k in this.ui.fields) {
    var field = this.ui.fields[k]
    field.setSourceBlock(block)
    field.init()
    field.edy.ui = this.ui
  }
  var tile = this.ui.headTile
  while (tile) {
    tile.beReady()
    tile = tile.nextTile
  }
  this.inputSuite && this.inputSuite.edy.beReady()
  this.nextConnection && this.nextConnection.edy.beReady()
  this.consolidate(block)
  this.synchronizeData(block)
  this.synchronizeTiles(block)
  this.skipRendering = 0
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
edY.DelegateSvg.prototype.prepareForWorkspace = function (block, workspace, x, y, variant) {
  
}

/**
 * Returns the python type of the block.
 * This information may be displayed as the last item in the contextual menu.
 * Wrapped blocks will return the parent's answer.
 * @param {!Blockly.Block} block The block.
 */
edY.DelegateSvg.prototype.getPythonType = function (block) {
  if (this.wrapped_) {
    var parent = block.getParent()
    return parent.edy.getPythonType(parent)
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
edY.DelegateSvg.prototype.canInsertParent = function(block, prototypeName, subtype, surroundInputName) {
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
edY.DelegateSvg.prototype.insertParent = function(block, surroundPrototypeName, subtype, surroundInputName) {
  goog.asserts.assert(false, 'Must be subclassed')
}

/**
 * Get the hole filler data object for the given check.
 * @param {!Array} check an array of types.
 * @param {objet} value value of the block that will fill the hole, a string for an identifier block.
 * @private
 */
edY.HoleFiller.getData = function(check, value) {
  var data
  if (goog.isFunction(value)) {
    data = {
      filler: value,
    }
  } else if (check.indexOf(edY.T3.Expr.identifier) >= 0) {
    if (value) {
      data = {
        type: edY.T3.Expr.term,
        value: value,
      }
    }
  } else if(check.length === 1 && edY.T3.All.core_expressions.indexOf(check[0])>=0) {
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
edY.HoleFiller.getDeepHoles = function(block, holes) {
  var H = holes || []
  var getDeepHoles = function (c8n) {
    if (c8n && c8n.type === Blockly.INPUT_VALUE && (!c8n.edy.disabled_ || c8n.edy.wrapped_)) {
      var target = c8n.targetBlock()
      if (target) {
        edY.HoleFiller.getDeepHoles(target, H)
      } else if (c8n.edy.hole_data) {
        H.push(c8n)
      }
    }
  }
  if (block.getSourceBlock) {
    getDeepHoles(block) 
  } else {
    var e8r = block.edy.inputEnumerator(block)
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
edY.HoleFiller.fillDeepHoles = function(workspace, holes) {
  var i = 0
  for (; i < holes.length; ++i) {
    var c8n = holes[i]
    if (c8n && c8n.type === Blockly.INPUT_VALUE && !c8n.isConnected()) {
      var data = c8n.edy.hole_data
      if (data) {
        try {
          if (data.filler) {
            var B = data.filler(workspace)
          } else {
            B = edY.DelegateSvg.newBlockComplete(workspace, data.type, true)
            if (data.value) {
              B.edy.data.phantom && B.edy.data.phantom.set(data.value) ||
              B.edy.data.value && B.edy.data.value.set(data.value)
            }
            B.edy.beReady(B)
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
edY.DelegateSvg.prototype.useWrapType = function (block, key, newType) {
  var input = block.getInput(key)
  var returnState = false
  if (input) {
    var target = input.connection.targetBlock()
    var oldType = target? target.type: undefined
    if (newType != oldType) {
      Blockly.Events.setGroup(true)
      try {
        if (target) {
          target.unplug()
          target.dispose()
        }
        this.completeWrappedInput_(block, input, newType)
        returnState = true
      } finally {
        Blockly.Events.setGroup(false)        
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
edY.DelegateSvg.prototype.getGlobalBoundingRect = function(block) {
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
edY.DelegateSvg.prototype.getBoundingRect = function(block) {
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
edY.DelegateSvg.prototype.getBoundingBox = function(block) {
  return this.getBoundingRect(block).toBox()
}

/**
 * Get the closest box, according to the filter.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {function} distance is a function.
 * @return None
 */
edY.DelegateSvg.getBestBlock = function (workspace, weight) {
  var smallest = Infinity, best
  for (var i = 0, top; (top = workspace.topBlocks_[i++]);) {
    var box = top.edy.getBoundingRect(top)
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
 * @param {function} distance is a function.
 * @return None
 */
edY.DelegateSvg.prototype.getBestBlock = function (block, distance) {
  const a = this.getBoundingBox(block)
  var smallest = {}, best
  for (var i = 0, top; (top = block.workspace.topBlocks_[i++]);) {
    if (top === block) {
      continue
    }
    var b = top.edy.getBoundingBox(top)
    var target = top
    var c8n
    while ((c8n = target.nextConnection) && (target = c8n.targetBlock())) {
      b.expandToInclude(target.edy.getBoundingBox(target))
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
edY.DelegateSvg.prototype.selectBlockLeft = function (block) {
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    target.edy.selectBlockLeft(target)
    return
  }
  var doLast = function(B) {
    var e8r = B.edy.inputEnumerator(B)
    e8r.end()
    while (e8r.previous()) {
      var c8n = e8r.here.connection
      if (c8n && (!c8n.hidden_ || c8n.edy.wrapped_) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
        var target = c8n.targetBlock()
        if (!target || (!target.edy.wrapped_ && !target.edy.locked_) || (c8n = doLast(target))) {
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
    if (!target.edy.wrapped_ && !target.edy.locked_) {
      edY.SelectedConnection.set(null)
      target.select()
      return true
    }
    if ((c8n = doLast(target))) {
      if ((target = c8n.targetBlock())) {
        edY.SelectedConnection.set(null)
        target.select()
      } else {
        edY.SelectedConnection.set(c8n)
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
    while (parent.edy.wrapped_ || parent.edy.locked_) {
      if (!(parent = parent.getSurroundParent())) {
        return false
      }
    }
    edY.SelectedConnection.set(c8n)
    return true
  }
  if ((c8n = this.selectedConnection)) {
    if (c8n === block.nextStatement) {
    } else if (c8n.type !== Blockly.NEXT_STATEMENT) {
      // select the previous non statement input if any
      var e8r = block.edy.inputEnumerator(block)
      while (e8r.next()) {
        if (e8r.here.connection && c8n === e8r.here.connection) {
          // found it, step down
          e8r.previous()
          while (e8r.previous()) {
            if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.edy.wrapped_) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
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
            if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.edy.wrapped_) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
              if (selectConnection(block)) {
                return true
              }
            }
          }
          break
        }
      }
    } else if (!block.edy.wrapped_ && !block.edy.locked_) {
      edY.SelectedConnection.set(null)
      block.select()
      return true
    }
  }
  if ((parent = block.getSurroundParent())) {
    // select the previous non statement input if any
    var e8r = parent.edy.inputEnumerator(parent)
    while (e8r.next()) {
      if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.edy.wrapped_) && block === c8n.targetBlock()) {
        // found it, step down
        e8r.previous()
        while (e8r.previous()) {
          if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.edy.wrapped_) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
            if (selectConnection(c8n)) {
              return true
            }
          }
        }
        break
      }
    }
    do {
      if (!parent.edy.wrapped_ && !parent.edy.locked_) {
        edY.SelectedConnection.set(null)
        parent.select()
        return true
      }
    } while ((parent = parent.getSurroundParent()))
  }
  target = block
  do {
    parent = target
  } while ((target = parent.getSurroundParent()))
  target = parent.edy.getBestBlock(parent, function(a, b) {
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
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return yorn
 */
edY.DelegateSvg.prototype.selectBlockRight = function (block) {
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    return target.edy.selectBlockRight(target)
  }
  var parent, input, c8n
  var selectTarget = function() {
    if (target = c8n.targetBlock()) {
      if (target.edy.wrapped_ || target.edy.locked_) {
        return target.edy.selectBlockRight(target)
      } else {
        edY.SelectedConnection.set(null)
        target.select()
        return true
      }
    }
    return false
  }
  var selectConnection = function() {
    if (c8n.hidden_ && !c8n.edy.wrapped_) {
      return false
    }
    if (!selectTarget()) {
      parent = block
      while (parent.edy.wrapped_ || parent.edy.locked_) {
        if (!(parent = parent.getSurroundParent())) {
          return false
        }
      }
      edY.SelectedConnection.set(c8n)
    }
    return true
  }
  if ((c8n = this.selectedConnection)) {
    if (c8n.type === Blockly.NEXT_STATEMENT) {
      if (c8n === block.nextConnection) {
        // select the target block (if any) when the nextConnection is in horizontal mode
        if (c8n.edy.isAtRight) {
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
      var e8r = block.edy.inputEnumerator(block)
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
    var e8r = block.edy.inputEnumerator(block)
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
      var e8r = parent.edy.inputEnumerator(parent)
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
      var e8r = parent.edy.inputEnumerator(parent)
      while (e8r.next()) {
        if ((c8n = e8r.here.connection) && (c8n.type === Blockly.NEXT_STATEMENT) && (target = c8n.targetBlock()) && (target !== block)) {
          edY.SelectedConnection.set(null)
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
  target = parent.edy.getBestBlock(parent, function(a, b) {
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
    edY.SelectedConnection.set(null)
    target.select()
    return true
  }
}

/**
 * Select the block above the owner.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
edY.DelegateSvg.prototype.selectBlockAbove = function (block) {
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    target.edy.selectBlockAbove(target)
    return
  }
  var c8n
  if ((c8n = this.selectedConnection)) {
    if (c8n === block.previousConnection) {
      if ((target = c8n.targetBlock())) {
        edY.SelectedConnection.set(null)
        target.select()
        return
      }
    } else {
      edY.SelectedConnection.set(null)
      block.select()
      return
    }
  } else if ((c8n = block.previousConnection)) {
    block.select()
    edY.SelectedConnection.set(block.previousConnection)
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
  target = parent.edy.getBestBlock(parent, function(a, b) {
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
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
edY.DelegateSvg.prototype.selectBlockBelow = function (block) {
  var target = this.selectedConnectionSource_
  if (target && target !== block) {
    target.edy.selectBlockBelow(target)
    return
  }
  var parent, c8n
  if ((c8n = this.selectedConnection)) {
    if (c8n === block.previousConnection) {
      edY.SelectedConnection.set(null)
      block.select()
      return
    } else if (c8n === block.nextConnection) {
      if ((target = c8n.targetBlock())) {
        edY.SelectedConnection.set(null)
        target.select()
        return
      }
    } else if (block.nextConnection) {
      block.select()
      edY.SelectedConnection.set(block.nextConnection)
      return
    }
  } else if (block.nextConnection) {
    block.select()
    edY.SelectedConnection.set(block.nextConnection)
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

  target = parent.edy.getBestBlock(parent, function(a, b) {
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
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {Object} e in general a mouse down event
 * @return None
 */
edY.DelegateSvg.prototype.getConnectionForEvent = function (block, e) {
  var where = new goog.math.Coordinate(e.clientX, e.clientY)
  where = goog.math.Coordinate.difference(where, block.workspace.getOriginOffsetInPixels())
  where.scale(1/block.workspace.scale)
  var rect = this.getBoundingRect(block)
  where = goog.math.Coordinate.difference(where, rect.getTopLeft())
  var e8r = block.edy.inputEnumerator(block)
  while (e8r.next()) {
    var c8n = e8r.here.connection
    if (c8n && (!c8n.hidden_ || c8n.edy.wrapped_)) {
      if (c8n.type === Blockly.INPUT_VALUE) {
        var target = c8n.targetBlock()
        if (target) {
          if ((c8n = target.edy.getConnectionForEvent(target, e))) {
            return c8n
          }
        } else {
          var R = new goog.math.Rect(
            c8n.offsetInBlock_.x - edY.Font.space/2,
            c8n.offsetInBlock_.y + edY.Font.space/2,
            c8n.edy.optional_ || c8n.edy.s7r_? 2*edY.Font.space: 4*edY.Font.space,
            edY.Font.lineHeight() - edY.Font.space,        
          )
          if (R.contains(where)) {
            return c8n
          }
        }
      } else if (c8n.type === Blockly.NEXT_STATEMENT) {
        var R = new goog.math.Rect(
          c8n.offsetInBlock_.x,
          c8n.offsetInBlock_.y - edY.Font.space/2,
          edY.Font.tabWidth,
          edY.Font.space,        
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
      edY.Font.space/2,        
    )
    if (R.contains(where)) {
      return c8n
    }  
  }
  if ((c8n = block.nextConnection) && !c8n.hidden) {
    if (rect.height > edY.Font.lineHeight()) {// Not the cleanest design
      var R = new goog.math.Rect(
        c8n.offsetInBlock_.x,
        c8n.offsetInBlock_.y - edY.Font.space/2,
        edY.Font.tabWidth + edY.Style.Path.radius(),// R U sure?
        edY.Font.space/2,        
      )  
    } else {
      var R = new goog.math.Rect(
        c8n.offsetInBlock_.x,
        c8n.offsetInBlock_.y - edY.Font.space/2,
        rect.width,
        edY.Font.space/2,        
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
edY.SelectedConnection = function() {
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
          if (block.edy.locked_) {
            return
          }
          if (connection === block.previousConnection && connection.targetConnection) {
            connection = connection.targetConnection
            var unwrapped = block = connection.getSourceBlock()
            do {
              if (!unwrapped.edy.wrapped_) {
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
            oldBlock.edy.selectedConnection = null
            oldBlock.edy.selectedConnectionSource_ = null
            oldBlock.removeSelect()
            if (oldBlock === Blockly.selected) {
              oldBlock.edy.updateAllPaths_(oldBlock)
              oldBlock.addSelect()
            } else if ((B = Blockly.selected)) {
              B.edy.selectedConnectionSource_ = null
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
            while (unwrapped.edy.wrapped_) {
              if (!(unwrapped = unwrapped.getSurroundParent())) {
                return
              }
            }
            block.edy.selectedConnection = c8n_ = connection
            unwrapped.edy.selectedConnectionSource_ = block
            unwrapped.select()
            block.removeSelect()
            block.edy.updateAllPaths_(block)
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
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {Object} action the prototype of the block to insert, or an object containning this prototype.
 * @param {string} subtype the subtype of the block to insert.
 * @return the block that was inserted
 */
edY.DelegateSvg.prototype.insertBlockOfType = function (block, action, subtype) {
  if (!action) {
    return null
  }
  // get the type:
  var prototypeName = action.type || action
  // create a block out of the undo mechanism
  Blockly.Events.disable()
  try {
    var candidate = edY.DelegateSvg.newBlockComplete(block.workspace, prototypeName, true)
    if (!candidate) {
      disabler.stop()
      return
    }
    var c8n_N = action.subtype || subtype
    if (candidate.edy.data.subtype.set(c8n_N)) {
      c8n_N = undefined
    }
    var c8n, otherC8n, foundC8n
    var fin = function(prepare) {
      disabler.stop()
      Blockly.Events.setGroup(true)
      try {
        if (Blockly.Events.isEnabled()) {
          Blockly.Events.fire(new Blockly.Events.BlockCreate(candidate))
        }
        candidate.render()
        prepare && prepare()
        otherC8n.connect(c8n)
        candidate.edy.beReady(candidate)
        candidate.select()
        candidate.bumpNeighbours_()
      } finally {
        Blockly.Events.setGroup(false)
      }
      return candidate
    }
    if ((otherC8n = edY.SelectedConnection.get())) {
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
        var e8r = block.edy.inputEnumerator(block)
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
            if (!foundC8n.edy.s7r_ && (!c8n_N || foundC8n.edy.name_ === c8n_N)) {
              // we have found a connection
              // which s not a separator and
              // with the expected name
              return foundC8n
            }
            // if there is no connection with the expected name,
            // then remember this connection and continue the loop
            // We remember the last separator connection
            // of the first which is not a separator
            if (!otherC8n || otherC8n.edy.s7r_) {
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
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return boolean
 */
edY.DelegateSvg.prototype.canLock = function (block) {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var e8r = block.edy.inputEnumerator(block), c8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((target = c8n.targetBlock())) {
        if (!target.edy.canLock(target)) {
          return false
        }
      } else if (!c8n.edy.optional_ && !c8n.edy.s7r_) {
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
 * @return boolean, true only if there is something to unlock
 */
edY.DelegateSvg.prototype.canUnlock = function (block) {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var e8r = block.edy.inputEnumerator(block), c8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((target = c8n.targetBlock())) {
        if (target.edy.canUnlock(target)) {
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
 * @return the number of block locked
 */
edY.DelegateSvg.prototype.lock = function (block) {
  var ans = 0
  if (this.locked_ || !block.edy.canLock(block)) {
    return ans
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
    block, edY.Const.Event.locked, null, this.locked_, true))
  }
  this.locked_ = true
  if (block === edY.SelectedConnection.set)
  edY.SelectedConnection.set(null)
  // list all the input for connections with a target
  var c8n
  if ((c8n = edY.SelectedConnection.get()) && (block === c8n.getSourceBlock())) {
    edY.SelectedConnection.set(null)
  }
  var e8r = block.edy.inputEnumerator(block), otherC8n, foundC8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((target = c8n.targetBlock())) {
        ans += target.edy.lock(target)
      }
      if (c8n.type === Blockly.INPUT_VALUE) {
        c8n.setHidden(true)
      }
    }
  }
  if ((c8n = block.nextConnection)) {
    if ((target = c8n.targetBlock())) {
      ans += target.edy.lock(target)
    }
  }
  if (block === Blockly.selected) {
    var parent = block
    while ((parent = parent.getSurroundParent())) {
      if (!parent.edy.wrapped_ && ! parent.edy.locked_) {
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
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {boolean} deep Whether to unlock statements too.
 * @return the number of block locked
 */
edY.DelegateSvg.prototype.unlock = function (block, shallow) {
  var ans = 0
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
    block, edY.Const.Event.locked, null, this.locked_, false))
  }
  this.locked_ = false
  // list all the input for connections with a target
  var e8r = block.edy.inputEnumerator(block), c8n, target
  while (e8r.next()) {
    if ((c8n = e8r.here.connection)) {
      if ((!shallow || c8n.type === Blockly.INPUT_VALUE) && (target = c8n.targetBlock())) {
        ans += target.edy.unlock(target, shallow)
      }
      c8n.setHidden(false)
    }
  }
  if (!shallow && (c8n = block.nextConnection)) {
    if ((target = c8n.targetBlock())) {
      ans += target.edy.unlock(target)
    }
  }
  (block.getSurroundParent()||block).render()
  return ans
}

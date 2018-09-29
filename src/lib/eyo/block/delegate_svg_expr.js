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

goog.provide('eYo.DelegateSvg.Expr')

goog.require('eYo.Msg')
goog.require('eYo.Decorate')
goog.require('eYo.DelegateSvg')
goog.require('eYo.T3.All')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, value block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.makeSubclass('Expr', {
  data: {
    modifier: {
      order: 99,
      all: ['', '*', '**'],
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.setIncog(!newValue || !newValue.length)
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Expr.star) {
          this.set('*')
        } else if (type === eYo.T3.Expr.target_star) {
          this.set('*')
        } else if (type === eYo.T3.Expr.parameter_star) {
          this.set('*')
        } else if (type === eYo.T3.Expr.star_expr) {
          this.set('*')
        } else if (type === eYo.T3.Expr.parameter_star_star) {
          this.set('**')
        } else if (type === eYo.T3.Expr.expression_star_star) {
          this.set('**')
        } else if (type === eYo.T3.Expr.or_expr_star_star) {
          this.set('**')
        }
        // this.set()
      },
      synchronize: true
    }
  },
  fields: {
    modifier: {
      value: '',
      css: 'reserved'
    }
  }
})

// Default delegate for all expression blocks
eYo.Delegate.Manager.registerAll(eYo.T3.Expr, eYo.DelegateSvg.Expr, true)


/**
 * Increment the change count.
 * For expressions, the change count is also forwarded to the parent.
 * For edython.
 */
eYo.DelegateSvg.Expr.prototype.incrementChangeCount = function () {
  eYo.DelegateSvg.Expr.superClass_.incrementChangeCount.call(this)
  var parent = this.block_.parentBlock_
  parent && parent.eyo.incrementChangeCount()
}

/**
 * getType.
 * The default implementation just returns the raw type.
 * Subclassers will override getModifier and getBaseType.
 * This should be used instead of direct block querying.
 * @return {String} The type of the receiver's block.
 */
eYo.DelegateSvg.Expr.prototype.getType = eYo.Decorate.onChangeCount(
  'getType',
  function () {
    var t = this.getBaseType()
    var modifier = this.data.modifier.get()
    if (!modifier) {
      return {
        return: t
      }
    }
    var types = []
    if (modifier === '**') {
      if (eYo.T3.Expr.Check.parameter.indexOf(t)) {
        types.push(eYo.T3.Expr.parameter_star_star)
      }
      if (eYo.T3.Expr.Check.or_expr_all.indexOf(t)) {
        types.push(eYo.T3.Expr.or_expr_star_star)
      }
      types.push(eYo.T3.Expr.expression_star_star)
    } else if (modifier === '*') {
      if (t === eYo.T3.Expr.identifier && this.getBaseType() === eYo.T3.Expr.unset) {
        types.push(eYo.T3.Expr.star)
      }
      if (eYo.T3.Expr.Check.target.indexOf(t)) {
        types.push(eYo.T3.Expr.target_start)
      }
      if (eYo.T3.Expr.Check.parameter.indexOf(t)) {
        types.push(eYo.T3.Expr.parameter_star)
      }
      if (eYo.T3.Expr.Check.or_expr_all.indexOf(t)) {
        types.push(eYo.T3.Expr.star_expr)
      }
      types.push(eYo.T3.Expr.expression_star)
    } else {
      return {
        return: t
      }
    }
    this.types = types
    return {
      return: types[0]
    }
  }
)

/**
 * Whether the receiver's block is of the given type.
 * Blocks may have different types (eg identifier and dotted_name).
 * This is recorded in the output connection.
 * @param {!String} type
 * @return {Boolean}
 */
eYo.DelegateSvg.Expr.prototype.checkOutputType = function (type) {
  var c8n = this.block_.outputConnection
  if (c8n.check_) {
    if (goog.isArray(type)) {
      for (var i = 0; (i < type.length); ++i) {
        if (c8n.check_.indexOf(type[i]) >= 0) {
          return true
        }
      }
    } else {
      return c8n.check_.indexOf(type) >= 0
    }  
  } else {
    return true
  }
}

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * @extends {Blockly.Block}
 * @constructor
 */
eYo.DelegateSvg.Expr.prototype.postInitSvg = function () {
  eYo.DelegateSvg.Expr.superClass_.postInitSvg.call(this)
  var block = this.block_
  goog.asserts.assert(this.svgPathContour_, 'Missing svgPathContour_')
  goog.dom.classlist.add(this.svgShapeGroup_, 'eyo-expr')
  goog.dom.classlist.add(this.svgContourGroup_, 'eyo-expr')
  goog.dom.classlist.add(block.svgGroup_, 'eyo-top')
}

/**
 * The contour of the receiver is below the parent's one.
 */
eYo.DelegateSvg.prototype.contourAboveParent = false


eYo.DelegateSvg.Expr.prototype.shapePathDef_ =
  eYo.DelegateSvg.Expr.prototype.contourPathDef_ =
    eYo.DelegateSvg.Expr.prototype.highlightPathDef_ =
      eYo.DelegateSvg.Expr.prototype.valuePathDef_

/**
 * Render one input of value block.
 * @param io
 * @private
 */
eYo.DelegateSvg.Expr.prototype.renderDrawInput_ = function (io) {
  return this.renderDrawDummyInput_(io) ||
    this.renderDrawValueInput_(io)
}

/**
 * Render the leading # character for collapsed statement blocks.
 * Statement subclasses must override it.
 * @param io
 * @private
 */
eYo.DelegateSvg.Expr.prototype.renderDrawSharp_ = function (io) {
}

/**
 * Did connect this block's connection to another connection.
 * When connecting locked blocks, select the receiver.
 * @param {!Blockly.Block} block
 * @param {!Blockly.Connection} connection what has been connected in the block
 * @param {!Blockly.Connection} oldTargetC8n what was previously connected in the block
 * @param {!Blockly.Connection} oldC8n what was previously connected to the new targetConnection
 */
eYo.DelegateSvg.Expr.prototype.didConnect = function (connection, oldTargetC8n, oldC8n) {
  eYo.DelegateSvg.Expr.superClass_.didConnect.call(this, connection, oldTargetC8n, oldC8n)
  var block = this.block_
  if (connection.type === Blockly.OUTPUT_VALUE) {
    var parent = connection.targetBlock()
    if (block === Blockly.selected && this.locked_) {
      parent.select()
    }
    goog.dom.classlist.remove(block.svgGroup_, 'eyo-top')
  }
}

/**
 * Did connect this block's connection to another connection.
 * When conecting locked blocks, select the receiver.
 * @param {!Blockly.Block} block
 * @param {!Blockly.Connection} connection what has been connected in the block
 * @param {!Blockly.Connection} oldTargetC8n what was previously connected in the block
 * @param {!Blockly.Connection} oldConnection what was previously connected to the new targetConnection
 */
eYo.DelegateSvg.Expr.prototype.didDisconnect = function (connection, oldTargetC8n) {
  eYo.DelegateSvg.Expr.superClass_.didDisconnect.call(this, connection, oldTargetC8n)
  var block = this.block_
  if (connection.type === Blockly.OUTPUT_VALUE) {
    goog.dom.classlist.add(block.svgGroup_, 'eyo-top')
  }
}

/**
 * Can remove and bypass the parent?
 * If the parent's output connection is connected,
 * can connect the block's output connection to it?
 * The connection cannot always establish.
 * @param {!Block} block
* @param {!Block} other the block to be replaced
  */
eYo.DelegateSvg.Expr.prototype.canReplaceBlock = function (block, other) {
  if (other) {
    var c8n = other.outputConnection
    if (!c8n) {
      return true
    }
    c8n = c8n.targetConnection
    if (!c8n || c8n.checkType_(block.outputConnection)) {
      // the parent block has an output connection that can connect to the block's one
      return true
    }
  }
  return false
}

/**
 * Remove and bypass the other block.
 * If the parent's output connection is connected,
 * connects the block's output connection to it.
 * The connection cannot always establish.
 * @param {!Block} block
 */
eYo.DelegateSvg.Expr.prototype.replaceBlock = function (block, other) {
  if (this.workspace && other && other.workspace) {
    eYo.Events.groupWrap(this,
      function () {
        try {
          console.log('**** replaceBlock', block, other)
          var c8n = other.outputConnection
          var its_xy = other.getRelativeToSurfaceXY()
          var my_xy = block.getRelativeToSurfaceXY()
          block.outputConnection.disconnect()
          if (c8n && (c8n = c8n.targetConnection) && c8n.checkType_(block.outputConnection)) {
            // the other block has an output connection that can connect to the block's one
            var source = c8n.sourceBlock_
            var selected = source.eyo.hasSelect(source)
            // next operations may unselect the block
            var old = source.eyo.consolidating_
            c8n.connect(block.outputConnection)
            source.eyo.consolidating_ = old
            if (selected) {
              source.select()
            }
          } else {
            block.moveBy(its_xy.x - my_xy.x, its_xy.y - my_xy.y)
          }
        } catch (err) {
          console.error(err)
          throw err
        } finally {
          other.dispose(true)
        }    
      }
    )
  }
}

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block
 * @private
 */
eYo.DelegateSvg.Expr.prototype.willRender_ = function (block) {
  eYo.DelegateSvg.Expr.superClass_.willRender_.call(this, block)
  var field = this.fields.await
  if (field) {
    field.setVisible(this.await_)
  }
}

/**
 * Whether the block can have an 'await' prefix.
 * Only blocks that are top block or that are directy inside function definitions
 * are awaitable
 * @param {!Blockly.Block} block The block owning the receiver.
 * @return yes or no
 */
eYo.DelegateSvg.Expr.prototype.awaitable = function (block) {
  if (!this.fields.await) {
    return false
  }
  var parent = block.getParent()
  if (!parent) {
    return true
  }
  do {
    if (parent.type === eYo.T3.Stmt.funcdef_part) {
      return !!parent.eyo.async_
    }
  } while ((parent = parent.getParent()))
  return false
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var yorn = eYo.DelegateSvg.Expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
  if (this.await_ || (this.awaitable && this.awaitable(block))) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('await', 'eyo-code-reserved'),
      goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_LEFT)
    )
    if (this.await_) {
      mgr.shouldSeparateRemove()
      mgr.addRemoveChild(mgr.newMenuItem(content, function () {
        block.eyo.data.await.set(false)
      }))
    } else {
      mgr.shouldSeparateInsert()
      mgr.addInsertChild(mgr.newMenuItem(content, function () {
        block.eyo.data.await.set(true)
      }))
    }
  }
  return yorn
}

/**
 * Can insert a block above?
 * If the block's output connection is connected,
 * can connect the parent's output to it?
 * The connection cannot always establish.
 * @param {!Block} block
 * @param {string} prototypeName
 * @param {string} parentInputName, which parent's connection to use
 */
eYo.DelegateSvg.Expr.prototype.canInsertParent = function (block, prototypeName, subtype, parentInputName) {
  var can = false
  var B
  eYo.Events.disableWrap(this,
    function () {
      B = block.workspace.newBlock(prototypeName)
      B.eyo.data.subtype.set(subtype)
      var input = B.getInput(parentInputName)
      goog.asserts.assert(input, 'No input named ' + parentInputName)
      var c8n = input.connection
      goog.asserts.assert(c8n, 'Unexpected dummy input ' + parentInputName)
      if (block.outputConnection && c8n.checkType_(block.outputConnection)) {
        var targetC8n = block.outputConnection.targetConnection
        can = !targetC8n || targetC8n.checkType_(B.outputConnection)
      }
    }, function () {
      B.dispose()
    }
  )
  return can
}

/**
 * Insert a parent.
 * If the block's output connection is connected,
 * connects the parent's output to it.
 * The connection cannot always establish.
 * The holes are filled when fill_holes is true.
 * @param {!Block} block
 * @param {Object} model
 * @param {boolean} fill_holes whether holes should be filled
 * @return the created block
 */
eYo.DelegateSvg.Expr.prototype.insertParentWithModel = function (model, fill_holes) {
  var block = this.block_
  var parentSlotName = model.slot || model.input
  var parentBlock
  eYo.Events.disableWrap(this, function () {
    parentBlock = eYo.DelegateSvg.newBlockReady(block.workspace, model)
  })
  if (!parentBlock) {
    return parentBlock
  }
  if (model.slot) {
    var slot = parentBlock.eyo.slots[model.slot]
    var parentInput = slot && slot.input
    goog.asserts.assert(parentInput, 'No input named ' + model.slot)
    var parentInputC8n = parentInput.connection
    goog.asserts.assert(parentInputC8n, 'Unexpected dummy input ' + model.slot+ ' in ' + parentBlock.type)
  } else if ((parentInput = parentBlock.eyo.getInput(parentBlock, eYo.Key.LIST, true))) {
    var list = parentInput.connection.targetBlock()
    goog.asserts.assert(list, 'Missing list block inside ' + block.type)
    // the list has many potential inputs,
    // none of them is actually connected because this is very fresh
    // get the middle input.
    parentInput = list.getInput(eYo.Do.Name.middle_name)
    parentInputC8n = parentInput.connection
    goog.asserts.assert(parentInputC8n, 'Unexpected dummy input ' + parentSlotName)
  } else {
    // find the first connection that can accept block
    var findC8n = function (B) {
      var foundC8n, target
      // start by the slots
      if (model.slot && B.eyo.someSlot(function() {
        return foundC8n = (this.key === model.slot) && this.input.connection
      })) {
        return foundC8n
      }
      const e8r = B.eyo.inputEnumerator()
      while (e8r.next()) {
        var c8n = e8r.here.connection
        if (c8n) {
          var candidate
          if (c8n.checkType_(block.outputConnection)) {
            candidate = c8n
          } else if ((target = c8n.targetBlock())) {
            candidate = findC8n(target)
          }
          if (candidate) {
            if (candidate.eyo.name === parentSlotName) {
              foundC8n = candidate
              break
            }
            if (!foundC8n) {
              foundC8n = candidate
            }
          }
        }
      }
      return foundC8n
    }
    parentInputC8n = findC8n(parentBlock)
  }
  // Next connections should be connected
  var outputC8n = block.outputConnection
  if (parentInputC8n && parentInputC8n.checkType_(outputC8n)) {
    eYo.Events.groupWrap(this,
      function () {
        if (Blockly.Events.isEnabled()) {
          Blockly.Events.fire(new Blockly.Events.BlockCreate(parentBlock))
        }
        var targetC8n = parentInputC8n.targetConnection
        if (targetC8n/* && targetC8n.isConnected() */) {
          console.log('input already connected, disconnect and dispose target')
          var B = targetC8n.sourceBlock_
          targetC8n.disconnect()
          B.dispose(true)
          B = undefined
          targetC8n = undefined
        }
        targetC8n = outputC8n.targetConnection
        var bumper
        if (targetC8n) {
          targetC8n.disconnect()
          if (parentBlock.outputConnection && targetC8n.checkType_(parentBlock.outputConnection)) {
            targetC8n.connect(parentBlock.outputConnection)
          } else {
            bumper = targetC8n.sourceBlock_
            var its_xy = bumper.getRelativeToSurfaceXY()
            var my_xy = parentBlock.getRelativeToSurfaceXY()
            parentBlock.moveBy(its_xy.x - my_xy.x, its_xy.y - my_xy.y)
          }
          targetC8n = undefined
        } else {
          its_xy = block.getRelativeToSurfaceXY()
          my_xy = parentBlock.getRelativeToSurfaceXY()
          parentBlock.moveBy(its_xy.x - my_xy.x, its_xy.y - my_xy.y)
        }
        parentInputC8n.connect(outputC8n)
        if (fill_holes) {
          var holes = eYo.HoleFiller.getDeepHoles(parentBlock)
          eYo.HoleFiller.fillDeepHoles(parentBlock.workspace, holes)
        }
        parentBlock.render()
        if (bumper) {
          bumper.bumpNeighbours_()
        }  
      }
    )
  } else {
    parentBlock.dispose(true)
    parentBlock = undefined
  }
  return parentBlock
}

/**
 * Do not call this method, except when overriding.
 * This methods is a state mutator.
 * At return type, the block is in a consistent state.
 * All the connections and components are consolidated.
 * Sends a `consolidate` message to each component of the block.
 * However, there might be some caveats related to undo management.
 * @param {!Boolean} deep
 * @param {!Boolean} force
 * @return {Boolean} true when consolidation occurred, false otherwise
 */
eYo.DelegateSvg.Expr.prototype.doConsolidate = function (deep, force) {
  if (eYo.DelegateSvg.Expr.superClass_.doConsolidate.call(this, deep, force)) {
    var parent = this.block_.getParent()
    return (parent && parent.eyo.consolidate()) || true  
  }
}

/**
 * Class for a DelegateSvg, proper_slice block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('proper_slice', {
  slots: {
    lower_bound: {
      order: 1,
      fields: {
        end: ':'
      },
      check: eYo.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'lower'
    },
    upper_bound: {
      order: 2,
      check: eYo.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'upper'
    },
    stride: {
      order: 3,
      fields: {
        start: ':'
      },
      check: eYo.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'stride'
    }
  }
})

/**
 * Class for a DelegateSvg, conditional_expression block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('conditional_expression', {
  slots: {
    expression: {
      order: 1,
      check: eYo.T3.Expr.Check.or_test_all,
      hole_value: 'name'
    },
    if: {
      order: 2,
      fields: {
        label: 'if'
      },
      check: eYo.T3.Expr.Check.or_test_all,
      hole_value: 'condition'
    },
    else: {
      order: 3,
      fields: {
        label: 'else'
      },
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'alternate'
    }
  }
})

/**
 * Class for a DelegateSvg, not_test.
 * This is not an Operator subclass because 'not' is a reserved word.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('not_test', {
  slots: {
    expression: {
      order: 1,
      fields: {
        label: 'not'
      },
      check: eYo.T3.Expr.Check.not_test_all,
      hole_value: 'name'
    }
  }
})

/**
 * Class for a DelegateSvg, builtin object.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('builtin__object', {
  data: {
    value: {
      all: ['True', 'False', 'None', 'Ellipsis', '...', 'NotImplemented'],
      synchronize: true
    }
  },
  fields: {
    value: {
      css: 'reserved'
    }
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.builtin__object.prototype.populateContextMenuFirst_ = function (block, mgr) {
  mgr.populateProperties(block, 'value')
  mgr.shouldSeparateInsert()
  eYo.DelegateSvg.Expr.builtin__object.superClass_.populateContextMenuFirst_.call(this, block, mgr)
  return true
}

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
eYo.DelegateSvg.Expr.builtin__object.prototype.makeTitle = function (block, op) {
  return eYo.Do.createSPAN(op, 'eyo-code-reserved')
}

/**
 * Class for a DelegateSvg, any object.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('any', {
  data: {
    code: {
      init: '',
      synchronize: true
    }
  },
  fields: {
    code: {
      endEditing: true,
      placeholder: eYo.Msg.Placeholder.EXPRESSION
    }
  },
  output: {
    check: null // means that every output type will fit, once we have a python parser...
  }
})
console.warn('value and subtype')

eYo.DelegateSvg.Expr.T3s = [
  eYo.T3.Expr.proper_slice,
  eYo.T3.Expr.conditional_expression,
  eYo.T3.Expr.starred_expression,
  eYo.T3.Expr.not_test,
  eYo.T3.Expr.builtin__object,
  eYo.T3.Expr.any
]

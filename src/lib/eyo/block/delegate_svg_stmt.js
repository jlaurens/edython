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

goog.provide('eYo.DelegateSvg.Stmt')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Operator')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.makeSubclass('Stmt', {
  data: {
    comment_variant: { // variant are very useful with undo/redo
      NO_COMMENT: 0,
      COMMENT: 1,
      order: 1000, // initialization comes last
      all: [0, 1],
      init: 0,
      xml: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.data.comment.required = newValue === this.COMMENT
        this.data.comment.setIncog(newValue === this.NO_COMMENT)
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.set(this.data.comment.isIncog() ? this.NO_COMMENT : this.COMMENT)
      }
    },
    comment: {
      init: /** @suppress {globalThis} */ function () {
        this.setIncog(true)
        this.init('')
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.data.comment_variant.consolidate()
      },
      validate: /** @suppress {globalThis} */ function (newValue) {
        return {validated: XRegExp.exec(newValue, eYo.XRE.comment).value || ''}
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        this.ui.fields.comment_mark.setVisible(!this.isIncog())
      },
      placeholderText: eYo.Msg.Placeholder.COMMENT,
      xml: {
        load: /** @suppress {globalThis} */ function (element) {
          this.load(element)
          this.whenRequiredFromDom(function () {
            this.setIncog(false)
          }) || (this.toText().length && this.setIncog(false))
        }
      }
    }
  },
  fields: {
    comment_mark: {
      value: '#',
      css: 'reserved'
    },
    comment: {
      validate: true,
      endEditing: true,
      placeholder: eYo.Msg.Placeholder.COMMENT,
      css: 'comment'
    }
  }
})
eYo.Delegate.Manager.registerAll(eYo.T3.Stmt, eYo.DelegateSvg.Stmt, true)

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * @extends {Blockly.Block}
 * @constructor
 */
eYo.DelegateSvg.Stmt.prototype.postInitSvg = function (block) {
  if (this.svgSharpGroup_) {
    return
  }
  eYo.DelegateSvg.Stmt.superClass_.postInitSvg.call(this, block)
  goog.asserts.assert(this.svgPathContour_, 'Missing svgPathContour_')
  this.svgSharpGroup_ = Blockly.utils.createSvgElement('g',
    {'class': 'eyo-sharp-group'}, null)
  goog.dom.insertSiblingAfter(this.svgSharpGroup_, this.svgPathContour_)
  goog.dom.classlist.add(this.svgShapeGroup_, 'eyo-stmt')
  goog.dom.classlist.add(this.svgContourGroup_, 'eyo-stmt')
}

/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects...
 * @protected
 */
eYo.DelegateSvg.Stmt.prototype.disposeInternal = function () {
  goog.dom.removeNode(this.svgSharpGroup_)
  this.svgSharpGroup_ = undefined
  eYo.DelegateSvg.superClass_.disposeInternal.call(this)
}

/**
 * Statement block path.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.Stmt.prototype.statementPathDef_ = function (block) {
  /* eslint-disable indent */
  var w = block.width
  var h = block.height
  var steps = ['m ' + w + ',0 v ' + h]
  var r = eYo.Style.Path.radius()
  var a = ' a ' + r + ', ' + r + ' 0 0 1 '
  var c8n = block.nextConnection
  if (c8n && c8n.isConnected()) {
    steps.push('h ' + (-w))
  } else {
    steps.push('h ' + (-w + r) + a + (-r) + ',' + (-r))
    h -= r
  }
  c8n = block.previousConnection
  if (c8n && c8n.isConnected() && c8n.targetBlock().getNextBlock() === block) {
    steps.push('v ' + (-h) + ' z')
  } else {
    steps.push('v ' + (-h + r) + a + r + ',' + (-r) + ' z')
  }
  return steps.join(' ')
} /* eslint-enable indent */

eYo.DelegateSvg.Stmt.prototype.shapePathDef_ =
  eYo.DelegateSvg.Stmt.prototype.contourPathDef_ =
    eYo.DelegateSvg.Stmt.prototype.highlightPathDef_ =
      eYo.DelegateSvg.Stmt.prototype.statementPathDef_

/**
 * Render the leading # character for disabled statement blocks.
 * @param io
 * @private
 * @override
 */
eYo.DelegateSvg.Stmt.prototype.renderDrawSharp_ = function (io) {
  if (io.block.disabled) {
    var children = goog.dom.getChildren(this.svgSharpGroup_)
    var length = children.length
    if (!length) {
      var y = eYo.Font.totalAscent
      var text = Blockly.utils.createSvgElement('text',
        {'x': 0, 'y': y},
        this.svgSharpGroup_)
      this.svgSharpGroup_.appendChild(text)
      text.appendChild(document.createTextNode('#'))
      length = 1
    }
    var expected = io.block.eyo.getStatementCount(io.block)
    while (length < expected) {
      y = eYo.Font.totalAscent + length * eYo.Font.lineHeight()
      text = Blockly.utils.createSvgElement('text',
        {'x': 0, 'y': y},
        this.svgSharpGroup_)
      this.svgSharpGroup_.appendChild(text)
      text.appendChild(document.createTextNode('#'))
      ++length
    }
    while (length > expected) {
      text = children[--length]
      this.svgSharpGroup_.removeChild(text)
    }
    this.svgSharpGroup_.setAttribute('transform', 'translate(' + (io.cursorX) +
        ', ' + eYo.Padding.t() + ')')
    io.cursorX += 2 * eYo.Font.space
  } else {
    goog.dom.removeChildren(this.svgSharpGroup_)
  }
}

/**
 * Render one input of value block.
 * @param io
 * @private
 */
eYo.DelegateSvg.Stmt.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
    this.renderDrawValueInput_(io)
}

/**
 * Render the inputs of the block.
 * @param {!Blockly.Block} block
 * @protected
 */
eYo.DelegateSvg.Stmt.prototype.minBlockWidth = function (block) {
  return eYo.Font.tabWidth
}

/**
 * Insert a block above.
 * If the block's previous connection is connected,
 * connects the block above to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {!Block} block
 * @param {string} prototypeName
 * @param {string} parentInputName, which parent's connection to use
 * @return the created block
 */
eYo.DelegateSvg.Stmt.prototype.insertParentWithModel = function (block, parentPrototypeName, subtype) {
  var c8n = block.previousConnection
  if (c8n) {
    Blockly.Events.disable()
    var parentBlock = eYo.DelegateSvg.newBlockReady(block.workspace, parentPrototypeName)
    Blockly.Events.enable()
    var parentC8n = parentBlock.nextConnection
    if (parentC8n) {
      eYo.Events.setGroup(true)
      try {
        if (Blockly.Events.isEnabled()) {
          Blockly.Events.fire(new Blockly.Events.BlockCreate(parentBlock))
        }
        parentBlock.eyo.data.subtype.set(subtype)
        var targetC8n = c8n.targetConnection
        if (targetC8n) {
          targetC8n.disconnect()
          if (parentBlock.previousConnection) {
            targetC8n.connect(parentBlock.previousConnection)
          }
        } else {
          var its_xy = block.getRelativeToSurfaceXY()
          var my_xy = parentBlock.getRelativeToSurfaceXY()
          parentBlock.moveBy(its_xy.x - my_xy.x, its_xy.y - my_xy.y)
        }
        parentBlock.eyo.beReady(parentBlock)
        var holes = eYo.HoleFiller.getDeepHoles(parentBlock)
        eYo.HoleFiller.fillDeepHoles(parentBlock.workspace, holes)
        parentBlock.render()
        c8n.connect(parentC8n)
        if (Blockly.selected === block) {
          parentBlock.select()
        }
      } finally {
        eYo.Events.setGroup(false)
      }
    }
  }
  return parentBlock
}

/**
 * Insert a block below.
 * If the block's next connection is connected,
 * connects the block below to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {!Block} block
 * @param {string} prototypeName
 * @param {string} parentInputName, which parent's connection to use
 * @return the created block
 */
eYo.DelegateSvg.Stmt.prototype.insertBlockAfter = function (block, belowPrototypeName) {
  eYo.Events.setGroup(true)
  try {
    var blockAfter = eYo.DelegateSvg.newBlockReady(block.workspace, belowPrototypeName)
    var c8n = block.nextConnection
    var targetC8n = c8n.targetConnection
    if (targetC8n) {
      targetC8n.disconnect()
      if (targetC8n.checkType_(blockAfter.nextConnection)) {
        targetC8n.connect(blockAfter.nextConnection)
      }
    }
    var holes = eYo.HoleFiller.getDeepHoles(blockAfter)
    eYo.HoleFiller.fillDeepHoles(blockAfter.workspace, holes)
    blockAfter.render()
    block.nextConnection.connect(blockAfter.previousConnection)
    if (Blockly.selected === block) {
      blockAfter.select()
    }
  } finally {
    eYo.Events.setGroup(false)
  }
  return blockAfter
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.prototype.populateContextMenuComment = function (block, mgr) {
  var show = !this.data.comment.isIncog()
  var content =
  eYo.Do.createSPAN(show ? eYo.Msg.Placeholder.REMOVE_COMMENT : eYo.Msg.Placeholder.ADD_COMMENT, null)
  var menuItem = new eYo.MenuItem(content, function () {
    block.eyo.data.comment.setIncog(show)
  })
  mgr.addChild(menuItem, true)
  return true
}

/**
 * Class for a DelegateSvg, pass_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass(eYo.T3.Stmt.pass_stmt, {
  fields: {
    label: 'pass'
  }
})

/**
 * Class for a DelegateSvg, break_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass(eYo.T3.Stmt.break_stmt, {
  fields: {
    label: 'break'
  }
})

/**
 * Class for a DelegateSvg, continue_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass(eYo.T3.Stmt.continue_stmt, {
  fields: {
    label: 'continue'
  }
})

/// /////// gobal/nonlocal statement
/**
 * Class for a DelegateSvg, non_void_identifier_list block.
 * This block may be sealed.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass(eYo.T3.Expr.non_void_identifier_list, {
  list: {
    check: eYo.T3.Expr.Check.non_void_identifier_list,
    empty: false,
    presep: ','
  }
})

/**
 * Class for a DelegateSvg, global_nonlocal_expr.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass(eYo.T3.Stmt.global_nonlocal_stmt, {
  data: {
    variant: {
      GLOBAL: 0,
      NONLOCAL: 1,
      all: ['global', 'nonlocal'],
      synchronize: true
    }
  },
  fields: {
    variant: {
      css: 'reserved'
    }
  },
  tiles: {
    identifiers: {
      order: 1,
      wrap: eYo.T3.Expr.non_void_identifier_list
    }
  }
})

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns 'eyo:list' when this block is embedded
 * and the inherited value otherwise.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
eYo.DelegateSvg.Stmt.global_nonlocal_stmt.prototype.tagName = function (block) {
  var M = this.data.variant.model
  var current = this.data.variant.get()
  return current === M.GLOBAL ? 'eyo:global' : 'eyo:nonlocal'
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.global_nonlocal_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var M = this.data.variant.model
  var current = block.eyo.data.variant.get()
  var variants = block.eyo.data.variant.getAll()
  var F = function (i) {
    var key = variants[i]
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN(key, 'eyo-code-reserved'),
      eYo.Do.createSPAN(' …', 'eyo-code-placeholder')
    )
    var menuItem = new eYo.MenuItem(content, function () {
      block.eyo.data.variant.set(key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(M.GLOBAL)
  F(M.NONLOCAL)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.global_nonlocal_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, docstring_top_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('docstring_top_stmt', {
  link: eYo.T3.Expr.longliteral
})

/**
 * docstring blocks are white, to be confirmed.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
eYo.DelegateSvg.Stmt.docstring_top_stmt.prototype.isWhite = function (block) {
  return true
}

/**
 * Class for a DelegateSvg, docstring_def_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('docstring_def_stmt', {
  link: eYo.T3.Expr.longliteral
})

console.warn('if_part and others conform to the new model and xml ?')
/**
 * docstring blocks are white.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
eYo.DelegateSvg.Stmt.docstring_def_stmt.prototype.isWhite = function (block) {
  return true
}

/**
 * Class for a DelegateSvg, del_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('del_stmt', {
  tiles: {
    del: {
      order: 1,
      fields: {
        label: 'del'
      },
      wrap: eYo.T3.Expr.target_list
    }
  }
})

/**
 * Class for a DelegateSvg, return_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('return_stmt', {
  tiles: {
    return: {
      order: 1,
      fields: {
        label: 'return'
      },
      wrap: eYo.T3.Expr.expression_list
    }
  }
})

/**
 * Class for a DelegateSvg, expression_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('expression_stmt', {
  tiles: {
    expression: {
      order: 1,
      check: eYo.T3.Expr.Check.expression
    }
  }
})

/**
 * Class for a DelegateSvg, any_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('any_stmt', {
  data: {
    variant: {
      CODE: 0,
      CODE_COMMENT: 1,
      EXPRESSION: 2,
      EXPRESSION_COMMENT: 3,
      COMMENT: 5,
      order: 10000, // initialization comes last
      all: [0, 1, 2, 3, 5, 5],
      init: 2,
      xml: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.data.code.required = newValue < this.EXPRESSION
        this.data.code.setIncog(newValue > this.CODE_COMMENT)
        this.data.comment.required = (newValue % 2) && newValue !== this.COMMENT
        this.data.comment.setIncog(!(newValue % 2))
        this.ui.tiles.expression.required = newValue < this.COMMENT &&
        newValue > this.CODE_COMMENT
        this.ui.tiles.expression.setIncog(newValue < this.EXPRESSION ||
        newValue > this.EXPRESSION_COMMENT)
      },
      consolidate: /** @suppress {globalThis} */ function () {
        var withCode = !this.data.code.isIncog()
        var withExpression = !this.ui.tiles.expression.isIncog()
        var withComment = !this.data.comment.isIncog()
        if (withCode) {
          if (withComment) {
            this.set(this.CODE_COMMENT)
          } else {
            if (withExpression) {
              console.warn(eYo.Do.format(
                'Block with both code and expression {0}/{1}',
                this.key,
                this.getType()
              ))
            }
            this.set(this.CODE)
          }
        } else if (withExpression) {
          if (withComment) {
            this.set(this.EXPRESSION_COMMENT)
          } else {
            this.set(this.EXPRESSION)
          }
        } else {
          this.set(this.COMMENT)
        }
      }
    },
    code: {
      synchronize: true,
      didChange: /** @suppress {globalThis} */ function (oldVAlue, newValue) {
        var variant = this.data.variant
        if (this.isIncog() && variant.get() === variant.CODE) {
          variant.set(variant.COMMENT)
        }
      },
      xml: {
        text: true,
        load: /** @suppress {globalThis} */ function (element) {
          this.load(element)
          this.whenRequiredFromDom(function () {
            this.setIncog(false)
          }) || (this.toText().length && this.setIncog(false))
        }
      }
    },
    comment: {
      init: /** @suppress {globalThis} */ function () {
        this.init('')
        this.setIncog(true)
      },
      didChange: /** @suppress {globalThis} */ function (oldVAlue, newValue) {
        var variant = this.data.variant
        if (this.isIncog() && variant.get() === variant.COMMENT) {
          variant.set(variant.CODE)
        }
      }
    }
  },
  fields: {
    code: {
      endEditing: true
    }
  },
  tiles: {
    expression: {
      order: 1,
      check: eYo.T3.Expr.Check.expression,
      init: /** @suppress {globalThis} */ function () {
        this.init()
        this.setIncog(true)
      },
      xml: {
        load: /** @suppress {globalThis} */ function (element) {
          this.load(element)
          this.whenRequiredFromDom(function () {
            this.setIncog(false)
          }) || (this.getTarget() && this.setIncog(false))
        }
      }
    }
  }
})

/**
 * comment blocks are white.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
eYo.DelegateSvg.Stmt.any_stmt.prototype.isWhite = function (block) {
  return this.data.variant.get() === this.data.variant.model.COMMENT
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.any_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var data = this.data.variant
  var current = data.get()
  var comment = this.data.comment.toText()
  var code = this.data.code.toText()
  if (code.length > 32) {
    var short_code = code.substring(0, 31) + '…'
  }
  if (comment.length > 32) {
    var short_comment = comment.substring(0, 31) + '…'
  }
  var total = code.length + comment.length
  if (total > 30) {
    var short_code_all = code.substring(0, Math.floor(30 * code.length / total) + 2) + '…'
    var short_comment_all = comment.substring(0, Math.floor(30 * comment.length / total) + 2) + '…'
  }
  var F = function (content, variant) {
    if (variant !== current) {
      var menuItem = new eYo.MenuItem(content, function () {
        data.set(variant)
      })
      mgr.addChild(menuItem)
    }
  }
  var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN('# ', 'eyo-code-reserved'),
    eYo.Do.createSPAN(short_comment || comment || eYo.Msg.Placeholder.COMMENT,
      'eyo-code-comment')
  )
  F(content, data.COMMENT)
  content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN(short_code || code || eYo.Msg.Placeholder.CODE,
      'eyo-code')
  )
  F(content, data.CODE)
  content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN(short_code_all || code || eYo.Msg.Placeholder.CODE,
      'eyo-code'),
    eYo.Do.createSPAN(' # ', 'eyo-code-reserved'),
    eYo.Do.createSPAN(short_comment_all || comment || eYo.Msg.Placeholder.COMMENT,
      'eyo-code-comment')
  )
  F(content, data.CODE_COMMENT)
  content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN('…', 'eyo-code')
  )
  F(content, data.EXPRESSION)
  content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN('…', 'eyo-code'),
    eYo.Do.createSPAN(' # ', 'eyo-code-reserved'),
    eYo.Do.createSPAN(short_comment_all || eYo.Msg.Placeholder.COMMENT,
      'eyo-code-comment')
  )
  F(content, data.EXPRESSION_COMMENT)
  return eYo.DelegateSvg.Stmt.any_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr) || true
}

eYo.DelegateSvg.Stmt.T3s = [
  eYo.T3.Stmt.pass_stmt,
  eYo.T3.Stmt.break_stmt,
  eYo.T3.Stmt.continue_stmt,
  eYo.T3.Stmt.global_nonlocal_stmt,
  eYo.T3.Stmt.expression_stmt,
  eYo.T3.Stmt.docstring_top_stmt,
  eYo.T3.Stmt.docstring_def_stmt,
  eYo.T3.Stmt.del_stmt,
  eYo.T3.Stmt.return_stmt,
  eYo.T3.Stmt.any_stmt
]

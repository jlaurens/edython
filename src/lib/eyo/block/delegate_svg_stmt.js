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
      NONE: eYo.Key.NONE,
      COMMENT: eYo.Key.COMMENT,
      order: 1000000, // initialization comes last
      all: [eYo.Key.NONE, eYo.Key.COMMENT],
      init: eYo.Key.NONE,
      xml: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.data.comment.required = newValue === this.COMMENT
        this.data.comment.setIncog()
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.set(this.data.comment.isIncog() ? this.NONE : this.COMMENT)
      }
    },
    comment: {
      order: 1000001,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.data.comment_variant.consolidate()
      },
      validate: /** @suppress {globalThis} */ function (newValue) {
        return {validated: XRegExp.exec(newValue, eYo.XRE.comment).value || ''}
      },
      synchronize: true,
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
  slots: {
    comment: {
      order: 1000001,
      fields: {
        label: {
          order: 0,
          value: '#',
          css: 'reserved'
        },
        bind: {
          order: 1,
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.COMMENT,
          css: 'comment'
        }
      }    
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
eYo.DelegateSvg.Stmt.prototype.postInitSvg = function () {
  if (this.svgSharpGroup_) {
    return
  }
  eYo.DelegateSvg.Stmt.superClass_.postInitSvg.call(this)
  var block = this.block_
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
eYo.DelegateSvg.Stmt.prototype.statementPathDef_ = function () {
  return eYo.Shape.definitionWithBlock(this)
  
  /* eslint-disable indent */
  var block = this.block_
  // both edges of the block count for one character
  var w = block.width - eYo.Unit.x / 2
  var h = block.height
  var steps = ['m ' + w + ',0 v ' + h]
  var r = eYo.Style.Path.r
  var a = ' a ' + r + ', ' + r + ' 0 0 1 '
  var c8n = block.nextConnection
  if (c8n && c8n.isConnected()) {
    steps.push('h ' + (-w + eYo.Unit.x - eYo.Padding.l))
  } else {
    steps.push('h ' + (-w + eYo.Unit.x - eYo.Padding.l + r) + a + (-r) + ',' + (-r))
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
    var expected = io.block.eyo.getStatementCount()
    while (length < expected) {
      y = eYo.Font.totalAscent + length * eYo.Font.lineHeight
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
    this.svgSharpGroup_.setAttribute('transform', 'translate(' + (io.cursor.x) +
        ', ' + eYo.Padding.t + ')')
    io.cursor.c += 2
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
  this.renderDrawValueInput_(io)
}

/**
 * Render the inputs of the block.
 * @param {!Blockly.Block} block
 * @protected
 */
eYo.DelegateSvg.Stmt.prototype.minBlockW = function () {
  return eYo.Font.tabW
}

console.error('workspace cancel last gesture?')

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
eYo.DelegateSvg.Stmt.prototype.insertParentWithModel = function (model) {
  var block = this.block_
  var c8n = block.previousConnection
  if (c8n) {
    var parentBlock
    eYo.Events.disableWrap(this,
      function () {
        parentBlock = eYo.DelegateSvg.newBlockReady(block.workspace, model)
      },
      function () {
        if (parentBlock) {
          var parentC8n = parentBlock.nextConnection
          if (parentC8n && c8n.checkType_(parentC8n)) {
            eYo.Events.groupWrap(this,
              function () {
                if (Blockly.Events.isEnabled()) {
                  Blockly.Events.fire(new Blockly.Events.BlockCreate(parentBlock))
                }
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
                var holes = eYo.HoleFiller.getDeepHoles(parentBlock)
                eYo.HoleFiller.fillDeepHoles(parentBlock.workspace, holes)
                parentBlock.render()
                c8n.connect(parentC8n)
                if (Blockly.selected === block) {
                  parentBlock.select()
                }
              }
            )
          } else {
            parentBlock.dispose(true)
            parentBlock = undefined
          }
        }    
      }
    )
    return parentBlock
  }
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
eYo.DelegateSvg.Stmt.prototype.insertBlockAfter = function (belowPrototypeName) {
  return eYo.Events.groupWrap(this,
    function () {
      var block = this.block_
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
      return blockAfter
    }
  )
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.prototype.populateContextMenuComment = function (mgr) {
  var block = this.block_
  var show = !this.data.comment.isIncog()
  var content =
  eYo.Do.createSPAN(show ? eYo.Msg.Placeholder.REMOVE_COMMENT : eYo.Msg.Placeholder.ADD_COMMENT, null)
  var menuItem = mgr.newMenuItem(content, block.eyo.doAndRender( function () {
    this.data.comment.setIncog(show)
  }))
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
 * This block may be wrapped.
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
      all: [eYo.Key.GLOBAL, eYo.Key.NONLOCAL],
      synchronize: true
    }
  },
  fields: {
    variant: {
      css: 'reserved'
    }
  },
  slots: {
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
 * @return true if the given value is accepted, false otherwise
 */
eYo.DelegateSvg.Stmt.global_nonlocal_stmt.prototype.tagName = function () {
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
eYo.DelegateSvg.Stmt.global_nonlocal_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  var M = this.data.variant.model
  var current = block.eyo.data.variant.get()
  var variants = block.eyo.data.variant.getAll()
  var F = function (i) {
    var key = variants[i]
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN(key, 'eyo-code-reserved'),
      eYo.Do.createSPAN(' …', 'eyo-code-placeholder')
    )
    var menuItem = mgr.newMenuItem(content, function () {
      block.eyo.data.variant.set(key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(M.GLOBAL)
  F(M.NONLOCAL)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.global_nonlocal_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
}

/**
 * Class for a DelegateSvg, docstring_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('docstring_stmt', {
  link: eYo.T3.Expr.longliteral
})

/**
 * docstring blocks are white, to be confirmed.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
eYo.DelegateSvg.Stmt.docstring_stmt.prototype.isWhite = function () {
  return true
}

/**
 * Class for a DelegateSvg, del_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('del_stmt', {
  slots: {
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
  slots: {
    ans: {
      order: 1,
      fields: {
        label: 'return'
      },
      wrap: eYo.T3.Expr.optional_expression_list
    }
  }
})

/**
 * Class for a DelegateSvg, expression_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('expression_stmt', {
  slots: {
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
      NONE: eYo.Key.NONE,
      CODE: eYo.Key.CODE,
      order: 10000, // initialization comes last
      all: [
        eYo.Key.NONE,
        eYo.Key.CODE,
      ],
      init: eYo.Key.NONE,
      xml: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.afterChange(oldValue, newValue)
        var data = this.data.code
        data.required = newValue === this.CODE
        data.setIncog()
        if (!data.required) {
          this.owner.comment_variant_p = eYo.Key.COMMENT
        }
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.set(this.data.code.isIncog() ? this.NONE : this.CODE)
      }
    },
    code: {
      synchronize: true,
      validate: /** @suppress {globalThis} */ function (newValue) {
        // remove any newline character from newValue
        var clean = newValue.replace(/[\n\r]+/g, '')
        return {validated: clean}
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        if (this.isIncog()) {
          this.owner.comment_variant_p = eYo.Key.COMMENT
        }
      },
      xml: {
        text: true,
        didLoad: /** @suppress {globalThis} */ function () {
          this.whenRequiredFromDom(function () {
            this.setIncog(false)
          }) || (this.toText().length && this.setIncog(false))
        }
      }
    },
    comment_variant: {
      init: eYo.Key.COMMENT
    }
  },
  slots: {
    code: {
      order: 1,
      fields: {
        bind: {
          placeholder: /** @suppress {globalThis} */ function () {
            return eYo.Msg.Placeholder.CODE
          },
          endEditing: true
        }
      },
      check: eYo.T3.Expr.Check.expression
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
eYo.DelegateSvg.Stmt.any_stmt.prototype.isWhite = function () {
  return this.data.variant.get() === this.data.variant.model.COMMENT
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.any_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
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
      var menuItem = mgr.newMenuItem(content, function () {
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
  return eYo.DelegateSvg.Stmt.any_stmt.superClass_.populateContextMenuFirst_.call(this, mgr) || true
}

eYo.DelegateSvg.Stmt.T3s = [
  eYo.T3.Stmt.pass_stmt,
  eYo.T3.Stmt.break_stmt,
  eYo.T3.Stmt.continue_stmt,
  eYo.T3.Stmt.global_nonlocal_stmt,
  eYo.T3.Stmt.expression_stmt,
  eYo.T3.Stmt.docstring__stmt,
  eYo.T3.Stmt.del_stmt,
  eYo.T3.Stmt.return_stmt,
  eYo.T3.Stmt.any_stmt
]

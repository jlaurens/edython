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

goog.provide('edY.DelegateSvg.Stmt')

goog.require('edY.DelegateSvg.List')
goog.require('edY.DelegateSvg.Expr')
goog.require('edY.DelegateSvg.Operator')

/**
 * Class for a DelegateSvg, statement block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.makeSubclass('Stmt', {
  data: {
    comment: {
      default: '',
      validate: function(newValue) {
        return {validated: XRegExp.exec(newValue, edY.XRE.comment).value || ''}
      },
      synchronize: true,
      placeholderText: edY.Msg.Placeholder.COMMENT,
      xml: {
        toDom: function(element) {
          if (this.data.comment_show.get()) {
            element.setAttribute(this.attributeName, this.toText())
          }
        },
        fromDom: function(element) {
          var comment = element.getAttribute(this.attributeName)
          if (goog.isDefAndNotNull(comment)) {
            this.fromText(comment)
            this.data.comment_show.set(true)
          }
        },
      }
    },
    comment_show: {
      default: false,
      validate: function(newValue) {
        return {validated: newValue} // is it still necessary ?
      },
      synchronize: function(newValue) {
        this.ui.fields.comment_mark.setVisible(!!newValue)
        this.ui.fields.comment.setVisible(!!newValue)
      },
      xml: false,// do not save
    },
  },
  fields: {
    comment_mark: {
      value: '#',
      css: 'reserved',
    },
    comment: {
      validate: true,
      endEditing: true,
      placeholder: edY.Msg.Placeholder.COMMENT,
      css: 'comment',
    },
  },
})
edY.Delegate.Manager.registerAll(edY.T3.Stmt, edY.DelegateSvg.Stmt, true)

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * @extends {Blockly.Block}
 * @constructor
 */
edY.DelegateSvg.Stmt.prototype.postInitSvg = function (block) {
  if (this.svgSharpGroup_) {
    return
  }
  edY.DelegateSvg.Stmt.superClass_.postInitSvg.call(this, block)
  goog.asserts.assert(this.svgPathContour_, 'Missing svgPathContour_')
  this.svgSharpGroup_ = Blockly.utils.createSvgElement('g',
    {'class': 'edy-sharp-group'}, null)
  goog.dom.insertSiblingAfter(this.svgSharpGroup_, this.svgPathContour_)
}

/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects...
 * @protected
 */
edY.DelegateSvg.Stmt.prototype.disposeInternal = function () {
  goog.dom.removeNode(this.svgSharpGroup_)
  this.svgSharpGroup_ = undefined
  edY.DelegateSvg.superClass_.disposeInternal.call(this)
}

/**
 * Statement block path.
 * @param {!Blockly.Block} block.
 * @private
 */
edY.DelegateSvg.Stmt.prototype.statementPathDef_ = function (block) {
  /* eslint-disable indent */
  var w = block.width
  var h = block.height
  var steps = ['m ' + w + ',0 v ' + h]
  var r = edY.Style.Path.radius()
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

edY.DelegateSvg.Stmt.prototype.shapePathDef_ =
  edY.DelegateSvg.Stmt.prototype.contourPathDef_ =
    edY.DelegateSvg.Stmt.prototype.highlightPathDef_ =
      edY.DelegateSvg.Stmt.prototype.statementPathDef_

/**
 * Render the leading # character for disabled statement blocks.
 * @param io.
 * @private
 * @override
 */
edY.DelegateSvg.Stmt.prototype.renderDrawSharp_ = function (io) {
  if (io.block.disabled) {
    var children = goog.dom.getChildren(this.svgSharpGroup_)
    var length = children.length
    if (!length) {
      var y = edY.Font.totalAscent
      var text = Blockly.utils.createSvgElement('text',
        {'x': 0, 'y': y},
        this.svgSharpGroup_)
      this.svgSharpGroup_.appendChild(text)
      text.appendChild(document.createTextNode('#'))
      length = 1
    }
    var expected = io.block.edy.getStatementCount(io.block)
    while (length < expected) {
      y = edY.Font.totalAscent + length * edY.Font.lineHeight()
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
        ', ' + edY.Padding.t() + ')')
    io.cursorX += 2*edY.Font.space
  } else {
    goog.dom.removeChildren(this.svgSharpGroup_)
  }
}

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
edY.DelegateSvg.Stmt.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
    this.renderDrawValueInput_(io)
}

/**
 * Render the inputs of the block.
 * @param {!Blockly.Block} block.
 * @protected
 */
edY.DelegateSvg.Stmt.prototype.minBlockWidth = function (block) {
  return edY.Font.tabWidth
}

/**
 * Insert a block above.
 * If the block's previous connection is connected,
 * connects the block above to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {!Block} block.
 * @param {string} prototypeName.
 * @param {string} parentInputName, which parent's connection to use
 * @return the created block
 */
edY.DelegateSvg.Stmt.prototype.insertParent = function(block, parentPrototypeName, subtype) {
  var c8n = block.previousConnection
  if (c8n) {
    Blockly.Events.disable()
    var parentBlock = edY.DelegateSvg.newBlockComplete(block.workspace, parentPrototypeName, true)
    Blockly.Events.enable()
    var parentC8n = parentBlock.nextConnection
    if (parentC8n) {
      Blockly.Events.setGroup(true)
      try {
        if (Blockly.Events.isEnabled()) {
          Blockly.Events.fire(new Blockly.Events.BlockCreate(parentBlock))
        }
        parentBlock.edy.data.subtype.set(subtype)
        var targetC8n = c8n.targetConnection
        if (targetC8n) {
          targetC8n.disconnect()
          if (parentBlock.previousConnection) {
            targetC8n.connect(parentBlock.previousConnection)
          }
        } else {
          var its_xy = block.getRelativeToSurfaceXY();
          var my_xy = parentBlock.getRelativeToSurfaceXY();
          parentBlock.moveBy(its_xy.x-my_xy.x, its_xy.y-my_xy.y)    
        }
        parentBlock.edy.beReady(parentBlock)
        var holes = edY.HoleFiller.getDeepHoles(parentBlock)
        edY.HoleFiller.fillDeepHoles(parentBlock.workspace, holes)
        parentBlock.render()
        c8n.connect(parentC8n)
        if (Blockly.selected === block) {
          parentBlock.select()
        }
      } finally {
        Blockly.Events.setGroup(false)
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
 * @param {!Block} block.
 * @param {string} prototypeName.
 * @param {string} parentInputName, which parent's connection to use
 * @return the created block
 */
edY.DelegateSvg.Stmt.prototype.insertBlockAfter = function(block, belowPrototypeName) {
  Blockly.Events.setGroup(true)
  try {
    var blockAfter = edY.DelegateSvg.newBlockComplete(block.workspace, belowPrototypeName, true)
    var c8n = block.nextConnection
    var targetC8n = c8n.targetConnection
    if (targetC8n) {
      targetC8n.disconnect()
      if (targetC8n.checkType_(blockAfter.nextConnection)) {
        targetC8n.connect(blockAfter.nextConnection)
      }
    }
    blockAfter.edy.beReady(blockAfter)
    var holes = edY.HoleFiller.getDeepHoles(blockAfter)
    edY.HoleFiller.fillDeepHoles(blockAfter.workspace, holes)
    blockAfter.render()
    block.nextConnection.connect(blockAfter.previousConnection)
    if (Blockly.selected === block) {
      blockAfter.select()
    }
  } finally {
    Blockly.Events.setGroup(false)
  }
  return blockAfter
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Stmt.prototype.populateContextMenuComment = function (block, mgr) {
  var show = this.data.comment_show.get()
  var content =
  edY.Do.createSPAN(show? edY.Msg.Placeholder.REMOVE_COMMENT: edY.Msg.Placeholder.ADD_COMMENT, null)
  var menuItem = new edY.MenuItem(content, function() {
    block.edy.data.comment_show.set(!show)
  })
  mgr.addChild(menuItem, true)
  return true
}

/**
 * Class for a DelegateSvg, pass_stmt.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Stmt.makeSubclass(edY.T3.Stmt.pass_stmt, {
  fields: {
    label: 'pass',
  },
})

/**
 * Class for a DelegateSvg, break_stmt.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Stmt.makeSubclass(edY.T3.Stmt.break_stmt, {
  fields: {
    label: 'break',
  },
})

/**
 * Class for a DelegateSvg, continue_stmt.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Stmt.makeSubclass(edY.T3.Stmt.continue_stmt, {
  fields: {
    label: 'continue',
  },
})

////////// gobal/nonlocal statement
/**
 * Class for a DelegateSvg, non_void_identifier_list block.
 * This block may be sealed.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.List.makeSubclass(edY.T3.Expr.non_void_identifier_list, {
  list: {
    check: edY.T3.Expr.Check.non_void_identifier_list,
    empty: false,
    presep: ',',
  },
})

/**
 * Class for a DelegateSvg, global_nonlocal_expr.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Stmt.makeSubclass(edY.T3.Stmt.global_nonlocal_stmt, {
  data: {
    variant: {
      GLOBAL: 0,
      NONLOCAL: 1,
      all: [0, 1],
      synchronize: true,
    },
  },
  fields: {
    variant: {
      css: 'reserved',
    },
  },
  tiles: {
    identifiers: {
      order: 1,
      wrap: edY.T3.Expr.non_void_identifier_list,
    },
  },
})

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns 'edy:list' when this block is embedded
 * and the inherited value otherwise.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
edY.DelegateSvg.Stmt.global_nonlocal_stmt.prototype.tagName = function (block) {
  var M = this.data.variant.model
  var current = this.data.variant.get()
  return current === M.GLOBAL? 'edy:global': 'edy:nonlocal'
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Stmt.global_nonlocal_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var variants = this.data.variant.getAll()
  var current = block.edy.data.variant.get()
  var F = function(key) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'edy-code',
      edY.Do.createSPAN(key, 'edy-code-reserved'),
      edY.Do.createSPAN(' …', 'edy-code-placeholder'),
    )
    var menuItem = new edY.MenuItem(content, function() {
      block.edy.data.variant.set(key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(variants[0])
  F(variants[1])
  mgr.shouldSeparate()
  return edY.DelegateSvg.Stmt.global_nonlocal_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, expression_stmt.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Stmt.makeSubclass('expression_stmt', {
  tiles: {
    expression: {
      order: 1,
      check: edY.T3.Expr.Check.expression,
    },
  },
})


/**
 * Class for a DelegateSvg, docstring_top_stmt.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Stmt.makeSubclass('docstring_top_stmt', {
  link: edY.T3.Expr.longliteral,
})

/**
 * docstring blocks are white, to be confirmed.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
edY.DelegateSvg.Stmt.docstring_top_stmt.prototype.isWhite = function(block)  {
  return true
}

/**
 * Class for a DelegateSvg, docstring_def_stmt.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Stmt.makeSubclass('docstring_def_stmt', {
  link: edY.T3.Expr.longliteral,
})

console.warn('if_part and others conform to the new model and xml ?')
/**
 * docstring blocks are white.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
edY.DelegateSvg.Stmt.docstring_def_stmt.prototype.isWhite = function(block)  {
  return true
}

/**
 * Get the subtype of the block.
 * The default implementation does nothing.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is return, when defined or not null.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
edY.DelegateSvg.Stmt.docstring_top_stmt.prototype.getSubtype = edY.DelegateSvg.Stmt.docstring_def_stmt.prototype.getSubtype = function (block) {
  var target = this.ui[1].input.connection.targetBlock()
  return target? target.edy.getSuptype(target): undefined
}

/**
 * Set the subtype of the block.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is expected.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
edY.DelegateSvg.Stmt.docstring_top_stmt.prototype.setSubtype = edY.DelegateSvg.Stmt.docstring_def_stmt.prototype.setSubtype = function (block, subtype) {
  var target = this.ui[1].input.connection.targetBlock()
  if (target) {
    target.edy.data.subtype.set(subtype)
  }
  return true
}

/**
 * Class for a DelegateSvg, del_stmt.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Stmt.makeSubclass('del_stmt', {
  tiles: {
    del: {
      order: 1,
      fields: {
        label: 'del',
      },
      wrap: edY.T3.Expr.target_list,
    },
  },
})

/**
 * Class for a DelegateSvg, return_stmt.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Stmt.makeSubclass('return_stmt', {
  tiles: {
    return: {
      order: 1,
      fields: {
        label: 'return',
      },
      wrap: edY.T3.Expr.expression_list,
    },
  },
})

/**
 * Class for a DelegateSvg, return_stmt.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Stmt.makeSubclass('any_stmt',{
  data: {
    variant: {
      INSTRUCTION: 0,
      INSTRUCTION_COMMENT: 1,
      COMMENT: 2,
      all: [0, 1, 2],
      default: 2,
      xml: false,
      didChange: function(oldValue, newValue) {
        this.ui.fields.code.setVisible(newValue !== this.model.COMMENT)
        this.data.comment_show.set(newValue !== this.model.INSTRUCTION)
        this.data.code.required = newValue !== this.model.COMMENT
      },
    },
    comment_show: {
      didChange: function(oldValue, newValue) {
        var data = this.data.variant
        var current = data.get()
        data.set(newValue? current || 1: 0)
      },
      xml: false,// do not save
    },
    code: {
      synchronize: true,
      xml: {
        text: true,
        didoad: function () {
          var variant = this.owner.data.variant
          if (variant.get() === variant.model.COMMENT) {
            variant.set(variant.model.INSTRUCTION_COMMENT)
          }
          this.clearRequiredFromDom()
        },
      },
    },
  },
  fields: {
    code: {
      endEditing: true,
    },
  },
})

/**
 * comment blocks are white.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
edY.DelegateSvg.Stmt.any_stmt.prototype.isWhite = function (block) {
  return this.data.variant.get() === this.data.variant.model.COMMENT
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Stmt.any_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var model = this.data.variant.model
  var current = this.data.variant.get()
  var comment = this.data.comment.toText()
  var code = this.data.code.toText()
  if (code.length > 32) {
    var short_code = code.substring(0, 31)+'…'
  }
  if (comment.length > 32) {
    var short_comment = comment.substring(0, 31)+'…'
  }
  var total = code.length+comment.length
  if (total > 30) {
    var short_code_all = code.substring(0, Math.floor(30 * code.length / total)+2)+'…'
    var short_comment_all = comment.substring(0, Math.floor(30 * comment.length / total)+2)+'…'
  }
  var F = function(content, variant) {
    if (variant !== current) {
      var menuItem = new edY.MenuItem(content, function() {
        block.edy.data.variant.set(variant)
      })
      mgr.addChild(menuItem)
    }
  }
  var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
    edY.Do.createSPAN('# ', 'edy-code-reserved'),
    edY.Do.createSPAN(short_comment || comment || '…', 'edy-code-comment'),
  )
  F(content, model.COMMENT)
  var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
    edY.Do.createSPAN(short_code || code || '…', 'edy-code'),
  )
  F(content, model.INSTRUCTION)
  var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
    edY.Do.createSPAN(short_code_all || code || '…', 'edy-code'),
    edY.Do.createSPAN(' # ', 'edy-code-reserved'),
    edY.Do.createSPAN(short_comment_all || '…' || comment, 'edy-code-comment'),
  )
  F(content, model.INSTRUCTION_COMMENT)
 return edY.DelegateSvg.Stmt.any_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr) || true
}

edY.DelegateSvg.Stmt.T3s = [
  edY.T3.Stmt.pass_stmt,
  edY.T3.Stmt.break_stmt,
  edY.T3.Stmt.continue_stmt,
  edY.T3.Stmt.global_nonlocal_stmt,
  edY.T3.Stmt.expression_stmt,
  edY.T3.Stmt.docstring_top_stmt,
  edY.T3.Stmt.docstring_def_stmt,
  edY.T3.Stmt.del_stmt,
  edY.T3.Stmt.return_stmt,
  edY.T3.Stmt.any_stmt,
]
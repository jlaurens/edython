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

goog.provide('ezP.DelegateSvg.Stmt')

goog.require('ezP.DelegateSvg.List')
goog.require('ezP.DelegateSvg.Expr')
goog.require('ezP.DelegateSvg.Operator')

console.warn('gather fooData -> data.foo')
/**
 * Class for a DelegateSvg, statement block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.makeSubclass('Stmt', {
  data: {
    comment: {
      default: '',
      placeholderText: ezP.Msg.Placeholder.COMMENT,
      validate: function(newValue) {
        return {validated: XRegExp.exec(newValue, ezP.XRE.comment).value || ''}
      },
      synchronize: function(newValue) {
        this.setMainFieldValue(newValue || '', 'comment')
      },
    },
    comment_show: {
      default: false,
      validate: function(newValue) {
        return {validated: newValue} // is it still necessary ?
      },
      synchronize: function(newValue) {
        this.setMainFieldVisible(!!newValue, 'comment_mark')
        this.setMainFieldVisible(!!newValue, 'comment')
      },
    },
  },
  fields: {
    comment_mark: {
      order: -2,
      label: '#',
      css_class: 'ezp-code-reserved',
    },
    comment: {
      order: -1,
      edit: '',
      validate: function(txt) {
        return this.ezp.validateData(goog.isDef(txt)? txt: this.getValue(), 'comment')
      },
      onEndEditing: function() {
        this.ezp.setData(this.getValue(), 'comment')
      },
      placeholder: ezP.Msg.Placeholder.COMMENT,
      css_class: 'ezp-code-comment',
    },
  },
})
ezP.Delegate.Manager.registerAll(ezP.T3.Stmt, ezP.DelegateSvg.Stmt, true)

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * @extends {Blockly.Block}
 * @constructor
 */
ezP.DelegateSvg.Stmt.prototype.preInitSvg = function (block) {
  ezP.DelegateSvg.Stmt.superClass_.preInitSvg.call(this, block)
  this.svgSharpGroup_ = Blockly.utils.createSvgElement('g',
    {'class': 'ezp-sharp-group'}, null)
  goog.dom.insertSiblingAfter(this.svgSharpGroup_, this.svgPathContour_)
}

/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects...
 * @protected
 */
ezP.DelegateSvg.Stmt.prototype.disposeInternal = function () {
  goog.dom.removeNode(this.svgSharpGroup_)
  this.svgSharpGroup_ = undefined
  ezP.DelegateSvg.superClass_.disposeInternal.call(this)
}

/**
 * Statement block path.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Stmt.prototype.statementPathDef_ = function (block) {
  /* eslint-disable indent */
  var w = block.width
  var h = block.height
  var steps = ['m ' + w + ',0 v ' + h]
  var r = ezP.Style.Path.radius()
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

ezP.DelegateSvg.Stmt.prototype.shapePathDef_ =
  ezP.DelegateSvg.Stmt.prototype.contourPathDef_ =
    ezP.DelegateSvg.Stmt.prototype.highlightPathDef_ =
      ezP.DelegateSvg.Stmt.prototype.statementPathDef_

/**
 * Render the leading # character for disabled statement blocks.
 * @param io.
 * @private
 * @override
 */
ezP.DelegateSvg.Stmt.prototype.renderDrawSharp_ = function (io) {
  if (io.block.disabled) {
    var children = goog.dom.getChildren(this.svgSharpGroup_)
    var length = children.length
    if (!length) {
      var y = ezP.Font.totalAscent
      var text = Blockly.utils.createSvgElement('text',
        {'x': 0, 'y': y},
        this.svgSharpGroup_)
      this.svgSharpGroup_.appendChild(text)
      text.appendChild(document.createTextNode('#'))
      length = 1
    }
    var expected = io.block.ezp.getStatementCount(io.block)
    while (length < expected) {
      y = ezP.Font.totalAscent + length * ezP.Font.lineHeight()
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
        ', ' + ezP.Padding.t() + ')')
    io.cursorX += 2*ezP.Font.space
  } else {
    goog.dom.removeChildren(this.svgSharpGroup_)
  }
}

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Stmt.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
    this.renderDrawValueInput_(io)
}

/**
 * Render the inputs of the block.
 * @param {!Blockly.Block} block.
 * @protected
 */
ezP.DelegateSvg.Stmt.prototype.minBlockWidth = function (block) {
  return ezP.Font.tabWidth
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
ezP.DelegateSvg.Stmt.prototype.insertParent = function(block, parentPrototypeName, subtype) {
  var c8n = block.previousConnection
  if (c8n) {
    Blockly.Events.disable()
    var parentBlock = ezP.DelegateSvg.newBlockComplete(block.workspace, parentPrototypeName)
    Blockly.Events.enable()
    var parentC8n = parentBlock.nextConnection
    if (parentC8n) {
      var grouper = new ezP.Events.Grouper()
      try {
        if (Blockly.Events.isEnabled()) {
          Blockly.Events.fire(new Blockly.Events.BlockCreate(parentBlock))
        }
        parentBlock.ezp.data.subtype.set(subtype)
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
        parentBlock.ezp.consolidate(parentBlock, true)
        var holes = ezP.HoleFiller.getDeepHoles(parentBlock)
        ezP.HoleFiller.fillDeepHoles(parentBlock.workspace, holes)
        parentBlock.render()
        c8n.connect(parentC8n)
        if (Blockly.selected === block) {
          parentBlock.select()
        }
      } finally {
        grouper.stop()
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
ezP.DelegateSvg.Stmt.prototype.insertBlockAfter = function(block, belowPrototypeName) {
  var grouper = new ezP.Events.Grouper()
  try {
    var blockAfter = ezP.DelegateSvg.newBlockComplete(block.workspace, belowPrototypeName)
    var c8n = block.nextConnection
    var targetC8n = c8n.targetConnection
    if (targetC8n) {
      targetC8n.disconnect()
      if (targetC8n.checkType_(blockAfter.nextConnection)) {
        targetC8n.connect(blockAfter.nextConnection)
      }
    }
    blockAfter.ezp.consolidate(blockAfter, true)
    var holes = ezP.HoleFiller.getDeepHoles(blockAfter)
    ezP.HoleFiller.fillDeepHoles(blockAfter.workspace, holes)
    blockAfter.render()
    block.nextConnection.connect(blockAfter.previousConnection)
    if (Blockly.selected === block) {
      blockAfter.select()
    }
  } finally {
    grouper.stop()
  }
  return blockAfter
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.prototype.populateContextMenuComment = function (block, mgr) {
  var show = this.data.comment_show.get()
  var value = this.data.value.get()
  var current = this.data.variant.get()
  var content =
  ezP.Do.createSPAN(show? ezP.Msg.Placeholder.REMOVE_COMMENT: ezP.Msg.Placeholder.ADD_COMMENT, null)
  var menuItem = new ezP.MenuItem(content, function() {
    block.ezp.data.comment_show.set(!show)
  })
  mgr.addChild(menuItem, true)
  return true
}

/**
 * Class for a DelegateSvg, pass_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass(ezP.T3.Stmt.pass_stmt, {
  fields: {
    label: 'pass',
  },
})

/**
 * Class for a DelegateSvg, break_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass(ezP.T3.Stmt.break_stmt, {
  fields: {
    label: 'break',
  },
})

/**
 * Class for a DelegateSvg, continue_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass(ezP.T3.Stmt.continue_stmt, {
  fields: {
    label: 'break',
  },
})

////////// gobal/nonlocal statement
/**
 * Class for a DelegateSvg, non_void_identifier_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass(ezP.T3.Expr.non_void_identifier_list, {
  list: {
    check: ezP.T3.Expr.Check.non_void_identifier_list,
    empty: false,
    presep: ',',
  },
})

/**
 * Class for a DelegateSvg, global_nonlocal_expr.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass(ezP.T3.Stmt.global_nonlocal_stmt, {
  data: {
    variant: {
      all: ['global', 'nonlocal'],
      synchronize: function(newValue) {
        this.setMainFieldValue(newValue || '', 'prefix')
      },
    },
  },
  fields: {
    prefix: {
      label: '',
      css_class: 'ezp-code-reserved',
    },
  },
  tiles: {
    identifiers: {
      order: 3,
      css_class: 'ezp-code-reserved',
      wrap: ezP.T3.Expr.non_void_identifier_list,
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.global_nonlocal_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var subtypes = this.data.subtype.getAll()
  var current = block.ezp.data.subtype.get()
  var F = function(key) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN(key, 'ezp-code-reserved'),
      ezP.Do.createSPAN(' …', 'ezp-code-placeholder'),
    )
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.subtype.set(key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(subtypes[0])
  F(subtypes[1])
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.global_nonlocal_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, comment_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass(ezP.T3.Stmt.comment_stmt, {
  data: {
     comment_show: {
      default: true,
      validate: function(newValue) {
        return {validated: true} // is it still necessary ?
      },
      synchronize: function(newValue) {
        this.setMainFieldVisible(true, 'comment_mark')
        this.setMainFieldVisible(true, 'comment')
      },
    },
  },
})

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * @extends {Blockly.Block}
 * @constructor
 */
ezP.DelegateSvg.Stmt.comment_stmt.prototype.preInitSvg = function (block) {
  ezP.DelegateSvg.Stmt.comment_stmt.superClass_.preInitSvg.call(this, block)
  goog.dom.removeNode(this.svgSharpGroup_)
  this.svgSharpGroup_ = undefined
}

/**
 * For comment statements, the comment show is always true.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 # @override
 */
ezP.DelegateSvg.Stmt.prototype.getCommentShow = function (block) {
  return true
}

/**
 * Render the leading # character for commented statement blocks.
 * Statement subclasses must override it.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Stmt.comment_stmt.prototype.renderDrawSharp_ = function (io) {
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.comment_stmt.prototype.populateContextMenuComment = function (block, mgr) {
}

/**
 * comment blocks are white.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
ezP.DelegateSvg.Stmt.comment_stmt.prototype.isWhite = function (block) {
  return true
}

/**
 * Do nothing, comment blocks are allways disabled.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
the code.
 * @override
 * @return None
 */
ezP.DelegateSvg.Stmt.comment_stmt.prototype.setDisabled = function (block, yorn) {
  return
}

/**
 * Class for a DelegateSvg, expression_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass('expression_stmt', {
  tiles: {
    expression: {
      order: 1,
      check: ezP.T3.Expr.Check.expression,
    },
  },
})


/**
 * Class for a DelegateSvg, docstring_top_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass('docstring_top_stmt', {
  tiles: {
    dummy: {
      order: 1,
      wrap: ezP.T3.Expr.longliteral,
      check: ezP.T3.Expr.Check.longliteral,
    },
  },
})

/**
 * docstring blocks are white, to be confirmed.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
ezP.DelegateSvg.Stmt.docstring_top_stmt.prototype.isWhite = ezP.DelegateSvg.Stmt.comment_stmt.prototype.isWhite

/**
 * Class for a DelegateSvg, docstring_def_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass('docstring_def_stmt', {
  tiles: {
    dummy: {
      order: 1,
      wrap: ezP.T3.Expr.longliteral,
      check: ezP.T3.Expr.Check.longliteral,
    },
  },
})

console.warn('if_part and others conform to the new model and xml ?')
/**
 * docstring blocks are white.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
ezP.DelegateSvg.Stmt.docstring_def_stmt.prototype.isWhite = ezP.DelegateSvg.Stmt.comment_stmt.prototype.isWhite

/**
 * Get the subtype of the block.
 * The default implementation does nothing.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is return, when defined or not null.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.Stmt.docstring_top_stmt.prototype.getSubtype = ezP.DelegateSvg.Stmt.docstring_def_stmt.prototype.getSubtype = function (block) {
  var target = this.ui[1].input.connection.targetBlock()
  return target? target.ezp.getSuptype(target): undefined
}

/**
 * Set the subtype of the block.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is expected.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Stmt.docstring_top_stmt.prototype.setSubtype = ezP.DelegateSvg.Stmt.docstring_def_stmt.prototype.setSubtype = function (block, subtype) {
  var target = this.ui[1].input.connection.targetBlock()
  if (target) {
    target.ezp.data.subtype.set(subtype)
  }
  return true
}

/**
 * Class for a DelegateSvg, del_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass('del_stmt', {
  tiles: {
    del: {
      order: 1,
      label: 'del',
      css_class: 'ezp-code-reserved',
      wrap: ezP.T3.Expr.target_list,
    },
  },
})

/**
 * Class for a DelegateSvg, return_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass('return_stmt', {
  tiles: {
    return: {
      order: 1,
      label: 'return',
      css_class: 'ezp-code-reserved',
      wrap: ezP.T3.Expr.expression_list,
    },
  },
})

/**
 * Class for a DelegateSvg, return_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass('any_stmt', {
  fields: {
    prefix: {
      edit: '',
      css_class: 'ezp-code',
    }
  }
})

ezP.DelegateSvg.Stmt.T3s = [
  ezP.T3.Stmt.pass_stmt,
  ezP.T3.Stmt.break_stmt,
  ezP.T3.Stmt.continue_stmt,
  ezP.T3.Stmt.global_nonlocal_stmt,
  ezP.T3.Stmt.comment_stmt,
  ezP.T3.Stmt.expression_stmt,
  ezP.T3.Stmt.docstring_top_stmt,
  ezP.T3.Stmt.docstring_def_stmt,
  ezP.T3.Stmt.del_stmt,
  ezP.T3.Stmt.return_stmt,
  ezP.T3.Stmt.any_stmt,
]
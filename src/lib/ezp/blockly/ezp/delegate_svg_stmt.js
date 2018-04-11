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

/**
 * Class for a DelegateSvg, statement block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.superClass_.constructor.call(this, prototypeName)
  this.statementModel__ = {
    previous: {},
    next: {},
  }

}
goog.inherits(ezP.DelegateSvg.Stmt, ezP.DelegateSvg)

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
 * Convert the block to python code.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @return some python code
 */
ezP.DelegateSvg.Stmt.prototype.toPython = function (block, is_deep) {
  return this.toPythonStatement(block, '', is_deep)
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
    var disabler = new ezP.Events.Disabler()
    var parentBlock = ezP.DelegateSvg.newBlockComplete(block.workspace, parentPrototypeName)
    disabler.stop()
    var parentC8n = parentBlock.nextConnection
    if (parentC8n) {
      Blockly.Events.setGroup(true)
      if (Blockly.Events.isEnabled()) {
        Blockly.Events.fire(new Blockly.Events.BlockCreate(parentBlock))
      }
      try {
        parentBlock.ezp.setSubtype(parentBlock, subtype)
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
ezP.DelegateSvg.Stmt.prototype.insertBlockAfter = function(block, belowPrototypeName) {
  Blockly.Events.setGroup(true)
  var blockAfter = ezP.DelegateSvg.newBlockComplete(block.workspace, belowPrototypeName)
  var c8n = block.nextConnection
  var targetC8n = c8n.targetConnection
  if (targetC8n) {
    targetC8n.disconnect()
    targetConnection.connect(blockAfter.previousConnection)
  }
  blockAfter.ezp.consolidate(blockAfter, true)
  var holes = ezP.HoleFiller.getDeepHoles(blockAfter)
  ezP.HoleFiller.fillDeepHoles(blockAfter.workspace, holes)
  blockAfter.render()
  block.nextConnection.connect(blockAfter.previousConnection)
  if (Blockly.selected === block) {
    blockAfter.select()
  }
  Blockly.Events.setGroup(false)
  return blockAfter
}

//////////////////// blocks  //////////////////////////////
/**
 * Class for a DelegateSvg, annotated_assignment_stmt.
 * Python 3.6 feature.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.annotated_assignment_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.annotated_assignment_stmt.superClass_.constructor.call(this, prototypeName)
  //annotated_assignment_stmt ::=  augtarget ":" expression ["=" expression]
  this.model__.input = {
    m_1: {
      key: ezP.Key.TARGET,
      check: ezP.T3.Expr.Check.augtarget
    },
    m_2: {
      key: ezP.Key.ANNOTATED,
      check: ezP.T3.Expr.Check.expression,
      label: ':'
    },
    m_3: {
      key: ezP.Key.ASSIGNED,
      check: ezP.T3.Expr.Check.expression,
      operator: '='
    }
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.annotated_assignment_stmt, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register('annotated_assignment_stmt')

/**
 * Class for a DelegateSvg, two optional values and a label.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.Two = function (prototypeName) {
  ezP.DelegateSvg.Stmt.Two.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Stmt.Two, ezP.DelegateSvg.Stmt)


/**
 * Prepare the inputs.
 * The default implementation does nothing.
 * Subclassers may enable/disable an input
 * depending on the context.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Stmt.Two.prototype.consolidate = function (block, deep) {
  ezP.DelegateSvg.Stmt.Two.superClass_.consolidate.call(this, block, deep)
  var first = this.uiModel.m_1.input
  var last  = this.uiModel.m_3.input
  var connected = last.connection.isConnected()
  this.setInputEnabled(block, last, first.connection.isConnected() || connected)
  if (connected) {
    if (last.fieldRow.length == 0) {
      last.appendField(last.fields.label, ezP.Key.LAST+'.'+ezP.Key.LABEL)
    }
  } else if (last.fieldRow.length > 0) {
    last.removeField(ezP.Key.LAST+'.'+ezP.Key.LABEL)
  }
  var ezp = first.connection.ezp
  if (!ezp.optional_0) {
    ezp.optional_0 = [ezp.optional_]
  }
  ezp.optional_ = ezp.optional_0[0] && !connected
}

/**
 * Class for a DelegateSvg, pass_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.pass_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.pass_stmt.superClass_.constructor.call(this, prototypeName)
  this.model__.input.m_1 = {
    label: 'pass',
    css_class: 'ezp-code-reserved',
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.pass_stmt, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register('pass_stmt')

/**
 * Class for a DelegateSvg, break_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.break_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.break_stmt.superClass_.constructor.call(this, prototypeName)
  this.model__.input.m_1 = {
    label: 'break',
    css_class: 'ezp-code-reserved',
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.break_stmt, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register('break_stmt')

/**
 * Class for a DelegateSvg, continue_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.continue_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.continue_stmt.superClass_.constructor.call(this, prototypeName)
  this.model__.input.m_1 = {
    label: 'continue',
    css_class: 'ezp-code-reserved',
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.continue_stmt, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register('continue_stmt')

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
ezP.DelegateSvg.Expr.non_void_identifier_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.non_void_identifier_list.superClass_.constructor.call(this, prototypeName)
  this.model__.input.list = {
    check: ezP.T3.Expr.Check.non_void_identifier_list,
    empty: false,
    sep: ',',
  }
  this.outputModel__ = {
    check: ezP.T3.Expr.non_void_identifier_list,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.non_void_identifier_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('non_void_identifier_list')

/**
 * Class for a DelegateSvg, global_nonlocal_expr.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.global_nonlocal_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.global_nonlocal_stmt.superClass_.constructor.call(this, prototypeName)
  this.model__.input.operators = ['global', 'nonlocal']
  this.model__.input.m_3 = {
    key: ezP.Key.LIST,
    label: this.model__.input.operators[0],
    css_class: 'ezp-code-reserved',
    wrap: ezP.T3.Expr.non_void_identifier_list,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.global_nonlocal_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('global_nonlocal_stmt')

ezP.MixinSvg(ezP.DelegateSvg.Stmt.global_nonlocal_stmt, ezP.MixinSvg.Operator)

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
ezP.DelegateSvg.Stmt.global_nonlocal_stmt.prototype.getMenuTarget = function(block) {
  return block
}

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Stmt.global_nonlocal_stmt.prototype.getContent = function (block, op) {
  return goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    ezP.Do.createSPAN(op, 'ezp-code-reserved'),
    ezP.Do.createSPAN(' …'),
  )
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.global_nonlocal_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var yorn = mgr.populateOperator(block)
  return ezP.DelegateSvg.Stmt.global_nonlocal_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!ezP.MenuManager} mgr mgr.menu is the Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Stmt.global_nonlocal_stmt.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  
  return mgr.handleActionOperator(block,event) || ezP.DelegateSvg.Stmt.global_nonlocal_stmt.superClass_.handleMenuItemActionFirst.call(this, block, mgr, event)
}

/**
 * Class for a DelegateSvg, comment_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.comment_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.comment_stmt.superClass_.constructor.call(this, prototypeName)
  this.model__.input.m_1 = {
    label: '# ',
    css_class: 'ezp-code-reserved',
  }
  this.model__.input.m_3 = {
    comment: 'comment',
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.comment_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('comment_stmt')

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
 * Render the leading # character for commented statement blocks.
 * Statement subclasses must override it.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Stmt.comment_stmt.prototype.renderDrawSharp_ = function (io) {
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
 * @return None
 */
ezP.DelegateSvg.Stmt.comment_stmt.prototype.setDisabled = function (block, yorn) {
  return
}

/**
 * Get the subtype of the block.
 * The default implementation does nothing.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is return, when defined or not null.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.Stmt.comment_stmt.prototype.getSubtype = function (block) {
  return block.ezp.uiModel.m_3.fields.comment.getValue()
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
ezP.DelegateSvg.Stmt.comment_stmt.prototype.setSubtype = function (block, subtype) {
  block.ezp.uiModel.m_3.fields.comment.setValue(subtype)
  return true
}

/**
 * Show the editor for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
ezP.DelegateSvg.Stmt.comment_stmt.prototype.showEditor = function (block) {
  block.ezp.uiModel.m_3.fields.comment.showEditor_()
}

/**
 * Class for a DelegateSvg, expression_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.expression_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.expression_stmt.superClass_.constructor.call(this, prototypeName)
  this.model__.input.m_1 = {
    key: ezP.Key.EXPRESSION,
    check: ezP.T3.Expr.Check.expression,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.expression_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('expression_stmt')


/**
 * Class for a DelegateSvg, docstring_top_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.docstring_top_stmt =
ezP.DelegateSvg.Stmt.docstring_def_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.docstring_top_stmt.superClass_.constructor.call(this, prototypeName)
  this.model__.input.m_1 = {
    key: ezP.Key.WRAP,
    wrap: ezP.T3.Expr.longstringliteral,
  }
  this.statementModel__.previous.check = ezP.T3.Stmt.Previous.docstring_top_stmt
  this.statementModel__.next.check = ezP.T3.Stmt.Next.docstring_top_stmt
}
goog.inherits(ezP.DelegateSvg.Stmt.docstring_top_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('docstring_top_stmt')

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
ezP.DelegateSvg.Stmt.docstring_def_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.docstring_def_stmt.superClass_.constructor.call(this, prototypeName)
  this.model__.input.m_1 = {
    key: ezP.Key.WRAP,
    wrap: ezP.T3.Expr.longstringliteral,
  }
  this.statementModel__.previous.check = ezP.T3.Stmt.Previous.docstring_def_stmt
  this.statementModel__.next.check = ezP.T3.Stmt.Next.docstring_def_stmt
}
goog.inherits(ezP.DelegateSvg.Stmt.docstring_def_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('docstring_def_stmt')

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
  var wrapped = this.uiModel.m_1.input.connection.targetBlock()
  return wrapped? wrapped.ezp.getSuptype(wrapped): undefined
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
  var wrapped = this.uiModel.m_1.input.connection.targetBlock()
  if (wrapped) {
    wrapped.ezp.setSubtype(wrapped, subtype)
  }
  return true
}

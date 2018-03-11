/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
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
  this.statementModel_ = {
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
    ezP.DelegateSvg.Stmt.prototype.highlightedPathDef_ =
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
    var expected = io.block.getStatementCount()
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
  this.inputModel_ = {
    first: {
      key: ezP.Key.TARGET,
      check: ezP.T3.Expr.Check.augtarget
    },
    middle: {
      key: ezP.Key.ANNOTATED,
      check: ezP.T3.Expr.Check.expression,
      label: ':'
    },
    last: {
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
ezP.DelegateSvg.Stmt.Two.prototype.consolidate = function (block) {
  ezP.DelegateSvg.Stmt.Two.superClass_.consolidate.call(this, block)
  var first = this.inputs.first.input
  var last  = this.inputs.last.input
  var connected = last.connection.isConnected()
  this.setInputEnabled(block, last, first.connection.isConnected() || connected)
  if (connected) {
    if (last.fieldRow.length == 0) {
      last.appendField(last.fieldLabel, ezP.Key.LAST+'.'+ezP.Const.Field.LABEL)
    }
  } else if (last.fieldRow.length > 0) {
    last.removeField(ezP.Key.LAST+'.'+ezP.Const.Field.LABEL)
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
  this.inputModel_.first = {
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
  this.inputModel_.first = {
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
  this.inputModel_.first = {
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
  this.inputModel_.list = {
    check: ezP.T3.Expr.Check.non_void_identifier_list,
    empty: false,
    sep: ',',
  }
  this.outputModel_.check = ezP.T3.Expr.non_void_identifier_list
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
  this.operators = ['global', 'nonlocal']
  this.inputModel_.last = {
    key: ezP.Key.LIST,
    label: this.operators[0],
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
  this.inputModel_.first = {
    label: '# ',
    css_class: 'ezp-code-reserved',
  }
  this.inputModel_.last = {
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
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Stmt.comment_stmt.prototype.initBlock = function (block) {
  ezP.DelegateSvg.Stmt.comment_stmt.superClass_.initBlock.call(this, block)
  block.nextConnection.ezp.getCheck = function() {
    var c8n = block.previousConnection.targetConnection
    return c8n? c8n.ezp.getCheck(): null
  }
  block.previousConnection.ezp.getCheck = function() {
    var c8n = block.nextConnection.targetConnection
    return c8n? c8n.ezp.getCheck(): null
  }
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
  this.inputModel_.first = {
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
  this.inputModel_.first = {
    key: ezP.Key.WRAP,
    wrap: ezP.T3.Expr.docstring,
  }
  this.statementModel_.previous.check = ezP.T3.Stmt.Previous.docstring_top_stmt
  this.statementModel_.next.check = ezP.T3.Stmt.Next.docstring_top_stmt
}
goog.inherits(ezP.DelegateSvg.Stmt.docstring_top_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('docstring_top_stmt')

/**
 * Class for a DelegateSvg, docstring_def_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.docstring_def_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.docstring_def_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.WRAP,
    wrap: ezP.T3.Expr.docstring,
  }
  this.statementModel_.previous.check = ezP.T3.Stmt.Previous.docstring_def_stmt
  this.statementModel_.next.check = ezP.T3.Stmt.Next.docstring_def_stmt
}
goog.inherits(ezP.DelegateSvg.Stmt.docstring_def_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('docstring_def_stmt')


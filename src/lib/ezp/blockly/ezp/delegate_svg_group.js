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

goog.provide('ezP.DelegateSvg.Group')

goog.require('ezP.DelegateSvg.Stmt')

/**
 * Class for a DelegateSvg, statement block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Group = function (prototypeName) {
  ezP.DelegateSvg.Group.superClass_.constructor.call(this, prototypeName)
  this.statementModel_.key = ezP.Key.DO
  this.inputModel_.last = {
    label: ':',
  }
}
goog.inherits(ezP.DelegateSvg.Group, ezP.DelegateSvg.Stmt)

/**
 * Block path.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Group.prototype.groupShapePathDef_ = function (block) {
  /* eslint-disable indent */
  var w = block.width
  var line = ezP.Font.lineHeight()
  var h = block.isCollapsed() ? 2 * line : block.height
  var steps = ['m ' + w + ',0 v ' + line]
  h -= line
  var r = ezP.Style.Path.radius()
  var a = ' a ' + r + ', ' + r + ' 0 0 0 '
  var t = ezP.Font.tabWidth
  w -= t + r
  steps.push('h ' + (-w))
  steps.push(a + (-r) + ',' + r)
  h -= 2 * r// Assuming 2*r<line height...
  steps.push(' v ' + h)
  steps.push(a + r + ',' + r)
  a = ' a ' + r + ', ' + r + ' 0 0 1 '
  if (this.hasNextStatement_(block)) {
    steps.push('h ' + (-t - r))
  } else {
    steps.push('h ' + (-t) + a + (-r) + ',' + (-r))
    h -= r
  }
  if (this.hasPreviousStatement_(block)) {
    steps.push('V 0 z')
  } else {
    steps.push('V ' + r + a + r + ',' + (-r) + ' z')
  }
  return steps.join(' ')
} /* eslint-enable indent */

/**
 * Block path.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Group.prototype.groupContourPathDef_ = function (block) {
  /* eslint-disable indent */
  var w = block.width
  var line = ezP.Font.lineHeight()
  var h = block.isCollapsed() ? 2 * line : block.height
  var t = ezP.Font.tabWidth
  var r = ezP.Style.Path.radius()
  var a = ' a ' + r + ', ' + r + ' 0 0 0 '
  var previous = this.hasPreviousStatement_(block)
  var next = this.hasNextStatement_(block)
  if (previous) {
    steps = ['m 0,0 h ' + w]
  } else {
    steps = ['m ' + r + ',0 h ' + (w - r)]
  }
  steps.push('v ' + line)
  h -= line
  w -= t + r
  steps.push('h ' + (-w))
  steps.push(a + (-r) + ',' + r)
  h -= 2 * r// Assuming 2*r<line height...
  steps.push(' v ' + h)
  steps.push(a + r + ',' + r)
  a = ' a ' + r + ', ' + r + ' 0 0 1 '
  if (next) {
    steps.push('h ' + (-t - r))
  } else {
    steps.push('h ' + (-t) + a + (-r) + ',' + (-r))
    h -= r
  }
  if (previous) {
    steps.push('V 0')
  } else {
    steps.push('V ' + r + a + r + ',' + (-r))
  }
  return steps.join(' ')
} /* eslint-enable indent */

/**
 * Block path.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Group.prototype.collapsedPathDef_ = function (block) {
  /* eslint-disable indent */
  if (block.isCollapsed()) {
    var line = ezP.Font.lineHeight()
    var t = ezP.Font.tabWidth
    var r = ezP.Style.Path.radius()
    return 'm ' + block.width + ',' + line + ' v ' + (line - r) / 2 +
    ' m -' + r + ',' + r / 2 + ' l ' + 2 * r + ',' + (-r) +
    ' M ' + (t + r) + ',' + (2 * line) + ' H ' + block.width + ' v ' + (r - line) / 2 +
    ' m -' + r + ',' + r / 2 + ' l ' + 2 * r + ',' + (-r)
  }
  return ezP.DelegateSvg.Group.superClass_.collapsedPathDef_.call(this, block)
} /* eslint-enable indent */

ezP.DelegateSvg.Group.prototype.shapePathDef_ =
  ezP.DelegateSvg.Group.prototype.contourPathDef_ =
    ezP.DelegateSvg.Group.prototype.highlightedPathDef_ =
      ezP.DelegateSvg.Group.prototype.groupShapePathDef_

/**
 * Render an input of a group block.
 * @param io parameter.
 * @private
 */
ezP.DelegateSvg.Group.prototype.renderDrawNextStatementInput_ = function (io) {
  /* eslint-disable indent */
  if (!io.canStatement || io.input.type !== Blockly.NEXT_STATEMENT) {
    return false
  }
  io.MinMaxCursorX = 2 * ezP.Font.tabWidth
  io.canStatement = false
  var c8n = io.input.connection
      // this must be the last one
  if (c8n) {
    c8n.setOffsetInBlock(ezP.Font.tabWidth, ezP.Font.lineHeight())
    if (c8n.isConnected()) {
      var target = c8n.targetBlock()
      var root = target.getSvgRoot()
      if (root) {
        target.render()
      }
    }
    io.block.height = ezP.Font.lineHeight() * io.block.ezp.getStatementCount(io.block)
  }
  return true
} /* eslint-enable indent */

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Group.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
    this.renderDrawValueInput_(io) ||
      this.renderDrawNextStatementInput_(io)
}

/**
 * @param {!Blockly.Connection} c8n The connection to highlight.
 */
ezP.DelegateSvg.Group.prototype.highlightConnection = function (c8n) {
  var steps
  var block = c8n.sourceBlock_
  if (c8n.type === Blockly.INPUT_VALUE) {
    if (c8n.isConnected()) {
      steps = this.valuePathDef_(c8n.targetBlock())
    } else {
      steps = this.placeHolderPathDefWidth_(0).d
    }
  } else if (c8n.type === Blockly.OUTPUT_VALUE) {
    steps = 'm 0,0 ' + Blockly.BlockSvg.TAB_PATH_DOWN + ' v 5'
  } else if (c8n.type === Blockly.NEXT_STATEMENT) {
    var r = ezP.Style.Path.Selected.width / 2
    var a = ' a ' + r + ',' + r + ' 0 0 0 0,'
    if (c8n.offsetInBlock_.x > 0) {
      steps = 'm 0,' + (-r) + a + (2 * r) + ' h ' + (block.width - ezP.Font.tabWidth) + a + (-2 * r) + ' z'
    } else {
      steps = 'm 0,' + (-r) + a + (2 * r) + ' h ' + (ezP.Font.tabWidth + ezP.Style.Path.radius()) + a + (-2 * r) + ' z'
    }
  } else if (c8n.type === Blockly.PREVIOUS_STATEMENT) {
    r = ezP.Style.Path.Selected.width / 2
    a = ' a ' + r + ',' + r + ' 0 0 0 0,'
    if (c8n.offsetInBlock_.x > 0) {
      steps = 'm 0,' + (-r) + a + (2 * r) + ' h ' + (block.width - ezP.Font.tabWidth) + a + (-2 * r) + ' z'
    } else {
      steps = 'm 0,' + (-r) + a + (2 * r) + ' h ' + (ezP.Font.tabWidth + ezP.Style.Path.radius()) + a + (-2 * r) + ' z'
    }
  }
  var xy = block.getRelativeToSurfaceXY()
  var x = c8n.x_ - xy.x
  var y = c8n.y_ - xy.y
  Blockly.Connection.highlightedPath_ =
  Blockly.utils.createSvgElement('path',
    {'class': 'blocklyHighlightedConnectionPath',
      'd': steps,
      transform: 'translate(' + x + ',' + y + ')'},
    c8n.sourceBlock_.getSvgRoot())
}

/**
 * Class for a DelegateSvg, if_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.if_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.if_part.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    label: 'if',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.expression,
    key: ezP.Key.COND,
  }
  this.statementModel_.previous.check = ezP.T3.Stmt.Previous.if_part
  this.statementModel_.next.check = ezP.T3.Stmt.Next.if_part
}
goog.inherits(ezP.DelegateSvg.Stmt.if_part, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register('if_part')

/**
 * Class for a DelegateSvg, elif_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.elif_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.elif_part.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    label: 'elif',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.expression,
    key: ezP.Key.COND,
  }
  this.statementModel_.previous.check = ezP.T3.Stmt.Previous.elif_part
  this.statementModel_.next.check = ezP.T3.Stmt.Next.elif_part
}
goog.inherits(ezP.DelegateSvg.Stmt.elif_part, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register('elif_part')

/**
 * Class for a DelegateSvg, else_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * The else block connection model is more complex than for other blocks.
 * Where can this block appear?
 * - after an if or an elif
 * - after a for
 * - after a while
 * - after and except
 * - before a finally
 * It is always the last box of the sequence, except when before a finally
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.else_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.else_part.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    label: 'else',
    css_class: 'ezp-code-reserved',
  }
  this.statementModel_.previous = {
    check: ezP.T3.Stmt.Previous.else_part,
    didConnect: function(oldTargetConnection, oldConnection) {
      var block = this.connection.getSourceBlock()
      block.ezp.consolidateType(block)
    },
    didDisconnect: function(oldConnection) {
      var block = this.connection.getSourceBlock()
      block.ezp.consolidateType(block)
    },
  }
  this.statementModel_.next = {
    check: ezP.T3.Stmt.Next.else_part,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.else_part, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register('else_part')

/**
 * This block may have one of 3 types: else_part, last_else_part, try_else_part.
 * else_part covers both last_else_part and try_else_part.
 * If the block cannot be of type last_else_part, then its type is try_else_part
 * and conversely. If the block can be of both types, then it is of type else_part.
 * First the previous connection tries to constrain the type,
 * then the next connection.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.else_part.prototype.consolidateType = function (block) {
  var T3 = ezP.T3.Stmt
  var expected = T3.else_part
  var P = T3.Previous.else_part
  var N = T3.Next.else_part
  var targetConnection
  if ((targetConnection = block.previousConnection.targetConnection)) {
    var target = targetConnection.getSourceBlock()
    if ((targetConnection.check_ && targetConnection.check_.indexOf(T3.last_else_part)<0) || (T3.Previous.last_else_part && T3.Previous.last_else_part.indexOf(target.type) < 0)) {
      expected = T3.try_else_part
      P = T3.Previous.try_else_part
      N = T3.Next.try_else_part
    } else if ((targetConnection.check_ && targetConnection.check_.indexOf(T3.try_else_part)<0) || (T3.Previous.try_else_part && T3.Previous.try_else_part.indexOf(target.type) < 0)) {
      expected = T3.last_else_part
      P = T3.Previous.last_else_part
      N = T3.Next.last_else_part
    }
  } else if ((targetConnection = block.nextConnection.targetConnection)) {
    // the previous connection did not add any constrain
    // may be the next connection will?
    var target = targetConnection.getSourceBlock()
    if ((targetConnection.check_ && targetConnection.check_.indexOf(T3.last_else_part)<0) || (T3.Next.last_else_part && T3.Next.last_else_part.indexOf(target.type) < 0)) {
      expected = T3.try_else_part
      P = T3.Previous.try_else_part
      N = T3.Next.try_else_part
    } else if ((targetConnection.check_ && targetConnection.check_.indexOf(T3.try_else_part)<0) || (T3.Next.try_else_part && T3.Next.try_else_part.indexOf(target.type) < 0)) {
      expected = T3.last_else_part
      P = T3.Previous.last_else_part
      N = T3.Next.last_else_part
    }
  }
  if (block.type !== expected) {
    block.type = expected
    this.setupType(block)
    block.previousConnection.setCheck(P)
    block.nextConnection.setCheck(N)
  }
}

/**
 * Class for a DelegateSvg, while_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.while_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.while_part.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    label: 'while',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.expression,
    key: ezP.Key.COND,
  }
  this.statementModel_.previous.check = ezP.T3.Stmt.Previous.while_part
  this.statementModel_.next.check = ezP.T3.Stmt.Next.while_part
}
goog.inherits(ezP.DelegateSvg.Stmt.while_part, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register('while_part')

/**
 * Class for a DelegateSvg, asyncable block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Group.Async = function (prototypeName) {
  ezP.DelegateSvg.Group.Async.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Group.Async, ezP.DelegateSvg.Group)

/**
 * Get the 'async' field.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Group.Async.prototype.getFieldAsync = function (block) {
  var input = this.inputs.first
  return input? input.fieldAsync: undefined
}

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Group.Async.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Group.Async.superClass_.willRender_.call(this, block)
  var field = this.getFieldAsync(block)
  if (field) {
    var text = field.getText()
    field.setVisible(text && text.length)
  }
}

/**
 * Whether the block has an 'async' prefix.
 * @param {!Blockly.Block} block The block owning the receiver.
 * @return yes or no
 */
ezP.DelegateSvg.Group.Async.prototype.asynced = function (block) {
  var field = this.getFieldAsync(block)
  if (field) {
    var attribute = field.getText()
    if (attribute && attribute.length>4) {
      return true
    }
  }
  return false
}

/**
 * Records the prefix as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Group.Async.prototype.toDom = function (block, element) {
  ezP.DelegateSvg.Group.Async.superClass_.toDom.call(this, block, element)
  var field = this.getFieldAsync(block)
  if (field) {
    var attribute = field.getText()
    if (attribute && attribute.length>4) {
      element.setAttribute('async', 'true')
    }
  }
}

/**
 * Set the prefix from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Group.Async.prototype.fromDom = function (block, element) {
  ezP.DelegateSvg.Group.Async.superClass_.fromDom.call(this, block, element)
  var field = this.getFieldAsync(block)
  if (field) {
    var attribute = element.getAttribute('async')
    if (attribute && attribute.toLowerCase() === 'true') {
      field.setText('async ')
    }
  }
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Group.Async.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var field = this.getFieldAsync(block)
  if (field) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('async', 'ezp-code-reserved'),
      goog.dom.createTextNode(' '+ezP.Msg.AT_THE_LEFT),
    )
    var old = field.getValue()
    if (old && old.length > 4) {
      mgr.addRemoveChild(new ezP.MenuItem(content, function() {
        field.setValue('')
      }))
      mgr.shouldSeparateRemove()
    } else {
      mgr.addInsertChild(new ezP.MenuItem(content, function() {
        field.setValue('async ')
      }))
      mgr.shouldSeparateInsert()
    }
  }
  return ezP.DelegateSvg.Group.Async.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

/**
 * Class for a DelegateSvg, for_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.for_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.for_part.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    asyncable: true,
    label: 'for',
    css_class: 'ezp-code-reserved',
    wrap: ezP.T3.Expr.target_list,
    key: ezP.Key.FOR,
  }
  this.inputModel_.middle = {
    label: 'in',
    css_class: 'ezp-code-reserved',
    wrap: ezP.T3.Expr.expression_list,
    key: ezP.Key.IN,
  }
  this.statementModel_.previous.check = ezP.T3.Stmt.Previous.for_part
  this.statementModel_.next.check = ezP.T3.Stmt.Next.for_part
}
goog.inherits(ezP.DelegateSvg.Stmt.for_part, ezP.DelegateSvg.Group.Async)
ezP.DelegateSvg.Manager.register('for_part')

/**
 * Class for a DelegateSvg, with_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.with_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.with_part.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.LIST,
    asyncable: true,
    label: 'with',
    css_class: 'ezp-code-reserved',
    wrap: ezP.T3.Expr.with_item_list,
  }
  this.statementModel_.previous.check = ezP.T3.Stmt.Previous.with_part
  this.statementModel_.next.check = ezP.T3.Stmt.Next.with_part
}
goog.inherits(ezP.DelegateSvg.Stmt.with_part, ezP.DelegateSvg.Group.Async)
ezP.DelegateSvg.Manager.register('with_part')

/**
 * Class for a DelegateSvg, with_item_concrete block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.with_item_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.with_item_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputModel_ = {
    first: {
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    last: {
      key: ezP.Key.TARGET,
      label: 'as',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.target,
      hole_value: 'target',
    },
  }
}
goog.inherits(ezP.DelegateSvg.Expr.with_item_concrete, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('with_item_concrete')

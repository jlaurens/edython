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
  this.statementData_.key = ezP.Const.Input.DO,
  this.inputData_.first = {
    label: ':',
  }
}
goog.inherits(ezP.DelegateSvg.Group, ezP.DelegateSvg.Stmt)

/**
 * Whether the block has a previous bounded statement.
 * @param {!Block} block.
 * @private
 */
ezP.Delegate.prototype.hasPreviousBoundedStatement_ = function (block) {
  if (block.type === ezP.T3.Stmt.elif_part || block.type === ezP.T3.Stmt.else_part) {
    var c8n = block.previousConnection
    if (c8n) {
      var target = c8n.targetBlock()
      if (target) {
        return target.type === ezP.T3.Stmt.if_part ||
          target.type === ezP.T3.Stmt.elif_part ||
            target.type === ezP.T3.Stmt.while_part ||
              target.type === ezP.T3.Stmt.for_part
      }
    }
  }
  return false
}

/**
 * Whether the block has a next bounded statement.
 * @param {!Block} block.
 * @private
 */
ezP.Delegate.prototype.hasNextBoundedStatement_ = function (block) {
  try {
    var target = c8n.targetBlock().nextConnection
    return target.type === ezP.T3.Stmt.elif_part ||
    target.type === ezP.T3.Stmt.else_part
  }
  catch (err) {
    return false
  }
}
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
  var previousBounded = this.hasPreviousBoundedStatement_(block)
  var nextBounded = this.hasNextBoundedStatement_(block)
  var previous = this.hasPreviousStatement_(block)
  var next = this.hasNextStatement_(block)
  if (previousBounded) {
    var steps = ['m ' + t + ', ' + (-r) + a + r + ', ' + r + ' h ' + (w - t - r)]
  } else if (previous) {
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
  if (nextBounded) {
    steps.push('m ' + (-t - r) + ',0')
  } else if (next) {
    steps.push('h ' + (-t - r))
  } else {
    steps.push('h ' + (-t) + a + (-r) + ',' + (-r))
    h -= r
  }
  if (previousBounded || previous) {
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
    io.block.height = ezP.Font.lineHeight() * io.block.getStatementCount()
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
  this.inputData_.first = {
    label: 'if',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.expression,
    key: ezP.Const.Input.COND,
  }
  this.statementData_.previous.check = ezP.T3.Stmt.Previous.if_part
  this.statementData_.next.check = ezP.T3.Stmt.Next.if_part
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
  this.inputData_.first = {
    label: 'elif',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.expression,
    key: ezP.Const.Input.COND,
  }
  this.statementData_.previous.check = ezP.T3.Stmt.Previous.elif_part
  this.statementData_.next.check = ezP.T3.Stmt.Next.elif_part
}
goog.inherits(ezP.DelegateSvg.Stmt.elif_part, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register('elif_part')

/**
 * Class for a DelegateSvg, else_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.else_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.else_part.superClass_.constructor.call(this, prototypeName)
  this.inputData_.first = {
    dummy: true,
    label: 'else',
    css_class: 'ezp-code-reserved',
  }
  this.statementData_.previous.check = ezP.T3.Stmt.Previous.else_part
  this.statementData_.next.check = ezP.T3.Stmt.Next.else_part
}
goog.inherits(ezP.DelegateSvg.Stmt.else_part, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register('else_part')

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
  this.inputData_.first = {
    label: 'while',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.expression,
    key: ezP.Const.Input.COND,
  }
  this.statementData_.previous.check = ezP.T3.Stmt.Previous.while_part
  this.statementData_.next.check = ezP.T3.Stmt.Next.while_part
}
goog.inherits(ezP.DelegateSvg.Stmt.while_part, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register('while_part')

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
  this.inputData_ = {
    first: {
      label: 'for',
      css_class: 'ezp-code-reserved',
      wrap: ezP.T3.Expr.target_list,
      key: ezP.Const.Input.FOR,
    },
    middle: {
      label: 'in',
      css_class: 'ezp-code-reserved',
      wrap: ezP.T3.Expr.expression_list,
      key: ezP.Const.Input.IN,
    }
  }
  this.statementData_.previous.check = ezP.T3.Stmt.Previous.for_part
  this.statementData_.next.check = ezP.T3.Stmt.Next.for_part
}
goog.inherits(ezP.DelegateSvg.Stmt.for_part, ezP.DelegateSvg.Group)
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
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.LIST,
      label: 'with',
      css_class: 'ezp-code-reserved',
      wrap: ezP.T3.Expr.with_item_list,
    }
  }
  this.statementData_.previous.check = ezP.T3.Stmt.Previous.with_part
  this.statementData_.next.check = ezP.T3.Stmt.Next.with_part
}
goog.inherits(ezP.DelegateSvg.Stmt.with_part, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register('with_part')

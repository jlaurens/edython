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

goog.provide('edY.DelegateSvg.Group')

goog.require('edY.DelegateSvg.Stmt')

/**
 * Class for a DelegateSvg, statement block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Stmt.makeSubclass('Group', {
  fields: {
    suffix: ':',
  },
  statement: {
    suite: {},
  },
}, edY.DelegateSvg)

/**
 * Block path.
 * @param {!Blockly.Block} block.
 * @private
 */
edY.DelegateSvg.Group.prototype.groupShapePathDef_ = function (block) {
  /* eslint-disable indent */
  var w = block.width
  var line = edY.Font.lineHeight()
  var h = block.isCollapsed() ? 2 * line : block.height
  var steps = ['m ' + w + ',0 v ' + line]
  h -= line
  var r = edY.Style.Path.radius()
  var a = ' a ' + r + ', ' + r + ' 0 0 0 '
  var t = edY.Font.tabWidth
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
edY.DelegateSvg.Group.prototype.groupContourPathDef_ = function (block) {
  /* eslint-disable indent */
  var w = block.width
  var line = edY.Font.lineHeight()
  var h = block.isCollapsed() ? 2 * line : block.height
  var t = edY.Font.tabWidth
  var r = edY.Style.Path.radius()
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
edY.DelegateSvg.Group.prototype.collapsedPathDef_ = function (block) {
  /* eslint-disable indent */
  if (block.isCollapsed()) {
    var line = edY.Font.lineHeight()
    var t = edY.Font.tabWidth
    var r = edY.Style.Path.radius()
    return 'm ' + block.width + ',' + line + ' v ' + (line - r) / 2 +
    ' m -' + r + ',' + r / 2 + ' l ' + 2 * r + ',' + (-r) +
    ' M ' + (t + r) + ',' + (2 * line) + ' H ' + block.width + ' v ' + (r - line) / 2 +
    ' m -' + r + ',' + r / 2 + ' l ' + 2 * r + ',' + (-r)
  }
  return edY.DelegateSvg.Group.superClass_.collapsedPathDef_.call(this, block)
} /* eslint-enable indent */

edY.DelegateSvg.Group.prototype.shapePathDef_ =
  edY.DelegateSvg.Group.prototype.contourPathDef_ =
    edY.DelegateSvg.Group.prototype.highlightPathDef_ =
      edY.DelegateSvg.Group.prototype.groupShapePathDef_

/**
 * Render an input of a group block.
 * @param io parameter.
 * @private
 */
edY.DelegateSvg.Group.prototype.renderDrawNextStatementInput_ = function (io) {
  /* eslint-disable indent */
  if (!io.canStatement || io.input.type !== Blockly.NEXT_STATEMENT) {
    return false
  }
  io.MinMaxCursorX = 2 * edY.Font.tabWidth
  io.canStatement = false
  var c8n = io.input.connection
      // this must be the last one
  if (c8n) {
    c8n.setOffsetInBlock(edY.Font.tabWidth, edY.Font.lineHeight())
    if (c8n.isConnected()) {
      var target = c8n.targetBlock()
      var root = target.getSvgRoot()
      if (root) {
        target.render()
      }
    }
    io.block.height = edY.Font.lineHeight() * io.block.edy.getStatementCount(io.block)
  }
  return true
} /* eslint-enable indent */

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
edY.DelegateSvg.Group.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
    this.renderDrawValueInput_(io) ||
      this.renderDrawNextStatementInput_(io)
}

/**
 * @param {!Blockly.Connection} c8n The connection to highlight.
 */
edY.DelegateSvg.Group.prototype.highlightConnection = function (block, c8n) {
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
    var r = edY.Style.Path.Selected.width / 2
    var a = ' a ' + r + ',' + r + ' 0 0 0 0,'
    if (c8n.offsetInBlock_.x > 0) {
      steps = 'm 0,' + (-r) + a + (2 * r) + ' h ' + (block.width - edY.Font.tabWidth) + a + (-2 * r) + ' z'
    } else {
      steps = 'm 0,' + (-r) + a + (2 * r) + ' h ' + (edY.Font.tabWidth + edY.Style.Path.radius()) + a + (-2 * r) + ' z'
    }
  } else if (c8n.type === Blockly.PREVIOUS_STATEMENT) {
    r = edY.Style.Path.Selected.width / 2
    a = ' a ' + r + ',' + r + ' 0 0 0 0,'
    if (c8n.offsetInBlock_.x > 0) {
      steps = 'm 0,' + (-r) + a + (2 * r) + ' h ' + (block.width - edY.Font.tabWidth) + a + (-2 * r) + ' z'
    } else {
      steps = 'm 0,' + (-r) + a + (2 * r) + ' h ' + (edY.Font.tabWidth + edY.Style.Path.radius()) + a + (-2 * r) + ' z'
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
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Group.makeSubclass('if_part', {
  fields: {
    label: 'if',
  },
  tiles: {
    if: {
      order: 1,
      check: edY.T3.Expr.Check.expression,
      hole_value: 'condition',
    },
  },
})

/**
 * Class for a DelegateSvg, elif_part block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Group.makeSubclass('elif_part', {
  fields: {
    label: 'elif',
  },
  tiles: {
    elif: {
      order: 1,
      check: edY.T3.Expr.Check.expression,
      hole_value: 'condition',
    },
  },
})

/**
 * Class for a DelegateSvg, else_part block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * The else block connection model is more complex than for other blocks.
 * Where can this block appear?
 * - after an if or an elif
 * - after a for
 * - after a while
 * - after and except
 * - before a finally
 * It is always the last box of the sequence, except when before a finally
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Group.makeSubclass('else_part', {
  fields: {
    label: 'else',
  },
  statement: {
    previous : {
      didConnect: function(oldTargetConnection, oldConnection) {
        this.edy.consolidateSource()
      },
      didDisconnect: function(oldConnection) {
        this.edy.consolidateSource()
      },
    },
  },
})

edY.DelegateSvg.Stmt.last_else_part = edY.DelegateSvg.Stmt.try_else_part = edY.DelegateSvg.Stmt.else_part
edY.DelegateSvg.Manager.register('try_else_part')
edY.DelegateSvg.Manager.register('last_else_part')

/**
 * This block may have one of 3 types: else_part, last_else_part, try_else_part.
 * else_part covers both last_else_part and try_else_part.
 * If the block cannot be of type last_else_part, then its type is try_else_part
 * and conversely. If the block can be of both types, then it is of type else_part.
 * First the previous connection tries to constrain the type,
 * then the next connection.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Stmt.else_part.prototype.consolidateType = function (block) {
  var T3 = edY.T3.Stmt
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
    this.setupType(block, expected)
    block.previousConnection.setCheck(P)
    block.nextConnection.setCheck(N)
  }
}

/**
 * Class for a DelegateSvg, while_part block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Group.makeSubclass('while_part', {
  fields: {
    label: 'while',
  },
  tiles: {
    while: {
      order: 1,
      check: edY.T3.Expr.Check.expression,
      hole_value: 'condition',
    },
  },
})

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
edY.DelegateSvg.Group.prototype.willRender_ = function (block) {
  edY.DelegateSvg.Group.superClass_.willRender_.call(this, block)
  var field = this.ui.fields.async
  if (field) {
    field.setVisible(this.async_)
  }
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Group.prototype.populateContextMenuFirst_ = function (block, mgr) {
  if (block.edy.ui.fields.async) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN('async', 'edy-code-reserved'),
      goog.dom.createTextNode(' '+edY.Msg.AT_THE_LEFT),
    )
    if (block.edy.getProperty(block, edY.Key.ASYNC)) {
      mgr.addRemoveChild(new edY.MenuItem(content, function() {
        block.edy.setProperty(block, edY.Key.ASYNC, false)
      }))
      mgr.shouldSeparateRemove()
    } else {
      mgr.addInsertChild(new edY.MenuItem(content, function() {
        block.edy.setProperty(block, edY.Key.ASYNC, true)
      }))
      mgr.shouldSeparateInsert()
    }
  }
  return edY.DelegateSvg.Group.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

/**
 * Class for a DelegateSvg, for_part block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Group.makeSubclass('for_part', {
  tiles: {
    for: {
      order: 1,
      fields: {
        label: 'for',
      },
      wrap: edY.T3.Expr.target_list,
      hole_value: 'element',
    },
    in: {
      order: 2,
      fields: {
        label: 'in',
      },
      wrap: edY.T3.Expr.expression_list,
      hole_value: 'set',
    },
  },
})

/**
 * Class for a DelegateSvg, with_part block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Group.makeSubclass('with_part', {
  tiles: {
    with: {
      order: 1,
      fields: {
        label: 'with',
      },
      wrap: edY.T3.Expr.with_item_list,
    },
  },
})

/**
 * Class for a DelegateSvg, with_item_s3d block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.makeSubclass('with_item_s3d', {
  tiles: {
    expression: {
      order: 1,
      check: edY.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    target: {
      order: 3,
      fields: {
        label: 'as',
      },
      check: edY.T3.Expr.Check.target,
      hole_value: 'target',
    },
  },
})

edY.DelegateSvg.Group.T3s = [
  edY.T3.Stmt.if_part,
  edY.T3.Stmt.elif_part,
  edY.T3.Stmt.else_part,
  edY.T3.Stmt.while_part,
  edY.T3.Stmt.with_part,
  edY.T3.Stmt.for_part,
  edY.T3.Expr.with_item_s3d,
]
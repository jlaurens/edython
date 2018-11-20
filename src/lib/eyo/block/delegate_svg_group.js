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

goog.provide('eYo.DelegateSvg.Group')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Expr')
goog.require('eYo.DelegateSvg.Stmt')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('Group', {
  fields: {
    suffix: ':'
  },
  statement: {
    suite: {}
  }
}, eYo.DelegateSvg)

/**
 * Whether the block has a suite statement.
 * @private
 */
eYo.DelegateSvg.Group.prototype.hasSuiteStatement_ = function () {
  return true
}

/**
 * Block path.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.Group.prototype.groupShapePathDef_ = function () {
  /* eslint-disable indent */
  return eYo.Shape.definitionWithBlock(this)
} /* eslint-enable indent */

/**
 * Block path.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.Group.prototype.collapsedPathDef_ = function () {
  /* eslint-disable indent */
  var block = this.block_
  if (block.isCollapsed()) {
    var line = eYo.Font.lineHeight
    var t = eYo.Font.tabWidth
    var r = eYo.Style.Path.r
    return 'm ' + block.width + ',' + line + ' v ' + (line - r) / 2 +
    ' m -' + r + ',' + r / 2 + ' l ' + 2 * r + ',' + (-r) +
    ' M ' + (t + r) + ',' + (2 * line) + ' H ' + block.width + ' v ' + (r - line) / 2 +
    ' m -' + r + ',' + r / 2 + ' l ' + 2 * r + ',' + (-r)
  }
  return eYo.DelegateSvg.Group.superClass_.collapsedPathDef_.call(this)
} /* eslint-enable indent */

eYo.DelegateSvg.Group.prototype.shapePathDef_ =
  eYo.DelegateSvg.Group.prototype.contourPathDef_ =
    eYo.DelegateSvg.Group.prototype.highlightPathDef_ =
      eYo.DelegateSvg.Group.prototype.groupShapePathDef_

/**
 * Get the suite count.
 * For edython.
 * @param {boolean} newValue
 */
eYo.DelegateSvg.Group.prototype.getSuiteCount_ = function () {
  return Math.max(1, this.suiteCount_)
}

/**
 * Render the suite block, if relevant.
 * @return {boolean=} true if a rendering message was sent, false othrwise.
 */
eYo.DelegateSvg.Group.prototype.renderSuite_ = function () {
  if (!this.inputSuite) {
    return
  }
  if (eYo.DelegateSvg.debugStartTrackingRender) {
    console.log(eYo.DelegateSvg.debugPrefix, 'SUITE')
  }
  var c8n = this.suiteConnection
  if (c8n) {
    c8n.eyo.setOffset(eYo.Font.tabW, 1)
    var target = c8n.targetBlock()
    if (target) {
      var root = target.getSvgRoot()
      if (root) {
        c8n.tighten_()
        if (!target.rendered || !target.eyo.upRendering) {
          try {
            target.eyo.downRendering = true
            target.eyo.render(false)
          } catch (err) {
            console.error(err)
            throw err
          } finally {
            target.eyo.downRendering = false
          }
        }
      }
    }
    this.size.l = this.getStatementCount()
    return true
  }
}

/**
 * Render one input of value block.
 * @param io
 * @private
 */
eYo.DelegateSvg.Group.prototype.renderDrawInput_ = function (io) {
  this.renderDrawValueInput_(io) ||
      this.renderDrawSuiteInput_(io)
}

/**
 * Is it still relevant ?
 * There is a difference with the connection delegate's
 * highlight method.
 * @param {!Blockly.Connection} c8n The connection to highlight.
 */
eYo.DelegateSvg.Group.prototype.highlightConnection = function (c8n) {
  var block = c8n.sourceBlock_
  if (!block.workspace) {
    return
  }
  var steps
  if (c8n.type === Blockly.INPUT_VALUE) {
    if (c8n.isConnected()) {
      steps = c8n.targetBlock().eyo.valuePathDef_()
    } else {
      steps = c8n.eyo.placeHolderPathWidthDef_().d
      Blockly.Connection.highlightedPath_ =
      Blockly.utils.createSvgElement('path',
        {
          class: 'blocklyHighlightedConnectionPath',
          d: steps
        },
        c8n.sourceBlock_.getSvgRoot()
      )
      return
    }
  } else if (c8n.type === Blockly.OUTPUT_VALUE) {
    steps = 'm 0,0 ' + Blockly.BlockSvg.TAB_PATH_DOWN + ' v 5'
  } else if (c8n.type === Blockly.NEXT_STATEMENT) {
    var r = eYo.Style.Path.Selected.width / 2
    var a = ' a ' + r + ',' + r + ' 0 0 0 0,'
    if (c8n.offsetInBlock_.x > 0) {
      steps = 'm ' + eYo.Unit.x / 2 + ',' + (-r) + a + (2 * r) + ' h ' + (block.width - eYo.Font.tabWidth - eYo.Unit.x / 2) + a + (-2 * r) + ' z'
    } else {
      steps = 'm ' + eYo.Unit.x / 2 + ',' + (-r) + a + (2 * r) + ' h ' + (eYo.Font.tabWidth + eYo.Style.Path.r) + a + (-2 * r) + ' z'
    }
  } else if (c8n.type === Blockly.PREVIOUS_STATEMENT) {
    r = eYo.Style.Path.Selected.width / 2
    a = ' a ' + r + ',' + r + ' 0 0 0 0,'
    if (c8n.offsetInBlock_.x > 0) {
      steps = 'm ' + eYo.Unit.x / 2 + ',' + (-r) + a + (2 * r) + ' h ' + (eYo.Font.tabWidth + eYo.Style.Path.r - eYo.Unit.x / 2) + a + (-2 * r) + ' z'
    } else {
      steps = 'm ' + eYo.Unit.x / 2 + ',' + (-r) + a + (2 * r) + ' h ' + (block.width - eYo.Unit.x / 2) + a + (-2 * r) + ' z'
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
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Group.makeSubclass('if_part', {
  xml: {
    tag: 'if',
  },
  fields: {
    label: 'if'
  },
  slots: {
    if: {
      order: 1,
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'condition'
    }
  }
}, true)

/**
 * Class for a DelegateSvg, elif_part block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Group.makeSubclass('elif_part', {
  fields: {
    label: 'elif'
  },
  slots: {
    elif: {
      order: 1,
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'condition'
    }
  }
}, true)

/**
 * Class for a DelegateSvg, else_part block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * The else block connection model is more complex than for other blocks.
 * Where can this block appear?
 * - after an if or an elif
 * - after a for
 * - after a while
 * - after and except
 * - before a finally
 * It is always the last box of the sequence, except when before a finally
 * For edython.
 */
eYo.DelegateSvg.Group.makeSubclass('else_part', {
  fields: {
    label: 'else'
  },
  statement: {
    previous: {
      check: /** @suppress {globalThis} */ function (type) {
        return [
          type === eYo.T3.Stmt.else_part
          ? eYo.T3.Stmt.Previous.else_part
          : type === eYo.T3.Stmt.try_else_part
            ? eYo.T3.Stmt.Previous.try_else_part
            : eYo.T3.Stmt.Previous.last_else_part
        ]
      }
    },
    next: {
      check: /** @suppress {globalThis} */ function (type) {
        return [
          type === eYo.T3.Stmt.else_part
          ? eYo.T3.Stmt.Next.else_part
          : type === eYo.T3.Stmt.try_else_part
            ? eYo.T3.Stmt.Next.try_else_part
            : eYo.T3.Stmt.Next.last_else_part
        ]
      }
    }
  }
}, true)

eYo.DelegateSvg.Stmt.last_else_part = eYo.DelegateSvg.Stmt.try_else_part = eYo.DelegateSvg.Stmt.else_part
eYo.DelegateSvg.Manager.register('try_else_part')
eYo.DelegateSvg.Manager.register('last_else_part')

/**
 * This block may have one of 3 types: else_part, last_else_part, try_else_part.
 * else_part covers both last_else_part and try_else_part.
 * If the block cannot be of type last_else_part, then its type is try_else_part
 * and conversely. If the block can be of both types, then it is of type else_part.
 * First the previous connection tries to constrain the type,
 * then the next connection.
 * @param {!Blockly.Block} block Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.Stmt.else_part.prototype.getType = eYo.Decorate.onChangeCount(
  'getType',
  function () {
    var block = this.block_
    var T3 = eYo.T3.Stmt
    var type = T3.else_part
    var targetC8n
    if ((targetC8n = block.previousConnection.targetConnection)) {
      var target = targetC8n.getSourceBlock()
      if ((targetC8n.check_ && targetC8n.check_.indexOf(T3.last_else_part) < 0) || (T3.Previous.last_else_part && T3.Previous.last_else_part.indexOf(target.type) < 0)) {
        type = T3.try_else_part
      } else if ((targetC8n.check_ && targetC8n.check_.indexOf(T3.try_else_part) < 0) || (T3.Previous.try_else_part && T3.Previous.try_else_part.indexOf(target.type) < 0)) {
        type = T3.last_else_part
      }
    } else if ((targetC8n = this.nextConnection.targetConnection)) {
      // the previous connection did not add any constrain
      // may be the next connection will?
      target = targetC8n.getSourceBlock()
      if ((targetC8n.check_ && targetC8n.check_.indexOf(T3.last_else_part) < 0) || (T3.Next.last_else_part && T3.Next.last_else_part.indexOf(target.type) < 0)) {
        type = T3.try_else_part
      } else if ((targetC8n.check_ && targetC8n.check_.indexOf(T3.try_else_part) < 0) || (T3.Next.try_else_part && T3.Next.try_else_part.indexOf(target.type) < 0)) {
        type = T3.last_else_part
      }
    }  
    this.setupType(type) // bad smell, the code has changed
    return block.type
  }
)

/**
 * Class for a DelegateSvg, while_part block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Group.makeSubclass('while_part', {
  xml: {
    tag: 'while',
  },
  fields: {
    label: 'while'
  },
  slots: {
    while: {
      order: 1,
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'condition'
    }
  }
}, true)

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block
 * @private
 */
eYo.DelegateSvg.Group.prototype.willRender_ = function (recorder) {
  eYo.DelegateSvg.Group.superClass_.willRender_.call(this, recorder)
  var field = this.fields.async
  if (field) {
    field.setVisible(this.async_)
  }
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Group.prototype.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  if (block.eyo.fields.async) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('async', 'eyo-code-reserved'),
      goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_LEFT)
    )
    if (block.eyo.getProperty(block, eYo.Key.ASYNC)) {
      mgr.addRemoveChild(mgr.newMenuItem(content, function () {
        block.eyo.setProperty(block, eYo.Key.ASYNC, false)
      }))
      mgr.shouldSeparateRemove()
    } else {
      mgr.addInsertChild(mgr.newMenuItem(content, function () {
        block.eyo.setProperty(block, eYo.Key.ASYNC, true)
      }))
      mgr.shouldSeparateInsert()
    }
  }
  return eYo.DelegateSvg.Group.superClass_.populateContextMenuFirst_.call(this, mgr)
}

/**
 * Class for a DelegateSvg, for_part block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Group.makeSubclass('for_part', {
  xml: {
    tag: 'for',
  },
  slots: {
    for: {
      order: 1,
      fields: {
        label: 'for'
      },
      wrap: eYo.T3.Expr.target_list,
      hole_value: 'element'
    },
    in: {
      order: 2,
      fields: {
        label: 'in'
      },
      wrap: eYo.T3.Expr.expression_list,
      hole_value: 'set'
    }
  }
}, true)

/**
 * Class for a DelegateSvg, with_part block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Group.makeSubclass('with_part', {
  xml: {
    tag: 'with',
  },
  slots: {
    with: {
      order: 1,
      fields: {
        label: 'with'
      },
      wrap: eYo.T3.Expr.with_item_list
    }
  }
}, true)

/**
 * Class for a DelegateSvg, expression_as block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('expression_as', {
  slots: {
    expression: {
      order: 1,
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'expression'
    },
    target: {
      order: 3,
      fields: {
        label: 'as'
      },
      check: eYo.T3.Expr.Check.target,
      hole_value: 'target'
    }
  }
}, true)

eYo.DelegateSvg.Group.T3s = [
  eYo.T3.Stmt.if_part,
  eYo.T3.Stmt.elif_part,
  eYo.T3.Stmt.else_part,
  eYo.T3.Stmt.while_part,
  eYo.T3.Stmt.with_part,
  eYo.T3.Stmt.for_part,
  eYo.T3.Expr.expression_as
]

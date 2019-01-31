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
eYo.DelegateSvg.Stmt.makeSubclass('BaseGroup', {
  statement: {
    suite: {}
  }
}, eYo.DelegateSvg)

Object.defineProperties(eYo.DelegateSvg.BaseGroup.prototype, {
  isGroup: {
    get () {
      return true
    }
  }
})

/**
 * Class for a DelegateSvg, statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.BaseGroup.makeSubclass('Group', {
  fields: {
    suffix: ':'
  }
}, eYo.DelegateSvg)

/**
 * Block path.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.BaseGroup.prototype.groupShapePathDef_ = function () {
  /* eslint-disable indent */
  return eYo.Shape.definitionWithBlock(this)
} /* eslint-enable indent */

/**
 * Block path.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.BaseGroup.prototype.collapsedPathDef_ = function () {
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
  return eYo.DelegateSvg.BaseGroup.superClass_.collapsedPathDef_.call(this)
} /* eslint-enable indent */

eYo.DelegateSvg.BaseGroup.prototype.shapePathDef_ =
  eYo.DelegateSvg.BaseGroup.prototype.contourPathDef_ =
    eYo.DelegateSvg.BaseGroup.prototype.hilightPathDef_ =
      eYo.DelegateSvg.BaseGroup.prototype.groupShapePathDef_

/**
 * Render the suite block, if relevant.
 * @return {boolean=} true if a rendering message was sent, false othrwise.
 */
eYo.DelegateSvg.BaseGroup.prototype.renderSuite_ = function () {
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
    } else if (this.suiteConnection) {
      this.someTargetIsMissing = true
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
eYo.DelegateSvg.BaseGroup.prototype.renderDrawInput_ = function (io) {
  this.renderDrawValueInput_(io) ||
      this.renderDrawSuiteInput_(io)
}

/**
 * Update the black count.
 */
eYo.DelegateSvg.Group.prototype.updateBlackCount = function () {
  this.blackCount = this.suiteConnection && this.suiteConnection.eyo.getBlackTargetConnection() ? 0 : 1
}

/**
 * Class for a DelegateSvg, if_part block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Group.makeSubclass('Branch', {
  data: {
    variant: {
      all: [
        eYo.Key.IF,
        eYo.Key.ELIF,
        eYo.Key.ELSE,
        eYo.Key.WHILE
      ],
      init: eYo.Key.IF,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        this.owner.if_d.setIncog(newValue === eYo.Key.ELSE)
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Stmt.while_part) {
          this.set(eYo.Key.WHILE)
        } else if (type === eYo.T3.Stmt.elif_part) {
          this.set(eYo.Key.ELIF)
        } else if (type === eYo.T3.Stmt.else_part) {
          this.set(eYo.Key.ELSE)
        } else if (type === eYo.T3.Stmt.try_else_part) {
          this.set(eYo.Key.ELSE)
        } else if (type === eYo.T3.Stmt.last_else_part) {
          this.set(eYo.Key.ELSE)
        } else {
          this.set(eYo.Key.IF)
        }
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
        },
        load: /** @suppress {globalThis} */ function (element) {
          this.owner.variant_p = element.getAttribute(eYo.Key.EYO)
        },
      },
      isChanging: /** @suppress {globalThis} */ function (oldValue, newValue) { // same code for primary blocks
        this.owner.consolidateType()
        this.owner.consolidateConnections()
        this.isChanging(oldValue, newValue)
      },
    },
    if: {
      init: '',
      placeholder: eYo.Msg.Placeholder.CONDITION,
      validate: false, // use the python interpreter to validate this
      synchronize: true,
    }
  },
  fields: {
    variant: {
      css: 'reserved'
    }
  },
  slots: {
    if: {
      order: 1,
      fields: {
        bind: {
          endEditing: true
        }
      },
      check: eYo.T3.Expr.Check.expression
    }
  },
  statement: {
    previous: {
      check: /** @suppress {globalThis} */ function (type) {
        return eYo.T3.Stmt.Previous[type.substring(4)]
      }
    },
    next: {
      check: /** @suppress {globalThis} */ function (type) {
        return eYo.T3.Stmt.Next[type.substring(4)]
      }
    }
  }
})

/**
 * The xml `eyo` attribute of this block, as it should appear in the saved data.
 * For edython.
 * @return {String}
 */
eYo.DelegateSvg.Group.Branch.prototype.xmlAttr = function () {
  return this.variant_p
}

/**
 * getBaseType.
 * The type depends on the variant and the modifiers.
 * As side effect, the subtype is set.
 * When the type changes, the connections may change,
 * and when the connection changes, the type changes.
 * Each type change may imply a disconnection.
 * At least, the type may change to a value when no connection is connected.
 */
eYo.DelegateSvg.Group.Branch.prototype.getBaseType = function () {
  var T3 = eYo.T3.Stmt
  var type = {
    [eYo.Key.IF]: T3.if_part,
    [eYo.Key.ELIF]: T3.elif_part,
    [eYo.Key.WHILE]: T3.while_part
  } [this.variant_p]
  if (!type) {
    var block = this.block_
    var targetC8n
    if ((targetC8n = block.previousConnection.targetConnection)) {
      // look at the previous connection
      // 
      var target = targetC8n.getSourceBlock()
      if ((targetC8n.check_ && targetC8n.check_.indexOf(T3.last_else_part) < 0) || (T3.Previous.last_else_part && T3.Previous.last_else_part.indexOf(target.eyo.type) < 0)) {
        type = T3.try_else_part
      } else if ((targetC8n.check_ && targetC8n.check_.indexOf(T3.try_else_part) < 0) || (T3.Previous.try_else_part && T3.Previous.try_else_part.indexOf(target.eyo.type) < 0)) {
        type = T3.last_else_part
      }
    }
    if (!type && (targetC8n = this.nextConnection.targetConnection)) {
      // the previous connection did not add any constrain
      // may be the next connection will?
      target = targetC8n.getSourceBlock()
      if ((targetC8n.check_ && targetC8n.check_.indexOf(T3.last_else_part) < 0) || (T3.Next.last_else_part && T3.Next.last_else_part.indexOf(target.eyo.type) < 0)) {
        type = T3.try_else_part
      } else if ((targetC8n.check_ && targetC8n.check_.indexOf(T3.try_else_part) < 0) || (T3.Next.try_else_part && T3.Next.try_else_part.indexOf(target.eyo.type) < 0)) {
        type = T3.last_else_part
      }
    }
  }
  this.setupType(type || T3.else_part) // bad smell, the code has changed
  return this.block_.type // avoid `this.type`
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Group.Branch.prototype.populateContextMenuFirst_ = function (mgr) {
  var current = this.variant_p
  var variants = this.variant_d.getAll()
  var F = (i) => {
    var key = variants[i]
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN(key, 'eyo-code-reserved')
    )
    var menuItem = mgr.newMenuItem(content, () => {
      this.variant_p = key
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(0)
  F(1)
  F(2)
  F(3)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.global_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
}

// /**
//  * Class for a DelegateSvg, elif_part block.
//  * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
//  * For edython.
//  */
// eYo.DelegateSvg.Group.makeSubclass('elif_part', {
//   fields: {
//     label: 'elif'
//   },
//   slots: {
//     elif: {
//       order: 1,
//       check: eYo.T3.Expr.Check.expression,
//       hole_value: 'condition'
//     }
//   }
// }, true)

// /**
//  * Class for a DelegateSvg, else_part block.
//  * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
//  * The else block connection model is more complex than for other blocks.
//  * Where can this block appear?
//  * - after an if or an elif
//  * - after a for
//  * - after a while
//  * - after and except
//  * - before a finally
//  * It is always the last box of the sequence, except when before a finally
//  * For edython.
//  */
// eYo.DelegateSvg.Group.makeSubclass('else_part', {
//   fields: {
//     label: 'else'
//   },
//   statement: {
//     previous: {
//       check: /** @suppress {globalThis} */ function (type) {
//         return [
//           type === eYo.T3.Stmt.else_part
//           ? eYo.T3.Stmt.Previous.else_part
//           : type === eYo.T3.Stmt.try_else_part
//             ? eYo.T3.Stmt.Previous.try_else_part
//             : eYo.T3.Stmt.Previous.last_else_part
//         ]
//       }
//     },
//     next: {
//       check: /** @suppress {globalThis} */ function (type) {
//         return [
//           type === eYo.T3.Stmt.else_part
//           ? eYo.T3.Stmt.Next.else_part
//           : type === eYo.T3.Stmt.try_else_part
//             ? eYo.T3.Stmt.Next.try_else_part
//             : eYo.T3.Stmt.Next.last_else_part
//         ]
//       }
//     }
//   }
// }, true)

var names = [
  'if',
  'elif',
  'else',
  'while',
  'try_else',
  'last_else'
]
names.forEach((name) => {
  var key = name + '_part'
  eYo.DelegateSvg.Stmt[key] = eYo.DelegateSvg.Group.Branch
  eYo.DelegateSvg.Manager.register(key)
})

// /**
//  * This block may have one of 3 types: else_part, last_else_part, try_else_part.
//  * else_part covers both last_else_part and try_else_part.
//  * If the block cannot be of type last_else_part, then its type is try_else_part
//  * and conversely. If the block can be of both types, then it is of type else_part.
//  * First the previous connection tries to constrain the type,
//  * then the next connection.
//  * @param {!Blockly.Block} block Name of the language object containing
//  *     type-specific functions for this block.
//  * @constructor
//  */
// eYo.DelegateSvg.Stmt.else_part.prototype.getType = eYo.Decorate.onChangeCount(
//   'getType',
//   function () {
//     var block = this.block_
//     var T3 = eYo.T3.Stmt
//     var type = T3.else_part
//     var targetC8n
//     if ((targetC8n = block.previousConnection.targetConnection)) {
//       var target = targetC8n.getSourceBlock()
//       if ((targetC8n.check_ && targetC8n.check_.indexOf(T3.last_else_part) < 0) || (T3.Previous.last_else_part && T3.Previous.last_else_part.indexOf(target.type) < 0)) {
//         type = T3.try_else_part
//       } else if ((targetC8n.check_ && targetC8n.check_.indexOf(T3.try_else_part) < 0) || (T3.Previous.try_else_part && T3.Previous.try_else_part.indexOf(target.type) < 0)) {
//         type = T3.last_else_part
//       }
//     } else if ((targetC8n = this.nextConnection.targetConnection)) {
//       // the previous connection did not add any constrain
//       // may be the next connection will?
//       target = targetC8n.getSourceBlock()
//       if ((targetC8n.check_ && targetC8n.check_.indexOf(T3.last_else_part) < 0) || (T3.Next.last_else_part && T3.Next.last_else_part.indexOf(target.type) < 0)) {
//         type = T3.try_else_part
//       } else if ((targetC8n.check_ && targetC8n.check_.indexOf(T3.try_else_part) < 0) || (T3.Next.try_else_part && T3.Next.try_else_part.indexOf(target.type) < 0)) {
//         type = T3.last_else_part
//       }
//     }  
//     this.setupType(type) // bad smell, the code has changed
//     return block.type
//   }
// )

// /**
//  * Class for a DelegateSvg, while_part block.
//  * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
//  * For edython.
//  */
// eYo.DelegateSvg.Group.makeSubclass('while_part', {
//   fields: {
//     label: 'while'
//   },
//   slots: {
//     while: {
//       order: 1,
//       check: eYo.T3.Expr.Check.expression,
//       hole_value: 'condition'
//     }
//   }
// }, true)

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

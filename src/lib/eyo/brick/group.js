/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Block delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Brick.Group')

goog.require('eYo.Msg')
goog.require('eYo.Brick.Expr')
goog.require('eYo.Brick.Stmt')
goog.require('goog.dom');

/**
 * Class for a Delegate, base group statement brick.
 * Base group is subclassed into Group and Control.
 * For edython.
 */
eYo.Brick.Stmt.makeSubclass('BaseGroup', {
  statement: {
    head: {
      check: /** @suppress {globalThis} */ function (type) {
        return null
      }
    },
    left: undefined,
    right: {
      check: /** @suppress {globalThis} */ function (type) {
        return this.brick.suite
        ? [eYo.T3.Stmt.comment_stmt]
        : eYo.T3.Stmt.Right.simple_stmt
      },
      fields: {
        label: { // don't call it 'operator'
          value: ':',
          css: 'reserved',
          hidden: false
        }
      }
    },
    suite: {
      check: /** @suppress {globalThis} */ function (type) {
        return this.brick.right
        ? []
        : null
      }
    },
    foot: {
      check: /** @suppress {globalThis} */ function (type) {
        return null
      }
    }
  }
}, eYo.Brick)

Object.defineProperties(eYo.Brick.BaseGroup.prototype, {
  isGroup: {
    get () {
      return true
    }
  }
})

/**
 * Class for a Delegate, statement brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.BaseGroup.makeSubclass('Group', {}, eYo.Brick)

/**
 * Update the black count.
 */
eYo.Brick.Group.prototype.updateBlackHeight = function () {
  this.blackHeight = this.magnets.suite && this.magnets.suite.blackTarget
  ? 0
  : this.left || this.right ? 0 : 1
}

/**
 * Class for a Delegate, if_part brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.Group.makeSubclass('Branch', {
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
        this.owner.if_d.incog = newValue === eYo.Key.ELSE
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
      isChanging: /** @suppress {globalThis} */ function (oldValue, newValue) { // same code for primary bricks
        this.owner.consolidateType()
        this.owner.consolidateMagnets()
        this.duringChange(oldValue, newValue)
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
      check: eYo.T3.Expr.Check.namedexpr_test
    }
  },
  statement: {
    head: {
      check: /** @suppress {globalThis} */ function (type) {
        return eYo.T3.Stmt.Previous[type.substring(4)]
      }
    },
    foot: {
      check: /** @suppress {globalThis} */ function (type) {
        return eYo.T3.Stmt.Next[type.substring(4)]
      }
    }
  }
})

/**
 * The xml `eyo` attribute of this brick, as it should appear in the saved data.
 * For edython.
 * @return {String}
 */
eYo.Brick.Group.Branch.prototype.xmlAttr = function () {
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
eYo.Brick.Group.Branch.prototype.getBaseType = function () {
  var T3 = eYo.T3.Stmt
  var type = {
    [eYo.Key.IF]: T3.if_part,
    [eYo.Key.ELIF]: T3.elif_part,
    [eYo.Key.WHILE]: T3.while_part
  } [this.variant_p]
  if (!type) {
    var targetMagnet
    if ((targetMagnet = this.magnets.head.target)) {
      // look at the high connection
      //
      var t_brick = targetMagnet.brick
      if ((targetMagnet.check_ && targetMagnet.check_.indexOf(T3.last_else_part) < 0) || (T3.Previous.last_else_part && T3.Previous.last_else_part.indexOf(t_brick.type) < 0)) {
        type = T3.try_else_part
      } else if ((targetMagnet.check_ && targetMagnet.check_.indexOf(T3.try_else_part) < 0) || (T3.Previous.try_else_part && T3.Previous.try_else_part.indexOf(t_brick.type) < 0)) {
        type = T3.last_else_part
      }
    }
    if (!type && (targetMagnet = this.magnets.foot.target)) {
      // the high connection did not add any constrain
      // may be the low connection will?
      t_brick = targetMagnet.brick
      if ((targetMagnet.check_ && targetMagnet.check_.indexOf(T3.last_else_part) < 0) || (T3.Next.last_else_part && T3.Next.last_else_part.indexOf(t_brick.type) < 0)) {
        type = T3.try_else_part
      } else if ((targetMagnet.check_ && targetMagnet.check_.indexOf(T3.try_else_part) < 0) || (T3.Next.try_else_part && T3.Next.try_else_part.indexOf(t_brick.type) < 0)) {
        type = T3.last_else_part
      }
    }
  }
  this.setupType(type || T3.else_part) // bad smell, the code has changed
  return this.type_
}

/**
 * Populate the context menu for the given brick.
 * @param {!Blockly.Block} brick The brick.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.Brick.Group.Branch.prototype.populateContextMenuFirst_ = function (mgr) {
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
  return eYo.Brick.Stmt.global_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
}

;[
  'if',
  'elif',
  'else',
  'while',
  'try_else',
  'last_else'
].forEach(name => {
  var key = name + '_part'
  eYo.Brick.Stmt[key] = eYo.Brick.Group.Branch
  eYo.Brick.Manager.register(key)
})

/**
 * Will draw the brick. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} brick
 * @private
 */
eYo.Brick.Group.prototype.willRender_ = function (recorder) {
  eYo.Brick.Group.superClass_.willRender_.call(this, recorder)
  var field = this.fields.async
  if (field) {
    field.setVisible(this.async_)
  }
}

/**
 * Populate the context menu for the given brick.
 * @param {!Blockly.Block} brick The brick.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.Brick.Group.prototype.populateContextMenuFirst_ = function (mgr) {
  var brick = this
  if (this.fields.async) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('async', 'eyo-code-reserved'),
      goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_LEFT)
    )
    if (this.getProperty(brick, eYo.Key.ASYNC)) {
      mgr.addRemoveChild(mgr.newMenuItem(content, function () {
        brick.eyo.setProperty(brick, eYo.Key.ASYNC, false)
      }))
      mgr.shouldSeparateRemove()
    } else {
      mgr.addInsertChild(mgr.newMenuItem(content, function () {
        this.setProperty(brick, eYo.Key.ASYNC, true)
      }))
      mgr.shouldSeparateInsert()
    }
  }
  return eYo.Brick.Group.superClass_.populateContextMenuFirst_.call(this, mgr)
}

/**
 * Class for a Delegate, for_part brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.Group.makeSubclass('for_part', {
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
 * Class for a Delegate, with_part brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.Group.makeSubclass('with_part', {
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

eYo.Brick.Group.T3s = [
  eYo.T3.Stmt.if_part,
  eYo.T3.Stmt.elif_part,
  eYo.T3.Stmt.else_part,
  eYo.T3.Stmt.while_part,
  eYo.T3.Stmt.with_part,
  eYo.T3.Stmt.for_part
]

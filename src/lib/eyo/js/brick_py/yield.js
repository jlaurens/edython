/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('Stmt')

eYo.require('Msg')

eYo.require('Expr.List')
goog.require('goog.dom')

eYo.provide('Brick.Yield')

/**
 * Class for a Delegate, yield_expr.
 * For edython.
 */
eYo.Expr.Dflt.makeSubclass('yield_expr', {
  xml: {
    attr: 'yield'
  },
  data: {
    variant: {
      all: [
        eYo.Key.NONE,
        eYo.Key.EXPRESSION,
        eYo.Key.FROM,
      ],
      init: eYo.Key.NONE,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.from_d.requiredIncog = after === eYo.Key.FROM
        b3k.expression_d.requiredIncog = after === eYo.Key.EXPRESSION
      },
      xml: false
    },
    expression: {
      order: 10000,
      main: true,
      init: '',
      placeholder: eYo.Msg.Placeholder.EXPR,
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          if (!this.brick.expression_s.unwrappedTarget) {
            this.save(element, opt)
          }
        }
      },
      didChange (before, after) /** @suppress {globalThis} */ {
        var b3k = this.brick
        if (after) {
          b3k.variant_p = eYo.Key.EXPRESSION
        } else if (!b3k.expression_s.unwrappedTarget) {
          b3k.variant_p = eYo.Key.NONE
        }
      }
    },
    from: {
      order: 20000,
      init: '',
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required = this.brick.variant_p !== eYo.Key.NONE
          this.save(element, opt)
        }
      },
      didChange (before, after) /** @suppress {globalThis} */ {
        var b3k = this.brick
        if (after || b3k.from_b) {
          b3k.variant_p = eYo.Key.FROM
        } else if (b3k.expression_p || (b3k.expression_b && b3k.expression_b.unwrappedTarget)) {
          b3k.variant_p = eYo.Key.EXPRESSION
        } else {
          b3k.variant_p = eYo.Key.NONE
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.FROM
        }
      }
    }
  },
  fields: {
    prefix: 'yield'
  },
  slots: {
    expression: {
      order: 1,
      fields: {
        bind: {
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.EXPRESSION
        }
      },
      wrap: eYo.T3.Expr.non_void_expression_list,
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.EXPRESSION
        }
      },
      didConnect (oldTargetM4t, targetOldM4t) /** @suppress {globalThis} */ {
        if (this.isSlot) {
          var parent = this.brick.parent
          parent && (parent.variant_p = eYo.Key.EXPRESSION)
        }
      },
      didDisconnect (oldTargetM4t) /** @suppress {globalThis} */ {
        if (this.isSlot) {
          var parent = this.brick.parent
          parent && (parent.variant_p = parent.expression_s.unwrappedTarget || parent.expression_p ? eYo.Key.EXPRESSION : eYo.Key.NONE)
        }
      }
    },
    from: {
      order: 2,
      fields: {
        label: 'from',
        bind: {
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.EXPRESSION
        }
      },
      check: eYo.T3.Expr.Check.expression,
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.FROM
        }
      },
      didConnect (oldTargetM4t, targetOldM4t) /** @suppress {globalThis} */ {
        this.brick.variant_p = eYo.Key.FROM
      },
      didDisconnect (oldTargetM4t) /** @suppress {globalThis} */ {
        var b3k = this.brick
        if (b3k.from_p) {
          b3k.variant_p = eYo.Key.FROM
        } else if (b3k.expression_p || (b3k.expression_b && b3k.expression_b.unwrappedTarget)) {
          b3k.variant_p = eYo.Key.EXPRESSION
        } else {
          b3k.variant_p = eYo.Key.NONE
        }
      }
    }
  }
}, true)

/**
 * Populate the context menu for the given brick.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr - mngr.menu is the menu to populate.
 * @this {eYo.Brick.Dflt}
 * @private
 */
eYo.Expr.yield_expr.populateContextMenuFirst_ = function (mngr) {
  var brick = this
  if (brick.locked_) {
    return
  }
  var current = this.variant_p
  var F = (content, k) => {
    var menuItem = mngr.newMenuItem(content, () => {
      this.variant_p = k
    })
    mngr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code-reserved',
    goog.dom.createTextNode('yield')
  ), eYo.Key.NONE
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('yield ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), eYo.Key.EXPRESSION
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('yield from ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), eYo.Key.FROM
  )
  mngr.shouldSeparate()
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr - mngr.menu is the menu to populate.
 * @private
 */
eYo.Expr.yield_expr.prototype.populateContextMenuFirst_ = function (mngr) {
  var brick = this
  var yorn = eYo.Expr.yield_expr.populateContextMenuFirst_.call(this, mngr)
  return eYo.Expr.yield_expr.superProto_.populateContextMenuFirst_.call(this, mngr) || yorn
}

/**
 * Class for a Delegate, yield_stmt.
 * For edython.
 */
eYo.Stmt.makeClass('yield_stmt', {
  link: eYo.T3.Expr.yield_expr
}, true)

/**
 * Populate the context menu for the given brick.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr - mngr.menu is the menu to populate.
 * @private
 */
eYo.Stmt.yield_stmt.prototype.populateContextMenuFirst_ = function (mngr) {
  eYo.Expr.yield_expr.populateContextMenuFirst_.call(this, mngr)
  return eYo.Stmt.yield_stmt.superProto_.populateContextMenuFirst_.call(this, mngr)
}

eYo.Brick.Yield.T3s = [
  eYo.T3.Expr.yield_expr,
  eYo.T3.Stmt.yield_stmt
]

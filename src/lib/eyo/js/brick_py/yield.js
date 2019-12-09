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

eYo.require('eYo.Stmt')

eYo.require('eYo.Msg')

eYo.require('eYo.ns.Brick.List')
goog.require('goog.dom')

eYo.provide('eYo.ns.Brick.Yield')

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
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var b3k = this.brick
        b3k.from_d.requiredIncog = newValue === eYo.Key.FROM
        b3k.expression_d.requiredIncog = newValue === eYo.Key.EXPRESSION
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
        save: /** @suppress {globalThis} */ function (element, opt) {
          if (!this.brick.expression_s.unwrappedTarget) {
            this.save(element, opt)
          }
        }
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var b3k = this.brick
        if (newValue) {
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
        save: /** @suppress {globalThis} */ function (element, opt) {
          this.required = this.brick.variant_p !== eYo.Key.NONE
          this.save(element, opt)
        }
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var b3k = this.brick
        if (newValue || b3k.from_b) {
          b3k.variant_p = eYo.Key.FROM
        } else if (b3k.expression_p || (b3k.expression_b && b3k.expression_b.unwrappedTarget)) {
          b3k.variant_p = eYo.Key.EXPRESSION
        } else {
          b3k.variant_p = eYo.Key.NONE
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
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
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.EXPRESSION
        }
      },
      didConnect: /** @suppress {globalThis} */ function (oldTargetM4t, targetOldM4t) {
        if (this.isSlot) {
          var parent = this.brick.parent
          parent && (parent.variant_p = eYo.Key.EXPRESSION)
        }
      },
      didDisconnect: /** @suppress {globalThis} */ function (oldTargetM4t) {
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
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.FROM
        }
      },
      didConnect: /** @suppress {globalThis} */ function (oldTargetM4t, targetOldM4t) {
        this.brick.variant_p = eYo.Key.FROM
      },
      didDisconnect: /** @suppress {globalThis} */ function (oldTargetM4t) {
        var O = this.brick
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
 * @param {eYo.ns.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr - mngr.menu is the menu to populate.
 * @this {eYo.ns.Brick}
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
 * @param {eYo.ns.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr - mngr.menu is the menu to populate.
 * @private
 */
eYo.Expr.yield_expr.prototype.populateContextMenuFirst_ = function (mngr) {
  var brick = this
  var yorn = eYo.Expr.yield_expr.populateContextMenuFirst_.call(this, mngr)
  return eYo.Expr.yield_expr.superClass_.populateContextMenuFirst_.call(this, mngr) || yorn
}

/**
 * Class for a Delegate, yield_stmt.
 * For edython.
 */
eYo.Stmt.makeSubclass('yield_stmt', {
  link: eYo.T3.Expr.yield_expr
}, true)

/**
 * Populate the context menu for the given brick.
 * @param {eYo.ns.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr - mngr.menu is the menu to populate.
 * @private
 */
eYo.Stmt.yield_stmt.prototype.populateContextMenuFirst_ = function (mngr) {
  eYo.Expr.yield_expr.populateContextMenuFirst_.call(this, mngr)
  return eYo.Stmt.yield_stmt.superClass_.populateContextMenuFirst_.call(this, mngr)
}

eYo.ns.Brick.Yield.T3s = [
  eYo.T3.Expr.yield_expr,
  eYo.T3.Stmt.yield_stmt
]

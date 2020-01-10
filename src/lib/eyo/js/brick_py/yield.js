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

eYo.require('stmt')

eYo.require('msg')

eYo.require('expr.list')
goog.require('goog.dom')

eYo.provide('brick.yield')

/**
 * Class for a Delegate, yield_expr.
 * For edython.
 */
eYo.expr.Dflt.makeSubclass('yield_expr', {
  xml: {
    attr: 'yield'
  },
  data: {
    variant: {
      all: [
        eYo.key.NONE,
        eYo.key.EXPRESSION,
        eYo.key.FROM,
      ],
      init: eYo.key.NONE,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.from_d.requiredIncog = after === eYo.key.FROM
        b3k.expression_d.requiredIncog = after === eYo.key.EXPRESSION
      },
      xml: false
    },
    expression: {
      order: 10000,
      main: true,
      init: '',
      placeholder: eYo.msg.placeholder.EXPR,
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
          b3k.Variant_p = eYo.key.EXPRESSION
        } else if (!b3k.expression_s.unwrappedTarget) {
          b3k.Variant_p = eYo.key.NONE
        }
      }
    },
    from: {
      order: 20000,
      init: '',
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required = this.brick.Variant_p !== eYo.key.NONE
          this.save(element, opt)
        }
      },
      didChange (before, after) /** @suppress {globalThis} */ {
        var b3k = this.brick
        if (after || b3k.from_b) {
          b3k.Variant_p = eYo.key.FROM
        } else if (b3k.Expression_p || (b3k.expression_b && b3k.expression_b.unwrappedTarget)) {
          b3k.Variant_p = eYo.key.EXPRESSION
        } else {
          b3k.Variant_p = eYo.key.NONE
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.Variant_p = eYo.key.FROM
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
          placeholder: eYo.msg.placeholder.EXPRESSION
        }
      },
      wrap: eYo.t3.Expr.non_void_expression_list,
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.Variant_p = eYo.key.EXPRESSION
        }
      },
      didConnect (oldTargetM4t, targetOldM4t) /** @suppress {globalThis} */ {
        if (this.isSlot) {
          var parent = this.brick.parent
          parent && (parent.Variant_p = eYo.key.EXPRESSION)
        }
      },
      didDisconnect (oldTargetM4t) /** @suppress {globalThis} */ {
        if (this.isSlot) {
          var parent = this.brick.parent
          parent && (parent.Variant_p = parent.expression_s.unwrappedTarget || parent.Expression_p ? eYo.key.EXPRESSION : eYo.key.NONE)
        }
      }
    },
    from: {
      order: 2,
      fields: {
        label: 'from',
        bind: {
          endEditing: true,
          placeholder: eYo.msg.placeholder.EXPRESSION
        }
      },
      check: eYo.t3.Expr.Check.expression,
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.Variant_p = eYo.key.FROM
        }
      },
      didConnect (oldTargetM4t, targetOldM4t) /** @suppress {globalThis} */ {
        this.brick.Variant_p = eYo.key.FROM
      },
      didDisconnect (oldTargetM4t) /** @suppress {globalThis} */ {
        var b3k = this.brick
        if (b3k.From_p) {
          b3k.Variant_p = eYo.key.FROM
        } else if (b3k.Expression_p || (b3k.expression_b && b3k.expression_b.unwrappedTarget)) {
          b3k.Variant_p = eYo.key.EXPRESSION
        } else {
          b3k.Variant_p = eYo.key.NONE
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
eYo.expr.yield_expr.populateContextMenuFirst_ = function (mngr) {
  var brick = this
  if (brick.locked_) {
    return
  }
  var current = this.Variant_p
  var F = (content, k) => {
    var menuItem = mngr.newMenuItem(content, () => {
      this.Variant_p = k
    })
    mngr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code-reserved',
    goog.dom.createTextNode('yield')
  ), eYo.key.NONE
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.do.CreateSPAN('yield ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), eYo.key.EXPRESSION
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.do.CreateSPAN('yield from ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), eYo.key.FROM
  )
  mngr.shouldSeparate()
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr - mngr.menu is the menu to populate.
 * @private
 */
eYo.expr.yield_expr.prototype.populateContextMenuFirst_ = function (mngr) {
  var brick = this
  var yorn = eYo.expr.yield_expr.populateContextMenuFirst_.Call(this, mngr)
  return eYo.expr.yield_expr.SuperProto_.populateContextMenuFirst_.Call(this, mngr) || yorn
}

/**
 * Class for a Delegate, yield_stmt.
 * For edython.
 */
eYo.Stmt.makeClass('yield_stmt', {
  link: eYo.t3.Expr.yield_expr
}, true)

/**
 * Populate the context menu for the given brick.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr - mngr.menu is the menu to populate.
 * @private
 */
eYo.Stmt.yield_stmt.prototype.populateContextMenuFirst_ = function (mngr) {
  eYo.expr.yield_expr.populateContextMenuFirst_.Call(this, mngr)
  return eYo.stmt.yield_stmt.SuperProto_.populateContextMenuFirst_.Call(this, mngr)
}

eYo.Brick.yield.T3s = [
  eYo.t3.Expr.yield_expr,
  eYo.t3.Stmt.yield_stmt
]

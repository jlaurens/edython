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

eYo.require('expr.List')
//g@@g.require('g@@g.dom')

eYo.provide('brick.yield')

/**
 * Class for a Delegate, yield_expr.
 * For edython.
 */
eYo.expr.newC9r('yield_expr', true, {
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
        b3k.from_d.requiredIncog_ = after === eYo.key.FROM
        b3k.expression_d.requiredIncog_ = after === eYo.key.EXPRESSION
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
          b3k.variant_ = eYo.key.EXPRESSION
        } else if (!b3k.expression_s.unwrappedTarget) {
          b3k.variant_ = eYo.key.NONE
        }
      }
    },
    from: {
      order: 20000,
      init: '',
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required_from_model = this.brick.variant !== eYo.key.NONE
          this.save(element, opt)
        }
      },
      didChange (before, after) /** @suppress {globalThis} */ {
        var b3k = this.brick
        if (after || b3k.from_b) {
          b3k.variant_ = eYo.key.FROM
        } else if (b3k.Expression_p || (b3k.expression_b && b3k.expression_b.unwrappedTarget)) {
          b3k.variant_ = eYo.key.EXPRESSION
        } else {
          b3k.variant_ = eYo.key.NONE
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          this.brick.variant_ = eYo.key.FROM
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
      wrap: eYo.t3.expr.non_void_expression_list,
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          this.brick.variant_ = eYo.key.EXPRESSION
        }
      },
      didConnect (oldTargetM4t, targetOldM4t) /** @suppress {globalThis} */ { // eslint-disable-line
        if (this.isSlot) {
          var parent = this.brick.parent
          parent && (parent.variant_ = eYo.key.EXPRESSION)
        }
      },
      didDisconnect (oldTargetM4t) /** @suppress {globalThis} */ { // eslint-disable-line
        if (this.isSlot) {
          var parent = this.brick.parent
          parent && (parent.variant_ = parent.expression_s.unwrappedTarget || parent.Expression_p ? eYo.key.EXPRESSION : eYo.key.NONE)
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
      check: eYo.t3.expr.check.expression,
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          this.brick.variant_ = eYo.key.FROM
        }
      },
      didConnect (oldTargetM4t, targetOldM4t) /** @suppress {globalThis} */ { // eslint-disable-line
        this.brick.variant_ = eYo.key.FROM
      },
      didDisconnect (oldTargetM4t) /** @suppress {globalThis} */ { // eslint-disable-line
        var b3k = this.brick
        if (b3k.From_p) {
          b3k.variant_ = eYo.key.FROM
        } else if (b3k.Expression_p || (b3k.expression_b && b3k.expression_b.unwrappedTarget)) {
          b3k.variant_ = eYo.key.EXPRESSION
        } else {
          b3k.variant_ = eYo.key.NONE
        }
      }
    }
  }
})

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.BaseC9r} brick The brick.
 * @param {eYo.MenuManager} mngr - mngr.menu is the menu to populate.
 * @private
 */
eYo.expr.yield_expr.prototype.populateContextMenuFirst_ = function (mngr) {
  var yorn = eYo.expr.yield_expr.populateContextMenuFirst_.call(this, mngr)
  return eYo.expr.yield_expr.eyo.C9r_s.populateContextMenuFirst_.call(this, mngr) || yorn
}

/**
 * Class for a Delegate, yield_stmt.
 * For edython.
 */
eYo.stmt.newC9r('yield_stmt', true, {
  link: eYo.t3.expr.yield_expr
})

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.BaseC9r} brick The brick.
 * @param {eYo.MenuManager} mngr - mngr.menu is the menu to populate.
 * @private
 */
eYo.stmt.yield_stmt.prototype.populateContextMenuFirst_ = function (mngr) {
  eYo.expr.yield_expr.populateContextMenuFirst_.call(this, mngr)
  return eYo.stmt.yield_stmt.eyo.C9r_s.populateContextMenuFirst_.call(this, mngr)
}


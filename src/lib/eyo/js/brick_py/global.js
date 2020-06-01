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
eYo.require('expr.List')

/// /////// gobal/nonlocal statement
/**
 * Class for a Delegate, non_void_identifier_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.List[eYo.$makeSubC9r](eYo.t3.expr.non_void_identifier_list, {
  list: {
    check: eYo.t3.expr.check.non_void_identifier_list,
    presep: ',',
    mandatory: 1
  }
})

/**
 * Class for a Delegate, global_stmt.
 * For edython.
 */
eYo.stmt.makeC9r(eYo.t3.stmt.global_stmt, {
  data: {
    variant: {
      all: [
        eYo.key.PASS,
        eYo.key.CONTINUE,
        eYo.key.BREAK,
        eYo.key.GLOBAL,
        eYo.key.NONLOCAL,
        eYo.key.DEL,
        eYo.key.RETURN
      ],
      init: eYo.key.PASS,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.identifiers_s.incog = after !== eYo.key.GLOBAL && after !== eYo.key.NONLOCAL
        b3k.del_s.incog = after !== eYo.key.DEL
        b3k.return_s.incog = after !== eYo.key.RETURN
      },
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
        },
        load (element) /** @suppress {globalThis} */ {
          this.brick.variant_ = element.getAttribute(eYo.key.EYO)
        }
      },
      fromType (type) /** @suppress {globalThis} */ {
        this.set({
          [eYo.t3.stmt.pass_stmt]: eYo.key.PASS,
          [eYo.t3.stmt.continue_stmt]: eYo.key.CONTINUE,[eYo.t3.stmt.Break_stmt]: eYo.key.BREAK,
          [eYo.t3.stmt.global_stmt]: eYo.key.GLOBAL,
          [eYo.t3.stmt.nonlocal_stmt]: eYo.key.NONLOCAL,
          [eYo.t3.stmt.del_stmt]: eYo.key.DEL,
          [eYo.t3.stmt.return_stmt]: eYo.key.RETURN
        } [type])
      }
    }
  },
  fields: {
    variant: {
      reserved: ''
    }
  },
  slots: {
    identifiers: {
      order: 1,
      promise: eYo.t3.expr.non_void_identifier_list,
      xml: {
        key: 'List',
        save (element) /** @suppress {globalThis} */ {
          var variant = this.brick.Variant_p
          if (variant === eYo.key.GLOBAL || variant === eYo.key.NONLOCAL) {
            this.save(element)
          }
        },
        load (element) /** @suppress {globalThis} */ {
          var variant = this.brick.Variant_p
          if (variant === eYo.key.GLOBAL || variant === eYo.key.NONLOCAL) {
            this.load(element)
          }
        }
      }
    },
    del: {
      order: 2,
      wrap: eYo.t3.expr.target_list,
      xml: {
        key: 'List',
        save (element) /** @suppress {globalThis} */ {
          if (this.brick.variant === eYo.key.DEL) {
            this.save(element)
          }
        },
        load (element) /** @suppress {globalThis} */ {
          if (this.brick.variant === eYo.key.DEL) {
            this.load(element)
          }
        }
      }
    },
    return: {
      order: 3,
      wrap: eYo.t3.expr.optional_expression_list,
      xml: {
        key: 'List',
        save (element) /** @suppress {globalThis} */ {
          if (this.brick.variant === eYo.key.RETURN) {
            this.save(element)
          }
        },
        load (element) /** @suppress {globalThis} */ {
          if (this.brick.variant === eYo.key.RETURN) {
            this.load(element)
          }
        }
      }
    }
  }
})

;[
  'pass',
  'continue',
  'break',
  'nonlocal',
  'del',
  'return'
].forEach((k) => {
  k = k + '_stmt'
  eYo.c9r.register(k, (eYo.stmt[k] = eYo.stmt.global_stmt))
})

/**
 * The type and connection depend on the properties modifier, value and variant.
 * For edython.
 */
eYo.stmt.global_stmt.prototype.getType = eYo.changer.memoize(
  'getType',
  function () {
    this.setupType(
      {
        [eYo.key.PASS]: eYo.t3.stmt.pass_stmt,
        [eYo.key.CONTINUE]: eYo.t3.stmt.continue_stmt,
        [eYo.key.BREAK]: eYo.t3.stmt.break_stmt,
        [eYo.key.GLOBAL]: eYo.t3.stmt.global_stmt,
        [eYo.key.NONLOCAL]: eYo.t3.stmt.nonlocal_stmt,
        [eYo.key.DEL]: eYo.t3.stmt.del_stmt,
        [eYo.key.RETURN]: eYo.t3.stmt.return_stmt
      } [this.Variant_p]
    )
    return this.type
  }
)

/**
 * The xml `eyo` attribute of this brick, as it should appear in the saved data.
 * For edython.
 * @return !String
 */
eYo.stmt.global_stmt.prototype.xmlAttr = function () {
  return this.Variant_p
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.BaseC9r} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.stmt.global_stmt.prototype.populateContextMenuFirst_ = function (mngr) {
  var current = this.Variant_p
  var variants = this.variant_d.getAll()
  var F = (i) => {
    var key = variants[i]
    var content = eYo.dom.createDom(eYo.dom.TagName.SPAN, 'eyo-code',
      eYo.do.CreateSPAN(key, 'eyo-code-reserved')
    )
  }
  F(0)
  F(1)
  F(2)
  mngr.shouldSeparate()
  F = (i) => {
    var key = variants[i]
    var content = eYo.dom.createDom(eYo.dom.TagName.SPAN, 'eyo-code',
      eYo.do.CreateSPAN(key, 'eyo-code-reserved'),
      eYo.do.CreateSPAN(' …', 'eyo-code-placeholder')
    )
  }
  F(3)
  F(4)
  F(5)
  F(6)
  mngr.shouldSeparate()
  return eYo.stmt.global_stmt[eYo.$].C9r_s.populateContextMenuFirst_.call(this, mngr)
}

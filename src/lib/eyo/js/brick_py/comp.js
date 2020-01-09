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

eYo.require('expr.list')

eYo.provide('brick.comprehension')

/**
 * Class for a Delegate, comprehension value brick.
 * Not normally called directly, eYo.Brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.Dflt.makeSubclass('comprehension', {
  data: {
    expression: {
      order: 1,
      init: '',
      placeholder: eYo.msg.placeholder.TERM,
      validate (after) /** @suppress {globalThis} */ {
        var type = eYo.t3.profile.get(after)
        return type.expr === eYo.t3.Expr.identifier
        ? after : eYo.INVALID
      },
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          if (!this.brick.expression_b) {
            this.save(element, opt)
          }
        }
      }
    },
  },
  slots: {
    expression: {
      order: 1,
      check: eYo.t3.Expr.Check.expression_key_datum,
      fields: {
        bind: {
          validate: true,
          endEditing: true,
        }
      }
    },
    for: {
      order: 2,
      fields: {
        label: 'for'
      },
      wrap: eYo.t3.Expr.Target_list
    },
    in: {
      order: 3,
      fields: {
        label: 'in'
      },
      check: eYo.t3.Expr.Check.or_test_all
    },
    for_if: {
      order: 4,
      wrap: eYo.t3.Expr.Comp_iter_list
    }
  },
  out: {
    check (type) /** @suppress {globalThis} */ {
      // `this` is a magnet
      // we do not take the type argument into account
      var eyo = this.brick
      var b = eyo.expression_b
      if (b) {
        if (b.type === eYo.t3.Expr.key_datum || b.type === eYo.t3.Expr.identifier_annotated) {
          return [eYo.t3.Expr.dict_comprehension]
        }
      } else if (!eyo.expression_p.length) {
        return [eYo.t3.Expr.Comprehension, eYo.t3.Expr.dict_comprehension]
      }
      return [eYo.t3.Expr.Comprehension]
    }
  }
}, true)

/**
 * getBaseType.
 * The type depends on the variant and the modifiers.
 * As side effect, the subtype is set.
 */
eYo.expr.Comprehension.prototype.getBaseType = function () {
  var check = this.out_m.check_
  return (check && check[0]) || eYo.t3.Expr.Comprehension
}

;['dict_comprehension'].forEach(k => {
  eYo.C9r.register(k, (eYo.expr[k] = eYo.expr.comprehension))
})

/**
 * The xml tag name of this brick, as it should appear in the saved data.
 * For edython.
 * @return attr name
 */
eYo.expr.Comprehension.prototype.xmlAttr = function () {
  return 'comprehension'
}

/**
 * Class for a Delegate, comp_for brick.
 * Not normally called directly, eYo.Brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.Dflt.makeSubclass('comp_for', {
  slots: {
    for: {
      order: 1,
      fields: {
        label: 'for'
      },
      wrap: eYo.t3.Expr.Target_list
    },
    in: {
      order: 2,
      fields: {
        label: 'in'
      },
      check: eYo.t3.Expr.Check.or_test_all
    }
  }
}, true)

/**
 * Class for a Delegate, comp_if brick.
 * Not normally called directly, eYo.Brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.Dflt.makeSubclass('comp_if', {
  slots: {
    if: {
      order: 1,
      fields: {
        label: 'if'
      },
      check: eYo.t3.Expr.Check.expression_nocond
    }
  }
}, true)

/**
 * Class for a Delegate, comp_iter_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.Brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.list.makeSubclass('comp_iter_list', {
  list: {
    check: eYo.t3.Expr.Check.Comp_iter,
    mandatory: 0,
    presep: ''
  }
})

eYo.Brick.Comprehension.T3s = [
  eYo.t3.Expr.Comprehension,
  eYo.t3.Expr.Comp_for,
  eYo.t3.Expr.Comp_if,
  eYo.t3.Expr.Comp_iter_list,
  eYo.t3.Expr.dict_comprehension,
  eYo.t3.Expr.identifier,
]

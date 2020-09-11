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

eYo.require('expr.List')

eYo.provide('brick.comprehension')

/**
 * Class for a Delegate, comprehension value brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.newC9r('comprehension', true, {
  data: {
    expression: {
      order: 1,
      init: '',
      placeholder: eYo.msg.placeholder.TERM,
      validate (after) /** @suppress {globalThis} */ {
        var type = eYo.t3.profile.get(after)
        return type.expr === eYo.t3.expr.identifier
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
      check: eYo.t3.expr.check.expression_key_datum,
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
      wrap: eYo.t3.expr.target_list
    },
    in: {
      order: 3,
      fields: {
        label: 'in'
      },
      check: eYo.t3.expr.check.or_test_all
    },
    for_if: {
      order: 4,
      wrap: eYo.t3.expr.comp_iter_list
    }
  },
  out: {
    check (type) /** @suppress {globalThis} */ { // eslint-disable-line
      // `this` is a magnet
      // we do not take the type argument into account
      var eyo = this.brick
      var b = eyo.expression_b
      if (b) {
        if (b.type === eYo.t3.expr.key_datum || b.type === eYo.t3.expr.identifier_annotated) {
          return [eYo.t3.expr.dict_comprehension]
        }
      } else if (!eyo.Expression_p.length) {
        return [eYo.t3.expr.comprehension, eYo.t3.expr.dict_comprehension]
      }
      return [eYo.t3.expr.comprehension]
    }
  }
})

/**
 * getBaseType.
 * The type depends on the variant and the modifiers.
 * As side effect, the subtype is set.
 */
eYo.expr.comprehension_p.getBaseType = function () {
  var check = this.out_m.check_
  return (check && check[0]) || eYo.t3.expr.comprehension
}

;['dict_comprehension'].forEach(k => {
  eYo.c3s.register(k, (eYo.expr[k] = eYo.expr.comprehension))
})

/**
 * The xml tag name of this brick, as it should appear in the saved data.
 * For edython.
 * @return attr name
 */
eYo.expr.comprehension_p.xmlAttr = function () {
  return 'comprehension'
}

/**
 * Class for a Delegate, comp_for brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.newC9r('comp_for', true, {
  slots: {
    for: {
      order: 1,
      fields: {
        label: 'for'
      },
      wrap: eYo.t3.expr.target_list
    },
    in: {
      order: 2,
      fields: {
        label: 'in'
      },
      check: eYo.t3.expr.check.or_test_all
    }
  }
})

/**
 * Class for a Delegate, comp_if brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.newC9r('comp_if', true, {
  slots: {
    if: {
      order: 1,
      fields: {
        label: 'if'
      },
      check: eYo.t3.expr.check.expression_nocond
    }
  }
})

/**
 * Class for a Delegate, comp_iter_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.List[eYo.$newSubC9r]('comp_iter_list', {
  list: {
    check: eYo.t3.expr.check.comp_iter,
    mandatory: 0,
    presep: ''
  }
})

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

eYo.require('Brick.List')

eYo.provide('Brick.Comprehension')

/**
 * Class for a Delegate, comprehension value brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Expr.Dflt.makeSubclass('comprehension', {
  data: {
    expression: {
      order: 1,
      init: '',
      placeholder: eYo.Msg.Placeholder.TERM,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.T3.Profile.get(newValue)
        return type.expr === eYo.T3.Expr.identifier
        ? {validated: newValue} : null
      },
      synchronize: true,
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
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
      check: eYo.T3.Expr.Check.expression_key_datum,
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
      wrap: eYo.T3.Expr.target_list
    },
    in: {
      order: 3,
      fields: {
        label: 'in'
      },
      check: eYo.T3.Expr.Check.or_test_all
    },
    for_if: {
      order: 4,
      wrap: eYo.T3.Expr.comp_iter_list
    }
  },
  out: {
    check: /** @suppress {globalThis} */ function (type) {
      // `this` is a magnet
      // we do not take the type argument into account
      var eyo = this.brick
      var b = eyo.expression_b
      if (b) {
        if (b.type === eYo.T3.Expr.key_datum || b.type === eYo.T3.Expr.identifier_annotated) {
          return [eYo.T3.Expr.dict_comprehension]
        }
      } else if (!eyo.expression_p.length) {
        return [eYo.T3.Expr.comprehension, eYo.T3.Expr.dict_comprehension]
      }
      return [eYo.T3.Expr.comprehension]
    }
  }
}, true)

/**
 * getBaseType.
 * The type depends on the variant and the modifiers.
 * As side effect, the subtype is set.
 */
eYo.Expr.comprehension.prototype.getBaseType = function () {
  var check = this.out_m.check_
  return (check && check[0]) || eYo.T3.Expr.comprehension
}

;['dict_comprehension'].forEach(k => {
  eYo.Expr[k] = eYo.Expr.comprehension
  eYo.Brick.mngr.register(k)
})

/**
 * The xml tag name of this brick, as it should appear in the saved data.
 * For edython.
 * @return attr name
 */
eYo.Expr.comprehension.prototype.xmlAttr = function () {
  return 'comprehension'
}

/**
 * Class for a Delegate, comp_for brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Expr.Dflt.makeSubclass('comp_for', {
  slots: {
    for: {
      order: 1,
      fields: {
        label: 'for'
      },
      wrap: eYo.T3.Expr.target_list
    },
    in: {
      order: 2,
      fields: {
        label: 'in'
      },
      check: eYo.T3.Expr.Check.or_test_all
    }
  }
}, true)

/**
 * Class for a Delegate, comp_if brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Expr.Dflt.makeSubclass('comp_if', {
  slots: {
    if: {
      order: 1,
      fields: {
        label: 'if'
      },
      check: eYo.T3.Expr.Check.expression_nocond
    }
  }
}, true)

/**
 * Class for a Delegate, comp_iter_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.List.makeSubclass('comp_iter_list', {
  list: {
    check: eYo.T3.Expr.Check.comp_iter,
    mandatory: 0,
    presep: ''
  }
})

/**
 * Class for a Delegate, key_datum brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Expr.Dflt.makeSubclass('key_datum', {
  slots: {
    key: {
      order: 1,
      check: eYo.T3.Expr.Check.expression,
      placeholder: eYo.Msg.Placeholder.KEY
    },
    datum: {
      order: 2,
      fields: {
        label: ':'
      },
      check: eYo.T3.Expr.Check.expression,
      placeholder: eYo.Msg.Placeholder.VALUE
    }
  }
}, true)

eYo.Brick.Comprehension.T3s = [
  eYo.T3.Expr.comprehension,
  eYo.T3.Expr.comp_for,
  eYo.T3.Expr.comp_if,
  eYo.T3.Expr.comp_iter_list,
  eYo.T3.Expr.dict_comprehension,
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.key_datum,
]

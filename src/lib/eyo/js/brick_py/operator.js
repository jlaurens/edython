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

goog.require('eYo.Expr')

goog.provide('eYo.Brick.Operator')

/**
 * Class for a Delegate, [...] op ... brick.
 * Multiple ops.
 * Abstract class.
 * For edython.
 */
eYo.Expr.Dflt.makeSubclass('binary', {
  data: {
    operator: { // only one field with that key,
      init: '+',
      validate: /** @suppress {globalThis} */ function (newValue) {
        var m = eYo.Expr.binary.getTypeForOperator(newValue)
        return m !== eYo.T3.Expr.unset
          ? {validated: newValue}
          : null
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var d = this.field.ui_driver_mgr
        d && (d.makeReserved(this.field, ['in', 'or', 'and'].indexOf(newValue) >= 0))
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Expr.m_expr) {
          this.set('*')
        } else if (type === eYo.T3.Expr.a_expr) {
          this.set('+')
        } else if (type === eYo.T3.Expr.or_test) {
          this.set('or')
        } else if (type === eYo.T3.Expr.and_test) {
          this.set('and')
        } else if (type === eYo.T3.Expr.power) {
          this.set('**')
        } else if (type === eYo.T3.Expr.shift_expr) {
          this.set('<<')
        } else if (type === eYo.T3.Expr.and_expr) {
          this.set('&')
        } else if (type === eYo.T3.Expr.xor_expr) {
          this.set('^')
        } else if (type === eYo.T3.Expr.or_expr) {
          this.set('|')
        } else if (type === eYo.T3.Expr.number_comparison) {
          this.set('<')
        } else if (type === eYo.T3.Expr.object_comparison) {
          this.set('in')
        }
      }
    },
    lhs: {
      init: '',
      synchronize: true
    },
    rhs: {
      init: '',
      synchronize: true
    }
  },
  slots: {
    lhs: {
      order: 1,
      fields: {
        bind: {
          endEditing: true,
          placeholder: /** @suppress {globalThis} */ function () {
            var type = this.brick.type
            return {
              [eYo.T3.Expr.m_expr]: 1,
              [eYo.T3.Expr.a_expr]: 1,
              [eYo.T3.Expr.or_test]: 'test',
              [eYo.T3.Expr.and_test]: 'test',
              [eYo.T3.Expr.power]: 1,
              [eYo.T3.Expr.shift_expr]: 1,
              [eYo.T3.Expr.and_expr]: 1,
              [eYo.T3.Expr.xor_expr]: 1,
              [eYo.T3.Expr.or_expr]: 1,
              [eYo.T3.Expr.number_comparison]: '1',
              [eYo.T3.Expr.object_comparison]: 'object'
            } [type]
          }
        }
      },
      check: /** @suppress {globalThis} */ function (type) {
        var m = eYo.Expr.binary.getOperatorModelForType(type)
        if (!m) {
          console.error('NO MODEL FOR', type)
        }
        return m && m.lhs
      }
    },
    rhs: {
      order: 2,
      fields: {
        operator: {
          order: 1,
          value: ''
        },
        bind: {
          order: 2,
          endEditing: true,
          placeholder: /** @suppress {globalThis} */ function () {
            var type = this.brick.type
            return {
              [eYo.T3.Expr.m_expr]: 1,
              [eYo.T3.Expr.a_expr]: 1,
              [eYo.T3.Expr.or_test]: 'test',
              [eYo.T3.Expr.and_test]: 'test',
              [eYo.T3.Expr.power]: 1,
              [eYo.T3.Expr.shift_expr]: 1,
              [eYo.T3.Expr.and_expr]: 1,
              [eYo.T3.Expr.xor_expr]: 1,
              [eYo.T3.Expr.or_expr]: 1,
              [eYo.T3.Expr.number_comparison]: '1',
              [eYo.T3.Expr.object_comparison]: 'container'
            } [type]
          }
        }
      },
      check: /** @suppress {globalThis} */ function (type) {
        var m = eYo.Expr.binary.getOperatorModelForType(type)
        return m && m.rhs
      }
    }
  },
  out: {
    check: /** @suppress {globalThis} */ function (type) {
      return type
    }
  }
})

eYo.T3.Expr.Check.binary.forEach(t => {
  if (t !== eYo.T3.Expr.any) {
    t = t.substring(4)
    eYo.Expr[t] = eYo.Expr.binary
    eYo.Brick.Mgr.register(t)
  }
})

;[
  'power',
  'and_test',
  'or_test',
  'comparison',
  'number_comparison',
  'object_comparison'
].forEach(t => {
  eYo.Expr[t] = eYo.Expr.binary
  eYo.Brick.Mgr.register(t)
})

/**
 * Get the operator model.
 * For edython.
 * @return a dictionary
 */
eYo.Expr.binary.getOperatorModelForType = function (type) {
  return {
    [eYo.T3.Expr.m_expr]: {
      lhs: eYo.T3.Expr.Check.m_expr_all,
      rhs: eYo.T3.Expr.Check.u_expr_all
    },
    [eYo.T3.Expr.a_expr]: {
      lhs: eYo.T3.Expr.Check.a_expr_all,
      rhs: eYo.T3.Expr.Check.m_expr_all
    },
    [eYo.T3.Expr.or_test]: {
      lhs: eYo.T3.Expr.Check.or_test_all,
      rhs: eYo.T3.Expr.Check.and_test_all
    },
    [eYo.T3.Expr.and_test]: {
      lhs: eYo.T3.Expr.Check.and_test_all,
      rhs: eYo.T3.Expr.Check.not_test_all
    },
    [eYo.T3.Expr.power]: {
      lhs: eYo.T3.Expr.Check.await_or_primary,
      rhs: eYo.T3.Expr.Check.u_expr_all
    },
    [eYo.T3.Expr.shift_expr]: {
      lhs: eYo.T3.Expr.Check.shift_expr_all,
      rhs: eYo.T3.Expr.Check.a_expr_all
    },
    [eYo.T3.Expr.and_expr]: {
      lhs: eYo.T3.Expr.Check.and_expr_all,
      rhs: eYo.T3.Expr.Check.shift_expr_all
    },
    [eYo.T3.Expr.xor_expr]: {
      lhs: eYo.T3.Expr.Check.xor_expr_all,
      rhs: eYo.T3.Expr.Check.and_expr_all
    },
    [eYo.T3.Expr.or_expr]: {
      lhs: eYo.T3.Expr.Check.or_expr_all,
      rhs: eYo.T3.Expr.Check.xor_expr_all
    },
    [eYo.T3.Expr.comparison]: {
      lhs: eYo.T3.Expr.Check.comparison,
      rhs: eYo.T3.Expr.Check.comparison
    },
    [eYo.T3.Expr.number_comparison]: {
      lhs: eYo.T3.Expr.Check.comparison,
      rhs: eYo.T3.Expr.Check.comparison
    },
    [eYo.T3.Expr.object_comparison]: {
      lhs: eYo.T3.Expr.Check.comparison,
      rhs: eYo.T3.Expr.Check.comparison
    }
  } [type]
}

/**
 * Get the operator model.
 * For edython.
 * @return a dictionary
 */
eYo.Expr.binary.getTypeForOperator = function (op) {
  if (['*', '//', '/', '%', '@'].indexOf(op) >= 0) {
    return eYo.T3.Expr.m_expr
  }
  if (['+', '-'].indexOf(op) >= 0) {
    return eYo.T3.Expr.a_expr
  }
  if (['<', '>', '==', '>=', '<=', '!='].indexOf(op) >= 0) {
    return eYo.T3.Expr.number_comparison
  }
  if ('or' === op) {
    return eYo.T3.Expr.or_test
  }
  if ('and' === op) {
    return eYo.T3.Expr.and_test
  }
  if (['is', 'is not', 'in', 'not in'].indexOf(op) >= 0) {
    return eYo.T3.Expr.object_comparison
  }
  if ('**' === op) {
    return eYo.T3.Expr.power
  }
  if (['<<', '>>'].indexOf(op) >= 0) {
    return eYo.T3.Expr.shift_expr
  }
  if ('&' === op) {
    return eYo.T3.Expr.and_expr
  }
  if ('^' === op) {
    return eYo.T3.Expr.xor_expr
  }
  if ('|' === op) {
    return eYo.T3.Expr.or_expr
  }
  return eYo.T3.Expr.unset
}

/**
 * The xml `eyo` attribute of this brick, as it should appear in the saved data.
 * For edython.
 * @return !String
 */
eYo.Expr.binary.prototype.xmlAttr = function () {
  var type = this.type
  return type.endsWith('comparison') ? 'comparison' : type.substring(4)
}

/**
 * Consolidate the type of the brick.
 * Unstable state.
 * For edython.
 */
eYo.Expr.binary.prototype.getBaseType = function () {
  return this.constructor.getTypeForOperator(this.operator_p)
}

eYo.T3.Expr.unary = 'eyo:unary' // don't forget it !

/**
 * Class for a Delegate, unary op ... brick.
 * u_expr.
 * For edython.
 */
eYo.Expr.Dflt.makeSubclass('unary', {
  xml: {
    types: [
      eYo.T3.Expr.u_expr,
      eYo.T3.Expr.not_test
    ],
    attr: 'unary'
  },
  data: {
    operator: {
      all: ['-', '+', '~', 'not'],
      init: '-',
      validate: /** @suppress {globalThis} */ function (newValue) {
        var m = eYo.Expr.unary.getTypeForOperator(newValue)
        return m !== eYo.T3.Expr.unset
          ? {validated: newValue}
          : null
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var d = this.field.ui_driver_mgr
        d && (d.makeReserved(this.field, newValue === 'not'))
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Expr.not_test) {
          this.set('not')
        }
      }
    },
    rhs: {
      init: '',
      placeholder: /** @suppress {globalThis} */ function (type) {
        return type === eYo.T3.Expr.not_test
         ? 'test'
         : 1
      },
      synchronize: true
    }
  },
  slots: {
    rhs: {
      order: 1000,
      fields: {
        operator: {
          order: 1,
          value: ''
        },
        bind: {
          order: 2,
          validate: true,
          endEditing: true
        }
      },
      check: /** @suppress {globalThis} */ function (type) {
        var m = eYo.Expr.unary.getOperatorModelForType(type)
        return m && m.rhs
      }
    }
  },
  out: {
    check: /** @suppress {globalThis} */ function (type) {
      return type
    }
  }
})

;[
  'u_expr',
  'not_test'
].forEach((k) => {
  eYo.Expr[k] = eYo.Expr.unary
  eYo.Brick.Mgr.register(k)
})

/**
 * Get the operator model.
 * For edython.
 * @return a dictionary
 */
eYo.Expr.unary.getOperatorModelForType = function (type) {
  return {
    [eYo.T3.Expr.u_expr]: {
      rhs: eYo.T3.Expr.Check.u_expr_all
    },
    [eYo.T3.Expr.not_test]: {
      rhs: eYo.T3.Expr.Check.not_test_all
    }
  } [type]
}

/**
 * Get the operator model.
 * For edython.
 * @return a dictionary
 */
eYo.Expr.unary.prototype.getOperatorModel = function () {
  var op = this.operator_p
  return eYo.Expr.unary.getOperatorModel(op)
}

/**
 * Consolidate the type of the brick.
 * Unstable state.
 * For edython.
 */
eYo.Expr.unary.prototype.getBaseType = function () {
  return this.constructor.getTypeForOperator(this.operator_p)
}

/**
 * Get the operator model.
 * For edython.
 * @return a dictionary
 */
eYo.Expr.unary.getTypeForOperator = function (op) {
  if (['+', '-', '~'].indexOf(op) >= 0) {
    return eYo.T3.Expr.u_expr
  }
  if ('not' === op) {
    return eYo.T3.Expr.not_test
  }
  return eYo.T3.Expr.unset
}

eYo.Brick.Operator.T3s = [
  eYo.T3.Expr.u_expr,
  eYo.T3.Expr.m_expr,
  eYo.T3.Expr.a_expr,
  eYo.T3.Expr.shift_expr,
  eYo.T3.Expr.and_expr,
  eYo.T3.Expr.xor_expr,
  eYo.T3.Expr.or_expr,
  eYo.T3.Expr.number_comparison,
  eYo.T3.Expr.object_comparison,
  eYo.T3.Expr.or_test,
  eYo.T3.Expr.and_test,
  eYo.T3.Expr.power
]

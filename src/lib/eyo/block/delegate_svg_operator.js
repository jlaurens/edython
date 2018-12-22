/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Operator')

goog.require('eYo.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, [...] op ... block.
 * Multiple ops.
 * Abstract class.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('binary', {
  data: {
    operator: { // only one field with that key,
      init: '+',
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var root = this.field && this.field.getSvgRoot()
        if (root) {
          if (['in', 'or', 'and'].indexOf(newValue) >= 0) {
            goog.dom.classlist.add(root, 'eyo-code-reserved')
          } else {
            goog.dom.classlist.remove(root, 'eyo-code-reserved')
          }
        }
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
      hole_value: 'name',
      fields: {
        bind: {
          endEditing: true,
          placeholder: /** @suppress {globalThis} */ function () {
            var type = this.eyo.b_eyo.type
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
        var m = eYo.DelegateSvg.Expr.binary.getOperatorModelForType(type)
        if (!m) {
          console.error('NO MODEL FOR', type)
        }
        return eYo.DelegateSvg.Expr.binary.getOperatorModelForType(type).lhs
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
            var type = this.eyo.b_eyo.type
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
      hole_value: 'name',
      check: /** @suppress {globalThis} */ function (type) {
        return eYo.DelegateSvg.Expr.binary.getOperatorModelForType(type).rhs
      }
    }
  }
})

for (var _ = 0, t;(t = eYo.T3.Expr.Check.binary[_++]);) {
  if (t !== eYo.T3.Expr.any) {
    t = t.substring(4)
    eYo.DelegateSvg.Expr[t] = eYo.DelegateSvg.Expr.binary
    eYo.DelegateSvg.Manager.register(t)
  }
}

for (var _ = 0, t;(t = [
  eYo.T3.Expr.power,
  eYo.T3.Expr.and_test,
  eYo.T3.Expr.or_test,
  eYo.T3.Expr.number_comparison,
  eYo.T3.Expr.object_comparison
][_++]);) {
  t = t.substring(4)
  eYo.DelegateSvg.Expr[t] = eYo.DelegateSvg.Expr.binary
  eYo.DelegateSvg.Manager.register(t)
}

/**
 * Get the operator model.
 * For edython.
 * @return a dictionary
 */
eYo.DelegateSvg.Expr.binary.getOperatorModelForType = function (type) {
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
eYo.DelegateSvg.Expr.binary.getTypeForOperator = function (op) {
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
  console.error("UNKNOWN OPERATOR", op)
  return eYo.T3.Expr.unset
}

/**
 * The xml `eyo` attribute of this block, as it should appear in the saved data.
 * For edython.
 * @return true if the given value is accepted, false otherwise
 */
eYo.DelegateSvg.Expr.binary.prototype.xmlAttr = function () {
  var type = this.type
  return type.endsWith('comparison') ? 'comparison' : type.substring(4)
}

/**
 * Consolidate the type of the block.
 * Unstable state.
 * For edython.
 */
eYo.DelegateSvg.Expr.binary.prototype.getBaseType = function () {
  return this.constructor.getTypeForOperator(this.operator_p)
}

eYo.T3.Expr.unary = 'eyo:unary' // don't forget it !

/**
 * Class for a DelegateSvg, unary op ... block.
 * u_expr.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('unary', {
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
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var root = this.field && this.field.getSvgRoot()
        if (root) {
          if (newValue === 'not') {
            goog.dom.classlist.add(root, 'eyo-code-reserved')
          } else {
            goog.dom.classlist.remove(root, 'eyo-code-reserved')
          }
        }
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
        return eYo.DelegateSvg.Expr.unary.getOperatorModelForType(type).rhs
      }
    }
  },
  output: {
    check: /** @suppress {globalThis} */ function (type) {
      return type
    }
  }
})

var names = [
  'u_expr',
  'not_test'
]
names.forEach((k) => {
  eYo.DelegateSvg.Expr[k] = eYo.DelegateSvg.Expr.unary
  eYo.DelegateSvg.Manager.register(k)
})

/**
 * Get the operator model.
 * For edython.
 * @return a dictionary
 */
eYo.DelegateSvg.Expr.unary.getOperatorModelForType = function (type) {
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
eYo.DelegateSvg.Expr.unary.prototype.getOperatorModel = function () {
  var op = this.operator_p
  return eYo.DelegateSvg.Expr.unary.getOperatorModel(op)
}

/**
 * Consolidate the type of the block.
 * Unstable state.
 * For edython.
 */
eYo.DelegateSvg.Expr.unary.prototype.getBaseType = function () {
  return this.constructor.getTypeForOperator(this.operator_p)
}

/**
 * Get the operator model.
 * For edython.
 * @return a dictionary
 */
eYo.DelegateSvg.Expr.unary.getTypeForOperator = function (op) {
  if (['+', '-', '~'].indexOf(op) >= 0) {
    return eYo.T3.Expr.u_expr
  }
  if ('not' === op) {
    return eYo.T3.Expr.not_test
  }
  console.error("UNKNOWN OPERATOR", op)
  return eYo.T3.Expr.unset
}

eYo.DelegateSvg.Operator.T3s = [
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

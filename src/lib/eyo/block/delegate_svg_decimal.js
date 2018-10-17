/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Decimal module blocks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Decimal')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Stmt')

goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Primary')

goog.require('eYo.Tooltip')
goog.require('eYo.FlyoutCategory')

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */

var F = function (name, title) {
  var key = 'decimal__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.call_expr,
    data: {
      name: name,
      module: 'decimal',
      dotted: 0
    },
    title: key
  }
}
var F_k = function (name, title) {
  var key = 'decimal__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.call_expr,
    data: {
      name: name,
      module: 'decimal',
      dotted: 0
    },
    title: key
  }
}
/*
    'Decimal': 0,
    'getcontext': 1,
    'setcontext': 2,
    'localcontext': 3,
    'BasicContext': 4,
    'ExtendedContext': 5,
    'DefaultContext': 6,
    'Context': 7,
    'MAX_PREC': 8,
    'MAX_EMAX': 9,
    'MIN_EMIN': 10,
    'MIN_ETINY': 11,
    'HAVE_THREADS': 12,
    'ROUND_CEILING': 13,
    'ROUND_DOWN': 14,
    'ROUND_FLOOR': 15,
    'ROUND_HALF_DOWN': 16,
    'ROUND_HALF_EVEN': 17,
    'ROUND_HALF_UP': 18,
    'ROUND_UP': 19,
    'ROUND_05UP': 20,
    'Clamped': 21,
    'DecimalException': 22,
    'DivisionByZero': 23,
    'Inexact': 24,
    'InvalidOperation': 25,
    'Overflow': 26,
    'Rounded': 27,
    'Subnormal': 28,
    'Underflow': 29,
    'FloatOperation': 30
 
    */
eYo.FlyoutCategory.basic_decimal__module = [
  {
    type: eYo.T3.Expr.call_expr,
    data: {
      name: 'decimal',
      dotted: 0
    }
  },
  /*
  <s eyo="assignment" variant="name">
  <x eyo="primary" dotted="1"><x eyo="call" dotted="1" holder="decimal" name="getcontext" slot="holder"></x><x eyo="identifier" name="prec" slot="name"></x></x>
  <x eyo="call" dotted="1" holder="decimal" name="getcontext" slot="holder"></x>
  </x>
  <x eyo="list" slot="assigned">
  <x eyo="literal" slot="O">28</x>
  </x>
  </s>
  */
  {
    type: eYo.T3.Stmt.import_stmt,
    data: {
      variant: eYo.Key.FROM_MODULE_IMPORT_STAR,
      from: 'decimal'
    }
  },
  {
    type: eYo.T3.Stmt.assignment_stmt,
    slots: {
      assigned: {
        slots: {
          O: {
            type: eYo.T3.Expr.call_expr,
            data: {
              holder: 'decimal',
              name: 'Decimal',
              dotted: 0
            }
          },
        },
      },
    },
  },
  /*
  <x eyo="primary" dotted="1" xmlns="urn:edython:1.0" xmlns:eyo="urn:edython:1.0"><x eyo="call" dotted="1" holder="decimal" name="getcontext" slot="holder"></x><x eyo="identifier" name="prec" slot="name"></x></x>
  */
  {
    type: eYo.T3.Stmt.assignment_stmt,
    slots: {
      name: {

      },
      assigned: {
        slots: {
          O: {
            type: eYo.T3.Expr.call_expr,
            data: {
              holder: 'decimal',
              name: 'Decimal',
              dotted: 0
            }
          },
        },
      },
    },
  },
  F('getcontext', 'Le contexte de calcul'),
  F_k('tau', 'τ (≅ 2π)'),
]

var F = function (name, title) {
  var key = 'decimal__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.call_expr,
    data: {
      name: name,
      holder: 'decimal',
      dotted: 1
    },
    title: key
  }
}
var F_k = function (name, title) {
  var key = 'decimal__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.attributeref,
    data: {
      name: name,
      holder: 'decimal',
      dotted: 1
    },
    title: key
  }
}

eYo.FlyoutCategory.decimal__module = [
  {
    type: eYo.T3.Expr.call_expr,
    data: {
      name: 'complex',
      dotted: 0
    }
  },
  {
    type: eYo.T3.Expr.attributeref,
    data: {
      name: 'real',
      dotted: 1
    }
  },
  {
    type: eYo.T3.Expr.attributeref,
    data: {
      name: 'imag',
      dotted: 1
    }
  },
  {
    type: eYo.T3.Expr.call_expr,
    data: {
      name: 'conjugate',
      ary: 0,
      dotted: 1
    }
  },
  {
    type: eYo.T3.Stmt.import_stmt,
    data: {
      variant: eYo.Key.IMPORT
    },
    slots: {
      import_module: {
        slots: {
          O: {
            type: eYo.T3.Expr.identifier,
            data: 'decimal',
          },
        },
      }
    },
  },

  F('phase', ''),
  F('polar', ''),
  F('rect', ''),

  F('sqrt', 'Racine carrée (square root)'),
  F('exp', 'Fonction exponentielle'),
  F('log', 'Fonction logarithme népérien, donner un deuxième argument pour changer de base'),
  F('log10', 'Fonction logarithme de base 10 avec une meilleure précision que log(x, 10)'),
  F('cos', 'Fonction cosinus'),
  F('sin', 'Fonction sinus'),
  F('tan', 'Fonction tangente'),
  F('acos', 'Fonction arc cosinus'),
  F('asin', 'Fonction arc sinus'),
  F('atan', 'Fonction arc tangente'),

  F('cosh', 'Fonction cosinus hyperbolique (ch)'),
  F('sinh', 'Fonction sinus hyperbolique (sh)'),
  F('tanh', 'Fonction tangente hyperbolique (th)'),
  F('acosh', 'Fonction arc cosinus hyperbolique (argch)'),
  F('asinh', 'Fonction arc sinus hyperbolique (argsh)'),
  F('atanh', 'Fonction arc tangente hyperbolique (argth)'),

  F('isclose', 'Teste si deux valeurs sont proches'),
  F('isfinite', 'Teste si l\'argument est un nombre fini'),
  F('isinf', 'Teste si l\'argument est infini (au sens informatique)'),
  F('isnan', 'Teste si l\'argument n\'est pas un nombre (Not A Number)'),

  F_k('pi', '≅ π'),
  F_k('e', 'Constante d\'Euler (≅)'),
  F_k('tau', 'τ (≅ 2π)'),
  F_k('inf', '∞'),
  F_k('infj', '∞ imaginaire pur'),
  F_k('nan', 'nan (not a number)'),
  F_k('nanj', 'nan imaginaire pur')
]

goog.mixin(eYo.Tooltip.Title, {
  decimal__import_stmt: 'Importer le module decimal',
})

eYo.DelegateSvg.Decimal.T3s = [
  eYo.T3.Expr.decimal__const
]

/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Decimal module bricks for edython. BROKEN IN BRYTHON.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Brick.Decimal')

goog.require('eYo.Msg')
goog.require('eYo.Brick.Stmt')

goog.require('eYo.Brick.List')
goog.require('eYo.Brick.Primary')

goog.require('eYo.Tooltip')
goog.require('eYo.FlyoutCategory')

goog.require('eYo.Model.decimal__module')

/**
 * Populate the context menu for the given brick.
 * @param {!Blockly.Block} brick The brick.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */

var doit = (() => {

var F = (name, title) => {
  var key = 'decimal__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.call_expr,
    name_p: name,
    holder_p: 'decimal',
    dotted_p: 0,
    title: key
  }
}
var F_k = (name, title) => {
  var key = 'decimal__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.identifier,
    name_p: name,
    holder_p: 'decimal',
    dotted_p: 0,
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
    type: eYo.T3.Stmt.import_stmt,
    from_p: 'decimal',
    star_p: true,
    title: 'decimal__import_stmt'
  },
  F('Decimal', 'Retourne une représentation d\'un nombre décimal, dans un certain contexte.'),
  {
    type: eYo.T3.Stmt.assignment_stmt,
    value_s: {
      slots: {
        O: {
          type: eYo.T3.Expr.call_expr,
          name_p: 'Decimal',
          holder_p: 'decimal',
          dotted_p: 0,
          n_ary_s: {
            slots: {
              O: 0.1
            }
          }
        }
      },
    },
    title: 'decimal__assigned_from_string'
  },
  {
    type: eYo.T3.Stmt.assignment_stmt,
    value_s: {
      slots: {
        O: {
          type: eYo.T3.Expr.call_expr,
          name_p: 'Decimal',
          holder_p: 'decimal',
          dotted_p: 0,
          n_ary_s: {
            slots: {
              O: 0.1
            }
          }
        }
      }
    },
    title: 'decimal__assigned_from_float'
  },
  {
    type: eYo.T3.Stmt.assignment_stmt,
    target_s: {
      slots: {
        O: {
          type: eYo.T3.Expr.attributeref,
          holder_s: {
            type: eYo.T3.Expr.call_expr,
            name_p: 'getcontext',
            dotted_p: 0
          },
          dotted_p: 1,
          name_p: 'prec'
        }
      }
    },
    value_s: {
      slots: {
        O: 50
      }
    },
    title: 'decimal__assigned_prec'
  }
]

var F = (name, title) => {
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
var F_k = (name, title) => {
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
    type: eYo.T3.Stmt.import_stmt,
    import_module_s: {
      slots: {
        O: {
          type: eYo.T3.Expr.identifier,
          name_p: 'decimal'
        }
      }
    }
  },
  {
    type: eYo.T3.Stmt.import_stmt,
    from_p: 'decimal',
    import_s: {
      slots: {
        O: {
          type: eYo.T3.Expr.identifier_as,
          name_p: 'Decimal',
          alias_p: 'D'
        }
      }
    }
  },
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

  (createOneBlock) => {
    [
      'ROUND_CEILING',
      'ROUND_DOWN',
      'ROUND_FLOOR',
      'ROUND_HALF_DOWN',
      'ROUND_HALF_EVEN',
      'ROUND_HALF_UP',
      'ROUND_UP',
      'ROUND_05UP'
    ].forEach(key => {
      createOneBlock({
        type: eYo.T3.Expr.identifier,
        name_p: key,
        holder_p: 'decimal',
        dotted_p: 1,
        title: eYo.Msg[key] // to be changed to a tooltip key
      })
    })
  }
]
})()

goog.mixin(eYo.Tooltip.Title, {
  decimal__import_stmt: 'Importer le module decimal',
  decimal__assigned_from_float: 'Créer une représentation d\'un nombre décimal à partir d\'un flottant et l\'affecter à une variable.',
  decimal__assigned_from_string: 'Créer une représentation d\'un nombre décimal à partir d\'un texte et l\'affecter à une variable.',
  decimal__assigned_contexte: 'Obtenir le contexte de calcul et l\'affecter à une variable.',
  decimal__assigned_prec: 'Modifier la précision des calculs à venir.'
})

eYo.Brick.Decimal.T3s = [
  eYo.T3.Expr.decimal__const
]

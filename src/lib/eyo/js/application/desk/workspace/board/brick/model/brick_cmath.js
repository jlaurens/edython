/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview CMath module bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('Brick')

eYo.require('Msg')

eYo.require('Stmt')
eYo.require('Expr.List')

eYo.require('Expr.Primary')
eYo.require('Tooltip')

eYo.require('Library')
eYo.provide('Brick.CMath')

;(function () {

  var F = (name, title) => {
    var key = 'cmath__'+name
    title && (eYo.Tooltip.Title[key] = title)
    return {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: name,
        holder: 'cmath',
        dotted: 0
      },
      title: key
    }
  }
  var F_k = (name, title) => {
    var key = 'cmath__'+name
    title && (eYo.Tooltip.Title[key] = title)
    return {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: name,
        holder: 'cmath',
        dotted: 0
      },
      title: key
    }
  }

eYo.Library.basic_cmath__module = [
  {
    type: eYo.T3.Expr.call_expr,
    data: {
      name: 'complex',
      dotted: 0
    }
  },
  {
    type: eYo.T3.Expr.attributeref,
    name_p: 'real',
    dotted_p: 1
  },
  {
    type: eYo.T3.Expr.attributeref,
    name_p: 'imag',
    dotted_p: 1
  },
  {
    type: eYo.T3.Expr.call_expr,
    name_p: 'conjugate',
    ary_p: 0,
    dotted: 1
  },
  {
    type: eYo.T3.Stmt.import_stmt,
    from_p: 'cmath',
    variant_p: eYo.Key.FROM_MODULE_IMPORT_STAR
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

  F('isclose', 'Teste si deux valeurs sont proches'),

  F_k('pi', '≅ π'),
  F_k('e', 'Constante d\'Euler (≅)'),
  F_k('tau', 'τ (≅ 2π)'),
]

F = (name, title) => {
  var key = 'cmath__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.call_expr,
    data: {
      name: name,
      holder: 'cmath',
      dotted: 1
    },
    title: key
  }
}
F_k = (name, title) => {
  var key = 'cmath__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.attributeref,
    data: {
      name: name,
      holder: 'cmath',
      dotted: 1
    },
    title: key
  }
}

eYo.Library.cmath__module = [
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
            data: 'cmath',
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

})()

goog.mixin(eYo.Tooltip.Title, {
  cmath__import_stmt: 'Importer le module cmath',
})

eYo.Brick.CMath.T3s = [
  eYo.T3.Expr.cmath__const
]

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

goog.require('eYo.Brick')

goog.require('eYo.Msg')

goog.require('eYo.Stmt')
goog.require('eYo.Brick.List')

goog.require('eYo.Brick.Primary')
goog.require('eYo.Tooltip')

goog.require('eYo.Library')
goog.provide('eYo.Brick.CMath')

/**
 * Populate the context menu for the given brick.
 * @param {!eYo.Brick.Dflt} brick The brick.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
// eYo.Expr.cmath__call_expr.populateMenu = function (mgr) {
//   var brick = this
//   // populate the menu with the functions in the same category
//   var name_get = brick.name_d.get()
//   var model = eYo.Model.cmath__module
//   var item_get = model.getItem(name_get)
//   var items = model.getItemsInCategory(item_get.category)
//   var module = brick.data.fromFlag.get() ? '' : 'cmath.'
//   var F = (i) => {
//     var item = model.getItem(items[i])
//     var type = model.data.types[item.type]
//     var args = type === 'data' ? '' : '(...)'
//     if (item !== item_get) {
//       var content =
//       goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
//         module,
//         item.names[0],
//         args
//       )
//       var menuItem = mgr.newMenuItem(content, function () {
//         brick.name_d.set(item.names[0])
//       })
//       mgr.addChild(menuItem, true)
//     }
//   }
//   for (var i = 0; i < items.length; i++) {
//     F(i)
//   }
//   mgr.shouldSeparate()
//   var contents = {
//     'conversions-to-and-from-polar-coordinates': 'conversion',
//     'power-and-logarithmic-functions': 'power',
//     'trigonometric-functions': 'trigo',
//     'hyperbolic-functions': 'hyper',
//     'classification-functions': 'classification',
//     'constants': 'pi, e, tau, inf(j), nan(j)'
//   }
//   F = function (i) {
//     var category = categories[i]
//     if (i !== item_get.category) {
//       var menuItem = mgr.newMenuItem(contents[category] || category, function () {
//         var items = eYo.Model.cmath__module.getItemsInCategory(i)
//         var item = eYo.Model.cmath__module.getItem(items[0])
//         eyo.name_d.set(item.names[0])
//       })
//       mgr.addChild(menuItem, true)
//     }
//   }
//   var categories = model.data.categories
//   for (var i = 0; i < categories.length - 1; i++) {
//     F(i)
//   }
//   mgr.shouldSeparate()
// }

// /**
//  * Class for a Delegate, cmath constant brick.
//  * As call is already a reserved message in javascript,
//  * we use call_expr instead.
//  * Not normally called directly, eYo.Brick.create(...) is preferred.
//  * For edython.
//  */
// eYo.Expr.cmath__call_expr.makeSubclass('cmath__const', {
//   data: {
//     callerFlag: {
//       init: true, // true when `foo` is expected instead of `foo(…)`
//       xml: false,
//       synchronize: false
//     },
//     ary: null,
//     isOptionalUnary: null,
//     mandatory: null,
//     name: {
//       all: ['pi', 'e', 'tau', 'inf', 'nan', 'infj', 'nanj'],
//       init: 'pi',
//       synchronize: true,
//       validate: true,
//       didChange: false, // do not heritate
//     }
//   },
//   slots: {
//     n_ary: null,
//     z_ary: null,
//     unary: null,
//     binary: null,
//     ternary: null,
//     quadary: null,
//     pentary: null,
//   },
//   out: {
//     check: [eYo.T3.Expr.cmath__const, eYo.T3.Expr.builtin__object]
//   }
// })

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

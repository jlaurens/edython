/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Random module blocks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Random')

goog.require('eYo.Model.random__module')

goog.require('eYo.DelegateSvg.Stmt')
goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Range')
goog.require('eYo.DelegateSvg.Primary')

goog.require('eYo.Tooltip')
goog.require('eYo.FlyoutCategory')

// /**
//  * Populate the context menu for the given block.
//  * @param {!Blockly.Block} block The block.
//  * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
//  * @private
//  */
// eYo.DelegateSvg.Expr.random__call_expr.prototype.contentForCategory = function (block, category) {
//   var contents = {
//     "bookkeeping-functions" : 'getstate, getrandbits',
//     "functions-for-integers" : 'randrange, randint',
//     "functions-for-sequences" : 'choice, choices, sample',
//     "real-valued-distributions" : 'random, uniform, ...',
//     "alternative-generator" : ''
//   }
//   return contents[category] || category
// }

/**
 * Class for a DelegateSvg, random range block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.call_expr.makeSubclass('random__randrange', {
  data: {
    parent: {
      init: 'random',
    },
    name: {
      init: 'randrange',
      synchronize: true,
      xml: false
    },
    variant: {
      init: eYo.Key.PARENT_NAME,
    },
    option: {
      init: eYo.Key.CALL_EXPR,
      all: [
        eYo.Key.NONE,
        eYo.Key.CALL_EXPR
      ]
    }
  },
  slots: {
    parent: {
      order: 10,
      fields: {
        label: '',
        edit: null
      }
    }
  },
  output: {
    check: [eYo.T3.Expr.random__randrange, eYo.T3.Expr.call_expr]
  }
})

var F = function (name, title) {
  var key = 'random__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.call_expr,
    data: {
      name: name,
      parent: 'random',
      variant: eYo.Key.NAME
    },
    title: key
  }
}
var F_s = function (name, title) {
  var key = 'random__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Stmt.call_stmt,
    data: {
      name: name,
      parent: 'random',
      variant: eYo.Key.NAME
    },
    title: key
  }
}
eYo.FlyoutCategory.basic_random__module = [
  {
    type: eYo.T3.Stmt.import_stmt,
    data: {
      from: 'random',
      variant: eYo.Key.FROM_MODULE_IMPORT_STAR
    }
  },
  {
    type: eYo.T3.Expr.call_expr,
    data: {
      name: 'randint',
      parent: 'random',
      variant: eYo.Key.NAME
    },
    slots: {
      binary: { // implement 'main' instead of 'binary'
        slots: {
          fstart: 1,
          rend: 6
        }
      }
    },
    title: 'random__randint'
  },
  function () {
    var key = 'random__choice'
    eYo.Tooltip.Title[key] = 'Choisir aléatoirement un élément dans une liste'
    return {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'choice',
        parent: 'random',
        variant: eYo.Key.NAME
      },
      slots: {
        unary: {
          type: eYo.T3.Expr.list_display,
          slots: {
            O: {
              type: eYo.T3.Expr.shortliteral,
              data: "'P'"
            },
            f: {
              type: eYo.T3.Expr.shortliteral,
              data: "'F'"
            }
          }
        }
      },
      title: key
    }
  } (),
  // F('choice', 'Choisir aléatoirement un élément dans une liste'),
  F_s('shuffle', 'Mélanger aléatoirement les éléments dans une liste'),
  F('sample', 'Obtenir un échantillon de taille donnée dans une population donnée sans répétition'),
  F('random', 'Générer (pseudo) aléatoirement un nombre entre 0 et 1'),
  F('uniform', 'Loi uniforme'),
  F('gauss', 'Loi normale'),
  {
    type: eYo.T3.Expr.random__randrange,
    data: {
      parent: 'random',
      variant: eYo.Key.NAME
    },
    slots: {
      arguments: {
        slots: {
          O: 10
        }
      }
    },
    title: 'random__randrange'
  },
  F_s('seed', 'Mélanger aléatoirement les éléments dans une liste'),
  // '<x eyo="identifier" name="a"><x eyo="builtin__object" value="None" slot="definition"></x></x>',
  F('getstate', 'Obtenir l\'état du générateur aléatoire, utile pour reproduire les tirages'),
  {
    type: eYo.T3.Stmt.call_stmt,
    data: {
      name: 'setstate',
      parent: 'random',
      variant: eYo.Key.NAME
    }
  }
]

F = function (name, title) {
  var key = 'random__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.call_expr,
    data: {
      name: name,
      parent: 'random',
      variant: eYo.Key.PARENT_NAME
    },
    title: key
  }
}
F_s = function (name, title) {
  var key = 'random__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Stmt.call_stmt,
    data: {
      name: name,
      parent: 'random',
      variant: eYo.Key.PARENT_NAME
    },
    title: key
  }
}
eYo.FlyoutCategory.random__module = [
  {
    type: eYo.T3.Stmt.import_stmt,
    data: {
      variant: eYo.Key.IMPORT
    },
    slots: {
      import_module: {
        slots: {
          O: {
            type: eYo.T3.Expr.term,
            data: 'random'
          }
        }
      }
    }
  },
  {
    type: eYo.T3.Expr.call_expr,
    data: {
      name: 'randint',
      parent: 'random',
      variant: eYo.Key.PARENT_NAME
    },
    slots: {
      binary: { // implement 'main' instead of 'binary'
        slots: {
          fstart: 1,
          rend: 6
        }
      }
    },
    title: 'random__randint'
  },
  F('choice', 'Choisir aléatoirement un élément dans une liste'),
  F_s('shuffle', 'Mélanger aléatoirement les éléments dans une liste'),
  F('sample', 'Obtenir un échantillon de taille donnée dans une population donnée sans répétition'),
  F('random', 'Générer (pseudo) aléatoirement un nombre entre 0 et 1'),
  F('uniform', 'Loi uniforme'),
  F('triangular', 'Loi triangle'),
  F('betavariate', 'Loi béta'),
  F('expovariate', 'Loi exponentielle'),
  F('gammavariate', 'Loi gamma'),
  F('gauss', 'Loi normale'),
  F('normalvariate', 'Loi normale (variante)'),
  F('lognormvariate', 'Loi log normale'),
  F('vonmisesvariate', 'Distribution de Von Mises'),
  F('paretovariate', 'Loi de Pareto'),
  F('weibullvariate', 'Distribution de Weibull'),
  {
    type: eYo.T3.Expr.random__randrange,
    slots: {
      arguments: {
        slots: {
          O: 10
        }
      }
    },
    title: 'random__randrange'
  },
  F('sample', 'Obtenir un échantillon de taille donnée dans une population donnée sans répétition'),
  F('getrandbits', 'Générer aléatoirement une suite de bits de longueur donnée'),
  F_s('seed', 'Réinitialiser le générateur de nombres (pseudo-)aléatoires'),
  F('getstate', 'Obtenir l\'état du générateur aléatoire, utile pour reproduire les tirages'),
  F_s('setstate', 'Ramener le générateur de nombres (pseudo-)aléatoires dans un état antérieur')
]

goog.mixin(eYo.Tooltip.Title, {
  random__import_stmt: 'Importer le module random',
  random__randint: 'Générer aléatoirement un entier entre deux bornes',
  random__shuffle_stmt: 'Mélanger les éléments d\'une liste',
  random__randrange: 'Générer aléatoirement un entier dans une étendue (range)',
  random__seed_stmt: 'Initialiser le générateur aléatoire',
  random__setstate: 'Mettre l\'état du générateur aléatoire à la valeur donnée'
})
eYo.DelegateSvg.Random.T3s = [
  eYo.T3.Expr.random__randrange,
]

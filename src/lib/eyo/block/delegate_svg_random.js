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

/**
 * Class for a DelegateSvg, import random block.
 * A unique block for each module to ease forthcoming management.
 * For edython.
 */
eYo.DelegateSvg.Stmt.import_stmt.makeSubclass('random__import_stmt', {
  data: {
    from: {
      init: 'random',
      validate: /** @suppress {globalThis} */ function (newValue) {
        return newValue === 'random' ? {validated: newValue} : null
      },
      synchronize: true
    }
  },
  slots: {
    import_module: {
      order: 1,
      fields: {
        label: 'import',
        suffix: 'random'
      },
      wrap: null,
      check: null
    },
    from: {
      order: 2,
      fields: {
        label: 'from',
        edit: 'random'
      }
    }
  }
})


/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.module__call_expr.makeSubclass('random__call_expr', {
  data: {
    ary: {
      validate: /** @suppress {globalThis} */ function (newValue) {
        var current = this.data.name.get()
        var item = eYo.Model.random__module.getItem(current)
        if (item) {
          // this is known, we do not have any choice
          var ary = this.getAll()[item.ary]
          return newValue === ary ? {validated: newValue}: null
        } else {
          // this is not known, we are confident in the user
          return {validated: newValue}
        }
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          var current = this.data.name.get()
          var item = eYo.Model.random__module.getItem(current)
          if (!item) {
            // this not a known function name
            this.save(element)
          }
        }
      }
    },
    name: {
      init: 'randint',
      main: true,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var item = eYo.Model.random__module.getItem(newValue)
        return item ? {validated: newValue} : null
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var item = eYo.Model.random__module.getItem(newValue)
        if (item) {
          var type = eYo.Model.random__module.data.types[item.type]
          if (type === 'data') {
            this.data.callerFlag.set(true)
          } else {
            this.data.callerFlag.set(false)
            var ary = item.ary
            this.data.ary.setTrusted(goog.isDef(ary) ? ary: this.data.ary.N_ARY)
            this.data.isOptionalUnary.setTrusted(!item.mandatory)
          }
        } else {
          this.data.ary.setTrusted(this.data.ary.N_ARY)
          this.data.isOptionalUnary.setTrusted(true)
        }
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      }
    },
    module: null
  },
  slots: {
    module: {
      fields: {
        edit: 'random'
      }
    }
  },
  output: {
    check: [eYo.T3.Expr.random__call_expr, eYo.T3.Expr.call_expr]
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.random__call_expr.prototype.contentForCategory = function (block, category) {
  var contents = {
    "bookkeeping-functions" : 'getstate, getrandbits',
    "functions-for-integers" : 'randrange, randint',
    "functions-for-sequences" : 'choice, choices, sample',
    "real-valued-distributions" : 'random, uniform, ...',
    "alternative-generator" : ''
  }
  return contents[category] || category
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.random__call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.module__call_expr.populateMenuModel.call(this, block, mgr, eYo.Model.random__module)
  eYo.DelegateSvg.Expr.module__call_expr.populateMenu.call(this, block, mgr, '(…)')
  return eYo.DelegateSvg.Expr.base_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('random__call_stmt', {
  link: eYo.T3.Expr.random__call_expr
})

/**
 * Get the module.
 * @param {!Blockly.Block} block The block.
 */
eYo.DelegateSvg.Expr.random__call_expr.prototype.getModule = eYo.DelegateSvg.Stmt.random__call_stmt.prototype.getModule = function (block) {
  return 'random'
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.random__call_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.random__call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Stmt.random__call_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, random range block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.module__call_expr.makeSubclass('random__randrange', {
  data: {
    name: {
      init: 'randrange',
      synchronize: true,
      xml: false
    }
  },
  slots: {
    module: {
      order: 10,
      fields: {
        prefix: 'random',
        separator: '.'
      }
    }
  },
  output: {
    check: [eYo.T3.Expr.random__randrange, eYo.T3.Expr.call_expr]
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.random__randrange.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.module__call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Expr.random__randrange.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

var F = function (name, title) {
  var key = 'random__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.random__call_expr,
    data: {
      name: name,
      fromFlag: true
    },
    title: key
  }
}
eYo.FlyoutCategory.basic_random__module = [
  {
    type: eYo.T3.Stmt.random__import_stmt,
    data: {
      variant: eYo.Key.FROM_MODULE_IMPORT_STAR
    }
  },
  {
    type: eYo.T3.Expr.random__call_expr,
    data: {
      name: 'randint',
      fromFlag: true
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
  {
    type: eYo.T3.Stmt.random__call_stmt,
    data: {
      name: 'shuffle',
      fromFlag: true
    }
  },
  F('random', 'Générer (pseudo) aléatoirement un nombre entre 0 et 1'),
  F('uniform', 'Loi uniforme'),
  F('gauss', 'Loi normale'),
  {
    type: eYo.T3.Expr.random__randrange,
    data: {
      fromFlag: true
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
  F('sample', 'Obtenir un échantillon de taille donnée dans une population donnée sans répétition'),
  {
    type: eYo.T3.Stmt.random__call_stmt,
    data: {
      name: 'seed',
      fromFlag: true
    }
  },
  // '<x eyo="identifier" name="a"><x eyo="builtin__object" value="None" slot="definition"></x></x>',
  F('getstate', 'Obtenir l\'état du générateur aléatoire, utile pour reproduire les tirages'),
  {
    type: eYo.T3.Stmt.random__call_stmt,
    data: {
      name: 'setstate',
      fromFlag: true
    }
  }
]

F = function (name, title) {
  var key = 'random__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.random__call_expr,
    data: name,
    title: key
  }
}
eYo.FlyoutCategory.random__module = [
  eYo.T3.Stmt.random__import_stmt,
  {
    type: eYo.T3.Expr.random__call_expr,
    data: 'randint',
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
  eYo.T3.Stmt.random__shuffle_stmt,
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
  eYo.T3.Stmt.random__seed_stmt,
  // '<x eyo="identifier" name="a"><x eyo="builtin__object" value="None" slot="definition"></x></x>',
  F('getstate', 'Obtenir l\'état du générateur aléatoire, utile pour reproduire les tirages'),
  eYo.T3.Stmt.random__setstate_stmt
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
  eYo.T3.Stmt.random__import_stmt,
  eYo.T3.Expr.random__call_expr,
  eYo.T3.Stmt.random__call_stmt,
  eYo.T3.Expr.random__randrange,
  eYo.T3.Stmt.random__seed_stmt,
  eYo.T3.Stmt.random__setstate_stmt,
  eYo.T3.Stmt.random__shuffle_stmt
]

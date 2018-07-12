/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview CMath module blocks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.CMath')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Stmt')

goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Primary')

goog.require('eYo.Tooltip')
goog.require('eYo.FlyoutCategory')

/**
 * Class for a DelegateSvg, import cmath block.
 * A unique block for each module to ease forthcoming management.
 * For edython.
 */
eYo.DelegateSvg.Stmt.import_stmt.makeSubclass('cmath__import_stmt', {
  data: {
    from: {
      init: 'cmath',
      validate: /** @suppress {globalThis} */ function (newValue) {
        return newValue === 'cmath' ? {validated: newValue} : null
      },
      synchronize: true
    }
  },
  slots: {
    import_module: {
      order: 1,
      fields: {
        label: 'import',
        suffix: 'cmath'
      },
      wrap: null,
      check: null
    },
    from: {
      order: 2,
      fields: {
        label: 'from',
        edit: 'cmath'
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

 eYo.DelegateSvg.Expr.module__call_expr.makeSubclass('cmath__call_expr', {
  data: {
    ary: {
      validate: /** @suppress {globalThis} */ function (newValue) {
        var current = this.data.name.get()
        var item = eYo.Model.cmath__module.getItem(current)
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
          var item = eYo.Model.cmath__module.getItem(current)
          if (!item) {
            // this not a known function name
            this.save(element)
          }
        }
      }
    },
    name: {
      init: 'sqrt',
      main: true,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var item = eYo.Model.cmath__module.getItem(newValue)
        return item ? {validated: newValue} : null
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var item = eYo.Model.cmath__module.getItem(newValue)
        if (item) {
          var type = eYo.Model.cmath__module.data.types[item.type]
          if (type === 'data') {
            this.data.callerFlag.set(true)
          } else {
            this.data.callerFlag.set(false)
            var ary = item.ary
            this.data.ary.setTrusted(goog.isDef(ary) ? ary: this.data.ary.N_ARY)
            this.data.isOptionalUnary.setTrusted(goog.isDef(item.mandatory) && !item.mandatory || !item.ary)
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
        edit: 'cmath'
      }
    }
  },
  output: {
    check: [eYo.T3.Expr.cmath__call_expr, eYo.T3.Expr.call_expr]
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.cmath__call_expr.populateMenu = function (block, mgr) {
  var eyo = block.eyo
  // populate the menu with the functions in the same category
  var name_get = eyo.data.name.get()
  var model = eYo.Model.cmath__module
  var item_get = model.getItem(name_get)
  var items = model.getItemsInCategory(item_get.category)
  var module = eyo.data.fromFlag.get() ? '' : 'cmath.'
  var F = function (i) {
    var item = model.getItem(items[i])
    var type = model.data.types[item.type]
    var args = type === 'data' ? '' : '(...)'
    if (item !== item_get) {
      var content =
      goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
        module,
        item.names[0],
        args
      )
      var menuItem = new eYo.MenuItem(content, function () {
        eyo.data.name.set(item.names[0])
      })
      mgr.addChild(menuItem, true)
    }
  }
  for (var i = 0; i < items.length; i++) {
    F(i)
  }
  mgr.shouldSeparate()
  var contents = {
    'conversions-to-and-from-polar-coordinates': 'conversion',
    'power-and-logarithmic-functions': 'power',
    'trigonometric-functions': 'trigo',
    'hyperbolic-functions': 'hyper',
    'classification-functions': 'classification',
    'constants': 'pi, e, tau, inf(j), nan(j)'
  }
  F = function (i) {
    var category = categories[i]
    if (i !== item_get.category) {
      var menuItem = new eYo.MenuItem(contents[category] || category, function () {
        var items = eYo.Model.cmath__module.getItemsInCategory(i)
        var item = eYo.Model.cmath__module.getItem(items[0])
        eyo.data.name.set(item.names[0])
      })
      mgr.addChild(menuItem, true)
    }
  }
  var categories = model.data.categories
  for (var i = 0; i < categories.length - 1; i++) {
    F(i)
  }
  mgr.shouldSeparate()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.cmath__call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.cmath__call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Expr.base_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('cmath__call_stmt', {
  link: eYo.T3.Expr.cmath__call_expr
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.cmath__call_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.cmath__call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Stmt.cmath__call_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, cmath constant block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.cmath__call_expr.makeSubclass('cmath__const', {
  data: {
    callerFlag: {
      init: true, // true when `foo` is expected instead of `foo(…)`
      xml: false,
      synchronize: false
    },
    ary: null,
    isOptionalUnary: null,
    name: {
      all: ['pi', 'e', 'tau', 'inf', 'nan', 'infj', 'nanj'],
      init: 'pi',
      synchronize: true,
      validate: true,
      didChange: false, // do not heritate
    }
  },
  slots: {
    n_ary: null,
    z_ary: null,
    unary: null,
    binary: null,
    ternary: null,
    quadary: null,
    pentary: null,
  },
  output: {
    check: [eYo.T3.Expr.cmath__const, eYo.T3.Expr.builtin__object]
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.cmath__const.populateMenu = function (block, mgr) {
  var eyo = block.eyo
  var current_name = eyo.data.name.get()
  var names = eyo.data.name.getAll()
  var fromFlag = this.data.fromFlag.get()
  var module = fromFlag ? '' : 'cmath.'
  var F = function (i) {
    var name = names[i]
    if (name !== current_name) {
      var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      module,
        name
      )
      var menuItem = new eYo.MenuItem(content, function () {
        eyo.data.name.set(name)
      })
      mgr.addChild(menuItem, true)
    }
  }
  for (var i = 0; i < names.length; i++) {
    F(i)
  }
  mgr.shouldSeparate()

}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.cmath__const.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.cmath__const.populateMenu.call(this, block, mgr)
  mgr.shouldSeparate()
  eYo.DelegateSvg.Expr.module__call_expr.populateMenu.call(this, block, mgr)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Expr.base_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Get the module.
 * @param {!Blockly.Block} block The block.
 */
eYo.DelegateSvg.Expr.cmath__call_expr.prototype.getModule = function (block) {
  return 'cmath'
}


var F = function (name, title) {
  var key = 'cmath__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.cmath__call_expr,
    data: name,
    title: key
  }
}
var F_k = function (name, title) {
  var key = 'cmath__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.cmath__const,
    data: name,
    title: key
  }
}
eYo.FlyoutCategory.cmath__module = [
  {
    type: eYo.T3.Stmt.cmath__import_stmt,
    data: {
      variant: eYo.Key.IMPORT
    }
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
  cmath__import_stmt: 'Importer le module cmath',
})

eYo.DelegateSvg.CMath.T3s = [
  eYo.T3.Stmt.cmath__import_stmt,
  eYo.T3.Expr.cmath__call_expr,
  eYo.T3.Stmt.cmath__call_stmt,
  eYo.T3.Expr.cmath__const
]

/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Random module bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('eYo.ns.Brick')

eYo.require('eYo.ns.Brick.Range')

eYo.require('eYo.ns.Model.random__module')

eYo.require('eYo.Stmt')

eYo.require('eYo.ns.Brick.List')
eYo.require('eYo.ns.Brick.Primary')
eYo.require('eYo.Tooltip')

eYo.require('eYo.Library')
eYo.provide('eYo.ns.Brick.Random')

eYo.T3.Expr.random__randrange = 'eyo:random__randrange'

/**
 * Class for a Delegate, random range brick.
 * Not normally called directly, eYo.ns.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Expr.builtin__range_expr.makeSubclass('random__randrange', {
  xml: {
    attr: 'randrange'
  },
  data: {
    dotted: {
      order: 200,
      init: 0,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var validated
        if (eYo.isStr(newValue)) {
          if (newValue.length) {
            validated = Math.max(0, Math.floor(Number(newValue)))
          } else {
            validated = Infinity
          }
        } else if (goog.isNumber(newValue)) {
          validated = Math.max(0, Math.floor(newValue))
        }
        return goog.isDef(validated) && validated <= 1
        ? {
          validated: validated
        }
        : {}
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.requiredIncog = newValue > 0
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        var p = this.brick.profile_p
        var item = p && p.p5e && p.p5e.item
        if (item) {
          if (item.type === 'method') {
            this.doChange(1)
            return
          }
        }
        if (type === eYo.T3.Expr.attributeref || type === eYo.T3.Expr.dotted_name || type === eYo.T3.Expr.parent_module) {
          this.doChange(1)
        }
      },
      fromField: /** @suppress {globalThis} */ function (value) {
        this.fromField(value.length)
      },
      toField: /** @suppress {globalThis} */ function (value) {
        var txt = ''
        for (var i = 0; (i < this.get()); i++) {
          txt += '.'
        }
        return txt
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          if (this.get()) {
            this.save(element, opt)
          }
        }
      },
      synchronize: true
    }
  },
  slots: {
    dotted: {
      order: 1,
      fields: {
        label: {
          order: 1,
          reserved: 'random'
        },
        bind: {
          order: 10,
          reserved: '.',
          separator: true
        }
      }
    },
    open: {
      fields: {
        label: {
          value: 'randrange'
        }
      },
    },
  },
  out: {
    check: [eYo.T3.Expr.random__randrange, eYo.T3.Expr.call_expr]
  }
}, true)

/**
 * The xml `eyo` attribute of this brick, as it should appear in the saved data.
 * For edython.
 */
eYo.Expr.random__randrange.prototype.xmlAttr = function () {
  return this.model.xml.attr
}

;(function () {

  var F = (name, title) => {
    var key = 'random__'+name
    title && (eYo.Tooltip.Title[key] = title)
    return {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: name,
        holder: 'random',
        dotted: 0
      },
      title: key
    }
  }
  var F_s = (name, title) => {
    var key = 'random__'+name
    title && (eYo.Tooltip.Title[key] = title)
    return {
      type: eYo.T3.Stmt.call_stmt,
      name_p: name,
      holder_p: 'random',
      dotted_p: 0,
      title: key
    }
  }
eYo.Library.basic_random__module = [
  {
    type: eYo.T3.Stmt.import_stmt,
    data: {
      from: 'random',
      variant: eYo.Key.FROM_MODULE_IMPORT_STAR
    },
    title: 'random__import_stmt'
  },
  {
    type: eYo.T3.Expr.call_expr,
    name_p: 'randint',
    holder_p: 'random',
    binary_s: { // implement 'main' instead of 'binary'
      fstart_s: 1,
      rend_s: 6
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
        holder: 'random'
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
    title: 'random__randrange'
  },
  F_s('seed', 'Mélanger aléatoirement les éléments dans une liste'),
  // '<x eyo="identifier" name="a"><x eyo="builtin__object" value="None" slot="definition"></x></x>',
  F('getstate', 'Obtenir l\'état du générateur aléatoire, utile pour reproduire les tirages'),
  {
    type: eYo.T3.Stmt.call_stmt,
    data: {
      name: 'setstate',
      holder: 'random'
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
      holder: 'random',
      dotted: 1
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
      holder: 'random',
      dotted: 1
    },
    title: key
  }
}
eYo.Library.random__module = [
  {
    type: eYo.T3.Stmt.import_stmt,
    variant_p: eYo.Key.IMPORT,
    import_module_s: {
      slots: {
        O: {
          type: eYo.T3.Expr.identifier,
          data: 'random'
        }
      }
    },
    title: 'random__import_stmt'
  },
  {
    type: eYo.T3.Expr.call_expr,
    name_p: 'randint',
    holder_p: 'random',
    binary_s: {
      fstart_s: 1,
      rend_s: 6
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
    dotted_p: 1,
    title: 'random__randrange'
  },
  F('sample', 'Obtenir un échantillon de taille donnée dans une population donnée sans répétition'),
  F('getrandbits', 'Générer aléatoirement une suite de bits de longueur donnée'),
  F_s('seed', 'Réinitialiser le générateur de nombres (pseudo-)aléatoires'),
  F('getstate', 'Obtenir l\'état du générateur aléatoire, utile pour reproduire les tirages'),
  F_s('setstate', 'Ramener le générateur de nombres (pseudo-)aléatoires dans un état antérieur')
]

})()

goog.mixin(eYo.Tooltip.Title, {
  random__import_stmt: 'Importer le module random',
  random__randint: 'Générer aléatoirement un entier entre deux bornes',
  random__shuffle_stmt: 'Mélanger les éléments d\'une liste',
  random__randrange: 'Générer aléatoirement un entier dans une étendue (range)',
  random__seed_stmt: 'Initialiser le générateur aléatoire',
  random__setstate: 'Mettre l\'état du générateur aléatoire à la valeur donnée'
})

eYo.ns.Brick.Random.T3s = [
  eYo.T3.Expr.random__randrange,
]

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

eYo.require('brick')

eYo.require('brick.range')

eYo.require('module.random__module')

eYo.require('stmt')

eYo.require('expr.List')
eYo.require('expr.Primary')
eYo.require('tooltip')

eYo.require('Library')
eYo.provide('brick.random')

eYo.t3.expr.random__randrange = 'eyo:random__randrange'

/**
 * Class for a Delegate, random range brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.builtin__range_expr.makeInheritedC9r('random__randrange', {
  xml: {
    attr: 'randrange'
  },
  data: {
    dotted: {
      order: 200,
      init: 0,
      validate (after) /** @suppress {globalThis} */ {
        var validated
        if (eYo.isStr(after)) {
          if (after.length) {
            validated = Math.max(0, Math.floor(Number(after)))
          } else {
            validated = Infinity
          }
        } else if (goog.isNumber(after)) {
          validated = Math.max(0, Math.floor(after))
        }
        return goog.isDef(validated) && validated <= 1
        ? validated
        : eYo.INVALID
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        this.requiredIncog = after > 0
      },
      fromType (type) /** @suppress {globalThis} */ {
        var item = this.brick.item
        if (item) {
          if (item.type === 'method') {
            this.doChange(1)
            return
          }
        }
        if (type === eYo.t3.expr.attributeref || type === eYo.t3.expr.dotted_name || type === eYo.t3.expr.parent_module) {
          this.doChange(1)
        }
      },
      fromField (value) /** @suppress {globalThis} */ {
        this.fromField(value.length)
      },
      toField (value) /** @suppress {globalThis} */ {
        var txt = ''
        for (var i = 0; (i < this.get()); i++) {
          txt += '.'
        }
        return txt
      },
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
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
    check: [eYo.t3.expr.random__randrange, eYo.t3.expr.call_expr]
  }
}, true)

/**
 * The xml `eyo` attribute of this brick, as it should appear in the saved data.
 * For edython.
 */
eYo.expr.random__randrange.prototype.xmlAttr = function () {
  return this.model.xml.attr
}

;(function () {

  var F = (name, title) => {
    var key = 'random__'+name
    title && (eYo.tooltip.Title[key] = title)
    return {
      type: eYo.t3.expr.call_expr,
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
    title && (eYo.tooltip.Title[key] = title)
    return {
      type: eYo.t3.stmt.call_stmt,
      name_p: name,
      holder_p: 'random',
      dotted_p: 0,
      title: key
    }
  }
eYo.Library.DATA.Basic_random__module = [
  {
    type: eYo.t3.stmt.import_stmt,
    data: {
      from: 'random',
      variant: eYo.key.FROM_MODULE_IMPORT_STAR
    },
    title: 'random__import_stmt'
  },
  {
    type: eYo.t3.expr.call_expr,
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
    eYo.tooltip.Title[key] = 'Choisir aléatoirement un élément dans une liste'
    return {
      type: eYo.t3.expr.call_expr,
      data: {
        name: 'choice',
        holder: 'random'
      },
      slots: {
        unary: {
          type: eYo.t3.expr.list_display,
          slots: {
            O: {
              type: eYo.t3.expr.shortliteral,
              data: "'P'"
            },
            f: {
              type: eYo.t3.expr.shortliteral,
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
    type: eYo.t3.expr.random__randrange,
    title: 'random__randrange'
  },
  F_s('seed', 'Mélanger aléatoirement les éléments dans une liste'),
  // '<x eyo="identifier" name="a"><x eyo="builtin__object" value="None" slot="definition"></x></x>',
  F('getstate', 'Obtenir l\'état du générateur aléatoire, utile pour reproduire les tirages'),
  {
    type: eYo.t3.stmt.call_stmt,
    data: {
      name: 'setstate',
      holder: 'random'
    }
  }
]

F = function (name, title) {
  var key = 'random__'+name
  title && (eYo.tooltip.Title[key] = title)
  return {
    type: eYo.t3.expr.call_expr,
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
  title && (eYo.tooltip.Title[key] = title)
  return {
    type: eYo.t3.stmt.call_stmt,
    data: {
      name: name,
      holder: 'random',
      dotted: 1
    },
    title: key
  }
}
eYo.Library.DATA.random__module = [
  {
    type: eYo.t3.stmt.import_stmt,
    variant_p: eYo.key.IMPORT,
    import_module_s: {
      slots: {
        O: {
          type: eYo.t3.expr.identifier,
          data: 'random'
        }
      }
    },
    title: 'random__import_stmt'
  },
  {
    type: eYo.t3.expr.call_expr,
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
    type: eYo.t3.expr.random__randrange,
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

goog.mixin(eYo.tooltip.Title, {
  random__import_stmt: 'Importer le module random',
  random__randint: 'Générer aléatoirement un entier entre deux bornes',
  random__shuffle_stmt: 'Mélanger les éléments d\'une liste',
  random__randrange: 'Générer aléatoirement un entier dans une étendue (range)',
  random__seed_stmt: 'Initialiser le générateur aléatoire',
  random__setstate: 'Mettre l\'état du générateur aléatoire à la valeur donnée'
})

eYo.brick.random.t3s = [
  eYo.t3.expr.random__randrange,
]

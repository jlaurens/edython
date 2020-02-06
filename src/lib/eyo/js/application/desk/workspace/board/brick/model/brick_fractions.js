/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Fractions module bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('brick')

eYo.require('msg')

eYo.require('stmt')
eYo.require('expr.List')

eYo.require('expr.primary')
eYo.require('tooltip')

eYo.require('Library')
eYo.provide('brick.fractions')

/*
    'Fraction': 0,
    'numerator': 1,
    'denominator': 2,
    'from_float': 3,
    'from_decimal': 4,
    'limit_denominator': 5,
    '__floor__': 6,
    '__ceil__': 7,
    '__round__': 8,
 */

;(function () {

  var F = (name, title) => {
    var key = 'fractions__'+name
    title && (eYo.tooltip.Title[key] = title)
    return {
      type: eYo.t3.expr.call_expr,
      name_p: name,
      holder_p: 'fractions',
      dotted_p: 0,
      title: key
    }
  }

  var F_instance = (name, type, title) => {
    var key = 'fractions__'+name
    title && (eYo.tooltip.Title[key] = title)
    return {
      type: type,
      data: {
        name: name,
        dotted: 1
      },
      title: key
    }
  }

eYo.Library.DATA.Basic_fractions__module = [
  {
    type: eYo.t3.stmt.import_stmt,
    variant_p: eYo.key.FROM_MODULE_IMPORT_STAR,
    from_p: 'fractions',
    title: 'fractions__import_stmt'
  },
  F('Fraction', 'Créer une fraction à partir d\'un ou deux nombres'),
  {
    type: eYo.t3.stmt.assignment_stmt,
    value_s: {
      slots: {
        O: F('Fraction')
      }
    }
  },
  F_instance('numerator', eYo.t3.expr.attributeref, 'Le numérateur d\'une fraction'),
  F_instance('denominator', eYo.t3.expr.attributeref, 'Le dénominateur d\'une fraction'),
  F_instance('limit_denominator', eYo.t3.expr.call_expr, 'Approximation d\'une fraction avec dénominateur maximal')
]

goog.mixin(eYo.tooltip.Title, {
  fractions__import_stmt: 'Importer le module fractions'
})

F = function (name, title) {
  var key = 'fractions__'+name
  title && (eYo.tooltip.Title[key] = title)
  return {
    type: eYo.t3.expr.call_expr,
    name_p: name,
    holder_p: 'fractions',
    dotted_p: 1,
    title: key
  }
}

eYo.Library.DATA.fractions__module = [
  {
    type: eYo.t3.stmt.import_stmt,
    variant_p: eYo.key.IMPORT,
    import_module_s: {
      slots: {
        O: {
          type: eYo.t3.expr.identifier,
          data: 'fractions'
        }
      }
    }
  },
  F('Fraction'),
  {
    type: eYo.t3.stmt.assignment_stmt,
    assigned_s: {
      slots: {
        'O': F('Fraction')
      }
    }
  },
  F_instance('numerator', eYo.t3.expr.attributeref),
  F_instance('denominator', eYo.t3.expr.attributeref),
  F_instance('limit_denominator', eYo.t3.expr.call_expr)
]

})()

goog.mixin(eYo.tooltip.Title, {
  fractions__import_stmt: 'Importer le module fractions',
})

eYo.brick.fractions.t3s = [
  eYo.t3.Fraction
]

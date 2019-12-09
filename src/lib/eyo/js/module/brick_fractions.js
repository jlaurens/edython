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

eYo.require('eYo.ns.Brick')

eYo.require('eYo.Msg')

eYo.require('eYo.Stmt')
eYo.require('eYo.ns.Brick.List')

eYo.require('eYo.ns.Brick.Primary')
eYo.require('eYo.Tooltip')

eYo.require('eYo.Library')
eYo.provide('eYo.ns.Brick.Fractions')

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
    title && (eYo.Tooltip.Title[key] = title)
    return {
      type: eYo.ns.T3.Expr.call_expr,
      name_p: name,
      holder_p: 'fractions',
      dotted_p: 0,
      title: key
    }
  }

  var F_instance = (name, type, title) => {
    var key = 'fractions__'+name
    title && (eYo.Tooltip.Title[key] = title)
    return {
      type: type,
      data: {
        name: name,
        dotted: 1
      },
      title: key
    }
  }

eYo.Library.basic_fractions__module = [
  {
    type: eYo.ns.T3.Stmt.import_stmt,
    variant_p: eYo.Key.FROM_MODULE_IMPORT_STAR,
    from_p: 'fractions',
    title: 'fractions__import_stmt'
  },
  F('Fraction', 'Créer une fraction à partir d\'un ou deux nombres'),
  {
    type: eYo.ns.T3.Stmt.assignment_stmt,
    value_s: {
      slots: {
        O: F('Fraction')
      }
    }
  },
  F_instance('numerator', eYo.ns.T3.Expr.attributeref, 'Le numérateur d\'une fraction'),
  F_instance('denominator', eYo.ns.T3.Expr.attributeref, 'Le dénominateur d\'une fraction'),
  F_instance('limit_denominator', eYo.ns.T3.Expr.call_expr, 'Approximation d\'une fraction avec dénominateur maximal')
]

goog.mixin(eYo.Tooltip.Title, {
  fractions__import_stmt: 'Importer le module fractions'
})

F = function (name, title) {
  var key = 'fractions__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.ns.T3.Expr.call_expr,
    name_p: name,
    holder_p: 'fractions',
    dotted_p: 1,
    title: key
  }
}

eYo.Library.fractions__module = [
  {
    type: eYo.ns.T3.Stmt.import_stmt,
    variant_p: eYo.Key.IMPORT,
    import_module_s: {
      slots: {
        O: {
          type: eYo.ns.T3.Expr.identifier,
          data: 'fractions'
        }
      }
    }
  },
  F('Fraction'),
  {
    type: eYo.ns.T3.Stmt.assignment_stmt,
    assigned_s: {
      slots: {
        'O': F('Fraction')
      }
    }
  },
  F_instance('numerator', eYo.ns.T3.Expr.attributeref),
  F_instance('denominator', eYo.ns.T3.Expr.attributeref),
  F_instance('limit_denominator', eYo.ns.T3.Expr.call_expr)
]

})()

goog.mixin(eYo.Tooltip.Title, {
  fractions__import_stmt: 'Importer le module fractions',
})

eYo.ns.Brick.Fractions.T3s = [
  eYo.ns.T3.Fraction
]

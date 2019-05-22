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

goog.provide('eYo.Brick.Fractions')

goog.require('eYo.Msg')
goog.require('eYo.Brick.Stmt')

goog.require('eYo.Brick.List')
goog.require('eYo.Brick.Primary')

goog.require('eYo.Tooltip')
goog.require('eYo.FlyoutCategory')

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

var doit = (() => {

var F = (name, title) => {
  var key = 'fractions__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.call_expr,
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

eYo.FlyoutCategory.basic_fractions__module = [
  {
    type: eYo.T3.Stmt.import_stmt,
    variant_p: eYo.Key.FROM_MODULE_IMPORT_STAR,
    from_p: 'fractions',
    title: 'fractions__import_stmt'
  },
  F('Fraction', 'Créer une fraction à partir d\'un ou deux nombres'),
  {
    type: eYo.T3.Stmt.assignment_stmt,
    value_s: {
      slots: {
        O: F('Fraction')
      }
    }
  },
  F_instance('numerator', eYo.T3.Expr.attributeref, 'Le numérateur d\'une fraction'),
  F_instance('denominator', eYo.T3.Expr.attributeref, 'Le dénominateur d\'une fraction'),
  F_instance('limit_denominator', eYo.T3.Expr.call_expr, 'Approximation d\'une fraction avec dénominateur maximal')
]

goog.mixin(eYo.Tooltip.Title, {
  fractions__import_stmt: 'Importer le module fractions'
})

F = function (name, title) {
  var key = 'fractions__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.call_expr,
    name_p: name,
    holder_p: 'fractions',
    dotted_p: 1,
    title: key
  }
}

eYo.FlyoutCategory.fractions__module = [
  {
    type: eYo.T3.Stmt.import_stmt,
    variant_p: eYo.Key.IMPORT,
    import_module_s: {
      slots: {
        O: {
          type: eYo.T3.Expr.identifier,
          data: 'fractions'
        }
      }
    }
  },
  F('Fraction'),
  {
    type: eYo.T3.Stmt.assignment_stmt,
    assigned_s: {
      slots: {
        'O': F('Fraction')
      }
    }
  },
  F_instance('numerator', eYo.T3.Expr.attributeref),
  F_instance('denominator', eYo.T3.Expr.attributeref),
  F_instance('limit_denominator', eYo.T3.Expr.call_expr)
]

})()

goog.mixin(eYo.Tooltip.Title, {
  fractions__import_stmt: 'Importer le module fractions',
})

eYo.Brick.Fractions.T3s = [
  eYo.T3.Fraction
]

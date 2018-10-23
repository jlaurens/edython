/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Fractions module blocks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Fraction')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Stmt')

goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Primary')

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

var F = function (name, title) {
  var key = 'fractions__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.call_expr,
    name_d: name,
    holder_d: 'fractions',
    dotted_d: 0,
    title: key
  }
}

var F_instance = function (name, type, title) {
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
    variant_d: eYo.Key.FROM_MODULE_IMPORT_STAR,
    from_d: 'fractions',
    title: 'fractions__import_stmt'
  },
  F('Fraction', 'Créer une fraction à partir d\'un ou deux nombres'),
  {
    type: eYo.T3.Stmt.assignment_stmt,
    slots: {
      assigned: {
        slots: {
          'O': F('Fraction')
        }
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
    name_d: name,
    holder_d: 'fractions',
    dotted_d: 1,
    title: key
  }
}

eYo.FlyoutCategory.fractions__module = [
  {
    type: eYo.T3.Stmt.import_stmt,
    variant_d: eYo.Key.IMPORT,
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
    assigned_S: {
      slots: {
        'O': F('Fraction')
      }
    }
  },
  F_instance('numerator', eYo.T3.Expr.attributeref),
  F_instance('denominator', eYo.T3.Expr.attributeref),
  F_instance('limit_denominator', eYo.T3.Expr.call_expr)
]


goog.mixin(eYo.Tooltip.Title, {
  fractions__import_stmt: 'Importer le module fractions',
})

eYo.DelegateSvg.Fraction.T3s = [
  eYo.T3.Fraction
]

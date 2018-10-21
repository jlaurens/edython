/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Statistics module blocks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Statistics')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Stmt')

goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Primary')

goog.require('eYo.Tooltip')
goog.require('eYo.FlyoutCategory')

/*
    'pstdev': 7,
    'stdev': 9,
    'median_high': 4,
    'pvariance': 8,
    'variance': 10,
    'median_low': 3,
    'median': 2,
    'median_grouped': 5,
    'StatisticsError': 11,
    'mode': 6,
    'mean': 0,
    'harmonic_mean': 1
 */
var F = function(key) {
  return {
    type: eYo.T3.Expr.call_expr,
    data: key
  }
}
eYo.FlyoutCategory.basic_statistics__module = 
eYo.FlyoutCategory.statistics__module = [
  F('mode'),
  F('mean'),
  F('harmonic_mean'),
  F('median'),
  F('median_high'),
  F('median_low'),
  F('median_grouped'),
  F('pstdev'),
  F('pvariance'),
  F('stdev'),
  F('variance'),
  F('StatisticsError')
]

goog.mixin(eYo.Tooltip.Title, {
  statistics__import_stmt: 'Importer le module statistics',
})

eYo.DelegateSvg.Fraction.T3s = [
  eYo.T3.Fraction
]

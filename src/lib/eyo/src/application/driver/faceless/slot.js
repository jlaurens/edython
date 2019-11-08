/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate. Do nothing driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Driver')

goog.provide('eYo.Driver.application')

/**
 * Shared application driver.
 */
eYo.Driver.application = Object.create({
  init: eYo.Do.nothing,
  dispose: eYo.Do.nothing,
})

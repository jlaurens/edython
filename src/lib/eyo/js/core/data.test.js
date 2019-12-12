/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Tests for Data. There used to be something in there...
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('Data')

eYo.provide('Data.Test')

eYo.Data.Test.run = function () {
  for (var x in eYo.Data.Test) {
    if (x !== 'run' && x.startsWith('run')) {
      console.log('Test:', x)
      eYo.Data.Test[x]()
    }
  }
}

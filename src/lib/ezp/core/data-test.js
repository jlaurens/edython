/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Tests for Data. There used to be something in there...
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('ezP.Data')
goog.provide('ezP.Data.Test')

ezP.Data.Test.run = function() {
  for (var x in ezP.Data.Test) {
    if (x !== 'run' && x.startsWith('run')) {
      console.log('Test:', x)
      ezP.Data.Test[x]()
    }
  }
}

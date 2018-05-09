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

goog.require('edY.Data')
goog.provide('edY.Data.Test')

edY.Data.Test.run = function() {
  for (var x in edY.Data.Test) {
    if (x !== 'run' && x.startsWith('run')) {
      console.log('Test:', x)
      edY.Data.Test[x]()
    }
  }
}

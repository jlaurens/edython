/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Base for properties.
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

ezP.Data.Test.Nrun_1 = function() {
  console.log('Basic')
  var X = {}
  X.A = function(block) {
    this.block_ = block
    block.ezp = this
  } // mimics the delegate
  ezP.Data.add(X.A, 'A')
  ezP.Data.add(X.A, 'B')
  ezP.Data.add(X.A, 'C')
  X.A.B = function() {}
  goog.inherits(X.A.B, X.A)
  ezP.Data.add(X.A.B, 'AB')
  ezP.Data.add(X.A.B, 'AC')
  ezP.Data.add(X.A.B, 'AD')
  X.b = new X.A.B()
  for (var kk in X.b) {
    console.log('Known key by a subclass instance:', kk)
  }
}

ezP.Data.Test.run_1a = function() {
  console.log('Basic')
  var X = {}
  X.A = function(block) {
    this.block_ = block
    block.ezp = this
  } // mimics the delegate
  ezP.Data.add(X.A, 'A')
  X.A.B = function() {}
  goog.inherits(X.A.B, X.A)
  X.A.B.C = function() {}
  goog.inherits(X.A.B.C, X.A.B)
  ezP.Data.add(X.A.B.C, 'C')
  X.b = new X.A.B()
  for (var kk in X.b) {
    console.log('Known key by a subclass instance:', kk)
  }
  console.log('X.A.B.C')
  X.c = new X.A.B.C()
  for (var kk in X.c) {
    console.log('ALSO Known key by a subclass instance:', kk)
  }
}

ezP.Data.Test.Xrun_2 = function() {
  console.log('Basic')
  var X = {}
  X.Block = function() {}
  X.A = function(block) {
    this.block_ = block
    block.ezp = this
  } // mimics the delegate
  X.A.prototype.getModel = function() {
    return {
      inputs: {}
    }
  }
  X.k1 = 'property'
  ezP.Data.add(X.A, X.k1)
  X.a = new X.A(new X.Block())
  X.p = X.a.getDataForKey(X.a.block_, X.k1)
  X.a.setProperty(X.a.block_, '421')
  goog.asserts.assert(X.a.getProperty(X.a.block_) === '421')
  X.A.B = function(block) {
    X.A.B.superClass_.constructor.call(this, block)
  }
  goog.inherits(X.A.B, X.A)
  X.k2 = 'other'
  ezP.Data.add(X.A.B, X.k2)
  X.b = new X.A.B(new X.Block())
  X.b.setProperty(X.b.block_, '421')
  goog.asserts.assert(X.a.getProperty(X.b.block_) === '421')
  X.b.setOther(X.b.block_, '421')
  goog.asserts.assert(X.b.getOther(X.b.block_) === '421')
  X.k3 = 'value'
  ezP.Data.add(X.A, X.k3)
  X.a.setValue(X.a.block_, '421')
  goog.asserts.assert(X.a.getValue(X.a.block_) === '421')
  X.b.setValue(X.b.block_, '421')
  goog.asserts.assert(X.b.getValue(X.b.block_) === '421')
  ezP.Data.add(X.A.B, X.k3, {
    willChange: function(oldValue, newValue) {
      X.oldValue = oldValue
      X.newValue = newValue
    }
  })
  X.newValue = ''
  goog.asserts.assert(X.newValue === '')
  X.b.setValue(X.b.block_, '124')
  goog.asserts.assert(X.newValue === '')
  X.b = new X.A.B(new X.Block())
  X.b.setValue(X.b.block_, '124')
  goog.asserts.assert(X.newValue === '124')
}

ezP.Data.Test.Xrun_2 = function() {
  console.log('Playing with inheritance')
  var X = {}
  X.A = function() {}
  X.A.B = function() {}
  goog.inherits(X.A.B, X.A)
  X.A.prototype['x'] = 'y'
  X.A.b = new X.A.B()
  goog.asserts.assert(X.A.b['x'] === 'y')
}


/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Managing named function arguments and possibly more.
 * When using inheritance, some functions may have quite the same set of arguments,
 * quite...
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * Management of named arguments and possibly more.
 * @name {eYo._}
 * @namespace
 */
eYo.newNS('_')

/**
 * Named arguments constructor.
 * @param {Object} kvargs - an object with named arguments
 */
eYo._.$C9r = function (kvargs) {
  //<<< mochai: $C9r
  //... chai.expect(eYo._.$C9r).eyo_F
  kvargs && Object.assign(this, kvargs)
  //... var $ = new eYo._.$C9r()
  //... chai.expect($.foo).undefined
  //... $ = new eYo._.$C9r({})
  //... chai.expect($.foo).undefined
  //... $ = new eYo._.$C9r({foo: 421})
  //... chai.expect($.foo).equal(421)
  //>>>
}

eYo.mixinFR(eYo, {
  /**
   * Whether the argument is a named arguments object.
   * @param {*} what 
   */
  isa$ (what) {
    //<<< mochai: eYo.isa$
    return !!what && what instanceof eYo._.$C9r
    //... chai.expect(eYo.isa$()).false
    //... chai.expect(eYo.isa$({})).false
    //... chai.expect(eYo.isa$(new eYo._.$C9r())).true
    //... chai.expect(eYo.isa$(eYo._.new$())).true
    //>>>
  },
})

eYo.mixinRO(eYo._, {
  //<<< mochai: eYo._.$C9r_p
  $C9r_p: eYo._.$C9r.prototype,
  //... chai.expect(eYo._.$C9r_p).equal(eYo._.$C9r.prototype)
  //>>>
})

eYo.mixinFR(eYo._, {
  new$ ($) {
    return new eYo._.$C9r($)
  }
})


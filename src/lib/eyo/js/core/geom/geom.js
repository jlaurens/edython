/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Objects for size and location.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('do')
eYo.require('font')
eYo.require('p6y')
eYo.require('o4t')

eYo.forward('geom.Point')
eYo.forward('geom.Size')
eYo.forward('geom.Rect')


/**
 * unit
 */

// x, y, with, height are in pixels
// c, l, w, h are in text units

/**
 * @name{eYo.geom}
 * @namespace
 */
eYo.c9r.makeNS(eYo, 'geom', {
  //<<< mochai: CONST
  X () {
    return eYo.font.space
  },
  Y () {
    return eYo.font.lineHeight
  },
  REM () {
    return parseFloat(getComputedStyle(document.documentElement).fonnewSize)
  },
  C () {
    return 2
  },
  L () {
    return 4
  }
  //... chai.expect(eYo.geom.X).eyo_Num
  //... chai.expect(eYo.geom.Y).eyo_Num
  //... chai.expect(eYo.geom.REM).eyo_Num
  //... chai.expect(eYo.geom.C).eyo_Num
  //... chai.expect(eYo.geom.L).eyo_Num
  //... chai.expect(() => { eYo.geom.C = 10 }).throw()
  //>>>
}, true)


eYo.geom.makeBaseC9r(true, {
  //<<< mochai: eYo.geom.BaseC9r
  properties: {
    snap: false,
  },
  //... var foo = eYo.geom.new('foo', onr)
  //... chai.assert(foo.snap_p)
  //... chai.expect(foo.snap).false
  methods: {
    shareSnap (snap_p) {
      this.p6yReplace('snap', snap_p)
    }
  }
  //... var bar = eYo.geom.new('bar', onr)
  //... bar.shareSnap(foo.snap_p)
  //... foo.snap_ = true
  //... chai.expect(bar.snap).equal(foo.snap)
  //... foo.snap_ = false
  //... chai.expect(bar.snap).equal(foo.snap)
  //... bar.snap_ = true
  //... chai.expect(bar.snap).equal(foo.snap)
  //... bar.snap_ = false
  //... chai.expect(bar.snap).equal(foo.snap)
  //>>>
})

eYo.Geom.eyo.o4tEnhanced()

eYo.geom.BaseC9r.eyo.finalizeC9r(['aliases'], {
  properties: {
    [eYo.model.ANY]: eYo.P6y.eyo.modelFormat,
    [eYo.model.VALIDATE]: eYo.model.validateD,
  },
})

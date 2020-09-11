// This file was generated by "prepare.py" on 2020-09-10 16:16:45.472584

describe(`Inline tests at geom/geom.js`, function () {
  this.timeout(20000)
  beforeEach (function () { eYo.test.setup() })
  eYo.test.onrModel = eYo.NA
  eYo.test.setup()
//  /**
//   * @fileoverview Objects for size and location.
//   * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
//   */
//  'use strict'
//  
//  eYo.require('do')
//  eYo.require('p6y')
//  eYo.require('o4t')
//  
//  eYo.forward('font')
//  eYo.forward('geom.Point')
//  eYo.forward('geom.Size')
//  eYo.forward('geom.Rect')
  it(`Basics`, function () {
    chai.expect(eYo.isDef(eYo.geom.Point)).true
    chai.expect(eYo.isDef(eYo.geom.Size)).true
    chai.expect(eYo.isDef(eYo.geom.Rect)).true
  })
//  
//  /**
//   * unit
//   */
//  
//  // x, y, with, height are in pixels
//  // c, l, w, h are in text units
//  
//  /**
//   * @name{eYo.geom}
//   * @namespace
//   */
//  eYo.c9r.newNS(eYo, 'geom', true, {
  it(`CONST`, function () {
//    X () {
//      return eYo.font.space
//    },
//    Y () {
//      return eYo.font.lineHeight
//    },
//    C () {
//      return 2
//    },
//    L () {
//      return 4
//    },
//    REM () {
//      return parseFloat(getComputedStyle(document.documentElement).fontSize)
//    },
    chai.expect(eYo.font.space).eyo_Num
    chai.expect(eYo.geom.X).eyo_Num
    chai.expect(eYo.geom.Y).eyo_Num
    chai.expect(eYo.geom.C).eyo_Num
    chai.expect(eYo.geom.L).eyo_Num
    chai.expect(eYo.geom.REM).eyo_Num
    chai.expect(() => { eYo.geom.C = 10 }).xthrow()
    chai.expect(eYo.geom.C === Math.round(eYo.geom.C)).true
    chai.expect(eYo.geom.L === Math.round(eYo.geom.L)).true
  })
//  })
//  
//  eYo.geom.makeC9rBase(true, {
  it(`eYo.geom.C9rBase`, function () {
//    properties: {
//      snap: false,
//    },
    var foo = eYo.geom.new('foo', onr)
    chai.assert(foo.snap_p)
    chai.expect(foo.snap).false
//    methods: {
//      shareSnap (snap_p) {
//        this[this.p6y$.replace]('snap', snap_p)
//      }
//    }
    var bar = eYo.geom.new('bar', onr)
    bar.shareSnap(foo.snap_p)
    foo.snap_ = true
    chai.expect(bar.snap).equal(foo.snap)
    foo.snap_ = false
    chai.expect(bar.snap).equal(foo.snap)
    bar.snap_ = true
    chai.expect(bar.snap).equal(foo.snap)
    bar.snap_ = false
    chai.expect(bar.snap).equal(foo.snap)
  })
//  })
//  
//  eYo.Geom[eYo.$].o4tEnhanced()
//  
//  eYo.geom.C9rBase[eYo.$].finalizeC9r(['aliases'], {
//    properties: {
//      [eYo.model.ANY]: eYo.P6y[eYo.$].modelFormat,
//      [eYo.model.VALIDATE]: eYo.model.validateD,
//    },
//  })

})

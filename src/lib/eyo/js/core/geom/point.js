/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Objects for location.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * `Point` is modelling a planar point that stores its coordinates in text units.
 * When `snap` is true, the coordinates are snapped to half integers horizontally and quarter integers vertically.
 * Orientation is from top to bottom and from left to right.
 * Orientation is from top to bottom and from left to right.
 * @name {eYo.geom.Point}
 * @constructor
 * @param {*} ... - See the implementation.
 */
eYo.geom.makeC9r('Point', {
  //<<< mochai: Point
    //<<< mochai: Basics
    //... var P = new eYo.geom.Point()
    //... chai.expect(P.snap_p).not.undefined
    //>>>
  /**
   * Initialize the point forwarding to `set`.
   * @param {Boolean|eYo.geom.PointLike} [snap] - Defaults to true
   * @param {*} c 
   * @param {*} l 
   */
  init (snap, c, l) {
    //<<< mochai: init
    if (!eYo.isBool(snap)) {
      eYo.isDef(l) && eYo.throw(`${this.eyo.name}/init: Unexpected last argument: ${l}`)
      //... chai.expect(() => {
      //...   new eYo.geom.Point(1, 2, 3)
      //... }).throw()
      if (eYo.isDef(snap)) {
        let $snap = snap.snap
        if (eYo.isDef($snap)) {
          this.snap_ = $snap
          this.set(snap)
          return
        }
      }
      ;[snap, c, l] = [false, snap, c]
    }
    this.snap_ = snap
    this.set(c, l)
    //>>>
  },
  properties: {
    //<<< mochai: Properties
    //... let P = new eYo.geom.Point()
    /**
     * Horizontal position in text unit
     * @type {Number}
     */
    c: {
      value: 0,
      validate (after) {
        if (!eYo.isDef(this)) {
          console.error('BREAK HERE!!!')
        }
        return this.snap_ ? Math.round(after * eYo.geom.C) / eYo.geom.C : after
      },
      //<<< mochai: c
      //... chai.expect(P.c_p).not.undefined
      //... P.snap_ = true
      //... P.c_ = 1 / eYo.geom.C
      //... chai.expect(P.c).almost.equal(1 / eYo.geom.C)
      //... P.c_ = 1.1 / eYo.geom.C
      //... chai.expect(P.c).almost.equal(1 / eYo.geom.C)
      //... P.c_ = 0.9 / eYo.geom.C
      //... chai.expect(P.c).almost.equal(1 / eYo.geom.C)
      //... P.snap_ = false
      //... P.c_ = 1.2345
      //... chai.expect(P.c).almost.equal(1.2345)
      //>>>
    },
    /**
     * Vertical position in text unit
     * @type {Number}
     */
    l: {
      value: 0,
      validate (after) {
        return this.snap_ ? Math.round(after * eYo.geom.L) / eYo.geom.L : after
      },
      //<<< mochai: l
      //... chai.expect(P.l_p).not.undefined
      //... P.snap_ = true
      //... P.l_ = 1 / eYo.geom.L
      //... chai.expect(P.l).almost.equal(1 / eYo.geom.L)
      //... P.l_ = 1.1 / eYo.geom.L
      //... chai.expect(P.l).almost.equal(1 / eYo.geom.L)
      //... P.l_ = 0.9 / eYo.geom.L
      //... chai.expect(P.l).almost.equal(1 / eYo.geom.L)
      //... P.snap_ = false
      //... P.l_ = 1.2345
      //... chai.expect(P.l).almost.equal(1.2345)
      //>>>
    },
    /**
     * Horizontal position in pixels
     * @type {Number}
     */
    x: {
      get () {
        return this.c_ * eYo.geom.X
      },
      set (after) {
        this.c_ = after / eYo.geom.X
      }
      //<<< mochai: x
      //... var m = {c: 1, l: 2}
      //... var mm = {x: m.c * eYo.geom.X, y: m.l * eYo.geom.Y}
      //... var P = new eYo.geom.Point(false, mm)
      //... chai.expect(P).almost.eql(m)
      //... P.x_ += 5 * eYo.geom.X
      //... chai.expect(P).almost.eql({c: m.c + 5, l: m.l})
      //>>>
    },
    /**
     * Vertical position in pixels
     * @type {Number}
     */
    y: {
      get () {
        return this.l_ * eYo.geom.Y
      },
      set (after) {
        this.l_ = after / eYo.geom.Y
      }
      //<<< mochai: y
      //... var m = {c: 1, l: 2}
      //... var mm = {x: m.c * eYo.geom.X, y: m.l * eYo.geom.Y}
      //... var P = new eYo.geom.Point(false, mm)
      //... chai.expect(P).almost.eql(m)
      //... P.y_ += 5 * eYo.geom.Y
      //... chai.expect(P).almost.eql({c: m.c, l: m.l + 5})
      //>>>
    },
    /**
     * Euclidian magnitude.
     * @return {number} non negative number
     */
    magnitude: {
      get () {
        var dx = this.x
        var dy = this.y
        return Math.sqrt(dx * dx + dy * dy)
      }
      //<<< mochai: magnitude
      //... var mm = {x: 3, y: 4}
      //... var P = new eYo.geom.Point(false, mm)
      //... chai.expect(P.magnitude).almost.eql(5)
      //>>>
    },
    /**
     * clone the receiver.
     * @type {eYo.geom.Point}
     */
    copy: {
      //<<< mochai: copy
      get () {
        return new this.eyo.C9r(this)
      }
      //... var m = {c: 3, l: 4}
      //... var P = new eYo.geom.Point(false, m)
      //... let PP = P.copy
      //... chai.expect(P).not.equal(PP)
      //... chai.expect(P).almost.eql(PP)
      //>>>
    },
    /**
     * Human readable description.
     * @return {String}
     */
    description: {
      get () {
        return `${this.eyo.name}(c: ${this.c}, l: ${this.l}, x: ${this.x}, y: ${this.y})`
      },
    }
    //>>>
  },
  methods: {
    //<<< mochai: methods
    /**
     * Test equality between the receiver and the rhs.
     * @param {*} rhs - Anything
     * @param {*} tolerance - a non negative number, defaults to `eYo.EPSILON`
     */
    eql (rhs, tolerance = eYo.EPSILON) {
      //<<< mochai: eql
      return eYo.equals(this.c_, rhs.c, tolerance) && eYo.equals(this.l_, rhs.l, tolerance)
      //... let m = {c: 1.23, l: 4.56}
      //... let epsilon = 0.01
      //... var delta = epsilon * (m.c + 1) / (1 - epsilon)
      //... var P = new eYo.geom.Point(false, m.c + 2 * delta, m.l)
      //... chai.expect(P.eql(m, 1.01 * epsilon)).true
      //... chai.expect(P.eql(m, 0.99 * epsilon)).false
      //... var delta = epsilon * (m.l + 1) / (1 - epsilon)
      //... var P = new eYo.geom.Point(false, m.c, m.l + 2 * delta)
      //... chai.expect(P.eql(m, 1.01 * epsilon)).true
      //... chai.expect(P.eql(m, 0.99 * epsilon)).false
      //>>>
    },
    /**
     * Like `advance` but sets the coordinates, instead of advancing them.
     * @param {Number | eYo.geom.Point | Event | Object} c
     * @param {Number} [l]
     * @return {eYo.geom.Point} The receiver
     */
    set (c = 0, l) {
      //<<< mochai: set
      //... var P, m, mm
      if (eYo.isDef(c.c) && eYo.isDef(c.l)) {
        eYo.isDef(l) && eYo.throw(`Unexpected last argument ${this.eyo.name}/forward: ${l}`)
        this.c_ = c.c
        this.l_ = c.l
        //... P = new eYo.geom.Point()
        //... m = {c: 1, l: 2}
        //... P.set(m); chai.expect(P).eql(m)
        //... chai.expect(() => P.set(m, null)).not.throw()
        //... chai.expect(() => P.set(m, 1)).throw()
      } else if (eYo.isDef(c.x) && eYo.isDef(c.y)) {
        eYo.isDef(l) && eYo.throw(`${this.eyo.name}/set: Unexpected argument 'l' ${l}`)
        this.x_ = c.x
        this.y_ = c.y
        //... P = new eYo.geom.Point()
        //... mm = {x: m.c * eYo.geom.X, y: m.l * eYo.geom.Y}
        //... P.set(mm); chai.expect(P).almost.eql(m)
        //... chai.expect(() => P.set(mm, null)).not.throw()
        //... chai.expect(() => P.set(mm, 1)).throw()
      } else if (eYo.isDef(c.clientX) && eYo.isDef(c.clientY)) {
        eYo.isDef(l) && eYo.throw(`${this.eyo.name}/set: Unexpected argument 'l' ${l}`)
        this.x_ = c.clientX
        this.y_ = c.clientY
        //... P = new eYo.geom.Point()
        //... mm = {clientX: m.c * eYo.geom.X, clientY: m.l * eYo.geom.Y}
        //... P.set(mm); chai.expect(P).almost.eql(m)
        //... chai.expect(() => P.set(mm, null)).not.throw()
        //... chai.expect(() => P.set(mm, 1)).throw()
      } else {
        eYo.isaP6y(c)
        ? this.p6yReplace('c', c)
        : (this.c_ = c)
        eYo.isaP6y(l)
        ? this.p6yReplace('l', l)
        : (this.l_ = l || 0)
        return this
        //... let c_p = eYo.p6y.new('c', onr)
        //... let l_p = eYo.p6y.new('l', onr)
        //... P = new eYo.geom.Point(); c_p.value_ = 1; l_p.value_ = 2
        //... P.set(c_p, 2)
        //... chai.expect(P).eql(m)
        //... chai.expect(P.c_ = 2).equal(c_p.value)
        //... P = new eYo.geom.Point(); c_p.value_ = 1; l_p.value_ = 2
        //... P.set(1, l_p)
        //... chai.expect(P).eql(m)
        //... chai.expect(P.l_ = 1).equal(l_p.value)
        //... P = new eYo.geom.Point(); c_p.value_ = 1; l_p.value_ = 2
        //... P.set(c_p, l_p)
        //... chai.expect(P).eql(m)
        //... chai.expect(P).eql({c: (c_p.value_ = 2), l: (l_p.value_ = 1)})
      }
      return this
      //>>>
    },
    /**
     * Setter.
     * @param {Number} x  x coordinate
     * @param {Number} y  y coordinate
     * @return {eYo.geom.Point} The receiver
     */
    pSet (x = 0, y) {
      //<<< mochai: pSet
      //... let mm = {x: eYo.test.randN(), y: eYo.test.randN()}
      //... let m = {c: mm.x / eYo.geom.X, l: mm.y / eYo.geom.Y}
      if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
        eYo.isDef(y) && eYo.throw(`Unexpected last argument ${this.eyo.name}/pSet: ${y}`)
        //... var P = new eYo.geom.Point()
        //... P.pSet(mm)
        //... chai.expect(P).almost.eql(m)
        ;[x, y] = [x.x, x.y]
      } else if (eYo.isDef(x.clientX) && eYo.isDef(x.clientY)) {
        //... var P = new eYo.geom.Point()
        //... P.pSet({clientX: mm.x, clientY: mm.y})
        //... chai.expect(P).almost.eql(m)
        [x, y] = [x.clientX, x.clientY]
      } else if (eYo.isDef(x.c) && eYo.isDef(x.l)) {
        eYo.isDef(y) && eYo.throw(`Unexpected last argument ${this.eyo.name}/pSet (2): ${y}`)
        //... var P = new eYo.geom.Point()
        //... P.pSet({c: m.c, l: m.l})
        //... chai.expect(P).almost.eql(m)
        this.c_ = x.c
        this.l_ = x.l
        return this
      } else if (!eYo.isDef(y)) {
        y = 0
      }
      //... var P = new eYo.geom.Point()
      //... P.pSet(mm.x, mm.y)
      //... chai.expect(P).almost.eql(m)
      //... var P = new eYo.geom.Point()
      //... P.pSet(mm.x)
      //... chai.expect(P).almost.eql({c: m.c, l: 0})
      this.x_ = x
      this.y_ = y
      return this
      //>>>
    },
    /**
     * Like `set` but advance the coordinates, instead of setting them.
     * @param {number | eYo.geom.Size} dc – Either a number or an object with `dc` and `dl` number fields.
     * @param {number} dl
     * @return {eYo.geom.Point}
     */
    forward (dc = 0, dl) {
      //<<< mochai: forward
      //... let P = new eYo.geom.Point()
      //... let m = {c: eYo.test.randN(), l: eYo.test.randN()}
      //... let dm = {dc: eYo.test.randN(), dl: eYo.test.randN()}
      if (eYo.isDef(dc.dc) && eYo.isDef(dc.dl)) {
        eYo.isDef(dl) && eYo.throw(`Unexpected last argument ${this.eyo.name}/forward: ${dl}`)
        ;[dc, dl] = [dc.dc, dc.dl]
        //... P.set(m)
        //... P.forward(dm)
        //... chai.expect(P).almost.eql({c: m.c+dm.dc, l: m.l+dm.dl})
      }
      dc && (this.c_ += dc)
      dl && (this.l_ += dl)
      return this
      //... P.set(m)
      //... P.forward(dm.dc, dm.dl)
      //... chai.expect(P).almost.eql({c: m.c+dm.dc, l: m.l+dm.dl})
      //>>>
    },
    /**
     * Like `set` but advance the coordinates, instead of setting them.
     * Potential problem with snapping.
     * @param {number | eYo.geom.Size} dc - Either a number or an object with `dc` and `dl` fields pointing to numbers.
     * @param {number} dl
     * @return {eYo.geom.Point}
     */
    backward (dc = 0, dl) {
      //<<< mochai: backward
      //... let P = new eYo.geom.Point()
      //... let m = {c: eYo.test.randN(), l: eYo.test.randN()}
      //... let dm = {dc: eYo.test.randN(), dl: eYo.test.randN()}
      if (eYo.isDef(dc.dc) && eYo.isDef(dc.dl)) {
        eYo.isDef(dl) && eYo.throw(`Unexpected last argument ${this.eyo.name}/forward: ${dl}`)
        ;[dc, dl] = [dc.dc, dc.dl]
        //... P.set(m)
        //... P.backward(dm)
        //... chai.expect(P).almost.eql({c: m.c-dm.dc, l: m.l-dm.dl})
      }
      dc && (this.c_ -= dc)
      dl && (this.l_ -= dl)
      return this
      //... P.set(m)
      //... P.backward(dm.dc, dm.dl)
      //... chai.expect(P).almost.eql({c: m.c-dm.dc, l: m.l-dm.dl})
      //>>>
    },
    /**
     * Like `set` but advance the coordinates, instead of setting them.
     * Board coodinates
     * @param {number} dx
     * @param {number} dy
     * @return {eYo.geom.Point}
     */
    pForward (dx = 0, dy) {
      //<<< mochai: pForward
      //... let P = new eYo.geom.Point()
      //... let m = {c: eYo.test.randN(), l: eYo.test.randN()}
      //... let mm = {x: m.c * eYo.geom.X, y: m.l * eYo.geom.Y}
      //... let dm = {dc: eYo.test.randN(), dl: eYo.test.randN()}
      //... let dmm = {dx: dm.dc * eYo.geom.X, dy: dm.dl * eYo.geom.Y}
      if (eYo.isDef(dx.dx) && eYo.isDef(dx.dy)) {
        eYo.isDef(dy) && eYo.throw(`Unexpected last argument ${this.eyo.name}/pForward: ${dy}`)
        ;[dx, dy] = [dx.dx, dx.dy]
        //... P.pSet(mm)
        //... P.pForward(dmm)
        //... chai.expect(P).almost.eql({c: m.c+dm.dc, l: m.l+dm.dl})
        //... chai.expect(() => {P.pForward(dmm, null)}).not.throw()
        //... chai.expect(() => {P.pForward(dmm, 1)}).throw()
      }
      dx && (this.x_ += dx)
      dy && (this.y_ += dy)
      return this
      //... P.pSet(mm)
      //... P.pForward(dmm.dx, dmm.dy)
      //... chai.expect(P).almost.eql({c: m.c+dm.dc, l: m.l+dm.dl})
      //... P.pSet(mm)
      //... P.pForward(dmm.dx)
      //... chai.expect(P).almost.eql({c: m.c+dm.dc, l: m.l})
      //>>>
    },
    /**
     * Like `set` but change the coordinates, instead of setting them.
     * Board coodinates
     * @param {number | eYo.geom.Size} dx
     * @param {number} dy
     * @return {eYo.geom.Point}
     */
    pBackward (dx = 0, dy) {
      //<<< mochai: pBackward
      //... let P = new eYo.geom.Point()
      //... let m = {c: eYo.test.randN(), l: eYo.test.randN()}
      //... let mm = {x: m.c * eYo.geom.X, y: m.l * eYo.geom.Y}
      //... let dm = {dc: eYo.test.randN(), dl: eYo.test.randN()}
      //... let dmm = {dx: dm.dc * eYo.geom.X, dy: dm.dl * eYo.geom.Y}
      if (eYo.isDef(dx.dx) && eYo.isDef(dx.dy)) {
        eYo.isDef(dy) && eYo.throw(`Unexpected last argument ${this.eyo.name}/pBackward: ${dy}`)
        ;[dx, dy] = [dx.dx, dx.dy]
        //... P.pSet(mm)
        //... P.pBackward(dmm)
        //... chai.expect(P).almost.eql({c: m.c-dm.dc, l: m.l-dm.dl})
        //... chai.expect(() => {P.pBackward(dmm, null)}).not.throw()
        //... chai.expect(() => {P.pBackward(dmm, 1)}).throw()
      }
      dx && (this.x_ -= dx)
      dy && (this.y_ -= dy)
      return this
      //... P.pSet(mm)
      //... P.pBackward(dmm.dx, dmm.dy)
      //... chai.expect(P).almost.eql({c: m.c-dm.dc, l: m.l-dm.dl})
      //... P.pSet(mm)
      //... P.pBackward(dmm.dx)
      //... chai.expect(P).almost.eql({c: m.c-dm.dc, l: m.l})
      //>>>
    },
    /**
     * Euclidian distance between points.
     * @param {eYo.geom.Point} x - A Point or anything with either `x` and `y` or `clientX` and `clientY` number fields.
     * @return {number} non negative number
     */
    pDistance (x = 0, y) {
      //<<< mochai: pDistance
      //... let mm = {x: eYo.test.randN() * eYo.geom.X, y: eYo.test.randN() * eYo.geom.Y}
      //... let d = eYo.test.randN()
      //... let theta = eYo.test.randN(4) * Math.PI / 5000
      //... let dmm = {dx: d * Math.cos(theta), dy: d * Math.sin(theta)}
      if (eYo.isDef(x.clientX) && eYo.isDef(x.clientY)) {
        var dx = this.x - x.clientX
        var dy = this.y - x.clientY
        //... var P = new eYo.geom.Point()
        //... P.pSet(mm)
        //... chai.expect(d).almost.equal(P.pDistance({clientX: mm.x + dmm.dx, clientY: mm.y + dmm.dy}))
      } else if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
        dx = this.x - x.x
        dy = this.y - x.y
        //... var P = new eYo.geom.Point()
        //... P.pSet(mm)
        //... chai.expect(d).almost.equal(P.pDistance({x: mm.x + dmm.dx, y: mm.y + dmm.dy}))
      } else {
        dx = this.x - x
        dy = this.y - (y || 0)
        //... var P = new eYo.geom.Point()
        //... P.pSet(mm)
        //... chai.expect(d).almost.equal(P.pDistance(mm.x + dmm.dx, mm.y + dmm.dy))
      }
      return Math.sqrt(dx * dx + dy * dy)
      //>>>
    },
    //>>>
  }
  //>>>
})

eYo.geom.Point.eyo.finalizeC9r()

//<<< mochai: Util
/**
 * Convenient creator.
 * @param {Boolean} [snap] - Whether the receiver should snap to the grid, defaults to false
 * @param {Number} x - x coordinate
 * @param {Number} y - y coordinate
 * @return {eYo.geom.Point} The receiver
 */
eYo.geom.pPoint = function (snap, x, y) {
  //<<< mochai: pPoint
  //... var m = {c: eYo.test.randN(), l: eYo.test.randN()}
  //... var mm = {x: m.c * eYo.geom.X, y: m.l * eYo.geom.Y}
  if (!eYo.isBool(snap)) {
    eYo.isDef(y) && eYo.throw(`eYo.geom.pPoint: Unexpected last argument: ${y}`)
    //... chai.expect(() => {eYo.geom.pPoint(1, 2, 3)}).throw()
    ;[snap, x, y] = [false, snap, x]
    //... var P = eYo.geom.pPoint(mm)
    //... chai.expect(P).almost.eql(m)
    //... var P = eYo.geom.pPoint(mm.x, mm.y)
    //... chai.expect(P).almost.eql(m)
  }
  return new eYo.geom.Point(snap).pSet(x, y)
  //... var P = eYo.geom.pPoint(false, mm)
  //... chai.expect(P).almost.eql(m)
  //... var P = eYo.geom.pPoint(false, mm.x, mm.y)
  //... chai.expect(P).almost.eql(m)
  //... var m = {c: eYo.test.randN(true), l: eYo.test.randN(true)}
  //... var mm = {x: m.c * eYo.geom.X, y: m.l * eYo.geom.Y}
  //... var P = eYo.geom.pPoint(true, mm)
  //... chai.expect(P).almost.eql(m)
  //... var P = eYo.geom.pPoint(true, mm.x, mm.y)
  //... chai.expect(P).almost.eql(m)
  //>>>
}

/**
 * Convenient creator in text units.
 * @param {Boolean} [snap] - snap flag. Defaults to false.
 * @param {Number} [c] - c coordinate. Defaults to 0.
 * @param {Number} [l] - l coordinate. Defaults to 0.
 * @return {eYo.geom.Point} The receiver
 */
eYo.geom.tPoint = function (snap, c, l) {
  //<<< mochai: tPoint
  return new eYo.geom.Point(snap, c, l)
  //... eYo.geom.tPoint(true, 1, 2)
  //>>>
}
//>>>

eYo.c9r.Dlgt_p.makePointed = function (key) {
  //<<< mochai: eYo.o4t.Dlgt.makePointed
  //... let ns = eYo.o4t.makeNS()
  //... ns.makeBaseC9r(true)
  //... ns.BaseC9r.eyo.makePointed('origin')
  //... ns.BaseC9r.eyo.finalizeC9r()
  //... var r
  this.modelMerge({
    //<<< mochai: Text coordinates
    properties: {
      //<<< mochai: properties
      [key]: {
        //<<< mochai: origin
        //... r = ns.new('foo', onr)
        //... chai.expect(r.origin_p).not.undefined
        value () {
          return new eYo.geom.Point()
        },
        //... chai.expect(r.origin).eyo_point
        copy: true,
        //... // A copy is not the original
        //... chai.expect(r.origin).not.equal(r.origin_)
        //... // A copy is not another copy
        //... chai.expect(r.origin).not.equal(r.origin)
        //... chai.expect(r.origin).almost.eql(r.origin_)
        //... chai.expect(r.origin).almost.eql(r.origin)
        set (stored, after) {
          stored.pSet(after)
          //... r = ns.new('foo', onr)
          //... var pt = eYo.geom.randPoint(false)
          //... chai.expect(r.origin_).not.equal(pt)
          //... r.origin_ = pt
          //... chai.expect(r.origin_).not.equal(pt)
          //... chai.expect(r.origin_).almost.eql(pt)
        }
        //>>>  
      },
      //>>>  
    },
    aliases: {
      //<<< mochai: aliases
      [key + '.c']: ['c', 'c_min'],
        //<<< mochai: c, c_min
        //... r = ns.new('foo', onr)
        //... chai.expect(r.origin.c).equal(r.c).equal(r.c_min)
        //... r.c_ += 1
        //... chai.expect(r.origin.c).equal(r.c).equal(r.c_min)
        //... r.c_min_ -= 1
        //... chai.expect(r.origin.c).equal(r.c).equal(r.c_min)
        //... r.origin_.c_ += 1
        //... chai.expect(r.origin.c).equal(r.c).equal(r.c_min)
        //>>>
      [key + '.l']: ['l', 'l_min'],
        //<<< mochai: l, l_min
        //... chai.expect(r.origin.l).equal(r.l).equal(r.l_min)
        //... r.l_ += 1
        //... chai.expect(r.origin.l).equal(r.l).equal(r.l_min)
        //... r.l_min_ -= 1
        //... chai.expect(r.origin.l).equal(r.l).equal(r.l_min)
        //... r.origin_.l_ += 1
        //... chai.expect(r.origin.l).equal(r.l).equal(r.l_min)
        //>>>
      //>>> 
    },
    //>>>
  })
  this.modelMerge({
    //<<< mochai: Board coordinates
    aliases: {
      //<<< mochai: aliases
      //... let r = ns.new('foo', onr)
      //... let m = {c: 1, l: 2, w: 3, h: 4}
      //... r.origin_.set(m)
      // basic properties in board dimensions
      [key + '.x']: ['x', 'x_min'],
        //<<< mochai: x, x_min
        //... chai.expect(r.origin.x).almost.equal(m.c * eYo.geom.X)
        //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
        //... r.x_ += 2 * eYo.geom.X
        //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
        //... r.x_min_ -= eYo.geom.X
        //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
        //... r.origin_.x_ -= eYo.geom.X
        //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min).almost.equal(m.c * eYo.geom.X)
        // Convenient setters in board coordinates
        //... r.x_ += 5 * eYo.geom.X
        //... m.c += 5
        //... chai.expect(r.x).almost.equal(m.c * eYo.geom.X)
        //>>>
      [key + '.y']: ['y', 'y_min'],
        //<<< mochai: y, y_min
        //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min).almost.equal(m.l * eYo.geom.Y)
        //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
        //... r.y_ += 2 * eYo.geom.Y
        //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
        //... r.y_min_ -= eYo.geom.Y
        //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
        //... r.origin_.y_ -= eYo.geom.Y
        //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
        //... chai.expect(r.y).almost.equal(m.l * eYo.geom.Y)
        //... r.y_ += 4 * eYo.geom.Y
        //... m.l += 4
        //... chai.expect(r.y).almost.equal(m.l * eYo.geom.Y)
        //>>>
      //>>>
    },
    //>>>
  })
  //>>>
}

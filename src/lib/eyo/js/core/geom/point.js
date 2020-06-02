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

eYo.forward('geom.Size')
eYo.forward('geom.Rect')

//... var P
//... let C = eYo.test.randN()
//... let L = eYo.test.randN()
//... let snap_p = eYo.p6y.new('p', onr)
//... snap_p.value_ = true
//... let m = {
//...   c: eYo.test.randN(),
//...   l: eYo.test.randN(),
//... }
//... let mm = {
//...   x: m.c * eYo.geom.X,
//...   y: m.l * eYo.geom.Y,
//... }
//... let dm = {
//...   dc: eYo.test.randN(),
//...   dl: eYo.test.randN(),
//... }
//... let dmm = {
//...   dx: dm.dc * eYo.geom.X,
//...   dy: dm.dl * eYo.geom.Y,
//... }
//... let Cs = eYo.test.randN(true)
//... let Ls = eYo.test.randN(true)
//... let ms = {
//...   c: eYo.test.randN(true),
//...   l: eYo.test.randN(true),
//... }
//... let mms = {
//...   x: ms.c * eYo.geom.X,
//...   y: ms.l * eYo.geom.Y,
//... }
//... let isPcl = (P, c = 0, l = 0) => {
//...   chai./**/expect(P).almost.eql({c, l})
//... }

/**
 * `Point` is modelling a planar point that stores its coordinates in text units.
 * When `snap` is true, the coordinates are snapped to half integers horizontally and quarter integers vertically.
 * Orientation is from top to bottom and from left to right.
 * Orientation is from top to bottom and from left to right.
 * @name {eYo.geom.Point}
 * @constructor
 * @param {*} ... - See the implementation.
 */
eYo.geom.newC9r('Point', {
  //<<< mochai: Point
    //<<< mochai: Basics
    //... P = new eYo.geom.Point()
    //... chai.expect(P).property('snap_p')
    //>>>
  /**
   * Initialize the point forwarding to `set`.
   * @param {Boolean|eYo.geom.PointLike} [snap] - Defaults to true
   * @param {*} snap
   * @param {*} c 
   * @param {*} l 
   */
  init (snap, c, l) {
    //<<< mochai: init
    if (!eYo.isBool(snap)) {
      if (eYo.isaP6y(snap)) {
        this.p6yReplace('snap', snap)
        this.set(c, l)
        return
        //... P = new eYo.geom.Point()
        //... P.p6yReplace('snap', snap_p)
        //... chai.expect(P.snap_p[eYo.Sym.target]).equal(snap_p)
        //... chai.expect(P.snap_ = false).equal(snap_p.value)
        //... chai.expect(snap_p.value_ = true).equal(P.snap)
        //... P = new eYo.geom.Point(snap_p)
        //... isPcl(P, 0, 0)
        //... chai.expect(P.snap_ = false).equal(snap_p.value)
        //... chai.expect(snap_p.value_ = true).equal(P.snap)
        //... P = new eYo.geom.Point(snap_p, ms.c)
        //... isPcl(P, ms.c, 0)
        //... chai.expect(P.snap_ = false).equal(snap_p.value)
        //... chai.expect(snap_p.value_ = true).equal(P.snap)
        //... P = new eYo.geom.Point(snap_p, ms.c, ms.l)
        //... chai.expect(P).almost.eql(ms)
        //... chai.expect(P.snap_ = false).equal(snap_p.value)
        //... chai.expect(snap_p.value_ = true).equal(P.snap)        
      } else if (eYo.isDef(snap)) {
        let $snap = snap.snap
        if (eYo.isDef($snap)) {
          this.snap_ = $snap
          this.set(snap)
          return
        }
        eYo.isDef(l) && eYo.throw(`${this.eyo.name}/init: Unexpected last argument: ${l}`)
        //... chai.expect(() => {
        //...   new eYo.geom.Point(1, 2, 3)
        //... }).throw()
        ;[snap, c, l] = [false, snap, c]
      } else {
        snap = false
      }
    }
    this.snap_ = snap
    this.set(c, l)
    //>>>
  },
  properties: {
    //<<< mochai: Properties
    //... P = new eYo.geom.Point()
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
      //... chai.expect(P).property('c_p')
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
      //... chai.expect(P).property('l_p')
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
      //... P = new eYo.geom.Point(false, mm)
      //... chai.expect(P).almost.eql(m)
      //... P.x_ += 5 * eYo.geom.X
      //... isPcl(P, m.c + 5, m.l)
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
      //... P = new eYo.geom.Point(false, mm)
      //... chai.expect(P).almost.eql(m)
      //... P.y_ += 5 * eYo.geom.Y
      //... isPcl(P, m.c, m.l + 5)
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
      //... P = new eYo.geom.Point(false, {x: 3, y: 4})
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
      //... P = new eYo.geom.Point(false, m)
      //... let PP = P.copy
      //... chai.expect(P).not.equal(PP)
      //... chai.expect(P).almost.eql(PP)
      //>>>
    },
    /**
     * Convert the receiver to a `eYo.geom.Size` instance.
     * @return {eYo.geom.Size}
     */
    asSize: {
      //<<< mochai: asSize
      get () {
        return new eYo.geom.Size(this.snap_, this.c_, this.l_)
      }
      //... P = new eYo.geom.Point(false, m)
      //... let S = P.asSize
      //... chai.expect(S).eyo_size
      //... chai.expect(S).almost.eql({w: m.c, h: m.l})
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
      //... P = new eYo.geom.Point(false, m.c + 2 * delta, m.l)
      //... chai.expect(P.eql(m, 1.01 * epsilon)).true
      //... chai.expect(P.eql(m, 0.99 * epsilon)).false
      //... var delta = epsilon * (m.l + 1) / (1 - epsilon)
      //... P = new eYo.geom.Point(false, m.c, m.l + 2 * delta)
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
      if (eYo.isDef(c.c) && eYo.isDef(c.l)) {
        eYo.isDef(l) && eYo.throw(`Unexpected last argument ${this.eyo.name}/set: ${l}`)
        this.c_ = c.c
        this.l_ = c.l
        //... P = new eYo.geom.Point()
        //... P.set(m)
        //... chai.expect(P).eql(m)
        //... chai.expect(() => P.set(m, null)).not.throw()
        //... chai.expect(() => P.set(m, 1)).throw()
      } else if (eYo.isDef(c.x) && eYo.isDef(c.y)) {
        eYo.isDef(l) && eYo.throw(`${this.eyo.name}/set: Unexpected argument 'l' ${l}`)
        this.x_ = c.x
        this.y_ = c.y
        //... P = new eYo.geom.Point()
        //... P.set(mm)
        //... chai.expect(P).almost.eql(m)
        //... chai.expect(() => P.set(mm, null)).not.throw()
        //... chai.expect(() => P.set(mm, 1)).throw()
      } else if (eYo.isDef(c.clientX) && eYo.isDef(c.clientY)) {
        eYo.isDef(l) && eYo.throw(`${this.eyo.name}/set: Unexpected argument 'l' ${l}`)
        this.x_ = c.clientX
        this.y_ = c.clientY
        //... P = new eYo.geom.Point()
        //... var mmClient = {clientX: mm.x, clientY: mm.y}
        //... P.set(mmClient)
        //... chai.expect(P).almost.eql(m)
        //... chai.expect(() => P.set(mmClient, null)).not.throw()
        //... chai.expect(() => P.set(mmClient, 1)).throw()
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
        //... P = new eYo.geom.Point(); c_p.value_ = C; l_p.value_ = L
        //... P.set(c_p, L)
        //... isPcl(P, C, L)
        //... chai.expect(P.c_ = eYo.test.randN()).equal(c_p.value)
        //... P = new eYo.geom.Point(); c_p.value_ = C; l_p.value_ = L
        //... P.set(C, l_p)
        //... isPcl(P, C, L)
        //... chai.expect(P.l_ = eYo.test.randN()).equal(l_p.value)
        //... P = new eYo.geom.Point(); c_p.value_ = C; l_p.value_ = L
        //... P.set(c_p, l_p)
        //... isPcl(P, C, L)
        //... chai.expect(P).eql({c: (c_p.value_ = eYo.test.randN()), l: (l_p.value_ = eYo.test.randN())})
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
      if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
        eYo.isDef(y) && eYo.throw(`Unexpected last argument ${this.eyo.name}/pSet: ${y}`)
        //... P = new eYo.geom.Point()
        //... P.pSet(mm)
        //... chai.expect(P).almost.eql(m)
        ;[x, y] = [x.x, x.y]
      } else if (eYo.isDef(x.clientX) && eYo.isDef(x.clientY)) {
        //... P = new eYo.geom.Point()
        //... P.pSet({clientX: mm.x, clientY: mm.y})
        //... chai.expect(P).almost.eql(m)
        ;[x, y] = [x.clientX, x.clientY]
      } else if (eYo.isDef(x.c) && eYo.isDef(x.l)) {
        eYo.isDef(y) && eYo.throw(`Unexpected last argument ${this.eyo.name}/pSet (2): ${y}`)
        //... P = new eYo.geom.Point()
        //... P.pSet(m)
        //... chai.expect(P).almost.eql(m)
        this.c_ = x.c
        this.l_ = x.l
        return this
      } else if (!eYo.isDef(y)) {
        y = 0
      }
      //... P = new eYo.geom.Point()
      //... P.pSet(mm.x, mm.y)
      //... chai.expect(P).almost.eql(m)
      //... P = new eYo.geom.Point()
      //... P.pSet(mm.x)
      //... isPcl(P, m.c, 0)
      this.x_ = x
      this.y_ = y
      return this
      //>>>
    },
    /**
     * Scale the receiver.
     * @param {Number | Object} scaleX
     * @param {Number} [scaleY] - Defaults to `scaleX`.
     * @return {eYo.geom.Point} the receiver
     */
    scale (scaleX, scaleY) {
      //<<< mochai: scale
      //... let m = {c: eYo.test.randN(), l: eYo.test.randN()}
      //... var scaleX = 1 + eYo.test.randN()
      //... var scaleY = 1 + eYo.test.randN()
      if (scaleX.x) {
        eYo.isDef(scaleY) && eYo.throw(`${this.eyo.name}/scale: Unexpected last argument ${scaleY} (scaleY)`)
        //... P = new eYo.geom.Point(m)
        //... chai.expect(() => P.scale({x: 1}, 2)).throw()
        this.c_ *= scaleX.x
        this.l_ *= (scaleX.y || scaleX.x)
        //... chai.expect(P).almost.eql(m)
        //... P.scale({x: scaleX})
        //... isPcl(P, m.c * scaleX, m.l * scaleX)
        //... P.scale({x: 1 / scaleX})
        //... chai.expect(P).almost.eql(m)
        //... P.scale({x: scaleX, y: scaleY})
        //... isPcl(P, m.c * scaleX, m.l * scaleY)
        //... P.scale({x: 1 / scaleX, y: 1 / scaleY})
        //... chai.expect(P).almost.eql(m)
      } else if (scaleX.y) {
        eYo.isDef(scaleY) && eYo.throw(`${this.eyo.name}/scale: Unexpected last argument ${scaleY} (scaleY)`)
        //... P = new eYo.geom.Point(m)
        //... chai.expect(() => P.scale({y: 1}, 2)).throw()
        this.c_ *= scaleX.y
        this.l_ *= scaleX.y
        //... chai.expect(P).almost.eql(m)
        //... P.scale({y: scaleY})
        //... isPcl(P, m.c * scaleY, m.l * scaleY)
        //... P.scale({y: 1 / scaleY})
        //... chai.expect(P).almost.eql(m)
      } else {
        //... P = new eYo.geom.Point(m)
        this.c_ *= scaleX
        this.l_ *= (scaleY || scaleX)
        //... chai.expect(P).almost.eql(m)
        //... P.scale(scaleX)
        //... isPcl(P, m.c * scaleX, m.l * scaleX)
        //... P.scale(1 / scaleX)
        //... chai.expect(P).almost.eql(m)
        //... P.scale(scaleX, scaleY)
        //... isPcl(P, m.c * scaleX, m.l * scaleY)
        //... P.scale(1 / scaleX, 1 / scaleY)
        //... chai.expect(P).almost.eql(m)
      }
      return this
      //>>>
    },
    /**
     * Unscale the receiver.
     * @param {Number | Object} scaleX - The object has a `x` and  a `y` number field.
     * @param {Number} [scaleY] - Defaults to scaleX
     * @return {eYo.geom.Point} the receiver
     */
    unscale (scaleX, scaleY) {
      //<<< mochai: unscale
      //... let m = {c: eYo.test.randN(), l: eYo.test.randN()}
      //... var scaleX = 1 + eYo.test.randN()
      //... var scaleY = 1 + eYo.test.randN()
      if (scaleX.x) {
        eYo.isDef(scaleY) && eYo.throw(`${this.eyo.name}/scale: Unexpected last argument ${scaleY} (scaleY)`)
        //... P = new eYo.geom.Point(m)
        //... chai.expect(() => P.unscale({x: 1}, 2)).throw()
        this.c_ /= scaleX.x
        this.l_ /= (scaleX.y || scaleX.x)
        //... chai.expect(P).almost.eql(m)
        //... P.unscale({x: scaleX})
        //... isPcl(P, m.c / scaleX, m.l / scaleX)
        //... P.unscale({x: 1 / scaleX})
        //... chai.expect(P).almost.eql(m)
        //... P.unscale({x: scaleX, y: scaleY})
        //... isPcl(P, m.c / scaleX, m.l / scaleY)
        //... P.unscale({x: 1 / scaleX, y: 1 / scaleY})
        //... chai.expect(P).almost.eql(m)
      } else if (scaleX.y) {
        eYo.isDef(scaleY) && eYo.throw(`${this.eyo.name}/scale: Unexpected last argument ${scaleY} (scaleY)`)
        //... P = new eYo.geom.Point(m)
        //... chai.expect(() => P.scale({y: 1}, 2)).throw()
        this.c_ /= scaleX.y
        this.l_ /= scaleX.y
        //... chai.expect(P).almost.eql(m)
        //... P.unscale({y: scaleY})
        //... isPcl(P, m.c / scaleY, m.l / scaleY)
        //... P.unscale({y: 1 / scaleY})
        //... chai.expect(P).almost.eql(m)
      } else {
        //... P = new eYo.geom.Point(m)
        this.c_ /= scaleX
        this.l_ /= (scaleY || scaleX)
        //... chai.expect(P).almost.eql(m)
        //... P.unscale(scaleX)
        //... isPcl(P, m.c / scaleX, m.l / scaleX)
        //... P.unscale(1 / scaleX)
        //... chai.expect(P).almost.eql(m)
        //... P.unscale(scaleX, scaleY)
        //... isPcl(P, m.c / scaleX, m.l / scaleY)
        //... P.unscale(1 / scaleX, 1 / scaleY)
        //... chai.expect(P).almost.eql(m)
      }
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
      //... P = new eYo.geom.Point()
      if (eYo.isDef(dc.w) && eYo.isDef(dc.h)) {
        eYo.isDef(dl) && eYo.throw(`Unexpected last argument ${this.eyo.name}/forward: ${dl}`)
        ;[dc, dl] = [dc.w, dc.h]
        //... P.set(m)
        //... P.forward({w: dm.dc, h: dm.dl})
        //... isPcl(P, m.c+dm.dc, m.l+dm.dl)
      } else if (eYo.isDef(dc.dc) && eYo.isDef(dc.dl)) {
        eYo.isDef(dl) && eYo.throw(`Unexpected last argument ${this.eyo.name}/forward: ${dl}`)
        ;[dc, dl] = [dc.dc, dc.dl]
        //... P.set(m)
        //... P.forward(dm)
        //... isPcl(P, m.c+dm.dc, m.l+dm.dl)
      }
      eYo.isNum(dc) || eYo.throw(`Missing number argument ${this.eyo.name}/forward: ${dc}`)
      dc && (this.c_ += dc)
      dl && (this.l_ += dl)
      return this
      //... P.set(m)
      //... P.forward(dm.dc, dm.dl)
      //... isPcl(P, m.c+dm.dc, m.l+dm.dl)
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
      //... P = new eYo.geom.Point()
      if (eYo.isDef(dc.w) && eYo.isDef(dc.h)) {
        eYo.isDef(dl) && eYo.throw(`Unexpected last argument ${this.eyo.name}/backward: ${dl}`)
        ;[dc, dl] = [dc.w, dc.h]
        //... P.set(m)
        //... P.backward({w: dm.dc, h: dm.dl})
        //... isPcl(P, m.c-dm.dc, m.l-dm.dl)
      } else if (eYo.isDef(dc.dc) && eYo.isDef(dc.dl)) {
        eYo.isDef(dl) && eYo.throw(`Unexpected last argument ${this.eyo.name}/forward: ${dl}`)
        ;[dc, dl] = [dc.dc, dc.dl]
        //... P.set(m)
        //... P.backward(dm)
        //... isPcl(P, m.c-dm.dc, m.l-dm.dl)
      }
      eYo.isNum(dc) || eYo.throw(`Missing number argument ${this.eyo.name}/backward: ${dc}`)
      dc && (this.c_ -= dc)
      dl && (this.l_ -= dl)
      return this
      //... P.set(m)
      //... P.backward(dm.dc, dm.dl)
      //... isPcl(P, m.c-dm.dc, m.l-dm.dl)
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
      //... P = new eYo.geom.Point()
      if (eYo.isDef(dx.dx) && eYo.isDef(dx.dy)) {
        eYo.isDef(dy) && eYo.throw(`Unexpected last argument ${this.eyo.name}/pForward: ${dy}`)
        ;[dx, dy] = [dx.dx, dx.dy]
        //... P.pSet(mm)
        //... P.pForward(dmm)
        //... isPcl(P, m.c+dm.dc, m.l+dm.dl)
        //... chai.expect(() => {P.pForward(dmm, null)}).not.throw()
        //... chai.expect(() => {P.pForward(dmm, 1)}).throw()
      }
      eYo.isNum(dx) || eYo.throw(`Missing number argument ${this.eyo.name}/pForward: ${dx}`)
      dx && (this.x_ += dx)
      dy && (this.y_ += dy)
      return this
      //... P.pSet(mm)
      //... P.pForward(dmm.dx, dmm.dy)
      //... isPcl(P, m.c+dm.dc, m.l+dm.dl)
      //... P.pSet(mm)
      //... P.pForward(dmm.dx)
      //... isPcl(P, m.c+dm.dc, m.l)
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
      //... P = new eYo.geom.Point()
      if (eYo.isDef(dx.dx) && eYo.isDef(dx.dy)) {
        eYo.isDef(dy) && eYo.throw(`Unexpected last argument ${this.eyo.name}/pBackward: ${dy}`)
        ;[dx, dy] = [dx.dx, dx.dy]
        //... P.pSet(mm)
        //... P.pBackward(dmm)
        //... isPcl(P, m.c-dm.dc, m.l-dm.dl)
        //... chai.expect(() => {P.pBackward(dmm, null)}).not.throw()
        //... chai.expect(() => {P.pBackward(dmm, 1)}).throw()
      }
      eYo.isNum(dx) || eYo.throw(`Missing number argument ${this.eyo.name}/pBackward: ${dx}`)
      dx && (this.x_ -= dx)
      dy && (this.y_ -= dy)
      return this
      //... P.pSet(mm)
      //... P.pBackward(dmm.dx, dmm.dy)
      //... isPcl(P, m.c-dm.dc, m.l-dm.dl)
      //... P.pSet(mm)
      //... P.pBackward(dmm.dx)
      //... isPcl(P, m.c-dm.dc, m.l)
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
        //... P = new eYo.geom.Point()
        //... P.pSet(mm)
        //... chai.expect(d).almost.equal(P.pDistance({clientX: mm.x + dmm.dx, clientY: mm.y + dmm.dy}))
      } else if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
        dx = this.x - x.x
        dy = this.y - x.y
        //... P = new eYo.geom.Point()
        //... P.pSet(mm)
        //... chai.expect(d).almost.equal(P.pDistance({x: mm.x + dmm.dx, y: mm.y + dmm.dy}))
      } else {
        dx = this.x - x
        dy = this.y - (y || 0)
        //... P = new eYo.geom.Point()
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

eYo.geom.Point[eYo.$].finalizeC9r()

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
  if (!eYo.isBool(snap)) {
    eYo.isDef(y) && eYo.throw(`eYo.geom.pPoint: Unexpected last argument: ${y}`)
    //... chai.expect(() => {eYo.geom.pPoint(1, 2, 3)}).throw()
    ;[snap, x, y] = [false, snap, x]
    //... P = eYo.geom.pPoint(mm)
    //... chai.expect(P).almost.eql(m)
    //... P = eYo.geom.pPoint(mm.x, mm.y)
    //... chai.expect(P).almost.eql(m)
  }
  return new eYo.geom.Point(snap).pSet(x, y)
  //... P = eYo.geom.pPoint(false, mm)
  //... chai.expect(P).almost.eql(m)
  //... P = eYo.geom.pPoint(false, mm.x, mm.y)
  //... chai.expect(P).almost.eql(m)
  //... P = eYo.geom.pPoint(true, mms)
  //... chai.expect(P).almost.eql(ms)
  //... P = eYo.geom.pPoint(true, mms.x, mms.y)
  //... chai.expect(P).almost.eql(ms)
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
  //... let ns = eYo.o4t.newNS()
  //... ns.makeBaseC9r(true)
  //... ns.BaseC9r[eYo.$].makePointed('origin')
  //... ns.BaseC9r[eYo.$].finalizeC9r()
  //... var R
  this.modelMerge({
    //<<< mochai: Text coordinates
    properties: {
      //<<< mochai: properties
      [key]: {
        //<<< mochai: origin
        //... R = ns.new('foo', onr)
        //... chai.expect(R).property('origin_p')
        value () {
          return new eYo.geom.Point()
        },
        //... chai.expect(R.origin).eyo_point
        copy: true,
        //... // A copy is not the original
        //... chai.expect(R.origin).not.equal(R.origin_)
        //... // A copy is not another copy
        //... chai.expect(R.origin).not.equal(R.origin)
        //... chai.expect(R.origin).almost.eql(R.origin_)
        //... chai.expect(R.origin).almost.eql(R.origin)
        set (stored, after) {
          stored.pSet(after)
          //... R = ns.new('foo', onr)
          //... var pt = eYo.geom.randPoint(false)
          //... chai.expect(R.origin_).not.equal(pt)
          //... R.origin_ = pt
          //... chai.expect(R.origin_).not.equal(pt)
          //... chai.expect(R.origin_).almost.eql(pt)
        }
        //>>>  
      },
      //>>>  
    },
    aliases: {
      //<<< mochai: aliases
      [key + '.c']: ['c', 'c_min'],
        //<<< mochai: c, c_min
        //... R = ns.new('foo', onr)
        //... chai.expect(R.origin.c).equal(R.c).equal(R.c_min)
        //... R.c_ += 1
        //... chai.expect(R.origin.c).equal(R.c).equal(R.c_min)
        //... R.c_min_ -= 1
        //... chai.expect(R.origin.c).equal(R.c).equal(R.c_min)
        //... R.origin_.c_ += 1
        //... chai.expect(R.origin.c).equal(R.c).equal(R.c_min)
        //>>>
      [key + '.l']: ['l', 'l_min'],
        //<<< mochai: l, l_min
        //... chai.expect(R.origin.l).equal(R.l).equal(R.l_min)
        //... R.l_ += 1
        //... chai.expect(R.origin.l).equal(R.l).equal(R.l_min)
        //... R.l_min_ -= 1
        //... chai.expect(R.origin.l).equal(R.l).equal(R.l_min)
        //... R.origin_.l_ += 1
        //... chai.expect(R.origin.l).equal(R.l).equal(R.l_min)
        //>>>
      //>>> 
    },
    //>>>
  })
  this.modelMerge({
    //<<< mochai: Board coordinates
    aliases: {
      //<<< mochai: aliases
      //... let R = ns.new('foo', onr)
      //... let m = {c: 1, l: 2, w: 3, h: 4}
      //... R.origin_.set(m)
      // basic properties in board dimensions
      [key + '.x']: ['x', 'x_min'],
        //<<< mochai: x, x_min
        //... chai.expect(R.origin.x).almost.equal(m.c * eYo.geom.X)
        //... chai.expect(R.origin.x).almost.equal(R.x).almost.equal(R.x_min)
        //... R.x_ += 2 * eYo.geom.X
        //... chai.expect(R.origin.x).almost.equal(R.x).almost.equal(R.x_min)
        //... R.x_min_ -= eYo.geom.X
        //... chai.expect(R.origin.x).almost.equal(R.x).almost.equal(R.x_min)
        //... R.origin_.x_ -= eYo.geom.X
        //... chai.expect(R.origin.x).almost.equal(R.x).almost.equal(R.x_min).almost.equal(m.c * eYo.geom.X)
        // Convenient setters in board coordinates
        //... R.x_ += 5 * eYo.geom.X
        //... m.c += 5
        //... chai.expect(R.x).almost.equal(m.c * eYo.geom.X)
        //>>>
      [key + '.y']: ['y', 'y_min'],
        //<<< mochai: y, y_min
        //... chai.expect(R.origin.y).almost.equal(R.y).almost.equal(R.y_min).almost.equal(m.l * eYo.geom.Y)
        //... chai.expect(R.origin.y).almost.equal(R.y).almost.equal(R.y_min)
        //... R.y_ += 2 * eYo.geom.Y
        //... chai.expect(R.origin.y).almost.equal(R.y).almost.equal(R.y_min)
        //... R.y_min_ -= eYo.geom.Y
        //... chai.expect(R.origin.y).almost.equal(R.y).almost.equal(R.y_min)
        //... R.origin_.y_ -= eYo.geom.Y
        //... chai.expect(R.origin.y).almost.equal(R.y).almost.equal(R.y_min)
        //... chai.expect(R.y).almost.equal(m.l * eYo.geom.Y)
        //... R.y_ += 4 * eYo.geom.Y
        //... m.l += 4
        //... chai.expect(R.y).almost.equal(m.l * eYo.geom.Y)
        //>>>
      //>>>
    },
    //>>>
  })
  //>>>
}

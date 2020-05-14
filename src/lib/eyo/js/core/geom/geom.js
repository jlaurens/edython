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

/**
 * unit
 */

// x, y, with, height are in pixels
// c, l, w, h are in text units

/**
 * @name{eYo.geom}
 * @namespace
 */
//<<< mochai: eYo.geom

eYo.c9r.makeNS(eYo, 'geom', {
  //<<< mochai: CONST
  X () {
    return eYo.font.space
  },
  Y () {
    return eYo.font.lineHeight
  },
  REM () {
    return parseFloat(getComputedStyle(document.documentElement).fontSize)
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
      this.eyo.p6yReplace(this, 'snap', snap_p)
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

eYo.geom.o4tEnhanced()

/**
 * Declare the given model for the associate constructor.
 * The default implementation calls `methodsMerge`.
 * @param {Object} model - Object, like for |makeC9r|.
 */
eYo.geom.Dlgt_p.modelMerge = function (model) {
  model.aliases && this.p6yAliasesMerge(model.aliases)
  model.properties && this.p6yMerge(model.properties)
  model.methods && this.methodsMerge(model.methods)
  model.CONSTs && this.CONSTsMerge(model.CONSTs)
}

eYo.geom.BaseC9r.eyo.finalizeC9r(['aliases'], {
  properties: {
    [eYo.model.ANY]: eYo.P6y.eyo.modelFormat,
    [eYo.model.VALIDATE]: eYo.model.validateD,
  },
})

//<<< mochai: Point

/**
 * `AbstractPoint` is modelling a planar point that stores its coordinates in text units.
 * Only computed properties are declared.
 * Orientation is from top to bottom and from left to right.
 * @name {eYo.geom.AbstractPoint}
 * @constructor
 * @param {Number} c - Horizontal coordinates, or another planar object.
 */
eYo.geom.makeC9r('AbstractPoint', {
  properties: {
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
    },
    //<<< mochai: Point x
    //... var m = {c: 1, l: 2}
    //... var mm = {x: m.c * eYo.geom.X, y: m.l * eYo.geom.Y}
    //... var p = new eYo.geom.Point(false, mm)
    //... chai.expect(p).almost.eql(m)
    //... p.x_ += 5 * eYo.geom.X
    //... chai.expect(p).almost.eql({c: m.c + 5, l: m.l})
    //>>>
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
    },
    //<<< mochai: Point y
    //... var m = {c: 1, l: 2}
    //... var mm = {x: m.c * eYo.geom.X, y: m.l * eYo.geom.Y}
    //... var p = new eYo.geom.Point(false, mm)
    //... chai.expect(p).almost.eql(m)
    //... p.y_ += 5 * eYo.geom.Y
    //... chai.expect(p).almost.eql({c: m.c, l: m.l + 5})
    //>>>
    /**
     * Euclidian magnitude between points.
     * @return {number} non negative number
     */
    magnitude: {
      get () {
        var dx = this.x
        var dy = this.y
        return Math.sqrt(dx * dx + dy * dy)
      }
    },
    //<<< mochai: Point magnitude
    //... var mm = {x: 3, y: 4}
    //... var p = new eYo.geom.Point(false, mm)
    //... chai.expect(p.magnitude).almost.eql(5)
    //>>>
    /**
     * clone the receiver.
     * @type {eYo.geom.Point}
     */
    copy: {
      get () {
        return new this.eyo.C9r(this)
      }
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
  },
  methods: {
    /**
     * Test equality between the receiver and the rhs.
     * @param {*} rhs - Anything
     * @param {*} tolerance - a non negative number, defaults to `eYo.EPSILON`
     */
    eql (rhs, tolerance = eYo.EPSILON) {
      return eYo.equals(this.c_, rhs.c, tolerance) && eYo.equals(this.l_, rhs.l, tolerance)
    },
  }
})

eYo.geom.AbstractPoint.eyo.finalizeC9r()

/**
 * Like `advance` but sets the coordinates, instead of advancing them.
 * @param {Number | eYo.geom.Point | Event | Object} c
 * @param {Number} [l]
 * @return {eYo.geom.Point} The receiver
 */
eYo.geom.AbstractPoint_p.set = function (c = 0, l) {
  //<<< mochai: Point: set
  //... var p, m, mm
    if (eYo.isDef(c.c) && eYo.isDef(c.l)) {
    this.c_ = c.c
    this.l_ = c.l
    //... p = new eYo.geom.Point()
    //... m = {c: 1, l: 2}
    //... p.set(m); chai.expect(p).eql(m)
    //... chai.expect(() => p.set(m, null)).not.throw()
    //... chai.expect(() => p.set(m, 1)).throw()
  } else if (eYo.isDef(c.x) && eYo.isDef(c.y)) {
    this.x_ = c.x
    this.y_ = c.y
    //... p = new eYo.geom.Point()
    //... mm = {x: m.c * eYo.geom.X, y: m.l * eYo.geom.Y}
    //... p.set(mm); chai.expect(p).almost.eql(m)
    //... chai.expect(() => p.set(mm, null)).not.throw()
    //... chai.expect(() => p.set(mm, 1)).throw()
  } else if (eYo.isDef(c.clientX) && eYo.isDef(c.clientY)) {
    this.x_ = c.clientX
    this.y_ = c.clientY
    //... p = new eYo.geom.Point()
    //... mm = {clientX: m.c * eYo.geom.X, clientY: m.l * eYo.geom.Y}
    //... p.set(mm); chai.expect(p).almost.eql(m)
    //... chai.expect(() => p.set(mm, null)).not.throw()
    //... chai.expect(() => p.set(mm, 1)).throw()
  } else if (eYo.isDef(c.width) && eYo.isDef(c.height)) {
    this.x_ = c.width
    this.y_ = c.height
    //... p = new eYo.geom.Point()
    //... mm = {width: m.c * eYo.geom.X, height: m.l * eYo.geom.Y}
    //... p.set(mm); chai.expect(p).almost.eql(m)
    //... chai.expect(() => p.set(mm, null)).not.throw()
    //... chai.expect(() => p.set(mm, 1)).throw()
  } else {
    eYo.isaP6y(c)
    ? this.eyo.p6yReplace(this, 'c', c)
    : (this.c_ = c || 0)
    eYo.isaP6y(l)
    ? this.eyo.p6yReplace(this, 'l', l)
    : (this.l_ = l || 0)
    return this
    //... let p_c = eYo.p6y.new('c', onr)
    //... let p_l = eYo.p6y.new('l', onr)
    //... p = new eYo.geom.Point(); p_c.value_ = 1; p_l.value_ = 2
    //... p.set(p_c, 2)
    //... chai.expect(p).eql(m)
    //... chai.expect(p.c_ = 2).equal(p_c.value)
    //... p = new eYo.geom.Point(); p_c.value_ = 1; p_l.value_ = 2
    //... p.set(1, p_l)
    //... chai.expect(p).eql(m)
    //... chai.expect(p.l_ = 1).equal(p_l.value)
    //... p = new eYo.geom.Point(); p_c.value_ = 1; p_l.value_ = 2
    //... p.set(p_c, p_l)
    //... chai.expect(p).eql(m)
    //... chai.expect(p).eql({c: (p_c.value_ = 2), l: (p_l.value_ = 1)})
  }
  eYo.isDef(l) && eYo.throw(`${this.eyo.name}/set: Unexpected argument 'l' ${l}`)
  return this
  //>>>
}

/**
 * Setter.
 * @param {Number} x  x coordinate
 * @param {Number} y  y coordinate
 * @return {eYo.geom.Point} The receiver
 */
eYo.geom.AbstractPoint_p.xySet = function (x = 0, y = 0) {
  if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
    this.x_ = x.x
    this.y_ = x.y
    return this
  } else if (eYo.isDef(x.clientX) && eYo.isDef(x.clientY)) {
    this.x_ = x.clientX
    this.y_ = x.clientY
    return this
  } else if (eYo.isDef(x.width) && eYo.isDef(x.height)) {
    this.x_ = x.width
    this.y_ = x.height
    return this
  }
  this.x_ = x
  this.y_ = y
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.geom.Point | eYo.geom.Size} c
 * @param {number} l
 * @return {eYo.geom.Point}
 */
eYo.geom.AbstractPoint_p.forward = function (c = 0, l = 0) {
  if (eYo.isDef(c.x) && eYo.isDef(c.y)) {
    this.x_ += c.x
    this.y_ += c.y
    return this
  }
  this.c_ += c
  this.l_ += l
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.geom.Point | eYo.geom.Size} c
 * @param {number} l
 * @return {eYo.geom.Point} c
 */
eYo.geom.AbstractPoint_p.backward = function (c = 0, l = 0) {
  if (eYo.isDef(c.x) && eYo.isDef(c.y)) {
    this.x_ -= c.x
    this.y_ -= c.y
    return this
  }
  this.c_ -= c
  this.l_ -= l
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * Board coodinates
 * @param {number} x
 * @param {number} y
 * @return {eYo.geom.Point}
 */
eYo.geom.AbstractPoint_p.xyForward = function (x = 0, y = 0) {
  if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
    y = x.y
    x = x.x
  }
  this.x_ += x
  this.y_ += y
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * Board coodinates
 * @param {number} x
 * @param {number} y
 * @return {eYo.geom.Point}
 */
eYo.geom.AbstractPoint_p.xyBackward = function (x = 0, y = 0) {
  if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
    y = x.y
    x = x.x
  }
  this.x_ -= x
  this.y_ -= y
  return this
}

/**
 * Scale the receiver.
 * @param {Number | Object} scaleX
 * @param {Number} [scaleY] - Defaults to
 * @return {eYo.geom.Point} the receiver
 */
eYo.geom.AbstractPoint_p.scale = function (scaleX, scaleY) {
  if (scaleX.x) {
    this.c_ *= scaleX.x
    this.l_ *= (scaleX.y || scaleX.x)
  } else if (scaleX.y) {
    this.c_ *= scaleX.y
    this.l_ *= scaleX.y
  } else {
    this.c_ *= scaleX
    this.l_ *= (scaleY || scaleX)
  }
  return this
}

/**
 * Unscale the receiver.
 * @param {Number | Object} scaleX
 * @param {Number} [scaleY] - Defaults to scaleX
 * @return {eYo.geom.Point} the receiver
 */
eYo.geom.AbstractPoint_p.unscale = function (scaleX, scaleY) {
  if (scaleX.x) {
    this.c_ /= scaleX.x
    this.l_ /= (scaleX.y || scaleX.x)
  } else if (scaleX.y) {
    this.c_ /= scaleX.y
    this.l_ /= scaleX.y
  } else {
    this.c_ /= scaleX
    this.l_ /= (scaleY || scaleX)
  }
  return this
}

/**
 * Euclidian distance between points.
 * @param {eYo.geom.Point} other
 * @return {number} non negative number
 */
eYo.geom.AbstractPoint_p.xyDistance = function (other) {
  var dx = this.x - other.x
  var dy = this.y - other.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Test container.
 * Returns true iff the receiver is inside the given rect.
 * Rounding errors are taken into account.
 * @param {eYo.geom.Rect} rect
 * @return {Boolean}
 */
eYo.geom.AbstractPoint_p.in = function (rect) {
  return eYo.greater(this.c, rect.c_min)
    && eYo.greater(rect.c_max, this.c)
    && eYo.greater(this.l, rect.l_min)
    && eYo.greater(rect.l_max, this.l)
}

/**
 * Test container.
 * Opposite of `in`, except for the rect boundary. A point of the rect boundary is in and out the rect.
 * Rounding errors are taken into account.
 * @param {eYo.geom.Rect} rect
 * @return {Boolean} non negative number
 */
eYo.geom.AbstractPoint_p.out = function (rect) {
  return eYo.greater(this.c, rect.c_max)
    || eYo.greater(rect.c_min, this.c)
    || eYo.greater(this.l, rect.l_max)
    || eYo.greater(rect.l_min, this.l)
}

/**
 * `Point` is modelling a planar point that stores its coordinates in text units.
 * When `snap` is true, the coordinates are snapped to half integers horizontally and quarter integers vertically.
 * Orientation is from top to bottom and from left to right.
 * @name {eYo.geom.Point}
 * @constructor
 * @param {*} ... - See the implementation.
 */
eYo.geom.AbstractPoint.makeSubC9r('Point', {
  /**
   * Initialize the point forwarding to `set`.
   * @param {Boolean|eYo.geom.PointLike} [snap] - Defaults to true
   * @param {*} c 
   * @param {*} l 
   */
  init (snap, c, l) {
    if (!eYo.isBool(snap)) {
      eYo.isDef(l) && eYo.throw(`${this.eyo.name}/init: Unexpected last argument: ${snap}`)
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
  },
  properties: {
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
    },
  },
})

eYo.geom.Point.eyo.finalizeC9r()

/**
 * Convenient creator.
 * @param {Boolean} [snap] - Whether the receiver should snap to the grid, defaults to false
 * @param {Number} x - x coordinate
 * @param {Number} y - y coordinate
 * @return {eYo.geom.Point} The receiver
 */
eYo.geom.xyPoint = function (snap, x, y) {
  if (!eYo.isBool(snap)) {
    eYo.isDef(y) && eYo.throw(`eYo.geom.xyPoint: Unexpected last argument: ${y}`)
    ;[snap, x, y] = [false, snap, x]
  }
  return new eYo.geom.Point(snap).xySet(x, y)
}

/**
 * Convenient creator in text units.
 * @param {Boolean} [snap] - snap flag. Defaults to false.
 * @param {Number} [c] - c coordinate. Defaults to 0.
 * @param {Number} [l] - l coordinate. Defaults to 0.
 * @return {eYo.geom.Point} The receiver
 */
eYo.geom.clPoint = function (snap, c, l) {
  return new eYo.geom.Point(snap, c, l)
}

eYo.o4t.Dlgt_p.makePointed = function (key) {
  //<<< mochai: eYo.o4t.Dlgt.makePointed
  //... let ns = eYo.o4t.makeNS()
  //... ns.makeBaseC9r(true)
  //... ns.BaseC9r.eyo.makePointed('origin')
  //... ns.BaseC9r.eyo.finalizeC9r()
  //... var o
  this.modelMerge({
    //<<< mochai: Text coordinates
    properties: {
      //<<< mochai: properties
      [key]: {
        //<<< mochai: makePointed origin
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
          stored.xySet(after)
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
      'origin.c': ['c', 'c_min'],
        //... r = ns.new('foo', onr)
        //... chai.expect(r.origin.c).equal(r.c).equal(r.c_min)
        //... r.c_ += 1
        //... chai.expect(r.origin.c).equal(r.c).equal(r.c_min)
        //... r.c_min_ -= 1
        //... chai.expect(r.origin.c).equal(r.c).equal(r.c_min)
        //... r.origin_.c_ += 1
        //... chai.expect(r.origin.c).equal(r.c).equal(r.c_min)
      'origin.l': ['l', 'l_min'],
        //... chai.expect(r.origin.l).equal(r.l).equal(r.l_min)
        //... r.l_ += 1
        //... chai.expect(r.origin.l).equal(r.l).equal(r.l_min)
        //... r.l_min_ -= 1
        //... chai.expect(r.origin.l).equal(r.l).equal(r.l_min)
        //... r.origin_.l_ += 1
        //... chai.expect(r.origin.l).equal(r.l).equal(r.l_min)
      //>>> 
    },
    //>>>
  })
  this.modelMerge({
    //<<< mochai: Board coordinates
    aliases: {
      //<<< mochai: aliases
      //... r = ns.new('foo', onr)
      //... var m = {c: 1, l: 2, w: 3, h: 4}
      // basic properties in board dimensions
      [key + '.x']: ['x', 'x_min'],
        //<<< mochai: x, x_min
        //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
        //... r.x_ += eYo.geom.X
        //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
        //... r.x_min_ -= eYo.geom.X
        //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
        //... r.origin_.x_ += eYo.geom.X
        //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
        // Convenient setters in board coordinates
        //... chai.expect(r).almost.eql(m)
        //... chai.expect(r.x).almost.equal(m.c * eYo.geom.X)
        //... r.x_ += 5 * eYo.geom.X
        //... m.c += 5
        //... chai.expect(r).almost.eql(m)
        //>>>
      [key + '.y']: ['y', 'y_min'],
        //<<< mochai: y, y_min
        //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
        //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
        //... r.y_min_ -= eYo.geom.Y
        //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
        //... r.origin_.y_ += eYo.geom.Y
        //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
        //... r.y_ += 4 * eYo.geom.Y
        //... m.l += 4
        //... chai.expect(r).almost.eql(m)
        //>>>
      //>>>
    },
    //>>>
  })
  //>>>
}

//>>>

/**
 * `Size` is quite a synonym of Point with more aliases.
 * It is more like a vector, but size is a shorter name...
 */
//<<< mochai: Size
eYo.geom.AbstractPoint.makeSubC9r('Size', {
  /**
   * Initialize the point forwarding to `set`.
   * @param {Boolean|eYo.geom.PointLike|eYo.p6y.BaseC9r} [snap] - Defaults to true
   * @param {*} w 
   * @param {*} h 
   */
  init (snap, w, h) {
    //<<< mochai: Size init
    //... var s, ss
    //... var m = {w: 3, h: 4}
    //... var p_snap = eYo.p6y.new('p', onr); p_snap.value_ = true
    if (!eYo.isBool(snap)) {
      //... chai.expect(() => new eYo.geom.Size(1, 2, 3)).throw()
      if (eYo.isaP6y(snap)) {
        this.eyo.p6yReplace(this, 'snap', snap)
        this.set(w, h)
        return
        //... s = new eYo.geom.Size()
        //... s.eyo.p6yReplace(s, 'snap', p_snap)
        //... chai.expect(s.snap_p.__target).equal(p_snap)
        //... chai.expect(s.snap_ = false).equal(p_snap.value)
        //... chai.expect(p_snap.value_ = true).equal(s.snap)
        //... s = new eYo.geom.Size(p_snap)
        //... chai.expect(s).almost.eql({w: 0, h: 0})
        //... chai.expect(s.snap_ = false).equal(p_snap.value)
        //... chai.expect(p_snap.value_ = true).equal(s.snap)
        //... s = new eYo.geom.Size(p_snap, m.w)
        //... chai.expect(s).almost.eql({w: m.w, h: 0})
        //... chai.expect(s.snap_ = false).equal(p_snap.value)
        //... chai.expect(p_snap.value_ = true).equal(s.snap)
        //... s = new eYo.geom.Size(p_snap, m.w, m.h)
        //... chai.expect(s).almost.eql(m)
        //... chai.expect(s.snap_ = false).equal(p_snap.value)
        //... chai.expect(p_snap.value_ = true).equal(s.snap)        
      } else if (eYo.isDef(snap)) {
        eYo.isDef(h) && eYo.throw(`${this.eyo.name}/init: Unexpected last argument: ${snap}`)
        let $snap = snap.snap
        if (eYo.isDef($snap)) {
          this.snap_ = $snap
          this.set(snap)
          return
          //... ss = eYo.geom.randSize(true)
          //... s = new eYo.geom.Size(ss)
          //... chai.expect(s.snap).equal(ss.snap)
          //... chai.expect(s).almost.eql(ss)
          //... ss = eYo.geom.randSize(false)
          //... s = new eYo.geom.Size(ss)
          //... chai.expect(s).almost.eql(ss)
          //... chai.expect(s.snap).almost.eql(ss.snap)
        }
      }
      ;[snap, w, h] = [false, snap, w]
    }
    this.snap_ = snap
    this.set(w, h)
    //... s = new eYo.geom.Size(true, m.w)
    //... chai.expect(s).almost.eql({w: m.w, h: 0})
    //... chai.expect(s.snap).true
    //... s = new eYo.geom.Size(false, m.w)
    //... chai.expect(s).almost.eql({w: m.w, h: 0})
    //... chai.expect(s.snap).false
    //... s = new eYo.geom.Size(true, m.w, m.h)
    //... chai.expect(s).almost.eql(m)
    //... chai.expect(s.snap).true
    //... s = new eYo.geom.Size(false, m.w, m.h)
    //... chai.expect(s).almost.eql(m)
    //... chai.expect(s.snap).false
    //>>>
  },
  properties: {
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
    },
    /**
     * Human readable description.
     * @return {String}
     */
    description: {
      get () {
        return `${this.eyo.name}(w: ${this.w}, h: ${this.h}, width: ${this.width}, height: ${this.height})`
      },
    }
  },
  aliases: {
    c: ['dc', 'w'],
    l: ['dl', 'h'],
    x: ['dx', 'width'],
    y: ['dy', 'height'],
  },
})
eYo.geom.Size.eyo.finalizeC9r()

/**
 * Like `advance` but sets the coordinates, instead of advancing them.
 * @param {Number | eYo.geom.Point | Event | Object} w
 * @param {Number} [h]
 * @return {eYo.geom.Point} The receiver
 */
eYo.geom.Size_p.set = function (w = 0, h) {
  //<<< mochai: Size: set
  //... var s, m, mm
  if (eYo.isDef(w.w) && eYo.isDef(w.h)) {
    this.w_ = w.w
    this.h_ = w.h
    //... s = new eYo.geom.Size()
    //... m = {w: 3, h: 4}
    //... s.set(m)
    //... chai.expect(s).eql(m)
    //... chai.expect(() => s.set(m, null)).not.throw()
    //... chai.expect(() => s.set(m, 1)).throw()
  } else if (eYo.isDef(w.width) && eYo.isDef(w.height)) {
    this.width_ = w.width
    this.height_ = w.height
    //... s = new eYo.geom.Size()
    //... mm = {width: m.w * eYo.geom.X, height: m.h * eYo.geom.Y}
    //... s.set(mm)
    //... chai.expect(s).almost.eql(m)
    //... chai.expect(() => s.set(mm, null)).not.throw()
    //... chai.expect(() => s.set(mm, 1)).throw()
  } else if (eYo.isDef(w.x) && eYo.isDef(w.y)) {
    this.width_ = w.x
    this.height_ = w.y
    //... s = new eYo.geom.Size()
    //... mm = {x: m.w * eYo.geom.X, y: m.h *  eYo.geom.Y}
    //... s.set(mm)
    //... chai.expect(s).almost.eql(m)
    //... chai.expect(() => s.set(mm, null)).not.throw()
    //... chai.expect(() => s.set(mm, 1)).throw()
  } else if (eYo.isDef(w.clientX) && eYo.isDef(w.clientY)) {
    this.width_ = w.clientX
    this.height_ = w.clientY
    //... s = new eYo.geom.Size()
    //... mm = {clientX: m.w * eYo.geom.X, clientY: m.h *  eYo.geom.Y}
    //... s.set(mm)
    //... chai.expect(s).almost.eql(m)
    //... chai.expect(() => s.set(mm, null)).not.throw()
    //... chai.expect(() => s.set(mm, 1)).throw()
  } else {
    eYo.isaP6y(w)
    ? this.eyo.p6yReplace(this, 'w', w)
    : (this.w_ = w || 0)
    eYo.isaP6y(h)
    ? this.eyo.p6yReplace(this, 'h', h)
    : (this.h_ = h || 0)
    return this
    //... let p_w = eYo.p6y.new('w', onr)
    //... let p_h = eYo.p6y.new('h', onr)
    //... s = new eYo.geom.Size()
    //... p_w.value_ = m.w; p_h.value_ = m.h
    //... s.set(p_w, m.h)
    //... chai.expect(s).eql(m)
    //... chai.expect(p_w.value_ = 9).equal(s.w)
    //... chai.expect(s.w_ = m.w).equal(p_w.value)
    //... s = new eYo.geom.Size()
    //... p_w.value_ = m.w; p_h.value_ = m.h
    //... s.set(m.w, p_h)
    //... chai.expect(s).eql(m)
    //... chai.expect(p_h.value_ = 9).equal(s.h)
    //... chai.expect(s.h_ = m.h).equal(p_h.value)
    //... s = new eYo.geom.Size()
    //... p_w.value_ = m.w; p_h.value_ = m.h
    //... s.set(p_w, p_h)
    //... chai.expect(s).eql(m)
    //... chai.expect(s).eql({w: (p_w.value_ = m.h), h: (p_h.value_ = m.w)})
    //... chai.expect(s).eql({w: (p_w.value_ = m.w), h: (p_h.value_ = m.h)})
  }
  eYo.isDef(h) && eYo.throw(`${this.eyo.name}/set: Unexpected argument 'l' ${h}`)
  return this
  //>>>
}
//>>>

/**
 * Convenient creator in text units.
 * @param {Boolean} [snap] - snap flag. Defaults to false.
 * @param {Number} [c] - c coordinate. Defaults to 0.
 * @param {Number} [l] - l coordinate. Defaults to 0.
 * @return {eYo.geom.Point} The receiver
 */
eYo.geom.clSize = function (snap, c, l) {
  return new eYo.geom.Size(snap, c, l)
}

/**
 * Sets from the given text.
 * @param {String!} s
 * @return {eYo.geom.Size} the receiver.
 */
eYo.geom.AbstractPoint_p.setFromText = function (txt) {
  if (!eYo.isDef(txt)) {
    console.error('BREAK HERE!')
  }
  var lines = txt.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/)
  var c = 0
  lines.forEach(l => (c < l.length) && (c = l.length) )
  this.set(c, lines.length)
  return this
}

/**
 * Sets from the given text.
 * @param {String!} s
 */
eYo.geom._p.newSizeFromText = function (txt) {
  return new eYo.geom.Size().setFromText(txt)
}

/**
 * @name{eYo.geom.Rect}
 * `Rect` stores its coordinates in text units.
 * Class for representing rectangular regions.
 * @param {number} c Left, in text units.
 * @param {number} l Top, in text units.
 * @param {number} w Width, in text units.
 * @param {number} h Height, in text units.
 * @struct
 * @constructor
 */
//<<< mochai:Rect
eYo.geom.makeC9r('AbstractRect', {
  properties: {
    origin: {
      value () {
        return new eYo.geom.Point()
      },
      copy: true,
      set (stored, after) {
        stored.xySet(after)
      }
    },
    //<<< mochai: Rect origin
    //... var r = eYo.geom.randRect(false)
    //... let p = eYo.geom.randPoint(false)
    //... chai.expect(r.origin).not.equal(p)
    //... r.origin_ = p
    //... chai.expect(r.origin).not.equal(p)
    //... chai.expect(r.origin).almost.eql(p)
    //... var r = eYo.geom.randRect(false)
    //... let p6y = eYo.p6y.new({
    //...   value: p,
    //... }, 'p6y', onr)
    //... r.origin_ = p6y
    //... chai.expect(r.origin).not.equal(p6y)
    //... chai.expect(r.origin_p.__target).equal(p6y)
    //... chai.expect(r.origin).almost.eql(p)
    //... var m = {c: p.c/2, l: p.l/2}
    //... r.origin_.set(m)
    //... chai.expect(p).almost.eql(m)
    //>>>
    size: {
      value () {
        return new eYo.geom.Size()
      },
      copy: true,
      set (stored, after) {
        if (eYo.isaP6y(after)) {
          this.eyo.p6yReplace(this, 'size', after)
        } else {
          stored.xySet(after)
        }
      }
    },
    //<<< mochai: Rect size
    //... var r = eYo.geom.randRect(false)
    //... let s = eYo.geom.randSize(false)
    //... chai.expect(r.size).not.equal(s)
    //... r.size_ = s
    //... chai.expect(r.size).not.equal(s)
    //... chai.expect(r.size).almost.eql(s)
    //... var r = eYo.geom.randRect(false)
    //... let p6y = eYo.p6y.new({
    //...   value: s,
    //... }, 'p6y', onr)
    //... r.size_ = p6y
    //... chai.expect(r.size).not.equal(p6y)
    //... chai.expect(r.size_p.__target).equal(p6y)
    //... chai.expect(r.size).almost.eql(s)
    //... var m = {w: s.w/2, h: s.h/2}
    //... r.size_.set(m)
    //... chai.expect(s).almost.eql(m)
    //>>>
  },
  methods: {
    makeSnapShared () {
      this.origin_.shareSnap(this.snap_p)
      this.size_.shareSnap(this.snap_p)
    }
  }
})

// text coordinates
eYo.geom.AbstractRect.eyo.modelMerge({
  //<<< mochai: text coordinates
  aliases: {
    //<<< mochai: aliases
    //... var m = {c: 1, l: 2, w: 3, h: 4}
    //... var r = new eYo.geom.Rect(false, m)
    origin: 'topLeft',
    //... chai.expect(r.topLeft).almost.eql(r.origin)
    //... var p = r.origin.copy.forward(1, 1)
    //... r.origin_ = p
    //... chai.expect(r.topLeft).almost.eql(r.origin).eql(p)
    //... var p = r.topLeft.copy.forward(-1, -1)
    //... r.topLeft_ = p
    //... chai.expect(r.topLeft).almost.eql(r.origin).eql(p)
    // Basic properties in text dimensions.
    // When in text dimensions, and snap to grid mode,
    // setters round their arguments to half width and quarter height.
    // Except for left, right, top and bottom,
    // the position setters won't change the size.
    'origin.c': ['c', 'c_min'],
    //... chai.expect(r.origin.c).equal(r.c).equal(r.c_min)
    //... r.c_ += 1
    //... chai.expect(r.origin.c).equal(r.c).equal(r.c_min)
    //... r.c_min_ -= 1
    //... chai.expect(r.origin.c).equal(r.c).equal(r.c_min)
    //... r.origin_.c_ += 1
    //... chai.expect(r.origin.c).equal(r.c).equal(r.c_min)
    'origin.l': ['l', 'l_min'],
    //... chai.expect(r.origin.l).equal(r.l).equal(r.l_min)
    //... r.l_ += 1
    //... chai.expect(r.origin.l).equal(r.l).equal(r.l_min)
    //... r.l_min_ -= 1
    //... chai.expect(r.origin.l).equal(r.l).equal(r.l_min)
    //... r.origin_.l_ += 1
    //... chai.expect(r.origin.l).equal(r.l).equal(r.l_min)
    'size.w': 'w',
    //... chai.expect(r.size.w).equal(r.w)
    //... r.w_ += 1
    //... chai.expect(r.size.w).equal(r.w)
    //... r.size_.w_ -= 1
    //... chai.expect(r.size.w).equal(r.w)
    'size.h': 'h',
    //... chai.expect(r.size.h).equal(r.h)
    //... r.h_ += 1
    //... chai.expect(r.size.h).equal(r.h)
    //... r.size_.h_ -= 1
    //... chai.expect(r.size.h).equal(r.h)
    //>>>
  },
  properties: {
    //<<< mochai: Rect properties
    /**
     * Translation: the size does not change.
     */
    c_mid: {
      after: ['c', 'w'],
      get () {
        return this.c + this.w / 2
      },
      /**
       * @param {Number} after 
       */
      set (after) {
        this.c_ = after - this.w / 2
      }
      //<<< mochai: Rect c_mid
      //... var m = {c: 1, l: 2, w: 3, h: 4}
      //... var r = new eYo.geom.Rect(false, m)
      //... chai.expect(r).almost.eql(m)
      //... chai.expect(r.c_mid).almost.equal(2.5)
      //... r.c_mid_ += 5
      //... chai.expect(r).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
      //>>>
    },
    c_max: {
      after: ['c', 'w'],
      get () {
        return this.c + this.w
      },
      set (after) {
        this.c_ = after - this.w
      }
      //<<< mochai: Rect c_max
      //... var m = {c: 1, l: 2, w: 3, h: 4}
      //... var r = new eYo.geom.Rect(false, m)
      //... chai.expect(r).almost.eql(m)
      //... chai.expect(r.c_max).almost.equal(4)
      //... r.c_max_ += 5
      //... chai.expect(r).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
      //>>>
    },
    l_mid: {
      after: ['l', 'h'],
      get () {
        return this.l + this.h / 2
      },
      set (after) {
        this.l_ = after - this.h / 2
      }
      //<<< mochai: Rect l_mid
      //... var m = {c: 1, l: 2, w: 3, h: 4}
      //... var r = new eYo.geom.Rect(false, m)
      //... chai.expect(r).almost.eql(m)
      //... chai.expect(r.l_mid).almost.equal(4)
      //... r.l_mid_ += 5
      //... chai.expect(r).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
      //>>>
    },
    l_max: {
      after: ['l', 'h'],
      get () {
        return this.l + this.h
      },
      set (after) {
        this.l_ = after - this.h
      }
      //<<< mochai: Rect l_max
      //... var m = {c: 1, l: 2, w: 3, h: 4}
      //... var r = new eYo.geom.Rect(false, m)
      //... chai.expect(r).almost.eql(m)
      //... chai.expect(r.l_max).almost.equal(6)
      //... r.l_max_ += 5
      //... chai.expect(r).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
      //>>>
    },
    //>>>
  },
  //>>>
})

eYo.geom.AbstractRect.eyo.modelMerge({
  //<<< mochai: board coordinates
  aliases: {
    //<<< mochai: aliases
    //... var m = {c: 1, l: 2, w: 3, h: 4}
    //... var r = new eYo.geom.Rect(false, m)
    // basic properties in board dimensions
    'origin.x': ['x', 'x_min'],
      //<<< mochai: Rect x, x_min
      //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
      //... r.x_ += eYo.geom.X
      //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
      //... r.x_min_ -= eYo.geom.X
      //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
      //... r.origin_.x_ += eYo.geom.X
      //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
      // Convenient setters in board coordinates
      //... chai.expect(r).almost.eql(m)
      //... chai.expect(r.x).almost.equal(m.c * eYo.geom.X)
      //... r.x_ += 5 * eYo.geom.X
      //... m.c += 5
      //... chai.expect(r).almost.eql(m)
      //>>>
    'origin.y': ['y', 'y_min'],
      //<<< mochai: Rect y, y_min
      //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
      //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
      //... r.y_min_ -= eYo.geom.Y
      //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
      //... r.origin_.y_ += eYo.geom.Y
      //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
      //... r.y_ += 4 * eYo.geom.Y
      //... m.l += 4
      //... chai.expect(r).almost.eql(m)
      //>>>
    'size.width': 'width',
      //<<< mochai: Rect width
      //... chai.expect(r.size.width).almost.equal(r.width)
      //... r.width_ += 3 * eYo.geom.X
      //... m.w += 3
      //... chai.expect(r.size.width).almost.equal(r.width)
      //... r.size_.width_ -= eYo.geom.X
      //... chai.expect(r.size.width).almost.equal(r.width)
      //... chai.expect(r).almost.eql(m)
      //>>>
    'size.height': 'height',
      //<<< mochai: Rect height
      //... chai.expect(r.size.height).almost.equal(r.height)
      //... r.height_ += 2 * eYo.geom.Y
      //... m.h += 2
      //... chai.expect(r.size.height).almost.equal(r.height)
      //... r.size_.height -= eYo.geom.Y
      //... chai.expect(r.size.height).almost.equal(r.height)
      //... chai.expect(r).almost.eql(m)
      //>>>
    //>>>
  },
  properties: {
    //<<< mochai: Rect properties
    x_mid: {
      after: ['x', 'width'],
      get () {
        return this.x + this.width / 2
      },
      set (after) {
        this.x_ = after - this.width / 2
      }
      //<<< mochai: Rect x_mid
      //... var m = {c: 1, l: 2, w: 3, h: 4}
      //... var mm = {x: m.c * eYo.geom.X, y: m.l * eYo.geom.Y, width: m.w * eYo.geom.X, height: m.h * eYo.geom.Y}
      //... var r = new eYo.geom.Rect(false, mm)
      //... chai.expect(r).almost.eql(m)
      //... chai.expect(r.x_mid).almost.equal(2.5 * eYo.geom.X)
      //... r.x_mid_ += 5 * eYo.geom.X
      //... chai.expect(r).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
      //>>>
    },
    x_max: {
      after: ['x', 'width'],
      get () {
        return this.x + this.width
      },
      set (after) {
        this.x_ = after - this.width
      }
      //<<< mochai: Rect x_max
      //... var m = {c: 1, l: 2, w: 3, h: 4}
      //... var mm = {x: 1 * eYo.geom.X, y: 2 * eYo.geom.Y, width: 3 * eYo.geom.X, height: 4 * eYo.geom.Y}
      //... var r = new eYo.geom.Rect(false, mm)
      //... chai.expect(r).almost.eql(m)
      //... chai.expect(r.x_max).almost.equal(4 * eYo.geom.X)
      //... r.x_max_ += 5 * eYo.geom.X
      //... chai.expect(r).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
      //>>>
    },
    y_mid: {
      after: ['y', 'height'],
      get () {
        return this.y + this.height / 2
      },
      set (after) {
        this.y_ = after - this.height / 2
      }
      //<<< mochai: Rect y_mid
      //... var m = {c: 1, l: 2, w: 3, h: 4}
      //... var mm = {x: 1 * eYo.geom.X, y: 2 * eYo.geom.Y, width: 3 * eYo.geom.X, height: 4 * eYo.geom.Y}
      //... var r = new eYo.geom.Rect(false, mm)
      //... chai.expect(r).almost.eql(m)
      //... chai.expect(r.y_mid).almost.equal(4 * eYo.geom.Y)
      //... r.y_mid_ += 5 * eYo.geom.Y
      //... chai.expect(r).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
      //>>>
    },
    y_max: {
      after: ['y', 'height'],
      get () {
        return this.y + this.height
      },
      set (after) {
        this.y_ = after - this.height
      }
      //<<< mochai: Rect y_max
      //... var m = {c: 1, l: 2, w: 3, h: 4}
      //... var mm = {x: 1 * eYo.geom.X, y: 2 * eYo.geom.Y, width: 3 * eYo.geom.X, height: 4 * eYo.geom.Y}
      //... var r = new eYo.geom.Rect(false, mm)
      //... chai.expect(r).almost.eql(m)
      //... chai.expect(r.y_max).almost.equal(6 * eYo.geom.Y)
      //... r.y_max_ += 5 * eYo.geom.Y
      //... chai.expect(r).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
      //>>>
      //// The setters change the width, but does not change the `right`
    },
    left: {
      after: ['x', 'width', 'x_min', 'x_max'],
      get () {
        return this.x
      },
      set (after) {
        this.width_ = this.x_max - after
        this.x_min_ = after
      }
    },
    top: {
      after: ['y', 'height', 'y_min', 'y_max'],
      get () {
        return this.y
      },
      /**
       * The height does not change.
       * @param {Number} after 
       */
      set (after) {
        this.height_ = this.y_max - after
        this.y_min_ = after
      }
    },
    right: {
      after: ['left', 'width', 'x_max'],
      get () {
        return this.x_max
      },
      /**
       * Change the width, not the `left`.
       * No negative width.
       */
      set (after) {
        this.width_ = Math.max(0, after - this.left)
      }
    },
    bottom: {
      after: ['top', 'height', 'y_max'],
      get () {
        return this.y_max
      },
      /**
       * Change the height, not the `top`.
       * No negative height.
       */
      set (after) {
        this.height_ = Math.max(0, after - this.top)
      }
    },
    // Composed
    bottomRight: {
      after: ['x_max', 'y_max'],
      get () {
        return this.origin.forward(this.size_)
      },
      set (after) {
        this.x_max_ = after.x
        this.y_max_ = after.y
      }
    },
    center: {
      after: ['origin', 'size'],
      get () {
        return this.origin.forward(this.size.unscale(2))
      },
      /**
       * Change the origin but keeps the size.
       */
      set (after) {
        this.origin_ = after.copy.backward(this.size.unscale(2))
      }
    },
    /**
     * clone the receiver.
     * @type {eYo.geom.Rect}
     */
    copy: {
      get () {
        return new eYo.geom.Rect(this)
      },
    },
    /**
     * String representation of the receiver.
     * @return {String} a string
     */
    description: {
      get () {
        return `${this.eyo.name}(c: ${this.c}, l: ${this.l}, w: ${this.w}, h: ${this.h})`
      },
    },
    /**
     * String representation of the receiver.
     * @return {String} a string
     */
    xyDescription: {
      get () {
        return `${this.eyo.name}(x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height})`
      },
    },
    /**
     * Width of the draft part of the board.
     * @return {number} non negative number
     */
    draft: {
      get () {
        return Math.max(0, -this.x)
      },
    },
    /**
     * Width of the main part of the board.
     * `0` when in flyout.
     * @return {number} non negative number
     */
    main: {
      get () {
        return Math.min(this.width, this.width + this.x)
      },
    },
    //>>>
  },
  //>>>
})

// eYo.geom.AbstractRect.eyo.modelMerge({
//   aliases: {
//     //<<< mochai: aliases
//     //... var m = {c: 1, l: 2, w: 3, h: 4}
//     //... var r = new eYo.geom.Rect(false, m)
//     // basic properties in board dimensions
//     'origin.x': ['x', 'x_min'],
//     //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
//     //... r.x_ += eYo.geom.X
//     //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
//     //... r.x_min_ -= eYo.geom.X
//     //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
//     //... r.origin_.x_ += eYo.geom.X
//     //... chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
//     'origin.y': ['y', 'y_min'],
//     //... chai.expect(r.origin.y).almost.almost.equal(r.y).almost.equal(r.y_min)
//     //... r.y_ += eYo.geom.X
//     //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
//     //... r.y_min_ -= eYo.geom.Y
//     //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
//     //... r.origin_.y_ += eYo.geom.Y
//     //... chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
//     'size.width': 'width',
//     //... chai.expect(r.size.width).almost.equal(r.width)
//     //... r.width_ += eYo.geom.X
//     //... chai.expect(r.size.width).almost.equal(r.width)
//     //... r.size_.width_ -= eYo.geom.X
//     //... chai.expect(r.size.width).almost.equal(r.width)
//     'size.height': 'height',
//     //... chai.expect(r.size.height).almost.equal(r.height)
//     //... r.height += eYo.geom.Y
//     //... chai.expect(r.size.height).almost.equal(r.height)
//     //... r.size_.height -= eYo.geom.Y
//     //... chai.expect(r.size.height).almost.equal(r.height)
//     //>>>
//   },
//   properties: {
//     /**
//      * Translation: the size size does not change.
//      */
//     c_mid: {
//       after: ['c', 'w'],
//       get () {
//         return this.c + this.w / 2
//       },
//       /**
//        * @param {Number} after 
//        */
//       set (after) {
//         this.c_ = after - this.w / 2
//       }
//     },
//     //<<< mochai: Rect c_mid
//     //... var m = {c: 1, l: 2, w: 3, h: 4}
//     //... var r = new eYo.geom.Rect(false, m)
//     //... chai.expect(r).almost.eql(m)
//     //... chai.expect(r.c_mid).almost.equal(2.5)
//     //... r.c_mid_ += 5
//     //... chai.expect(r).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
//     //>>>
//     c_max: {
//       after: ['c', 'w'],
//       get () {
//         return this.c + this.w
//       },
//       set (after) {
//         this.c_ = after - this.w
//       }
//     },
//     //<<< mochai: Rect c_max
//     //... var m = {c: 1, l: 2, w: 3, h: 4}
//     //... var r = new eYo.geom.Rect(false, m)
//     //... chai.expect(r).almost.eql(m)
//     //... chai.expect(r.c_max).almost.equal(4)
//     //... r.c_max_ += 5
//     //... chai.expect(r).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
//     //>>>
//     l_mid: {
//       after: ['l', 'h'],
//       get () {
//         return this.l + this.h / 2
//       },
//       set (after) {
//         this.l_ = after - this.h / 2
//       }
//     },
//     //<<< mochai: Rect l_mid
//     //... var m = {c: 1, l: 2, w: 3, h: 4}
//     //... var r = new eYo.geom.Rect(false, m)
//     //... chai.expect(r).almost.eql(m)
//     //... chai.expect(r.l_mid).almost.equal(4)
//     //... r.l_mid_ += 5
//     //... chai.expect(r).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
//     //>>>
//     l_max: {
//       after: ['l', 'h'],
//       get () {
//         return this.l + this.h
//       },
//       set (after) {
//         this.l_ = after - this.h
//       }
//     },
//     //<<< mochai: Rect l_max
//     //... var m = {c: 1, l: 2, w: 3, h: 4}
//     //... var r = new eYo.geom.Rect(false, m)
//     //... chai.expect(r).almost.eql(m)
//     //... chai.expect(r.l_max).almost.equal(6)
//     //... r.l_max_ += 5
//     //... chai.expect(r).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
//     //>>>
//     // Convenient setters in board coordinates
//     //<<< mochai: Rect x
//     //... var m = {c: 1, l: 2, w: 3, h: 4}
//     //... var r = new eYo.geom.Rect(false, m)
//     //... chai.expect(r).almost.eql(m)
//     //... chai.expect(r.x).almost.equal(m.c * eYo.geom.X)
//     //... r.x_ += 5 * eYo.geom.X
//     //... chai.expect(r).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
//     //>>>
//     x_mid: {
//       after: ['x', 'width'],
//       get () {
//         return this.x + this.width / 2
//       },
//       set (after) {
//         this.x_ = after - this.width / 2
//       }
//     },
//     //<<< mochai: Rect x_mid
//     //... var m = {c: 1, l: 2, w: 3, h: 4}
//     //... var mm = {x: m.c * eYo.geom.X, y: m.l * eYo.geom.Y, width: m.w * eYo.geom.X, height: m.h * eYo.geom.Y}
//     //... var r = new eYo.geom.Rect(false, mm)
//     //... chai.expect(r).almost.eql(m)
//     //... chai.expect(r.x_mid).almost.equal(2.5 * eYo.geom.X)
//     //... r.x_mid_ += 5 * eYo.geom.X
//     //... chai.expect(r).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
//     //>>>
//     x_max: {
//       after: ['x', 'width'],
//       get () {
//         return this.x + this.width
//       },
//       set (after) {
//         this.x_ = after - this.width
//       }
//     },
//     //<<< mochai: Rect x_max
//     //... var m = {c: 1, l: 2, w: 3, h: 4}
//     //... var mm = {x: 1 * eYo.geom.X, y: 2 * eYo.geom.Y, width: 3 * eYo.geom.X, height: 4 * eYo.geom.Y}
//     //... var r = new eYo.geom.Rect(false, mm)
//     //... chai.expect(r).almost.eql(m)
//     //... chai.expect(r.x_max).almost.equal(4 * eYo.geom.X)
//     //... r.x_max_ += 5 * eYo.geom.X
//     //... chai.expect(r).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
//     //>>>
//     y_mid: {
//       after: ['y', 'height'],
//       get () {
//         return this.y + this.height / 2
//       },
//       set (after) {
//         this.y_ = after - this.height / 2
//       }
//     },
//     //<<< mochai: Rect y_mid
//     //... var m = {c: 1, l: 2, w: 3, h: 4}
//     //... var mm = {x: 1 * eYo.geom.X, y: 2 * eYo.geom.Y, width: 3 * eYo.geom.X, height: 4 * eYo.geom.Y}
//     //... var r = new eYo.geom.Rect(false, mm)
//     //... chai.expect(r).almost.eql(m)
//     //... chai.expect(r.y_mid).almost.equal(4 * eYo.geom.Y)
//     //... r.y_mid_ += 5 * eYo.geom.Y
//     //... chai.expect(r).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
//     //>>>
//     y_max: {
//       after: ['y', 'height'],
//       get () {
//         return this.y + this.height
//       },
//       set (after) {
//         this.y_ = after - this.height
//       }
//     },
//     //<<< mochai: Rect y_max
//     //... var m = {c: 1, l: 2, w: 3, h: 4}
//     //... var mm = {x: 1 * eYo.geom.X, y: 2 * eYo.geom.Y, width: 3 * eYo.geom.X, height: 4 * eYo.geom.Y}
//     //... var r = new eYo.geom.Rect(false, mm)
//     //... chai.expect(r).almost.eql(m)
//     //... chai.expect(r.y_max).almost.equal(6 * eYo.geom.Y)
//     //... r.y_max_ += 5 * eYo.geom.Y
//     //... chai.expect(r).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
//     //>>>
//     //// The setters change the width, but does not change the `right`
//     left: {
//       after: ['x', 'width', 'x_min', 'x_max'],
//       get () {
//         return this.x
//       },
//       set (after) {
//         this.width_ = this.x_max - after
//         this.x_min_ = after
//       }
//     },
//     top: {
//       after: ['y', 'height', 'y_min', 'y_max'],
//       get () {
//         return this.y
//       },
//       /**
//        * The height does not change.
//        * @param {Number} after 
//        */
//       set (after) {
//         this.height_ = this.y_max - after
//         this.y_min_ = after
//       }
//     },
//     right: {
//       after: ['left', 'width', 'x_max'],
//       get () {
//         return this.x_max
//       },
//       /**
//        * Change the width, not the `left`.
//        * No negative width.
//        */
//       set (after) {
//         this.width_ = Math.max(0, after - this.left)
//       }
//     },
//     bottom: {
//       after: ['top', 'height', 'y_max'],
//       get () {
//         return this.y_max
//       },
//       /**
//        * Change the height, not the `top`.
//        * No negative height.
//        */
//       set (after) {
//         this.height_ = Math.max(0, after - this.top)
//       }
//     },
//     // Composed
//     bottomRight: {
//       after: ['x_max', 'y_max'],
//       get () {
//         return this.origin.forward(this.size_)
//       },
//       set (after) {
//         this.x_max_ = after.x
//         this.y_max_ = after.y
//       }
//     },
//     center: {
//       after: ['origin', 'size'],
//       get () {
//         return this.origin.forward(this.size.unscale(2))
//       },
//       /**
//        * Change the origin but keeps the size.
//        */
//       set (after) {
//         this.origin_ = after.copy.backward(this.size.unscale(2))
//       }
//     },
//     /**
//      * clone the receiver.
//      * @type {eYo.geom.Rect}
//      */
//     copy: {
//       get () {
//         return new eYo.geom.Rect(this)
//       },
//     },
//     /**
//      * String representation of the receiver.
//      * @return {String} a string
//      */
//     description: {
//       get () {
//         return `${this.eyo.name}(c: ${this.c}, l: ${this.l}, w: ${this.w}, h: ${this.h})`
//       },
//     },
//     /**
//      * String representation of the receiver.
//      * @return {String} a string
//      */
//     xyDescription: {
//       get () {
//         return `${this.eyo.name}(x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height})`
//       },
//     },
//     /**
//      * Width of the draft part of the board.
//      * @return {number} non negative number
//      */
//     draft: {
//       get () {
//         return Math.max(0, -this.x)
//       },
//     },
//     /**
//      * Width of the main part of the board.
//      * `0` when in flyout.
//      * @return {number} non negative number
//      */
//     main: {
//       get () {
//         return Math.min(this.width, this.width + this.x)
//       },
//     },
//   },
// })

eYo.geom.AbstractRect.eyo.finalizeC9r()

//<<< mochai: Rect methods

/**
 * set the `Rect`.
 * This is a very very permissive setter.
 * @param{?Number|eYo.geom.Point|Element} c
 * @param{?Number|eYo.geom.Size} l
 * @param{?Number|eYo.geom.Size} w
 * @param{?Number} h
 * @return {eYo.geom.Rect} The receiver
 */
eYo.geom.AbstractRect_p.set = function (c = 0, l, w, h) {
  //<<< mochai: Rect: set
  //... var r, mm
  //... var m = {c: 1, l: 2, w: 3, h: 4}
  if (eYo.isDef(c.left) && eYo.isDef(c.right) && eYo.isDef(c.top) && eYo.isDef(c.bottom)) {
    eYo.isDef(l) && eYo.throw(`${this.eyo.name}.set: Unexpected argument ${l}`)
    // properties are evaluated twice
    this.left_ = c.left
    this.right_ = c.right
    this.top_ = c.top
    this.bottom_ = c.bottom
    return this
    //... r = new eYo.geom.Rect()
    //... mm = {left: m.c * eYo.geom.X, top: m.l * eYo.geom.Y, right: (m.c + m.w) * eYo.geom.X, bottom: (m.l + m.h) * eYo.geom.X};
    //... r.set(mm)
    //... chai.expect(r).almost.eql(m)
    //... chai.expect(() => r.set(mm, null)).not.throw()
    //... chai.expect(() => r.set(mm, 1)).throw()
  } else if (eYo.isDef(c.x) && eYo.isDef(c.y) && eYo.isDef(c.width) && eYo.isDef(c.height)) {
    eYo.isDef(l) && eYo.throw(`${this.eyo.name}.set: Unexpected argument ${l}`)
    // properties are evaluated twice
    this.x_ = c.x
    this.y_ = c.y
    this.width_ = c.width
    this.height_ = c.height
    return this
    //... r = new eYo.geom.Rect()
    //... mm = {x: m.c * eYo.geom.X, y: m.l * eYo.geom.Y, width: m.w * eYo.geom.X, height: m.h * eYo.geom.Y};
    //... r.set(mm)
    //... chai.expect(r).almost.eql(m)
    //... chai.expect(() => r.set(mm, null)).not.throw()
    //... chai.expect(() => r.set(mm, 1)).throw()
  } else if (eYo.isDef(c.c) && eYo.isDef(c.l)) {
    if (eYo.isDef(c.w) && eYo.isDef(c.h)) { // Rect like object
      eYo.isDef(l) && eYo.throw(`${this.eyo.name}.set: Unexpected argument ${l}`)
      this.c_ = c.c
      this.l_ = c.l
      this.w_ = c.w
      this.h_ = c.h
      return this
      //... r = new eYo.geom.Rect()
      //... m = {c: 1, l: 2, w: 3, h: 4}
      //... r.set(m)
      //... chai.expect(r).eql(m)
      //... chai.expect(() => r.set(m, null)).not.throw()
      //... chai.expect(() => r.set(m, 1)).throw()
  }
    eYo.isaP6y(c)
    ? this.eyo.p6yReplace(this, 'origin', c)
    : (this.origin_ = c)
    eYo.isDef(h) && eYo.throw(`${this.eyo.name}.set: Unexpected last argument ${h}`)
    ;[w, h] = [l, w]
  } else {
    eYo.isaP6y(c)
    ? this.origin_.eyo.p6yReplace(this, 'c', c)
    : (this.c_ = c || 0)
    eYo.isaP6y(l)
    ? this.origin_.eyo.p6yReplace(this, 'l', l)
    : (this.l_ = l || 0)
  }
  if (eYo.isDef(w)) {
    if (eYo.isDef(w.w) && eYo.isDef(w.h)) {
      eYo.isDef(h) && eYo.throw(`${this.eyo.name}.set: Unexpected (last?) argument ${h}`)
      eYo.isaP6y(w)
      ? this.eyo.p6yReplace(this, 'size', w)
      : (this.size_ = w)
    } else if (eYo.isDef(w.x) && eYo.isDef(w.y)) {
      eYo.isDef(h) && eYo.throw(`${this.eyo.name}.set: Unexpected (last?) argument ${h}`)
      this.size_ = w
    } else if (eYo.isDef(w.width) && eYo.isDef(w.height)) {
      eYo.isDef(h) && eYo.throw(`${this.eyo.name}.set: Unexpected (last?) argument ${h}`)
      this.size_ = w
    } else {
      eYo.isaP6y(w)
      ? this.size_.eyo.p6yReplace(this, 'w', w)
      : (this.w_ = w)
      eYo.isaP6y(h)
      ? this.size_.eyo.p6yReplace(this, 'w', w)
      : (this.h_ = h || 0)
    }
  } else {
    eYo.isDef(h) && eYo.throw(`${this.eyo.name}.set: Unexpected last argument ${h}`)
    this.w_ = this.h_ = 0
  }
  return this
  //... r.set(1, 2, 3, 4); chai.expect(r).eql(m)
  //... let p_c = eYo.p6y.new('c', onr)
  //... let p_l = eYo.p6y.new('l', onr)
  //... let p_w = eYo.p6y.new('w', onr)
  //... let p_h = eYo.p6y.new('h', onr)
  //... m = {c: 1, l: 2, w: 3, h: 4}
  //... r.set(m.c, m.l, m.h, m.w); chai.expect(r).eql(m)
  //... p_c.value_ = m.c; p_l.value_ = m.l
  //... p_w.value_ = m.w; p_h.value_ = m.h
  //... r = new eYo.geom.Rect(p_c, m.l, m.w, m.h); chai.expect(r).eql(m)
  //... chai.expect(r.c_ = 5).eql(p_c.value)
  //... chai.expect(p_c.value_ = m.c).eql(r.c)
  //... r = new eYo.geom.Rect(p_c, m.l, m.w, m.h); chai.expect(r).eql(m)
  //... chai.expect(r.c_ = 5).eql(p_c.value)
  //... chai.expect(p_c.value_ = m.c).eql(r.c)
  //... r = new eYo.geom.Rect(m.c, p_l, m.w, m.h); chai.expect(r).eql(m)
  //... chai.expect(r.l_ = 5).eql(p_l.value)
  //... chai.expect(p_l.value_ = m.l).eql(r.l)
  //... r = new eYo.geom.Rect(m.c, m.l, p_w, m.h); chai.expect(r).eql(m)
  //... chai.expect(r.w_ = 5).eql(p_w.value)
  //... chai.expect(p_w.value_ = m.w).eql(r.w)
  //... r = new eYo.geom.Rect(m.c, m.l, m.w, p_h); chai.expect(r).eql(m)
  //... chai.expect(r.h_ = 5).eql(p_h.value)
  //... chai.expect(p_h.value_ = m.h).eql(r.h)
  //... r = new eYo.geom.Rect(m.c, m.l, p_w, m.h); chai.expect(r).eql(m)
  //... chai.expect(r.w_ = 5).eql(p_w.value)
  //... let p = new eYo.geom.Point(m)
  //... let s = new eYo.geom.Size(m)

  //>>>
}

/**
 * Setter.
 * @param {Number} x  x coordinate
 * @param {Number} y  y coordinate
 * @param {Number} width  x coordinate
 * @param {Number} height  y coordinate
 * @return {eYo.geom.Rect} The receiver
 */
eYo.geom.AbstractRect_p.xySet = function (x = 0, y = 0, width = 0, height = 0) {
  if (eYo.isNA(x.x) || eYo.isNA(x.y)) {
    this.origin_.xySet(x, y)
    this.size_.xySet(width, height)
  } else {
    this.origin_.set(x)
    this.size_.xySet(y, width)
  }
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.geom.Point | eYo.geom.Size} c
 * @param {number} l
 * @return {eYo.geom.Rect}
 */
eYo.geom.AbstractRect_p.forward = function (c = 0, l = 0) {
  this.origin_.forward(c, l)
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.geom.Point | eYo.geom.Size} c
 * @param {number} l
 * @return {eYo.geom.Rect}
 */
eYo.geom.AbstractRect_p.backward = function (c = 0, l = 0) {
  this.origin_.backward(c, l)
  return this
}


/**
 * Test equality between the receiver and the rhs.
 * Takes rounding errors into account.
 * @param {eYo.geom.Rect} rhs
 */
eYo.geom.AbstractRect_p.eql = function (rhs, tolerance = eYo.EPSILON) {
  return rhs instanceof eYo.geom.Rect && this.origin_.eql(rhs.origin_, tolerance) && this.size_.eql(rhs.size_, tolerance)
}

/**
 * Scale the receiver.
 * @param {Number | Object} scaleX  Must be positive.
 * @param {Number} [scaleY]  Must be positive when defines, defaults to scaleX.
 * @return {!eYo.geom.Rect} the receiver
 */
eYo.geom.AbstractRect_p.scale = function (scaleX, scaleY) {
  this.origin_.scale(scaleX, scaleY)
  this.size_.scale(scaleX, scaleY)
  return this
}

/**
 * Unscale the receiver.
 * @param {Number} scaleX  Must be positive.
 * @param {Number} [scaleY]  Must be positive when defines, defaults to scaleX.
 * @return {!eYo.geom.Rect} the receiver
 */
eYo.geom.AbstractRect_p.unscale = function (scaleX, scaleY) {
  this.origin_.unscale(scaleX, scaleY)
  this.size_.unscale(scaleX, scaleY)
  return this
}

/**
 * Mirror the receiver vertically and horizontally.
 * @return {!eYo.geom.Rect} the receiver
 */
eYo.geom.AbstractRect_p.mirror = function () {
  // size does not change, only max <-> -min
  this.x_max_ = -this.x
  this.y_max_ = -this.y
  return this
}

/**
 * Inset the receiver.
 * Default values are `eYo.geom.X / eYo.geom.C` and `eYo.geom.Y / eYo.geom.L`
 * @param {Number|eYo.geom.Point} [dx_min]
 * @param {Number} [dy_min]
 * @param {Number} [dx_max]
 * @param {Number} [dy_max]
 * @return {!eYo.geom.Rect} the receiver
 */
eYo.geom.AbstractRect_p.xyInset = function (dx_min, dy_min, dx_max, dy_max) {
  if (!eYo.isDef(dx_min)) {
    dx_min = dx_max = eYo.geom.X / eYo.geom.C
    dy_min = dy_max = eYo.geom.Y / eYo.geom.L
  } else if (eYo.isDef(dx_min.x)) {
    dy_min = dy_max = dx_min.y
    dx_min = dx_max = dx_min.x
  } else {
    if (!eYo.isDef(dy_min)) {
      dy_min = dx_min
    }
    if (!eYo.isDef(dx_max)) {
      dx_max = dx_min
    }
    if (!eYo.isDef(dy_max)) {
      dy_max = dy_min
    }
  }
  if (this.width > 0) {
    if (eYo.greater(dx_min + dx_max, this.width)) {
      dx_min = this.width * dx_min / (dx_min + dx_max)
      this.left_ += dx_min
      this.w_ = 0
    } else {
      this.left_ += dx_min
      this.right_ -= dx_max  
    }
  }
  if (this.height > 0) {
    if (eYo.greater(dy_min + dy_max, this.height)) {
      dy_min = this.height * dy_min / (dy_min + dy_max)
      this.top_ += dy_min
      this.h_ = 0
    } else {
      this.top_ += dy_min
      this.bottom_ -= dy_max
    }
  }
  return this
}

/**
 * outset the receiver.
 * Default values are `eYo.geom.X / eYo.geom.C` and `eYo.geom.Y / eYo.geom.L`
 * @param {Number|eYo.geom.Point} [dx_min]
 * @param {Number} [dy_min]
 * @param {Number} [dx_max]
 * @param {Number} [dy_max]
 * @return {!eYo.geom.Rect} the receiver
 */
eYo.geom.AbstractRect_p.xyOutset = function (dx_min, dy_min, dx_max, dy_max) {
  if (!eYo.isDef(dx_min)) {
    dx_min = dx_max = eYo.geom.X / eYo.geom.C
    dy_min = dy_max = eYo.geom.Y / eYo.geom.L
  } else if (eYo.isDef(dx_min.x)) {
    dy_min = dy_max = dx_min.y
    dx_min = dx_max = dx_min.x
  } else {
    if (!eYo.isDef(dy_min)) {
      dy_min = dx_min
    }
    if (!eYo.isDef(dx_max)) {
      dx_max = dx_min
    }
    if (!eYo.isDef(dy_max)) {
      dy_max = dy_min
    }
  }
  this.left_ -= dx_min
  this.right_ += dx_max
  this.top_ -= dy_min
  this.bottom_ += dy_max
  return this
}

/**
 * Whether the receiver contains the given point.
 * @param {Number | eYo.geom.Point} x
 * @param {Number} [y]
 * @return {Boolean}
 */
eYo.geom.AbstractRect_p.xyContains = function (x, y) {
  if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
    var c = x.x / eYo.geom.X
    var l = x.y / eYo.geom.Y
  } else {
    c = x.c
    l = x.l
    if (eYo.isNA(c) || eYo.isNA(l)) {
      c = x / eYo.geom.X
      l = y / eYo.geom.Y
    }
  }
  return eYo.greater(c, this.c_min)
  && eYo.greater(this.c_max, c)
  && eYo.greater(l, this.l_min)
  && eYo.greater(this.l_max, l)
}

/**
 * Union with the `Rect`.
 * Extendes the receiver to include the given rect.
 * @param {eYo.geom.Rect} rect
 * @return {eYo.geom.Rect} the receiver
 */
eYo.geom.AbstractRect_p.unionRect = function (rect) {
  let left = Math.min(this.x_min, rect.x_min)
  let right = Math.max(this.x_max, rect.x_max)
  let top = Math.min(this.y_min, rect.y_min)
  let bottom = Math.max(this.y_max, rect.y_max)
  this.left_ = left
  this.right_ = right
  this.top_ = top
  this.bottom_ = bottom
  return this
}

/**
 * Union with the `Rect`.
 * Extendes the receiver to include the given rect.
 * @param {eYo.geom.Rect} rect
 * @return {eYo.geom.Rect} the receiver
 */
eYo.geom.AbstractRect_p.intersectionRect = function (rect) {
  let left = Math.max(this.x_min, rect.x_min)
  let right = Math.min(this.x_max, rect.x_max)
  let top = Math.max(this.y_min, rect.y_min)
  let bottom = Math.min(this.y_max, rect.y_max)
  if (right >= left && bottom >= top) {
    this.left_ = left
    this.right_ = right
    this.top_ = top
    this.bottom_ = bottom
    return this  
  }
}
//>>>

eYo.geom.AbstractRect.makeSubC9r('Rect', {
  /**
   * See the `set` function for argument description.
   * @param {Boolean|eYo.geom.RectLike} [snap] - Default to false
   * @param {*} c
   * @param {*} l 
   * @param {*} w 
   * @param {*} h 
   */
  init (snap, c, l, w, h) {
    if (eYo.isaP6y(snap)) {
      this.eyo.p6yReplace(this, 'snap', snap)
      this.makeSnapShared()
      this.set(c, l, w, h)
      return
    } else if (!eYo.isBool(snap)) {
      eYo.isDef(h) && eYo.throw(`${this.eyo.name}/init: Unexpected last argument ${h}`)
      if (eYo.isDef(snap)) {
        let $snap = snap.snap
        if (eYo.isDef($snap)) { // rect like
          this.snap_ = $snap
          this.set(snap, c, l, w, h)
          return
        }
      }
      ;[snap, c, l, w, h] = [false, snap, c, l, w]
    }
    this.makeSnapShared()
    this.snap_ = snap
    this.set(c, l, w, h)
  },
  /**
   * Dispose of the receiver's resources.
   */
  dispose: eYo.doNothing,
})

eYo.geom.Rect.eyo.finalizeC9r()
//>>>

/**
 * Convenient creator.
 * @param {Number} x  x coordinate
 * @param {Number} y  y coordinate
 * @param {Number} width  x coordinate
 * @param {Number} height  y coordinate
 * @return {eYo.geom.Rect} The newly created rect instance.
 */
eYo.geom._p.xyRect = function (x = 0, y = 0, width = 0, height = 0) {
  return new eYo.geom.Rect().xySet(x, y, width, height)
}

/**
 * Computes the difference regions between two rectangles. The return value is
 * an array of 0 to 4 rectangles defining the remaining regions of the first
 * rectangle after the second has been subtracted.
 * The only difference with closure implementation is that we keep track
 * of the rectangles order: 0 -> above, 1 -> below, 2 -> left, 3 -> right
 * SEE: https://github.com/google/closure-library/blob/master/closure/goog/math/rect.js#L272
 * @param {eYo.geom.Rect} a A Rectangle.
 * @param {eYo.geom.Rect} b A Rectangle.
 * @return {!Array<?eYo.geom.Rect>} An array with 4 rectangles which
 *     together define the difference area of rectangle a minus rectangle b.
 */
eYo.geom._p.deltaRect = function(a, b) {
  var ans = [null, null, null, null]

  var top = a.top
  var height = a.height

  var a_right = a.left + a.width
  var a_bottom = a.top + a.height

  var b_right = b.left + b.width
  var b_bottom = b.top + b.height

  if (a_bottom <= b.top) { // b is entirely below a
    ans[0] = new eYo.geom.Rect(a)
    return
  }
  // b.top < a_bottom
  if (b_bottom <= a.top) {
    ans[1] = new eYo.geom.Rect(a)
    return
  }
  // a.top < b_bottom
  // Subtract off any area on top where A extends past B
  if (b.top > a.top) {
    var r = ans[0] = new eYo.geom.Rect(a)
    r.height_ = b.top - a.top
    top = b.top
    // If we're moving the top down, we also need to subtract the height diff.
    height -= b.top - a.top
  }
  // Subtract off any area on bottom where A extends past B
  // We have b.top < a_bottom and only one of
  // b.top < b_bottom < a_bottom
  // b.top < a_bottom <= b_bottom
  if (b_bottom < a_bottom) {
    r = ans[1] = new eYo.geom.Rect(a)
    r.y_ = b_bottom
    r.height_ = a_bottom - b_bottom
    height = b_bottom - top
  }
  if (b.right <= a.left) {
    // no intersection
    ans[2] = new eYo.geom.Rect(a)
    return
  }
  // a.left < b.right
  if (a.right <= b.left) {
    // no intersection
    ans[3] = new eYo.geom.Rect(a)
    return
  }
  // b.left < a.right
  // Subtract any area on left where A extends past B
  // We have a.left < b.right and only one of
  // a.left < b.left < b.right
  // b.left <= a.left < b.right
  if (a.left < b.left) {
    r = ans[2] = new eYo.geom.Rect(a)
    r.width_ = b.left - a.left
    r.height_ = height
  }
  // Subtract any area on right where A extends past B
  // We have b.left < a.right and only one of
  // b.left < b.right < a.right
  // b.left < a.right <= b.right
  if (b_right < a_right) {
    ans[3] = eYo.xyRect(_right, top, a_right - b_right, height)
  }
  return ans
}

/**
 * Computes the intersection of the rectangle a and the rectangle b.
 * When the intersection is void, the return value is `eYo.NA`.
 * When the rectangles are side by side, the return rectangle has
 * either 0 width or 0 height,
 * thus representing either a segment or a point.
 * Both rectangles are expected to have the same constructor.
 * A new rectangle is returned when there is
 * a-n intersection, otherwise `eYo.NA` is returnde.
 * @param {eYo.geom.Rect} a - A Rectangle.
 * @param {eYo.geom.Rect} b - A Rectangle.
 * @return {eYo.geom.Rect}
 */
eYo.geom._p.intersectionRect = function(a, b) {
  var x_min = Math.max(a.x_min, b.x_min)
  var width = Math.min(a.x_max, b.x_max) - x_min
  if (width >= 0) {
    var y_min = Math.max(a.y_min, b.y_min)
    var height = Math.min(a.y_max, b.y_max) - y_min
    if (height >= 0) {
      return new eYo.geom.Rect().xySet(x_min, y_min, width, height)
    }
  }
  return eYo.NA
}
//>>>
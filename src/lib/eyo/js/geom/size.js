/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Objects for size.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.forward('geom.Point')
eYo.forward('geom.Rect')

//... var S
//... let W = eYo.test.randN()
//... let H = eYo.test.randN()
//... let m = {
//...   w: eYo.test.randN(),
//...   h: eYo.test.randN(),
//... }
//... let mm = {
//...   width:  m.w * eYo.geom.X,
//...   height: m.h * eYo.geom.Y,
//... }
//... let Ws = eYo.test.randN(true)
//... let Hs = eYo.test.randN(true)
//... let ms = {
//...   w: eYo.test.randN(true),
//...   h: eYo.test.randN(true),
//... }
//... let snap_p = eYo.p6y.new('p', onr)
//... snap_p.value_ = true
//... let isSwh = (S, w = 0, h = 0) => {
//...   chai./**/expect(S).almost.eql({w, h})
//... }
/**
 * `Size` is like a vector, but size is a shorter name...
 */
eYo.geom.newC9r('Size', {
  //<<< mochai: Size
  //<<< mochai: Basics
  //... S = new eYo.geom.Size()
  //... chai.expect(S).property('snap_p')
  //>>>
  /**
   * Initialize the point forwarding to `set`.
   * @param {Boolean|eYo.geom.PointLike|eYo.p6y.C9rBase} [snap] - Defaults to true
   * @param {*} w 
   * @param {*} h 
   */
  init (snap, w, h) {
    //<<< mochai: init
    //... var ss
    if (!eYo.isBool(snap)) {
      if (eYo.isaP6y(snap)) {
        this[this.p6y$.replace]('snap', snap)
        this.set(w, h)
        return
        //... S = new eYo.geom.Size()
        //... S[S.p6y$.replace]('snap', snap_p)
        //... chai.expect(S.snap_p[eYo.$$.target]).equal(snap_p)
        //... chai.expect(S.snap_ = false).equal(snap_p.value)
        //... chai.expect(snap_p.value_ = true).equal(S.snap)
        //... S = new eYo.geom.Size(snap_p)
        //... isSwh(S, 0, 0)
        //... chai.expect(S.snap_ = false).equal(snap_p.value)
        //... chai.expect(snap_p.value_ = true).equal(S.snap)
        //... S = new eYo.geom.Size(snap_p, ms.w)
        //... isSwh(S, ms.w, 0)
        //... chai.expect(S.snap_ = false).equal(snap_p.value)
        //... chai.expect(snap_p.value_ = true).equal(S.snap)
        //... S = new eYo.geom.Size(snap_p, ms.w, ms.h)
        //... chai.expect(S).almost.eql(ms)
        //... chai.expect(S.snap_ = false).equal(snap_p.value)
        //... chai.expect(snap_p.value_ = true).equal(S.snap)        
      } else if (eYo.isDef(snap)) {
        eYo.isDef(h) && eYo.throw(`${this.eyo$.name}/init: Unexpected last argument: ${h}`)
        let $snap = snap.snap
        if (eYo.isDef($snap)) {
          this.snap_ = $snap
          this.set(snap)
          return
          //... ss = eYo.geom.randSize(true)
          //... S = new eYo.geom.Size(ss)
          //... chai.expect(S.snap).equal(ss.snap)
          //... chai.expect(S).almost.eql(ss)
          //... ss = eYo.geom.randSize(false)
          //... S = new eYo.geom.Size(ss)
          //... chai.expect(S).almost.eql(ss)
          //... chai.expect(S.snap).almost.eql(ss.snap)
        }
      } else {
        snap = false
      }
      [snap, w, h] = [false, snap, w]
    }
    this.snap_ = snap
    this.set(w, h)
    //... S = new eYo.geom.Size(true, ms.w)
    //... isSwh(S, ms.w, 0)
    //... chai.expect(S.snap).true
    //... S = new eYo.geom.Size(false, m.w)
    //... isSwh(S, m.w, 0)
    //... chai.expect(S.snap).false
    //... S = new eYo.geom.Size(true, ms.w, ms.h)
    //... chai.expect(S).almost.eql(ms)
    //... chai.expect(S.snap).true
    //... S = new eYo.geom.Size(false, m.w, m.h)
    //... chai.expect(S).almost.eql(m)
    //... chai.expect(S.snap).false
    //>>>
  },
  properties: {
    //<<< mochai: properties
    //... S = new eYo.geom.Size()
    /**
     * Width in text unit
     * @type {Number}
     */
    w: {
      value: 0,
      validate (after) {
        if (!eYo.isDef(this)) {
          eYo.test && eYo.test.IN_THROW || console.error('BREAK HERE!!!')
        }
        return this.snap_ ? Math.round(after * eYo.geom.C) / eYo.geom.C : after
      },
      //<<< mochai: w
      //... chai.expect(S).property('w_p')
      //... S.snap_ = true
      //... S.w_ = 1 / eYo.geom.C
      //... chai.expect(S.w).almost.equal(1 / eYo.geom.C)
      //... S.w_ = 1.1 / eYo.geom.C
      //... chai.expect(S.w).almost.equal(1 / eYo.geom.C)
      //... S.w_ = 0.9 / eYo.geom.C
      //... chai.expect(S.w).almost.equal(1 / eYo.geom.C)
      //... S.snap_ = false
      //... S.w_ = 1.2345
      //... chai.expect(S.w).almost.equal(1.2345)
      //>>>
    },
    /**
     * Height in text unit
     * @type {Number}
     */
    h: {
      value: 0,
      validate (after) {
        return this.snap_ ? Math.round(after * eYo.geom.L) / eYo.geom.L : after
      },
      //<<< mochai: h
      //... chai.expect(S).property('h_p')
      //... S.snap_ = true
      //... S.h_ = 1 / eYo.geom.L
      //... chai.expect(S.h).almost.equal(1 / eYo.geom.L)
      //... S.h_ = 1.1 / eYo.geom.L
      //... chai.expect(S.h).almost.equal(1 / eYo.geom.L)
      //... S.h_ = 0.9 / eYo.geom.L
      //... chai.expect(S.h).almost.equal(1 / eYo.geom.L)
      //... S.snap_ = false
      //... S.h_ = 1.2345
      //... chai.expect(S.h).almost.equal(1.2345)
      //>>>
    },
    /**
     * Horizontal position in pixels
     * @type {Number}
     */
    width: {
      get () {
        return this.w_ * eYo.geom.X
      },
      set (after) {
        this.w_ = after / eYo.geom.X
      }
      //<<< mochai: width in pixels
      //... S = new eYo.geom.Size(false, mm)
      //... chai.expect(S).almost.eql(m)
      //... S.width_ += 5 * eYo.geom.X
      //... isSwh(S, m.w + 5, m.h)
      //>>>
    },
    /**
     * Height in pixels
     * @type {Number}
     */
    height: {
      get () {
        return this.h_ * eYo.geom.Y
      },
      set (after) {
        this.h_ = after / eYo.geom.Y
      }
      //<<< mochai: height in pixels
      //... S = new eYo.geom.Size(false, mm)
      //... chai.expect(S).almost.eql(m)
      //... S.height_ += 5 * eYo.geom.Y
      //... isSwh(S, m.w, m.h + 5)
      //>>>
    },
    /**
     * clone the receiver.
     * @type {eYo.geom.Size}
     */
    copy: {
      get () {
        return new this.eyo$.C9r(this)
      }
      //<<< mochai: copy
      //... var m = {w: 3, h: 4}
      //... S = new eYo.geom.Size(false, m)
      //... let SS = S.copy
      //... chai.expect(S).not.equal(SS)
      //... chai.expect(S).almost.eql(SS)
      //>>>
    },
    /**
     * Convert the receiver to a `eYo.geom.Point` instance.
     * @return {eYo.geom.Point}
     */
    asPoint: {
      //<<< mochai: asPoint
      get () {
        return new eYo.geom.Point(this.snap_, this.w_, this.h_)
      }
      //... S = new eYo.geom.Size(false, m)
      //... let P = S.asPoint
      //... chai.expect(P).eyo_point
      //... chai.expect(P).almost.eql({c: m.w, l: m.h})
      //>>>
    },
    /**
     * Human readable description.
     * @return {String}
     */
    description: {
      get () {
        return `${this.eyo$.name}(w: ${this.w}, h: ${this.h}, width: ${this.width}, height: ${this.height})`
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
      return eYo.equals(this.w_, rhs.w, tolerance) && eYo.equals(this.h_, rhs.h, tolerance)
      //... let m = {w: 1.23, h: 4.56}
      //... let epsilon = 0.01
      //... var delta = epsilon * (m.w + 1) / (1 - epsilon)
      //... S = new eYo.geom.Size(false, m.w + 2 * delta, m.h)
      //... chai.expect(S.eql(m, 1.01 * epsilon)).true
      //... chai.expect(S.eql(m, 0.99 * epsilon)).false
      //... var delta = epsilon * (m.h + 1) / (1 - epsilon)
      //... S = new eYo.geom.Size(false, m.w, m.h + 2 * delta)
      //... chai.expect(S.eql(m, 1.01 * epsilon)).true
      //... chai.expect(S.eql(m, 0.99 * epsilon)).false
      //>>>
    },
    /**
     * Sets the coordinates, instead of advancing them.
     * @param {Number | eYo.geom.Point | Event | Object} w
     * @param {Number} [h]
     * @return {eYo.geom.Point} The receiver
     */
    set (w = 0, h) {
      //<<< mochai: set
      if (eYo.isDef(w.w) && eYo.isDef(w.h)) {
        this.w_ = w.w
        this.h_ = w.h
        //... S = new eYo.geom.Size()
        //... S.set(m)
        //... chai.expect(S).eql(m)
        //... chai.expect(() => S.set(m, null)).not.xthrow()
        //... chai.expect(() => S.set(m, 1)).xthrow()
      } else if (eYo.isDef(w.width) && eYo.isDef(w.height)) {
        this.width_ = w.width
        this.height_ = w.height
        //... S = new eYo.geom.Size()
        //... S.set(mm)
        //... chai.expect(S).almost.eql(m)
        //... chai.expect(() => S.set(mm, null)).not.xthrow()
        //... chai.expect(() => S.set(mm, 1)).xthrow()
      } else if (eYo.isDef(w.x) && eYo.isDef(w.y)) {
        this.width_ = w.x
        this.height_ = w.y
        //... S = new eYo.geom.Size()
        //... let mmxy = {x: mm.width, y: mm.height}
        //... S.set(mmxy)
        //... chai.expect(S).almost.eql(m)
        //... chai.expect(() => S.set(mmxy, null)).not.xthrow()
        //... chai.expect(() => S.set(mmxy, 1)).xthrow()
      } else if (eYo.isDef(w.clientX) && eYo.isDef(w.clientY)) {
        this.width_ = w.clientX
        this.height_ = w.clientY
        //... S = new eYo.geom.Size()
        //... let mmClient = {clientX: mm.width, clientY: mm.height}
        //... S.set(mmClient)
        //... chai.expect(S).almost.eql(m)
        //... chai.expect(() => S.set(mmClient, null)).not.xthrow()
        //... chai.expect(() => S.set(mmClient, 1)).xthrow()
      } else {
        eYo.isaP6y(w)
          ? this[this.p6y$.replace]('w', w)
          : (this.w_ = w || 0)
        eYo.isaP6y(h)
          ? this[this.p6y$.replace]('h', h)
          : (this.h_ = h || 0)
        return this
        //... let w_p = eYo.p6y.new('w', onr)
        //... let h_p = eYo.p6y.new('h', onr)
        //... S = new eYo.geom.Size()
        //... w_p.value_ = m.w; h_p.value_ = m.h
        //... S.set(w_p, m.h)
        //... chai.expect(S).eql(m)
        //... chai.expect(w_p.value_ = 9).equal(S.w)
        //... chai.expect(S.w_ = m.w).equal(w_p.value)
        //... S = new eYo.geom.Size()
        //... w_p.value_ = m.w; h_p.value_ = m.h
        //... S.set(m.w, h_p)
        //... chai.expect(S).eql(m)
        //... chai.expect(h_p.value_ = 9).equal(S.h)
        //... chai.expect(S.h_ = m.h).equal(h_p.value)
        //... S = new eYo.geom.Size()
        //... w_p.value_ = m.w; h_p.value_ = m.h
        //... S.set(w_p, h_p)
        //... chai.expect(S).eql(m)
        //... chai.expect(S).eql({w: (w_p.value_ = m.h), h: (h_p.value_ = m.w)})
        //... chai.expect(S).eql({w: (w_p.value_ = m.w), h: (h_p.value_ = m.h)})
      }
      eYo.isDef(h) && eYo.throw(`${this.eyo$.name}/set: Unexpected argument 'l' ${h}`)
      return this
      //>>>
    },
    /**
     * Setter.
     * @param {Number} width - width in pixels
     * @param {Number} height - height in pixels
     * @return {eYo.geom.Size} The receiver
     */
    pSet (width = 0, height) {
      //<<< mochai: pSet
      //... let mm = {width: eYo.test.randN(), height: eYo.test.randN()}
      //... let m = {w: mm.width / eYo.geom.X, h: mm.height / eYo.geom.Y}
      if (eYo.isDef(width.width) && eYo.isDef(width.height)) {
        //... S = new eYo.geom.Size()
        //... S.pSet(mm)
        //... chai.expect(S).almost.eql(m)
        this.width_ = width.width
        this.height_ = width.height
        return this
      } else if (eYo.isDef(width.w) && eYo.isDef(width.h)) {
        eYo.isDef(height) && eYo.throw(`${this.eyo$.name}/pSet: Unexpected last argument ${height}`)
        //... S = new eYo.geom.Size()
        //... chai.expect(() => {S.pSet(m, 1)}).xthrow()
        this.w_ = width.w
        this.h_ = width.h
        return this
        //... S = new eYo.geom.Size()
        //... S.pSet(m)
        //... chai.expect(S).almost.eql(m)
      }
      //... S = new eYo.geom.Size()
      //... S.pSet(mm.width, mm.height)
      //... chai.expect(S).almost.eql(m)
      this.width_ = width
      this.height_ = height
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
      //... let m = {w: eYo.test.randN(), h: eYo.test.randN()}
      //... var scaleX = 1 + eYo.test.randN()
      //... var scaleY = 1 + eYo.test.randN()
      if (scaleX.x) {
        eYo.isDef(scaleY) && eYo.throw(`${this.eyo$.name}/scale: Unexpected last argument ${scaleY} (scaleY)`)
        //... S = new eYo.geom.Size(m)
        //... chai.expect(() => S.scale({x: 1}, 2)).xthrow()
        this.w_ *= scaleX.x
        this.h_ *= (scaleX.y || scaleX.x)
        //... chai.expect(S).almost.eql(m)
        //... S.scale({x: scaleX})
        //... isSwh(S, m.w * scaleX, m.h * scaleX)
        //... S.scale({x: 1 / scaleX})
        //... chai.expect(S).almost.eql(m)
        //... S.scale({x: scaleX, y: scaleY})
        //... isSwh(S, m.w * scaleX, m.h * scaleY)
        //... S.scale({x: 1 / scaleX, y: 1 / scaleY})
        //... chai.expect(S).almost.eql(m)
      } else if (scaleX.y) {
        eYo.isDef(scaleY) && eYo.throw(`${this.eyo$.name}/scale: Unexpected last argument ${scaleY} (scaleY)`)
        //... S = new eYo.geom.Size(m)
        //... chai.expect(() => S.scale({y: 1}, 2)).xthrow()
        this.w_ *= scaleX.y
        this.h_ *= scaleX.y
        //... chai.expect(S).almost.eql(m)
        //... S.scale({y: scaleY})
        //... isSwh(S, m.w * scaleY, m.h * scaleY)
        //... S.scale({y: 1 / scaleY})
        //... chai.expect(S).almost.eql(m)
      } else {
        //... S = new eYo.geom.Size(m)
        this.w_ *= scaleX
        this.h_ *= (scaleY || scaleX)
        //... chai.expect(S).almost.eql(m)
        //... S.scale(scaleX)
        //... isSwh(S, m.w * scaleX, m.h * scaleX)
        //... S.scale(1 / scaleX)
        //... chai.expect(S).almost.eql(m)
        //... S.scale(scaleX, scaleY)
        //... isSwh(S, m.w * scaleX, m.h * scaleY)
        //... S.scale(1 / scaleX, 1 / scaleY)
        //... chai.expect(S).almost.eql(m)
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
      //... let m = {w: eYo.test.randN(), h: eYo.test.randN()}
      //... var scaleX = 1 + eYo.test.randN()
      //... var scaleY = 1 + eYo.test.randN()
      if (scaleX.x) {
        eYo.isDef(scaleY) && eYo.throw(`${this.eyo$.name}/scale: Unexpected last argument ${scaleY} (scaleY)`)
        //... S = new eYo.geom.Size(m)
        //... chai.expect(() => S.unscale({x: 1}, 2)).xthrow()
        this.w_ /= scaleX.x
        this.h_ /= (scaleX.y || scaleX.x)
        //... chai.expect(S).almost.eql(m)
        //... S.unscale({x: scaleX})
        //... isSwh(S, m.w / scaleX, m.h / scaleX)
        //... S.unscale({x: 1 / scaleX})
        //... chai.expect(S).almost.eql(m)
        //... S.unscale({x: scaleX, y: scaleY})
        //... isSwh(S, m.w / scaleX, m.h / scaleY)
        //... S.unscale({x: 1 / scaleX, y: 1 / scaleY})
        //... chai.expect(S).almost.eql(m)
      } else if (scaleX.y) {
        eYo.isDef(scaleY) && eYo.throw(`${this.eyo$.name}/scale: Unexpected last argument ${scaleY} (scaleY)`)
        //... S = new eYo.geom.Size(m)
        //... chai.expect(() => S.scale({y: 1}, 2)).xthrow()
        this.w_ /= scaleX.y
        this.h_ /= scaleX.y
        //... chai.expect(S).almost.eql(m)
        //... S.unscale({y: scaleY})
        //... isSwh(S, m.w / scaleY, m.h / scaleY)
        //... S.unscale({y: 1 / scaleY})
        //... chai.expect(S).almost.eql(m)
      } else {
        //... S = new eYo.geom.Size(m)
        this.w_ /= scaleX
        this.h_ /= (scaleY || scaleX)
        //... chai.expect(S).almost.eql(m)
        //... S.unscale(scaleX)
        //... isSwh(S, m.w / scaleX, m.h / scaleX)
        //... S.unscale(1 / scaleX)
        //... chai.expect(S).almost.eql(m)
        //... S.unscale(scaleX, scaleY)
        //... isSwh(S, m.w / scaleX, m.h / scaleY)
        //... S.unscale(1 / scaleX, 1 / scaleY)
        //... chai.expect(S).almost.eql(m)
      }
      return this
      //>>>
    },
    /**
     * Sets from the given text.
     * @param {String!} txt
     * @return {eYo.geom.Size} the receiver.
     */
    setFromText (txt) {
      //<<< mochai: setFromText
      if (!eYo.isDef(txt)) {
        eYo.test && eYo.test.IN_THROW || console.error('BREAK HERE!')
      }
      var lines = txt.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/)
      var c = 0
      lines.forEach(l => (c < l.length) && (c = l.length) )
      this.set(c, lines.length)
      return this
      //... S = new eYo.geom.Size(0,0)
      //... chai.expect(S.w === 0 && S.h === 0, '0').true
      //... var f = (txt, w, h) => {
      //...   S.setFromText(txt)
      //...   isSwh(S, w, h)
      //... }
      //... var A = ['', 'a', 'aa', 'aaa']
      //... var B = ['', 'b', 'bb', 'bbb']
      //... var C = ['', 'c', 'cc', 'ccc']
      //... var NL = ['\R', '\n', '\R\n', '\v', '\f', '\R', '\x85', '\u2028', '\u2029']
      //... A.forEach(a => {
      //...   f(a, a.length, 1)
      //...   NL.forEach(nl1 => {
      //...     B.forEach(b => {
      //...       f(a+nl1+b, Math.max(a.length, b.length), 2)
      //...       NL.forEach(nl2 => {
      //...         C.forEach(c => {
      //...           f(a+nl1+b+nl2+c, Math.max(a.length, b.length, c.length), nl1+b+nl2 === '\R\n' ? 2 : 3)
      //...         })
      //...       })
      //...     })
      //...   })
      //... })
      //... S.dispose()
      //>>>
    },
    //>>>
  },
  aliases: {
    //<<< mochai: aliases
    //... S = new eYo.geom.Size()
    w: 'dc',
    //... chai.expect(S.w).equal(S.dc)
    //... S.dc_ = eYo.test.randN()
    //... chai.expect(S.w).equal(S.dc)    
    h: 'dl',
    //... chai.expect(S.h).equal(S.dl)
    //... S.dl_ = eYo.test.randN()
    //... chai.expect(S.h).equal(S.dl)    
    width: 'dx',
    //... chai.expect(S.width).equal(S.dx)
    //... S.dx_ = eYo.test.randN()
    //... chai.expect(S.width).equal(S.dx)    
    height: 'dy',
    //... chai.expect(S.height).equal(S.dy)
    //... S.dy_ = eYo.test.randN()
    //... chai.expect(S.height).equal(S.dy)    
    //>>>
  },
  //>>>
})

eYo.geom.Size$.finalizeC9r()

eYo.c9r.Dlgt_p.makeSized = function (key) {
  //<<< mochai: eYo.o4t.Dlgt.makeSized
  //... let ns = eYo.o4t.newNS()
  //... ns.makeC9rBase(true)
  //... ns.C9rBase[eYo.$].makeSized('size')
  //... ns.C9rBase[eYo.$].finalizeC9r()
  //... var R
  this.modelMerge({
    //<<< mochai: Text coordinates
    properties: {
      //<<< mochai: properties
      [key]: {
        //<<< mochai: size
        //... R = ns.new('foo', onr)
        //... chai.expect(R).property('size_p')
        value () {
          return new eYo.geom.Size()
        },
        //... chai.expect(R.size).eyo_size
        copy: true,
        //... // A copy is not the original
        //... chai.expect(R.size).not.equal(R.size_)
        //... // A copy is not another copy
        //... chai.expect(R.size).not.equal(R.size)
        //... chai.expect(R.size).almost.eql(R.size_)
        //... chai.expect(R.size).almost.eql(R.size)
        set (stored, after) {
          stored.pSet(after)
          //... R = ns.new('foo', onr)
          //... var sz = eYo.geom.randSize(false)
          //... chai.expect(R.size_).not.equal(sz)
          //... R.size_ = sz
          //... chai.expect(R.size_).not.equal(sz)
          //... chai.expect(R.size_).almost.eql(sz)
        }
        //>>>  
      },
      //>>>  
    },
    aliases: {
      //<<< mochai: aliases
      [key + '.w']: 'w',
      //<<< mochai: w
      //... R = ns.new('foo', onr)
      //... chai.expect(R).property('w_p')
      //... chai.expect(R.size.w).equal(R.w)
      //... R.w_ += 1
      //... chai.expect(R.size.w).equal(R.w)
      //... R.size_.w_ += 1
      //... chai.expect(R.size.w).equal(R.w)
      //>>>
      [key + '.h']: 'h',
      //<<< mochai: h
      //... R = ns.new('foo', onr)
      //... chai.expect(R).property('h_p')
      //... chai.expect(R.size.h).equal(R.h)
      //... R.h_ += 1
      //... chai.expect(R.size.h).equal(R.h)
      //... R.size_.h_ -= 1
      //... chai.expect(R.size.h).equal(R.h)
      //>>>
      //<<< mochai: w + h
      //... R = ns.new('foo', onr)
      //... R.w_ = W
      //... isSwh(R.size, W)
      //... R.h_ = H
      //... isSwh(R.size, W, H)
      //>>>
      //>>> 
    },
    //>>>
  })
  this.modelMerge({
    //<<< mochai: Board coordinates
    aliases: {
      //<<< mochai: aliases
      //... R = ns.new('foo', onr)
      // basic properties in board dimensions
      [key + '.width']: 'width',
      //<<< mochai: width
      //... R.size_.set(m)
      //... chai.expect(R.size.width).almost.equal(mm.width)
      //... R.width_ += eYo.geom.X
      //... chai.expect(R.size.width).almost.equal(R.width)
      //... R.size_.width_ -= eYo.geom.X
      //... chai.expect(R.size.width).almost.equal(R.width).almost.equal(mm.width)
      // Convenient setters in board coordinates
      //... R.width_ += 5 * eYo.geom.X
      //... chai.expect(R.width).almost.equal(mm.width + 5 * eYo.geom.X)
      //>>>
      [key + '.height']: 'height',
      //<<< mochai: height
      //... R.size_.set(m)
      //... chai.expect(R.size.height).almost.equal(R.height).almost.equal(mm.height)
      //... R.height_ += eYo.geom.Y
      //... chai.expect(R.size.height).almost.equal(R.height)
      //... R.size_.height_ -= eYo.geom.Y
      //... chai.expect(R.size.height).almost.equal(R.height)
      //... chai.expect(R.height).almost.equal(mm.height)
      //... R.height_ += 4 * eYo.geom.Y
      //... chai.expect(R.height).almost.equal(mm.height + 4 * eYo.geom.Y)
      //>>>
      //<<< mochai: width + height
      //... R = ns.new('foo', onr)
      //... R.width_ = mm.width
      //... isSwh(R.size, m.w)
      //... R.height_ = mm.height
      //... isSwh(R.size, m.w, m.h)
      //... R = ns.new('foo', onr)
      //... R.size_.width_ = mm.width
      //... chai.expect(R.width).almost.equal(mm.width)
      //... R.size_.height_ = mm.height
      //... chai.expect(R.height).almost.equal(mm.height)
      //>>>
      //>>>
    },
    //>>>
  })
  //>>>
}

/**
 * Sets from the given text.
 * @param {String!} txt
 */
eYo.geom._p.newSizeFromText = function (txt) {
  return new eYo.geom.Size().setFromText(txt)
}

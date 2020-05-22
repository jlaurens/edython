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

/**
 * `Size` is like a vector, but size is a shorter name...
 */
eYo.geom.makeC9r('Size', {
  //<<< mochai: Size
    //<<< mochai: Basics
    //... var S = new eYo.geom.Size()
    //... chai.expect(S.snap_p).not.undefined
    //>>>
  /**
   * Initialize the point forwarding to `set`.
   * @param {Boolean|eYo.geom.PointLike|eYo.p6y.BaseC9r} [snap] - Defaults to true
   * @param {*} w 
   * @param {*} h 
   */
  init (snap, w, h) {
    //<<< mochai: init
    //... var s, ss
    //... var m = {w: 3, h: 4}
    //... var p_snap = eYo.p6y.new('p', onr); p_snap.value_ = true
    if (!eYo.isBool(snap)) {
      if (eYo.isaP6y(snap)) {
        this.p6yReplace('snap', snap)
        this.set(w, h)
        return
        //... s = new eYo.geom.Size()
        //... s.p6yReplace('snap', p_snap)
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
        eYo.isDef(h) && eYo.throw(`${this.eyo.name}/init: Unexpected last argument: ${h}`)
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
    //<<< mochai: properties
    //... let S = new eYo.geom.Size()
    /**
     * Width in text unit
     * @type {Number}
     */
    w: {
      value: 0,
      validate (after) {
        if (!eYo.isDef(this)) {
          console.error('BREAK HERE!!!')
        }
        return this.snap_ ? Math.round(after * eYo.geom.C) / eYo.geom.C : after
      },
      //<<< mochai: w
      //... chai.expect(S.w_p).not.undefined
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
      //... chai.expect(S.h_p).not.undefined
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
      //... var m = {w: 1, h: 2}
      //... var mm = {width: m.w * eYo.geom.X, height: m.h * eYo.geom.Y}
      //... var S = new eYo.geom.Size(false, mm)
      //... chai.expect(S).almost.eql(m)
      //... S.width_ += 5 * eYo.geom.X
      //... chai.expect(S).almost.eql({w: m.w + 5, h: m.h})
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
      //... var m = {w: 3, h: 4}
      //... var mm = {width: m.w * eYo.geom.X, height: m.h * eYo.geom.Y}
      //... var S = new eYo.geom.Size(false, mm)
      //... chai.expect(S).almost.eql(m)
      //... S.height_ += 5 * eYo.geom.Y
      //... chai.expect(S).almost.eql({w: m.w, h: m.h + 5})
      //>>>
    },
    /**
     * clone the receiver.
     * @type {eYo.geom.Size}
     */
    copy: {
      get () {
        return new this.eyo.C9r(this)
      }
      //<<< mochai: copy
      //... var m = {w: 3, h: 4}
      //... var S = new eYo.geom.Size(false, m)
      //... let SS = S.copy
      //... chai.expect(S).not.equal(SS)
      //... chai.expect(S).almost.eql(SS)
      //>>>
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
      //... var S = new eYo.geom.Size(false, m.w + 2 * delta, m.h)
      //... chai.expect(S.eql(m, 1.01 * epsilon)).true
      //... chai.expect(S.eql(m, 0.99 * epsilon)).false
      //... var delta = epsilon * (m.h + 1) / (1 - epsilon)
      //... var S = new eYo.geom.Size(false, m.w, m.h + 2 * delta)
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
      //... var S, m, mm
      if (eYo.isDef(w.w) && eYo.isDef(w.h)) {
        this.w_ = w.w
        this.h_ = w.h
        //... S = new eYo.geom.Size()
        //... m = {w: 3, h: 4}
        //... S.set(m)
        //... chai.expect(S).eql(m)
        //... chai.expect(() => S.set(m, null)).not.throw()
        //... chai.expect(() => S.set(m, 1)).throw()
      } else if (eYo.isDef(w.width) && eYo.isDef(w.height)) {
        this.width_ = w.width
        this.height_ = w.height
        //... S = new eYo.geom.Size()
        //... mm = {width: m.w * eYo.geom.X, height: m.h * eYo.geom.Y}
        //... S.set(mm)
        //... chai.expect(S).almost.eql(m)
        //... chai.expect(() => S.set(mm, null)).not.throw()
        //... chai.expect(() => S.set(mm, 1)).throw()
      } else if (eYo.isDef(w.x) && eYo.isDef(w.y)) {
        this.width_ = w.x
        this.height_ = w.y
        //... S = new eYo.geom.Size()
        //... mm = {x: m.w * eYo.geom.X, y: m.h *  eYo.geom.Y}
        //... S.set(mm)
        //... chai.expect(S).almost.eql(m)
        //... chai.expect(() => S.set(mm, null)).not.throw()
        //... chai.expect(() => S.set(mm, 1)).throw()
      } else if (eYo.isDef(w.clientX) && eYo.isDef(w.clientY)) {
        this.width_ = w.clientX
        this.height_ = w.clientY
        //... S = new eYo.geom.Size()
        //... mm = {clientX: m.w * eYo.geom.X, clientY: m.h *  eYo.geom.Y}
        //... S.set(mm)
        //... chai.expect(S).almost.eql(m)
        //... chai.expect(() => S.set(mm, null)).not.throw()
        //... chai.expect(() => S.set(mm, 1)).throw()
      } else {
        eYo.isaP6y(w)
        ? this.p6yReplace('w', w)
        : (this.w_ = w || 0)
        eYo.isaP6y(h)
        ? this.p6yReplace('h', h)
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
      eYo.isDef(h) && eYo.throw(`${this.eyo.name}/set: Unexpected argument 'l' ${h}`)
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
        //... var S = new eYo.geom.Size()
        //... S.pSet(mm)
        //... chai.expect(S).almost.eql(m)
        this.width_ = width.width
        this.height_ = width.height
        return this
      } else if (eYo.isDef(width.w) && eYo.isDef(width.h)) {
        eYo.isDef(height) && eYo.throw(`${this.eyo.name}/pSet: Unexpected last argument ${height}`)
        //... var S = new eYo.geom.Size()
        //... chai.expect(() => {S.pSet(m, 1)}).throw()
        this.w_ = width.w
        this.h_ = width.h
        return this
        //... var S = new eYo.geom.Size()
        //... S.pSet(m)
        //... chai.expect(S).almost.eql(m)
      }
      //... var S = new eYo.geom.Size()
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
        eYo.isDef(scaleY) && eYo.throw(`${this.eyo.name}/scale: Unexpected last argument ${scaleY} (scaleY)`)
        //... var S = new eYo.geom.Size(m)
        //... chai.expect(() => S.scale({x: 1}, 2)).throw()
        this.w_ *= scaleX.x
        this.h_ *= (scaleX.y || scaleX.x)
        //... chai.expect(S).almost.eql(m)
        //... S.scale({x: scaleX})
        //... chai.expect(S).almost.eql({w: scaleX * m.w, h: scaleX * m.h})
        //... S.scale({x: 1 / scaleX})
        //... chai.expect(S).almost.eql(m)
        //... S.scale({x: scaleX, y: scaleY})
        //... chai.expect(S).almost.eql({w: scaleX * m.w, h: scaleY * m.h})
        //... S.scale({x: 1 / scaleX, y: 1 / scaleY})
        //... chai.expect(S).almost.eql(m)
      } else if (scaleX.y) {
        eYo.isDef(scaleY) && eYo.throw(`${this.eyo.name}/scale: Unexpected last argument ${scaleY} (scaleY)`)
        //... var S = new eYo.geom.Size(m)
        //... chai.expect(() => S.scale({y: 1}, 2)).throw()
        this.w_ *= scaleX.y
        this.h_ *= scaleX.y
        //... chai.expect(S).almost.eql(m)
        //... S.scale({y: scaleY})
        //... chai.expect(S).almost.eql({w: scaleY * m.w, h: scaleY * m.h})
        //... S.scale({y: 1 / scaleY})
        //... chai.expect(S).almost.eql(m)
      } else {
        //... var S = new eYo.geom.Size(m)
        this.w_ *= scaleX
        this.h_ *= (scaleY || scaleX)
        //... chai.expect(S).almost.eql(m)
        //... S.scale(scaleX)
        //... chai.expect(S).almost.eql({w: scaleX * m.w, h: scaleX * m.h})
        //... S.scale(1 / scaleX)
        //... chai.expect(S).almost.eql(m)
        //... S.scale(scaleX, scaleY)
        //... chai.expect(S).almost.eql({w: scaleX * m.w, h: scaleY * m.h})
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
        eYo.isDef(scaleY) && eYo.throw(`${this.eyo.name}/scale: Unexpected last argument ${scaleY} (scaleY)`)
        //... var S = new eYo.geom.Size(m)
        //... chai.expect(() => S.unscale({x: 1}, 2)).throw()
        this.w_ /= scaleX.x
        this.h_ /= (scaleX.y || scaleX.x)
        //... chai.expect(S).almost.eql(m)
        //... S.unscale({x: scaleX})
        //... chai.expect(S).almost.eql({w: m.w / scaleX, h: m.h / scaleX})
        //... S.unscale({x: 1 / scaleX})
        //... chai.expect(S).almost.eql(m)
        //... S.unscale({x: scaleX, y: scaleY})
        //... chai.expect(S).almost.eql({w: m.w / scaleX, h: m.h / scaleY})
        //... S.unscale({x: 1 / scaleX, y: 1 / scaleY})
        //... chai.expect(S).almost.eql(m)
      } else if (scaleX.y) {
        eYo.isDef(scaleY) && eYo.throw(`${this.eyo.name}/scale: Unexpected last argument ${scaleY} (scaleY)`)
        //... var S = new eYo.geom.Size(m)
        //... chai.expect(() => S.scale({y: 1}, 2)).throw()
        this.w_ /= scaleX.y
        this.h_ /= scaleX.y
        //... chai.expect(S).almost.eql(m)
        //... S.unscale({y: scaleY})
        //... chai.expect(S).almost.eql({w: m.w / scaleY, h: m.h / scaleY})
        //... S.unscale({y: 1 / scaleY})
        //... chai.expect(S).almost.eql(m)
      } else {
        //... var S = new eYo.geom.Size(m)
        this.w_ /= scaleX
        this.h_ /= (scaleY || scaleX)
        //... chai.expect(S).almost.eql(m)
        //... S.unscale(scaleX)
        //... chai.expect(S).almost.eql({w: m.w / scaleX, h: m.h / scaleX})
        //... S.unscale(1 / scaleX)
        //... chai.expect(S).almost.eql(m)
        //... S.unscale(scaleX, scaleY)
        //... chai.expect(S).almost.eql({w: m.w / scaleX, h: m.h / scaleY})
        //... S.unscale(1 / scaleX, 1 / scaleY)
        //... chai.expect(S).almost.eql(m)
      }
      return this
      //>>>
    },
    /**
     * Sets from the given text.
     * @param {String!} s
     * @return {eYo.geom.Size} the receiver.
     */
    setFromText (txt) {
      //<<< mochai: setFromText
      if (!eYo.isDef(txt)) {
        console.error('BREAK HERE!')
      }
      var lines = txt.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/)
      var c = 0
      lines.forEach(l => (c < l.length) && (c = l.length) )
      this.set(c, lines.length)
      return this
      //... var S = new eYo.geom.Size(0,0)
      //... chai.expect(S.w === 0 && S.h === 0, '0').true
      //... var f = (txt, w, h) => {
      //...   S.setFromText(txt)
      //...   chai.expect(S).almost.eql({w: w, h: h})
      //... }
      //... var A = ['', 'a', 'aa', 'aaa']
      //... var B = ['', 'b', 'bb', 'bbb']
      //... var C = ['', 'c', 'cc', 'ccc']
      //... var NL = ['\r', '\n', '\r\n', '\v', '\f', '\r', '\x85', '\u2028', '\u2029']
      //... A.forEach(a => {
      //...   f(a, a.length, 1)
      //...   NL.forEach(nl1 => {
      //...     B.forEach(b => {
      //...       f(a+nl1+b, Math.max(a.length, b.length), 2)
      //...       NL.forEach(nl2 => {
      //...         C.forEach(c => {
      //...           f(a+nl1+b+nl2+c, Math.max(a.length, b.length, c.length), nl1+b+nl2 === '\r\n' ? 2 : 3)
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
    //... let S = new eYo.geom.Size()
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

eYo.geom.Size.eyo.finalizeC9r()

eYo.c9r.Dlgt_p.makeSized = function (key) {
  //<<< mochai: eYo.o4t.Dlgt.makeSized
  //... let ns = eYo.o4t.makeNS()
  //... ns.makeBaseC9r(true)
  //... ns.BaseC9r.eyo.makeSized('size')
  //... ns.BaseC9r.eyo.finalizeC9r()
  //... var r
  this.modelMerge({
    //<<< mochai: Text coordinates
    properties: {
      //<<< mochai: properties
      [key]: {
        //<<< mochai: size
        //... r = ns.new('foo', onr)
        //... chai.expect(r.size_p).not.undefined
        value () {
          return new eYo.geom.Size()
        },
        //... chai.expect(r.size).eyo_size
        copy: true,
        //... // A copy is not the original
        //... chai.expect(r.size).not.equal(r.size_)
        //... // A copy is not another copy
        //... chai.expect(r.size).not.equal(r.size)
        //... chai.expect(r.size).almost.eql(r.size_)
        //... chai.expect(r.size).almost.eql(r.size)
        set (stored, after) {
          stored.pSet(after)
          //... r = ns.new('foo', onr)
          //... var sz = eYo.geom.randSize(false)
          //... chai.expect(r.size_).not.equal(sz)
          //... r.size_ = sz
          //... chai.expect(r.size_).not.equal(sz)
          //... chai.expect(r.size_).almost.eql(sz)
        }
        //>>>  
      },
      //>>>  
    },
    aliases: {
      //<<< mochai: aliases
      [key + '.w']: 'w',
        //<<< mochai: w
        //... r = ns.new('foo', onr)
        //... chai.expect(r.size.w).equal(r.w)
        //... r.w_ += 1
        //... chai.expect(r.size.w).equal(r.w)
        //... r.size_.w_ += 1
        //... chai.expect(r.size.w).equal(r.w)
        //>>>
      [key + '.h']: 'h',
        //<<< mochai: h
        //... chai.expect(r.size.h).equal(r.h)
        //... r.h_ += 1
        //... chai.expect(r.size.h).equal(r.h)
        //... r.size_.h_ -= 1
        //... chai.expect(r.size.h).equal(r.h)
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
      //... r.size_.set(m)
      // basic properties in board dimensions
      [key + '.width']: 'width',
        //<<< mochai: width
        //... chai.expect(r.size.width).almost.equal(m.w * eYo.geom.X)
        //... chai.expect(r.size.width).almost.equal(r.width)
        //... r.width_ += eYo.geom.X
        //... chai.expect(r.size.width).almost.equal(r.width)
        //... r.size_.width_ -= eYo.geom.X
        //... chai.expect(r.size.width).almost.equal(r.width).almost.equal(m.w * eYo.geom.X)
        // Convenient setters in board coordinates
        //... r.width_ += 5 * eYo.geom.X
        //... m.w += 5
        //... chai.expect(r.width).almost.equal(m.w * eYo.geom.X)
        //>>>
      [key + '.height']: 'height',
        //<<< mochai: height
        //... chai.expect(r.size.height).almost.equal(r.height).almost.equal(m.h * eYo.geom.Y)
        //... r.height_ += eYo.geom.Y
        //... chai.expect(r.size.height).almost.equal(r.height)
        //... r.size_.height_ -= eYo.geom.Y
        //... chai.expect(r.size.height).almost.equal(r.height)
        //... chai.expect(r.height).almost.equal(m.h * eYo.geom.Y)
        //... r.height_ += 4 * eYo.geom.Y
        //... m.h += 4
        //... chai.expect(r.height).almost.equal(m.h * eYo.geom.Y)
        //>>>
      //>>>
    },
    //>>>
  })
  //>>>
}

/**
 * Sets from the given text.
 * @param {String!} s
 */
eYo.geom._p.newSizeFromText = function (txt) {
  return new eYo.geom.Size().setFromText(txt)
}

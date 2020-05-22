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

eYo.require('geom.Point')
eYo.require('geom.Size')

//<<< mochai: Rect
//... var m = {
//...   c: eYo.test.randN(true),
//...   l: eYo.test.randN(true),
//...   w: eYo.test.randN(true),
//...   h: eYo.test.randN(true),
//... }
//... var mm = {
//...   x: m.c * eYo.geom.X,
//...   y: m.l * eYo.geom.Y,
//...   width: m.w * eYo.geom.X,
//...   height: m.h * eYo.geom.Y,
//... }

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
eYo.geom.makeC9r('Rect', {
  //<<< mochai: eYo.geom.Rect
  /**
   * See the `set` function for argument description.
   * @param {Boolean|eYo.geom.RectLike} [snap] - Default to false
   * @param {*} c
   * @param {*} l 
   * @param {*} w 
   * @param {*} h 
   */
  init (snap, c, l, w, h) {
    //<<< mochai: init
    if (eYo.isaP6y(snap)) {
      // all the rects may share the same snap property.
      this.snap_t = snap
      this.makeSnapShared()
      this.set(c, l, w, h)
      return
      //... let snap_p = eYo.p6y.new('snap', onr)
      //... var R = new eYo.geom.Rect(snap_p)
      //... chai.expect(R.snap_t).equal(snap_p)
      //... snap_p.value_ = false
      //... chai.expect(R.snap).equal(snap_p.value_)
      //... snap_p.value_ = !snap_p.value
      //... chai.expect(R.snap).equal(snap_p.value_)
    } else if (!eYo.isBool(snap)) {
      eYo.isDef(h) && eYo.throw(`${this.eyo.name}/init: Unexpected last argument ${h}`)
      //... chai.expect(() => {new eYo.geom.Rect(1, 2, 3, 4, 5)}).throw()
      if (eYo.isDef(snap)) {
        let $snap = snap.snap
        if (eYo.isDef($snap)) { // rect like
          this.snap_ = $snap
          this.set(snap, c, l, w, h)
          return
          //... var R = new eYo.geom.Rect({snap: false})
          //... chai.expect(R.snap).false
          //... var R = new eYo.geom.Rect({snap: true})
          //... chai.expect(R.snap).true
        }
      }
      ;[snap, c, l, w, h] = [false, snap, c, l, w]
    }
    this.snap_ = snap
    this.set(c, l, w, h)
    this.makeSnapShared()
    //... var R = new eYo.geom.Rect(false)
    //... chai.expect(R.snap).false
    //... var R = new eYo.geom.Rect(true)
    //... chai.expect(R.snap).true
    //>>>
  },
  /**
   * Dispose of the receiver's resources.
   */
  dispose: eYo.doNothing,
  //>>>
})

//<<< mochai: origin/size
eYo.geom.Rect.eyo.makePointed('origin')
eYo.geom.Rect.eyo.makeSized('size')
//<<< mochai: Basics
//... let R = new eYo.geom.Rect()
//... chai.expect(R.origin_p).not.undefined
//... chai.expect(R.origin).eyo_point
//... chai.expect(R.size_p).not.undefined
//... chai.expect(R.size).eyo_size
//>>>
eYo.geom.Rect.eyo.modelMerge({
  properties: {
    //<<< mochai: Rect properties
    /**
     * Translation: the size does not change.
     */
    c_mid: {
      //<<< mochai: c_mid
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R).almost.eql(m)
      after: ['c', 'w'],
      get () {
        return this.c + this.w / 2
        //... chai.expect(R.c_mid).almost.equal(m.c + m.w / 2)
      },
      /**
       * @param {Number} after 
       */
      set (after) {
        this.c_ = after - this.w / 2
        //... R.c_mid_ += 5
        //... chai.expect(R).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
      }
      //>>>
    },
    c_max: {
      //<<< mochai: c_max
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R).almost.eql(m)
      after: ['c', 'w'],
      get () {
        return this.c + this.w
        //... chai.expect(R.c_max).almost.equal(m.c + m.w)
      },
      set (after) {
        this.c_ = after - this.w
        //... R.c_max_ += 5
        //... chai.expect(R).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
      }
      //>>>
    },
    l_mid: {
      //<<< mochai: l_mid
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R).almost.eql(m)
      after: ['l', 'h'],
      get () {
        return this.l + this.h / 2
        //... chai.expect(R.l_mid).almost.equal(m.l + m.h / 2)
      },
      set (after) {
        this.l_ = after - this.h / 2
        //... R.l_mid_ += 5
        //... chai.expect(R).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
      }
      //>>>
    },
    l_max: {
      //<<< mochai: l_max
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R).almost.eql(m)
      after: ['l', 'h'],
      get () {
        return this.l + this.h
        //... chai.expect(R.l_max).almost.equal(m.l + m.h)
      },
      set (after) {
        this.l_ = after - this.h
        //... R.l_max_ += 5
        //... chai.expect(R).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
      }
      //>>>
    },
    //>>>
  },
  methods: {
    //<<< mochai: methods
    makeSnapShared () {
      //<<< mochai: makeSnapShared
      //... let R = new eYo.geom.Rect()
      this.origin_.shareSnap(this.snap_p)
      this.size_.shareSnap(this.snap_p)
      //... chai.expect(R.origin_.snap_t).equal(R.snap_p)
      //... chai.expect(R.size_.snap_t).equal(R.snap_p)
      //... chai.expect(R.snap).equal(R.origin.snap).equal(R.size.snap)
      //... R.snap_ = !R.snap_
      //... chai.expect(R.snap).equal(R.origin.snap).equal(R.size.snap)
      //>>>
    }
    //>>>
  }
})
//>>>

eYo.geom.Rect.eyo.modelMerge({
  properties: {
    //<<< mochai: properties
      x_mid: {
      //<<< mochai: x_mid
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R).almost.eql(m)
      after: ['x', 'width'],
      get () {
        return this.x + this.width / 2
        //... chai.expect(R.x_mid).almost.equal(mm.x + mm.width / 2)
      },
      set (after) {
        this.x_ = after - this.width / 2
        //... R.x_mid_ += 5 * eYo.geom.X
        //... chai.expect(R).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
      }
      //>>>
    },
    x_max: {
      //<<< mochai: x_max
      after: ['x', 'width'],
      get () {
        return this.x + this.width
      },
      set (after) {
        this.x_ = after - this.width
      }
      //... var R = new eYo.geom.Rect(false, mm)
      //... chai.expect(R).almost.eql(m)
      //... chai.expect(R.x_max).almost.equal(mm.x + mm.width)
      //... R.x_max_ += 5 * eYo.geom.X
      //... chai.expect(R).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
      //>>>
    },
    y_mid: {
      //<<< mochai: y_mid
      after: ['y', 'height'],
      get () {
        return this.y + this.height / 2
      },
      set (after) {
        this.y_ = after - this.height / 2
      }
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R).almost.eql(m)
      //... chai.expect(R.y_mid).almost.equal(mm.y + mm.height / 2)
      //... R.y_mid_ += 5 * eYo.geom.Y
      //... chai.expect(R).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
      //>>>
    },
    y_max: {
      //<<< mochai: y_max
      after: ['y', 'height'],
      get () {
        return this.y + this.height
      },
      set (after) {
        this.y_ = after - this.height
      }
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R).almost.eql(m)
      //... chai.expect(R.y_max).almost.equal(mm.y + mm.height)
      //... R.y_max_ += 5 * eYo.geom.Y
      //... chai.expect(R).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
      //>>>
    },
    //// The setter changes the width, but does not change the `right` property
    left: {
      //<<< mochai: left
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R).almost.eql(m)
      after: ['x', 'width', 'x_min', 'x_max'],
      get () {
        return this.x
        //... chai.expect(R.left).almost.equal(mm.x)
      },
      set (after) {
        this.width_ = this.x_max - after
        this.x_min_ = after
        //... R.left_ -= 5 * eYo.geom.X
        //... chai.expect(R).almost.eql({c: m.c - 5, l: m.l, w: m.w + 5, h: m.h})
        //... R.left_ += 10 * eYo.geom.X
        //... chai.expect(R).almost.eql({c: m.c + 5, l: m.l, w: m.w - 5, h: m.h})
      }
      //>>>
    },
    right: {
      //<<< mochai: right
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R).almost.eql(m)
      after: ['left', 'width', 'x_max'],
      get () {
        return this.x_max
        //... chai.expect(R.right).almost.equal(mm.x + mm.width)
      },
      /**
       * Change the width, not the `left`.
       * Non positive widths are allowed.
       */
      set (after) {
        this.width_ = after - this.left
        //... R.right_ -= 5 * eYo.geom.X
        //... chai.expect(R).almost.eql({c: m.c, l: m.l, w: m.w - 5, h: m.h})
        //... R.right_ += 10 * eYo.geom.X
        //... chai.expect(R).almost.eql({c: m.c, l: m.l, w: m.w + 5, h: m.h})
      }
      //>>>
    },
    top: {
      //<<< mochai: top
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R).almost.eql(m)
      after: ['y', 'height', 'y_min', 'y_max'],
      get () {
        return this.y
        //... chai.expect(R.top).almost.equal(mm.y)
      },
      /**
       * The height does change.
       * @param {Number} after 
       */
      set (after) {
        this.height_ = this.y_max - after
        this.y_min_ = after
        //... R.top_ -= 5 * eYo.geom.Y
        //... chai.expect(R).almost.eql({c: m.c, l: m.l - 5, w: m.w, h: m.h + 5})
        //... R.top_ += 10 * eYo.geom.Y
        //... chai.expect(R).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h - 5})
      }
      //>>>
    },
    bottom: {
      //<<< mochai: bottom
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R).almost.eql(m)
      after: ['top', 'height', 'y_max'],
      get () {
        return this.y_max
        //... chai.expect(R.bottom).almost.equal(mm.y + mm.height)
      },
      /**
       * Change the height, not the `top`.
       * Negative heights are allowed.
       */
      set (after) {
        this.height_ = after - this.top
        //... R.bottom_ -= 5 * eYo.geom.Y
        //... chai.expect(R).almost.eql({c: m.c, l: m.l, w: m.w, h: m.h - 5})
        //... R.bottom_ += 10 * eYo.geom.Y
        //... chai.expect(R).almost.eql({c: m.c, l: m.l, w: m.w, h: m.h + 5})
      }
      //>>>
    },
    // Composed
    bottomRight: {
      //<<< mochai: bottomRight
      //... var R = new eYo.geom.Rect(false, m)
      after: ['x_max', 'y_max'],
      get () {
        return this.origin.forward(this.size_)
        //... chai.expect(R.origin).almost.eql(m)
        //... chai.expect(R.size).almost.eql(m)
        //... chai.expect(R.bottomRight).almost.eql({c: m.c + m.w, l: m.l + m.h})
      },
      set (after) {
        this.x_max_ = after.x
        this.y_max_ = after.y
        //... var R = new eYo.geom.Rect(false)
        //... R.bottomRight_ = {x: mm.x + mm.width, y: mm.y + mm.height}
        //... chai.expect(R.bottomRight_).almost.eql({c: m.c + m.w, l: m.l + m.h})
      }
      //>>>
    },
    center: {
      //<<< mochai: center
      after: ['origin', 'size'],
      get () {
        return this.origin.forward(this.size.unscale(2))
        //... var R = new eYo.geom.Rect(false, m)
        //... chai.expect(R.center).almost.eql({c: m.c + m.w / 2, l: m.l + m.h / 2})
      },
      /**
       * Change the origin but keeps the size.
       */
      set (after) {
        this.origin_ = (new eYo.geom.Point(after)).backward(this.size.unscale(2))
        //... var R = new eYo.geom.Rect(false, m)
        //... R.center_ = {x: 0, y: 0}
        //... chai.expect(R).almost.eql({c: -m.w / 2, l: -m.h / 2, w: m.w, h: m.h})
      }
      //>>>
    },
    /**
     * clone the receiver.
     * @type {eYo.geom.Rect}
     */
    copy: {
      //<<< mochai: copy
      get () {
        return new this.eyo.C9r(this)
      },
      //... var R = new eYo.geom.Rect(false, m)
      //... let RR = R.copy
      //... chai.expect(R).not.equal(RR)
      //... chai.expect(R).almost.eql(RR)
      //>>>
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
    pDescription: {
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
  methods: {
    //<<< mochai: methods
    /**
     * set the `Rect`.
     * This is a very very permissive setter.
     * @param{?Number|eYo.geom.Point|Element} c
     * @param{?Number|eYo.geom.Size} l
     * @param{?Number|eYo.geom.Size} w
     * @param{?Number} h
     * @return {eYo.geom.Rect} The receiver
     */
    set (c = 0, l, w, h) {
      //<<< mochai: set
      //... var R = new eYo.geom.Rect()
      //... let origin_p = eYo.p6y.new('origin', onr)
      //... origin_p.value_ = new eYo.geom.Point(m)
      //... chai.expect(origin_p.value).almost.eql(m)
      //... let size_p = eYo.p6y.new('size', onr)
      //... size_p.value_ = new eYo.geom.Size(m)
      //... chai.expect(size_p.value).almost.eql(m)
      if (eYo.isaP6y(c)) {
        eYo.isDef(c.value_) || eYo.throw(`${this.eyo.name}.set: Unexpected white property (c)`)
        var v = c.value
        if (eYo.isDef(v.c) && eYo.isDef(v.l)) {
          eYo.isDef(h) && eYo.throw(`${this.eyo.name}.set: Unexpected last argument ${h}`)
          ;[w, h] = [l, w]
          this.origin_t = c
          //... R = new eYo.geom.Rect()
          //... R.set(origin_p, m.w, m.h)
          //... chai.expect(R.origin_t).equal(origin_p)
          //... chai.expect(R).almost.eql(m)
        } else {
          this.origin_.c_t = c
          if (eYo.isaP6y(l)) {
            this.origin_.l_t = l
            //... R = new eYo.geom.Rect()
            //... R.set(origin_p.value_.c_p, origin_p.value_.l_p, m.w, m.h)
            //... chai.expect(R.origin_.c_t).equal(origin_p.value_.c_p)
            //... chai.expect(R.origin_.l_t).equal(origin_p.value_.l_p)
            //... chai.expect(R).almost.eql(m)
          } else {
            this.l_ = l
            //... R = new eYo.geom.Rect()
            //... R.set(origin_p.value_.c_p, m.l, m.w, m.h)
            //... chai.expect(R.origin_.c_t).equal(origin_p.value_.c_p)
            //... chai.expect(R).almost.eql(m)
          }
        }
      } else if (eYo.isDef(c.left) && eYo.isDef(c.right) && eYo.isDef(c.top) && eYo.isDef(c.bottom)) {
        eYo.isDef(l) && eYo.throw(`${this.eyo.name}.set: Unexpected argument ${l}`)
        //... R = new eYo.geom.Rect()
        //... chai.expect(() => R.set({left: 0, right: 0, top: 0, bottom: 0,}, null)).not.throw()
        //... chai.expect(() => R.set({left: 0, right: 0, top: 0, bottom: 0,}, 1)).throw()
        // properties are evaluated twice
        this.left_ = c.left
        this.right_ = c.right
        this.top_ = c.top
        this.bottom_ = c.bottom
        return this
        //... R = new eYo.geom.Rect()
        //... R.set({
        //...   left:   m.c * eYo.geom.X,
        //...   top:    m.l * eYo.geom.Y,
        //...   right:  (m.c + m.w) * eYo.geom.X,
        //...   bottom: (m.l + m.h) * eYo.geom.Y
        //... })
        //... chai.expect(R).almost.eql(m)
      } else if (eYo.isDef(c.x) && eYo.isDef(c.y) && eYo.isDef(c.width) && eYo.isDef(c.height)) {
        eYo.isDef(l) && eYo.throw(`${this.eyo.name}.set: Unexpected argument ${l}`)
        //... R = new eYo.geom.Rect()
        //... chai.expect(() => R.set(mm, null)).not.throw()
        //... chai.expect(() => R.set(mm, 1)).throw()
        // properties are evaluated twice
        this.x_ = c.x
        this.y_ = c.y
        this.width_ = c.width
        this.height_ = c.height
        return this
        //... R = new eYo.geom.Rect()
        //... R.set(mm)
        //... chai.expect(R).almost.eql(m)
      } else if (eYo.isDef(c.c) && eYo.isDef(c.l)) {
        if (eYo.isDef(c.w) && eYo.isDef(c.h)) { // Rect like object
          eYo.isDef(l) && eYo.throw(`${this.eyo.name}.set: Unexpected argument ${l}`)
          //... R = new eYo.geom.Rect()
          //... chai.expect(() => R.set(m, null)).not.throw()
          //... chai.expect(() => R.set(m, 1)).throw()
          this.c_ = c.c
          this.l_ = c.l
          this.w_ = c.w
          this.h_ = c.h
          return this
          //... R = new eYo.geom.Rect()
          //... R.set(m)
          //... chai.expect(R).almost.eql(m)
        }
        // Not a rect
        eYo.isDef(h) && eYo.throw(`${this.eyo.name}.set: Unexpected last argument ${h}`)
        //... R = new eYo.geom.Rect()
        //... chai.expect(() => {R.set({c: 0, l: 0}, 2, 3, 4)}).throw()
        this.origin_ = c
        ;[w, h] = [l, w]
        //... R = new eYo.geom.Rect()
        //... R.set(origin_p.value, m.w, m.h)
        //... chai.expect(R).almost.eql(m)
        //... R = new eYo.geom.Rect()
        //... R.set({c: m.c, l: m.l}, m.w, m.h)
        //... chai.expect(R).almost.eql(m)
      } else {
        this.c_ = c
        if (eYo.isaP6y(l)) {
          this.origin_.l_t = l
          //... R = new eYo.geom.Rect()
          //... R.set(m.c, origin_p.value_.l_p, m.w, m.h)
          //... chai.expect(R.origin_.l_t).equal(origin_p.value_.l_p)
          //... chai.expect(R).almost.eql(m)
        } else {
          this.l_ = l
          //... R = new eYo.geom.Rect()
          //... R.set(m.c, m.l, m.w, m.h)
          //... chai.expect(R).almost.eql(m)
        }
      }
      if (eYo.isDef(w)) {
        if (eYo.isaP6y(w)) {
          var v = w.value
          if (eYo.isDef(v.w) && eYo.isDef(v.h)) {
            eYo.isDef(h) && eYo.throw(`${this.eyo.name}.set: Unexpected last argument ${h}`)
            this.size_t = w
            //... R = new eYo.geom.Rect()
            //... R.set(m.c, m.l, size_p)
            //... chai.expect(R.size_t).equal(size_p)
            //... chai.expect(R).almost.eql(m)
          } else {
            this.size_.w_t = w
            if (eYo.isaP6y(h)) {
              this.size_.h_t = h
              //... R = new eYo.geom.Rect()
              //... R.set(m.c, m.l, size_p.value_.w_p, size_p.value_.h_p)
              //... chai.expect(R.size_.w_t).equal(size_p.value_.w_p)
              //... chai.expect(R.size_.h_t).equal(size_p.value_.h_p)
              //... chai.expect(R).almost.eql(m)
            } else {
              this.h_ = h
              //... R = new eYo.geom.Rect()
              //... R.set(m.c, m.l, size_p.value_.w_p, m.h)
              //... chai.expect(R.size_.w_t).equal(size_p.value_.w_p)
              //... chai.expect(R).almost.eql(m)
            }
          }
        } else if (eYo.isDef(w.w) && eYo.isDef(w.h)) {
          eYo.isDef(h) && eYo.throw(`${this.eyo.name}.set: Unexpected (last?) argument ${h}`)
          //... R = new eYo.geom.Rect()
          //... chai.expect(() => {R.set(m.c, m.l, {w: m.w, h: m.h}, 1)}).throw()
          this.size_ = w
          //... R = new eYo.geom.Rect()
          //... R.set(m.c, m.l, {w: m.w, h: m.h})
          //... chai.expect(R).almost.eql(m)
          //... R = new eYo.geom.Rect()
          //... R.set(m.c, m.l, size_p.value)
          //... chai.expect(R).almost.eql(m)
          //... R.set(origin_p.value, size_p.value)
          //... chai.expect(R).almost.eql(m)
        } else if (eYo.isDef(w.width) && eYo.isDef(w.height)) {
          eYo.isDef(h) && eYo.throw(`${this.eyo.name}.set: Unexpected (last?) argument ${h}`)
          //... R = new eYo.geom.Rect()
          //... chai.expect(() => {R.set(m.c, m.l, {width: mm.width, height: mm.height}, 1)}).throw()
          this.size_ = w
          //... R = new eYo.geom.Rect()
          //... R.set(m.c, m.l, {width: mm.width, height: mm.height})
          //... chai.expect(R).almost.eql(m)
        } else {
          this.w_ = w
          if (eYo.isaP6y(h)) {
            this.size_.h_t = h
            //... R = new eYo.geom.Rect()
            //... R.set(m.c, m.l, m.w, size_p.value_.h_p)
            //... chai.expect(R.size_.h_t).equal(size_p.value_.h_p)
            //... chai.expect(R).almost.eql(m)
          } else {
            this.h_ = h || 0
            //... R = new eYo.geom.Rect()
            //... R.set(m.c, m.l, m.w, m.h)
            //... chai.expect(R).almost.eql(m)
          }
        }
      } else {
        eYo.isDef(h) && eYo.throw(`${this.eyo.name}.set: Unexpected last argument ${h}`)
        //... R = new eYo.geom.Rect()
        //... chai.expect(() => {R.set(m.c, m.l, eYo.NA, 1)}).throw()
        this.w_ = this.h_ = 0
        //... R = new eYo.geom.Rect()
        //... R.set(m.c, m.l)
        //... chai.expect(R).eql({c: m.c, l: m.l, w: 0, h: 0})
      }
      return this
      //>>>
    },
    //>>>
  },
})

// text coordinates
eYo.geom.Rect.eyo.modelMerge({
  //<<< mochai: text coordinates
  aliases: {
    //<<< mochai: aliases
    origin: 'topLeft',
      //<<< mochai: topLeft
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R.origin_p).not.undefined
      //... chai.expect(R.topLeft_p).not.undefined
      //... chai.expect(R.topLeft).almost.eql(R.origin)
      //... var P = R.origin.copy.forward(1, 1)
      //... R.origin_ = P
      //... chai.expect(R.topLeft).almost.eql(R.origin).almost.eql(P)
      //... var P = R.topLeft.copy.forward(-1, -1)
      //... R.topLeft_ = P
      //... chai.expect(R.topLeft).almost.eql(R.origin).almost.eql(P)
      //>>>
    // Basic properties in text dimensions.
    // When in text dimensions, and snap to grid mode,
    // setters round their arguments to half width and quarter height.
    // Except for left, right, top and bottom,
    // the position setters won't change the size.
    'origin.c': ['c', 'c_min'],
      //<<< mochai: c, c_min
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R.origin.c).equal(R.c).equal(R.c_min)
      //... R.c_ += 1
      //... chai.expect(R).almost.eql({c: m.c+1, l: m.l, w: m.w, h: m.h})
      //... chai.expect(R.origin.c).equal(R.c).equal(R.c_min)
      //... R.c_min_ -= 1
      //... chai.expect(R).almost.eql(m)
      //... chai.expect(R.origin.c).equal(R.c).equal(R.c_min)
      //... R.origin_.c_ += 1
      //... chai.expect(R).almost.eql({c: m.c+1, l: m.l, w: m.w, h: m.h})
      //... chai.expect(R.origin.c).equal(R.c).equal(R.c_min)
      //>>>
    'origin.l': ['l', 'l_min'],
      //<<< mochai: l, l_min
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R.origin.l).equal(R.l).equal(R.l_min)
      //... R.l_ += 2
      //... chai.expect(R).almost.eql({c: m.c, l: m.l+2, w: m.w, h: m.h})
      //... chai.expect(R.origin.l).equal(R.l).equal(R.l_min)
      //... R.l_min_ -= 2
      //... chai.expect(R).almost.eql(m)
      //... chai.expect(R.origin.l).equal(R.l).equal(R.l_min)
      //... R.origin_.l_ += 2
      //... chai.expect(R.origin.l).equal(R.l).equal(R.l_min)
      //... chai.expect(R).almost.eql({c: m.c, l: m.l+2, w: m.w, h: m.h})
      //>>>
    'size.w': 'w',
      //<<< mochai: w
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R.size.w).equal(R.w)
      //... R.w_ += 1
      //... chai.expect(R).almost.eql({c: m.c, l: m.l, w: m.w+1, h: m.h})
      //... chai.expect(R.size.w).equal(R.w)
      //... R.size_.w_ -= 1
      //... chai.expect(R).almost.eql(m)
      //... chai.expect(R.size.w).equal(R.w)
      //>>>
    'size.h': 'h',
      //<<< mochai: h
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R.size.h).equal(R.h)
      //... R.h_ += 1
      //... chai.expect(R).almost.eql({c: m.c, l: m.l, w: m.w, h: m.h+1})
      //... chai.expect(R.size.h).equal(R.h)
      //... R.size_.h_ -= 1
      //... chai.expect(R).almost.eql(m)
      //... chai.expect(R.size.h).equal(R.h)
      //>>>
    //>>>
  },
  //>>>
})

eYo.geom.Rect.eyo.modelMerge({
  //<<< mochai: board coordinates
  aliases: {
    //<<< mochai: aliases
    // basic properties in board dimensions
    'origin.x': ['x', 'x_min'],
      //<<< mochai: Rect x, x_min
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R.origin.x).almost.equal(R.x).almost.equal(R.x_min)
      //... R.x_ += eYo.geom.X
      //... chai.expect(R).almost.eql({c: m.c+1, l: m.l, w: m.w, h: m.h})
      //... chai.expect(R.origin.x).almost.equal(R.x).almost.equal(R.x_min)
      //... R.x_min_ -= eYo.geom.X
      //... chai.expect(R).almost.eql(m)
      //... chai.expect(R.origin.x).almost.equal(R.x).almost.equal(R.x_min)
      //... R.origin_.x_ += eYo.geom.X
      //... chai.expect(R).almost.eql({c: m.c+1, l: m.l, w: m.w, h: m.h})
      //... chai.expect(R.origin.x).almost.equal(R.x).almost.equal(R.x_min)
      //>>>
    'origin.y': ['y', 'y_min'],
      //<<< mochai: Rect y, y_min
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R.origin.y).almost.equal(R.y).almost.equal(R.y_min)
      //... R.y_min_ -= eYo.geom.Y
      //... chai.expect(R).almost.eql({c: m.c, l: m.l-1, w: m.w, h: m.h})
      //... chai.expect(R.origin.y).almost.equal(R.y).almost.equal(R.y_min)
      //... R.origin_.y_ += eYo.geom.Y
      //... chai.expect(R).almost.eql(m)
      //... chai.expect(R.origin.y).almost.equal(R.y).almost.equal(R.y_min)
      //... R.y_ += 4 * eYo.geom.Y
      //... chai.expect(R).almost.eql({c: m.c, l: m.l+4, w: m.w, h: m.h})
      //>>>
    'size.width': 'width',
      //<<< mochai: Rect width
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R.size.width).almost.equal(R.width)
      //... R.width_ += 3 * eYo.geom.X
      //... chai.expect(R).almost.eql({c: m.c, l: m.l, w: m.w+3, h: m.h})
      //... chai.expect(R.size.width).almost.equal(R.width)
      //... R.size_.width_ -= 3 * eYo.geom.X
      //... chai.expect(R).almost.eql(m)
      //... chai.expect(R.size.width).almost.equal(R.width)
      //>>>
    'size.height': 'height',
      //<<< mochai: Rect height
      //... var R = new eYo.geom.Rect(false, m)
      //... chai.expect(R.size.height).almost.equal(R.height)
      //... R.height_ += 4 * eYo.geom.Y
      //... chai.expect(R).almost.eql({c: m.c, l: m.l, w: m.w, h: m.h+4})
      //... chai.expect(R.size.height).almost.equal(R.height)
      //... R.size_.height_ -= 4 * eYo.geom.Y
      //... chai.expect(R).almost.eql(m)
      //... chai.expect(R.size.height).almost.equal(R.height)
      //>>>
    //>>>
  },
  //>>>
})

eYo.geom.Rect.eyo.finalizeC9r()

// eYo.geom.AbstractRect.eyo.modelMerge({
//   aliases: {
//     //<<< mochai: aliases
//     //... var R = new eYo.geom.Rect(false, m)
//     // basic properties in board dimensions
//     'origin.x': ['x', 'x_min'],
//     //... chai.expect(R.origin.x).almost.equal(R.x).almost.equal(R.x_min)
//     //... R.x_ += eYo.geom.X
//     //... chai.expect(R.origin.x).almost.equal(R.x).almost.equal(R.x_min)
//     //... R.x_min_ -= eYo.geom.X
//     //... chai.expect(R.origin.x).almost.equal(R.x).almost.equal(R.x_min)
//     //... R.origin_.x_ += eYo.geom.X
//     //... chai.expect(R.origin.x).almost.equal(R.x).almost.equal(R.x_min)
//     'origin.y': ['y', 'y_min'],
//     //... chai.expect(R.origin.y).almost.equal(R.y).almost.equal(R.y_min)
//     //... R.y_ += eYo.geom.X
//     //... chai.expect(R.origin.y).almost.equal(R.y).almost.equal(R.y_min)
//     //... R.y_min_ -= eYo.geom.Y
//     //... chai.expect(R.origin.y).almost.equal(R.y).almost.equal(R.y_min)
//     //... R.origin_.y_ += eYo.geom.Y
//     //... chai.expect(R.origin.y).almost.equal(R.y).almost.equal(R.y_min)
//     'size.width': 'width',
//     //... chai.expect(R.size.width).almost.equal(R.width)
//     //... R.width_ += eYo.geom.X
//     //... chai.expect(R.size.width).almost.equal(R.width)
//     //... R.size_.width_ -= eYo.geom.X
//     //... chai.expect(R.size.width).almost.equal(R.width)
//     'size.height': 'height',
//     //... chai.expect(R.size.height).almost.equal(R.height)
//     //... R.height_ += eYo.geom.Y
//     //... chai.expect(R.size.height).almost.equal(R.height)
//     //... R.size_.height_ -= eYo.geom.Y
//     //... chai.expect(R.size.height).almost.equal(R.height)
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
//     //... var R = new eYo.geom.Rect(false, m)
//     //... chai.expect(R).almost.eql(m)
//     //... chai.expect(R.c_mid).almost.equal(2.5)
//     //... R.c_mid_ += 5
//     //... chai.expect(R).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
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
//     //... var R = new eYo.geom.Rect(false, m)
//     //... chai.expect(R).almost.eql(m)
//     //... chai.expect(R.c_max).almost.equal(4)
//     //... R.c_max_ += 5
//     //... chai.expect(R).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
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
//     //... var R = new eYo.geom.Rect(false, m)
//     //... chai.expect(R).almost.eql(m)
//     //... chai.expect(R.l_mid).almost.equal(4)
//     //... R.l_mid_ += 5
//     //... chai.expect(R).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
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
//     //... var R = new eYo.geom.Rect(false, m)
//     //... chai.expect(R).almost.eql(m)
//     //... chai.expect(R.l_max).almost.equal(6)
//     //... R.l_max_ += 5
//     //... chai.expect(R).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
//     //>>>
//     // Convenient setters in board coordinates
//     //<<< mochai: Rect x
//     //... var R = new eYo.geom.Rect(false, m)
//     //... chai.expect(R).almost.eql(m)
//     //... chai.expect(R.x).almost.equal(m.c * eYo.geom.X)
//     //... R.x_ += 5 * eYo.geom.X
//     //... chai.expect(R).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
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
//     //... var R = new eYo.geom.Rect(false, mm)
//     //... chai.expect(R).almost.eql(m)
//     //... chai.expect(R.x_mid).almost.equal(2.5 * eYo.geom.X)
//     //... R.x_mid_ += 5 * eYo.geom.X
//     //... chai.expect(R).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
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
//     //... var R = new eYo.geom.Rect(false, mm)
//     //... chai.expect(R).almost.eql(m)
//     //... chai.expect(R.x_max).almost.equal(4 * eYo.geom.X)
//     //... R.x_max_ += 5 * eYo.geom.X
//     //... chai.expect(R).almost.eql({c: m.c + 5, l: m.l, w: m.w, h: m.h})
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
//     //... var R = new eYo.geom.Rect(false, mm)
//     //... chai.expect(R).almost.eql(m)
//     //... chai.expect(R.y_mid).almost.equal(4 * eYo.geom.Y)
//     //... R.y_mid_ += 5 * eYo.geom.Y
//     //... chai.expect(R).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
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
//     //... var R = new eYo.geom.Rect(false, mm)
//     //... chai.expect(R).almost.eql(m)
//     //... chai.expect(R.y_max).almost.equal(6 * eYo.geom.Y)
//     //... R.y_max_ += 5 * eYo.geom.Y
//     //... chai.expect(R).almost.eql({c: m.c, l: m.l + 5, w: m.w, h: m.h})
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

//<<< mochai: Rect methods


/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.geom.Point | eYo.geom.Size} c
 * @param {number} l
 * @return {eYo.geom.Rect}
 */
eYo.geom.Rect_p.forward = function (c = 0, l = 0) {
  this.origin_.forward(c, l)
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.geom.Point | eYo.geom.Size} c
 * @param {number} l
 * @return {eYo.geom.Rect}
 */
eYo.geom.Rect_p.backward = function (c = 0, l = 0) {
  this.origin_.backward(c, l)
  return this
}


/**
 * Test equality between the receiver and the rhs.
 * Takes rounding errors into account.
 * @param {eYo.geom.Rect} rhs
 */
eYo.geom.Rect_p.eql = function (rhs, tolerance = eYo.EPSILON) {
  return rhs instanceof eYo.geom.Rect && this.origin_.eql(rhs.origin_, tolerance) && this.size_.eql(rhs.size_, tolerance)
}

/**
 * Scale the receiver.
 * @param {Number | Object} scaleX  Must be positive.
 * @param {Number} [scaleY]  Must be positive when defines, defaults to scaleX.
 * @return {!eYo.geom.Rect} the receiver
 */
eYo.geom.Rect_p.scale = function (scaleX, scaleY) {
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
eYo.geom.Rect_p.unscale = function (scaleX, scaleY) {
  this.origin_.unscale(scaleX, scaleY)
  this.size_.unscale(scaleX, scaleY)
  return this
}

/**
 * Mirror the receiver vertically and horizontally.
 * @return {!eYo.geom.Rect} the receiver
 */
eYo.geom.Rect_p.mirror = function () {
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
eYo.geom.Rect_p.xyInset = function (dx_min, dy_min, dx_max, dy_max) {
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
eYo.geom.Rect_p.xyOutset = function (dx_min, dy_min, dx_max, dy_max) {
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
eYo.geom.Rect_p.xyContains = function (x, y) {
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
eYo.geom.Rect_p.unionRect = function (rect) {
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
eYo.geom.Rect_p.intersectionRect = function (rect) {
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

// /**
//  * Convenient creator.
//  * @param {Number} x  x coordinate
//  * @param {Number} y  y coordinate
//  * @param {Number} width  x coordinate
//  * @param {Number} height  y coordinate
//  * @return {eYo.geom.Rect} The newly created rect instance.
//  */
// eYo.geom._p.xyRect = function (x = 0, y = 0, width = 0, height = 0) {
//   return new eYo.geom.Rect().pSet(x, y, width, height)
// }

// /**
//  * Computes the difference regions between two rectangles. The return value is
//  * an array of 0 to 4 rectangles defining the remaining regions of the first
//  * rectangle after the second has been subtracted.
//  * The only difference with closure implementation is that we keep track
//  * of the rectangles order: 0 -> above, 1 -> below, 2 -> left, 3 -> right
//  * SEE: https://github.com/google/closure-library/blob/master/closure/goog/math/rect.js#L272
//  * @param {eYo.geom.Rect} a A Rectangle.
//  * @param {eYo.geom.Rect} b A Rectangle.
//  * @return {!Array<?eYo.geom.Rect>} An array with 4 rectangles which
//  *     together define the difference area of rectangle a minus rectangle b.
//  */
// eYo.geom._p.deltaRect = function(a, b) {
//   var ans = [null, null, null, null]

//   var top = a.top
//   var height = a.height

//   var a_right = a.left + a.width
//   var a_bottom = a.top + a.height

//   var b_right = b.left + b.width
//   var b_bottom = b.top + b.height

//   if (a_bottom <= b.top) { // b is entirely below a
//     ans[0] = new eYo.geom.Rect(a)
//     return
//   }
//   // b.top < a_bottom
//   if (b_bottom <= a.top) {
//     ans[1] = new eYo.geom.Rect(a)
//     return
//   }
//   // a.top < b_bottom
//   // Subtract off any area on top where A extends past B
//   if (b.top > a.top) {
//     var R = ans[0] = new eYo.geom.Rect(a)
//     R.height_ = b.top - a.top
//     top = b.top
//     // If we're moving the top down, we also need to subtract the height diff.
//     height -= b.top - a.top
//   }
//   // Subtract off any area on bottom where A extends past B
//   // We have b.top < a_bottom and only one of
//   // b.top < b_bottom < a_bottom
//   // b.top < a_bottom <= b_bottom
//   if (b_bottom < a_bottom) {
//     R = ans[1] = new eYo.geom.Rect(a)
//     R.y_ = b_bottom
//     R.height_ = a_bottom - b_bottom
//     height = b_bottom - top
//   }
//   if (b.right <= a.left) {
//     // no intersection
//     ans[2] = new eYo.geom.Rect(a)
//     return
//   }
//   // a.left < b.right
//   if (a.right <= b.left) {
//     // no intersection
//     ans[3] = new eYo.geom.Rect(a)
//     return
//   }
//   // b.left < a.right
//   // Subtract any area on left where A extends past B
//   // We have a.left < b.right and only one of
//   // a.left < b.left < b.right
//   // b.left <= a.left < b.right
//   if (a.left < b.left) {
//     R = ans[2] = new eYo.geom.Rect(a)
//     R.width_ = b.left - a.left
//     R.height_ = height
//   }
//   // Subtract any area on right where A extends past B
//   // We have b.left < a.right and only one of
//   // b.left < b.right < a.right
//   // b.left < a.right <= b.right
//   if (b_right < a_right) {
//     ans[3] = eYo.xyRect(_right, top, a_right - b_right, height)
//   }
//   return ans
// }

// /**
//  * Computes the intersection of the rectangle a and the rectangle b.
//  * When the intersection is void, the return value is `eYo.NA`.
//  * When the rectangles are side by side, the return rectangle has
//  * either 0 width or 0 height,
//  * thus representing either a segment or a point.
//  * Both rectangles are expected to have the same constructor.
//  * A new rectangle is returned when there is
//  * a-n intersection, otherwise `eYo.NA` is returnde.
//  * @param {eYo.geom.Rect} a - A Rectangle.
//  * @param {eYo.geom.Rect} b - A Rectangle.
//  * @return {eYo.geom.Rect}
//  */
// eYo.geom._p.intersectionRect = function(a, b) {
//   var x_min = Math.max(a.x_min, b.x_min)
//   var width = Math.min(a.x_max, b.x_max) - x_min
//   if (width >= 0) {
//     var y_min = Math.max(a.y_min, b.y_min)
//     var height = Math.min(a.y_max, b.y_max) - y_min
//     if (height >= 0) {
//       return new eYo.geom.Rect().pSet(x_min, y_min, width, height)
//     }
//   }
//   return eYo.NA
// }

// /**
//  * Test container.
//  * Returns true iff the receiver is inside the given rect.
//  * Rounding errors are taken into account.
//  * @param {eYo.geom.Rect} rect
//  * @return {Boolean}
//  */
// eYo.geom.Point_p.in = function (rect) {
//   return eYo.greater(this.c, rect.c_min)
//     && eYo.greater(rect.c_max, this.c)
//     && eYo.greater(this.l, rect.l_min)
//     && eYo.greater(rect.l_max, this.l)
// }

// /**
//  * Test container.
//  * Opposite of `in`, except for the rect boundary. A point of the rect boundary is in and out the rect.
//  * Rounding errors are taken into account.
//  * @param {eYo.geom.Rect} rect
//  * @return {Boolean} non negative number
//  */
// eYo.geom.Point_p.out = function (rect) {
//   return eYo.greater(this.c, rect.c_max)
//     || eYo.greater(rect.c_min, this.c)
//     || eYo.greater(this.l, rect.l_max)
//     || eYo.greater(rect.l_min, this.l)
// }

//>>>
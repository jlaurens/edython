/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Database of all identified object.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

/**
 * Database of all identified object.
 * @name {eYo.o3d.DB}
 * @constructor
 */
eYo.o3d.newC9r('DB', {
  //<<< mochai: Basics
  //... chai.assert(eYo.o3d.DB)
  //>>>
  /**
   * 
   * @param {String} [id_key]
   * @param {Boolean} [is_owner]
   */
  prepare (key, owner, id_key, is_owner) {
    //<<< mochai: init
    if (!eYo.isStr(id_key)) {
      [id_key, is_owner] = ['id', id_key]
    }
    this.id_key__ = id_key
    this.is_owner__ = !!is_owner
    this.map__ = new Map()
    //... var db = new eYo.o3d.DB('db', eYo.test.onr)
    //... chai.expect(db.id_key__).equal('id')
    //... chai.expect(db.is_owner__).false
    //... var db = new eYo.o3d.DB('db', eYo.test.onr, 'foo')
    //... chai.expect(db.id_key__).equal('foo')
    //... chai.expect(db.is_owner__).false
    //... var db = new eYo.o3d.DB('db', eYo.test.onr, false)
    //... chai.expect(db.id_key__).equal('id')
    //... chai.expect(db.is_owner__).false
    //... var db = new eYo.o3d.DB('db', eYo.test.onr, true)
    //... chai.expect(db.id_key__).equal('id')
    //... chai.expect(db.is_owner__).true
    //... var db = new eYo.o3d.DB('db', eYo.test.onr, 'foo', false)
    //... chai.expect(db.id_key__).equal('foo')
    //... chai.expect(db.is_owner__).false
    //... var db = new eYo.o3d.DB('db', eYo.test.onr, 'foo', true)
    //... chai.expect(db.id_key__).equal('foo')
    //... chai.expect(db.is_owner__).true
    //>>>
  },
  methods: {
    /**
     * Add objects to the database.
     * @param {eYo.c3s.C9rBase} ...$
     */
    add (...$) {
      //<<< mochai: add
      if (this.is_owner__) {
        //<<< mochai: owner
        let list = $.filter(object => !eYo.isaO3d(object))
        if (list.length) {
          eYo.throw(`${this.eyo$.name}/add: object is not an eYo.O3d instance ${list[0]}`)
        }
        //... var db = new eYo.o3d.DB('db', eYo.test.onr, true)
        //... chai.expect(db.add).eyo_F
        //... chai.expect(() => {
        //...   db.add(421)
        //... }).xthrow()
        //... chai.expect(() => {
        //...   db.add(eYo.o3d.new('a', eYo.test.onr), 421)
        //... }).xthrow()
        $.forEach(object => {
          this.map__.set(object[this.id_key__], object)
          object.owner_ = this
        })
        //... var db = new eYo.o3d.DB('db', eYo.test.onr, 'key', true)
        //... var a = eYo.o3d.new('a', eYo.test.onr)
        //... var b = eYo.o3d.new('b', eYo.test.onr)
        //... db.add(a, b)
        //... chai.expect(db.map__.get('a')).equal(a)
        //... chai.expect(db.map__.get('b')).equal(b)
        //... chai.expect(a.owner).equal(db)
        //... chai.expect(b.owner).equal(db)
        //>>>
      } else {
        //<<< mochai: not owner
        $.forEach(object => {
          this.map__.set(object[this.id_key__], object)
        })
        //... var db = new eYo.o3d.DB('db', eYo.test.onr, false)
        //... var a = {id: 'a'}
        //... var b = {id: 'b'}
        //... db.add(a, b)
        //... chai.expect(db.map__.get('a')).equal(a)
        //... chai.expect(db.map__.get('b')).equal(b)
        //>>>
      }
      //>>>
    },
    /**
     * Find the object with the specified ID.
     * @param {string} id ID of object to find.
     * @return {eYo.c3s.C9rBase} The sought after object or eYo.NA if not found.
     */
    get (id) {
      //<<< mochai: get
      //... var db = new eYo.o3d.DB('db', eYo.test.onr, 'key')
      //... var a = eYo.o3d.new('2', eYo.test.onr)
      //... var b = eYo.o3d.new('3', eYo.test.onr)
      //... db.add(a, b)
      //... chai.expect(db.get('2')).equal(a)
      //... chai.expect(db.get('3')).equal(b)
      return this.map__.get(id)
      //>>>
    },
    /**
     * Iterator.
     * @param {*} [$this] - Anything except a function
     * @param {Function} f - extra arguments will be passed to `f`.
     */
    forEach ($this, f) {
      //<<< mochai: forEach
      //... var db = new eYo.o3d.DB('db', eYo.test.onr, 'key')
      //... var a = eYo.o3d.new('1', eYo.test.onr)
      //... var b = eYo.o3d.new('2', eYo.test.onr)
      //... db.add(a, b)
      if (eYo.isF($this)) {
        //<<< mochai: no $this
        f && eYo.throw(`${this.eyo$.name}/forEach: unexpected last argument (${f})`)
        //... chai.expect(() => {
        //...   db.forEach(eYo.doNothing, 1)
        //... }).xthrow()
        f = $this
        for (let value of this.map__.values()) {
          f(value)
        }
        //... db.forEach(v => eYo.flag.push('/', v.key))
        //... eYo.flag.expect('/1/2')
        //>>>
      } else {
        //<<< mochai: $this
        for (let value of this.map__.values()) {
          f.call($this, value)
        }
        //... db.forEach(eYo.test.onr, function (v) {
        //...   this.flag(v.key)
        //... })
        //... eYo.flag.expect('/1/2')
        //>>>
      }
      //>>>
    },
    /**
     * Iterator.
     * @param {*} [$this] - Anything except a function
     * @param {Function} f
     */
    some ($this, f) {
      //<<< mochai: some
      //... var db = new eYo.o3d.DB('db', eYo.test.onr, 'key')
      //... var a = eYo.o3d.new('1', eYo.test.onr)
      //... var b = eYo.o3d.new('2', eYo.test.onr)
      //... db.add(a, b)
      if (eYo.isF($this)) {
        //<<< mochai: no $this
        f && eYo.throw(`${this.eyo$.name}/forEach: unexpected last argument (${f})`)
        //... chai.expect(() => {
        //...   db.some(eYo.doNothing, 1)
        //... }).xthrow()
        f = $this
        for (let value of this.map__.values()) {
          if (f(value)) {
            return true
          }
        }
        //... chai.expect(db.some(v => v.key === '1')).true
        //... chai.expect(db.some(v => v.key === '2')).true
        //... chai.expect(db.some(v => v.key === '3')).false
        //>>>
      } else {
        //<<< mochai: $this
        for (let value of this.map__.values()) {
          if (f.call($this, value)) {
            return true
          }
        }
        //... chai.expect(db.some(eYo.test.onr, function (v) {
        //...   this.flag(v.key)
        //...   return v.key === '1'
        //... })).true
        //... eYo.flag.expect('/1')
        //... chai.expect(db.some(eYo.test.onr, function (v) {
        //...   this.flag(v.key)
        //...   return v.key === '2'
        //... })).true
        //... eYo.flag.expect('/1/2')
        //... chai.expect(db.some(eYo.test.onr, function (v) {
        //...   this.flag(v.key)
        //...   return v.key === '3'
        //... })).false
        //... eYo.flag.expect('/1/2')
        //>>>
      }
      return false
      //>>>
    },
    /**
     * Remove objects from the database.
     * @param {String} ...$
     */
    remove (...$) {
      //<<< mochai: remove
      if (this.is_owner__) {
        //<<< mochai: owner
        //... var db = new eYo.o3d.DB('db', eYo.test.onr, 'key', true)
        //... var a = eYo.o3d.new('1', eYo.test.onr)
        //... var b = eYo.o3d.new('2', eYo.test.onr)
        //... a.dispose = b.dispose = function (...$) {
        //...   eYo.flag.push(...$, this.key)
        //... }
        //... db.add(a, b)
        //... chai.expect(db.size).equal(2)
        $.forEach(object => {
          //... db.remove(a, b)
          //... chai.expect(db.size).equal(0)
          //... eYo.flag.expect(12)
          this.map__.delete(object[this.id_key__])
          object.dispose()
        })
        //>>>
      } else {
        //<<< mochai: not owner
        $.forEach(object => {
          this.map__.delete(object[this.id_key__])
        })
        //... var db = new eYo.o3d.DB('db', eYo.test.onr, 'key')
        //... var a = eYo.o3d.new('1', eYo.test.onr)
        //... var b = eYo.o3d.new('2', eYo.test.onr)
        //... db.add(a, b)
        //... chai.expect(db.size).equal(2)
        //... db.remove(a, b)
        //... chai.expect(db.size).equal(0)
        //>>>
      }
      //>>>
    },
  },
  dispose (...$) {
    //<<< mochai: dispose
    if (this.is_owner__) {
      //<<< mochai: owner
      this.forEach(v => v.dispose(...$))
      //... var db = new eYo.o3d.DB('db', eYo.test.onr, 'key', true)
      //... var a = eYo.o3d.new('1', eYo.test.onr)
      //... var b = eYo.o3d.new('2', eYo.test.onr)
      //... db.add(a, b)
      //... a.dispose = b.dispose = function (...$) {
      //...   eYo.flag.push(this.key, ...$)
      //... }
      //... db.dispose(3, 4)
      //... eYo.flag.expect(134234)
      //>>>
    }
    //<<< mochai: not owner
    this.map__.clear()
    this.map__ = this.id_key__ = eYo.NA
    //... var db = new eYo.o3d.DB('db', eYo.test.onr, 'key', true)
    //... var a = eYo.o3d.new('3', eYo.test.onr)
    //... var b = eYo.o3d.new('4', eYo.test.onr)
    //... db.add(a, b)
    //... db.dispose()
    //>>>
    //>>>
  },
})

Object.defineProperties(eYo.o3d.DB_p, {
  size: {
    get () {
      return this.map__.size
    }
  }
})

eYo.o3d.DB[eYo.$].finalizeC9r()

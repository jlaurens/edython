describe ('Tests: Property', function () {
  this.timeout(20000)
  beforeEach (function() {
    eYo.test.setup()
  })
  eYo.test.setup()
  it('P6y: get_/willChange/set_/didChange', function () {
    let p = eYo.p6y.new({
      get_ () {
        this.flag('g')
        return this.foo__
      },
      [eYo.observe.BEFORE] (before, after) {
        this.flag('b', before, after)
      },
      set_ (after) {
        this.flag('s', after)
        this.foo__ = after
      },
      [eYo.observe.AFTER] (before, after) {
        this.flag('a', before, after)
      },
    }, 'foo', eYo.test.onr)
    eYo.test.onr.foo__ = 8
    chai.expect(p.value).equal(8)
    eYo.flag.expect('/g')
    p.value_ = 9
    eYo.flag.expect('/g/b89/s9/a89')
  })
  it('P6y: lazy/didChange', function () {
    let p = eYo.p6y.new({
      lazy () {
        this.flag('l')
        return this.foo__
      },
      [eYo.observe.AFTER] (after) {
        this.flag('a', after)
      },
    }, 'foo', eYo.test.onr)
    eYo.test.onr.foo__ = 7
    chai.expect(p.value).equal(7)
    eYo.flag.expect('/l')
    p.value_ = 3
    eYo.flag.expect('/a3')
  })
  it('P6y: observe', function () {
    let p = eYo.p6y.new({}, 'foo', eYo.test.onr)
    let callback = () => {
      eYo.flag.push('x')
    }
    eYo.observe.HOOKS.forEach(when => {
      eYo.flag.reset()
      p.value_ = 123
      eYo.flag.expect()
      let o = p.addObserver(when, callback)
      p.value_ = 123
      eYo.flag.expect()
      p.value_ = 421
      eYo.flag.expect(when === eYo.observe.ANY ? 'xxx' : 'x')
      p.removeObserver(o)
      p.value_ = 123
      eYo.flag.expect()
    })
  })
  it('P6y: shared constructor/prototype', function () {
    let model = {}
    let p1 = eYo.p6y.new(model, 'foo', eYo.test.onr)
    let p2 = eYo.p6y.new(model, 'bar', eYo.test.onr)
    chai.expect(p1.constructor).equal(p2.constructor)
    chai.expect(Object.getPrototypeOf(p1)).equal(Object.getPrototypeOf(p2))
  })
  it('P6y: No getValue', function () {
    let p = eYo.p6y.new({
      get: eYo.doNothing
    }, 'foo', eYo.test.onr)
    p.value_ = 123
    chai.expect(() => {
      p.value_
    }).to.xthrow()
    chai.expect(p.value__).equal(123)
  })
  it('P6y: No setValue', function () {
    let p = eYo.p6y.new({
      set: eYo.doNothing
    }, 'foo', eYo.test.onr)
    chai.expect(() => {
      p.value_ = 123
    }).to.xthrow()
    p.value__ = 123
    chai.expect(p.value).equal(123)
  })
  it('P6y: No getStored', function () {
    let p = eYo.p6y.new({
      get_: eYo.doNothing
    }, 'foo', eYo.test.onr)
    chai.expect(() => {
      p.getStored()
    }).to.xthrow()
    chai.expect(() => {
      p.value__
    }).to.xthrow()
    chai.expect(() => {
      p.value_
    }).to.xthrow()
    chai.expect(() => {
      p.getValue()
    }).to.xthrow()
    chai.expect(() => {
      p.value_ = 123
    }).to.xthrow()
    p.stored__ = 123
    chai.expect(p.stored__).equal(123)
  })
  it('P6y: No setStored', function () {
    let p = eYo.p6y.new({
      set_: eYo.doNothing
    }, 'foo', eYo.test.onr)
    chai.expect(() => {
      p.value_ = 123
    }).to.xthrow()
    chai.expect(() => {
      p.value__ = 123
    }).to.xthrow()
    p.stored__ = 123
    chai.expect(p.value).equal(123)
  })
  it('P6y: value', function () {
    var p = eYo.p6y.new({
      value: 421,
      didChange(after) {
        eYo.flag.push(after)
      }
    }, 'foo', eYo.test.onr)
    chai.expect(p.value).equal(421)
    eYo.flag.expect()
    p = eYo.p6y.new({
      value () {
        return 421
      },
      [eYo.observe.AFTER] (after) {
        this.flag('a', after)
      }
    }, 'foo', eYo.test.onr)
    eYo.flag.reset(123)
    chai.expect(p.value).equal(421)
    eYo.flag.expect(123)
  })
  it('P6y: value + set', function () {
    var p = eYo.p6y.new({
      value: 421,
      set (builtin, after) {
        builtin(after)
      },
      [eYo.observe.AFTER] (after) {
        this.flag('a', after)
      }
    }, 'foo', eYo.test.onr)
    eYo.flag.reset(123)
    chai.expect(p.value).equal(421)
    eYo.flag.expect(123)
    p.value_ = 666
    eYo.flag.expect('/a666')
  })
  it('P6y: lazy', function () {
    var p = eYo.p6y.new({
      lazy () {
        this.flag('l')
        return 123
      }
    }, 'foo', eYo.test.onr)
    eYo.flag.expect()
    chai.expect(p.value).equal(123)
    eYo.flag.expect('/l')
  })
  it('P6y: lazy2', function () {
    var p = eYo.p6y.new({
      lazy () {
        this.flag('l')
        return 3
      }
    }, 'foo', eYo.test.onr)
    chai.expect(p.value).equal(3)
    eYo.flag.expect('/l')
    var p = eYo.p6y.new({
      lazy: 3,
      [eYo.observe.AFTER] (after) {
        this.flag('a', after)
      }
    }, 'foo', eYo.test.onr)
    chai.expect(p.value).equal(3)
    eYo.flag.expect()
    p.value_ = 3
    eYo.flag.expect()
    p.value_ = 34
    eYo.flag.expect('/a34')
    var p = eYo.p6y.new({
      lazy () {
        this.flag('l')
        return 34
      },
      [eYo.observe.AFTER] (after) {
        this.flag('a', after)
      }
    }, 'foo', eYo.test.onr)
    eYo.flag.expect()
    chai.expect(p.value).equal(34)
    eYo.flag.expect('/l')
    p.value_ = 34
    eYo.flag.expect()
    p.value_ = 3
    eYo.flag.expect('/a3')
  })
  it ('P6y: lazy reset', function () {
    var x = 3
    var p = eYo.p6y.new({
      lazy () {
        this.flag('l', x)
        return x
      },
      reset (builtin) {
        var ans = builtin()
        this.flag('r', ans)
        return ans
      },
    }, 'foo', eYo.test.onr)
    chai.expect(p.value).equal(3)
    eYo.flag.expect('/l3')
    x = 34
    chai.expect(p.getValueStart()).equal(x)
    eYo.flag.expect('/l34')
    p.setValue(p.getValueStart())
    chai.expect(p.value).equal(x)
    x = 421
    chai.expect(p.reset().after).equal(p.value).equal(x)
  })
  it('P6y: dispose', function () {
    var p = eYo.p6y.new({}, 'foo', eYo.test.onr)
    chai.expect(p.owner).equal(eYo.test.onr)
    p.value_ = 421
    eYo.flag.reset(123)
    p = p.dispose()
    eYo.flag.expect(123)
    p = eYo.p6y.new({}, 'foo', eYo.test.onr)
    p.value_ = eYo.c9r.new({
      dispose (...$) {
        eYo.flag.push('/d', ...$)
      },
    })
    p.dispose(666)
    eYo.flag.expect('/d666')
    p = eYo.p6y.new({
      dispose: false
    }, 'foo', eYo.test.onr)
    p.value_ = {
      dispose () {
        eYo.flag.reset()
      },
      eyo: true, // fake
    }
    p.dispose()
    chai.assert(eYo.test.flag.value !== 0)
  })
  it('P6y: copy', function () {
    var p = eYo.p6y.new({
      copy: true,
    }, 'foo', eYo.test.onr)
    let v = {}
    Object.defineProperty(v, 'copy', {
      get () {
        eYo.flag.push('/g')
        return self        
      }
    })
    p.value_ = v
    p.value
    eYo.flag.expect('/g')
  })
  it ('P6y: computed', function () {
    var flag = 0
    var p = eYo.p6y.new({
      get () {
        return flag
      },
    }, 'foo', eYo.test.onr)
    chai.expect(() => {
      p.value_ = 421
    }).to.xthrow()
    var p = eYo.p6y.new({
      get () {
        return flag
      },
      set (after) {
        flag = after
      },
    }, 'foo', eYo.test.onr)
    p.value_ = 421
    chai.expect(p.value).equal(421)
    chai.expect(() => {
      eYo.p6y.new({
        value: 0,
        get () {
          return flag
        },
      })
    }, 'foo', eYo.test.onr).to.xthrow()
    chai.expect(() => {
      eYo.p6y.new({
        lazy: 0,
        get () {
          return flag
        },
      }, 'foo', eYo.test.onr)
    }).to.xthrow()
    chai.expect(() => {
      eYo.p6y.new({
        reset: 0,
        get () {
          return flag
        },
      }, 'foo', eYo.test.onr)
    }).to.xthrow()
  })
  it ('P6y: cached', function () {
    var x = 421
    var p = eYo.p6y.new({
      value () {
        return x
      },
    }, 'foo', eYo.test.onr)
    chai.expect(p.value).equal(421)
    x = 123
    chai.expect(p.value).equal(421)
    p.reset()
    chai.expect(p.value).equal(123)
  })
  it ('P6y: recycle', function () {
    var x = 421
    var p = eYo.p6y.new({
      value () {
        return x
      },
    }, 'foo', eYo.test.onr)
    let value = eYo.c9r.new({
      dispose (what, how) {
        eYo.flag.push(what, how)
      }
    })
    value[eYo.$p6y] = 421
    chai.assert((p.value__ = value) === value)
    chai.expect(value[eYo.$p6y]).equal(421)
    chai.assert((p.value__ = eYo.NA) === eYo.NA)
    chai.expect(value[eYo.$p6y]).equal(421)
    delete value[eYo.$p6y]
    chai.assert((p.value__ = value) === value)
    chai.expect(value[eYo.$p6y]).equal(p)
    chai.assert((p.value__ = eYo.NA) === eYo.NA)
    chai.expect(value[eYo.$p6y]).equal(eYo.NA)
    p = eYo.p6y.new({}, 'foo', eYo.test.onr)
    value[eYo.$p6y] = 421
    chai.assert((p.value__ = value) === value)
    p.dispose(123,456)
    eYo.flag.expect()
    p = eYo.p6y.new({}, 'foo', eYo.test.onr)
    value[eYo.$p6y] = eYo.NA
    chai.assert((p.value__ = value) === value)
    p.dispose(123,456)
    eYo.flag.expect(123456)
  })
  it ('P6y: Shortcuts', function () {
    var model = 421
    let validated = eYo.p6y.C9rBase[eYo.$].modelValidate(model)
    chai.expect(eYo.isD(validated)).true
    chai.expect(validated.value()).equal(421)
  })
  it ('P6y: Observe', function () {
    var p = eYo.p6y.new({
      value: 421,
    }, 'foo', eYo.test.onr)
    chai.expect(!!p.removeObservers).true
    p = p.dispose()
  })
})

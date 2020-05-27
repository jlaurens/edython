describe ('Tests: Property', function () {
  this.timeout(10000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c9r && eYo.c9r.new({
      methods: {
        flag (what, ...$) {
          flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  })
  it('P6y: get_/willChange/set_/didChange', function () {
    let p = eYo.p6y.new({
      get_ () {
        this.flag(2)
        return this.foo__
      },
      willChange (before, after) {
        this.flag(3, before, 4, after)
      },
      set_ (after) {
        this.flag(5, after)
        this.foo__ = after
      },
      didChange (before, after) {
        this.flag(6, before, 7, after)
      },
    }, 'foo', onr)
    onr.foo__ = 8
    chai.expect(p.value).equal(8)
    flag.expect(12)
    p.value_ = 9
    flag.expect(121384915916879)
  })
  it('P6y: lazy/didChange', function () {
    let p = eYo.p6y.new({
      lazy () {
        this.flag(2)
        return this.foo__
      },
      didChange (after) {
        this.flag(2, after)
      },
    }, 'foo', onr)
    onr.foo__ = 7
    chai.expect(p.value).equal(7)
    flag.expect(12)
    p.value_ = 3
    flag.expect(123)
  })
  it('P6y: observe', function () {
    let p = eYo.p6y.new({}, 'foo', onr)
    let callback = () => {
      flag.push(666)
    }
    eYo.observe.HOOKS.forEach(when => {
      flag.reset()
      p.value_ = 123
      flag.expect()
      let o = p.addObserver(when, callback)
      p.value_ = 123
      flag.expect()
      p.value_ = 421
      flag.expect(when === eYo.observe.ANY ? 666666666 : 666)
      p.removeObserver(o)
      p.value_ = 123
      flag.expect()
    })
  })
  it('P6y: shared constructor/prototype', function () {
    let model = {}
    let p1 = eYo.p6y.new(model, 'foo', onr)
    let p2 = eYo.p6y.new(model, 'bar', onr)
    chai.expect(p1.constructor).equal(p2.constructor)
    chai.expect(Object.getPrototypeOf(p1)).equal(Object.getPrototypeOf(p2))
  })
  it('P6y: No getValue', function () {
    let p = eYo.p6y.new({
      get: eYo.doNothing
    }, 'foo', onr)
    p.value_ = 123
    chai.expect(() => {
      p.value_
    }).to.throw()
    chai.expect(p.value__).equal(123)
  })
  it('P6y: No setValue', function () {
    let p = eYo.p6y.new({
      set: eYo.doNothing
    }, 'foo', onr)
    chai.expect(() => {
      p.value_ = 123
    }).to.throw()
    p.value__ = 123
    chai.expect(p.value).equal(123)
  })
  it('P6y: No getStored', function () {
    let p = eYo.p6y.new({
      get_: eYo.doNothing
    }, 'foo', onr)
    chai.expect(() => {
      p.getStored()
    }).to.throw()
    chai.expect(() => {
      p.value__
    }).to.throw()
    chai.expect(() => {
      p.value_
    }).to.throw()
    chai.expect(() => {
      p.getValue()
    }).to.throw()
    chai.expect(() => {
      p.value_ = 123
    }).to.throw()
    p.stored__ = 123
    chai.expect(p.stored__).equal(123)
  })
  it('P6y: No setStored', function () {
    let p = eYo.p6y.new({
      set_: eYo.doNothing
    }, 'foo', onr)
    chai.expect(() => {
      p.value_ = 123
    }).to.throw()
    chai.expect(() => {
      p.value__ = 123
    }).to.throw()
    p.stored__ = 123
    chai.expect(p.value).equal(123)
  })
  it('P6y: value', function () {
    var p = eYo.p6y.new({
      value: 421,
      didChange(after) {
        flag.push(after)
      }
    }, 'foo', onr)
    chai.expect(p.value).equal(421)
    flag.expect()
    p = eYo.p6y.new({
      value () {
        return 421
      },
      didChange(after) {
        flag.push(after)
      }
    }, 'foo', onr)
    flag.reset(123)
    chai.expect(p.value).equal(421)
    flag.expect(123)
  })
  it('P6y: value + set', function () {
    var p = eYo.p6y.new({
      value: 421,
      set (builtin, after) {
        builtin(after)
      },
      didChange(after) {
        flag.push(after)
      }
    }, 'foo', onr)
    flag.reset(123)
    chai.expect(p.value).equal(421)
    flag.expect(123)
    p.value_ = 666
    flag.expect(666)
  })
  it('P6y: lazy', function () {
    var p = eYo.p6y.new({
      lazy () {
        flag.push(421)
        return 123
      }
    }, 'foo', onr)
    flag.expect()
    chai.expect(p.value).equal(123)
    flag.expect(421)
  })
  it('P6y: lazy2', function () {
    var p = eYo.p6y.new({
      lazy () {
        this.flag(2)
        return 3
      }
    }, 'foo', onr)
    flag.reset()
    chai.expect(p.value).equal(3)
    flag.expect(12)
    var p = eYo.p6y.new({
      lazy: 3,
      didChange(after) {
        this.flag(2, after)
      }
    }, 'foo', onr)
    chai.expect(p.value).equal(3)
    flag.expect()
    p.value_ = 3
    flag.expect()
    p.value_ = 34
    flag.expect(1234)
  })
  it ('P6y: lazy reset', function () {
    var x = 3
    var p = eYo.p6y.new({
      lazy () {
        this.flag(2, x)
        return x
      },
      reset (builtin) {
        var ans = builtin()
        this.flag(3, ans)
        return ans
      },
    }, 'foo', onr)
    chai.expect(p.value).equal(3)
    flag.expect(123)
    x = 34
    chai.expect(p.getValueStart()).equal(x)
    flag.expect(1234)
    p.setValue(p.getValueStart())
    chai.expect(p.value).equal(x)
    x = 421
    chai.expect(p.reset().after).equal(p.value).equal(x)
  })
  it('P6y: dispose', function () {
    var p = eYo.p6y.new({}, 'foo', onr)
    chai.expect(p.owner).equal(onr)
    p.value_ = 421
    flag.reset(123)
    p = p.dispose()
    flag.expect(123)
    p = eYo.p6y.new({}, 'foo', onr)
    p.value_ = eYo.c9r.new({
      dispose (what) {
        flag.push(what)
      },
    })
    p.dispose(666)
    flag.expect(666)
    p = eYo.p6y.new({
      dispose: false
    }, 'foo', onr)
    p.value_ = {
      dispose () {
        flag = 0
      },
      eyo: true, // fake
    }
    p.dispose()
    chai.assert(flag !== 0)
  })
  it('P6y: copy', function () {
    var p = eYo.p6y.new({
      copy: true,
    }, 'foo', onr)
    let v = {}
    Object.defineProperty(v, 'copy', {
      get () {
        flag.push(456)
        return self        
      }
    })
    p.value_ = v
    p.value
    flag.expect(456)
  })
  it ('P6y: computed', function () {
    var flag = 0
    var p = eYo.p6y.new({
      get () {
        return flag
      },
    }, 'foo', onr)
    chai.expect(() => {
      p.value_ = 421
    }).to.throw()
    var p = eYo.p6y.new({
      get () {
        return flag
      },
      set (after) {
        flag = after
      },
    }, 'foo', onr)
    p.value_ = 421
    chai.expect(p.value).equal(421)
    chai.expect(() => {
      eYo.p6y.new({
        value: 0,
        get () {
          return flag
        },
      })
    }, 'foo', onr).to.throw()
    chai.expect(() => {
      eYo.p6y.new({
        lazy: 0,
        get () {
          return flag
        },
      }, 'foo', onr)
    }).to.throw()
    chai.expect(() => {
      eYo.p6y.new({
        reset: 0,
        get () {
          return flag
        },
      }, 'foo', onr)
    }).to.throw()
  })
  it ('P6y: cached', function () {
    var x = 421
    var p = eYo.p6y.new({
      value () {
        return x
      },
    }, 'foo', onr)
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
    }, 'foo', onr)
    let value = eYo.c9r.new({
      dispose (what, how) {
        flag.push(what, how)
      }
    })
    value.eyo_p6y = 421
    chai.assert((p.value__ = value) === value)
    chai.expect(value.eyo_p6y).equal(421)
    chai.assert((p.value__ = eYo.NA) === eYo.NA)
    chai.expect(value.eyo_p6y).equal(421)
    delete value.eyo_p6y
    chai.assert((p.value__ = value) === value)
    chai.expect(value.eyo_p6y).equal(p)
    chai.assert((p.value__ = eYo.NA) === eYo.NA)
    chai.expect(value.eyo_p6y).equal(eYo.NA)
    p = eYo.p6y.new({}, 'foo', onr)
    value.eyo_p6y = 421
    chai.assert((p.value__ = value) === value)
    p.dispose(123,456)
    flag.expect()
    p = eYo.p6y.new({}, 'foo', onr)
    value.eyo_p6y = eYo.NA
    chai.assert((p.value__ = value) === value)
    p.dispose(123,456)
    flag.expect(123456)
  })
  it ('P6y: Shortcuts', function () {
    var model = 421
    let validated = eYo.p6y.BaseC9r.eyo.modelValidate(model)
    chai.expect(eYo.isD(validated)).true
    chai.expect(validated.value()).equal(421)
  })
  it ('P6y: Observe', function () {
    var p = eYo.p6y.new({
      value: 421,
    }, 'foo', onr)
    chai.expect(!!p.removeObservers).true
    p = p.dispose()
  })
})

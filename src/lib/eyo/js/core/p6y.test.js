describe ('Tests: Property', function () {
  this.timeout(10000)
  it ('POC: function arguments', function () {
    chai.assert((() => {}).length === 0)
    chai.assert(((x) => {}).length === 1)
    chai.expect((function () {}).length).equal(0)
    chai.expect((function (x) {}).length).equal(1)
  })
  it ('P6y: Basic', function () {
    chai.assert(eYo.p6y)
  })
  it('P6y: {}', function () {
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {})
    chai.assert(eYo.isNA(p.value))
    chai.expect(p.key).equal('foo')
    chai.expect(() => {
      p.value = 421
    }).to.throw()
    p.value_ = 421
    chai.expect(p.value).equal(421)
  })
  it('P6y: value', function () {
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {})
    p.value_ = 421
    chai.expect(p.value).equal(421)
    chai.expect(p.value_).equal(421)
    chai.expect(p.value__).equal(421)
    chai.expect(p.stored__).equal(421)
  })
  it('P6y: dispose', function () {
    var flag = 0
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {})
    let value = {
      eyo: true,
      dispose () {
        flag = 421
      }
    }
    p.value_ = value
    chai.expect(p.value).equal(value)
    p.dispose()
    chai.assert(eYo.isNA(p.value))
    chai.expect(flag).equal(421)
  })
  it('P6y: {set_ (builtin, after) ...}', function () {
    console.warn('WHAT?')
    var flag = 0
    let onr = {
      do_it (what) {
        flag = what
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {
      set_ (builtin, after) {
        builtin(after)
        this.do_it(421)
      }
    })
    p.value_ = 123
    chai.expect(p.value).equal(123)
    chai.expect(flag).equal(421)
  })
  it('P6y: {get_ (builtin) ...}', function () {
    var flag = 0
    let onr = {
      do_it (what) {
        flag = what
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {
      get_ (builtin) {
        this.do_it(421)
        return builtin()
      }
    })
    p.value_ = 123
    chai.expect(p.value).equal(123)
    chai.expect(flag).equal(421)
  })
  it('P6y: {set_:..., get_:...}', function () {
    var flag = 0
    let onr = {
      do_it (what) {
        flag = what
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {
      set_ (after) {
        this.do_it(after)
        flag = after
      },
      get_ () {
        this.do_it(flag)
        return flag
      },
    })
    p.value_ = 123
    chai.expect(flag).equal(123)
    chai.expect(p.value).equal(123)
    p.value__ = 421
    chai.expect(flag).equal(421)
    chai.expect(p.value).equal(421)
  })
  it('P6y: {get (builtin) ...}', function () {
    var flag = 0
    let onr = {
      do_it (what) {
        flag = what
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {
      get (builtin) {
        this.do_it(421)
        return builtin()
      }
    })
    p.value__ = 123
    chai.expect(p.value).equal(123)
    chai.expect(flag).equal(421)
  })
  it('P6y: {set:...}', function () {
    var flag = 0
    let onr = {
      do_it (what) {
        flag = what
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {
      get () {
        this.do_it(flag)
        return flag
      },
      set (after) {
        this.do_it(after)
        flag = after
      },
    })
    p.value_ = 123
    chai.expect(flag).equal(123)
    chai.expect(p.value).equal(123)
    chai.expect(p.value_).equal(123)
    chai.expect(p.value__).equal(123)
    chai.expect(p.stored__).equal(eYo.NA)
    p.value__ = 421
    chai.expect(flag).equal(421)
    chai.expect(p.value).equal(421)
    chai.expect(p.value_).equal(421)
    chai.expect(p.value__).equal(421)
    chai.expect(p.stored__).equal(eYo.NA)
    p.stored__ = 123
    chai.expect(flag).equal(421)
    chai.expect(p.value).equal(421)
    chai.expect(p.value_).equal(421)
    chai.expect(p.value__).equal(421)
    chai.expect(p.stored__).equal(123)
  })
  it('P6y: {set (builtin):...}', function () {
    var flag = 0
    let onr = {
      do_it (what) {
        flag = what
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {
      set (builtin, after) {
        this.do_it(after)
        builtin(flag = after)
      },
      get (builtin) {
        this.do_it(flag)
        return flag*1000+builtin()
      },
    })
    p.value_ = 123
    chai.expect(flag).equal(123)
    chai.expect(p.value__).equal(123)
    chai.expect(p.stored__).equal(123)
    chai.expect(p.value).equal(123123)
    chai.expect(p.value_).equal(123123)
    p.value__ = 421
    chai.expect(flag).equal(123)
    chai.expect(p.value__).equal(421)
    chai.expect(p.stored__).equal(421)
    chai.expect(p.value).equal(123421)
    chai.expect(p.value_).equal(123421)
  })
  it('P6y: validate(after)...', function () {
    var flag = 0
    let onr = {
      do_it (what) {
        flag = what
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {
      validate (after) {
        this.do_it(after)
        return 10 * after
      },
    })
    p.value_ = 123
    chai.expect(p.value).equal(1230)
    chai.expect(flag).equal(123)
  })
  it('P6y: validate(before, after)...', function () {
    var flag = 0
    let onr = {
      do_it (what) {
        flag = what
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {
      validate (before, after) {
        this.do_it(after)
        return 10 * after
      },
    })
    p.value_ = 123
    chai.expect(p.value).equal(1230)
    chai.expect(flag).equal(123)
  })
  it('P6y: fooValidate', function () {
    var flag = 0
    let onr = {
      fooValidate (before, after) {
        flag = after
        return after
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {})
    chai.expect(p.owner).equal(onr)
    p.value_ = 123
    chai.expect(flag).equal(123)
  })
  it('P6y: fooValidate(INVALID)', function () {
    var flag = 0
    let onr = {
      fooValidate (before, after) {
        this.do_it(after)
        return eYo.INVALID
      },
      do_it (what) {
        flag = what
      },
    }
    let p = eYo.p6y.new(onr, 'foo', {})
    p.value_ = 123
    chai.expect(flag).equal(123)
    chai.expect(p.value_).equal(eYo.NA)
  })
  it('P6y: willChange(after)...', function () {
    var flag = 0
    let onr = {
      do_it (what) {
        flag = what
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {
      willChange (after) {
        this.do_it(1 + after*10)
      },
    })
    p.value_ = 123
    chai.expect(flag).equal(1 + p.value * 10)
  })
  it('P6y: willChange(before, after)...', function () {
    var flag = 0
    let onr = {
      do_it (what) {
        flag = what
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {
      willChange (before, after) {
        this.do_it(1 + after*10)
      },
    })
    p.value_ = 123
    chai.expect(flag).equal(1 + p.value * 10)
  })
  it('P6y: atChange(after)...', function () {
    var flag = 0
    let onr = {
      do_it (what) {
        flag = what
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {
      atChange (after) {
        this.do_it(1 + after*10)
      },
    })
    p.value_ = 123
    chai.expect(flag).equal(1 + p.value * 10)
  })
  it('P6y: atChange(before, after)...', function () {
    var flag = 0
    let onr = {
      do_it (what) {
        flag = what
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {
      atChange (before, after) {
        this.do_it(1 + after*10)
      },
    })
    p.value_ = 123
    chai.expect(flag).equal(1 + p.value * 10)
  })
  it('P6y: didChange(after)...', function () {
    var flag = 0
    let onr = {
      do_it (what) {
        flag = what
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {
      didChange (after) {
        this.do_it(1 + after*10)
      },
    })
    p.value_ = 123
    chai.expect(flag).equal(1 + p.value * 10)
  })
  it('P6y: didChange(before, after)...', function () {
    var flag = 0
    let onr = {
      do_it (what) {
        flag = what
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {
      didChange (before, after) {
        this.do_it(1 + after*10)
      },
    })
    p.value_ = 123
    chai.expect(flag).equal(1 + p.value * 10)
  })
  it('P6y: fooWillChange(before, after)...', function () {
    var flag = 0
    let onr = {
      fooWillChange (before, after) {
        this.do_it(after)
      },
      do_it (what) {
        flag = what
      },
    }
    let p = eYo.p6y.new(onr, 'foo', {})
    p.value_ = 123
    chai.expect(flag).equal(p.value)
  })
  it('P6y: fooAtChange(before, after)...', function () {
    var flag = 0
    let onr = {
      fooAtChange (before, after) {
        this.do_it(after)
      },
      do_it (what) {
        flag = what
      },
    }
    let p = eYo.p6y.new(onr, 'foo', {})
    p.value_ = 123
    chai.expect(flag).equal(p.value)
  })
  it('P6y: fooDidChange(before, after)...', function () {
    var flag = 0
    let onr = {
      fooDidChange (before, after) {
        this.do_it(after)
      },
      do_it (what) {
        flag = what
      },
    }
    let p = eYo.p6y.new(onr, 'foo', {})
    p.value_ = 123
    chai.expect(flag).equal(p.value)
  })
  it('P6y: observe', function () {
    var flag
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {})
    let callback = () => {
      flag = 666
    }
    eYo.p6y.HOOKS.forEach(when => {
      flag = 0
      p.value_ = 123
      chai.expect(flag).equal(0)
      p.addObserver(callback, when)
      p.value_ = 123
      chai.expect(flag).equal(0)
      p.value_ = 421
      chai.expect(flag).equal(666)
      flag = 0
      p.removeObserver(callback, when)
      p.value_ = 123
      chai.expect(flag).equal(0)
    })
  })
  it('P6y: shared constructor/prototype', function () {
    let onr = {}
    let model = {}
    let p1 = eYo.p6y.new(onr, 'foo', model)
    let p2 = eYo.p6y.new(onr, 'bar', model)
    chai.expect(p1.constructor).equal(p2.constructor)
    chai.expect(Object.getPrototypeOf(p1)).equal(Object.getPrototypeOf(p2))
  })
  it('P6y: get only', function () {
    let onr = {}
    var flag = 421
    let p = eYo.p6y.new(onr, 'foo', {
      get () {
        return flag
      }
    })
    chai.expect(p.value === 421)
    chai.expect(p.value_ === 421)
    chai.expect(p.value__ === 421)
    chai.expect(() => {
      p.value_ = 123
    }).to.throw()
    chai.expect(() => {
      p.value__ = 123
    }).to.throw()
  })
  it('P6y: No getValue', function () {
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      get: eYo.doNothing
    })
    p.value_ = 123
    chai.expect(() => {
      p.value_
    }).to.throw()
    chai.expect(p.value__).equal(123)
  })
  it('P6y: No setValue', function () {
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      set: eYo.doNothing
    })
    chai.expect(() => {
      p.value_ = 123
    }).to.throw()
    p.value__ = 123
    chai.expect(p.value).equal(123)
  })
  it('P6y: No getStored', function () {
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      get_: eYo.doNothing
    })
    chai.expect(() => {
      p.value_ = 123
    }).to.throw()
    chai.expect(() => {
      p.value__
    }).to.throw()
    chai.expect(() => {
      p.value_
    }).to.throw()
    p.stored__ = 123
    chai.expect(p.stored__).equal(123)
  })
  it('P6y: No setStored', function () {
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      set_: eYo.doNothing
    })
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
    flag = 123
    let onr = {}
    var p = eYo.p6y.new(onr, 'foo', {
      value: 421,
      didChange(after) {
        flag = after
      }
    })
    chai.expect(p.value).equal(421)
    chai.assert(flag !== 421)
    p = eYo.p6y.new(onr, 'foo', {
      value () {
        return 421
      },
      didChange(after) {
        flag = after
      }
    })
    chai.expect(p.value).equal(421)
    chai.assert(flag !== 421)
  })
  it('P6y: lazy', function () {
    var flag = 0
    let onr = {}
    var p = eYo.p6y.new(onr, 'foo', {
      lazy () {
        flag = 421
        return 123
      }
    })
    chai.assert(flag !== 421)
    chai.expect(p.value).equal(123)
    chai.expect(flag).equal(421)
  })
  it('P6y: lazy2', function () {
    var flag = 123
    let onr = {}
    var p = eYo.p6y.new(onr, 'foo', {
      lazy () {
        this.called = flag = 421
        return 123
      }
    })
    chai.assert(flag !== 421)
    chai.assert(onr.called !== 421)
    chai.expect(p.value).equal(123)
    chai.expect(flag).equal(421)
    chai.expect(onr.called).equal(421)
    flag = 0
    var p = eYo.p6y.new(onr, 'foo', {
      lazy: 421,
      didChange(after) {
        flag = after
      }
    })
    chai.expect(p.value).equal(421)
    chai.assert(flag !== 421)
    p.value_ = 123
    chai.expect(flag).equal(123)
    p = eYo.p6y.new(onr, 'foo', {
      lazy () {
        return 421
      },
      didChange(after) {
        flag = after
      }
    })
    chai.expect(p.value).equal(421)
    chai.assert(flag !== 421)
  })
  it ('P6y: lazy reset', function () {
    let onr = {
      eyo: true
    }
    var flag = 421
    var p = eYo.p6y.new(onr, 'foo', {
      lazy () {
        return flag
      },
      reset (builtin) {
        flag += 100
        builtin()
      },
    })
    chai.expect(p.value).equal(421)
    p.value_ = 123
    chai.expect(p.value).equal(123)
    flag = 666
    chai.expect(p.start()).equal(flag)
    p.setValue(p.start())
    chai.expect(p.value).equal(flag)
    flag = 421
    p.reset()
    chai.expect(p.value).equal(flag)
  })
  it('P6y: dispose', function () {
    flag = 123
    let onr = {}
    var p = eYo.p6y.new(onr, 'foo', {})
    chai.expect(p.owner).equal(onr)
    p.value_ = 421
    p = p.dispose()
    chai.assert(flag !== 0)
    p = eYo.p6y.new(onr, 'foo', {})
    p.value_ = {
      dispose (what) {
        flag = what || 0
      },
      eyo: true, // fake
    }
    p.dispose(666)
    chai.expect(flag).equal(666)
    flag = 421
    p = eYo.p6y.new(onr, 'foo', {
      dispose: false
    })
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
    flag = 123
    let onr = {}
    var p = eYo.p6y.new(onr, 'foo', {
      copy: true,
    })
    let v = {}
    Object.defineProperty(v, 'copy', {
      get () {
        flag = 0
        return self        
      }
    })
    p.value_ = v
    p.value
    chai.expect(flag).equal(0)
  })
  it ('P6y: computed', function () {
    let onr = {
      eyo: true
    }
    var flag = 0
    var p = eYo.p6y.new(onr, 'foo', {
      get () {
        return flag
      },
    })
    chai.expect(() => {
      p.value_ = 421
    }).to.throw()
    var p = eYo.p6y.new(onr, 'foo', {
      get () {
        return flag
      },
      set (after) {
        flag = after
      },
    })
    p.value_ = 421
    chai.expect(p.value).equal(421)
    chai.expect(() => {
      eYo.p6y.new(onr, 'foo', {
        value: 0,
        get () {
          return flag
        },
      })
    }).to.throw()
    chai.expect(() => {
      eYo.p6y.new(onr, 'foo', {
        lazy: 0,
        get () {
          return flag
        },
      })
    }).to.throw()
    chai.expect(() => {
      eYo.p6y.new(onr, 'foo', {
        reset: 0,
        get () {
          return flag
        },
      })
    }).to.throw()
  })
  it ('P6y: reset', function () {
    let onr = {
      eyo: true
    }
    var flag = 421
    var p = eYo.p6y.new(onr, 'foo', {
      reset () {
        return flag
      },
    })
    chai.expect(p.value).equal(421)
    p.value_ = 123
    chai.expect(p.value).equal(123)
    flag = 666
    p.reset()
    chai.expect(p.value).equal(666)
  })
  it ('P6y: cached', function () {
    let onr = {
      eyo: true
    }
    var flag = 421
    var p = eYo.p6y.new(onr, 'foo', {
      value () {
        return flag
      },
    })
    chai.expect(p.value).equal(421)
    flag = 123
    chai.expect(p.value).equal(421)
    p.reset()
    chai.expect(p.value).equal(123)
  })
  it ('P6y: recycle', function () {
    let onr = {
      eyo: true
    }
    var flag = 421
    var p = eYo.p6y.new(onr, 'foo', {
      value () {
        return flag
      },
    })
    var flag_what = 0
    var flag_how = 0
    let value = {
      eyo: true,
      eyo_p6y: 421,
      dispose (what, how) {
        flag_what = what
        flag_how = how
      }
    }
    chai.assert((p.value__ = value) === value)
    chai.expect(value.eyo_p6y).equal(421)
    chai.assert((p.value__ = eYo.NA) === eYo.NA)
    chai.expect(value.eyo_p6y).equal(421)
    value.eyo_p6y = eYo.NA
    chai.assert((p.value__ = value) === value)
    chai.expect(value.eyo_p6y).equal(p)
    chai.assert((p.value__ = eYo.NA) === eYo.NA)
    chai.expect(value.eyo_p6y).equal(eYo.NA)

    p = eYo.p6y.new(onr, 'foo', {})
    value.eyo_p6y = 421
    chai.assert((p.value__ = value) === value)
    p.dispose(123,456)
    chai.expect(flag_what).equal(0)
    chai.expect(flag_how).equal(0)

    p = eYo.p6y.new(onr, 'foo', {})
    value.eyo_p6y = eYo.NA
    chai.assert((p.value__ = value) === value)
    p.dispose(123,456)
    chai.expect(flag_what).equal(123)
    chai.expect(flag_how).equal(456)
  })
  it ('P6y: List splice...', function () {
    let onr = {
      eyo: true
    }
    var flag = 421
    var l = new eYo.p6y.List(onr, 'a', 'b', 'c')
    let test = (l, ra) => {
      chai.expect(l.length).equal(ra.length)
      for (let i = 0 ; i < Math.max(ra.length, l.length) ; i++) {
        chai.expect(l.values[i]).equal(ra[i])
        chai.expect(l.values[-i-1]).equal(ra[ra.length - i - 1])
      }
    }
    var ra = ['a', 'b', 'c']
    chai.expect(l.length).equal(ra.length)
    test(l, ['a', 'b', 'c'])
    var deleted = l.splice(0, 1)
    test(l, ['b', 'c'])
    chai.expect(deleted[0]).equal('a')
    l.splice(0, 0, deleted[0])
    test(l, ['a', 'b', 'c'])
    var deleted = l.splice(1, 1)
    test(l, ['a', 'c'])
    chai.expect(deleted[0]).equal('b')
    l.splice(1, 0, deleted[0])
    test(l, ['a', 'b', 'c'])
    var deleted = l.splice(2, 1)
    test(l, ['a', 'b'])
    chai.expect(deleted[0]).equal('c')
    l.splice(2, 0, deleted[0])
    test(l, ['a', 'b', 'c'])
  })
  it ('P6y: List dispose...', function () {
    let onr = {
      eyo: true
    }
    var flag = 0
    var l = new eYo.p6y.List(onr, '', {})
    l.splice(0, 0, {
      eyo: true,
      dispose (x) {
        flag += x
      }
    })
    l.splice(0, 0, {
      eyo: false,
      dispose (x) {
        flag += 1000*x
      }
    })
    l.splice(0, 0, 421)
    l.dispose(123)
    chai.expect(flag).equal(123)
    chai.assert(eYo.isNA(l.values[0]))
    chai.assert(eYo.isNA(l.properties[0]))
  })
  it ('P6y: Shortcuts', function () {
    var model = {
      properties: {
        foo: 0,
      }
    }
    eYo.model.expand(model)
    console.error('BREAK')
    chai.assert(eYo.isD(model.properties.foo))
  })
})

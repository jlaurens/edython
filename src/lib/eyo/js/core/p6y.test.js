describe ('Tests: Property', function () {
  this.timeout(10000)
  it ('Property: Basic', function () {
    chai.assert(eYo.p6y)
  })
  it('Property: {}', function () {
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {})
    chai.assert(eYo.isNA(p.value))
    chai.assert(p.key === 'foo')
    chai.expect(() => {
      p.value = 421
    }).to.throw()
    p.value_ = 421
    chai.assert(p.value === 421)
  })
  it('Property: value', function () {
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {})
    p.value_ = 421
    chai.assert(p.value === 421)
    chai.assert(p.value_ === 421)
    chai.assert(p.value__ === 421)
    chai.assert(p.stored__ === 421)
  })
  it('Property: dispose', function () {
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
    chai.assert(p.value === value)
    p.dispose()
    chai.assert(eYo.isNA(p.value))
    chai.assert(flag === 421)
  })
  it('Property: {set_ (builtin, after) ...}', function () {
    console.warn('WHAT?')
    var flag = 0
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      set_ (builtin, after) {
        builtin(after)
        flag = 421
      }
    })
    p.value_ = 123
    chai.assert(p.value === 123)
    chai.assert(flag === 421)
  })
  it('Property: {get_ (builtin) ...}', function () {
    var flag = 0
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      get_ (builtin) {
        flag = 421
        return builtin()
      }
    })
    p.value_ = 123
    chai.assert(p.value === 123)
    chai.assert(flag === 421)
  })
  it('Property: {set_:...}', function () {
    var flag = 0
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      set_ (after) {
        flag = after
      },
      get_ () {
        return flag
      },
    })
    p.value_ = 123
    chai.assert(flag === 123)
    chai.assert(p.value === 123)
    p.value__ = 421
    chai.assert(p.value === 421)
  })
  it('Property: {get (builtin) ...}', function () {
    var flag = 0
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      get (builtin) {
        flag = 421
        return builtin()
      }
    })
    p.value__ = 123
    chai.assert(p.value === 123)
    chai.assert(flag === 421)
  })
  it('Property: {set:...}', function () {
    var flag = 0
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      set (after) {
        flag = after
      },
      get () {
        return flag
      },
    })
    p.value_ = 123
    chai.assert(flag === 123)
    chai.assert(p.value === 123)
    chai.assert(p.value_ === 123)
    chai.assert(p.value__ === eYo.NA)
    chai.assert(p.stored__ === eYo.NA)
    p.value__ = 421
    chai.assert(flag === 123)
    chai.assert(p.value === 123)
    chai.assert(p.value_ === 123)
    chai.assert(p.value__ === 421)
    chai.assert(p.stored__ === 421)
  })
  it('Property: {set ():...}', function () {
    var flag = 0
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      set (builtin, after) {
        builtin(flag = after)
      },
      get (builtin) {
        return flag*1000+builtin()
      },
    })
    p.value_ = 123
    chai.assert(flag === 123)
    chai.assert(p.value__ === 123)
    chai.assert(p.stored__ === 123)
    chai.assert(p.value === 123123)
    chai.assert(p.value_ === 123123)
    p.value__ = 421
    chai.assert(flag === 123)
    chai.assert(p.value__ === 421)
    chai.assert(p.stored__ === 421)
    chai.assert(p.value === 123421)
    chai.assert(p.value_ === 123421)
  })
  it('Property: validate(after)...', function () {
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      validate (after) {
        return 10 * after
      },
    })
    p.value_ = 123
    chai.assert(p.value === 1230)
  })
  it('Property: validate(before, after)...', function () {
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      validate (before, after) {
        return 10 * after
      },
    })
    p.value_ = 123
    chai.assert(p.value === 1230)
  })
  it('Property: fooValidate', function () {
    var flag = 0
    let onr = {
      fooValidate (before, after) {
        flag = after
        return after
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {})
    chai.assert(p.owner === onr)
    p.value_ = 123
    chai.assert(flag === 123)
  })
  it('Property: fooValidate(INVALID)', function () {
    var flag = 0
    let onr = {
      fooValidate (before, after) {
        flag = after
        return eYo.INVALID
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {})
    p.value_ = 123
    chai.assert(flag === 123)
    chai.assert(p.value_ === eYo.NA)
  })
  it('Property: willChange(after)...', function () {
    var flag = 0
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      willChange (after) {
        flag = 1 + after*10
      },
    })
    p.value_ = 123
    chai.assert(flag === 1 + p.value * 10)
  })
  it('Property: willChange(before, after)...', function () {
    var flag = 0
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      willChange (before, after) {
        flag = 1 + after*10
      },
    })
    p.value_ = 123
    chai.assert(flag === 1 + p.value * 10)
  })
  it('Property: atChange(after)...', function () {
    var flag = 0
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      atChange (after) {
        flag = 1 + after*10
      },
    })
    p.value_ = 123
    chai.assert(flag === 1 + p.value * 10)
  })
  it('Property: atChange(before, after)...', function () {
    var flag = 0
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      atChange (before, after) {
        flag = 1 + after*10
      },
    })
    p.value_ = 123
    chai.assert(flag === 1 + p.value * 10)
  })
  it('Property: didChange(after)...', function () {
    var flag = 0
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      didChange (after) {
        flag = 1 + after*10
      },
    })
    p.value_ = 123
    chai.assert(flag === 1 + p.value * 10)
  })
  it('Property: didChange(before, after)...', function () {
    var flag = 0
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      didChange (before, after) {
        flag = 1 + after*10
      },
    })
    p.value_ = 123
    chai.assert(flag === 1 + p.value * 10)
  })
  it('Property: fooWillChange(before, after)...', function () {
    var flag = 0
    let onr = {
      fooWillChange (before, after) {
        flag = after
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {})
    p.value_ = 123
    chai.assert(flag === p.value)
  })
  it('Property: fooAtChange(before, after)...', function () {
    var flag = 0
    let onr = {
      fooAtChange (before, after) {
        flag = after
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {})
    p.value_ = 123
    chai.assert(flag === p.value)
  })
  it('Property: fooDidChange(before, after)...', function () {
    var flag = 0
    let onr = {
      fooDidChange (before, after) {
        flag = after
      }
    }
    let p = eYo.p6y.new(onr, 'foo', {})
    p.value_ = 123
    chai.assert(flag === p.value)
  })
  it('Property: observe', function () {
    var flag
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {})
    let callback = () => {
      flag = 666
    }
    eYo.p6y.HOOKS.forEach(when => {
      flag = 0
      p.value_ = 123
      chai.assert(flag === 0)
      p.addObserver(callback, when)
      p.value_ = 123
      chai.assert(flag === 0)
      p.value_ = 421
      chai.assert(flag === 666)
      flag = 0
      p.removeObserver(callback, when)
      p.value_ = 123
      chai.assert(flag === 0)
    })
  })
  it('Property: shared constructor/prototype', function () {
    let onr = {}
    let model = {}
    let p1 = eYo.p6y.new(onr, 'foo', model)
    let p2 = eYo.p6y.new(onr, 'bar', model)
    chai.assert(p1.constructor === p2.constructor)
    chai.assert(Object.getPrototypeOf(p1) === Object.getPrototypeOf(p2))
  })
  it('Property: No getValue', function () {
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      get: eYo.do.nothing
    })
    p.value_ = 123
    chai.expect(() => {
      p.value_
    }).to.throw()
    chai.assert(p.value__ === 123)
  })
  it('Property: No setValue', function () {
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      set: eYo.do.nothing
    })
    chai.expect(() => {
      p.value_ = 123
    }).to.throw()
    p.value__ = 123
    chai.assert(p.value === 123)
  })
  it('Property: No getStored', function () {
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      get_: eYo.do.nothing
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
    chai.assert(p.stored__ === 123)
  })
  it('Property: No setStored', function () {
    let onr = {}
    let p = eYo.p6y.new(onr, 'foo', {
      set_: eYo.do.nothing
    })
    chai.expect(() => {
      p.value_ = 123
    }).to.throw()
    chai.expect(() => {
      p.value__ = 123
    }).to.throw()
    p.stored__ = 123
    chai.assert(p.value === 123)
  })
  it('Property: value', function () {
    flag = 123
    let onr = {}
    var p = eYo.p6y.new(onr, 'foo', {
      value: 421,
      didChange(after) {
        flag = after
      }
    })
    chai.assert(p.value === 421)
    chai.assert(flag !== 421)
    p = eYo.p6y.new(onr, 'foo', {
      value () {
        return 421
      },
      didChange(after) {
        flag = after
      }
    })
    chai.assert(p.value === 421)
    chai.assert(flag !== 421)
  })
  it('Property: lazy', function () {
    flag = 123
    let onr = {}
    var p = eYo.p6y.new(onr, 'foo', {
      lazy: 421,
      didChange(after) {
        flag = after
      }
    })
    chai.assert(p.value === 421)
    chai.assert(flag !== 421)
    p = eYo.p6y.new(onr, 'foo', {
      lazy () {
        return 421
      },
      didChange(after) {
        flag = after
      }
    })
    chai.assert(p.value === 421)
    chai.assert(flag !== 421)
  })
  it('Property: dispose', function () {
    flag = 123
    let onr = {}
    var p = eYo.p6y.new(onr, 'foo', {})
    chai.assert(p.owner === onr)
    p.value_ = 421
    p = p.dispose()
    chai.assert(flag !== 0)
    p = eYo.p6y.new(onr, 'foo', {})
    p.value_ = {
      dispose () {
        flag = 0
      },
      eyo: true, // fake
    }
    p.dispose()
    chai.assert(flag === 0)
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
  it('Property: copy', function () {
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
    chai.assert(flag === 0)
  })
  it ('Property: computed', function () {
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
    chai.assert(p.value === 421)
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
})

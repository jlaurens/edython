describe ('Tests: Object', function () {
  this.timeout(20000)
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
  it ('O4t: POC (cache)', function () {
    let C9r = function () {}
    Object.defineProperties(C9r.prototype, {
      foo: {
        get () {
          this.foo_ = 421
          Object.defineProperties(this, {
            foo: {
              get () {
                return this.foo_
              },
              configurable: true,
            }
          })
          return 666
        }
      }
    })
    let o = new C9r()
    chai.expect(o.foo).equal(666)
    chai.expect(o.foo).equal(421)
    delete o.foo
    chai.expect(o.foo).equal(666)
    chai.expect(o.foo).equal(421)
  })
  it ('O4t: POC (target)', function () {
    let C9r = function (target) {
      this.p3y = new Proxy(target, {
        get(target, prop) {
          if (['previous', 'next'].includes(prop)) {
            return this[prop]
          } else {
            return target[prop]
          }
        },
        set: function (target, prop, value) {
          if (['previous', 'next'].includes(prop)) {
            this[prop] = value
          } else {
            target[prop] = value
          }
        },
        deleteProperty: function (target, prop) {
          if (['previous', 'next'].includes(prop)) {
            delete this[prop]
          } else {
            delete target[prop]
          }
        },
      })
    }
    let target = {
      who: 421
    }
    chai.expect(target.who).equal(421)
    let o = new C9r(target)
    let p = o.p3y
    chai.expect(p.who).equal(421)
    p.who = 123
    chai.expect(target.who).equal(123)
    delete p.who
    chai.expect(target.who).equal(eYo.NA)
    p[eYo.$previous] = 421
    chai.expect(p[eYo.$previous]).equal(421)
    chai.expect(target[eYo.$previous]).equal(eYo.NA)
    target[eYo.$previous] = 123
    chai.expect(p[eYo.$previous]).equal(421)
    chai.expect(target[eYo.$previous]).equal(123)
    delete p[eYo.$previous]
    chai.expect(p[eYo.$previous]).equal(eYo.NA)
    chai.expect(target[eYo.$previous]).equal(123)
  })
  it ('O4t: eYo.o4t.newC9r(eYo.NULL_NS, ...', function () {
    let O = eYo.o4t.newC9r(eYo.NULL_NS, 'Foo', {})
    chai.expect(O[eYo.$]).instanceof(eYo.O4t[eYo.$].constructor)
    chai.expect(O[eYo.$]).instanceof(eYo.o4t.Dlgt_p.constructor)
    let o = new O('foo', onr)
    chai.expect(o).not.undefined
    let OO = eYo.c9r.newC9r(eYo.NULL_NS, 'Bar', O, {})
    let oo = new OO('foo', onr)
    chai.assert(oo)
    chai.expect(oo).instanceof(O)
    chai.expect(oo.eyo)instanceof(O[eYo.$].constructor)
  })
  it (`O4t: eYo.o4t.newC9r(ns, 'Foo', {})`, function () {
    let ns = eYo.o4t.newNS()
    let O = eYo.o4t.newC9r(ns, 'Foo', {})
    chai.expect(O[eYo.$]).instanceof(eYo.o4t.BaseC9r[eYo.$].constructor)
    let o = new O('foo', onr)
    chai.assert(o)
    let OO = O[eYo.$newSubC9r]('Bar', {})
    chai.expect(OO[eYo.$]).instanceof(eYo.o4t.BaseC9r[eYo.$].constructor)
    let oo = new OO('foo', onr)
    chai.assert(oo)
  })
  it (`O4t: ns.newC9r('Foo', {})`, function () {
    let ns = eYo.o4t.newNS()
    ns.newC9r('A')
    let O = ns.newC9r('Foo', {})
    chai.expect(O[eYo.$]).instanceof(eYo.o4t.BaseC9r[eYo.$].constructor)
    let o = new O('foo', onr)
    chai.assert(o)
    let OO = O[eYo.$newSubC9r]('Bar', {})
    chai.expect(OO[eYo.$]).instanceof(eYo.o4t.BaseC9r[eYo.$].constructor)
    let oo = new OO('foo', onr)
    chai.assert(oo)
  })
  it ('O4t: model Shortcuts', function () {
    var model = 421
    let mf_o4t = eYo.O4t[eYo.$].modelFormat
    let mf_p6y = eYo.P6y[eYo.$].modelFormat
    let mf_p6y_alt = mf_o4t.get('properties/foo')
    chai.expect(mf_p6y_alt.fallback).equal(mf_p6y)
    var validated = mf_p6y.validate(model)
    chai.expect(eYo.isD(validated)).true
    chai.expect(validated.value()).equal(421)
    var validated = mf_p6y_alt.validate(model)
    chai.expect(eYo.isD(validated)).true
    chai.expect(validated.value()).equal(421)
    var validated = mf_o4t.validate('properties/foo', model)
    chai.expect(eYo.isD(validated)).true
    chai.expect(validated.value()).equal(421)
  })
  it ('O4t: properties(p6yModelMap)', function () {
    let ns = eYo.o4t.newNS()
    let C9r = ns.makeBaseC9r()
    chai.expect(C9r[eYo.$].p6yModelMap).equal(C9r[eYo.$].p6yModelMap)
    let Bar = ns.newC9r('bar', C9r)
    chai.expect(Bar[eYo.$].p6yModelMap).equal(Bar[eYo.$].p6yModelMap)
    C9r[eYo.$].p6yMerge({
      chi: 421
    })
    chai.expect(C9r[eYo.$].p6yModelMap).equal(C9r[eYo.$].p6yModelMap)
    chai.expect(Bar[eYo.$].p6yModelMap).equal(Bar[eYo.$].p6yModelMap)
    chai.expect(C9r[eYo.$].p6yModelMap.get('chi').value()).equal(421)
    chai.expect(Bar[eYo.$].p6yModelMap.get('chi')).eql(C9r[eYo.$].p6yModelMap.get('chi'))
  })
  it ('O4t: properties(p6y$.modelByKey)', function () {
    let ns = eYo.o4t.newNS()
    let model = {
      properties: {
        chi: 421,
      }
    }
    ns.modelMakeC9r(model, 'foo')
    let C9r = model[eYo.$C9r]
    let eyo = C9r[eYo.$]
    let p6y$ = eyo.p6y$
    chai.expect(eyo).property('p6y$modelByKey')
    chai.expect(eyo[p6y$.modelByKey].chi.value()).equal(421) // expanded
    chai.expect(eyo[p6y$.modelByKey]).equal(eyo[p6y$.modelByKey])
    let Bar = ns.newC9r('bar', C9r)
    chai.expect(eYo.isDef(Bar[eYo.$][p6y$.modelByKey].chi)).false // chi is not inherited
  })
  it ('O4t: p6yPrepare', function () {
    let O = eYo.o4t.newC9r(eYo.NULL_NS, 'Foo', {})
    chai.expect(O[eYo.$].super).equal(eYo.O4t[eYo.$])
    O[eYo.$].p6yMerge({
      foo: {
        value: 421
      },
    })
    O[eYo.$].finalizeC9r()
    var o = new O('foo', onr)
    o.eyo.p6yPrepare(o)
    chai.expect(o.p6yMap.get('foo')).not.undefined
    chai.expect(o.foo).not.equal(421)
    o.eyo.p6yInit(o)
    chai.expect(o.foo).equal(421)
    var oo = new O('foo', onr)
    oo.eyo.p6yInit(oo)
    chai.expect(oo.foo).equal(421)
  })
  it ('O4t: properties (valued)', function () {
    var O = eYo.o4t.newC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          value: 421
        },
        bar: 0,
        chi: {
          get () {
            return 666
          },
        },
      }
    })
    O[eYo.$].finalizeC9r()
    ;['foo', 'bar', 'chi'].forEach(k => chai.expect(Object.keys(O[eYo.$][O[eYo.$].p6y$.modelByKey])).include(k))
    var o = new O('foo', onr)
    chai.assert(o.foo_p)
    chai.expect(o.foo_p.owner).equal(o)
    chai.expect(o.foo_p).equal(o[o.foo_p.key + '_p'])
    chai.expect(o.foo_p.value).equal(421)
    chai.expect(o.foo).equal(421)
    o.foo_ = 123
    chai.expect(o.foo).equal(123)
    chai.assert(o.bar_p)
    chai.expect(o.bar).equal(0)
    o.bar_ = 421
    chai.expect(o.bar).equal(421)
    chai.assert(o.chi_p)
    chai.expect(o.chi).equal(666)
    chai.expect(() => {
      o.chi_ = 421
    }).throw()
  })
  it ('O4t: dispose inherited', function () {
    let ns = eYo.o4t.newNS()
    let Foo = ns.newC9r('Foo', {
      properties: {
        foo: 421,
      }
    })
    Foo[eYo.$].finalizeC9r()
    let Bar = ns.newC9r('Bar', Foo, {
      properties: {
        bar: 123,
      }
    })
    Bar[eYo.$].finalizeC9r()
    var bar = new Bar('foo', onr)
    chai.expect(bar.foo).equal(421)
    chai.expect(bar.bar).equal(123)
    bar.foo_ = eYo.c9r.new({
      dispose(x, y) {
        flag.push(x+2, y+2)
      },
    })
    bar.bar_ = eYo.c9r.new({
      dispose(x, y) {
        flag.push(x, y)
      },
    })
    bar = bar.dispose(1, 2)
    flag.expect(1234)
  })
  it ('O4t: override only get', function () {
    var x = 123
    var Foo = eYo.o4t.newC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          get () {
            return x
          },
        },
      },
    })
    Foo[eYo.$].finalizeC9r()
    var foo = new Foo('foo', onr)
    chai.expect(foo.foo).equal(x)
    var Bar = eYo.o4t.newC9r(eYo.NULL_NS, 'Bar', Foo, {
      properties: {
        foo: {
          get () {
            flag.push(1)
            return x
          },
        },
      },
    })
    Bar[eYo.$].finalizeC9r()
    var bar = new Bar('bar', onr)
    chai.expect(bar.foo).equal(x)
    flag.expect(1)
  })
  it ('O4t: override remove set', function () {
    var x = 421
    var Foo = eYo.o4t.newC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          get () {
            flag.push(1)
            return x
          },
          set (after) {
            x = after
          },
        },
      },
    })
    Foo[eYo.$].finalizeC9r()
    var foo = new Foo('foo', onr)
    chai.expect(foo.foo).equal(x)
    flag.expect(1)
    chai.assert((foo.foo_ = 123) === x)
    var Bar = eYo.o4t.newC9r(eYo.NULL_NS, 'Bar', Foo, {
      properties: {
        foo: {
          get () {
            flag.push(2)
            return x
          },
        },
      },
    })
    Bar[eYo.$].finalizeC9r()
    var bar = new Bar('bar', onr)
    chai.expect(bar.foo).equal(x)
    flag.expect(2)
    chai.expect(() => {
      bar.foo_ = 421
    }).to.throw()
  })
  it ('O4t: override add set', function () {
    var x = 421
    var Foo = eYo.o4t.newC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          get () {
            flag.push(1)
            return x
          },
        },
      },
    })
    Foo[eYo.$].finalizeC9r()
    var foo = new Foo('foo', onr)
    chai.expect(foo.foo).equal(x)
    flag.expect(1)
    chai.expect(() => {
      foo.foo_ = 421
    }).to.throw()
    var Bar = eYo.o4t.newC9r(eYo.NULL_NS, 'Bar', Foo, {
      properties: {
        foo: {
          get () {
            flag.push(2)
            return x
          },
          set (after) {
            flag.push(3, after)
            x = after
          },
        },
      },
    })
    Bar[eYo.$].finalizeC9r()
    var bar = new Bar('foo', onr)
    chai.expect(bar.foo).equal(x)
    flag.expect(2)
    chai.expect(bar.foo_ = 2).equal(x)
    flag.expect(32)
  })
  it ('O4t: inheritance', function () {
    var ns = eYo.o4t.newNS()
    ns.newC9r('A', {
      properties: {foo: eYo.NA},
    })
    ns.A[eYo.$].finalizeC9r()
    var a = new ns.A('a', onr)
    chai.assert(a.foo_p)
    ns.newC9r('AB', ns.A, {
      properties: {bar:eYo.NA},
    })
    ns.AB[eYo.$].finalizeC9r()
    var ab = new ns.AB('ab', onr)
    chai.assert(ab.foo_p)
    chai.assert(ab.bar_p)
  })
  it('O4t: validate, willChange, atChange, didChange', function () {
    ;['validate', 'willChange', 'atChange', 'didChange'].forEach(key => {
      var ns = eYo.o4t.newNS()
      ns.newC9r('A', {
        properties: {
          foo: {
            value: 0,
            [key]: function (after) {
              flag.push(after)
              return key === 'validate' && after
            },
          },
          bar: {
            value: 0,
            [key]: function (before, after) {
              flag.push(before, after)
              return key === 'validate' && after
            },
          },
        },
      })
      ns.A[eYo.$].finalizeC9r()
      let a = new ns.A('a', onr)
      a.foo_ = 1
      flag.expect(1)
      a.bar_ = 1
      flag.expect(1)
      a.bar_ = 2
      flag.expect(12)
    })
  })
  it ('O4t: Computed', function () {
    var ns = eYo.o4t.newNS()
    var x = 123
    ns.newC9r('A', {
      properties: {
        foo: {
          get () {
            return 100 * x + 1
          },
        },
        bar: {
          lazy () {
            return x
          },
        },
      },
    })
    x = 69
    ns.A[eYo.$].finalizeC9r()
    var a = new ns.A('a', onr)
    chai.expect(a.bar).equal(69)
    chai.expect(a.foo).equal(6901)
  })
  it ('O4t: configure', function () {
    var ns = eYo.o4t.newNS()
    ns.makeBaseC9r()
    chai.expect(ns).equal(ns.BaseC9r[eYo.$].ns)
    ns.newC9r('A', {
      properties: {
        foo () {
          flag.push(1)
          return 421
        }
      },
    })
    ns.A[eYo.$newSubC9r]('AA', {
      properties: {
        foo () {
          flag.push(2)
          return 123
        }
      },
    })
    ns.A[eYo.$].finalizeC9r()
    flag.expect()
    var a = new ns.A('a', onr)
    chai.expect(a.foo).equal(421)
    flag.expect(1)
    x = 0
    ns.AA[eYo.$].finalizeC9r()
    var aa = new ns.AA('aa', onr)
    chai.expect(aa.foo).equal(123)
    flag.expect(2)
  })
  it ('O4t: POC Override model rules for properties', function () {
    var ns = eYo.o4t.newNS()
    ns.makeBaseC9r()
    chai.expect(ns).equal(ns.BaseC9r[eYo.$].ns)
    ns.newC9r('A', {
      properties: {foo: 123}
    })
    ns.A[eYo.$].finalizeC9r()
    ns.A[eYo.$newSubC9r]('AA', {
      properties: {foo: 456}
    })
    ns.AA[eYo.$].finalizeC9r()
    chai.expect(() => {
      new ns.AA('aa', onr)
    }).not.to.throw()
    chai.expect((new ns.A('a', onr)).foo).equal(123)
    chai.expect((new ns.AA('aa', onr)).foo).equal(456)
  })
  it ('O4t: p6yMerge', function () {
    var ns = eYo.o4t.newNS()
    ns.makeBaseC9r()
    chai.expect(ns).equal(ns.BaseC9r[eYo.$].ns)
    ns.newC9r('A', {
      properties: {foo: 421}
    })
    chai.expect(ns.A[eYo.$].p6yModelMap.get('foo')).not.undefined
    ns.A[eYo.$].finalizeC9r()
    var a = new ns.A('a', onr)
    chai.expect(a.foo).equal(421)

    ns = eYo.o4t.newNS()
    ns.newC9r('A', {
      properties: {foo: 421}
    })
    chai.expect(ns.A[eYo.$].p6yModelMap.get('foo')).not.undefined
    ns.A[eYo.$].p6yMerge({
      bar: 123,
    })
    chai.expect(ns.A[eYo.$].p6yModelMap.get('bar')).not.undefined
    ns.A[eYo.$].finalizeC9r()
    var a = new ns.A('a', onr)
    chai.expect(a.foo).equal(421)
    chai.expect(a.bar).equal(123)
  })
  it ('O4t: after:...', function () {
    let ns = eYo.o4t.newNS()
    ns.makeBaseC9r()
    var order = []
    ns.newC9r('Bar', {
      properties: {
        mi: {
          after: 'chi',
          value () {
            order.push('mi')
            return 421
          },
        },
        foo: {
          after: 'mi',
          value () {
            order.push('foo')
            return 123
          },
        },
        chi: {
          value () {
            order.push('chi')
            return 666
          },
        },
      },
    })
    ns.Bar[eYo.$].finalizeC9r()
    let bar = new ns.Bar('bar', onr)
    chai.expect(order).deep.equal(['chi', 'mi', 'foo'])
    chai.expect(bar.foo).equal(123)
    chai.expect(bar.mi).equal(421)
    chai.expect(bar.chi).equal(666)
  })
  it ('O4t: after:../...', function () {
    let ns = eYo.o4t.newNS()
    ns.makeBaseC9r()
    var order = []
    ns.newC9r('Mud', {
      properties: {
        chi: {
          value () {
            order.push('chi')
            return 666
          },
        },
      },
    })
    ns.Mud[eYo.$].finalizeC9r()
    ns.Mud[eYo.$newSubC9r]('Bar', {
      properties: {
        mi: {
          after: 'chi',
          value () {
            order.push('mi')
            return 421
          },
        },
        foo: {
          after: 'mi',
          value () {
            order.push('foo')
            return 123
          },
        },
      },
    })
    ns.Bar[eYo.$].finalizeC9r()
    let bar = new ns.Bar('bar', onr)
    chai.expect(order).deep.equal(['chi', 'mi', 'foo'])
    chai.expect(bar.foo).equal(123)
    chai.expect(bar.mi).equal(421)
    chai.expect(bar.chi).equal(666)
  })
  it ('O4t: property init', function () {
    let o = eYo.o4t.new({
      properties: {
        foo () {
          this.do_it(421)
          return 421
        }
      },
      methods: {
        do_it (what) {
          flag.push(what)
        }
      }
    }, 'o', onr)
    flag.expect(421)
  })
  it ('O4t: property setter with owner', function () {
    let o = eYo.o4t.new({
      properties: {
        foo: {
          value: 0,
          set (builtin, after) {
            this.do_it(after)
          }
        },
      },
      methods: {
        do_it (what) {
          flag.push(what)
          this.foo_ = what
        }
      }
    }, 'o', onr)
    o.foo_ = 421
    flag.expect(421)
  })
  it ('O4t: eYo.o4t.newC9r("", ...)', function () {
    let model = {
      properties: {
        foo: 421,
      },
    }
    let C9r = eYo.o4t.newC9r('', model)
    C9r[eYo.$].finalizeC9r()
    let o = new C9r('o', onr)
    chai.expect(o.foo).equal(421)
  })
  it ('O4t: eYo.o4t.new("", ...)', function () {
    let o = eYo.o4t.new({
      properties: {
        foo: 421,
      },
      methods: {
        bar (what) {
          flag.push(what)
        }
      }
    }, 'o', onr)
    chai.expect(o.foo).equal(421)
    o.bar(123)
    flag.expect(123)
  })
  it ('O4t: eYo.o4t.singleton(...)', function () {
    let model = {
      properties: {
        foo: 421,
      },
    }
    let o = eYo.o4t.singleton(model, onr)
    chai.expect(o.foo).equal(421)
  })
  it ('O4t: time is on my side', function () {
    // In the init method, the properties are available and initialized
    // when not lazy!
    var x = 0
    let ns1 = eYo.o4t.newNS('')
    ns1.makeBaseC9r({
      init () {
        flag.push(1)
        chai.expect(this.foo).equal(421)
      },
      properties: {
        foo: {
          value: 421,
          Xconsolidate(after) {
            x *= 1000
            x += after  
          },
        },
      }
    })
    ns2 = ns1.newNS('')
    ns2.makeBaseC9r({
      init () {
        flag.push(2)
        chai.expect(this.foo).equal(421)
        chai.expect(this.bar).equal(123)
      },
      properties: {
        bar: {
          value: 123,
          Xconsolidate(after) {
            x *= 1000
            x += 2 * after  
          },
        },
      }
    })
    flag.expect()
    ns2.new('foo', onr)
    flag.expect(12)
  })
  describe('O4t: Cached', function () {
    it ('Cached: Basic', function () {
      var ns = eYo.o4t.newNS()
      var flag = 0
      ns.newC9r('A', {
        properties: {
          foo: {
            lazy () {
              return flag
            }
          }
        },
      })
      ns.A[eYo.$].finalizeC9r()
      var a1 = new ns.A('a1', onr)
      var a2 = new ns.A('a2', onr)
      chai.expect(a1.foo).equal(0)
      flag = 1
      chai.expect(a1.foo).equal(0)
      chai.expect(a2.foo).equal(1)
      a1.foo_p.reset()
      chai.expect(a1.foo).equal(1)
    })
    it ('Cached: Two objects', function () {
      var ns = eYo.o4t.newNS()
      var flag_A1 = 0
      var flag_A2 = 1
      var flag_B1 = 2
      var flag_B2 = 3
      ns.newC9r('A', {
        properties: {
          foo1: {
            lazy () {
              return flag_A1
            }
          },
          foo2: {
            lazy () {
              return flag_A2
            }
          }
        },
      })
      ns.newC9r('B', {
        properties: {
          foo1: {
            lazy () {
              return flag_B1
            }
          },
          foo2: {
            lazy () {
              return flag_B2
            }
          }
        },
      })
      ns.A[eYo.$].finalizeC9r()
      var a = new ns.A('a', onr)
      ns.B[eYo.$].finalizeC9r()
      var b = new ns.B('a', onr)
      var test = (a1, a2, b1, b2) => {
        chai.expect(a.foo1).equal(a1)
        chai.expect(a.foo2).equal(a2)
        chai.expect(b.foo1).equal(b1)
        chai.expect(b.foo2).equal(b2)
      }
      test(0, 1, 2, 3)
      flag_A1 = 10
      test(0, 1, 2, 3)
      a.foo1_p.reset()
      test(10, 1, 2, 3)
      flag_A2 = 11
      test(10, 1, 2, 3)
      a.foo2_p.reset()
      test(10, 11, 2, 3)
      flag_B1 = 12
      test(10, 11, 2, 3)
      b.foo1_p.reset()
      test(10, 11, 12, 3)
      flag_B2 = 13
      test(10, 11, 12, 3)
      b.foo2_p.reset()
      test(10, 11, 12, 13)
    })
    it ('Cached: Inherit cached', function () {
      var ns = eYo.o4t.newNS()
      var flag_1 = 0
      var flag_2 = 1
      ns.newC9r('A', {
        properties: {
          foo1: {
            lazy () {
              return flag_1
            }
          }
        },
      })
      ns.A[eYo.$].finalizeC9r()
      ns.newC9r('AB', ns.A, {
        properties: {
          foo2: {
            lazy () {
              return flag_2
            }
          }
        },
      })
      ns.AB[eYo.$].finalizeC9r()
      var ab = new ns.AB('ab', onr)
      var test = (f1, f2) => {
        chai.expect(ab.foo1).equal(f1)
        chai.expect(ab.foo2).equal(f2)
      }
      test(0, 1)
      flag_1 = 10
      test(0, 1)
      ab.foo1_p.reset()
      test(10, 1)
      flag_2 = 11
      test(10, 1)
      ab.foo2_p.reset()
      test(10, 11)
    })
  })
  describe ('O4t: copy', function () {
    it ('Copy: Basic', function () {
      var ns = eYo.o4t.newNS()
      var B = eYo.c9r.newC9r('', {
        init (value) {
          this.value_ = value
        },
        dispose (what) {
          this.value_ = what
          this.disposed_ = true
        },
        methods: {
          set (other) {
            this.value_ = other.value_
          },
          equals (other) {
            return this.value_ === other.value_
          }
        }
      })
      Object.defineProperty(B.prototype, 'copy', {
        get () {
          flag.push('copy')
          return new B(this.value_)
        }
      })
      B[eYo.$].finalizeC9r()
      ns.newC9r('A', {
        properties: {
          foo: {
            value () {
              return new B(421)
            },
            copy: true,
          },
        },
      })
      ns.A[eYo.$].finalizeC9r()
      var a = new ns.A('a', onr)
      a.foo
      flag.expect('copy')
      a.foo_
      flag.expect()
      chai.expect(a.foo).not.equal(a.foo_)
    })
    it ('Copy: Hooks', function () {
      var x = 0
      let Foo = eYo.c9r.newNS().makeBaseC9r({
        init (value) {
          this.value_ = value
        },
        methods: {
          dispose () {
            this.disposed_ = true
          },
          set (other) {
            this.value_ = other.value_
          },
          equals (other) {
            return this.value_ === other.value_
          }
        }
      })
      Object.defineProperty(Foo.prototype, 'copy', {
        get () {
          return new Foo(this.value_)
        }
      })
      var foo_1 = new Foo(1)
      var foo_2 = new Foo(2)
      let Bar = eYo.o4t.newNS().makeBaseC9r({
        properties: {
          foo: {
            value () {
              return foo_1
            },
            willChange (before, after) {
              flag.push(1)
              before && flag.push(before.value_ + 1)
              after && flag.push(after.value_ + 1)
            },
            didChange (before, after) {
              flag.push(7)
              flag.push(before && (before.value_ + 7) || 9)
              flag.push(after && (after.value_ + 7) || 9)
            },
            copy: true,
          }
        },
        methods: {
          fooWillChange (before, after) {
            flag.push(4)
            flag.push(before && (before.value_ + 4) || 9)
            flag.push(after && (after.value_ + 4) || 9)
          },
          fooDidChange (before, after) {
            flag.push(10)
            flag.push(before && before.value_ || 9)
            flag.push(after && after.value_ || 9)
          }
        }
      })
      var bar = new Bar('bar', onr)
      chai.assert(bar.foo.equals(foo_1))
      flag.expect()
      bar.foo_ = foo_2
      chai.assert(bar.foo.equals(foo_2))
      flag.expect(1234567891012) // 12345778101012
    })
  })
  describe(`O4t: Alias`, function () {
    it ('O4t: alias', function () {
      var o = eYo.o4t.new({
        properties: {
          foo: {
            value: 421
          },
        },
        aliases: {
          foo: 'bar',
          bar: ['bar1', 'bar2'],
        },
      }, 'foo', onr)
      chai.expect(o.foo_).equal(o.bar_)
      chai.expect(o.foo).equal(o.bar)
      chai.expect(o.foo_).equal(o.bar1_)
      chai.expect(o.foo).equal(o.bar1)
      chai.expect(o.foo_).equal(o.bar2_)
      chai.expect(o.foo).equal(o.bar2)
      o.foo_ = 123 - o.foo_
      chai.expect(o.foo_).equal(o.bar1_)
      chai.expect(o.foo).equal(o.bar1)
      chai.expect(o.foo_).equal(o.bar2_)
      chai.expect(o.foo).equal(o.bar2)
      chai.expect(o.foo_).equal(o.bar_)
      chai.expect(o.foo).equal(o.bar)
      o.bar_ = 123 - o.bar_
      chai.expect(o.foo_).equal(o.bar_)
      chai.expect(o.foo).equal(o.bar)
      chai.expect(o.foo_).equal(o.bar1_)
      chai.expect(o.foo).equal(o.bar1)
      chai.expect(o.foo_).equal(o.bar2_)
      chai.expect(o.foo).equal(o.bar2)
      o.bar1_ = 123 - o.bar1_
      chai.expect(o.foo_).equal(o.bar_)
      chai.expect(o.foo).equal(o.bar)
      chai.expect(o.foo_).equal(o.bar1_)
      chai.expect(o.foo).equal(o.bar1)
      chai.expect(o.foo_).equal(o.bar2_)
      chai.expect(o.foo).equal(o.bar2)
      o.bar2_ = 123 - o.bar2_
      chai.expect(o.foo_).equal(o.bar_)
      chai.expect(o.foo).equal(o.bar)
      chai.expect(o.foo_).equal(o.bar1_)
      chai.expect(o.foo).equal(o.bar1)
      chai.expect(o.foo_).equal(o.bar2_)
      chai.expect(o.foo).equal(o.bar2)
    })
    it ('O4t: deep alias', function () {
      var Foo = eYo.o4t.newC9r(eYo.NULL_NS, 'Foo', {
        properties: {
          chi: {},
        },
      })
      Foo[eYo.$].finalizeC9r()
      var Bar = eYo.o4t.newC9r(eYo.NULL_NS, 'Bar', {
        properties: {
          foo: new Foo('foo', onr)
        },
        aliases: {
          'foo.chi': 'chi',
        },
      })
      Bar[eYo.$].finalizeC9r()
      var bar = new Bar('bar', onr)
      bar.chi_ = 421
      var test = x => chai.expect(bar.chi).equal(x).equal(bar.foo.chi).equal(bar.chi_p.getValueRO()).equal(bar.chi_p.getValue()).equal(bar.chi_p.getStored())
      test(421)
      bar.chi__ = 1
      test(1)
      bar.foo.chi_ = 123
      test(123)
      bar.foo.chi__ = 421
      test(421)
      bar.chi_p.setValue(123)
      test(123)
      bar.chi_p.setStored(421)
      test(421)
    })  
    it ('O4t: deeper alias', function () {
      var Foo = eYo.o4t.newC9r(eYo.NULL_NS, 'Foo', {
        properties: {
          mi: {},
        },
        aliases: {
          mi: 'chi',
        }
      })
      Foo[eYo.$].finalizeC9r()
      var Bar = eYo.o4t.newC9r(eYo.NULL_NS, 'Bar', {
        properties: {
          foo: new Foo('foo', onr)
        },
        aliases: {
          'foo.chi': 'chi',
        },
      })
      Bar[eYo.$].finalizeC9r()
      var bar = new Bar('bar', onr)
      bar.chi_ = 421
      var test = x => chai.expect(bar.chi).equal(x).equal(bar.foo.chi).equal(bar.chi_p.getValueRO()).equal(bar.chi_p.getValue()).equal(bar.chi_p.getStored())
      test(421)
      bar.chi__ = 1
      test(1)
      bar.foo.chi_ = 123
      test(123)
      bar.foo.chi__ = 421
      test(421)
      bar.foo.mi_ = 123
      test(123)
      bar.foo.mi__ = 421
      test(421)
      bar.chi_p.setValue(123)
      test(123)
      bar.chi_p.setStored(421)
      test(421)
    })  
  })
  describe(`O4t: Model`, function () {
    it (`P6y inheritance`, function () {
      let ns = eYo.o4t.newNS()
      ns.makeBaseC9r({
        properties: {
          foo: 421
        },
        methods: {
          bar (what) {
            flag.push(1, what)
            return what
          }
        }
      })
      ns.newC9r('A')
      ns.A[eYo.$].finalizeC9r()
      let a = new ns.A('a', onr)
      chai.expect(a.foo).equal(421)
      a.bar(23)
      flag.expect(123)
      ns.A[eYo.$newSubC9r]('AB')
      ns.AB[eYo.$].finalizeC9r()
      let ab = new ns.AB('ab', onr)
      chai.expect(ab.foo).equal(421)
      a.bar(23)
      flag.expect(123)
    })
    it (`o4tEnhanced inheritance`, function () {
      let ns = eYo.c9r.newNS()
      ns.makeBaseC9r(true, {
        properties: {
          foo: 421
        },
        methods: {
          bar (what) {
            flag.push(1, what)
            return what
          }
        }
      })
      ns.BaseC9r[eYo.$].o4tEnhanced()
      ns.BaseC9r[eYo.$].finalizeC9r(['aliases'], {
        properties: {
          [eYo.model.ANY]: eYo.p6y.BaseC9r[eYo.$].modelFormat
        },
      })
      let o = ns.new()
      chai.expect(o.foo).equal(421)
      o.bar(23)
      flag.expect(123)
      ns.newC9r('A')
      ns.A[eYo.$].finalizeC9r()
      let a = new ns.A()
      chai.expect(a.foo).equal(421)
      a.bar(23)
      flag.expect(123)
      ns.A[eYo.$newSubC9r]('AB')
      ns.AB[eYo.$].finalizeC9r()
      let ab = new ns.AB()
      chai.expect(ab.foo).equal(421)
      a.bar(23)
      flag.expect(123)
    })
  })
  describe ('O4t POC: aliases', function () {
    it ('Alias --> 421', function () {
      var bar = eYo.o4t.new({
        properties: {
          foo: 421,
        },
      }, 'foo', onr)
      chai.expect(bar.foo).equal(421)
      let NS = eYo.o4t.newNS()
      NS.makeBaseC9r({
        properties: {
          bar,
        },
        aliases: {
          'bar.foo': 'foo',
        }
      })
      var o = NS.new('foo', onr)
      chai.expect(o.bar).equal(bar)
      chai.expect(o.bar.foo).equal(421)
      chai.expect(o.foo).equal(421)
    })
  })
  it (`newSingleton`, function () {
    let id = eYo.genUID(eYo.IDENT)
    eYo.o4t.newSingleton(eYo, id, {
      properties: {
        foo: 421,
      },
    })
    chai.expect(eYo).property(id)
    chai.expect(eYo[id]).property('foo')
    chai.expect(eYo[id].foo).equal(421)
  })
})

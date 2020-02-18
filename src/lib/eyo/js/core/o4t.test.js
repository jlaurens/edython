describe ('Tests: Object', function () {
  this.timeout(10000)
  it ('O4t: Basic', function () {
    chai.assert(eYo.o4t)
  })
  it ('O4t: eYo.o4t.makeC9r(eYo.NULL_NS, ...', function () {
    let O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {})
    chai.assert(O.eyo instanceof eYo.o4t.Dflt.eyo.constructor)
    let o = new O()
    chai.assert(o)
    let OO = eYo.c9r.makeC9r(eYo.NULL_NS, 'Bar', O, {})
    let oo = new OO()
    chai.assert(oo)
    chai.assert(oo instanceof O)
    chai.assert(oo.eyo instanceof O.eyo.constructor)
  })
  it ('O4t: ns.makeC9r...', function () {
    let ns = eYo.o4t.makeNS()
    let O = eYo.o4t.makeC9r(ns, 'Foo', {})
    chai.assert(O.eyo instanceof eYo.o4t.Dflt.eyo.constructor)
    let o = new O()
    chai.assert(o)
    let OO = O.makeInheritedC9r('Bar', {})
    chai.assert(OO.eyo instanceof eYo.o4t.Dflt.eyo.constructor)
    let oo = new OO()
    chai.assert(oo)
  })
  it ('O4t: ns.makeC9r...', function () {
    let ns = eYo.o4t.makeNS()
    ns.makeC9r('A')
    let O = ns.makeC9r('Foo', {})
    chai.assert(O.eyo instanceof eYo.o4t.Dflt.eyo.constructor)
    let o = new O()
    chai.assert(o)
    let OO = O.makeInheritedC9r('Bar', {})
    chai.assert(OO.eyo instanceof eYo.o4t.Dflt.eyo.constructor)
    let oo = new OO()
    chai.assert(oo)
  })
  it ('O4t: properties (valued)', function () {
    var O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          value: 421
        },
        bar: 0,
        chi () {
          return 666
        },
      }
    })
    var o = new O()
    chai.assert(o.foo_p)
    chai.assert(o.foo_p.owner === o)
    chai.assert(o.foo_p === o[o.foo_p.key + '_p'])
    chai.assert(o.foo_p.value === 421)
    chai.assert(o.foo === 421)
    o.foo_ = 123
    chai.assert(o.foo === 123)
    chai.assert(o.bar_p)
    chai.assert(o.bar === 0)
    o.bar_ = 421
    chai.assert(o.bar === 421)
    chai.assert(o.chi_p)
    chai.assert(o.chi === 666)
    o.chi_ = 421
    chai.assert(o.chi === 421)
  })
  it ('O4t: properties (owned)', function () {
    var flag = 0
    var O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          value: {
            eyo: true,
            dispose () {
              flag = 421
            }
          }
        },
      }
    })
    var o = new O()
    o = o.dispose()
    chai.assert(flag === 421)
    flag = 0
    var O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          value: {
            eyo: true,
            dispose () {
              flag = 421
            }
          },
          dispose: false,
        },
      }
    })
    var o = new O()
    o = o.dispose()
    chai.assert(flag === 0)
  })
  it ('O4t: alias', function () {
    var O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          value: 421
        },
      },
      aliases: {
        foo: 'bar',
        bar: ['bar1', 'bar2'],
      },
    })
    var o = new O()
    chai.assert(o.foo_p === o.bar_p)
    chai.assert(o.foo_ === o.bar_)
    chai.assert(o.foo === o.bar)
    chai.assert(o.foo_p === o.bar1_p)
    chai.assert(o.foo_ === o.bar1_)
    chai.assert(o.foo === o.bar1)
    chai.assert(o.foo_p === o.bar2_p)
    chai.assert(o.foo_ === o.bar2_)
    chai.assert(o.foo === o.bar2)
    o.foo_ = 123 - o.foo_
    chai.assert(o.foo_p === o.bar1_p)
    chai.assert(o.foo_ === o.bar1_)
    chai.assert(o.foo === o.bar1)
    chai.assert(o.foo_p === o.bar2_p)
    chai.assert(o.foo_ === o.bar2_)
    chai.assert(o.foo === o.bar2)
    chai.assert(o.foo_p === o.bar_p)
    chai.assert(o.foo_ === o.bar_)
    chai.assert(o.foo === o.bar)
    o.bar_ = 123 - o.bar_
    chai.assert(o.foo_p === o.bar_p)
    chai.assert(o.foo_ === o.bar_)
    chai.assert(o.foo === o.bar)
    chai.assert(o.foo_p === o.bar1_p)
    chai.assert(o.foo_ === o.bar1_)
    chai.assert(o.foo === o.bar1)
    chai.assert(o.foo_p === o.bar2_p)
    chai.assert(o.foo_ === o.bar2_)
    chai.assert(o.foo === o.bar2)
    o.bar1_ = 123 - o.bar1_
    chai.assert(o.foo_p === o.bar_p)
    chai.assert(o.foo_ === o.bar_)
    chai.assert(o.foo === o.bar)
    chai.assert(o.foo_p === o.bar1_p)
    chai.assert(o.foo_ === o.bar1_)
    chai.assert(o.foo === o.bar1)
    chai.assert(o.foo_p === o.bar2_p)
    chai.assert(o.foo_ === o.bar2_)
    chai.assert(o.foo === o.bar2)
    o.bar2_ = 123 - o.bar2_
    chai.assert(o.foo_p === o.bar_p)
    chai.assert(o.foo_ === o.bar_)
    chai.assert(o.foo === o.bar)
    chai.assert(o.foo_p === o.bar1_p)
    chai.assert(o.foo_ === o.bar1_)
    chai.assert(o.foo === o.bar1)
    chai.assert(o.foo_p === o.bar2_p)
    chai.assert(o.foo_ === o.bar2_)
    chai.assert(o.foo === o.bar2)
  })
  it ('O4t: deep alias', function () {
    var Foo = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        chi: {},
      },
    })
    var Bar = eYo.o4t.makeC9r(eYo.NULL_NS, 'Bar', {
      properties: {
        foo: new Foo()
      },
      aliases: {
        'foo.chi': 'chi',
      },
    })
    var bar = new Bar()
    chai.assert(bar.chi_p === bar.foo.chi_p)
    bar.chi_ = 421
    chai.assert(bar.chi === bar.foo.chi)
    bar.foo.chi_ = 123
    chai.assert(bar.chi === bar.foo.chi)
  })
  it ('O4t: override only get', function () {
    var flag = 421
    var Foo = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          get () {
            return flag
          },
        },
      },
    })
    var foo = new Foo()
    chai.assert(foo.foo === flag)
    var Bar = eYo.o4t.makeC9r(eYo.NULL_NS, 'Bar', Foo, {
      properties: {
        foo: {
          get () {
            return 10 * flag
          },
        },
      },
    })
    var bar = new Bar()
    chai.assert(bar.foo !== flag)
  })
  it ('O4t: override only set', function () {
    var flag = 421
    var Foo = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          get () {
            return flag
          },
          set (after) {
            flag = after
          },
        },
      },
    })
    var foo = new Foo()
    chai.assert(foo.foo === flag)
    chai.assert((foo.foo_ = 123) === flag)
    var Bar = eYo.o4t.makeC9r(eYo.NULL_NS, 'Bar', Foo, {
      properties: {
        foo: {
          get () {
            return 10 * flag
          },
        },
      },
    })
    var bar = new Bar()
    chai.assert(bar.foo !== flag)
    chai.expect(() => {
      bar.foo_ = 421
    }).to.throw()
  })
  it ('O4t: override readonly', function () {
    var flag = 421
    var Foo = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          get () {
            return flag
          },
        },
      },
    })
    var foo = new Foo()
    chai.assert(foo.foo === flag)
    chai.expect(() => {
      foo.foo_ = 421
    }).to.throw()
    var Bar = eYo.o4t.makeC9r(eYo.NULL_NS, 'Bar', Foo, {
      properties: {
        foo: {
          get () {
            return 10 * flag
          },
          set (after) {
            flag = 10 * after
          },
        },
      },
    })
    var bar = new Bar()
    chai.assert(bar.foo !== flag)
    chai.assert((bar.foo_ = 1) * 10 === flag)
  })
  it ('O4t: inheritance', function () {
    var ns = eYo.o4t.makeNS()
    ns.makeC9r('A', {
      properties: {foo: eYo.NA},
    })
    var a = new ns.A()
    chai.assert(a.foo_p)
    ns.makeC9r('AB', ns.A, {
      properties: {bar:eYo.NA},
    })
    var ab = new ns.AB()
    chai.assert(ab.foo_p)
    chai.assert(ab.bar_p)
  })
  it('O4t: validate, willChange, atChange, didChange', function () {
    ;['validate', 'willChange', 'atChange', 'didChange'].forEach(key => {
      var ns = eYo.o4t.makeNS()
      var flag = 0  
      ns.makeC9r('A', {
        properties: {
          foo: {
            value: 0,
            [key]: function (after) {
              flag += after
              return key === 'validate' && after
            },
          },
          bar: {
            value: 0,
            [key]: function (before, after) {
              flag += after + 100 * before
              return key === 'validate' && after
            },
          },
        },
      })
      let a = new ns.A()
      a.foo_ = 69
      chai.assert(flag === 69, `${key}: ${flag} !== 69`)
      flag = 0
      a.bar_ = 9
      chai.assert(flag === 9, `${key}: ${flag} !== 9`)
      a.bar_ = 60
      chai.assert(flag === 969, `${key}: ${flag} !== 969`)
    })
  })
  describe('O4t: Cached', function () {
    it ('Cached: Basic', function () {
      var ns = eYo.o4t.makeNS()
      var flag = 0
      ns.makeC9r('A', {
        properties: {
          foo: {
            lazy () {
              return flag
            }
          }
        },
      })
      var a1 = new ns.A()
      var a2 = new ns.A()
      chai.assert(a1.foo === 0)
      flag = 1
      chai.assert(a1.foo === 0)
      chai.assert(a2.foo === 1)
      a1.foo_p.reset()
      chai.assert(a1.foo === 1)
    })
    it ('Cached: Two objects', function () {
      var ns = eYo.o4t.makeNS()
      var flag_A1 = 0
      var flag_A2 = 1
      var flag_B1 = 2
      var flag_B2 = 3
      ns.makeC9r('A', {
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
      ns.makeC9r('B', {
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
      var a = new ns.A()
      var b = new ns.B()
      var test = (a1, a2, b1, b2) => {
        chai.assert(a.foo1 === a1)
        chai.assert(a.foo2 === a2)
        chai.assert(b.foo1 === b1)
        chai.assert(b.foo2 === b2)
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
      var ns = eYo.o4t.makeNS()
      var flag_1 = 0
      var flag_2 = 1
      ns.makeC9r('A', {
        properties: {
          foo1: {
            lazy () {
              return flag_1
            }
          }
        },
      })
      ns.makeC9r('AB', ns.A, {
        properties: {
          foo2: {
            lazy () {
              return flag_2
            }
          }
        },
      })
      var ab = new ns.AB()
      var test = (f1, f2) => {
        chai.assert(ab.foo1 === f1)
        chai.assert(ab.foo2 === f2)
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
    it ('copy: Basic', function () {
      var ns = eYo.o4t.makeNS()
      var B = function (value) {
        this.value_ = value
        this.eyo = true
      }
      ns.makeC9r('A', {
        properties: {
          foo: {
            value () {
              return new B(421)
            },
            copy: true,
          },
        },
      })
      B.prototype.dispose = function (what) {
        this.value_ = what
        this.disposed_ = true
      }
      B.prototype.set = function (other) {
        this.value_ = other.value_
      }
      B.prototype.equals = function (other) {
        return this.value_ === other.value_
      }
      Object.defineProperty(B.prototype, 'copy', {
        get () {
          return new B(this.value_)
        }
      })
      var a = new ns.A()
      var b = a.foo_
      chai.assert(b.value_ = 421)
      var bb = a.foo_
      chai.assert(bb.value_ = 421)
      b.value_ = 123
      chai.assert(bb.value_ = 421)
    })
    it ('Clonable: hooks', function () {
      var ns = eYo.o4t.makeNS()
      var flag = 0
      var B = function (value) {
        this.value_ = value
      }
      B.prototype.dispose = function () {
        this.disposed_ = true
      }
      B.prototype.set = function (other) {
        this.value_ = other.value_
      }
      B.prototype.equals = function (other) {
        return this.value_ === other.value_
      }
      Object.defineProperty(B.prototype, 'copy', {
        get () {
          return new B(this.value_)
        }
      })
      var foo_before = new B(421)
      var foo_after = new B(123)
      var test = function (before, after) {
        chai.assert(this === a, `Missed: this === a`)
        chai.assert(before === foo_before, `Missed: before ${before} === ${foo_before}`)
        chai.assert(after === foo_after, `Missed: after ${after} === ${foo_after}`)
      }
      ns.makeC9r('A', {
        properties: {
          foo: {
            value () {
              return foo_before
            },
            willChange (before, after) {
              test.call(this, before, after)
              return () => {
                flag = 421
              }
            },
            didChange: test,
            copy: true,
          }
        },
      })
      ns.A.prototype.fooWillChange = ns.A.prototype.fooDidChange = test
      var a = new ns.A()
      chai.assert(a.foo_ === foo_before)
      chai.assert(a.foo.equals(foo_before))
      a.foo_ = foo_after
      chai.assert(a.foo_ === foo_after)
      chai.assert(a.foo.equals(foo_after))
    })
  })
  it ('O4t: Computed', function () {
    var ns = eYo.o4t.makeNS()
    var flag = 123
    ns.makeC9r('A', {
      properties: {
        foo: {
          get () {
            return 100 * flag + 1
          },
        },
        bar: {
          lazy () {
            return flag
          },
        },
      },
    })
    flag = 69
    var a = new ns.A()
    chai.assert(a.bar === 69)
    chai.assert(a.foo === 6901)
  })
  it ('O4t: configure', function () {
    var ns = eYo.o4t.makeNS()
    ns.makeDflt()
    chai.assert(ns === ns.Dflt.eyo.ns)
    var flag = 0
    ns.makeC9r('A', {
      properties: {
        foo () {
          flag += 421
          return 421
        }
      },
    })
    ns.A.makeInheritedC9r('AA', {
      properties: {
        foo () {
          flag += 123
          return 123
        }
      },
    })
    var a = new ns.A()
    chai.assert(flag === 421)
    chai.assert(a.foo === 421)
    flag = 0
    var aa = new ns.AA()
    chai.assert(flag === 123, `Unexpected flag: ${flag}`)
    chai.assert(aa.foo === 123)
  })
  it ('O4t: POC Override rules for properties', function () {
    var ns = eYo.o4t.makeNS()
    ns.makeDflt()
    chai.assert(ns === ns.Dflt.eyo.ns)
    ns.makeC9r('A', {
      properties: {foo: eYo.NA}
    })
    ns.A.makeInheritedC9r('AA', {
      properties: {foo: eYo.NA}
    })
    chai.expect(() => {
      new ns.AA()
    }).not.to.throw()
  })
  it ('O4t: extendsProperties', function () {
    var ns = eYo.o4t.makeNS()
    ns.makeDflt()
    chai.assert(ns === ns.Dflt.eyo.ns)
    ns.makeC9r('A', {
      properties: {foo: 421}
    })
    var a = new ns.A()
    chai.assert(a.foo === 421)
    ns.A.eyo.extendsProperties({
      bar: 123,
    })
    chai.assert(a.bar !== 123)
    a = new ns.A()
    chai.assert(a.foo === 421)
    chai.assert(a.bar === 123)
    ns.makeC9r('B')
    ns.B.makeInheritedC9r('BB')    
    var bb = new ns.BB()
    chai.assert(bb.foo !== 421)
    var flag = 0
    ns.B.eyo.extendsProperties({
      foo: {
        value () {
          flag = 666
          return 421
        }
      },
    })
    bb = new ns.BB()
    chai.assert(flag === 666)
    chai.assert(bb.foo === 421)
    chai.assert((bb.foo_ = 123) === bb.foo)
    ns.B.eyo.extendsProperties({
      foo: {
        lazy () {
          flag = 666
          return 123
        },
      },
    })
    flag = 421
    bb = new ns.BB()
    chai.assert(flag === 421)
    chai.assert(bb.foo === 123)
    chai.assert(flag === 666)
    chai.assert((bb.foo_ = 421) === bb.foo)
    flag = 421
    bb.foo_p.reset()
    chai.assert(flag === 666)
    chai.assert(bb.foo === 123)
  })
})

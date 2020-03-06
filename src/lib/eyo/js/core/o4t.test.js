describe ('Tests: Object', function () {
  this.timeout(10000)
  it ('O4t: Basic', function () {
    chai.assert(eYo.o4t)
  })
  it ('O4t: eYo.o4t.makeC9r(eYo.NULL_NS, ...', function () {
    let O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {})
    chai.assert(O.eyo instanceof eYo.o4t.Base.eyo.constructor)
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
    chai.assert(O.eyo instanceof eYo.o4t.Base.eyo.constructor)
    let o = new O()
    chai.assert(o)
    let OO = O.makeInheritedC9r('Bar', {})
    chai.assert(OO.eyo instanceof eYo.o4t.Base.eyo.constructor)
    let oo = new OO()
    chai.assert(oo)
  })
  it ('O4t: ns.makeC9r...', function () {
    let ns = eYo.o4t.makeNS()
    ns.makeC9r('A')
    let O = ns.makeC9r('Foo', {})
    chai.assert(O.eyo instanceof eYo.o4t.Base.eyo.constructor)
    let o = new O()
    chai.assert(o)
    let OO = O.makeInheritedC9r('Bar', {})
    chai.assert(OO.eyo instanceof eYo.o4t.Base.eyo.constructor)
    let oo = new OO()
    chai.assert(oo)
  })
  it ('properties(1)', function () {
    let ns = eYo.o4t.makeNS()
    let Foo = ns.makeC9r('foo')
    chai.expect(Foo.eyo.properties).equal(Foo.eyo.properties)
    let Bar = ns.makeC9r('bar', Foo)
    chai.expect(Bar.eyo.properties).equal(Bar.eyo.properties)
    Foo.eyo.properties.chi = 421
    chai.assert(!Bar.eyo.properties.chi)
  })
  it ('properties(2)', function () {
    let ns = eYo.o4t.makeNS()
    let Foo = ns.makeC9r('foo')
    Foo.eyo.properties.chi = 421
    chai.expect(Foo.eyo.properties.chi).equal((Foo.eyo.properties.chi = 421))
    chai.expect(Foo.eyo.properties).equal(Foo.eyo.properties)
    let Bar = ns.makeC9r('bar', Foo)
    chai.expect(Bar.eyo.properties.chi).equal(Foo.eyo.properties.chi)
  })
  it ('properties(3)', function () {
    let ns = eYo.o4t.makeNS()
    let Foo = ns.makeC9r('foo', {
      properties: {
        chi: 421,
      }
    })
    chai.expect(Foo.eyo.properties.chi.value).equal(421) // expanded
    chai.expect(Foo.eyo.properties).equal(Foo.eyo.properties)
    let Bar = ns.makeC9r('bar', Foo)
    chai.expect(Bar.eyo.properties.chi).equal(Foo.eyo.properties.chi)
  })
  it ('O4t: prepareProperties', function () {
    let O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {})
    chai.expect(O.eyo.super).equal(eYo.o4t.Base.eyo)
    let o = new O()
    chai.assert(!o.foo_p)
    chai.assert(!o.foo)
    eYo.o4t.prepareProperties(o, {
      foo: {
        value: 421
      },
    }) // creates `foo` in the prototype, `foo_p` in the object
    chai.assert(o.hasOwnProperty('foo_p'))
    chai.assert(!o.hasOwnProperty('foo'))
    chai.assert(o.eyo.C9r_p.hasOwnProperty('foo'))
    chai.expect(o.foo).equal(421)
    let oo = new O()
    chai.assert(!oo.foo_p)
    chai.expect(() => {
      oo.foo === eYo.NA // call to oo.foo_p... which does not exist
    }).to.throw()
    eYo.o4t.prepareProperties(oo, {
      foo: {
        value: 123
      },
    })
    chai.expect(oo.foo).equal(123)
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
    ;['foo', 'bar', 'chi'].forEach(k => chai.expect(Object.keys(O.eyo.properties)).include(k))
    var o = new O()
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
    o.chi_ = 421
    chai.expect(o.chi).equal(421)
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
    chai.expect(flag).equal(421)
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
    chai.expect(flag).equal(0)
  })
  it ('O4t: dispose inherited', function () {
    let ns = eYo.o4t.makeNS()
    let Foo = ns.makeC9r('Foo', {
      properties: {
        foo: 421,
      }
    })
    let Bar = ns.makeC9r('Bar', Foo, {
      properties: {
        bar: 123,
      }
    })
    let onr = {}
    var bar = new Bar(onr)
    chai.expect(bar.foo).equal(421)
    chai.expect(bar.bar).equal(123)
    var flag = 0
    console.error('BREAK')
    bar.foo_ = {
      eyo: true,
      dispose(x, y) {
        flag += x * 1000
      },
    }
    bar.bar_ = {
      eyo: true,
      dispose(x, y) {
        flag += y
      },
    }
    bar = bar.dispose(123, 421)
    chai.expect(flag).equal(123421)
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
    chai.expect(o.foo_p).equal(o.bar_p)
    chai.expect(o.foo_).equal(o.bar_)
    chai.expect(o.foo).equal(o.bar)
    chai.expect(o.foo_p).equal(o.bar1_p)
    chai.expect(o.foo_).equal(o.bar1_)
    chai.expect(o.foo).equal(o.bar1)
    chai.expect(o.foo_p).equal(o.bar2_p)
    chai.expect(o.foo_).equal(o.bar2_)
    chai.expect(o.foo).equal(o.bar2)
    o.foo_ = 123 - o.foo_
    chai.expect(o.foo_p).equal(o.bar1_p)
    chai.expect(o.foo_).equal(o.bar1_)
    chai.expect(o.foo).equal(o.bar1)
    chai.expect(o.foo_p).equal(o.bar2_p)
    chai.expect(o.foo_).equal(o.bar2_)
    chai.expect(o.foo).equal(o.bar2)
    chai.expect(o.foo_p).equal(o.bar_p)
    chai.expect(o.foo_).equal(o.bar_)
    chai.expect(o.foo).equal(o.bar)
    o.bar_ = 123 - o.bar_
    chai.expect(o.foo_p).equal(o.bar_p)
    chai.expect(o.foo_).equal(o.bar_)
    chai.expect(o.foo).equal(o.bar)
    chai.expect(o.foo_p).equal(o.bar1_p)
    chai.expect(o.foo_).equal(o.bar1_)
    chai.expect(o.foo).equal(o.bar1)
    chai.expect(o.foo_p).equal(o.bar2_p)
    chai.expect(o.foo_).equal(o.bar2_)
    chai.expect(o.foo).equal(o.bar2)
    o.bar1_ = 123 - o.bar1_
    chai.expect(o.foo_p).equal(o.bar_p)
    chai.expect(o.foo_).equal(o.bar_)
    chai.expect(o.foo).equal(o.bar)
    chai.expect(o.foo_p).equal(o.bar1_p)
    chai.expect(o.foo_).equal(o.bar1_)
    chai.expect(o.foo).equal(o.bar1)
    chai.expect(o.foo_p).equal(o.bar2_p)
    chai.expect(o.foo_).equal(o.bar2_)
    chai.expect(o.foo).equal(o.bar2)
    o.bar2_ = 123 - o.bar2_
    chai.expect(o.foo_p).equal(o.bar_p)
    chai.expect(o.foo_).equal(o.bar_)
    chai.expect(o.foo).equal(o.bar)
    chai.expect(o.foo_p).equal(o.bar1_p)
    chai.expect(o.foo_).equal(o.bar1_)
    chai.expect(o.foo).equal(o.bar1)
    chai.expect(o.foo_p).equal(o.bar2_p)
    chai.expect(o.foo_).equal(o.bar2_)
    chai.expect(o.foo).equal(o.bar2)
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
    chai.expect(bar.chi_p).equal(bar.foo.chi_p)
    bar.chi_ = 421
    chai.expect(bar.chi).equal(bar.foo.chi)
    bar.foo.chi_ = 123
    chai.expect(bar.chi).equal(bar.foo.chi)
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
    chai.expect(foo.foo).equal(flag)
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
    chai.expect(foo.foo).equal(flag)
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
    chai.expect(foo.foo).equal(flag)
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
      chai.expect(a1.foo).equal(0)
      flag = 1
      chai.expect(a1.foo).equal(0)
      chai.expect(a2.foo).equal(1)
      a1.foo_p.reset()
      chai.expect(a1.foo).equal(1)
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
      chai.expect(a.foo_).equal(foo_before)
      chai.assert(a.foo.equals(foo_before))
      a.foo_ = foo_after
      chai.expect(a.foo_).equal(foo_after)
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
    chai.expect(a.bar).equal(69)
    chai.expect(a.foo).equal(6901)
  })
  it ('O4t: configure', function () {
    var ns = eYo.o4t.makeNS()
    ns.makeBase()
    chai.expect(ns).equal(ns.Base.eyo.ns)
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
    chai.expect(flag).equal(421)
    chai.expect(a.foo).equal(421)
    flag = 0
    var aa = new ns.AA()
    chai.assert(flag === 123, `Unexpected flag: ${flag}`)
    chai.expect(aa.foo).equal(123)
  })
  it ('O4t: POC Override rules for properties', function () {
    var ns = eYo.o4t.makeNS()
    ns.makeBase()
    chai.expect(ns).equal(ns.Base.eyo.ns)
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
  it ('O4t: propertiesMerge', function () {
    var ns = eYo.o4t.makeNS()
    ns.makeBase()
    chai.expect(ns).equal(ns.Base.eyo.ns)
    ns.makeC9r('A', {
      properties: {foo: 421}
    })
    chai.expect(ns.A.eyo.properties).property('foo')
    var a = new ns.A()
    chai.expect(a.foo).equal(421)
    chai.assert(!a.bar)
    ns.A.eyo.propertiesMerge({
      bar: 123,
    })
    chai.expect(ns.A.eyo.properties).property('bar')
    chai.expect(a.bar).not.equal(123)
    a = new ns.A()
    chai.expect(a.foo).equal(421)
    chai.expect(a.bar).equal(123)
    ns.makeC9r('B')
    ns.B.makeInheritedC9r('BB')    
    var bb = new ns.BB()
    chai.expect(ns.BB.eyo.properties).not.property('foo')
    chai.expect(bb.foo).not.equal(421)
    var flag = 0
    ns.B.eyo.propertiesMerge({
      foo: {
        value () {
          flag = 666 - flag
          return 421
        }
      },
    })
    chai.expect(ns.B.eyo.properties).property('foo')
    chai.expect(ns.BB.eyo.properties).property('foo')
    chai.expect(flag).not.equal(666)
    chai.expect(bb.foo).not.equal(421)
    bb = new ns.BB()
    chai.expect(flag).equal(666)
    chai.expect(bb.foo).equal(421)
    chai.assert((bb.foo_ = 123) === bb.foo)
    bb.foo_p.reset()
    chai.expect(flag).equal(0)
    chai.expect(bb.foo).equal(421)
  })
  it (`O4t: modelDeclare({...})`, function () {
    let NS = eYo.o4t.makeNS()
    let ns = NS.makeNS('foo')
    ns.makeBase()
    let o = new ns.Base()
    chai.expect(() =>{
      o.bar()
    }).to.throw()
    chai.assert(!o.foo)
    var flag = 0
    chai.assert(!ns.merge)
    ns.modelDeclare({
      properties: {
        foo: 421,
      },
      aliases: {
        foo: 'mi',
      },
      methods: {
        bar () {
          flag = 421 - flag
        }
      }
    })
    chai.assert(ns.merge)
    ns.merge(ns.Base_p)
    o.bar()
    chai.expect(flag).equal(421)
    o = new ns.Base()
    o.bar()
    chai.expect(flag).equal(0)
    chai.expect(o.foo).equal(421)
    chai.expect(o.mi).equal(o.foo)
  })
  it (`O4t: modelDeclare('...', {...})`, function () {
    let NS = eYo.o4t.makeNS()
    let ns = NS.makeNS('foo')
    ns.makeBase()
    let o = new ns.Base()
    chai.expect(() =>{
      o.bar()
    }).to.throw()
    chai.assert(!o.foo)
    var flag = 0
    chai.assert(!ns.chiMerge)
    ns.modelDeclare('chi', {
      properties: {
        foo: 421,
      },
      aliases: {
        foo: 'mi',
      },
      methods: {
        bar () {
          flag = 421 - flag
        }
      }
    })
    chai.assert(ns.chiMerge)
    ns.chiMerge(ns.Base_p)
    o.bar()
    chai.expect(flag).equal(421)
    o = new ns.Base()
    o.bar()
    chai.expect(flag).equal(0)
    chai.expect(o.foo).equal(421)
    chai.expect(o.mi).equal(o.foo)
  })
  it ('O4t: after:...', function () {
    let ns = eYo.o4t.makeNS()
    ns.makeBase()
    var order = []
    ns.makeC9r('Bar', {
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
    let bar = new ns.Bar()
    chai.expect(order).deep.equal(['chi', 'mi', 'foo'])
    chai.expect(bar.foo).equal(123)
    chai.expect(bar.mi).equal(421)
    chai.expect(bar.chi).equal(666)
  })
  it ('O4t: after:../...', function () {
    let ns = eYo.o4t.makeNS()
    ns.makeBase()
    var order = []
    ns.makeC9r('Mud', {
      properties: {
        chi: {
          value () {
            order.push('chi')
            return 666
          },
        },
      },
    })
    ns.Mud.makeInheritedC9r('Bar', {
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
    let bar = new ns.Bar()
    chai.expect(order).deep.equal(['chi', 'mi', 'foo'])
    chai.expect(bar.foo).equal(123)
    chai.expect(bar.mi).equal(421)
    chai.expect(bar.chi).equal(666)
  })
  it ('O4t: prepareProperties(ns,...)', function () {
    let ns = eYo.makeNS()
    eYo.o4t.prepareProperties(ns, {
      foo: 421,
    })
    chai.expect(ns.foo).equal(421)
    chai.assert(!eYo._p.hasOwnProperty('foo'))
  })
  it ('O4t: eYo.o4t.makeC9r("", ...)', function () {
    let model = {
      properties: {
        foo: 421,
      },
    }
    let C9r = eYo.o4t.makeC9r('', model)
    let o = new C9r()
    chai.expect(o.foo).equal(421)
  })
  it ('O4t: eYo.o4t.singleton(...)', function () {
    let model = {
      properties: {
        foo: 421,
      },
    }
    let o = eYo.o4t.singleton(model)
    chai.expect(o.foo).equal(421)
  })
})

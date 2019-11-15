const NS = Object.create(null)

NS.test_link = (x, foo, bar) => {
  const foo_ = foo + '_'
  const foo__ = foo + '__'
  const bar_ = bar + '_'
  const bar__ = bar + '__'
  chai.assert(x[foo__] === eYo.NA && x[foo_] === eYo.NA && x[foo] === eYo.NA)
  chai.assert(x[bar__] === eYo.NA && x[bar_] === eYo.NA && x[bar] === eYo.NA)
  x[foo__] = 421
  chai.assert(x[foo__] === 421 && x[foo_] === 421 && x[foo] === 421)
  chai.assert(x[bar__] === eYo.NA && x[bar_] === eYo.NA && x[bar] === eYo.NA)
  x[bar__] = 123
  chai.assert(x[foo__] === 421 && x[foo_] === 421 && x[foo] === 421)
  chai.assert(x[bar__] === 123 && x[bar_] === 123 && x[bar] === 123)
  chai.expect(() => {x[bar] = 421}).to.throw()
  var eyo = x.constructor.eyo
  while (eyo) {
    eyo.clearLink_(x)
    eyo = eyo.super
  }
  chai.assert(x[foo__] === eYo.NA && x[foo_] === eYo.NA && x[foo] === eYo.NA)
  chai.assert(x[bar__] === eYo.NA && x[bar_] === eYo.NA && x[bar] === eYo.NA)
}

describe ('Constructor', function () {
  describe ('make', function () {
    it ('Missing', function () {
      chai.assert(eYo.Constructor)
      chai.assert(eYo.Constructor.make)
        chai.expect(()=>{
        eYo.Constructor.make()
      }).to.throw()
      chai.expect(()=>{
        eYo.Constructor.make({})
      }).to.throw()
      chai.expect(()=>{
        eYo.Constructor.make({
          super: null
        })
      }).to.throw()
    })
    it ('super: null', function () {
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
           link: ['foo', 'bar'],
        },
      })
      chai.assert(NS.A)
      const a = new NS.A()
      NS.test_link(a, 'foo', 'bar')
    })  
    it ('constructor call', function () {
      var flag = 0
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        init () {
          flag += 1
        }
      })
      var a = new NS.A()
      chai.assert(flag === 1)
      a = new NS.A()
      chai.assert(flag === 2)
    })
    it ('super !== null', function () {
      var flag_A = 0
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        init () {
          flag_A += 1
        },
        props: {
          link: ['foo'],
        },
      })
      chai.assert(NS.A.eyo.link_.has('foo'))
      chai.assert(!NS.A.eyo.link_.has('bar'))
      var flag_AB = 0
      eYo.Constructor.make({
        key: 'AB',
        owner: NS.A,
        super: NS.A,
        init () {
          flag_AB += 1
        },
        props: {
          link: ['bar'],
        },
      })
      chai.assert(NS.A.eyo.link_.has('foo'))
      chai.assert(!NS.A.eyo.link_.has('bar'))
      chai.assert(!NS.A.AB.eyo.link_.has('foo'))
      chai.assert(NS.A.AB.eyo.link_.has('bar'))
      var ab = new NS.A.AB()
      chai.assert(flag_A === 1)
      chai.assert(flag_AB === 1)
      NS.test_link(ab, 'foo', 'bar')
    })  
    it ('multi super !== null', function () {
      var flag_A = 0
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        init () {
          flag_A += 1
        },
        props: {
          link: ['foo'],
       },
     })
      var flag_B = 0
      eYo.Constructor.make({
        key: 'B',
        owner: NS,
        super: null,
        init () {
          flag_B += 1
        },
        props: {
          link: ['foo'],
       },
     })
      var flag_AA = 0
      eYo.Constructor.make({
        key: 'AA',
        owner: NS.A,
        super: NS.A,
        init () {
          flag_AA += 1
        },
        props: {
          link: ['bar'],
       },
     })
      var flag_AB = 0
      eYo.Constructor.make({
        key: 'AB',
        owner: NS.A,
        super: NS.A,
        init () {
          flag_AB += 1
        },
        props: {
          link: ['bar'],
       },
     })
      var flag_BA = 0
      eYo.Constructor.make({
        key: 'BA',
        owner: NS.B,
        super: NS.B,
        init () {
          flag_BA += 1
        },
        props: {
           link: ['bar'],
        },
      })
      var flag_BB = 0
      eYo.Constructor.make({
        key: 'BB',
        owner: NS.B,
        super: NS.B,
        init () {
          flag_BB += 1
        },
        props: {
           link: ['bar'],
        },
      })
      var aa = new NS.A.AA()
      chai.assert(flag_A === 1)
      chai.assert(flag_AA === 1)
      NS.test_link(aa, 'foo', 'bar')
      var ab = new NS.A.AB()
      chai.assert(flag_A === 2)
      chai.assert(flag_AB === 1)
      NS.test_link(ab, 'foo', 'bar')
      var ba = new NS.B.BA()
      chai.assert(flag_B === 1)
      chai.assert(flag_BA === 1)
      NS.test_link(ba, 'foo', 'bar')
      var bb = new NS.B.BB()
      chai.assert(flag_B === 2)
      chai.assert(flag_BB === 1)
      NS.test_link(bb, 'foo', 'bar')
    })
    it ('undefined owner xor super', function () {
      var flag_A = 0
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        init () {
          flag_A += 1
        }
      })
      var flag_B = 0
      eYo.Constructor.make({
        key: 'B',
        owner: NS.A,
        init () {
          flag_B += 1
        },
        props: {
           link: ['foo', 'bar'],
        },
      })
      chai.assert(NS.A.B.superClass_.constructor === NS.A)
      var ab = new NS.A.B()
      chai.assert(flag_A === 1)
      chai.assert(flag_B === 1)
      NS.test_link(ab, 'foo', 'bar')
      eYo.Constructor.make({
        key: 'B',
        super: NS.A,
        init () {
          flag_B += 1
        },
        props: {
           link: ['foo', 'bar'],
        },
      })
      var ab = new NS.A.B()
      chai.assert(flag_A === 2)
      chai.assert(flag_B === 2)
      NS.test_link(ab, 'foo', 'bar')      
    })
  })
  it ('Init', function () {
    var flag_A = 0
    var flag_AB = 0
    eYo.Constructor.make({
      key: 'A',
      owner: NS,
      super: null,
      init () {
        flag_A += 1
      }
    })
    eYo.Constructor.make({
      key: 'AB',
      owner: NS.A,
      init () {
        flag_AB += 1
      }
    })
    chai.assert(NS.A.AB.eyo.super === NS.A.eyo)
    chai.assert(!NS.A.eyo.super)
    var ab = new NS.A.AB()
  })
  describe ('Link', function () {
    it ("Link: declare 'foo' and 'bar' then clear", function () {
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
           link: ['foo', 'bar'],
        },
      })
      chai.assert(NS.A.eyo.ctor === NS.A)
      chai.expect(() => {
        Object.defineProperties(NS.A.prototype, {
          foo_: {
            set (after) {
            }
          }
        })
      }).to.throw()
      chai.assert(NS.A.eyo.link_.has('foo'))
      chai.assert(NS.A.eyo.link_.has('bar'))
      const a = new NS.A()
      NS.test_link(a, 'foo', 'bar')
    })
    it ('Link: hooks', function () {
      var flag = 0
      var foo_before = 421
      var foo_after = 123
      var test = function (before, after) {
        chai.assert(this === a)
        chai.assert(before === foo_before)
        chai.assert(after === foo_after)
      }
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        init (value) {
          this.foo__ = value
        },
        props: {
          link: {
            foo: {
              willChange (before, after) {
                test.call(this, before, after)
                return () => {
                  flag = 421
                }
              },
              didChange: test
            }
          },
        },
      })
      NS.A.prototype.fooWillChange = NS.A.prototype.fooDidChange = test
      var a = new NS.A(foo_before)
      chai.assert(a.foo === foo_before)
      a.foo_ = foo_after
      chai.assert(flag === 421)
    })
  })
  describe('Cached property', function () {
    it ('Cached: Basic', function () {
      var flag = 0
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
          cached: {
            foo: {
              init () {
                return flag
              }
            }
          },
        },
      })
      var a1 = new NS.A()
      var a2 = new NS.A()
      chai.assert(a1.foo === 0)
      flag = 1
      chai.assert(a1.foo === 0)
      chai.assert(a2.foo === 1)
      a1.fooForget()
      chai.assert(a1.foo === 1)
    })
    it ('Cached: Shortcut', function () {
      var flag = 0
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
          cached: {
            foo () {
              return flag
            }
          },
        },
      })
      var a1 = new NS.A()
      var a2 = new NS.A()
      chai.assert(a1.foo === 0)
      flag = 1
      chai.assert(a1.foo === 0)
      chai.assert(a2.foo === 1)
      a1.fooForget()
      chai.assert(a1.foo === 1)
    })
    it ('Cached: Two objects', function () {
      var flag_A1 = 0
      var flag_A2 = 1
      var flag_B1 = 2
      var flag_B2 = 3
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
          cached: {
            foo1: {
              init () {
                return flag_A1
              }
            },
            foo2: {
              init () {
                return flag_A2
              }
            }
          },
        },
      })
      eYo.Constructor.make({
        key: 'B',
        owner: NS,
        super: null,
        props: {
          cached: {
            foo1: {
              init () {
                return flag_B1
              }
            },
            foo2: {
              init () {
                return flag_B2
              }
            }
          },
        },
      })
      var a = new NS.A()
      var b = new NS.B()
      var test = (a1, a2, b1, b2) => {
        chai.assert(a.foo1 === a1)
        chai.assert(a.foo2 === a2)
        chai.assert(b.foo1 === b1)
        chai.assert(b.foo2 === b2)
      }
      test(0, 1, 2, 3)
      flag_A1 = 10
      test(0, 1, 2, 3)
      a.foo1Forget()
      test(10, 1, 2, 3)
      flag_A2 = 11
      test(10, 1, 2, 3)
      a.foo2Forget()
      test(10, 11, 2, 3)
      flag_B1 = 12
      test(10, 11, 2, 3)
      b.foo1Forget()
      test(10, 11, 12, 3)
      flag_B2 = 13
      test(10, 11, 12, 3)
      b.foo2Forget()
      test(10, 11, 12, 13)
    })
    it ('Cached: Inherit cached', function () {
      var flag_1 = 0
      var flag_2 = 1
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
          cached: {
            foo1: {
              init () {
                return flag_1
              }
            }
          },
        },
      })
      eYo.Constructor.make({
        key: 'AB',
        owner: NS.A,
        props: {
          cached: {
            foo2: {
              init () {
                return flag_2
              }
            }
          },
        },
      })
      var ab = new NS.A.AB()
      var test = (f1, f2) => {
        chai.assert(ab.foo1 === f1)
        chai.assert(ab.foo2 === f2)
      }
      test(0, 1)
      flag_1 = 10
      test(0, 1)
      ab.foo1Forget()
      test(10, 1)
      flag_2 = 11
      test(10, 1)
      ab.foo2Forget()
      test(10, 11)
    })
    it ('Cached: forget', function () {
      var flag = 123
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
          cached: {
            foo: {
              init () {
                return flag
              },
              forget (forgetter) {
                flag += 100
                forgetter()
              }
            }
          },
        },
      })
      var a = new NS.A()
      chai.assert(a.foo === 123)
      flag = 421
      a.fooForget()
      chai.assert(a.foo === 521)
    })
    it ('Cached: updater basic', function () {
      var flag = 421
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
          cached: {
            foo: {
              init () {
                return flag
              }
            }
          },
        },
      })
      var a = new NS.A()
      chai.assert(a.foo === 421)
      flag = 521
      a.fooUpdate()
      chai.assert(a.foo__ === 521)
    })
    it ('Cached: updater no override', function () {
      var flag = 421
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
          cached: {
            foo: {
              init () {
                return flag
              },
              update (before, after, updater) {
                flag = 0
                if (before === 421) {
                  flag += 1
                }
                if (after === 123) {
                  flag += 10
                }
                updater()
              }
            }
          },
        },
      })
      var a = new NS.A()
      chai.assert(a.foo === 421)
      flag = 123
      a.fooUpdate()
      chai.assert(flag === 11)
      chai.assert(a.foo === 11)
    })
    it ('Cached: updater with override', function () {
      var flag = 421
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
          cached: {
            foo: {
              init () {
                return flag
              },
              update (before, after, updater) {
                updater(flag+100)
              }
            }
          },
        },
      })
      var a = new NS.A()
      chai.assert(a.foo === 421)
      a.fooUpdate()
      chai.assert(a.foo === 521)
    })
  })
  describe('Owned', function () {
    it ('Owned: Basic', function () {
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
          owned: ['foo']
        },
      })
      var a = new NS.A()
      chai.expect(() => {a.foo = 1}).to.throw()
      var B = function () {}
      B.prototype.dispose = function () {
        this.disposed_ = true
      }
      var b = new B()
      chai.assert(b.owner_ === eYo.NA)
      chai.assert(b.ownerKey_ === eYo.NA)
      chai.assert(!b.disposed_)
      a.foo_ = b
      chai.assert(b.owner_ === a)
      chai.assert(b.ownerKey_ === 'foo_')
      chai.assert(a.foo === b)
      chai.assert(a.foo_ === b)
      chai.assert(a.foo__ === b)
      a.dispose()
      chai.assert(a.foo === eYo.NA)
      chai.assert(a.foo_ === eYo.NA)
      chai.assert(a.foo__ === eYo.NA)
      chai.assert(b.owner_ === eYo.NA)
      chai.assert(b.ownerKey_ === eYo.NA)
      chai.assert(b.disposed_)
    })
    it ('Owned: Two instances', function () {
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
          owned: ['foo']
        },
      })
      var a1 = new NS.A()
      var a2 = new NS.A()
      var B = function () {}
      var b1 = new B()
      a1.foo_ = b1
      var b2 = new B()
      a2.foo_ = b2
      var test1 = (a,b) => {
        chai.assert(a.foo === b)
        chai.assert(b.owner_ === a)
        chai.assert(b.ownerKey_ === 'foo_')
      }
      test1(a1, b1)
      test1(a2, b2)
      a1.foo_ = eYo.NA
      var test2 = (a, b) => {
        chai.assert(a.foo === eYo.NA)
        chai.assert(b.owner_ === eYo.NA)
        chai.assert(b.ownerKey_ === eYo.NA)
      }
      test2(a1, b1)
      test1(a2, b2)
      a2.foo_ = b1
      test2(a1, b2)
      test1(a2, b1)
      a1.foo_ = b2
      test1(a1, b2)
      test1(a2, b1)
      a1.foo_ = b1
      test2(a2, b2)
      test1(a1, b1)
      a2.foo_ = b2
      test1(a2, b2)
      test1(a1, b1)
    })
    it ('Owned: Two keys', function () {
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
          owned: ['foo1', 'foo2']
        },
      })
      var a = new NS.A()
      var B = function () {}
      B.prototype.dispose = function () {
        this.disposed_ = true
      }
      var b1 = new B()
      var b2 = new B()
      var test = (foo1, foo2, bb1, bb2) => {
        chai.assert(a.foo1 === foo1)
        chai.assert(a.foo2 === foo2)
        foo1 && chai.assert(foo1.owner_ === a)
        foo1 && chai.assert(foo1.ownerKey_ === 'foo1_')
        foo2 && chai.assert(foo2.owner_ === a)
        foo2 && chai.assert(foo2.ownerKey_ === 'foo2_')
        bb1 && chai.assert(bb1.owner_ === eYo.NA)
        bb1 && chai.assert(bb1.ownerKey_ === eYo.NA)
        bb2 && chai.assert(bb2.owner_ === eYo.NA)
        bb2 && chai.assert(bb2.ownerKey_ === eYo.NA)
      }
      test()
      a.foo1_ = b1
      test(b1)
      a.foo2_ = b2
      test(b1, b2)
      a.foo1_ = b2
      test(b2, eYo.NA, b1)
      a.foo2_ = b2
      test(eYo.NA, b2, b1)
      a.foo2_ = b1
      test(eYo.NA, b1, b2)
      a.foo1_ = b1
      test(b1, eYo.NA, b2)
      a.foo2_ = b2
      test(b1, b2)
      a.foo2_ = eYo.NA
      test(b1, eYo.NA, b2)
      a.foo1_ = eYo.NA
      test(eYo.NA, eYo.NA, b1, b2)
    })
    it ('Owned: Inherit', function () {
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
          owned: ['foo']
        },
      })
      eYo.Constructor.make({
        key: 'AB',
        owner: NS.A,
        props: {
          owned: ['bar']
        },
      })
      var a = new NS.A()
      var ab = new NS.A.AB()
      var B = function () {}
      B.prototype.dispose = function () {
        this.disposed_ = true
      }
      var foo = new B()
      var bar = new B()
      var test = (af, abf, abb, f, b) => {
        chai.assert(a.foo === af)
        af && chai.assert(af.owner_ === a)
        af && chai.assert(af.ownerKey_ === 'foo_')
        chai.assert(ab.foo === abf)
        chai.assert(ab.bar === abb)
        abf && chai.assert(abf.owner_ === ab)
        abf && chai.assert(abf.ownerKey_ === 'foo_')
        abb && chai.assert(abb.owner_ === ab)
        abb && chai.assert(abb.ownerKey_ === 'bar_')
        f && chai.assert(f.owner_ === eYo.NA)
        f && chai.assert(f.ownerKey_ === eYo.NA)
        b && chai.assert(b.owner_ === eYo.NA)
        b && chai.assert(b.ownerKey_ === eYo.NA)
      }
      test(eYo.NA, eYo.NA, eYo.NA, foo, bar)
      ab.foo_ = foo
      test(eYo.NA, foo, eYo.NA, bar)
      ab.bar_ = bar
      test(eYo.NA, foo, bar)
      ab.bar_ = eYo.NA
      test(eYo.NA, foo, eYo.NA, bar)
      ab.foo_ = eYo.NA
      test(eYo.NA, eYo.NA, eYo.NA, foo, bar)
      ab.bar_ = bar
      test(eYo.NA, eYo.NA, bar, foo)
      ab.foo_ = foo
      test(eYo.NA, foo, bar)
      a.foo_ = foo
      test(foo, eYo.NA, bar)
      ab.foo_ = foo
      test(eYo.NA, foo, bar)
      a.foo_ = bar
      test(bar, foo)
      ab.bar_ = bar
      test(eYo.NA, foo, bar)
      ab.foo_ = bar
      test(eYo.NA, bar, eYo.NA, foo)
      ab.bar_ = foo
      test(eYo.NA, bar, foo)
      ab.foo_ = foo
      test(eYo.NA, foo, eYo.NA, bar)
    })
    it ('Owned: hooks', function () {
      var flag = 0
      var B = function (value) {
        this.value_ = value
      }
      var foo_before = new B(421)
      var foo_after = new B(123)
      var test = function (before, after) {
        chai.assert(this === a)
        chai.assert(before === foo_before)
        chai.assert(after === foo_after)
      }
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        init (value) {
          this.foo__ = value
        },
        props: {
          owned: {
            foo: {
              willChange (before, after) {
                test.call(this, before, after)
                return () => {
                  flag = 421
                }
              },
              didChange: test
            }
          },
        },
      })
      NS.A.prototype.fooWillChange = NS.A.prototype.fooDidChange = test
      var a = new NS.A(foo_before)
      chai.assert(a.foo === foo_before)
      a.foo_ = foo_after
      chai.assert(flag === 421)
    })
  })
  describe ('Clonable', function () {
    it ('Clonable: Basic', function () {
      var B = function (value) {
        this.value_ = value
      }
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
          clonable: {
            foo () {
              return new B()
            }
          }
        },
      })
      B.prototype.dispose = function () {
        this.disposed_ = true
      }
      B.prototype.set = function (other) {
        this.value_ = other.value_
      }
      B.prototype.equals = function (other) {
        return this.value_ === other.value_
      }
      Object.defineProperty(B.prototype, 'clone', {
        get () {
          return new B(this.value_)
        }
      })
      var a = new NS.A()
      chai.expect(() => {a.foo = 1}).to.throw()
      var b = new B(421)
      var bb = new B(123)
      chai.assert(a.foo !== eYo.NA)
      chai.assert(a.foo.value_ === eYo.NA)
      a.foo_ = b
      chai.assert(a.foo.value_ === b.value_)
      chai.assert(a.foo.value_ === 421)
      a.foo_ = bb
      chai.assert(a.foo.value_ === bb.value_)
      chai.assert(a.foo.value_ === 123)
      b = a.foo__
      a.dispose()
      chai.assert(a.foo__ === eYo.NA)
      chai.expect(() => {
        a.foo_ === eYo.NA
      }).to.throw()
      chai.expect(() => {
        a.foo === eYo.NA
      }).to.throw()
      chai.assert(b.disposed_)
    })
    it ('Clonable: hooks', function () {
      var flag = 0
      var B = function (owner, value) {
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
      Object.defineProperty(B.prototype, 'clone', {
        get () {
          return new B(this.value_)
        }
      })
      var foo_before = new B(421)
      var foo_after = new B(123)
      var test = function (before, after) {
        chai.assert(this === a)
        chai.assert(before === foo_before)
        chai.assert(after === foo_after)
      }
      eYo.Constructor.make({
        key: 'A',
        owner: NS,
        super: null,
        props: {
          clonable: {
            foo: {
              init () {
                return foo_before
              },
              willChange (before, after) {
                test.call(this, before, after)
                return () => {
                  flag = 421
                }
              },
              didChange: test
            }
          },
        },
      })
      NS.A.prototype.fooWillChange = NS.A.prototype.fooDidChange = test
      var a = new NS.A(foo_before)
      chai.assert(a.foo__ === foo_before)
      chai.assert(a.foo.equals(foo_before))
      a.foo_ = foo_after
      chai.assert(a.foo__ === foo_before)
      chai.assert(a.foo.equals(foo_after))
    })
  })
  describe ('No collision', function () {
    var params = (props) => {
      return {
        key: 'A',
        owner: NS,
        super: null,
        props: props,
      }
    }
    it ('No collision: link + cached', function () {
      chai.expect(() => {
        eYo.Constructor.make(params({
          link: ['foo'],
          cached: {
            foo () {}
          }
        }))
      }).to.throw()
    })
    it ('No collision: link + owned', function () {
      chai.expect(() => {
        eYo.Constructor.make(params({
          link: ['foo'],
          owned: ['foo'],
        }))
      }).to.throw()
    })
    it ('No collision: link + clonable', function () {
      chai.expect(() => {
        eYo.Constructor.make(params({
          link: ['foo'],
          clonable: {
            foo () {}
          },
        }))
      }).to.throw()
    })
    it ('No collision: cached + owned', function () {
      chai.expect(() => {
        eYo.Constructor.make(params({
          cached: {
            foo () {}
          },
          owned: ['foo'],
        }))
      }).to.throw()
    })
    it ('No collision: cached + clonable', function () {
      chai.expect(() => {
        eYo.Constructor.make(params({
          cached: {
            foo () {}
          },
          clonable: {
            foo () {}
          },
        }))
      }).to.throw()
    })
    it ('No collision: owned + clonable', function () {
      chai.expect(() => {
        eYo.Constructor.make(params({
          owned: ['foo'],
          clonable: {
            foo () {}
          },
        }))
      }).to.throw()
    })
  })
})

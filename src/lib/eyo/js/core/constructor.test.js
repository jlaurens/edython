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
        f () {
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
        f () {
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
        f () {
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
        f () {
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
        f () {
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
        f () {
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
        f () {
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
        f () {
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
        f () {
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
        f () {
          flag_A += 1
        }
      })
      var flag_B = 0
      eYo.Constructor.make({
        key: 'B',
        owner: NS.A,
        f () {
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
        f () {
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
  it ('Overload', function () {
    var flag_A = 0
    eYo.Constructor.make({
      key: 'A',
      owner: NS,
      super: null,
      f () {
        flag_A += 1
      }
    })
    eYo.Constructor.overloadInit(function () {
      flag_A += 100
    })
    var a = new NS.A()
    chai.assert(flag_A === 101)
    eYo.Constructor.overloadInit(function () {
      flag_A -= 200
    })
    var a = new NS.A()
    chai.assert(flag_A === 2)
    eYo.Constructor.overloadInit(function () {
      flag_A += 100
    })
    var a = new NS.A()
    chai.assert(flag_A === 3)
    var a = new NS.A()
    chai.assert(flag_A === 4)
  })
  it ('Init', function () {
    var flag_A = 0
    var flag_AB = 0
    eYo.Constructor.make({
      key: 'A',
      owner: NS,
      super: null,
      f () {
        flag_A += 1
      }
    })
    eYo.Constructor.make({
      key: 'AB',
      owner: NS.A,
      f () {
        flag_AB += 1
      }
    })
    chai.assert(NS.A.AB.eyo.super === NS.A.eyo)
    chai.assert(!NS.A.eyo.super)
    var ab = new NS.A.AB()
  })
describe ('Link', function () {
    it ("declare 'foo' and 'bar' then clear", function () {
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
  })
})

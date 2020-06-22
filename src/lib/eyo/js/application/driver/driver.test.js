describe('driver', function() {
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
  it ('Driver: newDriverC9r inherits', function () {
    var NS = eYo.driver.newNS()
    NS.newDriverC9r('Foo', {
      init (key, owner, ...$) {
        owner.flag(...$, 4)
      }
    })
    chai.expect(NS.getDriverC9r('Foo')).equal(NS.Foo)
    new NS.Foo('foo', onr, 2, 3)
    flag.expect(1234)
    NS._p.flag = (...$) => {
      flag.push(1, ...$)
    }
    var fooDrvr = NS.getDriver('Foo', 2, 3)
    flag.expect(1234)
    chai.expect(fooDrvr[eYo.$$.target]).not.undefined
    chai.expect(fooDrvr[eYo.$$.target]).instanceOf(NS.Foo)
    chai.expect(fooDrvr).equal(NS.getDriver('Foo'))
    var NSNS = NS.newNS()
    chai.expect(NSNS.Foo).equal(NS.Foo)
    chai.expect(NSNS.getDriverC9r('Foo')).undefined
    new NSNS.Foo('foo', onr, 2, 3)
    flag.expect(1234)
    var fooSubDrvr = NSNS.getDriver('Foo')
    flag.expect(0)
    chai.expect(fooSubDrvr[eYo.$$.target]).instanceOf(NS.Foo)
    chai.expect(fooSubDrvr).equal(NSNS.getDriver('Foo'))
  })
  it ('Driver: newDriverC9r inherits (2)', function () {
    var NS = eYo.driver.newNS()
    NS.newDriverC9r('Foo', {
      init (key, owner, ...$) {
        owner.flag(2, ...$)
      },
    })
    chai.expect(NS.Foo).eyo_C9r
    new NS.Foo('foo', onr, 3, 4)
    flag.expect(1234)
    NS.newNS('a')
    chai.expect(NS.a.super).equal(NS)
    NS.a.newDriverC9r('Foo', {
      init (key, owner, ...$) {
        owner.flag(3, ...$)
      },
    })
    chai.expect(NS.a.Foo).eyo_C9r
    chai.expect(NS.a.Foo[eYo.$SuperC9r]).equal(NS.Foo)
    new NS.a.Foo('foo', onr, 4, 5)
    flag.expect(12451345)
  })
  it ('Driver: newDriverC9r concurrent', function () {
    var NS = eYo.driver.newNS()
    NS.newDriverC9r('Foo', {
      init (key, owner, ...$) {
        owner.flag(2, ...$)
      },
      doInitUI (what, ...$) {
        what.flag(2, ...$)
        return true
      },
      doDisposeUI (what, ...$) {
        what.flag(...$, 4)
      },
    })
    NS.newDriverC9r('Bar', {
      init (key, owner, ...$) {
        owner.flag(2, ...$)
      },
      doInitUI (what, ...$) {
        what.flag(2, ...$)
        return true
      },
      doDisposeUI (what, ...$) {
        what.flag(...$, 4)
      },
    })
    var foo = new NS.Foo('foo', onr, 3, 4)
    flag.expect(1234)
    chai.expect(foo.doInitUI(onr, 3, 4)).true
    flag.expect(1234)
    foo.doDisposeUI(onr, 2, 3)
    flag.expect(1234)
    var bar = new NS.Bar('bar', onr, 3, 4)
    flag.expect(1234)
    chai.expect(bar.doInitUI(onr, 3, 4)).true
    chai.expect(1234)
    bar.doDisposeUI(onr, 2, 3)
    chai.expect(1234)
  })
  it ('Driver: diamond', function () {
    var NS = eYo.driver.newNS()
    NS._p.flag = (...$) => {
      flag.push(1, ...$)
    }
    NS.makeBaseC9r({
      methods: {
        base (...$) {
          this.owner.flag(2, ...$)
        },
      },
    })
    chai.expect(NS.BaseC9r.prototype.base).eyo_F
    var base = NS.new('base', onr)
    chai.expect(base).instanceOf(NS.BaseC9r)
    base.base(3, 4)
    flag.expect(1234)
    var C9r = NS.newDriverC9r('Foo', {
      methods: {
        foo (...$) {
          this.owner.flag(3, ...$)
        },
      },
    })
    chai.expect(C9r).equal(NS.Foo)
    var foo = NS.getDriver('Foo')
    foo.foo(5, 7)
    flag.expect(1357)
    NS.newNS('chi')
    NS.chi.makeBaseC9r({
      methods: {
        chi (...$) {
          this.owner.flag(4, ...$)
        },
      },
    })
    var chi = NS.chi.getDriver('')
    chi.chi(7)
    flag.expect(147)
    var C9r = NS.chi.newDriverC9r('Foo', {
      methods: {
        mee (...$) {
          this.owner.flag(5, ...$)
        },
      },
    })
    chai.expect(C9r).equal(NS.chi.Foo)
    var drvr = new NS.chi.Foo('foo', onr)
    drvr.base(3)
    flag.expect(123)
    drvr.foo(5)
    flag.expect(135)
    chai.expect(() => {
      drvr.chi(7)
      flag.expect(147)
    }).throw()
    drvr.mee(9)
    flag.expect(159)
    var diamond = NS.chi.getDriver('Foo')
    diamond.base(3)
    flag.expect(123)
    diamond.foo(5)
    flag.expect(135)
    diamond.chi(7)
    flag.expect(147)
    diamond.mee(9)
    flag.expect(159)
  })
})


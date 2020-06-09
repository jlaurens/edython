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
    chai.expect(NS.makeMngr({
      methods: {
        flag (...$) {
          flag.push(1, ...$)
        },
      },
    })).equal(NS.mngr)
    NS.mngr.newDriverC9r('Foo', {
      init (key, owner, ...$) {
        owner.flag(...$, 4)
      }
    })
    chai.expect(NS.mngr.getDriverC9r('Foo')).equal(NS.Foo)
    new NS.Foo('foo', onr, 2, 3)
    flag.expect(1234)
    var fooDrvr = NS.mngr.getDriver('Foo')
    flag.expect(14)
    chai.expect(fooDrvr).instanceOf(NS.Foo)
    chai.expect(fooDrvr).not.equal(NS.mngr.baseDriver)
    chai.expect(fooDrvr).equal(NS.mngr.getDriver('Foo'))
    chai.expect(fooDrvr).not.property(eYo.Sym$.target)
    var NSNS = NS.newNS()
    NSNS.makeMngr()
    var Foo = NSNS.mngr.newDriverC9r('Foo', {
      init (key, owner, ...$) {
        owner.flag(...$, 5)
      }
    })
    chai.expect(NSNS.Foo).equal(Foo)
    chai.expect(NSNS.Foo).eyo_C9r
    chai.expect(NSNS.Foo).eyo_Subclass(NS.Foo)
    chai.expect(NSNS.mngr.getDriverC9r('Foo')).equal(Foo)
    new NSNS.Foo('foo', onr, 2, 3)
    flag.expect(12341235)
    var fooSubDrvr = NSNS.mngr.getDriver('Foo')
    flag.expect(1415)
    chai.expect(fooSubDrvr).instanceOf(Foo)
    chai.expect(fooSubDrvr).not.equal(NSNS.mngr.baseDriver)
    chai.expect(fooSubDrvr).equal(NSNS.mngr.getDriver('Foo'))
    chai.expect(fooSubDrvr).property(eYo.Sym$.target)
   })
  it ('Driver: newDriverC9r inherits (2)', function () {
    var NS = eYo.driver.newNS()
    NS.makeMngr()
    NS.mngr.newDriverC9r('Foo', {
      init (key, owner, ...$) {
        owner.flag(2, ...$)
      },
    })
    chai.expect(NS.Foo).eyo_C9r
    new NS.Foo('foo', onr, 3, 4)
    flag.expect(1234)
    NS.newNS('a')
    NS.a.makeMngr()
    chai.expect(NS.a.super).equal(NS)
    NS.a.mngr.newDriverC9r('Foo', {
      init (key, owner, ...$) {
        owner.flag(3, ...$)
      },
    })
    chai.expect(NS.a.Foo).eyo_C9r
    chai.expect(NS.a.Foo[eYo.$SuperC9r]).equal(NS.Foo)
    new NS.a.Foo('foo', onr, 4, 5)
    flag.expect(12451345)
  })
  it ('Driver: newDriverC9r with model', function () {
    var NS = eYo.driver.newNS()
    NS.makeMngr()
    NS.mngr.newDriverC9r('Foo', {
      init (key, owner, ...$) {
        flag.push(1, ...$)
      },
      ui: {
        doInit (what, ...$) {
          flag.push(2, ...$)
          return true
        },
        doDispose (what, ...$) {
          flag.push(3, ...$)
        }
      },
    })
    var foo = new NS.Foo('foo', onr, 2, 3)
    flag.expect(123)
    chai.expect(foo.doInitUI(2, 3, 4)).true
    flag.expect(234)
    foo.doDisposeUI(3, 4, 5)
    flag.expect(345)
  })
  it ('Driver: newDriverC9r concurrent', function () {
    var NS = eYo.driver.newNS()
    NS.makeMngr()
    NS.mngr.newDriverC9r('Foo', {
      init (key, owner, ...$) {
        flag.push(1, ...$)
      },
      ui: {
        doInit (what, ...$) {
          flag.push(2, ...$)
          return true
        },
        doDispose (what, ...$) {
          flag.push(3, ...$)
        },
      },
    })
    NS.mngr.newDriverC9r('Bar', {
      init (key, owner, ...$) {
        flag.push(4, ...$)
      },
      ui: {
        doInit (what, ...$) {
          flag.push(5, ...$)
          return true
        },
        doDispose (what, ...$) {
          flag.push(6, ...$)
        },
      },
    })
    var foo = new NS.Foo('foo', onr, 2, 3)
    flag.expect(123)
    chai.expect(foo.doInitUI(0, 3, 4)).true
    flag.expect(234)
    foo.doDisposeUI(0, 4, 5)
    flag.expect(345)
    var bar = new NS.Bar('bar', onr, 5, 6)
    flag.expect(456)
    chai.expect(bar.doInitUI(0, 6, 7)).true
    chai.expect(567)
    bar.doDisposeUI(0, 7, 8)
    chai.expect(678)
  })
  it ('Driver: diamond', function () {
    var NS = eYo.driver.newNS()
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
    NS.makeMngr()
    var C9r = NS.mngr.newDriverC9r('Foo', {
      methods: {
        foo (...$) {
          this.owner.flag(3, ...$)
        },
      },
    })
    chai.expect(C9r).equal(NS.Foo)
    var foo = new NS.Foo('foo', onr)
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
    var chi = NS.chi.new('chi', onr)
    chi.chi(7)
    flag.expect(147)
    NS.chi.makeMngr({
      methods: {
        flag (...$) {
          flag.push(1, ...$)
        },
      },
    })
    var C9r = NS.chi.mngr.newDriverC9r('Foo', {
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
    var diamond = NS.chi.mngr.getDriver('Foo')
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


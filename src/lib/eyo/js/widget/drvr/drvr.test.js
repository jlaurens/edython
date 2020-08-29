describe('drvr', function() {
  this.timeout(20000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c9r && eYo.c9r.new({
      methods: {
        flag (what, ...$) {
          eYo.flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  })
  it ('Drvr: newDrvrC9r inherits', function () {
    var NS = eYo.drvr.newNS()
    NS.newDrvrC9r('Foo', {
      init (key, owner, ...$) {
        owner.flag(...$, 4)
      }
    })
    chai.expect(NS.getDrvrC9r('Foo')).equal(NS.Foo)
    new NS.Foo('foo', onr, 2, 3)
    eYo.flag.expect(1234)
    NS._p.flag = (...$) => {
      eYo.flag.push(1, ...$)
    }
    var fooDrvr = NS.getDrvr('Foo', 2, 3)
    eYo.flag.expect(1234)
    chai.expect(fooDrvr[eYo.$$.target]).not.undefined
    chai.expect(fooDrvr[eYo.$$.target]).instanceOf(NS.Foo)
    chai.expect(fooDrvr).equal(NS.getDrvr('Foo'))
    var NSNS = NS.newNS()
    chai.expect(NSNS.Foo).equal(NS.Foo)
    chai.expect(NSNS.getDrvrC9r('Foo')).undefined
    new NSNS.Foo('foo', onr, 2, 3)
    eYo.flag.expect(1234)
    var fooSubDrvr = NSNS.getDrvr('Foo')
    eYo.flag.expect(0)
    chai.expect(fooSubDrvr[eYo.$$.target]).instanceOf(NS.Foo)
    chai.expect(fooSubDrvr).equal(NSNS.getDrvr('Foo'))
  })
  it ('Drvr: newDrvrC9r inherits (2)', function () {
    var NS = eYo.drvr.newNS()
    NS.newDrvrC9r('Foo', {
      init (key, owner, ...$) {
        owner.flag(2, ...$)
      },
    })
    chai.expect(NS.Foo).eyo_C9r
    new NS.Foo('foo', onr, 3, 4)
    eYo.flag.expect(1234)
    NS.newNS('a')
    chai.expect(NS.a.$super).equal(NS)
    NS.a.newDrvrC9r('Foo', {
      init (key, owner, ...$) {
        owner.flag(3, ...$)
      },
    })
    chai.expect(NS.a.Foo).eyo_C9r
    chai.expect(NS.a.Foo[eYo.$SuperC9r]).equal(NS.Foo)
    new NS.a.Foo('foo', onr, 4, 5)
    eYo.flag.expect(12451345)
  })
  it ('Drvr: newDrvrC9r concurrent', function () {
    var NS = eYo.drvr.newNS()
    NS.newDrvrC9r('Foo', {
      init (key, owner, ...$) {
        owner.flag(2, ...$)
      },
      do_initUI (what, ...$) {
        what.flag(2, ...$)
        return true
      },
      do_disposeUI (what, ...$) {
        what.flag(...$, 4)
      },
    })
    NS.newDrvrC9r('Bar', {
      init (key, owner, ...$) {
        owner.flag(2, ...$)
      },
      do_initUI (what, ...$) {
        what.flag(2, ...$)
        return true
      },
      do_disposeUI (what, ...$) {
        what.flag(...$, 4)
      },
    })
    var foo = new NS.Foo('foo', onr, 3, 4)
    eYo.flag.expect(1234)
    chai.expect(foo.do_initUI(onr, 3, 4)).true
    eYo.flag.expect(1234)
    foo.do_disposeUI(onr, 2, 3)
    eYo.flag.expect(1234)
    var bar = new NS.Bar('bar', onr, 3, 4)
    eYo.flag.expect(1234)
    chai.expect(bar.do_initUI(onr, 3, 4)).true
    chai.expect(1234)
    bar.do_disposeUI(onr, 2, 3)
    chai.expect(1234)
  })
  it ('Drvr: diamond', function () {
    // the root namespace
    var root = eYo.drvr.newNS()
    root._p.flag = (...$) => {
      eYo.flag.push(1, ...$)
    }
    root.makeC9rBase({
      methods: {
        fromC9rBase (...$) {
          this.owner.flag(2, ...$)
        },
      },
    })
    chai.expect(root.C9rBase_p.fromC9rBase).eyo_F
    // base root driver
    var rootDrvr = root.new('root', onr)
    chai.expect(rootDrvr).instanceOf(root.C9rBase)
    rootDrvr.fromC9rBase(3, 4)
    eYo.flag.expect(1234)
    // inherited Foo driver <- base
    root.newDrvrC9r('Foo', {
      methods: {
        fromFoo (...$) {
          this.owner.flag(3, ...$)
        },
      },
    })
    var foo = root.getDrvr('Foo')
    chai.expect(foo).instanceOf(root.Foo)
    foo.fromC9rBase(3, 4)
    eYo.flag.expect(1234)
    foo.fromFoo(5, 7)
    eYo.flag.expect(1357)
    // Inherited namespace
    root.newNS('chi')
    root.chi.makeC9rBase({
      methods: {
        fromChiC9rBase (...$) {
          this.owner.flag(4, ...$)
        },
      },
    })
    var rootChiDrvr = root.chi.getDrvr('')
    rootChiDrvr.fromC9rBase(3)
    eYo.flag.expect(123)
    rootChiDrvr.fromChiC9rBase(7)
    eYo.flag.expect(147)
    root.chi.newDrvrC9r('Foo', {
      methods: {
        fromChiFoo (...$) {
          this.owner.flag(5, ...$)
        },
      },
    })
    let chi = root.chi.new({}, 'chi', onr)
    chi.fromChiC9rBase(7)
    eYo.flag.expect(147)
    var rootChiFoo = new root.chi.Foo('foo', onr)
    // Next is a driver
    rootChiFoo.fromC9rBase(3)
    eYo.flag.expect(123)
    rootChiFoo.fromFoo(5)
    eYo.flag.expect(135)
    chai.expect(() => {
      rootChiFoo.fromChiC9rBase(7)
      eYo.flag.expect(147)
    }).throw()
    rootChiFoo.fromChiFoo(9)
    eYo.flag.expect(159)
    var diamond = root.chi.getDrvr('Foo')
    // This is a proxy to the preceding driver
    // This is a diamond because it implements messages
    // from different origins
    diamond.fromC9rBase(3)
    eYo.flag.expect(123)
    diamond.fromFoo(5)
    eYo.flag.expect(135)
    diamond.fromChiC9rBase(7)
    eYo.flag.expect(147)
    diamond.fromChiFoo(9)
    eYo.flag.expect(159)
  })
})


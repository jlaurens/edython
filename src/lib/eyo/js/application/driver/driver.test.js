describe('driver', function() {
  it ('Driver: Basic', function () {
    chai.assert(eYo.driver)
    chai.assert(eYo.isF(eYo.driver.Dlgt))
    chai.assert(eYo.isF(eYo.driver.Dflt))
    chai.assert(eYo.isF(eYo.driver.DlgtMngr))
    chai.assert(eYo.isF(eYo.driver.makeMngr))
    chai.assert(eYo.isF(eYo.driver.makeDriverC9r))
  })
  it ('Driver: Dflt', function () {
    var d = new eYo.driver.Dflt(NS)
    chai.assert(d)
    chai.assert(eYo.isF(d.initUI))
    chai.assert(eYo.isF(d.disposeUI))
  })
  it ('Driver: makeMngr', function () {
    var ns = eYo.driver.makeNS()
    ns.makeMngr()
    chai.assert(ns.Mngr)
    chai.assert(ns.Mngr.eyo.C9r === ns.Mngr)
    chai.assert(ns.Mngr.eyo.constructor === eYo.driver.DlgtMngr)
    chai.assert(ns.makeMngr)
    chai.assert(ns.makeDriverC9r)
    chai.assert(ns.Dflt === eYo.driver.Dflt)
    chai.assert(ns.Dlgt === eYo.driver.Dlgt)
    chai.assert(ns.DlgtMngr === eYo.driver.DlgtMngr)
    ns.makeNS('a')
    ns.a.makeMngr()
  })
  it ('Driver: manager', function () {
    var ns = eYo.driver.makeNS()
    ns.makeMngr()
    chai.assert(ns.Mngr)
    chai.assert(ns.Mngr.eyo.constructor === ns.DlgtMngr)
    var onr = {}
    onr.mngr = new ns.Mngr(onr)
    chai.assert(onr.mngr)
    chai.assert(onr.mngr.owner === onr)
    chai.assert(onr.mngr.allPurposeDriver)
  })
  it ('Driver: makeDriverC9r basic', function () {
    var ns = eYo.driver.makeNS()
    ns.makeMngr()
    ns.makeDriverC9r('Foo')
    chai.assert(eYo.isF(ns.Foo))
    var foo = new ns.Foo(NS)
    chai.assert(foo.doInitUI)
    chai.assert(!foo.doInitUI())
    chai.expect(() => {
      foo.disposeUI()
    }).to.not.throw()
  })
  it ('Driver: makeDriverC9r inherits', function () {
    var ns = eYo.driver.makeNS()
    ns.makeMngr()
    var flag
    ns.makeDflt({
      init () {
        flag += 421
      }
    })
    ns.makeDriverC9r('Foo')
    chai.assert(eYo.isF(ns.Foo))
    flag = 0
    new ns.Foo(NS)
    chai.assert(flag === 421)
  })
  it ('Driver: makeDriverC9r inherits (2)', function () {
    var flag
    var ns = eYo.driver.makeNS()
    ns.makeMngr()
    ns.makeDriverC9r('Foo', {
      init (owner, x) {
        flag += x
      },
    })
    chai.assert(eYo.isF(ns.Foo))
    flag = 0
    new ns.Foo(NS, 1)
    chai.assert(flag === 1)
    ns.makeNS('a')
    ns.a.makeMngr()
    chai.assert(ns.a.super === ns)
    ns.a.makeDriverC9r('Foo', {
      init (owner, x) {
        flag += 10*x
      },
    })
    chai.assert(eYo.isF(ns.a.Foo))
    flag = 0
    new ns.a.Foo(NS, 1)
    console.warn('flag', flag)
    chai.assert(flag === 11)
  })
  it ('Driver: makeDriverC9r with model', function () {
    var flag
    var ns = eYo.driver.makeNS()
    ns.makeMngr()
    var Super = (ns.super && ns.super[name])|| ns.Dflt
    chai.assert(Super === ns.Dflt)
    ns.makeDriverC9r('Foo', {
      init () {
        flag += 1
      },
      ui: {
        doInit (what) {
          flag += 10 * what
          return true
        },
        doDispose (what) {
          flag += 100 * what
        }
      },
    })
    flag = 0
    var foo = new ns.Foo(NS)
    chai.assert(flag === 1)
    chai.assert(foo.doInitUI && foo.doInitUI(2))
    chai.assert(flag === 21)
    foo.doDisposeUI(3)
    chai.assert(flag === 321, `Unexpected flag value: ${flag}`)
  })
  it ('Driver: makeDriverC9r concurrent', function () {
    var ns = eYo.driver.makeNS()
    var flag
    ns.makeMngr()
    ns.makeDriverC9r('Foo', {
      init (owner, x = 1) {
        flag += 1 * x
      },
      ui: {
        doInit (x = 1) {
          flag += 10 * x
          return true
        },
        doDispose (x = 1) {
          flag += 100 * x
        },
      },
    })
    ns.makeDriverC9r('Bar', {
      init (owner, x = 1) {
        flag += 1000 * x
      },
      ui: {
        doInit (x = 1) {
          flag += 10000 * x
          return true
        },
        doDispose (x = 1) {
          flag += 100000 * x
        },
      },
    })
    flag = 0
    var foo = new ns.Foo(NS)
    chai.assert(flag === 1)
    chai.assert(foo.doInitUI())
    chai.assert(flag === 11)
    foo.doDisposeUI()
    chai.assert(flag === 111)
    var bar = new ns.Bar(NS)
    chai.assert(flag === 1111)
    chai.assert(bar.doInitUI())
    chai.assert(flag === 11111)
    bar.doDisposeUI()
    chai.assert(flag === 111111)
  })
  it ('Driver: new', function () {
    let owner = {}
    let mngr = new eYo.driver.Mngr(owner)
    chai.assert(mngr)
    chai.assert(mngr.drivers)
  })
})


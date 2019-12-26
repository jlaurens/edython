var NS = Object.create(null)

describe('Driver', function() {
  it ('Driver: Basic', function () {
    chai.assert(eYo.Driver)
    chai.assert(eYo.isF(eYo.Driver.Dlgt))
    chai.assert(eYo.isF(eYo.Driver.Dflt))
    chai.assert(eYo.isF(eYo.Driver.DlgtMngr))
    chai.assert(eYo.isF(eYo.Driver.makeMngr))
    chai.assert(eYo.isF(eYo.Driver.makeDriverClass))
  })
  it ('Driver: Dflt', function () {
    var d = new eYo.Driver.Dflt()
    chai.assert(d)
    chai.assert(eYo.isF(d.initUI))
    chai.assert(eYo.isF(d.disposeUI))
  })
  it ('Driver: makeMngr', function () {
    var ns = eYo.Driver.makeNS()
    ns.makeMngr()
    chai.assert(ns.Mngr)
    chai.assert(ns.Mngr.eyo.C9r === ns.Mngr)
    chai.assert(ns.Mngr.eyo.constructor === eYo.Driver.DlgtMngr)
    chai.assert(ns.makeMngr)
    chai.assert(ns.makeDriverClass)
    chai.assert(ns.Dflt === eYo.Driver.Dflt)
    chai.assert(ns.Dlgt === eYo.Driver.Dlgt)
    chai.assert(ns.DlgtMngr === eYo.Driver.DlgtMngr)
    ns.makeNS('A')
    ns.A.makeMngr()
  })
  it ('Driver: manager', function () {
    var ns = eYo.Driver.makeNS()
    ns.makeMngr()
    chai.assert(ns.Mngr)
    chai.assert(ns.Mngr.eyo.constructor === ns.DlgtMngr)
    var onr = {}
    onr.mngr = new ns.Mngr(onr)
    chai.assert(onr.mngr)
    chai.assert(onr.mngr.owner === onr)
  })
  it ('Driver: makeDriverClass basic', function () {
    var ns = eYo.Driver.makeNS()
    ns.makeMngr()
    ns.makeDriverClass('Foo')
    chai.assert(eYo.isF(ns.Foo))
    var foo = new ns.Foo()
    chai.assert(foo.doInitUI)
    chai.assert(!foo.doInitUI())
    chai.expect(() => {
      foo.disposeUI()
    }).to.not.throw()
  })
  it ('Driver: makeDriverClass inherits', function () {
    var ns = eYo.Driver.makeNS()
    ns.makeMngr()
    var flag
    ns.makeDflt({
      init () {
        flag += 421
      }
    })
    ns.makeDriverClass('Foo')
    chai.assert(eYo.isF(ns.Foo))
    flag = 0
    new ns.Foo()
    chai.assert(flag === 421)
  })
  it ('Driver: makeDriverClass inherits (2)', function () {
    var flag
    var ns = eYo.Driver.makeNS()
    ns.makeMngr()
    ns.makeDriverClass('Foo', {
      init (x) {
        flag += x
      },
    })
    chai.assert(eYo.isF(ns.Foo))
    flag = 0
    new ns.Foo(1)
    chai.assert(flag === 1)
    ns.makeNS('A')
    ns.A.makeMngr()
    chai.assert(ns.A.super === ns)
    ns.A.makeDriverClass('Foo', {
      init (x) {
        flag += 10*x
      },
    })
    chai.assert(eYo.isF(ns.A.Foo))
    flag = 0
    new ns.A.Foo(1)
    console.warn('flag', flag)
    chai.assert(flag === 11)
  })
  it ('Driver: makeDriverClass with model', function () {
    var flag
    var ns = eYo.Driver.makeNS()
    ns.makeMngr()
    var Super = (ns.super && ns.super[name])|| ns.Dflt
    chai.assert(Super === ns.Dflt)
    ns.makeDriverClass('Foo', {
      init () {
        flag += 1
      },
      ui: {
        doInit (what) {
          flag += 10 * what
          return true
        },
        doDispose (what) {
          console.error('I AM COLD')
          flag += 100 * what
        }
      },
    })
    flag = 0
    var foo = new ns.Foo()
    chai.assert(flag === 1)
    chai.assert(foo.doInitUI && foo.doInitUI(2))
    chai.assert(flag === 21)
    foo.doDisposeUI(3)
    chai.assert(flag === 321, `Unexpected flag value: ${flag}`)
  })
  it ('Driver: makeDriverClass concurrent', function () {
    var ns = eYo.Driver.makeNS()
    var flag
    ns.makeMngr()
    ns.makeDriverClass('Foo', {
      init (x = 1) {
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
    ns.makeDriverClass('Bar', {
      init (x = 1) {
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
    var foo = new ns.Foo()
    chai.assert(flag === 1)
    chai.assert(foo.doInitUI())
    chai.assert(flag === 11)
    foo.doDisposeUI()
    chai.assert(flag === 111)
    var bar = new ns.Bar()
    chai.assert(flag === 1111)
    chai.assert(bar.doInitUI())
    chai.assert(flag === 11111)
    bar.doDisposeUI()
    chai.assert(flag === 111111)
  })
})


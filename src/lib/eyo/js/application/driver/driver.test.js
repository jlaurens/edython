var NS = Object.create(null)

describe('Driver', function() {
  it ('Driver: Basic', function () {
    chai.assert(eYo.ns.Driver)
    chai.assert(eYo.ns.Driver.Dlgt)
    chai.assert(eYo.isF(eYo.ns.Driver.makeMngrClass))
    chai.assert(eYo.isF(eYo.ns.Driver.Dflt))
  })
  it ('Driver: Dflt', function () {
    var d = new eYo.ns.Driver.Dflt()
    chai.assert(d)
    chai.assert(eYo.isF(d.initUI))
    chai.assert(eYo.isF(d.disposeUI))
  })
  it ('Driver: makeMngrClass', function () {
    var ns = eYo.ns.Driver.make()
    ns.makeMngrClass()
    chai.assert(ns.Mngr)
    chai.assert(ns.Mngr.eyo.C9r === ns.Mngr)
    chai.assert(ns.Mngr.eyo.constructor === eYo.ns.Driver.Dlgt)
    chai.assert(ns.makeMngrClass)
    chai.assert(ns.makeDriverClass)
    chai.assert(ns.Dflt = eYo.ns.Driver.Dflt)
    ns.A = Object.create(null)
    ns.makeMngrClass(ns.A)
  })
  it ('Driver: manager', function () {
    var ns = eYo.ns.Driver.make()
    ns.makeMngrClass()
    var onr = {}
    onr.mngr = new ns.Mngr(onr)
    chai.assert(onr.mngr)
    chai.assert(onr.mngr.owner === onr)
  })
  it ('Driver: makeDriverClass basic', function () {
    var ns = eYo.ns.Driver.make()
    ns.makeMngrClass()
    ns.makeDriverClass({
      key: 'Foo',
      owner: NS,
    })
    chai.assert(eYo.isF(ns.Foo))
    var foo = new ns.Foo()
    chai.assert(foo.initUI)
    chai.assert(!foo.initUI())
    chai.expect(() => {
      foo.disposeUI()
    }).to.not.throw()
  })
  it ('Driver: makeDriverClass inherits', function () {
    var ns = eYo.ns.Driver.make()
    ns.makeMngrClass()
    var flag
    NS.Dflt = function () {
      flag += 421
    }
    NS.Dflt.prototype.initUI = NS.Dflt.prototype.disposeUI = function () {
      return true
    }
    NS.makeDriverClass({
      key: 'Foo',
      owner: NS,
    })
    chai.assert(eYo.isF(NS.Foo))
    flag = 0
    var foo = new NS.Foo()
    chai.assert(flag === 421)
  })
  it ('Driver: makeDriverClass inherits (2)', function () {
    var flag
    eYo.ns.Driver.makeMngrClass(NS)
    NS.makeDriverClass({
      key: 'Foo',
      init (x) {
        flag += x
      },
    })
    chai.assert(eYo.isF(NS.Foo))
    flag = 0
    new NS.Foo(1)
    chai.assert(flag === 1)
    NS.A = {}
    NS.makeMngrClass(NS.A)
    chai.assert(NS.A.super === NS)
    NS.A.makeDriverClass({
      key: 'Foo',
      init (x) {
        flag += 10*x
      },
    })
    chai.assert(eYo.isF(NS.A.Foo))
    flag = 0
    new NS.A.Foo(1)
    console.warn('flag', flag)
    chai.assert(flag === 11)
  })
  it ('Driver: makeDriverClass with model', function () {
    var flag
    eYo.ns.Driver.makeMngrClass(NS)
    var super_ = (NS.super && owner.super[name])|| NS.Dflt
    chai.assert(super_ === NS.Dflt)
    NS.makeDriverClass({
      key: 'Foo',
      owner: NS,
      init () {
        flag += 1
      },
      initUI () {
        flag += 10
        return true
      },
      disposeUI () {
        console.error('I AM COLD')
        flag += 100
      }
    })
    flag = 0
    var foo = new NS.Foo()
    chai.assert(flag === 1)
    chai.assert(foo.initUI && foo.initUI())
    chai.assert(flag === 11)
    foo.disposeUI()
    chai.assert(flag === 111)
  })
  it ('Driver: makeDriverClass concurrent', function () {
    var flag
    eYo.ns.Driver.makeMngrClass(NS)
    NS.makeDriverClass({
      key: 'Foo',
      owner: NS,
      init () {
        flag += 1
      },
      initUI () {
        flag += 10
        return true
      },
      disposeUI () {
        flag += 100
      }
    })
    NS.makeDriverClass({
      key: 'Bar',
      owner: NS,
      init () {
        flag += 1000
      },
      initUI () {
        flag += 10000
        return true
      },
      disposeUI () {
        flag += 100000
      }
    })
    flag = 0
    var foo = new NS.Foo()
    chai.assert(flag === 1)
    chai.assert(foo.initUI())
    chai.assert(flag === 11)
    foo.disposeUI()
    chai.assert(flag === 111)
    var bar = new NS.Bar()
    chai.assert(flag === 1111)
    chai.assert(bar.initUI())
    chai.assert(flag === 11111)
    bar.disposeUI()
    chai.assert(flag === 111111)
  })
})


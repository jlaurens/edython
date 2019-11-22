var NS = Object.create(null)

describe('Driver', function() {
  it ('Driver: Basic', function () {
    chai.assert(eYo.Driver)
    chai.assert(eYo.Driver.Dlgt)
    chai.assert(eYo.isF(eYo.Driver.makeMgrClass))
    chai.assert(eYo.isF(eYo.Driver.Default))
  })
  it ('Driver: Default', function () {
    var d = new eYo.Driver.Default()
    chai.assert(d)
    chai.assert(eYo.isF(d.initUI))
    chai.assert(eYo.isF(d.disposeUI))
  })
  it ('Driver: makeMgrClass', function () {
    eYo.Driver.makeMgrClass(NS)
    chai.assert(NS.Mgr)
    chai.assert(NS.Mgr.eyo.ctor === NS.Mgr)
    chai.assert(NS.Mgr.eyo.constructor === eYo.Driver.Dlgt)
    chai.assert(NS.makeDriverClass)
    chai.assert(NS.Default = eYo.Driver.Default)
  })
  it ('Driver: manager', function () {
    eYo.Driver.makeMgrClass(NS)
    var onr = {}
    onr.mgr = new NS.Mgr(onr)
    chai.assert(onr.mgr)
    chai.assert(onr.mgr.owner === onr)
  })
  it ('Driver: makeDriverClass basic', function () {
    eYo.Driver.makeMgrClass(NS)
    NS.makeDriverClass({
      key: 'Foo',
      owner: NS,
    })
    chai.assert(eYo.isF(NS.Foo))
    var foo = new NS.Foo()
    chai.assert(foo.initUI())
    chai.expect(() => {
      foo.disposeUI()
    }).to.not.throw()
  })
  it ('Driver: makeDriverClass inherits', function () {
    eYo.Driver.makeMgrClass(NS)
    var flag
    NS.Default = function () {
      flag += 421
    }
    NS.Default.prototype.initUI = NS.Default.prototype.disposeUI = function () {
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
  it ('Driver: makeDriverClass with model', function () {
    var flag
    eYo.Driver.makeMgrClass(NS)
    var super_ = (NS.super && owner.super[name])|| NS.Default
    chai.assert(super_ === NS.Default)
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
    flag = 0
    var foo = new NS.Foo()
    chai.assert(flag === 1)
    chai.assert(foo.initUI())
    chai.assert(flag === 11)
    foo.disposeUI()
    chai.assert(flag === 111)
  })
  it ('Driver: makeDriverClass concurrent', function () {
    var flag
    eYo.Driver.makeMgrClass(NS)
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


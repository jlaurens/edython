NS = Object.create(null)

describe('Owned', function () {
  it ('Owned: Basic', function () {
    chai.assert(eYo.Owned && eYo.Owned.eyo)
  })
  it ('Owned: new', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.Owned(onr)
    chai.assert(o.owner === onr)
  })
  it ('Owned: app', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.Owned(onr)
    chai.assert(o.owner === onr)
    chai.assert(!o.app)
    onr.app = 421
    o.appUpdate()
    chai.assert(o.app === 421)
  })
  it ('Owned: owner change', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.Owned(onr)
    onr.app = 421
    chai.assert(o.app === 421)
    onr = new ONR()
    o.owner_ = onr
    chai.assert(!o.app)
    onr.app = 123
    chai.assert(o.app === 123)
    o.owner_ = eYo.NA
    chai.assert(!o.app)
    onr = new ONR()
    o.owner_ = onr
    chai.assert(!o.app)
    onr.app = 421
    chai.assert(o.app === 421)
  })
  it ('Owned: computed', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.Owned(onr)
    chai.assert(o.owner === onr)
    onr.app = {}
    o.appForget()
    chai.assert(o.app === onr.app)
    chai.assert(!o.desk)
    onr.app.desk = 123
    chai.assert(o.desk === 123)
    onr.app.desk = {
      flyout: 421
    }
    chai.assert(o.flyout === 421)
    onr.app.desk.board = 123
    chai.assert(o.board === 123)
    onr.app.desk.workspace = 421
    chai.assert(o.workspace === 421)
  })
  it ('Owned: cascade', function () {
    var ONR = function () {}
    var onr0 = new ONR()
    eYo.Constructor.make('A', {
      owner: NS,
      super: eYo.Owned,
      props: {
        owned: {
          foo () {}
        }
      }
    })
    var onr1 = new NS.A(onr0)
    var onr2 = new eYo.Owned()
    onr1.foo_ = onr2
    chai.assert(!onr0.app)
    chai.assert(!onr1.app)
    chai.assert(!onr2.app)
    onr0.app = 123
    onr1.appForget()
    chai.assert(onr0.app === 123)
    chai.assert(onr1.app === 123)
    chai.assert(onr2.app === 123)
    onr1.owner_ = eYo.NA
    chai.assert(onr0.app === 123)
    chai.assert(!onr1.app)
    chai.assert(!onr2.app)
  })
})

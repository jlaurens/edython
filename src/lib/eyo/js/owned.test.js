NS = Object.create(null)

describe('Owned', function () {
  it ('Owned: Basic', function () {
    chai.assert(eYo.C9r.Owned && eYo.C9r.Owned.eyo)
  })
  it ('Owned: new', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.C9r.Owned(onr)
    chai.assert(o.owner === onr)
  })
  it ('Owned: app', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.C9r.Owned(onr)
    chai.assert(o.owner === onr)
    chai.assert(!o.app)
    onr.app = 421
    o.appUpdate()
    chai.assert(o.app === 421)
  })
  it ('Owned: owner change', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.C9r.Owned(onr)
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
    var o = new eYo.C9r.Owned(onr)
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
    eYo.makeClass(NS, 'A', eYo.C9r.Owned, {
      owned: {
        foo () {}
      }
    })
    var onr1 = new NS.A(onr0)
    var onr2 = new eYo.C9r.Owned()
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

describe ('Tests: BSMOwned', function () {
  var wrapper = f => 
  NS.Brick = eYo.Brick
  NS.Slot = eYo.Slot
  NS.Magnet = eYo.Magnet
  eYo.Brick = eYo.Slot = eYo.Magnet = eYo.NA
  var ff = k => {
    eYo.makeClass(k, {
      owned: ['foo']
    })
    ff('Brick')
    ff('Magnet')
    ff('Slot')
    chai.assert(eYo.Brick)
    chai.assert(eYo.Magnet)
    chai.assert(eYo.Slot)
    chai.assert(eYo.Brick !== NS.Brick)
    chai.assert(eYo.Slot !== NS.Slot)
    chai.assert(eYo.Magnet !== NS.Magnet)
    f()
    eYo.Brick = NS.Brick
    eYo.Slot = NS.Slot
    eYo.Magnet = NS.Magnet
    chai.assert(eYo.Brick === NS.Brick)
    chai.assert(eYo.Slot === NS.Slot)
    chai.assert(eYo.Magnet === NS.Magnet)
  }
  it ('BSMOwned: basic', function () {
    chai.assert(eYo.C9r.Dflt)
  })
  it ('BSMOwned: NYI', function () {
    wrapper(() => {
      var onr = new eYo.Brick.Dflt()
      chai.assert(onr)
      var ond = new eYo.C9r.BSMOwned(onr)
      chai.assert(ond)
      chai.assert(ond.brick === onr)
      console.warn(ond.brick, ond.slot, ond.magnet)
    })
  })
})

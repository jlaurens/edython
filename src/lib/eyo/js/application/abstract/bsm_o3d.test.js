NS = Object.create(null)

describe('BSM Owned', function () {
  it ('BSM Owned: Basic', function () {
    chai.assert(eYo.bsm_o3d.Dflt && eYo.bsm_o3d.Dflt.eyo)
  })
  it ('BSM Owned: new', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.bsm_o3d.Dflt(onr)
    chai.assert(o.owner === onr)
  })
  it ('BSM Owned: app', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.bsm_o3d.Dflt(onr)
    chai.assert(o.owner === onr)
    chai.assert(!o.app)
    onr.app = 421
    o.appUpdate()
    chai.assert(o.app === 421)
  })
  it ('BSM Owned: owner change', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.bsm_o3d.Dflt(onr)
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
  it ('BSM Owned: computed', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.bsm_o3d.Dflt(onr)
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
  it ('BSM Owned: cascade', function () {
    var ONR = function () {}
    var onr0 = new ONR()
    eYo.makeC9r(NS, 'A', eYo.bsm_o3d.Dflt, {
      properties: {
        foo () {}
      }
    })
    var onr1 = new NS.A(onr0)
    var onr2 = new eYo.bsm_o3d.Dflt()
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

describe ('Tests: BSM Owned', function () {
  var wrapper = f => 
  NS.Brick = eYo.brick
  NS.Slot = eYo.slot.Dflt
  NS.Magnet = eYo.magnet
  eYo.brick = eYo.slot.Dflt = eYo.magnet = eYo.NA
  var ff = k => {
    eYo.makeC9r(k, {
      properties: ['foo']
    })
    ff('brick')
    ff('magnet')
    ff('slot')
    chai.assert(eYo.brick)
    chai.assert(eYo.magnet)
    chai.assert(eYo.slot.Dflt)
    chai.assert(eYo.brick !== NS.Brick)
    chai.assert(eYo.slot.Dflt !== NS.Slot)
    chai.assert(eYo.magnet !== NS.Magnet)
    f()
    eYo.brick = NS.Brick
    eYo.slot.Dflt = NS.Slot
    eYo.magnet = NS.Magnet
    chai.assert(eYo.brick === NS.Brick)
    chai.assert(eYo.slot.Dflt === NS.Slot)
    chai.assert(eYo.magnet === NS.Magnet)
  }
  it ('BSM Owned: basic', function () {
    chai.assert(eYo.c9r.Dflt)
  })
  it ('BSM Owned: NYI', function () {
    wrapper(() => {
      var onr = new eYo.brick.Dflt()
      chai.assert(onr)
      var ond = new eYo.c9r.BSM Owned(onr)
      chai.assert(ond)
      chai.assert(ond.brick === onr)
      console.warn(ond.brick, ond.slot, ond.magnet)
    })
  })
})

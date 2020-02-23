describe('BSM Owned', function () {
  it ('BSM Owned: Basic', function () {
    chai.assert(eYo.bsm_o3d.Base && eYo.bsm_o3d.Base.eyo)
  })
  it ('BSM Owned: new', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.bsm_o3d.Base(onr)
    chai.expect(o.owner).equal(onr)
  })
  it ('BSM Owned: app', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.bsm_o3d.Base(onr)
    chai.expect(o.owner).equal(onr)
    chai.assert(!o.app)
    onr.app = 421
    o.appUpdate()
    chai.expect(o.app).equal(421)
  })
  it ('BSM Owned: owner change', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.bsm_o3d.Base(onr)
    onr.app = 421
    chai.expect(o.app).equal(421)
    onr = new ONR()
    o.owner_ = onr
    chai.assert(!o.app)
    onr.app = 123
    chai.expect(o.app).equal(123)
    o.owner_ = eYo.NA
    chai.assert(!o.app)
    onr = new ONR()
    o.owner_ = onr
    chai.assert(!o.app)
    onr.app = 421
    chai.expect(o.app).equal(421)
  })
  it ('BSM Owned: computed', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.bsm_o3d.Base(onr)
    chai.expect(o.owner).equal(onr)
    onr.app = {}
    o.appForget()
    chai.expect(o.app).equal(onr.app)
    chai.assert(!o.desk)
    onr.app.desk = 123
    chai.expect(o.desk).equal(123)
    onr.app.desk = {
      flyout: 421
    }
    chai.expect(o.flyout).equal(421)
    onr.app.desk.board = 123
    chai.expect(o.board).equal(123)
    onr.app.desk.workspace = 421
    chai.expect(o.workspace).equal(421)
  })
  it ('BSM Owned: cascade', function () {
    var ONR = function () {}
    var onr0 = new ONR()
    eYo.bsm_o3d.makeC9r(NS, 'A', {
      properties: {
        foo () {}
      }
    })
    var onr1 = new NS.A(onr0)
    var onr2 = new eYo.bsm_o3d.Base()
    onr1.foo_ = onr2
    chai.assert(!onr0.app)
    chai.assert(!onr1.app)
    chai.assert(!onr2.app)
    onr0.app = 123
    onr1.appForget()
    chai.expect(onr0.app).equal(123)
    chai.expect(onr1.app).equal(123)
    chai.expect(onr2.app).equal(123)
    onr1.owner_ = eYo.NA
    chai.expect(onr0.app).equal(123)
    chai.assert(!onr1.app)
    chai.assert(!onr2.app)
  })
})

describe ('Tests: BSM Owned', function () {
  NS = eYo.makeNS()
  NS.Brick = eYo.brick.Base
  NS.Slot = eYo.slot.Base
  NS.Magnet = eYo.magnet.Base
  eYo.brick = eYo.slot.Base = eYo.magnet = eYo.NA
  var ff = k => {
    eYo.bsm_o3d.makeC9r(k, {
      properties: {
        foo: eYo.NA,
      }
    })
    ff('brick')
    ff('magnet')
    ff('slot')
    chai.assert(eYo.brick.Base)
    chai.assert(eYo.magnet.Base)
    chai.assert(eYo.slot.Base)
    chai.assert(eYo.brick.Base !== NS.Brick)
    chai.assert(eYo.slot.Base !== NS.Slot)
    chai.assert(eYo.magnet.Base !== NS.Magnet)
    eYo.brick.Base = NS.Brick
    eYo.slot.Base = NS.Slot
    eYo.magnet.Base = NS.Magnet
    chai.expect(eYo.brick.Base).equal(NS.Brick)
    chai.expect(eYo.slot.Base).equal(NS.Slot)
    chai.expect(eYo.magnet.Base).equal(NS.Magnet)
  }
  it ('BSM Owned: basic', function () {
    chai.assert(eYo.c9r.Base)
  })
  it ('BSM Owned: NYI', function () {
    wrapper(() => {
      var onr = new eYo.brick.Base()
      chai.assert(onr)
      var ond = new eYo.bsm_o3d.Base(onr)
      chai.assert(ond)
      chai.expect(ond.brick).equal(onr)
      console.warn(ond.brick, ond.slot, ond.magnet)
    })
  })
})

describe('BSM Owned', function () {
  it ('BSM Owned: Basic', function () {
    chai.assert(eYo.bsm_o3d.Dflt && eYo.bsm_o3d.Dflt.eyo)
  })
  it ('BSM Owned: new', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.bsm_o3d.Dflt(onr)
    chai.expect(o.owner).to.equal(onr)
  })
  it ('BSM Owned: app', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.bsm_o3d.Dflt(onr)
    chai.expect(o.owner).to.equal(onr)
    chai.assert(!o.app)
    onr.app = 421
    o.appUpdate()
    chai.expect(o.app).to.equal(421)
  })
  it ('BSM Owned: owner change', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.bsm_o3d.Dflt(onr)
    onr.app = 421
    chai.expect(o.app).to.equal(421)
    onr = new ONR()
    o.owner_ = onr
    chai.assert(!o.app)
    onr.app = 123
    chai.expect(o.app).to.equal(123)
    o.owner_ = eYo.NA
    chai.assert(!o.app)
    onr = new ONR()
    o.owner_ = onr
    chai.assert(!o.app)
    onr.app = 421
    chai.expect(o.app).to.equal(421)
  })
  it ('BSM Owned: computed', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.bsm_o3d.Dflt(onr)
    chai.expect(o.owner).to.equal(onr)
    onr.app = {}
    o.appForget()
    chai.expect(o.app).to.equal(onr.app)
    chai.assert(!o.desk)
    onr.app.desk = 123
    chai.expect(o.desk).to.equal(123)
    onr.app.desk = {
      flyout: 421
    }
    chai.expect(o.flyout).to.equal(421)
    onr.app.desk.board = 123
    chai.expect(o.board).to.equal(123)
    onr.app.desk.workspace = 421
    chai.expect(o.workspace).to.equal(421)
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
    var onr2 = new eYo.bsm_o3d.Dflt()
    onr1.foo_ = onr2
    chai.assert(!onr0.app)
    chai.assert(!onr1.app)
    chai.assert(!onr2.app)
    onr0.app = 123
    onr1.appForget()
    chai.expect(onr0.app).to.equal(123)
    chai.expect(onr1.app).to.equal(123)
    chai.expect(onr2.app).to.equal(123)
    onr1.owner_ = eYo.NA
    chai.expect(onr0.app).to.equal(123)
    chai.assert(!onr1.app)
    chai.assert(!onr2.app)
  })
})

describe ('Tests: BSM Owned', function () {
  NS = eYo.makeNS()
  NS.Brick = eYo.brick.Dflt
  NS.Slot = eYo.slot.Dflt
  NS.Magnet = eYo.magnet.Dflt
  eYo.brick = eYo.slot.Dflt = eYo.magnet = eYo.NA
  var ff = k => {
    eYo.bsm_o3d.makeC9r(k, {
      properties: {
        foo: eYo.NA,
      }
    })
    ff('brick')
    ff('magnet')
    ff('slot')
    chai.assert(eYo.brick.Dflt)
    chai.assert(eYo.magnet.Dflt)
    chai.assert(eYo.slot.Dflt)
    chai.assert(eYo.brick.Dflt !== NS.Brick)
    chai.assert(eYo.slot.Dflt !== NS.Slot)
    chai.assert(eYo.magnet.Dflt !== NS.Magnet)
    eYo.brick.Dflt = NS.Brick
    eYo.slot.Dflt = NS.Slot
    eYo.magnet.Dflt = NS.Magnet
    chai.expect(eYo.brick.Dflt).to.equal(NS.Brick)
    chai.expect(eYo.slot.Dflt).to.equal(NS.Slot)
    chai.expect(eYo.magnet.Dflt).to.equal(NS.Magnet)
  }
  it ('BSM Owned: basic', function () {
    chai.assert(eYo.c9r.Dflt)
  })
  it ('BSM Owned: NYI', function () {
    wrapper(() => {
      var onr = new eYo.brick.Dflt()
      chai.assert(onr)
      var ond = new eYo.bsm_o3d.Dflt(onr)
      chai.assert(ond)
      chai.expect(ond.brick).to.equal(onr)
      console.warn(ond.brick, ond.slot, ond.magnet)
    })
  })
})

NS = Object.create(null)

describe('Owned.UI', function () {
  it ('Owned.UI: Basic', function () {
    chai.assert(eYo.UI.Owned && eYo.UI.Owned.eyo)
  })
  it ('Owned.UI: new', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.UI.Owned(onr)
    chai.assert(o.owner === onr)
  })
  it ('Owned.UI: app', function () {
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.Owned(onr)
    chai.assert(o.owner === onr)
    chai.assert(!o.app)
    onr.app = 421
    o.appUpdate()
    chai.assert(o.app === 421)
  })
  it ('Owned UI: computed', function () {
    // hasUI, options, ui_driver_mgr
    var ONR = function () {}
    var onr = new ONR()
    var o = new eYo.UI.Owned(onr)
    chai.assert(o.owner === onr)
    onr.app = {}
    o.appForget()
    chai.assert(o.hasUI)
    o.initUI = eYo.Do.nothing
    chai.assert(o.hasUI)
    chai.expect(() => {
      o.hasUI = 123
    }).to.throw()
    chai.assert(!o.options)
    onr.options = 421
    chai.assert(o.options === 421)
    chai.expect(() => {
      o.options = 123
    }).to.throw()
    chai.assert(!o.ui_driver_mgr)
    onr.app.ui_driver_mgr = 421
    chai.assert(o.ui_driver_mgr === 421)
    chai.expect(() => {
      o.ui_driver_mgr = 123
    }).to.throw()
  })
  describe ('Owned.UI: make', function () {
    
  })
})

describe('app', function() {
  it ('O3d: app p6y', function () {
    let onr = {
      eyo: true,
      app: 421
    }
    let o = new eYo.o3d.BaseC3s(onr)
    chai.assert(o.owner_p)
    chai.expect(o.owner).equal(onr)
    chai.assert(o.app_p)
    chai.expect(o.app).equal(421)
    onr.app = 123
    chai.expect(o.app).equal(421)
    o.app_p.reset()
    chai.expect(o.app).equal(123)
  })
  it ('Application: Basic', function () {
    chai.assert(eYo.app.BaseC3s)
    let APP = new eYo.app.BaseC3s()
    chai.assert(APP)
  })
  // it ('Application: UI', function () {
  //   ;['fcls', 'fcfl', 'dom', 'svg'].forEach((UI) => {
  //     let options = {
  //       UI: UI
  //     }
  //     let APP = new eYo.app.BaseC3s(options)
  //     eYo.test && eYo.test.IN_THROW || console.error('BREAK HERE!')
  //     console.error(APP.options)
  //     chai.expect(APP.options.UI).equal(UI)
  //     chai.expect(APP.driver_mngr.constructor).equal(eYo[UI].Mngr)
  //   })
  // })
})


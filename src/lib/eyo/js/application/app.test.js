describe('app', function() {
  it ('O3d: app p6y', function () {
    let onr = {
      [eYo.$]: true,
      app: 421
    }
    let o = new eYo.o3d.BaseC9r(onr)
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
    chai.assert(eYo.app.BaseC9r)
    let APP = new eYo.app.BaseC9r()
    chai.assert(APP)
  })
  // it ('Application: UI', function () {
  //   ;['fcls', 'fcfl', 'dom', 'svg'].forEach((UI) => {
  //     let options = {
  //       UI: UI
  //     }
  //     let APP = new eYo.app.BaseC9r(options)
  //     console.error('BREAK HERE!')
  //     console.error(APP.options)
  //     chai.expect(APP.options.UI).equal(UI)
  //     chai.expect(APP.ui_driver_mngr.constructor).equal(eYo[UI].Mngr)
  //   })
  // })
})


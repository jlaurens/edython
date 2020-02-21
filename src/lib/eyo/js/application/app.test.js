describe('app', function() {
  it ('O3d: app p6y', function () {
    let onr = {
      eyo: true,
      app: 421
    }
    let o = new eYo.o3d.Dflt(onr)
    chai.assert(o.owner_p)
    chai.expect(o.owner).to.equal(onr)
    chai.assert(o.app_p)
    chai.expect(o.app).to.equal(421)
    onr.app = 123
    chai.expect(o.app).to.equal(421)
    o.app_p.reset()
    chai.expect(o.app).to.equal(123)
  })
  it ('Application: Basic', function () {
    chai.assert(eYo.app.Dflt)
    let APP = new eYo.app.Dflt()
    chai.assert(APP)
  })
  // it ('Application: UI', function () {
  //   ;['fcls', 'fcfl', 'dom', 'svg'].forEach((UI) => {
  //     let options = {
  //       UI: UI
  //     }
  //     let APP = new eYo.app.Dflt(options)
  //     console.error('BREAK HERE!')
  //     console.error(APP.options)
  //     chai.expect(APP.options.UI).to.equal(UI)
  //     chai.expect(APP.ui_driver_mngr.constructor).to.equal(eYo[UI].Mngr)
  //   })
  // })
})


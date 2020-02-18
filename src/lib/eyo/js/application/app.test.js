describe('app', function() {
  it ('O3d: app p6y', function () {
    let onr = {
      eyo: true,
      app: 421
    }
    let o = new eYo.o3d.Dflt(onr)
    chai.assert(o.owner_p)
    chai.assert(o.owner === onr)
    chai.assert(o.app_p)
    chai.assert(o.app === 421)
    onr.app = 123
    chai.assert(o.app === 421)
    o.app_p.reset()
    chai.assert(o.app === 123)
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
  //     chai.assert(APP.options.UI === UI)
  //     chai.assert(APP.ui_driver_mngr.constructor === eYo[UI].Mngr)
  //   })
  // })
})


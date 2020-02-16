describe('app', function() {
  it ('Application: Basic', function () {
    chai.assert(eYo.app.Dflt)
    let app = new eYo.app.Dflt()
    chai.assert(app)
  })
  it ('Application: UI', function () {
    ;['fcls', 'fcfl', 'dom', 'svg'].forEach((UI) => {
      let options = {
        UI: UI
      }
      let app = new eYo.app.Dflt(options)
      console.error('BREAK HERE!')
      console.error(app.options)
      chai.assert(app.options.UI === UI)
      chai.assert(app.ui_driver_mngr.constructor === eYo[UI].Mngr)
    })
  })
})


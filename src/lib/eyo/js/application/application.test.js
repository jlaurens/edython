describe('App', function() {
  it ('Application: Basic', function () {
    chai.assert(eYo.App.Dflt)
    let app = new eYo.App.Dflt()
    chai.assert(app)
  })
  it ('Application: UI', function () {
    ;['Fcls', 'Fcfl', 'Dom', 'Svg'].forEach((UI) => {
      let options = {
        UI: UI
      }
      let app = new eYo.App.Dflt(options)
      console.error(app.options)
      chai.assert(app.options.UI === UI)
      chai.assert(app.ui_driver_mngr.constructor === eYo[UI].Mngr)
    })
  })
})


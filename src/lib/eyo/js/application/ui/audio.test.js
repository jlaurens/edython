NS = Object.create(null)
describe ('Tests: audio', function () {
  this.timeout(10000)
  it ('Audio: basic', function () {
    chai.assert(eYo.Audio)
  })
  it ('Audio: basic properties', function () {
    let app = new eYo.App.Dflt()
    chai.assert(app.audio)
    chai.assert(app.audio.app === app)
    chai.assert(app.ui_driver_mngr)
    chai.assert(app.audio.ui_driver_mngr)
    chai.assert(app.audio.ui_driver)
    chai.assert(app.audio.play)
  })
  it ('app.audio.play', function () {
    let options = {
      media : `${eYo.path_eyo}media/`,
      UI: 'Dom',
    }
      let app = new eYo.App.Dflt({

    })
    app.audio.play('click')
    app.audio.disconnect('delete')
    app.audio.disconnect('disconnect')
  })
})

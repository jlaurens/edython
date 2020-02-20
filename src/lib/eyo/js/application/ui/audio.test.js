describe ('Tests: audio', function () {
  this.timeout(10000)
  it ('Audio: basic', function () {
    chai.assert(eYo.audio)
    chai.assert(eYo.audio.Dflt)
  })
  it ('Audio: basic properties', function () {
    let app = new eYo.app.Dflt()
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
      UI: 'dom',
    }
    let app = new eYo.app.Dflt(options)
    app.audio.play('click')
    app.audio.play('delete')
    app.audio.play('disconnect')
  })
})

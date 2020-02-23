describe ('Tests: audio', function () {
  this.timeout(10000)
  it ('Audio: basic', function () {
    chai.assert(eYo.audio)
    chai.assert(eYo.audio.Base)
  })
  it ('Audio: basic properties', function () {
    let app = new eYo.app.Base()
    chai.assert(app.audio)
    chai.expect(app.audio.app).equal(app)
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
    let app = new eYo.app.Base(options)
    app.audio.play('click')
    app.audio.play('delete')
    app.audio.play('disconnect')
  })
})

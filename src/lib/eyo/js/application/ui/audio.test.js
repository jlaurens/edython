describe ('Tests: audio', function () {
  this.timeout(20000)
  it ('Audio: basic', function () {
    chai.assert(eYo.audio)
    chai.assert(eYo.audio.C9rBase)
  })
  it ('Audio: basic properties', function () {
    let app = new eYo.app.C9rBase()
    chai.assert(app.audio)
    chai.expect(app.audio.app).equal(app)
    chai.assert(app.driver_mngr)
    chai.assert(app.audio.driver_mngr)
    chai.assert(app.audio.drvr)
    chai.assert(app.audio.play)
  })
  it ('app.audio.play', function () {
    let options = {
      media : `${eYo.path_eyo}media/`,
      UI: 'dom',
    }
    let app = new eYo.app.C9rBase(options)
    app.audio.play('click')
    app.audio.play('delete')
    app.audio.play('disconnect')
  })
})

describe ('Tests: View', function () {
  this.timeout(10000)
  it ('View: Basic', function () {
    chai.assert(eYo.view)
    chai.assert(eYo.view.Dflt)
  })
})

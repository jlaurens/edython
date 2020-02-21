describe('Terminal board', function () {
  it ('Terminal: Basic', function () {
    chai.assert(eYo.view.Terminal)
    let onr = {}
    let view = new eYo.view.Terminal(onr)
    chai.assert(view)
  })
})
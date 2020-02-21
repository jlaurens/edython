describe('Turtle board', function () {
  it ('Turtle: Basic', function () {
    chai.assert(eYo.view.Turtle)
    let onr = {}
    let view = new eYo.view.Turtle(onr)
    chai.assert(view)
  })
})
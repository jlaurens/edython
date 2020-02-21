describe('Graphic board', function () {
  it ('Graphic: Basic', function () {
    chai.assert(eYo.view.Graphic)
    let onr = {}
    let view = new eYo.view.Graphic(onr)
    chai.assert(view)
  })
})
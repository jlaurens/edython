describe('Template board', function () {
  it ('Template: Basic', function () {
    chai.assert(eYo.view.Template)
    let onr = {}
    let view = new eYo.view.Template(onr)
    chai.assert(view)
  })
})
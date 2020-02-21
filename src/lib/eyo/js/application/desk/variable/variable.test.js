describe('Variable view', function () {
  it ('Variable: Basic', function () {
    chai.assert(eYo.view.Variable)
    let onr = {}
    let view = new eYo.view.Variable(onr)
    chai.assert(view)
  })
})
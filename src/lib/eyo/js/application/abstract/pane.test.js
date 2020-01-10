NS = Object.create(null)
describe ('Tests: pane', function () {
  it ('Pane: basic', function () {
    chai.assert(eYo.c9r.Pane)
    chai.assert(eYo.c9r.Pane.eyo)
    chai.assert(eYo.c9r.Pane.makeSubclass)
  })
})

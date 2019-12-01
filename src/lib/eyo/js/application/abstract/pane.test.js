NS = Object.create(null)
describe ('Tests: pane', function () {
  it ('Pane: basic', function () {
    chai.assert(eYo.Pane)
    chai.assert(eYo.Pane.eyo)
    chai.assert(eYo.Pane.makeSubclass)
  })
})

eYo.Debug.test() // remove this line when finished

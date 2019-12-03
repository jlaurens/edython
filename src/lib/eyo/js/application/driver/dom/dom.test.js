describe('Dom driver', function() {
  it ('Dom: Basic', function () {
    chai.assert(eYo.Dom)
    chai.assert(eYo.Dom.Mngr)
    chai.assert(eYo.Dom.makeDriverClass)
    chai.assert(eYo.Dom.makeMngrClass)
    chai.assert(eYo.Dom.Dflt)
  })
})


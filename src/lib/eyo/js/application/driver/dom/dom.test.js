describe('Dom driver', function() {
  it ('Dom: Basic', function () {
    chai.assert(eYo.NS_Dom)
    chai.assert(eYo.NS_Dom.Mngr)
    chai.assert(eYo.NS_Dom.makeDriverClass)
    chai.assert(eYo.NS_Dom.makeMngrClass)
    chai.assert(eYo.NS_Dom.Dflt)
  })
})


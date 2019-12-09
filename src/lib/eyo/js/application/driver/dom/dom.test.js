describe('Dom driver', function() {
  it ('Dom: Basic', function () {
    chai.assert(eYo.ns.Dom)
    chai.assert(eYo.ns.Dom.Mngr)
    chai.assert(eYo.ns.Dom.makeDriverClass)
    chai.assert(eYo.ns.Dom.makeMngrClass)
    chai.assert(eYo.ns.Dom.Dflt)
  })
})


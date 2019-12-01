describe('Dom driver', function() {
  it ('Dom: Basic', function () {
    chai.assert(eYo.Dom)
    chai.assert(eYo.Dom.Mgr)
    chai.assert(eYo.Dom.makeDriverClass)
    chai.assert(eYo.Dom.makeMgrClass)
    chai.assert(eYo.Dom.Dflt)
  })
})


describe ('Tests: Owned', function () {
  this.timeout(10000)
  it ('O3d: Basic', function () {
    chai.assert(eYo.o3d)
  })
  it ('O3d: Owner', function () {
    let onr = {
      eyo: true
    }
    let o3d = new eYo.o3d.Dflt(onr)
    chai.assert(o3d.owner === onr)
  })
})

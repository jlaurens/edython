describe ('Tests: Owned', function () {
  this.timeout(10000)
  it ('O3d: Basic', function () {
    let onr = {
      eyo: true
    }
    let o3d = new eYo.o3d.Dflt(onr)
    chai.assert(o3d.owner_p, `MISSED owner property`)
    chai.assert(o3d.owner === onr, `MISSED ${o3d.owner} === ${onr}`)
  })
})

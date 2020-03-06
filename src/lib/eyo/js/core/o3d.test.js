describe ('Tests: Owned', function () {
  this.timeout(10000)
  it ('O3d: Basic', function () {
    chai.assert(eYo.o3d)
    chai.assert(eYo.o3d._p.hasOwnProperty('Base'))
  })
  it ('eYo.o3d.new', function () {
    let onr = {
      eyo: true
    }
    let o3d = eYo.o3d.new(onr)
    chai.assert(o3d.owner_p, `MISSED owner property`)
    chai.expect(o3d.owner).equal(onr)
  })
  it ('O3t: time is on my side', function () {
    // In the init method, the properties are available and initialized
    // when not lazy!
    var flag = 0
    let ns = eYo.o3d.makeNS('')
    ns.makeBase({
      init (what) {
        chai.expect(this.owner).equal(what)
      }
    })
    ns.new('abc')
  })
})

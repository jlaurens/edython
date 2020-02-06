describe ('Tests: Property', function () {
  this.timeout(10000)
  it ('Property: Basic', function () {
    chai.assert(eYo.p6y)
  })
  it('Property: {}', function () {
    let onr = {}
    let p = new eYo.p6y.Dflt(onr, 'foo', {})
    chai.assert(eYo.isNA(p.value))
    chai.expect(() => {
      p.value = 421
    }).to.throw()
    p.value_ = 421
    chai.assert(p.value = 421)
  })
})

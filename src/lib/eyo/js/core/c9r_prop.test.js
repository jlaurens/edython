describe ('Tests: Property', function () {
  this.timeout(10000)
  it ('Property: Basic', function () {
    chai.assert(eYo.C9r.Prop)
  })
  it('Property: {}', function () {
    let onr = {}
    let p = new eYo.C9r.Prop(onr, 'foo', {})
    chai.assert(eYo.isNA(p.value))
    chai.expect(() => {
      p.value = 421
    }).to.throw()
    p.value_ = 421
    chai.assert(p.value = 421)
  })
})

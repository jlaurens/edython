describe ('Tests: Property', function () {
  this.timeout(10000)
  it ('Property: Basic', function () {
    chai.assert(eYo.c9r.Prop)
  })
  it('Property: {}', function () {
    let onr = {}
    let p = new eYo.c9r.Prop(onr, 'foo', {})
    chai.assert(eYo.isNA(p.value))
    chai.expect(() => {
      p.value = 421
    }).to.throw()
    p.value_ = 421
    chai.assert(p.value === 421)
  })
  it('Property: dispose', function () {
    var flag = 0
    let onr = {}
    let p = new eYo.c9r.Prop(onr, 'foo', {})
    let value = {
      eyo: true,
      dispose () {
        flag = 421
      }
    }
    p.value_ = value
    chai.assert(p.value === value)
    p.dispose()
    chai.assert(eYo.isNA(p.value))
    chai.assert(flag === 421)
  })
})

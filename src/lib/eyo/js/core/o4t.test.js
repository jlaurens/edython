describe ('Tests: Object', function () {
  this.timeout(10000)
  it ('O4t: Basic', function () {
    chai.assert(eYo.o4t)
  })
  it ('O4t: eYo.o4t.makeC9r...', function () {
    let O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {})
    let onr = {
      eyo: true
    }
    let o = new O()
    chai.assert(o)
  })
  it ('O4t: properties...', function () {
    let O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          value: 421
        }
      }
    })
    let o = new O()
    chai.assert(o.foo_p)
    chai.assert(o.foo === 421)
    o.foo_ === 123
    chai.assert(o.foo === 123)
  })
})

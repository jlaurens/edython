describe ('Tests: Shared', function () {
  this.timeout(10000)
  let flag = {
    v: 0,
    reset (what) {
      this.v = what || 0
    },
    push (...$) {
      $.forEach(what => {
        what && (this.v = parseInt(this.v.toString() + what.toString()))
      })
      return this.v
    },
    expect (what) {
      let ans = eYo.isRA(what) ? chai.expect(what).include(this.v) : chai.expect(what).equal(this.v)
      this.reset()
      return ans
    },
  }
  it ('Shared: Basic', function () {
    chai.assert(eYo.shared)
  })
  it ('Shared: ONER', function () {
    chai.expect(eYo.shared.OWNER instanceof eYo.c9r.BaseC9r).true
  })
})

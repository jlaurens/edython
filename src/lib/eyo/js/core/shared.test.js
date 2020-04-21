describe ('Tests: Shared', function () {
  this.timeout(10000)
  let flag = {
    v: '',
    reset (what) {
      this.v = what && what.toString() || ''
    },
    push (...$) {
      $.forEach(what => {
        what && (this.v += what.toString())
      })
      return this.v
    },
    expect (what) {
      if (eYo.isRA(what)) {
        what = what.map(x => x.toString())
        var ans = chai.expect(what).include(this.v || '0')
      } else {
        ans = chai.expect(what.toString()).equal(this.v || '0')
      }
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

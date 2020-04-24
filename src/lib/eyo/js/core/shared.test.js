describe ('Tests: Shared', function () {
  this.timeout(10000)
  let flag = new eYo.test.Flag()
  it ('Shared: Basic', function () {
    chai.assert(eYo.shared)
  })
  it ('Shared: ONER', function () {
    chai.expect(eYo.shared.OWNER instanceof eYo.c9r.BaseC9r).true
  })
})

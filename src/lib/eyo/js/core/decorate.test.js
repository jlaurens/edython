describe ('Tests: decorate', function () {
  it ('Decorate: basic', function () {
    chai.assert(eYo.decorate)
    chai.assert(eYo.decorate.reentrant)
  })
  it ('eYo.decorate.reentrant', function () {
    var flag = 0
    let O = new (eYo.c9r.makeC9r(''))()
    let _p = Object.getPrototypeOf(O)
    _p.bar = eYo.decorate.reentrant('bar', function (what) {
      flag *= 10
      flag += what
      return this.bar()
    })
    chai.expect(eYo.isNA(O.bar(3))).true
    chai.expect(flag).equal(3)
    flag = 0
    _p.bar = eYo.decorate.reentrant('bar', function (what) {
      flag *= 10
      flag += what
      return this.bar(what)
    }, function (what) {
      flag *= 10
      flag += 2 * what
      return 3 * what
    })
    chai.expect(O.bar(2)).equal(6)
    chai.expect(flag).equal(24)
    flag = 0
    chai.expect(O.bar(3)).equal(9)
    chai.expect(flag).equal(36)
    flag = 0
    _p.bar = eYo.decorate.reentrant('bar', function (what) {
      let ans = this.bar(what)
      flag *= 10
      flag += what
      return ans
    }, function (what) {
      flag *= 10
      flag += 2 * what
      return 3 * what
    })
    chai.expect(O.bar(2)).equal(6)
    chai.expect(flag).equal(42)
    flag = 0
    chai.expect(O.bar(3)).equal(9)
    chai.expect(flag).equal(63)
    flag = 0
  })
})

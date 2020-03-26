describe ('Tests: decorate', function () {
  let flag = {
    v: 0,
    push(what) {
      this.v *= 10
      this.v += what
    },
  }
  it ('Decorate: basic', function () {
    chai.assert(eYo.decorate)
    chai.assert(eYo.decorate.reentrant)
  })
  it ('eYo.decorate.reentrant', function () {
    let O = new (eYo.c9r.makeC9r(''))()
    let _p = Object.getPrototypeOf(O)
    _p.bar = eYo.decorate.reentrant('bar', function (what) {
      flag.push(what)
      return this.bar()
    })
    flag.v = 0
    chai.expect(eYo.isNA(O.bar(3))).true
    chai.expect(flag.v).equal(3)
    flag.v = 0
    _p.bar = eYo.decorate.reentrant('bar', function (what) {
      flag.push(what)
      return this.bar(what)
    }, function (what) {
      flag.push(2*what)
      return 3 * what
    })
    chai.expect(O.bar(2)).equal(6)
    chai.expect(flag.v).equal(24)
    flag.v = 0
    chai.expect(O.bar(3)).equal(9)
    chai.expect(flag.v).equal(36)
    flag.v = 0
    _p.bar = eYo.decorate.reentrant('bar', function (what) {
      let ans = this.bar(what)
      flag.push(what)
      return ans
    }, function (what) {
      flag.push(2*what)
      return 3 * what
    })
    chai.expect(O.bar(2)).equal(6)
    chai.expect(flag.v).equal(42)
    flag.v = 0
    chai.expect(O.bar(3)).equal(9)
    chai.expect(flag.v).equal(63)
    flag.v = 0
  })
})

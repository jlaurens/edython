describe ('Tests: decorate', function () {
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
  it ('Decorate: basic', function () {
    chai.assert(eYo.decorate)
    chai.assert(eYo.decorate.reentrant)
  })
  it ('eYo.decorate.reentrant', function () {
    let O = new function(){}
    let _p = Object.getPrototypeOf(O)
    _p.bar = eYo.decorate.reentrant('bar', function (what) {
      flag.push(what)
      return this.bar()
    })
    flag.v = 0
    chai.expect(eYo.isNA(O.bar(3))).true
    flag.expect(3)
    flag.v = 0
    _p.bar = eYo.decorate.reentrant('bar', function (what) {
      flag.push(what)
      return this.bar(what)
    }, function (what) {
      flag.push(2*what)
      return 3 * what
    })
    chai.expect(O.bar(2)).equal(6)
    flag.expect(24)
    flag.v = 0
    chai.expect(O.bar(3)).equal(9)
    flag.expect(36)
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
    flag.expect(42)
    flag.v = 0
    chai.expect(O.bar(3)).equal(9)
    flag.expect(63)
    flag.v = 0
  })
})

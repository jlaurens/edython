describe ('Tests: decorate', function () {
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
    flag.reset()
    chai.expect(eYo.isNA(O.bar(3))).true
    flag.expect(3)
    flag.reset()
    _p.bar = eYo.decorate.reentrant('bar', function (what) {
      flag.push(what)
      return this.bar(what)
    }, function (what) {
      flag.push(2*what)
      return 3 * what
    })
    chai.expect(O.bar(2)).equal(6)
    flag.expect(24)
    flag.reset()
    chai.expect(O.bar(3)).equal(9)
    flag.expect(36)
    flag.reset()
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
    flag.reset()
    chai.expect(O.bar(3)).equal(9)
    flag.expect(63)
    flag.reset()
  })
})

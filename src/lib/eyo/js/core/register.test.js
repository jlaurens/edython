describe ('Tests: register', function () {
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
    },
    expect (what) {
      let ans = eYo.isRA(what) ? chai.expect(what).include(this.v) : chai.expect(what).equal(this.v)
      this.reset()
      return ans
    },
  }
  it ('Register: basic', function () {
    chai.assert(eYo.register)
  })
  it ('Register: object', function () {
    let o = {}
    eYo.register.add(o, 'foo')
    chai.assert(o.fooRegister)
    chai.assert(o.fooUnregister)
    chai.assert(o.fooForEach)
    chai.assert(o.fooSome)
    o.fooRegister(123)
    flag.reset()
    o.fooForEach(foo => flag.push(foo))
    flag.expect(123)
    o.fooRegister(123)
    o.fooForEach(foo => flag.push(foo))
    flag.expect(123)
    o.fooRegister(456)
    o.fooForEach(foo => flag.push(foo))
    flag.expect(123456)
    chai.expect(o.fooSome(foo => {
      if (foo === 456) {
        flag.push(foo)
        return foo
      }
    })).equal(456)
    flag.expect(456)
    chai.assert(o.fooUnregister(123))
    chai.assert(!o.fooUnregister(123))
    o.fooForEach(foo => flag.push(foo))
    flag.expect(456)
  })
  it ('Register: C9r(1)', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    chai.expect(() => eYo.register.add(ns.BaseC9r, 'foo')).throw()
  })
  it ('Register: C9r(2)', function () {
    let ns = eYo.o4t.makeNS()
    ns.makeBaseC9r()
    eYo.register.add(ns.BaseC9r, 'foo')
    let onr = eYo.c9r.new()
    let o = new ns.BaseC9r(onr, 'o')
    chai.assert(o.fooRegister)
    chai.assert(o.fooUnregister)
    chai.assert(o.fooForEach)
    chai.assert(o.fooSome)
    o.fooRegister(1)
    flag.reset()
    o.fooForEach(foo => flag.push(foo))
    flag.expect(1)
    o.fooRegister(1)
    flag.expect(0)
    o.fooForEach(foo => flag.push(foo))
    flag.expect(1)
    o.fooRegister(2)
    flag.expect(0)
    o.fooForEach(foo => flag.push(foo))
    flag.expect(12)
    chai.expect(o.fooSome(foo => {
      if (foo === 2) {
        flag.push(foo)
        return foo
      }
    })).equal(2)
    flag.expect(2)
    chai.assert(o.fooUnregister(1))
    chai.assert(!o.fooUnregister(1))
    flag.expect(0)
    o.fooForEach(foo => flag.push(foo))
    flag.expect(2)
  })
})

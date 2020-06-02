describe ('Tests: register', function () {
  this.timeout(20000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c9r && eYo.c9r.new({
      methods: {
        flag (what, ...$) {
          flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  })
  it ('Register: C9r(2)', function () {
    let ns = eYo.o4t.newNS()
    ns.makeBaseC9r()
    eYo.register.add(ns.BaseC9r, 'foo')
    let onr = eYo.c9r.new()
    let o = new ns.BaseC9r('o', onr)
    chai.assert(o.fooRegister)
    chai.assert(o.fooUnregister)
    chai.assert(o.fooForEach)
    chai.assert(o.fooSome)
    o.fooRegister(1)
    flag.reset()
    o.fooForEach(foo => flag.push(foo))
    flag.expect(1)
    o.fooRegister(1)
    flag.expect()
    o.fooForEach(foo => flag.push(foo))
    flag.expect(1)
    o.fooRegister(2)
    flag.expect()
    o.fooForEach(foo => flag.push(foo))
    flag.expect(12)
    chai.expect(o.fooSome(foo => {
      if (foo === 2) {
        flag.push(foo)
        return foo
      }
    })).true
    flag.expect(2)
    chai.assert(o.fooUnregister(1))
    chai.assert(!o.fooUnregister(1))
    flag.expect()
    o.fooForEach(foo => flag.push(foo))
    flag.expect(2)
  })
})

describe ('Tests: register', function () {
  this.timeout(20000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c3s && eYo.c3s.new({
      methods: {
        flag (what, ...$) {
          eYo.flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  })
  it ('Register: C3s(2)', function () {
    let ns = eYo.o4t.newNS()
    ns.makeBaseC3s()
    eYo.register.add(ns.BaseC3s, 'foo')
    let onr = eYo.c3s.new()
    let o = new ns.BaseC3s('o', onr)
    chai.assert(o.fooRegister)
    chai.assert(o.fooUnregister)
    chai.assert(o.fooForEach)
    chai.assert(o.fooSome)
    o.fooRegister(1)
    flag.reset()
    o.fooForEach(foo => eYo.flag.push(foo))
    eYo.flag.expect(1)
    o.fooRegister(1)
    eYo.flag.expect()
    o.fooForEach(foo => eYo.flag.push(foo))
    eYo.flag.expect(1)
    o.fooRegister(2)
    eYo.flag.expect()
    o.fooForEach(foo => eYo.flag.push(foo))
    eYo.flag.expect(12)
    chai.expect(o.fooSome(foo => {
      if (foo === 2) {
        eYo.flag.push(foo)
        return foo
      }
    })).true
    eYo.flag.expect(2)
    chai.assert(o.fooUnregister(1))
    chai.assert(!o.fooUnregister(1))
    eYo.flag.expect()
    o.fooForEach(foo => eYo.flag.push(foo))
    eYo.flag.expect(2)
  })
})

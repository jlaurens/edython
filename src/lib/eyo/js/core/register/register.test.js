describe ('Tests: register', function () {
  this.timeout(20000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c9r && eYo.c9r.new({
      methods: {
        flag (what, ...$) {
          eYo.flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  })
  it ('Register: C9r(2)', function () {
    let ns = eYo.o4t.newNS()
    ns.makeC9rBase()
    eYo.register.add(ns.C9rBase, 'foo')
    let onr = eYo.c9r.new()
    let o = new ns.C9rBase('o', onr)
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

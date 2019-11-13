const NS = Object.create(null)

describe ('Link', function () {
  it ("declare 'foo' and 'bar' then clear", function () {
    const A = function() {
      eYo.Link.define(A, this)
    }
    eYo.Link.declare(A, 'foo', 'bar')
    chai.assert(A.eyo__.links.has('foo'))
    chai.assert(A.eyo__.links.has('bar'))
    const a = new A()
    chai.assert(a.foo__ === eYo.NA && a.foo_ === eYo.NA && a.foo === eYo.NA)
    chai.assert(a.bar__ === eYo.NA && a.bar_ === eYo.NA && a.bar === eYo.NA)
    a.foo__ = 421
    chai.assert(a.foo__ === 421 && a.foo_ === 421 && a.foo === 421)
    chai.assert(a.bar__ === eYo.NA && a.bar_ === eYo.NA && a.bar === eYo.NA)
    a.bar__ = 123
    chai.assert(a.foo__ === 421 && a.foo_ === 421 && a.foo === 421)
    chai.assert(a.bar__ === 123 && a.bar_ === 123 && a.bar === 123)
    chai.expect(() => {a.bar = 421}).to.throw()
    eYo.Link.clear(A, a)
    chai.assert(a.foo__ === eYo.NA && a.foo_ === eYo.NA && a.foo === eYo.NA)
    chai.assert(a.bar__ === eYo.NA && a.bar_ === eYo.NA && a.bar === eYo.NA)
  })
})

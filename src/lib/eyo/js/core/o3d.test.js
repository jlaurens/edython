describe ('Tests: Owned', function () {
  this.timeout(10000)
  it ('O3d: Basic', function () {
    chai.assert(eYo.o3d)
    var ns = eYo.o3d.makeNS()
    ns.makeC9r('A', {
      properties: {foo:eYo.NA}
    })
    ns.A_p.ui_driver = {
      doDisposeUI: eYo.do.nothing
    }
    var a = new ns.A()
    chai.expect(() => {a.foo = 1}).to.throw()
    var B = function () {}
    B.prototype.dispose = function () {
      this.disposed_ = true
    }
    var b = new B()
    chai.assert(b.owner_ === eYo.NA)
    chai.assert(b.ownerKey_ === eYo.NA)
    chai.assert(!b.disposed_)
    a.foo_ = b
    chai.assert(b.owner_ === a)
    chai.assert(b.ownerKey_ === 'foo_')
    chai.assert(a.foo === b)
    chai.assert(a.foo_ === b)
    chai.assert(a.foo__ === b)
    a.dispose()
    chai.assert(a.foo === eYo.NA)
    chai.assert(a.foo_ === eYo.NA)
    chai.assert(a.foo__ === eYo.NA)
    chai.assert(b.owner_ === eYo.NA)
    chai.assert(b.ownerKey_ === eYo.NA)
    chai.assert(b.disposed_)
  })
  it ('O3d: Owner', function () {
    let onr = {
      eyo: true
    }
    let o3d = new eYo.o3d.Dflt(onr)
    chai.assert(o3d.owner === onr, `MISSED ${o3d.owner} === ${onr}`)
  })
  it ('Owned: Two instances', function () {
    var ns = eYo.o3d.makeNS()
    ns.makeC9r('A', {
      properties: {foo:eYo.NA}
    })
    var a1 = new ns.A()
    var a2 = new ns.A()
    var B = function () {}
    var b1 = new B()
    a1.foo_ = b1
    var b2 = new B()
    a2.foo_ = b2
    var test1 = (a,b) => {
      chai.assert(a.foo === b)
      chai.assert(b.owner_ === a)
      chai.assert(b.ownerKey_ === 'foo_')
    }
    test1(a1, b1)
    test1(a2, b2)
    a1.foo_ = eYo.NA
    var test2 = (a, b) => {
      chai.assert(a.foo === eYo.NA)
      chai.assert(b.owner_ === eYo.NA)
      chai.assert(b.ownerKey_ === eYo.NA)
    }
    test2(a1, b1)
    test1(a2, b2)
    a2.foo_ = b1
    test2(a1, b2)
    test1(a2, b1)
    a1.foo_ = b2
    test1(a1, b2)
    test1(a2, b1)
    a1.foo_ = b1
    test2(a2, b2)
    test1(a1, b1)
    a2.foo_ = b2
    test1(a2, b2)
    test1(a1, b1)
  })
  it ('Owned: Two keys', function () {
    var ns = eYo.o3d.makeNS()
    ns.makeC9r('A', {
      properties: {foo1:eYo.NA, foo2:eYo.NA}
    })
    var a = new ns.A()
    var B = function () {}
    B.prototype.dispose = function () {
      this.disposed_ = true
    }
    var b1 = new B()
    var b2 = new B()
    var test = (foo1, foo2, bb1, bb2) => {
      chai.assert(a.foo1 === foo1)
      chai.assert(a.foo2 === foo2)
      foo1 && chai.assert(foo1.owner_ === a)
      foo1 && chai.assert(foo1.ownerKey_ === 'foo1_')
      foo2 && chai.assert(foo2.owner_ === a)
      foo2 && chai.assert(foo2.ownerKey_ === 'foo2_')
      bb1 && chai.assert(bb1.owner_ === eYo.NA)
      bb1 && chai.assert(bb1.ownerKey_ === eYo.NA)
      bb2 && chai.assert(bb2.owner_ === eYo.NA)
      bb2 && chai.assert(bb2.ownerKey_ === eYo.NA)
    }
    test()
    a.foo1_ = b1
    test(b1)
    a.foo2_ = b2
    test(b1, b2)
    a.foo1_ = b2
    test(b2, eYo.NA, b1)
    a.foo2_ = b2
    test(eYo.NA, b2, b1)
    a.foo2_ = b1
    test(eYo.NA, b1, b2)
    a.foo1_ = b1
    test(b1, eYo.NA, b2)
    a.foo2_ = b2
    test(b1, b2)
    a.foo2_ = eYo.NA
    test(b1, eYo.NA, b2)
    a.foo1_ = eYo.NA
    test(eYo.NA, eYo.NA, b1, b2)
  })
  it ('Owned: Inherit', function () {
    var ns = eYo.o3d.makeNS()
    ns.makeC9r('A', {
      properties: {foo:eYo.NA}
    })
    ns.makeC9r('AB', ns.A, {
      properties: {bar:eYo.NA}
    })
    var a = new ns.A()
    var ab = new ns.AB()
    var B = function () {}
    B.prototype.dispose = function () {
      this.disposed_ = true
    }
    var foo = new B()
    var bar = new B()
    var test = (af, abf, abb, f, b) => {
      chai.assert(a.foo === af)
      af && chai.assert(af.owner_ === a)
      af && chai.assert(af.ownerKey_ === 'foo_')
      chai.assert(ab.foo === abf)
      chai.assert(ab.bar === abb)
      abf && chai.assert(abf.owner_ === ab)
      abf && chai.assert(abf.ownerKey_ === 'foo_')
      abb && chai.assert(abb.owner_ === ab)
      abb && chai.assert(abb.ownerKey_ === 'bar_')
      f && chai.assert(f.owner_ === eYo.NA)
      f && chai.assert(f.ownerKey_ === eYo.NA)
      b && chai.assert(b.owner_ === eYo.NA)
      b && chai.assert(b.ownerKey_ === eYo.NA)
    }
    test(eYo.NA, eYo.NA, eYo.NA, foo, bar)
    ab.foo_ = foo
    test(eYo.NA, foo, eYo.NA, bar)
    ab.bar_ = bar
    test(eYo.NA, foo, bar)
    ab.bar_ = eYo.NA
    test(eYo.NA, foo, eYo.NA, bar)
    ab.foo_ = eYo.NA
    test(eYo.NA, eYo.NA, eYo.NA, foo, bar)
    ab.bar_ = bar
    test(eYo.NA, eYo.NA, bar, foo)
    ab.foo_ = foo
    test(eYo.NA, foo, bar)
    a.foo_ = foo
    test(foo, eYo.NA, bar)
    ab.foo_ = foo
    test(eYo.NA, foo, bar)
    a.foo_ = bar
    test(bar, foo)
    ab.bar_ = bar
    test(eYo.NA, foo, bar)
    ab.foo_ = bar
    test(eYo.NA, bar, eYo.NA, foo)
    ab.bar_ = foo
    test(eYo.NA, bar, foo)
    ab.foo_ = foo
    test(eYo.NA, foo, eYo.NA, bar)
  })
  it ('Owned: init 0', function () {
    var ns = eYo.o3d.makeNS()
    ns.makeC9r('A', {
      properties: {
        foo: {
          value () {
            return 421
          },
        }
      },
    })
    chai.assert(new ns.A().foo === 421)
  })
  it ('Owned: init 1', function () {
    var ns = eYo.o3d.makeNS()
    ns.makeC9r('A', {
      properties: {
        foo: 421
      },
    })
    chai.assert(new ns.A().foo === 421)
  })
  it ('Owned: hooks', function () {
    var ns = eYo.o3d.makeNS()
    var flag = 0
    var B = function (value) {
      this.value_ = value
    }
    var foo_before = new B(421)
    var foo_after = new B(123)
    var test = function (before, after) {
      chai.assert(this === a)
      chai.assert(before === foo_before, `Unexpected ${before} !=== ${foo_before}`)
      chai.assert(after === foo_after)
    }
    ns.makeC9r('A', {
      init (value) {
        this.foo__ = value
      },
      properties: {
        foo: {
          willChange (before, after) {
            console.warn
            after && test.call(this, before, after)
            return () => {
              flag += 100
            }
          },
          didChange: test,
          dispose (foo) {
            console.warn("HERE")
            flag += foo
          }
        }
      },
    })
    ns.A_p.ui_driver = {
      doDisposeUI: eYo.do.nothing
    }
    ns.A.prototype.fooWillChange = ns.A.prototype.fooDidChange = test
    var a = new ns.A(foo_before)
    chai.assert(a.foo === foo_before)
    flag = 0
    a.foo_ = foo_after
    chai.assert(flag === 100)
    // Dispose
    B.prototype.dispose = function (what) {
      flag += 1000
    }
    foo_before = foo_after
    foo_after = eYo.NA
    flag = 0
    a.dispose(123)
//      console.warn(flag)
    chai.assert(flag === 1100)
  })
})

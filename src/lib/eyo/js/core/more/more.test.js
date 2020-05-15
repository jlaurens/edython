describe ('Tests: More', function () {
  this.timeout(10000)
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
  it ('eYo.more.iterators', function () {
    let o = {}
    eYo.more.iterators(o, 'foo')
    chai.assert(o.fooForEach)
    chai.assert(o.fooSome)
    o.fooForEach(y => {
      flag.push(y)
    })
    flag.expect()
    chai.expect(!!o.fooSome(y => {
      flag.push(y)
      return y === 2
    })).false
    flag.expect()
    let m = o.fooMap = new Map()
    m.set(1,1)
    m.set(2,2)
    m.set(3,3)
    o.fooForEach(y => {
      flag.push(y)
    })
    flag.expect(123)
    chai.expect(o.fooSome(y => {
      flag.push(y)
      return y === 2
    })).true
    flag.expect(12)
  })
  it ('eYo.more.enhanceO3dValidate(, , false)', function () {
    let ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', false)
    chai.assert(ns.BaseC9r_p.validate)
    chai.assert(ns.BaseC9r.eyo.modelHandleValidate)
    ns.BaseC9r_p.validate(1, 2)
  })
  it ('eYo.more.enhanceO3dValidate(, , false)', function () {
    var ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    chai.expect(() => {
      eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', false)
    }).throw()
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', false)
    chai.expect(ns.BaseC9r_p.validate)
    chai.expect(ns.BaseC9r.eyo.modelHandleValidate)
    ns.BaseC9r_p.validate(3, 4)
    onr.fooValidate = function (key, before, after) {
      this.flag(2, key, before, after)
      return after
    }
    var o = ns.new('bar', onr)
    o.validate(3, 4)
    flag.expect('12bar34')
    onr.barFooValidate = function (before, after) {
      this.flag(6, before + 4, after + 4)
      return after
    }
    o.validate(3, 4)
    flag.expect('12bar341678')
  })
  it ('modelHandleValidate(..., false) + inheritance', function () {
    let ns_onr = eYo.c9r.makeNS()
    ns_onr.makeBaseC9r({
      methods: {
        flag (...$) {
          flag.push(1, ...$)
        },
        fooValidate(key, before, after) {
          this.flag(key, before, after)
          return after
        },
      }
    })
    let onr = ns_onr.new()
    var ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', false)
    chai.expect(eYo.isF(ns.BaseC9r_p.validate)).true
    ns.makeC9r('Foo')
    ns.Foo.eyo.finalizeC9r()
    var o = new ns.Foo('foo', onr)
    chai.assert(o.validate)
    chai.assert(ns.BaseC9r.eyo.modelHandleValidate)
    ns.BaseC9r.eyo.modelHandleValidate('foo', {})
    o.validate(1, 2)
    flag.expect('1foo12') // from the owner
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', false)
    o = new (ns.makeC9r('Foo'))('foo', onr)
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (before, after) {
        this.owner.flag(2, before, after)
        return after
      },
    })
    o.validate(3, 4)
    flag.expect(1234) // from the receiver only
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', false)
    o = new (ns.makeC9r('Foo'))('foo', onr)
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (before, after) {
        after = this.validate(before, after)
        this.owner.flag(2, before, after)
        return after
      },
    })
    o.validate(3, 4)
    flag.expect('1foo341234')
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', false)
    o = new (ns.makeC9r('Foo'))('foo', onr)
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (builtin, before, after) {
        this.owner.flag(2, before, after)
        return after
      },
    })
    o.validate(3, 4)
    flag.expect(1234) // from the receiver only
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', false)
    o = new (ns.makeC9r('Foo'))('foo', onr)
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (builtin, before, after) {
        after = builtin(before, after)
        this.owner.flag(2, before, after)
        return after
      },
    })
    o.validate(3, 4)
    flag.expect('1foo341234') // from the receiver only
  })
  it ('eYo.more.enhanceO3dValidate(, , true)', function () {
    // `this` is the owner in validate.
    let ns_onr = eYo.c9r.makeNS()
    ns_onr.makeBaseC9r({
      methods: {
        flag (...$) {
          flag.push(1, ...$)
        },
        fooValidate(key, before, after) {
          this.flag(key, before, after)
          return after
        },
      }
    })
    let onr = ns_onr.new()
    var ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', true)
    chai.expect(eYo.isF(ns.BaseC9r_p.validate)).true
    ns.makeC9r('Foo')
    var o = new ns.Foo('foo', onr)
    chai.expect(o.validate)
    chai.expect(ns.BaseC9r.eyo.modelHandleValidate)
    ns.BaseC9r.eyo.modelHandleValidate('foo', {})
    o.validate(3, 4)
    flag.expect('1foo34') // from the owner
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', true)
    o = new (ns.makeC9r('Foo'))('foo', onr)
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (before, after) {
        this.flag(2, before, after)
        return after
      },
    })
    o.validate(3, 4)
    flag.expect(1234) // from the receiver only
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', true)
    o = new (ns.makeC9r('Foo'))('foo', onr)
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (before, after) {
        after = this.validate(before, after)
      },
    })
    chai.expect(() => {
      o.validate(1, 2)
    }).throw()
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', true)
    o = new (ns.makeC9r('Foo'))('foo', onr)
    o.flag = 9
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (builtin, before, after) {
        this.flag(2, before, after)
        return after
      },
    })
    o.validate(3, 4)
    flag.expect(1234) // from the receiver only
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', true)
    o = new (ns.makeC9r('Foo'))('foo', onr)
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (builtin, before, after) {
        after = builtin(before, after)
        this.flag(2, before, after)
        return after
      },
    })
    o.validate(3, 4)
    flag.expect('1foo341234')
  })
})

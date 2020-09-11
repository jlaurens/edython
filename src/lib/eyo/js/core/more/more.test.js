describe ('Tests: More', function () {
  this.timeout(20000)
  beforeEach (function() {
    eYo.test.setup()
  })
  eYo.test.setup()
  it ('eYo.more.enhanceO3dValidate(, , false)', function () {
    var ns = eYo.c3s.newNS()
    ns.makeC3sBase()
    chai.expect(() => {
      eYo.more.enhanceO3dValidate(ns.C3sBase[eYo.$], 'foo', false)
    }).xthrow()
    ns = eYo.o3d.newNS()
    ns.makeC3sBase()
    eYo.more.enhanceO3dValidate(ns.C3sBase[eYo.$], 'foo', false)
    chai.expect(ns.C3sBase_p.validate)
    chai.expect(ns.C3sBase[eYo.$].modelHandleValidate)
    ns.C3sBase_p.validate('<', '>')
    eYo.test.onr.fooValidate = function (key, before, after) {
      this.flag('v', key, before, after)
      return after
    }
    var o = ns.new('bar', eYo.test.onr)
    o.validate('<', '>')
    eYo.flag.expect('/vbar<>')
    eYo.test.onr.barFooValidate = function (before, after) {
      this.flag('fv', before, after)
      return after
    }
    o.validate('<', '>')
    eYo.flag.expect('/vbar<>/fv<>')
  })
  it ('modelHandleValidate(..., false) + inheritance', function () {
    let ns_onr = eYo.c3s.newNS()
    ns_onr.makeC3sBase({
      methods: {
        flag (...$) {
          eYo.flag.push('/', ...$)
        },
        fooValidate(key, before, after) {
          this.flag('fv', key, before, after)
          return after
        },
      }
    })
    let onr = ns_onr.new()
    var ns = eYo.o3d.newNS()
    ns.makeC3sBase()
    eYo.more.enhanceO3dValidate(ns.C3sBase[eYo.$], 'foo', false)
    chai.expect(eYo.isF(ns.C3sBase_p.validate)).true
    ns.newC3s('Foo')
    ns.Foo[eYo.$].finalizeC3s()
    var o = new ns.Foo('foo', onr)
    chai.assert(o.validate)
    chai.assert(ns.C3sBase[eYo.$].modelHandleValidate)
    ns.C3sBase[eYo.$].modelHandleValidate('foo', {})
    o.validate(1, 2)
    eYo.flag.expect('/fvfoo12') // from the owner
    ////
    ns = eYo.o3d.newNS()
    ns.makeC3sBase()
    eYo.more.enhanceO3dValidate(ns.C3sBase[eYo.$], 'foo', false)
    o = new (ns.newC3s('Foo'))('foo', onr)
    ns.C3sBase[eYo.$].modelHandleValidate('foo', {
      validate (before, after) {
        this.owner.flag('v', before, after)
        return after
      },
    })
    o.validate('<', '>')
    eYo.flag.expect('/v<>') // from the receiver only
    ////
    ns = eYo.o3d.newNS()
    ns.makeC3sBase()
    eYo.more.enhanceO3dValidate(ns.C3sBase[eYo.$], 'foo', false)
    o = new (ns.newC3s('Foo'))('foo', onr)
    ns.C3sBase[eYo.$].modelHandleValidate('foo', {
      validate (before, after) {
        after = this.validate(before, after)
        this.owner.flag('v', before, after)
        return after
      },
    })
    o.validate('<', '>')
    eYo.flag.expect('/fvfoo<>/v<>')
    ////
    ns = eYo.o3d.newNS()
    ns.makeC3sBase()
    eYo.more.enhanceO3dValidate(ns.C3sBase[eYo.$], 'foo', false)
    o = new (ns.newC3s('Foo'))('foo', onr)
    ns.C3sBase[eYo.$].modelHandleValidate('foo', {
      validate (builtin, before, after) {
        this.owner.flag('v', before, after)
        return after
      },
    })
    o.validate('<', '>')
    eYo.flag.expect('/v<>') // from the receiver only
    ////
    ns = eYo.o3d.newNS()
    ns.makeC3sBase()
    eYo.more.enhanceO3dValidate(ns.C3sBase[eYo.$], 'foo', false)
    o = new (ns.newC3s('Foo'))('foo', onr)
    ns.C3sBase[eYo.$].modelHandleValidate('foo', {
      validate (builtin, before, after) {
        after = builtin(before, after)
        this.owner.flag('v', before, after)
        return after
      },
    })
    o.validate('<', '>')
    eYo.flag.expect('/fvfoo<>/v<>') // from the receiver only
  })
  it ('eYo.more.enhanceO3dValidate(, , true)', function () {
    // `this` is the owner in validate.
    let ns_onr = eYo.c3s.newNS()
    ns_onr.makeC3sBase({
      methods: {
        flag (...$) {
          eYo.flag.push('/', ...$)
        },
        fooValidate(key, before, after) {
          this.flag('fv', key, before, after)
          return after
        },
      }
    })
    let onr = ns_onr.new()
    var ns = eYo.o3d.newNS()
    ns.makeC3sBase()
    eYo.more.enhanceO3dValidate(ns.C3sBase[eYo.$], 'foo', true)
    chai.expect(eYo.isF(ns.C3sBase_p.validate)).true
    ns.newC3s('Foo')
    var o = new ns.Foo('foo', onr)
    chai.expect(o.validate)
    chai.expect(ns.C3sBase[eYo.$].modelHandleValidate)
    ns.C3sBase[eYo.$].modelHandleValidate('foo', {})
    o.validate('<', '>')
    eYo.flag.expect('/fvfoo<>') // from the owner
    ////
    ns = eYo.o3d.newNS()
    ns.makeC3sBase()
    eYo.more.enhanceO3dValidate(ns.C3sBase[eYo.$], 'foo', true)
    o = new (ns.newC3s('Foo'))('foo', onr)
    ns.C3sBase[eYo.$].modelHandleValidate('foo', {
      validate (before, after) {
        this.flag('v', before, after)
        return after
      },
    })
    o.validate('<', '>')
    eYo.flag.expect('/v<>') // from the receiver only
    ////
    ns = eYo.o3d.newNS()
    ns.makeC3sBase()
    eYo.more.enhanceO3dValidate(ns.C3sBase[eYo.$], 'foo', true)
    o = new (ns.newC3s('Foo'))('foo', onr)
    ns.C3sBase[eYo.$].modelHandleValidate('foo', {
      validate (before, after) {
        after = this.validate(before, after)
      },
    })
    chai.expect(() => {
      o.validate(1, 2)
    }).xthrow()
    ////
    ns = eYo.o3d.newNS()
    ns.makeC3sBase()
    eYo.more.enhanceO3dValidate(ns.C3sBase[eYo.$], 'foo', true)
    o = new (ns.newC3s('Foo'))('foo', onr)
    o.flag = 9
    ns.C3sBase[eYo.$].modelHandleValidate('foo', {
      validate (builtin, before, after) {
        this.flag('v', before, after)
        return after
      },
    })
    o.validate('<', '>')
    eYo.flag.expect('/v<>') // from the receiver only
    ////
    ns = eYo.o3d.newNS()
    ns.makeC3sBase()
    eYo.more.enhanceO3dValidate(ns.C3sBase[eYo.$], 'foo', true)
    o = new (ns.newC3s('Foo'))('foo', onr)
    ns.C3sBase[eYo.$].modelHandleValidate('foo', {
      validate (builtin, before, after) {
        after = builtin(before, after)
        this.flag('v', before, after)
        return after
      },
    })
    o.validate('<', '>')
    eYo.flag.expect('/fvfoo<>/v<>')
  })
})

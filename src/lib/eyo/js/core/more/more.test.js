describe ('Tests: More', function () {
  this.timeout(10000)
  let flag = new eYo.test.Flag()
  it ('More: Basic', function () {
    chai.assert(eYo.more)
    chai.assert(eYo.more.iterators)
    chai.assert(eYo.more.enhanceO3dValidate)
  })
  it ('eYo.more.iterators', function () {
    flag.reset()
    let o = {}
    eYo.more.iterators(o, 'foo')
    chai.assert(o.fooForEach)
    chai.assert(o.fooSome)
    o.fooForEach(y => {
      flag.push(y)
    })
    flag.expect(0)
    chai.expect(!!o.fooSome(y => {
      flag.push(y)
      return y === 2
    })).false
    flag.expect(0)
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
    flag.reset()
    let owner = eYo.c9r.new()
    owner.flag = 9
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
    ns.BaseC9r_p.validate(1, 2)
    owner.fooValidate = function (before, after) {
      flag.push(before)
      flag.push(after)
      flag.push(this.flag)
      return after
    }
    var o = ns.new('bar', owner)
    o.validate(1, 2)
    flag.expect(129)
    owner.barFooValidate = function (before, after) {
      flag.push(before)
      flag.push(after)
      flag.push(this.flag)
      return after
    }
    o.validate(1, 2)
    flag.expect(129129)
  })
  it ('modelHandleValidate(..., false) + inheritance', function () {
    // `this` is not the owner in validate.
    flag.reset()
    let ns_o = eYo.c9r.makeNS()
    ns_o.makeBaseC9r({
      methods: {
        fooValidate(before, after) {
          flag.push(before)
          flag.push(after)
          return after
        }
      }
    })
    let owner = ns_o.new()
    var ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', false)
    chai.expect(eYo.isF(ns.BaseC9r_p.validate)).true
    ns.makeC9r('Foo')
    var o = new ns.Foo('foo', owner)
    o.flag = 9
    chai.expect(o.validate)
    chai.expect(ns.BaseC9r.eyo.modelHandleValidate)
    ns.BaseC9r.eyo.modelHandleValidate('foo', {})
    o.validate(1, 2)
    flag.expect(12) // from the owner
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', false)
    o = new (ns.makeC9r('Foo'))('foo', owner)
    o.flag = 9
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (before, after) {
        flag.push(before + 2)
        flag.push(after + 2)
        flag.push(this.flag)
        return after
      },
    })
    o.validate(1, 2)
    flag.expect(349) // from the receiver only
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', false)
    o = new (ns.makeC9r('Foo'))('foo', owner)
    o.flag = 9
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (before, after) {
        after = this.validate(before, after)
        flag.push(before + 2)
        flag.push(after + 2)
        flag.push(this.flag)
        return after
      },
    })
    o.validate(1, 2)
    flag.expect(12349) // from the receiver only
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', false)
    o = new (ns.makeC9r('Foo'))('foo', owner)
    o.flag = 9
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (builtin, before, after) {
        flag.push(before + 2)
        flag.push(after + 2)
        flag.push(this.flag)
        return after
      },
    })
    o.validate(1, 2)
    flag.expect(349) // from the receiver only
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', false)
    o = new (ns.makeC9r('Foo'))('foo', owner)
    o.flag = 9
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (builtin, before, after) {
        after = builtin(before, after)
        flag.push(before + 2)
        flag.push(after + 2)
        flag.push(this.flag)
        return after
      },
    })
    o.validate(1, 2)
    flag.expect(12349) // from the receiver only
  })
  it ('eYo.more.enhanceO3dValidate(, , true)', function () {
    // `this` is the owner in validate.
    flag.reset()
    let ns_o = eYo.c9r.makeNS()
    ns_o.makeBaseC9r({
      methods: {
        fooValidate(before, after) {
          flag.push(before)
          flag.push(after)
          flag.push(this.flag)
          return after
        }
      }
    })
    let owner = ns_o.new()
    owner.flag = 9
    var ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', true)
    chai.expect(eYo.isF(ns.BaseC9r_p.validate)).true
    ns.makeC9r('Foo')
    var o = new ns.Foo('foo', owner)
    chai.expect(o.validate)
    chai.expect(ns.BaseC9r.eyo.modelHandleValidate)
    ns.BaseC9r.eyo.modelHandleValidate('foo', {})
    o.validate(1, 2)
    flag.expect(129) // from the owner
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', true)
    o = new (ns.makeC9r('Foo'))('foo', owner)
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (before, after) {
        flag.push(before + 2)
        flag.push(after + 2)
        flag.push(this.flag)
        return after
      },
    })
    o.validate(1, 2)
    flag.expect(349) // from the receiver only
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', true)
    o = new (ns.makeC9r('Foo'))('foo', owner)
    o.flag = 9
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (before, after) {
        after = this.validate(before, after)
        flag.push(before + 2)
        flag.push(after + 2)
        flag.push(this.flag)
        return after
      },
    })
    chai.expect(() => {
      o.validate(1, 2)
    }).throw()
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', true)
    o = new (ns.makeC9r('Foo'))('foo', owner)
    o.flag = 9
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (builtin, before, after) {
        flag.push(before + 2)
        flag.push(after + 2)
        flag.push(this.flag)
        return after
      },
    })
    o.validate(1, 2)
    flag.expect(349) // from the receiver only
    ////
    ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    eYo.more.enhanceO3dValidate(ns.BaseC9r.eyo, 'foo', true)
    o = new (ns.makeC9r('Foo'))('foo', owner)
    o.flag = 9
    ns.BaseC9r.eyo.modelHandleValidate('foo', {
      validate (builtin, before, after) {
        after = builtin(before, after)
        flag.push(before + 2)
        flag.push(after + 2)
        flag.push(this.flag)
        return after
      },
    })
    o.validate(1, 2)
    flag.expect(129349) // from the receiver only
  })
})

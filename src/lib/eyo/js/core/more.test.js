describe ('Tests: More', function () {
  this.timeout(10000)
  let flag = {
    v: 0,
    reset () {
      this.v = 0
    },
    push (what) {
      this.v *= 10
      this.v += what
    },
    expect (what) {
      chai.expect(this.v).equal(what)
      this.v = 0
    },
  }
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
    let C9r_p = {}
    let eyoC9r_p = {}
    let eyo = {
      C9r_p,
      eyo: {
        C9r_p: eyoC9r_p
      }
    }
    eYo.more.enhanceO3dValidate(eyo, 'foo', false)
    chai.expect(C9r_p.validate)
    chai.expect(eyo.modelHandleValidate)
    C9r_p.validate(1, 2)
  })
  it ('eYo.more.enhanceO3dValidate(, , false)', function () {
    flag.reset()
    let owner = {
      flag: 9,
    }
    let C9r_p = {
      owner,
    }
    let eyoC9r_p = {}
    let eyo = {
      C9r_p,
      eyo: {
        C9r_p: eyoC9r_p
      }
    }
    eYo.more.enhanceO3dValidate(eyo, 'foo', false)
    chai.expect(C9r_p.validate)
    chai.expect(eyo.modelHandleValidate)
    C9r_p.validate(1, 2)
    owner.fooValidate = function (before, after) {
      flag.push(before)
      flag.push(after)
      flag.push(this.flag)
      return after
    }
    C9r_p.validate(1, 2)
    flag.expect(129)
    C9r_p.key = 'bar'
    owner.barFooValidate = function (before, after) {
      flag.push(before)
      flag.push(after)
      flag.push(this.flag)
      return after
    }
    C9r_p.validate(1, 2)
    flag.expect(129129)
  })
  it ('modelHandleValidate(..., false)', function () {
    flag.reset()
    let owner_s = {
      flag: 1,
    }
    let C9r_s = {
      owner: owner_s,
      flag: 2,
    }
    let owner_p = {
      flag: 3,
    }
    let C9r_p = {
      owner: owner_p,
      flag: 4,
    }
    let eyo = {
      C9r_p,
      C9r_s,
    }
    eyo.eyo = {
      C9r_p: eyo
    }
    eYo.more.enhanceO3dValidate(eyo, 'foo', false)
    chai.expect(C9r_s.validate)
    chai.expect(eyo.modelHandleValidate)
    eyo.modelHandleValidate('foo', {})
    eyo.C9r_p.validate(1, 2)
    flag.expect(0)
    C9r_s.validate = function (before, after) {
      flag.push(before)
      flag.push(after)
      flag.push(this.flag)
      return after
    }
    eyo.modelHandleValidate('foo', {})
    eyo.C9r_p.validate(1, 2)
    flag.expect(0)
    eyo.modelHandleValidate('foo', {
      validate (before, after) {
        flag.push(before)
        flag.push(after)
        flag.push(this.flag+1)
        return after
      },
    })
    eyo.C9r_p.validate(1, 2)
    flag.expect(125)
    eyo.modelHandleValidate('foo', {
      validate (before, after) {
        after = this.validate(before, after)
        flag.push(before)
        flag.push(after)
        flag.push(this.flag+1)
        return after
      },
    })
    eyo.C9r_p.validate(1, 2)
    flag.expect(124125)
    eyo.modelHandleValidate('foo', {
      validate (builtin, before, after) {
        flag.push(before)
        flag.push(after)
        flag.push(this.flag+1)
        return after
      },
    })
    eyo.C9r_p.validate(1, 2)
    flag.expect(125)
    eyo.modelHandleValidate('foo', {
      validate (builtin, before, after) {
        after = builtin(before, after)
        flag.push(before)
        flag.push(after)
        flag.push(this.flag+1)
        return after
      },
    })
    eyo.C9r_p.validate(1, 2)
    flag.expect(124125)
  })
  it ('eYo.more.enhanceO3dValidate(, , true)', function () {
    let owner_s = {
      flag: 1,
    }
    let C9r_s = {
      owner: owner_s,
      flag: 2,
    }
    let owner_p = {
      flag: 3,
    }
    let C9r_p = {
      owner: owner_p,
      flag: 4,
    }
    let eyo = {
      C9r_p,
      C9r_s,
    }
    eyo.eyo = {
      C9r_p: eyo
    }
    eYo.more.enhanceO3dValidate(eyo, 'foo', true)
    chai.expect(C9r_s.validate)
    chai.expect(eyo.modelHandleValidate)
    eyo.modelHandleValidate('foo', {})
    eyo.C9r_p.validate(1, 2)
    flag.expect(0)
    C9r_s.validate = function (before, after) {
      flag.push(before)
      flag.push(after)
      flag.push(this.flag)
      return after
    }
    eyo.modelHandleValidate('foo', {})
    eyo.C9r_p.validate(1, 2)
    flag.expect(0)
    eyo.modelHandleValidate('foo', {
      validate (before, after) {
        flag.push(before)
        flag.push(after)
        flag.push(this.flag+1) // expected 3+1
        return after
      },
    })
    eyo.C9r_p.validate(1, 2)
    flag.expect(124)
    eyo.modelHandleValidate('foo', {
      validate (builtin, before, after) {
        flag.push(before)
        flag.push(after)
        flag.push(this.flag+1) // expected 3+1
        return after
      },
    })
    eyo.C9r_p.validate(1, 2)
    flag.expect(124)
    eyo.modelHandleValidate('foo', {
      validate (builtin, before, after) {
        after = builtin(before, after)
        flag.push(before)
        flag.push(after)
        flag.push(this.flag+1)
        return after
      },
    })
    eyo.C9r_p.validate(1, 2)
    flag.expect(124124)

  })
})

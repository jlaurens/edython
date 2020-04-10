describe ('Tests: Model', function () {
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
    },
  }
  it ('Model: POC', function () {
    chai.assert(XRegExp.match('abc', /abc/))
    var x = {
      ['abc']: ''
    }
    for (var k in x) {
      chai.assert(XRegExp.match('abc', XRegExp(k)))
      chai.assert(XRegExp(k).test('abc'))
    }
  })
  it ('Model: Basic', function () {
    chai.assert(eYo.model)
    chai.assert(eYo.model.Validator)
  })
  it ('Model: isModel', function () {
    chai.expect(eYo.isModel({})).true
    let x = new eYo.doNothing()
    chai.expect(eYo.isModel(x)).false
    x.model__ = true
    chai.expect(eYo.isModel(x)).true
  })
  it ('mv.isAllowed(...)', function () {
    let mv = new eYo.model.Validator()
    mv.allow({
      foo: {
        [eYo.model.ANY]: [
          'after', 'source',
        ],
      },
    })
    chai.expect(mv.isAllowed('foo')).true
    chai.expect(mv.isAllowed('', 'foo')).true
    chai.expect(mv.isAllowed('foo', 'whatsoever')).true
    chai.expect(mv.isAllowed(`foo/whatsoever`)).true
    chai.expect(mv.isAllowed(`foo/whatsoever/`)).true
    chai.expect(mv.isAllowed(`foo/whatsoever/.`)).true
    chai.expect(mv.isAllowed(`foo//whatsoever`)).true
    chai.expect(mv.isAllowed(`foo/./whatsoever`)).true
    chai.expect(mv.isAllowed(`/foo/whatsoever`)).true
    chai.expect(mv.isAllowed(`./foo/whatsoever`)).true
    chai.expect(mv.isAllowed('foo/whatsoever', 'after')).true
    chai.expect(mv.isAllowed('foo', 'whatsoever/after')).true
    chai.expect(mv.isAllowed(`foo/whatsoever/after`)).true
    chai.expect(mv.isAllowed(`foo/whatsoever/source`)).true
    chai.expect(mv.isAllowed(`foo/whatsoever/init`)).false
    chai.expect(mv.isAllowed(`foo/whatsoever/source/init`)).false
    mv.allow({
      bar: {
        [eYo.model.ANY]: [
          'after', 'source',
        ],
      },
    })
    chai.expect(mv.isAllowed('bar')).true
    chai.expect(mv.isAllowed('', 'bar')).true
    chai.expect(mv.isAllowed('bar', 'whatsoever')).true
    chai.expect(mv.isAllowed(`bar/whatsoever`)).true
    chai.expect(mv.isAllowed(`bar/whatsoever/`)).true
    chai.expect(mv.isAllowed(`bar/whatsoever/.`)).true
    chai.expect(mv.isAllowed(`bar//whatsoever`)).true
    chai.expect(mv.isAllowed(`bar/./whatsoever`)).true
    chai.expect(mv.isAllowed(`/bar/whatsoever`)).true
    chai.expect(mv.isAllowed(`./bar/whatsoever`)).true
    chai.expect(mv.isAllowed('bar/whatsoever', 'after')).true
    chai.expect(mv.isAllowed('bar', 'whatsoever/after')).true
    chai.expect(mv.isAllowed(`bar/whatsoever/after`)).true
    chai.expect(mv.isAllowed(`bar/whatsoever/source`)).true
    chai.expect(mv.isAllowed(`bar/whatsoever/init`)).false
    chai.expect(mv.isAllowed(`bar/whatsoever/source/init`)).false
  })
  it ('modelValidate', function () {
    let mv = new eYo.model.Validator()
    mv.allow('foo', {
      [eYo.model.VALIDATE]: (before) => {
        if (!eYo.isD(before)) {
          flag.push(before)
          return {
            value: before,
          }
        }
      },
    })
    chai.expect(mv.isAllowed('foo')).true
    let model = {
      foo: 1,
    }
    flag.reset()
    mv.validate(model)
    flag.expect(1)
    chai.expect(model.foo.value).equal(1)

    flag.reset()
    mv.allow('foo', eYo.model.ANY, {
      [eYo.model.VALIDATE]: (before) => {
        if (!eYo.isD(before)) {
          flag.push(before)
          return {
            value: before,
          }
        }
      },
    })
    model.foo = {
      bar: 2,
    }
    flag.reset()
    mv.validate(model)
    flag.expect(2)
    chai.expect(model.foo.bar.value).equal(2)
  })
  it ('modelValidate (validate)', function () {
    flag.reset()
    let mv = new eYo.model.Validator()
    mv.allow('a', {
      [eYo.model.VALIDATE]: (model) => {
        flag.push(model)
        return eYo.INVALID
      }
    })
    chai.expect(() => {
      mv.validate({a: 1})
    }).throw()
    flag.expect(1)
    flag.reset()
    mv.allow('b', {
      [eYo.model.VALIDATE]: (model) => {
        flag.push(model)
      }
    })
    mv.validate({b: 2})
    flag.expect(2)
  })
  it ('...allow("a", mv_b)', function () {
    let mv_a = new eYo.model.Validator()
    let mv_b = new eYo.model.Validator()
    mv_b.allow('b')
    chai.expect(mv_b.isAllowed('b')).true
    chai.expect(mv_b.isAllowed('b/c')).false
    mv_a.allow('a', mv_b)
    chai.expect(mv_a.isAllowed('a')).true
    chai.expect(mv_a.isAllowed('a/b')).true
    chai.expect(mv_a.isAllowed('a/b/c')).false
    mv_b.allow('b/c')
    chai.expect(mv_b.isAllowed('b/c')).true
    chai.expect(mv_a.isAllowed('a/b/c')).true
  })
})

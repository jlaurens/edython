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
    chai.assert(eYo.model.Format)
  })
  it ('Model: isModel', function () {
    chai.expect(eYo.isModel({})).true
    let x = new eYo.doNothing()
    chai.expect(eYo.isModel(x)).false
    x.model__ = true
    chai.expect(eYo.isModel(x)).true
  })
  it ('mf.isAllowed(...)', function () {
    let mf = new eYo.model.Format()
    mf.allow({
      foo: {
        [eYo.model.ANY]: [
          'after', 'source',
        ],
      },
    })
    chai.expect(mf.isAllowed('foo')).true
    chai.expect(mf.isAllowed('', 'foo')).true
    chai.expect(mf.isAllowed('foo', 'whatsoever')).true
    chai.expect(mf.isAllowed(`foo/whatsoever`)).true
    chai.expect(mf.isAllowed(`foo/whatsoever/`)).true
    chai.expect(mf.isAllowed(`foo/whatsoever/.`)).true
    chai.expect(mf.isAllowed(`foo//whatsoever`)).true
    chai.expect(mf.isAllowed(`foo/./whatsoever`)).true
    chai.expect(mf.isAllowed(`/foo/whatsoever`)).true
    chai.expect(mf.isAllowed(`./foo/whatsoever`)).true
    chai.expect(mf.isAllowed('foo/whatsoever', 'after')).true
    chai.expect(mf.isAllowed('foo', 'whatsoever/after')).true
    chai.expect(mf.isAllowed(`foo/whatsoever/after`)).true
    chai.expect(mf.isAllowed(`foo/whatsoever/source`)).true
    chai.expect(mf.isAllowed(`foo/whatsoever/init`)).false
    chai.expect(mf.isAllowed(`foo/whatsoever/source/init`)).false
    mf.allow({
      bar: {
        [eYo.model.ANY]: [
          'after', 'source',
        ],
      },
    })
    chai.expect(mf.isAllowed('bar')).true
    chai.expect(mf.isAllowed('', 'bar')).true
    chai.expect(mf.isAllowed('bar', 'whatsoever')).true
    chai.expect(mf.isAllowed(`bar/whatsoever`)).true
    chai.expect(mf.isAllowed(`bar/whatsoever/`)).true
    chai.expect(mf.isAllowed(`bar/whatsoever/.`)).true
    chai.expect(mf.isAllowed(`bar//whatsoever`)).true
    chai.expect(mf.isAllowed(`bar/./whatsoever`)).true
    chai.expect(mf.isAllowed(`/bar/whatsoever`)).true
    chai.expect(mf.isAllowed(`./bar/whatsoever`)).true
    chai.expect(mf.isAllowed('bar/whatsoever', 'after')).true
    chai.expect(mf.isAllowed('bar', 'whatsoever/after')).true
    chai.expect(mf.isAllowed(`bar/whatsoever/after`)).true
    chai.expect(mf.isAllowed(`bar/whatsoever/source`)).true
    chai.expect(mf.isAllowed(`bar/whatsoever/init`)).false
    chai.expect(mf.isAllowed(`bar/whatsoever/source/init`)).false
  })
  it ('modelValidate', function () {
    let mf = new eYo.model.Format()
    mf.allow('foo', {
      [eYo.model.VALIDATE]: (before) => {
        if (!eYo.isD(before)) {
          flag.push(before)
          return {
            value: before,
          }
        }
      },
    })
    chai.expect(mf.isAllowed('foo')).true
    let model = {
      foo: 1,
    }
    flag.reset()
    mf.validate(model)
    flag.expect(1)
    chai.expect(model.foo.value).equal(1)

    flag.reset()
    mf.allow('foo', eYo.model.ANY, {
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
    mf.validate(model)
    flag.expect(2)
    chai.expect(model.foo.bar.value).equal(2)
  })
  it ('modelValidate (validate)', function () {
    flag.reset()
    let mf = new eYo.model.Format()
    mf.allow('a', {
      [eYo.model.VALIDATE]: (model) => {
        flag.push(model)
        return eYo.INVALID
      }
    })
    chai.expect(() => {
      mf.validate({a: 1})
    }).throw()
    flag.expect(1)
    flag.reset()
    mf.allow('b', {
      [eYo.model.VALIDATE]: (model) => {
        flag.push(model)
      }
    })
    mf.validate({b: 2})
    flag.expect(2)
  })
  it ('...allow("a", mf_b)', function () {
    let mf_a = new eYo.model.Format()
    let mf_b = new eYo.model.Format()
    mf_b.allow('b')
    chai.expect(mf_b.isAllowed('b')).true
    chai.expect(mf_b.isAllowed('b/c')).false
    mf_a.allow('a', mf_b)
    chai.expect(mf_a.isAllowed('a')).true
    chai.expect(mf_a.isAllowed('a/b')).true
    chai.expect(mf_a.isAllowed('a/b/c')).false
    mf_b.allow('b/c')
    chai.expect(mf_b.isAllowed('b/c')).true
    chai.expect(mf_a.isAllowed('a/b/c')).true
  })
})

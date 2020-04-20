describe ('Tests: Model', function () {
  this.timeout(10000)
  let flag = {
    v: 0,
    reset (what) {
      this.v = what || 0
    },
    push (...$) {
      $.forEach(what => {
        what && (this.v = parseInt(this.v.toString() + what.toString()))
      })
      return this.v
    },
    expect (what) {
      let ans = eYo.isRA(what) ? chai.expect(what).include(this.v) : chai.expect(what).equal(this.v)
      this.reset()
      return ans
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
      eYo.TESTING = false
      mf.validate({a: 1})
      eYo.TESTING = true
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
  it (`eYo.model.Format(...)`, function () {
    var mf_a = new eYo.model.Format()
    chai.expect(mf_a.parent).undefined
    chai.expect(mf_a.key).equal('')
    chai.expect(mf_a.fallback).undefined
    chai.expect(() => {
      new eYo.model.Format('foo')
    }).throw()
    var mf_A = new eYo.model.Format(mf_a)
    chai.expect(mf_A.parent).undefined
    chai.expect(mf_A.key).equal(mf_a.key)
    chai.expect(mf_A.fallback).equal(mf_a)
    var mf_f = new eYo.model.Format(mf_a, 'foo')
    chai.expect(mf_f.parent).equal(mf_a)
    chai.expect(mf_f.key).equal('foo')
    chai.expect(mf_f.fallback).undefined
    var mf_A = new eYo.model.Format(mf_a, 'bar', mf_f)
    chai.expect(mf_A.parent).equal(mf_a)
    chai.expect(mf_A.key).equal('bar')
    chai.expect(mf_A.fallback).equal(mf_f)
    var mf_A = new eYo.model.Format(mf_a, mf_f)
    chai.expect(mf_A.parent).equal(mf_a)
    chai.expect(mf_A.key).equal(mf_f.key)
    chai.expect(mf_A.fallback).equal(mf_f)
    var mf_A = new eYo.model.Format(mf_f)
    chai.expect(mf_A.parent).undefined
    chai.expect(mf_A.key).equal('')
    chai.expect(mf_A.fallback).equal(mf_f)
  })
  it (`Fallback`, function () {
    // root
    let mf_e = new eYo.model.Format()
    chai.expect(mf_e.path).equal('/')
    let mf_de = new eYo.model.Format()
    mf_de.allow('d', mf_e)
    chai.expect(mf_de.path).equal('/')
    let mf_De = mf_de.get('d')
    chai.expect(mf_De.parent).equal(mf_de)
    chai.expect(mf_De.fallback).equal(mf_e)
    chai.expect(mf_De.key).equal('d')
    chai.expect(mf_De.path).equal('/d')
    let mf_cde = new eYo.model.Format()
    mf_cde.allow('c', mf_de)
    chai.expect(mf_cde.path).equal('/')
    let mf_Cde = mf_cde.get('c')
    chai.expect(mf_Cde.parent).equal(mf_cde)
    chai.expect(mf_Cde.fallback).equal(mf_de)
    chai.expect(mf_Cde.key).equal('c')
    chai.expect(mf_Cde.path).equal('/c')
    let mf_CDe = mf_cde.get('c/d')
    chai.expect(mf_CDe.parent).equal(mf_Cde)
    chai.expect(mf_CDe.fallback).equal(mf_De)
    chai.expect(mf_CDe.fallback.fallback).equal(mf_e)
    chai.expect(mf_CDe.key).equal('d')
    chai.expect(mf_CDe.path).equal('/c/d')
    let mf_bcde = new eYo.model.Format()
    mf_bcde.allow('b', mf_cde)
    chai.expect(mf_bcde.path).equal('/')
    let mf_Bcde = mf_bcde.get('b')
    chai.expect(mf_Bcde.parent).equal(mf_bcde)
    chai.expect(mf_Bcde.fallback).equal(mf_cde)
    chai.expect(mf_Bcde.key).equal('b')
    chai.expect(mf_Bcde.path).equal('/b')
    let mf_BCde = mf_bcde.get('b/c')
    chai.expect(mf_BCde.parent).equal(mf_Bcde)
    chai.expect(mf_BCde.fallback).equal(mf_Cde)
    chai.expect(mf_BCde.fallback.fallback).equal(mf_de)
    chai.expect(mf_BCde.key).equal('c')
    chai.expect(mf_BCde.path).equal('/b/c')
    let mf_BCDe = mf_bcde.get('b/c/d')
    chai.expect(mf_BCDe.parent).equal(mf_BCde)
    chai.expect(mf_BCDe.fallback).equal(mf_CDe)
    chai.expect(mf_BCDe.fallback.fallback).equal(mf_De)
    chai.expect(mf_BCDe.fallback.fallback.fallback).equal(mf_e)
    chai.expect(mf_BCDe.key).equal('d')
    chai.expect(mf_BCDe.path).equal('/b/c/d')
    let mf_abcde = new eYo.model.Format()
    mf_abcde.allow('a', mf_bcde)
    chai.expect(mf_abcde.path).equal('/')
    let mf_Abcde = mf_abcde.get('a')
    chai.expect(mf_Abcde.parent).equal(mf_abcde)
    chai.expect(mf_Abcde.fallback).equal(mf_bcde)
    chai.expect(mf_Abcde.key).equal('a')
    chai.expect(mf_Abcde.path).equal('/a')
    let mf_ABcde = mf_abcde.get('a/b')
    chai.expect(mf_ABcde.parent).equal(mf_Abcde)
    chai.expect(mf_ABcde.fallback).equal(mf_Bcde)
    chai.expect(mf_ABcde.fallback.fallback).equal(mf_cde)
    chai.expect(mf_ABcde.key).equal('b')
    chai.expect(mf_ABcde.path).equal('/a/b')
    let mf_ABCde = mf_abcde.get('a/b/c')
    chai.expect(mf_ABCde.parent).equal(mf_ABcde)
    chai.expect(mf_ABCde.fallback).equal(mf_BCde)
    chai.expect(mf_ABCde.fallback.fallback).equal(mf_Cde)
    chai.expect(mf_ABCde.fallback.fallback.fallback).equal(mf_de)
    chai.expect(mf_ABCde.key).equal('c')
    chai.expect(mf_ABCde.path).equal('/a/b/c')
    let mf_ABCDe = mf_abcde.get('a/b/c/d')
    chai.expect(mf_ABCDe.parent).equal(mf_ABCde)
    chai.expect(mf_ABCDe.fallback).equal(mf_BCDe)
    chai.expect(mf_ABCDe.fallback.fallback).equal(mf_CDe)
    chai.expect(mf_ABCDe.fallback.fallback.fallback).equal(mf_De)
    chai.expect(mf_ABCDe.fallback.fallback.fallback.fallback).equal(mf_e)
    chai.expect(mf_ABCDe.key).equal('d')
    chai.expect(mf_ABCDe.path).equal('/a/b/c/d')
  })
  it (`Fallback (cascade)`, function () {
    // root
    let mf_e = new eYo.model.Format()
    let mf_de = new eYo.model.Format()
    mf_de.allow('d', mf_e)
    let mf_cde = new eYo.model.Format()
    mf_cde.allow('c', mf_de)
    let mf_bcde = new eYo.model.Format()
    mf_bcde.allow('b', mf_cde)
    let mf_abcde = new eYo.model.Format()
    mf_abcde.allow('a', mf_bcde)
    let mf_ABCDe = mf_abcde.get('a/b/c/d')

    chai.expect(mf_e.path).equal('/')
    chai.expect(mf_de.path).equal('/')
    let mf_De = mf_de.get('d')
    chai.expect(mf_De.parent).equal(mf_de)
    chai.expect(mf_De.fallback).equal(mf_e)
    chai.expect(mf_De.key).equal('d')
    chai.expect(mf_De.path).equal('/d')
    chai.expect(mf_cde.path).equal('/')
    let mf_Cde = mf_cde.get('c')
    chai.expect(mf_Cde.parent).equal(mf_cde)
    chai.expect(mf_Cde.fallback).equal(mf_de)
    chai.expect(mf_Cde.key).equal('c')
    chai.expect(mf_Cde.path).equal('/c')
    let mf_CDe = mf_cde.get('c/d')
    chai.expect(mf_CDe.parent).equal(mf_Cde)
    chai.expect(mf_CDe.fallback).equal(mf_De)
    chai.expect(mf_CDe.fallback.fallback).equal(mf_e)
    chai.expect(mf_CDe.key).equal('d')
    chai.expect(mf_CDe.path).equal('/c/d')
    chai.expect(mf_bcde.path).equal('/')
    let mf_Bcde = mf_bcde.get('b')
    chai.expect(mf_Bcde.parent).equal(mf_bcde)
    chai.expect(mf_Bcde.fallback).equal(mf_cde)
    chai.expect(mf_Bcde.key).equal('b')
    chai.expect(mf_Bcde.path).equal('/b')
    let mf_BCde = mf_bcde.get('b/c')
    chai.expect(mf_BCde.parent).equal(mf_Bcde)
    chai.expect(mf_BCde.fallback).equal(mf_Cde)
    chai.expect(mf_BCde.fallback.fallback).equal(mf_de)
    chai.expect(mf_BCde.key).equal('c')
    chai.expect(mf_BCde.path).equal('/b/c')
    let mf_BCDe = mf_bcde.get('b/c/d')
    chai.expect(mf_BCDe.parent).equal(mf_BCde)
    chai.expect(mf_BCDe.fallback).equal(mf_CDe)
    chai.expect(mf_BCDe.fallback.fallback).equal(mf_De)
    chai.expect(mf_BCDe.fallback.fallback.fallback).equal(mf_e)
    chai.expect(mf_BCDe.key).equal('d')
    chai.expect(mf_BCDe.path).equal('/b/c/d')
    chai.expect(mf_abcde.path).equal('/')
    let mf_Abcde = mf_abcde.get('a')
    chai.expect(mf_Abcde.parent).equal(mf_abcde)
    chai.expect(mf_Abcde.fallback).equal(mf_bcde)
    chai.expect(mf_Abcde.key).equal('a')
    chai.expect(mf_Abcde.path).equal('/a')
    let mf_ABcde = mf_abcde.get('a/b')
    chai.expect(mf_ABcde.parent).equal(mf_Abcde)
    chai.expect(mf_ABcde.fallback).equal(mf_Bcde)
    chai.expect(mf_ABcde.fallback.fallback).equal(mf_cde)
    chai.expect(mf_ABcde.key).equal('b')
    chai.expect(mf_ABcde.path).equal('/a/b')
    let mf_ABCde = mf_abcde.get('a/b/c')
    chai.expect(mf_ABCde.parent).equal(mf_ABcde)
    chai.expect(mf_ABCde.fallback).equal(mf_BCde)
    chai.expect(mf_ABCde.fallback.fallback).equal(mf_Cde)
    chai.expect(mf_ABCde.fallback.fallback.fallback).equal(mf_de)
    chai.expect(mf_ABCde.key).equal('c')
    chai.expect(mf_ABCde.path).equal('/a/b/c')
    // let mf_ABCDe = mf_abcde.get('a/b/c/d')
    chai.expect(mf_ABCDe.parent).equal(mf_ABCde)
    chai.expect(mf_ABCDe.fallback).equal(mf_BCDe)
    chai.expect(mf_ABCDe.fallback.fallback).equal(mf_CDe)
    chai.expect(mf_ABCDe.fallback.fallback.fallback).equal(mf_De)
    chai.expect(mf_ABCDe.fallback.fallback.fallback.fallback).equal(mf_e)
    chai.expect(mf_ABCDe.key).equal('d')
    chai.expect(mf_ABCDe.path).equal('/a/b/c/d')
  })
  it (`eYo.model.validate...`, function () {
    let expectOK = (yorn, K, what) => {
      let expect = chai.expect(eYo.isVALID(eYo.model['validate' + K](what)))
      yorn ? expect.true : expect.false
    }
    expectOK (false, 'F')
    expectOK (false, 'F', eYo.NA)
    expectOK(false, 'F', 421)
    expectOK(true, 'F', eYo.doNothing)
    expectOK(true, 'F', eYo.doReturn)
    expectOK(true, 'F', function () {})
    expectOK(true, 'F', () => {})
    expectOK(true, 'F', {
      foo () {}
    }.foo)

    expectOK (false, 'ForFalse')
    expectOK (false, 'ForFalse', eYo.NA)
    expectOK(false, 'ForFalse', 421)
    expectOK(true, 'ForFalse', eYo.doNothing)
    expectOK(true, 'ForFalse', eYo.doReturn)
    expectOK(true, 'ForFalse', function () {})
    expectOK(true, 'ForFalse', () => {})
    expectOK(true, 'ForFalse', {
      foo () {}
    }.foo)
    expectOK(true, 'ForFalse', false)

    expectOK (false, 'Bool')
    expectOK (false, 'Bool', eYo.NA)
    expectOK(false, 'Bool', 421)
    expectOK(true, 'Bool', true)
    expectOK(true, 'Bool', false)

    expectOK (false, 'D')
    expectOK (false, 'D', eYo.NA)
    expectOK(false, 'D', 421)
    expectOK(true, 'D', {})

    expectOK (false, 'RA')
    expectOK (false, 'RA', eYo.NA)
    expectOK(false, 'RA', 421)
    expectOK(true, 'RA', [421])
  })
  it (`eYo.model.descriptor...`, function () {
    let expectOK = (yorn, K, what) => {
      var expect = chai.expect(() => {
        let mf = new eYo.model.Format()
        mf.allow('foo', eYo.model['descriptor' + K]())
        mf.validate({
          foo: what
        })
      })
      if (yorn) {
        expect = expect.not
      }
      expect.throw()
    }
    expectOK (true, 'F')
    expectOK (true, 'F', eYo.NA)
    expectOK(false, 'F', 421)
    expectOK(true, 'F', eYo.doNothing)
    expectOK(true, 'F', eYo.doReturn)
    expectOK(true, 'F', function () {})
    expectOK(true, 'F', () => {})
    expectOK(true, 'F', {
      foo () {}
    }.foo)

    expectOK (true, 'ForFalse')
    expectOK (true, 'ForFalse', eYo.NA)
    expectOK(false, 'ForFalse', 421)
    expectOK(true, 'ForFalse', eYo.doNothing)
    expectOK(true, 'ForFalse', eYo.doReturn)
    expectOK(true, 'ForFalse', function () {})
    expectOK(true, 'ForFalse', () => {})
    expectOK(true, 'ForFalse', {
      foo () {}
    }.foo)
    expectOK(true, 'ForFalse', false)

    expectOK (true, 'Bool')
    expectOK (true, 'Bool', eYo.NA)
    expectOK(false, 'Bool', 421)
    expectOK(true, 'Bool', true)
    expectOK(true, 'Bool', false)

    expectOK (true, 'D')
    expectOK (true, 'D', eYo.NA)
    expectOK(false, 'D', 421)
    expectOK(true, 'D', {})

    expectOK(true, 'RA')
    expectOK(true, 'RA', eYo.NA)
    expectOK(false, 'RA', 421)
    expectOK(true, 'RA', [421])

  })
  it (`eYo.model.manyDescriptor...`, function () {
    let expectOK = (yorn, K, what) => {
      var expect = chai.expect(() => {
        let mf = new eYo.model.Format()
        mf.allow(eYo.model['manyDescriptor' + K]('foo', 'bar'))
        mf.validate({
          foo: what,
          bar: what,
        })
      })
      if (yorn) {
        expect = expect.not
      }
      expect.throw()
    }
    expectOK (true, 'F')
    expectOK (true, 'F', eYo.NA)
    expectOK(false, 'F', 421)
    expectOK(true, 'F', eYo.doNothing)
    expectOK(true, 'F', eYo.doReturn)
    expectOK(true, 'F', function () {})
    expectOK(true, 'F', () => {})
    expectOK(true, 'F', {
      foo () {}
    }.foo)

    expectOK (true, 'ForFalse')
    expectOK (true, 'ForFalse', eYo.NA)
    expectOK(false, 'ForFalse', 421)
    expectOK(true, 'ForFalse', eYo.doNothing)
    expectOK(true, 'ForFalse', eYo.doReturn)
    expectOK(true, 'ForFalse', function () {})
    expectOK(true, 'ForFalse', () => {})
    expectOK(true, 'ForFalse', {
      foo () {}
    }.foo)
    expectOK(true, 'ForFalse', false)

    expectOK (true, 'Bool')
    expectOK (true, 'Bool', eYo.NA)
    expectOK(false, 'Bool', 421)
    expectOK(true, 'Bool', true)
    expectOK(true, 'Bool', false)

    expectOK (true, 'D')
    expectOK (true, 'D', eYo.NA)
    expectOK(false, 'D', 421)
    expectOK(true, 'D', {})

    expectOK(true, 'RA')
    expectOK(true, 'RA', eYo.NA)
    expectOK(false, 'RA', 421)
    expectOK(true, 'RA', [421])

  })
})

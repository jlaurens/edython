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
  })
  it ('Model: isModel', function () {
    chai.expect(eYo.isModel({})).true
    let x = new eYo.doNothing()
    chai.expect(eYo.isModel(x)).false
    x.model__ = true
    chai.expect(eYo.isModel(x)).true
  })
  it ('eYo.model.modelIsAllowed(...)', function () {
    let KEY = eYo.genUID(eYo.IDENT, 10)
    eYo.model.modelAllow({
      [KEY]: {
        [eYo.model.ANY]: [
          'after', 'source',
        ],
      },
    })
    chai.expect(eYo.model.modelIsAllowed(KEY)).true
    chai.expect(eYo.model.modelIsAllowed('', KEY)).true
    chai.expect(eYo.model.modelIsAllowed(KEY, 'whatsoever')).true
    chai.expect(eYo.model.modelIsAllowed(`${KEY}/whatsoever`)).true
    chai.expect(eYo.model.modelIsAllowed(`${KEY}/whatsoever/`)).true
    chai.expect(eYo.model.modelIsAllowed(`${KEY}/whatsoever/.`)).true
    chai.expect(eYo.model.modelIsAllowed(`${KEY}//whatsoever`)).true
    chai.expect(eYo.model.modelIsAllowed(`${KEY}/./whatsoever`)).true
    chai.expect(eYo.model.modelIsAllowed(`/${KEY}/whatsoever`)).true
    chai.expect(eYo.model.modelIsAllowed(`./${KEY}/whatsoever`)).true
    chai.expect(eYo.model.modelIsAllowed(KEY + '/whatsoever', 'after')).true
    chai.expect(eYo.model.modelIsAllowed(KEY, 'whatsoever/after')).true
    chai.expect(eYo.model.modelIsAllowed(`${KEY}/whatsoever/after`)).true
    chai.expect(eYo.model.modelIsAllowed(`${KEY}/whatsoever/source`)).true
    chai.expect(eYo.model.modelIsAllowed(`${KEY}/whatsoever/init`)).false
    chai.expect(eYo.model.modelIsAllowed(`${KEY}/whatsoever/source/init`)).false
    var a = eYo.genUID(eYo.IDENT, 10)
    eYo.model.modelAllow({
      [a]: {
        [eYo.model.ANY]: [
          'after', 'source',
        ],
      },
    })
    chai.expect(eYo.model.modelIsAllowed(a)).true
    chai.expect(eYo.model.modelIsAllowed('', a)).true
    chai.expect(eYo.model.modelIsAllowed(a, 'whatsoever')).true
    chai.expect(eYo.model.modelIsAllowed(`${a}/whatsoever`)).true
    chai.expect(eYo.model.modelIsAllowed(`${a}/whatsoever/`)).true
    chai.expect(eYo.model.modelIsAllowed(`${a}/whatsoever/.`)).true
    chai.expect(eYo.model.modelIsAllowed(`${a}//whatsoever`)).true
    chai.expect(eYo.model.modelIsAllowed(`${a}/./whatsoever`)).true
    chai.expect(eYo.model.modelIsAllowed(`/${a}/whatsoever`)).true
    chai.expect(eYo.model.modelIsAllowed(`./${a}/whatsoever`)).true
    chai.expect(eYo.model.modelIsAllowed(a + '/whatsoever', 'after')).true
    chai.expect(eYo.model.modelIsAllowed(a, 'whatsoever/after')).true
    chai.expect(eYo.model.modelIsAllowed(`${a}/whatsoever/after`)).true
    chai.expect(eYo.model.modelIsAllowed(`${a}/whatsoever/source`)).true
    chai.expect(eYo.model.modelIsAllowed(`${a}/whatsoever/init`)).false
    chai.expect(eYo.model.modelIsAllowed(`${a}/whatsoever/source/init`)).false
  })
  it ('modelValidate', function () {
    let NS = eYo.model.makeNS()
    NS.makeModelController()
    NS.modelAllow('foo', {
      [eYo.model.VALIDATE]: (before) => {
        if (!eYo.isD(before)) {
          flag.push(before)
          return {
            value: before,
          }
        }
      },
    })
    chai.expect(NS.modelIsAllowed('foo')).true
    let model = {
      foo: 1,
    }
    flag.reset()
    NS.modelValidate(model)
    flag.expect(1)
    chai.expect(model.foo.value).equal(1)

    flag.reset()
    NS.modelAllow('foo', eYo.model.ANY, {
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
    NS.modelValidate(model)
    flag.expect(2)
    chai.expect(model.foo.bar.value).equal(2)
  })
  it ('modelValidate (validate)', function () {
    let NS = eYo.model.makeNS()
    NS.makeModelController()
    flag.reset()
    NS.modelAllow('a', {
      [eYo.model.VALIDATE]: (model) => {
        flag.push(model)
        return eYo.INVALID
      }
    })
    chai.expect(() => {
      NS.modelValidate({a: 1})
    }).throw()
    flag.expect(1)
    flag.reset()
    NS.modelAllow('b', {
      [eYo.model.VALIDATE]: (model) => {
        flag.push(model)
      }
    })
    NS.modelValidate({b: 2})
    flag.expect(2)
  })
  it ('modelValidate (global model)', function () {
    let foo = eYo.model.makeNS()
    let kFoo = `foo${eYo.genUID(eYo.IDENT, 10)}`
    foo.modelAllow(kFoo, {
      [eYo.model.VALIDATE]: (before, p) => {
        if (!eYo.isD(before)) {
          return {
            value: before,
          }
        }
      },
    })
    let model = {
      [kFoo]: 421,
    }
    foo.modelValidate(model)
    chai.expect(model[kFoo].value).equal(421)
    let bar = eYo.model.makeNS()
    model[kFoo] = 123
    bar.modelValidate(model)
    chai.expect(model[kFoo].value).equal(123)
  })
  it ('...makeModelController()', function () {
    let NS = eYo.model.makeNS()
    NS.makeModelController()
    chai.expect(eYo.model.modelController).not.equal(NS.modelController)
  })
  it ('...modelAllow("a", NSb)', function () {
    let NSa = eYo.model.makeNS()
    NSa.makeModelController()
    let NSb = eYo.model.makeNS()
    NSb.makeModelController()
    NSb.modelAllow('b')
    chai.expect(NSb.modelIsAllowed('b')).true
    chai.expect(NSb.modelIsAllowed('b/c')).false
    NSa.modelAllow('a', NSb)
    chai.expect(NSa.modelIsAllowed('a')).true
    chai.expect(NSa.modelIsAllowed('a/b')).true
    chai.expect(NSa.modelIsAllowed('a/b/c')).false
    NSb.modelAllow('b/c')
    chai.expect(NSb.modelIsAllowed('b/c')).true
    chai.expect(NSa.modelIsAllowed('a/b/c')).true
  })
})

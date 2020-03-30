describe ('Tests: Model', function () {
  let KEY = eYo.genUID(eYo.IDENT, 10)
  this.timeout(10000)
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
    chai.assert(eYo.isModel({}))
    let x = new eYo.doNothing()
    chai.assert(!eYo.isModel(x))
    x.model__ = true
    chai.assert(eYo.isModel(x))
  })
  it ('eYo.model.isAllowed(path, k)', function () {
    eYo.model.allowModelPaths({
      [eYo.model.ROOT]: KEY,
      [KEY]: '\\w+',
      [KEY + '\\.\\w+']: [
        'after', 'source',
      ],
    })
    chai.expect(eYo.model.isAllowed('', KEY)).true
    chai.expect(eYo.model.isAllowed(KEY, 'whatsoever')).true
    chai.expect(eYo.model.isAllowed(KEY + '.whatsoever', 'after')).true
    chai.expect(eYo.model.isAllowed(KEY + '.whatsoever', 'source')).true
    chai.expect(eYo.model.isAllowed(KEY + '.whatsoever', 'init')).false
    var a = eYo.genUID(eYo.IDENT, 10)
    eYo.model.allowModelPaths({
      [eYo.model.ROOT]: a,
      [a]: '\\w+',
      [a + '\\.\\w+']: [
        'after', 'source',
      ],
    })
    chai.expect(eYo.model.isAllowed('', a)).true
    chai.expect(eYo.model.isAllowed(a, 'whatsoever')).true
    chai.expect(eYo.model.isAllowed(a + '.whatsoever', 'after')).true
    chai.expect(eYo.model.isAllowed(a + '.whatsoever', 'source')).true
    chai.expect(eYo.model.isAllowed(a + '.whatsoever', 'init')).false
  })
  it ('Inheritance 1', function () {
    eYo.model.allowModelPaths({
      [eYo.model.ROOT]: KEY,
    })
    var model = {}
    var base = {[KEY]: 421}
    chai.expect(eYo.isNA(model[KEY])).true
    eYo.model.extends(model, base)
    chai.expect(model[KEY]).equal(421)
  })
  it ('Inheritance 2', function () {
    var base = {xml: {attr: 421}}
    var model = {}
    eYo.model.extends(model, base)
    chai.expect(model.xml.attr).equal(421)
  })
  it ('Inheritance 3', function () {
    var base = {
      xml: {
        attr: 421
      }
    }
    var model = {
      xml: {
        types: 123
      }
    }
    eYo.model.extends(model, base)
    chai.expect(model.xml.attr).equal(421)
    chai.expect(model.xml.types).equal(123)
  })
  it ('Inheritance 4', function () {
    eYo.model.allowModelPaths({
      [eYo.model.ROOT]: KEY,
      [KEY]: '\\w+',
      [KEY + '\\.\\w+']: [
        'xml',
      ],
    })
    var base = {
      [KEY]: {
        aa: 421
      }
    }
    var model = {
      [KEY]: {
        aa: {
          xml: 421
        },
        ab: 123
      },
    }
    chai.expect(model[KEY].aa.xml).equal(421)
    eYo.model.extends(model, base) // No model override
    chai.expect(model[KEY].aa.xml).equal(421)
    var submodel = {
      [KEY]: {
        ab: 421
      }
    }
    eYo.model.extends(submodel, model)
    chai.expect(submodel[KEY].aa.xml).equal(421)
    chai.expect(submodel[KEY].ab).equal(421)
  })
  it ('modelExpand', function () {
    let kFoo = `foo${eYo.genUID(eYo.IDENT, 10)}`
    eYo.model.allowModelPaths({
      [eYo.model.ROOT]: kFoo,
    })
    eYo.model.allowModelShortcuts({
      [kFoo]: (before, p) => {
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
    eYo.model.modelExpand(model)
    chai.expect(model[kFoo].value).equal(421)
    eYo.model.allowModelPaths({
      [kFoo]: '\\w+',
    })
    eYo.model.allowModelShortcuts({
      [`^${kFoo}.\\w+`]: (before, p) => {
        if (!eYo.isD(before)) {
          return {
            value: before,
          }
        }
      },
    })
    model[kFoo] = {
      bar: 123,
    }
    eYo.model.modelExpand(model)
    chai.expect(model[kFoo].bar.value).equal(123)
  })
  it ('modelExpand (global model)', function () {
    let foo = eYo.model.makeNS()
    let kFoo = `foo${eYo.genUID(eYo.IDENT, 10)}`
    foo.allowModelPaths({
      [eYo.model.ROOT]: kFoo,
    })
    foo.allowModelShortcuts({
      [kFoo]: (before, p) => {
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
    foo.modelExpand(model)
    chai.expect(model[kFoo].value).equal(421)
    let bar = eYo.model.makeNS()
    model[kFoo] = 123
    bar.modelExpand(model)
    chai.expect(model[kFoo].value).equal(123)
  })
})

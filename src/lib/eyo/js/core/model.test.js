describe ('Tests: Model', function () {
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
    chai.assert(eYo.model.isAllowed('', 'properties'))
    chai.assert(!eYo.model.isAllowed('', 'property'))
    chai.assert(eYo.model.isAllowed('slots.whatsoever.xml', 'accept'))
    chai.assert(eYo.model.isAllowed('', 'init'))
    chai.assert(eYo.model.isAllowed('properties', 'abc'))
    chai.assert(eYo.model.isAllowed('properties.abc', 'validate'))
  })
  it ('Inheritance 1', function () {
    var base = {init: 421}
    var model = {}
    eYo.model.extends(model, base)
    chai.assert(model.init === 421)
  })
  it ('Inheritance 2', function () {
    var base = {xml: {attr: 421}}
    var model = {}
    eYo.model.extends(model, base)
    chai.assert(model.xml.attr === 421)
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
    chai.assert(model.xml.attr === 421)
    chai.assert(model.xml.types === 123)
  })
  it ('Inheritance 4', function () {
    var base = {
      data: {
        aa: 421
      }
    }
    var model = {
      data: {
        aa: {
          xml: 421
        },
        ab: 123
      },
      properties: 421,
    }
    var submodel = {
      data: {
        ab: 421
      }
    }
    eYo.model.extends(model, base)
    eYo.model.extends(submodel, model)
    chai.assert(submodel.data.aa.xml === 421)
    chai.assert(submodel.data.ab === 421)
    chai.assert(submodel.properties === 421)
  })
  it('eYo.model.consolidate(…)', function () {
    var model = {
      properties: {
        drag: {
          get () {},
        },
      },
    }
    eYo.model.consolidate(model)
    chai.assert(eYo.isF(model.properties.drag.get))
    var model = {
      properties: {
        drag () {},
      },
    }
    eYo.model.consolidate(model)
    chai.assert(eYo.isF(model.properties.drag))
  })
})

describe('eYo Tests', function () {
  describe('POC', function () {
    it(`Catch the key? No need to...`, function () {
      var f = (object, k) => {
        var k_ = k + '_'
        Object.defineProperty(object, k_, {
          get () {
            return object[k]
          }
        })
      }
      var a = {
        a: 421,
        b: 123,
      }
      f(a, 'a')
      chai.assert(a.a_ = 421)
      f(a, 'b')
      chai.assert(a.a_ = 421)
      chai.assert(a.b_ = 123)
    })
  })
  describe('Gobals', function () {
    it(`Strong undefined`, function () {
      var x
      chai.assert(eYo.NA === undefined)
      chai.assert(eYo.NA === x)
    })
  })
  describe('Model', function () {
    it ('Inheritance 1', function () {
      var base = {a: 421}
      var model = {}
      eYo.C9r.Model.extends(model, base)
      chai.assert(model.a === 421)
    })
    it ('Inheritance 2', function () {
      var base = {a: {aa: 421}}
      var model = {}
      eYo.C9r.Model.extends(model, base)
      chai.assert(model.a.aa === 421)
    })
    it ('Inheritance 3', function () {
      var base = {
        a: {
          aa: 421
        }
      }
      var model = {
        a: {
          ab: 123
        }
      }
      eYo.C9r.Model.extends(model, base)
      chai.assert(model.a.aa === 421)
      chai.assert(model.a.ab === 123)
    })
    it ('Inheritance 4', function () {
      var base = {
        a: {
          aa: 421
        }
      }
      var model = {
        a: {
          aa: {
            aaa: 421
          },
          ab: 123
        },
        b: 421,
      }
      var submodel = {
        a: {
          ab: 421
        }
      }
      eYo.C9r.Model.extends(model, base)
      eYo.C9r.Model.extends(submodel, model)
      chai.assert(submodel.a.aa.aaa === 421)
      chai.assert(submodel.a.ab === 421)
      chai.assert(submodel.b === 421)
    })
  })
})
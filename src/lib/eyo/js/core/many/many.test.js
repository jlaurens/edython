NS = Object.create(null)
describe ('Tests: many', function () {
  this.timeout(20000)
  beforeEach (function() {
    eYo.test.setup()
  })
  eYo.test.setup()
  it ('manyEnhanced, one', function () {
    let dlgt = eYo.dlgt.new('Foo', {
      bar: {
        a: 1,
      }
    })
    var C3s = function () {}
    let o = new C3s()
    dlgt.setC9r(C3s)
    var foo1$ = dlgt.manyEnhanced('foo1', 'bar', {})
    chai.expect(() => {
      dlgt[foo1$.prepare](o)
    }).xthrow() // eYo.foo1 is not a kown type
    chai.expect(() => {
      dlgt.manyEnhanced('foo1', 'bar', {})
    }).xthrow() // manyEnhanced already run with that key
    var foo2$ = dlgt.manyEnhanced('foo2', 'bar', {
      make (model, k, object) {
        eYo.flag.push('m', k, model)
        return model+1
      }
    })
    dlgt[foo2$.prepare](o)
    eYo.flag.expect('ma1')
    dlgt[foo2$.links](o)
    dlgt[foo2$.shortcuts](o)
    chai.expect(o.a_f).equal(2)
    chai.expect(o[foo2$.head]).equal(2)
    chai.expect(o[foo2$.tail]).equal(2)
    var foo3$ = dlgt.manyEnhanced('foo3', 'bar', {
      make (model, k, object) {
        eYo.flag.push(model)
        return model+2
      },
      suffix: '_ff',
    })
    dlgt[foo3$.prepare](o)
    eYo.flag.expect(1)
    dlgt[foo3$.links](o)
    dlgt[foo3$.shortcuts](o)
    chai.expect(o.a_ff).equal(3)
    var foo4$ = dlgt.manyEnhanced('foo4', 'bar', {
      make (model, k, object) {
        eYo.flag.push('m', k, model)
        return model+3
      },
      shortcuts (object) {
        for (let [k, v] of object[foo4$.map]) {
          eYo.mixinRO(object, {
            [k + '__ff']: v,
          })
        }
      },
    })
    dlgt[foo4$.prepare](o)
    eYo.flag.expect('ma1')
    dlgt[foo4$.links](o)
    dlgt[foo4$.shortcuts](o)
    chai.expect(o.a__ff).equal(4)
    var foo5$ = dlgt.manyEnhanced('foo5', 'bar', {
      make (model, k, object) {
        eYo.flag.push('m', k, model)
        return model+4
      },
      suffix: '_f5',
    })
    dlgt[foo5$.prepare](o)
    o.a_f5 = 421 // will cause  next `shortcuts` call to throw
    chai.expect(() => {
      dlgt[foo5$.shortcuts](o)
    }).xthrow()
  })
  it ('manyEnhanced, many', function () {
    var C3s = function () {}
    let o = new C3s()
    let dlgt = eYo.dlgt.new('Foo', {
      bar: {
        a: 1,
        b: 2,
        c: 3,
      }
    })
    dlgt.setC9r(C3s)
    var foo$ = dlgt.manyEnhanced('foo', 'bar', {
      make (model, k, object) {
        return {
          value: model
        }
      }
    })
    dlgt[foo$.prepare](o)
    dlgt[foo$.shortcuts](o)
    dlgt[foo$.links](o)
    eYo.flag.push(o.a_f.value, o.b_f.value, o.c_f.value)
    eYo.flag.expect(123)
    chai.expect([1, 2, 3]).includes(o[foo$.head].value)
    chai.expect([1, 2, 3]).includes(o[foo$.tail].value)
    chai.expect(o[foo$.head][eYo.$previous]).undefined
    chai.expect(o[foo$.head][eYo.$next].value).equal(2)
    chai.expect(o[foo$.head][eYo.$next]).equal(o[foo$.tail][eYo.$previous])
    chai.expect(o.a_f).equal(o[foo$.map].get('a'))
    chai.expect(o.b_f).equal(o[foo$.map].get('b'))
    chai.expect(o.c_f).equal(o[foo$.map].get('c'))
  })
  it ('manyEnhanced, many (ordered)', function () {
    let permutations = [['a', 'b', 'c'], ['a', 'c', 'b'], ['b', 'c', 'a'], ['b', 'a', 'c'], ['c', 'a', 'b'], ['c', 'b', 'a']]
    var base = {a: 1, b: 2, c: 3,}
    permutations.forEach(ordered_keys => {
      permutations.forEach(declared_keys => {
        let model = {}
        ;declared_keys.forEach(k => {
          let order = ordered_keys.indexOf(k)
          if (order) {
            model[k] = {
              after: ordered_keys[order-1],
              data: base[k],
            }
          } else {
            model[k] = {
              data: base[k],
            }
          }
        })
        var C3s = function () {}
        let o = new C3s()
        let dlgt = eYo.dlgt.new('Foo', {
          bar: model
        })
        dlgt.setC9r(C3s)
        var foo$ = dlgt.manyEnhanced('foo', 'bar', {
          make (model, k, object) {
            return {
              key: k,
              value: model.data,
            }
          }
        })
        dlgt[foo$.prepare](o)
        dlgt[foo$.shortcuts](o)
        dlgt[foo$.links](o)
        chai.expect(o.a_f.value).equal(1)
        chai.expect(o.b_f.value).equal(2)
        chai.expect(o.c_f.value).equal(3)
        chai.expect(ordered_keys[0]).equal(o[foo$.head].key)
        chai.expect(ordered_keys[2]).equal(o[foo$.tail].key)
        chai.expect(o[foo$.head][eYo.$previous]).undefined
        chai.expect(o[foo$.head][eYo.$next].key).equal(ordered_keys[1])
        chai.expect(o[foo$.head][eYo.$next]).equal(o[foo$.tail][eYo.$previous])
        chai.expect(o.a_f).equal(o[foo$.map].get('a'))
        chai.expect(o.b_f).equal(o[foo$.map].get('b'))
        chai.expect(o.c_f).equal(o[foo$.map].get('c'))          
      })
    })
  })
})

NS = Object.create(null)
describe ('Tests: many', function () {
  this.timeout(20000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c9r && eYo.c9r.new({
      methods: {
        flag (what, ...$) {
          flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  })
  it ('manyEnhanced: Basics', function () {
    var C9r = function () {}
    let dlgt = eYo.dlgt.new('Foo', C9r, {})
    flag.reset()
    var foo$ = dlgt.manyEnhanced('foo', 'bar', {})
    ;[
      // 'modelMap_',
      'modelByKey',
      //'modelMap',
      // 'map',
      'prepare',
      'merge',
      'init',
      'dispose',
      // 'forEach',
      // 'some',
      // 'head',
      // 'tail',
    ].forEach(k => {
      var sym = foo$[k]
      chai.assert(sym)
      chai.assert(dlgt._p[sym])
    })
    ;[
      'forEach',
      'some',
    ].forEach(k => {
      var sym = foo$[k]
      chai.assert(sym)
      chai.assert(dlgt.C9r_p[sym])
    })
    chai.assert(dlgt[foo$.modelMap])
    let o = new C9r()
    eYo.dlgt.declareDlgt(C9r.prototype)
    dlgt[foo$.prepare](o)
    chai.assert(o[foo$.map])
    chai.expect(o[foo$.head]).undefined
    chai.expect(o[foo$.tail]).undefined
  })
  it ('manyEnhanced, one', function () {
    var C9r = function () {}
    let o = new C9r()
    let dlgt = eYo.dlgt.new('Foo', C9r, {
      bar: {
        a: 1,
      }
    })
    flag.reset()
    var foo1$ = dlgt.manyEnhanced('foo1', 'bar', {})
    chai.expect(() => {
      dlgt[foo1$.prepare](o)
    }).throw()
    chai.expect(() => {
      dlgt.manyEnhanced('foo1', 'bar', {})
    }).throw()
    var foo2$ = dlgt.manyEnhanced('foo2', 'bar', {
      make (model, k, object) {
        flag.push(model)
        return model+1
      }
    })
    dlgt[foo2$.prepare](o)
    flag.expect(1)
    dlgt[foo2$.links](o)
    dlgt[foo2$.shortcuts](o)
    chai.expect(o.a_f).equal(2)
    chai.expect(o[foo2$.head]).equal(2)
    chai.expect(o[foo2$.tail]).equal(2)
    var foo3$ = dlgt.manyEnhanced('foo3', 'bar', {
      make (model, k, object) {
        flag.push(model)
        return model+2
      },
      suffix: '_ff',
    })
    dlgt[foo3$.prepare](o)
    flag.expect(1)
    dlgt[foo3$.links](o)
    dlgt[foo3$.shortcuts](o)
    chai.expect(o.a_ff).equal(3)
    var foo4$ = dlgt.manyEnhanced('foo4', 'bar', {
      make (model, k, object) {
        flag.push(model)
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
    flag.expect(1)
    dlgt[foo4$.links](o)
    dlgt[foo4$.shortcuts](o)
    chai.expect(o.a__ff).equal(4)
    var foo5$ = dlgt.manyEnhanced('foo5', 'bar', {
      make (model, k, object) {
        flag.push(model)
        return model+4
      },
      suffix: '_f5',
    })
    dlgt[foo5$.prepare](o)
    o.a_f5 = 421
    chai.expect(() => {
      dlgt[foo5$.shortcuts](o)
    }).throw()
  })
  it ('manyEnhanced, many', function () {
    var C9r = function () {}
    let o = new C9r()
    let dlgt = eYo.dlgt.new('Foo', C9r, {
      bar: {
        a: 1,
        b: 2,
        c: 3,
      }
    })
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
    flag.push(o.a_f.value, o.b_f.value, o.c_f.value)
    flag.expect(123)
    chai.expect([1, 2, 3]).includes(o[foo$.head].value)
    chai.expect([1, 2, 3]).includes(o[foo$.tail].value)
    chai.expect(o[foo$.head][eYo.$previous]).undefined
    chai.expect(o[foo$.head][eYo.$next].value).equal(2)
    chai.expect(o[foo$.head][eYo.$next]).equal(o[foo$.tail][eYo.$previous])
    chai.expect(o.a_f).equal(o[foo$.map].get('a'))
    chai.expect(o.b_f).equal(o[foo$.map].get('b'))
    chai.expect(o.c_f).equal(o[foo$.map].get('c'))
  })
})

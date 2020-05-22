NS = Object.create(null)
describe ('Tests: many', function () {
  this.timeout(10000)
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
    dlgt.manyEnhanced('foo', 'bar', {})
    ;[
      // 'ModelMap_',
      'ModelByKey__',
      //'ModelMap',
      // 'Map',
      'Prepare',
      'Merge',
      'Init',
      'Dispose',
      // 'ForEach',
      // 'Some',
      // 'Head',
      // 'Tail',
    ].forEach(k => {
      chai.assert(dlgt._p['foo'+k])
    })
    ;[
      'ForEach',
      'Some',
    ].forEach(k => {
      chai.assert(dlgt.C9r_p['foo'+k])
    })
    chai.assert(dlgt.fooModelMap)
    let o = new C9r()
    eYo.dlgt.declareDlgt(C9r.prototype)
    dlgt.fooPrepare(o)
    chai.assert(o.fooMap)
    chai.expect(o.fooHead).undefined
    chai.expect(o.fooTail).undefined
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
    dlgt.manyEnhanced('foo1', 'bar', {})
    chai.expect(() => {
      dlgt.foo1Prepare(o)
    }).throw()
    chai.expect(() => {
      dlgt.manyEnhanced('foo1', 'bar', {})
    }).throw()
    dlgt.manyEnhanced('foo2', 'bar', {
      make (model, k, object) {
        flag.push(model)
        return model+1
      }
    })
    dlgt.foo2Prepare(o)
    flag.expect(1)
    dlgt.foo2Links(o)
    dlgt.foo2Shortcuts(o)
    chai.expect(o.a_f).equal(2)
    chai.expect(o.foo2Head).equal(2)
    chai.expect(o.foo2Tail).equal(2)
    dlgt.manyEnhanced('foo3', 'bar', {
      make (model, k, object) {
        flag.push(model)
        return model+1
      },
      suffix: '_ff',
    })
    dlgt.foo3Prepare(o)
    flag.expect(1)
    dlgt.foo3Links(o)
    dlgt.foo3Shortcuts(o)
    chai.expect(o.a_ff).equal(2)
    dlgt.manyEnhanced('foo4', 'bar', {
      make (model, k, object) {
        flag.push(model)
        return model+1
      },
      shortcuts (object) {
        for (let [k, v] of object.foo4Map) {
          Object.defineProperties(object, {
            [k + '__ff']: eYo.descriptorR(function () {
              return v
            }),
          })
        }
      },
    })
    dlgt.foo4Prepare(o)
    flag.expect(1)
    dlgt.foo4Shortcuts(o)
    dlgt.foo4Links(o)
    chai.expect(o.a__ff).equal(2)
    dlgt.manyEnhanced('foo5', 'bar', {
      make (model, k, object) {
        flag.push(model)
        return model+1
      },
      suffix: '_f5',
    })
    dlgt.foo5Prepare(o)
    o.a_f5 = 421
    chai.expect(() => {
      dlgt.foo5Shortcuts(o)
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
    dlgt.manyEnhanced('foo', 'bar', {
      make (model, k, object) {
        return {
          value: model
        }
      }
    })
    dlgt.fooPrepare(o)
    dlgt.fooShortcuts(o)
    dlgt.fooLinks(o)
    flag.push(o.a_f.value)
    flag.push(o.b_f.value)
    flag.push(o.c_f.value)
    flag.expect(123)
    chai.expect([1, 2, 3]).includes(o.fooHead.value)
    chai.expect([1, 2, 3]).includes(o.fooTail.value)
    chai.expect(!!o.fooHead.previous).false
    chai.expect(!!o.fooTail.next).false
    chai.expect(o.fooHead.next).equal(o.fooTail.previous)
    chai.expect(o.a_f).equal(o.fooMap.get('a'))
    chai.expect(o.b_f).equal(o.fooMap.get('b'))
    chai.expect(o.c_f).equal(o.fooMap.get('c'))
  })
})

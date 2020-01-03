'use strict'

const NS = Object.create(null)

describe ('Tests: data', function () {
  this.timeout(10000)
  it ('eYo.XRE.function_builtin_before', function () {
    let test = (s, builtin, before) => {
      let m = XRegExp.exec(s, eYo.XRE.function_builtin_before)
      chai.assert(m)
      chai.assert(!m.builtin === !builtin, `${m.builtin}`)
      chai.assert(!m.before === !before, `${m.before}`)
    }
    test('function ( builtin, before ) ...', true, true)
    test('function ( builtin, after ) ...', true, false)
    test('function ( before, after ) ...', false, true)
    test('function ( after ) ...', false, false)
  })
  it ('Data: basic', function () {
    chai.assert(eYo.Data, 'NOT YET IMPLEMENTED')
  })
  it ('eYo.C9r.Model.dataHandler: #', function () {
    let test = (model, n) => {
      eYo.C9r.Model.dataHandler({
        foo: model
      }, 'foo')
      var methods = model['.methods']
      chai.assert(methods.length === n)
    }
    test({}, 0)
    test({willChange () {}}, 1)
    test({didChange () {}}, 1)
    test({isChanging () {}}, 1)
    test({validate () {}}, 1)
    test({synchronize () {}}, 1)
    test({willChange () {}, didChange () {}}, 2)
  })
  it ('eYo.C9r.Model.dataHandler: object', function () {
    var flag
    let test = (f, n) => {
      flag = 0
      let model = {
        foo: {
          willChange: f
        }
      }
      eYo.C9r.Model.dataHandler(model, 'foo')
      var O = {}
      model.foo['.methods'].forEach(f => {
        f(O)
      })
      O.willChange(123, 421)
      chai.assert(flag === n)
    }
    test(function () {flag = 123}, 123)
    test(function (after) {flag = after}, 421)
    test(function (before, after) {
      flag = 1000 * before + after}, 123421)
  })
})

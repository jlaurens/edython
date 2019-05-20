var assert = chai.assert
var expect = chai.expect

describe('parameter_list', function() {
  it(`f(a[:…][=…])`, function() {
    var l = eYo.Test.new_brick(eYo.T3.Expr.lambda)
    var d = l.eyo.parameters_b
    var a = eYo.Test.new_brick('a')
    assert(d.lastInput.eyo.connect(a), 'MISSING 1')
    assert(d.inputList.length === 3, 'MISSED 2')
    var f = v => {
      a.eyo.variant_p = v
      var u = l.eyo.parameters_s.unwrappedTarget
      assert(u.target_p === 'a', `MISSED: ${v}`)
    }
    ;[eYo.Key.NONE,
      eYo.Key.VALUED,
      eYo.Key.ANNOTATED,
      eYo.Key.ANNOTATED_VALUED,
      eYo.Key.NONE].forEach(v => {
        f(v)
      })
    l.dispose()
    /*
    parameter_list          ::=  defparameter ("," defparameter)* ["," [parameter_list_starargs]]
                             | parameter_list_starargs
      parameter_list_starargs ::=  "*" [parameter] ("," defparameter)* ["," ["**" parameter [","]]]
                                  | "**" parameter [","]
      parameter               ::=  identifier [":" expression]
      defparameter            ::=  parameter ["=" expression]*/

  })
  ;[eYo.Key.NONE,
    eYo.Key.VALUED,
    eYo.Key.ANNOTATED,
    eYo.Key.ANNOTATED_VALUED,
    eYo.Key.NONE].forEach(v1 => {[
      eYo.Key.NONE,
      eYo.Key.VALUED,
      eYo.Key.ANNOTATED,
      eYo.Key.ANNOTATED_VALUED,
      eYo.Key.NONE
    ].forEach(v2 => {
      [eYo.Key.NONE,
        eYo.Key.VALUED,
        eYo.Key.ANNOTATED,
        eYo.Key.ANNOTATED_VALUED,
        eYo.Key.NONE].forEach(v3 => {
          var parameter = v => {
            return {
              [eYo.Key.NONE]: '',
              [eYo.Key.VALUED]: '=…',
              [eYo.Key.ANNOTATED]: ':…',
              [eYo.Key.ANNOTATED_VALUED]: ':…=…',
            }[v]
          }
          it (`f(a${parameter(v1)}, d${parameter(v2)}, c${parameter(v3)})`, function () {
            var b3k = eYo.Test.new_brick(eYo.T3.Expr.lambda)
            var t = b3k.parameters_b
            var a = eYo.Test.new_brick('a')
            assert(t.lastInput.connect(a), 'MISSING 1')
            a.variant_p = v1
            var d = eYo.Test.new_brick('d')
            assert(t.lastInput.connect(d), 'MISSING 2')
            d.variant_p = v2
            var c = eYo.Test.new_brick('c')
            assert(this._runnable.lastInput.connect(c), 'MISSING 3')
            c.variant_p = v3
            assert(t.inputList.length === 7, 'MISSED 1')
            var f = (n, i) => {
              var u = b3k.parameters_b.inputList[i].magnet.targetBrick
              assert(u.target_p === n, `MISSED: ${n} at ${i}`)
            }
            f('a', 1)
            f('d', 3)
            f('c', 5)
            b3k.dispose()
          })
        })
      })
    })
  })


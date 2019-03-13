var assert = chai.assert
var expect = chai.expect

describe('parameter_list', function() {
  it(`f(a[:…][=…])`, function() {
    var l = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.lambda)
    var t = l.eyo.parameters_t
    var c8n = t.eyo.lastInput.connection
    var a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a')
    assert(t.eyo.lastInput.eyo.connect(a), 'MISSING 1')
    assert(t.inputList.length === 3, 'MISSED 2')
    var f = v => {
      a.eyo.variant_p = v
      var u = l.eyo.parameters_s.unwrappedTarget
      assert(u.name_p === 'a', `MISSED: ${v}`)
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
    eYo.Key.NONE].forEach(v1 => {
      [eYo.Key.NONE,
        eYo.Key.VALUED,
        eYo.Key.ANNOTATED,
        eYo.Key.ANNOTATED_VALUED,
        eYo.Key.NONE].forEach(v2 => {
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
              it (`f(a${parameter(v1)}, b${parameter(v2)}, c${parameter(v3)})`, function () {
                var l = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.lambda)
                var t = l.eyo.parameters_t
                var a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a')
                assert(t.eyo.lastInput.eyo.connect(a), 'MISSING 1')
                a.eyo.variant_p = v1
                var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'b')
                assert(t.eyo.lastInput.eyo.connect(b), 'MISSING 2')
                b.eyo.variant_p = v2
                var c = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'c')
                assert(t.eyo.lastInput.eyo.connect(c), 'MISSING 3')
                c.eyo.variant_p = v3
                assert(t.inputList.length === 7, 'MISSED 1')
                var f = (n, i) => {
                  var u = l.eyo.parameters_t.inputList[i].connection.eyo.t_eyo
                  assert(u.name_p === n, `MISSED: ${n} at ${i}`)
                }
                f('a', 1)
                f('b', 3)
                f('c', 5)
                l.dispose()
              })
            })
        })
    })
  })


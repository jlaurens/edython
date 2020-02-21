describe('Lambda', function() {
  var assert = chai.assert
  var expect = chai.expect

  describe('parameter_list', function() {
    it(`f(a[:…][=…])`, function() {
      var b3k = eYo.test.new_brick(eYo.t3.expr.lambda)
      var d = b3k.parameters_b
      var a = eYo.test.new_brick('a')
      assert(d.lastSlot.connect(a), 'MISSING 1')
      assert(d.slots.length === 3, 'MISSED 2')
      var f = v => {
        a.Variant_p = v
        var u = b3k.parameters_s.unwrappedTarget
        assert(u.Target_p === 'a', `MISSED: ${v}`)
      }
      ;[eYo.key.NONE,
        eYo.key.VALUED,
        eYo.key.ANNOTATED,
        eYo.key.ANNOTATED_VALUED,
        eYo.key.NONE].forEach(v => {
          f(v)
        })
      b3k.dispose()
      /*
      parameter_list          ::=  defparameter ("," defparameter)* ["," [parameter_list_starargs]]
                              | parameter_list_starargs
        parameter_list_starargs ::=  "*" [parameter] ("," defparameter)* ["," ["**" parameter [","]]]
                                    | "**" parameter [","]
        parameter               ::=  identifier [":" expression]
        defparameter            ::=  parameter ["=" expression]*/

    })
    ;[eYo.key.NONE,
      eYo.key.VALUED,
      eYo.key.ANNOTATED,
      eYo.key.ANNOTATED_VALUED,
      eYo.key.NONE].forEach(v1 => {[
        eYo.key.NONE,
        eYo.key.VALUED,
        eYo.key.ANNOTATED,
        eYo.key.ANNOTATED_VALUED,
        eYo.key.NONE
      ].forEach(v2 => {
        [eYo.key.NONE,
          eYo.key.VALUED,
          eYo.key.ANNOTATED,
          eYo.key.ANNOTATED_VALUED,
          eYo.key.NONE].forEach(v3 => {
            var parameter = v => {
              return {
                [eYo.key.NONE]: '',
                [eYo.key.VALUED]: '=…',
                [eYo.key.ANNOTATED]: ':…',
                [eYo.key.ANNOTATED_VALUED]: ':…=…',
              }[v]
            }
            it (`f(a${parameter(v1)}, d${parameter(v2)}, c${parameter(v3)})`, function () {
              var b3k = eYo.test.new_brick(eYo.t3.expr.lambda)
              var t = b3k.parameters_b
              var a = eYo.test.new_brick('a')
              assert(t.lastSlot.connect(a), 'MISSING 1')
              a.Variant_p = v1
              var d = eYo.test.new_brick('d')
              assert(t.lastSlot.connect(d), 'MISSING 2')
              d.Variant_p = v2
              var c = eYo.test.new_brick('c')
              assert(this._runnable.lastSlot.connect(c), 'MISSING 3')
              c.Variant_p = v3
              assert(t.slots.length === 7, 'MISSED 1')
              var f = (n, i) => {
                var u = b3k.parameters_b.slotList_[i].targetBrick
                assert(u.Target_p === n, `MISSED: ${n} at ${i}`)
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
})


var assert = chai.assert

describe('parameter_list', function() {
  it(`Basic`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.lambda)
    var t = b.eyo.parameters_t
    var a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a')
    assert(t.eyo.lastInput.eyo.connect(a), 'MISSING 1')
    assert(t.inputList.length === 3, 'MISSED 2')
    a.eyo.variant_p = eYo.Key.DEFINED
    var u = b.eyo.parameters_s.unwrappedTarget
    assert(u.name_p === 'a', 'MISSED 3')
    a.eyo.variant_p = eYo.Key.ANNOTATED
    u = b.eyo.parameters_s.unwrappedTarget
    assert(u.name_p === 'a', 'MISSED 4')
    a.eyo.variant_p = eYo.Key.ANNOTATED_DEFINED
    u = b.eyo.parameters_s.unwrappedTarget
    assert(u.name_p === 'a', 'MISSED 5')
    
    /*
    parameter_list          ::=  defparameter ("," defparameter)* ["," [parameter_list_starargs]]
                             | parameter_list_starargs
      parameter_list_starargs ::=  "*" [parameter] ("," defparameter)* ["," ["**" parameter [","]]]
                                  | "**" parameter [","]
      parameter               ::=  identifier [":" expression]
      defparameter            ::=  parameter ["=" expression]*/

  })
})


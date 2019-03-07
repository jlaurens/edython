var assert = chai.assert
var expect = chai.expect

describe('Primary', function() {
  it('types', function() {
    var ctor = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier).constructor
    var f = (k1, k2) => {
      var t1 = eYo.T3.Expr[k1]
      assert(t1, `UNKNOWN ${k1}`)
      var t2 = eYo.T3.Expr[k2 || k1]
      assert(t2, `UNKNOWN ${k2}`)
      var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, t1)
      assert(b, `MISSING ${t1}`)
      assert(b.constructor === ctor, `MISSED CTOR ${b.constructor.key}`)
      assert(b.type === t2, `MISSED TYPE ${b.type} === ${t2}`)
      b.dispose(true)
    }
    f('identifier')
    f('identifier_annotated')
    f('key_datum', 'identifier_annotated')
    f('identifier_defined')
    f('keyword_item', 'identifier_defined')
    f('identifier_annotated_defined')
    f('attributeref', 'parent_module')
    f('named_attributeref')
    f('dotted_name', 'parent_module')
    f('parent_module')
    f('identifier_as')
    f('dotted_name_as', 'identifier_as')
    f('expression_as', 'identifier_as')
    f('subscription', 'named_slicing')
    f('named_subscription')
    f('slicing', 'named_slicing')
    f('named_slicing')
    f('call_expr', 'named_call_expr')
    f('named_call_expr')
    f('assignment_expr', 'identifier_defined')
  })
})

describe('Primary(Assignment)', function() {
  it('basic', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    assert(b.type === eYo.T3.Expr.identifier_defined, `MISSED TYPE ${b.type} === ${eYo.T3.Expr.identifier_defined}`)
    // targets is a promise
    assert(!b.eyo.targets_t, 'UNEXPECTED TARGETS')
    b.eyo.variant_p = eYo.Key.TARGETS
    assert(b.type === eYo.T3.Expr.assignment_expr, `MISSED TYPE ${b.type} === ${eYo.T3.Expr.identifier_defined}`)
    var t = b.eyo.targets_t
    assert(t, 'MISSING TARGETS')
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a')
    t.eyo.lastInput.eyo.connect(bb)
    b.dispose(true)
  })
})

var assert = chai.assert

describe('Enclosure', function() {
  it(`Enclosure: '()'`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.enclosure)
    assert(b, `MISSING enclosure`)
    assert(b.eyo.variant_p === eYo.Key.PAR, `MISSING ${b.eyo.variant_p} === ${eYo.Key.PAR}`)
    assert(b.type === eYo.T3.Expr.parenth_form, `MISSING ${b.type} === ${eYo.T3.Expr.parenth_form}`)
    // can I connection a comprehension block ?
    var bb1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.list_comprehension)
    var input = b.inputList[0]
    assert(input.eyo.connect(bb1), 'MISSING connection')
    // this is a unique object:
    assert(b.inputList.length === 1, `MISSED Unique 1 ${b.inputList.length}`)
    var bb2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.yield_expression)
    assert(input.eyo.connect(bb2), 'MISSING connection')
    assert(b.inputList.length === 1, `MISSED Unique 2 ${b.inputList.length}`)
    bb1.dispose()
    var bb3 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 421)
    assert(input.eyo.connect(bb3), 'MISSING connection')
    assert(b.inputList.length === 3, `MISSED NON Unique ${b.inputList.length}`)
    assert(input.eyo.connect(bb2), 'MISSING connection')
    assert(b.inputList.length === 1, `MISSED Unique 3 ${b.inputList.length}`)
    assert(input.eyo.connect(bb3), 'MISSING connection')
    assert(b.inputList.length === 3, `MISSED NON Unique ${b.inputList.length}`)
    assert(!b.inputList[0].eyo.connect(bb2), 'UNEXPECTED connection')
    assert(!b.inputList[2].eyo.connect(bb2), 'UNEXPECTED connection')

    bb1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 124)
    assert(b.inputList[2].eyo.connect(bb1), 'MISSING connection')
    bb1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 241)
    assert(b.inputList[0].eyo.connect(bb1), 'MISSING connection')
  })
  // it(`Enclosure: '[]'`, function() {
  //   var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.enclosure)
  //   assert(b, `MISSING enclosure`)
  //   b.eyo.variant_p = eYo.Key.SQB
  //   assert(b.eyo.variant_p === eYo.Key.SQB, `MISSING ${b.eyo.variant_p} === ${eYo.Key.SQB}`)
  //   assert(b.type === eYo.T3.Expr.list_display, `MISSING ${b.type} === ${eYo.T3.Expr.list_display}`)
  // })
  // it(`Enclosure: '{}'`, function() {
  //   var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.enclosure)
  //   assert(b, `MISSING enclosure`)
  //   b.eyo.variant_p = eYo.Key.BRACE
  //   assert(b.eyo.variant_p === eYo.Key.BRACE, `MISSING ${b.eyo.variant_p} === ${eYo.Key.BRACE}`)
  //   assert(b.type === eYo.T3.Expr.dict_display, `MISSING ${b.type} === ${eYo.T3.Expr.list_display}`)
  // })
})

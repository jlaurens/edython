var assert = chai.assert

describe('Enclosure', function() {
  it(`Enclosure: prepare`, function() {
    assert(eYo.Key.PAR !== undefined, `MISSING eYo.Key.PAR`)
    assert(eYo.Key.SQB !== undefined, `MISSING eYo.Key.SQB`)
    assert(eYo.Key.BRACE !== undefined, `MISSING eYo.Key.BRACE`)
  })
  it(`Enclosure: '()'`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.parenth_form)
    assert(b, `MISSING enclosure`)
    assert(b.eyo.variant_p === eYo.Key.PAR, `MISSING ${b.eyo.variant_p} === ${eYo.Key.PAR}`)
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.enclosure)
    assert(b, `MISSING enclosure`)
    assert(b.eyo.variant_p === eYo.Key.PAR, `MISSING ${b.eyo.variant_p} === ${eYo.Key.PAR}`)
    assert(b.type === eYo.T3.Expr.parenth_form, `MISSING ${b.type} === ${eYo.T3.Expr.parenth_form}`)
    // can I connection a comprehension block ?
    var bb1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.comprehension)
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
  it(`Enclosure: '[]'`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.list_display)
    assert(b, `MISSING enclosure`)
    assert(b.eyo.variant_p === eYo.Key.SQB, `MISSING ${b.eyo.variant_p} === ${eYo.Key.SQB}`)
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.enclosure)
    assert(b, `MISSING enclosure`)
    b.eyo.variant_p = eYo.Key.SQB
    assert(b.eyo.variant_p === eYo.Key.SQB, `MISSING ${b.eyo.variant_p} === ${eYo.Key.SQB}`)
    assert(b.type === eYo.T3.Expr.list_display, `MISSING ${b.type} === ${eYo.T3.Expr.list_display}`)
  })
  it(`Enclosure: '{}'`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.set_display)
    assert(b, `MISSING enclosure`)
    assert(b.type === eYo.T3.Expr.one_dict_display, `MISSING ${b.type} === ${eYo.T3.Expr.one_dict_display}`)
    assert(b.eyo.variant_p === eYo.Key.BRACE, `MISSING ${b.eyo.variant_p} === ${eYo.Key.BRACE}`)
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.dict_display)
    assert(b, `MISSING enclosure`)
    assert(b.type === eYo.T3.Expr.one_dict_display, `MISSING ${b.type} === ${eYo.T3.Expr.one_dict_display}`)
    assert(b.eyo.variant_p === eYo.Key.BRACE, `MISSING ${b.eyo.variant_p} === ${eYo.Key.BRACE}`)
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.enclosure)
    assert(b, `MISSING enclosure`)
    b.eyo.variant_p = eYo.Key.BRACE
    assert(b.eyo.variant_p === eYo.Key.BRACE, `MISSING ${b.eyo.variant_p} === ${eYo.Key.BRACE}`)
    assert(b.type === eYo.T3.Expr.one_dict_display, `MISSING ${b.type} === ${eYo.T3.Expr.one_dict_display}`)
    var bb1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.comprehension)
    var input = b.inputList[0]
    assert(input.eyo.connect(bb1), 'MISSING connection')
    assert(b.type === eYo.T3.Expr.set_display, `MISSING ${b.type} === ${eYo.T3.Expr.set_display}`)
    // this is a unique object:
    assert(b.inputList.length === 1, `MISSED Unique 1 ${b.inputList.length}`)
    var bb2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.dict_comprehension)
    assert(bb2.type === eYo.T3.Expr.comprehension, `MISSING ${bb2.type} === ${eYo.T3.Expr.comprehension}`)
    assert(input.eyo.connect(bb2), 'MISSING connection')
    assert(b.inputList.length === 1, `MISSED Unique 2 ${b.inputList.length}`)
    assert(b.type === eYo.T3.Expr.set_display, `MISSING ${b.type} === ${eYo.T3.Expr.dict_display}`)
  })
  it(`Enclosure: '() -> [] -> () -> {} -> ()'`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.parenth_form)
    assert(b, `MISSING enclosure`)
    assert(b.eyo.variant_p === eYo.Key.PAR, `MISSING ${b.eyo.variant_p} === ${eYo.Key.PAR}`)
    var bb1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.comprehension)
    var input = b.inputList[0]
    assert(input.eyo.connect(bb1), 'MISSING connection')
    b.eyo.variant_p === eYo.Key.SQB
    assert(input.eyo.target === bb1, 'LOST CONNECTION')
    b.eyo.variant_p === eYo.Key.BRACE
    assert(input.eyo.target === bb1, 'LOST CONNECTION')
    b.eyo.variant_p === eYo.Key.PAR
    assert(input.eyo.target === bb1, 'LOST CONNECTION')
    b.eyo.variant_p === eYo.Key.BRACE
    assert(input.eyo.target === bb1, 'LOST CONNECTION')
    b.eyo.variant_p === eYo.Key.SQB
    assert(input.eyo.target === bb1, 'LOST CONNECTION')
    b.eyo.variant_p === eYo.Key.PAR
    assert(input.eyo.target === bb1, 'LOST CONNECTION')
  })
  it(`Enclosure: '() -> {}'`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.parenth_form)
    assert(b, `MISSING enclosure`)
    assert(b.eyo.variant_p === eYo.Key.PAR, `MISSING ${b.eyo.variant_p} === ${eYo.Key.PAR}`)
    var bb1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 421)
    var input = b.inputList[0]
    assert(input.eyo.connect(bb1), 'MISSING connection')
    b.eyo.variant_p === eYo.Key.BRACE
    assert(input.eyo.target === bb1, 'LOST CONNECTION')
  })
})

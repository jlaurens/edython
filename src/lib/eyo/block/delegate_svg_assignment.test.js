var assert = chai.assert

var g = eYo.GMR._PyParser_Grammar

console.log('RUNNING NODE/BLOCK TESTS')

describe('Assignment', function() {
  it('Chain', function() {
    var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.assignment_stmt)
    assert(b1, `MISSING assignment statement`)
    assert(b1.type === eYo.T3.Stmt.assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.assignment_stmt}`)
    assert(b1.eyo.variant_p === eYo.Key.NAME_DEFINED, `MISSED ${b1.eyo.variant_p} === ${eYo.Key.NAME_DEFINED}`)
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.assignment_chain)
    assert(b2, `MISSING assignment expression`)
    var input = b1.eyo.value_t.eyo.lastInput
    b1.eyo.value_t.eyo.lastConnect(b2)
    assert(input.connection.targetBlock() === b2, 'MISSED CONNECTION 1')
    b1.dispose()
  })
  it ('Annotated defined', function () {
    var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.annotated_assignment_stmt)
    assert(b1, `MISSING BLOCK ${eYo.T3.Stmt.annotated_assignment_stmt}`)
    var dom = eYo.Xml.blockToDom(b1)
    // console.error(dom)
    b1.dispose()
    b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    assert(b1, `MISSING BLOCK ${dom}`)
    assert(b1.type === eYo.T3.Stmt.annotated_assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.annotated_assignment_stmt}`)
    dom = eYo.Xml.blockToDom(b1)
    b1.dispose()
  })
  it ('Annotated alone', function () {
    var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.annotated_assignment_stmt)
    assert(b1, `MISSING BLOCK ${eYo.T3.Stmt.annotated_assignment_stmt}`)
    assert(b1.type === eYo.T3.Stmt.annotated_assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.annotated_assignment_stmt}`)
    b1.eyo.variant_p = eYo.Key.ANNOTATED
    assert(b1.type === eYo.T3.Stmt.annotated_assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.annotated_assignment_stmt}`)    
    var dom = eYo.Xml.blockToDom(b1)
    // console.error(dom)
    b1.dispose()
    b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    assert(b1, `MISSING BLOCK ${dom}`)
    assert(b1.type === eYo.T3.Stmt.annotated_assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.annotated_assignment_stmt}`)
    assert(b1.eyo.value_s.isIncog(), 'UNEXPECTED SLOT')
    b1.dispose()
  })
  it ('identifier_annotated in name', function () {
    var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.assignment_stmt)
    assert(b1, `MISSING BLOCK ${eYo.T3.Stmt.assignment_stmt}`)
    assert(b1.type === eYo.T3.Stmt.assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.assignment_stmt}`)
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_annotated)
    b1.eyo.name_s.connect(b2)
    assert(b1.eyo.name_t === b2, `MISSED connection`)
    assert(b1.type === eYo.T3.Stmt.annotated_assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.annotated_assignment_stmt}`)
    var dom = eYo.Xml.blockToDom(b1)
    // console.error(dom)
    b1.dispose()
    b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    assert(b1, `MISSING BLOCK ${dom}`)
    assert(b1.type === eYo.T3.Stmt.annotated_assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.annotated_assignment_stmt}`)
    assert(!b1.eyo.value_s.isIncog(), 'MISSING SLOT')

    b1.dispose()
  })
})

var assert = chai.assert
var expect = chai.expect

var g = eYo.GMR._PyParser_Grammar

console.log('RUNNING NODE/BLOCK TESTS')

var assert_incog = (b, target, annotation, value, comment) => {
  assert(b.eyo.target_s.isIncog() === !!target, 'MISSING TARGET INCOG')
  assert(b.eyo.annotation_s.isIncog() === !!annotation, 'MISSING ANNOTATION INCOG')
  assert(b.eyo.value_s.isIncog() === !!value, 'MISSING VALUE INCOG')
  assert(b.eyo.comment_s.isIncog() === !!comment, 'UNEXPECTED COMMENT INCOG')
}

var assert_type = (b, t, str) => {
  assert(b.type === eYo.T3.Stmt[t], `MISSED ${str || ''} ${b.type} === ${eYo.T3.Stmt[t]}`)
}

var assert_variant = (b, variant, str) => {
  assert(b.eyo.variant_p === variant, `MISSED VARIANT ${str || ''} ${b.eyo.variant_p} === ${variant}`)
}

var assert_comment_variant = (b, comment_variant, str) => {
  assert(b.eyo.comment_variant_p === comment_variant, `MISSED COMMENT VARIANT ${str || ''} ${b.eyo.comment_variant_p} === ${comment_variant}`)
}

describe('Assignment', function() {
  var f = (t, target, annotation, value, comment, variant, comment_variant) => {
    it(t, function() {
      var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt[t])
      assert(b1, `MISSING ${t}`)
      assert(b1.eyo.constructor.eyo.key === 'assignment_stmt', `MISSED KEY ${b1.eyo.constructor.eyo.key}`)
      assert_type(b1, t)
      assert_variant(b1, variant)
      assert_comment_variant(b1, comment_variant)
      assert_incog(b1, target, annotation, value, comment)
      b1.dispose()
    })  
  }
  f('expression_stmt', true, true, true, false, eYo.Key.NONE, eYo.Key.COMMENT)
  f('assignment_stmt', false, true, false, true, eYo.Key.TARGET_VALUED, eYo.Key.NONE)
  f('augmented_assignment_stmt', false, true, false, true, eYo.Key.TARGET_VALUED, eYo.Key.NONE)
  f('annotated_stmt', false, false, true, true, eYo.Key.ANNOTATED, eYo.Key.NONE)
  f('annotated_assignment_stmt', false, false, false, true, eYo.Key.ANNOTATED_VALUED, eYo.Key.NONE)
  it('comment variant change', function() {
    var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.expression_stmt)
    assert(b1, `MISSING ${eYo.T3.Stmt.expression_stmt}`)
    assert(b1.eyo.constructor.eyo.key === 'assignment_stmt', `MISSED KEY ${b1.eyo.constructor.eyo.key}`)
    assert(b1.type === eYo.T3.Stmt.expression_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.expression_stmt}`)
    assert_variant(b1, eYo.Key.NONE, '1')
    assert_comment_variant(b1, eYo.Key.COMMENT, '1')
    assert_incog(b1, true, true, true, false)
    b1.eyo.comment_variant_p = eYo.Key.NONE
    assert_comment_variant(b1, eYo.Key.NONE, '2')
    assert_variant(b1, eYo.Key.TARGET, '2')
    assert_incog(b1, false, true, true, true)
    b1.eyo.variant_p = eYo.Key.NONE
    assert_variant(b1, eYo.Key.NONE, '3')
    assert_comment_variant(b1, eYo.Key.COMMENT, '3')
    assert_incog(b1, true, true, true, false)
    b1.dispose()
  })  
  it('variant change', function() {
    var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.expression_stmt)
    assert(b1, `MISSING ${eYo.T3.Stmt.expression_stmt}`)
    assert(b1.eyo.constructor.eyo.key === 'assignment_stmt', `MISSED KEY ${b1.eyo.constructor.eyo.key}`)
    assert(b1.type === eYo.T3.Stmt.expression_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.expression_stmt}`)
    assert_variant(b1, eYo.Key.NONE, '1')
    assert_comment_variant(b1, eYo.Key.COMMENT, '1')
    assert_incog(b1, true, true, true, false)
    b1.eyo.comment_variant_p = eYo.Key.NONE
    assert_comment_variant(b1, eYo.Key.NONE, '2')
    assert_variant(b1, eYo.Key.TARGET, '2')
    assert_incog(b1, false, true, true, true)
    var f = (v, target, annotation, value, comment, str) => {
      b1.eyo.variant_p = eYo.Key[v]
      assert_variant(b1, eYo.Key[v], str)
      assert_incog(b1, target, annotation, value, comment)
    }
    f('TARGET', false, true, true, true, 4)
    f('TARGET_VALUED', false, true, false, true, 4)
    f('ANNOTATED', false, false, true, true, 4)
    f('ANNOTATED_VALUED', false, false, false, true, 4)
    b1.dispose()
  })  

  // it('Expression only', function() {
  //   var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.assignment_stmt)
  //   assert(b1, `MISSING assignment statement`)
  //   assert(b1.type === eYo.T3.Stmt.assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.assignment_stmt}`)
  //   assert(b1.eyo.variant_p === eYo.Key.TARGET_VALUED, `MISSED ${b1.eyo.variant_p} === ${eYo.Key.TARGET_VALUED}`)
  //   var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.assignment_chain)
  //   assert(b2, `MISSING assignment expression`)
  //   var input = b1.eyo.value_t.eyo.lastInput
  //   b1.eyo.value_t.eyo.lastConnect(b2)
  //   assert(input.connection.targetBlock() === b2, 'MISSED CONNECTION 1')
  //   b1.dispose()
  // })
  // it('Chain', function() {
  //   var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.assignment_stmt)
  //   assert(b1, `MISSING assignment statement`)
  //   assert(b1.type === eYo.T3.Stmt.assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.assignment_stmt}`)
  //   assert(b1.eyo.variant_p === eYo.Key.TARGET_VALUED, `MISSED ${b1.eyo.variant_p} === ${eYo.Key.TARGET_VALUED}`)
  //   var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.assignment_chain)
  //   assert(b2, `MISSING assignment expression`)
  //   var input = b1.eyo.value_t.eyo.lastInput
  //   b1.eyo.value_t.eyo.lastConnect(b2)
  //   assert(input.connection.targetBlock() === b2, 'MISSED CONNECTION 1')
  //   b1.dispose()
  // })
  // it ('Annotated defined', function () {
  //   var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.annotated_assignment_stmt)
  //   assert(b1, `MISSING BLOCK ${eYo.T3.Stmt.annotated_assignment_stmt}`)
  //   var dom = eYo.Xml.blockToDom(b1)
  //   // console.error(dom)
  //   b1.dispose()
  //   b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
  //   assert(b1, `MISSING BLOCK ${dom}`)
  //   assert(b1.type === eYo.T3.Stmt.annotated_assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.annotated_assignment_stmt}`)
  //   dom = eYo.Xml.blockToDom(b1)
  //   b1.dispose()
  // })
  // it ('Annotated alone', function () {
  //   var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.annotated_assignment_stmt)
  //   assert(b1, `MISSING BLOCK ${eYo.T3.Stmt.annotated_assignment_stmt}`)
  //   assert(b1.type === eYo.T3.Stmt.annotated_assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.annotated_assignment_stmt}`)
  //   b1.eyo.variant_p = eYo.Key.ANNOTATED
  //   assert(b1.type === eYo.T3.Stmt.annotated_assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.annotated_assignment_stmt}`)    
  //   var dom = eYo.Xml.blockToDom(b1)
  //   // console.error(dom)
  //   b1.dispose()
  //   b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
  //   assert(b1, `MISSING BLOCK ${dom}`)
  //   assert(b1.type === eYo.T3.Stmt.annotated_assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.annotated_assignment_stmt}`)
  //   assert(b1.eyo.value_s.isIncog(), 'UNEXPECTED SLOT')
  //   b1.dispose()
  // })
  // it ('identifier_annotated in name', function () {
  //   var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.assignment_stmt)
  //   assert(b1, `MISSING BLOCK ${eYo.T3.Stmt.assignment_stmt}`)
  //   assert(b1.type === eYo.T3.Stmt.assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.assignment_stmt}`)
  //   var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_annotated)
  //   b1.eyo.name_s.connect(b2)
  //   assert(b1.eyo.name_t === b2, `MISSED connection`)
  //   assert(b1.type === eYo.T3.Stmt.annotated_assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.annotated_assignment_stmt}`)
  //   var dom = eYo.Xml.blockToDom(b1)
  //   // console.error(dom)
  //   b1.dispose()
  //   b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
  //   assert(b1, `MISSING BLOCK ${dom}`)
  //   assert(b1.type === eYo.T3.Stmt.annotated_assignment_stmt, `MISSED ${b1.type} === ${eYo.T3.Stmt.annotated_assignment_stmt}`)
  //   assert(!b1.eyo.value_s.isIncog(), 'MISSING SLOT')

  //   b1.dispose()
  // })
})

describe('assignment_stmt', function() {
  it('target', function() {
    var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.assignment_stmt)
    assert(b1, `MISSING ${eYo.T3.Stmt.assignment_stmt}`)
    assert_type(b1, 'assignment_stmt',)
    assert(b1.eyo.constructor.eyo.key === 'assignment_stmt', `MISSED KEY ${b1.eyo.constructor.eyo.key}`)
    b1.eyo.comment_variant_p = eYo.Key.NONE
    b1.eyo.variant_p = eYo.Key.TARGET
    assert_variant(b1, eYo.Key.TARGET, '1')
    assert_incog(b1, false, true, true, true)
    // connect all the possible targets
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    b1.eyo.target_t.eyo.lastConnect(b2)
    assert(b1.eyo.target_t.inputList.length === 3, `MISSED C8N 1`)
    assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, `MISSED C8N 2`)
    var b3 =  eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, `<x eyo="a_expr" operator="+" xmlns="urn:edython:0.2" xmlns:eyo="urn:edython:0.2"><x eyo="identifier" name="abc" slot="lhs"></x><x eyo="identifier" name="bcd" slot="rhs"></x></x>`)
    assert(b3, `MISSING …+…`)
    expect(() => b1.eyo.target_t.eyo.lastConnect(b3)).to.throw('Connection checks failed.');
    assert(b1.eyo.target_t.inputList.length === 3, `MISSED C8N 3`)
    b3.dispose()

    // b1.eyo.variant_p = eYo.Key.TARGET
    // b1.eyo.target_p = 'abc'
    // assert(b1.eyo.target_p === 'abc', `MISSED ${b1.eyo.target_p} === 'abc'`)
    // assert(b1.eyo.target_t, 'MISSING TARGET')
    // var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'de')
    // b1.eyo.target_t.eyo.lastConnect(b2)
    // assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, 'MISSED CONNECTION')
    // assert(b1.eyo.target_t.inputList.length === 3, `BAD ${b1.eyo.target_t.inputList.length} === 3`)
    
    b1.dispose()
  })
})

describe('expression_stmt', function() {
  it('target', function() {
    var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.expression_stmt)
    assert(b1, `MISSING ${eYo.T3.Stmt.expression_stmt}`)
    assert(b1.eyo.constructor.eyo.key === 'assignment_stmt', `MISSED KEY ${b1.eyo.constructor.eyo.key}`)
    assert_type(b1, 'expression_stmt')
    assert(b1.eyo.operator_p === '', `MISSED ${b1.eyo.operator_p}`)
    b1.eyo.comment_variant_p = eYo.Key.NONE
    b1.eyo.variant_p = eYo.Key.TARGET
    assert_variant(b1, eYo.Key.TARGET, '1')
    assert_incog(b1, false, true, true, true)
    assert_type(b1, 'assignment_stmt')
    b1.eyo.target_p = 'abc'
    assert(b1.eyo.target_p === 'abc', `MISSED ${b1.eyo.target_p} === 'abc'`)
    assert(b1.eyo.target_t, 'MISSING TARGET')
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'de')
    assert(b1.eyo.target_t.inputList.length === 1, `BAD ${b1.eyo.target_t.inputList.length} === 1`)
    b1.eyo.target_t.eyo.lastConnect(b2)
    assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, 'MISSED CONNECTION')
    assert(b1.eyo.target_t.inputList.length === 3, `BAD ${b1.eyo.target_t.inputList.length} === 3`)
    
    // b1.dispose()
  })
})

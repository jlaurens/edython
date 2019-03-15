var assert = chai.assert
var expect = chai.expect

var g = eYo.GMR._PyParser_Grammar

console.log('RUNNING NODE/BLOCK TESTS')

var assert_incog = (b, target, annotation, value, comment) => {
  assert(b.eyo.target_s.isIncog() === !!target, 'MISSING TARGET INCOG')
  assert(b.eyo.annotated_s.isIncog() === !!annotation, 'MISSING ANNOTATION INCOG')
  assert(b.eyo.value_s.isIncog() === !!value, 'MISSING VALUE INCOG')
  assert(b.eyo.comment_s.isIncog() === !!comment, 'UNEXPECTED COMMENT INCOG')
}

var assert_type = (b, t, str) => {
  assert(b.type === (eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t), `MISSED ${str || ''} ${b.type} === ${eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t}`)
}

var new_block = (t, str) => {
  t = eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t
  var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, t)
  assert(b, `MISSING BLOCK TYPE ${t}`)
  assert_type(b, t, str)
  return b
}

var assert_block = (b, t, str) => {
  assert(b, `MISSING BLOCK TYPE ${eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t}`)
  assert_type(b, t, str)
}

var assert_variant = (b, variant, str) => {
  assert(b.eyo.variant_p === eYo.Key[variant] || variant, `MISSED VARIANT ${str || ''} ${b.eyo.variant_p} === ${eYo.Key[variant] || variant}`)
}

var assert_comment_variant = (b, comment_variant, str) => {
  assert(b.eyo.comment_variant_p === eYo.Key[comment_variant] || comment_variant, `MISSED COMMENT VARIANT ${str || ''} ${b.eyo.comment_variant_p} === ${eYo.Key[comment_variant] || comment_variant}`)
}

var assert_code = (b, str) => {
  assert(b.eyo.toLinearString === str, `MISSED: ${b.eyo.toLinearString} === ${str}`)
}

var assert_ctor = (b, k) => {
  assert(b.eyo.constructor.eyo.key === k, `MISSED CTOR KEY ${b.eyo.constructor.eyo.key} === ${k}`)

}

var assert_input_length = (t, k, str) => {
  assert(t.inputList.length === k, `BAD INPUT LENGTH ${str} ${t.inputList.length} === ${k}`)

}

describe('Each assignment block type', function() {
  ['expression_stmt',
    'assignment_stmt',
    'annotated_stmt',
    'annotated_assignment_stmt',
    'augmented_assignment_stmt'
  ].forEach(t => {
    it (`basic type: ${t}`, function () {
      var b = new_block(t)
      assert_ctor(b, 'assignment_stmt')
      b.dispose()
    })
  })
})

describe('Assignment', function() {
  var f = (t, target, annotation, value, comment, variant, comment_variant) => {
    it(t, function() {
      var b = new_block(t)
      assert_ctor(b, 'assignment_stmt')
      assert_type(b, t)
      assert_variant(b, variant)
      assert_comment_variant(b, comment_variant)
      assert_incog(b, target, annotation, value, comment)
      b.dispose()
    })  
  }
  f('expression_stmt', true, true, true, false, eYo.Key.VALUED, eYo.Key.COMMENT)
  f('assignment_stmt', false, true, false, true, eYo.Key.TARGET_VALUED, eYo.Key.NONE)
  f('augmented_assignment_stmt', false, true, false, true, eYo.Key.TARGET_VALUED, eYo.Key.NONE)
  f('annotated_stmt', false, false, true, true, eYo.Key.ANNOTATED, eYo.Key.NONE)
  f('annotated_assignment_stmt', false, false, false, true, eYo.Key.ANNOTATED_VALUED, eYo.Key.NONE)
  it('comment variant change', function() {
    var b1 = new_block('expression_stmt')
    assert_ctor(b1, 'assignment_stmt')
    assert_variant(b1, 'NONE', '1')
    assert_comment_variant(b1, 'COMMENT', '1')
    assert_incog(b1, true, true, true, false)
    b1.eyo.comment_variant_p = eYo.Key.NONE
    assert_comment_variant(b1, 'NONE', '2')
    assert_variant(b1, 'TARGET', '2')
    assert_incog(b1, false, true, true, true)
    b1.eyo.variant_p = eYo.Key.NONE
    assert_variant(b1, 'NONE', '3')
    assert_comment_variant(b1, 'COMMENT', '3')
    assert_incog(b1, true, true, true, false)
    b1.dispose()
  })  
  it('variant change', function() {
    var b1 = new_block('expression_stmt')
    assert_ctor(b1, 'assignment_stmt')
    assert_type(b1, 'expression_stmt')
    assert_variant(b1, 'NONE', '1')
    assert_comment_variant(b1, 'COMMENT', '1')
    assert_incog(b1, true, true, true, false)
    b1.eyo.comment_variant_p = eYo.Key.NONE
    assert_comment_variant(b1, 'NONE', '2')
    assert_variant(b1, 'TARGET', '2')
    assert_incog(b1, false, true, true, true)
    var f = (v, target, annotation, value, comment, str) => {
      b1.eyo.variant_p = eYo.Key[v]
      assert_variant(b1, v, str)
      assert_incog(b1, target, annotation, value, comment)
    }
    f('TARGET', false, true, true, true, 4)
    f('TARGET_VALUED', false, true, false, true, 4)
    f('ANNOTATED', false, false, true, true, 4)
    f('ANNOTATED_VALUED', false, false, false, true, 4)
    b1.dispose()
  })  

  it('Expression only', function() {
    var b1 = new_block('assignment_stmt')
    assert_variant(b1, 'TARGET_VALUED')
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.assignment_chain)
    assert_block(b2, 'identifier_valued')
    var input = b1.eyo.value_t.eyo.lastInput
    assert(b1.eyo.value_t.eyo.lastConnect(b2), 'MISSED C8N 1')
    assert(input.connection.targetBlock() === b2, 'MISSED C8N 2')
    b1.dispose()
  })
  it('connect an identifier_valued', function() {
    var b1 = new_block('assignment_stmt')
    assert_variant(b1, 'TARGET_VALUED')
    var b2 = new_block('identifier_valued')
    b2.eyotarget_p = 'NOM'
    b2.eyo.value_p = 'EXPR'
    var input = b1.eyo.value_t.eyo.lastInput
    assert(b1.eyo.value_t.eyo.lastConnect(b2), 'MISSED C8N 1')
    assert(input.connection.targetBlock() === b2, 'MISSED C8N 2')
    b1.dispose()
  })
  it ('Annotated defined and dom', function () {
    var b1 = new_block('annotated_assignment_stmt')
    var dom = eYo.Xml.blockToDom(b1)
    // console.error(dom)
    b1.dispose()
    b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    assert_block(b1, 'annotated_assignment_stmt', `dom: ${dom}`)
    b1.dispose()
  })
  it ('Annotated alone', function () {
    var b1 = new_block('annotated_stmt')
    assert_variant(b1, 'ANNOTATED')    
    dom = eYo.Xml.blockToDom(b1)
    console.error(dom)
    b1.dispose()
    b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    assert_block(b1, 'annotated_stmt', 'dom')
    assert(b1.eyo.value_s.isIncog(), 'UNEXPECTED VALUE SLOT')
    b1.dispose()
  })
  it ('identifier_annotated in name', function () {
    var b1 = new_block('assignment_stmt')
    var b2 = new_block('identifier_annotated')
    assert(b1.eyo.target_t.eyo.lastConnect(b2), `MISSED C8N 1`)
    assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, `MISSED C8N 2`)
    assert_type(b1, 'annotated_assignment_stmt')
    assert_variant(b1, 'ANNOTATED_VALUED')
    var dom = eYo.Xml.blockToDom(b1)
    // console.error(dom)
    b1.dispose()
    b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    assert_block(b1, 'annotated_assignment_stmt', `dom: BLOCK ${dom}`)
    assert(!b1.eyo.value_s.isIncog(), 'MISSING SLOT')
    b1.dispose()
  })
})

describe('Copy/Paste', function() {
  var f = (t, target, annotation, value, comment, variant, comment_variant) => {
    it(t, function() {
      var b = new_block(t)
      assert_ctor(b, 'assignment_stmt')
      assert_type(b, t)
      assert_variant(b, variant)
      assert_comment_variant(b, comment_variant)
      assert_incog(b, target, annotation, value, comment)
      var dom = eYo.Xml.blockToDom(b)
      b.dispose()
      b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
      assert_ctor(b, 'assignment_stmt')
      assert_type(b, t)
      assert_variant(b, variant)
      assert_comment_variant(b, comment_variant)
      assert_incog(b, target, annotation, value, comment)
      b.dispose()
    })  
  }
  f('expression_stmt', true, true, true, false, eYo.Key.VALUED, eYo.Key.COMMENT)
  f('assignment_stmt', false, true, false, true, eYo.Key.TARGET_VALUED, eYo.Key.NONE)
  f('augmented_assignment_stmt', false, true, false, true, eYo.Key.TARGET_VALUED, eYo.Key.NONE)
  f('annotated_stmt', false, false, true, true, eYo.Key.ANNOTATED, eYo.Key.NONE)
  f('annotated_assignment_stmt', false, false, false, true, eYo.Key.ANNOTATED_VALUED, eYo.Key.NONE)
  it('comment variant change', function() {
    var b1 = new_block('expression_stmt')
    assert_ctor(b1, 'assignment_stmt')
    assert_variant(b1, 'NONE', '1')
    assert_comment_variant(b1, 'COMMENT', '1')
    assert_incog(b1, true, true, true, false)
    b1.eyo.comment_variant_p = eYo.Key.NONE
    assert_comment_variant(b1, 'NONE', '2')
    assert_variant(b1, 'TARGET', '2')
    assert_incog(b1, false, true, true, true)
    b1.eyo.variant_p = eYo.Key.NONE
    assert_variant(b1, 'NONE', '3')
    assert_comment_variant(b1, 'COMMENT', '3')
    assert_incog(b1, true, true, true, false)
    b1.dispose()
  })  
  it('variant change', function() {
    var b1 = new_block('expression_stmt')
    assert_ctor(b1, 'assignment_stmt')
    assert_type(b1, 'expression_stmt')
    assert_variant(b1, 'NONE', '1')
    assert_comment_variant(b1, 'COMMENT', '1')
    assert_incog(b1, true, true, true, false)
    b1.eyo.comment_variant_p = eYo.Key.NONE
    assert_comment_variant(b1, 'NONE', '2')
    assert_variant(b1, 'TARGET', '2')
    assert_incog(b1, false, true, true, true)
    var f = (v, target, annotation, value, comment, str) => {
      b1.eyo.variant_p = eYo.Key[v]
      assert_variant(b1, v, str)
      assert_incog(b1, target, annotation, value, comment)
    }
    f('TARGET', false, true, true, true, 4)
    f('TARGET_VALUED', false, true, false, true, 4)
    f('ANNOTATED', false, false, true, true, 4)
    f('ANNOTATED_VALUED', false, false, false, true, 4)
    b1.dispose()
  })  

  it('Expression only', function() {
    var b1 = new_block('assignment_stmt')
    assert_variant(b1, 'TARGET_VALUED')
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.assignment_chain)
    assert_block(b2, 'identifier_valued')
    var input = b1.eyo.value_t.eyo.lastInput
    assert(b1.eyo.value_t.eyo.lastConnect(b2), 'MISSED C8N 1')
    assert(input.connection.targetBlock() === b2, 'MISSED C8N 2')
    b1.dispose()
  })
  it('connect an identifier_valued', function() {
    var b1 = new_block('assignment_stmt')
    assert_variant(b1, 'TARGET_VALUED')
    var b2 = new_block('identifier_valued')
    b2.eyotarget_p = 'NOM'
    b2.eyo.value_p = 'EXPR'
    var input = b1.eyo.value_t.eyo.lastInput
    assert(b1.eyo.value_t.eyo.lastConnect(b2), 'MISSED C8N 1')
    assert(input.connection.targetBlock() === b2, 'MISSED C8N 2')
    b1.dispose()
  })
  it ('Annotated defined and dom', function () {
    var b1 = new_block('annotated_assignment_stmt')
    var dom = eYo.Xml.blockToDom(b1)
    // console.error(dom)
    b1.dispose()
    b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    assert_block(b1, 'annotated_assignment_stmt', `dom: ${dom}`)
    b1.dispose()
  })
  it ('Annotated alone', function () {
    var b1 = new_block('annotated_stmt')
    assert_variant(b1, 'ANNOTATED')    
    var dom = eYo.Xml.blockToDom(b1)
    // console.error(dom)
    b1.dispose()
    b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    assert_block(b1, 'annotated_stmt', `dom: ${dom}`)
    assert(b1.eyo.value_s.isIncog(), 'UNEXPECTED VALUE SLOT')
    b1.dispose()
  })
  it ('identifier_annotated in name', function () {
    var b1 = new_block('assignment_stmt')
    var b2 = new_block('identifier_annotated')
    assert(b1.eyo.target_t.eyo.lastConnect(b2), `MISSED C8N 1`)
    assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, `MISSED C8N 2`)
    assert_type(b1, 'annotated_assignment_stmt')
    assert_variant(b1, 'ANNOTATED_VALUED')
    var dom = eYo.Xml.blockToDom(b1)
    // console.error(dom)
    b1.dispose()
    b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    assert_block(b1, 'annotated_assignment_stmt', `dom: BLOCK ${dom}`)
    assert(!b1.eyo.value_s.isIncog(), 'MISSING SLOT')
    b1.dispose()
  })
})

describe('One block: assignment_stmt', function() {
  it('target', function() {
    var b1 = new_block('assignment_stmt')
    assert_comment_variant(b1, 'NONE', '1')
    assert_incog(b1, false, true, false, true)
    b1.eyo.variant_p = eYo.Key.TARGET
    assert_variant(b1, 'TARGET', '2')
    assert_incog(b1, false, true, true, true)
    // connect all the possible targets
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'x')
    b1.eyo.target_t.eyo.lastConnect(b2)
    assert_input_length(b1.eyo.target_t, 3, `MISSED C8N 1`)
    assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, `MISSED C8N 2`)
    var b3 =  eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, `<x eyo="a_expr" operator="+" xmlns="urn:edython:0.2" xmlns:eyo="urn:edython:0.2"><x eyo="identifier" name="abc" slot="lhs"></x><x eyo="identifier" name="bcd" slot="rhs"></x></x>`)
    assert(b3, `MISSING …+…`)
    b3.eyo.will_remain = true
    eYo.STOP = true
    assert(!b1.eyo.target_t.eyo.lastConnect(b3), 'Connection is expected failed.')
    assert_input_length(b1.eyo.target_t, 3, `MISSED C8N 2`)
    b3.dispose()
    b1.dispose()
  })
})

describe('One block: expression_stmt', function() {
  it('target', function() {
    var b1 = new_block('expression_stmt')
    assert(b1.eyo.operator_p === '', `MISSED ${b1.eyo.operator_p}`)
    assert_comment_variant(b1, 'NONE')
    assert_incog(b1, true, true, true, false)
    b1.eyo.variant_p = eYo.Key.TARGET
    assert_variant(b1, 'TARGET', '1')
    assert_incog(b1, false, true, true, true)
    assert_type(b1, 'assignment_stmt')
    b1.eyo.target_p = 'abc'
    assert(b1.eyo.target_p === 'abc', `MISSED ${b1.eyo.target_p} === 'abc'`)
    assert(b1.eyo.target_t, 'MISSING TARGET')
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'de')
    assert_input_length(b1.eyo.target_t, 1, `MISSED C8N 1`)
    b1.eyo.target_t.eyo.lastConnect(b2)
    assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, 'MISSED CONNECTION 1')
    assert_input_length(b1.eyo.target_t, 3, `MISSED C8N 2`)
    /*attributeref | subscription | slicing | dotted_name*/
    var b3 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'root')
    assert(b2.eyo.dotted_p === 0, `BAD 0: ${b2.eyo.dotted_p}`)
    b2.eyo.dotted_p = 1
    // b2 is disconnected
    assert(b2.eyo.dotted_p === 1, `BAD 1: ${b2.eyo.dotted_p}`)
    assert_type(b2, 'parent_module')
    assert_input_length(b1.eyo.target_t, 1, `MISSED C8N 3`)
    b2.eyo.holder_s.connect(b3)
    assert_type(b2, 'dotted_name')
    b1.eyo.target_t.eyo.lastConnect(b2)
    assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, 'MISSED CONNECTION 2')
    assert_input_length(b1.eyo.target_t, 3, `MISSED C8N 4`)
    assert(b2.eyo.holder_t === b3, `UW ${b2.eyo.holder_t.eyo.toString} === ${b3.eyo.toString}`)
    assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, 'MISSED CONNECTION 2')
    assert_input_length(b1.eyo.target_t, 3, `MISSED C8N 5`)
    b1.dispose()
  })
})

describe('One block: annotated_stmt', function() {
  it('target', function() {
    var b1 = new_block('annotated_stmt')
    assert(b1.eyo.operator_p === '=', `MISSED ${b1.eyo.operator_p}`)
    assert_comment_variant(b1, 'NONE')
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'x')
    assert_type(b2, 'identifier')
    b1.eyo.target_t.eyo.lastConnect(b2)
    assert_input_length(b1.eyo.target_t, 1, `1`)
    b1.eyo.annotated_p = 'fou+bar'
    assert(b1.eyo.annotated_p === 'fou+bar', 'MISSED ANNOTATION')
    assert(b1.eyo.annotated_s.bindField.visible_, 'UNEXPECTED HIDDEN')
    assert(b1.eyo.annotated_s.bindField.getText() === 'fou+bar', 'MISSED VALUE')
    assert_code(b1, 'x:fou+bar')
    var b3 =  eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, `<x eyo="a_expr" operator="+" xmlns="urn:edython:0.2" xmlns:eyo="urn:edython:0.2"><x eyo="identifier" name="abc" slot="lhs"></x><x eyo="identifier" name="bcd" slot="rhs"></x></x>`)
    assert_code(b3, 'abc+bcd')
    b1.eyo.annotated_s.connect(b3)
    assert(b1.eyo.annotated_t === b3, 'MISSED C8N')
    assert(!b1.eyo.annotated_s.bindField.visible_, 'UNEXPECTED VISIBLE')
    assert_code(b1, 'x:abc+bcd')
    b1.dispose()
  })
})

describe('One block: annotated_assignment_stmt', function() {
  it('target', function() {
    var b1 = new_block('annotated_assignment_stmt')
    assert_ctor(b1, 'assignment_stmt')
    assert(b1.eyo.operator_p === '=', `MISSED ${b1.eyo.operator_p}`)
    assert_comment_variant(b1, 'NONE')
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'x')
    assert_type(b2, 'identifier')
    assert(b2.eyotarget_p === 'x', 'MISSED 1')
    b1.eyo.target_t.eyo.lastConnect(b2)
    assert_input_length(b1.eyo.target_t, 1, `MISSED C8N 1`)
    b1.eyo.annotated_p = 'fou+bar'
    assert(b1.eyo.annotated_p === 'fou+bar', 'MISSED ANNOTATION')
    assert(b1.eyo.annotated_s.bindField.visible_, 'UNEXPECTED HIDDEN')
    assert(b1.eyo.annotated_s.bindField.getText() === 'fou+bar', 'MISSED VALUE')
    assert_code(b1, 'x:fou+bar=')
    b2.eyotarget_p = 'xxx'
    assert(b2.eyotarget_p === 'xxx', 'MISSED 2')
    assert_code(b1, 'xxx:fou+bar=')
    var b3 =  eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, `<x eyo="a_expr" operator="+" xmlns="urn:edython:0.2" xmlns:eyo="urn:edython:0.2"><x eyo="identifier" name="abc" slot="lhs"></x><x eyo="identifier" name="bcd" slot="rhs"></x></x>`)
    assert_code(b3, 'abc+bcd')
    b1.eyo.annotated_s.connect(b3)
    assert(b1.eyo.annotated_t === b3, 'MISSED C8N')
    assert(!b1.eyo.annotated_s.bindField.visible_, 'UNEXPECTED VISIBLE')
    assert_code(b1, 'xxx:abc+bcd=')
    // then replace the target block with an annotated identifier
    b3 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'Z')
    b3.eyo.variant_p = eYo.Key.ANNOTATED
    b3.eyo.annotated_p = 'abcd + cdef'
    assert_code(b3, 'Z:abcd+cdef')
    assert_type(b3, 'identifier_annotated')
    // it's a unique target
    assert(b1.eyo.target_t.inputList[0].eyo.connect(b3), 'MISSED C8N 4')
    assert_type(b1, 'annotated_assignment_stmt')
    assert_input_length(b1.eyo.target_t, 1, `MISSED C8N 5`)
    var eyo = b1.eyo.target_s.unwrappedTarget
    assert(eyo === b3.eyo, 'MISSED C8N 7')
    console.error(b1.eyo.toLinearString)
    assert_code(b3, 'xxx:abcd+cdef')
    b3.eyo.name_t.dispose() // orphan recovery: the old b2 block has been reconnected into b3
    assert_code(b1, 'Z:abcd+cdef=')
    b1.dispose()
  })
})

describe('XML representation', function() {
  var f = (t, k, do_it) => {
    it(`basic ${t}+${k}`, function() {
      var b = new_block(t)
      do_it && do_it(b)
      var dom = eYo.Xml.blockToDom(b)
      // console.log(dom)
      assert(dom.tagName.toLowerCase() === 's')
      assert(dom.getAttribute(eYo.Key.EYO) === k)
      b.dispose()  
    })
  }
  f('expression_stmt', 'x')
  f('assignment_stmt', '=')
  f('annotated_stmt', 'x')
  f('annotated_assignment_stmt', '=')
  f('augmented_assignment_stmt', '+=')
})

describe('Copy/Paste with value', function() {
  var f = t => {
    it(`basic ${t}`, function() {
      var b = new_block(t)
      var bb = new_block('identifier')
      assert(b.eyo.value_t.eyo.lastConnect(bb))
      var dom = eYo.Xml.blockToDom(b)
      // console.log(dom)
      assert(dom.tagName.toLowerCase() === 's')
      bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
      assert_type(b, bb.type)
      assert_variant(b, bb.eyo.variant_p)
      assert_comment_variant(b, bb.eyo.comment_variant_p)
      assert_code(b, bb.eyo.toLinearString)
      b.dispose()
      bb.dispose()
    })
  }
  f('expression_stmt')
  f('assignment_stmt')
})

describe('Copy/Paste with data test', function() {
  var f = (t, do_it, test) => {
    it(`basic ${t}`, function() {
      var b = new_block(t)
      do_it && do_it(b)
      var dom = eYo.Xml.blockToDom(b)
      // console.log(dom)
      assert(dom.tagName.toLowerCase() === 's')
      var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
      assert_type(b, bb.type)
      assert_variant(b, bb.eyo.variant_p)
      assert_comment_variant(b, bb.eyo.comment_variant_p)
      assert_code(b, bb.eyo.toLinearString)
      test && test(b, bb)
      b.dispose()
      bb.dispose()
    })
  }
  f('expression_stmt')
  f('assignment_stmt', b => {
    b.eyo.operator_p = '**='
  }, (b, bb) => {
    assert(b.eyo.operator_p === '**=')
  })
  f('annotated_stmt', b => {
    b.eyo.annotated_p = 'ANNOTATED'
  }, (b, bb) => {
    assert(b.eyo.annotated_p === 'ANNOTATED')
  })
  f('annotated_assignment_stmt')
  f('augmented_assignment_stmt', b => {
    b.eyo.operator_p = '**='
  }, (b, bb) => {
    assert(b.eyo.operator_p === '**=')
  })
})

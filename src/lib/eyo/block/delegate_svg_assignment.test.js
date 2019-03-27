describe('Each assignment block type', function() {
  [
    ['expression_stmt', null, '', 'COMMENT'],
    ['comment_stmt', null, '', 'COMMENT'],
    ['assignment_stmt', null, '=', 'NONE'],
    ['annotated_stmt', null, '=', 'NONE'], // operator '=' is not used
    ['annotated_assignment_stmt', null, '=', 'NONE'],
    ['augmented_assignment_stmt', null, '+=', 'NONE']
  ].forEach(Ts => {
    it (`basic operator: ${Ts[0]} / ${Ts[1] || Ts[0]} / ${Ts[2]}`, function () {
      var b = eYo.Test.new_block(Ts[0], Ts[1])
      eYo.Test.ctor(b, 'assignment_stmt')
      eYo.Test.data_value(b, 'operator', Ts[2])
      eYo.Test.comment_variant(b, eYo.Key[Ts[3]])
      b.dispose()
    })
  })
})
//['target', 'annotated', 'value', 'comment'], 
describe('Assignment', function() {
  var f = (t, incogs, variant, comment_variant) => {
    it(t, function() {
      var b = eYo.Test.new_block(t)
      eYo.Test.ctor(b, 'assignment_stmt')
      eYo.Test.block(b, t)
      eYo.Test.variant(b, variant)
      eYo.Test.comment_variant(b, comment_variant)
      eYo.Test.incog(b, incogs)
      b.dispose()
    })  
  }
  f('expression_stmt', ['Xtarget', 'Xannotated', 'Xvalue', 'comment'], eYo.Key.NONE, eYo.Key.COMMENT)
  f('comment_stmt', ['Xtarget', 'Xannotated', 'Xvalue', 'comment'], eYo.Key.NONE, eYo.Key.COMMENT)
  f('assignment_stmt', ['target', 'Xannotated', 'value', 'Xcomment'], eYo.Key.TARGET_VALUED, eYo.Key.NONE)
  f('augmented_assignment_stmt', ['target', 'Xannotated', 'value', 'Xcomment'], eYo.Key.TARGET_VALUED, eYo.Key.NONE)
  f('annotated_stmt', ['target', 'annotated', 'Xvalue', 'Xcomment'], eYo.Key.ANNOTATED, eYo.Key.NONE)
  f('annotated_assignment_stmt', ['target', 'annotated', 'value', 'Xcomment'], eYo.Key.ANNOTATED_VALUED, eYo.Key.NONE)
  it('comment variant change', function() {
    var b1 = eYo.Test.new_block('expression_stmt')
    eYo.Test.ctor(b1, 'assignment_stmt')
    eYo.Test.variant(b1, 'NONE')
    eYo.Test.comment_variant(b1, 'COMMENT')
    eYo.Test.incog(b1, ['Xtarget', 'Xannotated', 'Xvalue', 'comment'])
    b1.eyo.comment_variant_p = eYo.Key.NONE
    eYo.Test.comment_variant(b1, 'NONE', '2')
    eYo.Test.variant(b1, 'VALUED', '2')
    eYo.Test.incog(b1, ['Xtarget', 'Xannotated', 'value', 'Xcomment'])
    b1.eyo.variant_p = eYo.Key.NONE
    eYo.Test.variant(b1, 'NONE', '3')
    eYo.Test.comment_variant(b1, 'COMMENT', '3')
    eYo.Test.incog(b1, ['Xtarget', 'Xannotated', 'Xvalue', 'comment'])
    b1.dispose()
  })  
  it('variant change', function() {
    var b1 = eYo.Test.new_block('expression_stmt')
    eYo.Test.ctor(b1, 'assignment_stmt')
    eYo.Test.block(b1, 'expression_stmt')
    eYo.Test.variant(b1, 'NONE')
    eYo.Test.comment_variant(b1, 'COMMENT', '1')
    eYo.Test.incog(b1, ['Xtarget', 'Xannotated', 'Xvalue', 'comment'])
    b1.eyo.comment_variant_p = eYo.Key.NONE
    eYo.Test.comment_variant(b1, 'NONE', '2')
    eYo.Test.variant(b1, 'VALUED', '2')
    eYo.Test.incog(b1, ['Xtarget', 'Xannotated', 'value', 'Xcomment'])
    var f = (v, target, annotation, value, comment, str) => {
      b1.eyo.variant_p = eYo.Key[v]
      eYo.Test.variant(b1, v, str)
      eYo.Test.incog(b1, target, annotation, value, comment)
    }
    f('TARGET', ['target', 'Xannotated', 'Xvalue', 'Xcomment'], 4)
    f('TARGET_VALUED', ['target', 'Xannotated', 'value', 'Xcomment'], 4)
    f('ANNOTATED', ['target', 'annotated', 'Xvalue', 'Xcomment'], 4)
    f('ANNOTATED_VALUED', ['target', 'annotated', 'value', 'Xcomment'], 4)
    b1.dispose()
  })  

  it('Expression only', function() {
    var b1 = eYo.Test.new_block('assignment_stmt')
    eYo.Test.variant(b1, 'TARGET_VALUED')
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.assignment_chain)
    eYo.Test.block(b2, 'identifier_valued')
    var input = b1.eyo.value_b.eyo.lastInput
    chai.assert(b1.eyo.value_b.eyo.lastConnect(b2), 'MISSED C8N 1')
    chai.assert(input.connection.targetBlock() === b2, 'MISSED C8N 2')
    b1.dispose()
  })
  it('connect an identifier_valued', function() {
    var b1 = eYo.Test.new_block('assignment_stmt')
    eYo.Test.variant(b1, 'TARGET_VALUED')
    var b2 = eYo.Test.new_block('identifier_valued')
    b2.eyotarget_p = 'NOM'
    b2.eyo.value_p = 'EXPR'
    var input = b1.eyo.value_b.eyo.lastInput
    chai.assert(b1.eyo.value_b.eyo.lastConnect(b2), 'MISSED C8N 1')
    chai.assert(input.connection.targetBlock() === b2, 'MISSED C8N 2')
    b1.dispose()
  })
  it ('Annotated defined and dom', function () {
    var b1 = eYo.Test.new_block('annotated_assignment_stmt')
    var dom = eYo.Xml.blockToDom(b1)
    // console.error(dom)
    b1.dispose()
    b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    eYo.Test.block(b1, 'annotated_assignment_stmt', `dom: ${dom}`)
    b1.dispose()
  })
  it ('Annotated alone', function () {
    var b1 = eYo.Test.new_block('annotated_stmt')
    eYo.Test.variant(b1, 'ANNOTATED')    
    dom = eYo.Xml.blockToDom(b1)
    console.error(dom)
    b1.dispose()
    b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    eYo.Test.block(b1, 'annotated_stmt', 'dom')
    chai.assert(b1.eyo.value_s.isIncog(), 'UNEXPECTED VALUE SLOT')
    b1.dispose()
  })
  it ('identifier_annotated in target slot', function () {
    var b1 = eYo.Test.new_block('assignment_stmt')
    eYo.Test.variant(b1, 'TARGET_VALUED')
    var b2 = eYo.Test.new_block('identifier_annotated')
    eYo.Test.list_connect(b1, 'target', b2)
    eYo.Test.block(b1, 'annotated_assignment_stmt')
    eYo.Test.variant(b1, 'TARGET_VALUED') // No 2 annotations
    eYo.Test.incog(b1, ['target', 'Xannotated', 'value', 'Xcomment'])
    var dom = eYo.Xml.blockToDom(b1)
    // console.error(dom)
    var b3 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    eYo.Test.block(b3, 'annotated_assignment_stmt', `dom: BLOCK ${dom}`)
    eYo.Test.incog(b3, ['target', 'Xannotated', 'value', 'Xcomment'])
    b3.dispose()
    b2.dispose()
    eYo.Test.block(b1, 'assignment_stmt')
    eYo.Test.variant(b1, 'TARGET_VALUED') // No 2 annotations
    eYo.Test.incog(b1, ['target', 'Xannotated', 'value', 'Xcomment'])
    b1.dispose()
  })
  it ('augtarget_annotated in target slot', function () {
    var b1 = eYo.Test.new_block('assignment_stmt')
    eYo.Test.variant(b1, 'TARGET_VALUED')
    var b2 = eYo.Test.new_block('augtarget_annotated')
    b2.eyo.target_b.eyo.lastConnect(eYo.Test.new_block('identifier'))
    b2.eyo.target_s.unwrappedTarget.variant_p = eYo.Key.SLICING
    eYo.Test.block('augtarget_annotated')
    eYo.Test.list_connect(b1, 'target', b2)
    eYo.Test.block(b1, 'annotated_assignment_stmt')
    eYo.Test.variant(b1, 'TARGET_VALUED') // No 2 annotations
    eYo.Test.incog(b1, ['target', 'Xannotated', 'value', 'Xcomment'])
    var dom = eYo.Xml.blockToDom(b1)
    // console.error(dom)
    var b3 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    eYo.Test.block(b3, 'annotated_assignment_stmt', `dom: BLOCK ${dom}`)
    eYo.Test.incog(b3, ['target', 'Xannotated', 'value', 'Xcomment'])
    b3.dispose()
    b2.dispose()
    eYo.Test.block(b1, 'assignment_stmt')
    eYo.Test.variant(b1, 'TARGET_VALUED') // No 2 annotations
    eYo.Test.incog(b1, ['target', 'Xannotated', 'value', 'Xcomment'])
    b1.dispose()
  })
})

describe('Comment/Variant changes', function() {
  it('comment variant change', function() {
    var b1 = eYo.Test.new_block('expression_stmt')
    eYo.Test.ctor(b1, 'assignment_stmt')
    eYo.Test.variant(b1, 'NONE', '1')
    eYo.Test.comment_variant(b1, 'COMMENT', '1')
    eYo.Test.incog(b1, ['Xtarget', 'Xannotated', 'Xvalue', 'comment'])
    b1.eyo.comment_variant_p = eYo.Key.NONE
    eYo.Test.comment_variant(b1, 'NONE', '2')
    eYo.Test.variant(b1, 'VALUED', '2')
    eYo.Test.incog(b1, ['Xtarget', 'Xannotated', 'value', 'Xcomment'])
    b1.eyo.variant_p = eYo.Key.NONE
    eYo.Test.variant(b1, 'NONE', '3')
    eYo.Test.comment_variant(b1, 'COMMENT', '3')
    eYo.Test.incog(b1, ['Xtarget', 'Xannotated', 'Xvalue', 'comment'])
    b1.dispose()
  })  
  it('variant change 1', function() {
    var b1 = eYo.Test.new_block('expression_stmt')
    eYo.Test.ctor(b1, 'assignment_stmt')
    eYo.Test.block(b1, 'expression_stmt')
    eYo.Test.variant(b1, 'NONE', '1')
    eYo.Test.comment_variant(b1, 'COMMENT', '1')
    eYo.Test.incog(b1, ['Xtarget', 'Xannotated', 'Xvalue', 'comment'])
    b1.eyo.comment_variant_p = eYo.Key.NONE
    eYo.Test.comment_variant(b1, 'NONE', '2')
    eYo.Test.variant(b1, 'VALUED', '2')
    eYo.Test.incog(b1, ['Xtarget', 'Xannotated', 'value', 'Xcomment'])
    b1.dispose()
  })
  it('variant change 2', function() {
    var b1 = eYo.Test.new_block('expression_stmt')
    var f = (v, target, annotation, value, comment, str) => {
      b1.eyo.variant_p = eYo.Key[v]
      eYo.Test.variant(b1, v, str)
      eYo.Test.incog(b1, target, annotation, value, comment)
    }
    f('TARGET', ['target', 'Xannotated', 'Xvalue', 'Xcomment'], 4)
    f('TARGET_VALUED', ['target', 'Xannotated', 'value', 'Xcomment'], 4)
    f('ANNOTATED', ['target', 'annotated', 'Xvalue', 'Xcomment'], 4)
    f('ANNOTATED_VALUED', ['target', 'annotated', 'value', 'Xcomment'], 4)
    b1.dispose()
  })
})

describe('Copy/Paste', function() {
  var f = (t, incogs, variant, comment_variant) => {
    it(t, function() {
      var b = eYo.Test.new_block(t)
      eYo.Test.ctor(b, 'assignment_stmt')
      eYo.Test.block(b, t)
      eYo.Test.variant(b, variant)
      eYo.Test.comment_variant(b, comment_variant)
      eYo.Test.incog(b, incogs)
      var dom = eYo.Xml.blockToDom(b)
      b.dispose()
      b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
      eYo.Test.ctor(b, 'assignment_stmt')
      eYo.Test.block(b, t)
      eYo.Test.variant(b, variant)
      eYo.Test.comment_variant(b, comment_variant)
      eYo.Test.incog(b, incogs)
      b.dispose()
    })  
  }
  f('expression_stmt', ['Xtarget', 'Xannotated', 'Xvalue', 'comment'], eYo.Key.NONE, eYo.Key.COMMENT)
  f('comment_stmt', ['Xtarget', 'Xannotated', 'Xvalue', 'comment'], eYo.Key.NONE, eYo.Key.COMMENT)
  f('assignment_stmt', ['target', 'Xannotated', 'value', 'Xcomment'], eYo.Key.TARGET_VALUED, eYo.Key.NONE)
  f('augmented_assignment_stmt', ['target', 'Xannotated', 'value', 'Xcomment'], eYo.Key.TARGET_VALUED, eYo.Key.NONE)
  f('annotated_stmt', ['target', 'annotated', 'Xvalue', 'Xcomment'], eYo.Key.ANNOTATED, eYo.Key.NONE)
  f('annotated_assignment_stmt', ['target', 'annotated', 'value', 'Xcomment'], eYo.Key.ANNOTATED_VALUED, eYo.Key.NONE)
  it('Expression only', function() {
    var b1 = eYo.Test.new_block('assignment_stmt')
    eYo.Test.variant(b1, 'TARGET_VALUED')
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.assignment_chain)
    eYo.Test.block(b2, 'identifier_valued')
    var input = b1.eyo.value_b.eyo.lastInput
    chai.assert(b1.eyo.value_b.eyo.lastConnect(b2), 'MISSED C8N 1')
    chai.assert(input.connection.targetBlock() === b2, 'MISSED C8N 2')
    b1.dispose()
  })
  it('connect an identifier_valued', function() {
    var b1 = eYo.Test.new_block('assignment_stmt')
    eYo.Test.variant(b1, 'TARGET_VALUED')
    var b2 = eYo.Test.new_block('identifier_valued')
    b2.eyotarget_p = 'NOM'
    b2.eyo.value_p = 'EXPR'
    var input = b1.eyo.value_b.eyo.lastInput
    chai.assert(b1.eyo.value_b.eyo.lastConnect(b2), 'MISSED C8N 1')
    chai.assert(input.connection.targetBlock() === b2, 'MISSED C8N 2')
    b1.dispose()
  })
  it ('Annotated defined and dom', function () {
    var b1 = eYo.Test.new_block('annotated_assignment_stmt')
    var dom = eYo.Xml.blockToDom(b1)
    // console.error(dom)
    b1.dispose()
    b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    eYo.Test.block(b1, 'annotated_assignment_stmt', `dom: ${dom}`)
    b1.dispose()
  })
  it ('Annotated alone', function () {
    var b1 = eYo.Test.new_block('annotated_stmt')
    eYo.Test.variant(b1, 'ANNOTATED')    
    var dom = eYo.Xml.blockToDom(b1)
    // console.error(dom)
    b1.dispose()
    b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    eYo.Test.block(b1, 'annotated_stmt', `dom: ${dom}`)
    chai.assert(b1.eyo.value_s.isIncog(), 'UNEXPECTED VALUE SLOT')
    b1.dispose()
  })
  it ('identifier_annotated in name', function () {
    var b1 = eYo.Test.new_block('assignment_stmt')
    var b2 = eYo.Test.new_block('identifier_annotated', 'identifier_annotated')
    chai.assert(b1.eyo.target_b.eyo.lastConnect(b2), `MISSED C8N 1`)
    chai.assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, `MISSED C8N 2`)
    eYo.Test.block(b1, 'annotated_assignment_stmt')
    eYo.Test.variant(b1, 'TARGET_VALUED')
    var dom = eYo.Xml.blockToDom(b1)
    // console.error(dom)
    b1.dispose()
    b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    eYo.Test.block(b1, 'annotated_assignment_stmt', `dom: BLOCK ${dom}`)
    chai.assert(!b1.eyo.value_s.isIncog(), 'MISSING SLOT')
    b1.dispose()
  })
})

describe('One block: assignment_stmt', function() {
  it('target', function() {
    var b1 = eYo.Test.new_block('assignment_stmt')
    eYo.Test.comment_variant(b1, 'NONE', '1')
    eYo.Test.incog(b1, ['target', 'Xannotated', 'value', 'Xcomment'])
    b1.eyo.variant_p = eYo.Key.TARGET
    eYo.Test.variant(b1, 'TARGET', '2')
    eYo.Test.incog(b1, ['target', 'Xannotated', 'Xvalue', 'Xcomment'])
    // connect all the possible targets
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'x')
    b1.eyo.target_b.eyo.lastConnect(b2)
    eYo.Test.input_length(b1.eyo.target_b, 3, `MISSED C8N 1`)
    chai.assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, `MISSED C8N 2`)
    var b3 =  eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, `<x eyo="a_expr" operator="+" xmlns="urn:edython:0.2" xmlns:eyo="urn:edython:0.2"><x eyo="identifier" name="abc" slot="lhs"></x><x eyo="identifier" name="bcd" slot="rhs"></x></x>`)
    chai.assert(b3, `MISSING …+…`)
    b3.eyo.will_remain = true
    eYo.STOP = true
    chai.assert(!b1.eyo.target_b.eyo.lastConnect(b3), 'Connection is expected failed.')
    eYo.Test.input_length(b1.eyo.target_b, 3, `MISSED C8N 2`)
    b3.dispose()
    b1.dispose()
  })
})

describe('One block: expression_stmt', function() {
  it('target', function() {
    var b1 = eYo.Test.new_block('expression_stmt')
    chai.assert(b1.eyo.operator_p === '', `MISSED ${b1.eyo.operator_p}`)
    eYo.Test.comment_variant(b1, 'COMMENT')
    eYo.Test.incog(b1, ['Xtarget', 'Xannotated', 'Xvalue', 'comment'])
    b1.eyo.variant_p = eYo.Key.TARGET
    eYo.Test.variant(b1, 'TARGET', '1')
    eYo.Test.incog(b1, ['target', 'Xannotated', 'Xvalue', 'Xcomment'])
    eYo.Test.block(b1, 'assignment_stmt')
    b1.eyo.target_p = 'abc'
    chai.assert(b1.eyo.target_p === 'abc', `MISSED ${b1.eyo.target_p} === 'abc'`)
    chai.assert(b1.eyo.target_b, 'MISSING TARGET')
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'de')
    eYo.Test.input_length(b1.eyo.target_b, 1, `MISSED C8N 1`)
    b1.eyo.target_b.eyo.lastConnect(b2)
    chai.assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, 'MISSED CONNECTION 1')
    eYo.Test.input_length(b1.eyo.target_b, 3, `MISSED C8N 2`)
    /*attributeref | subscription | slicing | dotted_name*/
    var b3 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'root')
    chai.assert(b2.eyo.dotted_p === 0, `BAD 0: ${b2.eyo.dotted_p}`)
    b2.eyo.dotted_p = 1
    // b2 is disconnected
    chai.assert(b2.eyo.dotted_p === 1, `BAD 1: ${b2.eyo.dotted_p}`)
    eYo.Test.block(b2, 'parent_module')
    eYo.Test.input_length(b1.eyo.target_b, 1, `MISSED C8N 3`)
    b2.eyo.holder_s.connect(b3)
    eYo.Test.block(b2, 'dotted_name')
    b1.eyo.target_b.eyo.lastConnect(b2)
    chai.assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, 'MISSED CONNECTION 2')
    eYo.Test.input_length(b1.eyo.target_b, 3, `MISSED C8N 4`)
    chai.assert(b2.eyo.holder_b === b3, `UW ${b2.eyo.holder_b.eyo.toString} === ${b3.eyo.toString}`)
    chai.assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, 'MISSED CONNECTION 2')
    eYo.Test.input_length(b1.eyo.target_b, 3, `MISSED C8N 5`)
    b1.dispose()
  })
})

describe('One block: comment_stmt', function() {
  it('target', function() {
    var b1 = eYo.Test.new_block('comment_stmt')
    chai.assert(b1.eyo.operator_p === '', `MISSED ${b1.eyo.operator_p}`)
    eYo.Test.comment_variant(b1, 'COMMENT')
    eYo.Test.incog(b1, ['Xtarget', 'Xannotated', 'Xvalue', 'comment'])
    b1.eyo.variant_p = eYo.Key.TARGET
    eYo.Test.variant(b1, 'TARGET', '1')
    eYo.Test.incog(b1, ['target', 'Xannotated', 'Xvalue', 'Xcomment'])
    eYo.Test.block(b1, 'assignment_stmt')
    b1.eyo.target_p = 'abc'
    chai.assert(b1.eyo.target_p === 'abc', `MISSED ${b1.eyo.target_p} === 'abc'`)
    chai.assert(b1.eyo.target_b, 'MISSING TARGET')
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'de')
    eYo.Test.input_length(b1.eyo.target_b, 1, `MISSED C8N 1`)
    b1.eyo.target_b.eyo.lastConnect(b2)
    chai.assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, 'MISSED CONNECTION 1')
    eYo.Test.input_length(b1.eyo.target_b, 3, `MISSED C8N 2`)
    /*attributeref | subscription | slicing | dotted_name*/
    var b3 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'root')
    chai.assert(b2.eyo.dotted_p === 0, `BAD 0: ${b2.eyo.dotted_p}`)
    b2.eyo.dotted_p = 1
    // b2 is disconnected
    chai.assert(b2.eyo.dotted_p === 1, `BAD 1: ${b2.eyo.dotted_p}`)
    eYo.Test.block(b2, 'parent_module')
    eYo.Test.input_length(b1.eyo.target_b, 1, `MISSED C8N 3`)
    b2.eyo.holder_s.connect(b3)
    eYo.Test.block(b2, 'dotted_name')
    b1.eyo.target_b.eyo.lastConnect(b2)
    chai.assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, 'MISSED CONNECTION 2')
    eYo.Test.input_length(b1.eyo.target_b, 3, `MISSED C8N 4`)
    chai.assert(b2.eyo.holder_b === b3, `UW ${b2.eyo.holder_b.eyo.toString} === ${b3.eyo.toString}`)
    chai.assert(b1.eyo.target_s.unwrappedTarget === b2.eyo, 'MISSED CONNECTION 2')
    eYo.Test.input_length(b1.eyo.target_b, 3, `MISSED C8N 5`)
    b1.dispose()
  })
})

describe('One block: annotated_stmt', function() {
  it('target', function() {
    var b1 = eYo.Test.new_block('annotated_stmt')
    chai.assert(b1.eyo.operator_p === '=', `MISSED ${b1.eyo.operator_p}`)
    eYo.Test.comment_variant(b1, 'NONE')
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'x')
    eYo.Test.block(b2, 'identifier')
    b1.eyo.target_b.eyo.lastConnect(b2)
    eYo.Test.input_length(b1.eyo.target_b, 1, `1`)
    b1.eyo.annotated_p = 'fou+bar'
    chai.assert(b1.eyo.annotated_p === 'fou+bar', 'MISSED ANNOTATION')
    chai.assert(b1.eyo.annotated_s.bindField.visible_, 'UNEXPECTED HIDDEN')
    chai.assert(b1.eyo.annotated_s.bindField.getText() === 'fou+bar', 'MISSED VALUE')
    eYo.Test.code(b1, 'x:fou+bar')
    var b3 =  eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, `<x eyo="a_expr" operator="+" xmlns="urn:edython:0.2" xmlns:eyo="urn:edython:0.2"><x eyo="identifier" name="abc" slot="lhs"></x><x eyo="identifier" name="bcd" slot="rhs"></x></x>`)
    eYo.Test.code(b3, 'abc+bcd')
    b1.eyo.annotated_s.connect(b3)
    chai.assert(b1.eyo.annotated_b === b3, 'MISSED C8N')
    chai.assert(!b1.eyo.annotated_s.bindField.visible_, 'UNEXPECTED VISIBLE')
    eYo.Test.code(b1, 'x:abc+bcd')
    b1.dispose()
  })
})

describe('One block: annotated_assignment_stmt', function() {
  it ('target is annotated', function () {
    var main = eYo.Test.new_block('assignment_stmt')
    var annotated = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, {
      type: eYo.T3.Expr.primary,
      target_d: 'x',
      annotated_d: 'str'
    })
    eYo.Test.block(annotated, 'identifier_annotated')
    eYo.Test.list_connect(main, 'target', annotated)
    eYo.Test.block(main, 'annotated_assignment_stmt')
    annotated.dispose()
    eYo.Test.block(main, 'assignment_stmt')
    main.dispose()
  })
  it('target', function() {
    var main = eYo.Test.new_block('annotated_assignment_stmt')
    chai.assert(main.eyo.operator_p === '=', `MISSED ${main.eyo.operator_p}`)
    eYo.Test.comment_variant(main, 'NONE')
    eYo.Test.code(main, '<MISSING NAME>:<MISSING NAME>=<MISSING EXPRESSION>')
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'x')
    eYo.Test.block(b2, 'identifier')
    chai.assert(b2.eyo.target_p === 'x', 'MISSED 1')
    main.eyo.target_b.eyo.lastConnect(b2)
    eYo.Test.input_length(main.eyo.target_b, 1, `MISSED C8N 1`)
    main.eyo.annotated_p = 'fou+bar'
    chai.assert(main.eyo.annotated_p === 'fou+bar', 'MISSED ANNOTATION')
    chai.assert(main.eyo.annotated_s.bindField.visible_, 'UNEXPECTED HIDDEN')
    chai.assert(main.eyo.annotated_s.bindField.getText() === 'fou+bar', 'MISSED VALUE')
    eYo.Test.code(main, 'x:fou+bar=<MISSING EXPRESSION>')
    b2.eyo.target_p = 'xxx'
    chai.assert(b2.eyo.target_p === 'xxx', 'MISSED 2')
    eYo.Test.code(main, 'xxx:fou+bar=<MISSING EXPRESSION>')
    var b3 =  eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, `<x eyo="a_expr" operator="+" xmlns="urn:edython:0.2" xmlns:eyo="urn:edython:0.2"><x eyo="identifier" name="abc" slot="lhs"></x><x eyo="identifier" name="bcd" slot="rhs"></x></x>`)
    eYo.Test.code(b3, 'abc+bcd')
    main.eyo.annotated_s.connect(b3)
    chai.assert(main.eyo.annotated_b === b3, 'MISSED C8N')
    chai.assert(!main.eyo.annotated_s.bindField.visible_, 'UNEXPECTED VISIBLE')
    eYo.Test.code(main, 'xxx:abc+bcd=<MISSING EXPRESSION>')
    // then replace the target block with an annotated identifier
    b3 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'Z')
    b3.eyo.variant_p = eYo.Key.ANNOTATED
    b3.eyo.annotated_p = 'abcd + cdef'
    eYo.Test.code(b3, 'Z:abcd+cdef')
    eYo.Test.block(b3, 'identifier_annotated')
    // it's a unique target
    chai.assert(main.eyo.target_b.inputList[0].eyo.connect(b3), 'MISSED C8N 4')
    eYo.Test.block(main, 'annotated_assignment_stmt')
    eYo.Test.input_length(main.eyo.target_b, 1, `MISSED C8N 5`)
    var eyo = main.eyo.target_s.unwrappedTarget
    chai.assert(eyo === b3.eyo, 'MISSED C8N 7')
    console.error(main.eyo.toLinearString)
    eYo.Test.code(b3, 'xxx:abcd+cdef')
    b3.dispose() // orphan recovery: the old b2 block has been reconnected into b3
    eYo.Test.block(main, 'assignment_stmt')
    eYo.Test.code(main, '<MISSING NAME>=<MISSING EXPRESSION>')
    main.dispose()
  })
})

describe('XML representation', function() {
  var f = (t, k, do_it) => {
    it(`basic ${t}+${k}`, function() {
      var b = eYo.Test.new_block(t)
      do_it && do_it(b)
      var dom = eYo.Xml.blockToDom(b)
      // console.log(dom)
      chai.assert(dom.tagName.toLowerCase() === 's')
      chai.assert(dom.getAttribute(eYo.Key.EYO) === k)
      b.dispose()  
    })
  }
  f('expression_stmt', 'x')
  f('comment_stmt', 'x')
  f('assignment_stmt', '=')
  f('annotated_stmt', 'x')
  f('annotated_assignment_stmt', '=')
  f('augmented_assignment_stmt', '+=')
})

describe('Copy/Paste with value', function() {
  var f = t => {
    it(`basic ${t}`, function() {
      var b = eYo.Test.new_block(t)
      var bb = eYo.Test.new_block('identifier')
      chai.assert(b.eyo.value_b.eyo.lastConnect(bb))
      var dom = eYo.Xml.blockToDom(b)
      // console.log(dom)
      chai.assert(dom.tagName.toLowerCase() === 's')
      bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
      eYo.Test.block(b, bb.type)
      eYo.Test.variant(b, bb.eyo.variant_p)
      eYo.Test.comment_variant(b, bb.eyo.comment_variant_p)
      eYo.Test.code(b, bb.eyo.toLinearString)
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
      var b = eYo.Test.new_block(t)
      do_it && do_it(b)
      var dom = eYo.Xml.blockToDom(b)
      // console.log(dom)
      chai.assert(dom.tagName.toLowerCase() === 's')
      var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
      eYo.Test.block(b, bb.type)
      eYo.Test.variant(b, bb.eyo.variant_p)
      eYo.Test.comment_variant(b, bb.eyo.comment_variant_p)
      eYo.Test.code(b, bb.eyo.toLinearString)
      test && test(b, bb)
      b.dispose()
      bb.dispose()
    })
  }
  f('expression_stmt')
  f('assignment_stmt', b => {
    b.eyo.operator_p = '**='
  }, (b, bb) => {
    chai.assert(b.eyo.operator_p === '**=')
  })
  f('annotated_stmt', b => {
    b.eyo.annotated_p = 'ANNOTATED'
  }, (b, bb) => {
    chai.assert(b.eyo.annotated_p === 'ANNOTATED')
  })
  f('annotated_assignment_stmt')
  f('augmented_assignment_stmt', b => {
    b.eyo.operator_p = '**='
  }, (b, bb) => {
    chai.assert(b.eyo.operator_p === '**=')
  })
})

describe('Initalize with model', function() {
  it(`basic model`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, {
      type: eYo.T3.Stmt.augmented_assignment_stmt,
      operator_d: '+='
    })
    eYo.Test.block(b, 'augmented_assignment_stmt')
    chai.assert(b.eyo.operator_p === '+=', `MISSED '${b.eyo.operator_p}' === '+='`)
    b.dispose()
  })
})

describe('Initalize augmented_assignment_stmt', function() {
  eYo.DelegateSvg.Manager.getModel(eYo.T3.Expr.augmented_stmt)
  it(`basic augmented_assignment_stmt`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.augmented_assignment_stmt)
    eYo.Test.data_value(b, 'operator', '+=')
    b.dispose()
  })
})

describe('Wrapped slots', function() {
  ;[
    'target',
    'value'
  ].forEach(k => {
    it (`Slot ${k}`, function () {
      var d = eYo.test.new_brick('assignment_stmt')
      eYo.test.Slot_wrapped(d, k)
      d.dispose()
    })
  })
})

describe('Each assignment brick type', function() {
  [
    ['expression_stmt', null, ''],
    ['assignment_stmt', null, '='],
    ['annotated_stmt', null, '='], // operator '=' is not used
    ['annotated_assignment_stmt', null, '='],
    ['augmented_assignment_stmt', null, '+=']
  ].forEach(Ts => {
    it (`basic operator: ${Ts[0]} / ${Ts[1] || Ts[0]} / ${Ts[2]}`, function () {
      eYo.test.setItUp()
      var d = eYo.test.new_brick(Ts[0], Ts[1])
      eYo.test.c9r(d, 'assignment_stmt')
      eYo.test.data_value(d, 'operator', Ts[2])
      d.dispose()
      eYo.test.tearItDown()
    })
  })
})

//['target', 'annotated', 'value'],
describe('Assignment', function() {
  var f = (t, incogs, variant) => {
    it(t, function() {
      eYo.test.setItUp()
      var d = eYo.test.new_brick(t)
      eYo.test.c9r(d, 'assignment_stmt')
      eYo.test.variant(d, variant)
      eYo.test.incog(d, incogs)
      d.dispose()
      eYo.test.tearItDown()
    })
  }
  f('expression_stmt', ['Xtarget', 'Xannotated', 'value'], eYo.key.EXPRESSION, eYo.key.NONE)
  f('assignment_stmt', ['target', 'Xannotated', 'value'], eYo.key.TARGET_VALUED, eYo.key.NONE)
  f('augmented_assignment_stmt', ['target', 'Xannotated', 'value'], eYo.key.TARGET_VALUED, eYo.key.NONE)
  f('annotated_stmt', ['target', 'annotated', 'Xvalue'], eYo.key.ANNOTATED, eYo.key.NONE)
  f('annotated_assignment_stmt', ['target', 'annotated', 'value'], eYo.key.ANNOTATED_VALUED, eYo.key.NONE)

  it('variant change', function() {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('expression_stmt')
    eYo.test.c9r(d1, 'assignment_stmt')
    eYo.test.variant(d1, 'EXPRESSION')
    eYo.test.incog(d1, ['Xtarget', 'Xannotated', 'value'])
    eYo.test.variant(d1, 'EXPRESSION', '2')
    eYo.test.incog(d1, ['Xtarget', 'Xannotated', 'value'])
    var f = (v, target, annotation, value, str) => {
      d1.Variant_p = eYo.key[v]
      eYo.test.variant(d1, v, str)
      eYo.test.incog(d1, target, annotation, value)
    }
    f('TARGET', ['target', 'Xannotated', 'Xvalue'], 4)
    f('TARGET_VALUED', ['target', 'Xannotated', 'value'], 4)
    f('ANNOTATED', ['target', 'annotated', 'Xvalue'], 4)
    f('ANNOTATED_VALUED', ['target', 'annotated', 'value'], 4)
    d1.dispose()
    eYo.test.tearItDown()
  })

  it('Expression only', function() {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('assignment_stmt')
    eYo.test.variant(d1, 'TARGET_VALUED')
    var d2 = eYo.test.new_brick(eYo.t3.expr.assignment_chain)
    var input = d1.value_b.lastSlot
    chai.assert(d1.value_b.connectLast(d2), 'MISSED M4T 1')
    chai.assert(input.targetBrick === d2, 'MISSED M4T 2')
    d1.dispose()
    eYo.test.tearItDown()
  })
  it('connect an identifier_valued', function() {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('assignment_stmt')
    eYo.test.variant(d1, 'TARGET_VALUED')
    var d2 = eYo.test.new_brick('identifier_valued')
    d2.Eyotarget_p = 'NOM'
    d2.Value_p = 'EXPR'
    var input = d1.value_b.lastSlot
    chai.assert(d1.value_b.connectLast(d2), 'MISSED M4T 1')
    chai.assert(input.targetBrick === d2, 'MISSED M4T 2')
    d1.dispose()
    eYo.test.tearItDown()
  })
  it ('Annotated defined and dom', function () {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('annotated_assignment_stmt')
    var dom = eYo.xml.brickToDom(d1)
    // console.error(dom)
    d1.dispose()
    d1 = eYo.test.new_brick(dom)
    d1.dispose()
    eYo.test.tearItDown()
  })
})
describe('TEST', function () {
  it ('Annotated alone', function () {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('annotated_stmt')
    eYo.test.variant(d1, 'ANNOTATED')
    dom = eYo.xml.brickToDom(d1)
    console.error(dom)
    d1.dispose()
    d1 = eYo.test.new_brick(dom)
    chai.assert(d1.value_s.incog, 'UNEXPECTED VALUE SLOT')
    d1.dispose()
    eYo.test.tearItDown()
  })
})
describe('T&ST', function () {
  it ('identifier_annotated in target slot', function () {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('assignment_stmt')
    eYo.test.variant(d1, 'TARGET_VALUED')
    var d2 = eYo.test.new_brick('identifier_annotated')
    eYo.test.list_connect(d1, 'target', d2)
    eYo.test.brick(d1, 'annotated_assignment_stmt')
    eYo.test.variant(d1, 'TARGET_VALUED') // No 2 annotations
    eYo.test.incog(d1, ['target', 'Xannotated', 'value'])
    var dom = eYo.xml.brickToDom(d1)
    // console.error(dom)
    var d3 = eYo.test.new_brick(dom)
    eYo.test.incog(d3, ['target', 'Xannotated', 'value'])
    d3.dispose()
    d2.dispose()
    eYo.test.brick(d1, 'assignment_stmt')
    eYo.test.variant(d1, 'TARGET_VALUED') // No 2 annotations
    eYo.test.incog(d1, ['target', 'Xannotated', 'value'])
    d1.dispose()
    eYo.test.tearItDown()
  })
  it ('augtarget_annotated in target slot', function () {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('assignment_stmt')
    eYo.test.variant(d1, 'TARGET_VALUED')
    var d2 = eYo.test.new_brick('augtarget_annotated')
    d2.target_b.connectLast(eYo.test.new_brick('identifier'))
    d2.target_s.unwrappedTarget.Variant_p = eYo.key.SLICING
    eYo.test.brick('augtarget_annotated')
    eYo.test.list_connect(d1, 'target', d2)
    eYo.test.brick(d1, 'annotated_assignment_stmt')
    eYo.test.variant(d1, 'TARGET_VALUED') // No 2 annotations
    eYo.test.incog(d1, ['target', 'Xannotated', 'value'])
    var dom = eYo.xml.brickToDom(d1)
    // console.error(dom)
    var d3 = eYo.test.new_brick(dom)
    eYo.test.incog(d3, ['target', 'Xannotated', 'value'])
    d3.dispose()
    d2.dispose()
    eYo.test.brick(d1, 'assignment_stmt')
    eYo.test.variant(d1, 'TARGET_VALUED') // No 2 annotations
    eYo.test.incog(d1, ['target', 'Xannotated', 'value'])
    d1.dispose()
    eYo.test.tearItDown()
  })
})

describe('Comment/Variant changes', function() {
  it('variant change 1', function() {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('expression_stmt')
    eYo.test.c9r(d1, 'assignment_stmt')
    eYo.test.variant(d1, 'EXPRESSION', '1')
    eYo.test.incog(d1, ['Xtarget', 'Xannotated', 'value'])
    eYo.test.variant(d1, 'EXPRESSION', '2')
    eYo.test.incog(d1, ['Xtarget', 'Xannotated', 'value'])
    d1.dispose()
    eYo.test.tearItDown()
  })
  it('variant change 2', function() {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('expression_stmt')
    var f = (v, target, annotation, value, str) => {
      d1.Variant_p = eYo.key[v]
      eYo.test.variant(d1, v, str)
      eYo.test.incog(d1, target, annotation, value)
    }
    f('TARGET', ['target', 'Xannotated', 'Xvalue'], 4)
    f('TARGET_VALUED', ['target', 'Xannotated', 'value'], 4)
    f('ANNOTATED', ['target', 'annotated', 'Xvalue'], 4)
    f('ANNOTATED_VALUED', ['target', 'annotated', 'value'], 4)
    d1.dispose()
    eYo.test.tearItDown()
  })
})

describe('Copy/Paste', function() {
  var f = (t, incogs, variant) => {
    it(t, function() {
      eYo.test.setItUp()
      var d = eYo.test.new_brick(t)
      eYo.test.c9r(d, 'assignment_stmt')
      eYo.test.variant(d, variant)
      eYo.test.incog(d, incogs)
      var dom = eYo.xml.brickToDom(d)
      d.dispose()
      d = eYo.test.new_brick(dom)
      eYo.test.c9r(d, 'assignment_stmt')
      console.error(dom)
      eYo.test.variant(d, variant)
      eYo.test.incog(d, incogs)
      d.dispose()
      eYo.test.tearItDown()
    })
  }
  f('expression_stmt', ['Xtarget', 'Xannotated', 'value'], eYo.key.EXPRESSION, eYo.key.NONE)
  f('assignment_stmt', ['target', 'Xannotated', 'value'], eYo.key.TARGET_VALUED, eYo.key.NONE)
  f('augmented_assignment_stmt', ['target', 'Xannotated', 'value'], eYo.key.TARGET_VALUED, eYo.key.NONE)
  f('annotated_stmt', ['target', 'annotated', 'Xvalue'], eYo.key.ANNOTATED, eYo.key.NONE)
  f('annotated_assignment_stmt', ['target', 'annotated', 'value'], eYo.key.ANNOTATED_VALUED, eYo.key.NONE)
  it('Expression only', function() {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('assignment_stmt')
    eYo.test.variant(d1, 'TARGET_VALUED')
    var d2 = eYo.test.new_brick(eYo.t3.expr.assignment_chain)
    var input = d1.value_b.lastSlot
    chai.assert(d1.value_b.connectLast(d2), 'MISSED M4T 1')
    chai.assert(input.targetBrick === d2, 'MISSED M4T 2')
    d1.dispose()
    eYo.test.tearItDown()
  })
  it('connect an identifier_valued', function() {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('assignment_stmt')
    eYo.test.variant(d1, 'TARGET_VALUED')
    var d2 = eYo.test.new_brick('identifier_valued')
    d2.Eyotarget_p = 'NOM'
    d2.Value_p = 'EXPR'
    var input = d1.value_b.lastSlot
    chai.assert(d1.value_b.connectLast(d2), 'MISSED M4T 1')
    chai.assert(input.targetBrick === d2, 'MISSED M4T 2')
    d1.dispose()
    eYo.test.tearItDown()
  })
  it ('Annotated defined and dom', function () {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('annotated_assignment_stmt')
    var dom = eYo.xml.brickToDom(d1)
    // console.error(dom)
    d1.dispose()
    d1 = eYo.test.new_brick(dom)
    d1.dispose()
    eYo.test.tearItDown()
  })
  it ('Annotated alone', function () {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('annotated_stmt')
    eYo.test.variant(d1, 'ANNOTATED')
    var dom = eYo.xml.brickToDom(d1)
    // console.error(dom)
    d1.dispose()
    d1 = eYo.test.new_brick(dom)
    chai.assert(d1.value_s.incog, 'UNEXPECTED VALUE SLOT')
    d1.dispose()
    eYo.test.tearItDown()
  })
  it ('identifier_annotated in name', function () {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('assignment_stmt')
    var d2 = eYo.test.new_brick('identifier_annotated', 'identifier_annotated')
    chai.assert(d1.target_b.connectLast(d2), `MISSED M4T 1`)
    chai.assert(d1.target_s.unwrappedTarget === d2, `MISSED M4T 2`)
    eYo.test.variant(d1, 'TARGET_VALUED')
    var dom = eYo.xml.brickToDom(d1)
    // console.error(dom)
    d1.dispose()
    d1 = eYo.test.new_brick(dom)
    chai.assert(!d1.value_s.incog, 'MISSING SLOT')
    d1.dispose()
    eYo.test.tearItDown()
  })
})

describe('One brick: assignment_stmt', function() {
  it('target', function() {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('assignment_stmt')
    eYo.test.incog(d1, ['target', 'Xannotated', 'value'])
    d1.Variant_p = eYo.key.TARGET
    eYo.test.variant(d1, 'TARGET', '2')
    eYo.test.incog(d1, ['target', 'Xannotated', 'Xvalue'])
    // connect all the possible targets
    var d2 = eYo.test.new_brick('x')
    d1.target_b.connectLast(d2)
    eYo.test.Input_length(d1.target_b, 3, `MISSED M4T 1`)
    chai.assert(d1.target_s.unwrappedTarget === d2, `MISSED M4T 2`)
    var d3 =  eYo.test.new_brick(`<x eyo="a_expr" operator="+" xmlns="urn:edython:0.2" xmlns: eyo="urn:edython:0.2"><x eyo="identifier" name="abc" slot="lhs"></x><x eyo="identifier" name="bcd" slot="rhs"></x></x>`)
    chai.assert(d3, `MISSING …+…`)
    d3.will_remain = true
    eYo.STOP = true
    chai.assert(!d1.target_b.connectLast(d3), 'connectLast failed.')
    eYo.test.Input_length(d1.target_b, 3, `MISSED M4T 2`)
    d3.dispose()
    d1.dispose()
    eYo.test.tearItDown()
  })
})

describe('One brick: expression_stmt', function() {
  it('target', function() {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('expression_stmt')
    chai.assert(d1.Operator_p === '', `MISSED ${d1.Operator_p}`)
    eYo.test.incog(d1, ['Xtarget', 'Xannotated', 'value'])
    d1.Variant_p = eYo.key.TARGET
    eYo.test.variant(d1, 'TARGET', '1')
    eYo.test.incog(d1, ['target', 'Xannotated', 'Xvalue'])
    eYo.test.brick(d1, 'assignment_stmt')
    d1.Target_p = 'abc'
    chai.assert(d1.Target_p === 'abc', `MISSED ${d1.Target_p} === 'abc'`)
    chai.assert(d1.target_b, 'MISSING TARGET')
    var d2 = eYo.test.new_brick('de')
    eYo.test.Input_length(d1.target_b, 1, `MISSED M4T 1`)
    d1.target_b.connectLast(d2)
    chai.assert(d1.target_s.unwrappedTarget === d2, 'MISSED CONNECTION 1')
    eYo.test.Input_length(d1.target_b, 3, `MISSED M4T 2`)
    /*attributeref | subscription | slicing | dotted_name*/
    var d3 = eYo.test.new_brick('root')
    chai.assert(d2.Dotted_p === 0, `BAD 0: ${d2.Dotted_p}`)
    d2.Dotted_p = 1
    // d2 is disconnected
    chai.assert(d2.Dotted_p === 1, `BAD 1: ${d2.Dotted_p}`)
    eYo.test.Input_length(d1.target_b, 1, `MISSED M4T 3`)
    d2.holder_s.connect(d3)
    eYo.test.brick(d2, 'dotted_name')
    d1.target_b.connectLast(d2)
    chai.assert(d1.target_s.unwrappedTarget === d2, 'MISSED CONNECTION 2')
    eYo.test.Input_length(d1.target_b, 3, `MISSED M4T 4`)
    chai.assert(d2.holder_b === d3, `UW ${d2.holder_b.description} === ${d3.description}`)
    chai.assert(d1.target_s.unwrappedTarget === d2, 'MISSED CONNECTION 2')
    eYo.test.Input_length(d1.target_b, 3, `MISSED M4T 5`)
    d1.dispose()
    eYo.test.tearItDown()
  })
})

describe('One brick: annotated_stmt', function() {
  it('target', function() {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('annotated_stmt')
    chai.assert(d1.Operator_p === '=', `MISSED ${d1.Operator_p}`)
    var d2 = eYo.test.new_brick('x')
    d1.target_b.connectLast(d2)
    eYo.test.Input_length(d1.target_b, 1, `1`)
    d1.Annotated_p = 'fou+bar'
    chai.assert(d1.Annotated_p === 'fou+bar', 'MISSED ANNOTATION')
    chai.assert(d1.annotated_s.bindField.visible_, 'UNEXPECTED HIDDEN')
    chai.assert(d1.annotated_s.bindField.text === 'fou+bar', 'MISSED VALUE')
    eYo.test.Code(d1, 'x:fou+bar')
    var d3 =  eYo.test.new_brick(`<x eyo="a_expr" operator="+" xmlns="urn:edython:0.2" xmlns: eyo="urn:edython:0.2"><x eyo="identifier" name="abc" slot="lhs"></x><x eyo="identifier" name="bcd" slot="rhs"></x></x>`)
    eYo.test.Code(d3, 'abc + bcd')
    d1.annotated_s.connect(d3)
    chai.assert(d1.annotated_b === d3, 'MISSED M4T')
    chai.assert(!d1.annotated_s.bindField.visible_, 'UNEXPECTED VISIBLE')
    eYo.test.Code(d1, 'x: abc + bcd')
    d1.dispose()
    eYo.test.tearItDown()
  })
})

describe('One brick: annotated_assignment_stmt', function() {
  it ('target is annotated', function () {
    eYo.test.setItUp()
    var d_main = eYo.test.new_brick('assignment_stmt')
    var annotated = eYo.test.new_brick({
      type: eYo.t3.expr.primary,
      target_p: 'x',
      annotated_p: 'str'
    })
    eYo.test.list_connect(d_main, 'target', annotated)
    eYo.test.brick(d_main, 'annotated_assignment_stmt')
    annotated.dispose()
    eYo.test.brick(d_main, 'assignment_stmt')
    d_main.dispose()
    eYo.test.tearItDown()
  })
  it('target', function() {
    eYo.test.setItUp()
    var d_main = eYo.test.new_brick('annotated_assignment_stmt')
    chai.assert(d_main.Operator_p === '=', `MISSED ${d_main.Operator_p}`)
    eYo.test.Code(d_main, '<MISSING NAME>:<MISSING EXPRESSION>=<MISSING EXPRESSION>')
    var d2 = eYo.test.new_brick('x')
    chai.assert(d2.Target_p === 'x', 'MISSED 1')
    d_main.target_b.connectLast(d2)
    eYo.test.Input_length(d_main.target_b, 1, `MISSED M4T 1`)
    d_main.Annotated_p = 'fou + bar'
    chai.assert(d_main.Annotated_p === 'fou + bar', 'MISSED ANNOTATION')
    chai.assert(d_main.annotated_s.bindField.visible_, 'UNEXPECTED HIDDEN')
    chai.assert(d_main.annotated_s.bindField.text === 'fou + bar', 'MISSED VALUE')
    console.error(d_main.annotated_s)
    eYo.test.Code(d_main, 'x: fou + bar = <MISSING EXPRESSION>')
    d2.Target_p = 'xxx'
    chai.assert(d2.Target_p === 'xxx', 'MISSED 2')
    eYo.test.Code(d_main, 'xxx: fou + bar = <MISSING EXPRESSION>')
    var d3 =  eYo.test.new_brick(`<x eyo="a_expr" operator="+" xmlns="urn:edython:0.2" xmlns: eyo="urn:edython:0.2"><x eyo="identifier" name="abc" slot="lhs"></x><x eyo="identifier" name="bcd" slot="rhs"></x></x>`)
    eYo.test.Code(d3, 'abc + bcd')
    d_main.annotated_s.connect(d3)
    chai.assert(d_main.annotated_b === d3, 'MISSED M4T')
    chai.assert(!d_main.annotated_s.bindField.visible_, 'UNEXPECTED VISIBLE')
    eYo.test.Code(d_main, 'xxx: abc + bcd=<MISSING EXPRESSION>')
    // then replace the target brick with an annotated identifier
    d3 = eYo.test.new_brick('Z')
    d3.Variant_p = eYo.key.ANNOTATED
    d3.Annotated_p = 'abcd + cdef'
    eYo.test.Code(d3, 'Z: abcd + cdef')
    eYo.test.brick(d3, 'identifier_annotated')
    // it's a unique target
    chai.assert(d_main.target_b.slotAtHead.connect(d3), 'MISSED M4T 4')
    eYo.test.brick(d_main, 'annotated_assignment_stmt')
    eYo.test.Input_length(d_main.target_b, 1, `MISSED M4T 5`)
    var b3k = d_main.target_s.unwrappedTarget
    chai.assert(b3k === d3, 'MISSED M4T 7')
    console.error(d_main.toLinearString)
    eYo.test.Code(d3, 'xxx: abcd + cdef')
    d3.dispose() // orphan recovery: the old d2 brick has been reconnected into d3
    eYo.test.brick(d_main, 'assignment_stmt')
    eYo.test.Code(d_main, '<MISSING NAME>=<MISSING EXPRESSION>')
    d_main.dispose()
    eYo.test.tearItDown()
  })
})

describe('XML representation', function() {
  var f = (t, k, do_it) => {
    it(`basic ${t}+${k}`, function() {
      eYo.test.setItUp()
      var d = eYo.test.new_brick(t)
      do_it && (do_it(d))
      var dom = eYo.xml.brickToDom(d)
      // console.log(dom)
      chai.expect(dom.tagName.toLowerCase()).equal('s')
      chai.expect(dom.getAttribute(eYo.key.EYO)).equal(k)
      d.dispose()
      eYo.test.tearItDown()
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
      eYo.test.setItUp()
      var d = eYo.test.new_brick(t)
      var dd = eYo.test.new_brick('identifier')
      chai.assert(d.value_b.connectLast(dd))
      var dom = eYo.xml.brickToDom(d)
      // console.log(dom)
      chai.expect(dom.tagName.toLowerCase()).equal('s')
      dd = eYo.test.new_brick(dom)
      eYo.test.variant(d, dd.Variant_p)
      eYo.test.Code(d, dd.description)
      d.dispose()
      dd.dispose()
      eYo.test.tearItDown()
    })
  }
  f('expression_stmt')
  f('assignment_stmt')
})

describe('Copy/Paste with data test', function() {
  var f = (t, do_it, test) => {
    it(`basic ${t}`, function() {
      eYo.test.setItUp()
      var d = eYo.test.new_brick(t)
      do_it && (do_it(d))
      var dom = eYo.xml.brickToDom(d)
      chai.expect(dom.tagName.toLowerCase()).equal('s')
      console.error(t, dom)
      var dd = eYo.test.new_brick(dom)
      eYo.test.variant(d, dd.Variant_p)
      eYo.test.Code(d, dd.toLinearString)
      test && (test(d, dd))
      d.dispose()
      dd.dispose()
      eYo.test.tearItDown()
    })
  }
  // f('expression_stmt')
  // f('assignment_stmt', d => {
  //   d.Operator_p = '**='
  // }, (d, dd) => {
  //   chai.expect(d.Operator_p).equal('**=')
  // })
  f('annotated_stmt', d => {
    d.Annotated_p = 'ANNOTATED'
  }, (d, dd) => {
    chai.expect(d.Annotated_p).equal('ANNOTATED')
  })
  // f('annotated_assignment_stmt')
  // f('augmented_assignment_stmt', d => {
  //   d.Operator_p = '**='
  // }, (d, dd) => {
  //   chai.expect(d.Operator_p).equal('**=')
  // })
})

describe('Initalize with model', function() {
  it(`basic model`, function() {
    eYo.test.setItUp()
    var d = eYo.test.new_brick({
      type: eYo.t3.stmt.augmented_assignment_stmt,
      operator_p: '+='
    })
    chai.assert(d.Operator_p === '+=', `MISSED '${d.Operator_p}' === '+='`)
    d.dispose()
    eYo.test.tearItDown()
  })
})

describe('Initalize augmented_assignment_stmt', function() {
  eYo.model.forKey(eYo.t3.expr.augmented_stmt)
  it(`basic augmented_assignment_stmt`, function() {
    eYo.test.setItUp()
    var d = eYo.test.new_brick(eYo.t3.stmt.augmented_assignment_stmt)
    eYo.test.data_value(d, 'operator', '+=')
    d.dispose()
    eYo.test.tearItDown()
  })
})

describe('Check: assignment_stmt target', function() {
  it('check target', function() {
    eYo.test.setItUp()
    eYo.test.tearItDown()
  })
})

describe('Wrapped slots', function() {
  ;[
    'target',
    'value'
  ].forEach(k => {
    it (`Slot ${k}`, function () {
      var d = eYo.Test.new_brick('assignment_stmt')
      eYo.Test.slot_wrapped(d, k)
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
      eYo.Test.setItUp()
      var d = eYo.Test.new_brick(Ts[0], Ts[1])
      eYo.Test.C9r(d, 'assignment_stmt')
      eYo.Test.data_value(d, 'operator', Ts[2])
      d.dispose()
      eYo.Test.tearItDown()
    })
  })
})

//['target', 'annotated', 'value'],
describe('Assignment', function() {
  var f = (t, incogs, variant) => {
    it(t, function() {
      eYo.Test.setItUp()
      var d = eYo.Test.new_brick(t)
      eYo.Test.C9r(d, 'assignment_stmt')
      eYo.Test.variant(d, variant)
      eYo.Test.incog(d, incogs)
      d.dispose()
      eYo.Test.tearItDown()
    })
  }
  f('expression_stmt', ['Xtarget', 'Xannotated', 'value'], eYo.Key.EXPRESSION, eYo.Key.NONE)
  f('assignment_stmt', ['target', 'Xannotated', 'value'], eYo.Key.TARGET_VALUED, eYo.Key.NONE)
  f('augmented_assignment_stmt', ['target', 'Xannotated', 'value'], eYo.Key.TARGET_VALUED, eYo.Key.NONE)
  f('annotated_stmt', ['target', 'annotated', 'Xvalue'], eYo.Key.ANNOTATED, eYo.Key.NONE)
  f('annotated_assignment_stmt', ['target', 'annotated', 'value'], eYo.Key.ANNOTATED_VALUED, eYo.Key.NONE)

  it('variant change', function() {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('expression_stmt')
    eYo.Test.C9r(d1, 'assignment_stmt')
    eYo.Test.variant(d1, 'EXPRESSION')
    eYo.Test.incog(d1, ['Xtarget', 'Xannotated', 'value'])
    eYo.Test.variant(d1, 'EXPRESSION', '2')
    eYo.Test.incog(d1, ['Xtarget', 'Xannotated', 'value'])
    var f = (v, target, annotation, value, str) => {
      d1.variant_p = eYo.Key[v]
      eYo.Test.variant(d1, v, str)
      eYo.Test.incog(d1, target, annotation, value)
    }
    f('TARGET', ['target', 'Xannotated', 'Xvalue'], 4)
    f('TARGET_VALUED', ['target', 'Xannotated', 'value'], 4)
    f('ANNOTATED', ['target', 'annotated', 'Xvalue'], 4)
    f('ANNOTATED_VALUED', ['target', 'annotated', 'value'], 4)
    d1.dispose()
    eYo.Test.tearItDown()
  })

  it('Expression only', function() {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('assignment_stmt')
    eYo.Test.variant(d1, 'TARGET_VALUED')
    var d2 = eYo.Test.new_brick(eYo.T3.Expr.assignment_chain)
    var input = d1.value_b.lastSlot
    chai.assert(d1.value_b.connectLast(d2), 'MISSED M4T 1')
    chai.assert(input.targetBrick === d2, 'MISSED M4T 2')
    d1.dispose()
    eYo.Test.tearItDown()
  })
  it('connect an identifier_valued', function() {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('assignment_stmt')
    eYo.Test.variant(d1, 'TARGET_VALUED')
    var d2 = eYo.Test.new_brick('identifier_valued')
    d2.eyotarget_p = 'NOM'
    d2.value_p = 'EXPR'
    var input = d1.value_b.lastSlot
    chai.assert(d1.value_b.connectLast(d2), 'MISSED M4T 1')
    chai.assert(input.targetBrick === d2, 'MISSED M4T 2')
    d1.dispose()
    eYo.Test.tearItDown()
  })
  it ('Annotated defined and dom', function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('annotated_assignment_stmt')
    var dom = eYo.Xml.brickToDom(d1)
    // console.error(dom)
    d1.dispose()
    d1 = eYo.Test.new_brick(dom)
    d1.dispose()
    eYo.Test.tearItDown()
  })
})
describe('TEST', function () {
  it ('Annotated alone', function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('annotated_stmt')
    eYo.Test.variant(d1, 'ANNOTATED')
    dom = eYo.Xml.brickToDom(d1)
    console.error(dom)
    d1.dispose()
    d1 = eYo.Test.new_brick(dom)
    chai.assert(d1.value_s.incog, 'UNEXPECTED VALUE SLOT')
    d1.dispose()
    eYo.Test.tearItDown()
  })
})
describe('T&ST', function () {
  it ('identifier_annotated in target slot', function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('assignment_stmt')
    eYo.Test.variant(d1, 'TARGET_VALUED')
    var d2 = eYo.Test.new_brick('identifier_annotated')
    eYo.Test.list_connect(d1, 'target', d2)
    eYo.Test.brick(d1, 'annotated_assignment_stmt')
    eYo.Test.variant(d1, 'TARGET_VALUED') // No 2 annotations
    eYo.Test.incog(d1, ['target', 'Xannotated', 'value'])
    var dom = eYo.Xml.brickToDom(d1)
    // console.error(dom)
    var d3 = eYo.Test.new_brick(dom)
    eYo.Test.incog(d3, ['target', 'Xannotated', 'value'])
    d3.dispose()
    d2.dispose()
    eYo.Test.brick(d1, 'assignment_stmt')
    eYo.Test.variant(d1, 'TARGET_VALUED') // No 2 annotations
    eYo.Test.incog(d1, ['target', 'Xannotated', 'value'])
    d1.dispose()
    eYo.Test.tearItDown()
  })
  it ('augtarget_annotated in target slot', function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('assignment_stmt')
    eYo.Test.variant(d1, 'TARGET_VALUED')
    var d2 = eYo.Test.new_brick('augtarget_annotated')
    d2.target_b.connectLast(eYo.Test.new_brick('identifier'))
    d2.target_s.unwrappedTarget.variant_p = eYo.Key.SLICING
    eYo.Test.brick('augtarget_annotated')
    eYo.Test.list_connect(d1, 'target', d2)
    eYo.Test.brick(d1, 'annotated_assignment_stmt')
    eYo.Test.variant(d1, 'TARGET_VALUED') // No 2 annotations
    eYo.Test.incog(d1, ['target', 'Xannotated', 'value'])
    var dom = eYo.Xml.brickToDom(d1)
    // console.error(dom)
    var d3 = eYo.Test.new_brick(dom)
    eYo.Test.incog(d3, ['target', 'Xannotated', 'value'])
    d3.dispose()
    d2.dispose()
    eYo.Test.brick(d1, 'assignment_stmt')
    eYo.Test.variant(d1, 'TARGET_VALUED') // No 2 annotations
    eYo.Test.incog(d1, ['target', 'Xannotated', 'value'])
    d1.dispose()
    eYo.Test.tearItDown()
  })
})

describe('Comment/Variant changes', function() {
  it('variant change 1', function() {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('expression_stmt')
    eYo.Test.C9r(d1, 'assignment_stmt')
    eYo.Test.variant(d1, 'EXPRESSION', '1')
    eYo.Test.incog(d1, ['Xtarget', 'Xannotated', 'value'])
    eYo.Test.variant(d1, 'EXPRESSION', '2')
    eYo.Test.incog(d1, ['Xtarget', 'Xannotated', 'value'])
    d1.dispose()
    eYo.Test.tearItDown()
  })
  it('variant change 2', function() {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('expression_stmt')
    var f = (v, target, annotation, value, str) => {
      d1.variant_p = eYo.Key[v]
      eYo.Test.variant(d1, v, str)
      eYo.Test.incog(d1, target, annotation, value)
    }
    f('TARGET', ['target', 'Xannotated', 'Xvalue'], 4)
    f('TARGET_VALUED', ['target', 'Xannotated', 'value'], 4)
    f('ANNOTATED', ['target', 'annotated', 'Xvalue'], 4)
    f('ANNOTATED_VALUED', ['target', 'annotated', 'value'], 4)
    d1.dispose()
    eYo.Test.tearItDown()
  })
})

describe('Copy/Paste', function() {
  var f = (t, incogs, variant) => {
    it(t, function() {
      eYo.Test.setItUp()
      var d = eYo.Test.new_brick(t)
      eYo.Test.C9r(d, 'assignment_stmt')
      eYo.Test.variant(d, variant)
      eYo.Test.incog(d, incogs)
      var dom = eYo.Xml.brickToDom(d)
      d.dispose()
      d = eYo.Test.new_brick(dom)
      eYo.Test.C9r(d, 'assignment_stmt')
      console.error(dom)
      eYo.Test.variant(d, variant)
      eYo.Test.incog(d, incogs)
      d.dispose()
      eYo.Test.tearItDown()
    })
  }
  f('expression_stmt', ['Xtarget', 'Xannotated', 'value'], eYo.Key.EXPRESSION, eYo.Key.NONE)
  f('assignment_stmt', ['target', 'Xannotated', 'value'], eYo.Key.TARGET_VALUED, eYo.Key.NONE)
  f('augmented_assignment_stmt', ['target', 'Xannotated', 'value'], eYo.Key.TARGET_VALUED, eYo.Key.NONE)
  f('annotated_stmt', ['target', 'annotated', 'Xvalue'], eYo.Key.ANNOTATED, eYo.Key.NONE)
  f('annotated_assignment_stmt', ['target', 'annotated', 'value'], eYo.Key.ANNOTATED_VALUED, eYo.Key.NONE)
  it('Expression only', function() {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('assignment_stmt')
    eYo.Test.variant(d1, 'TARGET_VALUED')
    var d2 = eYo.Test.new_brick(eYo.T3.Expr.assignment_chain)
    var input = d1.value_b.lastSlot
    chai.assert(d1.value_b.connectLast(d2), 'MISSED M4T 1')
    chai.assert(input.targetBrick === d2, 'MISSED M4T 2')
    d1.dispose()
    eYo.Test.tearItDown()
  })
  it('connect an identifier_valued', function() {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('assignment_stmt')
    eYo.Test.variant(d1, 'TARGET_VALUED')
    var d2 = eYo.Test.new_brick('identifier_valued')
    d2.eyotarget_p = 'NOM'
    d2.value_p = 'EXPR'
    var input = d1.value_b.lastSlot
    chai.assert(d1.value_b.connectLast(d2), 'MISSED M4T 1')
    chai.assert(input.targetBrick === d2, 'MISSED M4T 2')
    d1.dispose()
    eYo.Test.tearItDown()
  })
  it ('Annotated defined and dom', function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('annotated_assignment_stmt')
    var dom = eYo.Xml.brickToDom(d1)
    // console.error(dom)
    d1.dispose()
    d1 = eYo.Test.new_brick(dom)
    d1.dispose()
    eYo.Test.tearItDown()
  })
  it ('Annotated alone', function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('annotated_stmt')
    eYo.Test.variant(d1, 'ANNOTATED')
    var dom = eYo.Xml.brickToDom(d1)
    // console.error(dom)
    d1.dispose()
    d1 = eYo.Test.new_brick(dom)
    chai.assert(d1.value_s.incog, 'UNEXPECTED VALUE SLOT')
    d1.dispose()
    eYo.Test.tearItDown()
  })
  it ('identifier_annotated in name', function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('assignment_stmt')
    var d2 = eYo.Test.new_brick('identifier_annotated', 'identifier_annotated')
    chai.assert(d1.target_b.connectLast(d2), `MISSED M4T 1`)
    chai.assert(d1.target_s.unwrappedTarget === d2, `MISSED M4T 2`)
    eYo.Test.variant(d1, 'TARGET_VALUED')
    var dom = eYo.Xml.brickToDom(d1)
    // console.error(dom)
    d1.dispose()
    d1 = eYo.Test.new_brick(dom)
    chai.assert(!d1.value_s.incog, 'MISSING SLOT')
    d1.dispose()
    eYo.Test.tearItDown()
  })
})

describe('One brick: assignment_stmt', function() {
  it('target', function() {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('assignment_stmt')
    eYo.Test.incog(d1, ['target', 'Xannotated', 'value'])
    d1.variant_p = eYo.Key.TARGET
    eYo.Test.variant(d1, 'TARGET', '2')
    eYo.Test.incog(d1, ['target', 'Xannotated', 'Xvalue'])
    // connect all the possible targets
    var d2 = eYo.Test.new_brick('x')
    d1.target_b.connectLast(d2)
    eYo.Test.input_length(d1.target_b, 3, `MISSED M4T 1`)
    chai.assert(d1.target_s.unwrappedTarget === d2, `MISSED M4T 2`)
    var d3 =  eYo.Test.new_brick(`<x eyo="a_expr" operator="+" xmlns="urn:edython:0.2" xmlns: eyo="urn:edython:0.2"><x eyo="identifier" name="abc" slot="lhs"></x><x eyo="identifier" name="bcd" slot="rhs"></x></x>`)
    chai.assert(d3, `MISSING …+…`)
    d3.will_remain = true
    eYo.STOP = true
    chai.assert(!d1.target_b.connectLast(d3), 'connectLast failed.')
    eYo.Test.input_length(d1.target_b, 3, `MISSED M4T 2`)
    d3.dispose()
    d1.dispose()
    eYo.Test.tearItDown()
  })
})

describe('One brick: expression_stmt', function() {
  it('target', function() {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('expression_stmt')
    chai.assert(d1.operator_p === '', `MISSED ${d1.operator_p}`)
    eYo.Test.incog(d1, ['Xtarget', 'Xannotated', 'value'])
    d1.variant_p = eYo.Key.TARGET
    eYo.Test.variant(d1, 'TARGET', '1')
    eYo.Test.incog(d1, ['target', 'Xannotated', 'Xvalue'])
    eYo.Test.brick(d1, 'assignment_stmt')
    d1.target_p = 'abc'
    chai.assert(d1.target_p === 'abc', `MISSED ${d1.target_p} === 'abc'`)
    chai.assert(d1.target_b, 'MISSING TARGET')
    var d2 = eYo.Test.new_brick('de')
    eYo.Test.input_length(d1.target_b, 1, `MISSED M4T 1`)
    d1.target_b.connectLast(d2)
    chai.assert(d1.target_s.unwrappedTarget === d2, 'MISSED CONNECTION 1')
    eYo.Test.input_length(d1.target_b, 3, `MISSED M4T 2`)
    /*attributeref | subscription | slicing | dotted_name*/
    var d3 = eYo.Test.new_brick('root')
    chai.assert(d2.dotted_p === 0, `BAD 0: ${d2.dotted_p}`)
    d2.dotted_p = 1
    // d2 is disconnected
    chai.assert(d2.dotted_p === 1, `BAD 1: ${d2.dotted_p}`)
    eYo.Test.input_length(d1.target_b, 1, `MISSED M4T 3`)
    d2.holder_s.connect(d3)
    eYo.Test.brick(d2, 'dotted_name')
    d1.target_b.connectLast(d2)
    chai.assert(d1.target_s.unwrappedTarget === d2, 'MISSED CONNECTION 2')
    eYo.Test.input_length(d1.target_b, 3, `MISSED M4T 4`)
    chai.assert(d2.holder_b === d3, `UW ${d2.holder_b.toString} === ${d3.toString}`)
    chai.assert(d1.target_s.unwrappedTarget === d2, 'MISSED CONNECTION 2')
    eYo.Test.input_length(d1.target_b, 3, `MISSED M4T 5`)
    d1.dispose()
    eYo.Test.tearItDown()
  })
})

describe('One brick: annotated_stmt', function() {
  it('target', function() {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('annotated_stmt')
    chai.assert(d1.operator_p === '=', `MISSED ${d1.operator_p}`)
    var d2 = eYo.Test.new_brick('x')
    d1.target_b.connectLast(d2)
    eYo.Test.input_length(d1.target_b, 1, `1`)
    d1.annotated_p = 'fou+bar'
    chai.assert(d1.annotated_p === 'fou+bar', 'MISSED ANNOTATION')
    chai.assert(d1.annotated_s.bindField.visible_, 'UNEXPECTED HIDDEN')
    chai.assert(d1.annotated_s.bindField.text === 'fou+bar', 'MISSED VALUE')
    eYo.Test.code(d1, 'x:fou+bar')
    var d3 =  eYo.Test.new_brick(`<x eyo="a_expr" operator="+" xmlns="urn:edython:0.2" xmlns: eyo="urn:edython:0.2"><x eyo="identifier" name="abc" slot="lhs"></x><x eyo="identifier" name="bcd" slot="rhs"></x></x>`)
    eYo.Test.code(d3, 'abc + bcd')
    d1.annotated_s.connect(d3)
    chai.assert(d1.annotated_b === d3, 'MISSED M4T')
    chai.assert(!d1.annotated_s.bindField.visible_, 'UNEXPECTED VISIBLE')
    eYo.Test.code(d1, 'x: abc + bcd')
    d1.dispose()
    eYo.Test.tearItDown()
  })
})

describe('One brick: annotated_assignment_stmt', function() {
  it ('target is annotated', function () {
    eYo.Test.setItUp()
    var d_main = eYo.Test.new_brick('assignment_stmt')
    var annotated = eYo.Test.new_brick({
      type: eYo.T3.Expr.primary,
      target_p: 'x',
      annotated_p: 'str'
    })
    eYo.Test.list_connect(d_main, 'target', annotated)
    eYo.Test.brick(d_main, 'annotated_assignment_stmt')
    annotated.dispose()
    eYo.Test.brick(d_main, 'assignment_stmt')
    d_main.dispose()
    eYo.Test.tearItDown()
  })
  it('target', function() {
    eYo.Test.setItUp()
    var d_main = eYo.Test.new_brick('annotated_assignment_stmt')
    chai.assert(d_main.operator_p === '=', `MISSED ${d_main.operator_p}`)
    eYo.Test.code(d_main, '<MISSING NAME>:<MISSING EXPRESSION>=<MISSING EXPRESSION>')
    var d2 = eYo.Test.new_brick('x')
    chai.assert(d2.target_p === 'x', 'MISSED 1')
    d_main.target_b.connectLast(d2)
    eYo.Test.input_length(d_main.target_b, 1, `MISSED M4T 1`)
    d_main.annotated_p = 'fou + bar'
    chai.assert(d_main.annotated_p === 'fou + bar', 'MISSED ANNOTATION')
    chai.assert(d_main.annotated_s.bindField.visible_, 'UNEXPECTED HIDDEN')
    chai.assert(d_main.annotated_s.bindField.text === 'fou + bar', 'MISSED VALUE')
    console.error(d_main.annotated_s)
    eYo.Test.code(d_main, 'x: fou + bar = <MISSING EXPRESSION>')
    d2.target_p = 'xxx'
    chai.assert(d2.target_p === 'xxx', 'MISSED 2')
    eYo.Test.code(d_main, 'xxx: fou + bar = <MISSING EXPRESSION>')
    var d3 =  eYo.Test.new_brick(`<x eyo="a_expr" operator="+" xmlns="urn:edython:0.2" xmlns: eyo="urn:edython:0.2"><x eyo="identifier" name="abc" slot="lhs"></x><x eyo="identifier" name="bcd" slot="rhs"></x></x>`)
    eYo.Test.code(d3, 'abc + bcd')
    d_main.annotated_s.connect(d3)
    chai.assert(d_main.annotated_b === d3, 'MISSED M4T')
    chai.assert(!d_main.annotated_s.bindField.visible_, 'UNEXPECTED VISIBLE')
    eYo.Test.code(d_main, 'xxx: abc + bcd=<MISSING EXPRESSION>')
    // then replace the target brick with an annotated identifier
    d3 = eYo.Test.new_brick('Z')
    d3.variant_p = eYo.Key.ANNOTATED
    d3.annotated_p = 'abcd + cdef'
    eYo.Test.code(d3, 'Z: abcd + cdef')
    eYo.Test.brick(d3, 'identifier_annotated')
    // it's a unique target
    chai.assert(d_main.target_b.slotAtHead.connect(d3), 'MISSED M4T 4')
    eYo.Test.brick(d_main, 'annotated_assignment_stmt')
    eYo.Test.input_length(d_main.target_b, 1, `MISSED M4T 5`)
    var b3k = d_main.target_s.unwrappedTarget
    chai.assert(b3k === d3, 'MISSED M4T 7')
    console.error(d_main.toLinearString)
    eYo.Test.code(d3, 'xxx: abcd + cdef')
    d3.dispose() // orphan recovery: the old d2 brick has been reconnected into d3
    eYo.Test.brick(d_main, 'assignment_stmt')
    eYo.Test.code(d_main, '<MISSING NAME>=<MISSING EXPRESSION>')
    d_main.dispose()
    eYo.Test.tearItDown()
  })
})

describe('XML representation', function() {
  var f = (t, k, do_it) => {
    it(`basic ${t}+${k}`, function() {
      eYo.Test.setItUp()
      var d = eYo.Test.new_brick(t)
      do_it && (do_it(d))
      var dom = eYo.Xml.brickToDom(d)
      // console.log(dom)
      chai.assert(dom.tagName.toLowerCase() === 's')
      chai.assert(dom.getAttribute(eYo.Key.EYO) === k)
      d.dispose()
      eYo.Test.tearItDown()
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
      eYo.Test.setItUp()
      var d = eYo.Test.new_brick(t)
      var dd = eYo.Test.new_brick('identifier')
      chai.assert(d.value_b.connectLast(dd))
      var dom = eYo.Xml.brickToDom(d)
      // console.log(dom)
      chai.assert(dom.tagName.toLowerCase() === 's')
      dd = eYo.Test.new_brick(dom)
      eYo.Test.variant(d, dd.variant_p)
      eYo.Test.code(d, dd.toString)
      d.dispose()
      dd.dispose()
      eYo.Test.tearItDown()
    })
  }
  f('expression_stmt')
  f('assignment_stmt')
})

describe('Copy/Paste with data test', function() {
  var f = (t, do_it, test) => {
    it(`basic ${t}`, function() {
      eYo.Test.setItUp()
      var d = eYo.Test.new_brick(t)
      do_it && (do_it(d))
      var dom = eYo.Xml.brickToDom(d)
      chai.assert(dom.tagName.toLowerCase() === 's')
      console.error(t, dom)
      var dd = eYo.Test.new_brick(dom)
      eYo.Test.variant(d, dd.variant_p)
      eYo.Test.code(d, dd.toLinearString)
      test && (test(d, dd))
      d.dispose()
      dd.dispose()
      eYo.Test.tearItDown()
    })
  }
  // f('expression_stmt')
  // f('assignment_stmt', d => {
  //   d.operator_p = '**='
  // }, (d, dd) => {
  //   chai.assert(d.operator_p === '**=')
  // })
  f('annotated_stmt', d => {
    d.annotated_p = 'ANNOTATED'
  }, (d, dd) => {
    chai.assert(d.annotated_p === 'ANNOTATED')
  })
  // f('annotated_assignment_stmt')
  // f('augmented_assignment_stmt', d => {
  //   d.operator_p = '**='
  // }, (d, dd) => {
  //   chai.assert(d.operator_p === '**=')
  // })
})

describe('Initalize with model', function() {
  it(`basic model`, function() {
    eYo.Test.setItUp()
    var d = eYo.Test.new_brick({
      type: eYo.T3.Stmt.augmented_assignment_stmt,
      operator_p: '+='
    })
    chai.assert(d.operator_p === '+=', `MISSED '${d.operator_p}' === '+='`)
    d.dispose()
    eYo.Test.tearItDown()
  })
})

describe('Initalize augmented_assignment_stmt', function() {
  eYo.Brick.Mgr.getModel(eYo.T3.Expr.augmented_stmt)
  it(`basic augmented_assignment_stmt`, function() {
    eYo.Test.setItUp()
    var d = eYo.Test.new_brick(eYo.T3.Stmt.augmented_assignment_stmt)
    eYo.Test.data_value(d, 'operator', '+=')
    d.dispose()
    eYo.Test.tearItDown()
  })
})

describe('Check: assignment_stmt target', function() {
  it('check target', function() {
    eYo.Test.setItUp()
    eYo.Test.tearItDown()
  })
})

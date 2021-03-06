var assert = chai.assert
var expect = chai.expect

describe('Primary', function() {
  it('types', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    var ctor = b.constructor
    b.dispose()
    var f = (k1, k2) => {
      var t1 = eYo.T3.Expr[k1]
      assert(t1, `UNKNOWN ${k1}`)
      var t2 = eYo.T3.Expr[k2 || k1]
      assert(t2, `UNKNOWN ${k2}`)
      var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, t1)
      assert(b, `MISSING ${t1}`)
      assert(b.constructor === ctor, `MISSED CTOR ${b.constructor.key}`)
      assert(b.type === t2, `MISSED TYPE ${b.type} === ${t2}`)
      b.dispose()
    }
    f('identifier')
    f('identifier_annotated')
    f('key_datum', 'identifier_annotated')
    f('identifier_defined', 'assignment_expr')
    f('keyword_item', 'assignment_expr')
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
    f('assignment_expr')
  })
})

describe('Primary(Compatibility)', function() {
  it('0.2.0', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    var rhs = 'rhs'
    b.eyo.definition_p = rhs
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    f = t => {
      dom.setAttribute(eYo.Key.EYO, t)
      var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
      assert(b2.type === eYo.T3.Expr.assignment_expr)
      assert(b2.eyo.definition_p === rhs, `MISSED ${b2.eyo.definition_p} === ${rhs}`)
      b2.dispose()
    }
    f('identifier_defined')
    f('keyword_item')
    f('assignment_expr')
  })
})

describe('Primary(value_list)', function() {
  it('void unwrapped', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.value_list)
    assert(b, 'MISSED')
    assert(b.inputList.length === 1)
    var check = b.inputList[0].connection.check_
    assert(expect(check).to.be.an('array'), 'BAD 1')
    var model = b.eyo.consolidator.model
    var check = b.inputList[0].connection.check_
    // expect(model).to.have.all.keys('unique', 'all', 'check')
    assert(expect(check).equal(model.all()), `MISMATCH 1`)
    assert(expect(check).not.equal(model.check()), `MISMATCH 2`)
    assert(expect(check).not.equal(model.unique()), `MISMATCH 3`)
    assert(expect(model.all()).contains(eYo.T3.Expr.assignment_expr), `MISMATCH 4`)
    b.dispose()
  })
  it('void wrapped', function() {
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    assert(bb, 'MISSED')
    var b = bb.eyo.definition_t
    assert(b.inputList.length === 1)
    var model = b.eyo.consolidator.model
    var check = b.inputList[0].connection.check_
    assert(expect(check).to.equal(model.all()),`MISMATCH 1`)
    assert(expect(check).to.not.equal(model.check()),`MISMATCH 2`)
    assert(expect(check).to.not.equal(model.unique()),`MISMATCH 3`)
    bb.dispose()
  })
  it('non void wrapped', function() {
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    assert(bb, 'MISSED')
    var b = bb.eyo.definition_t
    b.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a'))
    assert(b.inputList.length === 3)
    var model = b.eyo.consolidator.model
    var check = b.inputList[0].connection.check_
    assert(expect(check).to.equal(model.check()), `MISMATCH 01`)
    assert(expect(check).to.not.equal(model.all()), `MISMATCH 02`)
    assert(expect(check).to.not.equal(model.unique()), `MISMATCH 03`)
    check = b.inputList[1].connection.check_
    assert(expect(check).to.equal(model.all()), `MISMATCH 11`)
    assert(expect(check).to.not.equal(model.check()), `MISMATCH 12`)
    assert(expect(check).to.not.equal(model.unique()), `MISMATCH 13`)
    check = b.inputList[2].connection.check_
    assert(expect(check).to.equal(model.check()), `MISMATCH 21`)
    assert(expect(check).to.not.equal(model.all()), `MISMATCH 22`)
    assert(expect(check).to.not.equal(model.unique()), `MISMATCH 23`)
    bb.dispose()
  })
  it('non void (=) wrapped', function() {
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    assert(bb, 'MISSED')
    var b = bb.eyo.definition_t
    b.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined))
    assert(b.inputList.length === 1)
    var model = b.eyo.consolidator.model
    var check = b.inputList[0].connection.check_
    assert(expect(check).to.equal(model.all()), `MISMATCH 01`)
    assert(expect(check).to.not.equal(model.check()), `MISMATCH 02`)
    assert(expect(check).to.not.equal(model.unique()), `MISMATCH 03`)
    bb.dispose()
  })
})

describe('Primary(Defined)', function() {
  it('basic', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    // b.moveBy(20, 20)
    b.dispose()
  })
  it('rhs data', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    var rhs = 'rhs'
    b.eyo.definition_p = rhs
    assert(b.eyo.definition_p === rhs, `MISSED ${b.eyo.definition_p} === ${rhs}`)
    // b.moveBy(20, 20)
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    assert(b.eyo.definition_p === rhs, `MISSED ${b.eyo.definition_p} === ${rhs}`)
    b.dispose()
  })
  it('… = rhs', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    var rhs = 'rhs'
    b.eyo.definition_t.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs))
    var u = b.eyo.definition_s.unwrappedTarget
    assert(u.name_p === rhs, `MISSED ${u.name_p} === ${rhs}`)
    // b.moveBy(20, 20)
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    u = b.eyo.definition_s.unwrappedTarget
    assert(u.name_p === rhs, `MISSED ${u.name_p} === ${rhs}`)
    b.dispose()
  })
  it('… = a, b', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    var rhs_a = 'a'
    b.eyo.definition_t.eyo.lastInput.eyo.connect
    (eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_a))
    var rhs_b = 'b'
    b.eyo.definition_t.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_b))
    var u = b.eyo.definition_s.unwrappedTarget
    assert(u.name_p === rhs_a, `MISSED ${u.name_p} === ${rhs_a}`)
    // b.moveBy(20, 20)
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    u = b.eyo.definition_s.unwrappedTarget
    assert(u.name_p === rhs_a, `MISSED ${u.name_p} === ${rhs_a}`)
    assert(b.eyo.definition_t.inputList.length === 5, `BAD ${b.eyo.definition_t.inputList.length} === ${5}`)
    var name = b.eyo.definition_t.inputList[3].connection.targetBlock().eyo.name_p
    assert(name = rhs_b, `MISSED ${name} = ${rhs_b}`)
    b.dispose()
  })
  it('… = (… = …)', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    var rhs_a = 'a'
    assert(b.eyo.definition_t.eyo.lastInput.eyo.connect
    (eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_a)), 'BAD 1')
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    eYo.STOP = 0
    assert(bb.eyo.definition_t.eyo.lastInput.eyo.connect(b), 'BAD 2')
    assert(bb.eyo.definition_s.unwrappedTarget === b.eyo, `BAD 3 ${bb.eyo.definition_s.unwrappedTarget} === ${b.eyo}`)
    assert(b.type === eYo.T3.Expr.assignment_expr, `MISSED 1: ${b.type} === ${eYo.T3.Expr.assignment_expr}`)
    assert(bb.type === eYo.T3.Expr.assignment_expr, `MISSED 2: ${bb.type} === ${eYo.T3.Expr.assignment_expr}`)
    bb.dispose()
    b.dispose()
  })
  it('… = (… = …)', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    var rhs_a = 'a'
    assert(b.eyo.definition_t.eyo.lastInput.eyo.connect
    (eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_a)), 'BAD 1')
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.assignment_stmt)
    assert(bb.eyo.value_t.eyo.lastInput.eyo.connect(b), 'BAD 2')
    assert(b.type === eYo.T3.Expr.assignment_expr, `MISSED 1: ${b.type} === ${eYo.T3.Expr.assignment_expr}`)
    assert(bb.type === eYo.T3.Stmt.assignment_stmt, `MISSED 2: ${bb.type} === ${eYo.T3.Stmt.assignment_stmt}`)
    bb.dispose()
  })
})

describe('Primary(Assignment)', function() {
  it('basic', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    assert(b.type === eYo.T3.Expr.assignment_expr, `MISSED TYPE ${b.type} === ${eYo.T3.Expr.assignment_expr}`)
    // targets is a promise
    assert(!b.eyo.targets_t, 'UNEXPECTED TARGETS')
    assert(!b.eyo.definition_d.isIncog(), 'UNEXPECTED INCOG')
    b.eyo.variant_p = eYo.Key.TARGETS_DEFINED
    assert(!b.eyo.definition_d.isIncog(), 'UNEXPECTED INCOG (2)')
    var f = (k, b1 = b) => {
      assert(b1.type === eYo.T3.Expr[k], `MISSED TYPE ${b1.type} === ${eYo.T3.Expr[k]}`)
    }
    f('assignment_expr')
    var t = b.eyo.targets_t
    assert(t, 'MISSING TARGETS')
    t.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a'))
    f('assignment_expr')
    t.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'b'))
    f('assignment_expr')
    var dom = eYo.Xml.blockToDom(b)
    // console.log(dom)
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    f('assignment_expr', b2)
    b2.moveBy(50, 10)
    b.dispose(true)
    b2.dispose(true)
  })
  it('f(… = …)', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
     var f = (k, b1 = b) => {
      assert(b1.type === eYo.T3.Expr[k], `MISSED TYPE ${b1.type} === ${eYo.T3.Expr[k]}`)
    }
    f('assignment_expr')
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.call_expr)
    var t = bb.eyo.n_ary_t
    assert(t.eyo.lastInput.eyo.connect(b), 'BAD')
    f('identifier_defined')
    bb.dispose(true)
  })
  it('xfer name <-> targets', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    b.eyo.variant_p = eYo.Key.TARGETS_DEFINED
    var t = b.eyo.targets_t
    var a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a')
    t.eyo.lastInput.eyo.connect(a)
    assert(!b.eyo.name_t, 'UNEXPECTED NAME')
    b.eyo.variant_p = eYo.Key.NONE
    assert(b.eyo.name_t === a, `MISSING ${b.eyo.name_t} === ${a}`)
    b.eyo.variant_p = eYo.Key.TARGETS_DEFINED
    assert(!b.eyo.name_t, 'UNEXPECTED NAME')
    b.dispose()
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a')
    b.eyo.name_s.connect(a)
    assert(b.eyo.name_t === a, `MISSING ${b.eyo.name_t} === ${a}`)
    b.eyo.variant_p = eYo.Key.TARGETS_DEFINED
    assert(!b.eyo.name_t, 'UNEXPECTED NAME')
    b.eyo.variant_p = eYo.Key.NONE
    assert(b.eyo.name_t === a, `MISSING ${b.eyo.name_t} === ${a}`)
    b.dispose()
  })
  it('…=(…=…) unique value', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    var a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    assert(b.eyo.definition_t.eyo.lastInput.eyo.connect(a), 'MISSED 1')
    assert(b.eyo.definition_t.inputList.length === 1, 'BAD 1')
    assert(expect(a.eyo).equals(b.eyo.definition_s.unwrappedTarget), 'BAD 2')
    b.dispose()
  })
  it('b=rhs (dom)', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    b.eyo.variant_p = eYo.Key.TARGETS_DEFINED
    var s = b.eyo.definition_s
    var a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'rhs')
    assert(b.eyo.definition_t.eyo.lastInput.eyo.connect(a), 'MISSED 1')
    assert(s.unwrappedTarget === a.eyo, `MISSED ${s.unwrappedTarget} === ${a.eyo}`)
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    assert(b, `MISSING ${dom}`)
    assert(b.eyo.variant_p === eYo.Key.TARGETS_DEFINED, `MISSED ${b.eyo.variant_p} === ${eYo.Key.TARGETS_DEFINED}`)
    var u = b.eyo.definition_s.unwrappedTarget
    assert(u, 'MISSED value')
    assert(u.type === eYo.T3.Expr.identifier, `MISSED type: ${u.type} === ${eYo.T3.Expr.identifier}`)
    b.dispose()
  })
})

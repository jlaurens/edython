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
    f('identifier_defined', 'assignment_chain')
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
    f('assignment_chain')
  })
})

describe('Primary(Compatibility)', function() {
  it('0.2.0', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    assert(b.type === eYo.T3.Expr.assignment_chain, `BAD TYPE 1: ${b.type} === ${eYo.T3.Expr.assignment_chain}`)
    var rhs = 'rhs'
    b.eyo.value_p = rhs
    assert(b.eyo.value_p === rhs, `BAD ${b.eyo.value_p} === ${rhs}`)
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    console.error(dom)
    f = (t, expected) => {
      dom.setAttribute(eYo.Key.EYO, t)
      expected = eYo.T3.Expr[expected] || eYo.T3.Expr.assignment_chain
      var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
      assert(b2.type === expected, `BAD TYPE (${t}): ${b2.type} === ${expected}`)
      assert(b2.eyo.value_s, `MISSING DEFINITION SLOT ${t}`)
      assert(!b2.eyo.value_s.isIncog(), `UNEXPECTED INCOG ${t}`)
      assert(b2.eyo.value_p === rhs, `MISSED ${b2.eyo.value_p} === ${rhs}`)
      b2.dispose()
    }
    f('identifier_defined')
    f('assignment_chain')
    f('assignment_expr', 'assignment_expr')
  })
})

describe('Primary(value_list)', function() {
  // it('basic', function() {
  //   var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.value_list)
  //   assert(b, 'MISSED')
  //   b.dispose()
  // })
  // it('void unwrapped', function() {
  //   var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.value_list)
  //   assert(b, 'MISSED')
  //   assert(b.inputList.length === 1)
  //   var check = b.inputList[0].connection.check_
  //   assert(expect(check).to.be.an('array'), 'BAD 1')
  //   var model = b.eyo.consolidator.model
  //   var check = b.inputList[0].connection.check_
  //   // expect(model).to.have.all.keys('unique', 'all', 'check')
  //   assert(expect(check).equal(model.all()), `MISMATCH 1`)
  //   assert(expect(check).not.equal(model.check()), `MISMATCH 2`)
  //   assert(expect(check).not.equal(model.unique()), `MISMATCH 3`)
  //   assert(expect(model.all()).contains(eYo.T3.Expr.assignment_chain), `MISMATCH 4`)
  //   b.dispose()
  // })
  it('void wrapped', function() {
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    assert(bb, `MISSED ${eYo.T3.Expr.identifier_defined}`)
    assert(bb.eyo.constructor.eyo.key === 'primary', `UNEXPECTED CTOR ${bb.eyo.constructor.eyo.key} !== primary`)
    var b = bb.eyo.value_t
    assert(b, 'MISSING DEFINITION TARGET')
    assert(b.inputList.length === 1, 'BAD INPUT COUNT')
    var model = b.eyo.consolidator.model
    var check = b.inputList[0].connection.check_
    assert(b.type === eYo.T3.Expr.assignment_value_list)
    assert(b.eyo.subtype === eYo.T3.Expr.assignment_chain, `${b.eyo.subtype} === ${eYo.T3.Expr.assignment_chain}`)
    assert(expect(check).to.equal(model.all(b.type, b.eyo.subtype)),`MISMATCH 1`)
    assert(expect(check).to.not.equal(model.check(b.type, b.eyo.subtype)),`MISMATCH 2`)
    assert(expect(check).to.not.equal(model.unique(b.type, b.eyo.subtype)),`MISMATCH 3`)
    bb.dispose()
  })
  // it('non void wrapped', function() {
  //   var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
  //   assert(bb, 'MISSED')
  //   var b = bb.eyo.value_t
  //   b.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a'))
  //   assert(b.inputList.length === 3)
  //   var model = b.eyo.consolidator.model
  //   var check = b.inputList[0].connection.check_
  //   assert(expect(check).to.equal(model.check()), `MISMATCH 01`)
  //   assert(expect(check).to.not.equal(model.all()), `MISMATCH 02`)
  //   assert(expect(check).to.not.equal(model.unique()), `MISMATCH 03`)
  //   check = b.inputList[1].connection.check_
  //   assert(expect(check).to.equal(model.all()), `MISMATCH 11`)
  //   assert(expect(check).to.not.equal(model.check()), `MISMATCH 12`)
  //   assert(expect(check).to.not.equal(model.unique()), `MISMATCH 13`)
  //   check = b.inputList[2].connection.check_
  //   assert(expect(check).to.equal(model.check()), `MISMATCH 21`)
  //   assert(expect(check).to.not.equal(model.all()), `MISMATCH 22`)
  //   assert(expect(check).to.not.equal(model.unique()), `MISMATCH 23`)
  //   bb.dispose()
  // })
  // it('non void (=) wrapped', function() {
  //   var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
  //   assert(bb, 'MISSED')
  //   var b = bb.eyo.value_t
  //   b.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined))
  //   assert(b.inputList.length === 1)
  //   var model = b.eyo.consolidator.model
  //   var check = b.inputList[0].connection.check_
  //   assert(expect(check).to.equal(model.all()), `MISMATCH 01`)
  //   assert(expect(check).to.not.equal(model.check()), `MISMATCH 02`)
  //   assert(expect(check).to.not.equal(model.unique()), `MISMATCH 03`)
  //   bb.dispose()
  // })
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
    b.eyo.value_p = rhs
    assert(b.eyo.value_p === rhs, `MISSED ${b.eyo.value_p} === ${rhs}`)
    // b.moveBy(20, 20)
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    assert(b.eyo.value_p === rhs, `MISSED ${b.eyo.value_p} === ${rhs}`)
    b.dispose()
  })
  it('… = rhs', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    var rhs = 'rhs'
    b.eyo.value_t.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs))
    var u = b.eyo.value_s.unwrappedTarget
    assert(u.name_p === rhs, `MISSED ${u.name_p} === ${rhs}`)
    // b.moveBy(20, 20)
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    u = b.eyo.value_s.unwrappedTarget
    assert(u.name_p === rhs, `MISSED ${u.name_p} === ${rhs}`)
    b.dispose()
  })
  it('… = a, b', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    var rhs_a = 'a'
    b.eyo.value_t.eyo.lastInput.eyo.connect
    (eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_a))
    var rhs_b = 'b'
    b.eyo.value_t.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_b))
    var u = b.eyo.value_s.unwrappedTarget
    assert(u.name_p === rhs_a, `MISSED ${u.name_p} === ${rhs_a}`)
    // b.moveBy(20, 20)
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    u = b.eyo.value_s.unwrappedTarget
    assert(u.name_p === rhs_a, `MISSED ${u.name_p} === ${rhs_a}`)
    assert(b.eyo.value_t.inputList.length === 5, `BAD ${b.eyo.value_t.inputList.length} === ${5}`)
    var name = b.eyo.value_t.inputList[3].connection.targetBlock().eyo.name_p
    assert(name = rhs_b, `MISSED ${name} = ${rhs_b}`)
    b.dispose()
  })
  it('… = (… = …)', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    var rhs_a = 'a'
    assert(b.eyo.value_t.eyo.lastInput.eyo.connect
    (eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_a)), 'BAD 1')
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    eYo.STOP = 0
    assert(bb.eyo.value_t.eyo.lastInput.eyo.connect(b), 'BAD 2')
    assert(bb.eyo.value_s.unwrappedTarget === b.eyo, `BAD 3 ${bb.eyo.value_s.unwrappedTarget} === ${b.eyo}`)
    assert(b.type === eYo.T3.Expr.assignment_chain, `MISSED 1: ${b.type} === ${eYo.T3.Expr.assignment_chain}`)
    assert(bb.type === eYo.T3.Expr.assignment_chain, `MISSED 2: ${bb.type} === ${eYo.T3.Expr.assignment_chain}`)
    bb.dispose()
    b.dispose()
  })
  it('… = (… = …)', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    var rhs_a = 'a'
    assert(b.eyo.value_t.eyo.lastInput.eyo.connect
    (eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_a)), 'BAD 1')
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.assignment_stmt)
    assert(bb.eyo.value_t, 'MISSING value_t')
    assert(bb.eyo.value_t.eyo.lastInput.eyo.connect(b), 'BAD 2')
    assert(b.type === eYo.T3.Expr.assignment_chain, `MISSED 1: ${b.type} === ${eYo.T3.Expr.assignment_chain}`)
    assert(bb.type === eYo.T3.Stmt.assignment_stmt, `MISSED 2: ${bb.type} === ${eYo.T3.Stmt.assignment_stmt}`)
    bb.dispose()
  })
})

describe('Primary(Assignment)', function() {
  it('basic', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    assert(b.type === eYo.T3.Expr.assignment_chain, `MISSED TYPE ${b.type} === ${eYo.T3.Expr.assignment_chain}`)
    // targets is a promise
    assert(!b.eyo.targets_t, 'UNEXPECTED TARGETS')
    assert(!b.eyo.value_d.isIncog(), 'UNEXPECTED INCOG')
    b.eyo.variant_p = eYo.Key.TARGET
    assert(!b.eyo.value_d.isIncog(), 'UNEXPECTED INCOG (2)')
    var f = (k, b1 = b) => {
      assert(b1.type === eYo.T3.Expr[k], `MISSED TYPE ${b1.type} === ${eYo.T3.Expr[k]}`)
    }
    f('assignment_chain')
    var t = b.eyo.targets_t
    assert(t, 'MISSING TARGETS')
    t.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a'))
    f('assignment_chain')
    t.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'b'))
    f('assignment_chain')
    var dom = eYo.Xml.blockToDom(b)
    // console.log(dom)
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    f('assignment_chain', b2)
    b2.moveBy(50, 10)
    b.dispose(true)
    b2.dispose(true)
  })
  it('f(… = …)', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
     var f = (k, b1 = b) => {
      assert(b1.type === eYo.T3.Expr[k], `MISSED TYPE ${b1.type} === ${eYo.T3.Expr[k]}`)
    }
    f('assignment_chain')
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.call_expr)
    var t = bb.eyo.n_ary_t
    assert(t.eyo.lastInput.eyo.connect(b), 'BAD')
    f('identifier_defined')
    bb.dispose(true)
  })
  it('xfer name <-> targets', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    b.eyo.variant_p = eYo.Key.TARGET
    var t = b.eyo.targets_t
    var a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a')
    t.eyo.lastInput.eyo.connect(a)
    assert(!b.eyo.name_t, 'UNEXPECTED NAME')
    b.eyo.variant_p = eYo.Key.NONE
    assert(b.eyo.name_t === a, `MISSING ${b.eyo.name_t} === ${a}`)
    b.eyo.variant_p = eYo.Key.TARGET
    assert(!b.eyo.name_t, 'UNEXPECTED NAME')
    b.dispose()
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a')
    b.eyo.name_s.connect(a)
    assert(b.eyo.name_t === a, `MISSING ${b.eyo.name_t} === ${a}`)
    b.eyo.variant_p = eYo.Key.TARGET
    assert(!b.eyo.name_t, 'UNEXPECTED NAME')
    b.eyo.variant_p = eYo.Key.NONE
    assert(b.eyo.name_t === a, `MISSING ${b.eyo.name_t} === ${a}`)
    b.dispose()
  })
  it('…=(…=…) unique value', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    var a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    assert(b.eyo.value_t.eyo.lastInput.eyo.connect(a), 'MISSED 1')
    assert(b.eyo.value_t.inputList.length === 1, 'BAD 1')
    assert(expect(a.eyo).equals(b.eyo.value_s.unwrappedTarget), 'BAD 2')
    b.dispose()
  })
  it('b=rhs (dom)', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_defined)
    b.eyo.variant_p = eYo.Key.TARGET
    var s = b.eyo.value_s
    var a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'rhs')
    assert(b.eyo.value_t.eyo.lastInput.eyo.connect(a), 'MISSED 1')
    assert(s.unwrappedTarget === a.eyo, `MISSED ${s.unwrappedTarget} === ${a.eyo}`)
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    assert(b, `MISSING ${dom}`)
    assert(b.eyo.variant_p === eYo.Key.TARGET, `MISSED ${b.eyo.variant_p} === ${eYo.Key.TARGET}`)
    var u = b.eyo.value_s.unwrappedTarget
    assert(u, 'MISSED value')
    assert(u.type === eYo.T3.Expr.identifier, `MISSED type: ${u.type} === ${eYo.T3.Expr.identifier}`)
    b.dispose()
  })
})

describe('Primary(Expression Assignment)', function() {
  it('basic', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.assignment_expr)
    assert(b.eyo.variant_p === eYo.Key.COL_VALUED, `FAIL VARIANT ${b.eyo.variant_p} === ${eYo.Key.COL_VALUED}`)
    assert(b.eyo.value_s.fields.label.getValue() === ':=')
    b.dispose()
  })
})

describe('Primary(annotated)', function() {
  it('basic', function() {
    var f = t => {
      var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr[t])
      assert(b, `MISSED ${eYo.T3.Expr[t]}`)
      assert(b.type === eYo.T3.Expr.identifier_annotated, `MISSED ${eYo.T3.Expr[t]} === eYo.T3.Expr.identifier_annotated`)
      assert(b.eyo.variant_p === eYo.Key.ANNOTATED, `FAIL VARIANT ${b.eyo.variant_p} === ${eYo.Key.ANNOTATED}`)
      b.dispose()
    }
    f('identifier_annotated')
    f('augtarget_annotated')
    f('key_datum')
  })
  it('basic', function() {
    var f = (t, bb, ttt) => {
      var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr[t])
      assert(b, `MISSED ${eYo.T3.Expr[t]}`)
      assert(b.eyo.variant_p === eYo.Key.ANNOTATED, `FAIL VARIANT ${b.eyo.variant_p} === ${eYo.Key.ANNOTATED}`)
      b.eyo.name_s.connect(bb)
      assert(b.eyo.name_t === bb, `MISSED CONNECTION`)
      assert(b.type === eYo.T3.Expr[ttt || t], `MISSED ${b.type} === ${eYo.T3.Expr[ttt || t]} (${ttt || t})`)
      b.dispose()
    }
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    assert(bb, `MISSED ${eYo.T3.Expr.identifier}`)
    f('identifier_annotated', bb, 'identifier_annotated')
    bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    assert(bb, `MISSED ${eYo.T3.Expr.identifier}`)
    f('augtarget_annotated', bb, 'identifier_annotated')
    bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    assert(bb, `MISSED ${eYo.T3.Expr.identifier}`)
    f('key_datum', bb, 'identifier_annotated')
    bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    assert(bb, `MISSED ${eYo.T3.Expr.identifier}`)
    bb.eyo.name_d.set('y')
    assert(bb.eyo.name_d.get() === 'y', `MISSED NAME 1`)
    assert(bb.eyo.name_p === 'y', `MISSED NAME 2`)
    bb.eyo.dotted_d.set(1)
    assert(bb.eyo.dotted_d.get() === 1, `MISSED DOTTED 1`)
    assert(bb.eyo.dotted_p === 1, `MISSED DOTTED 2`)
    bb.eyo.holder_d.set('x')
    assert(bb.eyo.holder_d.get() === 'x', `MISSED HOLDER 1`)
    assert(bb.eyo.holder_p === 'x', `MISSED HOLDER 2`)
    assert(bb.type === eYo.T3.Expr.dotted_name, `MISSED ${bb.type} === ${eYo.T3.Expr.dotted_name}`)
    assert(eYo.T3.Expr.Check.augtarget.indexOf(bb.type) >= 0, 'MISSED AUGTARGET')
    f('identifier_annotated', bb, 'augtarget_annotated')
    bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 421)
    f('identifier_annotated', bb, 'key_datum')
  })
})

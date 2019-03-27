console.log('RUNNING PRIMARY BLOCK TESTS')

describe('Each Primary block type', function() {
  [
    ['identifier', 'identifier', 'NONE'],
    ['identifier_annotated', 'identifier_annotated', 'ANNOTATED'],
    ['augtarget_annotated', 'identifier_annotated', 'ANNOTATED'],
    ['key_datum', 'identifier_annotated', 'ANNOTATED'],
    ['identifier_valued', 'identifier_valued', 'TARGET_VALUED'],
    ['assignment_chain', 'identifier_valued', 'TARGET_VALUED'],
    ['assignment_expr', 'assignment_expr', 'COL_VALUED'],
    ['identifier_annotated_valued', 'identifier_annotated_valued', 'ANNOTATED_VALUED'],
    ['attributeref', 'parent_module', 'NONE'], // Not yet a 'foo.bar', only a '.'
    ['named_attributeref', 'parent_module', 'NONE'], // Not yet a 'foo.bar', only a '.'
    ['dotted_name', 'parent_module', 'NONE'], // Not yet a 'foo.bar', only a '.'
    ['parent_module', 'parent_module', 'NONE'],
    ['identifier_as', 'identifier_as', 'ALIASED'],
    ['dotted_name_as', 'identifier_as', 'ALIASED'],
    ['expression_as', 'identifier_as', 'ALIASED'],
    ['call_expr', 'named_call_expr', 'CALL_EXPR'],
    ['named_call_expr', 'named_call_expr', 'CALL_EXPR'],
    ['subscription', 'named_subscription', 'SLICING'],
    ['named_subscription', 'named_subscription', 'SLICING'],
    ['slicing', 'named_subscription', 'SLICING'],
    ['named_slicing', 'named_subscription', 'SLICING']
  ].some(Ts => {
    it (`basic type: ${Ts[0]}/${Ts[1]}/${Ts[2]}`, function () {
      var b = eYo.Test.new_block(Ts[0], Ts[1])
      eYo.Test.ctor(b, 'primary')
      eYo.Test.variant(b, Ts[2])
      b.dispose()
    })
  })
})

describe('Primary dom', function() {
  [
    ['identifier', '…'],
    ['identifier_annotated', ':'],
    ['augtarget_annotated', ':'],
    ['key_datum', ':'],
    ['identifier_valued', '='],
    ['assignment_chain', '='],
    ['assignment_expr', ':='],
    ['identifier_annotated_valued', '='],
    ['attributeref', '.'], // Not yet a 'foo.bar', only a '.'
    ['named_attributeref', '.'], // Not yet a 'foo.bar', only a '.'
    ['dotted_name', '.'], // Not yet a 'foo.bar', only a '.'
    ['parent_module', '.'],
    ['identifier_as', '~'],
    ['dotted_name_as', '~'],
    ['expression_as', '~'],
    ['call_expr', '…()'],
    ['named_call_expr', '…()'],
    ['subscription', '…[]'],
    ['slicing', '…[]'],
    ['named_subscription', '…[]'],
    ['named_slicing', '…[]']
  ].some(Ts => {
    it(`Dom eyo attribute ${Ts[1]} -> ${Ts[0]}`, function() {
      var b = eYo.Test.new_block(Ts[0])
      var dom = eYo.Xml.blockToDom(b)
      var attr = dom.getAttribute(eYo.Key.EYO)
      chai.assert(attr === Ts[1], `FAILED ${attr} === ${Ts[1]}`)
      b.dispose()
    })  
  })
})

describe ('XML', function () {
  it ('identifier', function () {
    var dom = `<x eyo="identifier" target="a"></x>`
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    eYo.Test.block(b, 'identifier')
    eYo.Test.code(b, 'a')
    b.dispose()
  })
  it ('…', function () {
    var dom = `<x eyo="…" target="a"></x>`
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    eYo.Test.block(b, 'identifier')
    eYo.Test.code(b, 'a')
    b.dispose()
  })
  it ('data: name -> target', function() {
    var dom = `<x eyo="identifier" name="abc"></x>`
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    eYo.Test.block(b, 'identifier')
    eYo.Test.code(b, 'abc')
    b.dispose()
  })
  it ('slot: targets -> target', function() {
    // var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'abc')
    // var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a')
    // eYo.Test.list_connect(b, 'target', bb)
    // bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'b')
    // eYo.Test.list_connect(b, 'target', bb)
    // bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'c')
    // eYo.Test.list_connect(b, 'target', bb)
    // console.error(eYo.Xml.blockToDom(b).outerHTML)
    // b.dispose()
    var dom = `<x eyo="…"><x eyo="list" slot="targets"><x eyo="…" slot="O" target="a"></x><x eyo="…" slot="f" target="b"></x><x eyo="…" slot="r" target="c"></x></x></x>`
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    eYo.Test.block(b, 'assignment_chain')
    eYo.Test.code(b, 'a,b,c=MISSINGEXPRESSION')
    b.dispose()
  })
})

/*
 */
describe('Copy/Paste', function() {
  [
    'identifier',
    'identifier_annotated',
    'augtarget_annotated',
    'key_datum',
    'identifier_valued',
    'assignment_chain',
    'assignment_expr',
    'identifier_annotated_valued',
    'attributeref',
    'named_attributeref',
    'dotted_name',
    'parent_module',
    'identifier_as',
    'dotted_name_as',
    'expression_as',
    'call_expr',
    'named_call_expr',
    'subscription',
    'slicing',
    'named_subscription',
    'named_slicing'
  ].some(t => {
    it(`Basic Copy/paste ${t}`, function() {
      var b = eYo.Test.new_block(t)
      var dom = eYo.Xml.blockToDom(b)
      var bb = eYo.DelegateSvg.newBlockReady(b.workspace, dom)
      eYo.Test.same(bb, b)
      bb.dispose()
      b.dispose()
    })  
  })
  var md = eYo.DelegateSvg.Manager.getModel(eYo.T3.Expr.identifier).data
  var f = (k) => {
    var w = {
      holder: ['NONE', ['abc']],
      dotted: ['NONE', [5]],
      target: ['NONE', ['bcd']],
      annotated: ['ANNOTATED', ['str']],
      alias: ['ALIASED', ['Alias']],
      value: ['TARGET_VALUED', ['Value']],
      target: ['NONE', ['Target']],
      ary: ['CALL_EXPR', [1]],
      mandatory: ['CALL_EXPR', [2]]
    }[k]
    var b = eYo.Test.new_block('identifier')
    b.eyo.variant_p = eYo.Key[w[0]]
    eYo.Test.data_key(b, k)
    if (k === 'holder') {
      b.eyo.dotted_p = 1
    }
    w[1].forEach(v => {
      var d = b.eyo.data[k]
      d.set(v)
      var dom = eYo.Xml.blockToDom(b)
      var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
      chai.assert(bb.eyo.data[k].get() === d.get(), `MISSED ${k} data ${bb.eyo.data[k].get()} === ${d.get()}`)
      bb.dispose()
    })
    b.dispose()
  }
  Object.keys(md).forEach(k => {
    if (md[k].xml !== false) {
      it(`Copy/Paste data ${k}`, function () {
        f(k)
      })
    }
  })
})

// don't forget to test creation with a string

describe('Primary variant', function() {
  var Vs = eYo.Delegate.Manager.getModel(eYo.T3.Expr.identifier).data.variant.all
  Vs.some(to => {
    var b = eYo.Test.new_block(eYo.T3.Expr.identifier)
    b.eyo.variant_p = to
    Vs.some(from => {
      it(`${from} -> ${to}`, function() {
        var bb = eYo.Test.new_block(eYo.T3.Expr.identifier)
        bb.eyo.variant_p = from
        bb.eyo.variant_p = to
        eYo.Test.same(bb, b)
        bb.dispose()
      })
    })
    b.dispose()
  })
})

// 
describe('Basic slots incog', function() {
  [
    ['identifier', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['identifier_annotated', 'target', 'Xholder', 'Xdotted', 'annotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['augtarget_annotated', 'target', 'Xholder', 'Xdotted', 'annotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['key_datum', 'target', 'Xholder', 'Xdotted', 'annotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['identifier_valued', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'value', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['assignment_chain', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'value', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['assignment_expr', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'value', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['identifier_annotated_valued', 'target', 'Xholder', 'Xdotted', 'annotated', 'value', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['attributeref', 'target', 'holder', 'dotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['named_attributeref', 'target', 'holder', 'dotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['dotted_name', 'target', 'holder', 'dotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['parent_module', 'target', 'holder', 'dotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['identifier_as', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'alias'],
    ['dotted_name_as', 'target', 'holder', 'dotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'alias'],
    ['expression_as', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'alias'],
    ['call_expr', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'n_ary', 'Xslicing', 'Xalias'],
    ['named_call_expr', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'n_ary', 'Xslicing', 'Xalias'],
    ['named_subscription', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'slicing', 'Xalias'],
    ['subscription', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'slicing', 'Xalias'],
    ['named_slicing', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'slicing', 'Xalias'],
    ['slicing', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'slicing', 'Xalias']
  ].some(Ts => {
    it(`Slots incog status ${Ts[0]}`, function() {
      var b = eYo.Test.new_block(Ts[0])
      eYo.Test.incog(b, Ts)
      b.dispose()
    })  
  })
})
/*
NONE, // identifier alone
        eYo.Key., // foo(…)
        eYo.Key., // foo[…]
        eYo.Key., // foo as bar
        eYo.Key., // foo : bar
        eYo.Key., // foo : bar = …
        eYo.Key.
        */

describe('Basic variants and slot incogs', function() {
  [
    ['NONE', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['CALL_EXPR', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'n_ary', 'Xslicing', 'Xalias'],
    ['SLICING', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'slicing', 'Xalias'],
    ['ALIASED', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'alias'],
    ['ANNOTATED', 'target', 'Xholder', 'Xdotted', 'annotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['ANNOTATED_VALUED', 'target', 'Xholder', 'Xdotted', 'annotated', 'value', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['TARGET_VALUED', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'value', 'Xn_ary', 'Xslicing', 'Xalias'],
    ['COL_VALUED', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'value', 'Xn_ary', 'Xslicing', 'Xalias']
  ].some(Ts => {
    it(`Slots incog status by variant ${Ts[0]}`, function() {
      var b = eYo.Test.new_block('identifier')
      b.eyo.variant_p = eYo.Key[Ts[0]]
      eYo.Test.incog(b, Ts)
      b.dispose()
    })  
  })
})

describe('Copy/Paste by data', function() {
  it('data: dotted', function() {
    var b = eYo.Test.new_block('identifier')
    chai.assert(b.eyo.dotted_p === 0, `BAD DEFAULT DOTTED ${b.eyo.dotted_p}`)
    eYo.Test.incog(b, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    b.eyo.dotted_p = 1
    eYo.Test.incog(b, ['target', 'holder', 'dotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.Test.data_save(b, 'dotted', 0)
    eYo.Test.data_save(b, 'dotted', 1)
    eYo.Test.data_save(b, 'dotted', 2)
    eYo.Test.data_save(b, 'dotted', 3)
    b.dispose()
  })
  it('data: holder', function() {
    var b = eYo.Test.new_block('identifier')
    b.eyo.holder_p = 'TEST'
    eYo.Test.incog(b, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.Test.data_save(b, 'holder', 'TEST2', true)
    b.eyo.dotted_p = 1
    eYo.Test.incog(b, ['target', 'holder', 'dotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.Test.data_save(b, 'holder', 'TEST3')
    eYo.Test.data_save(b, 'holder', '')
    b.dispose()
  })
  var f = (k, variant, values) => {
    it(`data: ${k}`, function() {
      var b = eYo.Test.new_block('identifier')
      eYo.Test.data_save(b, k, values[0], true)
      b.eyo.variant_p = eYo.Key[variant] || variant
      values.forEach(v => {
        eYo.Test.data_save(b, k, v)
      })
      b.dispose()
    })  
  }
  f('alias', 'ALIASED', ['TEST', 'TEST2', ''])
  f('annotated', 'ANNOTATED', ['TEST', 'TEST2', ''])
  f('ary', 'CALL_EXPR', [0, 1, 2, 3, Infinity])
  f('mandatory', 'CALL_EXPR', [0, 1, 2, 3, Infinity])
})

describe('Primary bind fields', function() {
  // depending what you connect, the type may change
  // we do not manage the data content here
  [
    'holder',
    'dotted',
    'target',
    'value',
    'annotated',
    'alias'
  ].forEach(k => {
    it(`bind field: ${k}`, function() {
      eYo.Test.bind_field('identifier', k)
    })  
  })
  ;[
    'n_ary',
    'slicing'
  ].forEach(k => {
    it(`bind field: ${k}`, function() {
      eYo.Test.bind_field('identifier', k, true)
    })  
  })
})

/*
    holder,
    dotted,
    target,
    annotated,
    value,
    n_ary,
    slicing,
    alias
*/
describe('Primary slots', function() {
  this.timeout(5000)
  // depending what you connect, the type may change
  // we do not manage the data content here
  it('Slot: holder/dotted', function() {
    // as long as the dotted_p is 0, holder is ignored
    var main = eYo.Test.new_block('identifier')
    eYo.Test.code(main, 'MISSING NAME')
    var hldr = eYo.Test.new_block('identifier')
    eYo.Test.slot_connect(main, 'holder', hldr)
    eYo.Test.block(hldr, 'identifier')
    eYo.Test.block(main, 'identifier')
    hldr.eyo.target_p = 'a'
    eYo.Test.code(hldr, 'a')
    chai.assert(hldr.eyo.target_p === 'a', 'FAILED')
    chai.assert(hldr.eyo.target_s.fields.bind.getText() === 'a', `SYNCHRONIZE FAILED for target bind field in ${hldr.type}`)
    chai.assert(hldr.eyo.target_s.fields.bind.isVisible(), `INVISIBLE BIND FIELD`)
    main.eyo.target_p = 'b'
    eYo.Test.code(main, 'b')
    main.eyo.dotted_p = 1 // things change here
    eYo.Test.block(main, 'dotted_name')
    eYo.Test.code(main, 'a.b')
    main.eyo.dotted_p = 2
    eYo.Test.code(main, '..b')
    eYo.Test.block(main, 'parent_module')
    eYo.Test.data_key(main, 'target', '')
    eYo.Test.code(main, '..b')
    main.eyo.target_p = ''
    eYo.Test.code(main, '..')
    eYo.Test.block(main, 'parent_module')
    main.eyo.target_p = 'b'
    main.eyo.dotted_p = 1
    eYo.Test.code(main, 'a.b')
    eYo.Test.block(main, 'dotted_name')
    hldr.eyo.variant_p = eYo.Key.CALL_EXPR
    eYo.Test.code(main, 'a().b')
    eYo.Test.block(main, 'attributeref')
    main.dispose()
  })
  it ('Slot target', function () {
    var a = eYo.Test.new_block('identifier')
    a.eyo.target_p = 'a'
    eYo.Test.code(a, 'a')
    var b = eYo.Test.new_block('identifier')
    b.eyo.target_p = 'b'
    eYo.Test.code(b, 'b')
    eYo.Test.list_connect(a, 'target', b)
    eYo.Test.block(a, 'identifier_valued')
    eYo.Test.code(a, 'b=MISSINGEXPRESSION')
    var c = eYo.Test.new_block('identifier')
    c.eyo.target_p = 'c'
    a.eyo.target_b.eyo.lastConnect(c)
    eYo.Test.code(a, 'b,c=MISSINGEXPRESSION')
    b.dispose()
    eYo.Test.code(a, 'c=MISSINGEXPRESSION')
    c.dispose()
    eYo.Test.code(a, 'a=MISSINGEXPRESSION')
    a.dispose()
  })
  it('Slot annotated', function () {
    var a = eYo.Test.new_block('identifier')
    a.eyo.target_p = 'a'
    eYo.Test.code(a, 'a')
    eYo.Test.data_key(a, 'variant', eYo.Key.ANNOTATED)
    a.eyo.variant_p = eYo.Key.ANNOTATED
    eYo.Test.code(a, 'a:MISSINGEXPR')
    a.eyo.annotated_p = 'fal ba la'
    eYo.Test.code(a, 'a:falbala')
    var b = eYo.Test.new_block('a_expr')
    b.eyo.lhs_p = 'lhs'
    b.eyo.rhs_p = 'rhs'
    eYo.Test.code(b, 'lhs+rhs')
    a.eyo.annotated_s.connect(b)
    eYo.Test.code(a, 'a:lhs+rhs')
    b.unplug()
    eYo.Test.code(a, 'a:falbala')
    b.dispose()
    a.dispose()
  })
  ;[
  'assignment_stmt',
  'augmented_assignment_stmt',
  'annotated_assignment_stmt',
  'assignment_chain',
  'identifier_valued',
  'assignment_expr',
  'identifier',
  'identifier_annotated',
  'augtarget_annotated',
  'key_datum',
  'identifier_valued',
  'assignment_chain',
  'assignment_expr',
  'identifier_annotated_valued',
  'attributeref',
  'named_attributeref',
  'dotted_name',
  'parent_module',
  'identifier_as',
  'dotted_name_as',
  'expression_as',
  'subscription',
  'named_subscription',
  'slicing',
  'named_slicing',
  'call_expr',
  'named_call_expr'
  ].forEach(t => {
    it(`value_list checks 1/2: ${t}`, function () {
      var a = eYo.Test.new_block(t)
      var m = a.eyo.value_b.eyo.model.list
      var unique = m.unique(eYo.T3.Expr.value_list, a.type)
      var check = m.check(eYo.T3.Expr.value_list, a.type)
      var all = m.all(eYo.T3.Expr.value_list, a.type)
      if(a.eyo.value_s.isIncog()) {
        chai.assert(unique === null, `MISSING UNIQUE NULL ${a.type}, ${a.subtype}`)
        chai.assert(check === null, `MISSING CHECK NULL ${a.type}, ${a.subtype}`)
        chai.assert(all === null, `MISSING ALL NULL ${a.type}, ${a.subtype}`)
      } else {
        var f = (ra, str) => {
          chai.assert(ra !== undefined, `UNEXPECTED UNDEFINED ${str || ''}: ${a.type}, ${a.subtype}`)
          chai.assert(ra !== null, `UNEXPECTED NULL ${str || ''}: ${a.type}, ${a.subtype}`)
          chai.assert(ra.length !== 0, `MISSING ${str || ''}: ${a.type}, ${a.subtype}`)
        }
        f(unique, 'unique')
        f(check, 'check')
        f(all, 'all')
        chai.assert(chai.expect(a.eyo.value_b.inputList[0].connection.check_).equals(all), `BAD CHECK (0)`)
        chai.assert(chai.expect(goog.array.concat(unique, check)).eql(all), `BAD CHECK (0)`)
        unique.forEach(tt => {
          var b = eYo.Test.new_block(tt)
          if (tt === eYo.T3.Expr.assignment_chain) {
            var c = eYo.Test.new_block(tt)
            c.eyo.variant_p = eYo.Key.SLICING
            chai.assert(b.eyo.target_b.eyo.lastConnect(c), `MISSED TARGET ${tt}`)
          }
          if (b.type === tt) {
            eYo.Test.input_length(a.eyo.value_b, 1)
            chai.assert(a.eyo.value_b.eyo.lastConnect(b), `MISSED VALUE ${tt}`)
            eYo.Test.input_length(a.eyo.value_b, 1)
            b.dispose()
            eYo.Test.input_length(a.eyo.value_b, 1)
          } else {
            // console.error('XO TEST FOR', tt)
            b.dispose()
          }
        })
        check.forEach(tt => {
          var b = eYo.Test.new_block(tt)
          if (tt === eYo.T3.Expr.assignment_chain) {
            var c = eYo.Test.new_block(tt)
            c.eyo.variant_p = eYo.Key.SLICING
            chai.assert(b.eyo.target_b.eyo.lastConnect(c), `MISSED TARGET ${tt}`)
          }
          if (b.type === tt) {
            eYo.Test.input_length(a.eyo.value_b, 1)
            chai.assert(a.eyo.value_b.eyo.lastConnect(b), `MISSED VALUE ${tt}`)
            eYo.Test.input_length(a.eyo.value_b, 3)
            b.dispose()
            eYo.Test.input_length(a.eyo.value_b, 1)
          } else {
            // console.error('XO TEST FOR', tt)
            b.dispose()
          }
        })
      }
      a.dispose()
    })
    it(`value_list checks 2/2: ${t}`, function () {
      var a = eYo.Test.new_block(t)
      var m = a.eyo.value_b.eyo.model.list
      var unique = m.unique(eYo.T3.Expr.value_list, a.type)
      var check = m.check(eYo.T3.Expr.value_list, a.type)
      var all = m.all(eYo.T3.Expr.value_list, a.type)
      if(a.eyo.value_s.isIncog()) {
        chai.assert(unique === null, `MISSING UNIQUE NULL ${a.type}, ${a.subtype}`)
        chai.assert(check === null, `MISSING CHECK NULL ${a.type}, ${a.subtype}`)
        chai.assert(all === null, `MISSING ALL NULL ${a.type}, ${a.subtype}`)
      } else {
        var f = (ra, str) => {
          chai.assert(ra !== undefined, `UNEXPECTED UNDEFINED ${str}: ${a.type}, ${a.subtype}`)
          chai.assert(ra !== null, `UNEXPECTED NULL ${str}: ${a.type}, ${a.subtype}`)
          chai.assert(ra.length !== 0, `MISSING ${str}: ${a.type}, ${a.subtype}`)
        }
        f(unique, 'unique')
        f(check, 'check')
        f(all, 'all')
        chai.assert(chai.expect(a.eyo.value_b.inputList[0].connection.check_).equals(all), `BAD CHECK (0)`)
        chai.assert(chai.expect(goog.array.concat(unique, check)).eql(all), `BAD CHECK (0)`)
        unique.forEach(tt => {
          var b = eYo.Test.new_block(tt)
          if (tt === eYo.T3.Expr.assignment_chain) {
            var c = eYo.Test.new_block(tt)
            c.eyo.variant_p = eYo.Key.SLICING
            chai.assert(b.eyo.target_b.eyo.lastConnect(c), `MISSED TARGET ${tt}`)
          }
          if (b.type === tt) {
            eYo.Test.input_length(a.eyo.value_b, 1)
            chai.assert(a.eyo.value_b.eyo.lastConnect(b), `MISSED VALUE ${tt}`)
            eYo.Test.input_length(a.eyo.value_b, 1)
            b.dispose()
            eYo.Test.input_length(a.eyo.value_b, 1)
          } else {
            // console.error('NO TEST FOR', tt)
            b.dispose()
          }
        })
        check.forEach(tt => {
          var b = eYo.Test.new_block(tt)
          if (tt === eYo.T3.Expr.assignment_chain) {
            var c = eYo.Test.new_block(tt)
            c.eyo.variant_p = eYo.Key.SLICING
            chai.assert(b.eyo.target_b.eyo.lastConnect(c), `MISSED TARGET ${tt}`)
          }
          if (b.type === tt) {
            eYo.Test.input_length(a.eyo.value_b, 1)
            chai.assert(a.eyo.value_b.eyo.lastConnect(b), `MISSED VALUE ${tt}`)
            eYo.Test.input_length(a.eyo.value_b, 3)
            b.dispose()
            eYo.Test.input_length(a.eyo.value_b, 1)
          } else {
            // console.error('XO TEST FOR', tt)
            b.dispose()
          }
        })
      }
      a.dispose()
    })
  })
  it('Slot value', function () {
    var a = eYo.Test.new_block('identifier')
    a.eyo.target_p = 'a'
    eYo.Test.code(a, 'a')
    eYo.Test.data_key(a, 'variant', eYo.Key.TARGET_VALUED)
    a.eyo.variant_p = eYo.Key.TARGET_VALUED
    eYo.Test.block(a, 'identifier_valued')
    eYo.Test.code(a, 'a=MISSING EXPRESSION')
    a.eyo.value_p = 'value'
    eYo.Test.code(a, 'a=value')
    var b = eYo.Test.new_block('identifier')
    b.eyo.target_p = 'b'
    eYo.Test.code(b, 'b')
    a.eyo.value_b.eyo.lastConnect(b)
    eYo.Test.code(a, 'a=b')
    var c = eYo.Test.new_block('identifier')
    c.eyo.target_p = 'c'
    eYo.Test.code(c, 'c')
    // console.error(a.eyo.value_b.inputList[0].connection.check_)
    // console.error(a.eyo.value_b.inputList[1].connection.check_)
    // console.error(a.eyo.value_b.inputList[2].connection.check_)
    chai.assert(a.eyo.value_b.eyo.lastConnect(c), 'MISSED')
    eYo.Test.code(a, 'a=b,c')
    a.eyo.variant_p = eYo.Key.ANNOTATED
    eYo.Test.code(a, 'a:MISSINGEXPR')
    a.eyo.variant_p = eYo.Key.ANNOTATED_VALUED
    eYo.Test.code(a, 'a:MISSINGEXPR=b,c')
    a.eyo.variant_p = eYo.Key.TARGET_VALUED
    eYo.Test.code(a, 'a=b,c')
    b.unplug()
    eYo.Test.code(a, 'a=c')
    c.eyo.variant_p = eYo.Key.TARGET_VALUED
    eYo.Test.block(c, 'assignment_chain') // c is unique and connect
    eYo.Test.code(a, 'a=c=MISSINGEXPRESSION')
    eYo.Test.input_length(a.eyo.value_b, 1)
    c.eyo.variant_p = eYo.Key.SLICING // c is no longer unique
    eYo.Test.block(c, 'named_subscription')
    eYo.Test.code(a, 'a=c[<MISSINGEXPRESSION>]')
    eYo.Test.input_length(a.eyo.value_b, 3)
    chai.assert(a.eyo.value_b.eyo.lastConnect(b), 'MISSED')
    eYo.Test.input_length(a.eyo.value_b, 5)
    eYo.Test.code(a, 'a=c[<MISSINGEXPRESSION>],b')
    chai.assert(a.eyo.value_b.inputList[4].eyo.connect(c), 'MISSED')
    eYo.Test.code(a, 'a=b,c[<MISSINGEXPRESSION>]')
    eYo.Test.input_length(a.eyo.value_b, 5)    
    b.dispose()
    b = eYo.Test.new_block('yield_expr')
    chai.assert(a.eyo.value_b.inputList[1].eyo.connect(b), 'MISSED')
    eYo.Test.input_length(a.eyo.value_b, 1)
    chai.assert(!c.outputConnection.eyo.t_eyo)
    c.dispose()
    a.dispose()
  })
})

describe('Primary types', function() {
  var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
  var ctor_key = b.eyo.constructor.eyo.key
  b.dispose()
  var f = (k1, k2) => {
    it(`types ${k1}/${k2 || k1}`, function() {
      var t1 = eYo.T3.Expr[k1]
      chai.assert(t1, `UNKNOWN ${k1}`)
      var t2 = eYo.T3.Expr[k2 || k1]
      chai.assert(t2, `UNKNOWN ${k2}`)
      var b = eYo.Test.new_block(t1, t2)
      chai.assert(b, `MISSING ${t1}`)
      eYo.Test.ctor(b, ctor_key)
      b.dispose()
    })
  }
  f('identifier')
  f('identifier_annotated')
  f('key_datum', 'identifier_annotated')
  f('identifier_valued')
  f('identifier_annotated_valued')
  f('attributeref', 'parent_module')
  f('named_attributeref', 'parent_module')
  f('dotted_name', 'parent_module')
  f('parent_module')
  f('identifier_as')
  f('dotted_name_as', 'identifier_as')
  f('expression_as', 'identifier_as')
  f('subscription', 'named_subscription')
  f('named_subscription', 'named_subscription')
  f('slicing', 'named_subscription')
  f('named_slicing', 'named_subscription')
  f('call_expr', 'named_call_expr')
  f('named_call_expr')
  f('assignment_chain', 'identifier_valued')
})

describe('Primary(Compatibility)', function() {
  it('0.2.0', function() {
    var b = eYo.Test.new_block('identifier_valued')
    var rhs = 'rhs'
    b.eyo.value_p = rhs
    chai.assert(b.eyo.value_p === rhs, `BAD ${b.eyo.value_p} === ${rhs}`)
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    console.error(dom)
    f = (t, expected) => {
      dom.setAttribute(eYo.Key.EYO, t)
      expected = eYo.T3.Expr[expected] || eYo.T3.Expr.identifier_valued
      var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
      eYo.Test.block(b2, expected)
      chai.assert(b2.eyo.value_s, `MISSING VALUE SLOT ${t}`)
      chai.assert(!b2.eyo.value_s.isIncog(), `UNEXPECTED VALUE INCOG ${t}`)
      chai.assert(b2.eyo.value_p === rhs, `MISSED VALUE ${b2.eyo.value_p} === ${rhs}`)
      b2.dispose()
    }
    f('identifier_valued')
    f('assignment_chain')
    f('assignment_expr', 'assignment_expr')
  })
})

describe('Primary(value_list)', function() {
  it('basic', function() {
    var bb = eYo.Test.new_block('value_list', 'value_list')
    eYo.Test.input_length(bb, 1)
    bb.dispose()
    bb = eYo.Test.new_block('identifier', 'identifier')
    var b = bb.eyo.value_b
    eYo.Test.block(b, 'value_list')
    eYo.Test.input_length(b, 1)
    bb.dispose()
  })
  it('void unwrapped', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.value_list)
    chai.assert(b, 'MISSED')
    chai.assert(b.inputList.length === 1)
    var model = b.eyo.consolidator.model
    console.error('ALL', b.eyo.type, b.eyo.subtype, model.all(b.eyo.type, b.eyo.subtype))
    var check = b.inputList[0].connection.check_
    chai.assert(check === null, 'BAD 1')
    // expect(model).to.have.all.keys('unique', 'all', 'check')
    chai.assert(chai.expect(check).equal(model.all(b.eyo.type, b.eyo.subtype)), `MISMATCH 1`)
    chai.assert(chai.expect(null).equal(model.all(b.eyo.type, b.eyo.subtype)), `MISMATCH 1`)
    chai.assert(chai.expect(null).equal(model.check(b.eyo.type, b.eyo.subtype)), `MISMATCH 2`)
    chai.assert(chai.expect(null).equal(model.unique(b.eyo.type, b.eyo.subtype)), `MISMATCH 3`)
    b.dispose()
  })
  it('void wrapped', function() {
    var bb = eYo.Test.new_block('identifier_valued')
    eYo.Test.ctor(bb, 'primary')
    var b = bb.eyo.value_b
    eYo.Test.block(b, 'value_list')
    eYo.Test.input_length(b, 1)
    var model = b.eyo.consolidator.model
    var check = b.inputList[0].connection.check_
    chai.assert(chai.expect(check).to.equal(model.all(b.type, b.eyo.subtype)),`MISMATCH 1`)
    chai.assert(chai.expect(check).to.not.equal(model.check(b.type, b.eyo.subtype)),`MISMATCH 2`)
    chai.assert(chai.expect(check).to.not.equal(model.unique(b.type, b.eyo.subtype)),`MISMATCH 3`)
    bb.dispose()
  })
  it('non void wrapped', function() {
    var bb = eYo.Test.new_block('identifier_valued')
    var b = bb.eyo.value_b
    eYo.Test.subtype(b, 'identifier_valued')
    b.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a'))
    eYo.Test.input_length(b, 3)
    var model = b.eyo.consolidator.model
    var check = b.inputList[0].connection.check_
    var model_check = model.check(b.eyo.type, b.eyo.subtype)
    var model_all = model.all(b.eyo.type, b.eyo.subtype)
    var model_unique = model.unique(b.eyo.type, b.eyo.subtype)
    chai.assert(chai.expect(check).to.equal(model_check), `MISMATCH 01`)
    chai.assert(chai.expect(check).to.not.equal(model_all), `MISMATCH 02`)
    chai.assert(chai.expect(check).to.not.equal(model_unique), `MISMATCH 03`)
    check = b.inputList[1].connection.check_
    chai.assert(chai.expect(check).to.equal(model_all), `MISMATCH 11`)
    chai.assert(chai.expect(check).to.not.equal(model_check), `MISMATCH 12`)
    chai.assert(chai.expect(check).to.not.equal(model_unique), `MISMATCH 13`)
    check = b.inputList[2].connection.check_
    chai.assert(chai.expect(check).to.equal(model_check), `MISMATCH 21`)
    chai.assert(chai.expect(check).to.not.equal(model_all), `MISMATCH 22`)
    chai.assert(chai.expect(check).to.not.equal(model_unique), `MISMATCH 23`)
    bb.dispose()
  })
  it('non void (=) wrapped', function() {
    var bb = eYo.Test.new_block('identifier_valued')
    var b = bb.eyo.value_b
    b.eyo.lastInput.eyo.connect(eYo.Test.new_block('identifier_valued'))
    chai.assert(b.inputList.length === 1)
    var model = b.eyo.consolidator.model
    var check = b.inputList[0].connection.check_
    var model_check = model.check(b.eyo.type, b.eyo.subtype)
    var model_all = model.all(b.eyo.type, b.eyo.subtype)
    var model_unique = model.unique(b.eyo.type, b.eyo.subtype)
    chai.assert(chai.expect(check).to.equal(model_all), `MISMATCH 01`)
    chai.assert(chai.expect(check).to.not.equal(model_check), `MISMATCH 02`)
    chai.assert(chai.expect(check).to.not.equal(model_unique), `MISMATCH 03`)
    bb.dispose()
  })
})

describe('Primary(DEFINED)', function() {
  it('value data', function() {
    var b = eYo.Test.new_block('identifier_valued')
    var rhs = 'rhs'
    b.eyo.value_p = rhs
    chai.assert(b.eyo.value_p === rhs, `MISSED ${b.eyo.value_p} === ${rhs}`)
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    chai.assert(b.eyo.value_p === rhs, `MISSED ${b.eyo.value_p} === ${rhs}`)
    b.dispose()
  })
  it('… = rhs', function() {
    var b = eYo.Test.new_block('identifier_valued')
    var rhs = 'rhs'
    eYo.Test.list_connect(b, 'value', eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs))
    var u = b.eyo.value_s.unwrappedTarget
    chai.assert(u.target_p === rhs, `MISSED ${u.target_p} === ${rhs}`)
    // b.moveBy(20, 20)
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    u = b.eyo.value_s.unwrappedTarget
    chai.assert(u.target_p === rhs, `MISSED ${u.target_p} === ${rhs}`)
    b.dispose()
  })
  it('… = a, b', function() {
    var b = eYo.Test.new_block('identifier_valued')
    var rhs_a = 'a'
    eYo.Test.list_connect(b, 'value', eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_a))
    var rhs_b = 'b'
    eYo.Test.list_connect(b, 'value', eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_b))
    var u = b.eyo.value_s.unwrappedTarget
    chai.assert(u.target_p === rhs_a, `MISSED ${u.target_p} === ${rhs_a}`)
    // b.moveBy(20, 20)
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    u = b.eyo.value_s.unwrappedTarget
    chai.assert(u.target_p === rhs_a, `MISSED ${u.target_p} === ${rhs_a}`)
    eYo.Test.input_length(b.eyo.value_b, 5)
    var name = b.eyo.value_b.inputList[3].connection.targetBlock().eyo.target_p
    chai.assert(name = rhs_b, `MISSED ${name} = ${rhs_b}`)
    b.dispose()
  })
  it('… = (… = …)', function() {
    var b = eYo.Test.new_block('identifier_valued')
    var rhs_a = 'a'
    eYo.Test.list_connect(b, 'value', eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_a))
    var bb = eYo.Test.new_block('identifier_valued')
    eYo.STOP = 0
    eYo.Test.list_connect(bb, 'value', b)
    eYo.Test.block(b, 'assignment_chain')
    console.log(bb.eyo.getProfile())
    eYo.Test.block(bb, 'assignment_chain')
    bb.dispose()
  })
  it('… = (… = …)', function() {
    var b = eYo.Test.new_block('identifier_valued')
    var rhs_a = 'a'
    eYo.Test.list_connect(b, 'value', eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_a))
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.assignment_stmt)
    eYo.Test.list_connect(bb, 'value', b)
    eYo.Test.block(b, 'assignment_chain')
    eYo.Test.block(bb, 'assignment_stmt')
    bb.dispose()
  })
})

describe('Primary(Assignment)', function() {
  it('basic', function() {
    var b = eYo.Test.new_block('identifier_valued', 'identifier_valued')
    eYo.Test.incog(b, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'value', 'Xn_ary', 'Xslicing', 'Xalias'])
    var f = (k, b1 = b) => {
      eYo.Test.block(b1, k)
    }
    f('identifier_valued')
    eYo.Test.list_connect(b, 'target', eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a'))
    var t = b.eyo.target_b
    f('identifier_valued')
    eYo.Test.list_connect(b, 'target', eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'b')) // 2nd target
    f('assignment_chain')
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    // console.log(dom)
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    f('assignment_chain', b2)
    b2.moveBy(50, 10)
    b2.dispose()
  })
  it('f(… = …)', function() {
    var b = eYo.Test.new_block('identifier_valued')
     var f = (k, b1 = b) => {
      eYo.Test.block(b1, k)
    }
    f('identifier_valued')
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.call_expr)
    eYo.Test.list_connect(bb, 'n_ary', b)
    f('identifier_valued')
    bb.dispose(true)
  })
  it('…=(…=…) unique value', function() {
    var b = eYo.Test.new_block('identifier_valued')
    var a = eYo.Test.new_block('identifier_valued')
    eYo.Test.list_connect(b, 'value', a)
    eYo.Test.input_length(b.eyo.value_b, 1)
    b.dispose()
  })
  it('b=rhs (dom)', function() {
    var b = eYo.Test.new_block('identifier_valued')
    b.eyo.variant_p = eYo.Key.TARGET_VALUED
    var a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'rhs')
    eYo.Test.list_connect(b, 'value', a)
    var dom = eYo.Xml.blockToDom(b)
    b.dispose()
    b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
    chai.assert(b, `MISSING ${dom}`)
    eYo.Test.variant(b, 'TARGET_VALUED')
    var u = b.eyo.value_s.unwrappedTarget
    chai.assert(u, 'MISSED value')
    eYo.Test.block(u, 'identifier')
    b.dispose()
  })
})

describe('Primary(Expression Assignment)', function() {
  it('basic', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.assignment_expr)
    eYo.Test.variant(b, 'COL_VALUED')
    chai.assert(b.eyo.value_s.fields.label.getValue() === ':=')
    b.dispose()
  })
})

describe('Primary(ANNOTATED)', function() {
  ;[
    'identifier_annotated',
    'augtarget_annotated',
    'key_datum'
  ].forEach(t => {
    it(`basic annotated ${t}`, function() {
      var b = eYo.Test.new_block(t)
      eYo.Test.variant(b, 'ANNOTATED')
      b.dispose()
    })
  })
  it('basic connections', function() {
    var f = (t, bb, ttt, cant_connect) => {
      var b = eYo.Test.new_block(t)
      if (cant_connect) {
        chai.assert(!b.eyo.target_b.eyo.lastConnect(bb))
      } else {
        eYo.Test.list_connect(b, 'target', bb)
        eYo.Test.block(b, ttt || t)
        bb.unplug()
      }
      b.dispose()
    }
    var bb = eYo.Test.new_block('identifier')
    f('identifier_annotated', bb, 'identifier_annotated')
    f('augtarget_annotated', bb, 'identifier_annotated')
    f('key_datum', bb, 'identifier_annotated')
    bb.eyo.target_d.set('y')
    bb.eyo.dotted_d.set(1)
    bb.eyo.holder_d.set('x')
    eYo.Test.block(bb, 'dotted_name')
    chai.assert(eYo.T3.Expr.Check.augtarget.indexOf(bb.type) >= 0, 'MISSED AUGTARGET')
    f('identifier_annotated', bb, 'augtarget_annotated')
    bb.dispose()
    bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 421)
    f('identifier_annotated', bb, 'key_datum', true)
    bb.dispose()
  })
  it('type change', function() {
    var b = eYo.Test.new_block('identifier_annotated')
    var bb = eYo.Test.new_block('identifier')
    bb.eyo.target_p = 'x'
    eYo.Test.list_connect(b, 'target', bb)
    eYo.Test.variant(b, b.eyo.variant_p = eYo.Key.ANNOTATED)
    b.eyo.annotated_p = 'str'
    eYo.Test.block(b, 'identifier_annotated')
    eYo.Test.code(b, 'x:str')
    bb.eyo.variant_p = eYo.Key.CALL_EXPR
    eYo.Test.code(b, 'x():str')
    eYo.Test.block(b, 'key_datum')
    bb.eyo.variant_p = eYo.Key.SLICING
    eYo.Test.incog(bb, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'slicing', 'Xalias'])
    eYo.Test.list_connect(bb, 'slicing', eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 421))
    eYo.Test.code(b, 'x[421]:str')
    eYo.Test.block(b, 'augtarget_annotated')
    bb.eyo.variant_p = eYo.Key.NONE
    eYo.Test.incog(bb, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.Test.code(b, 'x:str')
    eYo.Test.block(b, 'identifier_annotated')
    bb.eyo.variant_p = eYo.Key.SLICING
    eYo.Test.incog(bb, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'slicing', 'Xalias'])
    eYo.Test.code(b, 'x[421]:str')
    eYo.Test.block(b, 'augtarget_annotated')
    bb.eyo.variant_p = eYo.Key.CALL_EXPR
    eYo.Test.incog(bb, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'n_ary', 'Xslicing', 'Xalias'])
    eYo.Test.code(b, 'x():str')
    eYo.Test.block(b, 'key_datum')
    bb.eyo.variant_p = eYo.Key.NONE
    eYo.Test.incog(bb, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.Test.code(b, 'x:str')
    eYo.Test.block(b, 'identifier_annotated')
    b.dispose()
  })
  it ('create from model', function () {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, {
      type: eYo.T3.Expr.primary,
      target_d: 'x',
      annotated_d: 'str'
    })
    eYo.Test.code(b, 'x:str')
    b.dispose()
  })
})

describe ('Primary data by key', function () {
  ;[
    ['target', 'y'],
    ['dotted', 2],
    ['holder', 'x'],
  ].forEach(args => {
    it (`${args[0]} -> ${args[1]}`, function () {
      var b = eYo.Test.new_block('identifier')
      eYo.Test.data_key(b, args[0], args[1])
      b.dispose()
    })
  })
})

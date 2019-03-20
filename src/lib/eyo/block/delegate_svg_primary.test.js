console.log('RUNNING PRIMARY BLOCK TESTS')

describe('Each primary block type', function() {
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
      eYo.Test.assert_ctor(b, 'primary')
      eYo.Test.assert_variant(b, Ts[2])
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


/*
 */
describe('Basic copy/paste', function() {
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
    it(`Copy/paste ${t}`, function() {
      var b = eYo.Test.new_block(t)
      var dom = eYo.Xml.blockToDom(b)
      var bb = eYo.DelegateSvg.newBlockReady(b.workspace, dom)
      eYo.Test.assert_same(bb, b)
      bb.dispose()
      b.dispose()
    })  
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
        eYo.Test.assert_same(bb, b)
        bb.dispose()
      })
    })
    b.dispose()
  })
})

// 
describe('Basic slots incog', function() {
  [
    ['identifier', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['identifier_annotated', 'target', 'Nholder', 'Ndotted', 'annotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['augtarget_annotated', 'target', 'Nholder', 'Ndotted', 'annotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['key_datum', 'target', 'Nholder', 'Ndotted', 'annotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['identifier_valued', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'value', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['assignment_chain', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'value', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['assignment_expr', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'value', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['identifier_annotated_valued', 'target', 'Nholder', 'Ndotted', 'annotated', 'value', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['attributeref', 'target', 'holder', 'dotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['named_attributeref', 'target', 'holder', 'dotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['dotted_name', 'target', 'holder', 'dotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['parent_module', 'target', 'holder', 'dotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['identifier_as', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'alias'],
    ['dotted_name_as', 'target', 'holder', 'dotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'alias'],
    ['expression_as', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'alias'],
    ['call_expr', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'n_ary', 'Nslicing', 'Nalias'],
    ['named_call_expr', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'n_ary', 'Nslicing', 'Nalias'],
    ['named_subscription', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'slicing', 'Nalias'],
    ['subscription', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'slicing', 'Nalias'],
    ['named_slicing', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'slicing', 'Nalias'],
    ['slicing', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'slicing', 'Nalias']
  ].some(Ts => {
    it(`Slots incog status ${Ts[0]}`, function() {
      var b = eYo.Test.new_block(Ts[0])
      eYo.Test.assert_incog(b, Ts)
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
    ['NONE', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['CALL_EXPR', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'n_ary', 'Nslicing', 'Nalias'],
    ['SLICING', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'slicing', 'Nalias'],
    ['ALIASED', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'alias'],
    ['ANNOTATED', 'target', 'Nholder', 'Ndotted', 'annotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['ANNOTATED_VALUED', 'target', 'Nholder', 'Ndotted', 'annotated', 'value', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['TARGET_VALUED', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'value', 'Nn_ary', 'Nslicing', 'Nalias'],
    ['COL_VALUED', 'target', 'Nholder', 'Ndotted', 'Nannotated', 'value', 'Nn_ary', 'Nslicing', 'Nalias']
  ].some(Ts => {
    it(`Slots incog status by variant ${Ts[0]}`, function() {
      var b = eYo.Test.new_block('identifier')
      b.eyo.variant_p = eYo.Key[Ts[0]]
      eYo.Test.assert_incog(b, Ts)
      b.dispose()
    })  
  })
})

describe('Copy/Paste by data', function() {
  it('data: dotted', function() {
    var b = eYo.Test.new_block('identifier')
    chai.assert(b.eyo.dotted_p === 0, `BAD DEFAULT DOTTED ${b.eyo.dotted_p}`)
    console.error(eYo.Xml.blockToDom(b))
    eYo.Test.assert_incog(b, ['target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'Nalias'])
    b.eyo.dotted_p = 1
    eYo.Test.assert_incog(b, ['target', 'holder', 'dotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'Nalias'])
    eYo.Test.assert_data_save(b, 'dotted', 0)
    eYo.Test.assert_data_save(b, 'dotted', 1)
    eYo.Test.assert_data_save(b, 'dotted', 2)
    eYo.Test.assert_data_save(b, 'dotted', 3)
    b.dispose()
  })
  it('data: holder', function() {
    var b = eYo.Test.new_block('identifier')
    b.eyo.holder_p = 'TEST'
    eYo.Test.assert_incog(b, ['target', 'Nholder', 'Ndotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'Nalias'])
    eYo.Test.assert_data_save(b, 'holder', 'TEST2', true)
    b.eyo.dotted_p = 1
    eYo.Test.assert_incog(b, ['target', 'holder', 'dotted', 'Nannotated', 'Nvalue', 'Nn_ary', 'Nslicing', 'Nalias'])
    eYo.Test.assert_data_save(b, 'holder', 'TEST3')
    eYo.Test.assert_data_save(b, 'holder', '')
    b.dispose()
  })
  var f = (k, variant, values) => {
    it(`data: ${k}`, function() {
      var b = eYo.Test.new_block('identifier')
      eYo.Test.assert_data_save(b, k, values[0], true)
      b.eyo.variant_p = eYo.Key[variant] || variant
      values.forEach(v => {
        eYo.Test.assert_data_save(b, k, v)
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
      eYo.Test.assert_bind_field('identifier', k)
    })  
  })
  ;[
    'n_ary',
    'slicing'
  ].forEach(k => {
    it(`bind field: ${k}`, function() {
      eYo.Test.assert_bind_field('identifier', k, true)
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
  // depending what you connect, the type may change
  // we do not manage the data content here
  // it('Slot: holder/dotted', function() {
  //   var b = eYo.Test.new_block('identifier')
  //   var a = eYo.Test.new_block('identifier')
  //   eYo.Test.assert_slot_connect(b, 'holder', a)
  //   eYo.Test.assert_block(b, 'identifier')
  //   eYo.Test.assert_block(a, 'identifier')
  //   a.eyo.target_p = 'a'
  //   chai.assert(a.eyo.target_s.fields.bind.getText() === 'a', `SYNCHRONIZE FAILED for target bind field in ${a.type}`)
  //   chai.assert(a.eyo.target_s.fields.bind.isVisible(), `INVISIBLE BIND FIELD`)
  //   chai.assert(a.eyo.data.target.get() === 'a', 'FAILED')
  //   eYo.Test.assert_code(a, 'a')
  //   b.eyo.target_p = 'b'
  //   eYo.Test.assert_code(b, 'b')
  //   b.eyo.dotted_p = 1
  //   eYo.Test.assert_code(b, 'a.b')
  //   eYo.Test.assert_block(b, 'dotted_name')
  //   b.eyo.dotted_p = 2
  //   eYo.Test.assert_code(b, '..b')
  //   eYo.Test.assert_block(b, 'parent_module')
  //   eYo.Test.assert_data_key(b, 'target', '')
  //   eYo.Test.assert_code(b, '..b')
  //   b.eyo.target_p = ''
  //   eYo.Test.assert_code(b, '..')
  //   eYo.Test.assert_block(b, 'parent_module')
  //   b.eyo.target_p = 'b'
  //   b.eyo.dotted_p = 1
  //   eYo.Test.assert_code(b, 'a.b')
  //   eYo.Test.assert_block(b, 'dotted_name')
  //   a.eyo.variant_p = eYo.Key.CALL_EXPR
  //   eYo.Test.assert_code(b, 'a().b')
  //   eYo.Test.assert_block(b, 'attributeref')
  //   b.dispose()
  // })
  // it ('Slot target', function () {
  //   var a = eYo.Test.new_block('identifier')
  //   var b = eYo.Test.new_block('identifier')
  //   a.eyo.target_p = 'a'
  //   eYo.Test.assert_code(a, 'a')
  //   b.eyo.target_p = 'b'
  //   a.eyo.target_t.eyo.lastConnect(b)
  //   eYo.Test.assert_code(a, 'b')
  //   var c = eYo.Test.new_block('identifier')
  //   c.eyo.target_p = 'c'
  //   a.eyo.target_t.eyo.lastConnect(c)
  //   eYo.Test.assert_code(a, 'b,c')
  //   b.dispose()
  //   eYo.Test.assert_code(a, 'c')
  //   c.dispose()
  //   eYo.Test.assert_code(a, 'a')
  //   a.dispose()
  // })
  // it('Slot annotated', function () {
  //   var a = eYo.Test.new_block('identifier')
  //   a.eyo.target_p = 'a'
  //   eYo.Test.assert_code(a, 'a')
  //   eYo.Test.assert_data_key(a, 'variant', eYo.Key.ANNOTATED)
  //   a.eyo.variant_p = eYo.Key.ANNOTATED
  //   eYo.Test.assert_code(a, 'a:expr')
  //   a.eyo.annotated_p = 'fal ba la'
  //   eYo.Test.assert_code(a, 'a:falbala')
  //   var b = eYo.Test.new_block('a_expr')
  //   b.eyo.lhs_p = 'lhs'
  //   b.eyo.rhs_p = 'rhs'
  //   eYo.Test.assert_code(b, 'lhs+rhs')
  //   a.eyo.annotated_s.connect(b)
  //   eYo.Test.assert_code(a, 'a:lhs+rhs')
  //   b.unplug()
  //   eYo.Test.assert_code(a, 'a:falbala')
  //   b.dispose()
  //   a.dispose()
  // })
  ;[
  // 'assignment_stmt',
  // 'augmented_assignment_stmt',
  // 'annotated_assignment_stmt',
  // 'assignment_chain',
  // 'identifier_valued',
  // 'assignment_expr',
  // 'identifier',
  // 'identifier_annotated',
  // 'augtarget_annotated',
  // 'key_datum',
  // 'identifier_valued',
  // 'assignment_chain',
  // 'assignment_expr',
  // 'identifier_annotated_valued',
  // 'attributeref',
  // 'named_attributeref',
  // 'dotted_name',
  // 'parent_module',
  // 'identifier_as',
  // 'dotted_name_as',
  // 'expression_as',
  // 'subscription',
  // 'named_subscription',
  // 'slicing',
  // 'named_slicing',
  // 'call_expr',
  // 'named_call_expr'
  ].forEach(t => {
    it(`assignment_value_list checks 1/2: ${t}`, function () {
      var a = eYo.Test.new_block(t)
      var m = a.eyo.value_t.eyo.model.list
      var unique = m.unique(eYo.T3.Expr.assignment_value_list, a.type)
      var check = m.check(eYo.T3.Expr.assignment_value_list, a.type)
      var all = m.all(eYo.T3.Expr.assignment_value_list, a.type)
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
        chai.assert(chai.expect(a.eyo.value_t.inputList[0].connection.check_).equals(all), `BAD CHECK (0)`)
        chai.assert(chai.expect(goog.array.concat(unique, check)).eql(all), `BAD CHECK (0)`)
        unique.forEach(tt => {
          var b = eYo.Test.new_block(tt)
          if (tt === eYo.T3.Expr.assignment_chain) {
            var c = eYo.Test.new_block(tt)
            c.eyo.variant_p = eYo.Key.SLICING
            chai.assert(b.eyo.target_t.eyo.lastConnect(c), `MISSED TARGET ${tt}`)
          }
          if (b.type === tt) {
            eYo.Test.assert_input_length(a.eyo.value_t, 1)
            chai.assert(a.eyo.value_t.eyo.lastConnect(b), `MISSED VALUE ${tt}`)
            eYo.Test.assert_input_length(a.eyo.value_t, 1)
            b.dispose()
            eYo.Test.assert_input_length(a.eyo.value_t, 1)
          } else {
            // console.error('NO TEST FOR', tt)
            b.dispose()
          }
        })
        // check.forEach(tt => {
        //   var b = eYo.Test.new_block(tt)
        //   if (tt === eYo.T3.Expr.assignment_chain) {
        //     var c = eYo.Test.new_block(tt)
        //     c.eyo.variant_p = eYo.Key.SLICING
        //     chai.assert(b.eyo.target_t.eyo.lastConnect(c), `MISSED TARGET ${tt}`)
        //   }
        //   if (b.type === tt) {
        //     eYo.Test.assert_input_length(a.eyo.value_t, 1)
        //     chai.assert(a.eyo.value_t.eyo.lastConnect(b), `MISSED VALUE ${tt}`)
        //     eYo.Test.assert_input_length(a.eyo.value_t, 3)
        //     b.dispose()
        //     eYo.Test.assert_input_length(a.eyo.value_t, 1)
        //   } else {
        //     // console.error('NO TEST FOR', tt)
        //     b.dispose()
        //   }
        // })
      }
      a.dispose()
    })
    it(`assignment_value_list checks 2/2: ${t}`, function () {
      var a = eYo.Test.new_block(t)
      var m = a.eyo.value_t.eyo.model.list
      var unique = m.unique(eYo.T3.Expr.assignment_value_list, a.type)
      var check = m.check(eYo.T3.Expr.assignment_value_list, a.type)
      var all = m.all(eYo.T3.Expr.assignment_value_list, a.type)
      if(a.eyo.value_s.isIncog()) {
        chai.assert(unique === null, `MISSING UNIQUE NULL ${a.type}, ${a.subtype}`)
        chai.assert(check === null, `MISSING CHECK NULL ${a.type}, ${a.subtype}`)
        chai.assert(all === null, `MISSING ALL NULL ${a.type}, ${a.subtype}`)
      } else {
        // var f = (ra, str) => {
        //   chai.assert(ra !== undefined, `UNEXPECTED UNDEFINED ${str}: ${a.type}, ${a.subtype}`)
        //   chai.assert(ra !== null, `UNEXPECTED NULL ${str}: ${a.type}, ${a.subtype}`)
        //   chai.assert(ra.length !== 0, `MISSING ${str}: ${a.type}, ${a.subtype}`)
        // }
        // f(unique, 'unique')
        // f(check, 'check')
        // f(all, 'all')
        // chai.assert(chai.expect(a.eyo.value_t.inputList[0].connection.check_).equals(all), `BAD CHECK (0)`)
        // chai.assert(chai.expect(goog.array.concat(unique, check)).eql(all), `BAD CHECK (0)`)
        // unique.forEach(tt => {
        //   var b = eYo.Test.new_block(tt)
        //   if (tt === eYo.T3.Expr.assignment_chain) {
        //     var c = eYo.Test.new_block(tt)
        //     c.eyo.variant_p = eYo.Key.SLICING
        //     chai.assert(b.eyo.target_t.eyo.lastConnect(c), `MISSED TARGET ${tt}`)
        //   }
        //   if (b.type === tt) {
        //     eYo.Test.assert_input_length(a.eyo.value_t, 1)
        //     chai.assert(a.eyo.value_t.eyo.lastConnect(b), `MISSED VALUE ${tt}`)
        //     eYo.Test.assert_input_length(a.eyo.value_t, 1)
        //     b.dispose()
        //     eYo.Test.assert_input_length(a.eyo.value_t, 1)
        //   } else {
        //     // console.error('NO TEST FOR', tt)
        //     b.dispose()
        //   }
        // })
        check.forEach(tt => {
          var b = eYo.Test.new_block(tt)
          if (tt === eYo.T3.Expr.assignment_chain) {
            var c = eYo.Test.new_block(tt)
            c.eyo.variant_p = eYo.Key.SLICING
            chai.assert(b.eyo.target_t.eyo.lastConnect(c), `MISSED TARGET ${tt}`)
          }
          if (b.type === tt) {
            eYo.Test.assert_input_length(a.eyo.value_t, 1)
            chai.assert(a.eyo.value_t.eyo.lastConnect(b), `MISSED VALUE ${tt}`)
            eYo.Test.assert_input_length(a.eyo.value_t, 3)
            b.dispose()
            eYo.Test.assert_input_length(a.eyo.value_t, 1)
          } else {
            // console.error('NO TEST FOR', tt)
            b.dispose()
          }
        })
      }
      a.dispose()
    })
  })
  // it('Slot value', function () {
  //   var a = eYo.Test.new_block('identifier')
  //   a.eyo.target_p = 'a'
  //   eYo.Test.assert_code(a, 'a')
  //   eYo.Test.assert_data_key(a, 'variant', eYo.Key.TARGET_VALUED)
  //   a.eyo.variant_p = eYo.Key.TARGET_VALUED
  //   eYo.Test.assert_block(a, 'identifier_valued')
  //   eYo.Test.assert_code(a, 'a=expression')
  //   a.eyo.value_p = 'value'
  //   eYo.Test.assert_code(a, 'a=value')
  //   var b = eYo.Test.new_block('identifier')
  //   b.eyo.target_p = 'b'
  //   eYo.Test.assert_code(b, 'b')
  //   a.eyo.value_t.eyo.lastConnect(b)
  //   eYo.Test.assert_code(a, 'a=b')
  //   var c = eYo.Test.new_block('identifier')
  //   c.eyo.target_p = 'c'
  //   eYo.Test.assert_code(c, 'c')
  //   // console.error(a.eyo.value_t.inputList[0].connection.check_)
  //   // console.error(a.eyo.value_t.inputList[1].connection.check_)
  //   // console.error(a.eyo.value_t.inputList[2].connection.check_)
  //   chai.assert(a.eyo.value_t.eyo.lastConnect(c), 'MISSED')
  //   eYo.Test.assert_code(a, 'a=b,c')
  //   a.eyo.variant_p = eYo.Key.ANNOTATED
  //   eYo.Test.assert_code(a, 'a:expr')
  //   a.eyo.variant_p = eYo.Key.ANNOTATED_VALUED
  //   eYo.Test.assert_code(a, 'a:expr=b,c')
  //   a.eyo.variant_p = eYo.Key.TARGET_VALUED
  //   eYo.Test.assert_code(a, 'a=b,c')
  //   b.unplug()
  //   eYo.Test.assert_code(a, 'a=c')
  //   c.eyo.variant_p = eYo.Key.TARGET_VALUED
  //   eYo.Test.assert_block(c, 'identifier_valued') // c is unique
  //   eYo.Test.assert_code(a, 'a=c=expression')
  //   eYo.Test.assert_input_length(a.eyo.value_t, 1)
  //   c.eyo.variant_p = eYo.Key.SLICING // c is no longer unique
  //   eYo.Test.assert_block(c, 'named_subscription')
  //   eYo.Test.assert_code(a, 'a=c[<MISSINGEXPRESSION>]')
  //   eYo.Test.assert_input_length(a.eyo.value_t, 3)
  //   chai.assert(a.eyo.value_t.eyo.lastConnect(b), 'MISSED')
  //   eYo.Test.assert_input_length(a.eyo.value_t, 5)
  //   eYo.Test.assert_code(a, 'a=c[<MISSINGEXPRESSION>],b')
  //   chai.assert(a.eyo.value_t.inputList[4].eyo.connect(c), 'MISSED')
  //   eYo.Test.assert_code(a, 'a=b,c[<MISSINGEXPRESSION>]')
  //   eYo.Test.assert_input_length(a.eyo.value_t, 5)    
  //   b.dispose()
  //   b = eYo.Test.new_block('yield_expr')
  //   chai.assert(a.eyo.value_t.inputList[1].eyo.connect(b), 'MISSED')
  //   eYo.Test.assert_input_length(a.eyo.value_t, 1)
  //   chai.assert(!c.outputConnection.eyo.t_eyo)
  //   c.dispose()
  //   a.dispose()
  // })
})

// describe('Primary', function() {
//   it('types', function() {
//     var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
//     var ctor = b.constructor
//     b.dispose()
//     var f = (k1, k2) => {
//       var t1 = eYo.T3.Expr[k1]
//       assert(t1, `UNKNOWN ${k1}`)
//       var t2 = eYo.T3.Expr[k2 || k1]
//       assert(t2, `UNKNOWN ${k2}`)
//       var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, t1)
//       assert(b, `MISSING ${t1}`)
//       assert(b.constructor === ctor, `MISSED CTOR ${b.constructor.key}`)
//       assert(b.type === t2, `MISSED TYPE ${b.type} === ${t2}`)
//       b.dispose()
//     }
//     f('identifier')
//     f('identifier_annotated')
//     f('key_datum', 'identifier_annotated')
//     f('identifier_valued', 'assignment_chain')
//     f('identifier_annotated_valued')
//     f('attributeref', 'parent_module')
//     f('named_attributeref')
//     f('dotted_name', 'parent_module')
//     f('parent_module')
//     f('identifier_as')
//     f('dotted_name_as', 'identifier_as')
//     f('expression_as', 'identifier_as')
//     f('subscription', 'named_slicing')
//     f('named_subscription')
//     f('slicing', 'named_slicing')
//     f('named_slicing')
//     f('call_expr', 'named_call_expr')
//     f('named_call_expr')
//     f('assignment_chain')
//   })
// })

// describe('Primary(Compatibility)', function() {
//   it('0.2.0', function() {
//     var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//     assert(b.type === eYo.T3.Expr.assignment_chain, `BAD TYPE 1: ${b.type} === ${eYo.T3.Expr.assignment_chain}`)
//     var rhs = 'rhs'
//     b.eyo.value_p = rhs
//     assert(b.eyo.value_p === rhs, `BAD ${b.eyo.value_p} === ${rhs}`)
//     var dom = eYo.Xml.blockToDom(b)
//     b.dispose()
//     console.error(dom)
//     f = (t, expected) => {
//       dom.setAttribute(eYo.Key.EYO, t)
//       expected = eYo.T3.Expr[expected] || eYo.T3.Expr.assignment_chain
//       var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
//       assert(b2.type === expected, `BAD TYPE (${t}): ${b2.type} === ${expected}`)
//       assert(b2.eyo.value_s, `MISSING DEFINITION SLOT ${t}`)
//       assert(!b2.eyo.value_s.isIncog(), `UNEXPECTED INCOG ${t}`)
//       assert(b2.eyo.value_p === rhs, `MISSED ${b2.eyo.value_p} === ${rhs}`)
//       b2.dispose()
//     }
//     f('identifier_valued')
//     f('assignment_chain')
//     f('assignment_expr', 'assignment_expr')
//   })
// })

// describe('Primary(assignment_value_list)', function() {
//   // it('basic', function() {
//   //   var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.assignment_value_list)
//   //   assert(b, 'MISSED')
//   //   b.dispose()
//   // })
//   // it('void unwrapped', function() {
//   //   var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.assignment_value_list)
//   //   assert(b, 'MISSED')
//   //   assert(b.inputList.length === 1)
//   //   var check = b.inputList[0].connection.check_
//   //   assert(expect(check).to.be.an('array'), 'BAD 1')
//   //   var model = b.eyo.consolidator.model
//   //   var check = b.inputList[0].connection.check_
//   //   // expect(model).to.have.all.keys('unique', 'all', 'check')
//   //   assert(expect(check).equal(model.all()), `MISMATCH 1`)
//   //   assert(expect(check).not.equal(model.check()), `MISMATCH 2`)
//   //   assert(expect(check).not.equal(model.unique()), `MISMATCH 3`)
//   //   assert(expect(model.all()).contains(eYo.T3.Expr.assignment_chain), `MISMATCH 4`)
//   //   b.dispose()
//   // })
//   it('void wrapped', function() {
//     var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//     assert(bb, `MISSED ${eYo.T3.Expr.identifier_valued}`)
//     assert(bb.eyo.constructor.eyo.key === 'primary', `UNEXPECTED CTOR ${bb.eyo.constructor.eyo.key} !== primary`)
//     var b = bb.eyo.value_t
//     assert(b, 'MISSING DEFINITION TARGET')
//     assert(b.inputList.length === 1, 'BAD INPUT COUNT')
//     var model = b.eyo.consolidator.model
//     var check = b.inputList[0].connection.check_
//     assert(b.type === eYo.T3.Expr.assignment_value_list)
//     assert(b.eyo.subtype === eYo.T3.Expr.assignment_chain, `${b.eyo.subtype} === ${eYo.T3.Expr.assignment_chain}`)
//     assert(expect(check).to.equal(model.all(b.type, b.eyo.subtype)),`MISMATCH 1`)
//     assert(expect(check).to.not.equal(model.check(b.type, b.eyo.subtype)),`MISMATCH 2`)
//     assert(expect(check).to.not.equal(model.unique(b.type, b.eyo.subtype)),`MISMATCH 3`)
//     bb.dispose()
//   })
//   // it('non void wrapped', function() {
//   //   var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//   //   assert(bb, 'MISSED')
//   //   var b = bb.eyo.value_t
//   //   b.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a'))
//   //   assert(b.inputList.length === 3)
//   //   var model = b.eyo.consolidator.model
//   //   var check = b.inputList[0].connection.check_
//   //   assert(expect(check).to.equal(model.check()), `MISMATCH 01`)
//   //   assert(expect(check).to.not.equal(model.all()), `MISMATCH 02`)
//   //   assert(expect(check).to.not.equal(model.unique()), `MISMATCH 03`)
//   //   check = b.inputList[1].connection.check_
//   //   assert(expect(check).to.equal(model.all()), `MISMATCH 11`)
//   //   assert(expect(check).to.not.equal(model.check()), `MISMATCH 12`)
//   //   assert(expect(check).to.not.equal(model.unique()), `MISMATCH 13`)
//   //   check = b.inputList[2].connection.check_
//   //   assert(expect(check).to.equal(model.check()), `MISMATCH 21`)
//   //   assert(expect(check).to.not.equal(model.all()), `MISMATCH 22`)
//   //   assert(expect(check).to.not.equal(model.unique()), `MISMATCH 23`)
//   //   bb.dispose()
//   // })
//   // it('non void (=) wrapped', function() {
//   //   var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//   //   assert(bb, 'MISSED')
//   //   var b = bb.eyo.value_t
//   //   b.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued))
//   //   assert(b.inputList.length === 1)
//   //   var model = b.eyo.consolidator.model
//   //   var check = b.inputList[0].connection.check_
//   //   assert(expect(check).to.equal(model.all()), `MISMATCH 01`)
//   //   assert(expect(check).to.not.equal(model.check()), `MISMATCH 02`)
//   //   assert(expect(check).to.not.equal(model.unique()), `MISMATCH 03`)
//   //   bb.dispose()
//   // })
// })

// describe('Primary(Defined)', function() {
//   it('basic', function() {
//     var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//     // b.moveBy(20, 20)
//     b.dispose()
//   })
//   it('rhs data', function() {
//     var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//     var rhs = 'rhs'
//     b.eyo.value_p = rhs
//     assert(b.eyo.value_p === rhs, `MISSED ${b.eyo.value_p} === ${rhs}`)
//     // b.moveBy(20, 20)
//     var dom = eYo.Xml.blockToDom(b)
//     b.dispose()
//     b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
//     assert(b.eyo.value_p === rhs, `MISSED ${b.eyo.value_p} === ${rhs}`)
//     b.dispose()
//   })
//   it('… = rhs', function() {
//     var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//     var rhs = 'rhs'
//     b.eyo.value_t.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs))
//     var u = b.eyo.value_s.unwrappedTarget
//     assert(u.target_p === rhs, `MISSED ${u.target_p} === ${rhs}`)
//     // b.moveBy(20, 20)
//     var dom = eYo.Xml.blockToDom(b)
//     b.dispose()
//     b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
//     u = b.eyo.value_s.unwrappedTarget
//     assert(u.target_p === rhs, `MISSED ${u.target_p} === ${rhs}`)
//     b.dispose()
//   })
//   it('… = a, b', function() {
//     var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//     var rhs_a = 'a'
//     b.eyo.value_t.eyo.lastInput.eyo.connect
//     (eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_a))
//     var rhs_b = 'b'
//     b.eyo.value_t.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_b))
//     var u = b.eyo.value_s.unwrappedTarget
//     assert(u.target_p === rhs_a, `MISSED ${u.target_p} === ${rhs_a}`)
//     // b.moveBy(20, 20)
//     var dom = eYo.Xml.blockToDom(b)
//     b.dispose()
//     b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
//     u = b.eyo.value_s.unwrappedTarget
//     assert(u.target_p === rhs_a, `MISSED ${u.target_p} === ${rhs_a}`)
//     assert(b.eyo.value_t.inputList.length === 5, `BAD ${b.eyo.value_t.inputList.length} === ${5}`)
//     var name = b.eyo.value_t.inputList[3].connection.targetBlock().eyo.target_p
//     assert(name = rhs_b, `MISSED ${name} = ${rhs_b}`)
//     b.dispose()
//   })
//   it('… = (… = …)', function() {
//     var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//     var rhs_a = 'a'
//     assert(b.eyo.value_t.eyo.lastInput.eyo.connect
//     (eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_a)), 'BAD 1')
//     var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//     eYo.STOP = 0
//     assert(bb.eyo.value_t.eyo.lastInput.eyo.connect(b), 'BAD 2')
//     assert(bb.eyo.value_s.unwrappedTarget === b.eyo, `BAD 3 ${bb.eyo.value_s.unwrappedTarget} === ${b.eyo}`)
//     assert(b.type === eYo.T3.Expr.assignment_chain, `MISSED 1: ${b.type} === ${eYo.T3.Expr.assignment_chain}`)
//     assert(bb.type === eYo.T3.Expr.assignment_chain, `MISSED 2: ${bb.type} === ${eYo.T3.Expr.assignment_chain}`)
//     bb.dispose()
//     b.dispose()
//   })
//   it('… = (… = …)', function() {
//     var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//     var rhs_a = 'a'
//     assert(b.eyo.value_t.eyo.lastInput.eyo.connect
//     (eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, rhs_a)), 'BAD 1')
//     var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.assignment_stmt)
//     assert(bb.eyo.value_t, 'MISSING value_t')
//     assert(bb.eyo.value_t.eyo.lastInput.eyo.connect(b), 'BAD 2')
//     assert(b.type === eYo.T3.Expr.assignment_chain, `MISSED 1: ${b.type} === ${eYo.T3.Expr.assignment_chain}`)
//     assert(bb.type === eYo.T3.Stmt.assignment_stmt, `MISSED 2: ${bb.type} === ${eYo.T3.Stmt.assignment_stmt}`)
//     bb.dispose()
//   })
// })

// describe('Primary(Assignment)', function() {
//   it('basic', function() {
//     var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//     assert(b.type === eYo.T3.Expr.assignment_chain, `MISSED TYPE ${b.type} === ${eYo.T3.Expr.assignment_chain}`)
//     // targets is a promise
//     assert(!b.eyo.target_t, 'UNEXPECTED TARGETS')
//     assert(!b.eyo.value_d.isIncog(), 'UNEXPECTED INCOG')
//     b.eyo.variant_p = eYo.Key.TARGET
//     assert(!b.eyo.value_d.isIncog(), 'UNEXPECTED INCOG (2)')
//     var f = (k, b1 = b) => {
//       assert(b1.type === eYo.T3.Expr[k], `MISSED TYPE ${b1.type} === ${eYo.T3.Expr[k]}`)
//     }
//     f('assignment_chain')
//     var t = b.eyo.target_t
//     assert(t, 'MISSING TARGETS')
//     t.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a'))
//     f('assignment_chain')
//     t.eyo.lastInput.eyo.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'b'))
//     f('assignment_chain')
//     var dom = eYo.Xml.blockToDom(b)
//     // console.log(dom)
//     var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
//     f('assignment_chain', b2)
//     b2.moveBy(50, 10)
//     b.dispose(true)
//     b2.dispose(true)
//   })
//   it('f(… = …)', function() {
//     var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//      var f = (k, b1 = b) => {
//       assert(b1.type === eYo.T3.Expr[k], `MISSED TYPE ${b1.type} === ${eYo.T3.Expr[k]}`)
//     }
//     f('assignment_chain')
//     var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.call_expr)
//     var t = bb.eyo.n_ary_t
//     assert(t.eyo.lastInput.eyo.connect(b), 'BAD')
//     f('identifier_valued')
//     bb.dispose(true)
//   })
//   it('xfer name <-> targets', function() {
//     var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//     b.eyo.variant_p = eYo.Key.TARGET
//     var t = b.eyo.target_t
//     var a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a')
//     t.eyo.lastInput.eyo.connect(a)
//     assert(!b.eyo.target_t, 'UNEXPECTED NAME')
//     b.eyo.variant_p = eYo.Key.NONE
//     assert(b.eyo.target_t === a, `MISSING ${b.eyo.target_t} === ${a}`)
//     b.eyo.variant_p = eYo.Key.TARGET
//     assert(!b.eyo.target_t, 'UNEXPECTED NAME')
//     b.dispose()
//     b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
//     a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'a')
//     b.eyo.target_s.connect(a)
//     assert(b.eyo.target_t === a, `MISSING ${b.eyo.target_t} === ${a}`)
//     b.eyo.variant_p = eYo.Key.TARGET
//     assert(!b.eyo.target_t, 'UNEXPECTED NAME')
//     b.eyo.variant_p = eYo.Key.NONE
//     assert(b.eyo.target_t === a, `MISSING ${b.eyo.target_t} === ${a}`)
//     b.dispose()
//   })
//   it('…=(…=…) unique value', function() {
//     var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//     var a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//     assert(b.eyo.value_t.eyo.lastInput.eyo.connect(a), 'MISSED 1')
//     assert(b.eyo.value_t.inputList.length === 1, 'BAD 1')
//     assert(expect(a.eyo).equals(b.eyo.value_s.unwrappedTarget), 'BAD 2')
//     b.dispose()
//   })
//   it('b=rhs (dom)', function() {
//     var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier_valued)
//     b.eyo.variant_p = eYo.Key.TARGET
//     var s = b.eyo.value_s
//     var a = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'rhs')
//     assert(b.eyo.value_t.eyo.lastInput.eyo.connect(a), 'MISSED 1')
//     assert(s.unwrappedTarget === a.eyo, `MISSED ${s.unwrappedTarget} === ${a.eyo}`)
//     var dom = eYo.Xml.blockToDom(b)
//     b.dispose()
//     b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, dom)
//     assert(b, `MISSING ${dom}`)
//     assert(b.eyo.variant_p === eYo.Key.TARGET, `MISSED ${b.eyo.variant_p} === ${eYo.Key.TARGET}`)
//     var u = b.eyo.value_s.unwrappedTarget
//     assert(u, 'MISSED value')
//     assert(u.type === eYo.T3.Expr.identifier, `MISSED type: ${u.type} === ${eYo.T3.Expr.identifier}`)
//     b.dispose()
//   })
// })

// describe('Primary(Expression Assignment)', function() {
//   it('basic', function() {
//     var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.assignment_expr)
//     assert(b.eyo.variant_p === eYo.Key.COL_VALUED, `FAIL VARIANT ${b.eyo.variant_p} === ${eYo.Key.COL_VALUED}`)
//     assert(b.eyo.value_s.fields.label.getValue() === ':=')
//     b.dispose()
//   })
// })

describe('Primary(annotated)', function() {
  ;[
    'identifier_annotated',
    'augtarget_annotated',
    'key_datum'
  ].forEach(t => {
    it(`basic annotated ${t}`, function() {
      var b = eYo.Test.new_block(t)
      eYo.Test.assert_variant(b, 'ANNOTATED')
      b.dispose()
    })
  })
  it('basic connections', function() {
    var f = (t, bb, ttt, cant_connect) => {
      var b = eYo.Test.new_block(t)
      if (cant_connect) {
        chai.assert(!b.eyo.target_t.eyo.lastConnect(bb))
      } else {
        chai.assert(b.eyo.target_t.eyo.lastConnect(bb))
        chai.assert(b.eyo.target_s.unwrappedTarget === bb.eyo, `MISSED CONNECTION`)
        eYo.Test.assert_block(b, ttt || t)
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
    eYo.Test.assert_block(bb, 'dotted_name')
    chai.assert(eYo.T3.Expr.Check.augtarget.indexOf(bb.type) >= 0, 'MISSED AUGTARGET')
    f('identifier_annotated', bb, 'augtarget_annotated')
    bb.dispose()
    bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 421)
    f('identifier_annotated', bb, 'key_datum', true)
    bb.dispose()
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
      eYo.Test.assert_data_key(b, args[0], args[1])
      b.dispose()
    })
  })
})
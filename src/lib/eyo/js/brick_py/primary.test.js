describe('Primary: Initialize from models', function () {
  it ('identifier: custom', function () {
    var d = eYo.test.new_brick({
      type: eYo.t3.expr.identifier,
      target_p: 'abc'
    })
    eYo.test.brick(d, 'identifier')
    d.dispose()
  })
  it ('identifier: open', function () {
    var d = eYo.test.new_brick({
      type: eYo.t3.expr.identifier,
      target_p: 'open'
    })
    eYo.test.brick(d, 'named_call_expr')
    d.dispose()
    d = eYo.test.new_brick(eYo.t3.expr.identifier)
    eYo.test.brick(d, 'identifier')
    d.Target_p = 'open'
    eYo.test.brick(d, 'named_call_expr')
    d.variant_ = eYo.key.NONE
    eYo.test.brick(d, 'identifier')
    d.dispose()
  })
  it ('identifier: open', function () {
    var d = eYo.test.new_brick({
      type: eYo.t3.expr.identifier,
      target_p: 'abc'
    })
    d.Alias_p = 'alias'
    eYo.test.Code(d, 'abc as alias')
    d.dispose()
  })
  it ('annotated', function () {
    var d = eYo.test.new_brick({
      type: eYo.t3.expr.primary,
      target_p: 'x',
      annotated_p: 'str'
    })
    eYo.test.Code(d, 'x: str')
    d.dispose()
  })
  it ('aliased', function () {
    var d = eYo.test.new_brick({
      type: eYo.t3.expr.primary,
      target_p: 'x',
      alias_p: 'alias'
    })
    eYo.test.Code(d, 'x as alias')
    d.dispose()
  })
})

describe('Each Primary brick type', function() {
  [
    ['identifier', 'identifier', 'NONE'],
    ['identifier_annotated', 'identifier_annotated', 'ANNOTATED'],
    ['augtarget_annotated', 'identifier_annotated', 'ANNOTATED'],
    ['key_datum', 'identifier_annotated', 'ANNOTATED'],
    ['identifier_valued', 'identifier_valued', 'TARGET_VALUED'],
    ['assignment_chain', 'identifier_valued', 'TARGET_VALUED'],
    ['named_expr', 'named_expr', 'COL_VALUED'],
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
      var d = eYo.test.new_brick(Ts[0], Ts[1])
      eYo.test.c9r(d, 'primary')
      eYo.test.variant(d, Ts[2])
      d.dispose()
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
    ['named_expr', ':='],
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
      var d = eYo.test.new_brick(Ts[0])
      var dom = eYo.xml.brickToDom(d)
      var attr = dom.getAttribute(eYo.key.EYO)
      chai.assert(attr === Ts[1], `FAILED ${attr} === ${Ts[1]}`)
      d.dispose()
    })
  })
})

describe ('XML', function () {
  it ('identifier', function () {
    var dom = `<x eyo="identifier" target="a"></x>`
    var d = eYo.test.new_brick(dom)
    eYo.test.brick(d, 'identifier')
    eYo.test.Code(d, 'a')
    d.dispose()
  })
  it ('…', function () {
    var dom = `<x eyo="…" target="a"></x>`
    var d = eYo.test.new_brick(dom)
    eYo.test.brick(d, 'identifier')
    eYo.test.Code(d, 'a')
    d.dispose()
  })
  it ('data: name -> target', function() {
    var dom = `<x eyo="identifier" name="abc"></x>`
    var d = eYo.test.new_brick(dom)
    eYo.test.brick(d, 'identifier')
    eYo.test.Code(d, 'abc')
    d.dispose()
  })
  it ('slot: targets -> target', function() {
    // var d = eYo.test.new_brick('abc')
    // var dd = eYo.test.new_brick('a')
    // eYo.test.list_connect(d, 'target', dd)
    // dd = eYo.test.new_brick('d')
    // eYo.test.list_connect(d, 'target', dd)
    // dd = eYo.test.new_brick('c')
    // eYo.test.list_connect(d, 'target', dd)
    // console.error(eYo.xml.brickToDom(d).outerHTML)
    // d.dispose()
    var dom = `<x eyo="…"><x eyo="list" slot="targets"><x eyo="…" slot="O" target="a"></x><x eyo="…" slot="f" target="d"></x><x eyo="…" slot="r" target="c"></x></x></x>`
    var d = eYo.test.new_brick(dom)
    eYo.test.brick(d, 'assignment_chain')
    eYo.test.Code(d, 'a, d, c = <MISSING EXPRESSION>')
    d.dispose()
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
    'named_expr',
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
      var d = eYo.test.new_brick(t)
      var dom = eYo.xml.brickToDom(d)
      var dd = eYo.test.new_brick(dom)
      eYo.test.Same(dd, d)
      dd.dispose()
      d.dispose()
    })
  })
  var md = eYo.model.forKey(eYo.t3.expr.identifier).data
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
    var d = eYo.test.new_brick('identifier')
    d.variant_ = eYo.key[w[0]]
    eYo.test.data_key(d, k)
    if (k === 'holder') {
      d.Dotted_p = 1
    }
    w[1].forEach(v => {
      var d = d.data[k]
      d.set(v)
      var dom = eYo.xml.brickToDom(d)
      var dd = eYo.test.new_brick(dom)
      chai.expect(dd.data[k].get()).equal(d.get(), `MISSED ${k} data ${dd.data[k].get()} === ${d.get()}`)
      dd.dispose()
    })
    d.dispose()
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
  var Vs = eYo.model.forKey(eYo.t3.expr.identifier).data.variant.all
  Vs.some(to => {
    var d = eYo.test.new_brick(eYo.t3.expr.identifier)
    d.variant_ = to
    Vs.some(from => {
      it(`${from} -> ${to}`, function() {
        var dd = eYo.test.new_brick(eYo.t3.expr.identifier)
        dd.variant_ = from
        dd.variant_ = to
        eYo.test.Same(dd, d)
        dd.dispose()
      })
    })
    d.dispose()
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
    ['named_expr', 'target', 'Xholder', 'Xdotted', 'Xannotated', 'value', 'Xn_ary', 'Xslicing', 'Xalias'],
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
      var d = eYo.test.new_brick(Ts[0])
      eYo.test.incog(d, Ts)
      d.dispose()
    })
  })
})
/*
NONE, // identifier alone
        eYo.key., // foo(…)
        eYo.key., // foo[…]
        eYo.key., // foo as bar
        eYo.key., // foo : bar
        eYo.key., // foo : bar = …
        eYo.key.
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
      var d = eYo.test.new_brick('identifier')
      d.variant_ = eYo.key[Ts[0]]
      eYo.test.incog(d, Ts)
      d.dispose()
    })
  })
})

describe('Copy/Paste by data', function() {
  it('data: dotted', function() {
    var d = eYo.test.new_brick('identifier')
    chai.assert(d.Dotted_p === 0, `BAD DEFAULT DOTTED ${d.Dotted_p}`)
    eYo.test.incog(d, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    d.Dotted_p = 1
    eYo.test.incog(d, ['target', 'holder', 'dotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.test.data_save(d, 'dotted', 0)
    eYo.test.data_save(d, 'dotted', 1)
    eYo.test.data_save(d, 'dotted', 2)
    eYo.test.data_save(d, 'dotted', 3)
    d.dispose()
  })
  it('data: holder', function() {
    var d = eYo.test.new_brick('identifier')
    d.Holder_p = 'TEST'
    eYo.test.incog(d, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.test.data_save(d, 'holder', 'TEST2', true)
    d.Dotted_p = 1
    eYo.test.incog(d, ['target', 'holder', 'dotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.test.data_save(d, 'holder', 'TEST3')
    eYo.test.data_save(d, 'holder', '')
    d.dispose()
  })
  var f = (k, variant, values, ignore) => {
    it(`data: ${k}/${variant}`, function() {
      var d = eYo.test.new_brick('identifier')
      d.variant_ = eYo.key[variant] || variant
      values.forEach(v => {
        eYo.test.data_save(d, k, v)
      })
      d.dispose()
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
      eYo.test.Bind_field('identifier', k)
    })
  })
  ;[
    'n_ary',
    'slicing'
  ].forEach(k => {
    it(`bind field: ${k}`, function() {
      eYo.test.Bind_field('identifier', k, true)
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
  this.timeout(20000)
  // depending what you connect, the type may change
  // we do not manage the data content here
  it('Slot: holder/dotted', function() {
    // as long as the dotted_p is 0, holder is ignored
    var dmain = eYo.test.new_brick('identifier')
    eYo.test.Code(dmain, '<MISSING NAME>')
    var dhldr = eYo.test.new_brick('identifier')
    eYo.test.Slot_connect(dmain, 'holder', dhldr)
    eYo.test.brick(dhldr, 'identifier')
    eYo.test.brick(dmain, 'identifier')
    dhldr.Target_p = 'a'
    eYo.test.Code(dhldr, 'a')
    chai.assert(dhldr.Target_p === 'a', 'FAILED')
    chai.assert(dhldr.target_s.bind_f.text === 'a', `SYNCHRONIZE FAILED for target bind field in ${dhldr.type}`)
    chai.assert(dhldr.target_s.bind_f.visible, `INVISIBLE BIND FIELD`)
    dmain.Target_p = 'd'
    eYo.test.Code(dmain, 'd')
    dmain.Dotted_p = 1 // things change here
    eYo.test.brick(dmain, 'dotted_name')
    eYo.test.Code(dmain, 'a.d')
    dmain.Dotted_p = 2
    eYo.test.Code(dmain, '..d')
    eYo.test.brick(dmain, 'parent_module')
    eYo.test.data_key(dmain, 'target', '')
    eYo.test.Code(dmain, '..d')
    dmain.Target_p = ''
    eYo.test.Code(dmain, '..')
    eYo.test.brick(dmain, 'parent_module')
    dmain.Target_p = 'd'
    dmain.Dotted_p = 1
    eYo.test.Code(dmain, 'a.d')
    eYo.test.brick(dmain, 'dotted_name')
    dhldr.variant_ = eYo.key.CALL_EXPR
    eYo.test.Code(dmain, 'a().d')
    eYo.test.brick(dmain, 'attributeref')
    dmain.dispose()
  })
  it ('Slot target', function () {
    var da = eYo.test.new_brick('identifier', 'identifier')
    da.Target_p = 'a'
    eYo.test.brick(da, 'identifier')
    eYo.test.Code(da, 'a')
    var d = eYo.test.new_brick('identifier', 'identifier')
    d.Target_p = 'd'
    eYo.test.Code(d, 'd')
    eYo.test.list_connect(da, 'target', d)
    eYo.test.brick(da, 'identifier')
    eYo.test.Code(da, 'd')
    eYo.test.Input_length(da.target_b, 3, 'target')
    var dc = eYo.test.new_brick('identifier')
    dc.Target_p = 'c'
    da.target_b.lastConnect(dc)
    eYo.test.Code(da, 'd, c = <MISSING EXPRESSION>')
    d.dispose()
    eYo.test.Code(da, 'c = <MISSING EXPRESSION>')
    dc.dispose()
    eYo.test.Code(da, 'a = <MISSING EXPRESSION>')
    da.dispose()
  })
  it('Slot annotated', function () {
    var da = eYo.test.new_brick('identifier')
    da.Target_p = 'a'
    eYo.test.Code(da, 'a')
    eYo.test.data_key(da, 'variant', eYo.key.ANNOTATED)
    da.variant_ = eYo.key.ANNOTATED
    eYo.test.Code(da, 'a: <MISSING EXPR>')
    da.Annotated_p = 'fal ba la'
    eYo.test.Code(da, 'a: fal ba la')
    var d = eYo.test.new_brick('a_expr')
    d.Lhs_p = 'lhs'
    d.Rhs_p = 'rhs'
    eYo.test.Code(d, 'lhs + rhs')
    da.annotated_s.connect(d)
    eYo.test.Code(da, 'a: lhs + rhs')
    d.unplug()
    eYo.test.Code(da, 'a: fal ba la')
    d.dispose()
    da.dispose()
  })
  ;[
  'assignment_stmt',
  'augmented_assignment_stmt',
  'annotated_assignment_stmt',
  'assignment_chain',
  'identifier_valued',
  'named_expr',
  'identifier',
  'identifier_annotated',
  'augtarget_annotated',
  'key_datum',
  'identifier_valued',
  'assignment_chain',
  'named_expr',
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
      var da = eYo.test.new_brick(t)
      var m = da.value_b.model.list
      var unique = m.unique(eYo.t3.expr.value_list, da.type)
      var check = m.check(eYo.t3.expr.value_list, da.type)
      var all = m.all(eYo.t3.expr.value_list, da.type)
      if(da.value_s.incog) {
        if (unique !== null) {
          console.error('UNIK', unique)
        }
        chai.assert(unique === null, `MISSING UNIQUE NULL ${da.type}, ${da.subtype}`)
        chai.assert(check === null, `MISSING CHECK NULL ${da.type}, ${da.subtype}`)
        chai.assert(all === null, `MISSING ALL NULL ${da.type}, ${da.subtype}`)
      } else {
        var f = (ra, str) => {
          chai.assert(ra !== eYo.NA, `UNEXPECTED UNDEFINED ${str || ''}: ${da.type}, ${da.subtype}`)
          chai.assert(ra !== null, `UNEXPECTED NULL ${str || ''}: ${da.type}, ${da.subtype}`)
          chai.assert(ra.length !== 0, `MISSING ${str || ''}: ${da.type}, ${da.subtype}`)
        }
        f(unique, 'unique')
        f(check, 'check')
        f(all, 'all')
        chai.assert(chai.expect(da.value_b.slotAtHead.magnet.check_).equals(all), `BAD CHECK (0)`)
        chai.assert(chai.expect([].concat(unique, check)).eql(all), `BAD CHECK (0)`)
        unique.forEach(tt => {
          var d = eYo.test.new_brick(tt)
          if (tt === eYo.t3.expr.assignment_chain) {
            var dc = eYo.test.new_brick(tt)
            dc.variant_ = eYo.key.SLICING
            chai.assert(d.target_b.lastConnect(dc), `MISSED TARGET ${tt}`)
          }
          if (d.type === tt) {
            eYo.test.Input_length(da.value_b, 1)
            chai.assert(da.value_b.lastConnect(d), `MISSED VALUE ${tt}`)
            eYo.test.Input_length(da.value_b, 1)
            d.dispose()
            eYo.test.Input_length(da.value_b, 1)
          } else {
            // console.error('XO TEST FOR', tt)
            d.dispose()
          }
        })
        check.forEach(tt => {
          var d = eYo.test.new_brick(tt)
          if (tt === eYo.t3.expr.assignment_chain) {
            var dc = eYo.test.new_brick(tt)
            dc.variant_ = eYo.key.SLICING
            chai.assert(d.target_b.lastConnect(dc), `MISSED TARGET ${tt}`)
          }
          if (d.type === tt) {
            eYo.test.Input_length(da.value_b, 1)
            chai.assert(da.value_b.lastConnect(d), `MISSED VALUE ${tt}`)
            eYo.test.Input_length(da.value_b, 3)
            d.dispose()
            eYo.test.Input_length(da.value_b, 1)
          } else {
            // console.error('XO TEST FOR', tt)
            d.dispose()
          }
        })
      }
      da.dispose()
    })
    it(`value_list checks 2/2: ${t}`, function () {
      var da = eYo.test.new_brick(t)
      var m = da.value_b.model.list
      var unique = m.unique(eYo.t3.expr.value_list, da.type)
      var check = m.check(eYo.t3.expr.value_list, da.type)
      var all = m.all(eYo.t3.expr.value_list, da.type)
      if(da.value_s.incog) {
        chai.assert(unique === null, `MISSING UNIQUE NULL ${da.type}, ${da.subtype}`)
        chai.assert(check === null, `MISSING CHECK NULL ${da.type}, ${da.subtype}`)
        chai.assert(all === null, `MISSING ALL NULL ${da.type}, ${da.subtype}`)
      } else {
        var f = (ra, str) => {
          chai.assert(ra !== eYo.NA, `UNEXPECTED UNDEFINED ${str}: ${da.type}, ${da.subtype}`)
          chai.assert(ra !== null, `UNEXPECTED NULL ${str}: ${da.type}, ${da.subtype}`)
          chai.assert(ra.length !== 0, `MISSING ${str}: ${da.type}, ${da.subtype}`)
        }
        f(unique, 'unique')
        f(check, 'check')
        f(all, 'all')
        chai.assert(chai.expect(da.value_b.slotAtHead.magnet.check_).equals(all), `BAD CHECK (0)`)
        chai.assert(chai.expect([].concat(unique, check)).eql(all), `BAD CHECK (0)`)
        unique.forEach(tt => {
          var d = eYo.test.new_brick(tt)
          if (tt === eYo.t3.expr.assignment_chain) {
            var dc = eYo.test.new_brick(tt)
            dc.variant_ = eYo.key.SLICING
            chai.assert(d.target_b.lastConnect(dc), `MISSED TARGET ${tt}`)
          }
          if (d.type === tt) {
            eYo.test.Input_length(da.value_b, 1)
            chai.assert(da.value_b.lastConnect(d), `MISSED VALUE ${tt}`)
            eYo.test.Input_length(da.value_b, 1)
            d.dispose()
            eYo.test.Input_length(da.value_b, 1)
          } else {
            // console.error('NO TEST FOR', tt)
            d.dispose()
          }
        })
        check.forEach(tt => {
          var d = eYo.test.new_brick(tt)
          if (tt === eYo.t3.expr.assignment_chain) {
            var dc = eYo.test.new_brick(tt)
            dc.variant_ = eYo.key.SLICING
            chai.assert(d.target_b.lastConnect(dc), `MISSED TARGET ${tt}`)
          }
          if (d.type === tt) {
            eYo.test.Input_length(da.value_b, 1)
            chai.assert(da.value_b.lastConnect(d), `MISSED VALUE ${tt}`)
            eYo.test.Input_length(da.value_b, 3)
            d.dispose()
            eYo.test.Input_length(da.value_b, 1)
          } else {
            // console.error('XO TEST FOR', tt)
            d.dispose()
          }
        })
      }
      da.dispose()
    })
  })
  it('Slot value', function () {
    var da = eYo.test.new_brick('identifier')
    da.Target_p = 'a'
    eYo.test.Code(da, 'a')
    eYo.test.data_key(da, 'variant', eYo.key.TARGET_VALUED)
    da.variant_ = eYo.key.TARGET_VALUED
    eYo.test.brick(da, 'identifier_valued')
    eYo.test.Code(da, 'a = <MISSING EXPRESSION>')
    da.Value_p = 'value'
    eYo.test.Code(da, 'a = value')
    var d = eYo.test.new_brick('identifier')
    d.Target_p = 'd'
    eYo.test.Code(d, 'd')
    da.value_b.lastConnect(d)
    eYo.test.Code(da, 'a = d')
    var dc = eYo.test.new_brick('identifier')
    dc.Target_p = 'c'
    eYo.test.Code(dc, 'c')
    // console.error(da.value_b.slotAtHead.magnet.check_)
    // console.error(da.value_b.slotAtHead[eYo.$next].magnet.check_)
    // console.error(da.value_b.slotAtHead[eYo.$next][eYo.$next].magnet.check_)
    chai.assert(da.value_b.lastConnect(dc), 'MISSED')
    eYo.test.Code(da, 'a = d, c')
    da.variant_ = eYo.key.ANNOTATED
    eYo.test.Code(da, 'a: <MISSING EXPR>')
    da.variant_ = eYo.key.ANNOTATED_VALUED
    eYo.test.Code(da, 'a: <MISSING EXPR> = d, c')
    da.variant_ = eYo.key.TARGET_VALUED
    eYo.test.Code(da, 'a = d, c')
    d.unplug()
    eYo.test.Code(da, 'a = c')
    dc.variant_ = eYo.key.TARGET_VALUED
    eYo.test.brick(dc, 'assignment_chain') // c is unique and connect
    eYo.test.Code(da, 'a = c = <MISSING EXPRESSION>')
    eYo.test.Input_length(da.value_b, 1)
    dc.variant_ = eYo.key.SLICING // c is no longer unique
    eYo.test.brick(dc, 'named_subscription')
    eYo.test.Code(da, 'a = c[<MISSING INPUT>]')
    eYo.test.Input_length(da.value_b, 3)
    chai.assert(da.value_b.lastConnect(d), 'MISSED')
    eYo.test.Input_length(da.value_b, 5)
    eYo.test.Code(da, 'a = c[<MISSING INPUT>], d')
    chai.assert(da.value_b.slotAtHead[eYo.$next][eYo.$next][eYo.$next][eYo.$next].connect(dc), 'MISSED')
    eYo.test.Code(da, 'a = d, c[<MISSING INPUT>]')
    eYo.test.Input_length(da.value_b, 5)
    d.dispose()
    d = eYo.test.new_brick('yield_expr')
    chai.assert(da.value_b.slotAtHead[eYo.$next].connect(d), 'MISSED')
    eYo.test.Input_length(da.value_b, 1)
    chai.assert(!dc.out_m.targetBrick)
    dc.dispose()
    da.dispose()
  })
})

describe('Primary types', function() {
  var d = eYo.test.new_brick(eYo.t3.expr.identifier)
  var ctor_key = d.constructor.key
  d.dispose()
  var f = (k1, k2) => {
    it(`types ${k1}/${k2 || k1}`, function() {
      var t1 = eYo.t3.expr[k1]
      chai.assert(t1, `UNKNOWN ${k1}`)
      var t2 = eYo.t3.expr[k2 || k1]
      chai.assert(t2, `UNKNOWN ${k2}`)
      var d = eYo.test.new_brick(t1, t2)
      chai.assert(d, `MISSING ${t1}`)
      eYo.test.c9r(d, ctor_key)
      d.dispose()
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
    var d = eYo.test.new_brick('identifier_valued')
    var rhs = 'rhs'
    d.Value_p = rhs
    chai.assert(d.Value_p === rhs, `BAD ${d.Value_p} === ${rhs}`)
    var dom = eYo.xml.brickToDom(d)
    d.dispose()
    console.error(dom)
    f = (t, expected) => {
      dom.setAttribute(eYo.key.EYO, t)
      expected = eYo.t3.expr[expected] || eYo.t3.expr.identifier_valued
      var d2 = eYo.test.new_brick(dom)
      eYo.test.brick(d2, expected)
      chai.assert(d2.value_s, `MISSING VALUE SLOT ${t}`)
      chai.assert(!d2.value_s.incog, `UNEXPECTED VALUE INCOG ${t}`)
      chai.assert(d2.Value_p === rhs, `MISSED VALUE ${d2.Value_p} === ${rhs}`)
      d2.dispose()
    }
    f('identifier_valued')
    f('assignment_chain')
    f('named_expr', 'named_expr')
  })
})

describe('Primary(value_list)', function() {
  it('basic', function() {
    var dd = eYo.test.new_brick('value_list', 'value_list')
    eYo.test.Input_length(dd, 1)
    dd.dispose()
    dd = eYo.test.new_brick('identifier', 'identifier')
    var d = dd.value_b
    eYo.test.brick(d, 'value_list')
    eYo.test.Input_length(d, 1)
    dd.dispose()
  })
  it('void unwrapped', function() {
    var d = eYo.test.new_brick(eYo.t3.expr.value_list)
    chai.assert(d, 'MISSED')
    chai.expect(Object.keys(d.slots).length).equal(1)
    var model = d.consolidator.model
    console.error('ALL', d.type, d.subtype, model.all(d.type, d.subtype))
    var check = d.slotAtHead.magnet.check_
    chai.assert(check === null, 'BAD 1')
    // expect(model).to.have.all.keys('unique', 'all', 'check')
    chai.assert(chai.expect(check).equal(model.all(d.type, d.subtype)), `MISMATCH 1`)
    chai.assert(chai.expect(null).equal(model.all(d.type, d.subtype)), `MISMATCH 1`)
    chai.assert(chai.expect(null).equal(model.check(d.type, d.subtype)), `MISMATCH 2`)
    chai.assert(chai.expect(null).equal(model.unique(d.type, d.subtype)), `MISMATCH 3`)
    d.dispose()
  })
  it('void wrapped', function() {
    var dd = eYo.test.new_brick('identifier_valued')
    eYo.test.c9r(dd, 'primary')
    var d = dd.value_b
    eYo.test.brick(d, 'value_list')
    eYo.test.Input_length(d, 1)
    var model = d.consolidator.model
    var check = d.slotAtHead.magnet.check_
    chai.assert(chai.expect(check).equal(model.all(d.type, d.subtype)),`MISMATCH 1`)
    chai.assert(chai.expect(check).to.not.equal(model.check(d.type, d.subtype)),`MISMATCH 2`)
    chai.assert(chai.expect(check).to.not.equal(model.unique(d.type, d.subtype)),`MISMATCH 3`)
    dd.dispose()
  })
  it('non void wrapped', function() {
    var dd = eYo.test.new_brick('identifier_valued')
    var d = dd.value_b
    eYo.test.Subtype(d, 'identifier_valued')
    d.lastSlot.connect(eYo.test.new_brick('a'))
    eYo.test.Input_length(d, 3)
    var model = d.consolidator.model
    var check = d.slotAtHead.magnet.check_
    var model_check = model.check(d.type, d.subtype)
    var model_all = model.all(d.type, d.subtype)
    var model_unique = model.unique(d.type, d.subtype)
    chai.assert(chai.expect(check).equal(model_check), `MISMATCH 01`)
    chai.assert(chai.expect(check).to.not.equal(model_all), `MISMATCH 02`)
    chai.assert(chai.expect(check).to.not.equal(model_unique), `MISMATCH 03`)
    check = d.slotAtHead[eYo.$next].magnet.check_
    chai.assert(chai.expect(check).equal(model_all), `MISMATCH 11`)
    chai.assert(chai.expect(check).to.not.equal(model_check), `MISMATCH 12`)
    chai.assert(chai.expect(check).to.not.equal(model_unique), `MISMATCH 13`)
    check = d.slotAtHead[eYo.$next][eYo.$next].magnet.check_
    chai.assert(chai.expect(check).equal(model_check), `MISMATCH 21`)
    chai.assert(chai.expect(check).to.not.equal(model_all), `MISMATCH 22`)
    chai.assert(chai.expect(check).to.not.equal(model_unique), `MISMATCH 23`)
    dd.dispose()
  })
  it('non void (=) wrapped', function() {
    var dd = eYo.test.new_brick('identifier_valued')
    var d = dd.value_b
    d.lastSlot.connect(eYo.test.new_brick('identifier_valued'))
    chai.expect(Object.keys(d.slots).length).equal(1)
    var model = d.consolidator.model
    var check = d.slotAtHead.magnet.check_
    var model_check = model.check(d.type, d.subtype)
    var model_all = model.all(d.type, d.subtype)
    var model_unique = model.unique(d.type, d.subtype)
    chai.assert(chai.expect(check).equal(model_all), `MISMATCH 01`)
    chai.assert(chai.expect(check).to.not.equal(model_check), `MISMATCH 02`)
    chai.assert(chai.expect(check).to.not.equal(model_unique), `MISMATCH 03`)
    dd.dispose()
  })
})

describe('Primary(DEFINED)', function() {
  it('value data', function() {
    var d = eYo.test.new_brick('identifier_valued')
    var rhs = 'rhs'
    d.Value_p = rhs
    chai.assert(d.Value_p === rhs, `MISSED ${d.Value_p} === ${rhs}`)
    var dom = eYo.xml.brickToDom(d)
    d.dispose()
    d = eYo.test.new_brick(dom)
    chai.assert(d.Value_p === rhs, `MISSED ${d.Value_p} === ${rhs}`)
    d.dispose()
  })
  it('… = rhs', function() {
    var d = eYo.test.new_brick('identifier_valued')
    var rhs = 'rhs'
    eYo.test.list_connect(d, 'value', eYo.test.new_brick(rhs))
    var u = d.value_s.unwrappedTarget
    chai.assert(u.Target_p === rhs, `MISSED ${u.Target_p} === ${rhs}`)
    // d.moveBy(eYo.geom.pPoint(20, 20))
    var dom = eYo.xml.brickToDom(d)
    d.dispose()
    d = eYo.test.new_brick(dom)
    u = d.value_s.unwrappedTarget
    chai.assert(u.Target_p === rhs, `MISSED ${u.Target_p} === ${rhs}`)
    d.dispose()
  })
  it('… = a, d', function() {
    var d = eYo.test.new_brick('identifier_valued')
    var rhs_a = 'a'
    eYo.test.list_connect(d, 'value', eYo.test.new_brick(rhs_a))
    var rhs_b = 'd'
    eYo.test.list_connect(d, 'value', eYo.test.new_brick(rhs_b))
    var u = d.value_s.unwrappedTarget
    chai.assert(u.Target_p === rhs_a, `MISSED ${u.Target_p} === ${rhs_a}`)
    // d.moveBy(eYo.geom.pPoint(20, 20))
    var dom = eYo.xml.brickToDom(d)
    d.dispose()
    d = eYo.test.new_brick(dom)
    u = d.value_s.unwrappedTarget
    chai.assert(u.Target_p === rhs_a, `MISSED ${u.Target_p} === ${rhs_a}`)
    eYo.test.Input_length(d.value_b, 5)
    var name = d.value_b.slotAtHead[eYo.$next][eYo.$next][eYo.$next].targetBrick.Target_p
    chai.assert(name = rhs_b, `MISSED ${name} = ${rhs_b}`)
    d.dispose()
  })
  it('… = (… = …)', function() {
    var d = eYo.test.new_brick('identifier_valued')
    var rhs_a = 'a'
    eYo.test.list_connect(d, 'value', eYo.test.new_brick(rhs_a))
    var dd = eYo.test.new_brick('identifier_valued')
    eYo.test.list_connect(dd, 'value', d)
    eYo.test.brick(d, 'assignment_chain')
    console.log(dd.getProfile())
    eYo.test.brick(dd, 'assignment_chain')
    dd.dispose()
  })
  it('… = (… = …)', function() {
    var d = eYo.test.new_brick('identifier_valued')
    var rhs_a = 'a'
    eYo.test.list_connect(d, 'value', eYo.test.new_brick(rhs_a))
    var dd = eYo.test.new_brick(eYo.t3.stmt.assignment_stmt)
    eYo.test.list_connect(dd, 'value', d)
    eYo.test.brick(d, 'assignment_chain')
    eYo.test.brick(dd, 'assignment_stmt')
    dd.dispose()
  })
})

describe('Primary(Assignment)', function() {
  it('basic', function() {
    var d = eYo.test.new_brick('identifier_valued', 'identifier_valued')
    eYo.test.incog(d, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'value', 'Xn_ary', 'Xslicing', 'Xalias'])
    var f = (k, d1 = d) => {
      eYo.test.brick(d1, k)
    }
    f('identifier_valued')
    eYo.test.list_connect(d, 'target', eYo.test.new_brick('a'))
    var t = d.target_b
    f('identifier_valued')
    eYo.test.list_connect(d, 'target', eYo.test.new_brick('d')) // 2nd target
    f('assignment_chain')
    var dom = eYo.xml.brickToDom(d)
    d.dispose()
    // console.log(dom)
    var d2 = eYo.test.new_brick(dom)
    f('assignment_chain', d2)
    d2.moveBy(eYo.geom.pPoint(50, 10))
    d2.dispose()
  })
  it('f(… = …)', function() {
    var d = eYo.test.new_brick('identifier_valued')
     var f = (k, d1 = d) => {
      eYo.test.brick(d1, k)
    }
    f('identifier_valued')
    var dd = eYo.test.new_brick(eYo.t3.expr.call_expr)
    eYo.test.list_connect(dd, 'n_ary', d)
    f('identifier_valued')
    dd.dispose(true)
  })
  it('…=(…=…) unique value', function() {
    var d = eYo.test.new_brick('identifier_valued')
    var a = eYo.test.new_brick('identifier_valued')
    eYo.test.list_connect(d, 'value', a)
    eYo.test.Input_length(d.value_b, 1)
    d.dispose()
  })
  it('d=rhs (dom)', function() {
    var d = eYo.test.new_brick('identifier_valued')
    d.variant_ = eYo.key.TARGET_VALUED
    var a = eYo.test.new_brick('rhs')
    eYo.test.list_connect(d, 'value', a)
    var dom = eYo.xml.brickToDom(d)
    d.dispose()
    d = eYo.test.new_brick(dom)
    chai.assert(d, `MISSING ${dom}`)
    eYo.test.variant(d, 'TARGET_VALUED')
    var du = d.value_s.unwrappedTarget
    chai.assert(du, 'MISSED value')
    eYo.test.brick(du, 'identifier')
    d.dispose()
  })
})

describe('Primary(Expression Assignment)', function() {
  it('basic', function() {
    var d = eYo.test.new_brick(eYo.t3.expr.named_expr)
    eYo.test.variant(d, 'COL_VALUED')
    chai.expect(d.value_s.label_f.getValue()).equal(':=')
    d.dispose()
  })
})

describe('Primary(ANNOTATED)', function() {
  this.timeout(5000)
  ;[
    'identifier_annotated',
    'augtarget_annotated',
    'key_datum'
  ].forEach(t => {
    it(`basic annotated ${t}`, function() {
      var d = eYo.test.new_brick(t)
      eYo.test.variant(d, 'ANNOTATED')
      d.dispose()
    })
  })
  it('basic connections', function() {
    var f = (t, dd, ttt, cant_connect) => {
      var d = eYo.test.new_brick(t)
      if (cant_connect) {
        chai.assert(!d.target_s.listConnect(dd))
      } else {
        eYo.test.list_connect(d, 'target', dd)
        eYo.test.brick(d, ttt || t)
        dd.unplug()
      }
      d.dispose()
    }
    var dd = eYo.test.new_brick('identifier')
    f('identifier_annotated', dd, 'identifier_annotated')
    f('augtarget_annotated', dd, 'identifier_annotated')
    f('key_datum', dd, 'identifier_annotated')
    dd.target_d.set('y')
    dd.dotted_d.set(1)
    dd.holder_d.set('x')
    eYo.test.brick(dd, 'dotted_name')
    chai.assert(eYo.t3.expr.check.augtarget.indexOf(dd.type) >= 0, 'MISSED AUGTARGET')
    f('identifier_annotated', dd, 'augtarget_annotated')
    dd.dispose()
    dd = eYo.test.new_brick(421)
    f('identifier_annotated', dd, 'key_datum')
    dd.dispose()
  })
  it('type change', function() {
    var d = eYo.test.new_brick('identifier_annotated')
    d.Target_p = 'abc'
    eYo.test.variant(d, 'ANNOTATED')
    eYo.test.Code(d, 'abc: <MISSING EXPR>')
    d.Annotated_p = 'str'
    eYo.test.Code(d, 'abc: str')
    eYo.test.Input_length(d.target_b, 1)
    var dd = eYo.test.new_brick('identifier')
    dd.Target_p = 'dd'
    eYo.test.Code(dd, 'dd')
    eYo.test.list_connect(d, 'target', dd)
    eYo.test.Input_length(d.target_b, 3)
    eYo.test.variant(d, d.variant_ = eYo.key.ANNOTATED)
    eYo.test.Code(d, 'dd: str')

    var cc = eYo.test.new_brick('identifier')
    cc.Target_p = 'cc'
    eYo.test.Code(cc, 'cc')

    eYo.test.list_connect(d, 'target', cc)
    eYo.test.Input_length(d.target_b, 5)
    eYo.test.Code(d, 'dd, cc = <MISSING EXPRESSION>')

    eYo.test.variant(d, 'TARGET_VALUED')
    cc.dispose()
    eYo.test.variant(d, 'TARGET_VALUED')
    d.variant_ = eYo.key.ANNOTATED
    eYo.test.variant(d, 'ANNOTATED')

    d.Annotated_p = 'str'
    eYo.test.brick(d, 'identifier_annotated')
    eYo.test.Code(d, 'dd: str')
    dd.variant_ = eYo.key.CALL_EXPR
    eYo.test.Code(d, 'dd(): str')
    eYo.test.brick(d, 'key_datum')
    dd.variant_ = eYo.key.SLICING
    eYo.test.incog(dd, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'slicing', 'Xalias'])
    eYo.test.list_connect(dd, 'slicing', eYo.test.new_brick(421))
    eYo.test.Code(d, 'dd[421]: str')
    eYo.test.brick(d, 'augtarget_annotated')
    dd.variant_ = eYo.key.NONE
    eYo.test.incog(dd, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.test.Code(d, 'dd: str')
    eYo.test.brick(d, 'identifier_annotated')
    dd.variant_ = eYo.key.SLICING
    eYo.test.incog(dd, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'slicing', 'Xalias'])
    eYo.test.Code(d, 'dd[421]: str')
    eYo.test.brick(d, 'augtarget_annotated')
    dd.variant_ = eYo.key.CALL_EXPR
    eYo.test.incog(dd, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'n_ary', 'Xslicing', 'Xalias'])
    eYo.test.Code(d, 'dd(): str')
    eYo.test.brick(d, 'key_datum')
    dd.variant_ = eYo.key.NONE
    eYo.test.incog(dd, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.test.Code(d, 'dd: str')
    eYo.test.brick(d, 'identifier_annotated')
    d.dispose()
  })
})

describe('Primary(ALIASED)', function() {
  this.timeout(5000)
  ;[
    'identifier_as',
    'dotted_name_as',
    'expression_as'
  ].forEach(t => {
    it(`basic aliased ${t}`, function() {
      var d = eYo.test.new_brick(t)
      eYo.test.variant(d, 'ALIASED')
      d.dispose()
    })
  })
  it ('Connections', function () {
    var d = eYo.test.new_brick('identifier')
    d.Alias_p = 'alias'
    eYo.test.brick(d, 'identifier_as')
    eYo.test.Code(d, '<MISSING NAME> as alias')
    d.dispose()
    d = eYo.test.new_brick('identifier')
    var dd = eYo.test.new_brick('identifier')
    d.alias_s.connect(dd)
    eYo.test.brick(d, 'identifier_as')
    eYo.test.Code(d, '<MISSING NAME> as <MISSING NAME>')
    dd.dispose()
    eYo.test.brick(d, 'identifier_as')
    eYo.test.Code(d, '<MISSING NAME> as <MISSING NAME>')
    d.dispose()
  })
})

describe ('Primary data by key', function () {
  ;[
    ['target', 'y'],
    ['dotted', 2],
    ['holder', 'x'],
  ].forEach(args => {
    it (`${args[0]} -> ${args[1]}`, function () {
      var d = eYo.test.new_brick('identifier')
      eYo.test.data_key(d, args[0], args[1])
      d.dispose()
    })
  })
})

console.log('RUNNING PRIMARY BLOCK TESTS')

describe('Initialize from models', function () {
  it ('identifier: custom', function () {
    var d = eYo.Test.new_dlgt({
      type: eYo.T3.Expr.identifier,
      target_p: 'abc'
    })
    eYo.Test.brick(d, 'identifier')
    d.dispose()
  })
  it ('identifier: open', function () {
    var d = eYo.Test.new_dlgt({
      type: eYo.T3.Expr.identifier,
      target_p: 'open'
    })
    eYo.Test.brick(d, 'named_call_expr')
    d.dispose()
    d = eYo.Test.new_dlgt(eYo.T3.Expr.identifier)
    eYo.Test.brick(d, 'identifier')
    d.target_p = 'open'
    eYo.Test.brick(d, 'named_call_expr')
    d.variant_p = eYo.Key.NONE
    eYo.Test.brick(d, 'identifier')
    d.dispose()
  })
  it ('identifier: open', function () {
    var d = eYo.Test.new_dlgt({
      type: eYo.T3.Expr.identifier,
      target_p: 'abc'
    })
    d.alias_p = 'alias'
    eYo.Test.code(d, 'abc as alias')
    d.dispose()
  })
  it ('annotated', function () {
    var d = eYo.Test.new_dlgt({
      type: eYo.T3.Expr.primary,
      target_p: 'x',
      annotated_p: 'str'
    })
    eYo.Test.code(d, 'x: str')
    d.dispose()
  })
  it ('aliased', function () {
    var d = eYo.Test.new_dlgt({
      type: eYo.T3.Expr.primary,
      target_p: 'x',
      alias_p: 'alias'
    })
    eYo.Test.code(d, 'x as alias')
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
      var d = eYo.Test.new_dlgt(Ts[0], Ts[1])
      eYo.Test.ctor(d, 'primary')
      eYo.Test.variant(d, Ts[2])
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
      var d = eYo.Test.new_dlgt(Ts[0])
      var dom = eYo.Xml.brickToDom(d)
      var attr = dom.getAttribute(eYo.Key.EYO)
      chai.assert(attr === Ts[1], `FAILED ${attr} === ${Ts[1]}`)
      d.dispose()
    })
  })
})

describe ('XML', function () {
  it ('identifier', function () {
    var dom = `<x eyo="identifier" target="a"></x>`
    var d = eYo.Test.new_dlgt(dom)
    eYo.Test.brick(d, 'identifier')
    eYo.Test.code(d, 'a')
    d.dispose()
  })
  it ('…', function () {
    var dom = `<x eyo="…" target="a"></x>`
    var d = eYo.Test.new_dlgt(dom)
    eYo.Test.brick(d, 'identifier')
    eYo.Test.code(d, 'a')
    d.dispose()
  })
  it ('data: name -> target', function() {
    var dom = `<x eyo="identifier" name="abc"></x>`
    var d = eYo.Test.new_dlgt(dom)
    eYo.Test.brick(d, 'identifier')
    eYo.Test.code(d, 'abc')
    d.dispose()
  })
  it ('slot: targets -> target', function() {
    // var d = eYo.Test.new_dlgt('abc')
    // var dd = eYo.Test.new_dlgt('a')
    // eYo.Test.list_connect(d, 'target', dd)
    // dd = eYo.Test.new_dlgt('d')
    // eYo.Test.list_connect(d, 'target', dd)
    // dd = eYo.Test.new_dlgt('c')
    // eYo.Test.list_connect(d, 'target', dd)
    // console.error(eYo.Xml.brickToDom(d).outerHTML)
    // d.dispose()
    var dom = `<x eyo="…"><x eyo="list" slot="targets"><x eyo="…" slot="O" target="a"></x><x eyo="…" slot="f" target="d"></x><x eyo="…" slot="r" target="c"></x></x></x>`
    var d = eYo.Test.new_dlgt(dom)
    eYo.Test.brick(d, 'assignment_chain')
    eYo.Test.code(d, 'a, d, c = <MISSING EXPRESSION>')
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
      var d = eYo.Test.new_dlgt(t)
      var dom = eYo.Xml.brickToDom(d)
      var dd = eYo.Test.new_dlgt(dom)
      eYo.Test.same(dd, d)
      dd.dispose()
      d.dispose()
    })
  })
  var md = eYo.Brick.Manager.getModel(eYo.T3.Expr.identifier).data
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
    var d = eYo.Test.new_dlgt('identifier')
    d.variant_p = eYo.Key[w[0]]
    eYo.Test.data_key(d, k)
    if (k === 'holder') {
      d.dotted_p = 1
    }
    w[1].forEach(v => {
      var d = d.data[k]
      d.set(v)
      var dom = eYo.Xml.brickToDom(d)
      var dd = eYo.Test.new_dlgt(dom)
      chai.assert(dd.data[k].get() === d.get(), `MISSED ${k} data ${dd.data[k].get()} === ${d.get()}`)
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
  var Vs = eYo.Brick.Manager.getModel(eYo.T3.Expr.identifier).data.variant.all
  Vs.some(to => {
    var d = eYo.Test.new_dlgt(eYo.T3.Expr.identifier)
    d.variant_p = to
    Vs.some(from => {
      it(`${from} -> ${to}`, function() {
        var dd = eYo.Test.new_dlgt(eYo.T3.Expr.identifier)
        dd.variant_p = from
        dd.variant_p = to
        eYo.Test.same(dd, d)
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
      var d = eYo.Test.new_dlgt(Ts[0])
      eYo.Test.incog(d, Ts)
      d.dispose()
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
      var d = eYo.Test.new_dlgt('identifier')
      d.variant_p = eYo.Key[Ts[0]]
      eYo.Test.incog(d, Ts)
      d.dispose()
    })
  })
})

describe('Copy/Paste by data', function() {
  it('data: dotted', function() {
    var d = eYo.Test.new_dlgt('identifier')
    chai.assert(d.dotted_p === 0, `BAD DEFAULT DOTTED ${d.dotted_p}`)
    eYo.Test.incog(d, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    d.dotted_p = 1
    eYo.Test.incog(d, ['target', 'holder', 'dotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.Test.data_save(d, 'dotted', 0)
    eYo.Test.data_save(d, 'dotted', 1)
    eYo.Test.data_save(d, 'dotted', 2)
    eYo.Test.data_save(d, 'dotted', 3)
    d.dispose()
  })
  it('data: holder', function() {
    var d = eYo.Test.new_dlgt('identifier')
    d.holder_p = 'TEST'
    eYo.Test.incog(d, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.Test.data_save(d, 'holder', 'TEST2', true)
    d.dotted_p = 1
    eYo.Test.incog(d, ['target', 'holder', 'dotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.Test.data_save(d, 'holder', 'TEST3')
    eYo.Test.data_save(d, 'holder', '')
    d.dispose()
  })
  var f = (k, variant, values, ignore) => {
    it(`data: ${k}/${variant}`, function() {
      var d = eYo.Test.new_dlgt('identifier')
      d.variant_p = eYo.Key[variant] || variant
      values.forEach(v => {
        eYo.Test.data_save(d, k, v)
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
  this.timeout(10000)
  // depending what you connect, the type may change
  // we do not manage the data content here
  it('Slot: holder/dotted', function() {
    // as long as the dotted_p is 0, holder is ignored
    var dmain = eYo.Test.new_dlgt('identifier')
    eYo.Test.code(dmain, '<MISSING NAME>')
    var dhldr = eYo.Test.new_dlgt('identifier')
    eYo.Test.slot_connect(dmain, 'holder', dhldr)
    eYo.Test.brick(dhldr, 'identifier')
    eYo.Test.brick(dmain, 'identifier')
    dhldr.target_p = 'a'
    eYo.Test.code(dhldr, 'a')
    chai.assert(dhldr.target_p === 'a', 'FAILED')
    chai.assert(dhldr.target_s.fields.bind.getText() === 'a', `SYNCHRONIZE FAILED for target bind field in ${dhldr.type}`)
    chai.assert(dhldr.target_s.fields.bind.isVisible(), `INVISIBLE BIND FIELD`)
    dmain.target_p = 'd'
    eYo.Test.code(dmain, 'd')
    dmain.dotted_p = 1 // things change here
    eYo.Test.brick(dmain, 'dotted_name')
    eYo.Test.code(dmain, 'a.d')
    dmain.dotted_p = 2
    eYo.Test.code(dmain, '..d')
    eYo.Test.brick(dmain, 'parent_module')
    eYo.Test.data_key(dmain, 'target', '')
    eYo.Test.code(dmain, '..d')
    dmain.target_p = ''
    eYo.Test.code(dmain, '..')
    eYo.Test.brick(dmain, 'parent_module')
    dmain.target_p = 'd'
    dmain.dotted_p = 1
    eYo.Test.code(dmain, 'a.d')
    eYo.Test.brick(dmain, 'dotted_name')
    dhldr.variant_p = eYo.Key.CALL_EXPR
    eYo.Test.code(dmain, 'a().d')
    eYo.Test.brick(dmain, 'attributeref')
    dmain.dispose()
  })
  it ('Slot target', function () {
    var da = eYo.Test.new_dlgt('identifier', 'identifier')
    da.target_p = 'a'
    eYo.Test.brick(da, 'identifier')
    eYo.Test.code(da, 'a')
    var d = eYo.Test.new_dlgt('identifier', 'identifier')
    d.target_p = 'd'
    eYo.Test.code(d, 'd')
    eYo.Test.list_connect(da, 'target', d)
    eYo.Test.brick(da, 'identifier')
    eYo.Test.code(da, 'd')
    eYo.Test.input_length(da.target_b, 3, 'target')
    var dc = eYo.Test.new_dlgt('identifier')
    dc.target_p = 'c'
    da.target_t.lastConnect(dc)
    eYo.Test.code(da, 'd, c = <MISSING EXPRESSION>')
    d.dispose()
    eYo.Test.code(da, 'c = <MISSING EXPRESSION>')
    dc.dispose()
    eYo.Test.code(da, 'a = <MISSING EXPRESSION>')
    da.dispose()
  })
  it('Slot annotated', function () {
    var da = eYo.Test.new_dlgt('identifier')
    da.target_p = 'a'
    eYo.Test.code(da, 'a')
    eYo.Test.data_key(da, 'variant', eYo.Key.ANNOTATED)
    da.variant_p = eYo.Key.ANNOTATED
    eYo.Test.code(da, 'a: <MISSING EXPR>')
    da.annotated_p = 'fal ba la'
    eYo.Test.code(da, 'a: fal ba la')
    var d = eYo.Test.new_dlgt('a_expr')
    d.lhs_p = 'lhs'
    d.rhs_p = 'rhs'
    eYo.Test.code(d, 'lhs + rhs')
    da.annotated_s.connect(d)
    eYo.Test.code(da, 'a: lhs + rhs')
    d.unplug()
    eYo.Test.code(da, 'a: fal ba la')
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
      var da = eYo.Test.new_dlgt(t)
      var m = da.value_t.model.list
      var unique = m.unique(eYo.T3.Expr.value_list, da.type)
      var check = m.check(eYo.T3.Expr.value_list, da.type)
      var all = m.all(eYo.T3.Expr.value_list, da.type)
      if(da.value_s.incog) {
        if (unique !== null) {
          console.error('UNIK', unique)
        }
        chai.assert(unique === null, `MISSING UNIQUE NULL ${da.type}, ${da.subtype}`)
        chai.assert(check === null, `MISSING CHECK NULL ${da.type}, ${da.subtype}`)
        chai.assert(all === null, `MISSING ALL NULL ${da.type}, ${da.subtype}`)
      } else {
        var f = (ra, str) => {
          chai.assert(ra !== undefined, `UNEXPECTED UNDEFINED ${str || ''}: ${da.type}, ${da.subtype}`)
          chai.assert(ra !== null, `UNEXPECTED NULL ${str || ''}: ${da.type}, ${da.subtype}`)
          chai.assert(ra.length !== 0, `MISSING ${str || ''}: ${da.type}, ${da.subtype}`)
        }
        f(unique, 'unique')
        f(check, 'check')
        f(all, 'all')
        chai.assert(chai.expect(da.value_b.inputList[0].connection.check_).equals(all), `BAD CHECK (0)`)
        chai.assert(chai.expect(goog.array.concat(unique, check)).eql(all), `BAD CHECK (0)`)
        unique.forEach(tt => {
          var d = eYo.Test.new_dlgt(tt)
          if (tt === eYo.T3.Expr.assignment_chain) {
            var dc = eYo.Test.new_dlgt(tt)
            dc.variant_p = eYo.Key.SLICING
            chai.assert(d.target_t.lastConnect(dc), `MISSED TARGET ${tt}`)
          }
          if (d.type === tt) {
            eYo.Test.input_length(da.value_b, 1)
            chai.assert(da.value_t.lastConnect(d), `MISSED VALUE ${tt}`)
            eYo.Test.input_length(da.value_b, 1)
            d.dispose()
            eYo.Test.input_length(da.value_b, 1)
          } else {
            // console.error('XO TEST FOR', tt)
            d.dispose()
          }
        })
        check.forEach(tt => {
          var d = eYo.Test.new_dlgt(tt)
          if (tt === eYo.T3.Expr.assignment_chain) {
            var dc = eYo.Test.new_dlgt(tt)
            dc.variant_p = eYo.Key.SLICING
            chai.assert(d.target_t.lastConnect(dc), `MISSED TARGET ${tt}`)
          }
          if (d.type === tt) {
            eYo.Test.input_length(da.value_b, 1)
            chai.assert(da.value_t.lastConnect(d), `MISSED VALUE ${tt}`)
            eYo.Test.input_length(da.value_b, 3)
            d.dispose()
            eYo.Test.input_length(da.value_b, 1)
          } else {
            // console.error('XO TEST FOR', tt)
            d.dispose()
          }
        })
      }
      da.dispose()
    })
    it(`value_list checks 2/2: ${t}`, function () {
      var da = eYo.Test.new_dlgt(t)
      var m = da.value_t.model.list
      var unique = m.unique(eYo.T3.Expr.value_list, da.type)
      var check = m.check(eYo.T3.Expr.value_list, da.type)
      var all = m.all(eYo.T3.Expr.value_list, da.type)
      if(da.value_s.incog) {
        chai.assert(unique === null, `MISSING UNIQUE NULL ${da.type}, ${da.subtype}`)
        chai.assert(check === null, `MISSING CHECK NULL ${da.type}, ${da.subtype}`)
        chai.assert(all === null, `MISSING ALL NULL ${da.type}, ${da.subtype}`)
      } else {
        var f = (ra, str) => {
          chai.assert(ra !== undefined, `UNEXPECTED UNDEFINED ${str}: ${da.type}, ${da.subtype}`)
          chai.assert(ra !== null, `UNEXPECTED NULL ${str}: ${da.type}, ${da.subtype}`)
          chai.assert(ra.length !== 0, `MISSING ${str}: ${da.type}, ${da.subtype}`)
        }
        f(unique, 'unique')
        f(check, 'check')
        f(all, 'all')
        chai.assert(chai.expect(da.value_b.inputList[0].connection.check_).equals(all), `BAD CHECK (0)`)
        chai.assert(chai.expect(goog.array.concat(unique, check)).eql(all), `BAD CHECK (0)`)
        unique.forEach(tt => {
          var d = eYo.Test.new_dlgt(tt)
          if (tt === eYo.T3.Expr.assignment_chain) {
            var dc = eYo.Test.new_dlgt(tt)
            dc.variant_p = eYo.Key.SLICING
            chai.assert(d.target_t.lastConnect(dc), `MISSED TARGET ${tt}`)
          }
          if (d.type === tt) {
            eYo.Test.input_length(da.value_b, 1)
            chai.assert(da.value_t.lastConnect(d), `MISSED VALUE ${tt}`)
            eYo.Test.input_length(da.value_b, 1)
            d.dispose()
            eYo.Test.input_length(da.value_b, 1)
          } else {
            // console.error('NO TEST FOR', tt)
            d.dispose()
          }
        })
        check.forEach(tt => {
          var d = eYo.Test.new_dlgt(tt)
          if (tt === eYo.T3.Expr.assignment_chain) {
            var dc = eYo.Test.new_dlgt(tt)
            dc.variant_p = eYo.Key.SLICING
            chai.assert(d.target_t.lastConnect(dc), `MISSED TARGET ${tt}`)
          }
          if (d.type === tt) {
            eYo.Test.input_length(da.value_b, 1)
            chai.assert(da.value_t.lastConnect(d), `MISSED VALUE ${tt}`)
            eYo.Test.input_length(da.value_b, 3)
            d.dispose()
            eYo.Test.input_length(da.value_b, 1)
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
    var da = eYo.Test.new_dlgt('identifier')
    da.target_p = 'a'
    eYo.Test.code(da, 'a')
    eYo.Test.data_key(da, 'variant', eYo.Key.TARGET_VALUED)
    da.variant_p = eYo.Key.TARGET_VALUED
    eYo.Test.brick(da, 'identifier_valued')
    eYo.Test.code(da, 'a = <MISSING EXPRESSION>')
    da.value_p = 'value'
    eYo.Test.code(da, 'a = value')
    var d = eYo.Test.new_dlgt('identifier')
    d.target_p = 'd'
    eYo.Test.code(d, 'd')
    da.value_t.lastConnect(d)
    eYo.Test.code(da, 'a = d')
    var dc = eYo.Test.new_dlgt('identifier')
    dc.target_p = 'c'
    eYo.Test.code(dc, 'c')
    // console.error(da.value_b.inputList[0].connection.check_)
    // console.error(da.value_b.inputList[1].connection.check_)
    // console.error(da.value_b.inputList[2].connection.check_)
    chai.assert(da.value_t.lastConnect(dc), 'MISSED')
    eYo.Test.code(da, 'a = d, c')
    da.variant_p = eYo.Key.ANNOTATED
    eYo.Test.code(da, 'a: <MISSING EXPR>')
    da.variant_p = eYo.Key.ANNOTATED_VALUED
    eYo.Test.code(da, 'a: <MISSING EXPR> = d, c')
    da.variant_p = eYo.Key.TARGET_VALUED
    eYo.Test.code(da, 'a = d, c')
    d.unplug()
    eYo.Test.code(da, 'a = c')
    dc.variant_p = eYo.Key.TARGET_VALUED
    eYo.Test.brick(dc, 'assignment_chain') // c is unique and connect
    eYo.Test.code(da, 'a = c = <MISSING EXPRESSION>')
    eYo.Test.input_length(da.value_b, 1)
    dc.variant_p = eYo.Key.SLICING // c is no longer unique
    eYo.Test.brick(dc, 'named_subscription')
    eYo.Test.code(da, 'a = c[<MISSING INPUT>]')
    eYo.Test.input_length(da.value_b, 3)
    chai.assert(da.value_t.lastConnect(d), 'MISSED')
    eYo.Test.input_length(da.value_b, 5)
    eYo.Test.code(da, 'a = c[<MISSING INPUT>], d')
    chai.assert(da.value_b.inputList[4].eyo.connect(dc), 'MISSED')
    eYo.Test.code(da, 'a = d, c[<MISSING INPUT>]')
    eYo.Test.input_length(da.value_b, 5)
    d.dispose()
    d = eYo.Test.new_dlgt('yield_expr')
    chai.assert(da.value_b.inputList[1].eyo.connect(d), 'MISSED')
    eYo.Test.input_length(da.value_b, 1)
    chai.assert(!dc.magnets.output.targetBrick)
    dc.dispose()
    da.dispose()
  })
})

describe('Primary types', function() {
  var d = eYo.Test.new_dlgt(eYo.T3.Expr.identifier)
  var ctor_key = d.constructor.eyo.key
  d.dispose()
  var f = (k1, k2) => {
    it(`types ${k1}/${k2 || k1}`, function() {
      var t1 = eYo.T3.Expr[k1]
      chai.assert(t1, `UNKNOWN ${k1}`)
      var t2 = eYo.T3.Expr[k2 || k1]
      chai.assert(t2, `UNKNOWN ${k2}`)
      var d = eYo.Test.new_dlgt(t1, t2)
      chai.assert(d, `MISSING ${t1}`)
      eYo.Test.ctor(d, ctor_key)
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
    var d = eYo.Test.new_dlgt('identifier_valued')
    var rhs = 'rhs'
    d.value_p = rhs
    chai.assert(d.value_p === rhs, `BAD ${d.value_p} === ${rhs}`)
    var dom = eYo.Xml.brickToDom(d)
    d.dispose()
    console.error(dom)
    f = (t, expected) => {
      dom.setAttribute(eYo.Key.EYO, t)
      expected = eYo.T3.Expr[expected] || eYo.T3.Expr.identifier_valued
      var d2 = eYo.Test.new_dlgt(dom)
      eYo.Test.brick(d2, expected)
      chai.assert(d2.value_s, `MISSING VALUE SLOT ${t}`)
      chai.assert(!d2.value_s.incog, `UNEXPECTED VALUE INCOG ${t}`)
      chai.assert(d2.value_p === rhs, `MISSED VALUE ${d2.value_p} === ${rhs}`)
      d2.dispose()
    }
    f('identifier_valued')
    f('assignment_chain')
    f('named_expr', 'named_expr')
  })
})

describe('Primary(value_list)', function() {
  it('basic', function() {
    var dd = eYo.Test.new_dlgt('value_list', 'value_list')
    eYo.Test.input_length(dd, 1)
    dd.dispose()
    dd = eYo.Test.new_dlgt('identifier', 'identifier')
    var d = dd.value_b
    eYo.Test.brick(d, 'value_list')
    eYo.Test.input_length(d, 1)
    dd.dispose()
  })
  it('void unwrapped', function() {
    var d = eYo.Test.new_dlgt(eYo.T3.Expr.value_list)
    chai.assert(d, 'MISSED')
    chai.assert(d.inputList.length === 1)
    var model = d.consolidator.model
    console.error('ALL', d.type, d.subtype, model.all(d.type, d.subtype))
    var check = d.inputList[0].connection.check_
    chai.assert(check === null, 'BAD 1')
    // expect(model).to.have.all.keys('unique', 'all', 'check')
    chai.assert(chai.expect(check).equal(model.all(d.type, d.subtype)), `MISMATCH 1`)
    chai.assert(chai.expect(null).equal(model.all(d.type, d.subtype)), `MISMATCH 1`)
    chai.assert(chai.expect(null).equal(model.check(d.type, d.subtype)), `MISMATCH 2`)
    chai.assert(chai.expect(null).equal(model.unique(d.type, d.subtype)), `MISMATCH 3`)
    d.dispose()
  })
  it('void wrapped', function() {
    var dd = eYo.Test.new_dlgt('identifier_valued')
    eYo.Test.ctor(dd, 'primary')
    var d = dd.value_b
    eYo.Test.brick(d, 'value_list')
    eYo.Test.input_length(d, 1)
    var model = d.consolidator.model
    var check = d.inputList[0].connection.check_
    chai.assert(chai.expect(check).to.equal(model.all(d.type, d.subtype)),`MISMATCH 1`)
    chai.assert(chai.expect(check).to.not.equal(model.check(d.type, d.subtype)),`MISMATCH 2`)
    chai.assert(chai.expect(check).to.not.equal(model.unique(d.type, d.subtype)),`MISMATCH 3`)
    dd.dispose()
  })
  it('non void wrapped', function() {
    var dd = eYo.Test.new_dlgt('identifier_valued')
    var d = dd.value_b
    eYo.Test.subtype(d, 'identifier_valued')
    d.lastInput.eyo.connect(eYo.Test.new_dlgt('a'))
    eYo.Test.input_length(d, 3)
    var model = d.consolidator.model
    var check = d.inputList[0].connection.check_
    var model_check = model.check(d.type, d.subtype)
    var model_all = model.all(d.type, d.subtype)
    var model_unique = model.unique(d.type, d.subtype)
    chai.assert(chai.expect(check).to.equal(model_check), `MISMATCH 01`)
    chai.assert(chai.expect(check).to.not.equal(model_all), `MISMATCH 02`)
    chai.assert(chai.expect(check).to.not.equal(model_unique), `MISMATCH 03`)
    check = d.inputList[1].connection.check_
    chai.assert(chai.expect(check).to.equal(model_all), `MISMATCH 11`)
    chai.assert(chai.expect(check).to.not.equal(model_check), `MISMATCH 12`)
    chai.assert(chai.expect(check).to.not.equal(model_unique), `MISMATCH 13`)
    check = d.inputList[2].connection.check_
    chai.assert(chai.expect(check).to.equal(model_check), `MISMATCH 21`)
    chai.assert(chai.expect(check).to.not.equal(model_all), `MISMATCH 22`)
    chai.assert(chai.expect(check).to.not.equal(model_unique), `MISMATCH 23`)
    dd.dispose()
  })
  it('non void (=) wrapped', function() {
    var dd = eYo.Test.new_dlgt('identifier_valued')
    var d = dd.value_b
    d.lastInput.eyo.connect(eYo.Test.new_dlgt('identifier_valued'))
    chai.assert(d.inputList.length === 1)
    var model = d.consolidator.model
    var check = d.inputList[0].connection.check_
    var model_check = model.check(d.type, d.subtype)
    var model_all = model.all(d.type, d.subtype)
    var model_unique = model.unique(d.type, d.subtype)
    chai.assert(chai.expect(check).to.equal(model_all), `MISMATCH 01`)
    chai.assert(chai.expect(check).to.not.equal(model_check), `MISMATCH 02`)
    chai.assert(chai.expect(check).to.not.equal(model_unique), `MISMATCH 03`)
    dd.dispose()
  })
})

describe('Primary(DEFINED)', function() {
  it('value data', function() {
    var d = eYo.Test.new_dlgt('identifier_valued')
    var rhs = 'rhs'
    d.value_p = rhs
    chai.assert(d.value_p === rhs, `MISSED ${d.value_p} === ${rhs}`)
    var dom = eYo.Xml.brickToDom(d)
    d.dispose()
    d = eYo.Test.new_dlgt(dom)
    chai.assert(d.value_p === rhs, `MISSED ${d.value_p} === ${rhs}`)
    d.dispose()
  })
  it('… = rhs', function() {
    var d = eYo.Test.new_dlgt('identifier_valued')
    var rhs = 'rhs'
    eYo.Test.list_connect(d, 'value', eYo.Test.new_dlgt(rhs))
    var u = d.value_s.unwrappedTarget
    chai.assert(u.target_p === rhs, `MISSED ${u.target_p} === ${rhs}`)
    // d.moveByXY(20, 20)
    var dom = eYo.Xml.brickToDom(d)
    d.dispose()
    d = eYo.Test.new_dlgt(dom)
    u = d.value_s.unwrappedTarget
    chai.assert(u.target_p === rhs, `MISSED ${u.target_p} === ${rhs}`)
    d.dispose()
  })
  it('… = a, d', function() {
    var d = eYo.Test.new_dlgt('identifier_valued')
    var rhs_a = 'a'
    eYo.Test.list_connect(d, 'value', eYo.Test.new_dlgt(rhs_a))
    var rhs_b = 'd'
    eYo.Test.list_connect(d, 'value', eYo.Test.new_dlgt(rhs_b))
    var u = d.value_s.unwrappedTarget
    chai.assert(u.target_p === rhs_a, `MISSED ${u.target_p} === ${rhs_a}`)
    // d.moveByXY(20, 20)
    var dom = eYo.Xml.brickToDom(d)
    d.dispose()
    d = eYo.Test.new_dlgt(dom)
    u = d.value_s.unwrappedTarget
    chai.assert(u.target_p === rhs_a, `MISSED ${u.target_p} === ${rhs_a}`)
    eYo.Test.input_length(d.value_b, 5)
    var name = d.value_b.inputList[3].eyo.magnet.targetBrick.target_p
    chai.assert(name = rhs_b, `MISSED ${name} = ${rhs_b}`)
    d.dispose()
  })
  it('… = (… = …)', function() {
    var d = eYo.Test.new_dlgt('identifier_valued')
    var rhs_a = 'a'
    eYo.Test.list_connect(d, 'value', eYo.Test.new_dlgt(rhs_a))
    var dd = eYo.Test.new_dlgt('identifier_valued')
    eYo.STOP = 0
    eYo.Test.list_connect(dd, 'value', d)
    eYo.Test.brick(d, 'assignment_chain')
    console.log(dd.getProfile())
    eYo.Test.brick(dd, 'assignment_chain')
    dd.dispose()
  })
  it('… = (… = …)', function() {
    var d = eYo.Test.new_dlgt('identifier_valued')
    var rhs_a = 'a'
    eYo.Test.list_connect(d, 'value', eYo.Test.new_dlgt(rhs_a))
    var dd = eYo.Test.new_dlgt(eYo.T3.Stmt.assignment_stmt)
    eYo.Test.list_connect(dd, 'value', d)
    eYo.Test.brick(d, 'assignment_chain')
    eYo.Test.brick(dd, 'assignment_stmt')
    dd.dispose()
  })
})

describe('Primary(Assignment)', function() {
  it('basic', function() {
    var d = eYo.Test.new_dlgt('identifier_valued', 'identifier_valued')
    eYo.Test.incog(d, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'value', 'Xn_ary', 'Xslicing', 'Xalias'])
    var f = (k, d1 = d) => {
      eYo.Test.brick(d1, k)
    }
    f('identifier_valued')
    eYo.Test.list_connect(d, 'target', eYo.Test.new_dlgt('a'))
    var t = d.target_b
    f('identifier_valued')
    eYo.Test.list_connect(d, 'target', eYo.Test.new_dlgt('d')) // 2nd target
    f('assignment_chain')
    var dom = eYo.Xml.brickToDom(d)
    d.dispose()
    // console.log(dom)
    var d2 = eYo.Test.new_dlgt(dom)
    f('assignment_chain', d2)
    d2.moveByXY(50, 10)
    d2.dispose()
  })
  it('f(… = …)', function() {
    var d = eYo.Test.new_dlgt('identifier_valued')
     var f = (k, d1 = d) => {
      eYo.Test.brick(d1, k)
    }
    f('identifier_valued')
    var dd = eYo.Test.new_dlgt(eYo.T3.Expr.call_expr)
    eYo.Test.list_connect(dd, 'n_ary', d)
    f('identifier_valued')
    dd.dispose(true)
  })
  it('…=(…=…) unique value', function() {
    var d = eYo.Test.new_dlgt('identifier_valued')
    var a = eYo.Test.new_dlgt('identifier_valued')
    eYo.Test.list_connect(d, 'value', a)
    eYo.Test.input_length(d.value_b, 1)
    d.dispose()
  })
  it('d=rhs (dom)', function() {
    var d = eYo.Test.new_dlgt('identifier_valued')
    d.variant_p = eYo.Key.TARGET_VALUED
    var a = eYo.Test.new_dlgt('rhs')
    eYo.Test.list_connect(d, 'value', a)
    var dom = eYo.Xml.brickToDom(d)
    d.dispose()
    d = eYo.Test.new_dlgt(dom)
    chai.assert(d, `MISSING ${dom}`)
    eYo.Test.variant(d, 'TARGET_VALUED')
    var du = d.value_s.unwrappedTarget
    chai.assert(du, 'MISSED value')
    eYo.Test.brick(du.eyo, 'identifier')
    d.dispose()
  })
})

describe('Primary(Expression Assignment)', function() {
  it('basic', function() {
    var d = eYo.Test.new_dlgt(eYo.T3.Expr.named_expr)
    eYo.Test.variant(d, 'COL_VALUED')
    chai.assert(d.value_s.fields.label.getValue() === ':=')
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
      var d = eYo.Test.new_dlgt(t)
      eYo.Test.variant(d, 'ANNOTATED')
      d.dispose()
    })
  })
  it('basic connections', function() {
    var f = (t, dd, ttt, cant_connect) => {
      var d = eYo.Test.new_dlgt(t)
      if (cant_connect) {
        chai.assert(!d.target_s.listConnect(dd))
      } else {
        eYo.Test.list_connect(d, 'target', dd)
        eYo.Test.brick(d, ttt || t)
        dd.unplug()
      }
      d.dispose()
    }
    var dd = eYo.Test.new_dlgt('identifier')
    f('identifier_annotated', dd, 'identifier_annotated')
    f('augtarget_annotated', dd, 'identifier_annotated')
    f('key_datum', dd, 'identifier_annotated')
    dd.target_d.set('y')
    dd.dotted_d.set(1)
    dd.holder_d.set('x')
    eYo.Test.brick(dd, 'dotted_name')
    chai.assert(eYo.T3.Expr.Check.augtarget.indexOf(dd.type) >= 0, 'MISSED AUGTARGET')
    f('identifier_annotated', dd, 'augtarget_annotated')
    dd.dispose()
    dd = eYo.Test.new_dlgt(421)
    f('identifier_annotated', dd, 'key_datum')
    dd.dispose()
  })
  it('type change', function() {
    var d = eYo.Test.new_dlgt('identifier_annotated')
    d.target_p = 'abc'
    eYo.Test.variant(d, 'ANNOTATED')
    eYo.Test.code(d, 'abc: <MISSING EXPR>')
    d.annotated_p = 'str'
    eYo.Test.code(d, 'abc: str')
    eYo.Test.input_length(d.target_b, 1)
    var dd = eYo.Test.new_dlgt('identifier')
    dd.target_p = 'dd'
    eYo.Test.code(dd, 'dd')
    eYo.Test.list_connect(d, 'target', dd)
    eYo.Test.input_length(d.target_b, 3)
    eYo.Test.variant(d, d.variant_p = eYo.Key.ANNOTATED)
    eYo.Test.code(d, 'dd: str')

    var cc = eYo.Test.new_dlgt('identifier')
    cc.target_p = 'cc'
    eYo.Test.code(cc, 'cc')

    eYo.Test.list_connect(d, 'target', cc)
    eYo.Test.input_length(d.target_b, 5)
    eYo.Test.code(d, 'dd, cc = <MISSING EXPRESSION>')

    eYo.Test.variant(d, 'TARGET_VALUED')
    cc.dispose()
    eYo.Test.variant(d, 'TARGET_VALUED')
    d.variant_p = eYo.Key.ANNOTATED
    eYo.Test.variant(d, 'ANNOTATED')

    d.annotated_p = 'str'
    eYo.Test.brick(d, 'identifier_annotated')
    eYo.Test.code(d, 'dd: str')
    dd.variant_p = eYo.Key.CALL_EXPR
    eYo.Test.code(d, 'dd(): str')
    eYo.Test.brick(d, 'key_datum')
    dd.variant_p = eYo.Key.SLICING
    eYo.Test.incog(dd, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'slicing', 'Xalias'])
    eYo.Test.list_connect(dd, 'slicing', eYo.Test.new_dlgt(421))
    eYo.Test.code(d, 'dd[421]: str')
    eYo.Test.brick(d, 'augtarget_annotated')
    dd.variant_p = eYo.Key.NONE
    eYo.Test.incog(dd, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.Test.code(d, 'dd: str')
    eYo.Test.brick(d, 'identifier_annotated')
    dd.variant_p = eYo.Key.SLICING
    eYo.Test.incog(dd, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'slicing', 'Xalias'])
    eYo.Test.code(d, 'dd[421]: str')
    eYo.Test.brick(d, 'augtarget_annotated')
    dd.variant_p = eYo.Key.CALL_EXPR
    eYo.Test.incog(dd, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'n_ary', 'Xslicing', 'Xalias'])
    eYo.Test.code(d, 'dd(): str')
    eYo.Test.brick(d, 'key_datum')
    dd.variant_p = eYo.Key.NONE
    eYo.Test.incog(dd, ['target', 'Xholder', 'Xdotted', 'Xannotated', 'Xvalue', 'Xn_ary', 'Xslicing', 'Xalias'])
    eYo.Test.code(d, 'dd: str')
    eYo.Test.brick(d, 'identifier_annotated')
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
      var d = eYo.Test.new_dlgt(t)
      eYo.Test.variant(d, 'ALIASED')
      d.dispose()
    })
  })
  it ('Connections', function () {
    var d = eYo.Test.new_dlgt('identifier')
    d.alias_p = 'alias'
    eYo.Test.brick(d, 'identifier_as')
    eYo.Test.code(d, '<MISSING NAME> as alias')
    d.dispose()
    d = eYo.Test.new_dlgt('identifier')
    var dd = eYo.Test.new_dlgt('identifier')
    d.alias_s.connect(dd)
    eYo.Test.brick(d, 'identifier_as')
    eYo.Test.code(d, '<MISSING NAME> as <MISSING NAME>')
    dd.dispose()
    eYo.Test.brick(d, 'identifier_as')
    eYo.Test.code(d, '<MISSING NAME> as <MISSING NAME>')
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
      var d = eYo.Test.new_dlgt('identifier')
      eYo.Test.data_key(d, args[0], args[1])
      d.dispose()
    })
  })
})

describe('Enclosure(Basic)', function () {
  it(`Prepare`, function() {
    chai.assert(eYo.Key.PAR !== eYo.VOID, `MISSING eYo.Key.PAR`)
    chai.assert(eYo.Key.SQB !== eYo.VOID, `MISSING eYo.Key.SQB`)
    chai.assert(eYo.Key.BRACE !== eYo.VOID, `MISSING eYo.Key.BRACE`)
  })
  ;[
    ['enclosure', 'PAR', 'parenth_form'],
    ['parenth_form', 'PAR'],
    ['list_display', 'SQB'],
    ['void_dict_display', 'BRACE'],
    ['set_display', 'BRACE', 'void_dict_display'],
    ['dict_display', 'BRACE', 'void_dict_display'],
    ['one_set_display', 'BRACE', 'void_dict_display'],
    ['one_dict_display', 'BRACE', 'void_dict_display'],
    ['bracket_target_list', 'SQB', 'list_display'],
    ['parenth_target_list', 'PAR', 'parenth_form']
  ].forEach(args => {
    it(`${args[0]}/${args[1]}`, function() {
      var d = eYo.Test.new_brick(args[0], args[2] || args[0])
      eYo.Test.variant(d, args[1])
      d.dispose()
    })
  })
  ;[
    ['parenth_form', 'PAR'],
    ['list_display', 'SQB'],
    ['void_dict_display', 'BRACE']
  ].forEach(args => {
    it(`${args[1]}/${args[0]}`, function() {
      var d = eYo.Test.new_brick('enclosure')
      d.variant_p = eYo.Key[args[1]]
      eYo.Test.variant(d, args[1])
      eYo.Test.brick(d, args[0])
      d.dispose()
    })
  })
})

describe('Enclosure connections', function() {
  it(`'()'`, function() {
    var d = eYo.Test.new_brick(eYo.T3.Expr.enclosure)
    console.error('TYPE', d.type)
    eYo.Test.brick(d, `parenth_form`) // default type
    eYo.Test.variant(d, 'PAR')
    // can I connect a comprehension brick ?
    eYo.Test.input_length(d, 1)
    var dd1 = eYo.Test.new_brick('comprehension')
    chai.assert(d.connectLast(dd1))
    // this is a unique object:
    eYo.Test.input_length(d, 1)
    // replace with another unique object:
    var dd2 = eYo.Test.new_brick('yield_expr')
    chai.assert(d.connectLast(dd2))
    eYo.Test.input_length(d, 1)
    chai.assert(!dd1.out_m.target)
    dd1.dispose()
    // replace with a non unique object:
    var dd3 = eYo.Test.new_brick(421)
    eYo.Test.brick(dd3, 'integer')
    chai.assert(d.connectLast(dd3))
    eYo.Test.input_length(d, 3)
    chai.assert(!dd2.out_m.target)
    chai.assert(!d.slotAtHead.connect(dd2), 'UNEXPECTED connection')
    chai.assert(!d.slotAtHead.next.next.connect(dd2), 'UNEXPECTED connection')
    dd2.dispose()
    dd1 = eYo.Test.new_brick(124)
    eYo.Test.brick(dd1, 'integer')
    chai.assert(d.connectLast(dd1))
    eYo.Test.input_length(d, 5)
    dd1 = eYo.Test.new_brick(241)
    eYo.Test.brick(dd1, 'integer')
    chai.assert(d.slotAtHead.connect(dd1), 'MISSING connection')
    eYo.Test.input_length(d, 7)
    d.dispose()
  })
  it(`'[]'`, function() {

  })
  it(`'{}'`, function() {
    var d = eYo.Test.new_brick('void_dict_display')
    // connect a unique brick
    var dd1 = eYo.Test.new_brick('comprehension')
    eYo.Test.input_length(d, 1)
    chai.assert(d.connectLast(dd1))
    eYo.Test.input_length(d, 1)
    eYo.Test.brick(d, 'set_display')
    // replace by any other unique
    var list = d.model.list
    var unique = list.unique(d.type)
    unique.forEach(t => {
      var dd2 = eYo.Test.new_brick(t)
      chai.assert(d.connectLast(dd2))
      eYo.Test.input_length(d, 1)
      chai.assert(!dd1.out_m.target)
      dd1.dispose()
      dd1 = dd2
    })
    var dd2 = eYo.Test.new_brick('dict_comprehension')
    chai.assert(dd2.expression_s.connect(eYo.Test.new_brick('key_datum')))
    d.connectLast(dd2)
    dd1.dispose()
    eYo.Test.brick(d, 'dict_display')
    d.dispose()
  })
  it(`Enclosure: '() -> [] -> () -> {} -> ()'`, function() {
    var d = eYo.Test.new_brick('parenth_form')
    var dd1 = eYo.Test.new_brick('comprehension')
    var slot = d.slotAtHead
    chai.assert(slot.connect(dd1), 'MISSING connection')
    d.variant_p === eYo.Key.SQB
    chai.assert(slot.target === dd1, 'LOST CONNECTION')
    d.variant_p === eYo.Key.BRACE
    chai.assert(slot.target === dd1, 'LOST CONNECTION')
    d.variant_p === eYo.Key.PAR
    chai.assert(slot.target === dd1, 'LOST CONNECTION')
    d.variant_p === eYo.Key.BRACE
    chai.assert(slot.target === dd1, 'LOST CONNECTION')
    d.variant_p === eYo.Key.SQB
    chai.assert(slot.target === dd1, 'LOST CONNECTION')
    d.variant_p === eYo.Key.PAR
    chai.assert(slot.target === dd1, 'LOST CONNECTION')
    d.dispose()
  })
  it(`Enclosure: '() -> {}'`, function() {
    var d = eYo.Test.new_brick('parenth_form')
    var dd1 = eYo.Test.new_brick(421)
    var slot = d.slotAtHead
    chai.assert(slot.connect(dd1), 'MISSING connection')
    d.variant_p === eYo.Key.BRACE
    chai.assert(slot.target === dd1, 'LOST CONNECTION')
    d.dispose()
  })
})

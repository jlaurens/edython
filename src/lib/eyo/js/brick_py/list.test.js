describe('Enclosure(Basic)', function () {
  it(`Prepare`, function() {
    chai.assert(eYo.key.PAR !== eYo.NA, `MISSING eYo.key.PAR`)
    chai.assert(eYo.key.SQB !== eYo.NA, `MISSING eYo.key.SQB`)
    chai.assert(eYo.key.BRACE !== eYo.NA, `MISSING eYo.key.BRACE`)
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
      var d = eYo.test.new_brick(args[0], args[2] || args[0])
      eYo.test.variant(d, args[1])
      d.dispose()
    })
  })
  ;[
    ['parenth_form', 'PAR'],
    ['list_display', 'SQB'],
    ['void_dict_display', 'BRACE']
  ].forEach(args => {
    it(`${args[1]}/${args[0]}`, function() {
      var d = eYo.test.new_brick('enclosure')
      d.Variant_p = eYo.key[args[1]]
      eYo.test.variant(d, args[1])
      eYo.test.Brick(d, args[0])
      d.dispose()
    })
  })
})

describe('Enclosure connections', function() {
  it(`'()'`, function() {
    var d = eYo.test.new_brick(eYo.t3.expr.enclosure)
    console.error('TYPE', d.type)
    eYo.test.Brick(d, `parenth_form`) // default type
    eYo.test.variant(d, 'PAR')
    // can I connect a comprehension brick ?
    eYo.test.Input_length(d, 1)
    var dd1 = eYo.test.new_brick('comprehension')
    chai.assert(d.connectLast(dd1))
    // this is a unique object:
    eYo.test.Input_length(d, 1)
    // replace with another unique object:
    var dd2 = eYo.test.new_brick('yield_expr')
    chai.assert(d.connectLast(dd2))
    eYo.test.Input_length(d, 1)
    chai.assert(!dd1.out_m.target)
    dd1.dispose()
    // replace with a non unique object:
    var dd3 = eYo.test.new_brick(421)
    eYo.test.Brick(dd3, 'integer')
    chai.assert(d.connectLast(dd3))
    eYo.test.Input_length(d, 3)
    chai.assert(!dd2.out_m.target)
    chai.assert(!d.slotAtHead.connect(dd2), 'UNEXPECTED connection')
    chai.assert(!d.slotAtHead.next.next.connect(dd2), 'UNEXPECTED connection')
    dd2.dispose()
    dd1 = eYo.test.new_brick(124)
    eYo.test.Brick(dd1, 'integer')
    chai.assert(d.connectLast(dd1))
    eYo.test.Input_length(d, 5)
    dd1 = eYo.test.new_brick(241)
    eYo.test.Brick(dd1, 'integer')
    chai.assert(d.slotAtHead.connect(dd1), 'MISSING connection')
    eYo.test.Input_length(d, 7)
    d.dispose()
  })
  it(`'[]'`, function() {

  })
  it(`'{}'`, function() {
    var d = eYo.test.new_brick('void_dict_display')
    // connect a unique brick
    var dd1 = eYo.test.new_brick('comprehension')
    eYo.test.Input_length(d, 1)
    chai.assert(d.connectLast(dd1))
    eYo.test.Input_length(d, 1)
    eYo.test.Brick(d, 'set_display')
    // replace by any other unique
    var list = d.model
    var unique = list.unique(d.type)
    unique.forEach(t => {
      var dd2 = eYo.test.new_brick(t)
      chai.assert(d.connectLast(dd2))
      eYo.test.Input_length(d, 1)
      chai.assert(!dd1.out_m.target)
      dd1.dispose()
      dd1 = dd2
    })
    var dd2 = eYo.test.new_brick('dict_comprehension')
    chai.assert(dd2.expression_s.connect(eYo.test.new_brick('key_datum')))
    d.connectLast(dd2)
    dd1.dispose()
    eYo.test.Brick(d, 'dict_display')
    d.dispose()
  })
  it(`Enclosure: '() -> [] -> () -> {} -> ()'`, function() {
    var d = eYo.test.new_brick('parenth_form')
    var dd1 = eYo.test.new_brick('comprehension')
    var slot = d.slotAtHead
    chai.assert(slot.connect(dd1), 'MISSING connection')
    d.Variant_p === eYo.key.SQB
    chai.assert(slot.target === dd1, 'LOST CONNECTION')
    d.Variant_p === eYo.key.BRACE
    chai.assert(slot.target === dd1, 'LOST CONNECTION')
    d.Variant_p === eYo.key.PAR
    chai.assert(slot.target === dd1, 'LOST CONNECTION')
    d.Variant_p === eYo.key.BRACE
    chai.assert(slot.target === dd1, 'LOST CONNECTION')
    d.Variant_p === eYo.key.SQB
    chai.assert(slot.target === dd1, 'LOST CONNECTION')
    d.Variant_p === eYo.key.PAR
    chai.assert(slot.target === dd1, 'LOST CONNECTION')
    d.dispose()
  })
  it(`Enclosure: '() -> {}'`, function() {
    var d = eYo.test.new_brick('parenth_form')
    var dd1 = eYo.test.new_brick(421)
    var slot = d.slotAtHead
    chai.assert(slot.connect(dd1), 'MISSING connection')
    d.Variant_p === eYo.key.BRACE
    chai.assert(slot.target === dd1, 'LOST CONNECTION')
    d.dispose()
  })
})

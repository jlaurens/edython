describe('Enclosure(Basic)', function () {
  it(`Prepare`, function() {
    chai.assert(eYo.Key.PAR !== undefined, `MISSING eYo.Key.PAR`)
    chai.assert(eYo.Key.SQB !== undefined, `MISSING eYo.Key.SQB`)
    chai.assert(eYo.Key.BRACE !== undefined, `MISSING eYo.Key.BRACE`)
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
      var d = eYo.Test.new_dlgt(args[0], args[2] || args[0])
      eYo.Test.variant(d, args[1])
      d.block_.dispose()
    })
  })
  ;[
    ['parenth_form', 'PAR'],
    ['list_display', 'SQB'],
    ['void_dict_display', 'BRACE']
  ].forEach(args => {
    it(`${args[1]}/${args[0]}`, function() {
      var d = eYo.Test.new_dlgt('enclosure')
      d.variant_p = eYo.Key[args[1]]
      eYo.Test.variant(d, args[1])
      eYo.Test.dlgt(d, args[0])
      d.block_.dispose()
    })
  })
})

describe('Enclosure connections', function() {
  it(`'()'`, function() {
    var d = eYo.Test.new_dlgt(eYo.T3.Expr.enclosure)
    console.error('TYPE', d.type)
    eYo.Test.dlgt(d, `parenth_form`) // default type
    eYo.Test.variant(d, 'PAR')
    // can I connect a comprehension brick ?
    eYo.Test.input_length(d, 1)
    var dd1 = eYo.Test.new_dlgt('comprehension')
    chai.assert(d.connectLast(dd1))
    // this is a unique object:
    eYo.Test.input_length(d, 1)
    // replace with another unique object:
    var dd2 = eYo.Test.new_dlgt('yield_expr')
    chai.assert(d.connectLast(dd2))
    eYo.Test.input_length(d, 1)
    chai.assert(!dd1.magnets.output.target)
    dd1.block_.dispose()
    // replace with a non unique object:
    var dd3 = eYo.Test.new_dlgt(421)
    eYo.Test.dlgt(dd3, 'integer')
    chai.assert(d.connectLast(dd3))
    eYo.Test.input_length(d, 3)
    chai.assert(!dd2.magnets.output.target)
    chai.assert(!d.inputList[0].eyo.connect(dd2), 'UNEXPECTED connection')
    chai.assert(!d.inputList[2].eyo.connect(dd2), 'UNEXPECTED connection')
    dd2.block_.dispose()
    dd1 = eYo.Test.new_dlgt(124)
    eYo.Test.dlgt(dd1, 'integer')
    chai.assert(d.connectLast(dd1))
    eYo.Test.input_length(d, 5)
    dd1 = eYo.Test.new_dlgt(241)
    eYo.Test.dlgt(dd1, 'integer')
    chai.assert(d.inputList[0].eyo.connect(dd1), 'MISSING connection')
    eYo.Test.input_length(d, 7)
    d.block_.dispose()
  })
  it(`'[]'`, function() {

  })
  it(`'{}'`, function() {
    var d = eYo.Test.new_dlgt('void_dict_display')
    // connect a unique brick
    var dd1 = eYo.Test.new_dlgt('comprehension')
    eYo.Test.input_length(d, 1)
    chai.assert(d.connectLast(dd1))
    eYo.Test.input_length(d, 1)
    eYo.Test.dlgt(d, 'set_display')
    // replace by any other unique
    var list = d.model.list
    var unique = list.unique(d.type)
    unique.forEach(t => {
      var dd2 = eYo.Test.new_dlgt(t)
      chai.assert(d.connectLast(dd2))
      eYo.Test.input_length(d, 1)
      chai.assert(!dd1.magnets.output.target)
      dd1.block_.dispose()
      dd1 = dd2
    })
    var dd2 = eYo.Test.new_dlgt('dict_comprehension')
    chai.assert(dd2.expression_s.connect(eYo.Test.new_dlgt('key_datum')))
    d.connectLast(dd2)
    dd1.block_.dispose()
    eYo.Test.dlgt(d, 'dict_display')
    d.block_.dispose()
  })
  it(`Enclosure: '() -> [] -> () -> {} -> ()'`, function() {
    var d = eYo.Test.new_dlgt('parenth_form')
    var dd1 = eYo.Test.new_dlgt('comprehension')
    var input = d.inputList[0]
    chai.assert(input.connect(dd1), 'MISSING connection')
    d.variant_p === eYo.Key.SQB
    chai.assert(input.target === dd1, 'LOST CONNECTION')
    d.variant_p === eYo.Key.BRACE
    chai.assert(input.target === dd1, 'LOST CONNECTION')
    d.variant_p === eYo.Key.PAR
    chai.assert(input.target === dd1, 'LOST CONNECTION')
    d.variant_p === eYo.Key.BRACE
    chai.assert(input.target === dd1, 'LOST CONNECTION')
    d.variant_p === eYo.Key.SQB
    chai.assert(input.target === dd1, 'LOST CONNECTION')
    d.variant_p === eYo.Key.PAR
    chai.assert(input.target === dd1, 'LOST CONNECTION')
    d.block_.dispose()
  })
  it(`Enclosure: '() -> {}'`, function() {
    var d = eYo.Test.new_dlgt('parenth_form')
    var dd1 = eYo.Test.new_dlgt(421)
    var input = d.inputList[0]
    chai.assert(input.connect(dd1), 'MISSING connection')
    d.variant_p === eYo.Key.BRACE
    chai.assert(input.target === dd1, 'LOST CONNECTION')
    d.block_.dispose()
  })
})
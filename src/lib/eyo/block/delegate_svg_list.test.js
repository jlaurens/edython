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
      var b = eYo.Test.new_block(args[0], args[2] || args[0])
      eYo.Test.variant(b, args[1])
      b.dispose()
    })
  })
  ;[
    ['parenth_form', 'PAR'],
    ['list_display', 'SQB'],
    ['void_dict_display', 'BRACE']
  ].forEach(args => {
    it(`${args[1]}/${args[0]}`, function() {
      var b = eYo.Test.new_block('enclosure')
      b.eyo.variant_p = eYo.Key[args[1]]
      eYo.Test.variant(b, args[1])
      eYo.Test.block(b, args[0])
      b.dispose()
    })
  })
})

describe('Enclosure connections', function() {
  it(`'()'`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.enclosure)
    console.error('TYPE', b.type)
    eYo.Test.block(b, `parenth_form`) // default type
    eYo.Test.variant(b, 'PAR')
    // can I connect a comprehension block ?
    eYo.Test.input_length(b, 1)
    var bb1 = eYo.Test.new_block('comprehension')
    chai.assert(b.eyo.lastConnect(bb1))
    // this is a unique object:
    eYo.Test.input_length(b, 1)
    // replace with another unique object:
    var bb2 = eYo.Test.new_block('yield_expr')
    chai.assert(b.eyo.lastConnect(bb2))
    eYo.Test.input_length(b, 1)
    chai.assert(!bb1.outputConnection.t_eyo)
    bb1.dispose()
    // replace with a non unique object:
    var bb3 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 421)
    eYo.Test.block(bb3, 'integer')
    chai.assert(b.eyo.lastConnect(bb3))
    eYo.Test.input_length(b, 3)
    chai.assert(!bb2.outputConnection.t_eyo)
    chai.assert(!b.inputList[0].eyo.connect(bb2), 'UNEXPECTED connection')
    chai.assert(!b.inputList[2].eyo.connect(bb2), 'UNEXPECTED connection')
    bb2.dispose()
    bb1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 124)
    eYo.Test.block(bb1, 'integer')
    chai.assert(b.eyo.lastConnect(bb1))
    eYo.Test.input_length(b, 5)
    bb1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 241)
    eYo.Test.block(bb1, 'integer')
    chai.assert(b.inputList[0].eyo.connect(bb1), 'MISSING connection')
    eYo.Test.input_length(b, 7)
    b.dispose()
  })
  it(`'[]'`, function() {
    
  })
  it(`'{}'`, function() {
    var b = eYo.Test.new_block('void_dict_display')
    // connect a unique block
    var bb1 = eYo.Test.new_block('comprehension')
    eYo.Test.input_length(b, 1)
    chai.assert(b.eyo.lastConnect(bb1))
    eYo.Test.input_length(b, 1)
    eYo.Test.block(b, 'set_display')
    // replace by any other unique
    var list = b.eyo.model.list
    var unique = list.unique(b.type)
    unique.forEach(t => {
      var bb2 = eYo.Test.new_block(t)
      chai.assert(b.eyo.lastConnect(bb2))
      eYo.Test.input_length(b, 1)
      chai.assert(!bb1.outputConnection.t_eyo)
      bb1.dispose()
      bb1 = bb2
    })
    var bb2 = eYo.Test.new_block('dict_comprehension')
    chai.assert(bb2.eyo.expression_s.connect(eYo.Test.new_block('key_datum')))
    b.eyo.lastConnect(bb2)
    bb1.dispose()
    eYo.Test.block(b, 'dict_display')
    b.dispose()
  })
  it(`Enclosure: '() -> [] -> () -> {} -> ()'`, function() {
    var b = eYo.Test.new_block('parenth_form')
    var bb1 = eYo.Test.new_block('comprehension')
    var input = b.inputList[0]
    chai.assert(input.eyo.connect(bb1), 'MISSING connection')
    b.eyo.variant_p === eYo.Key.SQB
    chai.assert(input.eyo.target === bb1, 'LOST CONNECTION')
    b.eyo.variant_p === eYo.Key.BRACE
    chai.assert(input.eyo.target === bb1, 'LOST CONNECTION')
    b.eyo.variant_p === eYo.Key.PAR
    chai.assert(input.eyo.target === bb1, 'LOST CONNECTION')
    b.eyo.variant_p === eYo.Key.BRACE
    chai.assert(input.eyo.target === bb1, 'LOST CONNECTION')
    b.eyo.variant_p === eYo.Key.SQB
    chai.assert(input.eyo.target === bb1, 'LOST CONNECTION')
    b.eyo.variant_p === eYo.Key.PAR
    chai.assert(input.eyo.target === bb1, 'LOST CONNECTION')
    b.dispose()
  })
  it(`Enclosure: '() -> {}'`, function() {
    var b = eYo.Test.new_block('parenth_form')
    var bb1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 421)
    var input = b.inputList[0]
    chai.assert(input.eyo.connect(bb1), 'MISSING connection')
    b.eyo.variant_p === eYo.Key.BRACE
    chai.assert(input.eyo.target === bb1, 'LOST CONNECTION')
    b.dispose()
  })
})

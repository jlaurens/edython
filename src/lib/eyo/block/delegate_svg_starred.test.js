describe('Basic Starred', function() {
  ;[
    ['star_expr', '*<MISSING EXPRESSION>'],
    ['expression_star', '*<MISSING EXPRESSION>'],
    ['expression_star_star', '**<MISSING EXPRESSION>'],
    ['target_star', '*<MISSING EXPRESSION>'],
    ['star', '*'],
    ['parameter_star', '*<MISSING EXPRESSION>'],
    ['parameter_star_star', '**<MISSING EXPRESSION>'],
    ['or_expr_star_star', '**<MISSING EXPRESSION>']
  ].forEach(args => {
    it(`type: ${args[0]}/${args[1]}`, function() {
      var b = eYo.Test.new_block(args[0])
      eYo.Test.code(b, args[1])
      b.dispose()
    })
  })
  ;[
    ['star_expr', '*abc', 'abc'],
    ['expression_star', '*abc', 'abc'],
    ['expression_star_star', '**abc', 'abc'],
    ['target_star', '*abc', 'abc'],
    ['star', '*abc', 'abc'],
    ['parameter_star', '*abc', 'abc'],
    ['parameter_star_star', '**abc', 'abc'],
    ['or_expr_star_star', '**abc', 'abc']
  ].forEach(args => {
    it(`modified: ${args[0]}/${args[1]}/${args[2]}`, function() {
      var b = eYo.Test.new_block(args[0])
      b.eyo.modified_p = args[2]
      eYo.Test.code(b, args[1])
      b.dispose()
    })
  })
  it(`to/from type star`, function() {
    // to and from star only
    var b = eYo.Test.new_block(eYo.T3.Expr.star)
    b.eyo.modified_p = 'abc'
    eYo.Test.code(b, '*abc')
    b.eyo.variant_p = eYo.Key.STAR
    eYo.Test.code(b, '*')
    b.dispose()

    b = eYo.Test.new_block(eYo.T3.Expr.star)
    b.eyo.modified_p = 'abc'
    b.eyo.modifier_p = '**'
    eYo.Test.code(b, '**abc')
    b.eyo.variant_p = eYo.Key.STAR
    eYo.Test.code(b, '*')
    b.dispose()

    b = eYo.Test.new_block(eYo.T3.Expr.star)
    var bb = eYo.Test.new_block(eYo.T3.Expr.identifier)
    bb.eyo.target_p = 'cba'
    eYo.Test.code(bb, 'cba')
    b.eyo.modified_s.connect(bb)
    eYo.Test.code(b, '*cba')
    b.eyo.variant_p = eYo.Key.STAR
    eYo.Test.code(b, '*')
    b.dispose()

    b = eYo.Test.new_block(eYo.T3.Expr.star)
    var bb = eYo.Test.new_block(eYo.T3.Expr.identifier)
    bb.eyo.target_p = 'cba'
    b.eyo.modifier_p = '**'
    eYo.Test.code(bb, 'cba')
    b.eyo.modified_s.connect(bb)
    eYo.Test.code(b, '**cba')
    b.eyo.variant_p = eYo.Key.STAR
    eYo.Test.code(b, '*')
    b.dispose()
  })
  ;[
    'star_expr',
    'expression_star',
    'parameter_star'
  ].forEach(t => {
    it(`to/from type ${t}`, function() {
      // to and from star only
      var b = eYo.Test.new_block(eYo.T3.Expr[t])
      b.eyo.modified_p = 'abc'
      b.eyo.variant_p = eYo.Key.STAR
      eYo.Test.code(b, '*')
      b.eyo.variant_p = eYo.Key.NONE
      eYo.Test.code(b, '*abc')
      b.dispose()

      b = eYo.Test.new_block(eYo.T3.Expr[t])
      b.eyo.modified_p = 'abc'
      b.eyo.modifier_p = '**'
      eYo.Test.code(b, '**abc')
      b.eyo.modifier_p = '*'
      eYo.Test.code(b, '*abc')
      b.dispose()

      var b = eYo.Test.new_block(eYo.T3.Expr[t])
      b.eyo.modified_p = 'abc'
      var bb = eYo.Test.new_block(eYo.T3.Expr.identifier)
      bb.eyo.target_p = 'cba'
      eYo.Test.code(bb, 'cba')
      b.eyo.modified_s.connect(bb)
      b.eyo.variant_p = eYo.Key.STAR
      eYo.Test.code(b, '*')
      b.eyo.variant_p = eYo.Key.NONE
      eYo.Test.code(b, '*cba')
      bb.dispose()
      eYo.Test.code(b, '*abc')
      b.dispose()

      var b = eYo.Test.new_block(eYo.T3.Expr[t])
      b.eyo.modified_p = 'abc'
      var bb = eYo.Test.new_block(eYo.T3.Expr.identifier)
      bb.eyo.target_p = 'cba'
      eYo.Test.code(bb, 'cba')
      b.eyo.modified_s.connect(bb)
      b.eyo.modifier_p = '**'
      eYo.Test.code(b, '**cba')
      b.eyo.modifier_p = '*'
      eYo.Test.code(b, '*cba')
      bb.dispose()
      eYo.Test.code(b, '*abc')
      b.dispose()
    })
  })
  ;[
    'or_expr_star_star',
    'expression_star_star',
    'parameter_star_star'
  ].forEach(t => {
    it(`to/from type ${t}`, function() {
      // to and from star only
      var b = eYo.Test.new_block(eYo.T3.Expr[t])
      b.eyo.modified_p = 'abc'
      b.eyo.variant_p = eYo.Key.STAR
      eYo.Test.code(b, '*')
      b.eyo.variant_p = eYo.Key.NONE
      eYo.Test.code(b, '*abc')
      b.dispose()

      b = eYo.Test.new_block(eYo.T3.Expr[t])
      b.eyo.modified_p = 'abc'
      b.eyo.modifier_p = '**'
      eYo.Test.code(b, '**abc')
      b.eyo.modifier_p = '*'
      eYo.Test.code(b, '*abc')
      b.dispose()

      var b = eYo.Test.new_block(eYo.T3.Expr[t])
      b.eyo.modified_p = 'abc'
      var bb = eYo.Test.new_block(eYo.T3.Expr.identifier)
      bb.eyo.target_p = 'cba'
      eYo.Test.code(bb, 'cba')
      b.eyo.modified_s.connect(bb)
      b.eyo.variant_p = eYo.Key.STAR
      eYo.Test.code(b, '*')
      b.eyo.variant_p = eYo.Key.NONE
      eYo.Test.code(b, '*cba')
      bb.dispose()
      eYo.Test.code(b, '*abc')
      b.dispose()

      var b = eYo.Test.new_block(eYo.T3.Expr[t])
      b.eyo.modified_p = 'abc'
      var bb = eYo.Test.new_block(eYo.T3.Expr.identifier)
      bb.eyo.target_p = 'cba'
      eYo.Test.code(bb, 'cba')
      b.eyo.modified_s.connect(bb)
      b.eyo.modifier_p = '**'
      eYo.Test.code(b, '**cba')
      b.eyo.modifier_p = '*'
      eYo.Test.code(b, '*cba')
      bb.dispose()
      eYo.Test.code(b, '*abc')
      b.dispose()
    })
  })
})

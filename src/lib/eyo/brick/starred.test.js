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
      var d = eYo.Test.new_brick(args[0])
      eYo.Test.code(d, args[1])
      d.dispose()
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
      var d = eYo.Test.new_brick(args[0])
      d.modified_p = args[2]
      eYo.Test.code(d, args[1])
      d.dispose()
    })
  })
  it(`to/from type star`, function() {
    // to and from star only
    var d = eYo.Test.new_brick(eYo.T3.Expr.star)
    d.modified_p = 'abc'
    eYo.Test.code(d, '*abc')
    d.variant_p = eYo.Key.STAR
    eYo.Test.code(d, '*')
    d.dispose()

    d = eYo.Test.new_brick(eYo.T3.Expr.star)
    d.modified_p = 'abc'
    d.modifier_p = '**'
    eYo.Test.code(d, '**abc')
    d.variant_p = eYo.Key.STAR
    eYo.Test.code(d, '*')
    d.dispose()

    d = eYo.Test.new_brick(eYo.T3.Expr.star)
    var dd = eYo.Test.new_brick(eYo.T3.Expr.identifier)
    dd.target_p = 'cba'
    eYo.Test.code(dd, 'cba')
    d.modified_s.connect(dd)
    eYo.Test.code(d, '*cba')
    d.variant_p = eYo.Key.STAR
    eYo.Test.code(d, '*')
    d.dispose()

    d = eYo.Test.new_brick(eYo.T3.Expr.star)
    var dd = eYo.Test.new_brick(eYo.T3.Expr.identifier)
    dd.target_p = 'cba'
    d.modifier_p = '**'
    eYo.Test.code(dd, 'cba')
    d.modified_s.connect(dd)
    eYo.Test.code(d, '**cba')
    d.variant_p = eYo.Key.STAR
    eYo.Test.code(d, '*')
    d.dispose()
  })
  ;[
    'star_expr',
    'expression_star',
    'parameter_star'
  ].forEach(t => {
    it(`to/from type ${t}`, function() {
      // to and from star only
      var d = eYo.Test.new_brick(eYo.T3.Expr[t])
      d.modified_p = 'abc'
      d.variant_p = eYo.Key.STAR
      eYo.Test.code(d, '*')
      d.variant_p = eYo.Key.NONE
      eYo.Test.code(d, '*abc')
      d.dispose()

      d = eYo.Test.new_brick(eYo.T3.Expr[t])
      d.modified_p = 'abc'
      d.modifier_p = '**'
      eYo.Test.code(d, '**abc')
      d.modifier_p = '*'
      eYo.Test.code(d, '*abc')
      d.dispose()

      var d = eYo.Test.new_brick(eYo.T3.Expr[t])
      d.modified_p = 'abc'
      var dd = eYo.Test.new_brick(eYo.T3.Expr.identifier)
      dd.target_p = 'cba'
      eYo.Test.code(dd, 'cba')
      d.modified_s.connect(dd)
      d.variant_p = eYo.Key.STAR
      eYo.Test.code(d, '*')
      d.variant_p = eYo.Key.NONE
      eYo.Test.code(d, '*cba')
      dd.dispose()
      eYo.Test.code(d, '*abc')
      d.dispose()

      var d = eYo.Test.new_brick(eYo.T3.Expr[t])
      d.modified_p = 'abc'
      var dd = eYo.Test.new_brick(eYo.T3.Expr.identifier)
      dd.target_p = 'cba'
      eYo.Test.code(dd, 'cba')
      d.modified_s.connect(dd)
      d.modifier_p = '**'
      eYo.Test.code(d, '**cba')
      d.modifier_p = '*'
      eYo.Test.code(d, '*cba')
      dd.dispose()
      eYo.Test.code(d, '*abc')
      d.dispose()
    })
  })
  ;[
    'or_expr_star_star',
    'expression_star_star',
    'parameter_star_star'
  ].forEach(t => {
    it(`to/from type ${t}`, function() {
      // to and from star only
      var d = eYo.Test.new_brick(eYo.T3.Expr[t])
      d.modified_p = 'abc'
      d.variant_p = eYo.Key.STAR
      eYo.Test.code(d, '*')
      d.variant_p = eYo.Key.NONE
      eYo.Test.code(d, '*abc')
      d.dispose()

      d = eYo.Test.new_brick(eYo.T3.Expr[t])
      d.modified_p = 'abc'
      d.modifier_p = '**'
      eYo.Test.code(d, '**abc')
      d.modifier_p = '*'
      eYo.Test.code(d, '*abc')
      d.dispose()

      var d = eYo.Test.new_brick(eYo.T3.Expr[t])
      d.modified_p = 'abc'
      var dd = eYo.Test.new_brick(eYo.T3.Expr.identifier)
      dd.target_p = 'cba'
      eYo.Test.code(dd, 'cba')
      d.modified_s.connect(dd)
      d.variant_p = eYo.Key.STAR
      eYo.Test.code(d, '*')
      d.variant_p = eYo.Key.NONE
      eYo.Test.code(d, '*cba')
      dd.dispose()
      eYo.Test.code(d, '*abc')
      d.dispose()

      var d = eYo.Test.new_brick(eYo.T3.Expr[t])
      d.modified_p = 'abc'
      var dd = eYo.Test.new_brick(eYo.T3.Expr.identifier)
      dd.target_p = 'cba'
      eYo.Test.code(dd, 'cba')
      d.modified_s.connect(dd)
      d.modifier_p = '**'
      eYo.Test.code(d, '**cba')
      d.modifier_p = '*'
      eYo.Test.code(d, '*cba')
      dd.dispose()
      eYo.Test.code(d, '*abc')
      d.dispose()
    })
  })
})

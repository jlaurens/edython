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
      eYo.Test.Code(d, args[1])
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
      eYo.Test.Code(d, args[1])
      d.dispose()
    })
  })
  it(`to/from type star`, function() {
    // to and from star only
    var d = eYo.Test.new_brick(eYo.t3.Expr.Star)
    d.modified_p = 'abc'
    eYo.Test.Code(d, '*abc')
    d.variant_p = eYo.key.STAR
    eYo.Test.Code(d, '*')
    d.dispose()

    d = eYo.Test.new_brick(eYo.t3.Expr.Star)
    d.modified_p = 'abc'
    d.modifier_p = '**'
    eYo.Test.Code(d, '**abc')
    d.variant_p = eYo.key.STAR
    eYo.Test.Code(d, '*')
    d.dispose()

    d = eYo.Test.new_brick(eYo.t3.Expr.Star)
    var dd = eYo.Test.new_brick(eYo.t3.Expr.identifier)
    dd.target_p = 'cba'
    eYo.Test.Code(dd, 'cba')
    d.modified_s.connect(dd)
    eYo.Test.Code(d, '*cba')
    d.variant_p = eYo.key.STAR
    eYo.Test.Code(d, '*')
    d.dispose()

    d = eYo.Test.new_brick(eYo.t3.Expr.Star)
    var dd = eYo.Test.new_brick(eYo.t3.Expr.identifier)
    dd.target_p = 'cba'
    d.modifier_p = '**'
    eYo.Test.Code(dd, 'cba')
    d.modified_s.connect(dd)
    eYo.Test.Code(d, '**cba')
    d.variant_p = eYo.key.STAR
    eYo.Test.Code(d, '*')
    d.dispose()
  })
  ;[
    'star_expr',
    'expression_star',
    'parameter_star'
  ].forEach(t => {
    it(`to/from type ${t}`, function() {
      // to and from star only
      var d = eYo.Test.new_brick(eYo.t3.Expr[t])
      d.modified_p = 'abc'
      d.variant_p = eYo.key.STAR
      eYo.Test.Code(d, '*')
      d.variant_p = eYo.key.NONE
      eYo.Test.Code(d, '*abc')
      d.dispose()

      d = eYo.Test.new_brick(eYo.t3.Expr[t])
      d.modified_p = 'abc'
      d.modifier_p = '**'
      eYo.Test.Code(d, '**abc')
      d.modifier_p = '*'
      eYo.Test.Code(d, '*abc')
      d.dispose()

      var d = eYo.Test.new_brick(eYo.t3.Expr[t])
      d.modified_p = 'abc'
      var dd = eYo.Test.new_brick(eYo.t3.Expr.identifier)
      dd.target_p = 'cba'
      eYo.Test.Code(dd, 'cba')
      d.modified_s.connect(dd)
      d.variant_p = eYo.key.STAR
      eYo.Test.Code(d, '*')
      d.variant_p = eYo.key.NONE
      eYo.Test.Code(d, '*cba')
      dd.dispose()
      eYo.Test.Code(d, '*abc')
      d.dispose()

      var d = eYo.Test.new_brick(eYo.t3.Expr[t])
      d.modified_p = 'abc'
      var dd = eYo.Test.new_brick(eYo.t3.Expr.identifier)
      dd.target_p = 'cba'
      eYo.Test.Code(dd, 'cba')
      d.modified_s.connect(dd)
      d.modifier_p = '**'
      eYo.Test.Code(d, '**cba')
      d.modifier_p = '*'
      eYo.Test.Code(d, '*cba')
      dd.dispose()
      eYo.Test.Code(d, '*abc')
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
      var d = eYo.Test.new_brick(eYo.t3.Expr[t])
      d.modified_p = 'abc'
      d.variant_p = eYo.key.STAR
      eYo.Test.Code(d, '*')
      d.variant_p = eYo.key.NONE
      eYo.Test.Code(d, '*abc')
      d.dispose()

      d = eYo.Test.new_brick(eYo.t3.Expr[t])
      d.modified_p = 'abc'
      d.modifier_p = '**'
      eYo.Test.Code(d, '**abc')
      d.modifier_p = '*'
      eYo.Test.Code(d, '*abc')
      d.dispose()

      var d = eYo.Test.new_brick(eYo.t3.Expr[t])
      d.modified_p = 'abc'
      var dd = eYo.Test.new_brick(eYo.t3.Expr.identifier)
      dd.target_p = 'cba'
      eYo.Test.Code(dd, 'cba')
      d.modified_s.connect(dd)
      d.variant_p = eYo.key.STAR
      eYo.Test.Code(d, '*')
      d.variant_p = eYo.key.NONE
      eYo.Test.Code(d, '*cba')
      dd.dispose()
      eYo.Test.Code(d, '*abc')
      d.dispose()

      var d = eYo.Test.new_brick(eYo.t3.Expr[t])
      d.modified_p = 'abc'
      var dd = eYo.Test.new_brick(eYo.t3.Expr.identifier)
      dd.target_p = 'cba'
      eYo.Test.Code(dd, 'cba')
      d.modified_s.connect(dd)
      d.modifier_p = '**'
      eYo.Test.Code(d, '**cba')
      d.modifier_p = '*'
      eYo.Test.Code(d, '*cba')
      dd.dispose()
      eYo.Test.Code(d, '*abc')
      d.dispose()
    })
  })
})

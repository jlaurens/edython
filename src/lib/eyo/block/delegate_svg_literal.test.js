describe('Literals(Basic)', function() {
  ;[
    'integer',
    'floatnumber',
    'imagnumber',
    'shortstringliteral',
    'shortformattedliteral',
    'shortbytesliteral',
    'longstringliteral',
    'longformattedliteral',
    'longbytesliteral'
  ].forEach(args => {
    it(`${args[0]}/${args[1]}`, function() {
      var b = eYo.Test.new_block(args[0])
      eYo.Test.assert_code(b, Ts[1])
      b.dispose()
    })
  })
})

describe('Literals(String)', function() {
  ;[
    [`'abc'`, 'shortstringliteral'],
    [`"abc"`, 'shortstringliteral'],
    [`'''abc'''`, 'longstringliteral'],
    [`"""abc"""`, 'longstringliteral'],
    [`f'abc'`, 'shortformattedliteral'],
    [`f"abc"`, 'shortformattedliteral'],
    [`f'''abc'''`, 'longformattedliteral'],
    [`f"""abc"""`, 'longformattedliteral'],
    [`F'abc'`, 'shortformattedliteral'],
    [`F"abc"`, 'shortformattedliteral'],
    [`F'''abc'''`, 'longformattedliteral'],
    [`F"""abc"""`, 'longformattedliteral']
  ].forEach(Ts => {
    it(`${Ts[0]}`, function() {
      var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, Ts[0])
      eYo.Test.assert_block(b, Ts[1])
      eYo.Test.expect_out_check(b, eYo.T3.Stmt[Ts[1]] || eYo.T3.Expr[Ts[1]] || Ts[1])
      eYo.Test.assert_code(b, Ts[0])
      b.dispose()
    })
  })
})

describe('Literals(Basic)', function() {
  [
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
      var d = eYo.test.new_brick(args[0])
      eYo.test.Code(d, Ts[1])
      d.dispose()
    })
  })
})

describe('Literals(String)', function() {
  [
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
      var d = eYo.test.new_brick(Ts[0])
      eYo.test.brick(d, Ts[1])
      eYo.test.expect_out_check(d, eYo.t3.stmt[Ts[1]] || eYo.t3.expr[Ts[1]] || Ts[1])
      eYo.test.Code(d, Ts[0])
      d.dispose()
    })
  })
})

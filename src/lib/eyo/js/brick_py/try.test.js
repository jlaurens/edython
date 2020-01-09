describe('TRY statements', function() {
  ;[
    ['try_part', null, 'try: <MISSING STATEMENT>'],
    ['void_except_part', null, 'except: <MISSING STATEMENT>'],
    ['except_part', 'void_except_part', 'except: <MISSING STATEMENT>'],
    ['finally_part', null, 'finally: <MISSING STATEMENT>'],
    ['raise_stmt', null, 'raise'],
    ['assert_stmt', null, 'assert <MISSING EXPRESSION>']
  ].forEach(Ts => {
    it(`Basic ${Ts[0]} statement`, function() {
      var d = eYo.Test.new_brick(Ts[0], Ts[1] || Ts[0])
      eYo.Test.Code(d, Ts[2])
      eYo.Test.All_variants(d)
      d.dispose()
    })
  })
})

describe('TRY ONLY', function() {
  ;[
    ['try_part', null, 'try:\n    <MISSING STATEMENT>']
  ].forEach(Ts => {
    it(`Basic ${Ts[0]} statement`, function() {
      var d = eYo.Test.new_brick(Ts[0], Ts[1] || Ts[0])
      eYo.Test.Code(d, Ts[2])
      eYo.Test.All_variants(d)
      d.dispose()
    })
  })
})

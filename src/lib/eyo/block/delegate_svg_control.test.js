// This is also a basic test for eYo.Test.basic
eYo.Test.basic(
  [
    ['start_stmt', null, null],
    ['start_stmt', 'start_stmt', null],
    ['start_stmt', null, 'start_stmt'],
    ['start_stmt', 'start_stmt', 'start_stmt']
  ],
  'Control'
)

describe(`start_stmt connections`, function () {
  it(`left/right`, function () {
    var b = eYo.Test.new_block('start_stmt')
    chai.assert(!b.eyo.rightStmtConnection, 'Unexpected right statement connection')
    chai.assert(!b.eyo.leftStmtConnection, 'Unexpected left statement connection')
    b.dispose()
  })
})
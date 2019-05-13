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
    var d = eYo.Test.new_dlgt('start_stmt')
    chai.assert(!d.magnets.right, 'Unexpected right magnet')
    chai.assert(!d.magnets.left, 'Unexpected left magnet')
    d.dispose()
  })
})
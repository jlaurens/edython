describe('Programmatically create a desk', function () {
  it ('Headless desk', function () {
    var desk = new eYo.view.Desk({})
    chai.assert(desk !== eYo.app.desk)
    var board = desk.board
    chai.assert(board !== eYo.board)
  })
  it ('Headfull desk', function () {
    chai.assert(eYo.test.board && eYo.test.board !== eYo.app.board)
  })
  it ('Headfull board metrics scale', function () {
    var board = eYo.test.board
    var board1 = eYo.test.board1
    var before = board.metrics
    board.metrics_.scale = 1
    var after = board.metrics
    chai.assert(before.view.equals(after.view))
    board1.metrics_.scale = 1.5
  })
})

describe('Basic metrics', function () {
  it ('Create block', function () {
    var type = `simple`
    eYo.t3.expr[type] = type
    eYo.expr.newC9r(type, {})
    var b3k = eYo.brick.newReady(type, eYo.board)
  })
})

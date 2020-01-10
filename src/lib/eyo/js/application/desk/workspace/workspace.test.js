describe('Programmatically create a desk', function () {
  it ('Headless desk', function () {
    var desk = new eYo.Desk({})
    chai.assert(desk !== eYo.app.Desk)
    var board = desk.board
    chai.assert(board !== eYo.app.Board)
  })
  it ('Headfull desk', function () {
    chai.assert(eYo.Test.Board && eYo.Test.Board !== eYo.app.board)
  })
  it ('Headfull board metrics scale', function () {
    var board = eYo.Test.Board
    var board1 = eYo.Test.Board1
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
    eYo.t3.Expr[type] = type
    eYo.expr.Dflt.makeSubclass(type, {})
    var b3k = eYo.Brick.newReady(eYo.app.Board, type)
  })
})

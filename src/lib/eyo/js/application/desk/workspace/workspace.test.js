describe('Programmatically create a desk', function () {
  it ('Headless desk', function () {
    var desk = new eYo.Desk({})
    chai.assert(desk !== eYo.app.Desk)
    var board = desk.board
    chai.assert(board !== eYo.app.board)
  })
  it ('Headfull desk', function () {
    chai.assert(eYo.Test.board && eYo.Test.board !== eYo.app.board)
  })
  it ('Headfull board metrics scale', function () {
    var board = eYo.Test.board
    var board1 = eYo.Test.board1
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
    eYo.T3.Expr[type] = type
    eYo.Expr.Dflt.makeSubclass(type, {})
    var b3k = eYo.NS_Brick.newReady(eYo.app.board, type)
  })
})

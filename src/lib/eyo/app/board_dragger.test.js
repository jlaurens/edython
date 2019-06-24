describe('Basic metrics', function () {
  it ('Create block', function () {
    var type = `simple`
    eYo.T3.Expr[type] = type
    eYo.Brick.Expr.makeSubclass(type, {})
    var b3k = eYo.Brick.newReady(eYo.App.board, type)
  })
})

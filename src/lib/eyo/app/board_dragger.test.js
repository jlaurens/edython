describe('Basic  board dragger', function () {
  it ('One block', function () {
    var type = `simple`
    eYo.T3.Expr[type] = type
    eYo.Brick.Expr.makeSubclass(type, {})
    Object.defineProperty(eYo.Brick.Expr[type].prototype, 'isMain', {
      value: true
    })
    var b3k = eYo.Brick.newReady(eYo.App.board, type)
  })
})

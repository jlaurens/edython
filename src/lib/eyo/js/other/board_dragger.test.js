describe('Basic  board dragger', function () {
  it ('One block', function () {
    var type = `simple`
    eYo.T3.Expr[type] = type
    eYo.Expr.Dflt.makeSubclass(type, {})
    Object.defineProperty(eYo.Expr[type].prototype, 'isMain', {
      value: true
    })
    var b3k = eYo.NS_Brick.newReady(eYo.app.board, type)
  })
})

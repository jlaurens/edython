describe('Basic  board dragger', function () {
  it ('One block', function () {
    var type = `simple`
    eYo.t3.Expr[type] = type
    eYo.expr.Dflt.makeSubclass(type, {})
    Object.defineProperty(eYo.expr[type].prototype, 'isMain', {
      value: true
    })
    var b3k = eYo.Brick.newReady(eYo.app.Board, type)
  })
})

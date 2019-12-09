describe('Scrollbar', function() {
  describe ('Visibility', function () {
    eYo.T3.Expr
    it ('simple', function () {
      var type = `simple`
      eYo.T3.Expr[type] = type
      eYo.Expr.Dflt.makeSubclass(type, {})
      var b1 = eYo.ns.Brick.newReady(eYo.app.board, type)
      var b2 = eYo.ns.Brick.newReady(eYo.app.board, type)
      b2.moveTo(eYo.Where.xy(-5, 90))
    })
  })
})


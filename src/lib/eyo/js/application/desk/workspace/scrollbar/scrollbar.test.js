describe('Scrollbar', function() {
  describe ('Visibility', function () {
    eYo.t3.Expr
    it ('simple', function () {
      var type = `simple`
      eYo.t3.Expr[type] = type
      eYo.expr.Dflt.makeSubclass(type, {})
      var b1 = eYo.brick.newReady(eYo.app.Board, type)
      var b2 = eYo.brick.newReady(eYo.app.Board, type)
      b2.moveTo(eYo.Where.xy(-5, 90))
    })
  })
})


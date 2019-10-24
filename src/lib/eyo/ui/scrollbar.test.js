describe('Scrollbar', function() {
  describe ('Visibility', function () {
    eYo.T3.Expr
    it ('simple', function () {
      var type = `simple`
      eYo.T3.Expr[type] = type
      eYo.Brick.Expr.makeSubclass(type, {})
      var b1 = eYo.Brick.newReady(eYo.App.main, type)
      var b2 = eYo.Brick.newReady(eYo.App.main, type)
      b2.moveTo(eYo.Where.xy(-5, 90))
    })
  })
})


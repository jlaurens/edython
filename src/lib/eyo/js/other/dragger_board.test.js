describe('Basic  board dragger', function () {
  it ('One block', function () {
    var type = `simple`
    eYo.t3.expr[type] = type
    eYo.expr.makeC9r(type, {})
    Object.defineProperty(eYo.expr[type].prototype, 'isMain', {
      value: true
    })
    var b3k = eYo.brick.newReady(type, eYo.board)
  })
})

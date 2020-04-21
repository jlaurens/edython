describe('Desk', function () {
  it ('Desk: Basic', function () {
    let onr = {
      eyo: true
    }
    var desk = new eYo.view.Desk(onr)
    eYo.view.Desk.eyo.keys_p__.forEach(k => {
      chai.assert(desk[k], `MISSING property ${k} in desk`)
    })
  })
  // it ('Headfull desk', function () {
  //   chai.assert(eYo.test.board && eYo.test.board !== eYo.app.board)
  // })
  // it ('Headfull board metrics scale', function () {
  //   var board = eYo.test.board
  //   var board1 = eYo.test.board1
  //   var before = board.metrics
  //   board.metrics_.scale = 1
  //   var after = board.metrics
  //   chai.assert(before.view.equals(after.view))
  //   board1.metrics_.scale = 1.5
  // })
})

// describe('Basic metrics', function () {
//   it ('Create block', function () {
//     var type = `simple`
//     eYo.t3.expr[type] = type
//     eYo.expr.makeC9r(type, {})
//     var b3k = eYo.brick.newReady(type, eYo.board)
//   })
// })

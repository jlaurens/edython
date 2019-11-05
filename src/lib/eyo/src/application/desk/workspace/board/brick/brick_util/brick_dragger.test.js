describe('Brick dragger', function() {
  it('Register listener', function () {
    var visibleArea = eYo.app.desk.dom.div_.getBoundingClientRect()
    console.log('visibleArea', visibleArea)
    window.addEventListener(
      'mousemove',
      e => {
        if (e.clientX >= visibleArea.left
          && e.clientX <= visibleArea.right
          && e.clientY >= visibleArea.top
          && e.clientY <= visibleArea.bottom) {
            console.log(e.clientX, e.clientY)
        }
      }
    )
  })
  it ('Create block', function () {
    var type = `simple`
    eYo.T3.Expr[type] = type
    eYo.Brick.Expr.makeSubclass(type, {})
    var b3k = eYo.Brick.newReady(eYo.app.board, type)
  })
})


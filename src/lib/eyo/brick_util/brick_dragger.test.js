describe('Brick dragger', function() {
  it('Register listener', function () {
    var visibleArea = eYo.App.desk.dom.div_.getBoundingClientRect()
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
})


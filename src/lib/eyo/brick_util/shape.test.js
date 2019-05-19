eYo.Test.no_brick_type = true

describe('Expression shape', function () {
  var type = 'test_shape_out'
  eYo.Brick.Expr.makeSubclass(type, {
    out: {
      check: null
    }
  })  
  var b = eYo.Test.new_brick(type)
  chai.assert(b.isExpr, 'MISSED')
  var createPath = (d, c, l) => {
    eYo.Svg.newElement('path', {
      d: d,
      stroke: 'firebrick',
      fill: 'aliceblue',
      transform: `translate(${c * eYo.Unit.x},${l * eYo.Unit.y})`
    }, eYo.App.workspace.svgBlockCanvas_)
  }
  it('column', function() {
    var d = eYo.Shape.definitionWithBrick(b)
    createPath(d, 1, 1)
    b.span.addC(2)
    createPath(d, 5, 1)
  })
  after(function() {
    b.dispose()
  })
})

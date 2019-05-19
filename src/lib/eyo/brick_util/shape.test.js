eYo.Test.no_brick_type = true

describe('Expresion shape', function () {
  var type = 'test_shape_out'
  eYo.Brick.Expr.makeSubclass(type, {
    out: {
      check: null
    }
  })  
  var b = eYo.Test.new_brick(type)
  chai.assert(b.isExpr, 'MISSED')
  var createPath = (d, dx, dy) => {
    eYo.Svg.newElement('path', {
      d: d,
      stroke: 'firebrick',
      fill: 'aliceblue',
      transform: `translate(${dx},${dy})`
    }, eYo.App.workspace.svgBlockCanvas_)
  }
  it('column', function() {
    var d = eYo.Shape.definitionWithBrick(b)
    createPath(d, 10, 10)
  })
  b.dispose()
})

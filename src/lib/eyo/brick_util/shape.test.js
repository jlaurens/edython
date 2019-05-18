eYo.Test.no_brick_type = true

describe('Shape', function () {
  it('statement', function() {
    var b = new eYo.Brick.Expr(eYo.App.workspace)
    chai.assert(b.isExpr, 'MISSED')
    var d = eYo.Shape.definitionWithBrick(b)
    var p = eYo.Svg.newElement('path', {
      d: d,
      stroke: 'firebrick',
      fill: 'aliceblue',
      transform: 'translate(100,10)'
    }, eYo.App.workspace.svgBlockCanvas_)
    
    console.log(d)
  })
})

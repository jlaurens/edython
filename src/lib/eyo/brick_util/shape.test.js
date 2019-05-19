eYo.Test.no_brick_type = true

eYo.Brick.Expr.makeSubclass(`shape_out`, {
  out: {
    check: null
  }
})  

describe('Shape', function () {
  it('statement', function() {
    var b = eYo.Brick.newComplete(eYo.App.workspace, 'shape_out')
    b.beReady()
    chai.assert(b.out_m.isReady, 'not ready')
    chai.assert(b.out_m.in_DB_, 'not in db')
    var b = eYo.Test.new_brick('shape_out')
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

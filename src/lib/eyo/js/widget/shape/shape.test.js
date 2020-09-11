eYo.test.no_brick_type = true

describe('Expression shape', function () {
  return
  var b
})

describe('Statement shape', function () {
  return
  var b
})

describe('Group shape', function () {
  var type = 'test_shape_part'
  eYo.t3.stmt[type] = type
  eYo.stmt.group[eYo.$newSubC3s](type, {}) 
  chai.assert(eYo.stmt.test_shape_part)
  var b
  before(function() {
    b = eYo.test.new_brick(type)
    chai.assert(b.isGroup, 'MISSED')
  })
  var createPath = (b, c, l) => {
    eYo.svg.newElement('path', {
      d: eYo.shape.definitionWithBrick(b),
      stroke: 'firebrick',
      fill: 'aliceblue',
      transform: `translate(${c * eYo.geom.X},${l * eYo.geom.Y})`
    }, eYo.board.dom.Svg.Canvas_)
  }
  it('column', function() {
    b.span.suite += 2
    createPath(b, 21, 0.5)
  })
  after(function() {
    b.dispose()
  })
})

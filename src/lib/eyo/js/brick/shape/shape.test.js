eYo.test.no_brick_type = true

describe('Expression shape', function () {
  var type = 'test_shape_out'
  eYo.t3.expr[type] = type
  eYo.expr.makeC9r(type, {
    out: {
      check: null
    }
  }) 
  chai.assert(eYo.expr.test_shape_out)
  var b
  beforeEach(function() {
    b = eYo.test.new_brick(type)
    chai.assert(b.isExpr, 'MISSED')
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
    createPath(b, 1, 0.5)
    b.span.addC(2)
    createPath(b, 5, 0.5)
  })
  afterEach(function() {
    b.dispose()
  })
})

describe('Statement shape', function () {
  var type = 'test_shape_stmt'
  eYo.t3.stmt[type] = type
  eYo.stmt.makeC9r(type, {}) 
  chai.assert(eYo.stmt.test_shape_stmt)
  var b
  before(function() {
    b = eYo.test.new_brick(type)
    chai.assert(b.isStmt, 'MISSED')
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
    createPath(b, 1, 2)
    b.span.addC(2)
    createPath(b, 5, 2)
    b.span.addC(-2)
    b.span.main += 1
    createPath(b, 11, 0.5)
    b.span.main += 1
    b.span.addC(2)
    createPath(b, 15, 0.5)
  })
  after(function() {
    b.dispose()
  })
})

describe('Group shape', function () {
  var type = 'test_shape_part'
  eYo.t3.stmt[type] = type
  eYo.stmt.group[eYo.$makeSubC9r](type, {}) 
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

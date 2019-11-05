eYo.Test.no_brick_type = true

describe('Expression shape', function () {
  var type = 'test_shape_out'
  eYo.T3.Expr[type] = type
  eYo.Brick.Expr.makeSubclass(type, {
    out: {
      check: null
    }
  }) 
  chai.assert(eYo.Brick.Expr.test_shape_out)
  var b
  beforeEach(function() {
    b = eYo.Test.new_brick(type)
    chai.assert(b.isExpr, 'MISSED')
  })
  var createPath = (b, c, l) => {
    eYo.Svg.newElement('path', {
      d: eYo.Shape.definitionWithBrick(b),
      stroke: 'firebrick',
      fill: 'aliceblue',
      transform: `translate(${c * eYo.Unit.x},${l * eYo.Unit.y})`
    }, eYo.app.board.dom.svg.canvas_)
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
  eYo.T3.Stmt[type] = type
  eYo.Brick.Stmt.makeSubclass(type, {}) 
  chai.assert(eYo.Brick.Stmt.test_shape_stmt)
  var b
  before(function() {
    b = eYo.Test.new_brick(type)
    chai.assert(b.isStmt, 'MISSED')
  })
  var createPath = (b, c, l) => {
    eYo.Svg.newElement('path', {
      d: eYo.Shape.definitionWithBrick(b),
      stroke: 'firebrick',
      fill: 'aliceblue',
      transform: `translate(${c * eYo.Unit.x},${l * eYo.Unit.y})`
    }, eYo.app.board.dom.svg.canvas_)
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
  eYo.T3.Stmt[type] = type
  eYo.Brick.Group.makeSubclass(type, {}) 
  chai.assert(eYo.Brick.Stmt.test_shape_part)
  var b
  before(function() {
    b = eYo.Test.new_brick(type)
    chai.assert(b.isGroup, 'MISSED')
  })
  var createPath = (b, c, l) => {
    eYo.Svg.newElement('path', {
      d: eYo.Shape.definitionWithBrick(b),
      stroke: 'firebrick',
      fill: 'aliceblue',
      transform: `translate(${c * eYo.Unit.x},${l * eYo.Unit.y})`
    }, eYo.app.board.dom.svg.canvas_)
  }
  it('column', function() {
    b.span.suite += 2
    createPath(b, 21, 0.5)
  })
  after(function() {
    b.dispose()
  })
})

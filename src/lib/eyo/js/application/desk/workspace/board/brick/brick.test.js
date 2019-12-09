describe('Brick constructor delegate', function() {
  it(`BCD: Basic`, function() {
    chai.assert(eYo.ns.Brick.Dlgt)
    var c9r = function () {}
    var eyo = new eYo.ns.Brick.Dlgt(c9r, 'Foo', {})
    chai.assert(eyo)
    chai.assert(eyo.name_ === 'Foo')
    chai.assert(eyo.types)
  })
})

describe('Create', function() {
  it(`Basic`, function() {
    eYo.Test.setItUp()
    var b3k = eYo.Test.new_brick('identifier')
    chai.assert(b3k.change.count !== eYo.NA, 'MISSED 3')
    chai.assert(eYo.app.board.getBrickById(b3k.id) === b3k, 'Unknown as top block')
    b3k.dispose()
    eYo.Test.tearItDown()
  })
})

describe('One brick (ALIASED)', function () {
  it (`white space before 'as'`, function () {
    var b3k = eYo.Test.new_brick({
      type: eYo.T3.Expr.identifier,
      target_p: 'abc',
      alias_p: 'cde'
    })
    eYo.Test.code(b3k, 'abc as cde')
    b3k.dispose()
  })
})

describe('Statement magnets', function () {
  var b_1, b_2
  before(function() {
    var type = 'test_stmt_magnets'
    eYo.T3.Stmt[type] = type
    eYo.Stmt.makeSubclass(type, {
      left: { check: type },
      right: { check: type },
    })  
    b_1 = eYo.Test.new_brick(type)
    s_1 = b_1.span
    chai.assert(b_1.isStmt, 'MISSED')
    b_2 = eYo.Test.new_brick(type)
    s_2 = b_2.span
    chai.assert(b_2.isStmt, 'MISSED')
  })
  ;[
    ['head', 'foot'],
    ['foot', 'head'],
    ['left', 'right'],
    ['right', 'left'],
  ].forEach(args => {
    it (`${args[0]} -> ${args[1]}`, function () {
      b_1[args[0]] = b_2
      chai.assert(b_1[args[0]] === b_2, `MISSED ${args[0]} -> ${args[1]}`)
      chai.assert(b_2[args[1]] === b_1, `MISSED ${args[1]} <- ${args[0]}`)
      b_1[args[0]] = eYo.NA
      chai.assert(!b_1[args[0]], `MISSED ${args[0]} -> falsy`)
      chai.assert(!b_2[args[1]], `MISSED ${args[1]} <- falsy`)
    })  
  })
  ;['head', 'left'].forEach(k => {
    it (`${k} -> parent`, function () {
      b_1[k] = b_2
      chai.assert(b_1[k] === b_2, `MISSED ${k} -> parent`)
      chai.assert(b_1.parent === b_2, `MISSED parent <- ${k}`)
      b_1[k] = eYo.NA
      chai.assert(!b_1[k], `MISSED ${k} -> falsy`)
      chai.assert(!b_1.parent, `MISSED parent <- falsy`)
    })
  })
  ;['right', 'foot'].forEach(k => {
    it (`${k} -> parent`, function () {
      b_1[k] = b_2
      chai.assert(b_1[k] === b_2, `MISSED ${k} -> parent`)
      chai.assert(b_2.parent === b_1, `MISSED parent <- ${k}`)
      b_1[k] = eYo.NA
      chai.assert(!b_1[k], `MISSED ${k} -> falsy`)
      chai.assert(!b_2.parent, `MISSED parent <- falsy`)
    })
  })
  after(function() {
    b_2.dispose()
    b_1.dispose()
  })
})

describe('Group magnets', function () {
  var b_1, b_2
  before(function() {
    var type = 'test_group_magnets'
    eYo.T3.Stmt[type] = type
    eYo.ns.Brick.Group.makeSubclass(type, {
      left: { check: type },
      right: { check: type },
    })  
    b_1 = eYo.Test.new_brick(type)
    s_1 = b_1.span
    chai.assert(b_1.isStmt, 'MISSED')
    b_2 = eYo.Test.new_brick(type)
    s_2 = b_2.span
    chai.assert(b_2.isStmt, 'MISSED')
  })
  ;[
    ['head', 'foot'],
    ['foot', 'head'],
    ['left', 'right'],
    ['right', 'left'],
  ].forEach(args => {
    it (`${args[0]} -> ${args[1]}`, function () {
      b_1[args[0]] = b_2
      chai.assert(b_1[args[0]] === b_2, `MISSED ${args[0]} -> ${args[1]}`)
      chai.assert(b_2[args[1]] === b_1, `MISSED ${args[1]} <- ${args[0]}`)
      b_1[args[0]] = eYo.NA
      chai.assert(!b_1[args[0]], `MISSED ${args[0]} -> falsy`)
      chai.assert(!b_2[args[1]], `MISSED ${args[1]} <- falsy`)
    })  
  })
  ;['head', 'left'].forEach(k => {
    it (`${k} -> parent`, function () {
      b_1[k] = b_2
      chai.assert(b_1[k] === b_2, `MISSED ${k} -> parent`)
      chai.assert(b_1.parent === b_2, `MISSED parent <- ${k}`)
      b_1[k] = eYo.NA
      chai.assert(!b_1[k], `MISSED ${k} -> falsy`)
      chai.assert(!b_1.parent, `MISSED parent <- falsy`)
    })
  })
  ;['right', 'suite', 'foot'].forEach(k => {
    it (`${k} -> parent`, function () {
      b_1[k] = b_2
      chai.assert(b_1[k] === b_2, `MISSED ${k} -> parent`)
      chai.assert(b_2.parent === b_1, `MISSED parent <- ${k}`)
      b_1[k] = eYo.NA
      chai.assert(!b_1[k], `MISSED ${k} -> falsy`)
      chai.assert(!b_2.parent, `MISSED parent <- falsy`)
    })
  })
  after(function() {
    b_2.dispose()
    b_1.dispose()
  })
})
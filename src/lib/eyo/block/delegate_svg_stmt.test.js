var assert = chai.assert

var g = eYo.GMR._PyParser_Grammar

var test_connection_db = () => {
  for (var i = 1; i < eYo.Const.RIGHT_STATEMENT; i++) {
    chai.assert(Blockly.mainWorkspace.connectionDBList[i].length === 0, `Unexpected connection ${i}`)
  }
}

describe('comment statement', function () {
  it(`One block dbOpposite_`, function () {
    eYo.Test.setItUp()
    test_connection_db()
    var b = eYo.Test.new_block('comment_stmt')
    // b.eyo.comment_p = 'abc'
    var db
    ;[
      b.previousConnection,
      b.nextConnection,
      b.eyo.rightStmtConnection,
      b.eyo.leftStmtConnection
    ].forEach(c8n => {
      var db = c8n.db_
      chai.assert(db.length === 1)
      chai.assert(db.indexOf(c8n) >= 0)
    })
    ;[
      [b.previousConnection, b.nextConnection],
      [b.nextConnection, b.previousConnection],
      [b.eyo.rightStmtConnection, b.eyo.leftStmtConnection],
      [b.eyo.leftStmtConnection, b.eyo.rightStmtConnection]
    ].forEach(c8ns => {
      var db = c8ns[0].dbOpposite_
      chai.assert(db.length === 1)
      chai.assert(db.indexOf(c8ns[1]) >= 0)
    })
    b.dispose()
    test_connection_db()
    eYo.Test.tearItDown()
  })
  it(`Two blocks dbOpposite_`, function () {
    eYo.Test.setItUp()
    test_connection_db()
    var b1 = eYo.Test.new_block('comment_stmt')
    var b2 = eYo.Test.new_block('comment_stmt')
    // b1.eyo.comment_p = 'abc'
    // b2.eyo.comment_p = 'cde'
    // b2.moveBy(100,20)
    ;[
      ['previousConnection', 'nextConnection'],
      ['leftStmtConnection', 'rightStmtConnection']
    ].forEach(args => {
      var c1 = b1[args[0]] || b1.eyo[args[0]]
      var c2 = b2[args[0]] || b2.eyo[args[0]]
      var cc1 = b1[args[1]] || b1.eyo[args[1]]
      var cc2 = b2[args[1]] || b2.eyo[args[1]]
      var
      db = c1.db_
      chai.assert(db === c2.db_)
      var f1 = (k) => {
        chai.assert(db.length === 2, `${k} 1) ${args[0]} / ${args[1]}`)
        chai.assert(db.indexOf(c1) >= 0, `${k} 2) ${args[0]} / ${args[1]}`)
        chai.assert(db.indexOf(c2) >= 0, `${k} 3) ${args[0]} / ${args[1]}`)
        chai.assert(db.indexOf(cc1) < 0, `${k} 4) ${args[0]} / ${args[1]}`)
        chai.assert(db.indexOf(cc2) < 0, `${k} 5) ${args[0]} / ${args[1]}`)
      }
      f1('c1 db')
      db = c1.dbOpposite_
      chai.assert(db === c2.dbOpposite_)
      var f2 = (k) => {
        chai.assert(db.length === 2, `${k} 1) ${args[0]} / ${args[1]}`)
        chai.assert(db.indexOf(cc1) >= 0, `${k} 2) ${args[0]} / ${args[1]}`)
        chai.assert(db.indexOf(cc2) >= 0, `${k} 3) ${args[0]} / ${args[1]}`)
        chai.assert(db.indexOf(c1) < 0, `${k} 4) ${args[0]} / ${args[1]}`)
        chai.assert(db.indexOf(c2) < 0, `${k} 5) ${args[0]} / ${args[1]}`)
      }
      f2('c1 opposite')
      db = cc1.db_
      chai.assert(db === cc2.db_)
      f2('cc1 db')
      db = cc1.dbOpposite_
      chai.assert(db === cc2.dbOpposite_)
      f1('cc1 opposite')
    })
    b1.dispose()
    b2.dispose()
    test_connection_db()
    eYo.Test.tearItDown()
  })
  it(`Create from type`, function () {
    eYo.Test.setItUp()
    var b = eYo.Test.new_block('comment_stmt')
    eYo.Test.block(b, 'comment_stmt')
    eYo.Test.ctor(b, 'comment_stmt')
    var b1 = eYo.Test.new_block('comment_stmt')
    b.eyo.comment_p = 'abc'
    b1.eyo.comment_p = 'cde'
    b1.moveBy(100,20)
    eYo.Selected.connection = b1.eyo.rightStmtConnection
    // b1.dispose()
    // b.dispose()
    eYo.Test.tearItDown()
  })
})

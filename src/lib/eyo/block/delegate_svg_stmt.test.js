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
    var d = eYo.Test.new_dlgt('comment_stmt')
    // d.comment_p = 'abc'
    var m4ts = d.magnets
    ;[
      m4ts.top,
      m4ts.bottom,
      m4ts.left,
      m4ts.right
    ].forEach(m => {
      var db = m.connection.db_
      chai.assert(db.length === 1)
      chai.assert(db.indexOf(m.connection) >= 0)
    })
    ;[
      [m4ts.top, m4ts.bottom],
      [m4ts.bottom, m4ts.top],
      [m4ts.left, m4ts.right],
      [m4ts.right, m4ts.left]
    ].forEach(ms => {
      var db = ms[0].connection.dbOpposite_
      chai.assert(db.length === 1)
      chai.assert(db.indexOf(ms[1].connection) >= 0)
    })
    d.block_.dispose()
    test_connection_db()
    eYo.Test.tearItDown()
  })
  it(`Two blocks dbOpposite_`, function () {
    eYo.Test.setItUp()
    test_connection_db()
    var d1 = eYo.Test.new_dlgt('comment_stmt')
    var d2 = eYo.Test.new_dlgt('comment_stmt')
    // d1.comment_p = 'abc'
    // d2.comment_p = 'cde'
    // d2.moveBy(100,20)
    ;[
      ['top', 'bottom'],
      ['left', 'right']
    ].forEach(args => {
      var c1 = d1.magnets[args[0]].connection
      var c2 = d2.magnets[args[0]].connection
      var cc1 = d1.magnets[args[1]].connection
      var cc2 = d2.magnets[args[1]].connection
      var db = c1.db_
      chai.assert(db === c2.db_)
      var f1 = k => {
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
    d1.block_.dispose()
    d2.block_.dispose()
    test_connection_db()
    eYo.Test.tearItDown()
  })
  it(`Create from type`, function () {
    eYo.Test.setItUp()
    var d = eYo.Test.new_dlgt('comment_stmt')
    eYo.Test.dlgt(d, 'comment_stmt')
    eYo.Test.ctor(d, 'comment_stmt')
    var d1 = eYo.Test.new_dlgt('comment_stmt')
    d.comment_p = 'abc'
    d1.comment_p = 'cde'
    d1.moveBy(100,20)
    eYo.Selected.connection = d1.magnets.right.connection
    // d1.block_.dispose()
    // d.block_.dispose()
    eYo.Test.tearItDown()
  })
})

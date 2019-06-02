var assert = chai.assert

var g = eYo.GMR._PyParser_Grammar

var test_connection_db = () => {
  for (var i = 1; i < eYo.Magnet.RIGHT; i++) {
    chai.assert(Blockly.mainBoard.magnetDBList[i].length === 0, `Unexpected connection ${i}`)
  }
}

describe('comment statement', function () {
  it(`One brick dbOpposite_`, function () {
    eYo.Test.setItUp()
    test_connection_db()
    var d = eYo.Test.new_brick('comment_stmt')
    // d.comment_p = 'abc'
    var m5s = d.magnets
    ;[
      m5s.head,
      m5s.foot,
      m5s.left,
      m5s.right
    ].forEach(m => {
      var db = m.db_
      chai.assert(db.length === 1)
      chai.assert(db.indexOf(m) >= 0)
    })
    ;[
      [m5s.head, m5s.foot],
      [m5s.foot, m5s.head],
      [m5s.left, m5s.right],
      [m5s.right, m5s.left]
    ].forEach(ms => {
      var db = ms[0].dbOpposite_
      chai.assert(db.length === 1)
      chai.assert(db.indexOf(ms[1]) >= 0)
    })
    d.dispose()
    test_connection_db()
    eYo.Test.tearItDown()
  })
  it(`Two bricks dbOpposite_`, function () {
    eYo.Test.setItUp()
    test_connection_db()
    var d1 = eYo.Test.new_brick('comment_stmt')
    var d2 = eYo.Test.new_brick('comment_stmt')
    // d1.comment_p = 'abc'
    // d2.comment_p = 'cde'
    // d2.xyMoveBy(100,20)
    ;[
      ['high', 'low'],
      ['left', 'right']
    ].forEach(args => {
      var c1 = d1.magnets[args[0]]
      var c2 = d2.magnets[args[0]]
      var cc1 = d1.magnets[args[1]]
      var cc2 = d2.magnets[args[1]]
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
    d1.dispose()
    d2.dispose()
    test_connection_db()
    eYo.Test.tearItDown()
  })
  it(`Create from type`, function () {
    eYo.Test.setItUp()
    var d = eYo.Test.new_brick('comment_stmt')
    eYo.Test.brick(d, 'comment_stmt')
    eYo.Test.ctor(d, 'comment_stmt')
    var d1 = eYo.Test.new_brick('comment_stmt')
    d.comment_p = 'abc'
    d1.comment_p = 'cde'
    d1.xyMoveBy(100,20)
    d1.right_m.select()
    // d1.dispose()
    // d.dispose()
    eYo.Test.tearItDown()
  })
})

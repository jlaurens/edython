describe ('Tests: Stmt', function () {
  it ('Stmt: basic', function () {
    chai.assert(eYo.Stmt)
    chai.assert(eYo.isSubclass(eYo.Stmt.Dflt, eYo.Brick.Dflt))
  })
})

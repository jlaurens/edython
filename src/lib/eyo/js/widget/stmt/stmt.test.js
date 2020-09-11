describe ('Tests: Stmt', function () {
  it ('Stmt: basic', function () {
    chai.assert(eYo.stmt)
    chai.assert(eYo.isSubclass(eYo.stmt.BaseC3s, eYo.brick.BaseC3s))
  })
})

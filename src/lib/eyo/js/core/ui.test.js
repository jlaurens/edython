NS = Object.create(null)
describe ('Tests: ui', function () {
  it ('Ui: basic', function () {
    chai.assert(false, 'NOT YET IMPLEMENTED')
  })
})
describe ('Tests: dlgt_ui', function () {
  it ('dlgt_ui: basic', function () {
    chai.assert(eYo.c9r)
    chai.assert(eYo.c9r.Dlgt)
  })
  it ('dlgt_ui: make', function () {
    var NS = Object.create(null)
    eYo.c9r.makeC9r(NS, 'A')
    chai.assert(NS.A)
    chai.assert(NS.A.SuperC9r_p === eYo.c9r.Dflt_p)
    chai.assert(NS.A.eyo.constructor === eYo.c9r.Dlgt)
    chai.assert(NS.A.eyo.initUIDecorate)
    chai.assert(NS.A.eyo.disposeUIDecorate)
    chai.assert(NS.A.makeInheritedC9r)
  })
  it ('dlgt_ui: makeInheritedC9r', function () {
    var NS = Object.create(null)
    var F = function () {}
    eYo.inherits(F, eYo.c9r.Dlgt)
    eYo.c9r.makeC9r(NS, 'A')
    NS.A.makeInheritedC9r('AB')
    chai.assert(NS.A.AB)
    chai.assert(NS.A.AB.SuperC9r_p === NS.A.prototype)
    chai.assert(NS.A.AB.eyo.constructor = eYo.c9r.Dlgt)
    NS.A.makeInheritedC9r('AB', F)
    chai.assert(NS.A.AB.eyo.constructor = F)
  })
})

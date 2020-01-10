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
    eYo.c9r.makeClass(NS, 'A')
    chai.assert(NS.A)
    chai.assert(NS.A.superProto_ === eYo.c9r.Dflt.prototype)
    chai.assert(NS.A.eyo.constructor === eYo.c9r.Dlgt)
    chai.assert(NS.A.eyo.initUIDecorate)
    chai.assert(NS.A.eyo.disposeUIDecorate)
    chai.assert(NS.A.makeSubclass)
  })
  it ('dlgt_ui: makeSubclass', function () {
    var NS = Object.create(null)
    var F = function () {}
    eYo.inherits(F, eYo.c9r.Dlgt)
    eYo.c9r.makeClass(NS, 'A')
    NS.A.makeSubclass('AB')
    chai.assert(NS.A.AB)
    chai.assert(NS.A.AB.superProto_ === NS.A.prototype)
    chai.assert(NS.A.AB.eyo.constructor = eYo.c9r.Dlgt)
    NS.A.makeSubclass('AB', F)
    chai.assert(NS.A.AB.eyo.constructor = F)
  })
})

NS = Object.create(null)
describe ('Tests: ui', function () {
  it ('Ui: basic', function () {
    chai.assert(false, 'NOT YET IMPLEMENTED')
  })
})
describe ('Tests: dlgt_ui', function () {
  it ('dlgt_ui: basic', function () {
    chai.assert(eYo.ns.UI)
    chai.assert(eYo.ns.UI.Dlgt)
  })
  it ('dlgt_ui: make', function () {
    var NS = Object.create(null)
    eYo.ns.UI.makeClass(NS, 'A')
    chai.assert(NS.A)
    chai.assert(NS.A.superClass_ = eYo.ns.UI.Dflt.prototype)
    chai.assert(NS.A.eyo.constructor = eYo.ns.UI.Dlgt)
    chai.assert(NS.A.eyo.initUIDecorate)
    chai.assert(NS.A.eyo.disposeUIDecorate)
    chai.assert(NS.A.makeSubclass)
  })
  it ('dlgt_ui: makeSubclass', function () {
    var NS = Object.create(null)
    var F = function () {}
    eYo.inherits(F, eYo.ns.UI.Dlgt)
    eYo.ns.UI.makeClass(NS, 'A')
    NS.A.makeSubclass('AB')
    chai.assert(NS.A.AB)
    chai.assert(NS.A.AB.superClass_ = NS.A.prototype)
    chai.assert(NS.A.AB.eyo.constructor = eYo.ns.UI.Dlgt)
    NS.A.makeSubclass('AB', F)
    chai.assert(NS.A.AB.eyo.constructor = F)
  })
})

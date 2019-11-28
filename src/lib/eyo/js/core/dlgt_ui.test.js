NS = Object.create(null)
describe ('Tests: dlgt_ui', function () {
  it ('dlgt_ui: basic', function () {
    chai.assert(eYo.UI)
    chai.assert(eYo.UI.Dlgt)
  })
  it ('dlgt_ui: make', function () {
    var NS = Object.create(null)
    eYo.UI.makeClass(NS, 'A')
    chai.assert(NS.A)
    chai.assert(NS.A.superClass_ = eYo.UI.Dflt.prototype)
    chai.assert(NS.A.eyo.constructor = eYo.UI.Dlgt)
    chai.assert(NS.A.eyo.initUIDecorate)
    chai.assert(NS.A.eyo.disposeUIDecorate)
    chai.assert(NS.A.makeSubclass)
  })
  it ('dlgt_ui: makeSubclass', function () {
    var NS = Object.create(null)
    var F = function () {}
    eYo.Do.inherits(F, eYo.UI.Dlgt)
    eYo.UI.makeClass(NS, 'A')
    NS.A.makeSubclass('AB')
    chai.assert(NS.A.AB)
    chai.assert(NS.A.AB.superClass_ = NS.A.prototype)
    chai.assert(NS.A.AB.eyo.constructor = eYo.UI.Dlgt)
    NS.A.makeSubclass('AB', F)
    chai.assert(NS.A.AB.eyo.constructor = F)
  })
})

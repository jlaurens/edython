NS = Object.create(null)
describe ('Tests: constructor_ui', function () {
  it ('Constructor_ui: basic', function () {
    chai.assert(eYo.UI.Constructor)
    chai.assert(eYo.UI.Constructor.Dlgt)
  })
  it ('Constructor_ui: make', function () {
    var NS = Object.create(null)
    eYo.UI.Constructor.makeClass(NS, 'A')
    chai.assert(NS.A)
    chai.assert(NS.A.superClass_ = eYo.UI.Owned.prototype)
    chai.assert(NS.A.eyo.constructor = eYo.UI.Constructor.Dlgt)
    chai.assert(NS.A.eyo.initUIDecorate)
    chai.assert(NS.A.eyo.disposeUIDecorate)
    chai.assert(NS.A.makeSubclass)
  })
  it ('Constructor_ui: makeSubclass', function () {
    var NS = Object.create(null)
    var F = function () {}
    eYo.Do.inherits(F, eYo.UI.Constructor.Dlgt)
    eYo.UI.Constructor.makeClass(NS, 'A')
    NS.A.makeSubclass('AB')
    chai.assert(NS.A.AB)
    chai.assert(NS.A.AB.superClass_ = NS.A.prototype)
    chai.assert(NS.A.AB.eyo.constructor = eYo.UI.Constructor.Dlgt)
    NS.A.makeSubclass('AB', F)
    chai.assert(NS.A.AB.eyo.constructor = F)
  })
})

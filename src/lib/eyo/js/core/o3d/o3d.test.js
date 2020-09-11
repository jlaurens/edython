describe ('Tests: Owned', function () {
  this.timeout(20000)
  beforeEach (function() {
    eYo.test.setup()
  })
  eYo.test.setup()
  it ('O3d: modelC3sBase', function () {
    let ns = eYo.o3d.newNS()
    ns.makeBaseC3s()
    chai.expect(ns.modelC3sBase()).equal(ns.BaseC3s)
  })
  it ('O3d: modelMakeC3s', function () {
    let ns = eYo.o3d.newNS()
    ns.makeBaseC3s()
    var model = {}
    ns.modelMakeC3s(model, 'foo')
    chai.expect(model[eYo.$C3s][eYo.$SuperC3s]).equal(ns.BaseC3s)
  })
  it ('O3d: eYo.o3d.new', function () {
    let o3d = eYo.o3d.new('foo', eYo.test.onr)
    chai.expect(o3d.owner).equal(eYo.test.onr)
    chai.expect(() => {
      o3d.owner = eYo.NA
    }).xthrow()
    o3d.owner_ = eYo.NA
    chai.expect(o3d.owner).equal(eYo.NA)
  })
  it(`O3d: ns.new(model)`, function () {
    let ns = eYo.o3d.newNS()
    ns.makeBaseC3s()
    let model = {}
    let f = ns.new(model, 'foo', eYo.test.onr)
    chai.expect(f.constructor).equal(model[eYo.$C3s])
  })
  it ('O3d: time is on my side', function () {
    // In the init method, the properties are available and initialized
    // when not lazy!
    let ns = eYo.o3d.newNS()
    ns.makeBaseC3s({
      prepare (key, owner) {
        chai.expect(this.owner).equal(owner)
      },
      init (key, owner) {
        chai.expect(this.owner).equal(owner)
      }
    })
    let o = ns.new('abc', eYo.test.onr)
    chai.expect(o.owner).equal(eYo.test.onr)
  })
  it ('O3d: ownerDidChange', function () {
    let ns_o3d = eYo.o3d.newNS()
    ns_o3d.makeBaseC3s({
      init (key, owner) {
        chai.expect(this.owner).equal(owner)
      }
    })
    let o = ns_o3d.new('abc', eYo.c3s.new())
    o.eyo$.C3s_p.ownerWillChange = function (before, after) {
      eYo.flag.push(1)
    }
    o.eyo$.C3s_p.ownerDidChange = function (before, after) {
      eYo.flag.push(2)
      o.eyo$.C3s_s.ownerDidChange.call(this, before, after)
    }
    eYo.test.onr.hasUI = true
    o.eyo$.C3s_p.initUI = function () {
      eYo.flag.push(3)
    }
    o.owner_ = eYo.test.onr
    eYo.flag.expect(123)
  })
})

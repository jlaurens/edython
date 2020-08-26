describe ('Tests: Owned', function () {
  this.timeout(20000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c9r && eYo.c9r.new({
      methods: {
        flag (what, ...$) {
          flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  })
  it ('O3d: modelC9rBase', function () {
    let ns = eYo.o3d.newNS()
    ns.makeC9rBase()
    chai.expect(ns.modelC9rBase()).equal(ns.C9rBase)
  })
  it ('O3d: modelMakeC9r', function () {
    let ns = eYo.o3d.newNS()
    ns.makeC9rBase()
    var model = {}
    ns.modelMakeC9r(model, 'foo')
    chai.expect(model[eYo.$C9r][eYo.$SuperC9r]).equal(ns.C9rBase)
  })
  it ('O3d: eYo.o3d.new', function () {
    let o3d = eYo.o3d.new('foo', onr)
    chai.expect(o3d.owner).equal(onr)
    chai.expect(() => {
      o3d.owner = eYo.NA
    }).throw()
    o3d.owner_ = eYo.NA
    chai.expect(o3d.owner).equal(eYo.NA)
  })
  it(`O3d: ns.new(model)`, function () {
    let ns = eYo.o3d.newNS()
    ns.makeC9rBase()
    let model = {}
    let f = ns.new(model, 'foo', onr)
    chai.expect(f.constructor).equal(model[eYo.$C9r])
  })
  it ('O3d: time is on my side', function () {
    // In the init method, the properties are available and initialized
    // when not lazy!
    let ns = eYo.o3d.newNS()
    ns.makeC9rBase({
      init (key, owner) {
        chai.expect(this.owner).equal(owner)
      }
    })
    let o = ns.new('abc', onr)
    chai.expect(o.owner).equal(onr)
  })
  it ('O3d: ownerDidChange', function () {
    let ns_o3d = eYo.o3d.newNS()
    ns_o3d.makeC9rBase({
      init (key, owner) {
        chai.expect(this.owner).equal(owner)
      }
    })
    let o = ns_o3d.new('abc', eYo.c9r.new())
    o.eyo.C9r_p.ownerWillChange = function (before, after) {
      flag.push(1)
    }
    o.eyo.C9r_p.ownerDidChange = function (before, after) {
      flag.push(2)
      o.eyo.C9r_s.ownerDidChange.call(this, before, after)
    }
    onr.hasUI = true
    o.eyo.C9r_p.initUI = function () {
      flag.push(3)
    }
    o.owner_ = onr
    flag.expect(123)
  })
})

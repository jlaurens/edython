describe ('Tests: Owned', function () {
  this.timeout(10000)
  flag = {
    v: 0,
    reset (what) {
      this.v = what || 0
    },
    push (...$) {
      $.forEach(what => {
        what && (this.v = parseInt(this.v.toString() + what.toString()))
      })
    },
    expect (what) {
      let ans = chai.expect(this.v).equal(what)
      this.reset()
      return ans
    },
  }
  it ('O3d: Basic', function () {
    chai.assert(eYo.o3d)
    chai.assert(eYo.o3d._p.hasOwnProperty('BaseC9r'))
  })
  it ('O3d: modelBaseC9r', function () {
    let ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    chai.expect(ns.modelBaseC9r()).equal(ns.BaseC9r)
  })
  it ('O3d: modelMakeC9r', function () {
    let ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    var model = {}
    ns.modelMakeC9r('foo', model)
    chai.expect(model._C9r.SuperC9r).equal(ns.BaseC9r)
  })
  it ('O3d: eYo.o3d.new', function () {
    let onr = new eYo.c9r.BaseC9r()
    let o3d = eYo.o3d.new(onr, 'foo')
    chai.expect(o3d.owner).equal(onr)
    chai.expect(() => {
      o3d.owner = eYo.NA
    }).throw()
    o3d.owner_ = eYo.NA
    chai.expect(o3d.owner).equal(eYo.NA)
  })
  it(`O3d: ns.new(model)`, function () {
    let onr = new eYo.c9r.BaseC9r()
    let ns = eYo.o3d.makeNS()
    ns.makeBaseC9r()
    let model = {}
    let f = ns.new(onr, 'foo', model)
    chai.expect(f.constructor).equal(model._C9r)
  })
  it ('O3d: time is on my side', function () {
    // In the init method, the properties are available and initialized
    // when not lazy!
    let onr = new eYo.c9r.BaseC9r()
    let ns = eYo.o3d.makeNS()
    ns.makeBaseC9r({
      init (what) {
        chai.expect(this.owner).equal(what)
      }
    })
    let o = ns.new(onr, 'abc')
    chai.expect(o.owner).equal(onr)
  })
  it ('O3d: ownerDidChange', function () {
    let ns = eYo.o3d.makeNS()
    ns.makeBaseC9r({
      init (what) {
        chai.expect(this.owner).equal(what)
      }
    })
    let o = ns.new(new eYo.c9r.BaseC9r(), 'abc')
    o.eyo.C9r_p.ownerWillChange = function (before, after) {
      flag.push(1)
    }
    o.eyo.C9r_p.ownerDidChange = function (before, after) {
      flag.push(2)
      o.eyo.C9r_s.ownerDidChange.call(this, before, after)
    }
    let onr = new eYo.c9r.BaseC9r()
    onr.hasUI = true
    o.eyo.C9r_p.initUI = function () {
      flag.push(3)
    }
    o.owner_ = onr
    flag.expect(123)
  })
})

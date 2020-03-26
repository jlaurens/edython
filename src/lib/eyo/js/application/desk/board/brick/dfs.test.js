describe('DFS Tests', function() {
  it(`DFS: Basic`, function() {
    chai.assert(eYo.dfs)
    chai.assert(eYo.dfs.Base)
    chai.assert(eYo.dfs.Dlgt_p)
    chai.assert(eYo.dfs.enhancedMany)
  })
  it(`eYo.dfs.enhancedMany`, function() {
    let ns = eYo.dfs.makeNS()
    chai.expect(() => {
      ns.enhancedMany('foo')
    }).throw
  })
  it(`eYo.dfs.enhancedMany 0`, function() {
    let ns = eYo.dfs.makeNS()
    ns.makeBase()
    ns.enhancedMany('foo')
    chai.expect(() => {
      ns.enhancedMany('foo')
    }).throw
    let _p = ns.Dlgt_p
    ;[
      'Prepare',
      'Merge',
      'ForEach',
      'Some',
      'ForEach',
      'Init',
      'Dispose',
      'ByKey',
    ].forEach(k => {
      chai.assert(_p.hasOwnProperty('foo' + k))
    })
  })
  it(`eYo.dfs.enhancedMany 1`, function() {
    let ns = eYo.dfs.makeNS()
    ns.makeBase()
    let unik = 'foo' + eYo.do.genUID(10, 'alnum')
    ns.enhancedMany(unik)
    let onr = {}
    var b = ns.new(onr)
    let flag = []
    b[unik + 'ForEach'](x => {
      flag.push(x)
    })
    chai.expect(flag.length).equal(0)
    b[unik + 'Some'](x => {
      flag.push(x)
    })
    chai.expect(flag.length).equal(0)
  })
  it(`eYo.dfs.enhancedMany 1`, function() {
    let ns = eYo.dfs.makeNS()
    ns.makeBase()
    let unik = 'foo' + eYo.do.genUID(10, 'alnum')
    ns.enhancedMany(unik)
    let onr = {}
    var b = ns.new(onr)
    let flag = []
    b[unik + 'ForEach'](x => {
      flag.push(x)
    })
    chai.expect(flag.length).equal(0)
    b[unik + 'Some'](x => {
      flag.push(x)
    })
    chai.expect(flag.length).equal(0)
    ns.Base.eyo[unik + 'Merge']({
      a: {
        value: 1,
      },
      b: {
        value: 2,
      },
    })
    chai.expect(() => {
      b = ns.new(onr)
    }).throw
    let foo = eYo.c9r.makeNS(eYo, unik)
    foo.makeBase({
      init (what) {
        this.value = what
      }
    })
    flag = 0
    b[unik + 'ForEach'](x => {
      flag *= 10
      flag += x.value
    })
    chai.expect(flag).equal(12)
    flag = 0
    b[unik + 'Some'](x => {
      flag *= 10
      return flag += x.value
    })
    chai.expect(flag).equal(1)
  })
})

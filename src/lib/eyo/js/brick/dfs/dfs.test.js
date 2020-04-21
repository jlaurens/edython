describe('DFS Tests', function() {
  this.timeout(10000)
  let flag = {
    v: '',
    reset (what) {
      this.v = what && what.toString() || ''
    },
    push (...$) {
      $.forEach(what => {
        what && (this.v += what.toString())
      })
      return this.v
    },
    expect (what) {
      if (eYo.isRA(what)) {
        what = what.map(x => x.toString())
        var ans = chai.expect(what).include(this.v || '0')
      } else {
        ans = chai.expect(what.toString()).equal(this.v || '0')
      }
      this.reset()
      return ans
    },
  }
  let onr = eYo.c9r.new()
  it(`DFS: Basic`, function() {
    chai.assert(eYo.dfs)
    chai.assert(eYo.dfs.BaseC9r)
    chai.assert(eYo.dfs.Dlgt_p)
  })
  it (`DFS: owner`, function () {
    let ns = eYo.dfs.makeNS()
    ns.makeBaseC9r()
    ns.makeC9r('Brick')
    ns.makeC9r('Slot')
    ns.makeC9r('Magnet')
    let X = {}
    ;[ns.Brick, ns.Slot, ns.Magnet].forEach(C9r => {
      let k = C9r.eyo.id[0].toLowerCase()
      X[k] = new C9r(onr, k)
      ;[ns.Brick, ns.Slot, ns.Magnet].forEach(C9r2 => {
        if (C9r2 !== C9r) {
          let k2 = C9r2.eyo.id[0].toLowerCase()
          X[k + k2] = new C9r2(onr, k + k2)  
        }
      })
    })

  })
})

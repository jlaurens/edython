describe('DFS Tests', function() {
  this.timeout(20000)
  let flag = new eYo.test.Flag()
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
      let k = C9r[eYo.$].id[0].toLowerCase()
      X[k] = new C9r(onr, k)
      ;[ns.Brick, ns.Slot, ns.Magnet].forEach(C9r2 => {
        if (C9r2 !== C9r) {
          let k2 = C9r2[eYo.$].id[0].toLowerCase()
          X[k + k2] = new C9r2(onr, k + k2)  
        }
      })
    })

  })
})

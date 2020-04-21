describe ('Tests: db', function () {
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
  it ('Db: basic', function () {
    chai.assert(eYo.o3d.DB)
  })
  it ('DB: add, remove', function () {
    let db = new eYo.o3d.DB('db', onr)
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r({
      init (id) {
        this.id = id
      },
      methods: {
        push () {
          flag.push(this.id)
        }
      }
    })
    let a = ns.new(1)
    let b = ns.new(2)
    db.forEach(o => o.push())
    flag.expect(0)
    db.add(a)
    db.forEach(o => o.push())
    flag.expect(1)
    db.add(b)
    db.forEach(o => o.push())
    flag.expect([12, 21])
    db.remove(a)
    db.forEach(o => o.push())
    flag.expect(2)
    db.remove(b)
    db.forEach(o => o.push())
    flag.expect(0)
  })
})

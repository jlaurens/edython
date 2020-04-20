describe ('Tests: db', function () {
  this.timeout(10000)
  let flag = {
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
      let ans = eYo.isRA(what) ? chai.expect(what).include(this.v) : chai.expect(what).equal(this.v)
      this.reset()
      return ans
    },
  }
  let onr = eYo.c9r.new()
  it ('Db: basic', function () {
    chai.assert(eYo.o3d.DB)
  })
  it ('DB: add, remove', function () {
    let db = new eYo.o3d.DB(onr, 'db')
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

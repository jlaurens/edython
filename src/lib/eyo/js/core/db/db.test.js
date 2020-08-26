describe ('Tests: db', function () {
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
  it ('DB: add, remove', function () {
    let db = new eYo.o3d.DB('db', onr)
    let NS = eYo.c9r.newNS()
    NS.makeC9rBase({
      init (id) {
        this.id = id
      },
      methods: {
        flag (...$) {
          flag.push(this.id, ...$)
        }
      }
    })
    let a = NS.new(1)
    chai.expect(a.id).equal(1)
    a.flag(3, 4)
    flag.expect(134)
    let b = NS.new(2)
    chai.expect(b.id).equal(2)
    b.flag(3, 4)
    flag.expect(234)
    db.forEach(o => o.flag(3, 4))
    flag.expect()
    db.add(a)
    db.forEach(o => o.flag(3, 4))
    flag.expect(134)
    db.add(b)
    db.forEach(o => o.flag(3, 4))
    flag.expect(134234)
    db.remove(a)
    db.forEach(o => o.flag(3, 4))
    flag.expect(234)
    db.remove(b)
    db.forEach(o => o.flag(3, 4))
    flag.expect()
  })
})

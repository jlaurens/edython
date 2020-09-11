describe ('Tests: db', function () {
  this.timeout(20000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c3s && eYo.c3s.new({
      methods: {
        flag (what, ...$) {
          eYo.flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  })
  it ('DB: add, remove', function () {
    let db = new eYo.o3d.DB('db', onr)
    let NS = eYo.c3s.newNS()
    NS.makeC3sBase({
      init (id) {
        this.id = id
      },
      methods: {
        flag (...$) {
          eYo.flag.push(this.id, ...$)
        }
      }
    })
    let a = NS.new(1)
    chai.expect(a.id).equal(1)
    a.flag(3, 4)
    eYo.flag.expect(134)
    let b = NS.new(2)
    chai.expect(b.id).equal(2)
    b.flag(3, 4)
    eYo.flag.expect(234)
    db.forEach(o => o.flag(3, 4))
    eYo.flag.expect()
    db.add(a)
    db.forEach(o => o.flag(3, 4))
    eYo.flag.expect(134)
    db.add(b)
    db.forEach(o => o.flag(3, 4))
    eYo.flag.expect(134234)
    db.remove(a)
    db.forEach(o => o.flag(3, 4))
    eYo.flag.expect(234)
    db.remove(b)
    db.forEach(o => o.flag(3, 4))
    eYo.flag.expect()
  })
})

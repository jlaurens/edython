describe ('Tests: db', function () {
  this.timeout(10000)
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
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r({
      init (id) {
        this.id = id
      },
      methods: {
        flag (...$) {
          flag.push(this.id, ...$)
        }
      }
    })
    let a = ns.new(1)
    let b = ns.new(2)
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

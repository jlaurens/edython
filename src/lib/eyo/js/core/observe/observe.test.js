describe ('Tests: Observe', function () {
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
  it (`$this`, function () {
    let ns = eYo.c3s.newNS()
    ns.makeBaseC3s()
    ns.BaseC3s[eYo.$].observeEnhanced()
    let o = ns.new()
    let oo = {
      flag(...$) {
        eYo.flag.push(1, ...$)
      }
    }
    o.addObserver(eYo.observe.BEFORE, oo, function (before, after) {
      this.flag(2, before + 2, after + 2)
    })
    o.willChange(1, 2)
    eYo.flag.expect(1234)
  })
  it (`Inherited`, function () {
    let ns = eYo.c3s.newNS()
    let SuperC3s = ns.makeBaseC3s()
    let C3s = SuperC3s[eYo.$newSubC3s]('Foo')
    let ChildC3s = C3s[eYo.$newSubC3s]('Bar')
    SuperC3s[eYo.$].observeEnhanced()
    let o = new ChildC3s()
    let o_o = o.addObserver(eYo.observe.BEFORE, function (before, after) {
      eYo.flag.push(before, after)
    })
    o.willChange(1, 2)
    eYo.flag.expect(12)
    let o_ChildC3s = ChildC3s.prototype.addObserver(eYo.observe.BEFORE, function (before, after) {
      eYo.flag.push(7, before + 7, after + 7)
    })
    o.willChange(1, 2)
    eYo.flag.expect(78912)
    let o_C3s = C3s.prototype.addObserver(eYo.observe.BEFORE, function (before, after) {
      eYo.flag.push(4, before + 4, after + 4)
    })
    o.willChange(1, 2)
    eYo.flag.expect(45678912)
    let o_SuperC3s = SuperC3s.prototype.addObserver(eYo.observe.BEFORE, function (before, after) {
      eYo.flag.push(1, before+1, after+1)
    })
    o.willChange(1, 2)
    eYo.flag.expect(12345678912)
    o.removeObserver(o_o)
    o.willChange(1, 2)
    eYo.flag.expect(123456789)
    ChildC3s.prototype.removeObserver(o_ChildC3s)
    o.willChange(1, 2)
    eYo.flag.expect(123456)
    C3s.prototype.removeObserver(o_C3s)
    o.willChange(1, 2)
    eYo.flag.expect(123)
    SuperC3s.prototype.removeObserver(o_SuperC3s)
    o.willChange(1, 2)
    eYo.flag.expect()
  })
  it (`Shared and inherited`, function () {
    let ns = eYo.c3s.newNS()
    ns.makeBaseC3s()
    ns.BaseC3s[eYo.$].observeEnhanced()
    ns.new().willChange(1, 2)
    eYo.flag.expect()
    ns.BaseC3s_p.addObserver(eYo.observe.BEFORE, function (before, after) {
      eYo.flag.push(1, before+1, after+1)
    })
    ns.new().willChange(1, 2)
    eYo.flag.expect(123)
    ns.new().willChange(1, 2)
    eYo.flag.expect(123)
  })
})

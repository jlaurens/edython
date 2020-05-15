describe ('Tests: Observe', function () {
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
  it (`$this`, function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    ns.BaseC9r.eyo.observeEnhanced()
    let o = ns.new()
    let oo = {
      flag(...$) {
        flag.push(1, ...$)
      }
    }
    o.addObserver(eYo.observe.BEFORE, oo, function (before, after) {
      this.flag(2, before + 2, after + 2)
    })
    o.willChange(1, 2)
    flag.expect(1234)
  })
  it (`Inherited`, function () {
    let ns = eYo.c9r.makeNS()
    let SuperC9r = ns.makeBaseC9r()
    let C9r = SuperC9r.makeSubC9r('Foo')
    let ChildC9r = C9r.makeSubC9r('Bar')
    SuperC9r.eyo.observeEnhanced()
    let o = new ChildC9r()
    let o_o = o.addObserver(eYo.observe.BEFORE, function (before, after) {
      flag.push(before, after)
    })
    o.willChange(1, 2)
    flag.expect(12)
    let o_ChildC9r = ChildC9r.prototype.addObserver(eYo.observe.BEFORE, function (before, after) {
      flag.push(7, before + 7, after + 7)
    })
    o.willChange(1, 2)
    flag.expect(78912)
    let o_C9r = C9r.prototype.addObserver(eYo.observe.BEFORE, function (before, after) {
      flag.push(4, before + 4, after + 4)
    })
    o.willChange(1, 2)
    flag.expect(45678912)
    let o_SuperC9r = SuperC9r.prototype.addObserver(eYo.observe.BEFORE, function (before, after) {
      flag.push(1, before+1, after+1)
    })
    o.willChange(1, 2)
    flag.expect(12345678912)
    o.removeObserver(o_o)
    o.willChange(1, 2)
    flag.expect(123456789)
    ChildC9r.prototype.removeObserver(o_ChildC9r)
    o.willChange(1, 2)
    flag.expect(123456)
    C9r.prototype.removeObserver(o_C9r)
    o.willChange(1, 2)
    flag.expect(123)
    SuperC9r.prototype.removeObserver(o_SuperC9r)
    o.willChange(1, 2)
    flag.expect()
  })
  it (`Shared and inherited`, function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    ns.BaseC9r.eyo.observeEnhanced()
    ns.new().willChange(1, 2)
    flag.expect()
    ns.BaseC9r_p.addObserver(eYo.observe.BEFORE, function (before, after) {
      flag.push(1, before+1, after+1)
    })
    ns.new().willChange(1, 2)
    flag.expect(123)
    ns.new().willChange(1, 2)
    flag.expect(123)
  })
})

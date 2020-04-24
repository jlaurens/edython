describe ('Tests: Observe', function () {
  this.timeout(10000)
  let flag = new eYo.test.Flag()
  it ('Observe: Basics', function () {
    chai.assert(eYo.observe.enhance)
  })
  it ('eYo.observe.enhance', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    eYo.observe.enhance(ns.BaseC9r.eyo)
    let o = ns.new()
    chai.assert(o.willChange)
    chai.assert(o.atChange)
    chai.assert(o.didChange)
    chai.assert(o.addObserver)
    chai.assert(o.removeObserver)
    chai.assert(o.removeObservers)
    chai.assert(o.fireObservers)
  })
  it ('eYo.observe.BaseC9r', function () {
    let when = eYo.observe.BEFORE
    let $this = {}
    let callback = function() {}
    let test = (args, expected) => {
      if (expected === false) {
        chai.expect(() => {
          eYo.observe.new(...args)
        }).throw()
        return
      }
      let o = eYo.observe.new(...args)
      chai.expect(o.when).equal(expected[0])
      chai.expect(o.$this).equal(expected[1])
      chai.expect(o.callback_).equal(expected[2])
    }
    test([callback], [eYo.observe.AFTER, eYo.NA, callback])
    test([$this, callback], [eYo.observe.AFTER, $this, callback])
    test([$this], false)
    test([callback, 'Too many parameters'], false)
    test([when, callback], [when, eYo.NA, callback])
    test([when], false)
    test([when, $this, callback], [when, $this, callback])
    test([when, $this], false)
    let o = eYo.observe.new(when, $this, callback)
    var oo = eYo.observe.new(o)
    chai.expect(oo).equal(o)
    var oo = eYo.observe.new(o.when, o)
    chai.expect(oo).equal(o)

  })
  it ('(will|at|did)Change', function () {
    flag.reset()
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    eYo.observe.enhance(ns.BaseC9r.eyo)
    for (let [k, v] of Object.entries({
      [eYo.observe.BEFORE]: [12, 0, 0],
      [eYo.observe.DURING]: [0, 12, 0],
      [eYo.observe.AFTER] : [0, 0, 12,],
    })) {
      let o = ns.new()
      o.addObserver(k, function (before, after) {
        flag.push(before)
        flag.push(after)
      })
      o.willChange(1, 2)
      flag.expect(v[0])
      o.atChange(1, 2)
      flag.expect(v[1])
      o.didChange(1, 2)
      flag.expect(v[2])
    }
    for (let [k, v] of Object.entries({
      [eYo.observe.BEFORE]: [1234, 12, 12],
      [eYo.observe.DURING]: [12, 1234, 12],
      [eYo.observe.AFTER] : [12, 12, 1234,],
    })) {
      let o = ns.new()
      o.addObserver(eYo.observe.ANY, function (before, after) {
        flag.push(before)
        flag.push(after)
      })
      o.addObserver(k, function (before, after) {
        flag.push(2+before)
        flag.push(2+after)
      })
      o.willChange(1, 2)
      flag.expect(v[0])
      o.atChange(1, 2)
      flag.expect(v[1])
      o.didChange(1, 2)
      flag.expect(v[2])
    }
  })
  it (`removeObserver`, function () {
    flag.reset()
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    eYo.observe.enhance(ns.BaseC9r.eyo)
    let o = ns.new()
    let observer = o.addObserver(eYo.observe.BEFORE, function (before, after) {
      flag.push(before)
      flag.push(after)
    })
    o.willChange(1, 2)
    flag.expect(12)
    o.removeObserver(observer)
    o.willChange(1, 2)
    flag.expect(0)
    o.addObserver(observer)
    o.willChange(1, 2)
    flag.expect(12)
    let after = o.addObserver(eYo.observe.AFTER, observer)
    o.willChange(1, 2)
    flag.expect(12)
    o.didChange(3, 4)
    flag.expect(34)
    o.removeObserver(observer)
    o.willChange(1, 2)
    flag.expect(0)
    o.didChange(3, 4)
    flag.expect(34)
  })
  it (`addObserver*`, function () {
    flag.reset()
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    eYo.observe.enhance(ns.BaseC9r.eyo)
    let o = ns.new()
    let observer1 = o.addObserver(eYo.observe.BEFORE, function (before, after) {
      flag.push(before)
      flag.push(after)
    })
    let observer2 = o.addObserver(eYo.observe.BEFORE, function (before, after) {
      flag.push(before+2)
      flag.push(after+2)
    })
    o.willChange(1, 2)
    flag.expect(1234)
    o.removeObserver(observer1)
    o.willChange(1, 2)
    flag.expect(34)
    o.addObserver(observer1)
    o.willChange(1, 2)
    flag.expect(3412)
    o.removeObservers()
    o.willChange(1, 2)
    flag.expect(0)
  })
  it (`$this`, function () {
    flag.reset()
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    eYo.observe.enhance(ns.BaseC9r.eyo)
    let o = ns.new()
    let oo = {
      push(what) {
        flag.push(what)
      }
    }
    o.addObserver(eYo.observe.BEFORE, oo, function (before, after) {
      this.push(before)
      this.push(after)
    })
    o.willChange(1, 2)
    flag.expect(12)
  })
  it (`Inherited`, function () {
    let ns = eYo.c9r.makeNS()
    let SuperC9r = ns.makeBaseC9r()
    let C9r = SuperC9r.makeSubC9r('Foo')
    let ChildC9r = C9r.makeSubC9r('Bar')
    eYo.observe.enhance(SuperC9r.eyo)
    let o = new ChildC9r()
    let o_o = o.addObserver(eYo.observe.BEFORE, function (before, after) {
      flag.push(before + 6)
      flag.push(after + 6)
    })
    o.willChange(1, 2)
    flag.expect(78)
    let o_ChildC9r = ChildC9r.prototype.addObserver(eYo.observe.BEFORE, function (before, after) {
      flag.push(before + 4)
      flag.push(after + 4)
    })
    o.willChange(1, 2)
    flag.expect(5678)
    let o_C9r = C9r.prototype.addObserver(eYo.observe.BEFORE, function (before, after) {
      flag.push(before + 2)
      flag.push(after + 2)
    })
    o.willChange(1, 2)
    flag.expect(345678)
    let o_SuperC9r = SuperC9r.prototype.addObserver(eYo.observe.BEFORE, function (before, after) {
      flag.push(before)
      flag.push(after)
    })
    o.willChange(1, 2)
    flag.expect(12345678)
    o.removeObserver(o_o)
    o.willChange(1, 2)
    flag.expect(123456)
    ChildC9r.prototype.removeObserver(o_ChildC9r)
    o.willChange(1, 2)
    flag.expect(1234)
    C9r.prototype.removeObserver(o_C9r)
    o.willChange(1, 2)
    flag.expect(12)
    SuperC9r.prototype.removeObserver(o_SuperC9r)
    o.willChange(1, 2)
    flag.expect(0)
  })
  it (`Shared and inherited`, function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    eYo.observe.enhance(ns.BaseC9r.eyo)
    ns.new().willChange(1, 2)
    flag.expect(0)
    ns.BaseC9r_p.addObserver(eYo.observe.BEFORE, function (before, after) {
      flag.push(before)
      flag.push(after)
    })
    ns.new().willChange(1, 2)
    flag.expect(12)
    ns.new().willChange(1, 2)
    flag.expect(12)
  })
})

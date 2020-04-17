describe ('Tests: changer', function () {
  this.timeout(10000)
  flag = {
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
      let ans = chai.expect(this.v).equal(what)
      this.reset()
      return ans
    },
  }
  it ('Changer: basic', function () {
    chai.assert(eYo.changer)
    chai.assert(eYo.changer.BaseC9r)
  })
  it ('Changer: begin', function () {
    let onr = eYo.c9r.new({
      methods: {
        onChangeBegin () {
          flag.push(1)
        },
        onChangeEnd () {
          flag.push(2)
        },
        onChangeDone () {
          flag.push(3)
        },
      },
    })
    let changer = eYo.changer.new(onr, 'foo')
    changer.begin()
    flag.expect(1)
    changer.end()
    flag.expect(23)
    changer.begin()
    changer.begin()
    flag.expect(11)
    changer.end()
    flag.expect(2)
    changer.end()
    flag.expect(23)
    changer.wrap(() => {
      flag.push(9)
    })
    flag.expect(1923)
    changer.wrap(() => {
      changer.wrap(() => {
        flag.push(9)
      })
    })
    flag.expect(119223)
  })
  it ('Changer: listener', function () {
    let onr = eYo.c9r.new()
    let changer = eYo.changer.new(onr, 'foo')
    let listener = changer.addChangeDoneListener(() => {
      flag.push(1)
    })
    changer.wrap(() => {
      flag.push(2)
    })
    flag.expect(21)
    changer.removeChangeDoneListener(listener)
    changer.wrap(() => {
      flag.push(3)
    })
    flag.expect(3)
  })
  it ('Changer: memoize', function () {
    flag.reset()
    let onr = eYo.c9r.new()
    onr.changer = eYo.changer.new(onr, 'c')
    onr.foo = eYo.changer.memoize('foo', (what) => {
      flag.push(what)
      return what
    })
    onr.bar = eYo.changer.memoize('bar', (what) => {
      flag.push(what)
      return 2 * what
    })
    chai.expect(onr.foo(421)).equal(421)
    flag.expect(421)
    chai.expect(onr.foo(421)).equal(421)
    flag.expect(0)
    chai.expect(onr.bar(421)).equal(842)
    flag.expect(421)
    chai.expect(onr.bar(421)).equal(842)
    flag.expect(0)
    onr.changer.wrap(() => {
      flag.push(123)
    })
    flag.expect(123)
    chai.expect(onr.foo(421)).equal(421)
    flag.expect(421)
    chai.expect(onr.foo(421)).equal(421)
    flag.expect(0)
    chai.expect(onr.bar(421)).equal(842)
    flag.expect(421)
    chai.expect(onr.bar(421)).equal(842)
    flag.expect(0)
  })
})

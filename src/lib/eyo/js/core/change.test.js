describe ('Tests: change', function () {
  it ('Change: basic', function () {
    chai.assert(eYo.change.Base)
  })
  it ('Change: begin', function () {
    var flag = 0
    let onr = {
      onChangeBegin () {
        flag += 1
      },
      onChangeEnd () {
        flag += 100
      },
      onChangeDone () {
        flag += 10000
      },
    }
    let change = new eYo.change.Base(onr)
    change.begin()
    chai.expect(flag).equal(1)
    change.end()
    chai.expect(flag).equal(10101)
    flag = 0
    change.begin()
    change.begin()
    chai.expect(flag).equal(2)
    change.end()
    chai.assert(flag === 102, `Got ${flag}`)
    change.end()
    chai.assert(flag === 10202, `Got ${flag}`)
    flag = 0
    change.wrap(() => {
      flag += 1000000
    })
    chai.expect(flag).equal(1010101)
    flag = 0
    change.wrap(() => {
      change.wrap(() => {
        flag += 1000000
      })
    })
    chai.expect(flag).equal(1010202)
  })
  it ('Change: listener', function () {
    var flag = 0
    let onr = {}
    let change = new eYo.change.Base(onr)
    let listener = change.addChangeDoneListener(() => {
      flag += 1
    })
    change.wrap(() => {
      flag += 100
    })
    chai.expect(flag).equal(101)
    flag = 0
    change.removeChangeDoneListener(listener)
    change.wrap(() => {
      flag += 100
    })
    chai.expect(flag).equal(100)
  })
  it ('Change: memoize', function () {
    var flag = 0
    let onr = {}
    onr.change = new eYo.change.Base(onr)
    onr.foo = eYo.change.memoize('foo', (what) => {
      return (flag += what)
    })
    onr.bar = eYo.change.memoize('bar', (what) => {
      return (flag += what)
    })
    chai.expect(onr.foo(421)).equal(421)
    chai.expect(onr.foo(421)).equal(421)
    chai.expect(onr.bar(421)).equal(842)
    chai.expect(onr.bar(421)).equal(842)
    onr.change.wrap(() => {
      flag = 1000
    })
    chai.expect(onr.foo(421)).equal(1421)
    chai.expect(onr.foo(421)).equal(1421)
    chai.expect(onr.bar(421)).equal(1842)
    chai.expect(onr.bar(421)).equal(1842)
  })
})

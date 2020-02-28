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
})

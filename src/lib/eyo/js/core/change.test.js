NS = Object.create(null)
describe ('Tests: change', function () {
  it ('Change: basic', function () {
    chai.assert(eYo.c9r.Change)
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
    let change = new eYo.c9r.Change(onr)
    change.begin()
    chai.assert(flag === 1)
    change.end()
    chai.assert(flag === 10101)
    flag = 0
    change.begin()
    change.begin()
    chai.assert(flag === 2)
    change.end()
    chai.assert(flag === 102, `Got ${flag}`)
    change.end()
    chai.assert(flag === 10202, `Got ${flag}`)
    flag = 0
    change.wrap(() => {
      flag += 1000000
    })
    chai.assert(flag === 1010101)
    flag = 0
    change.wrap(() => {
      change.wrap(() => {
        flag += 1000000
      })
    })
    chai.assert(flag === 1010202)
  })
})

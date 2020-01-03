NS = Object.create(null)
describe ('Tests: audio', function () {
  this.timeout(10000)
  it ('Audio: basic', function () {
    chai.assert(eYo.Audio)
  })
})

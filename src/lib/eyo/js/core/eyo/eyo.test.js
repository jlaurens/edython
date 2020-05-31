describe('eYo Tests', function () {
  this.timeout(20000)
  let flag = new eYo.test.Flag()
  before (function() {
    flag.reset()
  })
  describe('eYo: POC', function () {
    it(`Catch the key? No need to...`, function () {
      var f = (object, k) => {
        var k_ = k + '_'
        Object.defineProperty(object, k_, {
          get () {
            return object[k]
          }
        })
      }
      var a = {
        a: 421,
        b: 123,
      }
      f(a, 'a')
      chai.assert(a.a_ = 421)
      f(a, 'b')
      chai.assert(a.a_ = 421)
      chai.assert(a.b_ = 123)
    })
  })
})
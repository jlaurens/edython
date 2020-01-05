describe('eYo Tests', function () {
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
  it('eYo: Basics', function () {
    chai.assert(eYo.makeNS)
    var x
    chai.assert(eYo.NA === undefined)
    chai.assert(eYo.NA === x)
  })
  it ('eYo.MYSTIQUE', function () {
    let M = eYo.MYSTIQUE
    chai.assert(M)
    chai.expect(() => {
      M()
    }).not.to.throw()
    chai.assert(M.foo === M)
    M.bar = 421
    chai.expect(M === M.bar)
  })
})
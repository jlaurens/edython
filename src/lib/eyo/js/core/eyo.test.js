describe('eYo Tests', function () {
  describe('Gobals', function () {
    it(`Strong undefined`, function () {
      var x
      chai.assert(eYo.NA === undefined)
      chai.assert(eYo.NA === x)
    })
  })
})
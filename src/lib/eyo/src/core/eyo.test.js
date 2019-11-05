describe('eYo Tests', function () {
  describe('Gobals', function () {
    it(`Strong undefined`, function () {
      var x
      chai.assert(eYo.VOID === undefined)
      chai.assert(eYo.VOID === x)
    })
  })
})
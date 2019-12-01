describe('Grammar', function() {
  var assert = chai.assert;

  describe('Creation', function() {
    it('test', function() {
      assert(eYo.GMR)
      var g = eYo.GMR.newgrammar()
      assert(g)
    })
  })
  
})
eYo.Debug.test() // remove this line when finished

describe('BitSet(Create)', function() {
  var assert = chai.assert;

  console.log('RUNNING BITSET TESTS')

  describe('BitSet(Create)', function() {
    it('Size', function() {
      var ss
      ss = new eYo.BitSet(0)
      assert(ss.ra.length === 0)
      ss = new eYo.BitSet(4)
      assert(ss.ra.length === 1)
      ss = new eYo.BitSet(8)
      assert(ss.ra.length === 1)
      ss = new eYo.BitSet(12)
      assert(ss.ra.length === 2)
      ss = new eYo.BitSet(16)
      assert(ss.ra.length === 2)
    });
  });

  describe('BitSet(Test)', function() {
    it('testbit', function() {
      var ss
      ss = new eYo.BitSet(8)
      for (var i = 0 ; i < 8 ; i++) {
        assert(!eYo.BitSet.testbit(ss, i), 'ERROR')
      }
      ss.ra[0] = 0xFF
      for (i = 0 ; i < 8 ; i++) {
        assert(eYo.BitSet.testbit(ss, i), 'ERROR')
      }
      ss.ra[0] = 0x0F
      for (i = 0 ; i < 4 ; i++) {
        assert(eYo.BitSet.testbit(ss, i), 'ERROR')
      }
      for (var i = 4 ; i < 8 ; i++) {
        assert(!eYo.BitSet.testbit(ss, i), 'ERROR')
      }
      ss = new eYo.BitSet(16)
      for (var i = 0 ; i < 8 ; i++) {
        assert(!eYo.BitSet.testbit(ss, 8 + i), 'ERROR')
      }
      ss.ra[1] = 0xFF
      for (i = 0 ; i < 8 ; i++) {
        assert(eYo.BitSet.testbit(ss, 8 + i), 'ERROR')
      }
      ss.ra[1] = 0x0F
      for (i = 0 ; i < 4 ; i++) {
        assert(eYo.BitSet.testbit(ss, 8 + i), 'ERROR')
      }
      for (var i = 4 ; i < 8 ; i++) {
        assert(!eYo.BitSet.testbit(ss, 8 + i), 'ERROR')
      }
    });
  });

  console.log('DONE')
})
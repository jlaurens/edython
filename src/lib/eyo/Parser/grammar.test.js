var assert = chai.assert;

console.log('RUNNING GRAMMAR TESTS')

describe('Grammar(creation)', function() {
  it('test', function() {
    assert(eYo.GMR)
    var g = eYo.GMR.newgrammar()
    assert(g)
  });
});

console.log('DONE')

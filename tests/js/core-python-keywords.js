QUnit.test( "Python keyword test", function( assert ) {
  assert.ok( EZP.Python.isKeyword("in"), "Passed!" );
});
QUnit.test( "Python keyword test", function( assert ) {
  assert.ok( !EZP.Python.isKeyword("ni"), "Passed!" );
});
QUnit.test( "Python keyword test", function( assert ) {
  assert.ok( EZP.Python.isKeyword("elif"), "Passed!" );
});
QUnit.test( "Python keyword test", function( assert ) {
  assert.ok( !EZP.Python.isKeyword("elfi"), "Passed!" );
});

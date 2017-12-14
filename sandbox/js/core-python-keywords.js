QUnit.test( "Python keyword test", function( assert ) {
  assert.ok( ezP.Python.isKeyword("in"), "Passed!" );
});
QUnit.test( "Python keyword test", function( assert ) {
  assert.ok( !ezP.Python.isKeyword("ni"), "Passed!" );
});
QUnit.test( "Python keyword test", function( assert ) {
  assert.ok( ezP.Python.isKeyword("elif"), "Passed!" );
});
QUnit.test( "Python keyword test", function( assert ) {
  assert.ok( !ezP.Python.isKeyword("elfi"), "Passed!" );
});

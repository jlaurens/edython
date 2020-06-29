describe ('geometry', function () {
  this.timeout(20000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c9r && eYo.c9r.new({
      methods: {
        flag (what, ...$) {
          flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  })
  describe ('POC', function () {
    it (`chai.expect(...).almost.equal(...)`, function () {
      chai.expect(473.85937500000006).almost.equal(473.859375)
    })
  })
  it ('Geometry: Basic', function () {
    chai.expect(eYo.geom.X > 0).true
    chai.expect(eYo.geom.Y > 0).true
    chai.expect(eYo.geom.C > 0).true
    chai.expect(eYo.geom.L > 0).true
    chai.expect(eYo.geom.REM > 0).true
  })
  it ('Geometry: units', function () {
    chai.expect(eYo.isDef(eYo.geom.X)).true
    chai.expect(eYo.isDef(eYo.geom.Y)).true
    chai.expect(eYo.isDef(eYo.geom.REM)).true
    chai.expect(eYo.geom.C>0).true
    chai.expect(eYo.geom.L>0).true
    chai.expect(eYo.geom.C === Math.round(eYo.geom.C)).true
    chai.expect(eYo.geom.L === Math.round(eYo.geom.L)).true
  })
})

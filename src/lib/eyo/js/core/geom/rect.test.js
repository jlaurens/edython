describe ('geometry', function () {
  this.timeout(10000)
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
    it (`Shared properties`, function () {
      chai.expect(() => {
        new eYo.geom.Point()
      }).not.throw()
      let P = new eYo.geom.Point()
      let ns = eYo.geom.makeNS()
      ns.makeBaseC9r(eYo.geom.Point, {
        init (c_p, l_p) {
          chai.expect(this.hasOwnProperty('c_p')).false
          chai.expect(this.hasOwnProperty('l_p')).false
          if (!eYo.isDef(l_p)) {
            l_p = c_p.l_p
            c_p = c_p.c_p
          }
          this.c_t = c_p
          this.l_t = l_p
        }
      })
      let Q = ns.new(P)
      P.c_ = 1
      chai.expect(Q.c).equal(1)
      Q.c_ = 2
      chai.expect(P.c).equal(2)
      let o = Q.c_p.addObserver(eYo.observe.ANY, function (before, after) {
        flag.push(before, after)
      })
      P.c_ = 1
      flag.expect(212121)
      Q.c_ = 2
      flag.expect(121212)
      Q.c_p.removeObserver(o)
      P.c_ = 1
      flag.expect()
    })
  })
  describe('Rect', function () {
    let test = (r, c, l, w, h) => {
      chai.expect(r.c).almost.equal(c)
      chai.expect(r.l).almost.equal(l)
      chai.expect(r.w).almost.equal(w)
      chai.expect(r.h).almost.equal(h)
    }
    it ('Rect: new eYo.geom.Rect(...)', function () {
      var r = new eYo.geom.Rect(1, 2, 3, 4)
      test(r, 1, 2, 3, 4)
      let origin = eYo.geom.randPoint()
      let size = eYo.geom.randSize()
      r = new eYo.geom.Rect(1, 2, size)
      test(r, 1, 2, size.w, size.h)
      r = new eYo.geom.Rect(origin, 3, 4)
      test(r, origin.c, origin.l, 3, 4)
      r = new eYo.geom.Rect(origin, size)
      test(r, origin.c, origin.l, size.w, size.h)
      let rr = new eYo.geom.Rect(r)
      chai.expect(rr).not.equal(r)
      chai.expect(rr).almost.eql(r)
    })
    it ('...center_ = ...', function () {
      let R = eYo.geom.randRect()
      R.backward(R.origin.asSize)
      chai.expect(R.origin).almost.eql({c: 0, l: 0})
      chai.expect(R.center).almost.eql(R.size.unscale(2).asPoint)
      var P = eYo.geom.randPoint()
      R.c_mid_ = P.c
      chai.expect(R.c_mid).almost.equal(P.c)
      R.l_mid_ = P.l
      chai.expect(R.l_mid).almost.equal(P.l)
      chai.expect(R.center).almost.eql(P)
      let RR = R.copy
      chai.expect(R).almost.eql(RR)
      var P = eYo.geom.randPoint()
      RR.center_ = P
      chai.expect(RR.center).almost.eql(P)
      chai.expect(RR.center).not.almost.eql(R.center)
      RR.backward(P.asSize)
      chai.expect(RR.center).almost.eql({c: 0, l: 0})
      chai.expect(R).not.almost.eql(RR)
      RR.center_ = R.center
      chai.expect(R).almost.eql(RR)
    })
    it ('Attributes', function () {
      let r = eYo.geom.randRect()
      chai.expect(r.bottomRight.c).almost.equal(r.c_max)
      chai.expect(r.bottomRight.l).almost.equal(r.l_max)
      chai.expect(r.bottomRight.x).almost.equal(r.x_max)
      chai.expect(r.bottomRight.y).almost.equal(r.y_max)
      chai.expect(r.center.c).almost.equal(r.c_mid)
      chai.expect(r.center.l).almost.equal(r.l_mid)
      chai.expect(r.center.x).almost.equal(r.x_mid)
      chai.expect(r.center.y).almost.equal(r.y_mid)
      chai.expect(r.c_mid*2).almost.equal(r.c_min+r.c_max)
      chai.expect(r.l_mid*2).almost.equal(r.l_min+r.l_max)
      chai.expect(r.x_mid*2).almost.equal(r.x_min+r.x_max)
      chai.expect(r.y_mid*2).almost.equal(r.y_min+r.y_max)
      chai.expect(r.left).almost.equal(r.x).almost.equal(r.x_min)
      chai.expect(r.right).almost.equal(r.x+r.width).almost.equal(r.x_max)
      chai.expect(r.top).almost.equal(r.y).almost.equal(r.y_min)
      chai.expect(r.bottom).almost.equal(r.y+r.height).almost.equal(r.y_max)
    })
  })
})

describe ('geometry/Point', function () {
  this.timeout(20000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c3s && eYo.c3s.new({
      methods: {
        flag (what, ...$) {
          eYo.flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  })
  describe('Point', function () {
    it ('new eYo.geom.Point()', function () {
      var p = new eYo.geom.Point()
      chai.expect(p).eyo_point
      chai.expect(eYo.isDef(p.snap_p)).true
      chai.expect(!['c', 'l', 'x', 'y'].some(k => p[k] !== 0)).true
      p.c_ = 1.23
      chai.expect(p.c).almost.equal(1.23)
      chai.expect(p.x).almost.equal(1.23 * eYo.geom.X)
      p.x_ = 4.21 * eYo.geom.X
      chai.expect(p.c).almost.equal(4.21)
      chai.expect(p.x).almost.equal(4.21 * eYo.geom.X)
      p.l_ = 3.21
      chai.expect(p.l).almost.equal(3.21)
      chai.expect(p.y).almost.equal(3.21 * eYo.geom.Y)
      p.y_ = 1.24 * eYo.geom.Y
      chai.expect(p.l).almost.equal(1.24)
      chai.expect(p.y).almost.equal(1.24 * eYo.geom.Y)
    })
    it ('new eYo.geom.Point(true)', function () {
      var whr = new eYo.geom.Point(true)
      chai.expect(eYo.isDef(whr.snap_p)).true
      chai.expect(whr.snap_).true
      chai.expect(!['c', 'l', 'x', 'y'].some(k => whr[k] != 0)).true
      if (eYo.geom.C === 2) {
        whr.c_ = 1.23
        chai.expect(whr.c).almost.equal(1)
        chai.expect(whr.x).almost.equal(1 * eYo.geom.X)
        whr.c_ = 1.33
        chai.expect(whr.c).almost.equal(1.5)
        chai.expect(whr.x).almost.equal(1.5 * eYo.geom.X)
        whr.x_ = 4.21 * eYo.geom.X
        chai.expect(whr.c).almost.equal(4)
        chai.expect(whr.x).almost.equal(4 * eYo.geom.X)
        whr.x_ = 4.31 * eYo.geom.X
        chai.expect(whr.c).almost.equal(4.5)
        chai.expect(whr.x).almost.equal(4.5 * eYo.geom.X)
      }
      if (eYo.geom.C === 4) {
        whr.l_ = 3.11
        chai.expect(whr.l).almost.equal(3)
        chai.expect(whr.y).almost.equal(3 * eYo.geom.Y)
        whr.l_ = 3.31
        chai.expect(whr.l).almost.equal(3.25)
        chai.expect(whr.y).almost.equal(3.25 * eYo.geom.Y)
        whr.l_ = 3.41
        chai.expect(whr.l).almost.equal(3.5)
        chai.expect(whr.y).almost.equal(3.5 * eYo.geom.Y)
        whr.y_ = 1.124 * eYo.geom.Y
        chai.expect(whr.l).almost.equal(1)
        chai.expect(whr.y).almost.equal(1 * eYo.geom.Y)
        whr.y_ = 1.125001 * eYo.geom.Y
        chai.expect(whr.l).almost.equal(1.25)
        chai.expect(whr.y).almost.equal(1.25 * eYo.geom.Y)
        whr.y_ = 1.44 * eYo.geom.Y
        chai.expect(whr.l).almost.equal(1.5)
        chai.expect(whr.y).almost.equal(1.5 * eYo.geom.Y)
        whr.y_ = 1.75 * eYo.geom.Y
        chai.expect(whr.l).almost.equal(1.75)
        chai.expect(whr.y).almost.equal(1.75 * eYo.geom.Y)
        whr.y_ = 1.874999 * eYo.geom.Y
        chai.expect(whr.l).almost.equal(1.75)
        chai.expect(whr.y).almost.equal(1.75 * eYo.geom.Y)
        whr.y_ = 1.875001 * eYo.geom.Y
        chai.expect(whr.l).almost.equal(2)
        chai.expect(whr.y).almost.equal(2 * eYo.geom.Y)
      }
    })
    it ('new eYo.geom.Point(...)', function () {
      let p = new eYo.geom.Point(1, 2)
      chai.expect(p).eql({c: 1, l: 2})
      /*
      if (eYo.isDef(c.c) && eYo.isDef(c.l)) {
        this.c_ = c.c
        this.l_ = c.l
      } else if (eYo.isDef(c.x) && eYo.isDef(c.y)) {
        this.x_ = c.x
        this.y_ = c.y
      } else if (eYo.isDef(c.clientX) && eYo.isDef(c.clientY)) {
        this.x_ = c.clientX
        this.y_ = c.clientY
      } else if (eYo.isDef(c.width) && eYo.isDef(c.height)) {
        this.x_ = c.width
        this.y_ = c.height
      } else {
        eYo.isaP6y(c)
        ? this.origin_.eyo$.p6yMakeShortcuts(this, 'c', c, true)
        : (this.c_ = c || 0)
        eYo.isaP6y(l)
        ? this.origin_.eyo$.p6yMakeShortcuts(this, 'l', l, true)
        : (this.l_ = l || 0)
        return this
      }
*/
      
    })
    it('Point: Mutation', function () {
      var w1 = new eYo.geom.Point()
      var w2 = new eYo.geom.Point(w1)
      chai.expect(w1).eql(w2)
      w1.forward(1)
      chai.expect(w1).not.eql(w2)
      chai.expect(w1).not.almost.eql(w2)
      w1.forward(-1)
      chai.expect(w1).almost.eql(w2)
      var dP = new eYo.geom.Size(12.34, 56.78)
      w1.forward(dP)
      chai.expect(w1).not.almost.eql(w2)
      w2.forward(dP)
      chai.expect(w1).almost.eql(w2)
      w1.backward(dP)
      chai.expect(w1).not.almost.eql(w2)
      w2.backward(dP)
      chai.expect(w1).almost.eql(w2)
    })
    it (`Shared text coordinates properties`, function () {
      let P = new eYo.geom.Point()
      let Q = new eYo.geom.Point()
      P.c_t = Q.c_p
      P.c_ = 1
      chai.expect(Q.c).equal(1)
      Q.c_ = 2
      chai.expect(P.c).equal(2)
      let o = Q.c_p.addObserver(eYo.observe.ANY, function (before, after) {
        eYo.flag.push(before, after)
      })
      P.c_ = 1
      eYo.flag.expect(212121)
      Q.c_p.value_ = 2
      eYo.flag.expect(121212)
      Q.c_p.removeObserver(o)
      P.c_ = 1
      eYo.flag.expect()      
    })
    it (`Shared properties(2)`, function () {
      let c_p = eYo.p6y.new('c', onr)
      let l_p = eYo.p6y.new('l', onr)
      let ns = eYo.geom.newNS()
      ns.makeC3sBase(eYo.geom.Point, {
        init (c_p, l_p) {
          eYo.objectHasOwnProperty(chai.expect(this, 'c_p')).false
          eYo.objectHasOwnProperty(chai.expect(this, 'l_p')).false
          if (!eYo.isDef(l_p)) {
            l_p = c_p.l_p
            c_p = c_p.c_p
          }
          c_p = eYo.p6y.aliasNew('c', this, c_p)
          l_p = eYo.p6y.aliasNew('l', this, l_p)
        }
      })
      let P = ns.new(c_p, l_p)
      let Q = ns.new(c_p, l_p)
      P.c_ = 1
      chai.expect(Q.c_p.value).equal(1)
      Q.c_p.value_ = 2
      chai.expect(P.c).equal(2)
      let o = Q.c_p.addObserver(eYo.observe.ANY, function (before, after) {
        eYo.flag.push(before, after)
      })
      P.c_ = 1
      eYo.flag.expect(212121)
      Q.c_p.value_ = 2
      eYo.flag.expect(121212)
      Q.c_p.removeObserver(o)
      P.c_ = 1
      eYo.flag.expect()
    })
  })
})

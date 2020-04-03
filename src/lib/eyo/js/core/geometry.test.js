eYo.test.almost = (a, b) => 10000 * Math.abs(a-b) <= (Math.abs(a) + Math.abs(b))

eYo.test.rand100 = () => Math.round(Math.random()*10000)/100

eYo.geom.randRect = () => new eYo.geom.Rect(eYo.test.rand100(), eYo.test.rand100(), eYo.test.rand100(), eYo.test.rand100())

describe ('geometry', function () {
  this.timeout(10000)
  it ('POC', function () {
    chai.expect(473.85937500000006).almost.equal(473.859375)
  })
  it ('Geometry: Basic', function () {
    chai.expect(eYo.isDef(eYo.geom.Point)).true
    chai.expect(eYo.isDef(eYo.geom.Size)).true
    chai.expect(eYo.isDef(eYo.geom.Rect)).true
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
  describe('Point', function () {
    it ('new eYo.geom.Point()', function () {
      var whr = new eYo.geom.Point()
      chai.expect(whr).eyo_point
      chai.expect(!['c', 'l', 'x', 'y'].some(k => whr[k] != 0)).true
      whr.c_ = 1.23
      chai.expect(whr.c).almost.equal(1.23)
      chai.expect(whr.x).almost.equal(1.23 * eYo.geom.X)
      whr.x_ = 4.21 * eYo.geom.X
      chai.expect(whr.c).almost.equal(4.21)
      chai.expect(whr.x).almost.equal(4.21 * eYo.geom.X)
      whr.l_ = 3.21
      chai.expect(whr.l).almost.equal(3.21)
      chai.expect(whr.y).almost.equal(3.21 * eYo.geom.Y)
      whr.y_ = 1.24 * eYo.geom.Y
      chai.expect(whr.l).almost.equal(1.24)
      chai.expect(whr.y).almost.equal(1.24 * eYo.geom.Y)
    })
    it ('new eYo.geom.Point(true)', function () {
      var whr = new eYo.geom.Point(true)
      chai.expect(eYo.isDef(whr.snap_)).true
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
    it('Aliases', function () {
      let p = new eYo.geom.Point().xySet(Math.random(), Math.random())
      chai.expect(p.c).equal(p.dc).equal(p.w)
      chai.expect(p.l).equal(p.dl).equal(p.h)
      chai.expect(p.x).equal(p.dx).equal(p.width)
      chai.expect(p.y).equal(p.dy).equal(p.height)  
    })
    it('Mutation', function () {
      var w1 = new eYo.geom.Point()
      var w2 = new eYo.geom.Point(w1)
      chai.expect(w1).deep.equal(w2)
      w1.forward(1)
      chai.expect(w1).not.almost.deep.equal(w2)
      w1.forward(-1)
      chai.expect(w1).almost.deep.equal(w2)
      var w3 = eYo.geom.xyPoint(12.34, 56.78)
      w1.forward(w3)
      chai.expect(w1).not.almost.deep.equal(w2)
      w2.forward(w3)
      chai.expect(w1).almost.deep.equal(w2)
      w1.backward(w3)
      chai.expect(w1).not.almost.deep.equal(w2)
      w2.backward(w3)
      chai.expect(w1).almost.deep.equal(w2)
      w1.forward(w3)
      w2.forward(w3)
      w1.scale(1.23)
      chai.expect(w1).not.almost.deep.equal(w2)
      w2.scale(1.23)
      chai.expect(w1).almost.deep.equal(w2)
      w1.unscale(1.23)
      chai.expect(w1).not.almost.deep.equal(w2)
      w2.unscale(1.23)
      chai.expect(w1).almost.deep.equal(w2)
    })
  })
  describe('size', function () {
    it('setFromText', function() {
      var s = new eYo.geom.Size(0,0)
      chai.expect(s.c === 0 && s.l === 0, '0').true
      var f = (txt, c, l) => {
        s.setFromText(txt)
        chai.expect(s.c === c && s.l === l, `MISSED <${txt}>: ${s.c} === ${c} (c) && ${s.l} === ${l} (l)`).true
      }
      var A = ['', 'a', 'aa', 'aaa']
      var B = ['', 'b', 'bb', 'bbb']
      var C = ['', 'c', 'cc', 'ccc']
      var NL = ['\r', '\n', '\r\n', '\v', '\f', '\r', '\x85', '\u2028', '\u2029']
      A.forEach(a => {
        f(a, a.length, 1)
        NL.forEach(nl1 => {
          B.forEach(b => {
            f(a+nl1+b, Math.max(a.length, b.length), 2)
            NL.forEach(nl2 => {
              C.forEach(c => {
                f(a+nl1+b+nl2+c, Math.max(a.length, b.length, c.length), nl1+b+nl2 === '\r\n' ? 2 : 3)
              })
            })
          })
        })
      })
      s.dispose()
    })
  })
  describe('Rect', function () {
    let test = (r, c, l, w, h) => {
      chai.expect(r.c).almost.equal(c)
      chai.expect(r.l).almost.equal(l)
      chai.expect(r.w).almost.equal(w)
      chai.expect(r.h).almost.equal(h)
    }
    it ('Rect: aliases', function () {
    })
    it ('Rect: new eYo.geom.Rect()', function () {
      let r = new eYo.geom.Rect()
      chai.expect(r).eyo_rect
      // by copy or not
      chai.expect(r.origin).not.equal(r.origin_)
      chai.expect(r.origin).not.equal(r.origin)
      chai.expect(r.origin_).equal(r.origin_)
      chai.expect(r.size).not.equal(r.size_)
      chai.expect(r.size).not.equal(r.size)
      chai.expect(r.size_).equal(r.size_)
      r.c_ = 123
      test(r, 123, 0, 0, 0)
      r.l_ = 421
      test(r, 123, 421, 0, 0)
      r.w_ = 666
      test(r, 123, 421, 666, 0)
      r.h_ = 999
      test(r, 123, 421, 666, 999)
    })
    it ('Rect: new eYo.geom.Rect(...)', function () {
      let r = new eYo.geom.Rect(1, 2, 3, 4)
      test(r, 1, 2, 3, 4)
    })
    it ('Rect: alias', function () {
      let r = eYo.geom.randRect()
      chai.expect(r.topLeft.equals(r.origin)).true
      chai.expect(r.origin.c).almost.equal(r.c).almost.equal(r.c_min)
      chai.expect(r.origin.l).almost.equal(r.l).almost.equal(r.l_min)
      chai.expect(r.size.w).almost.equal(r.w)
      chai.expect(r.size.h).almost.equal(r.h)
      chai.expect(r.origin.x).almost.equal(r.x).almost.equal(r.x_min)
      chai.expect(r.origin.y).almost.equal(r.y).almost.equal(r.y_min)
      chai.expect(r.size.width).almost.equal(r.width)
      chai.expect(r.size.height).almost.equal(r.height)
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
    it ('Intersection: a⊂b', function () {
      let a = new eYo.geom.Rect(0,0,1,1)
      let b = new eYo.geom.Rect(-1,-1,3,3)
      chai.expect(eYo.geom.intersectionRect(a, b).equals(a)).true
      chai.expect(eYo.geom.intersectionRect(b, a).equals(a)).true
    })
    it ('Intersection: a∩b=∅', function () {
      let a = new eYo.geom.Rect(0,0,1,1)
      let b = new eYo.geom.Rect(-2,-2,1,1)
      chai.expect(eYo.geom.intersectionRect(a, b)).to.equal(eYo.NA)
    })
    it ('Intersection: a∩b≠∅', function () {
      let a = new eYo.geom.Rect(0,0,1,1)
      let b = new eYo.geom.Rect(1,1,1,1)
      let c = eYo.geom.intersectionRect(a, b)
      chai.expect(eYo.isDef(c)).true
      chai.expect(c.c_min).to.equal(1)
      chai.expect(c.l_min).to.equal(1)
      chai.expect(c.width).to.equal(0)
      chai.expect(c.height).to.equal(0)
    })
    it ('a∪=b', function () {
      var i = 20
      while (i--) {
        var r1 = eYo.geom.randRect()
        var r2 = eYo.geom.randRect()
        var u = new eYo.geom.Rect(r1).unionRect(r2)
        chai.expect(u.xyContains(r1.topLeft)).true
        chai.expect(u.xyContains(r1.bottomRight)).true
        chai.expect(u.xyContains(r2.topLeft)).true
        chai.expect(u.xyContains(r2.bottomRight)).true
      }
    })
    it ('xy(In|Out)set)', function () {
      let r1 = new eYo.geom.Rect(0,0,1,1)
      r1.xyInset(0.1 * eYo.geom.X,0,0,0)
      test(r1,0.1, 0, 0.9, 1)
      r1.xyInset(0,0.1 * eYo.geom.Y,0,0)
      test(r1,0.1, 0.1, 0.9, 0.9)
      r1.xyInset(0,0,0.1 * eYo.geom.X,0)
      test(r1,0.1, 0.1, 0.8, 0.9)
      r1.xyInset(0,0,0,0.1 * eYo.geom.Y)
      test(r1,0.1, 0.1, 0.8, 0.8)
      r1.xyOutset(0.1 * eYo.geom.X,0,0,0)
      test(r1,0,0.1,0.9,0.8)
      r1.xyOutset(0,0.1 * eYo.geom.Y,0,0)
      test(r1,0,0,0.9,0.9)
      r1.xyOutset(0,0,0.1 * eYo.geom.X,0)
      test(r1,0,0,1,0.9)
      r1.xyOutset(0,0,0,0.1 * eYo.geom.Y)
      test(r1,0,0,1,1)
      r1.xyInset(eYo.geom.X,0,eYo.geom.X,0)
      test(r1,0.5,0,0,1)
      r1.xyInset(0,eYo.geom.Y,0,eYo.geom.Y)
      test(r1,0.5,0.5,0,0)
      r1.xyOutset(0.5 * eYo.geom.X,0,0.5 * eYo.geom.X,0)
      test(r1,0,0.5,1,0)
      r1.xyOutset(0,0.5 * eYo.geom.Y,0,0.5 * eYo.geom.Y)
      test(r1,0,0,1,1)
      var i = 20
      var r2 = r1.copy
      while (i--) {
        var dx_min = Math.random()
        var dy_min = Math.random()
        var dx_max = Math.random()
        var dy_max = Math.random()
        r2.xyOutset(dx_min, dy_min, dx_max, dy_max)
        chai.expect(r2.left + dx_min).almost.equal(r1.left)
        chai.expect(r2.right - dx_max).almost.equal(r1.right)
        chai.expect(r2.top + dy_min).almost.equal(r1.top)
        chai.expect(r2.bottom - dy_max).almost.equal(r1.bottom)
        r2.xyInset(dx_min, dy_min, dx_max, dy_max)
        chai.expect(r1).almost.deep.equal(r2)
      }
    })
    it ('xyContains', function () {
      var i = 20
      while(i--) {
        var r = eYo.geom.randRect()
        var yes = (x, y) => {
          chai.expect(r.xyContains(x, y)).true
          let p = new eYo.geom.Point().xySet(x, y)
          chai.expect(r.xyContains(p)).true
          chai.expect(p.in(r)).true
        }
        var no = (x, y) => {
          chai.expect(!r.xyContains(x, y)).true
          let p = new eYo.geom.Point().xySet(x, y)
          chai.expect(!r.xyContains(p)).true
          chai.expect(p.out(r)).true
        }
        yes(r.x_min, r.y_min)
        yes(r.x_min, r.y_max)
        yes(r.x_max, r.y_min)
        yes(r.x_max, r.y_max)
        yes(r.x_mid, r.y_mid)
        no(r.x_min-0.1, r.y_mid)
        no(r.x_max+0.1, r.y_mid)
        no(r.x_mid, r.y_min-0.1)
        no(r.x_mid, r.y_max+0.1)
      }
    })
    it ('mirror', function () {
      let r1 = eYo.geom.randRect()
      let r2 = new eYo.geom.Rect(r1).mirror()
      chai.expect(r1.x_min).almost.equal(-r2.x_max)
      chai.expect(r1.x_max).almost.equal(-r2.x_min)
      chai.expect(r1.y_min).almost.equal(-r2.y_max)
      chai.expect(r1.y_max).almost.equal(-r2.y_min)
    })
    it('In/Out', function () {
      var r = new eYo.geom.Rect(0,0,1,1)
      let test = (c, l) => {
        let w = new eYo.geom.Point(c, l)
        chai.expect(w.out(r) && w.in(r)).true  
      }
      test(0,0)
      test(1,0)
      test(0,1)
      test(1,1)
    })
  })
})

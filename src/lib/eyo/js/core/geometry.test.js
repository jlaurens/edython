eYo.test || eYo.makeNS('test')

eYo.test.almost = (a, b) => 10000 * Math.abs(a-b) <= (Math.abs(a) + Math.abs(b))

describe ('geometry', function () {
  this.timeout(10000)
  it ('Geometry: Basic', function () {
    chai.assert(eYo.geom.Where)
    chai.assert(eYo.geom.Size)
    chai.assert(eYo.geom.Rect)
  })
  it ('Geometry: unit', function () {
    chai.assert(eYo.unit.x)
    chai.assert(eYo.unit.y)
    chai.assert(eYo.unit.rem)
  })
  describe('Where', function () {
    it ('new eYo.geom.Where()', function () {
      var whr = new eYo.geom.Where()
      chai.assert(!['c', 'l', 'x', 'y'].some(k => whr[k] != 0))
      whr.c_ = 1.23
      chai.assert(eYo.test.almost(whr.c, 1.23) && eYo.test.almost(whr.x, 1.23 * eYo.unit.x))
      whr.x_ = 4.21 * eYo.unit.x
      chai.assert(eYo.test.almost(whr.c, 4.21) && eYo.test.almost(whr.x, 4.21 * eYo.unit.x))
      whr.l_ = 3.21
      chai.assert(eYo.test.almost(whr.l, 3.21) && eYo.test.almost(whr.y, 3.21 * eYo.unit.y))
      whr.y_ = 1.24 * eYo.unit.y
      chai.assert(eYo.test.almost(whr.l, 1.24) && eYo.test.almost(whr.y, 1.24 * eYo.unit.y))
    })
    it ('new eYo.geom.Where(true)', function () {
      var whr = new eYo.geom.Where(true)
      chai.assert(whr.snap_)
      chai.assert(!['c', 'l', 'x', 'y'].some(k => whr[k] != 0))
      whr.c_ = 1.23
      chai.assert(eYo.test.almost(whr.c, 1) && eYo.test.almost(whr.x, 1 * eYo.unit.x))
      whr.c_ = 1.33
      chai.assert(eYo.test.almost(whr.c, 1.5) && eYo.test.almost(whr.x, 1.5 * eYo.unit.x))
      whr.x_ = 4.21 * eYo.unit.x
      chai.assert(eYo.test.almost(whr.c, 4) && eYo.test.almost(whr.x, 4 * eYo.unit.x))
      whr.x_ = 4.31 * eYo.unit.x
      chai.assert(eYo.test.almost(whr.c, 4.5) && eYo.test.almost(whr.x, 4.5 * eYo.unit.x))
      whr.l_ = 3.11
      chai.assert(eYo.test.almost(whr.l, 3) && eYo.test.almost(whr.y, 3 * eYo.unit.y))
      whr.l_ = 3.31
      chai.assert(eYo.test.almost(whr.l, 3.25) && eYo.test.almost(whr.y, 3.25 * eYo.unit.y))
      whr.l_ = 3.41
      chai.assert(eYo.test.almost(whr.l, 3.5) && eYo.test.almost(whr.y, 3.5 * eYo.unit.y))
      whr.y_ = 1.124 * eYo.unit.y
      chai.assert(eYo.test.almost(whr.l, 1.0) && eYo.test.almost(whr.y, 1.0 * eYo.unit.y))
      whr.y_ = 1.125001 * eYo.unit.y
      chai.assert(eYo.test.almost(whr.l, 1.25) && eYo.test.almost(whr.y, 1.25 * eYo.unit.y))
      whr.y_ = 1.44 * eYo.unit.y
      chai.assert(eYo.test.almost(whr.l, 1.5) && eYo.test.almost(whr.y, 1.5 * eYo.unit.y))
      whr.y_ = 1.75 * eYo.unit.y
      chai.assert(eYo.test.almost(whr.l, 1.75) && eYo.test.almost(whr.y, 1.75 * eYo.unit.y))
      whr.y_ = 1.874999 * eYo.unit.y
      chai.assert(eYo.test.almost(whr.l, 1.75) && eYo.test.almost(whr.y, 1.75 * eYo.unit.y))
      whr.y_ = 1.875001 * eYo.unit.y
      chai.assert(eYo.test.almost(whr.l, 2) && eYo.test.almost(whr.y, 2 * eYo.unit.y))
    })
    it('Mutation', function () {
      var w1 = new eYo.geom.Where()
      var w2 = new eYo.geom.Where(w1)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.description}.equals(${w2.description})`)
      w1.forward(1)
      chai.assert(!w1.equals(w2), `MISSED !${w1.description}.equals(${w2.description})`)
      w1.forward(-1)
      chai.assert(w1.equals(w2) && w2.equals(w1))
      var w3 = eYo.geom.xyWhere(12.34, 56.78)
      w1.forward(w3)
      chai.assert(!w1.equals(w2), `MISSED !${w1.description}.equals(${w2.description})`)
      w2.forward(w3)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.description}.equals(${w2.description})`)
      w1.backward(w3)
      chai.assert(!w1.equals(w2), `MISSED !${w1.description}.equals(${w2.description})`)
      w2.backward(w3)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.description}.equals(${w2.description})`)
      w1.forward(w3)
      w2.forward(w3)
      w1.scale(1.23)
      chai.assert(!w1.equals(w2), `MISSED !${w1.description}.equals(${w2.description})`)
      w2.scale(1.23)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.description}.equals(${w2.description})`)
      w1.unscale(1.23)
      chai.assert(!w1.equals(w2), `MISSED !${w1.description}.equals(${w2.description})`)
      w2.unscale(1.23)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.description}.equals(${w2.description})`)
    })
  })
  describe('size', function () {
    it('setFromText', function() {
      var s = new eYo.geom.Size(0,0)
      chai.assert(s.c === 0 && s.l === 0, '0')
      var f = (txt, c, l) => {
        s.setFromText(txt)
        chai.assert(s.c === c && s.l === l, `MISSED <${txt}>: ${s.c} === ${c} (c) && ${s.l} === ${l} (l)`)
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
      chai.assert(eYo.test.almost(r.c, c), `MISSED c: ${r.c} === ${c}`)
      chai.assert(eYo.test.almost(r.l, l), `MISSED l: ${r.l} === ${l}`)
      chai.assert(eYo.test.almost(r.w, w), `MISSED w: ${r.w} === ${w}`)
      chai.assert(eYo.test.almost(r.h, h), `MISSED h: ${r.h} === ${h}`)
    }
    it ('Rect: new eYo.geom.Rect()', function () {
      let r = new eYo.geom.Rect()
      // by copy or not
      chai.assert(r.origin !== r.origin_)
      chai.assert(r.origin_ === r.origin_)
      chai.assert(r.size !== r.size_)
      chai.assert(r.size_ === r.size_)
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
    it ('Rect: min, mid, max', function () {
      var r = new eYo.geom.Rect()
      r.c_min_ = 1
      test(r, 1, 0, 0, 0)
      r.w_ = 9
      test(r, 1, 0, 9, 0)
      chai.assert(r.c_max === 10)
      r.c_max_ = 110
      test(r, 101, 0, 9, 0)
      r.w_ = 100
      test(r, 101, 0, 100, 0)
      chai.assert(r.c_max === 201)
      r.c_min_ = 0
      chai.assert(r.c_max === 100)
      chai.assert(r.c_mid === 50)
      r.c_mid_ = 100
      chai.assert(r.c_min === 50)
      chai.assert(r.c_mid === 100)
      chai.assert(r.c_max === 150)
      r = new eYo.geom.Rect()
      r.l_min_ = 1
      test(r, 0, 1, 0, 0)
      r.h_ = 9
      test(r, 0, 1, 0, 9)
      chai.assert(r.l_max === 10)
      r.l_max_ = 110
      test(r, 0, 101, 0, 9)
      r.h_ = 100
      test(r, 0, 101, 0, 100)
      chai.assert(r.l_max === 201)
      r.l_min_ = 0
      chai.assert(r.l_max === 100)
      chai.assert(r.l_mid === 50)
      r.l_mid_ = 100
      chai.assert(r.l_min === 50)
      chai.assert(r.l_mid === 100)
      chai.assert(r.l_max === 150)
    })
  })
  describe('In/Out', function () {
    it('Out', function() {
      var r = new eYo.geom.Rect(0,0,1,1)
      let test = (c, l) => {
        let w = new eYo.geom.Where(c, l)
        chai.assert(w.out(r) && w.in(r))  
      }
      test(0,0)
      test(1,0)
      test(0,1)
      test(1,1)
    })
  })
})

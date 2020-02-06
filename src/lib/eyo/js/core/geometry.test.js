describe ('geometry', function () {
  it ('Geometry: Basic', function () {
    chai.assert(eYo.o4t.Where)
    chai.assert(eYo.c9r.Size)
    chai.assert(eYo.c9r.Rect)
  })
  describe('Where', function () {
    it ('new eYo.o4t.Where', function () {
      var w1 = new eYo.o4t.Where()
      console.error(w1.toString)
      chai.assert(!['c', 'l', 'x', 'y'].some(k => w1[k] != 0))
      w1.c = 1.23
      chai.assert(w1.c == 1 && w1.x == eYo.unit.x)
      var a = w1.x = 4.21 * eYo.unit.x
      chai.assert(w1.c == 4.21 && w1.x == a)
      w1.l = 3.21
      chai.assert(w1.l == 3.25 && w1.y == 3.25 * eYo.unit.y)
      w1.l = 3.31
      chai.assert(w1.l == 3.25 && w1.y == 3.25 * eYo.unit.y)
      a = w1.y = 1.24 * eYo.unit.y
      chai.assert(w1.l == 1.24 && w1.y == a)
    })
    it('Mutation', function () {
      var w1 = new eYo.o4t.Where()
      var w2 = new eYo.o4t.Where(w1)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.toString}.equals(${w2.toString})`)
      w1.forward(1)
      chai.assert(!w1.equals(w2), `MISSED !${w1.toString}.equals(${w2.toString})`)
      w1.forward(-1)
      chai.assert(w1.equals(w2) && w2.equals(w1))
      var w3 = eYo.o4t.Where.xy(12.34, 56.78)
      w1.forward(w3)
      chai.assert(!w1.equals(w2), `MISSED !${w1.toString}.equals(${w2.toString})`)
      w2.forward(w3)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.toString}.equals(${w2.toString})`)
      w1.backward(w3)
      chai.assert(!w1.equals(w2), `MISSED !${w1.toString}.equals(${w2.toString})`)
      w2.backward(w3)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.toString}.equals(${w2.toString})`)
      w1.forward(w3)
      w2.forward(w3)
      w1.scale(1.23)
      chai.assert(!w1.equals(w2), `MISSED !${w1.toString}.equals(${w2.toString})`)
      w2.scale(1.23)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.toString}.equals(${w2.toString})`)
      w1.unscale(1.23)
      chai.assert(!w1.equals(w2), `MISSED !${w1.toString}.equals(${w2.toString})`)
      w2.unscale(1.23)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.toString}.equals(${w2.toString})`)
    })
  })
  describe('size', function () {
    it('setFromText', function() {
      var s = new eYo.c9r.Size(0,0)
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
  describe('In/Out', function () {
    it('Out', function() {
      var r = new eYo.c9r.Rect(0,0,1,1)
      var w = new eYo.o4t.Where(0,1)
      chai.assert(w.out(r))
      w = new eYo.o4t.Where(1,1)
      chai.assert(w.out(r))
      w = new eYo.o4t.Where(1,0)
      chai.assert(w.out(r))
    })
  })
})

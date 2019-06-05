describe ('Geometry', function () {
  describe('Where', function () {
    it ('Basic', function () {
      var w1 = new eYo.Where()
      chai.assert(!['c', 'l', 'x', 'y'].some(k => w1[k] != 0))
      w1.c = 1.23
      chai.assert(w1.c == 1 && w1.x == eYo.Unit.x)
      var a = w1.x = 4.21 * eYo.Unit.x
      chai.assert(w1.c == 4.21 && w1.x == a)
      w1.l = 3.21
      chai.assert(w1.l == 3 && w1.y == 3 * eYo.Unit.y)
      a = w1.y = 1.24 * eYo.Unit.y
      chai.assert(w1.l == 1.24 && w1.y == a)
    })
    it('Mutation', function () {
      var w1 = new eYo.Where()
      var w2 = new eYo.Where(w1)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.toString()}.equals(${w2.toString()})`)
      w1.forward(1)
      chai.assert(!w1.equals(w2), `MISSED !${w1.toString()}.equals(${w2.toString()})`)
      w1.forward(-1)
      chai.assert(w1.equals(w2) && w2.equals(w1))
      var w3 = new eYo.Where().xySet(12.34, 56.78)
      w1.forward(w3)
      chai.assert(!w1.equals(w2), `MISSED !${w1.toString()}.equals(${w2.toString()})`)
      w2.forward(w3)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.toString()}.equals(${w2.toString()})`)
      w1.backward(w3)
      chai.assert(!w1.equals(w2), `MISSED !${w1.toString()}.equals(${w2.toString()})`)
      w2.backward(w3)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.toString()}.equals(${w2.toString()})`)
      w1.forward(w3)
      w2.forward(w3)
      w1.scale(1.23)
      chai.assert(!w1.equals(w2), `MISSED !${w1.toString()}.equals(${w2.toString()})`)
      w2.scale(1.23)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.toString()}.equals(${w2.toString()})`)
      w1.unscale(1.23)
      chai.assert(!w1.equals(w2), `MISSED !${w1.toString()}.equals(${w2.toString()})`)
      w2.unscale(1.23)
      chai.assert(w1.equals(w2) && w2.equals(w1), `MISSED ${w1.toString()}.equals(${w2.toString()})`)
    })
  })
  describe('Size', function () {
    it('setFromText', function() {
      var s = new eYo.Size(0,0)
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
})

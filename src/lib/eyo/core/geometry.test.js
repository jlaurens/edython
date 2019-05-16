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

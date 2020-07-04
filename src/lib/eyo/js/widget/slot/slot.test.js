describe('Proxy between lists and linked lists (Proof of concept)', function() {
  it(`Basic`, function() {
    var a = {before: null, name: 'a0'}
    var b = {before: a, name: 'b1'}
    a.after = b
    var c = {before: b, after: null, name: 'c2'}
    b.after = c
    var aa = {head: a}
    var p = new Proxy(aa, {
      get: function (oTarget, sKey) {
        if (sKey === 'push') {
          return function (what) {
            var ans = oTarget.head
            if (ans) {
              while (ans.after) {
                ans = ans.after
              }
              ans.after = what
            } else {
              return oTarget.head = what
            }
            what && (what.before = ans)
          }
        } else if (sKey === 'insert') {
          return function (what, where) {
            var ans = oTarget.head
            if (ans) {
              var i = where
              while (i-- > 0) {
                if (ans.after) {
                  ans = ans.after
                } else {
                  ans.after = what
                  what && (what.before = ans)
                  return what
                }
              }
              var b = what.before = ans.before
              ;(b && (b.after = what)) || (oTarget.head = what)
              while (what.after) {
                what = what.after
              }
              what.after = ans
              ans && (ans.before = what)
            } else {
              return oTarget.head = what
            }
          }
        } else if (isNaN(sKey)) {
          return undefined
        }
        var ans = oTarget.head
        var i = sKey
        while (i-- > 0) {
          ans = ans.after
        }
        return ans
      },
      set: function (oTarget, sKey, vValue) {
        if (isNaN(sKey) || !vValue) {
          return false
        }
        var i = sKey
        var ans = aa.head
        while (i-- > 0) {
          ans = ans.after
        }
        var v = vValue.before = ans.before
        v ? (v.after = vValue) : (aa.head = vValue)
        v = vValue.after = ans.after
        v && (v.before = vValue)
        ans.before = ans.after = null
        return true
      },
      deleteProperty: function (oTarget, sKey) {
        if (isNaN(sKey)) {
          return false
        }
        var i = sKey
        var ans = aa.head
        while (i-- > 0) {
          ans = ans.after
        }
        // remove the ans object
        var v = ans.before
        v ? (v.after = ans.after) : (aa.head = ans.after)
        v = ans.after
        v && (v.before = ans.before)
        ans.before = ans.after = null
        return true
      },  
    })
    var test = (...names) => {
      var i = 0
      names.forEach(name => {
        chai.expect(p[i++].name).equal(name)
      })
    }
    test('a0','b1','c2')
    chai.expect(() => {p[3].name}).to.throw()
    p[0] = {name: 'new a0'}
    test('new a0','b1','c2')
    p[1] = {name: 'new b1'}
    test('new a0','new b1','c2')
    p[2] = {name: 'new c2'}
    test('new a0','new b1','new c2')
    chai.expect(() => {p[3] = {name: 'new d'}}).to.throw()
    delete p[1]
    test('new a0','new c2')
    delete p[0]
    test('new c2')
    chai.expect(() => {delete p[1]}).to.throw()
    delete p[0]
    chai.expect(() => {p[0].name}).to.throw()
    chai.assert(!aa.head)
    p.push(a)
    test('a0')
    p.push(b)
    test('a0','b1')
    p.push(c)
    test('a0','b1', 'c2')
    d = {name: 'd3'}
    p.insert(d, 0)
    test('d3','a0','b1','c2')
    delete p[0]
    test('a0','b1','c2')
    p.insert(d, 1)
    test('a0','d3','b1','c2')
    delete p[1]
    test('a0','b1','c2')
    p.insert(d, 2)
    test('a0','b1','d3','c2')
    delete p[2]
    test('a0','b1','c2')
    p.insert(d, 3)
    test('a0','b1','c2','d3')
    delete p[3]
    //    test('a0','b1','c2')
  })
})

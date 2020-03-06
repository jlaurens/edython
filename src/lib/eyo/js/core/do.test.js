describe ('do', function () {
  it ('BASIC: Do', function () {
    chai.assert(eYo.do)
    chai.assert(eYo.do.toTitleCase)
    chai.assert(eYo.do.makeWrapper)
  })
  it ('eYo.do.toTitleCase', function () {
    chai.expect(eYo.do.toTitleCase('')).equal('')
    chai.expect(eYo.do.toTitleCase('a')).equal('A')
    chai.expect(eYo.do.toTitleCase('abc')).equal('Abc')
  })
  it ('eYo.do.makeWrapper', function () {
    var flag = 0
    let start_f = () => {
      flag += 1
    }
    let try_f = () => {
      flag += 20
      return 5
    }
    let begin_finally_f = () => {
      flag += 300
    }
    let finally_f = (ans) => {
      flag += 4000
      return ans * 11
    }
    let end_finally_f = () => {
      flag += 50000
    }
    ;[eYo.NA, start_f].forEach(start_f => {
      ;[eYo.NA, begin_finally_f].forEach(begin_finally_f => {
        ;[eYo.NA, finally_f].forEach(finally_f => {
          ;[eYo.NA, end_finally_f].forEach(end_finally_f => {
            let wrapper = eYo.do.makeWrapper(start_f, begin_finally_f, end_finally_f)
            flag = 0
            var ans = wrapper(try_f, finally_f)
            chai.expect(ans).equal(finally_f ? 55 : 5)
            var expected = 0
            start_f && (expected += 1)
            try_f && (expected += 20)
            begin_finally_f && (expected += 300)
            finally_f && (expected += 4000)
            end_finally_f && (expected += 50000)
            chai.expect(flag).equal(expected)
          })
        })
      })
    })
  })
  it ('eYo.do.makeWrapper(this)', function () {
    let O = {
      flag: 0,
    }
    let start_f = () => {
      O.flag += 1
    }
    let try_f = function () {
      this.flag += 20
      return 5
    }
    let begin_finally_f = () => {
      O.flag += 300
    }
    let finally_f = function (ans) {
      this.flag += 4000
      return ans * 11
    }
    let end_finally_f = () => {
      O.flag += 50000
    }
    ;[eYo.NA, start_f].forEach(start_f => {
      ;[eYo.NA, begin_finally_f].forEach(begin_finally_f => {
        ;[eYo.NA, finally_f].forEach(finally_f => {
          ;[eYo.NA, end_finally_f].forEach(end_finally_f => {
            O.foo = eYo.do.makeWrapper(start_f, begin_finally_f, end_finally_f)
            O.flag = 0
            var ans = O.foo(try_f, finally_f)
            chai.expect(ans).equal(finally_f ? 55 : 5)
            var expected = 0
            start_f && (expected += 1)
            try_f && (expected += 20)
            begin_finally_f && (expected += 300)
            finally_f && (expected += 4000)
            end_finally_f && (expected += 50000)
            chai.expect(O.flag).equal(expected)
          })
        })
      })
    })
  })
  it ('eYo.do.makeWrapper($this)', function () {
    let O = {
      flag: 0,
    }
    let P = {
      flag: 0,
    }
    let start_f = function () {
      this.flag += 1
    }
    let try_f = function () {
      this.flag += 20
      return 5
    }
    let begin_finally_f = function () {
      this.flag += 300
    }
    let finally_f = function (ans) {
      this.flag += 4000
      return ans * 11
    }
    let end_finally_f = function () {
      this.flag += 50000
    }
    ;[eYo.NA, start_f].forEach(start_f => {
      ;[eYo.NA, begin_finally_f].forEach(begin_finally_f => {
        ;[eYo.NA, finally_f].forEach(finally_f => {
          ;[eYo.NA, end_finally_f].forEach(end_finally_f => {
            O.foo = eYo.do.makeWrapper(P, start_f, begin_finally_f, end_finally_f)
            O.flag = P.flag = 0
            var ans = O.foo(try_f, finally_f)
            chai.expect(ans).equal(finally_f ? 55 : 5)
            var expected = 0
            start_f && (expected += 1)
            begin_finally_f && (expected += 300)
            end_finally_f && (expected += 50000)
            chai.expect(P.flag).equal(expected)
            var expected = 0
            try_f && (expected += 20)
            finally_f && (expected += 4000)
            chai.expect(O.flag).equal(expected)
          })
        })
      })
    })
  })
  it ('eYo.do.makeWrapper($$this)', function () {
    let O = {
      flag: 0,
    }
    let P = {
      flag: 0,
    }
    let start_f = () => {
      O.flag += 1
    }
    let try_f = function () {
      this.flag += 20
      return 5
    }
    let begin_finally_f = () => {
      O.flag += 300
    }
    let finally_f = function (ans) {
      this.flag += 4000
      return ans * 11
    }
    let end_finally_f = () => {
      O.flag += 50000
    }
    ;[eYo.NA, start_f].forEach(start_f => {
      ;[eYo.NA, begin_finally_f].forEach(begin_finally_f => {
        ;[eYo.NA, finally_f].forEach(finally_f => {
          ;[eYo.NA, end_finally_f].forEach(end_finally_f => {
            O.foo = eYo.do.makeWrapper(start_f, begin_finally_f, end_finally_f)
            O.flag = P.flag = 0
            var ans = O.foo(P, try_f, finally_f)
            chai.expect(ans).equal(finally_f ? 55 : 5)
            var expected = 0
            start_f && (expected += 1)
            begin_finally_f && (expected += 300)
            end_finally_f && (expected += 50000)
            chai.expect(O.flag).equal(expected)
            var expected = 0
            try_f && (expected += 20)
            finally_f && (expected += 4000)
            chai.expect(P.flag).equal(expected)
          })
        })
      })
    })
  })
  it ('eYo.do.makeWrapper(throw)', function () {
    var flag = 0
    let start_f = () => {
      flag += 1
    }
    class MyError extends Error {}
    let try_f = () => {
      flag += 20
      throw new MyError()
    }
    let begin_finally_f = () => {
      flag += 300
    }
    let finally_f = (ans) => {
      flag += 4000
      return 11
    }
    let end_finally_f = () => {
      flag += 50000
    }
    ;[eYo.NA, start_f].forEach(start_f => {
      ;[eYo.NA, begin_finally_f].forEach(begin_finally_f => {
        ;[eYo.NA, finally_f].forEach(finally_f => {
          ;[eYo.NA, end_finally_f].forEach(end_finally_f => {
            let wrapper = eYo.do.makeWrapper(start_f, begin_finally_f, end_finally_f)
            flag = 0
            var ans = 7
            var err
            try {
              ans = wrapper(try_f, finally_f)
            } catch(e) {
              err = e
            }
            chai.assert(err instanceof MyError)
            chai.expect(ans).equal(7)
            var expected = 0
            start_f && (expected += 1)
            try_f && (expected += 20)
            begin_finally_f && (expected += 300)
            finally_f && (expected += 4000)
            end_finally_f && (expected += 50000)
            chai.expect(flag).equal(expected)
          })
        })
      })
    })
  })
  it ('eYo.do.makeWrapper(old)', function () {
    var flag = 0
    let start_f = () => {
      flag += 1
      return 6
    }
    let try_f = () => {
      flag += 20
      return 5
    }
    let begin_finally_f = (old) => {
      flag += 300
      flag += old * 100000
    }
    let finally_f = (ans) => {
      flag += 4000
      return ans * 11
    }
    let end_finally_f = (old) => {
      flag += 50000
      flag += (old+1) * 1000000
    }
    flag = 0
    let wrapper = eYo.do.makeWrapper(start_f, begin_finally_f, end_finally_f)
    var ans = wrapper(try_f, finally_f)
    chai.expect(ans).equal(55)
    chai.expect(flag).equal(7654321)
  })
})

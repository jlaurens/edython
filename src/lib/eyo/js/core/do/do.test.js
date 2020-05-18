describe ('Tests: do', function () {
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
    let start_f = () => {
      flag.push(1)
    }
    let try_f = () => {
      flag.push(2)
      return 6
    }
    let begin_finally_f = () => {
      flag.push(3)
    }
    let finally_f = (ans) => {
      flag.push(4)
      return ans * 11
    }
    let end_finally_f = () => {
      flag.push(5)
    }
    let expected = new eYo.test.Flag()
    ;[eYo.NA, start_f].forEach(start_f => {
      ;[eYo.NA, begin_finally_f].forEach(begin_finally_f => {
        ;[eYo.NA, finally_f].forEach(finally_f => {
          ;[eYo.NA, end_finally_f].forEach(end_finally_f => {
            if (begin_finally_f && !end_finally_f) {
              return
            }
            let wrapper = eYo.do.makeWrapper_(eYo.NA, start_f, begin_finally_f, end_finally_f)
            flag.reset()
            expected.reset()
            var ans = wrapper(try_f, finally_f)
            chai.expect(ans).equal(finally_f ? 66 : 6)
            start_f && expected.push(1)
            try_f && expected.push(2)
            begin_finally_f && expected.push(3)
            finally_f && expected.push(4)
            end_finally_f && expected.push(5)
            flag.expect(expected)
          })
        })
      })
    })
  })
  it ('eYo.do.makeWrapper(this)', function () {
    let $$this = {
      flag (...$) {
        flag.push(...$)
      },
    }
    let start_f = () => {
      $$this.flag(1)
    }
    let try_f = function () {
      this.flag(2)
      return 6
    }
    let begin_finally_f = () => {
      $$this.flag(3)
    }
    let finally_f = function (ans) {
      this.flag(4)
      return ans * 11
    }
    let end_finally_f = () => {
      $$this.flag(5)
    }
    let expected = new eYo.test.Flag()
    ;[eYo.NA, start_f].forEach(start_f => {
      ;[eYo.NA, begin_finally_f].forEach(begin_finally_f => {
        ;[eYo.NA, finally_f].forEach(finally_f => {
          ;[eYo.NA, end_finally_f].forEach(end_finally_f => {
            flag.reset()
            expected.reset()
            $$this.foo = eYo.do.makeWrapper_(eYo.NA, start_f, begin_finally_f, end_finally_f)
            var ans = $$this.foo(try_f, finally_f)
            chai.expect(ans).equal(finally_f ? 66 : 6)
            start_f && expected.push(1)
            try_f && expected.push(2)
            begin_finally_f && expected.push(3)
            finally_f && expected.push(4)
            end_finally_f && expected.push(5)
            flag.expect(expected)
          })
        })
      })
    })
  })
  it ('eYo.do.makeWrapper($this)', function () {
    let $this = {
      flag (...$) {
        flag.push(...$)
      },
    }
    let $$this = {
      flag (...$) {
        flag.push(...$)
      },
    }
    let start_f = function () {
      this.flag(1)
    }
    let try_f = function () {
      this.flag(2)
      return 6
    }
    let begin_finally_f = function () {
      this.flag(3)
    }
    let finally_f = function (ans) {
      this.flag(4)
      return ans * 11
    }
    let end_finally_f = function () {
      this.flag(5)
    }
    let expected = new eYo.test.Flag()
    ;[eYo.NA, start_f].forEach(start_f => {
      ;[eYo.NA, begin_finally_f].forEach(begin_finally_f => {
        ;[eYo.NA, finally_f].forEach(finally_f => {
          ;[eYo.NA, end_finally_f].forEach(end_finally_f => {
            flag.reset()
            expected.reset()
            $$this.foo = eYo.do.makeWrapper_($this, start_f, begin_finally_f, end_finally_f)
            var ans = $$this.foo(try_f, finally_f)
            chai.expect(ans).equal(finally_f ? 66 : 6)
            start_f && expected.push(1)
            try_f && expected.push(2)
            begin_finally_f && expected.push(3)
            finally_f && expected.push(4)
            end_finally_f && expected.push(5)
            flag.expect(expected)
          })
        })
      })
    })
  })
  it ('eYo.do.makeWrapper($$this)', function () {
    let $this = {
      flag (...$) {
        flag.push(...$)
      },
    }
    let $$this = {
      flag (...$) {
        flag.push(...$)
      },
    }
    let start_f = function () {
      this.flag(1)
    }
    let try_f = function () {
      this.flag(2)
      return 6
    }
    let begin_finally_f = function () {
      this.flag(3)
    }
    let finally_f = function (ans) {
      this.flag(4)
      return ans * 11
    }
    let end_finally_f = function () {
      this.flag(5)
    }
    let expected = new eYo.test.Flag()
    ;[eYo.NA, start_f].forEach(start_f => {
      ;[eYo.NA, begin_finally_f].forEach(begin_finally_f => {
        ;[eYo.NA, finally_f].forEach(finally_f => {
          ;[eYo.NA, end_finally_f].forEach(end_finally_f => {
            flag.reset()
            expected.reset()
            $$this.foo = eYo.do.makeWrapper_($this, start_f, begin_finally_f, end_finally_f)
            var ans = $$this.foo(try_f, finally_f)
            chai.expect(ans).equal(finally_f ? 66 : 6)
            start_f && expected.push(1)
            try_f && expected.push(2)
            begin_finally_f && expected.push(3)
            finally_f && expected.push(4)
            end_finally_f && expected.push(5)
            flag.expect(expected)
          })
        })
      })
    })
  })
})

// This file was generated by "update.py" on 2020-04-26 20:45:20.555158

describe(`Inline tests at core/dlgt/dlgt.js`, function () {
  this.timeout(10000)
  let flag = new eYo.test.Flag()
  let onr = eYo.c9r && eYo.c9r.new('onr')
  before (function() {
    flag.reset()
  })

  describe(`eYo.dlgt.BaseC9r`, function () {
    it(`eYo.dlgt.BaseC9r_p.makeC9rInit`, function () {
      var C9r, eyo
      let prepare = model => {
        C9r = function (...$) {
          this.init(...$)
        }
        let _p = C9r.prototype
        _p.doPrepare = function (...$) {
          flag.push(1, ...$)
        }
        _p.doInit = function (...$) {
          flag.push(2, ...$)
        }
        eyo = eYo.dlgt.new('foo', C9r, model || {})
      }
      prepare({
        init (builtin, ...$) {
          flag.push(8)
          builtin(...$)
          flag.push(9)
        }
      })
      C9r.prototype.init = function (...$) {
        flag.push(3, ...$)
      }
      eyo.makeC9rInit()
      new C9r(4, 7)
      flag.expect(81473472479)
      prepare()
      C9r.prototype.init = function (...$) {
        flag.push(3, ...$)
      }
      eyo.makeC9rInit({
        init (builtin, ...$) {
          flag.push(8)
          builtin(...$)
          flag.push(9)
        }
      })
      new C9r(4, 7)
      flag.expect(81473472479)
      prepare({
        init (builtin, ...$) {
          flag.push(8)
          builtin(...$)
          flag.push(9)
        }
      })
      eyo.makeC9rInit()
      new C9r(4, 7)
      flag.expect(81472479)
      prepare()
      eyo.makeC9rInit({
        init (builtin, ...$) {
          flag.push(8)
          builtin(...$)
          flag.push(9)
        }
      })
      new C9r(4, 7)
      flag.expect(81472479)
      prepare({
        init (...$) {
          flag.push(8)
          flag.push(...$)
          flag.push(9)
        }
      })
      C9r.prototype.init = function (...$) {
        flag.push(3, ...$)
      }
      eyo.makeC9rInit()
      new C9r(4, 7)
      flag.expect(1473478479247)
      prepare()
      C9r.prototype.init = function (...$) {
        flag.push(3, ...$)
      }
      eyo.makeC9rInit({
        init (...$) {
          flag.push(8)
          flag.push(...$)
          flag.push(9)
        }
      })
      new C9r(4, 7)
      flag.expect(1473478479247)
      prepare({
        init (...$) {
          flag.push(8)
          flag.push(...$)
          flag.push(9)
        }
      })
      eyo.makeC9rInit()
      new C9r(4, 7)
      flag.expect(1478479247)
      prepare()
      eyo.makeC9rInit({
        init (...$) {
          flag.push(8)
          flag.push(...$)
          flag.push(9)
        }
      })
      new C9r(4, 7)
      flag.expect(1478479247)
      prepare()
      C9r.prototype.init = function (...$) {
        flag.push(3, ...$)
      }
      eyo.makeC9rInit()
      new C9r(4, 7)
      flag.expect(147347247)
      prepare()
      C9r.prototype.init = function (...$) {
        flag.push(3, ...$)
      }
      eyo.makeC9rInit({})
      new C9r(4, 7)
      flag.expect(147347247)
      prepare()
      eyo.makeC9rInit()
      new C9r(4, 7)
      flag.expect(147247)
      prepare()
      eyo.makeC9rInit({})
      new C9r(4, 7)
      flag.expect(147247)
    })
  })

})

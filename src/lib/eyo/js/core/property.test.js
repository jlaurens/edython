const NS = Object.create(null)

describe ('Property', function () {
  it('Proof of concept: add property', function () {
    const A = function () {}
    Object.defineProperties(A.prototype,{
      b: {
        value: 'UNSET b',
        writable: false
      },
      c: {
        value: 'UNSET c',
        writable: false
      }
    })
    const AB = function () {}
    goog.inherits(AB, A)
    const AC = function () {}
    goog.inherits(AC, A)
    var a = new A()
    chai.assert(a.b === 'UNSET b')
    chai.assert(a.c === 'UNSET c')
    const addProperty = (proto, key) => {
      var k = key + "_"
      Object.defineProperty(proto, key, {
        get () {
          return this[k]
        },
        set (value) {
          var old = this[k]
          if (old !== value) {
            this[k] = value
          }
        }
      })
    }
    addProperty(AB.prototype, 'b')
    addProperty(AC.prototype, 'c')
    // the catched `k` variable now is 'c_'
    var b = new AB()
    chai.assert(b.b === undefined)
    chai.assert(b.c === 'UNSET c')
    b.b = 421
    chai.assert(b.b === 421)
    chai.assert(b.c === 'UNSET c')
    var c = new AC()
    chai.assert(c.b === 'UNSET b')
    chai.assert(c.c === undefined)
    c.c = 421
    chai.assert(c.b === 'UNSET b')
    chai.assert(c.c === 421)
  })
  it ('eYo.Property.declare 1', function () {
    const o = Object.create(null)
    eYo.Property.declare(o, 'k')
    chai.assert(o.k__ === undefined)
    chai.assert(o.k_ === undefined)
    chai.assert(o.k === undefined)
    o.k__ = 421
    chai.assert(o.k__ === 421)
    chai.assert(o.k_ === 421)
    chai.assert(o.k === 421)
    o.k_ = 123
    chai.assert(o.k__ === 123)
    chai.assert(o.k_ === 123)
    chai.assert(o.k === 123)
    o.k = 421
    chai.assert(o.k__ === 123)
    chai.assert(o.k_ === 123)
    chai.assert(o.k === 123)
  })
  it ('eYo.Property.declare 2', function () {
    const o = Object.create(null)
    eYo.Property.declare(o, 'k')
    chai.assert(o.k__ === undefined)
    chai.assert(o.k_ === undefined)
    chai.assert(o.k === undefined)
    o.k__ = 421
    chai.assert(o.k__ === 421)
    chai.assert(o.k_ === 421)
    chai.assert(o.k === 421)
    o.k_ = 123
    chai.assert(o.k__ === 123)
    chai.assert(o.k_ === 123)
    chai.assert(o.k === 123)
    o.k = 421
    chai.assert(o.k__ === 123)
    chai.assert(o.k_ === 123)
    chai.assert(o.k === 123)
  })
})

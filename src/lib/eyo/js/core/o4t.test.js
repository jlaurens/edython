describe ('Tests: Object', function () {
  this.timeout(10000)
  it ('O4t: Basic', function () {
    chai.assert(eYo.o4t)
  })
  it ('O4t: eYo.o4t.makeC9r...', function () {
    let O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {})
    let o = new O()
    chai.assert(o)
  })
  it ('O4t: properties (valued)', function () {
    var O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          value: 421
        },
        bar: 0,
        chi () {
          return 666
        },
      }
    })
    var o = new O()
    chai.assert(o.foo_p)
    chai.assert(o.foo_p.owner === o)
    chai.assert(o.foo_p === o[o.foo_p.key + '_p'])
    chai.assert(o.foo_p.value === 421)
    chai.assert(o.foo === 421)
    o.foo_ = 123
    chai.assert(o.foo === 123)
    chai.assert(o.bar_p)
    chai.assert(o.bar === 0)
    o.bar_ = 421
    chai.assert(o.bar === 421)
    chai.assert(o.chi_p)
    chai.assert(o.chi === 666)
    o.chi_ = 421
    chai.assert(o.chi === 421)
  })
  it ('O4t: properties (owned)', function () {
    var flag = 0
    var O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          value: {
            eyo: true,
            dispose () {
              flag = 421
            }
          }
        },
      }
    })
    var o = new O()
    o = o.dispose()
    chai.assert(flag === 421)
    flag = 0
    var O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          value: {
            eyo: true,
            dispose () {
              flag = 421
            }
          },
          dispose: false,
        },
      }
    })
    var o = new O()
    o = o.dispose()
    chai.assert(flag === 0)
    var flag = 0
    var O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          value: [
            {
              eyo: true,
              dispose () {
                flag += 1
              }
            },
            {
              eyo: true,
              dispose () {
                flag += 20
              }
            },
            {
              eyo: true,
              dispose () {
                flag += 400
              }
            },
          ]
        },
      }
    })
    var o = new O()
    o = o.dispose()
    chai.assert(flag === 421)
    var flag = 0
    var O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          value: {
            1: {
              eyo: true,
              dispose () {
                flag += 1
              }
            },
            2: {
              eyo: true,
              dispose () {
                flag += 20
              }
            },
            3: {
              eyo: true,
              dispose () {
                flag += 400
              }
            },
          }
        },
      }
    })
    var o = new O()
    o = o.dispose()
    chai.assert(flag === 421)
  })
  it ('O4t: alias', function () {
    var O = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        foo: {
          value: 421
        },
      },
      aliases: {
        foo: 'bar',
        bar: ['bar1', 'bar2'],
      },
    })
    var o = new O()
    chai.assert(o.foo_p === o.bar_p)
    chai.assert(o.foo_ === o.bar_)
    chai.assert(o.foo === o.bar)
    chai.assert(o.foo_p === o.bar1_p)
    chai.assert(o.foo_ === o.bar1_)
    chai.assert(o.foo === o.bar1)
    chai.assert(o.foo_p === o.bar2_p)
    chai.assert(o.foo_ === o.bar2_)
    chai.assert(o.foo === o.bar2)
    o.foo_ = 123 - o.foo_
    chai.assert(o.foo_p === o.bar1_p)
    chai.assert(o.foo_ === o.bar1_)
    chai.assert(o.foo === o.bar1)
    chai.assert(o.foo_p === o.bar2_p)
    chai.assert(o.foo_ === o.bar2_)
    chai.assert(o.foo === o.bar2)
    chai.assert(o.foo_p === o.bar_p)
    chai.assert(o.foo_ === o.bar_)
    chai.assert(o.foo === o.bar)
    o.bar_ = 123 - o.bar_
    chai.assert(o.foo_p === o.bar_p)
    chai.assert(o.foo_ === o.bar_)
    chai.assert(o.foo === o.bar)
    chai.assert(o.foo_p === o.bar1_p)
    chai.assert(o.foo_ === o.bar1_)
    chai.assert(o.foo === o.bar1)
    chai.assert(o.foo_p === o.bar2_p)
    chai.assert(o.foo_ === o.bar2_)
    chai.assert(o.foo === o.bar2)
    o.bar1_ = 123 - o.bar1_
    chai.assert(o.foo_p === o.bar_p)
    chai.assert(o.foo_ === o.bar_)
    chai.assert(o.foo === o.bar)
    chai.assert(o.foo_p === o.bar1_p)
    chai.assert(o.foo_ === o.bar1_)
    chai.assert(o.foo === o.bar1)
    chai.assert(o.foo_p === o.bar2_p)
    chai.assert(o.foo_ === o.bar2_)
    chai.assert(o.foo === o.bar2)
    o.bar2_ = 123 - o.bar2_
    chai.assert(o.foo_p === o.bar_p)
    chai.assert(o.foo_ === o.bar_)
    chai.assert(o.foo === o.bar)
    chai.assert(o.foo_p === o.bar1_p)
    chai.assert(o.foo_ === o.bar1_)
    chai.assert(o.foo === o.bar1)
    chai.assert(o.foo_p === o.bar2_p)
    chai.assert(o.foo_ === o.bar2_)
    chai.assert(o.foo === o.bar2)
  })
  it ('O4t: deep alias', function () {
    var Foo = eYo.o4t.makeC9r(eYo.NULL_NS, 'Foo', {
      properties: {
        chi: {},
      },
    })
    var Bar = eYo.o4t.makeC9r(eYo.NULL_NS, 'Bar', {
      properties: {
        foo: new Foo()
      },
      aliases: {
        'foo.chi': 'chi',
      },
    })
    var bar = new Bar()
    chai.assert(bar.chi_p === bar.foo.chi_p)
    bar.chi_ = 421
    chai.assert(bar.chi === bar.foo.chi)
    bar.foo.chi_ = 123
    chai.assert(bar.chi === bar.foo.chi)
  })
})

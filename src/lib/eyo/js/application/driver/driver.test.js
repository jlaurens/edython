describe('driver', function() {
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
  it ('Driver: makeDriverC9r inherits', function () {
    var NS = eYo.driver.makeNS()
    NS.makeMngr()
    NS.makeDriverC9r('Foo', {
      init (...$) {
        flag.push(1)
      }
    })
    chai.assert(eYo.isF(NS.Foo))
    new NS.Foo('foo', onr)
    flag.expect(1)
  })
  it ('Driver: makeDriverC9r inherits (2)', function () {
    var NS = eYo.driver.makeNS()
    NS.makeMngr()
    NS.makeDriverC9r('Foo', {
      init (key, owner, ...$) {
        owner.flag(2, ...$)
      },
    })
    chai.expect(NS.Foo).eyo_C9r
    new NS.Foo('foo', onr, 3, 4)
    flag.expect(1234)
    NS.makeNS('a')
    NS.a.makeMngr()
    chai.expect(NS.a.super).equal(NS)
    NS.a.makeDriverC9r('Foo', {
      init (key, owner, ...$) {
        owner.flag(3, ...$)
      },
    })
    chai.expect(NS.a.Foo).eyo_C9r
    chai.expect(NS.a.Foo.SuperC9r).equal(NS.Foo)
    new NS.a.Foo('foo', onr, 4, 5)
    flag.expect(12451345)
  })
  it ('Driver: makeDriverC9r with model', function () {
    var NS = eYo.driver.makeNS()
    NS.makeMngr()
    NS.makeDriverC9r('Foo', {
      init (key, owner, ...$) {
        flag.push(1, ...$)
      },
      ui: {
        doInit (what, ...$) {
          flag.push(2, ...$)
          return true
        },
        doDispose (what, ...$) {
          flag.push(3, ...$)
        }
      },
    })
    var foo = new NS.Foo('foo', onr, 2, 3)
    flag.expect(123)
    chai.expect(foo.doInitUI(2, 3, 4)).true
    flag.expect(234)
    foo.doDisposeUI(3, 4, 5)
    flag.expect(345)
  })
  it ('Driver: makeDriverC9r concurrent', function () {
    var NS = eYo.driver.makeNS()
    NS.makeMngr()
    NS.makeDriverC9r('Foo', {
      init (key, owner, ...$) {
        flag.push(1, ...$)
      },
      ui: {
        doInit (what, ...$) {
          flag.push(2, ...$)
          return true
        },
        doDispose (what, ...$) {
          flag.push(3, ...$)
        },
      },
    })
    NS.makeDriverC9r('Bar', {
      init (key, owner, ...$) {
        flag.push(4, ...$)
      },
      ui: {
        doInit (what, ...$) {
          flag.push(5, ...$)
          return true
        },
        doDispose (what, ...$) {
          flag.push(6, ...$)
        },
      },
    })
    var foo = new NS.Foo('foo', onr, 2, 3)
    flag.expect(123)
    chai.expect(foo.doInitUI(0, 3, 4)).true
    flag.expect(234)
    foo.doDisposeUI(0, 4, 5)
    flag.expect(345)
    var bar = new NS.Bar('bar', onr, 5, 6)
    flag.expect(456)
    chai.expect(bar.doInitUI(0, 6, 7)).true
    chai.expect(567)
    bar.doDisposeUI(0, 7, 8)
    chai.expect(678)
  })
})


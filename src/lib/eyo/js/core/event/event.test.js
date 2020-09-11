describe ('Tests: event', function () {
  this.timeout(20000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c3s && eYo.c3s.new({
      methods: {
        flag (what, ...$) {
          eYo.flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  })
  it ('eYo.event.Mngr: wrap', function () {
    let mngr = new eYo.event.Mngr('mngr', onr)
    var try_f = () => {
      eYo.flag.push(1)
    }
    var finally_f = () => {
      eYo.flag.push(2)
    }
    mngr.enableWrap(try_f, finally_f)
    eYo.flag.expect(12)
    mngr.disableWrap(try_f, finally_f)
    eYo.flag.expect(12)
    mngr.groupWrap(try_f, finally_f)
    eYo.flag.expect(12)
  })
  it ('eYo.event.Mngr: enableWrap(0|1)', function () {
    let mngr = new eYo.event.Mngr('mngr', onr)
    var try_finally_f = () => {
      chai.expect(mngr.enabled).true
      chai.expect(mngr.disabled).equal(0)
    }
    try_finally_f()
    mngr.enableWrap(try_finally_f, try_finally_f)
    try_finally_f()
    mngr.disabled_ = 1
    chai.expect(mngr.enabled).false
    chai.expect(mngr.disabled_).equal(1)
    mngr.enableWrap(try_finally_f, try_finally_f)
    chai.expect(mngr.enabled).false
    chai.expect(mngr.disabled_).equal(1)
  })
  it ('eYo.event.Mngr: enableWrap(421)', function () {
    let mngr = new eYo.event.Mngr('foo', onr)
    var try_finally_f = () => {
      chai.expect(mngr.enabled).false
      chai.expect(mngr.disabled_).equal(420)
    }
    mngr.disabled_ = 421
    mngr.enableWrap(try_finally_f, try_finally_f)
    chai.expect(mngr.disabled).equal(421)
  })
})

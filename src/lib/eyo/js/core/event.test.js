describe ('Tests: event', function () {
  this.timeout(10000)
  let flag = new eYo.test.Flag()
  let onr = eYo.c9r.new()
  it ('Event: basic', function () {
    chai.assert(eYo.event)
    chai.assert(eYo.event.MAX_UNDO)
    chai.assert(eYo.event.UI)
    chai.assert(eYo.event._p.hasOwnProperty('BaseC9r'))
    chai.assert(eYo.event.Mngr)
  })
  it ('eYo.event.Mngr', function () {
    let mngr = new eYo.event.Mngr('mngr', onr)
    chai.expect(mngr.MAX_UNDO).equal(eYo.event.MAX_UNDO)
    mngr.MAX_UNDO_ *= 2
    chai.expect(mngr.MAX_UNDO).equal(2 * eYo.event.MAX_UNDO)
    chai.expect(!!mngr.disabled).false
    chai.expect(!!mngr.enabled).true
    mngr.disabled_ = 1
    chai.expect(!!mngr.disabled).true
    chai.expect(!!mngr.enabled).false
    mngr.disabled_ = 0
    chai.expect(!!mngr.disabled).false
    chai.expect(!!mngr.enabled).true
    chai.expect(() => {
      mngr.enabled_ = 1
    }).throw
  })
  it ('eYo.event.Mngr: wrap', function () {
    let mngr = new eYo.event.Mngr('mngr', onr)
    var flag = 0
    var try_f = () => {
      flag *= 10
      flag += 1
    }
    var finally_f = () => {
      flag *= 10
      flag += 2
    }
    flag = 0
    mngr.enableWrap(try_f, finally_f)
    chai.expect(flag).equal(12)
    flag = 0
    mngr.disableWrap(try_f, finally_f)
    chai.expect(flag).equal(12)
    flag = 0
    mngr.groupWrap(try_f, finally_f)
    chai.expect(flag).equal(12)
  })
  it ('eYo.event.Mngr: enableWrap(0)', function () {
    let mngr = new eYo.event.Mngr('mngr', onr)
    var try_f = () => {
      chai.expect(mngr.enabled).true
      chai.expect(mngr.disabled_).equal(0)
    }
    var finally_f = () => {
      chai.expect(mngr.enabled).true
      chai.expect(mngr.disabled_).equal(0)
    }
    mngr.enableWrap(try_f, finally_f)
  })
  it ('eYo.event.Mngr: enableWrap(1)', function () {
    let mngr = new eYo.event.Mngr('foo', onr)
    var try_f = () => {
      chai.expect(mngr.enabled).true
      chai.expect(mngr.disabled_).equal(0)
    }
    var finally_f = () => {
      chai.expect(mngr.enabled).false
      chai.expect(mngr.disabled_).equal(1)
    }
    mngr.disabled_ = 1
    mngr.enableWrap(try_f, finally_f)
  })
  it ('eYo.event.Mngr: enableWrap(421)', function () {
    let mngr = new eYo.event.Mngr('foo', onr)
    var try_f = () => {
      chai.expect(mngr.enabled).false
      chai.expect(mngr.disabled_).equal(420)
    }
    var finally_f = () => {
      chai.expect(mngr.enabled).false
      chai.expect(mngr.disabled_).equal(421)
    }
    mngr.disabled_ = 421
    mngr.enableWrap(try_f, finally_f)
  })
})

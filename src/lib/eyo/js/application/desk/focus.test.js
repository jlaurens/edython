describe ('Tests: focus', function () {
  it ('Focus: basic', function () {
    chai.assert(eYo.focus)
    chai.assert(eYo.focus.Mngr)
    chai.assert(eYo.focus.Main)
  })
  it ('new eYo.focus.Main', function () {
    let onr = new (eYo.o4t.makeC9r(''))()
    let main = new eYo.focus.Main(onr)
    chai.expect(main.owner).equal(onr)
  })
  let wsOne = () => {
    return new (eYo.o4t.makeC9r('', {
      properties: {
        focus_main: {
          value: new eYo.focus.Main(this)
        },
        app: {
          get () {
            return this
          }
        }
      }
    }))()
  }
  let whatOne = (mngr, on, off) => {
    return new (eYo.o4t.makeC9r('', {
      properties: {
        focus_mngr: mngr,
        ui_driver: {
          value: {
            on: on || eYo.doNothing,
            off: off || eYo.doNothing,
          },
        },
        board: true,
      },
    })) ()
  }
  it ('new eYo.focus.Mngr', function () {
    let ws = wsOne ()
    let main = ws.focus_main
    let mngr1 = new eYo.focus.Mngr(ws)
    chai.expect(main.mngrSome(m => m === mngr1)).true
    let mngr2 = new eYo.focus.Mngr(ws)
    chai.expect(main.mngrSome(m => m === mngr2)).true
    var flag = 0
    mngr1.foo = mngr2.foo = function () {
      flag += 1
    }
    main.mngrForEach(m => m.foo())
    chai.expect(flag).equal(2)
    chai.expect(main.mngrUnregister(mngr1)).true
    chai.expect(main.mngrUnregister(mngr1)).false
    chai.expect(main.mngrSome(m => m === mngr1)).false
    chai.expect(main.mngrSome(m => m === mngr2)).true
    chai.expect(main.mngrUnregister(mngr2)).true
    chai.expect(main.mngrSome(m => m === mngr2)).false
  })
  it ('Focus: brick/field/magnet', function () {
    let ws = wsOne ()
    let main = ws.focus_main
    let mngr1 = new eYo.focus.Mngr(ws)
    let mngr2 = new eYo.focus.Mngr(ws)
    main.mngr_ = mngr1
    chai.expect(main.mngr).equal(mngr1)
    main.mngr_ = mngr2
    chai.expect(main.mngr).equal(mngr2)
    let what1 = whatOne(mngr1)
    let what2 = whatOne(mngr2)
    ;['brick', 'field', 'magnet'].forEach(k => {
      main.mngr_ = mngr2
      chai.expect(main.mngr).equal(mngr2)
      let k_ = k + '_'
      mngr2[k_] = what2
      chai.expect(main[k]).equal(what2)
      main[k_] = what1
      chai.expect(main.mngr).equal(mngr1)
      chai.expect(main[k]).equal(mngr1[k]).equal(what1)
    })
  })
  it ('Focus: brick/field/magnet on/off', function () {
    let ws = wsOne ()
    let main = ws.focus_main
    let mngr = new eYo.focus.Mngr(ws)
    var flag = 0
    let brick = whatOne(mngr, () => {
      flag *= 10
      flag += 1
    }, () => {
      flag *= 10
      flag += 2
    })
    let magnet = whatOne(mngr, () => {
      flag *= 10
      flag += 3
    }, () => {
      flag *= 10
      flag += 4
    })
    let field = whatOne(mngr, () => {
      flag *= 10
      flag += 5
    }, () => {
      flag *= 10
      flag += 6
    })
    field = 0
    main.brick_ = brick
    chai.expect(flag).equal(1)
    main.magnet_ = magnet
    chai.expect(flag).equal(123)
    main.field_ = field
    chai.expect(flag).equal(12345)
    main.field_ = eYo.NA
    chai.expect(flag).equal(123456)
  })
})

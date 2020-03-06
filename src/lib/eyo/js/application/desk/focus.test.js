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
  it ('new eYo.focus.Mngr', function () {
    let ws = new (eYo.o4t.makeC9r('', {
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
    let mngr = new eYo.focus.Mngr(ws)
    chai.expect(ws.focus_main.mngrSome(m => m === mngr)).true
  })
})

NS = Object.create(null)
describe ('Tests: owned2_ui', function () {
  var wrapper = f => 
  NS.Brick = eYo.Brick
  NS.Slot = eYo.Slot
  NS.Magnet = eYo.Magnet
  eYo.Brick = eYo.Slot = eYo.Magnet = eYo.NA
  var ff = k => {
    eYo.makeClass(k, {
      owned: ['foo']
    })
    ff('Brick')
    ff('Magnet')
    ff('Slot')
    chai.assert(eYo.Brick)
    chai.assert(eYo.Magnet)
    chai.assert(eYo.Slot)
    chai.assert(eYo.Brick !== NS.Brick)
    chai.assert(eYo.Slot !== NS.Slot)
    chai.assert(eYo.Magnet !== NS.Magnet)
    f()
    eYo.Brick = NS.Brick
    eYo.Slot = NS.Slot
    eYo.Magnet = NS.Magnet
    chai.assert(eYo.Brick === NS.Brick)
    chai.assert(eYo.Slot === NS.Slot)
    chai.assert(eYo.Magnet === NS.Magnet)
  }
  it ('Owned2_ui: basic', function () {
    chai.assert(eYo.C9r.Dflt)
  })
  it ('Owned2_ui: ', function () {
    wrapper(() => {
      var onr = new eYo.Brick.Dflt()
      chai.assert(onr)
      var ond = new eYo.C9r.Owned2(onr)
      chai.assert(ond)
      chai.assert(ond.brick === onr)
      console.warn(ond.brick, ond.slot, ond.magnet)
    })
  })
})

NS = Object.create(null)
describe ('Tests: owned_ui2', function () {
  var wrapper = f => 
  NS.Brick = eYo.Brick
  NS.Slot = eYo.Slot
  NS.Magnet = eYo.Magnet
  eYo.Brick = eYo.Slot = eYo.Magnet = eYo.NA
  var ff = k => {
    eYo.Constructor.makeClass(k, {
      props: {
        owned: ['foo']
      },
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
  it ('Owned_ui2: basic', function () {
    chai.assert(eYo.UI.Dflt)
  })
  it ('Owned_ui2: ', function () {
    wrapper(() => {
      var onr = new eYo.Brick()
      chai.assert(onr)
      var ond = new eYo.UI.Owned2(onr)
      chai.assert(ond)
      chai.assert(ond.brick === onr)
      console.warn(ond.brick, ond.slot, ond.magnet)
    })
  })
})

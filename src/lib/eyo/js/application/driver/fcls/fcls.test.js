describe('Fcls driver', function() {
  this.timeout(10000)
  it ('Fcls: Basics', function () {
    chai.assert(eYo.Fcls)
    chai.assert(eYo.Fcls.Mngr)
    chai.assert(eYo.Fcls.Mngr.eyo)
    chai.assert(eYo.Fcls.Mngr.eyo.constructor === eYo.Fcls.DlgtMngr)
  })
  it ('Fcls: new', function () {
    let owner = {}
    let mngr = new eYo.Fcls.Mngr(owner)
    chai.assert(mngr)
    chai.assert(mngr.allPurposeDriver)
    chai.assert(mngr.allPurposeDriver.constructor === eYo.Fcls.Dflt)
  })
})

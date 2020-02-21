describe ('do', function () {
  it ('BASIC: Do', function () {
    chai.assert(eYo.do)
  })
  it ('eYo.do.toTitleCase', function () {
    chai.expect(eYo.do.toTitleCase('')).to.equal('')
    chai.expect(eYo.do.toTitleCase('a')).to.equal('A')
    chai.expect(eYo.do.toTitleCase('abc')).to.equal('Abc')
  })
})

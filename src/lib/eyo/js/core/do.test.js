describe ('do', function () {
  it ('BASIC: Do', function () {
    chai.assert(eYo.do)
  })
  it ('eYo.do.toTitleCase', function () {
    chai.expect(eYo.do.toTitleCase('')).equal('')
    chai.expect(eYo.do.toTitleCase('a')).equal('A')
    chai.expect(eYo.do.toTitleCase('abc')).equal('Abc')
  })
})

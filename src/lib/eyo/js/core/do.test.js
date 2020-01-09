const NS = Object.create(null)

describe ('do', function () {
  it ('BASIC: Do', function () {
    chai.assert(eYo.do)
  })
  it ('eYo.do.toTitleCase', function () {
    chai.assert(eYo.do.toTitleCase('') === '')
    chai.assert(eYo.do.toTitleCase('a') === 'A')
    chai.assert(eYo.do.toTitleCase('abc') === 'Abc')
  })
})

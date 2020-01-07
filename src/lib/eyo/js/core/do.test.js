const NS = Object.create(null)

describe ('Do', function () {
  it ('BASIC: Do', function () {
    chai.assert(eYo.Do)
  })
  it ('eYo.Do.toTitleCase', function () {
    chai.assert(eYo.Do.toTitleCase('') === '')
    chai.assert(eYo.Do.toTitleCase('a') === 'A')
    chai.assert(eYo.Do.toTitleCase('abc') === 'Abc')
  })
})

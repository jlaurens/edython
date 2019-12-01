describe('XRE', function() {
  var xre = eYo.XRE.identifier_annotated_valued
  ;[
    {},
    {annotated: true},
    {valued: true},
    {annotated: true, valued: true}
  ].forEach(args => {
    var candidate = 'x'
    if (args.annotated) {
      var annotated = 'foo'
      candidate += ': ' + annotated
    }
    if (args.valued) {
      var valued = 'bar'
      candidate += ' = ' + valued
    }
    it (`identifier_annotated_valued: ${candidate}`, function () {
      var m = XRegExp.exec(candidate, xre)
      chai.assert(m, `FAIL exec`)
      chai.assert(m.name === 'x', `FAIL ${m.name} === 'x'`)
      chai.assert(m.annotated === annotated, `FAIL ${m.annotated} === ${annotated}`)
      chai.assert(m.valued === valued, `FAIL ${m.valued} === ${valued}`)
    })
  })
})

eYo.Debug.test() // remove this line when finished

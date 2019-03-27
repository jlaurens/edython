describe('Model profile', function() {
  [
    [{}, 'identifier'],
    [{annotated: 'foo'}, 'identifier_annotated'],
    [{valued: 'bar'}, 'identifier_valued'],
    [{annotated: 'foo', valued: 'bar'}, 'identifier_annotated_valued'],
  ].forEach(args => {
    var candidate = 'x'
    args[0].annotated && (candidate += ': ' + args[0].annotated)
    args[0].valued && (candidate += ' = ' + args[0].valued)
    it (`candidate: ${candidate}`, function () {
      var p5e = eYo.T3.Profile.get(candidate)
      chai.assert(p5e.expr === eYo.T3.Expr[args[1]], `FAIL ${p5e.expr} === ${eYo.T3.Expr[args[1]]}`)
      chai.assert(p5e.name === 'x', `FAIL ${p5e.name} === 'x'`)
      chai.assert(p5e.annotated === args[0].annotated, `FAIL ${p5e.annotated} === ${args[0].annotated}`)
      chai.assert(p5e.valued === args[0].valued, `FAIL ${p5e.valued} === ${args[0].valued}`)      
    })
  })
})

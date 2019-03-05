var assert = chai.assert

describe('Primary', function () {
  it ('identifier', function () {
    var model = `<x eyo="identifier" name="k" slot="key"></x>`
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, model)
    assert(b, `MISSING block`)
  })
})

describe('Compatibility', function() {
  it('dict_comprehension', function() {
    var model = `<x eyo="dict_comprehension" xmlns="urn:edython:0.2" xmlns:eyo="urn:edython:0.2"><x eyo="identifier" name="k" slot="key"></x><x eyo="identifier" name="d" slot="datum"></x></x>`
    var model = `<x eyo="dict_comprehension" xmlns="urn:edython:0.2" xmlns:eyo="urn:edython:0.2"><x eyo="identifier" name="k" slot="key"></x><x eyo="identifier" name="d" slot="datum"></x></x>`
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, model)
    assert(b, `MISSING block`)
    console.error(b.type)
    var t = b.eyo.expression_s.target
    assert(t, 'MISSING target')
    assert(t.type === eYo.T3.Expr.identifier_annotated)
  })
})

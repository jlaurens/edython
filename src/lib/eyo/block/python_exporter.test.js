var g = eYo.GMR._PyParser_Grammar

var f = (str) => {
  var err_ret = {}
  var n = eYo.Parser.PyParser_ParseString(str, g, eYo.TKN.file_input, err_ret)
  var b = n.toBlock(Blockly.mainWorkspace)
  if (!b) {
    eYo.GMR.showtree(g, n)
  }
  chai.assert(b, `WHERE IS THE BLOCK ${n.type}`)
  eYo.Test.code(b, str)
  b.dispose()
}

describe('Python exporter', function() {
  it (`1`, function () {
    f('[1, 2, 3]')
  })
})
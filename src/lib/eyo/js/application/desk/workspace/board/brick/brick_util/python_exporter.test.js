
describe('Python exporter', function() {
  var g = eYo.gmr._PyParser_Grammar

  var f = (str) => {
    var err_ret = {}
    var n = eYo.parser.PyParser_ParseString(str, g, eYo.tkn.file_input, err_ret)
    var d = n.toBrick(eYo.App.Board)
    if (!d) {
      eYo.gmr.Showtree(g, n)
    }
    chai.assert(d, `WHERE IS THE BLOCK ${n.type}/${n.name}`)
    eYo.Test.Code(d, str)
    d.dispose()
  }

  it (`1`, function () {
    f('[1, 2, 3]')
  })
})
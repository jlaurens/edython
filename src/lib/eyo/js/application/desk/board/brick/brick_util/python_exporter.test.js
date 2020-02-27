
describe('Python exporter', function() {
  var g = eYo.py.gmr._pyParser_Grammar

  var f = (str) => {
    var err_ret = {}
    var n = eYo.py.parser.parseString(str, g, eYo.py.file_input, err_ret)
    var d = n.toBrick(eYo.eYo.board)
    if (!d) {
      eYo.py.gmr.Showtree(g, n)
    }
    chai.assert(d, `WHERE IS THE BLOCK ${n.type}/${n.name}`)
    eYo.test.Code(d, str)
    d.dispose()
  }

  it (`1`, function () {
    f('[1, 2, 3]')
  })
})
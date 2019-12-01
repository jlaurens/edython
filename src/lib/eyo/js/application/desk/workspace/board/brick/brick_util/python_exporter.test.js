
describe('Python exporter', function() {
  var g = eYo.GMR._PyParser_Grammar

  var f = (str) => {
    var err_ret = {}
    var n = eYo.Parser.PyParser_ParseString(str, g, eYo.TKN.file_input, err_ret)
    var d = n.toBrick(eYo.app.board)
    if (!d) {
      eYo.GMR.showtree(g, n)
    }
    chai.assert(d, `WHERE IS THE BLOCK ${n.type}/${n.name}`)
    eYo.Test.code(d, str)
    d.dispose()
  }

  it (`1`, function () {
    f('[1, 2, 3]')
  })
})
eYo.Debug.test() // remove this line when finished

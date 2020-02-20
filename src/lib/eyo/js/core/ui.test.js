describe ('Tests: ui', function () {
  it ('Ui: basic', function () {
    chai.assert(eYo.font)
    chai.assert(eYo.style)
    chai.assert(eYo.padding)
  })
  it ('Ui: font', function () {
    chai.assert(eYo.font.ascent)
    chai.assert(eYo.font.descent)
    chai.assert(eYo.font.xHeight)
    chai.assert(eYo.font.space)
    chai.assert(eYo.font.totalAscent)
    chai.assert(eYo.font.height)
    chai.assert(eYo.font.lineHeight)
  })
})

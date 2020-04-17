describe ('Tests: font', function () {
  it ('Font: basic', function () {
    chai.assert(eYo.font)
  })
  it ('Font: basic', function () {
    chai.expect(eYo.font.ascent).equal(13)
    chai.expect(eYo.isDef(eYo.font.familyMono)).true
    chai.expect(eYo.isDef(eYo.font.familySans)).true
    chai.expect(eYo.isDef(eYo.font.descent)).true
    chai.expect(() => {
      eYo.font.descent_ = 234
    }).throw()
    chai.expect(eYo.isDef(eYo.font.xHeight)).true
    chai.expect(() => {
      eYo.font.xHeight_ = 234
    }).throw()
    chai.expect(eYo.isDef(eYo.font.space)).true
    chai.expect(() => {
      eYo.font.space_ = 234
    }).throw()
    chai.expect(eYo.isDef(eYo.font.totalAscent)).true
    chai.expect(() => {
      eYo.font.totalAscent_ = 234
    }).throw()
    chai.expect(eYo.isDef(eYo.font.size)).true
    chai.expect(() => {
      eYo.font.size_ = 234
    }).throw()
    chai.expect(eYo.isDef(eYo.font.lineHeight)).true
    chai.expect(() => {
      eYo.font.lineHeight_ = 234
    }).throw()
    chai.expect(eYo.isDef(eYo.font.style)).true
    chai.expect(() => {
      eYo.font.style_ = 234
    }).throw()
    chai.expect(eYo.isDef(eYo.font.menuStyle)).true
    chai.expect(() => {
      eYo.font.menuStyle_ = 234
    }).throw()
  })
})

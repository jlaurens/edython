describe ('Tests: magnet', function () {
  this.timeout(10000)
  let flag = {
    v: 0,
    reset () {
      this.v = 0
    },
    push (what) {
      this.v *= 10
      this.v += what
    },
    expect (what) {
      chai.expect(this.v).equal(what)
    },
  }
  it ('Magnet: basic', function () {
    chai.expect(!eYo.magnet).false
    chai.expect(eYo.magnet._p.hasOwnProperty('Base')).true
  })
  describe('eYo.magnet.Base', function () {
    it ('eYo.magnet.new({})', function () {
      let bs = {
        changeDone () {
          flag.push(1)
        }
      }
      bs.brick = bs
      eYo.magnet.TYPES.forEach(type => {
        flag.reset()
        let m = eYo.magnet.new(bs, type, {
          init () {
            flag.push(2)
            console.error(flag.v)
          },
        })
        chai.expect(eYo.isDef(m))
        console.error(flag.v)
      })
    })
  })
})

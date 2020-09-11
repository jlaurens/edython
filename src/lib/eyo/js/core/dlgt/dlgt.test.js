describe ('POC', function () {
  this.timeout(20000)
  var flag
  beforeEach (function() {
    flag = new eYo.test.Flag()
  })
  it ('Dlgt infinite loop', function () {
    let AutoDlgt = function (ns, id, Dlgt, model) {
      Object.defineProperties(this, {
        ns: { value: eYo.isNS(ns) ? ns : eYo.NA },
        id__: {value: id},
        C9r__: { value: Dlgt },
        model__: { value: model },
      })
      let $this = this
      Object.defineProperties(Dlgt, {
        [eYo.$]: eYo.descriptorR({$ () {
          return $this
        }}.$),
        [eYo.$_p]: eYo.descriptorR({$ () {
          return $this._p
        }}.$),
      })  
    }
    let d = eYo.descriptorR({$ () {
      return this.constructor[eYo.$]
    }}.$)
    Object.defineProperties(AutoDlgt.prototype, {
      [eYo.$]: d,
    })
    let Dlgt = function (ns, key, Dlgt, model) {
      AutoDlgt.call(this, ns, key, Dlgt, model)
    } // DlgtDlgt will never change and does not need to be suclassed
    eYo.inherits(Dlgt, AutoDlgt)
    var dlgt = new AutoDlgt(eYo.c3s, 'Dlgt', Dlgt, {})
    let auto = new AutoDlgt(eYo.c3s, 'Dlgt…', AutoDlgt, {})
    chai.expect(dlgt).equal(Dlgt[eYo.$])
    chai.expect(dlgt).equal(Dlgt[eYo.$])
    chai.expect(dlgt).equal(Dlgt[eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$][eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$][eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$][eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$][eYo.$][eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$][eYo.$][eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$][eYo.$][eYo.$])
  })
})
describe ('Tests: Dlgt', function () {
  this.timeout(20000)
  var flag
  beforeEach (function() {
    flag = new eYo.test.Flag()
  })
  it ('Dlgt: new C3s()', function () {
    chai.assert(eYo.dlgt.new)
    let C3s = function () {}
    let dlgt = eYo.dlgt.new('Foo', {})
    dlgt.setC9r(C3s)
    dlgt.finalizeC9r()
    let o = new C3s()
    eYo.dlgt.declareDlgt(C3s.prototype)
    chai.expect(o.eyo$).equal(dlgt)
  })
  it ('Dlgt methodsMerge', function () {
    let C3s = function () {}
    let dlgt = eYo.dlgt.new('Foo', {})
    dlgt.setC9r(C3s)
    dlgt.finalizeC9r()
    chai.expect(dlgt.model.bar).undefined
    flag.reset()
    dlgt.methodsMerge({
      bar () {
        eYo.flag.push(1)
      },
    })
    chai.expect(dlgt.C9r_p).property('bar')
    dlgt.C9r_p.bar()
    eYo.flag.expect(1)
  })
  it ('Dlgt modelMerge', function () {
    let C3s = function () {}
    let dlgt = eYo.dlgt.new('Foo', {})
    dlgt.setC9r(C3s)
    dlgt.finalizeC9r()
    chai.expect(dlgt.model.bar).undefined
    flag.reset()
    dlgt.modelMerge({
      methods: {
        bar () {
          eYo.flag.push(1)
        },
      },
    })
    chai.expect(dlgt.C9r_p).property('bar')
    dlgt.C9r_p.bar()
    eYo.flag.expect(1)
  })
  it ('Dlgt methodsMerge - overriden', function () {
    let dlgt = eYo.dlgt.new('Foo', {})
    dlgt.setC9r(function () {})
    dlgt.finalizeC9r()
    chai.expect(dlgt.model.bar).undefined
    flag.reset()
    dlgt.methodsMerge({
      foo () {
        eYo.flag.push(1)
      },
    })
    dlgt.methodsMerge({
      foo (overriden) {
        return function () {
          overriden()
          eYo.flag.push(2)
        }
      },
    })
    dlgt.C9r_p.foo()
    eYo.flag.expect(12)
  })
})

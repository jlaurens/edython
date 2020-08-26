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
    var dlgt = new AutoDlgt(eYo.c9r, 'Dlgt', Dlgt, {})
    let auto = new AutoDlgt(eYo.c9r, 'Dlgt…', AutoDlgt, {})
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
  it ('Dlgt: new C9r()', function () {
    chai.assert(eYo.dlgt.new)
    let C9r = function () {}
    let dlgt = eYo.dlgt.new('Foo', {})
    dlgt.setC9r(C9r)
    dlgt.finalizeC9r()
    let o = new C9r()
    eYo.dlgt.declareDlgt(C9r.prototype)
    chai.expect(o.eyo).equal(dlgt)
  })
  it ('Dlgt methodsMerge', function () {
    let C9r = function () {}
    let dlgt = eYo.dlgt.new('Foo', {})
    dlgt.setC9r(C9r)
    dlgt.finalizeC9r()
    chai.expect(dlgt.model.bar).undefined
    flag.reset()
    dlgt.methodsMerge({
      bar () {
        flag.push(1)
      },
    })
    chai.expect(dlgt.C9r_p).property('bar')
    dlgt.C9r_p.bar()
    flag.expect(1)
  })
  it ('Dlgt modelMerge', function () {
    let C9r = function () {}
    let dlgt = eYo.dlgt.new('Foo', {})
    dlgt.setC9r(C9r)
    dlgt.finalizeC9r()
    chai.expect(dlgt.model.bar).undefined
    flag.reset()
    dlgt.modelMerge({
      methods: {
        bar () {
          flag.push(1)
        },
      },
    })
    chai.expect(dlgt.C9r_p).property('bar')
    dlgt.C9r_p.bar()
    flag.expect(1)
  })
  it ('Dlgt methodsMerge - overriden', function () {
    let dlgt = eYo.dlgt.new('Foo', {})
    dlgt.setC9r(function () {})
    dlgt.finalizeC9r()
    chai.expect(dlgt.model.bar).undefined
    flag.reset()
    dlgt.methodsMerge({
      foo () {
        flag.push(1)
      },
    })
    dlgt.methodsMerge({
      foo (overriden) {
        return function () {
          overriden()
          flag.push(2)
        }
      },
    })
    dlgt.C9r_p.foo()
    flag.expect(12)
  })
})

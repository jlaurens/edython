const NS = Object.create(null)

NS.k__ = 'NS'

NS.test_link = (x, foo, bar) => {
  const foo_ = foo + '_'
  const foo__ = foo + '__'
  const bar_ = bar + '_'
  const bar__ = bar + '__'
  chai.assert(x[foo__] === eYo.NA && x[foo_] === eYo.NA && x[foo] === eYo.NA)
  chai.assert(x[bar__] === eYo.NA && x[bar_] === eYo.NA && x[bar] === eYo.NA)
  x[foo__] = 421
  chai.assert(x[foo__] === 421 && x[foo_] === 421 && x[foo] === 421)
  chai.assert(x[bar__] === eYo.NA && x[bar_] === eYo.NA && x[bar] === eYo.NA)
  x[bar__] = 123
  chai.assert(x[foo__] === 421 && x[foo_] === 421 && x[foo] === 421)
  chai.assert(x[bar__] === 123 && x[bar_] === 123 && x[bar] === 123)
  chai.expect(() => {x[bar] = 421}).to.throw()
  var eyo = x.constructor.eyo
  while (eyo) {
    eyo.linkedClear_(x)
    eyo = eyo.super
  }
  chai.assert(x[foo__] === eYo.NA && x[foo_] === eYo.NA && x[foo] === eYo.NA)
  chai.assert(x[bar__] === eYo.NA && x[bar_] === eYo.NA && x[bar] === eYo.NA)
}

describe ('Dlgt', function () {
  this.timeout(10000); 
  it ('Basic', function () {
    chai.assert(eYo.makeClass)
    chai.assert(eYo.makeNS)
    chai.assert(eYo.Dlgt)
    chai.assert(eYo.Dflt)
  })
  describe('makeNS', function () {
    it ('eYo.makeNS(...)', function () {
      var NS = eYo.makeNS()
      chai.assert(NS.makeClass)
      chai.assert(NS.makeNS)
      eYo.makeNS('Foo')
      chai.assert(eYo.Foo)
      chai.assert(eYo.Foo.makeNS)
      chai.assert(eYo.Foo.makeClass)
      eYo.makeNS(NS, 'Foo')
      chai.assert(NS.Foo)
      chai.assert(NS.Foo.makeNS)
      chai.assert(NS.Foo.makeClass)
    })
    it ('NS.makeNS(...)', function () {
      var NS = eYo.makeNS()
      chai.expect(() => {
        NS.makeNS()
      }).not.to.throw()
      NS.makeNS('Foo')
      chai.assert(NS.Foo)
      chai.assert(NS.Foo.makeNS)
      chai.assert(NS.Foo.makeClass)
      var NS_ = eYo.makeNS()
      NS_['Foo'] = 421
      NS_.Foo = 123
      chai.expect(() => {
        NS.makeNS(NS_, 'Foo')
      }).to.throw()
      delete NS_.Foo
      chai.expect(() => {
        NS.makeNS(NS_, 'Foo')
      }).not.to.throw()
    })
    it ("eYo.makeClass('A1')", function () {
      var A = eYo.makeClass('A1')
      chai.assert(A)
      chai.assert(!A.constructor.superClass_)
      chai.assert(A.eyo.constructor === eYo.Dlgt)
      chai.assert(A.eyo.makeSubclass)
      delete eYo.A
    /* @param {Object} [ns] -  A namespace. Defaults to the caller, eg `eYo`.
     * @param {String} key -  The key.
     * @param {Function} [Super] -  The eventual super class. There is no default value. Give a falsy value if you do not want inheritance.
     * @param {Function} [Dlgt] -  The constructor's delegate class. Defaults to the `super_`'s delegate. Must be a subclass of `eYo.Dlgt`.
     * @param {Object} [model] -  The dictionary of parameters.
     */

    })
    it ("NS.makeClass('A')", function () {
      var NS = eYo.makeNS()
      NS.makeClass('A')
      chai.assert(NS.A)
      chai.assert(!NS.A.superClass_)
      chai.assert(NS.A.eyo.constructor === eYo.Dlgt)
      // chai.assert(false)
    })
    it ("...makeSubclass('B')", function () {
      var A = eYo.makeClass('A2')
      var B = A.makeSubclass('B')
      chai.assert(B)
      chai.assert(B.eyo.constructor === eYo.Dlgt)
      delete eYo.A
      delete eYo.B
    })
    it ("eYo.makeClass(ns, 'A', super, dlgt, model)", function () {
      var ns = eYo.makeNS()
      ns.constructor.prototype.Dlgt = 421
      chai.assert(!eYo.hasOwnProperty(ns, 'Dflt'))
      eYo.Dflt.makeSubclass(ns, 'Dflt')
      chai.assert(ns.Dflt)
      chai.assert(!eYo.hasOwnProperty(ns, 'Dlgt'))
      eYo.Dlgt.makeSubclass(ns, 'Dlgt')
      chai.assert(ns.Dlgt)
      eYo.makeClass(ns, 'A', eYo.Dflt, eYo.Dlgt, {
        init (x) {
          flag += x
        }
      })
      chai.assert(ns.A)
      chai.assert(eYo.isSubclass(ns.A, eYo.Dflt))
      chai.assert(ns.A.superClass_ === eYo.Dflt.prototype)
      chai.assert(ns.A.eyo.constructor === eYo.Dlgt)
      flag = 0
      var a = new ns.A(123)
      chai.assert(flag === 123)
    })
  })
  describe('...makeClass', function () {
    var flag_A = 0
    var expected_A = 0
    var model = () => {
      expected_A = 421
      return {
        init () {
          flag_A = 421
        }
      }
    }
    var X // the constructor created by the makeClass call
    var nsX // the expected namespace
    var SuperX // the expected Super
    var DlgtX // the expected Dlgt
    chai.assert(eYo.Dflt && eYo.Dlgt)
    var Dlgt0 = function () {
      eYo.Dlgt.apply(this, arguments)
    }
    Dlgt0.k__ = 'Dlgt0'
    eYo.inherits(Dlgt0, eYo.Dlgt)
    var Dlgt00 = function () {
      Dlgt0.apply(this, arguments)
    }
    Dlgt00.k__ = 'Dlgt00'
    eYo.inherits(Dlgt00, Dlgt0)
    var Dlgt1 = function () {
      eYo.Dlgt.apply(this, arguments)
    }
    Dlgt1.k__ = 'Dlgt1'
    eYo.inherits(Dlgt1, eYo.Dlgt)
    var SuperN = function () {}
    SuperN.k__ = 'SuperN'
    eYo.inherits(SuperN, eYo.Dflt)
    var SuperD = function () {}
    SuperD.k__ = 'SuperD'
    eYo.inherits(SuperD, eYo.Dflt)
    chai.expect(() => {
      new Dlgt1('SuperD', SuperD)
    }).not.to.throw()
    // new Dlgt1('SuperD', SuperD)
    SuperD.eyo__ = new eYo.Dlgt('SuperD', SuperD)
    SuperD.eyo__ = new Dlgt1('SuperD', SuperD)
    SuperD.eyo__ = new Dlgt0('SuperD', SuperD)
    SuperD.eyo__ = new Dlgt00('SuperD', SuperD)
    var Super0 = function () {}
    Super0.k__ = 'Super0'
    eYo.inherits(Super0, eYo.Dflt)
    chai.expect(() => {
      Super0.eyo__ = new eYo.Dlgt('Super0', Super0)
      Super0.eyo__ = new Dlgt1('Super0', Super0)
      Super0.eyo__ = new Dlgt00('Super0', Super0)
      Super0.eyo__ = new Dlgt0('Super0', Super0)
    }).not.to.throw()
    Super0.eyo__ = new Dlgt0('Super0', Super0)
    chai.assert(Super0.eyo__)
    var Super00 = function () {}
    Super00.k__ = 'Super00'
    eYo.inherits(Super00, Super0)
    chai.expect(() => {
      Super00.eyo__ = new Dlgt1(Super00, 'Super00')
      Super00.eyo__ = new Dlgt0(Super00, 'Super00')
    }).to.throw()
    Super00.eyo__ = new Dlgt00('Super00', Super00)
    var test = () => {
      chai.assert(X)
      chai.assert(X === nsX.A)
      var eyo = X.eyo__
      chai.assert(eyo)
      chai.assert(eyo.C9r === X)
      chai.assert(eyo.constructor === DlgtX, `${eyo.constructor} === ${DlgtX}`)
      if (SuperX) {
        chai.assert(X.superClass_ === SuperX.prototype)
        chai.assert(X.superClass_.constructor === SuperX)
        chai.assert(X.superClass_.constructor.eyo__ === SuperX.eyo__)
        chai.assert(eyo.super === SuperX.eyo__)
      } else {
        chai.assert(!X.superClass_)
        chai.assert(!eyo.super)
      }
      chai.expect(() => {
        new X()
      }).not.to.throw()
      chai.assert(flag_A === expected_A)
    }
    var getSuperX = (Super) => {return Super}
    var getDlgtX = (Super, Dlgt) => {
      if (Super) {
        if (Dlgt) {
          return Dlgt in ({
            [SuperD.k__]: [eYo.Dlgt, Dlgt0, Dlgt00, Dlgt1],
            [Super0.k__]: [Dlgt0, Dlgt00],
            [Super00.k__]: [Dlgt00],
          } [Super.k__]) ? Dlgt : eYo.NA
        } else {
          return {
            [Super0.k__]: Dlgt0,
            [Super00.k__]: Dlgt00,
          } [Super.k__] || eYo.Dlgt
        }
      } else {
        return Dlgt || eYo.Dlgt
      }
    }
    it ('eYo.makeClass', function () {
      var n = 0
      var getKey = () => {
        ++n
        return `A_${n}`
      }
      var getArgs = (ns, Super, Dlgt, withModel) => {
        // console.warn('eYo.makeClass:', [ns && ns.k__ || 'NA', "'A'", Super && Super.k__ || 'NA', Dlgt && Dlgt.k__ || 'NA', withModel ? 'model' : 'NA'])
        var args = [] // one element for `this`
        ns && args.push(ns)
        args.push(getKey())
        Super && args.push(Super)
        Dlgt && args.push(Dlgt)
        withModel && args.push(model())
        return args
      }
      var args = getArgs(eYo.NA, SuperD, eYo.NA, true)
      X = eYo.makeClass.apply(null, args)
      ;[eYo.NA/*, eYo, NS*/].forEach(ns => {
        // 3 possible namespaces
        nsX = ns || eYo
        ;[eYo.NA, SuperD, Super0, /*Super00*/].forEach(Super => {
          SuperX = getSuperX(Super)
          ;[eYo.NA, /*eYo.Dlgt, Dlgt0, Dlgt00, Dlgt1*/].forEach(Dlgt => {
            DlgtX = getDlgtX(Super, Dlgt)
            ;[false, true].forEach(withModel => {
              delete NS.A
              delete eYo.A
              flag_A = expected_A = 0
              var args = getArgs(ns, Super, Dlgt, withModel)
              if (DlgtX) {
                // console.warn('eYo.makeClass:', [ns && ns.k__ || 'NA', "'A'", Super && Super.k__ || 'NA', Dlgt && Dlgt.k__ || 'NA', withModel ? 'model' : 'NA'])
                chai.expect(() => {
                  X = eYo.makeClass.apply(null, args)
                }, `OK eYo.makeClass: ${ns && ns.k__ || 'NA'}, 'A', ${Super && Super.k__ || 'NA'}, ${Dlgt && Dlgt.k__ || 'NA'}, ${withModel ? 'model' : 'NA'}`).not.to.throw()
                test()
              } else {
                chai.expect(() => {
                  eYo.makeClass.apply(null, args)
                }, `KO eYo.makeClass: ${ns && ns.k__ || 'NA'}, 'A', ${Super && Super.k__ || 'NA'}, ${Dlgt && Dlgt.k__ || 'NA'}, ${withModel ? 'model' : 'NA'}`).to.throw()
              }
              delete NS.A
              delete eYo.A
            })
          })
        })
      })
    })
    // it ('NS.makeClass', function () {
    //   var NS = eYo.makeNS()
    //   NS.k__ = 'NS'
    //   var getArgs = (Super, Dlgt, withModel) => {
    //     // console.warn('eYo.makeClass:', "'A'", Super && Super.k__ || 'NA', Dlgt && Dlgt.k__ || 'NA', withModel ? 'model' : 'NA'])
    //     var args = []
    //     args.push('A')
    //     Super && args.push(Super)
    //     Dlgt && args.push(Dlgt)
    //     withModel && args.push(model())
    //     return args
    //   }
    //   ;[eYo.NA, SuperD, Super0, Super00].forEach(Super => {
    //     SuperX = getSuperX(Super)
    //     ;[eYo.NA, eYo.Dlgt, Dlgt0, Dlgt00, Dlgt1].forEach(Dlgt => {
    //       DlgtX = getDlgtX(Super, Dlgt)
    //       ;[false, true].forEach(withModel => {
    //         delete NS.A
    //         flag_A = expected_A = 0
    //         var args = getArgs(Super, Dlgt, withModel)
    //         if (DlgtX) {
    //           chai.expect(() => {
    //             X = NS.makeClass.apply(null, args)
    //           }).not.to.throw()
    //           test()
    //         } else {
    //           // console.warn('eYo.makeClass:', "'A'", Super && Super.k__ || 'NA', Dlgt && Dlgt.k__ || 'NA', withModel ? 'model' : 'NA'])
    //           chai.expect(() => {
    //             NS.makeClass.apply(null, args)
    //           }, `NS.makeClass: 'A', ${Super && Super.k__ || 'NA'}, ${Dlgt && Dlgt.k__ || 'NA'}, ${withModel ? 'model' : 'NA'}`).to.throw()
    //         }
    //         delete NS.A
    //       })
    //     })
    //   })
    // })
  })
  describe ('make', function () {
    it ('Make: Missing', function () {
      chai.assert(eYo.Dlgt)
      chai.assert(eYo.makeClass)
      chai.expect(()=>{
        eYo.makeClass()
      }).to.throw()
      chai.expect(()=>{
        eYo.makeClass('Foo')
      }).not.to.throw()
      chai.expect(()=>{
        eYo.makeClass('Foo', null, {})
      }).not.to.throw()
    })
    it ('Make: super: null', function () {
      eYo.makeClass(NS, 'A', {
         link: ['foo', 'bar'],
      })
      chai.assert(NS.A)
      const a = new NS.A()
      NS.test_link(a, 'foo', 'bar')
    })  
    it ('Make: constructor call', function () {
      var flag = 0
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        init () {
          flag += 1
        }
      })
      var a = new NS.A()
      chai.assert(flag === 1)
      a = new NS.A()
      chai.assert(flag === 2)
    })
    it ('Make: super !== null', function () {
      var flag_A = 0
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        init () {
          flag_A += 1
        },
        link: ['foo'],
      })
      chai.assert(NS.A.eyo.linked_.has('foo'))
      chai.assert(!NS.A.eyo.linked_.has('bar'))
      var flag_AB = 0
      eYo.makeClass('AB', {
        owner: NS.A,
        super: NS.A,
        init () {
          flag_AB += 1
        },
        link: ['bar'],
      })
      chai.assert(NS.A.eyo.linked_.has('foo'))
      chai.assert(!NS.A.eyo.linked_.has('bar'))
      chai.assert(!NS.A.AB.eyo.linked_.has('foo'))
      chai.assert(NS.A.AB.eyo.linked_.has('bar'))
      var ab = new NS.A.AB()
      chai.assert(flag_A === 1)
      chai.assert(flag_AB === 1)
      NS.test_link(ab, 'foo', 'bar')
    })  
    it ('Make: multi super !== null', function () {
      var flag_A = 0
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        init () {
          flag_A += 1
        },
        link: ['foo'],
     },
   })
    var flag_B = 0
    eYo.makeClass('B', {
      owner: NS,
      super: null,
      init () {
        flag_B += 1
        link: ['foo'],
     },
   })
    var flag_AA = 0
    eYo.makeClass('AA', {
      owner: NS.A,
      super: NS.A,
      init () {
        flag_AA += 1
        link: ['bar'],
     },
   })
    var flag_AB = 0
    eYo.makeClass('AB', {
      owner: NS.A,
      super: NS.A,
      init () {
        flag_AB += 1
        link: ['bar'],
     },
   })
    var flag_BA = 0
    eYo.makeClass('BA', {
      owner: NS.B,
      super: NS.B,
      init () {
        flag_BA += 1
         link: ['bar'],
      })
      var flag_BB = 0
      eYo.makeClass('BB', {
        owner: NS.B,
        super: NS.B,
        init () {
          flag_BB += 1
        },
         link: ['bar'],
      })
      var aa = new NS.A.AA()
      chai.assert(flag_A === 1)
      chai.assert(flag_AA === 1)
      NS.test_link(aa, 'foo', 'bar')
      var ab = new NS.A.AB()
      chai.assert(flag_A === 2)
      chai.assert(flag_AB === 1)
      NS.test_link(ab, 'foo', 'bar')
      var ba = new NS.B.BA()
      chai.assert(flag_B === 1)
      chai.assert(flag_BA === 1)
      NS.test_link(ba, 'foo', 'bar')
      var bb = new NS.B.BB()
      chai.assert(flag_B === 2)
      chai.assert(flag_BB === 1)
      NS.test_link(bb, 'foo', 'bar')
    })
    it ('Make: undefined owner xor super', function () {
      var flag_A = 0
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        init () {
          flag_A += 1
        }
      })
      var flag_B = 0
      eYo.makeClass('B', {
        owner: NS.A,
        init () {
          flag_B += 1
        },
         link: ['foo', 'bar'],
      })
      chai.assert(NS.A.B.superClass_.constructor === NS.A)
      var ab = new NS.A.B()
      chai.assert(flag_A === 1)
      chai.assert(flag_B === 1)
      NS.test_link(ab, 'foo', 'bar')
      eYo.makeClass('B', {
        super: NS.A,
        init () {
          flag_B += 1
        },
         link: ['foo', 'bar'],
      })
      var ab = new NS.A.B()
      chai.assert(flag_A === 2)
      chai.assert(flag_B === 2)
      NS.test_link(ab, 'foo', 'bar')      
    })
    it ('Make: init shortcuts', function () {
      var flag = 0
      var make = (init) => {
        eYo.makeClass('A', {
          owner: NS,
          super: null,
          init: init
        })
        return new NS.A()
      }
      make(function () {
        flag = 421
      })
      chai.assert(flag === 421)
      make({
        begin () {
          flag = 123
        }
      })
      chai.assert(flag === 123)
      make({
        end () {
          flag = 421
        }
      })
      chai.assert(flag === 421)
      make({
        begin () {
          flag = 123
        },
        end () {
          flag += 421
        }
      })
      chai.assert(flag === 544)
    })
    it ('Make: dispose', function () {
      var flag = 0
      eYo.makeClass('A', {
        owner: NS,
        super: null,
      })
      NS.A.eyo.disposeMake(function () {
        flag += 1
      })
      eYo.makeClass('AB', {
        owner: NS.A,
      })
      NS.A.AB.eyo.disposeMake(function () {
        flag += 10
      })
      var a = new NS.A()
      flag = 0
      a.dispose()
      chai.assert(flag === 1)
      var ab = new NS.A.AB()
      flag = 0
      ab.dispose()
      chai.assert(flag === 11)
    })
  })
  describe ('eYo.makeClass', function () {
    var testX = (X, Super, Dlgt) => {
      chai.assert(X)
      chai.assert(X.eyo)
      chai.assert(X.eyo.constructor === Dlgt)
      chai.assert(X.eyo.super === Super.eyo)
      chai.assert(X.superClass_ === Super.prototype)
      chai.assert(X.superClass_.constructor === Super)
      chai.expect(() => {
        new X()
      }).not.to.throw()
    }
    it (`eYo.makeClass('...')`, function () {
      testX(eYo.A, eYo.Dflt, eYo.Dlgt)
      delete eYo.A
    })
    it (`eYo.makeClass('...', {...})`, function () {
      delete eYo.A
      var flag_A = 0
      eYo.makeClass('A', {
        init () {
          flag_A += 1
        }
      })
      testX(eYo.A, eYo.Dflt, eYo.Dlgt)
      chai.assert(flag_A===1)
      delete eYo.A
    })
    it (`eYo.makeClass(NS, '...')`, function () {
      delete NS.A
      eYo.makeClass(NS, 'A')
      testX(NS.A, eYo.Dflt, eYo.Dlgt)
      delete NS.A
    })
    it (`eYo.makeClass(NS, '...', {...})`, function () {
      var flag_A = 0
      delete NS.A
      eYo.makeClass(NS, 'A', {
        init () {
          flag_A += 1
        }
      })
      testX(NS.A, eYo.Dflt, eYo.Dlgt)
      chai.assert(flag_A===1)
      delete NS.A
    })
    it (`eYo.makeClass('...', Super = eYo.Dflt)`, function () {
      delete eYo.A
      eYo.makeClass('A', eYo.Dflt)
      testX(eYo.A, eYo.Dflt, eYo.Dlgt)
      delete eYo.A
    })
    it (`eYo.makeClass('...', Super = eYo.Dflt, {...})`, function () {
      var flag_A = 0
      eYo.makeClass('A', eYo.Dflt, {
        init () {
          flag_A += 1
        }
      })
      testX(eYo.A, eYo.Dflt, eYo.Dlgt)
      chai.assert(flag_A===1)
      delete eYo.A
    })
    it (`eYo.makeClass(NS, '...', Super = eYo.Dflt)`, function () {
      delete NS.A
      eYo.makeClass(NS, 'A', eYo.Dflt)
      testX(NS.A, eYo.Dflt, eYo.Dlgt)
      delete NS.A
    })
    it (`eYo.makeClass(NS, '...', Super = eYo.Dflt, {...})`, function () {
      var flag_A = 0
      delete NS.A
      eYo.makeClass(NS, 'A', eYo.Dflt, {
        init () {
          flag_A += 1
        }
      })
      chai.assert(NS.A)
      chai.assert(NS.A.superClass_ === eYo.Dflt.prototype)
      chai.assert(NS.A.superClass_.constructor === eYo.Dflt)
      chai.expect(() => {
        new NS.A()
      }).not.to.throw()
      chai.assert(flag_A===1)
      delete NS.A
    })
    it (`eYo.makeClass('...', Super|eYo.Dflt, {...}?)`, function () {
      var Super = function () {}
      eYo.inherits(Super, eYo.Dflt)
      ;[eYo.Dflt, Super].forEach(Super => {
        delete eYo.A
        eYo.makeClass('A', Super)
        test(eYo.A)
        delete eYo.A
        var flag_A = 0
        eYo.makeClass('A', Super, {
          init () {
            flag_A += 1
          }
        })
        chai.assert(eYo.A)
        chai.assert(eYo.A.eyo)
        chai.assert(eYo.A.eyo.super === Super.eyo)
        chai.assert(eYo.A.superClass_ === Super.prototype)
        chai.assert(eYo.A.superClass_.constructor === Super)
        chai.expect(() => {
          new eYo.A()
        }).not.to.throw()
        chai.assert(flag_A===1)
        delete eYo.A
      })
    })
    it (`eYo.makeClass('...', Super = eYo.Dflt, {...})`, function () {
      var flag_A = 0
      eYo.makeClass('A', eYo.Dflt, {
        init () {
          flag_A += 1
        }
      })
      chai.assert(eYo.A)
      chai.assert(eYo.A.eyo)
      chai.assert(eYo.A.eyo.super === eYo.Dflt.eyo)
      chai.assert(eYo.A.superClass_ === eYo.Dflt.prototype)
      chai.assert(eYo.A.superClass_.constructor === eYo.Dflt)
      chai.expect(() => {
        new eYo.A()
      }).not.to.throw()
      chai.assert(flag_A===1)
      delete eYo.A
    })
    it (`eYo.makeClass(NS, '...', Super = eYo.Dflt)`, function () {
      delete NS.A
      eYo.makeClass(NS, 'A', eYo.Dflt)
      chai.assert(NS.A)
      chai.assert(NS.A.eyo)
      chai.assert(NS.A.eyo.super === eYo.Dflt.eyo)
      chai.assert(NS.A.superClass_ === eYo.Dflt.prototype)
      chai.assert(NS.A.superClass_.constructor === eYo.Dflt)
      chai.expect(() => {
        new NS.A()
      }).not.to.throw()
      delete NS.A
    })
    it (`eYo.makeClass(NS, '...', Super = eYo.Dflt, {...})`, function () {
      var flag_A = 0
      delete NS.A
      eYo.makeClass(NS, 'A', eYo.Dflt, {
        init () {
          flag_A += 1
        }
      })
      chai.assert(NS.A)
      chai.assert(NS.A.superClass_ === eYo.Dflt.prototype)
      chai.assert(NS.A.superClass_.constructor === eYo.Dflt)
      chai.expect(() => {
        new NS.A()
      }).not.to.throw()
      chai.assert(flag_A===1)
      delete NS.A
    })
    it (`?eYo.makeClass(NS, '...', Super, Dlgt, {...})`, function () {
      var flag_A = 0
      var flag_AB = 0
      eYo.makeClass(NS, 'A', {
        init () {
          flag_A += 1
        }
      })
      eYo.makeClass('AB', {
        owner: NS.A,
        init () {
          flag_AB += 1
        }
      })
      chai.assert(NS.A.AB.eyo.super === NS.A.eyo)
      chai.assert(!NS.A.eyo.super)
      var ab = new NS.A.AB()
    })

  })
  describe ('Link', function () {
    it ("Link: declare 'foo' and 'bar' then clear", function () {
      eYo.makeClass('A', {
        owner: NS,
        super: null,
         link: ['foo', 'bar'],
      })
      chai.assert(NS.A.eyo.C9r === NS.A)
      chai.expect(() => {
        Object.defineProperties(NS.A.prototype, {
          foo_: {
            set (after) {
            }
          }
        })
      }).to.throw()
      chai.assert(NS.A.eyo.linked_.has('foo'))
      chai.assert(NS.A.eyo.linked_.has('bar'))
      const a = new NS.A()
      NS.test_link(a, 'foo', 'bar')
    })
    it ('Link: hooks', function () {
      var flag = 0
      var foo_before = 421
      var foo_after = 123
      var test = function (before, after) {
        chai.assert(this === a)
        chai.assert(before === foo_before)
        chai.assert(after === foo_after)
      }
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        init (value) {
          this.foo__ = value
        },
        linked: {
          foo: {
            willChange (before, after) {
              test.call(this, before, after)
              return () => {
                flag = 421
              }
            },
            didChange: test
          }
        },
      })
      NS.A.prototype.fooWillChange = NS.A.prototype.fooDidChange = test
      var a = new NS.A(foo_before)
      chai.assert(a.foo === foo_before)
      a.foo_ = foo_after
      chai.assert(flag === 421)
    })
  })
  describe('Cached property', function () {
    it ('Cached: Basic', function () {
      var flag = 0
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        cached: {
          foo: {
            init () {
              return flag
            }
          }
        },
      })
      var a1 = new NS.A()
      var a2 = new NS.A()
      chai.assert(a1.foo === 0)
      flag = 1
      chai.assert(a1.foo === 0)
      chai.assert(a2.foo === 1)
      a1.fooForget()
      chai.assert(a1.foo === 1)
    })
    it ('Cached: Shortcut', function () {
      var flag = 0
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        cached: {
          foo () {
            return flag
          }
        },
      })
      var a1 = new NS.A()
      var a2 = new NS.A()
      chai.assert(a1.foo === 0)
      flag = 1
      chai.assert(a1.foo === 0)
      chai.assert(a2.foo === 1)
      a1.fooForget()
      chai.assert(a1.foo === 1)
    })
    it ('Cached: Two objects', function () {
      var flag_A1 = 0
      var flag_A2 = 1
      var flag_B1 = 2
      var flag_B2 = 3
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        cached: {
          foo1: {
            init () {
              return flag_A1
            }
          },
          foo2: {
            init () {
              return flag_A2
            }
          }
        },
      })
      eYo.makeClass('B', {
        owner: NS,
        super: null,
        cached: {
          foo1: {
            init () {
              return flag_B1
            }
          },
          foo2: {
            init () {
              return flag_B2
            }
          }
        },
      })
      var a = new NS.A()
      var b = new NS.B()
      var test = (a1, a2, b1, b2) => {
        chai.assert(a.foo1 === a1)
        chai.assert(a.foo2 === a2)
        chai.assert(b.foo1 === b1)
        chai.assert(b.foo2 === b2)
      }
      test(0, 1, 2, 3)
      flag_A1 = 10
      test(0, 1, 2, 3)
      a.foo1Forget()
      test(10, 1, 2, 3)
      flag_A2 = 11
      test(10, 1, 2, 3)
      a.foo2Forget()
      test(10, 11, 2, 3)
      flag_B1 = 12
      test(10, 11, 2, 3)
      b.foo1Forget()
      test(10, 11, 12, 3)
      flag_B2 = 13
      test(10, 11, 12, 3)
      b.foo2Forget()
      test(10, 11, 12, 13)
    })
    it ('Cached: Inherit cached', function () {
      var flag_1 = 0
      var flag_2 = 1
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        cached: {
          foo1: {
            init () {
              return flag_1
            }
          }
        },
      })
      eYo.makeClass('AB', {
        owner: NS.A,
        cached: {
          foo2: {
            init () {
              return flag_2
            }
          }
        },
      })
      var ab = new NS.A.AB()
      var test = (f1, f2) => {
        chai.assert(ab.foo1 === f1)
        chai.assert(ab.foo2 === f2)
      }
      test(0, 1)
      flag_1 = 10
      test(0, 1)
      ab.foo1Forget()
      test(10, 1)
      flag_2 = 11
      test(10, 1)
      ab.foo2Forget()
      test(10, 11)
    })
    it ('Cached: forget', function () {
      var flag = 123
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        cached: {
          foo: {
            init () {
              return flag
            },
            forget (forgetter) {
              flag += 100
              forgetter()
            }
          }
        },
      })
      var a = new NS.A()
      chai.assert(a.foo === 123)
      flag = 421
      a.fooForget()
      chai.assert(a.foo === 521)
    })
    it ('Cached: updater basic', function () {
      var flag = 421
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        cached: {
          foo: {
            init () {
              return flag
            }
          }
        },
      })
      var a = new NS.A()
      chai.assert(a.foo === 421)
      flag = 521
      a.fooUpdate()
      chai.assert(a.foo__ === 521)
    })
    it ('Cached: updater no override', function () {
      var flag = 421
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        cached: {
          foo: {
            init () {
              return flag
            },
            update (before, after, updater) {
              flag = 0
              if (before === 421) {
                flag += 1
              }
              if (after === 123) {
                flag += 10
              }
              updater()
            }
          }
        },
      })
      var a = new NS.A()
      chai.assert(a.foo === 421)
      flag = 123
      a.fooUpdate()
      chai.assert(flag === 11)
      chai.assert(a.foo === 123)
    })
    it ('Cached: updater with override', function () {
      var flag = 421
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        cached: {
          foo: {
            init () {
              return flag
            },
            update (before, after, updater) {
              updater(flag+100)
            }
          }
        },
      })
      var a = new NS.A()
      chai.assert(a.foo === 421)
      flag = 123
      a.fooUpdate()
      chai.assert(a.foo === 223)
    })
  })
  describe('Owned', function () {
    it ('Owned: Basic', function () {
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        owned: ['foo']
      })
      var a = new NS.A()
      chai.expect(() => {a.foo = 1}).to.throw()
      var B = function () {}
      B.prototype.dispose = function () {
        this.disposed_ = true
      }
      var b = new B()
      chai.assert(b.owner_ === eYo.NA)
      chai.assert(b.ownerKey_ === eYo.NA)
      chai.assert(!b.disposed_)
      a.foo_ = b
      chai.assert(b.owner_ === a)
      chai.assert(b.ownerKey_ === 'foo_')
      chai.assert(a.foo === b)
      chai.assert(a.foo_ === b)
      chai.assert(a.foo__ === b)
      a.dispose()
      chai.assert(a.foo === eYo.NA)
      chai.assert(a.foo_ === eYo.NA)
      chai.assert(a.foo__ === eYo.NA)
      chai.assert(b.owner_ === eYo.NA)
      chai.assert(b.ownerKey_ === eYo.NA)
      chai.assert(b.disposed_)
    })
    it ('Owned: Two instances', function () {
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        owned: ['foo']
      })
      var a1 = new NS.A()
      var a2 = new NS.A()
      var B = function () {}
      var b1 = new B()
      a1.foo_ = b1
      var b2 = new B()
      a2.foo_ = b2
      var test1 = (a,b) => {
        chai.assert(a.foo === b)
        chai.assert(b.owner_ === a)
        chai.assert(b.ownerKey_ === 'foo_')
      }
      test1(a1, b1)
      test1(a2, b2)
      a1.foo_ = eYo.NA
      var test2 = (a, b) => {
        chai.assert(a.foo === eYo.NA)
        chai.assert(b.owner_ === eYo.NA)
        chai.assert(b.ownerKey_ === eYo.NA)
      }
      test2(a1, b1)
      test1(a2, b2)
      a2.foo_ = b1
      test2(a1, b2)
      test1(a2, b1)
      a1.foo_ = b2
      test1(a1, b2)
      test1(a2, b1)
      a1.foo_ = b1
      test2(a2, b2)
      test1(a1, b1)
      a2.foo_ = b2
      test1(a2, b2)
      test1(a1, b1)
    })
    it ('Owned: Two keys', function () {
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        owned: ['foo1', 'foo2']
      })
      var a = new NS.A()
      var B = function () {}
      B.prototype.dispose = function () {
        this.disposed_ = true
      }
      var b1 = new B()
      var b2 = new B()
      var test = (foo1, foo2, bb1, bb2) => {
        chai.assert(a.foo1 === foo1)
        chai.assert(a.foo2 === foo2)
        foo1 && chai.assert(foo1.owner_ === a)
        foo1 && chai.assert(foo1.ownerKey_ === 'foo1_')
        foo2 && chai.assert(foo2.owner_ === a)
        foo2 && chai.assert(foo2.ownerKey_ === 'foo2_')
        bb1 && chai.assert(bb1.owner_ === eYo.NA)
        bb1 && chai.assert(bb1.ownerKey_ === eYo.NA)
        bb2 && chai.assert(bb2.owner_ === eYo.NA)
        bb2 && chai.assert(bb2.ownerKey_ === eYo.NA)
      }
      test()
      a.foo1_ = b1
      test(b1)
      a.foo2_ = b2
      test(b1, b2)
      a.foo1_ = b2
      test(b2, eYo.NA, b1)
      a.foo2_ = b2
      test(eYo.NA, b2, b1)
      a.foo2_ = b1
      test(eYo.NA, b1, b2)
      a.foo1_ = b1
      test(b1, eYo.NA, b2)
      a.foo2_ = b2
      test(b1, b2)
      a.foo2_ = eYo.NA
      test(b1, eYo.NA, b2)
      a.foo1_ = eYo.NA
      test(eYo.NA, eYo.NA, b1, b2)
    })
    it ('Owned: Inherit', function () {
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        owned: ['foo']
      })
      eYo.makeClass('AB', {
        owner: NS.A,
        owned: ['bar']
      })
      var a = new NS.A()
      var ab = new NS.A.AB()
      var B = function () {}
      B.prototype.dispose = function () {
        this.disposed_ = true
      }
      var foo = new B()
      var bar = new B()
      var test = (af, abf, abb, f, b) => {
        chai.assert(a.foo === af)
        af && chai.assert(af.owner_ === a)
        af && chai.assert(af.ownerKey_ === 'foo_')
        chai.assert(ab.foo === abf)
        chai.assert(ab.bar === abb)
        abf && chai.assert(abf.owner_ === ab)
        abf && chai.assert(abf.ownerKey_ === 'foo_')
        abb && chai.assert(abb.owner_ === ab)
        abb && chai.assert(abb.ownerKey_ === 'bar_')
        f && chai.assert(f.owner_ === eYo.NA)
        f && chai.assert(f.ownerKey_ === eYo.NA)
        b && chai.assert(b.owner_ === eYo.NA)
        b && chai.assert(b.ownerKey_ === eYo.NA)
      }
      test(eYo.NA, eYo.NA, eYo.NA, foo, bar)
      ab.foo_ = foo
      test(eYo.NA, foo, eYo.NA, bar)
      ab.bar_ = bar
      test(eYo.NA, foo, bar)
      ab.bar_ = eYo.NA
      test(eYo.NA, foo, eYo.NA, bar)
      ab.foo_ = eYo.NA
      test(eYo.NA, eYo.NA, eYo.NA, foo, bar)
      ab.bar_ = bar
      test(eYo.NA, eYo.NA, bar, foo)
      ab.foo_ = foo
      test(eYo.NA, foo, bar)
      a.foo_ = foo
      test(foo, eYo.NA, bar)
      ab.foo_ = foo
      test(eYo.NA, foo, bar)
      a.foo_ = bar
      test(bar, foo)
      ab.bar_ = bar
      test(eYo.NA, foo, bar)
      ab.foo_ = bar
      test(eYo.NA, bar, eYo.NA, foo)
      ab.bar_ = foo
      test(eYo.NA, bar, foo)
      ab.foo_ = foo
      test(eYo.NA, foo, eYo.NA, bar)
    })
    it ('Owned: hooks', function () {
      var flag = 0
      var B = function (value) {
        this.value_ = value
      }
      var foo_before = new B(421)
      var foo_after = new B(123)
      var test = function (before, after) {
        chai.assert(this === a)
        chai.assert(before === foo_before, `Unexpected ${before} !=== ${foo_before}`)
        chai.assert(after === foo_after)
      }
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        init (value) {
          this.foo__ = value
        },
        owned: {
          foo: {
            willChange (before, after) {
              console.warn
              after && test.call(this, before, after)
              return () => {
                flag += 100
              }
            },
            didChange: test,
            disposer (foo) {
              console.warn("HERE")
              flag += foo
            }
          }
        },
      })
      NS.A.prototype.fooWillChange = NS.A.prototype.fooDidChange = test
      var a = new NS.A(foo_before)
      chai.assert(a.foo === foo_before)
      flag = 0
      a.foo_ = foo_after
      chai.assert(flag === 100)
      // Dispose
      B.prototype.dispose = function (what) {
        flag += 1000
      }
      foo_before = foo_after
      foo_after = eYo.NA
      flag = 0
      a.dispose(123)
      console.warn(flag)
      chai.assert(flag === 1100)
    })
  })
  describe ('Clonable', function () {
    it ('Clonable: Basic', function () {
      var B = function (value) {
        this.value_ = value
      }
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        clonable: {
          foo () {
            return new B()
          }
        }
      })
      B.prototype.dispose = function () {
        this.disposed_ = true
      }
      B.prototype.set = function (other) {
        this.value_ = other.value_
      }
      B.prototype.equals = function (other) {
        return this.value_ === other.value_
      }
      Object.defineProperty(B.prototype, 'clone', {
        get () {
          return new B(this.value_)
        }
      })
      var a = new NS.A()
      chai.expect(() => {a.foo = 1}).to.throw()
      var b = new B(421)
      var bb = new B(123)
      chai.assert(a.foo !== eYo.NA)
      chai.assert(a.foo.value_ === eYo.NA)
      a.foo_ = b
      chai.assert(a.foo.value_ === b.value_)
      chai.assert(a.foo.value_ === 421)
      a.foo_ = bb
      chai.assert(a.foo.value_ === bb.value_)
      chai.assert(a.foo.value_ === 123)
      b = a.foo__
      a.dispose()
      chai.assert(a.foo__ === eYo.NA)
      chai.expect(() => {
        a.foo_ === eYo.NA
      }).to.throw()
      chai.expect(() => {
        a.foo === eYo.NA
      }).to.throw()
      chai.assert(b.disposed_)
    })
    it ('Clonable: hooks', function () {
      var flag = 0
      var B = function (owner, value) {
        this.value_ = value
      }
      B.prototype.dispose = function () {
        this.disposed_ = true
      }
      B.prototype.set = function (other) {
        this.value_ = other.value_
      }
      B.prototype.equals = function (other) {
        return this.value_ === other.value_
      }
      Object.defineProperty(B.prototype, 'clone', {
        get () {
          return new B(this.value_)
        }
      })
      var foo_before = new B(421)
      var foo_after = new B(123)
      var test = function (before, after) {
        chai.assert(this === a)
        chai.assert(before === foo_before)
        chai.assert(after === foo_after)
      }
      eYo.makeClass('A', {
        owner: NS,
        super: null,
        clonable: {
          foo: {
            init () {
              return foo_before
            },
            willChange (before, after) {
              test.call(this, before, after)
              return () => {
                flag = 421
              }
            },
            didChange: test
          }
        },
      })
      NS.A.prototype.fooWillChange = NS.A.prototype.fooDidChange = test
      var a = new NS.A(foo_before)
      chai.assert(a.foo__ === foo_before)
      chai.assert(a.foo.equals(foo_before))
      a.foo_ = foo_after
      chai.assert(a.foo__ === foo_before)
      chai.assert(a.foo.equals(foo_after))
    })
  })
  describe ('No collision', function () {
    var params = (props) => {
      return {
        key: 'A',
        owner: NS,
        super: null,
    }
  }
  it ('No collision: link + cached', function () {
    chai.expect(() => {
      eYo.makeClass(params({
        link: ['foo'],
        cached: {
          foo () {}
        }
      }).to.throw()
    })
    it ('No collision: link + owned', function () {
      chai.expect(() => {
        eYo.makeClass(params({
          link: ['foo'],
          owned: ['foo'],
        }))
      }).to.throw()
    })
    it ('No collision: link + clonable', function () {
      chai.expect(() => {
        eYo.makeClass(params({
          link: ['foo'],
          clonable: {
            foo () {}
          },
        }))
      }).to.throw()
    })
    it ('No collision: cached + owned', function () {
      chai.expect(() => {
        eYo.makeClass(params({
          cached: {
            foo () {}
          },
          owned: ['foo'],
        }))
      }).to.throw()
    })
    it ('No collision: cached + clonable', function () {
      chai.expect(() => {
        eYo.makeClass(params({
          cached: {
            foo () {}
          },
          clonable: {
            foo () {}
          },
        }))
      }).to.throw()
    })
    it ('No collision: owned + clonable', function () {
      chai.expect(() => {
        eYo.makeClass(params({
          owned: ['foo'],
          clonable: {
            foo () {}
          },
        }))
      }).to.throw()
    })
  })
  it ('Override rules', function () {
    var ns
    var make = (k, Super, props) => {
      eYo.isF(Super) ? ns.makeClass(k, Super, {
    }) : ns.makeClass(k, Super)
  }
  var makeA = (props) => {
    make ('A', props)
  }
  var makeAB = (props) => {
    make ('AB', ns.A, props)
  }
  var props = {
    owned: ['foo'],
    cached: {
      foo () {}
    },
    clonable: {
      foo () {}
    },
    linked: ['foo'],
  }
  var ok = () => {
    new ns.AB()
  }
  var okThrow = () => {
    chai.expect(ok).to.throw()
  }
  var expect = {
    owned: {
      owned: okThrow,
      cached: okThrow,
      clonable: okThrow,
      linked: ok,
    },
    cached: {
      owned: okThrow,
      cached: okThrow,
      clonable: okThrow,
      linked: ok,
    },
    clonable: {
      owned: okThrow,
      cached: okThrow,
      clonable: okThrow,
      linked: ok,
    },
    linked: {
      owned: ok,
      cached: ok,
      clonable: ok,
      linked: ok,
    },
  }
  Object.keys(props).forEach(l => {
    Object.keys(props).forEach(r => {
      ns = eYo.makeNS()
      makeA({
        [l]: props[l]
      })
        makeAB({
          [r]: props[r]
        })
        expect[l][r]()
      })
    })
  })
  it ('Computed', function () {
    var flag = 123
    var ns = eYo.makeNS()
    ns.makeClass('C', {
      computed: {
        foo () {
          return 10 * flag + 1
        },
      },
      cached: {
        bar () {
          return flag
        }
      },
    })
    flag = 421
    var a = new NS.C()
    chai.assert(a.bar === 421)
    chai.assert(a.foo === 4211)
    chai.expect(() => {
      a.foo = 421
    }).to.throw()
    chai.expect(() => {
      a.foo_ = 421
    }).to.throw()
    chai.expect(() => {
      a.foo__ = 421
    }).to.throw()
    chai.expect(() => {
      a.foo_
    }).to.throw()
    chai.expect(() => {
      a.foo__
    }).to.throw()
  })
  it ('Constructor: ownedForEach', function () {
    eYo.makeClass('A', {
      owner: NS,
      super: null,
      owned: {
        foo () {}
      }
    })
    eYo.makeClass('AB', {
      owner: NS.A,
      owned: {
        bar () {}
      }
    })
    var a = new NS.A()
    a.foo_ = {value: 1}
    var ab = new NS.A.AB()
    ab.foo_ = {value: 1}
    ab.bar_ = {value: 10}
    var flag = 0
    a.ownedForEach(x => flag += x.value)
    chai.assert(flag === 1)
    flag = 0
    ab.ownedForEach(x => flag += x.value)
    chai.assert(flag === 11)
  })
  it ('Constructor: cachedForEach', function () {
    eYo.makeClass('A', {
      owner: NS,
      super: null,
      cached: {
        foo () {return 1}
      }
    })
    eYo.makeClass('AB', {
      owner: NS.A,
      cached: {
        bar () {return 10}
      }
    })
    var a = new NS.A()
    var ab = new NS.A.AB()
    var flag = 0
    a.cachedForEach(x => flag += x)
    chai.assert(flag === 1)
    flag = 0
    ab.cachedForEach(x => flag += x)
    chai.assert(flag === 11)
  })
  it ('Constructor: linkedForEach', function () {
    eYo.makeClass('A', {
      owner: NS,
      super: null,
      link: ['foo']
    })
    eYo.makeClass('AB', {
      owner: NS.A,
      link: ['bar']
    })
    var a = new NS.A()
    a.foo_ = 1
    var flag = 0
    a.linkedForEach(x => flag += x)
    chai.assert(flag === 1)
    var ab = new NS.A.AB()
    ab.foo_ = 1
    ab.bar_ = 10
    flag = 0
    ab.linkedForEach(x => flag += x)
    chai.assert(flag === 11)
  })
  it ('Constructor: clonableForEach', function () {
    eYo.makeClass('A', {
      owner: NS,
      super: null,
      clonable: {
        foo () {
          return new B()
        }
      }
    })
    eYo.makeClass('AB', {
      owner: NS.A,
      clonable: {
        bar () {
          return new B()
        }
      }
    })
    var B = function (value) {
      this.value_ = value
    }
    B.prototype.dispose = function () {
      this.disposed_ = true
    }
    B.prototype.set = function (other) {
      this.value_ = other.value_
    }
    B.prototype.equals = function (other) {
      return this.value_ === other.value_
    }
    Object.defineProperty(B.prototype, 'clone', {
      get () {
        return new B(this.value_)
      }
    })
    var a = new NS.A()
    a.foo_ = new B(1)
    chai.assert(a.foo.value_ === 1)
    var flag = 0
    a.clonableForEach(x => flag += x.value_)
    chai.assert(flag === 1)
    var ab = new NS.A.AB()
    ab.foo_ = new B(1)
    chai.assert(ab.foo.value_ === 1)
    ab.bar_ = new B(10)
    chai.assert(ab.bar.value_ === 10)
    flag = 0
    ab.clonableForEach(x => flag += x.value_)
    chai.assert(flag === 11)
  })
  it ('Constructor: makeSubclass', function () {
    var flag = 0
    eYo.makeClass('Foo', {
      key: 'A',
      owner: NS,
      super: null,
      init() {
        flag += 1
      }
    })
    chai.assert(NS.A.makeSubclass)
    NS.A.makeSubclass('AB', {
      owner: NS.A,
      init() {
        flag += 10
      },
    })
    chai.assert(NS.A.AB.superClass_ === NS.A.prototype)
    flag = 0
    var ab = new NS.A.AB()
    chai.assert(flag === 11)
  })
  it ('Constructor: eyo setter', function () {
    eYo.makeClass('A', {
      owner: NS,
      super: null
    })
    chai.assert(NS.A.eyo.constructor === eYo.Dlgt)
    chai.expect(() => {
      NS.A.eyo = null
    }).to.throw()
    chai.expect(() => {
      NS.A.eyo_ = null
    }).to.throw()
  })
  it ('Constructor: dlgt key', function () {
    var flag = 0
    var dlgt = function (c9r, key, model) {
      dlgt.superClass_.constructor.call(this, c9r, key, model)
      flag += 1
    }
    eYo.inherits(dlgt, eYo.Dlgt)
    eYo.makeClass(NS, 'A', null, dlgt, {
      init() {
        flag += 1
      }
    })
    chai.assert(flag === 1)
    chai.assert(NS.A.eyo.constructor === dlgt)
    chai.assert(NS.A.makeSubclass)
    NS.A.makeSubclass('AB', {
      owner: NS.A,
    })
    chai.assert(flag === 2)
    chai.assert(NS.A.AB.eyo.constructor === dlgt)
  })
})

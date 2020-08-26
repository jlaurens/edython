eYo.provide('test')

eYo.TESTING = true

eYo.test.randN = (N = 2, snap) => {
  if (N === true || N === false) {
    [N, snap] = [2, N]
  }
  return snap
    ? Math.round(Math.random()*10**N)
    : Math.round(Math.random()*10**(2*N))/10**(N)
}

if (eYo.geom) {
  eYo.geom.randPoint = (N, snap) => {
    if (N === true || N === false) {
      [N, snap] = [2, N]
    }
    return new eYo.geom.Point(snap, eYo.test.randN(N, snap), eYo.test.randN(N, snap))
  }

  eYo.geom.randSize = (N, snap) => {
    if (N === true || N === false) {
      [N, snap] = [2, N]
    }
    return new eYo.geom.Size(snap, eYo.test.randN(N, snap), eYo.test.randN(N, snap))
  }
  
  eYo.geom.randRect = (N, snap) => {
    if (N === true || N === false) {
      [N, snap] = [2, N]
    }
    return new eYo.geom.Rect(snap, eYo.test.randN(N, snap), eYo.test.randN(N, snap), eYo.test.randN(N, snap), eYo.test.randN(N, snap))  
  }
}

eYo.test.Flag = function (what) {
  return {
    v: what ? what.toString() : '',
    reset (what) {
      this.v = what && what.toString() || ''
    },
    push (...$) {
      $.forEach(what => {
        what && (this.v += what.toString())
      })
      return this.v
    },
    unshift (...$) {
      $.forEach(what => {
        what && (this.v = what.toString() + this.v)
      })
      return this.v
    },
    expect (what) {
      if (eYo.isRA(what)) {
        what = what.map(x => x.toString())
        var ans = chai.expect(what).include(this.v || '0')
      } else if (eYo.isDef(what)) {
        if (eYo.isDef(what.v)) {
          ans = chai.expect(what.v).equal(this.v)
        } else {
          ans = chai.expect(what.toString()).equal(this.v || '0')
        }
      } else {
        ans = chai.expect('').equal(this.v)
      }
      this.reset()
      return ans
    },
    decorate (tag, f) {
      let flag = this
      return new Proxy(f, {
        apply(target, this$, args) {
          flag.push(tag)
          return target.apply(this$, args)
        }
      })
    }
  }
}

chai.Assertion.addProperty('eyo_Num', function () {
  this.assert(
    eYo.isNum(this._obj)
    , 'expected #{this} to be a finite number'
    , 'expected #{this} to not be a finite number'
  )
})

chai.Assertion.addProperty('eyo_Str', function () {
  this.assert(
    eYo.isStr(this._obj)
    , 'expected #{this} to be a string'
    , 'expected #{this} to not be a string'
  )
})

chai.Assertion.addProperty('eyo_NS', function () {
  this.assert(
    eYo.isNS(this._obj)
    , 'expected #{this} to be a namespace'
    , 'expected #{this} to not be a namespace'
  )
})

chai.Assertion.addProperty('eyo_Dlgt', function () {
  this.assert(
    eYo.isaDlgt(this._obj),
    'expected #{this} to be an eYo constructor',
    'expected #{this} to not be an eYo constructor',
  )
})

chai.Assertion.addProperty('eyo_C9r', function () {
  this.assert(
    eYo.isC9r(this._obj),
    'expected #{this} to be an eYo constructor',
    'expected #{this} to not be an eYo constructor',
  )
})

chai.Assertion.addProperty('eyo_F', function () {
  this.assert(
    eYo.isF(this._obj),
    'expected #{this} to be a function',
    'expected #{this} to not be a function',
  )
})

chai.Assertion.addProperty('eyo_C9rBase', function () {
  this.eyo_C9r
  let C9r = this._obj
  this.assert(
    C9r[eYo.$].ns.C9rBase === C9r,
    'expected #{this} to be a base eYo constructor',
    'expected #{this} to not be a base eYo constructor',
  )
})

chai.Assertion.addProperty('eyo_point', function () {
  this.assert(
    this._obj instanceof eYo.geom.Point
    , 'expected #{this} to be a eYo.geom.Point'
    , 'expected #{this} to not be a eYo.geom.Point'
  )
})

chai.Assertion.addProperty('eyo_size', function () {
  this.assert(
    this._obj instanceof eYo.geom.Size
    , 'expected #{this} to be a eYo.geom.Size'
    , 'expected #{this} to not be a eYo.geom.Size'
  )
})

chai.Assertion.addProperty('eyo_rect', function () {
  this.assert(
    this._obj instanceof eYo.geom.Rect
    , 'expected #{this} to be a eYo.geom.Rect'
    , 'expected #{this} to not be a eYo.geom.Rect'
  )
})

/**
 * Makes a comparator function to be passed to deepEqual.
 * The returned function will return `eYo.INVALID` if both arguments are not numbers,
 * indicating that deepEqual should proceed with other equality checks
 */
eYo.test.makeComparator = function (tol = 0) {
  return function (left, right) {
    try {
      return eYo.equals(left, right, tol) // true if left ~ right, false otherwise
    } catch (e) {
      return eYo.INVALID
    }
  }
}

chai.Assertion.addMethod('hasProxyTarget', function (expected) {
  var actual = this._obj
  let target = actual[eYo.$$.target]
  this.assert(
    target === expected
    , `expected #{this}/${actual}[eYo.$$.target] to be ${expected} but got ${target}`
    , `expected #{this}/${actual}[eYo.$$.target] not to be ${expected}`
    , expected        // expected
    , target   // actual
  )
})

chai.use(function (_chai, utils) {
  // language chain method
  chai.Assertion.addMethod('eqlDrvr', function (drvr) {
    this.hasProxyTarget(drvr[eYo.$$.target])
  })
  chai.Assertion.addMethod('eqlPoint', function (expected) {
    var actual = this._obj

    // first, our instanceof check, shortcut
    new chai.Assertion(actual).instanceof(eYo.geom.Point)
    // new chai.Assertion(expected).instanceof(eYo.geom.Point)
    let tol = utils.flag(this, 'tolerance')
    let equal = eYo.test.makeComparator(tol)
    let yorn = ['c', 'l'].map(k => {
      let ans = equal(actual[k], expected[k])
      return [eYo.isVALID(ans) && ans, k]
    })
    let success = yorn.filter(k => k[0]).map(k => k[1])
    let failure = yorn.filter(k => !k[0]).map(k => k[1])
    this.assert(
      failure.length === 0
      , `expected #{this}/${failure[0]} to be ${expected[failure[0]]} but got ${actual[failure[0]]}`
      , `expected #{this}/${success[0]} not to be ${expected[success[0]]}`
      , expected[failure[0]]        // expected
      , actual[failure[0]]   // actual
    );
  })
  chai.Assertion.addMethod('eqlSize', function (expected) {
    var actual = this._obj

    // first, our instanceof check, shortcut
    new chai.Assertion(actual).instanceof(eYo.geom.Size)
    // new chai.Assertion(expected).instanceof(eYo.geom.Point)
    let tol = utils.flag(this, 'tolerance')
    let equal = eYo.test.makeComparator(tol)
    let yorn = ['w', 'h'].map(k => {
      let ans = equal(actual[k], expected[k])
      return [eYo.isVALID(ans) && ans, k]
    })
    let success = yorn.filter(k => k[0]).map(k => k[1])
    let failure = yorn.filter(k => !k[0]).map(k => k[1])
    this.assert(
      failure.length === 0
      , `expected #{this}/${failure[0]} to be ${expected[failure[0]]} but got ${actual[failure[0]]}`
      , `expected #{this}/${success[0]} not to be ${expected[success[0]]}`
      , expected[failure[0]]        // expected
      , actual[failure[0]]   // actual
    );
  })
  chai.Assertion.addMethod('eqlRect', function (expected) {
    var actual = this._obj
    // first, our instanceof check, shortcut
    new chai.Assertion(actual).instanceof(eYo.geom.Rect)
    // new chai.Assertion(expected).instanceof(eYo.geom.Rect)
    let tol = utils.flag(this, 'tolerance')
    let equal = eYo.test.makeComparator(tol)
    let yorn = ['c', 'l', 'w', 'h'].map(k => {
      let ans = equal(actual[k], expected[k])
      return [eYo.isVALID(ans) && ans, k]
    })
    let success = yorn.filter(k => k[0]).map(k => k[1])
    let failure = yorn.filter(k => !k[0]).map(k => k[1])
    this.assert(
      failure.length === 0
      , `expected #{this}/${failure[0]} to be ${expected[failure[0]]} but got ${actual[failure[0]]}`
      , `expected #{this}/${success[0]} not to be ${expected[success[0]]}`
      , expected[failure[0]]        // expected
      , actual[failure[0]]   // actual
    )
  })
  // language chain method
  chai.Assertion.addMethod('eqlSpan', function (expected) {
    var actual = this._obj
    // first, our instanceof check, shortcut
    new chai.Assertion(actual).instanceof(eYo.span.C9rBase)
    ;[
      'c_padding',
      'header',
      'footer',
      'suite',
      'foot',
    ].forEach(k => eYo.isNA(expected[k]) && (expected[k] = 0))
    eYo.isNA(expected.c_min) && (expected.c_min = actual.c_min_0)
    eYo.isNA(expected.c) && (expected.c = expected.c_min + expected.c_padding)
    eYo.isNA(expected.main) && (expected.main = 1)
    eYo.isNA(expected.hole) && (expected.hole = actual.isGroup && (!actual.right || actual.right.isComment) ? 1 : 0)
    eYo.isNA(expected.l) && (expected.l = 
      actual.isGroup
        ? expected.main + expected.hole + expected.suite
        : actual.isStmt
          ? expected.header + expected.main + expected.footer
          : expected.main
    )
    let tol = utils.flag(this, 'tolerance')
    let equal = eYo.test.makeComparator(tol)
    let yorn = [
      'c_min',
      'c_padding',
      'c',
      'main',
      'header',
      'footer',
      'suite',
      'l',
      'foot',
    ].map(k => {
      let ans = equal(actual[k], expected[k])
      return [eYo.isVALID(ans) && ans, k]
    })
    let success = yorn.filter(k => k[0] && k)
    let failure = yorn.filter(k => !k[0] && k)
    this.assert(
      failure.length === 0
      , `expected #{this}/${failure[0]} to be ${expected[failure[0]]} but got ${actual[failure[0]]}`
      , `expected #{this}/${success[0]} not to be ${expected[success[0]]}`
      , expected[failure[0]]        // expected
      , actual[failure[0]]   // actual
    )
  })
  // language chain method
  chai.Assertion.addMethod('eyo_Subclass', function (C9r) {
    this.eyo_C9r
    chai.expect(C9r).eyo_C9r
    var actual = this._obj[eYo.$].name
    var expected = C9r && C9r[eYo.$].name
    this.assert(
      eYo.isSubclass(this._obj, C9r)
      , `expected ${actual} to be a subclass of ${expected}\n`
      , `expected ${actual} not to be a subclass of ${expected}\n`
    )
  })
})




/**
 * Sets global tolerance and returns a function to be passed to chai.use
 * @see http://chaijs.com/guide/plugins/
 */

chai.use(function (chai, utils) {
  let Assertion = chai.Assertion
  let flag = utils.flag
  /**
   * Returns a new shallow equality function to override
   * .equal, .equals, .eq that tests 'almost' equality
   * if both values are numbers and a 'tolerance' flag is set.
   * Sends to deep equality check if deep flag is set
   */
  function overrideAssertEqual (_super) {
    return function assertEqual (val, msg) {
      if (msg) flag(this, 'message', msg)

      var deep = flag(this, 'deep')
      var tol = flag(this, 'tolerance')
      
      if (deep) {
        return this.eql(val)
      }
      if (tol) {
        var yorn = eYo.test.makeComparator(tol)(val,this._obj)
        if (yorn !== null) {
          this.assert(yorn,
            `expected ${val && val.description || val} to almost equal ${this._obj && this._obj.description || this._obj}`,
            `expected ${val && val.description || val} to not almost equal ${this._obj &&this._obj.description || this._obj}`,
            val,
            this._obj
          )
          return
        }
      }
      return _super.apply(this, arguments)
    }
  }
  /**
   * Returns a new deep equality function to override
   * .eql, .eqls that tests 'almost' equality if both corresponding
   * values are numbers and tolerance flag is set
   */
  function overrideAssertEql (_super) {
    return function assertEql (val, msg) {
      if (msg) flag(this, 'message', msg)

      if (eYo.geom) {
        if (eYo.geom.Size && this._obj instanceof eYo.geom.Size) {
          return this.eqlSize(val)
        }
        if (eYo.geom.Point && this._obj instanceof eYo.geom.Point) {
          return this.eqlPoint(val)
        }
        if (eYo.geom.Rect && this._obj instanceof eYo.geom.Rect) {
          return this.eqlRect(val)
        }
      }
      if (eYo.span) {
        if (eYo.span.C9rBase && this._obj instanceof eYo.span.C9rBase) {
          return this.eqlSpan(val)
        }
      }
      return _super.apply(this, arguments)
    }
  }
  /**
   * .almost() method. To be used at the end of the chain like:
   * expect(4).to.not.be.almost(5, 1.5). Simply adds tolerance flag then calls
   * .equal. This will redirect to .eql if deep flag set
   */
  function almostEqual (val, tolerance = eYo.EPSILON) {
    flag(this, 'tolerance', tolerance)
    return this.equal(val)
  }

  /**
   * .almost chainable property to be used like:
   * expect(3.99999999).to.almost.equal(4). Simply adds
   * tolerance flag to be read by equality checking methods
   */
  function almostChainable () {
    flag(this, 'tolerance', eYo.EPSILON)
  }

  Assertion.addChainableMethod('almost', almostEqual, almostChainable)

  chai.Assertion.addMethod('eyo_subclass', function (expected) {
    var actual = this._obj
    this.assert(
      eYo.isSubclass(actual, expected),
      `expected ${actual && actual.eyo$ && actual.eyo$.name} to be a subclass of ${expected && expected.eyo$ && expected.eyo$.name}`,
      `expected ${actual && actual.eyo$ && actual.eyo$.name} not to be a subclass of ${expected && expected.eyo$ && expected.eyo$.name}`,
      expected,
      actual
    )
  })

  Assertion.overwriteMethod('equal', overrideAssertEqual)
  Assertion.overwriteMethod('equals', overrideAssertEqual)
  Assertion.overwriteMethod('eq', overrideAssertEqual)

  Assertion.overwriteMethod('eql', overrideAssertEql)
  Assertion.overwriteMethod('eqls', overrideAssertEql)
})

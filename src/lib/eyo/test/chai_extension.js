eYo.test || eYo.makeNS('test')

chai.Assertion.addProperty('eyo_point', function () {
  this.assert(
      this._obj instanceof eYo.geom.Point
    , 'expected #{this} to be a eYo.geom.Point'
    , 'expected #{this} to not be a eYo.geom.Point'
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
 * Sets global tolerance and returns a function to be passed to chai.use
 * @see http://chaijs.com/guide/plugins/
 */
eYo.test.chaiAlmost = function (standardTolerance = eYo.geom.EPSILON) {
 

  /**
   * Makes a comparator function to be passed to deepEqual.
   * The returned function will return null if both arguments are not numbers,
   * indicating that deepEqual should proceed with other equality checks
   */
  function comparator (tol) {
    let test = (left, right) => Math.abs(left - right) <= tol * (Math.abs(left) + Math.abs(right) + 1)
    return function (left, right) {
      try {
        return test(left, right)
      } catch (e) {
        return null
      }
    }
  }
  return function (chai, utils) {
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
          var yorn = comparator(tol)(val,this._obj)
          if (yorn !== null) {
            this.assert(yorn,
              `expected ${val.description} to almost equal ${this._obj.description}`,
              `expected ${val.description} to not almost equal ${this._obj.description}`,
              val.description,
              this._obj.description
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

        var tol = flag(this, 'tolerance')

        if (tol) {
          var yorn = true
          var ans
          var obj = this._obj
          if ((ans = comparator(tol)(val.w, obj.w, tol)) !== null) {
            yorn = ans && yorn
            if ((ans = comparator(tol)(val.h, obj.h, tol)) !== null) {
              yorn = ans && yorn
              if ((ans = comparator(tol)(val.c, obj.c, tol)) !== null) {
                yorn = ans && yorn
                if ((ans = comparator(tol)(val.l, obj.l, tol)) !== null) {
                  yorn = ans && yorn
                  this.assert(
                    yorn,
                    'expected #{this} to deeply almost equal #{exp}',
                    'expected #{this} to not deeply almost equal #{exp}',
                    val,
                    this._obj
                  )
                  return
                }
              }
            }
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
    function method (val, tolerance = standardTolerance) {
      flag(this, 'tolerance', tolerance)
      return this.equal(val)
    }

    /**
     * .almost chainable property to be used like:
     * expect(3.99999999).to.almost.equal(4). Simply adds
     * tolerance flag to be read by equality checking methods
     */
    function chainingBehavior () {
      flag(this, 'tolerance', standardTolerance)
    }

    Assertion.addChainableMethod('almost', method, chainingBehavior)

    Assertion.overwriteMethod('equal', overrideAssertEqual)
    Assertion.overwriteMethod('equals', overrideAssertEqual)
    Assertion.overwriteMethod('eq', overrideAssertEqual)

    Assertion.overwriteMethod('eql', overrideAssertEql)
    Assertion.overwriteMethod('eqls', overrideAssertEql)
  }
}

chai.use(eYo.test.chaiAlmost())


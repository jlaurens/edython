describe ('Tests: data', function () {
  this.timeout(10000)
  let flag = {
    v: 0,
    reset (what) {
      this.v = what || 0
    },
    push (...$) {
      $.forEach(what => {
        what && (this.v = parseInt(this.v.toString() + what.toString()))
      })
    },
    expect (what) {
      let ans = chai.expect(this.v).equal(what)
      this.reset()
      return ans
    },
  }
  it ('Data: basic', function () {
    chai.assert(eYo.data)
  })
  it ('eYo.xre.function_builtin_before', function () {
    let test = (s, builtin, before) => {
      let m = XRegExp.exec(s, eYo.xre.function_builtin_before)
      chai.assert(m)
      chai.assert(!m.builtin === !builtin, `${m.builtin}`)
      chai.assert(!m.before === !before, `${m.before}`)
    }
    test('function ( builtin, before ) ...', true, true)
    test('function ( builtin, after ) ...', true, false)
    test('function ( before, after ) ...', false, true)
    test('function ( after ) ...', false, false)
  })
  it ('eYo.data.handle_validate: #', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    // builtin, before, after, no super
    var onr = new (ns.makeC9r(''))()
    eYo.data.handle_validate(Object.getPrototypeOf(onr), 'foo', {
      validate (builtin, before, after) {
        return 1000000 * builtin() + 1000 * before + after
      }
    })
    chai.expect(onr.validate(123, 421)).equal(421123421)
    // before, after, no super
    var onr = new (ns.makeC9r(''))()
    eYo.data.handle_validate(Object.getPrototypeOf(onr), 'foo', {
      validate (before, after) {
        return 1000 * before + after
      }
    })
    chai.expect(onr.validate(123, 421)).equal(123421)
    // after, no super
    var onr = new (ns.makeC9r(''))()
    eYo.data.handle_validate(Object.getPrototypeOf(onr), 'foo', {
      validate (after) {
        return after
      }
    })
    chai.expect(onr.validate(123, 421)).equal(421)
    // Same with super
    var flag = 0
    ns.BaseC9r_p.validate = function (before, after) {
      flag = before + 1000 * after
      return after
    }
    // builtin, before, after, no super
    var onr = new (ns.makeC9r(''))()
    flag = 0
    chai.expect(onr.validate(123, 421)).equal(421)
    chai.expect(flag).equal(421123)
    eYo.data.handle_validate(Object.getPrototypeOf(onr), 'foo', {
      validate (builtin, before, after) {
        return 1000000 * builtin() + 1000 * before + after
      }
    })
    flag = 0
    chai.expect(onr.validate(123, 421)).equal(421123421)
    chai.expect(flag).equal(421123)
    // before, after, no super
    var onr = new (ns.makeC9r(''))()
    eYo.data.handle_validate(Object.getPrototypeOf(onr), 'foo', {
      validate (before, after) {
        return 1000 * before + after
      }
    })
    flag = 0
    chai.expect(onr.validate(123, 421)).equal(123421)
    chai.expect(flag).equal(123421123)
    // after, no super
    var onr = new (ns.makeC9r(''))()
    eYo.data.handle_validate(Object.getPrototypeOf(onr), 'foo', {
      validate (after) {
        return after
      }
    })
    flag = 0
    chai.expect(onr.validate(123, 421)).equal(421)
    chai.expect(flag).equal(421123)
  })
  it ('eYo.data.handle_validateIncog: #', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    // builtin, before, after, no super
    var onr = new (ns.makeC9r(''))()
    eYo.data.handle_validateIncog(Object.getPrototypeOf(onr), 'foo', {
      validateIncog (builtin, before, after) {
        return 1000000 * builtin() + 1000 * before + after
      }
    })
    chai.expect(onr.validateIncog(123, 421)).equal(421123421)
    // before, after, no super
    var onr = new (ns.makeC9r(''))()
    eYo.data.handle_validateIncog(Object.getPrototypeOf(onr), 'foo', {
      validateIncog (before, after) {
        return 1000 * before + after
      }
    })
    chai.expect(onr.validateIncog(123, 421)).equal(123421)
    // after, no super
    var onr = new (ns.makeC9r(''))()
    eYo.data.handle_validateIncog(Object.getPrototypeOf(onr), 'foo', {
      validateIncog (after) {
        return after
      }
    })
    chai.expect(onr.validateIncog(123, 421)).equal(421)
    // Same with super
    var flag = 0
    ns.BaseC9r_p.validateIncog = function (before, after) {
      flag = before + 1000 * after
      return after
    }
    // builtin, before, after, no super
    var onr = new (ns.makeC9r(''))()
    flag = 0
    chai.expect(onr.validateIncog(123, 421)).equal(421)
    chai.expect(flag).equal(421123)
    eYo.data.handle_validateIncog(Object.getPrototypeOf(onr), 'foo', {
      validateIncog (builtin, before, after) {
        return 1000000 * builtin() + 1000 * before + after
      }
    })
    flag = 0
    chai.expect(onr.validateIncog(123, 421)).equal(421123421)
    chai.expect(flag).equal(421123)
    // before, after, no super
    var onr = new (ns.makeC9r(''))()
    eYo.data.handle_validateIncog(Object.getPrototypeOf(onr), 'foo', {
      validateIncog (before, after) {
        return 1000 * before + after
      }
    })
    flag = 0
    chai.expect(onr.validateIncog(123, 421)).equal(123421)
    chai.expect(flag).equal(123421123)
    // after, no super
    var onr = new (ns.makeC9r(''))()
    eYo.data.handle_validateIncog(Object.getPrototypeOf(onr), 'foo', {
      validateIncog (after) {
        return after
      }
    })
    flag = 0
    chai.expect(onr.validateIncog(123, 421)).equal(421)
    chai.expect(flag).equal(421123)
  })
  it ('eYo.data.handle_synchronize: #', function () {
    var flag = 0
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    // builtin, after, no super
    var onr = new (ns.makeC9r(''))()
    eYo.data.handle_synchronize(Object.getPrototypeOf(onr), 'foo', {
      synchronize (builtin, after) {
        builtin(666)
        flag += after
      }
    })
    onr.synchronize(421)
    chai.expect(flag).equal(421)
    // after, no super
    var onr = new (ns.makeC9r(''))()
    eYo.data.handle_synchronize(Object.getPrototypeOf(onr), 'foo', {
      synchronize (after) {
        flag += after
      }
    })
    flag = 0
    onr.synchronize(421)
    chai.expect(flag).equal(421)
    // Same with super
    var flag = 0
    ns.BaseC9r_p.synchronize = function (after) {
      flag *= 1000
      flag += after
    }
    // builtin, after, super
    var onr = new (ns.makeC9r(''))()
    flag = 0
    onr.synchronize(421)
    chai.expect(flag).equal(421)
    eYo.data.handle_synchronize(Object.getPrototypeOf(onr), 'foo', {
      synchronize (builtin, after) {
        flag *= 1000
        flag += 2 * after
        builtin(666)
      }
    })
    flag = 0
    onr.synchronize(421)
    chai.expect(flag).equal(842666)
    // after, super
    var onr = new (ns.makeC9r(''))()
    eYo.data.handle_synchronize(Object.getPrototypeOf(onr), 'foo', {
      synchronize (after) {
        flag *= 1000
        flag += 2 * after
      }
    })
    flag = 0
    onr.synchronize(421)
    chai.expect(flag).equal(842)
  })
  it ('eYo.data.handle_change:', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    // only test with `willChange`.
    var flag
    let test = (model, f) => {
      flag = 0
      let onr = new (ns.makeC9r(''))()
      eYo.data.handle_change(Object.getPrototypeOf(onr), 'foo', model)
      onr.willChange(1,2)
      chai.expect(flag).equal(f)
    }
    test({
      willChange (builtin, before, after) {
        builtin()
        flag *= 10
        flag += before
        flag *= 10
        flag += after
      }
    }, 12)
    test({
      willChange (builtin, after) {
        builtin()
        flag *= 10
        flag += 5
        flag *= 10
        flag += after
      }
    }, 52)
    test({
      willChange (builtin, before) {
        builtin()
        flag *= 10
        flag += before
        flag *= 10
        flag += 6
      }
    }, 16)
    test({
      willChange (builtin) {
        builtin()
        flag *= 10
        flag += 5
        flag *= 10
        flag += 6
      }
    }, 56)
    test({
      willChange (before, after) {
        flag *= 10
        flag += before
        flag *= 10
        flag += after
      }
    }, 12)
    // Without builtin
    test({
      willChange (after) {
        flag *= 10
        flag += 5
        flag *= 10
        flag += after
      }
    }, 52)
    test({
      willChange (before) {
        flag *= 10
        flag += before
        flag *= 10
        flag += 6
      }
    }, 16)
    test({
      willChange () {
        flag *= 10
        flag += 5
        flag *= 10
        flag += 6
      }
    }, 56)
    // With super
    ns.BaseC9r_p.willChange = function (before, after) {
      flag *= 10
      flag += before
      flag *= 10
      flag += after
    }
    test({
      willChange (builtin, before, after) {
        builtin()
        flag *= 10
        flag += before
        flag *= 10
        flag += after
      }
    }, 1212)
    test({
      willChange (builtin, after) {
        builtin()
        flag *= 10
        flag += 5
        flag *= 10
        flag += after
      }
    }, 1252)
    test({
      willChange (builtin, before) {
        builtin()
        flag *= 10
        flag += before
        flag *= 10
        flag += 6
      }
    }, 1216)
    test({
      willChange (builtin) {
        builtin()
        flag *= 10
        flag += 5
        flag *= 10
        flag += 6
      }
    }, 1256)
    test({
      willChange (before, after) {
        flag *= 10
        flag += before
        flag *= 10
        flag += after
      }
    }, 12)
    // Without builtin
    test({
      willChange (after) {
        flag *= 10
        flag += 5
        flag *= 10
        flag += after
      }
    }, 52)
    test({
      willChange (before) {
        flag *= 10
        flag += before
        flag *= 10
        flag += 6
      }
    }, 16)
    test({
      willChange () {
        flag *= 10
        flag += 5
        flag *= 10
        flag += 6
      }
    }, 56)
  })
  it ('eYo.data.handle_load', function () {
    // only willLoad
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    var flag
    let test = (f, what, expected) => {
      let model = {
        willLoad: f,
      }
      eYo.data.modelExpand(model, 'data.foo')
      let O = new (ns.makeC9r(''))()
      eYo.data.handle_load(Object.getPrototypeOf(O), 'foo', model)
      flag = 0
      O.willLoad(what)
      chai.expect(flag).equal(expected)
    }
    test(function (what) {
      flag = what
    }, 7, 7)
  })
  it ('eYo.data.handle_fromField', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    var flag
    let test = (f, what, expected) => {
      let model = {
        fromField: f,
      }
      eYo.data.modelExpand(model, 'data.foo')
      let O = new (ns.makeC9r(''))()
      eYo.data.handle_fromField(Object.getPrototypeOf(O), 'foo', model)
      flag = 0
      O.fromField(what)
      chai.expect(flag).equal(expected)
    }
    test(function (what) {
      flag = what
    }, 7, 7)
    ns.BaseC9r_p.fromField = function (what) {
      flag *= 10
      flag += what
    }
    test(function (what) {
      flag = what
    }, 7, 7)
    test(function (builtin, what) {
      builtin(5)
      flag *= 10
      flag += what
    }, 7, 57)
    test(function (what) {
      this.fromField(5)
      flag *= 10
      flag += what
    }, 7, 57)
  })
  it ('eYo.data.handle_toField', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    var flag
    let test = (f, before, after, expected) => {
      let model = {
        toField: f,
      }
      eYo.data.modelExpand(model, 'data.foo')
      let O = new (ns.makeC9r(''))()
      eYo.data.handle_toField(Object.getPrototypeOf(O), 'foo', model)
      flag = 0
      chai.expect(O.toField(before)).equal(after)
      chai.expect(flag).equal(expected)
    }
    test(function (what) {
      flag *= 100
      flag += what
      return 2 * what
    }, 3, 6, 3)
    ns.BaseC9r_p.toField = function (what) {
      flag *= 100
      flag += 2 * what
      return 3 * what
    }
    test(function (what) {
      flag *= 100
      flag += what
      return 2 * what
    }, 3, 6, 3)
    test(function (builtin, what) {
      builtin(what)
      flag *= 100
      flag += what
      return 2 * what
    }, 3, 6, 603)
    test(function (what) {
      this.toField(what)
      flag *= 100
      flag += what
      return 2 * what
    }, 3, 6, 603)
    test(function (builtin, what) {
      flag *= 100
      flag += what
      return 2 * builtin(what)
    }, 3, 18, 306)
    test(function (what) {
      flag *= 100
      flag += what
      return 2 * this.toField(what)
    }, 3, 18, 306)
  })
  it ('eYo.data.handle_fromText', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    var flag
    let test = (f, what, expected) => {
      let model = {
        fromText: f,
      }
      eYo.data.modelExpand(model, 'data.foo')
      let O = new (ns.makeC9r(''))()
      eYo.data.handle_fromText(Object.getPrototypeOf(O), 'foo', model)
      flag = 0
      O.fromText(what)
      chai.expect(flag).equal(expected)
    }
    test(function (what) {
      flag = what
    }, 7, 7)
    ns.BaseC9r_p.fromText = function (what) {
      flag *= 10
      flag += what
    }
    test(function (what) {
      flag = what
    }, 7, 7)
    test(function (builtin, what) {
      builtin(5)
      flag *= 10
      flag += what
    }, 7, 57)
    test(function (what) {
      this.fromText(5)
      flag *= 10
      flag += what
    }, 7, 57)
  })
  it ('eYo.data.handle_toText', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    let test = (f, before, after, expected) => {
      let model = {
        toText: f,
      }
      eYo.data.modelExpand(model, 'data.foo')
      let O = new (ns.makeC9r(''))()
      eYo.data.handle_toText(Object.getPrototypeOf(O), 'foo', model)
      flag.reset()
      chai.expect(O.toText(before)).equal(after)
      flag.expect(expected)
    }
    test(function (what) {
      flag.push(what)
      return 2 * what
    }, 3, 6, 3)
    ns.BaseC9r_p.toText = function (what) {
      flag.push(2*what % 10)
      return 3 * what
    }
    test(function (what) {
      flag.push(what)
      return 2 * what
    }, 3, 6, 3)
    test(function (builtin, what) {
      builtin(what)
      flag.push(what)
      return 2 * what
    }, 3, 6, 63)
    test(function (what) {
      this.toText(what)
      flag.push(what)
      return 2 * what
    }, 3, 6, 63)
    test(function (builtin, what) {
      flag.push(what)
      return 2 * builtin(what)
    }, 3, 18, 36)
    test(function (what) {
      flag.push(what)
      return 2 * this.toText(what)
    }, 3, 18, 36)
  })
  it ('eYo.data.handle_consolidate', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    var flag
    let test = (f, what, expected) => {
      let model = {
        consolidate: f,
      }
      eYo.data.modelExpand(model, 'data.foo')
      let O = new (ns.makeC9r(''))()
      eYo.data.handle_consolidate(Object.getPrototypeOf(O), 'foo', model)
      flag = 0
      O.changer = {}
      O.consolidate(what)
      chai.expect(flag).equal(expected)
      flag = 0
      O.changer.level = 1
      O.consolidate(what)
      chai.expect(flag).equal(0)
    }
    test(function (what) {
      flag = what
    }, 7, 7)
  })
  it ('eYo.data.handle_filter', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    var flag
    ns.BaseC9r_p.filter = function (what) {
      flag *= 100
      flag += 2 * what
      return 3 * what
    }
    let test = (f, before, after, expected) => {
      let model = {
        filter: f,
      }
      eYo.data.modelExpand(model, 'data.foo')
      chai.assert(eYo.isDef(model.filter))
      let O = new (ns.makeC9r(''))()
      eYo.data.handle_filter(Object.getPrototypeOf(O), 'foo', model)
      flag = 0
      chai.expect(O.filter(before)).equal(after)
      chai.expect(flag).equal(expected)
    }
    test(eYo.NA, 2, 6, 4)
    test(function (what) {
      flag *= 100
      flag += 3 * what
      return 4 * what
    }, 2, 8, 6)
    test(function (what) {
      flag *= 100
      flag += 3 * what
      return this.filter(what)
    }, 2, 6, 604)
    test(function (what) {
      let ans = this.filter(what)
      flag *= 100
      flag += 3 * what
      return ans
    }, 2, 6, 406)
  })
  it ('Data: aliases', function () {
    /*aliases: {
      owner: 'brick',
      'brick.changer': 'changer',
      'brick.type': 'brickType',
      'brick.data': 'data',
      'brick.ui': 'ui',
      'brick.ui_driver': 'ui_driver',
    },*/
    let onr = eYo.o4t.singleton({
      properties: {
        changer: 1,
        type: 2,
        data: 3,
        ui: 4,
        ui_driver: 5,
      },
    })
    chai.expect(onr.eyo.model.properties.changer.value).equal(1)
    chai.expect(onr.changer).equal(1)
    chai.expect(onr.type).equal(2)
    let d = eYo.data.new(onr, 'foo', {})
    chai.assert(d.brick_p)
    chai.assert(d.changer_p)
    chai.assert(d.brickType_p)
    chai.assert(d.data_p)
    chai.assert(d.ui_p)
    chai.assert(d.ui_driver_p)
    chai.expect(d.brick).equal(onr)
    chai.expect(d.changer).equal(1)
    chai.expect(d.brickType).equal(2)
    chai.expect(d.data).equal(3)
    chai.expect(d.ui).equal(4)
    chai.expect(d.ui_driver).equal(5)
  })
  it('Data model', function () {
    let ns = eYo.data.makeNS()
    ns.makeBaseC9r()

    let test = (key, value) => {
      let one = ns.singleton({eyo: true}, {
        [key]: value,
      })
      chai.expect(one.model[key]).equal(value)
    }
    ;['after', // key || [keys]
    'all'].forEach(key => {
      let one = ns.singleton({eyo: true}, {
        [key]: 421,
      })
      chai.expect(one.model[key]).eql([421])
    })
    ;[
      'order', // INTEGER
      'main', // BOOLEAN
      'placeholder', // STRING
      'noUndo', // true
    ].forEach(key => {
      let one = ns.singleton({eyo: true}, {
        [key]: 421,
      })
      chai.expect(one.model[key]).equal(421)
    })
    ;[
      // 'init', // WHATEVER
      'validate', // (...) => {} || false || true,
      'validateIncog', // (...) => {}
      'willChange', // (...) => {}
      'isChanging', // (...) => {}
      'didChange', // (...) => {}
      'willUnchange', // (...) => {}
      'isUnchanging', // (...) => {}
      'didUnchange', // (...) => {}
      'willLoad', // () => {}
      'didLoad', // () => {}
      'consolidate', // (...) => {}
      'fromType', // () => {}
      'fromField', // () => {}
      'toField', // () => {}
    ].forEach(key => {
      let one = ns.singleton({eyo: true}, {
        [key]: function () {},
      })
      chai.expect(eYo.isF(one.model[key])).true
      let second = ns.singleton({eyo: true}, {
        [key]: 421,
      })
      chai.expect(eYo.isDef(second.model[key])).false
    })
    var one = ns.singleton({eyo: true}, {
      init: 421,
    })
    chai.expect(eYo.isF(one.model.init)).true
    var one = ns.singleton({eyo: true}, {
      xml: 421,
    })
    chai.expect(one.model.xml).not.equal(421)
    one = ns.singleton({eyo: true}, {
      xml: {},
    })
    chai.expect(one.model.xml).eql({})
    ;[
      'save', // () => {}
      'load', // () => {}
    ].forEach(key => {
      let one = ns.singleton({eyo: true}, {
        xml: {
          [key]: function () {},
        },
      })
      chai.expect(eYo.isF(one.model.xml[key])).true
      let second = ns.singleton({eyo: true}, {
        xml: {
          [key]: 421,
        },
      })
      chai.expect(eYo.isDef(second.model.xml[key])).false
    })
    /*
    eYo.model.allowModelPaths({
  [eYo.model.ROOT]: 'data',
  'data': '\\w+',
  'data\\.\\w+': [
    'after', // key || [keys]
    'order', // INTEGER
    'all', // TYPE || [TYPE], // last is expected
    'main', // BOOLEAN
    'placeholder', // STRING
    'noUndo', // true
    'xml', // {}
    'init', // WHATEVER
    'validate', // (...) => {} || false || true,
    'validateIncog', // (...) => {}
    'willChange', // (...) => {}
    'isChanging', // (...) => {}
    'didChange', // (...) => {}
    'willUnchange', // (...) => {}
    'isUnchanging', // (...) => {}
    'didUnchange', // (...) => {}
    'willLoad', // () => {}
    'didLoad', // () => {}
    'consolidate', // (...) => {}
    'fromType', // () => {}
    'fromField', // () => {}
    'toField', // () => {}
  ],
  'data\\.\\w+\.xml': [
    'save', 'load',
  ],
})

eYo.model.allowModelShortcuts({
  'data\\.\\w+\\.init': (before, p) => {
    if (!eYo.isF(before)) {
      return function () {
        return before
      }
    }
  },
  'data\\.\\w+\\.(?:all|after)': (before, p) => {
    if (!eYo.isRA(before)) {
      return [before]
    }
  },
  'data\\.\\w+\\.(?:didLoad|after)': (before, p) => {
    if (!eYo.isF(before)) {
      return eYo.INVALID
    }
  },
  'data\\.\\w+\\.xml\\.(?:toText|fromText|toField|fromField|save|load)': (before, p) => {
    if (!eYo.isF(before)) {
      return eYo.INVALID
    }
  },
})
*/
  })
})

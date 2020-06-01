describe ('Tests: data', function () {
  this.timeout(20000)
  let flag = new eYo.test.Flag()
  let onr = eYo.c9r.new()
  var ns, d
  let new_ns = () => {
    flag.reset()
    ns = eYo.data.makeNS()
    ns.makeBaseC9r()
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
    ;['validate', 'validateIncog'].forEach(K => {
      new_ns()
      let test = (expect, f) => {
        d = ns.new({
          [K]: f,
        }, 'd', onr)
        chai.expect(d[K](1, 2)).equal(3)
        flag.expect(expect)
      }
      test(123, function (builtin, before, after) {
        flag.push(before, after)
        after = builtin(after + 1)
        flag.push(after)
        return after
      }) 
      eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
        flag.push(before + 2, after + 1)
      })
      test(12345, function (builtin, before, after) {
        flag.push(before, after)
        after = builtin(after + 1)
        flag.push(after + 2)
        return after
      })
      test(123456, function (builtin, before, after) {
        flag.push(before, after)
        after = builtin(after + 1)
        flag.push(before + 4, after + 3)
        return after
      })
      new_ns()
      test(12, function(before, after) {
        flag.push(before, after)
        return after + 1
      })
      new_ns()
      test(2, function (after) {
        flag.push(after)
        return after + 1
      })
      eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
        flag.push(before + 2, after + 1)
      })
      test(123456, function (before, after) {
        flag.push(before, after)
        after = this[K](after + 1)
        flag.push(before + 4, after + 3)
        return after
      })
      new_ns()
      eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
        flag.push(before + 2, after + 1)
      })
      test(123456, function (after) {
        flag.push(1, after)
        after = this[K](after + 1)
        flag.push(5, after + 3)
        return after
      })
    })
  })
  it ('eYo.data.handle_synchronize: #', function () {
    let K = 'synchronize'
    flag.reset()
    let test = (expect, f) => {
      d = ns.new({
        [K]: f,
      }, 'd', onr)
      d[K](1, 2)
      flag.expect(expect)
    }
    new_ns()
    test(0, true)
    test(0, false)
    test(0, eYo.doNothing)
    test(12, function (after) {
      flag.push(1, after)
    })
    test(12, function (before, after) {
      flag.push(before, after)
    })
    test(12, function (after) {
      flag.push(1, after)
      this[K]()
    })
    test(12, function (before, after) {
      flag.push(before, after)
      this[K]()
    })
    test(12, function (builtin, before, after) {
      flag.push(before, after)
    })
    test(12, function (builtin, before, after) {
      flag.push(before, after)
      builtin()
    })
    new_ns()
    eYo.test.extend(ns.BaseC9r_p, 'doSynchronize', function(before, after) {
      flag.push(before + 2, after + 2)
    })
    test(12, function (after) {
      flag.push(1, after)
    })
    test(12, function (before, after) {
      flag.push(before, after)
    })
    test(1234, function (after) {
      flag.push(1, after)
      this[K]()
    })
    test(1234, function (before, after) {
      flag.push(before, after)
      this[K]()
    })
    test(12, function (builtin, before, after) {
      flag.push(before, after)
    })
    test(1234, function (builtin, before, after) {
      flag.push(before, after)
      builtin()
    })
  })
  it ('eYo.data.handle_change:', function () {
    ;[
      'willChange', 'didChange', 'isChanging',
      'willUnchange', 'didUnchange', 'isUnchanging',
    ].forEach(K => {
      flag.reset()
      let test = (expect, f) => {
        d = ns.new({
          [K]: f,
        }, 'd', onr)
        d[K](1, 2)
        flag.expect(expect)
      }
      new_ns()
      test(12, function (after) {
        flag.push(1, after)
      })
      test(12, function (before, after) {
        flag.push(before, after)
      })
      test(12, function (builtin, after) {
        flag.push(1, after)
      })
      test(12, function (builtin, after) {
        flag.push(1, after)
        builtin()
      })
      test(12, function (after) {
        flag.push(1, after)
        this[K]()
      })
      test(12, function (before, after) {
        flag.push(before, after)
        this[K]()
      })
      test(12, function (builtin, before, after) {
        flag.push(before, after)
      })
      test(12, function (builtin, before, after) {
        flag.push(before, after)
        builtin()
      })
      new_ns()
      eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
        flag.push(before + 2, after + 2)
      })
      test(12, function (after) {
        flag.push(1, after)
      })
      test(12, function (before, after) {
        flag.push(before, after)
      })
      test(12, function (builtin, after) {
        flag.push(1, after)
      })
      test(1234, function (builtin, after) {
        flag.push(1, after)
        builtin()
      })
      test(1234, function (after) {
        flag.push(1, after)
        this[K]()
      })
      test(1234, function (before, after) {
        flag.push(before, after)
        this[K]()
      })
      test(12, function (builtin, before, after) {
        flag.push(before, after)
      })
      test(1234, function (builtin, before, after) {
        flag.push(before, after)
        builtin()
      })

    })
  })
  it ('eYo.data.handle_consolidate', function () {
    let b3k = eYo.o4t.new({
      properties: {
        changer: {
          value () {
            return eYo.changer.new({
              wrap (f) {
                flag.push(1)
                f()
              },    
            }, this, 'changer')
          },
        },
      },
    }, 'b3k', onr)  
    let d = eYo.data.new({}, 'd', b3k)
    chai.assert(b3k.changer)
    chai.expect(d.owner).equal(d.brick).equal(b3k)
    chai.expect(d.changer).equal(b3k.changer)
    let K = 'consolidate'
    flag.reset()
    let test = (expect, f) => {
      d = ns.new({
        [K]: f,
      }, 'd', b3k)
      d[K]()
      flag.expect(expect)
    }
    new_ns()
    test(1, function () {
      flag.push(1)
    })
    test(1, function () {
      flag.push(1)
      this[K]()
    })
    test(1, function (builtin) {
      flag.push(1)
    })
    test(1, function (builtin) {
      flag.push(1)
      builtin()
    })
    new_ns()
    eYo.test.extend(ns.BaseC9r_p, K, function() {
      flag.push(2)
    })
    test(1, function () {
      flag.push(1)
    })
    test(12, function () {
      flag.push(1)
      this[K]()
    })
    test(1, function (builtin) {
      flag.push(1)
    })
    test(12, function (builtin) {
      flag.push(1)
      builtin()
    })
  })
  it ('eYo.data.handle_filter', function () {
    let K = 'filter'
    flag.reset()
    let test = (expect, f) => {
      d = ns.new({
        [K]: f,
      }, 'd', onr)
      d[K](1)
      flag.expect(expect)
    }
    new_ns()
    test(1, function (after) {
      flag.push(after)
    })
    test(1, function (after) {
      flag.push(after)
      this[K](after)
    })
    test(1, function (builtin, after) {
      flag.push(after)
    })
    test(1, function (builtin, after) {
      flag.push(after)
      builtin()
    })
    new_ns()
    eYo.test.extend(ns.BaseC9r_p, K, function(after) {
      flag.push(after + 1)
    })
    test(1, function (after) {
      flag.push(after)
    })
    test(12, function (after) {
      flag.push(after)
      this[K](after)
    })
    test(1, function (builtin, after) {
      flag.push(after)
    })
    test(12, function (builtin, after) {
      flag.push(after)
      builtin()
    })
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
    let b3k = eYo.o4t.singleton(onr, {
      properties: {
        changer: 1,
        type: 2,
        data: 3,
        ui: 4,
        ui_driver: 5,
      },
    })
    chai.expect(b3k[eYo.$].model.properties.changer.value).equal(1)
    chai.expect(b3k.changer).equal(1)
    chai.expect(b3k.type).equal(2)
    let d = eYo.data.new({}, 'd', b3k)
    chai.assert(d.brick_p)
    chai.assert(d.changer_p)
    chai.assert(d.brickType_p)
    chai.assert(d.data_p)
    chai.assert(d.ui_p)
    chai.assert(d.ui_driver_p)
    chai.expect(d.brick).equal(b3k)
    chai.expect(d.changer).equal(1)
    chai.expect(d.brickType).equal(2)
    chai.expect(d.data).equal(3)
    chai.expect(d.ui).equal(4)
    chai.expect(d.ui_driver).equal(5)
  })
//   it('Data model', function () {
//     let ns = eYo.data.makeNS()
//     ns.makeBaseC9r()

//     let test = (key, value) => {
//       let one = ns.singleton({[eYo.$]: true}, {
//         [key]: value,
//       })
//       chai.expect(one.model[key]).equal(value)
//     }
//     ;['after', // key || [keys]
//     'all'].forEach(key => {
//       let one = ns.singleton({[eYo.$]: true}, {
//         [key]: 421,
//       })
//       chai.expect(one.model[key]).eql([421])
//     })
//     ;[
//       'order', // INTEGER
//       'main', // BOOLEAN
//       'placeholder', // STRING
//       'noUndo', // true
//     ].forEach(key => {
//       let one = ns.singleton({[eYo.$]: true}, {
//         [key]: 421,
//       })
//       chai.expect(one.model[key]).equal(421)
//     })
//     ;[
//       // 'init', // WHATEVER
//       'validate', // (...) => {} || false || true,
//       'validateIncog', // (...) => {}
//       'willChange', // (...) => {}
//       'isChanging', // (...) => {}
//       'didChange', // (...) => {}
//       'willUnchange', // (...) => {}
//       'isUnchanging', // (...) => {}
//       'didUnchange', // (...) => {}
//       'willLoad', // () => {}
//       'didLoad', // () => {}
//       'consolidate', // (...) => {}
//       'fromType', // () => {}
//       'fromField', // () => {}
//       'toField', // () => {}
//     ].forEach(key => {
//       let one = ns.singleton({[eYo.$]: true}, {
//         [key]: function () {},
//       })
//       chai.expect(eYo.isF(one.model[key])).true
//       let second = ns.singleton({[eYo.$]: true}, {
//         [key]: 421,
//       })
//       chai.expect(eYo.isDef(second.model[key])).false
//     })
//     var one = ns.singleton({[eYo.$]: true}, {
//       init: 421,
//     })
//     chai.expect(eYo.isF(one.model.init)).true
//     var one = ns.singleton({[eYo.$]: true}, {
//       xml: 421,
//     })
//     chai.expect(one.model.xml).not.equal(421)
//     one = ns.singleton({[eYo.$]: true}, {
//       xml: {},
//     })
//     chai.expect(one.model.xml).eql({})
//     ;[
//       'save', // () => {}
//       'load', // () => {}
//     ].forEach(key => {
//       let one = ns.singleton({[eYo.$]: true}, {
//         xml: {
//           [key]: function () {},
//         },
//       })
//       chai.expect(eYo.isF(one.model.xml[key])).true
//       let second = ns.singleton({[eYo.$]: true}, {
//         xml: {
//           [key]: 421,
//         },
//       })
//       chai.expect(eYo.isDef(second.model.xml[key])).false
//     })
//     /*
//     eYo.model.allowModelPaths({
//   [eYo.model.ROOT]: 'data',
//   'data': '\\w+',
//   'data\\.\\w+': [
//     'after', // key || [keys]
//     'order', // INTEGER
//     'all', // TYPE || [TYPE], // last is expected
//     'main', // BOOLEAN
//     'placeholder', // STRING
//     'noUndo', // true
//     'xml', // {}
//     'init', // WHATEVER
//     'validate', // (...) => {} || false || true,
//     'validateIncog', // (...) => {}
//     'willChange', // (...) => {}
//     'isChanging', // (...) => {}
//     'didChange', // (...) => {}
//     'willUnchange', // (...) => {}
//     'isUnchanging', // (...) => {}
//     'didUnchange', // (...) => {}
//     'willLoad', // () => {}
//     'didLoad', // () => {}
//     'consolidate', // (...) => {}
//     'fromType', // () => {}
//     'fromField', // () => {}
//     'toField', // () => {}
//   ],
//   'data\\.\\w+\.xml': [
//     'save', 'load',
//   ],
// })

// eYo.model.allowModelShortcuts({
//   'data\\.\\w+\\.init': (before, p) => {
//     if (!eYo.isF(before)) {
//       return function () {
//         return before
//       }
//     }
//   },
//   'data\\.\\w+\\.(?:all|after)': (before, p) => {
//     if (!eYo.isRA(before)) {
//       return [before]
//     }
//   },
//   'data\\.\\w+\\.(?:didLoad|after)': (before, p) => {
//     if (!eYo.isF(before)) {
//       return eYo.INVALID
//     }
//   },
//   'data\\.\\w+\\.xml\\.(?:toText|fromText|toField|fromField|save|load)': (before, p) => {
//     if (!eYo.isF(before)) {
//       return eYo.INVALID
//     }
//   },
// })
// */
//   })
})

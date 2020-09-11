describe ('Tests: data', function () {
  this.timeout(20000)
  let flag = new eYo.test.Flag()
  let onr = eYo.c3s.new()
  var ns, d
  let new_ns = () => {
    flag.reset()
    ns = eYo.data.newNS()
    ns.makeC9rBase()
  }
  it (`Merge only once`, function () {
    // Absolutely ugly design
    new_ns()
    var model = {
      methods: {
        filter (after) {return after}
      }
    }
    // Break here
    d = ns.new(model, 'd', onr)
    // then break at data's delegate's modelMethodsFilter
    // You stop here only once
    ns.new(model, 'd', onr)
    ns.new(model, 'd', onr)
  })
  //   it('Data model', function () {
  //     let ns = eYo.data.newNS()
  //     ns.makeC9rBase()

  //     let test = (key, value) => {
  //       let one = ns.singleton({eyo: true}, {
  //         [key]: value,
  //       })
  //       chai.expect(one.model[key]).equal(value)
  //     }
  //     ;['after', // key || [keys]
  //     'all'].forEach(key => {
  //       let one = ns.singleton({eyo: true}, {
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
  //       let one = ns.singleton({eyo: true}, {
  //         [key]: 421,
  //       })
  //       chai.expect(one.model[key]).equal(421)
  //     })
  //     ;[
  //       // 'init', // WHATEVER
  //       'validate', // (...) => {} || false || true,
  //       'validateIncog', // (...) => {}
  //       'willChange', // (...) => {}
  //       'onChange', // (...) => {}
  //       'didChange', // (...) => {}
  //       'willUnchange', // (...) => {}
  //       'onUnchange', // (...) => {}
  //       'didUnchange', // (...) => {}
  //       'willLoad', // () => {}
  //       'didLoad', // () => {}
  //       'consolidate', // (...) => {}
  //       'fromType', // () => {}
  //       'fromField', // () => {}
  //       'toField', // () => {}
  //     ].forEach(key => {
  //       let one = ns.singleton({eyo: true}, {
  //         [key]: function () {},
  //       })
  //       chai.expect(eYo.isF(one.model[key])).true
  //       let second = ns.singleton({eyo: true}, {
  //         [key]: 421,
  //       })
  //       chai.expect(eYo.isDef(second.model[key])).false
  //     })
  //     var one = ns.singleton({eyo: true}, {
  //       init: 421,
  //     })
  //     chai.expect(eYo.isF(one.model.init)).true
  //     var one = ns.singleton({eyo: true}, {
  //       xml: 421,
  //     })
  //     chai.expect(one.model.xml).not.equal(421)
  //     one = ns.singleton({eyo: true}, {
  //       xml: {},
  //     })
  //     chai.expect(one.model.xml).eql({})
  //     ;[
  //       'save', // () => {}
  //       'load', // () => {}
  //     ].forEach(key => {
  //       let one = ns.singleton({eyo: true}, {
  //         xml: {
  //           [key]: function () {},
  //         },
  //       })
  //       chai.expect(eYo.isF(one.model.xml[key])).true
  //       let second = ns.singleton({eyo: true}, {
  //         xml: {
  //           [key]: 421,
  //         },
  //       })
  //       chai.expect(eYo.isDef(second.model.xml[key])).false
  //     })
  //     /*
  //     eYo.model.allowModelPaths({
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
  //     'onChange', // (...) => {}
  //     'didChange', // (...) => {}
  //     'willUnchange', // (...) => {}
  //     'onUnchange', // (...) => {}
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

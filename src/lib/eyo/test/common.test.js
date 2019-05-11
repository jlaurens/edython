setTimeout(() => {
  describe('PREPARE', function() {
    it('Blockly', function() {
      chai.assert(Blockly, `MISSING Blockly`)
      chai.assert(eYo.App.workspace, `MISSING eYo.App.workspace`)
      chai.assert(eYo.Node.prototype.toBlock, `MISSING toBlock`)
    })
  })
}, 0)

eYo.Test = Object.create(null)

eYo.temp = (() => {
  var options = {
    collapse : true,
    comments : false,
    disable : true,
    maxBlocks : Infinity,
    trashcan : false,
    horizontalLayout : false,
    // toolboxPosition : 'end',
    css : true,
    rtl : false,
    scrollbars : true,
    sounds : false,
    oneBasedIndex : true,
  };
  /* Inject your workspace */
  eYo.App.workspace = Blockly.inject('eyoDiv', options);
  eYo.setup(eYo.App.workspace)
  eYo.App.workspace.eyo.options = {
    noLeftSeparator: true,
    noDynamicList: false,
    smartUnary: true,
  }
  eYo.App.workspace.clearUndo()
})()

chai.assert(eYo.App.workspace, 'NO MAIN WORKSPACE')

eYo.Test.setItUp = () => {
  eYo.App.workspace.clearUndo()
  eYo.App.workspace.topBlocks_.length = 0
}

eYo.Test.tearItDown = (opt) => {
  eYo.App.workspace.clearUndo()
  if (!opt || !opt.ignoreTopBlock) {
    chai.assert(eYo.App.workspace.topBlocks_.length === 0, `FAILED ${eYo.App.workspace.topBlocks_.length} === 0`)
  }
}

eYo.Test.g = eYo.GMR._PyParser_Grammar

eYo.Test.ctor = (dlgt, k) => {
  chai.assert(dlgt.constructor.eyo.key === k, `MISSED CTOR KEY ${dlgt.constructor.eyo.key} === ${k}`)
}

eYo.Test.dlgt = (dlgt, t, str) => {
  t = eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t
  chai.assert(dlgt, `MISSING DLGT TYPE ${t || ''}`)
  chai.assert(!t || (dlgt.type === t), `MISSED TYPE ${str || ''} ${dlgt.type} === ${t}`)
}

eYo.Test.new_dlgt = (t, tt, str, headless) => {
  var type = t = eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t
  var dlgt = eYo.Delegate.newReady(eYo.App.workspace, type)
  eYo.Test.dlgt(dlgt, tt, str)
  if (!headless) {
    dlgt.render()
  }
  return dlgt
}

/**
 * Basic test for block creation.
 * The argument is a array of `[t, tt, k]` arrays.
 * `t` is the type of the node to be created.
 * `tt` is the type of the created block.
 * `k` is the key of the constructor of that block.
 * When `tt` or `k` is undefined, no corresponding test is performed.
 * When `tt` or `k` is null, it is replaced by `t` before the test is performed.
 *
 * @param{Array} ra
 * @param{String} str
 */
eYo.Test.basic = (ra, str) => {
  describe(`Basic: ${str}`, function () {
    ra.forEach(args => {
      var t = args[0]
      var tt = args[1] || ((args[1] === null) && args[0])
      var k = args[2] || ((args[2] === null) && args[0])
      it (`${t}${tt ? `/${tt}` : ''}${k ? `/ctor: ${k}` : ''}`, function () {
        var d = eYo.Test.new_dlgt(args[0], args[1] || args[0])
        args[2] && eYo.Test.ctor(d, args[2])
        d.block_.dispose()
      })
    })
  })
  }

/** Usage
  eYo.Test.incog(block,
['holder',
'dotted',
'target',
'alias',
'annotated',
'value',
'n_ary',
'slicing',
'alias'])
*/
eYo.Test.incog = (dlgt, keys) => {
  var M = eYo.Delegate.Manager.getModel(dlgt.type)
  Object.keys(M.slots).forEach(k => {
    var yorn = keys.indexOf(k) >= 0
    chai.assert(!dlgt[`${k}_s`].incog === yorn, `${yorn ? 'MISSING' : 'UNEXPECTED'} ${k.toUpperCase()} INCOG`)
  })
}

eYo.Test.variant = (d, variant, str) => {
  variant = eYo.Key[variant] || variant
  chai.assert(d.variant_p === variant, `MISSED VARIANT ${str || ''} ${d.variant_p} === ${variant}`)
}

eYo.Test.set_variant = (d, variant, str) => {
  variant = eYo.Key[variant] || variant
  d.variant_p = variant
  chai.assert(d.variant_p === variant, `MISSED VARIANT ${str || ''} ${d.variant_p} === ${variant}`)
}

/**
 * Test all the possible variants
 */
eYo.Test.all_variants = (d, required) => {
  eYo.Test.dlgt(d)
  var d = d.variant_d
  var all = d && d.getAll()
  chai.assert(all || !required, `MISSING all in model ${d.type}`)
  all && all.forEach(v => {
    eYo.Test.set_variant(d, v)
  })
}

eYo.Test.linearizeCode_ = s => s.replace(/(?:\r\n|\r|\n)/g, '\\n').replace(/\s+/g, ' ').replace(/(\*) /g, '$1').replace(/(\s|\\n)+$/g, '').replace(/,?\s*(=|\]|\)|\})\s*/g, '$1').replace(/\s*(\[|\(|\{|:|\*\*|->|,|}|\+|-|=|#)\s*/g, '$1').replace(/(#)  +/g, '$1 ')

Object.defineProperties(eYo.Delegate.prototype, {
  linearizedCode: {
    get () {
      return eYo.Test.linearizeCode_(this.toString)
    }
  }
})

eYo.Test.code = (d, str) => {
  var s = d.toString.replace(/\bNOM\d/g, 'NAME')
  if (s !== str) {
    var s1 = eYo.Test.linearizeCode_(s)
    var str1 = eYo.Test.linearizeCode_(str)
    // console.error(s1, str1)
    chai.assert(s1 === str1, `MISSED: ${s} === ${str} (${s1} === ${str1})`)
  }
}

eYo.Delegate.prototype.test_display_line_counts = function () {
  console.log({
    head: this.headHeight,
    foot: this.footHeight,
    main: this.mainHeight,
    suite: this.suiteHeight,
    black: this.blackHeight,
    next: this.nextHeight
  })
}
/**
 * Test the various block line counts.
 * Expected is a map, keys are strings for the type of the line count.
 * Values are integers.
 * Possible types are: 'head', 'foot', 'main', suite', 'black', 'next'
 * @param {!eYo.Delegate}  dlgt to be tested.
 * @param {?Object} cfg  cfg is a map file.
 */
eYo.Test.line_counts = (dlgt, cfg) => {
  var failed
  var expected, available
  var d = dlgt
  ;['head', 'foot', 'main', 'suite', 'black', 'next'].some(k => {
    expected = (cfg && cfg[k]) || (k === 'main' ? 1 : 0)
    available = {
      head: d.headHeight,
      foot: d.footHeight,
      main: d.mainHeight,
      suite: d.suiteHeight,
      black: d.blackHeight,
      next: d.nextHeight
    }[k]
    if (expected !== available) {
      failed = k
      return true
    }
  })
  chai.assert(!failed, `Bad ${failed} line count: ${expected} === ${available}`)
}

/**
 * Test if the connections are the expected ones.
 * Expected is a map, keys are strings for the type of the connections,
 * values are `true` for an expected connection for that type,
 * `false` otherwise.
 * Possible types are: 'output', 'high', 'low', 'left', right', 'suite'
 */
eYo.Test.magnets = (d, cfg) => {
  var failed
  var expected, available
  ;['output', 'high', 'left', 'right', 'suite', 'low'].some(k => {
    expected = !!cfg[k]
    available = !!d.magnets[k]
    if (expected !== available) {
      failed = k
      return true
    }
  })
  chai.assert(!failed, `${available? 'Unexpected' :  'Missing'} connection ${failed}`)
}

eYo.Test.input_length = (d, k, str) => {
  chai.assert(d.inputList.length === k, `BAD INPUT LENGTH ${str || ''} ${d.inputList.length} === ${k}`)
}

/**
 * Whether both blocks have the same type and variant.
 */
eYo.Test.same = (d, dd) => {
  chai.assert(d, 'MISSING d')
  chai.assert(dd, 'MISSING dd')
  chai.assert(d.type === dd.type, `BAD TYPE ${d.type} === ${dd.type}`)
  chai.assert(d.variant_p === dd.variant_p, `BAD VARIANT ${d.variant_p} === ${dd.variant_p}`)
}

/**
 * Data key test.
 * Data are uniquely defined by their key.
 */
eYo.Test.data_key = (dlgt, key, value) => {
  chai.assert(dlgt, 'MISSING d')
  var d = dlgt.data[key]
  chai.assert(d, `UNKNOWN DATA KEY ${key} in ${dlgt.type}`)
  var dd = d[`${key}_d`]
  chai.assert(d === dd, `NO DATA SHORTCUT FOR ${key} in ${dlgt.type}`)
  chai.assert(d.get() === d[`${key}_p`], `NO VALUE SHORTCUT FOR ${key} in ${dlgt.type}`)
  if (value !== undefined) {
    var old = d.get()
    d.set(value)
    chai.assert(d.get() === value, `NO CHANGE FOR ${key} in ${dlgt.type}: ${d.get()} === ${value}`)
    d.set(old)
    chai.assert(d.get() === old, `NO OLD FOR ${key} in ${dlgt.type}`)
  }
}

/**
 * Test the data of the block.
 */
eYo.Test.data_value = (dlgt, key, value) => {
  chai.assert(dlgt, 'MISSING d')
  var d = dlgt.data[key]
  chai.assert(d, `UNKNOWN DATA KEY ${key} in ${dlgt.type}`)
  var dd = d[`${key}_d`]
  chai.assert(d === dd, `NO DATA SHORTCUT FOR ${key} in ${dlgt.type}`)
  chai.assert(d.get() === d[`${key}_p`], `NO VALUE SHORTCUT FOR ${key} in ${dlgt.type}`)
  chai.assert(d.get() === value, `UNEXPECTED VALUE FOR ${key} in ${dlgt.type}: ${d.get()} === ${value}`)
}

/**
 * change the data of the block,
 * get the dom, create a block from that block,
 * and compare the data values.
 * Change back the data.
 */
eYo.Test.data_save = (dlgt, key, value, ignore) => {
  chai.assert(dlgt, 'MISSING d')
  var d = dlgt.data[key]
  chai.assert(d, `UNKNOWN DATA KEY: ${key}`)
  var old = dlgt[`${key}_p`]
  dlgt[`${key}_p`] = value
  var dom = eYo.Xml.dlgtToDom(dlgt)
  if (ignore) { // do not create a block from dom
    var attr = dom.getAttribute(d.attributeName)
    chai.assert(attr === null, `UNEXPECTED ATTRIBUTE ${d.attributeName}: ${attr}`)
  } else {
    var d = eYo.Delegate.newReady(dlgt, dom)
    chai.assert(d, 'MISSING dd from dom')
    var saved = d[`${key}_p`]
    d.block_.dispose()
    chai.assert(saved === value, `FAILED DATA SAVE: ${saved} === ${value}`)
  }
  dlgt[`${key}_p`] = old
}

/**
 * Slot connection test.
 */
eYo.Test.bind_field = (type, key, no) => {
  var dlgt = eYo.Test.new_dlgt(type)
  var s = dlgt.slots[key]
  chai.assert(s, `MISSING SLOT for ${key} in ${dlgt.type}`)
  var f = s.bindField
  chai.assert(!!f === !no, `${no ? 'UNEXPECTED' : 'MISSING'} BIND FIELD for ${key} in ${dlgt.type}`)
  if (!no) {
    chai.assert(f.isVisible(), `INVISIBLE BIND FIELD for ${key} in ${dlgt.type}`)
  }
  var i = s.input
  if (i) {
    var ff = i.eyo.bindField
    chai.assert(f === ff, `INCONSISTENT BIND FIELD 1 for ${key} in ${dlgt.type}`)
    var m4t = i.eyo.magnet
    if (m4t) {
      ff = m4t.bindField
      chai.assert(f === ff, `INCONSISTENT BIND FIELD 2 for ${key} in ${dlgt.type}`)
    }
  }
  dlgt.block_.dispose()
}

/**
 * Slot [connection] test.
 */
eYo.Test.slot_connect = (dlgt, key, tb) => {
  chai.assert(dlgt, 'MISSING d')
  var s = dlgt.slots[key]
  chai.assert(s === dlgt[`${key}_s`], `MISSED SLOT SHORTCUT for ${key} in ${dlgt.type}`)
  if (tb) {
    s.connect(tb)
    chai.assert(s.target === tb.eyo, `MISSED CONNECTION for ${key} in ${dlgt.type}`)
    chai.assert(tb === dlgt[`${key}_b`], `MISSED TARGET SHORTCUT for ${key} in ${dlgt.type}`)
  }
}

/**
 * Test if the wrapped slot is functional.
 * @param {*} dlgt  a block
 * @param {string} k  the slot key
 */
eYo.Test.slot_wrapped = (dlgt, k) => {
  var s = dlgt.slots[k]
  chai.assert(s, `MISSING wrapped ${k} slot`)
  var t_eyo = s.target
  chai.assert(t_eyo, 'MISSING target\'s target slot')
  chai.assert(t_eyo.parent === dlgt, 'MISSING parent')
}

eYo.Test.expect_out_check = (dlgt, check, str) => {
  if (check !== null && !goog.isArray(check)) {
    check = [check]
  }
  chai.assert(chai.expect(dlgt.magnets.output.check_).to.deep.equal(check), `MISSED output check for ${dlgt.type}: ${dlgt.magnets.output.check_} !== ${check}`)
}

/**
 * Dynamic list connection test.
 */
eYo.Test.list_connect = (dlgt, key, target, name) => {
  chai.assert(dlgt, 'MISSING d')
  chai.assert(target, 'MISSING target')
  var s = dlgt.slots[key]
  chai.assert(s.listConnect(target, name), `CONNECTION FAILED`)
  chai.assert(s.t_eyo.inputList.some(input => input.magnet && input.magnet.t_eyo === target), `MISSED CONNECTION for ${key} in ${dlgt.type}`)
}

/**
 * Subtype.
 */
eYo.Test.subtype = (dlgt, t) => {
  chai.assert(dlgt, 'MISSING d')
  t = eYo.T3.Expr[t] || eYo.T3.Stmt[t] || t
  chai.assert(t, 'UNKNOWN subtype')
  chai.assert(dlgt.subtype === t, `MISSED subtype ${dlgt.type}: ${dlgt.subtype} === ${t}`)
}

/**
 * copy/paste.
 */
eYo.Test.copy_paste = (dlgt, opts) => {
  chai.assert(dlgt, 'MISSING d')
  var dom = eYo.Xml.dlgtToDom(dlgt)
  var dd = eYo.Delegate.newReady(dlgt, dom)
  eYo.Test.same(dlgt, dd)
  var M = eYo.Delegate.Manager.getModel(dlgt.type)
  Object.keys(M.slots).forEach(k => {
    var key = `${k}_s`
    chai.assert(dlgt[key].incog === dd[key].incog, `INCONSISTENT INCOG for key ${k}`)
    if (!dlgt[key].incog) {
      eYo.Test.same_list_length = (dlgt, dd, k)
    }
  })
  var test = opts && opts.test
  if (goog.isFunction(test)) {
    test(dlgt, dd)
  }
  var filter = opts && opts.filter
  if (goog.isFunction(filter)) {
    var f = input => {
      var t_eyo = input.t_eyo
      if (t_eyo) {
        return filter(t_eyo)
      }
    }
    var m = dlgt.inputList.map(f)
    var mm = dd.inputList.map(f)
    chai.assert(chai.expect(m).to.deep.equal(mm), `FAILURE filter`)
  }
  dd.block_.dispose()
}

/**
 * Whether both blocks have the same list length.
 */
eYo.Test.same_list_length = (dlgt1, dlgt2, key) => {
  chai.assert(dlgt1, 'MISSING d')
  chai.assert(dlgt2, 'MISSING dd')
  var s1 = dlgt1.slots[key]
  var s2 = dlgt2.slots[key]
  chai.assert(s1, `MISSING d slot for key ${key}`)
  chai.assert(s2, `MISSING dd slot for key ${key}`)
  var t1_eyo = s1.t_eyo
  var t2_eyo = s2.t_eyo
  chai.assert(t1_eyo, `MISSING d slot target for key ${key}`)
  chai.assert(t2_eyo, `MISSING dd slot target for key ${key}`)
  chai.assert(t1_eyo.inputList.length === t2_eyo.inputList.length, `FAILED inputList length ${t1_eyo.inputList.length} === ${t2_eyo.inputList.length}`)
}

/**
 * Create a new identifier Dlgt
 */
eYo.Test.newIdentifier = (str) => {
  var dlgt = eYo.Delegate.newReady(eYo.App.workspace, eYo.T3.Expr.identifier)
  dlgt.target_p = str
  eYo.Test.dlgt(dlgt, 'identifier')
  eYo.Test.data_value(dlgt, 'target', str)
  return dlgt
}

/**
 * Test if `node` and `parent` exist, and if node's parent is parent.
 * @param {*} svg  either a block or an svg resource object.
 * @param {string} node  the child element is `svg[node]`
 * @param {string} parent  the parent element is `svg[parent]`, when parent is defined
 */
eYo.Test.svgNodeParent = (svg, node, parent, type) => {
  if (svg.eyo) {
    type = type || svg.eyo.type
    svg = svg.eyo.ui.svg
    chai.assert(svg, `MISSING svg in ${type}`)
  } else {
    type = type || 'svg'
  }
  chai.assert(svg[node], `MISSING svg.${node} in ${type}`)
  if (goog.isString(parent)) {
    chai.assert(svg[parent], `MISSING svg.${parent} in ${type}`)
    chai.assert(svg[node].parentNode === svg[parent], `MISSING svg.${node}.parentNode === svg.${parent} in ${type}`)
  } else if (parent) {
    chai.assert(svg[node].parentNode === parent, `MISSING svg.${node}.parentNode === ${parent} in ${type}`)
  }
}

/**
 * Test the various string as python source code
 * @param {string} str  The source code to test.
 */
eYo.Test.source = (str) => {
  var err_ret = {}
  var n = eYo.Parser.PyParser_ParseString(str, eYo.GMR._PyParser_Grammar, eYo.TKN.file_input, err_ret)
  var d = n.toBlock(Blockly.mainWorkspace)
  if (!d) {
    eYo.GMR.showtree(eYo.GMR._PyParser_Grammar, n)
  }
  chai.assert(d, `WHERE IS THE BLOCK ${n.type}/${n.name}`)
  eYo.Test.code(d, str)
  d.block_.dispose()
}

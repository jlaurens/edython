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

eYo.Test.ctor = (b, k) => {
  chai.assert(b.eyo.constructor.eyo.key === k, `MISSED CTOR KEY ${b.eyo.constructor.eyo.key} === ${k}`)
}

eYo.Test.block = (b, t, str) => {
  t = eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t
  chai.assert(b, `MISSING BLOCK TYPE ${t || ''}`)
  chai.assert(!t || (b.type === t), `MISSED TYPE ${str || ''} ${b.type} === ${t}`)
}

eYo.Test.new_block = (t, tt, str, headless) => {
  var type = t = eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t
  var b = eYo.DelegateSvg.newBlockReady(eYo.App.workspace, type)
  eYo.Test.block(b, tt, str)
  if (!headless) {
    b.eyo.render()
  }
  return b
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
        var b = eYo.Test.new_block(args[0], args[1] || args[0])
        args[2] && eYo.Test.ctor(b, args[2])
        b.dispose()
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
eYo.Test.incog = (b, keys) => {
  var M = eYo.Delegate.Manager.getModel(b.type)
  Object.keys(M.slots).forEach(k => {
    var yorn = keys.indexOf(k) >= 0
    chai.assert(!b.eyo[`${k}_s`].isIncog() === yorn, `${yorn ? 'MISSING' : 'UNEXPECTED'} ${k.toUpperCase()} INCOG`)
  })
}

eYo.Test.variant = (b, variant, str) => {
  variant = eYo.Key[variant] || variant
  chai.assert(b.eyo.variant_p === variant, `MISSED VARIANT ${str || ''} ${b.eyo.variant_p} === ${variant}`)
}

eYo.Test.set_variant = (b, variant, str) => {
  variant = eYo.Key[variant] || variant
  b.eyo.variant_p = variant
  chai.assert(b.eyo.variant_p === variant, `MISSED VARIANT ${str || ''} ${b.eyo.variant_p} === ${variant}`)
}

/**
 * Test all the possible variants
 */
eYo.Test.all_variants = (b, required) => {
  eYo.Test.block(b)
  var d = b.eyo.variant_d
  var all = d && d.getAll()
  chai.assert(all || !required, `MISSING all in model ${b.type}`)
  all && all.forEach(v => {
    eYo.Test.set_variant(b, v)
  })
}

eYo.Test.linearizeCode_ = s => s.replace(/(?:\r\n|\r|\n)/g, '\\n').replace(/\s+/g, ' ').replace(/(\*) /g, '$1').replace(/(\s|\\n)+$/g, '').replace(/,?\s*(=|\]|\)|\})\s*/g, '$1').replace(/\s*(\[|\(|\{|:|\*\*|->|,|}|\+|-|=)\s*/g, '$1').replace(/(#)  +/g, '$1 ')

Object.defineProperties(eYo.Delegate.prototype, {
  linearizedCode: {
    get () {
      return eYo.Test.linearizeCode_(this.toString)
    }
  }
})

eYo.Test.code = (b, str) => {
  var s = b.eyo.toString.replace(/\bNOM\b/g, 'NAME')
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
 * @param {!Blockly.Block}  block to be tested.
 * @param {?Object} cfg  cfg is a map file.
 */
eYo.Test.line_counts = (b, cfg) => {
  var failed
  var expected, available
  var b_eyo = b.eyo
  ;['head', 'foot', 'main', 'suite', 'black', 'next'].some(k => {
    expected = (cfg && cfg[k]) || (k === 'main' ? 1 : 0)
    available = {
      head: b_eyo.headHeight,
      foot: b_eyo.footHeight,
      main: b_eyo.mainHeight,
      suite: b_eyo.suiteHeight,
      black: b_eyo.blackHeight,
      next: b_eyo.nextHeight
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
 * Possible types are: 'previous', 'next', 'left', right', 'suite'
 */
eYo.Test.connections = (b, cfg) => {
  var failed
  var expected, available
  ;['previous', 'left', 'right', 'suite', 'next'].some(k => {
    expected = !!cfg[k]
    available = !!{
      previous: b.eyo.previousConnection,
      left: b.eyo.leftStmtConnection,
      right: b.eyo.rightStmtConnection,
      suite: b.eyo.suiteStmtConnection,
      next: b.eyo.nextConnection
    }[k]
    if (expected !== available) {
      failed = k
      return true
    }
  })
  chai.assert(!failed, `${available? 'Unexpected' :  'Missing'} connection ${failed}`)
}

eYo.Test.input_length = (b, k, str) => {
  chai.assert(b.inputList.length === k, `BAD INPUT LENGTH ${str || ''} ${b.inputList.length} === ${k}`)
}

/**
 * Whether both blocks have the same type and variant.
 */
eYo.Test.same = (b, bb) => {
  chai.assert(b, 'MISSING b')
  chai.assert(bb, 'MISSING bb')
  chai.assert(b.type === bb.type, `BAD TYPE ${b.type} === ${bb.type}`)
  chai.assert(b.variant_p === bb.variant_p, `BAD VARIANT ${b.variant_p} === ${bb.variant_p}`)
}

/**
 * Data key test.
 * Data are uniquely defined by their key.
 */
eYo.Test.data_key = (b, key, value) => {
  chai.assert(b, 'MISSING b')
  var d = b.eyo.data[key]
  chai.assert(d, `UNKNOWN DATA KEY ${key} in ${b.type}`)
  var dd = b.eyo[`${key}_d`]
  chai.assert(d === dd, `NO DATA SHORTCUT FOR ${key} in ${b.type}`)
  chai.assert(d.get() === b.eyo[`${key}_p`], `NO VALUE SHORTCUT FOR ${key} in ${b.type}`)
  if (value !== undefined) {
    var old = d.get()
    d.set(value)
    chai.assert(d.get() === value, `NO CHANGE FOR ${key} in ${b.type}: ${d.get()} === ${value}`)
    d.set(old)
    chai.assert(d.get() === old, `NO OLD FOR ${key} in ${b.type}`)
  }
}

/**
 * Test the data of the block.
 */
eYo.Test.data_value = (b, key, value) => {
  chai.assert(b, 'MISSING b')
  var d = b.eyo.data[key]
  chai.assert(d, `UNKNOWN DATA KEY ${key} in ${b.type}`)
  var dd = b.eyo[`${key}_d`]
  chai.assert(d === dd, `NO DATA SHORTCUT FOR ${key} in ${b.type}`)
  chai.assert(d.get() === b.eyo[`${key}_p`], `NO VALUE SHORTCUT FOR ${key} in ${b.type}`)
  chai.assert(d.get() === value, `UNEXPECTED VALUE FOR ${key} in ${b.type}: ${d.get()} === ${value}`)
}

/**
 * change the data of the block,
 * get the dom, create a block from that block,
 * and compare the data values.
 * Change back the data.
 */
eYo.Test.data_save = (b, key, value, ignore) => {
  chai.assert(b, 'MISSING b')
  var d = b.eyo.data[key]
  chai.assert(d, `UNKNOWN DATA KEY: ${key}`)
  var old = b.eyo[`${key}_p`]
  b.eyo[`${key}_p`] = value
  var dom = eYo.Xml.blockToDom(b)
  if (ignore) { // do not create a block from dom
    var attr = dom.getAttribute(d.attributeName)
    chai.assert(attr === null, `UNEXPECTED ATTRIBUTE ${d.attributeName}: ${attr}`)
  } else {
    var bb = eYo.DelegateSvg.newBlockReady(b.workspace, dom)
    chai.assert(bb, 'MISSING bb from dom')
    var saved = bb.eyo[`${key}_p`]
    bb.dispose()
    chai.assert(saved === value, `FAILED DATA SAVE: ${saved} === ${value}`)
  }
  b.eyo[`${key}_p`] = old
}

/**
 * Slot connection test.
 */
eYo.Test.bind_field = (type, key, no) => {
  var a = eYo.Test.new_block(type)
  var s = a.eyo.slots[key]
  chai.assert(s, `MISSING SLOT for ${key} in ${a.type}`)
  var f = s.bindField
  chai.assert(!!f === !no, `${no ? 'UNEXPECTED' : 'MISSING'} BIND FIELD for ${key} in ${a.type}`)
  if (!no) {
    chai.assert(f.isVisible(), `INVISIBLE BIND FIELD for ${key} in ${a.type}`)
  }
  var i = s.input
  if (i) {
    var ff = i.eyo.bindField
    chai.assert(f === ff, `INCONSISTENT BIND FIELD 1 for ${key} in ${a.type}`)
    var c8n = i.c8n
    if (c8n) {
      ff = c8n.eyo.bindField
      chai.assert(f === ff, `INCONSISTENT BIND FIELD 2 for ${key} in ${a.type}`)
    }
  }
  a.dispose()
}

/**
 * Slot [connection] test.
 */
eYo.Test.slot_connect = (b, key, tb) => {
  chai.assert(b, 'MISSING b')
  var s = b.eyo.slots[key]
  chai.assert(s === b.eyo[`${key}_s`], `MISSED SLOT SHORTCUT for ${key} in ${b.type}`)
  if (tb) {
    s.connect(tb)
    chai.assert(s.target === tb.eyo, `MISSED CONNECTION for ${key} in ${b.type}`)
    chai.assert(tb === b.eyo[`${key}_b`], `MISSED TARGET SHORTCUT for ${key} in ${b.type}`)
  }
}

/**
 * Test if the wrapped slot is functional.
 * @param {*} b  a block
 * @param {string} k  the slot key
 */
eYo.Test.slot_wrapped = (b, k) => {
  var s = b.eyo.slots[k]
  chai.assert(s, `MISSING wrapped ${k} slot`)
  var t_eyo = s.target
  chai.assert(t_eyo, 'MISSING target\'s target slot')
  chai.assert(t_eyo.parent === b.eyo, 'MISSING parent')
}

eYo.Test.expect_out_check = (b, check, str) => {
  if (check !== null && !goog.isArray(check)) {
    check = [check]
  }
  chai.assert(chai.expect(b.outputConnection.check_).to.deep.equal(check), `MISSED output check for ${b.type}: ${b.outputConnection.check_} !== ${check}`)
}

/**
 * Dynamic list connection test.
 */
eYo.Test.list_connect = (b, key, target, name) => {
  chai.assert(b, 'MISSING b')
  chai.assert(target, 'MISSING target')
  var s = b.eyo.slots[key]
  chai.assert(s.listConnect(target, name), `CONNECTION FAILED`)
  chai.assert(s.t_eyo.inputList.some(input => input.connection && input.connection.eyo.t_eyo === target.eyo), `MISSED CONNECTION for ${key} in ${b.type}`)
}

/**
 * Subtype.
 */
eYo.Test.subtype = (b, t) => {
  chai.assert(b, 'MISSING b')
  t = eYo.T3.Expr[t] || eYo.T3.Stmt[t] || t
  chai.assert(t, 'UNKNOWN subtype')
  chai.assert(b.eyo.subtype === t, `MISSED subtype ${b.type}: ${b.eyo.subtype} === ${t}`)
}

/**
 * copy/paste.
 */
eYo.Test.copy_paste = (b, opts) => {
  chai.assert(b, 'MISSING b')
  var d = eYo.Xml.blockToDom(b)
  var bb = eYo.DelegateSvg.newBlockReady(eYo.App.workspace, d)
  eYo.Test.same(b, bb)
  var M = eYo.Delegate.Manager.getModel(b.type)
  Object.keys(M.slots).forEach(k => {
    var key = `${k}_s`
    chai.assert(b.eyo[key].isIncog() === bb.eyo[key].isIncog(), `INCONSISTENT INCOG for key ${k}`)
    if (!b.eyo[key].isIncog()) {
      eYo.Test.same_list_length = (b, bb, k)
    }
  })
  var test = opts && opts.test
  if (goog.isFunction(test)) {
    test(b, bb)
  }
  var filter = opts && opts.filter
  if (goog.isFunction(filter)) {
    var f = input => {
      var t_eyo = input.t_eyo
      if (t_eyo) {
        return filter(t_eyo)
      }
    }
    var m = b.inputList.map(f)
    var mm = bb.inputList.map(f)
    chai.assert(chai.expect(m).to.deep.equal(mm), `FAILURE filter`)
  }
  bb.dispose()
}

/**
 * Whether both blocks have the same list length.
 */
eYo.Test.same_list_length = (b, bb, key) => {
  chai.assert(b, 'MISSING b')
  chai.assert(bb, 'MISSING bb')
  var s = b.eyo.slots[key]
  var ss = bb.eyo.slots[key]
  chai.assert(s, `MISSING b slot for key ${key}`)
  chai.assert(ss, `MISSING bb slot for key ${key}`)
  var t_eyo = s.t_eyo
  var tt_eyo = ss.t_eyo
  chai.assert(t_eyo, `MISSING b slot target for key ${key}`)
  chai.assert(tt_eyo, `MISSING bb slot target for key ${key}`)
  chai.assert(t_eyo.inputList.length === tt_eyo.inputList.length, `FAILED inputList length ${t_eyo.inputList.length} === ${tt_eyo.inputList.length}`)
}

/**
 * copy/paste.
 */
eYo.Test.newIdentifier = (str) => {
  var b = eYo.DelegateSvg.newBlockReady(eYo.App.workspace, eYo.T3.Expr.identifier)
  b.eyo.target_p = str
  eYo.Test.block(b, 'identifier')
  eYo.Test.data_value(b, 'target', str)
  return b
}

/**
 * Test if `node` and `parent` exist, and if node's parent is parent.
 * @param {*} svg  either a block or an svg resource object.
 * @param {string} node  the child element is `svg[node]`
 * @param {string} parent  the parent element is `svg[parent]`, when parent is defined
 */
eYo.Test.svgNodeParent= (svg, node, parent, type) => {
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

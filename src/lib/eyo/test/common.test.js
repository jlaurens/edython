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

eYo.Test.ctor = (brick, k) => {
  chai.assert(brick.constructor.eyo.key === k, `MISSED CTOR KEY ${brick.constructor.eyo.key} === ${k}`)
}

eYo.Test.brick = (brick, t, str) => {
  t = eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t
  chai.assert(brick, `MISSING DLGT TYPE ${t || ''}`)
  chai.assert(!t || (brick.type === t), `MISSED TYPE ${str || ''} ${brick.type} === ${t}`)
}

eYo.Test.new_dlgt = (t, tt, str, headless) => {
  var type = t = eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t
  var brick = eYo.Brick.newReady(eYo.App.workspace, type)
  eYo.Test.brick(brick, tt, str)
  if (!headless) {
    brick.render()
  }
  return brick
}

/**
 * Basic test for brick creation.
 * The argument is a array of `[t, tt, k]` arrays.
 * `t` is the type of the node to be created.
 * `tt` is the type of the created brick.
 * `k` is the key of the constructor of that brick.
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
        d.dispose()
      })
    })
  })
  }

/** Usage
  eYo.Test.incog(brick,
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
eYo.Test.incog = (brick, keys) => {
  var M = eYo.Brick.Manager.getModel(brick.type)
  Object.keys(M.slots).forEach(k => {
    var yorn = keys.indexOf(k) >= 0
    chai.assert(!brick[`${k}_s`].incog === yorn, `${yorn ? 'MISSING' : 'UNEXPECTED'} ${k.toUpperCase()} INCOG`)
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
  eYo.Test.brick(d)
  var d = d.variant_d
  var all = d && d.getAll()
  chai.assert(all || !required, `MISSING all in model ${d.type}`)
  all && all.forEach(v => {
    eYo.Test.set_variant(d, v)
  })
}

eYo.Test.linearizeCode_ = s => s.replace(/(?:\r\n|\r|\n)/g, '\\n').replace(/\s+/g, ' ').replace(/(\*) /g, '$1').replace(/(\s|\\n)+$/g, '').replace(/,?\s*(=|\]|\)|\})\s*/g, '$1').replace(/\s*(\[|\(|\{|:|\*\*|->|,|}|\+|-|=|#)\s*/g, '$1').replace(/(#)  +/g, '$1 ')

Object.defineProperties(eYo.Brick.prototype, {
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

eYo.Brick.prototype.test_display_line_counts = function () {
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
 * Test the various brick line counts.
 * Expected is a map, keys are strings for the type of the line count.
 * Values are integers.
 * Possible types are: 'head', 'foot', 'main', suite', 'black', 'next'
 * @param {!eYo.Brick}  brick to be tested.
 * @param {?Object} cfg  cfg is a map file.
 */
eYo.Test.line_counts = (brick, cfg) => {
  var failed
  var expected, available
  var d = brick
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
 * Whether both bricks have the same type and variant.
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
eYo.Test.data_key = (brick, key, value) => {
  chai.assert(brick, 'MISSING d')
  var d = brick.data[key]
  chai.assert(d, `UNKNOWN DATA KEY ${key} in ${brick.type}`)
  var dd = d[`${key}_d`]
  chai.assert(d === dd, `NO DATA SHORTCUT FOR ${key} in ${brick.type}`)
  chai.assert(d.get() === d[`${key}_p`], `NO VALUE SHORTCUT FOR ${key} in ${brick.type}`)
  if (value !== undefined) {
    var old = d.get()
    d.set(value)
    chai.assert(d.get() === value, `NO CHANGE FOR ${key} in ${brick.type}: ${d.get()} === ${value}`)
    d.set(old)
    chai.assert(d.get() === old, `NO OLD FOR ${key} in ${brick.type}`)
  }
}

/**
 * Test the data of the brick.
 */
eYo.Test.data_value = (brick, key, value) => {
  chai.assert(brick, 'MISSING d')
  var d = brick.data[key]
  chai.assert(d, `UNKNOWN DATA KEY ${key} in ${brick.type}`)
  var dd = d[`${key}_d`]
  chai.assert(d === dd, `NO DATA SHORTCUT FOR ${key} in ${brick.type}`)
  chai.assert(d.get() === d[`${key}_p`], `NO VALUE SHORTCUT FOR ${key} in ${brick.type}`)
  chai.assert(d.get() === value, `UNEXPECTED VALUE FOR ${key} in ${brick.type}: ${d.get()} === ${value}`)
}

/**
 * change the data of the brick,
 * get the dom, create a brick from that brick,
 * and compare the data values.
 * Change back the data.
 */
eYo.Test.data_save = (brick, key, value, ignore) => {
  chai.assert(brick, 'MISSING d')
  var d = brick.data[key]
  chai.assert(d, `UNKNOWN DATA KEY: ${key}`)
  var old = brick[`${key}_p`]
  brick[`${key}_p`] = value
  var dom = eYo.Xml.brickToDom(brick)
  if (ignore) { // do not create a brick from dom
    var attr = dom.getAttribute(d.attributeName)
    chai.assert(attr === null, `UNEXPECTED ATTRIBUTE ${d.attributeName}: ${attr}`)
  } else {
    var d = eYo.Brick.newReady(brick, dom)
    chai.assert(d, 'MISSING dd from dom')
    var saved = d[`${key}_p`]
    d.dispose()
    chai.assert(saved === value, `FAILED DATA SAVE: ${saved} === ${value}`)
  }
  brick[`${key}_p`] = old
}

/**
 * Slot connection test.
 */
eYo.Test.bind_field = (type, key, no) => {
  var brick = eYo.Test.new_dlgt(type)
  var s = brick.slots[key]
  chai.assert(s, `MISSING SLOT for ${key} in ${brick.type}`)
  var f = s.bindField
  chai.assert(!!f === !no, `${no ? 'UNEXPECTED' : 'MISSING'} BIND FIELD for ${key} in ${brick.type}`)
  if (!no) {
    chai.assert(f.isVisible(), `INVISIBLE BIND FIELD for ${key} in ${brick.type}`)
  }
  var i = s.input
  if (i) {
    var ff = i.eyo.bindField
    chai.assert(f === ff, `INCONSISTENT BIND FIELD 1 for ${key} in ${brick.type}`)
    var m4t = i.eyo.magnet
    if (m4t) {
      ff = m4t.bindField
      chai.assert(f === ff, `INCONSISTENT BIND FIELD 2 for ${key} in ${brick.type}`)
    }
  }
  brick.dispose()
}

/**
 * Slot [connection] test.
 */
eYo.Test.slot_connect = (brick, key, tb) => {
  chai.assert(brick, 'MISSING d')
  var s = brick.slots[key]
  chai.assert(s === brick[`${key}_s`], `MISSED SLOT SHORTCUT for ${key} in ${brick.type}`)
  if (tb) {
    s.connect(tb)
    chai.assert(s.target === tb.eyo, `MISSED CONNECTION for ${key} in ${brick.type}`)
    chai.assert(tb === brick[`${key}_b`], `MISSED TARGET SHORTCUT for ${key} in ${brick.type}`)
  }
}

/**
 * Test if the wrapped slot is functional.
 * @param {*} brick  a brick
 * @param {string} k  the slot key
 */
eYo.Test.slot_wrapped = (brick, k) => {
  var s = brick.slots[k]
  chai.assert(s, `MISSING wrapped ${k} slot`)
  var t_brick = s.target
  chai.assert(t_brick, 'MISSING target\'s target slot')
  chai.assert(t_brick.parent === brick, 'MISSING parent')
}

eYo.Test.expect_out_check = (brick, check, str) => {
  if (check !== null && !goog.isArray(check)) {
    check = [check]
  }
  chai.assert(chai.expect(brick.magnets.output.check_).to.deep.equal(check), `MISSED output check for ${brick.type}: ${brick.magnets.output.check_} !== ${check}`)
}

/**
 * Dynamic list connection test.
 */
eYo.Test.list_connect = (brick, key, target, name) => {
  chai.assert(brick, 'MISSING d')
  chai.assert(target, 'MISSING target')
  var s = brick.slots[key]
  chai.assert(s.listConnect(target, name), `CONNECTION FAILED`)
  chai.assert(s.targetBrick.inputList.some(input => input.magnet && input.magnet.targetBrick === target), `MISSED CONNECTION for ${key} in ${brick.type}`)
}

/**
 * Subtype.
 */
eYo.Test.subtype = (brick, t) => {
  chai.assert(brick, 'MISSING d')
  t = eYo.T3.Expr[t] || eYo.T3.Stmt[t] || t
  chai.assert(t, 'UNKNOWN subtype')
  chai.assert(brick.subtype === t, `MISSED subtype ${brick.type}: ${brick.subtype} === ${t}`)
}

/**
 * copy/paste.
 */
eYo.Test.copy_paste = (brick, opts) => {
  chai.assert(brick, 'MISSING d')
  var dom = eYo.Xml.brickToDom(brick)
  var dd = eYo.Brick.newReady(brick, dom)
  eYo.Test.same(brick, dd)
  var M = eYo.Brick.Manager.getModel(brick.type)
  Object.keys(M.slots).forEach(k => {
    var key = `${k}_s`
    chai.assert(brick[key].incog === dd[key].incog, `INCONSISTENT INCOG for key ${k}`)
    if (!brick[key].incog) {
      eYo.Test.same_list_length = (brick, dd, k)
    }
  })
  var test = opts && opts.test
  if (goog.isFunction(test)) {
    test(brick, dd)
  }
  var filter = opts && opts.filter
  if (goog.isFunction(filter)) {
    var f = input => {
      var t_brick = input.targetBrick
      if (t_brick) {
        return filter(t_brick)
      }
    }
    var m = brick.inputList.map(f)
    var mm = dd.inputList.map(f)
    chai.assert(chai.expect(m).to.deep.equal(mm), `FAILURE filter`)
  }
  dd.dispose()
}

/**
 * Whether both bricks have the same list length.
 */
eYo.Test.same_list_length = (dlgt1, dlgt2, key) => {
  chai.assert(dlgt1, 'MISSING d')
  chai.assert(dlgt2, 'MISSING dd')
  var s1 = dlgt1.slots[key]
  var s2 = dlgt2.slots[key]
  chai.assert(s1, `MISSING d slot for key ${key}`)
  chai.assert(s2, `MISSING dd slot for key ${key}`)
  var t1_brick = s1.targetBrick
  var t2_brick = s2.targetBrick
  chai.assert(t1_brick, `MISSING d slot target for key ${key}`)
  chai.assert(t2_brick, `MISSING dd slot target for key ${key}`)
  chai.assert(t1_brick.inputList.length === t2_brick.inputList.length, `FAILED inputList length ${t1_brick.inputList.length} === ${t2_brick.inputList.length}`)
}

/**
 * Create a new identifier brick
 */
eYo.Test.newIdentifier = (str) => {
  var brick = eYo.Brick.newReady(eYo.App.workspace, eYo.T3.Expr.identifier)
  brick.target_p = str
  eYo.Test.brick(brick, 'identifier')
  eYo.Test.data_value(brick, 'target', str)
  return brick
}

/**
 * Test if `node` and `parent` exist, and if node's parent is parent.
 * @param {*} svg  either a brick or an svg resource object.
 * @param {string} node  the child element is `svg[node]`
 * @param {string} parent  the parent element is `svg[parent]`, when parent is defined
 */
eYo.Test.svgNodeParent = (svg, node, parent, type) => {
  if (svg.ui) {
    type = type || svg.type
    svg = svg.ui.svg
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
  d.dispose()
}

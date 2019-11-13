setTimeout(() => {
  describe('PREPARE', function() {
    it('Blockly', function() {
      chai.assert(Blockly, `MISSING Blockly`)
      chai.assert(eYo.Node.prototype.toBrick, `MISSING toBrick`)
    })
  })
}, 0)

eYo.Test = Object.create(null)

eYo.Test.makeTestDesk = (id) => {
  var div0 = document.querySelector('#eyo-desk')
  var div1 = goog.dom.createDom('div')
  div1.setAttribute('id', id)
  goog.dom.appendChild(div0.parentNode, div1)
  var style = div1.style
  style.position = 'relative'
  var w  = 10 * eYo.Unit.x
  var h = 5 * eYo.Unit.y
  style.width = `${w}px`
  style.height = `${h}px`
  style.background = 'red'
  style.border = '2px solid gray'
  var desk = new eYo.Desk({
    container: id
  })
  desk.initUI()
  return desk
}

Object.defineProperties(eYo.Test, {
  desk: {
    /**
     * A programmatically created test desk.
     * A `div#eyo-desk` is expected.
     * A `div#eyo-desk-headfull-test` is created.
     */
    get () {
      return this.desk_ || (this.desk_ = eYo.Test.makeTestDesk('#eyo-desk-headfull-test'))
    }
  },
  board: {
    get () {
      return this.board_ || (this.board_ = this.desk.board)
    }
  },
  desk1: {
    /**
     * A programmatically created test desk.
     * A `div#eyo-desk` is expected.
     * A `div#eyo-desk-headfull-test1` is created.
     */
    get () {
      return this.desk1_ || (this.desk1_ = eYo.Test.makeTestDesk('#eyo-desk-headfull-test1'))

    }
  },
  board1: {
    get () {
      return this.board1_ || (this.board1_ = this.desk1.board)
    }
  }
})

eYo.Test.makeDesk = options => {
  if (!eYo.app.board) {
    options = options || {}
    goog.mixin(options, {
      collapse : true,
      disable : true,
      trashCan : false,
      css : true,
      scrollbars : true,
      sounds : false,
      container: 'eyo-desk',
      zoom: {},
    })
    if (options.container && (document.getElementById(options.container) ||
    document.querySelector(options.container))) {
      eYo.app.makeDesk(options)
    }
  }
}

beforeEach(function() {
  eYo.Test.makeDesk(this.mainBoardOptions)
})

eYo.Test.setItUp = () => {
  eYo.app.board.backer.clear()
  eYo.app.board.topBricks_.length = 0
}

eYo.Test.tearItDown = (opt) => {
  eYo.app.board.backer.clear()
  if (!opt || !opt.ignoreTopBrick) {
    chai.assert(eYo.app.board.topBricks_.length === 0, `FAILED ${eYo.app.board.topBricks_.length} === 0`)
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

eYo.Test.new_brick = (t, tt, str, headless) => {
  var type = t = eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t
  var brick = eYo.Brick.newReady(eYo.app.board, type)
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
        var d = eYo.Test.new_brick(args[0], args[1] || args[0])
        args[2] && (eYo.Test.ctor(d, args[2]))
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
  var M = eYo.Brick.Mgr.getModel(brick.type)
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
  var all = d && (d.getAll())
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
  chai.assert(d.slotList.length === k, `BAD INPUT LENGTH ${str || ''} ${Object.keys(d.slots).length} === ${k}`)
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
  if (value !== eYo.NA) {
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
  var brick = eYo.Test.new_brick(type)
  var s = brick.slots[key]
  chai.assert(s, `MISSING SLOT for ${key} in ${brick.type}`)
  var f = s.bindField
  chai.assert(!!f === !no, `${no ? 'UNEXPECTED' : 'MISSING'} BIND FIELD for ${key} in ${brick.type}`)
  if (!no) {
    chai.assert(f.visible, `INVISIBLE BIND FIELD for ${key} in ${brick.type}`)
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
    chai.assert(s.target === tb, `MISSED CONNECTION for ${key} in ${brick.type}`)
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
  var t9k = s.targetBrick
  chai.assert(t9k, 'MISSING target\'s target slot')
  chai.assert(t9k.parent === brick, 'MISSING parent')
}

eYo.Test.expect_out_check = (brick, check, str) => {
  if (check !== null && !goog.isArray(check)) {
    check = [check]
  }
  chai.assert(chai.expect(brick.out_m.check_).to.deep.equal(check), `MISSED output check for ${brick.type}: ${brick.out_m.check_} !== ${check}`)
}

/**
 * Dynamic list connection test.
 */
eYo.Test.list_connect = (brick, key, target, name) => {
  chai.assert(brick, 'MISSING d')
  chai.assert(target, 'MISSING target')
  var s = brick.slots[key]
  chai.assert(s.listConnect(target, name), `CONNECTION FAILED`)
  chai.assert(s.targetBrick.someSlot(slot => slot.magnet && slot.targetBrick === target), `MISSED CONNECTION for ${key} in ${brick.type}`)
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
  var M = eYo.Brick.Mgr.getModel(brick.type)
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
    var f = slot => {
      var t9k = slot.targetBrick
      if (t9k) {
        return filter(t9k)
      }
    }
    var m = brick.slotList.map(f)
    var mm = dd.slotList.map(f)
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
  chai.assert(Object.keys(t1_brick.slots).length === Object.keys(t2_brick.slots).length, `FAILED slotList length ${Object.keys(t1_brick.slots).length} === ${Object.keys(t2_brick.slots).length}`)
}

/**
 * Create a new identifier brick
 */
eYo.Test.newIdentifier = (str) => {
  var brick = eYo.Brick.newReady(eYo.app.board, eYo.T3.Expr.identifier)
  brick.target_p = str
  eYo.Test.brick(brick, 'identifier')
  eYo.Test.data_value(brick, 'target', str)
  return brick
}

/**
 * Test if `node` and `parent` exist, and if node's parent is parent.
 * @param {*} svg  either a brick or a dom resource object.
 * @param {string} node  the child element is `svg[node]`
 * @param {string} parent  the parent element is `svg[parent]`, when parent is defined
 * @param {?string} type
 */
eYo.Test.svgNodeParent = (bdom, node, parent, type) => {
  if (bdom.ui) {
    type = type || bdom.type
    bdom = bdom.dom
    chai.assert(bdom, `MISSING dom in ${type}`)
  } else {
    type = type || 'svg'
  }
  chai.assert(bdom[node], `MISSING svg.${node} in ${type}`)
  if (goog.isString(parent)) {
    chai.assert(bdom[parent], `MISSING svg.${parent} in ${type}`)
    chai.assert(bdom[node].parentNode === bdom[parent], `MISSING svg.${node}.parentNode === svg.${parent} in ${type}`)
  } else if (parent) {
    chai.assert(bdom[node].parentNode === parent, `MISSING svg.${node}.parentNode === ${parent} in ${type}`)
  }
}

/**
 * Test the various string as python source code
 * @param {string} str  The source code to test.
 */
eYo.Test.source = (str) => {
  var err_ret = {}
  var n = eYo.Parser.PyParser_ParseString(str, eYo.GMR._PyParser_Grammar, eYo.TKN.file_input, err_ret)
  var d = n.toBrick(eYo.app.board)
  if (!d) {
    eYo.GMR.showtree(eYo.GMR._PyParser_Grammar, n)
  }
  chai.assert(d, `WHERE IS THE BLOCK ${n.type}/${n.name}`)
  eYo.Test.code(d, str)
  d.dispose()
}

/**
 * Test the span of bricks, usage:
 *     
  eYo.Test.span(b, {
    c_min: 2,
    c_padding: 0,
    c: 2,
    header: 0,
    main: 1,
    hole: 0,
    footer: 0,
    suite: 0,
    foot: 0,
    l: 1,
  })
 * When any key is omitted, the defaut value is used instead.
 * @param {string} str  The source code to test.
 */
eYo.Test.span = (b, span) => {
  [
    'c_padding',
    'header',
    'footer',
    'suite',
    'foot',
  ].forEach(k => { span[k] || (span[k] = 0) })
  span.c_min || (span.c_min = b.wrapped ? 0 : b.isGroup ? 2 * eYo.Span.INDENT : b.isStmt ? eYo.Span.INDENT : 2)
  span.c || (span.c = span.c_min + span.c_padding)
  span.main || (span.main = 1)
  span.hole || (span.hole = b.isGroup && (!b.right || b.right.isComment) ? 1 : 0)
  span.l || (span.l = 
    b.isGroup
    ? span.main + span.hole + span.suite
    : b.isStmt
      ? span.header + span.main + span.footer
      : span.main
  )
  ;[
    'c_min',
    'c_padding',
    'c',
    'main',
    'header',
    'footer',
    'suite',
    'l',
    'foot',
  ].forEach(k => {
    chai.assert(b.span[k] === span[k], `MISSED span ${k}: ${b.span[k]} === ${span[k]}`)
  })
  
}


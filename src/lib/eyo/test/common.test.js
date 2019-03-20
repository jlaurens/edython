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
  var workspace = Blockly.inject('eyoDiv', options);
  eYo.setup(workspace)
  workspace.eyo.options = {
    noLeftSeparator: true,
    noDynamicList: false,
    smartUnary: true,
  }
  workspace.clearUndo()
})()

chai.assert(Blockly.mainWorkspace, 'NO MAIN WORKSPACE')

eYo.Test.g = eYo.GMR._PyParser_Grammar

eYo.Test.assert_ctor = (b, k) => {
  chai.assert(b.eyo.constructor.eyo.key === k, `MISSED CTOR KEY ${b.eyo.constructor.eyo.key} === ${k}`)
}

eYo.Test.assert_block = (b, t, str) => {
  t = eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t
  chai.assert(b, `MISSING BLOCK TYPE ${t || ''}`)
  chai.assert(!t || (b.type === t), `MISSED TYPE ${str || ''} ${b.type} === ${t}`)
}

eYo.Test.new_block = (t, tt, str) => {
  t = eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t
  var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, t)
  eYo.Test.assert_block(b, tt, str)
  return b
}

/** Usage
  eYo.Test.assert_incog(block,
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
eYo.Test.assert_incog = (b, keys) => {
  var M = eYo.Delegate.Manager.getModel(b.type)
  Object.keys(M.slots).forEach(k => {
    var yorn = keys.indexOf(k) >= 0
    chai.assert(!b.eyo[`${k}_s`].isIncog() === yorn, `${yorn ? 'MISSING' : 'UNEXPECTED'} ${k.toUpperCase()} INCOG`)
  })
}

eYo.Test.assert_variant = (b, variant, str) => {
  variant = eYo.Key[variant] || variant
  chai.assert(b.eyo.variant_p === variant, `MISSED VARIANT ${str || ''} ${b.eyo.variant_p} === ${variant}`)
}

eYo.Test.assert_comment_variant = (b, comment_variant, str) => {
  comment_variant = eYo.Key[comment_variant] || comment_variant
  chai.assert(b.eyo.comment_variant_p === comment_variant, `MISSED COMMENT VARIANT ${str || ''} ${b.eyo.comment_variant_p} === ${comment_variant}`)
}

eYo.Test.assert_code = (b, str) => {
  chai.assert(b.eyo.toLinearString === str, `MISSED: ${b.eyo.toLinearString} === ${str}`)
}

eYo.Test.assert_input_length = (t, k, str) => {
  chai.assert(t.inputList.length === k, `BAD INPUT LENGTH ${str} ${t.inputList.length} === ${k}`)
}

/**
 * Whether both blocks have the same type and variant.
 */
eYo.Test.assert_same = (b, bb) => {
  chai.assert(b, 'MISSING b')
  chai.assert(bb, 'MISSING bb')
  chai.assert(b.type === bb.type, `BAD TYPE ${b.type} === ${bb.type}`)
  chai.assert(b.variant_p === bb.variant_p, `BAD VARIANT ${b.variant_p} === ${bb.variant_p}`)
}

/**
 * Data key test.
 * Data are uniquely defined by their key.
 */
eYo.Test.assert_data_key = (b, key, value) => {
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
 * change the data of the block,
 * get the dom, create a block from that block,
 * and compare the data values.
 * Change back the data.
 */
eYo.Test.assert_data_save = (b, key, value, ignore) => {
  chai.assert(b, 'MISSING b')
  var d = b.eyo.data[key]
  chai.assert(d, `UNKNOWN DATA KEY: ${key}`)
  var old = b.eyo[`${key}_p`]
  b.eyo[`${key}_p`] = value
  var dom = eYo.Xml.blockToDom(b)
  if (ignore) {
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
eYo.Test.assert_bind_field = (type, key, no) => {
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
 * Slot connection test.
 */
eYo.Test.assert_slot_connect = (b, key, target) => {
  chai.assert(b, 'MISSING b')
  var s = b.eyo.slots[key]
  s.connect(target)
  chai.assert(s.target == target.eyo, `MISSED CONNECTION for ${key} in ${b.type}`)
  chai.assert(s === b.eyo[`${key}_s`], `MISSED SLOT SHORTCUT for ${key} in ${b.type}`)
}

eYo.Test.expect_out_check = (b, check, str) => {
  if (check !== null && !goog.isArray(check)) {
    check = [check]
  }
  chai.assert(chai.expect(b.outputConnection.check_).to.deep.equal(check), `MISSED output check for ${b.type}: ${b.outputConnection.check_} !== ${check}`)
}

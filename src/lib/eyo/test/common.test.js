setTimeout(() => {
  describe('PREPARE', function() {
    it('Blockly', function() {
      chai.assert(Blockly, `MISSING Blockly`)
      chai.assert(Blockly.mainWorkspace, `MISSING Blockly.mainWorkspace`)
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

eYo.Test.ctor = (b, k) => {
  chai.assert(b.eyo.constructor.eyo.key === k, `MISSED CTOR KEY ${b.eyo.constructor.eyo.key} === ${k}`)
}

eYo.Test.block = (b, t, str) => {
  t = eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t
  chai.assert(b, `MISSING BLOCK TYPE ${t || ''}`)
  chai.assert(!t || (b.type === t), `MISSED TYPE ${str || ''} ${b.type} === ${t}`)
}

eYo.Test.new_block = (t, tt, str) => {
  t = eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t
  var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, t)
  eYo.Test.block(b, tt, str)
  return b
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

eYo.Test.comment_variant = (b, comment_variant, str) => {
  comment_variant = eYo.Key[comment_variant] || comment_variant
  chai.assert(b.eyo.comment_variant_p === comment_variant, `MISSED COMMENT VARIANT ${str || ''} ${b.eyo.comment_variant_p} === ${comment_variant}`)
}

eYo.Test.code = (b, str) => {
  var str1 = str.replace(/(?:\r\n|\r)/g, '\n').replace(/\s+/g, '')
  if (str1.endsWith('\n')) {
    str1 = str1.substring(0, str.length - 1)
  }
  var s = b.eyo.toString.replace(/\bNOM\b/g, 'NAME')
  var s1 = s.replace(/(?:\r\n|\r)/g, '\n').replace(/\s+/g, '')
  chai.assert(s1 === str1, `MISSED: ${s} === ${str}`)
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
  var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, d)
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
 * Whether both blocks have the same type and variant.
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
  var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
  b.eyo.target_p = str
  eYo.Test.block(b, 'identifier')
  eYo.Test.data_value(b, 'target', str)
  return b
}

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

eYo.Test.assert_same = (b, bb) => {
  chai.assert(b, 'MISSING b')
  chai.assert(bb, 'MISSING bb')
  chai.assert(b.type === bb.type, `BAD TYPE ${b.type} === ${bb.type}`)
  chai.assert(b.variant_p === bb.variant_p, `BAD VARIANT ${b.variant_p} === ${bb.variant_p}`)
}

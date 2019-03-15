eYo.Test = Object.create(null)

eYo.Test.g = eYo.GMR._PyParser_Grammar

eYo.Test.assert_ctor = (b, k) => {
  chai.assert(b.eyo.constructor.eyo.key === k, `MISSED CTOR KEY ${b.eyo.constructor.eyo.key} === ${k}`)
}

eYo.Test.assert_type = (b, t, str) => {
  t = eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t
  chai.assert(b.type === t, `MISSED TYPE ${str || ''} ${b.type} === ${t}`)
}

eYo.Test.assert_block = (b, t, str) => {
  t = eYo.T3.Stmt[t] || eYo.T3.Expr[t] || t
  chai.assert(b, `MISSING BLOCK TYPE ${t}`)
  eYo.Test.assert_type(b, t, str)
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
eYo.Test.assert_incog = (b, keys, t) => {
  t = eYo.Key.Stmt[t] || eYo.Key.Expr[t] || t
  var M = eYo.Delegate.Manager.getModel(t)
  Object.keys(M.slots).forEach(k => {
    var yorn = keys.indexOf(k) >= 0
    chai.assert(!b.eyo.target_s.isIncog() === yorn, `${yorn ? 'MISSING' : 'UNEXPECTED'} ${k.toUpperCase()} INCOG`)
  })
}

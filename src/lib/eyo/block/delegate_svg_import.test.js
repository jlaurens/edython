describe('Import statement (BASIC)', function() {
  it(`Variant change effect`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.import_stmt)
    eYo.Test.block(b, 'import_stmt')
    eYo.Test.variant(b, 'IMPORT')
    eYo.Test.incog(b,
      ['import_module',
      'Xfrom',
      'Ximport',
      'Ximport_star'])
    eYo.Test.code(b, 'import <MISSING NAME>')
    b.eyo.variant_p = eYo.Key.FROM_MODULE_IMPORT
    eYo.Test.variant(b, 'FROM_MODULE_IMPORT')
    eYo.Test.incog(b,
      ['Ximport_module',
      'from',
      'import',
      'Ximport_star'])
    eYo.Test.code(b, 'from <MISSING NAME> import <MISSING NAME>')
    b.eyo.variant_p = eYo.Key.IMPORT
    eYo.Test.variant(b, 'IMPORT')
    eYo.Test.incog(b,
      ['import_module',
      'Xfrom',
      'Ximport',
      'Ximport_star'])
    eYo.Test.code(b, 'import <MISSING NAME>')
    b.eyo.variant_p = eYo.Key.FROM_MODULE_IMPORT_STAR
    eYo.Test.variant(b, 'FROM_MODULE_IMPORT_STAR')
    eYo.Test.incog(b,
      ['Ximport_module',
      'from',
      'Ximport',
      'import_star'])
    eYo.Test.code(b, 'from <MISSING NAME> import *')
    b.eyo.variant_p = eYo.Key.IMPORT
    eYo.Test.variant(b, 'IMPORT')
    eYo.Test.incog(b,
      ['import_module',
      'Xfrom',
      'Ximport',
      'Ximport_star'])
    eYo.Test.code(b, 'import <MISSING NAME>')
    b.dispose()
  })
  ;[
    'IMPORT',
    'FROM_MODULE_IMPORT',
    'FROM_MODULE_IMPORT_STAR'
  ].forEach(k => {
    it (`Copy/Paste same variant ${k}`, function () {
      var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.import_stmt)
      eYo.Test.set_variant(b, k)
      eYo.Test.copy_paste(b)
      b.dispose()
    })
  })
})
describe('from module import …', function() {
  this.timeout(5000)
  it(`from foo.bar import *`, function () {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.import_stmt)
    b.eyo.from_p = 'foo.bar'
    eYo.Test.data_value(b, 'from', 'foo.bar')
    b.dispose()
  })
  it(`… -> from ? import abc`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.set_variant(b, args[0])
      b.eyo.import_p = 'abc'
      eYo.Test.data_value(b, 'import', 'abc')
      eYo.Test.variant(b, args[1] || 'FROM_MODULE_IMPORT')
      eYo.Test.code(b, `from <MISSING NAME> import abc`)
      b.eyo.import_p = ''
      eYo.Test.data_value(b, 'import', '')
      eYo.Test.variant(b, args[1] || 'FROM_MODULE_IMPORT')
      eYo.Test.code(b, `from <MISSING NAME> import <MISSING NAME>`)
    })
    b.dispose()
  })
  it(`… -> from ? import <abc>, …`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.set_variant(b, args[0])
      var bb = eYo.Test.newIdentifier('abc')
      eYo.Test.list_connect(b, 'import', bb)
      eYo.Test.variant(b, 'FROM_MODULE_IMPORT')
      eYo.Test.code(b, `from <MISSING NAME> import abc`)
      bb = eYo.Test.newIdentifier('cde')
      eYo.Test.list_connect(b, 'import', bb)
      eYo.Test.variant(b, 'FROM_MODULE_IMPORT')
      eYo.Test.code(b, `from <MISSING NAME> import abc, cde`)
      b.eyo.import_s.unwrappedTarget.dispose()
      eYo.Test.variant(b, 'FROM_MODULE_IMPORT')
      eYo.Test.code(b, `from <MISSING NAME> import cde`)
      b.eyo.import_s.unwrappedTarget.dispose()
      eYo.Test.variant(b, 'FROM_MODULE_IMPORT')
      eYo.Test.code(b, `from <MISSING NAME> import <MISSING NAME>`)
    })
    b.dispose()
  })
  it(`… -> from abc import ?`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT', 'FROM_MODULE_IMPORT', '<MISSING NAME>'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.set_variant(b, args[0])
      b.eyo.from_p = 'abc'
      eYo.Test.data_value(b, 'from', 'abc')
      eYo.Test.variant(b, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.code(b, `from abc import ${args[2] || '*'}`)
      b.eyo.from_p = ''
      eYo.Test.data_value(b, 'from', '')
      eYo.Test.variant(b, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.code(b, `from <MISSING NAME> import ${args[2] || '*'}`)
    })
    b.dispose()
  })
  it(`… -> from <abc> import ?`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT', 'FROM_MODULE_IMPORT', '<MISSING NAME>'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.set_variant(b, args[0])
      var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
      bb.eyo.target_p = 'abc'
      eYo.Test.data_value(bb, 'target', 'abc')
      eYo.Test.slot_connect(b, 'from', bb)
      eYo.Test.variant(b, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.code(b, `from abc import ${args[2] || '*'}`)
      bb.dispose()
      eYo.Test.variant(b, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.code(b, `from <MISSING NAME> import ${args[2] || '*'}`)
    })
    b.dispose()
  })
  it(`… -> from abc import ? <-> from <abc> import ?`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT', 'FROM_MODULE_IMPORT', '<MISSING NAME>'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.set_variant(b, args[0])
      b.eyo.from_p = 'abc'
      eYo.Test.data_value(b, 'from', 'abc')
      eYo.Test.variant(b, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.code(b, `from abc import ${args[2] || '*'}`)      
      var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
      bb.eyo.target_p = 'cde'
      eYo.Test.data_value(bb, 'target', 'cde')
      eYo.Test.slot_connect(b, 'from', bb)
      eYo.Test.variant(b, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.code(b, `from cde import ${args[2] || '*'}`)
      bb.dispose()
      eYo.Test.variant(b, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.code(b, `from abc import ${args[2] || '*'}`)      
    })
    b.dispose()
  })
})
describe('import module', function() {
  it(`import abc -> import ?`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.import_stmt)
    ;[
      'IMPORT',
      'FROM_MODULE_IMPORT',
      'FROM_MODULE_IMPORT_STAR'
    ].forEach(k => {
      eYo.Test.set_variant(b, k)
      b.eyo.import_module_p = 'abc'
      eYo.Test.code(b, 'import abc')
      b.eyo.import_module_p = ''
      eYo.Test.code(b, 'import <MISSING NAME>')
      b.eyo.import_module_p = 'abc'
      eYo.Test.set_variant(b, k)
      var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
      bb.eyo.target_p = 'bcd'
      eYo.Test.list_connect(b, 'import_module', bb)
      eYo.Test.code(b, 'import bcd')
      bb = b.eyo.import_module_s.unwrappedTarget
      eYo.Test.block(bb, 'identifier')
      eYo.Test.input_length(b.eyo.import_module_b, 3)
      bb.dispose()
      eYo.Test.input_length(b.eyo.import_module_b, 1)
      eYo.Test.code(b, 'import abc')
      b.eyo.import_module_p = ''
      eYo.Test.code(b, 'import <MISSING NAME>')
    })
    b.dispose()
  })
  it (`import abc -> import <bcd> -> …`, function () {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.import_stmt)
    b.eyo.import_module_p = 'abc'
    eYo.Test.code(b, 'import abc')
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    bb.eyo.target_p = 'bcd'
    eYo.Test.list_connect(b, 'import_module', bb)
    eYo.Test.code(b, 'import bcd')
    bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    bb.eyo.target_p = 'cde'
    eYo.Test.list_connect(b, 'import_module', bb)
    eYo.Test.code(b, 'import bcd, cde')
    b.eyo.import_module_s.unwrappedTarget.dispose()
    eYo.Test.code(b, 'import cde')
    b.eyo.import_module_s.unwrappedTarget.dispose()
    eYo.Test.code(b, 'import abc')
    b.dispose()
  })
})
describe('Copy/Paste', function () {
  it(`import ?`, function () {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.import_stmt)
    eYo.Test.set_variant(b, 'IMPORT')
    eYo.Test.copy_paste(b)
    b.eyo.import_p = 'abc'
    eYo.Test.copy_paste(b, (b, bb) => {
      eYo.Test.data_value(bb, 'import', b.eyo.import_p)
    })
    eYo.Test.list_connect(b, 'import', eYo.Test.newIdentifier('bcd'))
    eYo.Test.copy_paste(b, {test: (b, bb) => {
      eYo.Test.data_value(bb, 'import', '')
      eYo.Test.data_value(bb.eyo.import_s.unwrappedTarget.block_, 'target', 'bcd')
    }})
    eYo.Test.list_connect(b, 'import', eYo.Test.newIdentifier('cde'))
    eYo.Test.copy_paste(b, {test: (b, bb) => {
      eYo.Test.data_value(bb, 'import', '')
      b = bb.eyo.import_s.unwrappedTarget.block_
      eYo.Test.data_value(b, 'target', 'bcd')
      b.dispose()
      b = bb.eyo.import_s.unwrappedTarget.block_
      eYo.Test.data_value(b, 'target', 'cde')
    },
    filter: t_eyo => t_eyo.target_p})
    b.dispose()
  })
  it(`from … import ?`, function () {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.import_stmt)
    eYo.Test.set_variant(b, 'FROM_MODULE_IMPORT')
    eYo.Test.copy_paste(b)
    b.eyo.from_p = 'abc'
    eYo.Test.copy_paste(b, (b, bb) => {
      eYo.Test.data_value(bb, 'from', b.eyo.from_p)
    })
    eYo.Test.slot_connect(b, 'from', eYo.Test.newIdentifier('bcd'))
    eYo.Test.copy_paste(b, {test: (b, bb) => {
      eYo.Test.data_value(bb, 'from', '')
      eYo.Test.data_value(bb.eyo.from_b, 'target', 'bcd')
    }})
    b.dispose()
  })
  it(`from ? import …`, function () {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.import_stmt)
    eYo.Test.set_variant(b, 'FROM_MODULE_IMPORT')
    eYo.Test.copy_paste(b)
    b.eyo.import_p = 'abc'
    eYo.Test.copy_paste(b, (b, bb) => {
      eYo.Test.data_value(bb, 'import', b.eyo.import_p)
    })
    eYo.Test.list_connect(b, 'import', eYo.Test.newIdentifier('bcd'))
    eYo.Test.copy_paste(b, {
      test: (b, bb) => {
        eYo.Test.data_value(bb, 'from', '')
      },
      filter: eyo => eyo.target_p
    })
    b.dispose()
  })
  it(`from … import *`, function () {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.import_stmt)
    eYo.Test.set_variant(b, 'FROM_MODULE_IMPORT_STAR')
    eYo.Test.copy_paste(b)
    b.eyo.from_p = 'abc'
    eYo.Test.copy_paste(b, (b, bb) => {
      eYo.Test.data_value(bb, 'from', b.eyo.from_p)
    })
    eYo.Test.slot_connect(b, 'from', eYo.Test.newIdentifier('bcd'))
    eYo.Test.copy_paste(b, {test: (b, bb) => {
      eYo.Test.data_value(bb, 'from', '')
      eYo.Test.data_value(bb.eyo.from_b, 'target', 'bcd')
    }})
    b.dispose()
  })
})
describe('Import statement (BASIC)', function() {
  it(`Variant change effect`, function() {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
    eYo.Test.brick(d, 'import_stmt')
    eYo.Test.variant(d, 'IMPORT')
    eYo.Test.incog(d,
      ['import_module',
      'Xfrom',
      'Ximport',
      'Ximport_star'])
    eYo.Test.code(d, 'import <MISSING NAME>')
    d.variant_p = eYo.Key.FROM_MODULE_IMPORT
    eYo.Test.variant(d, 'FROM_MODULE_IMPORT')
    eYo.Test.incog(d,
      ['Ximport_module',
      'from',
      'import',
      'Ximport_star'])
    eYo.Test.code(d, 'from <MISSING NAME> import <MISSING NAME>')
    d.variant_p = eYo.Key.IMPORT
    eYo.Test.variant(d, 'IMPORT')
    eYo.Test.incog(d,
      ['import_module',
      'Xfrom',
      'Ximport',
      'Ximport_star'])
    eYo.Test.code(d, 'import <MISSING NAME>')
    d.variant_p = eYo.Key.FROM_MODULE_IMPORT_STAR
    eYo.Test.variant(d, 'FROM_MODULE_IMPORT_STAR')
    eYo.Test.incog(d,
      ['Ximport_module',
      'from',
      'Ximport',
      'import_star'])
    eYo.Test.code(d, 'from <MISSING NAME> import *')
    d.variant_p = eYo.Key.IMPORT
    eYo.Test.variant(d, 'IMPORT')
    eYo.Test.incog(d,
      ['import_module',
      'Xfrom',
      'Ximport',
      'Ximport_star'])
    eYo.Test.code(d, 'import <MISSING NAME>')
    d.dispose()
  })
  ;[
    'IMPORT',
    'FROM_MODULE_IMPORT',
    'FROM_MODULE_IMPORT_STAR'
  ].forEach(k => {
    it (`Copy/Paste same variant ${k}`, function () {
      var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
      eYo.Test.set_variant(d, k)
      eYo.Test.copy_paste(d)
      d.dispose()
    })
  })
})
describe('from module import …', function() {
  this.timeout(5000)
  it(`from foo.bar import *`, function () {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
    d.from_p = 'foo.bar'
    eYo.Test.data_value(d, 'from', 'foo.bar')
    d.dispose()
  })
  it(`from ... import ?`, function () {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
    d.from_p = '...'
    eYo.Test.data_value(d, 'from', '...')
    d.dispose()
  })
  it(`… -> from ? import abc`, function() {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.set_variant(d, args[0])
      d.import_p = 'abc'
      eYo.Test.data_value(d, 'import', 'abc')
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT')
      eYo.Test.code(d, `from <MISSING NAME> import abc`)
      d.import_p = ''
      eYo.Test.data_value(d, 'import', '')
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT')
      eYo.Test.code(d, `from <MISSING NAME> import <MISSING NAME>`)
    })
    d.dispose()
  })
  it(`… -> from ? import <abc>, …`, function() {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.set_variant(d, args[0])
      var dd = eYo.Test.newIdentifier('abc')
      eYo.Test.list_connect(d, 'import', dd)
      eYo.Test.variant(d, 'FROM_MODULE_IMPORT')
      eYo.Test.code(d, `from <MISSING NAME> import abc`)
      dd = eYo.Test.newIdentifier('cde')
      eYo.Test.list_connect(d, 'import', dd)
      eYo.Test.variant(d, 'FROM_MODULE_IMPORT')
      eYo.Test.code(d, `from <MISSING NAME> import abc, cde`)
      d.import_s.unwrappedTarget.dispose()
      eYo.Test.variant(d, 'FROM_MODULE_IMPORT')
      eYo.Test.code(d, `from <MISSING NAME> import cde`)
      d.import_s.unwrappedTarget.dispose()
      eYo.Test.variant(d, 'FROM_MODULE_IMPORT')
      eYo.Test.code(d, `from <MISSING NAME> import <MISSING NAME>`)
    })
    d.dispose()
  })
  it(`… -> from abc import ?`, function() {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT', 'FROM_MODULE_IMPORT', '<MISSING NAME>'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.set_variant(d, args[0])
      d.from_p = 'abc'
      eYo.Test.data_value(d, 'from', 'abc')
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.code(d, `from abc import ${args[2] || '*'}`)
      d.from_p = ''
      eYo.Test.data_value(d, 'from', '')
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.code(d, `from <MISSING NAME> import ${args[2] || '*'}`)
    })
    d.dispose()
  })
  it(`… -> from <abc> import ?`, function() {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT', 'FROM_MODULE_IMPORT', '<MISSING NAME>'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.set_variant(d, args[0])
      var dd = eYo.Test.new_brick(eYo.T3.Expr.identifier)
      dd.target_p = 'abc'
      eYo.Test.data_value(dd, 'target', 'abc')
      eYo.Test.slot_connect(d, 'from', dd)
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.code(d, `from abc import ${args[2] || '*'}`)
      dd.dispose()
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.code(d, `from <MISSING NAME> import ${args[2] || '*'}`)
    })
    d.dispose()
  })
  it(`… -> from abc import ? <-> from <abc> import ?`, function() {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT', 'FROM_MODULE_IMPORT', '<MISSING NAME>'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.set_variant(d, args[0])
      d.from_p = 'abc'
      eYo.Test.data_value(d, 'from', 'abc')
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.code(d, `from abc import ${args[2] || '*'}`)
      var dd = eYo.Test.new_brick(eYo.T3.Expr.identifier)
      dd.target_p = 'cde'
      eYo.Test.data_value(dd, 'target', 'cde')
      eYo.Test.slot_connect(d, 'from', dd)
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.code(d, `from cde import ${args[2] || '*'}`)
      dd.dispose()
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.code(d, `from abc import ${args[2] || '*'}`)
    })
    d.dispose()
  })
})
describe('import module', function() {
  it(`import abc -> import ?`, function() {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
    ;[
      'IMPORT',
      'FROM_MODULE_IMPORT',
      'FROM_MODULE_IMPORT_STAR'
    ].forEach(k => {
      eYo.Test.set_variant(d, k)
      d.import_module_p = 'abc'
      eYo.Test.code(d, 'import abc')
      d.import_module_p = ''
      eYo.Test.code(d, 'import <MISSING NAME>')
      d.import_module_p = 'abc'
      eYo.Test.set_variant(d, k)
      var dd = eYo.Test.new_brick(eYo.T3.Expr.identifier)
      dd.target_p = 'bcd'
      eYo.Test.list_connect(d, 'import_module', dd)
      eYo.Test.code(d, 'import bcd')
      dd = d.import_module_s.unwrappedTarget
      eYo.Test.brick(dd, 'identifier')
      eYo.Test.input_length(d.import_module_b, 3)
      dd.dispose()
      eYo.Test.input_length(d.import_module_b, 1)
      eYo.Test.code(d, 'import abc')
      d.import_module_p = ''
      eYo.Test.code(d, 'import <MISSING NAME>')
    })
    d.dispose()
  })
  it (`import abc -> import <bcd> -> …`, function () {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
    d.import_module_p = 'abc'
    eYo.Test.code(d, 'import abc')
    var dd = eYo.Test.new_brick(eYo.T3.Expr.identifier)
    dd.target_p = 'bcd'
    eYo.Test.list_connect(d, 'import_module', dd)
    eYo.Test.code(d, 'import bcd')
    dd = eYo.Test.new_brick(eYo.T3.Expr.identifier)
    dd.target_p = 'cde'
    eYo.Test.list_connect(d, 'import_module', dd)
    eYo.Test.code(d, 'import bcd, cde')
    d.import_module_s.unwrappedTarget.dispose()
    eYo.Test.code(d, 'import cde')
    d.import_module_s.unwrappedTarget.dispose()
    eYo.Test.code(d, 'import abc')
    d.dispose()
  })
})
describe('Copy/Paste', function () {
  it(`import ?`, function () {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
    eYo.Test.set_variant(d, 'IMPORT')
    eYo.Test.copy_paste(d)
    d.import_p = 'abc'
    eYo.Test.copy_paste(d, (d, dd) => {
      eYo.Test.data_value(dd, 'import', d.import_p)
    })
    eYo.Test.list_connect(d, 'import', eYo.Test.newIdentifier('bcd'))
    eYo.Test.copy_paste(d, {test: (d, dd) => {
      eYo.Test.data_value(dd, 'import', '')
      eYo.Test.data_value(dd.import_s.unwrappedTarget, 'target', 'bcd')
    }})
    eYo.Test.list_connect(d, 'import', eYo.Test.newIdentifier('cde'))
    eYo.Test.copy_paste(d, {test: (d, dd) => {
      eYo.Test.data_value(dd, 'import', '')
      var d = dd.import_s.unwrappedTarget
      eYo.Test.data_value(d, 'target', 'bcd')
      d.dispose()
      d = dd.import_s.unwrappedTarget
      eYo.Test.data_value(d, 'target', 'cde')
    },
    filter: t9k => t9k.target_p})
    d.dispose()
  })
  it(`from … import ?`, function () {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
    eYo.Test.set_variant(d, 'FROM_MODULE_IMPORT')
    eYo.Test.copy_paste(d)
    d.from_p = 'abc'
    eYo.Test.copy_paste(d, (d, dd) => {
      eYo.Test.data_value(dd, 'from', dd.from_p)
    })
    eYo.Test.slot_connect(d, 'from', eYo.Test.newIdentifier('bcd'))
    eYo.Test.copy_paste(d, {test: (d, dd) => {
      eYo.Test.data_value(dd, 'from', '')
      eYo.Test.data_value(dd.from_b, 'target', 'bcd')
    }})
    d.dispose()
  })
  it(`from ? import …`, function () {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
    eYo.Test.set_variant(d, 'FROM_MODULE_IMPORT')
    eYo.Test.copy_paste(d)
    d.import_p = 'abc'
    eYo.Test.copy_paste(d, (d, dd) => {
      eYo.Test.data_value(dd, 'import', d.import_p)
    })
    eYo.Test.list_connect(d, 'import', eYo.Test.newIdentifier('bcd'))
    eYo.Test.copy_paste(d, {
      test: (d, dd) => {
        eYo.Test.data_value(dd, 'from', '')
      },
      filter: eyo => eyo.target_p
    })
    d.dispose()
  })
  it(`from … import *`, function () {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.import_stmt)
    eYo.Test.set_variant(d, 'FROM_MODULE_IMPORT_STAR')
    eYo.Test.copy_paste(d)
    d.from_p = 'abc'
    eYo.Test.copy_paste(d, (d, dd) => {
      eYo.Test.data_value(dd, 'from', d.from_p)
    })
    eYo.Test.slot_connect(d, 'from', eYo.Test.newIdentifier('bcd'))
    eYo.Test.copy_paste(d, {test: (d, dd) => {
      eYo.Test.data_value(dd, 'from', '')
      eYo.Test.data_value(dd.from_b, 'target', 'bcd')
    }})
    d.dispose()
  })
})
eYo.Debug.test() // remove this line when finished

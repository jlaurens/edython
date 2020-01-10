describe('Import statement (BASIC)', function() {
  it(`Variant change effect`, function() {
    var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
    eYo.Test.Brick(d, 'import_stmt')
    eYo.Test.variant(d, 'IMPORT')
    eYo.Test.incog(d,
      ['import_module',
      'Xfrom',
      'Ximport',
      'Ximport_star'])
    eYo.Test.Code(d, 'import <MISSING NAME>')
    d.Variant_p = eYo.key.FROM_MODULE_IMPORT
    eYo.Test.variant(d, 'FROM_MODULE_IMPORT')
    eYo.Test.incog(d,
      ['Ximport_module',
      'from',
      'import',
      'Ximport_star'])
    eYo.Test.Code(d, 'from <MISSING NAME> import <MISSING NAME>')
    d.Variant_p = eYo.key.IMPORT
    eYo.Test.variant(d, 'IMPORT')
    eYo.Test.incog(d,
      ['import_module',
      'Xfrom',
      'Ximport',
      'Ximport_star'])
    eYo.Test.Code(d, 'import <MISSING NAME>')
    d.Variant_p = eYo.key.FROM_MODULE_IMPORT_STAR
    eYo.Test.variant(d, 'FROM_MODULE_IMPORT_STAR')
    eYo.Test.incog(d,
      ['Ximport_module',
      'from',
      'Ximport',
      'import_star'])
    eYo.Test.Code(d, 'from <MISSING NAME> import *')
    d.Variant_p = eYo.key.IMPORT
    eYo.Test.variant(d, 'IMPORT')
    eYo.Test.incog(d,
      ['import_module',
      'Xfrom',
      'Ximport',
      'Ximport_star'])
    eYo.Test.Code(d, 'import <MISSING NAME>')
    d.dispose()
  })
  ;[
    'IMPORT',
    'FROM_MODULE_IMPORT',
    'FROM_MODULE_IMPORT_STAR'
  ].forEach(k => {
    it (`Copy/Paste same variant ${k}`, function () {
      var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
      eYo.Test.Set_variant(d, k)
      eYo.Test.Copy_paste(d)
      d.dispose()
    })
  })
})
describe('from module import …', function() {
  this.timeout(5000)
  it(`from foo.bar import *`, function () {
    var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
    d.From_p = 'foo.bar'
    eYo.Test.data_value(d, 'from', 'foo.bar')
    d.dispose()
  })
  it(`from ... import ?`, function () {
    var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
    d.From_p = '...'
    eYo.Test.data_value(d, 'from', '...')
    d.dispose()
  })
  it(`… -> from ? import abc`, function() {
    var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.Set_variant(d, args[0])
      d.Import_p = 'abc'
      eYo.Test.data_value(d, 'import', 'abc')
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT')
      eYo.Test.Code(d, `from <MISSING NAME> import abc`)
      d.Import_p = ''
      eYo.Test.data_value(d, 'import', '')
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT')
      eYo.Test.Code(d, `from <MISSING NAME> import <MISSING NAME>`)
    })
    d.dispose()
  })
  it(`… -> from ? import <abc>, …`, function() {
    var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.Set_variant(d, args[0])
      var dd = eYo.Test.newIdentifier('abc')
      eYo.Test.list_connect(d, 'import', dd)
      eYo.Test.variant(d, 'FROM_MODULE_IMPORT')
      eYo.Test.Code(d, `from <MISSING NAME> import abc`)
      dd = eYo.Test.newIdentifier('cde')
      eYo.Test.list_connect(d, 'import', dd)
      eYo.Test.variant(d, 'FROM_MODULE_IMPORT')
      eYo.Test.Code(d, `from <MISSING NAME> import abc, cde`)
      d.import_s.unwrappedTarget.dispose()
      eYo.Test.variant(d, 'FROM_MODULE_IMPORT')
      eYo.Test.Code(d, `from <MISSING NAME> import cde`)
      d.import_s.unwrappedTarget.dispose()
      eYo.Test.variant(d, 'FROM_MODULE_IMPORT')
      eYo.Test.Code(d, `from <MISSING NAME> import <MISSING NAME>`)
    })
    d.dispose()
  })
  it(`… -> from abc import ?`, function() {
    var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT', 'FROM_MODULE_IMPORT', '<MISSING NAME>'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.Set_variant(d, args[0])
      d.From_p = 'abc'
      eYo.Test.data_value(d, 'from', 'abc')
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.Code(d, `from abc import ${args[2] || '*'}`)
      d.From_p = ''
      eYo.Test.data_value(d, 'from', '')
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.Code(d, `from <MISSING NAME> import ${args[2] || '*'}`)
    })
    d.dispose()
  })
  it(`… -> from <abc> import ?`, function() {
    var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT', 'FROM_MODULE_IMPORT', '<MISSING NAME>'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.Set_variant(d, args[0])
      var dd = eYo.Test.new_brick(eYo.t3.expr.identifier)
      dd.Target_p = 'abc'
      eYo.Test.data_value(dd, 'target', 'abc')
      eYo.Test.Slot_connect(d, 'from', dd)
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.Code(d, `from abc import ${args[2] || '*'}`)
      dd.dispose()
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.Code(d, `from <MISSING NAME> import ${args[2] || '*'}`)
    })
    d.dispose()
  })
  it(`… -> from abc import ? <-> from <abc> import ?`, function() {
    var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT', 'FROM_MODULE_IMPORT', '<MISSING NAME>'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.Test.Set_variant(d, args[0])
      d.From_p = 'abc'
      eYo.Test.data_value(d, 'from', 'abc')
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.Code(d, `from abc import ${args[2] || '*'}`)
      var dd = eYo.Test.new_brick(eYo.t3.expr.identifier)
      dd.Target_p = 'cde'
      eYo.Test.data_value(dd, 'target', 'cde')
      eYo.Test.Slot_connect(d, 'from', dd)
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.Code(d, `from cde import ${args[2] || '*'}`)
      dd.dispose()
      eYo.Test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.Test.Code(d, `from abc import ${args[2] || '*'}`)
    })
    d.dispose()
  })
})
describe('import module', function() {
  it(`import abc -> import ?`, function() {
    var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
    ;[
      'IMPORT',
      'FROM_MODULE_IMPORT',
      'FROM_MODULE_IMPORT_STAR'
    ].forEach(k => {
      eYo.Test.Set_variant(d, k)
      d.Import_module_p = 'abc'
      eYo.Test.Code(d, 'import abc')
      d.Import_module_p = ''
      eYo.Test.Code(d, 'import <MISSING NAME>')
      d.Import_module_p = 'abc'
      eYo.Test.Set_variant(d, k)
      var dd = eYo.Test.new_brick(eYo.t3.expr.identifier)
      dd.Target_p = 'bcd'
      eYo.Test.list_connect(d, 'import_module', dd)
      eYo.Test.Code(d, 'import bcd')
      dd = d.import_module_s.unwrappedTarget
      eYo.Test.Brick(dd, 'identifier')
      eYo.Test.Input_length(d.import_module_b, 3)
      dd.dispose()
      eYo.Test.Input_length(d.import_module_b, 1)
      eYo.Test.Code(d, 'import abc')
      d.Import_module_p = ''
      eYo.Test.Code(d, 'import <MISSING NAME>')
    })
    d.dispose()
  })
  it (`import abc -> import <bcd> -> …`, function () {
    var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
    d.Import_module_p = 'abc'
    eYo.Test.Code(d, 'import abc')
    var dd = eYo.Test.new_brick(eYo.t3.expr.identifier)
    dd.Target_p = 'bcd'
    eYo.Test.list_connect(d, 'import_module', dd)
    eYo.Test.Code(d, 'import bcd')
    dd = eYo.Test.new_brick(eYo.t3.expr.identifier)
    dd.Target_p = 'cde'
    eYo.Test.list_connect(d, 'import_module', dd)
    eYo.Test.Code(d, 'import bcd, cde')
    d.import_module_s.unwrappedTarget.dispose()
    eYo.Test.Code(d, 'import cde')
    d.import_module_s.unwrappedTarget.dispose()
    eYo.Test.Code(d, 'import abc')
    d.dispose()
  })
})
describe('Copy/Paste', function () {
  it(`import ?`, function () {
    var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
    eYo.Test.Set_variant(d, 'IMPORT')
    eYo.Test.Copy_paste(d)
    d.Import_p = 'abc'
    eYo.Test.Copy_paste(d, (d, dd) => {
      eYo.Test.data_value(dd, 'import', d.Import_p)
    })
    eYo.Test.list_connect(d, 'import', eYo.Test.newIdentifier('bcd'))
    eYo.Test.Copy_paste(d, {test: (d, dd) => {
      eYo.Test.data_value(dd, 'import', '')
      eYo.Test.data_value(dd.import_s.unwrappedTarget, 'target', 'bcd')
    }})
    eYo.Test.list_connect(d, 'import', eYo.Test.newIdentifier('cde'))
    eYo.Test.Copy_paste(d, {test: (d, dd) => {
      eYo.Test.data_value(dd, 'import', '')
      var d = dd.import_s.unwrappedTarget
      eYo.Test.data_value(d, 'target', 'bcd')
      d.dispose()
      d = dd.import_s.unwrappedTarget
      eYo.Test.data_value(d, 'target', 'cde')
    },
    filter: t9k => t9k.Target_p})
    d.dispose()
  })
  it(`from … import ?`, function () {
    var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
    eYo.Test.Set_variant(d, 'FROM_MODULE_IMPORT')
    eYo.Test.Copy_paste(d)
    d.From_p = 'abc'
    eYo.Test.Copy_paste(d, (d, dd) => {
      eYo.Test.data_value(dd, 'from', dd.From_p)
    })
    eYo.Test.Slot_connect(d, 'from', eYo.Test.newIdentifier('bcd'))
    eYo.Test.Copy_paste(d, {test: (d, dd) => {
      eYo.Test.data_value(dd, 'from', '')
      eYo.Test.data_value(dd.from_b, 'target', 'bcd')
    }})
    d.dispose()
  })
  it(`from ? import …`, function () {
    var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
    eYo.Test.Set_variant(d, 'FROM_MODULE_IMPORT')
    eYo.Test.Copy_paste(d)
    d.Import_p = 'abc'
    eYo.Test.Copy_paste(d, (d, dd) => {
      eYo.Test.data_value(dd, 'import', d.Import_p)
    })
    eYo.Test.list_connect(d, 'import', eYo.Test.newIdentifier('bcd'))
    eYo.Test.Copy_paste(d, {
      test: (d, dd) => {
        eYo.Test.data_value(dd, 'from', '')
      },
      filter: eyo => eyo.Target_p
    })
    d.dispose()
  })
  it(`from … import *`, function () {
    var d = eYo.Test.new_brick(eYo.t3.stmt.import_stmt)
    eYo.Test.Set_variant(d, 'FROM_MODULE_IMPORT_STAR')
    eYo.Test.Copy_paste(d)
    d.From_p = 'abc'
    eYo.Test.Copy_paste(d, (d, dd) => {
      eYo.Test.data_value(dd, 'from', d.From_p)
    })
    eYo.Test.Slot_connect(d, 'from', eYo.Test.newIdentifier('bcd'))
    eYo.Test.Copy_paste(d, {test: (d, dd) => {
      eYo.Test.data_value(dd, 'from', '')
      eYo.Test.data_value(dd.from_b, 'target', 'bcd')
    }})
    d.dispose()
  })
})
describe('Import statement (BASIC)', function() {
  it(`Variant change effect`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
    eYo.test.Brick(d, 'import_stmt')
    eYo.test.variant(d, 'IMPORT')
    eYo.test.incog(d,
      ['import_module',
      'Xfrom',
      'Ximport',
      'Ximport_star'])
    eYo.test.Code(d, 'import <MISSING NAME>')
    d.Variant_p = eYo.key.FROM_MODULE_IMPORT
    eYo.test.variant(d, 'FROM_MODULE_IMPORT')
    eYo.test.incog(d,
      ['Ximport_module',
      'from',
      'import',
      'Ximport_star'])
    eYo.test.Code(d, 'from <MISSING NAME> import <MISSING NAME>')
    d.Variant_p = eYo.key.IMPORT
    eYo.test.variant(d, 'IMPORT')
    eYo.test.incog(d,
      ['import_module',
      'Xfrom',
      'Ximport',
      'Ximport_star'])
    eYo.test.Code(d, 'import <MISSING NAME>')
    d.Variant_p = eYo.key.FROM_MODULE_IMPORT_STAR
    eYo.test.variant(d, 'FROM_MODULE_IMPORT_STAR')
    eYo.test.incog(d,
      ['Ximport_module',
      'from',
      'Ximport',
      'import_star'])
    eYo.test.Code(d, 'from <MISSING NAME> import *')
    d.Variant_p = eYo.key.IMPORT
    eYo.test.variant(d, 'IMPORT')
    eYo.test.incog(d,
      ['import_module',
      'Xfrom',
      'Ximport',
      'Ximport_star'])
    eYo.test.Code(d, 'import <MISSING NAME>')
    d.dispose()
  })
  ;[
    'IMPORT',
    'FROM_MODULE_IMPORT',
    'FROM_MODULE_IMPORT_STAR'
  ].forEach(k => {
    it (`Copy/Paste same variant ${k}`, function () {
      var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
      eYo.test.Set_variant(d, k)
      eYo.test.Copy_paste(d)
      d.dispose()
    })
  })
})
describe('from module import …', function() {
  this.timeout(5000)
  it(`from foo.bar import *`, function () {
    var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
    d.From_p = 'foo.bar'
    eYo.test.data_value(d, 'from', 'foo.bar')
    d.dispose()
  })
  it(`from ... import ?`, function () {
    var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
    d.From_p = '...'
    eYo.test.data_value(d, 'from', '...')
    d.dispose()
  })
  it(`… -> from ? import abc`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.test.Set_variant(d, args[0])
      d.Import_p = 'abc'
      eYo.test.data_value(d, 'import', 'abc')
      eYo.test.variant(d, args[1] || 'FROM_MODULE_IMPORT')
      eYo.test.Code(d, `from <MISSING NAME> import abc`)
      d.Import_p = ''
      eYo.test.data_value(d, 'import', '')
      eYo.test.variant(d, args[1] || 'FROM_MODULE_IMPORT')
      eYo.test.Code(d, `from <MISSING NAME> import <MISSING NAME>`)
    })
    d.dispose()
  })
  it(`… -> from ? import <abc>, …`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.test.Set_variant(d, args[0])
      var dd = eYo.test.newIdentifier('abc')
      eYo.test.list_connect(d, 'import', dd)
      eYo.test.variant(d, 'FROM_MODULE_IMPORT')
      eYo.test.Code(d, `from <MISSING NAME> import abc`)
      dd = eYo.test.newIdentifier('cde')
      eYo.test.list_connect(d, 'import', dd)
      eYo.test.variant(d, 'FROM_MODULE_IMPORT')
      eYo.test.Code(d, `from <MISSING NAME> import abc, cde`)
      d.import_s.unwrappedTarget.dispose()
      eYo.test.variant(d, 'FROM_MODULE_IMPORT')
      eYo.test.Code(d, `from <MISSING NAME> import cde`)
      d.import_s.unwrappedTarget.dispose()
      eYo.test.variant(d, 'FROM_MODULE_IMPORT')
      eYo.test.Code(d, `from <MISSING NAME> import <MISSING NAME>`)
    })
    d.dispose()
  })
  it(`… -> from abc import ?`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT', 'FROM_MODULE_IMPORT', '<MISSING NAME>'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.test.Set_variant(d, args[0])
      d.From_p = 'abc'
      eYo.test.data_value(d, 'from', 'abc')
      eYo.test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.test.Code(d, `from abc import ${args[2] || '*'}`)
      d.From_p = ''
      eYo.test.data_value(d, 'from', '')
      eYo.test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.test.Code(d, `from <MISSING NAME> import ${args[2] || '*'}`)
    })
    d.dispose()
  })
  it(`… -> from <abc> import ?`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT', 'FROM_MODULE_IMPORT', '<MISSING NAME>'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.test.Set_variant(d, args[0])
      var dd = eYo.test.new_brick(eYo.t3.expr.identifier)
      dd.Target_p = 'abc'
      eYo.test.data_value(dd, 'target', 'abc')
      eYo.test.Slot_connect(d, 'from', dd)
      eYo.test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.test.Code(d, `from abc import ${args[2] || '*'}`)
      dd.dispose()
      eYo.test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.test.Code(d, `from <MISSING NAME> import ${args[2] || '*'}`)
    })
    d.dispose()
  })
  it(`… -> from abc import ? <-> from <abc> import ?`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
    ;[
      ['IMPORT'],
      ['FROM_MODULE_IMPORT', 'FROM_MODULE_IMPORT', '<MISSING NAME>'],
      ['FROM_MODULE_IMPORT_STAR']
    ].forEach(args => {
      eYo.test.Set_variant(d, args[0])
      d.From_p = 'abc'
      eYo.test.data_value(d, 'from', 'abc')
      eYo.test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.test.Code(d, `from abc import ${args[2] || '*'}`)
      var dd = eYo.test.new_brick(eYo.t3.expr.identifier)
      dd.Target_p = 'cde'
      eYo.test.data_value(dd, 'target', 'cde')
      eYo.test.Slot_connect(d, 'from', dd)
      eYo.test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.test.Code(d, `from cde import ${args[2] || '*'}`)
      dd.dispose()
      eYo.test.variant(d, args[1] || 'FROM_MODULE_IMPORT_STAR')
      eYo.test.Code(d, `from abc import ${args[2] || '*'}`)
    })
    d.dispose()
  })
})
describe('import module', function() {
  it(`import abc -> import ?`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
    ;[
      'IMPORT',
      'FROM_MODULE_IMPORT',
      'FROM_MODULE_IMPORT_STAR'
    ].forEach(k => {
      eYo.test.Set_variant(d, k)
      d.Import_module_p = 'abc'
      eYo.test.Code(d, 'import abc')
      d.Import_module_p = ''
      eYo.test.Code(d, 'import <MISSING NAME>')
      d.Import_module_p = 'abc'
      eYo.test.Set_variant(d, k)
      var dd = eYo.test.new_brick(eYo.t3.expr.identifier)
      dd.Target_p = 'bcd'
      eYo.test.list_connect(d, 'import_module', dd)
      eYo.test.Code(d, 'import bcd')
      dd = d.import_module_s.unwrappedTarget
      eYo.test.Brick(dd, 'identifier')
      eYo.test.Input_length(d.import_module_b, 3)
      dd.dispose()
      eYo.test.Input_length(d.import_module_b, 1)
      eYo.test.Code(d, 'import abc')
      d.Import_module_p = ''
      eYo.test.Code(d, 'import <MISSING NAME>')
    })
    d.dispose()
  })
  it (`import abc -> import <bcd> -> …`, function () {
    var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
    d.Import_module_p = 'abc'
    eYo.test.Code(d, 'import abc')
    var dd = eYo.test.new_brick(eYo.t3.expr.identifier)
    dd.Target_p = 'bcd'
    eYo.test.list_connect(d, 'import_module', dd)
    eYo.test.Code(d, 'import bcd')
    dd = eYo.test.new_brick(eYo.t3.expr.identifier)
    dd.Target_p = 'cde'
    eYo.test.list_connect(d, 'import_module', dd)
    eYo.test.Code(d, 'import bcd, cde')
    d.import_module_s.unwrappedTarget.dispose()
    eYo.test.Code(d, 'import cde')
    d.import_module_s.unwrappedTarget.dispose()
    eYo.test.Code(d, 'import abc')
    d.dispose()
  })
})
describe('Copy/Paste', function () {
  it(`import ?`, function () {
    var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
    eYo.test.Set_variant(d, 'IMPORT')
    eYo.test.Copy_paste(d)
    d.Import_p = 'abc'
    eYo.test.Copy_paste(d, (d, dd) => {
      eYo.test.data_value(dd, 'import', d.Import_p)
    })
    eYo.test.list_connect(d, 'import', eYo.test.newIdentifier('bcd'))
    eYo.test.Copy_paste(d, {test: (d, dd) => {
      eYo.test.data_value(dd, 'import', '')
      eYo.test.data_value(dd.import_s.unwrappedTarget, 'target', 'bcd')
    }})
    eYo.test.list_connect(d, 'import', eYo.test.newIdentifier('cde'))
    eYo.test.Copy_paste(d, {test: (d, dd) => {
      eYo.test.data_value(dd, 'import', '')
      var d = dd.import_s.unwrappedTarget
      eYo.test.data_value(d, 'target', 'bcd')
      d.dispose()
      d = dd.import_s.unwrappedTarget
      eYo.test.data_value(d, 'target', 'cde')
    },
    filter: t9k => t9k.Target_p})
    d.dispose()
  })
  it(`from … import ?`, function () {
    var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
    eYo.test.Set_variant(d, 'FROM_MODULE_IMPORT')
    eYo.test.Copy_paste(d)
    d.From_p = 'abc'
    eYo.test.Copy_paste(d, (d, dd) => {
      eYo.test.data_value(dd, 'from', dd.From_p)
    })
    eYo.test.Slot_connect(d, 'from', eYo.test.newIdentifier('bcd'))
    eYo.test.Copy_paste(d, {test: (d, dd) => {
      eYo.test.data_value(dd, 'from', '')
      eYo.test.data_value(dd.from_b, 'target', 'bcd')
    }})
    d.dispose()
  })
  it(`from ? import …`, function () {
    var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
    eYo.test.Set_variant(d, 'FROM_MODULE_IMPORT')
    eYo.test.Copy_paste(d)
    d.Import_p = 'abc'
    eYo.test.Copy_paste(d, (d, dd) => {
      eYo.test.data_value(dd, 'import', d.Import_p)
    })
    eYo.test.list_connect(d, 'import', eYo.test.newIdentifier('bcd'))
    eYo.test.Copy_paste(d, {
      test: (d, dd) => {
        eYo.test.data_value(dd, 'from', '')
      },
      filter: eyo => eyo.Target_p
    })
    d.dispose()
  })
  it(`from … import *`, function () {
    var d = eYo.test.new_brick(eYo.t3.stmt.import_stmt)
    eYo.test.Set_variant(d, 'FROM_MODULE_IMPORT_STAR')
    eYo.test.Copy_paste(d)
    d.From_p = 'abc'
    eYo.test.Copy_paste(d, (d, dd) => {
      eYo.test.data_value(dd, 'from', d.From_p)
    })
    eYo.test.Slot_connect(d, 'from', eYo.test.newIdentifier('bcd'))
    eYo.test.Copy_paste(d, {test: (d, dd) => {
      eYo.test.data_value(dd, 'from', '')
      eYo.test.data_value(dd.from_b, 'target', 'bcd')
    }})
    d.dispose()
  })
})
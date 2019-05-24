describe('SVG coordinates', function () {
  it ('xy', function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('True')
    var ui = d1.ui
    var xy1 = d1.ui.xyInWorkspace
    var xy2 = ui.xyInWorkspace
    chai.assert(xy1.x === xy2.x)
    chai.assert(xy1.y === xy2.y)
    var dx = 246 * Math.random()
    var dy = 135 * Math.random()
    d1.moveByXY(dx, dy)
    var xy1d = d1.ui.xyInWorkspace
    chai.assert(xy1d.x === xy1.x + dx, `FAILURE x1: ${xy1d.x} === ${xy1.x} + ${dx}`)
    chai.assert(xy1d.y === xy1.y + dy, `FAILURE y1: ${xy1d.y} === ${xy1.y} + ${dy}`)
    var xy2d = ui.xyInWorkspace
    chai.assert(xy2d.x === xy2.x + dx, `FAILURE x2: ${xy2d.x} === ${xy2.x} + ${dx}`)
    chai.assert(xy2d.y === xy2.y + dy, `FAILURE y2: ${xy2d.y} === ${xy2.y} + ${dy}`)
    d1.dispose()
    eYo.Test.tearItDown()
  })
})
describe('SVG groups and paths', function () {
  it(`Field: Label`, function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('True')
    var field = d1.value_f
    var svg = field.dom
    var type = d1.type
    chai.assert(svg, `MISSING svg in value field of ${type}`)
    var ui = field.ui
    chai.assert(ui === d1.ui, `MISSING field.ui === d1.ui for value field of ${type}`)
    var ui_driver = field.ui_driver
    chai.assert(ui_driver, `MISSING ui_driver in value field of ${type}`)
    chai.assert(dom.group_ === dom.textElement_, `FAILED dom.group_ === dom.textElement_ in value field of ${type}`)
    d1.dispose()
    chai.assert(!d1.dom, `FAILED SVG dispose`)
    eYo.Test.tearItDown()
  })
  // it(`Field: Text Input`, function () {
  //   eYo.Test.setItUp()
  //   var d1 = eYo.Test.new_brick('builtin__object')
  //   var field = d1.value_f
  //   var svg = field.dom
  //   var type = d1.type
  //   chai.assert(svg, `MISSING svg in value field of ${type}`)
  //   var ui = field.ui
  //   chai.assert(ui === d1.ui, `MISSING field.ui === d1.ui for value field of ${type}`)
  //   var ui_driver = field.ui_driver
  //   chai.assert(ui_driver, `MISSING ui_driver in value field of ${type}`)
  //   eYo.Test.svgNodeParent(svg, 'textElement_', 'group_', type)
  //   eYo.Test.tearItDown()
  // })
  it(`Expression`, function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('builtin__object')
    eYo.Test.svgNodeParent(d1, 'group_', d1.workspace.getCanvas())
    eYo.Test.svgNodeParent(d1, 'groupContour_', 'group_')
    eYo.Test.svgNodeParent(d1, 'groupShape_', 'group_')
    eYo.Test.svgNodeParent(d1, 'pathInner_', 'groupContour_')
    eYo.Test.svgNodeParent(d1, 'pathCollapsed_', 'groupContour_')
    eYo.Test.svgNodeParent(d1, 'pathContour_', 'groupContour_')
    eYo.Test.svgNodeParent(d1, 'pathShape_', 'groupShape_')
    eYo.Test.svgNodeParent(d1, 'pathSelect_')
    eYo.Test.svgNodeParent(d1, 'pathHilight_')
    eYo.Test.svgNodeParent(d1, 'pathMagnet_')
    d1.dispose()
    eYo.Test.tearItDown()
  })
})

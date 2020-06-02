describe('Svg driver', function() {
  it ('Svg: Basic', function () {
    chai.assert(eYo.svg)
    chai.assert(eYo.svg.Mngr)
    chai.assert(eYo.svg.newDriverC9r)
    chai.assert(eYo.svg.makeMngr)
    chai.assert(eYo.svg.BaseC9r)
  })
  it ('Svg Dlgt: Drivers', function () {
    for (let [name, Driver] of eYo.svg.Mngr[eYo.$].driverC9rMap) {
      console.warn(`${name} -> ${Driver[eYo.$].name}`)
    }
  })
  it ('Svg: Drivers', function () {
    let onr = {}
    let mngr = new eYo.svg.Mngr(onr)
    for (let [name, Driver] of Object.entries(mngr.drivers)) {
      console.log(`${name} -> ${Driver[eYo.$].name}`)
    }
  })
})



var x = () => {
describe('SVG coordinates', function () {
  it ('xy', function () {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('True')
    var ui = d1.ui
    var xy1 = d1.xy
    var xy2 = ui.whereInBoard
    chai.expect(xy1.x).equal(xy2.x)
    chai.expect(xy1.y).equal(xy2.y)
    var d = eYo.geom.pPoint(246 * Math.random(), 135 * Math.random())
    d1.moveBy(d)
    var xy1d = d1.xy
    chai.assert(xy1d.x === xy1.x + dx, `FAILURE x1: ${xy1d.x} === ${xy1.x} + ${dx}`)
    chai.assert(xy1d.y === xy1.y + dy, `FAILURE y1: ${xy1d.y} === ${xy1.y} + ${dy}`)
    var xy2d = ui.whereInBoard
    chai.assert(xy2d.x === xy2.x + dx, `FAILURE x2: ${xy2d.x} === ${xy2.x} + ${dx}`)
    chai.assert(xy2d.y === xy2.y + dy, `FAILURE y2: ${xy2d.y} === ${xy2.y} + ${dy}`)
    d1.dispose()
    eYo.test.tearItDown()
  })
})
describe('SVG groups and paths', function () {
  it(`Field: Label`, function () {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('True')
    var field = d1.value_f
    var dom = field.dom
    var type = d1.type
    chai.assert(dom, `MISSING svg in value field of ${type}`)
    var ui = field.ui
    chai.assert(ui === d1.ui, `MISSING field.ui === d1.ui for value field of ${type}`)
    var ui_driver_mngr = field.ui_driver_mngr
    chai.assert(ui_driver_mngr, `MISSING ui_driver_mngr in value field of ${type}`)
    chai.assert(dom.svg.group_ === dom.svg.textElement_, `FAILED dom.svg.group_ === dom.svg.textElement_ in value field of ${type}`)
    d1.dispose()
    chai.assert(!d1.dom, `FAILED SVG dispose`)
    eYo.test.tearItDown()
  })
  // it(`Field: Text Input`, function () {
  //   eYo.test.setItUp()
  //   var d1 = eYo.test.new_brick('builtin__object')
  //   var field = d1.value_f
  //   var dom = field.dom
  //   var type = d1.type
  //   chai.assert(dom, `MISSING svg in value field of ${type}`)
  //   var ui = field.ui
  //   chai.assert(ui === d1.ui, `MISSING field.ui === d1.ui for value field of ${type}`)
  //   var ui_driver_mngr = field.ui_driver_mngr
  //   chai.assert(ui_driver_mngr, `MISSING ui_driver_mngr in value field of ${type}`)
  //   eYo.test.SvgNodeParent(dom, 'textElement_', 'group_', type)
  //   eYo.test.tearItDown()
  // })
  it(`Expression`, function () {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('builtin__object')
    eYo.test.SvgNodeParent(d1, 'group_', d1.board.dom.svg.canvas_)
    eYo.test.SvgNodeParent(d1, 'groupContour_', 'group_')
    eYo.test.SvgNodeParent(d1, 'groupShape_', 'group_')
    eYo.test.SvgNodeParent(d1, 'pathInner_', 'groupContour_')
    eYo.test.SvgNodeParent(d1, 'pathCollapsed_', 'groupContour_')
    eYo.test.SvgNodeParent(d1, 'pathContour_', 'groupContour_')
    eYo.test.SvgNodeParent(d1, 'pathShape_', 'groupShape_')
    eYo.test.SvgNodeParent(d1, 'pathSelect_')
    eYo.test.SvgNodeParent(d1, 'pathHilight_')
    eYo.test.SvgNodeParent(d1, 'pathMagnet_')
    d1.dispose()
    eYo.test.tearItDown()
  })
})
}
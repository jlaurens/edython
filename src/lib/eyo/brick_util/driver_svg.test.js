describe('SVG coordinates', function () {
  it ('xy', function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_dlgt('True')
    var ui = d1.ui
    var xy1 = d1.ui.xyInSurface
    var xy2 = ui.xyInSurface
    chai.assert(xy1.x === xy2.x)
    chai.assert(xy1.y === xy2.y)
    var dx = 246 * Math.random()
    var dy = 135 * Math.random()
    d1.moveByXY(dx, dy)
    var xy1d = d1.ui.xyInSurface
    chai.assert(xy1d.x === xy1.x + dx, `FAILURE x1: ${xy1d.x} === ${xy1.x} + ${dx}`)
    chai.assert(xy1d.y === xy1.y + dy, `FAILURE y1: ${xy1d.y} === ${xy1.y} + ${dy}`)
    var xy2d = ui.xyInSurface
    chai.assert(xy2d.x === xy2.x + dx, `FAILURE x2: ${xy2d.x} === ${xy2.x} + ${dx}`)
    chai.assert(xy2d.y === xy2.y + dy, `FAILURE y2: ${xy2d.y} === ${xy2.y} + ${dy}`)
    d1.block_.dispose()
    eYo.Test.tearItDown()
  })
})
describe('SVG groups and paths', function () {
  it(`Field: Label`, function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_dlgt('True')
    var field = d1.fields.value
    var svg = field.eyo.svg
    var type = d1.type
    chai.assert(svg, `MISSING svg in value field of ${type}`)
    var ui = field.eyo.ui
    chai.assert(ui === d1.ui, `MISSING field.eyo.ui === d1.ui for value field of ${type}`)
    var ui_driver = field.eyo.ui_driver
    chai.assert(ui_driver, `MISSING ui_driver in value field of ${type}`)
    chai.assert(svg.group_ === svg.textElement_, `FAILED svg.group_ === svg.textElement_ in value field of ${type}`)
    d1.block_.dispose()
    chai.assert(!d1.svg, `FAILED SVG dispose`)
    eYo.Test.tearItDown()
  })
  // it(`Field: Text Input`, function () {
  //   eYo.Test.setItUp()
  //   var d1 = eYo.Test.new_dlgt('builtin__object')
  //   var field = d1.fields.value
  //   var svg = field.eyo.svg
  //   var type = d1.type
  //   chai.assert(svg, `MISSING svg in value field of ${type}`)
  //   var ui = field.eyo.ui
  //   chai.assert(ui === d1.ui, `MISSING field.eyo.ui === d1.ui for value field of ${type}`)
  //   var ui_driver = field.eyo.ui_driver
  //   chai.assert(ui_driver, `MISSING ui_driver in value field of ${type}`)
  //   eYo.Test.svgNodeParent(svg, 'textElement_', 'group_', type)
  //   eYo.Test.tearItDown()
  // })
  it(`Expression`, function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_dlgt('builtin__object')
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
    d1.block_.dispose()
    eYo.Test.tearItDown()
  })
})

/*
  // Shape
  if (!node.workspace.options.readOnly && !svg.eventsInit_) {
    Blockly.bindEventWithChecks_(
      svg.group_, 'mousedown', brick, brick.onMouseDown_);
    Blockly.bindEventWithChecks_(
      svg.group_, 'mouseup', brick, brick.onMouseUp_);
    // I could not achieve to use only one binding
    // With 2 bindings all the mouse events are catched,
    // but some, not all?, are catched twice.
    Blockly.bindEventWithChecks_(
      svg.pathContour_, 'mousedown', brick, brick.onMouseDown_);
    Blockly.bindEventWithChecks_(
      svg.pathContour_, 'mouseup', brick, brick.onMouseUp_);
  }
  if (node.isExpr) {
    goog.dom.classlist.add(svg.groupShape_, 'eyo-expr')
    goog.dom.classlist.add(svg.groupContour_, 'eyo-expr')
    goog.dom.classlist.add(svg.group_, 'eyo-top')
  } else if (node.isStmt) {
    svg.groupSharp_ = eYo.Driver.Svg.newElement('g',
    {class: 'eyo-sharp-group'}, null)
    goog.dom.insertSiblingAfter(svg.groupSharp_, svg.pathContour_)
    goog.dom.classlist.add(svg.groupShape_, 'eyo-stmt')
    goog.dom.classlist.add(svg.groupContour_, 'eyo-stmt')
    if (node.isControl) {
      svg.groupPlay_ = eYo.Driver.Svg.newElement('g',
      {class: 'eyo-play'}, svg.group_)
      svg.pathPlayContour_ = eYo.Driver.Svg.newElement('path',
      {class: 'eyo-path-play-contour'}, svg.groupPlay_)
      svg.pathPlayIcon_ = eYo.Driver.Svg.newElement('path',
      {class: 'eyo-path-play-icon'}, svg.groupPlay_)
      svg.pathPlayContour_.setAttribute('d', eYo.Shape.definitionForPlayContour({x: 0, y: 0}))
      svg.pathPlayIcon_.setAttribute('d', svg.eYo.Shape.definitionForPlayIcon({x: 0, y: 0}))
      svg.mouseDownWrapper_ =
        Blockly.bindEventWithChecks_(svg.pathPlayIcon_, 'mousedown', null, e => {
        if (svg.isInFlyout) {
          return
        }
        console.log('Start executing ' + svg.id)
        svg.runScript && svg.runScript()
      })
      goog.dom.classlist.add(svg.group_, 'eyo-start')
      goog.dom.classlist.add(svg.pathShape_, 'eyo-start-path')
      goog.dom.insertSiblingAfter(svg.groupPlay_, svg.pathHilight_)
    }
  }
  var parent = node.parent
  if (parent) {
    var p_svg = parent.ui.svg
  } else {
    node.workspace.getCanvas().appendChild(svg.group_)
  }
  if (p_svg && p_svg.groupContour_) {
    goog.dom.insertChildAt(p_svg.groupContour_, svg.groupContour_, 0)
    goog.dom.classlist.add((svg.groupContour_),
    'eyo-inner')
    goog.dom.appendChild(p_svg.groupShape_, svg.groupShape_)
    goog.dom.classlist.add((svg.groupShape_),
      'eyo-inner')
  } else {
    goog.dom.insertChildAt(svg.group_, svg.groupContour_, 0)
    goog.dom.classlist.remove(svg.groupContour_,
      'eyo-inner')
    goog.dom.insertSiblingBefore(svg.groupShape_, svg.groupContour_)
    goog.dom.classlist.remove(svg.groupShape_,
      'eyo-inner')
  }
*/
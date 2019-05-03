describe('SVG coordinates', function () {
  it ('xy', function () {
    eYo.Test.setItUp()
    var b1 = eYo.Test.new_block('True')
    var ui = b1.eyo.ui
    var xy1 = b1.getRelativeToSurfaceXY()
    var xy2 = ui.xyInSurface
    chai.assert(xy1.x === xy2.x)
    chai.assert(xy1.y === xy2.y)
    var dx = 246 * Math.random()
    var dy = 135 * Math.random()
    b1.moveBy(dx, dy)
    var xy1d = b1.getRelativeToSurfaceXY()
    chai.assert(xy1d.x === xy1.x + dx, `FAILURE x1: ${xy1d.x} === ${xy1.x} + ${dx}`)
    chai.assert(xy1d.y === xy1.y + dy, `FAILURE y1: ${xy1d.y} === ${xy1.y} + ${dy}`)
    var xy2d = ui.xyInSurface
    chai.assert(xy2d.x === xy2.x + dx, `FAILURE x2: ${xy2d.x} === ${xy2.x} + ${dx}`)
    chai.assert(xy2d.y === xy2.y + dy, `FAILURE y2: ${xy2d.y} === ${xy2.y} + ${dy}`)
    b1.dispose()
    eYo.Test.tearItDown()
  })
})
describe('SVG groups and paths', function () {
  it(`Field: Label`, function () {
    eYo.Test.setItUp()
    var b1 = eYo.Test.new_block('True')
    var field = b1.eyo.fields.value
    var svg = field.eyo.svg
    var type = b1.eyo.type
    chai.assert(svg, `MISSING svg in value field of ${type}`)
    var ui = field.eyo.ui
    chai.assert(ui === b1.eyo.ui, `MISSING field.eyo.ui === b1.eyo.ui for value field of ${type}`)
    var ui_driver = field.eyo.ui_driver
    chai.assert(ui_driver, `MISSING ui_driver in value field of ${type}`)
    chai.assert(svg.group_ === svg.textElement_, `FAILED svg.group_ === svg.textElement_ in value field of ${type}`)
    b1.dispose()
    chai.assert(!b1.eyo.svg, `FAILED SVG dispose`)
    eYo.Test.tearItDown()
  })
  // it(`Field: Text Input`, function () {
  //   eYo.Test.setItUp()
  //   var b1 = eYo.Test.new_block('builtin__object')
  //   var field = b1.eyo.fields.value
  //   var svg = field.eyo.svg
  //   var type = b1.eyo.type
  //   chai.assert(svg, `MISSING svg in value field of ${type}`)
  //   var ui = field.eyo.ui
  //   chai.assert(ui === b1.eyo.ui, `MISSING field.eyo.ui === b1.eyo.ui for value field of ${type}`)
  //   var ui_driver = field.eyo.ui_driver
  //   chai.assert(ui_driver, `MISSING ui_driver in value field of ${type}`)
  //   eYo.Test.svgNodeParent(svg, 'textElement_', 'group_', type)
  //   eYo.Test.tearItDown()
  // })
  it(`Expression`, function () {
    eYo.Test.setItUp()
    var b1 = eYo.Test.new_block('builtin__object')
    eYo.Test.svgNodeParent(b1, 'group_', b1.workspace.getCanvas())
    eYo.Test.svgNodeParent(b1, 'groupContour_', 'group_')
    eYo.Test.svgNodeParent(b1, 'groupShape_', 'group_')
    eYo.Test.svgNodeParent(b1, 'pathInner_', 'groupContour_')
    eYo.Test.svgNodeParent(b1, 'pathCollapsed_', 'groupContour_')
    eYo.Test.svgNodeParent(b1, 'pathContour_', 'groupContour_')
    eYo.Test.svgNodeParent(b1, 'pathShape_', 'groupShape_')
    eYo.Test.svgNodeParent(b1, 'pathSelect_')
    eYo.Test.svgNodeParent(b1, 'pathHilight_')
    eYo.Test.svgNodeParent(b1, 'pathConnection_')
    b1.dispose()
    eYo.Test.tearItDown()
  })
})

/*
  // Shape
  if (!node.workspace.options.readOnly && !svg.eventsInit_) {
    Blockly.bindEventWithChecks_(
      svg.group_, 'mousedown', block, block.onMouseDown_);
    Blockly.bindEventWithChecks_(
      svg.group_, 'mouseup', block, block.onMouseUp_);
    // I could not achieve to use only one binding
    // With 2 bindings all the mouse events are catched,
    // but some, not all?, are catched twice.
    Blockly.bindEventWithChecks_(
      svg.pathContour_, 'mousedown', block, block.onMouseDown_);
    Blockly.bindEventWithChecks_(
      svg.pathContour_, 'mouseup', block, block.onMouseUp_);
  }
  if (node.isExpr) {
    goog.dom.classlist.add(svg.groupShape_, 'eyo-expr')
    goog.dom.classlist.add(svg.groupContour_, 'eyo-expr')
    goog.dom.classlist.add(svg.group_, 'eyo-top')
  } else if (node.isStmt) {
    svg.groupSharp_ = Blockly.utils.createSvgElement('g',
    {class: 'eyo-sharp-group'}, null)
    goog.dom.insertSiblingAfter(svg.groupSharp_, svg.pathContour_)
    goog.dom.classlist.add(svg.groupShape_, 'eyo-stmt')
    goog.dom.classlist.add(svg.groupContour_, 'eyo-stmt')
    if (node.isControl) {
      svg.groupPlay_ = Blockly.utils.createSvgElement('g',
      {class: 'eyo-play'}, svg.group_)
      svg.pathPlayContour_ = Blockly.utils.createSvgElement('path',
      {class: 'eyo-path-play-contour'}, svg.groupPlay_)
      svg.pathPlayIcon_ = Blockly.utils.createSvgElement('path',
      {class: 'eyo-path-play-icon'}, svg.groupPlay_)
      svg.pathPlayContour_.setAttribute('d', eYo.Shape.definitionForPlayContour({x: 0, y: 0}))
      svg.pathPlayIcon_.setAttribute('d', svg.eYo.Shape.definitionForPlayIcon({x: 0, y: 0}))
      svg.mouseDownWrapper_ =
        Blockly.bindEventWithChecks_(svg.pathPlayIcon_, 'mousedown', null, e => {
        if (svg.block_.isInFlyout) {
          return
        }
        console.log('Start executing ' + svg.block_.id)
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
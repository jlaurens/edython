/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Group')

goog.require('ezP.DelegateSvg.Statement')

/**
 * Class for a DelegateSvg, statement block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Group = function (prototypeName) {
  ezP.DelegateSvg.Group.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Group, ezP.DelegateSvg.Statement)
ezP.DelegateSvg.Manager.register(ezP.Const.Grp.DEFAULT, ezP.DelegateSvg.Group)

/**
 * Whether the block has a previous bounded statement.
 * @param {!Block} block.
 * @private
 */
ezP.Delegate.prototype.hasPreviousBoundedStatement_ = function (block) {
  if (block.type === ezP.Const.Grp.ELIF || block.type === ezP.Const.Grp.ELSE) {
    var c8n = block.previousConnection
    if (c8n) {
      var target = c8n.targetBlock()
      if (target) {
        return target.type === ezP.Const.Grp.IF ||
          target.type === ezP.Const.Grp.ELIF ||
            target.type === ezP.Const.Grp.WHILE ||
              target.type === ezP.Const.Grp.FOR
      }
    }
  }
  return false
}

/**
 * Whether the block has a next bounded statement.
 * @param {!Block} block.
 * @private
 */
ezP.Delegate.prototype.hasNextBoundedStatement_ = function (block) {
  var c8n = block.nextConnection
  if (c8n) {
    var target = c8n.targetBlock()
    if (target) {
      return target.type === ezP.Const.Grp.ELIF ||
        target.type === ezP.Const.Grp.ELSE
    }
  }
  return false
}
/**
 * Block path.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Group.prototype.groupShapePathDef_ = function (block) {
  /* eslint-disable indent */
  var w = block.width
  var line = ezP.Font.lineHeight()
  var h = block.isCollapsed() ? 2 * line : block.height
  var steps = ['m ' + w + ',0 v ' + line]
  h -= line
  var r = ezP.Style.Path.radius()
  var a = ' a ' + r + ', ' + r + ' 0 0 0 '
  var t = ezP.Font.tabWidth
  w -= t + r
  steps.push('h ' + (-w))
  steps.push(a + (-r) + ',' + r)
  h -= 2 * r// Assuming 2*r<line height...
  steps.push(' v ' + h)
  steps.push(a + r + ',' + r)
  a = ' a ' + r + ', ' + r + ' 0 0 1 '
  if (this.hasNextStatement_(block)) {
    steps.push('h ' + (-t - r))
  } else {
    steps.push('h ' + (-t) + a + (-r) + ',' + (-r))
    h -= r
  }
  if (this.hasPreviousStatement_(block)) {
    steps.push('V 0 z')
  } else {
    steps.push('V ' + r + a + r + ',' + (-r) + ' z')
  }
  return steps.join(' ')
} /* eslint-enable indent */

/**
 * Block path.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Group.prototype.groupContourPathDef_ = function (block) {
  /* eslint-disable indent */
  var w = block.width
  var line = ezP.Font.lineHeight()
  var h = block.isCollapsed() ? 2 * line : block.height
  var t = ezP.Font.tabWidth
  var r = ezP.Style.Path.radius()
  var a = ' a ' + r + ', ' + r + ' 0 0 0 '
  var previousBounded = this.hasPreviousBoundedStatement_(block)
  var nextBounded = this.hasNextBoundedStatement_(block)
  var previous = this.hasPreviousStatement_(block)
  var next = this.hasNextStatement_(block)
  if (previousBounded) {
    var steps = ['m ' + t + ', ' + (-r) + a + r + ', ' + r + ' h ' + (w - t - r)]
  } else if (previous) {
    steps = ['m 0,0 h ' + w]
  } else {
    steps = ['m ' + r + ',0 h ' + (w - r)]
  }
  steps.push('v ' + line)
  h -= line
  w -= t + r
  steps.push('h ' + (-w))
  steps.push(a + (-r) + ',' + r)
  h -= 2 * r// Assuming 2*r<line height...
  steps.push(' v ' + h)
  steps.push(a + r + ',' + r)
  a = ' a ' + r + ', ' + r + ' 0 0 1 '
  if (nextBounded) {
    steps.push('m ' + (-t - r) + ',0')
  } else if (next) {
    steps.push('h ' + (-t - r))
  } else {
    steps.push('h ' + (-t) + a + (-r) + ',' + (-r))
    h -= r
  }
  if (previousBounded || previous) {
    steps.push('V 0')
  } else {
    steps.push('V ' + r + a + r + ',' + (-r))
  }
  return steps.join(' ')
} /* eslint-enable indent */

/**
 * Block path.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Group.prototype.collapsedPathDef_ = function (block) {
  /* eslint-disable indent */
  if (block.isCollapsed()) {
    var line = ezP.Font.lineHeight()
    var t = ezP.Font.tabWidth
    var r = ezP.Style.Path.radius()
    return 'm ' + block.width + ',' + line + ' v ' + (line - r) / 2 +
    ' m -' + r + ',' + r / 2 + ' l ' + 2 * r + ',' + (-r) +
    ' M ' + (t + r) + ',' + (2 * line) + ' H ' + block.width + ' v ' + (r - line) / 2 +
    ' m -' + r + ',' + r / 2 + ' l ' + 2 * r + ',' + (-r)
  }
  return ezP.DelegateSvg.Group.superClass_.collapsedPathDef_.call(this, block)
} /* eslint-enable indent */

ezP.DelegateSvg.Group.prototype.shapePathDef_ =
  ezP.DelegateSvg.Group.prototype.contourPathDef_ =
    ezP.DelegateSvg.Group.prototype.highlightedPathDef_ =
      ezP.DelegateSvg.Group.prototype.groupShapePathDef_

/**
 * Render an input of a group block.
 * @param io parameter.
 * @private
 */
ezP.DelegateSvg.Group.prototype.renderDrawNextStatementInput_ = function (io) {
  /* eslint-disable indent */
  if (!io.canStatement || io.input.type !== Blockly.NEXT_STATEMENT) {
    return false
  }
  io.cursorX = Math.max(2 * ezP.Font.tabWidth, io.cursorX)
  io.canStatement = false
  var c8n = io.input.connection
      // this must be the last one
  if (c8n) {
    c8n.setOffsetInBlock(ezP.Font.tabWidth, ezP.Font.lineHeight())
    if (c8n.isConnected()) {
      var target = c8n.targetBlock()
      var root = target.getSvgRoot()
      if (root) {
        target.render()
      }
    }
    io.block.height = ezP.Font.lineHeight() * io.block.getStatementCount()
  }
  return true
} /* eslint-enable indent */

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Group.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
    this.renderDrawValueInput_(io) ||
      this.renderDrawNextStatementInput_(io)
}

/**
 * @param {!Blockly.Connection} c8n The connection to highlight.
 */
ezP.DelegateSvg.Group.prototype.highlightConnection = function (c8n) {
  var steps
  var block = c8n.sourceBlock_
  if (c8n.type === Blockly.INPUT_VALUE) {
    if (c8n.isConnected()) {
      steps = this.valuePathDef_(c8n.targetBlock())
    } else {
      steps = this.placeHolderPathDefWidth_(0).d
    }
  } else if (c8n.type === Blockly.OUTPUT_VALUE) {
    steps = 'm 0,0 ' + Blockly.BlockSvg.TAB_PATH_DOWN + ' v 5'
  } else if (c8n.type === Blockly.NEXT_STATEMENT) {
    var r = ezP.Style.Path.Selected.width / 2
    var a = ' a ' + r + ',' + r + ' 0 0 0 0,'
    if (c8n.offsetInBlock_.x > 0) {
      steps = 'm 0,' + (-r) + a + (2 * r) + ' h ' + (block.width - ezP.Font.tabWidth) + a + (-2 * r) + ' z'
    } else {
      steps = 'm 0,' + (-r) + a + (2 * r) + ' h ' + (ezP.Font.tabWidth + ezP.Style.Path.radius()) + a + (-2 * r) + ' z'
    }
  } else if (c8n.type === Blockly.PREVIOUS_STATEMENT) {
    r = ezP.Style.Path.Selected.width / 2
    a = ' a ' + r + ',' + r + ' 0 0 0 0,'
    if (c8n.offsetInBlock_.x > 0) {
      steps = 'm 0,' + (-r) + a + (2 * r) + ' h ' + (block.width - ezP.Font.tabWidth) + a + (-2 * r) + ' z'
    } else {
      steps = 'm 0,' + (-r) + a + (2 * r) + ' h ' + (ezP.Font.tabWidth + ezP.Style.Path.radius()) + a + (-2 * r) + ' z'
    }
  }
  var xy = block.getRelativeToSurfaceXY()
  var x = c8n.x_ - xy.x
  var y = c8n.y_ - xy.y
  Blockly.Connection.highlightedPath_ =
  Blockly.utils.createSvgElement('path',
    {'class': 'blocklyHighlightedConnectionPath',
      'd': steps,
      transform: 'translate(' + x + ',' + y + ')'},
    c8n.sourceBlock_.getSvgRoot())
}

ezP.DelegateSvg.Group.Bounded = function (prototypeName) {
  ezP.DelegateSvg.Group.Bounded.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Group.Bounded, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register(ezP.Const.Grp.ELIF, ezP.DelegateSvg.Group.Bounded)
ezP.DelegateSvg.Manager.register(ezP.Const.Grp.ELSE, ezP.DelegateSvg.Group.Bounded)

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * @extends {Blockly.Block}
 * @constructor
 */
ezP.DelegateSvg.Group.Bounded.prototype.init = function (block) {
  ezP.DelegateSvg.Group.Bounded.superClass_.init.call(this, block)
  this.svgPathDotted_ = Blockly.utils.createSvgElement('path',
    {'d': 'M ' + ezP.Padding.h() + ',0 h ' + (ezP.Font.tabWidth - ezP.Padding.h())}, block.svgGroup_)
  block.nextConnection.check_ = ezP.Type.Stmt.Check.none
}

/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects...
 * @protected
 */
ezP.DelegateSvg.Group.Bounded.prototype.disposeInternal = function () {
  goog.dom.removeNode(this.svgPathDotted_)
  this.svgPathDotted_ = undefined
  ezP.DelegateSvg.Group.Bounded.superClass_.disposeInternal.call(this)
}

/**
 * Draw the path of the block.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.Group.Bounded.prototype.renderDraw_ = function (block) {
  ezP.DelegateSvg.Group.Bounded.superClass_.renderDraw_.call(this, block)
  if (this.hasPreviousBoundedStatement_(block)) {
    this.svgPathDotted_.setAttribute('class', 'ezp-path-dotted')
  } else {
    this.svgPathDotted_.setAttribute('class', 'ezp-no-path')
  }
}

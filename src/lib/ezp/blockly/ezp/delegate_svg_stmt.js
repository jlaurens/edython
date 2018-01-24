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

goog.provide('ezP.DelegateSvg.Statement')
goog.require('ezP.DelegateSvg')
goog.require('ezP.ContextMenu')

/**
 * Class for a DelegateSvg, statement block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Statement = function (prototypeName) {
  ezP.DelegateSvg.Statement.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Statement, ezP.DelegateSvg)
ezP.DelegateSvg.Manager.register(ezP.Const.Stmt.DEFAULT, ezP.DelegateSvg.Statement)

ezP.setup.register(function () {
  ezP.Style.insertCssRuleAt('.ezp-sharp-group{' + ezP.Font.style + '}')
})

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * @extends {Blockly.Block}
 * @constructor
 */
ezP.DelegateSvg.Statement.prototype.init = function (block) {
  ezP.DelegateSvg.Statement.superClass_.init.call(this, block)
  this.svgSharpGroup_ = Blockly.utils.createSvgElement('g',
    {'class': 'ezp-sharp-group'}, null)
  goog.dom.insertSiblingAfter(this.svgSharpGroup_, this.svgPathContour_)
}

/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects...
 * @protected
 */
ezP.DelegateSvg.Statement.prototype.disposeInternal = function () {
  goog.dom.removeNode(this.svgSharpGroup_)
  this.svgSharpGroup_ = undefined
  ezP.DelegateSvg.superClass_.disposeInternal.call(this)
}

/**
 * Statement block path.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Statement.prototype.statementPathDef_ = function (block) {
  /* eslint-disable indent */
  var w = block.width
  var h = block.height
  var steps = ['m ' + w + ',0 v ' + h]
  var r = ezP.Style.Path.radius()
  var a = ' a ' + r + ', ' + r + ' 0 0 1 '
  var c8n = block.nextConnection
  if (c8n && c8n.isConnected()) {
    steps.push('h ' + (-w))
  } else {
    steps.push('h ' + (-w + r) + a + (-r) + ',' + (-r))
    h -= r
  }
  c8n = block.previousConnection
  if (c8n && c8n.isConnected() && c8n.targetBlock().getNextBlock() === block) {
    steps.push('v ' + (-h) + ' z')
  } else {
    steps.push('v ' + (-h + r) + a + r + ',' + (-r) + ' z')
  }
  return steps.join(' ')
} /* eslint-enable indent */

ezP.DelegateSvg.Statement.prototype.shapePathDef_ =
  ezP.DelegateSvg.Statement.prototype.contourPathDef_ =
    ezP.DelegateSvg.Statement.prototype.highlightedPathDef_ =
      ezP.DelegateSvg.Statement.prototype.statementPathDef_

/**
 * Render the leading # character for disabled statement blocks.
 * @param io.
 * @private
 * @override
 */
ezP.DelegateSvg.Statement.prototype.renderDrawSharp_ = function (io) {
  if (io.block.disabled) {
    var children = goog.dom.getChildren(this.svgSharpGroup_)
    var length = children.length
    if (!length) {
      var y = ezP.Font.totalAscent
      var text = Blockly.utils.createSvgElement('text',
        {'x': 0, 'y': y},
        this.svgSharpGroup_)
      this.svgSharpGroup_.appendChild(text)
      text.appendChild(document.createTextNode('#'))
      length = 1
    }
    var expected = io.block.getStatementCount()
    while (length < expected) {
      y = ezP.Font.totalAscent + length * ezP.Font.lineHeight()
      text = Blockly.utils.createSvgElement('text',
        {'x': 0, 'y': y},
        this.svgSharpGroup_)
      this.svgSharpGroup_.appendChild(text)
      text.appendChild(document.createTextNode('#'))
      ++length
    }
    while (length > expected) {
      text = children[--length]
      this.svgSharpGroup_.removeChild(text)
    }
    this.svgSharpGroup_.setAttribute('transform', 'translate(' + (io.cursorX) +
        ', ' + ezP.Padding.t() + ')')
    io.cursorX += ezP.Font.space
  } else {
    goog.dom.removeChildren(this.svgSharpGroup_)
  }
}

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Statement.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
    this.renderDrawValueInput_(io)
}

/**
 * Class for a DelegateSvg, del statement block...
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Statement.Tupled = function (prototypeName) {
  ezP.DelegateSvg.Statement.Tupled.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Statement.Tupled, ezP.DelegateSvg.Statement)

ezP.DelegateSvg.Manager.register(ezP.Const.Stmt.DEL, ezP.DelegateSvg.Statement.Tupled)
ezP.DelegateSvg.Manager.register(ezP.Const.Stmt.GNL, ezP.DelegateSvg.Statement.Tupled)

/**
 * Will render the block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Statement.Tupled.prototype.willRender_ = function (block) {
  this.tupleConsolidate(block)
  ezP.DelegateSvg.Statement.Tupled.superClass_.willRender_.call(this, block)
}

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Statement.Tupled.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
    this.renderDrawTupleInput_(io) ||
      this.renderDrawValueInput_(io)
}

/**
 * Class for a DelegateSvg, print statement block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Statement.Print = function (prototypeName) {
  ezP.DelegateSvg.Statement.Print.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Statement.Print, ezP.DelegateSvg.Statement)

ezP.DelegateSvg.Manager.register(ezP.Const.Stmt.PRINT, ezP.DelegateSvg.Statement.Print)

/**
 * The default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {boolean} hidden True if connections are hidden.
 * @override
 */
ezP.DelegateSvg.Statement.Print.prototype.setConnectionsHidden = function (block, hidden) {
  ezP.DelegateSvg.Statement.Print.superClass_.setConnectionsHidden.call(block, hidden)
  this.updateKeyValueInputHidden_(block)
}

/**
 * Update .
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Statement.Print.prototype.updateKeyValueInputHidden_ = function (block) {
  for (var _ = 0, x; (x = block.inputList[_++]);) {
    var yorn = this.isInputVisible(x)
    if (yorn) {
      x.setVisible(true)
    } else if (yorn === false) {
      x.setVisible(true)// tricky to force an update, issue #8
      x.setVisible(false)
    }
  }
}

/**
 * Will render the block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Statement.Print.prototype.willRender_ = function (block) {
  this.tupleConsolidate(block)
  this.updateKeyValueInputHidden_(block)
  ezP.DelegateSvg.Statement.Print.superClass_.willRender_.call(this, block)
}

/**
 * Fetches the named input object, forwards to getInputTuple_.
 * @param {!Blockly.Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
ezP.DelegateSvg.Statement.Print.prototype.getInput = function (block, name) {
  var input = this.getInputTuple_(block, name)
  return input === null
    ? ezP.DelegateSvg.Statement.Print.superClass_.getInput.call(this, block, name)
    : input
}

/**
 * Render one input of print block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Statement.Print.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
  (this.renderDrawTupleInput_(io) && this.didRenderDrawTupleInput_(io)) ||
    (this.willRenderDrawValueInput_(io) && this.renderDrawValueInput_(io))
}

/**
 * did render a tuple input.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Statement.Print.prototype.didRenderDrawTupleInput_ = function (io) {
  if (io.input.ezpTuple.isSeparator) {
    io.separatorC8n = io.input.connection
  }
  return true
}

/**
 * will certainly render a print option.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Statement.Print.prototype.willRenderDrawValueInput_ = function (io) {
  if (io.separatorC8n) {
    var state = this.getPrintState_()
    for (var x in state) {
      if (state[x]) {
        var pw = this.carretPathDefWidth_(io.cursorX)
        var w = pw.width
        io.separatorC8n.setOffsetInBlock(io.cursorX + w / 2, 0)
        io.cursorX -= w
        break
      }
    }
    delete io.separatorC8n
  }
  return true
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden True if connections are hidden.
 * @override
 */
ezP.DelegateSvg.Statement.Print.prototype.toDom = function (block, element) {
  var state = this.getPrintState_(block)
  var l = []
  function f (k) {
    if (state[k]) {
      l.push(k)
    }
  }
  f(ezP.Const.Input.END)
  f(ezP.Const.Input.SEP)
  f(ezP.Const.Input.FILE)
  f(ezP.Const.Input.FLUSH)
  if (l.length) {
    element.setAttribute('state', l.join(' '))
  }
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden True if connections are hidden.
 * @override
 */
ezP.DelegateSvg.Statement.Print.prototype.fromDom = function (block, element) {
  var state = this.getPrintState_(block)
  for (var x in state) {
    if (state.hasOwnProperty(x)) {
      delete state[x]
    }
  }
  var attr = element.getAttribute('state')
  if (attr) {
    attr = attr.split(' ')
    for (var _ = 0; (x = attr[_++]);) {
      state[x] = true
    }
  }
}
ezP.Msg.PRINT_OPTION_END = ezP.Msg.PRINT_OPTION_END || 'end = …'
ezP.Msg.PRINT_OPTION_SEP = ezP.Msg.PRINT_OPTION_SEP || 'sep = …'
ezP.Msg.PRINT_OPTION_FILE = ezP.Msg.PRINT_OPTION_FILE || 'file = …'
ezP.Msg.PRINT_OPTION_FLUSH = ezP.Msg.PRINT_OPTION_FLUSH || 'flush = …'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.Statement.Print.prototype.populateContextMenu_ = function (block, menu) {
  var renderer = ezP.KeyValueMenuItemRenderer.getInstance()
  var options = [
    [ezP.Msg.PRINT_OPTION_END, ezP.Const.Input.END],
    [ezP.Msg.PRINT_OPTION_SEP, ezP.Const.Input.SEP],
    [ezP.Msg.PRINT_OPTION_FILE, ezP.Const.Input.FILE],
    [ezP.Msg.PRINT_OPTION_FLUSH, ezP.Const.Input.FLUSH]]
  for (var i = 0; i < options.length; i++) {
    var content = options[i][0] // Human-readable text or image.
    var value = options[i][1] // Language-neutral value.
    var menuItem = new goog.ui.MenuItem(content, undefined, undefined, renderer)
    menuItem.setValue(value)
    menuItem.setCheckable(true)
    menuItem.setChecked(this.getPrintState_()[value])
    menu.addChild(menuItem, true)
  }
  menu.addChild(new ezP.Separator(), true)
  ezP.DelegateSvg.Statement.Print.superClass_.populateContextMenu_.call(this, block, menu)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Statement.Print.prototype.onActionMenuEvent = function (block, menu, event) {
  var workspace = block.workspace
  var action = event.target.getModel()
  var state = this.getPrintState_()
  switch (action) {
    case ezP.Const.Input.END:
    case ezP.Const.Input.SEP:
    case ezP.Const.Input.FILE:
    case ezP.Const.Input.FLUSH:
      state[action] = !state[action]
      setTimeout(function () {
        block.render()
      }, 100)
      return
    default:
      ezP.DelegateSvg.Statement.Print.superClass_.onActionMenuEvent.call(this, block, menu, event)
      return
  }
}

/**
* The lazy print state for the given block.
* This stores the state and visibility of optional input fields.
* @param {!Blockly.Block} block A block.
*/
ezP.DelegateSvg.Statement.Print.prototype.getPrintState_ = function (block) {
  return this.printState_ || (this.printState_ = {})
}

/**
 * Whether an input is visible, according to its internal state.
 * @param {!Block.Input} input.
 * @return yorn
 */
ezP.DelegateSvg.Statement.Print.prototype.isInputVisible = function (input) {
  var state = this.getPrintState_()
  switch (input.name) {
    case ezP.Const.Input.END:
    case ezP.Const.Input.SEP:
    case ezP.Const.Input.FILE:
    case ezP.Const.Input.FLUSH:
      return state[input.name] === true
    default:
      return undefined
  }
}

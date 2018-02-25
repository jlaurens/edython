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

goog.provide('ezP.DelegateSvg.Print')

goog.require('ezP.DelegateSvg.Stmt')
goog.require('ezP.DelegateSvg.List')
goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, del statement block...
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.Tupled = function (prototypeName) {
  ezP.DelegateSvg.Stmt.Tupled.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Stmt.Tupled, ezP.DelegateSvg.Stmt)

//ezP.DelegateSvg.Manager.register('DEL')
//ezP.DelegateSvg.Manager.register('GNL')

/**
 * Will render the block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Stmt.Tupled.prototype.willRender_ = function (block) {
  this.tupleConsolidate(block)
  ezP.DelegateSvg.Stmt.Tupled.superClass_.willRender_.call(this, block)
}

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Stmt.Tupled.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
    this.renderDrawTupleInput_(io) ||
      this.renderDrawValueInput_(io)
}






/**
 * Class for a DelegateSvg, print_stmt block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.print_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.print_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputData_.first = {
    start: 'print(',
    key: ezP.Const.Input.LIST,
    wrap: ezP.T3.Expr.argument_list,
    end: ')',
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.print_stmt, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register('print_stmt')

// /**
//  * The default implementation does nothing.
//  * @param {!Blockly.Block} block.
//  * @param {boolean} hidden True if connections are hidden.
//  * @override
//  */
// ezP.DelegateSvg.Stmt.Print.prototype.setConnectionsHidden = function (block, hidden) {
//   ezP.DelegateSvg.Stmt.Print.superClass_.setConnectionsHidden.call(block, hidden)
//   this.updateKeyValueInputHidden_(block)
// }

// /**
//  * Update .
//  * @param {!Blockly.Block} block.
//  * @private
//  */
// ezP.DelegateSvg.Stmt.Print.prototype.updateKeyValueInputHidden_ = function (block) {
//   for (var _ = 0, x; (x = block.inputList[_++]);) {
//     var yorn = this.isInputVisible(x)
//     if (yorn) {
//       x.setVisible(true)
//     } else if (yorn === false) {
//       x.setVisible(true)// tricky to force an update, issue #8
//       x.setVisible(false)
//     }
//   }
// }

// /**
//  * Will render the block.
//  * @param {!Blockly.Block} block.
//  * @private
//  */
// ezP.DelegateSvg.Stmt.Print.prototype.willRender_ = function (block) {
//   this.tupleConsolidate(block)
//   this.updateKeyValueInputHidden_(block)
//   ezP.DelegateSvg.Stmt.Print.superClass_.willRender_.call(this, block)
// }

// /**
//  * Fetches the named input object, forwards to getInputTuple_.
//  * @param {!Blockly.Block} block.
//  * @param {string} name The name of the input.
//  * @return {Blockly.Input} The input object, or null if input does not exist.
//  */
// ezP.DelegateSvg.Stmt.Print.prototype.getInput = function (block, name) {
//   var input = this.getInputTuple_(block, name)
//   return input === null
//     ? ezP.DelegateSvg.Stmt.Print.superClass_.getInput.call(this, block, name)
//     : input
// }

// /**
//  * Render one input of print block.
//  * @param io.
//  * @private
//  */
// ezP.DelegateSvg.Stmt.Print.prototype.renderDrawInput_ = function (io) {
//   this.renderDrawDummyInput_(io) ||
//   (this.renderDrawTupleInput_(io) && this.didRenderDrawTupleInput_(io)) ||
//     (this.willRenderDrawValueInput_(io) && this.renderDrawValueInput_(io))
// }

// /**
//  * did render a tuple input.
//  * @param io.
//  * @private
//  */
// ezP.DelegateSvg.Stmt.Print.prototype.didRenderDrawTupleInput_ = function (io) {
//   if (io.input.ezpTuple.isSeparator) {
//     io.separatorC8n = io.input.connection
//   }
//   return true
// }

// /**
//  * will certainly render a print option.
//  * @param io.
//  * @private
//  */
// ezP.DelegateSvg.Stmt.Print.prototype.willRenderDrawValueInput_ = function (io) {
//   if (io.separatorC8n) {
//     var state = this.getPrintState_()
//     for (var x in state) {
//       if (state[x]) {
//         var pw = this.carretPathDefWidth_(io.cursorX)
//         var w = pw.width
//         io.separatorC8n.setOffsetInBlock(io.cursorX + w / 2, 0)
//         io.cursorX -= w
//         break
//       }
//     }
//     delete io.separatorC8n
//   }
//   return true
// }

// /**
//  * Final tune up depending on the block.
//  * Default implementation does nothing.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// ezP.DelegateSvg.Stmt.Print.prototype.toDom = function (block, element) {
//   var state = this.getPrintState_(block)
//   var l = []
//   function f (k) {
//     if (state[k]) {
//       l.push(k)
//     }
//   }
//   f(ezP.Const.Input.END)
//   f(ezP.Const.Input.SEP)
//   f(ezP.Const.Input.FILE)
//   f(ezP.Const.Input.FLUSH)
//   if (l.length) {
//     element.setAttribute('state', l.join(' '))
//   }
// }

// /**
//  * Final tune up depending on the block.
//  * Default implementation does nothing.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// ezP.DelegateSvg.Stmt.Print.prototype.fromDom = function (block, element) {
//   var state = this.getPrintState_(block)
//   for (var x in state) {
//     if (state.hasOwnProperty(x)) {
//       delete state[x]
//     }
//   }
//   var attr = element.getAttribute('state')
//   if (attr) {
//     attr = attr.split(' ')
//     for (var _ = 0; (x = attr[_++]);) {
//       state[x] = true
//     }
//   }
// }
// ezP.Msg.PRINT_OPTION_END = ezP.Msg.PRINT_OPTION_END || 'end = …'
// ezP.Msg.PRINT_OPTION_SEP = ezP.Msg.PRINT_OPTION_SEP || 'sep = …'
// ezP.Msg.PRINT_OPTION_FILE = ezP.Msg.PRINT_OPTION_FILE || 'file = …'
// ezP.Msg.PRINT_OPTION_FLUSH = ezP.Msg.PRINT_OPTION_FLUSH || 'flush = …'

// /**
//  * Populate the context menu for the given block.
//  * @param {!Blockly.Block} block The block.
//  * @param {!ezP.MenuManager} mgr, mgr.menu is the menu to populate.
//  * @private
//  */
// ezP.DelegateSvg.Stmt.Print.prototype.populateContextMenuFirst_ = function (block, mgr) {
//   var menu = mgr.menu
//   var renderer = ezP.KeyValueMenuItemRenderer.getInstance()
//   var options = [
//     [ezP.Msg.PRINT_OPTION_END, ezP.Const.Input.END],
//     [ezP.Msg.PRINT_OPTION_SEP, ezP.Const.Input.SEP],
//     [ezP.Msg.PRINT_OPTION_FILE, ezP.Const.Input.FILE],
//     [ezP.Msg.PRINT_OPTION_FLUSH, ezP.Const.Input.FLUSH]]
//   for (var i = 0; i < options.length; i++) {
//     var content = options[i][0] // Human-readable text or image.
//     var value = options[i][1] // Language-neutral value.
//     var menuItem = new goog.ui.MenuItem(content, undefined, undefined, renderer)
//     menuItem.setValue(value)
//     menuItem.setCheckable(true)
//     menuItem.setChecked(this.getPrintState_()[value])
//     menu.addChild(menuItem, true)
//   }
//   ezP.DelegateSvg.Stmt.Print.superClass_.populateContextMenuFirst_.call(this, block, mgr)
//   return true
// }

// /**
//  * Handle the selection of an item in the context dropdown menu.
//  * @param {!Blockly.Block} block The Menu component clicked.
//  * @param {!goog.ui.Menu} menu The Menu component clicked.
//  * @param {!goog....} event The event containing as target
//  * the MenuItem selected within menu.
//  */
// ezP.DelegateSvg.Stmt.Print.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
//   var workspace = block.workspace
//   var action = event.target.getModel()
//   var state = this.getPrintState_()
//   switch (action) {
//     case ezP.Const.Input.END:
//     case ezP.Const.Input.SEP:
//     case ezP.Const.Input.FILE:
//     case ezP.Const.Input.FLUSH:
//       state[action] = !state[action]
//       setTimeout(function () {
//         block.render()
//       }, 100)
//       return true
//     default:
//       return ezP.DelegateSvg.Stmt.Print.superClass_.handleMenuItemActionFirst.call(this, block, mgr, event)
//   }
// }

// /**
// * The lazy print state for the given block.
// * This stores the state and visibility of optional input fields.
// * @param {!Blockly.Block} block A block.
// */
// ezP.DelegateSvg.Stmt.Print.prototype.getPrintState_ = function (block) {
//   return this.printState_ || (this.printState_ = {})
// }

// /**
//  * Whether an input is visible, according to its internal state.
//  * @param {!Block.Input} input.
//  * @return yorn
//  */
// ezP.DelegateSvg.Stmt.Print.prototype.isInputVisible = function (input) {
//   var state = this.getPrintState_()
//   switch (input.name) {
//     case ezP.Const.Input.END:
//     case ezP.Const.Input.SEP:
//     case ezP.Const.Input.FILE:
//     case ezP.Const.Input.FLUSH:
//       return state[input.name] === true
//     default:
//       return undefined
//   }
// }

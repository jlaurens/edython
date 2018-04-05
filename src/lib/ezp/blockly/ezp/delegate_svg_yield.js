/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Yield')

goog.require('ezP.DelegateSvg.List')
goog.require('ezP.DelegateSvg.Stmt')

/////////////////     yield_expression_list      ///////////////////

/**
 * Class for a DelegateSvg, 'yield ...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_expression_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_expression_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.m_1 = {
    key: ezP.Key.LIST,
    label: 'yield',
    css_class: 'ezp-code-reserved',
    wrap: ezP.T3.Expr.non_void_expression_list,
  }
  this.outputModel__ = {
    check: ezP.T3.Expr.yield_expression_list,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.yield_expression_list, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('yield_expression_list')

/**
 * Class for a DelegateSvg, 'yield from ...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_from_expression = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_from_expression.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.m_1 = {
    key: ezP.Key.FROM,
    label: 'yield from',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.expression
  }
  this.outputModel__ = {
    check: ezP.T3.Expr.yield_from_expression,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.yield_from_expression, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('yield_from_expression')

/**
 * Class for a DelegateSvg, yield_expression.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_expression = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_expression.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.prefix = {
    label: 'yield',
    css_class: 'ezp-code-reserved',
  }
  this.inputModel__.m_1 = {
    key: ezP.Key.FROM,
    label: 'from',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.expression
  }
  this.inputModel__.m_2 = {
    key: ezP.Key.LIST,
    css_class: 'ezp-code-reserved',
    wrap: ezP.T3.Expr.non_void_expression_list,
  }
  this.outputModel__ = {
    check: ezP.T3.Expr.yield_expression,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.yield_expression, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('yield_expression')

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.initBlock = function (block) {
  ezP.DelegateSvg.Expr.yield_expression.superClass_.initBlock.call(this, block)
  ezP.DelegateSvg.Expr.yield_expression.setFromInputDisabled(block, true)
}

/**
 * toDom.
 * @param {!Blockly.Block} block to be translated.
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.toDom = function (block, element, optNoId) {
  var yorn = ezP.DelegateSvg.Expr.yield_expression.getFromInputDisabled(block)
  if (yorn) {
    // create a list element
    var input = block.getInput(ezP.Key.LIST)
    var target = input.connection.targetBlock()
    if (target) {
      var child = goog.dom.createDom('ezp:list')
      if (ezP.Xml.toDom(target, child, optNoId)) {
        goog.dom.appendChild(element, child)
      } else {
        element.setAttribute('mode', 'list')
      }
    } else {
      element.setAttribute('mode', 'list')
    }
  } else {
    ezP.Xml.namedInputToDom(block, ezP.Key.FROM, element, optNoId)
  }
}

/**
 * v.
 * @param {!Blockly.Block} block to be initialized.
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.fromDom = function (block, xml) {
  if (xml.getAttribute('mode') === 'list') {
    ezP.DelegateSvg.Expr.yield_expression.setFromInputDisabled(block, true)
  }
  var done = false
  for (var i = 0, child;(child = xml.childNodes[i++]);) {
    if (child.nodeName) {
      if (done) {
        Blockly.Xml.domToBlock(child, block.workspace)
      } else if (child.nodeName.toLowerCase() === ezP.Key.LIST) {
        var input = block.getInput(ezP.Key.LIST)
        var target = input.connection.targetBlock()
        goog.asserts.assert(target, 'Missing wrapped list')
        ezP.Xml.fromDom(target, child)
        ezP.DelegateSvg.Expr.yield_expression.setFromInputDisabled(block, true)
        done = true
      } else {
        var input = block.getInput(ezP.Key.FROM)
        if ((target = input.connection.targetBlock())) {
          ezP.Xml.fromDom(target, child)
          done = true
        } else if ((target = Blockly.Xml.domToBlock(child, block.workspace))) {
          if (target.outputConnection && input.connection.checkType_(target.outputConnection)) {
            input.connection.connect(target.outputConnection)
            done = true
          }
        }
        ezP.DelegateSvg.Expr.yield_expression.setFromInputDisabled(block, false)
      }
    }
  }
}

/**
 * Disable the from input.
 * @param {!Blockly.Block} block The block.
 * @param {!boolean} yorn.
 * @private
 */
ezP.DelegateSvg.Expr.yield_expression.getFromInputDisabled = function (block) {
  return block.getInput(ezP.Key.FROM).ezpData.disabled_
}

/**
 * Disable the from input.
 * @param {!Blockly.Block} block The block.
 * @param {!boolean} yorn.
 * @private
 */
ezP.DelegateSvg.Expr.yield_expression.setFromInputDisabled = function (block, yorn) {
  Blockly.Events.setGroup(true)
  var old = block.ezp.isRendering
  block.ezp.isRendering = true
  block.ezp.setNamedInputDisabled(block, ezP.Key.FROM, yorn)
  block.ezp.setNamedInputDisabled(block, ezP.Key.LIST, !yorn)
  block.ezp.isRendering = old
  Blockly.Events.setGroup(false)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr, mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.yield_expression.populateContextMenuFirst_ = function (block, mgr) {
  if (block.ezp.locked_) {
    return false
  }
  var yorn = ezP.DelegateSvg.Expr.yield_expression.getFromInputDisabled(block)
  var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    ezP.Do.createSPAN('yield from', 'ezp-code-reserved'),
    goog.dom.createTextNode(' …'),
  )
  var menuItem = new ezP.MenuItem(content, function() {
    ezP.DelegateSvg.Expr.yield_expression.setFromInputDisabled(block, false)
  })
  menuItem.setEnabled(yorn)
  mgr.addChild(menuItem, true)
  var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    ezP.Do.createSPAN('yield', 'ezp-code-reserved'),
    goog.dom.createTextNode(' …'),
  )
  var menuItem = new ezP.MenuItem(content, function() {
    ezP.DelegateSvg.Expr.yield_expression.setFromInputDisabled(block, true)
  })
  menuItem.setEnabled(!yorn)
  mgr.addChild(menuItem, true)
  return true
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr, mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var yorn = ezP.DelegateSvg.Expr.yield_expression.populateContextMenuFirst_.call(this, block, mgr)
  return ezP.DelegateSvg.Expr.yield_expression.superClass_.populateContextMenuFirst_.call(this,block, mgr) || yorn
}

/**
 * Class for a DelegateSvg, '(yield ..., ..., ...)'.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_atom = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_atom.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.prefix = {
    label: '(',
  }
  this.inputModel__.suffix = {
    label: ')',
  }
  this.outputModel__ = {
    awaitable: true,
    check: ezP.T3.Expr.yield_atom,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.yield_atom, ezP.DelegateSvg.Expr.yield_expression)
ezP.DelegateSvg.Manager.register('yield_atom')

/**
 * Class for a DelegateSvg, yield_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.yield_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.yield_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.m_3 = {
    insert: ezP.T3.Expr.yield_expression
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.yield_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('yield_stmt')


/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr, mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.yield_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var yorn = ezP.DelegateSvg.Expr.yield_expression.populateContextMenuFirst_.call(this, block, mgr)
  return ezP.DelegateSvg.Expr.yield_stmt.superClass_.populateContextMenuFirst_.call(this,block, mgr) || yorn
}

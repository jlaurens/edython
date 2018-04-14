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

/**
 * Class for a DelegateSvg, yield_expression.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('yield_expression', {
  inputs: {
    subtypes: [null, ezP.Key.EXPRESSION, ezP.Key.FROM],
    prefix: {
      label: 'yield',
      css_class: 'ezp-code-reserved',
    },
    m_1: {
      key: ezP.Key.EXPRESSION,
      wrap: ezP.T3.Expr.non_void_expression_list,
    },
    m_2: {
      key: ezP.Key.FROM,
      label: 'from',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.expression
    },
  },
})

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.initBlock = function (block) {
  ezP.DelegateSvg.Expr.yield_expression.superClass_.initBlock.call(this, block)
  var subtypes = this.getModel().inputs.subtypes
  this.initProperty(block, ezP.Key.SUBTYPE, subtypes[0], function(block, oldValue, newValue) {
    return subtypes.indexOf(newValue) >= 0
  }, null, function(block, oldValue, newValue) {
    var i = subtypes.indexOf(newValue)
    block.ezp.setNamedInputDisabled(block, subtypes[1], i != 1)
    block.ezp.setNamedInputDisabled(block, subtypes[2], i != 2)
  })
}

/**
 * Get the subtype of the block.
 * The default implementation does nothing.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is return, when defined or not null.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.getSubtype = function (block) {
  return block.ezp.getProperty(block, ezP.Key.SUBTYPE)
}

/**
 * Set the subtype of the block.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is expected.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.setSubtype = function (block, subtype) {
  var subtypes = this.getModel().inputs.subtypes
  return block.ezp.setProperty(block, ezP.Key.SUBTYPE, goog.isNumber(subtype)? subtypes[subtype]: subtype)
}

/**
 * toDom.
 * @param {!Blockly.Block} block to be translated.
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.XtoDom = function (block, element, optNoId) {
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
ezP.DelegateSvg.Expr.yield_expression.prototype.XfromDom = function (block, xml) {
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
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr, mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.yield_expression.populateContextMenuFirst_ = function (block, mgr) {
  if (block.ezp.locked_) {
    return
  }
  var current = block.ezp.getProperty(block, ezP.Key.SUBTYPE)
  var subtypes = this.getModel().inputs.subtypes
  var F = function(content, k) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setProperty(block, ezP.Key.SUBTYPE, k)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
      goog.dom.createTextNode('yield'),
    ), subtypes[0]
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('yield ', 'ezp-code-reserved'),
      goog.dom.createTextNode('…'),
    ), subtypes[1]
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('yield from', 'ezp-code-reserved'),
      goog.dom.createTextNode(' …'),
    ), subtypes[2]
  )
  mgr.shouldSeparate()
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
ezP.DelegateSvg.Manager.makeSubclass('yield_atom', {
  inputs: {
    prefix: {
      label: '(',
    },
    m_1: {
      key: ezP.Key.EXPRESSION,
      wrap: ezP.T3.Expr.yield_expression,
    },
    suffix: {
      label: ')',
    },
  },
})

/**
 * Class for a DelegateSvg, yield_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('yield_stmt', {
  inputs: {
    insert: ezP.T3.Expr.yield_expression,
  }
})

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Stmt.yield_stmt.prototype.initBlock = function (block) {
  ezP.DelegateSvg.Expr.yield_expression.superClass_.initBlock.call(this, block)
  var subtypes = this.getModel().inputs.subtypes
  this.initProperty(block, ezP.Key.SUBTYPE, subtypes[0], function(block, oldValue, newValue) {
    return subtypes.indexOf(newValue) >= 0
  }, null, function(block, oldValue, newValue) {
    var i = subtypes.indexOf(newValue)
    block.ezp.setNamedInputDisabled(block, subtypes[1], i != 1)
    block.ezp.setNamedInputDisabled(block, subtypes[2], i != 2)
  })
}

/**
 * Get the subtype of the block.
 * The default implementation does nothing.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is return, when defined or not null.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.Stmt.yield_stmt.prototype.getSubtype = ezP.DelegateSvg.Expr.yield_expression.prototype.getSubtype

/**
 * Set the subtype of the block.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is expected.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Stmt.yield_stmt.prototype.setSubtype = ezP.DelegateSvg.Expr.yield_expression.prototype.setSubtype

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr, mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.yield_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  ezP.DelegateSvg.Expr.yield_expression.populateContextMenuFirst_.call(this, block, mgr)
  return ezP.DelegateSvg.Stmt.yield_stmt.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

ezP.DelegateSvg.Yield.T3s = [
  ezP.T3.Expr.yield_expression,
  ezP.T3.Expr.yield_atom,
  ezP.T3.Stmt.yield_stmt,
]
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
ezP.DelegateSvg.Expr.makeSubclass('yield_expression', {
  data: {
    subtype: {
      all: [null, ezP.Key.EXPRESSION, ezP.Key.FROM],
    }
  },
  fields: {
    prefix: {
      label: 'yield',
      css_class: 'ezp-code-reserved',
    },
  },
  inputs: {
    1: {
      key: ezP.Key.EXPRESSION,
      wrap: ezP.T3.Expr.non_void_expression_list,
    },
    2: {
      key: ezP.Key.FROM,
      label: 'from',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.expression
    },
  },
})

/**
 * Initialize the subtype.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldSubtype
 * @param {string} newSubtype
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.didChangeSubtype = function(block, oldSubtype, newSubtype) {
  var subtypes = this.data.subtype.getAll()
  var i = subtypes.indexOf(newSubtype)
  block.ezp.setNamedInputDisabled(block, subtypes[1], i != 1)
  block.ezp.setNamedInputDisabled(block, subtypes[2], i != 2)
}

/**
 * toDom.
 * @param {!Blockly.Block} block to be translated.
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.XtoDom = function (block, element, optNoId) {
  var yorn = ezP.DelegateSvg.Expr.yield_expression.toDom(block, element, optNoId)
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
  var current = this.data.subtype.get()
  var subtypes = this.data.subtype.getAll()
  var F = function(content, k) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.subtype.set(k)
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
ezP.DelegateSvg.Expr.makeSubclass('yield_atom', {
  fields: {
    prefix: {
      label: '(',
    },
    suffix: {
      label: ')',
    },
  },
  inputs: {
    1: {
      key: ezP.Key.EXPRESSION,
      wrap: ezP.T3.Expr.yield_expression,
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
ezP.DelegateSvg.Stmt.makeSubclass('yield_stmt', {
  inputs: {
    insert: ezP.T3.Expr.yield_expression,
  }
})

/**
 * When the subtype has changed.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldSubtype
 * @param {string} newSubtype
 */
ezP.DelegateSvg.Stmt.yield_stmt.prototype.didChangeSubtype = function(block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Stmt.yield_stmt.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  var subtypes = this.data.subtype.getAll()
  var i = subtypes.indexOf(newSubtype)
  block.ezp.setNamedInputDisabled(block, subtypes[1], i != 1)
  block.ezp.setNamedInputDisabled(block, subtypes[2], i != 2)
}

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
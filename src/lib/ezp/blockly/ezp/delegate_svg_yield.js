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
    variant: {
      all: [0, 1, 2],
      synchronize: function(newValue) {
        this.ui.tiles.expression.setDisabled(newValue != 1)
        this.ui.tiles.from.setDisabled(newValue != 2)
      }
    }
  },
  fields: {
    prefix: 'yield',
  },
  tiles: {
    expression: {
      order: 1,
      wrap: ezP.T3.Expr.non_void_expression_list,
    },
    from: {
      order: 2,
      fields: {
        label: 'from',
      },
      check: ezP.T3.Expr.Check.expression
    },
  },
})

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
  var current = this.data.variant.get()
  var F = function(content, k) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.variant.set(k)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
      goog.dom.createTextNode('yield'),
    ), 0
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('yield ', 'ezp-code-reserved'),
      goog.dom.createTextNode('…'),
    ), 1
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('yield from', 'ezp-code-reserved'),
      goog.dom.createTextNode(' …'),
    ), 2
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
 * Class for a DelegateSvg, starred_item_list_or_yield block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('parenth_form', function() {
  var D = {
    check: ezP.T3.Expr.Check.non_void_starred_item_list,
    unique: ezP.T3.Expr.yield_expression,
    consolidator: ezP.Consolidator.List.Singled,
    empty: true,
    presep: ',',
    hole_value: 'name',
  }
  var RA = goog.array.concat(D.check,D.unique)
  goog.array.removeDuplicates(RA)
  D.all = RA
  return {
    list: D,
    fields: {
      prefix: '(',
      suffix: ')',
    },
  }
})

/**
 * Class for a DelegateSvg, '(yield ..., ..., ...)'.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_expression.makeSubclass('yield_atom', {
  fields: {
    prefix: '(',
    suffix: ')',
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
  link: ezP.T3.Expr.yield_expression,
})

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
  ezP.T3.Stmt.yield_stmt,
  ezP.T3.Expr.term,
  ezP.T3.Expr.parenth_form,
]
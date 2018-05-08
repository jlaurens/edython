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

goog.provide('ezP.DelegateSvg.List')

goog.require('ezP.Consolidator.List')
goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.makeSubclass('List', {
  list: {},
}, ezP.DelegateSvg)

/**
 * Will render the block.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.List.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.List.superClass_.willRender_.call(this, block)
  this.consolidate(block)
}

/**
 * Fetches the named input object, getInput.
 * @param {!Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
ezP.DelegateSvg.List.prototype.getInput = function (block, name) {
  this.createConsolidator(block)
  return this.consolidator.getInput(block, name)
}

/**
 * Consolidate the input.
 * Removes empty place holders.
 * This must not be overriden.
 * 
 * @param {!Block} block.
 */
ezP.DelegateSvg.List.prototype.consolidate_ = function (block, force) {
  if (this.consolidate_lock || this.will_connect_) {
    // reentrant flag or wait for the new connection
    // to be established before consolidating
    // reentrant is essential because the consolidation
    // may cause rerendering ad vitam eternam.
    return
  }
  ezP.DelegateSvg.List.superClass_.consolidate.call(this, block, force)
  if (this.connectionsIncog) {
    return
  }
  this.consolidate_lock = true
  try {
    this.consolidator.consolidate(block, force)
  } finally {
    delete this.consolidate_lock
  }
}

/**
 * Consolidate the input.
 * Removes empty place holders.
 * This must not be overriden.
 * 
 * @param {!Block} block.
 */
ezP.DelegateSvg.List.prototype.createConsolidator = function (block) {
  if (!this.consolidator) {
    var D = ezP.DelegateSvg.Manager.getModel(block.type).list
    goog.asserts.assert(D, 'inputModel__.list is missing in '+block.type)
    var C10r = D.consolidator || ezP.Consolidator.List
    this.consolidator = new C10r(D)
    goog.asserts.assert(this.consolidator, ezP.Do.format('Could not create the consolidator {0}', block.type))
  }
}

/**
 * Consolidate the input.
 * Removes empty place holders.
 * This must not be overriden.
 * 
 * @param {!Block} block.
 */
ezP.DelegateSvg.List.prototype.consolidate = function (block, deep, force) {
  this.createConsolidator(block)
  this.consolidate = ezP.DelegateSvg.List.prototype.consolidate_
  this.consolidate(block, force)// this is not recursive
}

// ezP.DelegateSvg.List.prototype.consolidator = undefined

/**
 * Clear the list af all items.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.List.prototype.removeItems = function(block) {
  var list = block.inputList
  var i = 0
  var input
  Blockly.Events.setGroup(true)
  try {
    while ((input = list[i++])) {
      var c8n = input.connection
      var target = c8n.targetBlock()
      if (target) {
        c8n.disconnect()
        target.dispose()
      }
    }
    this.consolidate(block)
  } finally {
    Blockly.Events.setGroup(false)
  }
}

/**
 * Class for a DelegateSvg, optional expression_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('optional_expression_list', {
  list: {
    check: ezP.T3.Expr.Check.expression,
    empty: true,
    presep: ',',
    hole_value: 'name',
  },
})

/**
 * Class for a DelegateSvg, expression_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('non_void_expression_list', {
  list: {
    check: ezP.T3.Expr.Check.expression,
    empty: false,
    presep: ',',
    hole_value: 'name',
  },
})

/**
 * Class for a DelegateSvg, starred_item_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('starred_item_list', {
  list: {
    check: ezP.T3.Expr.Check.starred_item,
    empty: false,
    presep: ',',
    hole_value: 'name',
  },
})

/**
 * Class for a DelegateSvg, key_datum_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('key_datum_list', {
  list: {
    check: ezP.T3.Expr.Check.key_datum,
    empty: true,
    presep: ',',
  },
})

/**
 * Class for a DelegateSvg, starred_item_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('starred_item_list', {
    list: {
    check: ezP.T3.Expr.Check.non_void_starred_item_list,
    empty: true,
    presep: ',',
    hole_value: 'name',
  },
})

/**
 * Class for a DelegateSvg, starred_item_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('non_void_starred_item_list', {
    list: {
    check: ezP.T3.Expr.Check.non_void_starred_item_list,
    empty: false,
    presep: ',',
    hole_value: 'name',
  },
})

/**
 * Class for a DelegateSvg, starred_item_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('starred_item_list_comprehensive', function() {
  var D = {
    check: ezP.T3.Expr.Check.non_void_starred_item_list,
    unique: ezP.T3.Expr.comprehension,
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
  }
})

/**
 * Class for a DelegateSvg, list_display block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.starred_item_list_comprehensive.makeSubclass('list_display', {
  xml: {
    tag: 'square_bracket',
  },
  fields: {
    prefix: '[',
    suffix: ']',
  },
})

/**
 * Class for a DelegateSvg, non_void_starred_item_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('non_void_starred_item_list_comprehensive', function() {
  var D = {
    check: ezP.T3.Expr.Check.non_void_starred_item_list,
    unique: ezP.T3.Expr.comprehension,
    consolidator: ezP.Consolidator.List.Singled,
    empty: false,
    presep: ',',
    hole_value: 'name',
  }
  var RA = goog.array.concat(D.check,D.unique)
  goog.array.removeDuplicates(RA)
  D.all = RA
  return {
    list: D,
  }
})

/**
 * Class for a DelegateSvg, set_display block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.non_void_starred_item_list_comprehensive.makeSubclass('set_display', {
  xml: {
    tag: 'curly_bracket',
  },
  fields: {
    prefix: '{',
    suffix: '}',
  },
})

/**
 * Class for a DelegateSvg, key_datum_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('key_datum_list_comprehensive', function() {
  var D = {
    check: ezP.T3.Expr.Check.key_datum_list,
    unique: ezP.T3.Expr.dict_comprehension,
    consolidator: ezP.Consolidator.List.Singled,
    empty: true,
    presep: ',',
  }
  var RA = goog.array.concat(D.check,D.unique)
  goog.array.removeDuplicates(RA)
  D.all = RA
  return {
    list: D,
  }
})

/**
 * Class for a DelegateSvg, dict_display block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.key_datum_list_comprehensive.makeSubclass('dict_display', {
  fields: {
    prefix: '{',
    suffix: '}',
  },
})

/**
 * Class for a DelegateSvg, slice_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('slice_list', {
  list: {
    check: ezP.T3.Expr.Check.slice_item,
    empty: false,
    presep: ',',
  },
})

/**
 * Class for a DelegateSvg, with_item_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('with_item_list', {
  list: {
    check: ezP.T3.Expr.Check.with_item,
    empty: false,
    presep: ',',
    hole_value: 'nom',
  },
})

ezP.DelegateSvg.List.T3s = [
  ezP.T3.Expr.term,
  ezP.T3.Expr.starred_expression,
  ezP.T3.Expr.comprehension,
  ezP.T3.Expr.dict_comprehension,
  ezP.T3.Expr.key_datum,
  ezP.T3.Expr.optional_expression_list,
  ezP.T3.Expr.non_void_expression_list,
  ezP.T3.Expr.starred_item_list,
  ezP.T3.Expr.parenth_form,
  ezP.T3.Expr.key_datum_list,
  ezP.T3.Expr.starred_item_list_comprehensive,
  ezP.T3.Expr.list_display,
  ezP.T3.Expr.non_void_starred_item_list_comprehensive,
  ezP.T3.Expr.set_display,
  ezP.T3.Expr.key_datum_list_comprehensive,
  ezP.T3.Expr.dict_display,
  ezP.T3.Expr.slice_list,
  ezP.T3.Expr.dict_display,
  ezP.T3.Expr.with_item_list,
]
/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.List')

goog.require('eYo.Decorate')
goog.require('eYo.Consolidator.List')
goog.require('eYo.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, value block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('List', {
  list: {}
}, eYo.DelegateSvg)

/**
 * Fetches the named input object, getInput.
 * @param {String} name The name of the input.
 * @param {?Boolean} dontCreate Whether the receiver should create inputs on the fly.
 * @return {Blockly.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
eYo.DelegateSvg.List.prototype.getInput = function (name, dontCreate) {
  var input = eYo.DelegateSvg.List.superClass_.getInput.call(this, name)
  if (!input) {
    this.createConsolidator()
    input = this.consolidator.getInput(this.block_, name, dontCreate)
  }
  return input
}

/**
 * Create a consolidator..
 *
 * @param {boolean} force
 */
eYo.DelegateSvg.List.prototype.createConsolidator = eYo.Decorate.reentrant_method(
  'createConsolidator',
  function (force) {
  if (!this.consolidator || force) {
    var block = this.block_
    var D = eYo.DelegateSvg.Manager.getModel(block.type).list
    goog.asserts.assert(D, 'inputModel__.list is missing in ' + block.type)
    var C10r = this.consolidatorConstructor || D.consolidator || eYo.Consolidator.List
    if (!this.consolidator || this.consolidator.constructor !== C10r) {
      this.consolidator = new C10r(D)
      goog.asserts.assert(this.consolidator, eYo.Do.format('Could not create the consolidator {0}', block.type))
    }
    if (force) {
      this.consolidate()
    }
  }
})

/**
 * Consolidate the input.
 * Removes empty place holders.
 * This must not be overriden.
 *
 * @param {!Block} block
 */
eYo.DelegateSvg.List.prototype.doConsolidate = function () {
  // this is a closure
  /**
   * Consolidate the input.
   * Removes empty place holders.
   * This must not be overriden.
   *
   * @param {!Block} block
   */
  var doConsolidate = function (deep, force) {
    if (this.will_connect_ || this.change.level) {
      // reentrant flag or wait for the new connection
      // to be established before consolidating
      // reentrant is essential because the consolidation
      // may cause rerendering ad vitam eternam.
      return
    }
    if (eYo.DelegateSvg.List.superClass_.doConsolidate.call(this, deep, force)) {
      return !this.connectionsIncog && this.consolidator.consolidate(this.block_, deep, force)
    }
  }
  return function (deep, force) {
    this.createConsolidator()
    this.doConsolidate = doConsolidate
    return doConsolidate.apply(this, arguments)// this is not recursive
  }
} ()

// eYo.DelegateSvg.List.prototype.consolidator = undefined

/**
 * Clear the list af all items.
 * For edython.
 * @param {!Block} block
 * @private
 */
eYo.DelegateSvg.List.prototype.removeItems = function (block) {
  var list = block.inputList
  var i = 0
  var input
  eYo.Events.groupWrap(this,
    function () {
      while ((input = list[i++])) {
        var c8n = input.connection
        var target = c8n.targetBlock()
        if (target) {
          c8n.disconnect()
          target.dispose()
        }
      }
      this.consolidate()
    }
  )
}

/**
 * Class for a DelegateSvg, optional expression_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('optional_expression_list', {
  list: {
    check: eYo.T3.Expr.Check.expression,
    mandatory: 0,
    presep: ',',
    hole_value: 'name'
  }
})

/**
 * Class for a DelegateSvg, expression_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('non_void_expression_list', {
  list: {
    check: eYo.T3.Expr.Check.expression,
    empty: false,
    presep: ',',
    hole_value: 'name'
  }
})

/**
 * Class for a DelegateSvg, starred_item_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('starred_item_list', {
  list: {
    check: eYo.T3.Expr.Check.starred_item,
    empty: false,
    presep: ',',
    hole_value: 'name'
  }
})

/**
 * Class for a DelegateSvg, key_datum_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('key_datum_list', {
  list: {
    check: eYo.T3.Expr.Check.key_datum_all,
    mandatory: 0,
    presep: ','
  }
})

/**
 * Class for a DelegateSvg, starred_item_list_comprehensive block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('starred_item_list', {
  list: {
    check: eYo.T3.Expr.Check.non_void_starred_item_list,
    mandatory: 0,
    presep: ',',
    hole_value: 'name'
  }
})

/**
 * Class for a DelegateSvg, starred_item_list_comprehensive block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('non_void_starred_item_list', {
  list: {
    check: eYo.T3.Expr.Check.non_void_starred_item_list,
    empty: false,
    presep: ',',
    hole_value: 'name'
  }
})

/**
 * Class for a DelegateSvg, starred_item_list_comprehensive block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('starred_item_list_comprehensive', function () {
  var D = {
    check: eYo.T3.Expr.Check.non_void_starred_item_list,
    unique: eYo.T3.Expr.comprehension,
    consolidator: eYo.Consolidator.List.Singled,
    mandatory: 0,
    presep: ',',
    hole_value: 'name'
  }
  var RA = goog.array.concat(D.check, D.unique)
  goog.array.removeDuplicates(RA)
  D.all = RA
  return {
    list: D
  }
})

/**
 * Class for a DelegateSvg, list_display block.
 * For edython.
 */
eYo.DelegateSvg.Expr.starred_item_list_comprehensive.makeSubclass('list_display', {
  xml: {
    tag: 'square_bracket'
  },
  fields: {
    prefix: '[',
    suffix: ']'
  }
})

/**
 * Class for a DelegateSvg, non_void_starred_item_list_comprehensive block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('non_void_starred_item_list_comprehensive', function () {
  var D = {
    check: eYo.T3.Expr.Check.non_void_starred_item_list,
    unique: eYo.T3.Expr.comprehension,
    consolidator: eYo.Consolidator.List.Singled,
    empty: false,
    presep: ',',
    hole_value: 'name'
  }
  var RA = goog.array.concat(D.check, D.unique)
  goog.array.removeDuplicates(RA)
  D.all = RA
  return {
    list: D
  }
})

/**
 * Class for a DelegateSvg, set_display block.
 * For edython.
 */
eYo.DelegateSvg.Expr.non_void_starred_item_list_comprehensive.makeSubclass('set_display', {
  xml: {
    tag: 'curly_bracket'
  },
  fields: {
    prefix: '{',
    suffix: '}'
  }
})

/**
 * Class for a DelegateSvg, key_datum_list_comprehensive block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('key_datum_list_comprehensive', function () {
  var D = {
    check: eYo.T3.Expr.Check.key_datum_list,
    unique: eYo.T3.Expr.dict_comprehension,
    consolidator: eYo.Consolidator.List.Singled,
    mandatory: 0,
    presep: ','
  }
  var RA = goog.array.concat(D.check, D.unique)
  goog.array.removeDuplicates(RA)
  D.all = RA
  return {
    list: D
  }
})

/**
 * Class for a DelegateSvg, dict_display block.
 * For edython.
 */
eYo.DelegateSvg.Expr.key_datum_list_comprehensive.makeSubclass('dict_display', {
  fields: {
    prefix: '{',
    suffix: '}'
  }
})

/**
 * Class for a DelegateSvg, slice_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('slice_list', {
  list: {
    check: eYo.T3.Expr.Check.slice_item,
    empty: false,
    presep: ','
  }
})

/**
 * Class for a DelegateSvg, with_item_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('with_item_list', {
  list: {
    check: eYo.T3.Expr.Check.with_item,
    empty: false,
    presep: ',',
    hole_value: 'nom'
  }
})

eYo.DelegateSvg.List.T3s = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.comprehension,
  eYo.T3.Expr.dict_comprehension,
  eYo.T3.Expr.key_datum,
  eYo.T3.Expr.optional_expression_list,
  eYo.T3.Expr.non_void_expression_list,
  eYo.T3.Expr.starred_item_list,
  eYo.T3.Expr.parenth_form,
  eYo.T3.Expr.key_datum_list,
  eYo.T3.Expr.starred_item_list_comprehensive,
  eYo.T3.Expr.list_display,
  eYo.T3.Expr.non_void_starred_item_list_comprehensive,
  eYo.T3.Expr.set_display,
  eYo.T3.Expr.key_datum_list_comprehensive,
  eYo.T3.Expr.dict_display,
  eYo.T3.Expr.slice_list,
  eYo.T3.Expr.dict_display,
  eYo.T3.Expr.with_item_list
]

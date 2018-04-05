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
ezP.DelegateSvg.List = function (prototypeName) {
  ezP.DelegateSvg.List.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.list = {}
}
goog.inherits(ezP.DelegateSvg.List, ezP.DelegateSvg.Expr)

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
ezP.DelegateSvg.List.prototype.consolidate_ = function (block) {
  if (this.consolidating_ || this.will_connect_) {
    // reentrant flag or wait for the new connection
    // to be established before consolidating
    // reentrant is essential because the consolidation
    // may cause rerendering ad vitam eternam.
    return
  }
  ezP.DelegateSvg.List.superClass_.consolidate.call(this, block)
  this.consolidating_ = true
  try { 
    this.consolidator.consolidate(block)
  } catch(err) {
      throw(err)
  } finally {
    this.consolidating_ = false
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
    var D = ezP.DelegateSvg.Manager.getInputModel(block.type).list
    goog.asserts.assert(D, 'inputModel__.list is missing in '+block.type)
    var Ctor = D.consolidator? D.consolidator:
    ezP.Consolidator.List
    this.consolidator = new Ctor(D)
    goog.asserts.assert(this.consolidator, 'Could not create the consolidator '+Ctor)
  }
}

/**
 * Consolidate the input.
 * Removes empty place holders.
 * This must not be overriden.
 * 
 * @param {!Block} block.
 */
ezP.DelegateSvg.List.prototype.consolidate = function (block) {
  this.createConsolidator(block)
  this.consolidate = ezP.DelegateSvg.List.prototype.consolidate_
  this.consolidate(block)// this is not recursive
}

// ezP.DelegateSvg.List.prototype.consolidator = undefined

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.List.prototype.initBlock = function(block) {
  ezP.DelegateSvg.List.superClass_.initBlock.call(this, block)
  block.appendValueInput(ezP.Do.Name.middle_name)
}

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
  while ((input = list[i++])) {
    var c8n = input.connection
    var target = c8n.targetBlock()
    if (target) {
      c8n.disconnect()
      target.dispose()
    }
  }
  this.consolidate(block)
  Blockly.Events.setGroup(false)
}

/**
 * Convert the block to python code components.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return the last element of components
 */
ezP.DelegateSvg.List.prototype.toPythonExpressionComponents = function (block, components) {
  this.consolidate(block)
  var last = components[components.length-1]
  var e8r = block.ezp.inputEnumerator(block)
  while (e8r.next()) {
    var c8n = e8r.here.connection
    if (c8n) {
      var target = c8n.targetBlock()
      if (target) {
        last = target.ezp.toPythonExpressionComponents(target, components)
        // NEWLINE
      } else if (!c8n.ezp.optional_ && !c8n.ezp.s7r_) {
        last = '<MISSING ELEMENT>'
        components.push(last)
        // NEWLINE
      } else {
        for (var j = 0, field; (field = e8r.here.fieldRow[j++]);) {
          var x = field.getText()
          if (x.length) {
            if (last && last.length) {
              var mustSeparate = last[last.length-1].match(/[,;:]/)
              var maySeparate = mustSeparate || ezP.XRE.id_continue.test(last[last.length-1])
            }
            if (mustSeparate || (maySeparate && ezP.XRE.id_continue.test(x[0]))) {
              components.push(' ')
            }
            components.push(x)
            last = x              
          }
        }
      }
    }
  }
  return last
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
ezP.DelegateSvg.Expr.optional_expression_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.optional_expression_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.list = {
    check: ezP.T3.Expr.Check.expression,
    empty: true,
    sep: ',',
    hole_value: 'name',
  }
  this.outputModel__ = {
    check: ezP.T3.Expr.optional_expression_list,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.optional_expression_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('optional_expression_list')

/**
 * Class for a DelegateSvg, expression_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.non_void_expression_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.non_void_expression_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.list = {
    check: ezP.T3.Expr.Check.expression,
    empty: false,
    sep: ',',
    hole_value: 'name',
  }
  this.outputModel__ = {
    check: ezP.T3.Expr.non_void_expression_list,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.non_void_expression_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('non_void_expression_list')

/**
 * Class for a DelegateSvg, starred_item_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.starred_item_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.starred_item_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.list = {
    check: ezP.T3.Expr.Check.starred_item,
    empty: true,
    sep: ',',
    hole_value: 'name',
  }
  this.outputModel__ = {
    check: ezP.T3.Expr.starred_item_list,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.starred_item_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('starred_item_list')


/**
 * Class for a DelegateSvg, parenth_form.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.parenth_form = function (prototypeName) {
  ezP.DelegateSvg.Expr.parenth_form.superClass_.constructor.call(this, prototypeName)
  this.outputModel__ = {
    check: ezP.T3.Expr.parenth_form,
  }
  this.inputModel__.prefix = {
    label: '(',
  }
  this.inputModel__.suffix = {
    label: ')',
  }
}
goog.inherits(ezP.DelegateSvg.Expr.parenth_form, ezP.DelegateSvg.Expr.starred_item_list)
ezP.DelegateSvg.Manager.register('parenth_form')

/**
 * Class for a DelegateSvg, key_datum_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.key_datum_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.key_datum_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.list = {
    check: ezP.T3.Expr.Check.key_datum,
    empty: true,
    sep: ',',
  }
  this.outputModel__ = {
    check: ezP.T3.Expr.key_datum_list,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.key_datum_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('key_datum_list')

/**
 * Class for a DelegateSvg, starred_item_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.starred_item_list_comprehensive = function (prototypeName) {
  ezP.DelegateSvg.Expr.starred_item_list_comprehensive.superClass_.constructor.call(this, prototypeName)
  var D = {
    check: ezP.T3.Expr.Check.non_void_starred_item_list,
    single: ezP.T3.Expr.comprehension,
    consolidator: ezP.Consolidator.List.Singled,
    empty: true,
    sep: ',',
    hole_value: 'name',
  }
  var RA = goog.array.concat(D.check,D.single)
  goog.array.removeDuplicates(RA)
  D.all = RA
  this.inputModel__.list = D
  this.outputModel__ = {
    check: ezP.T3.Expr.starred_item_list_comprehensive,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.starred_item_list_comprehensive, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('starred_item_list_comprehensive')


/**
 * Class for a DelegateSvg, list_display block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.list_display = function (prototypeName) {
  ezP.DelegateSvg.Expr.list_display.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.prefix = {
    label: '[',
  }
  this.inputModel__.suffix = {
    label: ']',
  }
  this.outputModel__ = {
    awaitable: true,
    check: ezP.T3.Expr.list_display,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.list_display, ezP.DelegateSvg.Expr.starred_item_list_comprehensive)
ezP.DelegateSvg.Manager.register('list_display')

/**
 * Class for a DelegateSvg, non_void_starred_item_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.non_void_starred_item_list_comprehensive = function (prototypeName) {
  ezP.DelegateSvg.Expr.non_void_starred_item_list_comprehensive.superClass_.constructor.call(this, prototypeName)
  var D = {
    check: ezP.T3.Expr.Check.non_void_starred_item_list,
    single: ezP.T3.Expr.comprehension,
    empty: false,
    sep: ',',
  }
  var RA = goog.array.concat(D.check,D.single)
  goog.array.removeDuplicates(RA)
  D.all = RA
  this.inputModel__.list = D
  this.outputModel__ = {
    check: ezP.T3.Expr.non_void_starred_item_list_comprehensive,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.non_void_starred_item_list_comprehensive, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('non_void_starred_item_list_comprehensive')

/**
 * Class for a DelegateSvg, set_display block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.set_display = function (prototypeName) {
  ezP.DelegateSvg.Expr.set_display.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.prefix = {
    label: '{',
  }
  this.inputModel__.suffix = {
    label: '}',
  }
  this.outputModel__ = {
    awaitable: true,
    check: ezP.T3.Expr.set_display,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.set_display, ezP.DelegateSvg.Expr.non_void_starred_item_list_comprehensive)
ezP.DelegateSvg.Manager.register('set_display')

/**
 * Class for a DelegateSvg, key_datum_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.key_datum_list_comprehensive = function (prototypeName) {
  ezP.DelegateSvg.Expr.key_datum_list_comprehensive.superClass_.constructor.call(this, prototypeName)
  var D = {
    check: ezP.T3.Expr.Check.key_datum_list,
    single: ezP.T3.Expr.dict_comprehension,
    empty: true,
    sep: ',',
  }
  var RA = goog.array.concat(D.check,D.single)
  goog.array.removeDuplicates(RA)
  D.all = RA
  this.inputModel__.list = D
  this.outputModel__ = {
    check: ezP.T3.Expr.key_datum_list_comprehensive,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.key_datum_list_comprehensive, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('key_datum_list_comprehensive')

/**
 * Class for a DelegateSvg, dict_display block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.dict_display = function (prototypeName) {
  ezP.DelegateSvg.Expr.dict_display.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.prefix = {
    label: '{',
  }
  this.inputModel__.suffix = {
    label: '}',
  }
  this.outputModel__ = {
    awaitable: true,
    check: ezP.T3.Expr.dict_display,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.dict_display, ezP.DelegateSvg.Expr.key_datum_list_comprehensive)
ezP.DelegateSvg.Manager.register('dict_display')

/**
 * Class for a DelegateSvg, slice_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.slice_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.slice_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.list = {
    check: ezP.T3.Expr.Check.slice_item,
    empty: false,
    sep: ',',
  }
  this.outputModel__ = {
    check: ezP.T3.Expr.slice_list,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.slice_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('slice_list')

/**
 * Class for a DelegateSvg, 'slice ...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.display_slice_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.display_slice_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.prefix = {
    label: '[',
  }
  this.inputModel__.suffix = {
    label: ']',
  }
  this.outputModel__ = {
    check: ezP.T3.Expr.display_slice_list,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.display_slice_list, ezP.DelegateSvg.Expr.slice_list)

ezP.DelegateSvg.Manager.register('display_slice_list')

/**
 * Class for a DelegateSvg, with_item_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.with_item_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.with_item_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel__.list = {
    check: ezP.T3.Expr.Check.with_item,
    empty: false,
    sep: ',',
  }
  this.outputModel__ = {
    check: ezP.T3.Expr.with_item_list,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.with_item_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('with_item_list')


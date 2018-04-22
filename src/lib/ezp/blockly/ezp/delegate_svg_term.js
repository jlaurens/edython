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

goog.provide('ezP.DelegateSvg.Term')

goog.require('ezP.MenuItem')
goog.require('ezP.FieldInput')
goog.require('ezP.Style')

/**
 * Class for a DelegateSvg, term block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass(ezP.Key.TERM, {
  inputs: {
    modifiers: ['', '*', '**'],// don't change that order
    subtypes: [ezP.T3.Expr.identifier,
      ezP.T3.Expr.dotted_name,
      ezP.T3.Expr.parent_module],// don't change that order
    modifier: {
      label: '',
      css_class: 'ezp-code-reserved',
    },
    i_1: {
      term: {
        key:ezP.Key.VALUE,
        value: '',
        placeholder: ezP.Msg.Placeholder.TERM,
        validator: function(txt) {
          var block = this.sourceBlock_
          if (block) {
            var ezp = block.ezp
            var v = ezp.validateValue(block, txt || this.getValue())
            return v && v.validated
          }
        },
        onEndEditing: function () {
          var block = this.sourceBlock_
          var ezp = block.ezp
          ezp.setValue(block, this.getValue())
        },
      },
    },
    i_2: {
      key: ezP.Key.ANNOTATION,
      label: ':',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    i_3: {
      key: ezP.Key.DEFINITION,
      label: '=',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
  },
  output: {
    didConnect: function(oldTargetConnection, oldConnectionn) {
      // `this` is a connection's delegate
      var targetC8n = this.targetConnection
      var source = targetC8n.sourceBlock_
      if (source.ezp instanceof ezP.DelegateSvg.List) {

      } else {
        for (var i = 0, input;(input = source.inputList[i++]);) {
          if (input.connection === targetC8n) {
            if (input.ezp.model) {
              var block = this.sourceBlock_
              block.ezp.setPhantomValue(block, input.ezp.model.hole_value)
            }
            return
          }
        }
      }
    },
    didDisconnect: function(oldConnection) {
      // `this` is a connection's delegate
      var block = this.sourceBlock_
      block.ezp.setPhantomValue(block, undefined)
    },
  }
})

/**
 * Some block should not be wrapped.
 * Default implementation returns false
 * @param {!Block} block.
 * @return whether the block should be wrapped
 */
ezP.DelegateSvg.Expr.term.prototype.noBlockWrapped = function (block) {
  return true
}

/**
 * Init the variant.
 * For that blocks, the variant is a set of flags to control which input should be visible.
 * @param {!Blockly.Block} block to be initialized.
 */
ezP.DelegateSvg.Expr.term.prototype.initVariant = function (block) {
  ezP.DelegateSvg.Expr.term.superClass_.initVariant.call(this, block)
  this.setVariant(block, 0)
}

/**
 * Validates the new variant.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newVariant
 * @return true if newVariant is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.term.prototype.validateVariant = function (block, newVariant) {
  return goog.isNumber(newVariant) && 0 <= newVariant && newVariant <= 4 && {validated: newVariant}
}

/**
 * When the variant did change.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldVariant
 * @param {string} newVariant
 */
ezP.DelegateSvg.Expr.term.prototype.didChangeVariant = function(block, oldVariant, newVariant) {
  ezP.DelegateSvg.Expr.term.superClass_.didChangeVariant.call(this, block, oldVariant, newVariant)
  var withAnnotation = newVariant % 2
  var withDefinition = newVariant & 2
  var withoutValue = newVariant & 4
}

/**
 * Synchornize the modifier with the ui.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} newModifier
 */
ezP.DelegateSvg.Expr.term.prototype.synchronizeModifier = function(block, newModifier) {
  var field = block.ezp.ui.fields.modifier
  field.setValue(newModifier)
  field.setVisible(newModifier && newModifier.length>0)
}

/**
 * Initialize the value.
 * @param {!Blockly.Block} block to be initialized.
 */
ezP.DelegateSvg.Expr.term.prototype.initValue = function (block) {
  this.setValue(block, this.ui.i_1.fields.value.getValue() || '')
  return
}

/**
 * When the value did change, sets the subtype accordingly.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldValue
 * @param {string} newValue
 */
ezP.DelegateSvg.Expr.term.prototype.didChangeValue = function (block, oldValue, newValue) {
  ezP.DelegateSvg.Expr.term.superClass_.didChangeValue.call(this, block, oldValue, newValue)
  var type = newValue? ezP.Do.typeOfString(newValue): ezP.T3.Expr.identifier
  block.ezp.setSubtype(block, type)
  return
}

/**
 * Synchronize the value with the ui.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} newValue
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.synchronizeValue = function (block, newValue) {
  this.ui.i_1.fields.value.setValue(newValue)
}

/**
 * Validates the new value.
 * The type must be one of `dotted_name` or `identifier`.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.term.prototype.validateValue = function (block, newValue) {
  var subtypes = this.getSubtypes(block)
  var subtype = ezP.Do.typeOfString(newValue)
  return (subtypes.indexOf(subtype)>= 0) && {validated: newValue} || null
}

/**
 * Set the placeholderText.
 * @param {!Block} block.
 * @param {!string} text.
 * @return true
 */
ezP.DelegateSvg.Expr.term.prototype.setPhantomValue = function(block, text) {
  var field = this.ui.i_1.fields.value
  field.placeholderText_ = text
  field.render_()
  return true
}

/**
 * Show the editor for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
ezP.DelegateSvg.Expr.term.prototype.showEditor = function (block) {
  this.ui.i_1.fields.value.showEditor_()
}

/**
 * The type and connection depend on the properties modifier, value and variant.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.term.prototype.consolidateType = function (block) {
/*
  * The possible types for the blocks are all expression types, namely
  * expression_star ::= "*" expression
  * parameter_star ::= "*" [parameter]
  * target_star ::= "*" target
  * expression_star_star ::= "**" expression
  * parameter_star_star ::= "**" parameter
  * attributeref ::= primary "." identifier
  * dotted_name ::= identifier ("." identifier)*
  * parent_module ::= '.'+ [module]
  * identifier ::= 
  * parameter_solid ::= identifier ":" expression
  * defparameter_solid ::= parameter "=" expression
  * (with parameter ::= identifier | parameter_solid)
  * (with module ::= dotted_name)
  */
  if (this.consolidatingType_) {
    return
  }
  this.consolidatingType_ = true
  try {
    var modifier = this.getModifier(block)
    var modifiers = this.getModifiers(block)
    var i = modifiers.indexOf(modifier)
    var withModifier = i > 0
    // first step: being consistent
    var flags = this.getVariant(block)
    var withoutValue = flags & 4 && i === 1
    var withAnnotation = flags % 2 && i !== 2 && !withoutValue
    var withDefinition = flags & 2 && i === 0 && !withoutValue
    var subtype = this.getSubtype(block)
    var subtypes = this.getSubtypes(block)
    var j = subtypes.indexOf(subtype)
    // further checks are based on the subtype.
    if (!withoutValue) {
      if (j === 2) {
        // only one possibility
        withModifier = withAnnotation = withDefinition = false
      } else if (j === 1) {
        withAnnotation = withDefinition = false
      }
    }
    flags = withAnnotation?0:1 + withDefinition?0:2 + withoutValue?0:4
    this.setVariant(flags)
    this.setNamedInputDisabled(block, ezP.Key.VALUE, withoutValue)
    this.setNamedInputDisabled(block, ezP.Key.ANNOTATION, !withAnnotation)
    this.setNamedInputDisabled(block, ezP.Key.DEFINITION, !withDefinition)
    this.ui.fields.modifier.setVisible(withModifier)
    if (withoutValue) {
      // only one possibility
      block.outputConnection.setCheck([ezP.T3.Expr.parameter_star])
    } else if (subtype === ezP.T3.Expr.parent_module) {
      // only one possibility
      block.outputConnection.setCheck([subtype])
    } else if (i === 1) {
      /* One of
      * expression_star ::= "*" expression
      * parameter_star ::= "*" [parameter]
      * target_star ::= "*" target
      */
      if (subtype === ezP.T3.Expr.identifier) {
        block.outputConnection.setCheck(withAnnotation || withDefinition?[ezP.T3.Expr.parameter_star]: [ezP.T3.Expr.expression_star,
        ezP.T3.Expr.parameter_star,
        ezP.T3.Expr.target_star])
      } else /* if (subtype === ezP.T3.Expr.dotted_name */ {
        block.outputConnection.setCheck([ezP.T3.Expr.expression_star,
        ezP.T3.Expr.target_star])
      }
    } else if (i === 2) {
      /* One of
      * expression_star_star ::= "**" expression
      * parameter_star_star ::= "**" parameter
      */
      if (subtype === ezP.T3.Expr.identifier) {
        block.outputConnection.setCheck([ezP.T3.Expr.expression_star_star,
        ezP.T3.Expr.parameter_star_star])
      } else /* if (subtype === ezP.T3.Expr.dotted_name */ {
        block.outputConnection.setCheck([ezP.T3.Expr.expression_star_star])
      }
    } else /* if (i === 0) */ {
      /* One of
      * attributeref ::= primary "." identifier
      * dotted_name ::= identifier ("." identifier)*
      * parent_module ::= '.'+ [module]
      * identifier ::= 
      * parameter_solid ::= identifier ":" expression
      * defparameter_solid ::= parameter "=" expression
      */
      if (subtype === ezP.T3.Expr.identifier) {
        block.outputConnection.setCheck(withDefinition?([ezP.T3.Expr.defparameter_solid,]):(withAnnotation?([ezP.T3.Expr.parameter_solid,]):([ezP.T3.Expr.identifier, ezP.T3.Expr.dotted_name,])))
      } else /* if (subtype === ezP.T3.Expr.dotted_name */ {
        block.outputConnection.setCheck([ezP.T3.Expr.expression_star_star])
      }
    }
  } finally {
    delete this.consolidatingType_
  }
  ezP.DelegateSvg.Expr.term.superClass_.consolidateType.call(this, block)
}

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Expr.term.prototype.makeTitle = function (block, op, flags) {
  if (flags === undefined) {
    flags = this.getVariant(block)
  }
  var withAnnotation = flags % 2
  var withDefinition = flags & 2
  var withoutValue = flags & 4
  
  var element = goog.dom.createDom(goog.dom.TagName.SPAN, null,
    ezP.Do.createSPAN(op||' ', 'ezp-code-reserved'),
  )
  if (!withoutValue) {
    var value = this.getValue(block)
    element.appendChild(ezP.Do.createSPAN(value || 'nom', value? 'ezp-code': 'ezp-code-placeholder'))
  }
  if (withAnnotation) {
    element.appendChild(ezP.Do.createSPAN(':', 'ezp-code-reserved'))
    element.appendChild(ezP.Do.createSPAN(' …', 'ezp-code-placeholder'))
  }
  if (withDefinition) {
    element.appendChild(ezP.Do.createSPAN(' = ', 'ezp-code-reserved'))
    element.appendChild(ezP.Do.createSPAN('…', 'ezp-code-placeholder'))
  }
  return element
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.term.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var modifiers = this.getModifiers(block)
  var i = modifiers.indexOf(this.getModifier(block))
  var currentFlags = this.getVariant(block)
  var F = function(j, flags) {
    var modifier = modifiers[j]
    if (j !== i || flags !== currentFlags) {
      var title = block.ezp.makeTitle(block, modifier, flags)
      var menuItem = new ezP.MenuItem(title, function() {
        block.ezp.setModifier(block, modifier)
        block.ezp.setVariant(block, flags)
      })
      mgr.addChild(menuItem, true)
    }
  }
  if (currentFlags === 4) {
    F(0, 0)
    F(0, 2)
    F(0, 1)
    F(1, 0)
    F(2, 0)
  } else {
    // add or remove the '=…' part
    if (i) {
      F(0, currentFlags)
    } else {
      F(i, currentFlags & 1)
      F(i, currentFlags | 2)
    }
    F(1, 4)
    F(1, currentFlags & 1)
    F(2, currentFlags & 1)
    // add or remove the ':…' part
    if (i < 2) {
      F(i, currentFlags & 2)
      F(i, currentFlags | 1)
    }
  }
  mgr.shouldSeparate()
  var menuItem = new ezP.MenuItem(ezP.Msg.RENAME, function() {
      block.ezp.showEditor()
    })
  mgr.addChild(menuItem, true)
  mgr.shouldSeparate()
  ezP.DelegateSvg.Expr.term.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

ezP.DelegateSvg.Term.T3s = [
  ezP.T3.Expr.term,
]
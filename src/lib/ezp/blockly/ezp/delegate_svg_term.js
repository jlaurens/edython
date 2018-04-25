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
            var v = ezp.validateValue(block, goog.isDef(txt)? txt: this.getValue())
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
    i_4: {
      label: 'as',
      css_class: 'ezp-code-reserved',
      edit: {
        key:ezP.Key.ALIAS,
        value: '',
        placeholder: ezP.Msg.Placeholder.ALIAS,
        validator: function(txt) {
          var block = this.sourceBlock_
          if (block) {
            var ezp = block.ezp
            var v = ezp.validateAlias(block, goog.isDef(txt)? txt: this.getValue())
            return v && v.validated
          }
        },
        onEndEditing: function () {
          var block = this.sourceBlock_
          var ezp = block.ezp
          ezp.setAlias(block, this.getValue())
        },
      },
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

ezP.Delegate.addInstanceProperty(ezP.DelegateSvg.Expr.term, ezP.Key.ALIAS)

/**
 * Init the alias in the properties.
 * For that blocks, the variant is a set of flags to control which input should be visible.
 * @param {!Blockly.Block} block to be initialized.
 */
ezP.DelegateSvg.Expr.term.prototype.initAlias = function (block) {
  this.setAlias(block, '')
}

/**
 * Validate the alias in the properties.
 * For that blocks, the variant is a set of flags to control which input should be visible.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} newAlias
 * @return an object when validated, undefined otherwise.
 */
ezP.DelegateSvg.Expr.term.prototype.validateAlias = function (block, newAlias) {
  var subtype = ezP.Do.typeOfString(newAlias)
  return (subtype === ezP.T3.Expr.identifier) && {validated: newAlias} || null
}
/**
 * Synchronize the value with the ui.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} newValue
 */
ezP.DelegateSvg.Expr.term.prototype.synchronizeAlias = function (block, newAlias) {
  this.ui.i_4.fields.alias.setValue(newAlias || '')
}

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
  if (!goog.isNumber(newVariant)) {
    return null
  }
  var modifier = this.getModifier(block)
  var modifiers = this.getModifiers(block)
  var i = modifiers.indexOf(modifier)
  var withModifier = i > 0
  // first step: being consistent
  var flags = newVariant
  var withoutValue = flags & 4 && i === 1
  var withAnnotation = flags % 2 && i !== 2 && !withoutValue
  var withDefinition = flags & 2 && i === 0
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
  var withAlias = flags & 8 && i === 0 && !withAnnotation && !withDefinition
  flags = (withAnnotation?1:0) + (withDefinition?2:0) + (withoutValue?4:0) + (withAlias?8:0)
  return {validated: flags}
}

/**
 * Synchronize the variant with the ui.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} newVariant
 */
ezP.DelegateSvg.Expr.term.prototype.synchronizeVariant = function(block, newVariant) {
  var flags = newVariant
  var withoutValue = flags & 4
  var withAnnotation = flags % 2
  var withDefinition = flags & 2
  var withAlias = flags & 8
  this.setInputDisabled(block, this.ui.i_1.input, withoutValue)
  this.setInputDisabled(block, this.ui.i_2.input, !withAnnotation)
  this.setInputDisabled(block, this.ui.i_3.input, !withDefinition)
  this.setInputDisabled(block, this.ui.i_4.input, !withAlias)
}

/**
 * Synchronize the modifier with the ui.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} newModifier
 */
ezP.DelegateSvg.Expr.term.prototype.synchronizeModifier = function(block, newModifier) {
  var field = block.ezp.ui.fields.modifier
  field.setValue(newModifier || '')
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
  var subtype = newValue? ezP.Do.typeOfString(newValue): ezP.T3.Expr.identifier
  block.ezp.setSubtype(block, subtype)
  var subtypes = this.getSubtypes(block)
  var j = subtypes.indexOf(subtype)
  if (j == 2) {
    this.setModifier(block, 0)
  }
  return
}

/**
 * Synchronize the value with the ui.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} newValue
 */
ezP.DelegateSvg.Expr.term.prototype.synchronizeValue = function (block, newValue) {
  this.ui.i_1.fields.value.setValue(newValue || '')
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
  * keyword_item ::= identifier "=" expression
  * module_as_solid ::= module "as" identifier
  * import_identifier_as_solid ::= identifier "as" identifier
  * (with parameter ::= identifier | parameter_solid)
  * (with module ::= dotted_name)
  */
  var modifier = this.getModifier(block)
  var modifiers = this.getModifiers(block)
  var i = modifiers.indexOf(modifier)
  var withModifier = i > 0
  // first step: being consistent
  var flags = this.getVariant(block)
  var withoutValue = flags & 4
  var withAnnotation = flags % 2
  var withDefinition = flags & 2
  var withAlias = flags & 8
  var subtype = this.getSubtype(block)
  var subtypes = this.getSubtypes(block)
  var j = subtypes.indexOf(subtype)
  if (withoutValue) {
    // only one possibility
    block.outputConnection.setCheck([ezP.T3.Expr.parameter_star])
  } else if (withAlias) {
    // only two possibilities
    block.outputConnection.setCheck(j > 0? [ezP.T3.Expr.module_as_solid]: [ezP.T3.Expr.module_as_solid, ezP.T3.Expr.import_identifier_as_solid])
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
    * keyword_item ::= identifier "=" expression
    * module_as_solid ::= module "as" identifier
    * import_identifier_as_solid ::= identifier "as" identifier
    */
    if (subtype === ezP.T3.Expr.identifier) {
      block.outputConnection.setCheck((withDefinition?([ezP.T3.Expr.defparameter_solid,ezP.T3.Expr.keyword_item,]):(withAnnotation?([ezP.T3.Expr.parameter_solid,]):([ezP.T3.Expr.identifier, ezP.T3.Expr.dotted_name,]))))
    } else {
      block.outputConnection.setCheck([subtype,])
    }
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
  var withAlias = flags & 8
  
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
  if (withAlias) {
    element.appendChild(ezP.Do.createSPAN(' as ', 'ezp-code-reserved'))
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
  var withAnnotation = currentFlags % 2
  var withDefinition = currentFlags & 2
  var withoutValue = currentFlags & 4
  var withAlias = currentFlags & 8
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
  if (withoutValue || withAlias) {
    F(0, 0)
    F(0, 2)
    F(0, 1)
    F(0, 8)
    F(1, 4)
    F(1, 0)
    F(2, 0)
  } else {
    // add or remove the '=…' part
    F(0, 0)
    if (i === 0) {
      F(0, currentFlags | 2)
      F(0, currentFlags | 1)
    }
    F(0, 8)
    F(1, 4)
    F(1, currentFlags & 1)
    // add or remove the ':…' part
    if (i === 1) {
      F(1, currentFlags & 2)
      F(1, currentFlags | 1)
    }
    F(2, currentFlags & 1)
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
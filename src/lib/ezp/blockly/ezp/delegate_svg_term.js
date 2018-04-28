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
ezP.DelegateSvg.Manager.makeSubclass(ezP.Key.TERM, function() {
  var D = {
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
          placeholder: ezP.Msg.Placeholder.NAME_ALIAS,
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
  }
  var keys = ['NAME', 'NAME_DEFINITION', 'NAME_ALIAS',
     'STAR', 'STAR_NAME', 'STAR_STAR_NAME', 'NAME_ANNOTATION', 'STAR_NAME_ANNOTATION', 'NAME_ANNOTATION_DEFINITION']
  D.inputs.variants = []
  for (var i = 0; i < keys.length; i++) {
    D.inputs[keys[i]] = i
    D.inputs.variants.push(i)
  }
  var DD = D.inputs.variantsBySubtype = {}
  DD[ezP.T3.Expr.identifier] = D.inputs.variants
  DD[ezP.T3.Expr.dotted_name] = [D.inputs.NAME, D.inputs.NAME_ALIAS, D.inputs.STAR_NAME, D.inputs.STAR]
  DD[ezP.T3.Expr.parent_module] = [D.inputs.NAME,]
  return D
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
  this.setTrustedVariant(block, 0)
}

/**
 * Validates the new variant.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newVariant
 * @return true if newVariant is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.term.prototype.validateVariant = function (block, newVariant) {
  var variants = this.getVariants(block)
  if (variants.indexOf(newVariant) < 0) {
    return null
  }
  var inputs = this.getModel().inputs
  // simple case
  if (newVariant === inputs.STAR) {
    return {validated: newVariant}
  }
  // We won't change the variant if the subtype won't fit.
  var inputs = this.getModel().inputs 
  var subtype = this.getSubtype(block)
  var expected = inputs.variantsBySubtype[subtype]
  if (expected.indexOf(newVariant) < 0) {
    return {validated: expected[0]}
  }
  return {validated: newVariant}
}

/**
 * Synchronize the variant with the ui.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} newVariant
 */
ezP.DelegateSvg.Expr.term.prototype.synchronizeVariant = function(block, newVariant) {
  var inputs = this.getModel(block).inputs
  this.setInputDisabled(block, this.ui.i_1.input, newVariant === inputs.STAR)
  this.setInputDisabled(block, this.ui.i_2.input, newVariant !== inputs.NAME_ANNOTATION &&
  newVariant !== inputs.STAR_NAME_ANNOTATION &&
  newVariant !== inputs.NAME_ANNOTATION_DEFINITION)
  this.setInputDisabled(block, this.ui.i_3.input, newVariant !== inputs.NAME_DEFINITION &&
  newVariant !== inputs.NAME_ANNOTATION_DEFINITION)
  this.setInputDisabled(block, this.ui.i_4.input, newVariant !== inputs.NAME_ALIAS)
  var field = block.ezp.ui.fields.modifier
  var newModifier = newVariant === inputs.STAR || newVariant === inputs.STAR_NAME || newVariant === inputs.STAR_NAME_ANNOTATION? '*': (newVariant === inputs.STAR_STAR_NAME? '**': '')
  field.setValue(newModifier)
  field.setVisible(newModifier.length>0)
}

/**
 * Initialize the value.
 * @param {!Blockly.Block} block to be initialized.
 */
ezP.DelegateSvg.Expr.term.prototype.initValue = function (block) {
  this.setValue(block, this.ui.i_1.fields.value.getValue() || '') || this.didChangeValue(block, undefined, this.getValue(block))
  return
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
  var subtype = ezP.Do.typeOfString(newValue)
  var inputs = this.getModel().inputs
  var expected = inputs.variantsBySubtype[subtype]
  var variant = this.getVariant(block)
  return expected && expected.indexOf(variant) >= 0? {validated: newValue}: null
}

/**
 * When the value did change, sets the subtype accordingly.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldValue
 * @param {string} newValue
 */
ezP.DelegateSvg.Expr.term.prototype.didChangeValue = function (block, oldValue, newValue) {
  var subtype = newValue? ezP.Do.typeOfString(newValue): ezP.T3.Expr.identifier
  block.ezp.setSubtype(block, subtype)
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
 * Get the placeholderText.
 * @param {!Block} block.
 * @return the phantom value
 */
ezP.DelegateSvg.Expr.term.prototype.getPhantomValue = function(block) {
  var field = this.ui.i_1.fields.value
  return field.placeholderText_
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
  // * expression_star ::= "*" expression
  // * parameter_star ::= "*" [parameter]
  // * target_star ::= "*" target
  // * star_expr ::= "*" or_expr
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
  var inputs = this.getModel().inputs
  var variant = this.getVariant(block)
  var subtype = this.getSubtype(block)
  var subtypes = this.getSubtypes(block)
  var j = subtypes.indexOf(subtype)
  var check
  if (subtype === ezP.T3.Expr.parent_module) {
    check = subtype
  } else {
    switch(variant) {
      case inputs.NAME:
        check = subtype === ezP.T3.Expr.identifier?
        subtype: [ezP.T3.Expr.dotted_name, ezP.T3.Expr.attributeref, ]
      break
      case inputs.STAR_STAR_NAME:
        // expression_star_star ::= "**" expression
        // parameter_star_star ::= "**" parameter
        check = subtype === ezP.T3.Expr.identifier?[ezP.T3.Expr.expression_star_star,
          ezP.T3.Expr.parameter_star_star]:
        [ezP.T3.Expr.expression_star_star]
      break
      case inputs.STAR_NAME:
        // expression_star ::= "*" expression
        // parameter_star ::= "*" [parameter]
        // target_star ::= "*" target
        // star_expr ::= "*" or_expr
        check = subtype === ezP.T3.Expr.identifier?
        [ezP.T3.Expr.expression_star,
          ezP.T3.Expr.parameter_star,
          ezP.T3.Expr.target_star,
          ezP.T3.Expr.star_expr,]:
        [ezP.T3.Expr.expression_star,
          ezP.T3.Expr.target_star,
          ezP.T3.Expr.star_expr,]
      break
      case inputs.NAME_ANNOTATION:
        // parameter_solid ::= identifier ":" expression
        check = [ezP.T3.Expr.parameter_solid]
      break
      case inputs.STAR_NAME_ANNOTATION:
       check = [ezP.T3.Expr.parameter_star]
      break
      case inputs.NAME_ANNOTATION_DEFINITION:
        // defparameter_solid ::= parameter "=" expression
        check = [ezP.T3.Expr.defparameter_solid,]
      break
      case inputs.NAME_DEFINITION:
        // defparameter_solid ::= parameter "=" expression
        // keyword_item ::= identifier "=" expression
        check = [ezP.T3.Expr.defparameter_solid,
          ezP.T3.Expr.keyword_item,]
      break
      case inputs.NAME_ALIAS:
        // module_as_solid ::= module "as" identifier
        // import_identifier_as_solid ::= identifier "as" identifier
        check = subtype === ezP.T3.Expr.identifier? [ezP.T3.Expr.module_as_solid, ezP.T3.Expr.import_identifier_as_solid]: [ezP.T3.Expr.module_as_solid]
      break
      case inputs.STAR:
        check = [ezP.T3.Expr.parameter_star]
      break
    }
  }
  block.outputConnection.setCheck(check)
  ezP.DelegateSvg.Expr.term.superClass_.consolidateType.call(this, block)
}

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Expr.term.prototype.makeTitle = function (block, variant) {
  if (!goog.isDef(variant)) {
    variant = this.getVariant(block)
  }
  var inputs = this.getModel().inputs
  var args = [goog.dom.TagName.SPAN, null]
  switch(variant) {
    case inputs.STAR_NAME:
    case inputs.STAR_NAME_ANNOTATION:
    case inputs.STAR:
    args.push(ezP.Do.createSPAN('*', 'ezp-code-reserved'))
    break
    case inputs.STAR_STAR_NAME:
    args.push(ezP.Do.createSPAN('**', 'ezp-code-reserved'))
    break
  }
  if (variant !== inputs.STAR) {
    var value = this.getValue(block)
    args.push(ezP.Do.createSPAN(value || this.getPhantomValue(block) || ezP.Msg.Placeholder.IDENTIFIER, value? 'ezp-code': 'ezp-code-placeholder'))
    switch(variant) {
      case inputs.NAME_ANNOTATION:
      case inputs.STAR_NAME_ANNOTATION:
      case inputs.NAME_ANNOTATION_DEFINITION:
        args.push(ezP.Do.createSPAN(':', 'ezp-code-reserved'), ezP.Do.createSPAN(' …', 'ezp-code-placeholder'))
      break
    }
    switch(variant) {
      case inputs.NAME_ANNOTATION_DEFINITION:
      case inputs.NAME_DEFINITION:
        args.push(ezP.Do.createSPAN(' = ', 'ezp-code-reserved'), ezP.Do.createSPAN('…', 'ezp-code-placeholder'))
      break
      case inputs.NAME_ALIAS:
        args.push(ezP.Do.createSPAN(' as ', 'ezp-code-reserved'), ezP.Do.createSPAN('…', 'ezp-code-placeholder'))
      break
    }
  }
  return goog.dom.createDom.apply(null, args)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.term.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = this.getVariant(block)
  var F = function(variant) {
    if (variant !== current) {
      var title = block.ezp.makeTitle(block, variant)
      var menuItem = new ezP.MenuItem(title, function() {
        Blockly.Events.setGroup(true)
        try {
          block.ezp.setVariant(block, variant)
        } finally {
          Blockly.Events.setGroup(false)
        }
      })
      mgr.addChild(menuItem, true)
    }
  }
  var variants = this.getVariants(block)
  for (var i = 0; i < variants.length; i++) {
    F(variants[i])
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
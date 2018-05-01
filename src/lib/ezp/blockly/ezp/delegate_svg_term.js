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
ezP.DelegateSvg.Expr.makeSubclass(ezP.T3.Expr.term, function() {
  var D = {
    data: {
      value: {
        default: '',
        validate: function (newValue) {
          var subtype = ezP.Do.typeOfString(newValue)
          if (subtype) {
            var expected = this.model.bySubtype[subtype]
            if (expected && (expected.indexOf(this.data.variant.get()) >= 0)) {
              return {validated: newValue}
            }
          }
          return null
        },
        synchronize: function (newValue) {
          this.setFieldValue(newValue || '', 1, ezP.Key.TERM)
        },
      },
      alias: {
        default: '',
        synchronize: function (block, newValue) {
          this.setFieldValue(newValue || '', 4)
        },
        validate: function (newValue) {
          var subtype = ezP.Do.typeOfString(newValue)
          return (subtype === ezP.T3.Expr.identifier) && {validated: newValue} || null
        }
      }, // new
      modifier: {
        all: ['', '*', '**'],
        default: 0,
      },
      subtype: {
        all: [ezP.T3.Expr.identifier,
        ezP.T3.Expr.dotted_name,
        ezP.T3.Expr.parent_module],
        default: 0,
      },
      variant: {
        default: 0,
        validate: function (newValue) {
          // this may be called very early
          var values = this.getAll()
          if (values.indexOf(newValue) < 0) {
            return null
          }
          var model = this.model
          // simple case
          if (newValue === model.STAR) {
            return {validated: newValue}
          }
          // We won't change the variant if the subtype won't fit.
          var subtype = this.data.subtype.get()
          if (subtype) {
            var expected = model.bySubtype[subtype]
            if (expected) {
              return {validated: expected.indexOf(newValue) < 0? expected[0]: newValue}
            }
            return {validated: values[0]}   
          }
          return {validated: newValue}
        },
        synchronize: function(newValue) {
          var model = this.model
          this.setInputDisabled(1, newValue === model.STAR)
          this.setInputDisabled(2, newValue !== model.NAME_ANNOTATION &&
          newValue !== model.STAR_NAME_ANNOTATION &&
          newValue !== model.NAME_ANNOTATION_DEFINITION)
          this.setInputDisabled(3, newValue !== model.NAME_DEFINITION &&
          newValue !== model.NAME_ANNOTATION_DEFINITION)
          this.setInputDisabled(4, newValue !== model.NAME_ALIAS)
          var newModifier = newValue === model.STAR || newValue === model.STAR_NAME || newValue === model.STAR_NAME_ANNOTATION? '*': (newValue === model.STAR_STAR_NAME? '**': '')
          this.setFieldValue(newModifier, null, ezP.Key.MODIFIER, true)
          this.setFieldVisible(newModifier.length>0, null, ezP.Key.MODIFIER)
        },
      },
    },
    fields: {
      modifier: {
        label: '',
        css_class: 'ezp-code-reserved',
      },
    },
    inputs: {
      i_1: {
        term: {
          key:ezP.Key.VALUE,
          value: '',
          placeholder: ezP.Msg.Placeholder.TERM,
          validator: function(txt) {
            return this.validateData(txt, ezP.Key.VALUE)
          },
          onEndEditing: function () {
            this.setData(this.getValue(), ezP.Key.VALUE)
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
            var v = this.sourceBlock_.ezp.data.alias.validate(goog.isDef(txt)? txt: this.getValue())
            return v && v.validated
          },
          onEndEditing: function () {
            this.sourceBlock_.ezp.data.alias.set(this.getValue.get())
          },
        },
      },
    },
    output: {
      didConnect: function(oldTargetConnection, oldConnection) {
        // `this` is a connection
        var targetC8n = this.targetConnection
        var source = targetC8n.sourceBlock_
        if (source.ezp instanceof ezP.DelegateSvg.List) {
          // do nothing ?
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
  var DD = D.data.variant
  DD.all = []
  for (var i = 0; i < keys.length; i++) {
    DD[keys[i]] = i
    DD.all.push(i)
  }
  var DDD = DD.bySubtype = Object.create(null)
  DDD[ezP.T3.Expr.identifier] = DD.all
  DDD[ezP.T3.Expr.dotted_name] = [DD.NAME, DD.NAME_ALIAS, DD.STAR_NAME, DD.STAR]
  DDD[ezP.T3.Expr.parent_module] = [DD.NAME,]
  return D
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
 * When the value did change, sets the subtype accordingly.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldValue
 * @param {string} newValue
 */
ezP.DelegateSvg.Expr.term.prototype.didChangeValue = function (block, oldValue, newValue) {
  var subtype = newValue? ezP.Do.typeOfString(newValue): ezP.T3.Expr.identifier
  block.ezp.data.subtype.set(subtype)
  return
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
  ezP.DelegateSvg.Expr.term.superClass_.consolidateType.call(this, block)
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
  var variantData = this.data.variant
  var model = variantData.model
  var variant = variantData.get()
  var subtype = this.data.subtype.get()
  var j = this.data.subtype.getAll().indexOf(subtype)
  var check
  if (subtype === ezP.T3.Expr.parent_module) {
    check = subtype
  } else {
    switch(variant) {
      case model.NAME:
        check = subtype === ezP.T3.Expr.identifier?
        subtype: [ezP.T3.Expr.dotted_name, ezP.T3.Expr.attributeref, ]
      break
      case model.STAR_STAR_NAME:
        // expression_star_star ::= "**" expression
        // parameter_star_star ::= "**" parameter
        check = subtype === ezP.T3.Expr.identifier?[ezP.T3.Expr.expression_star_star,
          ezP.T3.Expr.parameter_star_star]:
        [ezP.T3.Expr.expression_star_star]
      break
      case model.STAR_NAME:
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
      case model.NAME_ANNOTATION:
        // parameter_solid ::= identifier ":" expression
        check = [ezP.T3.Expr.parameter_solid]
      break
      case model.STAR_NAME_ANNOTATION:
       check = [ezP.T3.Expr.parameter_star]
      break
      case model.NAME_ANNOTATION_DEFINITION:
        // defparameter_solid ::= parameter "=" expression
        check = [ezP.T3.Expr.defparameter_solid,]
      break
      case model.NAME_DEFINITION:
        // defparameter_solid ::= parameter "=" expression
        // keyword_item ::= identifier "=" expression
        check = [ezP.T3.Expr.defparameter_solid,
          ezP.T3.Expr.keyword_item,]
      break
      case model.NAME_ALIAS:
        // module_as_solid ::= module "as" identifier
        // import_identifier_as_solid ::= identifier "as" identifier
        check = subtype === ezP.T3.Expr.identifier? [ezP.T3.Expr.module_as_solid, ezP.T3.Expr.import_identifier_as_solid]: [ezP.T3.Expr.module_as_solid]
      break
      case model.STAR:
        check = [ezP.T3.Expr.parameter_star]
      break
    }
  }
  block.outputConnection.setCheck(check)
}

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Expr.term.prototype.makeTitle = function (block, variant) {
  var variantData = this.data.variant
  if (!goog.isDef(variant)) {
    variant = variantData.get()
  }
  var args = [goog.dom.TagName.SPAN, null]
  switch(variant) {
    case variantData.STAR_NAME:
    case variantData.STAR_NAME_ANNOTATION:
    case variantData.STAR:
    args.push(ezP.Do.createSPAN('*', 'ezp-code-reserved'))
    break
    case variantData.STAR_STAR_NAME:
    args.push(ezP.Do.createSPAN('**', 'ezp-code-reserved'))
    break
  }
  if (variant !== variantData.STAR) {
    var value = this.data.value.get()
    args.push(ezP.Do.createSPAN(value || this.getPhantomValue(block) || ezP.Msg.Placeholder.IDENTIFIER, value? 'ezp-code': 'ezp-code-placeholder'))
    switch(variant) {
      case variantData.NAME_ANNOTATION:
      case variantData.STAR_NAME_ANNOTATION:
      case variantData.NAME_ANNOTATION_DEFINITION:
        args.push(ezP.Do.createSPAN(':', 'ezp-code-reserved'), ezP.Do.createSPAN(' …', 'ezp-code-placeholder'))
      break
    }
    switch(variant) {
      case variantData.NAME_ANNOTATION_DEFINITION:
      case variantData.NAME_DEFINITION:
        args.push(ezP.Do.createSPAN(' = ', 'ezp-code-reserved'), ezP.Do.createSPAN('…', 'ezp-code-placeholder'))
      break
      case variantData.NAME_ALIAS:
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
  var current = this.data.variant.get()
  var F = function(variant) {
    if (variant !== current) {
      var title = block.ezp.makeTitle(block, variant)
      var menuItem = new ezP.MenuItem(title, function() {
        Blockly.Events.setGroup(true)
        try {
          block.ezp.data.variant.set(variant)
        } finally {
          Blockly.Events.setGroup(false)
        }
      })
      mgr.addChild(menuItem, true)
    }
  }
  var variants = this.data.variant.getAll()
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
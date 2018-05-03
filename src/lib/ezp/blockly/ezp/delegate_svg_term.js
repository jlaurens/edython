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
      modifier: {
        all: ['', '*', '**'],
        noUndo: true,
        synchronize: function(newValue) {
          this.setFieldValue(newValue)
          this.setFieldVisible(newValue.length>0)
        },
        xml: {
          persistent: true,
        },
      },
      name: {
        default: '',
        validate: function (newValue) {
          var subtype = ezP.Do.typeOfString(newValue)
          if (subtype) {
            var expected = this.data.variant.model.bySubtype[subtype]
            if (expected && (expected.indexOf(this.data.variant.get()) >= 0)) {
              return {validated: newValue}
            }
          }
          return null
        },
        didChange: function(oldValue, newValue) {
          var subtype = newValue? ezP.Do.typeOfString(newValue): ezP.T3.Expr.identifier
          this.data.subtype.set(subtype)
        },
        synchronize: function (newValue) {
          this.setFieldValue(this.toText() || '')
          this.setInputDisabled(this.disabled_)
        },
        xml: {
          persistent: true,
        },
      },
      alias: {
        default: '',
        synchronize: function (block, newValue) {
          this.setFieldValue(this.toText())
          this.ui.tiles.alias.setDisabled(this.disabled_)
        },
        validate: function (newValue) {
          var subtype = ezP.Do.typeOfString(newValue)
          return (subtype === ezP.T3.Expr.identifier) && {validated: newValue} || null
        },
        xml: {
          persistent: 'required',
        }
      }, // new
      subtype: {
        all: [ezP.T3.Expr.identifier,
        ezP.T3.Expr.dotted_name,
        ezP.T3.Expr.parent_module],
        noUndo: true,
      },
      variant: {
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
        didChange: function(oldValue, newValue) {
          var model = this.model
          var newModifier = newValue === model.STAR || newValue === model.STAR_NAME || newValue === model.STAR_NAME_ANNOTATION? '*': (newValue === model.STAR_STAR_NAME? '**': '')
          this.data.modifier.set(newModifier)
          this.data.name.required = newValue !== model.STAR
          this.ui.tiles.annotation.setDisabled(newValue !== model.NAME_ANNOTATION &&
          newValue !== model.STAR_NAME_ANNOTATION &&
          newValue !== model.NAME_ANNOTATION_DEFINITION)
          this.ui.tiles.definition.setDisabled(newValue !== model.NAME_DEFINITION &&
          newValue !== model.NAME_ANNOTATION_DEFINITION)
          this.data.name.setDisabled(newValue === model.STAR)
          this.data.alias.setDisabled(newValue !== model.NAME_ALIAS)
        },
      },
    },
    fields: {
      modifier: {
        value: '',
        css: 'reserved',
      },
    },
    tiles: {
      name: {
        order: 1,
        edit: {
          placeholder: ezP.Msg.Placeholder.TERM,
          validator: function(txt) {
            return this.ezp.validateData(goog.isDef(txt)? text: this.getValue() )
          },
          onEndEditing: function () {
            this.ezp.setData(this.getValue())
          },
        },
      },
      annotation: {
        order: 2,
        label: {
          value: ':',
          css: 'reserved',
        },
        check: ezP.T3.Expr.Check.expression,
        hole_value: 'expression',
      },
      definition: {
        order: 3,
        label: {
          value: '=',
          css: 'reserved',
        },
        check: ezP.T3.Expr.Check.expression,
        hole_value: 'expression',
      },
      as: {
        order: 4,
        label: {
          value: 'as',
          css: 'reserved',
        },
        edit: {
          placeholder: ezP.Msg.Placeholder.ALIAS,
          validator: function(txt) {
            return this.validateData(goog.isDef(txt)? txt: this.getValue())
          },
          onEndEditing: function () {
            this.setData(this.getValue())
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
 * Get the placeholderText.
 * @param {!Block} block.
 * @return the phantom value
 */
ezP.DelegateSvg.Expr.term.prototype.getPhantomValue = function(block) {
  var field = this.ui.tiles.name.fields.name
  return field.placeholderText_
}

/**
 * Set the placeholderText.
 * @param {!Block} block.
 * @param {!string} text.
 * @return true
 */
ezP.DelegateSvg.Expr.term.prototype.setPhantomValue = function(block, text) {
  var field = this.ui.tiles.name.fields.name
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
  this.ui.tiles.name.fields.name.showEditor_()
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
  var model = this.data.variant.model
  if (!goog.isDef(variant)) {
    variant = variantData.get()
  }
  var args = [goog.dom.TagName.SPAN, null]
  switch(variant) {
    case model.STAR_NAME:
    case model.STAR_NAME_ANNOTATION:
    case model.STAR:
    args.push(ezP.Do.createSPAN('*', 'ezp-code-reserved'))
    break
    case model.STAR_STAR_NAME:
    args.push(ezP.Do.createSPAN('**', 'ezp-code-reserved'))
    break
  }
  if (variant !== model.STAR) {
    var value = this.data.name.get()
    args.push(ezP.Do.createSPAN(value || this.getPhantomValue(block) || ezP.Msg.Placeholder.IDENTIFIER, value? 'ezp-code': 'ezp-code-placeholder'))
    switch(variant) {
      case model.NAME_ANNOTATION:
      case model.STAR_NAME_ANNOTATION:
      case model.NAME_ANNOTATION_DEFINITION:
        args.push(ezP.Do.createSPAN(':', 'ezp-code-reserved'), ezP.Do.createSPAN(' …', 'ezp-code-placeholder'))
      break
    }
    switch(variant) {
      case model.NAME_ANNOTATION_DEFINITION:
      case model.NAME_DEFINITION:
        args.push(ezP.Do.createSPAN(' = ', 'ezp-code-reserved'), ezP.Do.createSPAN('…', 'ezp-code-placeholder'))
      break
      case model.NAME_ALIAS:
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
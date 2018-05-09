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

goog.provide('edY.DelegateSvg.Term')

goog.require('edY.MenuItem')
goog.require('edY.FieldInput')
goog.require('edY.Style')

/**
 * Class for a DelegateSvg, term block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.makeSubclass(edY.T3.Expr.term, function() {
  var D = {
    data: {
      modifier: {
        all: ['', '*', '**'],
        noUndo: true,
        synchronize: function(newValue) {
          this.setFieldValue(newValue)
          this.setFieldVisible(newValue.length>0)
        },
      },
      name: {
        default: '',
        validate: function (newValue) {
          var nameType = edY.Do.typeOfString(newValue)
          if (nameType) {
            var expected = this.data.variant.model.byNameType[nameType]
            if (expected && (expected.indexOf(this.data.variant.get()) >= 0)) {
              return {validated: newValue}
            }
          }
          return null
        },
        didChange: function(oldValue, newValue) {
          var nameType = newValue? edY.Do.typeOfString(newValue): edY.T3.Expr.identifier
          this.data.nameType.set(nameType)
        },
        synchronize: true,
      },
      alias: {
        default: '',
        synchronize: true,
        validate: function (newValue) {
          var nameType = edY.Do.typeOfString(newValue)
          return (nameType === edY.T3.Expr.identifier) && {validated: newValue} || null
        },
      }, // new
      nameType: {
        all: [edY.T3.Expr.identifier,
        edY.T3.Expr.dotted_name,
        edY.T3.Expr.parent_module],
        noUndo: true,
        xml: false,
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
          // We won't change the variant if the nameType won't fit.
          var nameType = this.data.nameType.get()
          if (nameType) {
            var expected = model.byNameType[nameType]
            if (expected) {
              return {validated: expected.indexOf(newValue) < 0? expected[0]: newValue}
            }
            return {validated: values[0]}   
          }
          return {validated: newValue}
        },
      },
      phantom: {
        default: '',
        didChange: function (oldValue, newValue) {
          var field = this.ui.tiles.name.fields.edit
          field.placeholderText_ = newValue
          field.render_()
        },
        xml: false,
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
        fields: {
          edit: {
            placeholder: edY.Msg.Placeholder.TERM,
            validate: true,
            endEditing: true,
          },
        },
      },
      annotation: {
        order: 2,
        fields: {
          label: {
            value: ':',
            css: 'reserved',
          },
        },
        check: edY.T3.Expr.Check.expression,
        hole_value: 'expression',
      },
      definition: {
        order: 3,
        fields: {
          label: {
            value: '=',
            css: 'reserved',
          },
        },
        check: edY.T3.Expr.Check.expression,
        hole_value: 'expression',
      },
      alias: {
        order: 4,
        fields: {
          label: 'as',
          edit: {
            placeholder: edY.Msg.Placeholder.ALIAS,
            validate: true,
            endEditing: true,
          },
        },
      },
    },
    output: {
      didConnect: function(oldTargetConnection, oldConnection) {
        // `this` is a connection
        var targetC8n = this.targetConnection
        var source = targetC8n.sourceBlock_
        if (source.edy instanceof edY.DelegateSvg.List) {
          // do nothing ?
        } else {
          for (var i = 0, input;(input = source.inputList[i++]);) {
            if (input.connection === targetC8n) {
              if (input.edy.model) {
                this.sourceBlock_.edy.data.phantom.set(input.edy.model.hole_value)
              }
              return
            }
          }
        }
      },
      didDisconnect: function(oldConnection) {
        // `this` is a connection's delegate
        var block = this.sourceBlock_
        block.edy.data.phantom.set('')
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
  var DDD = DD.byNameType = Object.create(null)
  DDD[edY.T3.Expr.identifier] = DD.all
  DDD[edY.T3.Expr.dotted_name] = [DD.NAME, DD.NAME_ALIAS, DD.STAR_NAME, DD.STAR]
  DDD[edY.T3.Expr.parent_module] = [DD.NAME,]
  DD.didChange = function(oldValue, newValue) {
    var model = this.model
    this.data.name.required = newValue === model.STAR_NAME
    this.data.alias.required = newValue === model.NAME_ALIAS
    this.ui.tiles.annotation.required = newValue === model.NAME_ANNOTATION || newValue === model.STAR_NAME_ANNOTATION || newValue === model.NAME_ANNOTATION_DEFINITION
    this.ui.tiles.definition.required = newValue === model.NAME_DEFINITION || newValue === model.NAME_ANNOTATION_DEFINITION
    var newModifier = newValue === model.STAR || newValue === model.STAR_NAME || newValue === model.STAR_NAME_ANNOTATION? '*': (newValue === model.STAR_STAR_NAME? '**': '')
    this.data.modifier.set(newModifier)
    this.data.name.setIncog(newValue === model.STAR)
    this.data.alias.setIncog(newValue !== model.NAME_ALIAS)
  }
  DD.synchronize = function(newValue) {    
    var model = this.model
    this.ui.tiles.annotation.setIncog(newValue !== model.NAME_ANNOTATION &&
    newValue !== model.STAR_NAME_ANNOTATION &&
    newValue !== model.NAME_ANNOTATION_DEFINITION)
    this.ui.tiles.definition.setIncog(newValue !== model.NAME_DEFINITION &&
    newValue !== model.NAME_ANNOTATION_DEFINITION)
  }
  DD.consolidate = function() {    
    var newVariant = this.get()
    var model = this.model
    var modifier = this.data.modifier.get()
    var withAnnotation = this.ui.tiles.annotation.isRequiredFromDom()
    var withDefinition = this.ui.tiles.definition.isRequiredFromDom()

    if (this.data.alias.isActive() || this.data.alias.isRequiredFromDom()) {
      newVariant = model.NAME_ALIAS
    } else if (modifier === '**') {
      newVariant = model.STAR_STAR_NAME
    } else if (modifier === '*') {
      if (withAnnotation) {
        newVariant = model.STAR_NAME_ANNOTATION
      } else if (!this.data.name.isActive() && !this.data.name.isRequiredFromDom()) {
        newVariant = model.STAR
      } else if (newVariant !== model.STAR_NAME && newVariant !== model.STAR_NAME_ANNOTATION) {
        newVariant = model.STAR_NAME
      }
    } else if (withDefinition) {
      // newVariant must be one of the variants with `DEFINITION`
      if (withAnnotation) {
        // newVariant must also be one of the variants with `ANNOTATION`
        newVariant = model.NAME_ANNOTATION_DEFINITION
      } else if (newVariant !== model.NAME_DEFINITION && newVariant !== model.NAME_ANNOTATION_DEFINITION) {
        newVariant = model.NAME_DEFINITION
      }
    } else if (withAnnotation) {
      // newVariant must be one of the variants with `ANNOTATION`
      if (newVariant !== model.NAME_ANNOTATION && newVariant !== model.STAR_NAME_ANNOTATION && newVariant !== model.NAME_ANNOTATION_DEFINITION) {
        newVariant = model.NAME_ANNOTATION
      }
    } else {
      // no STAR allowed
      if (newVariant === model.STAR || newVariant === model.STAR_NAME || newVariant === model.STAR_NAME_ANNOTATION || newVariant === model.STAR_START_NAME) {
        newVariant = model.NAME
      }
    }
    var expected = model.byNameType[this.data.nameType.get()]
    if (expected && expected.indexOf(newVariant) < 0) { // maybe newVariant is undefined
      if (withDefinition) {
        newVariant = withAnnotation? model.NAME_ANNOTATION_DEFINITION: model.NAME_DEFINITION
      }
      if (expected.indexOf(newVariant) < 0) {
        newVariant = withAnnotation? model.NAME_ANNOTATION: model.NAME
      }
    }
    this.data.name.clearRequiredFromDom()
    this.data.alias.clearRequiredFromDom()
    this.data.variant.set(newVariant, true)
  }
  return D
})

/**
 * Some block should not be wrapped.
 * Default implementation returns false
 * @param {!Block} block.
 * @return whether the block should be wrapped
 */
edY.DelegateSvg.Expr.term.prototype.noBlockWrapped = function (block) {
  return true
}

/**
 * Show the editor for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
edY.DelegateSvg.Expr.term.prototype.showEditor = function (block) {
  this.ui.tiles.name.fields.edit.showEditor_()
}

/**
 * The type and connection depend on the properties modifier, value and variant.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.term.prototype.consolidateType = function (block) {
  edY.DelegateSvg.Expr.term.superClass_.consolidateType.call(this, block)
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
  * parameter_s3d ::= identifier ":" expression
  * defparameter_s3d ::= parameter "=" expression
  * keyword_item ::= identifier "=" expression
  * module_as_s3d ::= module "as" identifier
  * import_identifier_as_s3d ::= identifier "as" identifier
  * (with parameter ::= identifier | parameter_s3d)
  * (with module ::= dotted_name)
  */
  var variantData = this.data.variant
  var model = variantData.model
  var variant = variantData.get()
  var nameType = this.data.nameType.get()
  var j = this.data.nameType.getAll().indexOf(nameType)
  var check
  if (nameType === edY.T3.Expr.parent_module) {
    check = nameType
  } else {
    switch(variant) {
      case model.NAME:
        check = nameType === edY.T3.Expr.identifier?
        nameType: [edY.T3.Expr.dotted_name, edY.T3.Expr.attributeref, ]
      break
      case model.STAR_STAR_NAME:
        // expression_star_star ::= "**" expression
        // parameter_star_star ::= "**" parameter
        check = nameType === edY.T3.Expr.identifier?[edY.T3.Expr.expression_star_star,
          edY.T3.Expr.parameter_star_star]:
        [edY.T3.Expr.expression_star_star]
      break
      case model.STAR_NAME:
        // expression_star ::= "*" expression
        // parameter_star ::= "*" [parameter]
        // target_star ::= "*" target
        // star_expr ::= "*" or_expr
        check = nameType === edY.T3.Expr.identifier?
        [edY.T3.Expr.expression_star,
          edY.T3.Expr.parameter_star,
          edY.T3.Expr.target_star,
          edY.T3.Expr.star_expr,]:
        [edY.T3.Expr.expression_star,
          edY.T3.Expr.target_star,
          edY.T3.Expr.star_expr,]
      break
      case model.NAME_ANNOTATION:
        // parameter_s3d ::= identifier ":" expression
        check = [edY.T3.Expr.parameter_s3d]
      break
      case model.STAR_NAME_ANNOTATION:
       check = [edY.T3.Expr.parameter_star]
      break
      case model.NAME_ANNOTATION_DEFINITION:
        // defparameter_s3d ::= parameter "=" expression
        check = [edY.T3.Expr.defparameter_s3d,]
      break
      case model.NAME_DEFINITION:
        // defparameter_s3d ::= parameter "=" expression
        // keyword_item ::= identifier "=" expression
        check = [edY.T3.Expr.defparameter_s3d,
          edY.T3.Expr.keyword_item,]
      break
      case model.NAME_ALIAS:
        // module_as_s3d ::= module "as" identifier
        // import_identifier_as_s3d ::= identifier "as" identifier
        check = nameType === edY.T3.Expr.identifier? [edY.T3.Expr.module_as_s3d, edY.T3.Expr.import_identifier_as_s3d]: [edY.T3.Expr.module_as_s3d]
      break
      case model.STAR:
        check = [edY.T3.Expr.parameter_star]
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
edY.DelegateSvg.Expr.term.prototype.makeTitle = function (block, variant) {
  var model = this.data.variant.model
  if (!goog.isDef(variant)) {
    variant = variantData.get()
  }
  var args = [goog.dom.TagName.SPAN, null]
  switch(variant) {
    case model.STAR_NAME:
    case model.STAR_NAME_ANNOTATION:
    case model.STAR:
    args.push(edY.Do.createSPAN('*', 'edy-code-reserved'))
    break
    case model.STAR_STAR_NAME:
    args.push(edY.Do.createSPAN('**', 'edy-code-reserved'))
    break
  }
  if (variant !== model.STAR) {
    var value = this.data.name.get()
    args.push(edY.Do.createSPAN(value || this.data.phantom.get() || edY.Msg.Placeholder.IDENTIFIER, value? 'edy-code': 'edy-code-placeholder'))
    switch(variant) {
      case model.NAME_ANNOTATION:
      case model.STAR_NAME_ANNOTATION:
      case model.NAME_ANNOTATION_DEFINITION:
        args.push(edY.Do.createSPAN(':', 'edy-code-reserved'), edY.Do.createSPAN(' …', 'edy-code-placeholder'))
      break
    }
    switch(variant) {
      case model.NAME_ANNOTATION_DEFINITION:
      case model.NAME_DEFINITION:
        args.push(edY.Do.createSPAN(' = ', 'edy-code-reserved'), edY.Do.createSPAN('…', 'edy-code-placeholder'))
      break
      case model.NAME_ALIAS:
        args.push(edY.Do.createSPAN(' as ', 'edy-code-reserved'), edY.Do.createSPAN('…', 'edy-code-placeholder'))
      break
    }
  }
  return goog.dom.createDom.apply(null, args)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Expr.term.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = this.data.variant.get()
  var F = function(variant) {
    if (variant !== current) {
      var title = block.edy.makeTitle(block, variant)
      var menuItem = new edY.MenuItem(title, function() {
        Blockly.Events.setGroup(true)
        try {
          block.edy.data.variant.set(variant)
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
  var menuItem = new edY.MenuItem(edY.Msg.RENAME, function() {
      block.edy.showEditor()
    })
  mgr.addChild(menuItem, true)
  mgr.shouldSeparate()
  edY.DelegateSvg.Expr.term.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

edY.DelegateSvg.Term.T3s = [
  edY.T3.Expr.term,
]
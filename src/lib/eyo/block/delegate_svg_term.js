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

goog.provide('eYo.DelegateSvg.Term')

goog.require('eYo.DelegateSvg.Expr')
goog.require('eYo.Msg')
goog.require('eYo.MenuItem')
goog.require('eYo.FieldInput')
goog.require('eYo.Style')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, term block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass(eYo.T3.Expr.term, function () {
  var D = {
    data: {
      modifier: {
        all: ['', '*', '**'],
        noUndo: true,
        didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
          this.setIncog(!newValue || !newValue.length)
        },
        synchronize: true
      },
      name: {
        init: '',
        validate: /** @suppress {globalThis} */ function (newValue) {
          var nameType = eYo.Do.typeOfString(newValue)
          if (nameType) {
            var expected = this.data.variant.model.byNameType[nameType]
            if (expected && (expected.indexOf(this.data.variant.get()) >= 0)) {
              return {validated: newValue}
            }
          }
          return null
        },
        didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
          var nameType = newValue ? eYo.Do.typeOfString(newValue) : eYo.T3.Expr.identifier
          this.data.nameType.set(nameType)
        },
        synchronize: true
      },
      alias: {
        init: '',
        synchronize: true,
        validate: /** @suppress {globalThis} */ function (newValue) {
          var nameType = eYo.Do.typeOfString(newValue)
          return (nameType === (eYo.T3.Expr.identifier) && {validated: newValue}) || null
        }
      }, // new
      nameType: {
        all: [eYo.T3.Expr.identifier,
          eYo.T3.Expr.dotted_name,
          eYo.T3.Expr.parent_module],
        noUndo: true,
        xml: false
      },
      variant: {
        validate: /** @suppress {globalThis} */ function (newValue) {
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
              return {validated: expected.indexOf(newValue) < 0 ? expected[0] : newValue}
            }
            return {validated: values[0]}
          }
          return {validated: newValue}
        }
      },
      phantom: {
        init: '',
        didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
          var field = this.ui.tiles.name.fields.edit
          field.placeholderText_ = newValue
          field.render_()
        },
        xml: false
      }
    },
    fields: {
      modifier: {
        value: '',
        css: 'reserved'
      }
    },
    tiles: {
      name: {
        order: 1,
        fields: {
          edit: {
            placeholder: eYo.Msg.Placeholder.TERM,
            validate: true,
            endEditing: true
          }
        }
      },
      annotation: {
        order: 2,
        fields: {
          label: {
            value: ':',
            css: 'reserved'
          }
        },
        check: eYo.T3.Expr.Check.expression,
        hole_value: 'expression'
      },
      definition: {
        order: 3,
        fields: {
          label: {
            value: '=',
            css: 'reserved'
          }
        },
        check: eYo.T3.Expr.Check.expression,
        hole_value: 'expression'
      },
      alias: {
        order: 4,
        fields: {
          label: 'as',
          edit: {
            placeholder: eYo.Msg.Placeholder.ALIAS,
            validate: true,
            endEditing: true
          }
        }
      }
    },
    output: {
      didConnect: /** @suppress {globalThis} */ function (oldTargetConnection, oldConnection) {
        // `this` is a connection
        var targetC8n = this.targetConnection
        var source = targetC8n.sourceBlock_
        if (source.eyo instanceof eYo.DelegateSvg.List) {
          // do nothing ?
        } else {
          var sourceData = this.sourceBlock_.eyo.data.phantom || this.sourceBlock_.eyo.data.value
          if (sourceData) {
            source.eyo.foreachTile(function() {
              var input = this.input
              if (input && input.connection === targetC8n) {
                var data = input.connection.eyo.hole_data
                if (data && data.value) {
                  sourceData.set(data.value)
                  return true// break here
                }
              }
            })
          }
        }
      },
      didDisconnect: /** @suppress {globalThis} */ function (oldConnection) {
        // `this` is a connection's delegate
        var block = this.sourceBlock_
        block.eyo.data.phantom.set('')
      }
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
  DDD[eYo.T3.Expr.identifier] = DD.all
  DDD[eYo.T3.Expr.dotted_name] = [DD.NAME, DD.NAME_ALIAS, DD.STAR_NAME, DD.STAR]
  DDD[eYo.T3.Expr.parent_module] = [DD.NAME]
  DD.didChange = function (oldValue, newValue) {
    var model = this.model
    this.data.name.required = newValue === model.STAR_NAME
    this.data.alias.required = newValue === model.NAME_ALIAS
    this.ui.tiles.annotation.required = newValue === model.NAME_ANNOTATION || newValue === model.STAR_NAME_ANNOTATION || newValue === model.NAME_ANNOTATION_DEFINITION
    this.ui.tiles.definition.required = newValue === model.NAME_DEFINITION || newValue === model.NAME_ANNOTATION_DEFINITION
    var newModifier = newValue === model.STAR || newValue === model.STAR_NAME || newValue === model.STAR_NAME_ANNOTATION ? '*' : (newValue === model.STAR_STAR_NAME ? '**' : '')
    this.data.modifier.set(newModifier)
    this.data.name.setIncog(newValue === model.STAR)
    this.data.alias.setIncog(newValue !== model.NAME_ALIAS)
  }
  DD.synchronize = function (newValue) {
    var model = this.model
    this.ui.tiles.annotation.setIncog(newValue !== model.NAME_ANNOTATION &&
    newValue !== model.STAR_NAME_ANNOTATION &&
    newValue !== model.NAME_ANNOTATION_DEFINITION)
    this.ui.tiles.definition.setIncog(newValue !== model.NAME_DEFINITION &&
    newValue !== model.NAME_ANNOTATION_DEFINITION)
  }
  DD.consolidate = function () {
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
        newVariant = withAnnotation ? model.NAME_ANNOTATION_DEFINITION : model.NAME_DEFINITION
      }
      if (expected.indexOf(newVariant) < 0) {
        newVariant = withAnnotation ? model.NAME_ANNOTATION : model.NAME
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
 * @param {!Block} block
 * @return whether the block should be wrapped
 */
eYo.DelegateSvg.Expr.term.prototype.noBlockWrapped = function (block) {
  return true
}

/**
 * Show the editor for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
eYo.DelegateSvg.Expr.term.prototype.showEditor = function (block) {
  this.ui.tiles.name.fields.edit.showEditor_()
}

/**
 * The type and connection depend on the properties modifier, value and variant.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.Expr.term.prototype.consolidateType = function (block) {
  eYo.DelegateSvg.Expr.term.superClass_.consolidateType.call(this, block)
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
  * identifier_annotated ::= identifier ":" expression
  * key_datum ::= expression ":" expression
  * parameter_defined ::= parameter "=" expression
  * (with parameter ::= identifier | identifier_annotated)
  * keyword_item_s3d ::= identifier "=" expression
  * dotted_name_as ::= module "as" identifier
  * identifier_as ::= identifier "as" identifier
  */
  var variantData = this.data.variant
  var model = variantData.model
  var variant = variantData.get()
  var nameType = this.data.nameType.get()
  var check
  if (nameType === eYo.T3.Expr.parent_module) {
    check = nameType
  } else {
    switch (variant) {
    case model.NAME:
      check = nameType === eYo.T3.Expr.identifier
        ? nameType : [eYo.T3.Expr.dotted_name, eYo.T3.Expr.attributeref]
      break
    case model.STAR_STAR_NAME:
      // expression_star_star ::= "**" expression
      // parameter_star_star ::= "**" parameter
      // or_expr_star_star ::=  "**" or_expr
      check = nameType === eYo.T3.Expr.identifier ? [eYo.T3.Expr.expression_star_star,
        eYo.T3.Expr.parameter_star_star,
        eYo.T3.Expr.or_expr_star_star]
        : [eYo.T3.Expr.expression_star_star,
          eYo.T3.Expr.or_expr_star_star]
      break
    case model.STAR_NAME:
      // expression_star ::= "*" expression
      // parameter_star ::= "*" [parameter]
      // target_star ::= "*" target
      // star_expr ::= "*" or_expr
      check = nameType === eYo.T3.Expr.identifier
        ? [eYo.T3.Expr.expression_star,
          eYo.T3.Expr.parameter_star,
          eYo.T3.Expr.target_star,
          eYo.T3.Expr.star_expr]
        : [eYo.T3.Expr.expression_star,
          eYo.T3.Expr.target_star,
          eYo.T3.Expr.star_expr]
      break
    case model.NAME_ANNOTATION:
      // identifier_annotated ::= identifier ":" expression
      check = [eYo.T3.Expr.identifier_annotated, eYo.T3.Expr.key_datum_s3d]
      break
    case model.STAR_NAME_ANNOTATION:
      check = [eYo.T3.Expr.parameter_star]
      break
    case model.NAME_ANNOTATION_DEFINITION:
      // parameter_defined ::= parameter "=" expression
      check = [eYo.T3.Expr.parameter_defined]
      break
    case model.NAME_DEFINITION:
      // parameter_defined ::= parameter "=" expression
      // keyword_item ::= identifier "=" expression
      check = [eYo.T3.Expr.parameter_defined,
        eYo.T3.Expr.keyword_item]
      break
    case model.NAME_ALIAS:
      // dotted_name_as ::= module "as" identifier
      // identifier_as ::= identifier "as" identifier
      check = nameType === eYo.T3.Expr.identifier ? [eYo.T3.Expr.dotted_name_as, eYo.T3.Expr.identifier_as] : [eYo.T3.Expr.dotted_name_as]
      break
    case model.STAR:
      check = [eYo.T3.Expr.parameter_star]
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
eYo.DelegateSvg.Expr.term.prototype.makeTitle = function (block, variant) {
  var model = this.data.variant.model
  if (!goog.isDef(variant)) {
    variant = this.data.variant.get()
  }
  var args = [goog.dom.TagName.SPAN, null]
  switch (variant) {
  case model.STAR_NAME:
  case model.STAR_NAME_ANNOTATION:
  case model.STAR:
    args.push(eYo.Do.createSPAN('*', 'eyo-code-reserved'))
    break
  case model.STAR_STAR_NAME:
    args.push(eYo.Do.createSPAN('**', 'eyo-code-reserved'))
    break
  }
  if (variant !== model.STAR) {
    var value = this.data.name.get()
    args.push(eYo.Do.createSPAN(value || this.data.phantom.get() || eYo.Msg.Placeholder.IDENTIFIER, value ? 'eyo-code' : 'eyo-code-placeholder'))
    switch (variant) {
    case model.NAME_ANNOTATION:
    case model.STAR_NAME_ANNOTATION:
    case model.NAME_ANNOTATION_DEFINITION:
      args.push(eYo.Do.createSPAN(':', 'eyo-code-reserved'), eYo.Do.createSPAN(' …', 'eyo-code-placeholder'))
      break
    }
    switch (variant) {
    case model.NAME_ANNOTATION_DEFINITION:
    case model.NAME_DEFINITION:
      args.push(eYo.Do.createSPAN(' = ', 'eyo-code-reserved'), eYo.Do.createSPAN('…', 'eyo-code-placeholder'))
      break
    case model.NAME_ALIAS:
      args.push(eYo.Do.createSPAN(' as ', 'eyo-code-reserved'), eYo.Do.createSPAN('…', 'eyo-code-placeholder'))
      break
    }
  }
  return goog.dom.createDom.apply(null, args)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.term.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = this.data.variant.get()
  var F = function (variant) {
    if (variant !== current) {
      var title = block.eyo.makeTitle(block, variant)
      var menuItem = new eYo.MenuItem(title, function () {
        eYo.Events.setGroup(true)
        try {
          block.eyo.data.variant.set(variant)
        } finally {
          eYo.Events.setGroup(false)
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
  var menuItem = new eYo.MenuItem(eYo.Msg.RENAME, function () {
    block.eyo.showEditor()
  })
  mgr.addChild(menuItem, true)
  mgr.shouldSeparate()
  eYo.DelegateSvg.Expr.term.superClass_.populateContextMenuFirst_.call(this, block, mgr)
  return true
}

eYo.DelegateSvg.Term.T3s = [
  eYo.T3.Expr.term
]

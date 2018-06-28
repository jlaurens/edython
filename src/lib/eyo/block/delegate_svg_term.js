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
        main: true,
        init: '',
        validate: /** @suppress {globalThis} */ function (newValue) {
          var nameType = eYo.Do.typeOfString(newValue).expr
          if (nameType) {
            var expected = this.data.variant.model.byNameType[nameType]
            if (expected && (expected.indexOf(this.data.variant.get()) >= 0)) {
              return {validated: newValue}
            }
          }
          return null
        },
        didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
          var nameType = newValue ? eYo.Do.typeOfString(newValue).expr : eYo.T3.Expr.identifier
          this.data.nameType.set(nameType)
        },
        synchronize: true
      },
      alias: {
        init: '',
        synchronize: true,
        validate: /** @suppress {globalThis} */ function (newValue) {
          var nameType = eYo.Do.typeOfString(newValue).expr
          return ((nameType === eYo.T3.Expr.identifier) && {validated: newValue}) || null
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
        NAME: eYo.Key.NAME,
        NAME_DEFINITION: eYo.Key.NAME_DEFINITION,
        NAME_ALIAS: eYo.Key.NAME_ALIAS,
        STAR: eYo.Key.STAR,
        STAR_NAME: eYo.Key.STAR_NAME,
        STAR_STAR_NAME: eYo.Key.STAR_STAR_NAME,
        NAME_ANNOTATION: eYo.Key.NAME_ANNOTATION,
        STAR_NAME_ANNOTATION: eYo.Key.STAR_NAME_ANNOTATION,
        NAME_ANNOTATION_DEFINITION: eYo.Key.NAME_ANNOTATION_DEFINITION,
        all: [
          eYo.Key.NAME,
          eYo.Key.NAME_DEFINITION,
          eYo.Key.NAME_ALIAS,
          eYo.Key.STAR,
          eYo.Key.STAR_NAME,
          eYo.Key.STAR_STAR_NAME,
          eYo.Key.NAME_ANNOTATION,
          eYo.Key.STAR_NAME_ANNOTATION,
          eYo.Key.NAME_ANNOTATION_DEFINITION
        ],
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
        },
        didChange: function (oldValue, newValue) {
          var M = this.model
          this.data.name.required = newValue === M.STAR_NAME
          this.data.alias.required = newValue === M.NAME_ALIAS
          this.owner_.slots.annotation.required = newValue === M.NAME_ANNOTATION || newValue === M.STAR_NAME_ANNOTATION || newValue === M.NAME_ANNOTATION_DEFINITION
          this.owner_.slots.definition.required = newValue === M.NAME_DEFINITION || newValue === M.NAME_ANNOTATION_DEFINITION
          var newModifier = newValue === M.STAR || newValue === M.STAR_NAME || newValue === M.STAR_NAME_ANNOTATION ? '*' : (newValue === M.STAR_STAR_NAME ? '**' : '')
          this.data.modifier.set(newModifier)
          this.data.name.setIncog(newValue === M.STAR)
          this.data.alias.setIncog(newValue !== M.NAME_ALIAS)
        },
        synchronize: function (newValue) {
          var M = this.model
          this.owner_.slots.annotation.setIncog(newValue !== M.NAME_ANNOTATION &&
          newValue !== M.STAR_NAME_ANNOTATION &&
          newValue !== M.NAME_ANNOTATION_DEFINITION)
          this.owner_.slots.definition.setIncog(newValue !== M.NAME_DEFINITION &&
          newValue !== M.NAME_ANNOTATION_DEFINITION)
        },
        consolidate: function () {
          var newVariant = this.get()
          var M = this.model
          var modifier = this.data.modifier.get()
          var withAnnotation = this.owner_.slots.annotation.isRequiredFromDom()
          var withDefinition = this.owner_.slots.definition.isRequiredFromDom()
          if (this.data.alias.isActive() || this.data.alias.isRequiredFromDom()) {
            newVariant = M.NAME_ALIAS
          } else if (modifier === '**') {
            newVariant = M.STAR_STAR_NAME
          } else if (modifier === '*') {
            if (withAnnotation) {
              newVariant = M.STAR_NAME_ANNOTATION
            } else if (!this.data.name.isActive() && !this.data.name.isRequiredFromDom()) {
              newVariant = M.STAR
            } else if (newVariant !== M.STAR_NAME && newVariant !== M.STAR_NAME_ANNOTATION) {
              newVariant = M.STAR_NAME
            }
          } else if (withDefinition) {
            // newVariant must be one of the variants with `DEFINITION`
            if (withAnnotation) {
              // newVariant must also be one of the variants with `ANNOTATION`
              newVariant = M.NAME_ANNOTATION_DEFINITION
            } else if (newVariant !== M.NAME_DEFINITION && newVariant !== M.NAME_ANNOTATION_DEFINITION) {
              newVariant = M.NAME_DEFINITION
            }
          } else if (withAnnotation) {
            // newVariant must be one of the variants with `ANNOTATION`
            if (newVariant !== M.NAME_ANNOTATION && newVariant !== M.STAR_NAME_ANNOTATION && newVariant !== M.NAME_ANNOTATION_DEFINITION) {
              newVariant = M.NAME_ANNOTATION
            }
          } else {
            // no STAR allowed
            if (newVariant === M.STAR || newVariant === M.STAR_NAME || newVariant === M.STAR_NAME_ANNOTATION || newVariant === M.STAR_START_NAME) {
              newVariant = M.NAME
            }
          }
          var expected = M.byNameType[this.data.nameType.get()]
          if (expected && expected.indexOf(newVariant) < 0) { // maybe newVariant is undefined
            if (withDefinition) {
              newVariant = withAnnotation ? M.NAME_ANNOTATION_DEFINITION : M.NAME_DEFINITION
            }
            if (expected.indexOf(newVariant) < 0) {
              newVariant = withAnnotation ? M.NAME_ANNOTATION : M.NAME
            }
          }
          this.data.name.clearRequiredFromDom()
          this.data.alias.clearRequiredFromDom()
          this.data.variant.set(newVariant, true)
        }
      },
      phantom: {
        init: '',
        didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
          var field = this.owner_.slots.name.fields.edit
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
    slots: {
      name: {
        order: 1,
        fields: {
          edit: {
            placeholder: eYo.Msg.Placeholder.TERM,
            validate: true,
            endEditing: true,
            variable: true
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
            endEditing: true,
            variable: true
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
            source.eyo.someSlot(function() {
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
  var DD = D.data.variant
  var DDD = DD.byNameType = Object.create(null)
  DDD[eYo.T3.Expr.identifier] = DD.all
  DDD[eYo.T3.Expr.dotted_name] = [DD.NAME, DD.NAME_ALIAS, DD.STAR_NAME, DD.STAR]
  DDD[eYo.T3.Expr.parent_module] = [DD.NAME]
  return D
})

eYo.DelegateSvg.Expr.identifier = eYo.DelegateSvg.Expr.dotted_name = eYo.DelegateSvg.Expr.parent_module = eYo.DelegateSvg.Expr.term
eYo.DelegateSvg.Manager.register('identifier')
eYo.DelegateSvg.Manager.register('dotted_name')
eYo.DelegateSvg.Manager.register('parent_module')

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
  this.slots.name.fields.edit.showEditor_()
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
  * keyword_item ::= identifier "=" expression
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
      check = [eYo.T3.Expr.identifier_annotated, eYo.T3.Expr.key_datum]
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
        } catch (err) {
          console.error(err)
          throw err
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

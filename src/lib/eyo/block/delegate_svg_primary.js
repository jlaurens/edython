/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython, primary blocks.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Primary')

goog.require('eYo.Signature')
goog.require('eYo.Model.stdtypes')
goog.require('eYo.Model.functions')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Primary')
goog.require('eYo.DelegateSvg.Stmt')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, primary.
 * The primary block is a foundamental piece of code.
 * It aims to answer the mutation problem on primary
 * and similar python types.
 * The question is to avoid big modifications concerning
 * the implementation when small modifications of the interface
 * are expected. This block implementation covers all the following types:
 *
 * identifier ::=
 * attributeref ::= primary "." identifier
 * dotted_name ::= identifier ("." identifier)*
 * parent_module ::= '.'+ [module]
 * identifier_annotated ::= identifier ":" expression
 * key_datum ::= expression ":" expression
 * identifier_defined ::= parameter "=" expression
 * identifier_anotated_defined ::= parameter "=" expression
 * keyword_item ::= identifier "=" expression
 * identifier_as ::= identifier "as" identifier
 * dotted_name_as ::= module "as" identifier
 * expression_as ::= expression "as" identifier
 * call_expr ::= primary "(" argument_list_comprehensive ")"
 * subscription ::= primary "[" expression_list "]"
 * slicing ::= primary "[" slice_list "]"
 * 
 * We can notice that some 
 * The block inner content is divided into different parts
 * 1) the module or parent, as holder
 * For `foo.bar` construct
 * 2) the name
 * Either a field or an expression.
 * If this is an expression, there must be some other non void part,
 * otherwise we would have an expression block which only purpose is
 * just to contain an expression block, no more no less. This would
 * not be efficient.
 * 3) the annotation
 * This is used for parameter annotation, appears in both
 * identifier_annotated ::= identifier ":" expression
 * key_datum ::= expression ":" expression
 * This may be used in annotated assignments.
 * 4) the definition
 * identifier_defined ::= parameter "=" expression
 * (with parameter ::= identifier | identifier_annotated)
 * keyword_item ::= identifier "=" expression
 * 5) the map
 * One of 3 variants:
 * a) alias
 * dotted_name_as ::= module "as" identifier
 * identifier_as ::= identifier "as" identifier
 * b) call
 * call_expr ::= primary "(" argument_list_comprehensive ")"
 * c) subscript
 * subscription ::= primary "[" expression_list "]"
 * slicing ::= primary "[" slice_list "]"
 * 
 * The python type of the block is not uniquely defined.
 * For example, `foo as bar` may be both a `dotted_name_as` and
 * a `identifier_as`. On the opposit, once we know that there is an alias,
 * the type is one of these, no more. For these,
 * the persistent storage may not store information.
 * All the possibilities in next table
 * identifier ::= identifier
 * attributeref ::= primary "." identifier
 * dotted_name ::= identifier ("." identifier)*
 * parent_module ::= '.'+ [module]
 * identifier_annotated ::= identifier ":" expression
 * key_datum ::= expression ":" expression
 * identifier_defined ::= parameter "=" expression
 * identifier_anotated_defined ::= parameter "=" expression
 * keyword_item ::= identifier "=" expression
 * identifier_as ::= identifier "as" identifier
 * dotted_name_as ::= module "as" identifier
 * expression_as ::= expression "as" identifier
 * call_expr ::= primary "(" argument_list_comprehensive ")"
 * subscription ::= primary "[" expression_list "]"
 * slicing ::= primary "[" slice_list "]"
 |  |id|  |  |  | identifier ::=
 |p.|id|  |  |  | attributeref ::= primary "." identifier
 |d.|dd|  |  |  | dotted_name ::= identifier ("." identifier)*
 |  |pm|  |  |  | parent_module ::= '.'+ [module]
 |  |id|:x|  |  | identifier_annotated ::= identifier ":" expression
 |  | x|:x|  |  | key_datum ::= expression ":" expression
 |  |id|  |=x|  | identifier_defined ::= identifier "=" expression
 |  |id|:x|=x|  | identifier_annotated_defined ::= ...
 |  |id|  |=x|  | keyword_item ::= identifier "=" expression
 |  |id|  |  |as| identifier_as ::= identifier "as" identifier
 |d.|dd|  |  |as| dotted_name_as ::= module "as" identifier
 |  | x|  |  |as| expression_as ::= expression "as" identifier
 |  | p|  |  |()| call_expr
 |p.|id|  |  |()| call_expr
 |  |  |  |  |[]| subscription
 |  |  |  |  |[]| slicing
 *
 * A note on the mutability of the primary block, at least when
 * the identifier is concerned.
 * During the editing process, an identifier may not be set.
 * Some identifiers do need to be set to a non void string whereas
 * others do not. For example, `foo.bar`, `.bar` and `.` are
 * valid constructs but `foo.` is not. Both are obtained with a
 * `identifier.identifier` block construct.
 * The question is to recognize whether each identifier is void or not.
 * Let `unset` denote an unset identifier.
 * `unset.unset` is of type parent_module, attributeref and dotted_name.
 * 
 * A note on type management.
 * The primary block is one of the most complex blocks in edython.
 * This design was chosen in order to ease block edition.
 * This was kind of necessary because data and methods were merged in the delegate.
 * If there were a data delegate and a method delegate,
 * we would be able to keep the data in place and just change the methods.
 * Drawing the blocks would be deferred to another delegate.
 * This is a design that must be chosen in some future development.
 * For the moment, to make the difference between the different flavours
 * primary blocks, we have the variant and the subtype.
 * Variants allow to chose between call, slicing, alias, other.
 * Call and slicing expressions are straightforward.
 * Alias expressions are used in 4 different contexts
 *  1) import foo.bar as blah
 *  2) from foo import bar as blah
 *  3) with blah blah blah as bar
 *  4) except blah blah blah as bar
 * That makes 3 kinds of alias expressions
 *  1) identifier as identifier, aka identifier_as
 *  2) identifier.identifier.identifier... as identifier, aka dotted_name_as
 *  3) blah blah blah as identifier, aka expression_as
 * That makes 3 different block types,
 * each being a particular case of the next one, if any.
 * In case 3), when blah blah blah is an identifier block,
 * the type should be identifier_as, not just expression_as.
 * foo.bar

 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('primary', {
  xml: {
    types: [
      eYo.T3.Expr.identifier,
      eYo.T3.Expr.identifier_annotated,
      eYo.T3.Expr.key_datum,
      eYo.T3.Expr.identifier_defined,
      eYo.T3.Expr.keyword_item,
      eYo.T3.Expr.identifier_annotated_defined,
      eYo.T3.Expr.attributeref,
      eYo.T3.Expr.named_attributeref,
      eYo.T3.Expr.dotted_name,
      eYo.T3.Expr.parent_module,
      eYo.T3.Expr.identifier_as,
      eYo.T3.Expr.dotted_name_as,
      eYo.T3.Expr.expression_as,
      eYo.T3.Expr.subscription,
      eYo.T3.Expr.named_subscription,
      eYo.T3.Expr.slicing,
      eYo.T3.Expr.named_slicing,
      eYo.T3.Expr.call_expr,
      eYo.T3.Expr.named_call_expr
    ]
  },
  data: {
    dotted: {
      order: 200,
      init: 0,
      validate: /** @suppress {globalThis} */ function (newValue) {
        return goog.isNumber(newValue)
        ? {
          validated: newValue
        }
        : {}
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.required = newValue > 0
        this.setIncog()
        var holder_d = this.data.holder
        holder_d.required = newValue === 1
        holder_d.setIncog()
        if (newValue !== 0) {
          // this is a dotted expression
          this.data.annotation.set(eYo.Key.NONE)
          this.data.definition.set(eYo.Key.NONE)
        }
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.data.name.synchronize()
        this.synchronize(newValue)
      },
      fromField: /** @suppress {globalThis} */ function (value) {
        this.fromField(value.length)
      },
      toField: /** @suppress {globalThis} */ function (value) {
        var txt = ''
        for (var i = 0; (i < this.get()); i++) {
          txt += '.'
        }
        return txt
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          if (this.get()) {
            this.save(element)
          }
        }
      }
    },
    holder: {
      order: 201,
      init: '', // will be saved only when not built in
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return !newValue
        || type.expr === eYo.T3.Expr.identifier
        || type.expr === eYo.T3.Expr.dotted_name
        || type.expr === eYo.T3.Expr.parent_module
        ? {validated: newValue} : null
        // return this.getAll().indexOf(newValue) < 0? null : {validated: newValue} // what about the future ?
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.holderType_ = eYo.Do.typeOfString(newValue)
        this.data.subtype.set(this.holderType_.raw)
      },
      synchronize: true,
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          var target = this.owner.slots.holder.input.connection.targetBlock()
          if (!target) {
            if (this.get()) {
              this.save(element)
            }
          }
        }
      }
    },
    alias: {
      order: 400,
      init: '',
      synchronize: true,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue).expr
        return type === eYo.T3.Expr.unset
        || type === eYo.T3.Expr.identifier
        || type === eYo.T3.Expr.builtin__name
        ? {validated: newValue}
        : null
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          var d = this.data.variant
          this.required = d.get() === d.ALIASED
          this.save(element)
        }
      }
    }, // new
    annotation: {
      NONE: eYo.Key.NONE,
      ANNOTATED: eYo.Key.ANNOTATED,
      order: 1000,
      all: [
        eYo.Key.NONE,
        eYo.Key.ANNOTATED
      ],
      default: eYo.Key.NONE,
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Expr.identifier_annotated
        || type === eYo.T3.Expr.identifier_annotated_defined) {
          this.set(eYo.Key.ANNOTATED)
        }
      },
      validate: true,
      didChange: function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        // override previous data if necessary
        if (newValue !== this.NONE) {
          // no holder nor dotted nor variant
          this.data.dotted.set(0)
          this.data.variant.set(this.NONE)
        }
      },
      synchronize: function (newValue) {
        var slot = this.owner.slots.annotation
        if (slot) {
          slot.required = newValue !== this.NONE
          slot.setIncog()
        }
      },
      xml: {
        save: function (el) {
          if (this.get() !== this.NONE) {
            this.save(el)
          }
        }
      }
    },
    definition: {
      order: 1001,
      NONE: eYo.Key.NONE,
      DEFINED: eYo.Key.DEFINED,
      all: [
        eYo.Key.NONE,
        eYo.Key.DEFINED
      ],
      default: eYo.Key.NONE,
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Expr.keyword_item
          || type === eYo.T3.Expr.identifier_defined
          || type === eYo.T3.Expr.identifier_annotated_defined) {
          this.set(eYo.Key.DEFINED)
        }
      },
      validate: true,
      didChange: function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        // override previous data if necessary
        if (newValue !== this.NONE) {
          // no holder nor dotted nor variant
          this.data.dotted.set(0)
          this.data.variant.set(this.NONE)
        }
      },
      synchronize: function (newValue) {
        var slot = this.owner.slots.definition
        if (slot) {
          slot.required = newValue !== this.NONE
          slot.setIncog()
        }
      },
      xml: {
        save: function (el) {
          if (this.get() !== this.NONE) {
            this.save(el)
          }
        }
      }
    },
    variant: {
      order: 2000,
      NONE: eYo.Key.NONE,
      CALL_EXPR: eYo.Key.CALL_EXPR,
      SLICING: eYo.Key.SLICING,
      ALIASED: eYo.Key.ALIASED,
      all: [
        eYo.Key.NONE,
        eYo.Key.CALL_EXPR,
        eYo.Key.SLICING,
        eYo.Key.ALIASED
      ],
      init: eYo.Key.NONE,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        var f = function (arguments_incog, slicing_incog, alias_incog) {
          this.owner.slots.arguments.setIncog(arguments_incog)
          this.owner.slots.slicing.setIncog(slicing_incog)
          this.owner.slots.alias.setIncog(alias_incog)
        }
        if(newValue === this.CALL_EXPR) {
          f.call(this, false, true, true)
        } else if(newValue === this.SLICING) {
          f.call(this, true, false, true)
        } else if(newValue === this.ALIASED) {
          f.call(this, true, true, false)
        } else {
          f.call(this, true, true, true)
        }
        this.synchronize(newValue)
      },
      isChanging: /** @suppress {globalThis} */ function (oldValue, newValue) {
        if ([this.CALL_EXPR, this.SLICING, this.ALIASED].indexOf(newValue) >= 0) {
          this.data.annotation.set(eYo.Key.NONE)
          this.data.definition.set(eYo.Key.NONE)
        }
        this.isChanging(oldValue, newValue)
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Expr.call_expr) {
          this.set(this.CALL_EXPR)
        } else if (type === eYo.T3.Expr.slicing) {
          this.set(this.SLICING)
        } else if (type === eYo.T3.Expr.dotted_name_as || type === eYo.T3.Expr.identifier_as || type === eYo.T3.Expr.expression_as) {
          this.set(this.ALIASED)
        } else {
          this.set(this.NONE)
        }
      },
      xml: false
    },
    ary: {
      order: 2001,
      init: Infinity,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var validated
        if (goog.isString(newValue)) {
          if (newValue.length) {
            validated = Math.max(0, Math.floor(Number(newValue)))
          } else {
            validated = Infinity
          }
        } else {
          validated = Math.max(0, Math.floor(newValue))
        }
        return {validated: validated}
      },
      willChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        // First change the ary of the arguments list, then change the ary of the delegate.
        // That way undo events are recorded in the correct order.
        var input = this.owner.slots.arguments.input
        if (input && input.connection) {
          var target = input.connection.targetBlock()
          if (target) {
            target.eyo.data.ary.set(newValue)
          }
        }
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          var variant_d = this.owner.data.variant
          var variant = variant_d.get()
          if (variant === variant_d.CALL_EXPR && this.get() !== Infinity) {
            this.save(element)
          }
        }
      }
    },
    mandatory: {
      order: 2002,
      noUndo: true,
      validate: /** @suppress {globalThis} */ function (newValue) {
        return goog.isNumber(newValue) && newValue > 0 ? {validated: Math.floor(newValue)} : null
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        var input = this.owner.slots.arguments.input
        if (input && input.connection) {
          var target = input.connection.targetBlock()
          if (target) {
            target.eyo.data.mandatory.set(newValue)
          }
        }
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          var variant_d = this.owner.data.variant
          var variant = variant_d.get()
          if (variant === variant_d.CALL_EXPR && this.get()) {
            this.save(element)
          }
        }
      }
    },
    name: {
      order: 10000, // the name must be last
      main: true,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type.raw === eYo.T3.Expr.builtin__name
        || type.expr === eYo.T3.Expr.identifier
        || type.expr === eYo.T3.Expr.parent_module
        || type.expr === eYo.T3.Expr.dotted_name
        ? {validated: newValue} : null
        // return this.getAll().indexOf(newValue) < 0? null : {validated: newValue} // what about the future ?
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.nameType_ = eYo.Do.typeOfString(newValue)
        this.data.subtype.set(this.nameType_.raw)
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      },
      synchronize: true,
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          var target = this.owner.slots.name.input.connection.targetBlock()
          if (!target) {
            this.save(element)
          }
        }
      }
    },
    subtype: {
      order: 10001,
      all: [
        eYo.T3.Expr.unset,
        eYo.T3.Expr.custom_identifier,
        eYo.T3.Expr.custom_dotted_name,
        eYo.T3.Expr.custom_parent_module
      ],
      noUndo: true,
      xml: false
    }
  },
  slots: {
    holder: {
      order: 50,
      fields: {
        bind: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.UNSET
        }
      },
      check: eYo.T3.Expr.Check.primary,
      hole_value: eYo.Msg.Placeholder.PRIMARY,
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          this.save(element)
        }
      }
    },
    dotted: {
      order: 75,
      fields: {
        separator: {
          value: '.',
          css_class: 'eyo-code-reserved'
        }
      }
    },
    name: {
      order: 100,
      check: /** @suppress {globalThis} */ function () {
        // a general expression or a more specific block
        var eyo = this.connection.sourceBlock_.eyo
        var variant_d = eyo.data.variant
        var variant = variant_d.get()
        if (variant === variant_d.ALIASED) {
          return eYo.T3.Expr.Check.expression
        }
        if (variant === variant_d.CALL_EXPR
          || variant === variant_d.SLICING) {
          return eYo.T3.Expr.Check.primary
        }
        var profile = eyo.getProfile()
        return profile.annotated
        ? eYo.T3.Expr.Check.expression
        : [
          eYo.T3.Expr.unset,
          eYo.T3.Expr.identifier,
          eYo.T3.Expr.dotted_name,
          eYo.T3.Expr.dotted_name,
          eYo.T3.Expr.named_attributeref,
          eYo.T3.Expr.attributeref,
          eYo.T3.Expr.named_call_expr,
          eYo.T3.Expr.call_expr,
          eYo.T3.Expr.named_slicing,
          eYo.T3.Expr.slicing
        ]
      },
      plugged: eYo.T3.Expr.primary,
      hole_value: 'expression',
      fields: {
        bind: {
          placeholder: /** @suppress {globalThis} */ function () {
            return eYo.Msg.Placeholder.TERM
          },
          validate: true,
          endEditing: true,
          variable: true
        }
      },
      xml: {
        tag: 'expression'
      }
    },
    annotation: {
      order: 102,
      fields: {
        label: {
          value: ':',
          css: 'reserved'
        }
      },
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'expression',
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromModel()) {
            var d = this.owner.data.variant
            d.set(d.NONE)
            d = this.owner.data.annotation
            d.set(d.ANNOTATED)            
          } else {
            d = this.owner.data.annotation
            d.set(d.NONE)
          }
        }
      }
    },
    definition: {
      order: 103,
      fields: {
        label: {
          value: '=',
          css: 'reserved'
        }
      },
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'expression',
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromModel()) {
            var d = this.owner.data.variant
            d.set(d.NONE)
            d = this.owner.data.definition
            d.set(d.DEFINED)            
          } else {
            d = this.owner.data.definition
            d.set(d.NONE)
          }
        }
      }
    },
    arguments: {
      order: 1000,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list_comprehensive,
      consolidate: /** @suppress {globalThis} */ function () {
        var target = this.input.connection.targetBlock()
        if (target) {
          target.eyo.createConsolidator(this, true)
          this.consolidate.apply(this, arguments)
        }
      }
    },
    slicing: {
      order: 2000,
      fields: {
        start: '[',
        end: ']'
      },
      wrap: eYo.T3.Expr.slice_list
    },
    alias: {
      order: 3000,
      fields: {
        label: 'as',
        bind: {
          placeholder: eYo.Msg.Placeholder.ALIAS,
          validate: true,
          endEditing: true,
          variable: true
        }
      }
    }
  },
  output: {
    check: /** @suppress {globalThis} */ function (type, subtype) {
      // there is no validation here
      // simple cases first, variant based
      var eyo = this.connection.sourceBlock_.eyo
      var profile = eyo.getProfile()
      if (!profile) {
        console.warn('NO PROFILE, is it normal?')
        eyo.incrementChangeCount()
        profile = eyo.getProfile()
        if (!profile) {
          console.error('NO PROFILE')
        }
      }
      return eyo.getOutCheck(profile)
    }
  }
})

for (var _ = 0, k;(k = [
  'call_expr',
  'subscription',
  'slicing',
  'identifier',
  'attributeref',
  'dotted_name',
  'parent_module',
  'identifier_defined',
  'key_datum',
  'identifier_annotated',
  'keyword_item',
  'identifier_annotated_defined',
  'identifier_as',
  'dotted_name_as',
  'expression_as'
][_++]);) {
  eYo.DelegateSvg.Expr[k] = eYo.DelegateSvg.Expr.primary
  eYo.DelegateSvg.Manager.register(k)
}

/**
 * getProfile.
 * What are the types of holder and name?
 * @return {!Object}.
 */
eYo.DelegateSvg.Expr.primary.prototype.getProfile = eYo.Decorate.onChangeCount(
  'getProfile',
  function () {
    // this may be called very very early
    if (this.data) {
      var profile = {
        dotted: this.data.dotted.get(),
        variant: this.data.variant.get(),
        defined: !this.data.definition.isNone(),
        annotated: !this.data.annotation.isNone()
      }
      var type
      var target = this.slots && this.slots.name.targetBlock()
      if (target) {
        var eyo = target.eyo
        if (eyo.checkOutputType(eYo.T3.Expr.identifier)) {
          type = eYo.T3.Expr.identifier
        } else if (eyo.checkOutputType(eYo.T3.Expr.dotted_name)) {
          type = eYo.T3.Expr.dotted_name
        } else if (eyo.checkOutputType(eYo.T3.Expr.parent_module)) {
          type = eYo.T3.Expr.parent_module
        } else if (eyo.checkOutputType(eYo.T3.Expr.Check.named_attributeref)) {
          type = eYo.T3.Expr.named_attributeref
        } else if (eyo.checkOutputType(eYo.T3.Expr.Check.named_primary)) {
          type = eYo.T3.Expr.named_primary
        } else if (eyo.checkOutputType(eYo.T3.Expr.Check.primary)) {
          type = eYo.T3.Expr.primary
        } else if (eyo.checkOutputType(eYo.T3.Expr.Check.expression)) {
          type = eYo.T3.Expr.expression
        } else {
          type = eYo.T3.Expr.error // this block should not be connected
        }
        profile.name = {
          type: type,
          slot: type,
          target: target
        }
      } else {
        type = eYo.Do.typeOfString(this.data.name.get()).expr
        profile.name = {
          type: type,
          field: type
        }
      }
      if (profile.dotted) {
        target = this.slots && this.slots.holder.targetBlock()
        if (target) {
          eyo = target.eyo
          if (eyo.checkOutputType(eYo.T3.Expr.identifier)) {
            type = eYo.T3.Expr.identifier
          } else if (eyo.checkOutputType(eYo.T3.Expr.dotted_name)) {
            type = eYo.T3.Expr.dotted_name
          } else if (eyo.checkOutputType(eYo.T3.Expr.parent_module)) {
            type = eYo.T3.Expr.parent_module
          } else if (eyo.checkOutputType(eYo.T3.Expr.Check.named_primary)) {
            type = eYo.T3.Expr.named_primary
          } else if (eyo.checkOutputType(eYo.T3.Expr.Check.primary)) {
            type = eYo.T3.Expr.primary
          } else {
            type = eYo.T3.Expr.error // this block should not be connected
          }
          profile.holder = {
            type: type,
            slot: type,
            target: target
          }
        } else {
          type = eYo.Do.typeOfString(this.data.holder.get()).expr
          profile.holder = {
            type: type,
            field: type
          }
        }
      } else {
        profile.holder = {
        }
      }
      return profile
    }
    return {
      name: {},
      holder: {}
    }
  }
)

/**
 * getBaseType.
 * The type depends on the variant and the modifiers.
 * As side effect, the subtype is set.
 */
eYo.DelegateSvg.Expr.primary.prototype.getBaseType = function () {
  var profile = this.getProfile()
  var check = this.getOutCheck(profile)
  return check[0]
}

/**
 * getOutCheck.
 * The check_ array of the output connection.
 * @param {!Object} getProfile
 */
eYo.DelegateSvg.Expr.primary.prototype.getOutCheck = function (profile) {
  // there is no validation here
  // simple cases first, variant based
  var named = function () {
    if (eYo.T3.Expr.Check.named_primary.indexOf(profile.name.type)) {
      if (!profile.holder.type
      || eYo.T3.Expr.Check.named_primary.indexOf(profile.holder.type)) {
        return true
      }
    }
  }
  if (profile.variant === eYo.Key.CALL_EXPR) {
    return named()
      ? [
        eYo.T3.Expr.named_call_expr,
        eYo.T3.Expr.call_expr
      ] 
      : [
        eYo.T3.Expr.call_expr
      ]
  } else if (profile.variant === eYo.Key.SLICING) {
    return named()
      ? [
        eYo.T3.Expr.named_slicing,
        eYo.T3.Expr.slicing
      ] 
      : [
        eYo.T3.Expr.slicing
      ]
  } else if (profile.variant === eYo.Key.ALIASED) {
    if (profile.name.type === eYo.T3.Expr.identifier
    || profile.name.type === eYo.T3.Expr.unset) {
      if (profile.holder && (profile.holder.type === eYo.T3.Expr.unset
        || profile.holder.type === eYo.T3.Expr.identifier
        || profile.holder.type === eYo.T3.Expr.dotted_name)) {
        return [
          eYo.T3.Expr.dotted_name_as,
          eYo.T3.Expr.expression_as
        ]
      }
      return profile.holder && profile.holder.type
        ? [
          eYo.T3.Expr.expression_as
        ]
        : [
          eYo.T3.Expr.identifier_as,
          eYo.T3.Expr.dotted_name_as,
          eYo.T3.Expr.expression_as
        ]
    }
    if (profile.name.type === eYo.T3.Expr.dotted_name) {
      if (!profile.holder.type
        || profile.holder.type === eYo.T3.Expr.unset
        || profile.holder.type === eYo.T3.Expr.identifier
        || profile.holder.type === eYo.T3.Expr.dotted_name) {
        return [
          eYo.T3.Expr.dotted_name_as,
          eYo.T3.Expr.expression_as
        ]
      }
    }
    return [
      eYo.T3.Expr.expression_as
    ]
  }
  if (profile.annotated) {
    if(profile.defined) {
      return [
        eYo.T3.Expr.identifier_annotated_defined
      ]
    }
    return profile.name.type === eYo.T3.Expr.identifier
      ? [
        eYo.T3.Expr.identifier_annotated,
        eYo.T3.Expr.key_datum
      ]
      : [
        eYo.T3.Expr.key_datum
      ]
  } else if(profile.defined) {
    return [
      eYo.T3.Expr.identifier_defined,
      eYo.T3.Expr.keyword_item
    ]
  }
  // if this is just a wrapper, forwards the check array
  if (!profile.dotted) {
    return profile.name.target
      ? profile.name.target.outputConnection.check_
      : profile.name.type === eYo.T3.Expr.unset
        ? [
          eYo.T3.Expr.identifier
        ]
        : [
          profile.name.type
        ]
  }
  // parent_module first
  if (profile.name.type === eYo.T3.Expr.parent_module) {
    return [
      eYo.T3.Expr.parent_module
    ]
  }
  if (profile.holder.type === eYo.T3.Expr.parent_module) {
    return [
      eYo.T3.Expr.parent_module
    ]
  }
  if (profile.dotted > 0 && (!profile.holder.type
    || profile.holder.type === eYo.T3.Expr.unset)) {
    return [
      eYo.T3.Expr.parent_module
    ]
  }
  // [named_]attributeref
  if (profile.name.type === eYo.T3.Expr.unset
  || profile.name.type === eYo.T3.Expr.identifier) {
    if (profile.holder.type === eYo.T3.Expr.unset
    || profile.holder.type === eYo.T3.Expr.identifier
    || profile.holder.type === eYo.T3.Expr.dotted_name) {
      return [
        eYo.T3.Expr.dotted_name,
        eYo.T3.Expr.named_attributeref,
        eYo.T3.Expr.attributeref
      ]
    }
    if (profile.holder.type) {
      if (eYo.T3.Expr.Check.named_primary.indexOf(profile.holder.type) >= 0) {
        return [
          eYo.T3.Expr.named_attributeref,
          eYo.T3.Expr.attributeref
        ]
      }
      return [
        eYo.T3.Expr.attributeref
      ]  
    }
    return [
      eYo.T3.Expr.identifier,
      eYo.T3.Expr.dotted_name
    ]  
  }
  if (profile.name.type === eYo.T3.Expr.dotted_name) {
    if (profile.holder.type === eYo.T3.Expr.unset
    || profile.holder.type === eYo.T3.Expr.identifier
    || profile.holder.type === eYo.T3.Expr.dotted_name) {
      return [
        eYo.T3.Expr.dotted_name,
        eYo.T3.Expr.named_attributeref,
        eYo.T3.Expr.attributeref
      ]
    }
    if (profile.holder.type) {
      if (eYo.T3.Expr.Check.named_primary.indexOf(profile.holder.type) >= 0) {
        return [
          eYo.T3.Expr.named_attributeref,
          eYo.T3.Expr.attributeref
        ]
      }
      return [
        eYo.T3.Expr.attributeref
      ]  
    }
    return [
      eYo.T3.Expr.dotted_name
    ]  
  }
  if (profile.name.type === eYo.T3.Expr.named_attributeRef) {
    if (!profile.dotted
      || eYo.T3.Expr.Check.named_primary.indexOf(profile.holder.type)) {
      return [
        eYo.T3.Expr.named_attributeref,
        eYo.T3.Expr.attributeref
      ]
    }
  }
  if (profile.name.type === eYo.T3.Expr.attributeRef) {
    return !profile.dotted || eYo.T3.Expr.Check.named_primary.indexOf(profile.holder.type)
      ? [
        eYo.T3.Expr.named_attributeref,
        eYo.T3.Expr.attributeref
      ]
      : [
        eYo.T3.Expr.attributeref
      ]
  }
  if (profile.name.type === eYo.T3.Expr.call_expr) {
    return !profile.dotted || eYo.T3.Expr.Check.named_primary.indexOf(profile.holder.type)
      ? [
        eYo.T3.Expr.named_call_expr,
        eYo.T3.Expr.call_expr
      ]
      : [
        eYo.T3.Expr.call_expr
      ]
  }
  if (profile.name.type === eYo.T3.Expr.slicing) {
    return !profile.dotted || eYo.T3.Expr.Check.named_primary.indexOf(profile.holder.type)
      ? [
        eYo.T3.Expr.named_slicing,
        eYo.T3.Expr.slicing
      ]
      : [
        eYo.T3.Expr.slicing
      ]
  }
  return [
    eYo.T3.Expr.attributeref
  ]
}

/**
 * The subtype depends on the variant and the modifiers.
 * Set by getType as side effect.
 */
eYo.DelegateSvg.Expr.primary.prototype.getSubtype = function () {
  this.getType()
  return this.data.subtype.get()
}

/**
 * Fetches the named input object, getInput.
 * This is not a very strong design but it should work, I guess.
 * @param {!Block} block
 * @param {String} name The name of the input.
 * @param {?Boolean} dontCreate Whether the receiver should create inputs on the fly.
 * @return {Blockly.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
eYo.DelegateSvg.Expr.primary.prototype.getInput = function (block, name) {
  var input = eYo.DelegateSvg.Expr.primary.superClass_.getInput.call(this, block, name)
  if (!input) {
    // we suppose that ary is set
    var f = function (slot) {
      if (!slot.isIncog()) {
        var input = slot.input
        if (input && input.connection) {
          var target = input.connection.targetBlock()
          if (target && (input = target.getInput(name))) {
            return true
          }
        }
      }
    }
    f(this.slots.arguments) || f(this.slots.slicing)
  }
  return input
}

/**
 * Class for a DelegateSvg, base call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('pre_call_stmt', {
  link: eYo.T3.Expr.primary
}, eYo.DelegateSvg.Stmt)

/**
 * Class for a DelegateSvg, base call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.pre_call_stmt.makeSubclass('call_stmt', {
  data: {
    variant: {
      init: eYo.Key.CALL_EXPR,
      validate: function (newValue) {
        return {validated: eYo.Key.CALL_EXPR}
      }
    }
  }
}, eYo.DelegateSvg.Stmt)

/**
 * Class for a DelegateSvg, base call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('base_call_expr', {
  data: {
    callerFlag: {
      order: 100,
      init: false, // true iff `foo` is expected instead of `foo(…)`
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          if (this.get()) {
            element.setAttribute('caller', 'true')
          }
        },
        load: /** @suppress {globalThis} */ function (element) {
          var attr = element.getAttribute('caller')
          this.set(attr && attr === 'true')
        }
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        this.owner.slots.arguments.setIncog(newValue)
      },
    },
    ary: {
      order: 200,
      init: Infinity,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var validated
        if (goog.isString(newValue)) {
          if (newValue.length) {
            validated = Math.max(0, Math.floor(Number(newValue)))
          } else {
            validated = Infinity
          }
        } else {
          validated = Math.max(0, Math.floor(newValue))
        }
        return {validated: validated}
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var callerFlag_d = this.data.callerFlag
        var caller = callerFlag_d && callerFlag_d.get()
        this.owner.slots.arguments.setIncog(caller)
      },
      willChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        // First change the ary of the arguments list, then change the ary of the delegate.
        // That way undo events are recorded in the correct order.
        var input = this.owner.slots.arguments.input
        if (input && input.connection) {
          var target = input.connection.targetBlock()
          if (target) {
            target.eyo.data.ary.set(newValue)
          }
        }
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          var ary = this.get()
          if (ary < Infinity) {
            element.setAttribute('ary', ary)
          }
        }
      }
    },
    parent: {
      order: 50,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type.raw === eYo.T3.Expr.builtin__name
        || type.expr === eYo.T3.Expr.identifier
        || type.expr === eYo.T3.Expr.dotted_name
        ? {validated: newValue} : null
        // return this.getAll().indexOf(newValue) < 0? null : {validated: newValue} // what about the future ?
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      },
      synchronize: true
    },
    mandatory: {
      order: 200,
      noUndo: true,
      xml: false,
      validate: /** @suppress {globalThis} */ function (newValue) {
        return goog.isNumber(newValue) && newValue > 0 ? {validated: Math.floor(newValue)} : null
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var slot = this.owner.slots.unary
        slot && (slot.input.connection.eyo.variantal_ = this.get())
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        var input = this.owner.slots.arguments.input
        if (input && input.connection) {
          var target = input.connection.targetBlock()
          if (target) {
            target.eyo.data.mandatory.set(newValue)
          }
        }
      }
    }
  },
  slots: {
    parent: {
      order: 50,
      fields: {
        bind: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.IDENTIFIER
        }
      }
    },
    arguments: {
      order: 1000,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list
    }
  },
  output: {
    check: [eYo.T3.Expr.call_expr]
  }
})

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('base_call_stmt', {
  link: eYo.T3.Expr.primary
}, eYo.DelegateSvg.Stmt)

eYo.DelegateSvg.Stmt.base_call_stmt.prototype.getType = eYo.DelegateSvg.Expr.primary.prototype.getType

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.base_call_stmt.makeSubclass('call_stmt', {
})

eYo.DelegateSvg.Expr.primary.T3s = [
  eYo.T3.Expr.primary,
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.attributeref,
  eYo.T3.Expr.slicing,
  eYo.T3.Expr.subscription,
  eYo.T3.Expr.call_expr,
  eYo.T3.Stmt.call_stmt
]

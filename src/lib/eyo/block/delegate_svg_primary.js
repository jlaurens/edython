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
goog.require('eYo.DelegateSvg.Term')
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
 * expression_star ::= "*" expression
 * parameter_star ::= "*" [parameter]
 * target_star ::= "*" target
 * star_expr ::= "*" or_expr
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
 * call_expr ::= primary "(" argument_list_comprehensive ")"
 * subscription ::= primary "[" expression_list "]"
 * slicing ::= primary "[" slice_list "]"
 * We can notice that some 
 * The block inner content is divided into different parts
 * 1) the modifier which is one of '', '*', '**', '.', '..', etc
 * When not void, appears in 
 * expression_star ::= "*" expression
 * parameter_star ::= "*" [parameter]
 * target_star ::= "*" target
 * star_expr ::= "*" or_expr
 * expression_star_star ::= "**" expression
 * parameter_star_star ::= "**" parameter
 * parent_module ::= '.'+ [module]
 * 2) the module or parent
 * For `foo.bar` construct
 * 3) the name
 * Either a field or an expression.
 * If this is an expression, there must be some other non void part,
 * otherwise we would have an expression block which only purpose is
 * just to contain an expression block, no more no less. This would
 * not be efficient.
 * 4) the annotation
 * This is used for parameter annotation, appears in both
 * identifier_annotated ::= identifier ":" expression
 * key_datum ::= expression ":" expression
 * This may be used in annotated assignments.
 * 5) the definition
 * parameter_defined ::= parameter "=" expression
 * (with parameter ::= identifier | identifier_annotated)
 * keyword_item ::= identifier "=" expression
 * 6) the map
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
 | *|  |xi|  |  |  | expression_star ::= "*" expression
 | *|  |xi|  |  |  | parameter_star ::= "*" [parameter]
 | *|  |xi|  |  |  | target_star ::= "*" target
 | *|  |xp|  |  |  | star_expr ::= "*" or_expr
 |**|  |xp|  |  |  | expression_star_star ::= "**" expression
 |**|  |id|  |  |  | parameter_star_star ::= "**" parameter
 |  |ff|id|  |  |  | attributeref ::= primary "." identifier
 |  |  |dd|  |  |  | dotted_name ::= identifier ("." identifier)*
 | .|  |dd|  |  |  | parent_module ::= '.'+ [module]
 |  |  |id|  |  |  | identifier ::=
 |  |  |  |:x|  |  | identifier_annotated ::= identifier ":" expression
 |  |  |  |:x|  |  | key_datum ::= expression ":" expression
 |  |  |  |  |=x|  | parameter_defined
 |  |  |  |  |=x|  | keyword_item ::= identifier "=" expression
 |  |  |  |  |  |as| dotted_name_as ::= module "as" identifier
 |  |  |  |  |  |as| identifier_as ::= identifier "as" identifier
 |  |  |  |  |  |()| call_expr
 |  |  |  |  |  |[]| subscription
 |  |  |  |  |  |[]| slicing
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('primary', {
  xml: {
    types: [
      eYo.T3.Expr.term,
      eYo.T3.Expr.identifier,
      eYo.T3.Expr.parent_module,
      eYo.T3.Expr.dotted_name,
      eYo.T3.Expr.attributeref,
      eYo.T3.Expr.subscription,
      eYo.T3.Expr.slicing,
      eYo.T3.Expr.call_expr,      
    ]
  },
  data: {
    modifier: {
      order: 100,
      all: ['', '*', '**', '.', '..'],
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.setIncog(!newValue || !newValue.length)
      },
      isChanging: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.owner.setupType(this.owner.getType())
        this.owner.setupConnections()
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === 'eYo.T3.Expr.parameter_star') {
          this.set('*')
        } else if (type === 'eYo.T3.Expr.star_expr') {
          this.set('*')
        } else if (type === 'eYo.T3.Expr.parameter_star_star') {
          this.set('**')
        } else if (type === 'eYo.T3.Expr.expression_star_star') {
          this.set('**')
        } else if (type === 'eYo.T3.Expr.or_expr_star_star') {
          this.set('**')
        }
        // this.set()
      },
      synchronize: true
    },
    dotted: {
      order: 200,
      NONE: eYo.Key.NONE,
      PARENT: eYo.Key.PARENT,
      MODULE: eYo.Key.MODULE,
      all: [
        eYo.Key.NONE,
        eYo.Key.PARENT,
        eYo.Key.MODULE,
      ],
      init: eYo.Key.NONE,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        var module_d = this.data.module
        module_d.required = newValue === this.MODULE
        if (newValue !== this.NONE) {
          // this is a dotted expression
          var annotation_d = this.data.annotation
          annotation_d.set(annotation_d.VOID)
          var definition_d = this.data.definition
          definition_d.set(definition_d.VOID)
        }
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        var module_d = this.data.module
        module_d.setIncog(newValue !== this.MODULE)
        var slots = this.owner.slots
        var parent_s = slots.parent
        if (parent_s) {
          parent_s.required = newValue === this.PARENT
          parent_s.setIncog()
        }
        slots.dot && slots.dot.setIncog(newValue === this.NONE)
        this.data.name.synchronize()
      },
      isChanging: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.owner.setupType(this.owner.getType())
        this.owner.setupConnections()
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Expr.attributeref) {
          this.set(this.PARENT)
        }
      },
      xml: false
    },
    module: {
      order: 201,
      init: eYo.Key.BUILTIN, // will be saved only when not built in
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return !newValue || type.expr === eYo.T3.Expr.identifier
       || type.expr === eYo.T3.Expr.dotted_name
       || type.expr === eYo.T3.Expr.parent_module
        ? {validated: newValue} : null
        // return this.getAll().indexOf(newValue) < 0? null : {validated: newValue} // what about the future ?
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        if (this.isRequiredFromModel() && this.get() !== eYo.Key.BUILTIN) {
          var dotted_d = this.owner.data.dotted
          dotted_d.set(dotted_d.MODULE)
        }
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      },
      synchronize: true,
      xml: {
        // the module will be saved only when not builtin
        save: /** @suppress {globalThis} */ function (el) {
          if (this.get() !== eYo.Key.BUILTIN) {
            this.save(el)
          }
        },
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromModel()) {
            var d = this.data.dotted
            if (!this.get()) {
              this.set(eYo.Key.BUILTIN)
              if (d.get() === d.MODULE) {
                d.set(d.NONE)
              }
            } else if (this.get() !== eYo.Key.BUILTIN) {
              d.set(d.MODULE)
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
        var nameType = this.data.nameType.get()
        return ((nameType === eYo.T3.Expr.identifier) && {validated: newValue}) || null
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
      validate: true,
      didChange: function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        // override previous data if necessary
        if (newValue !== eYo.Key.NONE) {
          // no module nor dotted nor variant
          this.data.dotted.set(eYo.Key.NONE)
          this.data.module.set(null)
          this.data.variant.set(eYo.Key.NONE)
        }
      },
      synchronize: function (newValue) {
        var slot = this.owner.slots.annotation
        if (slot) {
          slot.required = newValue === this.ANNOTATED
          slot.setIncog(!slot.required)
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
      validate: true,
      didChange: function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        // override previous data if necessary
        if (newValue !== eYo.Key.NONE) {
          // no module nor dotted nor variant
          this.data.dotted.set(eYo.Key.NONE)
          this.data.variant.set(eYo.Key.NONE)
          this.data.module.set(null)
        }
      },
      synchronize: function (newValue) {
        var slot = this.owner.slots.definition
        if (slot) {
          slot.required = newValue === this.DEFINED
          slot.setIncog(!slot.required)
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
        this.owner.render() // bad smell
      },
      isChanging: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.owner.setupType(this.owner.getType())
        this.owner.setupConnections()
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        if ([this.CALL_EXPR, this.SLICING, this.ALIASED].indexOf(newValue) >= 0) {
          this.data.annotation.set(eYo.Key.NONE)
          this.data.definition.set(eYo.Key.NONE)
        }
        this.didChange(oldValue, newValue)
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Expr.call_expr) {
          this.set(this.CALL_EXPR)
        } else if (type === eYo.T3.Expr.slicing) {
          this.set(this.SLICING)
        } else if (type === eYo.T3.Expr.dotted_name_as || type === eYo.T3.Expr.identifier_as) {
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
        var type = eYo.Do.typeOfString(newValue)
        this.data.nameType.set(type.expr)
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
    nameType: {
      order: 10001,
      all: [eYo.T3.Expr.identifier,
        eYo.T3.Expr.dotted_name,
        eYo.T3.Expr.parent_module],
      noUndo: true,
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
    module: {
      order: 50,
      fields: {
        bind: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.MODULE
        }
      }
    },
    parent: {
      order: 51,
      check: eYo.T3.Expr.Check.primary,
      hole_value: eYo.Msg.Placeholder.PRIMARY
    },
    dot: {
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
      check: eYo.T3.Expr.Check.primary,
      plugged: eYo.T3.Expr.primary,
      hole_value: 'expression',
      fields: {
        bind: {
          placeholder: eYo.Msg.Placeholder.TERM,
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
      wrap: eYo.T3.Expr.argument_list_comprehensive
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
    check: /** @suppress {globalThis} */ function (block) {
      var variant_d = this.data.variant
      var variant = variant_d.get()
      var check
      if (variant === variant_d.CALL_EXPR) {
        check = [eYo.T3.Expr.call_expr]
      } else if (variant === variant_d.SLICING) {
        check = [eYo.T3.Expr.subscription, eYo.T3.Expr.slicing]
      } else if (variant === variant_d.ALIASED) {
        var nameType_d = this.data.nameType
        var nameType = nameType_d.get()
        check = nameType === eYo.T3.Expr.identifier
          ? [eYo.T3.Expr.expression_as, eYo.T3.Expr.dotted_name_as, eYo.T3.Expr.identifier_as]
          : [eYo.T3.Expr.expression_as, eYo.T3.Expr.dotted_name_as]
      } else {
        var dotted_d = this.data.dotted
        var dotted = dotted_d.get()
        if (dotted !== dotted_d.NONE) {
          check = [eYo.T3.Expr.attributeref]
        } else {
          nameType = this.data.nameType.get()
          if (nameType === eYo.T3.Expr.parent_module) {
            check = nameType
          } else {
            var modifier = this.data.modifier.get()
            if (modifier === '**') {
              // expression_star_star ::= "**" expression
              // parameter_star_star ::= "**" parameter
              // or_expr_star_star ::=  "**" or_expr
              check = nameType === eYo.T3.Expr.identifier
                ? [eYo.T3.Expr.expression_star_star,
                  eYo.T3.Expr.parameter_star_star,
                  eYo.T3.Expr.or_expr_star_star]
                : [eYo.T3.Expr.expression_star_star,
                  eYo.T3.Expr.or_expr_star_star]
            } else if (modifier === '*') {
              check = nameType === eYo.T3.Expr.identifier
              ? [eYo.T3.Expr.expression_star,
                eYo.T3.Expr.parameter_star,
                eYo.T3.Expr.target_star,
                eYo.T3.Expr.star_expr]
              : [eYo.T3.Expr.expression_star,
                eYo.T3.Expr.target_star,
                eYo.T3.Expr.star_expr]
            } else {
              var annotated = this.data.annotation.get()
              var defined = this.data.definition.get()
              if (defined !== eYo.Key.NONE) {
                check = annotated !== eYo.Key.NONE
                ? [eYo.T3.Expr.parameter_defined]
                : [eYo.T3.Expr.parameter_defined,
                  eYo.T3.Expr.keyword_item]
              } else if (annotated !== eYo.Key.NONE) {
                check = [eYo.T3.Expr.identifier_annotated, eYo.T3.Expr.key_datum]
              } else {
                check = [eYo.T3.Expr.identifier]
              }
            }
          }
        }
      /*
      * The possible types for the blocks are all primary expression types, namely
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
      * plus call_expr, attributeref and slicing.
      */
      }
      return check
    }
  }
})

eYo.DelegateSvg.Expr.call_expr =
eYo.DelegateSvg.Expr.attributeref =
eYo.DelegateSvg.Expr.slicing =
eYo.DelegateSvg.Expr.subscription =
eYo.DelegateSvg.Expr.primary
eYo.DelegateSvg.Manager.register('subscription')
eYo.DelegateSvg.Manager.register('slicing')
eYo.DelegateSvg.Manager.register('attributeref')
eYo.DelegateSvg.Manager.register('call_expr')
eYo.DelegateSvg.Expr.term =
eYo.DelegateSvg.Expr.identifier =
eYo.DelegateSvg.Expr.parent_module =
eYo.DelegateSvg.Expr.dotted_name =
eYo.DelegateSvg.Expr.primary
eYo.DelegateSvg.Manager.register('term')
eYo.DelegateSvg.Manager.register('identifier')
eYo.DelegateSvg.Manager.register('parent_module')
eYo.DelegateSvg.Manager.register('dotted_name')

/**
 * getType.
 * The type depends on the variant and the modifiers.
 * @param {!Block} block
 * @return {String} The input object, or null if input does not exist or undefined for the default block implementation.
 */
eYo.DelegateSvg.Expr.primary.prototype.getType = function (block) {
  var f = function (block) {
    var variant_d = this.data.variant
    var variant = variant_d.get()
    if (variant === variant_d.CALL_EXPR) {
      return eYo.T3.Expr.call_expr
    } else if (variant === variant_d.SLICING) {
      // which one : slicing or subscription ?
      return eYo.T3.Expr.slicing
    } else {
      var variant_d = this.data.variant
      var variant = variant_d.get()
      var type = this.data.nameType.get()
      var target = this.slots && this.slots.name.input.connection.targetBlock()
      if (variant === variant_d.ALIASED) {
        // 1) dotted_name_as            : /*   ::= dotted_name "as" identifier                        (The import statement) */ "eyo:dotted_name_as",
        // condition: `name` field is like a dotted name or name slot is free or name slot is connected to a dotted name like block
        if (target) {
          if (target.eyo.getType() === eYo.T3.Expr.identifier) {
            return eYo.T3.Expr.identifier_as
          } else if (target.eyo.getType() === eYo.T3.Expr.dotted_name) {
            return eYo.T3.Expr.dotted_name_as
          } else {
            return eYo.T3.Expr.expression_as
          }
        } else if (type === eYo.T3.Expr.identifier) {
          return eYo.T3.Expr.identifier_as
        } else /* if (type === eYo.T3.Expr.dotted_name) */ {
          return eYo.T3.Expr.dotted_name_as
        }
      } else {
        var definition_d = this.data.definition
        var definition = definition_d.get()
        if (definition === definition_d.DEFINED) {
          return eYo.T3.Expr.parameter_defined
        }
        var modifier_d = this.data.modifier
        var modifier = modifier_d.get()
        var annotation_d = this.data.annotation
        var annotation = annotation_d.get
        if (annotation === annotation_d.ANNOTATED) {
          if (modifier === '*') {
            return eYo.T3.Expr.parameter_star
          } else if (modifier === '**') {
            return eYo.T3.Expr.parameter_star_star
          } else {
            return eYo.T3.Expr.identifier_annotated
          }
        }
        // No variant at all
        if (modifier === '*') {
          if (target) {
            var type = target.eyo.getType()
            if (type === eYo.T3.Expr.identifier) {
              return eYo.T3.Expr.parameter_star
            }
            if (eYo.T3.Expr.Check.or_expr_all.indexOf(type) >= 0) {
              return eYo.T3.Expr.or_expr_star
            }
            return eYo.T3.Expr.expression_star
          }
          return eYo.T3.Expr.parameter_star
        } else if (modifier === '**') {
          if (target) {
            var type = target.eyo.getType()
            if (type === eYo.T3.Expr.identifier) {
              return eYo.T3.Expr.parameter_star_star
            }
            return eYo.T3.Expr.expression_star_star
          } else {
            return eYo.T3.Expr.parameter_star_star
          }
        }
        var dotted_d = this.data.dotted
        var dotted = dotted_d.get()
        if (dotted !== dotted_d.NONE) {
          return eYo.T3.Expr.attributeref
        }
        return this.data.nameType.get()
      }
    }
    // unreachable
  }
  var type = f.call(this, block)
  // console.log('type:', type)
  return type
}

/**
 * Sends a `consolidate` message to each component of the block.
 * However, there might be some caveats related to undo management.
 * @param {!Block} block
 */
eYo.DelegateSvg.Expr.primary.prototype.consolidate = function (block, deep, force) {
  eYo.DelegateSvg.Expr.primary.superClass_.consolidate.call(this, block, deep, force)
  if (this.slots) {
    var arguments_s = this.slots.arguments
    var args = arguments_s.input.connection.targetBlock()
    if (args) {
      args.eyo.createConsolidator(args, true)
    }
  }
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
 * Fetches the named input object, getInput.
 * This is not a very strong design but it should work, I guess.
 * @param {!Block} block
 * @param {String} name The name of the input.
 * @param {?Boolean} dontCreate Whether the receiver should create inputs on the fly.
 * @return {Blockly.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
eYo.DelegateSvg.Expr.base_call_expr.prototype.getInput = function (block, name) {
  var input = eYo.DelegateSvg.base_call_expr.superClass_.getInput.call(this, block, name)
  if (!input) {
    // we suppose that ary is set
    var f = function (slot) {
      if (!slot.isIncog()) {
        var input = slot.getInput()
        if (input && input.connection) {
          var target = input.connection.targetBlock()
          if (target && (input = target.getInput(name))) {
            return true
          }
        }
      }
    }
    f(slots.binary, this.BINARY)
   || f(slots.ternary, this.TERNARY)
   || f(slots.quadary, this.QUADARY)
   || f(slots.pentary, this.PENTARY)
   || f(slots.n_ary, this.N_ARY)
  }
  return input
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 * @suppress {globalThis}
*/
eYo.DelegateSvg.Expr.base_call_expr.populateMenu = function (block, mgr) {
  var callerFlag_d = this.data.callerFlag
  var caller = callerFlag_d.get()
  var content = this.contentTemplate(block)
  var content = caller
  ? goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    content,
    '(…)'
  )
  : content
  var menuItem = mgr.newMenuItem(content, function () {
    callerFlag_d.setTrusted(!caller)
  })
  mgr.addChild(menuItem, true)
  var ary_d = this.data.ary
  var current_ary = ary_d.get()
  var self = this
  var F = function (ary, args) {
    if (ary !== current_ary) {
      var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
        self.contentTemplate(block),
        '(',
        args,
        ')'
      )
      var menuItem = mgr.newMenuItem(content, self.doAndRender(block, function () {
        ary_d.setTrusted(ary)
        callerFlag_d.setTrusted(false)
      }, true))
      mgr.addChild(menuItem, true)
    }
  }
  F(ary_d.Z_ARY, '')
  F(ary_d.UNARY, '…')
  F(ary_d.BINARY, '…, …')
  F(ary_d.TERNARY, '…, …, …')
  F(ary_d.N_ARY, '…, …, …, ...')
  mgr.shouldSeparate()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 * @suppress {globalThis}
*/
eYo.DelegateSvg.Expr.base_call_expr.populateMenuCaller = function (block, mgr) {
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.base_call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.base_call_expr.populateMenu.call(this, block, mgr)
  eYo.DelegateSvg.Expr.base_call_expr.populateMenuCaller.call(this, block, mgr)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Expr.base_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

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
  eYo.T3.Expr.term,
  eYo.T3.Expr.attributeref,
  eYo.T3.Expr.slicing,
  eYo.T3.Expr.subscription,
  eYo.T3.Expr.call_expr,
  eYo.T3.Stmt.call_stmt
]

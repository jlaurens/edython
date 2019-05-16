/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Block delegates for edython, primary bricks.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Brick.Primary')

goog.require('eYo.Model.stdtypes')
goog.require('eYo.Model.functions')

goog.require('eYo.Msg')
goog.require('eYo.Brick.Primary')
goog.require('eYo.Brick.Stmt')
goog.require('eYo.Protocol.Register')
goog.require('goog.dom');

/**
 * List consolidator for assignment target list. Used in primary, only.
 * There are different situations depending on the type of the
 * brick enclosing the list.
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
eYo.Consolidator.List.makeSubclass('Target', {
  check: null,
  mandatory: 1,
  presep: ',',
  /**
   * Augmented assignments, annotated assignment and expressions,
   * except assignment chain, must take only one target.
   * @param {!Object} io input/output parameter
   */
  makeUnique: /** @suppress {globalThis} */ function (io) {
    // types with no unique element
    if ([
      eYo.T3.Stmt.expression_stmt,
      eYo.T3.Stmt.assignment_stmt,
      eYo.T3.Stmt.for_part,
      eYo.T3.Stmt.del_stmt,
      eYo.T3.Expr.dict_comprehension,
      eYo.T3.Expr.comprehension,
      eYo.T3.Expr.comp_for,
      eYo.T3.Expr.assignment_chain,
    ].indexOf(io.subtype) >= 0) {
      return false
    }
    // types with unique elements
    if ([
      eYo.T3.Stmt.annotated_stmt,
      eYo.T3.Stmt.annotated_assignment_stmt,
      eYo.T3.Stmt.augmented_assignment_stmt,
      eYo.T3.Expr.identifier,
      eYo.T3.Expr.identifier_annotated,
      eYo.T3.Expr.augtarget_annotated,
      eYo.T3.Expr.key_datum,
      eYo.T3.Expr.identifier_valued,
      eYo.T3.Expr.named_expr,
      eYo.T3.Expr.identifier_annotated_valued,
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
      eYo.T3.Expr.named_call_expr,
    ].indexOf(io.subtype) >= 0) {
      return true
    }
    // this.makeUnique(io) used when there is a `unique` check
  }
})

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {!eYo.Brick} brick, owner or the receiver.
 */
eYo.Consolidator.List.Target.prototype.getIO = function (brick) {
  var io = eYo.Consolidator.List.Target.superClass_.getIO.call(this, brick)
  io.first_starred = io.last = io.max = -1
  io.annotatedInput = undefined
  io.subtype = brick.subtype
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
eYo.Consolidator.List.Target.prototype.doCleanup = (() => {
  // preparation: walk through the list of inputs and
  // find the first_starred input
  var Type = {
    UNCONNECTED: 0,
    STARRED: 1,
    OTHER: 2
  }
  /**
   * Whether the input corresponds to an identifier...
   * Called when io.input is connected.
   * @param {Object} io, parameters....
   */
  var getCheckType = (io) => {
    var m4t = io.m4t.target
    if (!m4t) {
      return Type.UNCONNECTED
    }
    var check = m4t.check_
    if (check) {
      if (goog.array.contains(check, eYo.T3.Expr.target_star)) {
        return Type.STARRED
      } else {
        if (!io.annotatedInput
          && (goog.array.contains(check, eYo.T3.Expr.identifier_annotated)
          || goog.array.contains(check, eYo.T3.Expr.augtarget_annotated)
          || goog.array.contains(check, eYo.T3.Expr.key_datum))) {
          io.annotatedInput = io.input
        }
        return Type.OTHER
      }
    } else {
      return Type.OTHER
    }
  }
  var setupFirst = function (io) {
    io.first_starred = io.last = -1
    io.annotatedInput = undefined
    this.setupIO(io, 0)
    while (io.input) {
      if ((io.input.parameter_type_ = getCheckType(io)) === Type.STARRED) {
        if (io.first_starred < 0) {
          io.first_starred = io.i
        }
      } else if (io.input.parameter_type_ === Type.OTHER) {
        io.last = io.i
      }
      this.nextInput(io)
    }
  }
  return function (io) {
    eYo.Consolidator.List.Target.superClass_.doCleanup.call(this, io)
    setupFirst.call(this, io)
    if (io.first_starred >= 0) {
      // ther must be only one starred
      this.setupIO(io, io.first_starred + 2)
      while (io.input) {
        if (io.input.parameter_type_ === Type.STARRED) {
          // disconnect this
          io.m4t.disconnect()
          // remove that input and the next one
          this.disposeAtI(io, io.i)
          this.disposeAtI(io, io.i)
        } else {
          this.setupIO(io, io.i + 2)
        }
      }
    }
  }
})()

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {!Object} io parameter.
 */
eYo.Consolidator.List.Target.prototype.getCheck = (() => {
  var f = io => {
    var subtype = io.subtype
    if (io.i === io.unique) {
      // all subtypes with `unique` elements
      return {
        [eYo.T3.Stmt.annotated_stmt]: eYo.T3.Expr.Check.target_annotated,
        [eYo.T3.Stmt.annotated_assignment_stmt]: eYo.T3.Expr.Check.target_annotated,
        [eYo.T3.Stmt.augmented_assignment_stmt]: eYo.T3.Expr.Check.augtarget,
        [eYo.T3.Expr.identifier]: eYo.T3.Expr.Check.expression,
        [eYo.T3.Expr.identifier_annotated]: eYo.T3.Expr.Check.expression,
        [eYo.T3.Expr.augtarget_annotated]: eYo.T3.Expr.Check.augtarget,
        [eYo.T3.Expr.key_datum]: eYo.T3.Expr.Check.expression,
        [eYo.T3.Expr.identifier_valued]: eYo.T3.Expr.Check.expression,
        [eYo.T3.Expr.named_expr]: eYo.T3.Expr.Check.expression,
        [eYo.T3.Expr.identifier_annotated_valued]: eYo.T3.Expr.Check.target,
        [eYo.T3.Expr.attributeref]: eYo.T3.Expr.Check.expression,
        [eYo.T3.Expr.named_attributeref]: eYo.T3.Expr.Check.expression,
        [eYo.T3.Expr.dotted_name]: eYo.T3.Expr.identifier,
        [eYo.T3.Expr.parent_module]: eYo.T3.Expr.identifier,
        [eYo.T3.Expr.identifier_as]: eYo.T3.Expr.identifier,
        [eYo.T3.Expr.dotted_name_as]: eYo.T3.Expr.identifier,
        [eYo.T3.Expr.expression_as]: eYo.T3.Expr.Check.expression,
        [eYo.T3.Expr.subscription]: eYo.T3.Expr.Check.expression,
        [eYo.T3.Expr.named_subscription]: eYo.T3.Expr.Check.expression,
        [eYo.T3.Expr.slicing]: eYo.T3.Expr.Check.expression,
        [eYo.T3.Expr.named_slicing]: eYo.T3.Expr.Check.expression,
        [eYo.T3.Expr.call_expr]: eYo.T3.Expr.Check.expression,
        [eYo.T3.Expr.named_call_expr]: eYo.T3.Expr.Check.expression,
      } [io.subtype] || eYo.T3.Expr.Check.target
    }
    if (io.i === 1 && io.list.length === 3) {
      return eYo.T3.Expr.Check.target
    }
    if (io.i === 0 && io.list.length === 1) {
      return eYo.T3.Expr.Check.target
    }
    if (io.first_starred < 0 || io.i === io.first_starred) {
      return eYo.T3.Expr.Check.target
    } else {
      return eYo.T3.Expr.Check.target_unstar
    }
  }
  return function (io) {
    var check = f(io)
    if (!check) {
      console.error('NO CHECK, BREAK HERE TO DEBUG', f(io))
    }
    var m4t = io.m4t.target
    if (m4t) {
      // will this connection be lost because of the check change?
      if (m4t.check_.some(t => check.indexOf(t) >= 0)) {
        //
      } else {
        console.error('THE CONNECTION WILL BE LOST, BREAK HERE TO DEBUG', m4t.check_, f(io))
      }
    }
    return check
  }
})()

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
eYo.Consolidator.List.Target.prototype.doFinalize = function (io) {
  eYo.Consolidator.List.Target.superClass_.doFinalize.call(this, io)
  if (this.setupIO(io, 0)) {
    do {
      io.m4t.incog = io.annotatedInput && io.annotatedInput !== io.input // will ensure that there is only one annotated input
    } while (this.nextInput(io))
  }
}


/**
 * Class for a Delegate, target_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * This brick appears in
 * - assignment's target slot, types:
 *    - expression_stmt
 *    - assignment_stmt
 *    - annotated_stmt
 *    - annotated_assignment_stmt
 *    - augmented_assignment_stmt
 * - comprehension's for slot, types:
 *    - dict_comprehension
 *    - comprehension
 * - comp_for's for slot, types:
 *    - comp_for
 * - for_part's for slot, types:
 *    - for_part
 * - primary's target slot, types:
 *    - identifier
 *    - identifier_annotated
 *    - augtarget_annotated
 *    - key_datum
 *    - identifier_valued
 *    - assignment_chain
 *    - named_expr
 *    - identifier_annotated_valued
 *    - attributeref
 *    - named_attributeref
 *    - dotted_name
 *    - parent_module
 *    - identifier_as
 *    - dotted_name_as
 *    - expression_as
 *    - subscription
 *    - named_subscription
 *    - slicing
 *    - named_slicing
 *    - call_expr
 *    - named_call_expr
 * - del_stmt's del slot, types:
 *    - del_stmt
 * All the types involved are
 * For edython.
 */
eYo.Brick.List.makeSubclass('target_list', {
  list: {
    consolidator: eYo.Consolidator.List.Target
  }
})

/**
 * The subtype is the type of the enclosing brick.
 * @return {String} The subtype of the receiver's brick.
 */
eYo.Brick.Expr.target_list.prototype.getSubtype = function () {
  var parent = this.parent
  return parent && parent.type
}

/**
 * Did disconnect this brick's connection from another connection.
 * @param {!eYo.Magnet} m4t
 * @param {!eYo.Magnet} oldTargetM4t that was connected to blockConnection
 */
eYo.Brick.Expr.target_list.prototype.XdidDisconnect = function (m4t, oldTargetM4t) {
  if (m4t.isInput) {
    var other = false
    if (this.inputList.some(input => {
      if (input.magnet) {
        var t9k = input.magnet.targetBrick
        if (t9k) {
          other= true
          if ([eYo.T3.Expr.identifier_annotated,
            eYo.T3.Expr.augtarget_annotated,
            eYo.T3.Expr.key_datum].indexOf(t9k.type) >= 0) {
            return true
          }
        }
      }
    })) {
      return
    }
    var x = this.parent
    if (x) {
      if (other) {
        if (x.variant_p === eYo.Key.ANNOTATED || x.variant_p === eYo.Key.ANNOTATED_VALUED) {
          x.variant_p = eYo.Key.TARGET_VALUED
        }
        return
      }
      (x = x.target_s) && x.bindField.setVisible(true)
    }
  }
  eYo.Brick.Expr.target_list.superClass_.didDisconnect.call(this, m4t, oldTargetM4t)
}

/**
 * Hook.
 * If more that 2 bricks are connected, the variant is target_valued.
 * @param {!eYo.Magnet} m4t.
 * @param {!eYo.Magnet} oldTargetM4t.
 * @param {!eYo.Magnet} targetOldM4t
 */
eYo.Brick.Expr.target_list.prototype.XdidConnect = function (m4t, oldTargetM4t, targetOldM4t) {
  eYo.Brick.Expr.target_list.superClass_.didConnect.call(this, m4t, oldTargetM4t, targetOldM4t)
  // BEWARE: the brick is NOT consolidated
  if (m4t.isInput) {
    var parent = this.parent
    if (parent) {
      parent.target_s.bindField.setVisible(false)
      if (this.inputList.length > 1) {
        // this is the second brick we connect
        parent.variant_p = eYo.Key.TARGET_VALUED
      } else {
        var v = parent.variant_p
        if (v === eYo.Key.ANNOTATED) {
          var t9k = m4t.targetBrick
          if ([eYo.T3.Expr.identifier_annotated,
            eYo.T3.Expr.augtarget_annotated,
            eYo.T3.Expr.key_datum].indexOf(t9k.type) >= 0) {
            parent.variant_p = eYo.Key.NONE // no 2 annotations
          }
        } else if (v === eYo.Key.ANNOTATED_VALUED) {
          var t9k = m4t.targetBrick
          if ([eYo.T3.Expr.identifier_annotated,
            eYo.T3.Expr.augtarget_annotated,
            eYo.T3.Expr.key_datum].indexOf(t9k.type) >= 0) {
            parent.variant_p = eYo.Key.TARGET_VALUED // no 2 annotations
          }
        }
      }
    }
  }
}

/**
 * Class for a Delegate, primary.
 * The primary brick is a foundamental piece of code.
 * It aims to answer the mutation problem on primary
 * and similar python types.
 * The question is to avoid big modifications concerning
 * the implementation when small modifications of the interface
 * are expected. This brick implementation covers all the following types:
 *
 * identifier ::=
 * attributeref ::= primary "." identifier
 * dotted_name ::= identifier ("." identifier)*
 * parent_module ::= '.'+ [module]
 * identifier_annotated ::= identifier ":" expression
 * augtarget_annotated ::= augtarget ":" expression
 * key_datum ::= expression ":" expression
 * identifier_valued ::= parameter "=" expression
 * identifier_anotated_valued ::= parameter "=" expression
 * identifier_as ::= identifier "as" identifier
 * dotted_name_as ::= module "as" identifier
 * expression_as ::= expression "as" identifier
 * call_expr ::= primary "(" argument_list_comprehensive ")"
 * subscription ::= primary "[" expression_list "]"
 * slicing ::= primary "[" slice_list "]"
 *
 * We can notice that some
 * The brick inner content is divided into different parts
 * 1) the module or parent, as holder
 * For `foo.bar` construct
 * 2) the name
 * Either a field or an expression.
 * If this is an expression, there must be some other non void part,
 * otherwise we would have an expression brick which only purpose is
 * just to contain an expression brick, no more no less. This would
 * not be efficient.
 * 3) the annotation
 * This is used for parameter annotation, appears in both
 * identifier_annotated ::= identifier ":" expression
 * augtarget_annotated ::= augtarget ":" expression
 * key_datum ::= expression ":" expression
 * This may be used in annotated assignments.
 * 4) the definition
 * identifier_valued ::= parameter "=" expression
 * (with parameter ::= identifier | identifier_annotated)
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
 * The python type of the brick is not uniquely defined.
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
 * augtarget_annotated ::= augtarget ":" expression
 * key_datum ::= expression ":" expression
 * identifier_valued ::= parameter "=" expression
 * identifier_anotated_valued ::= parameter ":" expression "=" expression
 * identifier_as ::= identifier "as" identifier
 * dotted_name_as ::= module "as" identifier
 * expression_as ::= expression "as" identifier
 * call_expr ::= primary "(" argument_list_comprehensive ")"
 * subscription ::= primary "[" expression_list "]"
 * slicing ::= primary "[" slice_list "]"
 * 00 |  |id|  |  |  | identifier ::=
 * 01 |  |id|:x|  |  | identifier_annotated ::= identifier ":" expression
 * 02 |  |*x|:x|  |  | augtarget_annotated ::= augtarget ":" expression
 * 03 |  | x|:x|  |  | key_datum ::= expression ":" expression
 * 04 |  |id|  |=x|  | identifier_valued ::= identifier "=" expression
 * 05 |  |id|  |=x|  | assignment_chain ::= target "=" expression
 * 06 |  |id|  |*x|  | named_expr ::= target ":=" expression
 * 07 |  |id|:x|=x|  | identifier_annotated_valued ::= ...
 * 08 |p.|id|  |  |  | attributeref ::= primary "." identifier
 * 09 |p.|id|  |  |  | named_attributeref ::= named_primary "." identifier
 * 10 |d.|dd|  |  |  | dotted_name ::= identifier ("." identifier)*
 * 11 |  |pm|  |  |  | parent_module ::= '.'+ [module]
 * 12 |  |id|  |  |as| identifier_as ::= identifier "as" identifier
 * 13 |d.|dd|  |  |as| dotted_name_as ::= module "as" identifier
 * 14 |  | x|  |  |as| expression_as ::= expression "as" identifier
 * 15 |  | p|  |  |()| call_expr
 * 16 |  |id|  |  |()| named_call_expr
 * 17 |  |  |  |  |[]| subscription
 * 18 |  |  |  |  |[]| named_subscription
 * 19 |  |  |  |  |[]| slicing
 * 20 |  |  |  |  |[]| named_slicing
 *
 * A note on the mutability of the primary brick, at least when
 * the identifier is concerned.
 * During the editing process, an identifier may not be set.
 * Some identifiers do need to be set to a non void string whereas
 * others do not. For example, `foo.bar`, `.bar` and `.` are
 * valid constructs but `foo.` is not. Both are obtained with a
 * `identifier.identifier` brick construct.
 * The question is to recognize whether each identifier is void or not.
 * Let `unset` denote an unset identifier.
 * `unset.unset` is of type parent_module, attributeref and dotted_name.
 *
 * A note on type management.
 * The primary brick is one of the most complex bricks in edython.
 * This design was chosen in order to ease brick edition.
 * This was kind of necessary because data and methods were merged in the delegate.
 * If there were a data delegate and a method delegate,
 * we would be able to keep the data in place and just change the methods.
 * Drawing the bricks would be deferred to another delegate.
 * This is a design that must be chosen in some future development.
 * For the moment, to make the difference between the different flavours
 * primary bricks, we have the variant and the subtype.
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
 * That makes 3 different brick types,
 * each being a particular case of the next one, if any.
 * In case 3), when blah blah blah is an identifier brick,
 * the type should be identifier_as, not just expression_as.
 * foo.bar

 * For edython.
 */
eYo.Brick.Expr.makeSubclass('primary', {
  xml: {
    types: [
      eYo.T3.Expr.identifier,
      eYo.T3.Expr.identifier_annotated,
      eYo.T3.Expr.augtarget_annotated,
      eYo.T3.Expr.key_datum,
      eYo.T3.Expr.identifier_valued,
      eYo.T3.Expr.assignment_chain,
      eYo.T3.Expr.named_expr,
      eYo.T3.Expr.identifier_annotated_valued,
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
        var validated
        if (goog.isString(newValue)) {
          if (newValue.length) {
            validated = Math.max(0, Math.floor(Number(newValue)))
          } else {
            validated = Infinity
          }
        } else if (goog.isNumber(newValue)) {
          validated = Math.max(0, Math.floor(newValue))
        }
        return goog.isDef(validated)
        ? {
          validated: validated
        }
        : {}
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.requiredIncog = newValue > 0
        var O = this.owner
        O.holder_d.requiredIncog = newValue === 1
        O.updateProfile()
        O.target_s.bindField.eyo.optional_ = newValue > 0
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        var p = this.owner.profile_p
        var item = p.p5e && p.p5e.item
        if (item) {
          if (item.type === 'method') {
            this.change(1)
            return
          }
        }
        if (type === eYo.T3.Expr.attributeref || type === eYo.T3.Expr.named_attributeref || type === eYo.T3.Expr.dotted_name_as || type === eYo.T3.Expr.dotted_name || type === eYo.T3.Expr.parent_module) {
          this.change(1)
        }
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
        save: /** @suppress {globalThis} */ function (element, opt) {
          if (this.get() || goog.isDef(this.model.placeholder)) {
            this.save(element, opt)
          }
        }
      },
      synchronize: true
    },
    holder: {
      order: 201,
      init: '', // will be saved only when not built in
      synchronize: true,
      placeholder: eYo.Msg.Placeholder.UNSET,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var p5e = eYo.T3.Profile.get(newValue, null)
        return !newValue
        || p5e.expr === eYo.T3.Expr.unset
        || p5e.expr === eYo.T3.Expr.identifier
        || p5e.expr === eYo.T3.Expr.builtin__name
        || p5e.expr === eYo.T3.Expr.dotted_name
        || p5e.expr === eYo.T3.Expr.attributeref
        || p5e.expr === eYo.T3.Expr.parent_module
        ? {validated: newValue} : null
        // return this.getAll().indexOf(newValue) < 0? null : {validated: newValue} // what about the future ?
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        // first change the dotted data to unincog the holder
        var O = this.owner
        if (newValue) {
          O.dotted_p = 1
        }
        this.didChange(oldValue, newValue)
        O.updateProfile()
      },
      xml: {
        force: /** @suppress {globalThis} */ function () {
          return this.owner.variant_p === eYo.Key.CALL_EXPR
        },
        save: /** @suppress {globalThis} */ function (element, opt) {
          if (!this.owner.holder_b) {
            if (this.get()) {
              this.save(element, opt)
            }
            var v = eYo.Do.valueOf(this.model.placeholder)
            v = v && v.toString().trim()
            if (v.length>0) {
              this.save(element, opt)
            }
          }
        }
      }
    },
    alias: {
      order: 400,
      init: '',
      placeholder: eYo.Msg.Placeholder.ALIAS,
      synchronize: true,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.T3.Profile.get(newValue).expr
        return type === eYo.T3.Expr.unset
        || type === eYo.T3.Expr.identifier
        || type === eYo.T3.Expr.builtin__name
        ? {validated: newValue}
        : null
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          this.required = this.owner.variant_p === eYo.Key.ALIASED
          this.save(element, opt)
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.ALIASED
        }
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        if (newValue) {
          this.owner.variant_p = eYo.Key.ALIASED
        }
      }
    }, // new
    annotated: {
      order: 1000,
      init: '',
      placeholder: eYo.Msg.Placeholder.EXPR,
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          var v = this.owner.variant_p
          if (v === eYo.Key.ANNOTATED || v === eYo.Key.ANNOTATED_VALUED) {
            this.required = true
            this.save(element, opt)
          }
        }
      },
      didLoad: /** @suppress {globalThis} */ function (element) {
        var O = this.owner
        var v = O.variant_p
        if (this.isRequiredFromSaved()) {
          if (v === eYo.Key.TARGET_VALUED) {
            O.variant_p = eYo.Key.ANNOTATED_VALUED
          } else if (v !== eYo.Key.ANNOTATED_VALUED) {
            O.variant_p = eYo.Key.ANNOTATED
          }
        } else {
          if (v === eYo.Key.ANNOTATED_VALUED) {
            O.variant_p = eYo.Key.TARGET_VALUED
          } else if (v === eYo.Key.ANNOTATED) {
            O.variant_p = eYo.Key.NONE
          }
        }
      },
      synchronize: true,
      validateIncog: /** @suppress {globalThis} */ function (newValue) {
        var v = this.owner.variant_p
        return v !== eYo.Key.ANNOTATED && v !== eYo.Key.ANNOTATED_VALUED
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        if (newValue) {
          var O = this.owner
          O.variant_p = O.value_p || O.value_s.unwrappedTarget
          ? eYo.Key.ANNOTATED_VALUED
          : eYo.Key.ANNOTATED
        }
      }
    },
    value: {
      order: 1001,
      init: '',
      placeholder: eYo.Msg.Placeholder.EXPRESSION,
      validate: false,
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          var v = this.owner.variant_p
          if (v === eYo.Key.TARGET_VALUED || v === eYo.Key.ANNOTATED_VALUED) {
            this.required = false
            this.save(element, opt)
          }
        },
        getAttribute: /** @suppress {globalThis} */ function (element) {
          return element.getAttribute('definition') // 'value' was named 'definition' prior to 0.2.x
        }
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
         if (newValue === eYo.Key.NONE) {
           console.error('UNEXPECTED')
         }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          var O = this.owner
          var v = O.variant_p
          if (v === eYo.Key.ANNOTATED) {
            O.variant_p = eYo.Key.ANNOTATED_VALUED
          } else if (v !== eYo.Key.TARGET_VALUED && v !== eYo.Key.ANNOTATED_VALUED && v !== eYo.Key.COL_VALUED) {
            O.variant_p = eYo.Key.TARGET_VALUED
          }
        }
      },
      synchronize: true,
      validateIncog: /** @suppress {globalThis} */ function (newValue) {
        var v = this.owner.variant_p
        return v !== eYo.Key.TARGET_VALUED && v !== eYo.Key.ANNOTATED_VALUED && v !== eYo.Key.TARGET_VALUED && v !== eYo.Key.COL_VALUED
      }
    },
    variant: {
      order: 2000,
      all: [
        eYo.Key.NONE, // identifier alone
        eYo.Key.CALL_EXPR, // foo(…)
        eYo.Key.SLICING, // foo[…]
        eYo.Key.ALIASED, // foo as bar
        eYo.Key.ANNOTATED, // foo : bar
        eYo.Key.ANNOTATED_VALUED, // foo : bar = …
        eYo.Key.TARGET_VALUED, // foo(, foo2) = bar
        eYo.Key.COL_VALUED, // foo := bar
      ],
      init: eYo.Key.NONE,
      isChanging: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.owner.consolidateType()
        this.owner.consolidateMagnets()
        this.duringChange(oldValue, newValue)
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        var O = this.owner
        O.annotated_d.required_from_type = false
        O.value_d.required_from_type = false
        if (type === eYo.T3.Expr.call_expr ||
            type === eYo.T3.Expr.named_call_expr ||
            type === eYo.T3.Stmt.call_stmt) {
          this.change(eYo.Key.CALL_EXPR)
        } else if (type === eYo.T3.Expr.slicing ||
            type === eYo.T3.Expr.named_slicing ||
            type === eYo.T3.Expr.subscription ||
            type === eYo.T3.Expr.named_subscription) {
          this.change(eYo.Key.SLICING)
        } else if (type === eYo.T3.Expr.dotted_name_as ||
            type === eYo.T3.Expr.identifier_as ||
            type === eYo.T3.Expr.expression_as) {
          this.change(eYo.Key.ALIASED)
        } else if (type === eYo.T3.Expr.identifier_annotated ||
          type === eYo.T3.Expr.augtarget_annotated ||
          type === eYo.T3.Expr.key_datum) {
          this.change(eYo.Key.ANNOTATED)
          O.annotated_d.required_from_type = true
        } else if (type === eYo.T3.Expr.identifier_valued ||
            type === eYo.T3.Expr.assignment_chain) {
          if (this.value_ !== eYo.Key.TARGET_VALUED) {
            this.change(eYo.Key.TARGET_VALUED)
          }
          O.value_d.required_from_type = true
        } else if (type === eYo.T3.Expr.identifier_annotated_valued) {
          this.change(eYo.Key.ANNOTATED_VALUED)
          O.annotated_d.required_from_type = true
          O.value_d.required_from_type = true
        } else if (type === eYo.T3.Expr.named_expr) {
          this.change(eYo.Key.COL_VALUED)
          O.value_d.required_from_type = true
        } else {
          this.change(eYo.Key.NONE)
        }
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        var O = this.owner
        O.alias_d.requiredIncog = newValue === eYo.Key.ALIASED
        O.value_d.requiredIncog = newValue === eYo.Key.TARGET_VALUED || newValue === eYo.Key.ANNOTATED_VALUED || newValue === eYo.Key.COL_VALUED
        var s = O.value_s
        s && (s.fields.label.text = newValue === eYo.Key.COL_VALUED ? ':=' : '=')
        O.annotated_d.requiredIncog = newValue === eYo.Key.ANNOTATED || newValue === eYo.Key.ANNOTATED_VALUED

        var b = O.target_b // t9k may not yet exist
        if (b) {
          b.eyo.createConsolidator(true) // unique is special
        }
        O.n_ary_s.incog = newValue !== eYo.Key.CALL_EXPR
        if (!O.n_ary_s.incog && (b = O.n_ary_b)) {
          b.eyo.createConsolidator(true)
        }
        O.slicing_s.incog = newValue !== eYo.Key.SLICING
      },
      xml: false
    },
    target: {
      order: 10000, // the name must be quite last, still ?
      main: true,
      init: '',
      placeholder: eYo.Msg.Placeholder.TERM,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.T3.Profile.get(newValue)
        return type === eYo.T3.Profile.void
        || type.raw === eYo.T3.Expr.builtin__name
        || type.expr === eYo.T3.Expr.identifier
        || type.expr === eYo.T3.Expr.parent_module
        || type.expr === eYo.T3.Expr.dotted_name
        ? {validated: newValue} : null
        // return this.getAll().indexOf(newValue) < 0? null : {validated: newValue} // what about the future ?
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        var O = this.owner
        O.updateProfile()
        var item = O.item_p
        if (item) {
          // console.log('p.p5e.item', p.p5e.item.type, p.p5e.item)
          if (item.type === 'method' && O.dotted_p === 0) {
            O.dotted_p = 1
          }
        }
      },
      synchronize: true,
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          if (!this.owner.target_s.unwrappedTarget) {
            this.save(element, opt)
          }
        },
        getAttribute: /** @suppress {globalThis} */ function (element) {
          return element.getAttribute('name')
        } // for old name
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
      init: eYo.T3.Expr.unset,
      noUndo: true,
      xml: false
    },
    ary: {
      order: 20001,
      init: Infinity,
      validate: /** @suppress {globalThis} */ function (newValue) {
        // returns a `Number` or `Infinity`
        var validated
        var item = this.owner.item_p
        if (item) {
          validated = newValue
        } else {
          if (goog.isString(newValue)) {
            if (newValue.length) {
              validated = Math.max(0, Math.floor(Number(newValue)))
            } else {
              validated = Infinity
            }
          } else if (goog.isNumber(newValue)) {
            validated = Math.max(0, Math.floor(newValue))
          }
        }
        return {validated: validated}
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        // First change the ary of the arguments list, then change the ary of the delegate.
        // That way undo events are recorded in the correct order.
        this.didChange(oldValue, newValue)
        var target = this.owner.n_ary_b
        if (target) {
          target.ary_p = newValue
        }
        (newValue < this.owner.mandatory_p) && (this.owner.mandatory_p = newValue)
        if (goog.isDefAndNotNull(newValue)) {
          this.owner.variant_p = eYo.Key.CALL_EXPR
        }
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          if (this.owner.variant_p === eYo.Key.CALL_EXPR && this.get() !== Infinity) {
            var profile = this.owner.profile_p
            if (profile && profile.p5e && (profile.p5e.raw === eYo.T3.Expr.known_identifier)) {
              return
            }
            this.save(element, opt)
          }
        }
      }
    },
    mandatory: {
      order: 20002,
      init: 0,
      validate: /** @suppress {globalThis} */ function (newValue) {
        // returns a `Number` or `0`
        var validated
        var item = this.owner.item_p
        if (item) {
          validated = newValue
        } else {
          if (goog.isString(newValue)) {
            if (newValue.length) {
              validated = Math.max(0, Math.floor(Number(newValue)))
            } else {
              validated = 0
            }
          } else if (goog.isNumber(newValue)) {
            validated = Math.max(0, Math.floor(newValue))
          }
        }
        return {validated: validated}
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        var target = this.owner.n_ary_b
        if (target) {
          target.mandatory_p = newValue
        }
        (newValue > this.owner.ary_p) && (this.owner.ary_p = newValue)
        if (goog.isDefAndNotNull(newValue)) {
          this.owner.variant_p = eYo.Key.CALL_EXPR
        }
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          if (this.owner.profile_p && this.owner.variant_p === eYo.Key.CALL_EXPR && this.get()) {
            var profile = this.owner.profile_p
            if (profile && profile.p5e && (profile.p5e.raw === eYo.T3.Expr.known_identifier)) {
              return
            }
            this.save(element, opt)
          }
        }
      }
    }
  },
  slots: {
    holder: {
      order: 50,
      fields: {
        bind: {
          validate: true,
          endEditing: true
        }
      },
      check: eYo.T3.Expr.Check.primary,
      didDisconnect: /** @suppress {globalThis} */ function (oldTargetM4t) {
        this.brick.updateProfile()
      },
      didConnect: /** @suppress {globalThis} */ function (oldTargetM4t, targetOldM4t) {
        this.brick.updateProfile()
      },
      xml: true
    },
    dotted: {
      order: 75,
      fields: {
        bind: {
          value: '.',
          css: 'reserved',
          separator: true
        }
      }
    },
    target: {
      order: 100,
      wrap: eYo.T3.Expr.target_list,
      xml: {
        accept: /** @suppress {globalThis} */ function (attribute) {
          return attribute === 'targets'
        } // for old name
      },
      plugged: eYo.T3.Expr.primary,
      fields: {
        bind: {
          validate: true,
          endEditing: true,
          variable: true,
          willRender: /** @suppress {globalThis} */ function () {
            this.willRender()
            var O = this.data.owner
            var item = O.item_p
            var reserved = item && item.module && (item.module.name === 'functions' || item.module.name === 'stdtypes' || item.module.name === 'datamodel')
            var d = this.ui_driver
            d && d.fieldMakeReserved(this.field_, reserved)
          }
        }
      },
      accept: /** @suppress {globalThis} */ function (attribute) {
        return attribute === 'name'
      },
      didConnect: /** @suppress {globalThis} */ function (oldTargetM4t, targetOldM4t) {
        // the brick is not yet consolidated
        if (this.isInput) {
          var parent = this.brick.parent
          if (parent) {
            parent.target_s.bindField.setVisible(false)
            if (this.brick.inputList.length > 1) {
              // this is the second brick we connect
              parent.variant_p = eYo.Key.TARGET_VALUED
            } else {
              var v = parent.variant_p
              if (v === eYo.Key.ANNOTATED) {
                var t = this.targetBrick
                if ([eYo.T3.Expr.identifier_annotated,
                  eYo.T3.Expr.augtarget_annotated,
                  eYo.T3.Expr.key_datum].indexOf(t.type) >= 0) {
                  parent.variant_p = eYo.Key.NONE // no 2 annotations
                }
              } else if (v === eYo.Key.ANNOTATED_VALUED) {
                var t = this.targetBrick
                if ([eYo.T3.Expr.identifier_annotated,
                  eYo.T3.Expr.augtarget_annotated,
                  eYo.T3.Expr.key_datum].indexOf(t.type) >= 0) {
                  parent.variant_p = eYo.Key.TARGET_VALUED // no 2 annotations
                }
              }
            }
          }
        }
      },
      didDisconnect: /** @suppress {globalThis} */ function (oldTargetM4t) {
        // the brick is not yet consolidated
        // when there is no connected brick, we display the field
        var parent = this.parent
        if (parent) {
          if (this.brick.inputList.length < 4) { // bad design
            // this is the last brick we disconnected
            parent.target_s.bindField.setVisible(true)
          }
        }
      }
    },
    annotated: {
      order: 102,
      fields: {
        label: {
          value: ':',
          css: 'reserved'
        },
        bind: {
          endEditing: true
        }
      },
      check: eYo.T3.Expr.Check.expression,
      didLoad: /** @suppress {globalThis} */ function () {
        var O = this.owner
        var v = O.variant_p
        if (this.isRequiredFromSaved()) {
          if (v === eYo.Key.TARGET_VALUED) {
            O.variant_p = eYo.Key.ANNOTATED_VALUED
          } else if (v !== eYo.Key.ANNOTATED_VALUED) {
            O.variant_p = eYo.Key.ANNOTATED
          }
        }
      }
    },
    value: {
      order: 501,
      fields: {
        label: {
          value: '=',
          css: 'reserved'
        },
        bind: {
          endEditing: true
        }
      },
      promise: eYo.T3.Expr.value_list,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          if (this.owner.variant_p === eYo.Key.ANNOTATED) {
            this.owner.variant_p = eYo.Key.ANNOTATED_VALUED
          } else if (this.owner.variant_p !== eYo.Key.ANNOTATED_VALUED && this.owner.variant_p !== eYo.Key.TARGET_VALUED && this.owner.variant_p !== eYo.Key.COL_VALUED) {
            this.owner.variant_p = eYo.Key.TARGET_VALUED
          }
        }
      },
      xml: {
        accept: /** @suppress {globalThis} */ function (attribute) {
          return attribute === 'definition'
        } // for old name
      }
    },
    n_ary: {
      order: 1000,
      fields: {
        start: '(',
        end: ')'
      },
      promise: eYo.T3.Expr.argument_list_comprehensive,
      validateIncog: /** @suppress {globalThis} */ function (newValue) {
        return this.owner.variant_p !== eYo.Key.CALL_EXPR
      }
    },
    slicing: {
      order: 2000,
      fields: {
        start: '[',
        end: ']'
      },
      promise: eYo.T3.Expr.slice_list,
      validateIncog: /** @suppress {globalThis} */ function (newValue) {
        return this.owner.variant_p !== eYo.Key.SLICING
      }
    },
    alias: {
      order: 3000,
      fields: {
        label: 'as',
        bind: {
          validate: true,
          endEditing: true,
          variable: true
        }
      },
      validateIncog: /** @suppress {globalThis} */ function (newValue) {
        return this.owner.variant_p !== eYo.Key.ALIASED
      },
      check: [eYo.T3.Expr.identifier, eYo.T3.Expr.unset],
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.ALIASED
        }
      },
      didConnect: /** @suppress {globalThis} */ function (oldTargetM4t, targetOldM4t) {
        this.slot.bindField.setVisible(false)
        this.brick.variant_p = eYo.Key.ALIASED
      },
      didDisconnect: /** @suppress {globalThis} */ function (oldTargetM4t) {
        this.slot.bindField.setVisible(true)
      }
    }
  },
  output: {
    check: /** @suppress {globalThis} */ function (type, subtype) {
      return this.brick.getOutCheck()
    }
  },
  init: /** @suppress {globalThis} */ function () {
    eYo.Brick.Expr.registerPrimary(this)
  },
  deinit: /** @suppress {globalThis} */ function () {
    eYo.Brick.Expr.unregisterPrimary(this)
  },
}, true)

eYo.Do.addProtocol(eYo.Brick.Expr, 'Register', 'primary', function (brick) {
  return !brick.isInFlyout
})

;[
  'call_expr',
  'subscription',
  'slicing',
  'named_call_expr',
  'named_subscription',
  'named_slicing',
  'identifier',
  'attributeref',
  'named_attributeref',
  'dotted_name',
  'parent_module',
  'identifier_valued',
  'key_datum',
  'augtarget_annotated',
  'identifier_annotated',
  'identifier_annotated_valued',
  'identifier_as',
  'dotted_name_as',
  'expression_as',
  'assignment_chain',
  'named_expr'
].forEach(k => {
  eYo.Brick.Expr[k] = eYo.Brick.Expr.primary
  eYo.Brick.Manager.register(k)
})

/**
 * Initialize a brick.
 * Called from brick's init method.
 * This should be called only once.
 * The underlying model is not expected to change while running.
 * @param {!Blockly.Block} brick to be initialized.
 * For subclassers eventually
 */
eYo.Brick.Expr.primary.prototype.init = function () {
  eYo.Brick.Expr.primary.superClass_.init.call(this)
  this.profile_ = undefined
}

Object.defineProperties( eYo.Brick.Expr.primary.prototype, {
  profile_p : {
    get () {
      var p5e = this.getProfile()
      return this.profile_ === p5e
        ? this.profile_
        : (this.profile_ = p5e) // this should never happen
    },
    set (newValue) {
      this.profile_ = newValue
    }
  },
  item_p : {
    get () {
      var p5e = this.profile_p.p5e
      return p5e && p5e.item
    }
  }
})

/**
 * updateProfile.
 */
eYo.Brick.Expr.primary.prototype.updateProfile = eYo.Decorate.reentrant_method(
  'updateProfile',
  function () {
    ++this.change.count
    var p5e = this.profile_p.p5e
    this.subtype_p = p5e && p5e.raw
    var item = p5e && p5e.item
    if (item) {
      this.ary_p = item.aryMax
      this.mandatory_p = item.mandatoryMin
    } else {
      this.ary_p = Infinity
      this.mandatory_p = 0
    }
  }
)

/**
 * getProfile.
 * What are the types of holder and name?
 * Problem : this is not deep!
 * This has not been tested despite it is essential.
 * @return {!Object}.
 */
eYo.Brick.Expr.primary.prototype.getProfile = eYo.Decorate.onChangeCount(
  'getProfile',
  function () {
      // this may be called very very early when
      // neither `data` nor `slots` may exist yet
    if (this.data && this.slots) {
      var ans = {
        dotted: this.dotted_p,
        variant: this.variant_p,
        _defined: !this.value_d.isNone(), // unused, to be removed ?
        _annotated: !this.annotated_d.isNone(), // unused, to be removed ?
      }
      var t9k, p5e
      var type
      // if the `target` slot is connected.
      if (this.target_b && this.target_b.inputList.length > 3) {
        type = eYo.T3.Expr.assignment_chain
        ans.name = {
          type: type,
          slot: type
        }
      } else if ((t9k = this.target_s.unwrappedTarget)) {
        var check
        if (t9k.checkOutputType(eYo.T3.Expr.identifier)) {
          type = eYo.T3.Expr.identifier
        } else if (t9k.checkOutputType(eYo.T3.Expr.dotted_name)) {
          type = eYo.T3.Expr.dotted_name
        } else if (t9k.checkOutputType(eYo.T3.Expr.parent_module)) {
          type = eYo.T3.Expr.parent_module
        } else if (t9k.checkOutputType(eYo.T3.Expr.named_attributeref)) {
          type = eYo.T3.Expr.named_attributeref
        } else if (t9k.checkOutputType(eYo.T3.Expr.Check.augtarget)) {
          type = eYo.T3.Expr.augtarget
        } else if (t9k.checkOutputType(eYo.T3.Expr.Check.named_primary)) {
          type = eYo.T3.Expr.named_primary
          check = eYo.T3.Expr.Check.named_primary
        } else if (t9k.checkOutputType(eYo.T3.Expr.Check.primary)) {
          type = eYo.T3.Expr.primary
          check = eYo.T3.Expr.Check.primary
        } else if (t9k.checkOutputType(eYo.T3.Expr.Check.expression)) {
          type = eYo.T3.Expr.expression
        } else {
          type = eYo.T3.Expr.error // this brick should not be connected
        }
        ans.name = {
          type: type,
          check: check,
          slot: type
        }
        var p = t9k.profile_p
        if (p) {
          ans.identifier = p.identifier
          ans.module = p.module
        }
        // a target brick with no profile... bad luck
      } else {
        p5e = eYo.T3.Profile.get(this.target_p, null)
        type = p5e.expr
        ans.name = {
          type: type,
          field: type
        }
        ans.identifier = p5e.name
        ans.module = p5e.holder
      }
      if (ans.dotted === 1) {
        if ((t9k = this.holder_b)) {
          if (t9k.checkOutputType(eYo.T3.Expr.identifier)) {
            type = eYo.T3.Expr.identifier
          } else if (t9k.checkOutputType(eYo.T3.Expr.dotted_name)) {
            type = eYo.T3.Expr.dotted_name
          } else if (t9k.checkOutputType(eYo.T3.Expr.parent_module)) {
            type = eYo.T3.Expr.parent_module
          } else if (t9k.checkOutputType(eYo.T3.Expr.Check.augtarget)) {
            type = eYo.T3.Expr.augtarget
          } else if (t9k.checkOutputType(eYo.T3.Expr.Check.named_primary)) {
            type = eYo.T3.Expr.named_primary
          } else if (t9k.checkOutputType(eYo.T3.Expr.Check.primary)) {
            type = eYo.T3.Expr.primary
          } else {
            type = eYo.T3.Expr.error // this brick should not be connected
          }
          ans.holder = {
            type: type,
            slot: type,
            target: t9k
          }
          p = t9k.profile_p
          if (p) {
            var base = p.module
              ? p.module + '.' + p.identifier
              : p.identifier
            base && (
              ans.module = ans.module
                ? base + '.' + ans.module
                : base
            )
            ans.holder.profile = p
          }
        } else {
          base = this.holder_p
          p5e = eYo.T3.Profile.get(base)
          type = p5e.expr
          ans.holder = {
            type: type,
            field: type
          }
          base && (
            ans.module = ans.module
              ? base + '.' + ans.module
              : base
          )
        }
      } else {
        ans.holder = {}
      }
      ans.identifier && (ans.p5e = eYo.T3.Profile.get(ans.identifier, ans.module))
      return {
        ans: ans
      }
    }
    return {
      ans: {
        name: {},
        holder: {}
      }
    }
  }
)

/**
 * Set the connection check array.
 * The connections are supposed to be configured once.
 * This method may disconnect bricks as side effect,
 * thus interacting with the undo manager.
 * After initialization, this should be called whenever
 * the brick type has changed.
 */
eYo.Brick.Expr.primary.prototype.consolidateMagnets = function () {
  eYo.Brick.Expr.primary.superClass_.consolidateMagnets.call(this)
  this.target_s.connection.setHidden(this.variant_p === eYo.Key.NONE && this.dotted_p === 0)
}

/**
 * getBaseType.
 * The type depends on the variant and the modifiers.
 * As side effect, the subtype is set.
 */
eYo.Brick.Expr.primary.prototype.getBaseType = function () {
  var check = this.getOutCheck()
  if (!check.length) {
    console.error('BIG PROBLEM', this.getOutCheck())
  }
  if (!check[0]) {
    console.error('BIG PROBLEM BIS', this.getOutCheck())
  }
  return check[0]
}

/**
 * getOutCheck.
 * The check_ array of the output connection.
 */
eYo.Brick.Expr.primary.prototype.getOutCheck = function () {
  var f = function () {
  // there is no validation here
  // simple cases first, variant based
  var profile = this.profile_p
  if (!profile) {
    console.warn('NO PROFILE, is it normal?')
    this.incrementChangeCount()
    profile = this.profile_p
    if (!profile) {
      console.error('NO PROFILE')
    }
  }
  if (!profile.name) {
    console.error('NO NAME')
    this.incrementChangeCount()
    this.getProfile()
  }

  var named = () => {
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
    // is it a slicing or a subscription ?
    if (!eYo.T3.Expr.Check.slice_only) {
      eYo.T3.Expr.Check.slice_only = eYo.T3.Expr.Check.slice_list.filter(i => eYo.T3.Expr.Check.expression.indexOf(i) < 0)
    }
    if (this.someInput(input => {
      var t = input.targetBrick
      return t && t.checkOutputType(eYo.T3.Expr.Check.slice_only)
    })) {
      return named()
      ? [
        eYo.T3.Expr.named_slicing,
        eYo.T3.Expr.slicing
      ]
      : [
        eYo.T3.Expr.slicing
      ]
    } else {
      return named()
      ? [
        eYo.T3.Expr.named_subscription,
        eYo.T3.Expr.named_slicing,
        eYo.T3.Expr.subscription,
        eYo.T3.Expr.slicing
      ]
      : [
        eYo.T3.Expr.subscription,
        eYo.T3.Expr.slicing
      ]
    }
  } else if (profile.variant === eYo.Key.ALIASED) {
    if (profile.name.type === eYo.T3.Expr.identifier
    || profile.name.type === eYo.T3.Expr.unset) {
      if (profile.holder) {
        if (profile.holder.type === eYo.T3.Expr.unset) {
          return [
            eYo.T3.Expr.identifier_as,
            eYo.T3.Expr.dotted_name_as,
            eYo.T3.Expr.expression_as
          ]
        } else if (profile.holder.type === eYo.T3.Expr.identifier
          || profile.holder.type === eYo.T3.Expr.dotted_name) {
          return [
            eYo.T3.Expr.dotted_name_as,
            eYo.T3.Expr.expression_as
          ]
        } else if (profile.holder.type) {
          return [
            eYo.T3.Expr.expression_as
          ]
        }
      }
      return [
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
  } else if (profile.variant === eYo.Key.ANNOTATED) {
    return profile.name.type === eYo.T3.Expr.identifier || profile.name.type === eYo.T3.Expr.unset
      ? [
        eYo.T3.Expr.identifier_annotated,
        eYo.T3.Expr.augtarget_annotated,
        eYo.T3.Expr.key_datum
      ]
      : profile.name.type === eYo.T3.Expr.dotted_name
      || profile.name.type === eYo.T3.Expr.augtarget
        ? [
          eYo.T3.Expr.augtarget_annotated,
          eYo.T3.Expr.key_datum
        ]
        : [
          eYo.T3.Expr.key_datum
        ]
  } else if (profile.variant === eYo.Key.COL_VALUED) {
    return [
      eYo.T3.Expr.named_expr
    ]
  } else if (profile.variant === eYo.Key.TARGET_VALUED) {
    // Is the target connected to something that is not an identifier ?
    if (this.target_b.inputList.length > 3) {
      return [eYo.T3.Expr.assignment_chain]
    }
    if (this.target_b.inputList.length > 1) {
      // only one connected input
      var eyo = this.target_s.unwrappedTarget
      if (eyo && eyo.type !== eYo.T3.Expr.identifier) {
        return [eYo.T3.Expr.assignment_chain]
      }
    }
    // if the first value is connected to a `… = …`
    var eyo = this.value_s.unwrappedTarget
    if (eyo && [
      eYo.T3.Expr.identifier_valued,
      eYo.T3.Expr.assignment_chain
    ].indexOf(eyo.type) >= 0) {
      return [
        eYo.T3.Expr.assignment_chain
      ]
    }
    // if the parent is a value_list
    if ((eyo = this.output)) {
      if (eyo.type === eYo.T3.Expr.value_list || eyo.type === eYo.T3.Expr.value_list) {
        return [
          eYo.T3.Expr.assignment_chain
        ]
      }
    }
    return [
      eYo.T3.Expr.identifier_valued,
      eYo.T3.Expr.assignment_chain
    ]
  } else if (profile.variant === eYo.Key.ANNOTATED_VALUED) {
    return [
      eYo.T3.Expr.identifier_annotated_valued
    ]
  }
  // if this is just a wrapper, forwards the check array
  if (!profile.dotted) {
    return profile.name.target
      ? profile.name.target.magnets.output.check_
      : profile.name.type === eYo.T3.Expr.unset
        ? [
          eYo.T3.Expr.identifier
        ]
        : profile.name.check || [
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
  var ans = f.call(this)
  if (!ans.length || ! ans[0]) {
    ans = f.call(this)
  }
  return ans
}

/**
 * The subtype depends on the variant and the modifiers.
 * Set by getType as side effect.
 */
eYo.Brick.Expr.primary.prototype.getSubtype = function () {
  this.getType()
  return this.subtype_p
}

/**
 * Fetches the named input object, getInput.
 * This is not a very strong design but it should work, I guess.
 * @param {!Block} brick
 * @param {String} name The name of the input.
 * @param {?Boolean} dontCreate Whether the receiver should create inputs on the fly.
 * @return {eYo.Input} The input object, or null if input does not exist or undefined for the default brick implementation.
 */
eYo.Brick.Expr.primary.prototype.getInput = function (name) {
  var input = eYo.Brick.Expr.primary.superClass_.getInput.call(this, name)
  if (!input) {
    // we suppose that ary is set
    var f = (slot) => {
      if (!slot.incog) {
        var input = slot.input
        if (input) {
          var t9k = slot.targetBrick
          if (t9k && (input = t9k.getInput(name))) {
            return input
          }
        }
      }
    }
    input = f(this.n_ary_s) || f(this.slicing_s)
  }
  return input
}

/**
 * Class for a Delegate, base call statement brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.Stmt.makeSubclass('pre_call_stmt', {
  link: eYo.T3.Expr.primary
}, eYo.Brick.Stmt)

/**
 * Class for a Delegate, base call statement brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.Stmt.pre_call_stmt.makeSubclass('call_stmt', {
  data: {
    variant: {
      init: eYo.Key.CALL_EXPR,
      validate: function (newValue) {
        return {validated: eYo.Key.CALL_EXPR}
      }
    }
  }
}, eYo.Brick.Stmt, true)

Object.defineProperties( eYo.Brick.Stmt.call_stmt.prototype, {
  profile_p : {
    get () {
      return this.profile_ === this.getProfile()
        ? this.profile_
        : (this.profile_ = this.getProfile()) // this should never happen
    },
    set (newValue) {
      this.profile_ = newValue
    }
  },
  item_p : {
    get () {
      var p5e = this.profile_p.p5e
      return p5e && p5e.item
    }
  }
})

/**
 * Class for a Delegate, call statement brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.Stmt.makeSubclass('base_call_stmt', {
  link: eYo.T3.Expr.primary
}, eYo.Brick.Stmt, true)

eYo.Brick.Stmt.base_call_stmt.prototype.updateProfile = eYo.Brick.Expr.primary.prototype.updateProfile

eYo.Brick.Stmt.base_call_stmt.prototype.getProfile = eYo.Brick.Expr.primary.prototype.getProfile


/**
 * Initialize a brick.
 * Called from brick's init method.
 * This should be called only once.
 * The underlying model is not expected to change while running.
 * @param {!Blockly.Block} brick to be initialized.
 * For subclassers eventually
 */
eYo.Brick.Stmt.base_call_stmt.prototype.init = function () {
  eYo.Brick.Stmt.base_call_stmt.superClass_.init.call(this)
  this.profile_p = undefined
}

Object.defineProperties(eYo.Brick.Stmt.base_call_stmt.prototype, {
  profile_p: {
    get () {
      return this.profile_ === this.getProfile()
        ? this.profile_
        : (this.profile_ = this.getProfile()) // this should never happen
    },
    set (newValue) {
      this.profile_ = newValue
    }
  },
  item_p: {
    get () {
      var p5e = this.profile_p.p5e
      return p5e && p5e.item
    }
  }
})

/**
 * Class for a Delegate, call statement brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.Stmt.base_call_stmt.makeSubclass('call_stmt', {
}, true)

eYo.Brick.Expr.primary.T3s = [
  eYo.T3.Expr.primary,
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.attributeref,
  eYo.T3.Expr.slicing,
  eYo.T3.Expr.subscription,
  eYo.T3.Expr.call_expr,
  eYo.T3.Stmt.call_stmt
]

/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Bricks for edython, primary bricks.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('expr.List')

eYo.require('changer')

eYo.require('module.stdtypes')
eYo.require('module.functions')

eYo.require('msg')

/**
 * @name{eYo.consolidator.Target}
 * @constructor
 * List consolidator for assignment target list. Used in primary, only.
 * There are different situations depending on the type of the
 * brick enclosing the list.
 * Main entry: consolidate
 * @param {String} single - the required type for a single element....
 */
eYo.consolidator.List[eYo.$newSubC9r]('Target', {
  list: {
    check: null,
    mandatory: 1,
    presep: ',',
    /**
     * Augmented assignments, annotated assignment and expressions,
     * except assignment chain, must take only one target.
     * @param {Object} io input/output parameter
     */
    makeUnique (io) /** @suppress {globalThis} */ {
      // types with no unique element
      if ([
        eYo.t3.stmt.expression_stmt,
        eYo.t3.stmt.assignment_stmt,
        eYo.t3.stmt.for_part,
        eYo.t3.stmt.del_stmt,
        eYo.t3.expr.dict_comprehension,
        eYo.t3.expr.comprehension,
        eYo.t3.expr.comp_for,
        eYo.t3.expr.assignment_chain,
      ].indexOf(io.subtype) >= 0) {
        return false
      }
      // types with unique elements
      if ([
        eYo.t3.stmt.annotated_stmt,
        eYo.t3.stmt.annotated_assignment_stmt,
        eYo.t3.stmt.augmented_assignment_stmt,
        eYo.t3.expr.identifier,
        eYo.t3.expr.identifier_annotated,
        eYo.t3.expr.augtarget_annotated,
        eYo.t3.expr.key_datum,
        eYo.t3.expr.identifier_valued,
        eYo.t3.expr.named_expr,
        eYo.t3.expr.identifier_annotated_valued,
        eYo.t3.expr.attributeref,
        eYo.t3.expr.named_attributeref,
        eYo.t3.expr.dotted_name,
        eYo.t3.expr.parent_module,
        eYo.t3.expr.identifier_as,
        eYo.t3.expr.dotted_name_as,
        eYo.t3.expr.expression_as,
        eYo.t3.expr.subscription,
        eYo.t3.expr.named_subscription,
        eYo.t3.expr.slicing,
        eYo.t3.expr.named_slicing,
        eYo.t3.expr.call_expr,
        eYo.t3.expr.named_call_expr,
      ].indexOf(io.subtype) >= 0) {
        return true
      }
      // this.makeUnique(io) used when there is a `unique` check
    },
  },
})

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {eYo.brick.BaseC9r} brick - owner or the receiver.
 */
eYo.consolidator.Target_p.getIO = function (brick) {
  var io = eYo.consolidator.Target[eYo.$].C9r_s.getIO.call(this, brick)
  io.first_starred = io.last = io.max = -1
  io.annotatedInput = eYo.NA
  io.subtype = brick.subtype
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
eYo.consolidator.Target_p.doCleanup = (() => {
  // preparation: walk through the list of inputs and
  // find the first_starred input
  var Type = {
    UNCONNECTED: 0,
    STARRED: 1,
    OTHER: 2
  }
  /**
   * Whether the input corresponds to an identifier...
   * Called when io.slot is connected.
   * @param {Object} io - parameters....
   */
  var getCheckType = (io) => {
    var m4t = io.m4t.target
    if (!m4t) {
      return Type.UNCONNECTED
    }
    var check = m4t.check_
    if (check) {
      if (eYo.do.arrayContains(check, eYo.t3.expr.target_star)) {
        return Type.STARRED
      } else {
        if (!io.annotatedInput
          && (eYo.do.arrayContains(check, eYo.t3.expr.identifier_annotated)
          || eYo.do.arrayContains(check, eYo.t3.expr.augtarget_annotated)
          || eYo.do.arrayContains(check, eYo.t3.expr.key_datum))) {
          io.annotatedInput = io.slot
        }
        return Type.OTHER
      }
    } else {
      return Type.OTHER
    }
  }
  var setupFirst = function (io) {
    io.first_starred = io.last = -1
    io.annotatedInput = eYo.NA
    this.setupIO(io, 0)
    while (io.slot) {
      if ((io.slot.parameter_type_ = getCheckType(io)) === Type.STARRED) {
        if (io.first_starred < 0) {
          io.first_starred = io.i
        }
      } else if (io.slot.parameter_type_ === Type.OTHER) {
        io.last = io.i
      }
      this.nextSlot(io)
    }
  }
  return function (io) {
    eYo.consolidator.Target[eYo.$].C9r_s.doCleanup.call(this, io)
    setupFirst.call(this, io)
    if (io.first_starred >= 0) {
      // ther must be only one starred
      this.setupIO(io, io.first_starred + 2)
      while (io.slot) {
        if (io.slot.parameter_type_ === Type.STARRED) {
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
 * @param {Object} io parameter.
 */
eYo.consolidator.Target_p.getCheck = (() => {
  var f = io => {
    if (io.i === io.unique) {
      // all subtypes with `unique` elements
      return {
        [eYo.t3.stmt.annotated_stmt]: eYo.t3.expr.check.target_annotated,
        [eYo.t3.stmt.annotated_assignment_stmt]: eYo.t3.expr.check.target_annotated,
        [eYo.t3.stmt.augmented_assignment_stmt]: eYo.t3.expr.check.augtarget,
        [eYo.t3.expr.identifier]: eYo.t3.expr.check.expression,
        [eYo.t3.expr.identifier_annotated]: eYo.t3.expr.check.expression,
        [eYo.t3.expr.augtarget_annotated]: eYo.t3.expr.check.augtarget,
        [eYo.t3.expr.key_datum]: eYo.t3.expr.check.expression,
        [eYo.t3.expr.identifier_valued]: eYo.t3.expr.check.expression,
        [eYo.t3.expr.named_expr]: eYo.t3.expr.check.expression,
        [eYo.t3.expr.identifier_annotated_valued]: eYo.t3.expr.check.target,
        [eYo.t3.expr.attributeref]: eYo.t3.expr.check.expression,
        [eYo.t3.expr.named_attributeref]: eYo.t3.expr.check.expression,
        [eYo.t3.expr.dotted_name]: eYo.t3.expr.identifier,
        [eYo.t3.expr.parent_module]: eYo.t3.expr.identifier,
        [eYo.t3.expr.identifier_as]: eYo.t3.expr.identifier,
        [eYo.t3.expr.dotted_name_as]: eYo.t3.expr.identifier,
        [eYo.t3.expr.expression_as]: eYo.t3.expr.check.expression,
        [eYo.t3.expr.subscription]: eYo.t3.expr.check.expression,
        [eYo.t3.expr.named_subscription]: eYo.t3.expr.check.expression,
        [eYo.t3.expr.slicing]: eYo.t3.expr.check.expression,
        [eYo.t3.expr.named_slicing]: eYo.t3.expr.check.expression,
        [eYo.t3.expr.call_expr]: eYo.t3.expr.check.expression,
        [eYo.t3.expr.named_call_expr]: eYo.t3.expr.check.expression,
      } [io.subtype] || eYo.t3.expr.check.target
    }
    if (io.i === 1 && io.list.length === 3) {
      return eYo.t3.expr.check.target
    }
    if (io.i === 0 && io.list.length === 1) {
      return eYo.t3.expr.check.target
    }
    if (io.first_starred < 0 || io.i === io.first_starred) {
      return eYo.t3.expr.check.target
    } else {
      return eYo.t3.expr.check.target_unstar
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
eYo.consolidator.Target_p.doFinalize = function (io) {
  eYo.consolidator.Target[eYo.$].C9r_s.doFinalize.call(this, io)
  if (this.setupIO(io, 0)) {
    do {
      io.m4t.incog = io.annotatedInput && io.annotatedInput !== io.slot // will ensure that there is only one annotated input
    } while (this.nextSlot(io))
  }
}

/**
 * Class for a Delegate, target_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
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
 * @name {eYo.expr.target_list}
 * @constructor
 */
eYo.expr.List[eYo.$newSubC9r]('target_list', {
  list: {
    consolidator: eYo.consolidator.Target
  }
})

/**
 * The subtype is the type of the enclosing brick.
 * @return {String} The subtype of the receiver's brick.
 */
eYo.expr.target_list_p.getSubtype = function () {
  var parent = this.parent
  return parent && parent.type
}

/**
 * Did disconnect this brick's connection from another connection.
 * @param {eYo.magnet.BaseC9r} m4t
 * @param {eYo.magnet.BaseC9r} oldTargetM4t that was connected to blockConnection
 */
eYo.expr.target_list_p.xdidDisconnect = function (m4t, oldTargetM4t) {
  if (m4t.isSlot) {
    var other = false
    if (this.slotSome(slot => {
      if (slot.magnet) {
        var t9k = slot.targetBrick
        if (t9k) {
          other= true
          if ([eYo.t3.expr.identifier_annotated,
            eYo.t3.expr.augtarget_annotated,
            eYo.t3.expr.key_datum].indexOf(t9k.type) >= 0) {
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
        if (x.variant === eYo.key.ANNOTATED || x.variant === eYo.key.ANNOTATED_VALUED) {
          x.variant_ = eYo.key.TARGET_VALUED
        }
        return
      }
      ;(x = x.target_s) && (x.boundField.visible = true)
    }
  }
  eYo.expr.target_list.eyo.C9r_s.didDisconnect.call(this, m4t, oldTargetM4t)
}

/**
 * Hook.
 * If more that 2 bricks are connected, the variant is target_valued.
 * @param {eYo.magnet.BaseC9r} m4t.
 * @param {eYo.magnet.BaseC9r} oldTargetM4t.
 * @param {eYo.magnet.BaseC9r} targetOldM4t
 */
eYo.expr.target_list_p.xdidConnect = function (m4t, oldTargetM4t, targetOldM4t) {
  eYo.expr.target_list.eyo.C9r_s.didConnect.call(this, m4t, oldTargetM4t, targetOldM4t)
  // BEWARE: the brick is NOT consolidated
  if (m4t.isSlot) {
    var parent = this.parent
    if (parent) {
      parent.target_s.boundField.visible = false
      if (Object.keys(this.slots).length > 1) {
        // this is the second brick we connect
        parent.variant_ = eYo.key.TARGET_VALUED
      } else {
        var v = parent.Variant_p
        if (v === eYo.key.ANNOTATED) {
          var t9k = m4t.targetBrick
          if ([eYo.t3.expr.identifier_annotated,
            eYo.t3.expr.augtarget_annotated,
            eYo.t3.expr.key_datum].indexOf(t9k.type) >= 0) {
            parent.variant_ = eYo.key.NONE // no 2 annotations
          }
        } else if (v === eYo.key.ANNOTATED_VALUED) {
          var t9k = m4t.targetBrick
          if ([eYo.t3.expr.identifier_annotated,
            eYo.t3.expr.augtarget_annotated,
            eYo.t3.expr.key_datum].indexOf(t9k.type) >= 0) {
            parent.variant_ = eYo.key.TARGET_VALUED // no 2 annotations
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
eYo.expr.newC9r('primary', {
  xml: {
    types: [
      eYo.t3.expr.identifier,
      eYo.t3.expr.identifier_annotated,
      eYo.t3.expr.augtarget_annotated,
      eYo.t3.expr.key_datum,
      eYo.t3.expr.identifier_valued,
      eYo.t3.expr.assignment_chain,
      eYo.t3.expr.named_expr,
      eYo.t3.expr.identifier_annotated_valued,
      eYo.t3.expr.attributeref,
      eYo.t3.expr.named_attributeref,
      eYo.t3.expr.dotted_name,
      eYo.t3.expr.parent_module,
      eYo.t3.expr.identifier_as,
      eYo.t3.expr.dotted_name_as,
      eYo.t3.expr.expression_as,
      eYo.t3.expr.subscription,
      eYo.t3.expr.named_subscription,
      eYo.t3.expr.slicing,
      eYo.t3.expr.named_slicing,
      eYo.t3.expr.call_expr,
      eYo.t3.expr.named_call_expr
    ]
  },
  data: {
    dotted: {
      order: 200,
      init: 0,
      validate (after) /** @suppress {globalThis} */ {
        var validated
        if (eYo.isStr(after)) {
          if (after.length) {
            validated = Math.max(0, Math.floor(Number(after)))
          } else {
            validated = Infinity
          }
        } else if (eYo.isNum(after)) {
          validated = Math.max(0, Math.floor(after))
        }
        return eYo.isDef(validated)
        ? validated
        : eYo.INVALID
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        this.requiredIncog_ = after > 0
        var b3k = this.brick
        b3k.holder_d.requiredIncog_ = after === 1
        b3k.updateProfile()
        b3k.target_s.boundField.optional_ = after > 0
      },
      fromType (type) /** @suppress {globalThis} */ {
        var p = this.brick.profile
        var item = p.p5e && p.p5e.item
        if (item) {
          if (item.type === 'method') {
            this.doChange(1)
            return
          }
        }
        if (type === eYo.t3.expr.attributeref || type === eYo.t3.expr.named_attributeref || type === eYo.t3.expr.dotted_name_as || type === eYo.t3.expr.dotted_name || type === eYo.t3.expr.parent_module) {
          this.doChange(1)
        }
      },
      fromField (builtin, value) /** @suppress {globalThis} */ {
        builtin(value.length)
      },
      toField (value) /** @suppress {globalThis} */ {
        var txt = ''
        for (var i = 0; (i < this.get()); i++) {
          txt += '.'
        }
        return txt
      },
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          if (this.get() || eYo.isDef(this.model.placeholder)) {
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
      placeholder: eYo.msg.placeholder.UNSET,
      validate (after) /** @suppress {globalThis} */ {
        var p5e = eYo.t3.profile.get(after, null)
        return !after
        || p5e.expr === eYo.t3.expr.unset
        || p5e.expr === eYo.t3.expr.identifier
        || p5e.expr === eYo.t3.expr.builtin__name
        || p5e.expr === eYo.t3.expr.dotted_name
        || p5e.expr === eYo.t3.expr.attributeref
        || p5e.expr === eYo.t3.expr.parent_module
        ? after: eYo.INVALID
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        // first change the dotted data to unincog the holder
        var b3k = this.brick
        if (after) {
          b3k.Dotted_p = 1
        }
        builtin()
        b3k.updateProfile()
      },
      xml: {
        force () /** @suppress {globalThis} */ {
          return this.brick.variant === eYo.key.CALL_EXPR
        },
        save (element, opt) /** @suppress {globalThis} */ {
          if (!this.brick.holder_b) {
            if (this.get()) {
              this.save(element, opt)
            }
            var v = eYo.do.valueOf(this.model.placeholder)
            v = v && (v.toString().trim())
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
      placeholder: eYo.msg.placeholder.ALIAS,
      synchronize: true,
      validate (after) /** @suppress {globalThis} */ {
        var type = eYo.t3.profile.get(after).expr
        return type === eYo.t3.expr.unset
        || type === eYo.t3.expr.identifier
        || type === eYo.t3.expr.builtin__name
        ? after
        : eYo.INVALID
      },
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required_from_model = this.brick.variant === eYo.key.ALIASED
          this.save(element, opt)
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          this.brick.variant_ = eYo.key.ALIASED
        }
      },
      didChange (after) /** @suppress {globalThis} */ {
        if (after) {
          this.brick.variant_ = eYo.key.ALIASED
        }
      }
    }, // new
    annotated: {
      order: 1000,
      init: '',
      placeholder: eYo.msg.placeholder.EXPR,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          var v = this.brick.Variant_p
          if (v === eYo.key.ANNOTATED || v === eYo.key.ANNOTATED_VALUED) {
            this.required_from_model = true
            this.save(element, opt)
          }
        }
      },
      didLoad (element) /** @suppress {globalThis} */ {
        var b3k = this.brick
        var v = b3k.Variant_p
        if (this.required_from_saved) {
          if (v === eYo.key.TARGET_VALUED) {
            b3k.variant_ = eYo.key.ANNOTATED_VALUED
          } else if (v !== eYo.key.ANNOTATED_VALUED) {
            b3k.variant_ = eYo.key.ANNOTATED
          }
        } else {
          if (v === eYo.key.ANNOTATED_VALUED) {
            b3k.variant_ = eYo.key.TARGET_VALUED
          } else if (v === eYo.key.ANNOTATED) {
            b3k.variant_ = eYo.key.NONE
          }
        }
      },
      synchronize: true,
      validateIncog () /** @suppress {globalThis} */ {
        var v = this.brick.Variant_p
        return v !== eYo.key.ANNOTATED && v !== eYo.key.ANNOTATED_VALUED
      },
      didChange (after) /** @suppress {globalThis} */ {
        if (after) {
          var b3k = this.brick
          b3k.variant_ = b3k.Value_p || b3k.value_s.unwrappedTarget
          ? eYo.key.ANNOTATED_VALUED
          : eYo.key.ANNOTATED
        }
      }
    },
    value: {
      order: 1001,
      init: '',
      placeholder: eYo.msg.placeholder.EXPRESSION,
      validate: false,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          var v = this.brick.Variant_p
          if (v === eYo.key.TARGET_VALUED || v === eYo.key.ANNOTATED_VALUED) {
            this.required_from_model = false
            this.save(element, opt)
          }
        },
        getAttribute (element) /** @suppress {globalThis} */ {
          return element.getAttribute('definition') // 'value' was named 'definition' prior to 0.2.x
        }
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
         if (after === eYo.key.NONE) {
           console.error('UNEXPECTED')
         }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          var b3k = this.brick
          var v = b3k.Variant_p
          if (v === eYo.key.ANNOTATED) {
            b3k.variant_ = eYo.key.ANNOTATED_VALUED
          } else if (v !== eYo.key.TARGET_VALUED && v !== eYo.key.ANNOTATED_VALUED && v !== eYo.key.COL_VALUED) {
            b3k.variant_ = eYo.key.TARGET_VALUED
          }
        }
      },
      synchronize: true,
      validateIncog () /** @suppress {globalThis} */ {
        var v = this.brick.Variant_p
        return v !== eYo.key.TARGET_VALUED && v !== eYo.key.ANNOTATED_VALUED && v !== eYo.key.TARGET_VALUED && v !== eYo.key.COL_VALUED
      }
    },
    variant: {
      order: 2000,
      all: [
        eYo.key.NONE, // identifier alone
        eYo.key.CALL_EXPR, // foo(…)
        eYo.key.SLICING, // foo[…]
        eYo.key.ALIASED, // foo as bar
        eYo.key.ANNOTATED, // foo : bar
        eYo.key.ANNOTATED_VALUED, // foo : bar = …
        eYo.key.TARGET_VALUED, // foo(, foo2) = bar
        eYo.key.COL_VALUED, // foo := bar
      ],
      init: eYo.key.NONE,
      isChanging (builtin) /** @suppress {globalThis} */ {
        this.brick.consolidateType()
        this.brick.consolidateMagnets()
        builtin()
      },
      fromType (type) /** @suppress {globalThis} */ {
        var b3k = this.brick
        b3k.annotated_d.required_from_type_ = false
        b3k.value_d.required_from_type_ = false
        if (type === eYo.t3.expr.call_expr ||
            type === eYo.t3.expr.named_call_expr ||
            type === eYo.t3.stmt.call_stmt) {
          this.doChange(eYo.key.CALL_EXPR)
        } else if (type === eYo.t3.expr.slicing ||
            type === eYo.t3.expr.named_slicing ||
            type === eYo.t3.expr.subscription ||
            type === eYo.t3.expr.named_subscription) {
          this.doChange(eYo.key.SLICING)
        } else if (type === eYo.t3.expr.dotted_name_as ||
            type === eYo.t3.expr.identifier_as ||
            type === eYo.t3.expr.expression_as) {
          this.doChange(eYo.key.ALIASED)
        } else if (type === eYo.t3.expr.identifier_annotated ||
          type === eYo.t3.expr.augtarget_annotated ||
          type === eYo.t3.expr.key_datum) {
          this.doChange(eYo.key.ANNOTATED)
          b3k.annotated_d.required_from_type_ = true
        } else if (type === eYo.t3.expr.identifier_valued ||
            type === eYo.t3.expr.assignment_chain) {
          this.doChange(eYo.key.TARGET_VALUED)
          b3k.value_d.required_from_type_ = true
        } else if (type === eYo.t3.expr.identifier_annotated_valued) {
          this.doChange(eYo.key.ANNOTATED_VALUED)
          b3k.annotated_d.required_from_type_ = true
          b3k.value_d.required_from_type_ = true
        } else if (type === eYo.t3.expr.named_expr) {
          this.doChange(eYo.key.COL_VALUED)
          b3k.value_d.required_from_type_ = true
        } else {
          this.doChange(eYo.key.NONE)
        }
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.alias_d.requiredIncog_ = after === eYo.key.ALIASED
        b3k.value_d.requiredIncog_ = after === eYo.key.TARGET_VALUED || after === eYo.key.ANNOTATED_VALUED || after === eYo.key.COL_VALUED
        var s = b3k.value_s
        s && (s.label_f.text = after === eYo.key.COL_VALUED ? ':=' : '=')
        b3k.annotated_d.requiredIncog_ = after === eYo.key.ANNOTATED || after === eYo.key.ANNOTATED_VALUED

        var b = b3k.target_b // t9k may not yet exist
        if (b) {
          b.createConsolidator(true) // unique is special
        }
        b3k.n_ary_s.incog = after !== eYo.key.CALL_EXPR
        if (!b3k.n_ary_s.incog && (b = b3k.n_ary_b)) {
          b.createConsolidator(true)
        }
        b3k.slicing_s.incog = after !== eYo.key.SLICING
      },
      xml: false
    },
    target: {
      order: 10000, // the name must be quite last, still ?
      main: true,
      init: '',
      placeholder: eYo.msg.placeholder.TERM,
      validate (after) /** @suppress {globalThis} */ {
        var type = eYo.t3.profile.get(after)
        return type === eYo.t3.profile.void
        || type.raw === eYo.t3.expr.builtin__name
        || type.expr === eYo.t3.expr.identifier
        || type.expr === eYo.t3.expr.parent_module
        || type.expr === eYo.t3.expr.dotted_name
        ? after: eYo.INVALID
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.updateProfile()
        var item = b3k.item
        if (item) {
          // console.log('p.p5e.item', p.p5e.item.type, p.p5e.item)
          if (item.type === 'method' && b3k.Dotted_p === 0) {
            b3k.Dotted_p = 1
          }
        }
      },
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          if (!this.brick.target_s.unwrappedTarget) {
            this.save(element, opt)
          }
        },
        getAttribute (element) /** @suppress {globalThis} */ {
          return element.getAttribute('name')
        } // for old name
      }
    },
    subtype: {
      order: 10001,
      all: [
        eYo.t3.expr.unset,
        eYo.t3.expr.custom_identifier,
        eYo.t3.expr.custom_dotted_name,
        eYo.t3.expr.custom_parent_module
      ],
      init: eYo.t3.expr.unset,
      noUndo: true,
      xml: false
    },
    ary: {
      order: 20001,
      init: Infinity,
      validate (after) /** @suppress {globalThis} */ {
        // returns a `Number` or `Infinity`
        var validated
        var item = this.brick.item
        if (item) {
          validated = after
        } else {
          if (eYo.isStr(after)) {
            if (after.length) {
              validated = Math.max(0, Math.floor(Number(after)))
            } else {
              validated = Infinity
            }
          } else if (eYo.isNum(after)) {
            validated = Math.max(0, Math.floor(after))
          }
        }
        return validated
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        // First change the ary of the arguments list, then change the ary of the delegate.
        // That way undo events are recorded in the correct order.
        builtin()
        var target = this.brick.n_ary_b
        if (target) {
          target.Ary_p = after
        }
        ;(after < this.brick.Mandatory_p) && (this.brick.Mandatory_p = after)
        if (eYo.isDef(after)) {
          this.brick.variant_ = eYo.key.CALL_EXPR
        }
      },
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          if (this.brick.variant === eYo.key.CALL_EXPR && this.get() !== Infinity) {
            var profile = this.brick.profile
            if (profile && profile.p5e && (profile.p5e.raw === eYo.t3.expr.known_identifier)) {
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
      validate (after) /** @suppress {globalThis} */ {
        // returns a `Number` or `0`
        var validated
        var item = this.brick.item
        if (item) {
          validated = after
        } else {
          if (eYo.isStr(after)) {
            if (after.length) {
              validated = Math.max(0, Math.floor(Number(after)))
            } else {
              validated = 0
            }
          } else if (eYo.isNum(after)) {
            validated = Math.max(0, Math.floor(after))
          }
        }
        return validated
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var target = this.brick.n_ary_b
        if (target) {
          target.Mandatory_p = after
        }
        ;(after > this.brick.Ary_p) && (this.brick.Ary_p = after)
        if (eYo.isDef(after)) {
          this.brick.variant_ = eYo.key.CALL_EXPR
        }
      },
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          if (this.brick.profile && this.brick.variant === eYo.key.CALL_EXPR && this.get()) {
            var profile = this.brick.profile
            if (profile && profile.p5e && (profile.p5e.raw === eYo.t3.expr.known_identifier)) {
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
      check: eYo.t3.expr.check.primary,
      didDisconnect (oldTargetM4t) /** @suppress {globalThis} */ {
        this.brick.updateProfile()
      },
      didConnect (oldTargetM4t, targetOldM4t) /** @suppress {globalThis} */ {
        this.brick.updateProfile()
      },
      xml: true
    },
    dotted: {
      order: 75,
      fields: {
        bind: {
          reserved: '.',
          separator: true
        }
      }
    },
    target: {
      order: 100,
      wrap: eYo.t3.expr.target_list,
      xml: {
        accept (attribute) /** @suppress {globalThis} */ {
          return attribute === 'targets'
        } // for old name
      },
      plugged: eYo.t3.expr.primary,
      fields: {
        bind: {
          validate: true,
          endEditing: true,
          variable: true,
          willRender () /** @suppress {globalThis} */ {
            this.willRender()
            var item = this.brick.item
            var reserved = item && item.module && (item.module.name === 'functions' || item.module.name === 'stdtypes' || item.module.name === 'datamodel')
            var d = this.ui_driver_mngr
            d && (d.makeReserved(this, reserved))
          }
        }
      },
      accept (attribute) /** @suppress {globalThis} */ {
        return attribute === 'name'
      },
      didConnect (oldTargetM4t, targetOldM4t) /** @suppress {globalThis} */ {
        // the brick is not yet consolidated
        if (this.isSlot) {
          var parent = this.brick.parent
          if (parent) {
            parent.target_s.boundField.visible = false
            if (Object.keys(this.brick.slots).length > 1) {
              // this is the second brick we connect
              parent.variant_ = eYo.key.TARGET_VALUED
            } else {
              var v = parent.Variant_p
              if (v === eYo.key.ANNOTATED) {
                var t = this.targetBrick
                if ([eYo.t3.expr.identifier_annotated,
                  eYo.t3.expr.augtarget_annotated,
                  eYo.t3.expr.key_datum].indexOf(t.type) >= 0) {
                  parent.variant_ = eYo.key.NONE // no 2 annotations
                }
              } else if (v === eYo.key.ANNOTATED_VALUED) {
                var t = this.targetBrick
                if ([eYo.t3.expr.identifier_annotated,
                  eYo.t3.expr.augtarget_annotated,
                  eYo.t3.expr.key_datum].indexOf(t.type) >= 0) {
                  parent.variant_ = eYo.key.TARGET_VALUED // no 2 annotations
                }
              }
            }
          }
        }
      },
      didDisconnect (oldTargetM4t) /** @suppress {globalThis} */ {
        // the brick is not yet consolidated
        // when there is no connected brick, we display the field
        var unwrappedB3k = this.unwrappedMagnet.brick
        if (unwrappedB3k) {
          if (Object.keys(this.brick.slots).length < 4) { // bad design
            // this is the last brick we disconnected
            var f = unwrappedB3k.target_s.boundField
            f && (f.visible = true)
          }
        }
      }
    },
    annotated: {
      order: 102,
      fields: {
        label: {
          reserved: ':'
        },
        bind: {
          endEditing: true
        }
      },
      check: eYo.t3.expr.check.expression,
      didLoad () /** @suppress {globalThis} */ {
        var b3k = this.brick
        var v = b3k.Variant_p
        if (this.required_from_saved) {
          if (v === eYo.key.TARGET_VALUED) {
            b3k.variant_ = eYo.key.ANNOTATED_VALUED
          } else if (v !== eYo.key.ANNOTATED_VALUED) {
            b3k.variant_ = eYo.key.ANNOTATED
          }
        }
      }
    },
    value: {
      order: 501,
      fields: {
        label: {
          reserved: '='
        },
        bind: {
          endEditing: true
        }
      },
      promise: eYo.t3.expr.value_list,
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          if (this.brick.variant === eYo.key.ANNOTATED) {
            this.brick.variant_ = eYo.key.ANNOTATED_VALUED
          } else if (this.brick.variant !== eYo.key.ANNOTATED_VALUED && this.brick.variant !== eYo.key.TARGET_VALUED && this.brick.variant !== eYo.key.COL_VALUED) {
            this.brick.variant_ = eYo.key.TARGET_VALUED
          }
        }
      },
      xml: {
        accept (attribute) /** @suppress {globalThis} */ {
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
      promise: eYo.t3.expr.argument_list_comprehensive,
      validateIncog () /** @suppress {globalThis} */ {
        return this.brick.variant !== eYo.key.CALL_EXPR
      }
    },
    slicing: {
      order: 2000,
      fields: {
        start: '[',
        end: ']'
      },
      promise: eYo.t3.expr.slice_list,
      validateIncog () /** @suppress {globalThis} */ {
        return this.brick.variant !== eYo.key.SLICING
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
      validateIncog () /** @suppress {globalThis} */ {
        return this.brick.variant !== eYo.key.ALIASED
      },
      check: [eYo.t3.expr.identifier, eYo.t3.expr.unset],
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          this.brick.variant_ = eYo.key.ALIASED
        }
      },
      didConnect (oldTargetM4t, targetOldM4t) /** @suppress {globalThis} */ {
        this.slot.boundField.visible = false
        this.brick.variant_ = eYo.key.ALIASED
      },
      didDisconnect (oldTargetM4t) /** @suppress {globalThis} */ {
        this.slot.boundField.visible = true
      }
    }
  },
  out: {
    check (type, subtype) /** @suppress {globalThis} */ {
      return this.brick.getOutCheck()
    }
  },
  init () /** @suppress {globalThis} */ {
    eYo.expr.registerPrimary(this)
  },
  deinit () /** @suppress {globalThis} */ {
    eYo.expr.unregisterPrimary(this)
  },
  properties: {
    profile : {
      lazy () {
        return this.getProfile()
      },
    },
    item : {
      get () {
        var p5e = this.profile.p5e
        return p5e && p5e.item
      }
    }
  }
})

eYo.register.add(eYo.expr, 'primary', function (b3k) {
  return !b3k.isInFlyout
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
  if (eYo.expr[k]) {
    console.warn('BREAK HERE!')
  }
//  console.warn(k)
  eYo.c9r.register(k, (eYo.expr[k] = eYo.expr.primary))
})

/**
 * Initialize a brick.
 * Called from brick's init method.
 * This should be called only once.
 * The underlying model is not expected to change while running.
 * @param {eYo.brick.BaseC9r} brick to be initialized.
 * For subclassers eventually
 */
eYo.expr.primary_p.init = function () {
  eYo.expr.primary.eyo.C9r_s.init.call(this)
  this.profile_ = eYo.NA
}

/**
 * updateProfile.
 */
eYo.expr.primary_p.updateProfile = eYo.decorate.reentrant_method(
  'updateProfile',
  function () {
    ++this.changer.count
    var p5e = this.profile.p5e
    this.Subtype_p = p5e && p5e.raw
    var item = p5e && p5e.item
    if (item) {
      this.Ary_p = item.ary_max
      this.Mandatory_p = item.mandatory_min
    } else {
      this.Ary_p = Infinity
      this.Mandatory_p = 0
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
eYo.expr.primary_p.getProfile = eYo.changer.memoize(
  'getProfile',
  function () {
      // this may be called very very early when
      // neither `data` nor `slots` may exist yet
    if (this.data && this.slots) {
      var ans = {
        dotted: this.Dotted_p,
        variant: this.Variant_p,
        _defined: !this.value_d.isNone(), // unused, to be removed ?
        _annotated: !this.annotated_d.isNone(), // unused, to be removed ?
      }
      var t9k, p5e
      var type
      // if the `target` slot is connected.
      if (this.target_b && Object.keys(this.target_b.slots).length > 3) {
        type = eYo.t3.expr.assignment_chain
        ans.name = {
          type: type,
          slot: type
        }
      } else if ((t9k = this.target_s.unwrappedTarget)) {
        var check
        if (t9k.checkOutputType(eYo.t3.expr.identifier)) {
          type = eYo.t3.expr.identifier
        } else if (t9k.checkOutputType(eYo.t3.expr.dotted_name)) {
          type = eYo.t3.expr.dotted_name
        } else if (t9k.checkOutputType(eYo.t3.expr.parent_module)) {
          type = eYo.t3.expr.parent_module
        } else if (t9k.checkOutputType(eYo.t3.expr.named_attributeref)) {
          type = eYo.t3.expr.named_attributeref
        } else if (t9k.checkOutputType(eYo.t3.expr.check.augtarget)) {
          type = eYo.t3.expr.augtarget
        } else if (t9k.checkOutputType(eYo.t3.expr.check.named_primary)) {
          type = eYo.t3.expr.named_primary
          check = eYo.t3.expr.check.named_primary
        } else if (t9k.checkOutputType(eYo.t3.expr.check.primary)) {
          type = eYo.t3.expr.primary
          check = eYo.t3.expr.check.primary
        } else if (t9k.checkOutputType(eYo.t3.expr.check.expression)) {
          type = eYo.t3.expr.expression
        } else {
          type = eYo.t3.expr.error // this brick should not be connected
        }
        ans.name = {
          type: type,
          check: check,
          slot: type
        }
        var p = t9k.profile
        if (p) {
          ans.identifier = p.identifier
          ans.module = p.module
        }
        // a target brick with no profile... bad luck
      } else {
        p5e = eYo.t3.profile.get(this.Target_p, null)
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
          if (t9k.checkOutputType(eYo.t3.expr.identifier)) {
            type = eYo.t3.expr.identifier
          } else if (t9k.checkOutputType(eYo.t3.expr.dotted_name)) {
            type = eYo.t3.expr.dotted_name
          } else if (t9k.checkOutputType(eYo.t3.expr.parent_module)) {
            type = eYo.t3.expr.parent_module
          } else if (t9k.checkOutputType(eYo.t3.expr.check.augtarget)) {
            type = eYo.t3.expr.augtarget
          } else if (t9k.checkOutputType(eYo.t3.expr.check.named_primary)) {
            type = eYo.t3.expr.named_primary
          } else if (t9k.checkOutputType(eYo.t3.expr.check.primary)) {
            type = eYo.t3.expr.primary
          } else {
            type = eYo.t3.expr.error // this brick should not be connected
          }
          ans.holder = {
            type: type,
            slot: type,
            target: t9k
          }
          p = t9k.profile
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
          base = this.Holder_p
          p5e = eYo.t3.profile.get(base)
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
      ans.identifier && (ans.p5e = eYo.t3.profile.get(ans.identifier, ans.module))
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
eYo.expr.primary_p.consolidateMagnets = function () {
  eYo.expr.primary.eyo.C9r_s.consolidateMagnets.call(this)
  this.target_s.magnet.hidden = this.variant === eYo.key.NONE && this.Dotted_p === 0
}

/**
 * getBaseType.
 * The type depends on the variant and the modifiers.
 * As side effect, the subtype is set.
 */
eYo.expr.primary_p.getBaseType = function () {
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
eYo.expr.primary_p.getOutCheck = function () {
  var f = function () {
  // there is no validation here
  // simple cases first, variant based
  var profile = this.profile
  if (!profile) {
    console.warn('NO PROFILE, is it normal?')
    this.changeDone()
    profile = this.profile
    if (!profile) {
      console.error('NO PROFILE')
    }
  }
  if (!profile.name) {
    console.error('NO NAME')
    this.changeDone()
    this.getProfile()
  }

  var named = () => {
    if (eYo.t3.expr.check.named_primary.indexOf(profile.name.type)) {
      if (!profile.holder.type
      || eYo.t3.expr.check.named_primary.indexOf(profile.holder.type)) {
        return true
      }
    }
  }
  if (profile.variant === eYo.key.CALL_EXPR) {
    return named()
      ? [
        eYo.t3.expr.named_call_expr,
        eYo.t3.expr.call_expr
      ]
      : [
        eYo.t3.expr.call_expr
      ]
  } else if (profile.variant === eYo.key.SLICING) {
    // is it a slicing or a subscription ?
    if (!eYo.t3.expr.check.slice_only) {
      eYo.t3.expr.check.slice_only = eYo.t3.expr.check.slice_list.filter(i => eYo.t3.expr.check.expression.indexOf(i) < 0)
    }
    if (this.slotSome(slot => {
      var t = slot.targetBrick
      return t && (t.checkOutputType(eYo.t3.expr.check.slice_only))
    })) {
      return named()
      ? [
        eYo.t3.expr.named_slicing,
        eYo.t3.expr.slicing
      ]
      : [
        eYo.t3.expr.slicing
      ]
    } else {
      return named()
      ? [
        eYo.t3.expr.named_subscription,
        eYo.t3.expr.named_slicing,
        eYo.t3.expr.subscription,
        eYo.t3.expr.slicing
      ]
      : [
        eYo.t3.expr.subscription,
        eYo.t3.expr.slicing
      ]
    }
  } else if (profile.variant === eYo.key.ALIASED) {
    if (profile.name.type === eYo.t3.expr.identifier
    || profile.name.type === eYo.t3.expr.unset) {
      if (profile.holder) {
        if (profile.holder.type === eYo.t3.expr.unset) {
          return [
            eYo.t3.expr.identifier_as,
            eYo.t3.expr.dotted_name_as,
            eYo.t3.expr.expression_as
          ]
        } else if (profile.holder.type === eYo.t3.expr.identifier
          || profile.holder.type === eYo.t3.expr.dotted_name) {
          return [
            eYo.t3.expr.dotted_name_as,
            eYo.t3.expr.expression_as
          ]
        } else if (profile.holder.type) {
          return [
            eYo.t3.expr.expression_as
          ]
        }
      }
      return [
        eYo.t3.expr.identifier_as,
        eYo.t3.expr.dotted_name_as,
        eYo.t3.expr.expression_as
      ]
    }
    if (profile.name.type === eYo.t3.expr.dotted_name) {
      if (!profile.holder.type
        || profile.holder.type === eYo.t3.expr.unset
        || profile.holder.type === eYo.t3.expr.identifier
        || profile.holder.type === eYo.t3.expr.dotted_name) {
        return [
          eYo.t3.expr.dotted_name_as,
          eYo.t3.expr.expression_as
        ]
      }
    }
    return [
      eYo.t3.expr.expression_as
    ]
  } else if (profile.variant === eYo.key.ANNOTATED) {
    return profile.name.type === eYo.t3.expr.identifier || profile.name.type === eYo.t3.expr.unset
      ? [
        eYo.t3.expr.identifier_annotated,
        eYo.t3.expr.augtarget_annotated,
        eYo.t3.expr.key_datum
      ]
      : profile.name.type === eYo.t3.expr.dotted_name
      || profile.name.type === eYo.t3.expr.augtarget
        ? [
          eYo.t3.expr.augtarget_annotated,
          eYo.t3.expr.key_datum
        ]
        : [
          eYo.t3.expr.key_datum
        ]
  } else if (profile.variant === eYo.key.COL_VALUED) {
    return [
      eYo.t3.expr.named_expr
    ]
  } else if (profile.variant === eYo.key.TARGET_VALUED) {
    // Is the target connected to something that is not an identifier ?
    if (Object.keys(this.target_b.slots).length > 3) {
      return [eYo.t3.expr.assignment_chain]
    }
    if (Object.keys(this.target_b.slots).length > 1) {
      // only one connected input
      var b3k = this.target_s.unwrappedTarget
      if (b3k && b3k.type !== eYo.t3.expr.identifier) {
        return [eYo.t3.expr.assignment_chain]
      }
    }
    // if the first value is connected to a `… = …`
    b3k = this.value_s.unwrappedTarget
    if (b3k && [
      eYo.t3.expr.identifier_valued,
      eYo.t3.expr.assignment_chain
    ].indexOf(b3k.type) >= 0) {
      return [
        eYo.t3.expr.assignment_chain
      ]
    }
    // if the parent is a value_list
    if ((b3k = this.out)) {
      if (b3k.type === eYo.t3.expr.value_list || b3k.type === eYo.t3.expr.value_list) {
        return [
          eYo.t3.expr.assignment_chain
        ]
      }
    }
    return [
      eYo.t3.expr.identifier_valued,
      eYo.t3.expr.assignment_chain
    ]
  } else if (profile.variant === eYo.key.ANNOTATED_VALUED) {
    return [
      eYo.t3.expr.identifier_annotated_valued
    ]
  }
  // if this is just a wrapper, forwards the check array
  if (!profile.dotted) {
    return profile.name.target
      ? profile.name.target.out_m.check_
      : profile.name.type === eYo.t3.expr.unset
        ? [
          eYo.t3.expr.identifier
        ]
        : profile.name.check || [
          profile.name.type
        ]
  }
    // parent_module first
    if (profile.name.type === eYo.t3.expr.parent_module) {
      return [
        eYo.t3.expr.parent_module
      ]
    }
    if (profile.holder.type === eYo.t3.expr.parent_module) {
      return [
        eYo.t3.expr.parent_module
      ]
    }
    if (profile.dotted > 0 && (!profile.holder.type
      || profile.holder.type === eYo.t3.expr.unset)) {
      return [
        eYo.t3.expr.parent_module
      ]
    }
    // [named_]attributeref
    if (profile.name.type === eYo.t3.expr.unset
    || profile.name.type === eYo.t3.expr.identifier) {
      if (profile.holder.type === eYo.t3.expr.unset
      || profile.holder.type === eYo.t3.expr.identifier
      || profile.holder.type === eYo.t3.expr.dotted_name) {
        return [
          eYo.t3.expr.dotted_name,
          eYo.t3.expr.named_attributeref,
          eYo.t3.expr.attributeref
        ]
      }
      if (profile.holder.type) {
        if (eYo.t3.expr.check.named_primary.indexOf(profile.holder.type) >= 0) {
          return [
            eYo.t3.expr.named_attributeref,
            eYo.t3.expr.attributeref
          ]
        }
        return [
          eYo.t3.expr.attributeref
        ]
      }
      return [
        eYo.t3.expr.identifier,
        eYo.t3.expr.dotted_name
      ]
    }
    if (profile.name.type === eYo.t3.expr.dotted_name) {
      if (profile.holder.type === eYo.t3.expr.unset
      || profile.holder.type === eYo.t3.expr.identifier
      || profile.holder.type === eYo.t3.expr.dotted_name) {
        return [
          eYo.t3.expr.dotted_name,
          eYo.t3.expr.named_attributeref,
          eYo.t3.expr.attributeref
        ]
      }
      if (profile.holder.type) {
        if (eYo.t3.expr.check.named_primary.indexOf(profile.holder.type) >= 0) {
          return [
            eYo.t3.expr.named_attributeref,
            eYo.t3.expr.attributeref
          ]
        }
        return [
          eYo.t3.expr.attributeref
        ]
      }
      return [
        eYo.t3.expr.dotted_name
      ]
    }
    if (profile.name.type === eYo.t3.expr.named_attributeRef) {
      if (!profile.dotted
        || eYo.t3.expr.check.named_primary.indexOf(profile.holder.type)) {
        return [
          eYo.t3.expr.named_attributeref,
          eYo.t3.expr.attributeref
        ]
      }
    }
    if (profile.name.type === eYo.t3.expr.attributeRef) {
      return !profile.dotted || eYo.t3.expr.check.named_primary.indexOf(profile.holder.type)
        ? [
          eYo.t3.expr.named_attributeref,
          eYo.t3.expr.attributeref
        ]
        : [
          eYo.t3.expr.attributeref
        ]
    }
    if (profile.name.type === eYo.t3.expr.call_expr) {
      return !profile.dotted || eYo.t3.expr.check.named_primary.indexOf(profile.holder.type)
        ? [
          eYo.t3.expr.named_call_expr,
          eYo.t3.expr.call_expr
        ]
        : [
          eYo.t3.expr.call_expr
        ]
    }
    if (profile.name.type === eYo.t3.expr.slicing) {
      return !profile.dotted || eYo.t3.expr.check.named_primary.indexOf(profile.holder.type)
        ? [
          eYo.t3.expr.named_slicing,
          eYo.t3.expr.slicing
        ]
        : [
          eYo.t3.expr.slicing
        ]
    }
    return [
      eYo.t3.expr.attributeref
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
eYo.expr.primary_p.getSubtype = function () {
  this.getType()
  return this.Subtype_p
}

/**
 * Fetches the named input object, getSlot.
 * This is not a very strong design but it should work, I guess.
 * @param {Brick} brick
 * @param {String} name The name of the input.
 * @param {Boolean} [dontCreate] Whether the receiver should create inputs on the fly.
 * @return {eYo.slot.BaseC9r} The slot object, or null if slot does not exist or eYo.NA for the default brick implementation.
 */
eYo.expr.primary_p.getSlot = function (name) {
  var slot = eYo.expr.primary.eyo.C9r_s.getSlot.call(this, name)
  if (!slot) {
    // we suppose that ary is set
    var f = (slot) => {
      if (!slot.incog) {
        var m4t = slot.magnet
        if (m4t) {
          var t9k = m4t.targetBrick
          if (t9k && (slot = t9k.Slot(name))) {
            return slot
          }
        }
      }
    }
    slot = f(this.n_ary_s) || f(this.slicing_s)
  }
  return slot
}

/**
 * Class for a Delegate, base call statement brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.stmt.newC9r('base_call_stmt', {
  link: eYo.t3.expr.primary
})

/**
 * Class for a Delegate, base call statement brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.stmt.base_call_stmt[eYo.$newSubC9r]('call_stmt', {
  data: {
    variant: {
      init: eYo.key.CALL_EXPR,
      validate () {
        return eYo.key.CALL_EXPR
      }
    }
  },
  properties: {
    profile : {
      lazy () {
        return this.getProfile()
      },
    },
    item : {
      get () {
        var p5e = this.profile.p5e
        return p5e && p5e.item
      }
    }
  }
})

eYo.stmt.call_stmt_p.updateProfile = eYo.expr.primary_p.updateProfile

eYo.stmt.call_stmt_p.getProfile = eYo.expr.primary_p.getProfile

/**
 * Initialize a brick.
 * Called from brick's init method.
 * This should be called only once.
 * The underlying model is not expected to change while running.
 * @param {eYo.brick.BaseC9r} brick to be initialized.
 * For subclassers eventually
 */
eYo.stmt.call_stmt_p.init = function () {
  eYo.stmt.call_stmt.eyo.C9r_s.init.call(this)
  this.profile = eYo.NA
}


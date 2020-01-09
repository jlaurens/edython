/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('stmt')
eYo.require('expr.list')

eYo.provide('brick.assignment')

eYo.forwardDeclare('msg')
eYo.forwardDeclare('expr.primary')
goog.forwardDeclare('goog.dom')

/**
 * Class for a Delegate, assignment_stmt.
 * This is for a single assignment `a = b`.
 * The lhs is either a field name or a target, or a targets list.
 * How would I code for `a, b = c, d = e, f`.
 * The problem is that `a = b` is also a brick for primaries
 * such that in a … = … statement brick, it must be possible to connect
 * some … = … expression brick. It makes sense to connect in the
 * rhs position because assignment is evaluated from right to left.
 *
 * We merge all assignment statements into only one visual brick.
 * The visual brick has 3 types and more variants.
 * expression_stmt ::= target_list
 * annotated_stmt ::=  augtarget ":" expression
 * annotated_assignment_stmt ::=  augtarget ":" expression ["=" expression]
 * augmented_assignment_stmt ::=  augtarget augop (expression_list | yield_expr)
 * assignment_stmt ::= target_list "=" value_list
 * value_list ::= value_list | assignment_chain | identifier_valued
 * The target_list is only used here.
 * The target_list may also accept an identifier_annotated brick
 * or a augtarget_annotated which is a particular case of key_datum.
 * For edython.
 */
eYo.Stmt.makeClass('assignment_stmt', {
  data: {
    variant: {
      all: [
        eYo.key.EXPRESSION, // starting point, for weak valued
        eYo.key.TARGET, // only a name
        eYo.key.VALUED, // values
        eYo.key.TARGET_VALUED, // assignement
        eYo.key.ANNOTATED, // only annotation
        eYo.key.ANNOTATED_VALUED // assignement and annotation
      ],
      init: eYo.key.EXPRESSION,
      xml: false,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.target_d.requiredIncog = after !== eYo.key.VALUED && after !== eYo.key.EXPRESSION
        b3k.annotated_d.requiredIncog = after === eYo.key.ANNOTATED || after === eYo.key.ANNOTATED_VALUED
        b3k.value_d.requiredIncog = after === eYo.key.TARGET_VALUED || after === eYo.key.ANNOTATED_VALUED || after === eYo.key.VALUED || after === eYo.key.EXPRESSION
      },
      isChanging (builtin, after) /** @suppress {globalThis} */ {
        var b3k = this.brick
        if (after === eYo.key.VALUED) {
            b3k.operator_p = ''
        } else if (b3k.operator_p === '') {
          b3k.operator_p = '='
        }
        b3k.consolidateType()
        builtin()
      },
      fromType (type) /** @suppress {globalThis} */ {
        if (type === eYo.t3.Stmt.expression_stmt) {
          // expression statement defaults to a python comment line
          // but it should change because of the 'comment_stmt' below
          this.doChange(eYo.key.EXPRESSION)
        } else if (type === eYo.t3.Stmt.Annotated_stmt) {
          this.doChange(eYo.key.ANNOTATED)
        } else if (type === eYo.t3.Stmt.Annotated_assignment_stmt) {
          this.doChange(eYo.key.ANNOTATED_VALUED)
        } else if (this.value_ !== eYo.key.TARGET_VALUED) {
          this.doChange(eYo.key.TARGET_VALUED)
        }
      },
      consolidate () /** @suppress {globalThis} */ {
        var b3k = this.brick
        var t = b3k.target_s.unwrappedTarget
        if (t && (t.type === eYo.t3.Expr.identifier_annotated || t.type === eYo.t3.Expr.Augtarget_annotated)) {
          // no 2 annotations
          if (b3k.variant_p === eYo.key.ANNOTATED) {
            this.doChange(eYo.key.TARGET)
          } else if (b3k.variant_p === eYo.key.ANNOTATED_VALUED) {
            this.doChange(eYo.key.TARGET_VALUED)
          }
        }
      }
    },
    target: {
      init: '',
      placeholder: eYo.msg.placeholder.IDENTIFIER,
      subtypes: [
        eYo.t3.Expr.unset,
        eYo.t3.Expr.identifier,
        eYo.t3.Expr.Dotted_name
      ],
      validate (after) /** @suppress {globalThis} */ {
        var p5e = eYo.t3.profile.get(after, null)
        return this.model.subtypes.indexOf(p5e.expr) >= 0
        ? after
        : eYo.INVALID
      },
      synchronize: true,
      allwaysBoundField: true,
      xml: {
        getAttribute (element) /** @suppress {globalThis} */ {
          return element.getAttribute('name') // 'target' was named 'name' prior to 0.2.x
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          var b3k = this.brick
          var v = b3k.variant_p
          if (v === eYo.key.EXPRESSION) {
            b3k.variant_p = eYo.key.TARGET
          } else if (v === eYo.key.VALUED) {
            b3k.variant_p = eYo.key.TARGET_VALUED
          }
        }
      },
    },
    annotated: {
      init: '',
      placeholder: eYo.msg.placeholder.EXPRESSION,
      synchronize: true,
      didLoad () /** @suppress {globalThis} */ {
        var b3k = this.brick
        var v = b3k.variant_p
        if (this.requiredFromSaved) {
          if (v === eYo.key.VALUED || v === eYo.key.TARGET_VALUED) {
            b3k.variant_p = eYo.key.ANNOTATED_VALUED
            b3k.operator_p = '='
          } else {
            b3k.variant_p = eYo.key.ANNOTATED
          }
        }
      }
    },
    operator: {
      /* One of Visual Studio Code extensions gobbles this line */
      init: '',
      all: ['', '=', '+=', '-=', '*=', '/=', '//=', '%=', '**=', '@=', '<<=', '>>=', '&=', '^=', '|='],
      synchronize (after) /** @suppress {globalThis} */ {
        this.brick.value_s.label_f.text = after
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.numberOperator_p = after
        b3k.bitwiseOperator_p = after
        if (this.number || this.bitwise) {
          b3k.variant_p = eYo.key.TARGET_VALUED
        }
      },
      validate: true,
      fromType (type) /** @suppress {globalThis} */ {
        if (type === eYo.t3.Stmt.Augmented_assignment_stmt && (this.value_ === '' || this.value_ === '=')) {
          this.doChange('+=')
        }
      },
      xml: false
    },
    numberOperator: {
      all: ['+=', '-=', '*=', '/=', '//=', '%=', '**=', '@='],
      init: '',
      noUndo: true,
      xml: false,
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.operator_p = after
        b3k.operator_d.number = (b3k.operator_p === this.value_)
      },
    },
    bitwiseOperator: {
      all: ['<<=', '>>=', '&=', '^=', '|='],
      init: '',
      noUndo: true,
      xml: false,
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.operator_p = after
        b3k.operator_d.bitwise = (b3k.operator_p === this.value_)
      },
    },
    value: {
      init: '',
      placeholder: eYo.msg.placeholder.EXPRESSION,
      validate: false,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          var v = this.brick.variant_p
          if (v === eYo.key.TARGET_VALUED || v === eYo.key.ANNOTATED_VALUED) {
            this.required = false
            this.save(element, opt)
          }
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          var b3k = this.brick
          var v = b3k.variant_p
          if (v === eYo.key.ANNOTATED) {
            b3k.variant_p = eYo.key.ANNOTATED_VALUED
          } else if (v !== eYo.key.TARGET_VALUED && v !== eYo.key.ANNOTATED_VALUED && v !== eYo.key.VALUED) {
            b3k.variant_p = eYo.key.TARGET_VALUED
          }
        }
      },
      synchronize: true,
      validateIncog () /** @suppress {globalThis} */ {
        var v = this.brick.variant_p
        return v !== eYo.key.TARGET_VALUED && v !== eYo.key.ANNOTATED_VALUED && v !== eYo.key.VALUED && v !== eYo.key.EXPRESSION
      }
    }
  },
  slots: {
    target: {
      order: 1,
      fields: {
        bind: {
          validate: true,
          endEditing: true,
          variable: true
        }
      },
      wrap: eYo.t3.Expr.Target_list,
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          var b3k = this.brick
          var v = b3k.variant_p
          if (v === eYo.key.EXPRESSION) {
            this.brick.variant_p = eYo.key.TARGET
          } else if (v === eYo.key.VALUED) {
            this.brick.variant_p = eYo.key.TARGET_VALUED
          }
        }
      },
      xml: {
        accept (attribute) /** @suppress {globalThis} */ {
          return attribute === 'name'
        } // for old name
      },
    },
    annotated: {
      order: 2,
      fields: {
        delimiter: {
          order: 1,
          reserved: ':'
        },
        bind: {
          order: 2,
          validate: true,
          endEditing: true
        }
      },
      check: eYo.t3.Expr.Check.expression,
      xml: {
        attr: ':'
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          var b3k = this.brick
          var v = b3k.variant_p
          if (v === eYo.key.TARGET || v === eYo.key.EXPRESSION) {
            b3k.variant_p = eYo.key.ANNOTATED
          } else if (v === eYo.key.VALUED || v === eYo.key.TARGET_VALUED) {
            b3k.variant_p = eYo.key.ANNOTATED_VALUED
          } else if (v !== eYo.key.ANNOTATED_VALUED) {
            b3k.variant_p = eYo.key.ANNOTATED
          }
        }
      }
    },
    value: {
      order: 3,
      fields: {
        label: { // don't call it 'operator'
          reserved: '='
        },
        bind: {
          endEditing: true
        }
      },
      wrap: eYo.t3.Expr.value_list,
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          var b3k = this.brick
          var v = b3k.variant_p
          if (v === eYo.key.ANNOTATED) {
            b3k.variant_p = eYo.key.ANNOTATED_VALUED
          } else if (v !== eYo.key.EXPRESSION) {
            b3k.variant_p = eYo.key.TARGET_VALUED
          }
        }
      }
    }
  }
}, true)

;[
  'expression_stmt',
  'annotated_stmt',
  'annotated_assignment_stmt',
  'augmented_assignment_stmt'
].forEach(k => {
  eYo.C9r.register(k, (eYo.Stmt[k] = eYo.stmt.Assignment_stmt))
})

/**
 * getType.
 * @return {String} The type of the receiver's brick.
 */
eYo.Stmt.Assignment_stmt.prototype.getType = function () {
  var x = this.variant_p
  if (x === eYo.key.VALUED || x === eYo.key.EXPRESSION) { // not yet consolidated
    return eYo.t3.Stmt.expression_stmt
  } else if (x === eYo.key.NONE || this.operator_p === '') { // not yet consolidated
    return eYo.t3.Stmt.expression_stmt
  } else if (this.operator_p === '=') { // not an augmented assigment
    if (x === eYo.key.ANNOTATED) {
      return eYo.t3.Stmt.Annotated_stmt
    }
    if (x === eYo.key.ANNOTATED_VALUED) {
      return eYo.t3.Stmt.Annotated_assignment_stmt
    }
    x = this.target_s.unwrappedTarget
    if (x && (x.type === eYo.t3.Expr.identifier_annotated || x.type === eYo.t3.Expr.Augtarget_annotated)) {
      return eYo.t3.Stmt.Annotated_assignment_stmt
    }
    return eYo.t3.Stmt.Assignment_stmt
  } else {
    return eYo.t3.Stmt.Augmented_assignment_stmt
  }
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.Stmt.Assignment_stmt.prototype.populateContextMenuFirst_ = function (mngr) {
  var target_p = this.target_p
  var variant_p = this.variant_p
  var F = (content, newVariant) => {
    var menuItem = mngr.newMenuItem(content, () => {
      this.variant_p = newVariant
    })
    menuItem.setEnabled(newVariant !== variant_p)
    mngr.addChild(menuItem, true)
  }
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.do.CreateSPAN(target_p || eYo.msg.placeholder.IDENTIFIER, target_p ? 'eyo-code' : 'eyo-code-placeholder'),
    eYo.do.CreateSPAN(' = …', 'eyo-code')
  )
  F(content, eYo.key.TARGET_VALUED)
  content = eYo.do.CreateSPAN('…,… = …,…', 'eyo-code')
  F(content, eYo.key.TARGET_VALUED)
  mngr.shouldSeparate()
  if (variant_p !== eYo.key.TARGET_VALUED) {
    var menuItem = mngr.newMenuItem(eYo.msg.RENAME)
    mngr.addChild(menuItem, true)
    mngr.shouldSeparate()
  }
  eYo.stmt.Assignment_stmt.SuperProto_.populateContextMenuFirst_.Call(this, mngr)
  return true
}

/**
 * value_list.
 * Used only in assignment statement as wrapped value,
 * and in primary as promised value.
 */
eYo.expr.list.makeSubclass('value_list', {
  list: (() => {
    /*
     * For each given type, returns the list of brick types that can be unique.
     */
    var unique = {
      [eYo.t3.Stmt.Assignment_stmt]: [eYo.t3.Expr.yield_expr, eYo.t3.Expr.assignment_chain, eYo.t3.Expr.identifier_valued],
      [eYo.t3.Stmt.Augmented_assignment_stmt]: [eYo.t3.Expr.yield_expr],
      [eYo.t3.Stmt.Annotated_assignment_stmt]: [eYo.t3.Expr.yield_expr],
      [eYo.t3.Expr.Assignment_chain]: [eYo.t3.Expr.yield_expr, eYo.t3.Expr.assignment_chain, eYo.t3.Expr.identifier_valued],
      [eYo.t3.Expr.identifier_valued]: [eYo.t3.Expr.yield_expr, eYo.t3.Expr.Assignment_chain, eYo.t3.Expr.identifier_valued],
      [eYo.t3.Expr.identifier_annotated_valued]: [eYo.t3.Expr.yield_expr, eYo.t3.Expr.Assignment_chain, eYo.t3.Expr.identifier_valued],
      [eYo.t3.Expr.named_expr]: [eYo.t3.Expr.yield_expr, eYo.t3.Expr.Assignment_chain, eYo.t3.Expr.identifier_valued],
      [eYo.t3.Expr.key_datum]: [eYo.t3.Expr.yield_expr, eYo.t3.Expr.Assignment_chain, eYo.t3.Expr.identifier_valued]
    }
    var check = {
      [eYo.t3.Stmt.Assignment_stmt]: eYo.t3.Expr.Check.starred_item,
      [eYo.t3.Expr.Assignment_chain]: eYo.t3.Expr.Check.Starred_item,
      [eYo.t3.Stmt.Augmented_assignment_stmt]: eYo.t3.Expr.Check.expression,
      [eYo.t3.Stmt.Annotated_assignment_stmt]: eYo.t3.Expr.Check.expression,
      [eYo.t3.Expr.identifier_valued]: eYo.t3.Expr.Check.expression,
      [eYo.t3.Expr.identifier_annotated_valued]: eYo.t3.Expr.Check.expression,
      [eYo.t3.Expr.key_datum]: eYo.t3.Expr.Check.expression,
      [eYo.t3.Expr.named_expr]: eYo.t3.Expr.Check.expression
    }
    var me = {
      /**
       * @param {String} type  the type of the list brick eg `value_list`
       * @param {String} subtype  the subtype of the ist brick, actually the type of the wrapper (parent).
       * If `subtype` is a key of the `unique` map,
       * the corresponding value is returned.
       */
      unique: (type, subtype) => {
        return (subtype
        && unique [subtype]) || (subtype && [
          // all the concrete types for primary.
          // For all the commented types, value_list makes no sense.
          eYo.t3.Expr.identifier,
          eYo.t3.Expr.identifier_annotated,
          eYo.t3.Expr.Augtarget_annotated,
          //eYo.t3.Expr.key_datum,
          //eYo.t3.Expr.identifier_valued,
          //eYo.t3.Expr.Assignment_chain,
          //eYo.t3.Expr.named_expr,
          //eYo.t3.Expr.identifier_annotated_valued,
          eYo.t3.Expr.Attributeref,
          eYo.t3.Expr.named_attributeref,
          eYo.t3.Expr.Dotted_name,
          eYo.t3.Expr.parent_module,
          eYo.t3.Expr.identifier_as,
          eYo.t3.Expr.Dotted_name_as,
          eYo.t3.Expr.expression_as,
          eYo.t3.Expr.Subscription,
          eYo.t3.Expr.named_subscription,
          eYo.t3.Expr.Slicing,
          eYo.t3.Expr.named_slicing,
          eYo.t3.Expr.Call_expr,
          eYo.t3.Expr.named_call_expr
        ].indexOf(subtype) < 0 ? [] : null)
      },
      check: (type, subtype) => {
        return subtype
        && check [subtype] || (subtype && [
          eYo.t3.Expr.identifier,
          eYo.t3.Expr.identifier_annotated,
          eYo.t3.Expr.Augtarget_annotated,
          //eYo.t3.Expr.key_datum,
          //eYo.t3.Expr.identifier_valued,
          //eYo.t3.Expr.Assignment_chain,
          //eYo.t3.Expr.named_expr,
          //eYo.t3.Expr.identifier_annotated_valued,
          eYo.t3.Expr.Attributeref,
          eYo.t3.Expr.named_attributeref,
          eYo.t3.Expr.Dotted_name,
          eYo.t3.Expr.parent_module,
          eYo.t3.Expr.identifier_as,
          eYo.t3.Expr.Dotted_name_as,
          eYo.t3.Expr.expression_as,
          eYo.t3.Expr.Subscription,
          eYo.t3.Expr.named_subscription,
          eYo.t3.Expr.Slicing,
          eYo.t3.Expr.named_slicing,
          eYo.t3.Expr.Call_expr,
          eYo.t3.Expr.named_call_expr
        ].indexOf(subtype) < 0 ? [] : null)
      },
      consolidator: eYo.Consolidator.list,
      mandatory: 1,
      presep: ','
    }
    var all = Object.create(null)
    ;[eYo.t3.Stmt.Assignment_stmt,
      eYo.t3.Expr.Assignment_chain,
      eYo.t3.Stmt.Augmented_assignment_stmt,
      eYo.t3.Stmt.Annotated_stmt,
      eYo.t3.Stmt.Annotated_assignment_stmt,
      eYo.t3.Expr.identifier,
      eYo.t3.Expr.identifier_annotated,
      eYo.t3.Expr.Augtarget_annotated,
      eYo.t3.Expr.key_datum,
      eYo.t3.Expr.identifier_valued,
      eYo.t3.Expr.Assignment_chain,
      eYo.t3.Expr.named_expr,
      eYo.t3.Expr.identifier_annotated_valued,
      eYo.t3.Expr.Attributeref,
      eYo.t3.Expr.named_attributeref,
      eYo.t3.Expr.Dotted_name,
      eYo.t3.Expr.parent_module,
      eYo.t3.Expr.identifier_as,
      eYo.t3.Expr.Dotted_name_as,
      eYo.t3.Expr.expression_as,
      eYo.t3.Expr.Subscription,
      eYo.t3.Expr.named_subscription,
      eYo.t3.Expr.Slicing,
      eYo.t3.Expr.named_slicing,
      eYo.t3.Expr.Call_expr,
      eYo.t3.Expr.named_call_expr].forEach(k => {
      var unique = me.unique(null, k)
      if (unique === null) {
        return null
      }
      var check = me.check(null, k)
      if (check === null) {
        return null
      }
      var ra = goog.array.concat(unique, check)
      all[k] = ra.length ? ra : null
    })
    me.all = (type, subtype) => {
      return (subtype && all[subtype]) || null
    }
    return me
  }) ()
})

/**
 * getSubtype.
 * The default implementation just returns the variant,
 * when it exists.
 * Subclassers will use it to return the correct type
 * depending on their actual inner state.
 * This should be used instead of direct brick querying.
 * @return {String} The subtype of the receiver's brick.
 */
eYo.expr.value_list.prototype.getSubtype = function () {
  var t = this.out_m.targetBrick
  return (t && (this.subtype_ = t.type)) || this.subtype_
}

eYo.expr.list.makeSubclass('augassigned_list', () => {
  var D = {
    check: eYo.t3.Expr.Check.expression,
    unique: eYo.t3.Expr.yield_expr,
    consolidator: eYo.Consolidator.list,
    mandatory: 1,
    presep: ','
  }
  var RA = goog.array.concat(D.check, D.unique)
  goog.array.removeDuplicates(RA)
  D.all = RA
  return {
    list: D
  }
})

// /**
//  * Populate the context menu for the given brick.
//  * @param {eYo.Brick.Dflt} brick The brick.
//  * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
//  * @private
//  */
// eYo.Stmt.Augmented_assignment_stmt.prototype.populateContextMenuFirst_ = function (mngr) {
//   var brick = this
//   var withTarget = this.target_b
//   var target = this.target_p
//   var operator = this.operator_p
//   var withBitwise = this.operator_d.bitwise
//   var operators = withBitwise
//     ? this.bitwiseOperator_d.getAll()
//     : this.numberOperator_d.getAll()
//   var F = (i) => {
//     var op = operators[i]
//     if (op !== operator) {
//       var content =
//       goog.dom.createDom(goog.dom.TagName.SPAN, null,
//         withTarget ? eYo.do.CreateSPAN('…', 'eyo-code')
//           : eYo.do.CreateSPAN(target || eYo.msg.placeholder.IDENTIFIER, target ? 'eyo-code' : 'eyo-code-placeholder'),
//         eYo.do.CreateSPAN(' ' + op + ' ', 'eyo-code'),
//         eYo.do.CreateSPAN('…', 'eyo-code')
//       )
//       var menuItem = mngr.newMenuItem(content, function () {
//         console.log('Change', withBitwise ? 'bitwise' : 'number', 'operator to', op)
//         withBitwise ? brick.bitwiseOperator_d.set(op) : brick.numberOperator_d.set(op)
//       })
//       mngr.addChild(menuItem, true)
//     }
//   }
//   for (var i = 0; i < operators.length; i++) {
//     F(i)
//   }
//   mngr.shouldSeparate()
//   var content =
//   eYo.do.CreateSPAN(withBitwise ? '+=, -=, /= …' : '<<=, >>=, &= …', 'eyo-code')
//   var menuItem = mngr.newMenuItem(content, () => {
//     this.operator_p = withBitwise
//       ? this.numberOperator_p : this.bitwiseOperator_p
//   })
//   mngr.addChild(menuItem, true)
//   mngr.shouldSeparate()
//   return eYo.stmt.Augmented_assignment_stmt.SuperProto_.populateContextMenuFirst_.Call(this, mngr)
// }

eYo.Brick.Assignment.T3s = [
  eYo.t3.Expr.identifier,
  eYo.t3.Expr.yield_expr,
  eYo.t3.Expr.Target_list,
  eYo.t3.Expr.parenth_target_list,
  eYo.t3.Expr.Bracket_target_list,
  eYo.t3.Stmt.Assignment_stmt,
  eYo.t3.Expr.value_list,
  eYo.t3.Expr.Augassigned_list,
  eYo.t3.Stmt.Augmented_assignment_stmt
]

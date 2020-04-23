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

eYo.require('expr.List')

eYo.provide('brick.assignment')

eYo.forward('msg')
eYo.forward('expr.primary')
//g@@g.forwardDeclare('g@@g.dom')

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
eYo.stmt.makeC9r('assignment_stmt', true, {
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
        b3k.target_d.requiredIncog_ = after !== eYo.key.VALUED && after !== eYo.key.EXPRESSION
        b3k.annotated_d.requiredIncog_ = after === eYo.key.ANNOTATED || after === eYo.key.ANNOTATED_VALUED
        b3k.value_d.requiredIncog_ = after === eYo.key.TARGET_VALUED || after === eYo.key.ANNOTATED_VALUED || after === eYo.key.VALUED || after === eYo.key.EXPRESSION
      },
      isChanging (builtin, after) /** @suppress {globalThis} */ {
        var b3k = this.brick
        if (after === eYo.key.VALUED) {
            b3k.Operator_p = ''
        } else if (b3k.Operator_p === '') {
          b3k.Operator_p = '='
        }
        b3k.consolidateType()
        builtin()
      },
      fromType (type) /** @suppress {globalThis} */ {
        if (type === eYo.t3.stmt.expression_stmt) {
          // expression statement defaults to a python comment line
          // but it should change because of the 'comment_stmt' below
          this.doChange(eYo.key.EXPRESSION)
        } else if (type === eYo.t3.stmt.annotated_stmt) {
          this.doChange(eYo.key.ANNOTATED)
        } else if (type === eYo.t3.stmt.annotated_assignment_stmt) {
          this.doChange(eYo.key.ANNOTATED_VALUED)
        } else {
          this.doChange(eYo.key.TARGET_VALUED)
        }
      },
      consolidate () /** @suppress {globalThis} */ {
        var b3k = this.brick
        var t = b3k.target_s.unwrappedTarget
        if (t && (t.type === eYo.t3.expr.identifier_annotated || t.type === eYo.t3.expr.augtarget_annotated)) {
          // no 2 annotations
          if (b3k.variant === eYo.key.ANNOTATED) {
            this.doChange(eYo.key.TARGET)
          } else if (b3k.variant === eYo.key.ANNOTATED_VALUED) {
            this.doChange(eYo.key.TARGET_VALUED)
          }
        }
      }
    },
    target: {
      init: '',
      placeholder: eYo.msg.placeholder.IDENTIFIER,
      subtypes: [
        eYo.t3.expr.unset,
        eYo.t3.expr.identifier,
        eYo.t3.expr.dotted_name
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
        if (this.required_from_saved) {
          var b3k = this.brick
          var v = b3k.Variant_p
          if (v === eYo.key.EXPRESSION) {
            b3k.variant_ = eYo.key.TARGET
          } else if (v === eYo.key.VALUED) {
            b3k.variant_ = eYo.key.TARGET_VALUED
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
        var v = b3k.Variant_p
        if (this.required_from_saved) {
          if (v === eYo.key.VALUED || v === eYo.key.TARGET_VALUED) {
            b3k.variant_ = eYo.key.ANNOTATED_VALUED
            b3k.Operator_p = '='
          } else {
            b3k.variant_ = eYo.key.ANNOTATED
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
        b3k.NumberOperator_p = after
        b3k.BitwiseOperator_p = after
        if (this.number || this.bitwise) {
          b3k.variant_ = eYo.key.TARGET_VALUED
        }
      },
      validate: true,
      fromType (type) /** @suppress {globalThis} */ {
        if (type === eYo.t3.stmt.augmented_assignment_stmt && (this.stored__ === '' || this.stored__ === '=')) {
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
        b3k.Operator_p = after
        b3k.operator_d.number = (b3k.Operator_p === this.stored__)
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
        b3k.Operator_p = after
        b3k.operator_d.bitwise = (b3k.Operator_p === this.stored__)
      },
    },
    value: {
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
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          var b3k = this.brick
          var v = b3k.Variant_p
          if (v === eYo.key.ANNOTATED) {
            b3k.variant_ = eYo.key.ANNOTATED_VALUED
          } else if (v !== eYo.key.TARGET_VALUED && v !== eYo.key.ANNOTATED_VALUED && v !== eYo.key.VALUED) {
            b3k.variant_ = eYo.key.TARGET_VALUED
          }
        }
      },
      synchronize: true,
      validateIncog () /** @suppress {globalThis} */ {
        var v = this.brick.Variant_p
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
      wrap: eYo.t3.expr.target_list,
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          var b3k = this.brick
          var v = b3k.Variant_p
          if (v === eYo.key.EXPRESSION) {
            this.brick.variant_ = eYo.key.TARGET
          } else if (v === eYo.key.VALUED) {
            this.brick.variant_ = eYo.key.TARGET_VALUED
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
        label: {
          reserved: ':'
        },
        bind: {
          validate: true,
          endEditing: true
        }
      },
      check: eYo.t3.expr.check.expression,
      xml: {
        attr: ':'
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          var b3k = this.brick
          var v = b3k.Variant_p
          if (v === eYo.key.TARGET || v === eYo.key.EXPRESSION) {
            b3k.variant_ = eYo.key.ANNOTATED
          } else if (v === eYo.key.VALUED || v === eYo.key.TARGET_VALUED) {
            b3k.variant_ = eYo.key.ANNOTATED_VALUED
          } else if (v !== eYo.key.ANNOTATED_VALUED) {
            b3k.variant_ = eYo.key.ANNOTATED
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
      wrap: eYo.t3.expr.value_list,
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          var b3k = this.brick
          var v = b3k.Variant_p
          if (v === eYo.key.ANNOTATED) {
            b3k.variant_ = eYo.key.ANNOTATED_VALUED
          } else if (v !== eYo.key.EXPRESSION) {
            b3k.variant_ = eYo.key.TARGET_VALUED
          }
        }
      }
    }
  }
})

;[
  'expression_stmt',
  'annotated_stmt',
  'annotated_assignment_stmt',
  'augmented_assignment_stmt'
].forEach(k => {
  eYo.c9r.register(k, (eYo.stmt[k] = eYo.stmt.assignment_stmt))
})

/**
 * getType.
 * @return {String} The type of the receiver's brick.
 */
eYo.stmt.assignment_stmt_p.getType = function () {
  var x = this.Variant_p
  if (x === eYo.key.VALUED || x === eYo.key.EXPRESSION) { // not yet consolidated
    return eYo.t3.stmt.expression_stmt
  } else if (x === eYo.key.NONE || this.Operator_p === '') { // not yet consolidated
    return eYo.t3.stmt.expression_stmt
  } else if (this.Operator_p === '=') { // not an augmented assigment
    if (x === eYo.key.ANNOTATED) {
      return eYo.t3.stmt.annotated_stmt
    }
    if (x === eYo.key.ANNOTATED_VALUED) {
      return eYo.t3.stmt.annotated_assignment_stmt
    }
    x = this.target_s.unwrappedTarget
    if (x && (x.type === eYo.t3.expr.identifier_annotated || x.type === eYo.t3.expr.augtarget_annotated)) {
      return eYo.t3.stmt.annotated_assignment_stmt
    }
    return eYo.t3.stmt.assignment_stmt
  } else {
    return eYo.t3.stmt.augmented_assignment_stmt
  }
}

/**
 * value_list.
 * Used only in assignment statement as wrapped value,
 * and in primary as promised value.
 */
eYo.expr.List.makeSubC9r('value_list', {
  list: (() => {
    /*
     * For each given type, returns the list of brick types that can be unique.
     */
    var unique = {
      [eYo.t3.stmt.assignment_stmt]: [eYo.t3.expr.yield_expr, eYo.t3.expr.assignment_chain, eYo.t3.expr.identifier_valued],
      [eYo.t3.stmt.augmented_assignment_stmt]: [eYo.t3.expr.yield_expr],
      [eYo.t3.stmt.annotated_assignment_stmt]: [eYo.t3.expr.yield_expr],
      [eYo.t3.expr.assignment_chain]: [eYo.t3.expr.yield_expr, eYo.t3.expr.assignment_chain, eYo.t3.expr.identifier_valued],
      [eYo.t3.expr.identifier_valued]: [eYo.t3.expr.yield_expr, eYo.t3.expr.assignment_chain, eYo.t3.expr.identifier_valued],
      [eYo.t3.expr.identifier_annotated_valued]: [eYo.t3.expr.yield_expr, eYo.t3.expr.assignment_chain, eYo.t3.expr.identifier_valued],
      [eYo.t3.expr.named_expr]: [eYo.t3.expr.yield_expr, eYo.t3.expr.assignment_chain, eYo.t3.expr.identifier_valued],
      [eYo.t3.expr.key_datum]: [eYo.t3.expr.yield_expr, eYo.t3.expr.assignment_chain, eYo.t3.expr.identifier_valued]
    }
    var check = {
      [eYo.t3.stmt.assignment_stmt]: eYo.t3.expr.check.starred_item,
      [eYo.t3.expr.assignment_chain]: eYo.t3.expr.check.starred_item,
      [eYo.t3.stmt.augmented_assignment_stmt]: eYo.t3.expr.check.expression,
      [eYo.t3.stmt.annotated_assignment_stmt]: eYo.t3.expr.check.expression,
      [eYo.t3.expr.identifier_valued]: eYo.t3.expr.check.expression,
      [eYo.t3.expr.identifier_annotated_valued]: eYo.t3.expr.check.expression,
      [eYo.t3.expr.key_datum]: eYo.t3.expr.check.expression,
      [eYo.t3.expr.named_expr]: eYo.t3.expr.check.expression
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
          eYo.t3.expr.identifier,
          eYo.t3.expr.identifier_annotated,
          eYo.t3.expr.augtarget_annotated,
          //eYo.t3.expr.key_datum,
          //eYo.t3.expr.identifier_valued,
          //eYo.t3.expr.assignment_chain,
          //eYo.t3.expr.named_expr,
          //eYo.t3.expr.identifier_annotated_valued,
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
        ].indexOf(subtype) < 0 ? [] : null)
      },
      check: (type, subtype) => {
        return subtype
        && check [subtype] || (subtype && [
          eYo.t3.expr.identifier,
          eYo.t3.expr.identifier_annotated,
          eYo.t3.expr.augtarget_annotated,
          //eYo.t3.expr.key_datum,
          //eYo.t3.expr.identifier_valued,
          //eYo.t3.expr.assignment_chain,
          //eYo.t3.expr.named_expr,
          //eYo.t3.expr.identifier_annotated_valued,
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
        ].indexOf(subtype) < 0 ? [] : null)
      },
      consolidator: eYo.consolidator.List,
      mandatory: 1,
      presep: ','
    }
    var all = Object.create(null)
    ;[eYo.t3.stmt.assignment_stmt,
      eYo.t3.expr.assignment_chain,
      eYo.t3.stmt.augmented_assignment_stmt,
      eYo.t3.stmt.annotated_stmt,
      eYo.t3.stmt.annotated_assignment_stmt,
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
      eYo.t3.expr.named_call_expr].forEach(k => {
      var unique = me.unique(null, k)
      if (unique === null) {
        return null
      }
      var check = me.check(null, k)
      if (check === null) {
        return null
      }
      var ra = [].concat(unique, check)
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

eYo.expr.List.makeSubC9r('augassigned_list', () => {
  var D = {
    check: eYo.t3.expr.check.expression,
    unique: eYo.t3.expr.yield_expr,
    consolidator: eYo.consolidator.List,
    mandatory: 1,
    presep: ','
  }
  D.all = [...new Set([].concat(D.check, D.unique))]
  return {
    list: D
  }
})


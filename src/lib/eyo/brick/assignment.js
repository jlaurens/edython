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

goog.provide('eYo.Brick.Assignment')

goog.require('eYo')

goog.require('eYo.Msg')
goog.require('eYo.Brick.Primary')
goog.require('eYo.Brick.List')
goog.require('eYo.Brick.Stmt')
goog.require('goog.dom');

goog.provide('eYo.Brick.Stmt.assignment_stmt')

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
eYo.Brick.Stmt.makeSubclass('assignment_stmt', {
  data: {
    variant: {
      all: [
        eYo.Key.EXPRESSION, // starting point, for weak valued
        eYo.Key.TARGET, // only a name
        eYo.Key.VALUED, // values
        eYo.Key.TARGET_VALUED, // assignement
        eYo.Key.ANNOTATED, // only annotation
        eYo.Key.ANNOTATED_VALUED // assignement and annotation
      ],
      init: eYo.Key.EXPRESSION,
      xml: false,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var b3k = this.brick
        b3k.target_d.requiredIncog = newValue !== eYo.Key.VALUED && newValue !== eYo.Key.EXPRESSION
        b3k.annotated_d.requiredIncog = newValue === eYo.Key.ANNOTATED || newValue === eYo.Key.ANNOTATED_VALUED
        b3k.value_d.requiredIncog = newValue === eYo.Key.TARGET_VALUED || newValue === eYo.Key.ANNOTATED_VALUED || newValue === eYo.Key.VALUED || newValue === eYo.Key.EXPRESSION
      },
      isChanging: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var b3k = this.brick
        if (newValue === eYo.Key.VALUED) {
            b3k.operator_p = ''
        } else if (b3k.operator_p === '') {
          b3k.operator_p = '='
        }
        b3k.consolidateType()
        this.duringChange(oldValue, newValue)
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Stmt.expression_stmt) {
          // expression statement defaults to a python comment line
          // but it should change because of the 'comment_stmt' below
          this.doChange(eYo.Key.EXPRESSION)
        } else if (type === eYo.T3.Stmt.annotated_stmt) {
          this.doChange(eYo.Key.ANNOTATED)
        } else if (type === eYo.T3.Stmt.annotated_assignment_stmt) {
          this.doChange(eYo.Key.ANNOTATED_VALUED)
        } else if (this.value_ !== eYo.Key.TARGET_VALUED) {
          this.doChange(eYo.Key.TARGET_VALUED)
        }
      },
      consolidate: /** @suppress {globalThis} */ function () {
        var b3k = this.brick
        var t = b3k.target_s.unwrappedTarget
        if (t && (t.type === eYo.T3.Expr.identifier_annotated || t.type === eYo.T3.Expr.augtarget_annotated)) {
          // no 2 annotations
          if (b3k.variant_p === eYo.Key.ANNOTATED) {
            this.doChange(eYo.Key.TARGET)
          } else if (b3k.variant_p === eYo.Key.ANNOTATED_VALUED) {
            this.doChange(eYo.Key.TARGET_VALUED)
          }
        }
      }
    },
    target: {
      init: '',
      placeholder: eYo.Msg.Placeholder.IDENTIFIER,
      subtypes: [
        eYo.T3.Expr.unset,
        eYo.T3.Expr.identifier,
        eYo.T3.Expr.dotted_name
      ],
      validate: /** @suppress {globalThis} */ function (newValue) {
        var p5e = eYo.T3.Profile.get(newValue, null)
        return this.model.subtypes.indexOf(p5e.expr) >= 0
        ? {validated: newValue}
        : null
      },
      synchronize: true,
      allwaysBoundField: true,
      xml: {
        getAttribute: /** @suppress {globalThis} */ function (element) {
          return element.getAttribute('name') // 'target' was named 'name' prior to 0.2.x
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          var b3k = this.brick
          var v = b3k.variant_p
          if (v === eYo.Key.EXPRESSION) {
            b3k.variant_p = eYo.Key.TARGET
          } else if (v === eYo.Key.VALUED) {
            b3k.variant_p = eYo.Key.TARGET_VALUED
          }
        }
      },
    },
    annotated: {
      init: '',
      placeholder: eYo.Msg.Placeholder.EXPRESSION,
      validate: /** @suppress {globalThis} */ function (newValue) {
        return {validated: newValue}
      },
      synchronize: true,
      didLoad: /** @suppress {globalThis} */ function () {
        var b3k = this.brick
        var v = b3k.variant_p
        if (this.requiredFromSaved) {
          if (v === eYo.Key.VALUED || v === eYo.Key.TARGET_VALUED) {
            b3k.variant_p = eYo.Key.ANNOTATED_VALUED
            b3k.operator_p = '='
          } else {
            b3k.variant_p = eYo.Key.ANNOTATED
          }
        }
      }
    },
    operator: {
      /* One of Visual Studio Code extensions gobbles this line */
      init: '',
      all: ['', '=', '+=', '-=', '*=', '/=', '//=', '%=', '**=', '@=', '<<=', '>>=', '&=', '^=', '|='],
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.brick.value_s.label_f.text = newValue
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        var b3k = this.brick
        b3k.numberOperator_p = newValue
        b3k.bitwiseOperator_p = newValue
        if (this.number || this.bitwise) {
          b3k.variant_p = eYo.Key.TARGET_VALUED
        }
      },
      validate: true,
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Stmt.augmented_assignment_stmt && (this.value_ === '' || this.value_ === '=')) {
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
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        if (oldValue && (newValue !== oldValue)) {
          var b3k = this.brick
          b3k.operator_p = newValue
          b3k.operator_d.number = (b3k.operator_p === this.value_)
        }
      },
    },
    bitwiseOperator: {
      all: ['<<=', '>>=', '&=', '^=', '|='],
      init: '',
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        if (oldValue && (newValue !== oldValue)) {
          var b3k = this.brick
          b3k.operator_p = newValue
          b3k.operator_d.bitwise = (b3k.operator_p === this.value_)
        }
      },
    },
    value: {
      init: '',
      placeholder: eYo.Msg.Placeholder.EXPRESSION,
      validate: false,
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          var v = this.brick.variant_p
          if (v === eYo.Key.TARGET_VALUED || v === eYo.Key.ANNOTATED_VALUED) {
            this.required = false
            this.save(element, opt)
          }
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          var b3k = this.brick
          var v = b3k.variant_p
          if (v === eYo.Key.ANNOTATED) {
            b3k.variant_p = eYo.Key.ANNOTATED_VALUED
          } else if (v !== eYo.Key.TARGET_VALUED && v !== eYo.Key.ANNOTATED_VALUED && v !== eYo.Key.VALUED) {
            b3k.variant_p = eYo.Key.TARGET_VALUED
          }
        }
      },
      synchronize: true,
      validateIncog: /** @suppress {globalThis} */ function (newValue) {
        var v = this.brick.variant_p
        return v !== eYo.Key.TARGET_VALUED && v !== eYo.Key.ANNOTATED_VALUED && v !== eYo.Key.VALUED && v !== eYo.Key.EXPRESSION
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
      wrap: eYo.T3.Expr.target_list,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          var b3k = this.brick
          var v = b3k.variant_p
          if (v === eYo.Key.EXPRESSION) {
            this.brick.variant_p = eYo.Key.TARGET
          } else if (v === eYo.Key.VALUED) {
            this.brick.variant_p = eYo.Key.TARGET_VALUED
          }
        }
      },
      xml: {
        accept: /** @suppress {globalThis} */ function (attribute) {
          return attribute === 'name'
        } // for old name
      }
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
      check: eYo.T3.Expr.Check.expression,
      xml: {
        attr: ':'
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          var b3k = this.brick
          var v = b3k.variant_p
          if (v === eYo.Key.TARGET || v === eYo.Key.EXPRESSION) {
            b3k.variant_p = eYo.Key.ANNOTATED
          } else if (v === eYo.Key.VALUED || v === eYo.Key.TARGET_VALUED) {
            b3k.variant_p = eYo.Key.ANNOTATED_VALUED
          } else if (v !== eYo.Key.ANNOTATED_VALUED) {
            b3k.variant_p = eYo.Key.ANNOTATED
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
      wrap: eYo.T3.Expr.value_list,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          var b3k = this.brick
          var v = b3k.variant_p
          if (v === eYo.Key.ANNOTATED) {
            b3k.variant_p = eYo.Key.ANNOTATED_VALUED
          } else if (v !== eYo.Key.EXPRESSION) {
            b3k.variant_p = eYo.Key.TARGET_VALUED
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
  eYo.Brick.Stmt[k] = eYo.Brick.Stmt.assignment_stmt
  eYo.Brick.Manager.register(k)
})


/**
 * getType.
 * @return {String} The type of the receiver's brick.
 */
eYo.Brick.Stmt.assignment_stmt.prototype.getType = function () {
  var x = this.variant_p
  if (x === eYo.Key.VALUED || x === eYo.Key.EXPRESSION) { // not yet consolidated
    return eYo.T3.Stmt.expression_stmt
  } else if (x === eYo.Key.NONE || this.operator_p === '') { // not yet consolidated
    return eYo.T3.Stmt.expression_stmt
  } else if (this.operator_p === '=') { // not an augmented assigment
    if (x === eYo.Key.ANNOTATED) {
      return eYo.T3.Stmt.annotated_stmt
    }
    if (x === eYo.Key.ANNOTATED_VALUED) {
      return eYo.T3.Stmt.annotated_assignment_stmt
    }
    x = this.target_s.unwrappedTarget
    if (x && (x.type === eYo.T3.Expr.identifier_annotated || x.type === eYo.T3.Expr.augtarget_annotated)) {
      return eYo.T3.Stmt.annotated_assignment_stmt
    }
    return eYo.T3.Stmt.assignment_stmt
  } else {
    return eYo.T3.Stmt.augmented_assignment_stmt
  }
}

/**
 * Populate the context menu for the given brick.
 * @param {!eYo.Brick} brick The brick.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.Brick.Stmt.assignment_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
  var target_p = this.target_p
  var variant_p = this.variant_p
  var F = (content, newVariant) => {
    var menuItem = mgr.newMenuItem(content, () => {
      this.variant_p = newVariant
    })
    menuItem.setEnabled(newVariant !== variant_p)
    mgr.addChild(menuItem, true)
  }
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN(target_p || eYo.Msg.Placeholder.IDENTIFIER, target_p ? 'eyo-code' : 'eyo-code-placeholder'),
    eYo.Do.createSPAN(' = …', 'eyo-code')
  )
  F(content, eYo.Key.TARGET_VALUED)
  content = eYo.Do.createSPAN('…,… = …,…', 'eyo-code')
  F(content, eYo.Key.TARGET_VALUED)
  mgr.shouldSeparate()
  if (variant_p !== eYo.Key.TARGET_VALUED) {
    var menuItem = mgr.newMenuItem(eYo.Msg.RENAME)
    mgr.addChild(menuItem, true)
    mgr.shouldSeparate()
  }
  eYo.Brick.Stmt.assignment_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
  return true
}

/**
 * value_list.
 * Used only in assignment statement as wrapped value,
 * and in primary as promised value.
 */
eYo.Brick.List.makeSubclass('value_list', {
  list: (() => {
    /*
     * For each given type, returns the list of brick types that can be unique.
     */
    var unique = {
      [eYo.T3.Stmt.assignment_stmt]: [eYo.T3.Expr.yield_expr, eYo.T3.Expr.assignment_chain, eYo.T3.Expr.identifier_valued],
      [eYo.T3.Stmt.augmented_assignment_stmt]: [eYo.T3.Expr.yield_expr],
      [eYo.T3.Stmt.annotated_assignment_stmt]: [eYo.T3.Expr.yield_expr],
      [eYo.T3.Expr.assignment_chain]: [eYo.T3.Expr.yield_expr, eYo.T3.Expr.assignment_chain, eYo.T3.Expr.identifier_valued],
      [eYo.T3.Expr.identifier_valued]: [eYo.T3.Expr.yield_expr, eYo.T3.Expr.assignment_chain, eYo.T3.Expr.identifier_valued],
      [eYo.T3.Expr.identifier_annotated_valued]: [eYo.T3.Expr.yield_expr, eYo.T3.Expr.assignment_chain, eYo.T3.Expr.identifier_valued],
      [eYo.T3.Expr.named_expr]: [eYo.T3.Expr.yield_expr, eYo.T3.Expr.assignment_chain, eYo.T3.Expr.identifier_valued],
      [eYo.T3.Expr.key_datum]: [eYo.T3.Expr.yield_expr, eYo.T3.Expr.assignment_chain, eYo.T3.Expr.identifier_valued]
    }
    var check = {
      [eYo.T3.Stmt.assignment_stmt]: eYo.T3.Expr.Check.starred_item,
      [eYo.T3.Expr.assignment_chain]: eYo.T3.Expr.Check.starred_item,
      [eYo.T3.Stmt.augmented_assignment_stmt]: eYo.T3.Expr.Check.expression,
      [eYo.T3.Stmt.annotated_assignment_stmt]: eYo.T3.Expr.Check.expression,
      [eYo.T3.Expr.identifier_valued]: eYo.T3.Expr.Check.expression,
      [eYo.T3.Expr.identifier_annotated_valued]: eYo.T3.Expr.Check.expression,
      [eYo.T3.Expr.key_datum]: eYo.T3.Expr.Check.expression,
      [eYo.T3.Expr.named_expr]: eYo.T3.Expr.Check.expression
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
          eYo.T3.Expr.identifier,
          eYo.T3.Expr.identifier_annotated,
          eYo.T3.Expr.augtarget_annotated,
          //eYo.T3.Expr.key_datum,
          //eYo.T3.Expr.identifier_valued,
          //eYo.T3.Expr.assignment_chain,
          //eYo.T3.Expr.named_expr,
          //eYo.T3.Expr.identifier_annotated_valued,
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
        ].indexOf(subtype) < 0 ? [] : null)
      },
      check: (type, subtype) => {
        return subtype
        && check [subtype] || (subtype && [
          eYo.T3.Expr.identifier,
          eYo.T3.Expr.identifier_annotated,
          eYo.T3.Expr.augtarget_annotated,
          //eYo.T3.Expr.key_datum,
          //eYo.T3.Expr.identifier_valued,
          //eYo.T3.Expr.assignment_chain,
          //eYo.T3.Expr.named_expr,
          //eYo.T3.Expr.identifier_annotated_valued,
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
        ].indexOf(subtype) < 0 ? [] : null)
      },
      consolidator: eYo.Consolidator.List,
      mandatory: 1,
      presep: ','
    }
    var all = Object.create(null)
    ;[eYo.T3.Stmt.assignment_stmt,
      eYo.T3.Expr.assignment_chain,
      eYo.T3.Stmt.augmented_assignment_stmt,
      eYo.T3.Stmt.annotated_stmt,
      eYo.T3.Stmt.annotated_assignment_stmt,
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
      eYo.T3.Expr.named_call_expr].forEach(k => {
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
eYo.Brick.Expr.value_list.prototype.getSubtype = function () {
  var t = this.out_m.targetBrick
  return (t && (this.subtype_ = t.type)) || this.subtype_
}

eYo.Brick.List.makeSubclass('augassigned_list', function () {
  var D = {
    check: eYo.T3.Expr.Check.expression,
    unique: eYo.T3.Expr.yield_expr,
    consolidator: eYo.Consolidator.List,
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

goog.provide('eYo.Brick.AugAssign')

// /**
//  * Populate the context menu for the given brick.
//  * @param {!eYo.Brick} brick The brick.
//  * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
//  * @private
//  */
// eYo.Brick.Stmt.augmented_assignment_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
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
//         withTarget ? eYo.Do.createSPAN('…', 'eyo-code')
//           : eYo.Do.createSPAN(target || eYo.Msg.Placeholder.IDENTIFIER, target ? 'eyo-code' : 'eyo-code-placeholder'),
//         eYo.Do.createSPAN(' ' + op + ' ', 'eyo-code'),
//         eYo.Do.createSPAN('…', 'eyo-code')
//       )
//       var menuItem = mgr.newMenuItem(content, function () {
//         console.log('Change', withBitwise ? 'bitwise' : 'number', 'operator to', op)
//         withBitwise ? brick.bitwiseOperator_d.set(op) : brick.numberOperator_d.set(op)
//       })
//       mgr.addChild(menuItem, true)
//     }
//   }
//   for (var i = 0; i < operators.length; i++) {
//     F(i)
//   }
//   mgr.shouldSeparate()
//   var content =
//   eYo.Do.createSPAN(withBitwise ? '+=, -=, /= …' : '<<=, >>=, &= …', 'eyo-code')
//   var menuItem = mgr.newMenuItem(content, () => {
//     this.operator_p = withBitwise
//       ? this.numberOperator_p : this.bitwiseOperator_p
//   })
//   mgr.addChild(menuItem, true)
//   mgr.shouldSeparate()
//   return eYo.Brick.Stmt.augmented_assignment_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
// }

eYo.Brick.Assignment.T3s = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.yield_expr,
  eYo.T3.Expr.target_list,
  eYo.T3.Expr.parenth_target_list,
  eYo.T3.Expr.bracket_target_list,
  eYo.T3.Stmt.assignment_stmt,
  eYo.T3.Expr.value_list,
  eYo.T3.Expr.augassigned_list,
  eYo.T3.Stmt.augmented_assignment_stmt
]

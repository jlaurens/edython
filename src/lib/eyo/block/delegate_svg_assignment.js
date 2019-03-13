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

goog.provide('eYo.DelegateSvg.Assignment')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Primary')
goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Stmt')
goog.require('goog.dom');

// ["eyo:attributeref", "eyo:subscription", "eyo:slicing", "eyo:parenth_target_list", "eyo:bracket_target_list", "eyo:target_star", "eyo:identifier", "eyo:any"]


/**
 * List consolidator for target list. Used is assignment.
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
eYo.Consolidator.List.Target = function (D) {
  var d = {}
  goog.mixin(d, eYo.Consolidator.List.Target.model)
  goog.mixin(d, D)
  eYo.Consolidator.List.Target.superClass_.constructor.call(this, d)
}
goog.inherits(eYo.Consolidator.List.Target, eYo.Consolidator.List)

eYo.Consolidator.List.Target.model = {
  hole_value: 'name',
  check: null,
  mandatory: 1,
  presep: ','
}

eYo.Consolidator.List.makeSubclass('Target', {
  hole_value: 'name',
  check: null,
  mandatory: 1,
  presep: ','
})

/**
 * List consolidator for target list.
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
eYo.Consolidator.List.Target.Void = function (D) {
  var d = {}
  goog.mixin(d, eYo.Consolidator.List.Target.Void.model)
  goog.mixin(d, D)
  eYo.Consolidator.List.Target.Void.superClass_.constructor.call(this, d)
}
goog.inherits(eYo.Consolidator.List.Target.Void, eYo.Consolidator.List.Target)

eYo.Consolidator.List.Target.Void.model = {
  hole_value: 'name',
  check: null,
  mandatory: 0,
  presep: ','
}

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {!Blockly.Block} block, owner or the receiver.
 */
eYo.Consolidator.List.Target.prototype.getIO = function (block) {
  var io = eYo.Consolidator.List.Target.superClass_.getIO.call(this, block)
  io.first_starred = io.last = -1
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
    var target = io.c8n.targetConnection
    if (!target) {
      return Type.UNCONNECTED
    }
    var check = target.check_
    if (check) {
      if (goog.array.contains(check, eYo.T3.Expr.target_star)) {
        return Type.STARRED
      } else {
        if (!io.annotatedInput && goog.array.contains(check, eYo.T3.Expr.identifier_annotated)) {
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
    this.setupIO(io, 0)
    while (io.eyo) {
      if ((io.eyo.parameter_type_ = getCheckType(io)) === Type.STARRED) {
        if (io.first_starred < 0) {
          io.first_starred = io.i
        }
      } else if (io.eyo.parameter_type_ === Type.OTHER) {
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
      while (io.eyo) {
        if (io.eyo.parameter_type_ === Type.STARRED) {
          // disconnect this
          var c8n = io.c8n
          c8n.disconnect()
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
eYo.Consolidator.List.Target.prototype.getCheck = function (io) {
  if (io.first_starred < 0 || io.i === io.first_starred) {
    return eYo.T3.Expr.Check.target
  } else {
    return eYo.T3.Expr.Check.target_unstar
  }
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
eYo.Consolidator.List.Target.prototype.doFinalize = function (io) {
  eYo.Consolidator.List.Target.superClass_.doFinalize.call(this, io)
  if (this.setupIO(io, 0)) {
    do {
      io.c8n.eyo.setIncog(io.annotatedInput && io.annotatedInput !== io.input)
    } while (this.nextInput(io))
  }
}

/**
 * Class for a DelegateSvg, target_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('target_list', {
  list: {
    consolidator: eYo.Consolidator.List.Target,
    mandatory: 1,
    hole_value: 'name'
  }
})

/**
 * Class for a DelegateSvg, void_target_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('void_target_list', {
  list: {
    consolidator: eYo.Consolidator.List.Target,
    mandatory: 0,
    hole_value: 'name'
  }
})

/**
 * Class for a DelegateSvg, parenth_target_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.void_target_list.makeSubclass('parenth_target_list', {
  fields: {
    prefix: {
      value: '('
    },
    suffix: {
      value: ')'
    }
  }
}, true)

/**
 * Class for a DelegateSvg, bracket_target_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.void_target_list.makeSubclass('bracket_target_list', {
  fields: {
    prefix: {
      value: '['
    },
    suffix: {
      value: ']'
    }
  }
}, true)

goog.provide('eYo.DelegateSvg.Stmt.assignment_stmt')

/**
 * Class for a DelegateSvg, assignment_stmt.
 * This is for a single assignment `a = b`.
 * The lhs is either a field name or a target, or a targets list.
 * How would I code for `a, b = c, d = e, f`.
 * The problem is that `a = b` is also a block for primaries
 * such that in a … = … statement block, it must be possible to connect
 * some … = … expression block. It makes sense to connect in the
 * rhs position because assignment is evaluated from right to left.
 * 
 * We merge all assignment statements into only one visual block.
 * The visual block has 4 types and more variants.
 * expression_stmt ::= target_list
 * annotated_assignment_stmt ::=  augtarget ":" expression ["=" expression]
 * augmented_assignment_stmt ::=  augtarget augop (expression_list | yield_expression)
 * assignment_stmt ::= target_list "=" assignment_value_list
 * assignment_value_list ::= value_list | assignment_chain | assignment_expr
 * The target_list is only used here.
 * The target_list may also accept an identifier_annotated block
 * or a augtarget_annotated which is a particular case of key_datum.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('assignment_stmt', {
  data: {
    variant: {
      all: [
        eYo.Key.NONE, // only a comment
        eYo.Key.TARGET, // only a name, possibly a comment
        eYo.Key.TARGET_VALUED, // assignement
        eYo.Key.ANNOTATED, // only annotation
        eYo.Key.ANNOTATED_VALUED // assignement and annotation
      ],
      init: eYo.Key.TARGET_VALUED,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var O = this.owner
        O.target_d.setIncog(newValue === eYo.Key.NONE)
        var slot
        slot = O.value_s
        slot.required = newValue === eYo.Key.TARGET_VALUED || newValue === eYo.Key.ANNOTATED_VALUED
        slot.setIncog()
        var d = O.annotation_d
        d.required = newValue === eYo.Key.ANNOTATED || newValue === eYo.Key.ANNOTATED_VALUED
        d.setIncog()
      },
      isChanging: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var O = this.owner
        if (newValue === eYo.Key.NONE) {
          O.comment_variant_p = eYo.Key.COMMENT
        }
        O.consolidateType()
        this.isChanging(oldValue, newValue)
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Stmt.expression_stmt) {
          this.change(eYo.Key.NONE)
        } else if (type === eYo.T3.Stmt.annotated_assignment_stmt) {
          if (this.value_ !== eYo.Key.ANNOTATED) {
            this.change(eYo.Key.ANNOTATED_VALUED)
          }
        } else if (this.value_ !== eYo.Key.TARGET_VALUED) {
          this.change(eYo.Key.TARGET_VALUED)
        }
      },
      xml: false,
      consolidate: /** @suppress {globalThis} */ function () {
        var O = this.owner
        if (O.comment_p === eYo.Key.NONE && this.value_ === eYo.Key.NONE) {
          this.change(eYo.Key.TARGET)
        }
        var t = O.target_s.unwrappedTarget
        if (t && (t.type === eYo.T3.Expr.identifier_annotated || t.type === eYo.T3.Expr.augtarget_annotated)) {
          // no 2 annotations
          if (O.variant_p === eYo.Key.ANNOTATED) {
            this.change(eYo.Key.TARGET)
          } else if (O.variant_p === eYo.Key.ANNOTATED_VALUED) {
            this.change(eYo.Key.TARGET_VALUED)
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
        if (this.isRequiredFromSaved() && this.owner.variant_p === eYo.Key.NONE) {
          this.owner.variant_p = eYo.Key.TARGET
        }
      }
    },
    annotation: {
      init: '',
      placeholder: eYo.Msg.Placeholder.EXPRESSION,
      validate: /** @suppress {globalThis} */ function (newValue) {
        return {validated: newValue}
      },
      synchronize: true,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved() && this.owner.variant_p !== eYo.Key.ANNOTATED) {
          this.owner.variant_p = eYo.Key.ANNOTATED_VALUED
          this.owner.operator_p = '='
        }
      }
    },
    operator: {
      all: ['=', '+=', '-=', '*=', '/=', '//=', '%=', '**=', '@=', '<<=', '>>=', '&=', '^=', '|='],
      init: '=',
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.owner.value_s.fields.op.setValue(newValue)
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.owner.numberOperator_p = newValue
        this.owner.bitwiseOperator_p = newValue
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Stmt.augmented_assignment_stmt && this.value_ === '=') {
          this.change('+=')
        }
      },
      validate: false
    },
    numberOperator: {
      all: ['+=', '-=', '*=', '/=', '//=', '%=', '**=', '@='],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        if (oldValue && (newValue !== oldValue)) {
          this.didChange(oldValue, newValue)
          var O = this.owner
          O.operator_p = newValue
          O.operator_d.bitwise = (O.operator_p !== this.get())
        }
      },
      validate: true
    },
    bitwiseOperator: {
      all: ['<<=', '>>=', '&=', '^=', '|='],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        if (oldValue && (newValue !== oldValue)) {
          var O = this.owner
          O.operator_p = newValue
          O.operator_d.bitwise = (O.operator_p === this.get())
        }
      },
      validate: true
    },
    comment: {
      init: /** @suppress {globalThis} */ function () {
        this.owner.comment_variant_p = eYo.Key.COMMENT
        this.setIncog(false)
        return ''
      },
      willLoad: /** @suppress {globalThis} */ function () {
        this.required = false
      },
      consolidate: /** @suppress {globalThis} */ function () {
        var O = this.owner
        if (O.target_d.isIncog() && O.value_s.isIncog()) {
          this.setIncog(false)
        }
      }
    },
    comment_variant: {
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Stmt.expression_stmt) {
          this.change(eYo.Key.COMMENT)
        } else {
          this.change(eYo.Key.NONE)
        }
      },
      isChanging: /** @suppress {globalThis} */ function (oldValue, newValue) {
        if ((newValue === eYo.Key.NONE)) {
          var O = this.owner
          if (O.variant_p === eYo.Key.NONE) {
            O.variant_p = eYo.Key.TARGET
          }
        }
        this.isChanging(oldValue, newValue)
      },
      consolidate: /** @suppress {globalThis} */ function () {
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
        if (this.isRequiredFromSaved() && this.owner.variant_p === eYo.Key.NONE) {
          this.owner.variant_p = eYo.Key.TARGET
        }
      },
      xml: {
        accept: /** @suppress {globalThis} */ function (attribute) {
          return attribute === 'name'
        } // for old name
      }
    },
    annotation: {
      order: 2,
      fields: {
        delimiter: {
          order: 1,
          value: ':',
          css: 'reserved'
        },
        bind: {
          order: 2,
          validate: true,
          endEditing: true,
          variable: true
        }
      },
      check: eYo.T3.Expr.Check.expression,
      xml: {
        attr: ':'
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved() && this.owner.variant_p !== eYo.Key.ANNOTATED) {
          this.owner.variant_p = eYo.Key.ANNOTATED_VALUED
        }
      }
    },
    value: {
      order: 3,
      fields: {
        op: { // don't call it 'operator'
          value: '=',
          css: 'reserved'
        },
      },
      wrap: eYo.T3.Expr.assignment_value_list,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          if (this.owner.variant_p === eYo.Key.ANNOTATED) {
            this.owner.variant_p = eYo.Key.ANNOTATED_VALUED
          } else {
            this.owner.variant_p = eYo.Key.TARGET_VALUED
          }
        }
      }
    }
  },
  didLoad: /** @suppress {globalThis} */ function () {
    if (this.variant_p === eYo.Key.NONE) {
      this.comment_variant_p = eYo.Key.COMMENT
    }
  }
}, true)

;['expression_stmt',
'annotated_assignment_stmt',
'augmented_assignment_stmt'].forEach(k => {
  eYo.DelegateSvg.Stmt[k] = eYo.DelegateSvg.Stmt.assignment_stmt
  eYo.DelegateSvg.Manager.register(k)
})

/**
 * comment blocks are white.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
eYo.DelegateSvg.Stmt.assignment_stmt.prototype.isWhite = function () {
  return this.variant_p === eYo.Key.NONE
}

/**
 * getType.
 * @return {String} The type of the receiver's block.
 */
eYo.DelegateSvg.Stmt.assignment_stmt.prototype.getType = function () {
  if (this.operator_p === '=') { // not an augmented assigment
    var x = this.variant_p
    if (x === eYo.Key.NONE || x === eYo.Key.TARGET) {
      return eYo.T3.Stmt.expression_stmt
    }
    if (x === eYo.Key.ANNOTATED || x === eYo.Key.ANNOTATED_VALUED) {
      return eYo.T3.Stmt.annotated_assignment_stmt
    }
    x = this.target_t
    if (x && (x.type === eYo.T3.Expr.identifier_annotated || x.type === eYo.T3.Expr.augtarget_annotated)) {
      return eYo.T3.Stmt.annotated_assignment_stmt
    }  
    return eYo.T3.Stmt.assignment_stmt
  } else {
    return eYo.T3.Stmt.augmented_assignment_stmt
  }
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.assignment_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
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
    var menuItem = mgr.newMenuItem(eYo.Msg.RENAME, () => {
      this.target_d.field.showEditor()
    })
    mgr.addChild(menuItem, true)
    mgr.shouldSeparate()
  }
  eYo.DelegateSvg.Stmt.assignment_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
  return true
}

/**
 * assignment_value_list
 */
eYo.DelegateSvg.List.makeSubclass('assignment_value_list', {
  list: (() => {
    var me = {
      unique: (type, subtype) => {
        return subtype
        ? {
          [eYo.T3.Stmt.assignment_stmt]: [eYo.T3.Expr.yield_expr, eYo.T3.Expr.assignment_chain],
          [eYo.T3.Expr.augmented_assignment_stmt]: [eYo.T3.Expr.yield_expr],
          [eYo.T3.Expr.annotated_assignment_stmt]: [eYo.T3.Expr.yield_expr]
        } [subtype] : []
      },
      check: (type, subtype) => {
        return subtype
        ? {
          [eYo.T3.Stmt.assignment_stmt]: eYo.T3.Expr.Check.starred_item,
          [eYo.T3.Stmt.augmented_assignment_stmt]: eYo.T3.Expr.Check.expression,
          [eYo.T3.Stmt.annotated_assignment_stmt]: eYo.T3.Expr.Check.expression
        } [subtype] : []
      },
      mandatory: 0,
      presep: ','
    }
    var all = Object.create(null)
    ;[eYo.T3.Stmt.assignment_stmt,
      eYo.T3.Stmt.augmented_assignment_stmt,
      eYo.T3.Stmt.annotated_assignment_stmt].forEach(k => {
      all[k] = goog.array.concat(me.unique(null, k), me.check(null, k))
    })
    me.all = (type, subtype) => {
      return subtype ? all [subtype] : []
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
 * This should be used instead of direct block querying.
 * @return {String} The subtype of the receiver's block.
 */
eYo.DelegateSvg.Expr.assignment_value_list.prototype.getSubtype = function () {
  var t = this.block_.outputConnection.targetBlock()
  return t && t.type
}

eYo.DelegateSvg.List.makeSubclass('augassigned_list', function () {
  var D = {
    check: eYo.T3.Expr.Check.expression,
    unique: eYo.T3.Expr.yield_expression,
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

goog.provide('eYo.DelegateSvg.AugAssign')

// /**
//  * Populate the context menu for the given block.
//  * @param {!Blockly.Block} block The block.
//  * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
//  * @private
//  */
// eYo.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
//   var block = this.block_
//   var withTarget = this.target_t
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
//         withBitwise ? block.eyo.bitwiseOperator_d.set(op) : block.eyo.numberOperator_d.set(op)
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
//   return eYo.DelegateSvg.Stmt.augmented_assignment_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
// }

eYo.DelegateSvg.Assignment.T3s = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.yield_expression,
  eYo.T3.Expr.target_list,
  eYo.T3.Expr.void_target_list,
  eYo.T3.Expr.parenth_target_list,
  eYo.T3.Expr.bracket_target_list,
  eYo.T3.Stmt.assignment_stmt,
  eYo.T3.Expr.value_list,
  eYo.T3.Expr.augassigned_list,
  eYo.T3.Stmt.augmented_assignment_stmt
]

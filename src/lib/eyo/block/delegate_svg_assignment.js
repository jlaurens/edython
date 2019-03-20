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
 * List consolidator for target list. Used in assignment, only.
 * There are different situations depending on the type of the
 * block enclosing the list.
 * 1) expression_stmt:
 * expression_stmt ::=  starred_expression
 * starred_expression ::=  expression | (starred_item ",")* [starred_item]
 * starred_item       ::=  expression | "*" or_expr
 * 2) augmented_assignment_stmt:
 * augmented_assignment_stmt ::=  augtarget augop (expression_list | yield_expr)
 * augtarget ::=  identifier | attributeref | subscription | slicing | dotted_name | named_attributeref | named_subscription | named_slicing
 * augop ::=  "+=" | "-=" | "*=" | "@=" | "/=" | "//=" | "%=" | "**="
 *                               | ">>=" | "<<=" | "&=" | "^=" | "|="
 * 3) annotated_assignment_stmt:
 * annotated_assignment_stmt ::=  augtarget ":" expression ["=" expression]
 * 4) assignment_stmt:
 * assignment_stmt ::=  (target_list "=")+ (starred_expression | yield_expr)
 * target_list     ::=  target ("," target)* [","]
 * target ::= target_unstar | target_star
 * target_unstar ::=  augtarget
 *                      | parenth_target_list
 *                      | bracket_target_list
 * target_annotated ::= target | identifier_annotated
 * parenth_target_list ::= "(" [target_list] ")"
 * bracket_target_list ::= "[" [target_list] "]"
 * target_star ::= "*" target
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
eYo.Consolidator.List.makeSubclass('Target', {
  hole_value: 'name',
  check: null,
  mandatory: 1,
  presep: ',',
  /**
   * Annotated assignment and augmented assignments must take only one target.
   * @param {!Object} io input/output parameter
   */
  makeUnique: /** @suppress {globalThis} */ function (io) {
    if (io.subtype === eYo.T3.Stmt.annotated_stmt || io.subtype === eYo.T3.Stmt.annotated_assignment_stmt || io.subtype === eYo.T3.Stmt.augmented_assignment_stmt) {
      return true
    }
    this.makeUnique(io)
  }
})

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {!Blockly.Block} block, owner or the receiver.
 */
eYo.Consolidator.List.Target.prototype.getIO = function (block) {
  var io = eYo.Consolidator.List.Target.superClass_.getIO.call(this, block)
  io.first_starred = io.last = io.max = -1
  io.annotatedInput = undefined
  io.subtype = block.eyo.subtype
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
        if (!io.annotatedInput
          && (goog.array.contains(check, eYo.T3.Expr.identifier_annotated) 
          || goog.array.contains(check, eYo.T3.Expr.augtarget_annotated))) {
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
eYo.Consolidator.List.Target.prototype.getCheck = (() => {
  var f = (io) => {
    var subtype = io.subtype
    if (io.i === io.unique) {
      if (subtype === eYo.T3.Stmt.annotated_stmt || subtype === eYo.T3.Stmt.annotated_assignment_stmt) {
        return eYo.T3.Expr.Check.target_annotated
      }
      if (io.subtype === eYo.T3.Stmt.augmented_assignment_stmt) {
        return eYo.T3.Expr.Check.augtarget
      }
      throw 'logically unreachable'
    }
    if (io.i === 1 && io.list.length === 3) {
      return eYo.T3.Expr.Check.target_annotated
    }
    if (io.i === 0 && io.list.length === 1) {
      return eYo.T3.Expr.Check.target_annotated
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
      console.error('WTF')
      check = f(io)
    }
    var c8n = io.c8n.targetConnection
    if (c8n) {
      // will this connection be lost because of the check change?
      if (c8n.check_.some(t => check.indexOf(t) >= 0)) {
        //
      } else {
        console.error('THE CONNECTION WILL BE LOST')
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
    consolidator: eYo.Consolidator.List.Target
  }
})

/**
 * The subtype is the type of the enclosing block.
 * @return {String} The subtype of the receiver's block.
 */
eYo.DelegateSvg.Expr.target_list.prototype.getSubtype = function () {
  var parent = this.parent
  return parent && parent.type
}

/**
 * Did disconnect this block's connection from another connection.
 * @param {!Blockly.Connection} blockConnection
 * @param {!Blockly.Connection} oldTargetC8n that was connected to blockConnection
 */
eYo.DelegateSvg.Expr.target_list.prototype.didDisconnect = function (connection, oldTargetC8n) {
  eYo.DelegateSvg.Expr.target_list.superClass_.didDisconnect.call(this, connection, oldTargetC8n)
  if (this.block_.inputList.some(input => input.connection && input.connection.targetConnection)) {
    // there is another connected block
    return
  }
  var x = this.parent
  x && (x = x.target_s) && x.bindField.setVisible(true)
}

/**
 * Hook.
 * @param {!Blockly.Connection} connection.
 * @param {!Blockly.Connection} oldTargetC8n.
 * @param {!Blockly.Connection} targetOldC8n
 */
eYo.DelegateSvg.Expr.target_list.prototype.didConnect = function (connection, oldTargetC8n, targetOldC8n) {
  eYo.DelegateSvg.Expr.target_list.superClass_.didConnect.call(this, connection, oldTargetC8n, targetOldC8n)
  var eyo = this.parent
  if (eyo) {
    var v = eyo.variant_p
    if (v === eYo.Key.NONE) {
      eyo.variant_p = eYo.Key.TARGET
    } else if (v === eYo.Key.VALUED) {
      eyo.variant_p = eYo.Key.TARGET_VALUED
    }
  }
}

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
 * annotated_stmt ::=  augtarget ":" expression
 * annotated_assignment_stmt ::=  augtarget ":" expression ["=" expression]
 * augmented_assignment_stmt ::=  augtarget augop (expression_list | yield_expr)
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
        eYo.Key.VALUED, // values, possibly a comment
        eYo.Key.TARGET_VALUED, // assignement
        eYo.Key.ANNOTATED, // only annotation
        eYo.Key.ANNOTATED_VALUED // assignement and annotation
      ],
      init: eYo.Key.TARGET_VALUED,
      xml: false,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var O = this.owner
        O.target_d.requiredIncog = newValue !== eYo.Key.NONE && newValue !== eYo.Key.VALUED
        O.annotated_d.requiredIncog = newValue === eYo.Key.ANNOTATED || newValue === eYo.Key.ANNOTATED_VALUED
        O.value_s.requiredIncog = newValue === eYo.Key.TARGET_VALUED || newValue === eYo.Key.ANNOTATED_VALUED || newValue === eYo.Key.VALUED
      },
      isChanging: /** @suppress {globalThis} */ function (oldValue, newValue) {
        // variant change from 'NONE' has greater priority over comment change
        var O = this.owner
        if (newValue === eYo.Key.NONE) {
          O.comment_variant_p = eYo.Key.COMMENT
          O.operator_p = ''
        } else {
          O.comment_variant_p = eYo.Key.NONE
          if (newValue === eYo.Key.VALUED) {
            O.operator_p = ''
          } else if (O.operator_p === '') {
            O.operator_p = '='
          }
        }
        O.consolidateType()
        this.isChanging(oldValue, newValue)
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Stmt.expression_stmt) {
          // expression statement defaults to a python comment line
          this.change(eYo.Key.NONE)
        } else if (type === eYo.T3.Stmt.annotated_stmt) {
          this.change(eYo.Key.ANNOTATED)
        } else if (type === eYo.T3.Stmt.annotated_assignment_stmt) {
          this.change(eYo.Key.ANNOTATED_VALUED)
        } else if (this.value_ !== eYo.Key.TARGET_VALUED) {
          this.change(eYo.Key.TARGET_VALUED)
        }
      },
      consolidate: /** @suppress {globalThis} */ function () {
        var O = this.owner
        if (O.comment_variant_p === eYo.Key.NONE && this.value_ === eYo.Key.NONE) {
          this.change(eYo.Key.VALUED)
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
        if (this.isRequiredFromSaved()) {
          if (this.owner.variant_p === eYo.Key.NONE) {
            this.owner.variant_p = eYo.Key.TARGET
          } else if (this.owner.variant_p === eYo.Key.VALUED) {
            this.owner.variant_p = eYo.Key.TARGET_VALUED
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
        var O = this.owner
        if (this.isRequiredFromSaved() && O.variant_p !== eYo.Key.ANNOTATED_VALUED) {
          O.variant_p = eYo.Key.ANNOTATED
          O.operator_p = '='
        }
      }
    },
    operator: {
      /* Visual studio code gobbles this line */
      init: '=',
      all: ['', '=', '+=', '-=', '*=', '/=', '//=', '%=', '**=', '@=', '<<=', '>>=', '&=', '^=', '|='],
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.owner.value_s.fields.op.setValue(newValue)
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        var O = this.owner
        O.numberOperator_p = newValue
        O.bitwiseOperator_p = newValue
        if (this.number || this.bitwise) {
          O.variant_p = eYo.Key.TARGET_VALUED
        }
      },
      validate: true,
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Stmt.augmented_assignment_stmt && (this.value_ === '' || this.value_ === '=')) {
          this.change('+=')
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
          var O = this.owner
          O.operator_p = newValue
          O.operator_d.number = (O.operator_p === this.value_)
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
          var O = this.owner
          O.operator_p = newValue
          O.operator_d.bitwise = (O.operator_p === this.value_)
        }
      },
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
        if (O.target_d.isIncog() && O.value_s.isIncog() && O.annotated_d.isIncog()) {
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
        // beware, there is a circular dependency with the variant
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
        if (this.isRequiredFromSaved()) {
          if (this.owner.variant_p === eYo.Key.NONE) {
            this.owner.variant_p = eYo.Key.TARGET
          } else if (this.owner.variant_p === eYo.Key.VALUED) {
            this.owner.variant_p = eYo.Key.TARGET_VALUED
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
        if (this.isRequiredFromSaved()) {
          var v = this.owner.variant_p
          if (v === eYo.Key.TARGET || v === eYo.Key.NONE) {
            this.owner.variant_p = eYo.Key.ANNOTATED
          } else if (v !== eYo.Key.ANNOTATED) {
            this.owner.variant_p = eYo.Key.ANNOTATED_VALUED
          }
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
'annotated_stmt',
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
  var x = this.variant_p
  if (x === eYo.Key.NONE || x === eYo.Key.VALUED || this.operator_p === '') { // not yet consolidated
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
    var unique = {
      [eYo.T3.Stmt.assignment_stmt]: [eYo.T3.Expr.yield_expr, eYo.T3.Expr.assignment_chain, eYo.T3.Expr.identifier_valued],
      [eYo.T3.Stmt.augmented_assignment_stmt]: [eYo.T3.Expr.yield_expr],
      [eYo.T3.Stmt.annotated_assignment_stmt]: [eYo.T3.Expr.yield_expr],
      [eYo.T3.Expr.assignment_chain]: [eYo.T3.Expr.yield_expr, eYo.T3.Expr.assignment_chain, eYo.T3.Expr.identifier_valued],
      [eYo.T3.Expr.identifier_valued]: [eYo.T3.Expr.yield_expr, eYo.T3.Expr.assignment_chain, eYo.T3.Expr.identifier_valued],
      [eYo.T3.Expr.identifier_annotated_valued]: [eYo.T3.Expr.yield_expr, eYo.T3.Expr.assignment_chain, eYo.T3.Expr.identifier_valued],
      [eYo.T3.Expr.assignment_expr]: [eYo.T3.Expr.yield_expr, eYo.T3.Expr.assignment_chain, eYo.T3.Expr.identifier_valued],
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
      [eYo.T3.Expr.assignment_expr]: eYo.T3.Expr.Check.expression
    }
    var me = {
      unique: (type, subtype) => {
        return subtype
        && unique [subtype] || ([
          eYo.T3.Expr.identifier,
          eYo.T3.Expr.identifier_annotated,
          eYo.T3.Expr.augtarget_annotated,
          //eYo.T3.Expr.key_datum,
          //eYo.T3.Expr.identifier_valued,
          //eYo.T3.Expr.assignment_chain,
          //eYo.T3.Expr.assignment_expr,
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
        && check [subtype] || ([
          eYo.T3.Expr.identifier,
          eYo.T3.Expr.identifier_annotated,
          eYo.T3.Expr.augtarget_annotated,
          //eYo.T3.Expr.key_datum,
          //eYo.T3.Expr.identifier_valued,
          //eYo.T3.Expr.assignment_chain,
          //eYo.T3.Expr.assignment_expr,
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
      eYo.T3.Expr.assignment_expr,
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
 * This should be used instead of direct block querying.
 * @return {String} The subtype of the receiver's block.
 */
eYo.DelegateSvg.Expr.assignment_value_list.prototype.getSubtype = function () {
  var t = this.block_.outputConnection.targetBlock()
  return (t && (this.subtype_ = t.type)) || this.subtype_
}

eYo.DelegateSvg.List.makeSubclass('augassigned_list', function () {
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
  eYo.T3.Expr.yield_expr,
  eYo.T3.Expr.target_list,
  eYo.T3.Expr.parenth_target_list,
  eYo.T3.Expr.bracket_target_list,
  eYo.T3.Stmt.assignment_stmt,
  eYo.T3.Expr.value_list,
  eYo.T3.Expr.augassigned_list,
  eYo.T3.Stmt.augmented_assignment_stmt
]
